(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.VSProductScopeFormat = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  function formatCount(value) {
    const count = Number(value);
    return Number.isFinite(count) ? count.toLocaleString("vi-VN") : "—";
  }

  function formatReferenceScope(referenceCount) {
    return `Phạm vi tham chiếu: ${formatCount(referenceCount)} mã`;
  }

  function formatProductScope(referenceCount) {
    return `Phạm vi sản phẩm: ${formatCount(referenceCount)} mã`;
  }

  function formatCoverage({ available, reference, label }) {
    return `${formatCount(available)} / ${formatCount(reference)} mã tham chiếu ${String(label || "").trim()}`.trim();
  }

  // Official-scope-specific wording (distinct from the generic formatScopeSummary/
  // current_research_scope_count line below): this always refers to the governed
  // current-official-exchange-presence research scope a Producer artifact's own
  // official_scope_coverage block publishes, never a client-side recomputation.
  function formatOfficialResearchScope(count) {
    return `Phạm vi nghiên cứu chính thức hiện tại: ${formatCount(count)} mã`;
  }

  function formatOutsideOfficialScope(count) {
    return `Ngoài phạm vi chính thức hiện tại: ${formatCount(count)} mã`;
  }

  // This field stays null until a governed Producer artifact publishes it separately.
  function normalizeScopeCounts(counts) {
    const input = counts || {};
    return {
      reference_ticker_count: input.reference_count ?? input.reference_ticker_count ?? null,
      current_research_scope_count: input.current_research_scope_count ?? null,
      outside_current_official_scope_count: input.outside_current_official_scope_count ?? null,
      current_official_scope_unknown_count: input.current_official_scope_unknown_count ?? null,
      price_available_count: input.price_available_count ?? null,
      price_unavailable_count: input.price_unavailable_count ?? null,
      tactical_available_count: input.tactical_available_count ?? null,
      tactical_unavailable_count: input.tactical_unavailable_count ?? null,
      official_scope_observed_at: input.official_scope_observed_at ?? null,
    };
  }

  function formatScopeSummary(counts) {
    const normalized = normalizeScopeCounts(counts);
    const lines = [formatReferenceScope(normalized.reference_ticker_count)];
    if (normalized.current_research_scope_count != null) {
      lines.push(`Phạm vi nghiên cứu hiện tại: ${formatCount(normalized.current_research_scope_count)} mã`);
    }
    return lines;
  }

  return {
    formatCount, formatReferenceScope, formatProductScope, formatCoverage,
    formatOfficialResearchScope, formatOutsideOfficialScope,
    normalizeScopeCounts, formatScopeSummary,
  };
});
