"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const signalsSource = fs.readFileSync(path.join(root, "assets", "js", "signals-product.js"), "utf8");
const patterns = fs.readFileSync(path.join(root, "assets", "js", "candlestick-patterns.js"), "utf8");

test("Signals UI exposes unavailable exact-session evidence instead of silently rendering it", () => {
  assert.match(signalsSource, /classifySidecarAvailability/);
  assert.match(signalsSource, /OPTIONAL_CANDLE_SIGNAL_SIDECAR_UNAVAILABLE|SIGNAL_SOURCE_SESSION_MISMATCH/);
  assert.match(signalsSource, /Chưa có dữ liệu mẫu hình nến phù hợp cho phiên hiện tại/);
});

test("Candlestick fallback is guarded by the published component state", () => {
  assert.match(patterns, /components\.candlestick_patterns/);
  assert.match(patterns, /component\.status !== "CURRENT" && component\.status !== "STALE"/);
});
