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
const workspaceProjection = JSON.parse(fs.readFileSync(path.join(root, "data/investment_decision_workspace.json"), "utf8"));
const dashboardHtml = fs.readFileSync(path.join(root, "dashboard.html"), "utf8");
const screenerHtml = fs.readFileSync(path.join(root, "screener.html"), "utf8");
const workspaceScript = fs.readFileSync(path.join(root, "assets/js/investment-workspace.js"), "utf8");
const legacyDashboardScript = fs.readFileSync(path.join(root, "app.js"), "utf8");

test("scope formatter distinguishes reference, current-research, price, and tactical counts", () => {
  assert.equal(scope.formatReferenceScope(1683), "Phạm vi tham chiếu: 1.683 mã");
  assert.equal(scope.formatProductScope(1683), "Phạm vi sản phẩm: 1.683 mã");
  assert.equal(scope.formatCoverage({ available: 952, reference: 1683, label: "có dữ liệu giá đúng phiên" }), "952 / 1.683 mã tham chiếu có dữ liệu giá đúng phiên");
  assert.equal(scope.formatCoverage({ available: 951, reference: 1683, label: "có trạng thái kỹ thuật" }), "951 / 1.683 mã tham chiếu có trạng thái kỹ thuật");
  assert.deepEqual(scope.normalizeScopeCounts({ reference_count: 1683, price_available_count: 952, tactical_available_count: 951 }), {
    reference_ticker_count: 1683, current_research_scope_count: null, price_available_count: 952, tactical_available_count: 951,
  });
  assert.deepEqual(scope.formatScopeSummary({ reference_count: 1683, current_research_scope_count: 1504 }), [
    "Phạm vi tham chiếu: 1.683 mã", "Phạm vi nghiên cứu hiện tại: 1.504 mã",
  ]);
});

test("released summary states reference scope and exact price/tactical coverage without inventing research scope", () => {
  const summary = overview.summarizeScreenerOverview(projection);
  assert.equal(summary.reference_ticker_count, 1683);
  assert.equal(summary.current_research_scope_count, null);
  assert.equal(summary.price_available_count, 952);
  assert.equal(summary.tactical_available_count, 951);
  assert.equal(summary.session_breadth.priced, 951);
  assert.equal(summary.session_breadth.price_available, 952);
  assert.equal(summary.session_breadth.missing_session_return, 1);
  const html = overview.renderDecisionSummaryHtml(summary);
  assert.match(html, /Phạm vi tham chiếu: 1\.683 mã/);
  assert.match(html, /952 \/ 1\.683 mã tham chiếu có dữ liệu giá đúng phiên/);
  assert.match(html, /951 \/ 1\.683 mã tham chiếu có trạng thái kỹ thuật/);
  assert.doesNotMatch(html, /Phạm vi nghiên cứu hiện tại/);
  assert.doesNotMatch(html, /1504/);
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
    assert.match(workspace.renderDecisionCard(workspaceProjection.cards[ticker], null, { ticker }), new RegExp(`data-decision-ticker="${ticker}"`));
  }
  assert.equal(workspace.selectedTickerForDeepLink(Object.keys(workspaceProjection.cards), "UNKNOWN"), null);
  assert.match(workspaceScript, /select\.selectedIndex = -1/);
  assert.match(workspaceScript, /Không chọn mã thay thế/);
});
