"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import * as maplibregl from "maplibre-gl";
import type { Map as MapLibreMap } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

const days = [
  { label: "23 أوت", cutoff: "2026-08-23 23:59" },
  { label: "24 أوت", cutoff: "2026-08-24 23:59" },
  { label: "25 أوت", cutoff: "2026-08-25 23:59" },
  { label: "26 أوت", cutoff: "2026-08-26 23:59" },
  { label: "27 أوت", cutoff: "2026-08-27 23:59" },
  { label: "28 أوت", cutoff: "2026-08-28 23:59" },
  { label: "29 أوت", cutoff: "2026-08-29 23:59" },
] as const;

const layerOptions = [
  { id: "hotspots", mapId: "hotspots", label: "الرصد الحراري", description: "9,100 قراءة من أقمار VIIRS" },
  { id: "origins", mapId: "candidate-origins", label: "البدايات المحتملة", description: "12 موقعاً اجتازت شروط التحليل" },
  { id: "burn", mapId: "burn-patch-centroids", label: "مراكز المناطق المحترقة", description: "17 مركزاً؛ ليست حدوداً للمناطق" },
  { id: "severity", mapId: "burn-severity", label: "شدة الاحتراق", description: "صورة Sentinel-2 ليوم 28 أوت" },
  { id: "communes", mapId: "communes", label: "حدود البلديات", description: "28 بلدية داخل ولاية جيجل" },
] as const;

type LayerId = (typeof layerOptions)[number]["id"];

const initialVisibility: Record<LayerId, boolean> = {
  hotspots: true,
  origins: true,
  burn: true,
  severity: true,
  communes: true,
};

function currentStyle(): string {
  return document.documentElement.classList.contains("dark")
    ? "/maplibre/style-dark.json"
    : "/maplibre/style-light.json";
}

function supportsWebGL(): boolean {
  const canvas = document.createElement("canvas");
  return Boolean(canvas.getContext("webgl2") ?? canvas.getContext("webgl"));
}

