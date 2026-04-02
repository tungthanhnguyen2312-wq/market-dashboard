# Market Dashboard Rebuild

## Upload lên GitHub những file nào
- index.html
- style.css
- app.js
- update_data.py
- data.json
- manual-notes.json
- requirements.txt
- .github/workflows/update.yml

## Sửa ở đâu khi cần
### 1) Muốn đổi giao diện / bố cục / chữ
Sửa:
- `index.html`
- `style.css`
- `app.js`

### 2) Muốn thêm / bớt chỉ số
Sửa trong `update_data.py` tại biến `MARKET_CONFIGS`.

### 3) Muốn thêm / bớt nguồn tin
Sửa trong `update_data.py` tại các biến:
- `WAR_FEEDS`
- `GLOBAL_FEEDS`
- `VN_RSS_FEEDS`
- `VN_HTML_SOURCES`

### 4) Muốn thêm ghi chú thủ công lên web mà không đụng code
Sửa file `manual-notes.json`.

### 5) Muốn dữ liệu cập nhật tự động
File workflow ở:
- `.github/workflows/update.yml`

## Gợi ý quy trình an toàn
1. Luôn upload cả bộ file cùng lúc.
2. Không chỉ upload riêng `index.html` nếu `app.js` / `data.json` chưa cùng phiên bản.
3. Sau khi upload, vào tab Actions để xem workflow có chạy xanh không.
4. Nếu web chưa đổi, bấm Ctrl + F5 để tránh cache.
