"""
08_sentinel2.py -- Sentinel-2 MSI L2A before/after analysis of the burned area.

Source : Sentinel-2 L2A Cloud-Optimized GeoTIFFs, AWS Open Data
         (s3://sentinel-cogs, Element84 earth-search STAC), ESA Copernicus data.
Scenes : S2C_31SGA_20260818_0_L2A  18 Aug 2026 10:30 UTC  cloud 0.0 %   PRE-FIRE
         S2B_31SGA_20260826_0_L2A  26 Aug 2026 10:40 UTC  cloud 0.7 %   DURING (west strip only)
         S2C_31SGA_20260828_0_L2A  28 Aug 2026 10:30 UTC  cloud 8.7 %   POST-FIRE

Products
  * true colour           B04/B03/B02
  * SWIR false colour     B12/B8A/B04  -- burnt ground is red/orange, healthy
                                          vegetation green, active flame white
  * NBR  = (B8A - B12) / (B8A + B12)
  * dNBR = NBR_pre - NBR_post          -- USGS burn-severity classes applied

All reads are windowed over HTTP (GDAL /vsicurl), so only the subset covering
the fire complex is transferred, not the whole 110 x 110 km tile.
"""
import json, os
import numpy as np
import rasterio
from rasterio.windows import from_bounds
from rasterio.warp import transform_bounds
from PIL import Image

os.environ.setdefault("AWS_NO_SIGN_REQUEST", "YES")
os.environ.setdefault("GDAL_DISABLE_READDIR_ON_OPEN", "EMPTY_DIR")
os.environ.setdefault("CPL_VSIL_CURL_ALLOWED_EXTENSIONS", ".tif")

OUT = "satellite"
os.makedirs(OUT, exist_ok=True)
SC = json.load(open("data/raw/s2_selected_scenes.json", encoding="utf-8"))

# analysis window in WGS84 covering the whole Jijel fire complex
W, S, E, N = 5.36, 36.50, 6.45, 36.96


def read_window(href, bounds_ll, out_shape=None):
    with rasterio.open(href) as ds:
        b = transform_bounds("EPSG:4326", ds.crs, *bounds_ll, densify_pts=21)
        win = from_bounds(*b, transform=ds.transform)
        kw = {"window": win, "boundless": True, "fill_value": 0}
        if out_shape:
            kw["out_shape"] = out_shape
        arr = ds.read(1, **kw).astype(np.float32)
        tr = ds.window_transform(win)
        return arr, tr, ds.crs


def stretch(a, lo=2, hi=98, mask=None):
    v = a[np.isfinite(a) & (a > 0)] if mask is None else a[mask]
    if v.size == 0:
        return np.zeros_like(a, dtype=np.uint8)
    p1, p2 = np.percentile(v, [lo, hi])
    if p2 <= p1:
        p2 = p1 + 1
    return np.clip((a - p1) / (p2 - p1), 0, 1)


def save_rgb(r, g, b, path, title=""):
    rgb = np.dstack([stretch(r), stretch(g), stretch(b)])
    img = (rgb * 255).astype(np.uint8)
    Image.fromarray(img).save(path)
    print("   wrote %s  %s  %s" % (path, img.shape, title))


scenes = {
    "pre_20260818":  SC["S2C_31SGA_20260818_0_L2A"],
    "post_20260828": SC["S2C_31SGA_20260828_0_L2A"],
}

