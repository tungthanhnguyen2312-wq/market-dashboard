from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def test_portfolio_editor_has_local_only_persistence_and_portability_controls():
    html = (ROOT / "portfolio.html").read_text(encoding="utf-8")
    script = (ROOT / "portfolio.js").read_text(encoding="utf-8")
    assert "Chỉ lưu trên trình duyệt này" in html
    for token in ("localStorage", "Xuất dữ liệu", "Nhập dữ liệu", "Xóa danh mục", "Thêm vị thế", "Xóa"):
        assert token in html or token in script
    assert "Năng lực thực hiện lệnh chính xác" in html
