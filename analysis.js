/* ============================================================
 * VNSTOCK — analysis.js (trang Phân tích Quant)
 * Nguồn DUY NHẤT: analysis_latest.json (sinh bởi stock_analyzer.py).
 * JavaScript CHỈ HIỂN THỊ — mọi tính toán nằm ở Python.
 * Thiếu/hỏng JSON -> hộp thông báo thân thiện, không bao giờ trang trắng.
 * ============================================================ */

const ANALYSIS_URL = "analysis_latest.json";

/* ---------- Helpers (cùng quy ước với app.js) ---------- */
const esc = (s) =>
  String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const isNil = (v) => v === null || v === undefined || v === "" || Number.isNaN(v);
const fmt = (v, d = 1) =>
  isNil(v) ? "–" : Number(v).toLocaleString("vi-VN", { maximumFractionDigits: d });

/* Màu điểm 0-100 dùng badge-soft có sẵn trong style.css */
const scoreCls = (v) => (v >= 70 ? "bs-green" : v >= 55 ? "bs-amber" : v >= 40 ? "bs-gray" : "bs-red");
const scoreBadge = (v, d = 0) => `<span class="badge-soft ${scoreCls(Number(v))}">${fmt(v, d)}</span>`;

/* Chế độ thị trường (regime tiếng Việt từ Python) -> màu KPI */
const REGIME_CLS = { "tích cực": "text-success", "trung tính": "text-warning", "phòng thủ": "text-danger" };

/* Nhãn tiếng Việt cho cột top_picks của từng chiến lược (field lạ thì hiện nguyên tên) */
const FIELD_LABELS = {
  ticker: "Mã", industry: "Ngành", exchange: "Sàn", close: "Giá",
  pe: "P/E", pe_nganh: "P/E ngành", pb: "P/B", roe: "ROE %", dividend_yield: "Cổ tức %",
  rs_rating: "RS", pct_from_52w_high: "Cách đỉnh %", rel_vol: "Rel vol",
  gtgd20_ty: "GTGD20 (tỷ)", structure: "Cấu trúc", chg_today_pct: "% phiên",
  ret_1m: "1 tháng %", ret_3m: "3 tháng %", ret_6m: "6 tháng %", ret_12m: "12 tháng %",
  adx14: "ADX", roc20: "ROC20 %", cmf20: "CMF20", obv_up: "OBV tích lũy",
  bb_squeeze: "Squeeze", bos_up_recent: "BOS↑", dist_swing_low_pct: "Cách swing low %",
  smc: "SMC", smc_lib: "SMC thư viện", patterns: "Mẫu nến", confluence: "Hội tụ",
  market_cap_ty: "Vốn hóa (tỷ)", foreign_room_pct: "Room ngoại %",
  free_float_pct: "Free float %", f_proxy: "F-proxy /9", sector_score: "Điểm ngành",
};

/* Cột hiện màu xanh/đỏ theo dấu (cùng tinh thần SIGNED_COLUMNS của app.js) */
const SIGNED_FIELDS = new Set([
  "chg_today_pct", "ret_1m", "ret_3m", "ret_6m", "ret_12m",
  "pct_from_52w_high", "roc20", "cmf20",
]);

/* Tên hiển thị của 10 chiến lược */
const STRAT_LABELS = {
  value: "Value — định giá rẻ", canslim: "CANSLIM — cổ phiếu dẫn dắt",
  momentum: "Momentum — đà tăng", ftse: "FTSE — ứng viên nâng hạng",
  fscore: "F-Score — sức khỏe tài chính (proxy)", smc: "SMC — Smart Money",
  breakout: "Breakout — phá đỉnh", turnaround: "Turnaround — đảo chiều",
  rs: "Relative Strength — RS ≥ 90", sector: "Sector Rotation — xoay ngành",
};

function hideCard(id) {
  const el = document.getElementById(id);
  if (el) el.style.display = "none";
}

