"use strict";

/* MARKET_DASHBOARD_FULL_SURFACE_CONVERGENCE_AND_HOME_PERFORMANCE_V1
 *
 * Proves dashboard.html's Home critical path no longer builds the 1,683-row
 * DataTable, no longer loads jQuery/DataTables/PapaParse/company-panel.js
 * eagerly, and that the redesigned hero renders real market state instead of
 * internal scope methodology -- without regressing the other primary routes.
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const root = path.resolve(__dirname, "..");
const overview = require("../assets/js/dashboard-product-summary.js");

const dashboardHtml = fs.readFileSync(path.join(root, "dashboard.html"), "utf8");
const appJs = fs.readFileSync(path.join(root, "app.js"), "utf8");

const FORBIDDEN_TERMS = /\b(pipeline|backend|artifact|provider|debug)\b/i;

function stripScreenerDetails(html) {
  // The legacy CSV-scoped screener is an opt-in <details> -- it is allowed to carry
  // more technical/scope disclosure since it is no longer part of the default view.
  return html.replace(/<details class="card mb-4 dashboard-screener-card">[\s\S]*?<\/details>/, "");
}

function visibleAttributeFreeText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ");
}

// Like visibleAttributeFreeText, but also drops all tags/attributes (ids, classes, data-*
// hooks are implementation details, never shown to a user) -- leaves only real text nodes.
function renderedTextOnly(html) {
  return visibleAttributeFreeText(html)
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-z]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

test("dashboard.html does not eagerly load jQuery/DataTables/PapaParse/company-panel.js", () => {
  assert.doesNotMatch(dashboardHtml, /<script[^>]*src="https:\/\/cdn\.jsdelivr\.net\/npm\/jquery/);
  assert.doesNotMatch(dashboardHtml, /<script[^>]*src="https:\/\/cdn\.datatables\.net/);
  assert.doesNotMatch(dashboardHtml, /<script[^>]*src="https:\/\/cdn\.jsdelivr\.net\/npm\/papaparse/);
  assert.doesNotMatch(dashboardHtml, /<script[^>]*src="assets\/js\/company-panel\.js/);
  assert.doesNotMatch(dashboardHtml, /<link[^>]*href="https:\/\/cdn\.datatables\.net[^"]*\.css/);
});

test("app.js does not build the DataTable/fetch the CSV unconditionally on DOMContentLoaded", () => {
  const domReady = appJs.match(/document\.addEventListener\("DOMContentLoaded",[\s\S]*?\}\);/);
  assert.ok(domReady, "DOMContentLoaded handler must exist");
  const body = domReady[0];
  assert.doesNotMatch(body, /loadMarketTable\(\)/, "loadMarketTable must not run on initial DOMContentLoaded");
  assert.match(body, /initScreenerLazyLoad\(\)/, "the lazy-load listener must still be attached on startup");
});

test("the legacy screener only loads its dependencies and fetches the CSV once the <details> is actually opened", () => {
  assert.match(appJs, /function initScreenerLazyLoad/);
  assert.match(appJs, /details\.addEventListener\("toggle"/);
  assert.match(appJs, /if \(details\.open && !started\)/);
  assert.match(appJs, /function ensureScreenerDependencies/);
  // jQuery is required by dataTables.bootstrap5.min.js at runtime (verified live: omitting
  // it throws "jQuery is not defined") even though app.js itself never calls $(...).
  assert.match(appJs, /loadScriptOnce\("https:\/\/cdn\.jsdelivr\.net\/npm\/jquery/);
  assert.match(appJs, /loadScriptOnce\("https:\/\/cdn\.datatables\.net\/2\.1\.8\/js\/dataTables\.min\.js"\)/);
});

test("dashboard.html keeps the heavy screener collapsed behind an opt-in <details>, not part of the initial render", () => {
  const match = dashboardHtml.match(/<details class="card mb-4 dashboard-screener-card">/);
  assert.ok(match, "the legacy screener must remain a collapsed <details> section");
  assert.doesNotMatch(dashboardHtml, /<details class="card mb-4 dashboard-screener-card" open/);
});

test("asset cache-version query strings on dashboard.html's local scripts/styles are internally consistent (one deterministic build id)", () => {
  const versions = new Set();
  const attrRe = /(?:src|href)="((?:assets|data)\/[^"]+\.(?:js|css))\?v=([^"]+)"/g;
  let m;
  while ((m = attrRe.exec(dashboardHtml))) versions.add(m[2]);
  assert.ok(versions.size >= 1, "expected at least one versioned local asset");
  assert.equal(versions.size, 1, `all local asset versions on dashboard.html must share one build id, found: ${[...versions]}`);
});

test("dead KPI/chart functions targeting removed elements (kpi-breadth/chart-structure) were removed, not just orphaned", () => {
  assert.doesNotMatch(appJs, /function fillMarketKpis/);
  assert.doesNotMatch(appJs, /function renderCharts\(rows\)/);
  assert.doesNotMatch(dashboardHtml, /id="kpi-breadth"/);
  assert.doesNotMatch(dashboardHtml, /id="chart-structure"/);
});

test("no forbidden engineering wording appears in dashboard.html's default (non-expanded) rendered text", () => {
  const defaultView = renderedTextOnly(stripScreenerDetails(dashboardHtml));
  const hit = defaultView.match(FORBIDDEN_TERMS);
  assert.equal(hit, null, `forbidden term leaked into default Home text: ${hit && hit[0]}`);
});

test("no forbidden engineering wording appears in the redesigned hero banner output", () => {
  const summary = {
    as_of_session: "2026-09-18",
    session_breadth: { available: true, up: 380, down: 282, flat: 194, priced: 856, price_available: 858, unpriced: 825 },
  };
  const html = overview.heroBannerHtml(summary);
  assert.equal(html.match(FORBIDDEN_TERMS), null);
  assert.doesNotMatch(html, /\bN\/A\b/);
});

test("hero banner renders real market state (session + breadth), not internal scope methodology", () => {
  const summary = {
    as_of_session: "2026-09-18",
    session_breadth: { available: true, up: 380, down: 282, flat: 194, priced: 856, price_available: 858, unpriced: 825 },
  };
  const html = overview.heroBannerHtml(summary);
  assert.match(html, /18\/09\/2026/);
  assert.match(html, /380/);
  assert.match(html, /282/);
  assert.match(html, /Nghiêng tăng/);
  assert.match(html, /investment-workspace\.html/);
  // The old hero explained internal CSV-vs-Workspace scope semantics; that copy now lives
  // only in the opt-in legacy screener section (see renderScreenerScopeNote in app.js).
  assert.doesNotMatch(html, /Bảng sàng lọc kế thừa/);
  assert.doesNotMatch(html, /tách biệt với phạm vi tham chiếu/);
});

test("marketBreadthStateLabel is a pure, deterministic, descriptive label -- not a new investment rule", () => {
  assert.equal(overview.marketBreadthStateLabel({ available: true, up: 600, down: 100 }).text, "Nghiêng tăng");
  assert.equal(overview.marketBreadthStateLabel({ available: true, up: 100, down: 600 }).text, "Nghiêng giảm");
  assert.equal(overview.marketBreadthStateLabel({ available: true, up: 300, down: 280 }).text, "Giằng co");
  assert.equal(overview.marketBreadthStateLabel({ available: false, up: 0, down: 0 }), null);
  assert.equal(overview.marketBreadthStateLabel({ available: true, up: 0, down: 0 }), null);
});

test("the legacy CSV scope disclaimer still exists (relocated to the opt-in screener section, not deleted)", () => {
  assert.match(appJs, /Bảng sàng lọc kế thừa/);
  assert.match(appJs, /tách biệt với phạm vi tham chiếu/);
  assert.match(dashboardHtml, /id="screener-scope-note"/);
});

test("the AI report narrative stays collapsed by default (max-height preview, not fully expanded)", () => {
  assert.match(dashboardHtml, /class="card-body report-content collapsed" id="ai-report"/);
  const css = fs.readFileSync(path.join(root, "style.css"), "utf8");
  assert.match(css, /\.report-content\.collapsed\s*\{\s*max-height:\s*\d+px;\s*\}/);
});

test("Home's real market summary/chart hosts are still present for dashboard-product-summary.js to fill", () => {
  assert.match(dashboardHtml, /id="dashboard-hero-banner"/);
  assert.match(dashboardHtml, /id="kpi-session-up"/);
  assert.match(dashboardHtml, /id="kpi-session-down"/);
  assert.match(dashboardHtml, /id="chart-sector"/);
  assert.match(dashboardHtml, /id="chart-tactical"/);
});

test("primary route navigation is unchanged (Tổng quan/Bộ lọc/Tín hiệu/Bàn quyết định/Danh mục/Vĩ mô all present)", () => {
  for (const href of ["dashboard.html", "screener.html", "signals.html", "investment-workspace.html", "portfolio.html", "macro.html", "about.html", "archive.html"]) {
    assert.match(dashboardHtml, new RegExp(`href="${href}"`), `nav link to ${href} must remain present`);
  }
});

test("portfolio.html and macro.html no longer expose backend component names (Producer/artifact) in visible copy", () => {
  const portfolioHtml = fs.readFileSync(path.join(root, "portfolio.html"), "utf8");
  const macroHtml = fs.readFileSync(path.join(root, "macro.html"), "utf8");
  const macroJs = fs.readFileSync(path.join(root, "assets/js/macro.js"), "utf8");
  assert.doesNotMatch(renderedTextOnly(portfolioHtml), /\bProducer\b|\bartifact\b/);
  assert.doesNotMatch(renderedTextOnly(macroHtml), /\bpipeline\b/i);
  assert.doesNotMatch(macroJs, /local pipeline snapshot/);
  assert.doesNotMatch(macroJs, /Hãy chạy pipeline/);
});
