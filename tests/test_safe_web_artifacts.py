"""SAFE_WEB_ARTIFACT publication contract for product surfaces.

Pins the Dashboard-side allowlist so existing Workspace/Portfolio surfaces
are publication-ready, future screener projection filenames are accepted
without being required, and unrelated or unsafe paths stay rejected.
"""

from __future__ import annotations

import importlib.util
import re
import sys
import tempfile
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))
SPEC = importlib.util.spec_from_file_location("publish_dashboard", ROOT / "publish_dashboard.py")
publisher = importlib.util.module_from_spec(SPEC)
assert SPEC.loader is not None
SPEC.loader.exec_module(publisher)

REQUIRED_PRODUCT_SURFACES = (
    "investment-workspace.html",
    "portfolio.html",
    "data/investment_decision_workspace.json",
)
FUTURE_SCREENER_PROJECTION = (
    "data/screener_master_projection.json",
    "data/screener_master_projection.js",
)
STATIC_PAGES = (
    "investment-workspace.html",
    "portfolio.html",
    "screener.html",
)
ATTR_RE = re.compile(r'(?:src|href)=["\']([^"\']+)["\']', re.I)
FETCH_RE = re.compile(r'fetch\(\s*["\']([^"\']+)["\']', re.I)


def _relative_page_assets(html: str) -> list[str]:
    found: list[str] = []
    for raw in ATTR_RE.findall(html) + FETCH_RE.findall(html):
        relative = raw.split("?", 1)[0].split("#", 1)[0]
        if not relative:
            continue
        if relative.startswith(("http://", "https://", "//", "/", "data:", "mailto:", "#")):
            continue
        found.append(relative)
    return found


def _seed_web(root: Path) -> None:
    (root / "dashboard.html").write_text("<html><body>ok</body></html>\n", encoding="utf-8")
    (root / "investment-workspace.html").write_text(
        '<html><script src="assets/js/investment-workspace.js"></script></html>\n',
        encoding="utf-8",
    )
    (root / "portfolio.html").write_text(
        '<html><script src="portfolio.js"></script></html>\n', encoding="utf-8",
    )
    (root / "portfolio.js").write_text("/* portfolio */\n", encoding="utf-8")
    (root / "assets/js").mkdir(parents=True, exist_ok=True)
    (root / "assets/js/investment-workspace.js").write_text(
        'const DATA_URL = "data/investment_decision_workspace.json";\n', encoding="utf-8",
    )
    for relative in sorted(publisher.SAFE_WEB_ARTIFACTS):
        path = root / relative
        path.parent.mkdir(parents=True, exist_ok=True)
        if path.exists():
            continue
        if relative.endswith(".json"):
            path.write_text("{}\n", encoding="utf-8")
        elif relative.endswith(".csv"):
            path.write_text("ticker,exchange,date\nHPG,HSX,2026-08-28\n", encoding="utf-8")
        else:
            path.write_text("/* fixture */\n", encoding="utf-8")


