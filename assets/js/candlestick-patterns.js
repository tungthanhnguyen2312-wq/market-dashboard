(function () {
  "use strict";

  const ALLOWED_TIMEFRAMES = new Set(["1D", "1W", "1M"]);
  const MAX_RENDERED_ROWS = 500;
  const $ = (id) => document.getElementById(id);
  const esc = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[char]));
  const number = (value, digits = 1) => value === null || value === undefined || value === "" || !Number.isFinite(Number(value))
    ? "–" : Number(value).toLocaleString("vi-VN", { maximumFractionDigits: digits });
  const textDirection = { bullish: "Tăng", bearish: "Giảm", neutral: "Trung tính" };
  const confirmationLabels = {
    near_support: "Gần hỗ trợ", near_resistance: "Gần kháng cự", bullish_order_block: "OB tăng",
    bearish_order_block: "OB giảm", bullish_fvg: "FVG tăng", bearish_fvg: "FVG giảm",
    volume_confirmation: "Khối lượng xác nhận", normal_volume: "Khối lượng bình thường",
    above_sma200: "Trên SMA200", below_sma200: "Dưới SMA200", rs_strong: "RS mạnh",
    bollinger_lower_band: "Biên Bollinger dưới", bollinger_upper_band: "Biên Bollinger trên",
    macd_confirmed: "MACD xác nhận", rsi_oversold: "RSI quá bán", rsi_overbought: "RSI quá mua",
  };
  const warningLabels = {
    low_liquidity: "Thanh khoản thấp", weak_volume: "Khối lượng yếu", margin_warning: "Cảnh báo margin",
    counter_trend: "Ngược xu hướng", below_sma200: "Dưới SMA200",
    above_sma200_against_bearish_pattern: "Mẫu giảm nhưng trên SMA200", insufficient_history: "Thiếu lịch sử",
    incomplete_period: "Kỳ chưa đóng", unconfirmed_pattern: "Chưa xác nhận", conflicting_smc: "SMC xung đột",
    conflicting_indicator: "Chỉ báo xung đột", missing_volume_context: "Thiếu nền khối lượng",
    zero_or_missing_volume: "Khối lượng bằng 0/thiếu",
    stale_ticker_data: "Dữ liệu mã chưa cập nhật đến phiên quét",
  };

  let payload = null;
  let rows = [];
  let sortKey = "confidence_score";
  let sortDirection = "desc";

  function setState(message, kind = "") {
    const el = $("pattern-state");
    if (!el) return;
    el.textContent = message;
    el.className = "pattern-state" + (kind ? ` ${kind}` : "");
  }

  function validateSnapshot(data) {
    if (!data || data.schema_version !== 1 || !Array.isArray(data.patterns) || !Array.isArray(data.timeframes)) {
      throw new Error("invalid candlestick snapshot schema");
    }
    if (data.timeframes.some((tf) => !ALLOWED_TIMEFRAMES.has(tf))) throw new Error("unsupported timeframe in snapshot");
    data.patterns.forEach((row) => {
      if (!row || !ALLOWED_TIMEFRAMES.has(row.timeframe) || !["completed", "forming"].includes(row.status)) {
        throw new Error("invalid candlestick row");
      }
    });
    return data;
  }

  async function loadSnapshot() {
    try {
      const response = await fetch("data/candlestick_patterns.json", { cache: "no-store" });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return validateSnapshot(await response.json());
    } catch (error) {
      if (window.CANDLESTICK_PATTERNS) return validateSnapshot(window.CANDLESTICK_PATTERNS);
      console.error("Candlestick snapshot load failed", error);
      throw error;
    }
  }

  function stars(count, score) {
    const filled = '<svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor"><path d="m12 2.8 2.8 5.7 6.3.9-4.55 4.43 1.08 6.27L12 17.14 6.37 20.1l1.08-6.27L2.9 9.4l6.3-.9L12 2.8Z"/></svg>';
    const empty = '<svg class="empty-star" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="m12 2.8 2.8 5.7 6.3.9-4.55 4.43 1.08 6.27L12 17.14 6.37 20.1l1.08-6.27L2.9 9.4l6.3-.9L12 2.8Z"/></svg>';
    return `<span class="pattern-stars" role="img" aria-label="Độ tin cậy ${count} trên 3">${filled.repeat(count)}${empty.repeat(3 - count)}</span> ${number(score, 0)}`;
  }

  function tags(values, type) {
    return `<div class="pattern-tags">${(values || []).map((key) => {
      const label = type === "warning" ? (warningLabels[key] || key) : (confirmationLabels[key] || key);
      return `<span class="pattern-tag ${type === "warning" ? "warning" : ""}">${esc(label)}</span>`;
    }).join("") || '<span class="pattern-muted">–</span>'}</div>`;
  }

  function rowHtml(row) {
    const changeClass = Number(row.change_pct) > 0 ? "pattern-positive" : Number(row.change_pct) < 0 ? "pattern-negative" : "";
    const statusText = row.status === "forming" ? "Đang hình thành · Chưa xác nhận" : "Hoàn chỉnh";
    const meta = row.pattern_metadata || {};
    return `<tr class="pattern-row js-company-row" tabindex="0" data-ticker="${esc(row.ticker)}">
      <td><strong>${esc(row.ticker)}</strong></td>
      <td title="${esc(meta.description || "")}"><strong>${esc(row.pattern_name)}</strong><br><small class="pattern-muted">${esc(row.pattern_name_vi || "")}</small></td>
      <td><span class="pattern-direction ${esc(row.direction)}">${esc(textDirection[row.direction] || row.direction)}</span></td>
      <td><strong>${esc(row.timeframe)}</strong></td>
      <td>${stars(Number(row.confidence_stars) || 0, row.confidence_score)}</td>
      <td><span class="pattern-status ${esc(row.status)}" title="${row.status === "forming" ? "Kỳ chưa đóng" : "Kỳ đã đóng"}">${statusText}</span></td>
      <td>${number(row.bars_ago, 0)}</td>
      <td>${esc(row.detected_at || "–")}</td>
      <td>${number(row.close, 0)}</td>
      <td class="${changeClass}">${number(row.change_pct, 2)}${row.change_pct === null ? "" : "%"}</td>
      <td class="optional-sm">${number(row.rs_rating, 0)}</td>
      <td class="optional-sm">${number(row.rel_vol, 2)}</td>
      <td class="optional-md">${number(row.gtgd20_ty, 1)}</td>
      <td class="optional-md">${esc(row.exchange || "–")}<br><small class="pattern-muted">${esc(row.industry || "–")}</small></td>
      <td class="optional-md">${tags(row.confirmations, "confirmation")}</td>
      <td class="optional-md">${tags(row.warnings, "warning")}</td>
    </tr>`;
  }

  function filters() {
    const maxBars = Number($("pattern-bars")?.value || 999999);
    return {
      ticker: ($("pattern-ticker")?.value || "").trim().toUpperCase(),
      timeframe: $("pattern-timeframe")?.value || "all",
      direction: $("pattern-direction")?.value || "all",
      status: $("pattern-status-filter")?.value || "all",
      confidence: Number($("pattern-confidence")?.value || 0), maxBars,
      exchange: $("pattern-exchange")?.value || "all", industry: $("pattern-industry")?.value || "all",
      liquid: Boolean($("pattern-liquid")?.checked), marginFree: Boolean($("pattern-margin-free")?.checked),
      smc: Boolean($("pattern-smc")?.checked),
    };
  }

  function filteredRows() {
    const f = filters();
    const result = rows.filter((row) => (!f.ticker || String(row.ticker).toUpperCase().includes(f.ticker))
      && (f.timeframe === "all" || row.timeframe === f.timeframe)
      && (f.direction === "all" || row.direction === f.direction)
      && (f.status === "all" || row.status === f.status)
      && Number(row.confidence_stars || 0) >= f.confidence && Number(row.bars_ago) <= f.maxBars
      && (f.exchange === "all" || row.exchange === f.exchange) && (f.industry === "all" || row.industry === f.industry)
      && (!f.liquid || !(row.warnings || []).includes("low_liquidity"))
      && (!f.marginFree || !(row.warnings || []).includes("margin_warning"))
      && (!f.smc || (row.smc || []).length > 0));
    result.sort((a, b) => {
      let av = a[sortKey], bv = b[sortKey];
      if (sortKey === "timeframe") { av = ["1D", "1W", "1M"].indexOf(av); bv = ["1D", "1W", "1M"].indexOf(bv); }
      const comparison = typeof av === "string" ? av.localeCompare(String(bv), "vi") : (Number(av ?? -Infinity) - Number(bv ?? -Infinity));
      return sortDirection === "asc" ? comparison : -comparison;
    });
    return result;
  }

  function renderTable() {
    const filtered = filteredRows();
    const body = $("pattern-table-body");
    if (!body) return;
    body.innerHTML = filtered.slice(0, MAX_RENDERED_ROWS).map(rowHtml).join("");
    if (!filtered.length) setState("Không có mẫu trong phiên/khoảng quét phù hợp bộ lọc.");
    else setState(`${number(filtered.length, 0)} kết quả${filtered.length > MAX_RENDERED_ROWS ? ` · đang hiển thị ${number(MAX_RENDERED_ROWS, 0)} dòng đầu` : ""}.`);
    saveFilters();
  }

  function renderSummary() {
    const summary = payload.summary || {};
    const values = [summary.total_patterns, summary.bullish, summary.bearish, summary.neutral, summary.forming, summary.completed];
    ["total", "bullish", "bearish", "neutral", "forming", "completed"].forEach((key, index) => {
      const el = $(`pattern-summary-${key}`); if (el) el.textContent = number(values[index], 0);
    });
    const generated = $("pattern-generated");
    if (generated) generated.textContent = payload.generated_at ? new Date(payload.generated_at).toLocaleString("vi-VN") : "–";
  }

  function populateSelect(id, values) {
    const select = $(id); if (!select) return;
    values.filter(Boolean).sort((a, b) => String(a).localeCompare(String(b), "vi")).forEach((value) => {
      const option = document.createElement("option"); option.value = value; option.textContent = value; select.appendChild(option);
    });
  }

  function saveFilters() {
    try {
      const state = {};
      ["pattern-ticker", "pattern-timeframe", "pattern-direction", "pattern-status-filter", "pattern-confidence", "pattern-bars", "pattern-exchange", "pattern-industry"].forEach((id) => { if ($(id)) state[id] = $(id).value; });
      ["pattern-liquid", "pattern-margin-free", "pattern-smc"].forEach((id) => { if ($(id)) state[id] = $(id).checked; });
      localStorage.setItem("stocklookup:candlestick-filters", JSON.stringify(state));
    } catch (_) { /* storage may be disabled */ }
  }

  function restoreFilters() {
    try {
      const state = JSON.parse(localStorage.getItem("stocklookup:candlestick-filters") || "{}");
      Object.entries(state).forEach(([id, value]) => { if ($(id)) $(id)[$(id).type === "checkbox" ? "checked" : "value"] = value; });
    } catch (_) { /* ignore invalid local state */ }
  }

  function resetFilters() {
    ["pattern-ticker", "pattern-exchange", "pattern-industry", "pattern-timeframe", "pattern-direction", "pattern-status-filter"].forEach((id) => { if ($(id)) $(id).value = id.includes("ticker") ? "" : "all"; });
    if ($("pattern-confidence")) $("pattern-confidence").value = "2";
    if ($("pattern-bars")) $("pattern-bars").value = "12";
    ["pattern-liquid", "pattern-margin-free", "pattern-smc"].forEach((id) => { if ($(id)) $(id).checked = false; });
    renderTable();
  }

  function setupTabs() {
    document.querySelectorAll(".signal-tab").forEach((tab) => tab.addEventListener("click", () => {
      document.querySelectorAll(".signal-tab").forEach((item) => item.setAttribute("aria-selected", String(item === tab)));
      document.querySelectorAll(".signal-tab-panel").forEach((panel) => { panel.hidden = panel.id !== tab.getAttribute("aria-controls"); });
      location.hash = tab.dataset.hash;
    }));
    if (location.hash === "#candlestick-patterns") $("signals-tab-patterns")?.click();
  }

  function openCompany(row) {
    if (window.VSCompanyPanel?.open) window.VSCompanyPanel.open(row);
  }

  function bindEvents() {
    document.querySelectorAll("#pattern-filters input, #pattern-filters select").forEach((input) => input.addEventListener("input", renderTable));
    $("pattern-reset")?.addEventListener("click", resetFilters);
    document.querySelectorAll(".pattern-sort").forEach((button) => button.addEventListener("click", () => {
      const key = button.dataset.sort;
      sortDirection = sortKey === key && sortDirection === "desc" ? "asc" : "desc";
      sortKey = key; renderTable();
    }));
    $("pattern-table-body")?.addEventListener("click", (event) => {
      const tr = event.target.closest("tr[data-ticker]");
      if (!tr) return;
      openCompany(rows.find((row) => row.ticker === tr.dataset.ticker) || { ticker: tr.dataset.ticker });
    });
    $("pattern-table-body")?.addEventListener("keydown", (event) => {
      if (!["Enter", " "].includes(event.key)) return;
      const tr = event.target.closest("tr[data-ticker]"); if (!tr) return;
      event.preventDefault(); openCompany(rows.find((row) => row.ticker === tr.dataset.ticker) || { ticker: tr.dataset.ticker });
    });
  }

  async function init() {
    setupTabs();
    setState("Đang tải dữ liệu mẫu hình nến…");
    try {
      payload = await loadSnapshot(); rows = payload.patterns.slice();
      populateSelect("pattern-exchange", [...new Set(rows.map((row) => row.exchange))]);
      populateSelect("pattern-industry", [...new Set(rows.map((row) => row.industry))]);
      restoreFilters(); renderSummary(); bindEvents(); renderTable();
      const missing = ["1D", "1W", "1M"].filter((tf) => !payload.timeframes.includes(tf));
      const scanDate = payload.scan_date ? new Date(`${payload.scan_date}T00:00:00`) : null;
      const stale = scanDate && (Date.now() - scanDate.getTime()) > 7 * 86400000;
      if (missing.length) setState(`Snapshot chỉ có một phần dữ liệu; thiếu ${missing.join(", ")}.`, "is-warning");
      else if (stale) setState(`Snapshot cũ · phiên ${payload.scan_date}.`, "is-warning");
    } catch (_) {
      setState("Không thể tải dữ liệu mẫu hình nến.", "is-warning");
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
}());
