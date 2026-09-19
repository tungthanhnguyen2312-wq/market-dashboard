(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.VSWorkspaceReadModel = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  // DASHBOARD_PAYLOAD_COMPACTION_AND_INVESTOR_FIRST_IA_V1: the public Workspace payload is a
  // two-layer read model -- a small index (list/filter/search fields for every ticker) plus
  // deterministic per-shard detail files (the full per-ticker card, fetched lazily, one shard
  // per ticker's first letter -- see stock-core-private/workspace_public_read_model.py, which
  // this module's shard-key derivation must stay byte-for-byte in sync with).
  const INDEX_URL = "data/workspace_index.json";
  const DETAIL_DIR = "data/workspace_detail";
  const INDEX_CONTRACT_VERSION = "workspace_index/v1";
  const SHARD_CONTRACT_VERSION = "workspace_detail_shard/v1";

  function shardKeyForTicker(ticker) {
    const first = String(ticker || "").slice(0, 1).toUpperCase();
    return first >= "A" && first <= "Z" ? first : "_";
  }

  function validateIndexContract(doc) {
    return Boolean(
      doc && doc.contract_version === INDEX_CONTRACT_VERSION &&
      doc.cards && typeof doc.cards === "object" && !Array.isArray(doc.cards) &&
      Object.keys(doc.cards).length
    );
  }

  function fetchJson(url) {
    return fetch(url, { cache: "no-store" }).then((res) => {
      if (!res.ok) throw new Error(`HTTP_${res.status}`);
      return res.json();
    });
  }

  // One shared in-flight/settled promise per shard key -- concurrent or repeated drawer opens
  // for tickers in the same shard never trigger a second network fetch.
  const shardCache = new Map();

  function loadShard(shardKey) {
    if (!shardCache.has(shardKey)) {
      shardCache.set(shardKey, fetchJson(`${DETAIL_DIR}/${shardKey}.json`));
    }
    return shardCache.get(shardKey);
  }

  function loadIndex() {
    return fetchJson(INDEX_URL).then((doc) => {
      if (!validateIndexContract(doc)) throw new Error("WORKSPACE_INDEX_CONTRACT_INVALID");
      return doc;
    });
  }

  // Never throws -- every failure mode (network error, unknown ticker, session/identity drift
  // between the index already on screen and a shard fetched later) resolves to an explicit
  // { status: "unavailable", reason } the caller renders as "Tạm chưa có dữ liệu chi tiết"
  // (PHASE 5/10), never a raw HTTP/path error.
  function getTickerDetail(ticker, indexDoc) {
    const normalizedTicker = String(ticker || "").trim().toUpperCase();
    const thin = (indexDoc && indexDoc.cards) ? indexDoc.cards[normalizedTicker] : null;
    const shardKey = (thin && thin.detail_shard) || shardKeyForTicker(normalizedTicker);
    return loadShard(shardKey).then((shard) => {
      if (!shard || shard.contract_version !== SHARD_CONTRACT_VERSION) {
        return { status: "unavailable", reason: "SHARD_CONTRACT_INVALID" };
      }
      if (indexDoc) {
        if (shard.as_of_session !== indexDoc.as_of_session) {
          return { status: "unavailable", reason: "SHARD_SESSION_MISMATCH" };
        }
        if (shard.source_artifact_identity !== indexDoc.source_artifact_identity) {
          return { status: "unavailable", reason: "SHARD_IDENTITY_MISMATCH" };
        }
      }
      const card = (shard.tickers || {})[normalizedTicker];
      if (!card) return { status: "not_found" };
      return { status: "ok", card };
    }).catch(() => ({ status: "unavailable", reason: "SHARD_FETCH_FAILED" }));
  }

  function clearShardCache() {
    shardCache.clear();
  }

  return {
    INDEX_URL, DETAIL_DIR, INDEX_CONTRACT_VERSION, SHARD_CONTRACT_VERSION,
    shardKeyForTicker, validateIndexContract, loadIndex, getTickerDetail, clearShardCache,
  };
});
