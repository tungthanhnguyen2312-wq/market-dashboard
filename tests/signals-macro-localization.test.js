"use strict";

/* Phase 4B — Vietnamese candlestick/SMC localization, accessible tooltips, and
 * deterministic macro chart colors/legend toggling. Pure-logic unit tests only
 * (no DOM/Chart.js dependency, no external test library) — matches this repo's
 * existing zero-dependency `node --test` convention (see company-panel.test.js).
 *
 * Phase 4C adds: (1) the legend must drive the REAL Chart.js dataset visibility
 * (assets/js/macro.js toggleDatasetVisibility/buildLegend), (2) pattern-name/SMC
 * tooltips with no "?" icon (textTrigger), (3) missing confidence renders nothing.
 * For (1) and (2) a minimal hand-rolled document/Chart stub (no jsdom, no new
 * dependency — defined below) lets buildLegend() run headlessly so button
 * classList/aria state can be asserted directly against the fake chart's real
 * visibility, not just the pure decision-logic. Full hover/focus/Escape/visual
 * verification is still done in a real browser separately (documented in the
 * compact report), not by these tests. */

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const cp = require("../assets/js/candlestick-patterns.js");
const macro = require("../assets/js/macro.js");

// ---------- Objective A: Vietnamese candlestick presentation ----------

test("lookupPatternInfo returns the existing registry entry (no second translation table)", () => {
  const registry = {
    bullish_engulfing: {
      key: "bullish_engulfing", name: "Bullish Engulfing", name_vi: "Nhấn chìm tăng",
      direction: "bullish", category: "reversal", description: "Thân tăng bao trọn thân giảm trước đó.",
    },
  };
  const info = cp.lookupPatternInfo(registry, "bullish_engulfing");
  assert.equal(info.name_vi, "Nhấn chìm tăng");
  assert.equal(info.name, "Bullish Engulfing");
  assert.equal(info.direction, "bullish");
});

test("lookupPatternInfo falls back to null for an unknown key or missing registry (English/row fallback happens at call site)", () => {
  assert.equal(cp.lookupPatternInfo({}, "unknown_pattern"), null);
  assert.equal(cp.lookupPatternInfo(null, "bullish_engulfing"), null);
  assert.equal(cp.lookupPatternInfo(undefined, "bullish_engulfing"), null);
});

// ---------- Confidence: existing score/stars rendering ----------

