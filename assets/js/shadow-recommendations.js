/* Static view-model and renderer for shadow recommendation research packets.
 * This file intentionally contains no recommendation policy, scoring, ranking, model
 * call, or cross-repository import. It renders serialized upstream facts only. */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.ShadowRecommendationSurface = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";
  const PRODUCT_CONTRACT = "shadow_recommendation_product_surface/v1";
  const PRODUCER_CONTRACT = "shadow_security_recommendation/v1";
  const NARRATIVE_CONTRACT = "shadow_recommendation_consumer_narrative/v1";
  const LABELS = new Set(["INITIATE_RESEARCH_CANDIDATE", "ACCUMULATE_RESEARCH_CANDIDATE", "WAIT_FOR_CONFIRMATION", "HIGH_RISK_SPECULATION_ONLY", "AVOID_NEW_ENTRY", "INSUFFICIENT_EVIDENCE"]);
  const READINESS = new Set(["RECOMMENDATION_READY", "RECOMMENDATION_CONDITIONAL", "RECOMMENDATION_NOT_READY"]);
  const LABEL_TEXT = Object.freeze({
    INITIATE_RESEARCH_CANDIDATE: "Initiate research candidate",
    ACCUMULATE_RESEARCH_CANDIDATE: "Accumulate research candidate",
    WAIT_FOR_CONFIRMATION: "Wait for confirmation",
    HIGH_RISK_SPECULATION_ONLY: "High-risk speculation only",
    AVOID_NEW_ENTRY: "Avoid new entry",
    INSUFFICIENT_EVIDENCE: "Insufficient evidence",
  });
  const READINESS_TEXT = Object.freeze({
    RECOMMENDATION_READY: "Research packet ready",
    RECOMMENDATION_CONDITIONAL: "Conditional research packet",
    RECOMMENDATION_NOT_READY: "Recommendation evidence not ready",
  });
  const esc = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
  const status = (value) => value === null || value === undefined || value === "" ? "UNAVAILABLE" : String(value);
  const list = (items) => Array.isArray(items) && items.length ? `<ul class="shadow-list">${items.map((item) => `<li>${esc(typeof item === "string" ? item : JSON.stringify(item))}</li>`).join("")}</ul>` : '<span class="shadow-muted">Not supplied / unavailable</span>';
  const stateBadge = (value) => `<span class="shadow-state">${esc(status(value))}</span>`;
  const canonicalRecord = (record) => {
    const recommendation = record && record.recommendation;
    return Boolean(record && typeof record.ticker === "string" && recommendation && LABELS.has(recommendation.recommendation_label) && READINESS.has(recommendation.recommendation_readiness) && typeof recommendation.as_of_session === "string");
  };
  const countBy = (records, field) => records.reduce((counts, row) => { const value = row.recommendation[field]; counts[value] = (counts[value] || 0) + 1; return counts; }, {});
  const sameCounts = (left, right) => JSON.stringify(Object.entries(left).sort()) === JSON.stringify(Object.entries(right || {}).sort());

  function narrativeState(record) {
    const narrative = record.narrative;
    if (!narrative || narrative.state === "NO_NARRATIVE_AVAILABLE") return { state: "NO_NARRATIVE_AVAILABLE", narrative: null };
    if (narrative.contract_version !== NARRATIVE_CONTRACT) return { state: "UNSUPPORTED_NARRATIVE_CONTRACT", narrative: null };
    if (narrative.as_of_session !== record.recommendation.as_of_session) return { state: "SESSION_MISMATCH", narrative: null };
    if (narrative.producer_artifact_identity !== record.producer_artifact_identity) return { state: "NARRATIVE_STALE_FOR_CURRENT_RECOMMENDATION", narrative: null };
    if (narrative.recommendation_label !== record.recommendation.recommendation_label || narrative.recommendation_readiness !== record.recommendation.recommendation_readiness) return { state: "NARRATIVE_STALE_FOR_CURRENT_RECOMMENDATION", narrative: null };
    if (narrative.validation_status === "NARRATIVE_VALID") return { state: "VALIDATED_MODEL_NARRATIVE", narrative };
    if (narrative.narrative_kind === "DETERMINISTIC_FALLBACK_NARRATIVE") return { state: "DETERMINISTIC_FALLBACK_NARRATIVE", narrative };
    return { state: "UNVALIDATED_NARRATIVE_NOT_RENDERED", narrative: null };
  }

  function buildModel(source) {
    if (!source || source.contract_version !== PRODUCT_CONTRACT || source.producer_contract_version !== PRODUCER_CONTRACT || !source.records || typeof source.records !== "object") return { status: "UNSUPPORTED_SHADOW_RECOMMENDATION_CONTRACT", records: [] };
    const records = Object.values(source.records).filter(canonicalRecord).sort((a, b) => a.ticker.localeCompare(b.ticker));
    if (records.length !== Object.keys(source.records).length || records.length !== source.denominator) return { status: "DASHBOARD_RECOMMENDATION_RECORD_INVALID", records: [] };
    const labels = countBy(records, "recommendation_label");
    const readiness = countBy(records, "recommendation_readiness");
    if (!sameCounts(labels, source.validation?.recommendation_counts) || !sameCounts(readiness, source.validation?.readiness_counts)) return { status: "DASHBOARD_RECOMMENDATION_COUNT_MISMATCH", records: [] };
    return { status: "SHADOW_RECOMMENDATION_PRODUCT_READY", records, labels, readiness, sourceIdentity: source.producer_artifact_identity, productIdentity: source.artifact_identity, source };
  }

  function filterRecords(model, filters) {
    return model.records.filter((record) => Object.entries(filters || {}).every(([key, value]) => {
      if (!value) return true;
      const r = record.recommendation;
      if (key === "label") return r.recommendation_label === value;
      if (key === "readiness") return r.recommendation_readiness === value;
      if (key === "sector") return record.security_identity?.sector === value;
      if (key === "risk") return record.risk_context?.status === value;
      if (key === "valuation") return record.valuation_context?.status === value;
      if (key === "catalyst") return record.catalyst_context?.status === value;
      return true;
    }));
  }

  function detailHtml(record) {
    const r = record.recommendation, technical = record.technical_invalidation || {}, fundamental = record.fundamental_invalidation || {}, temporal = record.temporal_context || {}, narrative = narrativeState(record);
    const block = (title, content) => `<section class="shadow-detail-block"><h3>${esc(title)}</h3>${content}</section>`;
    const field = (label, value) => `<div class="shadow-field"><span>${esc(label)}</span><strong>${esc(status(value))}</strong></div>`;
    const boundary = (entry) => `${field("Status", entry?.status)}${field("Trigger state", entry?.current_trigger_state)}${field("Direction", entry?.direction)}${field("Basis", entry?.price_basis || entry?.qualification_method)}${list(entry?.warnings)}`;
    const narrativeHtml = narrative.narrative ? `${list(narrative.narrative.supporting_evidence)}${list(narrative.narrative.counter_thesis)}` : `<p class="shadow-muted">${esc(narrative.state)}</p>`;
    return `${block("Research stance", `<div class="shadow-stance">${stateBadge(LABEL_TEXT[r.recommendation_label])}${stateBadge(READINESS_TEXT[r.recommendation_readiness])}</div>${field("As of session", r.as_of_session)}${field("Canonical label", r.recommendation_label)}${field("Shadow posture", r.shadow_posture)}${list(r.recommendation_reason_codes)}`)}
      ${block("Why this stance", `${field("Research-case eligibility", record.thesis_context?.research_case_eligibility)}${field("Thesis archetype", record.thesis_context?.thesis_archetype)}${list(record.thesis_context?.thesis_evidence)}`)}
      ${block("Readiness / uncertainty", `${field("Readiness", READINESS_TEXT[r.recommendation_readiness])}${list([...(record.warnings || []), ...(record.thesis_context?.material_warnings || [])])}`)}
      ${block("Market confirmation", `${field("Status", record.market_confirmation?.status)}${field("Current trigger state", record.market_confirmation?.current_trigger_state)}${field("Direction", record.market_confirmation?.direction)}${list(record.market_confirmation?.warnings)}`)}
      ${block("Technical invalidation", boundary(technical))}
      ${block("Fundamental invalidation", boundary(fundamental))}
      ${block("Catalyst / event context", `${field("Status", record.catalyst_context?.status)}${list(record.catalyst_context?.qualified_catalysts)}${list(record.catalyst_context?.retained_event_context)}`)}
      ${block("Valuation context", `${field("Status", record.valuation_context?.status)}${field("Availability", record.valuation_context?.availability)}${field("Price session", record.valuation_context?.price_session)}`)}
      ${block("Risk context", `${field("Status", record.risk_context?.status)}${field("Risk artifact identity", record.risk_context?.risk_artifact_identity)}${field("Sector", record.risk_context?.sector)}${list(Object.entries(record.risk_context?.security_volatility_context || {}).map(([horizon, detail]) => `${horizon}: ${status(detail?.status)}`))}`)}
      ${block("What to watch", list((record.monitoring_context || []).map((row) => `${status(row.monitor_category)} · ${status(row.cadence_class)} · ${status(row.recompute_requirement)}`)))}
      ${block("Counter-thesis", `${list(record.warnings)}<details class="shadow-provenance"><summary>Grounding / source locator</summary><code>${esc(JSON.stringify({ producer_artifact_identity: record.producer_artifact_identity, input_lineage: record.input_lineage }, null, 2))}</code></details>`)}
      ${block("Narrative", narrativeHtml)}
      ${block("Temporal / authority", `<div class="shadow-authority">SHADOW RESEARCH ONLY</div>${field("Same-close execution", temporal.close_price_execution_eligibility)}${field("Historical PIT", temporal.historical_pit_authority)}${field("Historical backtest", temporal.historical_backtest_authority)}<p class="shadow-muted">No personalized advice, trade execution, portfolio allocation/sizing, target-price, or probability authority.</p><details class="shadow-provenance"><summary>Artifact identities</summary><code>${esc(JSON.stringify({ producer: record.producer_artifact_identity, lineage: record.input_lineage }, null, 2))}</code></details>`)}`;
  }

  function mount(document, model) {
    const error = document.getElementById("shadow-error"), app = document.getElementById("shadow-app");
    if (model.status !== "SHADOW_RECOMMENDATION_PRODUCT_READY") { error.hidden = false; error.textContent = model.status === "UNSUPPORTED_SHADOW_RECOMMENDATION_CONTRACT" ? "Recommendation packet not available or unsupported." : model.status; return; }
    app.hidden = false;
    document.getElementById("shadow-source-line").textContent = `${model.records.length} retained research packets · Producer ${model.sourceIdentity}`;
    const selects = { label: document.getElementById("shadow-filter-label"), readiness: document.getElementById("shadow-filter-readiness"), sector: document.getElementById("shadow-filter-sector"), risk: document.getElementById("shadow-filter-risk"), valuation: document.getElementById("shadow-filter-valuation"), catalyst: document.getElementById("shadow-filter-catalyst") };
    const options = (select, values, display) => { select.innerHTML = `<option value="">All</option>${[...new Set(values)].filter(Boolean).sort().map((value) => `<option value="${esc(value)}">${esc(display ? display(value) : value)}</option>`).join("")}`; };
    options(selects.label, model.records.map(x => x.recommendation.recommendation_label), x => LABEL_TEXT[x]); options(selects.readiness, model.records.map(x => x.recommendation.recommendation_readiness), x => READINESS_TEXT[x]); options(selects.sector, model.records.map(x => x.security_identity?.sector)); options(selects.risk, model.records.map(x => x.risk_context?.status)); options(selects.valuation, model.records.map(x => x.valuation_context?.status)); options(selects.catalyst, model.records.map(x => x.catalyst_context?.status));
    const table = document.getElementById("shadow-table-body"), detail = document.getElementById("shadow-detail"), count = document.getElementById("shadow-result-count");
    const render = () => { const rows = filterRecords(model, Object.fromEntries(Object.entries(selects).map(([key, el]) => [key, el.value]))); count.textContent = `${rows.length} of ${model.records.length}`; table.innerHTML = rows.map((record) => `<tr><td><button class="shadow-ticker" data-ticker="${esc(record.ticker)}">${esc(record.ticker)}</button></td><td>${stateBadge(LABEL_TEXT[record.recommendation.recommendation_label])}</td><td>${stateBadge(READINESS_TEXT[record.recommendation.recommendation_readiness])}</td><td>${esc(status(record.security_identity?.sector))}</td><td>${esc(status(record.market_confirmation?.status))}</td><td>${esc(status(record.technical_invalidation?.current_trigger_state))}</td><td>${esc(status(record.fundamental_invalidation?.current_trigger_state))}</td><td>${esc(status(record.risk_context?.status))}</td><td>${esc(status(record.valuation_context?.status))}</td><td>${esc(status(record.catalyst_context?.status))}</td><td>${esc(record.recommendation.as_of_session)}</td></tr>`).join(""); table.querySelectorAll("[data-ticker]").forEach((button) => button.addEventListener("click", () => { const record = model.records.find((row) => row.ticker === button.dataset.ticker); detail.innerHTML = detailHtml(record); detail.scrollIntoView({ behavior: "smooth", block: "start" }); })); };
    Object.values(selects).forEach((select) => select.addEventListener("change", render));
    document.getElementById("shadow-clear-filters").addEventListener("click", () => { Object.values(selects).forEach((select) => { select.value = ""; }); render(); });
    render(); detail.innerHTML = detailHtml(model.records[0]);
  }

  async function boot(document) {
    try { const response = await fetch("data/shadow_recommendation_product_surface.json", { cache: "no-store" }); if (!response.ok) throw Error(`HTTP ${response.status}`); mount(document, buildModel(await response.json())); }
    catch (error) { const target = document.getElementById("shadow-error"); target.hidden = false; target.textContent = `Recommendation packet not available (${error.message}). Other dashboard pages remain available.`; }
  }
  return { PRODUCT_CONTRACT, PRODUCER_CONTRACT, NARRATIVE_CONTRACT, LABEL_TEXT, READINESS_TEXT, buildModel, filterRecords, narrativeState, detailHtml, mount, boot };
});
