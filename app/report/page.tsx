import type { Metadata } from "next";
import Link from "next/link";
import GithubSlugger from "github-slugger";
import { PrinterIcon } from "lucide-react";

import { FileMeta, SectionLabel } from "@/components/editorial";
import { ReportMarkdown } from "@/components/report-markdown";
import { readReportDocument } from "@/lib/report-document";
import { StoryBreadcrumb } from "@/components/story-breadcrumb";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";

export const metadata: Metadata = {
  title: "التقرير العربي الكامل",
  description:
    "النسخة العربية الكاملة من إعادة البناء الجنائي-الجغرافي لحرائق ولاية جيجل: البيانات والحسابات والجداول ودرجات الثقة.",
};

export default async function ReportPage() {
  const document = await readReportDocument();
  const { source } = document;

  const slugger = new GithubSlugger();
  const chapters = document.chapters.map((label) => ({
    label,
    href: `#${slugger.slug(label)}`,
  }));

  const fileMeta = [
    { term: "الوثيقة", value: "إعادة بناء جنائي-جغرافي" },
    { term: "الأقسام", value: `${chapters.length}`, mono: true },
    { term: "الفترة", value: "22-29.08.2026", mono: true },
    { term: "آخر تحديث", value: "31.08.2026", mono: true },
    { term: "الصيغة", value: "ويب · A4", mono: true },
  ];

  return (
    <article className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <StoryBreadcrumb current="التقرير الكامل" />

      <div className="mt-10 grid gap-8 lg:grid-cols-[220px_1fr] lg:gap-14">
        <aside className="order-2 lg:order-1 lg:border-e lg:pe-8">
          <div className="border-t pt-6 lg:border-t-0 lg:pt-0">
            <FileMeta heading="بيانات الملف" rows={fileMeta} />
          </div>

          <nav
            aria-label="فهرس الفصول"
            className="mt-8 hidden border-t pt-5 lg:block lg:sticky lg:top-14"
          >
            <p className="mb-3 text-[11px] font-medium text-muted-foreground">
              فهرس الفصول
            </p>
            <ScrollArea className="h-[calc(100dvh-11rem)]">
              <ol className="flex flex-col gap-1.5 pe-3">
                {chapters.map((chapter, index) => (
                  <li key={chapter.href}>
                    <a
                      href={chapter.href}
                      className="flex gap-2.5 text-[11px] leading-5 text-muted-foreground transition-colors hover:text-foreground"
                    >
                      <span className="numeric shrink-0">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span>{chapter.label}</span>
                    </a>
                  </li>
                ))}
              </ol>
            </ScrollArea>
          </nav>
        </aside>

        <div className="order-1 min-w-0 lg:order-2">
          <p className="text-[11px] font-medium text-muted-foreground">
            وثيقة التحقيق الكاملة
          </p>
          <h1 className="mt-4 max-w-3xl text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
            {document.title}
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-9 text-muted-foreground">
            كل التفاصيل في مكان واحد: البيانات، الحسابات، الجداول، درجات الثقة،
            وما نحتاج إليه للإجابة عن الأسئلة التي ما زالت مفتوحة.
          </p>

          <Alert className="mt-8 max-w-3xl border-s-[3px] border-s-info">
            <AlertTitle>نسخة محدّثة حتى 31.08.2026</AlertTitle>
            <AlertDescription>
              يضم التقرير أرشيف القمر الثابت <span className="ltr-embed">MSG/SEVIRI</span>
              كل 15 دقيقة في الفصلين 15.6 و15.7. يقيس هذا الأرشيف نوافذ
              الاشتعال لست بؤر، لكنه لا يحوّل تقارب التوقيت إلى إثبات للتنسيق.
            </AlertDescription>
          </Alert>

          <div className="mt-8 flex h-10 items-center gap-1 border-b">
            <Button asChild variant="ghost" size="sm">
              <Link href="/report/print?auto=1">
                <PrinterIcon data-icon="inline-start" />
                حفظ PDF
              </Link>
            </Button>
          </div>

          <Accordion type="single" collapsible className="mt-6 border-y lg:hidden">
            <AccordionItem value="toc" className="border-0 px-1">
              <AccordionTrigger className="py-3 text-sm">
                فهرس الفصول
              </AccordionTrigger>
              <AccordionContent>
                <nav aria-label="فهرس التقرير للهاتف" className="flex flex-col">
                  {chapters.map((chapter, index) => (
                    <a
                      key={chapter.href}
                      href={chapter.href}
                      className="flex gap-3 border-t py-3 text-sm no-underline"
                    >
                      <span className="numeric w-7 shrink-0 text-xs text-muted-foreground">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span>{chapter.label}</span>
                    </a>
                  ))}
                </nav>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <div className="mt-4 max-w-3xl">
            <SectionLabel as="p">نصّ التقرير</SectionLabel>
            <div className="mt-2">
              <ReportMarkdown source={source} />
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
