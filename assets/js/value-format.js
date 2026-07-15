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
};
