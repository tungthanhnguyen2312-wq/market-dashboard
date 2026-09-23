"use strict";
// CURRENT_DECISION_SURFACE_CONVERGENCE_V1 -- release-compatibility continuation.
// Producer and Dashboard ship from separate repositories, so the Dashboard source can go live
// before the first M1 data publication: "new Dashboard code + old Dashboard data". That order must
// be safe and semantically fail-closed:
//   - every surface stays renderable (no refusal of a valid pre-M1 payload, no JS exception);
//   - the primary action posture reads as explicitly unavailable;
//   - research_stance is NEVER promoted to the primary decision (a legacy WAIT_FOR_CONFIRMATION
//     stance never reads as the canonical action WAIT);
//   - missing evidence_currency is unavailable, never CURRENT_SESSION;
//   - research_stance stays available as the clearly secondary research screen.
// Generation A = real pre-M1 payloads (tests/fixtures/pre-m1-rolling-deploy-payloads.json, copied
// verbatim from the 2026-09-23 published data). Generation B = the same real cards carrying the
// additive M1 fields, which must keep every M1 behavior unchanged.
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const vf = require(path.join(root, "assets/js/value-format.js"));
const ws = require(path.join(root, "assets/js/investment-workspace.js"));
const home = require(path.join(root, "assets/js/dashboard-product-summary.js"));
const sm = require(path.join(root, "assets/js/screener-master.js"));
const signals = require(path.join(root, "assets/js/signals-product.js"));

const FIXTURE = JSON.parse(fs.readFileSync(path.join(__dirname, "fixtures/pre-m1-rolling-deploy-payloads.json"), "utf8"));
const UNAVAILABLE = "Chưa có tư thế hành động chuẩn hóa cho bản build này";
const WAIT_LABEL = "Chờ xác nhận";

