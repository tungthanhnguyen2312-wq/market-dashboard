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
    "kpi-session-up", "kpi-session-up-sub",
    "kpi-session-flat", "kpi-session-flat-sub",
    "kpi-session-down", "kpi-session-down-sub",
    "kpi-liquidity-proxy", "kpi-execution-capacity",
    "chart-sector", "chart-tactical",
    "watchlist", "watchlist-filters", "action-plan",
    "action-plan-historical-card", "action-plan-historical", "action-plan-historical-date",
    "market-table", "screener-cards",
    "filter-exchange", "filter-industry", "sort-screener", "quick-filters",
    "build-status", "table-status",
    "ai-report", "report-toggle", "report-date",
    "sidebar", "sidebar-toggle", "sidebar-overlay", "sidebar-close",
    "current-product-summary",
]

KPI_ORDER = [
    "kpi-session-up",
    "kpi-session-flat",
    "kpi-session-down",
    "kpi-liquidity-proxy",
    "kpi-execution-capacity",
]


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
    return _parse_string(html_text), html_text


def _parse_string(html_text):
    builder = _TreeBuilder()
    builder.feed(html_text)
    return builder.root


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
    def setUp(self):
        self.root, self.html = _parse(DASHBOARD_PATH)

    def test_four_question_hierarchy_and_methods(self):
        for node_id in ["dashboard-hero-banner", "home-sectors", "home-opportunities", "home-risks", "home-methods"]:
            self.assertEqual(len(_find_by_id(self.root, node_id)), 1)
        positions = [self.html.index('id="'+key+'"') for key in ["dashboard-hero-banner", "home-sectors", "home-opportunities", "home-risks", "home-methods"]]
        self.assertEqual(positions, sorted(positions))

    def test_no_legacy_clutter(self):
        for key in ["market-table", "ai-report", "action-plan", "build-status", "chart-tactical", "chart-sector"]:
            self.assertFalse(_find_by_id(self.root, key))
        self.assertNotIn("Bộ lọc tương thích", self.html)

    def test_one_heading_and_unique_ids(self):
        headings = _find_all(self.root, lambda n: n.tag == "h1")
        self.assertEqual(len(headings), 1)
        ids = [n.attrs["id"] for n in self.root.iter_all() if "id" in n.attrs]
        self.assertEqual(len(ids), len(set(ids)))

    def test_diagnostics_are_collapsed(self):
        methods = _find_by_id(self.root, "home-methods")[0]
        self.assertEqual(methods.tag, "details")
        self.assertNotIn("open", methods.attrs)
        self.assertIs(_nearest_ancestor(_find_by_id(self.root, "current-product-summary")[0], lambda n: n.tag == "details"), methods)

    def test_three_breadth_values(self):
        for key in ["kpi-session-up", "kpi-session-flat", "kpi-session-down"]:
            self.assertEqual(len(_find_by_id(self.root, key)), 1)


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


class ActionPlanFreshnessContractTests(unittest.TestCase):
    """Phase 3C — freshness-aware Action Plan placement (upper panel vs historical)."""

    @classmethod
    def setUpClass(cls):
        cls.root, cls.html_text = _parse(DASHBOARD_PATH)
        cls.order_list = list(cls.root.iter_all())
        cls.app_js = APP_JS_PATH.read_text(encoding="utf-8")

    def test_history_is_accessible_without_home_action_plan_clutter(self):
        self.assertFalse(_find_by_id(self.root, "action-plan-historical-card"))
        self.assertFalse(_find_by_id(self.root, "action-plan"))
        self.assertIn('href="archive.html"', self.html_text)

    def test_4_freshness_rule_compares_against_market_session_not_naive_date(self):
        match = re.search(r"function isActionPlanCurrent\([^)]*\)\s*\{.*?\n\}\n", self.app_js, re.S)
        self.assertIsNotNone(match, "isActionPlanCurrent() not found in app.js")
        body = match.group(0)
        self.assertIn("market_session", body)
        self.assertIn("reportDate === session", body)
        self.assertNotIn("new Date(", body, "must not use a naive calendar-date comparison")
        self.assertNotRegex(body, r"reportDate\s*<", "must not use a naive reportDate < today comparison")

    def test_5_freshness_rule_fails_safe_when_metadata_unavailable(self):
        match = re.search(r"function isActionPlanCurrent\([^)]*\)\s*\{.*?\n\}\n", self.app_js, re.S)
        body = match.group(0)
        self.assertRegex(body, r"if\s*\(\s*!session\s*\|\|\s*!reportDate\s*\)\s*return false")

    def test_6_report_date_shared_via_single_md_fetch_not_duplicated(self):
        self.assertEqual(
            self.app_js.count("fetch(REPORT_URL"), 1,
            "ai_report_latest.md must be fetched exactly once (shared via reportDateReady), not re-fetched for freshness",
        )
        self.assertIn("reportDateReady", self.app_js)
        self.assertIn("resolveReportDate(", self.app_js)

    def test_7_upper_and_historical_placement_are_mutually_exclusive(self):
        match = re.search(r"async function loadJsonReport\(\)\s*\{.*?\n\}\n", self.app_js, re.S)
        self.assertIsNotNone(match, "loadJsonReport() not found in app.js")
        body = match.group(0)
        # Hidden in every path except the one stale/unknown branch that shows it.
        self.assertGreaterEqual(body.count("historicalCard.hidden = true"), 2)
        self.assertEqual(body.count("historicalCard.hidden = false"), 1)


