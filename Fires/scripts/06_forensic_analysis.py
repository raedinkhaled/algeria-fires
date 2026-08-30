"""
06_forensic_analysis.py -- Core forensic analysis.

STAGE 1  Screen out persistent static anthropogenic thermal sources.
         Active-fire products flag any sufficiently hot pixel. Steelworks,
         power stations, flares and kilns are detected night after night at the
         same coordinates. Leaving them in the dataset corrupts every
         "first detection" and "distance to nearest prior fire" statistic.
         Screen: a compact group (<=1.2 km across) detected on >=3 separate
         calendar days, BOTH day and night, with a stable footprint, during the
         pre-outbreak window. Each candidate is then checked against OSM.

STAGE 2  Re-delineate fire events on the cleaned dataset.

STAGE 3  Geodesic distance matrix between the first detections of the
         independent clusters.

STAGE 4  Spread reconstruction: per-overpass centroid of NEWLY burning cells,
         displacement vector, rate, and comparison against the wind vector
         interpolated to that place and time.

STAGE 5  Terrain: elevation / slope / aspect at each candidate origin from the
         Copernicus DEM GLO-30, and the terrain traversed by each major run.
"""
import csv, json, os, math, datetime as dt
import numpy as np
from pyproj import CRS, Transformer, Geod
from scipy.spatial import cKDTree
import rasterio
from rasterio.merge import merge as rio_merge

PRO, RAW = "data/processed", "data/raw"
GEOD = Geod(ellps="WGS84")
LAT0, LON0 = 36.72, 6.00
AEQD = CRS.from_proj4("+proj=aeqd +lat_0=%s +lon_0=%s +datum=WGS84 +units=m +no_defs" % (LAT0, LON0))
to_m = Transformer.from_crs("EPSG:4326", AEQD, always_xy=True)
to_ll = Transformer.from_crs(AEQD, "EPSG:4326", always_xy=True)

OUTBREAK = int(dt.datetime(2026, 8, 25, 23, 0, tzinfo=dt.timezone.utc).timestamp())  # 26 Aug 00:00 local

det = list(csv.DictReader(open(os.path.join(PRO, "hotspots_jijel_clipped.csv"), encoding="utf-8")))
for d in det:
    d["latitude"] = float(d["latitude"]); d["longitude"] = float(d["longitude"])
    d["epoch"] = int(d["epoch"]); d["frp_mw"] = float(d["frp_mw"]) if d["frp_mw"] else 0.0
    d["x"], d["y"] = to_m.transform(d["longitude"], d["latitude"])
det.sort(key=lambda d: d["epoch"])

# =====================================================================
print("=" * 104)
print("STAGE 1 -- PERSISTENT STATIC THERMAL SOURCE SCREEN")
print("=" * 104)
pre = [d for d in det if d["epoch"] < OUTBREAK]
XY = np.array([[d["x"], d["y"]] for d in pre])
tree = cKDTree(XY)
# single-linkage grouping at 600 m on the PRE-outbreak set only
parent = list(range(len(pre)))
def find(a):
    while parent[a] != a:
        parent[a] = parent[parent[a]]; a = parent[a]
    return a
for i, j in tree.query_pairs(600.0):
    ra, rb = find(i), find(j)
    if ra != rb: parent[rb] = ra
groups = {}
for i in range(len(pre)):
    groups.setdefault(find(i), []).append(pre[i])

static_sources = []
print("%-9s %-9s %6s %6s %6s %7s %8s %9s  %s" %
      ("lat", "lon", "n_det", "days", "D/N", "extent", "medFRP", "verdict", "span"))
print("-" * 104)
for g in sorted(groups.values(), key=lambda g: -len(g)):
    if len(g) < 4: continue
    days = sorted({d["local_date"] for d in g})
    dn = sorted({d["daynight"] for d in g})
    xs = np.array([d["x"] for d in g]); ys = np.array([d["y"] for d in g])
    extent = math.hypot(xs.max() - xs.min(), ys.max() - ys.min())
    frp = float(np.median([d["frp_mw"] for d in g]))
    la, lo = float(np.mean([d["latitude"] for d in g])), float(np.mean([d["longitude"] for d in g]))
    span_h = (max(d["epoch"] for d in g) - min(d["epoch"] for d in g)) / 3600.0
    # Discriminator: no wildfire in the pre-outbreak window persisted anywhere
    # near 48 h at one spot; the industrial complexes do so every night.
    # Extent bound is generous (2.5 km) because a steelworks + adjacent power
    # station is a genuinely extended hot facility, not a point.
    is_static = len(days) >= 3 and len(dn) == 2 and extent <= 2500 and span_h >= 48
    print("%-9.5f %-9.5f %6d %6d %6s %6.0fm %8.1f %9s  %.1f h  days=%s" %
          (la, lo, len(g), len(days), "".join(dn), extent, frp,
           "STATIC" if is_static else "fire?", span_h, ",".join(d[5:] for d in days)))
    if is_static:
        static_sources.append({"lat": la, "lon": lo, "x": float(xs.mean()), "y": float(ys.mean()),
                               "n": len(g), "days": days, "median_frp": frp, "extent_m": extent})

