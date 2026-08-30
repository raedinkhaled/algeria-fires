"use client";

import Image from "next/image";
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  LayersIcon,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { LngLat, Map as MapLibreMap, MapMouseEvent } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { mapLayers as LAYERS, type MapLayerId as LayerId } from "@/lib/map-layers";
import { cn } from "@/lib/utils";

/* ── الأيام: حدّ زمني تراكمي، نهاية كل يوم بالتوقيت المحلي (UTC+1) ── */
const DAYS = [
  {
    key: "23",
    label: "23 أوت",
    short: "23.08",
    day: "الأحد",
    cutoff: "2026-08-23 23:59",
  },
  {
    key: "24",
    label: "24 أوت",
    short: "24.08",
    day: "الاثنين",
    cutoff: "2026-08-24 23:59",
  },
  {
    key: "25",
    label: "25 أوت",
    short: "25.08",
    day: "الثلاثاء",
    cutoff: "2026-08-25 23:59",
  },
  {
    key: "26",
    label: "26 أوت",
    short: "26.08",
    day: "الأربعاء",
    cutoff: "2026-08-26 23:59",
  },
  {
    key: "27",
    label: "27 أوت",
    short: "27.08",
    day: "الخميس",
    cutoff: "2026-08-27 23:59",
  },
  {
    key: "28",
    label: "28 أوت",
    short: "28.08",
    day: "الجمعة",
    cutoff: "2026-08-28 23:59",
  },
  {
    key: "29",
    label: "29 أوت",
    short: "29.08",
    day: "السبت",
    cutoff: "2026-08-29 23:59",
  },
] as const;

const LAST_DAY = DAYS.length - 1;

/* الطبقات وتعريفاتها في lib/map-layers.ts، مصدر واحد مع دليل الطبقات في الصفحة. */

const INITIAL_VISIBILITY: Record<LayerId, boolean> = {
  hotspots: true,
  origins: true,
  burn: true,
  severity: true,
  communes: false,
};

/* فئات شدّة الاحتراق ولونها كما في صورة Sentinel-2 (مادة علمية، اللون مسموح) */
const SEVERITY_CLASSES = [
  { label: "لم تحترق", color: "#c8c8c8" },
  { label: "منخفضة", color: "#7cc76a" },
  { label: "متوسطة-منخفضة", color: "#ffeb64" },
  { label: "متوسطة-عالية", color: "#f2942a" },
  { label: "عالية", color: "#c81e1e" },
];

/* ألوان احتياطية مطابقة لملفَّي النمط، تُستعمل لو تعذّرت قراءتها من الخريطة */
const FALLBACK_PALETTE = {
  light: { hotspot: "#b93518", origin: "#7a230f", burnRing: "#b93518", commune: "#a89d91" },
  dark: { hotspot: "#ff7654", origin: "#ffd08a", burnRing: "#ff7654", commune: "#8b8178" },
};

type Palette = (typeof FALLBACK_PALETTE)["light"];

type MapStatus = "loading" | "ready" | "failed";

type ActivityDay = { date: string; detections: number };

/* نوع مرشّح الطبقة كما يقبله setFilter، ومساعد لبناء الترشيح الزمني */
type MapFilter = Parameters<MapLibreMap["setFilter"]>[1];

function timeExpr(field: string, cutoff: string): MapFilter {
  return ["<=", ["get", field], cutoff] as unknown as MapFilter;
}

function isDark(): boolean {
  return document.documentElement.classList.contains("dark");
}

function styleUrl(): string {
  return isDark() ? "/maplibre/style-dark.json" : "/maplibre/style-light.json";
}

function supportsWebGL2(): boolean {
  try {
    return Boolean(document.createElement("canvas").getContext("webgl2"));
  } catch {
    return false;
  }
}

const AR_CONFIDENCE: Record<string, string> = {
  high: "عالية",
  nominal: "متوسطة",
  low: "منخفضة",
};

function num(value: unknown, digits = 2): string {
  const n = Number(value);
  if (!Number.isFinite(n)) return "—";
  return n.toLocaleString("en-US", { maximumFractionDigits: digits });
}

