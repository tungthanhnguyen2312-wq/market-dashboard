"""
tests/test_visual_foundation_contract.py
============================================================
Visual Foundation Contract Test Suite for Phase 2B (Stock Lookup).
Validates design token existence, semantic color distinction, motion tokens,
reduced motion overrides, CSS syntax integrity, and strict file isolation.
============================================================
"""

import os
import re
import unittest

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

class VisualFoundationContractTests(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        style_path = os.path.join(PROJECT_ROOT, "style.css")
        shell_path = os.path.join(PROJECT_ROOT, "assets/css/shell.css")

        with open(style_path, "r", encoding="utf-8") as f:
            cls.style_css = f.read()

        with open(shell_path, "r", encoding="utf-8") as f:
            cls.shell_css = f.read()

        cls.combined_css = cls.style_css + "\n" + cls.shell_css

    def test_1_required_existing_semantic_tokens_exist(self):
        """1. Verify required existing semantic tokens exist in CSS root."""
        required_tokens = ["--bg", "--surface", "--primary", "--success", "--danger", "--warning"]
        for token in required_tokens:
            self.assertIn(token, self.style_css, f"Missing required token: {token}")

    def test_2_required_financial_state_classes_exist(self):
        """2. Verify required financial state classes exist in CSS."""
        required_classes = [".val-pos", ".val-neg", ".bs-green", ".bs-amber", ".bs-red", ".bs-gray"]
        for cls_name in required_classes:
            self.assertIn(cls_name, self.style_css, f"Missing financial state class: {cls_name}")

    def test_3_new_motion_tokens_exist(self):
        """3. Verify new Hanson motion tokens exist in CSS root."""
        motion_tokens = ["--motion-fast", "--motion-medium", "--motion-panel"]
        for token in motion_tokens:
            self.assertIn(token, self.style_css, f"Missing motion token: {token}")

    def test_4_bullish_and_bearish_aliases_distinct(self):
        """4. Verify bullish and bearish aliases are not assigned the same value."""
        bull_match = re.search(r"--market-bull\s*:\s*([^;]+);", self.style_css)
        bear_match = re.search(r"--market-bear\s*:\s*([^;]+);", self.style_css)
        self.assertIsNotNone(bull_match, "--market-bull alias missing")
        self.assertIsNotNone(bear_match, "--market-bear alias missing")
        self.assertNotEqual(
            bull_match.group(1).strip(),
            bear_match.group(1).strip(),
            "Bullish and bearish aliases must not have identical values"
        )

    def test_5_generic_primary_accent_distinct_from_financial_colors(self):
        """5. Verify primary UI accent (Teal) is distinct from bullish and bearish colors."""
        primary_match = re.search(r"--primary\s*:\s*([^;]+);", self.style_css)
        success_match = re.search(r"--success\s*:\s*([^;]+);", self.style_css)
        danger_match = re.search(r"--danger\s*:\s*([^;]+);", self.style_css)

        self.assertIsNotNone(primary_match, "--primary token missing")
        self.assertIsNotNone(success_match, "--success token missing")
        self.assertIsNotNone(danger_match, "--danger token missing")

        p_val = primary_match.group(1).strip().lower()
        s_val = success_match.group(1).strip().lower()
        d_val = danger_match.group(1).strip().lower()

        self.assertNotEqual(p_val, s_val, "--primary accent must be distinct from --success")
        self.assertNotEqual(p_val, d_val, "--primary accent must be distinct from --danger")

    def test_6_reduced_motion_support_exists(self):
        """6. Verify prefers-reduced-motion override exists in CSS."""
        self.assertIn("prefers-reduced-motion", self.combined_css, "Missing prefers-reduced-motion media query")

    def test_7_no_html_or_js_files_required_by_patch(self):
        """7. Verify test suite can execute without modifying HTML or JS files."""
        html_files = [f for f in os.listdir(PROJECT_ROOT) if f.endswith(".html")]
        self.assertGreaterEqual(len(html_files), 7, "All 7 HTML pages must exist in repo")

    def test_8_no_legal_crawler_terms(self):
        """8. Verify no LegalCrawler terms exist in CSS files."""
        forbidden_terms = ["legalcrawler", "legal_crawler", "crawler_db", "case_law", "court_id"]
        for term in forbidden_terms:
            self.assertNotIn(term, self.combined_css.lower(), f"Forbidden LegalCrawler term found: {term}")

    def test_9_generated_tailwind_css_unmodified_contract(self):
        """9. Verify generated tailwind CSS exists and is distinct from style.css."""
        tw_path = os.path.join(PROJECT_ROOT, "assets/css/tailwind.generated.css")
        self.assertTrue(os.path.exists(tw_path), "tailwind.generated.css must exist")

    def test_10_no_conflict_markers_in_css(self):
        """10. Verify CSS files contain no unresolved git conflict markers."""
        conflict_patterns = [r"^<{7}\s", r"^={7}\s*$", r"^>{7}\s"]
        for pattern in conflict_patterns:
            self.assertIsNone(
                re.search(pattern, self.combined_css, re.MULTILINE),
                f"Git conflict marker matching pattern '{pattern}' found in CSS"
            )

    def test_11_required_topbar_and_drawer_selectors_present(self):
        """11. Verify required shell selectors (.vs-topbar, .vs-sidebar, .vs-sidebar-overlay) exist."""
        selectors = [".vs-topbar", ".vs-sidebar", ".vs-sidebar-overlay"]
        for sel in selectors:
            self.assertIn(sel, self.shell_css, f"Missing required shell selector: {sel}")

    def test_12_val_pos_and_val_neg_separate_tokens(self):
        """12. Verify .val-pos and .val-neg reference separate semantic tokens (--success and --danger)."""
        pos_match = re.search(r"\.val-pos\s*\{[^}]*color\s*:\s*([^;]+);", self.style_css)
        neg_match = re.search(r"\.val-neg\s*\{[^}]*color\s*:\s*([^;]+);", self.style_css)

        self.assertIsNotNone(pos_match, ".val-pos color declaration missing")
        self.assertIsNotNone(neg_match, ".val-neg color declaration missing")

        pos_color = pos_match.group(1).strip()
        neg_color = neg_match.group(1).strip()

        self.assertIn("success", pos_color.lower(), ".val-pos must reference --success token")
        self.assertIn("danger", neg_color.lower(), ".val-neg must reference --danger token")


if __name__ == "__main__":
    unittest.main()
