"""
11_charts.py -- Analytical charts, labelled in Arabic.

C1  detections per overpass and cumulative burnt-cell count vs time
C2  total fire radiative power (FRP) per overpass vs time
C3  FRP contribution by fire event
C4  fire weather (T, RH, wind, gusts) against fire activity
C5  first-appearance timeline of the independent clusters
C6  geodesic separation matrix between cluster origins
"""
import csv, json, os, math, sys, datetime as dt
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import numpy as np
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import matplotlib.dates as mdates
from matplotlib.lines import Line2D
from arabicutil import ar, credit

PRO, CH = "data/processed", "charts"
os.makedirs(CH, exist_ok=True)
SRC = "المصدر: NASA FIRMS (VIIRS/MODIS)، Open-Meteo، أرصاد METAR (IEM). التوقيت محلي (ت.ع.م +1)."


def T(s):
    return dt.datetime.strptime(s, "%Y-%m-%d %H:%M")


det = list(csv.DictReader(open(os.path.join(PRO, "hotspots_wildfire_only.csv"), encoding="utf-8")))
for d in det:
    d["t"] = T(d["datetime_local"])
    d["frp"] = float(d["frp_mw"]) if d["frp_mw"] else 0.0
det.sort(key=lambda d: d["t"])
cells = list(csv.DictReader(open(os.path.join(PRO, "grid_first_detection_clean.csv"), encoding="utf-8")))
for c in cells:
    c["t"] = T(c["first_local"])
    c["frp"] = float(c["frp_mw"]) if c["frp_mw"] else 0.0
cells.sort(key=lambda c: c["t"])
EV = list(csv.DictReader(open(os.path.join(PRO, "fire_events_clean.csv"), encoding="utf-8")))
NAME_AR = {"F00": "إيراقن/ج.غ", "F01": "زيامة (١)", "F02": "زيامة (٢)", "F05": "زيامة — الكبير",
           "F06": "الجمعة بني حبيبي", "F07": "سيدي معروف", "F08": "الشقفة — الرئيسي",
           "F09": "زيامة/الساحل", "F10": "شرق جيجل"}

X0, X1 = dt.datetime(2026, 8, 22), dt.datetime(2026, 8, 30)


def fmt_time(ax):
    ax.set_xlim(X0, X1)
    ax.xaxis.set_major_locator(mdates.DayLocator())
    ax.xaxis.set_major_formatter(mdates.DateFormatter("%d/%m"))
    ax.xaxis.set_minor_locator(mdates.HourLocator(byhour=[6, 12, 18]))
    ax.grid(alpha=0.25, which="major")
    ax.grid(alpha=0.10, which="minor")


# --------------------------------------------------------------- C1 + C2
passes = {}
for d in det:
    passes.setdefault(d["datetime_local"], []).append(d)
pt = sorted(passes)
px = [T(p) for p in pt]
pn = [len(passes[p]) for p in pt]
pf = [sum(x["frp"] for x in passes[p]) for p in pt]

fig, (a1, a2) = plt.subplots(2, 1, figsize=(14.5, 9.6), dpi=175, sharex=True)
a1.bar(px, pn, width=0.016, color="#c0392b", alpha=0.9)
a1.set_ylabel(ar("عدد البؤر في كل تمريرة"), fontsize=10)
a1.set_title(ar("الشكل ١ — عدد البؤر الحرارية المرصودة في كل تمريرة قمر صناعي، وتراكم الخلايا المحترقة"), fontsize=12.5)
a1b = a1.twinx()
cx = [c["t"] for c in cells]
a1b.plot(cx, np.arange(1, len(cells) + 1), color="#1f4e79", lw=2.0)
a1b.set_ylabel(ar("تراكمي: خلايا ٣٧٥ م اشتعلت لأول مرة"), fontsize=10, color="#1f4e79")
a1b.tick_params(axis="y", colors="#1f4e79")
fmt_time(a1)
a2.bar(px, pf, width=0.016, color="#e67e22", alpha=0.95)
a2.set_yscale("symlog", linthresh=100)
a2.set_ylabel(ar("مجموع FRP لكل تمريرة (ميغاواط، مقياس لوغاريتمي)"), fontsize=10)
a2.set_xlabel(ar("التاريخ (توقيت محلي)"), fontsize=10)
a2.set_title(ar("الشكل ٢ — إجمالي قوة الإشعاع الحراري FRP لكل تمريرة"), fontsize=12.5)
fmt_time(a2)
for a in (a1, a2):
    a.axvline(dt.datetime(2026, 8, 26, 19), color="#444", ls="--", lw=1.2)
    a.text(dt.datetime(2026, 8, 26, 19), a.get_ylim()[1] * 0.92, ar("  ذروة السيروكو ٢٦ أوت ١٩:٠٠"),
           fontsize=8.5, color="#444", va="top")
credit(fig, SRC)
fig.tight_layout(rect=[0, 0.015, 1, 1])
fig.savefig(os.path.join(CH, "C1_C2_detections_frp_time.png"), bbox_inches="tight")
plt.close(fig)
print("C1/C2 done")

