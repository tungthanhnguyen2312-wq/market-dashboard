(() => {
  "use strict";
  const DATA_URL = "data/investment_decision_workspace.json"; const SCHEMA = "investment_decision_workspace_dashboard_projection/v1";
  const esc = (value) => String(value ?? "—").replace(/[&<>"']/g, (c) => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]));
  function getValueFormat() {
    if (typeof window !== "undefined" && window.VSValueFormat) return window.VSValueFormat;
    if (typeof require === "function") {
      try { return require("./value-format.js"); } catch (err) { return null; }
    }
    return null;
  }
  function labelOf(value, domain) {
    const vf = getValueFormat();
    if (vf && typeof vf.formatDomainState === "function") return vf.formatDomainState(value, domain).label;
    return String(value ?? "Chưa xác định");
  }
  function stateHtml(value, domain) {
    const vf = getValueFormat();
    const raw = value == null || value === "" ? "" : String(value);
    if (vf && typeof vf.visibleStateHtml === "function") return vf.visibleStateHtml(value, domain);
    return `<span data-state="${esc(raw)}" data-domain="${esc(domain || "")}" title="${esc(raw)}">${esc(labelOf(value, domain))}</span>`;
  }
  const actionLabel = (value) => /BUY|SELL/i.test(String(value || "")) ? "CONDITIONAL_RESEARCH_STATE" : (value || "UNAVAILABLE");
  const freshness = (card) => Object.values(card.lineage?.per_axis_freshness || {}).some((value) => value !== "CURRENT") ? "STALE_AXIS_PRESENT" : "CURRENT";
  const records = (workspace) => Object.keys(workspace.cards || {}).sort().map((ticker) => { const card = workspace.cards[ticker]; return {ticker, stance:card.research_stance || "UNAVAILABLE", state:card.entry_state || card.tactical?.primary_entry_state || "UNAVAILABLE", action:actionLabel(card.entry_action), tags:card.setup_tags || [], confirmation:card.confirmation?.status || "UNAVAILABLE", trigger:card.confirmation?.confirmation_trigger_state || "NOT_AVAILABLE", invalidation:card.invalidation?.technical?.status || card.invalidation?.fundamental?.status || "UNAVAILABLE", market:card.market_sector?.breadth_regime || "UNAVAILABLE", sector:card.market_sector?.sector_relative_context?.leadership_state || "UNAVAILABLE", liquidity:card.liquidity?.readiness || "UNAVAILABLE", freshness:freshness(card)}; });
  const cohortStates = ["BREAKOUT_READY", "BASE_BUILDING", "EARLY_REVERSAL_CANDIDATE", "UPTREND_CONFIRMED", "SELLING_PRESSURE_EASING", "DISTRIBUTION_RISK", "BREAKDOWN_RISK"];
  const href = (ticker) => `investment-workspace.html?ticker=${encodeURIComponent(ticker)}`;
  function tagHtml(tags) {
    if (!tags || !tags.length) return esc("Chưa có nhãn được giữ lại");
    return tags.map((tag) => stateHtml(tag, "setup_tag")).join(" ");
  }
  function renderRowHtml(row) {
    return `<tr><td><a class="tactical-link" href="${href(row.ticker)}">${esc(row.ticker)}</a></td><td>${stateHtml(row.stance, "research_stance")}</td><td>${stateHtml(row.state, "tactical_state")}<div class="tactical-muted">${stateHtml(row.action, "research_readiness")}</div></td><td>${tagHtml(row.tags)}</td><td>${stateHtml(row.confirmation, "confirmation_state")}</td><td>${stateHtml(row.trigger, "confirmation_state")}</td><td>${stateHtml(row.invalidation, "invalidation_state")}</td><td>${stateHtml(row.market, "data_fitness")}<div class="tactical-muted">${stateHtml(row.sector, "data_fitness")}</div></td><td>${stateHtml(row.liquidity, "liquidity_state")}</td><td>${stateHtml(row.freshness, "freshness")}</td></tr>`;
  }
  function renderRows(rows) { const state = document.getElementById("tactical-filter").value; const visible = rows.filter((row) => !state || row.state === state); document.getElementById("signals-rows").innerHTML = visible.map(renderRowHtml).join(""); document.getElementById("signals-count").textContent = `${visible.length} / ${rows.length} thẻ mã được hiển thị · sắp xếp alphabet, không phải xếp hạng.`; }
  async function renderLegacySidecars() { const paths = ["data/candle_signals.json", "data/sector_heatmap.json"]; const states = await Promise.all(paths.map(async (path) => { try { const response = await fetch(path, {cache:"no-store"}); return response.ok ? `${path}: available as optional legacy context` : `${path}: OPTIONAL_CANDLE_SIGNAL_SIDECAR_UNAVAILABLE`; } catch (_) { return `${path}: OPTIONAL_CANDLE_SIGNAL_SIDECAR_UNAVAILABLE`; } })); document.getElementById("legacy-sidecars").innerHTML = states.map((state) => `<div class="tactical-muted">${esc(state)}</div>`).join(""); }
  function render(workspace) {
    const rows = records(workspace); const counts = rows.reduce((out, row) => ({...out, [row.state]:(out[row.state] || 0)+1}), {});
    const vf = getValueFormat();
    document.getElementById("signals-content").hidden = false;
    document.getElementById("signals-meta").innerHTML = `Phiên tactical được giữ lại ${esc(workspace.as_of_session)} · ${rows.length.toLocaleString("vi-VN")} thẻ${vf && vf.provenanceHtml ? vf.provenanceHtml(workspace.producer_artifact_identity) : ""}`;
    document.getElementById("tactical-cohorts").innerHTML = cohortStates.map((state) => `<a class="tactical-card" href="#tactical-table" data-state="${esc(state)}" title="${esc(state)}"><span>${esc(labelOf(state, "tactical_state"))}</span><strong>${counts[state] || 0}</strong><small>Mở Không gian quyết định để xem thẻ đầy đủ</small></a>`).join("");
    const filter = document.getElementById("tactical-filter");
    Object.keys(counts).sort().forEach((state) => { const option = document.createElement("option"); option.value = state; option.textContent = `${labelOf(state, "tactical_state")} (${counts[state]})`; filter.append(option); });
    filter.addEventListener("change", () => renderRows(rows)); renderRows(rows); renderLegacySidecars();
  }
  function error(message) { const el = document.getElementById("signals-error"); el.hidden = false; el.textContent = message; }
  if (typeof document !== "undefined") fetch(DATA_URL, {cache:"no-store"}).then((response) => { if (!response.ok) throw new Error(`HTTP ${response.status}`); return response.json(); }).then((workspace) => { if (workspace.schema_version !== SCHEMA || !workspace.cards || !Object.keys(workspace.cards).length) throw new Error("invalid or empty workspace artifact"); render(workspace); }).catch((reason) => error(`CURRENT_PRODUCT_ARTIFACT_NOT_PUBLISHED: ${reason.message}. Tactical V2 cannot be rendered without its primary artifact.`));
  const api = {DATA_URL, SCHEMA, actionLabel, records, cohortStates, renderRowHtml, labelOf}; if (typeof window !== "undefined") window.StockLookupSignals = api; if (typeof module !== "undefined") module.exports = api;
})();
