import type { Metadata } from "next";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { DownloadIcon } from "lucide-react";

import {
  EdgePanel,
  FileMeta,
  SectionLabel,
  StatStrip,
} from "@/components/editorial";
import { ReadingProgress, Reveal } from "@/components/motion";
import { SourceOverviewChart } from "@/components/source-overview-chart";
import { SourceRegister } from "@/components/source-register";
import { StoryBreadcrumb } from "@/components/story-breadcrumb";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  parseSourceRegister,
  sourceFamilyLabels,
  type SourceFamily,
} from "@/lib/source-register";

export const metadata: Metadata = {
  title: "سجل مصادر حرائق جيجل",
  description:
    "سجل قابل للبحث لكل بيانات الرصد والمصادر الرسمية والإعلامية والمراجع المنهجية المستخدمة، مع الروابط وحالات الوصول والاستبعاد.",
};

const sections = [
  { id: "composition", label: "تركيب السجل" },
  { id: "timing-data", label: "طبقة التوقيت الجديدة" },
  { id: "register", label: "السجل القابل للبحث" },
  { id: "unavailable", label: "مصادر غير متاحة" },
  { id: "quarantine", label: "سجل الحجر" },
  { id: "policy", label: "سياسة الاستعمال" },
];

export default async function SourcesPage() {
  const sourcePath = path.join(
    process.cwd(),
    "public",
    "generated",
    "documentation",
    "sources.md",
  );
  const raw = await readFile(sourcePath, "utf8");
  const { records, unavailable, quarantined } = parseSourceRegister(raw);
  const counts = records.reduce<Record<SourceFamily, number>>(
    (totals, record) => {
      totals[record.family] += 1;
      return totals;
    },
    { DS: 0, OF: 0, MD: 0, ME: 0 },
  );
  const chartData = (Object.keys(counts) as SourceFamily[]).map((family) => ({
    family,
    label: family,
    count: counts[family],
  }));

  return (
    <article className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <ReadingProgress />
      <StoryBreadcrumb current="المصادر" />

      <div className="mt-10 grid gap-8 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-14">
        <aside className="order-2 border-t pt-6 lg:sticky lg:top-16 lg:order-1 lg:self-start lg:border-t-0 lg:border-e lg:pe-8 lg:pt-0">
          <FileMeta
            heading="بيانات السجل"
            rows={[
              { term: "السجلات المرمّزة", value: String(records.length), mono: true },
              { term: "المستوى الأول", value: String(counts.DS + counts.OF), mono: true },
              { term: "غير المتاح", value: String(unavailable.length), mono: true },
              { term: "المحجور", value: String(quarantined.length), mono: true },
              { term: "تاريخ الاطلاع", value: "29.08.2026", mono: true },
              { term: "آخر مزامنة موقع", value: "31.08.2026", mono: true },
            ]}
          />
          <nav aria-label="أقسام سجل المصادر" className="mt-8 hidden border-t pt-5 lg:block">
            <p className="mb-3 text-[11px] font-medium text-muted-foreground">
              محتويات الصفحة
            </p>
            <ol className="flex flex-col gap-2">
              {sections.map((section) => (
                <li key={section.id}>
                  <a
                    href={`#${section.id}`}
                    className="text-[11px] text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {section.label}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        </aside>

        <div className="order-1 min-w-0 lg:order-2">
          <p className="text-[11px] font-medium text-muted-foreground">
            أثر كل ادعاء إلى أصله
          </p>
          <h1 className="mt-4 max-w-3xl text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
            سجل المصادر الكامل
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-9 text-muted-foreground">
            بيانات فضائية وجوية، بلاغات رسمية، تغطية إعلامية، ومراجع منهجية.
            يعرض السجل أيضاً ما تعذّر الوصول إليه وما استُبعد بعد التحقق.
          </p>

          <Alert className="mt-8 max-w-3xl border-s-[3px] border-s-info">
            <AlertTitle>التحقيق الرسمي إجراء، لا نتيجة منشورة</AlertTitle>
            <AlertDescription>
              المصدر OF-07 يثبت أن الدرك الوطني باشر تحقيقات في الأسباب ومدى
              ارتباطها بأفعال إجرامية. لا ينشر نتيجة، ولا يثبت اتهاماً.
            </AlertDescription>
          </Alert>

          <StatStrip
            className="mt-8 max-w-4xl"
            items={[
              { value: String(records.length), unit: "سجل DS / OF / MD / ME" },
              { value: String(counts.DS + counts.OF), unit: "بيانات أو مصدر رسمي" },
              { value: String(counts.MD), unit: "سجل إعلامي" },
              { value: String(unavailable.length), unit: "ثغرة وصول معلنة" },
            ]}
          />

          <Reveal>
            <section id="composition" className="mt-16 scroll-mt-20">
              <SectionLabel>تركيب السجل</SectionLabel>
              <div className="mt-5 grid max-w-4xl gap-6 md:grid-cols-[minmax(0,1fr)_minmax(15rem,0.75fr)]">
                <div>
                  <h2 className="text-2xl font-semibold tracking-tight">
                    أربع عائلات، وأدوار مختلفة
                  </h2>
                  <p className="mt-4 max-w-xl leading-8 text-muted-foreground">
                    اللون هنا دلالي: الأزرق لبيانات الرصد، الأخضر للمصدر الرسمي،
                    البرتقالي للتغطية الإعلامية، والكهرماني للمرجع المنهجي. لا
                    تساوي كثرة المراجع قوة الادعاء؛ القوة تأتي من استقلال القياس
                    وملاءمته للسؤال.
                  </p>
                  <dl className="mt-6 grid grid-cols-2 gap-px border bg-border">
                    {(Object.keys(counts) as SourceFamily[]).map((family) => (
                      <div key={family} className="bg-background p-4">
                        <dt className="ltr-embed text-xs text-muted-foreground">
                          {family}
                        </dt>
                        <dd className="mt-1 text-sm font-medium">
                          {sourceFamilyLabels[family]}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
                <figure className="border bg-card">
                  <SourceOverviewChart data={chartData} />
                  <figcaption className="border-t px-3 py-2.5 text-xs leading-6 text-muted-foreground">
                    عدد السجلات المرمّزة في كل عائلة. المصادر غير المتاحة
                    والمحجورة معروضة منفصلة ولا تدخل هذا العدّ.
                  </figcaption>
                </figure>
              </div>
            </section>
          </Reveal>

          <Reveal>
            <section id="timing-data" className="mt-16 scroll-mt-20">
              <SectionLabel>تحديث البيانات</SectionLabel>
              <h2 className="mt-5 text-2xl font-semibold tracking-tight">
                طبقة تقيس الزمن بدل تخمينه من المرور القطبي
              </h2>
              <div className="mt-6 max-w-3xl">
                <EdgePanel label="DS-05b · Meteosat-10 / MSG" className="border-s-info">
                  <p className="text-lg font-medium leading-8">
                    أضيفت بيانات <span className="ltr-embed">LSA SAF MSG FRP-PIXEL</span> كل
                    15 دقيقة فوق جيجل. ضيّقت نافذة الاشتعال إلى دورة رصد واحدة لست
                    بؤر، وتبقى أربع بؤر أصغر من حدّ كشف المستشعر.
                  </p>
                  <p className="mt-4 leading-8 text-muted-foreground">
                    لا تعني هذه الطبقة أن كل بداية صارت معروفة بدقة ربع ساعة، ولا
                    تحوّل تقارب التوقيت إلى دليل على التنسيق. يظل مستشعر
                    <span className="ltr-embed"> MTG FCI </span>
                    الأدق ضمن المصادر غير المتاحة في السجل.
                  </p>
                </EdgePanel>
              </div>
            </section>
          </Reveal>

          <Reveal>
            <section id="register" className="mt-16 scroll-mt-20">
              <SectionLabel>السجل القابل للبحث</SectionLabel>
              <h2 className="mt-5 text-2xl font-semibold tracking-tight">
                كل سجلات DS وOF وMD وME
              </h2>
              <p className="mt-4 max-w-2xl leading-8 text-muted-foreground">
                ابحث بالمعرّف أو الناشر أو موضوع المصدر. يظهر الرابط المباشر حين
                يكون مسجلاً، وتظهر المراجع الأكاديمية الببليوغرافية كاملة حتى
                عند غياب رابط في الوثيقة الأصلية.
              </p>
              <div className="mt-6">
                <SourceRegister records={records} />
              </div>
            </section>
          </Reveal>

          <Reveal>
            <section id="unavailable" className="mt-16 scroll-mt-20">
              <SectionLabel>مصادر غير متاحة</SectionLabel>
              <h2 className="mt-5 text-2xl font-semibold tracking-tight">
                الغياب مسجّل مع أثره
              </h2>
              <p className="mt-4 max-w-2xl leading-8 text-muted-foreground">
                هذه ليست قائمة طلبات مؤجلة فقط. كل مصدر مفقود يحدد سؤالاً بقي
                أضعف، مثل مواقع الصواعق أو التزامن بدقة 5-15 دقيقة.
              </p>
              <Accordion type="multiple" className="mt-6 max-w-4xl border-y">
                {unavailable.map((item) => (
                  <AccordionItem key={item.source} value={item.source} className="px-1">
                    <AccordionTrigger className="py-4 text-base">
                      {item.source}
                    </AccordionTrigger>
                    <AccordionContent className="pb-4">
                      <dl className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <dt className="text-[11px] text-muted-foreground">الغرض</dt>
                          <dd className="mt-1 text-sm leading-7">{item.purpose}</dd>
                        </div>
                        <div>
                          <dt className="text-[11px] text-muted-foreground">حالة الوصول</dt>
                          <dd className="mt-1 text-sm leading-7 text-warn">{item.result}</dd>
                        </div>
                      </dl>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </section>
          </Reveal>

          <Reveal>
            <section id="quarantine" className="mt-16 scroll-mt-20">
              <SectionLabel>سجل الحجر</SectionLabel>
              <h2 className="mt-5 text-2xl font-semibold tracking-tight">
                أخبار تشبه الحدث، لكنها لا تخصه
              </h2>
              <EdgePanel label="أهم نتيجة في مراجعة المصادر" className="mt-6 max-w-3xl border-s-destructive">
                <p className="text-lg font-medium leading-8">
                  أخبار التوقيف التي ظهرت في نتائج البحث عن أوت 2026 تعود إلى
                  حرائق جويلية 2026 أو أوت 2021. لم تُستعمل لإثبات سبب هذا الحدث.
                </p>
              </EdgePanel>
              <div className="mt-6 max-w-4xl border">
                <Table className="min-w-[820px] table-fixed">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-44">المرجع</TableHead>
                      <TableHead className="w-36">التاريخ الحقيقي</TableHead>
                      <TableHead>طريقة التحقق</TableHead>
                      <TableHead className="w-44">الحكم</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {quarantined.map((item) => (
                      <TableRow key={item.reference}>
                        <TableCell className="align-top whitespace-normal py-3 font-medium">
                          {item.reference}
                        </TableCell>
                        <TableCell className="numeric align-top whitespace-normal py-3 text-xs">
                          {item.date}
                        </TableCell>
                        <TableCell className="align-top whitespace-normal py-3 text-xs leading-6 text-muted-foreground">
                          {item.verification}
                        </TableCell>
                        <TableCell className="align-top whitespace-normal py-3 text-xs font-medium leading-6 text-destructive">
                          {item.verdict}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </section>
          </Reveal>

          <Reveal>
            <section id="policy" className="mt-16 scroll-mt-20">
              <SectionLabel>سياسة الاستعمال</SectionLabel>
              <h2 className="mt-5 text-2xl font-semibold tracking-tight">
                المصدر الأولي يسبق الرواية المنقولة
              </h2>
              <div className="mt-5 flex max-w-2xl flex-col gap-4 leading-8">
                <p>
                  بلاغات الجهات الرسمية على قنواتها المؤسسية تُعامل بوصفها
                  مصادر أولية حتى إن نُشرت عبر منصة اجتماعية. لكن تعذّر جلب بعض
                  هذه الصفحات آلياً، فلم يُبن عليها استنتاج لم يمكن مراجعته.
                </p>
                <p>
                  لم يُستند إلى منشور اجتماعي متداول بوصفه دليلاً. غياب موقع
                  تصوير وزمن تحقق مستقل يجعل الفيديو أو الصورة مادة متابعة، لا
                  واقعة مثبتة.
                </p>
              </div>
              <div className="mt-6 flex min-h-10 items-center border-b">
                <Button asChild variant="ghost" size="sm">
                  <a href="/generated/documentation/sources.md" download>
                    <DownloadIcon data-icon="inline-start" />
                    تنزيل السجل الأصلي
                  </a>
                </Button>
              </div>
            </section>
          </Reveal>
        </div>
      </div>
    </article>
  );
}
