/* ============================================================
 * VNSTOCK — tailwind.config.js
 * Cấu hình cho Tailwind CLI standalone v3.4.19 (xem build_frontend.bat).
 * Nội dung theme/corePlugins GIỮ NGUYÊN 100% so với khối `tailwind.config`
 * từng khai inline qua Play CDN trên 7 trang — chỉ chuyển từ runtime JIT
 * (browser) sang build-time JIT (CLI), không đổi bất kỳ giá trị nào.
 * KHÔNG dùng cú pháp v4 (@theme trong CSS) — corePlugins.preflight vẫn cần
 * v3 vì v4 đã bỏ hẳn corePlugins.
 * ============================================================ */
module.exports = {
  content: [
    "./dashboard.html",
    "./screener.html",
    "./analysis.html",
    "./signals.html",
    "./macro.html",
    "./archive.html",
    "./about.html",
    "./app.js",
    "./analysis.js",
    "./assets/js/*.js",
  ],
  corePlugins: { preflight: false },
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        surface: "var(--surface)",
        "surface-2": "var(--surface-2)",
        border: "var(--border)",
        muted: "var(--text-muted)",
        primary: "var(--primary)",
        success: "var(--success)",
        warning: "var(--warning)",
        danger: "var(--danger)",
      },
      fontFamily: { sans: ["Inter", "sans-serif"] },
    },
  },
};
