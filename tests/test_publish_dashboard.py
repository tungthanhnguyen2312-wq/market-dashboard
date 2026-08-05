"""Focused delivery contract tests for dashboard public artifacts."""

from __future__ import annotations

import hashlib
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


class _FakeGit:
    """Answers only the read-only git() queries a --live run needs for a clean, conflict-
    free repo with a pending unrelated change; raises on anything unexpected instead of
    silently faking a mutating command."""

    def __init__(self, root: Path, branch: str = "main"):
        self.root = root
        self.branch = branch
        self.calls: list[tuple[str, ...]] = []
        self.status_output = " M dashboard.html\n"

    def __call__(self, *args: str, timeout: int = 180):
        self.calls.append(args)
        if args == ("rev-parse", "--show-toplevel"):
            return True, str(self.root)
        if args == ("branch", "--show-current"):
            return True, self.branch
        if args == ("remote", "get-url", "origin"):
            return True, "https://example.invalid/repo.git"
        if args == ("diff", "--name-only", "--diff-filter=U"):
            return True, ""
        if args == ("rev-parse", "HEAD"):
            return True, "0" * 40
        if args[:2] == ("show", "-s"):
            return True, "2026-08-05T00:00:00+07:00"
        if args == ("fetch", "origin", self.branch):
            return True, ""
        if args == ("rev-parse", f"origin/{self.branch}"):
            return True, "0" * 40
        if args and args[0] == "rev-list":
            return True, "0\t0"
        if args[:3] == ("diff", "--check", "--"):
            return True, ""
        if args[:2] == ("status", "--porcelain"):
            return True, self.status_output
        raise AssertionError(f"Unexpected git() call in test: {args!r}")


def _backend_fixture(root: Path, session: str) -> None:
    root.mkdir(parents=True, exist_ok=True)
    (root / "bundle_manifest.json").write_text(json.dumps({
        "freshness": {"reference_session": session, "blocked": False, "status": "fresh"},
    }), encoding="utf-8")
    (root / "screen_snapshot.csv").write_text(_snapshot_csv(session), encoding="utf-8")
    (root / "market_breadth.csv").write_text(f"group,date,n_up\nALL,{session},1\n", encoding="utf-8")
    (root / "analysis_bundle.json").write_text(
        json.dumps({"reference_session_date": session}), encoding="utf-8")


class AtomicTrustedSubsetReleaseTests(unittest.TestCase):
    """Reproduces commit fbaf1fe (2026-08-05) in this worktree's own publish_dashboard.py:
    a fresh analysis_bundle.json copied from BACKEND_ROOT must never reach git
    add/commit/push while WEB_ROOT's bundle_manifest.json (tools/publish_release.py's
    domain) still names a different session's hash for it."""

    def setUp(self):
        self.backend_dir = tempfile.TemporaryDirectory()
        self.web_dir = tempfile.TemporaryDirectory()
        self.addCleanup(self.backend_dir.cleanup)
        self.addCleanup(self.web_dir.cleanup)
        self.backend, self.web = Path(self.backend_dir.name), Path(self.web_dir.name)
        _backend_fixture(self.backend, "2026-08-04")
        for name in ("app.js", "style.css", "assets/js/value-format.js",
                    "assets/js/company-panel.js", "assets/css/tailwind.generated.css"):
            (self.web / name).parent.mkdir(parents=True, exist_ok=True)
            (self.web / name).write_text("/* fixture */\n", encoding="utf-8")
        (self.web / "dashboard.html").write_text(
            '<html><head><link href="style.css"><script src="app.js"></script></head>'
            "<body></body></html>\n", encoding="utf-8")
        for relative in sorted(publisher.SAFE_WEB_ARTIFACTS):
            path = self.web / relative
            if path.exists():
                continue
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text("{}\n" if relative.endswith(".json") else "/* fixture */\n", encoding="utf-8")

        self.fake_git = _FakeGit(self.web)
        self._orig_backend, self._orig_web = publisher.BACKEND_ROOT, publisher.WEB_ROOT
        self._orig_live = publisher.LIVE_MODE
        publisher.BACKEND_ROOT, publisher.WEB_ROOT = self.backend, self.web
        self.addCleanup(self._restore)

    def _restore(self):
        publisher.BACKEND_ROOT, publisher.WEB_ROOT = self._orig_backend, self._orig_web
        publisher.LIVE_MODE = self._orig_live

    def _run_live(self):
        with mock.patch.object(publisher, "git", self.fake_git), \
             mock.patch("sys.argv", ["publish_dashboard.py", "--live"]):
            return publisher.main()

    def test_mixed_release_is_blocked_before_any_git_mutation(self):
        (self.web / "bundle_manifest.json").write_text(json.dumps({
            "trusted_subset": {
                "session_identity": "2026-08-03",
                "required_artifacts": [{"file": "analysis_bundle.json", "sha256": "0" * 64}],
                "expected_artifact_filenames": ["analysis_bundle.json", "bundle_manifest.json"],
            },
        }), encoding="utf-8")

        with mock.patch.object(publisher, "run_release_smoke_tests") as m_smoke, \
             mock.patch.object(publisher, "publish_live") as m_publish:
            rc = self._run_live()

        self.assertEqual(rc, 1)
        self.assertTrue((self.web / "analysis_bundle.json").exists())
        m_smoke.assert_not_called()
        m_publish.assert_not_called()
        mutating = {"add", "commit", "push"}
        used = {call[0] for call in self.fake_git.calls if call}
        self.assertFalse(used & mutating, "Mixed release phải bị chặn trước mọi git mutation")

    def test_matching_manifest_reaches_publish_live(self):
        digest = hashlib.sha256((self.backend / "analysis_bundle.json").read_bytes()).hexdigest()
        (self.web / "bundle_manifest.json").write_text(json.dumps({
            "trusted_subset": {
                "session_identity": "2026-08-04",
                "required_artifacts": [{"file": "analysis_bundle.json", "sha256": digest}],
                "expected_artifact_filenames": ["analysis_bundle.json", "bundle_manifest.json"],
            },
        }), encoding="utf-8")

        with mock.patch.object(publisher, "run_release_smoke_tests", return_value=0), \
             mock.patch.object(publisher, "publish_live", return_value=0) as m_publish:
            rc = self._run_live()
        self.assertEqual(rc, 0)
        m_publish.assert_called_once()

    def test_release_smoke_failure_blocks_before_git_mutation(self):
        with mock.patch.object(publisher, "run_release_smoke_tests", return_value=1), \
             mock.patch.object(publisher, "publish_live") as m_publish:
            rc = self._run_live()
        self.assertEqual(rc, 1)
        m_publish.assert_not_called()
        mutating = {"add", "commit", "push"}
        used = {call[0] for call in self.fake_git.calls if call}
        self.assertFalse(used & mutating)


if __name__ == "__main__":
    unittest.main()
