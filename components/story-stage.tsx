"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Image from "next/image";

import { cn } from "@/lib/utils";

/**
 * مسرح القصة: مشهد Sentinel-2 ثابت على الشاشة، والسرد يمرّ فوقه يوماً بيوم.
 * كل خطوة تُظهر البدايات المحتملة حتى يومها (بمواضعها المحسوبة من الإحداثيات
 * المنشورة) وتبرز بدايات اليوم نفسه، ثم ينتقل المشهد إلى خريطة شدّة الاحتراق
 * من الإطار نفسه. لا حركة على القيم؛ الانتقال تبديل حالة فقط.
 */

export type StoryOrigin = {
  id: string;
  left: number;
  top: number;
  day: number;
  place: string;
  time: string;
};

export type StoryStep = {
  key: string;
  date: string;
  title: string;
  body: string;
  /** أيام الخطوة من الشهر. */
  days: number[];
  /** البدايات التي يتحدث عنها نص الخطوة. */
  focus: string[];
  /** المشهد المعروض: قبل الحريق، بعده، أو شدّة الاحتراق. */
  layer: "pre" | "post" | "severity";
  emphasis?: boolean;
};

type Raster = { src: string; width: number; height: number; alt: string };

const RECORD_START_DAY = 21;
const RECORD_DAYS = 10;

