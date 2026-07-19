# Watchlist Forward-Return Evaluation (bản tối thiểu)

Generated: `2026-07-17T21:55:25+07:00`  ·  126 lượt pick trên 6 phiên (2026-07-10 → 2026-07-17)

Đây là thống kê mô tả forward return sau khi lọt watchlist_history — KHÔNG phải khuyến nghị mua/bán, KHÔNG phải kiểm định thống kê ý nghĩa (mẫu còn nhỏ).

## Tổng thể

| Horizon (phiên) | Đã đánh giá | Chưa đủ dữ liệu | Excess return TB (%) | Hit rate (%) |
|---|---|---|---|---|
| T+5 | 23 | 103 | 1.804 | 69.6 |
| T+20 | 0 | 126 | None | None |
| T+60 | 0 | 126 | None | None |

## Theo score bucket

| Bucket | N picks | T+5 excess TB (%) | T+20 excess TB (%) | T+60 excess TB (%) |
|---|---|---|---|---|
| 70-80 | 103 | 1.391 | None | None |
| 80-100 | 23 | 3.29 | None | None |

## Theo strategy (proxy 'TA signal' — xem giới hạn)

| Strategy | N picks | T+5 excess TB (%) | T+20 excess TB (%) | T+60 excess TB (%) |
|---|---|---|---|---|
| breakout | 2 | 2.236 | None | None |
| canslim | 15 | 2.415 | None | None |
| fscore | 78 | 1.49 | None | None |
| ftse | 46 | 0.975 | None | None |
| momentum | 34 | 3.83 | None | None |
| rs | 25 | 4.233 | None | None |
| sector | 54 | 1.974 | None | None |
| smc | 18 | 1.681 | None | None |
| turnaround | 3 | None | None | None |

## Giới hạn đã biết

- 'TA signal' trong by_strategy là cột strategies của stock_analyzer.py (chiến lược đã chọn mã), KHÔNG PHẢI tín hiệu nến/SMC candle_scan.py — không có bảng lịch sử ta_signals theo ngày để tra cứu lại quá khứ (xem docstring đầu file).
- watchlist_history mới bắt đầu tích lũy — số phiên 'evaluable' còn thấp cho T+20/T+60 cho tới khi đủ thời gian trôi qua; đây là trạng thái dự kiến, không phải lỗi.
- Đây là thống kê mô tả (descriptive), KHÔNG phải kiểm định thống kê (p-value/ý nghĩa thống kê) và KHÔNG phải khuyến nghị mua/bán.

## How AI Should Use This

Dùng để MÔ TẢ hiệu suất lịch sử của hệ thống chấm điểm, không dùng để đảm bảo hiệu suất tương lai; luôn nêu n_evaluable/n_pending kèm mọi con số trung bình; không suy ra ý nghĩa thống kê khi mẫu còn nhỏ; không đưa khuyến nghị mua/bán.