/* Giá trị 1 ô trong bảng picks: số/chuỗi/bool -> HTML đã escape */
function cellHtml(field, v) {
  if (isNil(v)) return '<span class="val-dot">·</span>';
  if (field === "ticker") return esc(v);
  if (field === "close") return fmt(v, 0);
  if (typeof v === "boolean") return v ? '<span class="val-check">✓</span>' : '<span class="val-dot">·</span>';
  if (field === "rs_rating") {
    const cls = v > 90 ? "bs-green" : v >= 80 ? "bs-amber" : "bs-gray";
    return `<span class="badge-soft ${cls}">${fmt(v, 0)}</span>`;
  }
  if (field === "structure") {
    const s = String(v).toLowerCase();
    const cls = s === "up" ? "bs-green" : s === "side" ? "bs-amber" : s === "down" ? "bs-red" : "bs-gray";
    return `<span class="badge-soft ${cls}">${esc(String(v).toUpperCase())}</span>`;
  }
  if (typeof v === "number" && SIGNED_FIELDS.has(field)) {
    const cls = v > 0 ? "val-pos" : v < 0 ? "val-neg" : "";
    return `<span class="${cls}">${fmt(v, 2)}</span>`;
  }
  if (typeof v === "number") return fmt(v, 2);
  return esc(v);
}

/* ============================================================
 * KPI — Tóm tắt & xu hướng thị trường
 * ============================================================ */
function renderKpis(p) {
  const s = p.summary || {};
  const b = (p.market || {}).breadth;

  document.getElementById("last-updated").textContent =
    `Cập nhật: ${s.generated_at || "?"} · phiên ${s.session_date || "?"}`;

  // Chế độ thị trường
  const kpiRegime = document.getElementById("kpi-regime");
  kpiRegime.textContent = (s.regime || "—").toUpperCase();
  kpiRegime.className = "kpi-value " + (REGIME_CLS[String(s.regime || "").toLowerCase()] || "");
  document.getElementById("kpi-regime-sub").textContent =
    `${fmt(s.n_stocks_live, 0)} mã live · phiên ${s.session_date || "?"}`;

  // Breadth
  const pct = s.pct_above_ma200;
  const kb = document.getElementById("kpi-breadth");
  kb.textContent = isNil(pct) ? "—" : fmt(pct, 1) + "%";
  kb.className = "kpi-value " + (pct >= 50 ? "text-success" : pct >= 30 ? "text-warning" : "text-danger");
  document.getElementById("kpi-breadth-sub").textContent = "mã trên MA200 toàn thị trường";
  document.getElementById("kpi-breadth-bar").style.width = (isNil(pct) ? 0 : pct) + "%";

  // Xu hướng phiên: tăng/giảm/đứng
  if (b && !isNil(b.n_up)) {
    const tot = (b.n_up || 0) + (b.n_down || 0) + (b.n_flat || 0) || 1;
    document.getElementById("kpi-updown").innerHTML =
      `<span class="val-pos">${fmt(b.n_up, 0)}</span> / <span class="val-neg">${fmt(b.n_down, 0)}</span> / ${fmt(b.n_flat, 0)}`;
    document.getElementById("kpi-updown-bar").innerHTML =
      `<span class="u" style="width:${(b.n_up / tot) * 100}%"></span>` +
      `<span class="d" style="width:${(b.n_down / tot) * 100}%"></span>` +
      `<span class="f" style="width:${(b.n_flat / tot) * 100}%"></span>`;
  }

  // Điểm trung bình toàn thị trường (hiển thị gộp từ scores có sẵn)
  const scores = Object.values(p.scores || {}).map((v) => v[0]).filter((v) => !isNil(v));
  if (scores.length) {
    const avg = scores.reduce((a, c) => a + c, 0) / scores.length;
    const ka = document.getElementById("kpi-avgscore");
    ka.textContent = fmt(avg, 1);
    ka.className = "kpi-value " + (avg >= 55 ? "text-success" : avg >= 45 ? "text-warning" : "text-danger");
    document.getElementById("kpi-avgscore-sub").textContent = `trung bình ${scores.length} mã (0-100)`;
  }

  // Mã điểm cao nhất
  const top = (p.top_stocks || [])[0];
  if (top) {
    document.getElementById("kpi-top").innerHTML =
      `${esc(top.ticker)} <span class="badge-soft ${scoreCls(top.score)}">${fmt(top.score, 1)}</span>`;
    document.getElementById("kpi-top-sub").textContent = top.industry || "";
  }
}

/* ============================================================
 * Top cơ hội — 6 mã điểm cao nhất dưới dạng thẻ
 * ============================================================ */
