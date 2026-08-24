import importlib.util
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SPEC = importlib.util.spec_from_file_location("cockpit", ROOT / "tools" / "build_current_decision_cockpit.py")
cockpit = importlib.util.module_from_spec(SPEC); SPEC.loader.exec_module(cockpit)

def _write_operation(tmp_path, *, session="2026-08-21", product_session=None, output_identity="product:abc"):
    product_session = product_session or session
    manifest={"contract_version":"daily_research_session_operation/v1","market_session":session,"operation_identity":"operation:abc","outputs":{"daily_product":output_identity,"peer_relative":"peer:1","scenario":"scenario:1","strategy_classification":"strategy:1"},"input_artifacts":{"descriptive":{"artifact_identity":"descriptive:1","freshness_state":"CURRENT","session":session}},"warnings":[],"session_coherence":{}}
    product={"contract_version":"current_daily_decision_research_product/v2","session":product_session,"artifact_identity":output_identity,"authority_boundary":{"is_actionable":False},"source_artifact_identities":{"descriptive":"descriptive:1","peer_relative":"peer:1","scenario":"scenario:1","strategy_classification":"strategy:1"},"detailed_research_cards":{"AAA":{"current_decision_state":{"entry_state":"WAIT","entry_action":"WAIT"},"data_quality":{"technical_eligible":False},"market_flow_positioning":{"status":"UNAVAILABLE","traded_value_composition":{"put_through_share_of_total":0.0}},"strategy_fit":{},"scenario":{},"peer_context":{},"fundamental_context":{},"valuation_context":{},"corporate_intelligence_context":{},"thesis_counter_thesis":{} }},"watchlist":{"tickers":["AAA"]},"market_brief":{"coverage":{"same_session_technical_feature_available_count":0}},"research_cohorts":{},"high_priority_full_universe_review_set":{},"risk_data_gap_panel":{},"macro_context":{"status":"UNAVAILABLE"},"what_to_verify_next":[]}
    (tmp_path/'run_manifest.json').write_text(json.dumps(manifest),encoding='utf-8'); (tmp_path/'current_daily_decision_research_product_artifact.json').write_text(json.dumps(product),encoding='utf-8')

def test_projection_is_deterministic_and_preserves_zero_and_missing(tmp_path):
    _write_operation(tmp_path)
    one=cockpit.build_projection(tmp_path); two=cockpit.build_projection(tmp_path)
    assert one == two
    flow=one['ticker_cards']['AAA']['market_flow_positioning']
    assert flow['traded_value_composition']['put_through_share_of_total'] == 0.0
    assert flow['status'] == 'UNAVAILABLE'

def test_projection_rejects_session_mix(tmp_path):
    _write_operation(tmp_path, product_session='2026-08-22')
    try: cockpit.build_projection(tmp_path)
    except ValueError as exc: assert str(exc) == 'COCKPIT_PRODUCT_SESSION_MISMATCH'
    else: raise AssertionError('mixed session must fail closed')

def test_projection_rejects_product_identity_mix(tmp_path):
    _write_operation(tmp_path, output_identity='product:expected')
    product_path=tmp_path/'current_daily_decision_research_product_artifact.json'; product=json.loads(product_path.read_text(encoding='utf-8')); product['artifact_identity']='product:other'; product_path.write_text(json.dumps(product),encoding='utf-8')
    try: cockpit.build_projection(tmp_path)
    except ValueError as exc: assert str(exc) == 'COCKPIT_PRODUCT_IDENTITY_MISMATCH'
    else: raise AssertionError('mixed artifact must fail closed')

def test_local_only_cockpit_is_not_in_release_whitelist():
    publisher_spec = importlib.util.spec_from_file_location("publisher", ROOT / "publish_dashboard.py")
    publisher = importlib.util.module_from_spec(publisher_spec); publisher_spec.loader.exec_module(publisher)
    old_web = publisher.WEB_ROOT
    try:
        publisher.WEB_ROOT = ROOT
        whitelist = publisher.build_whitelist()
    finally:
        publisher.WEB_ROOT = old_web
    assert "decision-cockpit.html" not in whitelist
    assert all(not item.startswith("local-data/") for item in whitelist)
