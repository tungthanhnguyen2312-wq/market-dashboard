# Repository guardrails

Codex is the executor. Dashboard presents Producer/Consumer contracts and must not infer source semantics or convert unknown/blocked states into readiness. Read canonical governance at `../stock-core-private/docs/` before work.

- Work only inside this repository unless the task explicitly names another workspace location.
- Use `STOCK_LOOKUP_RUNTIME_ROOT` for local integrations; do not hard-code or infer a runtime path.
- Keep GitHub-facing documentation portable and do not link to machine-specific operator documents.
- Do not edit generated reports, runtime data, backups, or deploy outputs unless explicitly requested.
