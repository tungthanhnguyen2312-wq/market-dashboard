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
const BUILD_INFO_URL = "data/build_info.json";
let currentBuildInfo = window.BUILD_INFO || null;

/* Các cột hiển thị màu xanh/đỏ theo giá trị dương/âm */
const SIGNED_COLUMNS = [
  "chg_today_pct", "ret_1m", "ret_3m", "ret_6m", "ret_12m",
  "macd_hist", "pct_from_52w_high",
];

/* Các cột boolean hiển thị dấu ✓ */
const BOOL_COLUMNS = ["above_sma50", "above_sma200", "golden_cross", "near_52w_high"];

/* Cột dạng chữ (không phải số) — mọi field CSV còn lại được coi là số nên căn phải
   cho đúng quy ước đọc bảng tài chính (dễ so sánh độ lớn theo cột dọc). */
const TEXT_COLUMNS = new Set(["ticker", "date", "exchange", "industry", "structure", "margin_status"]);
const isNumericField = (field) => !TEXT_COLUMNS.has(field) && !BOOL_COLUMNS.includes(field);

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
/* ai_report_latest.md thường bắt đầu bằng tiêu đề Markdown "# ..." — marked.parse()
   sẽ sinh ra <h1> cho dòng đó, nhưng trang dashboard đã có đúng 1 <h1> tĩnh riêng
   (tiêu đề trang). Hạ mọi <h1> bên trong #ai-report xuống <h2> (giữ nguyên nội dung/
   thuộc tính) để toàn trang chỉ còn đúng 1 <h1> — không đụng tới file .md, không đổi
   cấu hình marked (renderer/setOptions) nên các trang khác dùng marked không ảnh hưởng. */
function demoteReportHeadings(container) {
  container.querySelectorAll("h1").forEach((h1) => {
    const h2 = document.createElement("h2");
    for (const attr of h1.attributes) h2.setAttribute(attr.name, attr.value);
    while (h1.firstChild) h2.appendChild(h1.firstChild);
    h1.replaceWith(h2);
  });
}

/* ai_report_latest.json không có trường ngày riêng — ngày của TOÀN BỘ báo cáo (JSON +
   Markdown, xuất bản cùng lúc) chỉ có trong tiêu đề .md. loadJsonReport() cần đúng
   ngày này để quyết định vị trí Kế hoạch hành động nhưng KHÔNG fetch lại .md lần 2 —
   dùng chung promise này, được loadAiReport() resolve đúng 1 lần (giá trị hoặc null)
   dù thành công hay lỗi, nên loadJsonReport() không bao giờ chờ vô thời hạn. */
let resolveReportDate;
const reportDateReady = new Promise((resolve) => { resolveReportDate = resolve; });

