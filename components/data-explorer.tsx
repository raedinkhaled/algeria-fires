"use client";

import { useMemo, useState } from "react";
import { ArrowDownUpIcon, DownloadIcon } from "lucide-react";

import { DailyActivityChart, type DailyActivity } from "@/components/investigation-charts";
import { DataFigure, EdgePanel, SectionLabel, StatStrip } from "@/components/editorial";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export type OriginRow = {
  origin_id: string;
  first_local: string;
  lat: string;
  lon: string;
  satellite: string;
  confidence: string;
  frp_mw: string;
  daynight: string;
  wilaya: string;
  locality: string;
  elevation_m: string;
  slope_deg: string;
  largest_unburnt_gap_km: string;
  burn_patch: string;
};

export type PatchRow = {
  patch_id: string;
  area_km2: string;
  max_extent_km: string;
  centroid_in_jijel: string;
  n_detections_inside: string;
  first_det_local: string;
  mean_dnbr: string;
};

type DownloadArtifact = {
  path: string;
  media_type: string;
  bytes: number;
  sha256: string;
  description: string;
  rows?: number;
};

type SortKey = "origin_id" | "first_local" | "frp_mw" | "elevation_m";

function number(value: string) {
  return Number(value || 0);
}

function formatNumber(value: number, maximumFractionDigits = 0) {
  return new Intl.NumberFormat("en", { maximumFractionDigits }).format(value);
}

function formatBytes(bytes: number) {
  if (bytes >= 1_000_000) return `${formatNumber(bytes / 1_000_000, 1)} MB`;
  return `${formatNumber(bytes / 1_000, 1)} KB`;
}

function localDate(value: string) {
  return value ? value.replace("2026-", "").replace("-", ".") : "غير مرصود";
}

function DownloadLink({ artifact, bundled = false }: { artifact: DownloadArtifact; bundled?: boolean }) {
  const filename = artifact.path.split("/").at(-1) ?? artifact.path;
  return (
    <a
      href={artifact.path}
      download
      className="group grid grid-cols-[minmax(0,1fr)_auto] gap-x-4 gap-y-1 px-4 py-3.5 transition-colors hover:bg-muted/50 focus-visible:outline-2 focus-visible:outline-ring"
    >
      <span className="min-w-0">
        <span className="block text-sm font-medium">{artifact.description}</span>
        <span className="ltr-embed mt-1 block truncate text-[11px] text-muted-foreground">
          {filename}
        </span>
      </span>
      <span className="flex items-center gap-2 self-center text-xs text-muted-foreground">
        <span className="numeric">{artifact.rows ? `${formatNumber(artifact.rows)} rows` : formatBytes(artifact.bytes)}</span>
        <DownloadIcon aria-hidden="true" />
      </span>
      {bundled ? <span className="col-span-2 text-[11px] text-muted-foreground">يشمل بيانات CSV وملفات JSON المنشورة دون الأصول الخام.</span> : null}
    </a>
  );
}

