# Project Completion — Stock Look Up

**Ngày hoàn thành:** 2026-07-19
**HEAD public repository:** `b12cda6433c7328788095432462dd44ee4078d88` (branch `main`, `C:\Projects\VNSTOCK`)
**Commit private source liên quan:** `c820dcedcbd8deb4904103a0dd7b2fbfb5706f23` (fix) + `9b67cbf` (test), `C:\Projects\vnstock-core-private`
**Kết luận Final Release Audit:** `READY_WITH_KNOWN_WARNINGS` — xem `docs/FINAL_RELEASE_AUDIT.md` để biết chi tiết đầy đủ.

---

## Kết quả kiểm chứng

| Hạng mục | Kết quả |
|---|---|
| Public test suite | `python -m unittest discover tests` → **258/258 pass**, 0 fail, 0 error |
| Private publisher test suite | `python -m unittest tests.test_publish_dashboard` (trong `vnstock-core-private`) → **9/9 pass** |
| Private full test suite | 290 test, 266 pass, 24 error (100% do thiếu dữ liệu local — private repo chỉ chứa source, không chứa data runtime; không liên quan `publish_dashboard.py`) |
| Frontend build | `build_frontend.bat` → **thành công**, artifact byte-identical với bản đã commit |
| Dry-run read-only | Sandbox độc lập, git repo thật: **0 khác biệt hash/mtime, 0 file mới/mất, `git status` sạch, không tạo `logs/`** |
| Giấy phép | **MIT nhất quán** ở `LICENSE`, `README.md`, `about.html` |
| Push/deploy trong phiên đóng project | **Không có** |

## Bằng chứng dry-run read-only

Chạy thật (không mock) `publish_dashboard.py` không có `--live` trong một sandbox có git repo riêng, tách biệt hoàn toàn khỏi `C:\Projects\VNSTOCK` và `vnstock-core-private`:

```
[DRY-RUN] Kiểm tra xong — CHƯA copy artifact, CHƯA ghi manifest, CHƯA sửa HTML/CSS/JS, CHƯA git add/commit/push.
...
EXIT CODE: 0
```

So sánh snapshot SHA-256 + mtime toàn bộ file trước/sau: **0 khác biệt** (`fc.exe /A` → "no differences encountered"). `git status` sau dry-run: `nothing to commit, working tree clean`. Không có thư mục `logs/` nào xuất hiện.

## P2/P3 còn lại — đưa vào backlog, không chặn release

| # | Tóm tắt | Giao |
|---|---|---|
| P2-01 | Tài liệu (`AI_CONTEXT.md`, `CHANGELOG.md`, `docs/RELEASE_CHECKLIST.md`) lệch số liệu thực tế | Sonnet |
| P2-02 | `FutureWarning` pandas downcasting trong `bctc_processor.py`/`candlestick_patterns.py` | Codex |
| P2-03 | `build_frontend.bat` chưa tái lập được từ checkout hoàn toàn sạch/CI (thiếu Tailwind CLI version-hoá) | Codex |
| P2-04 | Test suite chưa tái lập được từ checkout thiếu dữ liệu local | Codex |
| P2-05 | Artifact production lệch độ mới giữa các nguồn (`data/build_info.json` vs các file khác) | Codex |
| P2-06 | Chưa có CI (`.github/workflows`) | Codex |
| P3-01/02 | `ResourceWarning` (sqlite3/file handle chưa đóng) trong `tests/test_macro_sync.py`/`test_selftest.py` | Codex |
| P3-03/04 | 6 doc khôi phục không còn link trực tiếp từ README; 1 đường dẫn cá nhân không nhạy cảm trong README | Sonnet |
| P3-05 | Hạng mục còn lại của `FRONTEND_UX_PLAN.md` (helper dedup, a11y, Tầng 2) | Fable |

Chi tiết đầy đủ (file, bằng chứng, rủi ro, cách kiểm chứng) cho từng mục: `docs/FINAL_RELEASE_AUDIT.md` mục 15.

## Cách chạy project hiện tại

**Chỉ xem dashboard** (không cần cài gì ngoài Python có sẵn):

```powershell
cd C:\Projects\VNSTOCK
python -m http.server 8017
# mở http://localhost:8017/dashboard.html
```

hoặc mở thẳng `dashboard.html` bằng trình duyệt (có fallback `file://`), hoặc xem bản live tại GitHub Pages: https://tungthanhnguyen2312-wq.github.io/market-dashboard/

**Chạy pipeline dữ liệu** (cần source code local, không nằm trong repo public): xem `../VNSTOCK_GUIDE.md`.

## Cách chạy kiểm tra trước khi publish

```powershell
cd C:\Projects\VNSTOCK

# 1. Test suite public
.\.venv\Scripts\python.exe -m unittest discover tests

# 2. Build frontend (bắt buộc trước publish — sync_and_publish.bat tự gọi bước này)
.\build_frontend.bat

# 3. Kiểm tra publish sẽ làm gì — KHÔNG ghi file, chỉ in kế hoạch (mặc định, không cần cờ gì thêm)
.\sync_and_publish.bat
```

`sync_and_publish.bat` (không cờ) giờ là **read-only tuyệt đối**: không copy artifact, không ghi manifest, không sửa HTML/CSS/JS, không ghi log, không chạm Git — chỉ in ra kế hoạch sẽ làm (artifact nào sẽ copy, build id dự kiến, trang nào sẽ đổi version, có bao nhiêu file trong whitelist git).

## ⚠️ Cảnh báo: chỉ dùng `--live` khi thực sự muốn publish thật

```powershell
.\sync_and_publish.bat --live
```

Cờ `--live` mới là bước **duy nhất** thực sự: copy artifact từ backend, ghi `data/build_info.json`/`.js`, cập nhật version-token trên toàn bộ HTML, rồi `git add`/`commit`/`push` các file trong whitelist lên `origin/main`. Không có bước "live nhẹ" nào khác — mọi lệnh không có `--live` đều an toàn 100% để chạy bao nhiêu lần tùy ý.

---

*Tài liệu này được tạo cùng đợt với việc cập nhật `docs/FINAL_RELEASE_AUDIT.md` sau khi P1 duy nhất của audit (publisher dry-run ghi file) được sửa và kiểm chứng đóng hoàn toàn. Xem `C:\Projects\.ai\FINAL_RELEASE_CLOSEOUT_REPORT.md` cho quy trình đầy đủ của phiên đóng project.*
