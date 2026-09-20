"""Asset cache-version contract (DASHBOARD_HOME_SUMMARY_AND_CACHE_BUSTING_V1, Part C).

FINAL CACHE-BUSTING AUTHORITY: publication-time stamping in stock-core-private's
publish_dashboard.py (update_asset_versions()/plan_asset_versions(), a deterministic
content-hash-based rewrite of every local .js/.css `?v=` token across every HTML page --
unchanged by this milestone). This test is the enforcement layer that closes the real
gap: nothing previously verified that a COMMITTED checkout's tokens actually matched
what the publisher would produce, so a direct manual edit to an HTML/asset file that
skipped re-running the publisher (exactly what happened twice earlier in this session)
could silently commit and deploy with a stale token, and nothing caught it.

This test runs in Dashboard CI (dashboard-ci.yml), which already gates Deploy Pages via
workflow_run: if a commit's tokens are inconsistent with data/build_info.json's own
build_id, CI fails and Pages never deploys it. Deploy-time rewriting in the GitHub Pages
workflow itself was considered and rejected: deploy-pages.yml's "Verify public Pages
bytes" step already asserts the live served dashboard.html/investment-workspace.html/
portfolio.html are byte-IDENTICAL to the just-checked-out repository source -- rewriting
HTML at deploy time would either break that integrity gate or require weakening it,
which is a much larger change than this presentation-only milestone should make.
"""
from __future__ import annotations

import json
import re
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
LOCAL_ASSET_RE = re.compile(r'(?:src|href)="((?:assets|data)/[^"]+\.(?:js|css))(\?[^"]*)?"')
ANY_VERSIONED_ATTR_RE = re.compile(r'\b(?:src|href)=["\']([^"\']+)["\']')
THIRD_PARTY_PREFIXES = ("http://", "https://", "//", "data:", "#")


def _build_id() -> str:
    payload = json.loads((ROOT / "data/build_info.json").read_text(encoding="utf-8"))
    build_id = payload.get("build_id")
    assert isinstance(build_id, str) and build_id, "data/build_info.json must declare a non-empty build_id"
    return build_id


def _html_pages() -> list[Path]:
    return sorted(ROOT.glob("*.html"))


class LocalAssetVersionMatchesBuildIdTests(unittest.TestCase):
    """Every local .js/.css reference on every page must carry the CURRENT build_id --
    never a stale token, never a missing one."""

    def test_every_local_asset_reference_on_every_page_carries_the_current_build_id(self):
        build_id = _build_id()
        failures = []
        for page in _html_pages():
            html = page.read_text(encoding="utf-8")
            for match in LOCAL_ASSET_RE.finditer(html):
                path, query = match.group(1), match.group(2)
                if not query or not query.startswith(f"?v={build_id}"):
                    failures.append(f"{page.name}: {path}{query or ''}")
        self.assertEqual(failures, [], "stale or missing asset version token(s):\n" + "\n".join(failures))

    def test_no_local_asset_reference_is_missing_a_version_token_entirely(self):
        for page in _html_pages():
            html = page.read_text(encoding="utf-8")
            for match in re.finditer(r'(?:src|href)="((?:assets|data)/[^"?]+\.(?:js|css))"', html):
                self.fail(f"{page.name}: {match.group(1)} has no ?v= cache-busting token at all")

    def test_no_local_asset_reference_carries_more_than_one_version_query_param(self):
        for page in _html_pages():
            html = page.read_text(encoding="utf-8")
            for match in LOCAL_ASSET_RE.finditer(html):
                query = match.group(2) or ""
                self.assertEqual(query.count("?v="), 1 if query else 0, f"{page.name}: duplicated ?v= in {match.group(0)}")
                self.assertNotIn("&v=", query, f"{page.name}: duplicated ?v=...&v=... in {match.group(0)}")

    def test_third_party_cdn_and_font_urls_are_never_touched(self):
        """Only local relative assets get a ?v= token; every http(s)/protocol-relative URL
        (Google Fonts, jsDelivr, unpkg, DataTables CDN, ...) must be left exactly as
        authored -- update_asset_versions() explicitly skips anything matching
        THIRD_PARTY_PREFIXES, and this pins that it keeps doing so."""
        for page in _html_pages():
            html = page.read_text(encoding="utf-8")
            for match in ANY_VERSIONED_ATTR_RE.finditer(html):
                url = match.group(1)
                if url.startswith(THIRD_PARTY_PREFIXES):
                    self.assertNotIn("v=" + _build_id(), url, f"{page.name}: build_id token leaked onto a third-party URL: {url}")

    def test_no_js_file_hardcodes_a_literal_build_id_style_version_string(self):
        """Real bug caught live during this milestone: app.js once hardcoded
        `assets/js/company-panel.js?v=2026-09-18-6f6effe-33d5b3e538` as a plain string
        literal for its runtime-injected <script> -- invisible to update_asset_versions()
        (which only scans HTML src=/href= attributes), so that token silently never
        advanced across multiple real publishes. Any literal YYYY-MM-DD-<sha>-<hash>-shaped
        string in a .js file is exactly that failure mode recurring; a dynamically-injected
        script must read its version from build_info at call time instead (see app.js's
        _companyPanelVersionQuery())."""
        literal_build_id_re = re.compile(r'["\']\?v=\d{4}-\d{2}-\d{2}-[0-9a-f]{7,}-[0-9a-f]{6,}["\']')
        for js_path in sorted((ROOT / "assets/js").glob("*.js")) + [ROOT / "app.js"]:
            text = js_path.read_text(encoding="utf-8")
            match = literal_build_id_re.search(text)
            self.assertIsNone(match, f"{js_path.relative_to(ROOT)}: hardcoded build-id-style version string {match and match.group(0)!r}")

    def test_data_artifact_urls_fetched_at_runtime_are_not_versioned(self):
        """Data artifacts (screen_snapshot.csv, dashboard_home_summary.json, ...) are
        fetched with `cache: "no-store"` at runtime, not via a cache-busted <script>/<link>
        tag -- they must never accidentally pick up a ?v= token from this mechanism."""
        for page in _html_pages():
            html = page.read_text(encoding="utf-8")
            for match in re.finditer(r'(?:src|href)="(data/[^"]+\.(?:csv|json))(\?[^"]*)?"', html):
                self.assertIsNone(match.group(2), f"{page.name}: {match.group(1)} unexpectedly carries a query token")


