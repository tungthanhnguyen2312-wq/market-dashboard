# Project Health Audit — Stock Look Up

> **HISTORICAL SNAPSHOT — 2026-07-19.** Describes a pre-migration, single-repository "VNSTOCK"
> checkout and does not reflect the current repository structure or the Producer/Consumer/
> Dashboard split. Preserved for historical record only; not current authority. Current project
> state lives in the Producer repository's `docs/STATE.md`.

**Ngày khảo sát:** 2026-07-19 (Asia/Saigon)  
**Phạm vi:** worktree tại commit `eb8e7e50460d3ed103865f27f3ff17b26987401d` (`origin/main` cùng commit), gồm 116 file được Git track và 22 script Python local bị ignore có chủ đích.  
**Kết luận:** `NEEDS_FIXES`  
**Trạng thái nghiệm thu audit:** `PASS` — Claude Sonnet đã review độc lập; sai lệch về kết quả test được sửa trong vòng phản hồi duy nhất này.

## 1. Tóm tắt điều hành

VNSTOCK hiện là hai hệ thống đặt cạnh nhau:

1. **Pipeline local, không phát hành trong Git:** các script Python thu thập OHLCV, metadata, vĩ mô, tin tức, cổ đông, BCTC; tính chỉ báo/quant/AI; sau đó sinh snapshot. Database, dữ liệu nguồn và hầu hết `*.py` bị `.gitignore` theo chủ đích.
2. **Website tĩnh được Git track:** 7 trang chính (`dashboard`, `screener`, `analysis`, `signals`, `macro`, `about`, `archive`) đọc CSV/JSON qua HTTP và phần lớn có JS fallback khi mở `file://`. Site được thiết kế cho GitHub Pages từ branch `main`, thư mục root.

Phần frontend và data contract đã ở mức tương đối hoàn chỉnh: JavaScript/JSON hợp lệ, link nội bộ không thiếu, JSON/JS fallback chính đồng bộ, snapshot có schema rõ, và suite local pass 133 test (1 skip). Tuy nhiên project **chưa sẵn sàng cho polish/release audit** vì hai chặn P1:

- entrypoint publish được tài liệu hóa không tồn tại, trong khi batch legacy được track vẫn tự `git add .`, commit và push;
- publisher “dry-run” thực tế ghi/copy artifact và sửa version trong HTML, trái mô tả “chỉ in danh sách”;

Không tìm thấy bằng chứng P0 trong lần audit này. Điều đó không đồng nghĩa pipeline dữ liệu đã được chứng minh an toàn toàn diện: database `vn_stock.db` không có trong bản copy nên không thể kiểm tra transaction/recovery thực tế.

## 2. Kiến trúc và luồng hoạt động hiện tại

```text
Nguồn ngoài (vnstock/VCI/KBS, FRED, Yahoo, World Bank, RSS)
  -> các sync script local
  -> vn_stock.db (OHLCV, metadata, macro, news, shareholders, history)
  -> vn_indicators.py
       -> screen_snapshot.csv + market_breadth.csv
  -> macro_sync.py
       -> macro_snapshot.csv (local) + data/macro_snapshot.json/.js (web)
  -> candle_scan.py + candlestick_patterns.py
       -> ta_signals.* (local) + data/candle_signals.*, sector_heatmap.*,
          candlestick_patterns.* (web)
  -> stock_analyzer.py
       -> analysis_latest.json (web) + analysis_latest.md/watchlist_history (local)
  -> ai_analyzer.py
       -> ai_report_YYYYMMDD.* (local) -> ai_report_latest.* (web)
  -> publish_dashboard.py
       -> validate/copy/build manifest/version asset -> Git stage/commit/push khi --live
  -> GitHub Pages (site tĩnh ở root)

Nhánh độc lập theo quý:
bctc_sync.py -> data_bctc/* -> bctc_processor.py/snapshot_rebuild.py
             -> financial_snapshot.csv/.parquet (local, không lên web)
```

### Ranh giới quan trọng

