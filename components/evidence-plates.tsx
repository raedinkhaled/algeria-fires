import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * لوحات مؤشرات الاشتباه: لكل مؤشر رسم صغير من أرقامه المذكورة في نصّه أو في
 * جداول المنشأ المنشورة، فيُقرأ المؤشر بالنظر قبل القراءة. الرسوم SVG ثابتة
 * بلا حركة، وكل رقم فيها يقابله رقم في النص.
 */

export type ElevationPoint = { id: string; elevation: number };

const LRI = "⁦";
const PDI = "⁩";
const ltr = (value: string) => `${LRI}${value}${PDI}`;

/* الشقفة ← تاكسنة: سمت المسار مقابل اتجاه دفع الريح */
function BearingVisual() {
  const cx = 110;
  const cy = 70;
  const r = 52;
  const point = (bearing: number, radius = r) => {
    const rad = (bearing * Math.PI) / 180;
    return [cx + radius * Math.sin(rad), cy - radius * Math.cos(rad)];
  };
  const [px, py] = point(262);
  const [wx, wy] = point(34);
  return (
    <svg viewBox="0 0 220 140" role="img" aria-label="السمت 262° مقابل دفع الريح 33°-35°، بفارق 132°" className="h-full w-full" direction="rtl">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--border)" />
      <circle cx={cx} cy={cy} r={r / 2} fill="none" stroke="var(--border)" strokeDasharray="2 3" />
      <text x={cx} y={cy - r - 6} textAnchor="middle" fontSize="9" fill="var(--muted-foreground)" fontFamily="var(--font-mono)">N</text>
      <path d={`M${cx} ${cy} L${px} ${py}`} stroke="var(--foreground)" strokeWidth="2" />
      <circle cx={px} cy={py} r="4" fill="var(--signal)" />
      <path d={`M${cx} ${cy} L${wx} ${wy}`} stroke="var(--orbit)" strokeWidth="2" strokeDasharray="5 3" />
      <path
        d={`M${cx + 22 * Math.sin((34 * Math.PI) / 180)} ${cy - 22 * Math.cos((34 * Math.PI) / 180)} A22 22 0 0 0 ${cx + 22 * Math.sin((262 * Math.PI) / 180)} ${cy - 22 * Math.cos((262 * Math.PI) / 180)}`}
        fill="none"
        stroke="var(--signal)"
        strokeWidth="1.5"
      />
      <circle cx={cx} cy={cy} r="3.5" fill="var(--foreground)" />
      <text x="8" y="130" textAnchor="end" fontSize="10" fill="var(--foreground)" fontFamily="var(--font-sans)">
        تاكسنة {ltr("262°")}
      </text>
      <text x="212" y="130" textAnchor="start" fontSize="10" fill="var(--orbit)" fontFamily="var(--font-sans)">
        الريح {ltr("33°–35°")}
      </text>
      <text x="8" y="18" textAnchor="end" fontSize="11" fill="var(--signal-ink)" fontFamily="var(--font-mono)">
        {ltr("Δ 132°")}
      </text>
    </svg>
  );
}

/* فارق البداية مقابل زمن الطريق */
function TimingVisual() {
  const scale = (minutes: number) => (minutes / 60) * 100;
  return (
    <div className="flex h-full flex-col justify-center gap-4" dir="ltr">
      <div>
        <div className="relative h-4 bg-muted">
          <span
            className="absolute inset-y-0 bg-orbit/25"
            style={{ left: `${scale(11)}%`, width: `${scale(30) - scale(11)}%` }}
          />
          <span className="absolute inset-y-0 w-0.5 bg-orbit" style={{ left: `${scale(11)}%` }} />
        </div>
        <p className="mt-1.5 flex justify-between text-[11px]" dir="rtl">
          <span>فارق البداية</span>
          <span className="numeric text-orbit">11–30 min</span>
        </p>
      </div>
      <div>
        <div className="relative h-4 bg-muted">
          <span className="absolute inset-y-0 left-0 bg-foreground" style={{ width: `${scale(49)}%` }} />
        </div>
        <p className="mt-1.5 flex justify-between text-[11px]" dir="rtl">
          <span>أسرع طريق بين الموقعين</span>
          <span className="numeric">49 min</span>
        </p>
      </div>
    </div>
  );
}

