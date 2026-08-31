"use client";

import { useMemo } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  XAxis,
  YAxis,
} from "recharts";

import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
} from "@/components/ui/chart";

/*
 * منحنى القدرة الإشعاعية كل 15 دقيقة من القمر الثابت MSG/SEVIRI.
 * القمر القطبي يمرّ مرّتين إلى أربع في اليوم، فمنحناه سلسلة نقاط متباعدة؛
 * هذا المنحنى متصل، وهو ما يجعل شكل الحدث نفسه مقروءاً.
 * الانضباط أحادي اللون: الحبر للمنحنى، والرمادي للبدايات التي حُدّد وقتها.
 */

const INK = "var(--foreground)";

export type FrpSlot = { t: string; n: number; frp: number };

export type IgnitionMark = {
  origin_id: string;
  /** آخر رصد صافٍ بالتوقيت المحلي: بداية النافذة التي وقع فيها الاشتعال. */
  at: string;
  place: string;
};

type Point = { x: number; frp: number; n: number; label: string };

/** يحوّل ت.ع.م إلى التوقيت المحلي (+1) ثم إلى موضع على محور الأيام. */
function toLocalPoint(utc: string) {
  const parsed = new Date(`${utc.replace(" ", "T")}Z`);
  parsed.setUTCHours(parsed.getUTCHours() + 1);
  const day = parsed.getUTCDate();
  const hour = parsed.getUTCHours();
  const minute = parsed.getUTCMinutes();
  return {
    x: day + (hour * 60 + minute) / 1440,
    label: `${String(day).padStart(2, "0")}.08 · ${String(hour).padStart(2, "0")}:${String(
      minute,
    ).padStart(2, "0")}`,
  };
}

function localStringToX(local: string) {
  const match = local.match(/-(\d\d)[ T](\d\d):(\d\d)/);
  if (!match) return null;
  const [, day, hour, minute] = match;
  return Number(day) + (Number(hour) * 60 + Number(minute)) / 1440;
}

function dayTick(value: number) {
  return `${Math.round(value)} أوت`;
}

const chartConfig = {
  frp: { label: "قوة النار التي رآها القمر" },
} satisfies ChartConfig;

function CurveTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: Point }[];
}) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload;
  return (
    <div
      dir="rtl"
      className="min-w-48 rounded-lg border border-border/50 bg-background px-2.5 py-2 text-xs shadow-xl"
    >
      <p className="numeric font-medium">{point.label}</p>
      <dl className="mt-1.5 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-muted-foreground">
        <dt>قوة النار في الصورة</dt>
        <dd className="text-end text-foreground">
          <span className="numeric">{point.frp.toLocaleString("en")} MW</span>
        </dd>
        <dt>نقاط النار في الصورة</dt>
        <dd className="text-end text-foreground">
          <span className="numeric">{point.n}</span>
        </dd>
      </dl>
    </div>
  );
}

export function EventCurve({
  slots,
  marks,
}: {
  slots: FrpSlot[];
  marks: IgnitionMark[];
}) {
  const points = useMemo<Point[]>(
    () =>
      slots.map((slot) => {
        const { x, label } = toLocalPoint(slot.t);
        return { x, frp: slot.frp, n: slot.n, label };
      }),
    [slots],
  );

  /* تُجمَع اللحظات المتقاربة في تسمية واحدة حتى لا تتراكم على محور مضغوط. */
  const clusters = useMemo(() => {
    const positioned = marks
      .map((mark) => ({ ...mark, x: localStringToX(mark.at) }))
      .filter((mark): mark is IgnitionMark & { x: number } => mark.x !== null)
      .sort((first, second) => first.x - second.x);

    return positioned.reduce<{ x: number; ids: string[] }[]>((groups, mark) => {
      const last = groups.at(-1);
      if (last && mark.x - last.x < 0.12) {
        last.ids.push(mark.origin_id);
        return groups;
      }
      groups.push({ x: mark.x, ids: [mark.origin_id] });
      return groups;
    }, []);
  }, [marks]);

  return (
    <div dir="rtl">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-b px-3 py-2.5 text-[11px] text-muted-foreground">
        <span>قوة النار التي رآها القمر في المنطقة، كل 15 دقيقة</span>
        <span className="ms-auto">
          العلامات الرأسية: بدايات حُدّد وقتها
        </span>
      </div>

      <ChartContainer
        config={chartConfig}
        dir="ltr"
        className="aspect-auto h-72 w-full px-2 pb-2 pt-6 sm:px-4"
      >
        <AreaChart
          data={points}
          margin={{ top: 8, right: 12, bottom: 4, left: 4 }}
        >
          <CartesianGrid vertical={false} />
          <XAxis
            type="number"
            dataKey="x"
            domain={[21, 30]}
            ticks={[21, 22, 23, 24, 25, 26, 27, 28, 29, 30]}
            tickFormatter={dayTick}
            tickLine={false}
            axisLine={false}
            tickMargin={10}
            minTickGap={8}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            width={52}
            tickFormatter={(value) => Number(value).toLocaleString("en")}
          />
          <ChartTooltip
            cursor={{ strokeDasharray: "3 3", stroke: "var(--border)" }}
            content={<CurveTooltip />}
          />

          {clusters.map((cluster) => (
            <ReferenceLine
              key={cluster.ids.join("-")}
              x={cluster.x}
              stroke="var(--muted-foreground)"
              strokeDasharray="3 3"
              label={{
                value: cluster.ids.join(" · "),
                position: "top",
                fill: "var(--muted-foreground)",
                fontSize: 9,
                fontFamily: "var(--font-mono)",
              }}
            />
          ))}

          <Area
            type="monotone"
            dataKey="frp"
            stroke={INK}
            strokeWidth={1.5}
            fill={INK}
            fillOpacity={0.1}
            dot={false}
            activeDot={{ r: 3 }}
            isAnimationActive={false}
          />
        </AreaChart>
      </ChartContainer>

      <p className="border-t px-3 py-2 text-[11px] leading-5 text-muted-foreground">
        لا يرى القمر الثابت هنا إلا الحرائق التي تتجاوز نحو 30–50 ميغاواط. لذلك
        لا يعني الخط عند الصفر أنه لا توجد نار، بل أنه لا توجد نار كبيرة. وهذه
        الأرقام تأتي من قمر مختلف عن الأقمار الأخرى في الموقع، فلا نقارنها
        ببعضها مباشرة.
      </p>
    </div>
  );
}
