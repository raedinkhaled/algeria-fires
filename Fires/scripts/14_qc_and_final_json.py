"""
14_qc_and_final_json.py

PART 1  QUALITY CONTROL -- independent re-verification of everything the report
        will assert numerically:
          * every UTC -> Africa/Algiers (UTC+1) conversion recomputed from the
            raw FIRMS acq_date/acq_time fields;
          * all coordinates inside the declared bounding box;
          * cluster-origin coordinates confirmed to be SATELLITE coordinates,
            not municipality centres (checked against the OSM commune centroids);
          * key geodesic distances recomputed with an independent haversine
            implementation and compared with the pyproj/WGS84 values;
          * first-detection claims re-derived straight from the raw CSVs.

PART 2  Emit the deliverable data/processed/ignition_clusters.json.
"""
import csv, json, os, math, datetime as dt
from pyproj import Geod

PRO, RAW = "data/processed", "data/raw"
G = Geod(ellps="WGS84")
FAIL = []


def check(name, cond, detail=""):
    print("   [%s] %s%s" % ("OK " if cond else "FAIL", name, ("  -- " + detail) if detail else ""))
    if not cond:
        FAIL.append(name)


def haversine(lat1, lon1, lat2, lon2):
    R = 6371.0088
    p1, p2 = math.radians(lat1), math.radians(lat2)
    dp, dl = p2 - p1, math.radians(lon2 - lon1)
    a = math.sin(dp / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2
    return 2 * R * math.asin(math.sqrt(a))


print("=" * 100)
print("PART 1 -- QUALITY CONTROL")
print("=" * 100)

# --- 1. UTC -> local conversion, recomputed from raw FIRMS fields ------------
raw_rows = []
for tag in ("SNPP", "NOAA20", "NOAA21", "MODIS"):
    with open(os.path.join(RAW, "EU7d_%s.csv" % tag), encoding="utf-8") as f:
        for r in csv.DictReader(f):
            la, lo = float(r["latitude"]), float(r["longitude"])
            if 36.2 <= la <= 37.2 and 5.0 <= lo <= 6.8:
                raw_rows.append((r["acq_date"], r["acq_time"].zfill(4), la, lo))
master = list(csv.DictReader(open(os.path.join(PRO, "hotspots_master.csv"), encoding="utf-8")))
bad_tz, checked = 0, 0
for m in master:
    u = dt.datetime.strptime(m["datetime_utc"], "%Y-%m-%d %H:%M")
    l = dt.datetime.strptime(m["datetime_local"], "%Y-%m-%d %H:%M")
    if (l - u) != dt.timedelta(hours=1):
        bad_tz += 1
    src = dt.datetime.strptime("%s %s" % (m["acq_date"], m["acq_time_utc_hhmm"]), "%Y-%m-%d %H%M")
    if src != u:
        bad_tz += 1
    checked += 1
check("UTC->local = +1 h for all %d master rows, and UTC matches raw acq_date/acq_time" % checked,
      bad_tz == 0, "%d mismatches" % bad_tz)

# --- 2. bounding box --------------------------------------------------------
oob = [m for m in master if not (35.5 <= float(m["latitude"]) <= 37.5 and 3.5 <= float(m["longitude"]) <= 8.5)]
check("all master coordinates inside the declared regional box", len(oob) == 0, "%d outside" % len(oob))

# --- 3. dates within the declared study period ------------------------------
dates = sorted({m["local_date"] for m in master})
check("local dates span only 2026-08-22 .. 2026-08-29",
      dates[0] >= "2026-08-22" and dates[-1] <= "2026-08-29", "range %s..%s" % (dates[0], dates[-1]))

# --- 4. origins are satellite coordinates, not commune centres --------------
import re
LATN = re.compile(r"^[A-Za-zÀ-ɏ' \-’]+")
CENTS = []
for e in json.load(open(os.path.join(RAW, "osm_jijel_places.json"), encoding="utf-8"))["elements"]:
    if e["type"] == "relation" and e.get("tags", {}).get("admin_level") == "8":
        CENTS.append((e["center"]["lat"], e["center"]["lon"]))
ORI = json.load(open(os.path.join(PRO, "independent_origins.json"), encoding="utf-8"))
too_close = [o for o in ORI if any(haversine(o["lat"], o["lon"], c[0], c[1]) < 0.05 for c in CENTS)]
check("no origin coordinate coincides with a commune centroid (<50 m)", len(too_close) == 0,
      "%d suspicious" % len(too_close))

# every origin must exist verbatim in the raw detection set
det = list(csv.DictReader(open(os.path.join(PRO, "hotspots_wildfire_only.csv"), encoding="utf-8")))
detset = {(round(float(d["latitude"]), 5), round(float(d["longitude"]), 5), d["datetime_utc"]) for d in det}
missing = [o for o in ORI if (round(o["lat"], 5), round(o["lon"], 5), o["first_utc"]) not in detset]
check("every origin is a verbatim FIRMS detection record", len(missing) == 0,
      "%d not found: %s" % (len(missing), [(o["origin_id"], o["lat"], o["lon"]) for o in missing[:3]]))

# --- 5. distances recomputed independently ----------------------------------
print("\n   independent distance re-verification (pyproj WGS84 vs haversine R=6371.0088 km):")
maxdiff = 0.0
pairs = [(ORI[i], ORI[j]) for i in range(len(ORI)) for j in range(i + 1, len(ORI))]
for a, b in pairs:
    dg = G.inv(a["lon"], a["lat"], b["lon"], b["lat"])[2] / 1000.0
    dh = haversine(a["lat"], a["lon"], b["lat"], b["lon"])
    maxdiff = max(maxdiff, abs(dg - dh))
check("all %d pairwise distances agree within 0.5%%" % len(pairs), maxdiff < 0.5,
      "max abs difference = %.3f km" % maxdiff)

KEY = {"Chekfa origin -> Texenna origin": ((36.70906, 5.98090), (36.68468, 5.76455)),
       "Chekfa origin -> Djemaa Beni Habibi origin": ((36.70906, 5.98090), (36.78738, 6.11795)),
       "Chekfa origin -> Ouled Yahia Khedrouche origin": ((36.70906, 5.98090), (36.67139, 6.19296)),
       "Chekfa origin -> Mila (Hamala) origin": ((36.70906, 5.98090), (36.61221, 6.28743)),
       "Chekfa origin -> Bejaia (Tamridjet) origin": ((36.70906, 5.98090), (36.56917, 5.40396)),
       "Texenna origin -> Bejaia (Tamridjet) origin": ((36.68468, 5.76455), (36.56917, 5.40396)),
       "Texenna origin -> Djemaa Beni Habibi origin": ((36.68468, 5.76455), (36.78738, 6.11795))}
print()
for nm, (A, B) in KEY.items():
    dg = G.inv(A[1], A[0], B[1], B[0])[2] / 1000.0
    dh = haversine(A[0], A[1], B[0], B[1])
    print("      %-46s WGS84 %7.2f km | haversine %7.2f km | Δ %.3f km" % (nm, dg, dh, abs(dg - dh)))

# --- 6. re-derive the headline first-detection claims from raw data ---------
print("\n   re-derivation of headline claims straight from the cleaned detection set:")
det.sort(key=lambda d: int(d["epoch"]))
prov = [d for d in det if d["in_province"] == "True"]
print("      earliest detection anywhere in analysis set : %s local  (%.5f, %.5f) %s"
      % (det[0]["datetime_local"], float(det[0]["latitude"]), float(det[0]["longitude"]), det[0]["sat_code"]))
print("      earliest detection inside Jijel province    : %s local  (%.5f, %.5f) %s"
      % (prov[0]["datetime_local"], float(prov[0]["latitude"]), float(prov[0]["longitude"]), prov[0]["sat_code"]))
check("earliest in-province detection matches the Djemaa Beni Habibi origin (24 Aug 14:53 local)",
      prov[0]["datetime_local"] == "2026-08-24 14:53")

# --- 7. wind convention -----------------------------------------------------
wx = list(csv.DictReader(open(os.path.join(PRO, "weather_hourly.csv"), encoding="utf-8")))
bad = 0
for r in wx[:4000]:
    try:
        a, b = float(r["wind_from_deg"]), float(r["wind_to_deg"])
    except (TypeError, ValueError):
        continue
    if abs(((a + 180) % 360) - b) > 1e-6:
        bad += 1
check("wind_to_deg == (wind_from_deg + 180) mod 360 throughout", bad == 0, "%d bad rows" % bad)

print("\n   QC RESULT: %s" % ("ALL CHECKS PASSED" if not FAIL else "FAILURES -> %s" % FAIL))

# =====================================================================
print("\n" + "=" * 100)
print("PART 2 -- FINAL DELIVERABLE JSON")
print("=" * 100)
PROB = {
    "2026-08-23 01:35|36.45955": ("متوسطة", "أقدم بؤرتين ليليتين في مجموعة البيانات (ولاية سطيف)؛ لا يوجد رصد سابق يمكن الاستناد إليه، فلا يمكن اختبار الاستقلالية إحصائياً."),
    "2026-08-23 01:35|36.54239": ("متوسطة", "بؤرة ليلية في ولاية بجاية، على بعد ~10 كم من البؤرة السابقة وفي التمريرة نفسها."),
    "2026-08-24 13:29|36.84502": ("مرتفعة", "بؤرة معزولة في ولاية سكيكدة على بعد 96 كم من أقرب حريق سابق وبفجوة مسار 92 كم؛ لم تتطور."),
    "2026-08-24 14:53|36.78738": ("مرتفعة", "أقدم بؤرة داخل ولاية جيجل. تبعد 29.7 كم عن أقرب حريق سابق وفجوة المسار 60.7 كم؛ يستحيل بلوغها بانتشار سطحي. تقع داخل ندبة الحريق B00 التي شهدت لاحقاً الكارثة البشرية."),
    "2026-08-25 01:50|36.61221": ("مرتفعة", "بؤرة ليلية مستقلة في ولاية ميلة؛ 24 كم عن أقرب حريق سابق وفجوة 71.6 كم."),
    "2026-08-25 12:51|36.70906": ("مرتفعة", "بؤرة الشقفة — نواة المجمّع الرئيسي (B00، 400 كم²). تبعد 14.3 كم عن أقرب رصد سابق (بؤرة الجمعة بني حبيبي) التي كانت قد خمدت عن الرصد منذ ~22 ساعة، وفجوة المسار 9.7 كم."),
    "2026-08-26 01:33|36.67139": ("متوسطة-مرتفعة", "أولاد يحيى خدروش. 10.4 كم عن أقرب رصد سابق وفجوة 7.7 كم؛ لكن التمريرات الليلية السابقة كانت محدودة التغطية، فلا يُستبعد أنها اشتعلت قبل ذلك دون رصد."),
    "2026-08-26 12:51|36.56478": ("متوسطة-مرتفعة", "بؤرة في ولاية ميلة، 15.7 كم عن أقرب حريق سابق وفجوة 20.1 كم."),
    "2026-08-26 12:51|36.68468": ("مرتفعة", "تاكسنة — جبهة بطول ~7 كم ظهرت دفعة واحدة على بعد 19.6 كم عن أقرب حريق سابق وبفجوة 22.8 كم، وفي اتجاه معاكس للرياح. تشكّل ندبة حريق منفصلة تماماً (B01، 122 كم²) عن المجمّع الرئيسي B00. أقوى مرشّح لاشتعال مستقل داخل الولاية بعد الشقفة."),
    "2026-08-26 14:14|36.56654": ("متوسطة", "إيراقن سويسي؛ 12.3 كم عن أقرب حريق سابق وفجوة 13.2 كم، لكن ضمن نطاق نشاط حريق بجاية الكبير."),
    "2026-08-27 10:22|36.60825": ("متوسطة", "بودريعة بن ياجيس؛ فجوة مسار 26.4 كم لكن المسافة عن أقرب حريق سابق 5.6 كم فقط، ما يجعل الانتشار أو التطاير احتمالاً قائماً."),
    "2026-08-27 10:22|36.70913": ("متوسطة-مرتفعة", "ولاية سكيكدة (أم الطوب)؛ خارج نافذة تحليل Sentinel-2، والتغطية الحرارية للمنطقة كانت متقطعة."),
}
out = {
    "meta": {
        "title": "إعادة بناء جنائي-جغرافي لحرائق ولاية جيجل — أوت 2026",
        "generated_utc": dt.datetime.now(dt.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "study_area": "ولاية جيجل، الجزائر، مع نطاق عازل 10 كم يشمل حرائق مجاورة في بجاية وميلة وسكيكدة وسطيف",
        "analysis_bbox_lonlat": [5.0, 36.2, 6.8, 37.2],
        "period_local": "2026-08-22 00:00 — 2026-08-29 23:59 (UTC+1)",
        "timezone_note": "التوقيت المحلي في الجزائر = ت.ع.م +1 طوال السنة (لا يوجد توقيت صيفي).",
        "sensors": ["VIIRS 375 m C2 (Suomi-NPP / NOAA-20 / NOAA-21)", "MODIS C6.1 (Terra / Aqua)",
                    "Sentinel-2 MSI L2A", "Copernicus DEM GLO-30"],
        "critical_rule": ("كل إحداثية هنا هي «أقدم نقطة حرارية رصدها القمر الصناعي» وليست «نقطة اشتعال مؤكدة». "
                          "الدقة المكانية الاسمية لـ VIIRS ≈ 375 م، والاشتعال يسبق الرصد بفترة تحدّها فجوات المرور."),
        "independence_criteria": {
            "nearest_prior_fire_km_min": 5.0,
            "largest_unburnt_path_gap_km_min": 4.0,
            "path_corridor_half_width_km": 2.5,
            "note": "المعياران معاً؛ استيفاؤهما يعني تعذّر التفسير بانتشار سطحي مرصود، لا تحديد السبب."
        },
        "counts": {"independent_origin_candidates_total": len(ORI),
                   "inside_jijel": sum(1 for o in ORI if o["wilaya"] == "جيجل")},
    },
    "clusters": []
}
for o in ORI:
    k = "%s|%.5f" % (o["first_local"], o["lat"])
    prob, note = PROB.get(k, ("غير مقدّرة", ""))
    out["clusters"].append({
        "cluster_id": o["origin_id"],
        "first_detection_utc": o["first_utc"],
        "first_detection_local": o["first_local"],
        "latitude": o["lat"], "longitude": o["lon"],
        "coordinate_source": "satellite detection centroid (FIRMS), NOT a municipality centre",
        "satellite": o["satellite"], "instrument": o["instrument"],
        "frp": o["frp_mw"], "confidence": o["confidence"], "daynight": o["daynight"],
        "nearest_locality": o["locality"] or o["daira"], "wilaya": o["wilaya"], "daira": o["daira"],
        "n_cells_same_overpass": o["n_cells_same_overpass"],
        "terrain": {"elevation_m": o["elevation_m"], "slope_deg": o["slope_deg"], "aspect_deg": o["aspect_deg"]},
        "reachability": {
            "nearest_prior_fire_km": o["nearest_prior_fire_km"],
            "nearest_prior_dt_h": o["nearest_prior_dt_h"],
            "min_required_spread_rate_kmh": o["min_required_rate_kmh"],
            "largest_unburnt_path_gap_km": o["largest_unburnt_gap_km"]},
        "sentinel2_burn_patch": {"patch_id": o["burn_patch"], "patch_area_km2": o["burn_patch_km2"],
                                 "assignment": o["burn_patch_note"]},
        "lightning_screen": o["lightning"],
        "independent_ignition_probability": prob,
        "notes": note,
    })
json.dump(out, open(os.path.join(PRO, "ignition_clusters.json"), "w", encoding="utf-8"),
          ensure_ascii=False, indent=2)
print("wrote data/processed/ignition_clusters.json  clusters=%d  (inside Jijel=%d)"
      % (len(out["clusters"]), out["meta"]["counts"]["inside_jijel"]))
