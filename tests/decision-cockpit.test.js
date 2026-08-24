const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const root = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(root, "decision-cockpit.html"), "utf8");
const script = fs.readFileSync(path.join(root, "assets", "js", "decision-cockpit.js"), "utf8");

test("cockpit declares every human-review surface and local projection source", () => {
  for (const label of ["Market overview", "Research discovery", "Watchlist", "Ticker research detail", "Portfolio risk", "Lineage / evidence"]) {
    assert.match(html, new RegExp(label));
  }
  assert.match(script, /local-data\/current_decision_cockpit\.json/);
  for (const label of ["Strategy fit", "Peer context", "Fundamentals", "Valuation", "Market flow", "Corporate intelligence", "Bear \/ Base \/ Bull", "Macro", "Thesis \/ counter-thesis"]) {
    assert.match(script, new RegExp(label));
  }
});

test("cockpit retains the no-execution boundary and explicit missingness", () => {
  assert.match(html, /Human-review research only/);
  assert.match(script, /UNAVAILABLE/);
  assert.doesNotMatch(html + script, /execute trade|place order|sell order/i);
});