async function loadAiReport() {
  const container = document.getElementById("ai-report");
  try {
    const res = await fetch(REPORT_URL, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const md = await res.text();

    container.innerHTML = marked.parse(md);
    demoteReportHeadings(container);

    // Lấy ngày báo cáo từ tiêu đề (vd: "... — 2026-07-09") để hiện lên badge
    const dateMatch = md.match(/(\d{4}-\d{2}-\d{2})/);
    if (dateMatch) {
      document.getElementById("report-date").textContent = dateMatch[1];
    }
    resolveReportDate(dateMatch ? dateMatch[1] : null);
  } catch (err) {
    container.classList.remove("collapsed");
    const toggle = document.getElementById("report-toggle");
    if (toggle) toggle.style.display = "none";
    container.innerHTML = `
      <div class="vs-alert vs-alert-warning mb-0">
        <strong>Không thể tải Báo cáo AI</strong> (${esc(err.message)}).<br>
        Vui lòng chạy lại quy trình đồng bộ dữ liệu.<br>
        Lưu ý: khi xem local phải chạy qua web server
        (vd: <code>python -m http.server</code>), mở trực tiếp file sẽ bị chặn CORS.
      </div>`;
    resolveReportDate(null);
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

/* "Hiện tại" = ngày báo cáo TRÙNG với market_session của build_info.json — session
   này do pipeline backend tự tính (phiên giao dịch gần nhất có dữ liệu thật, đã tự
   né cuối tuần/lễ), nên so sánh trực tiếp với nó luôn đúng theo lịch giao dịch mà
   KHÔNG cần dò cuối tuần/lễ thủ công ở đây — khác hẳn cách so sánh ngây thơ
   "reportDate < hôm nay theo lịch dương". Thiếu 1 trong 2 mốc (build_info chưa có
   market_session, hoặc không đọc được ngày báo cáo) → coi là báo cáo cũ (an toàn,
   không bao giờ nhận nhầm 1 báo cáo không rõ tuổi là "mới"). */
function isActionPlanCurrent(reportDate) {
  const session = currentBuildInfo && currentBuildInfo.market_session;
  if (!session || !reportDate) return false;
  return reportDate === session;
}

async function loadJsonReport() {
  const watchlistBox = document.getElementById("watchlist");
  const actionBox = document.getElementById("action-plan");
  const historicalCard = document.getElementById("action-plan-historical-card");
  const historicalBox = document.getElementById("action-plan-historical");
  const historicalDateBadge = document.getElementById("action-plan-historical-date");
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

    // --- Kế hoạch hành động: hiện ở panel quyết định (trên) nếu đúng phiên mới nhất,
    // ngược lại chuyển nguyên nội dung xuống thẻ lịch sử (không hiện đồng thời ở cả 2). ---
    const hasPlan = Array.isArray(data.action_plan) && data.action_plan.length;
    if (!hasPlan) {
      actionBox.innerHTML = `<li class="text-muted">Không có kế hoạch trong báo cáo hôm nay.</li>`;
      if (historicalCard) historicalCard.hidden = true;
    } else {
      const reportDate = await reportDateReady;
      const planItemsHtml = data.action_plan.map((a) => `<li>${esc(a)}</li>`).join("");
      if (isActionPlanCurrent(reportDate)) {
        actionBox.innerHTML = planItemsHtml;
        if (historicalCard) historicalCard.hidden = true;
      } else {
        actionBox.innerHTML = `<li class="text-muted">Kế hoạch hành động thuộc báo cáo cũ hơn — xem "Kế hoạch hành động (báo cáo cũ)" bên dưới.</li>`;
        if (historicalCard) {
          historicalCard.hidden = false;
          if (historicalDateBadge) historicalDateBadge.textContent = reportDate ? `Báo cáo ${reportDate}` : "Không rõ ngày báo cáo";
          if (historicalBox) historicalBox.innerHTML = planItemsHtml;
        }
      }
    }
  } catch (err) {
    watchlistBox.innerHTML = `<p class="text-muted mb-0">Chưa tải được dữ liệu Watchlist (${esc(err.message)}).</p>`;
    actionBox.innerHTML = `<li class="text-muted">Không có dữ liệu.</li>`;
    if (historicalCard) historicalCard.hidden = true;
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
  applyChartTheme();

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
function formatCell(field, value) {
  if (value === null || value === undefined || value === "") return "–";
  if (field === "ticker") return esc(value);
  if (field === "exchange") return esc(displayExchange(value) || "–");
  if (field === "close") {
    const v = num(value);
    return isNaN(v) ? esc(value) : v.toLocaleString("vi-VN");
  }
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
    return isTrue(value) ? `<span class="val-check">✓</span>` : `<span class="val-dot">·</span>`;
  }
  const v = num(value);
  if (!isNaN(v) && SIGNED_COLUMNS.includes(field)) {
    return `<span class="${signClass(v)}">${esc(value)}</span>`;
  }
  return esc(value);
}

function buildColumns(fields) {
  return fields.map((field) => ({
    data: field,
    title: COLUMN_LABELS[field] || field,
    defaultContent: "",
    className: isNumericField(field) ? "text-end" : undefined,
    createdCell:
      field === "ticker"
        ? (td) => td.classList.add("ticker-cell")
        : undefined,
    render: function (value, type) {
      if (type !== "display") return value;
      return formatCell(field, value);
    },
  }));
}

function populateFilter(selectId, values, labeler = (v) => v) {
  const select = document.getElementById(selectId);
  [...values]
    .filter((v) => v !== null && v !== undefined && v !== "")
    .sort((a, b) => String(a).localeCompare(String(b), "vi"))
    .forEach((v) => {
      const opt = document.createElement("option");
      opt.value = v;
      opt.textContent = labeler(v);
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

  const columns = buildColumns(fields);
  const table = new DataTable("#market-table", {
    data: rows,
    columns,
    pageLength: 15,
    lengthMenu: [10, 15],
    order: [[fields.indexOf("rs_rating"), "desc"]],
    language: DT_LANG_VI,
  });
  applyColumnHints(document.getElementById("market-table"), columns);

  let currentCardRows = [];
  const cardHost = document.getElementById("screener-cards");
  const metric = (label, field, row) => `
    <div class="screener-metric"><span>${esc(label)}</span><strong>${formatCell(field, row[field])}</strong></div>`;
  const group = (title, pairs, row) => `
    <section class="screener-detail-group"><h6>${esc(title)}</h6><div>${pairs.map(([label, field]) => metric(label, field, row)).join("")}</div></section>`;
  /* Thẻ screener dùng <details>/<summary> gốc (cùng mẫu .watch-item): tóm tắt gọn
     (mã, sàn, ngành, ngày, giá, %, cấu trúc, thanh khoản, margin) luôn hiển thị và
     tự có hành vi mở/đóng bằng chuột lẫn bàn phím (Enter/Space) qua semantics HTML
     gốc — không cần JS tự viết, không cần role/tabindex thủ công. Phân tích phụ
     (RS/RSI/KL tương đối/momentum/xu hướng/52 tuần/hiệu suất/cơ bản/rủi ro) chỉ nằm
     trong phần mở rộng. Nút "Mở hồ sơ" nằm NGOÀI <summary> (không lồng interactive
     control vào trong summary) nên bấm nó không đụng tới trạng thái đóng/mở thẻ. */
  const renderCards = () => {
    currentCardRows = table.rows({ page: "current", search: "applied", order: "applied" }).data().toArray();
    cardHost.innerHTML = currentCardRows.length ? currentCardRows.map((row, index) => `
      <details class="screener-record" data-card-index="${index}">
        <summary class="screener-record-head">
          <div><span class="screener-ticker">${esc(row.ticker)}</span><span class="badge-soft bs-blue">${esc(displayExchange(row.exchange) || "–")}</span></div>
          <div class="screener-company-meta">${esc(row.industry || "Chưa rõ ngành")} · ${formatCell("date", row.date)}</div>
          <div class="screener-price"><strong>${formatCell("close", row.close)}</strong><span class="${signClass(row.chg_today_pct)}">${formatCell("chg_today_pct", row.chg_today_pct)}%</span></div>
          <div class="screener-compact-status">
            ${formatCell("structure", row.structure)}
            <span class="screener-compact-liquidity" title="GTGD bình quân 20 phiên (tỷ đồng)">${formatCell("gtgd20_ty", row.gtgd20_ty)} tỷ</span>
            ${row.margin_status ? `<span class="badge-margin">${esc(row.margin_status)}</span>` : `<span class="badge-soft bs-green">Margin sạch</span>`}
            <span class="screener-caret" aria-hidden="true">▾</span>
          </div>
        </summary>
        <div class="screener-record-body">
          <div class="screener-detail-grid">
            ${group("Sức mạnh &amp; Momentum", [["RS", "rs_rating"], ["RSI 14", "rsi14"], ["KL tương đối", "rel_vol"], ["MACD Hist", "macd_hist"], ["BB %B", "bb_pctb"], ["ATR %", "atr_pct"]], row)}
            ${group("Xu hướng", [["Trên MA50", "above_sma50"], ["Trên MA200", "above_sma200"], ["Golden Cross", "golden_cross"]], row)}
            ${group("Biên 52 tuần", [["Cách đỉnh 52T %", "pct_from_52w_high"], ["Gần đỉnh 52T", "near_52w_high"], ["Trên đáy 52T %", "pct_above_52w_low"], ["Cách Swing Low %", "dist_swing_low_pct"]], row)}
            ${group("Hiệu suất", [["1 tháng %", "ret_1m"], ["3 tháng %", "ret_3m"], ["6 tháng %", "ret_6m"], ["12 tháng %", "ret_12m"]], row)}
            ${group("Cơ bản", [["P/E", "pe"], ["P/B", "pb"], ["ROE %", "roe"], ["Room ngoại %", "foreign_room_pct"]], row)}
            ${group("Rủi ro & sở hữu", [["Free Float", "free_float_est"], ["Cờ margin", "margin_status"]], row)}
          </div>
          <div class="screener-record-actions">
            <button type="button" class="vs-btn vs-btn-sm screener-open-profile" aria-label="Mở hồ sơ ${esc(row.ticker)}">Mở hồ sơ →</button>
          </div>
        </div>
      </details>`).join("") : `<div class="vs-empty"><div class="vs-empty-title">Không có mã phù hợp</div><div class="vs-empty-sub">Hãy nới bộ lọc hoặc từ khóa tìm kiếm.</div></div>`;
  };
  table.on("draw", renderCards);
  renderCards();
  // Chỉ nút "Mở hồ sơ" tường minh mới gọi company-panel — bấm/gõ phím trên phần tóm
  // tắt (summary) chỉ đóng/mở thẻ theo đúng semantics <details> gốc, không mở panel.
  cardHost.addEventListener("click", (event) => {
    const openBtn = event.target.closest(".screener-open-profile");
    if (!openBtn || !window.VSCompanyPanel) return;
    const card = openBtn.closest("[data-card-index]");
    if (card) VSCompanyPanel.open(currentCardRows[Number(card.dataset.cardIndex)]);
  });

  // Bộ lọc theo sàn và ngành (khớp chính xác giá trị của cột)
  const exchangeIdx = fields.indexOf("exchange");
  const industryIdx = fields.indexOf("industry");
  populateFilter("filter-exchange", new Set(rows.map((r) => normalizeExchange(r.exchange))), displayExchange);
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
  document.getElementById("sort-screener").addEventListener("change", (e) => {
    const [field, direction] = e.target.value.split(":");
    table.order([[fields.indexOf(field), direction]]).draw();
  });

  initQuickFilters(table);
}

function activeMarketSession(rows) {
  return rows.filter((r) => normalizeExchange(r.exchange) !== "DELISTED")
    .map((r) => String(r.date || "")).filter(Boolean).sort().at(-1) || "?";
}

function updateMarketFreshness(rows, source) {
  const session = currentBuildInfo?.market_session || activeMarketSession(rows);
  const published = currentBuildInfo?.generated_at || "chưa có manifest";
  // build_info.files[*].mtime is raw filesystem mtime of the source CSV, not a data/session
  // timestamp -- session (above) is the content-derived market session; this is diagnostic
  // file metadata only, labeled accordingly rather than as "snapshot".
  const fileMtime = currentBuildInfo?.files?.["screen_snapshot.csv"]?.mtime || published;
  const buildId = currentBuildInfo?.build_id || "legacy";
  document.getElementById("market-last-updated").textContent = `Phiên ${session} · file mtime ${fileMtime} · pipeline local`;
  document.getElementById("build-status").textContent = `Xuất bản ${published} · build ${buildId} · ${source}`;
}

async function loadBuildInfo() {
  try {
    const res = await fetch(`${BUILD_INFO_URL}?v=${Date.now()}`, {
      cache: "no-store", headers: { "Cache-Control": "no-cache" },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    currentBuildInfo = await res.json();
  } catch (err) {
    currentBuildInfo = window.BUILD_INFO || null;
  }
  return currentBuildInfo;
}

async function loadMarketTable() {
  let rows, fields, source = "HTTP", fetchErr = null;
  if (!isFileProtocol()) {
    try {
      const res = await fetch(`${CSV_URL}?v=${Date.now()}`, {
        cache: "no-store", headers: { "Cache-Control": "no-cache" },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const parsed = Papa.parse(await res.text(), { header: true, dynamicTyping: true, skipEmptyLines: true });
      rows = parsed.data;
      fields = parsed.meta.fields;
      if (!rows.length) throw new Error("CSV rỗng");
    } catch (err) {
      fetchErr = err;
    }
  }
  if (!rows || !rows.length) {
    // file:// (fetch luôn bị CORS chặn) hoặc fetch primary vừa thất bại — nạp fallback
    // .js CHỈ lúc này, không tải song song với fetch ở trên.
    await loadFallbackScript("data/screener_data.js", "SCREEN_ROWS");
    rows = Array.isArray(window.SCREEN_ROWS) ? window.SCREEN_ROWS : null;
    fields = rows?.length ? Object.keys(rows[0]) : [];
    source = "fallback";
    if (!rows?.length) { showTableError((fetchErr && fetchErr.message) || "Không tải được file CSV."); return; }
    const fallbackSession = window.SCREENER_DATA_META?.market_session || activeMarketSession(rows);
    if (currentBuildInfo?.market_session && fallbackSession < currentBuildInfo.market_session) {
      console.warn(`Fallback screener cũ: ${fallbackSession} < ${currentBuildInfo.market_session}`);
      source = `fallback cũ ${fallbackSession}`;
    }
  }
  rows.forEach((row) => { row.exchange = normalizeExchange(row.exchange); });
  initMarketTable(rows, fields);
  fillMarketKpis(rows);
  renderCharts(rows);
  updateMarketFreshness(rows, source);
}

function showTableError(message) {
  document.getElementById("table-status").innerHTML = `
    <div class="vs-alert vs-alert-warning mb-0 text-start">
      <strong>Không thể tải dữ liệu Stock Screener</strong> (${esc(message)}).<br>
      Vui lòng chạy lại quy trình đồng bộ dữ liệu.
    </div>`;
}

/* ---------- KHỞI CHẠY ---------- */
document.addEventListener("DOMContentLoaded", async () => {
  initReportToggle();
  loadAiReport();
  loadJsonReport();
  await loadBuildInfo();
  await loadMarketTable();
});
