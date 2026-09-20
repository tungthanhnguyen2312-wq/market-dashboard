"use strict";
// DASHBOARD_INVESTOR_FIRST_LOCALIZATION_AND_UI_CLOSEOUT_V1 corrective closeout, Phase 3.
//
// value-format.js used to declare `function formatKnownLabel` twice in the same module
// closure. The later declaration silently won (later function declarations in the same
// scope overwrite earlier ones) and was narrower than the first: it checked only the
// single requested domain (no cross-domain fallback) and echoed the raw, untranslated
// value straight back to the caller on a miss. Every real caller across the dashboard
// (investment-workspace.js's rule_condition pill, decision-cockpit.js's status labels)
// was silently getting that narrower, leakier behavior. This file pins the consolidated,
// single implementation: explicit-domain lookup first, then a scan of every other domain
// table, and a safe investor-facing placeholder -- never the raw code -- on a total miss.
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const source = fs.readFileSync(path.join(root, "assets", "js", "value-format.js"), "utf8");
const vf = require(path.join(root, "assets", "js", "value-format.js"));

test("value-format.js declares exactly one formatKnownLabel", () => {
  const matches = source.match(/function formatKnownLabel\(/g) || [];
  assert.equal(matches.length, 1, `expected exactly one formatKnownLabel declaration, found ${matches.length}`);
});

test("known value in its own domain resolves directly", () => {
  assert.equal(vf.formatKnownLabel("PROFITABLE", "fundamental_state"), "Có lợi nhuận");
  assert.equal(vf.formatKnownLabel("DOWNTREND", "tactical_state"), "Xu hướng giảm");
});

test("cross-domain fallback: a value requested under the wrong domain still resolves", () => {
  // BLOCKED lives in availability_state, not liquidity_state -- formatKnownLabel must
  // scan every other domain table before giving up, not just the one it was told.
  assert.equal(vf.formatKnownLabel("BLOCKED", "liquidity_state"), "Bị chặn");
  assert.equal(vf.formatKnownLabel("blocked", "liquidity_state"), "Bị chặn");
  // NOT_APPLICABLE lives in diagnostic_reason (among others) -- resolves even when the
  // caller asks under an unrelated domain.
  assert.equal(vf.formatKnownLabel("not_applicable", "tactical_state"), "Không áp dụng");
});

test("representative statuses across independent domains all resolve to Vietnamese, never their raw form", () => {
  const cases = [
    ["AVAILABLE_QUALIFIED", "availability_state", "Đủ điều kiện nghiên cứu"],
    ["PERSISTENT_IMPROVEMENT", "signal_velocity_state"],
    ["FOREIGN_SELLING_PRICE_RESILIENCE", "flow_price_relationship"],
    ["LOSS_MAKING", "fundamental_state", "Đang lỗ"],
    ["UPTREND_CONFIRMED", "tactical_state", "Xu hướng tăng đã xác nhận"],
  ];
  for (const [raw, domain, expected] of cases) {
    const label = vf.formatKnownLabel(raw, domain);
    assert.notEqual(label, raw, `${domain}:${raw} must not echo its raw form`);
    assert.notEqual(label, raw.toLowerCase());
    assert.doesNotMatch(label, /^[A-Z0-9_]+$/, `${domain}:${raw} resolved to an upper-case/snake-case-looking label`);
    if (expected) assert.equal(label, expected);
  }
});

test("an unknown internal code never appears raw in the resolved label, across domains", () => {
  const unknowns = [
    ["ZZZ_TOTALLY_UNKNOWN_TOKEN", "diagnostic_reason"],
    ["NOT_A_REAL_RULE_CONDITION", "rule_condition"],
    ["some_never_registered_code", "tactical_state"],
    ["UNMAPPED_FLOW_STATE_9000", "flow_price_relationship"],
  ];
  for (const [raw, domain] of unknowns) {
    const label = vf.formatKnownLabel(raw, domain);
    assert.notEqual(label, raw, `${domain}:${raw} leaked its raw form`);
    assert.notEqual(label, "", `${domain}:${raw} resolved to an empty label`);
    assert.doesNotMatch(label, /^[A-Z0-9_]+$/, `${domain}:${raw} resolved to something that still looks like a raw code`);
  }
  // rule_condition has its own dedicated safe placeholder distinct from the generic one.
  assert.equal(vf.formatKnownLabel("NOT_A_REAL_RULE_CONDITION", "rule_condition"), "Điều kiện kỹ thuật");
  assert.equal(vf.formatKnownLabel("ZZZ_TOTALLY_UNKNOWN_TOKEN", "diagnostic_reason"), "Chưa xác định");
});

test("an explicitly empty value stays empty, matching every caller's own pre-check", () => {
  assert.equal(vf.formatKnownLabel("", "tactical_state"), "");
  assert.equal(vf.formatKnownLabel(null, "tactical_state"), "");
  assert.equal(vf.formatKnownLabel(undefined, "tactical_state"), "");
});

test("axis_label keeps its dedicated lookup (case-insensitive) alongside the domain-table path", () => {
  assert.equal(vf.formatKnownLabel("tactical", "axis_label"), "Thiết lập kỹ thuật");
  assert.equal(vf.formatKnownLabel("TACTICAL", "axis_label"), "Thiết lập kỹ thuật");
});

test("decision-cockpit's own formatLabel wrapper no longer depends on formatKnownLabel's raw-echo trick", () => {
  // Regression for the corrective fix: decision-cockpit.js's renderVerifyNextHtml passes
  // long free-text audit sentences through formatLabel(x) with NO domain. Those sentences
  // must render verbatim -- they are not enum codes, and must never be replaced by a
  // generic "Chưa xác định" placeholder just because nothing recognized them.
  const dcSource = fs.readFileSync(path.join(root, "assets", "js", "decision-cockpit.js"), "utf8");
  assert.doesNotMatch(dcSource, /vf\.formatKnownLabel\(/, "decision-cockpit.js should no longer call the fragile raw-echo-dependent path");
  const dc = require(path.join(root, "assets", "js", "decision-cockpit.js"));
  const sentence = "Use each card's exact confirmation trigger and invalidation; do not substitute new thresholds.";
  const html = dc.renderVerifyNextHtml({ what_to_verify_next: [sentence] });
  assert.ok(html.includes(sentence), "free-text verify-next item must render verbatim, not be replaced by a placeholder");
});
