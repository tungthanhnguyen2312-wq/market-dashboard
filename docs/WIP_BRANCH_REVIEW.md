# WIP Branch Review — `wip/restored-work-20260719` vs `main`

**Ngày review:** 2026-07-19
**Người review:** Claude Sonnet 5 (Claude Code), review trực tiếp — không qua Codex
**Phạm vi:** commit checkpoint `475c0fb0f284f381b5044d38a3e1ac49aa8bc777` trên branch `wip/restored-work-20260719`, so với `main` @ `29f6442905c6748f15a095ff116c3479c3888d92`
**Phương pháp:** đọc toàn bộ diff (49 file), chạy full test suite thật (không phải suite rút gọn), chạy thử `build_frontend.bat`, đọc trực tiếp nội dung các file batch/test/docs quan trọng, quét secret + đường dẫn cá nhân trên toàn diff. Không sửa nội dung 49 file WIP, không merge, không push.

**Kết luận cuối:** **`WIP_NEEDS_CLEANUP`**

---

## 1. Tóm tắt các nhóm thay đổi trong commit `475c0fb`

Commit này là **một snapshot thô** (đúng như message của nó ghi rõ), gộp ít nhất **5 mạch công việc độc lập** không liên quan trực tiếp tới nhau:

1. **Vá an toàn đường publish (khớp P1-01 của `docs/PROJECT_HEALTH_AUDIT.md`)** — viết lại hoàn toàn `sync_and_push.bat` (119 dòng auto `git add .`/commit/push → còn 4 dòng, chỉ gọi `sync_and_publish.bat`), thêm `sync_and_publish.bat` mới làm entrypoint publish chính thức.
2. **Hạ tầng build frontend tái lập được (khớp P2-05 của audit)** — thêm `build_frontend.bat`, `tailwind.config.js`, `assets/css/tailwind.src.css` để build lại `assets/css/tailwind.generated.css` bằng Tailwind CLI standalone thay vì build tay không ai kiểm chứng lại được.
3. **Bộ test mới cho các module pipeline chưa có coverage** — 7 file test mới (BCTC quarantine, candle/SMC scan, exchange-publish contract, export AI bundle, fiscal period flag, macro sync freshness, watchlist forward-return eval) + sửa 5 file test cũ.
4. **Dữ liệu pipeline làm mới (routine)** — toàn bộ `data/*.js`/`*.json`, `screen_snapshot*.csv`, `market_breadth.csv`, `analysis_latest.json`, `analysis_bundle.json`, `focus_extract.json`, `bundle_manifest.json`, `watchlist_eval_latest.*` — output tự sinh từ phiên chạy pipeline 2026-07-16→18.
5. **Tái cấu trúc tài liệu công khai + đổi chính sách bản quyền** — xoá 6 file `docs/*.md` + `LICENSE`, gộp nội dung vào file **ngoài repo** `../VNSTOCK_GUIDE.md`, đổi từ MIT sang "All rights reserved" (`README.md`, `CONTRIBUTING.md`, `docs/RELEASE_CHECKLIST.md`).
6. **2 dòng mapping dữ liệu nhỏ** — thêm entity type `finance_company` cho EVF vào `config/financial_item_map.csv` + `config/ticker_entity_profiles.csv` (một trong 5 mã trọng điểm của hệ thống).

Không có mạch nào trong 6 mạch trên phụ thuộc lẫn nhau về mặt kỹ thuật — chúng chỉ đang nằm chung một commit vì đều là phần "chưa commit" bị gom lại khi khôi phục stash.

---

## 2. Phân loại 49 file thay đổi

