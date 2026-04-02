# Market Dashboard — Hướng dẫn đầy đủ

Đây là bộ hướng dẫn **thực dụng**, viết để anh dùng repo GitHub `market-dashboard` mà không cần nhớ nhiều thuật ngữ kỹ thuật.

---

## 1) Repo này đang gồm những gì?

Các file quan trọng nhất:

- `index.html` → trang chính của website (Live Dashboard)
- `style.css` → giao diện, màu sắc, font, card, khoảng cách
- `app.js` → cách website đọc dữ liệu và hiển thị ra màn hình
- `data.json` → dữ liệu đang được website hiển thị
- `manual-notes.json` → chỗ để anh tự thêm ghi chú cá nhân mà **không cần sửa code**
- `update_data.py` → script Python lấy tin tức + chỉ số rồi ghi vào `data.json`
- `requirements.txt` → danh sách thư viện Python để GitHub Actions cài
- `.github/workflows/update.yml` → workflow để GitHub tự chạy cập nhật dữ liệu
- `playbook-2026-04-01.html` → playbook ngày 01/04/2026
- `playbook-2026-04-02.html` → playbook ngày 02/04/2026

---

## 2) Muốn sửa gì thì sửa file nào?

### A. Muốn đổi giao diện, chữ, tiêu đề, card, màu sắc
Sửa:

- `index.html`
- `style.css`

Ví dụ:
- đổi dòng tiêu đề lớn trên cùng
- đổi tên các khối như “Tin chiến sự”, “Việt Nam nổi bật”
- đổi màu nền, font, bo góc, kích thước chữ

---

### B. Muốn đổi cách hiển thị dữ liệu
Sửa:

- `app.js`

Ví dụ:
- muốn card chỉ số sắp xếp khác đi
- muốn tin chỉ hiện 2 dòng thay vì 4 dòng
- muốn thêm icon hoặc tag cho nguồn tin
- muốn đổi format tăng/giảm của chỉ số

---

### C. Muốn thêm / bớt chỉ số
Sửa:

- `update_data.py`

Tìm khối:

```python
MARKET_CONFIGS = [
```

Mỗi dòng trong đó là một chỉ số.

Ví dụ 1 dòng:

```python
{"name": "S&P 500", "symbol": "^GSPC", "decimals": 2, "category": "US"}
```

Ý nghĩa:
- `name` = tên hiển thị trên web
- `symbol` = mã dùng để lấy dữ liệu
- `decimals` = số chữ số thập phân
- `category` = nhóm để hiển thị

Nếu muốn thêm chỉ số mới, chỉ cần thêm 1 dòng tương tự.

---

### D. Muốn thêm / bớt nguồn tin
Sửa:

- `update_data.py`

Các khối chính:

- `WAR_FEEDS` → tin chiến sự
- `GLOBAL_FEEDS` → tin quốc tế / macro / hàng hóa
- `VN_RSS_FEEDS` → nguồn RSS Việt Nam
- `VN_HTML_SOURCES` → nguồn HTML scraping Việt Nam

Ví dụ feed RSS có dạng:

```python
("VnExpress Kinh doanh", "https://vnexpress.net/rss/kinh-doanh.rss")
```

Nếu muốn thêm nguồn mới, thêm vào đúng nhóm tương ứng.

---

### E. Muốn tự thêm ghi chú / nhận định cá nhân mà không đụng code
Sửa:

- `manual-notes.json`

Ví dụ nội dung:

```json
{
  "notes": [
    {
      "title": "Biến số hôm nay",
      "time": "02/04 08:30",
      "text": "Theo dõi dầu Brent, DXY và dòng vốn ngoại."
    }
  ]
}
```

File này rất hợp khi anh muốn thêm:
- checklist đầu ngày
- catalyst cần theo dõi
- nhận định cá nhân
- nhắc việc

mà không phải sửa HTML hay JavaScript.

---

### F. Muốn thêm playbook mới
Ví dụ muốn thêm playbook ngày 03/04/2026.

Anh cần làm **2 việc**:

#### Việc 1: upload file playbook mới
Ví dụ:

- `playbook-2026-04-03.html`

#### Việc 2: thêm nút điều hướng
Sửa các file có menu:

- `index.html`
- `playbook-2026-04-01.html`
- `playbook-2026-04-02.html`
- và playbook mới nếu muốn liên kết ngược lại

Nếu chỉ upload playbook mới mà không thêm link, file vẫn tồn tại nhưng sẽ khó bấm qua lại.

---

## 3) Khi nào phải sửa `data.json`?

### Trường hợp bình thường
Không cần sửa bằng tay.

Vì:
- `update_data.py` sẽ tạo lại `data.json`
- GitHub Actions sẽ chạy script đó và cập nhật file

### Khi nào nên sửa tay?
Chỉ khi:
- anh muốn có dữ liệu mẫu ngay lập tức
- workflow đang lỗi nhưng anh vẫn muốn web hiển thị tạm
- anh muốn test giao diện nhanh

---

## 4) Quy trình upload an toàn để tránh web hỏng

Đây là nguyên tắc quan trọng nhất.

