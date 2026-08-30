#!/usr/bin/env python3
"""Validate the investigation workspace and build deterministic web artifacts.

The scientific files in Fires/ are inputs only. This script never mutates them.
It publishes a reviewed subset under public/generated and public/maplibre.
"""

from __future__ import annotations

import csv
import hashlib
import json
import re
import shutil
import sys
from pathlib import Path
from typing import Any, Iterable

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="backslashreplace")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8", errors="backslashreplace")

ROOT = Path(__file__).resolve().parents[2]
FIRES = ROOT / "Fires"
PROCESSED = FIRES / "data" / "processed"
RAW = FIRES / "data" / "raw"
GENERATED = ROOT / "public" / "generated"
MAPLIBRE = ROOT / "public" / "maplibre"

EXPECTED = {
    "hotspots": 9_100,
    "grid_cells": 4_451,
    "origins": 12,
    "burn_patches": 17,
}

CSV_INPUTS = {
    "hotspots": PROCESSED / "hotspots_wildfire_only.csv",
    "grid_cells": PROCESSED / "grid_first_detection_clean.csv",
    "origins": PROCESSED / "independent_origins.csv",
    "burn_patches": PROCESSED / "burn_patches.csv",
}

DOWNLOADS = (
    (
        CSV_INPUTS["hotspots"],
        "data/hotspots_wildfire_only.csv",
        "text/csv",
        "مجموعة الرصد الحراري النهائية بعد استبعاد المصادر الصناعية.",
    ),
    (
        CSV_INPUTS["grid_cells"],
        "data/grid_first_detection.csv",
        "text/csv",
        "أول ظهور مرصود لكل خلية شبكية بدقة 375 م.",
    ),
    (
        CSV_INPUTS["origins"],
        "data/independent_origins.csv",
        "text/csv",
        "مرشحو المنشأ المستقل مع التوقيت والتضاريس واختبارات البلوغ.",
    ),
    (
        CSV_INPUTS["burn_patches"],
        "data/burn_patches.csv",
        "text/csv",
        "ملخص الندبات التي تبلغ مساحتها 100 هكتار فأكثر.",
    ),
    (
        PROCESSED / "ignition_clusters.json",
        "data/ignition_clusters.json",
        "application/json",
        "الملف الرئيسي لمرشحي المنشأ مع تدقيق المراجعة 4.",
    ),
    (
        PROCESSED / "headline_summary.json",
        "data/headline_summary.json",
        "application/json",
        "القيم المرجعية والملخص العددي للتحقيق.",
    ),
    (
        FIRES / "report" / "report_ar.md",
        "documentation/report_ar.md",
        "text/markdown",
        "النسخة العربية الكاملة بصيغة Markdown.",
    ),
    (
        FIRES / "sources" / "sources.md",
        "documentation/sources.md",
        "text/markdown",
        "سجل المصادر والروابط وحالة الوصول.",
    ),
    (
        FIRES / "report" / "report_ar_compact.pdf",
        "report/report_ar_compact.pdf",
        "application/pdf",
        "نسخة PDF مضغوطة من التقرير العربي.",
    ),
)

REQUIRED_HEADERS = {
    "hotspots": {
        "latitude",
        "longitude",
        "datetime_local",
        "instrument",
        "sat_code",
        "conf_class",
        "frp_mw",
        "daynight",
        "in_province",
    },
    "grid_cells": {
        "lat",
        "lon",
        "first_local",
        "instrument",
        "sat",
        "conf",
        "frp_mw",
        "n_det",
        "event_id",
    },
    "origins": {
        "origin_id",
        "lat",
        "lon",
        "first_local",
        "confidence",
        "frp_mw",
        "wilaya",
        "locality",
    },
    "burn_patches": {
        "patch_id",
        "centroid_lat",
        "centroid_lon",
        "area_km2",
        "first_det_local",
        "mean_dnbr",
        "max_dnbr",
    },
}

LINK_RE = re.compile(r"\[[^\]]+\]\(([^)]+)\)")
NUMBER_RE = re.compile(r"^-?(?:\d+|\d*\.\d+)$")


def fail(message: str) -> None:
    raise SystemExit(f"خطأ في إعداد بيانات الموقع: {message}")


