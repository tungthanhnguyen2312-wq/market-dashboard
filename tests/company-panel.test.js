"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { renderCorporateIntelligence } = require("../assets/js/company-panel.js");
const { renderQualifiedResearchBrief } = require("../assets/js/company-panel.js");
const { renderQualifiedResearchDelta } = require("../assets/js/company-panel.js");

test("qualified research delta renders material changes, invalidation and unchanged liquidity safely", () => {
  const html = renderQualifiedResearchDelta({ comparison_status:"comparable", material_change_summary:{material_change_detected:true,highest_priority_changes:[{category:"invalidation",reference:"<condition>"}],unchanged_critical_boundaries:["liquidity"]}, historical_conclusion:{changed:true,previous:{status:"historically_mixed"},current:{status:"insufficient_evidence"}}, quality_changes:[{dimension:"capital_structure",status:"status_changed",direction:"not_applicable"}], risk_changes:[], invalidation_changes:[{condition_id:"<script>",status:"new_condition",trigger_evaluation:"triggered"}] });
  assert.match(html,/material change detected/); assert.match(html,/triggered/); assert.match(html,/liquidity/); assert.match(html,/&lt;condition&gt;|&lt;script&gt;/); assert.doesNotMatch(html,/<script>/);
});

test("qualified research delta has honest no-change and no-snapshot states", () => {
  assert.match(renderQualifiedResearchDelta({comparison_status:"partially_comparable",material_change_summary:{material_change_detected:false,highest_priority_changes:[],unchanged_critical_boundaries:["liquidity"]},historical_conclusion:{changed:false},quality_changes:[],risk_changes:[],invalidation_changes:[]}),/no material qualified change/);
  assert.match(renderQualifiedResearchDelta(null),/No qualified comparison snapshot available/);
  assert.match(renderQualifiedResearchDelta({comparison_status:"incomparable"}),/Comparison unavailable/);
});

test("qualified research delta preserves VCB not-applicable status without deterioration", () => {
  const html = renderQualifiedResearchDelta({comparison_status:"comparable",material_change_summary:{material_change_detected:false,highest_priority_changes:[],unchanged_critical_boundaries:["liquidity"]},historical_conclusion:{changed:false},quality_changes:[{dimension:"corporate_leverage",status:"unchanged",direction:"unchanged",current_status:"not_applicable"}],risk_changes:[],invalidation_changes:[]});
  assert.doesNotMatch(html,/deteriorated/); assert.match(html,/Still blocked/);
});

test("qualified research brief renders safely and keeps blocked liquidity non-directional", () => {
  const html = renderQualifiedResearchBrief({ticker:"VCB",entity_type:"bank",qualified_facts:[{canonical_metric:"net_income",reporting_period:"2024",value:0}],quality:{capital:{dimension:"capital",status:"not_applicable"}},risks:{phase_4b:[{risk_id:"<risk>",inference:"<script>bad</script>"}],phase_4c:{aggregate_posture:"moderate"}},scenarios:{bear:{thesis:"condition"},base:{thesis:"base"},bull:{thesis:"improve"}},invalidation_conditions:["new fact"],portfolio_risk_boundary:{liquidity:{status:"blocked",reason_codes:["VOLUME_BASIS_UNQUALIFIED"]},portfolio_context:{status:"blocked_input"},allocation:{status:"allocation_blocked"}},prohibited_claims:["target_price"]});
  assert.match(html,/not_applicable/); assert.match(html,/blocked due to qualification/); assert.doesNotMatch(html,/<script>|<risk>/); assert.match(html,/&lt;script&gt;bad/);
});

const fullPayload = {
  company_profile: { sources: {
    KBS: { source: "KBS", snapshot_date: "2026-07-17", sector: "Banking", issue_share: 100 },
    VCI: { source: "VCI", provenance_date: "2026-07-16", business_model: "Brokerage", outstanding_shares: 200 },
  } },
  ownership_structure: { sources: { KBS: { owners: [{ owner_type: "Foreign", ownership_percentage: 100.01, shares_owned: null, update_date: "2026-07-17" }] } } },
  major_shareholders: {
    latest_valid_snapshot: { source: "KBS", snapshot_date: "2026-07-17", holders: [{ holder_name: "Alpha", shares_owned: 12, ownership_percentage: 4.5 }] },
    delta: { source: "KBS", reference_scope: "latest comparable", new_holder: "Beta", disappeared_holder: "Gamma", shares_change: 3, ownership_percentage_change: 0.2 },
  },
  company_subsidiaries: { sources: { VCI: { subsidiaries: [{ entity_name: "Sub One", provider_local_identity: "VCI-1", relationship_type: "Subsidiary", ownership_percentage: 51, provenance: "VCI filing" }] } } },
  corporate_events: { status: "partial", coverage_status: "partial_unqualified_50_row_cap", sources: [{ source_name: "VCI", records: [{ provider_event_id: "evt-1", fields: { event_title_vi: "Cash dividend", category: "DIVIDEND", record_date: null, value_per_share: 0 }, provenance: { provider: "VCI", retrieved_at: "2026-07-26" } }] }] },
};

