# Final Release Audit — Stock Look Up

**Ngày kiểm tra:** 2026-07-19 (Asia/Saigon), cập nhật cùng ngày sau khi P1 được sửa và đóng project.
**Phạm vi:** `main` @ `b12cda6433c7328788095432462dd44ee4078d88` (không đổi kể từ lần audit đầu — phiên đóng project này chỉ thêm tài liệu, không sửa code/dữ liệu public), 136 file được Git track.
**Người thực hiện:** Claude Sonnet 5 (Claude Code), audit read-only trên public repo — không sửa code/dữ liệu public, không chạy publish thật, không push/deploy. (Có sửa code trên **private source repo** `vnstock-core-private` ở phiên trước đó — xem mục 7 và `C:\Projects\.ai\PUBLISH_DRYRUN_FIX_REPORT.md`.)

**Kết luận:** **`READY_WITH_KNOWN_WARNINGS`** *(cập nhật từ `NEEDS_FIXES` — xem mục 0)*

---

## 0. Cập nhật quan trọng nhất: P1 đã được sửa và đóng

Bản audit gốc (cùng ngày, trước khi cập nhật này) kết luận `NEEDS_FIXES` vì đúng 1 lý do: `publish_dashboard.py` ghi file ngay cả khi không có `--live`. Finding đó **đã được sửa, kiểm chứng, và đóng** trong hai phiên làm việc kế tiếp:

1. **Sửa fix** (phiên trước): tách mỗi hàm ghi (`copy_public_artifacts`, `write_build_manifest`, `update_asset_versions`) thành cặp *plan* (đọc, dùng cho cả 2 chế độ) + *apply* (ghi, chỉ `--live`); `log()` hết ghi `logs/*.log` khi không `--live`. Chi tiết đầy đủ: `C:\Projects\.ai\PUBLISH_DRYRUN_FIX_REPORT.md`.
2. **Phân loại lại source/test đúng repository** (phiên này): xác nhận `publish_dashboard.py` có nguồn chuẩn tại private repo `C:\Projects\vnstock-core-private` (commit `c820dce`); test mới `tests/test_publish_dashboard.py` (import trực tiếp `publish_dashboard.py`) được chuyển hẳn sang private repo (commit `9b67cbf`) thay vì nằm trong public — vì public checkout không có `publish_dashboard.py` (bị `.gitignore` chặn có chủ đích) nên không thể chạy test đó.
3. **Kiểm chứng cuối cùng, độc lập với 2 phiên trên** (phiên này): chạy lại toàn bộ 9 test publisher trong chính private repo (nơi source thật nằm) — **9/9 pass**; chạy dry-run thật (không mock) trong sandbox có git repo riêng — **snapshot hash+mtime toàn bộ file trước/sau giống hệt tuyệt đối, `git status` sạch, không tạo `logs/`**. Xem mục 7 và mục 15 (P1 đã đóng).

Toàn bộ chi tiết quy trình đóng project: `C:\Projects\.ai\FINAL_RELEASE_CLOSEOUT_REPORT.md`.

---

## 1. Tóm tắt điều hành

- **Test public:** 258/258 pass, 0 fail, 0 error — con số quay lại đúng baseline sau khi 9 test publisher (phụ thuộc private source) được chuyển sang private repo (xem mục 3).
- **Test private (publisher-specific):** 9/9 pass trong `vnstock-core-private`, verify đầy đủ 3 tính chất bắt buộc (dry-run không ghi gì / live ghi đúng thứ tự không push thật / validation lỗi dừng trước khi ghi).
- **Build frontend:** thành công, tái lập chính xác `assets/css/tailwind.generated.css` đã commit.
- **HTML/CSS/JS:** 8 trang chính không thiếu asset/link nội bộ; 16 file JS tracked đều qua `node --check`.
- **License:** MIT nhất quán ở `LICENSE`, `README.md`, `about.html` — không còn "All rights reserved" nào hiệu lực trong repo.
- **Secret / đường dẫn cá nhân / file backup:** quét toàn bộ 136 file tracked — sạch.
- **P1:** **0 P1 đang mở** (đã đóng — xem mục 0).
- **P2/P3:** 6 P2 + 5 P3 vẫn còn, tất cả đã được đánh giá riêng và **không có bằng chứng nào cho thấy cần nâng thành blocker** — xem mục 15.

