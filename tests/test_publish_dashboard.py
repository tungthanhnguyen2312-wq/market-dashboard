"""Focused delivery contract tests for dashboard public artifacts."""

from __future__ import annotations

import importlib.util
import json
import sys
import tempfile
import unittest
from pathlib import Path
from unittest import mock


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


def _snapshot_csv(session: str) -> str:
    return f"ticker,exchange,date\nHPG,HSX,{session}\nABC,HNX,{session}\n"


def _manifest(session: str) -> str:
    return json.dumps({"freshness": {"reference_session": session, "blocked": False, "status": "fresh"}})


class ReleaseSessionGateTests(unittest.TestCase):
    """Reproduces the reported defect: a dry-run must never report a stale session (e.g.
    2026-07-24) as a valid publish plan when bundle_manifest.json already names a newer
    one. See docs/dashboard_release_session_contract.md (stock-core-private)."""

    def _run(self, web_root: Path, argv: list[str]) -> tuple[int, str]:
        import io
        from contextlib import redirect_stdout
        with mock.patch.object(sys, "argv", argv):
            buf = io.StringIO()
            with redirect_stdout(buf):
                rc = publisher.main()
        return rc, buf.getvalue()

    def test_stale_web_root_screen_snapshot_with_newer_manifest_fails_closed(self):
        # The exact repro: bundle_manifest.json already names a newer session than the
        # screen_snapshot.csv sitting next to it (a leftover from an earlier, incomplete
        # publish) — BACKEND_ROOT defaults to WEB_ROOT because no override was set, the
        # same as a bare `sync_and_publish.bat` invocation from this worktree.
        with tempfile.TemporaryDirectory() as web:
            web_root = Path(web)
            (web_root / "screen_snapshot.csv").write_text(_snapshot_csv("2026-07-24"), encoding="utf-8")
            (web_root / "market_breadth.csv").write_text("group,date,n_up\nALL,2026-07-24,1\n", encoding="utf-8")
            (web_root / "bundle_manifest.json").write_text(_manifest("2026-08-04"), encoding="utf-8")

            old_backend, old_web = publisher.BACKEND_ROOT, publisher.WEB_ROOT
            try:
                publisher.BACKEND_ROOT = publisher.WEB_ROOT = web_root
                with mock.patch.object(publisher, "git_preflight", return_value=("main", "origin", "0" * 40)):
                    rc, output = self._run(web_root, ["publish_dashboard.py"])
            finally:
                publisher.BACKEND_ROOT, publisher.WEB_ROOT = old_backend, old_web

            self.assertEqual(rc, 1)
            self.assertIn("PUBLISH_READY=NO", output)
            self.assertIn("screen_snapshot.csv observed=2026-07-24 expected=2026-08-04", output)
            # The defect this guards: the old code reported this exact stale session as
            # a *successful* plan ("Snapshot hợp lệ: ... phiên 2026-07-24").
            self.assertNotIn("phiên 2026-07-24", output)

    def test_backend_fresh_and_consistent_reports_its_own_session_not_web_roots(self):
        """BACKEND_ROOT (fresh generation) disagreeing internally must still be caught even
        though WEB_ROOT (a stand-in for the served checkout) holds an unrelated older
        session — proves the gate reads BACKEND_ROOT, not whatever WEB_ROOT already has."""
        with tempfile.TemporaryDirectory() as backend, tempfile.TemporaryDirectory() as web:
            backend_root, web_root = Path(backend), Path(web)
            (backend_root / "screen_snapshot.csv").write_text(_snapshot_csv("2026-08-04"), encoding="utf-8")
            (backend_root / "market_breadth.csv").write_text("group,date,n_up\nALL,2026-08-04,1\n", encoding="utf-8")
            (backend_root / "bundle_manifest.json").write_text(_manifest("2026-08-04"), encoding="utf-8")
            (web_root / "screen_snapshot.csv").write_text(_snapshot_csv("2020-01-01"), encoding="utf-8")

            old_backend, old_web = publisher.BACKEND_ROOT, publisher.WEB_ROOT
            try:
                publisher.BACKEND_ROOT, publisher.WEB_ROOT = backend_root, web_root
                report = publisher.validate_release_session()
            finally:
                publisher.BACKEND_ROOT, publisher.WEB_ROOT = old_backend, old_web

            self.assertTrue(report.ready)
            self.assertEqual(report.session, "2026-08-04")


if __name__ == "__main__":
    unittest.main()