class StampingIsPureDeterministicAndRepeatable(unittest.TestCase):
    """Exercises stock-core-private's own _versioned_html()-equivalent pure text
    transform directly (imported from the local target-checkout copy of
    publish_dashboard.py, which carries the identical function) -- proves the mechanism
    itself is deterministic and idempotent, independent of what happens to be committed
    right now."""

    def setUp(self):
        import importlib.util
        import sys

        if str(ROOT) not in sys.path:
            sys.path.insert(0, str(ROOT))

        spec = importlib.util.spec_from_file_location("publish_dashboard", ROOT / "publish_dashboard.py")
        self.pd = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(self.pd)

    def test_versioning_a_page_twice_with_the_same_build_id_is_idempotent(self):
        original = '<link rel="stylesheet" href="style.css?v=OLD_TOKEN">'
        once = self.pd._versioned_html(original, "NEW_TOKEN")
        twice = self.pd._versioned_html(once, "NEW_TOKEN")
        self.assertEqual(once, twice)
        self.assertIn('href="style.css?v=NEW_TOKEN"', once)

    def test_changing_build_id_changes_every_local_token_deterministically(self):
        original = (
            '<link rel="stylesheet" href="style.css?v=A">'
            '<script src="assets/js/app.js?v=A"></script>'
            '<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.3/dist/chart.umd.min.js"></script>'
        )
        rewritten = self.pd._versioned_html(original, "B")
        self.assertIn('href="style.css?v=B"', rewritten)
        self.assertIn('src="assets/js/app.js?v=B"', rewritten)
        self.assertIn('src="https://cdn.jsdelivr.net/npm/chart.js@4.4.3/dist/chart.umd.min.js"', rewritten)
        self.assertNotIn("v=A", rewritten)

    def test_a_relative_asset_with_no_prior_token_gets_one_added(self):
        original = '<script src="assets/js/app.js"></script>'
        rewritten = self.pd._versioned_html(original, "FRESH")
        self.assertIn('src="assets/js/app.js?v=FRESH"', rewritten)

    def test_non_js_css_relative_paths_are_left_untouched(self):
        original = '<a href="archive.html">Lịch sử</a><link rel="icon" href="data:image/svg+xml,abc">'
        rewritten = self.pd._versioned_html(original, "X")
        self.assertEqual(original, rewritten)


if __name__ == "__main__":
    unittest.main()
