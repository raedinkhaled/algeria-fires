"use client";

import { Bar, BarChart, CartesianGrid, Cell, Scatter, ScatterChart, XAxis, YAxis } from "recharts";

import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
} from "@/components/ui/chart";

/*
 * رسوم مستكشف البيانات: نقاط مرشّحي المنشأ عبر الزمن، وترتيب الندبات بالمساحة.
 * الانضباط أحادي اللون نفسه — الرمادي للعلامات، والشكل (مفرّغ/ممتلئ) يحمل
 * فرق النهار والليل بدل لون إضافي. لا حركة على القيم العلمية.
 */

const INK = "var(--foreground)"; // للمواقع داخل جيجل
const GREY = "var(--muted-foreground)"; // رمادي، للمواقع خارج جيجل

function parseDayValue(firstLocal: string): number | null {
  const match = firstLocal.match(/2026-08-(\d\d)[ T](\d\d):(\d\d)/);
  if (!match) return null;
  const [, day, hour, minute] = match;
  return Number(day) + (Number(hour) * 60 + Number(minute)) / 1440;
}

function dayTick(value: number) {
  return `${Math.round(value)} أوت`;
}

export type OriginPoint = {
  origin_id: string;
  first_local: string;
  frp_mw: string;
  elevation_m: string;
  daynight: string;
  wilaya: string;
  locality: string;
  largest_unburnt_gap_km: string;
};

type PreparedOrigin = {
  origin_id: string;
  day: number;
  elevation: number;
  frp: number;
  night: boolean;
  inJijel: boolean;
  place: string;
  dateLabel: string;
  gap: string;
};

const originConfig = {
  inside: { label: "داخل جيجل" },
  outside: { label: "خارج جيجل" },
} satisfies ChartConfig;

function originRadius(frp: number) {
  return 3.5 + Math.sqrt(Math.max(frp, 0)) * 0.7;
}

type DotProps = {
  cx?: number;
  cy?: number;
  payload?: PreparedOrigin;
};

function OriginDot({ cx, cy, payload }: DotProps) {
  if (cx == null || cy == null || !payload) return <g />;
  const color = payload.inJijel ? INK : GREY;
  return (
    <circle
      cx={cx}
      cy={cy}
      r={originRadius(payload.frp)}
      fill={payload.night ? "transparent" : color}
      stroke={color}
      strokeWidth={1.5}
    />
  );
}

function OriginTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: PreparedOrigin }[];
}) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload;
  return (
    <div
      dir="rtl"
      className="min-w-44 rounded-lg border border-border/50 bg-background px-2.5 py-2 text-xs shadow-xl"
    >
      <p className="font-medium">
        <span className="ltr-embed">{point.origin_id}</span>
        <span className="text-muted-foreground"> · {point.place}</span>
      </p>
      <dl className="mt-1.5 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-muted-foreground">
        <dt>أول رصد</dt>
        <dd className="text-end text-foreground">
          <span className="numeric">{point.dateLabel}</span>
          {point.night ? " · ليلاً" : ""}
        </dd>
        <dt>قوة الإشعاع</dt>
        <dd className="text-end text-foreground">
          <span className="numeric">{point.frp} MW</span>
        </dd>
        <dt>ارتفاع الموقع</dt>
        <dd className="text-end text-foreground">
          <span className="numeric">{point.elevation} m</span>
        </dd>
        {point.gap ? (
          <>
            <dt>فجوة المسار</dt>
            <dd className="text-end text-foreground">
              <span className="numeric">{point.gap} km</span>
            </dd>
          </>
        ) : null}
      </dl>
    </div>
  );
}

export function OriginScatterChart({ origins }: { origins: OriginPoint[] }) {
  const points = origins
    .map((origin): PreparedOrigin | null => {
      const day = parseDayValue(origin.first_local);
      if (day == null) return null;
      return {
        origin_id: origin.origin_id,
        day,
        elevation: Math.round(Number(origin.elevation_m || 0)),
        frp: Number(origin.frp_mw || 0),
        night: origin.daynight === "N",
        inJijel: origin.wilaya === "جيجل",
        place: origin.locality || origin.wilaya,
        dateLabel: origin.first_local.replace("2026-", "").replace(" ", " · "),
        gap: origin.largest_unburnt_gap_km
          ? Number(origin.largest_unburnt_gap_km).toFixed(2)
          : "",
      };
    })
    .filter((point): point is PreparedOrigin => point !== null);

  const inside = points.filter((point) => point.inJijel);
  const outside = points.filter((point) => !point.inJijel);
  const nightCount = points.filter((point) => point.night).length;

  return (
    <div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 border-b px-3 py-2.5 text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span
            aria-hidden="true"
            className="inline-block size-2.5 rounded-full"
            style={{ background: INK }}
          />
          داخل جيجل
        </span>
        <span className="flex items-center gap-1.5">
          <span
            aria-hidden="true"
            className="inline-block size-2.5 rounded-full"
            style={{ background: GREY }}
          />
          خارج جيجل
        </span>
        <span className="flex items-center gap-1.5">
          <span
            aria-hidden="true"
            className="inline-block size-2.5 rounded-full border-[1.5px] border-muted-foreground"
          />
          أول رصد ليلاً
        </span>
        <span className="ms-auto">حجم النقطة يتبع قوة الإشعاع الحراري</span>
      </div>

      <ChartContainer
        config={originConfig}
        dir="ltr"
        className="aspect-auto h-72 w-full px-2 pb-2 pt-5 sm:px-4"
      >
        <ScatterChart margin={{ top: 8, right: 16, bottom: 4, left: 4 }}>
          <CartesianGrid vertical={false} />
          <XAxis
            type="number"
            dataKey="day"
            domain={[22.8, 27.6]}
            ticks={[23, 24, 25, 26, 27]}
            tickFormatter={dayTick}
            tickLine={false}
            axisLine={false}
            tickMargin={10}
          />
          <YAxis
            type="number"
            dataKey="elevation"
            domain={[0, 1200]}
            ticks={[0, 300, 600, 900, 1200]}
            tickFormatter={(value) => Number(value).toLocaleString("en")}
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            width={44}
          />
          <ChartTooltip
            cursor={{ strokeDasharray: "3 3", stroke: "var(--border)" }}
            content={<OriginTooltip />}
          />
          <Scatter name="outside" data={outside} shape={<OriginDot />} isAnimationActive={false} />
          <Scatter name="inside" data={inside} shape={<OriginDot />} isAnimationActive={false} />
        </ScatterChart>
      </ChartContainer>

      <p className="border-t px-3 py-2 text-[11px] leading-5 text-muted-foreground">
        {origins.length} مرشحاً، {inside.length} داخل جيجل، و{nightCount} أول رصدها
        ليلاً. الموضع الأفقي وقت أول رصد قمري لا لحظة الاشتعال.
      </p>
    </div>
  );
}

