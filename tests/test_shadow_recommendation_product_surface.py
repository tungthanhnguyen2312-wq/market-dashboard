import importlib.util
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SPEC = importlib.util.spec_from_file_location("shadow_product", ROOT / "tools" / "build_shadow_recommendation_product_surface.py")
product = importlib.util.module_from_spec(SPEC); SPEC.loader.exec_module(product)


def test_projection_reconciles_against_retained_producer_artifact():
    producer_path = ROOT.parent / "stock-core-private" / "operations-review" / "shadow-security-recommendation-v1-20260829" / "artifact.json"
    producer = json.loads(producer_path.read_text(encoding="utf-8"))
    surface, validation = product.build(producer, producer_head="f4f95c6dcc757e41136ef08f9badba39fb00aad2", consumer_head="605fc9b84fd211ee92ae97fa71a82bf481223679", dashboard_start_head="691b63dedec8625bfab7f6b126d8928a2184abf4")
    assert surface["denominator"] == 523
    assert surface["validation"]["recommendation_counts"] == producer["validation"]["recommendation_counts"]
    assert surface["validation"]["readiness_counts"] == producer["validation"]["readiness_counts"]
    assert validation["label_drift_count"] == validation["readiness_drift_count"] == 0
    assert validation["semantic_drift_audit"]["order_control_count"] == 0


def test_projection_rejects_unsupported_contract():
    try:
        product.build({"contract_version": "shadow_security_recommendation/v2", "records": {}}, producer_head="p", consumer_head="c", dashboard_start_head="d")
    except ValueError as exc:
        assert str(exc) == "UNSUPPORTED_SHADOW_RECOMMENDATION_CONTRACT"
    else:
        raise AssertionError("unsupported contract must fail closed")
