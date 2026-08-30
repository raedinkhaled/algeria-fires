import type { Metadata } from "next";
import { readFile } from "node:fs/promises";
import path from "node:path";
import GithubSlugger from "github-slugger";
import { DownloadIcon } from "lucide-react";

import { ReportMarkdown } from "@/components/report-markdown";
import { StoryBreadcrumb } from "@/components/story-breadcrumb";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
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
        <StoryBreadcrumb current="التقرير الكامل" />

        <div className="mt-10 grid gap-10 lg:grid-cols-12">
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
              هنا توجد كل التفاصيل: البيانات، الحسابات، الجداول، درجات الثقة،
              وما نحتاج إليه للإجابة عن الأسئلة التي ما زالت مفتوحة.
            </p>
            <div className="mt-8 flex flex-wrap gap-2">
              <Button asChild variant="outline">
                <a href="/generated/report/report_ar_compact.pdf" download>
                  <DownloadIcon data-icon="inline-start" />
                  نسخة PDF
                </a>
              </Button>
              <Button asChild variant="ghost">
                <a href="/generated/documentation/report_ar.md" download>
                  <DownloadIcon data-icon="inline-start" />
                  ملف Markdown
                </a>
              </Button>
            </div>
          </div>
        </div>

        <Accordion type="single" collapsible className="mt-10 border-y lg:hidden">
          <AccordionItem value="toc" className="border-0">
            <AccordionTrigger>فهرس الفصول</AccordionTrigger>
            <AccordionContent>
              <nav aria-label="فهرس التقرير للهاتف" className="flex flex-col">
                {tableOfContents.map((item, index) => (
                  <a key={item.href} href={item.href} className="flex gap-3 border-t py-3 text-sm no-underline">
                    <span className="numeric w-8 shrink-0 text-xs text-muted-foreground">{String(index + 1).padStart(2, "0")}</span>
                    <span>{item.label}</span>
                  </a>
                ))}
              </nav>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </header>

      <Separator />

      <div className="mx-auto grid max-w-7xl gap-12 px-4 pb-20 sm:px-6 lg:grid-cols-12 lg:px-8">
        <aside className="hidden lg:col-span-3 lg:block">
          <nav aria-label="فهرس التقرير" className="sticky top-24 py-10">
            <p className="mb-4 text-xs font-medium">فهرس الفصول</p>
            <ScrollArea className="h-screen pe-5">
              {tableOfContents.map((item, index) => (
                <a key={item.href} href={item.href} className="flex gap-3 border-t py-3 text-xs leading-5 text-muted-foreground hover:text-foreground">
                  <span className="numeric w-8 shrink-0">{String(index + 1).padStart(2, "0")}</span>
                  <span>{item.label}</span>
                </a>
              ))}
            </ScrollArea>
          </nav>
        </aside>

        <div className="min-w-0 pt-2 lg:col-span-8 lg:col-start-5">
          <ReportMarkdown source={source} />
        </div>
      </div>
    </article>
  );
}
