"use client";

import { useMemo, useState, type ReactNode } from "react";
import { ArrowDownUpIcon, DownloadIcon } from "lucide-react";

import { OriginScatterChart, PatchBarsChart } from "@/components/data-charts";
import { DailyActivityChart, type DailyActivity } from "@/components/investigation-charts";
import { DataFigure, EdgePanel, SectionLabel, StatStrip } from "@/components/editorial";
import { Reveal } from "@/components/motion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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

type OriginSortKey =
  | "origin_id"
  | "first_local"
  | "frp_mw"
  | "elevation_m"
  | "largest_unburnt_gap_km";

type PatchSortKey =
  | "patch_id"
  | "area_km2"
  | "first_det_local"
  | "max_extent_km"
  | "n_detections_inside"
  | "mean_dnbr";

const NUMERIC_ORIGIN_KEYS: OriginSortKey[] = [
  "frp_mw",
  "elevation_m",
  "largest_unburnt_gap_km",
];
const NUMERIC_PATCH_KEYS: PatchSortKey[] = [
  "area_km2",
  "max_extent_km",
  "n_detections_inside",
  "mean_dnbr",
];

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
      className="group grid grid-cols-[minmax(0,1fr)_auto] gap-x-6 gap-y-1 py-4 transition-colors hover:bg-card focus-visible:outline-2 focus-visible:outline-ring sm:px-3"
    >
      <span className="min-w-0">
        <span className="block text-[14.5px] font-medium leading-7">{artifact.description}</span>
        <span className="ltr-embed mt-1 block truncate text-[11.5px] text-muted-foreground">
          {filename}
        </span>
      </span>
      <span className="flex items-center gap-2 self-center text-xs text-muted-foreground">
        {artifact.rows ? (
          <span>
            <span className="numeric">{formatNumber(artifact.rows)}</span> صف
          </span>
        ) : (
          <span className="numeric">{formatBytes(artifact.bytes)}</span>
        )}
        <DownloadIcon aria-hidden="true" className="size-4 text-foreground transition-transform group-hover:translate-y-0.5" />
      </span>
      {bundled ? (
        <span className="col-span-2 text-[11px] text-muted-foreground">
          يشمل بيانات CSV وملفات JSON المنشورة دون الأصول الخام.
        </span>
      ) : null}
    </a>
  );
}

function dayNightLabel(value: string) {
  return value === "N" ? "ليلاً" : value === "D" ? "نهاراً" : "";
}

