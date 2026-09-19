const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const sm = require("../assets/js/screener-master.js");
const ws = require("../assets/js/investment-workspace.js");

const html = fs.readFileSync(path.join(__dirname, "..", "screener.html"), "utf8");
const script = fs.readFileSync(path.join(__dirname, "..", "assets/js/screener-master.js"), "utf8");
// DASHBOARD_PAYLOAD_COMPACTION_AND_INVESTOR_FIRST_IA_V1: the public Workspace payload is the
// compact workspace_index/v1 document; a ticker's full card lives in its deterministic detail
// shard (see workspace-read-model.js). currentWorkspace.cards holds thin cards only.
const currentWorkspace = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "data", "workspace_index.json"), "utf8"));
const currentScreener = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "data", "screener_master_projection.json"), "utf8"));

function fullWorkspaceCard(ticker) {
  const thin = currentWorkspace.cards[ticker];
  if (!thin) return null;
  const shard = JSON.parse(fs.readFileSync(
    path.join(__dirname, "..", "data", "workspace_detail", `${thin.detail_shard}.json`), "utf8",
  ));
  return shard.tickers[ticker] || null;
}

function card(overrides) {
  return Object.assign({
    ticker: "HPG",
    listing_exchange: "HOSE",
    display_exchange: "HSX",
    price: { value: 22.2, change_pct: 0.0135, status: "PRICE_AVAILABLE", change_pct_unit: "FRACTION" },
    sector: { label: "Tài nguyên Cơ bản", status: "AVAILABLE" },
    entity_type: { value: "corporate", status: "AVAILABLE" },
    liquidity: { research_value: null, method: "LIQUIDITY_RESEARCH_PROXY", status: "AVAILABLE" },
    execution: { capacity_exact_status: "EXECUTION_CAPACITY_EXACT_BLOCKED", capacity_exact_reason: "x" },
    tactical: { entry_state: "SELLING_PRESSURE_EASING", status: "AVAILABLE" },
    research: { stance: "WAIT_FOR_CONFIRMATION", status: "AVAILABLE" },
    financial_v2: { status: "AVAILABLE", current_research_ready: true },
    freshness: { row: "CURRENT" },
  }, overrides);
}