**Vì sao `READY_WITH_KNOWN_WARNINGS` chứ không phải `READY_FOR_RELEASE`:** không còn P1 nào chặn release, nhưng vẫn còn 6 P2 thật (tài liệu lệch code, cảnh báo pandas trong code lõi tín hiệu/BCTC, build/test chưa tái lập từ checkout sạch, thiếu freshness gate, thiếu CI) — đây là các hạn chế đã biết, có bằng chứng cụ thể, cần một người đọc báo cáo này biết trước khi coi project là "hoàn hảo", nhưng không cái nào đủ nghiêm trọng để chặn việc dùng/publish ở trạng thái hiện tại.

---

## 2. Cấu trúc repository và thành phần chính

136 file tracked trên public repo (không đổi so với lần audit gốc trong ngày — phiên đóng project không sửa code/dữ liệu public). Cấu trúc top-level không đổi so với mô tả trong `docs/PROJECT_HEALTH_AUDIT.md` §2:

| Khu vực | Số file tracked | Ghi chú |
|---|---:|---|
| `assets/css/` + `assets/js/` | 12 | Khung sườn + component JS, gồm cả `tailwind.src.css`/`tailwind.generated.css` |
| `config/` | 7 | Mapping tài chính/ticker/shareholder/news |
| `data/` | 12 | Snapshot public (JSON + JS fallback) |
| `docs/` | 20 | Gồm `PROJECT_HEALTH_AUDIT.md`, `WIP_BRANCH_REVIEW.md`, đủ 6 file docs vận hành (`ARCHITECTURE`/`CLI_REFERENCE`/`DATA_PIPELINE`/`FINANCIAL_REPORT`/`STOCK_ANALYZER`/`USER_GUIDE`), và chính file này |
| `tests/` | 39 | 25 file `test_*.py` + fixtures + diagnostics + regression — **không gồm** `test_publish_dashboard.py` (thuộc private repo, xem mục 3) |
| Root (HTML/MD/bat/config) | phần còn lại | 7 trang chính + `index.html` + 6 báo cáo tĩnh lịch sử + tài liệu + 2 script publish |

Ranh giới local-vs-public (`.gitignore`) được xác nhận còn nguyên vẹn, bao gồm cả `publish_dashboard.py` (dòng 38: `*.py	publish_dashboard.py`) — file này **có nguồn chuẩn ở private repo**, không bao giờ được `git add -f` vào public repo trong bất kỳ phiên nào.

## 3. Test suite

**Public** (`C:\Projects\VNSTOCK`): `python -m unittest discover tests` → **`Ran 258 tests` → `OK`, 0 failure, 0 error.**

Con số này giữ nguyên baseline (không phải 267 như một báo cáo trung gian trong ngày từng ghi) vì: test mới `tests/test_publish_dashboard.py` (viết ở phiên sửa P1, import trực tiếp `publish_dashboard.py`) đã được **xác định lại đúng vị trí** và chuyển hẳn sang private repo trong phiên đóng project — public checkout không có `publish_dashboard.py` nên không thể chạy test đó, giữ nó lại trong public sẽ vi phạm nguyên tắc "không đưa test không thể chạy từ public checkout vào public repo".

**Private** (`C:\Projects\vnstock-core-private`, dùng chung `.venv` của public repo — private repo không có `.venv` riêng, không cài thêm gì):
- `python -m unittest tests.test_publish_dashboard` → **9/9 pass**, `OK`.
- `python -m unittest discover tests` (toàn bộ 40 file test của private repo) → **290 test, 266 pass, 24 error, 7 skip.** Toàn bộ 24 lỗi truy ngược về **thiếu file dữ liệu local** (`screen_snapshot.csv`, `financial_snapshot.csv`, `data/build_info.json`, `app.js`, các CSV nguồn BCTC theo mã...) — private repo chỉ track **source code**, không track **dữ liệu runtime** (đúng thiết kế, xem `docs/vnstock-repo-hygiene-audit` memory), nên các test cần dữ liệu thật không chạy được ở đây. **Không có lỗi nào liên quan tới `publish_dashboard.py` hay logic đã sửa** — khớp hoàn toàn với giới hạn đã biết P2-04 (test không tái lập từ checkout không đủ dữ liệu), không phải finding mới.

