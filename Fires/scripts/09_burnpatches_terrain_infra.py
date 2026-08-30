"""
09_burnpatches_terrain_infra.py

A. BURN-PATCH ANALYSIS (independent of the thermal data)
   Label spatially connected burn patches in the Sentinel-2 dNBR raster and
   attach to each patch its earliest VIIRS/MODIS detection. This is a genuinely
   independent line of evidence about how many separate fires there were: the
   thermal record says WHEN fire appeared, the reflectance record says WHERE
   ground actually burned, and the two are derived from different instruments,
   different physics and different processing chains.
   Caveat kept in view: separate fires that later merge leave ONE patch, and a
   single fire can leave several patches where it jumped a barrier. Patch count
   is therefore a lower bound on the number of fires, not a proof of it.

B. TERRAIN at each candidate origin from Copernicus DEM GLO-30
   (elevation, slope, aspect), plus the terrain along each major spread run.

C. HUMAN-INFRASTRUCTURE PROXIMITY of each candidate origin: distance to the
   nearest road of each class, power line, settlement, landfill/quarry,
   farmland/orchard. Proximity is context, NOT evidence of causation: in a
   densely settled Mediterranean massif almost every point is near something.
   A null model is therefore computed -- the same distances for 2000 random
   points inside the burned area -- so the origins can be compared against the
   landscape baseline instead of being judged in a vacuum.
"""
import csv, json, os, math, random
import numpy as np
import rasterio
from rasterio.merge import merge as rio_merge
from rasterio.transform import Affine
from scipy import ndimage
from pyproj import CRS, Transformer, Geod
from shapely.geometry import shape, Point, LineString, MultiLineString, mapping
from shapely.ops import unary_union, transform as shp_transform
from shapely.strtree import STRtree

PRO, RAW, SAT = "data/processed", "data/raw", "satellite"
GEOD = Geod(ellps="WGS84")
random.seed(20260829); np.random.seed(20260829)

meta = json.load(open(os.path.join(SAT, "dnbr_meta.json"), encoding="utf-8"))
dnbr = np.load(os.path.join(SAT, "dnbr.npy"))
tr = Affine(*meta["transform"])
S2CRS = CRS.from_user_input(meta["crs"])
utm_to_ll = Transformer.from_crs(S2CRS, "EPSG:4326", always_xy=True)
ll_to_utm = Transformer.from_crs("EPSG:4326", S2CRS, always_xy=True)
PX = meta["pixel_m"]

# ---------------------------------------------------------------- A. patches
print("=" * 100)
print("A. CONNECTED BURN PATCHES FROM SENTINEL-2 dNBR")
print("=" * 100)
THR = 0.27                                   # moderate-low and above
burn = np.isfinite(dnbr) & (dnbr >= THR)
burn = ndimage.binary_opening(burn, np.ones((3, 3)))     # drop isolated speckle
burn = ndimage.binary_closing(burn, np.ones((7, 7)))     # bridge 140 m gaps within a fire
lab, n = ndimage.label(burn, structure=np.ones((3, 3)))
print("threshold dNBR >= %.2f ; raw connected components: %d" % (THR, n))

sizes = ndimage.sum(burn, lab, range(1, n + 1))
px_ha = (PX ** 2) / 10000.0
MIN_HA = 100.0
keep = [i + 1 for i, s in enumerate(sizes) if s * px_ha >= MIN_HA]
print("patches >= %.0f ha: %d" % (MIN_HA, len(keep)))

# province polygon in UTM
prov = shape(json.load(open(os.path.join(RAW, "jijel_province_boundary.geojson"), encoding="utf-8")))
prov_utm = shp_transform(lambda x, y, z=None: ll_to_utm.transform(x, y), prov)

det = list(csv.DictReader(open(os.path.join(PRO, "hotspots_wildfire_only.csv"), encoding="utf-8")))
for d in det:
    d["epoch"] = int(d["epoch"]); d["lat"] = float(d["latitude"]); d["lon"] = float(d["longitude"])
    d["frp"] = float(d["frp_mw"]) if d["frp_mw"] else 0.0
    x, y = ll_to_utm.transform(d["lon"], d["lat"])
    d["col"] = int((x - tr.c) / PX); d["row"] = int((tr.f - y) / PX)
det.sort(key=lambda d: d["epoch"])

