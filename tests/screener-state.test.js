"use strict";

/* Phase 5A — Screener URL and state foundation. Pure-logic unit tests only
 * (no DOM/browser globals, no external test library) — matches this repo's
 * existing zero-dependency `node --test` convention (see company-panel.test.js
 * and signals-macro-localization.test.js).
 *
 * company-panel.js keeps the ?ticker= URL/history contract in small pure
 * functions (normalizeTicker, tickerFromSearch, searchWithTicker) plus two
 * pure decision functions (decideOpenAction, decideCloseAction) that the
 * DOM-facing open/close code executes against the real history/location.
 * These tests exercise exactly those pure functions and the state-machine
 * decisions they drive; DOM wiring (row click, Escape, focus, drawer CSS)
 * is covered by the existing company-panel/navigation contract tests plus
 * manual browser verification (Back/Forward, filters/scroll preservation)
 * documented in the Phase 5A report — neither jsdom nor a browser is
 * available to this zero-dependency suite.
 */

const test = require("node:test");
const assert = require("node:assert/strict");

const {
  normalizeTicker,
  tickerFromSearch,
  searchWithTicker,
  decideOpenAction,
  decideCloseAction,
  isScreenerPage,
} = require("../assets/js/company-panel.js");

// company-panel.js is shared with dashboard.html and signals.html — history/URL
// writes must stay Screener-only. Runs with a minimal fake `document` (no jsdom)
// since Node has no `document` global; always restored, even on failure.
function withFakeDocument(page, fn) {
  const had = Object.prototype.hasOwnProperty.call(global, "document");
  const prior = global.document;
  global.document = { body: { dataset: { page } } };
  try {
    fn();
  } finally {
    if (had) global.document = prior; else delete global.document;
  }
}

// ---------- normalizeTicker: validation / injection safety ----------

test("normalizeTicker uppercases and trims a valid ticker", () => {
  assert.equal(normalizeTicker(" hpg "), "HPG");
  assert.equal(normalizeTicker("Vcb"), "VCB");
});

test("normalizeTicker accepts real VN ticker shapes (3-char alnum)", () => {
  for (const t of ["HPG", "VCB", "SSI", "BVH", "PAN", "C69", "TT6"]) {
    assert.equal(normalizeTicker(t), t);
  }
});

test("normalizeTicker rejects empty, missing, and whitespace-only input", () => {
  assert.equal(normalizeTicker(""), null);
  assert.equal(normalizeTicker("   "), null);
  assert.equal(normalizeTicker(null), null);
  assert.equal(normalizeTicker(undefined), null);
});

test("normalizeTicker rejects HTML/script injection attempts", () => {
  assert.equal(normalizeTicker("<script>alert(1)</script>"), null);
  assert.equal(normalizeTicker("HPG<img src=x>"), null);
  assert.equal(normalizeTicker("javascript:alert(1)"), null);
});

test("normalizeTicker rejects punctuation, spaces-inside, and over-long values", () => {
  assert.equal(normalizeTicker("HPG;DROP TABLE"), null);
  assert.equal(normalizeTicker("HP G"), null);
  assert.equal(normalizeTicker("HPG/../etc"), null);
  assert.equal(normalizeTicker("A".repeat(11)), null);
});

// ---------- tickerFromSearch / searchWithTicker: URL contract ----------

test("tickerFromSearch extracts a normalized ticker from a query string", () => {
  assert.equal(tickerFromSearch("?ticker=hpg"), "HPG");
  assert.equal(tickerFromSearch("?foo=1&ticker=VCB&bar=2"), "VCB");
});

test("tickerFromSearch returns null when the param is absent or invalid", () => {
  assert.equal(tickerFromSearch(""), null);
  assert.equal(tickerFromSearch("?foo=1"), null);
  assert.equal(tickerFromSearch("?ticker="), null);
  assert.equal(tickerFromSearch("?ticker=<script>"), null);
});

test("searchWithTicker sets the ticker param and preserves unrelated params", () => {
  assert.equal(searchWithTicker("?foo=1&bar=2", "HPG"), "?foo=1&bar=2&ticker=HPG");
});

test("searchWithTicker updates an existing ticker in place without disturbing order", () => {
  assert.equal(searchWithTicker("?foo=1&ticker=OLD&bar=2", "NEW"), "?foo=1&ticker=NEW&bar=2");
});

