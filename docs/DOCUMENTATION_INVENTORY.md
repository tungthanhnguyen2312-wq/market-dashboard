# Documentation inventory

Scope: this inventory covers Markdown files in `docs/` only, based on the current documents and their Markdown cross-links. It does not inspect code, tests, data, or Git history. `ARCHIVE` means retain as evidence/history; it does not authorize deletion.

| File | Classification | Current role and unique content to preserve | Overlap / action | Referenced by |
|---|---|---|---|---|
| `advanced_financial_metrics.md` | KEEP | Advanced metrics, formulas, safety rules, and snapshot-v2 notes. | Related to financial mapping; keep the formula-level detail separate. | No doc cross-link observed. |
| `ARCHITECTURE.md` | KEEP | Primary architecture, data flow, local/public boundary, and UI conventions. | Some operational context overlaps `DATA_PIPELINE.md`; it remains the architecture source of truth. | `CLI_REFERENCE.md`, `DATA_PIPELINE.md`, `FINANCIAL_REPORT.md`, `REPO_AUDIT.md`, `STOCK_ANALYZER.md`, `USER_GUIDE.md`. |
| `AUDIT_REPORT.md` | ARCHIVE | vnstock v4.0.4 probe results and financial-report audit evidence. | Historical audit, not an operating guide; retain as evidence. | No doc cross-link observed. |
| `CLI_REFERENCE.md` | KEEP | Command cheatsheet and daily/weekly/monthly/quarterly operating order. | Overlaps beginner setup in `USER_GUIDE.md`; retain as the detailed command reference. | `ARCHITECTURE.md`, `DATA_PIPELINE.md`, `STOCK_ANALYZER.md`, `USER_GUIDE.md`. |
| `data_dictionary.md` | KEEP | Financial-snapshot field definitions. | Candidate input for a future `DATA_MODEL.md`; no safe merge in this pass. | No doc cross-link observed. |
| `DATA_PIPELINE.md` | KEEP | Pipeline use, AI handoff, data and operational pitfalls. | Overlaps command sequencing in `CLI_REFERENCE.md`; retain its data-risk guidance. | `ARCHITECTURE.md`, `CLI_REFERENCE.md`, `FINANCIAL_REPORT.md`, `STOCK_ANALYZER.md`, `USER_GUIDE.md`. |
| `DOCUMENTATION_INVENTORY.md` | KEEP | Controlled catalog and disposition of this documentation set. | New source of truth for documentation hygiene; no merge. | `README.md`. |
| `FINAL_RELEASE_AUDIT.md` | ARCHIVE | Release-readiness findings and remediation evidence. | Historical audit; retain rather than merge with other audits. | No doc cross-link observed. |
| `financial_mapping.md` | KEEP | Mapping registry, entity profiles, derivation boundary, and phase-9 contract. | Related to metrics and cash-flow policy; its registry role is distinct. | No doc cross-link observed. |
| `FINANCIAL_REPORT.md` | KEEP | BCTC branch commands, normalization, formulas, and BCTC-specific data traps. | Related to `DATA_PIPELINE.md`; retain the specialized financial-statement runbook. | `ARCHITECTURE.md`, `CLI_REFERENCE.md`, `DATA_PIPELINE.md`, `USER_GUIDE.md`. |
| `migration_missing_data_v2.md` | ARCHIVE | Missing-data schema-v2 migration, rollback, verified example, and consumer audit. | Related to `missing_data_contract.md`; preserve migration evidence separately. | No doc cross-link observed. |
| `missing_data_contract.md` | KEEP | Concise missing-data schema-v2 contract. | Companion to the migration record, not a duplicate. | No doc cross-link observed. |
| `news_ticker_mapping.md` | KEEP | Canonical ticker aliases, pipeline behavior, diagnostics, and compatibility. | No material duplicate identified. | No doc cross-link observed. |
| `operating_cash_flow.md` | KEEP | Operating-cash-flow period policy, units, comparability rules, and PAN result. | Related to financial mapping; preserve as policy-level detail. | `financial_mapping.md`. |
| `PROJECT_COMPLETION.md` | ARCHIVE | Completion evidence, dry-run evidence, and closeout-state instructions. | Historical status record; retain instead of merging into an operating guide. | No doc cross-link observed. |
| `PROJECT_DIRECTION.md` | KEEP | Product boundaries, preserved practices, roadmap, priorities, and provider-contract-test need. | New long-term direction source of truth; no merge. | `README.md`. |
| `PROJECT_HEALTH_AUDIT.md` | ARCHIVE | Point-in-time project health assessment and findings. | Historical audit; retain as evidence. | No doc cross-link observed. |
| `regression_testing.md` | KEEP | Regression fixtures, suite execution, thresholds, and phase-9 tests. | No material duplicate identified. | No doc cross-link observed. |
| `RELEASE_CHECKLIST.md` | KEEP | Release and deployment readiness checklist. | Related to release audits but operationally distinct. | `REPO_AUDIT.md`. |
| `REPO_AUDIT.md` | ARCHIVE | Repository release-preparation audit findings. | Historical audit; retain as evidence. | No doc cross-link observed. |
| `shareholder_data_pipeline.md` | KEEP | Shareholder source chain, normalization, conflict rules, freshness, and storage compatibility. | No material duplicate identified. | No doc cross-link observed. |
| `source_schema_guards.md` | KEEP | Source schema guard policy for financial statements and registries. | Related to mapping documents but distinct validation controls. | No doc cross-link observed. |
| `STOCK_ANALYZER.md` | KEEP | Offline analyzer modes, 0–100 scoring, safety guards, and indicator library. | Candidate input for future `ANALYSIS_ENGINE.md`; no safe merge in this pass. | `ARCHITECTURE.md`, `CLI_REFERENCE.md`, `DATA_PIPELINE.md`. |
| `THIRD_PARTY_AND_LICENSE.md` | KEEP | Product independence, MIT scope, third-party software/data attribution, and commercialization boundary. | New source of truth for attribution; no merge. | `README.md`. |
| `USER_GUIDE.md` | KEEP | Windows quick start, common PowerShell errors, cross-platform notes, and AI-report glossary. | Shares setup material with `CLI_REFERENCE.md`; retain the beginner-focused guidance. | No doc cross-link observed. |
| `VALIDATION_REPORT.md` | ARCHIVE | Item-mapping, formula, and representative validation evidence. | Historical validation evidence; do not merge into a living guide. | No doc cross-link observed. |
| `WIP_BRANCH_REVIEW.md` | ARCHIVE | WIP-branch change review and evidence. | Historical review; retain as evidence. | No doc cross-link observed. |

## Consolidation decision

No document group was merged. The likely overlaps have distinct operational, policy, or historical evidence that should not be lost without inspecting their consumers beyond this documentation-only scope.

## Deletion candidates

None. No `DELETE_CANDIDATE` is safe on the available evidence. The files classified `ARCHIVE` should be moved only after a separately scoped link/consumer check.
