"""
02_build_master.py  --  Build the cleaned, merged hotspot master table.

Inputs : data/raw/EU7d_{SNPP,NOAA20,NOAA21,MODIS}.csv  (NASA FIRMS NRT, Europe 7-day)
Output : data/processed/hotspots_master.csv
         data/processed/hotspots_jijelbox.csv

Notes
-----
* FIRMS acq_time is HHMM in UTC. Algeria (CET, Africa/Algiers) = UTC+1 all year
  (Algeria does not observe DST), so local = UTC + 1 h.
* VIIRS confidence is categorical (low/nominal/high); MODIS confidence is 0-100.
  A single normalised column `conf_class` is added for cross-sensor work.
* No de-duplication *across* sensors is performed: each satellite overpass is an
  independent observation and merging them would destroy the timing information
  that the first-detection reconstruction depends on.
"""
import csv, os, datetime as dt

RAW = "data/raw"; OUT = "data/processed"
os.makedirs(OUT, exist_ok=True)

SENSOR_META = {
    "SNPP":   ("Suomi-NPP",  "VIIRS", 375),
    "NOAA20": ("NOAA-20",    "VIIRS", 375),
    "NOAA21": ("NOAA-21",    "VIIRS", 375),
    "MODIS":  ("Aqua/Terra", "MODIS", 1000),
}

def conf_class(v, instrument):
    v = (v or "").strip()
    if instrument == "VIIRS":
        return {"l": "low", "n": "nominal", "h": "high"}.get(v[:1].lower(), v or "unknown")
    try:
        n = float(v)
    except ValueError:
        return "unknown"
    return "low" if n < 30 else ("nominal" if n < 80 else "high")

rows = []
for tag, (platform, instrument, res_m) in SENSOR_META.items():
    path = os.path.join(RAW, f"EU7d_{tag}.csv")
    with open(path, encoding="utf-8") as f:
        for r in csv.DictReader(f):
            lat, lon = float(r["latitude"]), float(r["longitude"])
            if not (35.5 <= lat <= 37.5 and 3.5 <= lon <= 8.5):
                continue                     # regional context box
            hhmm = r["acq_time"].zfill(4)
            utc = dt.datetime.strptime(f'{r["acq_date"]} {hhmm}', "%Y-%m-%d %H%M").replace(tzinfo=dt.timezone.utc)
            loc = utc + dt.timedelta(hours=1)          # Africa/Algiers = UTC+1, no DST
            rows.append({
                "source_file": f"EU7d_{tag}.csv",
                "platform": platform if tag != "MODIS" else ("Aqua" if r.get("satellite")=="Aqua" else "Terra"),
                "sat_code": r.get("satellite", tag),
                "instrument": instrument,
                "nominal_res_m": res_m,
                "latitude": lat, "longitude": lon,
                "acq_date": r["acq_date"], "acq_time_utc_hhmm": hhmm,
                "datetime_utc": utc.strftime("%Y-%m-%d %H:%M"),
                "datetime_local": loc.strftime("%Y-%m-%d %H:%M"),
                "local_date": loc.strftime("%Y-%m-%d"),
                "epoch": int(utc.timestamp()),
                "daynight": r.get("daynight", ""),
                "confidence_raw": r.get("confidence", ""),
                "conf_class": conf_class(r.get("confidence"), instrument),
                "frp_mw": float(r["frp"]) if r.get("frp") not in (None, "") else None,
                "bright_ti4_k": float(r["bright_ti4"]) if r.get("bright_ti4") else None,
                "bright_ti5_k": float(r["bright_ti5"]) if r.get("bright_ti5") else None,
                "brightness_k": float(r["brightness"]) if r.get("brightness") else None,
                "bright_t31_k": float(r["bright_t31"]) if r.get("bright_t31") else None,
                "scan": float(r["scan"]) if r.get("scan") else None,
                "track": float(r["track"]) if r.get("track") else None,
                "version": r.get("version", ""),
            })

rows.sort(key=lambda x: (x["epoch"], x["latitude"], x["longitude"]))
cols = list(rows[0].keys())

def write(path, data):
    with open(path, "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=cols); w.writeheader(); w.writerows(data)

write(os.path.join(OUT, "hotspots_master.csv"), rows)
jij = [r for r in rows if 36.2 <= r["latitude"] <= 37.2 and 5.0 <= r["longitude"] <= 6.8]
write(os.path.join(OUT, "hotspots_jijelbox.csv"), jij)

print(f"regional rows : {len(rows)}")
print(f"jijel-box rows: {len(jij)}")
import collections
print("\nby local date x instrument (jijel box):")
c = collections.Counter((r["local_date"], r["instrument"]) for r in jij)
for k in sorted(c): print(f"  {k[0]}  {k[1]:6s} {c[k]:5d}")
print("\nearliest 5 in jijel box:")
for r in jij[:5]:
    print(f"  {r['datetime_utc']}Z / {r['datetime_local']} local  {r['latitude']:.5f},{r['longitude']:.5f}  {r['sat_code']:5s} frp={r['frp_mw']}")
