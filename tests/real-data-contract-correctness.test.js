const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const root = path.resolve(__dirname, "..");
const vf = require("../assets/js/value-format.js");
const dc = require("../assets/js/decision-cockpit.js");

// Load real checked-in artifacts READ-ONLY
function readArtifact(primaryRel, fallbackRel) {
  const p1 = path.join(root, primaryRel);
  if (fs.existsSync(p1)) return JSON.parse(fs.readFileSync(p1, "utf8"));
  if (fallbackRel) {
    const p2 = path.join(root, fallbackRel);
    if (fs.existsSync(p2)) return JSON.parse(fs.readFileSync(p2, "utf8"));
  }
  return null;
}

const cockpit = readArtifact("data/current_decision_cockpit.json");
const workspace = readArtifact("data/current_investment_workspace.json", "data/investment_decision_workspace.json");
const signals = readArtifact("data/current_signals_product.json") || {
  signals: Object.values(workspace.cards || {}).map((c) => ({
    ticker: c.ticker,
    confirmation_state: c.confirmation?.status || c.confirmation?.confirmation_trigger_state,
    invalidation_state: c.invalidation?.technical?.status || c.invalidation?.fundamental?.status,
    tactical_state: c.tactical?.state,
  })),
};

test("A. Real artifacts: Every state encountered in real artifacts formats to non-empty Vietnamese", () => {
  assert.ok(cockpit, "Cockpit artifact must be loaded");
  assert.ok(workspace, "Workspace artifact must be loaded");

  // Test research_stance from workspace cards
  for (const [ticker, card] of Object.entries(workspace.cards || {})) {
    if (card.research_stance) {
      const formatted = vf.formatDomainState(card.research_stance, "research_stance");
      assert.ok(formatted && formatted.label, `Card ${ticker} stance must have non-empty Vietnamese label`);
      assert.notEqual(formatted.label, card.research_stance, `Stance ${card.research_stance} should be localized`);
    }
    if (card.tactical?.state) {
      const formatted = vf.formatDomainState(card.tactical.state, "tactical_state");
      assert.ok(formatted && formatted.label, `Card ${ticker} tactical.state must have non-empty label`);
    }
    if (card.fundamental?.state) {
      const formatted = vf.formatDomainState(card.fundamental.state, "fundamental_state");
      assert.ok(formatted && formatted.label, `Card ${ticker} fundamental.state must have non-empty label`);
    }
    if (card.valuation?.state) {
      const formatted = vf.formatDomainState(card.valuation.state, "valuation_state");
      assert.ok(formatted && formatted.label, `Card ${ticker} valuation.state must have non-empty label`);
    }
  }

  // Test signals states
  const signalRows = signals.signals || signals.rows || signals.items || [];
  for (const row of signalRows) {
    if (row.confirmation_state) {
      const formatted = vf.formatDomainState(row.confirmation_state, "confirmation_state");
      assert.ok(formatted && formatted.label);
    }
    if (row.invalidation_state) {
      const formatted = vf.formatDomainState(row.invalidation_state, "invalidation_state");
      assert.ok(formatted && formatted.label);
    }
  }
});

test("B. Real artifacts: No real defined state renders as 'Chưa xác định'", () => {
  const definedStances = [
    "ACCUMULATE_RESEARCH_CANDIDATE",
    "INITIATE_RESEARCH_CANDIDATE",
    "WAIT_FOR_CONFIRMATION",
    "AVOID_NEW_ENTRY",
    "HIGH_RISK_SPECULATION_ONLY",
    "INSUFFICIENT_EVIDENCE",
  ];
  for (const st of definedStances) {
    const formatted = vf.formatDomainState(st, "research_stance");
    assert.ok(formatted.known, `${st} must be known`);
    assert.notEqual(formatted.label, "Chưa xác định", `${st} must not format to 'Chưa xác định'`);
  }

  const definedTactical = [
    "DOWNTREND",
    "SELLING_PRESSURE_EASING",
    "UPTREND_CONFIRMED",
    "EARLY_REVERSAL_CANDIDATE",
    "BREAKDOWN_RISK",
    "SIDEWAYS_NEUTRAL",
  ];
  for (const ts of definedTactical) {
    const formatted = vf.formatDomainState(ts, "tactical_state");
    assert.ok(formatted.known, `${ts} must be known`);
    assert.notEqual(formatted.label, "Chưa xác định");
  }

  const definedRules = [
    "EASING_TO_REVERSAL_UPGRADE",
    "RENEWED_BREAKDOWN_RISK",
    "COMPATIBLE_PROFITABILITY_QUALITY_DETERIORATION",
    "TECHNICAL_DETERIORATION",
    "PROFITABLE_FUNDAMENTAL",
  ];
  for (const rc of definedRules) {
    const formatted = vf.formatDomainState(rc, "rule_condition");
    assert.ok(formatted.known, `${rc} must be known`);
    assert.notEqual(formatted.label, "Chưa xác định");
  }
});

