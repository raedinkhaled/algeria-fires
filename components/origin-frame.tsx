import Image from "next/image";

import type { PublishedFigure } from "@/lib/figures";
import {
  frameWidthMeters,
  framePosition,
  insideAnalysisWindow,
} from "@/lib/sentinel-frame";
import { cn } from "@/lib/utils";

/**
 * مشهد Sentinel-2 بعد الحريق، وعليه مواضع أول رصد لكل بداية محتملة داخل
 * نافذة التحليل. الموضع محسوب من الإحداثيات المنشورة بإسقاط UTM 31N نفسه الذي
 * قُرئت به الصورة (lib/sentinel-frame.ts)؛ لا حدود ولا مسارات مرسومة.
 */

export type FrameOrigin = {
  origin_id: string;
  first_local: string;
  lat: string;
  lon: string;
  wilaya: string;
  daira: string;
  locality: string;
};

const SCALE_KM = 10;

function shortDate(local: string) {
  const [date, time] = local.split(" ");
  const [, month, day] = date.split("-");
  return `${day}.${month} · ${time}`;
}

export function OriginFrame({
  image,
  origins,
  priority = false,
  className,
}: {
  image: PublishedFigure;
  origins: FrameOrigin[];
  priority?: boolean;
  className?: string;
}) {
  const placed = origins
    .map((origin) => {
      const lat = Number(origin.lat);
      const lon = Number(origin.lon);
      return {
        ...origin,
        inside: insideAnalysisWindow(lat, lon),
        ...framePosition(lat, lon),
      };
    })
    .sort((first, second) => first.first_local.localeCompare(second.first_local));
  const inside = placed.filter((origin) => origin.inside);
  const scaleWidth = ((SCALE_KM * 1000) / frameWidthMeters) * 100;

  return (
    <figure className={cn("data-figure min-w-0", className)}>
      <div className="flex min-h-9 flex-wrap items-center justify-between gap-x-4 gap-y-1 border-t border-rule py-2 text-[11px]">
        <p className="ltr-embed flex min-w-0 items-center gap-2">
          <span className="font-medium">{image.sensor}</span>
          <span aria-hidden="true" className="text-muted-foreground">
            ·
          </span>
          <span className="text-muted-foreground">28.08.2026 · UTM 31N</span>
        </p>
        <p className="flex items-center gap-2 text-muted-foreground">
          <span
            aria-hidden="true"
            className="size-2.5 border-[1.5px] border-foreground bg-signal"
          />
          موضع أول رصد لبداية محتملة
        </p>
      </div>

      <div dir="ltr" className="relative overflow-hidden border border-border bg-card">
        <Image
          src={image.path}
          alt={`${image.title}: ${image.caption}`}
          width={image.width}
          height={image.height}
          sizes="(min-width: 1280px) 1216px, 100vw"
          preload={priority}
          className="block h-auto w-full"
        />

        <ol aria-hidden="true">
          {inside.map((origin) => (
            <li
              key={origin.origin_id}
              className="absolute"
              style={{ left: `${origin.left}%`, top: `${origin.top}%` }}
            >
              <span className="absolute size-2 -translate-x-1/2 -translate-y-1/2 border border-white bg-signal shadow-[0_0_0_1px_rgb(0_0_0/0.55)] sm:size-3 sm:border-[1.5px]" />
              <span
                className={cn(
                  "numeric absolute top-0 hidden -translate-y-1/2 whitespace-nowrap bg-black/75 px-1 text-[10px] leading-4 text-white sm:block",
                  origin.left > 88 ? "right-2.5" : "left-2.5",
                )}
              >
                {origin.origin_id}
              </span>
            </li>
          ))}
        </ol>

        <div className="pointer-events-none absolute start-3 top-3 flex flex-col items-center bg-black/70 px-1.5 py-1 text-white">
          <span aria-hidden="true" className="text-[11px] leading-3">
            ↑
          </span>
          <span className="numeric text-[10px] leading-3">N</span>
        </div>

        <div
          className="pointer-events-none absolute bottom-3 end-3 bg-black/70 px-2 pb-1 pt-1.5 text-white"
          style={{ width: `calc(${scaleWidth}% + 1rem)` }}
        >
          <div aria-hidden="true" className="h-1.5 border-x border-b border-white" />
          <span className="numeric mt-0.5 block text-[10px] leading-3">{SCALE_KM} km</span>
        </div>
      </div>

      <figcaption className="pt-3 text-[13px] leading-7 text-muted-foreground">
        <div className="grid gap-x-6 gap-y-1 sm:grid-cols-[4rem_minmax(0,1fr)]">
          <span className="text-[11px] font-medium leading-7 text-foreground">
            شكل <span className="numeric figure-index" />
          </span>
          <p>
            {image.title}، وعليه أول موضع رآه قمر قطبي لكل بداية محتملة. داخل
            إطار التحليل{" "}
            <span className="numeric text-foreground">{inside.length}</span> من{" "}
            <span className="numeric text-foreground">{placed.length}</span>. الموضع
            أول رصد لا نقطة اشتعال مؤكدة، والمقياس محسوب من شبكة الصورة (20 م).
          </p>
        </div>

        <ol className="mt-4 grid grid-cols-2 gap-x-6 border-t border-border sm:grid-cols-3 lg:grid-cols-4">
          {placed.map((origin) => (
            <li
              key={origin.origin_id}
              className="flex items-baseline gap-2.5 border-b border-border py-2 text-[12px] leading-5"
            >
              <span
                className={cn(
                  "numeric shrink-0 text-[11px]",
                  origin.inside ? "text-signal-ink" : "text-muted-foreground",
                )}
              >
                {origin.origin_id}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-foreground">
                  {origin.locality || origin.daira}
                </span>
                <span className="block text-[11px]">
                  <span className="numeric">{shortDate(origin.first_local)}</span>
                  {origin.inside ? null : <span> · خارج الإطار</span>}
                </span>
              </span>
            </li>
          ))}
        </ol>
      </figcaption>
    </figure>
  );
}
