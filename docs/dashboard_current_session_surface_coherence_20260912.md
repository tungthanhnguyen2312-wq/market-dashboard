# Dashboard current-session surface coherence — 2026-09-12 investigation

## Symptom

The published Dashboard's `data/build_info.json` claims release session `2026-09-11`, but
the Screener page, the Dashboard-home "Current Decision" summary, and Investment Workspace
all displayed `2026-08-28`, while the Signals page's candlestick-pattern components are
explicitly declared stale at `2026-08-25`.

## Root cause

`data/screener_master_projection.json` (+ `.js` fallback) and
`data/investment_decision_workspace.json` are **one-off product-integration artifacts**,
each materialized exactly once by a hand-run Producer tool and never regenerated since:

| Artifact | Committed | Producer tool | `as_of_session` |
| --- | --- | --- | --- |
| `screener_master_projection.json/.js` | `ed39e9f` (2026-09-01) | `stock-core-private/tools/run_screener_master_projection.py` | `2026-08-28` |
| `investment_decision_workspace.json` | `1ffd876`/`0aea310` (2026-08-31) | `stock-core-private/tools/run_investment_decision_workspace_projection.py` | `2026-08-28` |

Both Producer tools are throwaway materializers, not a recurring pipeline step: they default
`--requested-at`/`DECISION_SESSION` to their original 2026-08-2x/09-01 dates and resolve
their inputs by searching a fixed list of specific, dated `operations-review/...-2026083x`
directories — there is no current-session-parameterized entry point. Neither tool is called
anywhere in `canonical_daily_operation.py`, `daily_producer_pipeline.py`, or
`dashboard_release_publisher.py` (confirmed by exhaustive grep of the Producer repository).

The **recurring** canonical Dashboard release (`dashboard_release_publisher.py`, run daily)
has no knowledge of either artifact at all — it only synchronizes `screen_snapshot*.csv`,
`market_breadth.csv`, `analysis_*`, the three signal-sidecar pairs
(`candle_signals`/`sector_heatmap`/`candlestick_patterns`), `macro_snapshot`, and
`current_decision_cockpit.json`. Its `domains.screening` entry is **hardcoded**
(`dashboard_release_publisher.py` line ~460: `{"status": "CURRENT", "source_session":
session, ...}`) with no reference to `screener_master_projection` at all — so
`build_info.json` has claimed `screening=CURRENT/<today>` every single day since 2026-09-01,
regardless of what `screener_master_projection.json` actually contains. `data/build_info.json`
also never lists `screener_master_projection.json/.js` or `investment_decision_workspace.json`
in its `files` manifest, so nothing hashes or binds them to a release at all.

Downstream, three UI code paths read these frozen artifacts' own `as_of_session` field and
printed it verbatim with **no comparison** against `build_info.market_session`:
`screener.html`'s `#meta` line, `dashboard-product-summary.js`'s
`renderDecisionSummaryHtml()` (the Dashboard-home "Current Decision" widget — it reads
`screener_master_projection.json` too, via the same `SCREENER_URL`), and
`investment-workspace.js`'s `#session-line`. `signals-product.js`'s tactical table reads the
same frozen `investment_decision_workspace.json` but already used softer "retained" language
("được giữ lại") rather than claiming currency — improved here to an explicit stale banner
for consistency with the other three.

The Signals page's **candlestick-pattern sidecars** (`candle_signals`/`sector_heatmap`/
`candlestick_patterns`) are a different, already-correct mechanism:
`dashboard_release_publisher.py::_signal_component_state` genuinely checks each sidecar's own
`scan_date` against the release session, truthfully records `STALE`/`2026-08-25` in
`build_info.json`, and *removes* the stale JSON/JS pair rather than serving it (a design
choice that trades "retain and label" for "fail closed" — worth revisiting upstream, not
changed here since it lives in the read-only Producer repo). `signals-product.js` already
checks `build_info.domains.signals.components` and the file's own presence before rendering,
and shows a graceful "unavailable" message — no fabrication was found there.

