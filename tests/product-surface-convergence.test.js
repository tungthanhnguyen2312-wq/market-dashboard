"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const root = path.resolve(__dirname, "..");
const workspace = JSON.parse(fs.readFileSync(path.join(root, "data", "investment_decision_workspace.json"), "utf8"));
const signals = require(path.join(root, "assets", "js", "signals-product.js"));
const workspaceApi = require(path.join(root, "assets", "js", "investment-workspace.js"));

// The old standalone analysis.html + assets/js/analysis-product.js were retired into the Phân
// tích view of investment-workspace.html; analysisRows/analysisRecord now live in
// assets/js/investment-workspace.js and are exercised here instead.
test("Phân tích view uses the current workspace artifact and has a real retained corpus", () => {
  assert.equal(workspace.schema_version, workspaceApi.SCHEMA_VERSION);
  const rows = workspaceApi.analysisRows(workspace);
  assert.equal(rows.length, 1699);
  assert.ok(rows.some((row) => row.stance === "INITIATE_RESEARCH_CANDIDATE"));
  assert.ok(Object.values(workspace.cards).some((c) => workspaceApi.hasStaleAxis(c)));
  const source = fs.readFileSync(path.join(root, "investment-workspace.html"), "utf8") + fs.readFileSync(path.join(root, "assets", "js", "investment-workspace.js"), "utf8");
  assert.match(source, /investment_decision_workspace/);
  assert.doesNotMatch(source, /analysis_latest\.json/);
  assert.doesNotMatch(source, /0-100|weighted investment ranking/i);
  // The retired analysis-product.js conflictReasons() heuristic must not have resurfaced.
  assert.doesNotMatch(source, /conflictReasons/);
});

test("Phân tích rows are derived and never mutate the retained workspace cards", () => {
  const before = JSON.stringify(workspace.cards);
  const rows = workspaceApi.analysisRows(workspace);
  const filtered = rows.filter((row) => row.stance === "WAIT_FOR_CONFIRMATION");
  assert.ok(filtered.length > 0);
  assert.equal(JSON.stringify(workspace.cards), before);
});

test("Signals renders Tactical V2 without optional candle sidecars", () => {
  const rows = signals.records(workspace);
  assert.equal(rows.length, 1699);
  assert.ok(rows.some((row) => signals.cohortStates.includes(row.state)));
  assert.ok(rows.some((row) => row.confirmation !== row.trigger));
  assert.ok(rows.some((row) => row.invalidation !== "UNAVAILABLE"));
  assert.equal(signals.actionLabel("BUY_ON_CONFIRMATION"), "CONDITIONAL_RESEARCH_STATE");
  const source = fs.readFileSync(path.join(root, "signals.html"), "utf8") + fs.readFileSync(path.join(root, "assets", "js", "signals-product.js"), "utf8");
  assert.match(source, /OPTIONAL_CANDLE_SIGNAL_SIDECAR_UNAVAILABLE/);
  assert.match(source, /Chưa có dữ liệu mẫu hình nến phù hợp cho phiên hiện tại/);
  assert.match(source, /investment-workspace\.html\?ticker=/);
  const html = signals.renderRowHtml(rows.find((row) => row.ticker === "HPG") || rows[0]);
  assert.match(html, /data-state="/);
  assert.doesNotMatch(html.replace(/<[^>]+>/g, " "), /WAIT_FOR_CONFIRMATION|SELLING_PRESSURE_EASING|NOT_AVAILABLE/);
});

test("main product pages expose valid Workspace and Portfolio navigation", () => {
  for (const page of ["dashboard.html", "screener.html", "signals.html", "investment-workspace.html", "portfolio.html", "about.html"]) {
    const source = fs.readFileSync(path.join(root, page), "utf8");
    assert.match(source, /investment-workspace\.html/);
    assert.match(source, /portfolio\.html/);
  }
  assert.match(fs.readFileSync(path.join(root, "assets", "js", "investment-workspace.js"), "utf8"), /URLSearchParams/);
});

test("single-topbar product surfaces retain navigation on mobile without duplicating a drawer", () => {
  const shell = fs.readFileSync(path.join(root, "assets", "css", "shell.css"), "utf8");
  assert.match(shell, /\.vs-shell:not\(:has\(\.vs-sidebar\)\) \.vs-topbar-nav\s*\{\s*display:\s*flex/);
  for (const page of ["signals.html", "investment-workspace.html", "portfolio.html", "about.html"]) {
    const html = fs.readFileSync(path.join(root, page), "utf8");
    assert.match(html, /class="vs-topbar-nav"/);
    assert.doesNotMatch(html, /class="vs-sidebar"/);
  }
});

test("Workspace deep links select the requested retained ticker, default to HPG when unrequested, and reject an unknown ticker without HPG substitution", () => {
  const tickers = Object.keys(workspace.cards).sort();
  assert.equal(workspaceApi.selectedTickerForDeepLink(tickers, "HPG"), "HPG");
  assert.equal(workspaceApi.selectedTickerForDeepLink(tickers, "hpg"), "HPG");
  assert.equal(workspaceApi.selectedTickerForDeepLink(tickers, ""), "HPG");
  assert.equal(workspaceApi.selectedTickerForDeepLink(tickers, "NOT-A-TICKER"), null);
});

test("the retained workspace contract keeps its no-score authority boundary", () => {
  assert.equal(workspace.authority_boundary.is_actionable, false);
  assert.equal(workspace.blocked_outputs.universal_score, "SCORING_PROHIBITED");
  assert.equal(workspace.blocked_outputs.ordinal_rank, "RANKING_PROHIBITED");
});
