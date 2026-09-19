// Focused tests for SIGNAL_VELOCITY_AND_FLOW_PRICE_DECISION_PRESENTATION_V1: Signal Velocity and
// Flow-Price Divergence presentation inside the existing ticker decision drawer.
const test = require("node:test");
const assert = require("node:assert/strict");
const ws = require("../assets/js/investment-workspace.js");

function velocity(overrides) {
  return Object.assign({
    contract_version: "multi_session_signal_velocity/v1.2",
    overall_transition_state: "STABLE",
    evidence_quality: "COMPLETE_RETAINED_EVIDENCE",
    valid_observation_count: 5,
    retained_session_span: { first: "2026-09-10", last: "2026-09-18" },
    continuity_state: "CONTIGUOUS_RETAINED_OBSERVATIONS",
    latest_transition: "UNCHANGED",
    persistence: "NO_CLEAR_DIRECTION",
    acceleration_state: "NOT_EVALUABLE_CATEGORICAL_ONLY",
    independent_supporting_axes: [],
    contradicting_axes: [],
  }, overrides);
}

function flowPrice(overrides) {
  return Object.assign({
    contract_version: "flow_price_divergence_shadow/v1",
    reference_session: "2026-09-18",
    cohort_membership: "OUTSIDE_CURRENT_FLOW_RESEARCH_COHORT",
    relationship: "FLOW_UNAVAILABLE",
    foreign_flow_state: null,
    flow_persistence: null,
    latest_qualified_flow_session: null,
    flow_freshness: {},
    price_state: null,
    price_velocity_state: null,
    participation_context: null,
    market_support: null,
    sector_support: null,
    evidence_quality: "INSUFFICIENT_RETAINED_EVIDENCE",
    session_alignment: "UNAVAILABLE",
    limitations: ["QUALIFIED_FOREIGN_VALUE_ONLY"],
  }, overrides);
}

function card(overrides) {
  return Object.assign({
    ticker: "AAA", sector: "STEEL", research_stance: "INITIATE_RESEARCH_CANDIDATE",
    research_stance_readiness: "RESEARCH_READY_CONDITIONAL", entry_state: "BREAKOUT_READY", entry_action: "BUY_ON_CONFIRMATION",
    setup_tags: [],
    fundamental: { state: "PROFITABLE", trajectory: "PROFIT_GROWTH" },
    valuation: { relative_research_state: "ATTRACTIVE_RELATIVE_RESEARCH", usable_relative_method_count: 2, supporting_methods: [] },
    tactical: { primary_entry_state: "BREAKOUT_READY" },
    catalyst: { status: "WATCH_FOR_EXECUTION" },
    liquidity: { readiness: "LIQUIDITY_RESEARCH_PROXY" },
    confirmation: { status: "READY" },
    invalidation: { technical: { status: "READY" }, fundamental: { status: "UNAVAILABLE" } },
    counter_thesis: { warnings: [], key_counter_thesis: [], unavailable_dimensions: [] },
    why: { deterministic_reasons: [], counterbalancing_context: [] },
    portfolio: { evaluated: false, status: "NOT_EVALUATED" },
    prospective_case: { status: "NO_RETAINED_CURRENT_CASES", forward_outcome_status: "PENDING_NOT_ENOUGH_FUTURE_SESSIONS" },
    lineage: { per_axis_freshness: {}, per_axis_source_session: {}, per_axis_proxy_or_qualified_state: {}, blockers: [], deep_evidence_availability: "DEEP_EVIDENCE_ARTIFACT_NOT_MATERIALIZED_LOCALLY" },
    as_of_session: "2026-09-18",
    signal_velocity: velocity(),
    flow_price: flowPrice(),
  }, overrides);
}

const FORBIDDEN_TERMS = [
  "smart money", "tiền thông minh", "tay to", "dòng tiền lớn đang gom", "tổ chức hấp thụ",
  "institutional accumulation", "domestic accumulation", "market-maker absorption",
];

// ---------------------------------------------------------------------------
// PHASE 4 -- Signal Velocity Vietnamese labels, raw enum never primary text
// ---------------------------------------------------------------------------

test("PERSISTENT_IMPROVEMENT renders as Cải thiện bền bỉ, not the raw enum", () => {
  const html = ws.evidenceSummaryHtml(card({ signal_velocity: velocity({ overall_transition_state: "PERSISTENT_IMPROVEMENT" }) }));
  assert.match(html, /Cải thiện bền bỉ/);
  assert.doesNotMatch(html, /<strong>PERSISTENT_IMPROVEMENT<\/strong>/);
});

