window.BUILD_INFO = {
  "schema_version": "dashboard_build_info/v1",
  "market_session": "2026-08-28",
  "producer_run_identity": "4526232cea2220ae89fc1a2fca4695ff17e00415e5bd0a51547688e2f2046074",
  "dashboard_release_identity": "dashboard_release:7efbecec38c30dcb1d48118ae11aac5ec1b83ab4851de3c1c0ae9308d34d2429",
  "build_id": "7efbecec38",
  "generated_at": "2026-08-30T12:32:37.717053+00:00",
  "published_at": "2026-08-30T12:32:37.717053+00:00",
  "release_status": "READY",
  "domains": {
    "screening": {
      "status": "CURRENT",
      "source_session": "2026-08-28",
      "freshness": "EXACT_SESSION",
      "reason_codes": []
    },
    "breadth": {
      "status": "CURRENT",
      "source_session": "2026-08-28",
      "freshness": "EXACT_SESSION",
      "reason_codes": []
    },
    "analysis": {
      "status": "CURRENT",
      "source_session": "2026-08-28",
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
      "data_as_of": "2026-08-30",
      "generated_at": "2026-08-30T19:32:29+07:00",
      "freshness": "CADENCE_AWARE",
      "reason_codes": [],
      "stale_series_count": 0
    },
    "cockpit": {
      "status": "CURRENT",
      "source_session": "2026-08-28",
      "freshness": "EXACT_SESSION",
      "generated_at": null,
      "reason_codes": []
    }
  },
  "files": {
    "screen_snapshot.csv": {
      "sha256": "d5c00efb6af7bab14d5f9e13ad5d29ac93f215dd0936a826063c25de0899af5d",
      "size_bytes": 568638
    },
    "screen_snapshot_live.csv": {
      "sha256": "767eabea32205cccee7c5fc4afbc9a9330259c6560b497f01de152d170a4315f",
      "size_bytes": 394590
    },
    "market_breadth.csv": {
      "sha256": "593072693c96270db01cd757bb7598fb96dc0f09882a4ce83ceaaf166ace5887",
      "size_bytes": 141
    },
    "analysis_latest.json": {
      "sha256": "3d25c591d2cf5a82feda5840d2a9796f66dde991dc9fd9c6a98b7ebddc325369",
      "size_bytes": 4571
    },
    "bundle_manifest.json": {
      "sha256": "8f5f61e1bbcd347f9ec7a80d0f2126e6ee8c18b04f4df90dd7bf58242c6c2baa",
      "size_bytes": 9117
    },
    "analysis_bundle.json": {
      "sha256": "63fb7c9cea1f9bb9f7c9c7721d1562e791d7173c3c7ec4300d2fd3ef73977570",
      "size_bytes": 37102
    },
    "focus_extract.json": {
      "sha256": "2efb1d884d04c382efc6d747691e5dc7fcca845d9679041dee6d7e653ce50f0d",
      "size_bytes": 5260
    },
    "statement_taxonomy_sidecar.json": {
      "sha256": "01762c205187af6416d49fe9a4e60ed6a8c5679b1c8ccae002b93ec2a8a49d97",
      "size_bytes": 1684422
    },
    "data/macro_snapshot.json": {
      "sha256": "6cf3ca59ea67a540baa2102abf18c5333934b096316f89654673cea4061f3b53",
      "size_bytes": 378695
    },
    "data/macro_snapshot.js": {
      "sha256": "d1fafdb72c9aa7c55a8f23f930a6c8cecb14e6e003f4e356e36d6c1fbc283084",
      "size_bytes": 378720
    },
    "data/current_decision_cockpit.json": {
      "sha256": "4b0969c85556dcd2a16cbdcdc4e51a46f69473b035044dde87fa0fc30e6c7e2b",
      "size_bytes": 2412457
    },
    "data/screener_data.js": {
      "sha256": "6312b859dc454ce64c15a87302df15a98bf3ae4edab4c17d149388ef59765ec6",
      "size_bytes": 2007320
    },
    "data/session_2026_08_28_manifest.json": {
      "sha256": "d5fee8305d28f5bbdbe570ca16d833b3a0b83a753af57c05634fe1fb25b07065",
      "size_bytes": 9106
    },
    "report-2026-08-28.html": {
      "sha256": "0e291072a4c8761fcbe8f0af4cbd99e6c5793cddda4d2e17a0a9b8ba8b3047dd",
      "size_bytes": 6456
    }
  },
  "hero_summary": {
    "market_session": "2026-08-28",
    "total_surveyed": 1211,
    "up_count": 0,
    "rs80_count": 0
  }
};
