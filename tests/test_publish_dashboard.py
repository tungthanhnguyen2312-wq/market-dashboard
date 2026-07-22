"""Focused delivery contract tests for dashboard public artifacts."""

from __future__ import annotations

import importlib.util
import json
import tempfile
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SPEC = importlib.util.spec_from_file_location("publish_dashboard", ROOT / "publish_dashboard.py")
publisher = importlib.util.module_from_spec(SPEC)
assert SPEC.loader is not None
SPEC.loader.exec_module(publisher)


class AnalysisBundleDeliveryTests(unittest.TestCase):
    def test_copy_preserves_corporate_intelligence_contract(self):
        payload = {
            "tickers": {
                "AAA": {
                    "corporate_intelligence": {
                        "status": "partial",
                        "company_profile": {"status": "missing", "sources": []},
                        "company_subsidiaries": {"status": "available", "sources": []},
                        "ownership_structure": {"status": "malformed", "sources": []},
                        "major_shareholders": {"status": "incomparable", "sources": []},
                    }
                },
                "LEGACY": {},
            }
        }
        with tempfile.TemporaryDirectory() as backend, tempfile.TemporaryDirectory() as web:
            backend_root, web_root = Path(backend), Path(web)
            source = backend_root / "analysis_bundle.json"
            source.write_text(json.dumps(payload, ensure_ascii=False), encoding="utf-8")
            old_backend, old_web, old_live = publisher.BACKEND_ROOT, publisher.WEB_ROOT, publisher.LIVE_MODE
            try:
                publisher.BACKEND_ROOT, publisher.WEB_ROOT, publisher.LIVE_MODE = backend_root, web_root, True
                self.assertIn("analysis_bundle.json", publisher.plan_copy_artifacts())
                self.assertIn("analysis_bundle.json", publisher.copy_public_artifacts())
                copied = json.loads((web_root / "analysis_bundle.json").read_text(encoding="utf-8"))
            finally:
                publisher.BACKEND_ROOT, publisher.WEB_ROOT, publisher.LIVE_MODE = old_backend, old_web, old_live
            self.assertEqual(copied, payload)
            self.assertIn("corporate_intelligence", copied["tickers"]["AAA"])
            self.assertEqual(copied["tickers"]["AAA"]["corporate_intelligence"]["status"], "partial")
            self.assertNotIn("corporate_intelligence", copied["tickers"]["LEGACY"])


if __name__ == "__main__":
    unittest.main()