test("searchWithTicker(null) removes only the ticker param, keeping everything else", () => {
  assert.equal(searchWithTicker("?foo=1&ticker=HPG&bar=2", null), "?foo=1&bar=2");
});

test("searchWithTicker returns empty string when no params remain", () => {
  assert.equal(searchWithTicker("?ticker=HPG", null), "");
  assert.equal(searchWithTicker("", null), "");
});

test("searchWithTicker round-trips through tickerFromSearch", () => {
  const search = searchWithTicker("?exchange=HOSE", "SSI");
  assert.equal(tickerFromSearch(search), "SSI");
  assert.match(search, /exchange=HOSE/);
});

// ---------- decideOpenAction: click / switch / dedup / restore ----------

test("opening a ticker from a ticker-less URL pushes a new history entry", () => {
  assert.deepEqual(decideOpenAction(null, null, "HPG", true), { render: true, history: "push" });
});

test("re-clicking the already-open ticker is a no-op for history (dedup)", () => {
  assert.deepEqual(decideOpenAction("HPG", "HPG", "HPG", true), { render: true, history: "none" });
});

test("switching to a different ticker while one is open pushes a new entry", () => {
  assert.deepEqual(decideOpenAction("HPG", "HPG", "VCB", true), { render: true, history: "push" });
});

test("a direct URL load (URL already matches, first time this session) bootstraps history", () => {
  assert.deepEqual(decideOpenAction("HPG", null, "HPG", false), { render: true, history: "bootstrap" });
});

test("a popstate-driven restore (URL already matches, already primed) does not touch history", () => {
  assert.deepEqual(decideOpenAction("HPG", null, "HPG", true), { render: true, history: "none" });
});

test("opening with no resolvable ticker renders nothing", () => {
  assert.deepEqual(decideOpenAction(null, null, null, true), { render: false });
});

// ---------- decideCloseAction: explicit close vs already-closed ----------
// decideCloseAction takes the CURRENT entry's push-depth (0 = already closed),
// not the ticker string, so explicit close can jump straight to the closed
// state in one navigation regardless of how many tickers were switched through.

test("closing after a single open steps back exactly one entry", () => {
  assert.deepEqual(decideCloseAction(1), { hide: false, history: "back", steps: 1 });
});

test("closing after switching tickers twice steps back the FULL depth, not one step", () => {
  // Regression: explicit Close must always fully close ("Escape-to-close" is an
  // existing contract) — it must never just reopen the previously-selected
  // ticker, which is Back's job, not Close's. Caught via live browser testing.
  assert.deepEqual(decideCloseAction(2), { hide: false, history: "back", steps: 2 });
});

test("closing when already at depth 0 just hides (popstate-driven, no navigation)", () => {
  assert.deepEqual(decideCloseAction(0), { hide: true, history: "none" });
});

// ---------- Full open/switch/back/forward/close sequences (fake history) ----------
// Small hand-rolled session-history stub — no jsdom, mirrors the fake Chart/document
// stub pattern already used in signals-macro-localization.test.js. Each entry
// carries its own {search, vsDepth}, exactly like real browser history state,
// so these tests exercise the identical push/depth/go(-N) logic company-panel.js
// runs against the real `history`/`location` objects.

function makeHistorySim(initialSearch) {
  const entries = [{ search: initialSearch, vsDepth: 0 }];
  let index = 0;
  return {
    get search() { return entries[index].search; },
    get depth() { return entries[index].vsDepth; },
    push(search) { const vsDepth = entries[index].vsDepth + 1; entries.length = index + 1; entries.push({ search, vsDepth }); index++; },
    replace(search, vsDepth) { entries[index] = { search, vsDepth }; },
    back() { if (index > 0) index--; },
    forward() { if (index < entries.length - 1) index++; },
    go(delta) { index = Math.max(0, Math.min(entries.length - 1, index + delta)); },
    length() { return entries.length; },
    // Injects an entry with an ARBITRARY depth, simulating a stale/foreign/corrupted
    // history entry not produced by this session's own push/bootstrap logic.
    injectRaw(search, vsDepth) { entries.length = index + 1; entries.push({ search, vsDepth }); index++; },
  };
}

