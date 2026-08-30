"""
12_lightning_and_synthesis.py

PART 1  NATURAL-IGNITION (LIGHTNING) SCREEN
  No stroke-geolocation network (Blitzortung / WWLLN / Meteorage / EUMETSAT MTG-LI)
  was reachable without credentials, so lightning is assessed from three
  independent proxies that WERE obtainable:
    (a) METAR present-weather 'TS' groups at Algerian stations -- an OBSERVED
        report that thunder was heard at the station (nominally within ~16 km);
    (b) modelled CAPE and precipitation at seven grid points inside the fire area;
    (c) modelled lightning potential where the provider serves it.
  Window: 48 h before to 24 h after each cluster's first detection.
  Absence of evidence for lightning is reported as such -- it is NOT treated as
  evidence for human ignition.

PART 2  SYNTHESIS -> ignition_clusters.json
"""
import csv, json, os, math, urllib.request, datetime as dt
import numpy as np
from pyproj import Geod

PRO, RAW = "data/processed", "data/raw"
G = Geod(ellps="WGS84")

EV = list(csv.DictReader(open(os.path.join(PRO, "fire_events_clean.csv"), encoding="utf-8")))
ORI = {o["event_id"]: o for o in csv.DictReader(open(os.path.join(PRO, "origin_terrain_infrastructure.csv"), encoding="utf-8"))}
REACH = list(csv.DictReader(open(os.path.join(PRO, "reachability_v2.csv"), encoding="utf-8")))
PATCH = list(csv.DictReader(open(os.path.join(PRO, "burn_patches.csv"), encoding="utf-8")))
MET = list(csv.DictReader(open(os.path.join(PRO, "metar_observations.csv"), encoding="utf-8")))
WX = list(csv.DictReader(open(os.path.join(PRO, "weather_hourly.csv"), encoding="utf-8")))

CLUSTERS = [e for e in EV if int(e["n_cells"]) >= 3]
CLUSTERS.sort(key=lambda e: int(e["first_epoch"]))
NAME_AR = {"F00": "إيراقن / الحدود الجنوبية الغربية", "F01": "زيامة منصورية — بؤرة ليلية (١)",
           "F02": "زيامة منصورية — بؤرة ليلية (٢)", "F05": "زيامة منصورية — الحريق الكبير",
           "F06": "الجمعة بني حبيبي / العنصر", "F07": "سيدي معروف", "F08": "الشقفة — المجمّع الرئيسي",
           "F09": "زيامة منصورية / الساحل الغربي", "F10": "شرق جيجل (سطارة / حدود سكيكدة)"}
COMMUNE_AR = {}
for r in REACH:
    COMMUNE_AR.setdefault(r["event_id"], r["commune_ar"])

# =============================================================== PART 1
print("=" * 108)
print("PART 1 -- LIGHTNING / NATURAL IGNITION SCREEN")
print("=" * 108)

ts_obs = []
for r in MET:
    if "TS" in (r["wxcodes"] or ""):
        ts_obs.append({"station": r["station"], "name": r["name"],
                       "lat": float(r["lat"]), "lon": float(r["lon"]),
                       "local": r["datetime_local"], "utc": r["datetime_utc"],
                       "wx": r["wxcodes"],
                       "epoch": int(dt.datetime.strptime(r["datetime_utc"], "%Y-%m-%d %H:%M")
                                    .replace(tzinfo=dt.timezone.utc).timestamp())})
print("METAR observations containing a thunderstorm ('TS') group, 20-30 Aug 2026: %d" % len(ts_obs))
for t in ts_obs:
    print("   %-5s %-18s %-16s  %s" % (t["station"], t["name"], t["local"], t["wx"]))

# modelled lightning potential (may be unavailable for North Africa)
lp_available = False
try:
    url = ("https://api.open-meteo.com/v1/forecast?latitude=36.71&longitude=5.98"
           "&hourly=lightning_potential&start_date=2026-08-22&end_date=2026-08-28&timezone=UTC")
    with urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": "wf/1.0"}), timeout=90) as r:
        j = json.loads(r.read().decode())
    vals = [v for v in j["hourly"]["lightning_potential"] if v is not None]
    lp_available = len(vals) > 0
    print("\nmodelled lightning potential: %s (%d non-null of %d hours)"
          % ("AVAILABLE" if lp_available else "NOT SERVED for this area",
             len(vals), len(j["hourly"]["lightning_potential"])))
    if lp_available:
        print("   max = %.2f J/kg" % max(vals))
