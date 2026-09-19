"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const root = path.resolve(__dirname, "..");
const scope = require("../assets/js/product-scope-format.js");
const overview = require("../assets/js/dashboard-product-summary.js");
const screener = require("../assets/js/screener-master.js");
const workspace = require("../assets/js/investment-workspace.js");
const projection = JSON.parse(fs.readFileSync(path.join(root, "data/screener_master_projection.json"), "utf8"));
const workspaceProjection = JSON.parse(fs.readFileSync(path.join(root, "data/workspace_index.json"), "utf8"));
function fullWorkspaceCard(ticker) {
  const thin = workspaceProjection.cards[ticker];
  if (!thin) return null;
  const shard = JSON.parse(fs.readFileSync(
    path.join(root, "data/workspace_detail", `${thin.detail_shard}.json`), "utf8",
  ));
  return shard.tickers[ticker] || null;
}
const dashboardHtml = fs.readFileSync(path.join(root, "dashboard.html"), "utf8");
const screenerHtml = fs.readFileSync(path.join(root, "screener.html"), "utf8");
const aboutHtml = fs.readFileSync(path.join(root, "about.html"), "utf8");
const workspaceScript = fs.readFileSync(path.join(root, "assets/js/investment-workspace.js"), "utf8");
const screenerMasterScript = fs.readFileSync(path.join(root, "assets/js/screener-master.js"), "utf8");
const productScopeFormatScript = fs.readFileSync(path.join(root, "assets/js/product-scope-format.js"), "utf8");
const dashboardProductSummaryScript = fs.readFileSync(path.join(root, "assets/js/dashboard-product-summary.js"), "utf8");
const legacyDashboardScript = fs.readFileSync(path.join(root, "app.js"), "utf8");

// Real data/screener_master_projection.json for this checkout is the qualified 2026-09-15
// official-scope replay (reference 1683 / official scope 1504 / outside 179). These tests assert
// against the artifact's OWN published counts, never a value re-derived client-side, so they stay
// correct for any future session the Producer supplies under the same contract.
const officialScope = projection.official_scope_coverage;

test("scope formatter distinguishes reference, current-research, price, and tactical counts", () => {
  assert.equal(scope.formatReferenceScope(1683), "Phạm vi tham chiếu: 1.683 mã");
  assert.equal(scope.formatProductScope(1683), "Phạm vi sản phẩm: 1.683 mã");
  assert.equal(scope.formatCoverage({ available: 952, reference: 1683, label: "có dữ liệu giá đúng phiên" }), "952 / 1.683 mã tham chiếu có dữ liệu giá đúng phiên");
  assert.equal(scope.formatCoverage({ available: 951, reference: 1683, label: "có trạng thái kỹ thuật" }), "951 / 1.683 mã tham chiếu có trạng thái kỹ thuật");
  assert.deepEqual(scope.normalizeScopeCounts({ reference_count: 1683, price_available_count: 952, tactical_available_count: 951 }), {
    reference_ticker_count: 1683, current_research_scope_count: null,
    outside_current_official_scope_count: null, current_official_scope_unknown_count: null,
    price_available_count: 952, price_unavailable_count: null,
    tactical_available_count: 951, tactical_unavailable_count: null,
    official_scope_observed_at: null,
  });
  assert.deepEqual(scope.formatScopeSummary({ reference_count: 1683, current_research_scope_count: 1504 }), [
    "Phạm vi tham chiếu: 1.683 mã", "Phạm vi nghiên cứu hiện tại: 1.504 mã",
  ]);
});

test("formatOfficialResearchScope/formatOutsideOfficialScope: real counts and missing scope", () => {
  assert.equal(scope.formatOfficialResearchScope(1504), "Phạm vi nghiên cứu chính thức hiện tại: 1.504 mã");
  assert.equal(scope.formatOutsideOfficialScope(179), "Ngoài phạm vi chính thức hiện tại: 179 mã");
  // Missing/unpublished scope renders the em-dash placeholder (same formatCount() convention
  // every other scope formatter already uses), never a stale number.
  assert.equal(scope.formatOfficialResearchScope(undefined), "Phạm vi nghiên cứu chính thức hiện tại: — mã");
  assert.equal(scope.formatOutsideOfficialScope(undefined), "Ngoài phạm vi chính thức hiện tại: — mã");
});

