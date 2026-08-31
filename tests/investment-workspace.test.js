const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ws = require("../assets/js/investment-workspace.js");

const html = fs.readFileSync(path.join(__dirname, "..", "investment-workspace.html"), "utf8");
const script = fs.readFileSync(path.join(__dirname, "..", "assets", "js", "investment-workspace.js"), "utf8");

function card(overrides) {
  return Object.assign({
    ticker: "AAA", sector: "STEEL", research_stance: "INITIATE_RESEARCH_CANDIDATE",
    research_stance_readiness: "RESEARCH_READY_CONDITIONAL", entry_state: "BREAKOUT_READY", entry_action: "BUY_ON_CONFIRMATION",
    setup_tags: ["BREAKOUT_CONFIRMED_BY_RULE"],
    fundamental: { state: "PROFITABLE", trajectory: "PROFIT_GROWTH" },
    valuation: { relative_research_state: "ATTRACTIVE_RELATIVE_RESEARCH", usable_relative_method_count: 2, market_cap_semantic_guard_applied: false, share_basis: "CURRENT_SHARE_RESEARCH_PROXY", supporting_methods: [{ method: "P/E", percentile: 0.1, peer_count: 6, premium_or_discount_to_peer_median: -0.4 }] },
    tactical: { primary_entry_state: "BREAKOUT_READY" },
    catalyst: { status: "WATCH_FOR_EXECUTION" },
    liquidity: { readiness: "LIQUIDITY_RESEARCH_PROXY", exact_execution_capacity_status: "EXECUTION_CAPACITY_EXACT_BLOCKED" },
    confirmation: { status: "READY" }, invalidation: { technical: { status: "READY" }, fundamental: { status: "UNAVAILABLE" } },
    counter_thesis: { warnings: [], key_counter_thesis: [], unavailable_dimensions: [] },
    why: { deterministic_reasons: [] },
    portfolio: { evaluated: false, status: "NOT_EVALUATED" },
    prospective_case: { status: "NO_RETAINED_CURRENT_CASES", forward_outcome_status: "PENDING_NOT_ENOUGH_FUTURE_SESSIONS" },
    lineage: { per_axis_freshness: { tactical: "CURRENT", fundamental: "STALE_BUT_RESEARCH_USABLE" }, per_axis_source_session: {}, per_axis_proxy_or_qualified_state: {}, blockers: [], deep_evidence_availability: "DEEP_EVIDENCE_ARTIFACT_NOT_MATERIALIZED_LOCALLY" },
    as_of_session: "2026-08-28",
  }, overrides);
}