except Exception as e:
    print("\nmodelled lightning potential: request failed (%s)" % e)

print("\nPer-cluster screen (window: -48 h to +24 h around first detection)")
print("%5s %18s %28s %10s %10s  %s" % ("ID", "first det (local)", "nearest TS report", "dist_km", "dt_h", "verdict"))
print("-" * 118)
light = {}
for c in CLUSTERS:
    e0 = int(c["first_epoch"])
    la, lo = float(c["first_lat"]), float(c["first_lon"])
    cands = [t for t in ts_obs if -48 * 3600 <= (t["epoch"] - e0) <= 24 * 3600]
    best, bd = None, None
    for t in cands:
        d = G.inv(lo, la, t["lon"], t["lat"])[2] / 1000.0
        if bd is None or d < bd:
            best, bd = t, d
    # precipitation and CAPE at the nearest grid point over the same window
    pts = sorted({r["point"] for r in WX})
    near = min(pts, key=lambda p: G.inv(lo, la, float([r for r in WX if r["point"] == p][0]["lon"]),
                                        float([r for r in WX if r["point"] == p][0]["lat"]))[2])
    rows = [r for r in WX if r["point"] == near]
    pr = 0.0
    cape = 0.0
    for r in rows:
        te = int(dt.datetime.strptime(r["datetime_utc"], "%Y-%m-%d %H:%M")
                 .replace(tzinfo=dt.timezone.utc).timestamp())
        if -48 * 3600 <= (te - e0) <= 24 * 3600:
            pr += float(r["precip_mm"] or 0)
            cape = max(cape, float(r["cape_jkg"] or 0))
    if best is None:
        verdict = "no thunderstorm reported at any station in window"
    elif bd <= 30:
        verdict = "TS reported within 30 km -- lightning NOT excluded"
    elif bd <= 80:
        verdict = "TS only at %.0f km -- weak, non-specific" % bd
    else:
        verdict = "nearest TS >80 km -- not informative for this location"
    light[c["event_id"]] = {"nearest_ts_station": best["station"] if best else None,
                            "nearest_ts_local": best["local"] if best else None,
                            "nearest_ts_dist_km": round(bd, 1) if bd else None,
                            "nearest_ts_dt_h": round((best["epoch"] - e0) / 3600.0, 1) if best else None,
                            "precip_mm_window": round(pr, 2), "max_cape_jkg": round(cape),
                            "verdict": verdict}
    print("%5s %18s %28s %10s %10s  %s" %
          (c["event_id"], c["first_local"],
           ("%s %s" % (best["station"], best["local"][5:])) if best else "-",
           ("%.1f" % bd) if bd else "-",
           ("%+.1f" % ((best["epoch"] - e0) / 3600.0)) if best else "-", verdict))
print("\nprecipitation over the whole fire area, 21-29 Aug (gridded, 7 points):")
for p in sorted({r["point"] for r in WX}):
    tp = sum(float(r["precip_mm"] or 0) for r in WX if r["point"] == p)
    mc = max(float(r["cape_jkg"] or 0) for r in WX if r["point"] == p)
    print("   %-24s total precip = %5.2f mm   max CAPE = %5.0f J/kg" % (p, tp, mc))

# =============================================================== PART 2
print("\n" + "=" * 108)
print("PART 2 -- SYNTHESIS")
print("=" * 108)

# link each cluster to its Sentinel-2 burn patch
def patch_for(lat, lon):
    best, bd = None, None
    for p in PATCH:
        if not p["first_det_lat"]:
            continue
        d = G.inv(lon, lat, float(p["centroid_lon"]), float(p["centroid_lat"]))[2] / 1000.0
        if bd is None or d < bd:
            best, bd = p, d
    return best, bd

# reachability summary per cluster origin
REACH_BY = {}
for r in REACH:
    key = (r["first_local"], round(float(r["lat"]), 5), round(float(r["lon"]), 5))
    REACH_BY[key] = r

