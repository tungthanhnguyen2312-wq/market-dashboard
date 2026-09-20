const assert = require("assert");
const panel = require("../assets/js/company-panel.js");

for (const status of ["current", "expiring", "stale", "missing", "historical", "unknown"]) {
  assert.notStrictEqual(panel.statusMessage(status), "", status);
}
const rendered = panel.renderCorporateIntelligence({
  company_profile: { status: "available", freshness: { freshness_status: "stale", stale_reason: "source_age_8d_exceeds_1d_grace", is_actionable: false }, data: { source: "VCI", name: "<unsafe>" } },
  ownership_structure: { status: "missing" }, major_shareholders: { status: "missing" }, company_subsidiaries: { status: "missing" }, corporate_events: { status: "partial", coverage_status: "partial_unqualified_50_row_cap", data: { records: [] } }, status: "partial"
});
assert(rendered.includes("Dữ liệu đã cũ."));
assert(rendered.includes("Không dùng để hành động."));
assert(!rendered.includes("<unsafe>"));
assert(!rendered.includes("source_age_8d_exceeds_1d_grace"));
const readiness = panel.renderAnalysisReadiness({ domains: { combined_ai_analysis: { state: "degraded", reason: "partial_unqualified_50_row_cap", is_actionable: false } } });
assert(readiness.includes("Mức sẵn sàng phân tích: Suy giảm."));
assert(readiness.includes("Suy luận còn hạn chế."));
assert(!readiness.includes("partial_unqualified_50_row_cap"));
console.log("freshness status tests passed");