test("real official_scope_coverage artifact publishes 1683 / 1504 / 179 and is temporally eligible for its own session", () => {
  assert.ok(officialScope, "screener_master_projection.json must publish official_scope_coverage");
  assert.equal(officialScope.temporally_eligible, true);
  assert.equal(officialScope.research_session, projection.as_of_session);
  assert.equal(officialScope.reference_denominator, 1683);
  assert.equal(officialScope.current_official_research_scope_count, 1504);
  assert.equal(officialScope.outside_current_official_scope_count, 179);
  // 1. reference count remains 1683 regardless of scope narrowing.
  assert.equal(Object.keys(projection.cards).length, 1683);
  assert.equal(projection.denominator.ticker_count, 1683);
  // 10. official-only excluded names never widen the 1683 reference population.
  assert.notEqual(Object.keys(projection.cards).length, 1683 + 20);
});

test("released summary states reference scope, official research scope, and exact price/tactical coverage from real data", () => {
  const summary = overview.summarizeScreenerOverview(projection);
  // 1 & 2: reference stays 1683; official research scope displays the real 1504.
  assert.equal(summary.reference_ticker_count, 1683);
  assert.equal(summary.current_research_scope_count, 1504);
  // 3: outside scope displays the real 179.
  assert.equal(summary.outside_current_official_scope_count, 179);
  const cards = Object.values(projection.cards);
  const retainedPriceCount = cards.filter((card) => card.price && card.price.status === "PRICE_AVAILABLE").length;
  const retainedTacticalCount = cards.filter((card) => card.tactical && card.tactical.status === "AVAILABLE" && card.tactical.entry_state).length;
  assert.equal(summary.price_available_count, retainedPriceCount);
  assert.equal(summary.price_unavailable_count, 1683 - retainedPriceCount);
  assert.equal(summary.tactical_available_count, retainedTacticalCount);
  const html = overview.renderDecisionSummaryHtml(summary);
  assert.match(html, /Phạm vi tham chiếu: 1\.683 mã/);
  assert.match(html, /Phạm vi nghiên cứu chính thức hiện tại: 1\.504 mã/);
  assert.match(html, /Ngoài phạm vi chính thức hiện tại: 179 mã/);
  // 5: price/tactical coverage always denominates against the 1683 reference, never the 1504
  // official scope subset.
  assert.match(html, new RegExp(`${retainedPriceCount.toLocaleString("vi-VN")} \\/ 1\\.683 mã tham chiếu có dữ liệu giá đúng phiên`));
  assert.match(html, new RegExp(`${retainedTacticalCount.toLocaleString("vi-VN")} \\/ 1\\.683 mã tham chiếu có trạng thái kỹ thuật`));
  assert.doesNotMatch(html, new RegExp(`${retainedPriceCount.toLocaleString("vi-VN")} \\/ 1\\.504`));
  // 4: 1504 is never labeled active/tradable in any of the required-forbidden phrasings.
  assert.doesNotMatch(html, /1\.504 mã đang giao dịch/);
  assert.doesNotMatch(html, /1504 active stocks/i);
  assert.doesNotMatch(html, /1504 tradable stocks/i);
  assert.doesNotMatch(html, /1\.504 mã có giá/);
});

test("absent or session-mismatched scope metadata renders UNKNOWN/not-published, never a fabricated number", () => {
  const noScopeProjection = { ...projection, official_scope_coverage: null };
  const noScopeSummary = overview.summarizeScreenerOverview(noScopeProjection);
  assert.equal(noScopeSummary.current_research_scope_count, null);
  assert.equal(noScopeSummary.outside_current_official_scope_count, null);
  const noScopeHtml = overview.renderDecisionSummaryHtml(noScopeSummary);
  assert.doesNotMatch(noScopeHtml, /Phạm vi nghiên cứu chính thức/);
  assert.doesNotMatch(noScopeHtml, /1\.504/);

  // 8: a scope block whose own research_session does not match the artifact's as_of_session (or
  // that is not temporally eligible) must not render as current -- this is a structural guard,
  // not just a real-data coincidence: an artifact publishing a stale/foreign scope block must
  // degrade exactly like a missing one.
  const mismatchedProjection = { ...projection, official_scope_coverage: { ...officialScope, research_session: "2099-01-01" } };
  const mismatchedSummary = overview.summarizeScreenerOverview(mismatchedProjection);
  assert.equal(mismatchedSummary.current_research_scope_count, null);
  assert.equal(mismatchedSummary.outside_current_official_scope_count, null);

  const ineligibleProjection = { ...projection, official_scope_coverage: { ...officialScope, temporally_eligible: false } };
  const ineligibleSummary = overview.summarizeScreenerOverview(ineligibleProjection);
  assert.equal(ineligibleSummary.current_research_scope_count, null);
});