test("renders all Corporate Intelligence subsections and preserves provider semantics", () => {
  const html = renderCorporateIntelligence(fullPayload);
  for (const expected of ["Company profile", "Ownership structure", "Major shareholders", "Company subsidiaries", "Corporate Events", "KBS", "VCI", "sector", "business model", "issue share", "outstanding shares", "Sub One", "VCI-1", "evt-1", "Incomplete forward observations"]) assert.match(html.toLowerCase(), new RegExp(expected.toLowerCase()));
  assert.match(html, /100,01/);
  assert.match(html, /Shares owned[\s\S]*?>-</);
});

test("legacy and explicit missing Corporate Intelligence render a neutral missing state", () => {
  assert.match(renderCorporateIntelligence(null), /not included/i);
  assert.match(renderCorporateIntelligence({ company_profile: { status: "missing" } }), /not included/i);
});

test("partial and malformed subsections do not block valid subsections", () => {
  const html = renderCorporateIntelligence({
    company_profile: { status: "partial", data: { sources: { KBS: { sector: "Banking" } } } },
    ownership_structure: { status: "malformed", data: "not rendered" },
    company_subsidiaries: fullPayload.company_subsidiaries,
  });
  assert.match(html, /incomplete/i);
  assert.match(html, /invalid/i);
  assert.match(html, /Sub One/);
  assert.doesNotMatch(html, /not rendered/);
});

test("incomparable shareholder delta is a warning, not a change", () => {
  const html = renderCorporateIntelligence({ major_shareholders: { sources: [{ source_name: "KBS", records: [], delta: { status: "incomparable_source_scope", changes: [{ change_type: "new_holder", shares_delta: 99 }] } }] } });
  assert.match(html, /not comparable/i);
  assert.doesNotMatch(html, /99/);
});

test("corporate names and holder names are HTML escaped", () => {
  const html = renderCorporateIntelligence({
    company_profile: { sources: { KBS: { sector: "<img src=x>" } } },
    major_shareholders: { latest_snapshot: { holders: [{ holder_name: "<script>alert(1)</script>" }] } },
    company_subsidiaries: { sources: { VCI: { subsidiaries: [{ entity_name: "A & B < C" }] } } },
  });
  assert.doesNotMatch(html, /<script>|<img/);
  assert.match(html, /&lt;script&gt;alert\(1\)&lt;\/script&gt;/);
  assert.match(html, /A &amp; B &lt; C/);
});

test("empty and null source entries do not throw", () => {
  assert.doesNotThrow(() => renderCorporateIntelligence({
    company_profile: { sources: [null] },
    ownership_structure: { sources: [null] },
    company_subsidiaries: { sources: [null] },
  }));
});

test("renders the producer source-envelope contract without merging providers", () => {
  const html = renderCorporateIntelligence({
    status: "available",
    company_profile: { status: "available", sources: [
      { source_name: "KBS", snapshot_date: "2026-07-17", record: { qualified_fields: { sector: "Finance" } } },
      { source_name: "VCI", snapshot_date: "2026-07-16", record: { qualified_fields: { business_model: "Brokerage" } } },
    ] },
    ownership_structure: { status: "available", sources: [{ source_name: "KBS", records: [{ fields: { owner_type: "State", ownership_percentage: 100.01, shares_owned: null } }] }] },
    major_shareholders: { status: "available", sources: [{ source_name: "KBS", snapshot_date: "2026-07-17", records: [{ holder_name: "Holder A", shares: 20, ownership_pct: 1.5 }], delta: { status: "ok", changes: [{ change_type: "new_holder", holder_name_after: "Holder B", shares_delta: null, ownership_pct_delta: null }] } }] },
    company_subsidiaries: { status: "available", sources: [{ source_name: "VCI", records: [{ fields: { organization_name: "Sub A", provider_record_id: "VCI-42", relationship_type: "Subsidiary", ownership_percent: 51 } }] }] },
  });
  for (const expected of ["KBS", "VCI", "Finance", "Brokerage", "Sub A", "VCI-42", "Holder A", "Holder B"]) assert.match(html, new RegExp(expected));
  assert.match(html, /100,01/);
  assert.match(html, /Shares owned[\s\S]*?>-</);
});


test("renders partial Corporate Events independently with escaped nullable fields", () => {
  const html = renderCorporateIntelligence({ corporate_events: { status: "partial", coverage_status: "partial_unqualified_50_row_cap", sources: [{ source_name: "VCI", records: [{ provider_event_id: "<evt>", fields: { event_title_vi: "<script>bad</script>", record_date: null, value_per_share: 0 }, provenance: { provider: "VCI" } }] }] } });
  assert.match(html, /Corporate Events/);
  assert.match(html, /Incomplete forward observations/);
  assert.match(html, /&lt;script&gt;bad&lt;\/script&gt;/);
  assert.doesNotMatch(html, /<script>bad<\/script>/);
  assert.match(html, /Value per share[\s\S]*>0(?:\.00)?</);
  assert.match(html, /Record date[\s\S]*>-</);
});