- `vn_stock.db`, `data_bctc/`, `financial_snapshot.*`, `reports/`, `ta_signals.*`, `news_latest.csv`, `macro_snapshot.csv`, `blacklist.csv`, `tickers*.txt`, `config.json` và Python pipeline là tài sản local; ignore là chủ đích.
- `screen_snapshot.csv`, `market_breadth.csv`, `analysis_latest.json`, `ai_report_latest.*` và `data/*` cần cho frontend được track.
- `analysis.html` chỉ dùng `fetch("analysis_latest.json")`, không có fallback `file://`; đây là giới hạn đã được tài liệu hóa.
- `publish_dashboard.py` là publisher canonical theo tài liệu nhưng bản thân file bị ignore, nên không có trong checkout public thuần.

## 3. Trạng thái thành phần

### Đã hoàn thành hoặc hoạt động tốt

| Thành phần | Bằng chứng |
|---|---|
| Frontend 7 trang + redirect | `index.html` redirect sang `dashboard.html`; 7 trang chính dùng chung `assets/css/shell.css` và `assets/js/shell.js`; 15/15 trang HTML được kiểm tra không có asset/link nội bộ bị thiếu. |
| Loader dữ liệu web | `app.js`, `analysis.js`, `assets/js/macro.js`, `assets/js/candlestick-patterns.js` có HTTP fetch và các fallback phù hợp; 15 file JS qua `node --check`. |
| Snapshot/schema public | `screen_snapshot.csv` có 1.578 dòng, 31 cột; `market_breadth.csv` có 20 dòng, 9 cột; toàn bộ JSON khảo sát parse được. |
| Fallback JSON/JS | Các cặp `candlestick_patterns`, `macro_snapshot`, `candle_signals`, `sector_heatmap` có payload tương đương khi parse. |
| Quant output contract | `analysis_latest.json` có đúng 8 key top-level đã mô tả trong `AI_CONTEXT.md`. |
| Guard/mapping/test fixtures | `config/`, `tests/fixtures/`, test regression cho missing data, schema guard, financial mapping, OCF, news và shareholder đều hiện diện trong Git. |
| An toàn secret cơ bản | Không tìm thấy pattern AWS key, Anthropic key thực, GitHub token hay private-key header trong file tracked. Hai match `ANTHROPIC_API_KEY` là placeholder/hướng dẫn trong `.env.example` và `docs/USER_GUIDE.md`. |
| Link tài liệu | Không có Markdown file-link nội bộ bị thiếu trong phép kiểm tra tồn tại file. |

### Đang dang dở

| Thành phần | Bằng chứng / hệ quả |
|---|---|
| Test/release automation | Không có `.github/workflows/`, `pyproject.toml`, `tox.ini`, `package.json` hoặc config test/lint tập trung; `docs/RELEASE_CHECKLIST.md` vẫn để Tests ở trạng thái chưa hoàn thành. |
| Frontend build tái lập | `assets/css/tailwind.generated.css` được track nhưng `build_frontend.bat` và Tailwind CLI không tồn tại; `.gitignore` ignore cả `tools/`. Site hiện chạy được vì dùng artifact đã sinh, nhưng không có lệnh build CSS tái lập trong checkout. |
| Company financial UI | `docs/RELEASE_CHECKLIST.md` xác nhận tab BCTC trong `company-panel.js` mới hiển thị “đang chờ dữ liệu”; dữ liệu BCTC cố tình không public. |
| Archive automation | `assets/js/archive.js` dùng danh sách ghi tay; báo cáo mới không tự xuất hiện. Đây là giới hạn static hosting đã biết. |
| Roadmap quant/data | `CHANGELOG.md`: backtester chưa có, analyzer chưa được đưa vào lịch hằng ngày, ROA/D-E chưa có, trọng số score chưa backtest. |
| Release verification | Không có smoke test browser/CI hay bằng chứng máy đọc được về lần Pages deploy gần nhất. |

### Lỗi thời, trùng lặp hoặc lệch tài liệu

