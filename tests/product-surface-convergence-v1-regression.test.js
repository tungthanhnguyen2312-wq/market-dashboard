"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const vf = require(path.join(root, "assets/js/value-format.js"));
const ws = require(path.join(root, "assets/js/investment-workspace.js"));
const shell = require(path.join(root, "assets/js/shell.js"));

const PRIMARY_PAGES = [
  "dashboard.html",
  "screener.html",
  "signals.html",
  "analysis.html",
  "investment-workspace.html",
  "portfolio.html",
  "macro.html",
  "about.html",
];

const CANONICAL_8_LABELS = [
  "Tổng quan",
  "Bộ lọc",
  "Tín hiệu",
  "Phân tích",
  "Bàn quyết định",
  "Danh mục",
  "Vĩ mô",
  "Giới thiệu",
];

test("A. Navigation exposes the 8 canonical items across all primary pages", () => {
  assert.equal(shell.CANONICAL_PRIMARY_NAV.length, 8);
  for (let i = 0; i < 8; i++) {
    assert.equal(shell.CANONICAL_PRIMARY_NAV[i].label, CANONICAL_8_LABELS[i]);
  }
  for (const page of PRIMARY_PAGES) {
    const html = fs.readFileSync(path.join(root, page), "utf8");
    for (const label of CANONICAL_8_LABELS) {
      assert.match(html, new RegExp(`>${label}<|title="${label}"`), `Missing ${label} in ${page}`);
    }
    assert.doesNotMatch(html, />Không gian quyết định</, `Found obsolete 'Không gian quyết định' in nav of ${page}`);
  }
});

test("B. Active link correctly configured for each primary page", () => {
  const pageNavMap = {
    "dashboard.html": "dashboard",
    "screener.html": "screener",
    "signals.html": "signals",
    "analysis.html": "analysis",
    "investment-workspace.html": "investment-workspace",
    "portfolio.html": "portfolio",
    "macro.html": "macro",
    "about.html": "about",
  };
  for (const [page, navKey] of Object.entries(pageNavMap)) {
    const html = fs.readFileSync(path.join(root, page), "utf8");
    assert.match(
      html,
      new RegExp(`(?:data-nav="${navKey}"[^>]*class="[^"]*(?:is-active|active)[^"]*"|class="[^"]*(?:is-active|active)[^"]*"[^>]*href="${page}")`),
      `Active link missing for ${page}`
    );
  }
});

test("C. decision-cockpit.html redirects to investment-workspace.html and preserves query params", () => {
  const html = fs.readFileSync(path.join(root, "decision-cockpit.html"), "utf8");
  assert.doesNotMatch(html, /<meta http-equiv="refresh"/);
  assert.match(html, /window\.location\.replace/);
  assert.match(html, /window\.location\.search/);
  assert.match(html, /window\.location\.hash/);
  assert.match(html, /id="redirect-link"/);
  assert.match(html, /Bàn quyết định đã được hợp nhất/);
});

test("D. Deep-link handling in investment-workspace preserves ticker selection and rejects unknown tickers without HPG substitution", () => {
  assert.equal(ws.selectedTickerForDeepLink(["HPG", "VNM", "FPT"], "VNM"), "VNM");
  assert.equal(ws.selectedTickerForDeepLink(["HPG", "VNM", "FPT"], "UNKNOWN"), null);
  assert.equal(ws.selectedTickerForDeepLink(["HPG", "VNM", "FPT"], ""), "HPG");
  const wsJs = fs.readFileSync(path.join(root, "assets/js/investment-workspace.js"), "utf8");
  assert.match(wsJs, /history\.replaceState/);
  assert.match(wsJs, /openDrawer/);
  assert.match(wsJs, /popstate/);
});

