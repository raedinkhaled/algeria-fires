"""
07b_reachability.py -- The decisive "one fire or several?" test.

For every 375 m cell, at the moment it is FIRST detected, three independent
questions are asked about whether an already-burning fire could have reached it:

  (1) NEAREST-PRIOR      distance and elapsed time to the spatially nearest
                         previously detected cell, and the implied rate.
  (2) MIN-REQUIRED-RATE  minimised over ALL previously detected cells:
                         min_p  d(p,cell) / (t - t_p).
                         This is the kindest possible reading of the
                         single-fire hypothesis: it lets the fire start from
                         whichever earlier point makes the journey easiest.
  (3) PATH CONTINUITY    along the straight line from that best source to the
                         new cell, sample every 500 m and measure how far each
                         sample lies from the nearest cell that was already
                         burning (or burning simultaneously). The LARGEST
                         UNBURNT GAP is the key number: a real flame front
                         leaves a continuous trail of detections behind it,
                         whereas an independent ignition or a long-range spot
                         leaves a hole.

A cell is flagged INDEPENDENT-CANDIDATE only if all three tests fail together:
far from prior fire, implausible required rate, and a large unbridged gap.
Even then this means "not reachable by surface spread as observed" -- it does
NOT identify a cause, and long-range spotting remains an alternative.
"""
import csv, json, os, math, re
import numpy as np
from pyproj import CRS, Transformer, Geod
from scipy.spatial import cKDTree
from shapely.geometry import shape, Point

PRO, RAW = "data/processed", "data/raw"
GEOD = Geod(ellps="WGS84")
AEQD = CRS.from_proj4("+proj=aeqd +lat_0=36.72 +lon_0=6.00 +datum=WGS84 +units=m +no_defs")
to_ll = Transformer.from_crs(AEQD, "EPSG:4326", always_xy=True)

# plausibility thresholds (documented in the report)
PLAUS_RATE_KMH = 4.0     # generous sustained head-fire rate for extreme Mediterranean runs
GAP_KM = 4.0             # unbridged gap beyond which surface continuity is not supported
FLAG_DIST_KM = 5.0

# ---------------- commune polygons, with clean Latin + Arabic names ----------
LATIN = re.compile(r"^[A-Za-zÀ-ɏ' \-’]+")
COM = json.load(open(os.path.join(RAW, "jijel_communes.geojson"), encoding="utf-8"))["features"]
NAMES = {}
for e in json.load(open(os.path.join(RAW, "osm_jijel_places.json"), encoding="utf-8"))["elements"]:
    if e["type"] == "relation" and e.get("tags", {}).get("admin_level") == "8":
        raw = e["tags"].get("name", "")
        m = LATIN.match(raw)
        NAMES[e["id"]] = ((m.group(0).strip() if m else raw), e["tags"].get("name:ar", ""))
polys = []
for f in COM:
    nm, ar = NAMES.get(f["properties"]["osm_id"], (f["properties"]["name"], ""))
    polys.append((shape(f["geometry"]), nm, ar))

def commune_of(lat, lon):
    p = Point(lon, lat)
    for g, nm, ar in polys:
        if g.contains(p):
            return nm, ar
    return "outside Jijel", "خارج ولاية جيجل"

# ---------------- cells ------------------------------------------------------
cells = list(csv.DictReader(open(os.path.join(PRO, "grid_first_detection_clean.csv"), encoding="utf-8")))
for c in cells:
    c["lat"] = float(c["lat"]); c["lon"] = float(c["lon"])
    c["first_epoch"] = int(c["first_epoch"]); c["cx"] = float(c["cx"]); c["cy"] = float(c["cy"])
    c["frp_mw"] = float(c["frp_mw"]) if c["frp_mw"] else 0.0
cells.sort(key=lambda c: c["first_epoch"])
for c in cells:
    c["commune"], c["commune_ar"] = commune_of(c["lat"], c["lon"])

X = np.array([c["cx"] for c in cells]); Y = np.array([c["cy"] for c in cells])
T = np.array([c["first_epoch"] for c in cells], dtype=float)
N = len(cells)
print("cells: %d" % N)

# ---------------- per-overpass batch computation -----------------------------
res = [None] * N
i = 0
while i < N:
    j = i
    while j < N and T[j] == T[i]:
        j += 1
    if i > 0:
        px, py, pt = X[:i], Y[:i], T[:i]
        for k in range(i, j):
            dx = px - X[k]; dy = py - Y[k]
            d = np.hypot(dx, dy)
            dtsec = T[k] - pt
            # (1) nearest in space
            a = int(np.argmin(d))
            # (2) minimum required rate
            rate = d / np.maximum(dtsec, 1.0)          # m/s
            b = int(np.argmin(rate))
            res[k] = {
                "near_idx": a, "near_d": float(d[a]), "near_dt": float(dtsec[a]),
                "best_idx": b, "best_d": float(d[b]), "best_dt": float(dtsec[b]),
                "best_rate_kmh": float(rate[b] * 3.6),
            }
    i = j

