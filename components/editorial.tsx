import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";

import { SectionNavigator } from "@/components/section-navigator";
import { StoryBreadcrumb } from "@/components/story-breadcrumb";
import { siteSections } from "@/lib/site-navigation";
import { cn } from "@/lib/utils";

/**
 * لبنات «الملف»: ترويسة ملف، سطر بيانات، هامش فهرس لاصق، عناوين فصول، شريط
 * أرقام، ملاحظات، أشكال مرقّمة، وتسلسل زمني. كلها عرضية بلا حالة، فتصلح
 * للمكوّنات الخادمة. الحبر للبنية، والجمري لإشارة واحدة في كل كتلة.
 */

type MetaRow = { term: string; value: ReactNode; mono?: boolean };

/* ── ترويسة الملف: مسار ورقم الملف، ثم العنوان والملخص، ثم سطر بياناته ── */
export function Masthead({
  current,
  file,
  kicker,
  title,
  lede,
  meta,
  metaLabel = "بيانات الملف",
  panel,
  children,
  className,
}: {
  current: string;
  file: string;
  kicker: string;
  title: ReactNode;
  lede?: ReactNode;
  meta?: MetaRow[];
  metaLabel?: string;
  /** لوحة بيانات الصفحة بجانب العنوان (عادةً NightPanel). */
  panel?: ReactNode;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("masthead", className)}>
      <div className="flex items-center justify-between gap-4 border-b border-rule pb-3">
        <StoryBreadcrumb current={current} />
        <p className="text-[11px] text-muted-foreground">
          ملف{" "}
          <span className="numeric text-foreground">
            {file}
            <span className="text-muted-foreground">
              {" "}
              / {String(siteSections.length).padStart(2, "0")}
            </span>
          </span>
        </p>
      </div>

      {panel ? (
        <div className="grid gap-x-12 gap-y-12 pt-10 sm:pt-14 lg:grid-cols-12 lg:pt-16">
          <div className="lg:col-span-7 lg:self-center">
            <Kicker>{kicker}</Kicker>
            <h1 className="mt-6 text-[clamp(2.5rem,5.4vw,4.75rem)] font-bold leading-[1.16]">
              {title}
            </h1>
            {lede ? (
              <div className="mt-8 max-w-2xl text-[17.5px] leading-[1.95] text-muted-foreground [&_p+p]:mt-4">
                {typeof lede === "string" ? <p>{lede}</p> : lede}
              </div>
            ) : null}
          </div>
          <div className="min-w-0 lg:col-span-5">{panel}</div>
        </div>
      ) : (
        <div className="grid gap-x-12 gap-y-6 pt-10 sm:pt-14 lg:grid-cols-12 lg:pt-16">
          <div className="lg:col-span-8">
            <Kicker>{kicker}</Kicker>
            <h1 className="mt-5 text-[clamp(2.25rem,5vw,4.25rem)] font-bold leading-[1.2]">
              {title}
            </h1>
          </div>
          {lede ? (
            <div className="text-[17px] leading-[1.95] text-muted-foreground lg:col-span-4 lg:self-end lg:pb-2 [&_p+p]:mt-4">
              {typeof lede === "string" ? <p>{lede}</p> : lede}
            </div>
          ) : null}
        </div>
      )}

      {meta?.length ? (
        <MetaLedger className="mt-10 sm:mt-14" label={metaLabel} rows={meta} />
      ) : null}
      {children}
    </div>
  );
}

/* ── لوحة ليلية: جزيرة بيانات داكنة داخل الصفحة البيضاء، بعنوان وسطر وصفي ── */
export function NightPanel({
  label,
  meta,
  children,
  className,
  labelledBy,
}: {
  label: string;
  meta?: ReactNode;
  children: ReactNode;
  className?: string;
  labelledBy?: string;
}) {
  const headingId = labelledBy ?? undefined;
  return (
    <section
      aria-labelledby={headingId}
      aria-label={headingId ? undefined : label}
      className={cn(
        "dark flex h-full flex-col border border-border bg-background text-foreground",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-4 border-b border-border px-5 py-3 text-[11px] text-muted-foreground">
        <p id={headingId} className="flex items-center gap-2 font-medium text-foreground">
          <span aria-hidden="true" className="size-1.5 bg-signal" />
          {label}
        </p>
        {meta ? <div className="numeric">{meta}</div> : null}
      </div>
      {children}
    </section>
  );
}

/* ── سطر افتتاحي: مربّع جمري ونص قصير ── */
export function Kicker({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "flex items-center gap-2.5 text-[12.5px] font-medium text-signal-ink",
        className,
      )}
    >
      <span aria-hidden="true" className="size-2 shrink-0 bg-signal" />
      {children}
    </p>
  );
}