function renderOpportunities(p) {
  const tops = (p.top_stocks || []).slice(0, 6);
  if (!tops.length) return hideCard("card-opportunities");
  document.getElementById("opp-session").textContent = (p.summary || {}).session_date || "";
  document.getElementById("opportunities").innerHTML = tops.map((t) => `
    <div class="opp-card">
      <div class="d-flex align-items-center justify-content-between">
        <span class="opp-ticker">${esc(t.ticker)}</span>
        ${scoreBadge(t.score, 1)}
      </div>
      <div class="opp-industry">${esc(t.industry || "–")} · ${esc(t.exchange || "")}</div>
      <div class="small">Giá ${fmt(t.close, 0)} · CB ${fmt(t.score_fundamental, 0)} · KT ${fmt(t.score_technical, 0)} · Đà ${fmt(t.score_momentum, 0)}</div>
      <div class="opp-strats">${(t.strategies || [])
        .map((x) => `<span class="badge-soft bs-blue">${esc(x)}</span>`).join("") || '<span class="badge-soft bs-gray">chưa chiến lược nào bắt</span>'}</div>
    </div>`).join("");
}

/* ============================================================
 * Top 20 — bảng điểm + giải thích 6 cấu phần khi bấm vào dòng
 * ============================================================ */
const EXPLAIN_LABELS = [
  ["fundamental", "Cơ bản"], ["technical", "Kỹ thuật"], ["momentum", "Đà tăng"],
  ["liquidity", "Thanh khoản"], ["macro", "Vĩ mô"], ["risk", "Rủi ro"],
];

function renderTop20(p) {
  const tops = p.top_stocks || [];
  if (!tops.length) return hideCard("card-top20");

  const head = ["Mã", "Ngành", "Điểm", "Cơ bản", "Kỹ thuật", "Đà", "Thanh khoản", "Vĩ mô", "Rủi ro", "Chiến lược bắt"];
  const body = tops.map((t, i) => `
    <tr class="an-row-click" data-idx="${i}">
      <td class="ticker-cell">${esc(t.ticker)}</td>
      <td>${esc(t.industry || "–")}</td>
      <td>${scoreBadge(t.score, 1)}</td>
      <td>${fmt(t.score_fundamental, 0)}</td>
      <td>${fmt(t.score_technical, 0)}</td>
      <td>${fmt(t.score_momentum, 0)}</td>
      <td>${fmt(t.score_liquidity, 0)}</td>
      <td>${fmt(t.score_macro, 0)}</td>
      <td>${fmt(t.score_risk, 0)}</td>
      <td>${(t.strategies || []).map((x) => `<span class="badge-soft bs-blue">${esc(x)}</span>`).join(" ") || '<span class="val-dot">·</span>'}</td>
    </tr>`).join("");

  document.getElementById("top20-table").innerHTML =
    `<thead><tr>${head.map((h) => `<th>${h}</th>`).join("")}</tr></thead><tbody>${body}</tbody>`;

  // Bấm dòng -> chèn/gỡ dòng giải thích 6 cấu phần (UI-only, dữ liệu từ explain của Python)
  document.querySelectorAll("#top20-table tr.an-row-click").forEach((tr) => {
    tr.addEventListener("click", () => {
      const next = tr.nextElementSibling;
      if (next && next.classList.contains("an-explain")) { next.remove(); return; }
      const t = tops[Number(tr.dataset.idx)];
      const items = EXPLAIN_LABELS
        .filter(([k]) => t.explain && t.explain[k])
        .map(([k, label]) => `<li><b>${label}:</b> ${esc(t.explain[k])}</li>`).join("");
      const row = document.createElement("tr");
      row.className = "an-explain";
      row.innerHTML = `<td colspan="${head.length}"><ul class="mb-0 ps-3">${items || "<li>Không có giải thích.</li>"}</ul></td>`;
      tr.after(row);
    });
  });

  // Footer: cách chấm điểm (score_method) — thu gọn mặc định
  const m = p.score_method;
  if (m && m.components) {
    const weights = Object.entries(m.weights || {})
      .map(([k, v]) => `${k} ${(v * 100).toFixed(0)}%`).join(" · ");
    document.getElementById("score-method").innerHTML = `
      <details>
        <summary style="cursor:pointer">🧮 Cách chấm điểm (trọng số: ${esc(weights)})</summary>
        <ul class="mb-1 mt-2 ps-3">
          ${Object.entries(m.components).map(([k, v]) => `<li><b>${esc(k)}</b>: ${esc(v)}</li>`).join("")}
        </ul>
        ${m.indicator_blend ? `<div class="mt-1">${esc(m.indicator_blend)}</div>` : ""}
        ${m.limits ? `<div class="mt-1">⚠️ ${esc(m.limits)}</div>` : ""}
      </details>`;
  }
}

