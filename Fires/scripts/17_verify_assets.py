"""Verify the publishable investigation assets and optionally make QA sheets."""

from __future__ import annotations

import argparse
from pathlib import Path

from PIL import Image, ImageDraw
from pypdf import PdfReader


ROOT = Path(__file__).resolve().parents[1]
EXPECTED_FIGURES = [
    *(ROOT / "maps").glob("MAP*.png"),
    *(ROOT / "charts").glob("C*.png"),
]


def verify() -> None:
    assert len(list((ROOT / "maps").glob("MAP*.png"))) == 6
    assert len(list((ROOT / "charts").glob("C*.png"))) == 5

    for figure in EXPECTED_FIGURES:
        with Image.open(figure) as image:
            assert image.width >= 1_600, f"{figure.name} is too narrow"
            assert image.height >= 900, f"{figure.name} is too short"

    for filename in ("report_ar.pdf", "report_ar_compact.pdf"):
        report = ROOT / "report" / filename
        assert len(PdfReader(report).pages) == 46, f"{filename} must have 46 pages"


def make_contact_sheets(page_dir: Path, output_dir: Path) -> None:
    pages = sorted(page_dir.glob("page-*.png"))
    assert len(pages) == 46, "render all 46 report pages before making contact sheets"
    output_dir.mkdir(parents=True, exist_ok=True)

    for start in range(0, len(pages), 12):
        group = pages[start : start + 12]
        canvas = Image.new("RGB", (1_200, 1_700), "#d7d7d2")
        draw = ImageDraw.Draw(canvas)
        for index, path in enumerate(group):
            with Image.open(path) as page:
                page.thumbnail((280, 390), Image.Resampling.LANCZOS)
                column, row = index % 4, index // 4
                x, y = 15 + column * 295, 28 + row * 550
                canvas.paste(page.convert("RGB"), (x, y))
                draw.text((x, y - 19), path.stem, fill="#202020")
        first, last = start + 1, start + len(group)
        canvas.save(output_dir / f"report-pages-{first:02d}-{last:02d}.jpg", quality=88)


def make_figure_sheet(output: Path) -> None:
    figures = sorted(EXPECTED_FIGURES)
    canvas = Image.new("RGB", (1_800, 2_400), "#d7d7d2")
    draw = ImageDraw.Draw(canvas)
    for index, path in enumerate(figures):
        with Image.open(path) as figure:
            figure.thumbnail((570, 500), Image.Resampling.LANCZOS)
            column, row = index % 3, index // 3
            x, y = 15 + column * 595, 35 + row * 585
            canvas.paste(figure.convert("RGB"), (x, y))
            draw.text((x, y - 22), path.name, fill="#202020")
    output.parent.mkdir(parents=True, exist_ok=True)
    canvas.save(output, quality=90)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--pages", type=Path, help="directory of Poppler-rendered pages")
    parser.add_argument("--sheets", type=Path, help="directory for QA contact sheets")
    parser.add_argument("--figures-sheet", type=Path, help="output path for a figure sheet")
    args = parser.parse_args()

    verify()
    if args.pages and args.sheets:
        make_contact_sheets(args.pages, args.sheets)
    if args.figures_sheet:
        make_figure_sheet(args.figures_sheet)
    print("Investigation assets verified.")


if __name__ == "__main__":
    main()