PROB = {   # judgement recorded explicitly, with the reasoning captured in the report
    "F00": ("متوسطة", "بؤرة ليلية صغيرة خارج حدود ولاية جيجل، لم تتطور؛ لا يمكن ربطها بأي حريق سابق"),
    "F01": ("متوسطة", "بؤرة ليلية معزولة على بعد ~10 كم من F02 في التوقيت نفسه تقريباً"),
    "F02": ("متوسطة-مرتفعة", "بؤرة ليلية مستقلة؛ تبعد 0.82 كم فقط عن نقطة انطلاق F05 بعد ~36 ساعة"),
    "F05": ("مرتفعة", "أكبر حريق مستقل غربي؛ يقع على بعد 0.82 كم من بؤرة 23 أوت — يرجّح أنه تجدد اشتعال (rekindle) لا اشتعال جديد"),
    "F06": ("مرتفعة", "ظهر على بعد 29.7 كم من أقرب حريق سابق وبفجوة مسار 60.7 كم — يستحيل الوصول إليه بانتشار سطحي"),
    "F07": ("مرتفعة", "ظهر على بعد 24.0 كم من أقرب حريق سابق وبفجوة مسار 71.6 كم"),
    "F08": ("مرتفعة", "ظهر على بعد 14.3 كم من أقرب حريق سابق (F06) وبفجوة مسار 9.7 كم بعد 22 ساعة من خموده"),
    "F09": ("منخفضة-متوسطة", "بؤرة صغيرة ضمن نطاق حريق زيامة النشط؛ قد تكون امتداداً له"),
    "F10": ("متوسطة-مرتفعة", "ندبة حريق منفصلة شرقاً؛ لكن التغطية الفضائية للمنطقة كانت ضعيفة قبل رصده"),
}