def strict_json(path: Path) -> Any:
    try:
        return json.loads(
            path.read_text(encoding="utf-8"),
            parse_constant=lambda value: (_ for _ in ()).throw(
                ValueError(f"قيمة غير صالحة: {value}")
            ),
        )
    except (OSError, UnicodeError, json.JSONDecodeError, ValueError) as exc:
        fail(f"{path.relative_to(ROOT)} ليس JSON صالحاً: {exc}")


def validate_markdown(path: Path) -> None:
    try:
        text = path.read_text(encoding="utf-8")
    except (OSError, UnicodeError) as exc:
        fail(f"تعذر قراءة {path.relative_to(ROOT)} بترميز UTF-8: {exc}")

    if "\ufffd" in text:
        fail(f"{path.relative_to(ROOT)} يحتوي محارف استبدال تالفة")
    if not re.search(r"(?m)^#\s+\S", text):
        fail(f"{path.relative_to(ROOT)} لا يحتوي عنواناً رئيسياً")

    for target in LINK_RE.findall(text):
        if not target.strip():
            fail(f"{path.relative_to(ROOT)} يحتوي رابط Markdown فارغاً")


def validate_csv(path: Path) -> tuple[list[str], int]:
    try:
        with path.open("r", encoding="utf-8-sig", newline="") as handle:
            reader = csv.reader(handle)
            header = next(reader)
            # مصفوفات المسافة المصدّرة من pandas تحمل عمود فهرس أول بلا اسم.
            if not header or any(not cell.strip() for cell in header[1:]):
                fail(f"{path.relative_to(ROOT)} يحتوي ترويسة CSV فارغة")
            named_header = [cell for cell in header if cell.strip()]
            if len(set(named_header)) != len(named_header):
                fail(f"{path.relative_to(ROOT)} يحتوي أسماء أعمدة مكررة")
            count = 0
            for line_number, row in enumerate(reader, 2):
                if len(row) != len(header):
                    fail(
                        f"{path.relative_to(ROOT)}: السطر {line_number} "
                        f"يحتوي {len(row)} حقلاً بدلاً من {len(header)}"
                    )
                count += 1
            return header, count
    except (OSError, UnicodeError, csv.Error, StopIteration) as exc:
        fail(f"تعذر التحقق من {path.relative_to(ROOT)}: {exc}")


def validate_workspace() -> dict[str, int]:
    if not FIRES.is_dir():
        fail("مجلد Fires غير موجود")

    for path in sorted(PROCESSED.rglob("*.json")):
        strict_json(path)
    for path in sorted(PROCESSED.rglob("*.csv")):
        validate_csv(path)

    for path in (
        FIRES / "README.md",
        FIRES / "report" / "report_ar.md",
        FIRES / "sources" / "sources.md",
    ):
        validate_markdown(path)

    counts: dict[str, int] = {}
    for key, path in CSV_INPUTS.items():
        header, count = validate_csv(path)
        missing = REQUIRED_HEADERS[key] - set(header)
        if missing:
            fail(
                f"{path.relative_to(ROOT)} ينقصه: "
                + ", ".join(sorted(missing))
            )
        counts[key] = count

    summary = strict_json(PROCESSED / "headline_summary.json")
    clusters = strict_json(PROCESSED / "ignition_clusters.json")
    summary_checks = {
        "hotspots": summary.get("detections_total_analysis_set"),
        "grid_cells": summary.get("grid_cells_375m"),
        "origins": clusters.get("meta", {})
        .get("counts", {})
        .get("independent_origin_candidates_total"),
        "burn_patches": summary.get("burn_patches_ge_100ha"),
    }

    for key, expected in EXPECTED.items():
        if counts[key] != expected:
            fail(f"{key}: عُثر على {counts[key]} صفاً، المتوقع {expected}")
        if summary_checks[key] != expected:
            fail(
                f"{key}: القيمة الملخصة {summary_checks[key]!r} "
                f"لا تطابق المرجع {expected}"
            )

    return counts


