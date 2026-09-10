window.BUILD_INFO = {
  "schema_version": "dashboard_build_info/v1",
  "market_session": "2026-09-10",
  "producer_run_identity": "048d3bfc7cb032fe76616344b326acf67507dc3116af237bd7baf93a8dd3bd7e",
  "dashboard_release_identity": "dashboard_release:52c736f5d04f232c49ca66d45f6a7597daa394c0b1d3c7726cdf83126a8b6769",
  "build_id": "52c736f5d0",
  "generated_at": "2026-09-10T10:23:21.773388+00:00",
  "published_at": "2026-09-10T10:23:21.773388+00:00",
  "release_status": "READY",
  "domains": {
    "screening": {
      "status": "CURRENT",
      "source_session": "2026-09-10",
      "freshness": "EXACT_SESSION",
      "reason_codes": []
    },
    "breadth": {
      "status": "CURRENT",
      "source_session": "2026-09-10",
      "freshness": "EXACT_SESSION",
      "reason_codes": []
    },
    "analysis": {
      "status": "CURRENT",
      "source_session": "2026-09-10",
      "freshness": "EXACT_SESSION",
      "reason_codes": []
    },
    "signals": {
      "status": "STALE",
      "source_session": null,
      "freshness": "EXACT_SESSION",
      "reason_codes": [
        "SIGNAL_COMPONENT_NOT_EXACT_SESSION"
      ],
      "components": {
        "candle_signals": {
          "status": "STALE",
          "source_session": "2026-08-25",
          "generated_at": "2026-08-26T06:23:51Z",
          "reason_codes": [
            "SIGNAL_SOURCE_SESSION_MISMATCH"
          ]
        },
        "sector_heatmap": {
          "status": "STALE",
          "source_session": "2026-08-25",
          "generated_at": "2026-08-26T06:23:51Z",
          "reason_codes": [
            "SIGNAL_SOURCE_SESSION_MISMATCH"
          ]
        },
        "candlestick_patterns": {
          "status": "STALE",
          "source_session": "2026-08-25",
          "generated_at": "2026-08-26T06:23:51.785327+00:00",
          "reason_codes": [
            "SIGNAL_SOURCE_SESSION_MISMATCH"
          ]
        }
      }
    },
    "macro": {
      "status": "PARTIAL",
      "source_session": null,
      "data_as_of": "2026-09-10",
      "generated_at": "2026-09-10T17:21:59+07:00",
      "freshness": "CADENCE_AWARE",
      "reason_codes": [
        "MACRO_CADENCE_STALE_SERIES_PRESENT"
      ],
      "stale_series_count": 2
    },
    "cockpit": {
      "status": "CURRENT",
      "source_session": "2026-09-10",
      "freshness": "EXACT_SESSION",
      "generated_at": null,
      "reason_codes": []
    }
  },
  "files": {
    "screen_snapshot.csv": {
      "sha256": "09370d6d24103b17cd91439c15cb76bfcf1735ff4d5a963b4b21cae454decc3b",
      "size_bytes": 548733
    },
    "screen_snapshot_live.csv": {
      "sha256": "2b9aa6d7f1806142d646848f7be0d685f7bf6dec33d0f1aad4f9b3fff706baf1",
      "size_bytes": 345252
    },
    "market_breadth.csv": {
      "sha256": "638f4b0c7c7f901d8b8380ab18d5c33fe9d204b32d4968d4fc4835b9bf53cbcf",
      "size_bytes": 143
    },
    "analysis_latest.json": {
      "sha256": "5efbb81767ac0d43cf186f5541c5745723ceacf8aad39a5b30641b59fddabd55",
      "size_bytes": 3751
    },
    "bundle_manifest.json": {
      "sha256": "6502bc75dbe312f3c4354db457351b7e492cba3328e733175c34f73f5d6e67dd",
      "size_bytes": 8279
    },
    "analysis_bundle.json": {
      "sha256": "ee1f2d3f422f888e472c50fdc3c9234ae63f6feb6bc9089e16798fd395e806fb",
      "size_bytes": 37098
    },
    "focus_extract.json": {
      "sha256": "f4f68b98df0bb9f0a67abd4c658eb493d8ed5acd8164130dec613e1341aaf122",
      "size_bytes": 5256
    },
    "statement_taxonomy_sidecar.json": {
      "sha256": "67f6736390336abab1eb28c2b839c39404b38d663fd45b6a0b39337562581a16",
      "size_bytes": 1684422
    },
    "data/macro_snapshot.json": {
      "sha256": "c71d4505ae8e3c9506f745d27621f4adab69bfe39cacbdf5a20ed97c2c8f835f",
      "size_bytes": 379406
    },
    "data/macro_snapshot.js": {
      "sha256": "2779e17f61ceb5b744320db15917ca0a4e23fd512e23649ad8dbd8fa13bed602",
      "size_bytes": 379431
    },
    "data/current_decision_cockpit.json": {
      "sha256": "5221d0a9938f34c452483e23d470bf551ea72dda919edc3f80d21ec92c717581",
      "size_bytes": 2312257
    },
    "data/screener_data.js": {
      "sha256": "c1d54ad5ff8646e64c87bfb178ce19ccfb644f17ee8362e19138d493914bb3e9",
      "size_bytes": 1987417
    },
    "data/session_2026_09_10_manifest.json": {
      "sha256": "53a6d913e3fb7392d1dca9a8208ae16e6fc384e9feb4b664c939c6836332e01e",
      "size_bytes": 9215
    },
    "report-2026-09-10.html": {
      "sha256": "8c0ea81939e78313406c9d0384072cbd2c376e2cc461926bf152fad2b389930a",
      "size_bytes": 6564
    }
  },
  "hero_summary": {
    "market_session": "2026-09-10",
    "total_surveyed": 1211,
    "up_count": 0,
    "rs80_count": 0
  }
};
