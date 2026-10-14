"use strict";

/* DASHBOARD_HOME_PAYLOAD_EFFICIENCY_V1
 *
 * The retained fixture has no Producer notable_cards block, so Home still downloads
 * workspace_index.json. These tests pin that cost and prove a qualified block renders
 * the same four cards with no second index fetch and no second build_info.json fetch.
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const root = path.resolve(__dirname, "..");
const overview = require("../assets/js/dashboard-product-summary.js");
const presentation = require("../assets/js/workspace-card-presentation.js");

const summaryBytes = fs.readFileSync(path.join(root, "data/dashboard_home_summary.json"));
const indexBytes = fs.readFileSync(path.join(root, "data/workspace_index.json"));
const summary = JSON.parse(summaryBytes.toString("utf8"));
const index = JSON.parse(indexBytes.toString("utf8"));
const buildInfo = JSON.parse(fs.readFileSync(path.join(root, "data/build_info.json"), "utf8"));

function projectNotableBlock(source) {
  const tickers = presentation.notableTickers(source.cards);
  return {
    contract_version: overview.NOTABLE_CARDS_CONTRACT,
    as_of_session: source.as_of_session,
    source_contract_version: "workspace_index/v1",
    source_artifact_identity: source.source_artifact_identity,
    selection: overview.NOTABLE_SELECTION,
    selection_limit: overview.NOTABLE_SELECTION_LIMIT,
    cards: tickers.map((ticker) => {
      const card = source.cards[ticker];
      return {
        ticker,
        as_of_session: card.as_of_session,
        research_action_posture: card.research_action_posture,
        entry_state: card.entry_state,
        evidence_currency: card.evidence_currency,
        position_context: card.position_context,
        why: card.why,
        reference_trigger: card.reference_trigger,
        counter_thesis: card.counter_thesis,
      };
    }),
  };
}

function summaryWithBlock(block) {
  const ordered = {};
  for (const [key, value] of Object.entries(summary)) {
    if (key === "authority_effect") ordered.notable_cards = block;
    ordered[key] = value;
  }
  return ordered;
}

function bestParseMs(bytes) {
  let best = Number.POSITIVE_INFINITY;
  const text = Buffer.isBuffer(bytes) ? bytes.toString("utf8") : bytes;
  for (let i = 0; i < 5; i += 1) {
    const started = process.hrtime.bigint();
    JSON.parse(text);
    const elapsed = Number(process.hrtime.bigint() - started) / 1e6;
    if (elapsed < best) best = elapsed;
  }
  return best;
}

const notableBlock = projectNotableBlock(index);
const enlarged = Buffer.from(`${JSON.stringify(summaryWithBlock(notableBlock), null, 2)}\n`, "utf8");

test("retained Home data bytes are the summary plus the full workspace index", () => {
  assert.equal(summary.notable_cards, undefined);
  assert.equal(summaryBytes.length, 4771);
  assert.equal(indexBytes.length, 4664540);
  assert.equal(summaryBytes.length + indexBytes.length, 4669311);
  assert.equal(overview.homeOpportunityRequestPlan(summary, buildInfo).join(","), overview.WORKSPACE_INDEX_URL);
  assert.deepEqual(overview.buildInfoRequestPlan(buildInfo), []);
});

test("a qualified notable block matches the four index cards and drops the index fetch", () => {
  const withCards = summaryWithBlock(notableBlock);
  const fromIndex = overview.homeOpportunitiesHtml(index, index.as_of_session, presentation);
  const fromBlock = overview.publishedNotableHtml(
    overview.qualifiedNotableCards(withCards, buildInfo.market_session, buildInfo),
    presentation,
  );
  assert.equal(fromBlock, fromIndex);
  assert.deepEqual(
    [...fromBlock.matchAll(/data-focus-ticker="([^"]+)"/g)].map((match) => match[1]),
    ["AAS", "ABW", "ACB", "ACG"],
  );
  assert.deepEqual(
    [...fromBlock.matchAll(/href="([^"]+)"/g)].map((match) => match[1]),
    ["AAS", "ABW", "ACB", "ACG"].map((ticker) => `investment-workspace.html?ticker=${ticker}`),
  );
  assert.match(fromBlock, /CONSTRUCTIVE_NON_BREAKOUT_WITH_USABLE_FUNDAMENTAL|nền tảng/);
  assert.equal(overview.validateHomeSummary(withCards, buildInfo.market_session), true);
  assert.deepEqual(overview.homeOpportunityRequestPlan(withCards, buildInfo), []);
  assert.ok(enlarged.length < 20000);
  assert.ok(enlarged.length < indexBytes.length);
  const indexParse = bestParseMs(indexBytes);
  const blockParse = bestParseMs(enlarged);
  assert.ok(blockParse < indexParse, `notable parse ${blockParse}ms must be below index parse ${indexParse}ms`);
  console.log(JSON.stringify({
    bytes_before: summaryBytes.length + indexBytes.length,
    bytes_after_retained: summaryBytes.length + indexBytes.length,
    js_reserialized_summary_bytes: enlarged.length,
    parse_ms_index_best_of_5: Number(indexParse.toFixed(3)),
    parse_ms_notable_summary_best_of_5: Number(blockParse.toFixed(3)),
  }));
});

test("a malformed, stale, or unbound notable block keeps the index fallback", () => {
  const base = summaryWithBlock(notableBlock);
  const stale = summaryWithBlock({ ...notableBlock, as_of_session: "2000-01-01" });
  const unbound = summaryWithBlock({ ...notableBlock, source_artifact_identity: "investment_decision_workspace_projection/v1:0" });
  const oversized = summaryWithBlock({ ...notableBlock, cards: notableBlock.cards.concat(notableBlock.cards) });
  const brokenReasons = summaryWithBlock({
    ...notableBlock,
    cards: notableBlock.cards.map((card, i) => (i === 0 ? { ...card, why: { deterministic_reasons: "HIDDEN" } } : card)),
  });
  for (const candidate of [base, stale, unbound, oversized, brokenReasons]) {
    assert.equal(overview.validateHomeSummary(candidate, buildInfo.market_session), candidate === base || candidate.as_of_session === buildInfo.market_session);
  }
  assert.equal(overview.qualifiedNotableCards(stale, buildInfo.market_session, buildInfo), null);
  assert.equal(overview.qualifiedNotableCards(unbound, buildInfo.market_session, buildInfo), null);
  assert.equal(overview.qualifiedNotableCards(oversized, buildInfo.market_session, buildInfo), null);
  assert.equal(overview.qualifiedNotableCards(brokenReasons, buildInfo.market_session, buildInfo), null);
  for (const candidate of [stale, unbound, oversized, brokenReasons, summary]) {
    assert.deepEqual(overview.homeOpportunityRequestPlan(candidate, buildInfo), [overview.WORKSPACE_INDEX_URL]);
  }
});

test("embedded build_info is the only freshness read on Home", () => {
  const html = fs.readFileSync(path.join(root, "dashboard.html"), "utf8");
  assert.match(html, /data\/build_info\.js/);
  assert.doesNotMatch(html, /data\/build_info\.json/);
  assert.deepEqual(overview.buildInfoRequestPlan(buildInfo), []);
  assert.deepEqual(overview.buildInfoRequestPlan(null), [overview.BUILD_INFO_URL]);
  assert.deepEqual(overview.buildInfoRequestPlan({}), [overview.BUILD_INFO_URL]);
});

test("boot renders the published cards once and does not fetch the index", async () => {
  const withCards = summaryWithBlock(notableBlock);
  const host = { innerHTML: "", textContent: "" };
  const previous = { document: global.document, window: global.window, fetch: global.fetch };
  let fetches = 0;
  global.window = { VSWorkspaceCardPresentation: presentation, BUILD_INFO: buildInfo };
  global.document = { getElementById: (id) => (id === "home-opportunities" ? host : null) };
  global.fetch = () => { fetches += 1; return Promise.reject(new Error("fetch must not run")); };
  try {
    overview.bootHomeOpportunities(buildInfo.market_session, withCards, buildInfo);
    assert.equal(fetches, 0);
    assert.match(host.innerHTML, /data-focus-ticker="AAS"/);
    assert.match(host.innerHTML, /data-focus-ticker="ACG"/);
  } finally {
    global.document = previous.document;
    global.window = previous.window;
    global.fetch = previous.fetch;
  }
});

test("producer notable_cards fixture avoids the index and preserves the four cards", () => {
  const fixture = JSON.parse(fs.readFileSync(path.join(root, "tests/fixtures/home_notable_cards_v1.json"), "utf8"));
  const block = fixture.block;
  const withCards = summaryWithBlock(block);
  const fixtureBuildInfo = {
    market_session: fixture.session,
    investment_workspace: {
      status: "CURRENT",
      source_session: fixture.session,
      artifact_identity: fixture.workspace_artifact_identity,
    },
  };
  const indexForParity = {
    contract_version: "workspace_index/v1",
    as_of_session: fixture.session,
    source_artifact_identity: fixture.workspace_artifact_identity,
    cards: Object.fromEntries(block.cards.map((card) => [card.ticker, card])),
  };
  const fromIndex = overview.homeOpportunitiesHtml(indexForParity, fixture.session, presentation);
  const qualified = overview.qualifiedNotableCards(withCards, fixture.session, fixtureBuildInfo);
  const fromBlock = overview.publishedNotableHtml(qualified, presentation);
  assert.equal(fromBlock, fromIndex);
  assert.deepEqual(
    [...fromBlock.matchAll(/data-focus-ticker="([^"]+)"/g)].map((match) => match[1]),
    ["AAS", "ABW", "ACB", "ACG"],
  );
  assert.deepEqual(
    [...fromBlock.matchAll(/href="([^"]+)"/g)].map((match) => match[1]),
    ["AAS", "ABW", "ACB", "ACG"].map((ticker) => `investment-workspace.html?ticker=${ticker}`),
  );
  assert.equal(overview.homeOpportunityRequestPlan(withCards, fixtureBuildInfo).length, 0);
  assert.deepEqual(overview.buildInfoRequestPlan(fixtureBuildInfo), []);
  const fixtureBytes = Buffer.byteLength(JSON.stringify(withCards));
  assert.ok(fixtureBytes < 20000);
  assert.equal(block.cards.length, 4);
  const cases = {
    missing: summary,
    stale: summaryWithBlock({ ...block, as_of_session: "2000-01-01" }),
    invalid: summaryWithBlock({ ...block, contract_version: "other" }),
    identity: summaryWithBlock({ ...block, source_artifact_identity: "investment_decision_workspace_projection/v1:0" }),
  };
  for (const candidate of Object.values(cases)) {
    assert.equal(overview.qualifiedNotableCards(candidate, fixture.session, fixtureBuildInfo), null);
    assert.deepEqual(overview.homeOpportunityRequestPlan(candidate, fixtureBuildInfo), [overview.WORKSPACE_INDEX_URL]);
  }
  console.log(JSON.stringify({
    published_output_bytes: summaryBytes.length + indexBytes.length,
    fixture_summary_bytes: fixtureBytes,
    index_fetch_when_fixture_qualified: 0,
    index_fetch_when_fixture_rejected: 1,
    build_info_fetch_when_embedded: 0,
  }));
});

test("boot without a notable block fetches workspace_index.json once", async () => {
  const host = { innerHTML: "", textContent: "" };
  const previous = { document: global.document, window: global.window, fetch: global.fetch };
  const urls = [];
  global.window = { VSWorkspaceCardPresentation: presentation, BUILD_INFO: buildInfo };
  global.document = { getElementById: (id) => (id === "home-opportunities" ? host : null) };
  global.fetch = (url) => {
    urls.push(String(url));
    return Promise.resolve({ ok: true, json: () => Promise.resolve(index) });
  };
  try {
    overview.bootHomeOpportunities(buildInfo.market_session, summary, buildInfo);
    await new Promise((resolve) => setTimeout(resolve, 0));
    assert.deepEqual(urls, [overview.WORKSPACE_INDEX_URL]);
    assert.match(host.innerHTML, /data-focus-ticker="AAS"/);
  } finally {
    global.document = previous.document;
    global.window = previous.window;
    global.fetch = previous.fetch;
  }
});