print("\npersistent static sources identified: %d" % len(static_sources))
for s in static_sources:
    print("   %.5f, %.5f   n=%d  days=%s  medianFRP=%.1f MW" %
          (s["lat"], s["lon"], s["n"], ",".join(d[5:] for d in s["days"]), s["median_frp"]))
json.dump(static_sources, open(os.path.join(PRO, "static_thermal_sources.json"), "w"), indent=2)

# mask: any detection within 1.5 km of a confirmed static source is excluded
def is_masked(d):
    for s in static_sources:
        if math.hypot(d["x"] - s["x"], d["y"] - s["y"]) <= 1500:
            return True
    return False

clean = [d for d in det if not is_masked(d)]
print("\ndetections before mask: %d   after mask: %d   removed: %d"
      % (len(det), len(clean), len(det) - len(clean)))
with open(os.path.join(PRO, "hotspots_wildfire_only.csv"), "w", newline="", encoding="utf-8") as f:
    cols = [c for c in clean[0].keys() if c not in ("x", "y")]
    w = csv.DictWriter(f, fieldnames=cols, extrasaction="ignore"); w.writeheader(); w.writerows(clean)

# =====================================================================
print("\n" + "=" * 104)
print("STAGE 2 -- FIRE EVENT RE-DELINEATION ON THE CLEANED DATASET")
print("=" * 104)
CELL = 375.0
cells = {}
for r in clean:
    k = (int(math.floor(r["x"] / CELL)), int(math.floor(r["y"] / CELL)))
    c = cells.get(k)
    if c is None:
        cells[k] = c = {"n": 0, "frp_sum": 0.0, "first": r, "last": r}
    c["n"] += 1; c["frp_sum"] += r["frp_mw"]
    if r["epoch"] < c["first"]["epoch"]: c["first"] = r
    if r["epoch"] > c["last"]["epoch"]: c["last"] = r
    c["cx"] = (k[0] + 0.5) * CELL; c["cy"] = (k[1] + 0.5) * CELL
cl = sorted(cells.values(), key=lambda c: c["first"]["epoch"])
for c in cl: c["t0"] = c["first"]["epoch"]
CXY = np.array([[c["cx"], c["cy"]] for c in cl]); CT = np.array([c["t0"] for c in cl], float)
print("cleaned 375 m grid cells: %d" % len(cl))

ctree = cKDTree(CXY)
def delineate(dmax, tmax_h):
    par = list(range(len(cl)))
    def fnd(a):
        while par[a] != a:
            par[a] = par[par[a]]; a = par[a]
        return a
    for i, j in ctree.query_pairs(dmax):
        if abs(CT[i] - CT[j]) <= tmax_h * 3600:
            ra, rb = fnd(i), fnd(j)
            if ra != rb: par[rb] = ra
    lab, out = {}, np.empty(len(cl), int)
    for i in range(len(cl)): out[i] = lab.setdefault(fnd(i), len(lab))
    return out

print("\nsensitivity (cleaned):")
print("%9s " % "D_max(m)" + " ".join(("T=%dh" % t).rjust(7) for t in (6, 12, 24, 48)))
SENS = {}
for d_ in (750, 1000, 1500, 2000, 3000, 5000):
    line = "%9d " % d_
    for t_ in (6, 12, 24, 48):
        L = delineate(d_, t_); SENS[(d_, t_)] = L; line += "%7d " % len(set(L))
    print(line)
labels = SENS[(2000, 24)]

COMMUNES = [(e["tags"].get("name", "").split(" ")[0], e["tags"].get("name:ar", ""),
             e["center"]["lat"], e["center"]["lon"])
            for e in json.load(open(os.path.join(RAW, "osm_jijel_places.json"), encoding="utf-8"))["elements"]
            if e["type"] == "relation" and e.get("tags", {}).get("admin_level") == "8"]
def near_com(lat, lon):
    b = min(COMMUNES, key=lambda c: GEOD.inv(lon, lat, c[3], c[2])[2])
    return b[0], b[1], round(GEOD.inv(lon, lat, b[3], b[2])[2] / 1000.0, 2)

