const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const root = path.resolve(__dirname, "..");
const surface = require(path.join(root, "assets", "js", "shadow-recommendations.js"));
const source = JSON.parse(fs.readFileSync(path.join(root, "data", "shadow_recommendation_product_surface.json"), "utf8"));
const html = fs.readFileSync(path.join(root, "shadow-recommendations.html"), "utf8");

test("full product projection preserves every upstream label and readiness count", () => {
  const model = surface.buildModel(source);
  assert.equal(model.status, "SHADOW_RECOMMENDATION_PRODUCT_READY");
  assert.equal(model.records.length, 523);
  assert.deepEqual(model.labels, source.validation.recommendation_counts);
  assert.deepEqual(model.readiness, source.validation.readiness_counts);
  assert.equal(model.records.filter((record) => record.recommendation.recommendation_label === "ACCUMULATE_RESEARCH_CANDIDATE" && record.recommendation.recommendation_readiness === "RECOMMENDATION_CONDITIONAL").length, 3);
  for (const ticker of ["BFC", "AIG", "HAG", "AAA", "AAV", "AAH", "AAS"]) assert.ok(model.records.some((record) => record.ticker === ticker));
});

test("optional, unsupported, stale, and session-mismatched narratives fail locally", () => {
  const record = structuredClone(source.records.BFC);
  assert.equal(surface.narrativeState(record).state, "NO_NARRATIVE_AVAILABLE");
  record.narrative = { contract_version: "shadow_recommendation_consumer_narrative/v2" };
  assert.equal(surface.narrativeState(record).state, "UNSUPPORTED_NARRATIVE_CONTRACT");
  record.narrative = { contract_version: surface.NARRATIVE_CONTRACT, as_of_session: "2026-01-01", producer_artifact_identity: record.producer_artifact_identity, recommendation_label: record.recommendation.recommendation_label, recommendation_readiness: record.recommendation.recommendation_readiness, validation_status: "NARRATIVE_VALID" };
  assert.equal(surface.narrativeState(record).state, "SESSION_MISMATCH");
  record.narrative.as_of_session = record.recommendation.as_of_session;
  record.narrative.producer_artifact_identity = "shadow_security_recommendation:other";
  assert.equal(surface.narrativeState(record).state, "NARRATIVE_STALE_FOR_CURRENT_RECOMMENDATION");
  record.narrative.producer_artifact_identity = record.producer_artifact_identity;
  record.narrative.narrative_kind = "DETERMINISTIC_FALLBACK_NARRATIVE";
  delete record.narrative.validation_status;
  assert.equal(surface.narrativeState(record).state, "DETERMINISTIC_FALLBACK_NARRATIVE");
});

test("detail model retains canonical states without dashboard remapping", () => {
  const model = surface.buildModel(source);
  const conditional = model.records.find((record) => record.ticker === "HAG");
  const avoid = model.records.find((record) => record.ticker === "AAH");
  const highRisk = model.records.find((record) => record.ticker === "AAV");
  const insufficient = model.records.find((record) => record.ticker === "AAS");
  assert.match(surface.detailHtml(conditional), /Accumulate research candidate/);
  assert.match(surface.detailHtml(conditional), /Conditional research packet/);
  assert.match(surface.detailHtml(avoid), /Avoid new entry/);
  assert.match(surface.detailHtml(highRisk), /High-risk speculation only/);
  assert.match(surface.detailHtml(insufficient), /Insufficient evidence/);
  assert.match(surface.detailHtml(model.records.find((record) => record.ticker === "BFC")), /UNKNOWN/);
});

test("filtering is categorical only and preserves input order semantics", () => {
  const model = surface.buildModel(source);
  const filtered = surface.filterRecords(model, { label: "AVOID_NEW_ENTRY", readiness: "RECOMMENDATION_CONDITIONAL" });
  assert.equal(filtered.length, 70);
  assert.ok(filtered.every((record) => record.recommendation.recommendation_label === "AVOID_NEW_ENTRY"));
});

test("static page contains no trade controls or product action semantics", () => {
  assert.match(html, /SHADOW RESEARCH ONLY/);
  assert.doesNotMatch(html, /<input[^>]+(?:quantity|position|weight)/i);
  assert.doesNotMatch(html, /data-action\s*=\s*["'](?:buy|sell|hold|exit|liquidate)/i);
  assert.doesNotMatch(html, />\s*(?:Buy|Sell|Hold|Exit|Liquidate)\s*</i);
});
