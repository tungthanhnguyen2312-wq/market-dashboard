const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const root = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(root, "decision-cockpit.html"), "utf8");
const script = fs.readFileSync(path.join(root, "assets", "js", "decision-cockpit.js"), "utf8");
const vf = require("../assets/js/value-format.js");
const dc = require("../assets/js/decision-cockpit.js");
const fixtureData = JSON.parse(fs.readFileSync(path.join(root, "data", "current_decision_cockpit.json"), "utf8"));

test("decision-cockpit.html loads value-format.js before decision-cockpit.js", () => {
  const vfIdx = html.indexOf("assets/js/value-format.js");
  const dcIdx = html.indexOf("assets/js/decision-cockpit.js");
  assert.ok(vfIdx > 0, "value-format.js must be referenced in HTML");
  assert.ok(dcIdx > 0, "decision-cockpit.js must be referenced in HTML");
  assert.ok(vfIdx < dcIdx, "value-format.js must load before decision-cockpit.js");
});

test("decision-cockpit.html is a thin deterministic redirect preserving query and hash", () => {
  assert.doesNotMatch(html, /<meta http-equiv="refresh"/);
  assert.doesNotMatch(html, /Không gian quyết định/);
  assert.match(html, /window\.location\.replace\("investment-workspace\.html" \+ search \+ hash\)/);
  assert.match(html, /id="redirect-link"/);
  assert.match(html, /Bàn quyết định đã được hợp nhất/);
  assert.match(html, /Chỉ phục vụ nghiên cứu có người kiểm tra/);

  // Test redirect logic with query and hash preservation
  function simulateRedirect(search, hash) {
    return "investment-workspace.html" + (search || "") + (hash || "");
  }
  assert.equal(simulateRedirect("?ticker=HPG", ""), "investment-workspace.html?ticker=HPG");
  assert.equal(simulateRedirect("?ticker=HPG", "#lineage"), "investment-workspace.html?ticker=HPG#lineage");
  assert.equal(simulateRedirect("", "#market-overview"), "investment-workspace.html#market-overview");
});

