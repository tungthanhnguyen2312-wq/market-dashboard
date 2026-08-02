"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { renderCorporateIntelligence } = require("../assets/js/company-panel.js");

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
};

test("renders all Corporate Intelligence subsections and preserves provider semantics", () => {
  const html = renderCorporateIntelligence(fullPayload);
  for (const expected of ["Company profile", "Ownership structure", "Major shareholders", "Company subsidiaries", "KBS", "VCI", "sector", "business model", "issue share", "outstanding shares", "Sub One", "VCI-1"]) assert.match(html.toLowerCase(), new RegExp(expected.toLowerCase()));
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

// --------------------------------------------------------------------------
// Financial distress (Altman Z') panel. The point of these is that a filer the
// model does not apply to can never be shown a score, and that a score is only
// ever echoed from the model's own envelope.
const { renderFinancialDistress, distressForRow, taxonomyForRow } = require("../assets/js/company-panel.js");

const eligibleDistress = {
  schema_version: "1.0.0", model: "altman_z_score", variant: "Z_prime_1983_private_firm",
  status: "available", score: 2.897596214248344, zone: "grey",
  zone_proximity: { nearest_threshold: "safe_above", nearest_threshold_value: 2.9, near_threshold: true },
  applicability: { applicability: "eligible", reason: "entity_type='corporate' is non-financial." },
  period: "2024", missing_inputs: [], blocking_reasons: [],
  limitations: ["Z'-score (private-firm variant): X4 uses book value of equity."],
  is_actionable: false,
};
const financialDistress = {
  schema_version: "1.0.0", model: "altman_z_score", variant: "Z_prime_1983_private_firm",
  status: "not_applicable", score: null, zone: null, zone_proximity: null,
  applicability: { applicability: "not_applicable", reason: "statement_taxonomy='credit_institution' is a specialized financial reporting template." },
  missing_inputs: [], blocking_reasons: ["statement_taxonomy='credit_institution' is a specialized financial reporting template."],
};

test("an eligible issuer shows model variant, score, zone and the boundary warning", () => {
  const html = renderFinancialDistress(eligibleDistress, null);
  assert.match(html, /Z_prime_1983_private_firm/);
  assert.match(html, /2,8976/);
  assert.match(html, /Grey/);
  assert.match(html, /not robust to small input changes/i);
  assert.match(html, /not a bankruptcy probability/i);
});

test("a financial filer is never shown a score", () => {
  const html = renderFinancialDistress(financialDistress, null);
  assert.match(html, /not_applicable/);
  assert.doesNotMatch(html, /Z' score/);
  assert.match(html, /specialized financial reporting template/);
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
