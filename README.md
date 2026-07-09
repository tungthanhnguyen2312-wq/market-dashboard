# VNSTOCK Dashboard

Dashboard tĩnh (GitHub Pages) hiển thị dữ liệu thị trường chứng khoán Việt Nam, được pipeline Python cào và xử lý **ở nơi khác** — repo này chỉ chứa giao diện web và bản copy dữ liệu mới nhất.

## Kiến trúc luồng dữ liệu

```
C:\Users\tungt\OneDrive\Desktop\DATA PYTHON\VNSTOCK   (pipeline Python chạy hàng ngày)
        │  screen_snapshot.csv
        │  ai_report_YYYYMMDD.md / .json
        ▼
   sync_and_push.bat   (copy file mới nhất sang repo, đổi tên thành *_latest)
        ▼
   Repo này ──► git push ──► GitHub Pages
```

## Các file trong repo

| File | Vai trò |
|---|---|
| `index.html` | Trang chính: 3 khu vực (báo cáo AI, bảng thị trường, kho lưu trữ) |
| `app.js` | Logic đọc dữ liệu: marked.js render báo cáo, PapaParse + DataTables cho bảng |
| `style.css` | Tùy chỉnh giao diện trên nền Bootstrap 5 |
| `sync_and_push.bat` | Script đồng bộ dữ liệu + pull/add/commit/push tự động |
| `ai_report_latest.md` | Báo cáo AI mới nhất (được .bat copy sang, **không sửa tay**) |
| `ai_report_latest.json` | Dữ liệu JSON của báo cáo (được .bat copy sang) |
| `screen_snapshot.csv` | Snapshot dữ liệu thị trường (~1.500 mã, được .bat copy sang) |
| `playbook-*.html`, `report-*.html`, `vn*.html` | Các báo cáo HTML tĩnh cũ, link ở sidebar |

Thư viện frontend đều load qua CDN (Bootstrap 5, jQuery, DataTables, PapaParse, marked.js) — không cần build, không cần cài đặt gì.

## Quy trình cập nhật hàng ngày

1. Pipeline Python chạy xong, sinh `screen_snapshot.csv` và `ai_report_YYYYMMDD.md/.json` trong thư mục VNSTOCK.
2. Double-click `sync_and_push.bat`. Script sẽ:
   - Copy `screen_snapshot.csv` sang repo.
   - Tìm file `ai_report_*` **mới nhất** (theo tên `YYYYMMDD`), copy sang và đổi tên thành `ai_report_latest.md` / `.json`.
   - `git pull` → `git add .` → `git commit` → `git push origin main`.
3. GitHub Pages tự cập nhật sau 1–2 phút.

## Thêm báo cáo HTML cũ vào kho lưu trữ

1. Copy file `.html` vào thư mục này.
2. Mở `index.html`, tìm khối `KHU VỰC 3` và thêm một dòng:
   ```html
   <a href="ten-file-moi.html" class="list-group-item list-group-item-action">
     📄 Tên hiển thị — dd/mm/yyyy
   </a>
   ```
3. Chạy `sync_and_push.bat` (hoặc commit + push tay).

## Xem thử ở máy local

Mở trực tiếp `index.html` sẽ bị chặn CORS (không load được CSV/MD). Phải chạy qua web server:

```
python -m http.server 8000
```

rồi mở `http://localhost:8000`.

## Sự cố thường gặp

- **Khu vực báo cáo/bảng báo "Chưa tải được..."** → chưa chạy `sync_and_push.bat` (thiếu file dữ liệu), hoặc đang mở file trực tiếp thay vì qua web server.
- **`.bat` báo lỗi git** → kiểm tra đã `git remote add origin <URL>` chưa, và lần đầu tiên phải push tay: `git push -u origin main`.

---
*Dữ liệu sinh tự động, chỉ mang tính tham khảo — không phải khuyến nghị đầu tư.*
