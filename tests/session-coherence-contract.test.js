"use strict";

// Session-coherence contract regressions — see
// docs/dashboard_current_session_surface_coherence_20260912.md.
//
// Root cause: several active product surfaces (Screener, the Dashboard home "Current
// Decision" summary, Investment Workspace, Signals) each read their own artifact's own
// as_of_session/session field and rendered it verbatim, with zero comparison against the
// Dashboard release session (data/build_info.json's market_session). Two of those
// artifacts (data/screener_master_projection.json, data/investment_decision_workspace.json)
// are one-off product-integration artifacts that were never wired into the recurring
// canonical Dashboard release (dashboard_release_publisher.py, in the read-only Producer
// repository) and are frozen at 2026-08-28 while the release itself is 2026-09-11.
//
// These tests assert: (1) the shared classifier never reports a mismatch as current: (2)
// every surface that reads one of these two artifacts is wired to the classifier, not just
// printing the raw date; (3) a JSON/JS fallback pair for the same projection is checked for
// identity/session compatibility, not silently allowed to diverge.

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const sc = require(path.join(root, "assets/js/session-coherence.js"));

function readText(relative) {
  return fs.readFileSync(path.join(root, relative), "utf8");
}
function readJson(relative) {
  return JSON.parse(readText(relative));
}
/** window.GLOBAL_NAME = {...}; -> the parsed object, for a file:// JS-fallback sidecar. */
function readWindowAssignedJson(relative, globalName) {
  const text = readText(relative);
  const marker = `window.${globalName} = `;
  const start = text.indexOf(marker);
  assert.ok(start !== -1, `${relative} must assign window.${globalName}`);
  let body = text.slice(start + marker.length).trimEnd();
  if (body.endsWith(";")) body = body.slice(0, -1);
  return JSON.parse(body);
}

// ---------------------------------------------------------------------------
// 1. Pure classifier behavior
// ---------------------------------------------------------------------------

test("classify: identical sessions are EXACT_SESSION, never STALE", () => {
  const result = sc.classify("2026-09-11", "2026-09-11");
  assert.equal(result.status, sc.STATUS.EXACT_SESSION);
  assert.equal(sc.isConfirmedStale(result), false);
});

test("classify: an older artifact session against a newer release session is STALE_EXPLICIT, never CURRENT/EXACT_SESSION", () => {
  const result = sc.classify("2026-08-28", "2026-09-11");
  assert.equal(result.status, sc.STATUS.STALE_EXPLICIT);
  assert.equal(sc.isConfirmedStale(result), true);
  assert.equal(result.artifactSession, "2026-08-28");
  assert.equal(result.releaseSession, "2026-09-11");
});

test("classify: a missing artifact session or missing release session is UNAVAILABLE, never silently treated as a match", () => {
  assert.equal(sc.classify(null, "2026-09-11").status, sc.STATUS.UNAVAILABLE);
  assert.equal(sc.classify("2026-08-28", null).status, sc.STATUS.UNAVAILABLE);
  assert.equal(sc.isConfirmedStale(sc.classify(null, "2026-09-11")), false);
  assert.equal(sc.isConfirmedStale(sc.classify("2026-08-28", null)), false);
});

test("staleBannerHtml names the component, both dates, and a reason code — never a bare date with no indication of staleness", () => {
  const result = sc.classify("2026-08-28", "2026-09-11");
  const html = sc.staleBannerHtml("Screener", result, "SCREENER_MASTER_PROJECTION_STALE");
  assert.match(html, /Screener/);
  assert.match(html, /2026-08-28/);
  assert.match(html, /2026-09-11/);
  assert.match(html, /SCREENER_MASTER_PROJECTION_STALE/);
  assert.match(html, /data-session-status="STALE_EXPLICIT"/);
});

test("sessionLabelText marks a stale artifact's date as not current instead of printing it bare", () => {
  const stale = sc.classify("2026-08-28", "2026-09-11");
  const label = sc.sessionLabelText(stale);
  assert.match(label, /2026-08-28/);
  assert.match(label, /CHƯA CẬP NHẬT/);
  const current = sc.classify("2026-09-11", "2026-09-11");
  assert.equal(sc.sessionLabelText(current), "2026-09-11");
});

// ---------------------------------------------------------------------------
// 2. JSON/JS fallback pair compatibility (section 10: no dual-source silent fallback)
// ---------------------------------------------------------------------------

test("classifyArtifactPair: a current JSON next to a stale JS fallback of the same projection is INCOMPATIBLE", () => {
  const current = { artifact_identity: "x:1", as_of_session: "2026-09-11" };
  const stale = { artifact_identity: "x:0", as_of_session: "2026-08-28" };
  const result = sc.classifyArtifactPair(current, stale);
  assert.equal(result.compatible, false);
});

test("classifyArtifactPair: a stale JSON next to a current JS fallback of the same projection is INCOMPATIBLE", () => {
  const stale = { artifact_identity: "x:0", as_of_session: "2026-08-28" };
  const current = { artifact_identity: "x:1", as_of_session: "2026-09-11" };
  const result = sc.classifyArtifactPair(stale, current);
  assert.equal(result.compatible, false);
});

test("classifyArtifactPair: two payloads that genuinely share identity and session are COMPATIBLE", () => {
  const a = { artifact_identity: "x:1", as_of_session: "2026-09-11" };
  const b = { artifact_identity: "x:1", as_of_session: "2026-09-11" };
  assert.equal(sc.classifyArtifactPair(a, b).compatible, true);
});