out = {"meta": {
    "title": "إعادة بناء جنائي-جغرافي لحرائق ولاية جيجل — أوت 2026",
    "generated_utc": dt.datetime.now(dt.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
    "study_area": "ولاية جيجل، الجزائر (+ نطاق عازل 10 كم)",
    "bbox_analysis": [5.0, 36.2, 6.8, 37.2],
    "period_local": "2026-08-22 00:00 .. 2026-08-29 23:59 (UTC+1)",
    "timezone": "Africa/Algiers = UTC+1 (بدون توقيت صيفي)",
    "primary_sensors": ["VIIRS 375 m (Suomi-NPP, NOAA-20, NOAA-21)", "MODIS C6.1 (Terra, Aqua)",
                        "Sentinel-2 MSI L2A", "Copernicus DEM GLO-30"],
    "critical_caveat": ("أقدم بؤرة حرارية رصدها القمر الصناعي ليست نقطة اشتعال مؤكدة. "
                        "الدقة المكانية الاسمية لـ VIIRS تبلغ نحو 375 م، وقد يبدأ الحريق "
                        "قبل الرصد بفترة تحدّها فجوات مرور الأقمار."),
    "clusters_note": "عدد التجمعات المستقلة يعتمد على عتبات التجميع؛ انظر تحليل الحساسية في التقرير.",
}, "clusters": []}

print("%5s %18s %10s %9s %8s %9s %10s %-22s %s" %
      ("ID", "first local", "lat", "lon", "area_km2", "elev_m", "patch", "commune", "indep. probability"))
print("-" * 128)
for c in CLUSTERS:
    eid = c["event_id"]
    la, lo = float(c["first_lat"]), float(c["first_lon"])
    o = ORI.get(eid, {})
    p, pd = patch_for(la, lo)
    key = (c["first_local"], round(la, 5), round(lo, 5))
    rr = REACH_BY.get(key, {})
    prob, note = PROB.get(eid, ("غير مقدّرة", ""))
    rec = {
        "cluster_id": eid,
        "label_ar": NAME_AR.get(eid, ""),
        "first_detection_utc": c["first_utc"],
        "first_detection_local": c["first_local"],
        "latitude": la, "longitude": lo,
        "coordinate_type": "satellite detection centroid (not municipality centre)",
        "satellite": c["first_sat"], "instrument": c["first_instrument"],
        "frp": float(c["first_frp_mw"]), "confidence": c["first_conf"],
        "daynight": c["first_daynight"],
        "nearest_locality": c["nearest_commune"],
        "commune_ar": rr.get("commune_ar") or COMMUNE_AR.get(eid, ""),
        "dist_to_commune_centre_km": float(c["dist_to_commune_centre_km"]),
        "n_375m_cells": int(c["n_cells"]), "n_detections": int(c["n_detections"]),
        "approx_area_km2": float(c["approx_area_km2"]),
        "last_detection_utc": c["last_utc"],
        "terrain": {"elevation_m": float(o["elev_m"]) if o.get("elev_m") else None,
                    "slope_deg": round(float(o["slope_deg"]), 1) if o.get("slope_deg") else None,
                    "aspect_deg": round(float(o["aspect_deg"])) if o.get("aspect_deg") else None},
        "infrastructure_distance_m": {k: (float(o["dist_" + k]) if o.get("dist_" + k) else None)
                                      for k in ["major_road", "minor_road", "track", "power_line",
                                                "settlement", "farmland", "landfill_quarry", "industrial"]},
        "reachability": {
            "nearest_prior_fire_km": float(rr["nearest_prior_km"]) if rr.get("nearest_prior_km") else None,
            "nearest_prior_dt_h": float(rr["nearest_prior_dt_h"]) if rr.get("nearest_prior_dt_h") else None,
            "min_required_spread_rate_kmh": float(rr["min_required_rate_kmh"]) if rr.get("min_required_rate_kmh") else None,
            "largest_unburnt_path_gap_km": float(rr["largest_path_gap_km"]) if rr.get("largest_path_gap_km") else None,
            "verdict": rr.get("verdict"),
        },
        "lightning_screen": light.get(eid, {}),
        "sentinel2_burn_patch": {"patch_id": p["patch_id"] if p else None,
                                 "patch_area_km2": float(p["area_km2"]) if p else None,
                                 "centroid_offset_km": round(pd, 2) if pd else None},
        "independent_ignition_probability": prob,
        "notes": note,
    }
    out["clusters"].append(rec)
    print("%5s %18s %10.5f %9.5f %8.1f %9s %10s %-22s %s" %
          (eid, c["first_local"], la, lo, float(c["approx_area_km2"]),
           o.get("elev_m", "-"), p["patch_id"] if p else "-",
           rr.get("commune", "-"), prob))

json.dump(out, open(os.path.join(PRO, "ignition_clusters.json"), "w", encoding="utf-8"),
          ensure_ascii=False, indent=2)
print("\nwrote data/processed/ignition_clusters.json  (%d clusters)" % len(out["clusters"]))

# headline numbers for the report
det = list(csv.DictReader(open(os.path.join(PRO, "hotspots_wildfire_only.csv"), encoding="utf-8")))
meta = json.load(open("satellite/dnbr_meta.json", encoding="utf-8"))
summary = {
    "detections_total_analysis_set": len(det),
    "detections_in_province": sum(1 for d in det if d["in_province"] == "True"),
    "grid_cells_375m": sum(1 for _ in open(os.path.join(PRO, "grid_first_detection_clean.csv"), encoding="utf-8")) - 1,
    "clusters_reference_config": len(CLUSTERS),
    "earliest_detection_local": CLUSTERS[0]["first_local"],
    "earliest_detection_utc": CLUSTERS[0]["first_utc"],
    "earliest_detection_latlon": [float(CLUSTERS[0]["first_lat"]), float(CLUSTERS[0]["first_lon"])],
    "largest_cluster": max(CLUSTERS, key=lambda c: float(c["approx_area_km2"]))["event_id"],
    "burned_area_km2_dnbr_gte_0_10": round(meta["total_burned_ha"] / 100, 1),
    "burn_patches_ge_100ha": len(PATCH),
    "burn_patch_area_km2": round(sum(float(p["area_km2"]) for p in PATCH), 1),
    "static_industrial_sources_masked": len(json.load(open(os.path.join(PRO, "static_thermal_sources.json")))),
}
json.dump(summary, open(os.path.join(PRO, "headline_summary.json"), "w", encoding="utf-8"),
          ensure_ascii=False, indent=2)
print("\nheadline summary:")
for k, v in summary.items():
    print("   %-38s %s" % (k, v))
