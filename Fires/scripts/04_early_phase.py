"""
04_early_phase.py -- Forensic chronology of the pre-outbreak and onset phase,
plus a quantitative "could the earlier fire have reached here?" test.

Part A. Full listing of every detection before the outbreak, with all FIRMS
        fields preserved, so the earliest thermal anomalies can be inspected
        individually rather than in aggregate.
Part B. Satellite overpass inventory -- establishes the observation gaps, which
        bound how long a fire could have burned before first detection.
Part C. New-appearance test. For every 375 m cell, measure the distance to the
        nearest cell that was ALREADY detected at an earlier acquisition, and
        the elapsed time. The implied minimum propagation rate d/dt is then
        compared with physically plausible rates for Mediterranean fuels.
        Cells requiring implausible rates are flagged as candidates for either
        long-range spotting or a separate ignition -- the two cannot be
        distinguished by thermal data alone.
"""
import csv, os, math
import numpy as np
from pyproj import CRS, Transformer, Geod
from scipy.spatial import cKDTree

P = "data/processed"
GEOD = Geod(ellps="WGS84")
LAT0, LON0 = 36.72, 6.00
to_m = Transformer.from_crs("EPSG:4326",
      CRS.from_proj4("+proj=aeqd +lat_0=%s +lon_0=%s +datum=WGS84 +units=m +no_defs" % (LAT0, LON0)),
      always_xy=True)

det = list(csv.DictReader(open(os.path.join(P, "hotspots_jijel_clipped.csv"), encoding="utf-8")))
for d in det:
    d["epoch"] = int(d["epoch"])
    d["latitude"] = float(d["latitude"])
    d["longitude"] = float(d["longitude"])
    d["frp_mw"] = float(d["frp_mw"]) if d["frp_mw"] else 0.0
det.sort(key=lambda d: d["epoch"])

CUT = 1756162800  # 2026-08-26 00:00 local (=23:00Z 25 Aug) ; recomputed below
import datetime as dt
CUT = int(dt.datetime(2026, 8, 25, 23, 0, tzinfo=dt.timezone.utc).timestamp())

print("=" * 118)
print("PART A -- EVERY THERMAL DETECTION IN JIJEL (prov+10km) BEFORE 26 AUG 00:00 LOCAL")
print("=" * 118)
early = [d for d in det if d["epoch"] < CUT]
print("count = %d\n" % len(early))
hdr = ("%-16s %-16s %-9s %-9s %-5s %-6s %-8s %-7s %-8s %-8s %-4s" %
       ("local", "UTC", "lat", "lon", "sat", "instr", "conf", "FRP", "TI4_K", "TI5_K", "D/N"))
print(hdr)
print("-" * 118)
for d in early:
    print("%-16s %-16s %-9.5f %-9.5f %-5s %-6s %-8s %-7.2f %-8s %-8s %-4s" % (
        d["datetime_local"], d["datetime_utc"], d["latitude"], d["longitude"],
        d["sat_code"], d["instrument"], d["conf_class"], d["frp_mw"],
        d["bright_ti4_k"] or d["brightness_k"] or "-",
        d["bright_ti5_k"] or d["bright_t31_k"] or "-", d["daynight"]))

with open(os.path.join(P, "early_phase_detections.csv"), "w", newline="", encoding="utf-8") as f:
    w = csv.DictWriter(f, fieldnames=list(det[0].keys()))
    w.writeheader()
    w.writerows(early)

# ---------------- PART B : overpass inventory -----------------------------
print("\n" + "=" * 118)
print("PART B -- SATELLITE OVERPASS INVENTORY OVER THE STUDY AREA")
print("        (an overpass is listed only when it produced >=1 detection;")
print("         overpasses that saw no fire leave no record in an active-fire product)")
print("=" * 118)
passes = {}
for d in det:
    k = (d["datetime_utc"][:14], d["sat_code"], d["instrument"])  # minute-resolution group
    g = passes.setdefault((d["sat_code"], d["instrument"], d["datetime_utc"][:13]), [])
    g.append(d)
rows = []
for (sat, instr, hour), g in passes.items():
    g.sort(key=lambda x: x["epoch"])
    rows.append((g[0]["datetime_utc"], g[-1]["datetime_utc"], g[0]["datetime_local"],
                 sat, instr, len(g), sum(x["frp_mw"] for x in g), g[0]["daynight"]))
