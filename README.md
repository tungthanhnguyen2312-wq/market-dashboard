# Finance & Geopolitics Dashboard

Website tĩnh dark theme kiểu terminal, tự cập nhật:
- 2 tin chiến sự mới nhất
- tin chính trị - kinh tế Việt Nam
- WTI, Brent, Gold, US 10Y, S&P 500, Dow Jones, Nasdaq, VN-Index, Hang Seng, Nikkei, KOSPI
- khu vực AI để nhập Gemini API key + prompt trực tiếp trên trình duyệt

## Cấu trúc file

```text
finance-dashboard/
├─ index.html
├─ style.css
├─ app.js
├─ data.json
├─ update_data.py
├─ requirements.txt
├─ .gitignore
└─ .github/
   └─ workflows/
      └─ update.yml
```

## Chạy thử trên máy

```bash
pip install -r requirements.txt
python update_data.py
```

Sau đó mở `index.html` bằng Live Server của VS Code hoặc đẩy lên GitHub Pages.

## Đưa lên GitHub Pages

1. Tạo repo GitHub mới.
2. Upload toàn bộ file trong thư mục này.
3. Vào **Settings → Pages**.
4. Ở mục **Source**, chọn **Deploy from a branch**.
5. Chọn branch `main` và folder `/ (root)`.
6. Save.

## Tự cập nhật dữ liệu

Workflow `.github/workflows/update.yml` đã chạy:
- theo lịch 15 phút/lần (lệch phút để tránh đầu giờ)
- hoặc bấm tay bằng `workflow_dispatch` trong tab **Actions**

## Secret tùy chọn

Nếu muốn dịch nhiều hơn ổn định hơn với MyMemory, vào:
**Repo → Settings → Secrets and variables → Actions → New repository secret**

Tạo secret:
- `TRANSLATE_EMAIL` = email của anh

## AI panel

AI panel gọi Gemini trực tiếp từ trình duyệt, nên:
- anh tự dán Gemini API key vào ô nhập
- key chỉ dùng trên trình duyệt của anh
- nếu bật “Ghi nhớ key”, trình duyệt sẽ lưu key vào `localStorage`

## Gợi ý triển khai

- Nếu website vừa tạo mà chưa có dữ liệu: vào tab **Actions**, chạy workflow thủ công một lần.
- Nếu GitHub Pages chưa hiện ngay: chờ vài phút để Pages build xong.
