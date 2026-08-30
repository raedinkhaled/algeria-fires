"""
01_download_firms.py
Download NASA FIRMS near-real-time active fire / thermal anomaly products
(global 7-day CSV archives, publicly served without API key) and subset them
to the Jijel Province study area.

Study bounding box (initial): 36.2-37.2 N, 5.0-6.8 E
A wider "regional context" box is also saved to test for neighbouring-wilaya
detections and possible long-range relationships.

Provider : NASA FIRMS / LANCE, NASA Goddard Space Flight Center
Products : VIIRS 375 m C2 (S-NPP, NOAA-20, NOAA-21), MODIS C6.1 1 km
"""
import csv, io, os, sys, urllib.request, datetime

OUT = os.path.join("data", "raw")
os.makedirs(OUT, exist_ok=True)

SOURCES = {
    "VIIRS_SNPP_375m":   "https://firms.modaps.eosdis.nasa.gov/data/active_fire/suomi-npp-viirs-c2/csv/SUOMI_VIIRS_C2_Global_7d.csv",
    "VIIRS_NOAA20_375m": "https://firms.modaps.eosdis.nasa.gov/data/active_fire/noaa-20-viirs-c2/csv/J1_VIIRS_C2_Global_7d.csv",
    "VIIRS_NOAA21_375m": "https://firms.modaps.eosdis.nasa.gov/data/active_fire/noaa-21-viirs-c2/csv/J2_VIIRS_C2_Global_7d.csv",
    "MODIS_C61_1km":     "https://firms.modaps.eosdis.nasa.gov/data/active_fire/modis-c6.1/csv/MODIS_C6_1_Global_7d.csv",
}

# study box and wider regional context box
BOX_STUDY  = dict(lat_min=36.2, lat_max=37.2, lon_min=5.0, lon_max=6.8)
BOX_REGION = dict(lat_min=35.5, lat_max=37.5, lon_min=3.5, lon_max=8.5)

def inbox(lat, lon, b):
    return b["lat_min"] <= lat <= b["lat_max"] and b["lon_min"] <= lon <= b["lon_max"]

manifest = []
for name, url in SOURCES.items():
    print(f"[*] {name}\n    {url}", flush=True)
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "wildfire-forensics/1.0"})
        with urllib.request.urlopen(req, timeout=300) as r:
            raw = r.read()
    except Exception as e:
        print(f"    !! FAILED: {e}")
        manifest.append((name, url, "FAILED", str(e), 0, 0))
        continue

    txt = raw.decode("utf-8", errors="replace")
    rdr = csv.DictReader(io.StringIO(txt))
    hdr = rdr.fieldnames
    rows_study, rows_region = [], []
    total = 0
    for row in rdr:
        total += 1
        try:
            la = float(row["latitude"]); lo = float(row["longitude"])
        except (ValueError, KeyError, TypeError):
            continue
        if inbox(la, lo, BOX_REGION):
            rows_region.append(row)
            if inbox(la, lo, BOX_STUDY):
                rows_study.append(row)

    # save full raw copy of the *regional* subset (keeps /data/raw a manageable size
    # while preserving every record that any part of the analysis could touch)
    for tag, rows in (("region", rows_region), ("study", rows_study)):
        p = os.path.join(OUT, f"FIRMS_{name}_7d_{tag}.csv")
        with open(p, "w", newline="", encoding="utf-8") as f:
            w = csv.DictWriter(f, fieldnames=hdr)
            w.writeheader()
            w.writerows(rows)
    dates = sorted({r["acq_date"] for r in rows_region}) if rows_region else []
    print(f"    global rows={total:,}  region={len(rows_region)}  study={len(rows_study)}  dates={dates}")
    manifest.append((name, url, "OK", "", len(rows_region), len(rows_study)))

with open(os.path.join(OUT, "_download_manifest.txt"), "w", encoding="utf-8") as f:
    f.write(f"FIRMS download run: {datetime.datetime.now(datetime.timezone.utc).isoformat()}Z\n")
    f.write("product\turl\tstatus\terror\tregion_rows\tstudy_rows\n")
    for m in manifest:
        f.write("\t".join(str(x) for x in m) + "\n")
print("\n[done]")