| Khu vực | Dấu hiệu |
|---|---|
| `sync_and_push.bat` | Được gọi là legacy nhưng vẫn track và vẫn chạy `git pull origin main`, `git add .`, commit, `git push origin main`; mô tả “chỉ còn dùng bước copy” không đúng với hành vi. |
| `sync_and_publish.bat` | README, `AI_CONTEXT.md` và `.env.example` coi đây là wrapper hiện hành, nhưng file không tồn tại và không bị ignore. |
| Publisher dry-run | `docs/CLI_REFERENCE.md` nói dry-run “chỉ in danh sách file sẽ đẩy”; code gọi `copy_public_artifacts()`, `write_build_manifest()` và `update_asset_versions()` trước khi kiểm tra `--live`, nên có thể sửa file tracked cả ở dry-run. |
| Tài liệu test | `docs/RELEASE_CHECKLIST.md` chỉ nói `test_selftest.py`/7 test; repo hiện có 13 file `test_*.py`, 139 hàm `test_`, và unittest discover thực thi 133 test. `CHANGELOG.md` mục “Hạn chế đã biết” vẫn nói chưa có test tự động. |
| Số lượng file | `AI_CONTEXT.md` ghi 114 file tracked; thực tế là 116 tại commit audit. |
| Shell HTML | Sidebar/topbar lặp nguyên văn ở 7/7 trang chính. `shell.js/css` gom hành vi/style nhưng chưa có template/build layer để gom markup. |
| Legacy data/UI | `data/candle_signals.*` được giữ song song với `data/candlestick_patterns.*`; `nav.css` chỉ phục vụ báo cáo archive. Cả hai là compatibility legacy có chủ đích, chưa phải dead code. |
| Mô tả data directory | `docs/ARCHITECTURE.md` nói các data artifact có JSON + JS, nhưng `data/screener_data.js` không có bản JSON; frontend thực tế ưu tiên CSV và dùng JS fallback, nên chức năng vẫn đúng nhưng mô tả quá rộng. |

## 4. Kết quả kiểm tra thực tế

### Test Python

Lệnh bắt buộc đã chạy:

```powershell
python -m unittest discover tests
```

Kết quả trong venv sẵn có của project (`[local path redacted]\.venv`, pandas 2.3.3, numpy 2.2.6): **PASS**, `Ran 133 tests in 5.281s`, `OK (skipped=1)`.

- Không có error hoặc failure; log từ `bctc_processor.py` và các `FutureWarning` từ `candlestick_patterns.py` xác nhận các nhánh dùng pandas/numpy đã thực thi.
- Đếm tĩnh trong 13 file test cho thấy 139 hàm `test_`; số định nghĩa tĩnh không tương ứng một-một với số case unittest thực thi, và chênh lệch này không phải import failure.
- Nếu dùng Python 3.13 hệ thống thay cho venv project, lệnh chỉ discover được 41 test rồi gặp 8 import error vì interpreter đó không có pandas/numpy. Đây là khác biệt interpreter, không phải kết quả đại diện cho suite trong môi trường project.
- Toàn bộ 43 file Python được kiểm tra bằng `ast.parse`: 0 lỗi cú pháp.

Rủi ro tái lập còn lại nằm ở ranh giới repo: nhiều test tracked import các module root như `bctc_processor`, `candlestick_patterns`, `stock_analyzer`, trong khi `.gitignore` loại toàn bộ root `*.py`. Checkout GitHub thuần vì vậy không có code cần để chạy suite, dù suite trong worktree local hiện xanh. Đây là vấn đề bảo trì/reproducibility của checkout public, không phải bằng chứng suite hiện tại thất bại.

### Build/kiểm tra frontend

Không có lệnh build frontend khả dụng: không có `package.json`, lockfile, `build_frontend.bat` hay Tailwind binary. Các kiểm tra read-only thay thế đã chạy:

| Kiểm tra | Kết quả |
|---|---|
| `node --check` trên toàn bộ 15 file JS | PASS, 0 lỗi |
| Parse toàn bộ JSON ngoài data local cấm sửa | PASS, 0 lỗi |
| Kiểm tra `src`/`href` nội bộ trên 15 HTML root | PASS, 0 link/asset thiếu |
| Kiểm tra file-link Markdown | PASS, 0 file đích thiếu |
| So sánh 4 cặp JSON/JS fallback chính | PASS |