# ---------------- path-continuity test for the flagged subset ----------------
def path_gap(src_i, tgt_k):
    """largest unbridged gap (km) along the straight line src->tgt, considering
    only cells already burning at, or before, the target's detection time."""
    t = T[tgt_k]
    mask = T <= t
    tree = cKDTree(np.column_stack([X[mask], Y[mask]]))
    x0, y0, x1, y1 = X[src_i], Y[src_i], X[tgt_k], Y[tgt_k]
    L = math.hypot(x1 - x0, y1 - y0)
    if L < 1:
        return 0.0, 0
    nstep = max(2, int(L // 500))
    ss = np.linspace(0, 1, nstep + 1)
    pts = np.column_stack([x0 + ss * (x1 - x0), y0 + ss * (y1 - y0)])
    dd, _ = tree.query(pts, k=1)
    uncovered = dd > 2500.0
    best = run = 0
    for u in uncovered:
        run = run + 1 if u else 0
        best = max(best, run)
    step = L / nstep
    return best * step / 1000.0, int(uncovered.sum())

rows = []
for k, c in enumerate(cells):
    r = res[k]
    rec = {
        "lat": c["lat"], "lon": c["lon"], "first_utc": c["first_utc"], "first_local": c["first_local"],
        "sat": c["sat"], "instrument": c["instrument"], "conf": c["conf"], "frp_mw": c["frp_mw"],
        "daynight": c["daynight"], "event_id": c["event_id"],
        "commune": c["commune"], "commune_ar": c["commune_ar"],
    }
    if r is None:
        rec.update({"nearest_prior_km": None, "nearest_prior_dt_h": None, "nearest_rate_kmh": None,
                    "best_source_lat": None, "best_source_lon": None, "best_source_km": None,
                    "best_source_dt_h": None, "min_required_rate_kmh": None,
                    "bearing_from_source": None, "largest_path_gap_km": None, "verdict": "FIRST DETECTION IN DATASET"})
    else:
        s = cells[r["best_idx"]]
        brg = GEOD.inv(s["lon"], s["lat"], c["lon"], c["lat"])[0] % 360
        rec.update({
            "nearest_prior_km": round(r["near_d"] / 1000, 3),
            "nearest_prior_dt_h": round(r["near_dt"] / 3600, 2),
            "nearest_rate_kmh": round((r["near_d"] / 1000) / max(r["near_dt"] / 3600, 1e-9), 2),
            "best_source_lat": s["lat"], "best_source_lon": s["lon"],
            "best_source_km": round(r["best_d"] / 1000, 3),
            "best_source_dt_h": round(r["best_dt"] / 3600, 2),
            "min_required_rate_kmh": round(r["best_rate_kmh"], 2),
            "bearing_from_source": round(brg, 0),
        })
        if r["near_d"] >= FLAG_DIST_KM * 1000:
            gap, nunc = path_gap(r["best_idx"], k)
            rec["largest_path_gap_km"] = round(gap, 2)
            fails = (r["near_d"] >= FLAG_DIST_KM * 1000,
                     r["best_rate_kmh"] > PLAUS_RATE_KMH,
                     gap >= GAP_KM)
            rec["verdict"] = ("INDEPENDENT-CANDIDATE" if all(fails)
                              else ("discontinuous-but-slow" if fails[2] else "reachable-by-spread"))
        else:
            rec["largest_path_gap_km"] = None
            rec["verdict"] = "contiguous-growth"
    rows.append(rec)

with open(os.path.join(PRO, "reachability_v2.csv"), "w", newline="", encoding="utf-8") as f:
    w = csv.DictWriter(f, fieldnames=list(rows[0].keys())); w.writeheader(); w.writerows(rows)

print("\n" + "=" * 126)
print("CELLS FIRST DETECTED >= %.0f km FROM ANY PRIOR WILDFIRE DETECTION" % FLAG_DIST_KM)
print("  near_km/near_h : spatially nearest prior detection and its age")
print("  best_km/best_h : the prior detection that MINIMISES the required rate (kindest to single-fire)")
print("  gap_km         : largest stretch along that path with no already-burning cell within 2.5 km")
print("=" * 126)
print("%-17s %9s %9s %5s %8s %8s %7s %8s %7s %9s %7s %7s  %-22s %s" %
      ("first local", "lat", "lon", "sat", "FRP", "near_km", "near_h", "best_km", "best_h",
       "req_km/h", "brg", "gap_km", "commune", "verdict"))
print("-" * 126)
flag = [r for r in rows if r["nearest_prior_km"] and r["nearest_prior_km"] >= FLAG_DIST_KM]
groups = {}
for r in flag:
    groups.setdefault((r["first_local"], r["commune"], r["verdict"]), []).append(r)
for (tl, com, verd), g in sorted(groups.items(), key=lambda kv: kv[0][0]):
    g.sort(key=lambda r: -r["frp_mw"])
    r = g[0]
    tag = "" if len(g) == 1 else "   [+%d more cells same overpass/commune]" % (len(g) - 1)
    print("%-17s %9.5f %9.5f %5s %8.1f %8.2f %7.2f %8.2f %7.2f %9.2f %7.0f %7s  %-22s %s%s" %
          (r["first_local"], r["lat"], r["lon"], r["sat"], r["frp_mw"], r["nearest_prior_km"],
           r["nearest_prior_dt_h"], r["best_source_km"], r["best_source_dt_h"],
           r["min_required_rate_kmh"], r["bearing_from_source"] or 0,
           ("%.2f" % r["largest_path_gap_km"]) if r["largest_path_gap_km"] is not None else "-",
           com, verd, tag))

print("\nverdict tally over all %d cells:" % len(rows))
tal = {}
for r in rows:
    tal[r["verdict"]] = tal.get(r["verdict"], 0) + 1
for k, v in sorted(tal.items(), key=lambda x: -x[1]):
    print("   %-28s %5d" % (k, v))
