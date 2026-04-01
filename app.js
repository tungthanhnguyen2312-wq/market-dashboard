const DATA_URL = "data.json";
const warNewsEl = document.getElementById("war-news");
const vnNewsEl = document.getElementById("vn-news");
const marketGridEl = document.getElementById("market-grid");
const lastUpdatedEl = document.getElementById("last-updated");
const refreshBtn = document.getElementById("refresh-btn");

const geminiKeyInput = document.getElementById("gemini-key");
const geminiModelSelect = document.getElementById("gemini-model");
const aiPromptInput = document.getElementById("ai-prompt");
const runAiBtn = document.getElementById("run-ai");
const aiStatusEl = document.getElementById("ai-status");
const aiOutputEl = document.getElementById("ai-output");
const rememberKeyEl = document.getElementById("remember-key");

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
    maximumFractionDigits: digits
  });
}

function fmtSigned(value, digits = 2) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return "—";
  const num = Number(value);
  const sign = num > 0 ? "+" : "";
  return `${sign}${num.toFixed(digits)}`;
}

function renderNews(list, targetEl, emptyText) {
  if (!Array.isArray(list) || !list.length) {
    targetEl.innerHTML = `<div class="empty-state">${emptyText}</div>`;
    return;
  }

  targetEl.innerHTML = list.map(item => {
    const source = fmtText(item.source);
    const time = fmtText(item.published_text);
    const titleVi = escapeHtml(fmtText(item.title_vi || item.title));
    const titleOriginal = escapeHtml(fmtText(item.title));
    const summary = escapeHtml(fmtText(item.summary_vi || item.summary, ""));
    const showOriginal = item.title_vi && item.title_vi !== item.title;
    const href = item.url || "#";

    return `
      <a class="news-card" href="${href}" target="_blank" rel="noopener noreferrer">
        <div class="news-meta">
          <span>${source}</span>
          <span>${time}</span>
        </div>
        <h3 class="news-title">${titleVi}</h3>
        ${summary ? `<p class="news-summary">${summary}</p>` : ""}
        ${showOriginal ? `<div class="original-line">Gốc: ${titleOriginal}</div>` : ""}
      </a>
    `;
  }).join("");
}

function renderMarkets(list) {
  if (!Array.isArray(list) || !list.length) {
    marketGridEl.innerHTML = `<div class="empty-state">Chưa có dữ liệu chỉ số.</div>`;
    return;
  }

  marketGridEl.innerHTML = list.map(item => {
    const cls = classByChange(item.change_pct);
    return `
      <article class="market-card ${cls}">
        <div class="market-name">
          <span>${escapeHtml(fmtText(item.name))}</span>
          <span>${escapeHtml(fmtText(item.symbol, ""))}</span>
        </div>
        <div class="market-price">${fmtNumber(item.price, item.decimals ?? 2)}</div>
        <div class="market-change ${cls}">
          <span>${fmtSigned(item.change, item.decimals ?? 2)}</span>
          <span>${fmtSigned(item.change_pct, 2)}%</span>
        </div>
        <div class="market-note">${escapeHtml(fmtText(item.note, "Dữ liệu gần nhất"))}</div>
      </article>
    `;
  }).join("");
}

async function loadDashboardData() {
  try {
    lastUpdatedEl.textContent = "Đang tải...";
    const res = await fetch(`${DATA_URL}?v=${Date.now()}`, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    renderNews(data.war_news, warNewsEl, "Chưa có tin chiến sự.");
    renderNews(data.vn_news, vnNewsEl, "Chưa có tin Việt Nam.");
    renderMarkets(data.markets);
    lastUpdatedEl.textContent = data.updated_at_display || data.updated_at || "Không rõ";
  } catch (err) {
    console.error(err);
    warNewsEl.innerHTML = `<div class="empty-state">Không tải được dữ liệu tin chiến sự.</div>`;
    vnNewsEl.innerHTML = `<div class="empty-state">Không tải được dữ liệu tin Việt Nam.</div>`;
    marketGridEl.innerHTML = `<div class="empty-state">Không tải được dữ liệu chỉ số.</div>`;
    lastUpdatedEl.textContent = "Lỗi tải dữ liệu";
  }
}

function loadSavedAiPrefs() {
  const savedKey = localStorage.getItem("dashboard_gemini_key");
  const savedPrompt = localStorage.getItem("dashboard_ai_prompt");
  const remember = localStorage.getItem("dashboard_remember_key") === "1";

  rememberKeyEl.checked = remember;
  if (remember && savedKey) geminiKeyInput.value = savedKey;
  if (savedPrompt) aiPromptInput.value = savedPrompt;
}

function persistAiPrefs() {
  localStorage.setItem("dashboard_ai_prompt", aiPromptInput.value || "");
  if (rememberKeyEl.checked) {
    localStorage.setItem("dashboard_remember_key", "1");
    localStorage.setItem("dashboard_gemini_key", geminiKeyInput.value || "");
  } else {
    localStorage.setItem("dashboard_remember_key", "0");
    localStorage.removeItem("dashboard_gemini_key");
  }
}

async function runGemini() {
  const apiKey = geminiKeyInput.value.trim();
  const prompt = aiPromptInput.value.trim();
  const model = geminiModelSelect.value;

  if (!apiKey) {
    aiStatusEl.textContent = "Chưa nhập Gemini API key.";
    geminiKeyInput.focus();
    return;
  }
  if (!prompt) {
    aiStatusEl.textContent = "Chưa nhập prompt.";
    aiPromptInput.focus();
    return;
  }

  persistAiPrefs();
  aiStatusEl.textContent = "Đang gọi Gemini...";
  aiOutputEl.textContent = "";

  try {
    const body = {
      contents: [{ parts: [{ text: prompt }] }]
    };

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      }
    );

    const data = await res.json();

    if (!res.ok) {
      const msg = data?.error?.message || `Gemini request failed (${res.status})`;
      throw new Error(msg);
    }

    const text =
      data?.candidates?.[0]?.content?.parts?.map(p => p.text || "").join("\n").trim() ||
      "Không có nội dung trả về.";

    aiOutputEl.textContent = text;
    aiStatusEl.textContent = "Hoàn tất.";
  } catch (err) {
    console.error(err);
    aiStatusEl.textContent = "Lỗi khi gọi Gemini.";
    aiOutputEl.textContent = err.message || "Đã xảy ra lỗi.";
  }
}

refreshBtn.addEventListener("click", loadDashboardData);
runAiBtn.addEventListener("click", runGemini);
rememberKeyEl.addEventListener("change", persistAiPrefs);
geminiKeyInput.addEventListener("input", persistAiPrefs);
aiPromptInput.addEventListener("input", persistAiPrefs);

loadSavedAiPrefs();
loadDashboardData();
