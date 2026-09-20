"use strict";
// DASHBOARD_INVESTOR_FIRST_LOCALIZATION_AND_UI_CLOSEOUT_V1 Phase 6/7: the former
// "Shadow Recommendations" research-posture table duplicated what the Workspace's
// per-ticker Opportunities/Explore views already show, and its detail renderer leaked
// raw contract enums, JSON dumps and internal vocabulary ("SHADOW RESEARCH ONLY",
// "Historical PIT"). Disposition B: the route stays reachable (no broken link/bookmark),
// but now redirects to the Workspace instead of rendering its own surface -- following
// the same window.location.replace(...) pattern analysis.html already uses.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const root = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(root, "shadow-recommendations.html"), "utf8");

test("shadow-recommendations.html redirects to investment-workspace.html, preserving query params and hash", () => {
  assert.doesNotMatch(html, /<meta http-equiv="refresh"/);
  assert.match(html, /window\.location\.replace\("investment-workspace\.html\?" \+ params\.toString\(\) \+ hash\)/);

  function simulateRedirect(search, hash) {
    const params = new URLSearchParams(search || "");
    return "investment-workspace.html?" + params.toString() + (hash || "");
  }
  assert.equal(simulateRedirect("", ""), "investment-workspace.html?");
  assert.equal(simulateRedirect("?foo=bar", "#panel"), "investment-workspace.html?foo=bar#panel");
});

test("static fallback link and noscript notice also target the Workspace", () => {
  assert.match(html, /id="redirect-link"[^>]*href="investment-workspace\.html"/);
  assert.match(html, /<noscript>[\s\S]*Bàn quyết định[\s\S]*<\/noscript>/i);
});

test("no leftover Shadow/experiment vocabulary or raw contract identities are user-visible", () => {
  // data-page="shadow-recommendations" is an internal routing hook, not rendered text —
  // every other occurrence of the word must be gone from anything a viewer can read.
  const visible = html.replace(/data-page="shadow-recommendations"/, "");
  assert.doesNotMatch(visible, /\bshadow\b/i);
  assert.doesNotMatch(html, /SHADOW RESEARCH ONLY|shadow_recommendation|contract_version/);
  assert.doesNotMatch(html, /\bPIT\b/);
});

test("no trade controls or product action semantics on the compatibility route", () => {
  assert.doesNotMatch(html, /<input[^>]+(?:quantity|position|weight)/i);
  assert.doesNotMatch(html, /data-action\s*=\s*["'](?:buy|sell|hold|exit|liquidate)/i);
  assert.doesNotMatch(html, />\s*(?:Buy|Sell|Hold|Exit|Liquidate)\s*</i);
});

test("no raw JSON dump or console-style diagnostic block is present", () => {
  assert.doesNotMatch(html, /JSON\.stringify/);
  assert.doesNotMatch(html, /<code>/);
});

test("the retired render module and its stylesheet are no longer shipped or referenced", () => {
  assert.doesNotMatch(html, /assets\/js\/shadow-recommendations\.js/);
  assert.doesNotMatch(html, /assets\/css\/shadow-recommendations\.css/);
  assert.equal(fs.existsSync(path.join(root, "assets/js/shadow-recommendations.js")), false);
  assert.equal(fs.existsSync(path.join(root, "assets/css/shadow-recommendations.css")), false);
});