export function StoryStage({
  steps,
  origins,
  pre,
  post,
  severity,
  detectionsByDay,
  record,
  outside,
}: {
  steps: StoryStep[];
  origins: StoryOrigin[];
  pre: Raster;
  post: Raster;
  severity: Raster;
  detectionsByDay: Record<number, number>;
  /** سجلّ الحرارة المصغّر، يُرسم على الخادم. */
  record: ReactNode;
  /** بدايات خارج إطار الصورة، تُذكر نصاً. */
  outside: StoryOrigin[];
}) {
  const [active, setActive] = useState(0);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const nodes = stepRefs.current.filter(Boolean) as HTMLDivElement[];
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActive(Number((entry.target as HTMLElement).dataset.step));
          }
        }
      },
      { rootMargin: "-48% 0px -48% 0px", threshold: 0 },
    );
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);

  const step = steps[active];
  const lastDay = Math.max(...step.days);
  const firstDay = Math.min(...step.days);
  const layers = { pre, post, severity };
  const shown = layers[step.layer];
  const layerLabel = {
    pre: { sensor: "Sentinel-2 · 18.08.2026", note: "قبل الحريق" },
    post: { sensor: "Sentinel-2 · 28.08.2026", note: "بعد الحريق" },
    severity: { sensor: "Sentinel-2 · dNBR", note: "شدة الاحتراق" },
  }[step.layer];
  const focusOutside = outside.filter((origin) => step.focus.includes(origin.id));

  return (
    <section
      aria-label="تطوّر الحرائق على مشهد Sentinel-2"
      className="dark story-stage relative bg-background text-foreground"
    >
      <div className="sticky top-16 h-[calc(100dvh-4rem)] overflow-hidden">
        <div className="absolute inset-0 flex flex-col px-4 pb-28 pt-4 sm:px-6 sm:pb-36 lg:pb-32 lg:pe-10 lg:ps-[31rem] lg:pt-10">
          <div className="flex items-end justify-between gap-4" dir="rtl">
            <div>
              <p className="text-[11px] text-muted-foreground">اليوم في المشهد</p>
              <p className="mt-1 flex items-baseline gap-3">
                <span className="figure-num text-[clamp(2.25rem,5vw,4rem)] font-light leading-none">
                  {firstDay === lastDay ? firstDay : `${firstDay}–${lastDay}`}
                </span>
                <span className="text-[15px] text-muted-foreground">أوت 2026</span>
              </p>
            </div>
            <dl className="text-end">
              <dt className="text-[11px] text-muted-foreground">رصد حراري في اليوم</dt>
              <dd className="figure-num mt-1 text-[clamp(1.25rem,2.4vw,1.75rem)] font-light leading-none text-signal">
                {step.days.map((day) => (detectionsByDay[day] ?? 0).toLocaleString("en")).join(" · ")}
              </dd>
            </dl>
          </div>

          <div className="relative mt-3 flex min-h-0 flex-1 items-start justify-center lg:mt-4 lg:items-center">
            <div
              dir="ltr"
              role="img"
              aria-label={`${shown.alt}. البدايات المحتملة المرصودة حتى ${lastDay} أوت.`}
              className="relative max-h-full w-full overflow-hidden border border-border"
              style={{
                aspectRatio: `${pre.width} / ${pre.height}`,
                maxWidth: `calc((100dvh - 17rem) * ${pre.width / pre.height})`,
              }}
            >
              {(["pre", "post", "severity"] as const).map((key) => (
                <Image
                  key={key}
                  src={layers[key].src}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 60vw, 100vw"
                  className={cn(
                    "object-cover transition-opacity duration-700",
                    step.layer === key ? "opacity-100" : "opacity-0",
                  )}
                />
              ))}

              {origins.map((origin) => {
                const reached = origin.day <= lastDay;
                const focused = step.focus.includes(origin.id);
                return (
                  <span
                    key={origin.id}
                    aria-hidden="true"
                    className={cn(
                      "absolute transition-opacity duration-500",
                      reached ? "opacity-100" : "opacity-0",
                    )}
                    style={{ left: `${origin.left}%`, top: `${origin.top}%` }}
                  >
                    {focused ? (
                      <span className="absolute size-9 -translate-x-1/2 -translate-y-1/2 border border-white/80 sm:size-12" />
                    ) : null}
                    <span
                      className={cn(
                        "absolute -translate-x-1/2 -translate-y-1/2 border border-white",
                        focused ? "size-3 bg-signal sm:size-3.5" : "size-2 bg-[#ffb38a] sm:size-2.5",
                      )}
                    />
                    <span
                      className={cn(
                        "numeric absolute top-0 -translate-y-1/2 whitespace-nowrap px-1 text-[10px] leading-4",
                        origin.left > 86 ? "right-3 sm:right-7" : "left-3 sm:left-7",
                        focused ? "bg-signal text-black" : "hidden bg-black/70 text-white sm:block",
                      )}
                    >
                      {origin.id}
                    </span>
                  </span>
                );
              })}

              <span className="pointer-events-none absolute left-2 top-2 flex items-center gap-2 bg-black/75 px-2 py-0.5 text-[10.5px] leading-5 text-white">
                <span className="numeric">{layerLabel.sensor}</span>
                <span dir="rtl">{layerLabel.note}</span>
              </span>
            </div>
          </div>
        </div>

        <div className="absolute inset-x-0 bottom-0 border-t border-border bg-background/90 px-4 pb-3 pt-2 backdrop-blur sm:px-6 lg:pe-10 lg:ps-[31rem]">
          <div className="flex items-center justify-between gap-4 pb-1 text-[11px] text-muted-foreground">
            <span>نبض الحدث · القمر الثابت كل 15 دقيقة</span>
            <span className="flex items-center gap-2">
              <span aria-hidden="true" className="size-2 bg-signal" />
              <span className="hidden sm:inline">بدايات اليوم المعروض</span>
            </span>
          </div>
          <div className="relative" dir="ltr">
            {record}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 border-x border-white/60 bg-white/10 transition-[left,width] duration-500"
              style={{
                left: `${((firstDay - RECORD_START_DAY) / RECORD_DAYS) * 100}%`,
                width: `${((lastDay - firstDay + 1) / RECORD_DAYS) * 100}%`,
              }}
            />
          </div>
        </div>
      </div>

      <div className="relative z-10 -mt-[calc(100dvh-4rem)]">
        {steps.map((item, index) => (
          <div
            key={item.key}
            ref={(node) => {
              stepRefs.current[index] = node;
            }}
            data-step={index}
            className="flex min-h-[100dvh] items-end px-4 pb-32 sm:px-6 sm:pb-40 lg:w-[31rem] lg:items-center lg:pb-0 lg:ps-10"
          >
            <article
              className={cn(
                "w-full max-w-md border border-border border-t-2 bg-popover/95 p-4 shadow-2xl shadow-black/40 backdrop-blur-md transition-colors duration-500 sm:p-7",
                index === active || item.emphasis ? "border-t-signal" : "border-t-border",
              )}
            >
              <p className="flex items-center justify-between gap-3 text-[12px]">
                <span className="flex items-center gap-2 font-medium text-signal">
                  <span aria-hidden="true" className="size-2 bg-signal" />
                  {item.date}
                </span>
                <span className="numeric text-muted-foreground">
                  {String(index + 1).padStart(2, "0")} / {String(steps.length).padStart(2, "0")}
                </span>
              </p>
              <h3 className="mt-3 text-[clamp(1.125rem,2.2vw,1.625rem)] font-semibold leading-[1.5] sm:mt-4">
                {item.title}
              </h3>
              <p className="mt-2 text-[14px] leading-7 text-muted-foreground sm:mt-3 sm:text-[15px] sm:leading-8">{item.body}</p>
              {item.focus.length ? (
                <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 border-t border-border pt-3 text-[12px] sm:mt-5">
                  {item.focus.map((id) => {
                    const origin =
                      origins.find((entry) => entry.id === id) ??
                      outside.find((entry) => entry.id === id);
                    if (!origin) return null;
                    return (
                      <li key={id} className="flex items-baseline gap-2">
                        <span className="numeric text-signal">{id}</span>
                        <span>{origin.place}</span>
                        <span className="numeric text-muted-foreground">{origin.time}</span>
                      </li>
                    );
                  })}
                </ul>
              ) : null}
              {index === active && focusOutside.length ? (
                <p className="mt-2 text-[11px] text-muted-foreground">
                  <span className="numeric">{focusOutside.map((origin) => origin.id).join("، ")}</span>{" "}
                  خارج إطار الصورة
                </p>
              ) : null}
            </article>
          </div>
        ))}
      </div>
    </section>
  );
}
