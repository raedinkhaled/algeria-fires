"""
03_cluster_events.py -- Spatio-temporal delineation of independent fire events.

Method
------
1. Clip FIRMS detections to Jijel province (OSM relation 1278746) plus a 10 km
   analysis buffer, so fires straddling the wilaya border are not truncated.
2. Reduce detections to a 375 m equal-area grid (the VIIRS nominal footprint).
   For every grid cell we keep the EARLIEST acquisition. This is the correct
   unit for a first-appearance analysis: repeated overpasses of the same burning
   pixel are not new information about where fire appeared.
3. Delineate fire events by single-linkage clustering of grid cells under a
   JOINT constraint: two cells join the same event if they are within D_max
   metres AND their first detections are within T_max hours. Cells that join no
   other cell form their own event. This is standard "fire event delineation"
   logic, not plain DBSCAN, because a purely spatial DBSCAN would merge fires
   that burned the same slope days apart.
4. Sensitivity analysis over D_max and T_max, because the count of "independent"
   events is an artefact of those thresholds and must be reported as such.
5. Plain spatial DBSCAN is also run for comparison.

IMPORTANT INTERPRETIVE RULE (applied throughout the project):
The first detection of an event is the EARLIEST SATELLITE-DETECTED THERMAL
ANOMALY for that event -- it is NOT the ignition point. Ignition necessarily
precedes detection by an unknown interval bounded by the overpass gap.
"""
import csv, json, os, math, itertools
import numpy as np
from shapely.geometry import shape, Point
from shapely.ops import unary_union
from shapely.prepared import prep
from pyproj import CRS, Transformer, Geod
from scipy.spatial import cKDTree, ConvexHull
from sklearn.cluster import DBSCAN

OUT = "data/processed"
os.makedirs(OUT, exist_ok=True)
LAT0, LON0 = 36.72, 6.00
aeqd = CRS.from_proj4("+proj=aeqd +lat_0=%s +lon_0=%s +datum=WGS84 +units=m +no_defs" % (LAT0, LON0))
to_m = Transformer.from_crs("EPSG:4326", aeqd, always_xy=True)
to_ll = Transformer.from_crs(aeqd, "EPSG:4326", always_xy=True)
GEOD = Geod(ellps="WGS84")

# ---------- province polygon + buffer -------------------------------------
prov = shape(json.load(open("data/raw/jijel_province_boundary.geojson", encoding="utf-8")))
parts = []
for poly in (prov.geoms if prov.geom_type == "MultiPolygon" else [prov]):
    ring = [to_m.transform(x, y) for x, y in poly.exterior.coords]
    parts.append(shape({"type": "Polygon", "coordinates": [ring]}))
prov_m = unary_union(parts)
buf_m = prov_m.buffer(10000)
prep_prov, prep_buf = prep(prov_m), prep(buf_m)

# ---------- load detections ------------------------------------------------
rows = list(csv.DictReader(open(os.path.join(OUT, "hotspots_master.csv"), encoding="utf-8")))
for r in rows:
    r["latitude"] = float(r["latitude"])
    r["longitude"] = float(r["longitude"])
    r["epoch"] = int(r["epoch"])
    r["frp_mw"] = float(r["frp_mw"]) if r["frp_mw"] else 0.0
    x, y = to_m.transform(r["longitude"], r["latitude"])
    r["x"], r["y"] = x, y
    p = Point(x, y)
    r["in_province"] = prep_prov.contains(p)
    r["in_buffer"] = prep_buf.contains(p)

sel = [r for r in rows if r["in_buffer"]]
sel.sort(key=lambda r: r["epoch"])
print("regional detections     : %d" % len(rows))
print("in Jijel province       : %d" % sum(r["in_province"] for r in rows))
print("in province + 10 km buf : %d   <-- analysis set" % len(sel))

cols = [c for c in sel[0].keys() if c not in ("x", "y")]
with open(os.path.join(OUT, "hotspots_jijel_clipped.csv"), "w", newline="", encoding="utf-8") as f:
    w = csv.DictWriter(f, fieldnames=cols)
    w.writeheader()
    w.writerows([{k: r[k] for k in cols} for r in sel])

