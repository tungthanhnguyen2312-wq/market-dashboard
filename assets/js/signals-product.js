(() => {
  "use strict";
  const DATA_URL = "data/investment_decision_workspace.json";
  const SCHEMA = "investment_decision_workspace_dashboard_projection/v1";
  const CANDLE_SIDECARS = Object.freeze({
    candlestick_patterns: "data/candlestick_patterns.json",
    candle_signals: "data/candle_signals.json",
    sector_heatmap: "data/sector_heatmap.json",
  });
  const SIDECAR_UNAVAILABLE = "OPTIONAL_CANDLE_SIGNAL_SIDECAR_UNAVAILABLE";
  const SIDECAR_STALE = "SIGNAL_SOURCE_SESSION_MISMATCH";
  const CANDLE_UNAVAILABLE_LABEL = "Chưa có dữ liệu mẫu hình nến phù hợp cho phiên hiện tại.";
  const esc = (value) => String(value ?? "—").replace(/[&<>"']/g, (c) => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]));

  function getValueFormat() {
    if (typeof window !== "undefined" && window.VSValueFormat) return window.VSValueFormat;
    if (typeof require === "function") {
      try { return require("./value-format.js"); } catch (err) { return null; }
    }
    return null;
  }
  function getCandlestickPatterns() {
    if (typeof window !== "undefined" && window.VSCandlestickPatterns) return window.VSCandlestickPatterns;
    if (typeof require === "function") {
      try { return require("./candlestick-patterns.js"); } catch (err) { return null; }
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
  function actionHtml(value) {
    const vf = getValueFormat();
    if (vf && typeof vf.formatDomainState === "function") {
      const entry = vf.formatDomainState(value, "entry_action");
      if (entry.known) return vf.visibleStateHtml(value, "entry_action");
      const readiness = vf.formatDomainState(value, "research_readiness");
      if (readiness.known) return vf.visibleStateHtml(value, "research_readiness");
    }
    return stateHtml(value, "entry_action");
  }
  const actionLabel = (value) => /BUY|SELL/i.test(String(value || "")) ? "CONDITIONAL_RESEARCH_STATE" : (value || "UNAVAILABLE");
  const freshness = (card) => Object.values(card.lineage?.per_axis_freshness || {}).some((value) => value !== "CURRENT") ? "STALE_AXIS_PRESENT" : "CURRENT";
  const records = (workspace) => Object.keys(workspace.cards || {}).sort().map((ticker) => {
    const card = workspace.cards[ticker];
    return {
      ticker,
      stance: card.research_stance || "UNAVAILABLE",
      state: card.entry_state || card.tactical?.primary_entry_state || "UNAVAILABLE",
      action: actionLabel(card.entry_action),
      tags: card.setup_tags || [],
      confirmation: card.confirmation?.status || "UNAVAILABLE",
      trigger: card.confirmation?.confirmation_trigger_state || "NOT_AVAILABLE",
      invalidation: card.invalidation?.technical?.status || card.invalidation?.fundamental?.status || "UNAVAILABLE",
      market: card.market_sector?.breadth_regime || "UNAVAILABLE",
      sector: card.market_sector?.sector_relative_context?.leadership_state || "UNAVAILABLE",
      liquidity: card.liquidity?.readiness || "UNAVAILABLE",
      freshness: freshness(card),
    };
  });
  const cohortStates = ["BREAKOUT_READY", "BASE_BUILDING", "EARLY_REVERSAL_CANDIDATE", "UPTREND_CONFIRMED", "SELLING_PRESSURE_EASING", "DISTRIBUTION_RISK", "BREAKDOWN_RISK"];
  const href = (ticker) => `investment-workspace.html?ticker=${encodeURIComponent(ticker)}`;

  function tagHtml(tags) {
    if (!tags || !tags.length) return esc("Chưa có đặc điểm");
    return tags.map((tag) => stateHtml(tag, "setup_tag")).join(" ");
  }
  function renderRowHtml(row) {
    return `<tr><td><a class="tactical-link" href="${href(row.ticker)}">${esc(row.ticker)}</a></td><td>${stateHtml(row.stance, "research_stance")}</td><td>${stateHtml(row.state, "tactical_state")}<div class="tactical-muted">${actionHtml(row.action)}</div></td><td>${tagHtml(row.tags)}</td><td>${stateHtml(row.confirmation, "confirmation_state")}</td><td>${stateHtml(row.trigger, "confirmation_state")}</td><td>${stateHtml(row.invalidation, "invalidation_state")}</td><td>${stateHtml(row.market, "data_fitness")}<div class="tactical-muted">${stateHtml(row.sector, "data_fitness")}</div></td><td>${stateHtml(row.liquidity, "liquidity_state")}</td><td>${stateHtml(row.freshness, "freshness")}</td></tr>`;
  }
  function renderRows(rows) {
    const state = document.getElementById("tactical-filter").value;
    const visible = rows.filter((row) => !state || row.state === state);
    document.getElementById("signals-rows").innerHTML = visible.map(renderRowHtml).join("");
    document.getElementById("signals-count").textContent = `${visible.length} / ${rows.length} mã đang hiển thị · sắp xếp theo mã, không phải xếp hạng.`;
  }

  function classifySidecarAvailability(httpOk, component, currentSession) {
    if (!httpOk) {
      return { status: "ABSENT_FROM_PUBLICATION", code: SIDECAR_UNAVAILABLE, count: null };
    }
    const session = component && component.source_session;
    const status = component && component.status;
    if (status === "STALE" || (session && currentSession && session !== currentSession)) {
      return {
        status: "PRESENT_BUT_STALE",
        code: ((component && component.reason_codes) || [])[0] || SIDECAR_STALE,
        count: null,
      };
    }
    if (status && status !== "CURRENT") {
      return { status: "ABSENT_FROM_PUBLICATION", code: SIDECAR_UNAVAILABLE, count: null };
    }
    return { status: "PRESENT_AND_SESSION_COMPATIBLE", code: null, count: null };
  }

  function candleUnavailableHtml(reasonCode) {
    const vf = getValueFormat();
    const details = vf && typeof vf.technicalDetailsHtml === "function"
      ? vf.technicalDetailsHtml(reasonCode || SIDECAR_UNAVAILABLE, "Chi tiết kỹ thuật")
      : `<details class="vs-tech-details"><summary>Chi tiết kỹ thuật</summary><pre class="cockpit-code">${esc(reasonCode || SIDECAR_UNAVAILABLE)}</pre></details>`;
    return `<div class="candle-empty" data-candle-availability="unavailable">${esc(CANDLE_UNAVAILABLE_LABEL)}${details}</div>`;
  }

  function patternLabel(registry, key, fallbackName) {
    const cp = getCandlestickPatterns();
    const info = (cp && typeof cp.lookupPatternInfo === "function")
      ? cp.lookupPatternInfo(registry, key)
      : (registry && registry[key]) || null;
    return (info && info.name_vi) || fallbackName || key;
  }

  function renderPatternRowHtml(row, registry) {
    const cp = getCandlestickPatterns();
    const key = row.pattern_key || "";
    const info = (cp && typeof cp.lookupPatternInfo === "function")
      ? (cp.lookupPatternInfo(registry, key) || {})
      : ((registry && registry[key]) || {});
    const nameVi = row.pattern_name_vi || info.name_vi || row.pattern_name || key;
    const nameEn = row.pattern_name || info.name || key;
    const description = info.description || "";
    const color = cp && typeof cp.colorTokenForPattern === "function" ? cp.colorTokenForPattern(key, row.direction) : "slate";
    const nameMarkup = cp && typeof cp.textTrigger === "function" ? cp.textTrigger(nameVi, description) : esc(nameVi);
    const direction = cp && typeof cp.directionLabel === "function" ? cp.directionLabel(row.direction, true) : labelOf(row.direction, "tactical_state");
    const smcKeys = row.smc || row.confirmations || [];
    const smcMarkup = (smcKeys || []).map((item) => {
      if (cp && typeof cp.smcNameTrigger === "function" && cp.smcInfo && cp.smcInfo(item)) return cp.smcNameTrigger(item);
      return esc(item);
    }).join(" ");
    return `<tr data-pattern-key="${esc(key)}" title="${esc(key)}"><td><a class="tactical-link" href="${href(row.ticker)}">${esc(row.ticker)}</a></td><td><strong class="pattern-name-vi pattern-color-${esc(color)}">${nameMarkup}</strong><br><small class="pattern-muted pattern-name-en">${esc(nameEn)}</small></td><td><span class="pattern-direction ${esc(row.direction || "")}">${esc(direction)}</span></td><td>${smcMarkup || '<span class="pattern-muted">–</span>'}</td></tr>`;
  }

  function renderCompatiblePatterns(snapshot) {
    const registry = (snapshot && snapshot.registry) || {};
    const rows = ((snapshot && snapshot.patterns) || []).filter((row) => row && row.timeframe === "1D" && row.bars_ago === 0).slice(0, 80);
    if (!rows.length) return candleUnavailableHtml(SIDECAR_UNAVAILABLE);
    const body = rows.map((row) => renderPatternRowHtml(row, registry)).join("");
    return `<div class="tactical-wrap" tabindex="0" aria-label="Bảng mẫu hình nến có thể cuộn ngang"><table class="tactical-table"><thead><tr><th>Mã</th><th>Mẫu hình</th><th>Hướng</th><th>SMC</th></tr></thead><tbody>${body}</tbody></table></div>`;
  }

  async function probeSidecar(path) {
    try {
      const response = await fetch(path, { cache: "no-store" });
      if (!response.ok) return { ok: false, payload: null };
      return { ok: true, payload: await response.json() };
    } catch (err) {
      return { ok: false, payload: null };
    }
  }

  async function renderCandlePanel(workspace) {
    const host = document.getElementById("candle-panel");
    if (!host) return;
    const currentSession = workspace && workspace.as_of_session;
    const buildInfo = typeof window !== "undefined" ? window.BUILD_INFO : null;
    const component = buildInfo && buildInfo.domains && buildInfo.domains.signals && buildInfo.domains.signals.components
      ? buildInfo.domains.signals.components.candlestick_patterns
      : null;
    const probed = await probeSidecar(CANDLE_SIDECARS.candlestick_patterns);
    const availability = classifySidecarAvailability(probed.ok, component, currentSession);
    if (availability.status !== "PRESENT_AND_SESSION_COMPATIBLE") {
      host.innerHTML = candleUnavailableHtml(availability.code);
      return;
    }
    host.innerHTML = renderCompatiblePatterns(probed.payload);
  }

  function bindTabs() {
    const tabs = [
      { button: "signals-tab-tactical", panel: "signals-panel-tactical" },
      { button: "signals-tab-candles", panel: "signals-panel-candles" },
    ];
    tabs.forEach((item) => {
      const button = document.getElementById(item.button);
      if (!button) return;
      button.addEventListener("click", () => {
        tabs.forEach((other) => {
          const otherButton = document.getElementById(other.button);
          const otherPanel = document.getElementById(other.panel);
          const selected = other.button === item.button;
          if (otherButton) otherButton.setAttribute("aria-selected", String(selected));
          if (otherPanel) otherPanel.hidden = !selected;
        });
      });
    });
  }

  function render(workspace) {
    const rows = records(workspace);
    const counts = rows.reduce((out, row) => ({ ...out, [row.state]: (out[row.state] || 0) + 1 }), {});
    const vf = getValueFormat();
    document.getElementById("signals-content").hidden = false;
    document.getElementById("signals-meta").innerHTML = `Phiên tín hiệu kỹ thuật được giữ lại ${esc(workspace.as_of_session)} · ${rows.length.toLocaleString("vi-VN")} mã${vf && vf.provenanceHtml ? vf.provenanceHtml(workspace.producer_artifact_identity) : ""}`;
    document.getElementById("tactical-cohorts").innerHTML = cohortStates.map((state) => `<a class="tactical-card" href="#tactical-table" data-state="${esc(state)}" title="${esc(state)}"><span>${esc(labelOf(state, "tactical_state"))}</span><strong>${counts[state] || 0}</strong><small>Mở Không gian quyết định để xem thẻ đầy đủ</small></a>`).join("");
    const filter = document.getElementById("tactical-filter");
    Object.keys(counts).sort().forEach((state) => {
      const option = document.createElement("option");
      option.value = state;
      option.textContent = `${labelOf(state, "tactical_state")} (${counts[state]})`;
      filter.append(option);
    });
    filter.addEventListener("change", () => renderRows(rows));
    renderRows(rows);
    bindTabs();
    renderCandlePanel(workspace);
  }

  function error(message) {
    const el = document.getElementById("signals-error");
    el.hidden = false;
    el.textContent = message;
  }

  if (typeof document !== "undefined") {
    fetch(DATA_URL, { cache: "no-store" }).then((response) => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    }).then((workspace) => {
      if (workspace.schema_version !== SCHEMA || !workspace.cards || !Object.keys(workspace.cards).length) {
        throw new Error("invalid or empty workspace artifact");
      }
      render(workspace);
    }).catch((reason) => {
      error(`Không tải được tín hiệu kỹ thuật cho phiên hiện tại. CURRENT_PRODUCT_ARTIFACT_NOT_PUBLISHED: ${reason.message}`);
    });
  }

  const api = {
    DATA_URL, SCHEMA, CANDLE_SIDECARS, SIDECAR_UNAVAILABLE, CANDLE_UNAVAILABLE_LABEL,
    actionLabel, records, cohortStates, renderRowHtml, labelOf, actionHtml,
    classifySidecarAvailability, candleUnavailableHtml, patternLabel, renderPatternRowHtml,
  };
  if (typeof window !== "undefined") window.StockLookupSignals = api;
  if (typeof module !== "undefined") module.exports = api;
})();
