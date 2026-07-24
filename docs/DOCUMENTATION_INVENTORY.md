# Dashboard documentation index

This index covers the Markdown documentation that remains in this GitHub-facing repository. It excludes local runtime reports and internal audit/qualification evidence, which are retained outside the repository.

| Area | Purpose | Audience | Classification | Action |
| --- | --- | --- | --- | --- |
| `README.md` | Dashboard boundary and local preview | Contributors | Repo-facing | Keep current. |
| `docs/ARCHITECTURE.md` | Architecture and data-flow contract | Developers | Repo-facing | Keep current. |
| `docs/CLI_REFERENCE.md` | Portable command reference | Developers | Repo-facing | Keep current; use repository placeholders rather than workstation paths. |
| `docs/USER_GUIDE.md` | User/developer guide | Users and developers | Repo-facing | Keep current. |
| `docs/DATA_PIPELINE.md`, `docs/FINANCIAL_REPORT.md` | Data and financial-domain contracts | Developers | Repo-facing | Keep current; internal validation evidence is external. |
| `docs/advanced_financial_metrics.md`, `docs/data_dictionary.md`, `docs/financial_mapping.md`, `docs/missing_data_contract.md`, `docs/news_ticker_mapping.md`, `docs/operating_cash_flow.md`, `docs/shareholder_data_pipeline.md`, `docs/source_schema_guards.md` | Domain contracts and references | Developers | Repo-facing | Keep current. |
| `docs/regression_testing.md`, `docs/RELEASE_CHECKLIST.md`, `docs/STOCK_ANALYZER.md`, `docs/THIRD_PARTY_AND_LICENSE.md`, `docs/PROJECT_DIRECTION.md` | Quality, release, product, and licensing guidance | Contributors | Repo-facing | Keep current. |
| `docs/migration_missing_data_v2.md` | Historical schema contract | Developers | Repo-facing historical contract | Retain without re-investigating migration. |
| `docs/AUDIT_REPORT.md`, `docs/VALIDATION_REPORT.md` | Point-in-time internal evidence | Operators | Evidence outside repository | Retained under `operations-review/evidence/dashboard-runtime/`; these files are not tracked in this repository. |
| `docs/FINAL_RELEASE_AUDIT.md`, `docs/PROJECT_COMPLETION.md`, `docs/PROJECT_HEALTH_AUDIT.md`, `docs/REPO_AUDIT.md`, `docs/WIP_BRANCH_REVIEW.md` | Historical repository evidence | Operators | Tracked historical documentation | Verified copies are retained under `operations-review/evidence/dashboard-runtime/`; the tracked files remain in this repository pending a separate removal decision. |
| Root `*_latest.md`, dated AI reports, `Focus_Analysis.md`, `Market_Scan.md`, and `watchlist_eval_latest.md` | Generated runtime reports | Local operator | Local generated artifact | Leave untouched in runtime; do not treat as repository documentation. |
| Root `NOTES_FOR_TUNG*.md` | Local operator notes | Local operator | Local operator documentation | Moved to `operations-review/evidence/dashboard-runtime/` unchanged. |

Historical evidence is intentionally not linked from this repository because that evidence is not part of a portable checkout.
