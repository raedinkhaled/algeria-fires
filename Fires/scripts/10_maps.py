"""
10_maps.py -- Cartographic products, labelled in Arabic.

MAP 1  all thermal detections 22-29 Aug, coloured by time
MAP 2  earliest detection of each independent cluster only
MAP 3  chronological spread, six time panels
MAP 4  detections with wind vectors
MAP 5  candidate origins over terrain, roads and settlements
MAP 6  Sentinel-2 before / after / burn severity

Coordinate reference: WGS84 geographic (EPSG:4326), axes in decimal degrees,
aspect corrected for latitude. Relief from Copernicus DEM GLO-30.
"""
import csv, json, os, math, sys, datetime as dt
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import numpy as np
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import matplotlib.dates as mdates
from matplotlib.colors import ListedColormap, BoundaryNorm, LinearSegmentedColormap
from matplotlib.lines import Line2D
from matplotlib.patches import Patch
import rasterio
from rasterio.merge import merge as rio_merge
from shapely.geometry import shape
from PIL import Image
from arabicutil import ar, add_north_arrow, add_scalebar, hillshade, credit

Image.MAX_IMAGE_PIXELS = None
PRO, RAW, MAPS, SAT = "data/processed", "data/raw", "maps", "satellite"
os.makedirs(MAPS, exist_ok=True)
EXT = [5.32, 6.62, 36.44, 37.00]
LATC = 36.72
ASP = 1.0 / math.cos(math.radians(LATC))
SRC = ("المصدر: NASA FIRMS (VIIRS 375 م / MODIS)، ESA Copernicus Sentinel-2، Copernicus DEM GLO-30، "
       "OpenStreetMap، Open-Meteo.  الإعداد: إعادة بناء جنائي-جغرافي، أوت 2026.  "
       "التوقيت المحلي = ت.ع.م +1")

# ---------------------------------------------------------------- base layers
srcs = [rasterio.open(os.path.join(RAW, f)) for f in ("copdem_N36_00_E005.tif", "copdem_N36_00_E006.tif")]
dem, dtr = rio_merge(srcs, bounds=(EXT[0], EXT[2], EXT[1], EXT[3]))
dem = dem[0].astype(np.float32)
for s in srcs:
    s.close()
dem_ext = [dtr.c, dtr.c + dem.shape[1] * dtr.a, dtr.f + dem.shape[0] * dtr.e, dtr.f]
mx = dtr.a * 111320.0 * math.cos(math.radians(LATC))
my = abs(dtr.e) * 110540.0
HS = hillshade(dem, mx, my)
SEA = dem <= 0


def basemap(ax, relief=True, sea=True):
    if relief:
        ax.imshow(HS, extent=dem_ext, cmap="Greys_r", vmin=0.05, vmax=1.05, alpha=0.55, zorder=0)
        ax.imshow(np.ma.masked_where(SEA, dem), extent=dem_ext, cmap="terrain",
                  vmin=-300, vmax=1700, alpha=0.28, zorder=1)
    if sea:
        ax.imshow(np.ma.masked_where(~SEA, np.ones_like(dem)), extent=dem_ext,
                  cmap=ListedColormap(["#bcd6ea"]), zorder=2)
    for g, nm, arn in COMMUNES:
        for poly in (g.geoms if g.geom_type == "MultiPolygon" else [g]):
            xs, ys = poly.exterior.xy
            ax.plot(xs, ys, color="#555555", lw=0.55, alpha=0.75, zorder=3)
    ax.set_xlim(EXT[0], EXT[1]); ax.set_ylim(EXT[2], EXT[3])
    ax.set_aspect(ASP)
    ax.set_xlabel(ar("خط الطول (شرقاً)"), fontsize=9)
    ax.set_ylabel(ar("خط العرض (شمالاً)"), fontsize=9)
    ax.tick_params(labelsize=8)