test("EARLY_IMPROVEMENT renders as Cải thiện sớm", () => {
  const html = ws.evidenceSummaryHtml(card({ signal_velocity: velocity({ overall_transition_state: "EARLY_IMPROVEMENT" }) }));
  assert.match(html, /Cải thiện sớm/);
});

test("MIXED_TRANSITION renders as Tín hiệu đang phân hóa", () => {
  const html = ws.evidenceSummaryHtml(card({ signal_velocity: velocity({ overall_transition_state: "MIXED_TRANSITION" }) }));
  assert.match(html, /Tín hiệu đang phân hóa/);
});

test("DETERIORATING renders as Đang suy yếu", () => {
  const html = ws.evidenceSummaryHtml(card({ signal_velocity: velocity({ overall_transition_state: "DETERIORATING" }) }));
  assert.match(html, /Đang suy yếu/);
});

test("insufficient Signal Velocity evidence renders as Chưa đủ bằng chứng", () => {
  const html = ws.evidenceSummaryHtml(card({ signal_velocity: velocity({ overall_transition_state: "INSUFFICIENT_EVIDENCE" }) }));
  assert.match(html, /Chưa đủ bằng chứng/);
});

test("raw signal velocity enum never appears as the bolded primary value", () => {
  const html = ws.evidenceSummaryHtml(card({ signal_velocity: velocity({ overall_transition_state: "STABLE" }) }));
  assert.doesNotMatch(html, /<strong>STABLE<\/strong>/);
  assert.match(html, /Tương đối ổn định/);
});

// ---------------------------------------------------------------------------
// PHASE 5 -- meaning copy distinguishes evidence trend from a price forecast
// ---------------------------------------------------------------------------

test("persistent improvement copy explicitly says this is not a probability of price increase", () => {
  const html = ws.evidenceSummaryHtml(card({ signal_velocity: velocity({ overall_transition_state: "PERSISTENT_IMPROVEMENT" }) }));
  assert.match(html, /không phải xác suất giá tăng/);
});

test("deterioration copy never claims a sell instruction", () => {
  const html = ws.evidenceSummaryHtml(card({ signal_velocity: velocity({ overall_transition_state: "DETERIORATING" }) }));
  assert.match(html, /Nhiều bằng chứng kỹ thuật đang suy yếu/);
  assert.doesNotMatch(html, /bán ngay|lệnh bán/i);
});

// ---------------------------------------------------------------------------
// PHASE 6 -- deep evidence: acceleration is a fixed sentence, never the raw enum
// ---------------------------------------------------------------------------

test("acceleration_state raw enum never appears anywhere in the card", () => {
  const html = ws.decisionCardHtml(card());
  assert.doesNotMatch(html, /NOT_EVALUABLE_CATEGORICAL_ONLY/);
  assert.match(html, /Gia tốc: chưa thể đánh giá từ dữ liệu phân loại\./);
});

test("deep evidence surfaces observation count, session span, continuity, and axes", () => {
  const html = ws.decisionCardHtml(card({
    signal_velocity: velocity({
      overall_transition_state: "PERSISTENT_IMPROVEMENT", valid_observation_count: 7,
      independent_supporting_axes: ["structural_repair", "market_support"], contradicting_axes: ["fundamental_trajectory"],
    }),
  }));
  assert.match(html, /Số quan sát hợp lệ<\/b> 7/);
  assert.match(html, /2026-09-10/);
  assert.match(html, /2026-09-18/);
  assert.match(html, /Phục hồi cấu trúc/);
  assert.match(html, /Thị trường hỗ trợ/);
  assert.match(html, /Quỹ đạo nền tảng/);
});

// ---------------------------------------------------------------------------
// PHASE 7 -- Flow-Price Vietnamese labels
// ---------------------------------------------------------------------------

test("FLOW_PRICE_MIXED renders as Dòng ngoại và giá chưa đồng thuận", () => {
  const html = ws.evidenceSummaryHtml(card({ flow_price: flowPrice({ cohort_membership: "IN_CURRENT_FLOW_RESEARCH_COHORT", relationship: "FLOW_PRICE_MIXED" }) }));
  assert.match(html, /Dòng ngoại và giá chưa đồng thuận/);
});

test("FOREIGN_BUYING_PRICE_WEAKNESS renders the exact governed Vietnamese sentence", () => {
  const html = ws.evidenceSummaryHtml(card({ flow_price: flowPrice({ cohort_membership: "IN_CURRENT_FLOW_RESEARCH_COHORT", relationship: "FOREIGN_BUYING_PRICE_WEAKNESS" }) }));
  assert.match(html, /Khối ngoại mua ròng nhưng giá\/cấu trúc chưa xác nhận/);
});

