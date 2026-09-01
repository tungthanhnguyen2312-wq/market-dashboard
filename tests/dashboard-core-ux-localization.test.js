"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const root = path.resolve(__dirname, "..");
const vf = require(path.join(root, "assets/js/value-format.js"));
const overview = require(path.join(root, "assets/js/dashboard-product-summary.js"));
const analysis = require(path.join(root, "assets/js/analysis-product.js"));
const ws = require(path.join(root, "assets/js/investment-workspace.js"));

const dashboardHtml = fs.readFileSync(path.join(root, "dashboard.html"), "utf8");
const analysisHtml = fs.readFileSync(path.join(root, "analysis.html"), "utf8");
const workspaceHtml = fs.readFileSync(path.join(root, "investment-workspace.html"), "utf8");
const projection = JSON.parse(fs.readFileSync(path.join(root, "data/screener_master_projection.json"), "utf8"));
const workspace = JSON.parse(fs.readFileSync(path.join(root, "data/investment_decision_workspace.json"), "utf8"));

function visibleText(html) {
  return String(html || "")
    .replace(/<pre[\s\S]*?<\/pre>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-z]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const STANCES = [
  "INITIATE_RESEARCH_CANDIDATE",
  "ACCUMULATE_RESEARCH_CANDIDATE",
  "WAIT_FOR_CONFIRMATION",
  "HIGH_RISK_SPECULATION_ONLY",
  "AVOID_NEW_ENTRY",
  "INSUFFICIENT_EVIDENCE",
];
const TACTICAL = [
  "DOWNTREND",
  "SELLING_PRESSURE_EASING",
  "UPTREND_CONFIRMED",
  "EARLY_REVERSAL_CANDIDATE",
  "BREAKDOWN_RISK",
  "SIDEWAYS_NEUTRAL",
  "DISTRIBUTION_RISK",
  "BASE_BUILDING",
  "BREAKOUT_READY",
];

test("all current stance enums are translated and raw values stay unchanged", () => {
  for (const stance of STANCES) {
    const formatted = vf.formatDomainState(stance, "research_stance");
    assert.equal(formatted.raw, stance);
    assert.ok(formatted.known, `missing translation for ${stance}`);
    assert.notEqual(formatted.label, stance);
    assert.doesNotMatch(formatted.label, /_/);
    assert.doesNotMatch(formatted.label, /Mua ngay|Nên mua/i);
  }
  assert.equal(vf.formatResearchStance("INITIATE_RESEARCH_CANDIDATE"), "Ứng viên nghiên cứu mở vị thế");
  assert.equal(vf.formatResearchStance("ACCUMULATE_RESEARCH_CANDIDATE"), "Ứng viên nghiên cứu tích lũy");
});

test("all nine current tactical states are translated", () => {
  for (const state of TACTICAL) {
    const formatted = vf.formatDomainState(state, "tactical_state");
    assert.equal(formatted.raw, state);
    assert.ok(formatted.known, `missing tactical translation for ${state}`);
    assert.equal(vf.formatTacticalState(state), formatted.label);
  }
  assert.equal(vf.formatTacticalState("SELLING_PRESSURE_EASING"), "Áp lực bán đang hạ nhiệt");
  assert.equal(vf.formatTacticalState("UPTREND_CONFIRMED"), "Xu hướng tăng đã xác nhận");
});

test("entity, data, and freshness states are translated without strengthening authority", () => {
  assert.equal(vf.formatEntityType("corporate"), "Doanh nghiệp");
  assert.equal(vf.formatEntityType("bank"), "Ngân hàng");
  assert.equal(vf.formatEntityType("securities"), "Chứng khoán");
  assert.equal(vf.formatEntityType("insurance"), "Bảo hiểm");
  assert.equal(vf.formatEntityType("finance_company"), "Công ty tài chính");
  assert.equal(vf.formatFreshness("CURRENT"), "Hiện tại");
  assert.equal(vf.formatFreshness("STALE_AXIS_PRESENT"), "Có trục dữ liệu đã cũ");
  assert.equal(vf.formatFreshness("STALE_BUT_RESEARCH_USABLE"), "Cũ nhưng còn dùng cho nghiên cứu");
  assert.equal(vf.formatLiquidityState("LIQUIDITY_RESEARCH_PROXY"), "Thanh khoản nghiên cứu");
  assert.equal(vf.formatLiquidityState("EXECUTION_CAPACITY_EXACT_BLOCKED"), "Chưa đủ dữ liệu cho năng lực thực hiện lệnh chính xác");
  assert.equal(vf.formatDomainState("RESEARCH_PROXY", "data_fitness").label, "Dữ liệu nghiên cứu");
  assert.equal(vf.formatDomainState("QUALIFIED_CLASSIFICATION", "data_fitness").label, "Phân loại đã xác nhận");
  assert.doesNotMatch(vf.formatConfirmationState("READY"), /Mua|Nên mua/i);
  assert.doesNotMatch(vf.formatLiquidityState("RESEARCH_PROXY"), /Chính xác/i);
});

test("localized select option text retains raw option.value", () => {
  const spec = analysis.optionSpec("WAIT_FOR_CONFIRMATION", "research_stance");
  assert.equal(spec.value, "WAIT_FOR_CONFIRMATION");
  assert.equal(spec.text, "Chờ xác nhận");
  const tactical = analysis.optionSpec("BASE_BUILDING", "tactical_state");
  assert.equal(tactical.value, "BASE_BUILDING");
  assert.equal(tactical.text, "Đang tạo nền");
});

test("analysis renderer visible text has no raw stance/tactical enums", () => {
  const row = analysis.record(workspace.cards.HPG || Object.values(workspace.cards)[0]);
  const html = analysis.renderRowHtml(row);
  const visible = visibleText(html);
  for (const raw of STANCES.concat(TACTICAL)) {
    assert.doesNotMatch(visible, new RegExp(raw));
  }
  assert.match(html, /data-state="/);
  assert.equal(row.stance, workspace.cards[row.ticker].research_stance);
});

test("workspace renderer visible text has no raw primary enums", () => {
  const card = workspace.cards.HPG;
  const html = ws.decisionCardHtml(card, { ticker: "HPG" });
  const visible = visibleText(html);
  for (const raw of ["WAIT_FOR_CONFIRMATION", "SELLING_PRESSURE_EASING", "LIQUIDITY_RESEARCH_PROXY", "ATTRACTIVE_RELATIVE_RESEARCH", "STALE_AXIS_PRESENT"]) {
    assert.doesNotMatch(visible, new RegExp(raw));
  }
  assert.match(html, /data-state="WAIT_FOR_CONFIRMATION"/);
  assert.match(html, /Chờ xác nhận/);
  assert.match(html, /Không phải tín hiệu mua|Tư thế nghiên cứu/);
  assert.doesNotMatch(visible, /NOT A BUY SIGNAL/);
});

test("workspace filters still test raw enums and display Vietnamese labels", () => {
  const initiate = ws.FILTERS.find((item) => item.id === "initiate");
  assert.equal(initiate.test({ research_stance: "INITIATE_RESEARCH_CANDIDATE" }), true);
  assert.match(initiate.label, /mở vị thế/i);
  assert.doesNotMatch(JSON.stringify(ws.FILTERS.map((item) => item.label)), /INITIATE_RESEARCH_CANDIDATE/);
});

test("missing metric is never rendered as numeric zero and legacy KPIs are gone", () => {
  assert.doesNotMatch(dashboardHtml, /Breadth\s*>\s*MA200/);
  assert.doesNotMatch(dashboardHtml, /% mã trên MA200 theo ngành/);
  assert.doesNotMatch(dashboardHtml, /Cấu trúc UP/);
  assert.doesNotMatch(dashboardHtml, /GTGD20\s*≥\s*50/);
  assert.doesNotMatch(dashboardHtml, /id="kpi-breadth"/);
  assert.doesNotMatch(dashboardHtml, /id="kpi-structure"/);
  assert.doesNotMatch(dashboardHtml, /id="kpi-liquidity"/);
  assert.doesNotMatch(dashboardHtml, /id="chart-structure"/);

  const empty = overview.summarizeScreenerOverview({ cards: {}, contract_version: overview.SCREENER_CONTRACT });
  assert.equal(empty.session_breadth.available, false);
  assert.equal(empty.session_breadth.up, 0);
  assert.equal(overview.coverageText(0, 0, false).text, "Chưa có dữ liệu hiện tại");
  assert.equal(overview.coverageText(0, 0, false).count, null);
  assert.ok(overview.missingMetricNeverZero({ available: false, count: null }));

  const noPrice = overview.summarizeScreenerOverview({
    contract_version: overview.SCREENER_CONTRACT,
    as_of_session: "2026-08-28",
    cards: {
      AAA: { research: { stance: "WAIT_FOR_CONFIRMATION" }, price: { change_pct_status: "UNKNOWN" }, tactical: { status: "UNKNOWN" }, liquidity: {}, sector: { status: "UNKNOWN" } },
    },
  });
  assert.equal(noPrice.session_breadth.available, false);
  assert.equal(noPrice.tactical.available, false);
  const summaryHtml = overview.renderDecisionSummaryHtml(noPrice);
  assert.doesNotMatch(visibleText(summaryHtml), /0 \/ 0/);
});

test("overview uses current projection facts with explicit denominators", () => {
  const summary = overview.summarizeScreenerOverview(projection);
  assert.equal(summary.denominator, 1683);
  assert.equal(summary.session_breadth.available, true);
  assert.equal(summary.session_breadth.priced, 942);
  assert.equal(summary.session_breadth.up + summary.session_breadth.down + summary.session_breadth.flat, 942);
  assert.equal(summary.session_breadth.unpriced, 741);
  assert.equal(summary.tactical.coverage, 942);
  assert.equal(summary.liquidity.proxy_count, 935);
  assert.equal(summary.liquidity.execution_exact_established, false);
  assert.ok(summary.sector.available);
  assert.ok(summary.sector.rows.some((row) => row.label === "Tài nguyên Cơ bản"));
  assert.ok(!summary.sector.rows.some((row) => ["corporate", "bank", "securities"].includes(String(row.label).toLowerCase())));
  assert.equal(summary.research_stance.counts.WAIT_FOR_CONFIRMATION, 886);
  const html = overview.renderDecisionSummaryHtml(summary);
  assert.match(html, /Quyết định nghiên cứu hiện tại|Phiên 2026-08-28/);
  assert.match(html, /Mở Không gian quyết định/);
  assert.match(html, /Phân tích đa trục/);
  assert.match(html, /Bộ lọc thị trường/);
  assert.doesNotMatch(html, /Xem Tactical V2/);
  assert.doesNotMatch(visibleText(html), /WAIT_FOR_CONFIRMATION/);
});

test("research stance remains distinct from execution instruction", () => {
  assert.match(analysisHtml, /Tư thế nghiên cứu không phải lệnh thực hiện/);
  assert.match(workspaceHtml, /không phải lệnh thực hiện/i);
  assert.match(dashboardHtml, /Quyết định nghiên cứu hiện tại/);
  assert.doesNotMatch(vf.formatResearchStance("INITIATE_RESEARCH_CANDIDATE"), /Mua|Khuyến nghị mua/i);
  assert.doesNotMatch(overview.renderDecisionSummaryHtml(overview.summarizeScreenerOverview(projection)), /vs-btn-primary[^>]*>Mua/);
});

test("analysis page chrome is Vietnamese", () => {
  assert.match(analysisHtml, /So sánh nghiên cứu/);
  assert.match(analysisHtml, /Mọi tư thế nghiên cứu/);
  assert.match(analysisHtml, /Mọi trạng thái kỹ thuật/);
  assert.match(analysisHtml, /Nền tảng doanh nghiệp/);
  assert.match(analysisHtml, /Định giá \/ phương pháp/);
  assert.match(analysisHtml, /Điều kiện vô hiệu/);
  assert.match(analysisHtml, /Độ mới dữ liệu/);
  assert.doesNotMatch(analysisHtml, /Research comparison/);
});
