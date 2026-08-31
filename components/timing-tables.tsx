import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

/**
 * جداول قياس التوقيت من القمر الثابت MSG/SEVIRI. تستعملها صفحة التسلسل الزمني
 * وصفحة البيانات معاً، فتبقى الأرقام والتسميات من مصدر واحد. عرضية بلا حالة.
 */

/* ── سجل نوافذ الاشتعال: ما ضيّقه القمر الثابت وما بقي مجهولاً ── */
export type IgnitionWindow = {
  origin_id: string;
  locality: string | null;
  daira: string | null;
  wilaya: string | null;
  first_detection_local: string | null;
  last_clear_local: string | null;
  polar_blind_window_h: number | null;
  geo_blind_window_min: number | null;
  peak_frp_1h_mw: number | null;
  quality: string;
};

const QUALITY: Record<
  string,
  { label: string; note: string; dot: string }
> = {
  clean: {
    label: "نعرف وقت البداية",
    note: "رأى القمر الموقع بلا نار، ثم رآه يحترق في الصورة التالية",
    dot: "bg-ok",
  },
  dim: {
    label: "رآها القمر أولاً",
    note: "رآها القمر الثابت قبل القمر القطبي، لكن لا نستطيع تحديد وقت بدايتها",
    dot: "bg-warn",
  },
  "msg-blind": {
    label: "لم يرها القمر الثابت",
    note: "كانت أضعف من قدرة القمر على الرصد، لذلك بقي وقت بدايتها غير معروف",
    dot: "bg-muted-foreground",
  },
};

function placeName(row: IgnitionWindow) {
  return row.locality ?? row.daira ?? "—";
}

function windowLabel(row: IgnitionWindow) {
  if (row.geo_blind_window_min !== null && row.quality === "clean") {
    return `${row.geo_blind_window_min} دقيقة`;
  }
  if (row.polar_blind_window_h !== null) {
    return row.polar_blind_window_h >= 24
      ? `${Math.round(row.polar_blind_window_h / 24)} يوم`
      : `${row.polar_blind_window_h} ساعة`;
  }
  return "—";
}

