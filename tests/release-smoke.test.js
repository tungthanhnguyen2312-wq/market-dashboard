"use strict";
/* Post-publication smoke over the artifacts this repository actually serves.
 *
 * Every other test in this directory runs against fixtures. This one runs against the
 * committed analysis_bundle.json / bundle_manifest.json, so it fails when a release lands
 * that the panel would render wrongly or that does not verify against its own manifest.
 * It asserts what the published release must never do -- show a score for a filer the
 * model excludes, present historical multiples as current, claim actionable output on an
 * unverified price basis -- and renders the real entries through the real panel functions.
 */
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const crypto = require("node:crypto");
const path = require("node:path");

const ROOT = path.join(__dirname, "..");
const panel = require("../assets/js/company-panel.js");

function readJson(name) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, name), "utf8"));
}
function sha256(name) {
  return crypto.createHash("sha256").update(fs.readFileSync(path.join(ROOT, name))).digest("hex");
}

const bundle = readJson("analysis_bundle.json");
const manifest = readJson("bundle_manifest.json");
const proof = manifest.trusted_subset;
const entryFor = (ticker) => (bundle.tickers || {})[ticker];

test("the published release verifies against its own manifest", () => {
  assert.equal(proof.bundle_sha256, sha256("analysis_bundle.json"));
  assert.equal(proof.bundle_reference_session_date, bundle.reference_session_date);
  assert.equal(proof.bundle_generated_at, bundle.generated_at);
  assert.equal(manifest.generated_at, bundle.generated_at);
  for (const artifact of proof.required_artifacts) {
    assert.ok(fs.existsSync(path.join(ROOT, artifact.file)), `${artifact.file} is not published`);
    assert.equal(sha256(artifact.file), artifact.sha256, `${artifact.file} differs from the manifest`);
  }
});

test("current-market analytics stay fail-closed on an unverified price basis", () => {
  assert.equal(bundle.is_actionable, false);
  assert.equal(bundle.price_basis_verified, false);
  assert.equal(bundle.volume_basis_verified, false);
  assert.notEqual(proof.trust_state, "exact_session_qualified");
  for (const [ticker, entry] of Object.entries(bundle.tickers || {})) {
    const methods = (entry.relative_valuation || {}).methods || {};
    for (const [name, method] of Object.entries(methods)) {
      if (method.state !== "available") continue;
      assert.equal(method.historical_only, true, `${ticker}.${name} is presented as current`);
      assert.ok(method.price_as_of_date, `${ticker}.${name} has no price date`);
    }
  }
});

