window.BUILD_INFO = {
  "schema_version": "dashboard_build_info/v1",
  "market_session": "2026-09-04",
  "producer_run_identity": "da72cffb2811612e9e4a2d3afb71db51dfaace31a3398cd47d95b48538aef18d",
  "dashboard_release_identity": "dashboard_release:73d10e108750f38983241c4f21dddf2051d6788db9f4246ede0285ebb81fa6c6",
  "build_id": "73d10e1087",
  "generated_at": "2026-09-04T23:57:59.937468+00:00",
  "published_at": "2026-09-04T23:57:59.937468+00:00",
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
      "data_as_of": "2026-09-05",
      "generated_at": "2026-09-05T06:56:11+07:00",
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
      "sha256": "83a8963514b65f53542b2957afb6cf2bb30d25dffddd885e7a3dbfa0ff9c00c9",
      "size_bytes": 4571
    },
    "bundle_manifest.json": {
      "sha256": "5c09615516a139d85dc89330c5fe4a93fad01bf0738c987c4e8119df169aaa5f",
      "size_bytes": 9117
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
      "sha256": "4d0965c32a84bd969e899c23f328380ab2dd4e012a55c2fa7820fa09cefb23f5",
      "size_bytes": 378960
    },
    "data/macro_snapshot.js": {
      "sha256": "b7415403e69767457c7e27bf2d465d7de4a3f835fdc0c763586a8b53f6f4c274",
      "size_bytes": 378985
    },
    "data/current_decision_cockpit.json": {
      "sha256": "123fc268b60407de4469e36ae4f4e6b06f2e9b254802215e22deb190d771aecb",
      "size_bytes": 2389601
    },
    "data/screener_data.js": {
      "sha256": "6f35a5a22b125ebacbe1bfb019149c8ae4f7b607d82775101c3a59b08a2160b6",
      "size_bytes": 1979351
    },
    "data/session_2026_09_04_manifest.json": {
      "sha256": "a245404cf5658b6b4814a2bc4b7f1c74d2b5cefa870beff8ffb317a404439efa",
      "size_bytes": 9129
    },
    "report-2026-09-04.html": {
      "sha256": "6c983cae2f5e78f866045d7887d675d6f3dae96164bc56d1b8eee4308d77d2aa",
      "size_bytes": 6477
    }
  },
  "hero_summary": {
    "market_session": "2026-09-04",
    "total_surveyed": 1211,
    "up_count": 0,
    "rs80_count": 0
  }
};