class SafeWebArtifactAllowlistTests(unittest.TestCase):
    def test_required_product_surfaces_are_accepted(self):
        for relative in REQUIRED_PRODUCT_SURFACES:
            self.assertIn(relative, publisher.SAFE_WEB_ARTIFACTS)
            self.assertIn(relative, publisher.REQUIRED_PRODUCT_SURFACE_ARTIFACTS)
            self.assertTrue(publisher.is_safe_web_artifact(relative), relative)

    def test_future_screener_projection_filenames_are_accepted(self):
        for relative in FUTURE_SCREENER_PROJECTION:
            self.assertIn(relative, publisher.OPTIONAL_SAFE_WEB_ARTIFACTS)
            self.assertNotIn(relative, publisher.SAFE_WEB_ARTIFACTS)
            self.assertTrue(publisher.is_safe_web_artifact(relative), relative)

    def test_unrelated_arbitrary_files_are_rejected(self):
        rejected = (
            "notes.txt",
            "secrets.env",
            "data/random.json",
            "data/evil.js",
            "analysis_latest.md",
            "operations-review/artifact.json",
            "vn_stock.db",
            "config.json",
            "tickers.txt",
        )
        for relative in rejected:
            self.assertFalse(publisher.is_safe_web_artifact(relative), relative)

    def test_path_traversal_and_unsafe_paths_are_rejected(self):
        rejected = (
            "../investment-workspace.html",
            "..\\portfolio.html",
            "data/../../vn_stock.db",
            "data/../screen_snapshot.csv",
            "/etc/passwd",
            "C:\\Windows\\System32\\config",
            "//evil.example/x",
            "file:///tmp/x",
            "data/screener_master_projection.json/../secrets.json",
            "",
            ".",
            "./portfolio.html",
            "data//investment_decision_workspace.json",
        )
        for relative in rejected:
            self.assertFalse(publisher.is_safe_web_artifact(relative), relative)
            self.assertIsNone(publisher.normalize_web_artifact_relative(relative), relative)

    def test_existing_copy_artifacts_remain_accepted(self):
        for relative in publisher.COPY_ARTIFACTS:
            self.assertIn(relative, publisher.SAFE_WEB_ARTIFACTS)
            self.assertTrue(publisher.is_safe_web_artifact(relative), relative)
        self.assertTrue(publisher.is_safe_web_artifact("data/screener_data.js"))
        self.assertTrue(publisher.is_safe_web_artifact("data/build_info.json"))
        self.assertTrue(publisher.is_safe_web_artifact("data/build_info.js"))

    def test_query_string_does_not_bypass_exact_allowlist(self):
        self.assertTrue(
            publisher.is_safe_web_artifact("data/investment_decision_workspace.json?v=1")
        )
        self.assertTrue(
            publisher.is_safe_web_artifact("data/screener_master_projection.js?v=abc")
        )
        self.assertFalse(publisher.is_safe_web_artifact("data/random.json?v=1"))

    def test_allowlist_is_exact_not_generic_data_json(self):
        self.assertFalse(publisher.is_safe_web_artifact("data/current_decision_cockpit.json"))
        self.assertFalse(publisher.is_safe_web_artifact("data/shadow_recommendation_product_surface.json"))


class PublicationWhitelistBehaviorTests(unittest.TestCase):
    def setUp(self):
        self._tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self._tmp.cleanup)
        self.web = Path(self._tmp.name)
        _seed_web(self.web)
        self._orig_backend = publisher.BACKEND_ROOT
        self._orig_web = publisher.WEB_ROOT
        publisher.BACKEND_ROOT = publisher.WEB_ROOT = self.web
        self.addCleanup(self._restore)

    def _restore(self):
        publisher.BACKEND_ROOT = self._orig_backend
        publisher.WEB_ROOT = self._orig_web

    def test_required_product_surfaces_are_in_whitelist(self):
        whitelist = publisher.build_whitelist()
        for relative in REQUIRED_PRODUCT_SURFACES:
            self.assertIn(relative, whitelist)

    def test_missing_optional_projection_does_not_block_publication(self):
        for relative in FUTURE_SCREENER_PROJECTION:
            self.assertFalse((self.web / relative).exists())
        whitelist = publisher.build_whitelist()
        for relative in FUTURE_SCREENER_PROJECTION:
            self.assertNotIn(relative, whitelist)
        publisher.validate_json_artifacts()

    def test_present_optional_projection_is_included(self):
        json_path = self.web / "data/screener_master_projection.json"
        js_path = self.web / "data/screener_master_projection.js"
        json_path.write_text('{"schema_version":"screener_master_projection/v1"}\n', encoding="utf-8")
        js_path.write_text("window.SCREENER_MASTER_PROJECTION = {};\n", encoding="utf-8")
        whitelist = publisher.build_whitelist()
        self.assertIn("data/screener_master_projection.json", whitelist)
        self.assertIn("data/screener_master_projection.js", whitelist)
        publisher.validate_json_artifacts()

    def test_unrelated_on_disk_file_is_not_auto_whitelisted(self):
        (self.web / "data/random.json").write_text("{}\n", encoding="utf-8")
        (self.web / "notes.txt").write_text("nope\n", encoding="utf-8")
        whitelist = publisher.build_whitelist()
        self.assertNotIn("data/random.json", whitelist)
        self.assertNotIn("notes.txt", whitelist)

    def test_html_extracted_traversal_is_dropped(self):
        (self.web / "dashboard.html").write_text(
            '<html><a href="../vn_stock.db">bad</a><script src="app.js"></script></html>\n',
            encoding="utf-8",
        )
        (self.web / "app.js").write_text("/* app */\n", encoding="utf-8")
        (self.web / "vn_stock.db").write_text("sqlite\n", encoding="utf-8")
        whitelist = publisher.build_whitelist()
        self.assertNotIn("../vn_stock.db", whitelist)
        self.assertNotIn("vn_stock.db", whitelist)
        self.assertIn("app.js", whitelist)

    def test_empty_optional_json_is_rejected_when_present(self):
        (self.web / "data/screener_master_projection.json").write_text("", encoding="utf-8")
        with self.assertRaises(ValueError):
            publisher.validate_json_artifacts()


