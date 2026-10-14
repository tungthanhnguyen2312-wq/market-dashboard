(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.VSWorkspaceCardPresentation = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  // One presentation implementation for Home's four notable cards and the Workspace
  // decision surface. Labels stay Producer domain lookups. This module does not
  // recompute eligibility, prices, or postures.

  const POSITION_CONDITIONAL_POSTURES = new Set(["HOLD", "HOLD_DO_NOT_ADD", "REDUCE"]);
  const CONSTRUCTIVE_POSTURES = new Set(["INITIATE_ON_BREAKOUT", "ACCUMULATE_ON_RETEST", "EARLY_WATCH"]);
  const POSTURE_UNAVAILABLE_TEXT = "Chưa có tư thế hành động chuẩn hóa cho phiên dữ liệu này";

  function getValueFormat() {
    if (typeof window !== "undefined" && window.VSValueFormat) return window.VSValueFormat;
    if (typeof require === "function") {
      try { return require("./value-format.js"); } catch (err) { return null; }
    }
    return null;
  }

  function unavailableLabel(value) {
    return (value === null || value === undefined || value === "") ? "UNAVAILABLE" : value;
  }

  function escHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, (ch) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
    }[ch]));
  }

  function formatWorkspaceState(value, domain) {
    const vf = getValueFormat();
    if (domain === "rule_condition" && vf && typeof vf.formatKnownLabel === "function") {
      return vf.formatKnownLabel(value, domain);
    }
    if (vf && typeof vf.formatDomainState === "function") return vf.formatDomainState(value, domain).label;
    return unavailableLabel(value);
  }

  function evidenceCurrencyClass(value) {
    const raw = String(value || "");
    if (raw.indexOf("LAST_TRADE_AS_OF:") === 0) return "LAST_TRADE_AS_OF";
    return (raw === "CURRENT_SESSION" || raw === "NO_CURRENT_EVIDENCE") ? raw : "UNKNOWN";
  }

  function evidenceCurrencyLabel(value) {
    const vf = getValueFormat();
    if (vf && typeof vf.formatEvidenceCurrency === "function") return vf.formatEvidenceCurrency(value);
    return unavailableLabel(value);
  }

  function evidenceCurrencyHtml(value) {
    const cls = evidenceCurrencyClass(value);
    const vf = getValueFormat();
    const tone = (vf && typeof vf.getSemanticTone === "function") ? vf.getSemanticTone(cls, "evidence_currency") : "neutral";
    return `<span class="cockpit-state tone-${tone} ws-evidence-currency" data-evidence-currency="${escHtml(cls)}" data-tone="${tone}" title="${escHtml(value || "")}">${escHtml(evidenceCurrencyLabel(value))}</span>`;
  }

  function actionPostureLabel(card) {
    const c = card || {};
    const posture = c.research_action_posture;
    if (!posture) return POSTURE_UNAVAILABLE_TEXT;
    if (evidenceCurrencyClass(c.evidence_currency) === "NO_CURRENT_EVIDENCE" && posture === "WAIT_FOR_CONFIRMATION") {
      return formatWorkspaceState("NO_CURRENT_EVIDENCE", "evidence_currency");
    }
    const label = formatWorkspaceState(posture, "research_action_posture");
    const position = ((c.position_context || {}).position_state) || "UNKNOWN_POSITION_NOT_SUPPLIED";
    const held = position === "HELD" || position === "HELD_ABOVE_POLICY_CAP";
    const conditional = POSITION_CONDITIONAL_POSTURES.has(posture) && !held;
    return conditional ? `${label} — nếu đang nắm giữ` : label;
  }

  function actionPostureHtml(card) {
    const c = card || {};
    const raw = c.research_action_posture || "UNAVAILABLE";
    const violating = evidenceCurrencyClass(c.evidence_currency) === "NO_CURRENT_EVIDENCE" && raw === "WAIT_FOR_CONFIRMATION";
    const vf = getValueFormat();
    const tone = violating ? "neutral" : ((vf && typeof vf.getSemanticTone === "function") ? vf.getSemanticTone(raw, "research_action_posture") : "neutral");
    return `<span class="cockpit-state tone-${tone} ws-action-posture" data-action-posture="${escHtml(raw)}" data-tone="${tone}"${violating ? ' data-contract-violation="NO_CURRENT_EVIDENCE_WAIT"' : ""} title="${escHtml(raw)}">${escHtml(actionPostureLabel(c))}</span>`;
  }

  function notableTickers(cards) {
    const states = ["BREAKOUT_READY", "EARLY_REVERSAL_CANDIDATE", "BASE_BUILDING"];
    return Object.keys(cards || {}).filter((ticker) => {
      const card = cards[ticker];
      return CONSTRUCTIVE_POSTURES.has(card.research_action_posture) || (states.includes(card.entry_state) && card.research_action_posture !== "AVOID" && card.research_action_posture !== "REDUCE");
    }).slice(0, 4);
  }

  function compactReasons(card, limit) {
    const reasons = (((card || {}).why || {}).deterministic_reasons || []).slice(0, limit || 3);
    return reasons.length ? reasons.map((reason) => formatWorkspaceState(reason, "rule_condition")) : ["Chưa có lý do ngắn được giữ lại"];
  }

  return {
    POSITION_CONDITIONAL_POSTURES,
    CONSTRUCTIVE_POSTURES,
    POSTURE_UNAVAILABLE_TEXT,
    escHtml,
    formatWorkspaceState,
    evidenceCurrencyClass,
    evidenceCurrencyLabel,
    evidenceCurrencyHtml,
    actionPostureLabel,
    actionPostureHtml,
    notableTickers,
    compactReasons,
  };
});
