/* Dashboard vĩ mô: fetch JSON qua HTTP, fallback biến global khi mở file://. */
(function () {
  "use strict";

  var JSON_PATH = "data/macro_snapshot.json";
  var KPI_PRIORITY = [
    "usdvnd_vcb", "us_fedfunds", "vn_cpi_yoy", "us_10y",
    "dxy", "vix", "brent", "gold_world",
  ];
  var chartInstances = [];

  var CHART_GROUPS = [
    { title: "Lãi suất và lợi suất", subtitle: "Fed Funds · TPCP Mỹ 10 năm", keys: ["us_fedfunds", "us_10y"] },
    { title: "Tỷ giá và sức mạnh USD", subtitle: "USD/VND · DXY broad", keys: ["usdvnd_vcb", "usdvnd_mkt", "dxy"] },
    { title: "Lạm phát và tăng trưởng", subtitle: "CPI/GDP Việt Nam · CPI Mỹ", keys: ["vn_cpi_yoy", "vn_gdp_yoy", "us_cpi"] },
    { title: "Rủi ro quốc tế", subtitle: "VIX · DXY broad", keys: ["vix", "dxy"] },
    { title: "Năng lượng", subtitle: "Brent · WTI", keys: ["brent", "wti"] },
    { title: "Vàng", subtitle: "Vàng quốc tế · SJC", keys: ["gold_world", "gold_sjc"] },
  ];

  function byId(id) { return document.getElementById(id); }

  function element(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined && text !== null) node.textContent = String(text);
    return node;
  }

  function icon(name) {
    var node = element("i");
    node.setAttribute("data-lucide", name);
    node.setAttribute("aria-hidden", "true");
    return node;
  }

  function safeExternalUrl(value) {
    try {
      var url = new URL(String(value));
      return (url.protocol === "https:" || url.protocol === "http:") ? url.href : null;
    } catch (_) {
      return null;
    }
  }

  function externalLink(label, url, className) {
    var safe = safeExternalUrl(url);
    if (!safe) return element("span", "val-muted", label || "Không có liên kết");
    var link = element("a", className || "macro-source-link", label);
    link.href = safe;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.setAttribute("aria-label", label + " (mở trong tab mới)");
    return link;
  }

  function isFiniteOrNull(value) {
    return value === null || (typeof value === "number" && Number.isFinite(value));
  }

  function validateSnapshot(snapshot) {
    if (!snapshot || typeof snapshot !== "object") return false;
    if (snapshot.schema_version !== 1 || !Array.isArray(snapshot.indicators)) return false;
    if (!snapshot.series || typeof snapshot.series !== "object") return false;
    if (!snapshot.generated_at || Number.isNaN(Date.parse(snapshot.generated_at))) return false;
    return snapshot.indicators.every(function (item) {
      if (!item || typeof item.key !== "string" || typeof item.label !== "string") return false;
      if (!isFiniteOrNull(item.value) || !isFiniteOrNull(item.previous_value)) return false;
      if (!isFiniteOrNull(item.change) || !isFiniteOrNull(item.change_pct)) return false;
      var points = snapshot.series[item.key];
      return Array.isArray(points) && points.every(function (point) {
        return point && typeof point.date === "string" &&
          typeof point.value === "number" && Number.isFinite(point.value);
      });
    });
  }

  async function loadMacroData(fetchImpl) {
    var doFetch = fetchImpl || window.fetch.bind(window);
    // Ưu tiên fetch JSON qua http(s); file:// (fetch luôn bị CORS chặn) hoặc fetch lỗi thì
    // nạp fallback data/macro_snapshot.js CHỈ lúc đó, không tải song song.
    if (!isFileProtocol()) {
      try {
        var response = await doFetch(JSON_PATH, { cache: "no-store" });
        if (!response.ok) throw new Error("HTTP response not ok");
        return { snapshot: await response.json(), source: "json" };
      } catch (_) { /* rơi xuống fallback bên dưới */ }
    }
    await loadFallbackScript("data/macro_snapshot.js", "MACRO_SNAPSHOT");
    return { snapshot: window.MACRO_SNAPSHOT || null, source: "fallback" };
  }

  function formatNumber(value, unit) {
    if (value === null || value === undefined || !Number.isFinite(Number(value))) return "—";
    var decimals = 2;
    if (/đồng/i.test(unit || "")) decimals = 0;
    if (/điểm/i.test(unit || "") && Math.abs(Number(value)) >= 1000) decimals = 0;
    return new Intl.NumberFormat("vi-VN", {
      minimumFractionDigits: 0,
      maximumFractionDigits: decimals,
    }).format(Number(value));
  }

  function signed(value, decimals) {
    if (value === null || value === undefined || !Number.isFinite(Number(value))) return "—";
    var number = Number(value);
    var prefix = number > 0 ? "+" : "";
    return prefix + new Intl.NumberFormat("vi-VN", {
      minimumFractionDigits: 0,
      maximumFractionDigits: decimals,
    }).format(number);
  }

  function deltaText(item) {
    if (item.change === null || item.change === undefined) return "Chưa có lần ghi trước";
    if (item.change_basis === "percentage_point") return signed(item.change, 2) + " điểm %";
    return item.change_pct === null ? "Chưa tính được %" : signed(item.change_pct, 2) + "%";
  }

  function directionClass(item) {
    if (item.change === null || item.direction === "unknown") return "is-missing";
    if (item.direction === "up") return "is-up";
    if (item.direction === "down") return "is-down";
    return "is-flat";
  }

  function directionIcon(item) {
    if (item.direction === "up") return "arrow-up-right";
    if (item.direction === "down") return "arrow-down-right";
    if (item.direction === "flat") return "minus";
    return "circle-help";
  }

  function formatPeriod(item) {
    if (!item.period) return "Chưa có";
    if (item.frequency === "annual") return item.period.slice(0, 4);
    var date = new Date(item.period + "T00:00:00+07:00");
    if (Number.isNaN(date.getTime())) return item.period;
    return new Intl.DateTimeFormat("vi-VN", {
      day: "2-digit", month: "2-digit", year: "numeric", timeZone: "Asia/Ho_Chi_Minh",
    }).format(date);
  }

  function formatGeneratedAt(value) {
    var date = new Date(value);
    if (Number.isNaN(date.getTime())) return "—";
    return new Intl.DateTimeFormat("vi-VN", {
      day: "2-digit", month: "2-digit", year: "numeric",
      hour: "2-digit", minute: "2-digit", second: "2-digit",
      timeZone: "Asia/Ho_Chi_Minh",
    }).format(date);
  }

  function setStatusBadge(text, className) {
    var badge = byId("macro-status");
    badge.textContent = text;
    badge.className = "badge-soft " + className;
  }

  function setNotice(kind, text, iconName) {
    var notice = byId("macro-notice");
    notice.className = "macro-notice is-" + kind;
    notice.replaceChildren(icon(iconName), element("span", "", text));
  }

  function freshnessBadge(item) {
    var state = item.freshness && item.freshness.status;
    if (item.status !== "available") return { text: "Thiếu dữ liệu", className: "bs-gray" };
    if (state === "stale") return { text: "Cần cập nhật", className: "bs-amber" };
    if (state === "current") return { text: "Trong ngưỡng", className: "bs-green" };
    return { text: "Chưa xác định", className: "bs-gray" };
  }

  function detailRow(label, content) {
    var row = element("div", "macro-detail");
    row.append(element("span", "", label));
    if (content instanceof Node) row.append(content);
    else row.append(element("strong", "", content));
    return row;
  }

  function renderKpis(snapshot) {
    var container = byId("macro-kpis");
    container.replaceChildren();
    var byKey = new Map(snapshot.indicators.map(function (item) { return [item.key, item]; }));
    var selected = KPI_PRIORITY.map(function (key) { return byKey.get(key); }).filter(function (item) {
      return item && item.status === "available" && item.value !== null;
    });

    if (!selected.length) {
      container.append(element("div", "macro-empty-chart", "Snapshot chưa có chỉ báo trọng tâm khả dụng."));
      return;
    }

    selected.forEach(function (item) {
      var card = element("article", "kpi macro-kpi");
      var top = element("div", "macro-kpi-top");
      top.append(element("div", "macro-kpi-name", item.label));
      var fresh = freshnessBadge(item);
      top.append(element("span", "badge-soft " + fresh.className, fresh.text));

      var valueRow = element("div", "macro-kpi-value-row");
      valueRow.append(element("div", "kpi-value", formatNumber(item.value, item.unit)));
      valueRow.append(element("span", "macro-unit", item.unit || ""));

      var delta = element("div", "macro-delta " + directionClass(item));
      delta.append(icon(directionIcon(item)), element("span", "", deltaText(item)));
      delta.setAttribute("aria-label", "Thay đổi: " + deltaText(item));

      var details = element("div", "macro-kpi-details");
      details.append(detailRow("Kỳ dữ liệu", formatPeriod(item)));
      details.append(detailRow("Tần suất", item.frequency_label || item.frequency || "—"));
      details.append(detailRow("Pipeline tải", formatGeneratedAt(item.pipeline_updated_at)));
      details.append(detailRow("Nguồn", externalLink(item.source || "Nguồn", item.source_url)));
      if (item.history_scope) details.append(detailRow("Phạm vi", item.history_scope));

      card.append(top, valueRow, delta, details);
      container.append(card);
    });
  }

  function axisKey(unit) {
    if (/đồng/i.test(unit || "")) return "vnd";
    if (/^%/i.test(unit || "")) return "percent";
    if (/USD/i.test(unit || "")) return "usd";
    if (/index/i.test(unit || "")) return "index";
    if (/điểm/i.test(unit || "")) return "points";
    return "value";
  }

  function chartScaleOptions(datasets) {
    var axes = [];
    datasets.forEach(function (dataset) {
      if (!axes.includes(dataset.yAxisID)) axes.push(dataset.yAxisID);
    });
    var scales = {
      x: {
        grid: { color: "rgba(118, 160, 166, 0.08)" },
        ticks: { color: CHART_COLORS.tickText, maxTicksLimit: 8, maxRotation: 0 },
      },
    };
    axes.forEach(function (axis, index) {
      scales[axis] = {
        type: "linear",
        position: index % 2 === 0 ? "left" : "right",
        display: true,
        grid: { color: index === 0 ? "rgba(118, 160, 166, 0.10)" : "rgba(0,0,0,0)", drawOnChartArea: index === 0 },
        ticks: { color: CHART_COLORS.tickText, callback: function (value) { return formatNumber(value, datasets.find(function (d) { return d.yAxisID === axis; }).unit); } },
      };
    });
    return scales;
  }

  function renderCharts(snapshot) {
    applyChartTheme();
    chartInstances.forEach(function (instance) { instance.destroy(); });
    chartInstances = [];
    var container = byId("macro-charts");
    container.replaceChildren();
    var indicators = new Map(snapshot.indicators.map(function (item) { return [item.key, item]; }));
    var rendered = 0;

    CHART_GROUPS.forEach(function (group) {
      var members = group.keys.map(function (key) {
        return { item: indicators.get(key), points: snapshot.series[key] || [] };
      }).filter(function (entry) {
        return entry.item && entry.item.status === "available" && entry.points.length >= 2;
      });
      if (!members.length) return;

      var dates = Array.from(new Set(members.flatMap(function (entry) {
        return entry.points.map(function (point) { return point.date; });
      }))).sort();
      var card = element("article", "card macro-chart-card");
      var header = element("div", "card-header");
      var titleWrap = element("div");
      titleWrap.append(element("h3", "", group.title), element("p", "", group.subtitle));
      header.append(titleWrap, element("span", "badge-soft bs-gray", dates.length + " mốc"));

      var body = element("div", "card-body");
      var wrap = element("div", "macro-chart-wrap");
      var canvas = element("canvas");
      canvas.setAttribute("role", "img");
      canvas.setAttribute("aria-label", "Biểu đồ " + group.title + ". Dữ liệu từ " + dates[0] + " đến " + dates[dates.length - 1] + ".");
      wrap.append(canvas);
      body.append(wrap, element("p", "macro-chart-note", "Dữ liệu từ " + dates[0] + " đến " + dates[dates.length - 1] + ". Xem bảng chỉ báo để đọc giá trị và metadata nguồn."));
      card.append(header, body);
      container.append(card);

      if (!window.Chart) {
        wrap.replaceChildren(element("div", "macro-empty-chart", "Không tải được thư viện biểu đồ. Dữ liệu vẫn có trong bảng bên dưới."));
        rendered += 1;
        return;
      }

      var datasets = members.map(function (entry, index) {
        var values = new Map(entry.points.map(function (point) { return [point.date, point.value]; }));
        return {
          label: entry.item.label,
          data: dates.map(function (date) { return values.has(date) ? values.get(date) : null; }),
          unit: entry.item.unit,
          yAxisID: "y_" + axisKey(entry.item.unit),
          borderColor: CHART_COLORS.series[index % CHART_COLORS.series.length],
          backgroundColor: CHART_COLORS.series[index % CHART_COLORS.series.length] + "22",
          borderWidth: 1.7,
          pointRadius: dates.length > 80 ? 0 : 1.5,
          pointHoverRadius: 4,
          tension: 0.18,
          spanGaps: true,
        };
      });
      // animation/legend màu đã theo Chart.defaults (applyChartTheme ở đầu hàm, có
      // tôn trọng prefers-reduced-motion) — không set lại cục bộ ở đây nữa.
      chartInstances.push(new window.Chart(canvas, {
        type: "line",
        data: { labels: dates, datasets: datasets },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          normalized: true,
          interaction: { mode: "index", intersect: false },
          plugins: {
            tooltip: {
              callbacks: {
                label: function (context) {
                  return context.dataset.label + ": " + formatNumber(context.parsed.y, context.dataset.unit) + " " + context.dataset.unit;
                },
              },
            },
          },
          scales: chartScaleOptions(datasets),
        },
      }));
      rendered += 1;
    });

    if (!rendered) {
      container.append(element("div", "macro-empty-chart", "Chưa đủ lịch sử để vẽ biểu đồ. Cần ít nhất hai điểm dữ liệu hợp lệ cho một chuỗi."));
    }
  }

  function foreignMetric(label, value) {
    var card = element("div", "kpi");
    card.append(element("div", "kpi-label", label));
    card.append(element("div", "kpi-value", formatNumber(value, "tỷ đồng")));
    card.append(element("div", "kpi-sub", "tỷ đồng"));
    return card;
  }

  function renderForeign(snapshot) {
    var data = snapshot.foreign_flow || { status: "unavailable", reference_links: [] };
    var status = byId("foreign-status");
    var content = byId("foreign-content");
    content.replaceChildren();

    if (data.status === "available") {
      status.textContent = "Có dữ liệu";
      status.className = "badge-soft bs-green";
      var grid = element("div", "macro-kpi-grid");
      [
        ["Mua", data.buy_value_billion], ["Bán", data.sell_value_billion],
        ["Mua bán ròng", data.net_value_billion], ["Tích lũy 5 phiên", data.cumulative_5d_billion],
        ["Tích lũy 20 phiên", data.cumulative_20d_billion],
      ].forEach(function (metric) {
        if (metric[1] !== null && metric[1] !== undefined && Number.isFinite(Number(metric[1]))) {
          grid.append(foreignMetric(metric[0], Number(metric[1])));
        }
      });
      if (grid.childElementCount) content.append(grid);
      else content.append(element("p", "val-muted", "Snapshot đánh dấu khả dụng nhưng chưa có giá trị giao dịch để hiển thị."));
      return;
    }

    status.textContent = "Chưa có trong snapshot";
    status.className = "badge-soft bs-gray";
    var empty = element("div", "macro-foreign-empty");
    empty.append(icon("database-zap"));
    var copy = element("div");
    copy.append(element("h3", "", "Chưa có dữ liệu giao dịch khối ngoại trong snapshot"));
    copy.append(element("p", "", "Room ngoại còn lại không phải giá trị mua, bán hay mua bán ròng nên không được dùng để suy diễn dòng tiền."));
    var links = element("div", "macro-reference-links");
    (data.reference_links || []).forEach(function (item) {
      var link = externalLink("Xem " + item.label, item.url, "macro-reference-link");
      if (link.tagName === "A") link.append(icon("external-link"));
      links.append(link);
    });
    if (links.childElementCount) copy.append(links);
    empty.append(copy);
    content.append(empty);
  }

  function tableStatus(item) {
    var fresh = freshnessBadge(item);
    return element("span", "badge-soft " + fresh.className, fresh.text);
  }

  function td(content, className) {
    var cell = element("td", className || "");
    if (content instanceof Node) cell.append(content);
    else cell.textContent = content;
    return cell;
  }

  function renderTable(snapshot) {
    var body = byId("macro-table-body");
    body.replaceChildren();
    snapshot.indicators.forEach(function (item) {
      var row = element("tr");
      var name = element("span", "macro-table-indicator", item.label);
      var unit = element("span", "macro-table-sub", item.unit || "Không có đơn vị");
      var nameWrap = element("div");
      nameWrap.append(name, unit);
      var valueText = item.value === null ? "—" : formatNumber(item.value, item.unit) + " " + (item.unit || "");
      var delta = element("span", "macro-delta " + directionClass(item), deltaText(item));
      var source = externalLink(item.source || "—", item.source_url);
      row.append(
        td(nameWrap), td(valueText), td(delta), td(formatPeriod(item)),
        td(item.frequency_label || item.frequency || "—"), td(source),
        td(formatGeneratedAt(item.pipeline_updated_at || snapshot.pipeline_completed_at)), td(tableStatus(item))
      );
      body.append(row);
    });
    var quality = snapshot.quality || {};
    byId("table-summary").textContent = (quality.available_count || 0) + "/" +
      (quality.catalog_count || snapshot.indicators.length) + " chỉ báo có dữ liệu trong lần publish này.";
  }

  function renderSnapshot(snapshot, source) {
    byId("snapshot-date").textContent = snapshot.data_as_of || "—";
    byId("pipeline-time").textContent = formatGeneratedAt(snapshot.pipeline_completed_at || snapshot.generated_at);
    var quality = snapshot.quality || {};
    if (quality.is_partial || quality.missing_count > 0) {
      setStatusBadge("Snapshot thiếu một phần", "bs-amber");
      setNotice("warning", "Snapshot đã tải nhưng còn " + quality.missing_count + " chỉ báo chưa có giá trị.", "triangle-alert");
    } else if (quality.stale_count > 0) {
      setStatusBadge("Có dữ liệu cần cập nhật", "bs-amber");
      setNotice("warning", "Đã tải " + quality.available_count + " chỉ báo. Có " + quality.stale_count + " chỉ báo vượt ngưỡng độ mới theo tần suất riêng.", "clock-alert");
    } else {
      setStatusBadge("Tải thành công", "bs-green");
      setNotice("success", "Đã tải " + quality.available_count + " chỉ báo từ " + (source === "json" ? "lần publish gần nhất" : "local pipeline snapshot") + ".", "circle-check");
    }
    renderKpis(snapshot);
    renderCharts(snapshot);
    renderForeign(snapshot);
    renderTable(snapshot);
    if (window.lucide && typeof window.lucide.createIcons === "function") window.lucide.createIcons();
  }

  function renderUnavailable(kind) {
    var invalid = kind === "invalid";
    setStatusBadge(invalid ? "File không hợp lệ" : "Chưa có snapshot", "bs-red");
    setNotice("error", invalid ? "Snapshot không đúng schema an toàn nên trang không hiển thị dữ liệu." : "Chưa có snapshot được publish. Hãy chạy pipeline vĩ mô rồi publish lại dashboard.", "circle-x");
    byId("macro-kpis").replaceChildren(element("div", "macro-empty-chart", "Không có chỉ báo khả dụng để hiển thị."));
    byId("macro-charts").replaceChildren(element("div", "macro-empty-chart", "Chưa đủ dữ liệu lịch sử để vẽ biểu đồ."));
    byId("macro-table-body").replaceChildren((function () {
      var row = element("tr");
      var cell = element("td", "macro-table-empty", "Chưa có dữ liệu.");
      cell.colSpan = 8;
      row.append(cell);
      return row;
    })());
    byId("table-summary").textContent = "Không có chỉ báo hợp lệ trong lần tải này.";
    renderForeign({ foreign_flow: { status: "unavailable", reference_links: [] } });
    if (window.lucide && typeof window.lucide.createIcons === "function") window.lucide.createIcons();
  }

  async function init() {
    var result = await loadMacroData();
    if (!result.snapshot) {
      renderUnavailable("missing");
      return;
    }
    if (!validateSnapshot(result.snapshot)) {
      renderUnavailable("invalid");
      return;
    }
    renderSnapshot(result.snapshot, result.source);
  }

  window.MacroPage = {
    loadMacroData: loadMacroData,
    validateSnapshot: validateSnapshot,
    renderSnapshot: renderSnapshot,
    formatPeriod: formatPeriod,
  };

  document.addEventListener("DOMContentLoaded", init);
})();