// Thin controller mirroring openPanel/closePanel/hidePanelUI/handlePopState's exact
// decision + history calls, including which of close() vs hide() each path uses.
function makeController(sim) {
  let openTicker = null;
  let primed = false;
  return {
    get openTicker() { return openTicker; },
    open(ticker) {
      const action = decideOpenAction(tickerFromSearch(sim.search), openTicker, ticker, primed);
      if (!action.render) return action;
      openTicker = ticker;
      if (action.history === "bootstrap") {
        sim.replace(searchWithTicker(sim.search, null), 0);
        sim.push(searchWithTicker(sim.search, ticker));
        primed = true;
      } else if (action.history === "push") {
        sim.push(searchWithTicker(sim.search, ticker));
        primed = true;
      }
      return action;
    },
    // Mirrors closePanel(): explicit user close — the ONLY path allowed to navigate.
    close() {
      const action = decideCloseAction(sim.depth);
      if (action.history === "back") { sim.go(-action.steps); openTicker = tickerFromSearch(sim.search); return action; }
      openTicker = null;
      return action;
    },
    // Mirrors hidePanelUI(): hides only, NEVER touches history. Used exclusively by
    // popstate reactions, since the browser has already finished navigating by then.
    hide() { openTicker = null; },
    // Mirrors handlePopState(): must call hide(), never close(), on every branch.
    reactToPopState(cache) {
      const ticker = tickerFromSearch(sim.search);
      if (ticker === openTicker) return "noop";
      if (!ticker) { this.hide(); return "hidden"; }
      const row = cache.get(ticker);
      if (row) { this.open(ticker); return "reopened"; }
      this.hide();
      return "hidden-unresolvable";
    },
  };
}

test("open A, switch to B, Close fully closes in one step (not just restoring A)", () => {
  const sim = makeHistorySim("");
  const c = makeController(sim);

  c.open("HPG");
  assert.equal(tickerFromSearch(sim.search), "HPG");
  assert.equal(sim.length(), 2);

  c.open("VCB"); // switch while open
  assert.equal(tickerFromSearch(sim.search), "VCB");
  assert.equal(sim.depth, 2, "switching accumulates depth (2 pushes since the closed baseline)");

  c.close(); // explicit Close (X / Escape / backdrop) — must fully close, not restore HPG
  assert.equal(tickerFromSearch(sim.search), null, "Close always reaches the fully-closed state");
  assert.equal(c.openTicker, null);
  assert.equal(sim.length(), 3, "close never deletes/duplicates entries, only navigates them");
});

test("real browser Back (not the Close button) does restore the previously selected ticker", () => {
  // decideCloseAction/history.go(-N) is only for the explicit Close button.
  // Actual browser Back always moves exactly one entry, independent of it.
  const sim = makeHistorySim("");
  const c = makeController(sim);
  c.open("HPG");
  c.open("VCB");
  sim.back(); // the physical Back button, one entry at a time
  assert.equal(tickerFromSearch(sim.search), "HPG", "Back restores the previously selected ticker");
});

test("re-clicking the open ticker never grows history depth", () => {
  const sim = makeHistorySim("");
  const c = makeController(sim);
  c.open("HPG");
  assert.equal(sim.length(), 2);
  const dup1 = c.open("HPG");
  const dup2 = c.open("HPG");
  assert.equal(dup1.history, "none");
  assert.equal(dup2.history, "none");
  assert.equal(sim.length(), 2, "duplicate clicks on the same open ticker must not add entries");
});

test("direct URL load then Close leaves a safe entry to land on (never navigates off-site)", () => {
  const sim = makeHistorySim("?ticker=HPG"); // simulates a bookmarked/shared link landing here first
  const c = makeController(sim);

  const bootstrapAction = c.open("HPG"); // company-panel.js resolves the row and calls open() once
  assert.equal(bootstrapAction.history, "bootstrap");
  assert.equal(tickerFromSearch(sim.search), "HPG", "address bar still reflects the loaded URL");
  assert.equal(sim.length(), 2, "a closed baseline entry was inserted beneath the open one");

  c.close();
  assert.equal(tickerFromSearch(sim.search), null, "closing lands on the synthesized closed entry, not off-site");
  assert.equal(c.openTicker, null);
});

test("direct URL load, then switch to a second ticker, then Close still fully closes", () => {
  const sim = makeHistorySim("?ticker=HPG");
  const c = makeController(sim);
  c.open("HPG"); // bootstrap: [closed(0), HPG(1)]
  c.open("VCB"); // switch: [closed(0), HPG(1), VCB(2)]
  assert.equal(sim.depth, 2);
  c.close();
  assert.equal(tickerFromSearch(sim.search), null);
  assert.equal(sim.length(), 3);
});

