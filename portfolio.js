(() => {
  const key = "stocklookup.portfolio-research.v1";
  let model = JSON.parse(localStorage.getItem(key) || '{"portfolio_id":"local-portfolio","cash":0,"positions":[]}');
  const $ = (id) => document.getElementById(id);

  const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  const COLORS = [
    "#20e7cf", "#27e6a1", "#f0c45a", "#7dd3fc", "#a78bfa", "#f472b6", "#fb923c", "#38bdf8", "#4ade80",
  ];

  function renderAllocation() {
    const body = $("allocation-body");
    if (!body) return;
    const positions = Array.isArray(model.positions) ? model.positions : [];
    if (!positions.length) {
      body.innerHTML = '<div class="cockpit-note">Chưa có vị thế nào trong danh mục. Hãy thêm vị thế ở bảng trên.</div>';
      return;
    }

    const hasWeights = positions.some((p) => p.explicit_weight != null && p.explicit_weight > 0);
    const hasQuantitiesOnly = positions.every((p) => p.explicit_weight == null || p.explicit_weight === 0);

    if (hasQuantitiesOnly) {
      body.innerHTML = `
        <div class="vs-alert vs-alert-warning mb-0">
          <b>Chưa có tỷ trọng định giá</b>
          <p class="mb-0 mt-1">Danh mục hiện chỉ lưu khối lượng (quantity-only). Việc tính toán tỷ trọng phân bổ chính xác đòi hỏi giá trị vốn hóa theo giá thị trường (mark-to-market) từ pipeline đánh giá của Producer hoặc phiên nghiên cứu hiện hành.</p>
        </div>
      `;
      return;
    }

    let totalWeight = 0;
    const items = positions.map((p, i) => {
      const w = Number(p.explicit_weight) || 0;
      const normalizedW = w <= 1.0 ? w * 100 : w;
      totalWeight += normalizedW;
      return {
        ticker: p.ticker,
        weight: normalizedW,
        rawWeight: w,
        color: COLORS[i % COLORS.length],
      };
    });

    const isOverallocated = totalWeight > 100.5;
    const cash = Number(model.cash) || 0;

    body.innerHTML = `
      <div class="mb-2 d-flex justify-content-between align-items-center">
        <span class="cockpit-note">Tổng tỷ trọng cổ phiếu đã nhập: <b>${totalWeight.toFixed(1)}%</b>${isOverallocated ? ' <span class="badge-soft bs-red">Vượt 100%</span>' : ""}</span>
        ${cash > 0 ? `<span class="cockpit-note">Tiền mặt: <b>${cash.toLocaleString("vi-VN")} VND</b></span>` : ""}
      </div>
      <div class="portfolio-weight-bar mb-3">
        ${items.map((item) => {
          const widthPct = Math.min(100, Math.max(2, (item.weight / Math.max(100, totalWeight)) * 100));
          return `<div class="portfolio-weight-segment" style="width: ${widthPct}%; background: ${item.color};" title="${esc(item.ticker)}: ${item.weight.toFixed(1)}%">
            ${esc(item.ticker)} ${item.weight.toFixed(1)}%
          </div>`;
        }).join("")}
      </div>
      <div class="d-flex flex-wrap gap-2">
        ${items.map((item) => `
          <div class="cockpit-chip d-flex align-items-center gap-1">
            <span style="width: 8px; height: 8px; border-radius: 50%; background: ${item.color}; display: inline-block;"></span>
            <b>${esc(item.ticker)}</b>: ${item.weight.toFixed(1)}%
          </div>
        `).join("")}
      </div>
    `;
  }

  const render = () => {
    $("portfolio-id").value = model.portfolio_id || "";
    $("cash").value = model.cash || 0;
    const posList = Array.isArray(model.positions) ? model.positions : [];
    const countEl = $("pos-count");
    if (countEl) countEl.textContent = `${posList.length} vị thế`;

    $("positions").innerHTML = posList.map((p, i) => {
      const isWeight = p.explicit_weight != null;
      const basisLabel = isWeight ? "Tỷ trọng xác định" : "Khối lượng";
      const valStr = isWeight
        ? (Number(p.explicit_weight) <= 1.0 ? `${(Number(p.explicit_weight) * 100).toFixed(1)}%` : `${p.explicit_weight}%`)
        : Number(p.quantity).toLocaleString("vi-VN");
      return `<tr>
        <td><b class="font-monospace">${esc(p.ticker)}</b></td>
        <td><span class="cockpit-note">${esc(basisLabel)}</span></td>
        <td><span class="fw-bold">${esc(valStr)}</span></td>
        <td class="text-end">
          <button type="button" class="btn btn-sm btn-outline-danger" data-remove="${i}" title="Remove">Xóa</button>
        </td>
      </tr>`;
    }).join("");

    renderAllocation();
  };

  $("portfolio-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const ticker = $("ticker").value.trim().toUpperCase();
    const value = Number($("amount").value);
    if (!ticker || !Number.isFinite(value) || value < 0) return;
    const basis = $("basis").value;
    model.positions = Array.isArray(model.positions) ? model.positions : [];
    model.positions.push({ ticker, [basis]: value });
    $("ticker").value = "";
    $("amount").value = "";
    render();
  });

  $("positions").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-remove]");
    if (!btn) return;
    const i = btn.dataset.remove;
    if (i !== undefined) {
      model.positions.splice(Number(i), 1);
      render();
    }
  });

  $("save").onclick = () => {
    model.portfolio_id = $("portfolio-id").value;
    model.cash = Number($("cash").value) || 0;
    localStorage.setItem(key, JSON.stringify(model));
    const status = $("save-status");
    if (status) {
      status.style.display = "block";
      setTimeout(() => { status.style.display = "none"; }, 3000);
    }
  };

  $("export").onclick = () => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([JSON.stringify(model, null, 2)], { type: "application/json" }));
    a.download = `portfolio-${model.portfolio_id || "local"}.json`;
    a.click();
  };

  $("import").onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const x = JSON.parse(reader.result);
        const payload = x.portfolio_research_context || x;
        if (!Array.isArray(payload.positions)) throw Error();
        model = payload;
        render();
      } catch (err) {
        alert("JSON danh mục không hợp lệ");
      }
    };
    reader.readAsText(file);
  };

  $("clear").onclick = () => {
    if (!confirm("Bạn có chắc chắn muốn đặt lại danh mục về trống?")) return;
    model = { portfolio_id: "local-portfolio", cash: 0, positions: [] };
    localStorage.removeItem(key);
    render();
  };

  render();
})();
