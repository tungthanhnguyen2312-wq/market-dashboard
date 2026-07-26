/* Dense Screener workflow controls.  This module never writes URL/history. */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.ScreenerPhase5B = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";
  const number = (value) => Number.isFinite(Number(value)) ? Number(value) : null;
  const text = (value) => String(value ?? "").trim();
  const esc = (value) => text(value).replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]));

  function freshness(row, marketSession) {
    const date = text(row && row.date);
    if (!date || !marketSession) return "unknown";
    return date === marketSession ? "current" : "stale";
  }

  function signal(row, marketSession) {
    const state = freshness(row, marketSession);
    const chg = number(row && row.chg_today_pct);
    const rsi = number(row && row.rsi14);
    const structure = text(row && row.structure);
    const momentum = chg !== null && chg > 0 && rsi !== null && rsi >= 50 ? "momentum" : "watch";
    return { state, momentum, structure };
  }

  function defaultFilters() {
    return { exchange: "", minRs: "", minRelVol: "", minLiquidity: "", maxPe: "", signalState: "", cleanOnly: false };
  }

  function presetFilters(name) {
    const filters = defaultFilters();
    if (name === "leaders") Object.assign(filters, { minRs: "80", minRelVol: "1", minLiquidity: "3", signalState: "current" });
    if (name === "liquid") Object.assign(filters, { minLiquidity: "10" });
    if (name === "momentum") Object.assign(filters, { minRs: "70", minRelVol: "1", signalState: "current" });
    if (name === "clean") Object.assign(filters, { cleanOnly: true, minLiquidity: "3" });
    return filters;
  }

  function matches(row, filters, marketSession) {
    const f = { ...defaultFilters(), ...(filters || {}) };
    const ge = (field, threshold) => threshold === "" || number(row[field]) !== null && number(row[field]) >= Number(threshold);
    const le = (field, threshold) => threshold === "" || number(row[field]) !== null && number(row[field]) <= Number(threshold);
    if (f.exchange && text(row.exchange) !== f.exchange) return false;
    if (!ge("rs_rating", f.minRs) || !ge("rel_vol", f.minRelVol) || !ge("gtgd20_ty", f.minLiquidity) || !le("pe", f.maxPe)) return false;
    if (f.cleanOnly && (text(row.margin_status) || number(row.gtgd20_ty) === null || number(row.gtgd20_ty) < 3)) return false;
    return !f.signalState || freshness(row, marketSession) === f.signalState;
  }

  function attach({ table, rows, marketSession, tableNode }) {
    if (!table || !tableNode || tableNode.dataset.phase5bBound === "true") return;
    tableNode.dataset.phase5bBound = "true";
    const controls = {
      exchange: document.getElementById("screen-exchange"), minRs: document.getElementById("screen-min-rs"),
      minRelVol: document.getElementById("screen-min-relvol"), minLiquidity: document.getElementById("screen-min-liquidity"),
      maxPe: document.getElementById("screen-max-pe"), signalState: document.getElementById("screen-signal-state"),
      cleanOnly: document.getElementById("cleanOnly"),
    };
    const values = () => Object.fromEntries(Object.entries(controls).map(([key, el]) => [key, el && el.type === "checkbox" ? el.checked : (el ? el.value : "")]));
    const apply = () => table.draw();
    const exchanges = [...new Set(rows.map((row) => text(row.exchange)).filter(Boolean))].sort();
    if (controls.exchange) exchanges.forEach((exchange) => { const option = document.createElement("option"); option.value = exchange; option.textContent = exchange; controls.exchange.appendChild(option); });
    Object.values(controls).filter(Boolean).forEach((el) => el.addEventListener("change", apply));
    document.querySelectorAll("[data-screen-preset]").forEach((button) => button.addEventListener("click", () => {
      const filters = presetFilters(button.dataset.screenPreset);
      Object.entries(filters).forEach(([key, value]) => { const el = controls[key]; if (el) el.type === "checkbox" ? el.checked = value : el.value = value; });
      document.querySelectorAll("[data-screen-preset]").forEach((item) => item.classList.toggle("is-active", item === button));
      apply();
    }));
    DataTable.ext.search.push((settings, data, index) => {
      if (settings.nTable !== tableNode) return true;
      return matches(table.row(index).data(), values(), marketSession);
    });
  }

  return { freshness, signal, defaultFilters, presetFilters, matches, attach, esc };
});