function esc(value: unknown): string {
  return String(value ?? "").replace(/[&<>"]/g, (c) =>
    c === "&" ? "&amp;" : c === "<" ? "&lt;" : c === ">" ? "&gt;" : "&quot;",
  );
}

/* نافذة معلومات منسّقة: عنوان + صفوف مفتاح/قيمة، القيم LTR بخط أحادي */
function popupHTML(kind: LayerId, p: Record<string, unknown>): string {
  const rows: [string, string][] = [];
  let title = "";

  if (kind === "origins") {
    const place = p.locality || p.daira || p.wilaya;
    title = `${esc(p.origin_id)}${place ? ` · ${esc(place)}` : ""}`;
    rows.push(["أول رصد", esc(p.first_local)]);
    rows.push(["الثقة", AR_CONFIDENCE[String(p.confidence)] ?? esc(p.confidence)]);
    rows.push(["قوة الإشعاع", `${num(p.frp_mw, 1)} MW`]);
    rows.push(["الارتفاع", `${num(p.elevation_m, 0)} م`]);
    rows.push(["الميل", `${num(p.slope_deg, 1)}°`]);
    if (p.largest_unburnt_gap_km != null) {
      rows.push(["أوسع فجوة غير محترقة", `${num(p.largest_unburnt_gap_km, 1)} كم`]);
    }
    rows.push(["الموقع", esc([p.daira, p.wilaya].filter(Boolean).join(" · "))]);
  } else if (kind === "burn") {
    title = esc(p.patch_id);
    rows.push(["أول رصد", esc(p.first_det_local)]);
    rows.push(["المساحة", `${num(p.area_km2, 1)} كم²`]);
    rows.push(["أقصى امتداد", `${num(p.max_extent_km, 1)} كم`]);
    rows.push(["متوسط dNBR", num(p.mean_dnbr, 3)]);
    rows.push(["أقصى dNBR", num(p.max_dnbr, 3)]);
  } else {
    title = "رصد حراري";
    rows.push(["الوقت المحلي", esc(p.datetime_local)]);
    rows.push(["المستشعر", esc([p.instrument, p.sat_code].filter(Boolean).join(" · "))]);
    rows.push(["الثقة", AR_CONFIDENCE[String(p.conf_class)] ?? esc(p.conf_class)]);
    rows.push(["قوة الإشعاع", `${num(p.frp_mw, 1)} MW`]);
    rows.push(["الرصد", p.daynight === "N" ? "ليلي" : "نهاري"]);
  }

  const body = rows
    .map(
      ([k, v]) =>
        `<div class="fire-popup__row"><span class="fire-popup__key">${k}</span><span class="fire-popup__val">${v}</span></div>`,
    )
    .join("");
  return `<div class="fire-popup"><p class="fire-popup__title">${title}</p>${body}</div>`;
}

function LegendRow({
  swatch,
  label,
  note,
}: {
  swatch: React.ReactNode;
  label: string;
  note?: string;
}) {
  return (
    <div className="flex items-start gap-2">
      <span className="mt-0.5 flex h-3 w-4 shrink-0 items-center justify-center">
        {swatch}
      </span>
      <span className="min-w-0">
        <span className="text-foreground">{label}</span>
        {note ? (
          <span className="block text-[10px] leading-4 text-muted-foreground">
            {note}
          </span>
        ) : null}
      </span>
    </div>
  );
}

function MapLegend({
  visibility,
  palette,
}: {
  visibility: Record<LayerId, boolean>;
  palette: Palette;
}) {
  const anyVisible = LAYERS.some((l) => visibility[l.id]);
  const [open, setOpen] = useState(() => {
    if (typeof window === "undefined") return true;
    return window.matchMedia("(min-width: 640px)").matches;
  });
  if (!anyVisible) return null;

  return (
    <div className="absolute start-3 top-3 z-10 max-w-[min(15rem,calc(100%-1.5rem))]">
      <div className="border bg-background/95 shadow-sm backdrop-blur-sm">
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          className="flex w-full items-center justify-between gap-3 px-2.5 py-1.5 text-[10px] font-medium uppercase tracking-label text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
        >
          مفتاح الطبقات
          <ChevronDownIcon
            className={cn("size-3 transition-transform", open && "rotate-180")}
            aria-hidden
          />
        </button>
        <div
          className={cn(
            "space-y-1.5 border-t px-2.5 py-2 text-[11px] leading-5",
            !open && "hidden",
          )}
        >
          {visibility.hotspots ? (
            <LegendRow
              label="الرصد الحراري"
              note="الحجم ∝ قوة الإشعاع"
              swatch={
                <span className="flex items-center gap-0.5">
                  <span
                    className="size-1 rounded-full"
                    style={{ background: palette.hotspot }}
                  />
                  <span
                    className="size-1.5 rounded-full"
                    style={{ background: palette.hotspot }}
                  />
                  <span
                    className="size-2 rounded-full"
                    style={{ background: palette.hotspot }}
                  />
                </span>
              }
            />
          ) : null}
          {visibility.origins ? (
            <LegendRow
              label="البدايات المحتملة"
              swatch={
                <span
                  className="size-2.5 rounded-full ring-2 ring-background"
                  style={{ background: palette.origin }}
                />
              }
            />
          ) : null}
          {visibility.burn ? (
            <LegendRow
              label="مراكز الندبات"
              swatch={
                <span
                  className="size-2 rounded-full bg-foreground"
                  style={{ boxShadow: `0 0 0 2px ${palette.burnRing}` }}
                />
              }
            />
          ) : null}
          {visibility.communes ? (
            <LegendRow
              label="حدود البلديات"
              swatch={
                <span
                  className="h-px w-4"
                  style={{ background: palette.commune }}
                />
              }
            />
          ) : null}
          {visibility.severity ? (
            <div>
              <span className="text-foreground">شدة الاحتراق</span>
              <span className="mt-1 flex h-2 w-full overflow-hidden border">
                {SEVERITY_CLASSES.map((c) => (
                  <span
                    key={c.label}
                    className="flex-1"
                    style={{ background: c.color }}
                    title={c.label}
                  />
                ))}
              </span>
              <span className="mt-0.5 flex justify-between text-[9px] text-muted-foreground">
                <span>سطحية</span>
                <span>شديدة</span>
              </span>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function FireMap({
  activity,
  className,
}: {
  activity: ActivityDay[];
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const readyRef = useRef(false);
  const dayRef = useRef(LAST_DAY);
  const visibilityRef = useRef(INITIAL_VISIBILITY);
  const themeRef = useRef<"light" | "dark">("light");

  const [day, setDay] = useState(LAST_DAY);
  const [visibility, setVisibility] = useState(INITIAL_VISIBILITY);
  const [status, setStatus] = useState<MapStatus>("loading");
  const [palette, setPalette] = useState<Palette>(FALLBACK_PALETTE.light);
  const [view, setView] = useState<{ lng: number; lat: number; zoom: number } | null>(
    null,
  );

  const maxDetections = useMemo(
    () => Math.max(1, ...activity.map((d) => d.detections)),
    [activity],
  );

  useEffect(() => {
    let cancelled = false;
    const container = containerRef.current;
    if (!container) return;

    let map: MapLibreMap | undefined;
    let watchdog: ReturnType<typeof setTimeout> | undefined;

    const start = async () => {
      const maplibregl = await import("maplibre-gl");
      if (cancelled || !container) return;

      if (!supportsWebGL2()) {
        setStatus("failed");
        return;
      }

      // نسخة العامل من الحزمة نفسها، تُنشر تحت public/vendor. حزم dev لا تحلّ
      // مسار العامل الداخلي في MapLibre حلاً صحيحاً، فنمرّره صراحةً.
      maplibregl.setWorkerUrl("/vendor/maplibre/maplibre-gl-worker.mjs");
      themeRef.current = isDark() ? "dark" : "light";

      const m = new maplibregl.Map({
        container,
        style: styleUrl(),
        bounds: [5.37, 36.4, 6.63, 36.96],
        fitBoundsOptions: { padding: 26 },
        attributionControl: false,
        cooperativeGestures: true,
        maxBounds: [
          [4.4, 35.7],
          [7.4, 37.7],
        ],
        locale: {
          "NavigationControl.ZoomIn": "تكبير",
          "NavigationControl.ZoomOut": "تصغير",
          "AttributionControl.ToggleAttribution": "مصادر الخريطة",
          "Popup.Close": "إغلاق",
          "CooperativeGesturesHandler.WindowsHelpText":
            "اضغط Ctrl مع التمرير للتكبير",
          "CooperativeGesturesHandler.MacHelpText": "اضغط ⌘ مع التمرير للتكبير",
          "CooperativeGesturesHandler.MobileHelpText":
            "استخدم إصبعين لتحريك الخريطة",
        },
      });
      map = m;
      mapRef.current = m;

      m.addControl(
        new maplibregl.NavigationControl({ showCompass: false }),
        "top-left",
      );
      m.addControl(
        new maplibregl.AttributionControl({ compact: true }),
        "bottom-left",
      );
      m.addControl(
        new maplibregl.ScaleControl({ unit: "metric", maxWidth: 110 }),
        "bottom-right",
      );

      const readPalette = () => {
        const fallback = FALLBACK_PALETTE[themeRef.current];
        const read = (
          id: string,
          prop: "circle-color" | "circle-stroke-color" | "line-color",
          key: keyof Palette,
        ) => {
          try {
            const value = m.getPaintProperty(id, prop);
            return typeof value === "string" ? value : fallback[key];
          } catch {
            return fallback[key];
          }
        };
        setPalette({
          hotspot: read("hotspots", "circle-color", "hotspot"),
          origin: read("candidate-origins", "circle-color", "origin"),
          burnRing: read("burn-patch-centroids", "circle-stroke-color", "burnRing"),
          commune: read("communes", "line-color", "commune"),
        });
      };

      const applyState = () => {
        const cutoff = DAYS[dayRef.current].cutoff;
        for (const layer of LAYERS) {
          if (!m.getLayer(layer.styleId)) continue;
          if (layer.timeField) {
            m.setFilter(layer.styleId, timeExpr(layer.timeField, cutoff));
          }
          m.setLayoutProperty(
            layer.styleId,
            "visibility",
            visibilityRef.current[layer.id] ? "visible" : "none",
          );
        }
        readPalette();
      };

      // ترتيب أولوية النقر عند تراكب النقاط: المنشأ ثم الندبة ثم الرصد
      const PICK_ORDER: { styleId: string; kind: LayerId }[] = [
        { styleId: "candidate-origins", kind: "origins" },
        { styleId: "burn-patch-centroids", kind: "burn" },
        { styleId: "hotspots", kind: "hotspots" },
      ];
      const pickLayerIds = PICK_ORDER.map((entry) => entry.styleId);

      m.on("click", (event: MapMouseEvent) => {
        const hits = m.queryRenderedFeatures(event.point, {
          layers: pickLayerIds.filter((id) => m.getLayer(id)),
        });
        if (!hits.length) return;
        const chosen = PICK_ORDER.map((entry) => ({
          entry,
          feature: hits.find((hit) => hit.layer.id === entry.styleId),
        })).find((candidate) => candidate.feature);
        if (!chosen?.feature || chosen.feature.geometry.type !== "Point") return;
        const [lng, lat] = chosen.feature.geometry.coordinates as [number, number];
        new maplibregl.Popup({ closeButton: true, offset: 12, maxWidth: "260px" })
          .setLngLat([lng, lat])
          .setHTML(popupHTML(chosen.entry.kind, chosen.feature.properties ?? {}))
          .addTo(m);
      });

      m.on("mousemove", (event: MapMouseEvent) => {
        const hit = m.queryRenderedFeatures(event.point, {
          layers: pickLayerIds.filter((id) => m.getLayer(id)),
        });
        m.getCanvas().style.cursor = hit.length ? "pointer" : "";
      });

      const syncView = () => {
        const c: LngLat = m.getCenter();
        setView({ lng: c.lng, lat: c.lat, zoom: m.getZoom() });
      };

      m.on("style.load", applyState);
      m.on("load", () => {
        if (cancelled) return;
        readyRef.current = true;
        setStatus("ready");
        syncView();
        if (watchdog) clearTimeout(watchdog);
      });
      m.on("moveend", syncView);
      m.on("error", (event) => {
        console.error("MapLibre error", event.error);
        // فشل تحميل النمط نفسه = عطل قاتل؛ أخطاء المصادر بعده غير قاتلة
        if (!readyRef.current && !m.isStyleLoaded()) setStatus("failed");
      });
      m.on("webglcontextlost", () => setStatus("failed"));

      watchdog = setTimeout(() => {
        if (!readyRef.current && !cancelled) setStatus("failed");
      }, 12000);
    };

    void start();

    const observer = new MutationObserver(() => {
      const next = isDark() ? "dark" : "light";
      if (next === themeRef.current || !map) return;
      themeRef.current = next;
      map.setStyle(styleUrl());
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => {
      cancelled = true;
      observer.disconnect();
      if (watchdog) clearTimeout(watchdog);
      map?.remove();
      mapRef.current = null;
      readyRef.current = false;
    };
  }, []);

  const applyDay = useCallback((next: number) => {
    const clamped = Math.min(LAST_DAY, Math.max(0, next));
    dayRef.current = clamped;
    setDay(clamped);
    const map = mapRef.current;
    if (!map) return;
    const cutoff = DAYS[clamped].cutoff;
    for (const layer of LAYERS) {
      if (layer.timeField && map.getLayer(layer.styleId)) {
        map.setFilter(layer.styleId, timeExpr(layer.timeField, cutoff));
      }
    }
  }, []);

  const toggleLayer = useCallback((id: LayerId) => {
    const next = { ...visibilityRef.current, [id]: !visibilityRef.current[id] };
    visibilityRef.current = next;
    setVisibility(next);
    const map = mapRef.current;
    const layer = LAYERS.find((l) => l.id === id);
    if (map && layer && map.getLayer(layer.styleId)) {
      map.setLayoutProperty(
        layer.styleId,
        "visibility",
        next[id] ? "visible" : "none",
      );
    }
  }, []);

  if (status === "failed") {
    return (
      <section
        aria-label="خريطة تفاعلية لحرائق جيجل"
        className={cn("border bg-card p-4 sm:p-6", className)}
      >
        <Alert className="max-w-3xl">
          <AlertTitle>تعذّر تشغيل الخريطة التفاعلية</AlertTitle>
          <AlertDescription>
            قد يكون متصفحك لا يدعم WebGL أو تعذّر تحميل ملفات الخريطة. تابع أثر
            الاحتراق في الصورة الثابتة أدناه؛ لم تُحذف أي بيانات.
          </AlertDescription>
        </Alert>
        <figure className="mt-5">
          <Image
            src="/generated/media/burn-severity.png"
            alt="خريطة ثابتة لشدة الاحتراق في جيجل من Sentinel-2"
            width={4946}
            height={2700}
            className="h-auto w-full border"
          />
          <figcaption className="mt-2 text-xs leading-5 text-muted-foreground">
            بديل ثابت من Sentinel-2 (dNBR بين 18 و28 أوت): الأحمر شدة احتراق
            عالية، الأخضر منخفضة. لا حدود منشورة للندبات، ولم نختلقها.
          </figcaption>
        </figure>
      </section>
    );
  }

  return (
    <section
      aria-label="خريطة تفاعلية لحرائق جيجل"
      className={cn("border bg-card", className)}
    >
      {/* شريط الطبقات مطابق لبنية سطح الخريطة المرجعي، مع تمرير أفقي عند الضيق */}
      <div
        role="group"
        aria-label="طبقات الخريطة"
        className="flex h-10 items-stretch overflow-x-auto border-b bg-background text-[11px]"
      >
        <span className="flex shrink-0 items-center gap-1.5 border-e px-3 font-medium text-muted-foreground sm:px-4">
          <LayersIcon aria-hidden />
          الطبقات
        </span>
        {LAYERS.map((layer) => {
          const on = visibility[layer.id];
          return (
            <button
              key={layer.id}
              type="button"
              aria-pressed={on}
              title={layer.note}
              onClick={() => toggleLayer(layer.id)}
              className={cn(
                "flex shrink-0 items-center gap-1.5 border-e px-3 whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring sm:px-3.5",
                on
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <span
                aria-hidden
                className="size-2 shrink-0 rounded-full"
                style={{
                  background: on
                    ? layer.id === "severity"
                      ? SEVERITY_CLASSES[4].color
                      : layer.id === "origins"
                        ? palette.origin
                        : layer.id === "communes"
                          ? palette.commune
                          : palette.hotspot
                    : "var(--border)",
                }}
              />
              {layer.label}
            </button>
          );
        })}
        {view ? (
          <span className="ms-auto hidden shrink-0 items-center border-s px-3 text-[10px] text-muted-foreground md:flex">
            <span className="ltr-embed">
              {view.lat.toFixed(2)}°N · {view.lng.toFixed(2)}°E · z
              {view.zoom.toFixed(1)}
            </span>
          </span>
        ) : null}
      </div>

      {/* الخريطة والطبقات فوقها */}
      <div className="relative">
        <div
          ref={containerRef}
          dir="ltr"
          role="application"
          aria-label="خريطة قابلة للتحريك والتكبير"
          className={cn(
            "fire-map-canvas h-[min(64dvh,30rem)] min-h-[25rem] w-full sm:h-[min(64dvh,32rem)] lg:h-[min(68dvh,36rem)]",
            status !== "ready" && "invisible",
          )}
        />

        {status === "ready" ? (
          <MapLegend visibility={visibility} palette={palette} />
        ) : null}

        {status === "loading" ? (
          <div className="absolute inset-0 flex items-center justify-center bg-background">
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <span
                aria-hidden
                className="size-1.5 animate-pulse rounded-full bg-muted-foreground"
              />
              جارٍ تحميل الخريطة…
            </p>
          </div>
        ) : null}

        {/* شريط الزمن داخل الخريطة كما في المرجع: التاريخ، القراءة اليومية، ثم أعمدة الأيام */}
        <div className="absolute inset-x-0 bottom-0 z-10 border-t border-white/10 bg-black/82 text-white backdrop-blur-sm">
          <div className="px-3 pb-2.5 pt-2 sm:px-4 sm:pb-3">
            <div className="mb-2 flex items-center justify-between gap-3 text-[11px]">
              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  type="button"
                  onClick={() => applyDay(day - 1)}
                  disabled={day === 0}
                  aria-label="اليوم السابق"
                  className="flex size-6 items-center justify-center border border-white/15 text-white/60 transition-colors hover:text-white disabled:opacity-25 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  <ChevronLeftIcon aria-hidden />
                </button>
                <span className="font-medium text-white/90">
                  <span className="ltr-embed">{DAYS[day].short}.2026</span>
                  <span className="hidden sm:inline"> · {DAYS[day].day}</span>
                </span>
                <button
                  type="button"
                  onClick={() => applyDay(day + 1)}
                  disabled={day === LAST_DAY}
                  aria-label="اليوم التالي"
                  className="flex size-6 items-center justify-center border border-white/15 text-white/60 transition-colors hover:text-white disabled:opacity-25 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  <ChevronRightIcon aria-hidden />
                </button>
              </div>
              <span className="text-white/55">
                <span className="numeric text-white/80">
                  {activity[day]?.detections.toLocaleString("en-US") ?? 0}
                </span>{" "}
                رصد في اليوم
              </span>
            </div>

            <div
              dir="ltr"
              role="group"
              aria-label="اختر آخر يوم ظاهر على الخريطة"
              className="grid h-10 grid-cols-7 items-end gap-1"
            >
              {activity.map((entry, index) => {
                const active = index === day;
                const included = index <= day;
                return (
                  <button
                    key={entry.date}
                    type="button"
                    aria-pressed={active}
                    aria-label={`${DAYS[index]?.label ?? entry.date}: ${entry.detections.toLocaleString("en-US")} رصد`}
                    title={`${DAYS[index]?.label ?? entry.date} · ${entry.detections.toLocaleString("en-US")} رصد`}
                    onClick={() => applyDay(index)}
                    className="group flex h-full min-w-0 flex-col items-center justify-end gap-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                  >
                    <span
                      aria-hidden
                      className={cn(
                        "w-full transition-colors",
                        active
                          ? "bg-white"
                          : included
                            ? "bg-white/45 group-hover:bg-white/65"
                            : "bg-white/15 group-hover:bg-white/30",
                      )}
                      style={{
                        height: `${Math.max(4, (entry.detections / maxDetections) * 24)}px`,
                      }}
                    />
                    <span
                      aria-hidden
                      className={cn(
                        "numeric text-[8px] leading-none",
                        active ? "text-white" : "text-white/40",
                      )}
                    >
                      <span className="sm:hidden">{DAYS[index]?.key}</span>
                      <span className="hidden sm:inline">{DAYS[index]?.short}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <p className="border-t px-4 py-2.5 text-xs leading-6 text-muted-foreground">
        كل نقطة رصد هي أقدم لحظة رآها القمر، لا لحظة الاشتعال، بدقة مكانية تقارب
        375 م. انقر أي نقطة لعرض تفاصيلها.
      </p>
    </section>
  );
}