`git status` sạch tuyệt đối ở cả 2 repo trước và sau khi chạy test.

## 4. Frontend build (`build_frontend.bat`)

Chạy trực tiếp trên public repo: **`[OK] Frontend build complete`**, exit code 0 (~350-410ms qua nhiều lần chạy trong ngày). Sau build, `git status` sạch tuyệt đối — `assets/css/tailwind.generated.css` build ra **byte-identical** với bản đã commit.

Máy này đã có sẵn `tools\tailwind\tailwindcss.exe` (gitignored). Xem P2-03 (mục 15) về việc build chưa chạy được từ checkout hoàn toàn sạch — không đổi so với lần audit trước trong ngày.

## 5. File HTML/CSS/JS quan trọng

- 8 trang HTML kiểm tra (`index`, `dashboard`, `screener`, `analysis`, `signals`, `macro`, `about`, `archive`): **0 asset/link nội bộ bị thiếu**.
- 16 file `.js` tracked: **100% qua `node --check`**.
- Cả 7 trang chính dùng `assets/css/tailwind.generated.css` (không Play CDN) — không đổi.

## 6. Cấu hình và đường dẫn phục vụ GitHub Pages

Không đổi so với lần audit trước trong ngày: không `CNAME`/`.nojekyll` tracked (đúng cho hosting mặc định `*.github.io`); `index.html` redirect đúng subpath `market-dashboard/dashboard.html`; không xác minh được Settings → Pages (ngoài quyền truy cập, giới hạn đã biết).

## 7. Quy trình tạo và publish dữ liệu — **P1 đã đóng**

`sync_and_publish.bat` (tracked, public) → `build_frontend.bat` → `publish_dashboard.py` (nguồn chuẩn tại private repo `vnstock-core-private`, đồng bộ 1:1 với bản local trên máy chạy production).

**Trạng thái sau khi sửa (đã kiểm chứng trực tiếp lần cuối trong phiên này, không chỉ đọc code):**
- Không `--live`: `main()` chỉ chạy các bước đọc (`git_preflight`, `validate_snapshot`, `plan_copy_artifacts`, `compute_manifest`, `plan_asset_versions`, `validate_json_artifacts`, `build_whitelist`), in kế hoạch (số artifact sẽ copy, `build_id` dự kiến, danh sách trang HTML sẽ đổi version, số file whitelist), rồi dừng. **Không copy, không ghi manifest, không sửa HTML/CSS/JS, không ghi `logs/*.log`, không lệnh Git mutation nào.**
- `--live`: gọi đúng thứ tự `copy_public_artifacts()` → `write_build_manifest()` → `update_asset_versions()` → validate lại → `git diff --check`/`status --porcelain` → `publish_live()` (add/commit/push) — hành vi logic giữ nguyên như thiết kế gốc, chỉ khác ở chỗ đây là **nơi duy nhất** các bước ghi được phép chạy.
- Validation lỗi (ví dụ snapshot thiếu cột bắt buộc) dừng **trước** mọi bước ghi, kể cả khi có `--live`.

**Bằng chứng kiểm chứng lần cuối (phiên đóng project, độc lập với phiên sửa fix):**
- 9/9 test publisher pass trong chính private repo (nguồn thật).
- Dry-run thật (không mock) trong sandbox riêng (git repo thật, không phải `C:\Projects\VNSTOCK` hay private repo) — snapshot SHA-256+mtime toàn bộ file **trước/sau giống hệt tuyệt đối** (`fc.exe /A` báo "no differences encountered"), danh sách file trước/sau giống hệt, `git status` = `nothing to commit, working tree clean`, không có thư mục `logs/` nào được tạo.

## 8. `sync_and_push.bat` và `sync_and_publish.bat`

