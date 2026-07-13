/* ============================================================
 * VNSTOCK — assets/js/archive.js
 * Trang archive.html: danh sách báo cáo lịch sử tĩnh (playbook/
 * report/cross-check). Tự động khám phá thư mục KHÔNG khả thi
 * trên GitHub Pages (không có API liệt kê thư mục, không có
 * build step) nên danh sách dưới đây được ghi tay — nhưng nhóm
 * theo tháng/năm + tìm kiếm vẫn chạy động ở runtime.
 * Muốn tự động hoá thật: xem đề xuất trong CHANGELOG_UI.md mục 7.4
 * (sinh reports_manifest.json từ sync_and_push.bat).
 * ============================================================ */

/* industry/company: field TÙY CHỌN, chưa có báo cáo nào theo mã/ngành riêng nên để trống —
   không bịa danh mục. UI lọc theo industry/company (bên dưới) tự bật khi có ít nhất 1 mục
   thật sự điền field này, đây là phần "sẵn sàng cho tự động hoá sau" mà không giả vờ đã có. */
const ARCHIVE_ITEMS = [
  { file: "report-2026-04-21.html", title: "Báo cáo thị trường", date: "2026-04-21" },
  { file: "playbook-2026-04-09.html", title: "Playbook phiên", date: "2026-04-09" },
  { file: "vn_crosscheck_update_2026-04-08.html", title: "Cross-check update", date: "2026-04-08" },
  { file: "playbook-2026-04-03.html", title: "Playbook phiên", date: "2026-04-03" },
  { file: "vnindex_playbook_2026-04-03.html", title: "VNINDEX Playbook", date: "2026-04-03" },
  { file: "playbook-2026-04-02.html", title: "Playbook", date: "2026-04-02" },
  { file: "playbook-2026-04-01.html", title: "Playbook", date: "2026-04-01" },
];

const MONTH_LABEL_VI = ["Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6",
  "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"];

const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const fmtDate = (iso) => { const [y, m, d] = iso.split("-"); return `${d}/${m}/${y}`; };
const quarterOf = (iso) => "Q" + (Math.floor((Number(iso.split("-")[1]) - 1) / 3) + 1);

function groupByMonth(items) {
  const groups = new Map();
  items.slice().sort((a, b) => b.date.localeCompare(a.date)).forEach((item) => {
    const [y, m] = item.date.split("-");
    const key = `${y}-${m}`;
    if (!groups.has(key)) groups.set(key, { label: `${MONTH_LABEL_VI[Number(m) - 1]}, ${y}`, items: [] });
    groups.get(key).items.push(item);
  });
  return groups;
}

function render(items) {
  const root = document.getElementById("archive-list");
  const empty = document.getElementById("archive-empty");
  if (!items.length) {
    root.innerHTML = "";
    empty.style.display = "flex";
    return;
  }
  empty.style.display = "none";
  const groups = groupByMonth(items);
  root.innerHTML = Array.from(groups.values()).map((g) => `
    <div class="mb-4">
      <div class="form-label-sm mb-2">${esc(g.label)}</div>
      <div>
        ${g.items.map((it) => `
          <a href="${encodeURI(it.file)}" class="vs-list-item flex justify-between items-center">
            <span>📄 ${esc(it.title)}</span>
            <span class="text-muted" style="font-size:0.75rem;">${fmtDate(it.date)}</span>
          </a>
        `).join("")}
      </div>
    </div>
  `).join("");
}

// --- Bộ lọc kết hợp: tìm kiếm (text) + quý (chip) — AND với nhau ---
let activeQuarter = "";

function applyFilters() {
  const q = (document.getElementById("archive-search")?.value || "").trim().toLowerCase();
  const filtered = ARCHIVE_ITEMS.filter((it) => {
    const matchesSearch = !q || it.title.toLowerCase().includes(q) || it.file.toLowerCase().includes(q) || it.date.includes(q);
    const matchesQuarter = !activeQuarter || quarterOf(it.date) === activeQuarter;
    return matchesSearch && matchesQuarter;
  });
  render(filtered);
}

function initSearch() {
  const input = document.getElementById("archive-search");
  if (!input) return;
  input.addEventListener("input", applyFilters);
}

// Chip lọc theo quý — chỉ hiện khi báo cáo trải ra ĐA quý (1 quý thì lọc không có ý nghĩa)
function initQuarterChips() {
  const box = document.getElementById("archive-quarter-chips");
  if (!box) return;
  const quarters = Array.from(new Set(ARCHIVE_ITEMS.map((it) => quarterOf(it.date)))).sort();
  if (quarters.length <= 1) { box.style.display = "none"; return; }

  function makeChip(label, value) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "chip" + (value === "" ? " active" : "");
    btn.textContent = label;
    btn.addEventListener("click", () => {
      activeQuarter = value;
      box.querySelectorAll(".chip").forEach((c) => c.classList.remove("active"));
      btn.classList.add("active");
      applyFilters();
    });
    return btn;
  }

  box.appendChild(makeChip("Tất cả", ""));
  quarters.forEach((qtr) => box.appendChild(makeChip(qtr, qtr)));
}

// Lọc theo ngành/mã — ẩn hoàn toàn cho tới khi có báo cáo thật gắn industry/company
// (xem ghi chú ở ARCHIVE_ITEMS). Không dựng UI cho dữ liệu chưa tồn tại.
function initIndustryCompanyFilter() {
  const box = document.getElementById("archive-industry-filter");
  if (!box) return;
  const hasData = ARCHIVE_ITEMS.some((it) => it.industry || it.company);
  box.style.display = hasData ? "" : "none";
}

document.addEventListener("DOMContentLoaded", () => {
  render(ARCHIVE_ITEMS);
  initSearch();
  initQuarterChips();
  initIndustryCompanyFilter();
});
