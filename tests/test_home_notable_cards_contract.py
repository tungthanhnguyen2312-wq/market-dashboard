"""Upstream contract for Home's four cards.

Published ``dashboard_home_summary/v1`` has aggregate counts only. Home selects four
cards by scanning ``workspace_index/v1``. That scan is the 4,664,540-byte download.

Producer must add an optional ``notable_cards`` object on the same summary, then
recompute ``artifact_sha256`` / ``artifact_identity`` with the existing
``content_identity`` rules (the nested object is inside the hash; it must not
itself carry the summary hash). Until that object is present, Dashboard keeps the
index fallback. This module does not build or publish the object.
"""

from __future__ import annotations

import json
import subprocess
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SUMMARY_PATH = ROOT / "data" / "dashboard_home_summary.json"
INDEX_PATH = ROOT / "data" / "workspace_index.json"
BUILD_INFO_PATH = ROOT / "data" / "build_info.json"

NOTABLE_CARDS_CONTRACT = "dashboard_home_notable_cards/v1"
NOTABLE_SELECTION = "PUBLISHED_INSERTION_ORDER_NOTABLE_MEMBERSHIP_V1"
NOTABLE_SELECTION_LIMIT = 4
CONSTRUCTIVE_POSTURES = {"INITIATE_ON_BREAKOUT", "ACCUMULATE_ON_RETEST", "EARLY_WATCH"}
ENTRY_STATES = {"BREAKOUT_READY", "EARLY_REVERSAL_CANDIDATE", "BASE_BUILDING"}
PASS_THROUGH_FIELDS = (
    "ticker",
    "as_of_session",
    "research_action_posture",
    "entry_state",
    "evidence_currency",
    "position_context",
    "why",
    "reference_trigger",
    "counter_thesis",
)


def notable_membership(cards: dict) -> list[str]:
    """Same predicate and insertion order as workspace-card-presentation.js."""
    chosen = []
    for ticker, card in cards.items():
        posture = card.get("research_action_posture")
        entry = card.get("entry_state")
        if posture in CONSTRUCTIVE_POSTURES or (
            entry in ENTRY_STATES and posture not in ("AVOID", "REDUCE")
        ):
            chosen.append(ticker)
            if len(chosen) == NOTABLE_SELECTION_LIMIT:
                break
    return chosen


def pass_through_card(ticker: str, card: dict) -> dict:
    projected = {"ticker": ticker}
    for field in PASS_THROUGH_FIELDS[1:]:
        projected[field] = card.get(field)
    return projected


FIXTURE_PATH = ROOT / "tests" / "fixtures" / "home_notable_cards_v1.json"


class HomeNotableCardsContractTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.summary_bytes = SUMMARY_PATH.read_bytes()
        cls.index_bytes = INDEX_PATH.read_bytes()
        cls.summary = json.loads(cls.summary_bytes.decode("utf-8"))
        cls.index = json.loads(cls.index_bytes.decode("utf-8"))
        cls.build_info = json.loads(BUILD_INFO_PATH.read_text(encoding="utf-8"))

    def test_retained_summary_has_no_notable_block_and_index_cost_is_unchanged(self):
        self.assertNotIn("notable_cards", self.summary)
        self.assertEqual(len(self.summary_bytes), 4771)
        self.assertEqual(len(self.index_bytes), 4664540)
        self.assertEqual(self.summary["contract_version"], "dashboard_home_summary/v1")
        self.assertEqual(self.index["contract_version"], "workspace_index/v1")
        self.assertEqual(self.summary["as_of_session"], self.build_info["market_session"])
        self.assertEqual(
            self.index["source_artifact_identity"],
            self.build_info["investment_workspace"]["artifact_identity"],
        )

    def test_required_upstream_block_is_four_verbatim_cards(self):
        tickers = notable_membership(self.index["cards"])
        self.assertEqual(tickers, ["AAS", "ABW", "ACB", "ACG"])
        block = {
            "contract_version": NOTABLE_CARDS_CONTRACT,
            "as_of_session": self.index["as_of_session"],
            "source_contract_version": "workspace_index/v1",
            "source_artifact_identity": self.index["source_artifact_identity"],
            "selection": NOTABLE_SELECTION,
            "selection_limit": NOTABLE_SELECTION_LIMIT,
            "cards": [pass_through_card(ticker, self.index["cards"][ticker]) for ticker in tickers],
        }
        enlarged = dict(self.summary)
        # Producer insertion point: immediately before authority_effect.
        ordered = {}
        for key, value in self.summary.items():
            if key == "authority_effect":
                ordered["notable_cards"] = block
            ordered[key] = value
        body = (json.dumps(ordered, ensure_ascii=False, indent=2) + "\n").encode("utf-8")
        self.assertEqual(len(body), 10066)
        self.assertEqual(len(self.summary_bytes) + len(self.index_bytes), 4669311)
        self.assertLess(len(body), len(self.index_bytes))
        for card in block["cards"]:
            self.assertEqual(tuple(card), PASS_THROUGH_FIELDS)
            self.assertNotIn("valuation", card)
            self.assertIsInstance(card["why"]["deterministic_reasons"], list)
        # Identity fields stay fixed-width, so this size is the post-rehash size.
        self.assertEqual(len(ordered["artifact_sha256"]), 64)
        self.assertTrue(ordered["artifact_identity"].startswith("dashboard_home_summary/v1:"))

    def test_producer_fixture_is_separate_from_published_output(self):
        """The fixture is the Producer compact-summary shape. It is not a claim
        that the retained publication already contains notable_cards."""
        fixture = json.loads(FIXTURE_PATH.read_text(encoding="utf-8"))
        block = fixture["block"]
        self.assertNotIn("notable_cards", self.summary)
        self.assertEqual(block["contract_version"], NOTABLE_CARDS_CONTRACT)
        self.assertEqual(block["selection"], NOTABLE_SELECTION)
        self.assertEqual(block["selection_limit"], NOTABLE_SELECTION_LIMIT)
        self.assertEqual([card["ticker"] for card in block["cards"]], ["AAS", "ABW", "ACB", "ACG"])
        self.assertEqual(tuple(block), (
            "contract_version", "as_of_session", "source_contract_version",
            "source_artifact_identity", "selection", "selection_limit", "cards",
        ))
        for card in block["cards"]:
            self.assertEqual(tuple(card), PASS_THROUGH_FIELDS)
        self.assertEqual(fixture["workspace_artifact_identity"], block["source_artifact_identity"])
        self.assertLess(FIXTURE_PATH.stat().st_size, 20000)
        self.assertGreater(len(self.index_bytes), FIXTURE_PATH.stat().st_size)

    def test_dashboard_consumer_accepts_only_the_qualified_block(self):
        tickers = notable_membership(self.index["cards"])
        block = {
            "contract_version": NOTABLE_CARDS_CONTRACT,
            "as_of_session": self.index["as_of_session"],
            "source_contract_version": "workspace_index/v1",
            "source_artifact_identity": self.index["source_artifact_identity"],
            "selection": NOTABLE_SELECTION,
            "selection_limit": NOTABLE_SELECTION_LIMIT,
            "cards": [pass_through_card(ticker, self.index["cards"][ticker]) for ticker in tickers],
        }
        probe = ROOT / "tests" / "_home_notable_probe.js"
        payload = ROOT / "tests" / "_home_notable_probe.json"
        probe.write_text(
            "const fs=require('node:fs');\n"
            "const home=require('../assets/js/dashboard-product-summary.js');\n"
            "const input=JSON.parse(fs.readFileSync(process.argv[2],'utf8'));\n"
            "const qualified=home.qualifiedNotableCards(input.summary, input.buildInfo.market_session, input.buildInfo);\n"
            "if(!qualified) process.exit(2);\n"
            "if(home.homeOpportunityRequestPlan(input.summary, input.buildInfo).length!==0) process.exit(3);\n"
            "const plain=JSON.parse(fs.readFileSync(input.summaryPath,'utf8'));\n"
            "if(home.homeOpportunityRequestPlan(plain, input.buildInfo).join(',')!==home.WORKSPACE_INDEX_URL) process.exit(4);\n",
            encoding="utf-8",
        )
        ordered = {}
        for key, value in self.summary.items():
            if key == "authority_effect":
                ordered["notable_cards"] = block
            ordered[key] = value
        payload.write_text(
            json.dumps({
                "summary": ordered,
                "buildInfo": self.build_info,
                "summaryPath": str(SUMMARY_PATH),
            }),
            encoding="utf-8",
        )
        try:
            completed = subprocess.run(
                ["node", str(probe), str(payload)],
                cwd=ROOT,
                capture_output=True,
                text=True,
                check=False,
            )
            self.assertEqual(completed.returncode, 0, completed.stderr or completed.stdout)
        finally:
            probe.unlink(missing_ok=True)
            payload.unlink(missing_ok=True)


if __name__ == "__main__":
    unittest.main()