### Không upload lẻ lung tung
Nếu anh sửa dashboard, nên upload **cả nhóm file liên quan cùng lúc**.

### Ví dụ 1: chỉ đổi giao diện
Upload cùng lúc:
- `index.html`
- `style.css`
- `app.js` (nếu có thay đổi phần hiển thị)

### Ví dụ 2: đổi nguồn dữ liệu hoặc thêm chỉ số
Upload cùng lúc:
- `update_data.py`
- `data.json`
- `requirements.txt` (nếu có thư viện mới)
- `.github/workflows/update.yml` (nếu có đổi workflow)

### Ví dụ 3: thêm playbook mới
Upload cùng lúc:
- file playbook mới
- `index.html`
- các playbook cũ nếu anh muốn thêm nút điều hướng giữa các trang

---

## 5) Cách sửa trực tiếp trên GitHub

### Cách 1: sửa nhanh trên web GitHub
1. Vào repo
2. Bấm tab **Code**
3. Bấm vào file muốn sửa
4. Bấm biểu tượng cây bút **Edit**
5. Sửa nội dung
6. Kéo xuống dưới bấm **Commit changes**

Phù hợp cho:
- sửa chữ
- sửa link
- sửa `manual-notes.json`
- sửa vài dòng nhỏ

### Cách 2: upload file từ máy
1. Vào repo
2. Bấm **Add file** → **Upload files**
3. Kéo file mới vào
4. Commit changes

Phù hợp cho:
- thay hẳn `index.html`
- thay `app.js`
- thay playbook mới
- thay bộ file đồng bộ

---

## 6) Sau khi upload xong thì kiểm tra ở đâu?

### A. Kiểm tra file đã lên chưa
Vào tab **Code**

### B. Kiểm tra workflow có chạy không
Vào tab **Actions**
- nếu workflow màu xanh → OK
- màu đỏ → có lỗi, cần xem log

### C. Kiểm tra website có đổi chưa
Mở web rồi bấm:

- `Ctrl + F5`

Để tránh cache trình duyệt giữ bản cũ.

---

## 7) File workflow nằm ở đâu mới đúng?

Phải là:

```text
.github/workflows/update.yml
```

Nếu anh để file `update.yml` ở thư mục gốc repo, GitHub sẽ **không nhận đó là workflow**.

---

## 8) Nếu web bị lỗi “Đang tải...” hoặc không hiện dữ liệu

Thường là do 1 trong các nguyên nhân sau:

1. `index.html` mới nhưng `app.js` cũ
2. `app.js` mới nhưng `data.json` sai cấu trúc
3. `update_data.py` chưa chạy nên `data.json` chưa được cập nhật
4. workflow lỗi
5. trình duyệt đang cache bản cũ

### Cách xử lý nhanh
1. upload lại **cả bộ file liên quan**
2. vào **Actions** xem workflow có xanh không
3. bấm `Ctrl + F5`

---

## 9) Muốn thêm thông tin cá nhân thì nên làm ở đâu?

### Nếu chỉ là ghi chú nhẹ
Cho vào:
- `manual-notes.json`

### Nếu là dữ liệu nhạy cảm
Không nên đưa lên website GitHub Pages public.

Ví dụ không nên đưa:
- tài chính cá nhân chi tiết
- tài khoản ngân hàng
- danh sách tài sản riêng tư
- dữ liệu gia đình

Website GitHub Pages phù hợp cho nội dung công khai hoặc bán công khai.

---

## 10) Cách nghĩ đơn giản nhất

Mỗi lần anh muốn sửa, chỉ cần tự hỏi:

### Tôi đang sửa cái gì?

- **Giao diện** → `index.html`, `style.css`
- **Hiển thị dữ liệu** → `app.js`
- **Nguồn tin / chỉ số** → `update_data.py`
- **Ghi chú cá nhân** → `manual-notes.json`
- **Playbook mới** → file `playbook-...html`

Chỉ cần xác định đúng file, phần còn lại rất đơn giản.

---

## 11) Khuyến nghị của tôi cho anh

Nếu muốn ít lỗi nhất, về sau anh nên làm theo quy tắc:

### Quy tắc 1
Khi sửa dashboard, **không sửa ngẫu hứng từng file lẻ** nếu có liên quan dữ liệu.

### Quy tắc 2
Luôn giữ các file này cùng phiên bản:
- `index.html`
- `app.js`
- `data.json`

### Quy tắc 3
Muốn thêm nội dung riêng mà không động code, ưu tiên dùng:
- `manual-notes.json`

### Quy tắc 4
Muốn thêm playbook, tạo file playbook mới + thêm link điều hướng.

---

## 12) Khi cần tôi hỗ trợ kiểu nào nhanh nhất?

Lần sau anh chỉ cần nhắn 1 trong các kiểu sau:

- “thêm cho tôi 3 chỉ số mới”
- “thêm nguồn tin Reuters và CNBC”
- “đổi giao diện phần market card cho dễ nhìn”
- “làm playbook 03/04/2026 và thêm nút điều hướng”
- “sửa file manual-notes.json để thêm checklist hôm nay”

Tôi sẽ biết ngay phải sửa file nào cho anh.