test("no financial institution receives an Altman score", () => {
  const financial = new Set(["bank", "securities", "insurance", "finance_company", "credit_institution"]);
  for (const [ticker, entry] of Object.entries(bundle.tickers || {})) {
    if (!financial.has(entry.entity_type)) continue;
    const distress = entry.financial_distress_evidence || {};
    assert.equal(distress.status, "not_applicable", `${ticker} should be not_applicable`);
    assert.equal(distress.score, null, `${ticker} was given a distress score`);
    const html = panel.renderFinancialDistress(distress, entry.statement_taxonomy_evidence);
    assert.doesNotMatch(html, /Z' score/, `${ticker} rendered a score`);
    assert.match(html, /not_applicable/);
  }
});

// These two tests deliberately do not hardcode which ticker carries which Altman
// status: a specific ticker's evidence sufficiency is a fact about the currently
// retained/verified citation store, not a stable identity of the ticker itself. HPG
// and VNM originally qualified (2026-08-01, docs/altman_z_prime_qualification.md) from
// current_liabilities/retained_earnings citations plus EBITDA components tied to
// evidence_id a7c3711d...ddcd2a8; that evidence_id is no longer present in the current
// manifest.json (superseded by the 2026-08-09 bounded legacy-cohort recovery, which
// restored a different five-fact set for a different, narrower contract), so every one
// of the 8 identities altman_z_score.py requires is honestly absent and
// insufficient_evidence is the correct, fail-closed result -- not a bug to work around.
test("Altman Z-prime renders a score exactly when the model itself reports one available", (t) => {
  const withScore = Object.entries(bundle.tickers || {}).filter(([, entry]) =>
    (entry.financial_distress_evidence || {}).status === "available");
  if (withScore.length === 0) {
    t.skip("no ticker in this release currently has a qualified Altman Z-prime result");
    return;
  }
  for (const [ticker, entry] of withScore) {
    const distress = entry.financial_distress_evidence;
    assert.equal(distress.variant, "altman_z_prime_1983_private_firm", `${ticker} variant`);
    assert.equal(typeof distress.score, "number", `${ticker} score`);
    assert.ok(["distress", "grey", "safe"].includes(distress.zone), `${ticker} unexpected zone ${distress.zone}`);
    const html = panel.renderFinancialDistress(distress, entry.statement_taxonomy_evidence);
    assert.match(html, /Z' score/, `${ticker} did not render a score`);
    assert.match(html, /altman_z_prime_1983_private_firm/, `${ticker} did not render its variant`);
    assert.match(html, /not a bankruptcy probability/i);
    // The near-threshold warning is rendered exactly when the model itself flagged
    // proximity, never inferred by the test from the raw score.
    const proximity = distress.zone_proximity || {};
    if (proximity.near_threshold) assert.match(html, /not robust to small input changes/i, `${ticker} missing near-threshold warning`);
    else assert.doesNotMatch(html, /not robust to small input changes/i, `${ticker} unwarranted near-threshold warning`);
  }
});

test("a non-financial ticker with insufficient Altman evidence never shows a fabricated score", (t) => {
  const financial = new Set(["bank", "securities", "insurance", "finance_company", "credit_institution"]);
  const insufficient = Object.entries(bundle.tickers || {}).filter(([, entry]) => {
    const distress = entry.financial_distress_evidence;
    return distress && distress.status === "insufficient_evidence" && !financial.has(entry.entity_type);
  });
  if (insufficient.length === 0) {
    t.skip("no non-financial ticker in this release is currently insufficient_evidence");
    return;
  }
  for (const [ticker, entry] of insufficient) {
    const distress = entry.financial_distress_evidence;
    assert.equal(distress.score, null, `${ticker} scored despite insufficient_evidence`);
    assert.equal(distress.zone, null, `${ticker} zoned despite insufficient_evidence`);
    assert.ok(Array.isArray(distress.missing_inputs) && distress.missing_inputs.length > 0,
      `${ticker} insufficient_evidence must name what is missing`);
    const html = panel.renderFinancialDistress(distress, entry.statement_taxonomy_evidence);
    assert.doesNotMatch(html, /Z' score/, `${ticker} rendered a score despite insufficient evidence`);
    assert.match(html, /Missing input/, `${ticker} did not render why no score is shown`);
    assert.match(html, /not a bankruptcy probability/i);
  }
});

test("SSI is excluded from the distress model as a financial institution", { skip: !entryFor("SSI") }, () => {
  const entry = entryFor("SSI");
  const distress = entry.financial_distress_evidence;
  assert.equal(distress.status, "not_applicable");
  assert.equal(distress.score, null);
  assert.match(String((distress.applicability || {}).reason), /financial institution/i);
});

test("historical valuation renders its period and price date, never a current multiple", (t) => {
  const withMultiples = Object.entries(bundle.tickers || {}).filter(([, entry]) =>
    Object.values(((entry.relative_valuation || {}).methods) || {}).some((m) => m.state === "available"));
  if (withMultiples.length === 0) {
    t.skip("no ticker in this release has an available historical multiple");
    return;
  }
  for (const [ticker, entry] of withMultiples) {
    const html = panel.renderHistoricalValuation(entry);
    assert.match(html, /Historical multiples only — not current\/live multiples\./,
      `${ticker} did not label its multiples historical`);
    assert.match(html, /FY\d{4} financials · qualified market price as of \d{4}-\d{2}-\d{2}/,
      `${ticker} did not render both date labels`);
  }
});

test("a ticker with no qualified price shows an explicit unavailable state", () => {
  const withoutMultiples = Object.entries(bundle.tickers || {}).filter(([, entry]) => {
    const methods = ((entry.relative_valuation || {}).methods) || {};
    return Object.keys(methods).length > 0
      && !Object.values(methods).some((m) => m.state === "available");
  });
  for (const [ticker, entry] of withoutMultiples) {
    const html = panel.renderHistoricalValuation(entry);
    assert.match(html, /No current\/live multiple is inferred\./, `${ticker} inferred a multiple`);
  }
});

test("the statement taxonomy is published as generated evidence, below the manual profile", () => {
  assert.equal(manifest.statement_taxonomy_sidecar.authority_level, "generated_evidence");
  assert.equal(manifest.statement_taxonomy_sidecar.present, true);
  assert.equal(manifest.statement_taxonomy_sidecar.session_identity, proof.session_identity);
  const classified = Object.entries(bundle.tickers || {})
    .filter(([, entry]) => (entry.statement_taxonomy_evidence || {}).statement_taxonomy);
  assert.ok(classified.length > 0, "no ticker carries statement-taxonomy evidence");
  for (const [ticker, entry] of classified) {
    const evidence = entry.statement_taxonomy_evidence;
    assert.equal(evidence.authority_level, "generated_evidence", `${ticker} claims higher authority`);
    const html = panel.renderStatementTaxonomy(evidence);
    assert.match(html, /Statement taxonomy \(generated evidence\)/);
    assert.match(html, /not a manually verified issuer type/i);
  }
});
