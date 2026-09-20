(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.VSDashboardOverview = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  function getSessionCoherence() {
    if (typeof window !== "undefined" && window.VSSessionCoherence) return window.VSSessionCoherence;
    if (typeof require === "function") {
      try { return require("./session-coherence.js"); } catch (err) { return null; }
    }
    return null;
  }

  const SCREENER_URL = "data/screener_master_projection.json";
  const SCREENER_CONTRACT = "screener_master_projection/v1";
  const ENTITY_CLASS_VOCABULARY = ["corporate", "bank", "securities", "insurance", "finance_company"];
  const STANCE_ORDER = [
    "INITIATE_RESEARCH_CANDIDATE",
    "ACCUMULATE_RESEARCH_CANDIDATE",
    "WAIT_FOR_CONFIRMATION",
    "HIGH_RISK_SPECULATION_ONLY",
    "AVOID_NEW_ENTRY",
    "INSUFFICIENT_EVIDENCE",
  ];
  const TACTICAL_ORDER = [
    "DOWNTREND",
    "SELLING_PRESSURE_EASING",
    "UPTREND_CONFIRMED",
    "EARLY_REVERSAL_CANDIDATE",
    "BREAKDOWN_RISK",
    "SIDEWAYS_NEUTRAL",
    "DISTRIBUTION_RISK",
    "BASE_BUILDING",
    "BREAKOUT_READY",
  ];
  const STANCE_TONE = {
    INITIATE_RESEARCH_CANDIDATE: "constructive",
    ACCUMULATE_RESEARCH_CANDIDATE: "constructive",
    WAIT_FOR_CONFIRMATION: "wait",
    HIGH_RISK_SPECULATION_ONLY: "risk",
    AVOID_NEW_ENTRY: "risk",
    INSUFFICIENT_EVIDENCE: "neutral",
  };

  function getValueFormat() {
    if (typeof window !== "undefined" && window.VSValueFormat) return window.VSValueFormat;
    if (typeof require === "function") {
      try { return require("./value-format.js"); } catch (err) { return null; }
    }
    return null;
  }

  function getProductScopeFormat() {
    if (typeof window !== "undefined" && window.VSProductScopeFormat) return window.VSProductScopeFormat;
    if (typeof require === "function") {
      try { return require("./product-scope-format.js"); } catch (err) { return null; }
    }
    return null;
  }

  function esc(value) {
    return String(value ?? "").replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
    }[c]));
  }

  function formatLabel(value, domain) {
    const vf = getValueFormat();
    if (vf && typeof vf.formatDomainState === "function") {
      return vf.formatDomainState(value, domain).label;
    }
    return String(value ?? "Chưa xác định");
  }

  function coverageText(count, denominator, available) {
    if (!available) return { text: "Chưa có dữ liệu hiện tại", available: false, count: null, denominator: denominator || null };
    return {
      text: `${Number(count).toLocaleString("vi-VN")} / ${Number(denominator).toLocaleString("vi-VN")}`,
      available: true,
      count,
      denominator,
    };
  }

  function isPriced(card) {
    const price = card && card.price;
    if (!price || price.change_pct_status !== "AVAILABLE") return false;
    const n = Number(price.change_pct);
    return Number.isFinite(n);
  }

  function hasCurrentPrice(card) {
    return Boolean(card && card.price && card.price.status === "PRICE_AVAILABLE");
  }

  function isTacticalAvailable(card) {
    const tactical = card && card.tactical;
    return Boolean(tactical && tactical.status === "AVAILABLE" && tactical.entry_state);
  }

  function isLiquidityProxy(card) {
    const liquidity = card && card.liquidity;
    return Boolean(
      liquidity &&
      (liquidity.fitness === "LIQUIDITY_RESEARCH_PROXY" || liquidity.method === "LIQUIDITY_RESEARCH_PROXY")
    );
  }

  function sectorLabel(card) {
    const sector = card && card.sector;
    if (!sector || sector.status !== "AVAILABLE") return null;
    const label = typeof sector.label === "string" ? sector.label.trim() : "";
    if (!label) return null;
    if (ENTITY_CLASS_VOCABULARY.includes(label.toLowerCase())) return null;
    return label;
  }

  function summarizeScreenerOverview(projection) {
    const cards = Object.values((projection && projection.cards) || {});
    const denominator = cards.length;
    const priceAvailable = cards.filter(hasCurrentPrice);
    const priced = cards.filter(isPriced);
    const up = priced.filter((card) => Number(card.price.change_pct) > 0).length;
    const down = priced.filter((card) => Number(card.price.change_pct) < 0).length;
    const flat = priced.filter((card) => Number(card.price.change_pct) === 0).length;
    const tactical = cards.filter(isTacticalAvailable);
    const tacticalCounts = {};
    TACTICAL_ORDER.forEach((state) => { tacticalCounts[state] = 0; });
    tactical.forEach((card) => {
      const state = card.tactical.entry_state;
      tacticalCounts[state] = (tacticalCounts[state] || 0) + 1;
    });
    const stanceCounts = {};
    STANCE_ORDER.forEach((stance) => { stanceCounts[stance] = 0; });
    cards.forEach((card) => {
      const stance = card.research && card.research.stance;
      if (stance) stanceCounts[stance] = (stanceCounts[stance] || 0) + 1;
    });
    const officialScope = (projection && projection.official_scope_coverage) || null;
    const officialScopeCoherent = Boolean(
      officialScope && officialScope.temporally_eligible &&
      officialScope.research_session === (projection && projection.as_of_session)
    );
    const liquidityProxy = cards.filter(isLiquidityProxy).length;
    const executionExactReady = cards.filter((card) =>
      card.execution && card.execution.capacity_exact_status === "EXECUTION_CAPACITY_EXACT_READY"
    ).length;
    const sectors = {};
    let sectorLabeled = 0;
    cards.forEach((card) => {
      const label = sectorLabel(card);
      if (!label) return;
      sectorLabeled += 1;
      sectors[label] = (sectors[label] || 0) + 1;
    });
    const sectorRows = Object.entries(sectors)
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, "vi"));

    return {
      as_of_session: (projection && projection.as_of_session) || null,
      denominator,
      reference_ticker_count: denominator,
      current_research_scope_count: officialScopeCoherent ? officialScope.current_official_research_scope_count : null,
      outside_current_official_scope_count: officialScopeCoherent ? officialScope.outside_current_official_scope_count : null,
      official_scope_observed_at: officialScopeCoherent ? officialScope.official_snapshot_observed_at : null,
      price_available_count: priceAvailable.length,
      price_unavailable_count: denominator - priceAvailable.length,
      tactical_available_count: tactical.length,
      tactical_unavailable_count: denominator - tactical.length,
      session_breadth: {
        available: priced.length > 0,
        priced: priced.length,
        up,
        down,
        flat,
        price_available: priceAvailable.length,
        unpriced: denominator - priceAvailable.length,
        missing_session_return: priceAvailable.length - priced.length,
        label: "Độ rộng phiên trong số mã có biến động giá đúng phiên",
      },
      research_stance: {
        available: denominator > 0,
        counts: stanceCounts,
        order: STANCE_ORDER,
      },
      tactical: {
        available: tactical.length > 0,
        coverage: tactical.length,
        counts: tacticalCounts,
        order: TACTICAL_ORDER,
      },
      liquidity: {
        proxy_available: liquidityProxy > 0 || denominator > 0,
        proxy_count: liquidityProxy,
        execution_exact_ready: executionExactReady,
        execution_exact_established: executionExactReady > 0,
      },
      sector: {
        available: sectorLabeled > 0,
        labeled: sectorLabeled,
        rows: sectorRows,
      },
      unsupported: {
        ma200: false,
        gtgd20: false,
        structure_up: false,
      },
    };
  }

  function missingMetricNeverZero(metric) {
    if (!metric || metric.available === false) {
      return metric && Object.prototype.hasOwnProperty.call(metric, "count")
        ? metric.count === null
        : true;
    }
    return true;
  }

  function renderDecisionSummaryHtml(summary, releaseSession) {
    if (!summary || !summary.denominator) {
      // Ordinary missing data for this session -- a quiet note, not a system warning box
      // (DASHBOARD_INVESTOR_FIRST_PRESENTATION_SIMPLIFICATION_V1 Phase 5); no pipeline
      // status code or contract name shown to the user.
      return `<p class="cockpit-note mb-0">Tạm chưa có dữ liệu tóm tắt cho phiên hiện tại.</p>`;
    }
    const sc = getSessionCoherence();
    const coherence = sc ? sc.classify(summary.as_of_session, releaseSession) : null;
    const staleBanner = sc && coherence && sc.isConfirmedStale(coherence)
      ? sc.staleBannerHtml("Tóm tắt tư thế nghiên cứu", coherence, "SCREENER_MASTER_PROJECTION_STALE")
      : "";
    const session = (sc ? sc.sessionLabelText(coherence) : null) || summary.as_of_session || "chưa xác định";
    const scope = getProductScopeFormat();
    const referenceScope = scope
      ? scope.formatReferenceScope(summary.reference_ticker_count)
      : `Phạm vi tham chiếu: ${summary.denominator.toLocaleString("vi-VN")} mã`;
    const priceCoverage = scope
      ? scope.formatCoverage({ available: summary.price_available_count, reference: summary.reference_ticker_count, label: "có dữ liệu giá đúng phiên" })
      : `${summary.price_available_count.toLocaleString("vi-VN")} / ${summary.denominator.toLocaleString("vi-VN")} mã tham chiếu có dữ liệu giá đúng phiên`;
    const tacticalCoverage = scope
      ? scope.formatCoverage({ available: summary.tactical_available_count, reference: summary.reference_ticker_count, label: "có trạng thái kỹ thuật" })
      : `${summary.tactical_available_count.toLocaleString("vi-VN")} / ${summary.denominator.toLocaleString("vi-VN")} mã tham chiếu có trạng thái kỹ thuật`;
    // Official-scope line only renders when the artifact itself publishes a temporally-eligible,
    // session-coherent official_scope_coverage block (see summarizeScreenerOverview) -- absent or
    // stale scope metadata renders nothing here, never a fabricated/estimated number.
    const officialScopeLine = scope && summary.current_research_scope_count != null
      ? `<p class="product-muted mb-1">${esc(scope.formatOfficialResearchScope(summary.current_research_scope_count))}${
          summary.outside_current_official_scope_count != null
            ? ` · ${esc(scope.formatOutsideOfficialScope(summary.outside_current_official_scope_count))}`
            : ""
        }</p>`
      : "";
    const cards = STANCE_ORDER.map((stance) => {
      const count = (summary.research_stance.counts || {})[stance] || 0;
      const tone = STANCE_TONE[stance] || "neutral";
      return `<div class="decision-stance-card is-${tone}" data-state="${esc(stance)}"><span class="count">${count.toLocaleString("vi-VN")}</span><span class="label">${esc(formatLabel(stance, "research_stance"))}</span></div>`;
    }).join("");
    return `
      ${staleBanner}
      <p class="product-muted mb-1">Phiên ${esc(session)} · ${esc(referenceScope)}.</p>
      ${officialScopeLine}
      <p class="product-muted mb-3">${esc(priceCoverage)} · ${esc(tacticalCoverage)}. Đây là tóm tắt tư thế nghiên cứu, không phải lệnh thực hiện.</p>
      <div class="decision-summary-grid mb-3">${cards}</div>
      <div class="decision-summary-actions">
        <a class="vs-btn vs-btn-primary" href="investment-workspace.html">Mở Bàn quyết định</a>
        <a class="vs-btn" href="investment-workspace.html?view=explore">Khám phá cơ hội</a>
        <a class="vs-btn" href="investment-workspace.html?view=technical">Tín hiệu kỹ thuật</a>
      </div>`;
  }

  function fillText(id, text, className) {
    const el = typeof document !== "undefined" ? document.getElementById(id) : null;
    if (!el) return;
    el.textContent = text;
    if (className) el.className = className;
  }

  /* Nhãn trạng thái thị trường thuần mô tả (dựa trên số mã tăng/giảm đã tính sẵn ở
     trên, không phải một quy tắc đầu tư mới): nghiêng hẳn về một phía mới gọi tên,
     còn lại là "giằng co" -- không suy ra khuyến nghị mua/bán. */
  function marketBreadthStateLabel(breadth) {
    if (!breadth.available || (breadth.up + breadth.down) === 0) return null;
    if (breadth.up >= breadth.down * 1.2) return { text: "Nghiêng tăng", cls: "bs-green" };
    if (breadth.down >= breadth.up * 1.2) return { text: "Nghiêng giảm", cls: "bs-red" };
    return { text: "Giằng co", cls: "bs-amber" };
  }

  /* Hero banner: trạng thái thị trường thật (phiên, độ rộng), không phải văn bản
     giải thích phạm vi/phương pháp nội bộ -- đó là nội dung cho người làm sản
     phẩm, không phải người xem Tổng quan (mục B của milestone hội tụ Dashboard). */
  /* Pure: returns the hero HTML string for a given summary. No DOM access, so it is
     directly unit-testable (mirrors renderDecisionSummaryHtml's existing pattern). */
  function heroBannerHtml(summary) {
    if (!summary || !summary.as_of_session) {
      return `
        <div class="card" style="border-left: 4px solid var(--border); background: var(--surface);">
          <div class="card-body py-3 px-4">
            <span class="badge-soft bs-gray">Chưa có dữ liệu phiên thị trường</span>
          </div>
        </div>`;
    }
    const dateMatch = String(summary.as_of_session).match(/^(\d{4})-(\d{2})-(\d{2})$/);
    const displayDate = dateMatch ? `${dateMatch[3]}/${dateMatch[2]}/${dateMatch[1]}` : summary.as_of_session;
    const breadth = summary.session_breadth;
    const state = marketBreadthStateLabel(breadth);
    const breadthText = breadth.available
      ? `${breadth.up.toLocaleString("vi-VN")} tăng · ${breadth.down.toLocaleString("vi-VN")} giảm · ${breadth.flat.toLocaleString("vi-VN")} tham chiếu`
      : "Chưa có dữ liệu độ rộng phiên";
    return `
      <div class="card" style="border-left: 4px solid var(--primary); background: linear-gradient(90deg, rgba(32, 231, 207, 0.08) 0%, rgba(15, 23, 42, 0.6) 100%);">
        <div class="card-body py-3 px-4 d-flex align-items-center justify-content-between flex-wrap gap-3">
          <div>
            <div class="d-flex align-items-center gap-2 flex-wrap mb-1">
              <span class="badge-soft bs-blue">Phiên ${esc(displayDate)}</span>
              ${state ? `<span class="badge-soft ${state.cls}">${esc(state.text)}</span>` : ""}
            </div>
            <div class="text-xs text-muted">${esc(breadthText)}</div>
          </div>
          <div>
            <a href="investment-workspace.html" class="vs-btn" style="background: var(--primary); color: #03080A; font-weight: 700; border: none; font-size: 0.8rem; padding: 0.4rem 0.9rem;">
              Mở Bàn quyết định →
            </a>
          </div>
        </div>
      </div>`;
  }

  function renderHeroBanner(summary) {
    const host = typeof document !== "undefined" ? document.getElementById("dashboard-hero-banner") : null;
    if (!host) return;
    host.innerHTML = heroBannerHtml(summary);
  }

  function renderMarketOverview(summary) {
    if (typeof document === "undefined" || !summary) return;
    renderHeroBanner(summary);
    const breadth = summary.session_breadth;
    const scope = getProductScopeFormat();
    if (breadth.available) {
      fillText("kpi-session-up", breadth.up.toLocaleString("vi-VN"), "kpi-value val-pos");
      fillText("kpi-session-flat", breadth.flat.toLocaleString("vi-VN"), "kpi-value");
      fillText("kpi-session-down", breadth.down.toLocaleString("vi-VN"), "kpi-value val-neg");
      fillText("kpi-session-up-sub", `${breadth.priced.toLocaleString("vi-VN")} / ${breadth.price_available.toLocaleString("vi-VN")} mã có biến động giá đủ tính độ rộng`);
      fillText("kpi-session-flat-sub", "tham chiếu / không đổi");
      fillText("kpi-session-down-sub", `${breadth.unpriced.toLocaleString("vi-VN")} mã tham chiếu chưa có giá đúng phiên — không tính là đứng giá`);
    } else {
      fillText("kpi-session-up", "Chưa có dữ liệu hiện tại", "kpi-value");
      fillText("kpi-session-flat", "Chưa có dữ liệu hiện tại", "kpi-value");
      fillText("kpi-session-down", "Chưa có dữ liệu hiện tại", "kpi-value");
    }

    const liq = coverageText(summary.liquidity.proxy_count, summary.denominator, summary.liquidity.proxy_available);
    fillText("kpi-liquidity-proxy", liq.text, "kpi-value");
    fillText("kpi-liquidity-proxy-sub", "Thanh khoản nghiên cứu có dữ liệu");
    fillText(
      "kpi-execution-capacity",
      summary.liquidity.execution_exact_established
        ? coverageText(summary.liquidity.execution_exact_ready, summary.denominator, true).text
        : "Chưa xác lập",
      "kpi-value"
    );
    fillText("kpi-execution-capacity-sub", "Năng lực thực hiện lệnh chính xác");

    const tactical = coverageText(summary.tactical.coverage, summary.denominator, summary.tactical.available);
    const tacticalHost = document.getElementById("tactical-coverage-note");
    if (tacticalHost) {
      tacticalHost.textContent = summary.tactical.available
        ? (scope
          ? scope.formatCoverage({ available: summary.tactical.coverage, reference: summary.reference_ticker_count, label: "có trạng thái kỹ thuật" })
          : `${summary.tactical.coverage.toLocaleString("vi-VN")} / ${summary.denominator.toLocaleString("vi-VN")} mã tham chiếu có trạng thái kỹ thuật`)
        : "Chưa có dữ liệu trạng thái kỹ thuật";
    }
    const sectorHost = document.getElementById("sector-coverage-note");
    if (sectorHost) {
      sectorHost.textContent = summary.sector.available
        ? `${summary.sector.labeled.toLocaleString("vi-VN")} / ${summary.reference_ticker_count.toLocaleString("vi-VN")} mã tham chiếu có nhãn ngành thực`
        : "Chưa có dữ liệu ngành hiện tại";
    }
    renderOverviewCharts(summary);
  }

  function renderOverviewCharts(summary) {
    if (typeof window === "undefined" || !window.Chart || !summary) return;
    const vf = getValueFormat();
    if (vf && typeof vf.applyChartTheme === "function") vf.applyChartTheme();
    const colors = (vf && vf.CHART_COLORS) || {};
    const sectorCanvas = document.getElementById("chart-sector");
    const tacticalCanvas = document.getElementById("chart-tactical");
    const topSectors = (summary.sector.rows || []).slice(0, 10);
    if (sectorCanvas && summary.sector.available && topSectors.length) {
      if (sectorCanvas._chart) sectorCanvas._chart.destroy();
      sectorCanvas._chart = new window.Chart(sectorCanvas, {
        type: "bar",
        data: {
          labels: topSectors.map((row) => row.label),
          datasets: [{
            data: topSectors.map((row) => row.count),
            backgroundColor: colors.series ? colors.series[0] : "rgba(32, 231, 207, 0.75)",
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
                label: (ctx) => ` ${topSectors[ctx.dataIndex].count.toLocaleString("vi-VN")} mã`,
              },
            },
          },
          scales: {
            x: { ticks: { precision: 0 } },
            y: { grid: { display: false } },
          },
        },
      });
    }
    if (tacticalCanvas && summary.tactical.available) {
      const rows = TACTICAL_ORDER
        .map((state) => ({ state, count: summary.tactical.counts[state] || 0 }))
        .filter((row) => row.count > 0);
      if (tacticalCanvas._chart) tacticalCanvas._chart.destroy();
      if (rows.length) {
        tacticalCanvas._chart = new window.Chart(tacticalCanvas, {
          type: "doughnut",
          data: {
            labels: rows.map((row) => formatLabel(row.state, "tactical_state")),
            datasets: [{
              data: rows.map((row) => row.count),
              backgroundColor: [
                colors.neg, colors.warn, colors.pos, colors.series && colors.series[1],
                colors.neg, colors.muted, colors.warn, colors.series && colors.series[2], colors.pos,
              ],
              borderColor: colors.surface || "#0D2224",
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
  }

  function validateProjection(payload) {
    return Boolean(
      payload &&
      payload.contract_version === SCREENER_CONTRACT &&
      payload.cards &&
      typeof payload.cards === "object"
    );
  }

  function bootDashboardOverview() {
    const summaryHost = typeof document !== "undefined" ? document.getElementById("current-product-summary") : null;
    if (!summaryHost) return;
    fetch(SCREENER_URL, { cache: "no-store" })
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json();
      })
      .then((projection) => {
        if (!validateProjection(projection)) throw new Error("invalid screener master projection");
        const summary = summarizeScreenerOverview(projection);
        summaryHost.innerHTML = renderDecisionSummaryHtml(summary);
        renderMarketOverview(summary);
      })
      .catch((error) => {
        if (typeof console !== "undefined" && console.debug) console.debug("dashboard summary unavailable:", error);
        summaryHost.innerHTML = `<p class="cockpit-note mb-0">Tạm chưa có dữ liệu tóm tắt cho phiên hiện tại. Không gian quyết định vẫn là cửa vào sản phẩm chính.</p>`;
      });
  }

  if (typeof document !== "undefined" && document.body && document.body.dataset.page === "dashboard") {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", bootDashboardOverview);
    } else {
      bootDashboardOverview();
    }
  }

  return {
    SCREENER_URL,
    SCREENER_CONTRACT,
    STANCE_ORDER,
    TACTICAL_ORDER,
    getProductScopeFormat,
    summarizeScreenerOverview,
    coverageText,
    missingMetricNeverZero,
    renderDecisionSummaryHtml,
    heroBannerHtml,
    marketBreadthStateLabel,
    renderMarketOverview,
    validateProjection,
  };
});