test("E. Workspace opportunity table has exactly the 6 compact columns", () => {
  const html = fs.readFileSync(path.join(root, "investment-workspace.html"), "utf8");
  const thMatches = html.match(/<thead[^>]*>[\s\S]*?<\/thead>/);
  assert.ok(thMatches);
  const thHeaders = [...thMatches[0].matchAll(/<th[^>]*>(.*?)<\/th>/g)].map(m => m[1].trim());
  assert.deepEqual(thHeaders, ["Mã", "Ngành", "Tư thế", "Kỹ thuật", "Định giá", "Thao tác"]);
});

test("F. Ticker column is sticky during horizontal scroll on table pages", () => {
  for (const page of ["screener.html", "signals.html", "analysis.html", "investment-workspace.html"]) {
    const html = fs.readFileSync(path.join(root, page), "utf8");
    assert.match(html, /sticky-col|th:first-child,\s*[^\{]*td:first-child/, `Missing sticky column in ${page}`);
  }
});

test("G & H. Semantic tones map correctly (UNAVAILABLE is neutral gray, not red; adverse is red)", () => {
  assert.equal(vf.getSemanticTone("UNAVAILABLE"), "neutral");
  assert.equal(vf.getToneBadgeClass("neutral"), "bs-gray");
  assert.equal(vf.getSemanticTone("NOT_AVAILABLE"), "neutral");
  assert.equal(vf.getSemanticTone("ABSENT"), "neutral");
  assert.equal(vf.getSemanticTone("INSUFFICIENT_EVIDENCE"), "neutral");

  assert.equal(vf.getSemanticTone("BREAKOUT_READY"), "constructive");
  assert.equal(vf.getToneBadgeClass("constructive"), "bs-green");
  assert.equal(vf.getSemanticTone("UPTREND_CONFIRMED"), "constructive");

  assert.equal(vf.getSemanticTone("WAIT_FOR_CONFIRMATION"), "watch");
  assert.equal(vf.getToneBadgeClass("watch"), "bs-amber");
  assert.equal(vf.getSemanticTone("BASE_BUILDING"), "watch");

  assert.equal(vf.getSemanticTone("AVOID_NEW_ENTRY"), "adverse");
  assert.equal(vf.getToneBadgeClass("adverse"), "bs-red");
  assert.equal(vf.getSemanticTone("BREAKDOWN_RISK"), "adverse");
  assert.equal(vf.getSemanticTone("DISTRIBUTION_RISK"), "adverse");

  // Verify visibleStateHtml outputs tone classes
  const unavailHtml = vf.visibleStateHtml("UNAVAILABLE", "tactical_state");
  assert.match(unavailHtml, /tone-neutral/);
  assert.match(unavailHtml, /bs-gray/);
  assert.doesNotMatch(unavailHtml, /bs-red/);

  // Check CSS rule in decision-cockpit.css
  const cockpitCss = fs.readFileSync(path.join(root, "assets/css/decision-cockpit.css"), "utf8");
  assert.doesNotMatch(cockpitCss, /\.cockpit-state\.unavailable\s*\{[^}]*color:\s*#fca5a5/);
});

test("I. Cohort progressive disclosure: <= 8 renders all; > 8 renders with toggle", () => {
  const wsJs = fs.readFileSync(path.join(root, "assets/js/investment-workspace.js"), "utf8");
  assert.match(wsJs, /data-cohort-toggle/);
  assert.match(wsJs, /initialLimit = 8/);
  assert.match(wsJs, /Xem thêm/);
  assert.match(wsJs, /Thu gọn/);
});

test("J & K. Drawer closes on Esc/backdrop and handles accessibility", () => {
  const wsHtml = fs.readFileSync(path.join(root, "investment-workspace.html"), "utf8");
  assert.match(wsHtml, /id="decision-drawer-backdrop"/);
  assert.match(wsHtml, /id="decision-drawer"/);
  assert.match(wsHtml, /role="dialog"/);
  assert.match(wsHtml, /aria-modal="true"/);
  assert.match(wsHtml, /id="decision-drawer-close"/);

  const wsJs = fs.readFileSync(path.join(root, "assets/js/investment-workspace.js"), "utf8");
  assert.match(wsJs, /closeDrawer/);
  assert.match(wsJs, /lastFocusedElement/);
  assert.match(wsJs, /e\.key === "Escape"/);
});

test("L. Disclaimers are consistent and concise across all pages", () => {
  for (const page of PRIMARY_PAGES) {
    const html = fs.readFileSync(path.join(root, page), "utf8");
    assert.match(html, /Phục vụ nghiên cứu, không phải lệnh giao dịch/, `Missing canonical disclaimer in ${page}`);
  }
});

test("M. Portfolio form controls and table headers are localized in Vietnamese", () => {
  const html = fs.readFileSync(path.join(root, "portfolio.html"), "utf8");
  assert.match(html, /Mã danh mục/);
  assert.match(html, /Tiền mặt/);
  assert.match(html, /Mã cổ phiếu/);
  assert.match(html, /Số lượng hoặc tỷ trọng/);
  assert.match(html, /Cơ sở phân bổ/);
  assert.match(html, /Thêm vị thế/);
  assert.match(html, /Lưu trên trình duyệt/);
  assert.match(html, /Xuất file JSON/);
  assert.match(html, /Xóa \/ Đặt lại/);
});

test("N. Portfolio weights allocation vs quantity-only honesty", () => {
  const portJs = fs.readFileSync(path.join(root, "portfolio.js"), "utf8");
  assert.match(portJs, /renderAllocation/);
  assert.match(portJs, /portfolio-weight-bar/);
  assert.match(portJs, /Chưa có tỷ trọng định giá/);
  assert.match(portJs, /mark-to-market/);
});

test("O. No Python CLI command strings in user-facing UI", () => {
  for (const page of PRIMARY_PAGES) {
    const html = fs.readFileSync(path.join(root, page), "utf8");
    assert.doesNotMatch(html, /tools\/run_/i, `Found CLI leak in ${page}`);
    assert.doesNotMatch(html, /--portfolio-input/i, `Found CLI flag leak in ${page}`);
  }
});

test("P. Macro headers use Cập nhật and Thời điểm tạo", () => {
  const macroHtml = fs.readFileSync(path.join(root, "macro.html"), "utf8");
  assert.match(macroHtml, /Thời điểm tạo/);
  assert.match(macroHtml, />Cập nhật<\/th>/);
  assert.doesNotMatch(macroHtml, />Pipeline tải<\/th>/);
  assert.doesNotMatch(macroHtml, /<dt>Pipeline sinh dữ liệu<\/dt>/);
});

test("Q. About page has no English architectural sentences", () => {
  const aboutHtml = fs.readFileSync(path.join(root, "about.html"), "utf8");
  assert.doesNotMatch(aboutHtml, /Stock Lookup is an evidence-first/i);
  assert.doesNotMatch(aboutHtml, /What the visible surfaces do/i);
  assert.doesNotMatch(aboutHtml, /Important limits/i);
  assert.doesNotMatch(aboutHtml, /No opaque total score/i);
  assert.match(aboutHtml, /Quy trình xử lý dữ liệu/);
  assert.match(aboutHtml, /Ý nghĩa tư thế nghiên cứu/);
});

test("R. Branding is consistently 'Stock Lookup'", () => {
  for (const page of PRIMARY_PAGES.concat(["decision-cockpit.html", "archive.html"])) {
    const html = fs.readFileSync(path.join(root, page), "utf8");
    const shellText = (html.match(/<header[^>]*>[\s\S]*?<\/header>/) || [""])[0] +
                      (html.match(/<aside[^>]*>[\s\S]*?<\/aside>/) || [""])[0] +
                      (html.match(/<footer[^>]*>[\s\S]*?<\/footer>/) || [""])[0];
    assert.doesNotMatch(shellText, /Stock Look Up\b/, `Found obsolete 'Stock Look Up' with space in ${page}`);
  }
});
