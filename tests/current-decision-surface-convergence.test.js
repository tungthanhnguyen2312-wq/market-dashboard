"use strict";
// CURRENT_DECISION_SURFACE_CONVERGENCE_V1 -- Dashboard renderer/filter contract.
// research_action_posture (Producer Integrated Decision) is the primary decision on every badge,
// filter and summary; research_stance is shown only as a secondary research screen; evidence
// currency is explicit; HOLD without a confirmed position is conditional; opportunity priority
// never changes the posture label or color. No decision is re-derived in JavaScript.
const test = require("node:test");
const assert = require("node:assert/strict");

const ws = require("../assets/js/investment-workspace.js");
const home = require("../assets/js/dashboard-product-summary.js");
const sm = require("../assets/js/screener-master.js");

function visible(html) {
  return String(html || "").replace(/<details[\s\S]*?<\/details>/gi, " ").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
}

function card(overrides) {
  return Object.assign({
    ticker: "AAA", sector: "STEEL", as_of_session: "2026-09-23",
    research_action_posture: "AVOID", evidence_currency: "CURRENT_SESSION",
    position_context: { status: "NOT_SUPPLIED", position_state: "UNKNOWN_POSITION_NOT_SUPPLIED" },
    opportunity_priority: { status: "AVAILABLE", research_priority_tier: "PRIORITY_NOW" },
    // Deliberately disagreeing secondary screen: legitimate after M1, never a second decision.
    research_stance: "INITIATE_RESEARCH_CANDIDATE", research_stance_readiness: "RESEARCH_READY_CONDITIONAL",
    entry_state: "BREAKOUT_READY", entry_action: "BUY_ON_CONFIRMATION", setup_tags: [],
    fundamental: {}, valuation: {}, tactical: {}, catalyst: {}, liquidity: {}, confirmation: {},
    invalidation: { technical: {}, fundamental: {} }, counter_thesis: {}, why: {}, portfolio: {},
    prospective_case: {}, lineage: { per_axis_freshness: {} },
  }, overrides);
}

test("primary filters test research_action_posture; research_stance filters are a secondary group", () => {
  const primaryIds = ["initiate", "accumulate", "early_watch", "wait", "hold", "avoid", "insufficient"];
  for (const id of primaryIds) {
    const filter = ws.FILTERS.find((f) => f.id === id);
    assert.equal(filter.group, "posture", id);
  }
  assert.equal(ws.matchesFilters(card(), ["avoid"]), true);
  assert.equal(ws.matchesFilters(card(), ["initiate"]), false, "a disagreeing stance must not satisfy the primary filter");
  assert.equal(ws.matchesFilters(card(), ["screen_initiate"]), true, "the stance survives as a secondary screen");
  const stanceFilters = ws.FILTERS.filter((f) => String(f.test).includes("research_stance"));
  assert.ok(stanceFilters.length > 0);
  assert.ok(stanceFilters.every((f) => f.group === "stance"));
  assert.match(ws.FILTER_GROUP_LABELS.stance, /phụ/);
  assert.equal(ws.FILTER_GROUP_LABELS.posture, "Quyết định hành động");
});

test("evidence-currency and priority filters read the Producer fields verbatim", () => {
  assert.equal(ws.matchesFilters(card(), ["evidence_current"]), true);
  assert.equal(ws.matchesFilters(card({ evidence_currency: "LAST_TRADE_AS_OF:2026-09-18" }), ["evidence_stale"]), true);
  assert.equal(ws.matchesFilters(card({ evidence_currency: "NO_CURRENT_EVIDENCE" }), ["evidence_none"]), true);
  assert.equal(ws.matchesFilters(card(), ["priority_now"]), true);
  assert.equal(ws.matchesFilters(card({ opportunity_priority: { status: "UNAVAILABLE" } }), ["priority_now"]), false);
});

test("drawer headline badge is the action posture; stance is only secondary context", () => {
  const html = ws.decisionCardHtml(card(), { ticker: "AAA" });
  const [primary] = html.split('<details class="ws-deep-evidence">');
  assert.match(primary, /data-action-posture="AVOID"/);
  const headline = primary.split('<div class="ws-drawer-keyline">')[0];
  assert.match(headline, /data-action-posture="AVOID"/);
  assert.doesNotMatch(headline, /INITIATE_RESEARCH_CANDIDATE/, "the stance must not headline the drawer");
  assert.match(visible(primary), /Tránh/);
  assert.match(visible(primary), /Sàng lọc nghiên cứu \(phụ\)/);
  assert.doesNotMatch(html, /kết luận nghiên cứu chính/, "the retired 'primary conclusion' wording must be gone");
});