# --------------------------------------------------------------- C3
byev = {}
for c in cells:
    byev.setdefault(c["event_id"], []).append(c)
maj = sorted(byev, key=lambda e: -sum(float(x["frp_sum"]) for x in byev[e]))[:8]
fig, ax = plt.subplots(figsize=(14.5, 7.2), dpi=175)
bins = [X0 + dt.timedelta(hours=6 * i) for i in range(33)]
bottom = np.zeros(len(bins) - 1)
cols = plt.cm.tab10(np.linspace(0, 1, 10))
for i, e in enumerate(maj):
    h, _ = np.histogram([mdates.date2num(c["t"]) for c in byev[e]],
                        bins=[mdates.date2num(b) for b in bins],
                        weights=[c["frp"] for c in byev[e]])
    ax.bar([b + dt.timedelta(hours=3) for b in bins[:-1]], h, width=0.22, bottom=bottom,
           color=cols[i % 10], label=ar("%s — %s" % (e, NAME_AR.get(e, ""))))
    bottom += h
ax.set_ylabel(ar("مجموع FRP لأول رصد لكل خلية (ميغاواط)"), fontsize=10)
ax.set_xlabel(ar("التاريخ (توقيت محلي، حزم ٦ ساعات)"), fontsize=10)
ax.set_title(ar("الشكل ٣ — مساهمة كل حريق مستقل في النشاط الحراري عبر الزمن"), fontsize=12.5)
ax.legend(fontsize=9, ncol=2)
fmt_time(ax)
credit(fig, SRC)
fig.tight_layout(rect=[0, 0.015, 1, 1])
fig.savefig(os.path.join(CH, "C3_frp_by_cluster.png"), bbox_inches="tight")
plt.close(fig)
print("C3 done")

# --------------------------------------------------------------- C4
wx = [r for r in csv.DictReader(open(os.path.join(PRO, "weather_hourly.csv"), encoding="utf-8"))
      if r["point"] == "P1_Chekfa_origin"]
for r in wx:
    r["t"] = T(r["datetime_local"])
wx.sort(key=lambda r: r["t"])
mt = [r for r in csv.DictReader(open(os.path.join(PRO, "metar_observations.csv"), encoding="utf-8"))
      if r["station"] == "DAAV"]
for r in mt:
    r["t"] = T(r["datetime_local"])
mt.sort(key=lambda r: r["t"])

fig, axes = plt.subplots(4, 1, figsize=(14.5, 13.2), dpi=170, sharex=True)
ax = axes[0]
ax.plot([r["t"] for r in wx], [float(r["temp_c"]) for r in wx], color="#c0392b", lw=1.8,
        label=ar("درجة الحرارة — شبكي عند بؤرة الشقفة (٥٨٢ م)"))
tv = [(r["t"], float(r["temp_c"])) for r in mt if r["temp_c"]]
ax.plot([x[0] for x in tv], [x[1] for x in tv], color="#7b241c", lw=1.1, ls="--",
        label=ar("درجة الحرارة — رصد محطة جيجل/الطاهير DAAV"))
ax.set_ylabel(ar("°م"), fontsize=10); ax.legend(fontsize=8.6); ax.set_title(ar("الشكل ٤ — طقس الحرائق مقابل النشاط الحراري"), fontsize=12.5)
ax = axes[1]
ax.plot([r["t"] for r in wx], [float(r["rh_pct"]) for r in wx], color="#1f77b4", lw=1.8,
        label=ar("الرطوبة النسبية — شبكي"))
rv = [(r["t"], float(r["rh_pct"])) for r in mt if r["rh_pct"]]
ax.plot([x[0] for x in rv], [x[1] for x in rv], color="#0b3d91", lw=1.1, ls="--",
        label=ar("الرطوبة النسبية — رصد DAAV"))
ax.axhline(20, color="#888", ls=":", lw=1.2)
ax.text(X0, 21, ar(" عتبة ٢٠٪ — خطورة قصوى"), fontsize=8, color="#666")
ax.set_ylabel(ar("رطوبة نسبية ٪"), fontsize=10); ax.legend(fontsize=8.6)
ax = axes[2]
ax.plot([r["t"] for r in wx], [float(r["wind_kmh"]) for r in wx], color="#2e7d32", lw=1.7,
        label=ar("سرعة الرياح — شبكي"))
ax.plot([r["t"] for r in wx], [float(r["gust_kmh"]) for r in wx], color="#66bb6a", lw=1.0,
        label=ar("هبّات الرياح — شبكي"))