Không đổi so với lần audit trước trong ngày — cả 2 file tự thân an toàn (0 lệnh `git add`/`commit`/`push` trực tiếp, đã quét lại trong phiên này). Khác biệt duy nhất: rủi ro ở tầng Python mà mục này từng ghi "ngoài phạm vi Git" **nay đã có source-of-truth trong Git** (private repo) và **đã được sửa** — xem mục 7.

## 9. File dữ liệu và artifact production

Không đổi so với lần audit trước trong ngày (phiên đóng project không sửa dữ liệu public):
- Định dạng: 20 file `.json` + 13 file `.csv` tracked đều hợp lệ; 16 file `.js` qua `node --check`.
- File bắt buộc: đầy đủ, không thiếu.
- Đường dẫn cá nhân: quét lại toàn bộ 136 file tracked cho `C:\Users\...` — **0 kết quả**.
- Độ mới: `data/build_info.json` vẫn phiên `2026-07-16`, lệch với `analysis_bundle.json`/`bundle_manifest.json` (2026-07-17/18) và `ai_report_latest.*` (mtime 2026-07-11) — **P2-05, không đổi**.

## 10. Cấu hình tài chính và mapping

Không đổi. `config/financial_item_map.csv` (38 dòng) và `config/ticker_entity_profiles.csv` (15 dòng) hợp lệ, mapping `finance_company`/EVF đúng.

## 11. README và tài liệu vận hành

Không đổi so với lần audit trước trong ngày:
- `README.md` phản ánh đúng hiện trạng.
- `AI_CONTEXT.md:12` vẫn ghi "114 file" (thực tế 136).
- `CHANGELOG.md:143` vẫn ghi "Chưa có test tự động" (thực tế 258 test public + 9 test private).
- `docs/RELEASE_CHECKLIST.md:14-18` vẫn mô tả trạng thái test cũ.
- **P2-01, không đổi, độ lệch không tăng thêm trong phiên này** (không có sửa docs nào trong phiên đóng project ngoài chính `FINAL_RELEASE_AUDIT.md` này).

## 12. Giấy phép MIT

Không đổi — **nhất quán hoàn toàn**, đã xác nhận lại lần cuối trong phiên này: `LICENSE` = MIT chuẩn, `README.md` trỏ đến `LICENSE`, `about.html:112` = "Released under the MIT License.". Quét `git grep -in "all rights reserved"` toàn bộ 136 file tracked: chỉ còn khớp trong văn bản phân tích lịch sử (`docs/WIP_BRANCH_REVIEW.md`), không phải tuyên bố hiệu lực.

## 13. Cảnh báo Python

Không đổi so với lần audit trước trong ngày (public suite quay về đúng 258 test cũ, không có test mới nào trong public để phát sinh cảnh báo mới):

| Loại | Vị trí | Số lần | Đánh giá |
|---|---|---:|---|
| `FutureWarning` | `bctc_processor.py:1184,1590` | 14 | Backlog, P2 — xem mục 15 |
| `FutureWarning` | `candlestick_patterns.py` (6 vị trí) | 258 | Backlog, P2 — xem mục 15 |
| `ResourceWarning` | `csv.py:186` (GC-timing, nghi vấn cao nhất: `tests/test_macro_sync.py` thiếu `.close()`) | 4 | Backlog, P3 — file này **vẫn ở public repo**, không phải file đã chuyển sang private |
| `ResourceWarning` | `tests/test_selftest.py:126,142` | 2 | Backlog, P3 |

`tests/test_macro_sync.py` và `tests/test_selftest.py` là 2 file **khác hoàn toàn** với `tests/test_publish_dashboard.py` đã chuyển sang private repo — không nhầm lẫn. Cảnh báo Python từ private repo's `test_publish_dashboard.py` (9 test): **0 warning** (kiểm tra riêng, log sạch).

## 14. So sánh với các audit/báo cáo trước

### Đã đóng hoàn toàn trong ngày hôm nay