| Nhóm | Số file | Danh sách |
|---|---:|---|
| **Code** (script vận hành) | 2 | `sync_and_push.bat` (M), `sync_and_publish.bat` (A) |
| **Test** | 12 | Mới (7): `tests/test_bctc_source_quarantine.py`, `tests/test_candle_scan_smc.py`, `tests/test_exchange_publish_contract.py`, `tests/test_export_ai_bundle.py`, `tests/test_fiscal_period_flag.py`, `tests/test_macro_sync.py`, `tests/test_watchlist_eval.py`. Sửa (5): `tests/diagnostics/missing_data_audit.py`, `tests/test_advanced_financial_metrics.py`, `tests/test_financial_mapping.py`, `tests/test_missing_data_audit.py`, `tests/test_snapshot_rebuild.py` |
| **Dữ liệu sinh tự động** | 18 | `data/candle_signals.js/.json`, `data/candlestick_patterns.js/.json`, `data/macro_snapshot.js/.json`, `data/screener_data.js`, `data/sector_heatmap.js/.json` (9); `market_breadth.csv`, `screen_snapshot.csv`, `screen_snapshot_live.csv` (A) (3); `analysis_bundle.json` (A), `analysis_latest.json`, `focus_extract.json` (A), `bundle_manifest.json` (A), `watchlist_eval_latest.json` (A), `watchlist_eval_latest.md` (A) (6) |
| **Cấu hình** | 2 | `config/financial_item_map.csv`, `config/ticker_entity_profiles.csv` |
| **Tài liệu** | 12 | `CHANGELOG.md`, `CONTRIBUTING.md`, `LICENSE` (D), `README.md`, `docs/RELEASE_CHECKLIST.md`, `docs/ARCHITECTURE.md` (D), `docs/CLI_REFERENCE.md` (D), `docs/DATA_PIPELINE.md` (D), `docs/FINANCIAL_REPORT.md` (D), `docs/STOCK_ANALYZER.md` (D), `docs/USER_GUIDE.md` (D), `FRONTEND_UX_PLAN.md` (A, tài liệu phân tích/kế hoạch) |
| **Build/frontend** | 3 | `build_frontend.bat` (A), `tailwind.config.js` (A), `assets/css/tailwind.src.css` (A) |

(A = file mới, M = sửa, D = xoá; tổng 2+12+18+2+12+3 = **49**, khớp `git diff main wip/restored-work-20260719 --stat`.)

---

## 3. Đánh giá bản chất thay đổi

### Có chủ đích, chất lượng cao (không phải rác/tình cờ)

- **`sync_and_push.bat` → wrapper 4 dòng, `sync_and_publish.bat` mới**: đọc toàn bộ diff, xác nhận hành vi auto `git pull`/`add .`/`commit`/`push` cũ đã **bị loại bỏ hoàn toàn**, không còn đường nào trong 2 file này tự chạy git mutation. `sync_and_publish.bat` chỉ kiểm tra tiền điều kiện, gọi `build_frontend.bat`, in thông tin git (read-only: `rev-parse`, `branch --show-current`, `remote -v`), rồi gọi `publish_dashboard.py %*` — mọi quyết định add/commit/push được đẩy hết vào Python publisher, gate bởi `--live` (đúng kiến trúc mà `docs/PROJECT_HEALTH_AUDIT.md` mô tả).
- **`build_frontend.bat`**: comment giải thích rõ ràng lý do pin Tailwind CLI v3.4.19 (không dùng v4 vì mất `corePlugins`), có SHA256 checksum cho binary tải về, có error handling rõ ràng ở mọi bước. Đã **chạy thử thành công thật** trên máy (xem mục 5) — không phải code chưa kiểm chứng.
- **7 test mới**: tên hàm test rất cụ thể, bám sát rủi ro thật của domain — ví dụ `test_source_files_are_not_modified`, `test_publish_entrypoints_never_stage_everything`, `test_build_manifest_public_schema_has_no_absolute_paths`, `test_delisted_ticker_missing_target_date_is_none_not_forward_filled`, `test_never_crosses_quarter_and_year_period_types`. Đây là test phòng thủ có chủ đích, không phải test giả/rỗng.
- **`FRONTEND_UX_PLAN.md`**: tài liệu phân tích read-only 2026-07-16, trích dẫn số dòng cụ thể cho từng vấn đề — chất lượng điều tra cao, không phải ghi chú tuỳ tiện.
- **2 dòng config `finance_company`/EVF**: khớp đúng với 5 mã trọng điểm hệ thống đã biết (POW/SSI/HPG/EVF/PAN) — thay đổi có mục tiêu rõ ràng, không phải chỉnh nhầm.

