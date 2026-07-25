"""Phase 3B — Bento overview layout contract for dashboard.html.

Uses a minimal stdlib (html.parser) tree so structural assertions (direct-child
order, ancestor checks) don't rely on fragile full-page string snapshots. No
new third-party dependency is introduced.
"""

import re
import unittest
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DASHBOARD_PATH = ROOT / "dashboard.html"
STYLE_PATH = ROOT / "style.css"
SHELL_CSS_PATH = ROOT / "assets/css/shell.css"
APP_JS_PATH = ROOT / "app.js"

VOID_ELEMENTS = {
    "area", "base", "br", "col", "embed", "hr", "img", "input",
    "link", "meta", "param", "source", "track", "wbr",
}

REQUIRED_UNIQUE_IDS = [
    "kpi-regime", "kpi-risk",
    "kpi-breadth", "kpi-breadth-sub", "kpi-breadth-bar",
    "kpi-structure", "kpi-structure-sub", "kpi-structure-bar",
    "kpi-liquidity",
    "chart-sector", "chart-structure",
    "watchlist", "watchlist-filters", "action-plan",
    "market-table", "screener-cards",
    "filter-exchange", "filter-industry", "sort-screener", "quick-filters",
    "build-status", "table-status",
    "ai-report", "report-toggle", "report-date",
    "sidebar", "sidebar-toggle", "sidebar-overlay", "sidebar-close",
]

KPI_ORDER = ["kpi-regime", "kpi-risk", "kpi-breadth", "kpi-structure", "kpi-liquidity"]


class Node:
    __slots__ = ("tag", "attrs", "children", "parent", "text")

    def __init__(self, tag, attrs, parent=None):
        self.tag = tag
        self.attrs = {k: (v if v is not None else "") for k, v in attrs}
        self.children = []
        self.parent = parent
        self.text = ""

    def has_class(self, name):
        return name in self.attrs.get("class", "").split()

    def iter_all(self):
        yield self
        for child in self.children:
            yield from child.iter_all()


