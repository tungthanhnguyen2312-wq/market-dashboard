/* ============================================================
 * VNSTOCK Dashboard — app.js
 * Luồng dữ liệu (KHÔNG đổi so với trước):
 *   - ai_report_latest.md    → render Markdown (marked.js)
 *   - ai_report_latest.json  → KPI / Watchlist / Kế hoạch hành động
 *   - screen_snapshot.csv    → parse (PapaParse) → DataTables
 * Dữ liệu được sync_and_push.bat copy sang từ thư mục VNSTOCK.
 * ============================================================ */

const REPORT_URL = "ai_report_latest.md";
const REPORT_JSON_URL = "ai_report_latest.json";
const CSV_URL = "screen_snapshot.csv";

/* Các cột hiển thị màu xanh/đỏ theo giá trị dương/âm */
const SIGNED_COLUMNS = [
  "chg_today_pct", "ret_1m", "ret_3m", "ret_6m", "ret_12m",
  "macd_hist", "pct_from_52w_high",
];

/* Các cột boolean hiển thị dấu ✓ */
const BOOL_COLUMNS = ["above_sma50", "above_sma200", "golden_cross", "near_52w_high"];

/* Tên cột tiếng Việt cho bảng screener (chỉ đổi hiển thị, field gốc giữ nguyên) */
const COLUMN_LABELS = {
  ticker: "Mã",
  date: "Ngày",
  close: "Giá đóng cửa (₫)",
  chg_today_pct: "% Phiên",
  gtgd20_ty: "GTGD 20p (tỷ)",
  rel_vol: "KL tương đối",
  rsi14: "RSI 14",
  macd_hist: "MACD Hist",
  bb_pctb: "BB %B",
  atr_pct: "ATR %",
  above_sma50: "Trên MA50",
  above_sma200: "Trên MA200",
  golden_cross: "Golden Cross",
  pct_from_52w_high: "% cách đỉnh 52T",
  near_52w_high: "Gần đỉnh 52T",
  pct_above_52w_low: "% trên đáy 52T",
  ret_1m: "% 1 tháng",
  ret_3m: "% 3 tháng",
  ret_6m: "% 6 tháng",
  ret_12m: "% 12 tháng",
  structure: "Cấu trúc",
  dist_swing_low_pct: "% cách Swing Low",
  rs_rating: "RS",
  exchange: "Sàn",
  industry: "Ngành",
  foreign_room_pct: "Room ngoại %",
  pe: "P/E",
  pb: "P/B",
  roe: "ROE %",
  free_float_est: "Free Float",
  margin_status: "Margin",
};

/* Ngôn ngữ tiếng Việt cho DataTables */
const DT_LANG_VI = {
  search: "Tìm mã / từ khóa:",
  lengthMenu: "Hiển thị _MENU_ dòng",
  info: "Dòng _START_–_END_ / tổng _TOTAL_ mã",
  infoEmpty: "Không có dữ liệu",
  infoFiltered: "(lọc từ _MAX_ mã)",
  zeroRecords: "Không tìm thấy mã nào phù hợp",
  paginate: { first: "Đầu", last: "Cuối", next: "Sau", previous: "Trước" },
};

/* ---------- Helpers ---------- */
const num = (v) => (typeof v === "number" ? v : parseFloat(v));
const isTrue = (v) => v === true || String(v).toLowerCase() === "true";
const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/* ============================================================
 * KHU VỰC 1: BÁO CÁO AI (Markdown)
 * ============================================================ */
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
    container.classList.remove("collapsed");
    const toggle = document.getElementById("report-toggle");
    if (toggle) toggle.style.display = "none";
    container.innerHTML = `
      <div class="alert alert-warning mb-0">
        <strong>⚠️ Chưa tải được báo cáo AI</strong> (${esc(err.message)}).<br>
        Kiểm tra: file <code>ai_report_latest.md</code> đã tồn tại chưa
        (chạy <code>sync_and_push.bat</code> để copy dữ liệu sang).<br>
        Lưu ý: khi xem local phải chạy qua web server
        (vd: <code>python -m http.server</code>), mở trực tiếp file sẽ bị chặn CORS.
      </div>`;
  }
}