class ScreenerDisclosureContractTests(unittest.TestCase):
    """Phase 3C — progressive-disclosure Screener cards (compact summary + detail)."""

    SECONDARY_FIELDS = [
        "rs_rating", "rsi14", "rel_vol", "macd_hist", "bb_pctb", "atr_pct",
        "pct_from_52w_high", "near_52w_high", "pct_above_52w_low", "dist_swing_low_pct",
        "ret_1m", "ret_3m", "ret_6m", "ret_12m",
        "pe", "pb", "roe", "foreign_room_pct", "free_float_est",
        "above_sma50", "above_sma200", "golden_cross",
    ]
    COMPACT_FIELDS = ["structure", "gtgd20_ty"]

    @classmethod
    def setUpClass(cls):
        cls.app_js = APP_JS_PATH.read_text(encoding="utf-8")
        match = re.search(r'currentCardRows\.map\(\(row, index\) => `([\s\S]*?)`\)\.join\(""\)', cls.app_js)
        assert match, "screener card template literal not found in app.js"
        cls.template = match.group(1)
        summary_match = re.search(r"<summary[^>]*>[\s\S]*?</summary>", cls.template)
        assert summary_match, "<summary> not found in screener card template"
        cls.summary_html = summary_match.group(0)
        cls.after_summary_html = cls.template[summary_match.end():]
        cls.summary_tree = _parse_string(cls.summary_html)
        cls.after_summary_tree = _parse_string(cls.after_summary_html)

    def test_1_card_root_is_details_with_summary_head(self):
        card_root_match = re.match(r"\s*<details\s+class=\"screener-record\"", self.template)
        self.assertIsNotNone(card_root_match, "Screener card must be a <details class=\"screener-record\">")
        self.assertTrue(self.summary_html.startswith('<summary class="screener-record-head"'))

    def test_2_compact_summary_excludes_secondary_fields(self):
        for field in self.SECONDARY_FIELDS:
            self.assertNotIn(
                f'"{field}"', self.summary_html,
                f"Secondary field '{field}' must not be referenced in the collapsed summary",
            )

    def test_3_compact_summary_includes_required_fields(self):
        for field in self.COMPACT_FIELDS:
            self.assertIn(f'"{field}"', self.summary_html, f"Compact summary must show '{field}'")
        for marker in ("screener-ticker", "screener-price", "screener-company-meta"):
            self.assertIn(marker, self.summary_html)

    def test_4_secondary_fields_present_in_expandable_body(self):
        for field in self.SECONDARY_FIELDS:
            self.assertIn(f'"{field}"', self.after_summary_html, f"'{field}' must still be shown in the expandable body")

    def test_5_no_nested_interactive_elements_in_summary(self):
        interactive_tags = {"button", "a", "input", "select", "textarea", "summary", "details"}
        # summary_tree's root is a synthetic #root wrapping the real <summary> element
        # itself; skip both so only genuine DESCENDANTS of <summary> are checked.
        real_summary = self.summary_tree.children[0]
        descendants = list(real_summary.iter_all())[1:]
        offenders = [
            n for n in descendants
            if n.tag in interactive_tags or "tabindex" in n.attrs or n.attrs.get("role") == "button"
        ]
        self.assertFalse(offenders, f"Nested interactive elements found inside <summary>: {[o.tag for o in offenders]}")

    def test_6_explicit_open_profile_button_exists_outside_summary(self):
        buttons = _find_all(self.after_summary_tree, lambda n: n.tag == "button" and n.has_class("screener-open-profile"))
        self.assertEqual(len(buttons), 1, "Exactly one explicit 'Mo ho so' button expected in the expandable body")

    def test_7_click_handler_scoped_only_to_open_profile_button(self):
        match = re.search(r'cardHost\.addEventListener\("click".*?\}\);', self.app_js, re.S)
        self.assertIsNotNone(match, "cardHost click listener not found")
        body = match.group(0)
        self.assertIn('closest(".screener-open-profile")', body)
        self.assertIn("VSCompanyPanel.open", body)

    def test_8_no_separate_keydown_reimplementation_for_cards(self):
        # Native <details>/<summary> and <button> already handle Enter/Space; a
        # leftover manual keydown handler here would double-fire VSCompanyPanel.open.
        self.assertNotIn('cardHost.addEventListener("keydown"', self.app_js)

    def test_9_primary_grid_fully_retired(self):
        style_css = STYLE_PATH.read_text(encoding="utf-8")
        self.assertNotIn("screener-primary-grid", self.app_js)
        self.assertNotIn("screener-primary-grid", style_css)

    def test_10_existing_filter_sort_and_error_contracts_untouched(self):
        for marker in (
            "initQuickFilters", "showTableError",
            'getElementById("filter-exchange")', 'getElementById("filter-industry")',
            'getElementById("sort-screener")',
        ):
            self.assertIn(marker, self.app_js)
        self.assertNotIn("scrollX:", self.app_js)
        self.assertNotIn("scrollY:", self.app_js)


if __name__ == "__main__":
    unittest.main()