`data/current_decision_cockpit.json` (Decision Cockpit) and `data/macro_snapshot.json`
(Macro) were both found to be genuinely correct: cockpit is copied only when
`cockpit.session == session` (hard release-session gate in
`dashboard_release_publisher.py`), and already carries honest per-input-artifact
`freshness_state`/`session` sub-fields plus a `warnings` array documenting exactly which
components are retained/undated (e.g. catalyst, fundamental) — no fix was needed on either
surface. `data/shadow_recommendation_product_surface.json` is identity-pinned to specific
Producer/Consumer commits rather than session-dated, and its UI already labels every record
with its own `as_of_session` with no claim of "today" — also no fix needed.

**Process gap found in addition to the data gap:** `tests/real-data-contract-correctness.test.js`
already contained a session-coherence assertion (test "M") that has been failing against the
live committed data for as long as the two artifacts have been frozen — but neither that file
nor `tests/domain-freshness.test.js` was ever added to `.github/workflows/dashboard-ci.yml`,
so Dashboard CI never actually ran them and stayed green throughout.

## Why this was not "fixed" by regenerating the two artifacts

Producer (`stock-core-private`) is read-only authority for this milestone. Materializing a
genuinely current `screener_master_projection.json`/`investment_decision_workspace.json` for
`2026-09-11` would require identifying and threading through several current-session upstream
artifacts (`opportunity_context/v1`, `security_decision_context/v1`, `financial_analysis_
product_integration`, `current_official_market_universe`, sector-leadership context, etc.)
that neither existing tool resolves for an arbitrary session today — both hardcode dated
search paths from their original one-off run. Assembling a correct join over these contracts
from first principles is new Producer-side engineering, not a Dashboard fix, and guessing at
it risks exactly the kind of fabricated/incorrect "current" artifact this investigation exists
to prevent.

**Disposition: `UPSTREAM_CURRENT_ARTIFACT_UNAVAILABLE`** for both `screener_master_projection`
and `investment_decision_workspace` as a *recurring, current-session* capability. The fix
applied here is the Dashboard-side safety net: never again display either artifact's date as
if it were current without an explicit, honest comparison against the release session.

## What changed (Dashboard-only)

- New `assets/js/session-coherence.js`: a small shared classifier
  (`EXACT_SESSION`/`STALE_EXPLICIT`/`UNAVAILABLE` today; `CADENCE_AWARE`/`PARTIAL_EXPLICIT`/
  `HISTORICAL` reserved for the macro/shadow-recommendation patterns that already implement
  their own honest version of the same idea) plus `classifyArtifactPair()` for JSON/JS
  fallback-pair compatibility. Never invents a session, never upgrades a mismatch to
  "current", never merges two disagreeing dates into one label.
- Wired into `screener.html`, `assets/js/dashboard-product-summary.js`,
  `assets/js/investment-workspace.js`, and `assets/js/signals-product.js`: each now renders
  an explicit stale banner (`data-session-status="STALE_EXPLICIT"`, naming the component, both
  dates, and a reason code) whenever the artifact it reads disagrees with
  `build_info.market_session`, instead of printing the artifact's own date as if it were the
  page's session.
- `tests/real-data-contract-correctness.test.js` test "M" rewritten: it no longer asserts the
  two real artifacts must share a session (an assumption already false in the committed data);
  it asserts that whatever the real relationship is, it is classified honestly.
- New `tests/session-coherence-contract.test.js`: unit coverage for the classifier, JSON/JS
  pair-compatibility coverage (including a real check of the committed
  `screener_master_projection.json`/`.js` pair), and wiring assertions that each of the four
  surfaces above actually calls the classifier rather than only defining it.
- `tests/real-data-contract-correctness.test.js`, `tests/domain-freshness.test.js`, and
  `tests/session-coherence-contract.test.js` added to `.github/workflows/dashboard-ci.yml`'s
  `Validate` job.

## What did not change

No Producer file was read-write touched. No artifact's embedded `as_of_session` was edited,
deleted, or backdated. `data/build_info.json`'s `domains.screening=CURRENT` claim was left as
Producer produces it (rewriting it here would be silently overwritten by the next real
Producer-driven publish anyway); the fix instead makes every consuming surface independently
verify the artifact it actually renders, which survives future publishes regardless of what
`build_info.json` claims.
