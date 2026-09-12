/* ============================================================
 * VNSTOCK — assets/js/session-coherence.js
 *
 * Shared, presentation-agnostic classifier for "does this artifact's own
 * embedded session/as_of_session match the Dashboard release session
 * (window.BUILD_INFO.market_session)?" — and a small honest-banner renderer
 * for when it does not.
 *
 * Why this exists: several active product surfaces (Screener, the Dashboard
 * home "Current Decision" summary, Investment Workspace, Signals) each read
 * their own artifact's own as_of_session/session field and printed it
 * verbatim, with no comparison against the release session at all. A frozen
 * artifact (never regenerated since its one-off introduction) then displays
 * its own old date with no indication that it is not the current session —
 * see docs/dashboard_current_session_surface_coherence_20260912.md.
 *
 * This module never invents a session, never upgrades STALE to CURRENT, and
 * never merges two disagreeing sessions into one label. It only classifies
 * and renders what is already true of the two dates it is given.
 *
 * Supports both browser (window.VSSessionCoherence) and Node test runner
 * (module.exports), matching this repo's existing shared-module convention
 * (see assets/js/value-format.js).
 * ============================================================ */

(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
  }
  if (root) {
    root.VSSessionCoherence = api;
  }
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  // The session-coherence contract vocabulary (docs/dashboard_current_session_surface_coherence_20260912.md).
  const STATUS = Object.freeze({
    EXACT_SESSION: "EXACT_SESSION",
    CADENCE_AWARE: "CADENCE_AWARE",
    STALE_EXPLICIT: "STALE_EXPLICIT",
    PARTIAL_EXPLICIT: "PARTIAL_EXPLICIT",
    UNAVAILABLE: "UNAVAILABLE",
    HISTORICAL: "HISTORICAL",
  });

  function esc(value) {
    return String(value ?? "").replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
    }[c]));
  }

  /** Read window.BUILD_INFO.market_session if a browser BUILD_INFO global is present; null otherwise.
   * Never throws — a missing/malformed BUILD_INFO is treated as "release session unknown", not an error. */
  function currentReleaseSession() {
    try {
      const info = typeof window !== "undefined" ? window.BUILD_INFO : null;
      const session = info && typeof info.market_session === "string" ? info.market_session : null;
      return session || null;
    } catch (err) {
      return null;
    }
  }

  /**
   * Classify one artifact's own session against the release session.
   *
   * `artifactSession` is the artifact's own embedded date (e.g. as_of_session, session).
   * `releaseSession` is the Dashboard release session (build_info.market_session); pass
   * explicitly, or omit to read it from window.BUILD_INFO when running in a browser.
   *
   * Never returns CURRENT/EXACT_SESSION unless both dates are present and equal — a
   * missing artifact session, or a missing release session to compare against, is
   * UNAVAILABLE, never silently treated as matching.
   */
  function classify(artifactSession, releaseSession) {
    const release = releaseSession === undefined ? currentReleaseSession() : (releaseSession || null);
    if (!artifactSession) {
      return { status: STATUS.UNAVAILABLE, artifactSession: null, releaseSession: release, isStale: false };
    }
    if (!release) {
      // No release session to compare against: report the artifact's own date honestly,
      // but never claim it is EXACT_SESSION when there is nothing to confirm that against.
      return { status: STATUS.UNAVAILABLE, artifactSession, releaseSession: null, isStale: false };
    }
    if (artifactSession === release) {
      return { status: STATUS.EXACT_SESSION, artifactSession, releaseSession: release, isStale: false };
    }
    return { status: STATUS.STALE_EXPLICIT, artifactSession, releaseSession: release, isStale: true };
  }

  /** True only for a confirmed mismatch (both dates present and different). Never true on
   * missing data — callers must not treat "cannot tell" the same as "confirmed stale". */
  function isConfirmedStale(result) {
    return Boolean(result && result.status === STATUS.STALE_EXPLICIT);
  }

  /**
   * A small, honest inline banner for "this component's own data is as of an older
   * session than the current Dashboard release" — component-level, never a claim about
   * the whole page. `label` names the component (e.g. "Screener", "Bàn quyết định").
   */
  function staleBannerHtml(label, result, reasonCode) {
    const artifactSession = (result && result.artifactSession) || "Chưa xác định";
    const releaseSession = (result && result.releaseSession) || "Chưa xác định";
    return (
      `<div class="vs-alert vs-alert-warning session-coherence-banner" data-session-status="STALE_EXPLICIT">` +
      `<b>${esc(label)}: dữ liệu chưa cập nhật cho phiên hiện tại.</b> ` +
      `Nguồn đến ngày <strong>${esc(artifactSession)}</strong>, phiên hệ thống hiện tại là ` +
      `<strong>${esc(releaseSession)}</strong>.` +
      `<details class="vs-tech-details mt-1"><summary>Chi tiết kỹ thuật</summary>` +
      `<div class="cockpit-code mt-1">${esc(reasonCode || "SESSION_MISMATCH")}</div></details>` +
      `</div>`
    );
  }

  /** One-line, non-banner label suitable for inline meta text: "phiên 2026-08-28 (CHƯA CẬP NHẬT — hệ thống 2026-09-11)". */
  function sessionLabelText(result) {
    if (!result) return "Chưa xác định";
    if (result.status === STATUS.EXACT_SESSION) return result.artifactSession;
    if (result.status === STATUS.STALE_EXPLICIT) {
      return `${result.artifactSession} (CHƯA CẬP NHẬT — hệ thống ${result.releaseSession})`;
    }
    return result.artifactSession || "Chưa xác định";
  }

  /**
   * Compare a JSON artifact payload against its own file:// JS-fallback payload for the same
   * logical projection (e.g. screener_master_projection.json vs .js). A JSON/JS pair is only
   * ever considered compatible when both are present and agree on identity/session; either one
   * missing, or the two disagreeing (a stale fallback silently sitting next to a refreshed
   * primary, or vice versa), is reported as incompatible — never a silent "use whichever loaded".
   */
  function classifyArtifactPair(jsonPayload, jsPayload) {
    if (!jsonPayload || !jsPayload) {
      return { compatible: false, reason: "ONE_OF_THE_PAIR_MISSING" };
    }
    const jsonSession = jsonPayload.as_of_session ?? jsonPayload.session ?? null;
    const jsSession = jsPayload.as_of_session ?? jsPayload.session ?? null;
    const jsonIdentity = jsonPayload.artifact_identity ?? null;
    const jsIdentity = jsPayload.artifact_identity ?? null;
    if (jsonIdentity && jsIdentity && jsonIdentity !== jsIdentity) {
      return { compatible: false, reason: "ARTIFACT_IDENTITY_MISMATCH", jsonIdentity, jsIdentity };
    }
    if (jsonSession !== jsSession) {
      return { compatible: false, reason: "SESSION_MISMATCH", jsonSession, jsSession };
    }
    return { compatible: true, reason: null };
  }

  return {
    STATUS,
    currentReleaseSession,
    classify,
    isConfirmedStale,
    staleBannerHtml,
    sessionLabelText,
    classifyArtifactPair,
  };
});
