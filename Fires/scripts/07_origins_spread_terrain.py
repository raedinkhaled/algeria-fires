"""
07_origins_spread_terrain.py

A. Commune assignment by point-in-polygon (not nearest centroid).
B. Onset table: first satellite-detected thermal anomaly per commune.
C. Reachability test on the cleaned (industry-masked) dataset: for every newly
   appearing 375 m cell, distance and elapsed time to the nearest previously
   detected wildfire cell, and the implied minimum straight-line propagation
   rate. Cells requiring rates beyond plausible surface spread are flagged.
D. Spread reconstruction per event: per-overpass head advance, bearing, rate,
   and agreement with the wind vector at that place and hour.
E. Terrain from Copernicus DEM GLO-30: elevation, slope, aspect at each origin.
F. Human-infrastructure proximity of each origin (roads by class, power lines,
   settlements, landfill/quarry/industrial, farmland).

Wind convention: wind_to_deg is the direction the wind pushes toward. Fire
bearing is measured the same way, so agreement means |bearing - wind_to| small.
"""
import csv, json, os, math, datetime as dt
import numpy as np
from pyproj import CRS, Transformer, Geod
from scipy.spatial import cKDTree
from shapely.geometry import shape, Point, LineString, MultiLineString
from shapely.strtree import STRtree
import rasterio

PRO, RAW = "data/processed", "data/raw"
GEOD = Geod(ellps="WGS84")
LAT0, LON0 = 36.72, 6.00
AEQD = CRS.from_proj4("+proj=aeqd +lat_0=%s +lon_0=%s +datum=WGS84 +units=m +no_defs" % (LAT0, LON0))
to_m = Transformer.from_crs("EPSG:4326", AEQD, always_xy=True)
to_ll = Transformer.from_crs(AEQD, "EPSG:4326", always_xy=True)


def bearing(lon1, lat1, lon2, lat2):
    """forward azimuth 0-360, 0=N, 90=E"""
    az = GEOD.inv(lon1, lat1, lon2, lat2)[0]
    return az % 360.0


def angdiff(a, b):
    d = abs((a - b) % 360.0)
    return min(d, 360.0 - d)


# ---------------------------------------------------------------- A. communes
COM = json.load(open(os.path.join(RAW, "jijel_communes.geojson"), encoding="utf-8"))["features"]
AR = {}
for e in json.load(open(os.path.join(RAW, "osm_jijel_places.json"), encoding="utf-8"))["elements"]:
    if e["type"] == "relation" and e.get("tags", {}).get("admin_level") == "8":
        AR[e["id"]] = (e["tags"].get("name", "").split(" ")[0], e["tags"].get("name:ar", ""))
polys = []
for f in COM:
    nm_lat, nm_ar = AR.get(f["properties"]["osm_id"], (f["properties"]["name"], ""))
    polys.append((shape(f["geometry"]), nm_lat, nm_ar))


def commune_of(lat, lon):
    p = Point(lon, lat)
    for g, nm, ar in polys:
        if g.contains(p):
            return nm, ar
    return "(outside Jijel)", "(خارج ولاية جيجل)"


# ---------------------------------------------------------------- load cells
cells = list(csv.DictReader(open(os.path.join(PRO, "grid_first_detection_clean.csv"), encoding="utf-8")))
for c in cells:
    c["lat"] = float(c["lat"]); c["lon"] = float(c["lon"])
    c["first_epoch"] = int(c["first_epoch"])
    c["frp_mw"] = float(c["frp_mw"]) if c["frp_mw"] else 0.0
    c["cx"] = float(c["cx"]); c["cy"] = float(c["cy"])
cells.sort(key=lambda c: c["first_epoch"])
print("cleaned grid cells: %d" % len(cells))

print("\n" + "=" * 112)
print("B. FIRST SATELLITE-DETECTED THERMAL ANOMALY PER COMMUNE  (NOT an ignition point)")
print("=" * 112)
firsts = {}
for c in cells:
    nm, ar = commune_of(c["lat"], c["lon"])
    c["commune"], c["commune_ar"] = nm, ar
    if nm not in firsts:
        firsts[nm] = c
print("%-26s %-18s %-16s %10s %9s %5s %6s %8s" %
      ("commune", "first local", "first UTC", "lat", "lon", "sat", "conf", "FRP"))
print("-" * 112)
for nm, c in sorted(firsts.items(), key=lambda kv: kv[1]["first_epoch"]):
    print("%-26s %-18s %-16s %10.5f %9.5f %5s %6s %8.1f" %
          (nm, c["first_local"], c["first_utc"], c["lat"], c["lon"], c["sat"], c["conf"], c["frp_mw"]))
