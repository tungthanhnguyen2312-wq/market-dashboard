(() => {
  "use strict";
  const DATA_URL = "data/investment_decision_workspace.json";
  const SCHEMA = "investment_decision_workspace_dashboard_projection/v1";
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
    const label = labelOf(value, domain);
    if (vf && typeof vf.visibleStateHtml === "function") return vf.visibleStateHtml(value, domain);
    return `<span data-state="${esc(raw)}" data-domain="${esc(domain || "")}" title="${esc(raw)}">${esc(label)}</span>`;
  }

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
  const CONFLICT_REASON_LABELS = {
    "tactical constructive / valuation expensive": "Trạng thái kỹ thuật mang tính xây dựng / định giá đắt tương đối",
    "profitable / tactical adverse": "Có lợi nhuận / trạng thái kỹ thuật bất lợi",
    "early reversal / distribution risk": "Ứng viên đảo chiều sớm / rủi ro phân phối",
    "loss or turnaround / constructive tape": "Đang lỗ hoặc chuyển biến lợi nhuận / diễn biến kỹ thuật mang tính xây dựng",
  };
  const conflictReasons = (row) => {
    const reasons = [];
    if (["BREAKOUT_READY", "UPTREND_CONFIRMED", "EARLY_REVERSAL_CANDIDATE"].includes(row.tactical) && row.valuation === "EXPENSIVE_RELATIVE_RESEARCH") reasons.push("tactical constructive / valuation expensive");
    if (row.fundamental === "PROFITABLE" && ["DOWNTREND", "DISTRIBUTION_RISK", "BREAKDOWN_RISK"].includes(row.tactical)) reasons.push("profitable / tactical adverse");
    if (row.tactical === "EARLY_REVERSAL_CANDIDATE" && row.tags.some((tag) => /DISTRIBUTION|DETERIORATION/.test(tag))) reasons.push("early reversal / distribution risk");
    if (/LOSS|TURNAROUND/.test(row.fundamental) && ["BREAKOUT_READY", "UPTREND_CONFIRMED", "EARLY_REVERSAL_CANDIDATE"].includes(row.tactical)) reasons.push("loss or turnaround / constructive tape");
    return reasons;
  };
  function conflictReasonLabel(reason) {
    return CONFLICT_REASON_LABELS[reason] || reason;
  }
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
  const COVERAGE_AXIS_LABELS = {
    fundamental: "Nền tảng doanh nghiệp",
    valuation: "Định giá",
    tactical: "Trạng thái kỹ thuật",
    liquidity: "Thanh khoản",
    stale: "Trục dữ liệu đã cũ",
  };
  function workspaceHref(ticker) { return `investment-workspace.html?ticker=${encodeURIComponent(ticker)}`; }
  function methodLabel(methods) {
    return methods && methods.length ? methods.join(", ") : "Chưa có phương pháp hỗ trợ";
  }
  function renderRowHtml(row) {
    return `<tr><td><a class="product-link" href="${workspaceHref(row.ticker)}">${esc(row.ticker)}</a><div class="product-muted">${esc(row.sector)}</div></td><td>${stateHtml(row.stance, "research_stance")}</td><td>${stateHtml(row.tactical, "tactical_state")}<div class="product-muted">${stateHtml(row.action, "entry_action")}</div></td><td>${stateHtml(row.fundamental, "fundamental_state")}</td><td>${stateHtml(row.valuation, "valuation_state")}<div class="product-muted">${esc(methodLabel(row.methods))}</div></td><td>${stateHtml(row.liquidity, "liquidity_state")}</td><td>${stateHtml(row.catalyst, "evidence_state")}</td><td>${stateHtml(row.confirmation, "confirmation_state")}<div class="product-muted">điều kiện kích hoạt: ${stateHtml(row.trigger, "confirmation_state")}</div></td><td>${stateHtml(row.invalidation, "invalidation_state")}</td><td>${stateHtml(row.freshness, "freshness")}</td></tr>`;
  }
  function renderRows(rows) {
    const stance = document.getElementById("stance-filter").value;
    const tactical = document.getElementById("tactical-filter").value;
    const visible = rows.filter((row) => (!stance || row.stance === stance) && (!tactical || row.tactical === tactical));
    document.getElementById("analysis-rows").innerHTML = visible.map(renderRowHtml).join("");
    document.getElementById("analysis-count").textContent = `${visible.length} / ${rows.length} thẻ mã được hiển thị · sắp xếp alphabet, không phải xếp hạng.`;
  }
  function optionSpec(value, domain) {
    return { value, text: labelOf(value, domain) };
  }
  function addOptions(id, list, domain) {
    const element = document.getElementById(id);
    list.forEach((value) => {
      const spec = optionSpec(value, domain);
      const option = document.createElement("option");
      option.value = spec.value;
      option.textContent = spec.text;
      element.append(option);
    });
  }
  function render(workspace) {
    const rows = analysisRows(workspace); const stanceCounts = countBy(rows, "stance"); const tacticalCounts = countBy(rows, "tactical"); const dataCoverage = coverage(rows);
    document.getElementById("analysis-content").hidden = false;
    document.getElementById("analysis-meta").textContent = `Phiên quyết định được giữ lại ${workspace.as_of_session} · ${rows.length.toLocaleString("vi-VN")} thẻ · ${workspace.producer_artifact_identity}`;
    document.getElementById("analysis-summary").innerHTML = [
      `Phạm vi thị trường<b>${rows.length.toLocaleString("vi-VN")}</b>thẻ quyết định`,
      `Tư thế nghiên cứu<b>${Object.keys(stanceCounts).length}</b>nhóm nghiên cứu`,
      `Trạng thái kỹ thuật<b>${Object.keys(tacticalCounts).length}</b>trạng thái được giữ lại`,
      `Trục dữ liệu đã cũ<b>${dataCoverage.stale.toLocaleString("vi-VN")}</b>nêu rõ, không ép về hiện tại`,
    ].map((html) => `<div class="product-kpi">${html}</div>`).join("");
    document.getElementById("stance-cohorts").innerHTML = Object.entries(stanceCounts).sort().map(([name, total]) => `<span class="product-chip">${stateHtml(name, "research_stance")} · ${total}</span>`).join("");
    document.getElementById("coverage-summary").innerHTML = Object.entries(dataCoverage).map(([axis, total]) => `<span class="product-chip">${esc(COVERAGE_AXIS_LABELS[axis] || axis)}: ${total}/${rows.length}</span>`).join("");
    const conflicts = rows.map((row) => ({row, reasons: conflictReasons(row)})).filter((item) => item.reasons.length);
    document.getElementById("conflicting-evidence").innerHTML = conflicts.length ? `<div class="product-chips">${conflicts.slice(0, 40).map(({row, reasons}) => `<a class="product-chip product-link" href="${workspaceHref(row.ticker)}">${esc(row.ticker)} · ${esc(reasons.map(conflictReasonLabel).join("; "))}</a>`).join("")}</div><p class="product-muted mt-3 mb-0">${conflicts.length} tổ hợp xung đột được nêu rõ; không áp dụng điểm tổng.</p>` : '<p class="product-muted mb-0">Không có tổ hợp xung đột đã cấu hình trong phiên được giữ lại này.</p>';
    addOptions("stance-filter", Object.keys(stanceCounts).sort(), "research_stance");
    addOptions("tactical-filter", Object.keys(tacticalCounts).sort(), "tactical_state");
    document.getElementById("stance-filter").addEventListener("change", () => renderRows(rows));
    document.getElementById("tactical-filter").addEventListener("change", () => renderRows(rows));
    renderRows(rows);
  }
  function showError(message) { const error = document.getElementById("analysis-error"); error.hidden = false; error.textContent = message; }
  if (typeof document !== "undefined") fetch(DATA_URL, {cache:"no-store"}).then((response) => { if (!response.ok) throw new Error(`HTTP ${response.status}`); return response.json(); }).then((workspace) => { if (workspace.schema_version !== SCHEMA || !workspace.cards || !Object.keys(workspace.cards).length) throw new Error("invalid or empty workspace artifact"); render(workspace); }).catch((error) => showError(`CURRENT_PRODUCT_ARTIFACT_NOT_PUBLISHED: ${error.message}. Hãy công bố artifact Investment Decision Workspace đã được kiểm định.`));
  const api = {DATA_URL, SCHEMA, record, analysisRows, coverage, conflictReasons, conflictReasonLabel, renderRowHtml, labelOf, optionSpec}; if (typeof window !== "undefined") window.StockLookupAnalysis = api; if (typeof module !== "undefined") module.exports = api;
})();