/* ============================================================
 * Kết quả 10 chiến lược — accordion, bảng cột động theo JSON
 * ============================================================ */
function renderStrategies(p) {
  const strats = p.strategies || [];
  if (!strats.length) return hideCard("card-strategies");

  document.getElementById("strategies").innerHTML = strats.map((st) => {
    const label = STRAT_LABELS[st.name] || st.name;
    const cntCls = st.count > 0 ? "bs-green" : "bs-gray";
    let table = '<p class="text-muted small mb-0">Không có mã nào đạt tiêu chí phiên này.</p>';
    if ((st.top_picks || []).length) {
      const fields = Object.keys(st.top_picks[0]);
      table = `<div class="an-scroll"><table class="an-table">
        <thead><tr>${fields.map((f) => `<th>${esc(FIELD_LABELS[f] || f)}</th>`).join("")}</tr></thead>
        <tbody>${st.top_picks.map((r) => `<tr>${fields.map((f) =>
          `<td${f === "ticker" ? ' class="ticker-cell"' : ""}>${cellHtml(f, r[f])}</td>`).join("")}</tr>`).join("")}
        </tbody></table></div>
        ${st.count > st.top_picks.length
          ? `<div class="small text-muted mt-1">Hiện ${st.top_picks.length}/${st.count} mã điểm cao nhất.</div>` : ""}`;
    }
    return `
      <details class="watch-item">
        <summary>
          <span class="watch-ticker">${esc(label)}</span>
          <span class="badge-soft ${cntCls}">${fmt(st.count, 0)} mã</span>
          <span class="watch-caret">▼</span>
        </summary>
        <div class="watch-body">
          <p class="mb-2">${esc(st.criteria || st.desc || "")}</p>
          ${table}
        </div>
      </details>`;
  }).join("");
}

/* ============================================================
 * Gợi ý danh mục
 * ============================================================ */
function renderPortfolio(p) {
  const po = p.portfolio_suggestions;
  if (!po || !(po.positions || []).length) return hideCard("card-portfolio");

  const rows = po.positions.map((x) => `
    <tr>
      <td class="ticker-cell">${esc(x.ticker)}</td>
      <td>${esc(x.industry || "–")}</td>
      <td>${scoreBadge(x.score, 1)}</td>
      <td style="min-width:110px">
        <div class="d-flex align-items-center gap-2">
          <div class="mini-bar flex-grow-1"><span style="width:${Math.min(100, (x.weight_pct / (po.equity_pct || 100)) * 100)}%"></span></div>
          <span>${fmt(x.weight_pct, 1)}%</span>
        </div>
      </td>
    </tr>`).join("");

  document.getElementById("portfolio").innerHTML = `
    <div class="d-flex align-items-center gap-2 mb-2">
      <span class="badge-soft ${REGIME_CLS[String(po.regime || "").toLowerCase()] === "text-success" ? "bs-green"
        : REGIME_CLS[String(po.regime || "").toLowerCase()] === "text-danger" ? "bs-red" : "bs-amber"}">
        ${esc((po.regime || "?").toUpperCase())}</span>
      <span class="small">Cổ phiếu <b>${fmt(po.equity_pct, 0)}%</b> · tiền mặt <b>${fmt(po.cash_pct, 0)}%</b></span>
    </div>
    <div class="an-scroll"><table class="an-table">
      <thead><tr><th>Mã</th><th>Ngành</th><th>Điểm</th><th>Tỷ trọng</th></tr></thead>
      <tbody>${rows}</tbody>
    </table></div>
    ${po.note ? `<div class="small text-muted mt-2">${esc(po.note)}</div>` : ""}`;
}

/* ============================================================
 * Xoay ngành — bảng breadth ngành kèm thanh %MA200
 * ============================================================ */
function renderSectors(p) {
  const sectors = (p.market || {}).sectors || [];
  if (!sectors.length) return hideCard("card-sectors");

  const rows = sectors.map((s) => {
    const pct = s.pct_above_ma200;
    const barCls = pct >= 50 ? "var(--success)" : pct >= 30 ? "var(--warning)" : "var(--danger)";
    return `<tr>
      <td>${esc(s.group)}</td>
      <td>${fmt(s.n_symbols, 0)}</td>
      <td style="min-width:120px">
        <div class="d-flex align-items-center gap-2">
          <div class="mini-bar flex-grow-1"><span style="width:${isNil(pct) ? 0 : pct}%; background:${barCls}"></span></div>
          <span>${fmt(pct, 0)}%</span>
        </div>
      </td>
      <td>${fmt(s.avg_rs_rating, 0)}</td>
      <td>${cellHtml("ret_1m", s.avg_ret_1m)}</td>
    </tr>`;
  }).join("");

  document.getElementById("sector-table").innerHTML =
    `<thead><tr><th>Ngành</th><th>Số mã</th><th>% trên MA200</th><th>RS TB</th><th>1 tháng %</th></tr></thead>
     <tbody>${rows}</tbody>`;
}

