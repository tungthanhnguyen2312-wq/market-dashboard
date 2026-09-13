window.BUILD_INFO = {
  "schema_version": "dashboard_build_info/v1",
  "market_session": "2026-09-11",
  "producer_run_identity": "5e5db7b46737b2170bb64880042eb581bd159dfebdcb7eb1372885822dafb4f1",
  "dashboard_release_identity": "dashboard_release:5df4fc9442a8fd3fd3844130feb25a4a36cf9ab87e55b79fa2fb9b36241f1d58",
  "build_id": "5df4fc9442",
  "generated_at": "2026-09-13T04:34:34.032026+00:00",
  "published_at": "2026-09-13T04:34:34.032026+00:00",
  "release_status": "READY",
  "domains": {
    "screening": {
      "status": "CURRENT",
      "source_session": "2026-09-11",
      "freshness": "EXACT_SESSION",
      "reason_codes": []
    },
    "breadth": {
      "status": "CURRENT",
      "source_session": "2026-09-11",
      "freshness": "EXACT_SESSION",
      "reason_codes": []
    },
    "analysis": {
      "status": "CURRENT",
      "source_session": "2026-09-11",
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
      "status": "CURRENT",
      "source_session": null,
      "data_as_of": "2026-09-13",
      "generated_at": "2026-09-13T10:37:06+07:00",
      "freshness": "CADENCE_AWARE",
      "reason_codes": [],
      "stale_series_count": 0
    },
    "cockpit": {
      "status": "CURRENT",
      "source_session": "2026-09-11",
      "freshness": "EXACT_SESSION",
      "generated_at": null,
      "reason_codes": []
    },
    "investment_workspace": {
      "status": "CURRENT",
      "source_session": "2026-09-11",
      "freshness": "EXACT_SESSION",
      "artifact_identity": "investment_decision_workspace_projection/v1:3b9d3f4e9034d96916653a1179944fafd14d7ec69e917f01845522b59696db91",
      "reason_codes": []
    },
    "screener_master": {
      "status": "CURRENT",
      "source_session": "2026-09-11",
      "freshness": "EXACT_SESSION",
      "artifact_identity": "screener_master_projection/v1:5d230427354a546876428233554c41db8f532e62039c4aa2b285669f13a74785",
      "reason_codes": []
    }
  },
  "files": {
    "screen_snapshot.csv": {
      "sha256": "86fd4a511b5ab6003914cc206eebfce8697c8ae5e4cb006108018ef1b0b431cd",
      "size_bytes": 571728
    },
    "screen_snapshot_live.csv": {
      "sha256": "20552a996b7c2a041ad2b8079657ca1f05154c3c2cbb76b9759c05d3b09c7690",
      "size_bytes": 399941
    },
    "market_breadth.csv": {
      "sha256": "07d6b0096b4475ebfefc5749c98bc268b20dc840df206f8f938dce7c49cc4279",
      "size_bytes": 143
    },
    "analysis_latest.json": {
      "sha256": "6d9940b5a16b81d2f18cefff617970833710ad6684887b0a55318482898a7fc7",
      "size_bytes": 4571
    },
    "bundle_manifest.json": {
      "sha256": "29c7a870a66239cf0ce21bf139c5e49a08efa6a9037a3988682522f85abc7267",
      "size_bytes": 9117
    },
    "analysis_bundle.json": {
      "sha256": "29f4ab33fc7fa2b9aac14dc295e7f2b603012562762cad798404c25693153c1a",
      "size_bytes": 37099
    },
    "focus_extract.json": {
      "sha256": "7aac5684afede24abf3e533f1bc8c3d007190e0496d2fa952ee66d96071550b9",
      "size_bytes": 5257
    },
    "statement_taxonomy_sidecar.json": {
      "sha256": "a8385ac1a41afc1069d6aa7399c178b9e7827c8b68d7c92e2701e955176ea12a",
      "size_bytes": 1684422
    },
    "data/macro_snapshot.json": {
      "sha256": "a3739314044922fa56fecd6343acaa88656fa9eae0f8ccc31ea6346ea8986aea",
      "size_bytes": 379716
    },
    "data/macro_snapshot.js": {
      "sha256": "bf5bfeae404cf2eef7e32d1a8c25680defa0bc75c3d03f68ddd1279d17e02473",
      "size_bytes": 379741
    },
    "data/current_decision_cockpit.json": {
      "sha256": "a11ed1b302f977a29df7cc62c0882be303468554b1a85c639670809dc5504aad",
      "size_bytes": 2084109
    },
    "data/investment_decision_workspace.json": {
      "sha256": "4405ce53598cc512bd86b60237bddcc3b6df55f02ecec6dd205922ac5c990fc9",
      "size_bytes": 50311269
    },
    "data/screener_master_projection.json": {
      "sha256": "3a859b337c2234d9905fd6ad9682393fc1470392973176d2e202817bab86cd51",
      "size_bytes": 5722926
    },
    "data/screener_master_projection.js": {
      "sha256": "9f9d8f7affa2361c4cbffc0aec258b316350fdd47aef9864215cc56f6c89f7c9",
      "size_bytes": 4147237
    },
    "data/screener_data.js": {
      "sha256": "9b8766c859d1b3353d02df05c7af1e442259805dd8d176d18b26d629fee5670a",
      "size_bytes": 2010412
    },
    "data/session_2026_09_11_manifest.json": {
      "sha256": "4ca0aa8abf462dd29764898973f6d768baf87043b19e79ea4080a6e21d1e2564",
      "size_bytes": 9223
    },
    "report-2026-09-11.html": {
      "sha256": "cc41e357ee7651439b53b5e5cfda4b939e25ad325fa87dc4d6f187824b3a7512",
      "size_bytes": 6573
    }
  },
  "hero_summary": {
    "market_session": "2026-09-11",
    "total_surveyed": 1211,
    "up_count": 0,
    "rs80_count": 0
  }
};
