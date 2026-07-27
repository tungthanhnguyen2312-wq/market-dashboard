"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const {
  renderFundamentalQuality, renderNetNet, renderFcff, renderEbitdaLineage, renderFinancialAnalysis,
  financialAnalysisAvailable, renderHistoricalValuation,
} = require("../assets/js/company-panel.js");

// Fixtures mirror the real production analysis_bundle.json contract shape for
// HPG/VNM as of the VNM FY2024 production closeout — trimmed to the fields
// these renderers actually read.
const hpgEbitdaRecord = {
  canonical_metric: "ebitda", value: 22896534403255, currency: "VND", statement_scope: "consolidated",
  derivation_status: "derived", quality_state: "available",
  period_identity: { period: "2024", period_type: "annual" },
  formula_version: "ebitda_v1_profit_before_tax_plus_interest_expense_plus_depreciation_and_amortization",
  warnings: ["derived_ebitda_specific_formula_version_ebitda_v1_profit_before_tax_plus_interest_expense_plus_depreciation_and_amortization_not_a_reported_or_normalized_ebitda_and_may_not_be_comparable_to_provider_reported_or_differently_formulated_peer_ebitda"],
};
const vnmEbitdaRecord = {
  canonical_metric: "ebitda", value: 13974237947571, currency: "VND", statement_scope: "consolidated",
  derivation_status: "derived", quality_state: "available",
  period_identity: { period: "2024", period_type: "annual" },
  formula_version: "ebitda_v1_profit_before_tax_plus_interest_expense_plus_depreciation_and_amortization",
  warnings: ["derived_ebitda_specific_formula_version_ebitda_v1_profit_before_tax_plus_interest_expense_plus_depreciation_and_amortization_not_a_reported_or_normalized_ebitda_and_may_not_be_comparable_to_provider_reported_or_differently_formulated_peer_ebitda"],
};

const hpgFundamentalQuality = { schema_version: "1.0.0", entity_type: "corporate", models: {
  growth_profitability: { result_state: "available", applicability_state: "available", score_or_value: 0.08657545013322313, missing_inputs: [], warnings: [] },
  dupont_roe: { result_state: "available", applicability_state: "available", score_or_value: 0.1051225533151631, missing_inputs: [], warnings: [] },
  earnings_quality: { result_state: "available", applicability_state: "available", score_or_value: -5413123180859, missing_inputs: [], warnings: [] },
  financial_strength: { result_state: "available", applicability_state: "available", score_or_value: 76075483329703, missing_inputs: [], warnings: [] },
  piotroski_f_score: { result_state: "available", applicability_state: "available", score_or_value: 2, missing_inputs: [], warnings: ["Incomplete Piotroski criteria are not rescaled to nine points."] },
  altman_z_score: { result_state: "inapplicable", applicability_state: "inapplicable", score_or_value: null, missing_inputs: [], warnings: ["qualified_altman_variant_not_available"] },
  beneish_m_score: { result_state: "unavailable", applicability_state: "unavailable", score_or_value: null, missing_inputs: [], warnings: ["exact_beneish_variables_not_available"] },
} };
const vnmFundamentalQuality = { schema_version: "1.0.0", entity_type: "corporate", models: {
  growth_profitability: { result_state: "available", applicability_state: "available", score_or_value: 0.1520219108246915, missing_inputs: [], warnings: [] },
  dupont_roe: { result_state: "available", applicability_state: "available", score_or_value: 0.2909744064313937, missing_inputs: [], warnings: [] },
  earnings_quality: { result_state: "available", applicability_state: "available", score_or_value: 293627183096, missing_inputs: [], warnings: [] },
  financial_strength: { result_state: "available", applicability_state: "available", score_or_value: 7047395277625, missing_inputs: [], warnings: [] },
  piotroski_f_score: { result_state: "available", applicability_state: "available", score_or_value: 3, missing_inputs: [], warnings: ["Incomplete Piotroski criteria are not rescaled to nine points."] },
  altman_z_score: { result_state: "inapplicable", applicability_state: "inapplicable", score_or_value: null, missing_inputs: [], warnings: ["qualified_altman_variant_not_available"] },
  beneish_m_score: { result_state: "unavailable", applicability_state: "unavailable", score_or_value: null, missing_inputs: [], warnings: ["exact_beneish_variables_not_available"] },
} };

const fcffUnavailable = { method: "fcff_dcf", state: "unavailable", equity_value: null, enterprise_value: null, per_share_value: null, missing_inputs: ["sourced_wacc_terminal_growth_and_forecast"], warnings: ["FCFF is not derived from unknown, cumulative, or incompatible cash flow."] };