# ---------- 375 m grid reduction: earliest detection per cell --------------
CELL = 375.0
cells = {}
for r in sel:
    key = (int(math.floor(r["x"] / CELL)), int(math.floor(r["y"] / CELL)))
    c = cells.get(key)
    if c is None:
        cells[key] = c = {"key": key, "n": 0, "frp_sum": 0.0, "frp_max": 0.0,
                          "first": r, "last": r, "instruments": set()}
    c["n"] += 1
    c["frp_sum"] += r["frp_mw"]
    c["frp_max"] = max(c["frp_max"], r["frp_mw"])
    c["instruments"].add(r["instrument"])
    if r["epoch"] < c["first"]["epoch"]:
        c["first"] = r
    if r["epoch"] > c["last"]["epoch"]:
        c["last"] = r

cl = sorted(cells.values(), key=lambda c: c["first"]["epoch"])
for c in cl:
    c["cx"] = (c["key"][0] + 0.5) * CELL
    c["cy"] = (c["key"][1] + 0.5) * CELL
    c["t0"] = c["first"]["epoch"]
print("375 m grid cells        : %d  (from %d detections)" % (len(cl), len(sel)))

XY = np.array([[c["cx"], c["cy"]] for c in cl])
T = np.array([c["t0"] for c in cl], dtype=float)


class UF:
    def __init__(self, n):
        self.p = list(range(n))

    def find(self, a):
        while self.p[a] != a:
            self.p[a] = self.p[self.p[a]]
            a = self.p[a]
        return a

    def union(self, a, b):
        ra, rb = self.find(a), self.find(b)
        if ra != rb:
            self.p[rb] = ra


TREE = cKDTree(XY)


def delineate(d_max_m, t_max_h):
    uf = UF(len(cl))
    t_max_s = t_max_h * 3600.0
    for i, j in TREE.query_pairs(d_max_m):
        if abs(T[i] - T[j]) <= t_max_s:
            uf.union(i, j)
    lab, out = {}, np.empty(len(cl), dtype=int)
    for i in range(len(cl)):
        r = uf.find(i)
        out[i] = lab.setdefault(r, len(lab))
    return out


print("\n--- sensitivity: number of delineated fire events ---")
print("%9s " % "D_max(m)" + " ".join(("T=%dh" % t).rjust(8) for t in (6, 12, 24, 48)))
grid_results = {}
for d in (750, 1000, 1500, 2000, 3000, 5000):
    line = "%9d " % d
    for t in (6, 12, 24, 48):
        labs = delineate(d, t)
        grid_results[(d, t)] = labs
        line += "%8d " % len(set(labs))
    print(line)

D_REF, T_REF = 2000, 24
labels = grid_results[(D_REF, T_REF)]
print("\nreference configuration: D_max=%d m, T_max=%d h" % (D_REF, T_REF))

for eps in (750, 1500, 3000):
    db = DBSCAN(eps=eps, min_samples=2).fit(XY)
    n = len(set(db.labels_) - {-1})
    noise = int((db.labels_ == -1).sum())
    print("  spatial-only DBSCAN eps=%5d m -> %3d clusters, %d noise cells" % (eps, n, noise))

# ---------- commune gazetteer ---------------------------------------------
COMMUNES = []
for e in json.load(open("data/raw/osm_jijel_places.json", encoding="utf-8"))["elements"]:
    if e["type"] == "relation" and e.get("tags", {}).get("admin_level") == "8":
        t = e["tags"]
        c = e["center"]
        COMMUNES.append((t.get("name", "").split(" ")[0], t.get("name:ar", ""), c["lat"], c["lon"]))


def nearest_commune(lat, lon):
    best = min(COMMUNES, key=lambda c: GEOD.inv(lon, lat, c[3], c[2])[2])
    d = GEOD.inv(lon, lat, best[3], best[2])[2] / 1000.0
    return best[0], best[1], round(d, 2)