test("classifyArtifactPair: either side missing is INCOMPATIBLE, never treated as a vacuous match", () => {
  assert.equal(sc.classifyArtifactPair(null, { as_of_session: "2026-09-11" }).compatible, false);
  assert.equal(sc.classifyArtifactPair({ as_of_session: "2026-09-11" }, null).compatible, false);
});

test("Real committed data/screener_master_projection.json and .js are session/identity-compatible with each other today", () => {
  const jsonPayload = readJson("data/screener_master_projection.json");
  const jsPayload = readWindowAssignedJson("data/screener_master_projection.js", "SCREENER_MASTER_PROJECTION");
  const result = sc.classifyArtifactPair(jsonPayload, jsPayload);
  assert.equal(result.compatible, true, `screener_master_projection JSON/JS pair diverged: ${JSON.stringify(result)}`);
});

// ---------------------------------------------------------------------------
// 3. Real, currently-live data: the release must not be silently declared current for an
// artifact it does not actually cover. This locks in the known, honestly-reported gap
// rather than hiding it, and will start failing the moment a real fix lands upstream
// (canonical recurring regeneration of screener_master_projection/investment_decision_
// workspace) — at which point this assertion should be updated to EXACT_SESSION.
// ---------------------------------------------------------------------------

test("build_info.json's screening=CURRENT does not, by itself, certify data/screener_master_projection.json as session-current", () => {
  const buildInfo = readJson("data/build_info.json");
  const projection = readJson("data/screener_master_projection.json");
  const releaseSession = buildInfo.market_session;
  const result = sc.classify(projection.as_of_session, releaseSession);
  // Document exactly what is true today rather than assert a fixed expectation that would
  // silently start lying the day this is fixed, or silently stop testing anything if the
  // gap widens further. Either way, CURRENT is only acceptable when the sessions truly match.
  if (result.status === sc.STATUS.EXACT_SESSION) {
    assert.equal(projection.as_of_session, releaseSession);
  } else {
    assert.equal(result.status, sc.STATUS.STALE_EXPLICIT);
    assert.notEqual(projection.as_of_session, releaseSession,
      "screener_master_projection.as_of_session diverges from build_info.market_session; " +
      "build_info.domains.screening=CURRENT must never be read as covering this artifact until it does");
  }
});

// ---------------------------------------------------------------------------
// 4. Every surface that reads a one-off, non-canonically-regenerated artifact must be
// wired to the shared classifier — not just printing the artifact's own date.
// ---------------------------------------------------------------------------

test("screener.html's master-projection meta rendering is wired to VSSessionCoherence, not a bare date print", () => {
  const html = readText("screener.html");
  assert.match(html, /session-coherence\.js/, "screener.html must load session-coherence.js");
  assert.match(html, /VSSessionCoherence/);
  assert.match(html, /isConfirmedStale/);
});

test("dashboard.html loads session-coherence.js before dashboard-product-summary.js", () => {
  const html = readText("dashboard.html");
  const coherenceIdx = html.indexOf("session-coherence.js");
  const summaryIdx = html.indexOf("dashboard-product-summary.js");
  assert.ok(coherenceIdx !== -1, "dashboard.html must load session-coherence.js");
  assert.ok(summaryIdx !== -1 && coherenceIdx < summaryIdx);
});

test("dashboard-product-summary.js's renderDecisionSummaryHtml is wired to session coherence and emits a stale banner for a stale projection", () => {
  const overview = require(path.join(root, "assets/js/dashboard-product-summary.js"));
  const staleSummary = { denominator: 3, as_of_session: "2026-08-28", research_stance: { counts: {} } };
  const html = overview.renderDecisionSummaryHtml(staleSummary, "2026-09-11");
  assert.match(html, /data-session-status="STALE_EXPLICIT"/,
    "Current Decision summary must show an explicit stale banner when its projection disagrees with the release session");
  const currentSummary = { denominator: 3, as_of_session: "2026-09-11", research_stance: { counts: {} } };
  const currentHtml = overview.renderDecisionSummaryHtml(currentSummary, "2026-09-11");
  assert.doesNotMatch(currentHtml, /data-session-status="STALE_EXPLICIT"/);
});

test("investment-workspace.js's session-line render is wired to VSSessionCoherence, not a bare date print", () => {
  const src = readText("assets/js/investment-workspace.js");
  assert.match(src, /VSSessionCoherence/);
  assert.match(src, /session-line/);
  assert.match(src, /isConfirmedStale/);
});

test("signals-product.js's tactical-table meta render is wired to session coherence, not a bare date print", () => {
  const src = readText("assets/js/signals-product.js");
  assert.match(src, /session-coherence\.js/);
  assert.match(src, /isConfirmedStale/);
});

// Wiring the classifier into a page's JS is not enough if that page never loads
// data/build_info.js — VSSessionCoherence.currentReleaseSession() would then always read
// window.BUILD_INFO as null and silently report UNAVAILABLE instead of a real STALE_EXPLICIT
// mismatch. Both pages below were found missing this script tag during manual verification.
test("investment-workspace.html loads data/build_info.js so release-session comparison is actually possible", () => {
  const html = readText("investment-workspace.html");
  assert.match(html, /data\/build_info\.js/);
});

test("signals.html loads data/build_info.js so release-session comparison is actually possible", () => {
  const html = readText("signals.html");
  assert.match(html, /data\/build_info\.js/);
});