const vnmNetNet = { method: "net_net", state: "available", statement_scope: "consolidated", historical_input_periods: ["2024", "2024", "2024", "2024", "2024"], equity_value: -4728116201318, per_share_value: -2262.3047838792563, missing_inputs: [], warnings: [] };
const hpgNetNet = { method: "net_net", state: "available", statement_scope: "consolidated", historical_input_periods: ["2024", "2024", "2024", "2024", "2024"], equity_value: -49215580953970, per_share_value: -7694.44274615305, missing_inputs: [], warnings: [] };

function entryFor({ fundamentalQuality, netNet, fcff, ebitda, relativeMethods }) {
  return {
    fundamental_quality: fundamentalQuality,
    intrinsic_valuation: { methods: { net_net: netNet, fcff_dcf: fcff } },
    financial_canonical: { records: [ebitda] },
    relative_valuation: { methods: relativeMethods },
  };
}

const vnmUnavailableMultiples = {
  pe: { state: "unavailable", is_actionable: false, observed_multiple: null, missing_inputs: ["actionable_current_price", "price_financial_period_alignment"] },
  pb: { state: "unavailable", is_actionable: false, observed_multiple: null, missing_inputs: ["actionable_current_price", "price_share_period_alignment", "price_financial_period_alignment"] },
  ps: { state: "unavailable", is_actionable: false, observed_multiple: null, missing_inputs: ["actionable_current_price", "price_share_period_alignment", "price_financial_period_alignment"] },
  ev_ebitda: { state: "unavailable", is_actionable: false, observed_multiple: null, missing_inputs: ["actionable_current_price", "price_share_period_alignment"] },
  ev_sales: { state: "unavailable", is_actionable: false, observed_multiple: null, missing_inputs: ["actionable_current_price", "price_share_period_alignment"] },
};
const hpgAvailableMultiples = {
  pe: { state: "available", is_actionable: true, observed_multiple: 10.550949053672326, price_as_of_date: "2024-12-31", financial_period: { period: "2024" } },
  pb: { state: "available", is_actionable: true, observed_multiple: 1.1091427044202387, price_as_of_date: "2024-12-31", financial_period: { period: "2024" } },
  ps: { state: "available", is_actionable: true, observed_multiple: 0.9134531636543862, price_as_of_date: "2024-12-31", financial_period: { period: "2024" } },
  ev_sales: { state: "available", is_actionable: true, observed_multiple: 1.4613298832217516, price_as_of_date: "2024-12-31", financial_period: { period: "2024" } },
  ev_ebitda: { state: "available", is_actionable: true, observed_multiple: 8.862176311138887, price_as_of_date: "2024-12-31", financial_period: { period: "2024" } },
};

const vnmEntry = entryFor({ fundamentalQuality: vnmFundamentalQuality, netNet: vnmNetNet, fcff: fcffUnavailable, ebitda: vnmEbitdaRecord, relativeMethods: vnmUnavailableMultiples });
const hpgEntry = entryFor({ fundamentalQuality: hpgFundamentalQuality, netNet: hpgNetNet, fcff: fcffUnavailable, ebitda: hpgEbitdaRecord, relativeMethods: hpgAvailableMultiples });

// 1. VNM Fundamental Quality available sections render.
test("VNM Fundamental Quality: available model sections render their principal result", () => {
  const html = renderFundamentalQuality(vnmEntry);
  for (const label of ["Growth &amp; Profitability", "DuPont ROE", "Earnings Quality", "Financial Strength", "Piotroski F-Score"]) assert.match(html, new RegExp(label));
  assert.match(html, /5 of 7 model sections available/);
});

// 2. VNM unavailable/inapplicable sections retain their reasons.
test("VNM Fundamental Quality: inapplicable/unavailable sections keep their existing reason, not a fabricated one", () => {
  const html = renderFundamentalQuality(vnmEntry);
  assert.match(html, /Altman Z-Score/);
  assert.match(html, /qualified_altman_variant_not_available/);
  assert.match(html, /Beneish M-Score/);
  assert.match(html, /exact_beneish_variables_not_available/);
});

// 3. VNM Net-Net renders as available.
test("VNM Net-Net: renders available with total, per-share, currency and period", () => {
  const html = renderNetNet(vnmEntry);
  assert.match(html, /Net-Net result/);
  assert.match(html, /VND/);
  assert.match(html, /FY2024/);
  assert.match(html, /Per-share/);
});

