(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.VSDashboardOverview = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

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
      session_breadth: {
        available: priced.length > 0,
        priced: priced.length,
        up,
        down,
        flat,
        unpriced: denominator - priced.length,
        label: "Độ rộng phiên trong số mã có dữ liệu giá",
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

  function renderDecisionSummaryHtml(summary) {
    if (!summary || !summary.denominator) {
      return `<div class="vs-alert vs-alert-warning mb-0">CURRENT_PRODUCT_ARTIFACT_NOT_PUBLISHED: chưa có screener_master_projection/v1 cho phiên hiện tại.</div>`;
    }
    const session = summary.as_of_session || "chưa xác định";
    const cards = STANCE_ORDER.map((stance) => {
      const count = (summary.research_stance.counts || {})[stance] || 0;
      const tone = STANCE_TONE[stance] || "neutral";
      return `<div class="decision-stance-card is-${tone}" data-state="${esc(stance)}"><span class="count">${count.toLocaleString("vi-VN")}</span><span class="label">${esc(formatLabel(stance, "research_stance"))}</span></div>`;
    }).join("");
    return `
      <p class="product-muted mb-3">Phiên ${esc(session)} · ${summary.denominator.toLocaleString("vi-VN")} mã. Đây là tóm tắt tư thế nghiên cứu, không phải lệnh thực hiện.</p>
      <div class="decision-summary-grid mb-3">${cards}</div>
      <div class="decision-summary-actions">
        <a class="vs-btn vs-btn-primary" href="investment-workspace.html">Mở Bàn quyết định</a>
        <a class="vs-btn" href="analysis.html">Phân tích đa trục</a>
        <a class="vs-btn" href="screener.html">Bộ lọc</a>
      </div>`;
  }

  function fillText(id, text, className) {
    const el = typeof document !== "undefined" ? document.getElementById(id) : null;
    if (!el) return;
    el.textContent = text;
    if (className) el.className = className;
  }

  function renderMarketOverview(summary) {
    if (typeof document === "undefined" || !summary) return;
    const breadth = summary.session_breadth;
    if (breadth.available) {
      fillText("kpi-session-up", breadth.up.toLocaleString("vi-VN"), "kpi-value val-pos");
      fillText("kpi-session-flat", breadth.flat.toLocaleString("vi-VN"), "kpi-value");
      fillText("kpi-session-down", breadth.down.toLocaleString("vi-VN"), "kpi-value val-neg");
      fillText("kpi-session-up-sub", `${breadth.priced.toLocaleString("vi-VN")} / ${summary.denominator.toLocaleString("vi-VN")} mã có dữ liệu giá`);
      fillText("kpi-session-flat-sub", "tham chiếu / không đổi");
      fillText("kpi-session-down-sub", `${breadth.unpriced.toLocaleString("vi-VN")} mã chưa có giá — không tính là đứng giá`);
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
        ? `${summary.tactical.coverage.toLocaleString("vi-VN")} / ${summary.denominator.toLocaleString("vi-VN")} có trạng thái kỹ thuật`
        : "Chưa có dữ liệu trạng thái kỹ thuật";
    }
    const sectorHost = document.getElementById("sector-coverage-note");
    if (sectorHost) {
      sectorHost.textContent = summary.sector.available
        ? `${summary.sector.labeled.toLocaleString("vi-VN")} / ${summary.denominator.toLocaleString("vi-VN")} có nhãn ngành thực`
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
        summaryHost.innerHTML = `<div class="vs-alert vs-alert-warning mb-0">CURRENT_PRODUCT_ARTIFACT_NOT_PUBLISHED: ${esc(error.message)}. Không gian quyết định vẫn là cửa vào sản phẩm khi artifact còn hiệu lực.</div>`;
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
    summarizeScreenerOverview,
    coverageText,
    missingMetricNeverZero,
    renderDecisionSummaryHtml,
    renderMarketOverview,
    validateProjection,
  };
});
