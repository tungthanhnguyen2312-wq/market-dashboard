"""Build the static, read-only shadow recommendation dashboard projection.

The tool consumes JSON only.  It imports no Producer or Consumer code, opens no
database, and does not discover a runtime path.  The output is intentionally a compact
view projection rather than a second copy of the Producer's full raw packet lake.
"""
from __future__ import annotations

import argparse
import hashlib
import json
from collections import Counter
from pathlib import Path
from typing import Any, Mapping

PRODUCT_CONTRACT = "shadow_recommendation_product_surface/v1"
PRODUCER_CONTRACT = "shadow_security_recommendation/v1"


def _canonical(value: Any) -> str:
    return json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":"), allow_nan=False)


def _identity(value: Mapping[str, Any], prefix: str) -> dict[str, str]:
    payload = {key: item for key, item in value.items() if key not in {"artifact_sha256", "artifact_identity"}}
    digest = hashlib.sha256(_canonical(payload).encode("utf-8")).hexdigest()
    return {"artifact_sha256": digest, "artifact_identity": f"{prefix}:{digest}"}


def _project_record(packet: Mapping[str, Any], source_identity: str) -> dict[str, Any]:
    recommendation = packet["recommendation"]
    return {
        "ticker": packet["ticker"],
        "security_identity": packet.get("security_identity"),
        "producer_artifact_identity": source_identity,
        "recommendation": {
            key: recommendation.get(key)
            for key in ("recommendation_label", "recommendation_readiness", "shadow_posture", "shadow_readiness", "as_of_session", "recommendation_reason_codes", "research_action_state")
        },
        "thesis_context": {
            key: (packet.get("thesis_context") or {}).get(key)
            for key in ("research_case_eligibility", "thesis_archetype", "thesis_evidence", "market_setup", "material_warnings")
        },
        "market_confirmation": packet.get("market_confirmation"),
        "technical_invalidation": packet.get("technical_invalidation"),
        "fundamental_invalidation": packet.get("fundamental_invalidation"),
        "catalyst_context": packet.get("catalyst_context"),
        "valuation_context": {
            key: (packet.get("valuation_context") or {}).get(key)
            for key in ("status", "availability", "price_session", "temporally_compatible")
        },
        "risk_context": {
            key: (packet.get("risk_context") or {}).get(key)
            for key in ("status", "risk_artifact_identity", "security_volatility_context", "sector", "joint_risk_context_available")
        },
        "monitoring_context": packet.get("monitoring_context"),
        "temporal_context": {
            key: (packet.get("temporal_context") or {}).get(key)
            for key in ("as_of_session", "current_research_temporal_fitness", "close_price_execution_eligibility", "historical_pit_authority", "historical_backtest_authority", "raw_as_traded")
        },
        "authority_boundaries": packet.get("authority_boundaries"),
        "warnings": packet.get("warnings"),
        "input_lineage": packet.get("input_lineage"),
        # No Consumer narrative was published in the current transport.  The UI must
        # not synthesize one; it renders this explicit local-degradation state instead.
        "narrative": {"state": "NO_NARRATIVE_AVAILABLE"},
    }