### Có thể là output sinh tự động (đúng như vẻ ngoài, đã xác minh)

Toàn bộ 18 file trong nhóm "Dữ liệu sinh tự động" đều có `generated_at`/timestamp nội bộ (2026-07-16 → 2026-07-18), parse JSON/JS hợp lệ 100% (xem mục 5), và khớp format đã biết từ `docs/PROJECT_HEALTH_AUDIT.md` (screen_snapshot 31 cột, market_breadth, watchlist_eval có cảnh báo "không phải khuyến nghị mua/bán" đúng chuẩn). Không có dấu hiệu bị chỉnh tay hay hỏng.

### Thay đổi có nguy cơ không nên commit thẳng vào `main` như hiện trạng

- **Đổi giấy phép từ MIT sang "All rights reserved"** (`LICENSE` bị xoá, `README.md`, `CONTRIBUTING.md`, `docs/RELEASE_CHECKLIST.md` đổi theo) — đây là **quyết định chính sách/pháp lý**, không phải lỗi kỹ thuật, nhưng có tác động lâu dài và khó đảo ngược hoàn toàn (bản MIT đã từng public trên GitHub vẫn có thể đã được bên thứ ba clone/fork trước đó). Không nên merge vào `main` mà chưa có xác nhận rõ ràng của chủ repo rằng đây là quyết định có chủ đích, không phải để sót lại từ một lần thử nghiệm.
- **README trỏ ra tài liệu ngoài repo** (`../VNSTOCK_GUIDE.md`, đường dẫn tuyệt đối `C:\Projects\VNSTOCK_GUIDE.md`) — đã xác minh file này **tồn tại thật** (22,5 KB, sửa lần cuối 2026-07-17) và nội dung khớp đúng những gì README hứa hẹn. Nhưng vì file nằm **ngoài repo Git** (thư mục cha, không thể commit cùng), bất kỳ ai xem repo public trên GitHub (không phải chủ máy) sẽ không bao giờ truy cập được tài liệu này. Không sai về nội dung, nhưng cần cân nhắc UX cho người ngoài trước khi merge.
- **Gộp 6 mạch việc không liên quan vào 1 commit** — bản thân điều này không nguy hiểm về dữ liệu, nhưng khiến commit **không thể review/rollback từng phần** (ví dụ: muốn giữ fix `sync_and_push.bat` nhưng revert phần đổi license thì phải tách tay).

### File bị xóa — có hợp lý không

Đã đọc phần đầu cả 6 file `docs/*.md` bị xóa. Cả 6 đều tự ghi "Tách ra từ README ngày 12/07/2026" — WIP này **đảo ngược** việc tách đó, gộp lại vào `../VNSTOCK_GUIDE.md` (đã xác minh tồn tại và đủ nội dung). **Xóa hợp lý về mặt nội dung** (không mất thông tin, chỉ đổi nơi lưu), nhưng xem cảnh báo license/vị trí file ở trên — xóa `LICENSE` là loại xóa khác hẳn về bản chất (chính sách, không phải tái tổ chức tài liệu) và cần được nhìn nhận tách biệt khỏi 6 file docs kia.

### Secret / đường dẫn máy cá nhân / file backup

- **Secret**: quét toàn bộ diff bằng pattern AWS key / private-key header / `sk-`/`ghp_`/`gho_`/`xox*` token / `api_key=`,`password=` dạng gán trực tiếp — **không tìm thấy gì**.
- **Đường dẫn cá nhân**: không có `C:\Users\...` nào xuất hiện trong diff (thêm lẫn xoá). Duy nhất một đường dẫn tuyệt đối không nhạy cảm: `C:\Projects\VNSTOCK_GUIDE.md` trong `README.md` (đã nêu ở trên, P2 chứ không phải rò rỉ thông tin nhạy cảm — không chứa username). Các dòng chứa "OneDrive"/"tungt" trong diff đều nằm ở phần **bị xóa** (nội dung cũ của `docs/CLI_REFERENCE.md`), tức WIP làm **giảm** lộ thông tin vận hành máy cá nhân, không phải tăng.
- **File backup**: không có file/đường dẫn nào trong 49 file trỏ tới `C:\Projects\.ai\backups\...` hay có tên dạng `*.bak`/`*copy*`. Sạch.

