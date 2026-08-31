import type { ReactNode } from "react";

import { SectionLabel } from "@/components/editorial";
import type { ChronologyDay } from "@/lib/chronology";
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

/* ── صفّ يوم: عمود تاريخ ضيّق على الحافة البادئة، ثم السرد ── */
export function ChronologyDayBlock({
  day,
  measures,
}: {
  day: ChronologyDay;
  measures?: DayMeasures;
}) {
  const [, month, dayOfMonth] = day.date.split("-");

  return (
    <section
      id={day.id}
      className="scroll-mt-16 border-t py-8 first:border-t-0 first:pt-0"
    >
      <div className="grid gap-x-8 gap-y-5 lg:grid-cols-[minmax(0,8.5rem)_1fr]">
        <div>
          <p className="numeric text-lg font-semibold tracking-tight">
            {dayOfMonth}.{month}
          </p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">{day.label}</p>

          {measures ? (
            <dl className="mt-4 grid grid-cols-2 gap-x-5 gap-y-2.5 border-t pt-3.5 lg:grid-cols-1">
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
          <h3 className="text-xl font-semibold leading-snug tracking-tight">
            {day.headline}
          </h3>
          <p className="mt-3 max-w-2xl leading-8">{day.body}</p>

          {day.gap ? (
            <p className="mt-4 max-w-2xl border-s-2 ps-4 text-sm leading-7 text-muted-foreground">
              {day.gap}
            </p>
          ) : null}

          {day.moments?.length ? (
            <ol className="mt-6 divide-y border">
              {day.moments.map((moment) => (
                <li
                  key={moment.time + moment.title}
                  className="grid gap-x-5 gap-y-1.5 px-4 py-4 sm:grid-cols-[minmax(0,8rem)_1fr]"
                >
                  <div>
                    <p className="numeric text-sm font-medium">{moment.time}</p>
                    <p className="mt-1 flex items-center gap-1.5 text-[10px] text-muted-foreground">
                      <span
                        aria-hidden="true"
                        className={cn(
                          "inline-block size-1.5 rounded-full",
                          moment.measured ? "bg-ok" : "bg-muted-foreground",
                        )}
                      />
                      {moment.measured
                        ? "وقت البداية محدد خلال 15 دقيقة"
                        : "وقت البداية غير معروف بدقة"}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold leading-6">
                      {moment.title}
                    </h4>
                    <p className="mt-1.5 text-sm leading-7 text-muted-foreground">
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
    <div>
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
    <section className={cn("scroll-mt-16", className)} id={id}>
      <SectionLabel index={index}>{label}</SectionLabel>
      {children}
    </section>
  );
}