def recreate_directory(path: Path) -> None:
    resolved = path.resolve()
    public_root = (ROOT / "public").resolve()
    if resolved.parent != public_root or resolved.name not in {"generated", "maplibre"}:
        fail(f"رفض تنظيف مسار غير آمن: {resolved}")
    if resolved.exists():
        shutil.rmtree(resolved)
    resolved.mkdir(parents=True)


def dump_json(path: Path, value: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(
        json.dumps(value, ensure_ascii=False, separators=(",", ":")) + "\n",
        encoding="utf-8",
        newline="\n",
    )


def read_dicts(path: Path) -> Iterable[dict[str, str]]:
    with path.open("r", encoding="utf-8-sig", newline="") as handle:
        yield from csv.DictReader(handle)


def coerce(value: str) -> Any:
    text = value.strip()
    if text == "":
        return None
    if text.lower() == "true":
        return True
    if text.lower() == "false":
        return False
    if NUMBER_RE.match(text):
        number = float(text)
        return int(number) if number.is_integer() else number
    return text


def point_collection(
    rows: Iterable[dict[str, str]],
    *,
    id_field: str,
    lat_field: str,
    lon_field: str,
    include: tuple[str, ...],
) -> dict[str, Any]:
    features = []
    for row in rows:
        try:
            latitude = float(row[lat_field])
            longitude = float(row[lon_field])
        except (KeyError, TypeError, ValueError):
            fail(f"إحداثية غير صالحة في {id_field}={row.get(id_field)!r}")

        if not (-90 <= latitude <= 90 and -180 <= longitude <= 180):
            fail(f"إحداثية خارج النطاق في {id_field}={row.get(id_field)!r}")

        properties = {
            key: coerce(row[key])
            for key in include
            if key in row
        }
        features.append(
            {
                "type": "Feature",
                "id": f"{row[id_field]}-{len(features)}",
                "geometry": {
                    "type": "Point",
                    "coordinates": [round(longitude, 5), round(latitude, 5)],
                },
                "properties": properties,
            }
        )

    return {"type": "FeatureCollection", "features": features}


def round_coordinates(value: Any) -> Any:
    if isinstance(value, float):
        return round(value, 6)
    if isinstance(value, list):
        return [round_coordinates(item) for item in value]
    if isinstance(value, dict):
        return {key: round_coordinates(item) for key, item in value.items()}
    return value


def build_boundaries() -> None:
    communes = strict_json(RAW / "jijel_communes.geojson")
    if communes.get("type") != "FeatureCollection":
        fail("jijel_communes.geojson ليس FeatureCollection")

    features = []
    for feature in communes.get("features", []):
        properties = feature.get("properties", {})
        features.append(
            {
                "type": "Feature",
                "id": str(properties.get("osm_id", "")),
                "properties": {
                    "name": properties.get("name"),
                    "osm_id": properties.get("osm_id"),
                },
                "geometry": round_coordinates(feature.get("geometry")),
            }
        )

    dump_json(
        MAPLIBRE / "communes.geojson",
        {"type": "FeatureCollection", "features": features},
    )

    province_geometry = strict_json(RAW / "jijel_province_boundary.geojson")
    if province_geometry.get("type") not in {"Polygon", "MultiPolygon"}:
        fail("حدود الولاية لا تحتوي هندسة Polygon/MultiPolygon")

    dump_json(
        MAPLIBRE / "province-boundary.geojson",
        {
            "type": "FeatureCollection",
            "features": [
                {
                    "type": "Feature",
                    "id": "jijel",
                    "properties": {"name": "ولاية جيجل"},
                    "geometry": round_coordinates(province_geometry),
                }
            ],
        },
    )


def build_geojson() -> None:
    dump_json(
        MAPLIBRE / "hotspots.geojson",
        point_collection(
            read_dicts(CSV_INPUTS["hotspots"]),
            id_field="epoch",
            lat_field="latitude",
            lon_field="longitude",
            include=(
                "datetime_local",
                "instrument",
                "sat_code",
                "conf_class",
                "frp_mw",
                "daynight",
                "in_province",
            ),
        ),
    )
    dump_json(
        MAPLIBRE / "grid-first-detection.geojson",
        point_collection(
            read_dicts(CSV_INPUTS["grid_cells"]),
            id_field="first_epoch",
            lat_field="lat",
            lon_field="lon",
            include=(
                "first_local",
                "instrument",
                "sat",
                "conf",
                "frp_mw",
                "n_det",
                "event_id",
            ),
        ),
    )
    dump_json(
        MAPLIBRE / "origins.geojson",
        point_collection(
            read_dicts(CSV_INPUTS["origins"]),
            id_field="origin_id",
            lat_field="lat",
            lon_field="lon",
            include=(
                "origin_id",
                "first_local",
                "confidence",
                "frp_mw",
                "wilaya",
                "daira",
                "locality",
                "elevation_m",
                "slope_deg",
                "largest_unburnt_gap_km",
            ),
        ),
    )
    dump_json(
        MAPLIBRE / "burn-patch-centroids.geojson",
        point_collection(
            read_dicts(CSV_INPUTS["burn_patches"]),
            id_field="patch_id",
            lat_field="centroid_lat",
            lon_field="centroid_lon",
            include=(
                "patch_id",
                "area_km2",
                "max_extent_km",
                "first_det_local",
                "mean_dnbr",
                "max_dnbr",
            ),
        ),
    )
    build_boundaries()


def map_style(*, dark: bool) -> dict[str, Any]:
    palette = (
        {
            "background": "#171512",
            "boundary": "#8b8178",
            "commune": "#4d4842",
            "hotspot": "#ff7654",
            "origin": "#ffd08a",
            "centroid": "#f0e8df",
        }
        if dark
        else {
            "background": "#f5f1e9",
            "boundary": "#554b42",
            "commune": "#a89d91",
            "hotspot": "#b93518",
            "origin": "#7a230f",
            "centroid": "#221c17",
        }
    )
    return {
        "version": 8,
        "name": f"Jijel investigation — {'dark' if dark else 'light'}",
        "center": [5.95, 36.72],
        "zoom": 8.7,
        "sources": {
            "severity": {
                "type": "image",
                "url": "/generated/media/burn-severity.png",
                "coordinates": [
                    [5.36, 36.96],
                    [6.45, 36.96],
                    [6.45, 36.5],
                    [5.36, 36.5],
                ],
            },
            "province": {
                "type": "geojson",
                "data": "/maplibre/province-boundary.geojson",
            },
            "communes": {
                "type": "geojson",
                "data": "/maplibre/communes.geojson",
            },
            "hotspots": {
                "type": "geojson",
                "data": "/maplibre/hotspots.geojson",
            },
            "origins": {
                "type": "geojson",
                "data": "/maplibre/origins.geojson",
            },
            "burn-centroids": {
                "type": "geojson",
                "data": "/maplibre/burn-patch-centroids.geojson",
            },
        },
        "layers": [
            {
                "id": "background",
                "type": "background",
                "paint": {"background-color": palette["background"]},
            },
            {
                "id": "burn-severity",
                "type": "raster",
                "source": "severity",
                "paint": {"raster-opacity": 0.58 if dark else 0.7},
            },
            {
                "id": "communes",
                "type": "line",
                "source": "communes",
                "paint": {
                    "line-color": palette["commune"],
                    "line-width": 0.75,
                    "line-opacity": 0.8,
                },
            },
            {
                "id": "province",
                "type": "line",
                "source": "province",
                "paint": {
                    "line-color": palette["boundary"],
                    "line-width": 2,
                },
            },
            {
                "id": "hotspots",
                "type": "circle",
                "source": "hotspots",
                "paint": {
                    "circle-color": palette["hotspot"],
                    "circle-radius": [
                        "interpolate",
                        ["linear"],
                        ["coalesce", ["get", "frp_mw"], 0],
                        0,
                        2,
                        50,
                        5,
                        300,
                        9,
                    ],
                    "circle-opacity": 0.58,
                },
            },
            {
                "id": "burn-patch-centroids",
                "type": "circle",
                "source": "burn-centroids",
                "paint": {
                    "circle-color": palette["centroid"],
                    "circle-radius": 4,
                    "circle-stroke-color": palette["hotspot"],
                    "circle-stroke-width": 2,
                },
            },
            {
                "id": "candidate-origins",
                "type": "circle",
                "source": "origins",
                "paint": {
                    "circle-color": palette["origin"],
                    "circle-radius": 7,
                    "circle-stroke-color": palette["background"],
                    "circle-stroke-width": 2,
                },
            },
        ],
    }


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def row_count(path: Path) -> int | None:
    if path.suffix.lower() != ".csv":
        return None
    return validate_csv(path)[1]


def publish_downloads(counts: dict[str, int]) -> None:
    entries = []
    for source, relative_target, media_type, description in DOWNLOADS:
        if not source.is_file():
            fail(f"ملف النشر مفقود: {source.relative_to(ROOT)}")
        target = GENERATED / relative_target
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(source, target)
        entry = {
            "path": f"/generated/{relative_target}",
            "media_type": media_type,
            "bytes": target.stat().st_size,
            "sha256": sha256(target),
            "description": description,
        }
        rows = row_count(target)
        if rows is not None:
            entry["rows"] = rows
        entries.append(entry)

    clusters = strict_json(PROCESSED / "ignition_clusters.json")
    summary = strict_json(PROCESSED / "headline_summary.json")
    revision = clusters["meta"].get("revision")
    source_time = clusters["meta"].get("generated_utc")

    source_hashes = {
        key: sha256(path)
        for key, path in CSV_INPUTS.items()
    }
    fingerprint = hashlib.sha256(
        json.dumps(source_hashes, sort_keys=True).encode("utf-8")
    ).hexdigest()

    dump_json(
        GENERATED / "content-summary.json",
        {
            "revision": revision,
            "source_generated_utc": source_time,
            "reference_counts": counts,
            "headline_summary": summary,
            "scope_note": clusters["meta"].get("critical_rule"),
            "revision_note": clusters["meta"].get("revision_note"),
        },
    )
    dump_json(
        GENERATED / "downloads.json",
        {
            "schema_version": 1,
            "source_revision": revision,
            "source_generated_utc": source_time,
            "source_fingerprint": fingerprint,
            "artifacts": entries,
        },
    )


def publish_media_and_map_config() -> None:
    severity_source = FIRES / "satellite" / "S2_dNBR_severity.png"
    severity_target = GENERATED / "media" / "burn-severity.png"
    severity_target.parent.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(severity_source, severity_target)

    metadata = strict_json(FIRES / "satellite" / "dnbr_meta.json")
    dump_json(
        MAPLIBRE / "map-config.json",
        {
            "schema_version": 1,
            "center": [5.95, 36.72],
            "bounds": [5.0, 36.2, 6.8, 37.2],
            "styles": {
                "light": "/maplibre/style-light.json",
                "dark": "/maplibre/style-dark.json",
            },
            "layers": {
                "thermal_detections": "/maplibre/hotspots.geojson",
                "grid_first_detection": "/maplibre/grid-first-detection.geojson",
                "candidate_origins": "/maplibre/origins.geojson",
                "burn_patch_centroids": "/maplibre/burn-patch-centroids.geojson",
                "communes": "/maplibre/communes.geojson",
                "province": "/maplibre/province-boundary.geojson",
                "burn_severity": {
                    "url": "/generated/media/burn-severity.png",
                    "bounds": metadata["window_wgs84"],
                    "pixel_m": metadata["pixel_m"],
                    "classes": metadata["classes"],
                    "edges": metadata["edges"],
                },
            },
            "geometry_note": (
                "ملف burn-patch-centroids يعرض مراكز الندبات فقط؛ "
                "لا توجد مضلعات منشورة ولم تُخترع أي هندسة بديلة."
            ),
        },
    )
    dump_json(MAPLIBRE / "style-light.json", map_style(dark=False))
    dump_json(MAPLIBRE / "style-dark.json", map_style(dark=True))


def main() -> None:
    counts = validate_workspace()
    recreate_directory(GENERATED)
    recreate_directory(MAPLIBRE)
    publish_downloads(counts)
    publish_media_and_map_config()
    build_geojson()

    print("تم التحقق من Fires وبناء بيانات الموقع:")
    for key, count in counts.items():
        print(f"  {key}: {count:,}")
    print(f"  generated: {GENERATED.relative_to(ROOT)}")
    print(f"  maplibre: {MAPLIBRE.relative_to(ROOT)}")


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        sys.exit(130)