/* ============================================================
 * Vĩ mô + Rủi ro + Tóm tắt phiên chạy
 * ============================================================ */
function renderMacro(p) {
  const items = (p.market || {}).macro_highlights || [];
  if (!items.length) return hideCard("card-macro");
  document.getElementById("macro").innerHTML =
    `<ul class="action-list">${items.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>`;
}

function renderRisks(p) {
  const risks = p.risks || [];
  if (!risks.length) return hideCard("card-risks");
  document.getElementById("risks").innerHTML =
    `<ul class="watch-risks ps-3">${risks.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>`;
}

function renderRunSummary(p) {
  const s = p.summary || {};
  const counts = Object.entries(s.strategy_counts || {})
    .map(([k, v]) => `<span class="badge-soft ${v > 0 ? "bs-blue" : "bs-gray"}">${esc(k)} ${fmt(v, 0)}</span>`)
    .join(" ");
  document.getElementById("run-summary").innerHTML = `
    <ul class="action-list mb-0">
      <li>Sinh lúc <b>${esc(s.generated_at || "?")}</b> · phiên <b>${esc(s.session_date || "?")}</b>.</li>
      <li><b>${fmt(s.n_stocks_live, 0)}</b> mã live được chấm điểm.</li>
      ${s.indicator_coverage ? `<li>Chỉ báo thư viện: ${esc(s.indicator_coverage)}.</li>` : ""}
      ${counts ? `<li class="mt-1">${counts}</li>` : ""}
    </ul>`;
}

/* ============================================================
 * KHỞI CHẠY — fetch + try/catch, không bao giờ để trang trắng
 * ============================================================ */
function showFatal(message) {
  ["kpi-section", "card-opportunities", "card-top20", "card-strategies",
   "card-portfolio", "card-sectors", "card-macro", "card-risks", "card-summary"]
    .forEach(hideCard);
  const box = document.getElementById("fatal-error");
  box.style.display = "block";
  box.innerHTML = `
    <strong>⚠️ Chưa tải được báo cáo Quant</strong> (${esc(message)}).<br>
    Kiểm tra: file <code>analysis_latest.json</code> đã tồn tại chưa
    (chạy <code>python stock_analyzer.py --strategy all</code> để sinh).<br>
    Lưu ý: khi xem local phải chạy qua web server
    (vd: <code>python -m http.server</code>), mở trực tiếp file sẽ bị chặn CORS.`;
  document.getElementById("last-updated").textContent = "Chưa có dữ liệu";
}

document.addEventListener("DOMContentLoaded", async () => {
  let payload;
  try {
    const res = await fetch(ANALYSIS_URL, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    payload = await res.json();   // JSON hỏng sẽ ném lỗi tại đây
  } catch (err) {
    showFatal(err.message || String(err));
    return;
  }
  // Từng khu render riêng — 1 khu thiếu dữ liệu thì ẩn khu đó, không đổ cả trang
  try { renderKpis(payload); } catch (e) { console.error("kpis:", e); }
  try { renderOpportunities(payload); } catch (e) { console.error("opportunities:", e); hideCard("card-opportunities"); }
  try { renderTop20(payload); } catch (e) { console.error("top20:", e); hideCard("card-top20"); }
  try { renderStrategies(payload); } catch (e) { console.error("strategies:", e); hideCard("card-strategies"); }
  try { renderPortfolio(payload); } catch (e) { console.error("portfolio:", e); hideCard("card-portfolio"); }
  try { renderSectors(payload); } catch (e) { console.error("sectors:", e); hideCard("card-sectors"); }
  try { renderMacro(payload); } catch (e) { console.error("macro:", e); hideCard("card-macro"); }
  try { renderRisks(payload); } catch (e) { console.error("risks:", e); hideCard("card-risks"); }
  try { renderRunSummary(payload); } catch (e) { console.error("summary:", e); hideCard("card-summary"); }
});
