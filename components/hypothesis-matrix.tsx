import { cn } from "@/lib/utils";

/**
 * احتمالات مصفوفة الفرضيات المتنافسة. القيم من `data/forensic-summary.json`،
 * وهي أرقام المصفوفة بعد تحليل القوة وقاعدة التماثل (الفصل 26.4).
 * الشريط بالحبر للوزن الكامل، والعلامة الرفيعة لما بعد التلطيف:
 * هذه احتمالات لا درجات ثقة، فلا لون دلالي.
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
    <div className={cn("border-t border-rule", className)}>
      <div className="grid grid-cols-[1fr_4.5rem_4.5rem] gap-x-4 border-b border-border py-2.5 text-[11px] text-muted-foreground sm:grid-cols-[1fr_6rem_6rem]">
        <span>الفرضية</span>
        <span>الاحتمال</span>
        <span>بعد التلطيف</span>
      </div>

      <ol>
        {rows.map((row) => (
          <li key={row.id} className="border-b border-border py-4">
            <div className="grid grid-cols-[1fr_4.5rem_4.5rem] items-baseline gap-x-4 sm:grid-cols-[1fr_6rem_6rem]">
              <span className="text-[15px] leading-7">{row.label}</span>
              <span className="figure-num text-[22px] font-light leading-none sm:text-[26px]">
                {percent(row.full_weight)}
              </span>
              <span className="figure-num text-[15px] leading-none text-muted-foreground">
                {percent(row.softened_weight)}
              </span>
            </div>
            <div
              aria-hidden="true"
              dir="ltr"
              className="relative mt-3 h-1.5 bg-muted"
              title={percent(row.full_weight)}
            >
              <div
                className="h-full bg-foreground"
                style={{ width: `${Math.max(row.full_weight, 0.6)}%` }}
              />
              <span
                className="absolute -top-1 h-3.5 w-0.5 bg-signal"
                style={{ left: `${row.softened_weight}%` }}
              />
            </div>
          </li>
        ))}
      </ol>

      {caption ? (
        <p className="pt-3 text-[12.5px] leading-7 text-muted-foreground">
          {caption}
        </p>
      ) : null}
      <p className="flex flex-wrap items-center gap-x-5 gap-y-1 pt-2 text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span aria-hidden="true" className="h-1.5 w-4 bg-foreground" />
          الاحتمال
        </span>
        <span className="flex items-center gap-1.5">
          <span aria-hidden="true" className="h-3 w-0.5 bg-signal" />
          بعد التلطيف
        </span>
      </p>
    </div>
  );
}
