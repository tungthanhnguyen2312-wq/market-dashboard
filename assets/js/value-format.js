/* ============================================================
 * VNSTOCK — assets/js/value-format.js
 * Centralized presentation layer: number formatting, CSS classes,
 * exchange aliases, chart theme, and centralized Vietnamese localization.
 *
 * Supports both browser (top-level / window.VSValueFormat)
 * and Node.js test runner (module.exports).
 * ============================================================ */

(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
  }
  if (root) {
    root.VSValueFormat = api;
    // Also expose top-level helpers for backward compatibility with existing inline scripts
    Object.assign(root, api);
  }
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  /* Trả về class CSS (khớp .val-pos/.val-neg trong style.css) theo dấu của value.
     value = 0 hoặc không phải số hợp lệ -> "" (chữ màu mặc định, tức trắng). */
  function signClass(value) {
    const v = typeof value === "number" ? value : parseFloat(value);
    if (isNaN(v)) return "";
    return v > 0 ? "val-pos" : v < 0 ? "val-neg" : "";
  }

  /* Chuẩn sàn dùng chung. Backend lịch sử lưu HSX (mã của nguồn VCI), còn giao diện
     luôn dùng tên chính thức HOSE. Không sửa theo từng ticker và không rải mapping
     ở từng màn hình. */
  const EXCHANGE_ALIASES = Object.freeze({
    HSX: "HSX",
    HOSE: "HSX",
    HCM: "HSX",
    HNX: "HNX",
    UPCOM: "UPCOM",
    UPCoM: "UPCOM",
    DELISTED: "DELISTED",
  });

  function normalizeExchange(value) {
    const raw = String(value ?? "").trim();
    if (!raw) return "";
    const upper = raw.toUpperCase();
    return EXCHANGE_ALIASES[upper] || upper;
  }

  function displayExchange(value) {
    const normalized = normalizeExchange(value);
    return normalized === "HSX" ? "HOSE" : normalized;
  }

  /* Màu dùng trong canvas Chart.js (không đọc được CSS var() trong canvas) */
  const CHART_COLORS = {
    pos: "rgba(39, 230, 161, 0.75)",
    neg: "rgba(255, 93, 115, 0.75)",
    warn: "rgba(240, 196, 90, 0.75)",
    muted: "rgba(140, 163, 168, 0.4)",
    text: "#8CA3A8",
    grid: "rgba(99, 255, 233, 0.08)",
    surface: "#0D2224",
    tickText: "#789096",
    legendText: "#a8bcc1",
    series: ["#20e7cf", "#5deBff", "#27e6a1", "#f0c45a", "#ff5d73"],
  };

  let _chartThemeApplied = false;
  function applyChartTheme() {
    if (typeof window === "undefined" || !window.Chart || _chartThemeApplied) return;
    _chartThemeApplied = true;
    window.Chart.defaults.color = CHART_COLORS.text;
    window.Chart.defaults.font.family = "'Inter', sans-serif";
    window.Chart.defaults.font.size = 11;
    window.Chart.defaults.borderColor = CHART_COLORS.grid;
    window.Chart.defaults.elements.point.radius = 2;
    window.Chart.defaults.elements.line.tension = 0.2;
    window.Chart.defaults.plugins.legend.labels.color = CHART_COLORS.legendText;
    window.Chart.defaults.plugins.legend.labels.usePointStyle = true;
    window.Chart.defaults.plugins.legend.labels.boxWidth = 8;
    window.Chart.defaults.plugins.tooltip.backgroundColor = CHART_COLORS.surface;
    window.Chart.defaults.plugins.tooltip.titleColor = "#F4FAFF";
    window.Chart.defaults.plugins.tooltip.bodyColor = CHART_COLORS.text;
    window.Chart.defaults.plugins.tooltip.borderColor = CHART_COLORS.grid;
    window.Chart.defaults.plugins.tooltip.borderWidth = 1;
    window.Chart.defaults.plugins.tooltip.padding = 8;
    window.Chart.defaults.plugins.tooltip.cornerRadius = 6;
    const reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.Chart.defaults.animation = reduceMotion ? false : { duration: 300 };
  }

  const COLUMN_HINTS = {
    rs_rating: "Relative Strength 1–99: xếp hạng sức mạnh giá so với toàn thị trường, càng cao càng vượt trội.",
    rel_vol: "Khối lượng phiên hiện tại so với khối lượng trung bình cùng khung giờ — trên 1 là giao dịch sôi động hơn bình thường.",
    gtgd20_ty: "Giá trị giao dịch bình quân 20 phiên gần nhất (tỷ đồng) — đo thanh khoản.",
    rsi14: "Relative Strength Index 14 phiên: dưới 30 là quá bán, trên 70 là quá mua.",
    macd_hist: "Hiệu MACD trừ đường tín hiệu — dương và tăng cho thấy động lượng tăng đang mạnh lên.",
    bb_pctb: "Vị trí giá trong dải Bollinger Band: 0 là chạm biên dưới, 1 là chạm biên trên.",
    atr_pct: "Average True Range theo % giá — đo biên độ dao động, càng cao càng biến động mạnh.",
    pct_from_52w_high: "Khoảng cách từ giá hiện tại tới đỉnh 52 tuần gần nhất (0% là đang ở đỉnh).",
    pct_above_52w_low: "Khoảng cách từ giá hiện tại tới đáy 52 tuần gần nhất.",
    dist_swing_low_pct: "Khoảng cách từ giá hiện tại tới điểm đáy swing gần nhất trên biểu đồ.",
    structure: "Cấu trúc giá theo Smart Money Concept: Tăng giá (UP), Đi ngang (SIDE), Giảm giá (DOWN).",
    golden_cross: "MA50 vừa cắt lên trên MA200 — tín hiệu kỹ thuật trung/dài hạn tích cực.",
    near_52w_high: "Giá đang trong vùng gần đỉnh 52 tuần.",
    above_sma50: "Giá đóng cửa đang ở trên đường trung bình động 50 phiên.",
    above_sma200: "Giá đóng cửa đang ở trên đường trung bình động 200 phiên.",
    foreign_room_pct: "Tỷ lệ room sở hữu nước ngoài còn lại trên tổng room tối đa của mã.",
    free_float_est: "Ước tính tỷ lệ cổ phiếu tự do chuyển nhượng, không tính sở hữu cô đặc/nhà nước.",
    margin_status: "Cờ cảnh báo giao dịch ký quỹ hiện hành từ sở giao dịch (nếu có).",
  };

  function applyColumnHints(tableEl, columnsConfig) {
    if (!tableEl) return;
    tableEl.querySelectorAll("thead th").forEach((th, i) => {
      const hint = COLUMN_HINTS[columnsConfig[i] && columnsConfig[i].data];
      if (!hint) return;
      const span = th.querySelector(".dt-column-title");
      if (span) span.title = hint;
    });
  }

  function isFileProtocol() {
    return typeof location !== "undefined" && location.protocol === "file:";
  }

  const _loadedFallbackScripts = {};
  function loadFallbackScript(src, globalName) {
    if (typeof window !== "undefined" && typeof window[globalName] !== "undefined") {
      return Promise.resolve(window[globalName]);
    }
    if (typeof document === "undefined") {
      return Promise.resolve(null);
    }
    if (!_loadedFallbackScripts[src]) {
      _loadedFallbackScripts[src] = new Promise((resolve) => {
        const el = document.createElement("script");
        el.src = src;
        el.onload = resolve;
        el.onerror = resolve;
        document.head.appendChild(el);
      });
    }
    return _loadedFallbackScripts[src].then(() => (typeof window !== "undefined" ? window[globalName] : null));
  }

  /* ============================================================
   * CENTRALIZED VIETNAMESE LOCALIZATION LAYER (PRESENTATION ONLY)
   * Internal code/enum semantics remain untouched.
   * ============================================================ */

  const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  /* 1. Structure / Cấu trúc (UP / SIDE / DOWN) */
  const STRUCTURE_MAP = Object.freeze({
    up: { label: "Tăng giá", cls: "bs-green", code: "UP" },
    side: { label: "Đi ngang", cls: "bs-amber", code: "SIDE" },
    down: { label: "Giảm giá", cls: "bs-red", code: "DOWN" },
  });

  function formatStructure(val) {
    if (val === null || val === undefined || val === "") {
      return { label: "–", cls: "bs-gray", code: "" };
    }
    const key = String(val).trim().toLowerCase();
    if (STRUCTURE_MAP[key]) return STRUCTURE_MAP[key];
    return { label: esc(String(val)), cls: "bs-gray", code: String(val) };
  }

  function formatStructureBadge(val) {
    const st = formatStructure(val);
    if (!st.code) return "–";
    return `<span class="badge-soft ${st.cls}" data-structure="${esc(st.code)}" title="${esc(st.code)}">${esc(st.label)}</span>`;
  }

  /* 2. Direction labels (Tăng giá / Giảm giá / Trung tính - NEVER Bò/Gấu) */
  const DIRECTION_MAP = Object.freeze({
    bullish: "Tăng giá",
    up: "Tăng giá",
    bearish: "Giảm giá",
    down: "Giảm giá",
    neutral: "Trung tính",
    side: "Đi ngang",
    flat: "Trung tính",
  });

  function formatDirection(dir, compact = false) {
    if (!dir) return compact ? "–" : "Trung tính";
    const key = String(dir).trim().toLowerCase();
    if (DIRECTION_MAP[key]) return DIRECTION_MAP[key];
    return String(dir);
  }

  /* 3. Momentum, Signal, and Freshness Phrases */
  const MOMENTUM_PHRASES = Object.freeze({
    "above ma20 momentum positive": "Trên MA20, động lượng tích cực",
    "below ma20 momentum negative": "Dưới MA20, động lượng tiêu cực",
    "above ma50 momentum positive": "Trên MA50, động lượng tích cực",
    "below ma50 momentum negative": "Dưới MA50, động lượng tiêu cực",
    "above ma200 momentum positive": "Trên MA200, động lượng tích cực",
    "below ma200 momentum negative": "Dưới MA200, động lượng tiêu cực",
    "momentum_breadth_positive": "Độ rộng đà tích cực",
    "momentum_breadth_negative": "Độ rộng đà tiêu cực",
    "momentum": "Động lượng",
    "watch": "Theo dõi",
  });

  const FRESHNESS_STATUS_MAP = Object.freeze({
    current: "Hiện tại",
    stale: "Đã cũ",
    unavailable: "Chưa có dữ liệu",
    unknown: "Chưa xác định",
    missing: "Thiếu dữ liệu",
    ready: "Sẵn sàng",
  });

  function formatMomentum(text) {
    if (!text) return "–";
    const key = String(text).trim().toLowerCase();
    if (MOMENTUM_PHRASES[key]) return MOMENTUM_PHRASES[key];
    return String(text);
  }

  function formatFreshness(status) {
    if (!status) return "Chưa xác định";
    const key = String(status).trim().toLowerCase();
    return FRESHNESS_STATUS_MAP[key] || String(status);
  }

  /* 4. Research & Tactical States */
  const RESEARCH_STATE_MAP = Object.freeze({
    breakout_ready: "Sẵn sàng bứt phá",
    base_building: "Đang tạo nền",
    early_reversal_candidate: "Ứng viên đảo chiều sớm",
    early_reversal: "Ứng viên đảo chiều sớm",
    wait_for_confirmation: "Chờ xác nhận",
    avoid_new_entry: "Tránh mở vị thế mới",
    high_risk_speculation_only: "Chỉ phù hợp đầu cơ rủi ro cao",
    canonical_completed: "Bản phân tích chính thức",
    prospective_retained_continuity_active: "Duy trì tính liên tục",
    priority_now: "Ưu tiên cao",
    setup_watch: "Theo dõi vị thế",
    buy_on_confirmation: "Mua khi xác nhận",
    accumulate_in_base: "Tích lũy trong nền",
    early_entry: "Mở vị thế sớm",
  });

  function formatResearchState(state) {
    if (!state) return "–";
    const key = String(state).trim().toLowerCase();
    return RESEARCH_STATE_MAP[key] || String(state);
  }

  /* 5. Screener UI Control Translations */
  const SCREENER_UI_LABELS = Object.freeze({
    presets: {
      leaders: "Dẫn đầu",
      momentum: "Động lượng",
      liquid: "Thanh khoản",
      clean: "Mã sạch",
    },
    controls: {
      exchange: "Sàn",
      signal: "Tín hiệu",
      all: "Tất cả",
      current: "Hiện tại",
      stale: "Đã cũ",
    },
  });

  return {
    signClass,
    normalizeExchange,
    displayExchange,
    CHART_COLORS,
    applyChartTheme,
    COLUMN_HINTS,
    applyColumnHints,
    isFileProtocol,
    loadFallbackScript,
    // Centralized Localization APIs
    formatStructure,
    formatStructureBadge,
    formatDirection,
    formatMomentum,
    formatFreshness,
    formatResearchState,
    SCREENER_UI_LABELS,
    esc,
  };
});