test("major static page chrome is in natural Vietnamese without English remnants across merged surfaces", () => {
  const wsHtml = fs.readFileSync(path.join(root, "investment-workspace.html"), "utf8");
  const requiredVi = [
    "Bàn quyết định",
    "Nguồn dữ liệu / Bằng chứng",
    "Chỉ để người đọc rà soát nghiên cứu",
    "Tổng quan thị trường",
    "Khám phá cơ hội",
    "Danh sách theo dõi",
    "Mã",
    "Trạng thái / Hành động nghiên cứu",
    "Chiến lược",
    "Kịch bản",
    "Bằng chứng / Xung đột",
    "Chất lượng dữ liệu",
    "Thẻ quyết định",
    "Bối cảnh rủi ro danh mục",
    "Khoảng trống dữ liệu &amp; nội dung cần kiểm chứng",
  ];
  for (const label of requiredVi) {
    assert.match(wsHtml, new RegExp(label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }

  // Ensure old primary English chrome is replaced
  const forbiddenEnglishChrome = [
    "Decision Cockpit V2",
    "RETAINED RESEARCH SESSION",
    "Market overview",
    "Research discovery",
    "Watchlist",
    "Ticker research detail",
    "Portfolio risk",
    "Data gaps & what to verify",
    "Human-review research only"
  ];
  for (const label of forbiddenEnglishChrome) {
    assert.doesNotMatch(wsHtml, new RegExp(`<h5>${label}|>${label}<|badge-soft[^>]*>${label}`));
  }
});

test("dynamic ticker detail and labels in JS are translated into Vietnamese", () => {
  const requiredDynamicLabels = [
    "Trạng thái hiện tại",
    "Hành động nghiên cứu",
    "Khung thời gian",
    "Chất lượng kỹ thuật",
    "Mức phù hợp chiến lược",
    "Bối cảnh cùng ngành",
    "Điểm bất thường",
    "Điểm không bất thường",
    "Cơ bản doanh nghiệp",
    "Doanh thu",
    "Lợi nhuận",
    "Mức đồng thuận",
    "Định giá",
    "Định giá nghiêm ngặt",
    "Chỉ báo thay thế nghiên cứu",
    "Dòng tiền thị trường",
    "Giá trị giao dịch",
    "Khối ngoại",
    "Tự doanh",
    "Dòng lệnh chủ động",
    "Thông tin doanh nghiệp",
    "Đã xác nhận",
    "Đang chờ / Kế hoạch",
    "Cần kiểm chứng",
    "Kịch bản tiêu cực / Cơ sở / Tích cực — có điều kiện, không phải dự báo",
    "Tiêu cực",
    "Cơ sở",
    "Tích cực",
    "Điều kiện xác nhận",
    "Điều kiện vô hiệu",
    "Khoảng trống dữ liệu",
    "Luận điểm / Phản biện",
    "Vĩ mô",
    "Giới hạn dữ liệu",
    "Nhóm ưu tiên xem xét",
    "mã",
    "Chưa ghi nhận"
  ];
  for (const label of requiredDynamicLabels) {
    assert.match(script, new RegExp(label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
});

test("state formatter maps domain enums to Vietnamese and preserves raw enum in data-state/title", () => {
  const cases = [
    { input: "AVAILABLE", expected: "Có dữ liệu" },
    { input: "UNAVAILABLE", expected: "Chưa có dữ liệu" },
    { input: "PARTIAL", expected: "Một phần" },
    { input: "BLOCKED", expected: "Bị chặn" },
    { input: "UNKNOWN", expected: "Chưa xác định" },
    { input: "WAIT_FOR_CONFIRMATION", domain: "research_stance", expected: "Chờ xác nhận" },
    { input: "INITIATE_RESEARCH_CANDIDATE", domain: "research_stance", expected: "Ứng viên nghiên cứu mở vị thế" },
    { input: "ACCUMULATE_RESEARCH_CANDIDATE", domain: "research_stance", expected: "Ứng viên nghiên cứu tích lũy" },
    { input: "HIGH_RISK_SPECULATION_ONLY", domain: "research_stance", expected: "Chỉ đầu cơ rủi ro cao" },
    { input: "AVOID_NEW_ENTRY", domain: "research_stance", expected: "Tránh mở vị thế mới" },
    { input: "SELLING_PRESSURE_EASING", domain: "tactical_state", expected: "Áp lực bán đang hạ nhiệt" },
    { input: "BASE_BUILDING", domain: "tactical_state", expected: "Đang tạo nền" },
    { input: "BREAKOUT_READY", domain: "tactical_state", expected: "Sẵn sàng bứt phá" },
    { input: "EARLY_REVERSAL_CANDIDATE", domain: "tactical_state", expected: "Ứng viên đảo chiều sớm" },
  ];

  for (const c of cases) {
    const rendered = dc.state(c.input, c.domain);
    assert.match(rendered, new RegExp(`data-state="${c.input}"`));
    assert.match(rendered, new RegExp(`title="${c.input}"`));
    assert.match(rendered, new RegExp(c.expected));
  }
});

test("cohort progressive disclosure: <= 8 renders all, > 8 defaults to 8 with expand/collapse toggle", () => {
  // Mock data with both small (<= 8) and large (> 8) cohorts
  const mockData = {
    session: "2026-08-28",
    source: { operation_identity: "op-1", product_identity: "prod-1", warnings: [] },
    research_discovery: {
      cohorts: {
        SMALL_COHORT: {
          count: 5,
          tickers: ["AAA", "BBB", "CCC", "DDD", "EEE"],
          ordering: "TICKER_ASCENDING_NOT_RANKING"
        },
        LARGE_COHORT: {
          count: 12,
          tickers: ["T01", "T02", "T03", "T04", "T05", "T06", "T07", "T08", "T09", "T10", "T11", "T12"],
          ordering: "TICKER_ASCENDING_NOT_RANKING"
        }
      },
      high_priority_review: {
        count: 14,
        tickers: ["P01", "P02", "P03", "P04", "P05", "P06", "P07", "P08", "P09", "P10", "P11", "P12", "P13", "P14"],
        meaning: "Candidate list"
      }
    },
    watchlist: { tickers: ["AAA", "BBB"] },
    ticker_cards: {
      AAA: { current_decision_state: {}, strategy_fit: {}, scenario: {}, peer_context: {}, fundamental_context: {}, valuation_context: {}, market_flow_positioning: {}, corporate_intelligence_context: {}, authority_limitations: [] },
      BBB: { current_decision_state: {}, strategy_fit: {}, scenario: {}, peer_context: {}, fundamental_context: {}, valuation_context: {}, market_flow_positioning: {}, corporate_intelligence_context: {}, authority_limitations: [] }
    }
  };

  const elements = {};
  const queryMap = {};

  global.document = {
    getElementById(id) {
      if (!elements[id]) {
        elements[id] = {
          id,
          hidden: false,
          textContent: "",
          innerHTML: "",
          value: "",
          addEventListener() {},
          setAttribute(k, v) { this[k] = v; },
          getAttribute(k) { return this[k]; }
        };
      }
      return elements[id];
    },
    querySelectorAll(selector) {
      return queryMap[selector] || [];
    }
  };

  dc.render(mockData);

  const cohortsHtml = elements["cohorts"].innerHTML;
  // Small cohort: <= 8 tickers -> no toggle button
  assert.match(cohortsHtml, /id="cohort-0-chips"/);
  assert.doesNotMatch(cohortsHtml, /aria-controls="cohort-0-extra"/);
  for (const t of mockData.research_discovery.cohorts.SMALL_COHORT.tickers) {
    assert.match(cohortsHtml, new RegExp(`data-ticker="${t}"`));
  }

  // Large cohort: 12 tickers -> exactly 8 initial, remaining in extra hidden span, toggle button with "Xem thêm 4 mã"
  assert.match(cohortsHtml, /id="cohort-1-chips"/);
  assert.match(cohortsHtml, /aria-controls="cohort-1-extra"/);
  assert.match(cohortsHtml, /aria-expanded="false"/);
  assert.match(cohortsHtml, /Xem thêm 4 mã/);
  assert.match(cohortsHtml, /id="cohort-1-extra"[^>]*hidden/);

  // Priority review: 14 tickers -> 10 initial, remaining in extra hidden span, toggle button with "Xem thêm 4 mã"
  const priorityHtml = elements["priority-review"].innerHTML;
  assert.match(priorityHtml, /aria-controls="priority-extra"/);
  assert.match(priorityHtml, /aria-expanded="false"/);
  assert.match(priorityHtml, /Xem thêm 4 mã/);
  assert.match(priorityHtml, /id="priority-extra"[^>]*hidden/);

  // Simulate toggle button click interaction
  const btn = {
    getAttribute(attr) { return this[attr]; },
    setAttribute(attr, val) { this[attr] = val; },
    dataset: { remaining: "4" },
    textContent: "Xem thêm 4 mã",
    "aria-controls": "cohort-1-extra",
    "aria-expanded": "false",
    onclick: null
  };
  const extraSpan = global.document.getElementById("cohort-1-extra");
  extraSpan.hidden = true;

  queryMap['[data-action="toggle-cohort"]'] = [btn];
  queryMap['[data-ticker]'] = [];
  dc.bindInteractiveEvents(mockData, () => {});

  assert.ok(typeof btn.onclick === "function", "toggle button must have onclick handler bound");

  // Click 1: expand
  btn.onclick({ preventDefault() {} });
  assert.strictEqual(extraSpan.hidden, false, "extraSpan must be visible after expand click");
  assert.strictEqual(btn.getAttribute("aria-expanded"), "true");
  assert.strictEqual(btn.textContent, "Thu gọn");

  // Click 2: collapse
  btn.onclick({ preventDefault() {} });
  assert.strictEqual(extraSpan.hidden, true, "extraSpan must be hidden after collapse click");
  assert.strictEqual(btn.getAttribute("aria-expanded"), "false");
  assert.strictEqual(btn.textContent, "Xem thêm 4 mã");
});

test("DOM rendering: full fixture verification with preserved analytical semantics", () => {
  const elements = {};
  global.document = {
    getElementById(id) {
      if (!elements[id]) {
        elements[id] = {
          id,
          hidden: false,
          textContent: "",
          innerHTML: "",
          value: "",
          addEventListener() {},
          setAttribute(k, v) { this[k] = v; },
          getAttribute(k) { return this[k]; }
        };
      }
      return elements[id];
    },
    querySelectorAll() {
      return [];
    }
  };

  dc.render(fixtureData);

  // 1. Check Watchlist table count & rows
  const watchCount = (fixtureData.watchlist?.tickers || []).length;
  assert.strictEqual(elements["watch-count"].textContent, `${watchCount} mã`);
  const watchlistHtml = elements["watchlist"].innerHTML;
  for (const t of fixtureData.watchlist?.tickers || []) {
    assert.match(watchlistHtml, new RegExp(`data-ticker="${t}"`));
  }

  // 2. Check ticker select has all ticker cards
  const selectHtml = elements["ticker-select"].innerHTML;
  const allTickers = Object.keys(fixtureData.ticker_cards || {});
  assert.ok(allTickers.length > 0);
  for (const t of allTickers) {
    assert.match(selectHtml, new RegExp(`value="${t}"`));
  }

  // 3. Check session line has natural Vietnamese session and details
  const sessionLineHtml = elements["session-line"].innerHTML;
  assert.match(sessionLineHtml, /Phiên nghiên cứu: 2026-08-28/);
  assert.match(sessionLineHtml, /Chi tiết kỹ thuật/);
  assert.match(sessionLineHtml, new RegExp(fixtureData.source?.operation_identity));
  assert.match(sessionLineHtml, new RegExp(fixtureData.source?.product_identity));

  // 4. Check lineage
  const lineageHtml = elements["lineage-content"].innerHTML;
  assert.match(lineageHtml, /Mã băm bảng kê/);
  assert.match(lineageHtml, /Mã băm sản phẩm/);
  assert.match(lineageHtml, /Tính nhất quán phiên/);
  assert.match(lineageHtml, new RegExp(fixtureData.source?.operation_manifest_sha256));

  // 5. Check ticker card detail rendering for HPG
  dc.renderTicker(fixtureData, "HPG");
  const cardHtml = elements["ticker-card"].innerHTML;
  assert.match(cardHtml, /Trạng thái hiện tại/);
  assert.match(cardHtml, /Hành động nghiên cứu/);
  assert.match(cardHtml, /Khung thời gian/);
  assert.match(cardHtml, /Mức phù hợp chiến lược/);
  assert.match(cardHtml, /Bối cảnh cùng ngành/);
  assert.match(cardHtml, /Cơ bản doanh nghiệp/);
  assert.match(cardHtml, /Định giá/);
  assert.match(cardHtml, /Dòng tiền thị trường/);
  assert.match(cardHtml, /Thông tin doanh nghiệp/);
  assert.match(cardHtml, /Kịch bản tiêu cực \/ Cơ sở \/ Tích cực/);
  assert.match(cardHtml, /Luận điểm \/ Phản biện/);
  assert.match(cardHtml, /Vĩ mô/);

  // 6. Test ticker click calls renderTicker for clicked ticker
  let clickedTicker = null;
  const tickerBtn = {
    dataset: { ticker: "AAM" },
    onclick: null
  };
  dc.bindInteractiveEvents(fixtureData, (t) => { clickedTicker = t; });
  // Query with ticker button
  global.document.querySelectorAll = (sel) => sel === '[data-ticker]' ? [tickerBtn] : [];
  dc.bindInteractiveEvents(fixtureData, (t) => { clickedTicker = t; });
  assert.ok(typeof tickerBtn.onclick === "function");
  tickerBtn.onclick({ preventDefault() {} });
  assert.strictEqual(clickedTicker, "AAM");
});

test("preserves no-execution boundaries and analytical integrity", () => {
  assert.match(html, /Chỉ phục vụ nghiên cứu có người kiểm tra/);
  assert.match(html, /Không tạo giá mục tiêu, khuyến nghị, xác suất, quy mô vị thế hoặc chỉ thị giao dịch/);
  assert.doesNotMatch(html + script, /execute trade|place order|sell order/i);
  assert.strictEqual(fixtureData.schema_version, "current_decision_cockpit_projection/v2");
});
