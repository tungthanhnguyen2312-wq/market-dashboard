/* ============================================================
 * VNSTOCK — assets/js/company-panel.js (dùng ở screener.html + signals.html)
 * Bấm vào dòng #tblScreen hoặc gọi VSCompanyPanel.open(row) -> mở panel trượt từ phải,
 * 3 tab: Tổng quan / Biểu đồ / Báo cáo tài chính.
 *
 * Lấy dữ liệu trực tiếp từ instance DataTables ĐANG CHẠY
 * (jQuery("#tblScreen").DataTable() trả về instance đã khởi tạo,
 * không tạo mới) — không fetch lại, không đụng tới script
 * tải/lọc/vẽ cột đã có sẵn trong screener.html.
 *
 * Tab "Báo cáo tài chính" CHƯA có dữ liệu — financial_snapshot.csv/
 * data_bctc/ vẫn là dữ liệu cá nhân, không public (xem .gitignore).
 * Tab này chỉ hiện trạng thái "đang chờ dữ liệu", không bịa số liệu.
 * ============================================================ */

(function () {
  const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const num = (v, d = 1) => (v === null || v === undefined || v === "" || Number.isNaN(v))
    ? "–" : Number(v).toLocaleString("vi-VN", { maximumFractionDigits: d });
  const valueSignClass = (v) => Number(v) > 0 ? "up" : Number(v) < 0 ? "down" : "flat";
  const structCls = (s) => {
    s = String(s).toLowerCase();
    return s === "up" ? "bs-green" : s === "side" ? "bs-amber" : s === "down" ? "bs-red" : "bs-gray";
  };

  /* ---------- Phase 5A: URL-synced ticker state (pure, no browser globals —
   * testable directly from Node). VN tickers are 3-4 uppercase alnum chars;
   * accept up to 10 defensively and reject anything else so an invalid/hostile
   * URL value never reaches a lookup or the DOM. ---------- */
  const TICKER_PARAM = "ticker";
  function normalizeTicker(value) {
    const t = String(value === null || value === undefined ? "" : value).trim().toUpperCase();
    return /^[A-Z0-9]{1,10}$/.test(t) ? t : null;
  }
  function tickerFromSearch(search) {
    return normalizeTicker(new URLSearchParams(search || "").get(TICKER_PARAM));
  }
  // Trả về "" hoặc "?a=1&ticker=X..." — không đụng tới các tham số khác.
  function searchWithTicker(search, ticker) {
    const params = new URLSearchParams(search || "");
    if (ticker) params.set(TICKER_PARAM, ticker); else params.delete(TICKER_PARAM);
    const qs = params.toString();
    return qs ? `?${qs}` : "";
  }
  // openTicker: mã đang thực sự hiển thị trên panel (null nếu đang đóng).
  // currentTicker: mã đang phản ánh trên URL hiện tại (null nếu không có).
  // primed: đã từng push/bootstrap 1 lần trong phiên trang này chưa.
  function decideOpenAction(currentTicker, openTicker, targetTicker, primed) {
    if (!targetTicker) return { render: false };
    if (openTicker === targetTicker) return { render: true, history: "none" };
    // URL đã sẵn đúng mã (nạp thẳng bằng link/back-forward) — nếu đây là lần đầu
    // tiên trong phiên thì cần "bootstrap" (chèn 1 trạng thái đã-đóng bên dưới)
    // để nút Back/Đóng luôn có nơi an toàn để về, thay vì thoát hẳn trang.
    if (currentTicker === targetTicker) return { render: true, history: primed ? "none" : "bootstrap" };
    return { render: true, history: "push" };
  }
  // depth: số bước push kể từ trạng thái "đã đóng" gần nhất bên dưới (0 = đã ở
  // trạng thái đóng). Đóng tường minh (X / Escape / bấm ra ngoài) LUÔN phải đóng
  // hẳn — kể cả sau khi đã chuyển qua nhiều mã — nên nhảy thẳng N bước bằng
  // history.go(-N) thay vì lùi từng bước 1 (lùi 1 bước sẽ chỉ hiện lại mã trước
  // đó, đúng ngữ nghĩa của nút Back nhưng SAI với "Đóng" — Đóng phải đóng hẳn).
  function decideCloseAction(depth) {
    return depth > 0 ? { hide: false, history: "back", steps: depth } : { hide: true, history: "none" };
  }

  let backdrop;
  let chartInstance = null;
  let corporateBundlePromise = null;
  let lastFocused = null;
  let historyPrimed = false;
  const tickerRowCache = new Map();

  const isObject = (value) => value !== null && typeof value === "object" && !Array.isArray(value);
  const displayValue = (value) => value === null || value === undefined || value === "" ? "-" : esc(value);
  const displayNumber = (value, digits = 2) => value === null || value === undefined || value === ""
    ? "-" : (Number.isFinite(Number(value)) ? num(value, digits) : esc(value));
  const titleCase = (value) => String(value || "").replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  const sectionState = (section) => isObject(section) && typeof section.status === "string" ? section.status.toLowerCase() : "available";
  const sectionData = (section) => isObject(section) && Object.prototype.hasOwnProperty.call(section, "data") ? section.data : section;
  const statusMessage = (state) => ({ current: "Current data.", expiring: "Update window is approaching.", stale: "Data is stale.", missing: "Corporate Intelligence is not included in this bundle.", historical: "Historical evidence; not current market state.", unknown: "Freshness cannot be verified.", partial: "Data is incomplete; valid information is still shown.", malformed: "This subsection is invalid and cannot be displayed.", incomparable: "The snapshots are not comparable." }[state] || "");

  function sourceBlocks(value) {
    if (!isObject(value)) return [];
    if (isObject(value.sources)) return Object.entries(value.sources).filter(([, item]) => isObject(item) || Array.isArray(item));
    if (Array.isArray(value.sources)) return value.sources.filter((item) => isObject(item) || Array.isArray(item)).map((item) => [isObject(item) ? item.source_name || item.source || item.provider || "Source" : "Source", item]);
    if (["owners", "items", "holders", "subsidiaries", "entities"].some((key) => Array.isArray(value[key]))) return [[value.source || value.provider || "Source", value]];
    const ignored = new Set(["status", "data", "snapshot_date", "provenance_date", "reference", "reference_scope", "update_date"]);
    const entries = Object.entries(value).filter(([key, item]) => !ignored.has(key) && (isObject(item) || Array.isArray(item)));
    return entries.length ? entries : [[value.source || value.provider || "Source", value]];
  }
  function metadata(item) {
    if (!isObject(item)) return "";
    const bits = [item.source_name || item.source || item.provider, item.snapshot_date || item.provenance_date || item.as_of_date || item.update_date || item.fetched_at, item.source_reference || item.reference_scope || item.reference || item.provenance].filter((value) => value !== null && value !== undefined && value !== "").map(esc);
    return bits.length ? `<div class="cp-ci-meta">${bits.join(" · ")}</div>` : "";
  }
  function fieldRows(item, fields) {
    if (!isObject(item)) return "";
    const rows = fields.filter(({ key }) => Object.prototype.hasOwnProperty.call(item, key)).map(({ key, label, number }) => `<div class="cp-ci-field"><span>${esc(label)}</span><strong>${number ? displayNumber(item[key]) : displayValue(item[key])}</strong></div>`);
    return rows.length ? `<div class="cp-ci-fields">${rows.join("")}</div>` : "";
  }
  function subsection(title, section, render) {
    const state = sectionState(section); if (state === "missing") return "";
    const notice = statusMessage(state), body = state === "malformed" ? "" : render(sectionData(section));
    const freshness = isObject(section) && isObject(section.freshness) ? section.freshness : null;
    const freshnessNotice = freshness ? `<div class="cp-ci-notice cp-ci-${esc(freshness.freshness_status || "unknown")}">${esc(statusMessage(freshness.freshness_status || "unknown"))}${freshness.stale_reason ? ` ${esc(freshness.stale_reason)}` : ""}${freshness.is_actionable ? "" : " Not actionable."}</div>` : "";
    return body || notice || freshnessNotice ? `<section class="cp-ci-section"><h4>${esc(title)}</h4>${notice ? `<div class="cp-ci-notice cp-ci-${esc(state)}">${esc(notice)}</div>` : ""}${freshnessNotice}${body}</section>` : "";
  }
  function renderProfile(profile) {
    return sourceBlocks(profile).map(([source, item]) => { const values = isObject(item) ? item : {};
      const profileFields = isObject(values.record) && isObject(values.record.qualified_fields) ? values.record.qualified_fields : values;
      const fields = Object.entries(profileFields).filter(([key, value]) => !["source", "source_name", "provider", "snapshot_date", "provenance_date", "as_of_date", "update_date", "fetched_at", "reference", "reference_scope", "source_reference", "provenance", "status", "data"].includes(key) && (typeof value === "string" || typeof value === "number" || typeof value === "boolean"));
      return `<div class="cp-ci-source"><h5>${esc(source)}</h5>${metadata(values)}${fields.length ? `<div class="cp-ci-fields">${fields.map(([key, value]) => `<div class="cp-ci-field"><span>${esc(titleCase(key))}</span><strong>${displayValue(value)}</strong></div>`).join("")}</div>` : ""}</div>`;
    }).join("");
  }
  function renderOwnership(ownership) {
    return sourceBlocks(ownership).map(([source, item]) => { const rows = Array.isArray(item) ? item : (isObject(item) ? item.records || item.owners || item.items || item.holders || [] : []); if (!Array.isArray(rows)) return "";
      return `<div class="cp-ci-source"><h5>${esc(source)}</h5>${metadata(item)}${rows.map((owner) => { const fields = isObject(owner) && isObject(owner.fields) ? owner.fields : owner; return isObject(fields) ? `<div class="cp-ci-record">${fieldRows(fields, [{ key: "owner_type", label: "Owner type" }, { key: "ownership_percentage", label: "Ownership %", number: true }, { key: "shares_owned", label: "Shares owned", number: true }, { key: "update_date", label: "Update date" }])}</div>` : ""; }).join("")}</div>`;
    }).join("");
  }
  function renderMajorShareholders(value) {
    if (!isObject(value)) return "";
    if (Array.isArray(value.sources)) return value.sources.filter(isObject).map((source) => {
      const rows = Array.isArray(source.records) ? source.records : [];
      const snapshot = rows.length ? `<div class="cp-ci-source"><h5>${esc(source.source_name || "Latest snapshot")}</h5>${metadata(source)}${rows.map((holder) => isObject(holder) ? `<div class="cp-ci-record">${fieldRows(holder, [{ key: "holder_name", label: "Holder" }, { key: "shares", label: "Shares", number: true }, { key: "ownership_pct", label: "Ownership %", number: true }])}</div>` : "").join("")}</div>` : "";
      const delta = source.delta;
      if (!isObject(delta)) return snapshot;
      if (String(delta.status || "").startsWith("incomparable")) return `${snapshot}<div class="cp-ci-notice cp-ci-incomparable">${esc(statusMessage("incomparable"))}</div>`;
      const changes = Array.isArray(delta.changes) ? delta.changes : [];
      return `${snapshot}${changes.map((change) => isObject(change) ? `<div class="cp-ci-source"><h5>${esc(titleCase(change.change_type || "Shareholder change"))}</h5>${fieldRows(change, [{ key: "holder_name_after", label: "Holder" }, { key: "holder_name_before", label: "Holder" }, { key: "shares_delta", label: "Shares change", number: true }, { key: "ownership_pct_delta", label: "Ownership % change", number: true }])}</div>` : "").join("")}`;
    }).join("");
    const snapshot = value.latest_valid_snapshot || value.latest_snapshot || value.snapshot, delta = value.delta || value.snapshot_delta;
    const rows = Array.isArray(snapshot) ? snapshot : (isObject(snapshot) ? (snapshot.holders || snapshot.items || []) : []);
    const snapshotHtml = Array.isArray(rows) && rows.length ? `<div class="cp-ci-source"><h5>Latest snapshot</h5>${metadata(snapshot)}${rows.map((holder) => isObject(holder) ? `<div class="cp-ci-record">${fieldRows(holder, [{ key: "holder_name", label: "Holder" }, { key: "name", label: "Holder" }, { key: "shares_owned", label: "Shares", number: true }, { key: "ownership_percentage", label: "Ownership %", number: true }])}</div>` : "").join("")}</div>` : "";
    if (!isObject(delta)) return snapshotHtml;
    if (sectionState(delta) === "incomparable" || value.status === "incomparable") return `${snapshotHtml}<div class="cp-ci-notice cp-ci-incomparable">${esc(statusMessage("incomparable"))}</div>`;
    const changes = [["New holder", delta.new_holder], ["Disappeared holder", delta.disappeared_holder], ["Shares change", delta.shares_change ?? delta.change_shares], ["Ownership % change", delta.ownership_percentage_change ?? delta.change_ownership_percentage]].filter(([, item]) => item !== undefined);
    return `${snapshotHtml}${changes.length ? `<div class="cp-ci-source"><h5>Snapshot delta</h5>${metadata(delta)}${changes.map(([label, item]) => `<div class="cp-ci-field"><span>${esc(label)}</span><strong>${Array.isArray(item) ? item.map(displayValue).join(", ") : displayValue(item)}</strong></div>`).join("")}</div>` : ""}`;
  }
  function renderSubsidiaries(value) {
    return sourceBlocks(value).map(([source, item]) => { const rows = Array.isArray(item) ? item : (isObject(item) ? item.records || item.subsidiaries || item.items || item.entities || [] : []); if (!Array.isArray(rows)) return "";
      return `<div class="cp-ci-source"><h5>${esc(source)}</h5>${metadata(item)}${rows.map((entity) => { const fields = isObject(entity) && isObject(entity.fields) ? entity.fields : entity; return isObject(fields) ? `<div class="cp-ci-record">${fieldRows(fields, [{ key: "organization_name", label: "Entity" }, { key: "entity_name", label: "Entity" }, { key: "name", label: "Entity" }, { key: "provider_record_id", label: "Provider identity" }, { key: "provider_local_identity", label: "Provider identity" }, { key: "relationship_type", label: "Relationship" }, { key: "ownership_percent", label: "Ownership %", number: true }, { key: "ownership_percentage", label: "Ownership %", number: true }, { key: "ownership", label: "Ownership", number: true }, { key: "provenance", label: "Provenance" }])}</div>` : ""; }).join("")}</div>`;
    }).join("");
  }
  function renderCorporateEvents(value) {
    if (!isObject(value)) return "";
    const warning = "Incomplete forward observations only; not complete event history or lifecycle status.";
    return sourceBlocks(value).map(([source, item]) => {
      const rows = isObject(item) && Array.isArray(item.records) ? item.records : [];
      if (!rows.length) return "";
      const coverage = item.coverage_status || value.coverage_status || "partial_unqualified_50_row_cap";
      return `<div class="cp-ci-source"><h5>${esc(source)}</h5><div class="cp-ci-notice cp-ci-partial">${esc(warning)} ${esc(coverage)}</div>${rows.map((record) => {
        if (!isObject(record)) return "";
        const fields = isObject(record.fields) ? record.fields : record;
        const provenance = isObject(record.provenance) ? record.provenance : {};
        const title = fields.event_title_vi || fields.event_title_en || fields.event_name_vi || fields.event_name_en || "Corporate event";
        return `<div class="cp-ci-record"><strong>${displayValue(title)}</strong>${fieldRows({ provider_event_id: record.provider_event_id, ...fields }, [
          { key: "provider_event_id", label: "Provider event ID" }, { key: "event_code", label: "Event code" },
          { key: "category", label: "Category" }, { key: "public_date", label: "Public date" },
          { key: "record_date", label: "Record date" }, { key: "exright_date", label: "Ex-right date" },
          { key: "issue_date", label: "Issue date" }, { key: "start_date", label: "Start date" },
          { key: "end_date", label: "End date" }, { key: "payout_date", label: "Payout date" },
          { key: "listing_date", label: "Listing date" }, { key: "exercise_ratio", label: "Exercise ratio", number: true },
          { key: "value_per_share", label: "Value per share", number: true },
        ]) }<div class="cp-ci-meta">${esc(provenance.provider || source)}${provenance.retrieved_at ? ` ? ${esc(provenance.retrieved_at)}` : ""}</div></div>`;
      }).join("")}</div>`;
    }).join("");
  }
  function renderAnalysisReadiness(readiness) {
    if (!isObject(readiness) || !isObject(readiness.domains)) return "";
    const combined = readiness.domains.combined_ai_analysis;
    if (!isObject(combined)) return "";
    const state = String(combined.state || "unknown");
    return `<div class="cp-ci-notice cp-ci-${esc(state)}">Analysis readiness: ${esc(state)}.${combined.reason ? ` ${esc(combined.reason)}` : ""}${combined.is_actionable ? "" : " Inferences are limited."}</div>`;
  }
  function renderCorporateIntelligence(corporate) {
    if (!isObject(corporate)) return `<section class="cp-ci"><h3>Corporate Intelligence</h3><div class="cp-ci-notice cp-ci-missing">${esc(statusMessage("missing"))}</div></section>`;
    const majorShareholders = corporate.major_shareholders || (corporate.major_shareholder_snapshot || corporate.major_shareholder_delta ? { latest_valid_snapshot: corporate.major_shareholder_snapshot, delta: corporate.major_shareholder_delta } : null);
    const parts = [subsection("Company profile", corporate.company_profile, renderProfile), subsection("Ownership structure", corporate.ownership_structure, renderOwnership), subsection("Major shareholders", majorShareholders, renderMajorShareholders), subsection("Company subsidiaries", corporate.company_subsidiaries, renderSubsidiaries), subsection("Corporate Events", corporate.corporate_events, renderCorporateEvents)].filter(Boolean);
    return `<section class="cp-ci"><h3>Corporate Intelligence</h3>${parts.length ? parts.join("") : `<div class="cp-ci-notice cp-ci-missing">${esc(statusMessage("missing"))}</div>`}</section>`;
  }

  function renderQualifiedResearchBrief(brief) {
    if (!isObject(brief)) return '<section class="company-section research-brief"><h3>Qualified historical research</h3><p>Research brief is unavailable in this legacy bundle.</p></section>';
    const facts = Array.isArray(brief.qualified_facts) ? brief.qualified_facts.slice(0, 8) : [];
    const quality = isObject(brief.quality) ? Object.values(brief.quality) : [];
    const scenarios = isObject(brief.scenarios) ? ["bear", "base", "bull"].map((name) => [name, brief.scenarios[name]]).filter(([, value]) => isObject(value)) : [];
    const liquidity = isObject(brief.portfolio_risk_boundary) ? brief.portfolio_risk_boundary.liquidity : null;
    const conclusion = isObject(brief.historical_conclusion) ? brief.historical_conclusion : {};
    return `<section class="company-section research-brief"><h3>Qualified historical research</h3><p><b>${esc(brief.ticker || "")}</b> · ${esc(brief.entity_type || "unknown")} · historical-only / non-actionable</p><p><b>Historical conclusion:</b> ${esc(conclusion.status || "insufficient_evidence")} — ${esc(conclusion.rationale || "")}</p><h4>Qualified facts</h4><ul>${facts.map((f) => `<li>${esc(f.canonical_metric)} (${esc(f.reporting_period)}): ${displayValue(f.value)}</li>`).join("") || "<li>Unavailable</li>"}</ul><h4>Quality</h4><ul>${quality.map((q) => `<li>${esc(q.dimension)}: ${esc(q.status)}${(q.reason_codes || []).length ? ` — ${esc(q.reason_codes.join(", "))}` : ""}</li>`).join("") || "<li>Unavailable</li>"}</ul><h4>Key risks</h4><ul>${(brief.risks && brief.risks.phase_4b || []).map((r) => `<li>${esc(r.risk_id)}: ${esc(r.inference || r.uncertainty || "")}</li>`).join("") || "<li>No additional qualified risk observation</li>"}</ul><h4>Bear / Base / Bull conditions</h4>${scenarios.map(([n,s]) => `<p><b>${titleCase(n)}:</b> ${esc(s.thesis || "Unavailable")}</p>`).join("")}<h4>Invalidation</h4><ul>${(brief.invalidation_conditions || []).map((x) => `<li>${esc(x)}</li>`).join("") || "<li>Unavailable</li>"}</ul><h4>Portfolio / liquidity boundary</h4><p>Fundamental risk: ${esc((brief.risks && brief.risks.phase_4c || {}).aggregate_posture || "insufficient_evidence")}. Liquidity: ${esc((liquidity || {}).status || "unavailable")} due to qualification: ${esc(((liquidity || {}).reason_codes || []).join(", "))}. Portfolio context: ${esc(((brief.portfolio_risk_boundary || {}).portfolio_context || {}).status || "blocked_input")}. Allocation: ${esc(((brief.portfolio_risk_boundary || {}).allocation || {}).status || "allocation_blocked")}.</p><h4>What cannot yet be concluded</h4><p>${esc((brief.prohibited_claims || []).join(", "))}</p></section>`;
  }
  function researchBriefForRow(row,bundle) { const e=bundleEntryForRow(row,bundle); return e && e.qualified_research_brief; }
  function renderQualifiedResearchDelta(delta) {
    if (!isObject(delta)) return '<section class="company-section research-delta"><h3>What changed?</h3><p>No qualified comparison snapshot available.</p></section>';
    const state = String(delta.comparison_status || "unavailable");
    if (state !== "comparable" && state !== "partially_comparable") return `<section class="company-section research-delta"><h3>What changed?</h3><p>Comparison unavailable: ${esc(state)}.</p></section>`;
    const summary = isObject(delta.material_change_summary) ? delta.material_change_summary : {};
    const conclusion = isObject(delta.historical_conclusion) ? delta.historical_conclusion : {};
    const keyChanges = Array.isArray(summary.highest_priority_changes) ? summary.highest_priority_changes.slice(0, 8) : [];
    const quality = Array.isArray(delta.quality_changes) ? delta.quality_changes.filter((item) => isObject(item) && item.status !== "unchanged").slice(0, 5) : [];
    const risks = Array.isArray(delta.risk_changes) ? delta.risk_changes.filter((item) => isObject(item) && item.status !== "persistent").slice(0, 5) : [];
    const invalidations = Array.isArray(delta.invalidation_changes) ? delta.invalidation_changes.filter((item) => isObject(item) && (item.status !== "unchanged" || item.trigger_evaluation === "triggered")).slice(0, 5) : [];
    const blocked = Array.isArray(summary.unchanged_critical_boundaries) ? summary.unchanged_critical_boundaries : [];
    const changedConclusion = conclusion.changed ? `<p><b>Historical conclusion:</b> ${esc((conclusion.previous || {}).status || "unavailable")} → ${esc((conclusion.current || {}).status || "unavailable")}</p>` : "";
    return `<section class="company-section research-delta"><h3>What changed?</h3><p><b>Thesis change status:</b> ${summary.material_change_detected ? "material change detected" : "no material qualified change"} (${esc(state)}).</p>${changedConclusion}<h4>Key changes</h4><ul>${keyChanges.map((item) => `<li>${esc(item.category)}: ${esc(item.reference)}</li>`).join("") || "<li>No new qualified change.</li>"}</ul><h4>Risks and quality</h4><ul>${quality.map((item) => `<li>Quality ${esc(item.dimension)}: ${esc(item.status)}${item.direction && item.direction !== "unchanged" ? ` (${esc(item.direction)})` : ""}</li>`).join("")}${risks.map((item) => `<li>Risk ${esc(item.risk_id)}: ${esc(item.status)}</li>`).join("") || "<li>No changed qualified risk or quality item.</li>"}</ul><h4>Scenario / invalidation</h4><ul>${invalidations.map((item) => `<li>${esc(item.condition_id)}: ${esc(item.status)}; trigger ${esc(item.trigger_evaluation || "unavailable")}</li>`).join("") || "<li>No changed invalidation condition.</li>"}</ul><h4>Still blocked</h4><p>${blocked.length ? esc(blocked.join(", ")) : "No unchanged critical blocked boundary reported."}</p></section>`;
  }
  function researchDeltaForRow(row,bundle) { const e=bundleEntryForRow(row,bundle); return e && e.qualified_research_delta; }
  // Financial distress (Altman Z'). Deliberately narrow: this section renders the model's
  // own fail-closed envelope and nothing else. It never computes a score, never turns an
  // applicability verdict into a rating, and never shows a number for a filer the model
  // does not apply to — a credit institution or a broker reaches this function with
  // applicability "not_applicable" and no score, and that is exactly what is displayed.
  const DISTRESS_APPLICABILITY = {
    not_applicable: "This model does not apply to this issuer.",
    insufficient_evidence: "Not enough qualified evidence to apply this model.",
    eligible: "This issuer is eligible for this model.",
  };
  function renderStatementTaxonomy(evidence) {
    if (!isObject(evidence) || !evidence.statement_taxonomy) return "";
    const authority = String(evidence.entity_type_authority || "unknown");
    return `<div class="cp-ci-source"><h5>Statement taxonomy (generated evidence)</h5>`
      + `<div class="cp-ci-fields">`
      + `<div class="cp-ci-field"><span>Reporting template</span><strong>${displayValue(titleCase(evidence.statement_taxonomy))}</strong></div>`
      + `<div class="cp-ci-field"><span>Entity type authority</span><strong>${displayValue(titleCase(authority))}</strong></div>`
      + `</div>`
      + `<div class="cp-ci-notice cp-ci-partial">Generated observation of the reporting template only. It is not a manually verified issuer type.</div>`
      + `</div>`;
  }
  function renderFinancialDistress(distress, taxonomy) {
    const taxonomyHtml = renderStatementTaxonomy(taxonomy);
    if (!isObject(distress)) {
      return taxonomyHtml
        ? `<section class="cp-ci"><h3>Financial Distress Model</h3>${taxonomyHtml}<div class="cp-ci-notice cp-ci-missing">No distress-model result is included in this bundle.</div></section>`
        : "";
    }
    const applicability = isObject(distress.applicability) ? distress.applicability : {};
    const verdict = String(applicability.applicability || distress.status || "insufficient_evidence");
    const head = `<div class="cp-ci-meta">Model: ${esc(distress.model || "Altman Z'")}`
      + `${distress.variant ? ` · variant ${esc(distress.variant)}` : ""}${distress.schema_version ? ` · v${esc(distress.schema_version)}` : ""}`
      + ` · applicability: ${esc(verdict)}</div>`;
    const notice = `<div class="cp-ci-notice cp-ci-${verdict === "eligible" ? "partial" : "missing"}">`
      + `${esc(DISTRESS_APPLICABILITY[verdict] || "Model applicability is unknown.")}`
      + `${applicability.reason ? ` ${esc(applicability.reason)}` : ""}</div>`;
    const blocking = Array.isArray(distress.blocking_reasons) ? distress.blocking_reasons : [];
    const missing = Array.isArray(distress.missing_inputs) ? distress.missing_inputs : [];
    const reasons = (blocking.length || missing.length)
      ? `<div class="cp-ci-source"><h5>Why no score is shown</h5>${blocking.map((r) => `<div class="cp-ci-field"><span>Blocked</span><strong>${displayValue(r)}</strong></div>`).join("")}${missing.map((r) => `<div class="cp-ci-field"><span>Missing input</span><strong>${displayValue(r)}</strong></div>`).join("")}</div>`
      : "";
    // A score is only ever rendered when the model itself reported one. `status`
    // "available" without a numeric score still renders no number.
    const score = distress.status === "available" && typeof distress.score === "number" && Number.isFinite(distress.score)
      ? `<div class="cp-ci-source"><h5>Result</h5><div class="cp-ci-fields">`
        + `<div class="cp-ci-field"><span>Z' score</span><strong>${displayNumber(distress.score, 4)}</strong></div>`
        + `<div class="cp-ci-field"><span>Zone</span><strong>${displayValue(titleCase(distress.zone))}</strong></div>`
        + `<div class="cp-ci-field"><span>Reporting period</span><strong>${displayValue(distress.period)}</strong></div>`
        + `</div></div>`
      : "";
    const proximity = isObject(distress.zone_proximity) ? distress.zone_proximity : null;
    const boundary = score && proximity && proximity.near_threshold
      ? `<div class="cp-ci-notice cp-ci-partial">The score is close to the ${esc(proximity.nearest_threshold || "zone")} boundary (${displayNumber(proximity.nearest_threshold_value, 2)}); the zone label is not robust to small input changes.</div>`
      : "";
    const limits = Array.isArray(distress.limitations) && distress.limitations.length
      ? `<div class="cp-ci-source"><h5>Interpretation limits</h5>${distress.limitations.map((l) => `<div class="cp-ci-notice cp-ci-partial">${displayValue(l)}</div>`).join("")}</div>`
      : "";
    return `<section class="cp-ci"><h3>Financial Distress Model</h3>${head}${taxonomyHtml}${notice}${score}${boundary}${reasons}${limits}`
      + `<div class="cp-ci-notice cp-ci-missing">A model zone is not a bankruptcy probability and not an investment recommendation.</div></section>`;
  }
  function renderCitedDocumentEvidence(evidence) {
    if (!isObject(evidence)) return "";
    const state = String(evidence.retrieval_status || "unavailable");
    const reason = evidence.reason || (state === "unavailable" ? "section_absent" : null);
    const notices = { unsupported_query: "This evidence query is not supported.", no_source_supported_passage: "No source-supported passage was found.", missing_document: "The cited document is unavailable.", source_hash_mismatch: "The cited document failed source-hash validation.", section_absent: "Cited evidence is not included in this context." };
    const rows = Array.isArray(evidence.results) ? evidence.results.filter((item) => isObject(item) && Array.isArray(item.citation_ids) && item.citation_ids.length).slice().sort((a, b) => String(a.document_id || "").localeCompare(String(b.document_id || "")) || String(a.chunk_id || "").localeCompare(String(b.chunk_id || ""))) : [];
    const rowHtml = rows.map((item) => `<div class="cp-ci-source"><h5>${esc(item.document_id || "Document")}</h5><div class="cp-ci-fields"><div class="cp-ci-field"><span>Ticker</span><strong>${displayValue(evidence.ticker)}</strong></div><div class="cp-ci-field"><span>Page / section</span><strong>${displayValue(item.page)} / ${displayValue(item.section)}</strong></div><div class="cp-ci-field"><span>Citation IDs</span><strong>${item.citation_ids.map(esc).join(", ")}</strong></div><div class="cp-ci-field"><span>Published / observed</span><strong>${displayValue(item.published_at)} / ${displayValue(item.observed_at)}</strong></div><div class="cp-ci-field"><span>Document hash</span><strong>${displayValue(item.document_sha256)}</strong></div></div></div>`).join("");
    const notice = notices[reason] || (state === "unavailable" ? "Cited evidence is unavailable." : "");
    return `<section class="cp-ci"><h3>Cited Evidence</h3><div class="cp-ci-meta">Retrieval status: ${esc(state)}${reason ? ` · ${esc(reason)}` : ""}</div>${notice ? `<div class="cp-ci-notice cp-ci-missing">${esc(notice)}</div>` : ""}${rowHtml}</section>`;
  }
  function loadCorporateBundle() { if (window.ANALYSIS_BUNDLE) return Promise.resolve(window.ANALYSIS_BUNDLE); if (!corporateBundlePromise && typeof fetch === "function") corporateBundlePromise = fetch("analysis_bundle.json", { cache: "no-store" }).then((response) => response.ok ? response.json() : null).catch(() => null); return corporateBundlePromise || Promise.resolve(null); }
  function corporateForRow(row, bundle) { if (isObject(row && row.corporate_intelligence)) return row.corporate_intelligence; return bundle && bundle.tickers && row && bundle.tickers[row.ticker] && bundle.tickers[row.ticker].corporate_intelligence; }
  function distressForRow(row, bundle) {
    if (isObject(row && row.financial_distress_evidence)) return row.financial_distress_evidence;
    const entry = bundle && bundle.tickers && row && bundle.tickers[row.ticker];
    return entry && entry.financial_distress_evidence;
  }
  function taxonomyForRow(row, bundle) {
    if (isObject(row && row.statement_taxonomy_evidence)) return row.statement_taxonomy_evidence;
    const entry = bundle && bundle.tickers && row && bundle.tickers[row.ticker];
    return entry && entry.statement_taxonomy_evidence;
  }
  function evidenceForRow(row, bundle) { if (isObject(row && row.cited_document_evidence)) return row.cited_document_evidence; const entry = bundle && bundle.tickers && row && bundle.tickers[row.ticker]; return entry && entry.context_package && entry.context_package.cited_document_evidence; }
  function readinessForRow(row, bundle) { return bundle && bundle.tickers && row && bundle.tickers[row.ticker] && bundle.tickers[row.ticker].analysis_readiness; }
  function bundleEntryForRow(row, bundle) {
    if (isObject(row) && isObject(row.relative_valuation)) return row;
    return isObject(bundle) && isObject(bundle.tickers) && isObject(row) && isObject(bundle.tickers[row.ticker]) ? bundle.tickers[row.ticker] : null;
  }
  function historicalValuationPeriod(methods) {
    const first = methods.find((method) => isObject(method.financial_period));
    return first && first.financial_period && first.financial_period.period ? `FY${first.financial_period.period}` : "Historical financial period unavailable";
  }
  function historicalEbitdaMetadata(entry) {
    const records = entry && entry.financial_canonical && entry.financial_canonical.records;
    return Array.isArray(records) ? records.find((record) => isObject(record) && record.canonical_metric === "ebitda" && record.formula_version) || null : null;
  }
  function renderHistoricalValuation(entry) {
    const valuation = entry && entry.relative_valuation;
    if (!isObject(valuation) || !isObject(valuation.methods)) return "";
    const labels = { pe: "P/E", pb: "P/B", ps: "P/S", ev_sales: "EV/Sales", ev_ebitda: "EV/EBITDA" };
    const ordered = ["pe", "pb", "ps", "ev_sales", "ev_ebitda"].map((key) => ({ key, method: valuation.methods[key] })).filter(({ method }) => isObject(method));
    if (!ordered.length) return "";
    const available = ordered.filter(({ method }) => method.state === "available" && method.is_actionable !== false && Number.isFinite(Number(method.observed_multiple)));
    if (!available.length) {
      const unavailable = ordered.find(({ method }) => method.state === "unavailable" || method.is_actionable === false);
      const reason = unavailable && Array.isArray(unavailable.method.missing_inputs) ? unavailable.method.missing_inputs.join(", ") : "historical_valuation_not_actionable";
      return `<section class="cp-hv" data-valuation-state="unavailable" data-valuation-reason="${esc(reason)}"><h3>Historical valuation</h3><div class="cp-ci-notice cp-ci-missing">Historical valuation is unavailable for this ticker. No current/live multiple is inferred.</div></section>`;
    }
    const priceDate = available.find(({ method }) => method.price_as_of_date)?.method.price_as_of_date || "Unknown";
    const ebitda = historicalEbitdaMetadata(entry);
    const rows = available.map(({ key, method }) => `<div class="cp-ci-field"><span>${esc(labels[key])}${key === "ev_ebitda" ? " (derived EBITDA)" : ""}</span><strong>${displayNumber(method.observed_multiple, 2)}x</strong></div>`).join("");
    // Methods present in the artifact but not "available" (e.g. ps unavailable for a
    // bank with no revenue identity, ev_sales/ev_ebitda inapplicable for a bank archetype)
    // must still render explicitly here -- never silently dropped alongside the available
    // ones, and never conflated with a "zero available" ticker (the branch above).
    const notAvailable = ordered.filter(({ key }) => !available.some((entry2) => entry2.key === key));
    const notAvailableRows = notAvailable.map(({ key, method }) => {
      const state = String(method.state || "unknown");
      return `<div class="cp-ci-notice cp-ci-${esc(state)}"><span>${esc(labels[key])}</span>: ${esc(titleCase(state))} — ${esc(authoritativeReason(method))}</div>`;
    }).join("");
    const ebitdaDetails = ebitda ? `<details class="cp-hv-details"><summary>Derived EBITDA details</summary><div>Formula version: <code>${esc(ebitda.formula_version)}</code></div>${Array.isArray(ebitda.warnings) && ebitda.warnings.length ? `<div class="cp-ci-notice cp-ci-incomparable">${esc(ebitda.warnings.join(" "))}</div>` : ""}</details>` : "";
    return `<section class="cp-hv" data-valuation-state="historical"><h3>Historical valuation</h3><div class="cp-ci-notice cp-ci-historical">Historical multiples only — not current/live multiples.</div><div class="cp-ci-meta">${esc(historicalValuationPeriod(available.map(({ method }) => method)))} financials · qualified market price as of ${esc(priceDate)}</div><div class="cp-ci-source"><div class="cp-ci-fields">${rows}</div></div>${notAvailableRows}${ebitdaDetails}</section>`;
  }

  /* ---------- Financial-analysis visibility (bounded closeout): render already-
   * qualified fundamental_quality / intrinsic_valuation (net_net, fcff_dcf) /
   * financial_canonical(ebitda) fields from the production artifact as-is.
   * Contract-driven only — no ticker checks, no recomputation, no invented
   * aggregates. Anything absent from the artifact simply renders nothing
   * (fail closed), never a fabricated zero/blank/NaN. ---------- */
  const FUNDAMENTAL_QUALITY_LABELS = { growth_profitability: "Growth & Profitability", dupont_roe: "DuPont ROE", earnings_quality: "Earnings Quality", financial_strength: "Financial Strength", piotroski_f_score: "Piotroski F-Score", altman_z_score: "Altman Z-Score", beneish_m_score: "Beneish M-Score" };
  function authoritativeReason(method) {
    if (!isObject(method)) return "reason_not_provided";
    if (Array.isArray(method.missing_inputs) && method.missing_inputs.length) return method.missing_inputs.join(", ");
    if (Array.isArray(method.warnings) && method.warnings.length) return method.warnings.join(" ");
    return "reason_not_provided";
  }
  function financialCurrency(entry) {
    const records = entry && entry.financial_canonical && entry.financial_canonical.records;
    const found = Array.isArray(records) ? records.find((r) => isObject(r) && r.currency) : null;
    return found ? found.currency : null;
  }
  function periodLabelFromPeriods(periods) {
    const first = Array.isArray(periods) ? periods.find((p) => p) : null;
    return first ? `FY${first}` : "Historical financial period unavailable";
  }
  function renderFundamentalQuality(entry) {
    const fq = entry && entry.fundamental_quality;
    if (!isObject(fq) || !isObject(fq.models)) return "";
    const models = Object.entries(fq.models).filter(([, model]) => isObject(model));
    if (!models.length) return "";
    const availableCount = models.filter(([, model]) => model.result_state === "available").length;
    const rows = models.map(([key, model]) => {
      const label = FUNDAMENTAL_QUALITY_LABELS[key] || titleCase(key);
      const state = String(model.result_state || model.applicability_state || "unknown");
      if (state === "available") {
        return `<div class="cp-ci-source"><h5>${esc(label)}</h5><div class="cp-ci-fields"><div class="cp-ci-field"><span>Result</span><strong>${displayNumber(model.score_or_value, 2)}</strong></div></div></div>`;
      }
      return `<div class="cp-ci-source"><h5>${esc(label)}</h5><div class="cp-ci-notice cp-ci-${esc(state)}">${esc(titleCase(state))}: ${esc(authoritativeReason(model))}</div></div>`;
    }).join("");
    return `<section class="cp-ci-section"><h4>Fundamental Quality</h4><div class="cp-ci-meta">${availableCount} of ${models.length} model sections available</div>${rows}</section>`;
  }
  function renderNetNet(entry) {
    const method = entry && entry.intrinsic_valuation && entry.intrinsic_valuation.methods && entry.intrinsic_valuation.methods.net_net;
    if (!isObject(method)) return "";
    const state = String(method.state || "unknown");
    if (state !== "available") {
      return `<section class="cp-ci-section"><h4>Net-Net</h4><div class="cp-ci-notice cp-ci-${esc(state)}">${esc(titleCase(state))}: ${esc(authoritativeReason(method))}</div></section>`;
    }
    const currency = financialCurrency(entry);
    const period = periodLabelFromPeriods(method.historical_input_periods);
    const hasPerShare = method.per_share_value !== null && method.per_share_value !== undefined;
    return `<section class="cp-ci-section"><h4>Net-Net</h4><div class="cp-ci-meta">${esc(period)}${currency ? ` · ${esc(currency)}` : ""}${method.statement_scope ? ` · ${esc(method.statement_scope)}` : ""}</div><div class="cp-ci-fields"><div class="cp-ci-field"><span>Net-Net result</span><strong>${displayNumber(method.equity_value, 0)}</strong></div>${hasPerShare ? `<div class="cp-ci-field"><span>Per-share</span><strong>${displayNumber(method.per_share_value, 2)}</strong></div>` : ""}</div></section>`;
  }
  function renderFcff(entry) {
    const method = entry && entry.intrinsic_valuation && entry.intrinsic_valuation.methods && entry.intrinsic_valuation.methods.fcff_dcf;
    if (!isObject(method)) return "";
    const state = String(method.state || "unknown");
    if (state !== "available") {
      return `<section class="cp-ci-section"><h4>FCFF</h4><div class="cp-ci-notice cp-ci-${esc(state)}">${esc(titleCase(state))}: ${esc(authoritativeReason(method))}</div></section>`;
    }
    return `<section class="cp-ci-section"><h4>FCFF</h4><div class="cp-ci-fields"><div class="cp-ci-field"><span>Enterprise value</span><strong>${displayNumber(method.enterprise_value, 0)}</strong></div><div class="cp-ci-field"><span>Equity value</span><strong>${displayNumber(method.equity_value, 0)}</strong></div><div class="cp-ci-field"><span>Per-share</span><strong>${displayNumber(method.per_share_value, 2)}</strong></div></div></section>`;
  }
  function qualifiedMetric(row, name) {
    const metrics = isObject(row) && isObject(row.metrics) ? row.metrics : {};
    return isObject(metrics[name]) ? metrics[name] : null;
  }
  function qualifiedMetricValue(metric, suffix = "") {
    if (!isObject(metric)) return "Data unavailable";
    if (metric.status !== "available") return esc(titleCase(metric.status || metric.applicability || "unavailable"));
    return metric.value === null || metric.value === undefined ? "Data unavailable" : `${displayNumber(metric.value, 2)}${suffix}`;
  }
  function predicateNames(items) {
    return Array.isArray(items) && items.length
      ? items.filter(isObject).map((item) => titleCase(item.predicate || "qualified condition")).join(", ")
      : "None recorded";
  }
  function scenarioConditions(scenarios, name) {
    const scenario = isObject(scenarios) && isObject(scenarios[name]) ? scenarios[name] : {};
    const values = scenario.historical_fundamental_conditions || scenario.required_conditions;
    return Array.isArray(values) && values.length ? values.map(displayValue).join("; ") : "Data unavailable";
  }
  function validQualifiedComparison(value) {
    return isObject(value) && value.status === "available" && value.historical_only === true
      && value.market_dependent === false && value.is_actionable === false && value.ranking_prohibited === true
      && Array.isArray(value.rows) && value.cross_sectional_comparison === "available";
  }
  function renderQualifiedHistoricalResearch(entry) {
    const comparison = entry && entry.qualified_cohort_comparison;
    if (comparison === undefined) return "";
    if (!validQualifiedComparison(comparison)) return `<section class="cp-ci-section" data-qualified-research-state="unavailable"><h4>Qualified Historical Research</h4><div class="cp-ci-notice cp-ci-missing">Data unavailable.</div></section>`;
    const decision = isObject(entry.historical_decision_analysis) ? entry.historical_decision_analysis : {};
    const ticker = String(entry.ticker || decision.ticker || "").toUpperCase();
    const row = comparison.rows.find((item) => isObject(item) && String(item.ticker || "").toUpperCase() === ticker);
    if (!isObject(row)) return `<section class="cp-ci-section" data-qualified-research-state="unavailable"><h4>Qualified Historical Research</h4><div class="cp-ci-notice cp-ci-missing">Data unavailable.</div></section>`;
    const metrics = {
      earnings: qualifiedMetric(row, "earnings_state"), ocf: qualifiedMetric(row, "operating_cash_flow_state"),
      conversion: qualifiedMetric(row, "operating_cash_flow_to_net_income"), debtEquity: qualifiedMetric(row, "debt_to_equity"),
      cashDebt: qualifiedMetric(row, "cash_to_debt"), netDebtEquity: qualifiedMetric(row, "net_debt_to_equity"),
    };
    const stateText = (metric) => isObject(metric) && Array.isArray(metric.reason_codes) && metric.reason_codes.length
      ? titleCase(metric.reason_codes[0]) : qualifiedMetricValue(metric);
    const cards = [
      ["Profitability", stateText(metrics.earnings)], ["Operating cash flow", stateText(metrics.ocf)],
      ["Cash conversion (OCF / NI)", qualifiedMetricValue(metrics.conversion, "x")], ["Debt / Equity", qualifiedMetricValue(metrics.debtEquity, "x")],
      ["Cash / Debt", qualifiedMetricValue(metrics.cashDebt, "x")], ["Net debt / Equity", qualifiedMetricValue(metrics.netDebtEquity, "x")],
      ["Historical conclusion", titleCase(row.conclusion_code || "unavailable")], ["Trend availability", titleCase(row.trend_status || "insufficient_history")],
    ].map(([label, value]) => `<div class="cp-ci-field"><span>${esc(label)}</span><strong>${value}</strong></div>`).join("");
    const comparisonRows = comparison.rows.map((item) => {
      const value = (metricName) => qualifiedMetricValue(qualifiedMetric(item, metricName), "x");
      return `<tr><td>${displayValue(item.ticker)}</td><td>${stateText(qualifiedMetric(item, "earnings_state"))}</td><td>${stateText(qualifiedMetric(item, "operating_cash_flow_state"))}</td><td>${value("operating_cash_flow_to_net_income")}</td><td>${value("debt_to_equity")}</td><td>${value("cash_to_debt")}</td><td>${value("net_debt_to_equity")}</td><td>${displayValue(titleCase(item.conclusion_code || "unavailable"))}</td></tr>`;
    }).join("");
    const scenarios = decision.scenarios;
    const limitations = Array.isArray(comparison.limitations) ? comparison.limitations.map((item) => `<div class="cp-ci-notice cp-ci-historical">${displayValue(item)}</div>`).join("") : "";
    return `<section class="cp-ci-section" data-qualified-research-state="available"><h4>Qualified Historical Research</h4><div class="cp-ci-notice cp-ci-historical">Historical qualified fundamentals only. Cross-sectional cohort context is available; multi-period trend is ${esc(String(comparison.multi_period_trend || "unavailable"))}.</div><div class="cp-ci-meta">FY${displayValue(row.analysis_period)}${row.currency ? ` Â· ${displayValue(row.currency)}` : ""} Â· no valuation, recommendation, ranking, or market-liquidity claim</div><div class="cp-ci-fields">${cards}</div><div class="cp-ci-source"><h5>Strengths</h5><div class="cp-ci-meta">${esc(predicateNames(row.strength_predicates))}</div><h5>Risks</h5><div class="cp-ci-meta">${esc(predicateNames(row.risk_predicates))}</div></div><div class="cp-ci-source"><h5>Bear / Base / Bull conditions</h5><div class="cp-ci-field"><span>Bear</span><strong>${displayValue(scenarioConditions(scenarios, "bear"))}</strong></div><div class="cp-ci-field"><span>Base</span><strong>${displayValue(scenarioConditions(scenarios, "base"))}</strong></div><div class="cp-ci-field"><span>Bull</span><strong>${displayValue(scenarioConditions(scenarios, "bull"))}</strong></div></div><div class="cp-ci-source"><h5>Qualified cohort context</h5><div class="table-responsive"><table class="table table-sm"><thead><tr><th>Ticker</th><th>Profitability</th><th>OCF</th><th>OCF/NI</th><th>D/E</th><th>Cash/Debt</th><th>Net debt/Equity</th><th>Conclusion</th></tr></thead><tbody>${comparisonRows}</tbody></table></div></div>${limitations}</section>`;
  }
  function financialAnalysisAvailable(entry) {
    return isObject(entry) && (isObject(entry.fundamental_quality) || isObject(entry.intrinsic_valuation) || entry.qualified_cohort_comparison !== undefined);
  }
  function renderFinancialAnalysis(entry) {
    if (!financialAnalysisAvailable(entry)) return financialsPlaceholder();
    const sections = [renderQualifiedHistoricalResearch(entry), renderFundamentalQuality(entry), renderNetNet(entry), renderFcff(entry)].filter(Boolean);
    if (!sections.length) return financialsPlaceholder();
    return `<section class="cp-ci"><h3>Financial Analysis</h3>${sections.join("")}</section>`;
  }
  // Independent of renderHistoricalValuation's own state: a qualified EBITDA
  // record must stay visible even when every historical multiple is unavailable
  // (e.g. VNM has no qualified historical price yet, so EV/EBITDA and its inline
  // details never render there — this section is the only place VNM's EBITDA
  // lineage is shown). Left decoupled rather than folded into
  // renderHistoricalValuation so HPG's existing inline "Derived EBITDA details"
  // disclosure — and the test asserting it — stay untouched.
  function renderEbitdaLineage(entry) {
    const ebitda = historicalEbitdaMetadata(entry);
    if (!ebitda) return "";
    const period = isObject(ebitda.period_identity) && ebitda.period_identity.period ? `FY${ebitda.period_identity.period}` : "Historical financial period unavailable";
    const warnings = Array.isArray(ebitda.warnings) && ebitda.warnings.length ? `<div class="cp-ci-notice cp-ci-incomparable">${esc(ebitda.warnings.join(" "))}</div>` : "";
    return `<section class="cp-ci" data-ebitda-state="${esc(String(ebitda.quality_state || "unknown"))}"><h3>EBITDA lineage</h3><div class="cp-ci-meta">${esc(period)}${ebitda.currency ? ` · ${esc(ebitda.currency)}` : ""}${ebitda.statement_scope ? ` · ${esc(ebitda.statement_scope)}` : ""}</div><div class="cp-ci-fields"><div class="cp-ci-field"><span>Derived EBITDA</span><strong>${displayNumber(ebitda.value, 0)}</strong></div><div class="cp-ci-field"><span>Derived status</span><strong>${displayValue(ebitda.derivation_status)}</strong></div></div><div class="cp-ci-meta">Formula version: <code>${esc(ebitda.formula_version)}</code></div>${warnings}</section>`;
  }

  let chartRenderedFor = null; // ticker mà biểu đồ hiện đang hiển thị — tránh huỷ/tạo lại Chart.js
                                // khi bấm lại đúng tab của cùng 1 mã (Phase 5: giảm render thừa)

  function stat(label, valueHtml) {
    return `<div><div class="vs-modal-stat-label">${esc(label)}</div><div class="vs-modal-stat-value">${valueHtml}</div></div>`;
  }

  function renderOverview(r) {
    return `
      <div class="mb-3" style="font-size:0.8rem; color:var(--text-muted);">
        ${esc(typeof displayExchange === "function" ? displayExchange(r.exchange) : (r.exchange || "–"))} · ${esc(r.industry || "–")}
      </div>
      <div class="vs-modal-stat-grid">
        ${stat("Giá đóng cửa", num(r.close, 0))}
        ${stat("% phiên", `<span class="${valueSignClass(r.chg_today_pct ?? r.change_pct)}">${num(r.chg_today_pct ?? r.change_pct, 2)}%</span>`)}
        ${stat("RS Rating", num(r.rs_rating, 0))}
        ${stat("RSI 14", num(r.rsi14, 0))}
        ${stat("Cấu trúc", `<span class="badge-soft ${structCls(r.structure)}">${esc(String(r.structure || "–").toUpperCase())}</span>`)}
        ${stat("% từ đỉnh 52 tuần", `<span class="${valueSignClass(r.pct_from_52w_high)}">${num(r.pct_from_52w_high, 1)}%</span>`)}
        ${stat("GTGD 20 phiên (tỷ)", num(r.gtgd20_ty, 1))}
        ${stat("KL tương đối", num(r.rel_vol, 2))}
        ${stat("P/E", num(r.pe, 1))}
        ${stat("P/B", num(r.pb, 2))}
        ${stat("ROE %", num(r.roe, 1))}
        ${stat("Room ngoại %", num(r.foreign_room_pct, 1))}
      </div>
      ${r.margin_status ? `<div class="mt-3"><span class="badge-margin">${esc(r.margin_status)}</span></div>` : ""}`;
  }

  function renderChart(r) {
    if (chartRenderedFor === r.ticker && chartInstance) return; // đã đúng biểu đồ rồi, khỏi vẽ lại
    const canvas = document.getElementById("cp-chart-canvas");
    if (!canvas || !window.Chart) return;
    // screener.html/signals.html KHÔNG load app.js nên Chart.defaults có thể chưa
    // từng được set — gọi ở đây để chart luôn đúng theme dù trang nào vẽ trước.
    if (typeof applyChartTheme === "function") applyChartTheme();
    if (chartInstance) { chartInstance.destroy(); chartInstance = null; }
    chartRenderedFor = r.ticker;

    const periods = [
      { label: "1 tháng", value: r.ret_1m },
      { label: "3 tháng", value: r.ret_3m },
      { label: "6 tháng", value: r.ret_6m },
      { label: "12 tháng", value: r.ret_12m },
    ];
    const values = periods.map((p) => (p.value === null || p.value === undefined || p.value === "" ? null : Number(p.value)));

    chartInstance = new Chart(canvas, {
      type: "bar",
      data: {
        labels: periods.map((p) => p.label),
        datasets: [{
          data: values,
          backgroundColor: values.map((v) => (v === null ? CHART_COLORS.muted : v >= 0 ? CHART_COLORS.pos : CHART_COLORS.neg)),
          borderRadius: 4,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: (ctx) => ` ${ctx.parsed.y ?? "–"}%` } },
        },
        scales: { y: { ticks: { callback: (v) => v + "%" } } },
      },
    });
  }

  function financialsPlaceholder() {
    return `
      <div class="vs-empty" style="padding:2rem 1rem;">
        <i data-lucide="file-clock"></i>
        <div class="vs-empty-title">Báo cáo tài chính đang chờ dữ liệu</div>
        <div class="vs-empty-sub">Ratios, Growth, Profitability, Cash Flow, Valuation sẽ hiển thị
          tại đây khi dữ liệu BCTC được công khai. Hiện dữ liệu này chỉ lưu cục bộ, chưa xuất bản
          lên trang web công khai.</div>
      </div>`;
  }

  function switchTab(tabName) {
    backdrop.querySelectorAll(".vs-panel-tab").forEach((t) => {
      const active = t.dataset.tab === tabName;
      t.classList.toggle("is-active", active);
      t.setAttribute("aria-selected", String(active));
    });
    backdrop.querySelectorAll(".vs-panel-tab-content").forEach((c) => {
      c.classList.toggle("is-active", c.dataset.tabContent === tabName);
    });
  }

  function getFocusable() {
    return Array.from(backdrop.querySelectorAll('button, [href], [tabindex]:not([tabindex="-1"])'))
      .filter((el) => el.offsetParent !== null);
  }

  function buildPanelShell() {
    backdrop = document.createElement("div");
    backdrop.className = "vs-modal-backdrop";
    backdrop.innerHTML = `
      <div class="vs-modal" role="dialog" aria-modal="true" aria-labelledby="cp-title">
        <div class="vs-modal-header">
          <span class="vs-modal-title" id="cp-title"></span>
          <button type="button" class="vs-icon-btn" id="cp-close" aria-label="Đóng"><i data-lucide="x"></i></button>
        </div>
        <div class="vs-panel-tabs" role="tablist">
          <button type="button" class="vs-panel-tab is-active" id="cp-tab-overview" data-tab="overview" role="tab" aria-selected="true" aria-controls="cp-panel-overview">Tổng quan</button>
          <button type="button" class="vs-panel-tab" id="cp-tab-chart" data-tab="chart" role="tab" aria-selected="false" aria-controls="cp-panel-chart">Biểu đồ</button>
          <button type="button" class="vs-panel-tab" id="cp-tab-financials" data-tab="financials" role="tab" aria-selected="false" aria-controls="cp-panel-financials">Báo cáo tài chính</button>
        </div>
        <div class="vs-modal-body">
          <div class="vs-panel-tab-content is-active" data-tab-content="overview" id="cp-panel-overview" role="tabpanel" aria-labelledby="cp-tab-overview">
            <div id="cp-overview"></div>
          </div>
          <div class="vs-panel-tab-content" data-tab-content="chart" id="cp-panel-chart" role="tabpanel" aria-labelledby="cp-tab-chart">
            <div class="chart-box" style="height:220px"><canvas id="cp-chart-canvas"></canvas></div>
          </div>
          <div class="vs-panel-tab-content" data-tab-content="financials" id="cp-panel-financials" role="tabpanel" aria-labelledby="cp-tab-financials"><div id="cp-financials-content">${financialsPlaceholder()}</div></div>
        </div>
      </div>`;
    document.body.appendChild(backdrop);
    if (window.lucide) lucide.createIcons();

    backdrop.querySelectorAll(".vs-panel-tab").forEach((tab) => {
      tab.addEventListener("click", () => {
        switchTab(tab.dataset.tab);
        if (tab.dataset.tab === "chart") renderChart(backdrop._currentRow);
      });
    });

    backdrop.addEventListener("click", (e) => { if (e.target === backdrop) closePanel(); });
    backdrop.querySelector("#cp-close").addEventListener("click", closePanel);
    document.addEventListener("keydown", (e) => {
      if (!backdrop.classList.contains("is-open")) return;
      if (e.key === "Escape") { closePanel(); return; }
      if (e.key !== "Tab") return;
      const focusable = getFocusable();
      if (!focusable.length) return;
      const first = focusable[0], last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
  }

  // company-panel.js is shared with dashboard.html and signals.html — the ?ticker=
  // URL/history contract is a Screener-specific feature (Phase 5A), so every write
  // to history/location below is gated on this. Rendering, caching, and focus
  // restoration stay page-agnostic; only the URL/history side effects are scoped.
  function isScreenerPage() {
    return typeof document !== "undefined" && document.body && document.body.dataset.page === "screener";
  }
  function currentUrlTicker() {
    return typeof location === "undefined" ? null : tickerFromSearch(location.search);
  }
  function currentOpenTicker() {
    return backdrop && backdrop.classList.contains("is-open") && backdrop._currentRow
      ? normalizeTicker(backdrop._currentRow.ticker) : null;
  }
  function currentDepth() {
    return (typeof history !== "undefined" && history.state && history.state.vsDepth) || 0;
  }
  function urlForTicker(ticker) {
    return location.pathname + searchWithTicker(location.search, ticker) + location.hash;
  }
  function pushUrlForTicker(ticker) {
    const depth = currentDepth() + 1;
    history.pushState({ vsTicker: ticker, vsDepth: depth }, "", urlForTicker(ticker));
  }

  function openPanel(row) {
    const ticker = normalizeTicker(row && row.ticker);
    const action = decideOpenAction(currentUrlTicker(), currentOpenTicker(), ticker, historyPrimed);
    if (!action.render) return;
    if (!backdrop) buildPanelShell();
    const wasOpen = backdrop.classList.contains("is-open");
    if (!wasOpen) lastFocused = document.activeElement;
    backdrop._currentRow = row;
    document.getElementById("cp-title").textContent = row.ticker || "?";
    const overview = document.getElementById("cp-overview");
    const financialsContent = document.getElementById("cp-financials-content");
    const immediateEntry = bundleEntryForRow(row);
    overview.innerHTML = renderOverview(row) + renderHistoricalValuation(immediateEntry) + renderQualifiedResearchBrief(researchBriefForRow(row)) + renderQualifiedResearchDelta(researchDeltaForRow(row)) + renderEbitdaLineage(immediateEntry) + renderAnalysisReadiness(readinessForRow(row)) + renderCorporateIntelligence(corporateForRow(row)) + renderFinancialDistress(distressForRow(row), taxonomyForRow(row)) + renderCitedDocumentEvidence(evidenceForRow(row));
    if (financialsContent) financialsContent.innerHTML = renderFinancialAnalysis(immediateEntry);
    // Legacy bundles render a neutral missing state immediately.  A cached dashboard
    // artifact, when present, replaces only this panel's Corporate Intelligence area.
    loadCorporateBundle().then((bundle) => {
      if (!backdrop || backdrop._currentRow !== row) return;
      const entry = bundleEntryForRow(row, bundle);
      overview.innerHTML = renderOverview(row) + renderHistoricalValuation(entry) + renderQualifiedResearchBrief(researchBriefForRow(row, bundle)) + renderQualifiedResearchDelta(researchDeltaForRow(row, bundle)) + renderEbitdaLineage(entry) + renderAnalysisReadiness(readinessForRow(row, bundle)) + renderCorporateIntelligence(corporateForRow(row, bundle)) + renderFinancialDistress(distressForRow(row, bundle), taxonomyForRow(row, bundle)) + renderCitedDocumentEvidence(evidenceForRow(row, bundle));
      if (financialsContent) financialsContent.innerHTML = renderFinancialAnalysis(entry);
    });
    switchTab("overview");
    backdrop.classList.add("is-open");
    document.body.style.overflow = "hidden";
    backdrop.querySelector("#cp-close").focus();

    if (ticker) tickerRowCache.set(ticker, row);
    if (isScreenerPage()) {
      if (action.history === "bootstrap") {
        history.replaceState({ vsTicker: null, vsDepth: 0 }, "", urlForTicker(null));
        pushUrlForTicker(ticker);
        historyPrimed = true;
      } else if (action.history === "push") {
        pushUrlForTicker(ticker);
        historyPrimed = true;
      }
    }
  }

  // Hides the panel with no history side effect at all. This is the only thing
  // handlePopState may ever do to close — the browser has ALREADY finished
  // navigating by the time popstate fires, so reacting to it with another
  // history.go() (as closePanel() below does) would double-navigate. A stale or
  // foreign vsDepth on the landed-on entry (external history entry, corrupted
  // state) must never trigger a further jump — see the regression test.
  function hidePanelUI() {
    if (!backdrop || !backdrop.classList.contains("is-open")) return;
    backdrop.classList.remove("is-open");
    document.body.style.overflow = "";
    if (lastFocused && typeof lastFocused.focus === "function" && document.contains(lastFocused)) lastFocused.focus();
    lastFocused = null;
  }

  // Public/explicit close (X button, Escape, backdrop click). Only this path is
  // allowed to navigate history, since only here do we know the URL still shows
  // the ticker we're actively dismissing.
  function closePanel() {
    if (!backdrop || !backdrop.classList.contains("is-open")) return;
    if (isScreenerPage()) {
      const action = decideCloseAction(currentDepth());
      if (action.history === "back") { history.go(-action.steps); return; }
    }
    hidePanelUI();
  }

  function handlePopState() {
    if (!isScreenerPage()) return;
    const ticker = currentUrlTicker();
    if (ticker === currentOpenTicker()) return;
    if (!ticker) { hidePanelUI(); return; }
    const row = tickerRowCache.get(ticker);
    if (row) openPanel(row); else hidePanelUI();
  }

  if (typeof document !== "undefined") document.addEventListener("DOMContentLoaded", () => {
    if (!backdrop) buildPanelShell();
    document.addEventListener("click", (e) => {
      const tr = e.target.closest("#tblScreen tbody tr");
      if (!tr || typeof jQuery === "undefined") return;
      const data = jQuery("#tblScreen").DataTable().row(tr).data();
      if (data) openPanel(data);
    });
  });

  // API dùng chung cho các bảng ngoài DataTables (ví dụ bảng mẫu hình nến ở signals.html).
  if (typeof window !== "undefined") {
    window.VSCompanyPanel = { open: openPanel, close: closePanel, normalizeTicker, tickerFromSearch };
    // Đồng bộ ?ticker= với Back/Forward — chỉ phản ứng khi tham số ticker thực sự
    // đổi (bỏ qua popstate do điều hướng hash-tab không liên quan, ví dụ signals.html).
    window.addEventListener("popstate", handlePopState);
  }
  if (typeof module !== "undefined" && module.exports) {
    module.exports = {
      renderCorporateIntelligence, renderAnalysisReadiness, renderHistoricalValuation, renderOverview, bundleEntryForRow, corporateForRow, readinessForRow, statusMessage,
      normalizeTicker, tickerFromSearch, searchWithTicker, decideOpenAction, decideCloseAction,
      isScreenerPage,
      renderFundamentalQuality, renderNetNet, renderFcff, renderEbitdaLineage, renderQualifiedHistoricalResearch, renderFinancialAnalysis, financialAnalysisAvailable,
      renderFinancialDistress, renderStatementTaxonomy, distressForRow, taxonomyForRow,
      renderCitedDocumentEvidence, evidenceForRow,
      renderQualifiedResearchBrief, researchBriefForRow, renderQualifiedResearchDelta, researchDeltaForRow,
    };
  }
})();
