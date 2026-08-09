"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const { renderQualifiedHistoricalResearch, renderFinancialAnalysis } = require("../assets/js/company-panel.js");

const metric = (value, reasonCodes = []) => ({ status: "available", value, applicability: "applicable", reason_codes: reasonCodes, source_fact_identities: [{ citation_id: "c" }] });
const row = (ticker, currency, income, ocf, conversion, debtEquity, cashDebt, netDebtEquity, conclusion, risks = [], strengths = []) => ({
  ticker, status: "available", analysis_period: "2024", currency, qualified_period_count: 1, trend_status: "insufficient_history",
  metrics: { earnings_state: metric(income, [income < 0 ? "loss_making" : "profitable"]), operating_cash_flow_state: metric(ocf, [ocf < 0 ? "operating_cash_flow_negative" : "operating_cash_flow_positive"]), operating_cash_flow_to_net_income: conversion === null ? { status: "not_applicable", applicability: "not_applicable", reason_codes: ["net_income_nonpositive_ratio_interpretation_not_applicable"] } : metric(conversion), debt_to_equity: metric(debtEquity), cash_to_debt: metric(cashDebt), net_debt_to_equity: metric(netDebtEquity) },
  conclusion_code: conclusion, risk_predicates: risks.map((predicate) => ({ predicate })), strength_predicates: strengths.map((predicate) => ({ predicate })),
});

const comparison = {
  schema_version: "1.0.0", status: "available", historical_only: true, market_dependent: false, is_actionable: false,
  ranking_prohibited: true, cross_sectional_comparison: "available", multi_period_trend: "insufficient_history",
  limitations: ["PVD remains USD; absolute monetary amounts are excluded."], rows: [
    row("HPG", "VND", 1, 1, .55, .73, .08, .67, "historically_mixed", ["net_debt_position"], ["positive_earnings"]),
    row("VNM", "VND", 1, 1, 1.03, .29, .24, .22, "historically_mixed"),
    row("PAN", "VND", 1, -1, -1.49, 1.32, .25, .99, "historically_mixed", ["negative_operating_cash_flow", "earnings_positive_operating_cash_flow_negative"]),
    row("PVD", "USD", 1, 1, 1.49, .19, .72, .05, "historically_mixed"),
    row("NVL", "VND", -1, -1, null, 1.30, .07, 1.20, "historically_loss_and_cashflow_stressed", ["loss_making_period", "negative_operating_cash_flow"]),
  ],
};
const entry = { historical_decision_analysis: { ticker: "PAN", scenarios: { bear: { historical_fundamental_conditions: ["negative OCF persists"] }, base: { historical_fundamental_conditions: ["qualified facts remain compatible"] }, bull: { historical_fundamental_conditions: ["OCF becomes positive"] } } }, qualified_cohort_comparison: comparison };

test("qualified historical research renders Producer values and bounded cohort context", () => {
  const html = renderQualifiedHistoricalResearch(entry);
  for (const text of ["Qualified Historical Research", "Qualified cohort context", "-1,49x", "PAN", "PVD", "USD", "insufficient_history", "negative OCF persists"]) assert.match(html, new RegExp(text));
  assert.doesNotMatch(html, /BUY|HOLD|SELL|target price|better investment|undervalued|position size/i);
  assert.doesNotMatch(html, /100|1\.200/); // no absolute net-debt values are rendered
});

test("missing or malformed Producer comparison fails closed and legacy panel remains unchanged", () => {
  assert.equal(renderQualifiedHistoricalResearch({}), "");
  assert.match(renderQualifiedHistoricalResearch({ qualified_cohort_comparison: {} }), /Data unavailable/);
  assert.doesNotThrow(() => renderFinancialAnalysis({ qualified_cohort_comparison: {} }));
  assert.match(renderFinancialAnalysis({ qualified_cohort_comparison: {} }), /Data unavailable/);
});