COMS = json.load(open(os.path.join(RAW, "jijel_communes.geojson"), encoding="utf-8"))["features"]
ARN = {}
import re
LAT_RE = re.compile(r"^[A-Za-zÀ-ɏ' \-’]+")
for e in json.load(open(os.path.join(RAW, "osm_jijel_places.json"), encoding="utf-8"))["elements"]:
    if e["type"] == "relation" and e.get("tags", {}).get("admin_level") == "8":
        m = LAT_RE.match(e["tags"].get("name", ""))
        ARN[e["id"]] = (m.group(0).strip() if m else "", e["tags"].get("name:ar", ""),
                        e["center"]["lat"], e["center"]["lon"])
COMMUNES = []
for f in COMS:
    nm, arn, cla, clo = ARN.get(f["properties"]["osm_id"], (f["properties"]["name"], "", None, None))
    COMMUNES.append((shape(f["geometry"]), nm, arn))
CENTRES = {v[0]: (v[1], v[2], v[3]) for v in ARN.values() if v[2]}

KEY_COMMUNES = ["Chekfa", "Texenna", "Ziama Mansouriah", "Djemaa Beni Habibi", "Sidi Maarouf",
                "Ouled Yahia Khedrouche", "Bordj Tahar", "Ghebala", "El Milia", "Jijel",
                "Taher", "El Ancer", "Selma Ben Ziada", "Erraguene", "Settara", "Boudria Ben Yadjis"]


def label_communes(ax, fs=7.4):
    for nm in KEY_COMMUNES:
        if nm not in CENTRES:
            continue
        arn, la, lo = CENTRES[nm]
        if not (EXT[0] < lo < EXT[1] and EXT[2] < la < EXT[3]):
            continue
        ax.plot(lo, la, marker="s", ms=3.0, color="#111111", zorder=20)
        ax.text(lo, la + 0.012, ar(arn), fontsize=fs, ha="center", va="bottom", zorder=21,
                color="#111111",
                bbox=dict(fc="white", ec="none", alpha=0.68, pad=0.9))


# ---------------------------------------------------------------- data
det = list(csv.DictReader(open(os.path.join(PRO, "hotspots_wildfire_only.csv"), encoding="utf-8")))
for d in det:
    d["lat"] = float(d["latitude"]); d["lon"] = float(d["longitude"])
    d["epoch"] = int(d["epoch"]); d["frp"] = float(d["frp_mw"]) if d["frp_mw"] else 0.0
    d["tloc"] = dt.datetime.strptime(d["datetime_local"], "%Y-%m-%d %H:%M")
det.sort(key=lambda d: d["epoch"])
EV = list(csv.DictReader(open(os.path.join(PRO, "fire_events_clean.csv"), encoding="utf-8")))
ORI = list(csv.DictReader(open(os.path.join(PRO, "origin_terrain_infrastructure.csv"), encoding="utf-8")))
PATCH = list(csv.DictReader(open(os.path.join(PRO, "burn_patches.csv"), encoding="utf-8")))

NAME_AR = {"F00": "إيراقن/جنوب غرب", "F01": "زيامة منصورية (١)", "F02": "زيامة منصورية (٢)",
           "F05": "زيامة منصورية — الحريق الكبير", "F06": "الجمعة بني حبيبي", "F07": "سيدي معروف",
           "F08": "الشقفة — المجمّع الرئيسي", "F09": "زيامة/الساحل الغربي", "F10": "شرق جيجل (سطارة/القل)"}
# hand-tuned label offsets (points) so the callouts do not overlap each other,
# the scale bar, or the coastline
LBL_OFF = {"F00": (26, -30), "F01": (152, -64), "F02": (268, 40), "F05": (150, -6),
           "F06": (14, 12), "F07": (16, -34), "F08": (10, 16), "F09": (-40, 34),
           "F10": (-124, 16)}

t0 = dt.datetime(2026, 8, 22, 0, 0)
t1 = dt.datetime(2026, 8, 30, 0, 0)


def tnum(d):
    return mdates.date2num(d)


