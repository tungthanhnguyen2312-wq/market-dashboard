"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { renderHistoricalValuation, renderOverview, bundleEntryForRow } = require("../assets/js/company-panel.js");
const hpg = { ticker: "HPG", relative_valuation: { methods: {
  pe: { state: "available", is_actionable: true, observed_multiple: 10.550949053672326, price_as_of_date: "2024-12-31", financial_period: { period: "2024" } },
  pb: { state: "available", is_actionable: true, observed_multiple: 1.1091427044202387, price_as_of_date: "2024-12-31", financial_period: { period: "2024" } },
  ps: { state: "available", is_actionable: true, observed_multiple: 0.9134531636543862, price_as_of_date: "2024-12-31", financial_period: { period: "2024" } },
  ev_sales: { state: "available", is_actionable: true, observed_multiple: 1.4613298832217516, price_as_of_date: "2024-12-31", financial_period: { period: "2024" } },
  ev_ebitda: { state: "available", is_actionable: true, observed_multiple: 8.862176311138887, price_as_of_date: "2024-12-31", financial_period: { period: "2024" } },
} }, financial_canonical: { records: [{ canonical_metric: "ebitda", formula_version: "ebitda_v1_profit_before_tax_plus_interest_expense_plus_depreciation_and_amortization", warnings: ["derived EBITDA may not be comparable to provider-reported EBITDA"] }] } };
test("renders all five HPG historical multiples, labels history in Vietnamese, and retains derived EBITDA metadata", () => {
  const html = renderHistoricalValuation(hpg);
  for (const label of ["P/E", "P/B", "P/S", "EV/EBITDA"]) assert.match(html, new RegExp(label.replace("/", "\\/")));
  for (const value of ["10,55x", "1,11x", "0,91x", "1,46x", "8,86x"]) assert.match(html, new RegExp(value));
  for (const text of ["không phải hệ số hiện tại", "Báo cáo tài chính FY2024", "2024-12-31", "EBITDA suy ra", "may not be comparable"]) assert.match(html, new RegExp(text));
  assert.doesNotMatch(html, /Historical valuation|not current\/live multiples|Formula version|ebitda_v1_profit_before_tax/);
  const live = renderOverview({ pe: 12.3 });
  assert.match(live, /P\/E/);
  assert.doesNotMatch(live, /Định giá lịch sử/);
});
test("renders VNM-style non-actionable valuations explicitly, in Vietnamese, with the machine-readable reason kept only in the hidden data attribute", () => {
  const html = renderHistoricalValuation({ relative_valuation: { methods: { ev_ebitda: { state: "unavailable", is_actionable: false, observed_multiple: null, missing_inputs: ["canonical_input_not_available", "qualified_period_end_share_count"] } } } });
  assert.match(html, /Chưa có định giá lịch sử/); assert.match(html, /data-valuation-reason="canonical_input_not_available, qualified_period_end_share_count"/); assert.doesNotMatch(html, /NaN|0,00x/);
});
test("renders a bank-archetype mixed state explicitly in Vietnamese: pe/pb available, ps unavailable, ev methods inapplicable", () => {
  const vcb = { ticker: "VCB", relative_valuation: { methods: {
    pe: { state: "available", is_actionable: true, observed_multiple: 10.004773875558039, price_as_of_date: "2024-12-31", financial_period: { period: "2024" } },
    pb: { state: "available", is_actionable: true, observed_multiple: 1.7259209095642032, price_as_of_date: "2024-12-31", financial_period: { period: "2024" } },
    ps: { state: "unavailable", is_actionable: false, observed_multiple: null, missing_inputs: ["canonical_input_not_available"] },
    ev_sales: { state: "inapplicable", is_actionable: false, observed_multiple: null, missing_inputs: [], warnings: ["enterprise_value_method_not_qualified_for_bank_archetype_customer_deposits_are_not_interest_bearing_debt"] },
    ev_ebitda: { state: "inapplicable", is_actionable: false, observed_multiple: null, missing_inputs: [], warnings: ["enterprise_value_method_not_qualified_for_bank_archetype_customer_deposits_are_not_interest_bearing_debt"] },
  } } };
  const html = renderHistoricalValuation(vcb);
  assert.match(html, /data-valuation-state="historical"/);
  for (const value of ["10x", "1,73x"]) assert.match(html, new RegExp(value));
  assert.match(html, /P\/S<\/span>: Chưa có dữ liệu/);
  assert.match(html, /EV\/EBITDA<\/span>: Không áp dụng/);
  // the raw missing-input code is never shown to the reader -- only the de-snaked
  // plain-language explanatory sentence the model actually provided as a warning
  const inapplicableCount = (html.match(/Enterprise value method not qualified for bank archetype/g) || []).length;
  assert.equal(inapplicableCount, 2);
  assert.doesNotMatch(html, /canonical_input_not_available|not_qualified_for_bank_archetype/);
  assert.doesNotMatch(html, /NaN|undefined|null/);
});
test(".cp-ci-notice allows long unspaced machine-readable reason tokens to wrap instead of overflowing the panel on mobile", () => {
  const css = fs.readFileSync(path.join(__dirname, "..", "assets", "css", "shell.css"), "utf8");
  const rule = css.match(/\.cp-ci-notice\s*\{[^}]*\}/);
  assert.ok(rule, ".cp-ci-notice rule not found in shell.css");
  assert.match(rule[0], /overflow-wrap:\s*anywhere/);
});
test("handles malformed null arrays and objects without fabrication", () => {
  for (const value of [null, {}, { relative_valuation: null }, { relative_valuation: { methods: null } }, { relative_valuation: { methods: [] } }]) { assert.doesNotThrow(() => renderHistoricalValuation(value)); assert.equal(renderHistoricalValuation(value), ""); }
});
test("uses row payload first and otherwise the matching bundle entry", () => {
  assert.equal(bundleEntryForRow(hpg, { tickers: {} }), hpg); assert.equal(bundleEntryForRow({ ticker: "HPG" }, { tickers: { HPG: hpg } }), hpg); assert.equal(bundleEntryForRow({ ticker: "VNM" }, { tickers: { HPG: hpg } }), null);
});
