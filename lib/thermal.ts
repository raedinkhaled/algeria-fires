/**
 * أدوات قراءة سلسلة القمر الثابت MSG/SEVIRI كل 15 دقيقة (`msg-frp-series.json`).
 * الشرائح بتوقيت ت.ع.م؛ كل ما يُعرض على الموقع بالتوقيت المحلي (+1).
 * الطوابع هنا «ساعة حائط» محلية مخزّنة كـ UTC، فلا يتدخل منطق المنطقة الزمنية
 * للمتصفح أو الخادم في الموضع.
 */

export type FrpSlot = { t: string; n: number; frp: number };

export const QUARTER_HOUR_MS = 15 * 60 * 1000;
export const DAY_MS = 24 * 60 * 60 * 1000;

/** "2026-08-24 13:40" (ت.ع.م) → طابع محلي. */
export function slotLocalMs(utc: string) {
  return Date.parse(`${utc.replace(" ", "T")}:00Z`) + 60 * 60 * 1000;
}

/** "2026-08-24 14:25" (محلي) → طابع محلي. */
export function localMs(local: string) {
  return Date.parse(`${local.replace(" ", "T")}:00Z`);
}

/*
 * درجات القوة الإشعاعية. الحدود مقرّبة إلى أرقام مستديرة تغطي توزيع السلسلة
 * (الوسيط غير الصفري بالمئات، والذروة 23,162 ميغاواط).
 */
export const heatBins = [
  { max: 100, color: "var(--heat-1)", label: "≤100" },
  { max: 500, color: "var(--heat-2)", label: "100–500" },
  { max: 2000, color: "var(--heat-3)", label: "500–2,000" },
  { max: 8000, color: "var(--heat-4)", label: "2,000–8,000" },
  { max: Number.POSITIVE_INFINITY, color: "var(--heat-5)", label: ">8,000" },
] as const;

export function heatColor(frp: number) {
  return (heatBins.find((bin) => frp <= bin.max) ?? heatBins[heatBins.length - 1]).color;
}

/** يجمع العلامات المتقاربة في مجموعة واحدة ويوزّع تسمياتها على صفوف لا تتراكب. */
export function layoutMarks<T extends { x: number }>(
  marks: T[],
  { mergeWithin, rowGap }: { mergeWithin: number; rowGap: number },
) {
  const sorted = [...marks].sort((first, second) => first.x - second.x);
  const groups: { x: number; items: T[] }[] = [];
  for (const mark of sorted) {
    const last = groups.at(-1);
    if (last && mark.x - last.items.at(-1)!.x <= mergeWithin) last.items.push(mark);
    else groups.push({ x: mark.x, items: [mark] });
  }
  const rowEnds: number[] = [];
  return groups.map((group) => {
    let row = rowEnds.findIndex((end) => group.x - end >= rowGap);
    if (row === -1) {
      row = rowEnds.length;
      rowEnds.push(group.x);
    } else {
      rowEnds[row] = group.x;
    }
    return { ...group, row };
  });
}

/** "14:25 – 14:40" أو "01:35" → دقائق من منتصف الليل. */
export function parseMomentRange(time: string) {
  const matches = [...time.matchAll(/(\d{1,2}):(\d{2})/g)].map(
    ([, hour, minute]) => Number(hour) * 60 + Number(minute),
  );
  const start = matches[0] ?? 0;
  const rawEnd = matches[1];
  // نافذة تعبر منتصف الليل تُقصّ عند نهاية اليوم المعروض.
  const end = rawEnd === undefined ? start : rawEnd < start ? 24 * 60 : rawEnd;
  return { start, end };
}
