/* ============================================================
 * VNSTOCK — assets/js/shell.js
 * Hành vi khung sườn DÙNG CHUNG cho mọi trang: bật/tắt sidebar
 * trên mobile, tô sáng mục menu đang đứng, khởi tạo icon Lucide.
 * KHÔNG đụng tới logic tải dữ liệu (app.js/analysis.js/script
 * riêng từng trang) — file này chỉ lo phần khung.
 * ============================================================ */

(function () {
  function initActiveLink() {
    var page = document.body.dataset.page;
    if (!page) return;
    document.querySelectorAll("[data-nav]").forEach(function (link) {
      if (link.dataset.nav === page) {
        link.classList.add("is-active");
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

    function open() {
      sidebar.classList.add("is-open");
      overlay.classList.add("is-open");
    }
    function close() {
      sidebar.classList.remove("is-open");
      overlay.classList.remove("is-open");
    }

    openBtn.addEventListener("click", open);
    overlay.addEventListener("click", close);
    if (closeBtn) closeBtn.addEventListener("click", close);
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") close();
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

  document.addEventListener("DOMContentLoaded", function () {
    initActiveLink();
    initSidebarToggle();
    initSidebarCollapse();
    initIcons();
  });
})();
