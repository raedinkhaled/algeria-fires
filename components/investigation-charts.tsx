"use client";

import { useState } from "react";
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
} from "recharts";

import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

export type DailyActivity = {
  date: string;
  detections: number;
  detections_in_province: number;
  grid_cells_first_seen: number;
  origin_candidates: number;
  night_detections: number;
  frp_sum_mw: number;
  frp_max_mw: number;
  burn_area_first_seen_km2: number;
  temp_max_c: number | null;
  rh_min_pct: number | null;
  gust_max_kmh: number | null;
  precip_sum_mm: number | null;
};

type Metric = "activity" | "energy" | "weather";

const chartConfig = {
  detections: { label: "الرصد الحراري", color: "var(--chart-1)" },
  grid_cells_first_seen: { label: "الخلايا الجديدة", color: "var(--chart-3)" },
  frp_sum_mw: { label: "مجموع FRP", color: "var(--support)" },
  temp_max_c: { label: "أقصى حرارة", color: "var(--warn)" },
  rh_min_pct: { label: "أدنى رطوبة", color: "var(--info)" },
} satisfies ChartConfig;

function dayLabel(date: string) {
  return `${Number(date.slice(-2))} أوت`;
}

export function DailyActivityChart({ days }: { days: DailyActivity[] }) {
  const [metric, setMetric] = useState<Metric>("activity");

  return (
    <div>
      <div className="flex flex-col gap-3 border-b px-3 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-medium">النشاط اليومي المرصود</p>
          <p className="mt-1 text-[11px] text-muted-foreground">
            القيم مجمّعة حسب التوقيت المحلي في الجزائر
          </p>
        </div>
        <Tabs
          value={metric}
          onValueChange={(value) => setMetric(value as Metric)}
          className="w-full sm:w-auto"
        >
          <TabsList variant="line" className="w-full border-b sm:w-auto">
            <TabsTrigger value="activity">الرصد</TabsTrigger>
            <TabsTrigger value="energy">الطاقة</TabsTrigger>
            <TabsTrigger value="weather">الطقس</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <ChartContainer
        config={chartConfig}
        dir="ltr"
        className="aspect-auto h-72 w-full px-2 pb-2 pt-5 sm:px-4"
      >
        <ComposedChart
          data={days}
          accessibilityLayer
          margin={{ top: 8, right: 12, bottom: 0, left: 4 }}
        >
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="date"
            tickLine={false}
            axisLine={false}
            tickMargin={10}
            tickFormatter={dayLabel}
          />
          <YAxis
            yAxisId="primary"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            width={52}
            tickFormatter={(value) => Number(value).toLocaleString("en")}
          />
          {metric === "weather" ? (
            <YAxis
              yAxisId="secondary"
              orientation="right"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              width={38}
              domain={[0, 100]}
              tickFormatter={(value) => `${value}%`}
            />
          ) : null}
          <ChartTooltip
            cursor={{ fill: "var(--muted)", opacity: 0.55 }}
            content={
              <ChartTooltipContent
                labelFormatter={(_, payload) =>
                  payload[0]?.payload?.date
                    ? dayLabel(String(payload[0].payload.date))
                    : ""
                }
                formatter={(value, name) => {
                  const key = String(name) as keyof typeof chartConfig;
                  const suffix =
                    key === "frp_sum_mw"
                      ? " MW"
                      : key === "temp_max_c"
                        ? "°م"
                        : key === "rh_min_pct"
                          ? "٪"
                          : "";
                  return (
                    <div className="flex min-w-40 items-center justify-between gap-4">
                      <span className="text-muted-foreground">
                        {chartConfig[key]?.label ?? key}
                      </span>
                      <span className="numeric font-medium text-foreground">
                        {Number(value).toLocaleString("en")}
                        {suffix}
                      </span>
                    </div>
                  );
                }}
              />
            }
          />

          {metric === "activity" ? (
            <>
              <Bar
                yAxisId="primary"
                dataKey="detections"
                fill="var(--color-detections)"
                radius={[2, 2, 0, 0]}
                isAnimationActive={false}
              />
              <Line
                yAxisId="primary"
                dataKey="grid_cells_first_seen"
                stroke="var(--color-grid_cells_first_seen)"
                strokeWidth={2}
                dot={{ r: 2.5 }}
                activeDot={{ r: 4 }}
                isAnimationActive={false}
              />
            </>
          ) : null}

          {metric === "energy" ? (
            <Bar
              yAxisId="primary"
              dataKey="frp_sum_mw"
              fill="var(--color-frp_sum_mw)"
              radius={[2, 2, 0, 0]}
              isAnimationActive={false}
            />
          ) : null}

          {metric === "weather" ? (
            <>
              <Line
                yAxisId="primary"
                dataKey="temp_max_c"
                stroke="var(--color-temp_max_c)"
                strokeWidth={2}
                dot={{ r: 2.5 }}
                activeDot={{ r: 4 }}
                isAnimationActive={false}
              />
              <Line
                yAxisId="secondary"
                dataKey="rh_min_pct"
                stroke="var(--color-rh_min_pct)"
                strokeWidth={2}
                strokeDasharray="4 3"
                dot={{ r: 2.5 }}
                activeDot={{ r: 4 }}
                isAnimationActive={false}
              />
            </>
          ) : null}
        </ComposedChart>
      </ChartContainer>

      <div className="grid gap-px border-t bg-border sm:grid-cols-3">
        <p className="bg-card px-3 py-2 text-[11px] leading-5 text-muted-foreground">
          الأعمدة: الرصدات أو مجموع قوة الإشعاع الحراري
        </p>
        <p className="bg-card px-3 py-2 text-[11px] leading-5 text-muted-foreground">
          الخط المتصل: خلايا جديدة أو أقصى حرارة
        </p>
        <p className="bg-card px-3 py-2 text-[11px] leading-5 text-muted-foreground">
          الخط المتقطع: أدنى رطوبة عند الشقفة
        </p>
      </div>
    </div>
  );
}
