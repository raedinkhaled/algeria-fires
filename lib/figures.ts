import figuresData from "@/public/generated/data/figures.json";

/**
 * فهرس الخرائط والأشكال المنشورة. مصدره `data/figures.json` الذي يكتبه
 * `scripts/publish-figures.mjs` من أصول Fires، فتأتي الأبعاد والأوصاف من
 * الملف المنشور نفسه بدل أن تُكتب في الصفحات.
 */

export type FigureGroup = "map" | "chart" | "satellite";

export type PublishedFigure = {
  id: string;
  group: string;
  group_label: string;
  label: string;
  title: string;
  caption: string;
  note: string | null;
  sensor: string;
  chapter: string;
  path: string;
  width: number;
  height: number;
  bytes: number;
  sha256: string;
  source: string;
};

export const figures = figuresData.figures as PublishedFigure[];

export const figureGroups = figuresData.groups as {
  id: FigureGroup;
  label: string;
  count: number;
}[];

const byId = new Map(figures.map((figure) => [figure.id, figure]));

/** يرمي عند معرّف مجهول: أفضل من صورة مكسورة تمرّ بصمت إلى الإنتاج. */
export function figure(id: string): PublishedFigure {
  const found = byId.get(id);
  if (!found) throw new Error(`شكل غير منشور: ${id}`);
  return found;
}

export function figuresInGroup(group: FigureGroup): PublishedFigure[] {
  return figures.filter((item) => item.group === group);
}