Không chạy `publish_dashboard.py`, `sync_and_push.bat` hoặc lệnh deploy nào. Publisher dù không có `--live` vẫn ghi log, copy artifact, build manifest và có thể sửa HTML; chạy nó sẽ vi phạm phạm vi audit.

### GitHub Pages

- Repo không có GitHub Actions workflow, `CNAME` hoặc `.nojekyll`.
- `docs/RELEASE_CHECKLIST.md` ghi Pages dùng **Deploy from a branch → `main` → `/ (root)`**, phù hợp với việc `index.html`, HTML và `assets/` nằm ở root.
- Tất cả link nội bộ kiểm tra được là relative, phù hợp project-page subpath `/market-dashboard/`.
- `index.html` dùng meta refresh + `location.replace`, không phải HTTP redirect.
- Repository public và branch mặc định `main` quan sát được trên GitHub; tuy nhiên cấu hình Settings → Pages và trạng thái deploy gần nhất không được lưu trong repo và không xác minh được bằng quyền hiện tại. Chủ repo cần xác nhận trực tiếp trong Settings → Pages trước release.

### README/tài liệu so với code

README phản ánh đúng kiến trúc hai nửa, 7 trang chính, data snapshot và giới hạn `analysis.html`. Các sai lệch có tác động được liệt kê ở P1/P2 bên dưới; nghiêm trọng nhất là entrypoint publish không tồn tại và hành vi dry-run bị mô tả sai. `docs/ARCHITECTURE.md`, `docs/CLI_REFERENCE.md`, `docs/RELEASE_CHECKLIST.md` cũng chưa đồng bộ hoàn toàn với nhau.

### Gitignore và file quan trọng

**Đúng chủ đích:** database, parquet, BCTC snapshot, reports, raw/intermediate CSV/JSON, secret/local config và Python pipeline đều bị ignore; public snapshots/data/config mapping/test fixtures cần cho site đều được track. `docs/PROJECT_HEALTH_AUDIT.md` không bị ignore.

**Có vấn đề về ranh giới:** `publish_dashboard.py` và các Python module mà test public import đều bị `*.py` ignore. Đây không phải rò dữ liệu, nhưng làm publisher và test không tái lập/audit được từ repo public. `tools/` cũng bị ignore trong khi `AI_CONTEXT.md` nhắc `tools/build_ai_bundle.py`; file đó không có trong worktree hiện tại.

Không phát hiện public artifact quan trọng nào đang bị ignore nhầm theo nghĩa frontend hiện tại không tải được. Vấn đề là tooling vận hành/test quan trọng bị ignore trong khi tài liệu public vẫn hứa có thể dùng nó.

### Độ mới của artifact tại thời điểm audit

| Artifact | Mốc dữ liệu/build | Nhận xét |
|---|---|---|
| `data/build_info.json` / `screen_snapshot.csv` | market session `2026-07-16`, build `2026-07-16 18:17 +07` | Chậm hơn phiên thứ Sáu 2026-07-17 tại ngày audit Chủ nhật 2026-07-19. |
| `data/macro_snapshot.json` | data as of `2026-07-16` | Đồng bộ với build chính. |
| `data/candlestick_patterns.json`, `data/candle_signals.json` | scan date `2026-07-13` | Cũ hơn snapshot chính ba ngày/ít nhất vài phiên. |
| `ai_report_latest.*` | manifest mtime `2026-07-11 05:48 +07` | Báo cáo AI cũ hơn dữ liệu chính; UI cần hiển thị freshness rõ. |
| `data/build_info.json` git commit | `23bc7d6...` | Artifact được sinh trước HEAD audit `eb8e7e5...`; hợp lý nếu commit sau chỉ sửa docs, nhưng release gate nên kiểm tra có chủ đích. |

## 5. Phát hiện theo mức ưu tiên

### P0 — có thể gây sai hoặc mất dữ liệu

