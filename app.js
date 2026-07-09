/* ============================================================
 * VNSTOCK Dashboard — app.js
 * Luồng dữ liệu:
 *   - ai_report_latest.md   → render Markdown (marked.js)
 *   - screen_snapshot.csv   → parse (PapaParse) → DataTables
 * Dữ liệu được sync_and_push.bat copy sang từ thư mục VNSTOCK.
 * ============================================================ */

const REPORT_URL = "ai_report_latest.md";
const CSV_URL = "screen_snapshot.csv";

/* Các cột hiển thị màu xanh/đỏ theo giá trị dương/âm */
const SIGNED_COLUMNS = [
  "chg_today_pct", "ret_1m", "ret_3m", "ret_6m", "ret_12m",
  "macd_hist", "pct_from_52w_high",
];

/* Ngôn ngữ tiếng Việt cho DataTables */
const DT_LANG_VI = {
  search: "Tìm kiếm:",
  lengthMenu: "Hiển thị _MENU_ dòng",
  info: "Dòng _START_–_END_ / tổng _TOTAL_ mã",
  infoEmpty: "Không có dữ liệu",
  infoFiltered: "(lọc từ _MAX_ mã)",
  zeroRecords: "Không tìm thấy mã nào phù hợp",
  paginate: { first: "Đầu", last: "Cuối", next: "Sau", previous: "Trước" },
};

/* ---------- KHU VỰC 1: BÁO CÁO AI ---------- */
async function loadAiReport() {
  const container = document.getElementById("ai-report");
  try {
    const res = await fetch(REPORT_URL, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const md = await res.text();

    container.innerHTML = marked.parse(md);

    // Lấy ngày báo cáo từ tiêu đề (vd: "... — 2026-07-09") để hiện lên badge
    const dateMatch = md.match(/(\d{4}-\d{2}-\d{2})/);
    if (dateMatch) {
      document.getElementById("report-date").textContent = dateMatch[1];
      document.getElementById("last-updated").textContent =
        "Cập nhật lần cuối: " + dateMatch[1];
    }
  } catch (err) {
    container.innerHTML = `
      <div class="alert alert-warning mb-0">
        <strong>⚠️ Chưa tải được báo cáo AI</strong> (${err.message}).<br>
        Kiểm tra: file <code>ai_report_latest.md</code> đã tồn tại chưa
        (chạy <code>sync_and_push.bat</code> để copy dữ liệu sang).<br>
        Lưu ý: khi xem local phải chạy qua web server
        (vd: <code>python -m http.server</code>), mở trực tiếp file sẽ bị chặn CORS.
      </div>`;
  }
}

/* ---------- KHU VỰC 2: BẢNG DỮ LIỆU THỊ TRƯỜNG ---------- */
function buildColumns(fields) {
  return fields.map((field) => ({
    data: field,
    title: field,
    defaultContent: "",
    render: function (value, type, row) {
      if (type !== "display") return value;
      if (value === null || value === undefined || value === "") return "";

      if (field === "ticker") return `<strong>${value}</strong>`;

      if (typeof value === "number" && SIGNED_COLUMNS.includes(field)) {
        const cls = value > 0 ? "val-pos" : value < 0 ? "val-neg" : "";
        return `<span class="${cls}">${value}</span>`;
      }
      return value;
    },
  }));
}

function populateFilter(selectId, values) {
  const select = document.getElementById(selectId);
  [...values]
    .filter((v) => v !== null && v !== undefined && v !== "")
    .sort((a, b) => String(a).localeCompare(String(b), "vi"))
    .forEach((v) => {
      const opt = document.createElement("option");
      opt.value = v;
      opt.textContent = v;
      select.appendChild(opt);
    });
}

function initMarketTable(rows, fields) {
  const statusBox = document.getElementById("table-status");
  statusBox.style.display = "none";

  const table = new DataTable("#market-table", {
    data: rows,
    columns: buildColumns(fields),
    pageLength: 25,
    lengthMenu: [10, 25, 50, 100],
    order: [[fields.indexOf("rs_rating"), "desc"]],
    scrollX: true,
    language: DT_LANG_VI,
  });

  // Bộ lọc theo sàn và ngành (khớp chính xác giá trị của cột)
  const exchangeIdx = fields.indexOf("exchange");
  const industryIdx = fields.indexOf("industry");
  populateFilter("filter-exchange", new Set(rows.map((r) => r.exchange)));
  populateFilter("filter-industry", new Set(rows.map((r) => r.industry)));

  const escapeRegex = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  document.getElementById("filter-exchange").addEventListener("change", (e) => {
    const v = e.target.value;
    table.column(exchangeIdx).search(v ? `^${escapeRegex(v)}$` : "", true, false).draw();
  });
  document.getElementById("filter-industry").addEventListener("change", (e) => {
    const v = e.target.value;
    table.column(industryIdx).search(v ? `^${escapeRegex(v)}$` : "", true, false).draw();
  });
}

function loadMarketTable() {
  Papa.parse(CSV_URL, {
    download: true,
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true,
    complete: function (results) {
      if (!results.data.length) {
        showTableError("File CSV rỗng hoặc không đọc được dữ liệu.");
        return;
      }
      initMarketTable(results.data, results.meta.fields);
    },
    error: function (err) {
      showTableError(err.message || "Không tải được file CSV.");
    },
  });
}

function showTableError(message) {
  document.getElementById("table-status").innerHTML = `
    <div class="alert alert-warning mb-0 text-start">
      <strong>⚠️ Chưa tải được bảng dữ liệu</strong> (${message}).<br>
      Kiểm tra: file <code>screen_snapshot.csv</code> đã tồn tại chưa
      (chạy <code>sync_and_push.bat</code> để copy dữ liệu sang).
    </div>`;
}

/* ---------- KHỞI CHẠY ---------- */
document.addEventListener("DOMContentLoaded", () => {
  loadAiReport();
  loadMarketTable();
});
