# Stock Analyzer — Bộ phân tích offline

> `stock_analyzer.py` là lớp phân tích đọc output có sẵn của pipeline (KHÔNG thay thế
> pipeline, không gọi mạng, 0 request — đối trọng miễn phí của `ai_analyzer.py`). Tách ra
> từ README ngày 12/07/2026.

## Chế độ chạy

| Chế độ | Lệnh | Đầu ra |
|---|---|---|
| Quant engine | `--strategy all` (hoặc 1 tên: `value` `canslim` `momentum` `ftse` `fscore` `smc` `breakout` `turnaround` `rs` `sector`) | `analysis_latest.json` (~60 KB) + `analysis_latest.md` (~25 KB) |
| Phân tích sâu | `--tickers HPG SSI ...` | `Focus_Analysis.md` |
| Quét nhanh | `--scan-market` | `Market_Scan.md` + `.csv` |
| Tình trạng | `--list-strategies` | in console (chiến lược + nguồn dữ liệu) |
| Tự kiểm | `--selftest` | unittest trên fixture `tests/` (17 mã bịa) — exit 0 nếu pass; chạy sau mỗi lần sửa code |

## Chấm điểm 0-100

Mỗi mã = 6 cấu phần có trọng số: **cơ bản 25%** · **kỹ thuật 20%** · **đà 20%** ·
**thanh khoản 15%** · **vĩ mô 10%** · **rủi ro 10%** — công thức và giải thích từng mã nằm
ngay trong báo cáo (mục `score_method`).

- `analysis_latest.json/.md` đủ nhẹ để gửi thẳng vào chat AI (thay combo CSV ở
  [DATA_PIPELINE.md](DATA_PIPELINE.md#gửi-file-cho-ai-phân-tích-không-cần-excel)) hoặc nhúng dashboard.
- Ghi vào `vn_stock.db` **DUY NHẤT bảng `watchlist_history`** (top 20 điểm mỗi phiên, khóa
  `session_date+ticker` — nền cho backtest sau); không đụng bảng nào của pipeline.
- Ngưỡng lọc là hằng số đầu file — chỉnh ở đó, đừng sửa trong logic. `fscore` là bản
  **proxy** (kho chưa có BCTC nhiều kỳ) và chỉ xét mã **nền sạch** (án sàn/kém thanh khoản
  loại thẳng). Chạy SAU chuỗi cập nhật hằng ngày ([CLI_REFERENCE.md](CLI_REFERENCE.md)) để có
  số mới nhất. Log: `logs/stock_analyzer.log`.

## 3 guard chống "sai âm thầm"

Tự động hóa thói quen "liếc số lượng mã" — bài học từ bug FTSE `HSX` vs `HOSE` (xem
[DATA_PIPELINE.md](DATA_PIPELINE.md#bẫy-dữ-liệu)):

1. **Schema guard** — thiếu cột snapshot → DỪNG kèm tên cột + chiến lược cần nó.
2. **Domain guard** — cột `exchange` có giá trị ngoài `{HSX, HNX, UPCOM, DELISTED}` → cảnh báo.
3. **Sentinel guard** — chiến lược trả **0 mã** khi universe ≥ 200 → cảnh báo nghi filter hỏng.

## Thư viện chỉ báo kỹ thuật — `vn_indicators.py`

`vn_indicators.py` gồm 2 phần: **Phần 1 = thư viện chỉ báo chính thức** (Analyzer/Dashboard/AI
import từ đây) và Phần 2 = mixer snapshot (hành vi & schema CSV không đổi).

**Quy ước chung mọi hàm** (vi phạm là bug):
- Nhận `DataFrame` có cột `open/high/low/close/volume` (không phân biệt hoa thường), trả về
  `Series`/`DataFrame` **cùng index, không bao giờ drop dòng**.
- Chia an toàn: mẫu số 0 → `NaN` (không exception, không `inf`).
- Vector hóa pandas/numpy toàn bộ; ngoại lệ duy nhất `zigzag()` (bản chất tuần tự).

| Nhóm | Hàm | Ghi chú |
|---|---|---|
| Trend | `sma` `ema` `wma` `vwma` | `wma` trọng số tuyến tính; `vwma` theo volume |
| Momentum | `rsi` `macd` `stochastic` `williams_r` `roc` | RSI/ATR chuẩn Wilder khớp TradingView |
| Volume | `obv` `cmf` `mfi` `volume_oscillator` | nến trần/sàn cứng (H=L): CMF hệ số 0, không NaN |
| Volatility | `true_range` `atr` `bollinger_bands` `keltner_channel` | Bollinger ddof=0 chuẩn sách |
| Trend strength | `adx` | trả `plus_di`/`minus_di`/`adx` |
| Hỗ trợ/kháng cự | `fibonacci_retracement` `pivot_points` | pivot tính từ phiên TRƯỚC, không nhìn tương lai |
| Mây | `ichimoku` | ⚠️ cột `chikou` chứa close TƯƠNG LAI — cấm làm feature backtest |
| Smart Money (proxy) | `fair_value_gap` `order_block` `market_structure` `break_of_structure` `change_of_character` | proxy máy móc 1 khung thời gian |
| Mẫu hình | `fractal` `zigzag` `elliott_wave_proxy` | ⚠️ pivot xác nhận TRỄ — backtest phải shift |

```python
import sqlite3, pandas as pd
from vn_indicators import rsi, macd, ichimoku, adx, market_structure, zigzag

conn = sqlite3.connect("vn_stock.db")
df = pd.read_sql("SELECT date, open, high, low, close, volume FROM ohlcv"
                 " WHERE ticker='HPG' ORDER BY date", conn, parse_dates=["date"]).set_index("date")

df["rsi14"] = rsi(df, 14)                    # Series
df = df.join(macd(df))                       # DataFrame: macd, macd_signal, macd_hist
df = df.join(adx(df, 14))                    # plus_di, minus_di, adx
ms = market_structure(df)                    # bos_up/down, choch_up/down, ms_trend
tin_hieu_gay_trend = ms["choch_down"].iloc[-1]

zz = zigzag(df, pct=7.0)                     # pivot dao động ≥7% (mặc định 5%)
```

Bẫy cần nhớ khi dùng cho backtest: `fractal`/`swing_high` (center=True) biết trước n nến;
`zigzag`/`elliott_wave_proxy` chỉ xác nhận pivot sau khi giá đã đảo đủ %; `ichimoku().chikou`
là giá tương lai. Screening live thì dùng trực tiếp được — các cờ SMC (`market_structure`,
`order_block`, `fair_value_gap`) đều đặt tại nến xác nhận, không nhìn tương lai.

---

*Xem thêm: [ARCHITECTURE.md](ARCHITECTURE.md) · [DATA_PIPELINE.md](DATA_PIPELINE.md) · [CLI_REFERENCE.md](CLI_REFERENCE.md)*
