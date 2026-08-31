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

  const FILTERS = [
    { id: "initiate", label: "INITIATE", group: "stance", test: (c) => c.research_stance === "INITIATE_RESEARCH_CANDIDATE" },
    { id: "accumulate", label: "ACCUMULATE", group: "stance", test: (c) => c.research_stance === "ACCUMULATE_RESEARCH_CANDIDATE" },
    { id: "wait", label: "WAIT", group: "stance", test: (c) => c.research_stance === "WAIT_FOR_CONFIRMATION" },
    { id: "avoid", label: "AVOID", group: "stance", test: (c) => c.research_stance === "AVOID_NEW_ENTRY" },
    { id: "breakout_ready", label: "BREAKOUT_READY", group: "tactical", test: (c) => c.entry_state === "BREAKOUT_READY" },
    { id: "base_building", label: "BASE_BUILDING", group: "tactical", test: (c) => c.entry_state === "BASE_BUILDING" },
    { id: "early_reversal", label: "EARLY_REVERSAL_CANDIDATE", group: "tactical", test: (c) => c.entry_state === "EARLY_REVERSAL_CANDIDATE" },
    { id: "profitable", label: "Profitable", group: "fundamental", test: (c) => (c.fundamental || {}).state === "PROFITABLE" },
    { id: "turnaround", label: "Turnaround", group: "fundamental", test: (c) => (c.fundamental || {}).trajectory === "TURNED_TO_LOSS" || (c.valuation || {}).earnings_state === "TURNAROUND_CONTEXT" },
    { id: "valuation_available", label: "Valuation available", group: "valuation", test: (c) => !!(c.valuation || {}).relative_research_state && (c.valuation || {}).relative_research_state !== "UNAVAILABLE" },
    { id: "attractive", label: "Attractive (relative)", group: "valuation", test: (c) => (c.valuation || {}).relative_research_state === "ATTRACTIVE_RELATIVE_RESEARCH" },
    { id: "expensive", label: "Expensive (relative)", group: "valuation", test: (c) => (c.valuation || {}).relative_research_state === "EXPENSIVE_RELATIVE_RESEARCH" },
    { id: "liquidity_available", label: "Liquidity proxy available", group: "liquidity", test: (c) => (c.liquidity || {}).readiness === "LIQUIDITY_RESEARCH_PROXY" },
    { id: "catalyst_available", label: "Catalyst available", group: "catalyst", test: (c) => !!(c.catalyst || {}).status && (c.catalyst || {}).status !== "UNAVAILABLE" },
    { id: "stale_evidence", label: "Stale evidence present", group: "freshness", test: (c) => hasStaleAxis(c) },
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

  // Research Stance is the primary product research conclusion; entry_action (Tactical Entry
  // Readiness) is underlying tactical context only. These two governed-vocabulary sets and this
  // deterministic template function make the pairing understandable without ever restating or
  // overriding either raw value (both stay verbatim from the Producer).
  const VETO_RESEARCH_STANCES = new Set(["HIGH_RISK_SPECULATION_ONLY", "AVOID_NEW_ENTRY"]);
  const TACTICAL_ACTIONABLE_ENTRY_READINESS = new Set(["EARLY_ENTRY", "BUY_ON_CONFIRMATION", "ACCUMULATE_IN_BASE"]);

  function stanceEntryGuidance(researchStance, entryAction) {
    if (VETO_RESEARCH_STANCES.has(researchStance)) {
      return "Research Stance is this security's primary research conclusion and is a new-entry risk veto. Tactical Entry Readiness below is underlying tactical context only -- it must never be read as a buy signal.";
    }
    if ((researchStance === "ACCUMULATE_RESEARCH_CANDIDATE" || researchStance === "INITIATE_RESEARCH_CANDIDATE")
        && entryAction && !TACTICAL_ACTIONABLE_ENTRY_READINESS.has(entryAction)) {
      return `Research Stance is this security's primary research conclusion: a research ${researchStance === "ACCUMULATE_RESEARCH_CANDIDATE" ? "accumulation" : "initiation"} candidate. Tactical Entry Readiness (${entryAction}) reflects only the current tactical confirmation state and is not itself permission to enter.`;
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

  // ---------------------------------------------------------------------
  // Browser-only rendering
  // ---------------------------------------------------------------------
  if (typeof document !== "undefined") {
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
      const pill = (v) => `<span class="cockpit-state ${stateBucket(v)}">${esc(unavailable(v))}</span>`;
      const list = (values) => (Array.isArray(values) && values.length
        ? `<ul class="cockpit-list">${values.map((x) => `<li>${esc(typeof x === "string" ? x : JSON.stringify(x))}</li>`).join("")}</ul>`
        : '<span class="cockpit-note">UNAVAILABLE / none retained</span>');
      const kpi = (label, value) => `<div class="cockpit-kpi"><div class="label">${esc(label)}</div><div class="value">${typeof value === "string" ? pill(value) : esc(unavailable(value))}</div></div>`;

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
          <div class="ws-filter-group"><span class="cockpit-note ws-filter-group-label">${esc(group)}</span>
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
          <td class="cockpit-note">${esc(card.sector)}</td>
          <td>${pill(card.research_stance)}</td>
          <td>${pill(card.entry_state)}${card.entry_action ? `<div class="cockpit-note">${esc(card.entry_action)}</div>` : ""}</td>
          <td>${pill((card.fundamental || {}).state)}</td>
          <td>${pill((card.valuation || {}).relative_research_state)}${(card.valuation || {}).market_cap_semantic_guard_applied ? '<div class="cockpit-note">guarded</div>' : ""}</td>
          <td>${pill((card.liquidity || {}).readiness)}</td>
          <td>${pill((card.catalyst || {}).status)}</td>
          <td>${hasStaleAxis(card) ? '<span class="cockpit-state partial">STALE AXIS</span>' : '<span class="cockpit-state available">CURRENT</span>'}</td>
          <td>${pill((card.confirmation || {}).status)}</td>
          <td>${pill(invalidationWorst)}</td>
        </tr>`;
      }

      function renderList() {
        const tickers = filteredTickers();
        document.getElementById("opportunity-rows").innerHTML = tickers.map(renderRow).join("");
        document.getElementById("row-count").textContent = `${tickers.length} / ${Object.keys(WORKSPACE.cards).length}`;
        document.getElementById("filter-count").textContent = ACTIVE_FILTERS.length ? `${ACTIVE_FILTERS.length} filter(s) active` : "";
      }

      function renderSupportingMethods(methods) {
        if (!methods || !methods.length) return '<span class="cockpit-note">No ready relative-valuation method supports this label.</span>';
        return `<table class="cockpit-table"><thead><tr><th>Method</th><th>Percentile</th><th>Peer count</th><th>Premium/discount vs peer median</th></tr></thead><tbody>${
          methods.map((m) => `<tr><td>${esc(m.method)}</td><td>${esc(m.percentile)}</td><td>${esc(m.peer_count)}</td><td>${esc(m.premium_or_discount_to_peer_median)}</td></tr>`).join("")
        }</tbody></table>`;
      }

      function renderDecisionCard(ticker) {
        const card = WORKSPACE.cards[ticker];
        if (!card) { document.getElementById("decision-card").innerHTML = '<div class="cockpit-note">Ticker not found.</div>'; return; }
        const portfolio = effectivePortfolio(ticker, card);
        const val = card.valuation || {};
        const why = card.why || {};
        document.getElementById("decision-card").innerHTML = `
          <div class="cockpit-grid mb-3">
            ${kpi("Research stance", card.research_stance)}${kpi("Readiness", card.research_stance_readiness)}
            ${kpi("Tactical setup", card.entry_state)}${kpi("Tactical Entry Readiness", card.entry_action)}
          </div>
          <div class="cockpit-detail-grid">
            <div class="card"><div class="card-header"><h6>A. Current stance</h6></div><div class="card-body">
              <b>Ticker</b> ${esc(ticker)} · <b>Sector</b> ${esc(card.sector)}<br>
              <div class="mt-1"><b>Research Stance</b> ${pill(card.research_stance)} <span class="cockpit-note">(primary research conclusion)</span></div>
              <div class="mt-1"><b>Tactical Entry Readiness</b> ${pill(card.entry_action)} <span class="cockpit-note">tactical setup: ${pill(card.entry_state)}</span>${VETO_RESEARCH_STANCES.has(card.research_stance) ? ' <span class="cockpit-state blocked">NOT A BUY SIGNAL</span>' : ""}</div>
              ${stanceEntryGuidance(card.research_stance, card.entry_action) ? `<div class="cockpit-note mt-2">${esc(stanceEntryGuidance(card.research_stance, card.entry_action))}</div>` : ""}
              <div class="mt-2"><b>Setup tags</b>${list(card.setup_tags)}</div>
            </div></div>
            <div class="card"><div class="card-header"><h6>B. Why</h6></div><div class="card-body">
              <b>Fundamental</b> ${pill((why.fundamental_evidence || {}).state)} ${esc((why.fundamental_evidence || {}).trajectory)}<br>
              <b>Valuation</b> ${pill(val.relative_research_state)} (${esc(val.usable_relative_method_count)} usable method(s), basis ${esc(val.share_basis)})
              ${renderSupportingMethods(val.supporting_methods)}
              <b>Tactical</b> ${pill((why.tactical_evidence || {}).primary_entry_state)}<br>
              <b>Market/sector</b> ${esc(JSON.stringify((why.market_sector_evidence || {}).sector_relative_context || {}))}<br>
              <b>Catalyst</b> ${pill((why.catalyst_evidence || {}).status)}
              <div class="mt-2"><b>Deterministic reasons</b>${list(why.deterministic_reasons)}</div>
              <div class="mt-2"><b>Counterbalancing context</b>${list(why.counterbalancing_context)}</div>
            </div></div>
            <div class="card"><div class="card-header"><h6>C. Counter-thesis</h6></div><div class="card-body">
              <b>Warnings</b>${list((card.counter_thesis || {}).warnings)}
              <b>Key counter-thesis</b>${list((card.counter_thesis || {}).key_counter_thesis)}
              <b>Unavailable dimensions</b>${list((card.counter_thesis || {}).unavailable_dimensions)}
            </div></div>
            <div class="card"><div class="card-header"><h6>D. Confirmation</h6></div><div class="card-body">
              <div class="cockpit-grid mb-2">${kpi("Boundary status", (card.confirmation || {}).status)}${kpi("Actual trigger state", (card.confirmation || {}).confirmation_trigger_state)}</div>
              <div class="cockpit-note mb-2">Boundary status shows whether a confirmation trigger is instrumented (a real baseline value/operator exists) -- it is not evidence the trigger has fired. Only an actual TRIGGERED trigger state can promote research stance to INITIATE.</div>
              <pre class="cockpit-code">${esc(JSON.stringify(card.confirmation || {}, null, 2))}</pre>
            </div></div>
            <div class="card"><div class="card-header"><h6>E. Invalidation</h6></div><div class="card-body">
              <b>${((card.invalidation || {}).technical || {}).semantic === "STANCE_RECONSIDERATION_WATCH" ? "What would improve/reconsider this stance" : "Technical (thesis invalidation)"}</b> ${pill(((card.invalidation || {}).technical || {}).status)}
              ${((card.invalidation || {}).technical || {}).semantic === "STANCE_RECONSIDERATION_WATCH" ? '<div class="cockpit-note mb-1">This stance is a new-entry veto with no long thesis to invalidate -- this boundary is what would make the veto worth reconsidering, not a thesis-invalidation trigger.</div>' : ""}
              <pre class="cockpit-code">${esc(JSON.stringify((card.invalidation || {}).technical || {}, null, 2))}</pre>
              <b>Fundamental</b> ${pill(((card.invalidation || {}).fundamental || {}).status)}
              <pre class="cockpit-code">${esc(JSON.stringify((card.invalidation || {}).fundamental || {}, null, 2))}</pre>
            </div></div>
            <div class="card"><div class="card-header"><h6>F. Portfolio impact</h6></div><div class="card-body">
              ${portfolio && portfolio.evaluated ? `
                ${pill(portfolio.status)} · Holding: ${pill(portfolio.holding_status)} ${portfolio.weight != null ? `(${esc(portfolio.weight)})` : ""}<br>
                <b>Sector concentration (existing)</b> ${esc(portfolio.existing_sector_concentration_weight)}<br>
                <b>Tactical concentration</b>${list(Object.entries(portfolio.tactical_concentration || {}).map(([k, v]) => `${k}: ${v}`))}
                <b>Joint risk horizon</b> ${esc(portfolio.selected_joint_risk_horizon)} · ${pill(portfolio.joint_risk_status)}<br>
                <b>Pairwise correlation</b> ${pill(portfolio.pairwise_correlation_status)}<br>
                <b>User policy breaches</b>${list((portfolio.user_limit_breaches || []).map((b) => JSON.stringify(b)))}
                <b>Liquidity (held position)</b> ${pill(portfolio.liquidity_research_context)} · Exact execution: ${pill(portfolio.exact_execution_capacity_status)}
              ` : `${pill("NOT_EVALUATED")}<div class="cockpit-note mt-1">${esc((portfolio || {}).reason || "No portfolio research context supplied. Load one below, or open the Portfolio Editor.")}</div>`}
              <div class="cockpit-note mt-2">Security research stance is separate from portfolio fit and is never mutated by it.</div>
            </div></div>
          </div>
          <div class="cockpit-detail-grid mt-3">
            <div class="card"><div class="card-header"><h6>Prospective research case</h6></div><div class="card-body">
              ${pill((card.prospective_case || {}).status)}
              <div class="cockpit-note mt-1">Thesis lifecycle: ${esc(unavailable((card.prospective_case || {}).thesis_lifecycle_state))}</div>
              <div class="cockpit-note">Forward outcome (T+5/T+20/T+60, MFE, MAE, benchmark-relative): ${pill((card.prospective_case || {}).forward_outcome_status)}</div>
            </div></div>
            <div class="card"><div class="card-header"><h6>G. Data / authority</h6></div><div class="card-body">
              <div class="table-responsive"><table class="cockpit-table"><thead><tr><th>Axis</th><th>Freshness</th><th>Source session/period</th><th>Proxy / qualified</th></tr></thead><tbody>
                ${Object.keys((card.lineage || {}).per_axis_freshness || {}).sort().map((axis) => `<tr><td>${esc(axis)}</td><td>${pill((card.lineage.per_axis_freshness || {})[axis])}</td><td>${esc(unavailable((card.lineage.per_axis_source_session || {})[axis]))}</td><td>${esc(unavailable((card.lineage.per_axis_proxy_or_qualified_state || {})[axis]))}</td></tr>`).join("")}
              </tbody></table></div>
              <div class="cockpit-note mt-2">Deep evidence: ${esc(card.lineage && card.lineage.deep_evidence_availability)}</div>
              <b>Blockers</b>${list((card.lineage.blockers || []).map((b) => `${b.axis}: ${b.readiness} (${b.freshness_status})`))}
              <div class="mt-2"><b>Lineage identities</b><pre class="cockpit-code">${esc(JSON.stringify(WORKSPACE.source_artifacts, null, 2))}</pre></div>
            </div></div>
          </div>`;
      }

      function selectTicker(ticker, opts) {
        if (!WORKSPACE.cards[ticker]) return;
        SELECTED_TICKER = ticker;
        document.getElementById("ticker-select").value = ticker;
        renderDecisionCard(ticker);
        renderList();
        if (opts && opts.scrollIntoView) {
          document.getElementById("decision-card-section").scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }

      function render(data) {
        WORKSPACE = data;
        document.getElementById("workspace").hidden = false;
        document.getElementById("session-line").textContent = `Session ${data.as_of_session} · ${Object.keys(data.cards).length} tickers · ${data.producer_artifact_identity}`;
        renderFilterChips();
        renderList();
        const select = document.getElementById("ticker-select");
        const tickers = Object.keys(data.cards).sort();
        select.innerHTML = tickers.map((t) => `<option>${esc(t)}</option>`).join("");
        selectTicker(tickers.includes("HPG") ? "HPG" : tickers[0], { scrollIntoView: false });

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
              if (SELECTED_TICKER) renderDecisionCard(SELECTED_TICKER);
            } catch (err) {
              alert("Invalid portfolio_research_context JSON");
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
          e.textContent = `Investment Decision Workspace unavailable (${err.message}). Build it from the Producer's investment_decision_workspace_projection/v1 artifact; no fallback or latest-session discovery is used.`;
        });
    })();
  }

  return {
    DATA_URL, SCHEMA_VERSION, PORTFOLIO_STORAGE_KEY, RELATIVE_VALUATION_LABELS, FILTERS,
    matchesFilters, matchesSearch, hasStaleAxis, joinPortfolioResearch,
    readLocalPortfolioHoldings, localHoldingFor, buildT0Export,
    VETO_RESEARCH_STANCES, TACTICAL_ACTIONABLE_ENTRY_READINESS, stanceEntryGuidance,
  };
});
