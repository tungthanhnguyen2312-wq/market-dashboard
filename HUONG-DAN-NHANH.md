# HƯỚNG DẪN NHANH — SỬA DASHBOARD TRONG 3 PHÚT

Đây là bản cực ngắn. Mỗi lần muốn sửa gì, chỉ cần nhìn bảng này.

---

## 1) Muốn thêm chỉ số
Sửa file:

- `update_data.py`

Tìm:

```python
MARKET_CONFIGS
```

Xong rồi:
1. upload `update_data.py`
2. upload `data.json` nếu muốn có dữ liệu mẫu ngay
3. commit

---

## 2) Muốn thêm nguồn tin
Sửa file:

- `update_data.py`

Tìm các khối:
- `WAR_FEEDS`
- `GLOBAL_FEEDS`
- `VN_RSS_FEEDS`
- `VN_HTML_SOURCES`

Xong rồi:
1. upload `update_data.py`
2. commit

---

## 3) Muốn sửa giao diện
Sửa file:

- `index.html`
- `style.css`

Xong rồi:
1. upload file vừa sửa
2. commit
3. bấm `Ctrl + F5` để xem bản mới

---

## 4) Muốn sửa cách hiển thị dữ liệu
Sửa file:

- `app.js`

Ví dụ:
- thứ tự card
- format số
- số lượng tin hiển thị
- source/time/tag

Xong rồi:
1. upload `app.js`
2. commit
3. `Ctrl + F5`

---

## 5) Muốn thêm nhận định cá nhân / checklist nhanh
Sửa file:

- `manual-notes.json`

Đây là file dễ nhất. Không cần sửa code.

Xong rồi:
1. upload `manual-notes.json`
2. commit

---

## 6) Muốn thêm playbook mới
Làm 2 việc:

### Việc A
Upload file mới, ví dụ:
- `playbook-2026-04-03.html`

### Việc B
Sửa link điều hướng ở:
- `index.html`
- các file playbook cũ nếu muốn bấm qua lại

Xong rồi:
1. upload file playbook mới
2. upload `index.html`
3. commit

---

## 7) Muốn web tự cập nhật lại dữ liệu
Vào tab:

- **Actions**

Xem workflow có chạy xanh không.

Nếu workflow có trigger `push`, chỉ cần commit là nó tự chạy.

---

## 8) Muốn biết file nào dùng để làm gì

- `index.html` = khung trang web
- `style.css` = màu sắc / giao diện
- `app.js` = hiển thị dữ liệu
- `update_data.py` = lấy dữ liệu mới
- `data.json` = dữ liệu web đang đọc
- `manual-notes.json` = ghi chú cá nhân
- `playbook-...html` = từng trang playbook

---

## 9) Quy trình chuẩn mỗi lần sửa

1. xác định mình muốn sửa gì
2. sửa đúng file
3. upload file lên GitHub
4. bấm **Commit changes**
5. vào web, bấm `Ctrl + F5`
6. nếu không lên dữ liệu, vào **Actions** kiểm tra

---

## 10) Nếu web lại treo “Đang tải...”
Làm ngay:

1. kiểm tra `index.html`, `app.js`, `data.json` có cùng phiên bản không
2. vào **Actions** xem workflow đỏ hay xanh
3. `Ctrl + F5`

---

## 11) Quy tắc an toàn

- sửa giao diện → upload `index.html` + `style.css`
- sửa dữ liệu → upload `update_data.py` + `data.json`
- sửa playbook → upload file playbook + `index.html` nếu có thêm nút

---

## 12) Câu thần chú để khỏi quên

### Giao diện?
`index.html` + `style.css`

### Hiển thị?
`app.js`

### Nguồn tin / chỉ số?
`update_data.py`

### Ghi chú cá nhân?
`manual-notes.json`

### Playbook mới?
`playbook-...html`