| Finding gốc | Nguồn | Trạng thái |
|---|---|---|
| P1-01 — `sync_and_push.bat` tự `git add`/commit/push | `PROJECT_HEALTH_AUDIT.md` | RESOLVED (phiên cleanup) |
| Đổi MIT sang "All rights reserved" (README/CONTRIBUTING/RELEASE_CHECKLIST) | `WIP_BRANCH_REVIEW.md` | RESOLVED (phiên cleanup) |
| `about.html` "All rights reserved" | phát hiện mới, xử lý ở phiên merge | RESOLVED (phiên merge) |
| **P1-02 — publisher dry-run ghi file** | `PROJECT_HEALTH_AUDIT.md`, tái xác nhận `FINAL_RELEASE_AUDIT.md` bản đầu | **RESOLVED (phiên sửa fix + phiên đóng project, kiểm chứng độc lập 2 lần)** |

### Cải thiện một phần

| Finding gốc | Trạng thái |
|---|---|
| P2-05 cũ (nay P2-03) — build frontend không tái lập được | Cải thiện lớn: `build_frontend.bat` tồn tại, chạy đúng, tái lập byte-identical; vẫn cần tải tay Tailwind CLI cho máy/CI mới |

### Vẫn mở, xác nhận lại nguyên trạng — không có bằng chứng mới để nâng mức độ

| Finding | Trạng thái |
|---|---|
| P2-01 — tài liệu lệch code | VẪN MỞ, không đổi trong phiên này |
| P2-02 — `FutureWarning` pandas | VẪN MỞ, không đổi |
| P2-03 — build chưa tái lập từ checkout sạch | VẪN MỞ, không đổi |
| P2-04 — test chưa tái lập từ checkout thiếu dữ liệu | VẪN MỞ — **tái xác nhận thêm 1 lần nữa qua chính việc chạy full suite private repo hôm nay** (24/290 lỗi, toàn bộ do thiếu dữ liệu local, không phải lỗi logic) |
| P2-05 — artifact lệch độ mới | VẪN MỞ, không đổi |
| P2-06 — không có CI | VẪN MỞ, không đổi |
| P3-01 đến P3-05 | VẪN MỞ, không đổi |

### Mới trong phiên đóng project

- Xác nhận `vnstock-core-private` (`C:\Projects\vnstock-core-private`, không có remote) là nguồn chuẩn hợp lệ cho `publish_dashboard.py` — nội dung khớp 100% với bản local public trước khi phiên này bắt đầu.
- `tests/test_publish_dashboard.py` được xác định đúng là test private-only, chuyển từ public (untracked) sang private (tracked, commit `9b67cbf`) — public quay về 258 test, không mất bài test nào (đã verify chạy được 9/9 ở nơi đúng).

---

## 15. Danh sách phát hiện đầy đủ (P0–P3)

### P0 — có nguy cơ sai hoặc mất dữ liệu

**Không có.**

### P1 — chặn release

**Không có P1 nào đang mở.**

**Đã đóng trong ngày — publisher dry-run ghi file (P1 duy nhất của bản audit gốc):**
- **File:** `publish_dashboard.py` (nguồn chuẩn: `C:\Projects\vnstock-core-private\publish_dashboard.py`, commit `c820dce`; đồng bộ về `C:\Projects\VNSTOCK\publish_dashboard.py`, local, gitignored).
- **Fix:** tách plan (đọc)/apply (ghi) cho cả 3 hàm ghi file + `log()`; chỉ `--live` mới ghi. Chi tiết: `C:\Projects\.ai\PUBLISH_DRYRUN_FIX_REPORT.md`.
- **Bằng chứng đóng:** 9/9 test publisher pass tại private repo; dry-run thật trong sandbox độc lập cho kết quả 0 khác biệt hash/mtime/danh sách file, `git status` sạch, không tạo `logs/`.
- **Test bảo vệ:** `tests/test_publish_dashboard.py`, private repo, commit `9b67cbf`.

### P2 — nên sửa sớm nhưng không nhất thiết chặn release

*(Nội dung P2-01 đến P2-06 không đổi so với bản audit trước trong ngày — xem mục 14 để biết trạng thái xác nhận lại. Chi tiết đầy đủ từng mục theo cấu trúc File/Bằng chứng/Rủi ro/Kiểm chứng/Sửa/Giao cho: xem lịch sử file này hoặc `C:\Projects\.ai\backups\final-release-closeout-20260719\FINAL_RELEASE_AUDIT.md.before-update` — giữ nguyên logic, chỉ đổi số thứ tự P2-03→P2-06 do P1 cũ chuyển xuống mục "đã đóng".)*

