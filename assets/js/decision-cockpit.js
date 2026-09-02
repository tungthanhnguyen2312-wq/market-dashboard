(function (root, factory) {
  const api = factory(root);
  if (typeof module === "object" && module.exports) {
    module.exports = api;
  }
  if (root && typeof root === "object") {
    root.VSDecisionCockpit = api;
  }
})(typeof window !== "undefined" ? window : globalThis, function (root) {
  "use strict";

  const URL = "data/current_decision_cockpit.json";
  const vf = (typeof window !== "undefined" && window.VSValueFormat)
    ? window.VSValueFormat
    : (typeof require === "function" ? require("./value-format.js") : {});

  const esc = vf.esc || ((v) => String(v ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c])));
  const unavailable = (v) => (v === null || v === undefined || v === "") ? "UNAVAILABLE" : v;

  function formatLabel(v, domain) {
    if (v === null || v === undefined || v === "") return "Chưa có dữ liệu";
    const raw = String(v).trim();
    if (vf.formatKnownLabel) {
      const formatted = vf.formatKnownLabel(raw, domain);
      if (formatted && formatted !== raw) return formatted;
    }
    if (vf.formatDomainState) {
      const res = vf.formatDomainState(raw, domain);
      if (res && res.known && res.label) return res.label;
    }
    if (/^[A-Z0-9_]+$/.test(raw)) {
      if (raw === "UNAVAILABLE" || raw === "ABSENT") return "Chưa có dữ liệu";
      if (raw === "AVAILABLE") return "Có dữ liệu";
      if (raw === "PARTIAL") return "Một phần";
      if (raw === "BLOCKED") return "Bị chặn";
      if (raw === "UNKNOWN") return "Chưa xác định";
      return "Trạng thái kỹ thuật";
    }
    return raw;
  }

  function state(v, domain) {
    const s = unavailable(v);
    const raw = String(s);
    const k = raw.toLowerCase();
    const c = (k.includes("available") && !k.includes("unavailable") && !k.includes("not_available"))
      ? "available"
      : (k.includes("partial") || k.includes("degraded") || k.includes("conditional") || k.includes("watch"))
        ? "partial"
        : (k.includes("blocked") || k.includes("risk") || k.includes("deterioration") || k.includes("failure"))
          ? "blocked"
          : (k.includes("unavailable") || k.includes("unknown") || k.includes("not_applicable") || k.includes("no_") || k.includes("absent"))
            ? "unavailable"
            : "";
    const label = formatLabel(raw, domain);
    return `<span class="cockpit-state ${c}" data-state="${esc(raw)}" title="${esc(raw)}">${esc(label)}</span>`;
  }

  const list = (values) => Array.isArray(values) && values.length
    ? `<ul class="cockpit-list">${values.map(x => {
        const str = typeof x === "string" ? x : JSON.stringify(x);
        return `<li>${esc(formatLabel(str) || str)}</li>`;
      }).join("")}</ul>`
    : '<span class="cockpit-note">Chưa ghi nhận</span>';

  const card = (label, value, domain) =>
    `<div class="cockpit-kpi"><div class="label">${esc(label)}</div><div class="value">${typeof value === "string" ? state(value, domain) : esc(unavailable(value))}</div></div>`;

  function renderTicker(data, ticker) {
    const c = data.ticker_cards && data.ticker_cards[ticker];
    if (!c) return;
    const s = c.current_decision_state || {},
      strategy = c.strategy_fit || {},
      scenario = c.scenario || {},
      peer = c.peer_context || {},
      fundamental = c.fundamental_context || {},
      valuation = c.valuation_context || {},
      flow = c.market_flow_positioning || {},
      corp = c.corporate_intelligence_context || {};

    const scenarios = [
      ['Tiêu cực', scenario.bear_case],
      ['Cơ sở', scenario.base_case],
      ['Tích cực', scenario.bull_case]
    ].map(([name, x]) =>
      `<div class="card">
        <div class="card-header"><h6>${name} <small>${state(x?.case_status, 'evidence_state')}</small></h6></div>
        <div class="card-body">
          <div class="cockpit-note">Trạng thái xác suất: ${state(x?.probability_status, 'data_fitness')}</div>
          <b>Điều kiện xác nhận</b>${list(x?.required_confirmations || x?.case_conditions || x?.continuation_conditions)}
          <b>Điều kiện vô hiệu</b>${list(x?.transition_to_bear_conditions || [x?.invalidation].filter(Boolean))}
          <b>Khoảng trống dữ liệu</b>${list(x?.data_gaps)}
        </div>
      </div>`
    ).join("");

    const stratList = (strategy.strategies || []).map(x => {
      const sId = formatLabel(x.strategy_id, 'strategy');
      const sSt = formatLabel(x.status, 'data_fitness');
      const sWhy = (x.why || []).map(w => formatLabel(w, 'rule_condition')).join('; ');
      return `${sId}: ${sSt}${sWhy ? ` — ${sWhy}` : ''}`;
    });

    const el = document.getElementById('ticker-card');
    if (el) {
      el.innerHTML = `
      <div class="cockpit-grid mb-3">
        ${card('Trạng thái hiện tại', s.entry_state, 'tactical_state')}
        ${card('Hành động nghiên cứu', s.entry_action, 'entry_action')}
        ${card('Khung thời gian', s.horizon, 'horizon')}
        ${card('Chất lượng kỹ thuật', c.data_quality?.technical_eligible ? 'AVAILABLE' : 'UNAVAILABLE', 'data_fitness')}
      </div>
      <div class="cockpit-detail-grid">
        <div class="card">
          <div class="card-header"><h6>Mức phù hợp chiến lược</h6></div>
          <div class="card-body">
            ${state(strategy.status, 'data_fitness')}
            ${list(stratList)}
          </div>
        </div>
        <div class="card">
          <div class="card-header"><h6>Bối cảnh cùng ngành</h6></div>
          <div class="card-body">
            <b>${esc(formatLabel(peer.peer_group, 'entity_type'))}</b> · ${state(peer.context_status, 'evidence_state')}<br>
            <span class="cockpit-note">${esc(formatLabel(peer.stock_specific_vs_sector_wide))}</span><br>
            <b>Điểm bất thường</b>${list(peer.what_is_unusual)}
            <b>Điểm không bất thường</b>${list(peer.what_is_not_unusual)}
            ${list(peer.limitations)}
          </div>
        </div>
        <div class="card">
          <div class="card-header"><h6>Cơ bản doanh nghiệp</h6></div>
          <div class="card-body">
            ${state(fundamental.authority_tier, 'data_fitness')}<br>
            Doanh thu: ${state(fundamental.revenue_direction, 'fundamental_trajectory')}<br>
            Lợi nhuận: ${state(fundamental.earnings_direction, 'fundamental_trajectory')}<br>
            Mức đồng thuận: ${state(fundamental.revenue_vs_earnings_alignment?.status, 'data_fitness')}
            ${list(fundamental.limitations)}
          </div>
        </div>
        <div class="card">
          <div class="card-header"><h6>Định giá</h6></div>
          <div class="card-body">
            Định giá nghiêm ngặt: ${state(valuation.strict_valuation_status, 'valuation_state')}<br>
            Chỉ báo thay thế nghiên cứu: ${state(valuation.shadow_proxy_available ? 'AVAILABLE_SHADOW_ONLY' : 'UNAVAILABLE', 'valuation_state')}
            <div class="cockpit-note mt-2">${esc(unavailable(valuation.authority_warning))}</div>
          </div>
        </div>
        <div class="card">
          <div class="card-header"><h6>Dòng tiền thị trường</h6></div>
          <div class="card-body">
            ${state(flow.status, 'liquidity_state')}<br>
            Giá trị giao dịch: ${state(flow.traded_value_composition?.state, 'liquidity_state')}<br>
            Khối ngoại: ${state(flow.foreign_flow, 'liquidity_state')}<br>
            Tự doanh: ${state(flow.proprietary_flow, 'liquidity_state')}<br>
            Dòng lệnh chủ động: ${state(flow.active_order?.state, 'liquidity_state')}
            ${list(flow.limitations)}
          </div>
        </div>
        <div class="card">
          <div class="card-header"><h6>Thông tin doanh nghiệp</h6></div>
          <div class="card-body">
            ${state(corp.status, 'evidence_state')}
            <b>Đã xác nhận</b>${list(corp.confirmed)}
            <b>Đang chờ / Kế hoạch</b>${list(corp.planned_or_pending)}
            <b>Cần kiểm chứng</b>${list(corp.what_to_verify)}
          </div>
        </div>
      </div>
      <div class="mt-3">
        <h6>Kịch bản tiêu cực / Cơ sở / Tích cực — có điều kiện, không phải dự báo</h6>
        <div class="cockpit-detail-grid">${scenarios}</div>
      </div>
      <div class="cockpit-detail-grid mt-3">
        <div class="card">
          <div class="card-header"><h6>Luận điểm / Phản biện</h6></div>
          <div class="card-body">
            <b>Luận điểm thực tế / suy luận</b>${list((c.thesis_counter_thesis?.thesis || []).map(x => `${formatLabel(x.type)}: ${x.claim}`))}
            <b>Khoảng trống dữ liệu</b>${list((c.thesis_counter_thesis?.counter_thesis || []).map(x => `${formatLabel(x.type)}: ${x.claim}`))}
            <b>Câu hỏi cần kiểm chứng</b>${list((c.thesis_counter_thesis?.questions_to_verify || []).map(x => `${formatLabel(x.type)}: ${x.claim}`))}
          </div>
        </div>
        <div class="card">
          <div class="card-header"><h6>Vĩ mô</h6></div>
          <div class="card-body">
            ${state(data.macro_context?.status, 'data_fitness')}
            <div class="cockpit-note">${esc(formatLabel(data.macro_context?.reason))}</div>
            <b>Giới hạn dữ liệu</b>${list(c.authority_limitations)}
          </div>
        </div>
      </div>`;
    }
  }

  function bindInteractiveEvents(data, setTicker) {
    if (typeof document === "undefined") return;
    document.querySelectorAll('[data-action="toggle-cohort"]').forEach(btn => {
      btn.onclick = (e) => {
        e.preventDefault();
        const targetId = btn.getAttribute('aria-controls');
        const targetEl = document.getElementById(targetId);
        if (!targetEl) return;
        const isExpanded = btn.getAttribute('aria-expanded') === 'true';
        if (isExpanded) {
          targetEl.hidden = true;
          btn.setAttribute('aria-expanded', 'false');
          btn.textContent = `Xem thêm ${btn.dataset.remaining} mã`;
        } else {
          targetEl.hidden = false;
          btn.setAttribute('aria-expanded', 'true');
          btn.textContent = 'Thu gọn';
        }
      };
    });

    document.querySelectorAll('[data-ticker]').forEach(btn => {
      btn.onclick = (e) => {
        e.preventDefault();
        if (setTicker) setTicker(btn.dataset.ticker);
      };
    });
  }

  function render(data) {
    if (typeof document === "undefined") return;
    const cockpitEl = document.getElementById('cockpit');
    if (cockpitEl) cockpitEl.hidden = false;

    const sessionLineEl = document.getElementById('session-line');
    if (sessionLineEl) {
      sessionLineEl.innerHTML = `<span>Phiên nghiên cứu: ${esc(data.session || 'Chưa xác định')}</span>
        <details class="vs-tech-details d-inline-block ms-2">
          <summary>Chi tiết kỹ thuật</summary>
          <div class="cockpit-code mt-1">
            <div><strong>Thao tác:</strong> ${esc(data.source?.operation_identity || '')}</div>
            <div><strong>Sản phẩm:</strong> ${esc(data.source?.product_identity || '')}</div>
          </div>
        </details>`;
    }

    const market = data.market_overview || {},
      cov = market.coverage || {},
      flow = data.source?.input_artifacts?.market_flow_positioning;

    const marketOverviewEl = document.getElementById('market-overview');
    if (marketOverviewEl) {
      marketOverviewEl.innerHTML = [
        card('Độ rộng thị trường', market.breadth_state, 'data_fitness'),
        card('Động lượng', market.momentum_state, 'data_fitness'),
        card('Độ bao phủ xu hướng', `${market.trend_state?.above_ma20 ?? 'Chưa có'} trên MA20 / ${market.trend_state?.at_or_below_ma20 ?? 'Chưa có'} tại/dưới`),
        card('Độ bao phủ kỹ thuật', `${cov.same_session_technical_feature_available_count ?? 'Chưa có'} / ${cov.current_active_equity_denominator ?? 'Chưa có'}`),
        card('Bối cảnh dòng tiền', flow ? (data.source?.session_coherence?.session === data.session ? 'PARTIAL' : 'UNAVAILABLE') : 'UNAVAILABLE', 'liquidity_state'),
        card('Vĩ mô', data.macro_context?.status, 'data_fitness')
      ].join('');
    }

    const marketWarningsEl = document.getElementById('market-warnings');
    if (marketWarningsEl) {
      marketWarningsEl.innerHTML = list([
        ...(market.data_quality_limitations || []).map(x => formatLabel(x)),
        ...(data.source?.warnings || []).map(x => formatLabel(x))
      ]);
    }

    const DEFAULT_VISIBLE_COHORT = 8;
    const cohorts = data.research_discovery?.cohorts || {};
    const cohortsEl = document.getElementById('cohorts');
    if (cohortsEl) {
      cohortsEl.innerHTML = Object.entries(cohorts).map(([name, v], idx) => {
        const sorted = [...(v.tickers || [])].sort();
        const total = sorted.length;
        const cohortId = `cohort-${idx}`;
        const cohortTitle = formatLabel(name, 'tactical_state');
        const initialChips = sorted.slice(0, DEFAULT_VISIBLE_COHORT).map(t => `<button type="button" class="cockpit-chip" data-ticker="${esc(t)}">${esc(t)}</button>`).join('');
        let extraMarkup = '';
        if (total > DEFAULT_VISIBLE_COHORT) {
          const remaining = total - DEFAULT_VISIBLE_COHORT;
          const extraChips = sorted.slice(DEFAULT_VISIBLE_COHORT).map(t => `<button type="button" class="cockpit-chip" data-ticker="${esc(t)}">${esc(t)}</button>`).join('');
          extraMarkup = `<span id="${cohortId}-extra" class="cockpit-chip-extra" hidden>${extraChips}</span><button type="button" class="cockpit-toggle-btn" aria-expanded="false" aria-controls="${cohortId}-extra" data-action="toggle-cohort" data-target="${cohortId}-extra" data-remaining="${remaining}">Xem thêm ${remaining} mã</button>`;
        }
        return `<div class="mb-3">
          <div class="d-flex align-items-center gap-2 mb-1">
            <b>${esc(cohortTitle)}</b> <span class="cockpit-state available">${total} mã</span>
          </div>
          <div class="cockpit-note">${esc(v.ordering ? 'sắp xếp theo mã, không phải xếp hạng' : '')}</div>
          <div class="cockpit-chip-row mt-1" id="${cohortId}-chips">
            ${initialChips}
            ${extraMarkup}
          </div>
        </div>`;
      }).join('');
    }

    const DEFAULT_VISIBLE_PRIORITY = 10;
    const review = data.research_discovery?.high_priority_review || {};
    const priorityReviewEl = document.getElementById('priority-review');
    if (priorityReviewEl) {
      const reviewSorted = [...(review.tickers || [])].sort();
      const reviewTotal = reviewSorted.length;
      const reviewInitial = reviewSorted.slice(0, DEFAULT_VISIBLE_PRIORITY).map(t => `<button type="button" class="cockpit-chip" data-ticker="${esc(t)}">${esc(t)}</button>`).join('');
      let reviewExtraMarkup = '';
      if (reviewTotal > DEFAULT_VISIBLE_PRIORITY) {
        const remaining = reviewTotal - DEFAULT_VISIBLE_PRIORITY;
        const reviewExtra = reviewSorted.slice(DEFAULT_VISIBLE_PRIORITY).map(t => `<button type="button" class="cockpit-chip" data-ticker="${esc(t)}">${esc(t)}</button>`).join('');
        reviewExtraMarkup = `<span id="priority-extra" class="cockpit-chip-extra" hidden>${reviewExtra}</span><button type="button" class="cockpit-toggle-btn" aria-expanded="false" aria-controls="priority-extra" data-action="toggle-cohort" data-target="priority-extra" data-remaining="${remaining}">Xem thêm ${remaining} mã</button>`;
      }
      priorityReviewEl.innerHTML = `
        <b>Nhóm ưu tiên xem xét: ${reviewTotal} mã</b>
        <div class="cockpit-note">${esc(review.meaning ? 'Ứng viên cho nghiên cứu có người kiểm tra, không phải cấu phần danh mục.' : '')}</div>
        <div class="cockpit-chip-row mt-2" id="priority-chips">
          ${reviewInitial}
          ${reviewExtraMarkup}
        </div>`;
    }

    const watch = (data.watchlist?.tickers || []).slice().sort();
    const watchCountEl = document.getElementById('watch-count');
    if (watchCountEl) watchCountEl.textContent = `${watch.length} mã`;

    const watchlistEl = document.getElementById('watchlist');
    if (watchlistEl) {
      watchlistEl.innerHTML = watch.map(t => {
        const c = (data.ticker_cards && data.ticker_cards[t]) || {},
          s = c.current_decision_state || {},
          st = c.strategy_fit || {},
          sc = c.scenario || {};
        return `<tr>
          <td><button type="button" class="cockpit-chip" data-ticker="${esc(t)}">${esc(t)}</button></td>
          <td>${state(s.entry_state, 'tactical_state')} ${state(s.entry_action, 'entry_action')}</td>
          <td>${state(st.status, 'data_fitness')}</td>
          <td>${state(st.scenario_relationship?.scenario_disposition, 'data_fitness')}</td>
          <td>${esc((c.why_it_is_on_radar?.deterministic_reasons || [])[0] || 'Chưa có dữ liệu')}<br><span class="cockpit-note">${esc((c.what_argues_against?.limitations || [])[0] || '')}</span></td>
          <td>${state(c.data_quality?.market_breadth_quality_state, 'data_fitness')}</td>
        </tr>`;
      }).join('');
    }

    const select = document.getElementById('ticker-select');
    const tickers = Object.keys(data.ticker_cards || {}).sort();
    if (select) {
      select.innerHTML = tickers.map(t => `<option value="${esc(t)}">${esc(t)}</option>`).join('');
    }

    const setTicker = t => {
      if (data.ticker_cards && data.ticker_cards[t]) {
        if (select) select.value = t;
        renderTicker(data, t);
        if (typeof location !== "undefined") {
          location.hash = 'ticker-research';
        }
      }
    };

    if (select) {
      select.addEventListener('change', () => setTicker(select.value));
    }
    bindInteractiveEvents(data, setTicker);

    const initialTicker = (typeof location !== "undefined" && location.hash === '#ticker-research' && select && data.ticker_cards && data.ticker_cards[select.value])
      ? select.value
      : (data.ticker_cards && data.ticker_cards.HPG ? 'HPG' : tickers[0]);
    if (initialTicker) {
      setTicker(initialTicker);
    }

    const portfolioRiskEl = document.getElementById('portfolio-risk');
    if (portfolioRiskEl) {
      portfolioRiskEl.innerHTML = `${state(data.portfolio_risk?.status, 'portfolio_state')}<div class="cockpit-note mt-2">${esc(formatLabel(data.portfolio_risk?.message) || data.portfolio_risk?.message || '')}</div>`;
    }

    const gapsEl = document.getElementById('gaps');
    if (gapsEl) {
      gapsEl.innerHTML = Object.entries(data.risk_data_gaps || {}).map(([k, v]) => card(formatLabel(k, 'risk_data_gaps'), v)).join('');
    }

    const verifyNextEl = document.getElementById('verify-next');
    if (verifyNextEl) {
      verifyNextEl.innerHTML = (data.what_to_verify_next || []).map(x => `<li>${esc(formatLabel(x) || x)}</li>`).join('');
    }

    const source = data.source || {};
    const inputRows = Object.entries(source.input_artifacts || {}).map(([k, v]) =>
      `<tr><td>${esc(formatLabel(k, 'axis_label') || k)}</td><td class="cockpit-code">${esc(v?.artifact_identity || 'Chưa có dữ liệu')}</td><td>${state(v?.freshness_state, 'freshness')}</td><td>${esc(unavailable(v?.session))}</td></tr>`
    ).join('');

    const lineageEl = document.getElementById('lineage-content');
    if (lineageEl) {
      lineageEl.innerHTML = `
        <div class="cockpit-warning mb-3">
          <div>Mã băm bảng kê (Manifest SHA-256): <span class="cockpit-code">${esc(source.operation_manifest_sha256)}</span></div>
          <div>Mã băm sản phẩm (Product SHA-256): <span class="cockpit-code">${esc(source.product_artifact_sha256)}</span></div>
        </div>
        <div class="table-responsive">
          <table class="cockpit-table">
            <thead>
              <tr>
                <th>Đầu vào</th>
                <th>Định danh dữ liệu</th>
                <th>Độ mới dữ liệu</th>
                <th>Phiên</th>
              </tr>
            </thead>
            <tbody>${inputRows}</tbody>
          </table>
        </div>
        <h6 class="mt-3">Tính nhất quán phiên</h6>
        <details class="vs-tech-details">
          <summary>Chi tiết kỹ thuật</summary>
          <pre class="cockpit-code">${esc(JSON.stringify(source.session_coherence || {}, null, 2))}</pre>
        </details>`;
    }
  }

  if (typeof fetch === "function") {
    fetch(URL, { cache: 'no-store' })
      .then(r => {
        if (!r.ok) throw Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(data => {
        if (data.schema_version !== 'current_decision_cockpit_projection/v2') throw Error('unsupported projection schema');
        render(data);
      })
      .catch(err => {
        if (typeof document !== "undefined") {
          const e = document.getElementById('cockpit-error');
          if (e) {
            e.hidden = false;
            e.textContent = `Không thể tải dữ liệu bàn quyết định (${err.message}). Dữ liệu cần được tạo từ Thao tác phiên nghiên cứu hàng ngày (Daily Research Session Operation); không sử dụng cơ chế dự phòng hoặc tự động dò tìm phiên gần nhất.`;
          }
        }
      });
  }

  return {
    render,
    renderTicker,
    formatLabel,
    state,
    list,
    card,
    bindInteractiveEvents,
  };
});