**Không có P0 được chứng minh trong phạm vi kiểm tra.** Không chạy crawler, DB mutation hoặc publish live; `vn_stock.db` cũng không có trong worktree nên không thể audit transaction/recovery thực tế.

### P1 — làm hỏng chức năng hoặc phát hành

#### P1-01 — Đường publish được tài liệu hóa không tồn tại; batch legacy vẫn push không an toàn

- **Khu vực:** `README.md:98-100`, `AI_CONTEXT.md:26`, `.env.example`, `sync_and_push.bat:69-94`, `docs/CLI_REFERENCE.md:126-146`.
- **Bằng chứng:** `sync_and_publish.bat` không tồn tại. `sync_and_push.bat` vẫn thực hiện pull → `git add .` → commit → push và không có cờ dry-run.
- **Tác động:** người vận hành làm theo README sẽ gặp “file not found”; nếu dùng file duy nhất đang có, có thể commit/push ngoài whitelist và phát hành nhầm nội dung.

#### P1-02 — “Dry-run” publisher có side effect ghi file

- **Khu vực:** `publish_dashboard.py:100-112,224-278,413-416,434-436`; `docs/CLI_REFERENCE.md:128-136`.
- **Bằng chứng:** copy/build/version diễn ra trước nhánh `if not args.live`; `log()` cũng luôn ghi `logs/publish-*.log`.
- **Tác động:** lệnh được quảng cáo là kiểm tra an toàn có thể làm dirty worktree hoặc thay artifact, khiến review/release khó tin cậy.

### P2 — ảnh hưởng bảo trì hoặc trải nghiệm

#### P2-01 — Tài liệu vận hành/test đã lệch code

- **Khu vực:** README, `AI_CONTEXT.md`, `CHANGELOG.md`, `docs/ARCHITECTURE.md`, `docs/CLI_REFERENCE.md`, `docs/RELEASE_CHECKLIST.md`.
- **Bằng chứng:** sai tên entrypoint, sai số file, mô tả 7/7 test cũ, tuyên bố “chưa có test tự động”, mô tả batch legacy không đúng, mô tả dry-run không đúng.
- **Tác động:** tăng xác suất thao tác release sai và làm người mới đánh giá sai health.

#### P2-02 — Artifact public không cùng độ mới và thiếu freshness gate

- **Khu vực:** `data/build_info.*`, `screen_snapshot.csv`, `data/candlestick_patterns.*`, `data/candle_signals.*`, `ai_report_latest.*`.
- **Bằng chứng:** mốc dữ liệu trải từ 2026-07-11 đến 2026-07-16; scan nến không theo kịp snapshot chính.
- **Tác động:** các tab của cùng dashboard có thể biểu diễn các phiên khác nhau; người dùng dễ hiểu nhầm nếu chỉ nhìn một nhãn “last updated”.

#### P2-03 — Cấu hình Pages và release verification chỉ tồn tại dưới dạng tài liệu/manual state

- **Khu vực:** `docs/RELEASE_CHECKLIST.md`, GitHub Settings, thiếu `.github/workflows/`.
- **Bằng chứng:** repo không mã hóa deploy source hay smoke test; audit không đọc được Settings/last deployment từ local files.
- **Tác động:** cấu hình branch/folder có thể drift mà không có test cảnh báo.

#### P2-04 — Markup shell lặp ở 7 trang

- **Khu vực:** 7 HTML chính, `assets/js/shell.js`, `assets/css/shell.css`.
- **Bằng chứng:** sidebar và topbar xuất hiện riêng trong 7/7 trang.
- **Tác động:** thêm/sửa navigation phải chỉnh nhiều file, dễ lệch menu/ARIA/link.

#### P2-05 — Tooling local quan trọng không được version hóa

- **Khu vực:** `.gitignore` rule `*.py` và `tools/`; `publish_dashboard.py`; tham chiếu `tools/build_ai_bundle.py`; CSS generated.
- **Tác động:** khó code review, rollback và tái tạo publisher/build; docs có thể drift khỏi tool thực tế mà Git không phát hiện.

