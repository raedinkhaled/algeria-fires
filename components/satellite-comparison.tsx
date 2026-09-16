"use client";

import { useRef } from "react";
import Image from "next/image";

import { Slider } from "@/components/ui/slider";
import type { PublishedFigure } from "@/lib/figures";
import { cn } from "@/lib/utils";

/**
 * مقارنة المشهدين بالسحب: الصورتان بالإطار الجغرافي نفسه وأبعاد واحدة
 * (Fires/scripts/08_sentinel2.py)، فالقصّ وحده يكشف ما تغيّر. يحدّث المنزلق
 * القصّ مباشرة عبر المراجع بلا إعادة عرض مستمرة.
 */
export function SatelliteComparison({
  before,
  after,
  className,
}: {
  before: PublishedFigure;
  after: PublishedFigure;
  className?: string;
}) {
  const beforeLayer = useRef<HTMLDivElement>(null);
  const divider = useRef<HTMLDivElement>(null);

  function reveal([value]: number[]) {
    if (beforeLayer.current) beforeLayer.current.style.clipPath = `inset(0 ${100 - value}% 0 0)`;
    if (divider.current) divider.current.style.left = `${value}%`;
  }

  return (
    <figure className={cn("satellite-comparison data-figure min-w-0", className)}>
      <div className="flex min-h-9 flex-wrap items-center justify-between gap-x-4 gap-y-1 border-t border-rule py-2 text-[11px]">
        <p className="ltr-embed flex items-center gap-2">
          <span className="font-medium">{after.sensor}</span>
          <span aria-hidden="true" className="text-muted-foreground">·</span>
          <span className="text-muted-foreground">18.08 ↔ 28.08.2026</span>
        </p>
        <p className="text-muted-foreground">اسحب المؤشر للمقارنة</p>
      </div>

      <div className="relative overflow-hidden border border-border bg-card" dir="ltr">
        <Image
          src={after.path}
          alt={after.caption}
          width={after.width}
          height={after.height}
          sizes="(min-width: 1024px) 60rem, 100vw"
          className="block h-auto w-full"
        />
        <div
          ref={beforeLayer}
          className="absolute inset-0"
          style={{ clipPath: "inset(0 50% 0 0)" }}
        >
          <Image
            src={before.path}
            alt={before.caption}
            width={before.width}
            height={before.height}
            sizes="(min-width: 1024px) 60rem, 100vw"
            className="block h-auto w-full"
          />
        </div>
        <div
          ref={divider}
          aria-hidden="true"
          className="comparison-divider pointer-events-none absolute inset-y-0 -translate-x-px"
          style={{ left: "50%" }}
        />
        <span
          dir="rtl"
          className="pointer-events-none absolute left-3 top-3 bg-black/70 px-2 py-0.5 text-[11px] leading-5 text-white"
        >
          {before.title}
        </span>
        <span
          dir="rtl"
          className="pointer-events-none absolute right-3 top-3 bg-black/70 px-2 py-0.5 text-[11px] leading-5 text-white"
        >
          {after.title}
        </span>
      </div>

      <div className="flex items-center gap-4 border-x border-b border-border px-4 py-4 sm:px-5" dir="ltr">
        <span className="numeric text-[10.5px] text-muted-foreground">18.08</span>
        <Slider
          dir="ltr"
          defaultValue={[50]}
          min={0}
          max={100}
          step={1}
          onValueChange={reveal}
          aria-label="مقارنة الغطاء قبل الحريق وبعده"
          className="min-h-6 flex-1"
        />
        <span className="numeric text-[10.5px] text-muted-foreground">28.08</span>
      </div>

      <figcaption className="grid gap-x-6 gap-y-1 pt-3 text-[13px] leading-7 text-muted-foreground sm:grid-cols-[4rem_minmax(0,1fr)]">
        <span className="text-[11px] font-medium leading-7 text-foreground">
          شكل <span className="numeric figure-index" />
        </span>
        <div className="grid gap-2 sm:grid-cols-2 sm:gap-6">
          <p>{before.caption}</p>
          <p>{after.caption}</p>
        </div>
      </figcaption>
    </figure>
  );
}