H, Wd = dnbr.shape
patch_rows = []
for pid in keep:
    m = lab == pid
    area_ha = float(m.sum() * px_ha)
    ys, xs = np.nonzero(m)
    cx = tr.c + (xs.mean() + 0.5) * PX
    cy = tr.f - (ys.mean() + 0.5) * PX
    clon, clat = utm_to_ll.transform(cx, cy)
    # extent
    ext_km = math.hypot(xs.max() - xs.min(), ys.max() - ys.min()) * PX / 1000.0
    inside = [d for d in det if 0 <= d["row"] < H and 0 <= d["col"] < Wd and m[d["row"], d["col"]]]
    inprov = prov_utm.contains(Point(cx, cy))
    first = inside[0] if inside else None
    patch_rows.append({
        "patch_id": "B%02d" % len(patch_rows), "area_ha": round(area_ha, 1),
        "area_km2": round(area_ha / 100, 2), "max_extent_km": round(ext_km, 2),
        "centroid_lat": round(clat, 5), "centroid_lon": round(clon, 5),
        "centroid_in_jijel": bool(inprov),
        "n_detections_inside": len(inside),
        "first_det_local": first["datetime_local"] if first else None,
        "first_det_utc": first["datetime_utc"] if first else None,
        "first_det_lat": round(first["lat"], 5) if first else None,
        "first_det_lon": round(first["lon"], 5) if first else None,
        "first_det_sat": first["sat_code"] if first else None,
        "first_det_conf": first["conf_class"] if first else None,
        "first_det_frp": first["frp"] if first else None,
        "mean_dnbr": round(float(np.nanmean(dnbr[m])), 3),
        "max_dnbr": round(float(np.nanmax(dnbr[m])), 3),
    })

patch_rows.sort(key=lambda r: -r["area_ha"])
for i, r in enumerate(patch_rows):
    r["patch_id"] = "B%02d" % i
with open(os.path.join(PRO, "burn_patches.csv"), "w", newline="", encoding="utf-8") as f:
    w = csv.DictWriter(f, fieldnames=list(patch_rows[0].keys())); w.writeheader(); w.writerows(patch_rows)

print("\n%4s %10s %9s %10s %9s %6s %18s %6s %6s %s" %
      ("ID", "area_km2", "extent", "cent_lat", "cent_lon", "n_det", "first det (local)", "sat", "dNBR", "in Jijel"))
print("-" * 100)
for r in patch_rows:
    print("%4s %10.2f %9.2f %10.5f %9.5f %6d %18s %6s %6.2f %s" %
          (r["patch_id"], r["area_km2"], r["max_extent_km"], r["centroid_lat"], r["centroid_lon"],
           r["n_detections_inside"], r["first_det_local"] or "-", r["first_det_sat"] or "-",
           r["mean_dnbr"], r["centroid_in_jijel"]))
tot = sum(r["area_km2"] for r in patch_rows)
inj = sum(r["area_km2"] for r in patch_rows if r["centroid_in_jijel"])
print("\ntotal patch area (>=%.0f ha, dNBR>=%.2f): %.1f km2   of which centroid in Jijel: %.1f km2"
      % (MIN_HA, THR, tot, inj))

# ---------------------------------------------------------------- B. terrain
print("\n" + "=" * 100)
print("B. TERRAIN AT CANDIDATE ORIGINS  (Copernicus DEM GLO-30)")
print("=" * 100)
srcs = [rasterio.open(os.path.join(RAW, f)) for f in ("copdem_N36_00_E005.tif", "copdem_N36_00_E006.tif")]
dem, dem_tr = rio_merge(srcs, bounds=(5.30, 36.40, 6.70, 37.00))
dem = dem[0].astype(np.float32)
for s in srcs:
    s.close()
print("DEM mosaic %s  origin=(%.4f,%.4f) res=%.6f deg" % (dem.shape, dem_tr.c, dem_tr.f, dem_tr.a))

# gradients in metres: convert degree spacing to metres at this latitude
latc = 36.72
mx = dem_tr.a * 111320.0 * math.cos(math.radians(latc))
my = abs(dem_tr.e) * 110540.0
gy, gx = np.gradient(dem, my, mx)
slope_deg = np.degrees(np.arctan(np.hypot(gx, gy)))
aspect = (np.degrees(np.arctan2(-gx, gy))) % 360.0     # 0=N, 90=E, downslope direction


def dem_at(lat, lon):
    c = int((lon - dem_tr.c) / dem_tr.a)
    r = int((lat - dem_tr.f) / dem_tr.e)
    if 0 <= r < dem.shape[0] and 0 <= c < dem.shape[1]:
        return float(dem[r, c]), float(slope_deg[r, c]), float(aspect[r, c])
    return None, None, None


ev = list(csv.DictReader(open(os.path.join(PRO, "fire_events_clean.csv"), encoding="utf-8")))
origins = []
for e in ev:
    if int(e["n_cells"]) < 3:
        continue
    la, lo = float(e["first_lat"]), float(e["first_lon"])
    el, sl, asp = dem_at(la, lo)
    origins.append({"event_id": e["event_id"], "lat": la, "lon": lo,
                    "first_local": e["first_local"], "first_utc": e["first_utc"],
                    "n_cells": int(e["n_cells"]), "area_km2": float(e["approx_area_km2"]),
                    "elev_m": el, "slope_deg": sl, "aspect_deg": asp,
                    "sat": e["first_sat"], "conf": e["first_conf"], "frp": float(e["first_frp_mw"])})
print("%5s %18s %10s %9s %8s %8s %8s %9s" %
      ("ID", "first local", "lat", "lon", "elev_m", "slope", "aspect", "area_km2"))
