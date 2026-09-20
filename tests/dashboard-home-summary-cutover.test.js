"use strict";

/* DASHBOARD_HOME_SUMMARY_AND_CACHE_BUSTING_V1
 *
 * Proves (a) Home's boot path now fetches only the small, Producer-derived
 * data/dashboard_home_summary.json -- never the full ~6.4MB
 * data/screener_master_projection.json -- and (b) the two derivations are in exact
 * numerical parity over the SAME real retained 2026-09-18 session: the OLD path
 * (summarizeScreenerOverview() over the full projection, still exported and still
 * exercised directly by pre-existing tests) and the NEW artifact (dashboard_home_
 * summary.json, generated server-side by stock-core-private's dashboard_home_summary.py
 * from that exact same projection) must agree on every Home-visible number.
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const root = path.resolve(__dirname, "..");
const overview = require("../assets/js/dashboard-product-summary.js");
const appJs = fs.readFileSync(path.join(root, "app.js"), "utf8");

const PROJECTION_PATH = path.join(root, "data/screener_master_projection.json");
const HOME_SUMMARY_PATH = path.join(root, "data/dashboard_home_summary.json");

test("dashboard-product-summary.js's boot path fetches only the small Home summary, never the full projection", () => {
  const src = fs.readFileSync(path.join(root, "assets/js/dashboard-product-summary.js"), "utf8");
  const bootFn = src.match(/function bootDashboardOverview\(\)[\s\S]*?\n  \}/)[0];
  assert.match(bootFn, /HOME_SUMMARY_URL/);
  assert.doesNotMatch(bootFn, /fetch\(SCREENER_URL/);
});

test("app.js never fetches screener_master_projection.json (Home never needed it directly, only mentions it in a comment)", () => {
  assert.doesNotMatch(appJs, /fetch\([^)]*screener_master_projection/);
  assert.doesNotMatch(appJs, /const\s+\w+\s*=\s*"data\/screener_master_projection\.json"/);
});

const haveRealArtifacts = fs.existsSync(PROJECTION_PATH) && fs.existsSync(HOME_SUMMARY_PATH);

test(
  "OLD (summarizeScreenerOverview over the full projection) and NEW (dashboard_home_summary.json) agree exactly on every Home-visible number, same real 2026-09-18 session",
  { skip: !haveRealArtifacts && "real retained data/screener_master_projection.json or data/dashboard_home_summary.json not present in this checkout" },
  () => {
    const projection = JSON.parse(fs.readFileSync(PROJECTION_PATH, "utf8"));
    const homeSummary = JSON.parse(fs.readFileSync(HOME_SUMMARY_PATH, "utf8"));
    assert.equal(homeSummary.contract_version, overview.HOME_SUMMARY_CONTRACT);

    const old = overview.summarizeScreenerOverview(projection);

    assert.equal(homeSummary.as_of_session, old.as_of_session);
    assert.equal(homeSummary.denominator, old.denominator);
    assert.equal(homeSummary.price_available_count, old.price_available_count);
    assert.equal(homeSummary.tactical_available_count, old.tactical_available_count);
    assert.deepEqual(homeSummary.session_breadth.up, old.session_breadth.up);
    assert.deepEqual(homeSummary.session_breadth.down, old.session_breadth.down);
    assert.deepEqual(homeSummary.session_breadth.flat, old.session_breadth.flat);
    assert.deepEqual(homeSummary.session_breadth.priced, old.session_breadth.priced);
    assert.deepEqual(homeSummary.session_breadth.price_available, old.session_breadth.price_available);
    assert.deepEqual(homeSummary.research_stance.counts, old.research_stance.counts);
    assert.deepEqual(homeSummary.tactical.counts, old.tactical.counts);
    assert.equal(homeSummary.liquidity.proxy_count, old.liquidity.proxy_count);
    assert.equal(homeSummary.liquidity.execution_exact_ready, old.liquidity.execution_exact_ready);
    assert.equal(homeSummary.sector.labeled, old.sector.labeled);
    assert.deepEqual(homeSummary.sector.rows.slice(0, 10), old.sector.rows.slice(0, 10));

    // Rendering off the small summary must produce identical visible HTML to rendering
    // off the old full-projection derivation for every field the two share.
    const heroOld = overview.heroBannerHtml(old);
    const heroNew = overview.heroBannerHtml(homeSummary);
    assert.equal(heroOld, heroNew);

    // Size gate (Phase 4/8): the new artifact Home actually fetches is dramatically
    // smaller than the full projection it replaces.
    const oldBytes = fs.statSync(PROJECTION_PATH).size;
    const newBytes = fs.statSync(HOME_SUMMARY_PATH).size;
    assert.ok(oldBytes > 6_000_000, `expected the full projection to be multi-MB, got ${oldBytes}`);
    assert.ok(newBytes < 100_000, `expected the Home summary under 100KB, got ${newBytes}`);
  },
);