/* ── سطر بيانات الملف: قائمة تعريف أفقية تفصلها خطوط شعرة ── */
export function MetaLedger({
  rows,
  label,
  className,
}: {
  rows: MetaRow[];
  label?: string;
  className?: string;
}) {
  const list = (
    <dl
      className={cn(
        "grid grid-cols-2 border-t border-border sm:grid-cols-3 lg:auto-cols-fr lg:grid-flow-col lg:grid-cols-none",
        label ? undefined : className,
      )}
    >
      {rows.map((row) => (
        <div
          key={row.term}
          className="min-w-0 border-b border-border py-3.5 pe-4 lg:border-b-0 lg:border-s lg:ps-5 lg:first:border-s-0 lg:first:ps-0"
        >
          <dt className="text-[11px] text-muted-foreground">{row.term}</dt>
          <dd
            className={cn(
              "mt-1 text-[13.5px] leading-6",
              row.mono ? "numeric" : "font-medium",
            )}
          >
            {row.value}
          </dd>
        </div>
      ))}
    </dl>
  );

  if (!label) return list;
  return (
    <section aria-label={label} className={className}>
      <p className="mb-2 text-[11px] font-medium text-muted-foreground">{label}</p>
      {list}
    </section>
  );
}

/* ── هامش بيانات عمودي: للأسطح التي تحتاج قائمة تعريف ضيقة ── */
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
    <div className={cn("file-meta", className)}>
      {heading ? (
        <p className="mb-3 border-b border-rule pb-2 text-[11px] font-medium">
          {heading}
        </p>
      ) : null}
      <dl className="grid grid-cols-2 gap-x-6 sm:grid-cols-3 lg:grid-cols-1">
        {rows.map((row) => (
          <div key={row.term} className="border-b border-border py-2.5">
            <dt className="text-[11px] text-muted-foreground">{row.term}</dt>
            <dd
              className={cn(
                "mt-0.5 text-[13px]",
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

/* ── الملف: هامش فهرس لاصق على حافة البدء، ثم عمود المادة ── */
export type IndexItem = { id: string; label: string; index?: string };

export function Dossier({
  index,
  indexLabel,
  indexHeading = "الفهرس",
  aside,
  children,
  className,
}: {
  index?: readonly IndexItem[];
  indexLabel?: string;
  indexHeading?: string;
  aside?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mt-14 grid gap-x-14 gap-y-10 lg:mt-20 lg:grid-cols-[12.5rem_minmax(0,1fr)] xl:gap-x-20",
        className,
      )}
    >
      <aside className="publication-sidebar hidden lg:block">
        <div className="sticky top-24 flex flex-col gap-10">
          {index?.length ? (
            <IndexNav
              items={index}
              label={indexLabel ?? indexHeading}
              heading={indexHeading}
            />
          ) : null}
          {aside}
        </div>
      </aside>
      <div className="publication-body min-w-0">
        {index?.length ? (
          <SectionNavigator
            heading={indexHeading}
            items={index.map((item) => ({ id: item.id, label: item.label, index: item.index }))}
          />
        ) : null}
        {children}
      </div>
    </div>
  );
}

export function IndexNav({
  items,
  label,
  heading,
}: {
  items: readonly IndexItem[];
  label: string;
  heading: string;
}) {
  return (
    <nav aria-label={label}>
      <p className="flex items-center justify-between border-b border-rule pb-2 text-[11px] font-medium">
        {heading}
        <span className="numeric text-muted-foreground">
          {String(items.length).padStart(2, "0")}
        </span>
      </p>
      <ol className="flex flex-col">
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              className="group relative flex items-baseline gap-3 border-b border-border py-2 text-[12.5px] leading-6 text-muted-foreground transition-colors hover:text-foreground aria-[current=location]:font-medium aria-[current=location]:text-foreground"
            >
              <span
                aria-hidden="true"
                className="absolute -start-3 top-1/2 h-4 w-0.5 -translate-y-1/2 bg-signal opacity-0 transition-opacity group-aria-[current=location]:opacity-100"
              />
              <span className="numeric w-5 shrink-0 text-[10.5px] font-normal group-aria-[current=location]:text-signal-ink">
                {item.index ?? "·"}
              </span>
              <span className="min-w-0">{item.label}</span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

/* ── عنوان فصل: رقم وخط حبر يملأ السطر، ثم العنوان ──
   الوسم الافتراضي h2 ليبني هيكل الصفحة؛ as="p" لتسمية صغيرة بلا وزن عنوان. */
export function SectionLabel({
  children,
  index,
  id,
  as: Heading = "h2",
  className,
}: {
  children: ReactNode;
  index?: string;
  id?: string;
  as?: "h2" | "h3" | "p";
  className?: string;
}) {
  return (
    <div id={id} className={cn("section-label", className)}>
      <div className="flex items-center gap-3">
        {index ? (
          <span className="numeric text-[12px] font-medium text-foreground">
            {index}
          </span>
        ) : (
          <span aria-hidden="true" className="size-1.5 bg-signal" />
        )}
        <span aria-hidden="true" className="h-px flex-1 bg-rule" />
      </div>
      <Heading
        className={cn(
          Heading === "p"
            ? "mt-2.5 text-[13px] font-medium text-muted-foreground"
            : Heading === "h3"
              ? "mt-3 text-xl font-semibold leading-9"
              : "mt-4 text-[clamp(1.5rem,2.6vw,2.125rem)] font-semibold leading-[1.45]",
        )}
      >
        {children}
      </Heading>
    </div>
  );
}

/* الرقم في جزيرة LTR والوحدة خارجها بخط أصغر، فلا يعيد اتجاه النص ترتيب
   «كم» أو «°م» داخل الرقم. */
function splitMeasure(value: string) {
  const match = value.match(/^([\d.,:\-–>≈<+°٪%]+)\s*(.*)$/);
  return match ? { number: match[1], unit: match[2] } : { number: value, unit: "" };
}

export function Measure({
  value,
  className,
  unitClassName,
}: {
  value: string;
  className?: string;
  unitClassName?: string;
}) {
  const { number, unit } = splitMeasure(value);
  return (
    <span className={cn("whitespace-nowrap", className)}>
      <span className="figure-num">{number}</span>
      {unit ? (
        <span className={cn("ms-1.5 text-[0.42em] font-normal text-muted-foreground", unitClassName)}>
          {unit}
        </span>
      ) : null}
    </span>
  );
}

/* ── شريط أرقام: قيمة كبيرة خفيفة فوق وحدتها، تفصلها خطوط شعرة ── */
export function StatStrip({
  items,
  className,
}: {
  items: { value: string; unit: string }[];
  className?: string;
}) {
  return (
    <dl
      className={cn(
        "stat-strip grid grid-cols-2 gap-px border-t border-rule bg-border sm:grid-cols-4",
        className,
      )}
    >
      {items.map((item) => (
        <div
          key={item.unit}
          className="flex min-w-0 flex-col-reverse justify-end bg-background px-4 pb-5 pt-4 sm:px-5 sm:pb-6"
        >
          <dt className="mt-2 text-[12.5px] leading-6 text-muted-foreground">
            {item.unit}
          </dt>
          <dd className="text-[clamp(1.875rem,3.8vw,3.5rem)] font-light leading-[1.1]">
            <Measure value={item.value} />
          </dd>
        </div>
      ))}
    </dl>
  );
}

/* ── سجل: صفوف قيمة/تسمية/تفصيل ── */
export function Register({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("data-register divide-y border-y border-border", className)}>
      {children}
    </div>
  );
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
    <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 py-4 transition-colors hover:bg-card">
      <div className="flex items-baseline gap-3">
        <span className="figure-num text-[22px] font-light">{value}</span>
        <span className="text-sm">{label}</span>
      </div>
      {detail ? (
        <span className="text-[11px] text-muted-foreground">{detail}</span>
      ) : null}
    </div>
  );
}

/* ── ملاحظة ملف: خلاصة أو حدّ معرفي على سطح منزوٍ بخط حبر علوي ── */
type PanelTone = "default" | "signal" | "info" | "warn" | "destructive";

const PANEL_TONE: Record<PanelTone, { rule: string; dot: string }> = {
  default: { rule: "border-t-rule", dot: "bg-foreground" },
  signal: { rule: "border-t-signal", dot: "bg-signal" },
  info: { rule: "border-t-orbit", dot: "bg-orbit" },
  warn: { rule: "border-t-warn", dot: "bg-warn" },
  destructive: { rule: "border-t-destructive", dot: "bg-destructive" },
};

export function EdgePanel({
  label,
  tone = "default",
  children,
  className,
}: {
  label?: string;
  tone?: PanelTone;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "edge-panel border-t-2 bg-card px-5 py-6 sm:px-8 sm:py-8",
        PANEL_TONE[tone].rule,
        className,
      )}
    >
      {label ? (
        <p className="mb-4 flex items-center gap-2 text-[12px] font-medium text-muted-foreground">
          <span aria-hidden="true" className={cn("size-1.5 shrink-0", PANEL_TONE[tone].dot)} />
          {label}
        </p>
      ) : null}
      {children}
    </div>
  );
}

/* ── سلّم الثقة: رمادي ← كهرماني ← مداري ← أخضر ── */
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
      className={cn("inline-block size-1.5 shrink-0", confidenceTone(level).dot)}
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
      <div className="flex gap-[3px]">
        {Array.from({ length: max }, (_, index) => (
          <span
            key={index}
            className={cn(
              "h-[5px] flex-1",
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

/* ── شكل مرقّم: سطر المستشعر فوق خط حبر، الوسيط على سطح منزوٍ، ثم التعليق ── */
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
    <figure className={cn("data-figure min-w-0", className)}>
      <div className="flex min-h-9 flex-wrap items-center justify-between gap-x-4 gap-y-1 border-t border-rule py-2 text-[11px]">
        <div className="ltr-embed flex min-w-0 items-center gap-2">
          {sensor ? (
            <span className="truncate font-medium text-foreground">{sensor}</span>
          ) : null}
          {sensor && meta ? (
            <span aria-hidden="true" className="text-muted-foreground">
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

      <div className="relative border border-border bg-card">
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
        <figcaption className="grid gap-x-6 gap-y-1 pt-3 text-[13px] leading-7 text-muted-foreground sm:grid-cols-[4rem_minmax(0,1fr)]">
          <span className="text-[11px] font-medium leading-7 text-foreground">
            شكل <span className="numeric figure-index" />
          </span>
          <div className="min-w-0">{caption}</div>
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
        "ltr-embed pointer-events-none absolute bg-black/70 px-1.5 py-0.5 text-[10px] leading-4 text-white/85",
        className,
      )}
    >
      {children}
    </div>
  );
}

/* ── تسلسل زمني: قائمة مرتّبة بتاريخ ومربّع على الحافة البادئة ── */
export function Timeline({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <ol className={cn("story-timeline border-t border-rule", className)}>
      {children}
    </ol>
  );
}

export function TimelineRow({
  date,
  title,
  emphasis = false,
  children,
}: {
  date: ReactNode;
  title: ReactNode;
  /** يوم مفصلي: مربّع جمري ممتلئ بدل المفرّغ. */
  emphasis?: boolean;
  children?: ReactNode;
}) {
  return (
    <li className="timeline-row grid gap-x-8 gap-y-1.5 border-b border-border py-5 sm:grid-cols-[8rem_minmax(0,1fr)] sm:py-6">
      <p className="flex items-center gap-2.5 text-[15px] font-medium leading-7">
        <span
          aria-hidden="true"
          className={cn(
            "size-2 shrink-0",
            emphasis ? "bg-signal" : "border border-foreground",
          )}
        />
        {date}
      </p>
      <div>
        <h3 className="text-[17px] font-semibold leading-8">{title}</h3>
        {children ? (
          <div className="mt-1 text-[15px] leading-8 text-muted-foreground">
            {children}
          </div>
        ) : null}
      </div>
    </li>
  );
}

/* ── سند الادعاء: مقياس ثقة ورابط المصدر تحت خط متقطّع ── */
export function ClaimBasis({
  level,
  confidence,
  sources,
  sourcesHref = "/sources",
  className,
}: {
  level: number;
  confidence: string;
  sources: ReactNode;
  sourcesHref?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mt-6 grid gap-3 border-t border-dashed border-border pt-4 sm:grid-cols-[minmax(0,14rem)_1fr] sm:items-center",
        className,
      )}
    >
      <ConfidenceMeter level={level} label={`الثقة: ${confidence}`} />
      <Link
        href={sourcesHref}
        className="text-xs text-muted-foreground underline decoration-border underline-offset-4 hover:text-foreground hover:decoration-foreground sm:text-end"
      >
        {sources}
      </Link>
    </div>
  );
}

/* ── روابط متابعة القراءة: صفوف مرقّمة بعنوان ووصف وسهم ── */
export function ContinueLinks({
  label,
  links,
  className,
}: {
  label: string;
  links: { href: string; title: string; summary: string; index?: string }[];
  className?: string;
}) {
  return (
    <nav aria-label={label} className={cn("border-t border-rule", className)}>
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="group grid grid-cols-[2.25rem_minmax(0,1fr)_auto] items-center gap-x-4 border-b border-border py-5 transition-colors hover:bg-card sm:grid-cols-[3rem_minmax(0,1fr)_auto] sm:px-2"
        >
          <span className="numeric self-start pt-1.5 text-[11px] text-muted-foreground">
            {link.index ?? "·"}
          </span>
          <span className="min-w-0">
            <span className="block text-[17px] font-semibold leading-8 sm:text-[19px]">
              {link.title}
            </span>
            <span className="mt-0.5 block text-[13.5px] leading-7 text-muted-foreground">
              {link.summary}
            </span>
          </span>
          <ArrowLeftIcon
            aria-hidden="true"
            className="size-5 text-muted-foreground transition-transform group-hover:-translate-x-1 group-hover:text-signal-ink"
          />
        </Link>
      ))}
    </nav>
  );
}
