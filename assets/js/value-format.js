/* ============================================================
 * VNSTOCK — assets/js/value-format.js
 * Helper DÙNG CHUNG cho quy tắc màu số liệu (dương/âm) — trước đây
 * mỗi trang (app.js, analysis.js, company-panel.js, screener.html)
 * tự viết lại cùng 1 điều kiện "value > 0 -> xanh, < 0 -> đỏ".
 * File này CHỈ gói lại đúng điều kiện đó — cách xử lý giá trị
 * thiếu/rỗng (hiện "–", "·"...) vẫn do từng nơi tự quyết định như cũ,
 * không đụng vào để không đổi hành vi hiển thị hiện tại.
 *
 * Không dùng module/bundler (site không có build step) nên khai báo
 * ở top-level: các <script defer> khác load SAU file này (cùng trang)
 * gọi thẳng signClass()/CHART_COLORS được, miễn thẻ <script> của file
 * này nằm TRƯỚC trong HTML.
 * ============================================================ */

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

/* Màu dùng trong canvas Chart.js (không đọc được CSS var() trong canvas) —
   khớp đúng --success/--danger/--warning/--text-muted/--border-soft hiện
   tại của style.css, tránh mỗi biểu đồ tự khai lại 1 bộ màu riêng. */
const CHART_COLORS = {
  pos: "rgba(39, 230, 161, 0.75)",
  neg: "rgba(255, 93, 115, 0.75)",
  warn: "rgba(240, 196, 90, 0.75)",
  muted: "rgba(140, 163, 168, 0.4)",
  text: "#8CA3A8",
  grid: "rgba(99, 255, 233, 0.08)",
  surface: "#0D2224", // khớp --surface trong style.css — viền phân tách lát doughnut/bar
  tickText: "#789096", // chữ trục nhạt hơn text thường — dùng cho macro.js (nhiều trục)
  legendText: "#a8bcc1",
  // Chuỗi màu cho chart nhiều series (macro.js multi-line) — thứ tự cố định để mỗi
  // chỉ báo giữ đúng 1 màu qua các lần render.
  series: ["#20e7cf", "#5deBff", "#27e6a1", "#f0c45a", "#ff5d73"],
};

/* Chart.defaults dùng chung — TRƯỚC ĐÂY chỉ app.js tự set (4 dòng cục bộ trong
   renderCharts()), nên chart do company-panel.js vẽ trên screener.html/signals.html
   (2 trang KHÔNG load app.js) chạy với theme sáng mặc định của Chart.js trên nền tối.
   Gọi hàm này (idempotent, an toàn gọi nhiều lần) TRƯỚC mọi new Chart(...) để đảm bảo
   font/màu/tooltip/legend/point/line nhất quán bất kể trang nào vẽ chart trước.
   Chart.js dùng canvas + rAF riêng, KHÔNG nghe theo prefers-reduced-motion qua CSS
   (media query trong style.css chỉ tắt CSS animation/transition) nên phải tắt
   animation thủ công ở đây. */
let _chartThemeApplied = false;
function applyChartTheme() {
  if (!window.Chart || _chartThemeApplied) return;
  _chartThemeApplied = true;
  Chart.defaults.color = CHART_COLORS.text;
  Chart.defaults.font.family = "'Inter', sans-serif";
  Chart.defaults.font.size = 11;
  Chart.defaults.borderColor = CHART_COLORS.grid;
  Chart.defaults.elements.point.radius = 2;
  Chart.defaults.elements.line.tension = 0.2;
  Chart.defaults.plugins.legend.labels.color = CHART_COLORS.legendText;
  Chart.defaults.plugins.legend.labels.usePointStyle = true;
  Chart.defaults.plugins.legend.labels.boxWidth = 8;
  Chart.defaults.plugins.tooltip.backgroundColor = CHART_COLORS.surface;
  Chart.defaults.plugins.tooltip.titleColor = "#F4FAFF";
  Chart.defaults.plugins.tooltip.bodyColor = CHART_COLORS.text;
  Chart.defaults.plugins.tooltip.borderColor = CHART_COLORS.grid;
  Chart.defaults.plugins.tooltip.borderWidth = 1;
  Chart.defaults.plugins.tooltip.padding = 8;
  Chart.defaults.plugins.tooltip.cornerRadius = 6;
  const reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  Chart.defaults.animation = reduceMotion ? false : { duration: 300 };
}

