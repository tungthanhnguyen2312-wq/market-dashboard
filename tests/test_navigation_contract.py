import re
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SHELL_PAGES = [
    "dashboard.html",
    "screener.html",
    "macro.html",
    "archive.html",
]
SINGLE_TOPBAR_PAGES = [
    "signals.html",
    "about.html",
    "investment-workspace.html",
    "portfolio.html",
]
PAGE_NAMES = SHELL_PAGES + [
    "signals.html",
    "about.html",
]
PRODUCT_SURFACE_PAGES = PAGE_NAMES + [
    "investment-workspace.html",
    "portfolio.html",
]
# analysis.html is a compatibility redirect (like decision-cockpit.html before it) and is
# intentionally excluded from PRODUCT_SURFACE_PAGES / the primary-nav contract below: it carries
# no primary nav of its own to verify. REDIRECT_PAGES exists so it still gets an existence check.
REDIRECT_PAGES = [
    "analysis.html",
    "decision-cockpit.html",
]
EXPECTED_DATA_PAGES = {
    "dashboard.html": "dashboard",
    "screener.html": "screener",
    "signals.html": "signals",
    "macro.html": "macro",
    "archive.html": "archive",
    "about.html": "about",
    "investment-workspace.html": "investment-workspace",
    "portfolio.html": "portfolio",
}
VN_NAV_LABELS = [
    "Tổng quan",
    "Bộ lọc",
    "Tín hiệu",
    "Bàn quyết định",
    "Danh mục",
    "Vĩ mô",
    "Giới thiệu",
    "Lịch sử",
]
COMPACT_NAV_LABELS = [
    "Tổng quan",
    "Bộ lọc",
    "Tín hiệu",
    "Bàn quyết định",
    "Danh mục",
    "Vĩ mô",
    "Giới thiệu",
]
OLD_ENGLISH_NAV_LABELS = ["Dashboard", "Screener", "Analysis", "Signals", "Macro", "About"]


