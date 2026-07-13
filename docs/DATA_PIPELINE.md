# Data Pipeline — Bẫy dữ liệu & vận hành

> Đây là phần "kinh nghiệm xương máu" của dự án: các bẫy dữ liệu đã gặp thật, cách gửi dữ
> liệu cho AI phân tích, và cách mở dữ liệu trong Excel. Tách ra từ README ngày 12/07/2026.

**Mục lục:** [Tiền — ai_analyzer.py](#tiền--ai_analyzerpy) · [Gửi file cho AI phân tích](#gửi-file-cho-ai-phân-tích-không-cần-excel) · [Mở dữ liệu trong Excel](#mở-dữ-liệu-trong-excel-365) · [Bẫy dữ liệu](#bẫy-dữ-liệu) · [Bẫy vận hành / kỹ thuật](#bẫy-vận-hành--kỹ-thuật)

---

## Tiền — `ai_analyzer.py`

- **Tốn tiền THẬT mỗi lần bấm:** `python .\ai_analyzer.py` = 1 lần trừ tiền tài khoản API (**~$0,10-0,15 ≈ 2.500-4.000đ**). Nhịp hợp lý: **1-2 lần/tuần**, đừng chạy theo quán tính hằng ngày. `--dry-run` luôn miễn phí — nghi ngờ gì cứ dry-run trước.
- **Chạy `ai_analyzer.py` SAU chuỗi cập nhật ngày** (update → macro → news → indicators) — chạy trước thì trả tiền để AI phân tích... số liệu hôm qua.
- **TUYỆT ĐỐI không đưa vào Task Scheduler** — đốt tiền API ngầm hằng ngày mà không ai đọc.
- **Bẫy `setx` khi đặt API key:** `setx ANTHROPIC_API_KEY "..."` chỉ có hiệu lực với terminal **mở MỚI sau đó** — cửa sổ đang mở sẽ báo `Could not resolve authentication method`.
- **Bảo mật key:** key chỉ nằm trong biến môi trường — không dán vào code, không commit, không gửi vào chat. Lộ key = người khác tiêu tiền tài khoản mình; lỡ lộ thì vào console.anthropic.com thu hồi và tạo key mới ngay.

## Gửi file cho AI phân tích (không cần Excel)

CSV/Parquet là dữ liệu máy đọc → gửi thẳng cho AI. Excel chỉ là lớp xem cho mắt người.

**Combo khuyên dùng cho phân tích hằng ngày** (tổng ~0,3 MB, đủ 90% nhu cầu):
`screen_snapshot.csv` + `market_breadth.csv` + `macro_snapshot.csv` (+ `news_latest.csv` nếu cần bối cảnh tin tức).

**2 con đường dùng AI — chọn theo túi tiền:**
- **Tự tay gửi combo trên vào chat** (Claude.ai / ChatGPT): nằm trong gói chat đang trả, không tốn thêm.
- **`python .\ai_analyzer.py`**: tự động, ra JSON+Markdown chuẩn format, nhưng **trừ tiền API mỗi lần bấm**.

| Cần phân tích | Gửi file | Ghi chú |
|---|---|---|
| Lọc/xếp hạng cổ phiếu (chỉ báo + PE/PB/ROE + room ngoại + cờ blacklist) | `screen_snapshot.csv` | 0,3 MB — file chính |
| Sức khỏe thị trường: mã tăng/giảm, % trên MA200, ngành mạnh/yếu | `market_breadth.csv` | 2 KB — luôn gửi kèm |
| Bối cảnh vĩ mô: Fed, US10Y, DXY, dầu, vàng, VIX, tỷ giá, CPI/GDP VN | `macro_snapshot.csv` | 2 KB — luôn gửi kèm |
| Bối cảnh tin tức thế giới + VN | `news_latest.csv` | ~25 KB — 100 tin mới nhất |
| Mẫu nến phiên mới nhất (trigger vào lệnh) | `ta_signals.csv` / `.json` | ~15 KB — đã kèm sẵn rs_rating/gtgd/margin để lọc |
| Lịch sử giá vài mã / backtest | `ohlcv_flat.parquet` | 23 MB — nén, gọn |
| Chỉ tiêu tài chính BCTC (doanh thu/LN/ROE/thanh khoản theo quý) | `financial_snapshot.csv` | ~30 KB — nhánh BCTC ([FINANCIAL_REPORT.md](FINANCIAL_REPORT.md)), CHỈ cập nhật theo **quý** |
| Cổ đông lớn theo mã | — *(chưa có file xuất riêng)* | Bảng `shareholders` hiện CHỈ nằm trong `vn_stock.db` |
| **Đừng gửi** | `ohlcv_flat.csv` (105 MB), `vn_stock.db` (172 MB), `blacklist.csv` | 2 file đầu nặng vô ích; blacklist đã nằm sẵn trong cột `margin_status` của snapshot |

**Nhắc AI khi gửi kèm câu hỏi** (tránh AI dùng sai dữ liệu):
- Metadata (PE/PB/ROE/room/margin_status) và macro là trạng thái **HÔM NAY** → chỉ dùng lọc live, **cấm join vào giá quá khứ để backtest** (survivorship/lookahead bias).
- `free_float_est` là **proxy tự tính** (1 − cổ đông ≥5% − Nhà nước), không phải số FTSE/HOSE chính thức.
- `roe` đơn vị **%** (trailing 4 quý, nguồn KBS); `foreign_room_pct` = **% room ngoại còn trống** (0 = kín room); vốn hóa trong DB đơn vị **đồng**.
- Mã có `margin_status` khác rỗng là dính án (cắt margin/cảnh báo/kiểm soát/đình chỉ) — vẫn nằm trong bảng, tự lọc chứ đừng để AI khuyến nghị mua.
- **`financial_snapshot.csv` cũng là POINT-IN-TIME theo kiểu riêng**: các kỳ so sánh đã được coalesce ưu tiên số **điều chỉnh hồi tố mới nhất** — dùng để phân tích hiện tại là đúng, đừng dùng để tái dựng đúng số đã công bố tại thời điểm gốc. `roe`/`roa` trong file này là **theo QUÝ** (chưa annualize) — khác hẳn đơn vị `roe` trailing-4-quý trong `metadata`.

## Mở dữ liệu trong Excel 365

**Lưu ý cốt lõi:**
- **Parquet là file nhị phân** → double-click ra trắng. Phải nạp qua Power Query, không mở trực tiếp.
- **`ohlcv_flat` có ~1,9tr dòng > giới hạn 1.048.576 dòng của Excel** → không đổ ra sheet được, phải vào Data Model.
- **`screen_snapshot.csv` chỉ ~1.578 dòng** → đổ ra sheet bình thường. Đây là file dùng chính.

**Bảng lọc hằng ngày — `screen_snapshot.csv`:**
`Data → Get Data → From File → From Text/CSV →` chọn `screen_snapshot.csv` → **Load**.

**Lịch sử giá 1,9tr dòng — `ohlcv_flat.parquet`:**
`Data → Get Data → From File → From Parquet →` chọn file →
- Bấm **Transform Data** để lọc bớt trước (VD giữ 1 mã) **rồi** Load, HOẶC
- Close & Load To… → **Only Create Connection** + tick **Add this data to the Data Model**.
- **Tuyệt đối không** chọn "Table" (lỗi vì quá 1,05tr dòng).

**Tạo `screener.xlsx` để xem/lọc/sort:**
1. Mở workbook mới → lưu vào đúng thư mục VNSTOCK → tên `screener.xlsx`.
2. `Data → Get Data → From Text/CSV →` `screen_snapshot.csv` → **Close & Load** (ra Table).
3. Table có sẵn nút mũi tên để **sort + filter** mọi cột.
4. Sau khi chạy `vn_indicators.py` mỗi ngày → bấm **Data → Refresh All**, bảng tự cập nhật.

**Bộ lọc CANSLIM (công thức FILTER)** — dán ra ô trống:

```
=FILTER(screen_snapshot, (screen_snapshot[rs_rating]>=80)*(screen_snapshot[above_sma200]="True")*(screen_snapshot[pct_from_52w_high]>=-15)*(screen_snapshot[rel_vol]>=1)*(screen_snapshot[gtgd20_ty]>=3))
```

**Ý nghĩa tiêu chí:** `rs_rating>=80` (mạnh hơn 80% thị trường) · `above_sma200` (xu hướng dài hạn tăng) · `pct_from_52w_high>=-15` (trong 15% từ đỉnh 52 tuần) · `rel_vol>=1` (khối lượng ≥ trung bình) · `gtgd20_ty>=3` (GTGD bq ≥ 3 tỷ/phiên, lọc hàng lởm).

**Nên nhân thêm 2 điều kiện "luật"**: `*(screen_snapshot[margin_status]="")` (loại mã dính án) và `*(screen_snapshot[foreign_room_pct]>0)` nếu quan tâm dòng tiền ngoại.

## Bẫy dữ liệu

- **Point-in-time (bẫy lớn nhất):** `metadata`, `macro`, `news` đều là trạng thái tải về HÔM NAY. FRED/World Bank còn revise số quá khứ. Chỉ dùng lọc/đọc bối cảnh LIVE — backtest bằng mấy bảng này là tự lừa mình.
- **Kiểm tra scale sau backfill:** giá đóng cửa HPG phải ~23.000–30.000đ (không phải ~23). VNINDEX ~1.800 điểm.
- **36 mã giá < 1.000đ** (ACM, ATA, AVF, CAD…) là **penny/hàng lởm thật**, code giữ đúng nguyên giá — không phải lỗi. Filter `gtgd20_ty>=3` loại sạch nhóm này.
- **Cột boolean** (`above_sma200`, `golden_cross`, `near_52w_high`) lưu dạng chữ `"True"/"False"` trong CSV. Trong công thức so sánh `="True"`; nếu Power Query nhận thành kiểu logic thì đổi `=TRUE`.
- **Cột `exchange` ghi `HSX` chứ KHÔNG phải `HOSE`** (quy ước nguồn VCI; các giá trị: `HSX`, `HNX`, `UPCOM`, `DELISTED`) — filter nào so `="HOSE"` sẽ trả 0 kết quả trong im lặng (bug FTSE đã dính 07/2026, đã sửa trong `stock_analyzer.py`). Đây là đại diện của cả lớp "bẫy sai âm thầm" — xem 3 guard chống lỗi này ở [STOCK_ANALYZER.md](STOCK_ANALYZER.md).
- **Mã mới lên sàn < ~100 phiên:** RSI14/ATR14 hơi lệch TradingView do EWM chưa hội tụ. Mã lâu năm khớp tuyệt đối.
- **Giá điều chỉnh:** nếu đồ thị 1 mã vừa chia cổ tức/tách CP có gap gãy → nguồn trả giá thô, `ret_12m`/MA200 sẽ sai. Kiểm tra 1 mã để xác nhận nguồn đã adjust.
- **2 bảng trùng tên dễ nhầm trong DB:** `meta` = tiến độ backfill của file giá · `metadata` = cơ bản+luật của meta_sync. Script nào đụng nhầm là hỏng cơ chế resume.
- **Trạng thái backfill:** `done` = OK · `empty` = mã hủy niêm yết/không data (bỏ qua vĩnh viễn) · `failed` = lỗi mạng, chạy `backfill failed` để thử lại.
- **Màng lọc rác tự nhiên:** mã rác/ngừng giao dịch sinh lỗi "Dữ liệu trống" từ nguồn → khi CẢ HAI nguồn (VCI + KBS) cùng xác nhận rỗng, backfill đánh dấu `empty` vĩnh viễn. Hệ quả: kho luôn nhẹ mà không cần dọn tay, và KHÔNG có mã nào bị xóa dữ liệu.
- **blacklist.csv 2 lớp:** dòng note bắt đầu `Auto:` là máy sinh (đừng sửa tay); dòng khác là của mình (máy giữ nguyên, thắng khi trùng mã).
- **dividend_yield trong metadata: đơn vị %, trailing từ KBS** (0.08 của nguồn = 8.0 trong DB). Giá trị **-1 = "đã hỏi nguồn nhưng không có số"** (khác NULL = chưa cào) — lọc `>= 0` khi dùng.
- **Nguồn dữ liệu có thể gãy:** Yahoo chart là API unofficial (macro_sync đã bọc lỗi, 1 nguồn gãy không sập cả phiên; dự phòng: stooq.com). RSS feed nào chết chỉ in cảnh báo. VCI ratio bản free chỉ trả năm 2018 → PE/PB/ROE phải lấy từ KBS.
- **Fallback nguồn giá đã đổi TCBS → KBS (07/2026):** Quote của vnstock v4 chỉ nhận kbs/vci/msn/dnse/bina. KBS trả giá đơn vị NGHÌN như VCI — map scale đã cập nhật, **đừng thêm lại TCBS**.
- **Chuỗi tỷ giá VCB + vàng SJC** không có API lịch sử → chỉ tích lũy từ ngày bắt đầu chạy đều `macro_sync.py`.
- **CPI/GDP Việt Nam** từ World Bank là số NĂM, trễ ~6-12 tháng. CPI VN theo THÁNG không có API miễn phí.
- **BCTC ngân hàng/chứng khoán/bảo hiểm KHÔNG có `inventory`/`gross_margin`/`current_ratio`** trong `financial_snapshot.*` — đúng bản chất ngành, KHÔNG phải lỗi xử lý. Chi tiết: [FINANCIAL_REPORT.md](FINANCIAL_REPORT.md).
- **Nguồn KBS (ưu tiên trong `bctc_sync.py`) có lịch sử NGẮN hơn VCI** cho income/cash flow → `revenue_growth_yoy`/`profit_growth_yoy` null cao vì thiếu kỳ gốc, KHÔNG phải công thức sai.
- **`eps_calc`** (thay `eps_quarterly` thô) = `net_profit / shares_outstanding` — dùng shares CUỐI KỲ chứ không phải bình quân gia quyền như EPS chuẩn VAS, nên là **PROXY**.
- **Point-in-time áp dụng luôn cho BCTC:** các kỳ so sánh trong `financial_snapshot.*` đã coalesce ưu tiên **số điều chỉnh hồi tố mới nhất** — đúng cho phân tích hiện tại, không dùng để tái tạo báo cáo lịch sử tại đúng thời điểm công bố ban đầu.

## Bẫy vận hành / kỹ thuật

- **Rate-Limit (429) là TÍNH NĂNG AN TOÀN, không phải lỗi:** quota vnstock là 60 request/phút; pipeline chạy ~50 req/phút sát trần nên giờ cao điểm sau phiên thỉnh thoảng dính 429 → hệ thống tự chờ **15/30/45 giây** rồi thử lại. **TUYỆT ĐỐI không chạy 2 tiến trình gọi vnstock cùng lúc** — chúng chia nhau quota, cả hai cùng bị chặn, chậm hơn chạy tuần tự.
- **Mẫu nến là TRIGGER nhiễu cao, không phải tín hiệu mua:** `ta_signals.csv` mỗi phiên ra hàng trăm mã (Doji nhiều nhất). Chỉ dùng khi mã đã qua lọc nền: `margin_status` trống + `gtgd20_ty>=3` + rs_rating cao.
- **pandas-ta không thay được TA-Lib cho mẫu nến:** không có TA-Lib nó chỉ nhận diện Doji, các mẫu khác trả về rỗng ÂM THẦM. `candle_scan.py` vì thế tự viết công thức thuần pandas — **đừng refactor sang pandas-ta**.
- **candle_scan tự né ngày update dở dang:** nếu DB có ngày mới nhưng <50% số mã có nến, nó lùi về phiên đủ dữ liệu gần nhất và in cảnh báo — không phải bug.
- **Các trang dữ liệu mở kiểu gì cũng chạy:** mở thẳng `file://` dùng fallback `data/*.js` (`dashboard.html`, `screener.html`, `signals.html`); đưa lên GitHub Pages/http.server thì fetch JSON/CSV bình thường — **đừng xóa file .js tưởng là thừa**. Riêng `analysis.html` KHÔNG có fallback này (đọc thẳng `analysis_latest.json` qua fetch, cần http server hoặc GitHub Pages).

---

*Xem thêm: [ARCHITECTURE.md](ARCHITECTURE.md) · [CLI_REFERENCE.md](CLI_REFERENCE.md) · [STOCK_ANALYZER.md](STOCK_ANALYZER.md) · [FINANCIAL_REPORT.md](FINANCIAL_REPORT.md)*