test("stars() renders the real confidence_stars/confidence_score with the required accessible text", () => {
  const html = cp.stars({ confidence_stars: 2, confidence_score: 81 });
  assert.match(html, /Mức độ tin cậy: 2 trên 3 sao/);
  assert.match(html, /<\/span> 81$/);
  assert.equal((html.match(/<svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor">/g) || []).length, 2, "2 filled stars");
  assert.equal((html.match(/empty-star/g) || []).length, 1, "1 empty star");
});

test("stars() clamps out-of-range star counts defensively (0-3) without ever exceeding 3 icons", () => {
  const html = cp.stars({ confidence_stars: 5, confidence_score: 99 });
  const totalStarIcons = (html.match(/<svg/g) || []).length;
  assert.equal(totalStarIcons, 3);
});

test("stars() never derives a rating from the pattern name — signature only accepts confidence fields", () => {
  // Same confidence fields, different (irrelevant) extra fields including a pattern name
  // that could tempt a name-based heuristic — output must be identical either way.
  const withName = cp.stars({ confidence_stars: 1, confidence_score: 42, pattern_name: "Bearish Engulfing" });
  const withoutName = cp.stars({ confidence_stars: 1, confidence_score: 42 });
  assert.equal(withName, withoutName);
});

// ---------- Objective C (Phase 4C): missing/malformed/zero confidence renders
// NOTHING — the old "Chưa đủ dữ liệu" placeholder text is removed entirely, and a
// rounded-to-0 star count is never drawn as a real "0 sao" result. ----------

test("stars() renders nothing (empty string, no placeholder) when no matching row exists at all", () => {
  const html = cp.stars(null);
  assert.equal(html, "");
});

test("stars() renders nothing when confidence fields are present but null/undefined (not coerced to 0)", () => {
  assert.equal(cp.stars({ confidence_stars: undefined, confidence_score: undefined }), "");
  assert.equal(cp.stars({ confidence_stars: null, confidence_score: 50 }), "");
  assert.equal(cp.stars({}), "");
});

test("stars() renders nothing when confidence_stars rounds to 0 — never a zero-star row", () => {
  assert.equal(cp.stars({ confidence_stars: 0, confidence_score: 10 }), "");
  assert.equal(cp.stars({ confidence_stars: 0.4, confidence_score: 10 }), "");
});

test("stars() never reintroduces the legacy 'Chưa đủ dữ liệu' placeholder for any unmatched/malformed/zero input", () => {
  for (const input of [null, {}, { confidence_stars: null, confidence_score: 1 }, { confidence_stars: 0, confidence_score: 1 }]) {
    assert.doesNotMatch(cp.stars(input), /Chưa đủ dữ liệu/);
  }
});

test("stars() still clamps a valid but out-of-range high value (5) to 3 rather than treating it as malformed", () => {
  // Distinguishes "malformed/missing" (renders nothing) from "a real, finite, just
  // out-of-spec producer value" (still a valid 1-3 result once clamped) — see the
  // "clamps out-of-range star counts" test above for the full assertion.
  assert.notEqual(cp.stars({ confidence_stars: 5, confidence_score: 99 }), "");
});

// ---------- Deterministic overview-to-detail confidence join ----------

function samplePatterns() {
  return [
    { ticker: "AAA", pattern_key: "hammer", timeframe: "1D", bars_ago: 0, confidence_score: 70, confidence_stars: 2 },
    { ticker: "AAA", pattern_key: "hammer", timeframe: "1D", bars_ago: 0, confidence_score: 90, confidence_stars: 3 },
    { ticker: "AAA", pattern_key: "hammer", timeframe: "1W", bars_ago: 0, confidence_score: 99, confidence_stars: 3 },
    { ticker: "AAA", pattern_key: "doji", timeframe: "1D", bars_ago: 3, confidence_score: 60, confidence_stars: 2 },
    { ticker: "BBB", pattern_key: "doji", timeframe: "1D", bars_ago: 0, confidence_score: 55, confidence_stars: 1 },
  ];
}

test("buildConfidenceIndex only joins on ticker + pattern_key + 1D timeframe + bars_ago===0 (fields that exist in both artifacts)", () => {
  const index = cp.buildConfidenceIndex({ patterns: samplePatterns() });
  assert.equal(index.size, 2, "only AAA|hammer and BBB|doji qualify");
  assert.equal(cp.confidenceFor(index, "AAA", "doji"), null, "bars_ago=3 must not match (not the current bar)");
  assert.equal(cp.confidenceFor(index, "CCC", "hammer"), null, "no such ticker");
});

test("buildConfidenceIndex resolves >1 matching row deterministically by highest confidence_score", () => {
  const index = cp.buildConfidenceIndex({ patterns: samplePatterns() });
  const match = cp.confidenceFor(index, "AAA", "hammer");
  assert.equal(match.confidence_score, 90, "the 1D/bars_ago=0 row with the higher score must win, not array order alone");
});

test("buildConfidenceIndex tie-break is stable (first-encountered wins when scores are equal)", () => {
  const rows = [
    { ticker: "ZZZ", pattern_key: "doji", timeframe: "1D", bars_ago: 0, confidence_score: 80, confidence_stars: 3, marker: "first" },
    { ticker: "ZZZ", pattern_key: "doji", timeframe: "1D", bars_ago: 0, confidence_score: 80, confidence_stars: 3, marker: "second" },
  ];
  const index = cp.buildConfidenceIndex({ patterns: rows });
  assert.equal(cp.confidenceFor(index, "ZZZ", "doji").marker, "first");
});

test("buildConfidenceIndex handles an empty/missing snapshot without throwing", () => {
  assert.equal(cp.buildConfidenceIndex(null).size, 0);
  assert.equal(cp.buildConfidenceIndex({}).size, 0);
  assert.equal(cp.buildConfidenceIndex({ patterns: [] }).size, 0);
});

// ---------- Objective B: SMC glossary — only the 4 real keys, no invented ones ----------

test("smcInfo covers all 4 real SMC keys with vi/abbr/tooltip/direction", () => {
  for (const key of ["ob_bull", "ob_bear", "fvg_bull", "fvg_bear"]) {
    const info = cp.smcInfo(key);
    assert.ok(info, `${key} must resolve`);
    assert.ok(info.vi && info.abbr && info.tooltip, `${key} must have vi/abbr/tooltip`);
    assert.ok(["bullish", "bearish"].includes(info.direction), `${key} must classify bullish/bearish`);
  }
});

test("smcDisplayLabel matches the recommended 'Vietnamese term + abbreviation' style", () => {
  assert.equal(cp.smcDisplayLabel("ob_bull"), "Khối lệnh tăng (OB Bull)");
  assert.equal(cp.smcDisplayLabel("ob_bear"), "Khối lệnh giảm (OB Bear)");
  assert.equal(cp.smcDisplayLabel("fvg_bull"), "Khoảng trống giá tăng (FVG Bull)");
  assert.equal(cp.smcDisplayLabel("fvg_bear"), "Khoảng trống giá giảm (FVG Bear)");
});

test("the confirmations[]/warnings[] naming variant resolves to the SAME entry as the smc[] naming variant (one source of truth)", () => {
  assert.deepEqual(cp.smcInfo("bullish_order_block"), cp.smcInfo("ob_bull"));
  assert.deepEqual(cp.smcInfo("bearish_order_block"), cp.smcInfo("ob_bear"));
  assert.deepEqual(cp.smcInfo("bullish_fvg"), cp.smcInfo("fvg_bull"));
  assert.deepEqual(cp.smcInfo("bearish_fvg"), cp.smcInfo("fvg_bear"));
});

test("no unsupported SMC concept (BOS, CHoCH, liquidity sweep) is invented", () => {
  for (const key of ["bos", "BOS", "choch", "CHoCH", "liquidity_sweep", "sweep", "change_of_character", "break_of_structure"]) {
    assert.equal(cp.smcInfo(key), null, `${key} must not exist in the glossary`);
  }
  const glossaryKeys = Object.keys(cp.SMC_GLOSSARY);
  for (const key of glossaryKeys) {
    assert.ok(!/bos|choch|sweep/i.test(key), `glossary key '${key}' must not reference an unsupported concept`);
  }
});

test("labelFor prefers the unified SMC glossary over the legacy confirmation/warning maps for the 4 real keys", () => {
  assert.equal(cp.labelFor("ob_bull", "confirmation"), "Khối lệnh tăng (OB Bull)");
  assert.equal(cp.labelFor("bullish_order_block", "confirmation"), "Khối lệnh tăng (OB Bull)");
  assert.equal(cp.labelFor("near_support", "confirmation"), "Gần hỗ trợ");
  assert.equal(cp.labelFor("low_liquidity", "warning"), "Thanh khoản thấp");
});

// ---------- Objective C: tooltip content escaping ----------

test("tooltipTrigger escapes HTML-special characters in both the tooltip text and the aria-label", () => {
  const html = cp.tooltipTrigger('<img src=x onerror=alert(1)>', '"><script>bad()</script>');
  assert.doesNotMatch(html, /<img/);
  assert.doesNotMatch(html, /<script>bad\(\)/);
  assert.match(html, /data-tooltip="&lt;img src=x onerror=alert\(1\)&gt;"/);
  assert.match(html, /aria-describedby="vs-tooltip-bubble"/);
});

test("tooltipTrigger returns nothing for empty text (no dangling trigger with no content)", () => {
  assert.equal(cp.tooltipTrigger("", "label"), "");
  assert.equal(cp.tooltipTrigger(null, "label"), "");
});

// ---------- Objective B (Phase 4C): pattern-name/SMC tooltip trigger with no "?"
// icon — the visible text itself becomes the [data-tooltip] trigger. ----------

test("textTrigger makes the label itself the [data-tooltip] trigger, with no '?' button/icon", () => {
  const html = cp.textTrigger("Doji", "Giải thích Doji");
  assert.equal(html, '<span class="vs-text-trigger" data-tooltip="Giải thích Doji" aria-describedby="vs-tooltip-bubble" aria-expanded="false" tabindex="0">Doji</span>');
  assert.doesNotMatch(html, /vs-info-trigger/);
  assert.doesNotMatch(html, />\?</, "must not render a bare '?' glyph as trigger content");
});

test("textTrigger is keyboard-focusable and exposes the same aria-describedby/aria-expanded disclosure contract as tooltipTrigger", () => {
  const html = cp.textTrigger("Doji", "text");
  assert.match(html, /aria-describedby="vs-tooltip-bubble"/);
  assert.match(html, /aria-expanded="false"/);
  assert.match(html, /tabindex="0"/);
});

test("textTrigger escapes both label and tooltip text (no innerHTML injection)", () => {
  const html = cp.textTrigger("<b>X</b>", "<img src=x onerror=alert(1)>");
  assert.doesNotMatch(html, /<b>|<img/);
  assert.match(html, /&lt;b&gt;X&lt;\/b&gt;/);
  assert.match(html, /data-tooltip="&lt;img src=x onerror=alert\(1\)&gt;"/);
});

test("textTrigger returns just the escaped label (no wrapper) when there is no tooltip text", () => {
  assert.equal(cp.textTrigger("Plain", ""), "Plain");
  assert.equal(cp.textTrigger("Plain", null), "Plain");
  assert.equal(cp.textTrigger("<i>Plain</i>", ""), "&lt;i&gt;Plain&lt;/i&gt;", "still escapes even with no tooltip");
});

test("textTrigger output still carries [data-tooltip], so bindEvents()'s company-panel guard (event.target.closest('[data-tooltip]')) continues to catch it", () => {
  assert.match(cp.textTrigger("Doji", "text"), /data-tooltip="/);
});

function sampleRow(overrides) {
  return Object.assign({
    ticker: "AAA", direction: "bullish", timeframe: "1D", status: "completed",
    bars_ago: 0, detected_at: "2026-07-20", close: 10, change_pct: 1,
    pattern_key: "hammer", pattern_name_vi: "Búa", pattern_name: "Hammer",
    pattern_metadata: { description: "Giải thích mẫu Búa." },
    confirmations: ["ob_bull", "near_support"], warnings: [],
    confidence_stars: 2, confidence_score: 80,
  }, overrides || {});
}

test("rowHtml renders the Vietnamese pattern name as its own tooltip trigger — no separate '?' icon beside it", () => {
  const html = cp.rowHtml(sampleRow());
  const nameCell = html.match(/<td><strong>[\s\S]*?<\/small><\/td>/)[0];
  assert.ok(nameCell.includes('class="vs-text-trigger"'), "name must use the text-trigger presentation");
  assert.ok(!nameCell.includes("vs-info-trigger"), "no ? button inside the name cell");
  assert.ok(!nameCell.includes(">?<"), "no bare ? glyph inside the name cell");
  assert.ok(nameCell.includes(">Búa<"), "visible Vietnamese name stays readable text");
  assert.ok(nameCell.includes("Hammer"), "English secondary name is retained");
});

test("tags() renders SMC confirmations with the text-itself trigger (no '?'), while non-SMC confirmations keep their existing '?' button", () => {
  const html = cp.tags(["ob_bull", "near_support"], "confirmation");
  assert.ok(html.includes('class="vs-text-trigger"'), "SMC tag (ob_bull) must use the text-trigger presentation");
  assert.ok(html.includes("vs-info-trigger"), "non-SMC tag (near_support) keeps its existing ? button — out of scope for Objective B");
});

test("tags() applies the no-'?' presentation to all 4 real SMC concepts without inventing new ones", () => {
  const html = cp.tags(["ob_bull", "ob_bear", "fvg_bull", "fvg_bear"], "confirmation");
  assert.ok(!html.includes("vs-info-trigger"), "all 4 real SMC keys must use the text-trigger presentation, none fall back to '?'");
  for (const label of ["Khối lệnh tăng (OB Bull)", "Khối lệnh giảm (OB Bear)", "Khoảng trống giá tăng (FVG Bull)", "Khoảng trống giá giảm (FVG Bear)"]) {
    assert.ok(html.includes(label), `${label} must be present`);
  }
});

// ---------- Objective D: deterministic, stable indicator colors ----------

test("colorForIndicator is deterministic and identical across repeated calls (stable across reloads)", () => {
  const keys = Object.keys(macro.INDICATOR_COLORS);
  for (const key of keys) {
    const a = macro.colorForIndicator(key);
    const b = macro.colorForIndicator(key);
    assert.equal(a, b);
    assert.match(a, /^#[0-9a-fA-F]{6}$/);
  }
});

test("colorForIndicator gives every currently-charted series key its own distinct color", () => {
  const chartedKeys = new Set(macro.CHART_GROUPS.flatMap((g) => g.keys));
  const colors = [...chartedKeys].map((key) => macro.colorForIndicator(key));
  assert.equal(new Set(colors).size, colors.length, "no two charted indicators should share a color");
});

test("colorForIndicator never relies on array position — same key, same color regardless of neighbor availability", () => {
  // Simulates the exact bug being fixed: with the old index%length scheme, us_10y's
  // color depended on whether us_fedfunds was present. The new scheme must not.
  const a = macro.colorForIndicator("us_10y");
  const b = macro.colorForIndicator("us_10y");
  assert.equal(a, b);
});

test("colorForIndicator gives a deterministic fallback color to an unmapped key (future new indicator)", () => {
  const a = macro.colorForIndicator("some_future_indicator");
  const b = macro.colorForIndicator("some_future_indicator");
  assert.equal(a, b);
  assert.match(a, /^#[0-9a-fA-F]{6}$/);
});

test("no chart group currently includes the 4 table-only equity indices (hsi/nasdaq/nikkei/sp500)", () => {
  const chartedKeys = new Set(macro.CHART_GROUPS.flatMap((g) => g.keys));
  for (const key of ["hsi", "nasdaq", "nikkei", "sp500"]) {
    assert.ok(!chartedKeys.has(key), `${key} must not be added as a chart series in this phase`);
  }
});

// ---------- Objective D: final-visible-series protection (pure decision logic) ----------

test("countVisible counts datasets whose hidden flag is not true", () => {
  assert.equal(macro.countVisible([false, false, false]), 3);
  assert.equal(macro.countVisible([true, false, true]), 1);
  assert.equal(macro.countVisible([true, true, true]), 0);
});

test("wouldHideLastVisible blocks hiding the only remaining visible series", () => {
  assert.equal(macro.wouldHideLastVisible([false, true, true], 0), true);
  assert.equal(macro.wouldHideLastVisible([false, false, true], 0), false, "another series stays visible");
});

test("wouldHideLastVisible does not block re-showing an already-hidden series", () => {
  assert.equal(macro.wouldHideLastVisible([true, false, true], 0), false);
});

test("soleVisibleIndex identifies exactly which control must be locked, or -1 when none/multiple are visible", () => {
  assert.equal(macro.soleVisibleIndex([true, false, true]), 1);
  assert.equal(macro.soleVisibleIndex([false, false, true]), -1);
  assert.equal(macro.soleVisibleIndex([true, true, true]), -1);
});

// ---------- Objective A (Phase 4C): the legend control must hide/show the REAL
// Chart.js dataset (setDatasetVisibility/isDatasetVisible + update()), not just
// change label styling. A minimal fake chart records exactly what the public
// Chart.js visibility API was called with — no real Chart.js/canvas needed. ----------

function makeFakeChart(initialVisible) {
  const visible = initialVisible.slice();
  const setCalls = [];
  let updateCalls = 0;
  return {
    isDatasetVisible: (i) => visible[i],
    setDatasetVisibility: (i, v) => { setCalls.push([i, v]); visible[i] = v; },
    update: () => { updateCalls += 1; },
    _setCalls: setCalls,
    _updateCalls: () => updateCalls,
  };
}

test("toggleDatasetVisibility maps the control to the correct dataset index and calls the public Chart.js visibility API", () => {
  const chart = makeFakeChart([true, true, true]);
  const ok = macro.toggleDatasetVisibility(chart, 3, 1);
  assert.equal(ok, true);
  assert.deepEqual(chart._setCalls, [[1, false]], "only dataset index 1 must be touched");
  assert.equal(chart.isDatasetVisible(1), false, "the real Chart.js dataset visibility must flip");
});

test("toggleDatasetVisibility calls chart.update() exactly once after a successful visibility change", () => {
  const chart = makeFakeChart([true, true]);
  macro.toggleDatasetVisibility(chart, 2, 0);
  assert.equal(chart._updateCalls(), 1);
});

test("toggling one series leaves every other dataset's visibility untouched", () => {
  const chart = makeFakeChart([true, true, true]);
  macro.toggleDatasetVisibility(chart, 3, 1);
  assert.equal(chart.isDatasetVisible(0), true);
  assert.equal(chart.isDatasetVisible(2), true);
});

test("toggleDatasetVisibility restores a hidden series back to visible", () => {
  const chart = makeFakeChart([true, false, true]);
  const ok = macro.toggleDatasetVisibility(chart, 3, 1);
  assert.equal(ok, true);
  assert.equal(chart.isDatasetVisible(1), true);
});

test("final-visible-series protection blocks hiding the last visible dataset — no API call, no update()", () => {
  const chart = makeFakeChart([false, false, true]); // only index 2 visible
  const ok = macro.toggleDatasetVisibility(chart, 3, 2);
  assert.equal(ok, false);
  assert.deepEqual(chart._setCalls, []);
  assert.equal(chart._updateCalls(), 0);
  assert.equal(chart.isDatasetVisible(2), true, "protected dataset must remain visible");
});

test("restoring another series unlocks the formerly protected control", () => {
  const chart = makeFakeChart([false, false, true]); // only index 2 visible, its control is locked
  assert.equal(macro.toggleDatasetVisibility(chart, 3, 2), false, "still locked while sole visible");
  assert.equal(macro.toggleDatasetVisibility(chart, 3, 0), true, "restoring index 0 is always allowed");
  assert.equal(macro.toggleDatasetVisibility(chart, 3, 2), true, "index 2 is no longer the sole visible series, so it unlocks");
  assert.equal(chart.isDatasetVisible(2), false);
});

// ---------- buildLegend(): DOM state must mirror the real chart, never line-through.
// Minimal hand-rolled document/element stub (no jsdom) so the click handler wired
// inside buildLegend() runs for real and its resulting classList/aria state can be
// asserted against the fake chart's actual visibility. ----------

function makeFakeElement(tag) {
  const el = {
    tagName: String(tag).toUpperCase(),
    _classes: [], _attrs: {}, _listeners: {}, children: [], style: {},
  };
  Object.defineProperty(el, "className", {
    get() { return el._classes.join(" "); },
    set(value) { el._classes = value ? String(value).split(/\s+/).filter(Boolean) : []; },
  });
  Object.defineProperty(el, "textContent", {
    get() { return el._text || ""; },
    set(value) { el._text = value; },
  });
  el.classList = {
    add: (c) => { if (!el._classes.includes(c)) el._classes.push(c); },
    remove: (c) => { el._classes = el._classes.filter((x) => x !== c); },
    toggle: (c, force) => {
      const has = el._classes.includes(c);
      const want = force === undefined ? !has : Boolean(force);
      if (want && !has) el._classes.push(c);
      if (!want && has) el._classes = el._classes.filter((x) => x !== c);
      return want;
    },
    contains: (c) => el._classes.includes(c),
  };
  el.append = (...nodes) => { nodes.forEach((n) => el.children.push(n)); };
  el.appendChild = (n) => { el.children.push(n); return n; };
  el.setAttribute = (name, value) => { el._attrs[name] = String(value); };
  el.getAttribute = (name) => (Object.prototype.hasOwnProperty.call(el._attrs, name) ? el._attrs[name] : null);
  el.addEventListener = (type, handler) => { (el._listeners[type] = el._listeners[type] || []).push(handler); };
  el.dispatch = (type) => { (el._listeners[type] || []).forEach((h) => h({ target: el })); };
  return el;
}

function withFakeDomMacro(run) {
  const hadDocument = Object.prototype.hasOwnProperty.call(global, "document");
  const previousDocument = global.document;
  global.document = { createElement: makeFakeElement, addEventListener: () => {} };
  try {
    delete require.cache[require.resolve("../assets/js/macro.js")];
    run(require("../assets/js/macro.js"));
  } finally {
    delete require.cache[require.resolve("../assets/js/macro.js")];
    if (hadDocument) global.document = previousDocument; else delete global.document;
  }
}

test("buildLegend: active/inactive UI state mirrors the real chart.isDatasetVisible(), not a separate UI-only boolean", () => {
  withFakeDomMacro((macroDom) => {
    const chart = makeFakeChart([true, true]);
    const container = makeFakeElement("div");
    macroDom.buildLegend(container, chart, [{ label: "A", borderColor: "#111" }, { label: "B", borderColor: "#222" }]);
    const [btnA] = container.children;
    btnA.dispatch("click"); // hide A
    assert.equal(chart.isDatasetVisible(0), false);
    assert.equal(btnA.classList.contains("is-active"), false, "UI must reflect the real (now hidden) chart state");
    assert.equal(btnA.getAttribute("aria-pressed"), "false");
    btnA.dispatch("click"); // restore A
    assert.equal(chart.isDatasetVisible(0), true);
    assert.equal(btnA.classList.contains("is-active"), true);
    assert.equal(btnA.getAttribute("aria-pressed"), "true");
  });
});

test("buildLegend: never sets an inline strikethrough/line-through style on the inactive control", () => {
  withFakeDomMacro((macroDom) => {
    const chart = makeFakeChart([true, true]);
    const container = makeFakeElement("div");
    macroDom.buildLegend(container, chart, [{ label: "A", borderColor: "#111" }, { label: "B", borderColor: "#222" }]);
    const [btnA] = container.children;
    btnA.dispatch("click");
    assert.equal(btnA.style.textDecoration, undefined, "must not set inline line-through styling");
  });
});

test("buildLegend: final-visible-series protection is wired through to the DOM — a locked control ignores clicks", () => {
  withFakeDomMacro((macroDom) => {
    const chart = makeFakeChart([false, true]); // only index 1 visible
    const container = makeFakeElement("div");
    macroDom.buildLegend(container, chart, [{ label: "A", borderColor: "#111" }, { label: "B", borderColor: "#222" }]);
    const [, btnB] = container.children;
    assert.equal(btnB.getAttribute("aria-disabled"), "true");
    btnB.dispatch("click");
    assert.equal(chart.isDatasetVisible(1), true, "locked control must not hide the last visible series");
  });
});

test("macro.css never uses text-decoration line-through for the legend (Objective A visual requirement)", () => {
  const css = fs.readFileSync(path.join(__dirname, "..", "assets", "css", "macro.css"), "utf8");
  assert.doesNotMatch(css, /line-through/);
});
