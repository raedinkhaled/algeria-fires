"""
05_weather.py -- Fire-weather forensics for the Jijel outbreak.

Two independent strands, deliberately not merged:

(1) SURFACE OBSERVATIONS (Tier 1, measured):
    METAR/SYNOP from Algerian stations via the Iowa Environmental Mesonet
    archive. These are *observations*, including present-weather codes, which
    is the only way to establish observed thunderstorm activity at a station.
    DAAV = Jijel / Taher (Ferhat Abbas). Neighbouring stations are included
    because a single coastal station cannot represent the inland massif.

(2) GRIDDED REANALYSIS / ANALYSIS (Tier 1, modelled):
    Open-Meteo hourly series at seven points chosen to span the fire complex,
    from the coast to the interior ridges. Wind is reported BOTH as the
    meteorological FROM-direction and the TOWARDS-direction, because the
    towards-vector is what must be compared with observed fire propagation.

Wind convention used everywhere in this project:
    wind_from_deg  : direction the wind blows FROM (standard meteorological)
    wind_to_deg    : (wind_from_deg + 180) mod 360 = direction fire is pushed
"""
import json, os, urllib.request, urllib.parse, csv, datetime as dt

RAW = "data/raw"
PRO = "data/processed"
os.makedirs(RAW, exist_ok=True)

# ---------------------------------------------------------------- stations
STATIONS = {
    "DAAV": "Jijel / Taher - Ferhat Abbas",
    "DAAE": "Bejaia / Soummam",
    "DABC": "Constantine / Mohamed Boudiaf",
    "DABS": "Tebessa",
    "DAAJ": "Djanet",       # control, far south - sanity check on archive
    "DABB": "Annaba / Rabah Bitat",
    "DAAS": "Setif / Ain Arnat",
}

def fetch(url, path, binary=False):
    req = urllib.request.Request(url, headers={"User-Agent": "wildfire-forensics/1.0"})
    with urllib.request.urlopen(req, timeout=180) as r:
        data = r.read()
    with open(path, "wb") as f:
        f.write(data)
    return data.decode("utf-8", errors="replace")

print("=" * 100)
print("(1) SURFACE OBSERVATIONS - METAR archive (Iowa Environmental Mesonet)")
print("=" * 100)
obs_all = {}
for st, nm in STATIONS.items():
    q = urllib.parse.urlencode({
        "station": st, "data": "tmpc,dwpc,relh,drct,sknt,gust,p01m,vsby,wxcodes,skyc1,mslp",
        "year1": 2026, "month1": 8, "day1": 20, "year2": 2026, "month2": 8, "day2": 30,
        "tz": "UTC", "format": "onlycomma", "latlon": "yes", "missing": "M", "trace": "T",
        "direct": "no", "report_type": "3", "report_type": "4",
    })
    url = "https://mesonet.agron.iastate.edu/cgi-bin/request/asos.py?" + q
    try:
        txt = fetch(url, os.path.join(RAW, "metar_%s.csv" % st))
        rows = list(csv.DictReader(txt.splitlines()))
        obs_all[st] = rows
        print("  %-5s %-38s rows=%4d" % (st, nm, len(rows)))
    except Exception as e:
        print("  %-5s %-38s FAILED %s" % (st, nm, e))

# thunderstorm / precipitation screen over the whole archive window
print("\n--- present-weather codes reported 20-30 Aug 2026 (thunderstorm screen) ---")
for st, rows in obs_all.items():
    codes = {}
    precip = 0.0
    for r in rows:
        w = (r.get("wxcodes") or "").strip()
        if w and w != "M":
            codes[w] = codes.get(w, 0) + 1
        try:
            p = float(r.get("p01m", "M"))
            precip += p
        except ValueError:
            pass
    ts = {k: v for k, v in codes.items() if "TS" in k}
    print("  %-5s  total precip(sum p01m)=%6.2f mm | wx codes: %s | THUNDER: %s"
          % (st, precip, codes if codes else "none", ts if ts else "NONE REPORTED"))