test("NO_CURRENT_EVIDENCE renders as insufficient / no current evidence, never 'Chờ xác nhận'", () => {
  const insufficient = card({ research_action_posture: "INSUFFICIENT_CURRENT_RESEARCH", evidence_currency: "NO_CURRENT_EVIDENCE",
                              research_stance: "WAIT_FOR_CONFIRMATION" });
  assert.equal(ws.actionPostureLabel(insufficient), "Chưa đủ bằng chứng hiện tại");
  const badge = ws.actionPostureHtml(insufficient) + ws.evidenceCurrencyHtml(insufficient.evidence_currency);
  assert.match(visible(badge), /Không có bằng chứng hiện tại/);
  assert.doesNotMatch(visible(badge), /Chờ xác nhận/);
  // Nor may the secondary research screen word a NO_CURRENT_EVIDENCE card as "Chờ xác nhận".
  const drawer = ws.decisionCardHtml(insufficient, { ticker: "AAA" });
  assert.doesNotMatch(visible(drawer.replace(/<details[\s\S]*$/, "")), /Chờ xác nhận/);
  assert.doesNotMatch(ws.researchScreenHtml(insufficient).replace(/<[^>]+>/g, " "), /Chờ xác nhận/);
  assert.match(ws.researchScreenHtml(insufficient), /data-research-stance="WAIT_FOR_CONFIRMATION"/);
  // Even a contract-violating input is never displayed as an analytical WAIT.
  const violating = card({ research_action_posture: "WAIT_FOR_CONFIRMATION", evidence_currency: "NO_CURRENT_EVIDENCE" });
  assert.doesNotMatch(ws.actionPostureLabel(violating), /Chờ xác nhận/);
  assert.match(ws.actionPostureHtml(violating), /data-contract-violation="NO_CURRENT_EVIDENCE_WAIT"/);
});

test("stale evidence cannot look like current-session evidence", () => {
  const current = ws.evidenceCurrencyHtml("CURRENT_SESSION");
  const stale = ws.evidenceCurrencyHtml("LAST_TRADE_AS_OF:2026-09-18");
  assert.match(current, /data-evidence-currency="CURRENT_SESSION"/);
  assert.match(stale, /data-evidence-currency="LAST_TRADE_AS_OF"/);
  assert.match(visible(stale), /18\/09\/2026/);
  assert.notEqual(visible(current), visible(stale));
  assert.notEqual(current.match(/data-tone="(\w+)"/)[1], stale.match(/data-tone="(\w+)"/)[1]);
});

test("HOLD with unknown position is conditional; a confirmed holding is not", () => {
  const hold = card({ research_action_posture: "HOLD" });
  assert.equal(ws.actionPostureLabel(hold), "Nắm giữ — nếu đang nắm giữ");
  assert.match(ws.actionPostureLabel(card({ research_action_posture: "HOLD_DO_NOT_ADD" })), /nếu đang nắm giữ/);
  const held = card({ research_action_posture: "HOLD", position_context: { status: "SUPPLIED", position_state: "HELD" } });
  assert.equal(ws.actionPostureLabel(held), "Nắm giữ");
  assert.doesNotMatch(ws.actionPostureLabel(card({ research_action_posture: "INITIATE_ON_BREAKOUT" })), /nếu đang nắm giữ/);
});

test("opportunity priority is displayed separately and never changes the posture label or color", () => {
  const a = ws.actionPostureHtml(card({ opportunity_priority: { status: "AVAILABLE", research_priority_tier: "PRIORITY_NOW" } }));
  const b = ws.actionPostureHtml(card({ opportunity_priority: { status: "UNAVAILABLE", research_priority_tier: null } }));
  assert.equal(a, b);
  assert.match(ws.opportunityPriorityHtml(card()), /data-opportunity-priority="PRIORITY_NOW"/);
  assert.match(visible(ws.opportunityPriorityHtml(card())), /Ưu tiên xem xét/);
});

test("analysis row's primary decision cell is the posture, stance only secondary", () => {
  const html = ws.analysisRowHtml(ws.analysisRecord(card()));
  const cells = html.split("<td");
  assert.match(cells[2], /data-action-posture="AVOID"/);
  assert.match(cells[2], /Sàng lọc nghiên cứu \(phụ\)/);
});

