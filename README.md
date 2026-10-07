# Stock Look Up dashboard

This repository is the GitHub-facing dashboard and its publishable assets. It does not contain the producer pipeline, runtime database, backups, or private AI artifacts.

## Current product surfaces

Investor navigation: **Tổng quan | Cơ hội | Danh mục | Vĩ mô | Lịch sử**.
Cơ hội keeps the compatible `investment-workspace.html` route. Discovery, analysis,
technical evidence and watchlist are internal views; older URLs still redirect.
The Vietnamese presentation and progressive-disclosure contract is documented in
[docs/INVESTOR_FIRST_UX_V1.md](docs/INVESTOR_FIRST_UX_V1.md).

The current research surface is `data/investment_decision_workspace.json`, a serialized
Producer-owned Workspace projection. Home, Analysis, Tactical Signals, Screener links,
Workspace detail, and Portfolio use it as descriptive research context. The Dashboard does not
calculate a score, ranking, target price, probability, sizing, or execution command. Legacy
candlestick and sector assets remain optional secondary sidecars; publication authority remains
in the private Producer repository.

## Repository boundary

- Keep dashboard source, static assets, and reusable developer documentation in this repository.
- Keep machine-specific procedures, runtime data, generated local reports, and backups outside the repository.
- A local integration uses `STOCK_LOOKUP_RUNTIME_ROOT` supplied by the operator or deployment configuration. Do not assume that a runtime is adjacent to this checkout.

## Local preview

Run from the repository root:

```powershell
Set-Location <dashboard-repository>
python -m http.server 8017
```

Then open `http://localhost:8017/dashboard.html`.

## Documentation

- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) describes the dashboard boundary and data flow.
- [docs/USER_GUIDE.md](docs/USER_GUIDE.md) and [docs/CLI_REFERENCE.md](docs/CLI_REFERENCE.md) are developer-facing references.
- Historical audits in `docs/` are retained as point-in-time evidence; they are not current operating instructions.

For contribution and security information, see [CONTRIBUTING.md](CONTRIBUTING.md) and [SECURITY.md](SECURITY.md).
