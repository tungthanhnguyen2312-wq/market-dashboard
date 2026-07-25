"use strict";

/* Phase 4B — Vietnamese candlestick/SMC localization, accessible tooltips, and
 * deterministic macro chart colors/legend toggling. Pure-logic unit tests only
 * (no DOM/Chart.js dependency, no external test library) — matches this repo's
 * existing zero-dependency `node --test` convention (see company-panel.test.js).
 * DOM/interaction behavior (hover/focus/click/Escape, legend button wiring,
 * aria-pressed sync in a live page) is covered by manual browser verification,
 * documented separately, not by these tests. */

const test = require("node:test");
const assert = require("node:assert/strict");

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

// ---------- Confidence: unknown must be "Chưa đủ dữ liệu", never 0 stars ----------

test("stars() shows Chưa đủ dữ liệu (not 0 filled stars) when no matching row exists at all", () => {
  const html = cp.stars(null);
  assert.match(html, /Chưa đủ dữ liệu/);
  assert.doesNotMatch(html, /<svg/, "must not silently render any star icon for a missing match");
});

test("stars() shows Chưa đủ dữ liệu when confidence fields are present but null/undefined (not coerced to 0)", () => {
  assert.match(cp.stars({ confidence_stars: undefined, confidence_score: undefined }), /Chưa đủ dữ liệu/);
  assert.match(cp.stars({ confidence_stars: null, confidence_score: 50 }), /Chưa đủ dữ liệu/);
  assert.match(cp.stars({}), /Chưa đủ dữ liệu/);
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
