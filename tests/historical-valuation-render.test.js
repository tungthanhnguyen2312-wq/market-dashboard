"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const { renderHistoricalValuation, renderOverview, bundleEntryForRow } = require("../assets/js/company-panel.js");
const hpg = { ticker: "HPG", relative_valuation: { methods: {
  pe: { state: "available", is_actionable: true, observed_multiple: 10.550949053672326, price_as_of_date: "2024-12-31", financial_period: { period: "2024" } },
  pb: { state: "available", is_actionable: true, observed_multiple: 1.1091427044202387, price_as_of_date: "2024-12-31", financial_period: { period: "2024" } },
  ps: { state: "available", is_actionable: true, observed_multiple: 0.9134531636543862, price_as_of_date: "2024-12-31", financial_period: { period: "2024" } },
  ev_sales: { state: "available", is_actionable: true, observed_multiple: 1.4613298832217516, price_as_of_date: "2024-12-31", financial_period: { period: "2024" } },
  ev_ebitda: { state: "available", is_actionable: true, observed_multiple: 8.862176311138887, price_as_of_date: "2024-12-31", financial_period: { period: "2024" } },
} }, financial_canonical: { records: [{ canonical_metric: "ebitda", formula_version: "ebitda_v1_profit_before_tax_plus_interest_expense_plus_depreciation_and_amortization", warnings: ["derived EBITDA may not be comparable to provider-reported EBITDA"] }] } };
test("renders all five HPG historical multiples, labels history, and retains derived EBITDA metadata", () => {
  const html = renderHistoricalValuation(hpg);
  for (const label of ["P/E", "P/B", "P/S", "EV/Sales", "EV/EBITDA"]) assert.match(html, new RegExp(label.replace("/", "\\/")));
  for (const value of ["10,55x", "1,11x", "0,91x", "1,46x", "8,86x"]) assert.match(html, new RegExp(value));
  for (const text of ["not current/live multiples", "FY2024 financials", "2024-12-31", "derived EBITDA", "Formula version", "may not be comparable"]) assert.match(html, new RegExp(text));
  const live = renderOverview({ pe: 12.3 });
  assert.match(live, /P\/E/);
  assert.doesNotMatch(live, /Historical valuation/);
});
test("renders VNM-style non-actionable valuations explicitly with machine-readable reason", () => {
  const html = renderHistoricalValuation({ relative_valuation: { methods: { ev_ebitda: { state: "unavailable", is_actionable: false, observed_multiple: null, missing_inputs: ["canonical_input_not_available", "qualified_period_end_share_count"] } } } });
  assert.match(html, /Historical valuation is unavailable/); assert.match(html, /data-valuation-reason="canonical_input_not_available, qualified_period_end_share_count"/); assert.doesNotMatch(html, /NaN|0,00x/);
});
test("handles malformed null arrays and objects without fabrication", () => {
  for (const value of [null, {}, { relative_valuation: null }, { relative_valuation: { methods: null } }, { relative_valuation: { methods: [] } }]) { assert.doesNotThrow(() => renderHistoricalValuation(value)); assert.equal(renderHistoricalValuation(value), ""); }
});
test("uses row payload first and otherwise the matching bundle entry", () => {
  assert.equal(bundleEntryForRow(hpg, { tickers: {} }), hpg); assert.equal(bundleEntryForRow({ ticker: "HPG" }, { tickers: { HPG: hpg } }), hpg); assert.equal(bundleEntryForRow({ ticker: "VNM" }, { tickers: { HPG: hpg } }), null);
});