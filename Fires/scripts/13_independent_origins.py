"""
13_independent_origins.py -- Final, defensible list of independent-origin candidates.

Why this supersedes the single-linkage "events" table
-----------------------------------------------------
Single-linkage event delineation merges anything that eventually touches. By
27-28 August the Jijel complex had grown until one chain connected Texenna to
Chekfa to El Milia, so the event table collapses genuinely separate fires into
one 446 km2 object. The independent-origin question must therefore be answered
at the moment each area FIRST appears, not at the end.

An INDEPENDENT-ORIGIN CANDIDATE is a first appearance that satisfies BOTH:
  (i)  nearest previously detected wildfire cell >= 5 km away, and
  (ii) largest unbridged gap along the best-case path >= 4 km
       (no already-burning cell within 2.5 km of the line for that distance).
Cells meeting these in the same overpass and within 6 km of each other are one
candidate. Each candidate is then independently corroborated against:
  * the Sentinel-2 burn-patch map (containment, not centroid proximity),
  * reverse geocoding to the correct wilaya/commune,
  * the lightning screen, terrain and infrastructure context.

What this does and does not establish: it identifies fires that cannot be
explained by observed surface spread from an earlier detected fire. It does NOT
identify a cause, and it cannot by itself exclude long-range spotting or a fire
that started earlier and went undetected in an observation gap.
"""
import csv, json, os, math, datetime as dt
import numpy as np
from pyproj import Geod, CRS, Transformer
from scipy import ndimage
import rasterio
from rasterio.transform import Affine
from shapely.geometry import shape, Point

PRO, RAW, SAT = "data/processed", "data/raw", "satellite"
G = Geod(ellps="WGS84")
FLAG_DIST_KM, GAP_KM, GROUP_KM = 5.0, 4.0, 6.0

R = list(csv.DictReader(open(os.path.join(PRO, "reachability_v2.csv"), encoding="utf-8")))
for r in R:
    r["lat"] = float(r["lat"]); r["lon"] = float(r["lon"])
    r["frp_mw"] = float(r["frp_mw"]) if r["frp_mw"] else 0.0
    r["nearest_prior_km"] = float(r["nearest_prior_km"]) if r["nearest_prior_km"] else None
    r["largest_path_gap_km"] = float(r["largest_path_gap_km"]) if r["largest_path_gap_km"] else None
    r["min_required_rate_kmh"] = float(r["min_required_rate_kmh"]) if r["min_required_rate_kmh"] else None
    r["nearest_prior_dt_h"] = float(r["nearest_prior_dt_h"]) if r["nearest_prior_dt_h"] else None

cand = [r for r in R if r["nearest_prior_km"] and r["nearest_prior_km"] >= FLAG_DIST_KM
        and r["largest_path_gap_km"] and r["largest_path_gap_km"] >= GAP_KM]
# plus the very first detections in the dataset (no antecedent at all)
firsts = [r for r in R if r["verdict"] == "FIRST DETECTION IN DATASET"]
print("cells meeting BOTH independence criteria: %d" % len(cand))
print("cells with no antecedent at all (dataset start): %d" % len(firsts))

# ---- group by overpass + proximity ---------------------------------------
# Single-linkage grouping WITHIN each overpass: a fire front detected in one
# overpass can be several km long, so a fixed radius around whichever pixel
# happened to be processed first would split one front into two "origins".
groups = []
by_pass = {}
for r in sorted(cand + firsts, key=lambda x: x["first_utc"]):
    by_pass.setdefault(r["first_utc"], []).append(r)
for utc, mem in sorted(by_pass.items()):
    parent = list(range(len(mem)))

    def find(a):
        while parent[a] != a:
            parent[a] = parent[parent[a]]
            a = parent[a]
        return a

    for i in range(len(mem)):
        for j in range(i + 1, len(mem)):
            d = G.inv(mem[i]["lon"], mem[i]["lat"], mem[j]["lon"], mem[j]["lat"])[2] / 1000.0
            if d <= GROUP_KM:
                ra, rb = find(i), find(j)
                if ra != rb:
                    parent[rb] = ra
    buckets = {}
    for i in range(len(mem)):
        buckets.setdefault(find(i), []).append(mem[i])
    for b in buckets.values():
        groups.append({"first_utc": utc, "first_local": b[0]["first_local"],
                       "lat": b[0]["lat"], "lon": b[0]["lon"], "members": b})
for g in groups:
    m = max(g["members"], key=lambda x: x["frp_mw"])   # representative = strongest pixel
    g.update({"lat": m["lat"], "lon": m["lon"], "rep": m, "n_cells": len(g["members"])})
print("grouped into %d independent-origin candidates\n" % len(groups))

