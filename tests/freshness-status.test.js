const assert = require("assert");
const panel = require("../assets/js/company-panel.js");

for (const status of ["current", "expiring", "stale", "missing", "historical", "unknown"]) {
  assert.notStrictEqual(panel.statusMessage(status), "", status);
}
const rendered = panel.renderCorporateIntelligence({
  company_profile: { status: "available", freshness: { freshness_status: "stale", stale_reason: "source_age_8d_exceeds_1d_grace", is_actionable: false }, data: { source: "VCI", name: "<unsafe>" } },
  ownership_structure: { status: "missing" }, major_shareholders: { status: "missing" }, company_subsidiaries: { status: "missing" }, corporate_events: { status: "partial", coverage_status: "partial_unqualified_50_row_cap", data: { records: [] } }, status: "partial"
});
assert(rendered.includes("Data is stale."));
assert(rendered.includes("Not actionable."));
assert(!rendered.includes("<unsafe>"));
console.log("freshness status tests passed");