class NavigationContractTests(unittest.TestCase):
    def test_1_all_seven_html_pages_exist(self):
        for name in PRODUCT_SURFACE_PAGES + REDIRECT_PAGES:
            path = ROOT / name
            self.assertTrue(path.is_file(), f"Thiếu file HTML: {name}")

    def test_1b_analysis_is_a_compatibility_redirect_preserving_query_and_hash(self):
        content = (ROOT / "analysis.html").read_text(encoding="utf-8")
        self.assertNotRegex(content, r'<meta http-equiv="refresh"')
        self.assertIn('window.location.replace("investment-workspace.html?" + params.toString() + hash)', content)
        self.assertIn('params.set("view", "analysis")', content)
        self.assertNotIn('class="vs-topbar-nav"', content)
        self.assertNotIn('class="vs-sidebar"', content)

    def test_2_body_data_page_preserved(self):
        for name, expected_page in EXPECTED_DATA_PAGES.items():
            content = (ROOT / name).read_text(encoding="utf-8")
            match = re.search(r'<body[^>]*\bdata-page=["\']([^"\']+)["\']', content)
            self.assertIsNotNone(match, f"Không tìm thấy data-page trong {name}")
            self.assertEqual(match.group(1), expected_page, f"Sai data-page tại {name}")

    def test_3_all_expected_route_links_exist(self):
        for name in PAGE_NAMES:
            content = (ROOT / name).read_text(encoding="utf-8")
            for route in PAGE_NAMES:
                self.assertIn(f'href="{route}"', content, f"Thiếu href={route} trong {name}")
        for name in PRODUCT_SURFACE_PAGES:
            content = (ROOT / name).read_text(encoding="utf-8")
            for route in ("investment-workspace.html", "portfolio.html"):
                self.assertIn(f'href="{route}"', content, f"Thiếu href={route} trong {name}")

    def test_4_data_nav_keys_unchanged(self):
        expected_nav_keys = {"dashboard", "screener", "signals", "investment-workspace", "portfolio", "macro", "about", "archive"}
        for name in SHELL_PAGES:
            content = (ROOT / name).read_text(encoding="utf-8")
            found_keys = set(re.findall(r'data-nav=["\']([^"\']+)["\']', content))
            self.assertEqual(found_keys, expected_nav_keys, f"Mismatch data-nav keys trong {name}")

    def test_5_vietnamese_labels_present(self):
        for name in SHELL_PAGES:
            content = (ROOT / name).read_text(encoding="utf-8")
            for label in VN_NAV_LABELS:
                self.assertIn(label, content, f"Thiếu nhãn tiếng Việt '{label}' trong {name}")
        for name in SINGLE_TOPBAR_PAGES:
            content = (ROOT / name).read_text(encoding="utf-8")
            for label in COMPACT_NAV_LABELS:
                self.assertIn(label, content, f"Thiếu nhãn tiếng Việt '{label}' trong {name}")

    def test_6_visible_branding_uses_stock_lookup(self):
        for name in PRODUCT_SURFACE_PAGES:
            content = (ROOT / name).read_text(encoding="utf-8")
            self.assertIn("Stock Lookup", content, f"Thiếu thương hiệu 'Stock Lookup' trong {name}")
            shell_chunks = re.findall(r'<aside[^>]*>.*?<\/aside>|<header[^>]*>.*?<\/header>', content, re.S)
            for chunk in shell_chunks:
                self.assertNotIn("Stock Look Up", chunk, f"Tìm thấy thương hiệu cũ 'Stock Look Up' trong shell của {name}")

    def test_7_required_mobile_ids_present(self):
        required_ids = ["sidebar", "sidebar-toggle", "sidebar-overlay"]
        for name in SHELL_PAGES:
            content = (ROOT / name).read_text(encoding="utf-8")
            for req_id in required_ids:
                self.assertIn(f'id="{req_id}"', content, f"Thiếu id='{req_id}' trong {name}")
        for name in SINGLE_TOPBAR_PAGES:
            content = (ROOT / name).read_text(encoding="utf-8")
            self.assertIn('class="vs-topbar-nav"', content, f"Thiếu topbar nav trong {name}")
            self.assertNotIn('class="vs-sidebar"', content, f"Single-topbar {name} không được nhân bản sidebar")

    def test_8_no_legal_crawler_terms(self):
        banned_terms = ["LegalCrawler", "legal_crawler", "legal-crawler", "crawler_db"]
        for name in PRODUCT_SURFACE_PAGES:
            content = (ROOT / name).read_text(encoding="utf-8")
            for term in banned_terms:
                self.assertNotIn(term, content, f"Tìm thấy thuật ngữ cấm '{term}' trong {name}")

    def test_9_shell_js_contracts_present(self):
        js_content = (ROOT / "assets/js/shell.js").read_text(encoding="utf-8")
        for contract in ["initActiveLink", "initSidebarToggle", "initIcons", "is-active", "aria-current"]:
            self.assertIn(contract, js_content, f"Thiếu contract '{contract}' trong assets/js/shell.js")

    def test_10_old_english_labels_not_used_in_nav_links(self):
        for name in PRODUCT_SURFACE_PAGES:
            content = (ROOT / name).read_text(encoding="utf-8")
            nav_links = re.findall(r'<a[^>]*\bdata-nav="[^"]*"[^>]*>(.*?)<\/a>', content, re.S)
            nav_links += re.findall(r'<a[^>]*\bclass="[^"]*vs-topnav-link[^"]*"[^>]*>(.*?)<\/a>', content, re.S)
            for link_inner in nav_links:
                clean_text = re.sub(r'<[^>]+>', '', link_inner).strip()
                for old_label in OLD_ENGLISH_NAV_LABELS:
                    self.assertNotEqual(clean_text, old_label, f"Link nav vẫn dùng nhãn tiếng Anh '{old_label}' trong {name}")

    def test_11_valid_asset_references(self):
        for name in PRODUCT_SURFACE_PAGES:
            content = (ROOT / name).read_text(encoding="utf-8")
            self.assertIn('href="assets/css/shell.css', content, f"Thiếu shell.css reference trong {name}")
        for name in SHELL_PAGES:
            content = (ROOT / name).read_text(encoding="utf-8")
            self.assertIn('src="assets/js/shell.js', content, f"Thiếu shell.js reference trong {name}")

    def test_12_no_duplicate_ids_in_html(self):
        for name in PRODUCT_SURFACE_PAGES:
            content = (ROOT / name).read_text(encoding="utf-8")
            ids = re.findall(r'\bid=["\']([^"\']+)["\']', content)
            seen = set()
            duplicates = set()
            for item in ids:
                if item in seen:
                    duplicates.add(item)
                seen.add(item)
            self.assertFalse(duplicates, f"Trùng ID trong {name}: {duplicates}")


if __name__ == "__main__":
    unittest.main()