# ---- Sentinel-2 burn patch by CONTAINMENT ---------------------------------
meta = json.load(open(os.path.join(SAT, "dnbr_meta.json"), encoding="utf-8"))
dnbr = np.load(os.path.join(SAT, "dnbr.npy"))
tr = Affine(*meta["transform"])
PX = meta["pixel_m"]
ll2utm = Transformer.from_crs("EPSG:4326", CRS.from_user_input(meta["crs"]), always_xy=True)
burn = np.isfinite(dnbr) & (dnbr >= 0.27)
burn = ndimage.binary_opening(burn, np.ones((3, 3)))
burn = ndimage.binary_closing(burn, np.ones((7, 7)))
lab, n = ndimage.label(burn, structure=np.ones((3, 3)))
sizes = ndimage.sum(burn, lab, range(1, n + 1))
px_ha = (PX ** 2) / 10000.0
order = sorted([i + 1 for i, s in enumerate(sizes) if s * px_ha >= 100.0],
               key=lambda i: -sizes[i - 1])
pid_name = {p: "B%02d" % k for k, p in enumerate(order)}
H, W = dnbr.shape


def patch_at(lat, lon, search_px=25):
    x, y = ll2utm.transform(lon, lat)
    c = int((x - tr.c) / PX); rr = int((tr.f - y) / PX)
    if not (0 <= rr < H and 0 <= c < W):
        return None, None, "outside Sentinel-2 analysis window"
    v = lab[rr, c]
    if v == 0:                       # not on a burnt pixel: search a small neighbourhood
        r0, r1 = max(0, rr - search_px), min(H, rr + search_px)
        c0, c1 = max(0, c - search_px), min(W, c + search_px)
        sub = lab[r0:r1, c0:c1]
        nz = sub[sub > 0]
        if nz.size:
            vals, cnt = np.unique(nz, return_counts=True)
            v = int(vals[np.argmax(cnt)])
    if v == 0 or v not in pid_name:
        return None, None, "no mapped burn patch >=100 ha at this location"
    return pid_name[v], round(float(sizes[v - 1] * px_ha / 100), 2), "contained"


# ---- reverse geocode -------------------------------------------------------
import urllib.request, time
RG_CACHE = os.path.join(RAW, "origins_reverse_geocode_v2.json")
rg = json.load(open(RG_CACHE, encoding="utf-8")) if os.path.exists(RG_CACHE) else {}
for g in groups:
    key = "%.5f,%.5f" % (g["lat"], g["lon"])
    if key in rg:
        continue
    try:
        u = ("https://nominatim.openstreetmap.org/reverse?lat=%.5f&lon=%.5f&format=jsonv2&zoom=10&accept-language=ar"
             % (g["lat"], g["lon"]))
        req = urllib.request.Request(u, headers={"User-Agent": "wildfire-forensics-research/1.0"})
        d = json.loads(urllib.request.urlopen(req, timeout=60).read().decode())
        a = d.get("address", {})
        rg[key] = {"wilaya": a.get("state", ""), "daira": a.get("county", ""),
                   "locality": a.get("town") or a.get("village") or a.get("municipality") or "",
                   "display": d.get("display_name", "")}
    except Exception as e:
        rg[key] = {"wilaya": "", "daira": "", "locality": "", "display": "lookup failed: %s" % e}
    time.sleep(1.15)
json.dump(rg, open(RG_CACHE, "w", encoding="utf-8"), ensure_ascii=False, indent=1)

# ---- terrain --------------------------------------------------------------
from rasterio.merge import merge as rio_merge
srcs = [rasterio.open(os.path.join(RAW, f)) for f in ("copdem_N36_00_E005.tif", "copdem_N36_00_E006.tif")]
dem, dtr = rio_merge(srcs, bounds=(5.30, 36.40, 6.70, 37.00))
dem = dem[0].astype(np.float32)
for s in srcs:
    s.close()
mx = dtr.a * 111320.0 * math.cos(math.radians(36.72)); my = abs(dtr.e) * 110540.0
gy, gx = np.gradient(dem, my, mx)
slope = np.degrees(np.arctan(np.hypot(gx, gy)))
aspect = np.degrees(np.arctan2(-gx, gy)) % 360.0


def terrain(lat, lon):
    c = int((lon - dtr.c) / dtr.a); r = int((lat - dtr.f) / dtr.e)
    if 0 <= r < dem.shape[0] and 0 <= c < dem.shape[1]:
        return round(float(dem[r, c])), round(float(slope[r, c]), 1), round(float(aspect[r, c]))
    return None, None, None


# ---- lightning screen ------------------------------------------------------
MET = list(csv.DictReader(open(os.path.join(PRO, "metar_observations.csv"), encoding="utf-8")))
TS = [{"station": r["station"], "lat": float(r["lat"]), "lon": float(r["lon"]),
       "local": r["datetime_local"],
       "epoch": int(dt.datetime.strptime(r["datetime_utc"], "%Y-%m-%d %H:%M")
                    .replace(tzinfo=dt.timezone.utc).timestamp())}
      for r in MET if "TS" in (r["wxcodes"] or "")]