# ================================================================== MAP 1
fig, ax = plt.subplots(figsize=(15.5, 9.2), dpi=190)
basemap(ax)
sc = ax.scatter([d["lon"] for d in det], [d["lat"] for d in det],
                c=[tnum(d["tloc"]) for d in det], cmap="turbo",
                vmin=tnum(t0), vmax=tnum(t1),
                s=[max(3.0, min(52, 3 + d["frp"] * 0.30)) for d in det],
                alpha=0.80, linewidths=0, zorder=10)
label_communes(ax)
cb = fig.colorbar(sc, ax=ax, pad=0.012, fraction=0.030)
cb.set_ticks([tnum(dt.datetime(2026, 8, x)) for x in range(22, 31)])
cb.ax.set_yticklabels([ar("%d أوت" % x) for x in range(22, 31)], fontsize=8)
cb.set_label(ar("تاريخ أول رصد (توقيت محلي)"), fontsize=9)
ax.set_title(ar("الخريطة ١ — جميع البؤر الحرارية المرصودة في ولاية جيجل وجوارها، ٢٢–٢٩ أوت ٢٠٢٦")
             + "\n" + ar("VIIRS 375 م (Suomi-NPP / NOAA-20 / NOAA-21) و MODIS — حجم الرمز يتناسب مع قوة الإشعاع الحراري FRP"),
             fontsize=12.5, pad=11)
add_north_arrow(ax); add_scalebar(ax, LATC, 20)
credit(fig, SRC)
fig.tight_layout(rect=[0, 0.012, 1, 1])
fig.savefig(os.path.join(MAPS, "MAP1_all_detections.png"), bbox_inches="tight")
plt.close(fig)
print("MAP1 done  n=%d" % len(det))

# ================================================================== MAP 2
fig, ax = plt.subplots(figsize=(15.5, 9.2), dpi=190)
basemap(ax)
ax.scatter([d["lon"] for d in det], [d["lat"] for d in det], s=2.0, color="#c9c9c9",
           alpha=0.55, linewidths=0, zorder=6)
cols = plt.cm.tab10(np.linspace(0, 1, 10))
big = [o for o in ORI if float(o["area_km2"]) >= 0.4]
big.sort(key=lambda o: o["first_local"])
for i, o in enumerate(big):
    la, lo = float(o["lat"]), float(o["lon"])
    ax.scatter([lo], [la], s=280, marker="*", color=cols[i % 10], edgecolor="black",
               linewidth=1.0, zorder=25)
    lbl = "%s  %s\n%s" % (o["event_id"], o["first_local"][5:], NAME_AR.get(o["event_id"], ""))
    ax.annotate(ar(lbl), (lo, la), textcoords="offset points",
                xytext=LBL_OFF.get(o["event_id"], (9, 9)), fontsize=8.0,
                zorder=26, bbox=dict(fc="white", ec=cols[i % 10], lw=1.0, alpha=0.92, pad=1.7),
                arrowprops=dict(arrowstyle="-", color=cols[i % 10], lw=0.8, shrinkA=0, shrinkB=7))
label_communes(ax)
ax.set_title(ar("الخريطة ٢ — أقدم بؤرة حرارية رُصدت لكل تجمّع مستقل مرشّح")
             + "\n" + ar("تنبيه منهجي: هذه نقاط أول رصد فضائي وليست نقاط اشتعال مؤكدة؛ الاشتعال يسبق الرصد بفترة غير معلومة"),
             fontsize=12.5, pad=11)
add_north_arrow(ax); add_scalebar(ax, LATC, 20, x=0.40, y=0.032)
credit(fig, SRC)
fig.tight_layout(rect=[0, 0.012, 1, 1])
fig.savefig(os.path.join(MAPS, "MAP2_cluster_first_detections.png"), bbox_inches="tight")
plt.close(fig)
print("MAP2 done  clusters=%d" % len(big))

