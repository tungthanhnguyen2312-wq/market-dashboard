"""Phase 9 validation of the locally rebuilt schema-v2 snapshot."""

from __future__ import annotations

import json
import unittest
from pathlib import Path

import pandas as pd


ROOT = Path(__file__).resolve().parents[1]
SNAPSHOT = ROOT / "financial_snapshot.csv"
REPORT = ROOT / "reports" / "financial_snapshot_rebuild.json"


class SnapshotRebuildTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.frame = pd.read_csv(SNAPSHOT)
        cls.report = json.loads(REPORT.read_text(encoding="utf-8"))

    def test_rebuilt_snapshot_contains_advanced_metrics(self):
        required = {
            "ebit", "ebit_status", "ebit_formula", "ebit_source", "ebit_period",
            "ebitda", "ebitda_status", "ebitda_formula", "ebitda_source", "ebitda_period",
            "interest_expense", "interest_expense_status", "retained_earnings",
            "retained_earnings_status", "depreciation", "amortization",
            "depreciation_and_amortization", "selling_expense", "general_admin_expense",
            "sga", "sga_status",
        }
        self.assertFalse(required - set(self.frame.columns))

    def test_pan_snapshot_values_after_rebuild(self):
        row = self.frame[(self.frame.ticker == "PAN") & (self.frame.period == "2026-Q1")].iloc[0]
        self.assertEqual(row.ebit, 600_682_628_000)
        self.assertEqual(row.ebit_status, "derived")
        self.assertEqual(row.ebit_formula, "profit_before_tax + interest_expense")
        self.assertEqual(row.sga, 353_782_849_000)
        self.assertEqual(row.sga_status, "derived")
        self.assertEqual(row.retained_earnings, 2_618_950_443_317)
        self.assertEqual(row.retained_earnings_status, "reported")
        self.assertEqual(row.ebitda_status, "insufficient_periods")

    def test_snapshot_duplicate_keys(self):
        self.assertEqual(int(self.frame.duplicated(["ticker", "period"]).sum()), 0)

    def test_snapshot_schema_version(self):
        self.assertEqual(set(self.frame.schema_version.astype(str)), {"2.0"})

    def test_snapshot_rebuild_report_passed(self):
        self.assertTrue(self.report["validation"]["passed"])
        self.assertEqual(self.report["replacement_status"], "replaced")
        self.assertTrue(all(self.report["validation"]["checks"].values()))
        self.assertEqual(self.report["old_snapshot"]["row_count"], self.report["new_snapshot"]["row_count"])

    def test_unknown_unit_is_explicit_not_vnd(self):
        unknown = self.frame[self.frame.operating_cash_flow_normalized_unit == "unknown"]
        self.assertGreater(len(unknown), 0)
        self.assertEqual(set(unknown.operating_cash_flow_unit_status), {"unit_unknown"})
        self.assertEqual(set(unknown.operating_cash_flow_unit_multiplier), {1.0})

    def test_non_corporate_sga_not_applicable(self):
        for ticker in ("VCB", "SSI", "BVH"):
            rows = self.frame[self.frame.ticker == ticker]
            self.assertTrue(rows.sga.isna().all(), ticker)
            self.assertEqual(set(rows.sga_status), {"not_applicable"}, ticker)


if __name__ == "__main__":
    unittest.main()