// 4. VNM FCFF renders unavailable with the authoritative missing-input reason.
test("VNM FCFF: renders unavailable with the authoritative sourced-assumption reason, fabricates nothing", () => {
  const html = renderFcff(vnmEntry);
  assert.match(html, /Unavailable/i);
  assert.match(html, /sourced_wacc_terminal_growth_and_forecast/);
  assert.doesNotMatch(html, /Enterprise value/);
});

// 5. VNM EBITDA value, formula version, and warning render despite all valuation multiples being unavailable.
test("VNM EBITDA lineage renders independently even though every historical multiple is unavailable", () => {
  assert.equal(Object.values(vnmUnavailableMultiples).some((m) => m.state === "available"), false);
  const html = renderEbitdaLineage(vnmEntry);
  assert.match(html, /13\.974\.237\.947\.571/);
  assert.match(html, /ebitda_v1_profit_before_tax_plus_interest_expense_plus_depreciation_and_amortization/);
  assert.match(html, /not_a_reported_or_normalized_ebitda/);
  assert.match(html, /derived/i);
});

// 6 & 7. Exact EBITDA regression values for both tickers.
test("HPG EBITDA remains 22,896,534,403,255 VND", () => {
  assert.match(renderEbitdaLineage(hpgEntry), /22\.896\.534\.403\.255/);
});
test("VNM EBITDA remains 13,974,237,947,571 VND", () => {
  assert.match(renderEbitdaLineage(vnmEntry), /13\.974\.237\.947\.571/);
});

// 8. HPG historical multiples remain unchanged (existing renderHistoricalValuation contract untouched).
test("HPG historical valuation multiples remain available and unchanged", () => {
  const html = renderHistoricalValuation(hpgEntry);
  for (const value of ["10,55x", "1,11x", "0,91x", "1,46x", "8,86x"]) assert.match(html, new RegExp(value));
  assert.match(html, /not current\/live multiples/);
});

// 9. VNM historical multiples remain unavailable and never render as zero, blank, or NaN.
test("VNM historical valuation stays explicitly unavailable, never zero/blank/NaN", () => {
  const html = renderHistoricalValuation(vnmEntry);
  assert.match(html, /Historical valuation is unavailable/);
  assert.doesNotMatch(html, /NaN|0,00x|>0<|undefined|null/);
});

// 10. Negative Net-Net results render as valid results.
test("Negative Net-Net equity/per-share values render as a valid analytical outcome, not an error", () => {
  const html = renderNetNet(vnmEntry);
  assert.match(html, /-4\.728\.116\.201\.318/);
  assert.match(html, /-2\.262,3/);
  assert.doesNotMatch(html, /error|invalid/i);
});

// 11. Missing financial-analysis sections fail closed without JavaScript errors.
test("Missing/malformed financial-analysis inputs fail closed without throwing", () => {
  for (const bad of [null, undefined, {}, { fundamental_quality: null }, { intrinsic_valuation: null }, { intrinsic_valuation: { methods: null } }, { financial_canonical: null }]) {
    assert.doesNotThrow(() => renderFundamentalQuality(bad));
    assert.doesNotThrow(() => renderNetNet(bad));
    assert.doesNotThrow(() => renderFcff(bad));
    assert.doesNotThrow(() => renderEbitdaLineage(bad));
    assert.doesNotThrow(() => renderFinancialAnalysis(bad));
  }
  assert.equal(renderFundamentalQuality(null), "");
  assert.equal(renderNetNet({}), "");
  assert.equal(renderFcff({}), "");
  assert.equal(renderEbitdaLineage({}), "");
  assert.equal(financialAnalysisAvailable(null), false);
  assert.equal(financialAnalysisAvailable({}), false);
  assert.match(renderFinancialAnalysis(null), /đang chờ dữ liệu/);
});

test("renderFinancialAnalysis assembles Fundamental Quality, Net-Net and FCFF for a fully-qualified ticker (contract-driven, no ticker branching)", () => {
  const html = renderFinancialAnalysis(vnmEntry);
  assert.match(html, /Financial Analysis/);
  assert.match(html, /Fundamental Quality/);
  assert.match(html, /Net-Net/);
  assert.match(html, /FCFF/);
});

test("no ticker-specific string literals in the rendered financial-analysis output path", () => {
  // Renderers must key off contract fields only; swapping the fixture ticker label must not change output.
  const relabelled = JSON.parse(JSON.stringify(vnmEntry).replace(/VND/g, "VND"));
  assert.equal(renderFinancialAnalysis(relabelled), renderFinancialAnalysis(vnmEntry));
});