test("C. Domain-aware semantic tones: confirmation_state='TRIGGERED' formats to constructive tone", () => {
  const tone = vf.getSemanticTone("TRIGGERED", "confirmation_state");
  assert.equal(tone, "constructive");

  const confirmedTone = vf.getSemanticTone("CONFIRMED", "confirmation_state");
  assert.equal(confirmedTone, "constructive");

  const notConfirmedTone = vf.getSemanticTone("NOT_CONFIRMED", "confirmation_state");
  assert.notEqual(notConfirmedTone, "constructive", "NOT_CONFIRMED must never format to constructive tone");
});

test("D. Domain-aware semantic tones: invalidation_state='TRIGGERED' formats to adverse tone", () => {
  const tone = vf.getSemanticTone("TRIGGERED", "invalidation_state");
  assert.equal(tone, "adverse");

  const invalidatedTone = vf.getSemanticTone("INVALIDATED", "invalidation_state");
  assert.equal(invalidatedTone, "adverse");

  const notInvalidatedTone = vf.getSemanticTone("NOT_INVALIDATED", "invalidation_state");
  assert.notEqual(notInvalidatedTone, "adverse", "NOT_INVALIDATED must never format to adverse tone");
});

test("E. Domain-aware semantic tones: data_fitness='BLOCKED' formats to neutral tone, never constructive", () => {
  const tone = vf.getSemanticTone("BLOCKED", "data_fitness");
  assert.notEqual(tone, "constructive", "BLOCKED data_fitness must never be constructive");
  assert.equal(tone, "neutral");
});

test("F. Domain-aware semantic tones: data_fitness='UNAVAILABLE' formats to neutral/dim tone", () => {
  const tone = vf.getSemanticTone("UNAVAILABLE", "data_fitness");
  assert.equal(tone, "neutral");

  const notAvailTone = vf.getSemanticTone("NOT_AVAILABLE", "data_fitness");
  assert.equal(notAvailTone, "neutral");
});

test("G. Owner Focus: contains real tickers and enriches from real workspace cards", () => {
  const tickers = cockpit.owner_focus?.tickers || [];
  assert.ok(Array.isArray(tickers) && tickers.length > 0, "owner_focus must contain an array of tickers");
  assert.ok(tickers.includes("HPG"));
  assert.ok(tickers.includes("SSI"));

  // 1. With real cockpit data (which has embedded ticker_cards)
  const htmlWithCockpitCards = dc.renderOwnerFocusHtml(cockpit, workspace.cards);
  assert.ok(htmlWithCockpitCards.includes("HPG"));
  assert.ok(htmlWithCockpitCards.includes("SSI"));
  assert.match(htmlWithCockpitCards, /Áp lực bán đang hạ nhiệt|Xu hướng giảm|Xu hướng tăng đã xác nhận/);

  // 2. Fallback when cockpit lacks embedded ticker_cards: enriches directly from workspace.cards
  const bareCockpit = { owner_focus: { tickers: ["HPG", "SSI"] } };
  const htmlWithWorkspaceCards = dc.renderOwnerFocusHtml(bareCockpit, workspace.cards);
  assert.ok(htmlWithWorkspaceCards.includes("HPG"));
  assert.ok(htmlWithWorkspaceCards.includes("SSI"));
  assert.match(htmlWithWorkspaceCards, /Chờ xác nhận|Tránh mở vị thế mới|Tích lũy nghiên cứu/);
});

test("H. Portfolio Risk: NO_EXPLICIT_PORTFOLIO_SUPPLIED is handled truthfully without fabricated positions", () => {
  const html = dc.renderPortfolioRiskHtml(cockpit);
  assert.match(html, /Chưa cung cấp danh mục cụ thể/);
  assert.match(html, /Không có danh mục cụ thể để đối chiếu/);
  // Ensure no fabricated 'position_count = 0' or 'Không phát hiện rủi ro tập trung'
  assert.doesNotMatch(html, /Số vị thế nắm giữ: 0/);
  assert.doesNotMatch(html, /Chưa phát hiện rủi ro tập trung vượt ngưỡng cho phép/);
});