# ---------------------------------------------------------------- gridded
print("\n" + "=" * 100)
print("(2) GRIDDED HOURLY METEOROLOGY - Open-Meteo (ECMWF/best-match analysis)")
print("=" * 100)
POINTS = {
    "P1_Chekfa_origin":        (36.70906, 5.98090),
    "P2_Ziama_origin":         (36.56917, 5.40396),
    "P3_Texenna":              (36.66900, 5.76800),
    "P4_DjemaaBeniHabibi":     (36.80100, 6.08660),
    "P5_SidiMaarouf_origin":   (36.61221, 6.28743),
    "P6_ElMilia":              (36.80450, 6.27280),
    "P7_Jijel_coast":          (36.79530, 5.75120),
}
HOURLY = ("temperature_2m,relative_humidity_2m,dew_point_2m,precipitation,"
          "wind_speed_10m,wind_direction_10m,wind_gusts_10m,soil_moisture_0_to_7cm,"
          "vapour_pressure_deficit,cape,weather_code,surface_pressure")

series = {}
for nm, (la, lo) in POINTS.items():
    url = ("https://api.open-meteo.com/v1/forecast?latitude=%s&longitude=%s&hourly=%s"
           "&start_date=2026-08-21&end_date=2026-08-29&timezone=UTC&wind_speed_unit=kmh"
           % (la, lo, HOURLY))
    try:
        txt = fetch(url, os.path.join(RAW, "openmeteo_%s.json" % nm))
        j = json.loads(txt)
        series[nm] = j
        print("  %-24s %.4f,%.4f  elev=%sm  hours=%d"
              % (nm, la, lo, j.get("elevation"), len(j["hourly"]["time"])))
    except Exception as e:
        print("  %-24s FAILED %s" % (nm, e))

# flatten to one tidy CSV
out = []
for nm, j in series.items():
    h = j["hourly"]
    for i, t in enumerate(h["time"]):
        utc = dt.datetime.strptime(t, "%Y-%m-%dT%H:%M").replace(tzinfo=dt.timezone.utc)
        wf = h["wind_direction_10m"][i]
        out.append({
            "point": nm, "lat": j["latitude"], "lon": j["longitude"], "elev_m": j.get("elevation"),
            "datetime_utc": utc.strftime("%Y-%m-%d %H:%M"),
            "datetime_local": (utc + dt.timedelta(hours=1)).strftime("%Y-%m-%d %H:%M"),
            "temp_c": h["temperature_2m"][i], "rh_pct": h["relative_humidity_2m"][i],
            "dewpoint_c": h["dew_point_2m"][i], "precip_mm": h["precipitation"][i],
            "wind_kmh": h["wind_speed_10m"][i], "gust_kmh": h["wind_gusts_10m"][i],
            "wind_from_deg": wf,
            "wind_to_deg": (wf + 180) % 360 if wf is not None else None,
            "vpd_kpa": h["vapour_pressure_deficit"][i], "cape_jkg": h["cape"][i],
            "soil_moist_0_7": h["soil_moisture_0_to_7cm"][i],
            "weather_code": h["weather_code"][i], "pressure_hpa": h["surface_pressure"][i],
        })
with open(os.path.join(PRO, "weather_hourly.csv"), "w", newline="", encoding="utf-8") as f:
    w = csv.DictWriter(f, fieldnames=list(out[0].keys()))
    w.writeheader()
    w.writerows(out)
print("\nwrote data/processed/weather_hourly.csv  rows=%d" % len(out))

# quick screen: any modelled precipitation or convective weather codes?
print("\n--- gridded screen: precipitation and thunderstorm weather codes 21-29 Aug ---")
for nm in POINTS:
    rows = [r for r in out if r["point"] == nm]
    tp = sum(r["precip_mm"] or 0 for r in rows)
    wc = sorted({r["weather_code"] for r in rows})
    mx_cape = max((r["cape_jkg"] or 0) for r in rows)
    ts_codes = [c for c in wc if c in (95, 96, 99)]
    print("  %-24s precip_total=%5.2f mm  max_CAPE=%6.0f J/kg  wcodes=%s  TS_codes=%s"
          % (nm, tp, mx_cape, wc, ts_codes if ts_codes else "NONE"))