with open(os.path.join(PRO, "first_detection_per_commune.csv"), "w", newline="", encoding="utf-8") as f:
    w = csv.DictWriter(f, fieldnames=["commune", "commune_ar", "first_local", "first_utc", "lat", "lon",
                                      "sat", "instrument", "conf", "frp_mw", "daynight", "event_id"],
                       extrasaction="ignore")
    w.writeheader()
    w.writerows([firsts[k] for k in sorted(firsts, key=lambda k: firsts[k]["first_epoch"])])

# ---------------------------------------------------------------- C. reachability
print("\n" + "=" * 112)
print("C. REACHABILITY TEST (industry-masked). For each newly appearing cell: distance to the nearest")
print("   ALREADY-DETECTED wildfire cell and the minimum average rate the earlier fire would have")
print("   needed to reach it. Same-overpass cells cannot serve as each other's antecedent.")
print("=" * 112)
XY = np.array([[c["cx"], c["cy"]] for c in cells])
EP = np.array([c["first_epoch"] for c in cells])
seen, i, n = [], 0, len(cells)
while i < n:
    j = i
    while j < n and EP[j] == EP[i]:
        j += 1
    if seen:
        t = cKDTree(XY[seen])
        dd, ii = t.query(XY[i:j], k=1)
        for k in range(i, j):
            s = seen[ii[k - i]]
            cells[k]["d_prior_m"] = float(dd[k - i])
            cells[k]["dt_prior_s"] = int(EP[k] - EP[s])
            cells[k]["src_lat"] = cells[s]["lat"]; cells[k]["src_lon"] = cells[s]["lon"]
            cells[k]["bearing_from_prior"] = bearing(cells[s]["lon"], cells[s]["lat"],
                                                     cells[k]["lon"], cells[k]["lat"])
    else:
        for k in range(i, j):
            cells[k]["d_prior_m"] = None; cells[k]["dt_prior_s"] = None
            cells[k]["src_lat"] = None; cells[k]["src_lon"] = None
            cells[k]["bearing_from_prior"] = None
    seen.extend(range(i, j))
    i = j
for c in cells:
    d, s = c["d_prior_m"], c["dt_prior_s"]
    c["implied_rate_kmh"] = round((d / 1000) / (s / 3600), 3) if d is not None and s and s > 0 else None

# Plausibility bands for Mediterranean shrub/forest under extreme wind
#   sustained head-fire rate of spread: typically 0.5-3 km/h; brief runs to ~6 km/h
#   short-range spotting: hundreds of metres; long-range spotting documented to
#   several km ahead of the front in severe plume-driven fires.
FLAG_KM = 5.0
cand = [c for c in cells if c["d_prior_m"] is not None and c["d_prior_m"] >= FLAG_KM * 1000]
print("cells first detected >= %.0f km from any prior wildfire detection: %d of %d\n" % (FLAG_KM, len(cand), len(cells)))
print("%-18s %10s %9s %5s %8s %9s %8s %10s %9s  %s" %
      ("first local", "lat", "lon", "sat", "FRP", "dist_km", "dt_h", "rate_km/h", "bearing", "commune"))
print("-" * 112)
for c in cand:
    print("%-18s %10.5f %9.5f %5s %8.1f %9.2f %8.2f %10.2f %9.0f  %s" %
          (c["first_local"], c["lat"], c["lon"], c["sat"], c["frp_mw"],
           c["d_prior_m"] / 1000, c["dt_prior_s"] / 3600, c["implied_rate_kmh"],
           c["bearing_from_prior"], c["commune"]))

with open(os.path.join(PRO, "reachability_all_cells.csv"), "w", newline="", encoding="utf-8") as f:
    fn = ["lat", "lon", "first_utc", "first_local", "sat", "instrument", "conf", "frp_mw", "daynight",
          "event_id", "commune", "commune_ar", "d_prior_m", "dt_prior_s", "implied_rate_kmh",
          "bearing_from_prior", "src_lat", "src_lon"]
    w = csv.DictWriter(f, fieldnames=fn, extrasaction="ignore")
    w.writeheader(); w.writerows(cells)

# ---------------------------------------------------------------- D. spread + wind
print("\n" + "=" * 112)
print("D. SPREAD RECONSTRUCTION vs WIND, per event and overpass")
print("   head_km  = furthest advance of newly detected cells beyond the previously detected footprint")
print("   bearing  = direction of that advance (0=N, 90=E); wind_to = direction wind pushes toward")
print("=" * 112)
wx = list(csv.DictReader(open(os.path.join(PRO, "weather_hourly.csv"), encoding="utf-8")))
WPTS = {}
for r in wx:
    WPTS.setdefault(r["point"], []).append(r)
