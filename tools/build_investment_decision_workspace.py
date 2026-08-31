"""Build the local Investment Decision Workspace projection for the Dashboard.

Reads the Producer's investment_decision_workspace_projection/v1 artifact directly and
verifies its own recorded content identity before serving it. This is a presentation
projection only: no recomputation, no requalification of any upstream artifact.
"""
from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path
from typing import Any

CONTRACT_VERSION = "investment_decision_workspace_projection/v1"
SCHEMA_VERSION = "investment_decision_workspace_dashboard_projection/v1"
_IDENTITY_EXCLUDED = {"artifact_sha256", "artifact_identity", "requested_at"}


def _canonical(value: Any) -> str:
    return json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":"), allow_nan=False)


def _verify_identity(artifact: dict) -> None:
    payload = {key: item for key, item in artifact.items() if key not in _IDENTITY_EXCLUDED}
    digest = hashlib.sha256(_canonical(payload).encode("utf-8")).hexdigest()
    if artifact.get("artifact_sha256") != digest:
        raise ValueError("WORKSPACE_ARTIFACT_CONTENT_IDENTITY_MISMATCH")


def build_projection(source_path: Path) -> dict[str, Any]:
    """Validate and reshape one Producer workspace artifact deterministically."""
    try:
        artifact = json.loads(source_path.read_text(encoding="utf-8"))
    except FileNotFoundError as exc:
        raise ValueError("WORKSPACE_SOURCE_ARTIFACT_MISSING") from exc
    if not isinstance(artifact, dict):
        raise ValueError("WORKSPACE_SOURCE_ARTIFACT_NOT_OBJECT")
    if artifact.get("contract_version") != CONTRACT_VERSION:
        raise ValueError("WORKSPACE_CONTRACT_UNSUPPORTED")
    _verify_identity(artifact)
    cards = artifact.get("cards")
    if not isinstance(cards, dict) or not cards:
        raise ValueError("WORKSPACE_CARDS_MISSING")

    return {
        "schema_version": SCHEMA_VERSION,
        "as_of_session": artifact.get("as_of_session"),
        "producer_artifact_identity": artifact.get("artifact_identity"),
        "producer_requested_at": artifact.get("requested_at"),
        "source_artifacts": artifact.get("source_artifacts", {}),
        "coverage": artifact.get("coverage", {}),
        "blocked_outputs": artifact.get("blocked_outputs", {}),
        "cards": cards,
        "authority_boundary": {
            "is_actionable": False,
            "research_stance_is_not_execution_order": True,
            "priority_now_is_not_buy_now": True,
            "security_attractiveness_separate_from_portfolio_fit": True,
        },
    }


def main() -> None:
    parser = argparse.ArgumentParser(description="Build the local Investment Decision Workspace projection.")
    parser.add_argument("--source", required=True, type=Path, help="Producer investment_decision_workspace_artifact.json")
    parser.add_argument("--output", required=True, type=Path)
    args = parser.parse_args()
    projection = build_projection(args.source)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(projection, ensure_ascii=False, sort_keys=True, separators=(",", ":")), encoding="utf-8")
    print(f"{projection['producer_artifact_identity']} -> {args.output} ({len(projection['cards'])} tickers)")


if __name__ == "__main__":
    main()
