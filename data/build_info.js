window.BUILD_INFO = {
  "schema_version": "dashboard_build_info/v1",
  "market_session": "2026-09-04",
  "producer_run_identity": "8d6a3f248288279d9afaabd46ca44f4dc7827761904f5a718033eee8e14c041c",
  "dashboard_release_identity": "dashboard_release:382f36c8d709e7fbcf14b12218094e32268976d93f56d08f4ebcaf399afe0446",
  "build_id": "382f36c8d7",
  "generated_at": "2026-09-04T16:20:09.727687+00:00",
  "published_at": "2026-09-04T16:20:09.727687+00:00",
  "release_status": "READY",
  "domains": {
    "screening": {
      "status": "CURRENT",
      "source_session": "2026-09-04",
      "freshness": "EXACT_SESSION",
      "reason_codes": []
    },
    "breadth": {
      "status": "CURRENT",
      "source_session": "2026-09-04",
      "freshness": "EXACT_SESSION",
      "reason_codes": []
    },
    "analysis": {
      "status": "CURRENT",
      "source_session": "2026-09-04",
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
      "data_as_of": "2026-09-04",
      "generated_at": "2026-09-04T23:17:44+07:00",
      "freshness": "CADENCE_AWARE",
      "reason_codes": [
        "MACRO_CADENCE_STALE_SERIES_PRESENT"
      ],
      "stale_series_count": 1
    },
    "cockpit": {
      "status": "CURRENT",
      "source_session": "2026-09-04",
      "freshness": "EXACT_SESSION",
      "generated_at": null,
      "reason_codes": []
    }
  },
  "files": {
    "screen_snapshot.csv": {
      "sha256": "bf6d6a7bb034beae2e1484f28d2431eb34da6608b4f1dbd2859ed20e7c81fe1a",
      "size_bytes": 540667
    },
    "screen_snapshot_live.csv": {
      "sha256": "487671e2de1164c5e5710c8e0ede80a4e1e730adb71b2fddc33ef95a85d5da88",
      "size_bytes": 370435
    },
    "market_breadth.csv": {
      "sha256": "c233a30835a063a81d38d41b4f142ecae0f2ab4716ff2d00f3e9c1a5b154d795",
      "size_bytes": 143
    },
    "analysis_latest.json": {
      "sha256": "a2992681d4e6b06505b7ec6ae409ec725739b9980cd166983b1615d6632518df",
      "size_bytes": 3751
    },
    "bundle_manifest.json": {
      "sha256": "54ae3e95f8218730af9729c3e37d12497e1bd63cb82afabab0b60e7694f5e24c",
      "size_bytes": 8279
    },
    "analysis_bundle.json": {
      "sha256": "0892a51150110366d1c2a0dff04b94a05b4e252c0fdc668280e51339f31a63bf",
      "size_bytes": 36741
    },
    "focus_extract.json": {
      "sha256": "507184bafb2477d812e6ac2281ab7b7fa37000b3fcd5ecc7accb7792fca6f044",
      "size_bytes": 4899
    },
    "statement_taxonomy_sidecar.json": {
      "sha256": "061f246e5f879448bf1a9fc05949073b55b079c18faa0a4da04fcd59e2fc1a76",
      "size_bytes": 1684422
    },
    "data/macro_snapshot.json": {
      "sha256": "4f1adc2fef1674e45bac4c7ba7ea40969d6a58013ea2c74975b794fd1a427aa2",
      "size_bytes": 378802
    },
    "data/macro_snapshot.js": {
      "sha256": "c5e7885fbe8d10bb1a3811c1c0a59618431ca493a2a8a0fafb0be241e1fc568a",
      "size_bytes": 378827
    },
    "data/current_decision_cockpit.json": {
      "sha256": "3ebd42aefcdf2a7e25332b7f04a50d7bb8f7d4a2ba63b6fa8dba308564a8cde6",
      "size_bytes": 2389601
    },
    "data/screener_data.js": {
      "sha256": "6f35a5a22b125ebacbe1bfb019149c8ae4f7b607d82775101c3a59b08a2160b6",
      "size_bytes": 1979351
    },
    "data/session_2026_09_04_manifest.json": {
      "sha256": "32f7cce69907779a208dae67a840213a4e3257322a69b3bb41298993c41a781c",
      "size_bytes": 9131
    },
    "report-2026-09-04.html": {
      "sha256": "b5de2530c9101dc28b2f975cdad2e12797baf2b632d941eda9a01202f82e1965",
      "size_bytes": 6484
    }
  },
  "hero_summary": {
    "market_session": "2026-09-04",
    "total_surveyed": 1211,
    "up_count": 0,
    "rs80_count": 0
  }
};
