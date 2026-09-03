"use strict";

// Architecture-contract tests for MARKET_DASHBOARD_UNIFIED_DECISION_WORKSPACE_AND_INFORMATION_
// ARCHITECTURE_REDESIGN_V2: analysis.html retired into investment-workspace.html's three internal
// views. Most individual claims (5/6-column tables, no conflictReasons, cohorts-as-filters,
// session-mismatch fail-closed) are already covered where the relevant code lives (analysis
// retirement in product-surface-convergence.test.js, drawer/table shape in
// product-surface-convergence-v1-regression.test.js, session gate in
// post-convergence-final-corrective-regression.test.js). This file proves the remaining
// structural claims that don't otherwise have a single obvious home.

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const root = path.resolve(__dirname, "..");
const analysisHtml = fs.readFileSync(path.join(root, "analysis.html"), "utf8");
const wsHtml = fs.readFileSync(path.join(root, "investment-workspace.html"), "utf8");
const wsJs = fs.readFileSync(path.join(root, "assets/js/investment-workspace.js"), "utf8");
const shell = require(path.join(root, "assets/js/shell.js"));

test("primary nav has exactly 7 primary destinations and Analysis is not one of them", () => {
  assert.equal(shell.CANONICAL_PRIMARY_NAV.length, 7);
  assert.ok(!shell.CANONICAL_PRIMARY_NAV.some((item) => item.id === "analysis"));
});

test("analysis.html redirects to investment-workspace.html?view=analysis, preserving other query params and hash", () => {
  assert.doesNotMatch(analysisHtml, /<meta http-equiv="refresh"/);
  assert.match(analysisHtml, /window\.location\.replace\("investment-workspace\.html\?" \+ params\.toString\(\) \+ hash\)/);

  // Reproduce analysis.html's own inline redirect logic (URLSearchParams-based, not naive string
  // concatenation, since it must inject view=analysis without breaking an existing ?ticker=).
  function simulateAnalysisRedirect(search, hash) {
    const params = new URLSearchParams(search || "");
    params.set("view", "analysis");
    return "investment-workspace.html?" + params.toString() + (hash || "");
  }
  assert.equal(simulateAnalysisRedirect("", ""), "investment-workspace.html?view=analysis");
  // ticker was already in the query string, so URLSearchParams.set("view", ...) appends view
  // after it rather than reordering -- param order is irrelevant to investment-workspace.js,
  // which reads each key independently via URLSearchParams(...).get(...).
  assert.equal(simulateAnalysisRedirect("?ticker=HPG", ""), "investment-workspace.html?ticker=HPG&view=analysis");
  assert.equal(simulateAnalysisRedirect("?ticker=HPG", "#lineage"), "investment-workspace.html?ticker=HPG&view=analysis#lineage");
});

test("Workspace declares exactly three internal views with opportunities as the default", () => {
  const viewIds = [...wsHtml.matchAll(/id="ws-view-([a-z]+)"/g)].map((m) => m[1]);
  assert.deepEqual(viewIds.sort(), ["analysis", "opportunities", "watchlist"]);
  // Only the default view starts visible; the other two start hidden until a tab or ?view= selects them.
  assert.match(wsHtml, /id="ws-view-opportunities" data-ws-view role="tabpanel">/);
  assert.match(wsHtml, /id="ws-view-analysis" data-ws-view role="tabpanel" hidden>/);
  assert.match(wsHtml, /id="ws-view-watchlist" data-ws-view role="tabpanel" hidden>/);
  assert.match(wsJs, /new URLSearchParams\(window\.location\.search\)\.get\("view"\)/);
  assert.match(wsJs, /VALID_VIEWS = \["opportunities", "analysis", "watchlist"\]/);
});

test("exactly one primary Workspace data fetch feeds all three views and one selected-ticker state", () => {
  const fetchCalls = wsJs.match(/fetch\(DATA_URL/g) || [];
  assert.equal(fetchCalls.length, 1, "expected exactly one fetch(DATA_URL) call in investment-workspace.js");
  // The opportunities/analysis views are both derived from the same WORKSPACE.cards + filter state.
  assert.match(wsJs, /function filteredTickers\(\)/);
  assert.match(wsJs, /function renderAnalysisView\(\)/);
  assert.match(wsJs, /filteredTickers\(\)\.map\(\(t\) => analysisRecord\(WORKSPACE\.cards\[t\]\)\)/);
  // One selectTicker/SELECTED_TICKER path drives the drawer regardless of which view is active.
  assert.equal((wsJs.match(/let SELECTED_TICKER/g) || []).length, 1);
});

test("watchlist is an internal Workspace view, not a standalone page", () => {
  assert.match(wsHtml, /id="ws-view-watchlist"/);
  assert.doesNotMatch(fs.readFileSync(path.join(root, "assets/js/shell.js"), "utf8"), /watchlist\.html/);
  assert.ok(!fs.existsSync(path.join(root, "watchlist.html")));
});

test("the drawer is the sole normal-screen ticker detail surface; the in-page card is print-only", () => {
  const sectionTag = wsHtml.match(/<section[^>]*id="decision-card-section"[^>]*>/)[0];
  assert.match(sectionTag, /class="[^"]*\bd-none\b[^"]*\bd-print-block\b[^"]*"/);
  assert.doesNotMatch(wsHtml, /<details[^>]*id="decision-card-section"/);
  assert.match(wsJs, /renderDecisionCard\(card, drawerEl, cardOpts\);\s*\n\s*if \(inPageEl\) renderDecisionCard\(card, inPageEl, cardOpts\);/);
});

test("data, methodology and portfolio-risk are progressive disclosure, not standalone cards", () => {
  assert.match(wsHtml, /<details id="section-data-methodology"/);
  assert.doesNotMatch(wsHtml, /<details id="section-portfolio-risk"/);
  assert.doesNotMatch(wsHtml, /<details id="section-lineage"/);
  assert.doesNotMatch(wsHtml, /<details id="section-data-gaps"/);
});

test("no universal score is computed or rendered anywhere in the Workspace", () => {
  assert.doesNotMatch(wsJs, /universal_?score|composite_?score|overall_?score/i);
  assert.doesNotMatch(wsHtml + wsJs, /\bscore\s*[:=]\s*\d/i);
});

test("Screener and Signals still deep-link into the Workspace by ticker", () => {
  const screenerJs = fs.readFileSync(path.join(root, "screener.html"), "utf8");
  const signalsJs = fs.readFileSync(path.join(root, "assets/js/signals-product.js"), "utf8");
  assert.match(screenerJs, /investment-workspace\.html\?ticker=/);
  assert.match(signalsJs, /investment-workspace\.html\?ticker=/);
});

test("decision-cockpit.html?ticker= still round-trips through the Workspace redirect chain", () => {
  const dcHtml = fs.readFileSync(path.join(root, "decision-cockpit.html"), "utf8");
  assert.match(dcHtml, /window\.location\.replace\("investment-workspace\.html" \+ search \+ hash\)/);
});
