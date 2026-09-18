(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.VSInvestmentWorkspace = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  const DATA_URL = "data/investment_decision_workspace.json";
  const SCHEMA_VERSION = "1.0.0";
  const CONTRACT_VERSION = "investment_decision_workspace_projection/v1";
  const PORTFOLIO_STORAGE_KEY = "stocklookup.portfolio-research.v1";
  const RELATIVE_VALUATION_LABELS = ["ATTRACTIVE_RELATIVE_RESEARCH", "EXPENSIVE_RELATIVE_RESEARCH"];

  function getProductScopeFormat() {
    if (typeof window !== "undefined" && window.VSProductScopeFormat) return window.VSProductScopeFormat;
    if (typeof require === "function") {
      try { return require("./product-scope-format.js"); } catch (err) { return null; }
    }
    return null;
  }

  function validateWorkspaceContract(workspace) {
    return Boolean(
      workspace &&
      workspace.schema_version === SCHEMA_VERSION &&
      workspace.contract_version === CONTRACT_VERSION &&
      workspace.cards &&
      typeof workspace.cards === "object" &&
      !Array.isArray(workspace.cards) &&
      Object.keys(workspace.cards).length
    );
  }

  // ---------------------------------------------------------------------
  // Pure logic -- no DOM, unit-tested directly by tests/investment-workspace.test.js
  // ---------------------------------------------------------------------

  const FILTER_GROUP_LABELS = {
    stance: "Tư thế nghiên cứu",
    tactical: "Trạng thái kỹ thuật",
    fundamental: "Nền tảng doanh nghiệp",
    valuation: "Định giá",
    liquidity: "Thanh khoản",
    catalyst: "Chất xúc tác",
    freshness: "Độ mới dữ liệu",
  };
  const FILTERS = [
    { id: "initiate", label: "Ứng viên mở vị thế", group: "stance", test: (c) => c.research_stance === "INITIATE_RESEARCH_CANDIDATE" },
    { id: "accumulate", label: "Ứng viên tích lũy", group: "stance", test: (c) => c.research_stance === "ACCUMULATE_RESEARCH_CANDIDATE" },
    { id: "wait", label: "Chờ xác nhận", group: "stance", test: (c) => c.research_stance === "WAIT_FOR_CONFIRMATION" },
    { id: "avoid", label: "Tránh mở vị thế mới", group: "stance", test: (c) => c.research_stance === "AVOID_NEW_ENTRY" },
    { id: "breakout_ready", label: "Sẵn sàng bứt phá", group: "tactical", test: (c) => c.entry_state === "BREAKOUT_READY" },
    { id: "base_building", label: "Đang tạo nền", group: "tactical", test: (c) => c.entry_state === "BASE_BUILDING" },
    { id: "early_reversal", label: "Ứng viên đảo chiều sớm", group: "tactical", test: (c) => c.entry_state === "EARLY_REVERSAL_CANDIDATE" },
    { id: "profitable", label: "Có lợi nhuận", group: "fundamental", test: (c) => (c.fundamental || {}).state === "PROFITABLE" },
    { id: "turnaround", label: "Chuyển biến lợi nhuận", group: "fundamental", test: (c) => (c.fundamental || {}).trajectory === "TURNED_TO_LOSS" || (c.valuation || {}).earnings_state === "TURNAROUND_CONTEXT" },
    { id: "valuation_available", label: "Có dữ liệu định giá", group: "valuation", test: (c) => !!(c.valuation || {}).relative_research_state && (c.valuation || {}).relative_research_state !== "UNAVAILABLE" },
    { id: "attractive", label: "Hấp dẫn tương đối", group: "valuation", test: (c) => (c.valuation || {}).relative_research_state === "ATTRACTIVE_RELATIVE_RESEARCH" },
    { id: "expensive", label: "Đắt tương đối", group: "valuation", test: (c) => (c.valuation || {}).relative_research_state === "EXPENSIVE_RELATIVE_RESEARCH" },
    { id: "liquidity_available", label: "Có dữ liệu thanh khoản nghiên cứu", group: "liquidity", test: (c) => (c.liquidity || {}).readiness === "LIQUIDITY_RESEARCH_PROXY" },
    { id: "catalyst_available", label: "Có chất xúc tác", group: "catalyst", test: (c) => !!(c.catalyst || {}).status && (c.catalyst || {}).status !== "UNAVAILABLE" },
    { id: "stale_evidence", label: "Có bằng chứng đã cũ", group: "freshness", test: (c) => hasStaleAxis(c) },
  ];

  function hasStaleAxis(card) {
    const freshness = ((card || {}).lineage || {}).per_axis_freshness || {};
    return Object.values(freshness).some((v) => v && v !== "CURRENT");
  }

  function matchesFilters(card, activeIds) {
    if (!activeIds || !activeIds.length) return true;
    const byId = {};
    FILTERS.forEach((f) => { byId[f.id] = f; });
    return activeIds.every((id) => byId[id] && byId[id].test(card));
  }

  function matchesSearch(ticker, card, query) {
    if (!query) return true;
    const q = String(query).trim().toUpperCase();
    if (!q) return true;
    return ticker.toUpperCase().includes(q) || String(card.sector || "").toUpperCase().includes(q);
  }

  // No ticker requested -> deterministic default (HPG if present, else the first ticker).
  // Ticker requested and known -> that ticker.
  // Ticker requested but unknown -> null. Never silently substitutes another ticker: the caller
  // is responsible for surfacing an explicit not-found state instead of opening a different card.
  function selectedTickerForDeepLink(tickers, requestedTicker) {
    const normalized = String(requestedTicker || "").trim().toUpperCase();
    if (!normalized) return tickers.includes("HPG") ? "HPG" : (tickers[0] || null);
    if (tickers.includes(normalized)) return normalized;
    return null;
  }

  // Research Stance is the primary product research conclusion; entry_action (Tactical Entry
  // Readiness) is underlying tactical context only. These two governed-vocabulary sets and this
  // deterministic template function make the pairing understandable without ever restating or
  // overriding either raw value (both stay verbatim from the Producer).
  const VETO_RESEARCH_STANCES = new Set(["HIGH_RISK_SPECULATION_ONLY", "AVOID_NEW_ENTRY"]);
  const TACTICAL_ACTIONABLE_ENTRY_READINESS = new Set(["EARLY_ENTRY", "BUY_ON_CONFIRMATION", "ACCUMULATE_IN_BASE"]);

  function stanceEntryGuidance(researchStance, entryAction) {
    if (VETO_RESEARCH_STANCES.has(researchStance)) {
      return "Tư thế nghiên cứu là kết luận nghiên cứu chính của mã này và là điều kiện cấm mở vị thế mới. Mức sẵn sàng kỹ thuật bên dưới chỉ là bối cảnh kỹ thuật — không phải tín hiệu mua.";
    }
    if ((researchStance === "ACCUMULATE_RESEARCH_CANDIDATE" || researchStance === "INITIATE_RESEARCH_CANDIDATE")
        && entryAction && !TACTICAL_ACTIONABLE_ENTRY_READINESS.has(entryAction)) {
      const kind = researchStance === "ACCUMULATE_RESEARCH_CANDIDATE" ? "tích lũy" : "mở vị thế";
      const actionLabel = formatWorkspaceState(entryAction, "entry_action");
      return `Tư thế nghiên cứu là kết luận nghiên cứu chính: ứng viên nghiên cứu ${kind}. Mức sẵn sàng kỹ thuật (${actionLabel}) chỉ phản ánh trạng thái xác nhận kỹ thuật hiện tại, không phải quyền được mở vị thế.`;
    }
    return "";
  }

  // Client-side portfolio-fit join -- mirrors investment_decision_workspace_projection.py's
  // _portfolio_view() exactly (ticker lookup, breach match, sector-concentration lookup). No
  // covariance/volatility/correlation is computed here; every number it displays was already
  // computed by the Producer and simply re-labelled per candidate ticker.
  function joinPortfolioResearch(ticker, sector, portfolioResearch) {
    if (!portfolioResearch || !portfolioResearch.portfolio_id) {
      return { evaluated: false, status: "NOT_EVALUATED", reason: "NO_PORTFOLIO_RESEARCH_CONTEXT_SUPPLIED" };
    }
    const positions = {};
    (portfolioResearch.normalized_positions || []).forEach((p) => { if (p && p.ticker) positions[p.ticker] = p; });
    const holding = positions[ticker];
    const breaches = (portfolioResearch.user_limit_breaches || []).filter(
      (b) => b && (b.ticker === ticker || b.sector === sector)
    );
    const sectorConcentration = portfolioResearch.sector_concentration || {};
    const sectorWeight = sectorConcentration[sector];
    const addsSectorConcentration = !holding && typeof sectorWeight === "number" && sectorWeight > 0;
    let status;
    if (breaches.length) status = "EXCEEDS_USER_POLICY_LIMIT";
    else if (holding) status = "ALREADY_HELD";
    else if (addsSectorConcentration) status = "ADDS_SECTOR_CONCENTRATION";
    else status = "NO_CONCENTRATION_FLAGGED";
    return {
      evaluated: true, status,
      portfolio_id: portfolioResearch.portfolio_id, as_of_session: portfolioResearch.as_of_session,
      holding_status: holding ? "HELD" : "NOT_HELD", weight: holding ? holding.weight : null,
      sector: (holding && holding.sector) || sector, existing_sector_concentration_weight: sectorWeight,
      sector_concentration: sectorConcentration, tactical_concentration: portfolioResearch.tactical_concentration || {},
      selected_joint_risk_horizon: portfolioResearch.selected_joint_risk_horizon,
      joint_risk_status: portfolioResearch.joint_risk_status,
      pairwise_correlation_status: portfolioResearch.pairwise_correlation_status,
      user_limit_breaches: breaches,
      liquidity_research_context: holding ? holding.liquidity_research_context : null,
      exact_execution_capacity_status: holding ? holding.exact_execution_capacity_status : null,
      volatility: holding ? holding.volatility : null, cash_weight: portfolioResearch.cash_weight,
      warnings: portfolioResearch.warnings || [],
    };
  }

  function readLocalPortfolioHoldings(storage) {
    try {
      const store = storage || (typeof localStorage !== "undefined" ? localStorage : null);
      if (!store) return null;
      const raw = store.getItem(PORTFOLIO_STORAGE_KEY);
      if (!raw) return null;
      const model = JSON.parse(raw);
      if (!model || !Array.isArray(model.positions)) return null;
      return model;
    } catch (err) {
      return null;
    }
  }

  function localHoldingFor(ticker, model) {
    if (!model || !Array.isArray(model.positions)) return null;
    return model.positions.find((p) => p && String(p.ticker || "").toUpperCase() === ticker.toUpperCase()) || null;
  }

  // Bounded, client-side T0 capture (section 11): a small versioned candidate export the Producer
  // can later validate through durable_prospective_research_case_store.py's own persist_case()
  // contract. This is NOT a retained prospective case -- no DB write, no authority claimed here.
  function buildT0Export(ticker, card, sourceArtifactIdentity) {
    return {
      schema_version: "t0_candidate_export/v1",
      ticker, as_of_session: card.as_of_session, research_stance: card.research_stance,
      research_stance_readiness: card.research_stance_readiness, entry_state: card.entry_state,
      entry_action: card.entry_action, setup_tags: card.setup_tags || [],
      confirmation: card.confirmation, technical_invalidation: (card.invalidation || {}).technical,
      fundamental_invalidation: (card.invalidation || {}).fundamental,
      source_workspace_artifact_identity: sourceArtifactIdentity || null,
      exported_at: new Date().toISOString(),
      note: "Not yet a retained prospective case. Must be validated through the Producer's durable_prospective_research_case_store contract before retention. No production/runtime database write occurred.",
      authority_boundary: { is_actionable: false, retained_case_authority: "NOT_ESTABLISHED_BY_THIS_EXPORT" },
    };
  }

  // Phân tích (analysis) view row shaping -- pure, no DOM. Mirrors the retired
  // assets/js/analysis-product.js record() shape. Support/counter fields are genuine Producer
  // evidence (why.deterministic_reasons / counter_thesis.key_counter_thesis) passed through
  // verbatim -- never a client-synthesized combined-conflict category.
  function analysisRecord(card) {
    return {
      ticker: card.ticker, sector: card.sector || "UNKNOWN", stance: card.research_stance || "UNAVAILABLE",
      tactical: card.entry_state || (card.tactical || {}).primary_entry_state || "UNAVAILABLE",
      fundamental: (card.fundamental || {}).state || "UNAVAILABLE",
      valuation: (card.valuation || {}).relative_research_state || "UNAVAILABLE",
      support: (card.why || {}).deterministic_reasons || [],
      counter: (card.counter_thesis || {}).key_counter_thesis || [],
    };
  }
  function analysisRows(workspace) {
    const cards = (workspace || {}).cards || {};
    return Object.keys(cards).sort().map((t) => analysisRecord(cards[t]));
  }
  function analysisEvidenceHtml(rec) {
    const support = (rec.support || []).slice(0, 1).map((r) => formatWorkspaceState(r, "rule_condition"));
    const counter = (rec.counter || []).slice(0, 1).map((r) => formatWorkspaceState(r, "rule_condition"));
    if (!support.length && !counter.length) return '<span class="cockpit-note">Chưa có bằng chứng được ghi nhận</span>';
    return [
      support.length ? `<div>${escHtml(support.join(", "))}</div>` : "",
      counter.length ? `<div class="cockpit-note">Phản luận: ${escHtml(counter.join(", "))}</div>` : "",
    ].join("");
  }
  function analysisRowHtml(rec) {
    return `<tr data-ticker="${escHtml(rec.ticker)}" style="cursor: pointer;"><td class="sticky-col"><button type="button" class="btn btn-link p-0 ws-ticker-link fw-bold font-monospace text-start" data-select-ticker="${escHtml(rec.ticker)}">${escHtml(rec.ticker)}</button><div class="cockpit-note">${sectorDisplayHtml(rec.sector)}</div></td><td>${pill(rec.stance, "research_stance")}</td><td>${pill(rec.fundamental, "fundamental_state")}</td><td>${pill(rec.valuation, "valuation_state")}</td><td>${pill(rec.tactical, "tactical_state")}</td><td>${analysisEvidenceHtml(rec)}</td></tr>`;
  }
  function analysisKpi(label, value) {
    return `<div class="cockpit-kpi"><div class="label">${escHtml(label)}</div><div class="value">${escHtml(value)}</div></div>`;
  }

  function getValueFormat() {
    if (typeof window !== "undefined" && window.VSValueFormat) return window.VSValueFormat;
    if (typeof require === "function") {
      try { return require("./value-format.js"); } catch (err) { return null; }
    }
    return null;
  }
  function formatWorkspaceState(value, domain) {
    const vf = getValueFormat();
    if (domain === "rule_condition" && vf && typeof vf.formatKnownLabel === "function") {
      return vf.formatKnownLabel(value, domain);
    }
    if (vf && typeof vf.formatDomainState === "function") return vf.formatDomainState(value, domain).label;
    return unavailableLabel(value);
  }
  function sectorDisplayHtml(value) {
    const vf = getValueFormat();
    if (vf && typeof vf.sectorLineageHtml === "function") return vf.sectorLineageHtml(value);
    return escHtml(value);
  }
  function sectorDisplayLabel(value) {
    const vf = getValueFormat();
    if (vf && typeof vf.formatSectorLineage === "function") return vf.formatSectorLineage(value).label;
    return String(value || "Chưa phân loại ngành");
  }
  function axisDisplayLabel(axis) {
    const vf = getValueFormat();
    if (vf && typeof vf.formatAxisLabel === "function") return vf.formatAxisLabel(axis) || axis;
    return axis;
  }
  function detailsHtml(payload, summary) {
    const vf = getValueFormat();
    if (vf && typeof vf.technicalDetailsHtml === "function") return vf.technicalDetailsHtml(payload, summary);
    return `<details class="vs-tech-details"><summary>${escHtml(summary || "Chi tiết kỹ thuật")}</summary><pre class="cockpit-code">${escHtml(JSON.stringify(payload ?? {}, null, 2))}</pre></details>`;
  }
  function provenanceBlock(identity) {
    const vf = getValueFormat();
    if (vf && typeof vf.provenanceHtml === "function") return vf.provenanceHtml(identity);
    return identity ? detailsHtml(identity, "Chi tiết dữ liệu") : "";
  }
  function conditionHeadline(obj) {
    if (!obj || typeof obj !== "object") {
      return { raw: "", label: formatWorkspaceState("", "rule_condition") };
    }
    const candidates = [obj.boundary_type, obj.trigger_type, obj.comparison_operator];
    const vf = getValueFormat();
    for (let i = 0; i < candidates.length; i++) {
      const raw = candidates[i];
      if (!raw) continue;
      if (vf && typeof vf.formatDomainState === "function") {
        const formatted = vf.formatDomainState(raw, "rule_condition");
        if (formatted.known) return formatted;
      }
    }
    return {
      raw: obj.boundary_type || obj.trigger_type || obj.comparison_operator || "",
      label: formatWorkspaceState(obj.boundary_type || obj.trigger_type || "", "rule_condition"),
    };
  }
  function conditionVisibleHtml(obj) {
    if (!obj || typeof obj !== "object" || !Object.keys(obj).length) {
      return '<span class="cockpit-note">Chưa có dữ liệu / không có mục được giữ lại</span>';
    }
    const headline = conditionHeadline(obj);
    const operator = obj.comparison_operator ? formatWorkspaceState(obj.comparison_operator, "rule_condition") : "";
    const direction = obj.direction ? formatWorkspaceState(obj.direction, "rule_condition") : "";
    const extra = [];
    if (operator && operator !== headline.label) extra.push(operator);
    if (direction && direction !== headline.label && direction !== operator) extra.push(direction);
    return `<div class="cockpit-condition" data-condition="${escHtml(headline.raw)}" title="${escHtml(headline.raw)}"><div>${escHtml(headline.label)}</div>${
      extra.map((line) => `<div class="cockpit-note">${escHtml(line)}</div>`).join("")
    }</div>${detailsHtml(obj, "Chi tiết kỹ thuật")}`;
  }
  function marketContextHtml(ctx) {
    if (!ctx || typeof ctx !== "object" || !Object.keys(ctx).length) {
      return '<span class="cockpit-note">Chưa có dữ liệu</span>';
    }
    const fieldLabels = {
      leadership_state: "Dẫn dắt ngành",
      market_relative_momentum_bucket: "Động lượng so với thị trường",
      sector_relative_momentum_bucket: "Động lượng so với ngành",
    };
    const lines = Object.entries(ctx).map(([key, value]) => {
      const field = fieldLabels[key] || key;
      const label = formatWorkspaceState(value, "data_fitness");
      return `<div class="cockpit-note">${escHtml(field)}: <span data-state="${escHtml(value)}" title="${escHtml(value)}">${escHtml(label)}</span></div>`;
    });
    return `${lines.join("")}${detailsHtml(ctx, "Chi tiết dữ liệu")}`;
  }
  function escHtml(v) {
    return String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }
  // CSS.escape is a browser global, absent in this project's Node test harness (and in older
  // browsers) -- selector construction must not crash or fall back to unescaped interpolation
  // just because that global is missing. The fallback backslash-escapes every character outside
  // [a-zA-Z0-9_-] the same way CSS.escape does for attribute-selector-safe values like tickers.
  function cssEscapeSelector(v) {
    const s = String(v ?? "");
    if (typeof CSS !== "undefined" && CSS && typeof CSS.escape === "function") return CSS.escape(s);
    return s.replace(/[^a-zA-Z0-9_-]/g, (c) => `\\${c}`);
  }
  function unavailableLabel(v) {
    return (v === null || v === undefined || v === "" ? "UNAVAILABLE" : v);
  }
  // Domain-aware tone contract (value-format.js DOMAIN_SPECIFIC_TONES / getSemanticTone) is the
  // single source of truth for pill color -- a raw keyword bucket here would re-introduce the
  // cross-domain collisions it was built to fix (e.g. TRIGGERED reading adverse in every domain,
  // when it is constructive for confirmation_state and adverse for invalidation_state).
  function pill(v, domain) {
    const raw = unavailableLabel(v);
    const label = domain ? formatWorkspaceState(raw, domain) : raw;
    const vf = getValueFormat();
    const tone = (vf && typeof vf.getSemanticTone === "function") ? vf.getSemanticTone(raw, domain) : "neutral";
    return `<span class="cockpit-state tone-${tone}" data-state="${escHtml(raw)}" data-tone="${tone}" title="${escHtml(raw)}">${escHtml(label)}</span>`;
  }
  function listHtml(values, domain) {
    return (Array.isArray(values) && values.length
      ? `<ul class="cockpit-list">${values.map((x) => {
          if (typeof x === "string") {
            if (!domain) return `<li>${escHtml(x)}</li>`;
            return `<li><span data-state="${escHtml(x)}" title="${escHtml(x)}">${escHtml(formatWorkspaceState(x, domain))}</span></li>`;
          }
          const raw = (x && (x.value || x.metric_or_state || x.source_dimension)) || "";
          const label = raw ? formatWorkspaceState(String(raw), domain || "rule_condition") : formatWorkspaceState("", "rule_condition");
          return `<li><span data-state="${escHtml(raw)}" title="${escHtml(raw)}">${escHtml(label)}</span>${detailsHtml(x, "Chi tiết kỹ thuật")}</li>`;
        }).join("")}</ul>`
      : '<span class="cockpit-note">Chưa có dữ liệu / không có mục được giữ lại</span>');
  }
  function kpiHtml(label, value, domain) {
    const inner = typeof value === "string" && value.indexOf("<span") === 0
      ? value
      : (typeof value === "string" ? pill(value, domain) : escHtml(unavailableLabel(value)));
    return `<div class="cockpit-kpi"><div class="label">${escHtml(label)}</div><div class="value">${inner}</div></div>`;
  }
  function supportingMethodsHtml(methods) {
    if (!methods || !methods.length) return '<span class="cockpit-note">Chưa có phương pháp định giá tương đối sẵn sàng hỗ trợ nhãn này.</span>';
    return `<table class="cockpit-table"><thead><tr><th>Phương pháp</th><th>Phân vị</th><th>Số đối sánh</th><th>Phần bù/chiết khấu so với trung vị nhóm</th></tr></thead><tbody>${
      methods.map((m) => `<tr><td>${escHtml(m.method)}</td><td>${escHtml(m.percentile)}</td><td>${escHtml(m.peer_count)}</td><td>${escHtml(m.premium_or_discount_to_peer_median)}</td></tr>`).join("")
    }</tbody></table>`;
  }

  // Diagnostic values are display-only Producer truth.  The helpers below intentionally do
  // not derive a valuation, peer cohort, trigger, or any authority: they only shape retained
  // additive fields for an owner-readable card.
  function hasRetainedValue(value) {
    if (typeof value === "number") return Number.isFinite(value);
    if (typeof value === "string") return value.trim() !== "";
    return false;
  }
  function formatDiagnosticNumber(value) {
    if (typeof value === "number" && Number.isFinite(value)) {
      return new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 4 }).format(value);
    }
    return String(value);
  }
  function diagnosticPill(raw, label, tone) {
    const vf = getValueFormat();
    const effectiveTone = tone || (vf && typeof vf.getSemanticTone === "function" ? vf.getSemanticTone(raw, "availability_state") : "neutral");
    return `<span class="cockpit-state tone-${escHtml(effectiveTone)}" data-state="${escHtml(raw)}" data-tone="${escHtml(effectiveTone)}" title="${escHtml(raw)}">${escHtml(label)}</span>`;
  }
  function diagnosticReasonLabel(raw) {
    const vf = getValueFormat();
    if (vf && typeof vf.formatDiagnosticReason === "function") return vf.formatDiagnosticReason(raw);
    return formatWorkspaceState(raw, "diagnostic_reason");
  }
  function diagnosticReasonHtml(raw) {
    return `<span data-state="${escHtml(raw)}" title="${escHtml(raw)}">${escHtml(diagnosticReasonLabel(raw))}</span>`;
  }
  function diagnosticValueHtml(method) {
    if (hasRetainedValue(method && method.value)) {
      return `<strong class="ws-diagnostic-value" data-retained-value="true">${escHtml(formatDiagnosticNumber(method.value))}</strong>`;
    }
    const state = (method || {}).earnings_state || ((method || {}).status === "PE_NOT_MEANINGFUL" ? "PE_NOT_MEANINGFUL" : "");
    if (state) {
      return `<span class="ws-diagnostic-value" data-state="${escHtml(state)}" title="${escHtml(state)}">${escHtml(formatWorkspaceState(state, state === "PE_NOT_MEANINGFUL" ? "valuation_state" : "earnings_state"))}</span>`;
    }
    return '<span class="cockpit-note ws-diagnostic-value">Chưa có dữ liệu</span>';
  }
  function valuationAvailabilityHtml(method) {
    const availability = (method || {}).availability_state || "NOT_AVAILABLE";
    const blockers = (method || {}).blocker_reason_codes || [];
    const isBlockedWithoutValue = availability === "NOT_AVAILABLE" && !hasRetainedValue((method || {}).value)
      && (blockers.length || ["INPUT_BLOCKED", "BLOCKED", "NOT_APPLICABLE"].includes((method || {}).status));
    if (isBlockedWithoutValue) return diagnosticPill(availability, "Bị chặn", "adverse");
    if (availability === "AVAILABLE_QUALIFIED") return diagnosticPill(availability, formatWorkspaceState(availability, "availability_state"), "constructive");
    if (availability === "AVAILABLE_REFERENCE_ONLY") return diagnosticPill(availability, formatWorkspaceState(availability, "availability_state"), "watch");
    return diagnosticPill(availability, formatWorkspaceState(availability, "availability_state"), "neutral");
  }
  function diagnosticText(value, domain) {
    if (value === null || value === undefined || value === "") return "";
    const formatted = formatWorkspaceState(value, domain || "data_fitness");
    return `<span data-state="${escHtml(value)}" title="${escHtml(value)}">${escHtml(formatted)}</span>`;
  }
  function valuationPeerContextHtml(peer) {
    if (!peer || typeof peer !== "object" || !Object.keys(peer).length) return "";
    const status = peer.status;
    const details = [];
    if (peer.peer_count != null) details.push(`Số đối sánh: ${formatDiagnosticNumber(peer.peer_count)}`);
    if (hasRetainedValue(peer.peer_median)) details.push(`Trung vị nhóm: ${formatDiagnosticNumber(peer.peer_median)}`);
    if (hasRetainedValue(peer.premium_or_discount_to_peer_median)) details.push(`Chênh lệch so với trung vị: ${formatDiagnosticNumber(peer.premium_or_discount_to_peer_median)}`);
    return `<div class="cockpit-note ws-diagnostic-context">Bối cảnh đối sánh: ${status ? diagnosticReasonHtml(status) : "Chưa có dữ liệu"}${details.length ? `<br>${escHtml(details.join(" · "))}` : ""}</div>`;
  }
  function valuationMethodHtml(methodId, method) {
    const detail = method || {};
    const blockers = Array.isArray(detail.blocker_reason_codes) ? detail.blocker_reason_codes : [];
    const context = [];
    if (detail.period_basis) context.push(`Kỳ: ${formatWorkspaceState(detail.period_basis, "data_fitness")}`);
    if (detail.share_basis) context.push(`Cơ sở: ${formatWorkspaceState(detail.share_basis, "data_fitness")}`);
    return `<article class="ws-valuation-method" data-method="${escHtml(methodId)}">
      <div class="ws-valuation-method-head"><strong>${escHtml(methodId)}</strong>${valuationAvailabilityHtml(detail)}</div>
      <div class="ws-valuation-method-value">${diagnosticValueHtml(detail)}</div>
      ${valuationPeerContextHtml(detail.peer_relative)}
      ${context.length ? `<div class="cockpit-note ws-diagnostic-context">${escHtml(context.join(" · "))}</div>` : ""}
      ${blockers.length ? `<div class="cockpit-note ws-diagnostic-blocker">Thiếu/giới hạn: ${blockers.slice(0, 2).map(diagnosticReasonHtml).join(" · ")}${blockers.length > 2 ? " · …" : ""}</div>` : ""}
      ${detailsHtml(detail, "Chi tiết kỹ thuật phương pháp")}
    </article>`;
  }
  function valuationSummaryHtml(valuation) {
    const val = valuation || {};
    const summary = val.valuation_summary;
    if (summary && typeof summary === "object") {
      const available = Number(summary.available_method_count) || 0;
      const qualified = Number(summary.qualified_relative_method_count) || 0;
      const displayState = summary.valuation_display_state || "";
      let copy;
      if (available > 0) {
        copy = `${available} phương pháp định giá có dữ liệu nghiên cứu.`;
        copy += qualified > 0
          ? ` ${qualified} phương pháp đủ điều kiện cho bối cảnh định giá tương đối.`
          : " Chưa có phương pháp đủ điều kiện tạo kết luận định giá tương đối.";
      } else {
        copy = "Chưa có phương pháp định giá có dữ liệu nghiên cứu.";
      }
      return `<div class="ws-valuation-summary"${displayState ? ` data-state="${escHtml(displayState)}" title="${escHtml(displayState)}"` : ""}>${escHtml(copy)}</div>${detailsHtml(summary, "Chi tiết kỹ thuật định giá")}`;
    }
    // Older artifacts have only a count, not a retained method/value map.  Preserve that
    // limited fact without calling the methods intrinsic or inventing their identities.
    const legacyCount = Number(val.usable_relative_method_count) || 0;
    if (legacyCount > 0) {
      return `<div class="ws-valuation-summary">${escHtml(`${legacyCount} phương pháp định giá có dữ liệu nghiên cứu.`)}<div class="cockpit-note">Chi tiết từng phương pháp chưa được giữ lại trong artifact này.</div></div>`;
    }
    return '<div class="ws-valuation-summary">Chưa có phương pháp định giá có dữ liệu nghiên cứu.</div>';
  }
  function valuationDiagnosticsHtml(valuation) {
    const val = valuation || {};
    const diagnostics = val.method_diagnostics && typeof val.method_diagnostics === "object" ? val.method_diagnostics : {};
    const methods = Object.entries(diagnostics);
    return `${valuationSummaryHtml(val)}${methods.length
      ? `<div class="ws-valuation-methods" aria-label="Chi tiết phương pháp định giá">${methods.map(([id, method]) => valuationMethodHtml(id, method)).join("")}</div>`
      : (val.supporting_methods && val.supporting_methods.length ? supportingMethodsHtml(val.supporting_methods) : "")}`;
  }
  function fundamentalDiagnosticsHtml(fundamental) {
    const data = fundamental || {};
    const warnings = Array.isArray(data.warnings_blockers) ? data.warnings_blockers : [];
    const state = data.state;
    const fitness = data.research_fitness || data.readiness;
    return `<div class="ws-axis-diagnostic">
      <div><b>Nền tảng doanh nghiệp</b> ${pill(state, "fundamental_state")}</div>
      ${data.trajectory ? `<div class="cockpit-note">Xu hướng lợi nhuận: ${diagnosticText(data.trajectory, "fundamental_trajectory")}</div>` : ""}
      ${fitness ? `<div class="cockpit-note">Chất lượng dữ liệu: ${pill(fitness, "data_fitness")}</div>` : ""}
      ${data.freshness_status ? `<div class="cockpit-note">Độ mới: ${pill(data.freshness_status, "freshness")}</div>` : ""}
      ${warnings.length ? `<div class="ws-diagnostic-blocker">Thiếu/giới hạn:<ul class="cockpit-list">${warnings.slice(0, 3).map((reason) => `<li>${diagnosticReasonHtml(reason)}</li>`).join("")}</ul></div>` : ""}
      ${(data.financial_health || data.current_features || data.peer_relative) ? detailsHtml({ financial_health: data.financial_health, current_features: data.current_features, peer_relative: data.peer_relative, warnings_blockers: warnings }, "Chi tiết kỹ thuật nền tảng") : ""}
    </div>`;
  }
  function retainedItemLabel(item) {
    if (typeof item === "string") {
      const looksLikeEnum = /^[A-Z][A-Z0-9_]+$/.test(item);
      return looksLikeEnum ? diagnosticReasonLabel(item) : item;
    }
    if (!item || typeof item !== "object") return "Chưa có dữ liệu";
    const candidate = item.label || item.title || item.headline || item.summary || item.event_type || item.classification || item.status || item.reason;
    if (candidate === undefined || candidate === null || candidate === "") return "Có dữ liệu được giữ lại";
    return typeof candidate === "string" && /^[A-Z][A-Z0-9_]+$/.test(candidate) ? diagnosticReasonLabel(candidate) : String(candidate);
  }
  function retainedItemsHtml(label, items) {
    if (!Array.isArray(items) || !items.length) return "";
    return `<div class="mt-2"><b>${escHtml(label)}</b><ul class="cockpit-list">${items.slice(0, 3).map((item) => `<li>${escHtml(retainedItemLabel(item))}${typeof item === "object" && item ? detailsHtml(item, "Chi tiết kỹ thuật") : ""}</li>`).join("")}</ul></div>`;
  }
  function catalystDiagnosticsHtml(catalyst) {
    const data = catalyst || {};
    const retained = ["qualified_current_catalysts", "pending_watch_items", "adverse_events", "event_classifications"].some((key) => Array.isArray(data[key]) && data[key].length);
    return `<div class="ws-axis-diagnostic"><b>Chất xúc tác</b> ${pill(data.status, "evidence_state")}
      ${!retained && data.status === "UNAVAILABLE" ? '<div class="cockpit-note">Chưa có dữ liệu chất xúc tác được giữ lại.</div>' : ""}
      ${retainedItemsHtml("Đã ghi nhận", data.qualified_current_catalysts)}
      ${retainedItemsHtml("Nội dung đang theo dõi", data.pending_watch_items)}
      ${retainedItemsHtml("Bối cảnh bất lợi", data.adverse_events)}
      ${retainedItemsHtml("Phân loại sự kiện", data.event_classifications)}
      ${data.freshness_status ? `<div class="cockpit-note">Độ mới: ${pill(data.freshness_status, "freshness")}</div>` : ""}</div>`;
  }
  function liquidityDiagnosticsHtml(liquidity) {
    const data = liquidity || {};
    return `<div class="ws-axis-diagnostic"><b>Thanh khoản nghiên cứu</b> ${pill(data.readiness, "liquidity_state")}
      ${hasRetainedValue(data.current_session_volume) ? `<div class="mt-2"><b>Khối lượng phiên hiện tại</b>: <span data-retained-value="true">${escHtml(formatDiagnosticNumber(data.current_session_volume))}</span></div>` : ""}
      ${data.descriptive_research_state ? `<div class="cockpit-note">Bối cảnh phiên: ${diagnosticText(data.descriptive_research_state, "liquidity_state")}</div>` : ""}
      <div class="mt-2"><b>Năng lực thực hiện lệnh chính xác</b> ${pill(data.exact_execution_capacity_status, "liquidity_state")}</div>
      <div class="cockpit-note">Thanh khoản nghiên cứu không xác lập quy mô lệnh thực hiện.</div>
      ${data.authority_boundary ? detailsHtml(data.authority_boundary, "Chi tiết thẩm quyền thanh khoản") : ""}</div>`;
  }
  function sectorDiagnosticHtml(market) {
    const data = market || {};
    const diagnostic = data.sector_diagnostic || {};
    const context = data.sector_relative_context || {};
    const rows = [];
    if (diagnostic.breadth_support_state) rows.push(`<div class="cockpit-note">Hỗ trợ độ rộng: ${diagnosticText(diagnostic.breadth_support_state, "data_fitness")}</div>`);
    [
      ["Động lượng so với thị trường", diagnostic.market_relative_momentum],
      ["Động lượng so với ngành", diagnostic.sector_relative_momentum],
    ].forEach(([label, metric]) => {
      if (!metric || typeof metric !== "object") return;
      const parts = [];
      if (metric.status) parts.push(diagnosticReasonHtml(metric.status));
      if (hasRetainedValue(metric.momentum_percentile_descriptive)) parts.push(`Phân vị: ${formatDiagnosticNumber(metric.momentum_percentile_descriptive)}`);
      if (hasRetainedValue(metric.peer_median_momentum_20d)) parts.push(`Trung vị: ${formatDiagnosticNumber(metric.peer_median_momentum_20d)}`);
      if (parts.length) rows.push(`<div class="cockpit-note">${escHtml(label)}: ${parts.join(" · ")}</div>`);
    });
    return `${marketContextHtml(context)}${rows.join("")}${Object.keys(diagnostic).length ? detailsHtml(diagnostic, "Chi tiết kỹ thuật thị trường/ngành") : ""}`;
  }
  function booleanDiagnosticHtml(value, yes, no, key) {
    const raw = value === true ? "true" : "false";
    return `<span data-state="${raw}" data-diagnostic="${escHtml(key)}" title="${raw}">${escHtml(value ? yes : no)}</span>`;
  }
  function referenceTriggerHtml(referenceTrigger) {
    const trigger = referenceTrigger || {};
    if (!trigger.trigger_level_exists || !hasRetainedValue(trigger.trigger_level)) {
      return '<div class="cockpit-note">Chưa có mức kích hoạt tham chiếu được giữ lại.</div>';
    }
    return `<div class="ws-reference-trigger" data-trigger-state="${escHtml(trigger.trigger_state || trigger.status || "")}">
      <div><b>Mức kích hoạt tham chiếu</b>: <strong data-retained-value="true">${escHtml(formatDiagnosticNumber(trigger.trigger_level))}</strong></div>
      <div class="cockpit-note">Điều kiện kích hoạt: ${booleanDiagnosticHtml(trigger.trigger_condition_attached, "Đã gắn", "Chưa gắn", "trigger_condition_attached")}</div>
      <div class="cockpit-note">Trạng thái: ${booleanDiagnosticHtml(trigger.trigger_condition_satisfied, "Đã kích hoạt", "Chưa kích hoạt", "trigger_condition_satisfied")}</div>
      <div class="cockpit-note">Quyền mở vị thế: ${booleanDiagnosticHtml(trigger.entry_authority, "Đã được xác lập", "Chưa được xác lập", "entry_authority")}</div>
      <div class="cockpit-note">Mức tham chiếu không tự xác lập quyền mở vị thế.</div>
      ${detailsHtml(trigger, "Chi tiết kỹ thuật mức kích hoạt")}
    </div>`;
  }

  function retainedPrice(card) {
    const candidates = [card && card.current_price, (card || {}).price, ((card || {}).tactical || {}).current_price];
    return candidates.find(hasRetainedValue);
  }
  function compactReasons(card, limit) {
    const reasons = (((card || {}).why || {}).deterministic_reasons || []).slice(0, limit || 3);
    return reasons.length ? reasons.map((reason) => formatWorkspaceState(reason, "rule_condition")) : ["Chưa có lý do ngắn được giữ lại"];
  }
  const MICRO_EXPLANATIONS = {
    "Pha kỹ thuật": "Mô tả bối cảnh giá theo dữ liệu được giữ lại. Đây là bằng chứng nghiên cứu, không phải lệnh mua hoặc bán.",
    "Mức sẵn sàng kỹ thuật": "Cho biết trạng thái thiết lập kỹ thuật hiện có; trạng thái này tách biệt với tư thế nghiên cứu và xác nhận thực tế.",
    "Dấu hiệu": "Các đặc điểm kỹ thuật được Producer giữ lại để hỗ trợ diễn giải, không tạo thẩm quyền giao dịch độc lập.",
    "Khối lượng phiên": "Khối lượng của phiên được giữ lại; không tự xác lập năng lực thực hiện lệnh hoặc thanh khoản đầy đủ.",
    "Định giá": "Định giá tương đối cần được đọc cùng kỳ dữ liệu, nhóm so sánh và các giới hạn được công bố.",
    "Nền tảng": "Tóm tắt trạng thái nền tảng doanh nghiệp theo dữ liệu nghiên cứu được giữ lại.",
    "Mức độ tin cậy của bằng chứng": "Mô tả độ mới và mức đầy đủ của dữ liệu, không phải xác suất giá sẽ tăng hay một điểm dự báo.",
  };
  function helpLabelHtml(label) {
    const explanation = MICRO_EXPLANATIONS[label];
    if (!explanation) return escHtml(label);
    return `<span class="ws-help" tabindex="0" data-help="${escHtml(explanation)}" aria-label="${escHtml(label)}. ${escHtml(explanation)}">${escHtml(label)}</span>`;
  }
  function evidenceQuality(card, axis) {
    const lineage = (card && card.lineage) || {};
    const freshness = (lineage.per_axis_freshness || {})[axis];
    const val = (card && card.valuation) || {};
    const fundamental = (card && card.fundamental) || {};
    if (axis === "valuation") {
      if (!val.relative_research_state || val.relative_research_state === "UNAVAILABLE") return { label: "Chưa đủ dữ liệu", tone: "neutral", why: "Chưa có dữ liệu định giá tương đối được giữ lại." };
      if (Number(val.qualified_relative_method_count || 0) > 0) return { label: "Khá", tone: "constructive", why: "Có phương pháp định giá tương đối đủ điều kiện nghiên cứu." };
      return { label: "Hạn chế", tone: "caution", why: "Dữ liệu định giá chỉ dùng làm tham khảo hoặc chưa đủ điều kiện đối sánh." };
    }
    if (axis === "fundamental") {
      if (!fundamental.state || fundamental.state === "UNAVAILABLE") return { label: "Chưa đủ dữ liệu", tone: "neutral", why: "Chưa có nền tảng doanh nghiệp đủ để diễn giải." };
      if (freshness === "CURRENT") return { label: "Hiện hành", tone: "constructive", why: "Nền tảng doanh nghiệp có dữ liệu cùng phiên Workspace." };
      return { label: "Hạn chế", tone: "caution", why: "Nền tảng doanh nghiệp không thuộc phiên hiện tại hoặc có giới hạn được giữ lại." };
    }
    if (!card || !card.entry_state) return { label: "Chưa đủ dữ liệu", tone: "neutral", why: "Chưa có trạng thái kỹ thuật được giữ lại." };
    if (freshness === "CURRENT") return { label: "Hiện hành", tone: "constructive", why: "Trạng thái kỹ thuật được giữ lại cho phiên Workspace hiện tại." };
    return { label: "Hạn chế", tone: "caution", why: "Trạng thái kỹ thuật không thuộc phiên hiện tại hoặc có giới hạn độ mới." };
  }
  function evidenceQualityHtml(quality) {
    return `<span class="ws-evidence-quality tone-${escHtml(quality.tone)}" tabindex="0" data-help="${escHtml(quality.why)}" aria-label="Mức độ tin cậy của bằng chứng: ${escHtml(quality.label)}. ${escHtml(quality.why)}">${escHtml(quality.label)}</span>`;
  }
  function valuationEvidenceSummaryHtml(val) {
    const methods = (val && val.supporting_methods) || [];
    const method = methods.find((item) => item && hasRetainedValue(item.value));
    const summary = (val && val.valuation_summary) || {};
    const count = Number(summary.available_method_count || (val && val.usable_relative_method_count)) || 0;
    const value = method ? `${method.method}: ${formatDiagnosticNumber(method.value)}×` : (count ? `${count} phương pháp có dữ liệu` : "Chưa có chỉ số được giữ lại");
    return `<div class="ws-evidence-summary-item"><div>${helpLabelHtml("Định giá")}${evidenceQualityHtml(evidenceQuality({ valuation: val }, "valuation"))}</div><strong>${escHtml(value)}</strong><p>${escHtml(formatWorkspaceState((val || {}).relative_research_state, "valuation_state"))}</p></div>`;
  }
  function evidenceSummaryHtml(card) {
    const fundamental = (card && card.fundamental) || {};
    const technical = evidenceQuality(card, "tactical");
    const foundation = evidenceQuality(card, "fundamental");
    return `<section class="ws-evidence-summary" aria-label="Tóm tắt bằng chứng">
      <div class="ws-evidence-summary-item"><div>${helpLabelHtml("Nền tảng")}${evidenceQualityHtml(foundation)}</div><strong>${escHtml(formatWorkspaceState(fundamental.state, "fundamental_state"))}</strong><p>${escHtml(formatWorkspaceState(fundamental.trajectory, "fundamental_trajectory"))}</p></div>
      ${valuationEvidenceSummaryHtml((card || {}).valuation || {})}
      <div class="ws-evidence-summary-item"><div>${helpLabelHtml("Mức độ tin cậy của bằng chứng")}${evidenceQualityHtml(technical)}</div><strong>${escHtml(formatWorkspaceState((card || {}).entry_state, "tactical_state"))}</strong><p>${escHtml(technical.why)}</p></div>
    </section>`;
  }
  function technicalSnapshotHtml(card) {
    const tactical = (card || {}).tactical || {};
    const liquidity = (card || {}).liquidity || {};
    const rows = [];
    if (tactical.primary_entry_state || card.entry_state) rows.push(["Pha kỹ thuật", formatWorkspaceState(tactical.primary_entry_state || card.entry_state, "tactical_state")]);
    if (card.entry_action) rows.push(["Mức sẵn sàng kỹ thuật", formatWorkspaceState(card.entry_action, "entry_action")]);
    if (Array.isArray(card.setup_tags) && card.setup_tags.length) rows.push(["Dấu hiệu", card.setup_tags.slice(0, 2).map((item) => formatWorkspaceState(item, "setup_tag")).join(" · ")]);
    if (hasRetainedValue(liquidity.current_session_volume)) rows.push(["Khối lượng phiên", formatDiagnosticNumber(liquidity.current_session_volume)]);
    return rows.length ? `<div class="ws-technical-snapshot">${rows.map(([label, value]) => `<div><span>${helpLabelHtml(label)}</span><strong>${escHtml(value)}</strong></div>`).join("")}</div>` : '<p class="cockpit-note">Chưa có chỉ báo kỹ thuật hiện hành được giữ lại.</p>';
  }
  function selectedSignalEvidenceHtml(snapshot, ticker, session, registry, candleApi) {
    if (!snapshot || snapshot.scan_date !== session) {
      return '<p class="ws-signal-unavailable">Chưa có mẫu hình nến/SMC hiện hành.</p>';
    }
    const row = ((snapshot.watchlist || []).find((item) => String(item.ticker || "").toUpperCase() === String(ticker || "").toUpperCase()));
    if (!row || (!(row.patterns || []).length && !(row.smc || []).length)) {
      return '<p class="ws-signal-unavailable">Chưa có mẫu hình nến/SMC hiện hành.</p>';
    }
    const patterns = (row.patterns || []).map((key) => (registry || {})[key]).filter(Boolean);
    const smc = (row.smc || []).map((key) => ({ key, info: candleApi && candleApi.smcInfo ? candleApi.smcInfo(key) : null })).filter((item) => item.info);
    return `<section class="ws-signal-evidence" data-signal-session="${escHtml(snapshot.scan_date)}">
      <h6>Mẫu hình nến hiện tại</h6>
      ${patterns.length ? `<div class="ws-signal-chip-row">${patterns.map((pattern) => `<span class="ws-signal-chip"><b>${escHtml(pattern.name_vi || "Mẫu hình nến")}</b> <small>(${escHtml(pattern.name || pattern.key)})</small><em>${escHtml(candleApi && candleApi.directionLabel ? candleApi.directionLabel(pattern.direction, false) : pattern.direction || "")}</em></span>`).join("")}</div>` : '<p class="cockpit-note">Chưa có mẫu hình nến hiện hành được gắn nhãn.</p>'}
      <h6 class="mt-3">SMC hiện hành</h6>
      ${smc.length ? `<div class="ws-signal-chip-row">${smc.map((item) => `<span class="ws-signal-chip" title="${escHtml(item.info.tooltip)}"><b>${escHtml(item.info.vi)}</b> <small>(${escHtml(item.info.abbr)})</small></span>`).join("")}</div>` : '<p class="cockpit-note">Chưa có SMC hiện hành trong tập khái niệm được hỗ trợ.</p>'}
      <p class="cockpit-note mt-2">Bằng chứng hỗ trợ kỹ thuật, không phải thẩm quyền mua/bán độc lập.</p>
    </section>`;
  }

  function decisionCardHtml(card, options) {
    const opts = options || {};
    const ticker = String((opts.ticker || (card && card.ticker) || "")).trim().toUpperCase();
    if (!card) {
      return `<div class="cockpit-note" data-drawer-unavailable="true">Không có thẻ Không gian quyết định cho ${escHtml(ticker) || "UNKNOWN"}. Không chọn mã thay thế.</div>`;
    }
    const portfolio = opts.portfolio || card.portfolio || { evaluated: false, status: "NOT_EVALUATED" };
    const val = card.valuation || {};
    const why = card.why || {};
    const fundamental = card.fundamental || why.fundamental_evidence || {};
    const catalyst = card.catalyst || why.catalyst_evidence || {};
    const liquidity = card.liquidity || {};
    const marketSector = card.market_sector || why.market_sector_evidence || {};
    const referenceTrigger = card.reference_trigger || (card.tactical || {}).reference_trigger || (why.tactical_evidence || {}).reference_trigger || {};
    const sourceArtifacts = opts.sourceArtifacts || {};
    const price = retainedPrice(card);
    const invalidation = ((card.invalidation || {}).technical || {});
    return `
          <section class="ws-drawer-overview" aria-label="Tóm tắt quyết định" data-decision-ticker="${escHtml(ticker)}">
            <div class="ws-drawer-overview-head"><div><div class="section-eyebrow">Tóm tắt nghiên cứu</div><h4>${escHtml(ticker)} <span>${sectorDisplayHtml(card.sector)}</span></h4></div>${pill(card.research_stance, "research_stance")}</div>
            <div class="ws-drawer-keyline">${pill(card.entry_state, "tactical_state")} · ${pill(card.research_stance_readiness, "research_readiness")} · ${pill(card.entry_action, "entry_action")}</div>
            <div class="ws-drawer-facts">${hasRetainedValue(price) ? `<span>Giá hiện tại <b>${escHtml(formatDiagnosticNumber(price))}</b></span>` : ""}${hasRetainedValue(referenceTrigger.trigger_level) ? `<span>Kích hoạt tham chiếu <b>${escHtml(formatDiagnosticNumber(referenceTrigger.trigger_level))}</b></span>` : ""}${invalidation.boundary_type ? `<span>Vô hiệu <b>${escHtml(conditionHeadline(invalidation).label)}</b></span>` : ""}</div>
            <p>${escHtml(stanceEntryGuidance(card.research_stance, card.entry_action) || `Tư thế nghiên cứu: ${formatWorkspaceState(card.research_stance, "research_stance")}.`)}</p>
            <ul>${compactReasons(card, 3).map((reason) => `<li>${escHtml(reason)}</li>`).join("")}</ul>
          </section>
          <section class="ws-drawer-technical"><h6>Ảnh chụp kỹ thuật</h6>${technicalSnapshotHtml(card)}<div class="ws-selected-signal" data-selected-signal-for="${escHtml(ticker)}"><p class="cockpit-note">Đang kiểm tra mẫu hình nến/SMC hiện hành…</p></div></section>
          ${evidenceSummaryHtml(card)}
          <details class="ws-deep-evidence"><summary>Phân tích sâu &amp; bằng chứng</summary><div class="cockpit-detail-grid">
            <div class="card"><div class="card-header"><h6>Quyết định</h6></div><div class="card-body">
              <b>Mã</b> ${escHtml(ticker)} · <b>Ngành</b> ${sectorDisplayHtml(card.sector)}<br>
              <div class="mt-1"><b>Phạm vi nghiên cứu chính thức</b> ${card.official_research_scope ? pill(card.official_research_scope.scope_bucket, "official_scope") : pill(null, "official_scope")}${
                card.official_research_scope && card.official_research_scope.current_research_scope_reason
                  ? ` <span class="cockpit-note">${escHtml(card.official_research_scope.current_research_scope_reason)}</span>` : ""
              }</div>
              <div class="mt-1"><b>Tư thế nghiên cứu</b> ${pill(card.research_stance, "research_stance")} <span class="cockpit-note">(kết luận nghiên cứu chính)</span></div>
              <div class="mt-1"><b>Mức sẵn sàng kỹ thuật</b> ${pill(card.entry_action, "entry_action")} <span class="cockpit-note">thiết lập kỹ thuật: ${pill(card.entry_state, "tactical_state")}</span>${VETO_RESEARCH_STANCES.has(card.research_stance) ? ' <span class="cockpit-state blocked">Không phải tín hiệu mua</span>' : ""}</div>
              ${stanceEntryGuidance(card.research_stance, card.entry_action) ? `<div class="cockpit-note mt-2">${escHtml(stanceEntryGuidance(card.research_stance, card.entry_action))}</div>` : ""}
              <div class="mt-2"><b>Lý do xác định (bằng chứng ủng hộ)</b>${listHtml(why.deterministic_reasons, "rule_condition")}</div>
              <div class="mt-2"><b>Bối cảnh đối trọng</b>${listHtml(why.counterbalancing_context, "rule_condition")}</div>
              <div class="mt-2"><b>Cảnh báo</b>${listHtml((card.counter_thesis || {}).warnings, "rule_condition")}</div>
              <div class="mt-2"><b>Phản luận chính</b>${listHtml((card.counter_thesis || {}).key_counter_thesis, "rule_condition")}</div>
              <div class="mt-2"><b>Trục chưa có dữ liệu</b>${listHtml((card.counter_thesis || {}).unavailable_dimensions, "rule_condition")}</div>
              <div class="mt-2 cockpit-note">Hồ sơ nghiên cứu dự kiến: ${pill((card.prospective_case || {}).status, "prospective_case")} · vòng đời luận điểm: ${escHtml(formatWorkspaceState((card.prospective_case || {}).thesis_lifecycle_state, "prospective_case"))} · kết quả phía trước: ${pill((card.prospective_case || {}).forward_outcome_status, "prospective_case")}</div>
            </div></div>
            <div class="card"><div class="card-header"><h6>Doanh nghiệp</h6></div><div class="card-body">
              ${fundamentalDiagnosticsHtml(fundamental)}
            </div></div>
            <div class="card"><div class="card-header"><h6>Định giá</h6></div><div class="card-body">
              <div class="mb-2"><b>Trạng thái định giá tương đối</b> ${pill(val.relative_research_state, "valuation_state")}</div>
              ${valuationDiagnosticsHtml(val)}
            </div></div>
            <div class="card"><div class="card-header"><h6>Kỹ thuật</h6></div><div class="card-body">
              <b>Kỹ thuật</b> ${pill((why.tactical_evidence || {}).primary_entry_state, "tactical_state")}<br>
              <div class="mt-2"><b>Nhãn thiết lập</b>${listHtml(card.setup_tags, "setup_tag")}</div>
              <div class="mt-2"><b>Thị trường/ngành</b> ${sectorDiagnosticHtml(marketSector)}</div>
            </div></div>
            <div class="card"><div class="card-header"><h6>Kích hoạt / Vô hiệu</h6></div><div class="card-body">
              <div class="cockpit-grid mb-2">${kpiHtml("Trạng thái biên", pill((card.confirmation || {}).status, "confirmation_state"))}${kpiHtml("Trạng thái kích hoạt thực tế", pill((card.confirmation || {}).confirmation_trigger_state, "confirmation_state"))}</div>
              <div class="cockpit-note mb-2">Trạng thái biên cho biết điều kiện kích hoạt đã được gắn (có giá trị/toán tử cơ sở) — không phải bằng chứng điều kiện đã kích hoạt. Chỉ trạng thái đã kích hoạt mới có thể nâng tư thế nghiên cứu lên ứng viên mở vị thế.</div>
              ${conditionVisibleHtml(card.confirmation || {})}
              <hr class="my-3">
              <b>Mức kích hoạt tham chiếu</b>
              ${referenceTriggerHtml(referenceTrigger)}
              <hr class="my-3">
              <b>${((card.invalidation || {}).technical || {}).semantic === "STANCE_RECONSIDERATION_WATCH" ? "Điều gì sẽ làm tư thế này đáng xem xét lại" : "Kỹ thuật (vô hiệu luận điểm)"}</b> ${pill(((card.invalidation || {}).technical || {}).status, "invalidation_state")}
              ${((card.invalidation || {}).technical || {}).semantic === "STANCE_RECONSIDERATION_WATCH" ? '<div class="cockpit-note mb-1">Tư thế này là điều kiện cấm mở vị thế mới, không có luận điểm dài hạn để vô hiệu — biên này cho biết khi nào lệnh cấm đáng được xem xét lại, không phải điều kiện vô hiệu luận điểm.</div>' : ""}
              ${conditionVisibleHtml((card.invalidation || {}).technical || {})}
              <b>Nền tảng doanh nghiệp</b> ${pill(((card.invalidation || {}).fundamental || {}).status, "invalidation_state")}
              ${conditionVisibleHtml((card.invalidation || {}).fundamental || {})}
            </div></div>
            <div class="card"><div class="card-header"><h6>Chất xúc tác</h6></div><div class="card-body">
              ${catalystDiagnosticsHtml(catalyst)}
            </div></div>
            <div class="card"><div class="card-header"><h6>Thanh khoản</h6></div><div class="card-body">
              ${liquidityDiagnosticsHtml(liquidity)}
            </div></div>
            <div class="card"><div class="card-header"><h6>Danh mục</h6></div><div class="card-body">
              ${portfolio && portfolio.evaluated ? `
                ${pill(portfolio.status, "portfolio_state")} · Nắm giữ: ${pill(portfolio.holding_status, "portfolio_state")} ${portfolio.weight != null ? `(${escHtml(portfolio.weight)})` : ""}<br>
                <b>Tập trung ngành (hiện có)</b> ${escHtml(portfolio.existing_sector_concentration_weight)}<br>
                <b>Tập trung kỹ thuật</b>${listHtml(Object.entries(portfolio.tactical_concentration || {}).map(([k, v]) => `${k}: ${v}`))}
                <b>Chân trời rủi ro chung</b> ${escHtml(portfolio.selected_joint_risk_horizon)} · ${pill(portfolio.joint_risk_status, "data_fitness")}<br>
                <b>Tương quan cặp</b> ${pill(portfolio.pairwise_correlation_status, "data_fitness")}<br>
                <b>Vi phạm hạn mức người dùng</b>${listHtml((portfolio.user_limit_breaches || []).map((b) => JSON.stringify(b)))}
                <b>Thanh khoản (vị thế đang nắm)</b> ${pill(portfolio.liquidity_research_context, "liquidity_state")} · Lệnh chính xác: ${pill(portfolio.exact_execution_capacity_status, "liquidity_state")}
              ` : `${pill("NOT_EVALUATED", "portfolio_state")}<div class="cockpit-note mt-1">${escHtml(formatWorkspaceState((portfolio || {}).reason, "portfolio_state") || "Chưa có bối cảnh danh mục. Tải một tệp bên trên, hoặc mở Trình soạn danh mục.")}</div>`}
              <div class="cockpit-note mt-2">Tư thế nghiên cứu của mã độc lập với mức phù hợp danh mục và không bị danh mục làm thay đổi.</div>
              <div class="mt-2"><a href="portfolio.html" class="cockpit-note">Mở Trình soạn danh mục &rarr;</a> · <span class="cockpit-note">Bối cảnh rủi ro danh mục tổng hợp: xem "Dữ liệu &amp; phương pháp" bên dưới trang.</span></div>
            </div></div>
          </div></details>
          <details class="mt-3">
            <summary class="cockpit-note" style="cursor:pointer">Dữ liệu <span class="cockpit-note">(độ mới, khoảng trống, nguồn gốc)</span></summary>
            <div class="card mt-2"><div class="card-body">
              <div class="table-responsive"><table class="cockpit-table"><thead><tr><th>Trục</th><th>Độ mới dữ liệu</th><th>Phiên/kỳ nguồn</th><th>Proxy / đã xác nhận</th></tr></thead><tbody>
                ${Object.keys((card.lineage || {}).per_axis_freshness || {}).sort().map((axis) => `<tr><td>${escHtml(axisDisplayLabel(axis))}</td><td>${pill((card.lineage.per_axis_freshness || {})[axis], "freshness")}</td><td>${escHtml(unavailableLabel((card.lineage.per_axis_source_session || {})[axis]))}</td><td>${pill((card.lineage.per_axis_proxy_or_qualified_state || {})[axis], "data_fitness")}</td></tr>`).join("")}
              </tbody></table></div>
              <div class="cockpit-note mt-2">Bằng chứng sâu: ${pill(card.lineage && card.lineage.deep_evidence_availability, "data_fitness")}</div>
              <b>Điều kiện chặn</b>${listHtml(((card.lineage || {}).blockers || []).map((b) => `${axisDisplayLabel(b.axis)}: ${formatWorkspaceState(b.readiness, "research_readiness")} (${formatWorkspaceState(b.freshness_status, "freshness")})`))}
              <div class="mt-2">${provenanceBlock(sourceArtifacts && Object.keys(sourceArtifacts).length ? JSON.stringify(sourceArtifacts, null, 2) : "")}</div>
            </div></div>
          </details>`;
  }

  function renderDecisionCard(card, container, options) {
    const html = decisionCardHtml(card, options);
    if (container) container.innerHTML = html;
    return html;
  }

  // ---------------------------------------------------------------------
  // Browser-only rendering
  // ---------------------------------------------------------------------
  if (typeof document !== "undefined" && document.body && document.body.dataset.page === "investment-workspace") {
    (function renderInBrowser() {
      // Aliases only -- tone/pill computation lives once, at module scope (see pill() above),
      // routed through value-format.js's domain-aware tone contract.
      const esc = escHtml;
      const unavailable = unavailableLabel;

      let WORKSPACE = null;
      let ACTIVE_FILTERS = [];
      let SEARCH_QUERY = "";
      let PORTFOLIO_OVERRIDE = null;
      let SELECTED_TICKER = null;
      let WORKSPACE_VIEW = "opportunities";
      let SIGNAL_SNAPSHOT_PROMISE = null;
      const VALID_VIEWS = ["opportunities", "portfolio", "watchlist", "explore", "technical"];

      function effectivePortfolio(ticker, card) {
        if (PORTFOLIO_OVERRIDE) return joinPortfolioResearch(ticker, card.sector, PORTFOLIO_OVERRIDE);
        return card.portfolio;
      }

      function renderFilterChips() {
        const groups = {};
        FILTERS.forEach((f) => { (groups[f.group] = groups[f.group] || []).push(f); });
        document.getElementById("filter-chips").innerHTML = Object.entries(groups).map(([group, items]) => `
          <div class="ws-filter-group"><span class="cockpit-note ws-filter-group-label">${esc(FILTER_GROUP_LABELS[group] || group)}</span>
            ${items.map((f) => `<button type="button" class="cockpit-chip ws-filter-chip${ACTIVE_FILTERS.includes(f.id) ? " active" : ""}" data-filter="${f.id}">${esc(f.label)}</button>`).join("")}
          </div>`).join("");
      }

      function filteredTickers() {
        const cards = WORKSPACE.cards;
        return Object.keys(cards).filter((t) => matchesFilters(cards[t], ACTIVE_FILTERS) && matchesSearch(t, cards[t], SEARCH_QUERY)).sort();
      }

      function renderRow(ticker) {
        const card = WORKSPACE.cards[ticker];
        const isSelected = ticker === SELECTED_TICKER;
        const trigger = card.reference_trigger || (card.tactical || {}).reference_trigger || {};
        const invalidation = ((card.invalidation || {}).technical || {});
        const price = retainedPrice(card);
        return `<tr data-row-ticker="${esc(ticker)}" class="${isSelected ? "ws-row-selected" : ""}" style="cursor: pointer;">
          <td class="sticky-col">
            <button type="button" class="btn btn-link p-0 ws-ticker-link fw-bold font-monospace text-start" data-select-ticker="${esc(ticker)}">${esc(ticker)}</button>
          </td>
          <td>${pill(card.entry_state, "tactical_state")}<div class="cockpit-note">${sectorDisplayHtml(card.sector)}</div></td>
          <td>${hasRetainedValue(price) ? `<b>${esc(formatDiagnosticNumber(price))}</b>` : '<span class="cockpit-note">—</span>'}</td>
          <td>${hasRetainedValue(trigger.trigger_level) ? esc(formatDiagnosticNumber(trigger.trigger_level)) : '<span class="cockpit-note">—</span>'}</td>
          <td>${invalidation.boundary_type ? esc(conditionHeadline(invalidation).label) : '<span class="cockpit-note">—</span>'}</td>
          <td>${pill(card.research_stance, "research_stance")}<div class="cockpit-note">${esc(formatWorkspaceState(card.entry_action, "entry_action"))}</div></td>
          <td class="cockpit-note">${esc(compactReasons(card, 1)[0])}</td>
          <td><button type="button" class="btn btn-sm btn-outline-light" data-select-ticker="${esc(ticker)}">Chi tiết</button></td>
        </tr>`;
      }

      function focusTickers() {
        const states = ["BREAKOUT_READY", "EARLY_REVERSAL_CANDIDATE", "BASE_BUILDING"];
        return Object.keys(WORKSPACE.cards).filter((ticker) => {
          const card = WORKSPACE.cards[ticker];
          return states.includes(card.entry_state) || ["INITIATE_RESEARCH_CANDIDATE", "ACCUMULATE_RESEARCH_CANDIDATE"].includes(card.research_stance);
        }).slice(0, 4);
      }
      function renderDecisionFocus() {
        const root = document.getElementById("decision-focus");
        if (!root) return;
        root.innerHTML = focusTickers().map((ticker) => {
          const card = WORKSPACE.cards[ticker];
          const trigger = card.reference_trigger || (card.tactical || {}).reference_trigger || {};
          return `<article class="ws-focus-card" data-focus-ticker="${esc(ticker)}"><div class="ws-focus-card-head"><strong>${esc(ticker)}</strong>${pill(card.entry_state, "tactical_state")}</div><div class="cockpit-note">${sectorDisplayHtml(card.sector)}</div><div class="ws-focus-action">${pill(card.research_stance, "research_stance")}</div>${hasRetainedValue(trigger.trigger_level) ? `<div class="cockpit-note">Kích hoạt tham chiếu: ${esc(formatDiagnosticNumber(trigger.trigger_level))}</div>` : ""}<ul>${compactReasons(card, 2).map((reason) => `<li>${esc(reason)}</li>`).join("")}</ul><button type="button" class="btn btn-sm btn-outline-light" data-select-ticker="${esc(ticker)}">Xem luận điểm</button></article>`;
        }).join("") || '<p class="cockpit-note">Chưa có nhóm cần chú ý theo trạng thái nghiên cứu hiện tại.</p>';
      }

      function renderList() {
        const tickers = filteredTickers();
        document.getElementById("opportunity-rows").innerHTML = tickers.map(renderRow).join("");
        document.getElementById("row-count").textContent = `${tickers.length} / ${Object.keys(WORKSPACE.cards).length}`;
        document.getElementById("filter-count").textContent = ACTIVE_FILTERS.length ? `${ACTIVE_FILTERS.length} bộ lọc đang bật` : "";
      }

      // Phân tích (analysis) view: shares WORKSPACE.cards, ACTIVE_FILTERS and SEARCH_QUERY with
      // the Cơ hội view. analysisEvidenceHtml/analysisRowHtml/analysisKpi are pure and live at
      // module scope (see above) so they're directly unit-testable, same as decisionCardHtml.
      function renderAnalysisView() {
        if (!WORKSPACE) return;
        const rows = filteredTickers().map((t) => analysisRecord(WORKSPACE.cards[t]));
        document.getElementById("analysis-rows").innerHTML = rows.map(analysisRowHtml).join("");
        document.getElementById("analysis-row-count").textContent = `${rows.length} / ${Object.keys(WORKSPACE.cards).length}`;
        const cov = WORKSPACE.coverage || {};
        const total = Object.keys(WORKSPACE.cards).length;
        const scope = getProductScopeFormat();
        document.getElementById("analysis-summary").innerHTML = [
          analysisKpi("Phạm vi sản phẩm", scope ? `${scope.formatCount(total)} thẻ quyết định` : `${total.toLocaleString("vi-VN")} thẻ quyết định`),
          analysisKpi("Tư thế nghiên cứu", `${Object.keys(cov.research_stance_distribution || {}).length} nhóm nghiên cứu`),
          analysisKpi("Trạng thái kỹ thuật", `${Object.keys(cov.entry_state_distribution || {}).length} trạng thái được giữ lại`),
          analysisKpi("Trục dữ liệu đã cũ", `${cov.stale_axis_present_count != null ? cov.stale_axis_present_count.toLocaleString("vi-VN") : "—"} nêu rõ, không ép về hiện tại`),
        ].join("");
      }

      function renderPortfolioView() {
        const root = document.getElementById("workspace-portfolio-summary");
        if (!root) return;
        const held = PORTFOLIO_OVERRIDE && Array.isArray(PORTFOLIO_OVERRIDE.normalized_positions) ? PORTFOLIO_OVERRIDE.normalized_positions.length : 0;
        root.innerHTML = [
          analysisKpi("Trạng thái", PORTFOLIO_OVERRIDE ? "Đã nạp bối cảnh danh mục" : "Chưa nạp bối cảnh danh mục"),
          analysisKpi("Vị thế được giữ lại", PORTFOLIO_OVERRIDE ? String(held) : "—"),
          analysisKpi("Nguyên tắc", "Không thay đổi tư thế nghiên cứu của mã"),
        ].join("");
      }

      function renderTechnicalView() {
        const root = document.getElementById("workspace-technical-selected");
        if (!root) return;
        root.innerHTML = SELECTED_TICKER ? '<p class="cockpit-note">Đang kiểm tra bằng chứng kỹ thuật hiện hành…</p>' : '<p class="cockpit-note">Chọn một mã để xem tín hiệu kỹ thuật.</p>';
        if (SELECTED_TICKER) renderSelectedSignalEvidence(SELECTED_TICKER);
      }

      // ---- View switcher: internal views share one data fetch, one cards
      // universe and one selected-ticker state -- only the visible container changes.
      function setView(view) {
        const next = VALID_VIEWS.includes(view) ? view : "opportunities";
        WORKSPACE_VIEW = next;
        document.querySelectorAll("[data-ws-view]").forEach((el) => { el.hidden = el.id !== `ws-view-${next}`; });
        document.querySelectorAll(".ws-view-tab").forEach((tab) => {
          const active = tab.dataset.view === next;
          tab.classList.toggle("active", active);
          tab.setAttribute("aria-selected", active ? "true" : "false");
        });
        if (next === "explore") renderAnalysisView();
        if (next === "portfolio") renderPortfolioView();
        if (next === "technical") renderTechnicalView();
        try {
          const url = new URL(window.location.href);
          const currentParam = url.searchParams.get("view") || "opportunities";
          if (currentParam !== next) {
            if (next === "opportunities") url.searchParams.delete("view"); else url.searchParams.set("view", next);
            window.history.replaceState({ view: next }, "", url.toString());
          }
        } catch (_) {}
      }

      async function renderSelectedSignalEvidence(ticker) {
        const targets = document.querySelectorAll(`[data-selected-signal-for="${cssEscapeSelector(ticker)}"], #workspace-technical-selected`);
        const write = (html) => targets.forEach((el) => { el.innerHTML = html; });
        try {
          if (!SIGNAL_SNAPSHOT_PROMISE) SIGNAL_SNAPSHOT_PROMISE = fetch("data/candle_signals.json", { cache: "no-store" }).then((r) => r.ok ? r.json() : null);
          const snapshot = await SIGNAL_SNAPSHOT_PROMISE;
          if (!snapshot || snapshot.scan_date !== WORKSPACE.as_of_session) {
            write(selectedSignalEvidenceHtml(snapshot, ticker, WORKSPACE.as_of_session, {}, null));
            return;
          }
          const api = window.VSCandlestickPatterns;
          const patternsPayload = api && api.loadSnapshot ? await api.loadSnapshot() : null;
          write(selectedSignalEvidenceHtml(snapshot, ticker, WORKSPACE.as_of_session, (patternsPayload || {}).registry, api));
        } catch (_) {
          write('<p class="ws-signal-unavailable">Chưa có mẫu hình nến/SMC hiện hành.</p>');
        }
      }

      function renderSupportingMethods(methods) {
        if (!methods || !methods.length) return '<span class="cockpit-note">Chưa có phương pháp định giá tương đối sẵn sàng hỗ trợ nhãn này.</span>';
        return `<table class="cockpit-table"><thead><tr><th>Phương pháp</th><th>Phân vị</th><th>Số đối sánh</th><th>Phần bù/chiết khấu so với trung vị nhóm</th></tr></thead><tbody>${
          methods.map((m) => `<tr><td>${esc(m.method)}</td><td>${esc(m.percentile)}</td><td>${esc(m.peer_count)}</td><td>${esc(m.premium_or_discount_to_peer_median)}</td></tr>`).join("")
        }</tbody></table>`;
      }

      let lastFocusedElement = null;

      function openDrawer(ticker) {
        const backdrop = document.getElementById("decision-drawer-backdrop");
        const drawer = document.getElementById("decision-drawer");
        if (!backdrop || !drawer) return;
        lastFocusedElement = document.activeElement;
        backdrop.hidden = false;
        drawer.hidden = false;
        requestAnimationFrame(() => {
          backdrop.classList.add("is-open");
          drawer.classList.add("is-open");
          const closeBtn = document.getElementById("decision-drawer-close");
          if (closeBtn) closeBtn.focus();
        });
      }

      function closeDrawer() {
        const backdrop = document.getElementById("decision-drawer-backdrop");
        const drawer = document.getElementById("decision-drawer");
        if (!backdrop || !drawer) return;
        backdrop.classList.remove("is-open");
        drawer.classList.remove("is-open");
        setTimeout(() => {
          backdrop.hidden = true;
          drawer.hidden = true;
          if (lastFocusedElement && typeof lastFocusedElement.focus === "function") {
            lastFocusedElement.focus();
          }
          lastFocusedElement = null;
        }, 250);
      }

      function showDecisionCard(ticker, options) {
        const card = WORKSPACE.cards[ticker];
        const inPageEl = document.getElementById("decision-card");
        const drawerEl = document.getElementById("decision-drawer-body");
        if (!card) {
          const err = '<div class="cockpit-note">Không tìm thấy mã.</div>';
          if (drawerEl) drawerEl.innerHTML = err;
          if (inPageEl) inPageEl.innerHTML = err;
          return;
        }
        const cardOpts = {
          ticker,
          portfolio: effectivePortfolio(ticker, card),
          sourceArtifacts: WORKSPACE.source_artifacts,
        };
        // The drawer is the sole on-screen interaction surface. The in-page copy is print-only
        // (d-none d-print-block on #decision-card-section) so it always renders too, just never
        // shown on screen -- see options param note below (kept for signature compatibility).
        renderDecisionCard(card, drawerEl, cardOpts);
        if (inPageEl) renderDecisionCard(card, inPageEl, cardOpts);

        const drawerTicker = document.getElementById("decision-drawer-ticker");
        if (drawerTicker) drawerTicker.textContent = ticker;
        const drawerBadge = document.getElementById("decision-drawer-badge");
        if (drawerBadge) drawerBadge.innerHTML = pill(card.research_stance, "research_stance");
        const exploreLink = document.getElementById("drawer-screener-link");
        if (exploreLink) {
          exploreLink.href = `investment-workspace.html?view=explore&ticker=${encodeURIComponent(ticker)}`;
          if (typeof exploreLink.removeAttribute === "function") exploreLink.removeAttribute("aria-disabled");
        }
        renderSelectedSignalEvidence(ticker);
      }

      // Explicit not-found state for a requested ticker/hash that does not resolve to a real card.
      // Never falls back to rendering a different ticker's decision card.
      function showTickerNotFound(requestedTicker) {
        SELECTED_TICKER = null;
        const select = document.getElementById("ticker-select");
        if (select) {
          select.selectedIndex = -1;
          select.setAttribute("aria-invalid", "true");
        }
        const inPageEl = document.getElementById("decision-card");
        const drawerEl = document.getElementById("decision-drawer-body");
        const err = `<div class="cockpit-note" data-drawer-unavailable="true">Không tìm thấy mã "${escHtml(requestedTicker)}". Không chọn mã thay thế.</div>`;
        if (drawerEl) drawerEl.innerHTML = err;
        if (inPageEl) inPageEl.innerHTML = err;
        const drawerTicker = document.getElementById("decision-drawer-ticker");
        if (drawerTicker) drawerTicker.textContent = requestedTicker || "—";
        const drawerBadge = document.getElementById("decision-drawer-badge");
        if (drawerBadge) drawerBadge.innerHTML = "";
        const exploreLink = document.getElementById("drawer-screener-link");
        if (exploreLink) {
          if (typeof exploreLink.removeAttribute === "function") exploreLink.removeAttribute("href");
          exploreLink.setAttribute("aria-disabled", "true");
        }
      }

      function selectTicker(ticker, opts) {
        if (!WORKSPACE.cards[ticker]) return;
        SELECTED_TICKER = ticker;
        const select = document.getElementById("ticker-select");
        if (select) select.value = ticker;
        if (select && typeof select.removeAttribute === "function") select.removeAttribute("aria-invalid");
        showDecisionCard(ticker);
        renderList();
        renderDecisionFocus();
        if (WORKSPACE_VIEW === "technical") renderTechnicalView();

        try {
          const url = new URL(window.location.href);
          if (url.searchParams.get("ticker") !== ticker) {
            url.searchParams.set("ticker", ticker);
            window.history.replaceState({ ticker }, "", url.toString());
          }
        } catch (_) {}

        if (opts && opts.openDrawer) {
          openDrawer(ticker);
        }
        if (opts && opts.scrollIntoView) {
          const sec = document.getElementById("decision-card-section");
          if (sec) sec.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }

      function render(data) {
        WORKSPACE = data;
        document.getElementById("workspace").hidden = false;
        const sc = window.VSSessionCoherence;
        const coherence = sc ? sc.classify(data.as_of_session, sc.currentReleaseSession()) : null;
        const sessionLabel = (sc && coherence ? sc.sessionLabelText(coherence) : null) || data.as_of_session;
        const staleBanner = sc && coherence && sc.isConfirmedStale(coherence)
          ? sc.staleBannerHtml("Bàn quyết định", coherence, "INVESTMENT_DECISION_WORKSPACE_STALE")
          : "";
        const scope = getProductScopeFormat();
        const referenceScope = scope
          ? scope.formatProductScope(Object.keys(data.cards).length)
          : `Phạm vi sản phẩm: ${Object.keys(data.cards).length.toLocaleString("vi-VN")} mã`;
        document.getElementById("session-line").innerHTML = `${staleBanner}Phiên ${esc(sessionLabel)} · ${esc(referenceScope)}${provenanceBlock(data.producer_artifact_identity)}`;
        const systemDetail = document.getElementById("ws-system-status-detail");
        if (systemDetail) systemDetail.textContent = coherence && sc && sc.isConfirmedStale(coherence)
          ? "Dữ liệu không còn cùng phiên với bản phát hành; xem trạng thái độ mới ở từng trục."
          : `Dữ liệu Workspace cùng phiên ${sessionLabel}. Chi tiết nguồn gốc có trong Dữ liệu & phương pháp.`;
        renderFilterChips();
        renderList();
        renderDecisionFocus();
        const queryView = new URLSearchParams(window.location.search).get("view");
        setView(queryView === "analysis" ? "explore" : queryView);
        const select = document.getElementById("ticker-select");
        const tickers = Object.keys(data.cards).sort();
        select.innerHTML = tickers.map((t) => `<option>${esc(t)}</option>`).join("");
        const queryTicker = new URLSearchParams(window.location.search).get("ticker");
        const rawHash = window.location.hash.replace(/^#/, "");
        // Legacy compatibility hashes from the pre-convergence Cockpit page name a page section,
        // not a ticker -- e.g. #lineage must not be parsed as a request for ticker "LINEAGE".
        const COMPAT_SECTION_HASHES = { lineage: "section-data-methodology", "market-overview": "section-market-overview", "ticker-research": null };
        const hashKey = rawHash.toLowerCase();
        const isCompatHash = Object.prototype.hasOwnProperty.call(COMPAT_SECTION_HASHES, hashKey);
        if (isCompatHash) {
          const sectionId = COMPAT_SECTION_HASHES[hashKey];
          const sectionEl = sectionId && document.getElementById(sectionId);
          if (sectionEl) {
            sectionEl.open = true;
            if (typeof sectionEl.scrollIntoView === "function") sectionEl.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        }
        const hashTicker = isCompatHash ? "" : rawHash;
        const requestedTicker = queryTicker || hashTicker;
        const targetTicker = selectedTickerForDeepLink(tickers, requestedTicker);
        if (targetTicker) {
          selectTicker(targetTicker, { openDrawer: Boolean(queryTicker || hashTicker), scrollIntoView: false });
        } else if (requestedTicker) {
          showTickerNotFound(requestedTicker);
          openDrawer();
        }

        document.getElementById("filter-chips").addEventListener("click", (e) => {
          const btn = e.target.closest("[data-filter]");
          if (!btn) return;
          const id = btn.dataset.filter;
          ACTIVE_FILTERS = ACTIVE_FILTERS.includes(id) ? ACTIVE_FILTERS.filter((x) => x !== id) : ACTIVE_FILTERS.concat(id);
          renderFilterChips();
          renderList();
        });
        document.getElementById("filters-reset").addEventListener("click", () => {
          ACTIVE_FILTERS = []; SEARCH_QUERY = ""; document.getElementById("ticker-search").value = "";
          renderFilterChips(); renderList();
        });
        document.getElementById("ticker-search").addEventListener("input", (e) => { SEARCH_QUERY = e.target.value; renderList(); });

        document.getElementById("opportunity-rows").addEventListener("click", (e) => {
          const row = e.target.closest("tr[data-row-ticker]");
          if (!row) return;
          const ticker = row.dataset.rowTicker;
          selectTicker(ticker, { openDrawer: true });
        });

        document.getElementById("decision-focus").addEventListener("click", (e) => {
          const button = e.target.closest("[data-select-ticker]");
          if (button) selectTicker(button.dataset.selectTicker, { openDrawer: true });
        });

        document.getElementById("analysis-rows").addEventListener("click", (e) => {
          const row = e.target.closest("tr[data-ticker]");
          if (!row) return;
          selectTicker(row.dataset.ticker, { openDrawer: true });
        });

        document.querySelectorAll(".ws-view-tab").forEach((tab) => {
          tab.addEventListener("click", () => setView(tab.dataset.view));
        });

        select.addEventListener("change", () => selectTicker(select.value, { openDrawer: true }));

        const openSelectedBtn = document.getElementById("ws-open-selected-drawer");
        if (openSelectedBtn) {
          openSelectedBtn.addEventListener("click", () => {
            if (SELECTED_TICKER) openDrawer(SELECTED_TICKER);
          });
        }

        const closeBtn = document.getElementById("decision-drawer-close");
        if (closeBtn) closeBtn.addEventListener("click", closeDrawer);
        const backdrop = document.getElementById("decision-drawer-backdrop");
        if (backdrop) backdrop.addEventListener("click", closeDrawer);

        document.addEventListener("keydown", (e) => {
          if (e.key === "Escape") {
            const drawer = document.getElementById("decision-drawer");
            if (drawer && drawer.classList.contains("is-open")) {
              closeDrawer();
            }
          }
        });

        window.addEventListener("popstate", () => {
          const qTicker = new URLSearchParams(window.location.search).get("ticker");
          if (qTicker && WORKSPACE && WORKSPACE.cards[qTicker]) {
            selectTicker(qTicker, { openDrawer: true });
          } else if (!qTicker) {
            closeDrawer();
          }
        });

        function triggerExport(t) {
          const payload = buildT0Export(t, WORKSPACE.cards[t], WORKSPACE.producer_artifact_identity);
          const a = document.createElement("a");
          a.href = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" }));
          a.download = `t0-candidate-${t}.json`;
          a.click();
        }

        const drawerExport = document.getElementById("drawer-export-t0");
        if (drawerExport) {
          drawerExport.addEventListener("click", () => {
            if (SELECTED_TICKER) triggerExport(SELECTED_TICKER);
          });
        }

        document.getElementById("import-portfolio-research").addEventListener("change", (e) => {
          const file = e.target.files[0];
          if (!file) return;
          const reader = new FileReader();
          reader.onload = () => {
            try {
              const payload = JSON.parse(reader.result);
              PORTFOLIO_OVERRIDE = payload.portfolio_research_context || payload;
              if (!PORTFOLIO_OVERRIDE || !PORTFOLIO_OVERRIDE.portfolio_id) throw new Error("missing portfolio_id");
              renderList();
              renderDecisionFocus();
              renderPortfolioView();
              if (SELECTED_TICKER) showDecisionCard(SELECTED_TICKER);
            } catch (err) {
              alert("JSON portfolio_research_context không hợp lệ");
            }
          };
          reader.readAsText(file);
        });

        // Enrich with current_decision_cockpit.json data (strictly guarded by session coherence)
        fetch("data/current_decision_cockpit.json", { cache: "no-store" })
          .then((r) => (r.ok ? r.json() : null))
          .then((cockpit) => {
            if (!cockpit) return;
            const dc = (typeof window !== "undefined" && window.VSDecisionCockpit)
              ? window.VSDecisionCockpit
              : (typeof require === "function" ? require("./decision-cockpit.js") : null);

            const wsSession = (WORKSPACE && WORKSPACE.as_of_session) || null;
            const cpSession = (cockpit && cockpit.session) || null;

            // Session Coherence Gate: require exact session match before merging Cockpit values
            if (!wsSession || !cpSession || wsSession !== cpSession) {
              const mismatchHtml = (dc && dc.renderSessionMismatchHtml)
                ? dc.renderSessionMismatchHtml(wsSession, cpSession, "SESSION_MISMATCH")
                : `<div class="vs-alert vs-alert-warning mb-0"><b>Thông tin bổ sung chưa đồng bộ với phiên hiện tại.</b></div>`;
              // Every element populated only from the Cockpit artifact must clear on mismatch --
              // an incomplete list here lets a stale Cockpit-sourced value survive next to an
              // explicit "not synced" warning, which is worse than showing nothing.
              const containerIds = [
                "cockpit-market-overview",
                "cockpit-market-warnings",
                "cockpit-watchlist",
                "cockpit-portfolio-risk",
                "cockpit-gaps",
                "cockpit-verify-next",
                "cockpit-lineage-content",
              ];
              containerIds.forEach((id) => {
                const el = document.getElementById(id);
                if (el) el.innerHTML = id === "cockpit-watchlist" ? `<tr><td colspan="6">${mismatchHtml}</td></tr>` : mismatchHtml;
              });
              const watchCountEl = document.getElementById("cockpit-watch-count");
              if (watchCountEl) watchCountEl.textContent = "—";
              return;
            }

            // Real contract rendering via pure helpers
            const moEl = document.getElementById("cockpit-market-overview");
            if (moEl && dc && dc.renderMarketOverviewHtml) {
              moEl.innerHTML = dc.renderMarketOverviewHtml(cockpit);
            }
            const mwEl = document.getElementById("cockpit-market-warnings");
            if (mwEl && dc && dc.renderMarketWarningsHtml) {
              mwEl.innerHTML = dc.renderMarketWarningsHtml(cockpit);
            }

            const wlEl = document.getElementById("cockpit-watchlist");
            const wlCountEl = document.getElementById("cockpit-watch-count");
            if (wlEl && dc && dc.renderOwnerFocusHtml) {
              const tickers = (cockpit.owner_focus && Array.isArray(cockpit.owner_focus.tickers) && cockpit.owner_focus.tickers.length ? cockpit.owner_focus.tickers : (cockpit.watchlist?.tickers || [])).slice().sort();
              if (wlCountEl) wlCountEl.textContent = `${tickers.length} mã`;
              wlEl.innerHTML = dc.renderOwnerFocusHtml(cockpit, WORKSPACE ? WORKSPACE.cards : null, tickers);
              wlEl.addEventListener("click", (e) => {
                const btn = e.target.closest("[data-ticker]");
                if (btn) selectTicker(btn.dataset.ticker, { openDrawer: true });
              });
            }

            const prEl = document.getElementById("cockpit-portfolio-risk");
            if (prEl && dc && dc.renderPortfolioRiskHtml) {
              prEl.innerHTML = dc.renderPortfolioRiskHtml(cockpit);
            }

            const gapsEl = document.getElementById("cockpit-gaps");
            if (gapsEl && dc && dc.renderDataGapsHtml) {
              gapsEl.innerHTML = dc.renderDataGapsHtml(cockpit);
            }

            const vnEl = document.getElementById("cockpit-verify-next");
            if (vnEl && dc && dc.renderVerifyNextHtml) {
              vnEl.innerHTML = dc.renderVerifyNextHtml(cockpit);
            }

            const linEl = document.getElementById("cockpit-lineage-content");
            if (linEl && dc && dc.renderLineageHtml) {
              linEl.innerHTML = dc.renderLineageHtml(cockpit);
            }
          })
          .catch(() => {});
      }

      fetch(DATA_URL, { cache: "no-store" })
        .then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
        .then((data) => {
          if (!validateWorkspaceContract(data)) throw new Error("unsupported workspace contract");
          render(data);
        })
        .catch((err) => {
          const e = document.getElementById("workspace-error");
          e.hidden = false;
          e.textContent = `Không gian quyết định không khả dụng (${err.message}). Hãy dựng từ artifact investment_decision_workspace_projection/v1 của Producer; không dùng fallback hay khám phá phiên mới nhất.`;
        });
    })();
  }

  return {
    DATA_URL, SCHEMA_VERSION, CONTRACT_VERSION, validateWorkspaceContract, PORTFOLIO_STORAGE_KEY, RELATIVE_VALUATION_LABELS, FILTERS, FILTER_GROUP_LABELS,
    matchesFilters, matchesSearch, selectedTickerForDeepLink, hasStaleAxis, joinPortfolioResearch,
    readLocalPortfolioHoldings, localHoldingFor, buildT0Export,
    VETO_RESEARCH_STANCES, TACTICAL_ACTIONABLE_ENTRY_READINESS, stanceEntryGuidance,
    decisionCardHtml, renderDecisionCard, technicalSnapshotHtml, selectedSignalEvidenceHtml, retainedPrice, compactReasons,
    evidenceQuality, evidenceSummaryHtml,
    cssEscapeSelector,
    analysisRecord, analysisRows, analysisRowHtml, analysisEvidenceHtml,
  };
});