#### P2-06 — Test xanh trong worktree nhưng chưa tái lập từ checkout public

- **Khu vực:** `.gitignore:38-41`, `tests/`, `requirements.txt`, `docs/regression_testing.md`, thiếu `.github/workflows/`.
- **Bằng chứng:** venv project chạy 133 test và pass (1 skip), nhưng các test tracked import module root bị `*.py` ignore; không có CI để tái hiện lệnh từ checkout sạch.
- **Tác động:** tín hiệu test local là hợp lệ cho worktree được audit, nhưng người dùng checkout repo public chưa thể tự tái tạo tín hiệu đó.

### P3 — cải tiến tùy chọn

- Thêm screenshot/preview chính thức và kiểm tra responsive/accessibility tự động; README/remote trước đây còn ghi “coming soon”.
- Tự sinh `ARCHIVE_ITEMS` trong bước build thay vì cập nhật tay.
- Sau khi P1/P2 ổn định, thực hiện roadmap backtester, saved filters, PWA, mở rộng company panel; không nên ưu tiên trước release hygiene.
- Cân nhắc giảm tải CDN/runtime dependency hoặc thêm kiểm tra integrity/version tập trung.

## 6. Năm nhiệm vụ tiếp theo theo thứ tự ưu tiên

### 1. Hợp nhất và làm an toàn đường publish — P1 — giao **Codex**

- **Mục tiêu:** chỉ còn một entrypoint versioned; dry-run thật sự không sửa file; không có đường `git add .`/push ngoài whitelist.
- **File/khu vực:** `publish_dashboard.py`, `sync_and_push.bat`, wrapper `sync_and_publish.bat` nếu vẫn cần, `.gitignore`, README, `AI_CONTEXT.md`, `docs/CLI_REFERENCE.md`, test publisher mới.
- **Rủi ro:** sửa sai có thể làm gián đoạn publish hoặc bỏ sót artifact web.
- **Tiêu chí hoàn thành:** dry-run giữ `git status` sạch; live bị khóa bằng cờ rõ; test chứng minh whitelist/denylist; batch legacy bị xóa khỏi đường vận hành hoặc chuyển thành wrapper không tự push; tài liệu chỉ có một lệnh canonical.
- **Lý do chọn agent:** thay đổi có nhiều chi tiết filesystem/Git và cần test hành vi tự động.

### 2. Làm suite test tái lập từ checkout public và thêm CI read-only — P2 — giao **Codex**

- **Mục tiêu:** giữ nguyên tín hiệu local đang xanh, đồng thời cho phép checkout sạch cài dependency theo tài liệu và chạy test mà không cần data production.
- **File/khu vực:** `tests/`, modules dùng chung cần public hoặc test doubles/package tách riêng, `requirements*.txt`/`pyproject.toml`, `.github/workflows/`, `docs/regression_testing.md`.
- **Rủi ro:** vô tình public code/data ngoài chủ đích hoặc làm fixture không còn đại diện production.
- **Tiêu chí hoàn thành:** CI trên Python 3.13 chạy `python -m unittest discover tests` với 0 error/failure; fixtures độc lập, không network/DB production; ranh giới code public/local được chủ repo phê duyệt rõ.
- **Lý do chọn agent:** cần refactor import/package và CI chính xác.

### 3. Đồng bộ tài liệu với hành vi thực tế — P1/P2 — giao **Sonnet**

- **Mục tiêu:** loại mọi lệnh không tồn tại và tuyên bố lỗi thời; biến README thành nguồn hướng dẫn đáng tin.
- **File/khu vực:** README, `AI_CONTEXT.md`, `.env.example`, `CHANGELOG.md`, toàn bộ `docs/` liên quan test/publish/Pages/data fallback.
- **Rủi ro:** docs có thể mô tả ý định thay vì hành vi nếu review không đối chiếu code/test output.
- **Tiêu chí hoàn thành:** mọi command trong docs tồn tại hoặc được đánh dấu local-only; số test/file không hard-code hoặc được cập nhật; một reviewer độc lập chạy lại command và xác nhận không còn mâu thuẫn.
- **Lý do chọn agent:** phù hợp review chéo tài liệu dài và phát hiện mâu thuẫn ngữ nghĩa. Đây cũng là nơi nên thực hiện Sonnet review bắt buộc mà audit hiện tại chưa thể cung cấp.

