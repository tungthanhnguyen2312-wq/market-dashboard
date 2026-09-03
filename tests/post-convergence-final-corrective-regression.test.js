const assert = require("node:assert/strict");
const test = require("node:test");

const vf = require("../assets/js/value-format.js");
const dc = require("../assets/js/decision-cockpit.js");
const ws = require("../assets/js/investment-workspace.js");

function minimalCard(overrides) {
  return Object.assign({
    ticker: "TST", sector: "TEST",
    research_stance: "WAIT_FOR_CONFIRMATION",
    entry_state: "SIDEWAYS_NEUTRAL", entry_action: "WAIT",
    valuation: {}, why: {}, confirmation: {}, invalidation: { technical: {}, fundamental: {} },
    counter_thesis: {}, setup_tags: [],
    lineage: { per_axis_freshness: {}, per_axis_source_session: {}, per_axis_proxy_or_qualified_state: {}, blockers: [] },
    prospective_case: {}, portfolio: { evaluated: false, status: "NOT_EVALUATED" },
    as_of_session: "2026-08-28",
  }, overrides);
}

// ---------------------------------------------------------------------
// 1. decision-cockpit module does not self-boot on Workspace
// ---------------------------------------------------------------------
test("1. decision-cockpit does not self-fetch/render when loaded with no #cockpit root (Workspace scenario), and Workspace-owned nodes stay untouched", () => {
  const dcPath = require.resolve("../assets/js/decision-cockpit.js");
  const vfPath = require.resolve("../assets/js/value-format.js");
  delete require.cache[dcPath];
  delete require.cache[vfPath];

  const savedDocument = global.document;
  const savedFetch = global.fetch;
  let fetchCalled = false;
  const sessionLineEl = { innerHTML: "WORKSPACE_OWNED_SENTINEL" };
  const tickerSelectEl = { innerHTML: "WORKSPACE_OWNED_SENTINEL", value: "" };
  const elements = { "session-line": sessionLineEl, "ticker-select": tickerSelectEl };

  try {
    global.fetch = () => { fetchCalled = true; return Promise.reject(new Error("fetch must not be called")); };
    global.document = {
      body: { dataset: { page: "investment-workspace" } },
      getElementById(id) {
        if (id === "cockpit") return null; // investment-workspace.html has no standalone #cockpit shell
        if (!elements[id]) elements[id] = { innerHTML: "", hidden: false, textContent: "", value: "", addEventListener() {}, setAttribute() {}, getAttribute() {} };
        return elements[id];
      },
      querySelectorAll() { return []; },
    };

    const freshDc = require(dcPath); // re-executes the module's top-level code, as a real <script> load would

    assert.equal(fetchCalled, false, "decision-cockpit.js must not fetch when no #cockpit root exists on the page");
    assert.equal(sessionLineEl.innerHTML, "WORKSPACE_OWNED_SENTINEL", "#session-line is Workspace-owned and must not be mutated merely by loading decision-cockpit.js");
    assert.equal(tickerSelectEl.innerHTML, "WORKSPACE_OWNED_SENTINEL", "#ticker-select is Workspace-owned and must not be mutated merely by loading decision-cockpit.js");
    // Pure helper exports required by Workspace/tests must still be present.
    for (const name of ["render", "renderTicker", "renderMarketOverviewHtml", "renderOwnerFocusHtml", "renderPortfolioRiskHtml", "renderDataGapsHtml", "renderLineageHtml", "renderSessionMismatchHtml"]) {
      assert.equal(typeof freshDc[name], "function", `expected exported helper ${name} to remain`);
    }
  } finally {
    global.document = savedDocument;
    global.fetch = savedFetch;
    delete require.cache[dcPath];
  }
});