test("screener primary source is the master projection with JS fallback only", () => {
  const combined = html + script;
  assert.match(combined, /data\/screener_master_projection\.json/);
  assert.match(combined, /data\/screener_master_projection\.js/);
  assert.match(html, /assets\/js\/screener-master\.js/);
  assert.doesNotMatch(html, /loadCsv\("screen_snapshot\.csv"/);
  assert.match(html, /decision-drawer/);
});

test("percent formatting uses fraction * 100 once", () => {
  assert.equal(sm.formatSessionPercent(0.0135).text, "+1.35%");
  assert.equal(sm.formatSessionPercent(-0.0123).text, "-1.23%");
  assert.equal(sm.formatSessionPercent(0).text, "0.00%");
  assert.notEqual(sm.formatSessionPercent(0.0135).text, "0.01");
  assert.notEqual(sm.formatSessionPercent(0.0135).text, "+135%");
});

test("HNX_LISTED display mapping is consumed as HNX not DELISTED", () => {
  const row = card({ listing_exchange: "HNX_LISTED", display_exchange: "HNX" });
  assert.equal(row.display_exchange, "HNX");
  assert.notEqual(row.display_exchange, "DELISTED");
});

test("sector display never uses entity class vocabulary", () => {
  assert.equal(sm.formatSector({ label: "Hóa chất", status: "AVAILABLE" }).text, "Hóa chất");
  assert.equal(sm.formatSector({ label: null, status: "UNKNOWN" }).text, "Chưa phân loại ngành");
  assert.equal(sm.formatSector({ label: "bank", status: "AVAILABLE" }).text, "Chưa phân loại ngành");
  assert.equal(sm.formatSector({ label: "corporate", status: "AVAILABLE" }).text, "Chưa phân loại ngành");
});

test("liquidity proxy remains visible when exact execution is blocked", () => {
  const text = sm.formatLiquidity(
    { research_value: null, method: "LIQUIDITY_RESEARCH_PROXY", status: "AVAILABLE" },
    { capacity_exact_status: "EXECUTION_CAPACITY_EXACT_BLOCKED" },
  ).text;
  assert.match(text, /Proxy nghiên cứu/);
  assert.doesNotMatch(text, /^0/);
  assert.doesNotMatch(text, /GTGD/);
});

test("READY is not translated into a buy instruction", () => {
  assert.equal(sm.translateStatus("READY"), "Sẵn sàng nghiên cứu");
  assert.doesNotMatch(sm.translateStatus("READY"), /Mua|Đủ điều kiện mua/i);
  assert.match(sm.translateStatus("EXECUTION_CAPACITY_EXACT_BLOCKED"), /quy mô lệnh chính xác/);
});

test("Financial V2 absent row is retained by filters and formatter", () => {
  const absent = card({ ticker: "ZZZ", financial_v2: { status: "ABSENT" } });
  assert.equal(sm.matchesScreenerFilters(absent, {}), true);
  assert.equal(sm.formatFinancial(absent.financial_v2).text, "Chưa có dữ liệu tài chính");
});

test("filters operate on projection fields that exist", () => {
  const row = card();
  assert.equal(sm.matchesScreenerFilters(row, { exchange: "HSX", stance: "WAIT_FOR_CONFIRMATION" }), true);
  assert.equal(sm.matchesScreenerFilters(row, { exchange: "HNX" }), false);
  assert.equal(sm.matchesScreenerFilters(row, { liquidity: "PROXY" }), true);
  assert.equal(sm.matchesScreenerFilters(row, { tactical: "DOWNTREND" }), false);
});

test("drawer ticker identity does not reroute to another ticker", () => {
  const id = sm.drawerIdentity("HPG", "HPG", { ticker: "HPG" });
  assert.equal(id.ok, true);
  const missing = sm.drawerIdentity("AAA", "AAA", null);
  assert.equal(missing.table, "AAA");
  assert.equal(missing.selected, "AAA");
  assert.equal(missing.workspace, null);
  assert.equal(missing.drawer, "AAA");
  assert.equal(missing.ok, false);
  assert.notEqual(missing.drawer, "HPG");
});

test("Screener accepts only the current canonical Workspace schema and contract", () => {
  assert.equal(sm.validateWorkspaceProjection(currentWorkspace), true);
  assert.equal(currentWorkspace.schema_version, sm.WORKSPACE_SCHEMA_VERSION);
  assert.equal(currentWorkspace.contract_version, sm.WORKSPACE_CONTRACT_VERSION);
  assert.match(html, /validateWorkspaceProjection\(payload\)/);

  const legacyContract = { ...currentWorkspace, contract_version: "investment_decision_workspace_projection/v1" };
  const wrongSchema = { ...currentWorkspace, schema_version: "2.0.0" };
  const missingContract = { ...currentWorkspace };
  delete missingContract.contract_version;
  assert.equal(sm.validateWorkspaceProjection(legacyContract), false);
  assert.equal(sm.validateWorkspaceProjection(wrongSchema), false);
  assert.equal(sm.validateWorkspaceProjection(missingContract), false);
  assert.equal(sm.validateWorkspaceProjection({ ...currentWorkspace, cards: undefined }), false);
  assert.equal(sm.validateWorkspaceProjection({ ...currentWorkspace, cards: [] }), false);
  assert.equal(sm.validateWorkspaceProjection({ ...currentWorkspace, cards: {} }), false);
  assert.equal(sm.validateWorkspaceProjection(null), false);
});

test("current Screener rows open their own canonical Workspace cards without substitution", () => {
  for (const ticker of ["HPG", "FPT", "SSI", "VCB"]) {
    const row = currentScreener.cards[ticker];
    assert.ok(row, `${ticker} Screener row exists`);
    assert.ok(currentWorkspace.cards[ticker], `${ticker} Workspace index card exists`);
    const workspaceCard = fullWorkspaceCard(ticker);
    assert.ok(workspaceCard, `${ticker} Workspace detail shard card exists`);
    const identity = sm.drawerIdentity(row.ticker, ticker, workspaceCard);
    assert.equal(identity.ok, true, `${ticker} drawer identity`);
    assert.equal(identity.table, ticker);
    assert.equal(identity.selected, ticker);
    assert.equal(identity.workspace, ticker);
    const rendered = ws.renderDecisionCard(workspaceCard, null, { ticker });
    assert.match(rendered, new RegExp(`data-decision-ticker="${ticker}"`));
    assert.equal(ws.selectedTickerForDeepLink(Object.keys(currentWorkspace.cards), ticker.toLowerCase()), ticker);
  }
  const unknown = sm.drawerIdentity("UNKNOWN", "UNKNOWN", null);
  assert.equal(unknown.ok, false);
  assert.equal(unknown.drawer, "UNKNOWN");
  assert.equal(ws.selectedTickerForDeepLink(Object.keys(currentWorkspace.cards), "UNKNOWN"), null);
});

test("workspace renderer is reused and does not recompute decisions", () => {
  assert.equal(typeof ws.renderDecisionCard, "function");
  const htmlCard = ws.decisionCardHtml({
    ticker: "HPG", research_stance: "WAIT_FOR_CONFIRMATION", entry_state: "DOWNTREND",
    why: {}, valuation: {}, counter_thesis: {}, confirmation: {}, invalidation: {},
    lineage: { per_axis_freshness: {} }, prospective_case: {},
  }, { ticker: "HPG" });
  assert.match(htmlCard, /data-decision-ticker="HPG"/);
  assert.match(htmlCard, /data-state="WAIT_FOR_CONFIRMATION"/);
  assert.match(htmlCard, /Chờ xác nhận/);
  assert.doesNotMatch(htmlCard, /BUY NOW|place order/i);
  assert.doesNotMatch(script, /entry_state\s*=\s*["']BUY/);
});

test("translateStatus never leaks a raw unmapped code, falls back to Chưa đủ dữ liệu", () => {
  assert.equal(sm.translateStatus("SOME_BRAND_NEW_CODE_NEVER_SEEN"), "Chưa đủ dữ liệu");
  assert.equal(sm.translateStatus(""), "Chưa đủ dữ liệu");
  assert.equal(sm.translateStatus(null), "Chưa đủ dữ liệu");
});

test("publication files exist", () => {
  assert.equal(fs.existsSync(path.join(__dirname, "..", "data/screener_master_projection.json")), true);
  assert.equal(fs.existsSync(path.join(__dirname, "..", "data/screener_master_projection.js")), true);
  assert.equal(fs.existsSync(path.join(__dirname, "..", "data/workspace_index.json")), true);
  assert.equal(fs.existsSync(path.join(__dirname, "..", "data/investment_decision_workspace.json")), false,
    "the pre-compaction ~95MB monolith must be retired, not published alongside the new read model");
});