---

## 4. Kết quả chạy test

Chạy `python -m unittest discover tests` bằng `.venv` thật của project (`C:\Projects\VNSTOCK\.venv`), với nội dung working tree = đúng commit `475c0fb` (checkout tạm thời branch WIP vào thư mục chính, không dùng worktree cô lập ở bước này vì cần các module `.py` gitignored + dữ liệu local mà chỉ có ở đó).

**Kết quả: `Ran 258 tests in 17.220s` → `OK`, 0 failure, 0 error.**

- Tăng từ baseline 133 test (audit gốc) lên 258 — khớp với việc thêm 7 file test mới + mở rộng 5 file cũ.
- Baseline audit gốc có 1 skip; lần chạy này **0 skip** — chênh lệch nhỏ, khả năng do điều kiện skip phụ thuộc môi trường/thời điểm đã thay đổi; không phát hiện gì bất thường trong log, nhưng chưa xác minh nguyên nhân chính xác của test bị skip trước đó là gì (ghi vào P3, không chặn).
- Các dòng `ERROR`/`WARNING` xuất hiện trong log (`Source schema guard failed... BIO_balance_sheet.csv`) là **do chính test cố ý tạo fixture lỗi để kiểm tra cơ chế quarantine** (`test_bctc_source_quarantine.py`) — không phải test thật sự lỗi.
- Sau khi chạy test xong, `git status` trên branch WIP hoàn toàn sạch — test không ghi đè lên bất kỳ file tracked nào.
- **Đã xác nhận lại phát hiện cũ của audit (P2-06)**: chạy `unittest discover` trong một **worktree git cô lập** (chỉ có file tracked, không có `.py` root bị gitignore + không có `financial_snapshot.csv` local) chỉ tìm được 23 test, 20 lỗi import — vì các module như `watchlist_eval`, `shareholder_pipeline` bị `.gitignore` chặn khỏi repo public. Đây là giới hạn **đã có từ trước WIP này**, WIP không làm nó tệ hơn cũng không sửa nó.

## 5. Kiểm tra lệnh build/frontend

Chạy `build_frontend.bat` thật (không phải đọc code suông) trên máy, tại thư mục `C:\Projects\VNSTOCK` với WIP đã checkout.

**Kết quả: thành công**, `[OK] Frontend build complete`, exit code 0, build xong trong 872ms.

- File output `assets/css/tailwind.generated.css` (tracked) được ghi lại — **so sánh với bản đã commit trong WIP: byte-identical (0 diff)**. Nghĩa là build có thể tái lập chính xác artifact đã commit — xác nhận artifact hiện tại không "trôi" khỏi nguồn (`tailwind.config.js` + `tailwind.src.css`).
- Máy này đã có sẵn `tools\tailwind\tailwindcss.exe` (gitignored, không nằm trong diff). Đây là **điều kiện tiên quyết không được version hoá** — một checkout sạch/CI mới sẽ **không build được** cho tới khi tải tay binary theo hướng dẫn trong comment của `build_frontend.bat` (đúng như audit P2-05 đã cảnh báo). WIP này chưa giải quyết được vế "reproducible từ checkout sạch", chỉ giải quyết vế "reproducible trên máy đã setup".

## 6. Kiểm tra đặc biệt

### `sync_and_push.bat`
Đã đọc toàn bộ diff. Bản cũ (119 dòng, còn nguyên trong `main`) auto `git pull origin main` → `git add .` → `git commit` → `git push origin main`, không cờ dry-run — đúng là rủi ro P1-01 mà audit nêu. **Bản trong WIP (4 dòng) không còn bất kỳ lệnh git nào** — chỉ `call sync_and_publish.bat %*`. **Đây là fix thật, đã verify bằng cách đọc trực tiếp nội dung, không chỉ tin theo message/README.**