// ---------------------------------------------------------------------
// 2 & 3. Portfolio-risk contract status vs is_actionable
// ---------------------------------------------------------------------
test("2. Evaluated portfolio_risk (is_actionable=false + portfolio_id + positions + concentration) renders as supplied, not absent", () => {
  const evaluated = {
    portfolio_risk: {
      contract_version: "current_portfolio_risk_envelope/v1",
      portfolio_id: "portfolio:test-1",
      is_actionable: false, // always false by contract design -- never an absence signal
      positions: [
        { ticker: "HPG", weight: 0.6 },
        { ticker: "VNM", weight: 0.4 },
      ],
      concentration: {
        single_name: { HPG: 0.6, VNM: 0.4 },
        entity_class: { corporate: 1.0 },
      },
      user_limit_results: [
        { limit_id: "max_single_name_weight", status: "LIMIT_BREACH", observed: 0.6, limit: 0.5 },
      ],
    },
  };
  const html = dc.renderPortfolioRiskHtml(evaluated);
  assert.doesNotMatch(html, /Chưa cung cấp danh mục cụ thể/);
  assert.match(html, /portfolio:test-1/);
  assert.match(html, /Số vị thế nắm giữ/);
  assert.match(html, /max_single_name_weight/);
  assert.match(html, /Vượt hạn mức/);
  // Never invent fields the real envelope doesn't have.
  assert.doesNotMatch(html, /risk_level|concentration_summary|risk_notes/);
});

test("3. portfolio_risk absent, or explicit NO_EXPLICIT_PORTFOLIO_SUPPLIED status, remains the unavailable state", () => {
  assert.match(dc.renderPortfolioRiskHtml({}), /Chưa cung cấp danh mục cụ thể/);
  assert.match(
    dc.renderPortfolioRiskHtml({ portfolio_risk: { status: "NO_EXPLICIT_PORTFOLIO_SUPPLIED", is_actionable: false, message: "No explicit portfolio-risk envelope was supplied for this operation." } }),
    /Chưa cung cấp danh mục cụ thể/
  );
});

// ---------------------------------------------------------------------
// 4, 5, 6. Deep-link ticker resolution
// ---------------------------------------------------------------------
test("4 & 5. Deep link: no request stays deterministic, a known ticker is selected, an unknown one is not silently substituted", () => {
  const tickers = ["HPG", "VNM", "FPT"];
  assert.equal(ws.selectedTickerForDeepLink(tickers, ""), "HPG", "no request -> deterministic HPG default");
  assert.equal(ws.selectedTickerForDeepLink(tickers, "VNM"), "VNM", "known ticker -> selected");
  assert.equal(ws.selectedTickerForDeepLink(tickers, "vnm"), "VNM", "case-insensitive known ticker -> selected");
  assert.equal(ws.selectedTickerForDeepLink(tickers, "ZZZZZZ"), null, "unknown ticker -> not found, no substitution");
  const noHpg = ["VNM", "FPT"];
  assert.equal(ws.selectedTickerForDeepLink(noHpg, ""), "VNM", "no request, no HPG present -> first deterministic ticker");
});

test("6. Compatibility/section hash tokens are not resolved as ticker requests", () => {
  const tickers = ["HPG", "VNM", "FPT"];
  for (const hash of ["lineage", "market-overview", "ticker-research", "LINEAGE", "Market-Overview"]) {
    assert.equal(ws.selectedTickerForDeepLink(tickers, hash), null, `"${hash}" must not resolve to any ticker (would otherwise silently open HPG or another ticker's card)`);
  }
});

// ---------------------------------------------------------------------
// 7, 8, 9, 10. Domain-aware tone on the actual rendered pill path
// ---------------------------------------------------------------------
test("7. Canonical Workspace rendering: confirmation_state=TRIGGERED gets the confirmation-domain constructive tone", () => {
  const html = ws.decisionCardHtml(minimalCard({ confirmation: { status: "TRIGGERED" } }), { ticker: "TST" });
  assert.match(html, /class="cockpit-state tone-constructive" data-state="TRIGGERED"/);
});

test("8. Canonical Workspace rendering: invalidation_state=TRIGGERED gets the adverse tone", () => {
  const html = ws.decisionCardHtml(minimalCard({ invalidation: { technical: { status: "TRIGGERED" }, fundamental: {} } }), { ticker: "TST" });
  assert.match(html, /class="cockpit-state tone-adverse" data-state="TRIGGERED"/);
});

test("9. Canonical Workspace rendering: data_fitness=BLOCKED is neutral, never constructive", () => {
  const html = ws.decisionCardHtml(minimalCard({ lineage: { per_axis_freshness: { tactical: "CURRENT" }, per_axis_source_session: {}, per_axis_proxy_or_qualified_state: { tactical: "BLOCKED" }, blockers: [] } }), { ticker: "TST" });
  assert.match(html, /class="cockpit-state tone-neutral" data-state="BLOCKED"/);
  assert.doesNotMatch(html, /class="cockpit-state tone-constructive" data-state="BLOCKED"/);
});