test("page declares the opportunity list, filters, seven decision-card sections, and no-execution boundary", () => {
  for (const label of ["Filters", "Opportunity list", "Decision card"]) assert.match(html, new RegExp(label));
  for (const label of ["A. Current stance", "B. Why", "C. Counter-thesis", "D. Confirmation", "E. Invalidation", "F. Portfolio impact", "G. Data / authority"]) {
    assert.match(script, new RegExp(label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
  assert.match(html, /RESEARCH ONLY/);
  assert.match(html, /PRIORITY_NOW is not BUY_NOW/);
  assert.doesNotMatch(html + script, /execute trade|place order|sell order/i);
});

test("page declares the data source path and portfolio editor link", () => {
  assert.match(script, /data\/investment_decision_workspace\.json/);
  assert.match(html, /portfolio\.html/);
  assert.match(script, /stocklookup\.portfolio-research\.v1/);
});

test("useful filters cover stance, tactical, fundamental, valuation, liquidity, and catalyst", () => {
  const ids = ws.FILTERS.map((f) => f.id);
  for (const id of ["initiate", "accumulate", "wait", "avoid", "breakout_ready", "base_building", "early_reversal", "profitable", "turnaround", "valuation_available", "attractive", "expensive", "liquidity_available", "catalyst_available", "stale_evidence"]) {
    assert.ok(ids.includes(id), `missing filter ${id}`);
  }
  assert.doesNotMatch(JSON.stringify(ws.FILTERS.map((f) => f.label)), /score|rank|probability|target/i);
});

test("filters are pure predicates that do not mutate the source card", () => {
  const c = card();
  const before = JSON.stringify(c);
  ws.matchesFilters(c, ["initiate", "breakout_ready", "profitable"]);
  assert.equal(JSON.stringify(c), before);
  assert.equal(ws.matchesFilters(c, ["initiate", "breakout_ready", "profitable"]), true);
  assert.equal(ws.matchesFilters(c, ["avoid"]), false);
  assert.equal(ws.matchesFilters(c, []), true);
});

test("market-cap-only tickers are not labeled attractive/expensive by the attractive/expensive filter", () => {
  const guarded = card({ valuation: { relative_research_state: "UNAVAILABLE", usable_relative_method_count: 0, market_cap_semantic_guard_applied: true } });
  assert.equal(ws.matchesFilters(guarded, ["attractive"]), false);
  assert.equal(ws.matchesFilters(guarded, ["expensive"]), false);
});

test("stale evidence filter detects a non-current axis without flattening freshness", () => {
  const c = card();
  assert.equal(ws.hasStaleAxis(c), true); // fundamental is STALE_BUT_RESEARCH_USABLE in the fixture
  const allCurrent = card({ lineage: { ...c.lineage, per_axis_freshness: { tactical: "CURRENT", fundamental: "CURRENT" } } });
  assert.equal(ws.hasStaleAxis(allCurrent), false);
});

test("search matches ticker or sector, case-insensitively", () => {
  const c = card({ ticker: "HPG", sector: "STEEL" });
  assert.equal(ws.matchesSearch("HPG", c, "hpg"), true);
  assert.equal(ws.matchesSearch("HPG", c, "steel"), true);
  assert.equal(ws.matchesSearch("HPG", c, "oil"), false);
  assert.equal(ws.matchesSearch("HPG", c, ""), true);
});

test("portfolio join never mutates security research stance and flags policy breaches", () => {
  const c = card();
  const portfolioResearch = {
    portfolio_id: "demo", as_of_session: "2026-08-28", normalized_positions: [],
    user_limit_breaches: [{ reason: "MAX_SECTOR_WEIGHT", sector: "STEEL" }],
    sector_concentration: { STEEL: 0.6 }, tactical_concentration: {},
    selected_joint_risk_horizon: "L60", joint_risk_status: "READY", pairwise_correlation_status: "AVAILABLE_SEPARATELY_FROM_JOINT_MATRIX",
  };
  const fit = ws.joinPortfolioResearch(c.ticker, c.sector, portfolioResearch);
  assert.equal(fit.status, "EXCEEDS_USER_POLICY_LIMIT");
  assert.equal(c.research_stance, "INITIATE_RESEARCH_CANDIDATE");
});

test("portfolio join reports NOT_EVALUATED when nothing is supplied, and never computes correlation/volatility", () => {
  const fit = ws.joinPortfolioResearch("AAA", "STEEL", null);
  assert.equal(fit.evaluated, false);
  assert.equal(fit.status, "NOT_EVALUATED");
  assert.doesNotMatch(script, /Math\.sqrt.*cov|corrcoef|covariance\s*=/i);
});

test("t0 export is a bounded, non-authoritative candidate snapshot, never a retained case", () => {
  const c = card();
  const payload = ws.buildT0Export("AAA", c, "investment_decision_workspace_projection/v1:abc");
  assert.equal(payload.schema_version, "t0_candidate_export/v1");
  assert.equal(payload.ticker, "AAA");
  assert.equal(payload.authority_boundary.is_actionable, false);
  assert.match(payload.note, /not yet a retained prospective case/i);
  assert.ok(!("mfe" in payload) && !("t_plus_5" in payload));
});

test("liquidity readiness and exact execution capacity are distinct, separately labeled states", () => {
  assert.match(script, /exact_execution_capacity_status/);
  const c = card();
  assert.notEqual(c.liquidity.readiness, c.liquidity.exact_execution_capacity_status);
  assert.equal(c.liquidity.readiness, "LIQUIDITY_RESEARCH_PROXY");
  assert.equal(c.liquidity.exact_execution_capacity_status, "EXECUTION_CAPACITY_EXACT_BLOCKED");
});

test("prospective case PENDING state is rendered, not silently blocking the card", () => {
  const c = card({ prospective_case: { status: "PENDING_NOT_ENOUGH_FUTURE_SESSIONS", forward_outcome_status: "PENDING_NOT_ENOUGH_FUTURE_SESSIONS", thesis_lifecycle_state: "INITIAL_OBSERVATION" } });
  assert.equal(c.prospective_case.status, "PENDING_NOT_ENOUGH_FUTURE_SESSIONS");
  assert.match(script, /prospective_case/);
  assert.match(script, /forward_outcome_status/);
});

test("readLocalPortfolioHoldings tolerates missing/invalid storage and reads the shared editor key", () => {
  const fakeStorageMissing = { getItem: () => null };
  assert.equal(ws.readLocalPortfolioHoldings(fakeStorageMissing), null);
  const fakeStorageInvalid = { getItem: () => "not json" };
  assert.equal(ws.readLocalPortfolioHoldings(fakeStorageInvalid), null);
  const model = { portfolio_id: "local-portfolio", cash: 0, positions: [{ ticker: "HPG", quantity: 100 }] };
  const fakeStorageValid = { getItem: (key) => (key === ws.PORTFOLIO_STORAGE_KEY ? JSON.stringify(model) : null) };
  const loaded = ws.readLocalPortfolioHoldings(fakeStorageValid);
  assert.deepEqual(loaded, model);
  assert.equal(ws.localHoldingFor("hpg", loaded).ticker, "HPG");
  assert.equal(ws.localHoldingFor("VNM", loaded), null);
});
