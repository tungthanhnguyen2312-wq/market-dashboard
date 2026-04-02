const DATA_URL = "data.json";
const NOTES_URL = "manual-notes.json";

const el = {
  warNews: document.getElementById("war-news"),
  globalNews: document.getElementById("global-news"),
  vnNews: document.getElementById("vn-news"),
  marketGrid: document.getElementById("market-grid"),
  lastUpdated: document.getElementById("last-updated"),
  refreshBtn: document.getElementById("refresh-btn"),
  newsCounter: document.getElementById("news-counter"),
  marketCounter: document.getElementById("market-counter"),
  manualNotes: document.getElementById("manual-notes"),
  geminiKey: document.getElementById("gemini-key"),
  geminiModel: document.getElementById("gemini-model"),
  aiPrompt: document.getElementById("ai-prompt"),
  runAi: document.getElementById("run-ai"),
  aiStatus: document.getElementById("ai-status"),
  aiOutput: document.getElementById("ai-output"),
  rememberKey: document.getElementById("remember-key"),
};

function fmtText(value, fallback = "—") {
  return (value ?? "").toString().trim() || fallback;
}

function escapeHtml(str = "") {
  return str
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function classByChange(value) {
  if (value > 0) return "pos";
  if (value < 0) return "neg";
  return "neu";
}

function fmtNumber(value, digits = 2) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return "—";
  return Number(value).toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: digits,
  });
}

function fmtSigned(value, digits = 2) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return "—";
  const num = Number(value);
  const sign = num > 0 ? "+" : "";
  return `${sign}${num.toFixed(digits)}`;
}

function safeRender(targetEl, html) {
  if (!targetEl) return;
  targetEl.innerHTML = html;
}

function renderNews(list, targetEl, emptyText) {
  if (!targetEl) return;
  if (!Array.isArray(list) || !list.length) {
    safeRender(targetEl, `<div class="empty-state">${emptyText}</div>`);
    return;
  }

  safeRender(targetEl, list.map(item => {
    const source = escapeHtml(fmtText(item.source));
    const time = escapeHtml(fmtText(item.published_text));
    const titleVi = escapeHtml(fmtText(item.title_vi || item.title));
    const titleOriginal = escapeHtml(fmtText(item.title));
    const summary = escapeHtml(fmtText(item.summary_vi || item.summary, ""));
    const showOriginal = item.title_vi && item.title_vi !== item.title;
    const href = item.url || "#";

    return `
      <a class="news-card" href="${href}" target="_blank" rel="noopener noreferrer">
        <div class="news-topline">
          <span class="source-tag">${source}</span>
          <span class="time-tag">${time}</span>
        </div>
        <h3 class="news-title">${titleVi}</h3>
        ${summary ? `<p class="news-summary">${summary}</p>` : ""}
        ${showOriginal ? `<div class="original-line">Gốc: ${titleOriginal}</div>` : ""}
      </a>
    `;
  }).join(""));
}

function renderMarkets(list) {
  if (!el.marketGrid) return;
  if (!Array.isArray(list) || !list.length) {
    safeRender(el.marketGrid, `<div class="empty-state">Chưa có dữ liệu chỉ số.</div>`);
    return;
  }

  safeRender(el.marketGrid, list.map(item => {
    const cls = classByChange(item.change_pct);
    const suffix = item.suffix || "";
    return `
      <article class="market-card ${cls}">
        <div class="market-name">
          <span>${escapeHtml(fmtText(item.name))}</span>
          <span class="market-category">${escapeHtml(fmtText(item.category, ""))}</span>
        </div>
        <div class="market-price">${fmtNumber(item.price, item.decimals ?? 2)}${suffix}</div>
        <div class="market-change ${cls}">
          <span>${fmtSigned(item.change, item.decimals ?? 2)}${suffix}</span>
          <span>${fmtSigned(item.change_pct, 2)}%</span>
        </div>
        <div class="market-note">${escapeHtml(fmtText(item.note, "Dữ liệu gần nhất"))}</div>
      </article>
    `;
  }).join(""));
}

function renderNotes(list) {
  if (!el.manualNotes) return;
  if (!Array.isArray(list) || !list.length) {
    safeRender(el.manualNotes, `<div class="empty-state">Chưa có ghi chú thủ công. Sửa file <code>manual-notes.json</code> để thêm ghi chú riêng.</div>`);
    return;
  }

  safeRender(el.manualNotes, list.map(item => `
    <article class="note-item">
      <div class="note-item-title">
        <h3>${escapeHtml(fmtText(item.title, "Ghi chú"))}</h3>
        <span class="note-tag">${escapeHtml(fmtText(item.time, "Manual"))}</span>
      </div>
      <p>${escapeHtml(fmtText(item.text, ""))}</p>
    </article>
  `).join(""));
}

