"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { renderCorporateIntelligence, renderQualifiedResearchSnapshotV2, snapshotRecordForTicker } = require("../assets/js/company-panel.js");

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

const qualifiedResearchSnapshotV2 = {
  schema_version: "2.1.0",
  snapshot_id: "qrs2-test-identity",
  tickers: [
    { ticker: "HPG", research_status: "qualified", reason_codes: [], target_price: 99, probability: 0.42, analysis_states: {
      historical_research: { status: "qualified", reason_codes: [] },
      raw_as_traded_price: { status: "blocked", reason_codes: ["raw_price_unqualified"] },
      current_valuation: { status: "unknown", reason_codes: ["inputs_unqualified"] },
      generic_liquidity: { status: "unqualified", reason_codes: ["volume_unqualified"] },
      foreign_flow_value: { status: "qualified", reason_codes: [] },
    } },
    { ticker: "VNM", research_status: "blocked", reason_codes: ["research_not_qualified"], analysis_states: {} },
  ],
};

test("renders v2 snapshot identity, statuses, and blockers without numeric fallbacks", () => {
  const html = renderQualifiedResearchSnapshotV2(qualifiedResearchSnapshotV2, { ticker: "HPG", company_name: "Hoa Phat" });
  for (const expected of ["Qualified Research Snapshot v2", "2.1.0", "qrs2-test-identity", "HPG", "Hoa Phat", "Historical research", "Raw-price basis", "Current valuation", "Liquidity", "Foreign-flow value", "raw_price_unqualified", "inputs_unqualified", "volume_unqualified"]) assert.match(html, new RegExp(expected));
  assert.match(html, /qrs2-qualified/);
  assert.match(html, /qrs2-unavailable/);
  assert.doesNotMatch(html, /target price|probability|99|0\.42/i);
});

test("preserves source ticker order when selecting the record for presentation", () => {
  assert.equal(snapshotRecordForTicker(qualifiedResearchSnapshotV2, "VNM"), qualifiedResearchSnapshotV2.tickers[1]);
  assert.deepEqual(qualifiedResearchSnapshotV2.tickers.map((row) => row.ticker), ["HPG", "VNM"]);
});

test("legacy bundles without v2 retain the prior panel behavior", () => {
  assert.equal(renderQualifiedResearchSnapshotV2(null, { ticker: "HPG" }), "");
  assert.match(renderQualifiedResearchSnapshotV2({ tickers: [] }, { ticker: "HPG" }), /ticker_not_present_in_snapshot/);
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