test("10. Canonical Workspace rendering: research_stance=HIGH_RISK_SPECULATION_ONLY stays watch/caution, not adverse", () => {
  const html = ws.decisionCardHtml(minimalCard({ research_stance: "HIGH_RISK_SPECULATION_ONLY" }), { ticker: "TST" });
  assert.match(html, /class="cockpit-state tone-watch" data-state="HIGH_RISK_SPECULATION_ONLY"/);
  assert.doesNotMatch(html, /class="cockpit-state tone-adverse" data-state="HIGH_RISK_SPECULATION_ONLY"/);
});

test("7-10 also hold on the Cockpit-native state() path (dc.state), not only via getSemanticTone() in isolation", () => {
  assert.match(dc.state("TRIGGERED", "confirmation_state"), /class="cockpit-state tone-constructive"/);
  assert.match(dc.state("TRIGGERED", "invalidation_state"), /class="cockpit-state tone-adverse"/);
  assert.match(dc.state("BLOCKED", "data_fitness"), /class="cockpit-state tone-neutral"/);
  assert.match(dc.state("HIGH_RISK_SPECULATION_ONLY", "research_stance"), /class="cockpit-state tone-watch"/);
});

// ---------------------------------------------------------------------
// 11. Data-gap ready count separated from missing counts
// ---------------------------------------------------------------------
test("11. strict_valuation_ready is rendered as readiness coverage, never as a missing-data count", () => {
  const html = dc.renderDataGapsHtml({ risk_data_gaps: { corporate_intelligence_unavailable: 5, strict_valuation_ready: 0 } });
  assert.doesNotMatch(html, /0 mã thiếu định giá nghiêm ngặt/);
  assert.match(html, /Độ bao phủ \/ Sẵn sàng/);
  assert.match(html, /Định giá nghiêm ngặt sẵn sàng/);
  assert.match(html, /Thông tin doanh nghiệp thiếu/); // the real _unavailable gap is unaffected
});

// ---------------------------------------------------------------------
// 12. Identity is never labelled SHA-256 unless it really is one
// ---------------------------------------------------------------------
test("12. operation_identity/product_identity are never labelled SHA-256; a real *_sha256 field is", () => {
  const withoutSha = dc.renderLineageHtml({ source: { operation_identity: "op:abc", product_identity: "prod:def", input_artifacts: {} } });
  assert.doesNotMatch(withoutSha, /SHA-256/);
  assert.match(withoutSha, /Định danh thao tác/);
  assert.match(withoutSha, /Định danh sản phẩm/);
  assert.match(withoutSha, /op:abc/);

  const withSha = dc.renderLineageHtml({ source: { operation_manifest_sha256: "abc123", product_artifact_sha256: "def456", input_artifacts: {} } });
  assert.match(withSha, /Mã băm bảng kê \(SHA-256\)/);
  assert.match(withSha, /Mã băm sản phẩm \(SHA-256\)/);
});

// ---------------------------------------------------------------------
// 14. NOT_AUTHORITATIVE_ACTIVE_UNIVERSE translation
// ---------------------------------------------------------------------
test("14. NOT_AUTHORITATIVE_ACTIVE_UNIVERSE translation preserves denominator/authority meaning, not listed-universe membership", () => {
  const label = vf.formatDomainState("NOT_AUTHORITATIVE_ACTIVE_UNIVERSE", "data_fitness").label;
  assert.doesNotMatch(label, /không thuộc/i, "must not claim the ticker/data does not belong to the official universe");
  assert.doesNotMatch(label, /không.*niêm yết chính thức/i);
  assert.match(label, /authoritative/i);
});