# ================================================================== MAP 3
PANELS = [(dt.datetime(2026, 8, 22), dt.datetime(2026, 8, 25), "٢٢–٢٤ أوت — نشاط متفرّق سابق للانفجار"),
          (dt.datetime(2026, 8, 25), dt.datetime(2026, 8, 26), "٢٥ أوت — ظهور بؤرة الشقفة"),
          (dt.datetime(2026, 8, 26), dt.datetime(2026, 8, 26, 12), "٢٦ أوت ٠٠:٠٠–١٢:٠٠"),
          (dt.datetime(2026, 8, 26, 12), dt.datetime(2026, 8, 27), "٢٦ أوت ١٢:٠٠–٢٤:٠٠ — الانفجار"),
          (dt.datetime(2026, 8, 27), dt.datetime(2026, 8, 28), "٢٧ أوت — الذروة"),
          (dt.datetime(2026, 8, 28), dt.datetime(2026, 8, 30), "٢٨–٢٩ أوت — الانحسار")]
fig, axes = plt.subplots(3, 2, figsize=(17.5, 16.2), dpi=165)
for k, (a, b, title) in enumerate(PANELS):
    ax = axes[k // 2][k % 2]
    basemap(ax)
    prev = [d for d in det if d["tloc"] < a]
    cur = [d for d in det if a <= d["tloc"] < b]
    ax.scatter([d["lon"] for d in prev], [d["lat"] for d in prev], s=2.4, color="#b0b0b0",
               alpha=0.6, linewidths=0, zorder=8)
    ax.scatter([d["lon"] for d in cur], [d["lat"] for d in cur],
               s=[max(4, min(46, 4 + d["frp"] * 0.28)) for d in cur],
               color="#d62728", alpha=0.85, linewidths=0, zorder=12)
    label_communes(ax, fs=6.2)
    ax.set_title(ar(title) + "  " + ar("(بؤر جديدة: %d)" % len(cur)), fontsize=11)
    ax.set_xlabel(""); ax.set_ylabel("")
    add_north_arrow(ax, y=0.88, size=0.05)
    add_scalebar(ax, LATC, 20)
fig.suptitle(ar("الخريطة ٣ — التسلسل الزمني لانتشار الحرائق في ولاية جيجل، ٢٢–٢٩ أوت ٢٠٢٦")
             + "\n" + ar("الرمادي: بؤر سابقة تراكمية   |   الأحمر: بؤر رُصدت لأول مرة داخل الفترة"),
             fontsize=14.5, y=0.985)
credit(fig, SRC)
fig.tight_layout(rect=[0, 0.012, 1, 0.955])
fig.savefig(os.path.join(MAPS, "MAP3_chronological_spread.png"), bbox_inches="tight")
plt.close(fig)
print("MAP3 done")

# ================================================================== MAP 4
wx = list(csv.DictReader(open(os.path.join(PRO, "weather_hourly.csv"), encoding="utf-8")))
WHEN = [("2026-08-25 13:00", "٢٥ أوت ١٣:٠٠ محلي"), ("2026-08-26 03:00", "٢٦ أوت ٠٣:٠٠ محلي"),
        ("2026-08-26 13:00", "٢٦ أوت ١٣:٠٠ محلي — ذروة السيروكو"), ("2026-08-27 13:00", "٢٧ أوت ١٣:٠٠ محلي")]
fig, axes = plt.subplots(2, 2, figsize=(17.0, 15.4), dpi=165)
for k, (when, title) in enumerate(WHEN):
    ax = axes[k // 2][k % 2]
    basemap(ax)
    tt = dt.datetime.strptime(when, "%Y-%m-%d %H:%M")
    act = [d for d in det if abs((d["tloc"] - tt).total_seconds()) <= 3 * 3600]
    prev = [d for d in det if d["tloc"] < tt - dt.timedelta(hours=3)]
    ax.scatter([d["lon"] for d in prev], [d["lat"] for d in prev], s=2.2, color="#b8b8b8",
               alpha=0.55, linewidths=0, zorder=8)
    ax.scatter([d["lon"] for d in act], [d["lat"] for d in act],
               s=[max(5, min(50, 5 + d["frp"] * 0.28)) for d in act],
               color="#d62728", alpha=0.9, linewidths=0, zorder=12)
    rows = [r for r in wx if r["datetime_local"] == when]
    for r in rows:
        lo, la = float(r["lon"]), float(r["lat"])
        try:
            wt = float(r["wind_to_deg"]); sp = float(r["wind_kmh"])
        except (TypeError, ValueError):
            continue
        L = 0.030 + 0.0016 * sp
        dx = L * math.sin(math.radians(wt)); dy = L * math.cos(math.radians(wt)) / ASP * ASP
        ax.arrow(lo, la, dx, dy * 1.0, width=0.0032, head_width=0.017, head_length=0.017,
                 fc="#0b3d91", ec="white", linewidth=0.5, zorder=30, length_includes_head=True)
        ax.text(lo, la - 0.020, ar("%.0f كم/س" % sp), fontsize=7.2, ha="center", color="#0b3d91",
                zorder=31, bbox=dict(fc="white", ec="none", alpha=0.7, pad=0.8))
    label_communes(ax, fs=6.2)
    ax.set_title(ar(title) + "   " + ar("(بؤر نشطة ±٣ ساعات: %d)" % len(act)), fontsize=11)
    ax.set_xlabel(""); ax.set_ylabel("")
    add_north_arrow(ax, y=0.88, size=0.05); add_scalebar(ax, LATC, 20)
fig.suptitle(ar("الخريطة ٤ — البؤر الحرارية مع متجهات الرياح (السهم يشير إلى الاتجاه الذي تدفع نحوه الرياح)")
             + "\n" + ar("بيانات الرياح: Open-Meteo، سبع نقاط شبكية داخل نطاق الحريق"),
             fontsize=14.5, y=0.985)
credit(fig, SRC)
fig.tight_layout(rect=[0, 0.012, 1, 0.955])
fig.savefig(os.path.join(MAPS, "MAP4_wind_vectors.png"), bbox_inches="tight")
plt.close(fig)
print("MAP4 done")

# ================================================================== MAP 5
infra = json.load(open(os.path.join(RAW, "osm_infra.json"), encoding="utf-8"))["elements"]
fig, ax = plt.subplots(figsize=(15.5, 9.2), dpi=190)
basemap(ax)
nmaj = nmin = npow = 0
for el in infra:
    t = el.get("tags", {}); g = el.get("geometry")
    if not g or len(g) < 2:
        continue
    xs = [p["lon"] for p in g]; ys = [p["lat"] for p in g]
    if max(xs) < EXT[0] or min(xs) > EXT[1] or max(ys) < EXT[2] or min(ys) > EXT[3]:
        continue
    h, pw = t.get("highway"), t.get("power")
    if h in ("motorway", "trunk", "primary"):
        ax.plot(xs, ys, color="#8b0000", lw=1.05, alpha=0.85, zorder=5); nmaj += 1
    elif h in ("secondary", "tertiary"):
        ax.plot(xs, ys, color="#c26a3a", lw=0.62, alpha=0.7, zorder=5); nmin += 1
    elif pw in ("line", "minor_line"):
        ax.plot(xs, ys, color="#6a0dad", lw=1.15, alpha=0.9, zorder=6); npow += 1
for i, o in enumerate(big):
    la, lo = float(o["lat"]), float(o["lon"])
    ax.scatter([lo], [la], s=300, marker="*", color="#ffd400", edgecolor="black",
               linewidth=1.2, zorder=25)
    ax.annotate(ar("%s\n%s" % (o["event_id"], NAME_AR.get(o["event_id"], ""))), (lo, la),
                textcoords="offset points", xytext=LBL_OFF.get(o["event_id"], (9, 8)),
                fontsize=7.6, zorder=26,
                bbox=dict(fc="white", ec="#333333", lw=0.7, alpha=0.92, pad=1.5),
                arrowprops=dict(arrowstyle="-", color="#333333", lw=0.7, shrinkA=0, shrinkB=7))
label_communes(ax)
ax.legend(handles=[Line2D([], [], color="#8b0000", lw=1.6, label=ar("طرق رئيسية/وطنية")),
                   Line2D([], [], color="#c26a3a", lw=1.2, label=ar("طرق ثانوية/ولائية")),
                   Line2D([], [], color="#6a0dad", lw=1.6, label=ar("خطوط كهربائية")),
                   Line2D([], [], color="#ffd400", marker="*", ls="none", ms=13,
                          markeredgecolor="black", label=ar("أقدم بؤرة لكل تجمّع"))],
          loc="lower right", fontsize=8.6, framealpha=0.93)
ax.set_title(ar("الخريطة ٥ — مواقع أقدم البؤر الحرارية فوق التضاريس والطرق والخطوط الكهربائية والتجمعات السكانية")
             + "\n" + ar("القرب من بنية بشرية سياقٌ وليس دليلاً على السببية؛ يُقارَن بنموذج عشوائي في النص"),
             fontsize=12.5, pad=11)
add_north_arrow(ax); add_scalebar(ax, LATC, 20, x=0.40, y=0.032)
credit(fig, SRC)
fig.tight_layout(rect=[0, 0.012, 1, 1])
fig.savefig(os.path.join(MAPS, "MAP5_origins_infrastructure.png"), bbox_inches="tight")
plt.close(fig)
print("MAP5 done  roads maj=%d min=%d power=%d" % (nmaj, nmin, npow))

# ================================================================== MAP 6
meta = json.load(open(os.path.join(SAT, "dnbr_meta.json"), encoding="utf-8"))
W, S, E, N = meta["window_wgs84"]
pre = np.array(Image.open(os.path.join(SAT, "S2_pre_20260818_swir_falsecolor.png")))
post = np.array(Image.open(os.path.join(SAT, "S2_post_20260828_swir_falsecolor.png")))
sev = np.array(Image.open(os.path.join(SAT, "S2_dNBR_severity.png")))
fig, axes = plt.subplots(3, 1, figsize=(16.4, 15.0), dpi=170)
for ax, img, ttl in zip(axes, [pre, post, sev],
                        ["١٨ أوت ٢٠٢٦ — قبل الحريق (تركيب SWIR: B12/B8A/B04)",
                         "٢٨ أوت ٢٠٢٦ — بعد الحريق (نفس التركيب؛ المساحات المحترقة بالأحمر/البني)",
                         "شدّة الاحتراق dNBR (تصنيف Key & Benson) — الفرق بين ١٨ و٢٨ أوت"]):
    ax.imshow(img, extent=[W, E, S, N], aspect=ASP)
    ax.set_title(ar(ttl), fontsize=11.5)
    ax.tick_params(labelsize=7.5)
    for nm in ["Chekfa", "Texenna", "Ziama Mansouriah", "Djemaa Beni Habibi", "Sidi Maarouf", "El Milia"]:
        if nm in CENTRES:
            arn, la, lo = CENTRES[nm]
            if W < lo < E and S < la < N:
                ax.plot(lo, la, "o", ms=3.4, color="white", markeredgecolor="black", mew=0.7)
                ax.text(lo, la + 0.014, ar(arn), fontsize=7.0, color="white", ha="center",
                        bbox=dict(fc="black", ec="none", alpha=0.5, pad=0.9))
axes[2].legend(handles=[Patch(fc=np.array(c) / 255, ec="k", lw=0.4, label=ar(l)) for c, l in
                        [((124, 199, 106), "شدة منخفضة"), ((255, 235, 100), "متوسطة-منخفضة"),
                         ((242, 148, 42), "متوسطة-مرتفعة"), ((200, 30, 30), "شدة مرتفعة"),
                         ((200, 200, 200), "غير محترق")]],
               loc="lower left", fontsize=8.2, ncol=5, framealpha=0.92)
fig.suptitle(ar("الخريطة ٦ — مقارنة Sentinel-2 قبل/بعد وخريطة شدّة الاحتراق لولاية جيجل"), fontsize=14.5, y=0.995)
credit(fig, SRC)
fig.tight_layout(rect=[0, 0.012, 1, 0.975])
fig.savefig(os.path.join(MAPS, "MAP6_sentinel2_before_after.png"), bbox_inches="tight")
plt.close(fig)
print("MAP6 done")
print("\nall maps written to maps/")