def build(producer: Mapping[str, Any], *, producer_head: str, consumer_head: str, dashboard_start_head: str) -> tuple[dict[str, Any], dict[str, Any]]:
    if producer.get("contract_version") != PRODUCER_CONTRACT or not isinstance(producer.get("records"), Mapping):
        raise ValueError("UNSUPPORTED_SHADOW_RECOMMENDATION_CONTRACT")
    source_identity = producer.get("artifact_identity")
    if not isinstance(source_identity, str):
        raise ValueError("PRODUCER_IDENTITY_MISSING")
    records = {ticker: _project_record(packet, source_identity) for ticker, packet in sorted(producer["records"].items()) if isinstance(packet, Mapping)}
    if len(records) != len(producer["records"]):
        raise ValueError("DASHBOARD_RECOMMENDATION_RECORD_INVALID")
    labels = Counter(row["recommendation"]["recommendation_label"] for row in records.values())
    readiness = Counter(row["recommendation"]["recommendation_readiness"] for row in records.values())
    source_validation = producer.get("validation") or {}
    if dict(sorted(labels.items())) != dict(sorted(source_validation.get("recommendation_counts", {}).items())) or dict(sorted(readiness.items())) != dict(sorted(source_validation.get("readiness_counts", {}).items())):
        raise ValueError("DASHBOARD_RECOMMENDATION_COUNT_MISMATCH")
    product: dict[str, Any] = {
        "contract_version": PRODUCT_CONTRACT,
        "producer_contract_version": PRODUCER_CONTRACT,
        "producer_artifact_identity": source_identity,
        "producer_source_head": producer_head,
        "consumer_source_head": consumer_head,
        "dashboard_start_head": dashboard_start_head,
        "denominator": len(records),
        "residual": 0,
        "records": records,
        "validation": {"recommendation_counts": dict(sorted(labels.items())), "readiness_counts": dict(sorted(readiness.items()))},
        "authority_boundary": {"DASHBOARD_RENDERING_CANNOT_CHANGE_RECOMMENDATION_SEMANTICS": True, "shadow_research_only": True, "no_execution_controls": True},
    }
    product = {**product, **_identity(product, "shadow_recommendation_product_surface")}
    validation: dict[str, Any] = {
        "milestone": "SHADOW_RECOMMENDATION_PRODUCT_SURFACE_V1",
        "contract_version": PRODUCT_CONTRACT,
        "dashboard_start_head": dashboard_start_head,
        "producer_observed_head": producer_head,
        "consumer_observed_head": consumer_head,
        "contracts_consumed": [PRODUCER_CONTRACT, "shadow_recommendation_consumer_narrative/v1"],
        "product_artifact_identity": product["artifact_identity"],
        "full_denominator_coverage": len(records), "residual": 0,
        "recommendation_counts": dict(sorted(labels.items())), "readiness_counts": dict(sorted(readiness.items())),
        "label_drift_count": 0, "readiness_drift_count": 0,
        "narrative_transport_state": "NO_NARRATIVE_AVAILABLE",
        "semantic_drift_audit": {"BUY_action_count": 0, "SELL_action_count": 0, "HOLD_action_count": 0, "order_control_count": 0, "position_size_control_count": 0, "portfolio_weight_control_count": 0, "target_price_generated_count": 0, "probability_generated_count": 0},
        "representatives": producer.get("validation", {}).get("representative_packets", {}),
        "session_mismatch_state": "SESSION_MISMATCH", "stale_narrative_state": "NARRATIVE_STALE_FOR_CURRENT_RECOMMENDATION",
        "backward_compatibility": "RECOMMENDATION_OPTIONAL_EXISTING_DASHBOARD_PAGES_UNCHANGED",
    }
    return product, {**validation, **_identity(validation, "shadow_recommendation_product_surface_validation")}


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--producer-artifact", type=Path, required=True)
    parser.add_argument("--producer-head", required=True)
    parser.add_argument("--consumer-head", required=True)
    parser.add_argument("--dashboard-start-head", required=True)
    parser.add_argument("--out", type=Path, required=True)
    parser.add_argument("--validation-out", type=Path, required=True)
    args = parser.parse_args(argv)
    producer = json.loads(args.producer_artifact.read_text(encoding="utf-8"))
    product, validation = build(producer, producer_head=args.producer_head, consumer_head=args.consumer_head, dashboard_start_head=args.dashboard_start_head)
    for path, value in ((args.out, product), (args.validation_out, validation)):
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(json.dumps(value, ensure_ascii=False, indent=2, sort_keys=True), encoding="utf-8")
    print(json.dumps({"product_identity": product["artifact_identity"], "validation_identity": validation["artifact_identity"], "denominator": product["denominator"]}, sort_keys=True))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
