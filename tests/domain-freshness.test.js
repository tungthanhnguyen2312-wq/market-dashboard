"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const signals = fs.readFileSync(path.join(root, "signals.html"), "utf8");
const patterns = fs.readFileSync(path.join(root, "assets", "js", "candlestick-patterns.js"), "utf8");

test("Signals UI exposes unavailable exact-session evidence instead of silently rendering it", () => {
  assert.match(signals, /Chưa có tín hiệu exact-session/);
  assert.match(signals, /domain\.status !== "CURRENT"/);
  assert.match(signals, /Dữ liệu gần nhất/);
});

test("Candlestick fallback is guarded by the published component state", () => {
  assert.match(patterns, /components\.candlestick_patterns/);
  assert.match(patterns, /component\.status !== "CURRENT" && component\.status !== "STALE"/);
});
