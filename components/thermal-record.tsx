import { cn } from "@/lib/utils";
import {
  DAY_MS,
  QUARTER_HOUR_MS,
  heatBins,
  heatColor,
  layoutMarks,
  localMs,
  slotLocalMs,
  type FrpSlot,
} from "@/lib/thermal";

/**
 * سجلّ الحرارة: كل شريحة من القمر الثابت (15 دقيقة) عمود رفيع، ارتفاعه الجذر
 * التربيعي لقوة النار ولونه درجتها. يُرسم عند البناء فلا يحتاج جافاسكربت.
 * المحور LTR كالرسوم؛ العلامات بدايات قِيس وقتها (آخر صورة صافية ← أول نار).
 */

export type ThermalMark = {
  origin_id: string;
  /** آخر صورة بلا نار، بالتوقيت المحلي. */
  from: string;
  /** أول صورة ظهرت فيها النار، بالتوقيت المحلي. */
  to: string;
};

const VIEW_WIDTH = 1000;
const VIEW_HEIGHT = 100;

export function ThermalRecord({
  slots,
  marks = [],
  start = "2026-08-21 00:00",
  days = 10,
  label,
  className,
  trackClassName = "h-24 sm:h-28",
  dayHref,
}: {
  slots: FrpSlot[];
  marks?: ThermalMark[];
  /** بداية المحور بالتوقيت المحلي. */
  start?: string;
  days?: number;
  label: string;
  className?: string;
  trackClassName?: string;
  /** رابط لكل يوم على المحور، إن وُجد له قسم في الصفحة. */
  dayHref?: (dayOfMonth: number) => string | undefined;
}) {
  const from = localMs(start);
  const span = days * DAY_MS;
  const peak = Math.max(1, ...slots.map((slot) => slot.frp));
  const toX = (ms: number) => ((ms - from) / span) * VIEW_WIDTH;
  const slotWidth = (QUARTER_HOUR_MS / span) * VIEW_WIDTH;

  const bars = slots
    .map((slot) => ({ ms: slotLocalMs(slot.t), frp: slot.frp }))
    .filter((slot) => slot.frp > 0 && slot.ms >= from && slot.ms + QUARTER_HOUR_MS <= from + span);

  const dayNumbers = Array.from({ length: days }, (_, index) =>
    new Date(from + index * DAY_MS).getUTCDate(),
  );

  const groups = layoutMarks(
    marks.map((mark) => ({
      ...mark,
      x: ((localMs(mark.from) - from) / span) * 100,
      width: ((localMs(mark.to) - localMs(mark.from)) / span) * 100,
    })),
    { mergeWithin: 1.2, rowGap: 8 },
  );
  const labelRows = groups.reduce((rows, group) => Math.max(rows, group.row + 1), 0);

  return (
    <div className={cn("min-w-0", className)}>
      <div dir="ltr" className="relative">
        {groups.length ? (
          <div
            aria-hidden="true"
            className="relative hidden sm:block"
            style={{ height: `${labelRows * 1.25 + 0.25}rem` }}
          >
            {groups.map((group) => (
              <span
                key={group.items.map((item) => item.origin_id).join("-")}
                className="numeric absolute -translate-x-1/2 whitespace-nowrap text-[10px] leading-5 text-orbit"
                style={{ left: `${group.x}%`, bottom: `${group.row * 1.25}rem` }}
              >
                {group.items.map((item) => item.origin_id).join(" · ")}
              </span>
            ))}
          </div>
        ) : null}

        <div
          role="img"
          aria-label={label}
          className={cn("relative border-b border-rule", trackClassName)}
        >
          <svg
            viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
            preserveAspectRatio="none"
            className="absolute inset-0 block size-full"
            aria-hidden="true"
          >
            {dayNumbers.slice(1).map((day, index) => {
              const x = ((index + 1) / days) * VIEW_WIDTH;
              return (
                <line
                  key={day}
                  x1={x}
                  x2={x}
                  y1={0}
                  y2={VIEW_HEIGHT}
                  stroke="var(--border)"
                  strokeWidth={1}
                  vectorEffect="non-scaling-stroke"
                />
              );
            })}
            {bars.map((bar) => {
              const height = Math.max(1.5, Math.sqrt(bar.frp / peak) * VIEW_HEIGHT);
              return (
                <rect
                  key={bar.ms}
                  x={toX(bar.ms)}
                  y={VIEW_HEIGHT - height}
                  width={slotWidth * 1.08}
                  height={height}
                  fill={heatColor(bar.frp)}
                />
              );
            })}
          </svg>

          {groups.flatMap((group) =>
            group.items.map((item) => (
              <span
                key={item.origin_id}
                aria-hidden="true"
                className="absolute inset-y-0 border-s border-orbit"
                style={{
                  left: `${item.x}%`,
                  width: `max(1px, ${item.width}%)`,
                  background: "color-mix(in oklch, var(--orbit) 14%, transparent)",
                }}
              />
            )),
          )}
        </div>

        <div className="grid pt-1.5" style={{ gridTemplateColumns: `repeat(${days}, minmax(0, 1fr))` }}>
          {dayNumbers.map((day) => {
            const href = dayHref?.(day);
            return href ? (
              <a
                key={day}
                href={href}
                aria-label={`${day} أوت`}
                className="numeric py-1 text-center text-[10.5px] text-foreground underline decoration-border underline-offset-4 hover:decoration-signal"
              >
                {day}
              </a>
            ) : (
              <span
                key={day}
                aria-hidden="true"
                className="numeric py-1 text-center text-[10.5px] text-muted-foreground"
              >
                {day}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* مفتاح الدرجات: يُعرض مرة واحدة تحت السجل أو بجانبه */
export function ThermalLegend({
  withMarks = true,
  className,
}: {
  withMarks?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-x-6 gap-y-2 text-[11.5px] text-muted-foreground",
        className,
      )}
    >
      <span className="flex items-center gap-2">
        <span>قوة النار</span>
        <span dir="ltr" className="flex items-center gap-1">
          {heatBins.map((bin) => (
            <span key={bin.label} className="flex items-center gap-1">
              <span aria-hidden="true" className="h-2.5 w-3.5" style={{ background: bin.color }} />
              <span className="numeric text-[10px]">{bin.label}</span>
            </span>
          ))}
          <span className="numeric ms-1 text-[10px]">MW</span>
        </span>
      </span>
      {withMarks ? (
        <span className="flex items-center gap-2">
          <span aria-hidden="true" className="h-3 w-2 border-s border-orbit bg-orbit/15" />
          بداية حُدّد وقتها خلال 15 دقيقة
        </span>
      ) : null}
    </div>
  );
}
