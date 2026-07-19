# FRONTEND_UX_PLAN.md — Kế hoạch Progressive UX Enhancement

> Phiên phân tích read-only 2026-07-16. File này là ĐẦU RA DUY NHẤT của phiên phân tích.
> Phiên thực thi đọc file này và làm từng task theo thứ tự ở mục 5.
> Nguyên tắc bất di bất dịch: KHÔNG rewrite kiến trúc, KHÔNG thêm framework/state mới
> (không Alpine/Vue/React), KHÔNG thay DataTables, KHÔNG để tồn tại 2 cách triển khai
> cho cùng 1 chức năng. Stack giữ nguyên: JS thuần + jQuery + DataTables + Chart.js +
> Bootstrap 5 (CSS) + Tailwind (khung sườn) + Lucide.

## 1. Executive summary

Frontend là site tĩnh 7 trang chính + 7 báo cáo lịch sử đóng băng, kiến trúc lành mạnh:
token màu tập trung ở `style.css`, khung sườn `shell.css`/`shell.js` dùng chung, dữ liệu 100%
local (KHÔNG có API key lộ, KHÔNG có CORS proxy — cả 2 nghi vấn đều BÁC BỎ có bằng chứng).
Hai vấn đề production thật sự: (1) **Tailwind Play CDN chạy JIT trong browser trên cả 7 trang
chính** — xác nhận có bằng chứng; (2) **fallback `.js` tải kép dữ liệu**, nặng nhất là
signals.html nhúng `data/candlestick_patterns.js` **13,5 MB** mỗi lượt xem song song với fetch
JSON cùng nội dung. Kế hoạch: Tầng 1 vá 2 vấn đề trên + hợp nhất helper/state trùng lặp +
polish (tokens, tabular-nums, a11y, URL/localStorage); Tầng 2 thêm tương tác nâng cao
(presets, watchlist, command palette) chỉ sau khi Tầng 1 nghiệm thu.

## 2. Bảng kiểm kê kiến trúc (Phase 0 — đã đọc thật từng file)

Frontend root = repo root. `index.html` chỉ là redirect thuần sang `dashboard.html`
(index.html:7,15) — không đánh giá kiến trúc dựa trên nó.