export function IgnitionWindowTable({ rows }: { rows: IgnitionWindow[] }) {
  return (
    <div className="border">
      <Table className="min-w-[46rem] text-sm">
        <TableHeader className="bg-muted/40">
          <TableRow>
            <TableHead className="w-[5rem]">نقطة البداية</TableHead>
            <TableHead>الموقع</TableHead>
            <TableHead>آخر صورة بلا نار</TableHead>
            <TableHead>أول صورة للنار</TableHead>
            <TableHead>الفترة غير المعروفة</TableHead>
            <TableHead>ما نعرفه عن البداية</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => {
            const quality = QUALITY[row.quality] ?? QUALITY["msg-blind"];
            const solved = row.quality === "clean";
            return (
              <TableRow key={row.origin_id}>
                <TableCell className="ltr-embed font-medium">
                  {row.origin_id}
                </TableCell>
                <TableCell className="whitespace-normal">
                  {placeName(row)}
                  {row.wilaya ? (
                    <span className="ms-2 text-[11px] text-muted-foreground">
                      {row.wilaya}
                    </span>
                  ) : null}
                </TableCell>
                <TableCell className="numeric text-muted-foreground">
                  {solved ? (row.last_clear_local ?? "—") : "—"}
                </TableCell>
                <TableCell className="numeric">
                  {row.first_detection_local ?? "—"}
                </TableCell>
                <TableCell className={cn("numeric", solved && "font-medium")}>
                  {windowLabel(row)}
                </TableCell>
                <TableCell className="whitespace-normal">
                  <span className="flex items-center gap-1.5">
                    <span
                      aria-hidden="true"
                      className={cn(
                        "inline-block size-1.5 shrink-0 rounded-full",
                        quality.dot,
                      )}
                    />
                    {quality.label}
                  </span>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

export function QualityLegend() {
  return (
    <dl className="mt-3 grid gap-px border bg-border sm:grid-cols-3">
      {Object.values(QUALITY).map((quality) => (
        <div key={quality.label} className="bg-card px-3 py-2.5">
          <dt className="flex items-center gap-1.5 text-[11px] font-medium">
            <span
              aria-hidden="true"
              className={cn("inline-block size-1.5 rounded-full", quality.dot)}
            />
            {quality.label}
          </dt>
          <dd className="mt-1 text-[11px] leading-5 text-muted-foreground">
            {quality.note}
          </dd>
        </div>
      ))}
    </dl>
  );
}

/* ── سجل الأزواج المتقاربة: المسافة واتجاه الريح بين كل بدايتين ── */
export type SimultaneousPair = {
  a_id: string;
  a_locality: string | null;
  a_wilaya: string | null;
  a_precision: string;
  b_id: string;
  b_locality: string | null;
  b_wilaya: string | null;
  b_precision: string;
  gap_min: number | null;
  separation_km: number | null;
  wind_from_compass: string;
  wind_kmh: number | null;
  gust_kmh: number | null;
  angle_wind_vs_bearing: number | null;
  geometry: string;
  two_sources: boolean;
  resolved: boolean;
};

const GEOMETRY: Record<string, string> = {
  upwind: "أعلى الريح",
  crosswind: "عرض الريح",
  downwind: "أسفل الريح",
};

export function windGeometryLabel(geometry: string) {
  return GEOMETRY[geometry] ?? geometry;
}

export function SimultaneousPairsTable({ rows }: { rows: SimultaneousPair[] }) {
  return (
    <div className="border">
      <Table className="min-w-[52rem] text-sm">
        <TableHeader className="bg-muted/40">
          <TableRow>
            <TableHead className="w-[9rem]">النقطتان</TableHead>
            <TableHead>فرق الوقت</TableHead>
            <TableHead>هل نعرف الوقت؟</TableHead>
            <TableHead>المسافة</TableHead>
            <TableHead>الريح</TableHead>
            <TableHead>موقعهما بالنسبة للريح</TableHead>
            <TableHead>ما تعنيه المقارنة</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={`${row.a_id}-${row.b_id}`}>
              <TableCell className="whitespace-normal">
                <span className="ltr-embed font-medium">
                  {row.a_id} → {row.b_id}
                </span>
                <span className="mt-0.5 block text-[11px] text-muted-foreground">
                  {row.a_locality} ← {row.b_locality}
                </span>
              </TableCell>
              <TableCell className="whitespace-nowrap">
                <span className="numeric">{row.gap_min}</span> د
              </TableCell>
              <TableCell className="whitespace-normal">
                <span className="flex items-center gap-1.5">
                  <span
                    aria-hidden="true"
                    className={cn(
                      "inline-block size-1.5 shrink-0 rounded-full",
                      row.resolved ? "bg-ok" : "bg-muted-foreground",
                    )}
                  />
                  {row.resolved
                    ? "وقت البداية محدد خلال 15 دقيقة"
                    : "وقت البداية غير معروف بدقة"}
                </span>
              </TableCell>
              <TableCell className="whitespace-nowrap">
                <span className="numeric">{row.separation_km}</span> كم
              </TableCell>
              <TableCell className="whitespace-nowrap text-muted-foreground">
                <span className="ltr-embed">{row.wind_from_compass}</span>{" "}
                <span className="numeric">{row.wind_kmh}</span> كم/س
              </TableCell>
              <TableCell className="whitespace-normal">
                {windGeometryLabel(row.geometry)}
                <span className="ms-1.5 text-[11px] text-muted-foreground">
                  <span className="numeric">{row.angle_wind_vs_bearing}</span>°
                </span>
              </TableCell>
              <TableCell className="whitespace-normal">
                {row.two_sources
                  ? "مصدران على الأقل"
                  : "قد تكون النار انتقلت بالجمر"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