ax.set_ylabel(ar("كم/س"), fontsize=10); ax.legend(fontsize=8.6)
axb = ax.twinx()
axb.scatter([r["t"] for r in wx], [float(r["wind_to_deg"]) for r in wx], s=7, color="#8e44ad", alpha=0.65)
axb.set_ylabel(ar("اتجاه دفع الرياح (°)"), fontsize=9, color="#8e44ad")
axb.set_ylim(0, 360); axb.set_yticks([0, 90, 180, 270, 360])
axb.set_yticklabels([ar("شمال"), ar("شرق"), ar("جنوب"), ar("غرب"), ar("شمال")], fontsize=8, color="#8e44ad")
ax = axes[3]
ax.bar(px, pf, width=0.016, color="#e67e22", alpha=0.95)
ax.set_yscale("symlog", linthresh=100)
ax.set_ylabel(ar("FRP لكل تمريرة (م.و)"), fontsize=10)
ax.set_xlabel(ar("التاريخ (توقيت محلي)"), fontsize=10)
for a in axes:
    fmt_time(a)
    a.axvline(dt.datetime(2026, 8, 26, 19), color="#444", ls="--", lw=1.2)
credit(fig, SRC)
fig.tight_layout(rect=[0, 0.014, 1, 1])
fig.savefig(os.path.join(CH, "C4_fireweather_vs_activity.png"), bbox_inches="tight")
plt.close(fig)
print("C4 done")

# --------------------------------------------------------------- C5
ORD = [e for e in EV if int(e["n_cells"]) >= 3]
ORD.sort(key=lambda e: e["first_local"])
fig, ax = plt.subplots(figsize=(14.5, 7.0), dpi=175)
for i, e in enumerate(ORD):
    eid = e["event_id"]
    ts = [c["t"] for c in byev.get(eid, [])]
    if not ts:
        continue
    ax.plot([min(ts), max(ts)], [i, i], lw=7, color=cols[i % 10], alpha=0.35,
            solid_capstyle="butt")
    ax.scatter(ts, [i] * len(ts), s=5, color=cols[i % 10], alpha=0.8)
    ax.scatter([min(ts)], [i], s=200, marker="*", color=cols[i % 10],
               edgecolor="black", zorder=6)
    ax.text(min(ts) - dt.timedelta(hours=3), i,
            ar("%s  %s" % (eid, NAME_AR.get(eid, ""))), ha="right", va="center", fontsize=9)
ax.set_yticks([]); ax.set_ylim(-0.8, len(ORD) - 0.2)
ax.set_xlim(dt.datetime(2026, 8, 21, 12), X1)
ax.xaxis.set_major_locator(mdates.DayLocator())
ax.xaxis.set_major_formatter(mdates.DateFormatter("%d/%m"))
ax.grid(axis="x", alpha=0.3)
ax.axvline(dt.datetime(2026, 8, 26, 19), color="#444", ls="--", lw=1.3)
ax.text(dt.datetime(2026, 8, 26, 19), len(ORD) - 0.4, ar("  ذروة السيروكو"), fontsize=9, color="#444")
ax.set_xlabel(ar("التاريخ (توقيت محلي)"), fontsize=10)
ax.set_title(ar("الشكل ٥ — الجدول الزمني لأول ظهور لكل حريق مستقل مرشّح (النجمة = أقدم رصد فضائي)")
             + "\n" + ar("النجمة ليست نقطة اشتعال مؤكدة؛ الاشتعال يسبق الرصد"), fontsize=12.5)
credit(fig, SRC)
fig.tight_layout(rect=[0, 0.015, 1, 1])
fig.savefig(os.path.join(CH, "C5_cluster_timeline.png"), bbox_inches="tight")
plt.close(fig)
print("C5 done")

# --------------------------------------------------------------- C6
from pyproj import Geod
G = Geod(ellps="WGS84")
lab = ["%s\n%s" % (e["event_id"], NAME_AR.get(e["event_id"], "")) for e in ORD]
n = len(ORD)
M = np.zeros((n, n))
for i in range(n):
    for j in range(n):
        M[i, j] = G.inv(float(ORD[i]["first_lon"]), float(ORD[i]["first_lat"]),
                        float(ORD[j]["first_lon"]), float(ORD[j]["first_lat"]))[2] / 1000.0
fig, ax = plt.subplots(figsize=(11.6, 9.6), dpi=175)
im = ax.imshow(M, cmap="viridis")
ax.set_xticks(range(n)); ax.set_yticks(range(n))
ax.set_xticklabels([ar(x) for x in lab], rotation=42, ha="right", fontsize=8.4)
ax.set_yticklabels([ar(x) for x in lab], fontsize=8.4)
for i in range(n):
    for j in range(n):
        ax.text(j, i, "%.1f" % M[i, j], ha="center", va="center", fontsize=8.2,
                color="white" if M[i, j] < M.max() * 0.62 else "black")
cb = fig.colorbar(im, ax=ax, fraction=0.042, pad=0.02)
cb.set_label(ar("المسافة الجيوديسية (كم)"), fontsize=9.5)
ax.set_title(ar("الشكل ٦ — المسافات الجيوديسية بين أقدم بؤرة لكل حريق مستقل")
             + "\n" + ar("مرجع WGS84 — إحداثيات أقمار صناعية فعلية وليست مراكز بلديات"), fontsize=12.2, pad=12)
credit(fig, SRC)
fig.tight_layout(rect=[0, 0.015, 1, 1])
fig.savefig(os.path.join(CH, "C6_cluster_distance_matrix.png"), bbox_inches="tight")
plt.close(fig)
print("C6 done")
print("\nall charts written to charts/")