test("I. Data Gaps: formats as an Object map of dimensions without crash", () => {
  assert.equal(typeof cockpit.risk_data_gaps, "object");
  assert.ok(!Array.isArray(cockpit.risk_data_gaps), "Real risk_data_gaps is an Object mapping");
  const html = dc.renderDataGapsHtml(cockpit);
  assert.ok(html.length > 0);
  assert.match(html, /cockpit-kpi/);
  assert.match(html, /Hồ sơ doanh nghiệp|Cơ bản doanh nghiệp|Vũ trụ niêm yết|Định giá/);
});

test("J. What to Verify Next: renders each item truthfully without [object Object]", () => {
  const html = dc.renderVerifyNextHtml(cockpit);
  assert.ok(html.length > 0);
  assert.doesNotMatch(html, /\[object Object\]/);
  for (const item of cockpit.what_to_verify_next || []) {
    const text = typeof item === "string" ? item : (item.item || item.description || "");
    if (text) {
      assert.ok(html.includes(text.replace(/&/g, "&amp;")));
    }
  }
});

test("K. Lineage: renders every real input_artifact and preserves freshness_state", () => {
  const html = dc.renderLineageHtml(cockpit);
  const inputArtifacts = cockpit.source?.input_artifacts || {};
  const keys = Object.keys(inputArtifacts);
  assert.ok(keys.length > 0, "Real cockpit has input_artifacts");

  for (const key of keys) {
    const item = inputArtifacts[key];
    assert.ok(html.includes(key), `Lineage HTML must include artifact key: ${key}`);
    if (item.freshness_state) {
      assert.ok(
        html.includes(item.freshness_state) || html.includes(vf.formatDomainState(item.freshness_state, "freshness").label),
        `Lineage HTML must preserve freshness state for: ${key}`
      );
    }
  }
});

test("L. Session Coherence: mismatch detection triggers when workspace.as_of_session != cockpit.session", () => {
  const html = dc.renderSessionMismatchHtml("2026-08-28", "2026-08-25", "SESSION_MISMATCH");
  assert.match(html, /Thông tin bổ sung chưa đồng bộ với phiên hiện tại/);
  assert.match(html, /2026-08-28/);
  assert.match(html, /2026-08-25/);
  assert.match(html, /SESSION_MISMATCH/);
});

test("M. Session Coherence: same session matches and passes coherence check", () => {
  const wsSession = workspace.as_of_session;
  const cpSession = cockpit.session;
  assert.ok(wsSession, "workspace must have as_of_session");
  assert.ok(cpSession, "cockpit must have session");
  assert.equal(wsSession, cpSession, "Checked-in real artifacts must share the same session");
});

test("N. Compatibility Page: decision-cockpit.html is a thin redirect preserving query and hash", () => {
  const html = fs.readFileSync(path.join(root, "decision-cockpit.html"), "utf8");
  assert.doesNotMatch(html, /<meta http-equiv="refresh"/);
  assert.doesNotMatch(html, /Không gian quyết định/);
  assert.match(html, /window\.location\.replace/);
  assert.match(html, /search/);
  assert.match(html, /hash/);
  assert.match(html, /id="redirect-link"/);
  assert.match(html, /Bàn quyết định đã được hợp nhất/);
});

test("O. About Page Doctrine: does not claim AI is data authority or deterministic models are truth authority", () => {
  const html = fs.readFileSync(path.join(root, "about.html"), "utf8");
  assert.doesNotMatch(html, /thẩm quyền dữ liệu/);
  assert.doesNotMatch(html, /Tactical V2/);

  // Factual authority belongs to qualified evidence and provenance
  assert.match(html, /thẩm quyền sự thật/);
  assert.match(html, /thẩm quyền số học cho các tính toán có thể chuẩn hóa/);
  assert.match(html, /giải thích, tổng hợp và phản biện/);

  // No invented policy definitions
  assert.doesNotMatch(html, /nghiên cứu giải ngân thăm dò/);
  assert.doesNotMatch(html, /rủi ro giảm giá có thể kiểm soát/);
});