### 4. Thêm freshness/release gate cho toàn bộ artifact — P2 — giao **Codex**

- **Mục tiêu:** chặn publish khi snapshot bắt buộc thiếu, schema sai hoặc lệch phiên vượt ngưỡng; hiển thị tuổi dữ liệu theo từng nguồn.
- **File/khu vực:** publisher, `data/build_info.*`, loaders/UI last-updated, test fixtures cho stale/missing/mixed-session.
- **Rủi ro:** lịch cập nhật tự nhiên khác nhau (AI, macro, BCTC, market) có thể tạo false positive; cần policy theo từng artifact.
- **Tiêu chí hoàn thành:** policy freshness được tài liệu hóa; test bao phủ weekend/holiday và nguồn tần suất thấp; publish báo lỗi actionable; UI không gộp các mốc khác nhau thành một mốc duy nhất.
- **Lý do chọn agent:** cần logic thời gian, schema validation và regression test.

### 5. Chạy release audit trình duyệt và polish UI — P2/P3 — giao **Fable**

- **Mục tiêu:** xác nhận 7 trang hoạt động trên subpath Pages, responsive, keyboard/accessibility và trạng thái thiếu/stale data rõ ràng.
- **File/khu vực:** HTML/CSS/JS frontend, đặc biệt navigation lặp, company panel, bảng lớn, loaders/error states; tài liệu release screenshot/smoke matrix.
- **Rủi ro:** polish có thể làm gãy ID/data attribute mà JS phụ thuộc hoặc tăng tải 13,5 MB candlestick snapshot.
- **Tiêu chí hoàn thành:** smoke matrix desktop/mobile cho 7 trang; không console error; keyboard focus/ARIA cơ bản pass; missing-data và stale-data state được chụp/duyệt; Pages subpath và `file://` mode theo contract đều được kiểm tra.
- **Lý do chọn agent:** nhiệm vụ chủ yếu là đánh giá trải nghiệm và visual polish sau khi release mechanics đã ổn định.

## 7. Quyết định trạng thái project

**`NEEDS_FIXES`**.

Lý do không chọn các trạng thái khác:

- Không phải `READY_FOR_POLISH`: còn hai P1 ở đường publish canonical và side effect của dry-run.
- Chưa phải `READY_FOR_RELEASE_AUDIT`: command release canonical không tồn tại trong repo và dry-run chưa an toàn, dù suite local đã xanh.
- Chưa cần `NEEDS_ARCHITECTURE_REVIEW`: kiến trúc local pipeline ↔ static public site có ranh giới hợp lý và được tài liệu hóa; vấn đề chính là implementation/release hygiene drift khỏi ranh giới đó, chưa có bằng chứng cần thiết kế lại toàn hệ thống.

Điều kiện tối thiểu để chuyển trạng thái: hoàn thành nhiệm vụ 1, duy trì toàn bộ test xanh, xác minh Pages Settings + smoke test site. Nhiệm vụ 2 vẫn nên hoàn thành để checkout public tái lập được tín hiệu test trước release audit.

## 8. Giới hạn và tính toàn vẹn của audit

- Không sửa hoặc chạy mutation trên code/data/output; chỉ tạo file báo cáo này.
- Không chạy deploy/publish, không push/merge, không cài dependency.
- Không có `vn_stock.db`, nên không kiểm chứng migration, transaction, backup/restore hay tính đúng số liệu nguồn.
- Suite local đã chạy đầy đủ trong venv project: 133 test, `OK (skipped=1)`; Python hệ thống không có dependency nên không đại diện cho kết quả suite của project.
- Không có quyền đọc trực tiếp GitHub Settings → Pages/last deployment.
- Claude Sonnet đã review độc lập báo cáo và finding về số liệu test đã được xử lý trong vòng sửa này.