// ---------------------------------------------------------------------
// 15. Session mismatch clears every Cockpit-derived node (DOM-level)
// ---------------------------------------------------------------------
test("15. Session mismatch clears every Cockpit-derived node on the Workspace page, not just some of them", async () => {
  const wsPath = require.resolve("../assets/js/investment-workspace.js");
  const dcPath = require.resolve("../assets/js/decision-cockpit.js");
  const vfPath = require.resolve("../assets/js/value-format.js");
  delete require.cache[wsPath];
  delete require.cache[dcPath];
  delete require.cache[vfPath];

  const savedDocument = global.document;
  const savedWindow = global.window;
  const savedFetch = global.fetch;

  const mockWorkspace = {
    schema_version: "investment_decision_workspace_dashboard_projection/v1",
    as_of_session: "2026-08-28",
    producer_artifact_identity: "workspace:test",
    cards: { AAA: minimalCard({ ticker: "AAA" }) },
  };
  const mockCockpitMismatched = {
    schema_version: "current_decision_cockpit_projection/v2",
    session: "2026-08-25", // deliberately mismatched vs workspace's 2026-08-28
    source: {},
    owner_focus: { tickers: [] },
    ticker_cards: {},
    risk_data_gaps: {},
    portfolio_risk: { status: "NO_EXPLICIT_PORTFOLIO_SUPPLIED", is_actionable: false },
    what_to_verify_next: [],
  };

  const SENTINEL_HTML = "PRE_EXISTING_COCKPIT_CONTENT_SENTINEL";
  const SENTINEL_TEXT = "PRE_EXISTING_TEXT_SENTINEL";
  const elements = {};
  function makeEl(id) {
    return {
      id, hidden: false, open: false, innerHTML: SENTINEL_HTML, textContent: SENTINEL_TEXT, value: "",
      classList: { add() {}, remove() {}, contains() { return false; } },
      addEventListener() {}, removeEventListener() {},
      setAttribute(k, v) { this[k] = v; }, getAttribute(k) { return this[k]; },
      querySelectorAll() { return []; }, scrollIntoView() {},
    };
  }

  try {
    global.window = {
      location: { href: "http://localhost/investment-workspace.html", search: "", hash: "" },
      history: { replaceState() {} },
      addEventListener() {},
    };
    global.document = {
      body: { dataset: { page: "investment-workspace" } },
      activeElement: null,
      addEventListener() {},
      querySelectorAll() { return []; },
      createElement() { return { click() {}, href: "", download: "" }; },
      getElementById(id) {
        if (id === "cockpit") return null; // no standalone Cockpit shell on this page
        if (!elements[id]) elements[id] = makeEl(id);
        return elements[id];
      },
    };
    global.fetch = (url) => {
      const u = String(url);
      if (u.includes("investment_decision_workspace.json")) return Promise.resolve({ ok: true, json: () => Promise.resolve(mockWorkspace) });
      if (u.includes("current_decision_cockpit.json")) return Promise.resolve({ ok: true, json: () => Promise.resolve(mockCockpitMismatched) });
      return Promise.reject(new Error("unexpected fetch: " + u));
    };

    require(wsPath); // triggers investment-workspace.js's own top-level fetch(DATA_URL).then(render)

    // Drain the chained promise resolutions (workspace fetch -> render -> nested cockpit fetch -> mismatch handling).
    for (let i = 0; i < 6; i++) {
      await new Promise((resolve) => setTimeout(resolve, 0));
    }

    const cockpitHtmlNodeIds = [
      "cockpit-market-overview", "cockpit-market-warnings", "cockpit-cohorts-grid",
      "cockpit-watchlist", "cockpit-portfolio-risk", "cockpit-gaps",
      "cockpit-verify-next", "cockpit-lineage-content",
    ];
    for (const id of cockpitHtmlNodeIds) {
      const el = elements[id];
      assert.ok(el, `expected ${id} to exist and have been touched`);
      assert.notEqual(el.innerHTML, SENTINEL_HTML, `${id} must be cleared/replaced on session mismatch, not left stale`);
      assert.match(el.innerHTML, /chưa đồng bộ với phiên hiện tại/i, `${id} must show the session-mismatch warning`);
    }
    assert.ok(elements["cockpit-watch-count"], "cockpit-watch-count must have been touched");
    assert.notEqual(elements["cockpit-watch-count"].textContent, SENTINEL_TEXT, "cockpit-watch-count must be cleared on session mismatch");
  } finally {
    global.document = savedDocument;
    global.window = savedWindow;
    global.fetch = savedFetch;
    delete require.cache[wsPath];
    delete require.cache[dcPath];
  }
});
