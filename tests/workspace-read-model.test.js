const test = require("node:test");
const assert = require("node:assert/strict");
const wrm = require("../assets/js/workspace-read-model.js");

test("shardKeyForTicker mirrors the Producer's first-letter bucketing, byte for byte", () => {
  assert.equal(wrm.shardKeyForTicker("HPG"), "H");
  assert.equal(wrm.shardKeyForTicker("a32"), "A");
  assert.equal(wrm.shardKeyForTicker("32A"), "_");
  assert.equal(wrm.shardKeyForTicker(""), "_");
  assert.equal(wrm.shardKeyForTicker(null), "_");
});

test("validateIndexContract accepts only the real workspace_index/v1 shape", () => {
  assert.equal(wrm.validateIndexContract({ contract_version: "workspace_index/v1", cards: { HPG: {} } }), true);
  assert.equal(wrm.validateIndexContract({ contract_version: "workspace_index/v1", cards: {} }), false);
  assert.equal(wrm.validateIndexContract({ contract_version: "investment_decision_workspace_projection/v1", cards: { HPG: {} } }), false);
  assert.equal(wrm.validateIndexContract(null), false);
});

function withMockFetch(handler, run) {
  const savedFetch = global.fetch;
  global.fetch = handler;
  return Promise.resolve().then(run).finally(() => { global.fetch = savedFetch; });
}

test("loadIndex resolves the validated document on a real contract shape", async () => {
  const doc = { contract_version: "workspace_index/v1", as_of_session: "2026-09-18", cards: { HPG: { ticker: "HPG" } } };
  await withMockFetch(
    (url) => {
      assert.equal(url, "data/workspace_index.json");
      return Promise.resolve({ ok: true, json: () => Promise.resolve(doc) });
    },
    async () => {
      const loaded = await wrm.loadIndex();
      assert.deepEqual(loaded, doc);
    },
  );
});

test("loadIndex rejects on a non-ok HTTP response", async () => {
  await withMockFetch(
    () => Promise.resolve({ ok: false, status: 404 }),
    async () => { await assert.rejects(wrm.loadIndex()); },
  );
});

test("getTickerDetail fetches the ticker's shard and returns its full card", async () => {
  wrm.clearShardCache();
  const indexDoc = {
    as_of_session: "2026-09-18", source_artifact_identity: "abc123",
    cards: { HPG: { detail_shard: "H" } },
  };
  const shard = {
    contract_version: "workspace_detail_shard/v1", as_of_session: "2026-09-18",
    source_artifact_identity: "abc123", tickers: { HPG: { ticker: "HPG", why: { deep: true } } },
  };
  await withMockFetch(
    (url) => {
      assert.equal(url, "data/workspace_detail/H.json");
      return Promise.resolve({ ok: true, json: () => Promise.resolve(shard) });
    },
    async () => {
      const result = await wrm.getTickerDetail("HPG", indexDoc);
      assert.equal(result.status, "ok");
      assert.deepEqual(result.card, { ticker: "HPG", why: { deep: true } });
    },
  );
});

test("getTickerDetail caches the shard across repeated calls for tickers in the same bucket", async () => {
  wrm.clearShardCache();
  let fetchCount = 0;
  const indexDoc = {
    as_of_session: "2026-09-18", source_artifact_identity: "abc123",
    cards: { HPG: { detail_shard: "H" }, HSG: { detail_shard: "H" } },
  };
  const shard = {
    contract_version: "workspace_detail_shard/v1", as_of_session: "2026-09-18",
    source_artifact_identity: "abc123", tickers: { HPG: { ticker: "HPG" }, HSG: { ticker: "HSG" } },
  };
  await withMockFetch(
    () => { fetchCount += 1; return Promise.resolve({ ok: true, json: () => Promise.resolve(shard) }); },
    async () => {
      await wrm.getTickerDetail("HPG", indexDoc);
      await wrm.getTickerDetail("HSG", indexDoc);
      assert.equal(fetchCount, 1, "second ticker in the same shard must not trigger a second fetch");
    },
  );
});

test("getTickerDetail resolves to an explicit unavailable state on network failure, never throws", async () => {
  wrm.clearShardCache();
  const indexDoc = { as_of_session: "2026-09-18", source_artifact_identity: "abc123", cards: { HPG: { detail_shard: "H" } } };
  await withMockFetch(
    () => Promise.reject(new Error("network down")),
    async () => {
      const result = await wrm.getTickerDetail("HPG", indexDoc);
      assert.equal(result.status, "unavailable");
      assert.equal(result.reason, "SHARD_FETCH_FAILED");
    },
  );
});

test("getTickerDetail flags a session mismatch between the index and a stale-cached shard", async () => {
  wrm.clearShardCache();
  const indexDoc = { as_of_session: "2026-09-19", source_artifact_identity: "newer", cards: { HPG: { detail_shard: "H" } } };
  const staleShard = {
    contract_version: "workspace_detail_shard/v1", as_of_session: "2026-09-18",
    source_artifact_identity: "older", tickers: { HPG: { ticker: "HPG" } },
  };
  await withMockFetch(
    () => Promise.resolve({ ok: true, json: () => Promise.resolve(staleShard) }),
    async () => {
      const result = await wrm.getTickerDetail("HPG", indexDoc);
      assert.equal(result.status, "unavailable");
      assert.equal(result.reason, "SHARD_SESSION_MISMATCH");
    },
  );
});

test("getTickerDetail returns not_found for a ticker absent from its own shard", async () => {
  wrm.clearShardCache();
  const indexDoc = { as_of_session: "2026-09-18", source_artifact_identity: "abc123", cards: { ZZZ: { detail_shard: "Z" } } };
  const shard = {
    contract_version: "workspace_detail_shard/v1", as_of_session: "2026-09-18",
    source_artifact_identity: "abc123", tickers: {},
  };
  await withMockFetch(
    () => Promise.resolve({ ok: true, json: () => Promise.resolve(shard) }),
    async () => {
      const result = await wrm.getTickerDetail("ZZZ", indexDoc);
      assert.equal(result.status, "not_found");
    },
  );
});