class StaticReferenceValidationTests(unittest.TestCase):
    def test_product_pages_reference_existing_relative_assets(self):
        missing: list[str] = []
        for name in STATIC_PAGES:
            html = (ROOT / name).read_text(encoding="utf-8")
            self.assertTrue(html.strip(), name)
            for relative in _relative_page_assets(html):
                if not (ROOT / relative).is_file():
                    missing.append(f"{name} -> {relative}")
        self.assertEqual(missing, [])

    def test_workspace_and_screener_fetch_existing_workspace_json(self):
        workspace_js = (ROOT / "assets/js/investment-workspace.js").read_text(encoding="utf-8")
        screener = (ROOT / "screener.html").read_text(encoding="utf-8")
        self.assertIn("data/investment_decision_workspace.json", workspace_js)
        screener_js = (ROOT / "assets/js/screener-master.js").read_text(encoding="utf-8")
        self.assertIn("data/investment_decision_workspace.json", screener_js)
        self.assertTrue((ROOT / "data/investment_decision_workspace.json").is_file())
        self.assertNotIn("screener_master_projection", workspace_js)

    def test_screener_primary_row_source_is_master_projection(self):
        screener = (ROOT / "screener.html").read_text(encoding="utf-8")
        screener_js = (ROOT / "assets/js/screener-master.js").read_text(encoding="utf-8")
        self.assertIn("data/screener_master_projection.json", screener_js)
        self.assertIn("data/screener_master_projection.js", screener_js)
        self.assertNotIn('loadCsv("screen_snapshot.csv"', screener)
        self.assertTrue((ROOT / "data/screener_master_projection.json").is_file())
        self.assertTrue((ROOT / "data/screener_master_projection.js").is_file())

    def test_tracked_required_surfaces_exist(self):
        for relative in REQUIRED_PRODUCT_SURFACES:
            self.assertTrue((ROOT / relative).is_file(), relative)


class PagesWorkflowContractTests(unittest.TestCase):
    def setUp(self):
        self.workflow = (ROOT / ".github/workflows/deploy-pages.yml").read_text(encoding="utf-8")

    def test_pages_verification_requires_existing_product_surfaces(self):
        for relative in REQUIRED_PRODUCT_SURFACES:
            self.assertGreaterEqual(self.workflow.count(f'"{relative}"'), 2, relative)

    def test_pages_verification_does_not_require_missing_future_projection(self):
        self.assertIn("data/screener_master_projection.json", self.workflow)
        self.assertIn("data/screener_master_projection.js", self.workflow)
        self.assertIn("OPTIONAL_PUBLIC_FILES", self.workflow)
        required_block = self.workflow.split("OPTIONAL_PUBLIC_FILES")[0]
        self.assertNotIn("screener_master_projection", required_block.split("FILES=(")[-1])


if __name__ == "__main__":
    unittest.main()