test("T0 export additively carries the canonical posture and evidence currency, no new authority", () => {
  const exported = ws.buildT0Export("AAA", card(), "investment_decision_workspace_projection/v1:x");
  assert.equal(exported.research_action_posture, "AVOID");
  assert.equal(exported.evidence_currency, "CURRENT_SESSION");
  assert.equal(exported.decision_authority, "research_action_posture");
  assert.equal(exported.research_stance, "INITIATE_RESEARCH_CANDIDATE");
  assert.equal(exported.research_stance_role, "SECONDARY_RESEARCH_SCREEN_CONTEXT");
  assert.equal(exported.position_context, "UNKNOWN_POSITION_NOT_SUPPLIED");
  assert.deepEqual(exported.authority_boundary, { is_actionable: false, retained_case_authority: "NOT_ESTABLISHED_BY_THIS_EXPORT" });
  assert.match(exported.note, /No production\/runtime database write occurred/);
});

test("Home decision summary is posture-based; stance is a secondary collapsed diagnostic", () => {
  const projection = {
    contract_version: home.SCREENER_CONTRACT, as_of_session: "2026-09-23",
    cards: {
      AAA: { decision: { research_action_posture: "AVOID", evidence_currency: "CURRENT_SESSION" }, research: { stance: "INITIATE_RESEARCH_CANDIDATE" }, price: {}, tactical: {}, liquidity: {}, sector: {} },
      BBB: { decision: { research_action_posture: "HOLD", evidence_currency: "LAST_TRADE_AS_OF:2026-09-18", position_conditional: true }, research: { stance: "WAIT_FOR_CONFIRMATION" }, price: {}, tactical: {}, liquidity: {}, sector: {} },
      CCC: { decision: { research_action_posture: "INSUFFICIENT_CURRENT_RESEARCH", evidence_currency: "NO_CURRENT_EVIDENCE" }, research: { stance: "WAIT_FOR_CONFIRMATION" }, price: {}, tactical: {}, liquidity: {}, sector: {} },
    },
  };
  const summary = home.summarizeScreenerOverview(projection);
  assert.equal(summary.primary_decision_field, "research_action_posture");
  assert.equal(summary.research_action_posture.counts.AVOID, 1);
  assert.equal(summary.research_action_posture.counts.HOLD, 1);
  assert.equal(summary.research_action_posture.counts.WAIT_FOR_CONFIRMATION, 0);
  assert.deepEqual(summary.evidence_currency.counts, { CURRENT_SESSION: 1, LAST_TRADE_AS_OF: 1, NO_CURRENT_EVIDENCE: 1, UNKNOWN: 0 });
  assert.equal(summary.research_stance.role, "SECONDARY_RESEARCH_SCREEN_DIAGNOSTIC");
  const html = home.renderDecisionSummaryHtml(summary);
  const [primary] = html.split("<details");
  assert.match(primary, /data-action-posture="AVOID"/);
  assert.doesNotMatch(primary, /data-research-stance=/, "stance counts are never the primary summary");
  assert.match(visible(primary), /Nắm giữ — nếu đang nắm giữ/);
  assert.match(visible(primary), /không có bằng chứng hiện tại/);
});

test("Home never falls back to the stance: a pre-M1 summary renders posture unavailable; a malformed posture block is refused", () => {
  // Rolling-deploy compatibility (release-compatibility continuation): the posture block is additive,
  // so a valid pre-M1 summary stays renderable -- with the primary decision explicitly unavailable.
  const legacy = { contract_version: home.HOME_SUMMARY_CONTRACT, as_of_session: "2026-09-23", session_breadth: {}, research_stance: { counts: {} }, tactical: {}, liquidity: {}, sector: {} };
  assert.equal(home.validateHomeSummary(legacy, "2026-09-23"), true);
  assert.equal(home.validateHomeSummary({ ...legacy, research_action_posture: { counts: {} } }, "2026-09-23"), true);
  assert.equal(home.validateHomeSummary({ ...legacy, research_action_posture: null }, "2026-09-23"), false);
  assert.equal(home.validateHomeSummary({ ...legacy, research_action_posture: { counts: "x" } }, "2026-09-23"), false);
});

test("Screener primary decision filter reads decision.research_action_posture", () => {
  const row = { ticker: "AAA", decision: { research_action_posture: "AVOID", evidence_currency: "LAST_TRADE_AS_OF:2026-09-18" }, research: { stance: "INITIATE_RESEARCH_CANDIDATE" } };
  assert.equal(sm.matchesScreenerFilters(row, { posture: "AVOID" }), true);
  assert.equal(sm.matchesScreenerFilters(row, { posture: "INITIATE_ON_BREAKOUT" }), false);
  assert.equal(sm.matchesScreenerFilters(row, { evidence: "LAST_TRADE_AS_OF" }), true);
  assert.equal(sm.matchesScreenerFilters(row, { evidence: "CURRENT_SESSION" }), false);
  assert.equal(sm.matchesScreenerFilters(row, { stance: "INITIATE_RESEARCH_CANDIDATE" }), true);
});