print("-" * 100)
for o in origins:
    print("%5s %18s %10.5f %9.5f %8.0f %8.1f %8.0f %9.1f" %
          (o["event_id"], o["first_local"], o["lat"], o["lon"],
           o["elev_m"] or -1, o["slope_deg"] or -1, o["aspect_deg"] or -1, o["area_km2"]))

# ---------------------------------------------------------------- C. infra
print("\n" + "=" * 100)
print("C. HUMAN-INFRASTRUCTURE PROXIMITY  (metres to nearest feature)")
print("=" * 100)
infra = json.load(open(os.path.join(RAW, "osm_infra.json"), encoding="utf-8"))["elements"]
GROUPS = {
    "major_road": lambda t: t.get("highway") in ("motorway", "trunk", "primary", "secondary"),
    "minor_road": lambda t: t.get("highway") in ("tertiary", "unclassified", "residential", "service"),
    "track": lambda t: t.get("highway") == "track",
    "power_line": lambda t: t.get("power") in ("line", "minor_line"),
    "farmland": lambda t: t.get("landuse") in ("farmland", "orchard", "vineyard"),
    "landfill_quarry": lambda t: t.get("landuse") in ("landfill", "quarry") or t.get("amenity") == "waste_disposal",
    "industrial": lambda t: t.get("landuse") == "industrial",
}
geoms = {k: [] for k in GROUPS}
for el in infra:
    t = el.get("tags", {})
    g = el.get("geometry")
    if not g or len(g) < 2:
        continue
    coords = [ll_to_utm.transform(p["lon"], p["lat"]) for p in g]
    ln = LineString(coords)
    for k, fn in GROUPS.items():
        if fn(t):
            geoms[k].append(ln)
trees = {}
for k, v in geoms.items():
    trees[k] = (STRtree(v), v) if v else (None, [])
    print("   %-16s features=%d" % (k, len(v)))

# settlements
places = [e for e in json.load(open(os.path.join(RAW, "osm_jijel_places.json"), encoding="utf-8"))["elements"]
          if e["type"] == "node" and e.get("tags", {}).get("place") in ("city", "town", "village")]
pl_pts = [Point(*ll_to_utm.transform(p["lon"], p["lat"])) for p in places]
pl_tree = STRtree(pl_pts)
print("   %-16s features=%d" % ("settlement", len(pl_pts)))


def proximity(lat, lon):
    p = Point(*ll_to_utm.transform(lon, lat))
    out = {}
    for k, (tree, lst) in trees.items():
        if tree is None:
            out[k] = None; continue
        i = tree.nearest(p)
        out[k] = round(p.distance(lst[i]), 0)
    i = pl_tree.nearest(p)
    out["settlement"] = round(p.distance(pl_pts[i]), 0)
    return out


KEYS = ["major_road", "minor_road", "track", "power_line", "settlement", "farmland", "landfill_quarry", "industrial"]
print("\n%5s %18s " % ("ID", "first local") + "".join("%16s" % k for k in KEYS))
print("-" * 148)
for o in origins:
    pr = proximity(o["lat"], o["lon"])
    o.update({"dist_" + k: pr[k] for k in KEYS})
    print("%5s %18s " % (o["event_id"], o["first_local"]) + "".join("%16s" % (int(pr[k]) if pr[k] is not None else "-") for k in KEYS))

# null model: random points inside burned area
print("\n--- NULL MODEL: 2000 random points inside the mapped burn scar ---")
ys, xs = np.nonzero(burn)
sel = np.random.choice(len(ys), size=min(2000, len(ys)), replace=False)
nulls = {k: [] for k in KEYS}
for i in sel:
    x = tr.c + (xs[i] + 0.5) * PX
    y = tr.f - (ys[i] + 0.5) * PX
    lo, la = utm_to_ll.transform(x, y)
    pr = proximity(la, lo)
    for k in KEYS:
        if pr[k] is not None:
            nulls[k].append(pr[k])
print("%18s %10s %10s %10s %10s" % ("feature", "p10", "median", "p90", "origins_med"))
for k in KEYS:
    v = np.array(nulls[k])
    om = np.median([o["dist_" + k] for o in origins if o.get("dist_" + k) is not None])
    print("%18s %10.0f %10.0f %10.0f %10.0f" % (k, np.percentile(v, 10), np.median(v), np.percentile(v, 90), om))

with open(os.path.join(PRO, "origin_terrain_infrastructure.csv"), "w", newline="", encoding="utf-8") as f:
    w = csv.DictWriter(f, fieldnames=list(origins[0].keys())); w.writeheader(); w.writerows(origins)
json.dump({k: {"p10": float(np.percentile(nulls[k], 10)), "median": float(np.median(nulls[k])),
               "p90": float(np.percentile(nulls[k], 90))} for k in KEYS},
          open(os.path.join(PRO, "infra_null_model.json"), "w"), indent=2)
print("\nwrote data/processed/origin_terrain_infrastructure.csv and infra_null_model.json")