### `sync_and_publish.bat`
File mới, đọc toàn bộ nội dung (59 dòng). Không có `git add`/`commit`/`push` trực tiếp — chỉ kiểm tra file tồn tại, gọi `build_frontend.bat` (dừng nếu build lỗi), in thông tin git read-only, rồi gọi `publish_dashboard.py %*`. An toàn ở cấp độ batch script này. **Lưu ý:** bản thân `publish_dashboard.py` bị `.gitignore`, không nằm trong phạm vi review này và không thể audit qua git diff — theo `docs/PROJECT_HEALTH_AUDIT.md` (P1-02), file đó có side-effect ghi file ngay cả ở dry-run. Rủi ro đó **không nằm trong WIP branch này** (không tracked) nên không tính vào phạm vi P0-P3 dưới đây, nhưng nên nhắc lại vì `sync_and_publish.bat` gọi thẳng vào nó.

### Các file dữ liệu lớn
`data/candle_signals.js`/`.json` (~2,9 MB mỗi file), `data/screener_data.js` (~1,3 MB): parse JSON hợp lệ (`.json`) và `node --check` pass (`.js`) 100%. Lấy mẫu cấu trúc `candle_signals.json` — đúng schema đã biết (ticker, close, patterns, smc, swing highs/lows). `screen_snapshot_live.csv` có header đúng 31 cột như audit mô tả, dữ liệu ticker/giá thực tế hợp lý. Không có dấu hiệu file hỏng, cắt cụt hay chứa rác.

### Các file tài liệu đã bị xóa
Xem mục 3 — hợp lý, nội dung đã chuyển sang `../VNSTOCK_GUIDE.md` (verified tồn tại). Riêng `LICENSE` cần tách khỏi nhóm này vì là quyết định chính sách, không phải tái tổ chức tài liệu thuần túy.

### Các test mới
Xem mục 3 và mục 4 — 7 file, tên hàm cụ thể/bám rủi ro thật, toàn bộ đã chạy PASS trong suite 258 test.

---

## 7. Findings theo mức độ ưu tiên

### P0 — có thể gây sai hoặc mất dữ liệu
**Không có.** Không phát hiện secret, không phát hiện thao tác ghi đè nguy hiểm, test suite xanh 100%, build tái lập chính xác artifact đã commit.

### P1 — cần quyết định/xử lý trước khi merge

- **P1-01 — Đổi giấy phép MIT → "All rights reserved" chưa được xác nhận rõ ràng là chủ đích cuối cùng.** Khu vực: `LICENSE` (xóa), `README.md`, `CONTRIBUTING.md`, `docs/RELEASE_CHECKLIST.md`. Đây là thay đổi hợp lệ về mặt kỹ thuật (nhất quán ở cả 4 nơi) nhưng có tác động pháp lý/chính sách lâu dài, khó hoàn tác sạch sẽ (repo từng public dưới MIT). **Cần chủ repo xác nhận trực tiếp trước khi commit này chạm vào `main`.**

### P2 — nên xử lý sớm, không chặn việc tiếp tục làm

- **P2-01 — Build frontend chưa tái lập được từ checkout sạch/CI.** `tools\tailwind\tailwindcss.exe` (gitignored) phải tải tay theo hướng dẫn trong `build_frontend.bat`; máy hiện tại có sẵn nên build chạy được, nhưng máy khác/CI sẽ fail ngay bước đầu. Đã biết từ trước (audit P2-05), WIP không làm xấu đi nhưng cũng chưa đóng gap này.
- **P2-02 — README trỏ tới tài liệu nằm ngoài phạm vi repo Git** (`../VNSTOCK_GUIDE.md`). Nội dung có thật và đúng, nhưng không ai ngoài chủ máy này truy cập được. Nên ghi rõ trong README rằng đây là tài liệu "chỉ dành cho chủ dự án/local", tránh gây hiểu lầm cho người ngoài xem repo public.
- **P2-03 — Test suite chỉ chạy đầy đủ (258 test) trong môi trường local thật**, không tái lập được từ checkout public do các module `.py` bị `.gitignore` — tồn tại từ trước (audit P2-06), không phải lỗi mới của WIP.
- **P2-04 — Commit gộp 6 mạch việc không liên quan** (xem mục 1) khiến không thể review/merge/rollback từng phần một cách sạch sẽ.