test("forward after back reopens the correct ticker", () => {
  const sim = makeHistorySim("");
  const c = makeController(sim);
  c.open("HPG");
  sim.back();
  assert.equal(tickerFromSearch(sim.search), null);
  sim.forward();
  assert.equal(tickerFromSearch(sim.search), "HPG", "forward restores the ticker URL");
});

// ---------- popstate reactions must never trigger a further history.go() ----------
// Regression: handlePopState's fallbacks originally called the full close() (i.e.
// closePanel), which re-reads the CURRENT entry's depth and re-navigates. A stale/
// foreign entry landed on via Back/Forward can carry an arbitrary depth (e.g. an
// entry this session never pushed), and blindly acting on it caused a SECOND,
// wrong history.go() — in the real browser this produced a visible bug: the panel
// stayed stuck open because history.go(-99) was out of range and silently did
// nothing, leaving the UI out of sync with a URL that already showed no ticker.
// Caught via live browser testing; reproduced here without a real DOM/history.

test("landing on a no-ticker entry with a stale non-zero depth just hides, no further navigation", () => {
  const sim = makeHistorySim("");
  const c = makeController(sim);
  c.open("HPG");
  sim.injectRaw("", 99); // foreign/corrupted entry: no ticker, but depth=99
  const positionBefore = { search: sim.search, depth: sim.depth, length: sim.length() };

  const result = c.reactToPopState(new Map());

  assert.equal(result, "hidden");
  assert.equal(c.openTicker, null);
  assert.deepEqual({ search: sim.search, depth: sim.depth, length: sim.length() }, positionBefore,
    "reacting to popstate must not move the history pointer or change entry count");
});

test("landing on an unresolvable (uncached) ticker just hides, no further navigation", () => {
  const sim = makeHistorySim("");
  const c = makeController(sim);
  c.open("HPG");
  sim.injectRaw(searchWithTicker("", "ZZZ"), 42); // ticker never opened this session
  const positionBefore = { search: sim.search, depth: sim.depth, length: sim.length() };

  const result = c.reactToPopState(new Map()); // empty cache — ZZZ is unresolvable

  assert.equal(result, "hidden-unresolvable");
  assert.equal(c.openTicker, null);
  assert.deepEqual({ search: sim.search, depth: sim.depth, length: sim.length() }, positionBefore,
    "an unresolvable ticker must degrade to hidden in place, never a blind history.go()");
});

test("landing on a cached ticker via popstate reopens it without pushing a new entry", () => {
  const sim = makeHistorySim("");
  const c = makeController(sim);
  c.open("HPG");
  const cache = new Map([["HPG", "HPG"]]);
  const lengthBefore = sim.length();

  sim.back(); // real Back button: browser navigates first, then popstate fires
  const closeResult = c.reactToPopState(cache);
  assert.equal(closeResult, "hidden", "URL now shows no ticker — reaction closes the panel");
  assert.equal(c.openTicker, null);

  sim.forward(); // real Forward button
  const reopenResult = c.reactToPopState(cache);
  assert.equal(reopenResult, "reopened");
  assert.equal(c.openTicker, "HPG");
  assert.equal(sim.length(), lengthBefore, "restoring a cached ticker via popstate must never grow history");
});

// ---------- No raw ticker injection ----------

test("an unresolvable/invalid ticker never reaches a truthy render decision", () => {
  const hostile = tickerFromSearch("?ticker=" + encodeURIComponent("<img src=x onerror=alert(1)>"));
  assert.equal(hostile, null);
  assert.deepEqual(decideOpenAction(hostile, null, hostile, true), { render: false });
});

// ---------- Shared-module isolation (dashboard.html / signals.html) ----------
// Regression: company-panel.js is shared with dashboard.html and signals.html.
// Caught via live browser testing — clicking a watchlist card or a candlestick
// pattern row was adding ?ticker= and pushing history on those pages too. The
// ?ticker= URL/history contract must be exclusive to screener.html.

test("isScreenerPage is true only when body data-page is exactly 'screener'", () => {
  withFakeDocument("screener", () => assert.equal(isScreenerPage(), true));
  withFakeDocument("dashboard", () => assert.equal(isScreenerPage(), false));
  withFakeDocument("signals", () => assert.equal(isScreenerPage(), false));
  withFakeDocument("", () => assert.equal(isScreenerPage(), false));
});

test("isScreenerPage is false with no document (Node/module load context)", () => {
  assert.equal(isScreenerPage(), false);
});