WLOC = {k: (float(v[0]["lat"]), float(v[0]["lon"])) for k, v in WPTS.items()}
WIDX = {k: {r["datetime_utc"][:13]: r for r in v} for k, v in WPTS.items()}


def wind_at(lat, lon, epoch):
    best = min(WLOC, key=lambda k: GEOD.inv(lon, lat, WLOC[k][1], WLOC[k][0])[2])
    key = dt.datetime.fromtimestamp(epoch, dt.timezone.utc).strftime("%Y-%m-%d %H")
    r = WIDX[best].get(key)
    if not r:
        return None
    try:
        return {"pt": best, "from": float(r["wind_from_deg"]), "to": float(r["wind_to_deg"]),
                "kmh": float(r["wind_kmh"]), "gust": float(r["gust_kmh"]),
                "t": float(r["temp_c"]), "rh": float(r["rh_pct"])}
    except (TypeError, ValueError):
        return None


byev = {}
for c in cells:
    byev.setdefault(c["event_id"], []).append(c)

spread_rows = []
for eid in sorted(byev, key=lambda e: min(c["first_epoch"] for c in byev[e])):
    mem = sorted(byev[eid], key=lambda c: c["first_epoch"])
    if len(mem) < 20:
        continue
    times = sorted({c["first_epoch"] for c in mem})
    print("\n--- event %s  (%d cells, first %s local, commune of origin: %s) ---" %
          (eid, len(mem), mem[0]["first_local"], mem[0]["commune"]))
    print("%-18s %6s %8s %8s %8s %9s %9s %8s %7s %6s  %s" %
          ("overpass local", "new", "head_km", "dt_h", "rate", "bearing", "wind_to", "wind_kmh",
           "T(C)", "RH%", "agreement"))
    prev_t = None
    for t in times:
        new = [c for c in mem if c["first_epoch"] == t]
        prior = [c for c in mem if c["first_epoch"] < t]
        if not prior or not new:
            prev_t = t
            continue
        ptree = cKDTree(np.array([[p["cx"], p["cy"]] for p in prior]))
        dd, ii = ptree.query(np.array([[c["cx"], c["cy"]] for c in new]), k=1)
        kmax = int(np.argmax(dd))
        head = float(dd[kmax]) / 1000.0
        src = prior[int(ii[kmax])]
        brg = bearing(src["lon"], src["lat"], new[kmax]["lon"], new[kmax]["lat"])
        dth = (t - prev_t) / 3600.0 if prev_t else None
        rate = head / dth if dth else None
        w = wind_at(new[kmax]["lat"], new[kmax]["lon"], t)
        agree = ""
        if w:
            a = angdiff(brg, w["to"])
            agree = "ALIGNED(%.0f)" % a if a <= 45 else ("cross(%.0f)" % a if a <= 90 else "OPPOSED(%.0f)" % a)
        print("%-18s %6d %8.2f %8s %8s %9.0f %9s %8s %7s %6s  %s" %
              (new[0]["first_local"], len(new), head,
               ("%.2f" % dth) if dth else "-", ("%.2f" % rate) if rate else "-",
               brg, ("%.0f" % w["to"]) if w else "-", ("%.1f" % w["kmh"]) if w else "-",
               ("%.0f" % w["t"]) if w else "-", ("%.0f" % w["rh"]) if w else "-", agree))
        spread_rows.append({"event_id": eid, "overpass_local": new[0]["first_local"],
                            "overpass_utc": new[0]["first_utc"], "n_new_cells": len(new),
                            "head_advance_km": round(head, 2),
                            "dt_h": round(dth, 2) if dth else None,
                            "rate_kmh": round(rate, 2) if rate else None,
                            "bearing_deg": round(brg, 0),
                            "wind_to_deg": round(w["to"], 0) if w else None,
                            "wind_kmh": w["kmh"] if w else None,
                            "gust_kmh": w["gust"] if w else None,
                            "temp_c": w["t"] if w else None, "rh_pct": w["rh"] if w else None,
                            "angle_diff_deg": round(angdiff(brg, w["to"]), 0) if w else None,
                            "wx_point": w["pt"] if w else None})
        prev_t = t
with open(os.path.join(PRO, "spread_vs_wind.csv"), "w", newline="", encoding="utf-8") as f:
    w = csv.DictWriter(f, fieldnames=list(spread_rows[0].keys())); w.writeheader(); w.writerows(spread_rows)
print("\nwrote data/processed/spread_vs_wind.csv rows=%d" % len(spread_rows))
