"""Phase 4 advanced financial metric derivation and provenance tests."""

from __future__ import annotations

import json
import sys
import unittest
from pathlib import Path

import pandas as pd


ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

import bctc_processor as processor  # noqa: E402
from financial_mapping import get_default_registry  # noqa: E402


def _frame(ticker: str = "PAN", **values: float) -> pd.DataFrame:
    index = pd.MultiIndex.from_tuples([(ticker, "2026-Q1")], names=["ticker", "period"])
    return pd.DataFrame([values], index=index)


class AdvancedFinancialMetricsPhase4Tests(unittest.TestCase):
    def test_ebit_reported_priority(self):
        result = processor.materialize_advanced_financial_metrics(
            _frame(ebit=999.0, profit_before_tax=100.0, interest_expense=10.0)
        ).iloc[0]
        self.assertEqual(result["ebit"], 999.0)
        self.assertEqual(result["ebit_status"], "reported")
        self.assertIsNone(result["ebit_formula"])

    def test_ebit_derived_formula(self):
        result = processor.materialize_advanced_financial_metrics(
            _frame(profit_before_tax=100.0, interest_expense=10.0)
        ).iloc[0]
        self.assertEqual(result["ebit"], 110.0)
        self.assertEqual(result["ebit_status"], "derived")
        self.assertEqual(result["ebit_formula"], "profit_before_tax + interest_expense")
        self.assertEqual(json.loads(result["ebit_inputs"]), ["profit_before_tax", "interest_expense"])

    def test_ebit_interest_sign(self):
        result = processor.materialize_advanced_financial_metrics(
            _frame(profit_before_tax=100.0, interest_expense=-10.0)
        ).iloc[0]
        self.assertTrue(pd.isna(result["ebit"]))
        self.assertEqual(result["interest_expense_sign_convention"], "negative_unresolved")
        self.assertEqual(result["ebit_reason"], "interest_expense_sign_not_normalized")

    def test_ebitda_requires_complete_inputs(self):
        result = processor.materialize_advanced_financial_metrics(
            _frame(ebit=110.0, depreciation=10.0)
        ).iloc[0]
        self.assertTrue(pd.isna(result["ebitda"]))
        self.assertEqual(result["ebitda_status"], "insufficient_periods")
        self.assertEqual(result["ebitda_reason"], "missing_ebit_or_complete_da_inputs")

    def test_financial_expense_not_used_as_interest_expense(self):
        mapped = get_default_registry().map_financial_item(
            "KBS", "corporate", "income_statement",
            "financial_expense", "Chi phí tài chính",
        )
        self.assertIsNone(mapped)

    def test_retained_earnings_mapping(self):
        registry = get_default_registry()
        mapped = registry.map_financial_item(
            "VCI", "corporate", "balance_sheet",
            "current_period_undistributed_earnings", "LNST chưa phân phối kỳ này",
        )
        self.assertEqual(mapped["canonical_metric"], "retained_earnings_current_year")
        result = processor.materialize_advanced_financial_metrics(
            _frame(retained_earnings_prior_year=70.0, retained_earnings_current_year=30.0)
        ).iloc[0]
        self.assertEqual(result["retained_earnings_end_period"], 100.0)
        self.assertEqual(result["retained_earnings_status"], "derived")

    def test_depreciation_and_amortization_are_not_invented(self):
        result = processor.materialize_advanced_financial_metrics(
            _frame(ebit=100.0, depreciation_and_amortization=20.0)
        ).iloc[0]
        self.assertTrue(pd.isna(result["depreciation"]))
        self.assertTrue(pd.isna(result["amortization"]))
        self.assertEqual(result["ebitda"], 120.0)
        self.assertEqual(result["ebitda_formula"], "ebit + depreciation_and_amortization")

    def test_sga_sum(self):
        result = processor.materialize_advanced_financial_metrics(
            _frame(selling_expense=40.0, general_admin_expense=60.0)
        ).iloc[0]
        self.assertEqual(result["sga"], 100.0)
        self.assertEqual(result["sga_status"], "derived")
        self.assertEqual(result["sga_formula"], "selling_expense + general_admin_expense")

    def test_sga_not_applicable_for_bank(self):
        result = processor.materialize_advanced_financial_metrics(
            _frame("VCB", selling_expense=40.0, general_admin_expense=60.0)
        ).iloc[0]
        self.assertTrue(pd.isna(result["sga"]))
        self.assertEqual(result["sga_status"], "not_applicable")
        self.assertEqual(result["sga_reason"], "corporate_sga_structure_not_applicable")


if __name__ == "__main__":
    unittest.main()
