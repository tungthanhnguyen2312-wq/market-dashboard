/* ============================================================
 * VNSTOCK — assets/js/resizable-panels.js
 * Kéo giãn cột trái/phải trong các layout 2 cột (chỉ áp dụng khi
 * màn hình đủ rộng để 2 cột đứng cạnh nhau — xem breakpoint 1280px
 * trong shell.css). Không đụng nội dung bên trong 2 cột, chỉ đổi
 * độ rộng qua inline style — an toàn với mọi trang dùng chung.
 *
 * Cấu trúc HTML cần có:
 *   <div data-resizable data-resize-key="ten-duy-nhat">
 *     <div>...cột trái...</div>
 *     <div class="vs-resize-handle"></div>
 *     <div>...cột phải...</div>
 *   </div>
 * ============================================================ */

(function () {
  var MIN_WIDTH = 280;
  var BREAKPOINT = 1280;

  function clamp(px, containerWidth) {
    var max = containerWidth * 0.75;
    return Math.min(Math.max(px, MIN_WIDTH), max);
  }

  function applyWidth(container, leftPanel, px) {
    leftPanel.style.flex = "0 0 " + px + "px";
    container.dataset.resizeWidth = px;
  }

  function initOne(container) {
    var handle = container.querySelector(":scope > .vs-resize-handle");
    var leftPanel = handle ? handle.previousElementSibling : null;
    var rightPanel = handle ? handle.nextElementSibling : null;
    if (!handle || !leftPanel || !rightPanel) return;

    var key = "vs-resize-" + (container.dataset.resizeKey || "default");
    var saved = parseInt(localStorage.getItem(key), 10);
    if (!isNaN(saved) && window.innerWidth >= BREAKPOINT) {
      applyWidth(container, leftPanel, clamp(saved, container.getBoundingClientRect().width));
    }

    var dragging = false;
    var startX = 0;
    var startWidth = 0;
    var dragContainerWidth = 0; // đo 1 lần lúc mousedown — container không đổi kích thước giữa chừng khi kéo

    function onMouseMove(e) {
      if (!dragging) return;
      var next = clamp(startWidth + (e.clientX - startX), dragContainerWidth);
      applyWidth(container, leftPanel, next);
    }

    function onMouseUp() {
      if (!dragging) return;
      dragging = false;
      handle.classList.remove("is-dragging");
      document.body.classList.remove("is-resizing-panel");
      var finalPx = parseInt(container.dataset.resizeWidth, 10);
      if (!isNaN(finalPx)) localStorage.setItem(key, finalPx);
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    }

    handle.addEventListener("mousedown", function (e) {
      if (window.innerWidth < BREAKPOINT) return;
      dragging = true;
      startX = e.clientX;
      startWidth = leftPanel.getBoundingClientRect().width;
      dragContainerWidth = container.getBoundingClientRect().width;
      handle.classList.add("is-dragging");
      document.body.classList.add("is-resizing-panel");
      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
      e.preventDefault();
    });

    // Bàn phím: mũi tên trái/phải khi handle đang focus
    handle.setAttribute("tabindex", "0");
    handle.setAttribute("role", "separator");
    handle.setAttribute("aria-orientation", "vertical");
    handle.addEventListener("keydown", function (e) {
      if (window.innerWidth < BREAKPOINT) return;
      var step = 24;
      var containerWidth = container.getBoundingClientRect().width;
      var current = leftPanel.getBoundingClientRect().width;
      if (e.key === "ArrowLeft") {
        applyWidth(container, leftPanel, clamp(current - step, containerWidth));
        localStorage.setItem(key, container.dataset.resizeWidth);
      } else if (e.key === "ArrowRight") {
        applyWidth(container, leftPanel, clamp(current + step, containerWidth));
        localStorage.setItem(key, container.dataset.resizeWidth);
      }
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll("[data-resizable]").forEach(initOne);
  });
})();
