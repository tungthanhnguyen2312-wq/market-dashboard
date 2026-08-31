import hashlib
import importlib.util
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SPEC = importlib.util.spec_from_file_location("workspace_builder", ROOT / "tools" / "build_investment_decision_workspace.py")
workspace_builder = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(workspace_builder)


def _canonical(value):
    return json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":"), allow_nan=False)


def _identity(payload):
    body = {k: v for k, v in payload.items() if k not in {"artifact_sha256", "artifact_identity", "requested_at"}}
    digest = hashlib.sha256(_canonical(body).encode("utf-8")).hexdigest()
    return {"artifact_sha256": digest, "artifact_identity": f"investment_decision_workspace_projection/v1:{digest}"}


def _write_source(tmp_path, *, contract_version="investment_decision_workspace_projection/v1", corrupt_identity=False):
    payload = {
        "schema_version": "1.0.0", "contract_version": contract_version, "milestone": "INVESTMENT_DECISION_WORKSPACE_V1",
        "requested_at": "2026-08-31T00:00:00+07:00", "as_of_session": "2026-08-28",
        "source_artifacts": {"opportunity_context": "opportunity_context/v1:abc"},
        "coverage": {"ticker_denominator": 1, "research_stance_distribution": {"INITIATE_RESEARCH_CANDIDATE": 1}},
        "blocked_outputs": {"universal_score": "SCORING_PROHIBITED"},
        "cards": {"AAA": {"ticker": "AAA", "research_stance": "INITIATE_RESEARCH_CANDIDATE"}},
        "authority_effect": "NONE / PRODUCT_WORKSPACE_ONLY",
    }
    payload.update(_identity(payload))
    if corrupt_identity:
        payload["artifact_sha256"] = "0" * 64
    path = tmp_path / "investment_decision_workspace_artifact.json"
    path.write_text(json.dumps(payload), encoding="utf-8")
    return path


def test_projection_is_deterministic_and_preserves_cards(tmp_path):
    source = _write_source(tmp_path)
    one = workspace_builder.build_projection(source)
    two = workspace_builder.build_projection(source)
    assert one == two
    assert one["cards"]["AAA"]["research_stance"] == "INITIATE_RESEARCH_CANDIDATE"
    assert one["schema_version"] == "investment_decision_workspace_dashboard_projection/v1"
    assert one["authority_boundary"]["is_actionable"] is False


def test_projection_rejects_unsupported_contract_version(tmp_path):
    source = _write_source(tmp_path, contract_version="investment_decision_workspace_projection/v2")
    try:
        workspace_builder.build_projection(source)
    except ValueError as exc:
        assert str(exc) == "WORKSPACE_CONTRACT_UNSUPPORTED"
    else:
        raise AssertionError("unsupported contract version must fail closed")


def test_projection_rejects_tampered_content_identity(tmp_path):
    source = _write_source(tmp_path, corrupt_identity=True)
    try:
        workspace_builder.build_projection(source)
    except ValueError as exc:
        assert str(exc) == "WORKSPACE_ARTIFACT_CONTENT_IDENTITY_MISMATCH"
    else:
        raise AssertionError("tampered artifact must fail closed")


def test_workspace_page_and_script_reference_the_built_data_file():
    text = (ROOT / "investment-workspace.html").read_text(encoding="utf-8") + (ROOT / "assets" / "js" / "investment-workspace.js").read_text(encoding="utf-8")
    assert "data/investment_decision_workspace.json" in text
