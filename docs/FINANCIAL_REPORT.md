# Nhánh BCTC (Báo cáo tài chính quý)

> Gộp từ dự án `FINANCIAL_REPORT` độc lập cũ vào VNSTOCK (12/07/2026). Độc lập với 7 chân
> kiềng chính ([ARCHITECTURE.md](ARCHITECTURE.md)) — không dùng chung `vn_stock.db`, không
> ghi vào `VNSTOCK/data/` (thư mục web). Chi tiết audit API + logic tính toán nằm trong tài
> liệu nội bộ (không public): `docs/AUDIT_REPORT.md` + `docs/VALIDATION_REPORT.md`.

> ⚠️ **`FINANCIAL_REPORT/` không còn tồn tại như một dự án riêng** — đã gộp vào `VNSTOCK/`
> ngày 12/07/2026 (xem [CHANGELOG.md](../CHANGELOG.md) mục 1.1.0). Nếu bạn đang tìm
> `scrape_report.py` hoặc `financial_processor.py`: 2 file đó đã đổi tên thành
> `bctc_sync.py` và `bctc_processor.py`, chạy ngay trong `VNSTOCK/`.

## Lệnh chạy

```powershell
# Cào BCTC thô (nguồn KBS chính, VCI dự phòng)
python .\bctc_sync.py scrape --tickers HPG                           # 1 mã
python .\bctc_sync.py scrape --tickers HPG FPT VNM SSI               # nhiều mã
python .\bctc_sync.py scrape --file tickers_bctc.txt                 # từ danh sách mã (KHÔNG phải tickers.txt)
python .\bctc_sync.py scrape --tickers HPG --reports balance income  # chỉ 1 số loại BCTC
python .\bctc_sync.py scrape                                         # dùng config.json mặc định
python .\bctc_sync.py scrape --file tickers_bctc.txt --refresh       # cào lại toàn bộ
python .\bctc_sync.py status                                         # xem tiến độ (scrape_meta.csv)
python .\bctc_sync.py failed                                         # thử lại job lỗi mạng

# Chuẩn hóa -> financial_snapshot.csv/.parquet (đọc data_bctc/ cục bộ, KHÔNG gọi mạng)
python .\bctc_processor.py           # chạy chuẩn, ghi đè financial_snapshot.csv/.parquet
python .\bctc_processor.py --test    # audit 10 mã đại diện đủ 4 loại hình -> docs/VALIDATION_REPORT.md
```

**Tần suất:** BCTC doanh nghiệp công bố theo **quý** (~giữa T1/T4/T7/T10) — chạy `bctc_sync.py`
**1 lần/quý** là đủ, cùng nhịp `meta_sync.py --refresh`. Chạy dày hơn chỉ tốn request vô ích vì
số liệu nguồn không đổi giữa 2 mùa báo cáo. Chạy `bctc_processor.py` ngay sau khi `bctc_sync.py`
xong — script đọc lại **toàn bộ** `data_bctc/` mỗi lần (không tự resume theo tăng dần), nên chạy
lại bao nhiêu lần cũng an toàn và không tốn thêm request mạng.

**Kho:** `data_bctc/` (3.583 file `.parquet`+`.csv`, mỗi mã×loại báo cáo 2 file) + `scrape_meta.csv`
(tiến độ, cột `status` done/empty/failed) — cả 2 KHÔNG lên GitHub. `financial_snapshot.csv/.parquet`
là tầng **Truyền tải** (xem [ARCHITECTURE.md](ARCHITECTURE.md#các-tầng-dữ-liệu)).

## Công thức tài chính chuẩn hóa

| Chỉ tiêu | Công thức |
|---|---|
| Revenue Growth YoY | `(Revenue_t − Revenue_{t-4Q}) / abs(Revenue_{t-4Q})` — trị tuyệt đối ở mẫu số để tránh sai dấu khi năm trước âm |
| Free Cash Flow | `Operating Cash Flow − CAPEX` (CAPEX = trị tuyệt đối dòng "Tiền chi mua sắm, xây dựng TSCĐ" trong LCTT) |
| ROE | `Net Profit / Average Equity`, Average = `(Equity_t + Equity_{t-1}) / 2`, fallback Ending Equity nếu thiếu kỳ trước |
| EPS (`eps_calc`) | `Net Profit / Shares Outstanding` (thay cho `eps_quarterly` thô — xem lý do bên dưới) |

**Vì sao `eps_calc` thay cho `eps_quarterly` thô:** điều tra trên 10 mã đủ 4 loại hình cho thấy
nguồn KBS thiếu hoàn toàn `earnings_per_share_vnd` ở 6/10 mã (ngân hàng + chứng khoán + bảo
hiểm), và ở nhóm có số thì việc chia 1.000 để đưa về đúng đơn vị vẫn lệch không ổn định
(0,6x–1,1x so với đối chứng). `eps_calc` dùng `shares_outstanding` CUỐI KỲ (không phải bình
quân gia quyền như EPS chuẩn VAS công bố chính thức) nên vẫn là **proxy**, có thể lệch ở mã
vừa phát hành/mua lại cổ phiếu giữa kỳ.

## Bẫy dữ liệu riêng của nhánh BCTC

- **Ngân hàng/chứng khoán/bảo hiểm không có `inventory`/`gross_margin`/`current_ratio`** — đã kiểm chứng bằng số thật (NaN 8/8 kỳ trên VCB/BID/MBB, không phải 0 hay số rác) — đúng bản chất ngành, KHÔNG phải lỗi xử lý.
- **Nguồn KBS có lịch sử ngắn hơn VCI** cho income/cash flow (KBS 2-4 kỳ · VCI đủ 8 kỳ, giới hạn bản community) → `revenue_growth_yoy`/`profit_growth_yoy` null cao vì thiếu kỳ gốc cùng kỳ năm trước, KHÔNG phải công thức sai.
- **Point-in-time:** các kỳ so sánh đã coalesce ưu tiên số điều chỉnh hồi tố mới nhất (không phải số gốc công bố lần đầu) — đúng cho phân tích hiện tại, không dùng để tái dựng đúng số đã công bố tại thời điểm gốc.
- **`roe`/`roa` trong `financial_snapshot.*` là theo QUÝ** (chưa annualize) — khác hẳn đơn vị `roe` trailing-4-quý trong bảng `metadata` của pipeline giá. Đừng trộn 2 cột cùng tên ở 2 file khác nhau.

Danh sách đầy đủ hơn (mapping item_id thô, độ phủ theo mã, các lỗ hổng đã phát hiện và
quyết định xử lý) nằm trong tài liệu audit nội bộ, không thuộc phạm vi tài liệu public này.

---

*Xem thêm: [ARCHITECTURE.md](ARCHITECTURE.md) · [DATA_PIPELINE.md](DATA_PIPELINE.md) · [CLI_REFERENCE.md](CLI_REFERENCE.md)*