export function DataExplorer({
  activity,
  origins,
  patches,
  downloads,
  children,
}: {
  activity: DailyActivity[];
  origins: OriginRow[];
  patches: PatchRow[];
  downloads: DownloadArtifact[];
  /** أقسام خادمة تُدرَج بين الجداول المرشَّحة والتنزيلات (جداول قياس التوقيت). */
  children?: ReactNode;
}) {
  const [wilaya, setWilaya] = useState("all");
  const [satellite, setSatellite] = useState("all");
  const [originSort, setOriginSort] = useState<OriginSortKey>("first_local");
  const [originDescending, setOriginDescending] = useState(false);

  const [patchLocation, setPatchLocation] = useState("all");
  const [patchSort, setPatchSort] = useState<PatchSortKey>("area_km2");
  const [patchDescending, setPatchDescending] = useState(true);

  const wilayas = useMemo(
    () => [...new Set(origins.map((origin) => origin.wilaya).filter(Boolean))].sort((a, b) => a.localeCompare(b, "ar")),
    [origins],
  );
  const satellites = useMemo(
    () => [...new Set(origins.map((origin) => origin.satellite).filter(Boolean))].sort(),
    [origins],
  );

  const filteredOrigins = useMemo(() => {
    const direction = originDescending ? -1 : 1;
    return origins
      .filter((origin) => wilaya === "all" || origin.wilaya === wilaya)
      .filter((origin) => satellite === "all" || origin.satellite === satellite)
      .toSorted((left, right) => {
        const comparison = NUMERIC_ORIGIN_KEYS.includes(originSort)
          ? number(left[originSort]) - number(right[originSort])
          : left[originSort].localeCompare(right[originSort], "ar");
        return comparison * direction;
      });
  }, [origins, wilaya, satellite, originSort, originDescending]);

  const filteredPatches = useMemo(() => {
    const direction = patchDescending ? -1 : 1;
    return patches
      .filter((patch) => {
        if (patchLocation === "in") return patch.centroid_in_jijel === "True";
        if (patchLocation === "out") return patch.centroid_in_jijel !== "True";
        return true;
      })
      .toSorted((left, right) => {
        const comparison = NUMERIC_PATCH_KEYS.includes(patchSort)
          ? number(left[patchSort]) - number(right[patchSort])
          : left[patchSort].localeCompare(right[patchSort], "ar");
        return comparison * direction;
      });
  }, [patches, patchLocation, patchSort, patchDescending]);

  const totalBurned = patches.reduce((sum, patch) => sum + number(patch.area_km2), 0);
  const totalDetections = activity.reduce((sum, day) => sum + day.detections, 0);
  const bundle = downloads.find((artifact) => artifact.media_type === "application/zip");
  const individualDownloads = downloads.filter((artifact) => artifact.media_type !== "application/zip");

  function sortOrigins(key: OriginSortKey) {
    if (key === originSort) setOriginDescending((current) => !current);
    else {
      setOriginSort(key);
      setOriginDescending(NUMERIC_ORIGIN_KEYS.includes(key));
    }
  }

  function sortPatches(key: PatchSortKey) {
    if (key === patchSort) setPatchDescending((current) => !current);
    else {
      setPatchSort(key);
      setPatchDescending(NUMERIC_PATCH_KEYS.includes(key));
    }
  }

  return (
    <div className="flex flex-col gap-24">
      <Reveal>
        <StatStrip
          items={[
            { value: formatNumber(totalDetections), unit: "رصد حراري منشور" },
            { value: formatNumber(origins.length), unit: "مرشح منشأ مستقل" },
            { value: formatNumber(patches.length), unit: "ندبة فوق 100 هكتار" },
            { value: `${formatNumber(totalBurned, 1)} km²`, unit: "مساحة الندبات المنشورة" },
          ]}
        />
      </Reveal>

      <Reveal>
        <section id="daily" className="scroll-mt-20">
          <SectionLabel index="01">النشاط اليومي</SectionLabel>
          <DataFigure
            className="mt-8"
            sensor="VIIRS · MODIS"
            meta="23-29.08.2026"
            caption="التجميع حسب التاريخ المحلي. سلسلة الطقس مأخوذة عند منشأ الشقفة، فلا تمثّل متوسطاً مكانياً للولاية."
          >
            <DailyActivityChart days={activity} />
          </DataFigure>
        </section>
      </Reveal>

      <Reveal>
        <section id="origins" className="scroll-mt-20">
          <SectionLabel index="02">مرشحو المنشأ</SectionLabel>
          <p className="mt-6 max-w-2xl text-[16px] leading-8">
            كل مرشّح موقع اجتاز معاً شرط البُعد عن أقرب حريق سابق وشرط انقطاع
            المسار بأرض غير محترقة. الرسم يوزّعها على أيام الحدث، والجدول يحمل
            قيم اختبارات البلوغ.
          </p>

          <Alert className="mt-8 max-w-2xl">
            <AlertTitle>أول رصد ليس لحظة الاشتعال</AlertTitle>
            <AlertDescription>
              كل توقيت هنا هو أقدم نقطة حرارية رآها القمر. الاشتعال يسبقه بفترة
              تحدّها فجوة المرور بين تمريرتين، وقد تبلغ ساعات.
            </AlertDescription>
          </Alert>

          <DataFigure
            className="mt-10"
            sensor="VIIRS · MODIS"
            meta="12 مرشحاً · 23-27.08.2026"
            caption="المحور الأفقي وقت أول رصد، والرأسي ارتفاع الموقع بالأمتار، وحجم النقطة قوة الإشعاع الحراري. الدائرة المفرغة أول رصد ليلاً."
          >
            <OriginScatterChart origins={origins} />
          </DataFigure>

          <div className="mt-12 flex flex-wrap items-end gap-3 border-t border-rule bg-card px-3 py-3 sm:px-4">
            <label className="flex flex-col gap-1.5 text-[11px] text-muted-foreground">
              الولاية
              <Select value={wilaya} onValueChange={setWilaya}>
                <SelectTrigger className="min-w-40 bg-background" aria-label="تصفية مرشحي المنشأ حسب الولاية">
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
                <SelectTrigger className="min-w-40 bg-background" aria-label="تصفية مرشحي المنشأ حسب القمر">
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

          <Table className="min-w-[820px]">
            <TableHeader>
              <TableRow>
                <SortableHead label="المعرف" active={originSort === "origin_id"} descending={originDescending} onClick={() => sortOrigins("origin_id")} />
                <SortableHead label="أول رصد" active={originSort === "first_local"} descending={originDescending} onClick={() => sortOrigins("first_local")} />
                <TableHead>الموضع</TableHead>
                <SortableHead label="FRP" active={originSort === "frp_mw"} descending={originDescending} onClick={() => sortOrigins("frp_mw")} />
                <SortableHead label="الارتفاع" active={originSort === "elevation_m"} descending={originDescending} onClick={() => sortOrigins("elevation_m")} />
                <SortableHead label="فجوة المسار" active={originSort === "largest_unburnt_gap_km"} descending={originDescending} onClick={() => sortOrigins("largest_unburnt_gap_km")} />
                <TableHead>القمر</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrigins.map((origin) => (
                <TableRow key={origin.origin_id}>
                  <TableCell className="numeric text-xs font-medium">{origin.origin_id}</TableCell>
                  <TableCell className="text-xs">
                    <span className={origin.first_local ? "numeric" : undefined}>{localDate(origin.first_local)}</span>
                    {dayNightLabel(origin.daynight) ? (
                      <span className="mt-0.5 block text-[11px] text-muted-foreground">
                        {dayNightLabel(origin.daynight)}
                      </span>
                    ) : null}
                  </TableCell>
                  <TableCell>
                    <span className="block text-xs">{origin.locality || origin.wilaya}</span>
                    <span className="numeric mt-1 block text-[11px] text-muted-foreground">{origin.lat}°N · {origin.lon}°E</span>
                  </TableCell>
                  <TableCell className="numeric text-xs">{formatNumber(number(origin.frp_mw), 2)} MW</TableCell>
                  <TableCell className="numeric text-xs">{formatNumber(number(origin.elevation_m))} m</TableCell>
                  <TableCell className="numeric text-xs">
                    {origin.largest_unburnt_gap_km
                      ? `${formatNumber(number(origin.largest_unburnt_gap_km), 2)} km`
                      : "—"}
                  </TableCell>
                  <TableCell className="ltr-embed text-xs text-muted-foreground">{origin.satellite}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <p className="mt-3 max-w-2xl text-[11px] leading-6 text-muted-foreground">
            فجوة المسار أطول امتداد غير محترق بين الموقع وأقرب حريق سابق. القيمتان
            الأوليان (O00 وO01) أقدم بؤرتين في الأرشيف، فلا رصد سابق يقاس عليه.
          </p>
        </section>
      </Reveal>

      <Reveal>
        <section id="patches" className="scroll-mt-20">
          <SectionLabel index="03">الندبات الكبرى</SectionLabel>
          <p className="mt-6 max-w-2xl text-[16px] leading-8">
            ندبات الحريق المستخرجة من فرق الانعكاسية dNBR في صور Sentinel-2 بين 18
            و28 أوت، مقصورة على ما تبلغ مساحته 100 هكتار فأكثر.
          </p>

          <DataFigure
            className="mt-10"
            sensor="Sentinel-2 · MSI L2A"
            meta="dNBR · 18 → 28.08.2026"
            caption="ترتيب الندبات بالمساحة بالكيلومتر المربّع. اللون يفصل ما مركزه داخل حدود ولاية جيجل عمّا يقع خارجها."
          >
            <PatchBarsChart patches={patches} />
          </DataFigure>

          <div className="mt-12 flex flex-wrap items-end gap-3 border-t border-rule bg-card px-3 py-3 sm:px-4">
            <label className="flex flex-col gap-1.5 text-[11px] text-muted-foreground">
              الموقع
              <Select value={patchLocation} onValueChange={setPatchLocation}>
                <SelectTrigger className="min-w-40 bg-background" aria-label="تصفية الندبات حسب الموقع">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>الموقع</SelectLabel>
                    <SelectItem value="all">كل المواقع</SelectItem>
                    <SelectItem value="in">داخل جيجل</SelectItem>
                    <SelectItem value="out">خارج جيجل</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </label>
            <p className="ms-auto text-xs text-muted-foreground">
              <span className="numeric">{formatNumber(filteredPatches.length)} / {formatNumber(patches.length)}</span> ندبة
            </p>
          </div>

          <Table className="min-w-[720px]">
            <TableHeader>
              <TableRow>
                <SortableHead label="المعرف" active={patchSort === "patch_id"} descending={patchDescending} onClick={() => sortPatches("patch_id")} />
                <SortableHead label="المساحة" active={patchSort === "area_km2"} descending={patchDescending} onClick={() => sortPatches("area_km2")} />
                <TableHead>الموقع</TableHead>
                <SortableHead label="أول رصد" active={patchSort === "first_det_local"} descending={patchDescending} onClick={() => sortPatches("first_det_local")} />
                <SortableHead label="الامتداد" active={patchSort === "max_extent_km"} descending={patchDescending} onClick={() => sortPatches("max_extent_km")} />
                <SortableHead label="رصدات داخلها" active={patchSort === "n_detections_inside"} descending={patchDescending} onClick={() => sortPatches("n_detections_inside")} />
                <SortableHead label="dNBR" active={patchSort === "mean_dnbr"} descending={patchDescending} onClick={() => sortPatches("mean_dnbr")} />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPatches.map((patch) => (
                <TableRow key={patch.patch_id}>
                  <TableCell className="numeric text-xs font-medium">{patch.patch_id}</TableCell>
                  <TableCell className="numeric text-xs">{formatNumber(number(patch.area_km2), 2)} km²</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {patch.centroid_in_jijel === "True" ? "داخل جيجل" : "خارج جيجل"}
                  </TableCell>
                  <TableCell className={patch.first_det_local ? "numeric text-xs" : "text-xs text-muted-foreground"}>{localDate(patch.first_det_local)}</TableCell>
                  <TableCell className="numeric text-xs">{formatNumber(number(patch.max_extent_km), 2)} km</TableCell>
                  <TableCell className="numeric text-xs">{formatNumber(number(patch.n_detections_inside))}</TableCell>
                  <TableCell className="numeric text-xs">{formatNumber(number(patch.mean_dnbr), 3)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </section>
      </Reveal>

      {children}

      <Reveal>
        <section id="downloads" className="scroll-mt-20">
          <SectionLabel index="07">التنزيلات</SectionLabel>
          <EdgePanel className="mt-8" label="نطاق النشر">
            <p className="max-w-2xl text-sm leading-7 text-muted-foreground">
              التنزيلات تشمل البيانات المعالجة التي استند إليها العرض، لا الملفات الخام الثقيلة. تحمل كل مادة بصمتها في فهرس التنزيلات للتحقق من السلامة.
            </p>
          </EdgePanel>
          {bundle ? (
            <div className="mt-8 border-y-2 border-rule">
              <DownloadLink artifact={bundle} bundled />
            </div>
          ) : null}
          <div className="mt-6 divide-y divide-border border-b border-border">
            {individualDownloads.map((artifact) => <DownloadLink key={artifact.path} artifact={artifact} />)}
          </div>
          <div className="mt-6 flex justify-end">
            <Button asChild variant="outline" size="sm">
              <a href="/generated/downloads.json" download>
                <DownloadIcon data-icon="inline-start" />
                فهرس التنزيلات
              </a>
            </Button>
          </div>
        </section>
      </Reveal>
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
        className="inline-flex items-center gap-1.5 text-start hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
        aria-label={`فرز حسب ${label}${active ? (descending ? " تنازلياً" : " تصاعدياً") : ""}`}
      >
        {label}
        <ArrowDownUpIcon aria-hidden="true" className={active ? "size-3.5 text-signal-ink" : "size-3.5 text-muted-foreground"} />
      </button>
    </TableHead>
  );
}
