"""Build one local, read-only Decision Cockpit V2 projection.

The input is deliberately an explicit Daily Research Session Operation directory,
not a "latest" artifact search.  This is a presentation projection: it neither
calculates investment analytics nor changes any upstream artifact.
"""
from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path
from typing import Any


SCHEMA_VERSION = "current_decision_cockpit_projection/v2"
OPERATION_CONTRACT = "daily_research_session_operation/v1"
PRODUCT_CONTRACT = "current_daily_decision_research_product/v2"


def _read(path: Path) -> dict[str, Any]:
    try:
        value = json.loads(path.read_text(encoding="utf-8"))
    except FileNotFoundError as exc:
        raise ValueError(f"COCKPIT_REQUIRED_ARTIFACT_MISSING:{path.name}") from exc
    if not isinstance(value, dict):
        raise ValueError(f"COCKPIT_ARTIFACT_NOT_OBJECT:{path.name}")
    return value


def _sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def _required_string(value: Any, code: str) -> str:
    if not isinstance(value, str) or not value:
        raise ValueError(code)
    return value


def build_projection(operation_dir: Path) -> dict[str, Any]:
    """Validate and reshape a single operation directory deterministically."""
    operation_dir = operation_dir.resolve()
    manifest_path = operation_dir / "run_manifest.json"
    product_path = operation_dir / "current_daily_decision_research_product_artifact.json"
    manifest, product = _read(manifest_path), _read(product_path)

    if manifest.get("contract_version") != OPERATION_CONTRACT:
        raise ValueError("COCKPIT_OPERATION_CONTRACT_UNSUPPORTED")
    if product.get("contract_version") != PRODUCT_CONTRACT:
        raise ValueError("COCKPIT_PRODUCT_CONTRACT_UNSUPPORTED")
    session = _required_string(manifest.get("market_session"), "COCKPIT_SESSION_MISSING")
    if product.get("session") != session:
        raise ValueError("COCKPIT_PRODUCT_SESSION_MISMATCH")
    operation_identity = _required_string(manifest.get("operation_identity"), "COCKPIT_OPERATION_IDENTITY_MISSING")
    product_identity = _required_string(product.get("artifact_identity"), "COCKPIT_PRODUCT_IDENTITY_MISSING")
    if manifest.get("outputs", {}).get("daily_product") != product_identity:
        raise ValueError("COCKPIT_PRODUCT_IDENTITY_MISMATCH")

    source_ids = product.get("source_artifact_identities")
    input_artifacts = manifest.get("input_artifacts")
    if not isinstance(source_ids, dict) or not isinstance(input_artifacts, dict):
        raise ValueError("COCKPIT_LINEAGE_MISSING")
    for name, source_id in source_ids.items():
        if source_id is None:
            continue
        manifest_id = (input_artifacts.get(name) or {}).get("artifact_identity")
        if manifest_id != source_id and name not in {"peer_relative", "scenario", "strategy_classification"}:
            raise ValueError(f"COCKPIT_INPUT_LINEAGE_MISMATCH:{name}")
    outputs = manifest.get("outputs", {})
    for name in ("peer_relative", "scenario", "strategy_classification"):
        source_id = source_ids.get(name)
        if source_id and outputs.get(name) != source_id:
            raise ValueError(f"COCKPIT_OUTPUT_LINEAGE_MISMATCH:{name}")

    cards = product.get("detailed_research_cards")
    watchlist = product.get("watchlist")
    if not isinstance(cards, dict) or not isinstance(watchlist, dict):
        raise ValueError("COCKPIT_TICKER_CARDS_MISSING")
    watchlist_tickers = watchlist.get("tickers", [])
    if any(ticker not in cards for ticker in watchlist_tickers):
        raise ValueError("COCKPIT_WATCHLIST_CARD_MISSING")

    # Keep zero/false/null values verbatim.  The frontend maps null to an explicit
    # unavailable badge and must never coerce it to a numeric zero.
    return {
        "schema_version": SCHEMA_VERSION,
        "projection_kind": "LOCAL_HUMAN_DECISION_COCKPIT",
        "session": session,
        "authority_boundary": product.get("authority_boundary", manifest.get("authority_boundary", {})),
        "source": {
            "operation_identity": operation_identity,
            "operation_manifest_sha256": _sha256(manifest_path),
            "product_identity": product_identity,
            "product_artifact_sha256": _sha256(product_path),
            "producer_head": manifest.get("producer_head"),
            "consumer_head": manifest.get("consumer_head"),
            "input_artifacts": input_artifacts,
            "output_artifacts": outputs,
            "warnings": manifest.get("warnings", []),
            "session_coherence": manifest.get("session_coherence", {}),
        },
        "market_overview": product.get("market_brief", {}),
        "research_discovery": {
            "cohorts": product.get("research_cohorts", {}),
            "high_priority_review": product.get("high_priority_full_universe_review_set", {}),
        },
        "watchlist": watchlist,
        "ticker_cards": cards,
        "risk_data_gaps": product.get("risk_data_gap_panel", {}),
        "macro_context": product.get("macro_context", {"status": "UNAVAILABLE"}),
        "portfolio_risk": {
            "status": "NO_EXPLICIT_PORTFOLIO_SUPPLIED",
            "is_actionable": False,
            "message": "No explicit portfolio-risk envelope was supplied for this operation.",
        },
        "what_to_verify_next": product.get("what_to_verify_next", []),
    }


def main() -> None:
    parser = argparse.ArgumentParser(description="Build an explicit-operation local Decision Cockpit projection.")
    parser.add_argument("--operation-dir", required=True, type=Path)
    parser.add_argument("--output", required=True, type=Path)
    args = parser.parse_args()
    projection = build_projection(args.operation_dir)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(projection, ensure_ascii=False, sort_keys=True, separators=(",", ":")), encoding="utf-8")
    print(f"{projection['source']['operation_identity']} -> {args.output}")


if __name__ == "__main__":
    main()
