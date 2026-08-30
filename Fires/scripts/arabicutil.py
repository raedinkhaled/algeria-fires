"""Shared helpers for portable Arabic Matplotlib output and map furniture."""
import math
import os
from pathlib import Path

import numpy as np
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib import font_manager, rcParams

ROOT = Path(__file__).resolve().parents[1]
FONT_PATH = Path(
    os.environ.get(
        "FIRES_ARABIC_FONT",
        ROOT / "assets" / "fonts" / "NotoSansArabic-Variable.ttf",
    )
)

if FONT_PATH.is_file():
    font_manager.fontManager.addfont(str(FONT_PATH))
    FONT_FAMILY = font_manager.FontProperties(fname=str(FONT_PATH)).get_name()
else:
    FONT_FAMILY = "DejaVu Sans"

rcParams["font.family"] = [FONT_FAMILY, "DejaVu Sans", "sans-serif"]
rcParams["axes.unicode_minus"] = False

WESTERN_DIGITS = str.maketrans("٠١٢٣٤٥٦٧٨٩۰۱۲۳۴۵۶۷۸۹", "01234567890123456789")


def western_digits(text):
    """Use copy-friendly 0-9 digits consistently in Arabic publications."""
    return str(text).translate(WESTERN_DIGITS)

def ar(text):
    """Normalize multiline labels for Matplotlib's native Arabic layout engine."""
    return "\n".join(western_digits(text).splitlines())


def lat_aspect(lat):
    return 1.0 / math.cos(math.radians(lat))


def add_north_arrow(ax, x=0.955, y=0.90, size=0.055):
    ax.annotate("", xy=(x, y + size), xytext=(x, y - size * 0.4),
                xycoords="axes fraction",
                arrowprops=dict(arrowstyle="-|>", color="black", lw=2.0))
    ax.text(x, y + size + 0.012, "N", transform=ax.transAxes, ha="center", va="bottom",
            fontsize=11, fontweight="bold")


def add_scalebar(ax, lat, km=10, x=0.04, y=0.045):
    """Scale bar in axes fraction, sized from the current x-limits (degrees lon)."""
    x0, x1 = ax.get_xlim()
    deg_per_km = 1.0 / (111.320 * math.cos(math.radians(lat)))
    frac = (km * deg_per_km) / (x1 - x0)
    ax.plot([x, x + frac], [y, y], transform=ax.transAxes, color="black", lw=3.5,
            solid_capstyle="butt", zorder=40)
    ax.plot([x, x + frac / 2], [y, y], transform=ax.transAxes, color="white", lw=2.2,
            solid_capstyle="butt", zorder=41)
    ax.text(x + frac / 2, y + 0.012, "%d km" % km, transform=ax.transAxes,
            ha="center", va="bottom", fontsize=9, zorder=41)


def hillshade(dem, mx, my, az=315.0, alt=45.0):
    gy, gx = np.gradient(dem, my, mx)
    slope = np.arctan(np.hypot(gx, gy))
    aspect = np.arctan2(-gx, gy)
    azr, altr = math.radians(360.0 - az + 90.0), math.radians(alt)
    hs = (np.sin(altr) * np.cos(slope) +
          np.cos(altr) * np.sin(slope) * np.cos(azr - aspect))
    return np.clip(hs, 0, 1)


def credit(fig, text):
    fig.text(0.995, 0.004, ar(text), fontsize=6.4, color="#444444",
             ha="right", va="bottom")
