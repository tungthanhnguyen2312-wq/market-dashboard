# Project Direction

> **HISTORICAL/SUPERSEDED.** This document predates the current data-source direction — it
> describes a provider-layer roadmap organized around `vnstock`/`kbs`/`vci` adapters with no
> mention of DNSE. The current, owner-authorized market-data direction is documented in the
> Producer repository's `docs/ROADMAP.md` and `docs/STATE.md` (`stock-core-private`, a sibling
> repository, not included in this checkout) — that is current authority, not this file. Preserved
> here as a historical record of earlier project positioning, not as current strategy.

## Positioning and boundary

Stock Look Up is not intended to become a public data library competing with vnstock. It is a personal intelligence system built on multiple data sources, focused on storing, normalizing, analyzing, and supporting investment decisions.

```text
Data providers
    ↓
Provider adapters
    ↓
Raw snapshots
    ↓
Canonical local database
    ↓
Validation and feature engine
    ↓
Screener / Quant / AI bundle
    ↓
Stock Look Up dashboard
```

## Keep and protect

- Keep the local data store, SQLite and Parquet, compact AI snapshots, and an offline pipeline.
- Keep the screener, market breadth, relative strength, technical analysis, separate BCTC branch, point-in-time checks, freshness gate, and data-quality flags.
- Default to dry-run; use a publisher whitelist; never use `git add .`; do not let AI publish automatically.
- Do not run multiple vnstock calls concurrently. Do not use Gemini in the pipeline.
- Python collects and computes data; ChatGPT, Codex, or Claude read prepared data and analyze it.

## Do not do

- Do not rebuild vnstock or copy its source code.
- Do not add every asset class merely because a provider supports it, or make the personal backend/database public.
- Do not let analysis code call a data-source API directly or depend directly on a vnstock DataFrame schema.
- Do not use present-day metadata for historical backtests; do not treat foreign room as foreign flow or a single candlestick pattern as a buy signal.
- Do not make a large refactor without tests, change a production schema only for appearance, or add a complex abstraction when one clear interface suffices.

## Provider-layer roadmap (not implemented by this task)

Create a provider layer so the rest of the pipeline does not import vnstock directly:

```text
src/providers/
  base.py
  vnstock_provider.py
  kbs_provider.py
  vci_provider.py
```

The planned interface supports `get_ohlcv`, `get_company_profile`, `get_officers`, `get_shareholders`, `get_subsidiaries`, `get_ownership`, `get_insider_transactions`, `get_corporate_events`, `get_financial_statements`, and `get_index_members`.

## Data priorities

1. **Corporate intelligence:** company profiles, corporate events, insider transactions, major-shareholder history, management, subsidiaries/associates, ownership structure, and capital-change history. Basic metadata, shareholders, and BCTC already have partial coverage; extend their coverage, history, and inclusion in AI bundles.
2. **Instruments and benchmarks:** `instrument_master`, market indices, index constituents, constituent-add/remove history, and dedicated benchmarks for relative strength and breadth.
3. **ETF and futures:** selected liquid ETFs and, where stable, holdings; VN30 futures with basis, volume, open interest, and expiry.

Covered warrants, open-end funds, bonds, crypto, and broad forex/commodity coverage are not current priorities.

## Financial statements (BCTC)

Do not replace the current BCTC pipeline with vnstock. vnstock is a fallback or cross-check only. All data must continue through canonical mapping and validation. Material differences between sources must be flagged, never silently resolved by choosing one value.

## AI workflow

```text
Python / vnstock collects and computes data
    ↓
Create a compact bundle with freshness and quality flags
    ↓
ChatGPT / Codex / Claude analyzes it
    ↓
Action scenarios and watchlist
```

The workflow should not require users to author a long analysis prompt themselves.

## Vnstock contract-test need

This documentation-only pass did not inspect tests, so the existence of a vnstock schema contract test is unverified. Before provider-layer work, add or confirm contract tests for each used function: required columns, data types, units, date ranges, symbol mapping, empty responses, rate-limit responses, schema changes, and successful HTTP responses that contain no data. Do not expand this into a large integration-test project as part of this roadmap.