async function fetchJson(url) {
  const res = await fetch(`${url}?v=${Date.now()}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

async function loadDashboardData() {
  try {
    if (el.lastUpdated) el.lastUpdated.textContent = "Đang tải...";
    const [data, notes] = await Promise.all([
      fetchJson(DATA_URL),
      fetchJson(NOTES_URL).catch(() => ({ notes: [] })),
    ]);

    renderNews(data.war_news, el.warNews, "Chưa có tin chiến sự.");
    renderNews(data.global_news, el.globalNews, "Chưa có tin quốc tế nổi bật.");
    renderNews(data.vn_news, el.vnNews, "Chưa có tin Việt Nam.");
    renderMarkets(data.markets);
    renderNotes(notes.notes || []);

    const newsCount = (data.war_news?.length || 0) + (data.global_news?.length || 0) + (data.vn_news?.length || 0);
    if (el.newsCounter) el.newsCounter.textContent = String(newsCount);
    if (el.marketCounter) el.marketCounter.textContent = String(data.markets?.length || 0);
    if (el.lastUpdated) el.lastUpdated.textContent = data.updated_at_display || data.updated_at || "Không rõ";
  } catch (err) {
    console.error(err);
    safeRender(el.warNews, `<div class="empty-state">Không tải được dữ liệu tin chiến sự.</div>`);
    safeRender(el.globalNews, `<div class="empty-state">Không tải được dữ liệu tin quốc tế.</div>`);
    safeRender(el.vnNews, `<div class="empty-state">Không tải được dữ liệu tin Việt Nam.</div>`);
    safeRender(el.marketGrid, `<div class="empty-state">Không tải được dữ liệu chỉ số.</div>`);
    safeRender(el.manualNotes, `<div class="empty-state">Không tải được ghi chú thủ công.</div>`);
    if (el.lastUpdated) el.lastUpdated.textContent = "Lỗi tải dữ liệu";
    if (el.newsCounter) el.newsCounter.textContent = "0";
    if (el.marketCounter) el.marketCounter.textContent = "0";
  }
}

function loadSavedAiPrefs() {
  const savedKey = localStorage.getItem("dashboard_gemini_key");
  const savedPrompt = localStorage.getItem("dashboard_ai_prompt");
  const remember = localStorage.getItem("dashboard_remember_key") === "1";
  if (el.rememberKey) el.rememberKey.checked = remember;
  if (remember && savedKey && el.geminiKey) el.geminiKey.value = savedKey;
  if (savedPrompt && el.aiPrompt) el.aiPrompt.value = savedPrompt;
}

function persistAiPrefs() {
  if (!el.aiPrompt || !el.rememberKey || !el.geminiKey) return;
  localStorage.setItem("dashboard_ai_prompt", el.aiPrompt.value || "");
  if (el.rememberKey.checked) {
    localStorage.setItem("dashboard_remember_key", "1");
    localStorage.setItem("dashboard_gemini_key", el.geminiKey.value || "");
  } else {
    localStorage.setItem("dashboard_remember_key", "0");
    localStorage.removeItem("dashboard_gemini_key");
  }
}

async function runGemini() {
  const apiKey = el.geminiKey?.value?.trim() || "";
  const prompt = el.aiPrompt?.value?.trim() || "";
  const model = el.geminiModel?.value || "gemini-2.5-flash";

  if (!apiKey) {
    if (el.aiStatus) el.aiStatus.textContent = "Chưa nhập Gemini API key.";
    el.geminiKey?.focus();
    return;
  }
  if (!prompt) {
    if (el.aiStatus) el.aiStatus.textContent = "Chưa nhập prompt.";
    el.aiPrompt?.focus();
    return;
  }

  persistAiPrefs();
  if (el.aiStatus) el.aiStatus.textContent = "Đang gọi Gemini...";
  if (el.aiOutput) el.aiOutput.textContent = "";

  try {
    const body = { contents: [{ parts: [{ text: prompt }] }] };
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }
    );

    const data = await res.json();
    if (!res.ok) throw new Error(data?.error?.message || `Gemini request failed (${res.status})`);

    const text = data?.candidates?.[0]?.content?.parts?.map(p => p.text || "").join("\n").trim() || "Không có nội dung trả về.";
    if (el.aiOutput) el.aiOutput.textContent = text;
    if (el.aiStatus) el.aiStatus.textContent = "Hoàn tất.";
  } catch (err) {
    console.error(err);
    if (el.aiStatus) el.aiStatus.textContent = "Lỗi khi gọi Gemini.";
    if (el.aiOutput) el.aiOutput.textContent = err.message || "Đã xảy ra lỗi.";
  }
}

el.refreshBtn?.addEventListener("click", loadDashboardData);
el.runAi?.addEventListener("click", runGemini);
el.rememberKey?.addEventListener("change", persistAiPrefs);
el.geminiKey?.addEventListener("input", persistAiPrefs);
el.aiPrompt?.addEventListener("input", persistAiPrefs);

loadSavedAiPrefs();
loadDashboardData();
