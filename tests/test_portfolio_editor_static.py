from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def test_portfolio_editor_has_local_only_persistence_and_portability_controls():
    html = (ROOT / "portfolio.html").read_text(encoding="utf-8")
    script = (ROOT / "portfolio.js").read_text(encoding="utf-8")
    assert "Stored only in this browser" in html
    for token in ("localStorage", "Export JSON", "Import JSON", "Clear/reset", "Add position", "Remove"):
        assert token in html or token in script
    assert "Exact execution capacity" in html
