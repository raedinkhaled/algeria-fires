"""
15_build_pdf.py -- Render the Arabic report to a print-quality PDF.

Markdown -> styled RTL HTML -> PDF via headless Chrome.
Figures (maps and charts) are embedded as base64 data URIs so the PDF is
self-contained. Page setup is A4 portrait with running headers/footers.
"""
import base64, io, os, re, subprocess, sys
import markdown

from arabicutil import western_digits

ROOT = os.path.abspath(".")
MD = os.path.join(ROOT, "report", "report_ar.md")
HTML = os.path.join(ROOT, "report", "report_ar.html")
FONT = os.path.join(ROOT, "assets", "fonts", "NotoSansArabic-Variable.ttf")
COMPACT = os.environ.get("COMPACT") == "1"
PDF = os.path.join(ROOT, "report", "report_ar_compact.pdf" if COMPACT else "report_ar.pdf")
HTML = os.path.join(ROOT, "report", "report_ar_compact.html" if COMPACT else "report_ar.html")

FIGURES = [
    ("maps/MAP1_all_detections.png", "الخريطة ١ — جميع البؤر الحرارية المرصودة، ٢٢–٢٩ أوت ٢٠٢٦"),
    ("maps/MAP2_cluster_first_detections.png", "الخريطة ٢ — أقدم بؤرة حرارية رُصدت لكل تجمّع مستقل مرشّح"),
    ("maps/MAP3_chronological_spread.png", "الخريطة ٣ — التسلسل الزمني لانتشار الحرائق"),
    ("maps/MAP4_wind_vectors.png", "الخريطة ٤ — البؤر الحرارية مع متجهات الرياح"),
    ("maps/MAP5_origins_infrastructure.png", "الخريطة ٥ — بؤر المنشأ فوق التضاريس والطرق والخطوط الكهربائية"),
    ("maps/MAP6_sentinel2_before_after.png", "الخريطة ٦ — Sentinel-2 قبل/بعد وشدّة الاحتراق dNBR"),
    ("charts/C1_C2_detections_frp_time.png", "الشكلان ١ و٢ — عدد البؤر وإجمالي FRP لكل تمريرة"),
    ("charts/C3_frp_by_cluster.png", "الشكل ٣ — مساهمة كل حريق مستقل عبر الزمن"),
    ("charts/C4_fireweather_vs_activity.png", "الشكل ٤ — طقس الحرائق مقابل النشاط الحراري"),
    ("charts/C5_cluster_timeline.png", "الشكل ٥ — الجدول الزمني لأول ظهور لكل حريق مستقل"),
    ("charts/C6_cluster_distance_matrix.png", "الشكل ٦ — مصفوفة المسافات الجيوديسية بين بؤر المنشأ"),
]


def datauri(path):
    """Embed a figure. In COMPACT mode, downsample and re-encode as JPEG so the
    PDF stays under typical attachment limits while remaining legible in print."""
    if not COMPACT:
        with open(path, "rb") as f:
            return "data:image/png;base64," + base64.b64encode(f.read()).decode()
    from PIL import Image
    Image.MAX_IMAGE_PIXELS = None
    im = Image.open(path).convert("RGB")
    im.thumbnail((2000, 2000), Image.LANCZOS)
    buf = io.BytesIO()
    im.save(buf, "JPEG", quality=72, optimize=True, progressive=True)
    return "data:image/jpeg;base64," + base64.b64encode(buf.getvalue()).decode()


md_text = western_digits(open(MD, encoding="utf-8").read())
body = markdown.markdown(md_text, extensions=["tables", "attr_list", "sane_lists"])

# figure gallery appended before the appendices' closing notice
gallery = ['<div class="page-break"></div>', '<h1>الملحق د — لوحات الخرائط والأشكال</h1>']
for rel, cap in FIGURES:
    cap = western_digits(cap)
    p = os.path.join(ROOT, rel)
    if not os.path.exists(p):
        print("  missing figure:", rel)
        continue
    gallery.append(
        '<figure class="plate"><img src="%s" alt="%s"/>'
        '<figcaption>%s<br><span class="fn">%s</span></figcaption></figure>'
        '<div class="page-break"></div>' % (datauri(p), cap, cap, rel))
    print("  embedded", rel, "(%.1f MB)" % (os.path.getsize(p) / 1e6))
body += "\n".join(gallery)

with open(FONT, "rb") as font_file:
    font_uri = "data:font/ttf;base64," + base64.b64encode(font_file.read()).decode()