events = {}
for c, L in zip(cl, labels):
    events.setdefault(int(L), []).append(c)

rec = []
for eid, members in events.items():
    members.sort(key=lambda c: c["t0"])
    f = members[0]["first"]
    xs = np.array([m["cx"] for m in members])
    ys = np.array([m["cy"] for m in members])
    lonc, latc = to_ll.transform(xs.mean(), ys.mean())
    ext = 0.0
    if len(members) > 1:
        pts = np.column_stack([xs, ys])
        try:
            P = pts[ConvexHull(pts).vertices]
        except Exception:
            P = pts
        for a, b in itertools.combinations(range(len(P)), 2):
            ext = max(ext, math.hypot(*(P[a] - P[b])))
    cn, ca, cd = nearest_commune(f["latitude"], f["longitude"])
    rec.append({
        "event_id": "E%03d" % eid, "n_cells": len(members),
        "n_detections": sum(m["n"] for m in members),
        "first_utc": f["datetime_utc"], "first_local": f["datetime_local"],
        "first_epoch": f["epoch"],
        "first_lat": round(f["latitude"], 5), "first_lon": round(f["longitude"], 5),
        "first_sat": f["sat_code"], "first_instrument": f["instrument"],
        "first_conf": f["conf_class"], "first_frp_mw": f["frp_mw"],
        "first_daynight": f["daynight"], "first_bright_ti4_k": f["bright_ti4_k"],
        "last_utc": max(m["last"]["datetime_utc"] for m in members),
        "centroid_lat": round(latc, 5), "centroid_lon": round(lonc, 5),
        "total_frp_mw": round(sum(m["frp_sum"] for m in members), 1),
        "max_frp_mw": round(max(m["frp_max"] for m in members), 1),
        "max_extent_km": round(ext / 1000.0, 2),
        "approx_area_km2": round(len(members) * (CELL / 1000.0) ** 2, 2),
        "nearest_commune": cn, "nearest_commune_ar": ca, "dist_to_commune_centre_km": cd,
        "in_province": f["in_province"],
    })
rec.sort(key=lambda r: r["first_epoch"])
with open(os.path.join(OUT, "fire_events.csv"), "w", newline="", encoding="utf-8") as f:
    w = csv.DictWriter(f, fieldnames=list(rec[0].keys()))
    w.writeheader()
    w.writerows(rec)

# also persist the gridded first-detection table (used by later scripts)
with open(os.path.join(OUT, "grid_first_detection.csv"), "w", newline="", encoding="utf-8") as f:
    w = csv.writer(f)
    w.writerow(["cell_x", "cell_y", "lat", "lon", "first_utc", "first_local", "first_epoch",
                "sat", "instrument", "conf", "frp_mw", "daynight", "n_det", "frp_sum", "event_id"])
    for c, L in zip(cl, labels):
        fr = c["first"]
        w.writerow([c["key"][0], c["key"][1], round(fr["latitude"], 5), round(fr["longitude"], 5),
                    fr["datetime_utc"], fr["datetime_local"], fr["epoch"], fr["sat_code"],
                    fr["instrument"], fr["conf_class"], fr["frp_mw"], fr["daynight"],
                    c["n"], round(c["frp_sum"], 1), "E%03d" % int(L)])

big = [r for r in rec if r["n_cells"] >= 3]
print("\nevents total = %d;  events with >=3 grid cells = %d" % (len(rec), len(big)))
hdr = "%5s %16s %9s %8s %4s %6s %7s %7s  commune" % ("ID", "first local", "lat", "lon", "sat", "cells", "area", "ext_km")
print("\n" + hdr)
for r in big[:45]:
    print("%5s %16s %9.4f %8.4f %4s %6d %7.1f %7.2f  %s" % (
        r["event_id"], r["first_local"], r["first_lat"], r["first_lon"], r["first_sat"],
        r["n_cells"], r["approx_area_km2"], r["max_extent_km"], r["nearest_commune"]))
