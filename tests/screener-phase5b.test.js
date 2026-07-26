"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const workflow = require("../assets/js/screener-workflow.js");

const current = { ticker: "HPG", exchange: "HSX", date: "2026-07-24", rs_rating: 88, rel_vol: 1.4, gtgd20_ty: 12, pe: 9, chg_today_pct: 2, rsi14: 62, margin_status: "", structure: "Uptrend" };
const stale = { ...current, ticker: "SSI", date: "2026-07-23", rs_rating: 70, margin_status: "margin" };

test("quick presets use existing fields and do not imply hidden data", () => {
  assert.deepEqual(workflow.presetFilters("leaders"), { exchange: "", minRs: "80", minRelVol: "1", minLiquidity: "3", maxPe: "", signalState: "current", cleanOnly: false });
  assert.equal(workflow.matches(current, workflow.presetFilters("leaders"), "2026-07-24"), true);
  assert.equal(workflow.matches(stale, workflow.presetFilters("leaders"), "2026-07-24"), false);
});

test("detailed filters and clean rule preserve numeric zero/null semantics", () => {
  assert.equal(workflow.matches(current, { maxPe: "10", cleanOnly: true }, "2026-07-24"), true);
  assert.equal(workflow.matches({ ...current, gtgd20_ty: null }, { minLiquidity: "3" }, "2026-07-24"), false);
  assert.equal(workflow.matches({ ...current, gtgd20_ty: 0 }, { minLiquidity: "0" }, "2026-07-24"), true);
});

test("freshness and signals distinguish current, stale, and unavailable without fabricated history", () => {
  assert.equal(workflow.freshness(current, "2026-07-24"), "current");
  assert.equal(workflow.freshness(stale, "2026-07-24"), "stale");
  assert.equal(workflow.freshness({ ...current, date: null }, "2026-07-24"), "unknown");
  assert.equal(workflow.signal(current, "2026-07-24").momentum, "momentum");
});

test("provider or user text remains escaped in workflow renderer helpers", () => {
  assert.equal(workflow.esc('<img src=x onerror=alert(1)>'), "&lt;img src=x onerror=alert(1)&gt;");
});