### P3 — cải thiện tùy chọn

- **P3-01** — 0 test bị skip trong lần chạy này so với 1 skip ở baseline audit gốc; chưa xác minh nguyên nhân chênh lệch (nhiều khả năng vô hại, phụ thuộc điều kiện môi trường/ngày giờ).
- **P3-02** — `FRONTEND_UX_PLAN.md` được thêm vào repo như tài liệu tham khảo; hạng mục đầu tiên của nó (gỡ Tailwind Play CDN khỏi 7 trang HTML) **đã được thực hiện từ trước** (commit `8293ea7`, cùng ngày với phiên phân tích, không thuộc WIP này) — các hạng mục còn lại (hợp nhất helper `esc()`/`num()`/`fmt()` trùng lặp 7 bản, a11y, URL/localStorage state, Tầng 2 watchlist/command-palette) vẫn chưa có code tương ứng trong diff này. Nên làm rõ trong tài liệu rằng mục 1 đã xong để người đọc sau không làm lại.
- **P3-03** — `docs/RELEASE_CHECKLIST.md` chỉ được xem qua đúng đoạn diff thay đổi (2 hunk), chưa audit toàn bộ file — nên rà lại một lượt khi dọn commit vì nó tham chiếu nhiều mục đã đổi (LICENSE, danh sách `git add`).

---

## 8. Đề xuất

**8.1. Có nên tiếp tục làm việc trực tiếp trên branch WIP hay không?**
Có thể tiếp tục **đọc/kiểm thử** trên branch này (đã chứng minh an toàn: test xanh, build chạy được, không secret). Nhưng **không nên commit thêm việc mới chồng lên `475c0fb`** trước khi tách commit — mỗi mạch việc mới nên bắt đầu từ một commit/branch con tách riêng để tránh commit "rác" phình to hơn nữa.

**8.2. Có nên tách thành nhiều commit hay không?**
**Có, khuyến nghị mạnh.** Tách theo đúng 6 mạch ở mục 1, gợi ý thứ tự merge (từ rủi ro thấp/độc lập nhất đến cần quyết định nhất):
1. `config/financial_item_map.csv` + `ticker_entity_profiles.csv` (2 dòng, không rủi ro).
2. 18 file dữ liệu sinh tự động (routine, review nhanh bằng cách so sánh timestamp/schema).
3. 12 file test mới/sửa + xác nhận lại 258 test pass trên chính commit đó.
4. `sync_and_push.bat` + `sync_and_publish.bat` + `build_frontend.bat`/`tailwind.*` (nhóm "publish safety + build tooling" — nên đi cùng nhau vì `sync_and_publish.bat` gọi `build_frontend.bat`).
5. `FRONTEND_UX_PLAN.md` (tài liệu tham khảo, thêm ghi chú mục 1 đã xong).
6. **Riêng biệt, KHÔNG gộp với bất cứ nhóm nào ở trên**: `LICENSE` + phần đổi bản quyền trong `README.md`/`CONTRIBUTING.md`/`docs/RELEASE_CHECKLIST.md` — chỉ merge sau khi có xác nhận rõ ràng từ chủ repo (P1-01), tách khỏi việc xóa 6 file `docs/*.md` còn lại (những file đó có thể đi cùng nhóm 5 vì lý do xóa khác hẳn).

**8.3. File nào nên giữ?**
Toàn bộ 49 file nên giữ về mặt nội dung — không phát hiện file nào cần loại bỏ vì sai/hỏng/rác. "Giữ" ở đây nghĩa là giữ nội dung, không nhất thiết giữ nguyên cách gộp commit hiện tại.

