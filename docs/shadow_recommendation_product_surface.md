# Shadow Recommendation Product Surface V1

The dashboard consumes `shadow_recommendation_product_surface/v1`, a compact serialized projection of Producer `shadow_security_recommendation/v1` records. It is a read-only research surface: the dashboard preserves the canonical stance, readiness, session, boundaries, warnings, and lineage; it does not recompute or rank recommendations.

The view deliberately has no BUY/SELL/HOLD or order controls, target/probability output, portfolio allocation, or position-sizing controls. `AVOID_NEW_ENTRY` is displayed as “Avoid new entry”, never as a sell instruction. `HIGH_RISK_SPECULATION_ONLY` remains a warning-only research category. `UNKNOWN` triggers remain visibly distinct from `NOT_TRIGGERED`.

Recommendation packets are optional for existing dashboard pages. The research-stance page reports an explicit unavailable or unsupported-contract state without synthesizing a replacement. Consumer narratives are also optional: only a matching, validated serialized Consumer narrative is rendered as validated; matching deterministic fallback content may render as fallback. The current product projection reports `NO_NARRATIVE_AVAILABLE` because no Consumer narrative transport is yet published. Session or Producer-identity disagreement is displayed as `SESSION_MISMATCH` or `NARRATIVE_STALE_FOR_CURRENT_RECOMMENDATION` and is not combined.
