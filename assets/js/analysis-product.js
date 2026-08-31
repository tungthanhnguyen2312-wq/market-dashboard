(() => {
  "use strict";
  const DATA_URL = "data/investment_decision_workspace.json";
  const SCHEMA = "investment_decision_workspace_dashboard_projection/v1";
  const esc = (value) => String(value ?? "—").replace(/[&<>"']/g, (c) => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]));
  const values = (object) => Object.values(object || {});
  const fresh = (card) => values(card.lineage?.per_axis_freshness).some((value) => value !== "CURRENT") ? "STALE_AXIS_PRESENT" : "CURRENT";
  const valuation = (card) => card.valuation || {};
  const record = (card) => ({
    ticker: card.ticker, sector: card.sector || "UNKNOWN", stance: card.research_stance || "UNAVAILABLE",
    tactical: card.entry_state || card.tactical?.primary_entry_state || "UNAVAILABLE", action: card.entry_action || "UNAVAILABLE",
    fundamental: card.fundamental?.state || "UNAVAILABLE", valuation: valuation(card).relative_research_state || "UNAVAILABLE",
    methods: values(valuation(card).supporting_methods).map((method) => method.method).filter(Boolean),
    liquidity: card.liquidity?.readiness || "UNAVAILABLE", catalyst: card.catalyst?.status || "UNAVAILABLE",
    confirmation: card.confirmation?.status || "UNAVAILABLE", trigger: card.confirmation?.confirmation_trigger_state || "NOT_AVAILABLE",
    invalidation: card.invalidation?.technical?.status || card.invalidation?.fundamental?.status || "UNAVAILABLE", freshness: fresh(card),
    tags: card.setup_tags || [],
  });
  const countBy = (rows, key) => rows.reduce((counts, row) => ({...counts, [row[key]]: (counts[row[key]] || 0) + 1}), {});
  const conflictReasons = (row) => {
    const reasons = [];
    if (["BREAKOUT_READY", "UPTREND_CONFIRMED", "EARLY_REVERSAL_CANDIDATE"].includes(row.tactical) && row.valuation === "EXPENSIVE_RELATIVE_RESEARCH") reasons.push("tactical constructive / valuation expensive");
    if (row.fundamental === "PROFITABLE" && ["DOWNTREND", "DISTRIBUTION_RISK", "BREAKDOWN_RISK"].includes(row.tactical)) reasons.push("profitable / tactical adverse");
    if (row.tactical === "EARLY_REVERSAL_CANDIDATE" && row.tags.some((tag) => /DISTRIBUTION|DETERIORATION/.test(tag))) reasons.push("early reversal / distribution risk");
    if (/LOSS|TURNAROUND/.test(row.fundamental) && ["BREAKOUT_READY", "UPTREND_CONFIRMED", "EARLY_REVERSAL_CANDIDATE"].includes(row.tactical)) reasons.push("loss or turnaround / constructive tape");
    return reasons;
  };
  const analysisRows = (workspace) => Object.keys(workspace.cards || {}).sort().map((ticker) => record(workspace.cards[ticker]));
  function coverage(rows) {
    return {
      fundamental: rows.filter((row) => row.fundamental !== "UNAVAILABLE").length,
      valuation: rows.filter((row) => row.valuation !== "UNAVAILABLE").length,
      tactical: rows.filter((row) => row.tactical !== "UNAVAILABLE").length,
      liquidity: rows.filter((row) => row.liquidity !== "LIQUIDITY_RESEARCH_UNAVAILABLE" && row.liquidity !== "UNAVAILABLE").length,
      stale: rows.filter((row) => row.freshness === "STALE_AXIS_PRESENT").length,
    };
  }
  function workspaceHref(ticker) { return `investment-workspace.html?ticker=${encodeURIComponent(ticker)}`; }
  function renderRows(rows) {
    const stance = document.getElementById("stance-filter").value;
    const tactical = document.getElementById("tactical-filter").value;
    const visible = rows.filter((row) => (!stance || row.stance === stance) && (!tactical || row.tactical === tactical));
    document.getElementById("analysis-rows").innerHTML = visible.map((row) => `<tr><td><a class="product-link" href="${workspaceHref(row.ticker)}">${esc(row.ticker)}</a><div class="product-muted">${esc(row.sector)}</div></td><td>${esc(row.stance)}</td><td>${esc(row.tactical)}<div class="product-muted">${esc(row.action)}</div></td><td>${esc(row.fundamental)}</td><td>${esc(row.valuation)}<div class="product-muted">${esc(row.methods.join(", ") || "No supporting method")}</div></td><td>${esc(row.liquidity)}</td><td>${esc(row.catalyst)}</td><td>${esc(row.confirmation)}<div class="product-muted">trigger: ${esc(row.trigger)}</div></td><td>${esc(row.invalidation)}</td><td>${esc(row.freshness)}</td></tr>`).join("");
    document.getElementById("analysis-count").textContent = `${visible.length} / ${rows.length} ticker cards shown · alphabetical display, not a rank.`;
  }
  function addOptions(id, list) { const element = document.getElementById(id); list.forEach((value) => { const option = document.createElement("option"); option.value = value; option.textContent = value; element.append(option); }); }
  function render(workspace) {
    const rows = analysisRows(workspace); const stanceCounts = countBy(rows, "stance"); const tacticalCounts = countBy(rows, "tactical"); const dataCoverage = coverage(rows);
    document.getElementById("analysis-content").hidden = false;
    document.getElementById("analysis-meta").textContent = `Retained decision session ${workspace.as_of_session} · ${rows.length.toLocaleString("vi-VN")} cards · ${workspace.producer_artifact_identity}`;
    document.getElementById("analysis-summary").innerHTML = [`Universe<b>${rows.length.toLocaleString("vi-VN")}</b>decision cards`, `Stances<b>${Object.keys(stanceCounts).length}</b>research cohorts`, `Tactical states<b>${Object.keys(tacticalCounts).length}</b>retained states`, `Stale axes<b>${dataCoverage.stale.toLocaleString("vi-VN")}</b>explicit, not coerced`].map((html) => `<div class="product-kpi">${html}</div>`).join("");
    document.getElementById("stance-cohorts").innerHTML = Object.entries(stanceCounts).sort().map(([name, total]) => `<span class="product-chip">${esc(name)} · ${total}</span>`).join("");
    document.getElementById("coverage-summary").innerHTML = Object.entries(dataCoverage).map(([axis, total]) => `<span class="product-chip">${esc(axis)}: ${total}/${rows.length}</span>`).join("");
    const conflicts = rows.map((row) => ({row, reasons: conflictReasons(row)})).filter((item) => item.reasons.length);
    document.getElementById("conflicting-evidence").innerHTML = conflicts.length ? `<div class="product-chips">${conflicts.slice(0, 40).map(({row, reasons}) => `<a class="product-chip product-link" href="${workspaceHref(row.ticker)}">${esc(row.ticker)} · ${esc(reasons.join("; "))}</a>`).join("")}</div><p class="product-muted mt-3 mb-0">${conflicts.length} explicit conflict combinations; no aggregate scoring is applied.</p>` : '<p class="product-muted mb-0">No configured conflict combination is present in this retained session.</p>';
    addOptions("stance-filter", Object.keys(stanceCounts).sort()); addOptions("tactical-filter", Object.keys(tacticalCounts).sort());
    document.getElementById("stance-filter").addEventListener("change", () => renderRows(rows)); document.getElementById("tactical-filter").addEventListener("change", () => renderRows(rows)); renderRows(rows);
  }
  function showError(message) { const error = document.getElementById("analysis-error"); error.hidden = false; error.textContent = message; }
  if (typeof document !== "undefined") fetch(DATA_URL, {cache:"no-store"}).then((response) => { if (!response.ok) throw new Error(`HTTP ${response.status}`); return response.json(); }).then((workspace) => { if (workspace.schema_version !== SCHEMA || !workspace.cards || !Object.keys(workspace.cards).length) throw new Error("invalid or empty workspace artifact"); render(workspace); }).catch((error) => showError(`CURRENT_PRODUCT_ARTIFACT_NOT_PUBLISHED: ${error.message}. Publish a validated Investment Decision Workspace artifact.`));
  const api = {DATA_URL, SCHEMA, record, analysisRows, coverage, conflictReasons}; if (typeof window !== "undefined") window.StockLookupAnalysis = api; if (typeof module !== "undefined") module.exports = api;
})();
