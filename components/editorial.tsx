import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * لبنات التخطيط التحريري المشتركة: تسلسل طباعي، هوامش بيانات، صفوف وسجلات.
 * كلها عرضية بلا حالة، فتصلح للمكوّنات الخادمة. اللون داخل المادة العلمية فقط.
 */

/* ── عنوان قسم: نص عربي هادئ + خط شعرة، مع رقم اختياري بخط أحادي ── */
export function SectionLabel({
  children,
  index,
  id,
  className,
}: {
  children: ReactNode;
  index?: string;
  id?: string;
  className?: string;
}) {
  return (
    <div
      id={id}
      className={cn("flex scroll-mt-16 items-center gap-3", className)}
    >
      {index ? (
        <span className="numeric text-xs text-muted-foreground">{index}</span>
      ) : null}
      <span className="text-[11px] font-medium text-muted-foreground">
        {children}
      </span>
      <span aria-hidden="true" className="h-px flex-1 bg-border" />
    </div>
  );
}

/* ── هامش بيانات الملف: قائمة تعريف على حافة بادئة ── */
type MetaRow = { term: string; value: ReactNode; mono?: boolean };

export function FileMeta({
  heading,
  rows,
  className,
}: {
  heading?: string;
  rows: MetaRow[];
  className?: string;
}) {
  return (
    <div className={className}>
      {heading ? (
        <p className="mb-4 text-[11px] font-medium text-muted-foreground">
          {heading}
        </p>
      ) : null}
      <dl className="grid grid-cols-2 gap-x-6 gap-y-3.5 sm:grid-cols-3 lg:grid-cols-1">
        {rows.map((row) => (
          <div key={row.term}>
            <dt className="text-[11px] text-muted-foreground">{row.term}</dt>
            <dd
              className={cn(
                "mt-0.5 text-sm",
                row.mono ? "numeric" : "font-medium",
              )}
            >
              {row.value}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

/* ── سجل: حاوية محدودة بصفوف قيمة/تسمية/تفصيل ── */
export function Register({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn("divide-y border", className)}>{children}</div>;
}

export function RegisterRow({
  value,
  label,
  detail,
}: {
  value: ReactNode;
  label: ReactNode;
  detail?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 px-4 py-4 transition-colors hover:bg-muted/50">
      <div className="flex items-baseline gap-3">
        <span className="numeric text-[22px] font-semibold tracking-tight">
          {value}
        </span>
        <span className="text-sm">{label}</span>
      </div>
      {detail ? (
        <span className="text-[11px] text-muted-foreground">{detail}</span>
      ) : null}
    </div>
  );
}

/* ── شريط أرقام: شبكة خلايا إحصاء تفصلها خطوط شعرة (متجاوبة وRTL) ── */
export function StatStrip({
  items,
  className,
}: {
  items: { value: string; unit: string }[];
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-px border bg-border sm:grid-cols-4",
        className,
      )}
    >
      {items.map((item) => (
        <div key={item.unit} className="flex flex-col bg-background px-5 py-4">
          <span className="numeric text-2xl font-semibold tracking-tight">
            {item.value}
          </span>
          <span className="mt-0.5 text-xs text-muted-foreground">
            {item.unit}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ── لوحة على حافة بادئة: خلاصة أو حدّ معرفي ── */
export function EdgePanel({
  label,
  children,
  className,
}: {
  label?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "border border-s-[3px] border-s-foreground px-5 py-6",
        className,
      )}
    >
      {label ? (
        <p className="mb-4 text-[11px] font-medium text-muted-foreground">
          {label}
        </p>
      ) : null}
      {children}
    </div>
  );
}

/* ── سلّم الثقة الملوّن من تصميم فيغما: رمادي → كهرماني → أزرق → أخضر ── */
const METER_TONE: Record<number, { fill: string; text: string; dot: string }> = {
  0: {
    fill: "bg-muted-foreground",
    text: "text-muted-foreground",
    dot: "bg-muted-foreground",
  },
  1: { fill: "bg-warn", text: "text-warn", dot: "bg-warn" },
  2: { fill: "bg-info", text: "text-info", dot: "bg-info" },
  3: { fill: "bg-ok", text: "text-ok", dot: "bg-ok" },
  4: { fill: "bg-ok", text: "text-ok", dot: "bg-ok" },
};

export function confidenceTone(level: number) {
  return METER_TONE[level] ?? METER_TONE[0];
}

export function ConfidenceDot({ level }: { level: number }) {
  return (
    <span
      aria-hidden="true"
      className={cn("inline-block size-1.5 rounded-full", confidenceTone(level).dot)}
    />
  );
}

export function ConfidenceMeter({
  level,
  label,
  max = 4,
}: {
  level: number;
  label: string;
  max?: number;
}) {
  const tone = confidenceTone(level);
  return (
    <div>
      <div className="flex gap-1">
        {Array.from({ length: max }, (_, index) => (
          <span
            key={index}
            className={cn(
              "h-1.5 flex-1",
              index < level ? tone.fill : "bg-border",
            )}
          />
        ))}
      </div>
      <span className={cn("mt-2 block text-xs font-medium", tone.text)}>
        {label}
      </span>
    </div>
  );
}

/* ── شكل بياني: إطار + شريط أدوات + طبقات ركنية + تعليق ── */
type FigureOverlay = "top-start" | "top-end" | "bottom-start" | "bottom-end";

export function DataFigure({
  sensor,
  meta,
  actions,
  overlays,
  caption,
  children,
  className,
}: {
  sensor?: string;
  meta?: string;
  actions?: ReactNode;
  overlays?: Partial<Record<FigureOverlay, ReactNode>>;
  caption?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <figure className={cn("border bg-card", className)}>
      {sensor || actions ? (
        <div className="flex h-9 items-center justify-between gap-3 border-b px-3 text-[11px]">
          <div className="ltr-embed flex min-w-0 items-center gap-2">
            {sensor ? (
              <span className="truncate font-medium text-foreground">
                {sensor}
              </span>
            ) : null}
            {sensor && meta ? (
              <span aria-hidden="true" className="text-border">
                ·
              </span>
            ) : null}
            {meta ? (
              <span className="truncate text-muted-foreground">{meta}</span>
            ) : null}
          </div>
          {actions ? (
            <div className="flex shrink-0 items-center">{actions}</div>
          ) : null}
        </div>
      ) : null}

      <div className="relative">
        {children}
        {overlays?.["top-start"] ? (
          <FigureChip className="start-3 top-3">{overlays["top-start"]}</FigureChip>
        ) : null}
        {overlays?.["top-end"] ? (
          <FigureChip className="end-3 top-3">{overlays["top-end"]}</FigureChip>
        ) : null}
        {overlays?.["bottom-start"] ? (
          <FigureChip className="bottom-3 start-3">
            {overlays["bottom-start"]}
          </FigureChip>
        ) : null}
        {overlays?.["bottom-end"] ? (
          <FigureChip className="bottom-3 end-3">
            {overlays["bottom-end"]}
          </FigureChip>
        ) : null}
      </div>

      {caption ? (
        <figcaption className="border-t px-3 py-2.5 text-xs leading-6 text-muted-foreground">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}

function FigureChip({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "ltr-embed pointer-events-none absolute bg-black/65 px-1.5 py-0.5 text-[9px] leading-none text-white/75",
        className,
      )}
    >
      {children}
    </div>
  );
}