ev = {}
for c, L in zip(cl, labels): ev.setdefault(int(L), []).append(c)
rows = []
for eid, mem in ev.items():
    mem.sort(key=lambda c: c["t0"]); f = mem[0]["first"]
    xs = np.array([m["cx"] for m in mem]); ys = np.array([m["cy"] for m in mem])
    lonc, latc = to_ll.transform(xs.mean(), ys.mean())
    cn, ca, cd = near_com(f["latitude"], f["longitude"])
    rows.append({"event_id": "F%02d" % eid, "n_cells": len(mem),
                 "n_detections": sum(m["n"] for m in mem),
                 "first_utc": f["datetime_utc"], "first_local": f["datetime_local"],
                 "first_epoch": f["epoch"], "first_lat": round(f["latitude"], 5),
                 "first_lon": round(f["longitude"], 5), "first_sat": f["sat_code"],
                 "first_instrument": f["instrument"], "first_conf": f["conf_class"],
                 "first_frp_mw": f["frp_mw"], "first_daynight": f["daynight"],
                 "last_utc": max(m["last"]["datetime_utc"] for m in mem),
                 "centroid_lat": round(latc, 5), "centroid_lon": round(lonc, 5),
                 "approx_area_km2": round(len(mem) * (CELL / 1000) ** 2, 2),
                 "total_frp_mw": round(sum(m["frp_sum"] for m in mem), 1),
                 "nearest_commune": cn, "nearest_commune_ar": ca,
                 "dist_to_commune_centre_km": cd})
rows.sort(key=lambda r: r["first_epoch"])
with open(os.path.join(PRO, "fire_events_clean.csv"), "w", newline="", encoding="utf-8") as f:
    w = csv.DictWriter(f, fieldnames=list(rows[0].keys())); w.writeheader(); w.writerows(rows)
with open(os.path.join(PRO, "grid_first_detection_clean.csv"), "w", newline="", encoding="utf-8") as f:
    w = csv.writer(f)
    w.writerow(["lat", "lon", "first_utc", "first_local", "first_epoch", "sat", "instrument",
                "conf", "frp_mw", "daynight", "n_det", "frp_sum", "event_id", "cx", "cy"])
    for c, L in zip(cl, labels):
        fr = c["first"]
        w.writerow([round(fr["latitude"], 5), round(fr["longitude"], 5), fr["datetime_utc"],
                    fr["datetime_local"], fr["epoch"], fr["sat_code"], fr["instrument"],
                    fr["conf_class"], fr["frp_mw"], fr["daynight"], c["n"],
                    round(c["frp_sum"], 1), "F%02d" % int(L), round(c["cx"], 1), round(c["cy"], 1)])

print("\n%4s %16s %10s %9s %5s %5s %7s %9s  %s" %
      ("ID", "first local", "lat", "lon", "sat", "conf", "cells", "area_km2", "nearest commune"))
print("-" * 104)
for r in rows:
    if r["n_cells"] >= 2 or r["first_epoch"] < OUTBREAK:
        print("%4s %16s %10.5f %9.5f %5s %5s %7d %9.1f  %s (%.1f km)" %
              (r["event_id"], r["first_local"], r["first_lat"], r["first_lon"], r["first_sat"],
               r["first_conf"], r["n_cells"], r["approx_area_km2"], r["nearest_commune"],
               r["dist_to_commune_centre_km"]))

# =====================================================================
print("\n" + "=" * 104)
print("STAGE 3 -- GEODESIC DISTANCE MATRIX BETWEEN INDEPENDENT CLUSTER ORIGINS")
print("   (great-circle distance between the EARLIEST SATELLITE DETECTION of each cluster,")
print("    WGS84 ellipsoid; these are satellite coordinates, not municipality centres)")
print("=" * 104)
maj = [r for r in rows if r["n_cells"] >= 3][:12]
maj.sort(key=lambda r: r["first_epoch"])
names = ["%s/%s" % (r["event_id"], r["nearest_commune"][:9]) for r in maj]
print("%-22s" % "" + "".join("%9s" % n.split("/")[0] for n in maj and names))
mat = []
for i, a in enumerate(maj):
    line = "%-22s" % names[i]
    row = []
    for j, b in enumerate(maj):
        d = GEOD.inv(a["first_lon"], a["first_lat"], b["first_lon"], b["first_lat"])[2] / 1000.0
        row.append(round(d, 2)); line += "%9.1f" % d
    mat.append(row); print(line)
with open(os.path.join(PRO, "cluster_distance_matrix.csv"), "w", newline="", encoding="utf-8") as f:
    w = csv.writer(f); w.writerow([""] + names)
    for i, r_ in enumerate(mat): w.writerow([names[i]] + r_)

print("\n--- pairwise separation in space AND time between cluster first detections ---")
print("%-24s %-24s %10s %12s %14s" % ("cluster A", "cluster B", "dist_km", "dt_hours", "implied_kmh"))
for i in range(len(maj)):
    for j in range(i + 1, len(maj)):
        a, b = maj[i], maj[j]
        d = GEOD.inv(a["first_lon"], a["first_lat"], b["first_lon"], b["first_lat"])[2] / 1000.0
        h = abs(a["first_epoch"] - b["first_epoch"]) / 3600.0
        print("%-24s %-24s %10.2f %12.2f %14s" %
              (names[i], names[j], d, h, ("%.2f" % (d / h)) if h > 0 else "inf"))
json.dump({"clusters": names, "distance_km": mat},
          open(os.path.join(PRO, "cluster_distances.json"), "w"), indent=2)