def lightning(lat, lon, e0):
    win = [t for t in TS if -48 * 3600 <= t["epoch"] - e0 <= 24 * 3600]
    if not win:
        return {"nearest_ts": None, "dist_km": None, "dt_h": None,
                "assessment": "لا يوجد أي إبلاغ عن عاصفة رعدية في أي محطة ضمن النافذة الزمنية"}
    b = min(win, key=lambda t: G.inv(lon, lat, t["lon"], t["lat"])[2])
    d = G.inv(lon, lat, b["lon"], b["lat"])[2] / 1000.0
    if d <= 30:
        a = "عاصفة رعدية مُبلَّغ عنها ضمن 30 كم — لا يمكن استبعاد البرق"
    elif d <= 80:
        a = "أقرب إبلاغ على بعد %.0f كم — دليل ضعيف وغير محدد" % d
    else:
        a = "أقرب إبلاغ على بعد %.0f كم — غير ذي دلالة لهذا الموقع" % d
    return {"nearest_ts": "%s %s" % (b["station"], b["local"]), "dist_km": round(d, 1),
            "dt_h": round((b["epoch"] - e0) / 3600.0, 1), "assessment": a}


# ---- assemble --------------------------------------------------------------
print("%-18s %10s %9s %5s %8s %8s %8s %8s %-9s %-24s %s" %
      ("first local", "lat", "lon", "sat", "FRP", "near_km", "gap_km", "cells", "patch", "wilaya", "locality"))
print("-" * 140)
rows = []
for g in sorted(groups, key=lambda g: g["first_utc"]):
    r = g["rep"]
    e0 = int(dt.datetime.strptime(g["first_utc"], "%Y-%m-%d %H:%M")
             .replace(tzinfo=dt.timezone.utc).timestamp())
    pid, parea, pnote = patch_at(g["lat"], g["lon"])
    el, sl, asp = terrain(g["lat"], g["lon"])
    geo = rg.get("%.5f,%.5f" % (g["lat"], g["lon"]), {})
    rows.append({
        "origin_id": "O%02d" % len(rows), "first_utc": g["first_utc"], "first_local": g["first_local"],
        "lat": round(g["lat"], 5), "lon": round(g["lon"], 5),
        "satellite": r["sat"], "instrument": r["instrument"], "confidence": r["conf"],
        "frp_mw": r["frp_mw"], "daynight": r["daynight"], "n_cells_same_overpass": g["n_cells"],
        "nearest_prior_fire_km": r["nearest_prior_km"], "nearest_prior_dt_h": r["nearest_prior_dt_h"],
        "min_required_rate_kmh": r["min_required_rate_kmh"],
        "largest_unburnt_gap_km": r["largest_path_gap_km"],
        "burn_patch": pid, "burn_patch_km2": parea, "burn_patch_note": pnote,
        "wilaya": geo.get("wilaya", ""), "daira": geo.get("daira", ""), "locality": geo.get("locality", ""),
        "elevation_m": el, "slope_deg": sl, "aspect_deg": asp,
        "lightning": lightning(g["lat"], g["lon"], e0),
    })
    print("%-18s %10.5f %9.5f %5s %8.1f %8s %8s %8d %-9s %-24s %s" %
          (g["first_local"], g["lat"], g["lon"], r["sat"], r["frp_mw"],
           ("%.2f" % r["nearest_prior_km"]) if r["nearest_prior_km"] else "-",
           ("%.2f" % r["largest_path_gap_km"]) if r["largest_path_gap_km"] else "-",
           g["n_cells"], pid or "-", geo.get("wilaya", ""), geo.get("locality", "")))

with open(os.path.join(PRO, "independent_origins.csv"), "w", newline="", encoding="utf-8") as f:
    fn = [k for k in rows[0].keys() if k != "lightning"]
    w = csv.DictWriter(f, fieldnames=fn + ["lightning_assessment", "lightning_nearest_ts", "lightning_dist_km"])
    w.writeheader()
    for r in rows:
        d = {k: r[k] for k in fn}
        d.update({"lightning_assessment": r["lightning"]["assessment"],
                  "lightning_nearest_ts": r["lightning"]["nearest_ts"],
                  "lightning_dist_km": r["lightning"]["dist_km"]})
        w.writerow(d)

byw = {}
for r in rows:
    byw[r["wilaya"]] = byw.get(r["wilaya"], 0) + 1
print("\nindependent-origin candidates by wilaya:")
for k, v in sorted(byw.items(), key=lambda x: -x[1]):
    print("   %-24s %d" % (k or "(unresolved)", v))
print("\nof which inside Jijel: %d" % byw.get("جيجل", 0))
json.dump(rows, open(os.path.join(PRO, "independent_origins.json"), "w", encoding="utf-8"),
          ensure_ascii=False, indent=2)
print("wrote data/processed/independent_origins.{csv,json}")
