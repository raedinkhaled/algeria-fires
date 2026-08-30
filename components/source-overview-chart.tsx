"use client";

import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { SourceFamily } from "@/lib/source-register";

const familyColors: Record<SourceFamily, string> = {
  DS: "var(--info)",
  OF: "var(--ok)",
  MD: "var(--support)",
  ME: "var(--warn)",
};

const chartConfig = {
  count: { label: "عدد السجلات", color: "var(--foreground)" },
} satisfies ChartConfig;

export function SourceOverviewChart({
  data,
}: {
  data: { family: SourceFamily; label: string; count: number }[];
}) {
  return (
    <ChartContainer
      config={chartConfig}
      className="h-[220px] w-full aspect-auto"
      initialDimension={{ width: 640, height: 220 }}
      dir="ltr"
    >
      <BarChart data={data} margin={{ top: 16, right: 8, bottom: 4, left: 0 }}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={false}
          tickMargin={10}
          tick={{ fontFamily: "var(--font-sans)", textAnchor: "middle" }}
        />
        <YAxis
          allowDecimals={false}
          width={28}
          tickLine={false}
          axisLine={false}
          tickMargin={6}
        />
        <ChartTooltip
          cursor={false}
          content={
            <ChartTooltipContent
              dir="rtl"
              hideLabel
              formatter={(value, _name, item) => (
                <div className="flex min-w-32 items-center justify-between gap-4">
                  <span className="text-muted-foreground">
                    {item.payload.label}
                  </span>
                  <span className="numeric font-medium text-foreground">
                    {String(value)}
                  </span>
                </div>
              )}
            />
          }
        />
        <Bar dataKey="count" radius={0} isAnimationActive={false}>
          {data.map((entry) => (
            <Cell key={entry.family} fill={familyColors[entry.family]} />
          ))}
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}
