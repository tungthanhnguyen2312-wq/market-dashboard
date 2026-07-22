/* ============================================================
 * VNSTOCK — assets/js/company-panel.js (dùng ở screener.html + signals.html)
 * Bấm vào dòng #tblScreen hoặc gọi VSCompanyPanel.open(row) -> mở panel trượt từ phải,
 * 3 tab: Tổng quan / Biểu đồ / Báo cáo tài chính.
 *
 * Lấy dữ liệu trực tiếp từ instance DataTables ĐANG CHẠY
 * (jQuery("#tblScreen").DataTable() trả về instance đã khởi tạo,
 * không tạo mới) — không fetch lại, không đụng tới script
 * tải/lọc/vẽ cột đã có sẵn trong screener.html.
 *
 * Tab "Báo cáo tài chính" CHƯA có dữ liệu — financial_snapshot.csv/
 * data_bctc/ vẫn là dữ liệu cá nhân, không public (xem .gitignore).
 * Tab này chỉ hiện trạng thái "đang chờ dữ liệu", không bịa số liệu.
 * ============================================================ */

(function () {
  const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const num = (v, d = 1) => (v === null || v === undefined || v === "" || Number.isNaN(v))
    ? "–" : Number(v).toLocaleString("vi-VN", { maximumFractionDigits: d });
  const valueSignClass = (v) => Number(v) > 0 ? "up" : Number(v) < 0 ? "down" : "flat";
  const structCls = (s) => {
    s = String(s).toLowerCase();
    return s === "up" ? "bs-green" : s === "side" ? "bs-amber" : s === "down" ? "bs-red" : "bs-gray";
  };

  let backdrop;
  let chartInstance = null;
  let corporateBundlePromise = null;

  const isObject = (value) => value !== null && typeof value === "object" && !Array.isArray(value);
  const displayValue = (value) => value === null || value === undefined || value === "" ? "-" : esc(value);
  const displayNumber = (value, digits = 2) => value === null || value === undefined || value === ""
    ? "-" : (Number.isFinite(Number(value)) ? num(value, digits) : esc(value));
  const titleCase = (value) => String(value || "").replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  const sectionState = (section) => isObject(section) && typeof section.status === "string" ? section.status.toLowerCase() : "available";
  const sectionData = (section) => isObject(section) && Object.prototype.hasOwnProperty.call(section, "data") ? section.data : section;
  const statusMessage = (state) => ({ missing: "Corporate Intelligence is not included in this bundle.", partial: "Data is incomplete; valid information is still shown.", malformed: "This subsection is invalid and cannot be displayed.", incomparable: "The snapshots are not comparable." }[state] || "");

  function sourceBlocks(value) {
    if (!isObject(value)) return [];
    if (isObject(value.sources)) return Object.entries(value.sources).filter(([, item]) => isObject(item) || Array.isArray(item));
    if (Array.isArray(value.sources)) return value.sources.filter((item) => isObject(item) || Array.isArray(item)).map((item) => [isObject(item) ? item.source || item.provider || "Source" : "Source", item]);
    if (["owners", "items", "holders", "subsidiaries", "entities"].some((key) => Array.isArray(value[key]))) return [[value.source || value.provider || "Source", value]];
    const ignored = new Set(["status", "data", "snapshot_date", "provenance_date", "reference", "reference_scope", "update_date"]);
    const entries = Object.entries(value).filter(([key, item]) => !ignored.has(key) && (isObject(item) || Array.isArray(item)));
    return entries.length ? entries : [[value.source || value.provider || "Source", value]];
  }
  function metadata(item) {
    if (!isObject(item)) return "";
    const bits = [item.source || item.provider, item.snapshot_date || item.provenance_date || item.as_of_date || item.update_date, item.reference_scope || item.reference || item.provenance].filter((value) => value !== null && value !== undefined && value !== "").map(esc);
    return bits.length ? `<div class="cp-ci-meta">${bits.join(" · ")}</div>` : "";
  }
  function fieldRows(item, fields) {
    if (!isObject(item)) return "";
    const rows = fields.filter(({ key }) => Object.prototype.hasOwnProperty.call(item, key)).map(({ key, label, number }) => `<div class="cp-ci-field"><span>${esc(label)}</span><strong>${number ? displayNumber(item[key]) : displayValue(item[key])}</strong></div>`);
    return rows.length ? `<div class="cp-ci-fields">${rows.join("")}</div>` : "";
  }
  function subsection(title, section, render) {
    const state = sectionState(section); if (state === "missing") return "";
    const notice = statusMessage(state), body = state === "malformed" ? "" : render(sectionData(section));
    return body || notice ? `<section class="cp-ci-section"><h4>${esc(title)}</h4>${notice ? `<div class="cp-ci-notice cp-ci-${esc(state)}">${esc(notice)}</div>` : ""}${body}</section>` : "";
  }
  function renderProfile(profile) {
    return sourceBlocks(profile).map(([source, item]) => { const values = isObject(item) ? item : {};
      const fields = Object.entries(values).filter(([key, value]) => !["source", "provider", "snapshot_date", "provenance_date", "as_of_date", "update_date", "reference", "reference_scope", "provenance", "status", "data"].includes(key) && (typeof value === "string" || typeof value === "number" || typeof value === "boolean"));
      return `<div class="cp-ci-source"><h5>${esc(source)}</h5>${metadata(values)}${fields.length ? `<div class="cp-ci-fields">${fields.map(([key, value]) => `<div class="cp-ci-field"><span>${esc(titleCase(key))}</span><strong>${displayValue(value)}</strong></div>`).join("")}</div>` : ""}</div>`;
    }).join("");
  }
  function renderOwnership(ownership) {
    return sourceBlocks(ownership).map(([source, item]) => { const rows = Array.isArray(item) ? item : (isObject(item) ? item.owners || item.items || item.holders || [] : []); if (!Array.isArray(rows)) return "";
      return `<div class="cp-ci-source"><h5>${esc(source)}</h5>${metadata(item)}${rows.map((owner) => isObject(owner) ? `<div class="cp-ci-record">${fieldRows(owner, [{ key: "owner_type", label: "Owner type" }, { key: "ownership_percentage", label: "Ownership %", number: true }, { key: "shares_owned", label: "Shares owned", number: true }, { key: "update_date", label: "Update date" }])}</div>` : "").join("")}</div>`;
    }).join("");
  }
  function renderMajorShareholders(value) {
    if (!isObject(value)) return ""; const snapshot = value.latest_valid_snapshot || value.latest_snapshot || value.snapshot, delta = value.delta || value.snapshot_delta;
    const rows = Array.isArray(snapshot) ? snapshot : (isObject(snapshot) ? (snapshot.holders || snapshot.items || []) : []);
    const snapshotHtml = Array.isArray(rows) && rows.length ? `<div class="cp-ci-source"><h5>Latest snapshot</h5>${metadata(snapshot)}${rows.map((holder) => isObject(holder) ? `<div class="cp-ci-record">${fieldRows(holder, [{ key: "holder_name", label: "Holder" }, { key: "name", label: "Holder" }, { key: "shares_owned", label: "Shares", number: true }, { key: "ownership_percentage", label: "Ownership %", number: true }])}</div>` : "").join("")}</div>` : "";
    if (!isObject(delta)) return snapshotHtml;
    if (sectionState(delta) === "incomparable" || value.status === "incomparable") return `${snapshotHtml}<div class="cp-ci-notice cp-ci-incomparable">${esc(statusMessage("incomparable"))}</div>`;
    const changes = [["New holder", delta.new_holder], ["Disappeared holder", delta.disappeared_holder], ["Shares change", delta.shares_change ?? delta.change_shares], ["Ownership % change", delta.ownership_percentage_change ?? delta.change_ownership_percentage]].filter(([, item]) => item !== undefined);
    return `${snapshotHtml}${changes.length ? `<div class="cp-ci-source"><h5>Snapshot delta</h5>${metadata(delta)}${changes.map(([label, item]) => `<div class="cp-ci-field"><span>${esc(label)}</span><strong>${Array.isArray(item) ? item.map(displayValue).join(", ") : displayValue(item)}</strong></div>`).join("")}</div>` : ""}`;
  }
  function renderSubsidiaries(value) {
    return sourceBlocks(value).map(([source, item]) => { const rows = Array.isArray(item) ? item : (isObject(item) ? item.subsidiaries || item.items || item.entities || [] : []); if (!Array.isArray(rows)) return "";
      return `<div class="cp-ci-source"><h5>${esc(source)}</h5>${metadata(item)}${rows.map((entity) => isObject(entity) ? `<div class="cp-ci-record">${fieldRows(entity, [{ key: "entity_name", label: "Entity" }, { key: "name", label: "Entity" }, { key: "provider_local_identity", label: "Provider identity" }, { key: "relationship_type", label: "Relationship" }, { key: "ownership_percentage", label: "Ownership %", number: true }, { key: "ownership", label: "Ownership", number: true }, { key: "provenance", label: "Provenance" }])}</div>` : "").join("")}</div>`;
    }).join("");
  }
  function renderCorporateIntelligence(corporate) {
    if (!isObject(corporate)) return `<section class="cp-ci"><h3>Corporate Intelligence</h3><div class="cp-ci-notice cp-ci-missing">${esc(statusMessage("missing"))}</div></section>`;
    const majorShareholders = corporate.major_shareholders || (corporate.major_shareholder_snapshot || corporate.major_shareholder_delta ? { latest_valid_snapshot: corporate.major_shareholder_snapshot, delta: corporate.major_shareholder_delta } : null);
    const parts = [subsection("Company profile", corporate.company_profile, renderProfile), subsection("Ownership structure", corporate.ownership_structure, renderOwnership), subsection("Major shareholders", majorShareholders, renderMajorShareholders), subsection("Company subsidiaries", corporate.company_subsidiaries, renderSubsidiaries)].filter(Boolean);
    return `<section class="cp-ci"><h3>Corporate Intelligence</h3>${parts.length ? parts.join("") : `<div class="cp-ci-notice cp-ci-missing">${esc(statusMessage("missing"))}</div>`}</section>`;
  }
  function loadCorporateBundle() { if (window.ANALYSIS_BUNDLE) return Promise.resolve(window.ANALYSIS_BUNDLE); if (!corporateBundlePromise && typeof fetch === "function") corporateBundlePromise = fetch("analysis_bundle.json", { cache: "no-store" }).then((response) => response.ok ? response.json() : null).catch(() => null); return corporateBundlePromise || Promise.resolve(null); }
  function corporateForRow(row, bundle) { if (isObject(row && row.corporate_intelligence)) return row.corporate_intelligence; return bundle && bundle.tickers && row && bundle.tickers[row.ticker] && bundle.tickers[row.ticker].corporate_intelligence; }
  let chartRenderedFor = null; // ticker mà biểu đồ hiện đang hiển thị — tránh huỷ/tạo lại Chart.js
                                // khi bấm lại đúng tab của cùng 1 mã (Phase 5: giảm render thừa)

  function stat(label, valueHtml) {
    return `<div><div class="vs-modal-stat-label">${esc(label)}</div><div class="vs-modal-stat-value">${valueHtml}</div></div>`;
  }

  function renderOverview(r) {
    return `
      <div class="mb-3" style="font-size:0.8rem; color:var(--text-muted);">
        ${esc(typeof displayExchange === "function" ? displayExchange(r.exchange) : (r.exchange || "–"))} · ${esc(r.industry || "–")}
      </div>
      <div class="vs-modal-stat-grid">
        ${stat("Giá đóng cửa", num(r.close, 0))}
        ${stat("% phiên", `<span class="${valueSignClass(r.chg_today_pct ?? r.change_pct)}">${num(r.chg_today_pct ?? r.change_pct, 2)}%</span>`)}
        ${stat("RS Rating", num(r.rs_rating, 0))}
        ${stat("RSI 14", num(r.rsi14, 0))}
        ${stat("Cấu trúc", `<span class="badge-soft ${structCls(r.structure)}">${esc(String(r.structure || "–").toUpperCase())}</span>`)}
        ${stat("% từ đỉnh 52 tuần", `<span class="${valueSignClass(r.pct_from_52w_high)}">${num(r.pct_from_52w_high, 1)}%</span>`)}
        ${stat("GTGD 20 phiên (tỷ)", num(r.gtgd20_ty, 1))}
        ${stat("KL tương đối", num(r.rel_vol, 2))}
        ${stat("P/E", num(r.pe, 1))}
        ${stat("P/B", num(r.pb, 2))}
        ${stat("ROE %", num(r.roe, 1))}
        ${stat("Room ngoại %", num(r.foreign_room_pct, 1))}
      </div>
      ${r.margin_status ? `<div class="mt-3"><span class="badge-margin">${esc(r.margin_status)}</span></div>` : ""}`;
  }

  function renderChart(r) {
    if (chartRenderedFor === r.ticker && chartInstance) return; // đã đúng biểu đồ rồi, khỏi vẽ lại
    const canvas = document.getElementById("cp-chart-canvas");
    if (!canvas || !window.Chart) return;
    // screener.html/signals.html KHÔNG load app.js nên Chart.defaults có thể chưa
    // từng được set — gọi ở đây để chart luôn đúng theme dù trang nào vẽ trước.
    if (typeof applyChartTheme === "function") applyChartTheme();
    if (chartInstance) { chartInstance.destroy(); chartInstance = null; }
    chartRenderedFor = r.ticker;

    const periods = [
      { label: "1 tháng", value: r.ret_1m },
      { label: "3 tháng", value: r.ret_3m },
      { label: "6 tháng", value: r.ret_6m },
      { label: "12 tháng", value: r.ret_12m },
    ];
    const values = periods.map((p) => (p.value === null || p.value === undefined || p.value === "" ? null : Number(p.value)));

    chartInstance = new Chart(canvas, {
      type: "bar",
      data: {
        labels: periods.map((p) => p.label),
        datasets: [{
          data: values,
          backgroundColor: values.map((v) => (v === null ? CHART_COLORS.muted : v >= 0 ? CHART_COLORS.pos : CHART_COLORS.neg)),
          borderRadius: 4,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: (ctx) => ` ${ctx.parsed.y ?? "–"}%` } },
        },
        scales: { y: { ticks: { callback: (v) => v + "%" } } },
      },
    });
  }

  function financialsPlaceholder() {
    return `
      <div class="vs-empty" style="padding:2rem 1rem;">
        <i data-lucide="file-clock"></i>
        <div class="vs-empty-title">Báo cáo tài chính đang chờ dữ liệu</div>
        <div class="vs-empty-sub">Ratios, Growth, Profitability, Cash Flow, Valuation sẽ hiển thị
          tại đây khi dữ liệu BCTC được công khai. Hiện dữ liệu này chỉ lưu cục bộ, chưa xuất bản
          lên trang web công khai.</div>
      </div>`;
  }

  function switchTab(tabName) {
    backdrop.querySelectorAll(".vs-panel-tab").forEach((t) => {
      const active = t.dataset.tab === tabName;
      t.classList.toggle("is-active", active);
      t.setAttribute("aria-selected", String(active));
    });
    backdrop.querySelectorAll(".vs-panel-tab-content").forEach((c) => {
      c.classList.toggle("is-active", c.dataset.tabContent === tabName);
    });
  }

  function getFocusable() {
    return Array.from(backdrop.querySelectorAll('button, [href], [tabindex]:not([tabindex="-1"])'))
      .filter((el) => el.offsetParent !== null);
  }

  function buildPanelShell() {
    backdrop = document.createElement("div");
    backdrop.className = "vs-modal-backdrop";
    backdrop.innerHTML = `
      <div class="vs-modal" role="dialog" aria-modal="true" aria-labelledby="cp-title">
        <div class="vs-modal-header">
          <span class="vs-modal-title" id="cp-title"></span>
          <button type="button" class="vs-icon-btn" id="cp-close" aria-label="Đóng"><i data-lucide="x"></i></button>
        </div>
        <div class="vs-panel-tabs" role="tablist">
          <button type="button" class="vs-panel-tab is-active" id="cp-tab-overview" data-tab="overview" role="tab" aria-selected="true" aria-controls="cp-panel-overview">Tổng quan</button>
          <button type="button" class="vs-panel-tab" id="cp-tab-chart" data-tab="chart" role="tab" aria-selected="false" aria-controls="cp-panel-chart">Biểu đồ</button>
          <button type="button" class="vs-panel-tab" id="cp-tab-financials" data-tab="financials" role="tab" aria-selected="false" aria-controls="cp-panel-financials">Báo cáo tài chính</button>
        </div>
        <div class="vs-modal-body">
          <div class="vs-panel-tab-content is-active" data-tab-content="overview" id="cp-panel-overview" role="tabpanel" aria-labelledby="cp-tab-overview">
            <div id="cp-overview"></div>
          </div>
          <div class="vs-panel-tab-content" data-tab-content="chart" id="cp-panel-chart" role="tabpanel" aria-labelledby="cp-tab-chart">
            <div class="chart-box" style="height:220px"><canvas id="cp-chart-canvas"></canvas></div>
          </div>
          <div class="vs-panel-tab-content" data-tab-content="financials" id="cp-panel-financials" role="tabpanel" aria-labelledby="cp-tab-financials">${financialsPlaceholder()}</div>
        </div>
      </div>`;
    document.body.appendChild(backdrop);
    if (window.lucide) lucide.createIcons();

    backdrop.querySelectorAll(".vs-panel-tab").forEach((tab) => {
      tab.addEventListener("click", () => {
        switchTab(tab.dataset.tab);
        if (tab.dataset.tab === "chart") renderChart(backdrop._currentRow);
      });
    });

    backdrop.addEventListener("click", (e) => { if (e.target === backdrop) closePanel(); });
    backdrop.querySelector("#cp-close").addEventListener("click", closePanel);
    document.addEventListener("keydown", (e) => {
      if (!backdrop.classList.contains("is-open")) return;
      if (e.key === "Escape") { closePanel(); return; }
      if (e.key !== "Tab") return;
      const focusable = getFocusable();
      if (!focusable.length) return;
      const first = focusable[0], last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
  }

  function openPanel(row) {
    if (!backdrop) buildPanelShell();
    backdrop._currentRow = row;
    document.getElementById("cp-title").textContent = row.ticker || "?";
    const overview = document.getElementById("cp-overview");
    overview.innerHTML = renderOverview(row) + renderCorporateIntelligence(corporateForRow(row));
    // Legacy bundles render a neutral missing state immediately.  A cached dashboard
    // artifact, when present, replaces only this panel's Corporate Intelligence area.
    loadCorporateBundle().then((bundle) => {
      if (!backdrop || backdrop._currentRow !== row) return;
      overview.innerHTML = renderOverview(row) + renderCorporateIntelligence(corporateForRow(row, bundle));
    });
    switchTab("overview");
    backdrop.classList.add("is-open");
    document.body.style.overflow = "hidden";
    backdrop.querySelector("#cp-close").focus();
  }

  function closePanel() {
    if (!backdrop) return;
    backdrop.classList.remove("is-open");
    document.body.style.overflow = "";
  }

  if (typeof document !== "undefined") document.addEventListener("DOMContentLoaded", () => {
    if (!backdrop) buildPanelShell();
    document.addEventListener("click", (e) => {
      const tr = e.target.closest("#tblScreen tbody tr");
      if (!tr || typeof jQuery === "undefined") return;
      const data = jQuery("#tblScreen").DataTable().row(tr).data();
      if (data) openPanel(data);
    });
  });

  // API dùng chung cho các bảng ngoài DataTables (ví dụ bảng mẫu hình nến ở signals.html).
  if (typeof window !== "undefined") window.VSCompanyPanel = { open: openPanel, close: closePanel };
  if (typeof module !== "undefined" && module.exports) module.exports = { renderCorporateIntelligence, corporateForRow };
})();