data = {}
for tag, sc in scenes.items():
    print("[%s]  %s  cloud=%.1f%%" % (tag, sc["dt"][:19], sc["cloud"]))
    a = sc["assets"]
    swir, tr, crs = read_window(a["swir22"], (W, S, E, N))          # B12, 20 m -> reference grid
    shp = swir.shape
    nir, _, _ = read_window(a["nir08"], (W, S, E, N), out_shape=shp)  # B8A
    red, _, _ = read_window(a["red"], (W, S, E, N), out_shape=shp)
    grn, _, _ = read_window(a["green"], (W, S, E, N), out_shape=shp)
    blu, _, _ = read_window(a["blue"], (W, S, E, N), out_shape=shp)
    print("   grid %s  crs=%s  res=%.0f m" % (shp, crs, tr.a))
    data[tag] = dict(swir=swir, nir=nir, red=red, grn=grn, blu=blu, tr=tr, crs=crs)

    save_rgb(red, grn, blu, os.path.join(OUT, "S2_%s_truecolor.png" % tag), "true colour B04/B03/B02")
    save_rgb(swir, nir, red, os.path.join(OUT, "S2_%s_swir_falsecolor.png" % tag), "SWIR false colour B12/B8A/B04")

# ------------------------------------------------------------------ NBR / dNBR
def nbr(d):
    n, s = d["nir"], d["swir"]
    den = (n + s)
    out = np.where(den != 0, (n - s) / np.where(den == 0, 1, den), np.nan)
    return out

pre, post = data["pre_20260818"], data["post_20260828"]
nbr_pre, nbr_post = nbr(pre), nbr(post)
valid = np.isfinite(nbr_pre) & np.isfinite(nbr_post) & (pre["swir"] > 0) & (post["swir"] > 0)
dnbr = np.where(valid, nbr_pre - nbr_post, np.nan)
np.save(os.path.join(OUT, "dnbr.npy"), dnbr.astype(np.float32))

# USGS / Key & Benson burn-severity classes
edges = [-np.inf, 0.10, 0.27, 0.44, 0.66, np.inf]
labels = ["unburned / regrowth", "low severity", "moderate-low", "moderate-high", "high severity"]
colors = np.array([[200, 200, 200], [124, 199, 106], [255, 235, 100], [242, 148, 42], [200, 30, 30]], np.uint8)

cls = np.full(dnbr.shape, -1, np.int16)
for i in range(5):
    cls = np.where(valid & (dnbr >= edges[i]) & (dnbr < edges[i + 1]), i, cls)

px_area_ha = (abs(pre["tr"].a) ** 2) / 10000.0
print("\nBURN SEVERITY (dNBR, Key & Benson classes) over the analysis window")
print("  pixel = %.0f m, area per pixel = %.2f ha" % (abs(pre["tr"].a), px_area_ha))
tot_burn = 0.0
for i, lab in enumerate(labels):
    n = int((cls == i).sum())
    ha = n * px_area_ha
    if i >= 1:
        tot_burn += ha
    print("   %-22s %9d px  %10.1f ha  %8.1f km2" % (lab, n, ha, ha / 100))
print("   %-22s %9s  %10.1f ha  %8.1f km2" % ("TOTAL burned (dNBR>=0.10)", "", tot_burn, tot_burn / 100))
print("   valid pixels: %d of %d (%.1f%%)" % (valid.sum(), valid.size, 100 * valid.sum() / valid.size))

rgb = np.zeros(dnbr.shape + (3,), np.uint8)
for i in range(5):
    rgb[cls == i] = colors[i]
rgb[~valid] = [30, 30, 30]
Image.fromarray(rgb).save(os.path.join(OUT, "S2_dNBR_severity.png"))
print("   wrote satellite/S2_dNBR_severity.png")

meta = {
    "window_wgs84": [W, S, E, N],
    "crs": str(pre["crs"]), "pixel_m": abs(pre["tr"].a),
    "transform": list(pre["tr"])[:6], "shape": list(dnbr.shape),
    "pre_scene": "S2C_31SGA_20260818_0_L2A", "post_scene": "S2C_31SGA_20260828_0_L2A",
    "classes": labels, "edges": [None, 0.10, 0.27, 0.44, 0.66, None],
    "burned_ha_by_class": [float((cls == i).sum() * px_area_ha) for i in range(5)],
    "total_burned_ha": float(tot_burn),
}
json.dump(meta, open(os.path.join(OUT, "dnbr_meta.json"), "w"), indent=2)
print("\ndone")
