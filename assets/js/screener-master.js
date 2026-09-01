(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.VSScreenerMaster = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  const CONTRACT_VERSION = "screener_master_projection/v1";
  const DATA_URL = "data/screener_master_projection.json";
  const JS_FALLBACK = "data/screener_master_projection.js";
  const WORKSPACE_URL = "data/investment_decision_workspace.json";
  const WORKSPACE_SCHEMA = "investment_decision_workspace_dashboard_projection/v1";
  const ENTITY_CLASS_VOCABULARY = ["corporate", "bank", "securities", "insurance", "finance_company"];

  function normalizeTicker(value) {
    return String(value || "").trim().toUpperCase();
  }

  function formatSessionPercent(fraction) {
    if (fraction === null || fraction === undefined || fraction === "") return { text: "Chưa đủ dữ liệu", cls: "", valid: false };
    const n = Number(fraction);
    if (!Number.isFinite(n)) return { text: "Chưa đủ dữ liệu", cls: "", valid: false };
    const pct = n * 100;
    const sign = pct > 0 ? "+" : "";
    const text = `${sign}${pct.toFixed(2)}%`;
    const cls = pct > 0 ? "val-pos" : pct < 0 ? "val-neg" : "";
    return { text, cls, valid: true, percent: pct };
  }

  function formatPrice(value, status) {
    if (value === null || value === undefined || value === "" || status === "PRICE_UNAVAILABLE") {
      return { text: "Chưa có giá", cls: "text-muted", available: false };
    }
    const n = Number(value);
    if (!Number.isFinite(n)) return { text: "Chưa có giá", cls: "text-muted", available: false };
    return { text: n.toLocaleString("vi-VN", { maximumFractionDigits: 2 }), cls: "", available: true };
  }

  function formatSector(sector) {
    const label = sector && sector.label;
    const status = sector && sector.status;
    if (status === "AVAILABLE" && typeof label === "string" && label.trim()) {
      const folded = label.trim().toLowerCase();
      if (ENTITY_CLASS_VOCABULARY.includes(folded)) {
        return { text: "Chưa phân loại ngành", cls: "text-muted", available: false };
      }
      return { text: label, cls: "", available: true };
    }
    return { text: "Chưa phân loại ngành", cls: "text-muted", available: false };
  }

  function formatLiquidity(liquidity, execution) {
    const method = (liquidity && liquidity.method) || "";
    const value = liquidity && liquidity.research_value;
    if (value !== null && value !== undefined) {
      return { text: String(value), cls: "", kind: "numeric" };
    }
    if (method === "LIQUIDITY_RESEARCH_PROXY" || (liquidity && liquidity.status === "AVAILABLE")) {
      const extra = execution && execution.capacity_exact_status === "EXECUTION_CAPACITY_EXACT_BLOCKED"
        ? " · Chưa đủ dữ liệu cho quy mô lệnh chính xác"
        : "";
      return { text: `Proxy nghiên cứu${extra}`, cls: "screener-proxy", kind: "proxy" };
    }
    return { text: "Dữ liệu nghiên cứu", cls: "text-muted", kind: "status" };
  }

  function getValueFormat() {
    if (typeof window !== "undefined" && window.VSValueFormat) return window.VSValueFormat;
    if (typeof require === "function") {
      try { return require("./value-format.js"); } catch (err) { return null; }
    }
    return null;
  }

  function translateStatus(code) {
    const map = {
      LIQUIDITY_RESEARCH_PROXY: "Dữ liệu nghiên cứu",
      RESEARCH_PROXY: "Dữ liệu nghiên cứu",
      EXECUTION_CAPACITY_EXACT_BLOCKED: "Chưa đủ dữ liệu cho quy mô lệnh chính xác",
      NOT_APPLICABLE: "Không áp dụng",
      UNKNOWN: "Chưa đủ dữ liệu",
      UNAVAILABLE: "Chưa đủ dữ liệu",
      ABSENT: "Chưa có dữ liệu tài chính",
      AVAILABLE: "Có dữ liệu",
      READY: "Sẵn sàng nghiên cứu",
      CURRENT: "Hiện tại",
      STALE_BUT_RESEARCH_USABLE: "Cũ nhưng dùng được",
      STALE_NOT_USABLE_FOR_THIS_AXIS: "Cũ, không dùng cho trục này",
      MIXED: "Hỗn hợp",
      PRICE_UNAVAILABLE: "Chưa có giá",
      PRICE_AVAILABLE: "Có giá",
    };
    if (code === "READY") return "Sẵn sàng nghiên cứu";
    if (Object.prototype.hasOwnProperty.call(map, code)) return map[code];
    const vf = getValueFormat();
    if (vf && typeof vf.formatDomainState === "function" && code) {
      const domains = ["data_fitness", "liquidity_state", "freshness", "fundamental_state", "entity_type", "evidence_state", "structure_state"];
      for (let i = 0; i < domains.length; i++) {
        const formatted = vf.formatDomainState(code, domains[i]);
        if (formatted.known) return formatted.label;
      }
    }
    return code || "Chưa đủ dữ liệu";
  }

  function formatFinancial(financial) {
    if (!financial || financial.status === "ABSENT") {
      return { text: "Chưa có dữ liệu tài chính", cls: "text-muted" };
    }
    if (financial.current_research_ready) return { text: "Sẵn sàng nghiên cứu", cls: "" };
    if (financial.profitability_state) return { text: translateStatus(financial.profitability_state), cls: "" };
    return { text: translateStatus(financial.status || financial.fitness), cls: "" };
  }

  function formatFreshness(freshness) {
    const row = freshness && freshness.row;
    return { text: translateStatus(row || "UNKNOWN"), cls: row === "CURRENT" ? "" : "text-muted" };
  }

  function projectionRows(projection) {
    const cards = (projection && projection.cards) || {};
    return Object.keys(cards).sort().map((ticker) => {
      const card = cards[ticker];
      return Object.assign({ ticker: normalizeTicker(card.ticker || ticker) }, card);
    });
  }

  function matchesScreenerFilters(card, filters) {
    const f = filters || {};
    if (f.exchange && card.display_exchange !== f.exchange) return false;
    if (f.sector === "UNKNOWN") {
      if ((card.sector || {}).status === "AVAILABLE") return false;
    } else if (f.sector && (card.sector || {}).label !== f.sector) return false;
    if (f.stance && (card.research || {}).stance !== f.stance) return false;
    if (f.tactical && (card.tactical || {}).entry_state !== f.tactical) return false;
    if (f.financial === "AVAILABLE" && (card.financial_v2 || {}).status !== "AVAILABLE") return false;
    if (f.financial === "ABSENT" && (card.financial_v2 || {}).status !== "ABSENT") return false;
    if (f.liquidity === "PROXY" && (card.liquidity || {}).method !== "LIQUIDITY_RESEARCH_PROXY") return false;
    if (f.freshness === "CURRENT" && (card.freshness || {}).row !== "CURRENT") return false;
    if (f.freshness === "NOT_CURRENT" && (card.freshness || {}).row === "CURRENT") return false;
    if (f.query) {
      const q = String(f.query).trim().toUpperCase();
      const sector = ((card.sector || {}).label || "").toUpperCase();
      if (!card.ticker.includes(q) && !sector.includes(q)) return false;
    }
    return true;
  }

  function drawerIdentity(tableTicker, selectedTicker, workspaceCard) {
    const table = normalizeTicker(tableTicker);
    const selected = normalizeTicker(selectedTicker);
    const workspace = workspaceCard ? normalizeTicker(workspaceCard.ticker || selected) : selected;
    return {
      table,
      selected,
      workspace,
      drawer: selected,
      ok: Boolean(table) && table === selected && table === workspace,
    };
  }

  function validateProjection(payload) {
    return Boolean(
      payload &&
      payload.contract_version === CONTRACT_VERSION &&
      payload.cards &&
      typeof payload.cards === "object" &&
      Object.keys(payload.cards).length
    );
  }

  return {
    CONTRACT_VERSION, DATA_URL, JS_FALLBACK, WORKSPACE_URL, WORKSPACE_SCHEMA, ENTITY_CLASS_VOCABULARY,
    normalizeTicker, formatSessionPercent, formatPrice, formatSector, formatLiquidity, formatFinancial,
    formatFreshness, translateStatus, projectionRows, matchesScreenerFilters, drawerIdentity, validateProjection,
  };
});