**8.4. File nào nên loại khỏi commit (ở dạng hiện tại)?**
Không loại file nào, nhưng **tách `LICENSE` + phần liên quan bản quyền ra khỏi mọi commit khác** cho tới khi có xác nhận (mục 8.2, nhóm 6). Đây là loại trừ về *trình tự merge*, không phải loại trừ về nội dung.

**8.5. Việc tiếp theo theo thứ tự ưu tiên**
1. Xin xác nhận chủ repo về quyết định đổi license (P1-01) — việc bắt buộc trước khi động vào `LICENSE`/`README.md`/`CONTRIBUTING.md` trên `main`.
2. Tách `475c0fb` thành các commit theo mục 8.2 (dùng `git reset --soft` trên **một branch làm việc mới tạo từ `wip/restored-work-20260719`**, không sửa trực tiếp `wip/restored-work-20260719` — nhánh này nên giữ nguyên làm điểm khôi phục).
3. Sau khi tách, chạy lại `python -m unittest discover tests` trên từng commit riêng để đảm bảo mỗi commit tự nó không phá suite.
4. Cân nhắc thêm 1 dòng vào README làm rõ `../VNSTOCK_GUIDE.md` là tài liệu local-only (P2-02).
5. Ghi chú trong `FRONTEND_UX_PLAN.md` rằng hạng mục Play-CDN đã xong, để tránh làm lại (P3-02).
6. Cân nhắc version-hoá Tailwind CLI theo cách khác (ví dụ script tải tự động có xác minh SHA256, hoặc tài liệu CI riêng) để đóng gap P2-01, không bắt buộc ngay.

---

## 9. Kết luận

# `WIP_NEEDS_CLEANUP`

**Vì sao không phải `WIP_SAFE_TO_CONTINUE`:** nội dung an toàn và đã được kiểm chứng (0 P0, test xanh 258/258, build tái lập chính xác, không secret/không rò rỉ), nhưng commit hiện tại gộp 6 mạch việc không liên quan (bao gồm một quyết định chính sách bản quyền chưa xác nhận) vào một khối duy nhất — không nên merge hay build tiếp trực tiếp lên trên nó ở dạng hiện tại.

**Vì sao không phải `WIP_NEEDS_FIXES`:** không có gì *hỏng* cần sửa — mọi thứ chạy đúng như thiết kế. Vấn đề là tổ chức/quy trình (tách commit, xin xác nhận chính sách), không phải lỗi code.

**Vì sao không phải `WIP_UNSAFE`:** đã chạy test thật + build thật + quét secret/đường dẫn cá nhân trên toàn diff, không tìm thấy gì nguy hiểm.

---

## Phụ lục — Môi trường kiểm thử & dọn dẹp

- Đã tạo tạm 1 worktree cô lập (`C:\Projects\.ai\worktrees\review_wip_20260719`) để kiểm tra "reproducibility gap" (mục 4), sau đó gỡ đăng ký khỏi Git (`git worktree remove`, `git worktree list` hiện không còn liệt kê nó). **Thư mục vật lý không xoá được do `Permission denied`** — cùng kiểu lỗi hệ điều hành đã gặp ở các phiên trước với `.agents/`, `assets/images/`, worktree audit cũ. Không dùng biện pháp phá quyền truy cập; để nguyên, không ảnh hưởng dữ liệu (toàn bộ nội dung trong đó chỉ là bản sao thừa của chính branch WIP).
- Đã checkout tạm `wip/restored-work-20260719` vào thư mục làm việc chính (`C:\Projects\VNSTOCK`) để chạy test/build với đầy đủ module local, sau đó **checkout lại `main`** — đã xác nhận `main` sạch tuyệt đối, `HEAD` không đổi (`29f6442`).
- Branch `wip/restored-work-20260719` và stash `"wip P0 fixes - checking pre-existing test state"` **không bị đụng tới** trong suốt quá trình review.
- Không có thay đổi nào khác ngoài việc tạo file báo cáo này (`docs/WIP_BRANCH_REVIEW.md`).