test("FOREIGN_SELLING_PRICE_WEAKNESS renders the exact governed Vietnamese sentence", () => {
  const html = ws.evidenceSummaryHtml(card({ flow_price: flowPrice({ cohort_membership: "IN_CURRENT_FLOW_RESEARCH_COHORT", relationship: "FOREIGN_SELLING_PRICE_WEAKNESS" }) }));
  assert.match(html, /Khối ngoại bán ròng, giá\/cấu trúc cùng suy yếu/);
});

test("future resilience mapping is supported even though no real fixture forces it today", () => {
  const html = ws.evidenceSummaryHtml(card({ flow_price: flowPrice({ cohort_membership: "IN_CURRENT_FLOW_RESEARCH_COHORT", relationship: "FOREIGN_SELLING_PRICE_RESILIENCE" }) }));
  assert.match(html, /Khối ngoại bán ròng, giá\/cấu trúc vẫn chống chịu/);
});

// ---------------------------------------------------------------------------
// PHASE 10 -- cohort scope UX: outside-cohort vs. in-cohort-but-unavailable are distinct
// ---------------------------------------------------------------------------

test("ticker outside the flow cohort reads as out-of-scope, never as missing data", () => {
  const html = ws.evidenceSummaryHtml(card({ flow_price: flowPrice({ cohort_membership: "OUTSIDE_CURRENT_FLOW_RESEARCH_COHORT", relationship: "FLOW_UNAVAILABLE" }) }));
  assert.match(html, /Chưa nằm trong phạm vi dữ liệu dòng ngoại hiện hành/);
  assert.doesNotMatch(html, /Thiếu dữ liệu/);
});

test("ticker inside the flow cohort with no current data reads differently from an out-of-scope ticker", () => {
  const inCohort = ws.evidenceSummaryHtml(card({ flow_price: flowPrice({ cohort_membership: "IN_CURRENT_FLOW_RESEARCH_COHORT", relationship: "FLOW_UNAVAILABLE" }) }));
  const outsideCohort = ws.evidenceSummaryHtml(card({ flow_price: flowPrice({ cohort_membership: "OUTSIDE_CURRENT_FLOW_RESEARCH_COHORT", relationship: "FLOW_UNAVAILABLE" }) }));
  assert.match(inCohort, /Trong nhóm theo dõi dòng ngoại, nhưng dữ liệu phiên hiện tại chưa được ghi nhận/);
  assert.notEqual(inCohort, outsideCohort);
});

test("deep evidence explains cohort scope without implying the system failed", () => {
  const html = ws.decisionCardHtml(card({ flow_price: flowPrice({ cohort_membership: "OUTSIDE_CURRENT_FLOW_RESEARCH_COHORT" }) }));
  assert.match(html, /nhóm theo dõi nghiên cứu đã xác định trước phiên/);
});

// ---------------------------------------------------------------------------
// PHASE 12/13 -- freshness and persistence, only when the contract actually supports it
// ---------------------------------------------------------------------------

test("current flow freshness is distinguishable from stale reference-only flow in deep evidence", () => {
  const current = ws.decisionCardHtml(card({
    flow_price: flowPrice({ cohort_membership: "IN_CURRENT_FLOW_RESEARCH_COHORT", relationship: "FLOW_PRICE_MIXED", latest_qualified_flow_session: "2026-09-18", flow_freshness: { status: "current" } }),
  }));
  const stale = ws.decisionCardHtml(card({
    flow_price: flowPrice({ cohort_membership: "IN_CURRENT_FLOW_RESEARCH_COHORT", relationship: "FLOW_PRICE_MIXED", latest_qualified_flow_session: "2026-09-10", flow_freshness: { status: "stale" } }),
  }));
  assert.match(current, /2026-09-18/);
  assert.match(current, /Hiện tại/);
  assert.match(stale, /2026-09-10/);
  assert.match(stale, /Đã cũ/);
});

test("flow persistence label only renders the governed vocabulary", () => {
  const html = ws.decisionCardHtml(card({ flow_price: flowPrice({ cohort_membership: "IN_CURRENT_FLOW_RESEARCH_COHORT", flow_persistence: "PERSISTENT_NET_BUY" }) }));
  assert.match(html, /Mua ròng kéo dài/);
});

// ---------------------------------------------------------------------------
// PHASE 19/20 -- no false market-wide aggregation anywhere in this surface
// ---------------------------------------------------------------------------

