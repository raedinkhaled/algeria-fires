"""Regression checks for text shaping used by the published figures."""

from arabicutil import FONT_PATH, ar, western_digits


def test_bundled_font_is_available():
    assert FONT_PATH.is_file()


def test_multiline_text_keeps_line_breaks_and_ltr_tokens():
    shaped = ar("الخريطة ١ — Sentinel-2\nFRP = 42 MW")

    assert shaped.count("\n") == 1
    assert "Sentinel-2" in shaped
    assert "FRP = 42 MW" in shaped


def test_arabic_text_is_left_for_native_matplotlib_layout():
    source = "المصدر: ناسا"

    assert ar(source) == source


def test_arabic_and_eastern_arabic_digits_become_western():
    assert western_digits("٢٠٢٦ / ۱۴۰۵") == "2026 / 1405"
    assert ar("الخريطة ٤") == "الخريطة 4"