test("1504 is never hardcoded in HTML/business logic source -- always derived from the Producer artifact", () => {
  const liveSources = [dashboardHtml, screenerHtml, workspaceScript, screenerMasterScript, productScopeFormatScript, dashboardProductSummaryScript, legacyDashboardScript];
  for (const source of liveSources) {
    assert.doesNotMatch(source, /1[.,]?504/);
    assert.doesNotMatch(source, /\b179\b/);
  }
  // About.html is static methodology prose (no live data binding on that page at all -- see its
  // own test coverage below) and is explicitly required to explain what the real counts mean;
  // that literal prose is documentation, not application logic re-deriving a live number.
  assert.match(aboutHtml, /1\.683/);
  assert.match(aboutHtml, /1\.504/);
  assert.match(aboutHtml, /179/);
});

test("outside-scope rows remain visible on Screener and Workspace with the exact Producer reason, never a blanket DELISTED label", () => {
  const outsideTickers = Object.keys(projection.cards).filter(
    (ticker) => (projection.cards[ticker].official_research_scope || {}).scope_bucket === "OUTSIDE_CURRENT_OFFICIAL_RESEARCH_SCOPE"
  );
  assert.equal(outsideTickers.length, 179);
  const sample = outsideTickers[0];
  assert.ok(projection.cards[sample], `${sample} Screener row remains present`);
  assert.ok(workspaceProjection.cards[sample], `${sample} Workspace card remains present`);
  const outsideScope = projection.cards[sample].official_research_scope;
  assert.notEqual(outsideScope.current_research_scope_reason, undefined);
  // Missing price/tactical for an outside-scope ticker must render as explicitly unavailable, not
  // as a flat 0%/neutral state.
  assert.equal(projection.cards[sample].price.status, "PRICE_UNAVAILABLE");
  assert.notEqual(projection.cards[sample].price.change_pct_status, "AVAILABLE");
  // Not every outside-scope ticker carries the same reason: the real 2026-09-15 data is a
  // 173/6 split between DELISTED_OR_NO_LONGER_CURRENT and UNRESOLVED, proving the UI must not
  // collapse the whole cohort to one blanket "DELISTED" label.
  const reasons = new Set(outsideTickers.map((t) => projection.cards[t].official_research_scope.current_research_scope_reason));
  assert.ok(reasons.has("DELISTED_OR_NO_LONGER_CURRENT"));
  assert.ok(reasons.has("UNRESOLVED"));
});

test("in-scope watchlist tickers are current official research members and keep their own price/tactical state", () => {
  for (const ticker of ["HPG", "FPT", "SSI", "VCB", "PAN", "PNJ", "PVD", "QNS", "VNM", "EVF", "POW", "NVL"]) {
    const card = projection.cards[ticker];
    assert.ok(card, `${ticker} Screener row exists`);
    assert.equal(card.official_research_scope.scope_bucket, "IN_CURRENT_OFFICIAL_RESEARCH_SCOPE", ticker);
    const wsCard = workspaceProjection.cards[ticker];
    assert.ok(wsCard, `${ticker} Workspace card exists`);
    assert.equal(wsCard.official_research_scope.scope_bucket, "IN_CURRENT_OFFICIAL_RESEARCH_SCOPE", ticker);
    // No decision-policy field was mutated by adding scope: research_stance/entry_state remain
    // whatever the workspace/tactical/decision engines already computed.
    assert.ok("research_stance" in wsCard);
  }
});

