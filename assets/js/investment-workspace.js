(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.VSInvestmentWorkspace = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  const DATA_URL = "data/investment_decision_workspace.json";
  const SCHEMA_VERSION = "investment_decision_workspace_dashboard_projection/v1";
  const PORTFOLIO_STORAGE_KEY = "stocklookup.portfolio-research.v1";
  const RELATIVE_VALUATION_LABELS = ["ATTRACTIVE_RELATIVE_RESEARCH", "EXPENSIVE_RELATIVE_RESEARCH"];

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

  function decisionCardHtml(card, options) {
    const opts = options || {};
    const ticker = String((opts.ticker || (card && card.ticker) || "")).trim().toUpperCase();
    if (!card) {
      return `<div class="cockpit-note" data-drawer-unavailable="true">Không có thẻ Không gian quyết định cho ${escHtml(ticker) || "UNKNOWN"}. Không chọn mã thay thế.</div>`;
    }
    const portfolio = opts.portfolio || card.portfolio || { evaluated: false, status: "NOT_EVALUATED" };
    const val = card.valuation || {};
    const why = card.why || {};
    const sourceArtifacts = opts.sourceArtifacts || {};
    return `
          <div class="cockpit-grid mb-3" data-decision-ticker="${escHtml(ticker)}">
            ${kpiHtml("Tư thế nghiên cứu", pill(card.research_stance, "research_stance"))}${kpiHtml("Mức sẵn sàng", pill(card.research_stance_readiness, "research_readiness"))}
            ${kpiHtml("Thiết lập kỹ thuật", pill(card.entry_state, "tactical_state"))}${kpiHtml("Mức sẵn sàng kỹ thuật", pill(card.entry_action, "entry_action"))}
          </div>
          <div class="cockpit-detail-grid">
            <div class="card"><div class="card-header"><h6>Quyết định</h6></div><div class="card-body">
              <b>Mã</b> ${escHtml(ticker)} · <b>Ngành</b> ${sectorDisplayHtml(card.sector)}<br>
              <div class="mt-1"><b>Tư thế nghiên cứu</b> ${pill(card.research_stance, "research_stance")} <span class="cockpit-note">(kết luận nghiên cứu chính)</span></div>
              <div class="mt-1"><b>Mức sẵn sàng kỹ thuật</b> ${pill(card.entry_action, "entry_action")} <span class="cockpit-note">thiết lập kỹ thuật: ${pill(card.entry_state, "tactical_state")}</span>${VETO_RESEARCH_STANCES.has(card.research_stance) ? ' <span class="cockpit-state blocked">Không phải tín hiệu mua</span>' : ""}</div>
              ${stanceEntryGuidance(card.research_stance, card.entry_action) ? `<div class="cockpit-note mt-2">${escHtml(stanceEntryGuidance(card.research_stance, card.entry_action))}</div>` : ""}
              <div class="mt-2"><b>Chất xúc tác (vì sao là lúc này)</b> ${pill((why.catalyst_evidence || {}).status, "evidence_state")}</div>
              <div class="mt-2"><b>Lý do xác định (bằng chứng ủng hộ)</b>${listHtml(why.deterministic_reasons, "rule_condition")}</div>
              <div class="mt-2"><b>Bối cảnh đối trọng</b>${listHtml(why.counterbalancing_context)}</div>
              <div class="mt-2"><b>Cảnh báo</b>${listHtml((card.counter_thesis || {}).warnings, "rule_condition")}</div>
              <div class="mt-2"><b>Phản luận chính</b>${listHtml((card.counter_thesis || {}).key_counter_thesis, "rule_condition")}</div>
              <div class="mt-2"><b>Trục chưa có dữ liệu</b>${listHtml((card.counter_thesis || {}).unavailable_dimensions, "rule_condition")}</div>
              <div class="mt-2 cockpit-note">Hồ sơ nghiên cứu dự kiến: ${pill((card.prospective_case || {}).status, "prospective_case")} · vòng đời luận điểm: ${escHtml(formatWorkspaceState((card.prospective_case || {}).thesis_lifecycle_state, "prospective_case"))} · kết quả phía trước: ${pill((card.prospective_case || {}).forward_outcome_status, "prospective_case")}</div>
            </div></div>
            <div class="card"><div class="card-header"><h6>Doanh nghiệp</h6></div><div class="card-body">
              <b>Nền tảng doanh nghiệp</b> ${pill((why.fundamental_evidence || {}).state, "fundamental_state")} ${escHtml(formatWorkspaceState((why.fundamental_evidence || {}).trajectory, "fundamental_trajectory"))}
            </div></div>
            <div class="card"><div class="card-header"><h6>Định giá</h6></div><div class="card-body">
              <b>Định giá</b> ${pill(val.relative_research_state, "valuation_state")} (${escHtml(val.usable_relative_method_count)} phương pháp dùng được, cơ sở ${escHtml(formatWorkspaceState(val.share_basis, "data_fitness"))})
              ${supportingMethodsHtml(val.supporting_methods)}
            </div></div>
            <div class="card"><div class="card-header"><h6>Kỹ thuật</h6></div><div class="card-body">
              <b>Kỹ thuật</b> ${pill((why.tactical_evidence || {}).primary_entry_state, "tactical_state")}<br>
              <div class="mt-2"><b>Nhãn thiết lập</b>${listHtml(card.setup_tags, "setup_tag")}</div>
              <div class="mt-2"><b>Thị trường/ngành</b> ${marketContextHtml((why.market_sector_evidence || {}).sector_relative_context || {})}</div>
            </div></div>
            <div class="card"><div class="card-header"><h6>Kích hoạt / Vô hiệu</h6></div><div class="card-body">
              <div class="cockpit-grid mb-2">${kpiHtml("Trạng thái biên", pill((card.confirmation || {}).status, "confirmation_state"))}${kpiHtml("Trạng thái kích hoạt thực tế", pill((card.confirmation || {}).confirmation_trigger_state, "confirmation_state"))}</div>
              <div class="cockpit-note mb-2">Trạng thái biên cho biết điều kiện kích hoạt đã được gắn (có giá trị/toán tử cơ sở) — không phải bằng chứng điều kiện đã kích hoạt. Chỉ trạng thái đã kích hoạt mới có thể nâng tư thế nghiên cứu lên ứng viên mở vị thế.</div>
              ${conditionVisibleHtml(card.confirmation || {})}
              <hr class="my-3">
              <b>${((card.invalidation || {}).technical || {}).semantic === "STANCE_RECONSIDERATION_WATCH" ? "Điều gì sẽ làm tư thế này đáng xem xét lại" : "Kỹ thuật (vô hiệu luận điểm)"}</b> ${pill(((card.invalidation || {}).technical || {}).status, "invalidation_state")}
              ${((card.invalidation || {}).technical || {}).semantic === "STANCE_RECONSIDERATION_WATCH" ? '<div class="cockpit-note mb-1">Tư thế này là điều kiện cấm mở vị thế mới, không có luận điểm dài hạn để vô hiệu — biên này cho biết khi nào lệnh cấm đáng được xem xét lại, không phải điều kiện vô hiệu luận điểm.</div>' : ""}
              ${conditionVisibleHtml((card.invalidation || {}).technical || {})}
              <b>Nền tảng doanh nghiệp</b> ${pill(((card.invalidation || {}).fundamental || {}).status, "invalidation_state")}
              ${conditionVisibleHtml((card.invalidation || {}).fundamental || {})}
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
          </div>
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
      const VALID_VIEWS = ["opportunities", "analysis", "watchlist"];

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
        return `<tr data-row-ticker="${esc(ticker)}" class="${isSelected ? "ws-row-selected" : ""}" style="cursor: pointer;">
          <td class="sticky-col">
            <button type="button" class="btn btn-link p-0 ws-ticker-link fw-bold font-monospace text-start" data-select-ticker="${esc(ticker)}">${esc(ticker)}</button>
          </td>
          <td class="cockpit-note text-truncate" style="max-width: 140px;">${sectorDisplayHtml(card.sector)}</td>
          <td>${pill(card.research_stance, "research_stance")}</td>
          <td>${pill(card.entry_state, "tactical_state")}${card.entry_action ? `<div class="cockpit-note">${esc(formatWorkspaceState(card.entry_action, "entry_action"))}</div>` : ""}</td>
          <td>${pill((card.valuation || {}).relative_research_state, "valuation_state")}${(card.valuation || {}).market_cap_semantic_guard_applied ? '<div class="cockpit-note">đã chắn ngữ nghĩa</div>' : ""}</td>
        </tr>`;
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
        document.getElementById("analysis-summary").innerHTML = [
          analysisKpi("Phạm vi thị trường", `${total.toLocaleString("vi-VN")} thẻ quyết định`),
          analysisKpi("Tư thế nghiên cứu", `${Object.keys(cov.research_stance_distribution || {}).length} nhóm nghiên cứu`),
          analysisKpi("Trạng thái kỹ thuật", `${Object.keys(cov.entry_state_distribution || {}).length} trạng thái được giữ lại`),
          analysisKpi("Trục dữ liệu đã cũ", `${cov.stale_axis_present_count != null ? cov.stale_axis_present_count.toLocaleString("vi-VN") : "—"} nêu rõ, không ép về hiện tại`),
        ].join("");
      }

      // ---- View switcher: Cơ hội / Phân tích / Theo dõi share one data fetch, one cards
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
        if (next === "analysis") renderAnalysisView();
        try {
          const url = new URL(window.location.href);
          const currentParam = url.searchParams.get("view") || "opportunities";
          if (currentParam !== next) {
            if (next === "opportunities") url.searchParams.delete("view"); else url.searchParams.set("view", next);
            window.history.replaceState({ view: next }, "", url.toString());
          }
        } catch (_) {}
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
        const screenerLink = document.getElementById("drawer-screener-link");
        if (screenerLink) screenerLink.href = `screener.html?ticker=${encodeURIComponent(ticker)}`;
      }

      // Explicit not-found state for a requested ticker/hash that does not resolve to a real card.
      // Never falls back to rendering a different ticker's decision card.
      function showTickerNotFound(requestedTicker) {
        const inPageEl = document.getElementById("decision-card");
        const drawerEl = document.getElementById("decision-drawer-body");
        const err = `<div class="cockpit-note" data-drawer-unavailable="true">Không tìm thấy mã "${escHtml(requestedTicker)}". Không chọn mã thay thế.</div>`;
        if (drawerEl) drawerEl.innerHTML = err;
        if (inPageEl) inPageEl.innerHTML = err;
        const drawerTicker = document.getElementById("decision-drawer-ticker");
        if (drawerTicker) drawerTicker.textContent = requestedTicker || "—";
        const drawerBadge = document.getElementById("decision-drawer-badge");
        if (drawerBadge) drawerBadge.innerHTML = "";
      }

      function selectTicker(ticker, opts) {
        if (!WORKSPACE.cards[ticker]) return;
        SELECTED_TICKER = ticker;
        const select = document.getElementById("ticker-select");
        if (select) select.value = ticker;
        showDecisionCard(ticker);
        renderList();

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
        document.getElementById("session-line").innerHTML = `Phiên ${esc(data.as_of_session)} · ${Object.keys(data.cards).length} mã${provenanceBlock(data.producer_artifact_identity)}`;
        renderFilterChips();
        renderList();
        const queryView = new URLSearchParams(window.location.search).get("view");
        setView(queryView);
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
          if (data.schema_version !== SCHEMA_VERSION) throw new Error("unsupported projection schema");
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
    DATA_URL, SCHEMA_VERSION, PORTFOLIO_STORAGE_KEY, RELATIVE_VALUATION_LABELS, FILTERS, FILTER_GROUP_LABELS,
    matchesFilters, matchesSearch, selectedTickerForDeepLink, hasStaleAxis, joinPortfolioResearch,
    readLocalPortfolioHoldings, localHoldingFor, buildT0Export,
    VETO_RESEARCH_STANCES, TACTICAL_ACTIONABLE_ENTRY_READINESS, stanceEntryGuidance,
    decisionCardHtml, renderDecisionCard,
    analysisRecord, analysisRows, analysisRowHtml, analysisEvidenceHtml,
  };
});
