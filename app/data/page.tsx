import type { Metadata } from "next";
import { readFile } from "node:fs/promises";
import path from "node:path";

import { DataExplorer, type OriginRow, type PatchRow } from "@/components/data-explorer";
import { FileMeta } from "@/components/editorial";
import { StoryBreadcrumb } from "@/components/story-breadcrumb";
import { dataSections } from "@/lib/data-sections";
import activity from "@/public/generated/data/daily_activity.json";
import downloads from "@/public/generated/downloads.json";

export const metadata: Metadata = {
  title: "مستكشف بيانات حرائق جيجل",
  description:
    "رسوم وجداول قابلة للتصفية وتنزيلات للبيانات المعالجة المستخدمة في تحليل حرائق جيجل.",
};

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let value = "";
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    if (character === '"') {
      if (quoted && text[index + 1] === '"') {
        value += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
    } else if (character === "," && !quoted) {
      row.push(value);
      value = "";
    } else if ((character === "\n" || character === "\r") && !quoted) {
      if (character === "\r" && text[index + 1] === "\n") index += 1;
      row.push(value);
      if (row.some((cell) => cell !== "")) rows.push(row);
      row = [];
      value = "";
    } else {
      value += character;
    }
  }
  row.push(value);
  if (row.some((cell) => cell !== "")) rows.push(row);
  return rows;
}

async function readCsvRows<T>(filename: string): Promise<T[]> {
  const text = await readFile(
    path.join(process.cwd(), "public", "generated", "data", filename),
    "utf8",
  );
  const [header, ...rows] = parseCsv(text);
  return rows.map((row) =>
    Object.fromEntries(header.map((key, index) => [key, row[index] ?? ""])) as T,
  );
}

const fileMeta = [
  { term: "القسم", value: "البيانات" },
  { term: "الفترة", value: "23-29.08.2026", mono: true },
  { term: "الرصدات", value: "9,100", mono: true },
  { term: "الخلايا", value: "4,451", mono: true },
  { term: "المنشأ", value: "12 مرشحاً" },
  { term: "التنسيقات", value: "CSV · JSON · ZIP", mono: true },
];

export default async function DataPage() {
  const [origins, patches] = await Promise.all([
    readCsvRows<OriginRow>("independent_origins.csv"),
    readCsvRows<PatchRow>("burn_patches.csv"),
  ]);

  return (
    <article className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <StoryBreadcrumb current="البيانات" />

      <div className="mt-10 grid gap-8 lg:grid-cols-[220px_1fr] lg:gap-14">
        <aside className="order-2 border-t pt-6 lg:sticky lg:top-14 lg:order-1 lg:self-start lg:border-t-0 lg:border-e lg:pe-8 lg:pt-0">
          <FileMeta heading="بيانات الملف" rows={fileMeta} />
          <nav
            aria-label="أقسام الصفحة"
            className="mt-8 hidden border-t pt-5 lg:block"
          >
            <p className="mb-3 text-[11px] font-medium text-muted-foreground">
              الأقسام
            </p>
            <ol className="flex flex-col gap-2">
              {dataSections.map((section) => (
                <li key={section.id}>
                  <a
                    href={`#${section.id}`}
                    className="flex gap-2.5 text-[11px] text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <span className="numeric">{section.index}</span>
                    <span>{section.label}</span>
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        </aside>

        <div className="order-1 min-w-0 lg:order-2">
          <p className="text-[11px] font-medium text-muted-foreground">المستكشف</p>
          <h1 className="mt-4 max-w-2xl text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
            افحص البيانات المعالجة بنفسك
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-9">
            هذه الرسوم والجداول تعيد عرض مجموعة التحليل المنشورة، مع مرشحي المنشأ
            والندبات الكبرى. كل نقطة حرارية رصد قمري وليست نقطة اشتعال مؤكدة.
          </p>

          <DataExplorer
            activity={activity.days}
            origins={origins}
            patches={patches}
            downloads={downloads.artifacts}
          />
        </div>
      </div>
    </article>
  );
}
