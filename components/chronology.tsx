import type { ReactNode } from "react";

import { SectionLabel } from "@/components/editorial";
import type { ChronologyDay, ChronologyMoment } from "@/lib/chronology";
import {
  DAY_MS,
  heatColor,
  layoutMarks,
  localMs,
  parseMomentRange,
  slotLocalMs,
  type FrpSlot,
} from "@/lib/thermal";
import { cn } from "@/lib/utils";

/**
 * لبنات صفحة التسلسل الزمني. كلها عرضية بلا حالة فتبقى مكوّنات خادمة؛
 * التفاعل الوحيد في الصفحة هو منحنى القمر الثابت، وهو ورقة عميلة منفصلة.
 */

export type DayMeasures = {
  detections: number;
  detections_in_province: number;
  grid_cells_first_seen: number;
  temp_max_c: number | null;
  rh_min_pct: number | null;
  gust_max_kmh: number | null;
};

function count(value: number) {
  return value.toLocaleString("en");
}

function clock(minutes: number) {
  return `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
}

/* ── مسطرة اليوم: 24 ساعة من القمر الثابت، وعليها لحظات اليوم بأرقامها ── */
function DayRuler({
  date,
  slots,
  peak,
  moments = [],
}: {
  date: string;
  slots: FrpSlot[];
  peak: number;
  moments?: readonly ChronologyMoment[];
}) {
  const from = localMs(`${date} 00:00`);
  const bars = slots
    .map((slot) => ({ minute: (slotLocalMs(slot.t) - from) / 60000, frp: slot.frp }))
    .filter((slot) => slot.minute >= 0 && slot.minute < DAY_MS / 60000);
  const burning = bars.filter((slot) => slot.frp > 0);
  const strongest = burning.reduce<(typeof bars)[number] | null>(
    (best, slot) => (!best || slot.frp > best.frp ? slot : best),
    null,
  );

  const groups = layoutMarks(
    moments.map((moment, index) => {
      const { start, end } = parseMomentRange(moment.time);
      return {
        number: index + 1,
        x: (start / 1440) * 100,
        width: ((end - start) / 1440) * 100,
        measured: Boolean(moment.measured),
      };
    }),
    { mergeWithin: 0, rowGap: 4.5 },
  );
  const rows = groups.reduce((total, group) => Math.max(total, group.row + 1), 0);

  const summary = strongest
    ? `القمر الثابت يوم ${date.slice(-2)} أوت: أعلى قوة في ربع ساعة ${count(strongest.frp)} ميغاواط عند ${clock(strongest.minute)}، ونار مرئية في ${burning.length} من ${bars.length} صورة.`
    : `القمر الثابت يوم ${date.slice(-2)} أوت: لا نار فوق حدّ الكشف في ${bars.length} صورة.`;

  return (
    <figure className="min-w-0">
      <div dir="ltr">
        {rows ? (
          <div aria-hidden="true" className="relative" style={{ height: `${rows * 1.375}rem` }}>
            {groups.map((group) =>
              group.items.map((item, offset) => (
                <span
                  key={item.number}
                  className={cn(
                    "numeric absolute flex size-[1.125rem] -translate-x-1/2 items-center justify-center text-[10px] leading-none",
                    item.measured
                      ? "bg-orbit text-background"
                      : "border border-foreground bg-background text-foreground",
                  )}
                  style={{
                    left: `calc(${group.x}% + ${offset * 1.25}rem)`,
                    bottom: `${group.row * 1.375 + 0.25}rem`,
                  }}
                >
                  {item.number}
                </span>
              )),
            )}
          </div>
        ) : null}

        <div role="img" aria-label={summary} className="relative h-14 border-b border-rule sm:h-16">
          <svg
            viewBox="0 0 1440 100"
            preserveAspectRatio="none"
            className="absolute inset-0 block size-full"
            aria-hidden="true"
          >
            {[360, 720, 1080].map((minute) => (
              <line
                key={minute}
                x1={minute}
                x2={minute}
                y1={0}
                y2={100}
                stroke="var(--border)"
                strokeDasharray="3 4"
                vectorEffect="non-scaling-stroke"
              />
            ))}
            {burning.map((bar) => {
              const height = Math.max(2, Math.sqrt(bar.frp / peak) * 100);
              return (
                <rect
                  key={bar.minute}
                  x={bar.minute}
                  y={100 - height}
                  width={15.5}
                  height={height}
                  fill={heatColor(bar.frp)}
                />
              );
            })}
          </svg>
          {groups.flatMap((group) =>
            group.items.map((item) => (
              <span
                key={item.number}
                aria-hidden="true"
                className={cn(
                  "absolute inset-y-0 border-s",
                  item.measured ? "border-orbit" : "border-dashed border-foreground/60",
                )}
                style={{
                  left: `${item.x}%`,
                  width: item.width > 0 ? `max(2px, ${item.width}%)` : 0,
                  background: item.measured
                    ? "color-mix(in oklch, var(--orbit) 16%, transparent)"
                    : undefined,
                }}
              />
            )),
          )}
        </div>

        <div aria-hidden="true" className="relative h-5">
          {[0, 6, 12, 18, 24].map((hour) => (
            <span
              key={hour}
              className={cn(
                "numeric absolute top-1 text-[10px] text-muted-foreground",
                hour === 0 ? "translate-x-0" : hour === 24 ? "-translate-x-full" : "-translate-x-1/2",
              )}
              style={{ left: `${(hour / 24) * 100}%` }}
            >
              {String(hour).padStart(2, "0")}
            </span>
          ))}
        </div>
      </div>
      <figcaption className="mt-2 text-[12px] leading-6 text-muted-foreground">
        {strongest ? (
          <>
            أعلى ربع ساعة في صور القمر الثابت:{" "}
            <span className="numeric text-foreground">{count(strongest.frp)} MW</span>{" "}
            عند <span className="numeric text-foreground">{clock(strongest.minute)}</span>
            {" · "}نار مرئية في{" "}
            <span className="numeric text-foreground">{burning.length}</span> من{" "}
            <span className="numeric">{bars.length}</span> صورة
          </>
        ) : (
          <>
            لا نار فوق حدّ كشف القمر الثابت في{" "}
            <span className="numeric">{bars.length}</span> صورة
          </>
        )}
      </figcaption>
    </figure>
  );
}

/* ── صفّ يوم: رقم اليوم وقياساته على الحافة البادئة، ثم السرد والمسطرة ── */
export function ChronologyDayBlock({
  day,
  measures,
  slots,
  peak,
}: {
  day: ChronologyDay;
  measures?: DayMeasures;
  slots: FrpSlot[];
  peak: number;
}) {
  const [, month, dayOfMonth] = day.date.split("-");

  return (
    <section
      id={day.id}
      className="chronology-day scroll-mt-[12.5rem] border-t border-rule py-10 first:border-t-0 first:pt-0 sm:py-14 lg:scroll-mt-36"
    >
      <div className="grid gap-x-10 gap-y-6 lg:grid-cols-[9.5rem_minmax(0,1fr)]">
        <div>
          <p className="flex items-baseline gap-3 lg:block">
            <span className="figure-num block text-[clamp(3.25rem,6vw,4.75rem)] font-light leading-none">
              {dayOfMonth}
            </span>
            <span className="numeric mt-2 block text-[11px] text-muted-foreground">
              {dayOfMonth}.{month}.2026
            </span>
          </p>
          <p className="sr-only">{day.label}</p>

          {measures ? (
            <dl className="mt-6 grid grid-cols-2 gap-x-6 border-t border-border sm:grid-cols-4 lg:grid-cols-1">
              <DayMeasure
                term="الرصد الحراري"
                value={count(measures.detections)}
                detail={`${count(measures.detections_in_province)} داخل الولاية`}
              />
              <DayMeasure
                term="خلايا جديدة"
                value={count(measures.grid_cells_first_seen)}
              />
              {measures.temp_max_c !== null ? (
                <DayMeasure
                  term="أقصى حرارة"
                  value={`${measures.temp_max_c}°`}
                  detail={
                    measures.rh_min_pct !== null
                      ? `رطوبة ${measures.rh_min_pct}٪`
                      : undefined
                  }
                />
              ) : null}
              {measures.gust_max_kmh !== null ? (
                <DayMeasure
                  term="أقصى هبّة"
                  value={`${measures.gust_max_kmh}`}
                  detail="كم/س"
                />
              ) : null}
            </dl>
          ) : null}
        </div>

        <div className="min-w-0">
          <h3 className="text-[clamp(1.375rem,2.4vw,1.875rem)] font-semibold leading-[1.45]">
            {day.headline}
          </h3>
          <p className="mt-4 max-w-2xl text-[16px] leading-8">{day.body}</p>

          {day.gap ? (
            <p className="mt-5 max-w-2xl border-s-2 border-warn ps-4 text-sm leading-7 text-muted-foreground">
              {day.gap}
            </p>
          ) : null}

          <div className="mt-8">
            <DayRuler date={day.date} slots={slots} peak={peak} moments={day.moments} />
          </div>

          {day.moments?.length ? (
            <ol className="mt-6 border-t border-border">
              {day.moments.map((moment, index) => (
                <li
                  key={moment.time + moment.title}
                  className="grid grid-cols-[1.75rem_minmax(0,1fr)] gap-x-3 border-b border-border py-5 sm:grid-cols-[1.75rem_9rem_minmax(0,1fr)] sm:gap-x-5"
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      "numeric mt-0.5 flex size-[1.125rem] items-center justify-center text-[10px] leading-none",
                      moment.measured
                        ? "bg-orbit text-background"
                        : "border border-foreground text-foreground",
                    )}
                  >
                    {index + 1}
                  </span>
                  <div className="col-start-2">
                    <p className="numeric text-[15px] font-medium leading-6">{moment.time}</p>
                    <p className="mt-1 text-[11px] leading-5 text-muted-foreground">
                      {moment.measured
                        ? "وقت البداية محدد خلال 15 دقيقة"
                        : "وقت البداية غير معروف بدقة"}
                    </p>
                  </div>
                  <div className="col-start-2 mt-2 sm:col-start-3 sm:mt-0">
                    <h4 className="text-[15px] font-semibold leading-7">{moment.title}</h4>
                    <p className="mt-1 text-[14.5px] leading-7 text-muted-foreground">
                      {moment.body}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function DayMeasure({
  term,
  value,
  detail,
}: {
  term: string;
  value: string;
  detail?: string;
}) {
  return (
    <div className="border-b border-border py-2.5">
      <dt className="text-[11px] text-muted-foreground">{term}</dt>
      {/* الرقم وحده في جزيرة LTR؛ لو شملت الطبقةُ الخليةَ كلها التصق بها الشرح. */}
      <dd className="mt-0.5 text-sm">
        <span className="numeric font-medium">{value}</span>
        {detail ? (
          <span className="ms-1.5 text-[11px] text-muted-foreground">
            {detail}
          </span>
        ) : null}
      </dd>
    </div>
  );
}

/* ── عنوان قسم بمرساة داخل الصفحة ── */
export function ChronologySection({
  id,
  index,
  label,
  children,
  className,
}: {
  id: string;
  index: string;
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={className} id={id}>
      <SectionLabel index={index}>{label}</SectionLabel>
      {children}
    </section>
  );
}
