window.BUILD_INFO = {
  "schema_version": "dashboard_build_info/v1",
  "market_session": "2026-09-14",
  "producer_run_identity": "recovery_operation",
  "dashboard_release_identity": "dashboard_release:ba19682e2d4e55f0fbd28b1dd7f7219b316194a4a7eeb537d13ac6b2b8d6cfcf",
  "build_id": "ba19682e2d",
  "generated_at": "2026-09-15T09:44:05.841443+00:00",
  "published_at": "2026-09-15T09:44:05.841443+00:00",
  "release_status": "READY",
  "domains": {
    "screening": {
      "status": "CURRENT",
      "source_session": "2026-09-14",
      "freshness": "EXACT_SESSION",
      "reason_codes": []
    },
    "breadth": {
      "status": "CURRENT",
      "source_session": "2026-09-14",
      "freshness": "EXACT_SESSION",
      "reason_codes": []
    },
    "analysis": {
      "status": "CURRENT",
      "source_session": "2026-09-14",
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
      "data_as_of": "2026-09-14",
      "generated_at": "2026-09-14T18:33:22+07:00",
      "freshness": "CADENCE_AWARE",
      "reason_codes": [
        "MACRO_CADENCE_STALE_SERIES_PRESENT"
      ],
      "stale_series_count": 1
    },
    "cockpit": {
      "status": "STALE",
      "source_session": "2026-09-11",
      "freshness": "EXACT_SESSION",
      "generated_at": null,
      "reason_codes": [
        "COCKPIT_SESSION_MISMATCH"
      ]
    },
    "investment_workspace": {
      "status": "CURRENT",
      "source_session": "2026-09-14",
      "freshness": "EXACT_SESSION",
      "artifact_identity": "investment_decision_workspace_projection/v1:e7fff46a8a26bebc3276507cb721b399b45180b58efd73e50769e7c8736c1418",
      "reason_codes": []
    },
    "screener_master": {
      "status": "CURRENT",
      "source_session": "2026-09-14",
      "freshness": "EXACT_SESSION",
      "artifact_identity": "screener_master_projection/v1:87976144b119fa3ed5392edbc9527ad569224a03cf979cada98d347c10a23997",
      "reason_codes": []
    }
  },
  "files": {
    "screen_snapshot.csv": {
      "sha256": "4782319549c58c2e64d086a97a79cc3b660f3efb11d5e7cfdd5090c34c195528",
      "size_bytes": 526588
    },
    "screen_snapshot_live.csv": {
      "sha256": "88decaeda3abe1887aa19b9086edf0cbf01ae7684791460ce67780f681fb8a7f",
      "size_bytes": 330131
    },
    "market_breadth.csv": {
      "sha256": "de37400ca29c2c177d9d6942710ef9be2f12edeef22d4d130bf7de94ff5a5116",
      "size_bytes": 143
    },
    "analysis_latest.json": {
      "sha256": "56414d83bddf5aad3817567f2997a2f6c4dbfe9cf6dbe2157a690c790a94706a",
      "size_bytes": 3751
    },
    "bundle_manifest.json": {
      "sha256": "5022bce31884cabcd03861f879213aaa70de6f45a2aa85f1221647f57ff434c1",
      "size_bytes": 8279
    },
    "analysis_bundle.json": {
      "sha256": "7bf4b3e7c267310ce015d7e136cb7746fd3d2fb587f118636388fc3c94483ac2",
      "size_bytes": 36738
    },
    "focus_extract.json": {
      "sha256": "003d7d4177c8b3ac4578496deba2176650cca3f5703cd609e43df66ceaaccc0f",
      "size_bytes": 4896
    },
    "statement_taxonomy_sidecar.json": {
      "sha256": "b73ce75d381af740b583daa4312ecf97a1d6ca57f8d191cb6392ed5dacbb9cdc",
      "size_bytes": 1684422
    },
    "data/macro_snapshot.json": {
      "sha256": "51452b575f6e0e4e6ee8062b0c39543b14545996587385f9feb087e1898a0721",
      "size_bytes": 379884
    },
    "data/macro_snapshot.js": {
      "sha256": "b483e678efe089b737ce8358bb63f3899f4e0a7e4cbe8c2811b51690a445fc8d",
      "size_bytes": 379909
    },
    "data/investment_decision_workspace.json": {
      "sha256": "827cd25812c62c0348db76aaef5e049242d06a52a2871e3dc186cc50fc7a137a",
      "size_bytes": 51008460
    },
    "data/screener_master_projection.json": {
      "sha256": "d850c1318cb1eb43edaa9a46a7091d63bfa2d8b2adf439bdea2f40b32ce7e563",
      "size_bytes": 6663371
    },
    "data/screener_master_projection.js": {
      "sha256": "894c20bfec377181cb4b01411b29b35a5d52590bf0277ae5c68f5dea3160f2d2",
      "size_bytes": 4927611
    },
    "data/screener_data.js": {
      "sha256": "42b75592295c678010a04909d8bab0a1073404b15e686ab586d2157970ffc129",
      "size_bytes": 1965272
    }
  },
  "hero_summary": {
    "market_session": "2026-09-14",
    "total_surveyed": 1211,
    "up_count": 0,
    "rs80_count": 0
  }
};