export function DataExplorer({
  activity,
  origins,
  patches,
  downloads,
}: {
  activity: DailyActivity[];
  origins: OriginRow[];
  patches: PatchRow[];
  downloads: DownloadArtifact[];
}) {
  const [wilaya, setWilaya] = useState("all");
  const [satellite, setSatellite] = useState("all");
  const [sortKey, setSortKey] = useState<SortKey>("first_local");
  const [descending, setDescending] = useState(false);

  const wilayas = useMemo(
    () => [...new Set(origins.map((origin) => origin.wilaya).filter(Boolean))].sort((a, b) => a.localeCompare(b, "ar")),
    [origins],
  );
  const satellites = useMemo(
    () => [...new Set(origins.map((origin) => origin.satellite).filter(Boolean))].sort(),
    [origins],
  );
  const filteredOrigins = useMemo(() => {
    const direction = descending ? -1 : 1;
    return origins
      .filter((origin) => wilaya === "all" || origin.wilaya === wilaya)
      .filter((origin) => satellite === "all" || origin.satellite === satellite)
      .toSorted((left, right) => {
        const leftValue = left[sortKey];
        const rightValue = right[sortKey];
        const comparison = ["frp_mw", "elevation_m"].includes(sortKey)
          ? number(leftValue) - number(rightValue)
          : leftValue.localeCompare(rightValue, "ar");
        return comparison * direction;
      });
  }, [descending, origins, satellite, sortKey, wilaya]);

  const totalBurned = patches.reduce((sum, patch) => sum + number(patch.area_km2), 0);
  const totalDetections = activity.reduce((sum, day) => sum + day.detections, 0);
  const bundle = downloads.find((artifact) => artifact.media_type === "application/zip");
  const individualDownloads = downloads.filter((artifact) => artifact.media_type !== "application/zip");

  function sortBy(key: SortKey) {
    if (key === sortKey) setDescending((current) => !current);
    else {
      setSortKey(key);
      setDescending(key === "frp_mw" || key === "elevation_m");
    }
  }

  return (
    <div className="mt-10 flex flex-col gap-12">
      <StatStrip
        items={[
          { value: formatNumber(totalDetections), unit: "رصد حراري منشور" },
          { value: formatNumber(origins.length), unit: "مرشح منشأ مستقل" },
          { value: formatNumber(patches.length), unit: "ندبة فوق 100 هكتار" },
          { value: `${formatNumber(totalBurned, 1)} km²`, unit: "مساحة الندبات المنشورة" },
        ]}
      />

      <section>
        <SectionLabel>النشاط اليومي</SectionLabel>
        <DataFigure
          className="mt-4"
          sensor="VIIRS · MODIS"
          meta="23-29.08.2026"
          caption="التجميع حسب التاريخ المحلي. سلسلة الطقس مأخوذة عند منشأ الشقفة، فلا تمثّل متوسطاً مكانياً للولاية."
        >
          <DailyActivityChart days={activity} />
        </DataFigure>
      </section>

      <section>
        <SectionLabel>سجل المنشأ والندبات</SectionLabel>
        <Tabs defaultValue="origins" className="mt-4">
          <TabsList variant="line" className="border-b">
            <TabsTrigger value="origins">مرشحو المنشأ</TabsTrigger>
            <TabsTrigger value="patches">الندبات الكبرى</TabsTrigger>
          </TabsList>

          <TabsContent value="origins" className="mt-4">
            <div className="flex flex-wrap items-end gap-3 border px-3 py-3">
              <label className="flex flex-col gap-1.5 text-[11px] text-muted-foreground">
                الولاية
                <Select value={wilaya} onValueChange={setWilaya}>
                  <SelectTrigger aria-label="تصفية مرشحي المنشأ حسب الولاية">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>الولاية</SelectLabel>
                      <SelectItem value="all">كل الولايات</SelectItem>
                      {wilayas.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </label>
              <label className="flex flex-col gap-1.5 text-[11px] text-muted-foreground">
                القمر
                <Select value={satellite} onValueChange={setSatellite}>
                  <SelectTrigger aria-label="تصفية مرشحي المنشأ حسب القمر">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>القمر</SelectLabel>
                      <SelectItem value="all">كل الأقمار</SelectItem>
                      {satellites.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </label>
              <p className="ms-auto text-xs text-muted-foreground">
                <span className="numeric">{formatNumber(filteredOrigins.length)} / {formatNumber(origins.length)}</span> مرشحاً
              </p>
            </div>

            <Table className="min-w-[760px] border-x border-b">
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <SortableHead label="المعرف" active={sortKey === "origin_id"} descending={descending} onClick={() => sortBy("origin_id")} />
                  <SortableHead label="أول رصد" active={sortKey === "first_local"} descending={descending} onClick={() => sortBy("first_local")} />
                  <TableHead>الموضع</TableHead>
                  <SortableHead label="FRP" active={sortKey === "frp_mw"} descending={descending} onClick={() => sortBy("frp_mw")} />
                  <SortableHead label="الارتفاع" active={sortKey === "elevation_m"} descending={descending} onClick={() => sortBy("elevation_m")} />
                  <TableHead>القمر</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrigins.map((origin) => (
                  <TableRow key={origin.origin_id}>
                    <TableCell className="numeric text-xs font-medium">{origin.origin_id}</TableCell>
                    <TableCell className="numeric text-xs">{localDate(origin.first_local)}</TableCell>
                    <TableCell>
                      <span className="block text-xs">{origin.locality || origin.wilaya}</span>
                      <span className="numeric mt-1 block text-[11px] text-muted-foreground">{origin.lat}°N · {origin.lon}°E</span>
                    </TableCell>
                    <TableCell className="numeric text-xs">{formatNumber(number(origin.frp_mw), 2)} MW</TableCell>
                    <TableCell className="numeric text-xs">{formatNumber(number(origin.elevation_m))} m</TableCell>
                    <TableCell className="ltr-embed text-xs text-muted-foreground">{origin.satellite}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>

          <TabsContent value="patches" className="mt-4">
            <Table className="min-w-[680px] border">
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead>المعرف</TableHead>
                  <TableHead>المساحة</TableHead>
                  <TableHead>أول رصد داخل الندبة</TableHead>
                  <TableHead>الامتداد الأقصى</TableHead>
                  <TableHead>رصدات داخل الندبة</TableHead>
                  <TableHead>dNBR المتوسط</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {patches.map((patch) => (
                  <TableRow key={patch.patch_id}>
                    <TableCell className="numeric text-xs font-medium">{patch.patch_id}</TableCell>
                    <TableCell className="numeric text-xs">{formatNumber(number(patch.area_km2), 2)} km²</TableCell>
                    <TableCell className="numeric text-xs">{localDate(patch.first_det_local)}</TableCell>
                    <TableCell className="numeric text-xs">{formatNumber(number(patch.max_extent_km), 2)} km</TableCell>
                    <TableCell className="numeric text-xs">{formatNumber(number(patch.n_detections_inside))}</TableCell>
                    <TableCell className="numeric text-xs">{formatNumber(number(patch.mean_dnbr), 3)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>
        </Tabs>
      </section>

      <section>
        <SectionLabel>التنزيلات</SectionLabel>
        <EdgePanel className="mt-4" label="نطاق النشر">
          <p className="max-w-2xl text-sm leading-7 text-muted-foreground">
            التنزيلات تشمل البيانات المعالجة التي استند إليها العرض، لا الملفات الخام الثقيلة. تحمل كل مادة بصمتها في فهرس التنزيلات للتحقق من السلامة.
          </p>
        </EdgePanel>
        {bundle ? (
          <div className="mt-4 border">
            <DownloadLink artifact={bundle} bundled />
          </div>
        ) : null}
        <div className="mt-4 divide-y border">
          {individualDownloads.map((artifact) => <DownloadLink key={artifact.path} artifact={artifact} />)}
        </div>
        <div className="mt-4 flex justify-end">
          <Button asChild variant="outline" size="sm">
            <a href="/generated/downloads.json" download>
              <DownloadIcon data-icon="inline-start" />
              فهرس التنزيلات
            </a>
          </Button>
        </div>
      </section>
    </div>
  );
}

function SortableHead({
  label,
  active,
  descending,
  onClick,
}: {
  label: string;
  active: boolean;
  descending: boolean;
  onClick: () => void;
}) {
  return (
    <TableHead>
      <button
        type="button"
        onClick={onClick}
        className="inline-flex items-center gap-1 text-start focus-visible:outline-2 focus-visible:outline-ring"
        aria-label={`فرز حسب ${label}${active ? (descending ? " تنازلياً" : " تصاعدياً") : ""}`}
      >
        {label}
        <ArrowDownUpIcon aria-hidden="true" className={active ? "text-foreground" : "text-muted-foreground"} />
      </button>
    </TableHead>
  );
}
