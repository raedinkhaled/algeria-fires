import { cn } from "@/lib/utils";

/**
 * احتمالات مصفوفة الفرضيات المتنافسة. القيم من `data/forensic-summary.json`،
 * وهي أرقام المصفوفة بعد تحليل القوة وقاعدة التماثل (الفصل 26.4).
 * الشريط أحادي اللون: هذه احتمالات لا درجات ثقة.
 */

export type HypothesisRow = {
  id: string;
  label: string;
  full_weight: number;
  softened_weight: number;
};

function percent(value: number) {
  return `${value.toFixed(1)}٪`;
}

export function HypothesisMatrix({
  rows,
  caption,
  className,
}: {
  rows: HypothesisRow[];
  caption?: string;
  className?: string;
}) {
  return (
    <div className={cn("border", className)}>
      <div className="grid grid-cols-[1fr_auto_auto] gap-x-4 border-b bg-muted/40 px-4 py-2 text-[11px] text-muted-foreground sm:gap-x-6">
        <span>الفرضية</span>
        <span className="w-14 text-start">الاحتمال</span>
        <span className="w-14 text-start">بعد التلطيف</span>
      </div>

      <ol className="divide-y">
        {rows.map((row) => (
          <li key={row.id} className="px-4 py-3.5">
            <div className="grid grid-cols-[1fr_auto_auto] items-baseline gap-x-4 sm:gap-x-6">
              <span className="text-sm leading-6">{row.label}</span>
              <span className="numeric w-14 text-sm font-semibold">
                {percent(row.full_weight)}
              </span>
              <span className="numeric w-14 text-sm text-muted-foreground">
                {percent(row.softened_weight)}
              </span>
            </div>
            <div
              aria-hidden="true"
              className="mt-2 h-1 bg-border"
              title={percent(row.full_weight)}
            >
              <div
                className="h-full bg-foreground"
                style={{ width: `${Math.max(row.full_weight, 0.6)}%` }}
              />
            </div>
          </li>
        ))}
      </ol>

      {caption ? (
        <p className="border-t px-4 py-2.5 text-[11px] leading-5 text-muted-foreground">
          {caption}
        </p>
      ) : null}
    </div>
  );
}
