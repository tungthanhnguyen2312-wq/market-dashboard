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
    HNX_LISTED: "HNX",
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
   * Filtering/comparison/business logic continues using raw enums.
   * Only DISPLAY TEXT is translated through formatDomainState().
   * ============================================================ */

  const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  /* 1. Structure / Cấu trúc (UP / SIDE / DOWN) */
  const STRUCTURE_MAP = Object.freeze({
    up: { label: "Tăng giá", cls: "bs-green", code: "UP" },
    side: { label: "Đi ngang", cls: "bs-amber", code: "SIDE" },
    down: { label: "Giảm giá", cls: "bs-red", code: "DOWN" },
  });

  const STRUCTURE_STATE_MAP = Object.freeze({
    BELOW_MA20_MOMENTUM_NEGATIVE: "Dưới MA20, động lượng tiêu cực",
    ABOVE_MA20_MOMENTUM_POSITIVE: "Trên MA20, động lượng tích cực",
    BELOW_MA20_MOMENTUM_POSITIVE: "Dưới MA20, động lượng tích cực",
    ABOVE_MA20_MOMENTUM_NEGATIVE: "Trên MA20, động lượng tiêu cực",
    NEAR_MA20_NEUTRAL: "Gần MA20, trung tính",
    NOT_AVAILABLE: "Chưa có",
  });

  function structureTone(code) {
    const key = String(code || "").toUpperCase();
    if (key === "UP" || key.includes("POSITIVE")) return "bs-green";
    if (key === "DOWN" || key.includes("NEGATIVE")) return "bs-red";
    if (key === "SIDE" || key.includes("NEUTRAL")) return "bs-amber";
    return "bs-gray";
  }

  function formatStructure(val) {
    if (val === null || val === undefined || val === "") {
      return { label: "–", cls: "bs-gray", code: "" };
    }
    const raw = String(val).trim();
    const key = raw.toLowerCase();
    if (STRUCTURE_MAP[key]) return STRUCTURE_MAP[key];
    const upper = raw.toUpperCase();
    if (Object.prototype.hasOwnProperty.call(STRUCTURE_STATE_MAP, upper)) {
      return { label: STRUCTURE_STATE_MAP[upper], cls: structureTone(upper), code: raw };
    }
    return { label: EMPTY_LABELS.default, cls: "bs-gray", code: raw };
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

  /* 3. Momentum phrases */
  const MOMENTUM_PHRASES = Object.freeze({
    "above ma20 momentum positive": "Trên MA20, động lượng tích cực",
    "below ma20 momentum negative": "Dưới MA20, động lượng tiêu cực",
    "above ma50 momentum positive": "Trên MA50, động lượng tích cực",
    "below ma50 momentum negative": "Dưới MA50, động lượng tiêu cực",
    "above ma200 momentum positive": "Trên MA200, động lượng tích cực",
    "below ma200 momentum negative": "Dưới MA200, động lượng tiêu cực",
    "above ma20 momentum negative": "Trên MA20, động lượng tiêu cực",
    "below ma20 momentum positive": "Dưới MA20, động lượng tích cực",
    "near ma20 neutral": "Gần MA20, trung tính",
    "momentum_breadth_positive": "Độ rộng đà tích cực",
    "momentum_breadth_negative": "Độ rộng đà tiêu cực",
    "momentum": "Động lượng",
    "watch": "Theo dõi",
  });

  function formatMomentum(text) {
    if (!text) return "–";
    const raw = String(text).trim();
    const key = raw.toLowerCase();
    const spaced = key.replace(/_/g, " ");
    if (MOMENTUM_PHRASES[key]) return MOMENTUM_PHRASES[key];
    if (MOMENTUM_PHRASES[spaced]) return MOMENTUM_PHRASES[spaced];
    return raw;
  }

  /* 4. Governed domain tables — SCREAMING_SNAKE keys, presentation only. */
  const RESEARCH_STANCE_MAP = Object.freeze({
    INITIATE_RESEARCH_CANDIDATE: "Ứng viên nghiên cứu mở vị thế",
    ACCUMULATE_RESEARCH_CANDIDATE: "Ứng viên nghiên cứu tích lũy",
    WAIT_FOR_CONFIRMATION: "Chờ xác nhận",
    HIGH_RISK_SPECULATION_ONLY: "Chỉ đầu cơ rủi ro cao",
    AVOID_NEW_ENTRY: "Tránh mở vị thế mới",
    INSUFFICIENT_EVIDENCE: "Chưa đủ bằng chứng",
    PRIORITY_NOW: "Ưu tiên nghiên cứu hiện tại",
    SETUP_WATCH: "Theo dõi vị thế",
  });

  const TACTICAL_STATE_MAP = Object.freeze({
    DOWNTREND: "Xu hướng giảm",
    SELLING_PRESSURE_EASING: "Áp lực bán đang hạ nhiệt",
    UPTREND_CONFIRMED: "Xu hướng tăng đã xác nhận",
    EARLY_REVERSAL_CANDIDATE: "Ứng viên đảo chiều sớm",
    BREAKDOWN_RISK: "Rủi ro phá vỡ hỗ trợ",
    SIDEWAYS_NEUTRAL: "Đi ngang / trung tính",
    DISTRIBUTION_RISK: "Rủi ro phân phối",
    BASE_BUILDING: "Đang tạo nền",
    BREAKOUT_READY: "Sẵn sàng bứt phá",
  });

  const ENTRY_ACTION_MAP = Object.freeze({
    WAIT: "Chờ",
    AVOID: "Tránh",
    EARLY_ENTRY: "Mở vị thế sớm",
    ACCUMULATE_IN_BASE: "Tích lũy trong nền",
    BUY_ON_CONFIRMATION: "Mở vị thế khi xác nhận",
  });

  const FUNDAMENTAL_STATE_MAP = Object.freeze({
    PROFITABLE: "Có lợi nhuận",
    LOSS_MAKING: "Đang lỗ",
    INSUFFICIENT_DATA: "Chưa đủ dữ liệu",
    UNAVAILABLE: "Chưa có dữ liệu",
    TURNAROUND_CONTEXT: "Bối cảnh chuyển biến lợi nhuận",
  });

  const FUNDAMENTAL_TRAJECTORY_MAP = Object.freeze({
    PROFIT_GROWTH: "Lợi nhuận tăng",
    PROFIT_DECLINE: "Lợi nhuận giảm",
    LOSS_WIDENED: "Lỗ mở rộng",
    LOSS_NARROWED: "Lỗ thu hẹp",
    TURNAROUND_TO_PROFIT: "Chuyển từ lỗ sang lãi",
    TURNED_TO_LOSS: "Chuyển sang lỗ",
    INSUFFICIENT_DATA: "Chưa đủ dữ liệu",
    UNAVAILABLE: "Chưa có dữ liệu",
  });

  const VALUATION_STATE_MAP = Object.freeze({
    ATTRACTIVE_RELATIVE_RESEARCH: "Hấp dẫn tương đối",
    EXPENSIVE_RELATIVE_RESEARCH: "Đắt tương đối",
    IN_LINE_RELATIVE_RESEARCH: "Ngang bằng tương đối",
    PE_NOT_MEANINGFUL: "P/E không có ý nghĩa",
    ABSOLUTE_RESEARCH_ONLY: "Chỉ định giá tuyệt đối nghiên cứu",
    UNAVAILABLE: "Chưa có dữ liệu",
  });

  const LIQUIDITY_STATE_MAP = Object.freeze({
    LIQUIDITY_RESEARCH_PROXY: "Thanh khoản nghiên cứu",
    LIQUIDITY_RESEARCH_UNAVAILABLE: "Chưa có thanh khoản nghiên cứu",
    EXECUTION_CAPACITY_EXACT_BLOCKED: "Chưa đủ dữ liệu cho năng lực thực hiện lệnh chính xác",
    EXECUTION_CAPACITY_EXACT_READY: "Đã có dữ liệu năng lực thực hiện lệnh chính xác",
    EXECUTION_CAPACITY_EXACT_NOT_QUALIFIED: "Chưa xác lập năng lực thực hiện lệnh chính xác",
    RESEARCH_PROXY: "Dữ liệu nghiên cứu",
    CURRENT_SESSION_DESCRIPTIVE_ELIGIBLE: "Đủ điều kiện mô tả phiên hiện tại",
  });

  const EVIDENCE_STATE_MAP = Object.freeze({
    WATCH_FOR_EXECUTION: "Theo dõi thực hiện",
    CONFIRMED: "Đã xác nhận",
    PLANNED_PENDING: "Đã lên kế hoạch, đang chờ",
    UNAVAILABLE: "Chưa có dữ liệu",
    READY: "Sẵn sàng nghiên cứu",
    CONDITIONAL: "Có điều kiện",
    TRIGGERED: "Đã kích hoạt",
    NOT_AVAILABLE: "Chưa có",
    PRODUCT_READY_RESEARCH_CONTEXT: "Bối cảnh nghiên cứu đã sẵn sàng",
    READY_RESEARCH_PROXY: "Dữ liệu nghiên cứu sẵn sàng",
  });

  const FRESHNESS_MAP = Object.freeze({
    CURRENT: "Hiện tại",
    STALE: "Đã cũ",
    STALE_AXIS_PRESENT: "Có trục dữ liệu đã cũ",
    STALE_BUT_RESEARCH_USABLE: "Cũ nhưng còn dùng cho nghiên cứu",
    STALE_NOT_USABLE_FOR_THIS_AXIS: "Cũ, không dùng cho trục này",
    UNAVAILABLE: "Chưa có dữ liệu",
    UNKNOWN: "Chưa xác định",
    MISSING: "Thiếu dữ liệu",
    MIXED: "Hỗn hợp",
    READY: "Sẵn sàng",
  });

  const ENTITY_TYPE_MAP = Object.freeze({
    corporate: "Doanh nghiệp",
    bank: "Ngân hàng",
    securities: "Chứng khoán",
    insurance: "Bảo hiểm",
    finance_company: "Công ty tài chính",
    QUALIFIED_CLASSIFICATION: "Phân loại đã xác nhận",
    QUALIFIED_ENTITY_CLASS: "Loại hình doanh nghiệp đã xác nhận",
    PROVIDER_DESCRIPTIVE_CLASSIFICATION: "Phân loại mô tả từ nguồn",
    ENTITY_TYPE_UNKNOWN: "Chưa xác định loại hình",
    AVAILABLE: "Có dữ liệu",
    UNKNOWN: "Chưa xác định",
  });

  const CONFIRMATION_STATE_MAP = Object.freeze({
    READY: "Sẵn sàng nghiên cứu",
    CONDITIONAL: "Có điều kiện",
    UNAVAILABLE: "Chưa có dữ liệu",
    NOT_AVAILABLE: "Chưa có",
    TRIGGERED: "Đã kích hoạt",
    CONFIRMED: "Đã xác nhận",
  });

  const INVALIDATION_STATE_MAP = Object.freeze({
    READY: "Sẵn sàng nghiên cứu",
    CONDITIONAL: "Có điều kiện",
    UNAVAILABLE: "Chưa có dữ liệu",
    TRIGGERED: "Đã kích hoạt",
    STANCE_RECONSIDERATION_WATCH: "Theo dõi để xem xét lại tư thế",
    THESIS_INVALIDATION: "Vô hiệu luận điểm",
  });

  const DATA_FITNESS_MAP = Object.freeze({
    CURRENT: "Hiện tại",
    STALE_AXIS_PRESENT: "Có trục dữ liệu đã cũ",
    STALE_BUT_RESEARCH_USABLE: "Cũ nhưng còn dùng cho nghiên cứu",
    UNAVAILABLE: "Chưa có dữ liệu",
    UNKNOWN: "Chưa xác định",
    LIQUIDITY_RESEARCH_PROXY: "Thanh khoản nghiên cứu",
    EXECUTION_CAPACITY_EXACT_BLOCKED: "Chưa đủ dữ liệu cho năng lực thực hiện lệnh chính xác",
    RESEARCH_PROXY: "Dữ liệu nghiên cứu",
    QUALIFIED_CLASSIFICATION: "Phân loại đã xác nhận",
    QUALIFIED_ENTITY_CLASS: "Loại hình doanh nghiệp đã xác nhận",
    PROVIDER_DESCRIPTIVE_CLASSIFICATION: "Phân loại mô tả từ nguồn",
    READY: "Sẵn sàng nghiên cứu",
    ABSENT: "Chưa có dữ liệu",
    RESEARCH_CONTEXT: "Bối cảnh nghiên cứu",
    AVAILABLE: "Có dữ liệu",
    PRICE_AVAILABLE: "Có giá",
    PRICE_UNAVAILABLE: "Chưa có giá",
    READY_RESEARCH_PROXY: "Dữ liệu nghiên cứu sẵn sàng",
    CURRENT_SHARE_RESEARCH_PROXY: "Proxy số cổ phiếu hiện tại",
    PROVIDER_VALUATION_PROXY: "Proxy định giá từ nguồn",
    EXACT_OR_QUALIFIED: "Giá trị đã xác nhận",
    INSUFFICIENT_DATA: "Chưa đủ dữ liệu",
    NOT_APPLICABLE: "Không áp dụng",
    MIXED: "Hỗn hợp",
    UNAVAILABLE: "Chưa có dữ liệu",
    MIXED_BREADTH: "Độ rộng hỗn hợp",
    UPPER_MIDDLE: "Trên trung bình",
    LOWER_MIDDLE: "Dưới trung bình",
    DEEP_EVIDENCE_ARTIFACT_NOT_MATERIALIZED_LOCALLY: "Bằng chứng sâu chưa có trên máy này",
  });

  const RESEARCH_READINESS_MAP = Object.freeze({
    RESEARCH_CONDITIONAL: "Nghiên cứu có điều kiện",
    RESEARCH_READY_CONDITIONAL: "Sẵn sàng nghiên cứu có điều kiện",
    RESEARCH_NOT_READY: "Chưa sẵn sàng nghiên cứu",
    CONDITIONAL_RESEARCH_STATE: "Trạng thái nghiên cứu có điều kiện",
  });

  const PORTFOLIO_STATE_MAP = Object.freeze({
    NOT_EVALUATED: "Chưa đánh giá",
    EXCEEDS_USER_POLICY_LIMIT: "Vượt hạn mức người dùng",
    ALREADY_HELD: "Đã nắm giữ",
    ADDS_SECTOR_CONCENTRATION: "Tăng tập trung ngành",
    NO_CONCENTRATION_FLAGGED: "Không có cảnh báo tập trung",
    HELD: "Đang nắm giữ",
    NOT_HELD: "Chưa nắm giữ",
    NO_PORTFOLIO_RESEARCH_CONTEXT_SUPPLIED: "Chưa có bối cảnh danh mục",
  });

  const PROSPECTIVE_CASE_MAP = Object.freeze({
    CASE_DATA_UNAVAILABLE: "Chưa có dữ liệu hồ sơ",
    NO_RETAINED_CURRENT_CASES: "Không có hồ sơ được giữ lại",
    PENDING_NOT_ENOUGH_FUTURE_SESSIONS: "Chưa đủ phiên tương lai",
    ACTIVE_CASES_AVAILABLE: "Có hồ sơ đang theo dõi",
    INITIAL_OBSERVATION: "Quan sát ban đầu",
  });

  const SETUP_TAG_MAP = Object.freeze({
    TECHNICAL_DETERIORATION: "Suy yếu kỹ thuật",
    RANGE_COMPRESSION: "Biên độ thu hẹp",
    PRICE_VOLUME_DISTRIBUTION_RISK: "Rủi ro phân phối giá-khối lượng",
    RANGE_EXPANSION: "Biên độ mở rộng",
    NEAR_RESISTANCE: "Gần kháng cự",
    RELATIVE_STRENGTH_LEADER: "Dẫn đầu sức mạnh tương đối",
    RELATIVE_STRENGTH_LAGGARD: "Tụt lại sức mạnh tương đối",
    NEAR_SUPPORT: "Gần hỗ trợ",
    EARLY_REVERSAL_STRUCTURE: "Cấu trúc đảo chiều sớm",
    BREAKOUT_CONFIRMED_BY_RULE: "Bứt phá được quy tắc xác nhận",
    PULLBACK_TO_SUPPORT_IN_UPTREND: "Hồi về hỗ trợ trong xu hướng tăng",
    BREAKOUT_FAILURE: "Bứt phá thất bại",
  });

  const EARNINGS_STATE_MAP = Object.freeze({
    TURNAROUND_CONTEXT: "Bối cảnh chuyển biến lợi nhuận",
    NEGATIVE_EARNINGS: "Lợi nhuận âm",
  });

  const RULE_CONDITION_MAP = Object.freeze({
    TACTICAL_STATE_AWAITING_CONFIRMATION: "Chờ xác nhận điều kiện kỹ thuật",
    TECHNICAL_DETERIORATION: "Suy yếu kỹ thuật",
    PROFITABLE_FUNDAMENTAL: "Nền tảng doanh nghiệp có lợi nhuận",
    ADVERSE_TACTICAL_ENTRY_STATE: "Trạng thái kỹ thuật bất lợi",
    ATTRACTIVE_RELATIVE_RESEARCH: "Định giá hấp dẫn tương đối",
    BREAKOUT_READY_AWAITING_CONFIRMATION: "Sẵn sàng bứt phá, chờ xác nhận",
    CONSTRUCTIVE_NON_BREAKOUT_WITH_USABLE_FUNDAMENTAL: "Kỹ thuật mang tính xây dựng, có nền tảng dùng được",
    CONSTRUCTIVE_TACTICAL_WITH_FUNDAMENTAL_EVIDENCE_UNAVAILABLE: "Kỹ thuật mang tính xây dựng, chưa có bằng chứng nền tảng",
    CONSTRUCTIVE_TACTICAL_WITH_OBSERVED_WEAK_OR_LOSS_FUNDAMENTAL: "Kỹ thuật mang tính xây dựng, nền tảng yếu hoặc đang lỗ",
    EARLY_REVERSAL_CANDIDATE: "Ứng viên đảo chiều sớm",
    LOSS_MAKING: "Đang lỗ",
    LOSS_WIDENED: "Lỗ mở rộng",
    NO_USABLE_FUNDAMENTAL_OR_TACTICAL_AXIS: "Chưa có trục nền tảng hoặc kỹ thuật dùng được",
    PRICE_VOLUME_DISTRIBUTION_RISK: "Rủi ro phân phối giá-khối lượng",
    QUALIFIED_CATALYST_PRESENT: "Có chất xúc tác đã xác nhận",
    TACTICAL_AXIS_NOT_CURRENT: "Trục kỹ thuật không thuộc phiên hiện tại",
    TURNAROUND_CONTEXT: "Bối cảnh chuyển biến lợi nhuận",
    WAIT_FOR_CONFIRMATION: "Chờ xác nhận điều kiện kỹ thuật",
    COUNTER_THESIS_PRESENT: "Có phản luận",
    EXECUTION_CAPACITY_EXACT_BLOCKED_NOT_A_STANCE_GATE: "Thiếu năng lực lệnh chính xác không chặn tư thế",
    SHARE_BASIS_RESEARCH_PROXY: "Cơ sở số cổ phiếu là dữ liệu nghiên cứu",
    NEGATIVE_EARNINGS: "Lợi nhuận âm",
    EXPENSIVE_RELATIVE_RESEARCH: "Đắt tương đối",
    EASING_TO_REVERSAL_UPGRADE: "Điều kiện nâng cấp sang đảo chiều",
    BASE_RESOLUTION: "Chờ phân giải nền giá",
    BREAKDOWN_EXTENSION_CONFIRMATION: "Xác nhận mở rộng phá vỡ hỗ trợ",
    BREAKOUT_EXTENSION_CONFIRMATION: "Xác nhận mở rộng bứt phá",
    DIRECTIONAL_RESOLUTION: "Chờ phân giải hướng",
    DISTRIBUTION_ROLLOVER_CONFIRMATION: "Xác nhận đảo chiều phân phối",
    EARLY_REVERSAL_CONFIRMATION_MA20_RECLAIM: "Xác nhận đảo chiều sớm khi lấy lại MA20",
    ONGOING_TREND_CONTINUATION: "Xu hướng hiện tại tiếp diễn",
    FUTURE_CLOSE_GT_FUTURE_MA20: "Giá đóng cửa tương lai trên MA20",
    FUTURE_CLOSE_GT_RESISTANCE_LEVEL: "Giá đóng cửa tương lai trên kháng cự",
    FUTURE_CLOSE_LT_FUTURE_MA20: "Giá đóng cửa tương lai dưới MA20",
    FUTURE_CLOSE_LT_SUPPORT_LEVEL: "Giá đóng cửa tương lai dưới hỗ trợ",
    FUTURE_CLOSE_LT_RESISTANCE_LEVEL: "Giá đóng cửa tương lai dưới kháng cự",
    FUTURE_MOMENTUM_20D_GT_0: "Động lượng 20 phiên tương lai dương",
    FUTURE_MOMENTUM_20D_LT_0: "Động lượng 20 phiên tương lai âm",
    ABOVE_TO_CONFIRM: "Xác nhận khi vượt lên",
    BELOW_TO_CONFIRM: "Xác nhận khi thủng xuống",
    STATE_TRANSITION: "Chuyển trạng thái",
    BASE_FAILURE: "Nền giá thất bại",
    BREAKDOWN_RECLAIM: "Lấy lại sau phá vỡ hỗ trợ",
    BREAKOUT_LEVEL_FAILURE: "Mức bứt phá thất bại",
    DISTRIBUTION_RECOVERY: "Phục hồi sau phân phối",
    DOWNTREND_STABILIZATION: "Xu hướng giảm ổn định lại",
    EARLY_REVERSAL_MOMENTUM_FAILURE: "Đảo chiều sớm thất bại về động lượng",
    MOMENTUM_ROLLOVER: "Động lượng đảo chiều",
    RENEWED_BREAKDOWN_RISK: "Rủi ro phá vỡ hỗ trợ tái diễn",
    COMPATIBLE_PROFITABILITY_QUALITY_DETERIORATION: "Suy giảm chất lượng lợi nhuận",
    RETAINED_TACTICAL_RULE_FAILURE: "Quy tắc kỹ thuật được giữ lại không còn thỏa",
    NOT_AVAILABLE: "Chưa có",
  });

  const AXIS_LABELS = Object.freeze({
    tactical: "Kỹ thuật",
    fundamental: "Nền tảng doanh nghiệp",
    liquidity: "Thanh khoản",
    valuation: "Định giá",
    valuation_share_basis: "Cơ sở số cổ phiếu định giá",
    catalyst: "Chất xúc tác",
    confirmation: "Xác nhận",
    invalidation: "Điều kiện vô hiệu",
    downside_invalidation: "Điều kiện vô hiệu giảm giá",
    market_sector: "Thị trường / ngành",
  });

  const ENTITY_CLASS_VOCABULARY = Object.freeze(["corporate", "bank", "securities", "insurance", "finance_company"]);

  const DOMAIN_TABLES = Object.freeze({
    research_stance: RESEARCH_STANCE_MAP,
    tactical_state: TACTICAL_STATE_MAP,
    entry_action: ENTRY_ACTION_MAP,
    fundamental_state: FUNDAMENTAL_STATE_MAP,
    fundamental_trajectory: FUNDAMENTAL_TRAJECTORY_MAP,
    valuation_state: VALUATION_STATE_MAP,
    liquidity_state: LIQUIDITY_STATE_MAP,
    evidence_state: EVIDENCE_STATE_MAP,
    freshness: FRESHNESS_MAP,
    entity_type: ENTITY_TYPE_MAP,
    confirmation_state: CONFIRMATION_STATE_MAP,
    invalidation_state: INVALIDATION_STATE_MAP,
    data_fitness: DATA_FITNESS_MAP,
    research_readiness: RESEARCH_READINESS_MAP,
    portfolio_state: PORTFOLIO_STATE_MAP,
    prospective_case: PROSPECTIVE_CASE_MAP,
    setup_tag: SETUP_TAG_MAP,
    earnings_state: EARNINGS_STATE_MAP,
    rule_condition: RULE_CONDITION_MAP,
    structure_state: STRUCTURE_STATE_MAP,
  });

  const EMPTY_LABELS = Object.freeze({
    default: "Chưa xác định",
    freshness: "Chưa xác định",
    liquidity_state: "Chưa có dữ liệu",
    valuation_state: "Chưa có dữ liệu",
    fundamental_state: "Chưa có dữ liệu",
    evidence_state: "Chưa có dữ liệu",
    confirmation_state: "Chưa có dữ liệu",
    invalidation_state: "Chưa có dữ liệu",
    rule_condition: "Điều kiện kỹ thuật",
    structure_state: "Chưa có",
  });

  function lookupDomainTable(table, raw) {
    if (!table || raw === "") return null;
    if (Object.prototype.hasOwnProperty.call(table, raw)) return table[raw];
    const upper = raw.toUpperCase();
    if (Object.prototype.hasOwnProperty.call(table, upper)) return table[upper];
    const lower = raw.toLowerCase();
    if (Object.prototype.hasOwnProperty.call(table, lower)) return table[lower];
    return null;
  }

  function formatDomainState(value, domain) {
    const raw = (value === null || value === undefined) ? "" : String(value).trim();
    const table = DOMAIN_TABLES[domain] || null;
    if (!raw) {
      return {
        raw: "",
        label: EMPTY_LABELS[domain] || EMPTY_LABELS.default,
        domain: domain || "",
        known: false,
      };
    }
    const mapped = lookupDomainTable(table, raw);
    if (mapped) {
      return { raw, label: mapped, domain: domain || "", known: true };
    }
    return {
      raw,
      label: domain === "rule_condition" ? EMPTY_LABELS.rule_condition : EMPTY_LABELS.default,
      domain: domain || "",
      known: false,
    };
  }

  function formatKnownLabel(value, preferredDomain) {
    const formatted = formatDomainState(value, preferredDomain);
    if (formatted.known || !formatted.raw) return formatted.label;
    const domains = Object.keys(DOMAIN_TABLES);
    for (let i = 0; i < domains.length; i++) {
      if (domains[i] === preferredDomain) continue;
      const alt = formatDomainState(formatted.raw, domains[i]);
      if (alt.known) return alt.label;
    }
    return formatted.label;
  }

  function formatStateLabel(value, domain) {
    return formatDomainState(value, domain).label;
  }

  function formatResearchStance(value) { return formatStateLabel(value, "research_stance"); }
  function formatTacticalState(value) { return formatStateLabel(value, "tactical_state"); }
  function formatEntryAction(value) { return formatStateLabel(value, "entry_action"); }
  function formatFundamentalState(value) { return formatStateLabel(value, "fundamental_state"); }
  function formatValuationState(value) { return formatStateLabel(value, "valuation_state"); }
  function formatLiquidityState(value) { return formatStateLabel(value, "liquidity_state"); }
  function formatEvidenceState(value) { return formatStateLabel(value, "evidence_state"); }
  function formatEntityType(value) { return formatStateLabel(value, "entity_type"); }
  function formatConfirmationState(value) { return formatStateLabel(value, "confirmation_state"); }
  function formatInvalidationState(value) { return formatStateLabel(value, "invalidation_state"); }

  function visibleStateHtml(value, domain, options) {
    const formatted = formatDomainState(value, domain);
    const opts = options || {};
    const cls = opts.className ? ` ${opts.className}` : "";
    return `<span class="vs-state-label${cls}" data-state="${esc(formatted.raw)}" data-domain="${esc(domain || "")}" title="${esc(formatted.raw)}">${esc(formatted.label)}</span>`;
  }

  function formatRuleCondition(value) { return formatStateLabel(value, "rule_condition"); }
  function formatAxisLabel(axis) { return AXIS_LABELS[axis] || String(axis || ""); }

  function formatSectorLineage(value) {
    const raw = (value === null || value === undefined) ? "" : String(value).trim();
    if (!raw || raw.toUpperCase() === "UNKNOWN") {
      return { raw, label: "Chưa phân loại ngành", qualification: "", identity: "", known: false };
    }
    const parts = raw.includes("|") ? raw.split("|").map((part) => part.trim()).filter(Boolean) : [raw];
    const qualifications = [];
    let identity = "";
    let displayName = "";
    parts.forEach((part) => {
      const folded = part.toLowerCase();
      if (ENTITY_CLASS_VOCABULARY.includes(folded)) {
        displayName = displayName || lookupDomainTable(ENTITY_TYPE_MAP, part) || part;
        return;
      }
      if (/^[A-Z][A-Z0-9_]+$/.test(part)) {
        const mapped = lookupDomainTable(DATA_FITNESS_MAP, part)
          || lookupDomainTable(ENTITY_TYPE_MAP, part)
          || lookupDomainTable(RULE_CONDITION_MAP, part);
        if (mapped) {
          qualifications.push(mapped);
          return;
        }
      }
      if (/[\/:]/.test(part)) {
        identity = identity || part;
        return;
      }
      displayName = displayName || part;
    });
    return {
      raw,
      label: displayName || qualifications[0] || "Chưa phân loại ngành",
      qualification: qualifications.join(" · "),
      identity,
      known: Boolean(displayName || qualifications.length),
    };
  }

  function sectorLineageHtml(value) {
    const formatted = formatSectorLineage(value);
    const extra = formatted.qualification
      ? `<span class="product-muted vs-lineage-qual"> · ${esc(formatted.qualification)}</span>`
      : "";
    return `<span data-sector="${esc(formatted.raw)}" title="${esc(formatted.raw)}">${esc(formatted.label)}</span>${extra}`;
  }

  function technicalDetailsHtml(payload, summary) {
    const body = typeof payload === "string" ? payload : JSON.stringify(payload ?? {}, null, 2);
    return `<details class="vs-tech-details"><summary>${esc(summary || "Chi tiết kỹ thuật")}</summary><pre class="cockpit-code">${esc(body)}</pre></details>`;
  }

  function provenanceHtml(identity, summary) {
    if (!identity) return "";
    return `<details class="vs-tech-details" data-provenance="true"><summary>${esc(summary || "Chi tiết dữ liệu")}</summary><div class="vs-provenance-label">Nguồn dữ liệu</div><pre class="cockpit-code">${esc(identity)}</pre></details>`;
  }

  /* Backward-compatible freshness + mixed research-state helpers. */
  const FRESHNESS_STATUS_MAP = Object.freeze({
    current: "Hiện tại",
    stale: "Đã cũ",
    unavailable: "Chưa có dữ liệu",
    unknown: "Chưa xác định",
    missing: "Thiếu dữ liệu",
    ready: "Sẵn sàng",
    mixed: "Hỗn hợp",
    stale_axis_present: "Có trục dữ liệu đã cũ",
    stale_but_research_usable: "Cũ nhưng còn dùng cho nghiên cứu",
    stale_not_usable_for_this_axis: "Cũ, không dùng cho trục này",
  });

  function formatFreshness(status) {
    if (!status) return "Chưa xác định";
    const domain = formatDomainState(status, "freshness");
    if (domain.known) return domain.label;
    const key = String(status).trim().toLowerCase();
    return FRESHNESS_STATUS_MAP[key] || domain.label;
  }

  const RESEARCH_STATE_MAP = Object.freeze({
    breakout_ready: "Sẵn sàng bứt phá",
    base_building: "Đang tạo nền",
    early_reversal_candidate: "Ứng viên đảo chiều sớm",
    early_reversal: "Ứng viên đảo chiều sớm",
    wait_for_confirmation: "Chờ xác nhận",
    avoid_new_entry: "Tránh mở vị thế mới",
    high_risk_speculation_only: "Chỉ đầu cơ rủi ro cao",
    initiate_research_candidate: "Ứng viên nghiên cứu mở vị thế",
    accumulate_research_candidate: "Ứng viên nghiên cứu tích lũy",
    insufficient_evidence: "Chưa đủ bằng chứng",
    canonical_completed: "Bản phân tích chính thức",
    prospective_retained_continuity_active: "Duy trì tính liên tục",
    priority_now: "Ưu tiên nghiên cứu hiện tại",
    setup_watch: "Theo dõi vị thế",
    buy_on_confirmation: "Mở vị thế khi xác nhận",
    accumulate_in_base: "Tích lũy trong nền",
    early_entry: "Mở vị thế sớm",
  });

  function formatResearchState(state) {
    if (!state) return "–";
    const fallbackDomains = ["research_stance", "tactical_state", "entry_action"];
    for (let i = 0; i < fallbackDomains.length; i++) {
      const formatted = formatDomainState(state, fallbackDomains[i]);
      if (formatted.known) return formatted.label;
    }
    const key = String(state).trim().toLowerCase();
    return RESEARCH_STATE_MAP[key] || formatDomainState(state, "research_stance").label;
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
    formatStructure,
    formatStructureBadge,
    formatDirection,
    formatMomentum,
    formatFreshness,
    formatResearchState,
    formatDomainState,
    formatStateLabel,
    formatResearchStance,
    formatTacticalState,
    formatEntryAction,
    formatFundamentalState,
    formatValuationState,
    formatLiquidityState,
    formatEvidenceState,
    formatEntityType,
    formatConfirmationState,
    formatInvalidationState,
    formatRuleCondition,
    formatKnownLabel,
    formatAxisLabel,
    formatSectorLineage,
    sectorLineageHtml,
    technicalDetailsHtml,
    provenanceHtml,
    visibleStateHtml,
    DOMAIN_TABLES,
    SCREENER_UI_LABELS,
    esc,
  };
});