/* اثنتا عشرة بداية، ست داخل جيجل */
function UnitsVisual({
  total,
  highlighted,
  label,
  hollow = false,
}: {
  total: number;
  highlighted: number;
  label: string;
  hollow?: boolean;
}) {
  return (
    <div className="flex h-full flex-col justify-center">
      <div className="grid grid-cols-6 gap-1.5" dir="ltr">
        {Array.from({ length: total }, (_, index) => (
          <span
            key={index}
            aria-hidden="true"
            className={cn(
              "aspect-square",
              index < highlighted
                ? hollow
                  ? "border-2 border-orbit bg-orbit/15"
                  : "bg-signal"
                : "border border-foreground/30",
            )}
          />
        ))}
      </div>
      <p className="mt-3 flex items-baseline justify-between text-[11px]">
        <span>{label}</span>
        <span className="numeric">
          {highlighted} / {total}
        </span>
      </p>
    </div>
  );
}

/* ارتفاع كل بداية، وبؤرة الجمعة بني حبيبي أدناها */
function ElevationVisual({ points, focus }: { points: ElevationPoint[]; focus: string }) {
  const max = Math.max(...points.map((point) => point.elevation));
  const focused = points.find((point) => point.id === focus);
  return (
    <div className="flex h-full flex-col justify-center">
      <div className="relative h-20 border-b border-foreground" dir="ltr">
        {points.map((point, index) => (
          <span
            key={point.id}
            aria-hidden="true"
            className={cn(
              "absolute bottom-0 w-[5%]",
              point.id === focus ? "bg-signal" : "bg-foreground/25",
            )}
            style={{
              left: `${(index / points.length) * 100 + 1.5}%`,
              height: `${Math.max(4, (point.elevation / max) * 100)}%`,
            }}
          />
        ))}
      </div>
      <p className="mt-2 flex items-baseline justify-between text-[11px]">
        <span>ارتفاع البدايات الاثنتي عشرة</span>
        {focused ? (
          <span className="numeric text-signal-ink">
            {focused.id} · {focused.elevation} m
          </span>
        ) : null}
      </p>
    </div>
  );
}

/* قدرة اختبار التزامن على كشف عملية محقونة */
function PowerVisual() {
  return (
    <div className="flex h-full flex-col justify-center">
      <div className="grid grid-cols-20 gap-[3px]" dir="ltr">
        {Array.from({ length: 100 }, (_, index) => (
          <span
            key={index}
            aria-hidden="true"
            className={cn(
              "aspect-square",
              index < 2 ? (index === 1 ? "bg-signal/50" : "bg-signal") : "bg-foreground/15",
            )}
          />
        ))}
      </div>
      <p className="mt-3 flex items-baseline justify-between text-[11px]">
        <span>نسبة الكشف في المحاكاة</span>
        <span className="numeric text-signal-ink">1.5%</span>
      </p>
    </div>
  );
}

export type EvidenceItem = { title: string; body: string; tag: string };

export function EvidencePlates({
  items,
  elevations,
}: {
  items: EvidenceItem[];
  elevations: ElevationPoint[];
}) {
  const visuals: ReactNode[] = [
    <BearingVisual key="bearing" />,
    <TimingVisual key="timing" />,
    <UnitsVisual key="origins" total={12} highlighted={6} label="بدايات داخل جيجل" />,
    <ElevationVisual key="elevation" points={elevations} focus="O03" />,
    <UnitsVisual key="night" total={12} highlighted={4} label="أول رصد ليلاً" hollow />,
    <PowerVisual key="power" />,
  ];

  return (
    <ol className="grid gap-px border-y border-rule bg-border md:grid-cols-2 xl:grid-cols-3">
      {items.map((item, index) => (
        <li key={item.title} className="flex flex-col bg-background">
          <div className="h-44 border-b border-border bg-card px-6 py-5 text-muted-foreground">
            {visuals[index]}
          </div>
          <div className="flex flex-1 flex-col px-6 pb-6 pt-5">
            <p className="numeric text-[11px] text-signal-ink">
              {String(index + 1).padStart(2, "0")}
            </p>
            <h3 className="mt-2 text-[17px] font-semibold leading-8">{item.title}</h3>
            <p className="mt-2 flex-1 text-[14px] leading-7 text-muted-foreground">{item.body}</p>
            <p className="mt-5 flex items-start gap-2 border-t border-border pt-3 text-[12px] font-medium leading-6">
              <span aria-hidden="true" className="mt-2 size-1.5 shrink-0 bg-signal" />
              {item.tag}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}
