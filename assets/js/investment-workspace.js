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

  function selectedTickerForDeepLink(tickers, requestedTicker) {
    const normalized = String(requestedTicker || "").trim().toUpperCase();
    if (tickers.includes(normalized)) return normalized;
    if (tickers.includes("HPG")) return "HPG";
    return tickers[0] || null;
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
  const POSITIVE_STATES = new Set([
    "INITIATE_RESEARCH_CANDIDATE", "ACCUMULATE_RESEARCH_CANDIDATE",
    "BREAKOUT_READY", "UPTREND_CONFIRMED", "EARLY_REVERSAL_CANDIDATE", "BASE_BUILDING",
    "PROFITABLE", "ATTRACTIVE_RELATIVE_RESEARCH", "LIQUIDITY_RESEARCH_PROXY",
    "CONFIRMED", "READY", "CURRENT", "EXECUTION_CAPACITY_EXACT_READY",
    "ACTIVE_CASES_AVAILABLE", "NO_CONCENTRATION_FLAGGED", "BUY_ON_CONFIRMATION",
    "EARLY_ENTRY", "ACCUMULATE_IN_BASE",
  ]);
  const NEGATIVE_STATES = new Set([
    "AVOID_NEW_ENTRY", "DISTRIBUTION_RISK", "BREAKDOWN_RISK", "DOWNTREND", "AVOID",
    "LOSS_MAKING", "EXPENSIVE_RELATIVE_RESEARCH", "TRIGGERED",
    "STALE_NOT_USABLE_FOR_THIS_AXIS", "EXCEEDS_USER_POLICY_LIMIT",
  ]);
  function stateBucket(v) {
    const s = unavailableLabel(v);
    const key = String(s).toUpperCase();
    if (POSITIVE_STATES.has(key)) return "available";
    if (NEGATIVE_STATES.has(key)) return "blocked";
    const k = key.toLowerCase();
    if (k === "unavailable" || k === "none" || k.includes("insufficient") || k.includes("not_evaluated") || k.includes("not_held") || k.includes("no_retained") || k.includes("case_data_unavailable")) return "unavailable";
    return "partial";
  }
  function pill(v, domain) {
    const raw = unavailableLabel(v);
    const label = domain ? formatWorkspaceState(raw, domain) : raw;
    return `<span class="cockpit-state ${stateBucket(v)}" data-state="${escHtml(raw)}" title="${escHtml(raw)}">${escHtml(label)}</span>`;
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
            <div class="card"><div class="card-header"><h6>A. Trạng thái hiện tại</h6></div><div class="card-body">
              <b>Mã</b> ${escHtml(ticker)} · <b>Ngành</b> ${sectorDisplayHtml(card.sector)}<br>
              <div class="mt-1"><b>Tư thế nghiên cứu</b> ${pill(card.research_stance, "research_stance")} <span class="cockpit-note">(kết luận nghiên cứu chính)</span></div>
              <div class="mt-1"><b>Mức sẵn sàng kỹ thuật</b> ${pill(card.entry_action, "entry_action")} <span class="cockpit-note">thiết lập kỹ thuật: ${pill(card.entry_state, "tactical_state")}</span>${VETO_RESEARCH_STANCES.has(card.research_stance) ? ' <span class="cockpit-state blocked">Không phải tín hiệu mua</span>' : ""}</div>
              ${stanceEntryGuidance(card.research_stance, card.entry_action) ? `<div class="cockpit-note mt-2">${escHtml(stanceEntryGuidance(card.research_stance, card.entry_action))}</div>` : ""}
              <div class="mt-2"><b>Nhãn thiết lập</b>${listHtml(card.setup_tags, "setup_tag")}</div>
            </div></div>
            <div class="card"><div class="card-header"><h6>B. Lý do</h6></div><div class="card-body">
              <b>Nền tảng doanh nghiệp</b> ${pill((why.fundamental_evidence || {}).state, "fundamental_state")} ${escHtml(formatWorkspaceState((why.fundamental_evidence || {}).trajectory, "fundamental_trajectory"))}<br>
              <b>Định giá</b> ${pill(val.relative_research_state, "valuation_state")} (${escHtml(val.usable_relative_method_count)} phương pháp dùng được, cơ sở ${escHtml(formatWorkspaceState(val.share_basis, "data_fitness"))})
              ${supportingMethodsHtml(val.supporting_methods)}
              <b>Kỹ thuật</b> ${pill((why.tactical_evidence || {}).primary_entry_state, "tactical_state")}<br>
              <b>Thị trường/ngành</b> ${marketContextHtml((why.market_sector_evidence || {}).sector_relative_context || {})}
              <b>Chất xúc tác</b> ${pill((why.catalyst_evidence || {}).status, "evidence_state")}
              <div class="mt-2"><b>Lý do xác định</b>${listHtml(why.deterministic_reasons, "rule_condition")}</div>
              <div class="mt-2"><b>Bối cảnh đối trọng</b>${listHtml(why.counterbalancing_context)}</div>
            </div></div>
            <div class="card"><div class="card-header"><h6>C. Phản luận</h6></div><div class="card-body">
              <b>Cảnh báo</b>${listHtml((card.counter_thesis || {}).warnings, "rule_condition")}
              <b>Phản luận chính</b>${listHtml((card.counter_thesis || {}).key_counter_thesis, "rule_condition")}
              <b>Trục chưa có dữ liệu</b>${listHtml((card.counter_thesis || {}).unavailable_dimensions, "rule_condition")}
            </div></div>
            <div class="card"><div class="card-header"><h6>D. Xác nhận</h6></div><div class="card-body">
              <div class="cockpit-grid mb-2">${kpiHtml("Trạng thái biên", pill((card.confirmation || {}).status, "confirmation_state"))}${kpiHtml("Trạng thái kích hoạt thực tế", pill((card.confirmation || {}).confirmation_trigger_state, "confirmation_state"))}</div>
              <div class="cockpit-note mb-2">Trạng thái biên cho biết điều kiện kích hoạt đã được gắn (có giá trị/toán tử cơ sở) — không phải bằng chứng điều kiện đã kích hoạt. Chỉ trạng thái đã kích hoạt mới có thể nâng tư thế nghiên cứu lên ứng viên mở vị thế.</div>
              ${conditionVisibleHtml(card.confirmation || {})}
            </div></div>
            <div class="card"><div class="card-header"><h6>E. Điều kiện vô hiệu</h6></div><div class="card-body">
              <b>${((card.invalidation || {}).technical || {}).semantic === "STANCE_RECONSIDERATION_WATCH" ? "Điều gì sẽ làm tư thế này đáng xem xét lại" : "Kỹ thuật (vô hiệu luận điểm)"}</b> ${pill(((card.invalidation || {}).technical || {}).status, "invalidation_state")}
              ${((card.invalidation || {}).technical || {}).semantic === "STANCE_RECONSIDERATION_WATCH" ? '<div class="cockpit-note mb-1">Tư thế này là điều kiện cấm mở vị thế mới, không có luận điểm dài hạn để vô hiệu — biên này cho biết khi nào lệnh cấm đáng được xem xét lại, không phải điều kiện vô hiệu luận điểm.</div>' : ""}
              ${conditionVisibleHtml((card.invalidation || {}).technical || {})}
              <b>Nền tảng doanh nghiệp</b> ${pill(((card.invalidation || {}).fundamental || {}).status, "invalidation_state")}
              ${conditionVisibleHtml((card.invalidation || {}).fundamental || {})}
            </div></div>
            <div class="card"><div class="card-header"><h6>F. Tác động danh mục</h6></div><div class="card-body">
              ${portfolio && portfolio.evaluated ? `
                ${pill(portfolio.status, "portfolio_state")} · Nắm giữ: ${pill(portfolio.holding_status, "portfolio_state")} ${portfolio.weight != null ? `(${escHtml(portfolio.weight)})` : ""}<br>
                <b>Tập trung ngành (hiện có)</b> ${escHtml(portfolio.existing_sector_concentration_weight)}<br>
                <b>Tập trung kỹ thuật</b>${listHtml(Object.entries(portfolio.tactical_concentration || {}).map(([k, v]) => `${k}: ${v}`))}
                <b>Chân trời rủi ro chung</b> ${escHtml(portfolio.selected_joint_risk_horizon)} · ${pill(portfolio.joint_risk_status, "data_fitness")}<br>
                <b>Tương quan cặp</b> ${pill(portfolio.pairwise_correlation_status, "data_fitness")}<br>
                <b>Vi phạm hạn mức người dùng</b>${listHtml((portfolio.user_limit_breaches || []).map((b) => JSON.stringify(b)))}
                <b>Thanh khoản (vị thế đang nắm)</b> ${pill(portfolio.liquidity_research_context, "liquidity_state")} · Lệnh chính xác: ${pill(portfolio.exact_execution_capacity_status, "liquidity_state")}
              ` : `${pill("NOT_EVALUATED", "portfolio_state")}<div class="cockpit-note mt-1">${escHtml(formatWorkspaceState((portfolio || {}).reason, "portfolio_state") || "Chưa có bối cảnh danh mục. Tải một tệp bên dưới, hoặc mở Trình soạn danh mục.")}</div>`}
              <div class="cockpit-note mt-2">Tư thế nghiên cứu của mã độc lập với mức phù hợp danh mục và không bị danh mục làm thay đổi.</div>
            </div></div>
          </div>
          <div class="cockpit-detail-grid mt-3">
            <div class="card"><div class="card-header"><h6>Hồ sơ nghiên cứu dự kiến</h6></div><div class="card-body">
              ${pill((card.prospective_case || {}).status, "prospective_case")}
              <div class="cockpit-note mt-1">Vòng đời luận điểm: ${escHtml(formatWorkspaceState((card.prospective_case || {}).thesis_lifecycle_state, "prospective_case"))}</div>
              <div class="cockpit-note">Kết quả phía trước (T+5/T+20/T+60, MFE, MAE, so với chuẩn): ${pill((card.prospective_case || {}).forward_outcome_status, "prospective_case")}</div>
            </div></div>
            <div class="card"><div class="card-header"><h6>G. Dữ liệu / thẩm quyền</h6></div><div class="card-body">
              <div class="table-responsive"><table class="cockpit-table"><thead><tr><th>Trục</th><th>Độ mới dữ liệu</th><th>Phiên/kỳ nguồn</th><th>Proxy / đã xác nhận</th></tr></thead><tbody>
                ${Object.keys((card.lineage || {}).per_axis_freshness || {}).sort().map((axis) => `<tr><td>${escHtml(axisDisplayLabel(axis))}</td><td>${pill((card.lineage.per_axis_freshness || {})[axis], "freshness")}</td><td>${escHtml(unavailableLabel((card.lineage.per_axis_source_session || {})[axis]))}</td><td>${pill((card.lineage.per_axis_proxy_or_qualified_state || {})[axis], "data_fitness")}</td></tr>`).join("")}
              </tbody></table></div>
              <div class="cockpit-note mt-2">Bằng chứng sâu: ${pill(card.lineage && card.lineage.deep_evidence_availability, "data_fitness")}</div>
              <b>Điều kiện chặn</b>${listHtml(((card.lineage || {}).blockers || []).map((b) => `${axisDisplayLabel(b.axis)}: ${formatWorkspaceState(b.readiness, "research_readiness")} (${formatWorkspaceState(b.freshness_status, "freshness")})`))}
              <div class="mt-2">${provenanceBlock(sourceArtifacts && Object.keys(sourceArtifacts).length ? JSON.stringify(sourceArtifacts, null, 2) : "")}</div>
            </div></div>
          </div>`;
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
      const esc = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
      const unavailable = (v) => (v === null || v === undefined || v === "" ? "UNAVAILABLE" : v);
      // Domain-accurate tri-state classification over this system's actual governed vocabulary
      // (research stance / entry state / valuation / liquidity / freshness / confirmation /
      // invalidation / portfolio-fit labels) -- a generic keyword guess would default most of
      // these enum values to the "unavailable" (red) bucket, which reads as false alarm-fatigue.
      const POSITIVE_STATES = new Set([
        "INITIATE_RESEARCH_CANDIDATE", "ACCUMULATE_RESEARCH_CANDIDATE",
        "BREAKOUT_READY", "UPTREND_CONFIRMED", "EARLY_REVERSAL_CANDIDATE", "BASE_BUILDING",
        "PROFITABLE", "ATTRACTIVE_RELATIVE_RESEARCH", "LIQUIDITY_RESEARCH_PROXY",
        "CONFIRMED", "READY", "CURRENT", "EXECUTION_CAPACITY_EXACT_READY",
        "ACTIVE_CASES_AVAILABLE", "NO_CONCENTRATION_FLAGGED", "BUY_ON_CONFIRMATION",
        "EARLY_ENTRY", "ACCUMULATE_IN_BASE",
      ]);
      const NEGATIVE_STATES = new Set([
        "AVOID_NEW_ENTRY", "DISTRIBUTION_RISK", "BREAKDOWN_RISK", "DOWNTREND", "AVOID",
        "LOSS_MAKING", "EXPENSIVE_RELATIVE_RESEARCH", "TRIGGERED",
        "STALE_NOT_USABLE_FOR_THIS_AXIS", "EXCEEDS_USER_POLICY_LIMIT",
      ]);
      const stateBucket = (v) => {
        const s = unavailable(v);
        const key = String(s).toUpperCase();
        if (POSITIVE_STATES.has(key)) return "available";
        if (NEGATIVE_STATES.has(key)) return "blocked";
        const k = key.toLowerCase();
        if (k === "unavailable" || k === "none" || k.includes("insufficient") || k.includes("not_evaluated") || k.includes("not_held") || k.includes("no_retained") || k.includes("case_data_unavailable")) return "unavailable";
        // Everything else (WAIT_FOR_CONFIRMATION, HIGH_RISK_SPECULATION_ONLY,
        // SELLING_PRESSURE_EASING, SIDEWAYS_NEUTRAL, CONDITIONAL, STALE_BUT_RESEARCH_USABLE,
        // PENDING_*, ALREADY_HELD, ADDS_SECTOR_CONCENTRATION, EXECUTION_CAPACITY_EXACT_BLOCKED,
        // PE_NOT_MEANINGFUL, IN_LINE_RELATIVE_RESEARCH, ABSOLUTE_RESEARCH_ONLY, ...) is an
        // informational/neutral state, not a failure -- shown as partial/amber, not red.
        return "partial";
      };
      const pill = (v, domain) => {
        const raw = unavailable(v);
        const label = domain ? formatWorkspaceState(raw, domain) : raw;
        return `<span class="cockpit-state ${stateBucket(v)}" data-state="${esc(raw)}" title="${esc(raw)}">${esc(label)}</span>`;
      };

      let WORKSPACE = null;
      let ACTIVE_FILTERS = [];
      let SEARCH_QUERY = "";
      let PORTFOLIO_OVERRIDE = null;
      let SELECTED_TICKER = null;

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
        const portfolio = effectivePortfolio(ticker, card);
        const invalidationWorst = [(card.invalidation || {}).technical, (card.invalidation || {}).fundamental]
          .map((x) => (x || {}).status).find((s) => s === "READY") || ((card.invalidation || {}).technical || {}).status || "UNAVAILABLE";
        return `<tr data-row-ticker="${esc(ticker)}" class="${ticker === SELECTED_TICKER ? "ws-row-selected" : ""}">
          <td><button type="button" class="cockpit-chip" data-select-ticker="${esc(ticker)}">${esc(ticker)}</button></td>
          <td class="cockpit-note">${sectorDisplayHtml(card.sector)}</td>
          <td>${pill(card.research_stance, "research_stance")}</td>
          <td>${pill(card.entry_state, "tactical_state")}${card.entry_action ? `<div class="cockpit-note">${esc(formatWorkspaceState(card.entry_action, "entry_action"))}</div>` : ""}</td>
          <td>${pill((card.fundamental || {}).state, "fundamental_state")}</td>
          <td>${pill((card.valuation || {}).relative_research_state, "valuation_state")}${(card.valuation || {}).market_cap_semantic_guard_applied ? '<div class="cockpit-note">đã chắn ngữ nghĩa</div>' : ""}</td>
          <td>${pill((card.liquidity || {}).readiness, "liquidity_state")}</td>
          <td>${pill((card.catalyst || {}).status, "evidence_state")}</td>
          <td>${hasStaleAxis(card) ? `<span class="cockpit-state partial" data-state="STALE_AXIS_PRESENT" title="STALE_AXIS_PRESENT">${esc(formatWorkspaceState("STALE_AXIS_PRESENT", "freshness"))}</span>` : `<span class="cockpit-state available" data-state="CURRENT" title="CURRENT">${esc(formatWorkspaceState("CURRENT", "freshness"))}</span>`}</td>
          <td>${pill((card.confirmation || {}).status, "confirmation_state")}</td>
          <td>${pill(invalidationWorst, "invalidation_state")}</td>
        </tr>`;
      }

      function renderList() {
        const tickers = filteredTickers();
        document.getElementById("opportunity-rows").innerHTML = tickers.map(renderRow).join("");
        document.getElementById("row-count").textContent = `${tickers.length} / ${Object.keys(WORKSPACE.cards).length}`;
        document.getElementById("filter-count").textContent = ACTIVE_FILTERS.length ? `${ACTIVE_FILTERS.length} bộ lọc đang bật` : "";
      }

      function renderSupportingMethods(methods) {
        if (!methods || !methods.length) return '<span class="cockpit-note">Chưa có phương pháp định giá tương đối sẵn sàng hỗ trợ nhãn này.</span>';
        return `<table class="cockpit-table"><thead><tr><th>Phương pháp</th><th>Phân vị</th><th>Số đối sánh</th><th>Phần bù/chiết khấu so với trung vị nhóm</th></tr></thead><tbody>${
          methods.map((m) => `<tr><td>${esc(m.method)}</td><td>${esc(m.percentile)}</td><td>${esc(m.peer_count)}</td><td>${esc(m.premium_or_discount_to_peer_median)}</td></tr>`).join("")
        }</tbody></table>`;
      }

      function showDecisionCard(ticker) {
        const card = WORKSPACE.cards[ticker];
        const el = document.getElementById("decision-card");
        if (!card) { el.innerHTML = '<div class="cockpit-note">Không tìm thấy mã.</div>'; return; }
        renderDecisionCard(card, el, {
          ticker,
          portfolio: effectivePortfolio(ticker, card),
          sourceArtifacts: WORKSPACE.source_artifacts,
        });
      }

      function selectTicker(ticker, opts) {
        if (!WORKSPACE.cards[ticker]) return;
        SELECTED_TICKER = ticker;
        document.getElementById("ticker-select").value = ticker;
        showDecisionCard(ticker);
        renderList();
        if (opts && opts.scrollIntoView) {
          document.getElementById("decision-card-section").scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }

      function render(data) {
        WORKSPACE = data;
        document.getElementById("workspace").hidden = false;
        document.getElementById("session-line").innerHTML = `Phiên ${esc(data.as_of_session)} · ${Object.keys(data.cards).length} mã${provenanceBlock(data.producer_artifact_identity)}`;
        renderFilterChips();
        renderList();
        const select = document.getElementById("ticker-select");
        const tickers = Object.keys(data.cards).sort();
        select.innerHTML = tickers.map((t) => `<option>${esc(t)}</option>`).join("");
        const queryTicker = new URLSearchParams(window.location.search).get("ticker");
        const hashTicker = window.location.hash.replace(/^#/, "");
        const requestedTicker = queryTicker || hashTicker;
        selectTicker(selectedTickerForDeepLink(tickers, requestedTicker), { scrollIntoView: false });

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
          const btn = e.target.closest("[data-select-ticker]");
          if (btn) selectTicker(btn.dataset.selectTicker, { scrollIntoView: true });
        });
        select.addEventListener("change", () => selectTicker(select.value, { scrollIntoView: true }));
        document.getElementById("export-t0").addEventListener("click", () => {
          const payload = buildT0Export(SELECTED_TICKER, WORKSPACE.cards[SELECTED_TICKER], WORKSPACE.producer_artifact_identity);
          const a = document.createElement("a");
          a.href = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" }));
          a.download = `t0-candidate-${SELECTED_TICKER}.json`;
          a.click();
        });
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
  };
});