function clone(value) { return JSON.parse(JSON.stringify(value)); }
function visible(html) {
  return String(html || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
}
function withoutDetails(html) {
  return String(html || "").replace(/<details[\s\S]*?<\/details>/gi, " ");
}
// The primary decision part of a Workspace drawer: its headline row (before any secondary keyline).
function drawerHeadline(html) {
  return String(html).split('<details class="ws-deep-evidence">')[0].split('<div class="ws-drawer-keyline">')[0];
}

const OLD = {
  workspace: () => clone(FIXTURE.workspace_index),
  screener: () => clone(FIXTURE.screener_master_projection),
  home: () => clone(FIXTURE.dashboard_home_summary),
};

// Generation B: same real cards, plus the additive M1 Producer fields.
const M1_FIELDS = {
  AAA: { research_action_posture: "AVOID", evidence_currency: "CURRENT_SESSION" },
  AAM: { research_action_posture: "INSUFFICIENT_CURRENT_RESEARCH", evidence_currency: "NO_CURRENT_EVIDENCE" },
  AFX: { research_action_posture: "HOLD", evidence_currency: "LAST_TRADE_AS_OF:2026-09-18" },
};
function m1Workspace() {
  const w = OLD.workspace();
  for (const [ticker, fields] of Object.entries(M1_FIELDS)) {
    Object.assign(w.cards[ticker], fields, {
      position_context: { status: "NOT_SUPPLIED", position_state: "UNKNOWN_POSITION_NOT_SUPPLIED" },
      opportunity_priority: { status: "AVAILABLE", research_priority_tier: "MONITOR" },
    });
  }
  w.coverage.research_action_posture_distribution = { AVOID: 1, HOLD: 1, INSUFFICIENT_CURRENT_RESEARCH: 1 };
  return w;
}
function m1Screener() {
  const s = OLD.screener();
  for (const [ticker, fields] of Object.entries(M1_FIELDS)) {
    s.cards[ticker].decision = Object.assign({ status: "AVAILABLE", position_context: "UNKNOWN_POSITION_NOT_SUPPLIED" }, fields);
  }
  return s;
}

test("fixture is genuinely pre-M1: no posture, no evidence currency, no decision view; AAM carries a legacy WAIT stance", () => {
  const raw = JSON.stringify({ w: FIXTURE.workspace_index, s: FIXTURE.screener_master_projection, h: FIXTURE.dashboard_home_summary });
  assert.doesNotMatch(raw, /research_action_posture|evidence_currency|"decision"/);
  assert.equal(FIXTURE.workspace_index.cards.AAM.research_stance, "WAIT_FOR_CONFIRMATION");
  assert.equal(FIXTURE.screener_master_projection.cards.AAM.research.stance, "WAIT_FOR_CONFIRMATION");
  assert.ok(FIXTURE.dashboard_home_summary.research_stance.counts.WAIT_FOR_CONFIRMATION > 0);
});

// ---------------------------------------------------------------- Generation A: pre-M1 data

test("A/Home: a valid pre-M1 summary is accepted and renders the primary decision as unavailable, never the stance", () => {
  const summary = OLD.home();
  assert.equal(home.validateHomeSummary(summary, FIXTURE.build_info_market_session), true, "valid pre-M1 summary must not be refused");
  let html;
  assert.doesNotThrow(() => { html = home.renderDecisionSummaryHtml(summary); });
  assert.doesNotThrow(() => home.heroBannerHtml(summary));
  const primary = withoutDetails(html);
  assert.match(primary, /data-action-posture-state="UNAVAILABLE"/);
  assert.match(visible(primary), new RegExp(UNAVAILABLE));
  assert.doesNotMatch(primary, /data-action-posture="/, "no posture card may be synthesized");
  assert.doesNotMatch(primary, /data-research-stance=/, "stance counts are never the primary summary");
  assert.doesNotMatch(visible(primary), new RegExp(WAIT_LABEL), "legacy WAIT stance must not appear as primary WAIT");
  // Evidence currency is unavailable, never counted as current-session.
  assert.match(primary, /data-evidence-currency="UNAVAILABLE"/);
  assert.doesNotMatch(primary, /data-evidence-currency="CURRENT_SESSION"/);
  // The stance stays available only in the collapsed secondary research screen.
  const secondary = (html.match(/<details[\s\S]*?<\/details>/) || [""])[0];
  assert.match(secondary, /phụ, không phải quyết định hành động/);
  assert.match(secondary, /data-research-stance="WAIT_FOR_CONFIRMATION"/);
  const waitCount = summary.research_stance.counts.WAIT_FOR_CONFIRMATION.toLocaleString("vi-VN");
  assert.match(visible(secondary), new RegExp(`${WAIT_LABEL}: ${waitCount.replace(".", "\\.")}`));
});

test("A/Home: a client-side summary of a pre-M1 projection carries no posture/currency blocks and renders unavailable", () => {
  const summary = home.summarizeScreenerOverview(OLD.screener());
  assert.equal(summary.research_action_posture, undefined, "no all-zero posture distribution for pre-M1 data");
  assert.equal(summary.evidence_currency, undefined, "no fabricated currency distribution for pre-M1 data");
  const primary = withoutDetails(home.renderDecisionSummaryHtml(summary));
  assert.match(visible(primary), new RegExp(UNAVAILABLE));
  assert.doesNotMatch(visible(primary), new RegExp(WAIT_LABEL));
});

test("A/Home: a present but malformed posture block is still refused (fail closed)", () => {
  const summary = OLD.home();
  assert.equal(home.validateHomeSummary({ ...summary, research_action_posture: null }, FIXTURE.build_info_market_session), false);
  assert.equal(home.validateHomeSummary({ ...summary, research_action_posture: { counts: 5 } }, FIXTURE.build_info_market_session), false);
});

test("A/Workspace: every real pre-M1 card renders with the primary posture explicitly unavailable", () => {
  const w = OLD.workspace();
  for (const [ticker, card] of Object.entries(w.cards)) {
    assert.equal(ws.actionPostureLabel(card), UNAVAILABLE, ticker);
    const badge = ws.actionPostureHtml(card);
    assert.match(badge, /data-action-posture="UNAVAILABLE"/, ticker);
    assert.doesNotMatch(badge, new RegExp(card.research_stance), `${ticker}: no stance-to-posture fallback`);
    const currency = ws.evidenceCurrencyHtml(card.evidence_currency);
    assert.doesNotMatch(currency, /data-evidence-currency="CURRENT_SESSION"/, ticker);
    assert.doesNotMatch(visible(currency), /phiên hiện tại/, ticker);
    let drawer;
    assert.doesNotThrow(() => { drawer = ws.decisionCardHtml(card, { ticker }); }, ticker);
    const headline = drawerHeadline(drawer);
    assert.match(headline, /data-action-posture="UNAVAILABLE"/, ticker);
    assert.match(visible(headline), new RegExp(UNAVAILABLE), ticker);
    assert.doesNotMatch(headline, /data-research-stance=|research_stance/, `${ticker}: stance must not headline the drawer`);
  }
});

test("A/Workspace: old WAIT_FOR_CONFIRMATION stance never appears as the primary WAIT; it remains a secondary screen", () => {
  const card = OLD.workspace().cards.AAM;
  assert.notEqual(ws.actionPostureLabel(card), WAIT_LABEL);
  assert.doesNotMatch(visible(ws.actionPostureHtml(card)), new RegExp(WAIT_LABEL));
  assert.doesNotMatch(visible(drawerHeadline(ws.decisionCardHtml(card, { ticker: "AAM" }))), new RegExp(WAIT_LABEL));
  const drawer = ws.decisionCardHtml(card, { ticker: "AAM" });
  assert.match(drawer, new RegExp(`Quyết định hành động: ${UNAVAILABLE}`));
  // Secondary research screen: still available, clearly labeled as secondary.
  const screen = ws.researchScreenHtml(card);
  assert.match(screen, /data-research-stance="WAIT_FOR_CONFIRMATION"/);
  assert.match(visible(screen), new RegExp(`Sàng lọc nghiên cứu \\(phụ\\): ${WAIT_LABEL}`));
  // Primary filters never match via the stance; the secondary stance filters still work.
  assert.equal(ws.matchesFilters(card, ["wait"]), false);
  for (const id of ["initiate", "accumulate", "early_watch", "hold", "avoid", "insufficient", "evidence_current", "evidence_stale", "evidence_none"]) {
    for (const c of Object.values(OLD.workspace().cards)) assert.equal(ws.matchesFilters(c, [id]), false, `${id} must not match pre-M1 ${c.ticker}`);
  }
  assert.equal(ws.matchesFilters(OLD.workspace().cards.AFX, ["screen_initiate"]), true);
  assert.equal(ws.matchesFilters(OLD.workspace().cards.AAA, ["screen_avoid"]), true);
});

test("A/Workspace: analysis row and T0 export keep posture/currency unavailable and the stance secondary", () => {
  const card = OLD.workspace().cards.AAM;
  const row = ws.analysisRowHtml(ws.analysisRecord(card));
  const decisionCell = row.split("<td")[2];
  assert.match(decisionCell, /data-action-posture="UNAVAILABLE"/);
  assert.doesNotMatch(visible(decisionCell.split("ws-research-screen")[0]), new RegExp(WAIT_LABEL));
  assert.match(decisionCell, /Sàng lọc nghiên cứu \(phụ\)/);
  const exported = ws.buildT0Export("AAM", card, "workspace_index/v1:x");
  assert.equal(exported.research_action_posture, null);
  assert.equal(exported.evidence_currency, null);
  assert.equal(exported.research_stance, "WAIT_FOR_CONFIRMATION");
  assert.equal(exported.research_stance_role, "SECONDARY_RESEARCH_SCREEN_CONTEXT");
});

test("A/Signals: pre-M1 rows show the posture unavailable, stance only as the secondary note", () => {
  const rows = signals.records(OLD.workspace());
  for (const row of rows) {
    assert.equal(row.posture, "UNAVAILABLE", row.ticker);
    let html;
    assert.doesNotThrow(() => { html = signals.renderRowHtml(row); });
    const decisionCell = html.split("<td")[2];
    const [primary, secondary] = decisionCell.split("Sàng lọc (phụ):");
    assert.match(visible(primary), new RegExp(UNAVAILABLE), row.ticker);
    assert.doesNotMatch(visible(primary), new RegExp(WAIT_LABEL), row.ticker);
    assert.doesNotMatch(visible(primary), /phiên hiện tại/, row.ticker);
    assert.ok(secondary, `${row.ticker}: secondary stance note present`);
  }
  const aam = signals.renderRowHtml(rows.find((r) => r.ticker === "AAM"));
  assert.match(visible(aam.split("Sàng lọc (phụ):")[1]), new RegExp(WAIT_LABEL), "legacy stance survives as the secondary screen");
});

test("A/Screener: decision cell is unavailable, evidence unavailable, legacy stance secondary; primary filters never match", () => {
  const cards = OLD.screener().cards;
  for (const [ticker, row] of Object.entries(cards)) {
    const cell = sm.formatDecisionCell(row, vf);
    assert.equal(cell.available, false, ticker);
    assert.equal(cell.label, UNAVAILABLE, ticker);
    assert.equal(cell.evidence_raw, "", ticker);
    assert.doesNotMatch(cell.evidence_label, /phiên hiện tại/, ticker);
    assert.equal(sm.matchesScreenerFilters(row, { posture: "WAIT_FOR_CONFIRMATION" }), false, ticker);
    assert.equal(sm.matchesScreenerFilters(row, { evidence: "CURRENT_SESSION" }), false, ticker);
    assert.equal(sm.matchesScreenerFilters(row, { stance: row.research.stance }), true, `${ticker}: secondary stance filter still works`);
  }
  assert.equal(sm.formatResearchScreenCell(cards.AAM, vf).label, WAIT_LABEL, "secondary column keeps the legacy screen");
  assert.notEqual(sm.formatDecisionCell(cards.AAM, vf).label, WAIT_LABEL);
});

test("A/Screener page: decision column reads through the unavailable-aware formatter; primary filters are disabled when absent", () => {
  const html = fs.readFileSync(path.join(root, "screener.html"), "utf8");
  assert.doesNotMatch(html, /data: "decision"/, "no bare property column that could warn on a pre-M1 row");
  assert.match(html, /SM\.formatDecisionCell\(row, window\.VSValueFormat\)/);
  assert.match(html, /markSelectUnavailable\("screen-posture", SM\.POSTURE_UNAVAILABLE_TEXT\)/);
  assert.match(html, /markSelectUnavailable\("screen-evidence"/);
  // The posture select is populated only from decision.research_action_posture, never research.stance.
  assert.match(html, /fillSelect\("screen-posture", \[\.\.\.new Set\(MASTER_ROWS\.map\(\(r\) => \(r\.decision \|\| \{\}\)\.research_action_posture\)/);
});

test("ROLLING DEPLOY REGRESSION: new Dashboard code + old Dashboard data is safe and semantically fail-closed on every surface", () => {
  const failures = [];
  const w = OLD.workspace();
  const s = OLD.screener();
  const h = OLD.home();
  const check = (surface, primaryText) => {
    const text = visible(primaryText);
    if (new RegExp(WAIT_LABEL).test(text)) failures.push(`${surface}: legacy WAIT shown as primary`);
    if (/phiên hiện tại/.test(text) && !/Chưa có/.test(text)) failures.push(`${surface}: currency shown as current`);
    if (!new RegExp(UNAVAILABLE).test(text)) failures.push(`${surface}: primary posture not explicitly unavailable`);
  };
  try {
    if (!home.validateHomeSummary(h, FIXTURE.build_info_market_session)) failures.push("home: refused valid pre-M1 summary");
    check("home", withoutDetails(home.renderDecisionSummaryHtml(h)));
    const aam = w.cards.AAM;
    check("workspace/badge", ws.actionPostureHtml(aam));
    check("workspace/drawer", drawerHeadline(ws.decisionCardHtml(aam, { ticker: "AAM" })));
    check("workspace/analysis", ws.analysisRowHtml(ws.analysisRecord(aam)).split("<td")[2].split("ws-research-screen")[0]);
    check("signals", signals.renderRowHtml(signals.records(w).find((r) => r.ticker === "AAM")).split("<td")[2].split("Sàng lọc (phụ):")[0]);
    check("screener", sm.formatDecisionCell(s.cards.AAM, vf).label);
  } catch (error) {
    failures.push(`JS exception: ${error && error.stack}`);
  }
  assert.deepEqual(failures, []);
});

// ---------------------------------------------------------------- Generation B: M1 data

test("B/M1 data: posture primary, currency explicit, stance secondary, HOLD conditional, NO_CURRENT_EVIDENCE never WAIT", () => {
  const w = m1Workspace();
  assert.equal(ws.actionPostureLabel(w.cards.AAA), "Tránh");
  assert.match(drawerHeadline(ws.decisionCardHtml(w.cards.AAA, { ticker: "AAA" })), /data-action-posture="AVOID"/);
  assert.equal(ws.actionPostureLabel(w.cards.AFX), "Nắm giữ — nếu đang nắm giữ");
  assert.match(visible(ws.evidenceCurrencyHtml(w.cards.AFX.evidence_currency)), /18\/09\/2026/);
  assert.match(ws.evidenceCurrencyHtml(w.cards.AAA.evidence_currency), /data-evidence-currency="CURRENT_SESSION"/);
  // AAM: legacy WAIT stance + NO_CURRENT_EVIDENCE -> insufficient, never WAIT anywhere on the card.
  assert.equal(ws.actionPostureLabel(w.cards.AAM), "Chưa đủ bằng chứng hiện tại");
  assert.doesNotMatch(visible(ws.decisionCardHtml(w.cards.AAM, { ticker: "AAM" }).replace(/<details[\s\S]*$/, "")), new RegExp(WAIT_LABEL));
  assert.equal(ws.matchesFilters(w.cards.AAM, ["insufficient"]), true);
  assert.equal(ws.matchesFilters(w.cards.AAM, ["wait"]), false);
  assert.equal(ws.matchesFilters(w.cards.AFX, ["screen_initiate"]), true, "stance stays a secondary screen");
  for (const card of Object.values(w.cards)) assert.notEqual(ws.actionPostureLabel(card), UNAVAILABLE);

  const s = m1Screener();
  assert.equal(sm.formatDecisionCell(s.cards.AFX, vf).label, "Nắm giữ — nếu đang nắm giữ");
  assert.match(sm.formatDecisionCell(s.cards.AFX, vf).evidence_label, /18\/09\/2026/);
  assert.equal(sm.formatDecisionCell(s.cards.AAM, vf).label, "Chưa đủ bằng chứng hiện tại");
  assert.match(sm.formatResearchScreenCell(s.cards.AAM, vf).label, /Không áp dụng/);
  assert.equal(sm.matchesScreenerFilters(s.cards.AAA, { posture: "AVOID" }), true);

  const rows = signals.records(w);
  const aamRow = signals.renderRowHtml(rows.find((r) => r.ticker === "AAM"));
  assert.doesNotMatch(visible(aamRow.split("<td")[2]), new RegExp(WAIT_LABEL));
  assert.doesNotMatch(aamRow, new RegExp(UNAVAILABLE));

  const summary = home.summarizeScreenerOverview(s);
  assert.equal(summary.research_action_posture.counts.AVOID, 1);
  assert.equal(summary.research_action_posture.counts.WAIT_FOR_CONFIRMATION, 0);
  const homeHtml = home.renderDecisionSummaryHtml(summary);
  const primary = withoutDetails(homeHtml);
  assert.match(primary, /data-action-posture="AVOID"/);
  assert.match(primary, /data-evidence-currency="CURRENT_SESSION"/);
  assert.doesNotMatch(primary, /data-action-posture-state="UNAVAILABLE"/);
  assert.doesNotMatch(primary, /data-research-stance=/);
});
