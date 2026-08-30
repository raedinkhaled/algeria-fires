import type { Metadata } from "next";
import { readFile } from "node:fs/promises";
import path from "node:path";
import GithubSlugger from "github-slugger";

import { ReportMarkdown } from "@/components/report-markdown";
import { Separator } from "@/components/ui/separator";

export const metadata: Metadata = {
  title: "التقرير العربي الكامل",
  description:
    "النسخة العربية الكاملة من إعادة البناء الجنائي-الجغرافي لحرائق ولاية جيجل.",
};

const digitMap: Record<string, string> = {
  "٠": "0",
  "١": "1",
  "٢": "2",
  "٣": "3",
  "٤": "4",
  "٥": "5",
  "٦": "6",
  "٧": "7",
  "٨": "8",
  "٩": "9",
};

function toWesternDigits(value: string): string {
  return value.replace(/[٠-٩]/g, (digit) => digitMap[digit]);
}

function plainHeading(value: string): string {
  return value
    .replace(/[`*_~]/g, "")
    .replace(/\[(.*?)\]\([^)]*\)/g, "$1")
    .trim();
}

export default async function ReportPage() {
  const reportPath = path.join(
    process.cwd(),
    "public",
    "generated",
    "documentation",
    "report_ar.md",
  );
  const raw = toWesternDigits(await readFile(reportPath, "utf8"));
  const lines = raw.replace(/^\uFEFF/, "").split(/\r?\n/);
  const documentTitle = lines[0]?.replace(/^#\s+/, "") || "التقرير العربي الكامل";
  const source = lines.slice(1).join("\n");

  const slugger = new GithubSlugger();
  const tableOfContents = Array.from(source.matchAll(/^#\s+(.+)$/gm)).map(
    ([, heading]) => {
      const label = plainHeading(heading);
      return { label, href: `#${slugger.slug(label)}` };
    },
  );

  return (
    <article className="overflow-x-clip">
      <header className="mx-auto max-w-7xl px-4 pb-12 pt-10 sm:px-6 sm:pb-16 sm:pt-14 lg:px-8 lg:pb-20">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="text-sm leading-6 text-muted-foreground lg:col-span-3">
            <p className="font-medium text-foreground">وثيقة التحقيق</p>
            <p className="mt-2">المراجعة 4</p>
            <p className="mt-1">32 فصلاً و3 أقسام</p>
            <p className="numeric mt-1">22–29.08.2026</p>
          </div>
          <div className="lg:col-span-8 lg:col-start-5">
            <h1 className="max-w-4xl text-4xl font-semibold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              {documentTitle}
            </h1>
            <p className="mt-7 max-w-3xl text-lg leading-9 text-muted-foreground">
              النص الكامل كما تولّده سلسلة التحقيق، بما في ذلك التصحيحات،
              الجداول، درجات الثقة، القيود، وسجل ما يلزم لحسم الأسئلة المفتوحة.
            </p>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm">
              <a
                href="/generated/report/report_ar_compact.pdf"
                download
                className="font-medium underline decoration-border underline-offset-8 hover:decoration-foreground"
              >
                تنزيل PDF المضغوط
              </a>
              <a
                href="/generated/documentation/report_ar.md"
                download
                className="text-muted-foreground underline decoration-border underline-offset-8 hover:text-foreground hover:decoration-foreground"
              >
                تنزيل Markdown
              </a>
            </div>
          </div>
        </div>

        <details className="mt-10 border-y py-4 lg:hidden">
          <summary className="cursor-pointer font-medium">فهرس الفصول</summary>
          <nav aria-label="فهرس التقرير للهاتف" className="mt-5 flex flex-col">
            {tableOfContents.map((item, index) => (
              <a
                key={item.href}
                href={item.href}
                className="flex gap-3 border-t py-3 text-sm"
              >
                <span className="numeric w-8 shrink-0 text-xs text-muted-foreground">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span>{item.label}</span>
              </a>
            ))}
          </nav>
        </details>
      </header>

      <Separator />

      <div className="mx-auto grid max-w-7xl gap-12 px-4 pb-20 sm:px-6 lg:grid-cols-12 lg:px-8">
        <aside className="hidden lg:col-span-3 lg:block">
          <nav
            aria-label="فهرس التقرير"
            className="sticky top-24 max-h-screen overflow-y-auto py-10 pe-5"
          >
            <p className="mb-4 text-xs font-medium">فهرس الفصول</p>
            {tableOfContents.map((item, index) => (
              <a
                key={item.href}
                href={item.href}
                className="flex gap-3 border-t py-3 text-xs leading-5 text-muted-foreground hover:text-foreground"
              >
                <span className="numeric w-8 shrink-0">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span>{item.label}</span>
              </a>
            ))}
          </nav>
        </aside>

        <div className="min-w-0 pt-2 lg:col-span-8 lg:col-start-5">
          <ReportMarkdown source={source} />
        </div>
      </div>
    </article>
  );
}
