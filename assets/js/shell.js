/* ============================================================
 * VNSTOCK — assets/js/shell.js
 * Hành vi khung sườn DÙNG CHUNG cho mọi trang: bật/tắt sidebar
 * trên mobile, tô sáng mục menu đang đứng, khởi tạo icon Lucide.
 * KHÔNG đụng tới logic tải dữ liệu (app.js/analysis.js/script
 * riêng từng trang) — file này chỉ lo phần khung.
 * ============================================================ */

(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
  }
  if (root) {
    root.VSShellNav = api;
  }
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  const CANONICAL_PRIMARY_NAV = Object.freeze([
    { href: "dashboard.html", id: "dashboard", label: "Tổng quan", icon: "layout-dashboard" },
    { href: "screener.html", id: "screener", label: "Bộ lọc", icon: "filter" },
    { href: "signals.html", id: "signals", label: "Tín hiệu", icon: "activity" },
    { href: "analysis.html", id: "analysis", label: "Phân tích", icon: "brain-circuit" },
    { href: "investment-workspace.html", id: "investment-workspace", label: "Bàn quyết định", icon: "layout-list" },
    { href: "portfolio.html", id: "portfolio", label: "Danh mục", icon: "wallet-cards" },
    { href: "macro.html", id: "macro", label: "Vĩ mô", icon: "globe" },
    { href: "about.html", id: "about", label: "Giới thiệu", icon: "info" },
  ]);

  const CANONICAL_UTILITY_NAV = Object.freeze([
    { href: "archive.html", id: "archive", label: "Lịch sử", icon: "history" }
  ]);

  function initActiveLink() {
    if (typeof document === "undefined") return;
    var page = document.body && document.body.dataset && document.body.dataset.page;
    var currentFile = (typeof window !== "undefined" && window.location && window.location.pathname)
      ? window.location.pathname.split("/").pop() || ""
      : "";
    document.querySelectorAll(".vs-topnav-link, .vs-sidebar-link, [data-nav]").forEach(function (link) {
      var navKey = link.dataset.nav;
      var href = link.getAttribute("href") || "";
      var hrefBase = href.split("?")[0].split("#")[0];
      var matches = (navKey && page && navKey === page)
        || (currentFile && hrefBase === currentFile)
        || (page && hrefBase === (page + ".html"));
      if (matches) {
        link.classList.add("is-active", "active");
        link.setAttribute("aria-current", "page");
      }
    });
  }

  function initSidebarToggle() {
    var sidebar = document.getElementById("sidebar");
    var overlay = document.getElementById("sidebar-overlay");
    var openBtn = document.getElementById("sidebar-toggle");
    var closeBtn = document.getElementById("sidebar-close");
    if (!sidebar || !overlay || !openBtn) return;

    // Focus trap khi drawer mở trên mobile — cùng mẫu với company-panel.js
    // (getFocusable + chặn Tab tại 2 đầu). Trước đây mở drawer không đưa focus
    // vào, đóng không trả focus lại nút bấm mở — bàn phím/screen reader không
    // biết drawer đã hiện.
    var lastFocused = null;

    function getFocusable() {
      return Array.prototype.slice.call(sidebar.querySelectorAll("a[href], button:not([disabled])"))
        .filter(function (el) { return el.offsetParent !== null; });
    }

    function open() {
      lastFocused = document.activeElement;
      sidebar.classList.add("is-open");
      overlay.classList.add("is-open");
      var focusable = getFocusable();
      if (focusable.length) focusable[0].focus();
    }
    function close() {
      if (!sidebar.classList.contains("is-open")) return;
      sidebar.classList.remove("is-open");
      overlay.classList.remove("is-open");
      if (lastFocused && typeof lastFocused.focus === "function") lastFocused.focus();
      lastFocused = null;
    }

    openBtn.addEventListener("click", open);
    overlay.addEventListener("click", close);
    if (closeBtn) closeBtn.addEventListener("click", close);
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") { close(); return; }
      if (e.key !== "Tab" || !sidebar.classList.contains("is-open")) return;
      var focusable = getFocusable();
      if (!focusable.length) return;
      var first = focusable[0], last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
    // Bấm vào 1 link menu trên mobile thì tự đóng drawer
    sidebar.querySelectorAll("a[data-nav]").forEach(function (link) {
      link.addEventListener("click", close);
    });
  }

  function initIcons() {
    if (window.lucide && typeof window.lucide.createIcons === "function") {
      window.lucide.createIcons();
    }
  }

  // Thu gọn sidebar trên desktop (icon-only) — nhớ trạng thái qua localStorage
  // vì mỗi trang là 1 file HTML riêng, không có SPA state dùng chung.
  var COLLAPSE_KEY = "vs-sidebar-collapsed";

  function initSidebarCollapse() {
    var sidebar = document.getElementById("sidebar");
    var toggle = document.getElementById("sidebar-collapse-toggle");
    if (!sidebar || !toggle) return;

    if (localStorage.getItem(COLLAPSE_KEY) === "1") {
      sidebar.classList.add("is-collapsed");
    }

    toggle.addEventListener("click", function () {
      var collapsed = sidebar.classList.toggle("is-collapsed");
      localStorage.setItem(COLLAPSE_KEY, collapsed ? "1" : "0");
    });
  }

  if (typeof document !== "undefined") {
    document.addEventListener("DOMContentLoaded", function () {
      initActiveLink();
      initSidebarToggle();
      initSidebarCollapse();
      initIcons();
    });
  }

  return {
    CANONICAL_PRIMARY_NAV,
    CANONICAL_UTILITY_NAV,
    initActiveLink,
    initSidebarToggle,
    initIcons,
  };
});