class _TreeBuilder(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.root = Node("#root", [])
        self._stack = [self.root]

    def handle_starttag(self, tag, attrs):
        node = Node(tag, attrs, parent=self._stack[-1])
        self._stack[-1].children.append(node)
        if tag not in VOID_ELEMENTS:
            self._stack.append(node)

    def handle_startendtag(self, tag, attrs):
        node = Node(tag, attrs, parent=self._stack[-1])
        self._stack[-1].children.append(node)

    def handle_endtag(self, tag):
        for i in range(len(self._stack) - 1, 0, -1):
            if self._stack[i].tag == tag:
                del self._stack[i:]
                return

    def handle_data(self, data):
        self._stack[-1].text += data


def _parse(path):
    html_text = path.read_text(encoding="utf-8")
    builder = _TreeBuilder()
    builder.feed(html_text)
    return builder.root, html_text


def _find_by_id(root, node_id):
    return [n for n in root.iter_all() if n.attrs.get("id") == node_id]


def _find_all(root, predicate):
    return [n for n in root.iter_all() if predicate(n)]


def _nearest_ancestor(node, predicate):
    cur = node.parent
    while cur is not None:
        if predicate(cur):
            return cur
        cur = cur.parent
    return None


class DashboardBentoContractTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.root, cls.html_text = _parse(DASHBOARD_PATH)
        cls.order_list = list(cls.root.iter_all())
        cls.all_ids = [n.attrs.get("id") for n in cls.order_list if n.attrs.get("id")]

    def test_1_required_ids_occur_exactly_once(self):
        for node_id in REQUIRED_UNIQUE_IDS:
            self.assertEqual(
                self.all_ids.count(node_id), 1,
                f"id='{node_id}' must occur exactly once in dashboard.html",
            )

    def test_2_no_duplicate_ids_anywhere(self):
        dupes = {i for i in self.all_ids if self.all_ids.count(i) > 1}
        self.assertFalse(dupes, f"Duplicate ids in dashboard.html: {sorted(dupes)}")

    def test_3_exactly_one_page_level_h1_inside_main(self):
        h1_nodes = _find_all(self.root, lambda n: n.tag == "h1")
        self.assertEqual(len(h1_nodes), 1, "dashboard.html must have exactly one <h1>")
        h1 = h1_nodes[0]
        self.assertIsNotNone(_nearest_ancestor(h1, lambda n: n.tag == "main"), "<h1> must be inside <main>")
        self.assertIn("Stock Lookup", h1.text.strip(), "<h1> must describe the Stock Lookup overview page")

    def test_4_five_kpi_contracts_present_and_unified(self):
        kpi_nodes = {kid: _find_by_id(self.root, kid) for kid in KPI_ORDER}
        for kid, nodes in kpi_nodes.items():
            self.assertEqual(len(nodes), 1, f"KPI id='{kid}' missing or duplicated")

        ancestors = {
            _nearest_ancestor(nodes[0], lambda n: n.tag == "section" and n.has_class("kpi-grid"))
            for nodes in kpi_nodes.values()
        }
        self.assertEqual(len(ancestors), 1, "All 5 KPI tiles must live inside one unified section.kpi-grid band")
        self.assertIsNotNone(next(iter(ancestors)))

    def test_5_regime_and_risk_are_visually_emphasized(self):
        def kpi_tile(node_id):
            node = _find_by_id(self.root, node_id)[0]
            return _nearest_ancestor(node, lambda n: n.tag == "div" and n.has_class("kpi"))

        for featured_id in ("kpi-regime", "kpi-risk"):
            tile = kpi_tile(featured_id)
            self.assertIsNotNone(tile)
            self.assertTrue(tile.has_class("kpi-featured"), f"{featured_id} tile should carry .kpi-featured emphasis")

        for plain_id in ("kpi-breadth", "kpi-structure", "kpi-liquidity"):
            tile = kpi_tile(plain_id)
            self.assertIsNotNone(tile)
            self.assertFalse(tile.has_class("kpi-featured"), f"{plain_id} tile must not be artificially featured")

    def test_6_kpi_dom_order_matches_required_mobile_stacking(self):
        indices = [self.order_list.index(_find_by_id(self.root, kid)[0]) for kid in KPI_ORDER]
        self.assertEqual(
            indices, sorted(indices),
            "KPI tiles must appear in Regime -> Risk -> Breadth -> Structure -> Liquidity DOM order",
        )

    def test_7_resizable_container_has_exact_direct_child_structure(self):
        resizable_nodes = _find_all(
            self.root,
            lambda n: "data-resizable" in n.attrs and n.attrs.get("data-resize-key") == "dashboard-main",
        )
        self.assertEqual(len(resizable_nodes), 1, "Exactly one data-resizable[data-resize-key=dashboard-main] container expected")
        resizable = resizable_nodes[0]
        children = resizable.children
        self.assertEqual(len(children), 3, "Resizable container must have exactly 3 direct element children")
        left, handle, right = children
        self.assertTrue(handle.has_class("vs-resize-handle"), "Middle direct child must be the resize handle")
        self.assertFalse(left.has_class("vs-resize-handle"))
        self.assertFalse(right.has_class("vs-resize-handle"))

        def contains_id(container, node_id):
            return any(n.attrs.get("id") == node_id for n in container.iter_all())

        self.assertTrue(contains_id(left, "chart-sector"), "Left panel must contain the sector chart")
        self.assertTrue(contains_id(left, "chart-structure"), "Left panel must contain the structure chart")
        self.assertTrue(contains_id(right, "watchlist"), "Right panel must contain the watchlist")
        self.assertTrue(contains_id(right, "action-plan"), "Right panel must contain the action plan")

        watchlist_idx = self.order_list.index(_find_by_id(self.root, "watchlist")[0])
        action_plan_idx = self.order_list.index(_find_by_id(self.root, "action-plan")[0])
        self.assertLess(watchlist_idx, action_plan_idx, "Watchlist must be stacked above Action Plan")

    def test_8_screener_markup_remains_after_resizable_container(self):
        idx_resize = self.html_text.index('data-resize-key="dashboard-main"')
        idx_screener = self.html_text.index("dashboard-screener-card")
        self.assertLess(idx_resize, idx_screener, "Screener card must remain after the resizable region in raw source")

        resizable = _find_all(
            self.root,
            lambda n: "data-resizable" in n.attrs and n.attrs.get("data-resize-key") == "dashboard-main",
        )[0]
        screener = _find_all(self.root, lambda n: n.has_class("dashboard-screener-card"))
        self.assertEqual(len(screener), 1)
        self.assertLess(
            self.order_list.index(resizable), self.order_list.index(screener[0]),
            "Screener card must come after the resizable container in DOM order",
        )

    def test_9_market_table_stays_hidden_engine(self):
        nodes = _find_by_id(self.root, "market-table")
        self.assertEqual(len(nodes), 1)
        table = nodes[0]
        self.assertEqual(table.tag, "table")
        self.assertEqual(table.attrs.get("aria-hidden"), "true")
        self.assertTrue(table.has_class("dashboard-screener-engine"))

    def test_10_screener_cards_host_present(self):
        nodes = _find_by_id(self.root, "screener-cards")
        self.assertEqual(len(nodes), 1)
        self.assertTrue(nodes[0].has_class("screener-records"))

    def test_11_chart_canvases_present_with_accessible_labels(self):
        for canvas_id in ("chart-sector", "chart-structure"):
            nodes = _find_by_id(self.root, canvas_id)
            self.assertEqual(len(nodes), 1, f"canvas#{canvas_id} must be present exactly once")
            canvas = nodes[0]
            self.assertEqual(canvas.tag, "canvas")
            label = canvas.attrs.get("aria-label", "").strip()
            self.assertTrue(label, f"canvas#{canvas_id} needs a non-empty aria-label")

    def test_12_no_css_order_property_introduces_visual_reorder(self):
        css = STYLE_PATH.read_text(encoding="utf-8")
        self.assertIsNone(
            re.search(r"\border\s*:\s*-?\d", css),
            "style.css must not use the CSS `order` property to reorder Bento content away from DOM order",
        )


class DashboardHardeningContractTests(unittest.TestCase):
    """Phase 3B hardening: topbar overflow fix + runtime duplicate <h1> fix."""

    @classmethod
    def setUpClass(cls):
        cls.app_js = APP_JS_PATH.read_text(encoding="utf-8")
        cls.shell_css = SHELL_CSS_PATH.read_text(encoding="utf-8")

    def test_1_app_js_demotes_report_h1_to_h2(self):
        match = re.search(r"async function loadAiReport\(\)\s*\{.*?\n\}\n", self.app_js, re.S)
        self.assertIsNotNone(match, "loadAiReport() not found in app.js")
        body = match.group(0)
        self.assertRegex(body, r"demoteReportHeadings\(\s*container\s*\)")
        self.assertRegex(self.app_js, r'querySelectorAll\(\s*[\'"]h1[\'"]\s*\)')
        self.assertRegex(self.app_js, r'createElement\(\s*[\'"]h2[\'"]\s*\)')

    def test_2_marked_library_not_globally_reconfigured(self):
        self.assertNotIn("marked.setOptions", self.app_js)
        self.assertNotIn("marked.use(", self.app_js)
        self.assertNotIn("new marked.Renderer", self.app_js)

    def test_3_loadaireport_preserves_date_extraction_and_error_path(self):
        match = re.search(r"async function loadAiReport\(\)\s*\{.*?\n\}\n", self.app_js, re.S)
        body = match.group(0)
        self.assertIn("dateMatch", body)
        self.assertIn('getElementById("report-date")', body)
        self.assertIn("catch (err)", body)
        self.assertIn('classList.remove("collapsed")', body)
        self.assertIn('getElementById("report-toggle")', body)

    def test_4_topbar_meta_has_bounded_overflow_contract(self):
        rule = re.search(r"\.vs-topbar-meta\s*\{([^}]*)\}", self.shell_css, re.S)
        self.assertIsNotNone(rule, ".vs-topbar-meta rule missing in shell.css")
        props = rule.group(1)
        for required_prop in ("overflow", "text-overflow", "min-width"):
            self.assertIn(required_prop, props, f".vs-topbar-meta must declare {required_prop}")

    def test_5_shell_css_still_hides_meta_on_narrow_mobile(self):
        # Pre-existing rule that must survive this hardening pass unmodified in intent.
        idx = self.shell_css.find("@media (max-width: 640px)")
        self.assertGreaterEqual(idx, 0, "640px mobile media query missing from shell.css")
        window = self.shell_css[idx:idx + 300]
        self.assertIn(".vs-topbar-meta", window)
        self.assertIn("display: none", window)


if __name__ == "__main__":
    unittest.main()