test("a single card never renders a market-wide percentage statistic for flow unavailability", () => {
  const html = ws.decisionCardHtml(card({ flow_price: flowPrice({ cohort_membership: "OUTSIDE_CURRENT_FLOW_RESEARCH_COHORT" }) }));
  assert.doesNotMatch(html, /99\.3%|toàn thị trường|thị trường thiếu dòng ngoại/i);
});

// ---------------------------------------------------------------------------
// PHASE 16 -- no confirmation score / vote total
// ---------------------------------------------------------------------------

test("supporting/contradicting axes render as plain lists, never a fraction score", () => {
  const html = ws.decisionCardHtml(card({
    signal_velocity: velocity({ independent_supporting_axes: ["structural_repair", "market_support", "sector_support", "price_momentum"], contradicting_axes: [] }),
  }));
  assert.doesNotMatch(html, /4\/5|4\/4|confirmation score|điểm xác nhận/i);
});

// ---------------------------------------------------------------------------
// PHASE 8 -- forbidden language never appears
// ---------------------------------------------------------------------------

test("no forbidden smart-money / institutional-intent language appears anywhere in the card", () => {
  const html = ws.decisionCardHtml(card({
    signal_velocity: velocity({ overall_transition_state: "PERSISTENT_IMPROVEMENT" }),
    flow_price: flowPrice({ cohort_membership: "IN_CURRENT_FLOW_RESEARCH_COHORT", relationship: "FOREIGN_BUYING_PRICE_CONFIRMATION" }),
  })).toLowerCase();
  for (const term of FORBIDDEN_TERMS) {
    assert.doesNotMatch(html, new RegExp(term.toLowerCase()));
  }
});

// ---------------------------------------------------------------------------
// PHASE 24 -- visual semantics: mixed reads neutral, buying/selling never forces green/red
// ---------------------------------------------------------------------------

test("FLOW_PRICE_MIXED and FOREIGN_*_WEAKNESS never render a constructive/adverse (green/red) tone", () => {
  const vf = require("../assets/js/value-format.js");
  for (const state of ["FLOW_PRICE_MIXED", "FOREIGN_BUYING_PRICE_WEAKNESS", "FOREIGN_SELLING_PRICE_WEAKNESS"]) {
    const tone = vf.getSemanticTone(state, "flow_price_relationship");
    assert.ok(tone === "neutral" || tone === "watch", `${state} got tone ${tone}`);
  }
});

// ---------------------------------------------------------------------------
// PHASE 22 -- accessibility: help/quality chips are keyboard-focusable, not hover-only
// ---------------------------------------------------------------------------

test("Signal Velocity and Flow-Price help/quality chips are keyboard-focusable", () => {
  const html = ws.evidenceSummaryHtml(card());
  const chips = html.match(/<span class="ws-help"[^>]*>Xu hướng tín hiệu<\/span>/);
  assert.ok(chips);
  assert.match(chips[0], /tabindex="0"/);
  const flowChip = html.match(/<span class="ws-help"[^>]*>Quan hệ dòng ngoại – giá<\/span>/);
  assert.ok(flowChip);
  assert.match(flowChip[0], /tabindex="0"/);
});

// ---------------------------------------------------------------------------
// PHASE 17 -- placement: the two new rows sit inside the existing compact evidence summary,
// after the governed decision fields, never replacing or reordering them.
// ---------------------------------------------------------------------------

test("evidence summary keeps fundamental/valuation/tactical rows before the two new rows", () => {
  const html = ws.evidenceSummaryHtml(card());
  // Match the row's own heading span (">Label</span>"), not the quality badge's aria-label text
  // ("Mức độ tin cậy của bằng chứng: ...") which repeats on every row and would break ordering.
  const order = ["Nền tảng", "Định giá", "Mức độ tin cậy của bằng chứng", "Xu hướng tín hiệu", "Quan hệ dòng ngoại – giá"];
  let lastIndex = -1;
  for (const label of order) {
    const idx = html.indexOf(`>${label}</span>`);
    assert.ok(idx > lastIndex, `${label} out of order (found at ${idx}, previous at ${lastIndex})`);
    lastIndex = idx;
  }
});

// ---------------------------------------------------------------------------
// PHASE 30 -- regression: existing decision-card contract still holds with the new fields present
// ---------------------------------------------------------------------------

test("existing decision card still renders normally when the two new fields are present", () => {
  const html = ws.decisionCardHtml(card());
  assert.match(html, /Tóm tắt quyết định/);
  assert.match(html, /Chi tiết phân tích/);
});

test("missing signal_velocity/flow_price fields degrade explicitly, never crash the renderer", () => {
  const bare = card();
  delete bare.signal_velocity;
  delete bare.flow_price;
  assert.doesNotThrow(() => ws.decisionCardHtml(bare));
});
