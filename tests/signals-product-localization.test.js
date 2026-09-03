"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const root = path.resolve(__dirname, "..");
const vf = require(path.join(root, "assets/js/value-format.js"));
const signals = require(path.join(root, "assets/js/signals-product.js"));
const cp = require(path.join(root, "assets/js/candlestick-patterns.js"));
const analysis = require(path.join(root, "assets/js/analysis-product.js"));
const ws = require(path.join(root, "assets/js/investment-workspace.js"));
const sm = require(path.join(root, "assets/js/screener-master.js"));

const html = fs.readFileSync(path.join(root, "signals.html"), "utf8");
const product = fs.readFileSync(path.join(root, "assets/js/signals-product.js"), "utf8");
const workspace = JSON.parse(fs.readFileSync(path.join(root, "data/investment_decision_workspace.json"), "utf8"));

function visibleText(markup) {
  return String(markup || "")
    .replace(/<details[\s\S]*?<\/details>/gi, (block) => {
      const match = block.match(/<summary[^>]*>([\s\S]*?)<\/summary>/i);
      return match ? ` ${match[1]} ` : " ";
    })
    .replace(/<pre[\s\S]*?<\/pre>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-z]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

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

const ENGLISH_CHROME = [
  "Tactical V2",
  "Confirmation và invalidation",
  "Tactical research table",
  "Entry state / research action",
  "Setup tags",
  "Confirmation boundary",
  "Actual trigger state",
  "Market / sector",
  "Mọi tactical state",
  "none retained",
  "ticker cards shown",
  "Open Investment Workspace for the full decision card",
  "Legacy candlestick sidecars",
];

const REGISTRY = {
  hammer: { name: "Hammer", name_vi: "Búa", description: "Râu dưới dài sau nhịp giảm.", direction: "bullish" },
  inverted_hammer: { name: "Inverted Hammer", name_vi: "Búa ngược", description: "Râu trên dài sau nhịp giảm.", direction: "bullish" },
  shooting_star: { name: "Shooting Star", name_vi: "Sao băng", description: "Râu trên dài sau nhịp tăng.", direction: "bearish" },
  morning_star: { name: "Morning Star", name_vi: "Sao Mai", description: "Ba nến đảo chiều tăng.", direction: "bullish" },
};

test("signals.html loads value-format.js before signals-product.js", () => {
  const vfIdx = html.indexOf("assets/js/value-format.js");
  const spIdx = html.indexOf("assets/js/signals-product.js");
  const cpIdx = html.indexOf("assets/js/candlestick-patterns.js");
  assert.ok(vfIdx >= 0 && spIdx > vfIdx);
  assert.ok(cpIdx > vfIdx && cpIdx < spIdx);
});

test("stance, tactical states, actions, confirmation, invalidation, and freshness are localized", () => {
  for (const state of TACTICAL) {
    const formatted = vf.formatDomainState(state, "tactical_state");
    assert.equal(formatted.raw, state);
    assert.ok(formatted.known, `missing tactical translation for ${state}`);
    assert.notEqual(formatted.label, state);
  }
  assert.equal(vf.formatResearchStance("WAIT_FOR_CONFIRMATION"), "Chờ xác nhận");
  assert.equal(vf.formatResearchStance("HIGH_RISK_SPECULATION_ONLY"), "Chỉ đầu cơ rủi ro cao");
  assert.equal(vf.formatTacticalState("SELLING_PRESSURE_EASING"), "Áp lực bán đang hạ nhiệt");
  assert.equal(vf.formatTacticalState("BREAKOUT_READY"), "Sẵn sàng bứt phá");
  assert.equal(vf.formatEntryAction("WAIT"), "Chờ");
  assert.equal(vf.formatDomainState("CONDITIONAL_RESEARCH_STATE", "research_readiness").label, "Trạng thái nghiên cứu có điều kiện");
  assert.equal(vf.formatConfirmationState("NOT_AVAILABLE"), "Chưa ghi nhận kích hoạt");
  assert.equal(vf.formatFreshness("STALE_AXIS_PRESENT"), "Có trục dữ liệu đã cũ");
  assert.equal(vf.formatDomainState("UNAVAILABLE", "research_stance").label, "Chưa có dữ liệu");
});

test("signals row renderer shows Vietnamese labels and keeps raw identity in data/title", () => {
  const row = signals.records(workspace).find((item) => item.ticker === "HPG") || signals.records(workspace)[0];
  const markup = signals.renderRowHtml(row);
  const visible = visibleText(markup);
  assert.match(markup, /data-state="/);
  assert.match(visible, /Chờ xác nhận|Áp lực bán đang hạ nhiệt|Chưa ghi nhận kích hoạt|Có trục dữ liệu đã cũ|Hiện tại/);
  for (const raw of TACTICAL.concat(["WAIT_FOR_CONFIRMATION", "NOT_AVAILABLE", "STALE_AXIS_PRESENT", "HIGH_RISK_SPECULATION_ONLY"])) {
    assert.doesNotMatch(visible, new RegExp(`\\b${raw}\\b`));
  }
});

test("filter option.value remains raw while option text is Vietnamese", () => {
  assert.equal(signals.cohortStates.includes("SELLING_PRESSURE_EASING"), true);
  assert.equal(signals.labelOf("SELLING_PRESSURE_EASING", "tactical_state"), "Áp lực bán đang hạ nhiệt");
  const row = { research_stance: "WAIT_FOR_CONFIRMATION", entry_state: "BASE_BUILDING" };
  assert.equal(row.entry_state, "BASE_BUILDING");
  assert.notEqual(signals.labelOf(row.entry_state, "tactical_state"), "BASE_BUILDING");
});

test("cohort cards and page chrome are Vietnamese, not the listed English labels", () => {
  assert.match(html, /Tín hiệu kỹ thuật V2/);
  assert.match(html, /Trạng thái kỹ thuật/);
  assert.match(html, /Bảng trạng thái kỹ thuật/);
  assert.match(html, /Tư thế nghiên cứu/);
  assert.match(html, /Trạng thái kỹ thuật \/ Hành động nghiên cứu/);
  assert.match(html, /Đặc điểm thiết lập/);
  assert.match(html, /Điều kiện xác nhận/);
  assert.match(html, /Trạng thái kích hoạt thực tế/);
  assert.match(html, /Điều kiện vô hiệu/);
  assert.match(html, /Thị trường \/ Ngành/);
  assert.match(html, /Thanh khoản/);
  assert.match(html, /Độ mới dữ liệu/);
  assert.match(html, /Mọi trạng thái kỹ thuật/);
  assert.match(product, /mã đang hiển thị/);
  assert.match(product, /sắp xếp theo mã, không phải xếp hạng/);
  assert.match(product, /Chưa có đặc điểm/);
  const visiblePage = visibleText(html);
  for (const phrase of ENGLISH_CHROME) {
    assert.doesNotMatch(visiblePage, new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
});

test("missing optional candle sidecar is a Vietnamese availability state, never numeric zero", () => {
  const absent = signals.classifySidecarAvailability(false, null, "2026-08-28");
  assert.equal(absent.status, "ABSENT_FROM_PUBLICATION");
  assert.equal(absent.code, "OPTIONAL_CANDLE_SIGNAL_SIDECAR_UNAVAILABLE");
  assert.equal(absent.count, null);
  const stale = signals.classifySidecarAvailability(true, {
    status: "STALE",
    source_session: "2026-08-25",
    reason_codes: ["SIGNAL_SOURCE_SESSION_MISMATCH"],
  }, "2026-08-28");
  assert.equal(stale.status, "PRESENT_BUT_STALE");
  assert.equal(stale.count, null);
  const markup = signals.candleUnavailableHtml(absent.code);
  const visible = visibleText(markup);
  assert.match(visible, /Chưa có dữ liệu mẫu hình nến phù hợp cho phiên hiện tại/);
  assert.doesNotMatch(visible, /OPTIONAL_CANDLE_SIGNAL_SIDECAR_UNAVAILABLE/);
  assert.doesNotMatch(visible, /\b0\b/);
  assert.match(markup, /OPTIONAL_CANDLE_SIGNAL_SIDECAR_UNAVAILABLE/);
  assert.doesNotMatch(html, /OPTIONAL_CANDLE_SIGNAL_SIDECAR_UNAVAILABLE/);
});

test("existing candlestick glossary is reused for Hammer and Inverted Hammer", () => {
  assert.equal(cp.lookupPatternInfo(REGISTRY, "hammer").name_vi, "Búa");
  assert.equal(cp.lookupPatternInfo(REGISTRY, "inverted_hammer").name_vi, "Búa ngược");
  assert.equal(cp.lookupPatternInfo(REGISTRY, "shooting_star").name_vi, "Sao băng");
  assert.equal(cp.lookupPatternInfo(REGISTRY, "morning_star").name_vi, "Sao Mai");
  assert.equal(signals.patternLabel(REGISTRY, "hammer", "Hammer"), "Búa");
  assert.equal(signals.patternLabel(REGISTRY, "inverted_hammer", "Inverted Hammer"), "Búa ngược");
  const markup = signals.renderPatternRowHtml({
    ticker: "HPG",
    pattern_key: "hammer",
    pattern_name: "Hammer",
    direction: "bullish",
    smc: ["ob_bull"],
  }, REGISTRY);
  const visible = visibleText(markup);
  assert.match(visible, /Búa/);
  assert.match(markup, /data-pattern-key="hammer"|title="hammer"/);
  assert.match(markup, /pattern-name-en/);
  assert.doesNotMatch(product, /Nến Búa/);
});

test("primary public pages keep the centralized Vietnamese presentation layer", () => {
  const pages = {
    "dashboard.html": ["assets/js/value-format.js", "assets/js/dashboard-product-summary.js"],
    "screener.html": ["assets/js/value-format.js", "assets/js/screener-master.js"],
    "analysis.html": ["assets/js/value-format.js"],
    "signals.html": ["assets/js/value-format.js", "assets/js/signals-product.js"],
    "investment-workspace.html": ["assets/js/value-format.js", "assets/js/investment-workspace.js"],
    "portfolio.html": [],
  };
  for (const [page, scripts] of Object.entries(pages)) {
    const source = fs.readFileSync(path.join(root, page), "utf8");
    assert.match(source, /Tổng quan/);
    assert.match(source, /Bàn quyết định|Không gian quyết định/);
    scripts.forEach((script) => assert.match(source, new RegExp(script.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))));
  }
  assert.match(product, /formatDomainState/);
  const analysisSource = fs.readFileSync(path.join(root, "assets/js/analysis-product.js"), "utf8");
  const workspaceSource = fs.readFileSync(path.join(root, "assets/js/investment-workspace.js"), "utf8");
  const dashboardSource = fs.readFileSync(path.join(root, "assets/js/dashboard-product-summary.js"), "utf8");
  assert.match(analysisSource, /formatDomainState/);
  assert.match(workspaceSource, /formatDomainState/);
  assert.match(dashboardSource, /formatDomainState/);
  const spec = analysis.optionSpec("WAIT_FOR_CONFIRMATION", "research_stance");
  assert.equal(spec.value, "WAIT_FOR_CONFIRMATION");
  assert.equal(spec.text, "Chờ xác nhận");
  assert.equal(sm.matchesScreenerFilters({
    ticker: "HPG", display_exchange: "HSX", research: { stance: "WAIT_FOR_CONFIRMATION" },
    tactical: { entry_state: "SELLING_PRESSURE_EASING" }, sector: { status: "AVAILABLE", label: "Thép" },
    financial_v2: { status: "AVAILABLE" }, liquidity: { method: "LIQUIDITY_RESEARCH_PROXY" },
    freshness: { row: "CURRENT" },
  }, { stance: "WAIT_FOR_CONFIRMATION" }), true);
  const cardHtml = ws.decisionCardHtml({
    ticker: "HPG", research_stance: "WAIT_FOR_CONFIRMATION", entry_state: "SELLING_PRESSURE_EASING",
    why: {}, valuation: {}, counter_thesis: {}, confirmation: {}, invalidation: {},
    lineage: { per_axis_freshness: {} }, prospective_case: {},
  }, { ticker: "HPG" });
  assert.match(visibleText(cardHtml), /Chờ xác nhận/);
  assert.doesNotMatch(visibleText(cardHtml), /WAIT_FOR_CONFIRMATION/);
});