export type PatchPoint = {
  patch_id: string;
  area_km2: string;
  mean_dnbr: string;
  max_extent_km: string;
  centroid_in_jijel: string;
};

const patchConfig = {
  area: { label: "المساحة" },
} satisfies ChartConfig;

function PatchTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: { patch_id: string; area: number; dnbr: string; extent: string; inJijel: boolean } }[];
}) {
  if (!active || !payload?.length) return null;
  const patch = payload[0].payload;
  return (
    <div
      dir="rtl"
      className="min-w-44 rounded-lg border border-border/50 bg-background px-2.5 py-2 text-xs shadow-xl"
    >
      <p className="font-medium">
        <span className="ltr-embed">{patch.patch_id}</span>
        <span className="text-muted-foreground">
          {" · "}
          {patch.inJijel ? "داخل جيجل" : "خارج جيجل"}
        </span>
      </p>
      <dl className="mt-1.5 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-muted-foreground">
        <dt>المساحة</dt>
        <dd className="text-end text-foreground">
          <span className="numeric">{patch.area.toFixed(2)} km²</span>
        </dd>
        <dt>الامتداد الأقصى</dt>
        <dd className="text-end text-foreground">
          <span className="numeric">{patch.extent} km</span>
        </dd>
        <dt>dNBR المتوسط</dt>
        <dd className="text-end text-foreground">
          <span className="numeric">{patch.dnbr}</span>
        </dd>
      </dl>
    </div>
  );
}

export function PatchBarsChart({ patches }: { patches: PatchPoint[] }) {
  const rows = patches
    .map((patch) => ({
      patch_id: patch.patch_id,
      area: Number(patch.area_km2 || 0),
      dnbr: Number(patch.mean_dnbr || 0).toFixed(3),
      extent: Number(patch.max_extent_km || 0).toFixed(2),
      inJijel: patch.centroid_in_jijel === "True",
    }))
    .sort((left, right) => right.area - left.area);

  const insideArea = rows
    .filter((row) => row.inJijel)
    .reduce((sum, row) => sum + row.area, 0);
  const totalArea = rows.reduce((sum, row) => sum + row.area, 0);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 border-b px-3 py-2.5 text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span
            aria-hidden="true"
            className="inline-block h-2.5 w-3 bg-foreground"
          />
          داخل جيجل
        </span>
        <span className="flex items-center gap-1.5">
          <span
            aria-hidden="true"
            className="inline-block h-2.5 w-3 bg-muted-foreground"
          />
          خارج جيجل
        </span>
        <span className="ms-auto">
          <span className="numeric">
            {Math.round((insideArea / totalArea) * 100)}٪
          </span>{" "}
          من المساحة داخل جيجل
        </span>
      </div>

      <ChartContainer
        config={patchConfig}
        dir="ltr"
        className="aspect-auto h-[26rem] w-full px-2 pb-2 pt-4 sm:px-4"
      >
        <BarChart
          layout="vertical"
          data={rows}
          margin={{ top: 4, right: 16, bottom: 4, left: 8 }}
        >
          <CartesianGrid horizontal={false} />
          <XAxis
            type="number"
            domain={[0, 420]}
            ticks={[0, 100, 200, 300, 400]}
            tickFormatter={(value) => Number(value).toLocaleString("en")}
            tickLine={false}
            axisLine={false}
            tickMargin={8}
          />
          <YAxis
            type="category"
            dataKey="patch_id"
            tickLine={false}
            axisLine={false}
            tickMargin={6}
            width={40}
          />
          <ChartTooltip
            cursor={{ fill: "var(--muted)", opacity: 0.55 }}
            content={<PatchTooltip />}
          />
          <Bar dataKey="area" radius={[0, 2, 2, 0]} isAnimationActive={false}>
            {rows.map((row) => (
              <Cell
                key={row.patch_id}
                fill={row.inJijel ? "var(--foreground)" : "var(--muted-foreground)"}
              />
            ))}
          </Bar>
        </BarChart>
      </ChartContainer>

      <p className="border-t px-3 py-2 text-[11px] leading-5 text-muted-foreground">
        17 ندبة تتجاوز 100 هكتار. ندبة الشقفة الكبرى وحدها نحو 400 كم²، أي أكثر من
        نصف المساحة المخطّطة.
      </p>
    </div>
  );
}