| File | Vai trò | Thư viện | Vấn đề phát hiện |
|---|---|---|---|
| `dashboard.html` (300 dòng) | Trang chính: KPI, 2 chart, screener dạng card, báo cáo AI | Bootstrap CSS, DataTables 2.1.8, jQuery 3.7.1, PapaParse, marked, Chart.js 4.4.3, Tailwind Play CDN, lucide@latest | Play CDN (:35); lucide không pin version (:285); 13 inline style (đa số skeleton height); tải kép `data/screener_data.js` 916 KB (:295) + fetch CSV (app.js:621) |
| `screener.html` (270 dòng) | Bảng lọc 16 cột + breadth ngành; script inline ~110 dòng | Như trên | Play CDN (:31); bản `esc()`/`num()`/`VI` language riêng (:179–185) trùng chức năng app.js; tải kép screener_data.js (:156); hex cứng `#03080A` (:50) |
| `analysis.html` (287 dòng) | Trang Quant, ~60 dòng CSS riêng (an-table, opp-card, shimmer `:empty`) | Tailwind Play CDN, lucide (KHÔNG jQuery/DataTables/Chart.js) | Play CDN (:32); hex cứng `#64748b` (:80); skeleton cơ chế riêng `:empty` (:84–95) khác `vs-skeleton` |
| `signals.html` (269 dòng) | Tín hiệu nến/SMC + tab mẫu hình nến; script inline ~70 dòng | Tailwind Play CDN, lucide | Play CDN (:23); **nhúng `data/candlestick_patterns.js` 13,5 MB (:192) + candle_signals.js 311 KB (:190)** rồi vẫn fetch JSON; tự reset `* { margin:0... }` (:46); bảng dùng style cục bộ khác chuẩn site; hex cứng (:70, :247); bản `esc()`/`fmt()` riêng (:204–206) |
| `macro.html` (185 dòng) | Dashboard vĩ mô | Chart.js, Tailwind Play CDN, lucide | Play CDN (:24); KHÔNG load `value-format.js` → macro.js phải tự hard-code màu chart; tải kép macro_snapshot.js 375 KB (:181) |
| `archive.html` (111 dòng) | Kho báo cáo lịch sử | Tailwind Play CDN, lucide | Play CDN (:24); danh sách báo cáo ghi tay trong archive.js |
| `about.html` (142 dòng) | Giới thiệu | Tailwind Play CDN, lucide | Play CDN (:24); tuyên bố "Không build step" (:110) sẽ cần sửa chữ sau UX-01 |
| `index.html` (20 dòng) | Redirect → dashboard | — | Không có vấn đề |
| `style.css` (681 dòng) | Design system: token :root (:10–61), card/kpi/badge/chip/vs-datatable/report-content | — | Token tốt, tabular-nums đã phủ kpi/badge/bảng; sót hex `#fbe9c2`/`#fde68a` (:566,570) |
| `assets/css/shell.css` (669 dòng) | Khung sườn: sidebar/topbar/footer + vs-* component (btn, select, alert, skeleton, empty, error, status-chip, modal, tabs, resize) | — | `.vs-status-chip` (:271–295) và `.vs-error` (:352–366) **định nghĩa nhưng 0 nơi dùng** (grep toàn *.html/*.js: no matches); hex `#fbe9c2`/`#fde68a` (:476,479) |
| `assets/css/macro.css` (320 dòng) | Style trang macro | — | Hex `#fbe9c2`/`#ffd2d9` (:90–91); còn lại dùng token đúng |
| `assets/css/candlestick-patterns.css` (59 dòng) | Style tab mẫu hình nến | — | Sạch; đã có mẫu ẩn cột mobile `optional-sm/md` |
| `nav.css` (98 dòng) | Legacy — CHỈ còn 7 báo cáo tĩnh dùng | — | Giữ nguyên (đúng như docs/ARCHITECTURE.md:114) |
| `app.js` (662 dòng) | Logic dashboard: AI report, KPI, charts, screener card + DataTables engine ẩn | marked, PapaParse, DataTables, Chart.js | `Chart.defaults` set cục bộ trong `renderCharts()` (:281–284); error state dùng Bootstrap `.alert` (:99, :649) thay vì `vs-alert`; filter không có URL/localStorage state |
| `analysis.js` (385 dòng) | Render trang Quant từ `analysis_latest.json`, chống trang trắng theo từng card | — | Bản `esc()`/`fmt()` riêng (:11–15); không có URL state cho accordion/explain |
| `assets/js/shell.js` (80 dòng) | Active link, sidebar drawer + collapse (localStorage) | lucide | Sạch |
| `assets/js/value-format.js` (60 dòng) | Helper dùng chung: `signClass()`, `normalizeExchange()`, `CHART_COLORS` | — | Đúng hướng nhưng chưa gom hết: `esc`/`num`/`fmt` vẫn 7 bản rải rác; macro.html chưa load file này |
| `assets/js/company-panel.js` (198 dòng) | Panel chi tiết mã 3 tab, focus trap, dùng chung screener + signals | Chart.js, jQuery (đọc instance DataTables) | Bản `esc()`/`num()` riêng (:17–19); class màu `up/down/flat` riêng (:20) thay vì `signClass()` |
| `assets/js/resizable-panels.js` (99 dòng) | Kéo giãn 2 cột, localStorage, có keyboard | — | Sạch |
| `assets/js/macro.js` (485 dòng) | Render trang macro, validate schema, fallback file:// | Chart.js | Hex cứng: COLORS (:10), ticks `#789096` (:236,245), legend `#a8bcc1` (:319) — không dùng CHART_COLORS vì trang không load value-format.js |
| `assets/js/archive.js` (124 dòng) | Danh sách báo cáo ghi tay + tìm kiếm + chip quý | — | `ARCHIVE_ITEMS` ghi tay (:14–22) — CHANGELOG_UI.md:134 đã đề xuất `reports_manifest.json` |
| `assets/js/candlestick-patterns.js` (243 dòng) | Tab mẫu hình nến: filter/sort/localStorage/hash tab | — | Chuẩn mực tốt nhất repo (validate schema, stale check :233, localStorage key `stocklookup:*`, hash tab :194–196) — dùng làm mẫu cho các task state |
| `data/*.js` fallback | Dữ liệu nhúng cho chế độ mở file:// | — | **Tải kép trên production**: candlestick_patterns.js 13,5 MB; screener_data.js 916 KB; macro_snapshot.js 375 KB; candle_signals.js 311 KB |
| `playbook-*.html`, `report-*.html`, `vn_*.html` (7 file, 2.587 dòng) | Báo cáo lịch sử ĐÓNG BĂNG (archive.html:78 ghi rõ không chỉnh sửa) | Tailwind Play CDN, Chart.js 4.4.1 (cloudflare), nav.css | 4 file playbook-04-0x cùng boilerplate head/style (JetBrains Mono, badge-ok/warn/err) → có cơ sở cho template hóa BÁO CÁO TƯƠNG LAI (INT-08); KHÔNG sửa 7 file cũ |

**Cấu hình DataTables hiện có (3 bảng, KHÔNG thay):**
- `#market-table` (app.js:514): engine ẩn cho card list (`aria-hidden`, display none qua style.css:609); pageLength 15, lengthMenu [10,15], order rs_rating desc, language `DT_LANG_VI` (app.js:61).
- `#tblScreen` (screener.html:218): 16 cột; pageLength 15, lengthMenu [10,15,25], order cột 5 desc, language `VI` inline (screener.html:183) — **trùng chức năng với DT_LANG_VI**.
- `#tblBreadth` (screener.html:250): paging/searching/info đều false.

**`new Chart(` trong code sống: 4 điểm** — app.js:304 (bar ngành), app.js:346 (doughnut cấu trúc), company-panel.js:72 (bar hiệu suất), macro.js:309 (line, lặp theo 6 nhóm). `Chart.defaults` chung: **chưa có file riêng** — chỉ set cục bộ tại app.js:281–284.

**Loading/error/empty hiện có 4 cơ chế song song:** `vs-skeleton` (dashboard/screener HTML), shimmer `:empty` CSS riêng (analysis.html:84–95), `.empty` div (signals.html:56), `macro-skeleton-card`+`macro-notice` (macro.html:101,115); lỗi thì nơi dùng Bootstrap `.alert.alert-warning` (app.js:99), nơi dùng `.vs-alert` (screener.html:202, analysis.html:150).

## 3. Bảng chẩn đoán (Phase 1)

### 3 nghi vấn bắt buộc — kết luận có bằng chứng

| Nghi vấn | Kết luận | Bằng chứng |
|---|---|---|
| (a) API key lộ client-side | **BÁC BỎ** | `grep -rin "apikey\|api_key\|key=\|authorization\|bearer\|gemini\|token"` trên *.html/*.js/*.css chỉ khớp giả: `data-resize-key` (dashboard.html:113, analysis.html:184), chữ "token màu" trong comment (shell.css:371, signals.html:40). Không có secret nào. |
| (b) Phụ thuộc CORS proxy dễ chết | **BÁC BỎ** | Toàn bộ 8 điểm `fetch(` đều là đường dẫn tương đối local: app.js:83,146,607,621; analysis.js:368; signals.html:199; screener.html:163; candlestick-patterns.js:58. Không có corsproxy/allorigins. Chuỗi "yahoo" chỉ xuất hiện làm `source_url` metadata trong data/macro_snapshot.js:167–357, render thành link ngoài qua `safeExternalUrl()` (macro.js:39–45), không bao giờ fetch. |
| (c) Tailwind Play CDN ở production | **XÁC NHẬN** | `https://cdn.tailwindcss.com` trong 7 trang sống: dashboard.html:35, screener.html:31, analysis.html:32, signals.html:23, macro.html:24, archive.html:24, about.html:24 (+5 báo cáo tĩnh đóng băng: playbook-*.html:7, report-2026-04-21.html:7 — không sửa). |

### Các phát hiện khác

| Dữ kiện (grep evidence) | Suy luận | Giả định | Rủi ro |
|---|---|---|---|
| signals.html:190–192 nhúng `candle_signals.js` (311 KB) + `candlestick_patterns.js` (**13.561.280 byte**) bằng `<script>` không điều kiện, rồi script vẫn fetch JSON cùng nội dung (signals.html:256–257, candlestick-patterns.js:58) | Mỗi lượt xem signals tải ~14 MB (trước gzip) dù online; fallback chỉ cần khi mở file:// | GitHub Pages có gzip nhưng JSON số liệu nén còn lớn; chưa đo transfer thật | **Cao** — thời gian tải + parse JS chặn main thread trên mobile |
| dashboard.html:295 + screener.html:156 nhúng `screener_data.js` (916 KB); macro.html:181 nhúng `macro_snapshot.js` (375 KB) — cùng mô hình tải kép | Như trên, mức độ nhẹ hơn | — | Trung bình |
| Play CDN = compiler JIT chạy trong browser; config inline lặp 7 lần (dashboard.html:36–48 và 6 trang kia) | Chậm first paint, console warning production, phụ thuộc CDN thứ 3 cho LAYOUT khung sườn (flex/grid utilities) — CDN chết là vỡ khung | Không có SLA cho cdn.tailwindcss.com | **Cao** |
| `lucide@latest` không pin version (dashboard.html:285, screener.html:147, analysis.html:281, signals.html:187, macro.html:180, archive.html:107, about.html:139) | Bản major mới của lucide có thể đổi API `createIcons` bất kỳ lúc nào | unpkg redirect `@latest` không cache dài | Trung bình |
| 7 bản `esc()` (app.js:74, analysis.js:11, screener.html:181, signals.html:206, company-panel.js:17, candlestick-patterns.js:7, archive.js:27), ~5 bản `num()`/`fmt()`, 2 bản ngôn ngữ VI DataTables (app.js:61, screener.html:183), company-panel tự viết `valueSignClass` (company-panel.js:20) dù đã có `signClass()` | Vi phạm nguyên tắc "1 chức năng 1 cách triển khai" ở tầng helper; sửa quy tắc hiển thị phải sửa 7 chỗ | Các bản esc() có khác nhau nhỏ (có/không escape `"` `'`) — khi gom phải lấy bản đầy đủ nhất | Trung bình (maintenance) |
| Chart theme phân mảnh: app.js:281–284 set `Chart.defaults` cục bộ; macro.js:236,245,319 hex cứng; macro.html KHÔNG load value-format.js (macro.html:179–183) | Đổi màu token phải sửa tay ở ≥3 nơi; macro chart sẽ lệch tông khi redesign token | — | Trung bình |
| `.vs-status-chip` + `.vs-error` định nghĩa (shell.css:271–295, 352–366) nhưng grep *.html/*.js: **0 nơi dùng** | Component "mồ côi" — hoặc nối dây dùng thật (UX-07) hoặc là dead CSS | — | Thấp |
| Sidebar + topbar lặp nguyên khối ~25 dòng × 7 trang (dashboard.html:55–72, screener.html:61–78, analysis.html:116–133, signals.html:78–95, macro.html:43–60, archive.html:43–60, about.html:43–60) | Thêm 1 mục menu = sửa 7 file, dễ lệch | Đây là trade-off CÓ CHỦ ĐÍCH của kiến trúc không-build (HTML tĩnh, no-JS vẫn có nav) | Thấp–trung bình; xem Câu hỏi mở #2, KHÔNG tự ý đổi cơ chế |
| Hex cứng ngoài token: analysis.html:80 (`#64748b`), signals.html:70 (`#0d1117`), signals.html:247 (bộ 3 màu heatmap), screener.html:50 (`#03080A`), shell.css:476,479 + macro.css:90–91 + style.css:566,570 (`#fbe9c2`/`#fde68a`/`#ffd2d9`), macro.js:10,236,245,319; value-format.js:53–59 là hex CÓ CHỦ ĐÍCH (canvas không đọc được var()) nhưng phải sync tay với style.css | Redesign token (như đợt 14/07) sẽ sót các điểm này | — | Thấp |
| Inline style 43 chỗ trong 7 trang sống (dashboard 13, screener 10, signals 7, archive 5, analysis 4, about 3, macro 1) — đa số là height skeleton, width kpi-bar (JS set), vị trí nút đóng sidebar | Mức độ NHẸ, không phải khủng hoảng; chỉ gom những mẫu lặp (skeleton height, nút close sidebar lặp 7 trang cùng inline style) | — | Thấp |
| signals.html:46 tự reset `* { box-sizing;margin;padding }` + bảng/heading style cục bộ (:52–56) khác chuẩn `.vs-datatable`/`.an-table` | Trang signals nhìn "cũ" hơn phần còn lại; reset `*` may mắn chưa phá shell vì load sau nhưng là bom hẹn giờ đặc hiệu | — | Trung bình |
| URL state: chỉ tab signals có hash (candlestick-patterns.js:194–196); localStorage: sidebar (shell.js:57), resize (resizable-panels.js:36), filter nến (candlestick-patterns.js:171) — screener/dashboard filter thì KHÔNG có gì | Không share được link "screener đã lọc"; F5 mất bộ lọc | — | Thấp (tính năng thiếu, không phải lỗi) |

## 4. Backlog checklist (self-contained cho phiên thực thi)

Quy ước chung cho MỌI task: giữ nguyên hành vi hiện có trừ điểm được nêu; comment tiếng Việt;
mỗi task 1 commit riêng; sau mỗi task mở đủ 7 trang qua `python -m http.server` kiểm tra
console 0 lỗi mới; localStorage key mới phải theo tiền tố `stocklookup:` (theo mẫu
candlestick-patterns.js:171). KHÔNG đụng 7 file báo cáo tĩnh (`playbook-*`, `report-*`,
`vn_*`), KHÔNG đụng `nav.css`, KHÔNG đổi `index.html`.

### TẦNG 1 — UX Polish (baseline để release)

- [ ] **UX-01 | 7 trang HTML | Gỡ Tailwind Play CDN → CSS build sẵn commit vào repo** · Effort: **L** · Rủi ro: trung bình (regression layout) · Phụ thuộc: quyết Câu hỏi mở #1
  - Cách làm đề xuất: dùng **Tailwind CLI standalone** (binary, chạy 1 lần offline, KHÔNG thêm node_modules): tạo `tailwind.config.js` tạm với `content: ["*.html", "assets/js/*.js", "app.js", "analysis.js"]` + đúng phần `theme.extend` đang inline (colors map sang var(), fontFamily Inter), `corePlugins: { preflight: false }` → sinh `assets/css/tailwind.css` đã minify, commit file sinh ra.
  - Trong 7 trang (dashboard, screener, analysis, signals, macro, archive, about): xóa `<script src="https://cdn.tailwindcss.com"></script>` + block `tailwind.config = {...}` inline, thay bằng `<link rel="stylesheet" href="assets/css/tailwind.css?v=...">` đặt TRƯỚC shell.css; xóa `<link rel="preconnect" href="https://unpkg.com">` nếu trang không còn dùng unpkg cho thứ khác (lucide vẫn unpkg — giữ preconnect).
  - Ghi vào docs/ARCHITECTURE.md + about.html đoạn "Không build step" (about.html:110): sửa thành "không build step lúc publish; CSS Tailwind được build sẵn 1 lần khi đổi class".
  - Nghiệm thu: `grep -rn "cdn.tailwindcss.com" *.html` chỉ còn khớp 5 file báo cáo tĩnh; 7 trang so khớp bằng mắt (sidebar collapse, drawer mobile, grid 2 cột, lg:/xl: breakpoints) không lệch; console không còn warning Play CDN.

- [ ] **UX-02 | 7 trang HTML | Pin version lucide** · Effort: **S** · Rủi ro: thấp · Phụ thuộc: không
  - Đổi `https://unpkg.com/lucide@latest` → phiên bản cụ thể (kiểm tra version hiện hành mà `createIcons()` chạy đúng, ví dụ `lucide@0.460.0/dist/umd/lucide.min.js` — PHẢI mở trang xác nhận icon render trước khi chốt).
  - Nghiệm thu: `grep -rn "lucide@latest" *.html` = 0 (trừ báo cáo tĩnh nếu có); icon hiển thị đủ trên 7 trang.

- [ ] **UX-03 | assets/js/value-format.js + macro.html + app.js + macro.js | Chart.js global theme dùng chung** · Effort: **M** · Rủi ro: thấp · Phụ thuộc: không
  - Thêm vào value-format.js hàm `applyChartTheme()`: gói đúng 4 dòng `Chart.defaults` đang nằm ở app.js:281–284 (color = CHART_COLORS.text, font family/size, borderColor = CHART_COLORS.grid) + `Chart.defaults.plugins.tooltip` nền `CHART_COLORS.surface`, chữ `--text` tương ứng; guard `if (!window.Chart) return;`.
  - Mở rộng `CHART_COLORS` thêm: `series` (mảng 5 màu hiện ở macro.js:10), `tickText` (`#789096` macro.js:236), `legendText` (`#a8bcc1` macro.js:319) — kèm comment "sync tay với style.css".
  - app.js: thay 4 dòng :281–284 bằng `applyChartTheme()`. macro.js: gọi `applyChartTheme()` đầu `renderCharts`, thay COLORS/hex bằng `CHART_COLORS.*`. macro.html: thêm `<script src="assets/js/value-format.js?v=..." defer>` TRƯỚC macro.js (macro.html:181–183).
  - Nghiệm thu: `grep -n "Chart.defaults" app.js assets/js/*.js` chỉ còn trong value-format.js; `grep -n "#789096\|#a8bcc1" assets/js/macro.js` = 0; 4 chart dashboard/macro/panel giữ nguyên diện mạo.

- [ ] **UX-04 | style.css, shell.css, macro.css, analysis.html, signals.html, screener.html | Tokenize hex sót lại** · Effort: **S** · Rủi ro: thấp · Phụ thuộc: không
  - Thêm token mới vào style.css `:root`: `--warning-text: #fbe9c2; --warning-code: #fde68a; --danger-text-soft: #ffd2d9; --flat: #64748b;` (giá trị giữ NGUYÊN hex hiện tại — chỉ đặt tên).
  - Thay tại: style.css:566,570; shell.css:476,479; macro.css:90–91; analysis.html:80 (`.updown-bar .f` → var(--flat)); screener.html:50 (`#03080A` → var(--bg-deep)); signals.html:70 (`#0d1117` → var(--bg-deep)); signals.html:247 (3 hex heatmap → `var(--success)/var(--warning)/var(--danger)` — giá trị trùng khớp sẵn 27E6A1/F0C45A/FF5D73).
  - Nghiệm thu: `grep -n "#fbe9c2\|#fde68a\|#ffd2d9\|#64748b\|#0d1117\|#03080A" style.css assets/css/*.css analysis.html signals.html screener.html` chỉ còn ở khai báo :root; diện mạo không đổi.

- [ ] **UX-05 | assets/js/value-format.js + app.js, analysis.js, screener.html, signals.html, company-panel.js, candlestick-patterns.js, archive.js | Hợp nhất helper trùng lặp** · Effort: **M** · Rủi ro: trung bình (đụng 7 file) · Phụ thuộc: không
  - Thêm vào value-format.js: `vsEsc()` (bản ĐẦY ĐỦ nhất — escape cả `"` và `'` như candlestick-patterns.js:7), `vsNum(v, d)` (bản locale vi-VN trả "–" khi nil như company-panel.js:18), `DT_LANG_VI` (hợp nhất app.js:61 + screener.html:183 — giữ đủ key của cả hai).
  - Từng file: xóa bản cục bộ, trỏ về helper chung. CHÚ Ý các khác biệt hiển thị nil hiện có ("–" vs "·" vs "—") phải giữ NGUYÊN từng nơi — chỉ gom phần logic trùng, nơi nào hiển thị khác thì bọc tại chỗ. company-panel.js:20 `valueSignClass` trả "up/down/flat" cho class cục bộ — thay bằng `signClass()` CHỈ KHI đổi luôn class trong template panel sang `.val-pos/.val-neg` (kiểm tra CSS panel không phụ thuộc `.up/.down`).
  - Trang nào dùng helper phải load value-format.js trước (archive.html hiện KHÔNG load — thêm vào, hoặc bỏ archive.js ra khỏi scope task này nếu muốn giảm rủi ro).
  - Nghiệm thu: `grep -rn "const esc = \|const esc=\|function esc(" app.js analysis.js *.html assets/js/*.js` chỉ còn 1 định nghĩa trong value-format.js; toàn bộ bảng/panel/watchlist render đúng như trước (so sánh bằng mắt từng trang).

- [ ] **UX-06 | app.js, signals.html, analysis.html | Thống nhất loading/error/empty theo bộ vs-*** · Effort: **M** · Rủi ro: thấp · Phụ thuộc: UX-05 (nên làm sau)
  - app.js:98–104 và :648–653: thay markup Bootstrap `.alert.alert-warning` bằng `.vs-alert.vs-alert-warning` (shell.css:473 đã có sẵn, đúng chuẩn screener.html:202 đang dùng).
  - signals.html `.empty` (:56, dùng tại :118,121,125,128): giữ class cục bộ nhưng đổi style cho khớp tông `vs-empty` (border dashed giữ, thêm icon không bắt buộc) — HOẶC thay markup sang `vs-empty` nếu diff nhỏ. Chọn phương án ít dòng hơn.
  - analysis.html shimmer `:empty` (:84–95): GIỮ NGUYÊN cơ chế (thông minh, tự tắt) — chỉ đối chiếu màu/radius với `vs-skeleton` cho cùng tông (đang cùng var — khả năng không phải sửa gì, xác nhận rồi ghi chú).
  - Nghiệm thu: chặn mạng (DevTools offline) mở dashboard/analysis/screener/signals → mọi hộp lỗi cùng 1 kiểu vs-alert; `grep -n "alert alert-warning" app.js` = 0.

- [ ] **UX-07 | assets/js/shell.js (hoặc value-format.js) + dashboard.html, screener.html, signals.html, macro.html | Nối dây `.vs-status-chip`: freshness + stale warning** · Effort: **M** · Rủi ro: thấp · Phụ thuộc: không
  - Hiện `.vs-status-chip` (shell.css:271–295) chưa dùng ở đâu. Viết helper nhỏ `vsFreshnessChip(sessionDateISO)`: so `market_session`/`scan_date` với hôm nay (múi giờ VN): ≤1 ngày làm việc → `is-live` "Phiên DD/MM"; 2–7 ngày → `is-stale` "Cũ N ngày"; >7 ngày hoặc thiếu → `is-offline` "Chưa có dữ liệu" (ngưỡng 7 ngày theo mẫu có sẵn candlestick-patterns.js:233).
  - Gắn vào topbar meta các trang: dashboard `#market-last-updated` (app.js:601), screener `#meta` (screener.html:209), signals `#meta` (signals.html:262), macro đã có `#macro-status` riêng — chỉ thêm chip nếu không phá layout, không thì bỏ macro ra khỏi scope.
  - Nghiệm thu: mở trang với dữ liệu hiện tại → chip đúng trạng thái; giả lập stale (sửa tay ngày trong DevTools/console) → chip đổi màu đúng ngưỡng.

- [ ] **UX-08 | signals.html | Phủ tabular-nums cho số liệu signals** · Effort: **S** · Rủi ro: rất thấp · Phụ thuộc: không
  - Thêm `font-variant-numeric: tabular-nums;` vào rule `table` (signals.html:52) và `.card .px` (:62), `.pattern-kpi strong` đã có (candlestick-patterns.css:12 — không đụng).
  - Nghiệm thu: cột Giá/RS/RelVol bảng hợp lưu và card watchlist thẳng hàng số.

- [ ] **UX-09 | signals.html | Đồng bộ diện mạo bảng signals với chuẩn site (CSS-only)** · Effort: **M** · Rủi ro: trung bình (CSS cục bộ trang) · Phụ thuộc: UX-08
  - KHÔNG sửa JS render. Chỉ sửa block `<style>` (:39–73): bỏ reset `* {...}` (:46) thay bằng reset phạm vi hẹp cho phần tử trang này thực dùng (kiểm tra bằng mắt sau khi bỏ); đổi style `table/th/td` (:52–54) theo tông `.an-table` của analysis.html:51–58 (nền header var(--surface-head), chữ uppercase muted, border-bottom thay vì border full).
  - Nghiệm thu: bảng hợp lưu/cổ tức nhìn cùng họ với bảng analysis; drawer sidebar + topbar không vỡ (kiểm tra kỹ vì bỏ reset `*`); mobile ổn.

- [ ] **UX-10 | screener.html (script inline) + app.js + company-panel.js | URL hash state cho filter + deep-link mã** · Effort: **M** · Rủi ro: trung bình · Phụ thuộc: không
  - Quy ước hash chung dạng `#key=value&key2=value2` (đọc bằng `URLSearchParams` trên chuỗi sau `#`), cập nhật bằng `history.replaceState` (không spam history).
  - dashboard (app.js): serialize `activeQuickFilters` + exchange + industry + sort → hash; đọc hash lúc init (sau khi table sẵn sàng) và áp lại. screener.html: `cleanOnly` + search text của DataTables. company-panel.js: khi `openPanel(row)` set `ticker=XXX`, khi close thì xóa; lúc load trang nếu có `ticker=` → tìm row trong dữ liệu đã load rồi mở panel.
  - KHÔNG đụng hash tab của signals (candlestick-patterns.js:194 dùng hash trần `#candlestick-patterns`) — trang signals nằm ngoài scope task này để tránh 2 cơ chế hash đá nhau trên cùng trang.
  - Nghiệm thu: bật 2 chip lọc + chọn ngành trên dashboard → copy URL mở tab mới → đúng trạng thái; mở `screener.html#ticker=HPG` → panel HPG tự mở.

- [ ] **UX-11 | app.js + screener.html | localStorage nhớ filter (ưu tiên URL > localStorage > mặc định)** · Effort: **M** · Rủi ro: thấp · Phụ thuộc: UX-10
  - Key: `stocklookup:dashboard-filters`, `stocklookup:screener-filters`. Lưu đúng bộ state đã serialize ở UX-10; ghi khi thay đổi (theo mẫu saveFilters/restoreFilters của candlestick-patterns.js:166–180, có try/catch storage disabled).
  - Nghiệm thu: đặt filter, F5 không hash → giữ nguyên; có hash → hash thắng; xóa localStorage → về mặc định.

- [ ] **UX-12 | signals.html, screener.html, dashboard.html, macro.html | Fallback file:// chuyển sang nạp động — cắt tải kép (signals đang ~14 MB/lượt)** · Effort: **M** · Rủi ro: trung bình · Phụ thuộc: quyết Câu hỏi mở #3
  - Viết helper chung `loadFallbackScript(src, globalName)` (đặt ở value-format.js): tạo `<script>` động, resolve khi onload, trả `window[globalName]`.
  - Từng trang: XÓA thẻ `<script src="data/*.js">` tĩnh (signals.html:190–192, screener.html:156, dashboard.html:295, macro.html:181 — GIỮ `data/build_info.js` vì bé 1 KB và app.js đọc `window.BUILD_INFO` sớm); trong nhánh `catch` của `loadCsv`/`loadData`/`loadSnapshot`/`loadMarketTable` hiện có → gọi `loadFallbackScript` rồi mới đọc `window[globalName]`. Logic so sánh phiên fallback cũ (screener.html:171–175, app.js:634–638) giữ nguyên, chỉ dời xuống sau khi script nạp xong.
  - CHÚ Ý: mở file:// fetch fail NGAY nên fallback vẫn nạp gần như tức thì — kiểm tra cả 2 chế độ.
  - Nghiệm thu: (1) qua http.server: tab Network KHÔNG tải screener_data.js/candlestick_patterns.js/candle_signals.js/macro_snapshot.js/sector_heatmap.js; signals giảm từ ~14 MB về kích thước JSON thật; (2) mở file:// double-click: mọi trang vẫn hiện dữ liệu như trước.

- [ ] **UX-13 | style.css + screener.html + dashboard.html | Table density mode (thoáng/gọn)** · Effort: **M** · Rủi ro: thấp · Phụ thuộc: UX-11
  - CSS: thêm biến `--table-pad-y: 0.42rem;` dùng trong `.vs-datatable tbody td` (style.css:394) + `.an-table tbody td`; class `body.density-compact { --table-pad-y: 0.25rem; }` kèm giảm font 1 nấc.
  - UI: nút toggle `vs-icon-btn` trên topbar screener (icon `rows-2`/`rows-4`), lưu `stocklookup:density`, shell.js đọc và gắn class lên body mọi trang.
  - Nghiệm thu: toggle đổi mật độ tức thì trên #tblScreen/#tblBreadth/bảng analysis; F5 và sang trang khác giữ trạng thái.

- [ ] **UX-14 | screener.html | Mobile table UX cho #tblScreen** · Effort: **M** · Rủi ro: trung bình · Phụ thuộc: không
  - Theo mẫu ĐÃ CÓ của pattern-table (signals.html:171–172 dùng class `optional-sm/optional-md` + candlestick-patterns.css): gắn class ẩn-theo-breakpoint cho các cột thứ yếu của #tblScreen qua `columns[].className` (DataTables hỗ trợ sẵn — không plugin): ẩn dưới 768px các cột RSI, RelVol, %từ đỉnh 52w, P/B, Room%, giữ Mã/Giá/%Phiên/RS/GTGD/Cờ; thêm `position: sticky; left: 0` cho cột Mã trong vùng `table-responsive`.
  - Nghiệm thu: 375px width — bảng đọc được không phải cuộn ngang quá 1 màn hình, cột Mã dính trái, mở panel chi tiết bằng chạm vẫn chạy.

- [ ] **UX-15 | signals.html, candlestick-patterns.js, screener.html, app.js | Accessibility pass** · Effort: **M** · Rủi ro: thấp · Phụ thuộc: không
  - `aria-sort` cập nhật động trên th có `.pattern-sort` (candlestick-patterns.js:206 khi đổi sortKey); roving arrow-key cho `.signal-tab` (Left/Right chuyển tab — đã có role/aria-selected sẵn signals.html:110–113); `aria-live="polite"` cho `#table-status` (dashboard.html:195) và `#meta` screener; thêm `aria-label` cho 2 canvas dashboard (mẫu đã có ở macro.js:279–280); kiểm tra focus-visible đã phủ (shell.css:499–509 — chỉ xác nhận).
  - Nghiệm thu: đi hết dashboard + signals chỉ bằng bàn phím (tab/enter/mũi tên): mở panel, đổi tab, sort bảng đều được; VoiceOver/NVDA đọc trạng thái sort.

- [ ] **UX-16 | app.js (COLUMN_LABELS/buildColumns) + screener.html columns | Tooltip giải thích chỉ số** · Effort: **S** · Rủi ro: rất thấp · Phụ thuộc: không
  - Thêm map `COLUMN_HINTS` (value-format.js hoặc app.js): RS → "Relative Strength 1–99 so toàn thị trường", RelVol, GTGD20, BB %B, ATR %, %từ đỉnh 52T, Cấu trúc, F-proxy… Gắn `title` vào th qua DataTables `columns[].title` (bọc `<span title>`) ở cả app.js:buildColumns và screener.html:220–238. Mẫu title đã có sẵn ở signals.html:168.
  - Nghiệm thu: hover header các cột chỉ số hiện giải thích tiếng Việt; không vỡ sort.

### TẦNG 2 — Advanced Interaction (CHỈ làm sau khi Tầng 1 nghiệm thu)

- [ ] **INT-01 | screener.html + app.js | Saved screener presets** · Effort: **M** · Rủi ro: thấp · Phụ thuộc: UX-10, UX-11
  - UI chip-row "Preset của tôi": nút "Lưu bộ lọc hiện tại" (prompt tên) → serialize state UX-10 vào `stocklookup:screener-presets` (mảng {name, state}); click preset áp lại; nút xóa từng preset. Không giới hạn số nhưng render tối đa 8.
  - Nghiệm thu: lưu 2 preset khác nhau, F5, áp lại đúng từng bộ; xóa được.

- [ ] **INT-02 | screener.html | Ẩn/hiện cột #tblScreen** · Effort: **M** · Rủi ro: thấp · Phụ thuộc: UX-14
  - Dùng API sẵn có `table.column(i).visible(bool)` của DataTables (KHÔNG cài extension ColVis) — tự render dropdown checkbox nhóm cột (Kỹ thuật/Cơ bản/Thanh khoản như CHANGELOG_UI.md:131 đã phác); lưu `stocklookup:screener-columns`.
  - Nghiệm thu: tắt nhóm "Cơ bản" → P/E,P/B,ROE,Room ẩn; F5 giữ; reset về đủ cột.

- [ ] **INT-03 | app.js + screener.html + value-format.js | Watchlist cục bộ (localStorage)** · Effort: **M** · Rủi ro: thấp · Phụ thuộc: UX-05
  - Nút sao trên screener-record card (dashboard) + cột đầu #tblScreen; lưu `stocklookup:watchlist` (mảng ticker); chip lọc "★ Watchlist" thêm vào QUICK_FILTERS (app.js:446) + filter tương tự cleanOnly ở screener. KHÔNG trộn với watchlist AI (id #watchlist từ báo cáo) — đặt tên UI "Mã đã ghim" để phân biệt.
  - Nghiệm thu: ghim 3 mã ở dashboard → chip lọc chỉ còn 3 mã; sang screener.html thấy cùng trạng thái ghim.

- [ ] **INT-04 | app.js (renderCards) | Mini-bar hiệu suất 1/3/6/12 tháng trong screener card** · Effort: **S** · Rủi ro: thấp · Phụ thuộc: không
  - Trong group "Hiệu suất" (app.js:547): thêm thanh `mini-bar` (CSS đã có style.css/analysis.html mẫu) tô theo `signClass`, scale |ret| max 50%. CHỈ ở card dashboard — không thêm vào bảng screener (tránh phình DOM 1.700 dòng × 4 cột).
  - Nghiệm thu: card hiển thị 4 thanh đúng hướng/màu; bảng screener KHÔNG đổi.

- [ ] **INT-05 | company-panel.js | So sánh mã (pin tối đa 3)** · Effort: **L** · Rủi ro: trung bình · Phụ thuộc: UX-05
  - Nút "Ghim để so sánh" trong panel; khi ≥2 mã được pin → tab thứ 4 "So sánh" render bảng chỉ số cạnh nhau (stat-grid hiện có làm mẫu) từ dữ liệu rows đã load, KHÔNG fetch mới. Pin lưu trong session (không cần localStorage).
  - Nghiệm thu: pin 2 mã từ screener, tab So sánh hiện 2 cột chỉ số; unpin cập nhật ngay.

- [ ] **INT-06 | analysis.js | Shareable analysis URL** · Effort: **S** · Rủi ro: thấp · Phụ thuộc: UX-10 (dùng chung quy ước hash)
  - Hash `#strategy=canslim` mở đúng accordion chiến lược (details[open]), `#explain=TICKER` mở sẵn dòng giải thích trong Top 20; cập nhật hash khi user mở.
  - Nghiệm thu: gửi link kèm hash → mở đúng accordion/dòng explain, scroll tới vị trí.

- [ ] **INT-07 | assets/js/ mới: command-palette.js + 7 trang | Command palette / tìm mã toàn cục (Ctrl+K)** · Effort: **L** · Rủi ro: trung bình · Phụ thuộc: UX-12 (nguồn dữ liệu), UX-05
  - JS thuần: overlay input + danh sách gợi ý từ nguồn dữ liệu screener (fetch screen_snapshot.csv 1 lần, cache sessionStorage); Enter → nếu đang ở trang có company-panel thì mở panel, không thì điều hướng `screener.html#ticker=XXX`. Kèm vài lệnh điều hướng trang ("> Screener", "> Macro"…). Load sau cùng, không chặn render.
  - Nghiệm thu: Ctrl+K từ MỌI trang → gõ "hpg" → Enter mở đúng hồ sơ HPG; Esc đóng; không lỗi khi CSV chưa sẵn sàng.

- [ ] **INT-08 | file mới: playbook-template.html + data/reports/*.json + reports_manifest.json + archive.js | Template + JSON cho báo cáo tĩnh TƯƠNG LAI** · Effort: **M** · Rủi ro: thấp · Phụ thuộc: quyết Câu hỏi mở #4
  - Căn cứ discovery: 4 file playbook-2026-04-0x.html dùng chung boilerplate head/style (JetBrains Mono + badge-ok/warn/err + doughnut Chart.js inline) — đủ bằng chứng "nhiều báo cáo cùng cấu trúc" NHƯNG tất cả là nội dung lịch sử đóng băng (archive.html:78). Vậy: KHÔNG đụng 7 file cũ; tạo 1 template `playbook.html?date=YYYY-MM-DD` (hoặc hash) đọc `data/reports/YYYY-MM-DD.json` cho báo cáo MỚI kể từ nay; đồng thời sinh `reports_manifest.json` từ pipeline publish (ý tưởng đã ghi ở CHANGELOG_UI.md:134) để archive.js (:14 ARCHIVE_ITEMS ghi tay) đọc manifest, fallback mảng tay nếu thiếu.
  - KHÔNG dùng Alpine hay bất kỳ lib mới nào — render bằng JS thuần theo mẫu analysis.js.
  - Nghiệm thu: thêm 1 JSON mẫu → archive tự liệt kê, template render đủ khối (nhận định, kịch bản, bảng mã); 7 báo cáo cũ nguyên vẹn từng byte.

## 5. Thứ tự thực thi + định nghĩa baseline

**Đợt 1 — vá nhanh, an toàn (không chờ quyết định):** UX-02 → UX-04 → UX-08 → UX-16.
**Đợt 2 — nền tảng production (cần trả lời Câu hỏi mở #1, #3 trước):** UX-01 → UX-12.
**Đợt 3 — hợp nhất nội bộ:** UX-03 → UX-05 → UX-06 → UX-07 → UX-09.
**Đợt 4 — state & polish:** UX-10 → UX-11 → UX-13 → UX-14 → UX-15.
→ **RELEASE BASELINE** ← sau đó mới xét Tầng 2 theo thứ tự: INT-04 → INT-01 → INT-02 → INT-03 → INT-06 → INT-05 → INT-07 → INT-08.

**Định nghĩa "baseline ổn định để release" (điều kiện cần, đo được):**
1. `grep -rn "cdn.tailwindcss.com" dashboard.html screener.html analysis.html signals.html macro.html archive.html about.html` = 0.
2. Tab Network trang signals qua http.server: tổng transfer < 2 MB (hiện ~14 MB); không request nào tới data/*.js trừ build_info.js.
3. Console 0 error, 0 warning Tailwind trên cả 7 trang (online) và 0 error khi mở file:// (fallback vẫn chạy).
4. `Chart.defaults` chỉ định nghĩa 1 nơi; `esc/num/DT lang VI` chỉ 1 bản; hex ngoài `:root`/CHART_COLORS = 0 (trừ index.html + báo cáo tĩnh).
5. Loading/error/empty cùng họ vs-* trên 7 trang; mọi trang có freshness chip hoặc dòng meta phiên rõ ràng.
6. Điều hướng được toàn site chỉ bằng bàn phím; filter chính sống sót qua F5 (localStorage) và share được qua URL.

## 6. Câu hỏi mở — chủ dự án quyết TRƯỚC khi code

1. **Đường build Tailwind (UX-01):** đề xuất phương án A — chạy Tailwind CLI standalone thủ công 1 lần khi đổi class, commit `assets/css/tailwind.css` (giữ đúng triết lý "không build step lúc publish"); phương án B — thêm bước build vào `sync_and_publish.bat` (tự động nhưng thêm phụ thuộc binary trên máy local). Chọn A hay B?
2. **Sidebar lặp 7 trang:** giữ HTML tĩnh như hiện tại (đề xuất — no-JS vẫn có nav, menu ít thay đổi) hay chuyển sang shell.js render từ 1 mảng config (bớt lặp nhưng nav phụ thuộc JS)? Nếu giữ tĩnh: chấp nhận quy trình "sửa menu = sửa 7 file".
3. **Fallback file:// (UX-12):** vẫn cần mở dashboard bằng double-click không qua http.server chứ? Nếu KHÔNG cần nữa → có thể bỏ hẳn cơ chế fallback .js (đơn giản hơn nạp động). Kế hoạch hiện viết theo hướng VẪN CẦN (nạp động khi fetch fail).
4. **Báo cáo tĩnh dạng playbook còn được phát hành tiếp không?** Có → làm INT-08 (template + JSON + manifest). Không → bỏ INT-08, chỉ giữ archive như hiện tại.
5. **Ngưỡng freshness (UX-07):** đề xuất live ≤1 ngày làm việc / stale 2–7 ngày / offline >7 ngày — có khớp nhịp chạy pipeline thực tế của bạn không (thấy commit "Auto update" nhiều lần/ngày)?

---
*Phiên thực thi sẽ chạy bằng Sonnet, đọc FRONTEND_UX_PLAN.md, làm từng task theo thứ tự.*