test("Screener exposes a real per-row official-scope filter/column reusing the existing formatter, no client-side membership recomputation", () => {
  assert.match(screenerHtml, /screen-official-scope/);
  assert.match(screenerHtml, /Phạm vi chính thức/);
  assert.match(screenerHtml, /formatOfficialScope/);
  const inScope = screener.formatOfficialScope(projection.cards.HPG.official_research_scope);
  assert.equal(inScope.bucket, "IN_CURRENT_OFFICIAL_RESEARCH_SCOPE");
  const outsideSample = Object.keys(projection.cards).find(
    (t) => (projection.cards[t].official_research_scope || {}).scope_bucket === "OUTSIDE_CURRENT_OFFICIAL_RESEARCH_SCOPE"
  );
  const outside = screener.formatOfficialScope(projection.cards[outsideSample].official_research_scope);
  assert.equal(outside.bucket, "OUTSIDE_CURRENT_OFFICIAL_RESEARCH_SCOPE");
  assert.notEqual(outside.text, inScope.text);
  assert.equal(screener.matchesScreenerFilters(projection.cards.HPG, { officialScope: "IN_CURRENT_OFFICIAL_RESEARCH_SCOPE" }), true);
  assert.equal(screener.matchesScreenerFilters(projection.cards.HPG, { officialScope: "OUTSIDE_CURRENT_OFFICIAL_RESEARCH_SCOPE" }), false);
});

test("Workspace decision card surfaces the real per-ticker official-scope context", () => {
  const html = workspace.decisionCardHtml(fullWorkspaceCard("HPG"), { ticker: "HPG" });
  assert.match(html, /Phạm vi nghiên cứu chính thức/);
  assert.match(html, /data-state="IN_CURRENT_OFFICIAL_RESEARCH_SCOPE"/);
});

test("active Dashboard copy does not promote the reference denominator to market/universe authority", () => {
  const activeCopy = [dashboardHtml, screenerHtml, workspaceScript].join("\n");
  assert.match(screenerHtml, /Phạm vi tham chiếu/);
  assert.match(workspaceScript, /Phạm vi sản phẩm/);
  assert.match(legacyDashboardScript, /Bảng sàng lọc kế thừa/);
  assert.match(legacyDashboardScript, /tách biệt với phạm vi tham chiếu/);
  assert.doesNotMatch(legacyDashboardScript, /Bản phân tích chính thức/);
  assert.doesNotMatch(workspaceScript, /analysisKpi\("Phạm vi thị trường"/);
  assert.doesNotMatch(activeCopy, /active universe|tradable universe|official current universe|official listed universe/i);
  assert.match(dashboardHtml, /product-scope-format\.js/);
  assert.match(screenerHtml, /product-scope-format\.js/);
  const cockpit = fs.readFileSync(path.join(root, "assets/js/decision-cockpit.js"), "utf8");
  assert.match(cockpit, /reference: 1683/);
  assert.doesNotMatch(cockpit, /current_active_equity_denominator/);
});

test("canonical Workspace contract and four cross-surface ticker identities remain exact", () => {
  assert.equal(screener.validateWorkspaceProjection(workspaceProjection), true);
  assert.equal(screener.validateWorkspaceProjection({ ...workspaceProjection, contract_version: "investment_decision_workspace_dashboard_projection/v1" }), false);
  assert.equal(screener.validateWorkspaceProjection({ ...workspaceProjection, cards: {} }), false);
  for (const ticker of ["HPG", "FPT", "SSI", "VCB"]) {
    const identity = screener.drawerIdentity(projection.cards[ticker].ticker, ticker, workspaceProjection.cards[ticker]);
    assert.equal(identity.ok, true, ticker);
    assert.equal(workspace.selectedTickerForDeepLink(Object.keys(workspaceProjection.cards), ticker), ticker);
    assert.match(workspace.renderDecisionCard(fullWorkspaceCard(ticker), null, { ticker }), new RegExp(`data-decision-ticker="${ticker}"`));
  }
  assert.equal(workspace.selectedTickerForDeepLink(Object.keys(workspaceProjection.cards), "UNKNOWN"), null);
  assert.match(workspaceScript, /select\.selectedIndex = -1/);
  assert.match(workspaceScript, /Không chọn mã thay thế/);
});