CSS = """
@font-face {
  font-family: "Noto Sans Arabic Embedded";
  src: url("__FONT_URI__") format("truetype");
  font-style: normal;
  font-weight: 100 900;
}
@page { size: A4 portrait; margin: 18mm 15mm 20mm 15mm; }
@page :first { margin-top: 24mm; }
* { box-sizing: border-box; }
html { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
body {
  direction: rtl; text-align: right;
  font-family: "Noto Sans Arabic Embedded", "Segoe UI", "Tahoma", sans-serif;
  font-variant-numeric: tabular-nums;
  font-size: 9.9pt; line-height: 1.64; color: #14181d; margin: 0;
}
h1 {
  font-size: 17.5pt; color: #7d1d1d; border-bottom: 2.4px solid #7d1d1d;
  padding-bottom: 5px; margin: 26px 0 13px; page-break-after: avoid; line-height: 1.4;
}
h1:first-of-type { border: none; text-align: center; font-size: 21pt; margin-top: 0; }
h2 { font-size: 13.6pt; color: #a33; margin: 20px 0 9px; page-break-after: avoid; line-height: 1.45; }
h3 { font-size: 11.6pt; color: #333; margin: 15px 0 7px; page-break-after: avoid; }
p { margin: 7px 0; text-align: justify; }
table {
  border-collapse: collapse; width: 100%; margin: 12px 0; font-size: 8.7pt;
  page-break-inside: avoid;
}
th, td { border: 1px solid #b9c0c8; padding: 5px 7px; text-align: right; vertical-align: top; }
th { background: #eceff3; font-weight: 700; color: #21262d; }
tr:nth-child(even) td { background: #f8fafb; }
blockquote {
  border-right: 4.5px solid #c0392b; background: #fdf3f2;
  margin: 14px 0; padding: 10px 15px; page-break-inside: avoid;
}
blockquote p:first-child { margin-top: 0; } blockquote p:last-child { margin-bottom: 0; }
code { background: #eef1f4; padding: 1px 4px; border-radius: 3px;
       font-family: Consolas, monospace; font-size: 8.9pt; direction: ltr;
       display: inline-block; }
pre { background: #f4f6f8; border: 1px solid #dde2e7; padding: 10px;
      direction: ltr; text-align: left; font-size: 8.6pt; overflow-x: auto; }
hr { border: none; border-top: 1px solid #ccd2d8; margin: 22px 0; }
ul, ol { padding-right: 22px; padding-left: 0; margin: 7px 0; }
li { margin: 3.5px 0; }
strong { color: #0d1b2a; }
.page-break { page-break-after: always; }
figure.plate { margin: 0; text-align: center; page-break-inside: avoid; }
figure.plate img { max-width: 100%; max-height: 232mm; object-fit: contain;
                   border: 1px solid #c3c9d0; }
figcaption { font-size: 9.2pt; color: #333; margin-top: 7px; font-weight: 600; }
figcaption .fn { font-size: 7.6pt; color: #7a828a; font-weight: 400; direction: ltr;
                 display: inline-block; }
"""
CSS = CSS.replace("__FONT_URI__", font_uri)

html = """<!DOCTYPE html>
<html lang="ar" dir="rtl"><head><meta charset="utf-8">
<title>إعادة بناء جنائي-جغرافي لحرائق ولاية جيجل — أوت 2026</title>
<style>%s</style></head><body>%s</body></html>""" % (CSS, body)

open(HTML, "w", encoding="utf-8").write(html)
print("wrote %s (%.1f MB)" % (HTML, os.path.getsize(HTML) / 1e6))

CHROME = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
if not os.path.exists(CHROME):
    CHROME = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
url = "file:///" + HTML.replace("\\", "/")
cmd = [CHROME, "--headless", "--disable-gpu", "--no-sandbox", "--no-pdf-header-footer",
       "--run-all-compositor-stages-before-draw", "--virtual-time-budget=45000",
       "--print-to-pdf=" + PDF, url]
print("rendering PDF ...")
r = subprocess.run(cmd, capture_output=True, text=True, timeout=600)
if os.path.exists(PDF):
    print("OK  ->  %s  (%.2f MB)" % (PDF, os.path.getsize(PDF) / 1e6))
else:
    print("FAILED\nstdout:", r.stdout[-2000:], "\nstderr:", r.stderr[-2000:])
    sys.exit(1)