test("does not render missing Corporate Events and isolates malformed state", () => {
  const missing = renderCorporateIntelligence({ corporate_events: { status: "missing", sources: [] } });
  assert.doesNotMatch(missing, /Corporate Events/);
  const malformed = renderCorporateIntelligence({ corporate_events: { status: "malformed", data: "bad" } });
  assert.match(malformed, /Corporate Events/);
  assert.match(malformed, /invalid and cannot be displayed/);
});

// --------------------------------------------------------------------------
// Financial distress (Altman Z') panel. The point of these is that a filer the
// model does not apply to can never be shown a score, and that a score is only
// ever echoed from the model's own envelope.
const { renderFinancialDistress, distressForRow, taxonomyForRow } = require("../assets/js/company-panel.js");

const eligibleDistress = {
  schema_version: "1.0.0", model: "altman_z_score", variant: "altman_z_prime_1983_private_firm",
  status: "available", score: 2.897596214248344, zone: "grey",
  zone_proximity: { nearest_threshold: "safe_above", nearest_threshold_value: 2.9, near_threshold: true },
  applicability: { applicability: "eligible", reason: "entity_type='corporate' is non-financial." },
  period: "2024", missing_inputs: [], blocking_reasons: [],
  limitations: ["Z'-score (private-firm variant): X4 uses book value of equity."],
  is_actionable: false,
};
const financialDistress = {
  schema_version: "1.0.0", model: "altman_z_score", variant: "altman_z_prime_1983_private_firm",
  status: "not_applicable", score: null, zone: null, zone_proximity: null,
  applicability: { applicability: "not_applicable", reason: "entity_type='securities' is a financial institution." },
  missing_inputs: [], blocking_reasons: ["entity_type='securities' is a financial institution."],
};

test("an eligible issuer shows model variant, score, zone and the boundary warning", () => {
  const html = renderFinancialDistress(eligibleDistress, null);
  assert.match(html, /altman_z_prime_1983_private_firm/);
  assert.match(html, /2,8976/);
  assert.match(html, /Grey/);
  assert.match(html, /not robust to small input changes/i);
  assert.match(html, /not a bankruptcy probability/i);
});

test("a financial filer is never shown a score", () => {
  const html = renderFinancialDistress(financialDistress, null);
  assert.match(html, /not_applicable/);
  assert.doesNotMatch(html, /Z' score/);
  assert.match(html, /is a financial institution/);
});

test("an insufficient-evidence result names why no score is shown", () => {
  const html = renderFinancialDistress({
    status: "insufficient_evidence", score: null,
    applicability: { applicability: "insufficient_evidence", reason: "industry is unknown." },
    missing_inputs: ["qualified_manufacturing_industry"], blocking_reasons: ["industry is unknown."],
  }, null);
  assert.match(html, /Why no score is shown/);
  assert.match(html, /qualified_manufacturing_industry/);
  assert.doesNotMatch(html, /Z' score/);
});

test("a status of available without a numeric score still renders no number", () => {
  const html = renderFinancialDistress({ ...eligibleDistress, score: null }, null);
  assert.doesNotMatch(html, /Z' score/);
});

test("generated statement taxonomy is labelled as generated, never as a verified issuer type", () => {
  const html = renderFinancialDistress(financialDistress, {
    statement_taxonomy: "credit_institution", entity_type_authority: "generated_taxonomy",
  });
  assert.match(html, /Statement taxonomy \(generated evidence\)/);
  assert.match(html, /not a manually verified issuer type/i);
  assert.match(html, /Credit Institution/);
});

test("an absent distress section renders nothing rather than an empty shell", () => {
  assert.equal(renderFinancialDistress(null, null), "");
  assert.equal(renderFinancialDistress(undefined, undefined), "");
});

test("malformed distress data cannot break the section or leak markup", () => {
  const html = renderFinancialDistress({ status: "available", score: "<img src=x onerror=alert(1)>" }, null);
  assert.doesNotMatch(html, /<img/);
  const injected = renderFinancialDistress({
    status: "not_applicable",
    applicability: { applicability: "not_applicable", reason: "<script>alert(1)</script>" },
  }, null);
  assert.doesNotMatch(injected, /<script>/);
  assert.match(injected, /&lt;script&gt;/);
});

test("distress and taxonomy are read from the row first, then the bundle", () => {
  const row = { ticker: "HPG" };
  const bundle = { tickers: { HPG: { financial_distress_evidence: eligibleDistress, statement_taxonomy_evidence: { statement_taxonomy: "corporate_vas" } } } };
  assert.equal(distressForRow(row, bundle), eligibleDistress);
  assert.equal(taxonomyForRow(row, bundle).statement_taxonomy, "corporate_vas");
  assert.equal(distressForRow({ ticker: "HPG", financial_distress_evidence: financialDistress }, bundle), financialDistress);
  assert.equal(distressForRow({ ticker: "NOPE" }, bundle), undefined);
});