export function FireMap() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const dayRef = useRef(days.length - 1);
  const visibilityRef = useRef<Record<LayerId, boolean>>(initialVisibility);
  const [day, setDay] = useState(days.length - 1);
  const [visibility, setVisibility] = useState(initialVisibility);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!containerRef.current || !supportsWebGL()) {
      setFailed(true);
      return;
    }

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: currentStyle(),
      bounds: [5.0, 36.2, 6.8, 37.2],
      fitBoundsOptions: { padding: 28 },
      attributionControl: false,
      cooperativeGestures: true,
      maxBounds: [[4.5, 35.8], [7.3, 37.6]],
    });
    mapRef.current = map;
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-left");
    map.addControl(new maplibregl.AttributionControl({ compact: true }), "bottom-left");

    const applyState = () => {
      const cutoff = days[dayRef.current].cutoff;
      if (map.getLayer("hotspots")) map.setFilter("hotspots", ["<=", ["get", "datetime_local"], cutoff]);
      for (const layer of layerOptions) {
        if (map.getLayer(layer.mapId)) map.setLayoutProperty(layer.mapId, "visibility", visibilityRef.current[layer.id] ? "visible" : "none");
      }
    };

    map.on("style.load", applyState);
    map.on("error", (event) => {
      if (event.error) setFailed(true);
    });

    const showPopup = (layerId: string, property: string) => {
      map.on("click", layerId, (event) => {
        const feature = event.features?.[0];
        const point = feature?.geometry.type === "Point" ? feature.geometry.coordinates : null;
        if (!feature || !point) return;
        const label = String(feature.properties?.[property] ?? "رصد بلا معرّف");
        const time = String(feature.properties?.first_local ?? feature.properties?.datetime_local ?? "");
        new maplibregl.Popup({ closeButton: true })
          .setLngLat([Number(point[0]), Number(point[1])])
          .setText(time ? `${label}: ${time}` : label)
          .addTo(map);
      });
      map.on("mouseenter", layerId, () => { map.getCanvas().style.cursor = "pointer"; });
      map.on("mouseleave", layerId, () => { map.getCanvas().style.cursor = ""; });
    };

    showPopup("candidate-origins", "origin_id");
    showPopup("burn-patch-centroids", "patch_id");
    showPopup("hotspots", "sat_code");

    const observer = new MutationObserver(() => {
      const style = currentStyle();
      if (!map.getStyle()?.name?.includes(style.includes("dark") ? "dark" : "light")) map.setStyle(style);
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    return () => {
      observer.disconnect();
      map.remove();
      mapRef.current = null;
    };
  }, []);

  const updateDay = (value: number[]) => {
    const next = value[0] ?? days.length - 1;
    dayRef.current = next;
    setDay(next);
    const map = mapRef.current;
    if (map?.getLayer("hotspots")) map.setFilter("hotspots", ["<=", ["get", "datetime_local"], days[next].cutoff]);
  };

  const updateLayer = (id: LayerId, checked: boolean) => {
    const next = { ...visibilityRef.current, [id]: checked };
    visibilityRef.current = next;
    setVisibility(next);
    const option = layerOptions.find((layer) => layer.id === id);
    const map = mapRef.current;
    if (option && map?.getLayer(option.mapId)) map.setLayoutProperty(option.mapId, "visibility", checked ? "visible" : "none");
  };

  return (
    <div className="grid border-y lg:grid-cols-12">
      <aside className="border-b p-4 sm:p-6 lg:col-span-3 lg:border-b-0 lg:border-e">
        <Card size="sm">
          <CardHeader>
            <CardTitle>إعداد الخريطة</CardTitle>
            <CardDescription>اختر اليوم والطبقات التي تريد مقارنتها.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            <FieldSet>
              <div className="flex items-baseline justify-between gap-4">
                <FieldLegend>الزمن</FieldLegend>
                <output className="numeric text-sm font-medium">حتى {days[day].label}</output>
              </div>
              <FieldDescription>حرّك المؤشر لرؤية الرصد المتراكم يوماً بعد يوم.</FieldDescription>
              <Field>
                <FieldLabel htmlFor="map-day" className="sr-only">آخر يوم ظاهر</FieldLabel>
                <Slider id="map-day" min={0} max={days.length - 1} step={1} value={[day]} onValueChange={updateDay} aria-label="اختيار آخر يوم ظاهر على الخريطة" />
                <div className="numeric flex justify-between text-xs text-muted-foreground"><span>23 أوت</span><span>29 أوت</span></div>
              </Field>
            </FieldSet>

            <FieldSet>
              <FieldLegend>الطبقات</FieldLegend>
              <FieldGroup data-slot="checkbox-group">
                {layerOptions.map((layer) => (
                  <Field key={layer.id} orientation="horizontal">
                    <Checkbox id={`layer-${layer.id}`} checked={visibility[layer.id]} onCheckedChange={(checked) => updateLayer(layer.id, checked === true)} />
                    <FieldContent>
                      <FieldLabel htmlFor={`layer-${layer.id}`}>{layer.label}</FieldLabel>
                      <FieldDescription>{layer.description}</FieldDescription>
                    </FieldContent>
                  </Field>
                ))}
              </FieldGroup>
            </FieldSet>
          </CardContent>
          <CardFooter className="text-xs leading-6 text-muted-foreground">انقر على نقطة لعرض معرّفها ووقت رصدها. الإحداثيات والوقت تقريبيان بحسب مرور القمر.</CardFooter>
        </Card>
      </aside>

      <div className="relative min-h-96 lg:col-span-9">
        {failed ? (
          <div className="flex h-dvh min-h-96 flex-col justify-center p-6 sm:p-10">
            <Alert>
              <AlertTitle>تعذر تشغيل الخريطة التفاعلية</AlertTitle>
              <AlertDescription>يمكنك متابعة أثر الاحتراق في الصورة الثابتة أدناه. لم تُحذف أي بيانات من الصفحة.</AlertDescription>
            </Alert>
            <figure className="mt-6">
              <Image src="/generated/media/burn-severity.png" alt="خريطة ثابتة لشدة الاحتراق في جيجل" width={4946} height={2700} className="h-auto w-full border" />
              <figcaption className="mt-3 text-xs leading-5 text-muted-foreground">بديل ثابت من Sentinel-2. يعرض شدة الاحتراق ولا يعرض حدوداً مخترعة للندبات.</figcaption>
            </figure>
          </div>
        ) : null}
        <div ref={containerRef} dir="ltr" aria-label="خريطة تفاعلية لحرائق جيجل" className={cn("h-dvh min-h-96 w-full", failed && "hidden")} />
      </div>
    </div>
  );
}
