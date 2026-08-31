(() => {
  "use strict";
  const esc = (value) => String(value ?? "—").replace(/[&<>"']/g, (c) => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]));
  const countBy = (cards, field) => Object.values(cards || {}).reduce((counts, card) => {
    const value = card[field] || "UNAVAILABLE"; counts[value] = (counts[value] || 0) + 1; return counts;
  }, {});
  const chip = (label, total) => `<a class="chip" href="analysis.html">${esc(label)} · ${total}</a>`;
  const target = () => document.getElementById("current-product-summary");
  fetch("data/investment_decision_workspace.json", {cache:"no-store"}).then((response) => {
    if (!response.ok) throw new Error(`HTTP ${response.status}`); return response.json();
  }).then((workspace) => {
    if (workspace.schema_version !== "investment_decision_workspace_dashboard_projection/v1" || !workspace.cards) throw new Error("invalid workspace schema");
    const denominator = Object.keys(workspace.cards).length;
    if (!denominator) throw new Error("empty workspace corpus");
    const stances = countBy(workspace.cards, "research_stance");
    target().innerHTML = `<p class="mb-2">Phiên quyết định retained: <strong>${esc(workspace.as_of_session)}</strong> · ${denominator.toLocaleString("vi-VN")} decision cards. Nghiên cứu stance không phải lệnh thực hiện.</p><div class="chip-row mb-3">${Object.entries(stances).sort().map(([stance, total]) => chip(stance, total)).join("")}</div><div class="d-flex flex-wrap gap-2"><a class="vs-btn" href="analysis.html">So sánh các trục nghiên cứu →</a><a class="vs-btn" href="signals.html">Xem Tactical V2 →</a><a class="vs-btn" href="screener.html">Lọc rồi mở Decision Card →</a><a class="vs-btn" href="portfolio.html">Danh mục local →</a></div>`;
  }).catch((error) => { target().innerHTML = `<div class="vs-alert vs-alert-warning mb-0">CURRENT_PRODUCT_ARTIFACT_NOT_PUBLISHED: ${esc(error.message)}. Investment Workspace remains the required product entry point when its artifact is available.</div>`; });
})();