/* Nút Xem đầy đủ / Thu gọn cho báo cáo (UI-only) */
function initReportToggle() {
  const btn = document.getElementById("report-toggle");
  const box = document.getElementById("ai-report");
  if (!btn || !box) return;
  btn.addEventListener("click", () => {
    const collapsed = box.classList.toggle("collapsed");
    btn.textContent = collapsed ? "Xem đầy đủ ▾" : "Thu gọn ▴";
    if (collapsed) box.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}

/* ============================================================
 * KPI + WATCHLIST + ACTION PLAN (từ ai_report_latest.json)
 * ============================================================ */
const REGIME_MAP = {
  bull: { label: "BULL", cls: "text-success" },
  neutral: { label: "NEUTRAL", cls: "text-warning" },
  bear: { label: "BEAR", cls: "text-danger" },
};

const RISK_MAP = {
  low: { label: "THẤP", cls: "text-success" },
  medium: { label: "TRUNG BÌNH", cls: "text-warning" },
  high: { label: "CAO", cls: "text-danger" },
};

const STANCE_MAP = {
  mua_tham_do: { label: "MUA THĂM DÒ", cls: "bs-green" },
  cho_setup: { label: "CHỜ SETUP", cls: "bs-blue" },
  theo_doi: { label: "THEO DÕI", cls: "bs-amber" },
  tranh: { label: "TRÁNH", cls: "bs-red" },
};

async function loadJsonReport() {
  const watchlistBox = document.getElementById("watchlist");
  const actionBox = document.getElementById("action-plan");
  try {
    const res = await fetch(REPORT_JSON_URL, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    // --- KPI: Regime + Risk ---
    const regime = REGIME_MAP[String(data.market_regime).toLowerCase()] || {
      label: String(data.market_regime || "—").toUpperCase(),
      cls: "",
    };
    const kpiRegime = document.getElementById("kpi-regime");
    kpiRegime.textContent = regime.label;
    kpiRegime.className = "kpi-value " + regime.cls;

    const risk = RISK_MAP[String(data.portfolio_risk).toLowerCase()] || {
      label: String(data.portfolio_risk || "—").toUpperCase(),
      cls: "",
    };
    const kpiRisk = document.getElementById("kpi-risk");
    kpiRisk.textContent = risk.label;
    kpiRisk.className = "kpi-value " + risk.cls;

    // --- Watchlist từ stock_notes ---
    if (Array.isArray(data.stock_notes) && data.stock_notes.length) {
      watchlistBox.innerHTML = data.stock_notes
        .map((s) => {
          const stance = STANCE_MAP[s.stance] || { label: s.stance, cls: "bs-gray" };
          const risks = (s.risk_flags || [])
            .map((r) => `<li>${esc(r)}</li>`)
            .join("");
          return `
            <details class="watch-item" data-stance="${esc(s.stance || "")}">
              <summary>
                <span class="watch-ticker">${esc(s.ticker)}</span>
                <span class="badge-soft ${stance.cls}">${esc(stance.label)}</span>
                <span class="watch-caret">▼</span>
              </summary>
              <div class="watch-body">
                <p>${esc(s.entry_logic || "")}</p>
                ${risks ? `<ul class="watch-risks">${risks}</ul>` : ""}
              </div>
            </details>`;
        })
        .join("");
      initWatchlistFilter(data.stock_notes);
    } else {
      watchlistBox.innerHTML = `<p class="text-muted mb-0">Báo cáo hôm nay không có mã nào trong watchlist.</p>`;
    }

    // --- Kế hoạch hành động ---
    if (Array.isArray(data.action_plan) && data.action_plan.length) {
      actionBox.innerHTML = data.action_plan
        .map((a) => `<li>${esc(a)}</li>`)
        .join("");
    } else {
      actionBox.innerHTML = `<li class="text-muted">Không có kế hoạch trong báo cáo hôm nay.</li>`;
    }
  } catch (err) {
    watchlistBox.innerHTML = `<p class="text-muted mb-0">⚠️ Chưa tải được <code>ai_report_latest.json</code> (${esc(err.message)}).</p>`;
    actionBox.innerHTML = `<li class="text-muted">Không có dữ liệu.</li>`;
  }
}

/* Lọc watchlist theo nhóm trạng thái (chip) — chỉ hiện khi watchlist hôm
   nay có từ 2 stance khác nhau trở lên, cùng tinh thần initQuarterChips()
   của archive.js: không dựng UI lọc khi không có gì để lọc. */
function initWatchlistFilter(notes) {
  const box = document.getElementById("watchlist-filters");
  if (!box) return;
  box.innerHTML = "";
  const stances = Array.from(new Set(notes.map((s) => s.stance).filter(Boolean)));
  if (stances.length <= 1) return;

  let active = "";
  function apply() {
    document.querySelectorAll("#watchlist .watch-item").forEach((el) => {
      el.classList.toggle("is-filtered-out", Boolean(active) && el.dataset.stance !== active);
    });
  }
  function makeChip(label, value) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "chip" + (value === "" ? " active" : "");
    btn.textContent = label;
    btn.addEventListener("click", () => {
      active = value;
      box.querySelectorAll(".chip").forEach((c) => c.classList.remove("active"));
      btn.classList.add("active");
      apply();
    });
    return btn;
  }
  box.appendChild(makeChip("Tất cả", ""));
  stances.forEach((st) => box.appendChild(makeChip((STANCE_MAP[st] || { label: st }).label, st)));
}

/* ============================================================
 * KPI TỪ DỮ LIỆU CSV (breadth, cấu trúc, thanh khoản)
 * ============================================================ */
function fillMarketKpis(rows) {
  const total = rows.length;
  if (!total) return;
  let above200 = 0, structUp = 0, hiLiq = 0;
  rows.forEach((r) => {
    if (isTrue(r.above_sma200)) above200++;
    if (String(r.structure).toLowerCase() === "up") structUp++;
    const liq = num(r.gtgd20_ty);
    if (!isNaN(liq) && liq >= 50) hiLiq++;
  });

  const pctBreadth = (above200 / total) * 100;
  const pctUp = (structUp / total) * 100;

  const kb = document.getElementById("kpi-breadth");
  kb.textContent = pctBreadth.toFixed(1) + "%";
  kb.className =
    "kpi-value " + (pctBreadth >= 50 ? "text-success" : pctBreadth >= 30 ? "text-warning" : "text-danger");
  document.getElementById("kpi-breadth-sub").textContent = `${above200}/${total} mã trên MA200`;
  document.getElementById("kpi-breadth-bar").style.width = pctBreadth.toFixed(1) + "%";

  const ks = document.getElementById("kpi-structure");
  ks.textContent = pctUp.toFixed(1) + "%";
  ks.className =
    "kpi-value " + (pctUp >= 40 ? "text-success" : pctUp >= 20 ? "text-warning" : "text-danger");
  document.getElementById("kpi-structure-sub").textContent = `${structUp}/${total} mã cấu trúc up`;
  document.getElementById("kpi-structure-bar").style.width = pctUp.toFixed(1) + "%";

  document.getElementById("kpi-liquidity").textContent = hiLiq + " mã";
}

/* ============================================================
 * BIỂU ĐỒ (Chart.js) — chỉ dùng dữ liệu đang có trong CSV
 * ============================================================ */
function renderCharts(rows) {
  if (!window.Chart) return;

  Chart.defaults.color = CHART_COLORS.text;
  Chart.defaults.font.family = "'Inter', sans-serif";
  Chart.defaults.font.size = 11;
  Chart.defaults.borderColor = CHART_COLORS.grid;

  // --- Sector breadth: % mã trên MA200 theo ngành (ngành >= 8 mã) ---
  const byIndustry = {};
  rows.forEach((r) => {
    const ind = r.industry;
    if (!ind) return;
    if (!byIndustry[ind]) byIndustry[ind] = { total: 0, above: 0 };
    byIndustry[ind].total++;
    if (isTrue(r.above_sma200)) byIndustry[ind].above++;
  });

  const sectors = Object.entries(byIndustry)
    .filter(([, v]) => v.total >= 8)
    .map(([name, v]) => ({ name, pct: (v.above / v.total) * 100, total: v.total }))
    .sort((a, b) => b.pct - a.pct)
    .slice(0, 10);

  const sectorCanvas = document.getElementById("chart-sector");
  if (sectorCanvas && sectors.length) {
    new Chart(sectorCanvas, {
      type: "bar",
      data: {
        labels: sectors.map((s) => s.name),
        datasets: [{
          data: sectors.map((s) => +s.pct.toFixed(1)),
          backgroundColor: sectors.map((s) =>
            s.pct >= 50 ? CHART_COLORS.pos : s.pct >= 30 ? CHART_COLORS.warn : CHART_COLORS.neg
          ),
          borderRadius: 4,
          barThickness: 14,
        }],
      },
      options: {
        indexAxis: "y",
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => ` ${ctx.parsed.x}% trên MA200 (${sectors[ctx.dataIndex].total} mã)`,
            },
          },
        },
        scales: {
          x: { max: 100, ticks: { callback: (v) => v + "%" } },
          y: { grid: { display: false } },
        },
      },
    });
  }

  // --- Phân bố cấu trúc giá ---
  const structCount = { up: 0, side: 0, down: 0 };
  rows.forEach((r) => {
    const s = String(r.structure).toLowerCase();
    if (s in structCount) structCount[s]++;
  });

  const structCanvas = document.getElementById("chart-structure");
  if (structCanvas) {
    new Chart(structCanvas, {
      type: "doughnut",
      data: {
        labels: ["UP", "SIDE", "DOWN"],
        datasets: [{
          data: [structCount.up, structCount.side, structCount.down],
          backgroundColor: [CHART_COLORS.pos, CHART_COLORS.warn, CHART_COLORS.neg],
          borderColor: CHART_COLORS.surface,
          borderWidth: 3,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "62%",
        plugins: { legend: { position: "bottom" } },
      },
    });
  }
}

/* ============================================================
 * KHU VỰC 2: STOCK SCREENER (PapaParse + DataTables)
 * ============================================================ */

/* Conditional formatting cho từng ô — chỉ đổi cách hiển thị, không đổi dữ liệu */
function buildColumns(fields) {
  return fields.map((field) => ({
    data: field,
    title: COLUMN_LABELS[field] || field,
    defaultContent: "",
    createdCell:
      field === "ticker"
        ? (td) => td.classList.add("ticker-cell")
        : undefined,
    render: function (value, type) {
      if (type !== "display") return value;
      if (value === null || value === undefined || value === "") return "";

      if (field === "ticker") return esc(value);

      // Giá đóng cửa: định dạng tiền Việt (15400 → 15.400)
      if (field === "close") {
        const v = num(value);
        return isNaN(v) ? esc(value) : v.toLocaleString("vi-VN");
      }

      // Ngày: hiển thị dd/mm/yyyy theo chuẩn Việt Nam
      if (field === "date") {
        const m = String(value).match(/^(\d{4})-(\d{2})-(\d{2})$/);
        return m ? `${m[3]}/${m[2]}/${m[1]}` : esc(value);
      }

      if (field === "rs_rating") {
        const v = num(value);
        const cls = v > 90 ? "bs-green" : v >= 80 ? "bs-amber" : "bs-gray";
        return `<span class="badge-soft ${cls}">${esc(value)}</span>`;
      }

      if (field === "rsi14") {
        const v = num(value);
        if (v < 30) return `<span class="val-strong">${esc(value)}</span>`;
        if (v > 70) return `<span class="val-neg">${esc(value)}</span>`;
        return esc(value);
      }

      if (field === "structure") {
        const s = String(value).toLowerCase();
        const cls = s === "up" ? "bs-green" : s === "side" ? "bs-amber" : s === "down" ? "bs-red" : "bs-gray";
        return `<span class="badge-soft ${cls}">${esc(String(value).toUpperCase())}</span>`;
      }

      if (field === "gtgd20_ty") {
        const v = num(value);
        if (v >= 100) return `<span class="val-strong">${esc(value)}</span>`;
        if (v < 3) return `<span class="val-muted">${esc(value)}</span>`;
        return esc(value);
      }

      if (BOOL_COLUMNS.includes(field)) {
        return isTrue(value)
          ? `<span class="val-check">✓</span>`
          : `<span class="val-dot">·</span>`;
      }

      if (typeof value === "number" && SIGNED_COLUMNS.includes(field)) {
        return `<span class="${signClass(value)}">${value}</span>`;
      }
      return esc(value);
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

/* ---------- Lọc nhanh (chip) — dùng các cột CÓ SẴN trong CSV ---------- */
const QUICK_FILTERS = [
  { id: "rs90",       label: "Top RS ≥ 90",        test: (r) => num(r.rs_rating) >= 90 },
  { id: "canslim",    label: "CANSLIM",             test: (r) => num(r.rs_rating) >= 90 && isTrue(r.above_sma50) && isTrue(r.above_sma200) && num(r.pct_from_52w_high) >= -25 },
  { id: "smcup",      label: "SMC UP",              test: (r) => String(r.structure).toLowerCase() === "up" },
  { id: "nearlow",    label: "Gần Swing Low ≤10%",  test: (r) => num(r.dist_swing_low_pct) <= 10 },
  { id: "hiliq",      label: "Thanh khoản ≥50 tỷ",  test: (r) => num(r.gtgd20_ty) >= 50 },
  { id: "froom",      label: "Room ngoại >20%",     test: (r) => num(r.foreign_room_pct) > 20 },
  { id: "pe15",       label: "PE < 15",             test: (r) => num(r.pe) > 0 && num(r.pe) < 15 },
  { id: "roe15",      label: "ROE > 15%",           test: (r) => num(r.roe) > 15 },
  { id: "oversold",   label: "RSI < 30",            test: (r) => num(r.rsi14) < 30 },
  { id: "overbought", label: "RSI > 70",            test: (r) => num(r.rsi14) > 70 },
];

const activeQuickFilters = new Set();

function initQuickFilters(table) {
  const box = document.getElementById("quick-filters");
  if (!box) return;

  // Đăng ký bộ lọc tùy chỉnh với DataTables (AND tất cả chip đang bật)
  DataTable.ext.search.push(function (settings, data, dataIndex) {
    if (settings.nTable.id !== "market-table") return true;
    if (!activeQuickFilters.size) return true;
    const row = table.row(dataIndex).data();
    for (const id of activeQuickFilters) {
      const f = QUICK_FILTERS.find((q) => q.id === id);
      if (f && !f.test(row)) return false;
    }
    return true;
  });

  QUICK_FILTERS.forEach((f) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "chip";
    btn.textContent = f.label;
    btn.addEventListener("click", () => {
      if (activeQuickFilters.has(f.id)) {
        activeQuickFilters.delete(f.id);
        btn.classList.remove("active");
      } else {
        activeQuickFilters.add(f.id);
        btn.classList.add("active");
      }
      table.draw();
    });
    box.appendChild(btn);
  });

  // Nút xóa tất cả bộ lọc
  const clearBtn = document.createElement("button");
  clearBtn.type = "button";
  clearBtn.className = "chip chip-clear";
  clearBtn.textContent = "✕ Xóa lọc";
  clearBtn.addEventListener("click", () => {
    activeQuickFilters.clear();
    box.querySelectorAll(".chip.active").forEach((c) => c.classList.remove("active"));
    document.getElementById("filter-exchange").value = "";
    document.getElementById("filter-industry").value = "";
    table.search("").columns().search("").draw();
  });
  box.appendChild(clearBtn);
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
    scrollY: "56vh",
    scrollCollapse: true,
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

  initQuickFilters(table);
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
      fillMarketKpis(results.data);
      renderCharts(results.data);
    },
    error: function (err) {
      showTableError(err.message || "Không tải được file CSV.");
    },
  });
}

function showTableError(message) {
  document.getElementById("table-status").innerHTML = `
    <div class="alert alert-warning mb-0 text-start">
      <strong>⚠️ Chưa tải được bảng dữ liệu</strong> (${esc(message)}).<br>
      Kiểm tra: file <code>screen_snapshot.csv</code> đã tồn tại chưa
      (chạy <code>sync_and_push.bat</code> để copy dữ liệu sang).
    </div>`;
}

/* ---------- KHỞI CHẠY ---------- */
document.addEventListener("DOMContentLoaded", () => {
  initReportToggle();
  loadAiReport();
  loadJsonReport();
  loadMarketTable();
});