rows.sort()
print("%-16s %-16s %-16s %-5s %-6s %7s %11s %-4s" %
      ("start UTC", "end UTC", "start local", "sat", "instr", "n_det", "sum_FRP", "D/N"))
print("-" * 100)
for r in rows:
    print("%-16s %-16s %-16s %-5s %-6s %7d %11.1f %-4s" % (r[0], r[1], r[2], r[3], r[4], r[5], r[6], r[7]))
with open(os.path.join(P, "overpass_inventory.csv"), "w", newline="", encoding="utf-8") as f:
    w = csv.writer(f)
    w.writerow(["start_utc", "end_utc", "start_local", "satellite", "instrument", "n_detections", "sum_frp_mw", "daynight"])
    w.writerows(rows)

# ---------------- PART C : new-appearance / reachability test -------------
g = list(csv.DictReader(open(os.path.join(P, "grid_first_detection.csv"), encoding="utf-8")))
for c in g:
    c["first_epoch"] = int(c["first_epoch"])
    c["lat"] = float(c["lat"])
    c["lon"] = float(c["lon"])
    c["frp_mw"] = float(c["frp_mw"]) if c["frp_mw"] else 0.0
    c["x"], c["y"] = to_m.transform(c["lon"], c["lat"])
g.sort(key=lambda c: c["first_epoch"])

XY = np.array([[c["x"], c["y"]] for c in g])
EP = np.array([c["first_epoch"] for c in g])

# unique acquisition epochs, processed in order; cells sharing an epoch are
# "simultaneous" and may not be used as each other's antecedent.
res = []
seen_idx = []
i = 0
n = len(g)
while i < n:
    j = i
    while j < n and EP[j] == EP[i]:
        j += 1
    if seen_idx:
        tree = cKDTree(XY[seen_idx])
        dd, ii = tree.query(XY[i:j], k=1)
        for k in range(i, j):
            src = seen_idx[ii[k - i]]
            dtsec = EP[k] - EP[src]
            res.append((k, float(dd[k - i]), int(dtsec), src))
    else:
        for k in range(i, j):
            res.append((k, float("inf"), -1, -1))
    seen_idx.extend(range(i, j))
    i = j

for k, dist, dts, src in res:
    g[k]["dist_to_prior_fire_m"] = dist
    g[k]["dt_to_prior_s"] = dts
    g[k]["implied_rate_kmh"] = (dist / 1000.0) / (dts / 3600.0) if dts and dts > 0 and dist != float("inf") else None
    g[k]["prior_src"] = src

with open(os.path.join(P, "grid_new_appearance.csv"), "w", newline="", encoding="utf-8") as f:
    fn = ["lat", "lon", "first_utc", "first_local", "sat", "instrument", "conf", "frp_mw",
          "daynight", "event_id", "dist_to_prior_fire_m", "dt_to_prior_s", "implied_rate_kmh"]
    w = csv.DictWriter(f, fieldnames=fn, extrasaction="ignore")
    w.writeheader()
    w.writerows(g)

print("\n" + "=" * 118)
print("PART C -- CELLS APPEARING FAR FROM ANY PREVIOUSLY DETECTED FIRE")
print("  'dist' = great-circle distance to the nearest already-detected 375 m cell at the moment of")
print("  first appearance.  'rate' = dist / elapsed-time = the MINIMUM average propagation rate that")
print("  would be required for the pre-existing fire to have reached this location on the ground.")
print("=" * 118)
cand = [c for c in g if c["dist_to_prior_fire_m"] != float("inf") and c["dist_to_prior_fire_m"] >= 4000]
cand.sort(key=lambda c: c["first_epoch"])
print("%-16s %-9s %-9s %-5s %-7s %9s %9s %9s  %s" %
      ("first local", "lat", "lon", "sat", "FRP", "dist_km", "dt_h", "rate_kmh", "event"))
print("-" * 110)
for c in cand:
    r = c["implied_rate_kmh"]
    print("%-16s %-9.5f %-9.5f %-5s %-7.1f %9.2f %9.2f %9s  %s" % (
        c["first_local"], c["lat"], c["lon"], c["sat"], c["frp_mw"],
        c["dist_to_prior_fire_m"] / 1000.0, c["dt_to_prior_s"] / 3600.0,
        ("%.2f" % r) if r else "-", c["event_id"]))
print("\ncells >=4 km from any prior detection: %d  (of %d total cells)" % (len(cand), len(g)))
