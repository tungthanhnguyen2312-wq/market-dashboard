window.MACRO_SNAPSHOT = {
  "schema_version": 1,
  "generated_at": "2026-07-15T06:54:50+07:00",
  "pipeline_completed_at": "2026-07-15T06:54:50+07:00",
  "published_at": null,
  "data_as_of": "2026-07-15",
  "source_type": "local_pipeline",
  "update_policy": "updated_on_publish",
  "quality": {
    "catalog_count": 17,
    "available_count": 17,
    "missing_count": 0,
    "stale_count": 1,
    "is_partial": false
  },
  "indicators": [
    {
      "key": "us_fedfunds",
      "label": "Lãi suất Fed Funds",
      "category": "rates",
      "value": 3.63,
      "previous_value": 3.63,
      "change": 0.0,
      "change_pct": 0.0,
      "change_basis": "percentage_point",
      "direction": "flat",
      "interpretation": "unknown",
      "unit": "%/năm",
      "period": "2026-06-01",
      "frequency": "monthly",
      "frequency_label": "Hằng tháng",
      "source": "FRED",
      "source_url": "https://fred.stlouisfed.org/series/FEDFUNDS",
      "pipeline_updated_at": "2026-07-15T06:54:50+07:00",
      "status": "available",
      "freshness": {
        "status": "current",
        "age_days": 44,
        "stale_after_days": 62
      },
      "history_points": 120,
      "history_scope": null
    },
    {
      "key": "us_10y",
      "label": "Lợi suất TPCP Mỹ 10 năm",
      "category": "rates",
      "value": 4.62,
      "previous_value": 4.56,
      "change": 0.0600000000000005,
      "change_pct": 1.3157894736842215,
      "change_basis": "percentage_point",
      "direction": "up",
      "interpretation": "unknown",
      "unit": "%/năm",
      "period": "2026-07-13",
      "frequency": "daily",
      "frequency_label": "Hằng ngày",
      "source": "FRED",
      "source_url": "https://fred.stlouisfed.org/series/DGS10",
      "pipeline_updated_at": "2026-07-15T06:54:50+07:00",
      "status": "available",
      "freshness": {
        "status": "current",
        "age_days": 2,
        "stale_after_days": 7
      },
      "history_points": 400,
      "history_scope": null
    },
    {
      "key": "us_cpi",
      "label": "CPI Mỹ (index 82-84=100)",
      "category": "inflation_growth",
      "value": 332.568,
      "previous_value": 333.979,
      "change": -1.4110000000000014,
      "change_pct": -0.42248165303806573,
      "change_basis": "percent",
      "direction": "down",
      "interpretation": "unknown",
      "unit": "index",
      "period": "2026-06-01",
      "frequency": "monthly",
      "frequency_label": "Hằng tháng",
      "source": "FRED",
      "source_url": "https://fred.stlouisfed.org/series/CPIAUCSL",
      "pipeline_updated_at": "2026-07-15T06:54:50+07:00",
      "status": "available",
      "freshness": {
        "status": "current",
        "age_days": 44,
        "stale_after_days": 62
      },
      "history_points": 120,
      "history_scope": null
    },
    {
      "key": "dxy",
      "label": "USD Index (broad)",
      "category": "currency",
      "value": 120.5046,
      "previous_value": 120.753,
      "change": -0.24840000000000373,
      "change_pct": -0.2057091749273341,
      "change_basis": "percent",
      "direction": "down",
      "interpretation": "unknown",
      "unit": "index",
      "period": "2026-07-10",
      "frequency": "daily",
      "frequency_label": "Hằng ngày",
      "source": "FRED",
      "source_url": "https://fred.stlouisfed.org/series/DTWEXBGS",
      "pipeline_updated_at": "2026-07-15T06:54:50+07:00",
      "status": "available",
      "freshness": {
        "status": "current",
        "age_days": 5,
        "stale_after_days": 7
      },
      "history_points": 400,
      "history_scope": null
    },
    {
      "key": "wti",
      "label": "Dầu WTI",
      "category": "commodities",
      "value": 69.6,
      "previous_value": 69.73,
      "change": -0.13000000000000966,
      "change_pct": -0.1864333859171227,
      "change_basis": "percent",
      "direction": "down",
      "interpretation": "unknown",
      "unit": "USD/thùng",
      "period": "2026-07-06",
      "frequency": "daily",
      "frequency_label": "Hằng ngày",
      "source": "FRED",
      "source_url": "https://fred.stlouisfed.org/series/DCOILWTICO",
      "pipeline_updated_at": "2026-07-15T06:54:50+07:00",
      "status": "available",
      "freshness": {
        "status": "stale",
        "age_days": 9,
        "stale_after_days": 7
      },
      "history_points": 400,
      "history_scope": null
    },
    {
      "key": "sp500",
      "label": "S&P 500",
      "category": "markets",
      "value": 7543.58984375,
      "previous_value": 7515.33984375,
      "change": 28.25,
      "change_pct": 0.37589783811963756,
      "change_basis": "percent",
      "direction": "up",
      "interpretation": "unknown",
      "unit": "điểm",
      "period": "2026-07-14",
      "frequency": "daily",
      "frequency_label": "Hằng ngày",
      "source": "Yahoo Finance",
      "source_url": "https://finance.yahoo.com/quote/%5EGSPC",
      "pipeline_updated_at": "2026-07-15T06:54:50+07:00",
      "status": "available",
      "freshness": {
        "status": "current",
        "age_days": 1,
        "stale_after_days": 7
      },
      "history_points": 400,
      "history_scope": null
    },
    {
      "key": "nasdaq",
      "label": "Nasdaq Composite",
      "category": "markets",
      "value": 26107.0078125,
      "previous_value": 25873.1796875,
      "change": 233.828125,
      "change_pct": 0.903747153709787,
      "change_basis": "percent",
      "direction": "up",
      "interpretation": "unknown",
      "unit": "điểm",
      "period": "2026-07-14",
      "frequency": "daily",
      "frequency_label": "Hằng ngày",
      "source": "Yahoo Finance",
      "source_url": "https://finance.yahoo.com/quote/%5EIXIC",
      "pipeline_updated_at": "2026-07-15T06:54:50+07:00",
      "status": "available",
      "freshness": {
        "status": "current",
        "age_days": 1,
        "stale_after_days": 7
      },
      "history_points": 400,
      "history_scope": null
    },
    {
      "key": "vix",
      "label": "VIX",
      "category": "risk",
      "value": 16.5,
      "previous_value": 17.15999984741211,
      "change": -0.6599998474121094,
      "change_pct": -3.8461529911472794,
      "change_basis": "percent",
      "direction": "down",
      "interpretation": "unknown",
      "unit": "điểm",
      "period": "2026-07-14",
      "frequency": "daily",
      "frequency_label": "Hằng ngày",
      "source": "Yahoo Finance",
      "source_url": "https://finance.yahoo.com/quote/%5EVIX",
      "pipeline_updated_at": "2026-07-15T06:54:50+07:00",
      "status": "available",
      "freshness": {
        "status": "current",
        "age_days": 1,
        "stale_after_days": 7
      },
      "history_points": 400,
      "history_scope": null
    },
    {
      "key": "nikkei",
      "label": "Nikkei 225",
      "category": "markets",
      "value": 67242.7265625,
      "previous_value": 68557.7265625,
      "change": -1315.0,
      "change_pct": -1.9180916082466544,
      "change_basis": "percent",
      "direction": "down",
      "interpretation": "unknown",
      "unit": "điểm",
      "period": "2026-07-13",
      "frequency": "daily",
      "frequency_label": "Hằng ngày",
      "source": "Yahoo Finance",
      "source_url": "https://finance.yahoo.com/quote/%5EN225",
      "pipeline_updated_at": "2026-07-15T06:54:50+07:00",
      "status": "available",
      "freshness": {
        "status": "current",
        "age_days": 2,
        "stale_after_days": 7
      },
      "history_points": 400,
      "history_scope": null
    },
    {
      "key": "hsi",
      "label": "Hang Seng",
      "category": "markets",
      "value": 24213.720703125,
      "previous_value": 24175.119140625,
      "change": 38.6015625,
      "change_pct": 0.15967475599792239,
      "change_basis": "percent",
      "direction": "up",
      "interpretation": "unknown",
      "unit": "điểm",
      "period": "2026-07-13",
      "frequency": "daily",
      "frequency_label": "Hằng ngày",
      "source": "Yahoo Finance",
      "source_url": "https://finance.yahoo.com/quote/%5EHSI",
      "pipeline_updated_at": "2026-07-15T06:54:50+07:00",
      "status": "available",
      "freshness": {
        "status": "current",
        "age_days": 2,
        "stale_after_days": 7
      },
      "history_points": 400,
      "history_scope": null
    },
    {
      "key": "gold_world",
      "label": "Vàng thế giới",
      "category": "commodities",
      "value": 4060.60009765625,
      "previous_value": 3997.0,
      "change": 63.60009765625,
      "change_pct": 1.5911958382849638,
      "change_basis": "percent",
      "direction": "up",
      "interpretation": "unknown",
      "unit": "USD/oz",
      "period": "2026-07-14",
      "frequency": "daily",
      "frequency_label": "Hằng ngày",
      "source": "Yahoo Finance",
      "source_url": "https://finance.yahoo.com/quote/GC=F",
      "pipeline_updated_at": "2026-07-15T06:54:50+07:00",
      "status": "available",
      "freshness": {
        "status": "current",
        "age_days": 1,
        "stale_after_days": 7
      },
      "history_points": 400,
      "history_scope": null
    },
    {
      "key": "brent",
      "label": "Dầu Brent",
      "category": "commodities",
      "value": 85.30000305175781,
      "previous_value": 83.30000305175781,
      "change": 2.0,
      "change_pct": 2.400960296192685,
      "change_basis": "percent",
      "direction": "up",
      "interpretation": "unknown",
      "unit": "USD/thùng",
      "period": "2026-07-14",
      "frequency": "daily",
      "frequency_label": "Hằng ngày",
      "source": "Yahoo Finance",
      "source_url": "https://finance.yahoo.com/quote/BZ=F",
      "pipeline_updated_at": "2026-07-15T06:54:50+07:00",
      "status": "available",
      "freshness": {
        "status": "current",
        "age_days": 1,
        "stale_after_days": 7
      },
      "history_points": 400,
      "history_scope": null
    },
    {
      "key": "usdvnd_mkt",
      "label": "USD/VND (quốc tế)",
      "category": "currency",
      "value": 26250.0,
      "previous_value": 26261.0,
      "change": -11.0,
      "change_pct": -0.04188720916949088,
      "change_basis": "percent",
      "direction": "down",
      "interpretation": "unknown",
      "unit": "đồng/USD",
      "period": "2026-07-13",
      "frequency": "daily",
      "frequency_label": "Hằng ngày",
      "source": "Yahoo Finance",
      "source_url": "https://finance.yahoo.com/quote/VND=X",
      "pipeline_updated_at": "2026-07-15T06:54:50+07:00",
      "status": "available",
      "freshness": {
        "status": "current",
        "age_days": 2,
        "stale_after_days": 7
      },
      "history_points": 400,
      "history_scope": null
    },
    {
      "key": "usdvnd_vcb",
      "label": "USD/VND (VCB bán ra)",
      "category": "currency",
      "value": 26450.0,
      "previous_value": 26460.0,
      "change": -10.0,
      "change_pct": -0.03779289493575208,
      "change_basis": "percent",
      "direction": "down",
      "interpretation": "unknown",
      "unit": "đồng/USD",
      "period": "2026-07-15",
      "frequency": "daily",
      "frequency_label": "Hằng ngày",
      "source": "Vietcombank",
      "source_url": "https://www.vietcombank.com.vn/vi-VN/KHCN/Cong-cu-tien-ich/Ty-gia",
      "pipeline_updated_at": "2026-07-15T06:54:50+07:00",
      "status": "available",
      "freshness": {
        "status": "current",
        "age_days": 0,
        "stale_after_days": 7
      },
      "history_points": 6,
      "history_scope": "Lịch sử tích lũy từ khi pipeline bắt đầu chạy đều."
    },
    {
      "key": "gold_sjc",
      "label": "Vàng SJC bán ra (HCM)",
      "category": "commodities",
      "value": 147500000.0,
      "previous_value": 148400000.0,
      "change": -900000.0,
      "change_pct": -0.6064690026954178,
      "change_basis": "percent",
      "direction": "down",
      "interpretation": "unknown",
      "unit": "đồng/lượng",
      "period": "2026-07-15",
      "frequency": "daily",
      "frequency_label": "Hằng ngày",
      "source": "SJC",
      "source_url": "https://sjc.com.vn/",
      "pipeline_updated_at": "2026-07-15T06:54:50+07:00",
      "status": "available",
      "freshness": {
        "status": "current",
        "age_days": 0,
        "stale_after_days": 7
      },
      "history_points": 6,
      "history_scope": "Lịch sử tích lũy từ khi pipeline bắt đầu chạy đều."
    },
    {
      "key": "vn_cpi_yoy",
      "label": "CPI VN (YoY)",
      "category": "inflation_growth",
      "value": 3.3099931421974,
      "previous_value": 3.62109273885844,
      "change": -0.31109959666104015,
      "change_pct": -8.59131812125627,
      "change_basis": "percentage_point",
      "direction": "down",
      "interpretation": "unknown",
      "unit": "%/năm",
      "period": "2025-12-31",
      "frequency": "annual",
      "frequency_label": "Hằng năm",
      "source": "World Bank",
      "source_url": "https://data.worldbank.org/indicator/FP.CPI.TOTL.ZG?locations=VN",
      "pipeline_updated_at": "2026-07-15T06:54:50+07:00",
      "status": "available",
      "freshness": {
        "status": "current",
        "age_days": 196,
        "stale_after_days": 550
      },
      "history_points": 30,
      "history_scope": null
    },
    {
      "key": "vn_gdp_yoy",
      "label": "Tăng trưởng GDP VN",
      "category": "inflation_growth",
      "value": 8.01882998978245,
      "previous_value": 7.03955197123018,
      "change": 0.9792780185522698,
      "change_pct": 13.91108443483994,
      "change_basis": "percentage_point",
      "direction": "up",
      "interpretation": "unknown",
      "unit": "%/năm",
      "period": "2025-12-31",
      "frequency": "annual",
      "frequency_label": "Hằng năm",
      "source": "World Bank",
      "source_url": "https://data.worldbank.org/indicator/NY.GDP.MKTP.KD.ZG?locations=VN",
      "pipeline_updated_at": "2026-07-15T06:54:50+07:00",
      "status": "available",
      "freshness": {
        "status": "current",
        "age_days": 196,
        "stale_after_days": 550
      },
      "history_points": 41,
      "history_scope": null
    }
  ],
  "series": {
    "us_fedfunds": [
      {
        "date": "2016-07-01",
        "value": 0.39
      },
      {
        "date": "2016-08-01",
        "value": 0.4
      },
      {
        "date": "2016-09-01",
        "value": 0.4
      },
      {
        "date": "2016-10-01",
        "value": 0.4
      },
      {
        "date": "2016-11-01",
        "value": 0.41
      },
      {
        "date": "2016-12-01",
        "value": 0.54
      },
      {
        "date": "2017-01-01",
        "value": 0.65
      },
      {
        "date": "2017-02-01",
        "value": 0.66
      },
      {
        "date": "2017-03-01",
        "value": 0.79
      },
      {
        "date": "2017-04-01",
        "value": 0.9
      },
      {
        "date": "2017-05-01",
        "value": 0.91
      },
      {
        "date": "2017-06-01",
        "value": 1.04
      },
      {
        "date": "2017-07-01",
        "value": 1.15
      },
      {
        "date": "2017-08-01",
        "value": 1.16
      },
      {
        "date": "2017-09-01",
        "value": 1.15
      },
      {
        "date": "2017-10-01",
        "value": 1.15
      },
      {
        "date": "2017-11-01",
        "value": 1.16
      },
      {
        "date": "2017-12-01",
        "value": 1.3
      },
      {
        "date": "2018-01-01",
        "value": 1.41
      },
      {
        "date": "2018-02-01",
        "value": 1.42
      },
      {
        "date": "2018-03-01",
        "value": 1.51
      },
      {
        "date": "2018-04-01",
        "value": 1.69
      },
      {
        "date": "2018-05-01",
        "value": 1.7
      },
      {
        "date": "2018-06-01",
        "value": 1.82
      },
      {
        "date": "2018-07-01",
        "value": 1.91
      },
      {
        "date": "2018-08-01",
        "value": 1.91
      },
      {
        "date": "2018-09-01",
        "value": 1.95
      },
      {
        "date": "2018-10-01",
        "value": 2.19
      },
      {
        "date": "2018-11-01",
        "value": 2.2
      },
      {
        "date": "2018-12-01",
        "value": 2.27
      },
      {
        "date": "2019-01-01",
        "value": 2.4
      },
      {
        "date": "2019-02-01",
        "value": 2.4
      },
      {
        "date": "2019-03-01",
        "value": 2.41
      },
      {
        "date": "2019-04-01",
        "value": 2.42
      },
      {
        "date": "2019-05-01",
        "value": 2.39
      },
      {
        "date": "2019-06-01",
        "value": 2.38
      },
      {
        "date": "2019-07-01",
        "value": 2.4
      },
      {
        "date": "2019-08-01",
        "value": 2.13
      },
      {
        "date": "2019-09-01",
        "value": 2.04
      },
      {
        "date": "2019-10-01",
        "value": 1.83
      },
      {
        "date": "2019-11-01",
        "value": 1.55
      },
      {
        "date": "2019-12-01",
        "value": 1.55
      },
      {
        "date": "2020-01-01",
        "value": 1.55
      },
      {
        "date": "2020-02-01",
        "value": 1.58
      },
      {
        "date": "2020-03-01",
        "value": 0.65
      },
      {
        "date": "2020-04-01",
        "value": 0.05
      },
      {
        "date": "2020-05-01",
        "value": 0.05
      },
      {
        "date": "2020-06-01",
        "value": 0.08
      },
      {
        "date": "2020-07-01",
        "value": 0.09
      },
      {
        "date": "2020-08-01",
        "value": 0.1
      },
      {
        "date": "2020-09-01",
        "value": 0.09
      },
      {
        "date": "2020-10-01",
        "value": 0.09
      },
      {
        "date": "2020-11-01",
        "value": 0.09
      },
      {
        "date": "2020-12-01",
        "value": 0.09
      },
      {
        "date": "2021-01-01",
        "value": 0.09
      },
      {
        "date": "2021-02-01",
        "value": 0.08
      },
      {
        "date": "2021-03-01",
        "value": 0.07
      },
      {
        "date": "2021-04-01",
        "value": 0.07
      },
      {
        "date": "2021-05-01",
        "value": 0.06
      },
      {
        "date": "2021-06-01",
        "value": 0.08
      },
      {
        "date": "2021-07-01",
        "value": 0.1
      },
      {
        "date": "2021-08-01",
        "value": 0.09
      },
      {
        "date": "2021-09-01",
        "value": 0.08
      },
      {
        "date": "2021-10-01",
        "value": 0.08
      },
      {
        "date": "2021-11-01",
        "value": 0.08
      },
      {
        "date": "2021-12-01",
        "value": 0.08
      },
      {
        "date": "2022-01-01",
        "value": 0.08
      },
      {
        "date": "2022-02-01",
        "value": 0.08
      },
      {
        "date": "2022-03-01",
        "value": 0.2
      },
      {
        "date": "2022-04-01",
        "value": 0.33
      },
      {
        "date": "2022-05-01",
        "value": 0.77
      },
      {
        "date": "2022-06-01",
        "value": 1.21
      },
      {
        "date": "2022-07-01",
        "value": 1.68
      },
      {
        "date": "2022-08-01",
        "value": 2.33
      },
      {
        "date": "2022-09-01",
        "value": 2.56
      },
      {
        "date": "2022-10-01",
        "value": 3.08
      },
      {
        "date": "2022-11-01",
        "value": 3.78
      },
      {
        "date": "2022-12-01",
        "value": 4.1
      },
      {
        "date": "2023-01-01",
        "value": 4.33
      },
      {
        "date": "2023-02-01",
        "value": 4.57
      },
      {
        "date": "2023-03-01",
        "value": 4.65
      },
      {
        "date": "2023-04-01",
        "value": 4.83
      },
      {
        "date": "2023-05-01",
        "value": 5.06
      },
      {
        "date": "2023-06-01",
        "value": 5.08
      },
      {
        "date": "2023-07-01",
        "value": 5.12
      },
      {
        "date": "2023-08-01",
        "value": 5.33
      },
      {
        "date": "2023-09-01",
        "value": 5.33
      },
      {
        "date": "2023-10-01",
        "value": 5.33
      },
      {
        "date": "2023-11-01",
        "value": 5.33
      },
      {
        "date": "2023-12-01",
        "value": 5.33
      },
      {
        "date": "2024-01-01",
        "value": 5.33
      },
      {
        "date": "2024-02-01",
        "value": 5.33
      },
      {
        "date": "2024-03-01",
        "value": 5.33
      },
      {
        "date": "2024-04-01",
        "value": 5.33
      },
      {
        "date": "2024-05-01",
        "value": 5.33
      },
      {
        "date": "2024-06-01",
        "value": 5.33
      },
      {
        "date": "2024-07-01",
        "value": 5.33
      },
      {
        "date": "2024-08-01",
        "value": 5.33
      },
      {
        "date": "2024-09-01",
        "value": 5.13
      },
      {
        "date": "2024-10-01",
        "value": 4.83
      },
      {
        "date": "2024-11-01",
        "value": 4.64
      },
      {
        "date": "2024-12-01",
        "value": 4.48
      },
      {
        "date": "2025-01-01",
        "value": 4.33
      },
      {
        "date": "2025-02-01",
        "value": 4.33
      },
      {
        "date": "2025-03-01",
        "value": 4.33
      },
      {
        "date": "2025-04-01",
        "value": 4.33
      },
      {
        "date": "2025-05-01",
        "value": 4.33
      },
      {
        "date": "2025-06-01",
        "value": 4.33
      },
      {
        "date": "2025-07-01",
        "value": 4.33
      },
      {
        "date": "2025-08-01",
        "value": 4.33
      },
      {
        "date": "2025-09-01",
        "value": 4.22
      },
      {
        "date": "2025-10-01",
        "value": 4.09
      },
      {
        "date": "2025-11-01",
        "value": 3.88
      },
      {
        "date": "2025-12-01",
        "value": 3.72
      },
      {
        "date": "2026-01-01",
        "value": 3.64
      },
      {
        "date": "2026-02-01",
        "value": 3.64
      },
      {
        "date": "2026-03-01",
        "value": 3.64
      },
      {
        "date": "2026-04-01",
        "value": 3.64
      },
      {
        "date": "2026-05-01",
        "value": 3.63
      },
      {
        "date": "2026-06-01",
        "value": 3.63
      }
    ],
    "us_10y": [
      {
        "date": "2024-12-04",
        "value": 4.19
      },
      {
        "date": "2024-12-05",
        "value": 4.17
      },
      {
        "date": "2024-12-06",
        "value": 4.15
      },
      {
        "date": "2024-12-09",
        "value": 4.2
      },
      {
        "date": "2024-12-10",
        "value": 4.22
      },
      {
        "date": "2024-12-11",
        "value": 4.26
      },
      {
        "date": "2024-12-12",
        "value": 4.32
      },
      {
        "date": "2024-12-13",
        "value": 4.4
      },
      {
        "date": "2024-12-16",
        "value": 4.39
      },
      {
        "date": "2024-12-17",
        "value": 4.4
      },
      {
        "date": "2024-12-18",
        "value": 4.5
      },
      {
        "date": "2024-12-19",
        "value": 4.57
      },
      {
        "date": "2024-12-20",
        "value": 4.52
      },
      {
        "date": "2024-12-23",
        "value": 4.59
      },
      {
        "date": "2024-12-24",
        "value": 4.59
      },
      {
        "date": "2024-12-26",
        "value": 4.58
      },
      {
        "date": "2024-12-27",
        "value": 4.62
      },
      {
        "date": "2024-12-30",
        "value": 4.55
      },
      {
        "date": "2024-12-31",
        "value": 4.58
      },
      {
        "date": "2025-01-02",
        "value": 4.57
      },
      {
        "date": "2025-01-03",
        "value": 4.6
      },
      {
        "date": "2025-01-06",
        "value": 4.62
      },
      {
        "date": "2025-01-07",
        "value": 4.67
      },
      {
        "date": "2025-01-08",
        "value": 4.67
      },
      {
        "date": "2025-01-09",
        "value": 4.68
      },
      {
        "date": "2025-01-10",
        "value": 4.77
      },
      {
        "date": "2025-01-13",
        "value": 4.79
      },
      {
        "date": "2025-01-14",
        "value": 4.78
      },
      {
        "date": "2025-01-15",
        "value": 4.66
      },
      {
        "date": "2025-01-16",
        "value": 4.61
      },
      {
        "date": "2025-01-17",
        "value": 4.61
      },
      {
        "date": "2025-01-21",
        "value": 4.57
      },
      {
        "date": "2025-01-22",
        "value": 4.6
      },
      {
        "date": "2025-01-23",
        "value": 4.65
      },
      {
        "date": "2025-01-24",
        "value": 4.63
      },
      {
        "date": "2025-01-27",
        "value": 4.53
      },
      {
        "date": "2025-01-28",
        "value": 4.55
      },
      {
        "date": "2025-01-29",
        "value": 4.55
      },
      {
        "date": "2025-01-30",
        "value": 4.52
      },
      {
        "date": "2025-01-31",
        "value": 4.58
      },
      {
        "date": "2025-02-03",
        "value": 4.54
      },
      {
        "date": "2025-02-04",
        "value": 4.52
      },
      {
        "date": "2025-02-05",
        "value": 4.43
      },
      {
        "date": "2025-02-06",
        "value": 4.45
      },
      {
        "date": "2025-02-07",
        "value": 4.49
      },
      {
        "date": "2025-02-10",
        "value": 4.51
      },
      {
        "date": "2025-02-11",
        "value": 4.54
      },
      {
        "date": "2025-02-12",
        "value": 4.62
      },
      {
        "date": "2025-02-13",
        "value": 4.52
      },
      {
        "date": "2025-02-14",
        "value": 4.47
      },
      {
        "date": "2025-02-18",
        "value": 4.55
      },
      {
        "date": "2025-02-19",
        "value": 4.53
      },
      {
        "date": "2025-02-20",
        "value": 4.5
      },
      {
        "date": "2025-02-21",
        "value": 4.42
      },
      {
        "date": "2025-02-24",
        "value": 4.4
      },
      {
        "date": "2025-02-25",
        "value": 4.3
      },
      {
        "date": "2025-02-26",
        "value": 4.25
      },
      {
        "date": "2025-02-27",
        "value": 4.29
      },
      {
        "date": "2025-02-28",
        "value": 4.24
      },
      {
        "date": "2025-03-03",
        "value": 4.16
      },
      {
        "date": "2025-03-04",
        "value": 4.22
      },
      {
        "date": "2025-03-05",
        "value": 4.28
      },
      {
        "date": "2025-03-06",
        "value": 4.29
      },
      {
        "date": "2025-03-07",
        "value": 4.32
      },
      {
        "date": "2025-03-10",
        "value": 4.22
      },
      {
        "date": "2025-03-11",
        "value": 4.28
      },
      {
        "date": "2025-03-12",
        "value": 4.32
      },
      {
        "date": "2025-03-13",
        "value": 4.27
      },
      {
        "date": "2025-03-14",
        "value": 4.31
      },
      {
        "date": "2025-03-17",
        "value": 4.31
      },
      {
        "date": "2025-03-18",
        "value": 4.29
      },
      {
        "date": "2025-03-19",
        "value": 4.25
      },
      {
        "date": "2025-03-20",
        "value": 4.24
      },
      {
        "date": "2025-03-21",
        "value": 4.25
      },
      {
        "date": "2025-03-24",
        "value": 4.34
      },
      {
        "date": "2025-03-25",
        "value": 4.31
      },
      {
        "date": "2025-03-26",
        "value": 4.35
      },
      {
        "date": "2025-03-27",
        "value": 4.38
      },
      {
        "date": "2025-03-28",
        "value": 4.27
      },
      {
        "date": "2025-03-31",
        "value": 4.23
      },
      {
        "date": "2025-04-01",
        "value": 4.17
      },
      {
        "date": "2025-04-02",
        "value": 4.2
      },
      {
        "date": "2025-04-03",
        "value": 4.06
      },
      {
        "date": "2025-04-04",
        "value": 4.01
      },
      {
        "date": "2025-04-07",
        "value": 4.15
      },
      {
        "date": "2025-04-08",
        "value": 4.26
      },
      {
        "date": "2025-04-09",
        "value": 4.34
      },
      {
        "date": "2025-04-10",
        "value": 4.4
      },
      {
        "date": "2025-04-11",
        "value": 4.48
      },
      {
        "date": "2025-04-14",
        "value": 4.38
      },
      {
        "date": "2025-04-15",
        "value": 4.35
      },
      {
        "date": "2025-04-16",
        "value": 4.29
      },
      {
        "date": "2025-04-17",
        "value": 4.34
      },
      {
        "date": "2025-04-21",
        "value": 4.42
      },
      {
        "date": "2025-04-22",
        "value": 4.41
      },
      {
        "date": "2025-04-23",
        "value": 4.4
      },
      {
        "date": "2025-04-24",
        "value": 4.32
      },
      {
        "date": "2025-04-25",
        "value": 4.29
      },
      {
        "date": "2025-04-28",
        "value": 4.23
      },
      {
        "date": "2025-04-29",
        "value": 4.19
      },
      {
        "date": "2025-04-30",
        "value": 4.17
      },
      {
        "date": "2025-05-01",
        "value": 4.25
      },
      {
        "date": "2025-05-02",
        "value": 4.33
      },
      {
        "date": "2025-05-05",
        "value": 4.36
      },
      {
        "date": "2025-05-06",
        "value": 4.3
      },
      {
        "date": "2025-05-07",
        "value": 4.26
      },
      {
        "date": "2025-05-08",
        "value": 4.37
      },
      {
        "date": "2025-05-09",
        "value": 4.37
      },
      {
        "date": "2025-05-12",
        "value": 4.45
      },
      {
        "date": "2025-05-13",
        "value": 4.49
      },
      {
        "date": "2025-05-14",
        "value": 4.53
      },
      {
        "date": "2025-05-15",
        "value": 4.45
      },
      {
        "date": "2025-05-16",
        "value": 4.43
      },
      {
        "date": "2025-05-19",
        "value": 4.46
      },
      {
        "date": "2025-05-20",
        "value": 4.48
      },
      {
        "date": "2025-05-21",
        "value": 4.58
      },
      {
        "date": "2025-05-22",
        "value": 4.54
      },
      {
        "date": "2025-05-23",
        "value": 4.51
      },
      {
        "date": "2025-05-27",
        "value": 4.43
      },
      {
        "date": "2025-05-28",
        "value": 4.47
      },
      {
        "date": "2025-05-29",
        "value": 4.43
      },
      {
        "date": "2025-05-30",
        "value": 4.41
      },
      {
        "date": "2025-06-02",
        "value": 4.46
      },
      {
        "date": "2025-06-03",
        "value": 4.46
      },
      {
        "date": "2025-06-04",
        "value": 4.37
      },
      {
        "date": "2025-06-05",
        "value": 4.4
      },
      {
        "date": "2025-06-06",
        "value": 4.51
      },
      {
        "date": "2025-06-09",
        "value": 4.49
      },
      {
        "date": "2025-06-10",
        "value": 4.47
      },
      {
        "date": "2025-06-11",
        "value": 4.41
      },
      {
        "date": "2025-06-12",
        "value": 4.36
      },
      {
        "date": "2025-06-13",
        "value": 4.41
      },
      {
        "date": "2025-06-16",
        "value": 4.46
      },
      {
        "date": "2025-06-17",
        "value": 4.39
      },
      {
        "date": "2025-06-18",
        "value": 4.38
      },
      {
        "date": "2025-06-20",
        "value": 4.38
      },
      {
        "date": "2025-06-23",
        "value": 4.34
      },
      {
        "date": "2025-06-24",
        "value": 4.3
      },
      {
        "date": "2025-06-25",
        "value": 4.29
      },
      {
        "date": "2025-06-26",
        "value": 4.26
      },
      {
        "date": "2025-06-27",
        "value": 4.29
      },
      {
        "date": "2025-06-30",
        "value": 4.24
      },
      {
        "date": "2025-07-01",
        "value": 4.26
      },
      {
        "date": "2025-07-02",
        "value": 4.3
      },
      {
        "date": "2025-07-03",
        "value": 4.35
      },
      {
        "date": "2025-07-07",
        "value": 4.4
      },
      {
        "date": "2025-07-08",
        "value": 4.42
      },
      {
        "date": "2025-07-09",
        "value": 4.34
      },
      {
        "date": "2025-07-10",
        "value": 4.35
      },
      {
        "date": "2025-07-11",
        "value": 4.43
      },
      {
        "date": "2025-07-14",
        "value": 4.43
      },
      {
        "date": "2025-07-15",
        "value": 4.5
      },
      {
        "date": "2025-07-16",
        "value": 4.46
      },
      {
        "date": "2025-07-17",
        "value": 4.47
      },
      {
        "date": "2025-07-18",
        "value": 4.44
      },
      {
        "date": "2025-07-21",
        "value": 4.38
      },
      {
        "date": "2025-07-22",
        "value": 4.35
      },
      {
        "date": "2025-07-23",
        "value": 4.4
      },
      {
        "date": "2025-07-24",
        "value": 4.43
      },
      {
        "date": "2025-07-25",
        "value": 4.4
      },
      {
        "date": "2025-07-28",
        "value": 4.42
      },
      {
        "date": "2025-07-29",
        "value": 4.34
      },
      {
        "date": "2025-07-30",
        "value": 4.38
      },
      {
        "date": "2025-07-31",
        "value": 4.37
      },
      {
        "date": "2025-08-01",
        "value": 4.23
      },
      {
        "date": "2025-08-04",
        "value": 4.22
      },
      {
        "date": "2025-08-05",
        "value": 4.22
      },
      {
        "date": "2025-08-06",
        "value": 4.22
      },
      {
        "date": "2025-08-07",
        "value": 4.23
      },
      {
        "date": "2025-08-08",
        "value": 4.27
      },
      {
        "date": "2025-08-11",
        "value": 4.27
      },
      {
        "date": "2025-08-12",
        "value": 4.29
      },
      {
        "date": "2025-08-13",
        "value": 4.24
      },
      {
        "date": "2025-08-14",
        "value": 4.29
      },
      {
        "date": "2025-08-15",
        "value": 4.33
      },
      {
        "date": "2025-08-18",
        "value": 4.34
      },
      {
        "date": "2025-08-19",
        "value": 4.3
      },
      {
        "date": "2025-08-20",
        "value": 4.29
      },
      {
        "date": "2025-08-21",
        "value": 4.33
      },
      {
        "date": "2025-08-22",
        "value": 4.26
      },
      {
        "date": "2025-08-25",
        "value": 4.28
      },
      {
        "date": "2025-08-26",
        "value": 4.26
      },
      {
        "date": "2025-08-27",
        "value": 4.24
      },
      {
        "date": "2025-08-28",
        "value": 4.22
      },
      {
        "date": "2025-08-29",
        "value": 4.23
      },
      {
        "date": "2025-09-02",
        "value": 4.28
      },
      {
        "date": "2025-09-03",
        "value": 4.22
      },
      {
        "date": "2025-09-04",
        "value": 4.17
      },
      {
        "date": "2025-09-05",
        "value": 4.1
      },
      {
        "date": "2025-09-08",
        "value": 4.05
      },
      {
        "date": "2025-09-09",
        "value": 4.08
      },
      {
        "date": "2025-09-10",
        "value": 4.04
      },
      {
        "date": "2025-09-11",
        "value": 4.01
      },
      {
        "date": "2025-09-12",
        "value": 4.06
      },
      {
        "date": "2025-09-15",
        "value": 4.05
      },
      {
        "date": "2025-09-16",
        "value": 4.04
      },
      {
        "date": "2025-09-17",
        "value": 4.06
      },
      {
        "date": "2025-09-18",
        "value": 4.11
      },
      {
        "date": "2025-09-19",
        "value": 4.14
      },
      {
        "date": "2025-09-22",
        "value": 4.15
      },
      {
        "date": "2025-09-23",
        "value": 4.12
      },
      {
        "date": "2025-09-24",
        "value": 4.16
      },
      {
        "date": "2025-09-25",
        "value": 4.18
      },
      {
        "date": "2025-09-26",
        "value": 4.2
      },
      {
        "date": "2025-09-29",
        "value": 4.15
      },
      {
        "date": "2025-09-30",
        "value": 4.16
      },
      {
        "date": "2025-10-01",
        "value": 4.12
      },
      {
        "date": "2025-10-02",
        "value": 4.1
      },
      {
        "date": "2025-10-03",
        "value": 4.13
      },
      {
        "date": "2025-10-06",
        "value": 4.18
      },
      {
        "date": "2025-10-07",
        "value": 4.14
      },
      {
        "date": "2025-10-08",
        "value": 4.13
      },
      {
        "date": "2025-10-09",
        "value": 4.14
      },
      {
        "date": "2025-10-10",
        "value": 4.05
      },
      {
        "date": "2025-10-14",
        "value": 4.03
      },
      {
        "date": "2025-10-15",
        "value": 4.05
      },
      {
        "date": "2025-10-16",
        "value": 3.99
      },
      {
        "date": "2025-10-17",
        "value": 4.02
      },
      {
        "date": "2025-10-20",
        "value": 4.0
      },
      {
        "date": "2025-10-21",
        "value": 3.98
      },
      {
        "date": "2025-10-22",
        "value": 3.97
      },
      {
        "date": "2025-10-23",
        "value": 4.01
      },
      {
        "date": "2025-10-24",
        "value": 4.02
      },
      {
        "date": "2025-10-27",
        "value": 4.01
      },
      {
        "date": "2025-10-28",
        "value": 3.99
      },
      {
        "date": "2025-10-29",
        "value": 4.08
      },
      {
        "date": "2025-10-30",
        "value": 4.11
      },
      {
        "date": "2025-10-31",
        "value": 4.11
      },
      {
        "date": "2025-11-03",
        "value": 4.13
      },
      {
        "date": "2025-11-04",
        "value": 4.1
      },
      {
        "date": "2025-11-05",
        "value": 4.17
      },
      {
        "date": "2025-11-06",
        "value": 4.11
      },
      {
        "date": "2025-11-07",
        "value": 4.11
      },
      {
        "date": "2025-11-10",
        "value": 4.13
      },
      {
        "date": "2025-11-12",
        "value": 4.08
      },
      {
        "date": "2025-11-13",
        "value": 4.11
      },
      {
        "date": "2025-11-14",
        "value": 4.14
      },
      {
        "date": "2025-11-17",
        "value": 4.13
      },
      {
        "date": "2025-11-18",
        "value": 4.12
      },
      {
        "date": "2025-11-19",
        "value": 4.13
      },
      {
        "date": "2025-11-20",
        "value": 4.1
      },
      {
        "date": "2025-11-21",
        "value": 4.06
      },
      {
        "date": "2025-11-24",
        "value": 4.04
      },
      {
        "date": "2025-11-25",
        "value": 4.01
      },
      {
        "date": "2025-11-26",
        "value": 4.0
      },
      {
        "date": "2025-11-28",
        "value": 4.02
      },
      {
        "date": "2025-12-01",
        "value": 4.09
      },
      {
        "date": "2025-12-02",
        "value": 4.09
      },
      {
        "date": "2025-12-03",
        "value": 4.06
      },
      {
        "date": "2025-12-04",
        "value": 4.11
      },
      {
        "date": "2025-12-05",
        "value": 4.14
      },
      {
        "date": "2025-12-08",
        "value": 4.17
      },
      {
        "date": "2025-12-09",
        "value": 4.18
      },
      {
        "date": "2025-12-10",
        "value": 4.13
      },
      {
        "date": "2025-12-11",
        "value": 4.14
      },
      {
        "date": "2025-12-12",
        "value": 4.19
      },
      {
        "date": "2025-12-15",
        "value": 4.18
      },
      {
        "date": "2025-12-16",
        "value": 4.15
      },
      {
        "date": "2025-12-17",
        "value": 4.16
      },
      {
        "date": "2025-12-18",
        "value": 4.12
      },
      {
        "date": "2025-12-19",
        "value": 4.16
      },
      {
        "date": "2025-12-22",
        "value": 4.17
      },
      {
        "date": "2025-12-23",
        "value": 4.18
      },
      {
        "date": "2025-12-24",
        "value": 4.15
      },
      {
        "date": "2025-12-26",
        "value": 4.14
      },
      {
        "date": "2025-12-29",
        "value": 4.12
      },
      {
        "date": "2025-12-30",
        "value": 4.14
      },
      {
        "date": "2025-12-31",
        "value": 4.18
      },
      {
        "date": "2026-01-02",
        "value": 4.19
      },
      {
        "date": "2026-01-05",
        "value": 4.17
      },
      {
        "date": "2026-01-06",
        "value": 4.18
      },
      {
        "date": "2026-01-07",
        "value": 4.15
      },
      {
        "date": "2026-01-08",
        "value": 4.19
      },
      {
        "date": "2026-01-09",
        "value": 4.18
      },
      {
        "date": "2026-01-12",
        "value": 4.19
      },
      {
        "date": "2026-01-13",
        "value": 4.18
      },
      {
        "date": "2026-01-14",
        "value": 4.15
      },
      {
        "date": "2026-01-15",
        "value": 4.17
      },
      {
        "date": "2026-01-16",
        "value": 4.24
      },
      {
        "date": "2026-01-20",
        "value": 4.3
      },
      {
        "date": "2026-01-21",
        "value": 4.26
      },
      {
        "date": "2026-01-22",
        "value": 4.26
      },
      {
        "date": "2026-01-23",
        "value": 4.24
      },
      {
        "date": "2026-01-26",
        "value": 4.22
      },
      {
        "date": "2026-01-27",
        "value": 4.24
      },
      {
        "date": "2026-01-28",
        "value": 4.26
      },
      {
        "date": "2026-01-29",
        "value": 4.24
      },
      {
        "date": "2026-01-30",
        "value": 4.26
      },
      {
        "date": "2026-02-02",
        "value": 4.29
      },
      {
        "date": "2026-02-03",
        "value": 4.28
      },
      {
        "date": "2026-02-04",
        "value": 4.29
      },
      {
        "date": "2026-02-05",
        "value": 4.21
      },
      {
        "date": "2026-02-06",
        "value": 4.22
      },
      {
        "date": "2026-02-09",
        "value": 4.22
      },
      {
        "date": "2026-02-10",
        "value": 4.16
      },
      {
        "date": "2026-02-11",
        "value": 4.18
      },
      {
        "date": "2026-02-12",
        "value": 4.09
      },
      {
        "date": "2026-02-13",
        "value": 4.04
      },
      {
        "date": "2026-02-17",
        "value": 4.05
      },
      {
        "date": "2026-02-18",
        "value": 4.09
      },
      {
        "date": "2026-02-19",
        "value": 4.08
      },
      {
        "date": "2026-02-20",
        "value": 4.08
      },
      {
        "date": "2026-02-23",
        "value": 4.03
      },
      {
        "date": "2026-02-24",
        "value": 4.04
      },
      {
        "date": "2026-02-25",
        "value": 4.05
      },
      {
        "date": "2026-02-26",
        "value": 4.02
      },
      {
        "date": "2026-02-27",
        "value": 3.97
      },
      {
        "date": "2026-03-02",
        "value": 4.05
      },
      {
        "date": "2026-03-03",
        "value": 4.06
      },
      {
        "date": "2026-03-04",
        "value": 4.09
      },
      {
        "date": "2026-03-05",
        "value": 4.13
      },
      {
        "date": "2026-03-06",
        "value": 4.15
      },
      {
        "date": "2026-03-09",
        "value": 4.12
      },
      {
        "date": "2026-03-10",
        "value": 4.15
      },
      {
        "date": "2026-03-11",
        "value": 4.21
      },
      {
        "date": "2026-03-12",
        "value": 4.27
      },
      {
        "date": "2026-03-13",
        "value": 4.28
      },
      {
        "date": "2026-03-16",
        "value": 4.23
      },
      {
        "date": "2026-03-17",
        "value": 4.2
      },
      {
        "date": "2026-03-18",
        "value": 4.26
      },
      {
        "date": "2026-03-19",
        "value": 4.25
      },
      {
        "date": "2026-03-20",
        "value": 4.39
      },
      {
        "date": "2026-03-23",
        "value": 4.34
      },
      {
        "date": "2026-03-24",
        "value": 4.39
      },
      {
        "date": "2026-03-25",
        "value": 4.33
      },
      {
        "date": "2026-03-26",
        "value": 4.42
      },
      {
        "date": "2026-03-27",
        "value": 4.44
      },
      {
        "date": "2026-03-30",
        "value": 4.35
      },
      {
        "date": "2026-03-31",
        "value": 4.3
      },
      {
        "date": "2026-04-01",
        "value": 4.33
      },
      {
        "date": "2026-04-02",
        "value": 4.31
      },
      {
        "date": "2026-04-03",
        "value": 4.35
      },
      {
        "date": "2026-04-06",
        "value": 4.34
      },
      {
        "date": "2026-04-07",
        "value": 4.33
      },
      {
        "date": "2026-04-08",
        "value": 4.29
      },
      {
        "date": "2026-04-09",
        "value": 4.29
      },
      {
        "date": "2026-04-10",
        "value": 4.31
      },
      {
        "date": "2026-04-13",
        "value": 4.3
      },
      {
        "date": "2026-04-14",
        "value": 4.26
      },
      {
        "date": "2026-04-15",
        "value": 4.29
      },
      {
        "date": "2026-04-16",
        "value": 4.32
      },
      {
        "date": "2026-04-17",
        "value": 4.26
      },
      {
        "date": "2026-04-20",
        "value": 4.26
      },
      {
        "date": "2026-04-21",
        "value": 4.3
      },
      {
        "date": "2026-04-22",
        "value": 4.3
      },
      {
        "date": "2026-04-23",
        "value": 4.34
      },
      {
        "date": "2026-04-24",
        "value": 4.31
      },
      {
        "date": "2026-04-27",
        "value": 4.35
      },
      {
        "date": "2026-04-28",
        "value": 4.36
      },
      {
        "date": "2026-04-29",
        "value": 4.42
      },
      {
        "date": "2026-04-30",
        "value": 4.4
      },
      {
        "date": "2026-05-01",
        "value": 4.39
      },
      {
        "date": "2026-05-04",
        "value": 4.45
      },
      {
        "date": "2026-05-05",
        "value": 4.43
      },
      {
        "date": "2026-05-06",
        "value": 4.36
      },
      {
        "date": "2026-05-07",
        "value": 4.41
      },
      {
        "date": "2026-05-08",
        "value": 4.38
      },
      {
        "date": "2026-05-11",
        "value": 4.42
      },
      {
        "date": "2026-05-12",
        "value": 4.46
      },
      {
        "date": "2026-05-13",
        "value": 4.46
      },
      {
        "date": "2026-05-14",
        "value": 4.47
      },
      {
        "date": "2026-05-15",
        "value": 4.59
      },
      {
        "date": "2026-05-18",
        "value": 4.61
      },
      {
        "date": "2026-05-19",
        "value": 4.67
      },
      {
        "date": "2026-05-20",
        "value": 4.57
      },
      {
        "date": "2026-05-21",
        "value": 4.57
      },
      {
        "date": "2026-05-22",
        "value": 4.56
      },
      {
        "date": "2026-05-26",
        "value": 4.5
      },
      {
        "date": "2026-05-27",
        "value": 4.48
      },
      {
        "date": "2026-05-28",
        "value": 4.45
      },
      {
        "date": "2026-05-29",
        "value": 4.45
      },
      {
        "date": "2026-06-01",
        "value": 4.47
      },
      {
        "date": "2026-06-02",
        "value": 4.46
      },
      {
        "date": "2026-06-03",
        "value": 4.49
      },
      {
        "date": "2026-06-04",
        "value": 4.47
      },
      {
        "date": "2026-06-05",
        "value": 4.55
      },
      {
        "date": "2026-06-08",
        "value": 4.56
      },
      {
        "date": "2026-06-09",
        "value": 4.53
      },
      {
        "date": "2026-06-10",
        "value": 4.55
      },
      {
        "date": "2026-06-11",
        "value": 4.45
      },
      {
        "date": "2026-06-12",
        "value": 4.48
      },
      {
        "date": "2026-06-15",
        "value": 4.47
      },
      {
        "date": "2026-06-16",
        "value": 4.43
      },
      {
        "date": "2026-06-17",
        "value": 4.49
      },
      {
        "date": "2026-06-18",
        "value": 4.46
      },
      {
        "date": "2026-06-22",
        "value": 4.51
      },
      {
        "date": "2026-06-23",
        "value": 4.5
      },
      {
        "date": "2026-06-24",
        "value": 4.41
      },
      {
        "date": "2026-06-25",
        "value": 4.4
      },
      {
        "date": "2026-06-26",
        "value": 4.38
      },
      {
        "date": "2026-06-29",
        "value": 4.38
      },
      {
        "date": "2026-06-30",
        "value": 4.44
      },
      {
        "date": "2026-07-01",
        "value": 4.48
      },
      {
        "date": "2026-07-02",
        "value": 4.49
      },
      {
        "date": "2026-07-06",
        "value": 4.48
      },
      {
        "date": "2026-07-07",
        "value": 4.55
      },
      {
        "date": "2026-07-08",
        "value": 4.56
      },
      {
        "date": "2026-07-09",
        "value": 4.54
      },
      {
        "date": "2026-07-10",
        "value": 4.56
      },
      {
        "date": "2026-07-13",
        "value": 4.62
      }
    ],
    "us_cpi": [
      {
        "date": "2016-06-01",
        "value": 240.222
      },
      {
        "date": "2016-07-01",
        "value": 240.101
      },
      {
        "date": "2016-08-01",
        "value": 240.545
      },
      {
        "date": "2016-09-01",
        "value": 241.176
      },
      {
        "date": "2016-10-01",
        "value": 241.741
      },
      {
        "date": "2016-11-01",
        "value": 242.026
      },
      {
        "date": "2016-12-01",
        "value": 242.637
      },
      {
        "date": "2017-01-01",
        "value": 243.618
      },
      {
        "date": "2017-02-01",
        "value": 244.006
      },
      {
        "date": "2017-03-01",
        "value": 243.892
      },
      {
        "date": "2017-04-01",
        "value": 244.193
      },
      {
        "date": "2017-05-01",
        "value": 244.004
      },
      {
        "date": "2017-06-01",
        "value": 244.163
      },
      {
        "date": "2017-07-01",
        "value": 244.243
      },
      {
        "date": "2017-08-01",
        "value": 245.183
      },
      {
        "date": "2017-09-01",
        "value": 246.435
      },
      {
        "date": "2017-10-01",
        "value": 246.626
      },
      {
        "date": "2017-11-01",
        "value": 247.284
      },
      {
        "date": "2017-12-01",
        "value": 247.805
      },
      {
        "date": "2018-01-01",
        "value": 248.859
      },
      {
        "date": "2018-02-01",
        "value": 249.529
      },
      {
        "date": "2018-03-01",
        "value": 249.577
      },
      {
        "date": "2018-04-01",
        "value": 250.227
      },
      {
        "date": "2018-05-01",
        "value": 250.792
      },
      {
        "date": "2018-06-01",
        "value": 251.018
      },
      {
        "date": "2018-07-01",
        "value": 251.214
      },
      {
        "date": "2018-08-01",
        "value": 251.663
      },
      {
        "date": "2018-09-01",
        "value": 252.182
      },
      {
        "date": "2018-10-01",
        "value": 252.772
      },
      {
        "date": "2018-11-01",
        "value": 252.594
      },
      {
        "date": "2018-12-01",
        "value": 252.767
      },
      {
        "date": "2019-01-01",
        "value": 252.561
      },
      {
        "date": "2019-02-01",
        "value": 253.319
      },
      {
        "date": "2019-03-01",
        "value": 254.277
      },
      {
        "date": "2019-04-01",
        "value": 255.233
      },
      {
        "date": "2019-05-01",
        "value": 255.296
      },
      {
        "date": "2019-06-01",
        "value": 255.213
      },
      {
        "date": "2019-07-01",
        "value": 255.802
      },
      {
        "date": "2019-08-01",
        "value": 256.036
      },
      {
        "date": "2019-09-01",
        "value": 256.43
      },
      {
        "date": "2019-10-01",
        "value": 257.155
      },
      {
        "date": "2019-11-01",
        "value": 257.879
      },
      {
        "date": "2019-12-01",
        "value": 258.63
      },
      {
        "date": "2020-01-01",
        "value": 259.127
      },
      {
        "date": "2020-02-01",
        "value": 259.25
      },
      {
        "date": "2020-03-01",
        "value": 258.076
      },
      {
        "date": "2020-04-01",
        "value": 256.032
      },
      {
        "date": "2020-05-01",
        "value": 255.802
      },
      {
        "date": "2020-06-01",
        "value": 257.042
      },
      {
        "date": "2020-07-01",
        "value": 258.352
      },
      {
        "date": "2020-08-01",
        "value": 259.316
      },
      {
        "date": "2020-09-01",
        "value": 259.997
      },
      {
        "date": "2020-10-01",
        "value": 260.319
      },
      {
        "date": "2020-11-01",
        "value": 260.911
      },
      {
        "date": "2020-12-01",
        "value": 262.045
      },
      {
        "date": "2021-01-01",
        "value": 262.687
      },
      {
        "date": "2021-02-01",
        "value": 263.579
      },
      {
        "date": "2021-03-01",
        "value": 264.961
      },
      {
        "date": "2021-04-01",
        "value": 266.614
      },
      {
        "date": "2021-05-01",
        "value": 268.383
      },
      {
        "date": "2021-06-01",
        "value": 270.654
      },
      {
        "date": "2021-07-01",
        "value": 271.903
      },
      {
        "date": "2021-08-01",
        "value": 272.676
      },
      {
        "date": "2021-09-01",
        "value": 273.91
      },
      {
        "date": "2021-10-01",
        "value": 276.55
      },
      {
        "date": "2021-11-01",
        "value": 278.919
      },
      {
        "date": "2021-12-01",
        "value": 280.845
      },
      {
        "date": "2022-01-01",
        "value": 282.543
      },
      {
        "date": "2022-02-01",
        "value": 284.5
      },
      {
        "date": "2022-03-01",
        "value": 287.674
      },
      {
        "date": "2022-04-01",
        "value": 288.561
      },
      {
        "date": "2022-05-01",
        "value": 291.298
      },
      {
        "date": "2022-06-01",
        "value": 294.957
      },
      {
        "date": "2022-07-01",
        "value": 294.913
      },
      {
        "date": "2022-08-01",
        "value": 295.097
      },
      {
        "date": "2022-09-01",
        "value": 296.349
      },
      {
        "date": "2022-10-01",
        "value": 298.007
      },
      {
        "date": "2022-11-01",
        "value": 298.786
      },
      {
        "date": "2022-12-01",
        "value": 298.832
      },
      {
        "date": "2023-01-01",
        "value": 300.42
      },
      {
        "date": "2023-02-01",
        "value": 301.45
      },
      {
        "date": "2023-03-01",
        "value": 301.821
      },
      {
        "date": "2023-04-01",
        "value": 302.845
      },
      {
        "date": "2023-05-01",
        "value": 303.334
      },
      {
        "date": "2023-06-01",
        "value": 304.014
      },
      {
        "date": "2023-07-01",
        "value": 304.609
      },
      {
        "date": "2023-08-01",
        "value": 306.082
      },
      {
        "date": "2023-09-01",
        "value": 307.276
      },
      {
        "date": "2023-10-01",
        "value": 307.696
      },
      {
        "date": "2023-11-01",
        "value": 308.148
      },
      {
        "date": "2023-12-01",
        "value": 308.741
      },
      {
        "date": "2024-01-01",
        "value": 309.698
      },
      {
        "date": "2024-02-01",
        "value": 310.967
      },
      {
        "date": "2024-03-01",
        "value": 312.345
      },
      {
        "date": "2024-04-01",
        "value": 313.023
      },
      {
        "date": "2024-05-01",
        "value": 313.175
      },
      {
        "date": "2024-06-01",
        "value": 313.044
      },
      {
        "date": "2024-07-01",
        "value": 313.569
      },
      {
        "date": "2024-08-01",
        "value": 314.062
      },
      {
        "date": "2024-09-01",
        "value": 314.732
      },
      {
        "date": "2024-10-01",
        "value": 315.631
      },
      {
        "date": "2024-11-01",
        "value": 316.528
      },
      {
        "date": "2024-12-01",
        "value": 317.604
      },
      {
        "date": "2025-01-01",
        "value": 318.961
      },
      {
        "date": "2025-02-01",
        "value": 319.679
      },
      {
        "date": "2025-03-01",
        "value": 319.785
      },
      {
        "date": "2025-04-01",
        "value": 320.302
      },
      {
        "date": "2025-05-01",
        "value": 320.62
      },
      {
        "date": "2025-06-01",
        "value": 321.435
      },
      {
        "date": "2025-07-01",
        "value": 322.169
      },
      {
        "date": "2025-08-01",
        "value": 323.291
      },
      {
        "date": "2025-09-01",
        "value": 324.245
      },
      {
        "date": "2025-11-01",
        "value": 325.063
      },
      {
        "date": "2025-12-01",
        "value": 326.031
      },
      {
        "date": "2026-01-01",
        "value": 326.588
      },
      {
        "date": "2026-02-01",
        "value": 327.46
      },
      {
        "date": "2026-03-01",
        "value": 330.293
      },
      {
        "date": "2026-04-01",
        "value": 332.407
      },
      {
        "date": "2026-05-01",
        "value": 333.979
      },
      {
        "date": "2026-06-01",
        "value": 332.568
      }
    ],
    "dxy": [
      {
        "date": "2024-12-04",
        "value": 126.7574
      },
      {
        "date": "2024-12-05",
        "value": 126.4286
      },
      {
        "date": "2024-12-06",
        "value": 126.688
      },
      {
        "date": "2024-12-09",
        "value": 126.5981
      },
      {
        "date": "2024-12-10",
        "value": 126.957
      },
      {
        "date": "2024-12-11",
        "value": 126.8483
      },
      {
        "date": "2024-12-12",
        "value": 126.9556
      },
      {
        "date": "2024-12-13",
        "value": 127.3096
      },
      {
        "date": "2024-12-16",
        "value": 127.2687
      },
      {
        "date": "2024-12-17",
        "value": 127.5043
      },
      {
        "date": "2024-12-18",
        "value": 127.6418
      },
      {
        "date": "2024-12-19",
        "value": 128.6366
      },
      {
        "date": "2024-12-20",
        "value": 127.893
      },
      {
        "date": "2024-12-23",
        "value": 128.3021
      },
      {
        "date": "2024-12-24",
        "value": 128.3377
      },
      {
        "date": "2024-12-26",
        "value": 128.3329
      },
      {
        "date": "2024-12-27",
        "value": 128.45
      },
      {
        "date": "2024-12-30",
        "value": 128.8205
      },
      {
        "date": "2024-12-31",
        "value": 129.2775
      },
      {
        "date": "2025-01-02",
        "value": 129.4598
      },
      {
        "date": "2025-01-03",
        "value": 129.4535
      },
      {
        "date": "2025-01-06",
        "value": 128.538
      },
      {
        "date": "2025-01-07",
        "value": 128.613
      },
      {
        "date": "2025-01-08",
        "value": 129.0785
      },
      {
        "date": "2025-01-09",
        "value": 129.2827
      },
      {
        "date": "2025-01-10",
        "value": 129.8664
      },
      {
        "date": "2025-01-13",
        "value": 130.0413
      },
      {
        "date": "2025-01-14",
        "value": 129.3812
      },
      {
        "date": "2025-01-15",
        "value": 129.2092
      },
      {
        "date": "2025-01-16",
        "value": 129.436
      },
      {
        "date": "2025-01-17",
        "value": 129.4859
      },
      {
        "date": "2025-01-21",
        "value": 128.4151
      },
      {
        "date": "2025-01-22",
        "value": 128.3402
      },
      {
        "date": "2025-01-23",
        "value": 128.2162
      },
      {
        "date": "2025-01-24",
        "value": 127.4611
      },
      {
        "date": "2025-01-27",
        "value": 128.0912
      },
      {
        "date": "2025-01-28",
        "value": 128.2817
      },
      {
        "date": "2025-01-29",
        "value": 128.3418
      },
      {
        "date": "2025-01-30",
        "value": 128.1004
      },
      {
        "date": "2025-01-31",
        "value": 128.4828
      },
      {
        "date": "2025-02-03",
        "value": 129.109
      },
      {
        "date": "2025-02-04",
        "value": 128.1083
      },
      {
        "date": "2025-02-05",
        "value": 127.9751
      },
      {
        "date": "2025-02-06",
        "value": 128.2017
      },
      {
        "date": "2025-02-07",
        "value": 128.4292
      },
      {
        "date": "2025-02-10",
        "value": 128.6382
      },
      {
        "date": "2025-02-11",
        "value": 128.4322
      },
      {
        "date": "2025-02-12",
        "value": 128.3288
      },
      {
        "date": "2025-02-13",
        "value": 127.8931
      },
      {
        "date": "2025-02-14",
        "value": 127.1491
      },
      {
        "date": "2025-02-18",
        "value": 127.2906
      },
      {
        "date": "2025-02-19",
        "value": 127.7317
      },
      {
        "date": "2025-02-20",
        "value": 127.1126
      },
      {
        "date": "2025-02-21",
        "value": 127.1408
      },
      {
        "date": "2025-02-24",
        "value": 127.1921
      },
      {
        "date": "2025-02-25",
        "value": 127.3752
      },
      {
        "date": "2025-02-26",
        "value": 127.2822
      },
      {
        "date": "2025-02-27",
        "value": 127.9704
      },
      {
        "date": "2025-02-28",
        "value": 128.2805
      },
      {
        "date": "2025-03-03",
        "value": 127.75
      },
      {
        "date": "2025-03-04",
        "value": 127.9966
      },
      {
        "date": "2025-03-05",
        "value": 126.504
      },
      {
        "date": "2025-03-06",
        "value": 126.1099
      },
      {
        "date": "2025-03-07",
        "value": 125.9814
      },
      {
        "date": "2025-03-10",
        "value": 126.268
      },
      {
        "date": "2025-03-11",
        "value": 126.0457
      },
      {
        "date": "2025-03-12",
        "value": 125.8664
      },
      {
        "date": "2025-03-13",
        "value": 126.0031
      },
      {
        "date": "2025-03-14",
        "value": 125.6942
      },
      {
        "date": "2025-03-17",
        "value": 125.3688
      },
      {
        "date": "2025-03-18",
        "value": 125.488
      },
      {
        "date": "2025-03-19",
        "value": 125.8006
      },
      {
        "date": "2025-03-20",
        "value": 125.985
      },
      {
        "date": "2025-03-21",
        "value": 126.2679
      },
      {
        "date": "2025-03-24",
        "value": 126.1956
      },
      {
        "date": "2025-03-25",
        "value": 126.0535
      },
      {
        "date": "2025-03-26",
        "value": 126.2364
      },
      {
        "date": "2025-03-27",
        "value": 126.3626
      },
      {
        "date": "2025-03-28",
        "value": 126.4187
      },
      {
        "date": "2025-03-31",
        "value": 126.7075
      },
      {
        "date": "2025-04-01",
        "value": 126.4338
      },
      {
        "date": "2025-04-02",
        "value": 126.3811
      },
      {
        "date": "2025-04-03",
        "value": 124.7316
      },
      {
        "date": "2025-04-04",
        "value": 125.8129
      },
      {
        "date": "2025-04-07",
        "value": 126.8282
      },
      {
        "date": "2025-04-08",
        "value": 126.8668
      },
      {
        "date": "2025-04-09",
        "value": 126.628
      },
      {
        "date": "2025-04-10",
        "value": 125.089
      },
      {
        "date": "2025-04-11",
        "value": 124.0163
      },
      {
        "date": "2025-04-14",
        "value": 123.6598
      },
      {
        "date": "2025-04-15",
        "value": 123.776
      },
      {
        "date": "2025-04-16",
        "value": 123.2724
      },
      {
        "date": "2025-04-17",
        "value": 123.1298
      },
      {
        "date": "2025-04-18",
        "value": 122.9865
      },
      {
        "date": "2025-04-21",
        "value": 122.3145
      },
      {
        "date": "2025-04-22",
        "value": 122.4175
      },
      {
        "date": "2025-04-23",
        "value": 123.0252
      },
      {
        "date": "2025-04-24",
        "value": 122.9251
      },
      {
        "date": "2025-04-25",
        "value": 122.8858
      },
      {
        "date": "2025-04-28",
        "value": 122.7176
      },
      {
        "date": "2025-04-29",
        "value": 122.5944
      },
      {
        "date": "2025-04-30",
        "value": 122.5921
      },
      {
        "date": "2025-05-01",
        "value": 123.1405
      },
      {
        "date": "2025-05-02",
        "value": 122.4962
      },
      {
        "date": "2025-05-05",
        "value": 122.2613
      },
      {
        "date": "2025-05-06",
        "value": 122.0417
      },
      {
        "date": "2025-05-07",
        "value": 122.117
      },
      {
        "date": "2025-05-08",
        "value": 122.7568
      },
      {
        "date": "2025-05-09",
        "value": 122.5191
      },
      {
        "date": "2025-05-12",
        "value": 123.4863
      },
      {
        "date": "2025-05-13",
        "value": 122.9583
      },
      {
        "date": "2025-05-14",
        "value": 122.6746
      },
      {
        "date": "2025-05-15",
        "value": 122.8174
      },
      {
        "date": "2025-05-16",
        "value": 123.0737
      },
      {
        "date": "2025-05-19",
        "value": 122.4186
      },
      {
        "date": "2025-05-20",
        "value": 122.3199
      },
      {
        "date": "2025-05-21",
        "value": 121.7496
      },
      {
        "date": "2025-05-22",
        "value": 122.0429
      },
      {
        "date": "2025-05-23",
        "value": 121.3837
      },
      {
        "date": "2025-05-27",
        "value": 121.6099
      },
      {
        "date": "2025-05-28",
        "value": 121.9888
      },
      {
        "date": "2025-05-29",
        "value": 121.5617
      },
      {
        "date": "2025-05-30",
        "value": 121.7674
      },
      {
        "date": "2025-06-02",
        "value": 121.1881
      },
      {
        "date": "2025-06-03",
        "value": 121.4592
      },
      {
        "date": "2025-06-04",
        "value": 121.0539
      },
      {
        "date": "2025-06-05",
        "value": 120.9596
      },
      {
        "date": "2025-06-06",
        "value": 121.161
      },
      {
        "date": "2025-06-09",
        "value": 120.9103
      },
      {
        "date": "2025-06-10",
        "value": 121.0485
      },
      {
        "date": "2025-06-11",
        "value": 120.587
      },
      {
        "date": "2025-06-12",
        "value": 120.1723
      },
      {
        "date": "2025-06-13",
        "value": 120.3245
      },
      {
        "date": "2025-06-16",
        "value": 120.1565
      },
      {
        "date": "2025-06-17",
        "value": 120.5048
      },
      {
        "date": "2025-06-18",
        "value": 120.7305
      },
      {
        "date": "2025-06-20",
        "value": 121.0408
      },
      {
        "date": "2025-06-23",
        "value": 121.1694
      },
      {
        "date": "2025-06-24",
        "value": 120.3645
      },
      {
        "date": "2025-06-25",
        "value": 120.3336
      },
      {
        "date": "2025-06-26",
        "value": 119.6451
      },
      {
        "date": "2025-06-27",
        "value": 119.659
      },
      {
        "date": "2025-06-30",
        "value": 119.4088
      },
      {
        "date": "2025-07-01",
        "value": 119.3436
      },
      {
        "date": "2025-07-02",
        "value": 119.3037
      },
      {
        "date": "2025-07-03",
        "value": 119.2382
      },
      {
        "date": "2025-07-07",
        "value": 119.6201
      },
      {
        "date": "2025-07-08",
        "value": 119.8371
      },
      {
        "date": "2025-07-09",
        "value": 119.7311
      },
      {
        "date": "2025-07-10",
        "value": 119.8343
      },
      {
        "date": "2025-07-11",
        "value": 119.9214
      },
      {
        "date": "2025-07-14",
        "value": 120.2209
      },
      {
        "date": "2025-07-15",
        "value": 120.5105
      },
      {
        "date": "2025-07-16",
        "value": 120.4175
      },
      {
        "date": "2025-07-17",
        "value": 120.6384
      },
      {
        "date": "2025-07-18",
        "value": 120.356
      },
      {
        "date": "2025-07-21",
        "value": 119.9961
      },
      {
        "date": "2025-07-22",
        "value": 119.681
      },
      {
        "date": "2025-07-23",
        "value": 119.5697
      },
      {
        "date": "2025-07-24",
        "value": 119.5664
      },
      {
        "date": "2025-07-25",
        "value": 119.9857
      },
      {
        "date": "2025-07-28",
        "value": 120.6149
      },
      {
        "date": "2025-07-29",
        "value": 120.9674
      },
      {
        "date": "2025-07-30",
        "value": 121.4042
      },
      {
        "date": "2025-07-31",
        "value": 121.721
      },
      {
        "date": "2025-08-01",
        "value": 121.2122
      },
      {
        "date": "2025-08-04",
        "value": 120.9859
      },
      {
        "date": "2025-08-05",
        "value": 120.9082
      },
      {
        "date": "2025-08-06",
        "value": 120.5082
      },
      {
        "date": "2025-08-07",
        "value": 120.5043
      },
      {
        "date": "2025-08-08",
        "value": 120.3329
      },
      {
        "date": "2025-08-11",
        "value": 120.6892
      },
      {
        "date": "2025-08-12",
        "value": 120.2736
      },
      {
        "date": "2025-08-13",
        "value": 120.13
      },
      {
        "date": "2025-08-14",
        "value": 120.6446
      },
      {
        "date": "2025-08-15",
        "value": 120.3377
      },
      {
        "date": "2025-08-18",
        "value": 120.5622
      },
      {
        "date": "2025-08-19",
        "value": 120.7224
      },
      {
        "date": "2025-08-20",
        "value": 120.7757
      },
      {
        "date": "2025-08-21",
        "value": 121.0843
      },
      {
        "date": "2025-08-22",
        "value": 120.2774
      },
      {
        "date": "2025-08-25",
        "value": 120.4214
      },
      {
        "date": "2025-08-26",
        "value": 120.5274
      },
      {
        "date": "2025-08-27",
        "value": 120.7274
      },
      {
        "date": "2025-08-28",
        "value": 120.2595
      },
      {
        "date": "2025-08-29",
        "value": 120.2082
      },
      {
        "date": "2025-09-02",
        "value": 120.6837
      },
      {
        "date": "2025-09-03",
        "value": 120.5052
      },
      {
        "date": "2025-09-04",
        "value": 120.7629
      },
      {
        "date": "2025-09-05",
        "value": 120.1282
      },
      {
        "date": "2025-09-08",
        "value": 120.0971
      },
      {
        "date": "2025-09-09",
        "value": 120.1569
      },
      {
        "date": "2025-09-10",
        "value": 120.1223
      },
      {
        "date": "2025-09-11",
        "value": 119.9534
      },
      {
        "date": "2025-09-12",
        "value": 120.0611
      },
      {
        "date": "2025-09-15",
        "value": 119.5644
      },
      {
        "date": "2025-09-16",
        "value": 119.1348
      },
      {
        "date": "2025-09-17",
        "value": 119.1582
      },
      {
        "date": "2025-09-18",
        "value": 119.6616
      },
      {
        "date": "2025-09-19",
        "value": 119.7858
      },
      {
        "date": "2025-09-22",
        "value": 119.8152
      },
      {
        "date": "2025-09-23",
        "value": 119.6202
      },
      {
        "date": "2025-09-24",
        "value": 120.1707
      },
      {
        "date": "2025-09-25",
        "value": 120.5419
      },
      {
        "date": "2025-09-26",
        "value": 120.4349
      },
      {
        "date": "2025-09-29",
        "value": 120.115
      },
      {
        "date": "2025-09-30",
        "value": 120.1368
      },
      {
        "date": "2025-10-01",
        "value": 120.1502
      },
      {
        "date": "2025-10-02",
        "value": 120.4296
      },
      {
        "date": "2025-10-03",
        "value": 120.0881
      },
      {
        "date": "2025-10-06",
        "value": 120.2722
      },
      {
        "date": "2025-10-07",
        "value": 120.4884
      },
      {
        "date": "2025-10-08",
        "value": 120.7766
      },
      {
        "date": "2025-10-09",
        "value": 121.0902
      },
      {
        "date": "2025-10-10",
        "value": 121.1163
      },
      {
        "date": "2025-10-14",
        "value": 121.1822
      },
      {
        "date": "2025-10-15",
        "value": 120.8642
      },
      {
        "date": "2025-10-16",
        "value": 120.6698
      },
      {
        "date": "2025-10-17",
        "value": 120.7028
      },
      {
        "date": "2025-10-20",
        "value": 120.6209
      },
      {
        "date": "2025-10-21",
        "value": 120.8895
      },
      {
        "date": "2025-10-22",
        "value": 120.8958
      },
      {
        "date": "2025-10-23",
        "value": 120.9531
      },
      {
        "date": "2025-10-24",
        "value": 120.9345
      },
      {
        "date": "2025-10-27",
        "value": 120.7988
      },
      {
        "date": "2025-10-28",
        "value": 120.6361
      },
      {
        "date": "2025-10-29",
        "value": 120.5312
      },
      {
        "date": "2025-10-30",
        "value": 121.2832
      },
      {
        "date": "2025-10-31",
        "value": 121.3859
      },
      {
        "date": "2025-11-03",
        "value": 121.4512
      },
      {
        "date": "2025-11-04",
        "value": 121.8271
      },
      {
        "date": "2025-11-05",
        "value": 121.8482
      },
      {
        "date": "2025-11-06",
        "value": 121.6948
      },
      {
        "date": "2025-11-07",
        "value": 121.388
      },
      {
        "date": "2025-11-10",
        "value": 121.2984
      },
      {
        "date": "2025-11-12",
        "value": 121.0458
      },
      {
        "date": "2025-11-13",
        "value": 120.7725
      },
      {
        "date": "2025-11-14",
        "value": 120.9666
      },
      {
        "date": "2025-11-17",
        "value": 121.1146
      },
      {
        "date": "2025-11-18",
        "value": 121.2127
      },
      {
        "date": "2025-11-19",
        "value": 121.4978
      },
      {
        "date": "2025-11-20",
        "value": 121.6889
      },
      {
        "date": "2025-11-21",
        "value": 121.8653
      },
      {
        "date": "2025-11-24",
        "value": 121.9171
      },
      {
        "date": "2025-11-25",
        "value": 121.6335
      },
      {
        "date": "2025-11-26",
        "value": 121.2437
      },
      {
        "date": "2025-11-28",
        "value": 121.0527
      },
      {
        "date": "2025-12-01",
        "value": 120.9862
      },
      {
        "date": "2025-12-02",
        "value": 121.1467
      },
      {
        "date": "2025-12-03",
        "value": 120.7336
      },
      {
        "date": "2025-12-04",
        "value": 120.6766
      },
      {
        "date": "2025-12-05",
        "value": 120.6863
      },
      {
        "date": "2025-12-08",
        "value": 120.776
      },
      {
        "date": "2025-12-09",
        "value": 120.6832
      },
      {
        "date": "2025-12-10",
        "value": 120.6752
      },
      {
        "date": "2025-12-11",
        "value": 119.98
      },
      {
        "date": "2025-12-12",
        "value": 120.1442
      },
      {
        "date": "2025-12-15",
        "value": 119.9561
      },
      {
        "date": "2025-12-16",
        "value": 119.8902
      },
      {
        "date": "2025-12-17",
        "value": 120.155
      },
      {
        "date": "2025-12-18",
        "value": 120.0528
      },
      {
        "date": "2025-12-19",
        "value": 120.1652
      },
      {
        "date": "2025-12-22",
        "value": 119.9912
      },
      {
        "date": "2025-12-23",
        "value": 119.7057
      },
      {
        "date": "2025-12-24",
        "value": 119.4372
      },
      {
        "date": "2025-12-26",
        "value": 119.4723
      },
      {
        "date": "2025-12-29",
        "value": 119.5899
      },
      {
        "date": "2025-12-30",
        "value": 119.4939
      },
      {
        "date": "2025-12-31",
        "value": 119.7456
      },
      {
        "date": "2026-01-02",
        "value": 119.6059
      },
      {
        "date": "2026-01-05",
        "value": 119.6192
      },
      {
        "date": "2026-01-06",
        "value": 119.7807
      },
      {
        "date": "2026-01-07",
        "value": 119.8719
      },
      {
        "date": "2026-01-08",
        "value": 120.0904
      },
      {
        "date": "2026-01-09",
        "value": 120.2215
      },
      {
        "date": "2026-01-12",
        "value": 119.9958
      },
      {
        "date": "2026-01-13",
        "value": 120.1401
      },
      {
        "date": "2026-01-14",
        "value": 119.9537
      },
      {
        "date": "2026-01-15",
        "value": 119.9951
      },
      {
        "date": "2026-01-16",
        "value": 120.0838
      },
      {
        "date": "2026-01-20",
        "value": 119.4455
      },
      {
        "date": "2026-01-21",
        "value": 119.3431
      },
      {
        "date": "2026-01-22",
        "value": 119.1962
      },
      {
        "date": "2026-01-23",
        "value": 118.8976
      },
      {
        "date": "2026-01-26",
        "value": 118.0525
      },
      {
        "date": "2026-01-27",
        "value": 117.4523
      },
      {
        "date": "2026-01-28",
        "value": 117.5117
      },
      {
        "date": "2026-01-29",
        "value": 117.4396
      },
      {
        "date": "2026-01-30",
        "value": 117.8996
      },
      {
        "date": "2026-02-02",
        "value": 118.3609
      },
      {
        "date": "2026-02-03",
        "value": 117.9764
      },
      {
        "date": "2026-02-04",
        "value": 118.2602
      },
      {
        "date": "2026-02-05",
        "value": 118.5034
      },
      {
        "date": "2026-02-06",
        "value": 118.2407
      },
      {
        "date": "2026-02-09",
        "value": 117.6392
      },
      {
        "date": "2026-02-10",
        "value": 117.5216
      },
      {
        "date": "2026-02-11",
        "value": 117.4601
      },
      {
        "date": "2026-02-12",
        "value": 117.5376
      },
      {
        "date": "2026-02-13",
        "value": 117.5258
      },
      {
        "date": "2026-02-17",
        "value": 117.7375
      },
      {
        "date": "2026-02-18",
        "value": 117.8426
      },
      {
        "date": "2026-02-19",
        "value": 118.2354
      },
      {
        "date": "2026-02-20",
        "value": 117.9917
      },
      {
        "date": "2026-02-23",
        "value": 117.9395
      },
      {
        "date": "2026-02-24",
        "value": 117.9463
      },
      {
        "date": "2026-02-25",
        "value": 117.769
      },
      {
        "date": "2026-02-26",
        "value": 117.9042
      },
      {
        "date": "2026-02-27",
        "value": 117.8223
      },
      {
        "date": "2026-03-02",
        "value": 118.667
      },
      {
        "date": "2026-03-03",
        "value": 119.4341
      },
      {
        "date": "2026-03-04",
        "value": 119.0705
      },
      {
        "date": "2026-03-05",
        "value": 119.5683
      },
      {
        "date": "2026-03-06",
        "value": 119.491
      },
      {
        "date": "2026-03-09",
        "value": 119.5151
      },
      {
        "date": "2026-03-10",
        "value": 118.7255
      },
      {
        "date": "2026-03-11",
        "value": 119.2885
      },
      {
        "date": "2026-03-12",
        "value": 119.8227
      },
      {
        "date": "2026-03-13",
        "value": 120.5518
      },
      {
        "date": "2026-03-16",
        "value": 120.097
      },
      {
        "date": "2026-03-17",
        "value": 119.8328
      },
      {
        "date": "2026-03-18",
        "value": 119.9276
      },
      {
        "date": "2026-03-19",
        "value": 120.1802
      },
      {
        "date": "2026-03-20",
        "value": 120.2757
      },
      {
        "date": "2026-03-23",
        "value": 119.9371
      },
      {
        "date": "2026-03-24",
        "value": 120.1295
      },
      {
        "date": "2026-03-25",
        "value": 120.1282
      },
      {
        "date": "2026-03-26",
        "value": 120.389
      },
      {
        "date": "2026-03-27",
        "value": 120.8851
      },
      {
        "date": "2026-03-30",
        "value": 121.2851
      },
      {
        "date": "2026-03-31",
        "value": 121.035
      },
      {
        "date": "2026-04-01",
        "value": 120.1198
      },
      {
        "date": "2026-04-02",
        "value": 120.503
      },
      {
        "date": "2026-04-03",
        "value": 120.6565
      },
      {
        "date": "2026-04-06",
        "value": 120.4302
      },
      {
        "date": "2026-04-07",
        "value": 120.32
      },
      {
        "date": "2026-04-08",
        "value": 119.0596
      },
      {
        "date": "2026-04-09",
        "value": 118.8998
      },
      {
        "date": "2026-04-10",
        "value": 118.8552
      },
      {
        "date": "2026-04-13",
        "value": 118.9916
      },
      {
        "date": "2026-04-14",
        "value": 118.3581
      },
      {
        "date": "2026-04-15",
        "value": 118.3623
      },
      {
        "date": "2026-04-16",
        "value": 118.3616
      },
      {
        "date": "2026-04-17",
        "value": 118.0795
      },
      {
        "date": "2026-04-20",
        "value": 118.2374
      },
      {
        "date": "2026-04-21",
        "value": 118.4331
      },
      {
        "date": "2026-04-22",
        "value": 118.6004
      },
      {
        "date": "2026-04-23",
        "value": 118.7155
      },
      {
        "date": "2026-04-24",
        "value": 118.7294
      },
      {
        "date": "2026-04-27",
        "value": 118.5458
      },
      {
        "date": "2026-04-28",
        "value": 118.7717
      },
      {
        "date": "2026-04-29",
        "value": 119.0975
      },
      {
        "date": "2026-04-30",
        "value": 118.671
      },
      {
        "date": "2026-05-01",
        "value": 118.3926
      },
      {
        "date": "2026-05-04",
        "value": 118.8264
      },
      {
        "date": "2026-05-05",
        "value": 118.6207
      },
      {
        "date": "2026-05-06",
        "value": 118.0982
      },
      {
        "date": "2026-05-07",
        "value": 118.0116
      },
      {
        "date": "2026-05-08",
        "value": 118.0392
      },
      {
        "date": "2026-05-11",
        "value": 118.0562
      },
      {
        "date": "2026-05-12",
        "value": 118.5238
      },
      {
        "date": "2026-05-13",
        "value": 118.4737
      },
      {
        "date": "2026-05-14",
        "value": 118.6696
      },
      {
        "date": "2026-05-15",
        "value": 119.2825
      },
      {
        "date": "2026-05-18",
        "value": 119.0574
      },
      {
        "date": "2026-05-19",
        "value": 119.451
      },
      {
        "date": "2026-05-20",
        "value": 119.1624
      },
      {
        "date": "2026-05-21",
        "value": 119.369
      },
      {
        "date": "2026-05-22",
        "value": 119.2868
      },
      {
        "date": "2026-05-26",
        "value": 119.1696
      },
      {
        "date": "2026-05-27",
        "value": 119.1829
      },
      {
        "date": "2026-05-28",
        "value": 119.0318
      },
      {
        "date": "2026-05-29",
        "value": 118.8783
      },
      {
        "date": "2026-06-01",
        "value": 119.1653
      },
      {
        "date": "2026-06-02",
        "value": 119.0359
      },
      {
        "date": "2026-06-03",
        "value": 119.3848
      },
      {
        "date": "2026-06-04",
        "value": 119.3615
      },
      {
        "date": "2026-06-05",
        "value": 120.0831
      },
      {
        "date": "2026-06-08",
        "value": 120.034
      },
      {
        "date": "2026-06-09",
        "value": 119.9617
      },
      {
        "date": "2026-06-10",
        "value": 119.9134
      },
      {
        "date": "2026-06-11",
        "value": 120.1174
      },
      {
        "date": "2026-06-12",
        "value": 119.5073
      },
      {
        "date": "2026-06-15",
        "value": 119.3158
      },
      {
        "date": "2026-06-16",
        "value": 119.256
      },
      {
        "date": "2026-06-17",
        "value": 119.3871
      },
      {
        "date": "2026-06-18",
        "value": 120.3958
      },
      {
        "date": "2026-06-22",
        "value": 120.5463
      },
      {
        "date": "2026-06-23",
        "value": 121.0552
      },
      {
        "date": "2026-06-24",
        "value": 121.412
      },
      {
        "date": "2026-06-25",
        "value": 121.0559
      },
      {
        "date": "2026-06-26",
        "value": 120.8866
      },
      {
        "date": "2026-06-29",
        "value": 120.9525
      },
      {
        "date": "2026-06-30",
        "value": 120.9248
      },
      {
        "date": "2026-07-01",
        "value": 121.1455
      },
      {
        "date": "2026-07-02",
        "value": 120.6902
      },
      {
        "date": "2026-07-06",
        "value": 120.835
      },
      {
        "date": "2026-07-07",
        "value": 120.8145
      },
      {
        "date": "2026-07-08",
        "value": 121.1307
      },
      {
        "date": "2026-07-09",
        "value": 120.753
      },
      {
        "date": "2026-07-10",
        "value": 120.5046
      }
    ],
    "wti": [
      {
        "date": "2024-11-22",
        "value": 71.68
      },
      {
        "date": "2024-11-25",
        "value": 69.41
      },
      {
        "date": "2024-11-26",
        "value": 69.05
      },
      {
        "date": "2024-11-27",
        "value": 69.03
      },
      {
        "date": "2024-11-29",
        "value": 68.26
      },
      {
        "date": "2024-12-02",
        "value": 68.35
      },
      {
        "date": "2024-12-03",
        "value": 70.15
      },
      {
        "date": "2024-12-04",
        "value": 68.81
      },
      {
        "date": "2024-12-05",
        "value": 68.58
      },
      {
        "date": "2024-12-06",
        "value": 68.58
      },
      {
        "date": "2024-12-09",
        "value": 68.65
      },
      {
        "date": "2024-12-10",
        "value": 68.85
      },
      {
        "date": "2024-12-11",
        "value": 70.57
      },
      {
        "date": "2024-12-12",
        "value": 70.25
      },
      {
        "date": "2024-12-13",
        "value": 71.54
      },
      {
        "date": "2024-12-16",
        "value": 71.03
      },
      {
        "date": "2024-12-17",
        "value": 70.31
      },
      {
        "date": "2024-12-18",
        "value": 70.8
      },
      {
        "date": "2024-12-19",
        "value": 70.1
      },
      {
        "date": "2024-12-20",
        "value": 69.71
      },
      {
        "date": "2024-12-23",
        "value": 69.5
      },
      {
        "date": "2024-12-24",
        "value": 70.87
      },
      {
        "date": "2024-12-26",
        "value": 70.38
      },
      {
        "date": "2024-12-27",
        "value": 71.28
      },
      {
        "date": "2024-12-30",
        "value": 71.73
      },
      {
        "date": "2024-12-31",
        "value": 72.44
      },
      {
        "date": "2025-01-02",
        "value": 73.79
      },
      {
        "date": "2025-01-03",
        "value": 74.64
      },
      {
        "date": "2025-01-06",
        "value": 74.31
      },
      {
        "date": "2025-01-07",
        "value": 74.99
      },
      {
        "date": "2025-01-08",
        "value": 73.99
      },
      {
        "date": "2025-01-10",
        "value": 77.27
      },
      {
        "date": "2025-01-13",
        "value": 79.57
      },
      {
        "date": "2025-01-14",
        "value": 78.2
      },
      {
        "date": "2025-01-15",
        "value": 80.73
      },
      {
        "date": "2025-01-16",
        "value": 79.35
      },
      {
        "date": "2025-01-17",
        "value": 78.56
      },
      {
        "date": "2025-01-21",
        "value": 76.79
      },
      {
        "date": "2025-01-22",
        "value": 76.12
      },
      {
        "date": "2025-01-23",
        "value": 75.03
      },
      {
        "date": "2025-01-24",
        "value": 74.97
      },
      {
        "date": "2025-01-27",
        "value": 73.51
      },
      {
        "date": "2025-01-28",
        "value": 74.15
      },
      {
        "date": "2025-01-29",
        "value": 72.94
      },
      {
        "date": "2025-01-30",
        "value": 73.1
      },
      {
        "date": "2025-01-31",
        "value": 72.84
      },
      {
        "date": "2025-02-03",
        "value": 73.52
      },
      {
        "date": "2025-02-04",
        "value": 73.04
      },
      {
        "date": "2025-02-05",
        "value": 71.39
      },
      {
        "date": "2025-02-06",
        "value": 70.97
      },
      {
        "date": "2025-02-07",
        "value": 71.32
      },
      {
        "date": "2025-02-10",
        "value": 72.73
      },
      {
        "date": "2025-02-11",
        "value": 73.67
      },
      {
        "date": "2025-02-12",
        "value": 71.72
      },
      {
        "date": "2025-02-13",
        "value": 71.66
      },
      {
        "date": "2025-02-14",
        "value": 71.05
      },
      {
        "date": "2025-02-18",
        "value": 72.21
      },
      {
        "date": "2025-02-19",
        "value": 72.58
      },
      {
        "date": "2025-02-20",
        "value": 72.88
      },
      {
        "date": "2025-02-21",
        "value": 70.72
      },
      {
        "date": "2025-02-24",
        "value": 71.06
      },
      {
        "date": "2025-02-25",
        "value": 69.15
      },
      {
        "date": "2025-02-26",
        "value": 68.87
      },
      {
        "date": "2025-02-27",
        "value": 70.62
      },
      {
        "date": "2025-02-28",
        "value": 69.97
      },
      {
        "date": "2025-03-03",
        "value": 68.63
      },
      {
        "date": "2025-03-04",
        "value": 68.47
      },
      {
        "date": "2025-03-05",
        "value": 66.58
      },
      {
        "date": "2025-03-06",
        "value": 66.62
      },
      {
        "date": "2025-03-07",
        "value": 67.29
      },
      {
        "date": "2025-03-10",
        "value": 66.31
      },
      {
        "date": "2025-03-11",
        "value": 66.52
      },
      {
        "date": "2025-03-12",
        "value": 67.65
      },
      {
        "date": "2025-03-13",
        "value": 66.82
      },
      {
        "date": "2025-03-14",
        "value": 67.43
      },
      {
        "date": "2025-03-17",
        "value": 67.84
      },
      {
        "date": "2025-03-18",
        "value": 67.49
      },
      {
        "date": "2025-03-19",
        "value": 67.4
      },
      {
        "date": "2025-03-20",
        "value": 68.55
      },
      {
        "date": "2025-03-21",
        "value": 68.52
      },
      {
        "date": "2025-03-24",
        "value": 69.46
      },
      {
        "date": "2025-03-25",
        "value": 69.48
      },
      {
        "date": "2025-03-26",
        "value": 70.05
      },
      {
        "date": "2025-03-27",
        "value": 70.3
      },
      {
        "date": "2025-03-28",
        "value": 69.74
      },
      {
        "date": "2025-03-31",
        "value": 71.87
      },
      {
        "date": "2025-04-01",
        "value": 71.61
      },
      {
        "date": "2025-04-02",
        "value": 72.12
      },
      {
        "date": "2025-04-03",
        "value": 67.43
      },
      {
        "date": "2025-04-04",
        "value": 62.42
      },
      {
        "date": "2025-04-07",
        "value": 61.05
      },
      {
        "date": "2025-04-08",
        "value": 60.04
      },
      {
        "date": "2025-04-09",
        "value": 62.63
      },
      {
        "date": "2025-04-10",
        "value": 60.57
      },
      {
        "date": "2025-04-11",
        "value": 61.91
      },
      {
        "date": "2025-04-14",
        "value": 61.99
      },
      {
        "date": "2025-04-15",
        "value": 61.74
      },
      {
        "date": "2025-04-16",
        "value": 62.88
      },
      {
        "date": "2025-04-17",
        "value": 65.07
      },
      {
        "date": "2025-04-21",
        "value": 63.48
      },
      {
        "date": "2025-04-22",
        "value": 64.6
      },
      {
        "date": "2025-04-23",
        "value": 62.64
      },
      {
        "date": "2025-04-24",
        "value": 63.55
      },
      {
        "date": "2025-04-25",
        "value": 63.85
      },
      {
        "date": "2025-04-28",
        "value": 63.3
      },
      {
        "date": "2025-04-29",
        "value": 61.84
      },
      {
        "date": "2025-04-30",
        "value": 59.55
      },
      {
        "date": "2025-05-01",
        "value": 60.59
      },
      {
        "date": "2025-05-02",
        "value": 59.67
      },
      {
        "date": "2025-05-05",
        "value": 58.5
      },
      {
        "date": "2025-05-06",
        "value": 60.42
      },
      {
        "date": "2025-05-07",
        "value": 59.42
      },
      {
        "date": "2025-05-08",
        "value": 61.25
      },
      {
        "date": "2025-05-09",
        "value": 62.37
      },
      {
        "date": "2025-05-12",
        "value": 63.32
      },
      {
        "date": "2025-05-13",
        "value": 65.04
      },
      {
        "date": "2025-05-14",
        "value": 64.48
      },
      {
        "date": "2025-05-15",
        "value": 63.03
      },
      {
        "date": "2025-05-16",
        "value": 63.84
      },
      {
        "date": "2025-05-19",
        "value": 63.98
      },
      {
        "date": "2025-05-20",
        "value": 63.97
      },
      {
        "date": "2025-05-21",
        "value": 62.93
      },
      {
        "date": "2025-05-22",
        "value": 62.55
      },
      {
        "date": "2025-05-23",
        "value": 62.89
      },
      {
        "date": "2025-05-27",
        "value": 61.61
      },
      {
        "date": "2025-05-28",
        "value": 62.54
      },
      {
        "date": "2025-05-29",
        "value": 61.66
      },
      {
        "date": "2025-05-30",
        "value": 61.46
      },
      {
        "date": "2025-06-02",
        "value": 63.27
      },
      {
        "date": "2025-06-03",
        "value": 64.1
      },
      {
        "date": "2025-06-04",
        "value": 63.57
      },
      {
        "date": "2025-06-05",
        "value": 64.06
      },
      {
        "date": "2025-06-06",
        "value": 65.3
      },
      {
        "date": "2025-06-09",
        "value": 65.99
      },
      {
        "date": "2025-06-10",
        "value": 65.66
      },
      {
        "date": "2025-06-11",
        "value": 68.91
      },
      {
        "date": "2025-06-12",
        "value": 68.73
      },
      {
        "date": "2025-06-13",
        "value": 73.84
      },
      {
        "date": "2025-06-16",
        "value": 72.53
      },
      {
        "date": "2025-06-17",
        "value": 75.62
      },
      {
        "date": "2025-06-18",
        "value": 75.89
      },
      {
        "date": "2025-06-20",
        "value": 75.72
      },
      {
        "date": "2025-06-23",
        "value": 69.36
      },
      {
        "date": "2025-06-24",
        "value": 65.45
      },
      {
        "date": "2025-06-25",
        "value": 65.98
      },
      {
        "date": "2025-06-26",
        "value": 66.44
      },
      {
        "date": "2025-06-27",
        "value": 66.66
      },
      {
        "date": "2025-06-30",
        "value": 66.3
      },
      {
        "date": "2025-07-01",
        "value": 66.64
      },
      {
        "date": "2025-07-02",
        "value": 68.66
      },
      {
        "date": "2025-07-03",
        "value": 68.13
      },
      {
        "date": "2025-07-07",
        "value": 69.16
      },
      {
        "date": "2025-07-08",
        "value": 69.55
      },
      {
        "date": "2025-07-09",
        "value": 69.61
      },
      {
        "date": "2025-07-10",
        "value": 67.78
      },
      {
        "date": "2025-07-11",
        "value": 69.63
      },
      {
        "date": "2025-07-14",
        "value": 68.19
      },
      {
        "date": "2025-07-15",
        "value": 67.76
      },
      {
        "date": "2025-07-16",
        "value": 67.13
      },
      {
        "date": "2025-07-17",
        "value": 68.76
      },
      {
        "date": "2025-07-18",
        "value": 68.53
      },
      {
        "date": "2025-07-21",
        "value": 68.39
      },
      {
        "date": "2025-07-22",
        "value": 67.56
      },
      {
        "date": "2025-07-23",
        "value": 66.05
      },
      {
        "date": "2025-07-24",
        "value": 67.16
      },
      {
        "date": "2025-07-25",
        "value": 66.38
      },
      {
        "date": "2025-07-28",
        "value": 67.81
      },
      {
        "date": "2025-07-29",
        "value": 70.27
      },
      {
        "date": "2025-07-30",
        "value": 71.09
      },
      {
        "date": "2025-07-31",
        "value": 70.36
      },
      {
        "date": "2025-08-01",
        "value": 68.39
      },
      {
        "date": "2025-08-04",
        "value": 67.33
      },
      {
        "date": "2025-08-05",
        "value": 66.2
      },
      {
        "date": "2025-08-06",
        "value": 65.38
      },
      {
        "date": "2025-08-07",
        "value": 64.9
      },
      {
        "date": "2025-08-08",
        "value": 64.94
      },
      {
        "date": "2025-08-11",
        "value": 65.03
      },
      {
        "date": "2025-08-12",
        "value": 64.22
      },
      {
        "date": "2025-08-13",
        "value": 63.68
      },
      {
        "date": "2025-08-14",
        "value": 64.99
      },
      {
        "date": "2025-08-15",
        "value": 63.78
      },
      {
        "date": "2025-08-18",
        "value": 64.51
      },
      {
        "date": "2025-08-19",
        "value": 63.38
      },
      {
        "date": "2025-08-20",
        "value": 64.19
      },
      {
        "date": "2025-08-21",
        "value": 64.56
      },
      {
        "date": "2025-08-22",
        "value": 64.08
      },
      {
        "date": "2025-08-25",
        "value": 65.18
      },
      {
        "date": "2025-08-26",
        "value": 63.6
      },
      {
        "date": "2025-08-27",
        "value": 64.49
      },
      {
        "date": "2025-08-28",
        "value": 64.96
      },
      {
        "date": "2025-08-29",
        "value": 64.36
      },
      {
        "date": "2025-09-02",
        "value": 65.95
      },
      {
        "date": "2025-09-03",
        "value": 64.36
      },
      {
        "date": "2025-09-04",
        "value": 63.81
      },
      {
        "date": "2025-09-05",
        "value": 62.22
      },
      {
        "date": "2025-09-08",
        "value": 62.6
      },
      {
        "date": "2025-09-09",
        "value": 62.97
      },
      {
        "date": "2025-09-10",
        "value": 64.01
      },
      {
        "date": "2025-09-11",
        "value": 62.71
      },
      {
        "date": "2025-09-12",
        "value": 63.02
      },
      {
        "date": "2025-09-15",
        "value": 63.66
      },
      {
        "date": "2025-09-16",
        "value": 64.89
      },
      {
        "date": "2025-09-17",
        "value": 64.41
      },
      {
        "date": "2025-09-18",
        "value": 63.91
      },
      {
        "date": "2025-09-19",
        "value": 63.02
      },
      {
        "date": "2025-09-22",
        "value": 62.99
      },
      {
        "date": "2025-09-23",
        "value": 63.76
      },
      {
        "date": "2025-09-24",
        "value": 65.4
      },
      {
        "date": "2025-09-25",
        "value": 65.51
      },
      {
        "date": "2025-09-26",
        "value": 66.5
      },
      {
        "date": "2025-09-29",
        "value": 64.27
      },
      {
        "date": "2025-09-30",
        "value": 63.17
      },
      {
        "date": "2025-10-01",
        "value": 62.59
      },
      {
        "date": "2025-10-02",
        "value": 61.28
      },
      {
        "date": "2025-10-03",
        "value": 61.65
      },
      {
        "date": "2025-10-06",
        "value": 62.49
      },
      {
        "date": "2025-10-07",
        "value": 62.52
      },
      {
        "date": "2025-10-08",
        "value": 63.37
      },
      {
        "date": "2025-10-09",
        "value": 62.36
      },
      {
        "date": "2025-10-10",
        "value": 59.75
      },
      {
        "date": "2025-10-14",
        "value": 59.52
      },
      {
        "date": "2025-10-15",
        "value": 59.08
      },
      {
        "date": "2025-10-16",
        "value": 58.29
      },
      {
        "date": "2025-10-17",
        "value": 58.3
      },
      {
        "date": "2025-10-20",
        "value": 58.34
      },
      {
        "date": "2025-10-21",
        "value": 58.66
      },
      {
        "date": "2025-10-22",
        "value": 59.3
      },
      {
        "date": "2025-10-23",
        "value": 62.44
      },
      {
        "date": "2025-10-24",
        "value": 62.27
      },
      {
        "date": "2025-10-27",
        "value": 62.13
      },
      {
        "date": "2025-10-28",
        "value": 60.97
      },
      {
        "date": "2025-10-29",
        "value": 61.26
      },
      {
        "date": "2025-10-30",
        "value": 61.36
      },
      {
        "date": "2025-10-31",
        "value": 61.75
      },
      {
        "date": "2025-11-03",
        "value": 61.79
      },
      {
        "date": "2025-11-04",
        "value": 61.38
      },
      {
        "date": "2025-11-05",
        "value": 60.4
      },
      {
        "date": "2025-11-06",
        "value": 60.24
      },
      {
        "date": "2025-11-07",
        "value": 60.54
      },
      {
        "date": "2025-11-10",
        "value": 60.94
      },
      {
        "date": "2025-11-12",
        "value": 59.3
      },
      {
        "date": "2025-11-13",
        "value": 59.54
      },
      {
        "date": "2025-11-14",
        "value": 60.87
      },
      {
        "date": "2025-11-17",
        "value": 60.66
      },
      {
        "date": "2025-11-18",
        "value": 61.51
      },
      {
        "date": "2025-11-19",
        "value": 60.27
      },
      {
        "date": "2025-11-20",
        "value": 60.07
      },
      {
        "date": "2025-11-21",
        "value": 58.86
      },
      {
        "date": "2025-11-24",
        "value": 59.11
      },
      {
        "date": "2025-11-25",
        "value": 58.25
      },
      {
        "date": "2025-11-26",
        "value": 58.81
      },
      {
        "date": "2025-11-28",
        "value": 58.58
      },
      {
        "date": "2025-12-01",
        "value": 59.47
      },
      {
        "date": "2025-12-02",
        "value": 58.81
      },
      {
        "date": "2025-12-03",
        "value": 59.09
      },
      {
        "date": "2025-12-04",
        "value": 59.82
      },
      {
        "date": "2025-12-05",
        "value": 60.23
      },
      {
        "date": "2025-12-08",
        "value": 59.04
      },
      {
        "date": "2025-12-09",
        "value": 58.4
      },
      {
        "date": "2025-12-10",
        "value": 58.67
      },
      {
        "date": "2025-12-11",
        "value": 57.76
      },
      {
        "date": "2025-12-12",
        "value": 57.61
      },
      {
        "date": "2025-12-15",
        "value": 56.97
      },
      {
        "date": "2025-12-16",
        "value": 55.44
      },
      {
        "date": "2025-12-17",
        "value": 56.07
      },
      {
        "date": "2025-12-18",
        "value": 56.22
      },
      {
        "date": "2025-12-19",
        "value": 56.8
      },
      {
        "date": "2025-12-22",
        "value": 58.18
      },
      {
        "date": "2025-12-23",
        "value": 58.55
      },
      {
        "date": "2025-12-24",
        "value": 58.72
      },
      {
        "date": "2025-12-26",
        "value": 56.6
      },
      {
        "date": "2025-12-29",
        "value": 57.89
      },
      {
        "date": "2025-12-30",
        "value": 57.79
      },
      {
        "date": "2025-12-31",
        "value": 57.26
      },
      {
        "date": "2026-01-02",
        "value": 57.21
      },
      {
        "date": "2026-01-05",
        "value": 58.1
      },
      {
        "date": "2026-01-06",
        "value": 56.97
      },
      {
        "date": "2026-01-07",
        "value": 56.01
      },
      {
        "date": "2026-01-08",
        "value": 57.74
      },
      {
        "date": "2026-01-09",
        "value": 58.96
      },
      {
        "date": "2026-01-12",
        "value": 59.39
      },
      {
        "date": "2026-01-13",
        "value": 60.85
      },
      {
        "date": "2026-01-14",
        "value": 61.84
      },
      {
        "date": "2026-01-15",
        "value": 59.13
      },
      {
        "date": "2026-01-16",
        "value": 59.4
      },
      {
        "date": "2026-01-20",
        "value": 60.3
      },
      {
        "date": "2026-01-21",
        "value": 60.38
      },
      {
        "date": "2026-01-22",
        "value": 59.24
      },
      {
        "date": "2026-01-23",
        "value": 60.7
      },
      {
        "date": "2026-01-26",
        "value": 60.46
      },
      {
        "date": "2026-01-27",
        "value": 62.04
      },
      {
        "date": "2026-01-28",
        "value": 62.75
      },
      {
        "date": "2026-01-29",
        "value": 64.77
      },
      {
        "date": "2026-01-30",
        "value": 64.5
      },
      {
        "date": "2026-02-02",
        "value": 61.6
      },
      {
        "date": "2026-02-03",
        "value": 62.62
      },
      {
        "date": "2026-02-04",
        "value": 64.56
      },
      {
        "date": "2026-02-05",
        "value": 62.9
      },
      {
        "date": "2026-02-06",
        "value": 63.77
      },
      {
        "date": "2026-02-09",
        "value": 64.53
      },
      {
        "date": "2026-02-10",
        "value": 64.2
      },
      {
        "date": "2026-02-11",
        "value": 64.8
      },
      {
        "date": "2026-02-12",
        "value": 63.08
      },
      {
        "date": "2026-02-13",
        "value": 63.05
      },
      {
        "date": "2026-02-17",
        "value": 62.53
      },
      {
        "date": "2026-02-18",
        "value": 65.33
      },
      {
        "date": "2026-02-19",
        "value": 66.66
      },
      {
        "date": "2026-02-20",
        "value": 66.69
      },
      {
        "date": "2026-02-23",
        "value": 66.36
      },
      {
        "date": "2026-02-24",
        "value": 65.62
      },
      {
        "date": "2026-02-25",
        "value": 65.3
      },
      {
        "date": "2026-02-26",
        "value": 65.1
      },
      {
        "date": "2026-02-27",
        "value": 66.96
      },
      {
        "date": "2026-03-02",
        "value": 71.13
      },
      {
        "date": "2026-03-03",
        "value": 74.48
      },
      {
        "date": "2026-03-04",
        "value": 74.58
      },
      {
        "date": "2026-03-05",
        "value": 80.88
      },
      {
        "date": "2026-03-06",
        "value": 90.77
      },
      {
        "date": "2026-03-09",
        "value": 94.65
      },
      {
        "date": "2026-03-10",
        "value": 83.71
      },
      {
        "date": "2026-03-11",
        "value": 86.8
      },
      {
        "date": "2026-03-12",
        "value": 95.61
      },
      {
        "date": "2026-03-13",
        "value": 98.48
      },
      {
        "date": "2026-03-16",
        "value": 93.39
      },
      {
        "date": "2026-03-17",
        "value": 96.01
      },
      {
        "date": "2026-03-18",
        "value": 96.12
      },
      {
        "date": "2026-03-19",
        "value": 96.11
      },
      {
        "date": "2026-03-20",
        "value": 98.71
      },
      {
        "date": "2026-03-23",
        "value": 89.33
      },
      {
        "date": "2026-03-24",
        "value": 93.18
      },
      {
        "date": "2026-03-25",
        "value": 91.51
      },
      {
        "date": "2026-03-26",
        "value": 96.18
      },
      {
        "date": "2026-03-27",
        "value": 101.26
      },
      {
        "date": "2026-03-30",
        "value": 104.69
      },
      {
        "date": "2026-03-31",
        "value": 102.86
      },
      {
        "date": "2026-04-01",
        "value": 101.9
      },
      {
        "date": "2026-04-02",
        "value": 113.23
      },
      {
        "date": "2026-04-06",
        "value": 114.01
      },
      {
        "date": "2026-04-07",
        "value": 114.58
      },
      {
        "date": "2026-04-08",
        "value": 96.17
      },
      {
        "date": "2026-04-09",
        "value": 99.62
      },
      {
        "date": "2026-04-10",
        "value": 98.34
      },
      {
        "date": "2026-04-13",
        "value": 100.72
      },
      {
        "date": "2026-04-14",
        "value": 93.07
      },
      {
        "date": "2026-04-15",
        "value": 93.04
      },
      {
        "date": "2026-04-16",
        "value": 96.46
      },
      {
        "date": "2026-04-17",
        "value": 85.91
      },
      {
        "date": "2026-04-20",
        "value": 91.06
      },
      {
        "date": "2026-04-21",
        "value": 93.64
      },
      {
        "date": "2026-04-22",
        "value": 94.76
      },
      {
        "date": "2026-04-23",
        "value": 99.27
      },
      {
        "date": "2026-04-24",
        "value": 98.42
      },
      {
        "date": "2026-04-27",
        "value": 99.89
      },
      {
        "date": "2026-04-28",
        "value": 103.45
      },
      {
        "date": "2026-04-29",
        "value": 110.47
      },
      {
        "date": "2026-04-30",
        "value": 108.64
      },
      {
        "date": "2026-05-01",
        "value": 105.38
      },
      {
        "date": "2026-05-04",
        "value": 109.76
      },
      {
        "date": "2026-05-05",
        "value": 105.66
      },
      {
        "date": "2026-05-06",
        "value": 98.75
      },
      {
        "date": "2026-05-07",
        "value": 98.38
      },
      {
        "date": "2026-05-08",
        "value": 98.87
      },
      {
        "date": "2026-05-11",
        "value": 101.56
      },
      {
        "date": "2026-05-12",
        "value": 105.78
      },
      {
        "date": "2026-05-13",
        "value": 104.52
      },
      {
        "date": "2026-05-14",
        "value": 104.66
      },
      {
        "date": "2026-05-15",
        "value": 108.99
      },
      {
        "date": "2026-05-18",
        "value": 112.25
      },
      {
        "date": "2026-05-19",
        "value": 112.09
      },
      {
        "date": "2026-05-20",
        "value": 101.69
      },
      {
        "date": "2026-05-21",
        "value": 100.2
      },
      {
        "date": "2026-05-22",
        "value": 100.35
      },
      {
        "date": "2026-05-26",
        "value": 97.63
      },
      {
        "date": "2026-05-27",
        "value": 92.35
      },
      {
        "date": "2026-05-28",
        "value": 92.65
      },
      {
        "date": "2026-05-29",
        "value": 91.16
      },
      {
        "date": "2026-06-01",
        "value": 95.96
      },
      {
        "date": "2026-06-02",
        "value": 97.47
      },
      {
        "date": "2026-06-03",
        "value": 99.76
      },
      {
        "date": "2026-06-04",
        "value": 96.83
      },
      {
        "date": "2026-06-05",
        "value": 94.32
      },
      {
        "date": "2026-06-08",
        "value": 95.0
      },
      {
        "date": "2026-06-09",
        "value": 91.9
      },
      {
        "date": "2026-06-10",
        "value": 93.68
      },
      {
        "date": "2026-06-11",
        "value": 91.58
      },
      {
        "date": "2026-06-12",
        "value": 88.62
      },
      {
        "date": "2026-06-15",
        "value": 84.65
      },
      {
        "date": "2026-06-16",
        "value": 79.8
      },
      {
        "date": "2026-06-17",
        "value": 80.65
      },
      {
        "date": "2026-06-18",
        "value": 80.35
      },
      {
        "date": "2026-06-22",
        "value": 78.94
      },
      {
        "date": "2026-06-23",
        "value": 74.62
      },
      {
        "date": "2026-06-24",
        "value": 71.42
      },
      {
        "date": "2026-06-25",
        "value": 72.67
      },
      {
        "date": "2026-06-26",
        "value": 70.3
      },
      {
        "date": "2026-06-29",
        "value": 71.87
      },
      {
        "date": "2026-06-30",
        "value": 70.56
      },
      {
        "date": "2026-07-01",
        "value": 69.74
      },
      {
        "date": "2026-07-02",
        "value": 69.73
      },
      {
        "date": "2026-07-06",
        "value": 69.6
      }
    ],
    "sp500": [
      {
        "date": "2024-12-05",
        "value": 6075.10986328125
      },
      {
        "date": "2024-12-06",
        "value": 6090.27001953125
      },
      {
        "date": "2024-12-09",
        "value": 6052.85009765625
      },
      {
        "date": "2024-12-10",
        "value": 6034.91015625
      },
      {
        "date": "2024-12-11",
        "value": 6084.18994140625
      },
      {
        "date": "2024-12-12",
        "value": 6051.25
      },
      {
        "date": "2024-12-13",
        "value": 6051.08984375
      },
      {
        "date": "2024-12-16",
        "value": 6074.080078125
      },
      {
        "date": "2024-12-17",
        "value": 6050.60986328125
      },
      {
        "date": "2024-12-18",
        "value": 5872.16015625
      },
      {
        "date": "2024-12-19",
        "value": 5867.080078125
      },
      {
        "date": "2024-12-20",
        "value": 5930.85009765625
      },
      {
        "date": "2024-12-23",
        "value": 5974.06982421875
      },
      {
        "date": "2024-12-24",
        "value": 6040.0400390625
      },
      {
        "date": "2024-12-26",
        "value": 6037.58984375
      },
      {
        "date": "2024-12-27",
        "value": 5970.83984375
      },
      {
        "date": "2024-12-30",
        "value": 5906.93994140625
      },
      {
        "date": "2024-12-31",
        "value": 5881.6298828125
      },
      {
        "date": "2025-01-02",
        "value": 5868.5498046875
      },
      {
        "date": "2025-01-03",
        "value": 5942.47021484375
      },
      {
        "date": "2025-01-06",
        "value": 5975.3798828125
      },
      {
        "date": "2025-01-07",
        "value": 5909.02978515625
      },
      {
        "date": "2025-01-08",
        "value": 5918.25
      },
      {
        "date": "2025-01-10",
        "value": 5827.0400390625
      },
      {
        "date": "2025-01-13",
        "value": 5836.22021484375
      },
      {
        "date": "2025-01-14",
        "value": 5842.91015625
      },
      {
        "date": "2025-01-15",
        "value": 5949.91015625
      },
      {
        "date": "2025-01-16",
        "value": 5937.33984375
      },
      {
        "date": "2025-01-17",
        "value": 5996.66015625
      },
      {
        "date": "2025-01-21",
        "value": 6049.240234375
      },
      {
        "date": "2025-01-22",
        "value": 6086.3701171875
      },
      {
        "date": "2025-01-23",
        "value": 6118.7099609375
      },
      {
        "date": "2025-01-24",
        "value": 6101.240234375
      },
      {
        "date": "2025-01-27",
        "value": 6012.27978515625
      },
      {
        "date": "2025-01-28",
        "value": 6067.7001953125
      },
      {
        "date": "2025-01-29",
        "value": 6039.31005859375
      },
      {
        "date": "2025-01-30",
        "value": 6071.169921875
      },
      {
        "date": "2025-01-31",
        "value": 6040.52978515625
      },
      {
        "date": "2025-02-03",
        "value": 5994.56982421875
      },
      {
        "date": "2025-02-04",
        "value": 6037.8798828125
      },
      {
        "date": "2025-02-05",
        "value": 6061.47998046875
      },
      {
        "date": "2025-02-06",
        "value": 6083.56982421875
      },
      {
        "date": "2025-02-07",
        "value": 6025.990234375
      },
      {
        "date": "2025-02-10",
        "value": 6066.43994140625
      },
      {
        "date": "2025-02-11",
        "value": 6068.5
      },
      {
        "date": "2025-02-12",
        "value": 6051.97021484375
      },
      {
        "date": "2025-02-13",
        "value": 6115.06982421875
      },
      {
        "date": "2025-02-14",
        "value": 6114.6298828125
      },
      {
        "date": "2025-02-18",
        "value": 6129.580078125
      },
      {
        "date": "2025-02-19",
        "value": 6144.14990234375
      },
      {
        "date": "2025-02-20",
        "value": 6117.52001953125
      },
      {
        "date": "2025-02-21",
        "value": 6013.1298828125
      },
      {
        "date": "2025-02-24",
        "value": 5983.25
      },
      {
        "date": "2025-02-25",
        "value": 5955.25
      },
      {
        "date": "2025-02-26",
        "value": 5956.06005859375
      },
      {
        "date": "2025-02-27",
        "value": 5861.56982421875
      },
      {
        "date": "2025-02-28",
        "value": 5954.5
      },
      {
        "date": "2025-03-03",
        "value": 5849.72021484375
      },
      {
        "date": "2025-03-04",
        "value": 5778.14990234375
      },
      {
        "date": "2025-03-05",
        "value": 5842.6298828125
      },
      {
        "date": "2025-03-06",
        "value": 5738.52001953125
      },
      {
        "date": "2025-03-07",
        "value": 5770.2001953125
      },
      {
        "date": "2025-03-10",
        "value": 5614.56005859375
      },
      {
        "date": "2025-03-11",
        "value": 5572.06982421875
      },
      {
        "date": "2025-03-12",
        "value": 5599.2998046875
      },
      {
        "date": "2025-03-13",
        "value": 5521.52001953125
      },
      {
        "date": "2025-03-14",
        "value": 5638.93994140625
      },
      {
        "date": "2025-03-17",
        "value": 5675.1201171875
      },
      {
        "date": "2025-03-18",
        "value": 5614.66015625
      },
      {
        "date": "2025-03-19",
        "value": 5675.2900390625
      },
      {
        "date": "2025-03-20",
        "value": 5662.89013671875
      },
      {
        "date": "2025-03-21",
        "value": 5667.56005859375
      },
      {
        "date": "2025-03-24",
        "value": 5767.56982421875
      },
      {
        "date": "2025-03-25",
        "value": 5776.64990234375
      },
      {
        "date": "2025-03-26",
        "value": 5712.2001953125
      },
      {
        "date": "2025-03-27",
        "value": 5693.31005859375
      },
      {
        "date": "2025-03-28",
        "value": 5580.93994140625
      },
      {
        "date": "2025-03-31",
        "value": 5611.85009765625
      },
      {
        "date": "2025-04-01",
        "value": 5633.06982421875
      },
      {
        "date": "2025-04-02",
        "value": 5670.97021484375
      },
      {
        "date": "2025-04-03",
        "value": 5396.52001953125
      },
      {
        "date": "2025-04-04",
        "value": 5074.080078125
      },
      {
        "date": "2025-04-07",
        "value": 5062.25
      },
      {
        "date": "2025-04-08",
        "value": 4982.77001953125
      },
      {
        "date": "2025-04-09",
        "value": 5456.89990234375
      },
      {
        "date": "2025-04-10",
        "value": 5268.0498046875
      },
      {
        "date": "2025-04-11",
        "value": 5363.35986328125
      },
      {
        "date": "2025-04-14",
        "value": 5405.97021484375
      },
      {
        "date": "2025-04-15",
        "value": 5396.6298828125
      },
      {
        "date": "2025-04-16",
        "value": 5275.7001953125
      },
      {
        "date": "2025-04-17",
        "value": 5282.7001953125
      },
      {
        "date": "2025-04-21",
        "value": 5158.2001953125
      },
      {
        "date": "2025-04-22",
        "value": 5287.759765625
      },
      {
        "date": "2025-04-23",
        "value": 5375.85986328125
      },
      {
        "date": "2025-04-24",
        "value": 5484.77001953125
      },
      {
        "date": "2025-04-25",
        "value": 5525.2099609375
      },
      {
        "date": "2025-04-28",
        "value": 5528.75
      },
      {
        "date": "2025-04-29",
        "value": 5560.830078125
      },
      {
        "date": "2025-04-30",
        "value": 5569.06005859375
      },
      {
        "date": "2025-05-01",
        "value": 5604.14013671875
      },
      {
        "date": "2025-05-02",
        "value": 5686.669921875
      },
      {
        "date": "2025-05-05",
        "value": 5650.3798828125
      },
      {
        "date": "2025-05-06",
        "value": 5606.91015625
      },
      {
        "date": "2025-05-07",
        "value": 5631.27978515625
      },
      {
        "date": "2025-05-08",
        "value": 5663.93994140625
      },
      {
        "date": "2025-05-09",
        "value": 5659.91015625
      },
      {
        "date": "2025-05-12",
        "value": 5844.18994140625
      },
      {
        "date": "2025-05-13",
        "value": 5886.5498046875
      },
      {
        "date": "2025-05-14",
        "value": 5892.580078125
      },
      {
        "date": "2025-05-15",
        "value": 5916.93017578125
      },
      {
        "date": "2025-05-16",
        "value": 5958.3798828125
      },
      {
        "date": "2025-05-19",
        "value": 5963.60009765625
      },
      {
        "date": "2025-05-20",
        "value": 5940.4599609375
      },
      {
        "date": "2025-05-21",
        "value": 5844.60986328125
      },
      {
        "date": "2025-05-22",
        "value": 5842.009765625
      },
      {
        "date": "2025-05-23",
        "value": 5802.81982421875
      },
      {
        "date": "2025-05-27",
        "value": 5921.5400390625
      },
      {
        "date": "2025-05-28",
        "value": 5888.5498046875
      },
      {
        "date": "2025-05-29",
        "value": 5912.169921875
      },
      {
        "date": "2025-05-30",
        "value": 5911.68994140625
      },
      {
        "date": "2025-06-02",
        "value": 5935.93994140625
      },
      {
        "date": "2025-06-03",
        "value": 5970.3701171875
      },
      {
        "date": "2025-06-04",
        "value": 5970.81005859375
      },
      {
        "date": "2025-06-05",
        "value": 5939.2998046875
      },
      {
        "date": "2025-06-06",
        "value": 6000.35986328125
      },
      {
        "date": "2025-06-09",
        "value": 6005.8798828125
      },
      {
        "date": "2025-06-10",
        "value": 6038.81005859375
      },
      {
        "date": "2025-06-11",
        "value": 6022.240234375
      },
      {
        "date": "2025-06-12",
        "value": 6045.259765625
      },
      {
        "date": "2025-06-13",
        "value": 5976.97021484375
      },
      {
        "date": "2025-06-16",
        "value": 6033.10986328125
      },
      {
        "date": "2025-06-17",
        "value": 5982.72021484375
      },
      {
        "date": "2025-06-18",
        "value": 5980.8701171875
      },
      {
        "date": "2025-06-20",
        "value": 5967.83984375
      },
      {
        "date": "2025-06-23",
        "value": 6025.169921875
      },
      {
        "date": "2025-06-24",
        "value": 6092.18017578125
      },
      {
        "date": "2025-06-25",
        "value": 6092.16015625
      },
      {
        "date": "2025-06-26",
        "value": 6141.02001953125
      },
      {
        "date": "2025-06-27",
        "value": 6173.06982421875
      },
      {
        "date": "2025-06-30",
        "value": 6204.9501953125
      },
      {
        "date": "2025-07-01",
        "value": 6198.009765625
      },
      {
        "date": "2025-07-02",
        "value": 6227.419921875
      },
      {
        "date": "2025-07-03",
        "value": 6279.35009765625
      },
      {
        "date": "2025-07-07",
        "value": 6229.97998046875
      },
      {
        "date": "2025-07-08",
        "value": 6225.52001953125
      },
      {
        "date": "2025-07-09",
        "value": 6263.259765625
      },
      {
        "date": "2025-07-10",
        "value": 6280.4599609375
      },
      {
        "date": "2025-07-11",
        "value": 6259.75
      },
      {
        "date": "2025-07-14",
        "value": 6268.56005859375
      },
      {
        "date": "2025-07-15",
        "value": 6243.759765625
      },
      {
        "date": "2025-07-16",
        "value": 6263.7001953125
      },
      {
        "date": "2025-07-17",
        "value": 6297.35986328125
      },
      {
        "date": "2025-07-18",
        "value": 6296.7900390625
      },
      {
        "date": "2025-07-21",
        "value": 6305.60009765625
      },
      {
        "date": "2025-07-22",
        "value": 6309.6201171875
      },
      {
        "date": "2025-07-23",
        "value": 6358.91015625
      },
      {
        "date": "2025-07-24",
        "value": 6363.35009765625
      },
      {
        "date": "2025-07-25",
        "value": 6388.64013671875
      },
      {
        "date": "2025-07-28",
        "value": 6389.77001953125
      },
      {
        "date": "2025-07-29",
        "value": 6370.85986328125
      },
      {
        "date": "2025-07-30",
        "value": 6362.89990234375
      },
      {
        "date": "2025-07-31",
        "value": 6339.39013671875
      },
      {
        "date": "2025-08-01",
        "value": 6238.009765625
      },
      {
        "date": "2025-08-04",
        "value": 6329.93994140625
      },
      {
        "date": "2025-08-05",
        "value": 6299.18994140625
      },
      {
        "date": "2025-08-06",
        "value": 6345.06005859375
      },
      {
        "date": "2025-08-07",
        "value": 6340.0
      },
      {
        "date": "2025-08-08",
        "value": 6389.4501953125
      },
      {
        "date": "2025-08-11",
        "value": 6373.4501953125
      },
      {
        "date": "2025-08-12",
        "value": 6445.759765625
      },
      {
        "date": "2025-08-13",
        "value": 6466.580078125
      },
      {
        "date": "2025-08-14",
        "value": 6468.5400390625
      },
      {
        "date": "2025-08-15",
        "value": 6449.7998046875
      },
      {
        "date": "2025-08-18",
        "value": 6449.14990234375
      },
      {
        "date": "2025-08-19",
        "value": 6411.3701171875
      },
      {
        "date": "2025-08-20",
        "value": 6395.77978515625
      },
      {
        "date": "2025-08-21",
        "value": 6370.169921875
      },
      {
        "date": "2025-08-22",
        "value": 6466.91015625
      },
      {
        "date": "2025-08-25",
        "value": 6439.31982421875
      },
      {
        "date": "2025-08-26",
        "value": 6465.93994140625
      },
      {
        "date": "2025-08-27",
        "value": 6481.39990234375
      },
      {
        "date": "2025-08-28",
        "value": 6501.85986328125
      },
      {
        "date": "2025-08-29",
        "value": 6460.259765625
      },
      {
        "date": "2025-09-02",
        "value": 6415.5400390625
      },
      {
        "date": "2025-09-03",
        "value": 6448.259765625
      },
      {
        "date": "2025-09-04",
        "value": 6502.080078125
      },
      {
        "date": "2025-09-05",
        "value": 6481.5
      },
      {
        "date": "2025-09-08",
        "value": 6495.14990234375
      },
      {
        "date": "2025-09-09",
        "value": 6512.60986328125
      },
      {
        "date": "2025-09-10",
        "value": 6532.0400390625
      },
      {
        "date": "2025-09-11",
        "value": 6587.47021484375
      },
      {
        "date": "2025-09-12",
        "value": 6584.2900390625
      },
      {
        "date": "2025-09-15",
        "value": 6615.27978515625
      },
      {
        "date": "2025-09-16",
        "value": 6606.759765625
      },
      {
        "date": "2025-09-17",
        "value": 6600.35009765625
      },
      {
        "date": "2025-09-18",
        "value": 6631.9599609375
      },
      {
        "date": "2025-09-19",
        "value": 6664.35986328125
      },
      {
        "date": "2025-09-22",
        "value": 6693.75
      },
      {
        "date": "2025-09-23",
        "value": 6656.919921875
      },
      {
        "date": "2025-09-24",
        "value": 6637.97021484375
      },
      {
        "date": "2025-09-25",
        "value": 6604.72021484375
      },
      {
        "date": "2025-09-26",
        "value": 6643.7001953125
      },
      {
        "date": "2025-09-29",
        "value": 6661.2099609375
      },
      {
        "date": "2025-09-30",
        "value": 6688.4599609375
      },
      {
        "date": "2025-10-01",
        "value": 6711.2001953125
      },
      {
        "date": "2025-10-02",
        "value": 6715.35009765625
      },
      {
        "date": "2025-10-03",
        "value": 6715.7900390625
      },
      {
        "date": "2025-10-06",
        "value": 6740.27978515625
      },
      {
        "date": "2025-10-07",
        "value": 6714.58984375
      },
      {
        "date": "2025-10-08",
        "value": 6753.72021484375
      },
      {
        "date": "2025-10-09",
        "value": 6735.10986328125
      },
      {
        "date": "2025-10-10",
        "value": 6552.509765625
      },
      {
        "date": "2025-10-13",
        "value": 6654.72021484375
      },
      {
        "date": "2025-10-14",
        "value": 6644.31005859375
      },
      {
        "date": "2025-10-15",
        "value": 6671.06005859375
      },
      {
        "date": "2025-10-16",
        "value": 6629.06982421875
      },
      {
        "date": "2025-10-17",
        "value": 6664.009765625
      },
      {
        "date": "2025-10-20",
        "value": 6735.1298828125
      },
      {
        "date": "2025-10-21",
        "value": 6735.35009765625
      },
      {
        "date": "2025-10-22",
        "value": 6699.39990234375
      },
      {
        "date": "2025-10-23",
        "value": 6738.43994140625
      },
      {
        "date": "2025-10-24",
        "value": 6791.68994140625
      },
      {
        "date": "2025-10-27",
        "value": 6875.16015625
      },
      {
        "date": "2025-10-28",
        "value": 6890.89013671875
      },
      {
        "date": "2025-10-29",
        "value": 6890.58984375
      },
      {
        "date": "2025-10-30",
        "value": 6822.33984375
      },
      {
        "date": "2025-10-31",
        "value": 6840.2001953125
      },
      {
        "date": "2025-11-03",
        "value": 6851.97021484375
      },
      {
        "date": "2025-11-04",
        "value": 6771.5498046875
      },
      {
        "date": "2025-11-05",
        "value": 6796.2900390625
      },
      {
        "date": "2025-11-06",
        "value": 6720.31982421875
      },
      {
        "date": "2025-11-07",
        "value": 6728.7998046875
      },
      {
        "date": "2025-11-10",
        "value": 6832.43017578125
      },
      {
        "date": "2025-11-11",
        "value": 6846.60986328125
      },
      {
        "date": "2025-11-12",
        "value": 6850.919921875
      },
      {
        "date": "2025-11-13",
        "value": 6737.490234375
      },
      {
        "date": "2025-11-14",
        "value": 6734.10986328125
      },
      {
        "date": "2025-11-17",
        "value": 6672.41015625
      },
      {
        "date": "2025-11-18",
        "value": 6617.31982421875
      },
      {
        "date": "2025-11-19",
        "value": 6642.16015625
      },
      {
        "date": "2025-11-20",
        "value": 6538.759765625
      },
      {
        "date": "2025-11-21",
        "value": 6602.990234375
      },
      {
        "date": "2025-11-24",
        "value": 6705.1201171875
      },
      {
        "date": "2025-11-25",
        "value": 6765.8798828125
      },
      {
        "date": "2025-11-26",
        "value": 6812.60986328125
      },
      {
        "date": "2025-11-28",
        "value": 6849.08984375
      },
      {
        "date": "2025-12-01",
        "value": 6812.6298828125
      },
      {
        "date": "2025-12-02",
        "value": 6829.3701171875
      },
      {
        "date": "2025-12-03",
        "value": 6849.72021484375
      },
      {
        "date": "2025-12-04",
        "value": 6857.1201171875
      },
      {
        "date": "2025-12-05",
        "value": 6870.39990234375
      },
      {
        "date": "2025-12-08",
        "value": 6846.509765625
      },
      {
        "date": "2025-12-09",
        "value": 6840.509765625
      },
      {
        "date": "2025-12-10",
        "value": 6886.68017578125
      },
      {
        "date": "2025-12-11",
        "value": 6901.0
      },
      {
        "date": "2025-12-12",
        "value": 6827.41015625
      },
      {
        "date": "2025-12-15",
        "value": 6816.509765625
      },
      {
        "date": "2025-12-16",
        "value": 6800.259765625
      },
      {
        "date": "2025-12-17",
        "value": 6721.43017578125
      },
      {
        "date": "2025-12-18",
        "value": 6774.759765625
      },
      {
        "date": "2025-12-19",
        "value": 6834.5
      },
      {
        "date": "2025-12-22",
        "value": 6878.490234375
      },
      {
        "date": "2025-12-23",
        "value": 6909.7900390625
      },
      {
        "date": "2025-12-24",
        "value": 6932.0498046875
      },
      {
        "date": "2025-12-26",
        "value": 6929.93994140625
      },
      {
        "date": "2025-12-29",
        "value": 6905.740234375
      },
      {
        "date": "2025-12-30",
        "value": 6896.240234375
      },
      {
        "date": "2025-12-31",
        "value": 6845.5
      },
      {
        "date": "2026-01-02",
        "value": 6858.47021484375
      },
      {
        "date": "2026-01-05",
        "value": 6902.0498046875
      },
      {
        "date": "2026-01-06",
        "value": 6944.81982421875
      },
      {
        "date": "2026-01-07",
        "value": 6920.93017578125
      },
      {
        "date": "2026-01-08",
        "value": 6921.4599609375
      },
      {
        "date": "2026-01-09",
        "value": 6966.27978515625
      },
      {
        "date": "2026-01-12",
        "value": 6977.27001953125
      },
      {
        "date": "2026-01-13",
        "value": 6963.740234375
      },
      {
        "date": "2026-01-14",
        "value": 6926.60009765625
      },
      {
        "date": "2026-01-15",
        "value": 6944.47021484375
      },
      {
        "date": "2026-01-16",
        "value": 6940.009765625
      },
      {
        "date": "2026-01-20",
        "value": 6796.85986328125
      },
      {
        "date": "2026-01-21",
        "value": 6875.6201171875
      },
      {
        "date": "2026-01-22",
        "value": 6913.35009765625
      },
      {
        "date": "2026-01-23",
        "value": 6915.60986328125
      },
      {
        "date": "2026-01-26",
        "value": 6950.22998046875
      },
      {
        "date": "2026-01-27",
        "value": 6978.60009765625
      },
      {
        "date": "2026-01-28",
        "value": 6978.02978515625
      },
      {
        "date": "2026-01-29",
        "value": 6969.009765625
      },
      {
        "date": "2026-01-30",
        "value": 6939.02978515625
      },
      {
        "date": "2026-02-02",
        "value": 6976.43994140625
      },
      {
        "date": "2026-02-03",
        "value": 6917.81005859375
      },
      {
        "date": "2026-02-04",
        "value": 6882.72021484375
      },
      {
        "date": "2026-02-05",
        "value": 6798.39990234375
      },
      {
        "date": "2026-02-06",
        "value": 6932.2998046875
      },
      {
        "date": "2026-02-09",
        "value": 6964.81982421875
      },
      {
        "date": "2026-02-10",
        "value": 6941.81005859375
      },
      {
        "date": "2026-02-11",
        "value": 6941.47021484375
      },
      {
        "date": "2026-02-12",
        "value": 6832.759765625
      },
      {
        "date": "2026-02-13",
        "value": 6836.169921875
      },
      {
        "date": "2026-02-17",
        "value": 6843.22021484375
      },
      {
        "date": "2026-02-18",
        "value": 6881.31005859375
      },
      {
        "date": "2026-02-19",
        "value": 6861.89013671875
      },
      {
        "date": "2026-02-20",
        "value": 6909.509765625
      },
      {
        "date": "2026-02-23",
        "value": 6837.75
      },
      {
        "date": "2026-02-24",
        "value": 6890.06982421875
      },
      {
        "date": "2026-02-25",
        "value": 6946.1298828125
      },
      {
        "date": "2026-02-26",
        "value": 6908.85986328125
      },
      {
        "date": "2026-02-27",
        "value": 6878.8798828125
      },
      {
        "date": "2026-03-02",
        "value": 6881.6201171875
      },
      {
        "date": "2026-03-03",
        "value": 6816.6298828125
      },
      {
        "date": "2026-03-04",
        "value": 6869.5
      },
      {
        "date": "2026-03-05",
        "value": 6830.7099609375
      },
      {
        "date": "2026-03-06",
        "value": 6740.02001953125
      },
      {
        "date": "2026-03-09",
        "value": 6795.990234375
      },
      {
        "date": "2026-03-10",
        "value": 6781.47998046875
      },
      {
        "date": "2026-03-11",
        "value": 6775.7998046875
      },
      {
        "date": "2026-03-12",
        "value": 6672.6201171875
      },
      {
        "date": "2026-03-13",
        "value": 6632.18994140625
      },
      {
        "date": "2026-03-16",
        "value": 6699.3798828125
      },
      {
        "date": "2026-03-17",
        "value": 6716.08984375
      },
      {
        "date": "2026-03-18",
        "value": 6624.7001953125
      },
      {
        "date": "2026-03-19",
        "value": 6606.490234375
      },
      {
        "date": "2026-03-20",
        "value": 6506.47998046875
      },
      {
        "date": "2026-03-23",
        "value": 6581.0
      },
      {
        "date": "2026-03-24",
        "value": 6556.3701171875
      },
      {
        "date": "2026-03-25",
        "value": 6591.89990234375
      },
      {
        "date": "2026-03-26",
        "value": 6477.16015625
      },
      {
        "date": "2026-03-27",
        "value": 6368.85009765625
      },
      {
        "date": "2026-03-30",
        "value": 6343.72021484375
      },
      {
        "date": "2026-03-31",
        "value": 6528.52001953125
      },
      {
        "date": "2026-04-01",
        "value": 6575.31982421875
      },
      {
        "date": "2026-04-02",
        "value": 6582.68994140625
      },
      {
        "date": "2026-04-06",
        "value": 6611.830078125
      },
      {
        "date": "2026-04-07",
        "value": 6616.85009765625
      },
      {
        "date": "2026-04-08",
        "value": 6782.81005859375
      },
      {
        "date": "2026-04-09",
        "value": 6824.66015625
      },
      {
        "date": "2026-04-10",
        "value": 6816.89013671875
      },
      {
        "date": "2026-04-13",
        "value": 6886.240234375
      },
      {
        "date": "2026-04-14",
        "value": 6967.3798828125
      },
      {
        "date": "2026-04-15",
        "value": 7022.9501953125
      },
      {
        "date": "2026-04-16",
        "value": 7041.27978515625
      },
      {
        "date": "2026-04-17",
        "value": 7126.06005859375
      },
      {
        "date": "2026-04-20",
        "value": 7109.14013671875
      },
      {
        "date": "2026-04-21",
        "value": 7064.009765625
      },
      {
        "date": "2026-04-22",
        "value": 7137.89990234375
      },
      {
        "date": "2026-04-23",
        "value": 7108.39990234375
      },
      {
        "date": "2026-04-24",
        "value": 7165.080078125
      },
      {
        "date": "2026-04-27",
        "value": 7173.91015625
      },
      {
        "date": "2026-04-28",
        "value": 7138.7998046875
      },
      {
        "date": "2026-04-29",
        "value": 7135.9501953125
      },
      {
        "date": "2026-04-30",
        "value": 7209.009765625
      },
      {
        "date": "2026-05-01",
        "value": 7230.1201171875
      },
      {
        "date": "2026-05-04",
        "value": 7200.75
      },
      {
        "date": "2026-05-05",
        "value": 7259.22021484375
      },
      {
        "date": "2026-05-06",
        "value": 7365.1201171875
      },
      {
        "date": "2026-05-07",
        "value": 7337.10986328125
      },
      {
        "date": "2026-05-08",
        "value": 7398.93017578125
      },
      {
        "date": "2026-05-11",
        "value": 7412.83984375
      },
      {
        "date": "2026-05-12",
        "value": 7400.9599609375
      },
      {
        "date": "2026-05-13",
        "value": 7444.25
      },
      {
        "date": "2026-05-14",
        "value": 7501.240234375
      },
      {
        "date": "2026-05-15",
        "value": 7408.5
      },
      {
        "date": "2026-05-18",
        "value": 7403.0498046875
      },
      {
        "date": "2026-05-19",
        "value": 7353.60986328125
      },
      {
        "date": "2026-05-20",
        "value": 7432.97021484375
      },
      {
        "date": "2026-05-21",
        "value": 7445.72021484375
      },
      {
        "date": "2026-05-22",
        "value": 7473.47021484375
      },
      {
        "date": "2026-05-26",
        "value": 7519.1201171875
      },
      {
        "date": "2026-05-27",
        "value": 7520.35986328125
      },
      {
        "date": "2026-05-28",
        "value": 7563.6298828125
      },
      {
        "date": "2026-05-29",
        "value": 7580.06005859375
      },
      {
        "date": "2026-06-01",
        "value": 7599.9599609375
      },
      {
        "date": "2026-06-02",
        "value": 7609.77978515625
      },
      {
        "date": "2026-06-03",
        "value": 7553.68017578125
      },
      {
        "date": "2026-06-04",
        "value": 7584.31005859375
      },
      {
        "date": "2026-06-05",
        "value": 7383.740234375
      },
      {
        "date": "2026-06-08",
        "value": 7405.72998046875
      },
      {
        "date": "2026-06-09",
        "value": 7386.64990234375
      },
      {
        "date": "2026-06-10",
        "value": 7266.990234375
      },
      {
        "date": "2026-06-11",
        "value": 7394.2998046875
      },
      {
        "date": "2026-06-12",
        "value": 7431.4599609375
      },
      {
        "date": "2026-06-15",
        "value": 7554.2900390625
      },
      {
        "date": "2026-06-16",
        "value": 7511.35009765625
      },
      {
        "date": "2026-06-17",
        "value": 7420.10009765625
      },
      {
        "date": "2026-06-18",
        "value": 7500.580078125
      },
      {
        "date": "2026-06-22",
        "value": 7472.7900390625
      },
      {
        "date": "2026-06-23",
        "value": 7365.4599609375
      },
      {
        "date": "2026-06-24",
        "value": 7358.22021484375
      },
      {
        "date": "2026-06-25",
        "value": 7357.490234375
      },
      {
        "date": "2026-06-26",
        "value": 7354.02001953125
      },
      {
        "date": "2026-06-29",
        "value": 7440.43017578125
      },
      {
        "date": "2026-06-30",
        "value": 7499.35986328125
      },
      {
        "date": "2026-07-01",
        "value": 7483.22998046875
      },
      {
        "date": "2026-07-02",
        "value": 7483.240234375
      },
      {
        "date": "2026-07-06",
        "value": 7537.43017578125
      },
      {
        "date": "2026-07-07",
        "value": 7503.85009765625
      },
      {
        "date": "2026-07-08",
        "value": 7482.7099609375
      },
      {
        "date": "2026-07-09",
        "value": 7543.64013671875
      },
      {
        "date": "2026-07-10",
        "value": 7575.39013671875
      },
      {
        "date": "2026-07-13",
        "value": 7515.33984375
      },
      {
        "date": "2026-07-14",
        "value": 7543.58984375
      }
    ],
    "nasdaq": [
      {
        "date": "2024-12-05",
        "value": 19700.259765625
      },
      {
        "date": "2024-12-06",
        "value": 19859.76953125
      },
      {
        "date": "2024-12-09",
        "value": 19736.689453125
      },
      {
        "date": "2024-12-10",
        "value": 19687.240234375
      },
      {
        "date": "2024-12-11",
        "value": 20034.890625
      },
      {
        "date": "2024-12-12",
        "value": 19902.83984375
      },
      {
        "date": "2024-12-13",
        "value": 19926.720703125
      },
      {
        "date": "2024-12-16",
        "value": 20173.890625
      },
      {
        "date": "2024-12-17",
        "value": 20109.060546875
      },
      {
        "date": "2024-12-18",
        "value": 19392.689453125
      },
      {
        "date": "2024-12-19",
        "value": 19372.76953125
      },
      {
        "date": "2024-12-20",
        "value": 19572.599609375
      },
      {
        "date": "2024-12-23",
        "value": 19764.880859375
      },
      {
        "date": "2024-12-24",
        "value": 20031.130859375
      },
      {
        "date": "2024-12-26",
        "value": 20020.359375
      },
      {
        "date": "2024-12-27",
        "value": 19722.029296875
      },
      {
        "date": "2024-12-30",
        "value": 19486.7890625
      },
      {
        "date": "2024-12-31",
        "value": 19310.7890625
      },
      {
        "date": "2025-01-02",
        "value": 19280.7890625
      },
      {
        "date": "2025-01-03",
        "value": 19621.6796875
      },
      {
        "date": "2025-01-06",
        "value": 19864.98046875
      },
      {
        "date": "2025-01-07",
        "value": 19489.6796875
      },
      {
        "date": "2025-01-08",
        "value": 19478.880859375
      },
      {
        "date": "2025-01-10",
        "value": 19161.630859375
      },
      {
        "date": "2025-01-13",
        "value": 19088.099609375
      },
      {
        "date": "2025-01-14",
        "value": 19044.390625
      },
      {
        "date": "2025-01-15",
        "value": 19511.23046875
      },
      {
        "date": "2025-01-16",
        "value": 19338.2890625
      },
      {
        "date": "2025-01-17",
        "value": 19630.19921875
      },
      {
        "date": "2025-01-21",
        "value": 19756.779296875
      },
      {
        "date": "2025-01-22",
        "value": 20009.33984375
      },
      {
        "date": "2025-01-23",
        "value": 20053.6796875
      },
      {
        "date": "2025-01-24",
        "value": 19954.30078125
      },
      {
        "date": "2025-01-27",
        "value": 19341.830078125
      },
      {
        "date": "2025-01-28",
        "value": 19733.58984375
      },
      {
        "date": "2025-01-29",
        "value": 19632.3203125
      },
      {
        "date": "2025-01-30",
        "value": 19681.75
      },
      {
        "date": "2025-01-31",
        "value": 19627.439453125
      },
      {
        "date": "2025-02-03",
        "value": 19391.9609375
      },
      {
        "date": "2025-02-04",
        "value": 19654.01953125
      },
      {
        "date": "2025-02-05",
        "value": 19692.330078125
      },
      {
        "date": "2025-02-06",
        "value": 19791.990234375
      },
      {
        "date": "2025-02-07",
        "value": 19523.400390625
      },
      {
        "date": "2025-02-10",
        "value": 19714.26953125
      },
      {
        "date": "2025-02-11",
        "value": 19643.859375
      },
      {
        "date": "2025-02-12",
        "value": 19649.94921875
      },
      {
        "date": "2025-02-13",
        "value": 19945.640625
      },
      {
        "date": "2025-02-14",
        "value": 20026.76953125
      },
      {
        "date": "2025-02-18",
        "value": 20041.259765625
      },
      {
        "date": "2025-02-19",
        "value": 20056.25
      },
      {
        "date": "2025-02-20",
        "value": 19962.359375
      },
      {
        "date": "2025-02-21",
        "value": 19524.009765625
      },
      {
        "date": "2025-02-24",
        "value": 19286.9296875
      },
      {
        "date": "2025-02-25",
        "value": 19026.390625
      },
      {
        "date": "2025-02-26",
        "value": 19075.259765625
      },
      {
        "date": "2025-02-27",
        "value": 18544.419921875
      },
      {
        "date": "2025-02-28",
        "value": 18847.279296875
      },
      {
        "date": "2025-03-03",
        "value": 18350.189453125
      },
      {
        "date": "2025-03-04",
        "value": 18285.16015625
      },
      {
        "date": "2025-03-05",
        "value": 18552.73046875
      },
      {
        "date": "2025-03-06",
        "value": 18069.259765625
      },
      {
        "date": "2025-03-07",
        "value": 18196.220703125
      },
      {
        "date": "2025-03-10",
        "value": 17468.3203125
      },
      {
        "date": "2025-03-11",
        "value": 17436.099609375
      },
      {
        "date": "2025-03-12",
        "value": 17648.44921875
      },
      {
        "date": "2025-03-13",
        "value": 17303.009765625
      },
      {
        "date": "2025-03-14",
        "value": 17754.08984375
      },
      {
        "date": "2025-03-17",
        "value": 17808.66015625
      },
      {
        "date": "2025-03-18",
        "value": 17504.119140625
      },
      {
        "date": "2025-03-19",
        "value": 17750.7890625
      },
      {
        "date": "2025-03-20",
        "value": 17691.630859375
      },
      {
        "date": "2025-03-21",
        "value": 17784.05078125
      },
      {
        "date": "2025-03-24",
        "value": 18188.58984375
      },
      {
        "date": "2025-03-25",
        "value": 18271.859375
      },
      {
        "date": "2025-03-26",
        "value": 17899.01953125
      },
      {
        "date": "2025-03-27",
        "value": 17804.029296875
      },
      {
        "date": "2025-03-28",
        "value": 17322.990234375
      },
      {
        "date": "2025-03-31",
        "value": 17299.2890625
      },
      {
        "date": "2025-04-01",
        "value": 17449.890625
      },
      {
        "date": "2025-04-02",
        "value": 17601.05078125
      },
      {
        "date": "2025-04-03",
        "value": 16550.609375
      },
      {
        "date": "2025-04-04",
        "value": 15587.7900390625
      },
      {
        "date": "2025-04-07",
        "value": 15603.259765625
      },
      {
        "date": "2025-04-08",
        "value": 15267.91015625
      },
      {
        "date": "2025-04-09",
        "value": 17124.970703125
      },
      {
        "date": "2025-04-10",
        "value": 16387.310546875
      },
      {
        "date": "2025-04-11",
        "value": 16724.4609375
      },
      {
        "date": "2025-04-14",
        "value": 16831.48046875
      },
      {
        "date": "2025-04-15",
        "value": 16823.169921875
      },
      {
        "date": "2025-04-16",
        "value": 16307.16015625
      },
      {
        "date": "2025-04-17",
        "value": 16286.4501953125
      },
      {
        "date": "2025-04-21",
        "value": 15870.900390625
      },
      {
        "date": "2025-04-22",
        "value": 16300.419921875
      },
      {
        "date": "2025-04-23",
        "value": 16708.05078125
      },
      {
        "date": "2025-04-24",
        "value": 17166.0390625
      },
      {
        "date": "2025-04-25",
        "value": 17382.939453125
      },
      {
        "date": "2025-04-28",
        "value": 17366.130859375
      },
      {
        "date": "2025-04-29",
        "value": 17461.3203125
      },
      {
        "date": "2025-04-30",
        "value": 17446.33984375
      },
      {
        "date": "2025-05-01",
        "value": 17710.740234375
      },
      {
        "date": "2025-05-02",
        "value": 17977.73046875
      },
      {
        "date": "2025-05-05",
        "value": 17844.240234375
      },
      {
        "date": "2025-05-06",
        "value": 17689.66015625
      },
      {
        "date": "2025-05-07",
        "value": 17738.16015625
      },
      {
        "date": "2025-05-08",
        "value": 17928.140625
      },
      {
        "date": "2025-05-09",
        "value": 17928.919921875
      },
      {
        "date": "2025-05-12",
        "value": 18708.33984375
      },
      {
        "date": "2025-05-13",
        "value": 19010.08984375
      },
      {
        "date": "2025-05-14",
        "value": 19146.810546875
      },
      {
        "date": "2025-05-15",
        "value": 19112.3203125
      },
      {
        "date": "2025-05-16",
        "value": 19211.099609375
      },
      {
        "date": "2025-05-19",
        "value": 19215.4609375
      },
      {
        "date": "2025-05-20",
        "value": 19142.7109375
      },
      {
        "date": "2025-05-21",
        "value": 18872.640625
      },
      {
        "date": "2025-05-22",
        "value": 18925.740234375
      },
      {
        "date": "2025-05-23",
        "value": 18737.2109375
      },
      {
        "date": "2025-05-27",
        "value": 19199.16015625
      },
      {
        "date": "2025-05-28",
        "value": 19100.939453125
      },
      {
        "date": "2025-05-29",
        "value": 19175.869140625
      },
      {
        "date": "2025-05-30",
        "value": 19113.76953125
      },
      {
        "date": "2025-06-02",
        "value": 19242.609375
      },
      {
        "date": "2025-06-03",
        "value": 19398.9609375
      },
      {
        "date": "2025-06-04",
        "value": 19460.490234375
      },
      {
        "date": "2025-06-05",
        "value": 19298.44921875
      },
      {
        "date": "2025-06-06",
        "value": 19529.94921875
      },
      {
        "date": "2025-06-09",
        "value": 19591.240234375
      },
      {
        "date": "2025-06-10",
        "value": 19714.990234375
      },
      {
        "date": "2025-06-11",
        "value": 19615.880859375
      },
      {
        "date": "2025-06-12",
        "value": 19662.490234375
      },
      {
        "date": "2025-06-13",
        "value": 19406.830078125
      },
      {
        "date": "2025-06-16",
        "value": 19701.2109375
      },
      {
        "date": "2025-06-17",
        "value": 19521.08984375
      },
      {
        "date": "2025-06-18",
        "value": 19546.26953125
      },
      {
        "date": "2025-06-20",
        "value": 19447.41015625
      },
      {
        "date": "2025-06-23",
        "value": 19630.970703125
      },
      {
        "date": "2025-06-24",
        "value": 19912.529296875
      },
      {
        "date": "2025-06-25",
        "value": 19973.55078125
      },
      {
        "date": "2025-06-26",
        "value": 20167.91015625
      },
      {
        "date": "2025-06-27",
        "value": 20273.4609375
      },
      {
        "date": "2025-06-30",
        "value": 20369.73046875
      },
      {
        "date": "2025-07-01",
        "value": 20202.890625
      },
      {
        "date": "2025-07-02",
        "value": 20393.130859375
      },
      {
        "date": "2025-07-03",
        "value": 20601.099609375
      },
      {
        "date": "2025-07-07",
        "value": 20412.51953125
      },
      {
        "date": "2025-07-08",
        "value": 20418.4609375
      },
      {
        "date": "2025-07-09",
        "value": 20611.33984375
      },
      {
        "date": "2025-07-10",
        "value": 20630.66015625
      },
      {
        "date": "2025-07-11",
        "value": 20585.529296875
      },
      {
        "date": "2025-07-14",
        "value": 20640.330078125
      },
      {
        "date": "2025-07-15",
        "value": 20677.80078125
      },
      {
        "date": "2025-07-16",
        "value": 20730.490234375
      },
      {
        "date": "2025-07-17",
        "value": 20885.650390625
      },
      {
        "date": "2025-07-18",
        "value": 20895.650390625
      },
      {
        "date": "2025-07-21",
        "value": 20974.1796875
      },
      {
        "date": "2025-07-22",
        "value": 20892.689453125
      },
      {
        "date": "2025-07-23",
        "value": 21020.01953125
      },
      {
        "date": "2025-07-24",
        "value": 21057.9609375
      },
      {
        "date": "2025-07-25",
        "value": 21108.3203125
      },
      {
        "date": "2025-07-28",
        "value": 21178.580078125
      },
      {
        "date": "2025-07-29",
        "value": 21098.2890625
      },
      {
        "date": "2025-07-30",
        "value": 21129.669921875
      },
      {
        "date": "2025-07-31",
        "value": 21122.44921875
      },
      {
        "date": "2025-08-01",
        "value": 20650.130859375
      },
      {
        "date": "2025-08-04",
        "value": 21053.580078125
      },
      {
        "date": "2025-08-05",
        "value": 20916.55078125
      },
      {
        "date": "2025-08-06",
        "value": 21169.419921875
      },
      {
        "date": "2025-08-07",
        "value": 21242.69921875
      },
      {
        "date": "2025-08-08",
        "value": 21450.01953125
      },
      {
        "date": "2025-08-11",
        "value": 21385.400390625
      },
      {
        "date": "2025-08-12",
        "value": 21681.900390625
      },
      {
        "date": "2025-08-13",
        "value": 21713.140625
      },
      {
        "date": "2025-08-14",
        "value": 21710.669921875
      },
      {
        "date": "2025-08-15",
        "value": 21622.98046875
      },
      {
        "date": "2025-08-18",
        "value": 21629.76953125
      },
      {
        "date": "2025-08-19",
        "value": 21314.94921875
      },
      {
        "date": "2025-08-20",
        "value": 21172.859375
      },
      {
        "date": "2025-08-21",
        "value": 21100.310546875
      },
      {
        "date": "2025-08-22",
        "value": 21496.5390625
      },
      {
        "date": "2025-08-25",
        "value": 21449.2890625
      },
      {
        "date": "2025-08-26",
        "value": 21544.26953125
      },
      {
        "date": "2025-08-27",
        "value": 21590.140625
      },
      {
        "date": "2025-08-28",
        "value": 21705.16015625
      },
      {
        "date": "2025-08-29",
        "value": 21455.55078125
      },
      {
        "date": "2025-09-02",
        "value": 21279.630859375
      },
      {
        "date": "2025-09-03",
        "value": 21497.73046875
      },
      {
        "date": "2025-09-04",
        "value": 21707.689453125
      },
      {
        "date": "2025-09-05",
        "value": 21700.390625
      },
      {
        "date": "2025-09-08",
        "value": 21798.69921875
      },
      {
        "date": "2025-09-09",
        "value": 21879.490234375
      },
      {
        "date": "2025-09-10",
        "value": 21886.060546875
      },
      {
        "date": "2025-09-11",
        "value": 22043.0703125
      },
      {
        "date": "2025-09-12",
        "value": 22141.099609375
      },
      {
        "date": "2025-09-15",
        "value": 22348.75
      },
      {
        "date": "2025-09-16",
        "value": 22333.9609375
      },
      {
        "date": "2025-09-17",
        "value": 22261.330078125
      },
      {
        "date": "2025-09-18",
        "value": 22470.720703125
      },
      {
        "date": "2025-09-19",
        "value": 22631.48046875
      },
      {
        "date": "2025-09-22",
        "value": 22788.98046875
      },
      {
        "date": "2025-09-23",
        "value": 22573.470703125
      },
      {
        "date": "2025-09-24",
        "value": 22497.859375
      },
      {
        "date": "2025-09-25",
        "value": 22384.69921875
      },
      {
        "date": "2025-09-26",
        "value": 22484.0703125
      },
      {
        "date": "2025-09-29",
        "value": 22591.150390625
      },
      {
        "date": "2025-09-30",
        "value": 22660.009765625
      },
      {
        "date": "2025-10-01",
        "value": 22755.16015625
      },
      {
        "date": "2025-10-02",
        "value": 22844.05078125
      },
      {
        "date": "2025-10-03",
        "value": 22780.509765625
      },
      {
        "date": "2025-10-06",
        "value": 22941.669921875
      },
      {
        "date": "2025-10-07",
        "value": 22788.359375
      },
      {
        "date": "2025-10-08",
        "value": 23043.380859375
      },
      {
        "date": "2025-10-09",
        "value": 23024.630859375
      },
      {
        "date": "2025-10-10",
        "value": 22204.4296875
      },
      {
        "date": "2025-10-13",
        "value": 22694.609375
      },
      {
        "date": "2025-10-14",
        "value": 22521.69921875
      },
      {
        "date": "2025-10-15",
        "value": 22670.080078125
      },
      {
        "date": "2025-10-16",
        "value": 22562.5390625
      },
      {
        "date": "2025-10-17",
        "value": 22679.970703125
      },
      {
        "date": "2025-10-20",
        "value": 22990.5390625
      },
      {
        "date": "2025-10-21",
        "value": 22953.669921875
      },
      {
        "date": "2025-10-22",
        "value": 22740.400390625
      },
      {
        "date": "2025-10-23",
        "value": 22941.80078125
      },
      {
        "date": "2025-10-24",
        "value": 23204.869140625
      },
      {
        "date": "2025-10-27",
        "value": 23637.4609375
      },
      {
        "date": "2025-10-28",
        "value": 23827.490234375
      },
      {
        "date": "2025-10-29",
        "value": 23958.470703125
      },
      {
        "date": "2025-10-30",
        "value": 23581.140625
      },
      {
        "date": "2025-10-31",
        "value": 23724.9609375
      },
      {
        "date": "2025-11-03",
        "value": 23834.720703125
      },
      {
        "date": "2025-11-04",
        "value": 23348.640625
      },
      {
        "date": "2025-11-05",
        "value": 23499.80078125
      },
      {
        "date": "2025-11-06",
        "value": 23053.990234375
      },
      {
        "date": "2025-11-07",
        "value": 23004.5390625
      },
      {
        "date": "2025-11-10",
        "value": 23527.169921875
      },
      {
        "date": "2025-11-11",
        "value": 23468.30078125
      },
      {
        "date": "2025-11-12",
        "value": 23406.4609375
      },
      {
        "date": "2025-11-13",
        "value": 22870.359375
      },
      {
        "date": "2025-11-14",
        "value": 22900.58984375
      },
      {
        "date": "2025-11-17",
        "value": 22708.0703125
      },
      {
        "date": "2025-11-18",
        "value": 22432.849609375
      },
      {
        "date": "2025-11-19",
        "value": 22564.23046875
      },
      {
        "date": "2025-11-20",
        "value": 22078.05078125
      },
      {
        "date": "2025-11-21",
        "value": 22273.080078125
      },
      {
        "date": "2025-11-24",
        "value": 22872.009765625
      },
      {
        "date": "2025-11-25",
        "value": 23025.58984375
      },
      {
        "date": "2025-11-26",
        "value": 23214.689453125
      },
      {
        "date": "2025-11-28",
        "value": 23365.689453125
      },
      {
        "date": "2025-12-01",
        "value": 23275.919921875
      },
      {
        "date": "2025-12-02",
        "value": 23413.669921875
      },
      {
        "date": "2025-12-03",
        "value": 23454.08984375
      },
      {
        "date": "2025-12-04",
        "value": 23505.140625
      },
      {
        "date": "2025-12-05",
        "value": 23578.130859375
      },
      {
        "date": "2025-12-08",
        "value": 23545.900390625
      },
      {
        "date": "2025-12-09",
        "value": 23576.490234375
      },
      {
        "date": "2025-12-10",
        "value": 23654.150390625
      },
      {
        "date": "2025-12-11",
        "value": 23593.859375
      },
      {
        "date": "2025-12-12",
        "value": 23195.169921875
      },
      {
        "date": "2025-12-15",
        "value": 23057.41015625
      },
      {
        "date": "2025-12-16",
        "value": 23111.4609375
      },
      {
        "date": "2025-12-17",
        "value": 22693.3203125
      },
      {
        "date": "2025-12-18",
        "value": 23006.359375
      },
      {
        "date": "2025-12-19",
        "value": 23307.619140625
      },
      {
        "date": "2025-12-22",
        "value": 23428.830078125
      },
      {
        "date": "2025-12-23",
        "value": 23561.83984375
      },
      {
        "date": "2025-12-24",
        "value": 23613.310546875
      },
      {
        "date": "2025-12-26",
        "value": 23593.099609375
      },
      {
        "date": "2025-12-29",
        "value": 23474.349609375
      },
      {
        "date": "2025-12-30",
        "value": 23419.080078125
      },
      {
        "date": "2025-12-31",
        "value": 23241.990234375
      },
      {
        "date": "2026-01-02",
        "value": 23235.630859375
      },
      {
        "date": "2026-01-05",
        "value": 23395.8203125
      },
      {
        "date": "2026-01-06",
        "value": 23547.169921875
      },
      {
        "date": "2026-01-07",
        "value": 23584.279296875
      },
      {
        "date": "2026-01-08",
        "value": 23480.01953125
      },
      {
        "date": "2026-01-09",
        "value": 23671.349609375
      },
      {
        "date": "2026-01-12",
        "value": 23733.900390625
      },
      {
        "date": "2026-01-13",
        "value": 23709.869140625
      },
      {
        "date": "2026-01-14",
        "value": 23471.75
      },
      {
        "date": "2026-01-15",
        "value": 23530.01953125
      },
      {
        "date": "2026-01-16",
        "value": 23515.390625
      },
      {
        "date": "2026-01-20",
        "value": 22954.3203125
      },
      {
        "date": "2026-01-21",
        "value": 23224.8203125
      },
      {
        "date": "2026-01-22",
        "value": 23436.01953125
      },
      {
        "date": "2026-01-23",
        "value": 23501.240234375
      },
      {
        "date": "2026-01-26",
        "value": 23601.359375
      },
      {
        "date": "2026-01-27",
        "value": 23817.099609375
      },
      {
        "date": "2026-01-28",
        "value": 23857.44921875
      },
      {
        "date": "2026-01-29",
        "value": 23685.119140625
      },
      {
        "date": "2026-01-30",
        "value": 23461.8203125
      },
      {
        "date": "2026-02-02",
        "value": 23592.109375
      },
      {
        "date": "2026-02-03",
        "value": 23255.189453125
      },
      {
        "date": "2026-02-04",
        "value": 22904.580078125
      },
      {
        "date": "2026-02-05",
        "value": 22540.58984375
      },
      {
        "date": "2026-02-06",
        "value": 23031.2109375
      },
      {
        "date": "2026-02-09",
        "value": 23238.669921875
      },
      {
        "date": "2026-02-10",
        "value": 23102.470703125
      },
      {
        "date": "2026-02-11",
        "value": 23066.470703125
      },
      {
        "date": "2026-02-12",
        "value": 22597.150390625
      },
      {
        "date": "2026-02-13",
        "value": 22546.669921875
      },
      {
        "date": "2026-02-17",
        "value": 22578.380859375
      },
      {
        "date": "2026-02-18",
        "value": 22753.630859375
      },
      {
        "date": "2026-02-19",
        "value": 22682.73046875
      },
      {
        "date": "2026-02-20",
        "value": 22886.0703125
      },
      {
        "date": "2026-02-23",
        "value": 22627.26953125
      },
      {
        "date": "2026-02-24",
        "value": 22863.6796875
      },
      {
        "date": "2026-02-25",
        "value": 23152.080078125
      },
      {
        "date": "2026-02-26",
        "value": 22878.380859375
      },
      {
        "date": "2026-02-27",
        "value": 22668.2109375
      },
      {
        "date": "2026-03-02",
        "value": 22748.859375
      },
      {
        "date": "2026-03-03",
        "value": 22516.689453125
      },
      {
        "date": "2026-03-04",
        "value": 22807.48046875
      },
      {
        "date": "2026-03-05",
        "value": 22748.990234375
      },
      {
        "date": "2026-03-06",
        "value": 22387.6796875
      },
      {
        "date": "2026-03-09",
        "value": 22695.94921875
      },
      {
        "date": "2026-03-10",
        "value": 22697.099609375
      },
      {
        "date": "2026-03-11",
        "value": 22716.130859375
      },
      {
        "date": "2026-03-12",
        "value": 22311.98046875
      },
      {
        "date": "2026-03-13",
        "value": 22105.359375
      },
      {
        "date": "2026-03-16",
        "value": 22374.1796875
      },
      {
        "date": "2026-03-17",
        "value": 22479.529296875
      },
      {
        "date": "2026-03-18",
        "value": 22152.419921875
      },
      {
        "date": "2026-03-19",
        "value": 22090.689453125
      },
      {
        "date": "2026-03-20",
        "value": 21647.609375
      },
      {
        "date": "2026-03-23",
        "value": 21946.759765625
      },
      {
        "date": "2026-03-24",
        "value": 21761.890625
      },
      {
        "date": "2026-03-25",
        "value": 21929.8203125
      },
      {
        "date": "2026-03-26",
        "value": 21408.080078125
      },
      {
        "date": "2026-03-27",
        "value": 20948.359375
      },
      {
        "date": "2026-03-30",
        "value": 20794.640625
      },
      {
        "date": "2026-03-31",
        "value": 21590.630859375
      },
      {
        "date": "2026-04-01",
        "value": 21840.94921875
      },
      {
        "date": "2026-04-02",
        "value": 21879.1796875
      },
      {
        "date": "2026-04-06",
        "value": 21996.33984375
      },
      {
        "date": "2026-04-07",
        "value": 22017.849609375
      },
      {
        "date": "2026-04-08",
        "value": 22634.990234375
      },
      {
        "date": "2026-04-09",
        "value": 22822.419921875
      },
      {
        "date": "2026-04-10",
        "value": 22902.890625
      },
      {
        "date": "2026-04-13",
        "value": 23183.740234375
      },
      {
        "date": "2026-04-14",
        "value": 23639.080078125
      },
      {
        "date": "2026-04-15",
        "value": 24016.01953125
      },
      {
        "date": "2026-04-16",
        "value": 24102.69921875
      },
      {
        "date": "2026-04-17",
        "value": 24468.48046875
      },
      {
        "date": "2026-04-20",
        "value": 24404.390625
      },
      {
        "date": "2026-04-21",
        "value": 24259.9609375
      },
      {
        "date": "2026-04-22",
        "value": 24657.5703125
      },
      {
        "date": "2026-04-23",
        "value": 24438.5
      },
      {
        "date": "2026-04-24",
        "value": 24836.599609375
      },
      {
        "date": "2026-04-27",
        "value": 24887.099609375
      },
      {
        "date": "2026-04-28",
        "value": 24663.80078125
      },
      {
        "date": "2026-04-29",
        "value": 24673.240234375
      },
      {
        "date": "2026-04-30",
        "value": 24892.310546875
      },
      {
        "date": "2026-05-01",
        "value": 25114.439453125
      },
      {
        "date": "2026-05-04",
        "value": 25067.80078125
      },
      {
        "date": "2026-05-05",
        "value": 25326.130859375
      },
      {
        "date": "2026-05-06",
        "value": 25838.939453125
      },
      {
        "date": "2026-05-07",
        "value": 25806.19921875
      },
      {
        "date": "2026-05-08",
        "value": 26247.080078125
      },
      {
        "date": "2026-05-11",
        "value": 26274.130859375
      },
      {
        "date": "2026-05-12",
        "value": 26088.19921875
      },
      {
        "date": "2026-05-13",
        "value": 26402.33984375
      },
      {
        "date": "2026-05-14",
        "value": 26635.220703125
      },
      {
        "date": "2026-05-15",
        "value": 26225.140625
      },
      {
        "date": "2026-05-18",
        "value": 26090.73046875
      },
      {
        "date": "2026-05-19",
        "value": 25870.7109375
      },
      {
        "date": "2026-05-20",
        "value": 26270.359375
      },
      {
        "date": "2026-05-21",
        "value": 26293.099609375
      },
      {
        "date": "2026-05-22",
        "value": 26343.970703125
      },
      {
        "date": "2026-05-26",
        "value": 26656.1796875
      },
      {
        "date": "2026-05-27",
        "value": 26674.73046875
      },
      {
        "date": "2026-05-28",
        "value": 26917.470703125
      },
      {
        "date": "2026-05-29",
        "value": 26972.619140625
      },
      {
        "date": "2026-06-01",
        "value": 27086.810546875
      },
      {
        "date": "2026-06-02",
        "value": 27093.900390625
      },
      {
        "date": "2026-06-03",
        "value": 26853.98046875
      },
      {
        "date": "2026-06-04",
        "value": 26830.9609375
      },
      {
        "date": "2026-06-05",
        "value": 25709.4296875
      },
      {
        "date": "2026-06-08",
        "value": 25929.66015625
      },
      {
        "date": "2026-06-09",
        "value": 25678.8203125
      },
      {
        "date": "2026-06-10",
        "value": 25169.5
      },
      {
        "date": "2026-06-11",
        "value": 25809.66015625
      },
      {
        "date": "2026-06-12",
        "value": 25888.83984375
      },
      {
        "date": "2026-06-15",
        "value": 26683.939453125
      },
      {
        "date": "2026-06-16",
        "value": 26376.33984375
      },
      {
        "date": "2026-06-17",
        "value": 26021.66015625
      },
      {
        "date": "2026-06-18",
        "value": 26517.9296875
      },
      {
        "date": "2026-06-22",
        "value": 26166.599609375
      },
      {
        "date": "2026-06-23",
        "value": 25587.0390625
      },
      {
        "date": "2026-06-24",
        "value": 25476.640625
      },
      {
        "date": "2026-06-25",
        "value": 25358.599609375
      },
      {
        "date": "2026-06-26",
        "value": 25297.619140625
      },
      {
        "date": "2026-06-29",
        "value": 25820.140625
      },
      {
        "date": "2026-06-30",
        "value": 26213.720703125
      },
      {
        "date": "2026-07-01",
        "value": 26040.029296875
      },
      {
        "date": "2026-07-02",
        "value": 25832.669921875
      },
      {
        "date": "2026-07-06",
        "value": 26121.16015625
      },
      {
        "date": "2026-07-07",
        "value": 25818.689453125
      },
      {
        "date": "2026-07-08",
        "value": 25870.650390625
      },
      {
        "date": "2026-07-09",
        "value": 26206.890625
      },
      {
        "date": "2026-07-10",
        "value": 26281.609375
      },
      {
        "date": "2026-07-13",
        "value": 25873.1796875
      },
      {
        "date": "2026-07-14",
        "value": 26107.0078125
      }
    ],
    "vix": [
      {
        "date": "2024-12-06",
        "value": 12.770000457763672
      },
      {
        "date": "2024-12-09",
        "value": 14.1899995803833
      },
      {
        "date": "2024-12-10",
        "value": 14.180000305175781
      },
      {
        "date": "2024-12-11",
        "value": 13.579999923706055
      },
      {
        "date": "2024-12-12",
        "value": 13.920000076293945
      },
      {
        "date": "2024-12-13",
        "value": 13.8100004196167
      },
      {
        "date": "2024-12-16",
        "value": 14.6899995803833
      },
      {
        "date": "2024-12-17",
        "value": 15.869999885559082
      },
      {
        "date": "2024-12-18",
        "value": 27.6200008392334
      },
      {
        "date": "2024-12-19",
        "value": 24.09000015258789
      },
      {
        "date": "2024-12-20",
        "value": 18.360000610351562
      },
      {
        "date": "2024-12-23",
        "value": 16.780000686645508
      },
      {
        "date": "2024-12-24",
        "value": 14.270000457763672
      },
      {
        "date": "2024-12-26",
        "value": 14.729999542236328
      },
      {
        "date": "2024-12-27",
        "value": 15.949999809265137
      },
      {
        "date": "2024-12-30",
        "value": 17.399999618530273
      },
      {
        "date": "2024-12-31",
        "value": 17.350000381469727
      },
      {
        "date": "2025-01-02",
        "value": 17.93000030517578
      },
      {
        "date": "2025-01-03",
        "value": 16.1299991607666
      },
      {
        "date": "2025-01-06",
        "value": 16.040000915527344
      },
      {
        "date": "2025-01-07",
        "value": 17.81999969482422
      },
      {
        "date": "2025-01-08",
        "value": 17.700000762939453
      },
      {
        "date": "2025-01-10",
        "value": 19.540000915527344
      },
      {
        "date": "2025-01-13",
        "value": 19.190000534057617
      },
      {
        "date": "2025-01-14",
        "value": 18.709999084472656
      },
      {
        "date": "2025-01-15",
        "value": 16.1200008392334
      },
      {
        "date": "2025-01-16",
        "value": 16.600000381469727
      },
      {
        "date": "2025-01-17",
        "value": 15.970000267028809
      },
      {
        "date": "2025-01-21",
        "value": 15.0600004196167
      },
      {
        "date": "2025-01-22",
        "value": 15.100000381469727
      },
      {
        "date": "2025-01-23",
        "value": 15.020000457763672
      },
      {
        "date": "2025-01-24",
        "value": 14.850000381469727
      },
      {
        "date": "2025-01-27",
        "value": 17.899999618530273
      },
      {
        "date": "2025-01-28",
        "value": 16.40999984741211
      },
      {
        "date": "2025-01-29",
        "value": 16.559999465942383
      },
      {
        "date": "2025-01-30",
        "value": 15.84000015258789
      },
      {
        "date": "2025-01-31",
        "value": 16.43000030517578
      },
      {
        "date": "2025-02-03",
        "value": 18.6200008392334
      },
      {
        "date": "2025-02-04",
        "value": 17.209999084472656
      },
      {
        "date": "2025-02-05",
        "value": 15.770000457763672
      },
      {
        "date": "2025-02-06",
        "value": 15.5
      },
      {
        "date": "2025-02-07",
        "value": 16.540000915527344
      },
      {
        "date": "2025-02-10",
        "value": 15.8100004196167
      },
      {
        "date": "2025-02-11",
        "value": 16.020000457763672
      },
      {
        "date": "2025-02-12",
        "value": 15.890000343322754
      },
      {
        "date": "2025-02-13",
        "value": 15.100000381469727
      },
      {
        "date": "2025-02-14",
        "value": 14.770000457763672
      },
      {
        "date": "2025-02-18",
        "value": 15.350000381469727
      },
      {
        "date": "2025-02-19",
        "value": 15.270000457763672
      },
      {
        "date": "2025-02-20",
        "value": 15.65999984741211
      },
      {
        "date": "2025-02-21",
        "value": 18.209999084472656
      },
      {
        "date": "2025-02-24",
        "value": 18.979999542236328
      },
      {
        "date": "2025-02-25",
        "value": 19.43000030517578
      },
      {
        "date": "2025-02-26",
        "value": 19.100000381469727
      },
      {
        "date": "2025-02-27",
        "value": 21.1299991607666
      },
      {
        "date": "2025-02-28",
        "value": 19.6299991607666
      },
      {
        "date": "2025-03-03",
        "value": 22.780000686645508
      },
      {
        "date": "2025-03-04",
        "value": 23.510000228881836
      },
      {
        "date": "2025-03-05",
        "value": 21.93000030517578
      },
      {
        "date": "2025-03-06",
        "value": 24.8700008392334
      },
      {
        "date": "2025-03-07",
        "value": 23.3700008392334
      },
      {
        "date": "2025-03-10",
        "value": 27.860000610351562
      },
      {
        "date": "2025-03-11",
        "value": 26.920000076293945
      },
      {
        "date": "2025-03-12",
        "value": 24.229999542236328
      },
      {
        "date": "2025-03-13",
        "value": 24.65999984741211
      },
      {
        "date": "2025-03-14",
        "value": 21.770000457763672
      },
      {
        "date": "2025-03-17",
        "value": 20.510000228881836
      },
      {
        "date": "2025-03-18",
        "value": 21.700000762939453
      },
      {
        "date": "2025-03-19",
        "value": 19.899999618530273
      },
      {
        "date": "2025-03-20",
        "value": 19.799999237060547
      },
      {
        "date": "2025-03-21",
        "value": 19.280000686645508
      },
      {
        "date": "2025-03-24",
        "value": 17.479999542236328
      },
      {
        "date": "2025-03-25",
        "value": 17.149999618530273
      },
      {
        "date": "2025-03-26",
        "value": 18.329999923706055
      },
      {
        "date": "2025-03-27",
        "value": 18.690000534057617
      },
      {
        "date": "2025-03-28",
        "value": 21.649999618530273
      },
      {
        "date": "2025-03-31",
        "value": 22.280000686645508
      },
      {
        "date": "2025-04-01",
        "value": 21.770000457763672
      },
      {
        "date": "2025-04-02",
        "value": 21.510000228881836
      },
      {
        "date": "2025-04-03",
        "value": 30.020000457763672
      },
      {
        "date": "2025-04-04",
        "value": 45.310001373291016
      },
      {
        "date": "2025-04-07",
        "value": 46.97999954223633
      },
      {
        "date": "2025-04-08",
        "value": 52.33000183105469
      },
      {
        "date": "2025-04-09",
        "value": 33.619998931884766
      },
      {
        "date": "2025-04-10",
        "value": 40.720001220703125
      },
      {
        "date": "2025-04-11",
        "value": 37.560001373291016
      },
      {
        "date": "2025-04-14",
        "value": 30.889999389648438
      },
      {
        "date": "2025-04-15",
        "value": 30.1200008392334
      },
      {
        "date": "2025-04-16",
        "value": 32.63999938964844
      },
      {
        "date": "2025-04-17",
        "value": 29.649999618530273
      },
      {
        "date": "2025-04-21",
        "value": 33.81999969482422
      },
      {
        "date": "2025-04-22",
        "value": 30.56999969482422
      },
      {
        "date": "2025-04-23",
        "value": 28.450000762939453
      },
      {
        "date": "2025-04-24",
        "value": 26.469999313354492
      },
      {
        "date": "2025-04-25",
        "value": 24.84000015258789
      },
      {
        "date": "2025-04-28",
        "value": 25.149999618530273
      },
      {
        "date": "2025-04-29",
        "value": 24.170000076293945
      },
      {
        "date": "2025-04-30",
        "value": 24.700000762939453
      },
      {
        "date": "2025-05-01",
        "value": 24.600000381469727
      },
      {
        "date": "2025-05-02",
        "value": 22.68000030517578
      },
      {
        "date": "2025-05-05",
        "value": 23.639999389648438
      },
      {
        "date": "2025-05-06",
        "value": 24.760000228881836
      },
      {
        "date": "2025-05-07",
        "value": 23.549999237060547
      },
      {
        "date": "2025-05-08",
        "value": 22.479999542236328
      },
      {
        "date": "2025-05-09",
        "value": 21.899999618530273
      },
      {
        "date": "2025-05-12",
        "value": 18.389999389648438
      },
      {
        "date": "2025-05-13",
        "value": 18.219999313354492
      },
      {
        "date": "2025-05-14",
        "value": 18.6200008392334
      },
      {
        "date": "2025-05-15",
        "value": 17.829999923706055
      },
      {
        "date": "2025-05-16",
        "value": 17.239999771118164
      },
      {
        "date": "2025-05-19",
        "value": 18.139999389648438
      },
      {
        "date": "2025-05-20",
        "value": 18.09000015258789
      },
      {
        "date": "2025-05-21",
        "value": 20.8700008392334
      },
      {
        "date": "2025-05-22",
        "value": 20.280000686645508
      },
      {
        "date": "2025-05-23",
        "value": 22.290000915527344
      },
      {
        "date": "2025-05-27",
        "value": 18.959999084472656
      },
      {
        "date": "2025-05-28",
        "value": 19.309999465942383
      },
      {
        "date": "2025-05-29",
        "value": 19.18000030517578
      },
      {
        "date": "2025-05-30",
        "value": 18.56999969482422
      },
      {
        "date": "2025-06-02",
        "value": 18.360000610351562
      },
      {
        "date": "2025-06-03",
        "value": 17.690000534057617
      },
      {
        "date": "2025-06-04",
        "value": 17.610000610351562
      },
      {
        "date": "2025-06-05",
        "value": 18.479999542236328
      },
      {
        "date": "2025-06-06",
        "value": 16.770000457763672
      },
      {
        "date": "2025-06-09",
        "value": 17.15999984741211
      },
      {
        "date": "2025-06-10",
        "value": 16.950000762939453
      },
      {
        "date": "2025-06-11",
        "value": 17.260000228881836
      },
      {
        "date": "2025-06-12",
        "value": 18.020000457763672
      },
      {
        "date": "2025-06-13",
        "value": 20.81999969482422
      },
      {
        "date": "2025-06-16",
        "value": 19.110000610351562
      },
      {
        "date": "2025-06-17",
        "value": 21.600000381469727
      },
      {
        "date": "2025-06-18",
        "value": 20.139999389648438
      },
      {
        "date": "2025-06-20",
        "value": 20.6200008392334
      },
      {
        "date": "2025-06-23",
        "value": 19.829999923706055
      },
      {
        "date": "2025-06-24",
        "value": 17.479999542236328
      },
      {
        "date": "2025-06-25",
        "value": 16.760000228881836
      },
      {
        "date": "2025-06-26",
        "value": 16.59000015258789
      },
      {
        "date": "2025-06-27",
        "value": 16.31999969482422
      },
      {
        "date": "2025-06-30",
        "value": 16.729999542236328
      },
      {
        "date": "2025-07-01",
        "value": 16.829999923706055
      },
      {
        "date": "2025-07-02",
        "value": 16.639999389648438
      },
      {
        "date": "2025-07-03",
        "value": 16.3799991607666
      },
      {
        "date": "2025-07-07",
        "value": 17.790000915527344
      },
      {
        "date": "2025-07-08",
        "value": 16.809999465942383
      },
      {
        "date": "2025-07-09",
        "value": 15.9399995803833
      },
      {
        "date": "2025-07-10",
        "value": 15.779999732971191
      },
      {
        "date": "2025-07-11",
        "value": 16.399999618530273
      },
      {
        "date": "2025-07-14",
        "value": 17.200000762939453
      },
      {
        "date": "2025-07-15",
        "value": 17.3799991607666
      },
      {
        "date": "2025-07-16",
        "value": 17.15999984741211
      },
      {
        "date": "2025-07-17",
        "value": 16.520000457763672
      },
      {
        "date": "2025-07-18",
        "value": 16.40999984741211
      },
      {
        "date": "2025-07-21",
        "value": 16.649999618530273
      },
      {
        "date": "2025-07-22",
        "value": 16.5
      },
      {
        "date": "2025-07-23",
        "value": 15.369999885559082
      },
      {
        "date": "2025-07-24",
        "value": 15.390000343322754
      },
      {
        "date": "2025-07-25",
        "value": 14.930000305175781
      },
      {
        "date": "2025-07-28",
        "value": 15.029999732971191
      },
      {
        "date": "2025-07-29",
        "value": 15.979999542236328
      },
      {
        "date": "2025-07-30",
        "value": 15.479999542236328
      },
      {
        "date": "2025-07-31",
        "value": 16.719999313354492
      },
      {
        "date": "2025-08-01",
        "value": 20.3799991607666
      },
      {
        "date": "2025-08-04",
        "value": 17.520000457763672
      },
      {
        "date": "2025-08-05",
        "value": 17.850000381469727
      },
      {
        "date": "2025-08-06",
        "value": 16.770000457763672
      },
      {
        "date": "2025-08-07",
        "value": 16.56999969482422
      },
      {
        "date": "2025-08-08",
        "value": 15.149999618530273
      },
      {
        "date": "2025-08-11",
        "value": 16.25
      },
      {
        "date": "2025-08-12",
        "value": 14.729999542236328
      },
      {
        "date": "2025-08-13",
        "value": 14.489999771118164
      },
      {
        "date": "2025-08-14",
        "value": 14.829999923706055
      },
      {
        "date": "2025-08-15",
        "value": 15.09000015258789
      },
      {
        "date": "2025-08-18",
        "value": 14.989999771118164
      },
      {
        "date": "2025-08-19",
        "value": 15.569999694824219
      },
      {
        "date": "2025-08-20",
        "value": 15.6899995803833
      },
      {
        "date": "2025-08-21",
        "value": 16.600000381469727
      },
      {
        "date": "2025-08-22",
        "value": 14.220000267028809
      },
      {
        "date": "2025-08-25",
        "value": 14.789999961853027
      },
      {
        "date": "2025-08-26",
        "value": 14.619999885559082
      },
      {
        "date": "2025-08-27",
        "value": 14.850000381469727
      },
      {
        "date": "2025-08-28",
        "value": 14.430000305175781
      },
      {
        "date": "2025-08-29",
        "value": 15.359999656677246
      },
      {
        "date": "2025-09-02",
        "value": 17.170000076293945
      },
      {
        "date": "2025-09-03",
        "value": 16.350000381469727
      },
      {
        "date": "2025-09-04",
        "value": 15.300000190734863
      },
      {
        "date": "2025-09-05",
        "value": 15.180000305175781
      },
      {
        "date": "2025-09-08",
        "value": 15.109999656677246
      },
      {
        "date": "2025-09-09",
        "value": 15.039999961853027
      },
      {
        "date": "2025-09-10",
        "value": 15.350000381469727
      },
      {
        "date": "2025-09-11",
        "value": 14.710000038146973
      },
      {
        "date": "2025-09-12",
        "value": 14.760000228881836
      },
      {
        "date": "2025-09-15",
        "value": 15.6899995803833
      },
      {
        "date": "2025-09-16",
        "value": 16.360000610351562
      },
      {
        "date": "2025-09-17",
        "value": 15.720000267028809
      },
      {
        "date": "2025-09-18",
        "value": 15.699999809265137
      },
      {
        "date": "2025-09-19",
        "value": 15.449999809265137
      },
      {
        "date": "2025-09-22",
        "value": 16.100000381469727
      },
      {
        "date": "2025-09-23",
        "value": 16.639999389648438
      },
      {
        "date": "2025-09-24",
        "value": 16.18000030517578
      },
      {
        "date": "2025-09-25",
        "value": 16.739999771118164
      },
      {
        "date": "2025-09-26",
        "value": 15.289999961853027
      },
      {
        "date": "2025-09-29",
        "value": 16.1200008392334
      },
      {
        "date": "2025-09-30",
        "value": 16.280000686645508
      },
      {
        "date": "2025-10-01",
        "value": 16.290000915527344
      },
      {
        "date": "2025-10-02",
        "value": 16.6299991607666
      },
      {
        "date": "2025-10-03",
        "value": 16.649999618530273
      },
      {
        "date": "2025-10-06",
        "value": 16.3700008392334
      },
      {
        "date": "2025-10-07",
        "value": 17.239999771118164
      },
      {
        "date": "2025-10-08",
        "value": 16.299999237060547
      },
      {
        "date": "2025-10-09",
        "value": 16.43000030517578
      },
      {
        "date": "2025-10-10",
        "value": 21.65999984741211
      },
      {
        "date": "2025-10-13",
        "value": 19.030000686645508
      },
      {
        "date": "2025-10-14",
        "value": 20.809999465942383
      },
      {
        "date": "2025-10-15",
        "value": 20.639999389648438
      },
      {
        "date": "2025-10-16",
        "value": 25.309999465942383
      },
      {
        "date": "2025-10-17",
        "value": 20.780000686645508
      },
      {
        "date": "2025-10-20",
        "value": 18.229999542236328
      },
      {
        "date": "2025-10-21",
        "value": 17.8700008392334
      },
      {
        "date": "2025-10-22",
        "value": 18.600000381469727
      },
      {
        "date": "2025-10-23",
        "value": 17.299999237060547
      },
      {
        "date": "2025-10-24",
        "value": 16.3700008392334
      },
      {
        "date": "2025-10-27",
        "value": 15.789999961853027
      },
      {
        "date": "2025-10-28",
        "value": 16.420000076293945
      },
      {
        "date": "2025-10-29",
        "value": 16.920000076293945
      },
      {
        "date": "2025-10-30",
        "value": 16.90999984741211
      },
      {
        "date": "2025-10-31",
        "value": 17.440000534057617
      },
      {
        "date": "2025-11-03",
        "value": 17.170000076293945
      },
      {
        "date": "2025-11-04",
        "value": 19.0
      },
      {
        "date": "2025-11-05",
        "value": 18.010000228881836
      },
      {
        "date": "2025-11-06",
        "value": 19.5
      },
      {
        "date": "2025-11-07",
        "value": 19.079999923706055
      },
      {
        "date": "2025-11-10",
        "value": 17.600000381469727
      },
      {
        "date": "2025-11-11",
        "value": 17.280000686645508
      },
      {
        "date": "2025-11-12",
        "value": 17.510000228881836
      },
      {
        "date": "2025-11-13",
        "value": 20.0
      },
      {
        "date": "2025-11-14",
        "value": 19.829999923706055
      },
      {
        "date": "2025-11-17",
        "value": 22.3799991607666
      },
      {
        "date": "2025-11-18",
        "value": 24.690000534057617
      },
      {
        "date": "2025-11-19",
        "value": 23.65999984741211
      },
      {
        "date": "2025-11-20",
        "value": 26.420000076293945
      },
      {
        "date": "2025-11-21",
        "value": 23.43000030517578
      },
      {
        "date": "2025-11-24",
        "value": 20.520000457763672
      },
      {
        "date": "2025-11-25",
        "value": 18.559999465942383
      },
      {
        "date": "2025-11-26",
        "value": 17.190000534057617
      },
      {
        "date": "2025-11-28",
        "value": 16.350000381469727
      },
      {
        "date": "2025-12-01",
        "value": 17.239999771118164
      },
      {
        "date": "2025-12-02",
        "value": 16.59000015258789
      },
      {
        "date": "2025-12-03",
        "value": 16.079999923706055
      },
      {
        "date": "2025-12-04",
        "value": 15.779999732971191
      },
      {
        "date": "2025-12-05",
        "value": 15.40999984741211
      },
      {
        "date": "2025-12-08",
        "value": 16.65999984741211
      },
      {
        "date": "2025-12-09",
        "value": 16.93000030517578
      },
      {
        "date": "2025-12-10",
        "value": 15.770000457763672
      },
      {
        "date": "2025-12-11",
        "value": 14.850000381469727
      },
      {
        "date": "2025-12-12",
        "value": 15.739999771118164
      },
      {
        "date": "2025-12-15",
        "value": 16.5
      },
      {
        "date": "2025-12-16",
        "value": 16.479999542236328
      },
      {
        "date": "2025-12-17",
        "value": 17.6200008392334
      },
      {
        "date": "2025-12-18",
        "value": 16.8700008392334
      },
      {
        "date": "2025-12-19",
        "value": 14.90999984741211
      },
      {
        "date": "2025-12-22",
        "value": 14.079999923706055
      },
      {
        "date": "2025-12-23",
        "value": 14.0
      },
      {
        "date": "2025-12-24",
        "value": 13.470000267028809
      },
      {
        "date": "2025-12-26",
        "value": 13.600000381469727
      },
      {
        "date": "2025-12-29",
        "value": 14.199999809265137
      },
      {
        "date": "2025-12-30",
        "value": 14.329999923706055
      },
      {
        "date": "2025-12-31",
        "value": 14.949999809265137
      },
      {
        "date": "2026-01-02",
        "value": 14.510000228881836
      },
      {
        "date": "2026-01-05",
        "value": 14.899999618530273
      },
      {
        "date": "2026-01-06",
        "value": 14.75
      },
      {
        "date": "2026-01-07",
        "value": 15.380000114440918
      },
      {
        "date": "2026-01-08",
        "value": 15.449999809265137
      },
      {
        "date": "2026-01-09",
        "value": 14.489999771118164
      },
      {
        "date": "2026-01-12",
        "value": 15.119999885559082
      },
      {
        "date": "2026-01-13",
        "value": 15.979999542236328
      },
      {
        "date": "2026-01-14",
        "value": 16.75
      },
      {
        "date": "2026-01-15",
        "value": 15.84000015258789
      },
      {
        "date": "2026-01-16",
        "value": 15.859999656677246
      },
      {
        "date": "2026-01-20",
        "value": 20.09000015258789
      },
      {
        "date": "2026-01-21",
        "value": 16.899999618530273
      },
      {
        "date": "2026-01-22",
        "value": 15.640000343322754
      },
      {
        "date": "2026-01-23",
        "value": 16.09000015258789
      },
      {
        "date": "2026-01-26",
        "value": 16.149999618530273
      },
      {
        "date": "2026-01-27",
        "value": 16.350000381469727
      },
      {
        "date": "2026-01-28",
        "value": 16.350000381469727
      },
      {
        "date": "2026-01-29",
        "value": 16.8799991607666
      },
      {
        "date": "2026-01-30",
        "value": 17.440000534057617
      },
      {
        "date": "2026-02-02",
        "value": 16.34000015258789
      },
      {
        "date": "2026-02-03",
        "value": 18.0
      },
      {
        "date": "2026-02-04",
        "value": 18.639999389648438
      },
      {
        "date": "2026-02-05",
        "value": 21.770000457763672
      },
      {
        "date": "2026-02-06",
        "value": 20.3700008392334
      },
      {
        "date": "2026-02-09",
        "value": 17.360000610351562
      },
      {
        "date": "2026-02-10",
        "value": 17.790000915527344
      },
      {
        "date": "2026-02-11",
        "value": 17.649999618530273
      },
      {
        "date": "2026-02-12",
        "value": 20.81999969482422
      },
      {
        "date": "2026-02-13",
        "value": 20.600000381469727
      },
      {
        "date": "2026-02-17",
        "value": 20.290000915527344
      },
      {
        "date": "2026-02-18",
        "value": 19.6200008392334
      },
      {
        "date": "2026-02-19",
        "value": 20.229999542236328
      },
      {
        "date": "2026-02-20",
        "value": 19.09000015258789
      },
      {
        "date": "2026-02-23",
        "value": 21.010000228881836
      },
      {
        "date": "2026-02-24",
        "value": 19.549999237060547
      },
      {
        "date": "2026-02-25",
        "value": 17.93000030517578
      },
      {
        "date": "2026-02-26",
        "value": 18.6299991607666
      },
      {
        "date": "2026-02-27",
        "value": 19.860000610351562
      },
      {
        "date": "2026-03-02",
        "value": 21.440000534057617
      },
      {
        "date": "2026-03-03",
        "value": 23.56999969482422
      },
      {
        "date": "2026-03-04",
        "value": 21.149999618530273
      },
      {
        "date": "2026-03-05",
        "value": 23.75
      },
      {
        "date": "2026-03-06",
        "value": 29.489999771118164
      },
      {
        "date": "2026-03-09",
        "value": 25.5
      },
      {
        "date": "2026-03-10",
        "value": 24.93000030517578
      },
      {
        "date": "2026-03-11",
        "value": 24.229999542236328
      },
      {
        "date": "2026-03-12",
        "value": 27.290000915527344
      },
      {
        "date": "2026-03-13",
        "value": 27.190000534057617
      },
      {
        "date": "2026-03-16",
        "value": 23.510000228881836
      },
      {
        "date": "2026-03-17",
        "value": 22.3700008392334
      },
      {
        "date": "2026-03-18",
        "value": 25.09000015258789
      },
      {
        "date": "2026-03-19",
        "value": 24.059999465942383
      },
      {
        "date": "2026-03-20",
        "value": 26.780000686645508
      },
      {
        "date": "2026-03-23",
        "value": 26.149999618530273
      },
      {
        "date": "2026-03-24",
        "value": 26.950000762939453
      },
      {
        "date": "2026-03-25",
        "value": 25.329999923706055
      },
      {
        "date": "2026-03-26",
        "value": 27.440000534057617
      },
      {
        "date": "2026-03-27",
        "value": 31.049999237060547
      },
      {
        "date": "2026-03-30",
        "value": 30.610000610351562
      },
      {
        "date": "2026-03-31",
        "value": 25.25
      },
      {
        "date": "2026-04-01",
        "value": 24.540000915527344
      },
      {
        "date": "2026-04-02",
        "value": 23.8700008392334
      },
      {
        "date": "2026-04-06",
        "value": 24.170000076293945
      },
      {
        "date": "2026-04-07",
        "value": 25.780000686645508
      },
      {
        "date": "2026-04-08",
        "value": 21.040000915527344
      },
      {
        "date": "2026-04-09",
        "value": 19.489999771118164
      },
      {
        "date": "2026-04-10",
        "value": 19.229999542236328
      },
      {
        "date": "2026-04-13",
        "value": 19.1200008392334
      },
      {
        "date": "2026-04-14",
        "value": 18.360000610351562
      },
      {
        "date": "2026-04-15",
        "value": 18.170000076293945
      },
      {
        "date": "2026-04-16",
        "value": 17.940000534057617
      },
      {
        "date": "2026-04-17",
        "value": 17.479999542236328
      },
      {
        "date": "2026-04-20",
        "value": 18.8700008392334
      },
      {
        "date": "2026-04-21",
        "value": 19.5
      },
      {
        "date": "2026-04-22",
        "value": 18.920000076293945
      },
      {
        "date": "2026-04-23",
        "value": 19.309999465942383
      },
      {
        "date": "2026-04-24",
        "value": 18.709999084472656
      },
      {
        "date": "2026-04-27",
        "value": 18.020000457763672
      },
      {
        "date": "2026-04-28",
        "value": 17.829999923706055
      },
      {
        "date": "2026-04-29",
        "value": 18.809999465942383
      },
      {
        "date": "2026-04-30",
        "value": 16.889999389648438
      },
      {
        "date": "2026-05-01",
        "value": 16.989999771118164
      },
      {
        "date": "2026-05-04",
        "value": 18.290000915527344
      },
      {
        "date": "2026-05-05",
        "value": 17.3799991607666
      },
      {
        "date": "2026-05-06",
        "value": 17.389999389648438
      },
      {
        "date": "2026-05-07",
        "value": 17.079999923706055
      },
      {
        "date": "2026-05-08",
        "value": 17.190000534057617
      },
      {
        "date": "2026-05-11",
        "value": 18.3799991607666
      },
      {
        "date": "2026-05-12",
        "value": 17.989999771118164
      },
      {
        "date": "2026-05-13",
        "value": 17.8700008392334
      },
      {
        "date": "2026-05-14",
        "value": 17.260000228881836
      },
      {
        "date": "2026-05-15",
        "value": 18.43000030517578
      },
      {
        "date": "2026-05-18",
        "value": 17.81999969482422
      },
      {
        "date": "2026-05-19",
        "value": 18.059999465942383
      },
      {
        "date": "2026-05-20",
        "value": 17.440000534057617
      },
      {
        "date": "2026-05-21",
        "value": 16.760000228881836
      },
      {
        "date": "2026-05-22",
        "value": 16.700000762939453
      },
      {
        "date": "2026-05-25",
        "value": 16.59000015258789
      },
      {
        "date": "2026-05-26",
        "value": 17.010000228881836
      },
      {
        "date": "2026-05-27",
        "value": 16.290000915527344
      },
      {
        "date": "2026-05-28",
        "value": 15.739999771118164
      },
      {
        "date": "2026-05-29",
        "value": 15.319999694824219
      },
      {
        "date": "2026-06-01",
        "value": 16.049999237060547
      },
      {
        "date": "2026-06-02",
        "value": 15.770000457763672
      },
      {
        "date": "2026-06-03",
        "value": 16.059999465942383
      },
      {
        "date": "2026-06-04",
        "value": 15.399999618530273
      },
      {
        "date": "2026-06-05",
        "value": 21.510000228881836
      },
      {
        "date": "2026-06-08",
        "value": 18.920000076293945
      },
      {
        "date": "2026-06-09",
        "value": 19.8700008392334
      },
      {
        "date": "2026-06-10",
        "value": 22.219999313354492
      },
      {
        "date": "2026-06-11",
        "value": 19.440000534057617
      },
      {
        "date": "2026-06-12",
        "value": 17.68000030517578
      },
      {
        "date": "2026-06-15",
        "value": 16.200000762939453
      },
      {
        "date": "2026-06-16",
        "value": 16.40999984741211
      },
      {
        "date": "2026-06-17",
        "value": 18.440000534057617
      },
      {
        "date": "2026-06-18",
        "value": 16.399999618530273
      },
      {
        "date": "2026-06-22",
        "value": 17.280000686645508
      },
      {
        "date": "2026-06-23",
        "value": 19.489999771118164
      },
      {
        "date": "2026-06-24",
        "value": 18.6299991607666
      },
      {
        "date": "2026-06-25",
        "value": 18.889999389648438
      },
      {
        "date": "2026-06-26",
        "value": 18.40999984741211
      },
      {
        "date": "2026-06-29",
        "value": 17.649999618530273
      },
      {
        "date": "2026-06-30",
        "value": 16.450000762939453
      },
      {
        "date": "2026-07-01",
        "value": 16.59000015258789
      },
      {
        "date": "2026-07-02",
        "value": 16.149999618530273
      },
      {
        "date": "2026-07-06",
        "value": 15.569999694824219
      },
      {
        "date": "2026-07-07",
        "value": 16.1299991607666
      },
      {
        "date": "2026-07-08",
        "value": 16.899999618530273
      },
      {
        "date": "2026-07-09",
        "value": 15.84000015258789
      },
      {
        "date": "2026-07-10",
        "value": 15.029999732971191
      },
      {
        "date": "2026-07-13",
        "value": 17.15999984741211
      },
      {
        "date": "2026-07-14",
        "value": 16.5
      }
    ],
    "nikkei": [
      {
        "date": "2024-11-20",
        "value": 38352.33984375
      },
      {
        "date": "2024-11-21",
        "value": 38026.171875
      },
      {
        "date": "2024-11-22",
        "value": 38283.8515625
      },
      {
        "date": "2024-11-25",
        "value": 38780.140625
      },
      {
        "date": "2024-11-26",
        "value": 38442.0
      },
      {
        "date": "2024-11-27",
        "value": 38134.96875
      },
      {
        "date": "2024-11-28",
        "value": 38349.05859375
      },
      {
        "date": "2024-11-29",
        "value": 38208.03125
      },
      {
        "date": "2024-12-02",
        "value": 38513.01953125
      },
      {
        "date": "2024-12-03",
        "value": 39248.859375
      },
      {
        "date": "2024-12-04",
        "value": 39276.390625
      },
      {
        "date": "2024-12-05",
        "value": 39395.6015625
      },
      {
        "date": "2024-12-06",
        "value": 39091.171875
      },
      {
        "date": "2024-12-09",
        "value": 39160.5
      },
      {
        "date": "2024-12-10",
        "value": 39367.578125
      },
      {
        "date": "2024-12-11",
        "value": 39372.23046875
      },
      {
        "date": "2024-12-12",
        "value": 39849.140625
      },
      {
        "date": "2024-12-13",
        "value": 39470.44140625
      },
      {
        "date": "2024-12-16",
        "value": 39457.48828125
      },
      {
        "date": "2024-12-17",
        "value": 39364.6796875
      },
      {
        "date": "2024-12-18",
        "value": 39081.7109375
      },
      {
        "date": "2024-12-19",
        "value": 38813.578125
      },
      {
        "date": "2024-12-20",
        "value": 38701.8984375
      },
      {
        "date": "2024-12-23",
        "value": 39161.33984375
      },
      {
        "date": "2024-12-24",
        "value": 39036.8515625
      },
      {
        "date": "2024-12-25",
        "value": 39130.4296875
      },
      {
        "date": "2024-12-26",
        "value": 39568.05859375
      },
      {
        "date": "2024-12-27",
        "value": 40281.16015625
      },
      {
        "date": "2024-12-30",
        "value": 39894.5390625
      },
      {
        "date": "2025-01-06",
        "value": 39307.05078125
      },
      {
        "date": "2025-01-07",
        "value": 40083.30078125
      },
      {
        "date": "2025-01-08",
        "value": 39981.05859375
      },
      {
        "date": "2025-01-09",
        "value": 39605.08984375
      },
      {
        "date": "2025-01-10",
        "value": 39190.3984375
      },
      {
        "date": "2025-01-14",
        "value": 38474.30078125
      },
      {
        "date": "2025-01-15",
        "value": 38444.578125
      },
      {
        "date": "2025-01-16",
        "value": 38572.6015625
      },
      {
        "date": "2025-01-17",
        "value": 38451.4609375
      },
      {
        "date": "2025-01-20",
        "value": 38902.5
      },
      {
        "date": "2025-01-21",
        "value": 39027.98046875
      },
      {
        "date": "2025-01-22",
        "value": 39646.25
      },
      {
        "date": "2025-01-23",
        "value": 39958.87109375
      },
      {
        "date": "2025-01-24",
        "value": 39931.98046875
      },
      {
        "date": "2025-01-27",
        "value": 39565.80078125
      },
      {
        "date": "2025-01-28",
        "value": 39016.87109375
      },
      {
        "date": "2025-01-29",
        "value": 39414.78125
      },
      {
        "date": "2025-01-30",
        "value": 39513.96875
      },
      {
        "date": "2025-01-31",
        "value": 39572.48828125
      },
      {
        "date": "2025-02-03",
        "value": 38520.08984375
      },
      {
        "date": "2025-02-04",
        "value": 38798.37109375
      },
      {
        "date": "2025-02-05",
        "value": 38831.48046875
      },
      {
        "date": "2025-02-06",
        "value": 39066.53125
      },
      {
        "date": "2025-02-07",
        "value": 38787.01953125
      },
      {
        "date": "2025-02-10",
        "value": 38801.171875
      },
      {
        "date": "2025-02-12",
        "value": 38963.69921875
      },
      {
        "date": "2025-02-13",
        "value": 39461.46875
      },
      {
        "date": "2025-02-14",
        "value": 39149.4296875
      },
      {
        "date": "2025-02-17",
        "value": 39174.25
      },
      {
        "date": "2025-02-18",
        "value": 39270.3984375
      },
      {
        "date": "2025-02-19",
        "value": 39164.609375
      },
      {
        "date": "2025-02-20",
        "value": 38678.0390625
      },
      {
        "date": "2025-02-21",
        "value": 38776.94140625
      },
      {
        "date": "2025-02-25",
        "value": 38237.7890625
      },
      {
        "date": "2025-02-26",
        "value": 38142.37109375
      },
      {
        "date": "2025-02-27",
        "value": 38256.171875
      },
      {
        "date": "2025-02-28",
        "value": 37155.5
      },
      {
        "date": "2025-03-03",
        "value": 37785.46875
      },
      {
        "date": "2025-03-04",
        "value": 37331.1796875
      },
      {
        "date": "2025-03-05",
        "value": 37418.23828125
      },
      {
        "date": "2025-03-06",
        "value": 37704.9296875
      },
      {
        "date": "2025-03-07",
        "value": 36887.171875
      },
      {
        "date": "2025-03-10",
        "value": 37028.26953125
      },
      {
        "date": "2025-03-11",
        "value": 36793.109375
      },
      {
        "date": "2025-03-12",
        "value": 36819.08984375
      },
      {
        "date": "2025-03-13",
        "value": 36790.03125
      },
      {
        "date": "2025-03-14",
        "value": 37053.1015625
      },
      {
        "date": "2025-03-17",
        "value": 37396.51953125
      },
      {
        "date": "2025-03-18",
        "value": 37845.421875
      },
      {
        "date": "2025-03-19",
        "value": 37751.87890625
      },
      {
        "date": "2025-03-21",
        "value": 37677.05859375
      },
      {
        "date": "2025-03-24",
        "value": 37608.48828125
      },
      {
        "date": "2025-03-25",
        "value": 37780.5390625
      },
      {
        "date": "2025-03-26",
        "value": 38027.2890625
      },
      {
        "date": "2025-03-27",
        "value": 37799.96875
      },
      {
        "date": "2025-03-28",
        "value": 37120.328125
      },
      {
        "date": "2025-03-31",
        "value": 35617.55859375
      },
      {
        "date": "2025-04-01",
        "value": 35624.48046875
      },
      {
        "date": "2025-04-02",
        "value": 35725.87109375
      },
      {
        "date": "2025-04-03",
        "value": 34735.9296875
      },
      {
        "date": "2025-04-04",
        "value": 33780.578125
      },
      {
        "date": "2025-04-07",
        "value": 31136.580078125
      },
      {
        "date": "2025-04-08",
        "value": 33012.578125
      },
      {
        "date": "2025-04-09",
        "value": 31714.029296875
      },
      {
        "date": "2025-04-10",
        "value": 34609.0
      },
      {
        "date": "2025-04-11",
        "value": 33585.578125
      },
      {
        "date": "2025-04-14",
        "value": 33982.359375
      },
      {
        "date": "2025-04-15",
        "value": 34267.5390625
      },
      {
        "date": "2025-04-16",
        "value": 33920.3984375
      },
      {
        "date": "2025-04-17",
        "value": 34377.6015625
      },
      {
        "date": "2025-04-18",
        "value": 34730.28125
      },
      {
        "date": "2025-04-21",
        "value": 34279.921875
      },
      {
        "date": "2025-04-22",
        "value": 34220.6015625
      },
      {
        "date": "2025-04-23",
        "value": 34868.62890625
      },
      {
        "date": "2025-04-24",
        "value": 35039.1484375
      },
      {
        "date": "2025-04-25",
        "value": 35705.73828125
      },
      {
        "date": "2025-04-28",
        "value": 35839.98828125
      },
      {
        "date": "2025-04-30",
        "value": 36045.37890625
      },
      {
        "date": "2025-05-01",
        "value": 36452.30078125
      },
      {
        "date": "2025-05-02",
        "value": 36830.69140625
      },
      {
        "date": "2025-05-07",
        "value": 36779.66015625
      },
      {
        "date": "2025-05-08",
        "value": 36928.62890625
      },
      {
        "date": "2025-05-09",
        "value": 37503.328125
      },
      {
        "date": "2025-05-12",
        "value": 37644.26171875
      },
      {
        "date": "2025-05-13",
        "value": 38183.26171875
      },
      {
        "date": "2025-05-14",
        "value": 38128.12890625
      },
      {
        "date": "2025-05-15",
        "value": 37755.51171875
      },
      {
        "date": "2025-05-16",
        "value": 37753.71875
      },
      {
        "date": "2025-05-19",
        "value": 37498.62890625
      },
      {
        "date": "2025-05-20",
        "value": 37529.48828125
      },
      {
        "date": "2025-05-21",
        "value": 37298.98046875
      },
      {
        "date": "2025-05-22",
        "value": 36985.87109375
      },
      {
        "date": "2025-05-23",
        "value": 37160.46875
      },
      {
        "date": "2025-05-26",
        "value": 37531.53125
      },
      {
        "date": "2025-05-27",
        "value": 37724.109375
      },
      {
        "date": "2025-05-28",
        "value": 37722.3984375
      },
      {
        "date": "2025-05-29",
        "value": 38432.98046875
      },
      {
        "date": "2025-05-30",
        "value": 37965.1015625
      },
      {
        "date": "2025-06-02",
        "value": 37470.671875
      },
      {
        "date": "2025-06-03",
        "value": 37446.80859375
      },
      {
        "date": "2025-06-04",
        "value": 37747.44921875
      },
      {
        "date": "2025-06-05",
        "value": 37554.48828125
      },
      {
        "date": "2025-06-06",
        "value": 37741.609375
      },
      {
        "date": "2025-06-09",
        "value": 38088.5703125
      },
      {
        "date": "2025-06-10",
        "value": 38211.51171875
      },
      {
        "date": "2025-06-11",
        "value": 38421.19140625
      },
      {
        "date": "2025-06-12",
        "value": 38173.08984375
      },
      {
        "date": "2025-06-13",
        "value": 37834.25
      },
      {
        "date": "2025-06-16",
        "value": 38311.328125
      },
      {
        "date": "2025-06-17",
        "value": 38536.73828125
      },
      {
        "date": "2025-06-18",
        "value": 38885.1484375
      },
      {
        "date": "2025-06-19",
        "value": 38488.33984375
      },
      {
        "date": "2025-06-20",
        "value": 38403.23046875
      },
      {
        "date": "2025-06-23",
        "value": 38354.08984375
      },
      {
        "date": "2025-06-24",
        "value": 38790.55859375
      },
      {
        "date": "2025-06-25",
        "value": 38942.0703125
      },
      {
        "date": "2025-06-26",
        "value": 39584.578125
      },
      {
        "date": "2025-06-27",
        "value": 40150.7890625
      },
      {
        "date": "2025-06-30",
        "value": 40487.390625
      },
      {
        "date": "2025-07-01",
        "value": 39986.328125
      },
      {
        "date": "2025-07-02",
        "value": 39762.48046875
      },
      {
        "date": "2025-07-03",
        "value": 39785.8984375
      },
      {
        "date": "2025-07-04",
        "value": 39810.87890625
      },
      {
        "date": "2025-07-07",
        "value": 39587.6796875
      },
      {
        "date": "2025-07-08",
        "value": 39688.80859375
      },
      {
        "date": "2025-07-09",
        "value": 39821.28125
      },
      {
        "date": "2025-07-10",
        "value": 39646.359375
      },
      {
        "date": "2025-07-11",
        "value": 39569.6796875
      },
      {
        "date": "2025-07-14",
        "value": 39459.62109375
      },
      {
        "date": "2025-07-15",
        "value": 39678.01953125
      },
      {
        "date": "2025-07-16",
        "value": 39663.3984375
      },
      {
        "date": "2025-07-17",
        "value": 39901.19140625
      },
      {
        "date": "2025-07-18",
        "value": 39819.109375
      },
      {
        "date": "2025-07-22",
        "value": 39774.921875
      },
      {
        "date": "2025-07-23",
        "value": 41171.3203125
      },
      {
        "date": "2025-07-24",
        "value": 41826.33984375
      },
      {
        "date": "2025-07-25",
        "value": 41456.23046875
      },
      {
        "date": "2025-07-28",
        "value": 40998.26953125
      },
      {
        "date": "2025-07-29",
        "value": 40674.55078125
      },
      {
        "date": "2025-07-30",
        "value": 40654.69921875
      },
      {
        "date": "2025-07-31",
        "value": 41069.8203125
      },
      {
        "date": "2025-08-01",
        "value": 40799.6015625
      },
      {
        "date": "2025-08-04",
        "value": 40290.69921875
      },
      {
        "date": "2025-08-05",
        "value": 40549.5390625
      },
      {
        "date": "2025-08-06",
        "value": 40794.859375
      },
      {
        "date": "2025-08-07",
        "value": 41059.1484375
      },
      {
        "date": "2025-08-08",
        "value": 41820.48046875
      },
      {
        "date": "2025-08-12",
        "value": 42718.171875
      },
      {
        "date": "2025-08-13",
        "value": 43274.671875
      },
      {
        "date": "2025-08-14",
        "value": 42649.26171875
      },
      {
        "date": "2025-08-15",
        "value": 43378.30859375
      },
      {
        "date": "2025-08-18",
        "value": 43714.30859375
      },
      {
        "date": "2025-08-19",
        "value": 43546.2890625
      },
      {
        "date": "2025-08-20",
        "value": 42888.55078125
      },
      {
        "date": "2025-08-21",
        "value": 42610.171875
      },
      {
        "date": "2025-08-22",
        "value": 42633.2890625
      },
      {
        "date": "2025-08-25",
        "value": 42807.8203125
      },
      {
        "date": "2025-08-26",
        "value": 42394.3984375
      },
      {
        "date": "2025-08-27",
        "value": 42520.26953125
      },
      {
        "date": "2025-08-28",
        "value": 42828.7890625
      },
      {
        "date": "2025-08-29",
        "value": 42718.46875
      },
      {
        "date": "2025-09-01",
        "value": 42188.7890625
      },
      {
        "date": "2025-09-02",
        "value": 42310.48828125
      },
      {
        "date": "2025-09-03",
        "value": 41938.890625
      },
      {
        "date": "2025-09-04",
        "value": 42580.26953125
      },
      {
        "date": "2025-09-05",
        "value": 43018.75
      },
      {
        "date": "2025-09-08",
        "value": 43643.80859375
      },
      {
        "date": "2025-09-09",
        "value": 43459.2890625
      },
      {
        "date": "2025-09-10",
        "value": 43837.671875
      },
      {
        "date": "2025-09-11",
        "value": 44372.5
      },
      {
        "date": "2025-09-12",
        "value": 44768.12109375
      },
      {
        "date": "2025-09-16",
        "value": 44902.26953125
      },
      {
        "date": "2025-09-17",
        "value": 44790.37890625
      },
      {
        "date": "2025-09-18",
        "value": 45303.4296875
      },
      {
        "date": "2025-09-19",
        "value": 45045.80859375
      },
      {
        "date": "2025-09-22",
        "value": 45493.66015625
      },
      {
        "date": "2025-09-24",
        "value": 45630.30859375
      },
      {
        "date": "2025-09-25",
        "value": 45754.9296875
      },
      {
        "date": "2025-09-26",
        "value": 45354.98828125
      },
      {
        "date": "2025-09-29",
        "value": 45043.75
      },
      {
        "date": "2025-09-30",
        "value": 44932.62890625
      },
      {
        "date": "2025-10-01",
        "value": 44550.8515625
      },
      {
        "date": "2025-10-02",
        "value": 44936.73046875
      },
      {
        "date": "2025-10-03",
        "value": 45769.5
      },
      {
        "date": "2025-10-06",
        "value": 47944.76171875
      },
      {
        "date": "2025-10-07",
        "value": 47950.87890625
      },
      {
        "date": "2025-10-08",
        "value": 47734.98828125
      },
      {
        "date": "2025-10-09",
        "value": 48580.44140625
      },
      {
        "date": "2025-10-10",
        "value": 48088.80078125
      },
      {
        "date": "2025-10-14",
        "value": 46847.3203125
      },
      {
        "date": "2025-10-15",
        "value": 47672.671875
      },
      {
        "date": "2025-10-16",
        "value": 48277.73828125
      },
      {
        "date": "2025-10-17",
        "value": 47582.1484375
      },
      {
        "date": "2025-10-20",
        "value": 49185.5
      },
      {
        "date": "2025-10-21",
        "value": 49316.05859375
      },
      {
        "date": "2025-10-22",
        "value": 49307.7890625
      },
      {
        "date": "2025-10-23",
        "value": 48641.609375
      },
      {
        "date": "2025-10-24",
        "value": 49299.6484375
      },
      {
        "date": "2025-10-27",
        "value": 50512.3203125
      },
      {
        "date": "2025-10-28",
        "value": 50219.1796875
      },
      {
        "date": "2025-10-29",
        "value": 51307.6484375
      },
      {
        "date": "2025-10-30",
        "value": 51325.609375
      },
      {
        "date": "2025-10-31",
        "value": 52411.33984375
      },
      {
        "date": "2025-11-04",
        "value": 51497.19921875
      },
      {
        "date": "2025-11-05",
        "value": 50212.26953125
      },
      {
        "date": "2025-11-06",
        "value": 50883.6796875
      },
      {
        "date": "2025-11-07",
        "value": 50276.37109375
      },
      {
        "date": "2025-11-10",
        "value": 50911.76171875
      },
      {
        "date": "2025-11-11",
        "value": 50842.9296875
      },
      {
        "date": "2025-11-12",
        "value": 51063.30859375
      },
      {
        "date": "2025-11-13",
        "value": 51281.828125
      },
      {
        "date": "2025-11-14",
        "value": 50376.53125
      },
      {
        "date": "2025-11-17",
        "value": 50323.91015625
      },
      {
        "date": "2025-11-18",
        "value": 48702.98046875
      },
      {
        "date": "2025-11-19",
        "value": 48537.69921875
      },
      {
        "date": "2025-11-20",
        "value": 49823.94140625
      },
      {
        "date": "2025-11-21",
        "value": 48625.87890625
      },
      {
        "date": "2025-11-25",
        "value": 48659.51953125
      },
      {
        "date": "2025-11-26",
        "value": 49559.0703125
      },
      {
        "date": "2025-11-27",
        "value": 50167.1015625
      },
      {
        "date": "2025-11-28",
        "value": 50253.91015625
      },
      {
        "date": "2025-12-01",
        "value": 49303.28125
      },
      {
        "date": "2025-12-02",
        "value": 49303.44921875
      },
      {
        "date": "2025-12-03",
        "value": 49864.6796875
      },
      {
        "date": "2025-12-04",
        "value": 51028.421875
      },
      {
        "date": "2025-12-05",
        "value": 50491.87109375
      },
      {
        "date": "2025-12-08",
        "value": 50581.94140625
      },
      {
        "date": "2025-12-09",
        "value": 50655.1015625
      },
      {
        "date": "2025-12-10",
        "value": 50602.80078125
      },
      {
        "date": "2025-12-11",
        "value": 50148.8203125
      },
      {
        "date": "2025-12-12",
        "value": 50836.55078125
      },
      {
        "date": "2025-12-15",
        "value": 50168.109375
      },
      {
        "date": "2025-12-16",
        "value": 49383.2890625
      },
      {
        "date": "2025-12-17",
        "value": 49512.28125
      },
      {
        "date": "2025-12-18",
        "value": 49001.5
      },
      {
        "date": "2025-12-19",
        "value": 49507.2109375
      },
      {
        "date": "2025-12-22",
        "value": 50402.390625
      },
      {
        "date": "2025-12-23",
        "value": 50412.87109375
      },
      {
        "date": "2025-12-24",
        "value": 50344.1015625
      },
      {
        "date": "2025-12-25",
        "value": 50407.7890625
      },
      {
        "date": "2025-12-26",
        "value": 50750.390625
      },
      {
        "date": "2025-12-29",
        "value": 50526.921875
      },
      {
        "date": "2025-12-30",
        "value": 50339.48046875
      },
      {
        "date": "2026-01-05",
        "value": 51832.80078125
      },
      {
        "date": "2026-01-06",
        "value": 52518.078125
      },
      {
        "date": "2026-01-07",
        "value": 51961.98046875
      },
      {
        "date": "2026-01-08",
        "value": 51117.26171875
      },
      {
        "date": "2026-01-09",
        "value": 51939.890625
      },
      {
        "date": "2026-01-13",
        "value": 53549.16015625
      },
      {
        "date": "2026-01-14",
        "value": 54341.23046875
      },
      {
        "date": "2026-01-15",
        "value": 54110.5
      },
      {
        "date": "2026-01-16",
        "value": 53936.171875
      },
      {
        "date": "2026-01-19",
        "value": 53583.5703125
      },
      {
        "date": "2026-01-20",
        "value": 52991.1015625
      },
      {
        "date": "2026-01-21",
        "value": 52774.640625
      },
      {
        "date": "2026-01-22",
        "value": 53688.890625
      },
      {
        "date": "2026-01-23",
        "value": 53846.87109375
      },
      {
        "date": "2026-01-26",
        "value": 52885.25
      },
      {
        "date": "2026-01-27",
        "value": 53333.5390625
      },
      {
        "date": "2026-01-28",
        "value": 53358.7109375
      },
      {
        "date": "2026-01-29",
        "value": 53375.6015625
      },
      {
        "date": "2026-01-30",
        "value": 53322.8515625
      },
      {
        "date": "2026-02-02",
        "value": 52655.1796875
      },
      {
        "date": "2026-02-03",
        "value": 54720.66015625
      },
      {
        "date": "2026-02-04",
        "value": 54293.359375
      },
      {
        "date": "2026-02-05",
        "value": 53818.0390625
      },
      {
        "date": "2026-02-06",
        "value": 54253.6796875
      },
      {
        "date": "2026-02-09",
        "value": 56363.94140625
      },
      {
        "date": "2026-02-10",
        "value": 57650.5390625
      },
      {
        "date": "2026-02-12",
        "value": 57639.83984375
      },
      {
        "date": "2026-02-13",
        "value": 56941.96875
      },
      {
        "date": "2026-02-16",
        "value": 56806.41015625
      },
      {
        "date": "2026-02-17",
        "value": 56566.48828125
      },
      {
        "date": "2026-02-18",
        "value": 57143.83984375
      },
      {
        "date": "2026-02-19",
        "value": 57467.828125
      },
      {
        "date": "2026-02-20",
        "value": 56825.69921875
      },
      {
        "date": "2026-02-24",
        "value": 57321.08984375
      },
      {
        "date": "2026-02-25",
        "value": 58583.12109375
      },
      {
        "date": "2026-02-26",
        "value": 58753.390625
      },
      {
        "date": "2026-02-27",
        "value": 58850.26953125
      },
      {
        "date": "2026-03-02",
        "value": 58057.23828125
      },
      {
        "date": "2026-03-03",
        "value": 56279.05078125
      },
      {
        "date": "2026-03-04",
        "value": 54245.5390625
      },
      {
        "date": "2026-03-05",
        "value": 55278.05859375
      },
      {
        "date": "2026-03-06",
        "value": 55620.83984375
      },
      {
        "date": "2026-03-09",
        "value": 52728.71875
      },
      {
        "date": "2026-03-10",
        "value": 54248.390625
      },
      {
        "date": "2026-03-11",
        "value": 55025.37109375
      },
      {
        "date": "2026-03-12",
        "value": 54452.9609375
      },
      {
        "date": "2026-03-13",
        "value": 53819.609375
      },
      {
        "date": "2026-03-16",
        "value": 53751.1484375
      },
      {
        "date": "2026-03-17",
        "value": 53700.390625
      },
      {
        "date": "2026-03-18",
        "value": 55239.3984375
      },
      {
        "date": "2026-03-19",
        "value": 53372.53125
      },
      {
        "date": "2026-03-23",
        "value": 51515.48828125
      },
      {
        "date": "2026-03-24",
        "value": 52252.28125
      },
      {
        "date": "2026-03-25",
        "value": 53749.62109375
      },
      {
        "date": "2026-03-26",
        "value": 53603.6484375
      },
      {
        "date": "2026-03-27",
        "value": 53373.0703125
      },
      {
        "date": "2026-03-30",
        "value": 51885.8515625
      },
      {
        "date": "2026-03-31",
        "value": 51063.71875
      },
      {
        "date": "2026-04-01",
        "value": 53739.6796875
      },
      {
        "date": "2026-04-02",
        "value": 52463.26953125
      },
      {
        "date": "2026-04-03",
        "value": 53123.48828125
      },
      {
        "date": "2026-04-06",
        "value": 53413.6796875
      },
      {
        "date": "2026-04-07",
        "value": 53429.55859375
      },
      {
        "date": "2026-04-08",
        "value": 56308.421875
      },
      {
        "date": "2026-04-09",
        "value": 55895.3203125
      },
      {
        "date": "2026-04-10",
        "value": 56924.109375
      },
      {
        "date": "2026-04-13",
        "value": 56502.76953125
      },
      {
        "date": "2026-04-14",
        "value": 57877.390625
      },
      {
        "date": "2026-04-15",
        "value": 58134.23828125
      },
      {
        "date": "2026-04-16",
        "value": 59518.33984375
      },
      {
        "date": "2026-04-17",
        "value": 58475.8984375
      },
      {
        "date": "2026-04-20",
        "value": 58824.890625
      },
      {
        "date": "2026-04-21",
        "value": 59349.171875
      },
      {
        "date": "2026-04-22",
        "value": 59585.859375
      },
      {
        "date": "2026-04-23",
        "value": 59140.23046875
      },
      {
        "date": "2026-04-24",
        "value": 59716.1796875
      },
      {
        "date": "2026-04-27",
        "value": 60537.359375
      },
      {
        "date": "2026-04-28",
        "value": 59917.4609375
      },
      {
        "date": "2026-04-30",
        "value": 59284.921875
      },
      {
        "date": "2026-05-01",
        "value": 59513.12109375
      },
      {
        "date": "2026-05-07",
        "value": 62833.83984375
      },
      {
        "date": "2026-05-08",
        "value": 62713.6484375
      },
      {
        "date": "2026-05-11",
        "value": 62417.87890625
      },
      {
        "date": "2026-05-12",
        "value": 62742.5703125
      },
      {
        "date": "2026-05-13",
        "value": 63272.109375
      },
      {
        "date": "2026-05-14",
        "value": 62654.05078125
      },
      {
        "date": "2026-05-15",
        "value": 61409.2890625
      },
      {
        "date": "2026-05-18",
        "value": 60815.94921875
      },
      {
        "date": "2026-05-19",
        "value": 60550.58984375
      },
      {
        "date": "2026-05-20",
        "value": 59804.41015625
      },
      {
        "date": "2026-05-21",
        "value": 61684.140625
      },
      {
        "date": "2026-05-22",
        "value": 63339.0703125
      },
      {
        "date": "2026-05-25",
        "value": 65158.19140625
      },
      {
        "date": "2026-05-26",
        "value": 64996.08984375
      },
      {
        "date": "2026-05-27",
        "value": 64999.41015625
      },
      {
        "date": "2026-05-28",
        "value": 64693.12109375
      },
      {
        "date": "2026-05-29",
        "value": 66329.5
      },
      {
        "date": "2026-06-01",
        "value": 66934.328125
      },
      {
        "date": "2026-06-02",
        "value": 66734.2421875
      },
      {
        "date": "2026-06-03",
        "value": 68402.1328125
      },
      {
        "date": "2026-06-04",
        "value": 67470.6875
      },
      {
        "date": "2026-06-05",
        "value": 66588.1171875
      },
      {
        "date": "2026-06-08",
        "value": 64024.6015625
      },
      {
        "date": "2026-06-09",
        "value": 65416.62890625
      },
      {
        "date": "2026-06-10",
        "value": 64179.26953125
      },
      {
        "date": "2026-06-11",
        "value": 64217.26953125
      },
      {
        "date": "2026-06-12",
        "value": 66020.0390625
      },
      {
        "date": "2026-06-15",
        "value": 69317.5
      },
      {
        "date": "2026-06-16",
        "value": 69404.5
      },
      {
        "date": "2026-06-17",
        "value": 69902.25
      },
      {
        "date": "2026-06-18",
        "value": 71053.4921875
      },
      {
        "date": "2026-06-19",
        "value": 71250.0625
      },
      {
        "date": "2026-06-22",
        "value": 72353.9609375
      },
      {
        "date": "2026-06-23",
        "value": 69788.3828125
      },
      {
        "date": "2026-06-24",
        "value": 69174.96875
      },
      {
        "date": "2026-06-25",
        "value": 72366.34375
      },
      {
        "date": "2026-06-26",
        "value": 69360.8828125
      },
      {
        "date": "2026-06-29",
        "value": 69468.109375
      },
      {
        "date": "2026-06-30",
        "value": 70062.3203125
      },
      {
        "date": "2026-07-01",
        "value": 70474.9609375
      },
      {
        "date": "2026-07-02",
        "value": 68733.1484375
      },
      {
        "date": "2026-07-03",
        "value": 69744.0703125
      },
      {
        "date": "2026-07-06",
        "value": 69737.6875
      },
      {
        "date": "2026-07-07",
        "value": 68256.9609375
      },
      {
        "date": "2026-07-08",
        "value": 66819.046875
      },
      {
        "date": "2026-07-09",
        "value": 67743.8515625
      },
      {
        "date": "2026-07-10",
        "value": 68557.7265625
      },
      {
        "date": "2026-07-13",
        "value": 67242.7265625
      }
    ],
    "hsi": [
      {
        "date": "2024-11-21",
        "value": 19601.109375
      },
      {
        "date": "2024-11-22",
        "value": 19229.970703125
      },
      {
        "date": "2024-11-25",
        "value": 19150.990234375
      },
      {
        "date": "2024-11-26",
        "value": 19159.19921875
      },
      {
        "date": "2024-11-27",
        "value": 19603.130859375
      },
      {
        "date": "2024-11-28",
        "value": 19366.9609375
      },
      {
        "date": "2024-11-29",
        "value": 19423.609375
      },
      {
        "date": "2024-12-02",
        "value": 19550.2890625
      },
      {
        "date": "2024-12-03",
        "value": 19746.3203125
      },
      {
        "date": "2024-12-04",
        "value": 19742.4609375
      },
      {
        "date": "2024-12-05",
        "value": 19560.439453125
      },
      {
        "date": "2024-12-06",
        "value": 19865.849609375
      },
      {
        "date": "2024-12-09",
        "value": 20414.08984375
      },
      {
        "date": "2024-12-10",
        "value": 20311.279296875
      },
      {
        "date": "2024-12-11",
        "value": 20155.05078125
      },
      {
        "date": "2024-12-12",
        "value": 20397.05078125
      },
      {
        "date": "2024-12-13",
        "value": 19971.240234375
      },
      {
        "date": "2024-12-16",
        "value": 19795.490234375
      },
      {
        "date": "2024-12-17",
        "value": 19700.48046875
      },
      {
        "date": "2024-12-18",
        "value": 19864.55078125
      },
      {
        "date": "2024-12-19",
        "value": 19752.509765625
      },
      {
        "date": "2024-12-20",
        "value": 19720.69921875
      },
      {
        "date": "2024-12-23",
        "value": 19883.130859375
      },
      {
        "date": "2024-12-24",
        "value": 20098.2890625
      },
      {
        "date": "2024-12-27",
        "value": 20090.4609375
      },
      {
        "date": "2024-12-30",
        "value": 20041.419921875
      },
      {
        "date": "2024-12-31",
        "value": 20059.94921875
      },
      {
        "date": "2025-01-02",
        "value": 19623.3203125
      },
      {
        "date": "2025-01-03",
        "value": 19760.26953125
      },
      {
        "date": "2025-01-06",
        "value": 19688.2890625
      },
      {
        "date": "2025-01-07",
        "value": 19447.580078125
      },
      {
        "date": "2025-01-08",
        "value": 19279.83984375
      },
      {
        "date": "2025-01-09",
        "value": 19240.890625
      },
      {
        "date": "2025-01-10",
        "value": 19064.2890625
      },
      {
        "date": "2025-01-13",
        "value": 18874.140625
      },
      {
        "date": "2025-01-14",
        "value": 19219.779296875
      },
      {
        "date": "2025-01-15",
        "value": 19286.0703125
      },
      {
        "date": "2025-01-16",
        "value": 19522.890625
      },
      {
        "date": "2025-01-17",
        "value": 19584.060546875
      },
      {
        "date": "2025-01-20",
        "value": 19925.810546875
      },
      {
        "date": "2025-01-21",
        "value": 20106.55078125
      },
      {
        "date": "2025-01-22",
        "value": 19778.76953125
      },
      {
        "date": "2025-01-23",
        "value": 19700.560546875
      },
      {
        "date": "2025-01-24",
        "value": 20066.189453125
      },
      {
        "date": "2025-01-27",
        "value": 20197.76953125
      },
      {
        "date": "2025-01-28",
        "value": 20225.109375
      },
      {
        "date": "2025-02-03",
        "value": 20217.259765625
      },
      {
        "date": "2025-02-04",
        "value": 20789.9609375
      },
      {
        "date": "2025-02-05",
        "value": 20597.08984375
      },
      {
        "date": "2025-02-06",
        "value": 20891.619140625
      },
      {
        "date": "2025-02-07",
        "value": 21133.5390625
      },
      {
        "date": "2025-02-10",
        "value": 21521.98046875
      },
      {
        "date": "2025-02-11",
        "value": 21294.859375
      },
      {
        "date": "2025-02-12",
        "value": 21857.919921875
      },
      {
        "date": "2025-02-13",
        "value": 21814.369140625
      },
      {
        "date": "2025-02-14",
        "value": 22620.330078125
      },
      {
        "date": "2025-02-17",
        "value": 22616.23046875
      },
      {
        "date": "2025-02-18",
        "value": 22976.810546875
      },
      {
        "date": "2025-02-19",
        "value": 22944.240234375
      },
      {
        "date": "2025-02-20",
        "value": 22576.98046875
      },
      {
        "date": "2025-02-21",
        "value": 23477.919921875
      },
      {
        "date": "2025-02-24",
        "value": 23341.609375
      },
      {
        "date": "2025-02-25",
        "value": 23034.01953125
      },
      {
        "date": "2025-02-26",
        "value": 23787.9296875
      },
      {
        "date": "2025-02-27",
        "value": 23718.2890625
      },
      {
        "date": "2025-02-28",
        "value": 22941.3203125
      },
      {
        "date": "2025-03-03",
        "value": 23006.26953125
      },
      {
        "date": "2025-03-04",
        "value": 22941.76953125
      },
      {
        "date": "2025-03-05",
        "value": 23594.2109375
      },
      {
        "date": "2025-03-06",
        "value": 24369.7109375
      },
      {
        "date": "2025-03-07",
        "value": 24231.30078125
      },
      {
        "date": "2025-03-10",
        "value": 23783.490234375
      },
      {
        "date": "2025-03-11",
        "value": 23782.140625
      },
      {
        "date": "2025-03-12",
        "value": 23600.310546875
      },
      {
        "date": "2025-03-13",
        "value": 23462.650390625
      },
      {
        "date": "2025-03-14",
        "value": 23959.98046875
      },
      {
        "date": "2025-03-17",
        "value": 24145.5703125
      },
      {
        "date": "2025-03-18",
        "value": 24740.5703125
      },
      {
        "date": "2025-03-19",
        "value": 24771.140625
      },
      {
        "date": "2025-03-20",
        "value": 24219.94921875
      },
      {
        "date": "2025-03-21",
        "value": 23689.720703125
      },
      {
        "date": "2025-03-24",
        "value": 23905.560546875
      },
      {
        "date": "2025-03-25",
        "value": 23344.25
      },
      {
        "date": "2025-03-26",
        "value": 23483.3203125
      },
      {
        "date": "2025-03-27",
        "value": 23578.80078125
      },
      {
        "date": "2025-03-28",
        "value": 23426.599609375
      },
      {
        "date": "2025-03-31",
        "value": 23119.580078125
      },
      {
        "date": "2025-04-01",
        "value": 23206.83984375
      },
      {
        "date": "2025-04-02",
        "value": 23202.529296875
      },
      {
        "date": "2025-04-03",
        "value": 22849.810546875
      },
      {
        "date": "2025-04-07",
        "value": 19828.30078125
      },
      {
        "date": "2025-04-08",
        "value": 20127.6796875
      },
      {
        "date": "2025-04-09",
        "value": 20264.490234375
      },
      {
        "date": "2025-04-10",
        "value": 20681.779296875
      },
      {
        "date": "2025-04-11",
        "value": 20914.689453125
      },
      {
        "date": "2025-04-14",
        "value": 21417.400390625
      },
      {
        "date": "2025-04-15",
        "value": 21466.26953125
      },
      {
        "date": "2025-04-16",
        "value": 21056.98046875
      },
      {
        "date": "2025-04-17",
        "value": 21395.140625
      },
      {
        "date": "2025-04-22",
        "value": 21562.3203125
      },
      {
        "date": "2025-04-23",
        "value": 22072.619140625
      },
      {
        "date": "2025-04-24",
        "value": 21909.759765625
      },
      {
        "date": "2025-04-25",
        "value": 21980.740234375
      },
      {
        "date": "2025-04-28",
        "value": 21971.9609375
      },
      {
        "date": "2025-04-29",
        "value": 22008.109375
      },
      {
        "date": "2025-04-30",
        "value": 22119.41015625
      },
      {
        "date": "2025-05-02",
        "value": 22504.6796875
      },
      {
        "date": "2025-05-06",
        "value": 22662.7109375
      },
      {
        "date": "2025-05-07",
        "value": 22691.880859375
      },
      {
        "date": "2025-05-08",
        "value": 22775.919921875
      },
      {
        "date": "2025-05-09",
        "value": 22867.740234375
      },
      {
        "date": "2025-05-12",
        "value": 23549.4609375
      },
      {
        "date": "2025-05-13",
        "value": 23108.26953125
      },
      {
        "date": "2025-05-14",
        "value": 23640.650390625
      },
      {
        "date": "2025-05-15",
        "value": 23453.16015625
      },
      {
        "date": "2025-05-16",
        "value": 23345.05078125
      },
      {
        "date": "2025-05-19",
        "value": 23332.720703125
      },
      {
        "date": "2025-05-20",
        "value": 23681.48046875
      },
      {
        "date": "2025-05-21",
        "value": 23827.779296875
      },
      {
        "date": "2025-05-22",
        "value": 23544.310546875
      },
      {
        "date": "2025-05-23",
        "value": 23601.259765625
      },
      {
        "date": "2025-05-26",
        "value": 23282.330078125
      },
      {
        "date": "2025-05-27",
        "value": 23381.990234375
      },
      {
        "date": "2025-05-28",
        "value": 23258.310546875
      },
      {
        "date": "2025-05-29",
        "value": 23573.380859375
      },
      {
        "date": "2025-05-30",
        "value": 23289.76953125
      },
      {
        "date": "2025-06-02",
        "value": 23157.970703125
      },
      {
        "date": "2025-06-03",
        "value": 23512.490234375
      },
      {
        "date": "2025-06-04",
        "value": 23654.029296875
      },
      {
        "date": "2025-06-05",
        "value": 23906.970703125
      },
      {
        "date": "2025-06-06",
        "value": 23792.5390625
      },
      {
        "date": "2025-06-09",
        "value": 24181.4296875
      },
      {
        "date": "2025-06-10",
        "value": 24162.869140625
      },
      {
        "date": "2025-06-11",
        "value": 24366.939453125
      },
      {
        "date": "2025-06-12",
        "value": 24035.380859375
      },
      {
        "date": "2025-06-13",
        "value": 23892.560546875
      },
      {
        "date": "2025-06-16",
        "value": 24060.990234375
      },
      {
        "date": "2025-06-17",
        "value": 23980.30078125
      },
      {
        "date": "2025-06-18",
        "value": 23710.689453125
      },
      {
        "date": "2025-06-19",
        "value": 23237.740234375
      },
      {
        "date": "2025-06-20",
        "value": 23530.48046875
      },
      {
        "date": "2025-06-23",
        "value": 23689.130859375
      },
      {
        "date": "2025-06-24",
        "value": 24177.0703125
      },
      {
        "date": "2025-06-25",
        "value": 24474.669921875
      },
      {
        "date": "2025-06-26",
        "value": 24325.400390625
      },
      {
        "date": "2025-06-27",
        "value": 24284.150390625
      },
      {
        "date": "2025-06-30",
        "value": 24072.279296875
      },
      {
        "date": "2025-07-02",
        "value": 24221.41015625
      },
      {
        "date": "2025-07-03",
        "value": 24069.939453125
      },
      {
        "date": "2025-07-04",
        "value": 23916.060546875
      },
      {
        "date": "2025-07-07",
        "value": 23887.830078125
      },
      {
        "date": "2025-07-08",
        "value": 24148.0703125
      },
      {
        "date": "2025-07-09",
        "value": 23892.3203125
      },
      {
        "date": "2025-07-10",
        "value": 24028.369140625
      },
      {
        "date": "2025-07-11",
        "value": 24139.5703125
      },
      {
        "date": "2025-07-14",
        "value": 24203.3203125
      },
      {
        "date": "2025-07-15",
        "value": 24590.119140625
      },
      {
        "date": "2025-07-16",
        "value": 24517.759765625
      },
      {
        "date": "2025-07-17",
        "value": 24498.94921875
      },
      {
        "date": "2025-07-18",
        "value": 24825.66015625
      },
      {
        "date": "2025-07-21",
        "value": 24994.140625
      },
      {
        "date": "2025-07-22",
        "value": 25130.029296875
      },
      {
        "date": "2025-07-23",
        "value": 25538.0703125
      },
      {
        "date": "2025-07-24",
        "value": 25667.1796875
      },
      {
        "date": "2025-07-25",
        "value": 25388.349609375
      },
      {
        "date": "2025-07-28",
        "value": 25562.130859375
      },
      {
        "date": "2025-07-29",
        "value": 25524.44921875
      },
      {
        "date": "2025-07-30",
        "value": 25176.9296875
      },
      {
        "date": "2025-07-31",
        "value": 24773.330078125
      },
      {
        "date": "2025-08-01",
        "value": 24507.810546875
      },
      {
        "date": "2025-08-04",
        "value": 24733.44921875
      },
      {
        "date": "2025-08-05",
        "value": 24902.529296875
      },
      {
        "date": "2025-08-06",
        "value": 24910.630859375
      },
      {
        "date": "2025-08-07",
        "value": 25081.630859375
      },
      {
        "date": "2025-08-08",
        "value": 24858.8203125
      },
      {
        "date": "2025-08-11",
        "value": 24906.810546875
      },
      {
        "date": "2025-08-12",
        "value": 24969.6796875
      },
      {
        "date": "2025-08-13",
        "value": 25613.669921875
      },
      {
        "date": "2025-08-14",
        "value": 25519.3203125
      },
      {
        "date": "2025-08-15",
        "value": 25270.0703125
      },
      {
        "date": "2025-08-18",
        "value": 25176.849609375
      },
      {
        "date": "2025-08-19",
        "value": 25122.900390625
      },
      {
        "date": "2025-08-20",
        "value": 25165.939453125
      },
      {
        "date": "2025-08-21",
        "value": 25104.609375
      },
      {
        "date": "2025-08-22",
        "value": 25339.140625
      },
      {
        "date": "2025-08-25",
        "value": 25829.91015625
      },
      {
        "date": "2025-08-26",
        "value": 25524.919921875
      },
      {
        "date": "2025-08-27",
        "value": 25201.759765625
      },
      {
        "date": "2025-08-28",
        "value": 24998.8203125
      },
      {
        "date": "2025-08-29",
        "value": 25077.619140625
      },
      {
        "date": "2025-09-01",
        "value": 25617.419921875
      },
      {
        "date": "2025-09-02",
        "value": 25496.55078125
      },
      {
        "date": "2025-09-03",
        "value": 25343.4296875
      },
      {
        "date": "2025-09-04",
        "value": 25058.509765625
      },
      {
        "date": "2025-09-05",
        "value": 25417.98046875
      },
      {
        "date": "2025-09-08",
        "value": 25633.91015625
      },
      {
        "date": "2025-09-09",
        "value": 25938.130859375
      },
      {
        "date": "2025-09-10",
        "value": 26200.259765625
      },
      {
        "date": "2025-09-11",
        "value": 26086.3203125
      },
      {
        "date": "2025-09-12",
        "value": 26388.16015625
      },
      {
        "date": "2025-09-15",
        "value": 26446.560546875
      },
      {
        "date": "2025-09-16",
        "value": 26438.509765625
      },
      {
        "date": "2025-09-17",
        "value": 26908.390625
      },
      {
        "date": "2025-09-18",
        "value": 26544.849609375
      },
      {
        "date": "2025-09-19",
        "value": 26545.099609375
      },
      {
        "date": "2025-09-22",
        "value": 26344.140625
      },
      {
        "date": "2025-09-23",
        "value": 26159.119140625
      },
      {
        "date": "2025-09-24",
        "value": 26518.650390625
      },
      {
        "date": "2025-09-25",
        "value": 26484.6796875
      },
      {
        "date": "2025-09-26",
        "value": 26128.19921875
      },
      {
        "date": "2025-09-29",
        "value": 26622.880859375
      },
      {
        "date": "2025-09-30",
        "value": 26855.560546875
      },
      {
        "date": "2025-10-02",
        "value": 27287.119140625
      },
      {
        "date": "2025-10-03",
        "value": 27140.919921875
      },
      {
        "date": "2025-10-06",
        "value": 26957.76953125
      },
      {
        "date": "2025-10-08",
        "value": 26829.4609375
      },
      {
        "date": "2025-10-09",
        "value": 26752.58984375
      },
      {
        "date": "2025-10-10",
        "value": 26290.3203125
      },
      {
        "date": "2025-10-13",
        "value": 25889.48046875
      },
      {
        "date": "2025-10-14",
        "value": 25441.349609375
      },
      {
        "date": "2025-10-15",
        "value": 25910.599609375
      },
      {
        "date": "2025-10-16",
        "value": 25888.509765625
      },
      {
        "date": "2025-10-17",
        "value": 25247.099609375
      },
      {
        "date": "2025-10-20",
        "value": 25858.830078125
      },
      {
        "date": "2025-10-21",
        "value": 26027.55078125
      },
      {
        "date": "2025-10-22",
        "value": 25781.76953125
      },
      {
        "date": "2025-10-23",
        "value": 25967.98046875
      },
      {
        "date": "2025-10-24",
        "value": 26160.150390625
      },
      {
        "date": "2025-10-27",
        "value": 26433.69921875
      },
      {
        "date": "2025-10-28",
        "value": 26346.140625
      },
      {
        "date": "2025-10-30",
        "value": 26282.689453125
      },
      {
        "date": "2025-10-31",
        "value": 25906.650390625
      },
      {
        "date": "2025-11-03",
        "value": 26158.359375
      },
      {
        "date": "2025-11-04",
        "value": 25952.400390625
      },
      {
        "date": "2025-11-05",
        "value": 25935.41015625
      },
      {
        "date": "2025-11-06",
        "value": 26485.900390625
      },
      {
        "date": "2025-11-07",
        "value": 26241.830078125
      },
      {
        "date": "2025-11-10",
        "value": 26649.060546875
      },
      {
        "date": "2025-11-11",
        "value": 26696.41015625
      },
      {
        "date": "2025-11-12",
        "value": 26922.73046875
      },
      {
        "date": "2025-11-13",
        "value": 27073.029296875
      },
      {
        "date": "2025-11-14",
        "value": 26572.4609375
      },
      {
        "date": "2025-11-17",
        "value": 26384.279296875
      },
      {
        "date": "2025-11-18",
        "value": 25930.029296875
      },
      {
        "date": "2025-11-19",
        "value": 25830.650390625
      },
      {
        "date": "2025-11-20",
        "value": 25835.5703125
      },
      {
        "date": "2025-11-21",
        "value": 25220.01953125
      },
      {
        "date": "2025-11-24",
        "value": 25716.5
      },
      {
        "date": "2025-11-25",
        "value": 25894.55078125
      },
      {
        "date": "2025-11-26",
        "value": 25928.080078125
      },
      {
        "date": "2025-11-27",
        "value": 25945.9296875
      },
      {
        "date": "2025-11-28",
        "value": 25858.890625
      },
      {
        "date": "2025-12-01",
        "value": 26033.259765625
      },
      {
        "date": "2025-12-02",
        "value": 26095.05078125
      },
      {
        "date": "2025-12-03",
        "value": 25760.73046875
      },
      {
        "date": "2025-12-04",
        "value": 25935.900390625
      },
      {
        "date": "2025-12-05",
        "value": 26085.080078125
      },
      {
        "date": "2025-12-08",
        "value": 25765.359375
      },
      {
        "date": "2025-12-09",
        "value": 25434.23046875
      },
      {
        "date": "2025-12-10",
        "value": 25540.779296875
      },
      {
        "date": "2025-12-11",
        "value": 25530.509765625
      },
      {
        "date": "2025-12-12",
        "value": 25976.7890625
      },
      {
        "date": "2025-12-15",
        "value": 25628.880859375
      },
      {
        "date": "2025-12-16",
        "value": 25235.41015625
      },
      {
        "date": "2025-12-17",
        "value": 25468.779296875
      },
      {
        "date": "2025-12-18",
        "value": 25498.130859375
      },
      {
        "date": "2025-12-19",
        "value": 25690.529296875
      },
      {
        "date": "2025-12-22",
        "value": 25801.76953125
      },
      {
        "date": "2025-12-23",
        "value": 25774.140625
      },
      {
        "date": "2025-12-24",
        "value": 25818.9296875
      },
      {
        "date": "2025-12-29",
        "value": 25635.23046875
      },
      {
        "date": "2025-12-30",
        "value": 25854.599609375
      },
      {
        "date": "2025-12-31",
        "value": 25630.5390625
      },
      {
        "date": "2026-01-02",
        "value": 26338.470703125
      },
      {
        "date": "2026-01-05",
        "value": 26347.240234375
      },
      {
        "date": "2026-01-06",
        "value": 26710.44921875
      },
      {
        "date": "2026-01-07",
        "value": 26458.94921875
      },
      {
        "date": "2026-01-08",
        "value": 26149.310546875
      },
      {
        "date": "2026-01-09",
        "value": 26231.7890625
      },
      {
        "date": "2026-01-12",
        "value": 26608.48046875
      },
      {
        "date": "2026-01-13",
        "value": 26848.470703125
      },
      {
        "date": "2026-01-14",
        "value": 26999.810546875
      },
      {
        "date": "2026-01-15",
        "value": 26923.619140625
      },
      {
        "date": "2026-01-16",
        "value": 26844.9609375
      },
      {
        "date": "2026-01-19",
        "value": 26563.900390625
      },
      {
        "date": "2026-01-20",
        "value": 26487.509765625
      },
      {
        "date": "2026-01-21",
        "value": 26585.060546875
      },
      {
        "date": "2026-01-22",
        "value": 26629.9609375
      },
      {
        "date": "2026-01-23",
        "value": 26749.509765625
      },
      {
        "date": "2026-01-26",
        "value": 26765.51953125
      },
      {
        "date": "2026-01-27",
        "value": 27126.94921875
      },
      {
        "date": "2026-01-28",
        "value": 27826.91015625
      },
      {
        "date": "2026-01-29",
        "value": 27968.08984375
      },
      {
        "date": "2026-01-30",
        "value": 27387.109375
      },
      {
        "date": "2026-02-02",
        "value": 26775.5703125
      },
      {
        "date": "2026-02-03",
        "value": 26834.76953125
      },
      {
        "date": "2026-02-04",
        "value": 26847.3203125
      },
      {
        "date": "2026-02-05",
        "value": 26885.240234375
      },
      {
        "date": "2026-02-06",
        "value": 26559.94921875
      },
      {
        "date": "2026-02-09",
        "value": 27027.16015625
      },
      {
        "date": "2026-02-10",
        "value": 27183.150390625
      },
      {
        "date": "2026-02-11",
        "value": 27266.380859375
      },
      {
        "date": "2026-02-12",
        "value": 27032.5390625
      },
      {
        "date": "2026-02-13",
        "value": 26567.119140625
      },
      {
        "date": "2026-02-16",
        "value": 26705.939453125
      },
      {
        "date": "2026-02-20",
        "value": 26413.349609375
      },
      {
        "date": "2026-02-23",
        "value": 27081.91015625
      },
      {
        "date": "2026-02-24",
        "value": 26590.3203125
      },
      {
        "date": "2026-02-25",
        "value": 26765.720703125
      },
      {
        "date": "2026-02-26",
        "value": 26381.01953125
      },
      {
        "date": "2026-02-27",
        "value": 26630.5390625
      },
      {
        "date": "2026-03-02",
        "value": 26059.849609375
      },
      {
        "date": "2026-03-03",
        "value": 25768.080078125
      },
      {
        "date": "2026-03-04",
        "value": 25249.48046875
      },
      {
        "date": "2026-03-05",
        "value": 25321.33984375
      },
      {
        "date": "2026-03-06",
        "value": 25757.2890625
      },
      {
        "date": "2026-03-09",
        "value": 25408.4609375
      },
      {
        "date": "2026-03-10",
        "value": 25959.900390625
      },
      {
        "date": "2026-03-11",
        "value": 25898.759765625
      },
      {
        "date": "2026-03-12",
        "value": 25716.759765625
      },
      {
        "date": "2026-03-13",
        "value": 25465.599609375
      },
      {
        "date": "2026-03-16",
        "value": 25834.01953125
      },
      {
        "date": "2026-03-17",
        "value": 25868.5390625
      },
      {
        "date": "2026-03-18",
        "value": 26025.419921875
      },
      {
        "date": "2026-03-19",
        "value": 25500.580078125
      },
      {
        "date": "2026-03-20",
        "value": 25277.3203125
      },
      {
        "date": "2026-03-23",
        "value": 24382.470703125
      },
      {
        "date": "2026-03-24",
        "value": 25063.7109375
      },
      {
        "date": "2026-03-25",
        "value": 25335.94921875
      },
      {
        "date": "2026-03-26",
        "value": 24856.4296875
      },
      {
        "date": "2026-03-27",
        "value": 24951.880859375
      },
      {
        "date": "2026-03-30",
        "value": 24750.7890625
      },
      {
        "date": "2026-03-31",
        "value": 24788.140625
      },
      {
        "date": "2026-04-01",
        "value": 25294.029296875
      },
      {
        "date": "2026-04-02",
        "value": 25116.529296875
      },
      {
        "date": "2026-04-08",
        "value": 25893.01953125
      },
      {
        "date": "2026-04-09",
        "value": 25752.400390625
      },
      {
        "date": "2026-04-10",
        "value": 25893.5390625
      },
      {
        "date": "2026-04-13",
        "value": 25660.849609375
      },
      {
        "date": "2026-04-14",
        "value": 25872.3203125
      },
      {
        "date": "2026-04-15",
        "value": 25947.3203125
      },
      {
        "date": "2026-04-16",
        "value": 26394.259765625
      },
      {
        "date": "2026-04-17",
        "value": 26160.330078125
      },
      {
        "date": "2026-04-20",
        "value": 26361.0703125
      },
      {
        "date": "2026-04-21",
        "value": 26487.48046875
      },
      {
        "date": "2026-04-22",
        "value": 26163.240234375
      },
      {
        "date": "2026-04-23",
        "value": 25915.19921875
      },
      {
        "date": "2026-04-24",
        "value": 25978.0703125
      },
      {
        "date": "2026-04-27",
        "value": 25925.650390625
      },
      {
        "date": "2026-04-28",
        "value": 25679.779296875
      },
      {
        "date": "2026-04-29",
        "value": 26111.83984375
      },
      {
        "date": "2026-04-30",
        "value": 25776.529296875
      },
      {
        "date": "2026-05-04",
        "value": 26095.880859375
      },
      {
        "date": "2026-05-05",
        "value": 25898.609375
      },
      {
        "date": "2026-05-06",
        "value": 26213.779296875
      },
      {
        "date": "2026-05-07",
        "value": 26626.279296875
      },
      {
        "date": "2026-05-08",
        "value": 26393.7109375
      },
      {
        "date": "2026-05-11",
        "value": 26406.83984375
      },
      {
        "date": "2026-05-12",
        "value": 26347.91015625
      },
      {
        "date": "2026-05-13",
        "value": 26388.439453125
      },
      {
        "date": "2026-05-14",
        "value": 26389.0390625
      },
      {
        "date": "2026-05-15",
        "value": 25962.73046875
      },
      {
        "date": "2026-05-18",
        "value": 25675.1796875
      },
      {
        "date": "2026-05-19",
        "value": 25797.849609375
      },
      {
        "date": "2026-05-20",
        "value": 25651.119140625
      },
      {
        "date": "2026-05-21",
        "value": 25386.51953125
      },
      {
        "date": "2026-05-22",
        "value": 25606.029296875
      },
      {
        "date": "2026-05-26",
        "value": 25599.44921875
      },
      {
        "date": "2026-05-27",
        "value": 25328.23046875
      },
      {
        "date": "2026-05-28",
        "value": 25006.16015625
      },
      {
        "date": "2026-05-29",
        "value": 25182.390625
      },
      {
        "date": "2026-06-01",
        "value": 25398.1796875
      },
      {
        "date": "2026-06-02",
        "value": 26038.3203125
      },
      {
        "date": "2026-06-03",
        "value": 25633.2109375
      },
      {
        "date": "2026-06-04",
        "value": 25253.400390625
      },
      {
        "date": "2026-06-05",
        "value": 24961.94921875
      },
      {
        "date": "2026-06-08",
        "value": 24657.060546875
      },
      {
        "date": "2026-06-09",
        "value": 24565.900390625
      },
      {
        "date": "2026-06-10",
        "value": 24407.9609375
      },
      {
        "date": "2026-06-11",
        "value": 24249.2890625
      },
      {
        "date": "2026-06-12",
        "value": 24718.099609375
      },
      {
        "date": "2026-06-15",
        "value": 24842.669921875
      },
      {
        "date": "2026-06-16",
        "value": 24493.94921875
      },
      {
        "date": "2026-06-17",
        "value": 24312.16015625
      },
      {
        "date": "2026-06-18",
        "value": 23924.810546875
      },
      {
        "date": "2026-06-22",
        "value": 23768.51953125
      },
      {
        "date": "2026-06-23",
        "value": 23336.279296875
      },
      {
        "date": "2026-06-24",
        "value": 23412.1796875
      },
      {
        "date": "2026-06-25",
        "value": 23076.91015625
      },
      {
        "date": "2026-06-26",
        "value": 22671.859375
      },
      {
        "date": "2026-06-29",
        "value": 23026.6796875
      },
      {
        "date": "2026-06-30",
        "value": 22881.01953125
      },
      {
        "date": "2026-07-02",
        "value": 23055.029296875
      },
      {
        "date": "2026-07-03",
        "value": 23350.029296875
      },
      {
        "date": "2026-07-06",
        "value": 23616.3203125
      },
      {
        "date": "2026-07-07",
        "value": 23496.890625
      },
      {
        "date": "2026-07-08",
        "value": 24199.4609375
      },
      {
        "date": "2026-07-09",
        "value": 24030.1796875
      },
      {
        "date": "2026-07-10",
        "value": 24175.119140625
      },
      {
        "date": "2026-07-13",
        "value": 24213.720703125
      }
    ],
    "gold_world": [
      {
        "date": "2024-12-09",
        "value": 2664.89990234375
      },
      {
        "date": "2024-12-10",
        "value": 2697.60009765625
      },
      {
        "date": "2024-12-11",
        "value": 2733.800048828125
      },
      {
        "date": "2024-12-12",
        "value": 2687.5
      },
      {
        "date": "2024-12-13",
        "value": 2656.0
      },
      {
        "date": "2024-12-16",
        "value": 2651.39990234375
      },
      {
        "date": "2024-12-17",
        "value": 2644.39990234375
      },
      {
        "date": "2024-12-18",
        "value": 2636.5
      },
      {
        "date": "2024-12-19",
        "value": 2592.199951171875
      },
      {
        "date": "2024-12-20",
        "value": 2628.699951171875
      },
      {
        "date": "2024-12-23",
        "value": 2612.300048828125
      },
      {
        "date": "2024-12-24",
        "value": 2620.0
      },
      {
        "date": "2024-12-26",
        "value": 2638.800048828125
      },
      {
        "date": "2024-12-27",
        "value": 2617.199951171875
      },
      {
        "date": "2024-12-30",
        "value": 2606.10009765625
      },
      {
        "date": "2024-12-31",
        "value": 2629.199951171875
      },
      {
        "date": "2025-01-02",
        "value": 2658.89990234375
      },
      {
        "date": "2025-01-03",
        "value": 2645.0
      },
      {
        "date": "2025-01-06",
        "value": 2638.39990234375
      },
      {
        "date": "2025-01-07",
        "value": 2656.699951171875
      },
      {
        "date": "2025-01-08",
        "value": 2664.5
      },
      {
        "date": "2025-01-09",
        "value": 2683.800048828125
      },
      {
        "date": "2025-01-10",
        "value": 2708.5
      },
      {
        "date": "2025-01-13",
        "value": 2673.5
      },
      {
        "date": "2025-01-14",
        "value": 2677.5
      },
      {
        "date": "2025-01-15",
        "value": 2712.5
      },
      {
        "date": "2025-01-16",
        "value": 2746.39990234375
      },
      {
        "date": "2025-01-17",
        "value": 2744.300048828125
      },
      {
        "date": "2025-01-21",
        "value": 2755.0
      },
      {
        "date": "2025-01-22",
        "value": 2767.60009765625
      },
      {
        "date": "2025-01-23",
        "value": 2763.10009765625
      },
      {
        "date": "2025-01-24",
        "value": 2777.300048828125
      },
      {
        "date": "2025-01-27",
        "value": 2737.5
      },
      {
        "date": "2025-01-28",
        "value": 2766.800048828125
      },
      {
        "date": "2025-01-29",
        "value": 2769.10009765625
      },
      {
        "date": "2025-01-30",
        "value": 2823.0
      },
      {
        "date": "2025-01-31",
        "value": 2812.5
      },
      {
        "date": "2025-02-03",
        "value": 2833.89990234375
      },
      {
        "date": "2025-02-04",
        "value": 2853.300048828125
      },
      {
        "date": "2025-02-05",
        "value": 2871.60009765625
      },
      {
        "date": "2025-02-06",
        "value": 2856.0
      },
      {
        "date": "2025-02-07",
        "value": 2867.300048828125
      },
      {
        "date": "2025-02-10",
        "value": 2914.300048828125
      },
      {
        "date": "2025-02-11",
        "value": 2912.5
      },
      {
        "date": "2025-02-12",
        "value": 2909.0
      },
      {
        "date": "2025-02-13",
        "value": 2925.89990234375
      },
      {
        "date": "2025-02-14",
        "value": 2883.60009765625
      },
      {
        "date": "2025-02-18",
        "value": 2931.60009765625
      },
      {
        "date": "2025-02-19",
        "value": 2919.39990234375
      },
      {
        "date": "2025-02-20",
        "value": 2940.0
      },
      {
        "date": "2025-02-21",
        "value": 2937.60009765625
      },
      {
        "date": "2025-02-24",
        "value": 2947.89990234375
      },
      {
        "date": "2025-02-25",
        "value": 2904.5
      },
      {
        "date": "2025-02-26",
        "value": 2916.800048828125
      },
      {
        "date": "2025-02-27",
        "value": 2883.199951171875
      },
      {
        "date": "2025-02-28",
        "value": 2836.800048828125
      },
      {
        "date": "2025-03-03",
        "value": 2890.199951171875
      },
      {
        "date": "2025-03-04",
        "value": 2909.60009765625
      },
      {
        "date": "2025-03-05",
        "value": 2915.300048828125
      },
      {
        "date": "2025-03-06",
        "value": 2916.60009765625
      },
      {
        "date": "2025-03-07",
        "value": 2904.699951171875
      },
      {
        "date": "2025-03-10",
        "value": 2891.0
      },
      {
        "date": "2025-03-11",
        "value": 2912.89990234375
      },
      {
        "date": "2025-03-12",
        "value": 2939.10009765625
      },
      {
        "date": "2025-03-13",
        "value": 2984.300048828125
      },
      {
        "date": "2025-03-14",
        "value": 2994.5
      },
      {
        "date": "2025-03-17",
        "value": 3000.0
      },
      {
        "date": "2025-03-18",
        "value": 3035.10009765625
      },
      {
        "date": "2025-03-19",
        "value": 3035.89990234375
      },
      {
        "date": "2025-03-20",
        "value": 3040.0
      },
      {
        "date": "2025-03-21",
        "value": 3018.199951171875
      },
      {
        "date": "2025-03-24",
        "value": 3013.10009765625
      },
      {
        "date": "2025-03-25",
        "value": 3023.699951171875
      },
      {
        "date": "2025-03-26",
        "value": 3020.89990234375
      },
      {
        "date": "2025-03-27",
        "value": 3060.199951171875
      },
      {
        "date": "2025-03-28",
        "value": 3086.5
      },
      {
        "date": "2025-03-31",
        "value": 3122.800048828125
      },
      {
        "date": "2025-04-01",
        "value": 3118.89990234375
      },
      {
        "date": "2025-04-02",
        "value": 3139.89990234375
      },
      {
        "date": "2025-04-03",
        "value": 3097.0
      },
      {
        "date": "2025-04-04",
        "value": 3012.0
      },
      {
        "date": "2025-04-07",
        "value": 2951.300048828125
      },
      {
        "date": "2025-04-08",
        "value": 2968.39990234375
      },
      {
        "date": "2025-04-09",
        "value": 3056.5
      },
      {
        "date": "2025-04-10",
        "value": 3155.199951171875
      },
      {
        "date": "2025-04-11",
        "value": 3222.199951171875
      },
      {
        "date": "2025-04-14",
        "value": 3204.800048828125
      },
      {
        "date": "2025-04-15",
        "value": 3218.699951171875
      },
      {
        "date": "2025-04-16",
        "value": 3326.60009765625
      },
      {
        "date": "2025-04-17",
        "value": 3308.699951171875
      },
      {
        "date": "2025-04-21",
        "value": 3406.199951171875
      },
      {
        "date": "2025-04-22",
        "value": 3400.800048828125
      },
      {
        "date": "2025-04-23",
        "value": 3276.300048828125
      },
      {
        "date": "2025-04-24",
        "value": 3332.0
      },
      {
        "date": "2025-04-25",
        "value": 3282.39990234375
      },
      {
        "date": "2025-04-28",
        "value": 3332.5
      },
      {
        "date": "2025-04-29",
        "value": 3318.800048828125
      },
      {
        "date": "2025-04-30",
        "value": 3305.0
      },
      {
        "date": "2025-05-01",
        "value": 3210.0
      },
      {
        "date": "2025-05-02",
        "value": 3231.89990234375
      },
      {
        "date": "2025-05-05",
        "value": 3311.300048828125
      },
      {
        "date": "2025-05-06",
        "value": 3411.39990234375
      },
      {
        "date": "2025-05-07",
        "value": 3381.39990234375
      },
      {
        "date": "2025-05-08",
        "value": 3296.60009765625
      },
      {
        "date": "2025-05-09",
        "value": 3335.39990234375
      },
      {
        "date": "2025-05-12",
        "value": 3220.0
      },
      {
        "date": "2025-05-13",
        "value": 3240.300048828125
      },
      {
        "date": "2025-05-14",
        "value": 3181.39990234375
      },
      {
        "date": "2025-05-15",
        "value": 3220.699951171875
      },
      {
        "date": "2025-05-16",
        "value": 3182.0
      },
      {
        "date": "2025-05-19",
        "value": 3228.89990234375
      },
      {
        "date": "2025-05-20",
        "value": 3280.300048828125
      },
      {
        "date": "2025-05-21",
        "value": 3309.300048828125
      },
      {
        "date": "2025-05-22",
        "value": 3292.300048828125
      },
      {
        "date": "2025-05-23",
        "value": 3363.60009765625
      },
      {
        "date": "2025-05-27",
        "value": 3299.10009765625
      },
      {
        "date": "2025-05-28",
        "value": 3293.60009765625
      },
      {
        "date": "2025-05-29",
        "value": 3317.10009765625
      },
      {
        "date": "2025-05-30",
        "value": 3288.89990234375
      },
      {
        "date": "2025-06-02",
        "value": 3370.60009765625
      },
      {
        "date": "2025-06-03",
        "value": 3350.199951171875
      },
      {
        "date": "2025-06-04",
        "value": 3373.5
      },
      {
        "date": "2025-06-05",
        "value": 3350.699951171875
      },
      {
        "date": "2025-06-06",
        "value": 3322.699951171875
      },
      {
        "date": "2025-06-09",
        "value": 3332.10009765625
      },
      {
        "date": "2025-06-10",
        "value": 3320.89990234375
      },
      {
        "date": "2025-06-11",
        "value": 3321.300048828125
      },
      {
        "date": "2025-06-12",
        "value": 3380.89990234375
      },
      {
        "date": "2025-06-13",
        "value": 3431.199951171875
      },
      {
        "date": "2025-06-16",
        "value": 3396.39990234375
      },
      {
        "date": "2025-06-17",
        "value": 3386.60009765625
      },
      {
        "date": "2025-06-18",
        "value": 3389.800048828125
      },
      {
        "date": "2025-06-20",
        "value": 3368.10009765625
      },
      {
        "date": "2025-06-23",
        "value": 3377.699951171875
      },
      {
        "date": "2025-06-24",
        "value": 3317.39990234375
      },
      {
        "date": "2025-06-25",
        "value": 3327.10009765625
      },
      {
        "date": "2025-06-26",
        "value": 3333.5
      },
      {
        "date": "2025-06-27",
        "value": 3273.699951171875
      },
      {
        "date": "2025-06-30",
        "value": 3294.39990234375
      },
      {
        "date": "2025-07-01",
        "value": 3336.699951171875
      },
      {
        "date": "2025-07-02",
        "value": 3348.0
      },
      {
        "date": "2025-07-03",
        "value": 3331.60009765625
      },
      {
        "date": "2025-07-04",
        "value": 3332.5
      },
      {
        "date": "2025-07-07",
        "value": 3332.199951171875
      },
      {
        "date": "2025-07-08",
        "value": 3307.0
      },
      {
        "date": "2025-07-09",
        "value": 3311.60009765625
      },
      {
        "date": "2025-07-10",
        "value": 3317.39990234375
      },
      {
        "date": "2025-07-11",
        "value": 3356.0
      },
      {
        "date": "2025-07-14",
        "value": 3351.5
      },
      {
        "date": "2025-07-15",
        "value": 3329.800048828125
      },
      {
        "date": "2025-07-16",
        "value": 3352.5
      },
      {
        "date": "2025-07-17",
        "value": 3340.10009765625
      },
      {
        "date": "2025-07-18",
        "value": 3353.0
      },
      {
        "date": "2025-07-21",
        "value": 3401.89990234375
      },
      {
        "date": "2025-07-22",
        "value": 3439.199951171875
      },
      {
        "date": "2025-07-23",
        "value": 3394.10009765625
      },
      {
        "date": "2025-07-24",
        "value": 3371.0
      },
      {
        "date": "2025-07-25",
        "value": 3334.0
      },
      {
        "date": "2025-07-28",
        "value": 3309.10009765625
      },
      {
        "date": "2025-07-29",
        "value": 3323.39990234375
      },
      {
        "date": "2025-07-30",
        "value": 3295.800048828125
      },
      {
        "date": "2025-07-31",
        "value": 3293.199951171875
      },
      {
        "date": "2025-08-01",
        "value": 3347.699951171875
      },
      {
        "date": "2025-08-04",
        "value": 3374.39990234375
      },
      {
        "date": "2025-08-05",
        "value": 3381.89990234375
      },
      {
        "date": "2025-08-06",
        "value": 3380.0
      },
      {
        "date": "2025-08-07",
        "value": 3400.300048828125
      },
      {
        "date": "2025-08-08",
        "value": 3439.10009765625
      },
      {
        "date": "2025-08-11",
        "value": 3353.10009765625
      },
      {
        "date": "2025-08-12",
        "value": 3348.89990234375
      },
      {
        "date": "2025-08-13",
        "value": 3358.699951171875
      },
      {
        "date": "2025-08-14",
        "value": 3335.199951171875
      },
      {
        "date": "2025-08-15",
        "value": 3336.0
      },
      {
        "date": "2025-08-18",
        "value": 3331.699951171875
      },
      {
        "date": "2025-08-19",
        "value": 3313.39990234375
      },
      {
        "date": "2025-08-20",
        "value": 3343.39990234375
      },
      {
        "date": "2025-08-21",
        "value": 3336.89990234375
      },
      {
        "date": "2025-08-22",
        "value": 3374.39990234375
      },
      {
        "date": "2025-08-25",
        "value": 3373.800048828125
      },
      {
        "date": "2025-08-26",
        "value": 3388.60009765625
      },
      {
        "date": "2025-08-27",
        "value": 3404.60009765625
      },
      {
        "date": "2025-08-28",
        "value": 3431.800048828125
      },
      {
        "date": "2025-08-29",
        "value": 3473.699951171875
      },
      {
        "date": "2025-09-02",
        "value": 3549.39990234375
      },
      {
        "date": "2025-09-03",
        "value": 3593.199951171875
      },
      {
        "date": "2025-09-04",
        "value": 3565.800048828125
      },
      {
        "date": "2025-09-05",
        "value": 3613.199951171875
      },
      {
        "date": "2025-09-08",
        "value": 3638.10009765625
      },
      {
        "date": "2025-09-09",
        "value": 3643.300048828125
      },
      {
        "date": "2025-09-10",
        "value": 3643.60009765625
      },
      {
        "date": "2025-09-11",
        "value": 3636.89990234375
      },
      {
        "date": "2025-09-12",
        "value": 3649.39990234375
      },
      {
        "date": "2025-09-15",
        "value": 3682.199951171875
      },
      {
        "date": "2025-09-16",
        "value": 3688.89990234375
      },
      {
        "date": "2025-09-17",
        "value": 3681.800048828125
      },
      {
        "date": "2025-09-18",
        "value": 3643.699951171875
      },
      {
        "date": "2025-09-19",
        "value": 3671.5
      },
      {
        "date": "2025-09-22",
        "value": 3740.699951171875
      },
      {
        "date": "2025-09-23",
        "value": 3780.60009765625
      },
      {
        "date": "2025-09-24",
        "value": 3732.10009765625
      },
      {
        "date": "2025-09-25",
        "value": 3736.89990234375
      },
      {
        "date": "2025-09-26",
        "value": 3775.300048828125
      },
      {
        "date": "2025-09-29",
        "value": 3820.89990234375
      },
      {
        "date": "2025-09-30",
        "value": 3840.800048828125
      },
      {
        "date": "2025-10-01",
        "value": 3867.5
      },
      {
        "date": "2025-10-02",
        "value": 3839.699951171875
      },
      {
        "date": "2025-10-03",
        "value": 3880.800048828125
      },
      {
        "date": "2025-10-06",
        "value": 3948.5
      },
      {
        "date": "2025-10-07",
        "value": 3976.60009765625
      },
      {
        "date": "2025-10-08",
        "value": 4043.300048828125
      },
      {
        "date": "2025-10-09",
        "value": 3946.300048828125
      },
      {
        "date": "2025-10-10",
        "value": 3975.89990234375
      },
      {
        "date": "2025-10-13",
        "value": 4108.60009765625
      },
      {
        "date": "2025-10-14",
        "value": 4138.7001953125
      },
      {
        "date": "2025-10-15",
        "value": 4176.89990234375
      },
      {
        "date": "2025-10-16",
        "value": 4280.2001953125
      },
      {
        "date": "2025-10-17",
        "value": 4189.89990234375
      },
      {
        "date": "2025-10-20",
        "value": 4336.39990234375
      },
      {
        "date": "2025-10-21",
        "value": 4087.699951171875
      },
      {
        "date": "2025-10-22",
        "value": 4044.39990234375
      },
      {
        "date": "2025-10-23",
        "value": 4125.5
      },
      {
        "date": "2025-10-24",
        "value": 4118.39990234375
      },
      {
        "date": "2025-10-27",
        "value": 4001.89990234375
      },
      {
        "date": "2025-10-28",
        "value": 3966.199951171875
      },
      {
        "date": "2025-10-29",
        "value": 3983.699951171875
      },
      {
        "date": "2025-10-30",
        "value": 4001.300048828125
      },
      {
        "date": "2025-10-31",
        "value": 3982.199951171875
      },
      {
        "date": "2025-11-03",
        "value": 4000.300048828125
      },
      {
        "date": "2025-11-04",
        "value": 3947.699951171875
      },
      {
        "date": "2025-11-05",
        "value": 3980.300048828125
      },
      {
        "date": "2025-11-06",
        "value": 3979.89990234375
      },
      {
        "date": "2025-11-07",
        "value": 3999.39990234375
      },
      {
        "date": "2025-11-10",
        "value": 4111.7998046875
      },
      {
        "date": "2025-11-11",
        "value": 4106.7998046875
      },
      {
        "date": "2025-11-12",
        "value": 4204.39990234375
      },
      {
        "date": "2025-11-13",
        "value": 4186.89990234375
      },
      {
        "date": "2025-11-14",
        "value": 4087.60009765625
      },
      {
        "date": "2025-11-17",
        "value": 4068.300048828125
      },
      {
        "date": "2025-11-18",
        "value": 4061.300048828125
      },
      {
        "date": "2025-11-19",
        "value": 4077.699951171875
      },
      {
        "date": "2025-11-20",
        "value": 4056.5
      },
      {
        "date": "2025-11-21",
        "value": 4076.699951171875
      },
      {
        "date": "2025-11-24",
        "value": 4091.89990234375
      },
      {
        "date": "2025-11-25",
        "value": 4139.2001953125
      },
      {
        "date": "2025-11-26",
        "value": 4165.2001953125
      },
      {
        "date": "2025-11-28",
        "value": 4218.2998046875
      },
      {
        "date": "2025-12-01",
        "value": 4239.2998046875
      },
      {
        "date": "2025-12-02",
        "value": 4186.60009765625
      },
      {
        "date": "2025-12-03",
        "value": 4199.2998046875
      },
      {
        "date": "2025-12-04",
        "value": 4211.7998046875
      },
      {
        "date": "2025-12-05",
        "value": 4212.89990234375
      },
      {
        "date": "2025-12-08",
        "value": 4187.2001953125
      },
      {
        "date": "2025-12-09",
        "value": 4206.7001953125
      },
      {
        "date": "2025-12-10",
        "value": 4196.39990234375
      },
      {
        "date": "2025-12-11",
        "value": 4285.5
      },
      {
        "date": "2025-12-12",
        "value": 4300.10009765625
      },
      {
        "date": "2025-12-15",
        "value": 4306.7001953125
      },
      {
        "date": "2025-12-16",
        "value": 4304.5
      },
      {
        "date": "2025-12-17",
        "value": 4347.5
      },
      {
        "date": "2025-12-18",
        "value": 4339.5
      },
      {
        "date": "2025-12-19",
        "value": 4361.39990234375
      },
      {
        "date": "2025-12-22",
        "value": 4444.60009765625
      },
      {
        "date": "2025-12-23",
        "value": 4482.7998046875
      },
      {
        "date": "2025-12-24",
        "value": 4480.60009765625
      },
      {
        "date": "2025-12-26",
        "value": 4529.10009765625
      },
      {
        "date": "2025-12-29",
        "value": 4325.10009765625
      },
      {
        "date": "2025-12-30",
        "value": 4370.10009765625
      },
      {
        "date": "2025-12-31",
        "value": 4325.60009765625
      },
      {
        "date": "2026-01-02",
        "value": 4314.39990234375
      },
      {
        "date": "2026-01-05",
        "value": 4436.89990234375
      },
      {
        "date": "2026-01-06",
        "value": 4482.2001953125
      },
      {
        "date": "2026-01-07",
        "value": 4449.2998046875
      },
      {
        "date": "2026-01-08",
        "value": 4449.7001953125
      },
      {
        "date": "2026-01-09",
        "value": 4490.2998046875
      },
      {
        "date": "2026-01-12",
        "value": 4604.2998046875
      },
      {
        "date": "2026-01-13",
        "value": 4589.2001953125
      },
      {
        "date": "2026-01-14",
        "value": 4626.2998046875
      },
      {
        "date": "2026-01-15",
        "value": 4616.2998046875
      },
      {
        "date": "2026-01-16",
        "value": 4588.39990234375
      },
      {
        "date": "2026-01-20",
        "value": 4759.60009765625
      },
      {
        "date": "2026-01-21",
        "value": 4831.7998046875
      },
      {
        "date": "2026-01-22",
        "value": 4908.7998046875
      },
      {
        "date": "2026-01-23",
        "value": 4976.2001953125
      },
      {
        "date": "2026-01-26",
        "value": 5079.7001953125
      },
      {
        "date": "2026-01-27",
        "value": 5079.89990234375
      },
      {
        "date": "2026-01-28",
        "value": 5301.60009765625
      },
      {
        "date": "2026-01-29",
        "value": 5318.39990234375
      },
      {
        "date": "2026-01-30",
        "value": 4713.89990234375
      },
      {
        "date": "2026-02-02",
        "value": 4622.5
      },
      {
        "date": "2026-02-03",
        "value": 4903.7001953125
      },
      {
        "date": "2026-02-04",
        "value": 4920.39990234375
      },
      {
        "date": "2026-02-05",
        "value": 4861.39990234375
      },
      {
        "date": "2026-02-06",
        "value": 4951.2001953125
      },
      {
        "date": "2026-02-09",
        "value": 5050.89990234375
      },
      {
        "date": "2026-02-10",
        "value": 5003.7998046875
      },
      {
        "date": "2026-02-11",
        "value": 5071.60009765625
      },
      {
        "date": "2026-02-12",
        "value": 4923.7001953125
      },
      {
        "date": "2026-02-13",
        "value": 5022.0
      },
      {
        "date": "2026-02-17",
        "value": 4882.89990234375
      },
      {
        "date": "2026-02-18",
        "value": 4986.5
      },
      {
        "date": "2026-02-19",
        "value": 4975.89990234375
      },
      {
        "date": "2026-02-20",
        "value": 5059.2998046875
      },
      {
        "date": "2026-02-23",
        "value": 5204.7001953125
      },
      {
        "date": "2026-02-24",
        "value": 5155.7998046875
      },
      {
        "date": "2026-02-25",
        "value": 5206.39990234375
      },
      {
        "date": "2026-02-26",
        "value": 5176.5
      },
      {
        "date": "2026-02-27",
        "value": 5230.5
      },
      {
        "date": "2026-03-02",
        "value": 5294.39990234375
      },
      {
        "date": "2026-03-03",
        "value": 5107.39990234375
      },
      {
        "date": "2026-03-04",
        "value": 5120.2001953125
      },
      {
        "date": "2026-03-05",
        "value": 5065.2998046875
      },
      {
        "date": "2026-03-06",
        "value": 5146.10009765625
      },
      {
        "date": "2026-03-09",
        "value": 5091.5
      },
      {
        "date": "2026-03-10",
        "value": 5229.7001953125
      },
      {
        "date": "2026-03-11",
        "value": 5167.39990234375
      },
      {
        "date": "2026-03-12",
        "value": 5115.7998046875
      },
      {
        "date": "2026-03-13",
        "value": 5052.5
      },
      {
        "date": "2026-03-16",
        "value": 4994.0
      },
      {
        "date": "2026-03-17",
        "value": 5001.0
      },
      {
        "date": "2026-03-18",
        "value": 4889.89990234375
      },
      {
        "date": "2026-03-19",
        "value": 4600.7001953125
      },
      {
        "date": "2026-03-20",
        "value": 4570.39990234375
      },
      {
        "date": "2026-03-23",
        "value": 4404.10009765625
      },
      {
        "date": "2026-03-24",
        "value": 4399.2998046875
      },
      {
        "date": "2026-03-25",
        "value": 4549.7998046875
      },
      {
        "date": "2026-03-26",
        "value": 4375.5
      },
      {
        "date": "2026-03-27",
        "value": 4492.0
      },
      {
        "date": "2026-03-30",
        "value": 4526.0
      },
      {
        "date": "2026-03-31",
        "value": 4647.60009765625
      },
      {
        "date": "2026-04-01",
        "value": 4783.2001953125
      },
      {
        "date": "2026-04-02",
        "value": 4651.5
      },
      {
        "date": "2026-04-06",
        "value": 4656.7998046875
      },
      {
        "date": "2026-04-07",
        "value": 4657.10009765625
      },
      {
        "date": "2026-04-08",
        "value": 4749.5
      },
      {
        "date": "2026-04-09",
        "value": 4792.2001953125
      },
      {
        "date": "2026-04-10",
        "value": 4761.89990234375
      },
      {
        "date": "2026-04-13",
        "value": 4742.39990234375
      },
      {
        "date": "2026-04-14",
        "value": 4825.0
      },
      {
        "date": "2026-04-15",
        "value": 4800.0
      },
      {
        "date": "2026-04-16",
        "value": 4785.39990234375
      },
      {
        "date": "2026-04-17",
        "value": 4857.60009765625
      },
      {
        "date": "2026-04-20",
        "value": 4806.60009765625
      },
      {
        "date": "2026-04-21",
        "value": 4698.39990234375
      },
      {
        "date": "2026-04-22",
        "value": 4732.5
      },
      {
        "date": "2026-04-23",
        "value": 4705.10009765625
      },
      {
        "date": "2026-04-24",
        "value": 4722.2998046875
      },
      {
        "date": "2026-04-27",
        "value": 4675.39990234375
      },
      {
        "date": "2026-04-28",
        "value": 4591.5
      },
      {
        "date": "2026-04-29",
        "value": 4545.2001953125
      },
      {
        "date": "2026-04-30",
        "value": 4614.7001953125
      },
      {
        "date": "2026-05-01",
        "value": 4629.89990234375
      },
      {
        "date": "2026-05-04",
        "value": 4519.5
      },
      {
        "date": "2026-05-05",
        "value": 4555.7998046875
      },
      {
        "date": "2026-05-06",
        "value": 4681.89990234375
      },
      {
        "date": "2026-05-07",
        "value": 4699.7998046875
      },
      {
        "date": "2026-05-08",
        "value": 4720.39990234375
      },
      {
        "date": "2026-05-11",
        "value": 4718.7001953125
      },
      {
        "date": "2026-05-12",
        "value": 4677.60009765625
      },
      {
        "date": "2026-05-13",
        "value": 4697.7001953125
      },
      {
        "date": "2026-05-14",
        "value": 4678.10009765625
      },
      {
        "date": "2026-05-15",
        "value": 4555.7998046875
      },
      {
        "date": "2026-05-18",
        "value": 4552.5
      },
      {
        "date": "2026-05-19",
        "value": 4506.2998046875
      },
      {
        "date": "2026-05-20",
        "value": 4531.2998046875
      },
      {
        "date": "2026-05-21",
        "value": 4539.7998046875
      },
      {
        "date": "2026-05-22",
        "value": 4521.0
      },
      {
        "date": "2026-05-26",
        "value": 4500.39990234375
      },
      {
        "date": "2026-05-27",
        "value": 4447.5
      },
      {
        "date": "2026-05-28",
        "value": 4499.2998046875
      },
      {
        "date": "2026-05-29",
        "value": 4560.5
      },
      {
        "date": "2026-06-01",
        "value": 4475.2001953125
      },
      {
        "date": "2026-06-02",
        "value": 4489.10009765625
      },
      {
        "date": "2026-06-03",
        "value": 4436.7001953125
      },
      {
        "date": "2026-06-04",
        "value": 4475.7998046875
      },
      {
        "date": "2026-06-05",
        "value": 4337.10009765625
      },
      {
        "date": "2026-06-08",
        "value": 4335.89990234375
      },
      {
        "date": "2026-06-09",
        "value": 4260.0
      },
      {
        "date": "2026-06-10",
        "value": 4108.2001953125
      },
      {
        "date": "2026-06-11",
        "value": 4090.300048828125
      },
      {
        "date": "2026-06-12",
        "value": 4215.0
      },
      {
        "date": "2026-06-15",
        "value": 4328.0
      },
      {
        "date": "2026-06-16",
        "value": 4330.89990234375
      },
      {
        "date": "2026-06-17",
        "value": 4358.89990234375
      },
      {
        "date": "2026-06-18",
        "value": 4224.10009765625
      },
      {
        "date": "2026-06-22",
        "value": 4181.89990234375
      },
      {
        "date": "2026-06-23",
        "value": 4129.89990234375
      },
      {
        "date": "2026-06-24",
        "value": 3990.300048828125
      },
      {
        "date": "2026-06-25",
        "value": 4030.5
      },
      {
        "date": "2026-06-26",
        "value": 4078.699951171875
      },
      {
        "date": "2026-06-29",
        "value": 4022.300048828125
      },
      {
        "date": "2026-06-30",
        "value": 4022.89990234375
      },
      {
        "date": "2026-07-01",
        "value": 4068.300048828125
      },
      {
        "date": "2026-07-02",
        "value": 4112.7001953125
      },
      {
        "date": "2026-07-06",
        "value": 4155.10009765625
      },
      {
        "date": "2026-07-07",
        "value": 4145.2998046875
      },
      {
        "date": "2026-07-08",
        "value": 4070.89990234375
      },
      {
        "date": "2026-07-09",
        "value": 4130.60009765625
      },
      {
        "date": "2026-07-10",
        "value": 4104.10009765625
      },
      {
        "date": "2026-07-13",
        "value": 3997.0
      },
      {
        "date": "2026-07-14",
        "value": 4060.60009765625
      }
    ],
    "brent": [
      {
        "date": "2024-12-09",
        "value": 72.13999938964844
      },
      {
        "date": "2024-12-10",
        "value": 72.19000244140625
      },
      {
        "date": "2024-12-11",
        "value": 73.5199966430664
      },
      {
        "date": "2024-12-12",
        "value": 73.41000366210938
      },
      {
        "date": "2024-12-13",
        "value": 74.48999786376953
      },
      {
        "date": "2024-12-16",
        "value": 73.91000366210938
      },
      {
        "date": "2024-12-17",
        "value": 73.19000244140625
      },
      {
        "date": "2024-12-18",
        "value": 73.38999938964844
      },
      {
        "date": "2024-12-19",
        "value": 72.87999725341797
      },
      {
        "date": "2024-12-20",
        "value": 72.94000244140625
      },
      {
        "date": "2024-12-23",
        "value": 72.62999725341797
      },
      {
        "date": "2024-12-24",
        "value": 73.58000183105469
      },
      {
        "date": "2024-12-26",
        "value": 73.26000213623047
      },
      {
        "date": "2024-12-27",
        "value": 74.16999816894531
      },
      {
        "date": "2024-12-30",
        "value": 74.38999938964844
      },
      {
        "date": "2024-12-31",
        "value": 74.63999938964844
      },
      {
        "date": "2025-01-02",
        "value": 75.93000030517578
      },
      {
        "date": "2025-01-03",
        "value": 76.51000213623047
      },
      {
        "date": "2025-01-06",
        "value": 76.30000305175781
      },
      {
        "date": "2025-01-07",
        "value": 77.05000305175781
      },
      {
        "date": "2025-01-08",
        "value": 76.16000366210938
      },
      {
        "date": "2025-01-09",
        "value": 76.91999816894531
      },
      {
        "date": "2025-01-10",
        "value": 79.76000213623047
      },
      {
        "date": "2025-01-13",
        "value": 81.01000213623047
      },
      {
        "date": "2025-01-14",
        "value": 79.91999816894531
      },
      {
        "date": "2025-01-15",
        "value": 82.02999877929688
      },
      {
        "date": "2025-01-16",
        "value": 81.29000091552734
      },
      {
        "date": "2025-01-17",
        "value": 80.79000091552734
      },
      {
        "date": "2025-01-21",
        "value": 79.29000091552734
      },
      {
        "date": "2025-01-22",
        "value": 79.0
      },
      {
        "date": "2025-01-23",
        "value": 78.29000091552734
      },
      {
        "date": "2025-01-24",
        "value": 78.5
      },
      {
        "date": "2025-01-27",
        "value": 77.08000183105469
      },
      {
        "date": "2025-01-28",
        "value": 77.48999786376953
      },
      {
        "date": "2025-01-29",
        "value": 76.58000183105469
      },
      {
        "date": "2025-01-30",
        "value": 76.87000274658203
      },
      {
        "date": "2025-01-31",
        "value": 76.76000213623047
      },
      {
        "date": "2025-02-03",
        "value": 75.95999908447266
      },
      {
        "date": "2025-02-04",
        "value": 76.19999694824219
      },
      {
        "date": "2025-02-05",
        "value": 74.61000061035156
      },
      {
        "date": "2025-02-06",
        "value": 74.29000091552734
      },
      {
        "date": "2025-02-07",
        "value": 74.66000366210938
      },
      {
        "date": "2025-02-10",
        "value": 75.87000274658203
      },
      {
        "date": "2025-02-11",
        "value": 77.0
      },
      {
        "date": "2025-02-12",
        "value": 75.18000030517578
      },
      {
        "date": "2025-02-13",
        "value": 75.0199966430664
      },
      {
        "date": "2025-02-14",
        "value": 74.73999786376953
      },
      {
        "date": "2025-02-18",
        "value": 75.83999633789062
      },
      {
        "date": "2025-02-19",
        "value": 76.04000091552734
      },
      {
        "date": "2025-02-20",
        "value": 76.4800033569336
      },
      {
        "date": "2025-02-21",
        "value": 74.43000030517578
      },
      {
        "date": "2025-02-24",
        "value": 74.77999877929688
      },
      {
        "date": "2025-02-25",
        "value": 73.0199966430664
      },
      {
        "date": "2025-02-26",
        "value": 72.52999877929688
      },
      {
        "date": "2025-02-27",
        "value": 74.04000091552734
      },
      {
        "date": "2025-02-28",
        "value": 73.18000030517578
      },
      {
        "date": "2025-03-03",
        "value": 71.62000274658203
      },
      {
        "date": "2025-03-04",
        "value": 71.04000091552734
      },
      {
        "date": "2025-03-05",
        "value": 69.30000305175781
      },
      {
        "date": "2025-03-06",
        "value": 69.45999908447266
      },
      {
        "date": "2025-03-07",
        "value": 70.36000061035156
      },
      {
        "date": "2025-03-10",
        "value": 69.27999877929688
      },
      {
        "date": "2025-03-11",
        "value": 69.55999755859375
      },
      {
        "date": "2025-03-12",
        "value": 70.94999694824219
      },
      {
        "date": "2025-03-13",
        "value": 69.87999725341797
      },
      {
        "date": "2025-03-14",
        "value": 70.58000183105469
      },
      {
        "date": "2025-03-17",
        "value": 71.06999969482422
      },
      {
        "date": "2025-03-18",
        "value": 70.55999755859375
      },
      {
        "date": "2025-03-19",
        "value": 70.77999877929688
      },
      {
        "date": "2025-03-20",
        "value": 72.0
      },
      {
        "date": "2025-03-21",
        "value": 72.16000366210938
      },
      {
        "date": "2025-03-24",
        "value": 73.0
      },
      {
        "date": "2025-03-25",
        "value": 73.0199966430664
      },
      {
        "date": "2025-03-26",
        "value": 73.79000091552734
      },
      {
        "date": "2025-03-27",
        "value": 74.02999877929688
      },
      {
        "date": "2025-03-28",
        "value": 73.62999725341797
      },
      {
        "date": "2025-03-31",
        "value": 74.73999786376953
      },
      {
        "date": "2025-04-01",
        "value": 74.48999786376953
      },
      {
        "date": "2025-04-02",
        "value": 74.94999694824219
      },
      {
        "date": "2025-04-03",
        "value": 70.13999938964844
      },
      {
        "date": "2025-04-04",
        "value": 65.58000183105469
      },
      {
        "date": "2025-04-07",
        "value": 64.20999908447266
      },
      {
        "date": "2025-04-08",
        "value": 62.81999969482422
      },
      {
        "date": "2025-04-09",
        "value": 65.4800033569336
      },
      {
        "date": "2025-04-10",
        "value": 63.33000183105469
      },
      {
        "date": "2025-04-11",
        "value": 64.76000213623047
      },
      {
        "date": "2025-04-14",
        "value": 64.87999725341797
      },
      {
        "date": "2025-04-15",
        "value": 64.66999816894531
      },
      {
        "date": "2025-04-16",
        "value": 65.8499984741211
      },
      {
        "date": "2025-04-17",
        "value": 67.95999908447266
      },
      {
        "date": "2025-04-21",
        "value": 66.26000213623047
      },
      {
        "date": "2025-04-22",
        "value": 67.44000244140625
      },
      {
        "date": "2025-04-23",
        "value": 66.12000274658203
      },
      {
        "date": "2025-04-24",
        "value": 66.55000305175781
      },
      {
        "date": "2025-04-25",
        "value": 66.87000274658203
      },
      {
        "date": "2025-04-28",
        "value": 65.86000061035156
      },
      {
        "date": "2025-04-29",
        "value": 64.25
      },
      {
        "date": "2025-04-30",
        "value": 63.119998931884766
      },
      {
        "date": "2025-05-01",
        "value": 62.130001068115234
      },
      {
        "date": "2025-05-02",
        "value": 61.290000915527344
      },
      {
        "date": "2025-05-05",
        "value": 60.22999954223633
      },
      {
        "date": "2025-05-06",
        "value": 62.150001525878906
      },
      {
        "date": "2025-05-07",
        "value": 61.119998931884766
      },
      {
        "date": "2025-05-08",
        "value": 62.84000015258789
      },
      {
        "date": "2025-05-09",
        "value": 63.90999984741211
      },
      {
        "date": "2025-05-12",
        "value": 64.95999908447266
      },
      {
        "date": "2025-05-13",
        "value": 66.62999725341797
      },
      {
        "date": "2025-05-14",
        "value": 66.08999633789062
      },
      {
        "date": "2025-05-15",
        "value": 64.52999877929688
      },
      {
        "date": "2025-05-16",
        "value": 65.41000366210938
      },
      {
        "date": "2025-05-19",
        "value": 65.54000091552734
      },
      {
        "date": "2025-05-20",
        "value": 65.37999725341797
      },
      {
        "date": "2025-05-21",
        "value": 64.91000366210938
      },
      {
        "date": "2025-05-22",
        "value": 64.44000244140625
      },
      {
        "date": "2025-05-23",
        "value": 64.77999877929688
      },
      {
        "date": "2025-05-27",
        "value": 64.08999633789062
      },
      {
        "date": "2025-05-28",
        "value": 64.9000015258789
      },
      {
        "date": "2025-05-29",
        "value": 64.1500015258789
      },
      {
        "date": "2025-05-30",
        "value": 63.900001525878906
      },
      {
        "date": "2025-06-02",
        "value": 64.62999725341797
      },
      {
        "date": "2025-06-03",
        "value": 65.62999725341797
      },
      {
        "date": "2025-06-04",
        "value": 64.86000061035156
      },
      {
        "date": "2025-06-05",
        "value": 65.33999633789062
      },
      {
        "date": "2025-06-06",
        "value": 66.47000122070312
      },
      {
        "date": "2025-06-09",
        "value": 67.04000091552734
      },
      {
        "date": "2025-06-10",
        "value": 66.87000274658203
      },
      {
        "date": "2025-06-11",
        "value": 69.7699966430664
      },
      {
        "date": "2025-06-12",
        "value": 69.36000061035156
      },
      {
        "date": "2025-06-13",
        "value": 74.2300033569336
      },
      {
        "date": "2025-06-16",
        "value": 73.2300033569336
      },
      {
        "date": "2025-06-17",
        "value": 76.44999694824219
      },
      {
        "date": "2025-06-18",
        "value": 76.69999694824219
      },
      {
        "date": "2025-06-20",
        "value": 77.01000213623047
      },
      {
        "date": "2025-06-23",
        "value": 71.4800033569336
      },
      {
        "date": "2025-06-24",
        "value": 67.13999938964844
      },
      {
        "date": "2025-06-25",
        "value": 67.68000030517578
      },
      {
        "date": "2025-06-26",
        "value": 67.7300033569336
      },
      {
        "date": "2025-06-27",
        "value": 67.7699966430664
      },
      {
        "date": "2025-06-30",
        "value": 67.61000061035156
      },
      {
        "date": "2025-07-01",
        "value": 67.11000061035156
      },
      {
        "date": "2025-07-02",
        "value": 69.11000061035156
      },
      {
        "date": "2025-07-03",
        "value": 68.80000305175781
      },
      {
        "date": "2025-07-04",
        "value": 68.29000091552734
      },
      {
        "date": "2025-07-07",
        "value": 69.58000183105469
      },
      {
        "date": "2025-07-08",
        "value": 70.1500015258789
      },
      {
        "date": "2025-07-09",
        "value": 70.19000244140625
      },
      {
        "date": "2025-07-10",
        "value": 68.63999938964844
      },
      {
        "date": "2025-07-11",
        "value": 70.36000061035156
      },
      {
        "date": "2025-07-14",
        "value": 69.20999908447266
      },
      {
        "date": "2025-07-15",
        "value": 68.70999908447266
      },
      {
        "date": "2025-07-16",
        "value": 68.5199966430664
      },
      {
        "date": "2025-07-17",
        "value": 69.5199966430664
      },
      {
        "date": "2025-07-18",
        "value": 69.27999877929688
      },
      {
        "date": "2025-07-21",
        "value": 69.20999908447266
      },
      {
        "date": "2025-07-22",
        "value": 68.58999633789062
      },
      {
        "date": "2025-07-23",
        "value": 68.51000213623047
      },
      {
        "date": "2025-07-24",
        "value": 69.18000030517578
      },
      {
        "date": "2025-07-25",
        "value": 68.44000244140625
      },
      {
        "date": "2025-07-28",
        "value": 70.04000091552734
      },
      {
        "date": "2025-07-29",
        "value": 72.51000213623047
      },
      {
        "date": "2025-07-30",
        "value": 73.23999786376953
      },
      {
        "date": "2025-07-31",
        "value": 72.52999877929688
      },
      {
        "date": "2025-08-01",
        "value": 69.66999816894531
      },
      {
        "date": "2025-08-04",
        "value": 68.76000213623047
      },
      {
        "date": "2025-08-05",
        "value": 67.63999938964844
      },
      {
        "date": "2025-08-06",
        "value": 66.88999938964844
      },
      {
        "date": "2025-08-07",
        "value": 66.43000030517578
      },
      {
        "date": "2025-08-08",
        "value": 66.58999633789062
      },
      {
        "date": "2025-08-11",
        "value": 66.62999725341797
      },
      {
        "date": "2025-08-12",
        "value": 66.12000274658203
      },
      {
        "date": "2025-08-13",
        "value": 65.62999725341797
      },
      {
        "date": "2025-08-14",
        "value": 66.83999633789062
      },
      {
        "date": "2025-08-15",
        "value": 65.8499984741211
      },
      {
        "date": "2025-08-18",
        "value": 66.5999984741211
      },
      {
        "date": "2025-08-19",
        "value": 65.79000091552734
      },
      {
        "date": "2025-08-20",
        "value": 66.83999633789062
      },
      {
        "date": "2025-08-21",
        "value": 67.66999816894531
      },
      {
        "date": "2025-08-22",
        "value": 67.7300033569336
      },
      {
        "date": "2025-08-25",
        "value": 68.80000305175781
      },
      {
        "date": "2025-08-26",
        "value": 67.22000122070312
      },
      {
        "date": "2025-08-27",
        "value": 68.05000305175781
      },
      {
        "date": "2025-08-28",
        "value": 68.62000274658203
      },
      {
        "date": "2025-08-29",
        "value": 68.12000274658203
      },
      {
        "date": "2025-09-02",
        "value": 69.13999938964844
      },
      {
        "date": "2025-09-03",
        "value": 67.5999984741211
      },
      {
        "date": "2025-09-04",
        "value": 66.98999786376953
      },
      {
        "date": "2025-09-05",
        "value": 65.5
      },
      {
        "date": "2025-09-08",
        "value": 66.0199966430664
      },
      {
        "date": "2025-09-09",
        "value": 66.38999938964844
      },
      {
        "date": "2025-09-10",
        "value": 67.48999786376953
      },
      {
        "date": "2025-09-11",
        "value": 66.37000274658203
      },
      {
        "date": "2025-09-12",
        "value": 66.98999786376953
      },
      {
        "date": "2025-09-15",
        "value": 67.44000244140625
      },
      {
        "date": "2025-09-16",
        "value": 68.47000122070312
      },
      {
        "date": "2025-09-17",
        "value": 67.94999694824219
      },
      {
        "date": "2025-09-18",
        "value": 67.44000244140625
      },
      {
        "date": "2025-09-19",
        "value": 66.68000030517578
      },
      {
        "date": "2025-09-22",
        "value": 66.56999969482422
      },
      {
        "date": "2025-09-23",
        "value": 67.62999725341797
      },
      {
        "date": "2025-09-24",
        "value": 69.30999755859375
      },
      {
        "date": "2025-09-25",
        "value": 69.41999816894531
      },
      {
        "date": "2025-09-26",
        "value": 70.12999725341797
      },
      {
        "date": "2025-09-29",
        "value": 67.97000122070312
      },
      {
        "date": "2025-09-30",
        "value": 67.0199966430664
      },
      {
        "date": "2025-10-01",
        "value": 65.3499984741211
      },
      {
        "date": "2025-10-02",
        "value": 64.11000061035156
      },
      {
        "date": "2025-10-03",
        "value": 64.52999877929688
      },
      {
        "date": "2025-10-06",
        "value": 65.47000122070312
      },
      {
        "date": "2025-10-07",
        "value": 65.44999694824219
      },
      {
        "date": "2025-10-08",
        "value": 66.25
      },
      {
        "date": "2025-10-09",
        "value": 65.22000122070312
      },
      {
        "date": "2025-10-10",
        "value": 62.72999954223633
      },
      {
        "date": "2025-10-13",
        "value": 63.31999969482422
      },
      {
        "date": "2025-10-14",
        "value": 62.38999938964844
      },
      {
        "date": "2025-10-15",
        "value": 61.90999984741211
      },
      {
        "date": "2025-10-16",
        "value": 61.060001373291016
      },
      {
        "date": "2025-10-17",
        "value": 61.290000915527344
      },
      {
        "date": "2025-10-20",
        "value": 61.0099983215332
      },
      {
        "date": "2025-10-21",
        "value": 61.31999969482422
      },
      {
        "date": "2025-10-22",
        "value": 62.59000015258789
      },
      {
        "date": "2025-10-23",
        "value": 65.98999786376953
      },
      {
        "date": "2025-10-24",
        "value": 65.94000244140625
      },
      {
        "date": "2025-10-27",
        "value": 65.62000274658203
      },
      {
        "date": "2025-10-28",
        "value": 64.4000015258789
      },
      {
        "date": "2025-10-29",
        "value": 64.91999816894531
      },
      {
        "date": "2025-10-30",
        "value": 65.0
      },
      {
        "date": "2025-10-31",
        "value": 65.06999969482422
      },
      {
        "date": "2025-11-03",
        "value": 64.88999938964844
      },
      {
        "date": "2025-11-04",
        "value": 64.44000244140625
      },
      {
        "date": "2025-11-05",
        "value": 63.52000045776367
      },
      {
        "date": "2025-11-06",
        "value": 63.380001068115234
      },
      {
        "date": "2025-11-07",
        "value": 63.630001068115234
      },
      {
        "date": "2025-11-10",
        "value": 64.05999755859375
      },
      {
        "date": "2025-11-11",
        "value": 65.16000366210938
      },
      {
        "date": "2025-11-12",
        "value": 62.709999084472656
      },
      {
        "date": "2025-11-13",
        "value": 63.0099983215332
      },
      {
        "date": "2025-11-14",
        "value": 64.38999938964844
      },
      {
        "date": "2025-11-17",
        "value": 64.19999694824219
      },
      {
        "date": "2025-11-18",
        "value": 64.88999938964844
      },
      {
        "date": "2025-11-19",
        "value": 63.5099983215332
      },
      {
        "date": "2025-11-20",
        "value": 63.380001068115234
      },
      {
        "date": "2025-11-21",
        "value": 62.560001373291016
      },
      {
        "date": "2025-11-24",
        "value": 63.369998931884766
      },
      {
        "date": "2025-11-25",
        "value": 62.47999954223633
      },
      {
        "date": "2025-11-26",
        "value": 63.130001068115234
      },
      {
        "date": "2025-11-28",
        "value": 63.20000076293945
      },
      {
        "date": "2025-12-01",
        "value": 63.16999816894531
      },
      {
        "date": "2025-12-02",
        "value": 62.45000076293945
      },
      {
        "date": "2025-12-03",
        "value": 62.66999816894531
      },
      {
        "date": "2025-12-04",
        "value": 63.2599983215332
      },
      {
        "date": "2025-12-05",
        "value": 63.75
      },
      {
        "date": "2025-12-08",
        "value": 62.4900016784668
      },
      {
        "date": "2025-12-09",
        "value": 61.939998626708984
      },
      {
        "date": "2025-12-10",
        "value": 62.209999084472656
      },
      {
        "date": "2025-12-11",
        "value": 61.279998779296875
      },
      {
        "date": "2025-12-12",
        "value": 61.119998931884766
      },
      {
        "date": "2025-12-15",
        "value": 60.560001373291016
      },
      {
        "date": "2025-12-16",
        "value": 58.91999816894531
      },
      {
        "date": "2025-12-17",
        "value": 59.68000030517578
      },
      {
        "date": "2025-12-18",
        "value": 59.81999969482422
      },
      {
        "date": "2025-12-19",
        "value": 60.470001220703125
      },
      {
        "date": "2025-12-22",
        "value": 62.06999969482422
      },
      {
        "date": "2025-12-23",
        "value": 62.380001068115234
      },
      {
        "date": "2025-12-24",
        "value": 62.2400016784668
      },
      {
        "date": "2025-12-26",
        "value": 60.63999938964844
      },
      {
        "date": "2025-12-29",
        "value": 61.939998626708984
      },
      {
        "date": "2025-12-30",
        "value": 61.91999816894531
      },
      {
        "date": "2025-12-31",
        "value": 60.849998474121094
      },
      {
        "date": "2026-01-02",
        "value": 60.75
      },
      {
        "date": "2026-01-05",
        "value": 61.7599983215332
      },
      {
        "date": "2026-01-06",
        "value": 60.70000076293945
      },
      {
        "date": "2026-01-07",
        "value": 59.959999084472656
      },
      {
        "date": "2026-01-08",
        "value": 61.9900016784668
      },
      {
        "date": "2026-01-09",
        "value": 63.34000015258789
      },
      {
        "date": "2026-01-12",
        "value": 63.869998931884766
      },
      {
        "date": "2026-01-13",
        "value": 65.47000122070312
      },
      {
        "date": "2026-01-14",
        "value": 66.5199966430664
      },
      {
        "date": "2026-01-15",
        "value": 63.7599983215332
      },
      {
        "date": "2026-01-16",
        "value": 64.12999725341797
      },
      {
        "date": "2026-01-20",
        "value": 64.91999816894531
      },
      {
        "date": "2026-01-21",
        "value": 65.23999786376953
      },
      {
        "date": "2026-01-22",
        "value": 64.05999755859375
      },
      {
        "date": "2026-01-23",
        "value": 65.87999725341797
      },
      {
        "date": "2026-01-26",
        "value": 65.58999633789062
      },
      {
        "date": "2026-01-27",
        "value": 67.56999969482422
      },
      {
        "date": "2026-01-28",
        "value": 68.4000015258789
      },
      {
        "date": "2026-01-29",
        "value": 70.70999908447266
      },
      {
        "date": "2026-01-30",
        "value": 70.69000244140625
      },
      {
        "date": "2026-02-02",
        "value": 66.30000305175781
      },
      {
        "date": "2026-02-03",
        "value": 67.33000183105469
      },
      {
        "date": "2026-02-04",
        "value": 69.45999908447266
      },
      {
        "date": "2026-02-05",
        "value": 67.55000305175781
      },
      {
        "date": "2026-02-06",
        "value": 68.05000305175781
      },
      {
        "date": "2026-02-09",
        "value": 69.04000091552734
      },
      {
        "date": "2026-02-10",
        "value": 68.80000305175781
      },
      {
        "date": "2026-02-11",
        "value": 69.4000015258789
      },
      {
        "date": "2026-02-12",
        "value": 67.5199966430664
      },
      {
        "date": "2026-02-13",
        "value": 67.75
      },
      {
        "date": "2026-02-17",
        "value": 67.41999816894531
      },
      {
        "date": "2026-02-18",
        "value": 70.3499984741211
      },
      {
        "date": "2026-02-19",
        "value": 71.66000366210938
      },
      {
        "date": "2026-02-20",
        "value": 71.76000213623047
      },
      {
        "date": "2026-02-23",
        "value": 71.48999786376953
      },
      {
        "date": "2026-02-24",
        "value": 70.7699966430664
      },
      {
        "date": "2026-02-25",
        "value": 70.8499984741211
      },
      {
        "date": "2026-02-26",
        "value": 70.75
      },
      {
        "date": "2026-02-27",
        "value": 72.4800033569336
      },
      {
        "date": "2026-03-02",
        "value": 77.73999786376953
      },
      {
        "date": "2026-03-03",
        "value": 81.4000015258789
      },
      {
        "date": "2026-03-04",
        "value": 81.4000015258789
      },
      {
        "date": "2026-03-05",
        "value": 85.41000366210938
      },
      {
        "date": "2026-03-06",
        "value": 92.69000244140625
      },
      {
        "date": "2026-03-09",
        "value": 98.95999908447266
      },
      {
        "date": "2026-03-10",
        "value": 87.80000305175781
      },
      {
        "date": "2026-03-11",
        "value": 91.9800033569336
      },
      {
        "date": "2026-03-12",
        "value": 100.45999908447266
      },
      {
        "date": "2026-03-13",
        "value": 103.13999938964844
      },
      {
        "date": "2026-03-16",
        "value": 100.20999908447266
      },
      {
        "date": "2026-03-17",
        "value": 103.41999816894531
      },
      {
        "date": "2026-03-18",
        "value": 107.37999725341797
      },
      {
        "date": "2026-03-19",
        "value": 108.6500015258789
      },
      {
        "date": "2026-03-20",
        "value": 112.19000244140625
      },
      {
        "date": "2026-03-23",
        "value": 99.94000244140625
      },
      {
        "date": "2026-03-24",
        "value": 104.48999786376953
      },
      {
        "date": "2026-03-25",
        "value": 102.22000122070312
      },
      {
        "date": "2026-03-26",
        "value": 108.01000213623047
      },
      {
        "date": "2026-03-27",
        "value": 112.56999969482422
      },
      {
        "date": "2026-03-30",
        "value": 112.77999877929688
      },
      {
        "date": "2026-03-31",
        "value": 118.3499984741211
      },
      {
        "date": "2026-04-01",
        "value": 101.16000366210938
      },
      {
        "date": "2026-04-02",
        "value": 109.02999877929688
      },
      {
        "date": "2026-04-06",
        "value": 109.7699966430664
      },
      {
        "date": "2026-04-07",
        "value": 109.2699966430664
      },
      {
        "date": "2026-04-08",
        "value": 94.75
      },
      {
        "date": "2026-04-09",
        "value": 95.91999816894531
      },
      {
        "date": "2026-04-10",
        "value": 95.19999694824219
      },
      {
        "date": "2026-04-13",
        "value": 99.36000061035156
      },
      {
        "date": "2026-04-14",
        "value": 94.79000091552734
      },
      {
        "date": "2026-04-15",
        "value": 94.93000030517578
      },
      {
        "date": "2026-04-16",
        "value": 99.38999938964844
      },
      {
        "date": "2026-04-17",
        "value": 90.37999725341797
      },
      {
        "date": "2026-04-20",
        "value": 95.4800033569336
      },
      {
        "date": "2026-04-21",
        "value": 98.4800033569336
      },
      {
        "date": "2026-04-22",
        "value": 101.91000366210938
      },
      {
        "date": "2026-04-23",
        "value": 105.06999969482422
      },
      {
        "date": "2026-04-24",
        "value": 105.33000183105469
      },
      {
        "date": "2026-04-27",
        "value": 108.2300033569336
      },
      {
        "date": "2026-04-28",
        "value": 111.26000213623047
      },
      {
        "date": "2026-04-29",
        "value": 118.02999877929688
      },
      {
        "date": "2026-04-30",
        "value": 114.01000213623047
      },
      {
        "date": "2026-05-01",
        "value": 108.16999816894531
      },
      {
        "date": "2026-05-04",
        "value": 114.44000244140625
      },
      {
        "date": "2026-05-05",
        "value": 109.87000274658203
      },
      {
        "date": "2026-05-06",
        "value": 101.2699966430664
      },
      {
        "date": "2026-05-07",
        "value": 100.05999755859375
      },
      {
        "date": "2026-05-08",
        "value": 101.29000091552734
      },
      {
        "date": "2026-05-11",
        "value": 104.20999908447266
      },
      {
        "date": "2026-05-12",
        "value": 107.7699966430664
      },
      {
        "date": "2026-05-13",
        "value": 105.62999725341797
      },
      {
        "date": "2026-05-14",
        "value": 105.72000122070312
      },
      {
        "date": "2026-05-15",
        "value": 109.26000213623047
      },
      {
        "date": "2026-05-18",
        "value": 112.0999984741211
      },
      {
        "date": "2026-05-19",
        "value": 111.27999877929688
      },
      {
        "date": "2026-05-20",
        "value": 105.0199966430664
      },
      {
        "date": "2026-05-21",
        "value": 102.58000183105469
      },
      {
        "date": "2026-05-22",
        "value": 103.54000091552734
      },
      {
        "date": "2026-05-26",
        "value": 99.58000183105469
      },
      {
        "date": "2026-05-27",
        "value": 94.29000091552734
      },
      {
        "date": "2026-05-28",
        "value": 93.70999908447266
      },
      {
        "date": "2026-05-29",
        "value": 92.05000305175781
      },
      {
        "date": "2026-06-01",
        "value": 94.9800033569336
      },
      {
        "date": "2026-06-02",
        "value": 96.0
      },
      {
        "date": "2026-06-03",
        "value": 97.80999755859375
      },
      {
        "date": "2026-06-04",
        "value": 95.02999877929688
      },
      {
        "date": "2026-06-05",
        "value": 93.08999633789062
      },
      {
        "date": "2026-06-08",
        "value": 94.25
      },
      {
        "date": "2026-06-09",
        "value": 91.44999694824219
      },
      {
        "date": "2026-06-10",
        "value": 93.0999984741211
      },
      {
        "date": "2026-06-11",
        "value": 90.37999725341797
      },
      {
        "date": "2026-06-12",
        "value": 87.33000183105469
      },
      {
        "date": "2026-06-15",
        "value": 83.16999816894531
      },
      {
        "date": "2026-06-16",
        "value": 78.95999908447266
      },
      {
        "date": "2026-06-17",
        "value": 79.55000305175781
      },
      {
        "date": "2026-06-18",
        "value": 79.8499984741211
      },
      {
        "date": "2026-06-22",
        "value": 77.9000015258789
      },
      {
        "date": "2026-06-23",
        "value": 77.08000183105469
      },
      {
        "date": "2026-06-24",
        "value": 73.73999786376953
      },
      {
        "date": "2026-06-25",
        "value": 75.26000213623047
      },
      {
        "date": "2026-06-26",
        "value": 71.98999786376953
      },
      {
        "date": "2026-06-29",
        "value": 73.1500015258789
      },
      {
        "date": "2026-06-30",
        "value": 72.91999816894531
      },
      {
        "date": "2026-07-01",
        "value": 71.56999969482422
      },
      {
        "date": "2026-07-02",
        "value": 71.80000305175781
      },
      {
        "date": "2026-07-06",
        "value": 71.98999786376953
      },
      {
        "date": "2026-07-07",
        "value": 74.16000366210938
      },
      {
        "date": "2026-07-08",
        "value": 78.0199966430664
      },
      {
        "date": "2026-07-09",
        "value": 76.30000305175781
      },
      {
        "date": "2026-07-10",
        "value": 76.01000213623047
      },
      {
        "date": "2026-07-13",
        "value": 83.30000305175781
      },
      {
        "date": "2026-07-14",
        "value": 85.30000305175781
      }
    ],
    "usdvnd_mkt": [
      {
        "date": "2024-12-26",
        "value": 25420.0
      },
      {
        "date": "2024-12-27",
        "value": 25425.0
      },
      {
        "date": "2024-12-30",
        "value": 25445.0
      },
      {
        "date": "2024-12-31",
        "value": 25476.0
      },
      {
        "date": "2025-01-02",
        "value": 25480.0
      },
      {
        "date": "2025-01-03",
        "value": 25450.0
      },
      {
        "date": "2025-01-06",
        "value": 25400.0
      },
      {
        "date": "2025-01-07",
        "value": 25370.0
      },
      {
        "date": "2025-01-08",
        "value": 25360.0
      },
      {
        "date": "2025-01-09",
        "value": 25370.0
      },
      {
        "date": "2025-01-10",
        "value": 25375.0
      },
      {
        "date": "2025-01-13",
        "value": 25360.0
      },
      {
        "date": "2025-01-14",
        "value": 25390.0
      },
      {
        "date": "2025-01-15",
        "value": 25380.0
      },
      {
        "date": "2025-01-16",
        "value": 25375.0
      },
      {
        "date": "2025-01-17",
        "value": 25370.0
      },
      {
        "date": "2025-01-20",
        "value": 25300.0
      },
      {
        "date": "2025-01-21",
        "value": 25315.0
      },
      {
        "date": "2025-01-22",
        "value": 25260.0
      },
      {
        "date": "2025-01-23",
        "value": 25050.0
      },
      {
        "date": "2025-01-24",
        "value": 25080.0
      },
      {
        "date": "2025-01-27",
        "value": 25060.0
      },
      {
        "date": "2025-01-28",
        "value": 25060.0
      },
      {
        "date": "2025-01-29",
        "value": 25060.0
      },
      {
        "date": "2025-01-30",
        "value": 25060.0
      },
      {
        "date": "2025-01-31",
        "value": 25060.0
      },
      {
        "date": "2025-02-03",
        "value": 25060.0
      },
      {
        "date": "2025-02-04",
        "value": 25280.0
      },
      {
        "date": "2025-02-05",
        "value": 25280.0
      },
      {
        "date": "2025-02-06",
        "value": 25145.0
      },
      {
        "date": "2025-02-07",
        "value": 25260.0
      },
      {
        "date": "2025-02-10",
        "value": 25290.0
      },
      {
        "date": "2025-02-11",
        "value": 25380.0
      },
      {
        "date": "2025-02-12",
        "value": 25530.0
      },
      {
        "date": "2025-02-13",
        "value": 25550.0
      },
      {
        "date": "2025-02-14",
        "value": 25440.0
      },
      {
        "date": "2025-02-17",
        "value": 25370.0
      },
      {
        "date": "2025-02-18",
        "value": 25470.0
      },
      {
        "date": "2025-02-19",
        "value": 25500.0
      },
      {
        "date": "2025-02-20",
        "value": 25515.0
      },
      {
        "date": "2025-02-21",
        "value": 25500.0
      },
      {
        "date": "2025-02-24",
        "value": 25510.0
      },
      {
        "date": "2025-02-25",
        "value": 25468.0
      },
      {
        "date": "2025-02-26",
        "value": 25520.0
      },
      {
        "date": "2025-02-27",
        "value": 25535.0
      },
      {
        "date": "2025-02-28",
        "value": 25520.0
      },
      {
        "date": "2025-03-03",
        "value": 25530.0
      },
      {
        "date": "2025-03-04",
        "value": 25575.0
      },
      {
        "date": "2025-03-05",
        "value": 25540.0
      },
      {
        "date": "2025-03-06",
        "value": 25490.0
      },
      {
        "date": "2025-03-07",
        "value": 25485.0
      },
      {
        "date": "2025-03-10",
        "value": 25480.0
      },
      {
        "date": "2025-03-11",
        "value": 25525.0
      },
      {
        "date": "2025-03-12",
        "value": 25450.0
      },
      {
        "date": "2025-03-13",
        "value": 25445.0
      },
      {
        "date": "2025-03-14",
        "value": 25490.0
      },
      {
        "date": "2025-03-17",
        "value": 25500.0
      },
      {
        "date": "2025-03-18",
        "value": 25510.0
      },
      {
        "date": "2025-03-19",
        "value": 25510.0
      },
      {
        "date": "2025-03-20",
        "value": 25535.0
      },
      {
        "date": "2025-03-21",
        "value": 25545.0
      },
      {
        "date": "2025-03-24",
        "value": 25585.0
      },
      {
        "date": "2025-03-25",
        "value": 25620.0
      },
      {
        "date": "2025-03-26",
        "value": 25600.0
      },
      {
        "date": "2025-03-27",
        "value": 25555.0
      },
      {
        "date": "2025-03-28",
        "value": 25560.0
      },
      {
        "date": "2025-03-30",
        "value": 25550.0
      },
      {
        "date": "2025-03-31",
        "value": 25565.0
      },
      {
        "date": "2025-04-01",
        "value": 25620.0
      },
      {
        "date": "2025-04-02",
        "value": 25600.0
      },
      {
        "date": "2025-04-03",
        "value": 25600.0
      },
      {
        "date": "2025-04-06",
        "value": 25770.0
      },
      {
        "date": "2025-04-07",
        "value": 25780.0
      },
      {
        "date": "2025-04-08",
        "value": 25995.0
      },
      {
        "date": "2025-04-09",
        "value": 25960.0
      },
      {
        "date": "2025-04-10",
        "value": 25720.0
      },
      {
        "date": "2025-04-13",
        "value": 25715.0
      },
      {
        "date": "2025-04-14",
        "value": 25824.0
      },
      {
        "date": "2025-04-15",
        "value": 25790.0
      },
      {
        "date": "2025-04-16",
        "value": 25830.0
      },
      {
        "date": "2025-04-21",
        "value": 25871.0
      },
      {
        "date": "2025-04-22",
        "value": 25932.0
      },
      {
        "date": "2025-04-23",
        "value": 25965.0
      },
      {
        "date": "2025-04-24",
        "value": 26026.0
      },
      {
        "date": "2025-04-27",
        "value": 26019.0
      },
      {
        "date": "2025-04-28",
        "value": 25970.0
      },
      {
        "date": "2025-04-29",
        "value": 25980.0
      },
      {
        "date": "2025-04-30",
        "value": 25980.0
      },
      {
        "date": "2025-05-01",
        "value": 25980.0
      },
      {
        "date": "2025-05-04",
        "value": 25980.0
      },
      {
        "date": "2025-05-05",
        "value": 25942.0
      },
      {
        "date": "2025-05-06",
        "value": 25948.0
      },
      {
        "date": "2025-05-07",
        "value": 25953.0
      },
      {
        "date": "2025-05-08",
        "value": 25959.0
      },
      {
        "date": "2025-05-11",
        "value": 25952.0
      },
      {
        "date": "2025-05-12",
        "value": 25960.0
      },
      {
        "date": "2025-05-13",
        "value": 25951.0
      },
      {
        "date": "2025-05-14",
        "value": 25924.0
      },
      {
        "date": "2025-05-15",
        "value": 25920.0
      },
      {
        "date": "2025-05-18",
        "value": 25917.0
      },
      {
        "date": "2025-05-19",
        "value": 25932.0
      },
      {
        "date": "2025-05-20",
        "value": 25950.0
      },
      {
        "date": "2025-05-21",
        "value": 25950.0
      },
      {
        "date": "2025-05-22",
        "value": 25973.0
      },
      {
        "date": "2025-05-25",
        "value": 25946.0
      },
      {
        "date": "2025-05-26",
        "value": 25897.0
      },
      {
        "date": "2025-05-27",
        "value": 25903.0
      },
      {
        "date": "2025-05-28",
        "value": 25950.0
      },
      {
        "date": "2025-05-29",
        "value": 25996.0
      },
      {
        "date": "2025-06-01",
        "value": 26019.0
      },
      {
        "date": "2025-06-02",
        "value": 26022.0
      },
      {
        "date": "2025-06-03",
        "value": 26038.0
      },
      {
        "date": "2025-06-04",
        "value": 26071.0
      },
      {
        "date": "2025-06-05",
        "value": 26056.0
      },
      {
        "date": "2025-06-08",
        "value": 26047.0
      },
      {
        "date": "2025-06-09",
        "value": 26025.0
      },
      {
        "date": "2025-06-10",
        "value": 25990.0
      },
      {
        "date": "2025-06-11",
        "value": 26010.0
      },
      {
        "date": "2025-06-12",
        "value": 26020.0
      },
      {
        "date": "2025-06-15",
        "value": 26050.0
      },
      {
        "date": "2025-06-16",
        "value": 26030.0
      },
      {
        "date": "2025-06-17",
        "value": 26072.0
      },
      {
        "date": "2025-06-18",
        "value": 26092.0
      },
      {
        "date": "2025-06-19",
        "value": 26123.0
      },
      {
        "date": "2025-06-22",
        "value": 26119.0
      },
      {
        "date": "2025-06-23",
        "value": 26190.0
      },
      {
        "date": "2025-06-24",
        "value": 26150.0
      },
      {
        "date": "2025-06-25",
        "value": 26150.0
      },
      {
        "date": "2025-06-26",
        "value": 26100.0
      },
      {
        "date": "2025-06-29",
        "value": 26090.0
      },
      {
        "date": "2025-06-30",
        "value": 26118.0
      },
      {
        "date": "2025-07-01",
        "value": 26110.0
      },
      {
        "date": "2025-07-02",
        "value": 26150.0
      },
      {
        "date": "2025-07-03",
        "value": 26175.0
      },
      {
        "date": "2025-07-06",
        "value": 26158.0
      },
      {
        "date": "2025-07-07",
        "value": 26120.0
      },
      {
        "date": "2025-07-08",
        "value": 26110.0
      },
      {
        "date": "2025-07-09",
        "value": 26138.0
      },
      {
        "date": "2025-07-10",
        "value": 26100.0
      },
      {
        "date": "2025-07-13",
        "value": 26108.0
      },
      {
        "date": "2025-07-14",
        "value": 26100.0
      },
      {
        "date": "2025-07-15",
        "value": 26120.0
      },
      {
        "date": "2025-07-16",
        "value": 26140.0
      },
      {
        "date": "2025-07-17",
        "value": 26135.0
      },
      {
        "date": "2025-07-20",
        "value": 26140.0
      },
      {
        "date": "2025-07-21",
        "value": 26130.0
      },
      {
        "date": "2025-07-22",
        "value": 26120.0
      },
      {
        "date": "2025-07-23",
        "value": 26120.0
      },
      {
        "date": "2025-07-24",
        "value": 26110.0
      },
      {
        "date": "2025-07-27",
        "value": 26120.0
      },
      {
        "date": "2025-07-28",
        "value": 26165.0
      },
      {
        "date": "2025-07-29",
        "value": 26195.0
      },
      {
        "date": "2025-07-30",
        "value": 26200.0
      },
      {
        "date": "2025-07-31",
        "value": 26197.0
      },
      {
        "date": "2025-08-03",
        "value": 26190.0
      },
      {
        "date": "2025-08-04",
        "value": 26174.0
      },
      {
        "date": "2025-08-05",
        "value": 26225.0
      },
      {
        "date": "2025-08-06",
        "value": 26200.0
      },
      {
        "date": "2025-08-07",
        "value": 26190.0
      },
      {
        "date": "2025-08-10",
        "value": 26200.0
      },
      {
        "date": "2025-08-11",
        "value": 26231.0
      },
      {
        "date": "2025-08-12",
        "value": 26245.0
      },
      {
        "date": "2025-08-13",
        "value": 26265.0
      },
      {
        "date": "2025-08-14",
        "value": 26230.0
      },
      {
        "date": "2025-08-17",
        "value": 26240.0
      },
      {
        "date": "2025-08-18",
        "value": 26275.0
      },
      {
        "date": "2025-08-19",
        "value": 26290.0
      },
      {
        "date": "2025-08-20",
        "value": 26370.0
      },
      {
        "date": "2025-08-21",
        "value": 26405.0
      },
      {
        "date": "2025-08-24",
        "value": 26300.0
      },
      {
        "date": "2025-08-25",
        "value": 26300.0
      },
      {
        "date": "2025-08-26",
        "value": 26340.0
      },
      {
        "date": "2025-08-27",
        "value": 26374.0
      },
      {
        "date": "2025-08-28",
        "value": 26360.0
      },
      {
        "date": "2025-08-31",
        "value": 26340.0
      },
      {
        "date": "2025-09-01",
        "value": 26340.0
      },
      {
        "date": "2025-09-02",
        "value": 26340.0
      },
      {
        "date": "2025-09-03",
        "value": 26365.0
      },
      {
        "date": "2025-09-04",
        "value": 26360.0
      },
      {
        "date": "2025-09-07",
        "value": 26375.0
      },
      {
        "date": "2025-09-08",
        "value": 26385.0
      },
      {
        "date": "2025-09-09",
        "value": 26360.0
      },
      {
        "date": "2025-09-10",
        "value": 26370.0
      },
      {
        "date": "2025-09-11",
        "value": 26375.0
      },
      {
        "date": "2025-09-14",
        "value": 26355.0
      },
      {
        "date": "2025-09-15",
        "value": 26355.0
      },
      {
        "date": "2025-09-16",
        "value": 26381.0
      },
      {
        "date": "2025-09-17",
        "value": 26340.0
      },
      {
        "date": "2025-09-18",
        "value": 26355.0
      },
      {
        "date": "2025-09-21",
        "value": 26355.0
      },
      {
        "date": "2025-09-22",
        "value": 26395.0
      },
      {
        "date": "2025-09-23",
        "value": 26395.0
      },
      {
        "date": "2025-09-24",
        "value": 26395.0
      },
      {
        "date": "2025-09-25",
        "value": 26380.0
      },
      {
        "date": "2025-09-28",
        "value": 26385.0
      },
      {
        "date": "2025-09-29",
        "value": 26414.0
      },
      {
        "date": "2025-09-30",
        "value": 26425.0
      },
      {
        "date": "2025-10-01",
        "value": 26405.0
      },
      {
        "date": "2025-10-02",
        "value": 26393.0
      },
      {
        "date": "2025-10-05",
        "value": 26375.0
      },
      {
        "date": "2025-10-06",
        "value": 26340.0
      },
      {
        "date": "2025-10-07",
        "value": 26340.0
      },
      {
        "date": "2025-10-08",
        "value": 26335.0
      },
      {
        "date": "2025-10-09",
        "value": 26346.0
      },
      {
        "date": "2025-10-12",
        "value": 26310.0
      },
      {
        "date": "2025-10-13",
        "value": 26325.0
      },
      {
        "date": "2025-10-14",
        "value": 26343.0
      },
      {
        "date": "2025-10-15",
        "value": 26315.0
      },
      {
        "date": "2025-10-16",
        "value": 26310.0
      },
      {
        "date": "2025-10-19",
        "value": 26337.0
      },
      {
        "date": "2025-10-20",
        "value": 26330.0
      },
      {
        "date": "2025-10-21",
        "value": 26333.0
      },
      {
        "date": "2025-10-22",
        "value": 26345.0
      },
      {
        "date": "2025-10-23",
        "value": 26312.0
      },
      {
        "date": "2025-10-27",
        "value": 26280.0
      },
      {
        "date": "2025-10-28",
        "value": 26280.0
      },
      {
        "date": "2025-10-29",
        "value": 26308.0
      },
      {
        "date": "2025-10-30",
        "value": 26335.0
      },
      {
        "date": "2025-10-31",
        "value": 26315.0
      },
      {
        "date": "2025-11-03",
        "value": 26310.0
      },
      {
        "date": "2025-11-04",
        "value": 26309.0
      },
      {
        "date": "2025-11-05",
        "value": 26295.0
      },
      {
        "date": "2025-11-06",
        "value": 26300.0
      },
      {
        "date": "2025-11-07",
        "value": 26285.0
      },
      {
        "date": "2025-11-10",
        "value": 26280.0
      },
      {
        "date": "2025-11-11",
        "value": 26270.0
      },
      {
        "date": "2025-11-12",
        "value": 26280.0
      },
      {
        "date": "2025-11-13",
        "value": 26280.0
      },
      {
        "date": "2025-11-14",
        "value": 26320.0
      },
      {
        "date": "2025-11-17",
        "value": 26325.0
      },
      {
        "date": "2025-11-18",
        "value": 26335.0
      },
      {
        "date": "2025-11-19",
        "value": 26378.0
      },
      {
        "date": "2025-11-20",
        "value": 26376.0
      },
      {
        "date": "2025-11-21",
        "value": 26366.0
      },
      {
        "date": "2025-11-24",
        "value": 26349.0
      },
      {
        "date": "2025-11-25",
        "value": 26350.0
      },
      {
        "date": "2025-11-26",
        "value": 26343.0
      },
      {
        "date": "2025-11-27",
        "value": 26350.0
      },
      {
        "date": "2025-11-28",
        "value": 26372.0
      },
      {
        "date": "2025-12-01",
        "value": 26330.0
      },
      {
        "date": "2025-12-02",
        "value": 26340.0
      },
      {
        "date": "2025-12-03",
        "value": 26340.0
      },
      {
        "date": "2025-12-04",
        "value": 26345.0
      },
      {
        "date": "2025-12-05",
        "value": 26340.0
      },
      {
        "date": "2025-12-08",
        "value": 26320.0
      },
      {
        "date": "2025-12-09",
        "value": 26320.0
      },
      {
        "date": "2025-12-10",
        "value": 26340.0
      },
      {
        "date": "2025-12-11",
        "value": 26355.0
      },
      {
        "date": "2025-12-12",
        "value": 26300.0
      },
      {
        "date": "2025-12-15",
        "value": 26303.0
      },
      {
        "date": "2025-12-16",
        "value": 26290.0
      },
      {
        "date": "2025-12-17",
        "value": 26310.0
      },
      {
        "date": "2025-12-18",
        "value": 26300.0
      },
      {
        "date": "2025-12-19",
        "value": 26285.0
      },
      {
        "date": "2025-12-22",
        "value": 26265.0
      },
      {
        "date": "2025-12-23",
        "value": 26300.0
      },
      {
        "date": "2025-12-24",
        "value": 26326.0
      },
      {
        "date": "2025-12-26",
        "value": 26277.0
      },
      {
        "date": "2025-12-29",
        "value": 26255.0
      },
      {
        "date": "2025-12-30",
        "value": 26245.0
      },
      {
        "date": "2025-12-31",
        "value": 26225.0
      },
      {
        "date": "2026-01-02",
        "value": 26295.0
      },
      {
        "date": "2026-01-05",
        "value": 26295.0
      },
      {
        "date": "2026-01-06",
        "value": 26269.0
      },
      {
        "date": "2026-01-07",
        "value": 26274.0
      },
      {
        "date": "2026-01-08",
        "value": 26271.0
      },
      {
        "date": "2026-01-09",
        "value": 26230.0
      },
      {
        "date": "2026-01-12",
        "value": 26225.0
      },
      {
        "date": "2026-01-13",
        "value": 26270.0
      },
      {
        "date": "2026-01-14",
        "value": 26250.0
      },
      {
        "date": "2026-01-15",
        "value": 26230.0
      },
      {
        "date": "2026-01-16",
        "value": 26230.0
      },
      {
        "date": "2026-01-19",
        "value": 26235.0
      },
      {
        "date": "2026-01-20",
        "value": 26225.0
      },
      {
        "date": "2026-01-21",
        "value": 26264.0
      },
      {
        "date": "2026-01-22",
        "value": 26225.0
      },
      {
        "date": "2026-01-23",
        "value": 26267.0
      },
      {
        "date": "2026-01-26",
        "value": 26205.0
      },
      {
        "date": "2026-01-27",
        "value": 26181.0
      },
      {
        "date": "2026-01-28",
        "value": 26130.0
      },
      {
        "date": "2026-01-29",
        "value": 26020.0
      },
      {
        "date": "2026-01-30",
        "value": 25950.0
      },
      {
        "date": "2026-02-02",
        "value": 25880.0
      },
      {
        "date": "2026-02-03",
        "value": 25970.0
      },
      {
        "date": "2026-02-04",
        "value": 26000.0
      },
      {
        "date": "2026-02-05",
        "value": 25978.0
      },
      {
        "date": "2026-02-06",
        "value": 25940.0
      },
      {
        "date": "2026-02-09",
        "value": 25900.0
      },
      {
        "date": "2026-02-10",
        "value": 25860.0
      },
      {
        "date": "2026-02-11",
        "value": 25840.0
      },
      {
        "date": "2026-02-12",
        "value": 25950.0
      },
      {
        "date": "2026-02-13",
        "value": 25910.0
      },
      {
        "date": "2026-02-16",
        "value": 25920.0
      },
      {
        "date": "2026-02-17",
        "value": 25920.0
      },
      {
        "date": "2026-02-18",
        "value": 25920.0
      },
      {
        "date": "2026-02-19",
        "value": 25920.0
      },
      {
        "date": "2026-02-20",
        "value": 25920.0
      },
      {
        "date": "2026-02-23",
        "value": 25920.0
      },
      {
        "date": "2026-02-24",
        "value": 26080.0
      },
      {
        "date": "2026-02-25",
        "value": 26180.0
      },
      {
        "date": "2026-02-26",
        "value": 26099.0
      },
      {
        "date": "2026-02-27",
        "value": 26030.0
      },
      {
        "date": "2026-03-02",
        "value": 26040.0
      },
      {
        "date": "2026-03-03",
        "value": 26160.0
      },
      {
        "date": "2026-03-04",
        "value": 26150.0
      },
      {
        "date": "2026-03-05",
        "value": 26165.0
      },
      {
        "date": "2026-03-06",
        "value": 26210.0
      },
      {
        "date": "2026-03-09",
        "value": 26180.0
      },
      {
        "date": "2026-03-10",
        "value": 26245.0
      },
      {
        "date": "2026-03-11",
        "value": 26175.0
      },
      {
        "date": "2026-03-12",
        "value": 26190.0
      },
      {
        "date": "2026-03-13",
        "value": 26240.0
      },
      {
        "date": "2026-03-16",
        "value": 26271.0
      },
      {
        "date": "2026-03-17",
        "value": 26260.0
      },
      {
        "date": "2026-03-18",
        "value": 26280.0
      },
      {
        "date": "2026-03-19",
        "value": 26300.0
      },
      {
        "date": "2026-03-20",
        "value": 26255.0
      },
      {
        "date": "2026-03-23",
        "value": 26285.0
      },
      {
        "date": "2026-03-24",
        "value": 26339.0
      },
      {
        "date": "2026-03-25",
        "value": 26350.0
      },
      {
        "date": "2026-03-26",
        "value": 26341.0
      },
      {
        "date": "2026-03-27",
        "value": 26348.0
      },
      {
        "date": "2026-03-29",
        "value": 26320.0
      },
      {
        "date": "2026-03-30",
        "value": 26335.0
      },
      {
        "date": "2026-03-31",
        "value": 26323.0
      },
      {
        "date": "2026-04-01",
        "value": 26310.0
      },
      {
        "date": "2026-04-02",
        "value": 26310.0
      },
      {
        "date": "2026-04-05",
        "value": 26318.0
      },
      {
        "date": "2026-04-06",
        "value": 26312.0
      },
      {
        "date": "2026-04-07",
        "value": 26305.0
      },
      {
        "date": "2026-04-08",
        "value": 26304.0
      },
      {
        "date": "2026-04-09",
        "value": 26320.0
      },
      {
        "date": "2026-04-12",
        "value": 26335.0
      },
      {
        "date": "2026-04-13",
        "value": 26325.0
      },
      {
        "date": "2026-04-14",
        "value": 26340.0
      },
      {
        "date": "2026-04-15",
        "value": 26302.0
      },
      {
        "date": "2026-04-16",
        "value": 26300.0
      },
      {
        "date": "2026-04-19",
        "value": 26313.0
      },
      {
        "date": "2026-04-20",
        "value": 26308.0
      },
      {
        "date": "2026-04-21",
        "value": 26325.0
      },
      {
        "date": "2026-04-22",
        "value": 26320.0
      },
      {
        "date": "2026-04-23",
        "value": 26294.0
      },
      {
        "date": "2026-04-26",
        "value": 26350.0
      },
      {
        "date": "2026-04-27",
        "value": 26350.0
      },
      {
        "date": "2026-04-28",
        "value": 26330.0
      },
      {
        "date": "2026-04-29",
        "value": 26355.0
      },
      {
        "date": "2026-04-30",
        "value": 26355.0
      },
      {
        "date": "2026-05-03",
        "value": 26355.0
      },
      {
        "date": "2026-05-04",
        "value": 26312.0
      },
      {
        "date": "2026-05-05",
        "value": 26280.0
      },
      {
        "date": "2026-05-06",
        "value": 26320.0
      },
      {
        "date": "2026-05-07",
        "value": 26260.0
      },
      {
        "date": "2026-05-10",
        "value": 26306.0
      },
      {
        "date": "2026-05-11",
        "value": 26320.0
      },
      {
        "date": "2026-05-12",
        "value": 26299.0
      },
      {
        "date": "2026-05-13",
        "value": 26317.0
      },
      {
        "date": "2026-05-14",
        "value": 26340.0
      },
      {
        "date": "2026-05-17",
        "value": 26350.0
      },
      {
        "date": "2026-05-18",
        "value": 26327.0
      },
      {
        "date": "2026-05-19",
        "value": 26329.0
      },
      {
        "date": "2026-05-20",
        "value": 26355.0
      },
      {
        "date": "2026-05-21",
        "value": 26350.0
      },
      {
        "date": "2026-05-24",
        "value": 26340.0
      },
      {
        "date": "2026-05-25",
        "value": 26322.0
      },
      {
        "date": "2026-05-26",
        "value": 26294.0
      },
      {
        "date": "2026-05-27",
        "value": 26273.0
      },
      {
        "date": "2026-05-28",
        "value": 26326.0
      },
      {
        "date": "2026-05-31",
        "value": 26255.0
      },
      {
        "date": "2026-06-01",
        "value": 26265.0
      },
      {
        "date": "2026-06-02",
        "value": 26275.0
      },
      {
        "date": "2026-06-03",
        "value": 26290.0
      },
      {
        "date": "2026-06-04",
        "value": 26275.0
      },
      {
        "date": "2026-06-07",
        "value": 26270.0
      },
      {
        "date": "2026-06-08",
        "value": 26285.0
      },
      {
        "date": "2026-06-09",
        "value": 26270.0
      },
      {
        "date": "2026-06-10",
        "value": 26265.0
      },
      {
        "date": "2026-06-11",
        "value": 26325.0
      },
      {
        "date": "2026-06-14",
        "value": 26250.0
      },
      {
        "date": "2026-06-15",
        "value": 26230.0
      },
      {
        "date": "2026-06-16",
        "value": 26240.0
      },
      {
        "date": "2026-06-17",
        "value": 26265.0
      },
      {
        "date": "2026-06-18",
        "value": 26270.0
      },
      {
        "date": "2026-06-21",
        "value": 26265.0
      },
      {
        "date": "2026-06-22",
        "value": 26315.0
      },
      {
        "date": "2026-06-23",
        "value": 26265.0
      },
      {
        "date": "2026-06-24",
        "value": 26330.0
      },
      {
        "date": "2026-06-25",
        "value": 26315.0
      },
      {
        "date": "2026-06-28",
        "value": 26245.0
      },
      {
        "date": "2026-06-29",
        "value": 26230.0
      },
      {
        "date": "2026-06-30",
        "value": 26255.0
      },
      {
        "date": "2026-07-01",
        "value": 26299.0
      },
      {
        "date": "2026-07-02",
        "value": 26285.0
      },
      {
        "date": "2026-07-05",
        "value": 26294.0
      },
      {
        "date": "2026-07-06",
        "value": 26299.0
      },
      {
        "date": "2026-07-07",
        "value": 26289.0
      },
      {
        "date": "2026-07-08",
        "value": 26294.0
      },
      {
        "date": "2026-07-09",
        "value": 26290.0
      },
      {
        "date": "2026-07-10",
        "value": 26260.0
      },
      {
        "date": "2026-07-12",
        "value": 26261.0
      },
      {
        "date": "2026-07-13",
        "value": 26250.0
      }
    ],
    "usdvnd_vcb": [
      {
        "date": "2026-07-09",
        "value": 26471.0
      },
      {
        "date": "2026-07-10",
        "value": 26470.0
      },
      {
        "date": "2026-07-11",
        "value": 26470.0
      },
      {
        "date": "2026-07-12",
        "value": 26470.0
      },
      {
        "date": "2026-07-13",
        "value": 26460.0
      },
      {
        "date": "2026-07-15",
        "value": 26450.0
      }
    ],
    "gold_sjc": [
      {
        "date": "2026-07-09",
        "value": 149000000.0
      },
      {
        "date": "2026-07-10",
        "value": 149900000.0
      },
      {
        "date": "2026-07-11",
        "value": 149900000.0
      },
      {
        "date": "2026-07-12",
        "value": 149900000.0
      },
      {
        "date": "2026-07-13",
        "value": 148400000.0
      },
      {
        "date": "2026-07-15",
        "value": 147500000.0
      }
    ],
    "vn_cpi_yoy": [
      {
        "date": "1996-12-31",
        "value": 5.67499999999992
      },
      {
        "date": "1997-12-31",
        "value": 3.20952606261375
      },
      {
        "date": "1998-12-31",
        "value": 7.26619804400963
      },
      {
        "date": "1999-12-31",
        "value": 4.11710235771736
      },
      {
        "date": "2000-12-31",
        "value": -1.71033727851111
      },
      {
        "date": "2001-12-31",
        "value": -0.43154451172818
      },
      {
        "date": "2002-12-31",
        "value": 3.83082838168468
      },
      {
        "date": "2003-12-31",
        "value": 3.23464817293925
      },
      {
        "date": "2004-12-31",
        "value": 7.75494748709606
      },
      {
        "date": "2005-12-31",
        "value": 8.28457243128667
      },
      {
        "date": "2006-12-31",
        "value": 7.41801715108469
      },
      {
        "date": "2007-12-31",
        "value": 8.34444889773847
      },
      {
        "date": "2008-12-31",
        "value": 23.1154483474477
      },
      {
        "date": "2009-12-31",
        "value": 6.71698269988631
      },
      {
        "date": "2010-12-31",
        "value": 9.20746648778413
      },
      {
        "date": "2011-12-31",
        "value": 18.6777322770706
      },
      {
        "date": "2012-12-31",
        "value": 9.09470339557193
      },
      {
        "date": "2013-12-31",
        "value": 6.59267475899192
      },
      {
        "date": "2014-12-31",
        "value": 4.08455446637625
      },
      {
        "date": "2015-12-31",
        "value": 0.631200905175685
      },
      {
        "date": "2016-12-31",
        "value": 2.66824816969082
      },
      {
        "date": "2017-12-31",
        "value": 3.52025688811618
      },
      {
        "date": "2018-12-31",
        "value": 3.53962805942641
      },
      {
        "date": "2019-12-31",
        "value": 2.79582367452244
      },
      {
        "date": "2020-12-31",
        "value": 3.22093436652515
      },
      {
        "date": "2021-12-31",
        "value": 1.83471554810462
      },
      {
        "date": "2022-12-31",
        "value": 3.15650749963112
      },
      {
        "date": "2023-12-31",
        "value": 3.25289282667662
      },
      {
        "date": "2024-12-31",
        "value": 3.62109273885844
      },
      {
        "date": "2025-12-31",
        "value": 3.3099931421974
      }
    ],
    "vn_gdp_yoy": [
      {
        "date": "1985-12-31",
        "value": 3.80585566810947
      },
      {
        "date": "1986-12-31",
        "value": 2.78929157479443
      },
      {
        "date": "1987-12-31",
        "value": 3.5834696313072
      },
      {
        "date": "1988-12-31",
        "value": 5.13501167157808
      },
      {
        "date": "1989-12-31",
        "value": 7.36451289395819
      },
      {
        "date": "1990-12-31",
        "value": 5.10091813908369
      },
      {
        "date": "1991-12-31",
        "value": 5.96084393218912
      },
      {
        "date": "1992-12-31",
        "value": 8.64604745934572
      },
      {
        "date": "1993-12-31",
        "value": 8.07273065739605
      },
      {
        "date": "1994-12-31",
        "value": 8.83898095245374
      },
      {
        "date": "1995-12-31",
        "value": 9.54048017491264
      },
      {
        "date": "1996-12-31",
        "value": 9.34001749939179
      },
      {
        "date": "1997-12-31",
        "value": 8.1520841433542
      },
      {
        "date": "1998-12-31",
        "value": 5.76445545848843
      },
      {
        "date": "1999-12-31",
        "value": 4.77358688344989
      },
      {
        "date": "2000-12-31",
        "value": 6.78731640463151
      },
      {
        "date": "2001-12-31",
        "value": 6.19289331233377
      },
      {
        "date": "2002-12-31",
        "value": 6.32082099160833
      },
      {
        "date": "2003-12-31",
        "value": 6.89906349055258
      },
      {
        "date": "2004-12-31",
        "value": 7.53641060890386
      },
      {
        "date": "2005-12-31",
        "value": 7.54724772895918
      },
      {
        "date": "2006-12-31",
        "value": 6.97795481056711
      },
      {
        "date": "2007-12-31",
        "value": 7.12950448605439
      },
      {
        "date": "2008-12-31",
        "value": 5.66177120891362
      },
      {
        "date": "2009-12-31",
        "value": 5.39789754014181
      },
      {
        "date": "2010-12-31",
        "value": 6.42324482239482
      },
      {
        "date": "2011-12-31",
        "value": 6.41316889681683
      },
      {
        "date": "2012-12-31",
        "value": 5.5045447041189
      },
      {
        "date": "2013-12-31",
        "value": 5.55351081026072
      },
      {
        "date": "2014-12-31",
        "value": 6.42224312118567
      },
      {
        "date": "2015-12-31",
        "value": 6.98715430598611
      },
      {
        "date": "2016-12-31",
        "value": 6.69000892660424
      },
      {
        "date": "2017-12-31",
        "value": 6.94019037359206
      },
      {
        "date": "2018-12-31",
        "value": 7.46500685572751
      },
      {
        "date": "2019-12-31",
        "value": 7.35926270105006
      },
      {
        "date": "2020-12-31",
        "value": 2.86541320912272
      },
      {
        "date": "2021-12-31",
        "value": 2.55372852648131
      },
      {
        "date": "2022-12-31",
        "value": 8.53750041218142
      },
      {
        "date": "2023-12-31",
        "value": 4.97865959483225
      },
      {
        "date": "2024-12-31",
        "value": 7.03955197123018
      },
      {
        "date": "2025-12-31",
        "value": 8.01882998978245
      }
    ]
  },
  "foreign_flow": {
    "status": "unavailable",
    "reason": "Chưa có dữ liệu giao dịch khối ngoại trong snapshot.",
    "date": null,
    "net_value_billion": null,
    "buy_value_billion": null,
    "sell_value_billion": null,
    "cumulative_5d_billion": null,
    "cumulative_20d_billion": null,
    "source": null,
    "source_url": null,
    "reference_links": [
      {
        "label": "Sở GDCK TP.HCM (HOSE)",
        "url": "https://www.hsx.vn/"
      },
      {
        "label": "Thống kê Sở GDCK Hà Nội (HNX)",
        "url": "https://hnx.vn/vi-vn/phai-sinh/thong-ke.html"
      }
    ]
  }
};