/* Giải thích ngắn cho các cột chỉ số kỹ thuật/định lượng không tự nói lên ý nghĩa
   qua tên viết tắt — dùng chung cho tiêu đề cột #market-table (app.js) và #tblScreen
   (screener.html) vì cả 2 bảng chia sẻ phần lớn field name. Chỉ những field "khó đoán"
   mới cần hint; PE/PB/ROE/Giá/Ngày... đã đủ rõ nên không thêm vào đây. */
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
  structure: "Cấu trúc giá theo Smart Money Concept: UP/SIDE/DOWN dựa trên chuỗi đỉnh–đáy gần nhất.",
  golden_cross: "MA50 vừa cắt lên trên MA200 — tín hiệu kỹ thuật trung/dài hạn tích cực.",
  near_52w_high: "Giá đang trong vùng gần đỉnh 52 tuần.",
  above_sma50: "Giá đóng cửa đang ở trên đường trung bình động 50 phiên.",
  above_sma200: "Giá đóng cửa đang ở trên đường trung bình động 200 phiên.",
  foreign_room_pct: "Tỷ lệ room sở hữu nước ngoài còn lại trên tổng room tối đa của mã.",
  free_float_est: "Ước tính tỷ lệ cổ phiếu tự do chuyển nhượng, không tính sở hữu cô đặc/nhà nước.",
  margin_status: "Cờ cảnh báo giao dịch ký quỹ hiện hành từ sở giao dịch (nếu có).",
};

/* Gắn tooltip hover (title attribute) lên header cột SAU KHI DataTables đã dựng xong
   <thead> — KHÔNG truyền HTML vào columns[].title vì DataTables dùng chính chuỗi đó
   để build aria-label ("<span title=...>RS</span>: Activate to sort"), lộ tag ra
   ngoài screen reader. columnsConfig phải là mảng đã truyền cho new DataTable(...)
   (cùng thứ tự) để khớp field với <th> theo index. */
function applyColumnHints(tableEl, columnsConfig) {
  if (!tableEl) return;
  tableEl.querySelectorAll("thead th").forEach((th, i) => {
    const hint = COLUMN_HINTS[columnsConfig[i] && columnsConfig[i].data];
    if (!hint) return;
    const span = th.querySelector(".dt-column-title");
    if (span) span.title = hint;
  });
}

/* true khi mở trang bằng double-click file (fetch() sẽ luôn bị CORS chặn) — dùng để
   quyết định tải primary (fetch JSON/CSV) hay fallback (.js nhúng sẵn) mà KHÔNG bao
   giờ tải cả hai một cách vô điều kiện. */
function isFileProtocol() {
  return location.protocol === "file:";
}

/* Nạp fallback .js CHỈ khi cần (file:// hoặc fetch primary đã thất bại) — không còn
   <script src="data/*.js"> tĩnh nào chạy vô điều kiện trên http(s). Dedup theo src:
   nhiều lời gọi cùng 1 file (vd screener_data.js chứa cả SCREEN_ROWS lẫn
   BREADTH_ROWS) chỉ inject đúng 1 thẻ <script>, không tải lại. */
const _loadedFallbackScripts = {};
function loadFallbackScript(src, globalName) {
  if (typeof window[globalName] !== "undefined") return Promise.resolve(window[globalName]);
  if (!_loadedFallbackScripts[src]) {
    _loadedFallbackScripts[src] = new Promise((resolve) => {
      const el = document.createElement("script");
      el.src = src;
      el.onload = resolve;
      el.onerror = resolve; // để nơi gọi tự xử lý window[globalName] vẫn undefined
      document.head.appendChild(el);
    });
  }
  return _loadedFallbackScripts[src].then(() => window[globalName]);
}
