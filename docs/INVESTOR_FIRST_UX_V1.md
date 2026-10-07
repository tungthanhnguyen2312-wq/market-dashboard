# Investor-first UX V1

Milestone: INVESTOR_FIRST_DASHBOARD_UX_AND_LANGUAGE_CONVERGENCE_V1.
Authority: NONE / INVESTOR_FACING_PRESENTATION_ONLY.

## Information architecture

Primary navigation, in desktop and mobile order: Tổng quan (`dashboard.html`),
Cơ hội (`investment-workspace.html`), Danh mục (`portfolio.html`), Vĩ mô
(`macro.html`), Lịch sử (`archive.html`). Giới thiệu is a secondary methods link.
Static navigation remains usable without JavaScript. Compatibility routes retain
query parameters, ticker and hash: screener → explore; signals → technical;
analysis → explore (the existing analysis alias); decision-cockpit → workspace.

Dashboard answers four questions: market breadth this session; sector context;
stocks worth investigating; principal risks. Sector population counts describe
coverage, never leadership/performance. Notable stocks use the workspace's existing
bounded focus selection in published order, never a new score or ranking.
The full action distribution and coverage definitions live in collapsed methods.
Legacy screener, AI report, action plans and archive promotion leave Home; their
published data, compatibility routes and historical reports remain available.

Cơ hội: compact session and ticker selector; Nổi bật, Khám phá, Kỹ thuật,
Theo dõi, Danh mục (existing context view). Khám phá contains the existing
multi-axis analysis; the analysis URL alias stays valid. One ticker drawer presents
posture, evidence currency, rationale, confirmation, invalidation and uncertainties.
Source identities and system diagnostics belong in Dữ liệu & phương pháp.

## Language: VIETNAMESE_INVESTOR_FIRST

Translate complete investor sentences, including titles, tooltips, accessible labels,
empty states and errors. Retain standard financial abbreviations (P/E, ROE, RSI,
MACD, ATR, MA20 etc.), Stock Lookup and proper names. Explain SMC at first use.
Never rename canonical enums, schemas, storage keys or calculations for wording.
Unknown states show a Vietnamese uncertainty label with raw value in a data attribute
or advanced technical detail. Missing and old data remain visible.

Terminology classification:
- INVESTOR_REQUIRED: session, missingness, age, conditional action, risk, standard acronyms.
- TOOLTIP_ONLY: financial abbreviation definitions and concise eligibility limits.
- METHODS_ONLY: reference vs official scope, liquidity proxy vs execution eligibility,
  PIT/history, share basis, source identity, conflicts, per-axis freshness.
- DEVELOPER_ONLY: contracts, schemas, loader names, storage APIs, file paths, error codes.
- REMOVE: redundant workspace CTAs, build-reading badge, compatibility labels on Home.

## Acceptance and release

Use unchanged published 2026-10-06 data. Verify 375/768/1024/1440 HTTP previews,
drawer keyboard/focus, five nav destinations, compatibility links and empty/stale
states. Assert generated data and canonical selection/calculation code unchanged.
Run JS and relevant Python CI contracts, review exact diff, release through PR/CI.
Recheck processes and remote publication before write/release boundaries; stop
writing if Owner Daily begins. Do not publish or edit any Daily dataset.

## Acceptance evidence — 2026-10-07

Local HTTP preview with the published 2026-10-06 dataset: Dashboard full page,
Cơ hội default, Khám phá, Kỹ thuật, selected HPG drawer, Danh mục, Vĩ mô and
About inspected at 375, 768, 1024 and 1440 pixels (32 page/width combinations).
No document horizontal overflow or JavaScript page errors. Mobile menu parity,
drawer Escape/focus restoration and keyboard tab switching verified in Chromium.
The main mobile list retains action, trigger, invalidation and uncertainty as cards.
Advanced tables remain deeper disclosure/detail surfaces.
The mobile research table keeps a readable minimum width and scrolls inside its
own container; the primary opportunity cards do not require horizontal scrolling.

Language audit over eleven current/compatibility HTML sources: 52 occurrences of
the former product name removed; both occurrences each of Stored only in this
browser, Add position, Export JSON, Import JSON and Clear/reset removed. Home
also removes build-reading, compatibility-screener, Watchlist and Regime labels.
These source counts include attributes/comments and are not a rendered-word count.
Remaining `snapshot` source matches are DOM identifiers, not visible prose.
Primary rendered/source terminology assertions have explicit collapsed-methods
exceptions. Standard market acronyms and proper provider/index names remain.

Semantic comparison covers all 1,683 published cards: canonical analysis fields
and prospective export values match the authorized baseline; only the per-call
export timestamp is excluded. Notable membership/order exactly matches the old
focus lanes. Generated data, reports and canonical read-model files are unchanged.

The source release adds `ui=investor-first-v1` to live-page asset URLs while keeping
the Daily `v` token intact, so browsers can refresh presentation without a new
dataset. A later normal publication can restamp its own version tokens.