#### P2-01 — Tài liệu lệch code, độ lệch tăng theo thời gian
File: `AI_CONTEXT.md:12`, `CHANGELOG.md:143`, `docs/RELEASE_CHECKLIST.md:14-18`. Giao: **Sonnet**.

#### P2-02 — `FutureWarning` từ pandas downcasting trong code lõi tín hiệu/BCTC
File: `bctc_processor.py:1184,1590`; `candlestick_patterns.py` (6 vị trí). Giao: **Codex**.

#### P2-03 — Build frontend chưa tái lập được từ checkout sạch/CI
File: `build_frontend.bat` (phụ thuộc `tools\tailwind\tailwindcss.exe` không version-hoá). Giao: **Codex**.

#### P2-04 — Test suite chưa tái lập được từ checkout thiếu dữ liệu local
File: `tests/` (import module root gitignored hoặc cần data local). Tái xác nhận hôm nay qua cả 2 hướng: worktree Git cô lập (phiên review WIP, 23/258) và full suite private repo (phiên này, 266/290, 24 lỗi đều do thiếu data). Giao: **Codex**.

#### P2-05 — Artifact production lệch độ mới giữa các nguồn
File: `data/build_info.json` vs `analysis_bundle.json`/`ai_report_latest.*`. Giao: **Codex**.

#### P2-06 — Không có CI / release verification tự động
File: repo root (thiếu `.github/workflows/`). Giao: **Codex**.

### P3 — cải tiến tùy chọn

#### P3-01 — `ResourceWarning` sqlite3 trong `tests/test_macro_sync.py` (public repo)
Giao: **Codex**.

#### P3-02 — `ResourceWarning` file handle trong `tests/test_selftest.py` (public repo)
Giao: **Codex**.

#### P3-03 — 6 file `docs/*.md` đã khôi phục không còn được README link trực tiếp
Giao: **Sonnet**.

#### P3-04 — Đường dẫn tuyệt đối cá nhân không nhạy cảm trong README
Giao: **Sonnet**.

#### P3-05 — Hạng mục còn lại của `FRONTEND_UX_PLAN.md` chưa triển khai
Giao: **Fable**.

---

## 16. Việc tiếp theo theo thứ tự ưu tiên

1. ~~Sửa P1 publisher dry-run~~ — **ĐÃ XONG**.
2. **Cập nhật P2-01** (tài liệu lệch code) — rẻ, nhanh. Giao Sonnet.
3. **Sửa P2-02** (`FutureWarning` pandas) — trước khi nâng cấp pandas. Giao Codex.
4. **Đóng P2-05** (freshness gate) + **P2-06** (CI cơ bản). Giao Codex.
5. **P2-03/P2-04** (build & test tái lập từ checkout sạch) — gộp một đợt refactor packaging/CI. Giao Codex.
6. **P3-01/P3-02** (ResourceWarning cleanup) — làm cùng PR chạm vào 2 file đó.
7. **P3-03/P3-04** (hướng docs/README) — chủ repo chốt, Sonnet thực hiện.
8. **P3-05** (UX polish) — sau khi P1/P2 ổn định.

---

## 17. Giới hạn và tính toàn vẹn của audit

- Không sửa code/dữ liệu **public**, không chạy `publish_dashboard.py --live`/`sync_and_publish.bat --live` hay bất kỳ lệnh deploy nào, không push. (Có sửa code trên private repo ở phiên trước — nằm ngoài phạm vi audit read-only này, đã báo cáo riêng và minh bạch tại mục 0/7.)
- Không cài thêm dependency ở bất kỳ repo nào.
- Không có quyền đọc GitHub Settings → Pages/last deployment.
- `git diff`/`git status` xác nhận: trên public repo, thay đổi duy nhất trong toàn bộ phiên đóng project là nội dung file báo cáo này (`docs/FINAL_RELEASE_AUDIT.md`) và các file tài liệu closeout được phép theo dõi khác — không có code/dữ liệu public nào bị sửa.
