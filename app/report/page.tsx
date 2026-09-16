import type { Metadata } from "next";
import Link from "next/link";
import GithubSlugger from "github-slugger";
import { PrinterIcon } from "lucide-react";

import { Dossier, Masthead, NightPanel } from "@/components/editorial";
import { ReportMarkdown } from "@/components/report-markdown";
import { readReportDocument } from "@/lib/report-document";
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
    "التقرير الكامل عن حرائق جيجل: ما حدث، وما تقوله البيانات، وما لا نعرفه بعد.",
};

/* الفصل يحمل رقمه في نصّه («1. الملخص التنفيذي»)؛ يُفصل للعرض فقط والمرساة بالنص الكامل. */
function splitChapter(label: string, position: number) {
  const match = label.match(/^(\d+)\.\s*(.+)$/);
  return match
    ? { number: match[1].padStart(2, "0"), text: match[2] }
    : { number: String(position + 1).padStart(2, "0"), text: label };
}

export default async function ReportPage() {
  const document = await readReportDocument();
  const { source } = document;

  const slugger = new GithubSlugger();
  const chapters = document.chapters.map((label, position) => ({
    label,
    href: `#${slugger.slug(label)}`,
    ...splitChapter(label, position),
  }));

  /* طول كل فصل بالكلمات، من نصّ التقرير نفسه: خريطة الوثيقة قبل قراءتها */
  const chapterWords = source
    .split(/^#\s+/m)
    .slice(1)
    .map((block) => block.split(/\s+/).filter(Boolean).length);
  const maxWords = Math.max(1, ...chapterWords);
  const totalWords = chapterWords.reduce((sum, words) => sum + words, 0);

  const fileMeta = [
    { term: "الوثيقة", value: "تحليل مستقل للحرائق" },
    { term: "الأقسام", value: `${chapters.length}`, mono: true },
    { term: "الفترة", value: "22-29.08.2026", mono: true },
    { term: "آخر تحديث", value: "31.08.2026", mono: true },
    { term: "الصيغة", value: "ويب · A4", mono: true },
  ];

  return (
    <article className="publication mx-auto max-w-7xl px-4 pb-16 pt-6 sm:px-6 lg:px-8">
      <Masthead
        current="التقرير الكامل"
        file="05"
        kicker="وثيقة التحقيق الكاملة"
        title={document.title}
        lede="يشرح هذا التقرير ما حدث، وما الذي تدعمه البيانات، وما الذي ما زلنا لا نعرفه. الأرقام والجداول موجودة لمن يريد التحقق من كل نتيجة."
        meta={fileMeta}
        panel={
          <NightPanel label="بنية التقرير" meta={`${chapters.length} فصلاً`}>
            <dl className="grid grid-cols-2 gap-px bg-border">
              <div className="flex flex-col-reverse justify-end bg-background px-5 py-4">
                <dt className="mt-2 text-[12px] text-muted-foreground">فصلاً</dt>
                <dd className="figure-num text-[2.5rem] font-light leading-none">{chapters.length}</dd>
              </div>
              <div className="flex flex-col-reverse justify-end bg-background px-5 py-4">
                <dt className="mt-2 text-[12px] text-muted-foreground">كلمة تقريباً</dt>
                <dd className="figure-num text-[2.5rem] font-light leading-none">
                  {(Math.round(totalWords / 1000) * 1000).toLocaleString("en")}
                </dd>
              </div>
            </dl>
            <div className="mt-auto border-t border-border px-5 pb-5 pt-4">
              <p className="text-[12px] font-medium">طول كل فصل · اختر فصلاً للانتقال إليه</p>
              <ol className="mt-4 flex h-32 items-end gap-[3px]">
                {chapters.map((chapter, position) => (
                  <li key={chapter.href} className="flex h-full flex-1 items-end">
                    <a
                      href={chapter.href}
                      title={`${chapter.number} · ${chapter.text}`}
                      aria-label={`${chapter.number} · ${chapter.text}`}
                      className="block w-full bg-foreground/35 transition-colors hover:bg-signal focus-visible:bg-signal focus-visible:outline-none"
                      style={{ height: `${Math.max(4, ((chapterWords[position] ?? 0) / maxWords) * 100)}%` }}
                    />
                  </li>
                ))}
              </ol>
              <p className="mt-2 flex justify-between text-[10.5px] text-muted-foreground">
                <span className="numeric">01</span>
                <span className="numeric">{chapters.length}</span>
              </p>
            </div>
          </NightPanel>
        }
      >
        <div className="mt-10 grid items-start gap-6 lg:grid-cols-12">
          <Alert className="border-s-orbit lg:col-span-8">
            <AlertTitle>نسخة محدّثة حتى 31.08.2026</AlertTitle>
            <AlertDescription>
              يضم التقرير صور القمر الثابت <span className="ltr-embed">MSG/SEVIRI</span>{" "}
              كل 15 دقيقة في الفصلين 15.6 و15.7. ساعدت هذه الصور في تحديد وقت
              بداية ست بؤر، لكنها لا تثبت أن البدايات القريبة كانت عملاً منسقاً.
            </AlertDescription>
          </Alert>
          <div className="flex lg:col-span-4 lg:justify-end">
            <Button asChild size="lg" className="h-11 px-5">
              <Link href="/report/print?auto=1">
                <PrinterIcon data-icon="inline-start" />
                حفظ PDF
              </Link>
            </Button>
          </div>
        </div>
      </Masthead>

      <Dossier
        aside={
          <nav aria-label="فهرس الفصول">
            <p className="flex items-center justify-between border-b border-rule pb-2 text-[11px] font-medium">
              فهرس الفصول
              <span className="numeric text-muted-foreground">{chapters.length}</span>
            </p>
            <ScrollArea className="h-[calc(100dvh-9.5rem)]">
              <ol className="flex flex-col pe-3">
                {chapters.map((chapter) => (
                  <li key={chapter.href}>
                    <a
                      href={chapter.href}
                      className="group relative flex gap-3 border-b border-border py-2 text-[12px] leading-5 text-muted-foreground transition-colors hover:text-foreground aria-[current=location]:font-medium aria-[current=location]:text-foreground"
                    >
                      <span className="numeric w-5 shrink-0 text-[10.5px] font-normal group-aria-[current=location]:text-signal-ink">
                        {chapter.number}
                      </span>
                      <span>{chapter.text}</span>
                    </a>
                  </li>
                ))}
              </ol>
            </ScrollArea>
          </nav>
        }
      >
        <Accordion type="single" collapsible className="border-y border-rule lg:hidden">
          <AccordionItem value="toc" className="border-0">
            <AccordionTrigger className="rounded-none py-3.5 text-sm hover:no-underline">
              فهرس الفصول
            </AccordionTrigger>
            <AccordionContent>
              <nav aria-label="فهرس التقرير للهاتف" className="flex flex-col">
                {chapters.map((chapter) => (
                  <a
                    key={chapter.href}
                    href={chapter.href}
                    className="flex gap-3 border-t border-border py-3 text-sm no-underline"
                  >
                    <span className="numeric w-7 shrink-0 text-xs text-muted-foreground">
                      {chapter.number}
                    </span>
                    <span>{chapter.text}</span>
                  </a>
                ))}
              </nav>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <div className="max-w-[46rem]">
          <p className="sr-only">التقرير</p>
          <ReportMarkdown source={source} />
        </div>
      </Dossier>
    </article>
  );
}
