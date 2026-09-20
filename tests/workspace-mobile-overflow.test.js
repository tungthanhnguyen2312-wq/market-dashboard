"use strict";
// DASHBOARD_INVESTOR_FIRST_LOCALIZATION_AND_UI_CLOSEOUT_V1 corrective closeout, Phase 4/5.
//
// The Opportunities table (.ws-compact-table, ~1683 rows x 10 nowrap-header columns) has a
// real content-driven min width around 979px. table-layout:auto (the CSS default) treats a
// declared "width: 100%" as a floor, not a cap, so the table never actually shrinks -- and,
// confirmed live in a real browser by toggling table-layout/width and watching
// document.documentElement.scrollWidth track the table's own rendered width exactly, that
// oversized table is NOT reliably contained by its .ws-list-scroll wrapper's own
// overflow-x:auto: the whole page gains real horizontal scroll at 375px and 430px. This is a
// CSS-only regression (no JS drives it), so it's pinned here as a static rule check against
// the stylesheet rather than a live-render assertion.
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const css = fs.readFileSync(path.join(root, "assets", "css", "investment-workspace.css"), "utf8");

function mediaBlockFor(maxWidth) {
  const re = new RegExp(`@media \\(max-width:\\s*${maxWidth}px\\)\\s*\\{([\\s\\S]*?)\\n\\}`, "m");
  const match = css.match(re);
  return match ? match[1] : null;
}

test("a mobile breakpoint constrains .ws-compact-table's width instead of leaving it content-driven", () => {
  const block = mediaBlockFor(768);
  assert.ok(block, "expected an @media (max-width: 768px) block in investment-workspace.css");
  assert.match(block, /\.ws-compact-table\s*\{[^}]*table-layout:\s*fixed/, "table-layout must become fixed below 768px so width is authoritative, not content-driven");
  assert.match(block, /\.ws-compact-table\s*\{[^}]*min-width:\s*0/, "min-width must be zeroed below 768px, overriding the shared .cockpit-table min-width:620px rule (decision-cockpit.css) that would otherwise re-float the table past the viewport");
});

test("the mobile breakpoint hides non-essential columns rather than compressing all ten into unreadable slivers", () => {
  const block = mediaBlockFor(768);
  // Keep only ticker (1st), status (2nd), price (3rd) and the detail entry point (10th)
  // visible; the rest (4th-9th) collapse behind the ticker-detail drawer instead.
  assert.match(block, /th:nth-child\(n\+4\):nth-child\(-n\+9\)[\s\S]*?display:\s*none/);
  assert.match(block, /td:nth-child\(n\+4\):nth-child\(-n\+9\)[\s\S]*?display:\s*none/);
});

test("desktop (above 768px) keeps the original ten-column table untouched", () => {
  // No unscoped rule sets table-layout or min-width on .ws-compact-table outside a media
  // query -- the fix must be confined to the mobile breakpoint.
  const withoutMedia = css.replace(/@media[\s\S]*?\n\}\n?/g, "");
  assert.doesNotMatch(withoutMedia, /\.ws-compact-table\s*\{[^}]*table-layout/);
  assert.match(css, /\.ws-compact-table \{ width: 100%; border-collapse: collapse;/, "the base (desktop) rule must be unchanged");
});

test("decision-cockpit.css's own min-width:620px rule for its unrelated table is untouched", () => {
  const dcCss = fs.readFileSync(path.join(root, "assets", "css", "decision-cockpit.css"), "utf8");
  assert.match(dcCss, /@media \(max-width:768px\) \{ \.cockpit-hero \{ flex-direction:column; \}\.cockpit-table \{ min-width:620px; \} \}/);
});
