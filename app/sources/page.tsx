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
    "سجل قابل للبحث لكل بيانات الرصد، والمصادر الرسمية، والإعلامية، والمراجع المنهجية المستخدمة في التحليل، مع تفصيل حالات الوصول للروابط والمواد المستبعدة.",
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
              { term: "غير المتاحة", value: String(unavailable.length), mono: true },
              { term: "المستبعدة (سجل الحجر)", value: String(quarantined.length), mono: true },
              { term: "تاريخ الاطلاع", value: "29.08.2026", mono: true },
              { term: "آخر تحديث للموقع", value: "31.08.2026", mono: true },
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
            تتبع أثر كل معلومة إلى مصدرها
          </p>
          <h1 className="mt-4 max-w-3xl text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
            سجل المصادر الكامل
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-9 text-muted-foreground">
            يضم هذا السجل بيانات الأقمار الاصطناعية، البلاغات الرسمية، التغطيات الإعلامية، والمراجع المنهجية المعتمدة. كما يوضّح بصراحة ما تعذّر الوصول إليه من بيانات، وما تم استبعاده لتفادي التضليل.
          </p>

          <Alert className="mt-8 max-w-3xl border-s-[3px] border-s-info">
            <AlertTitle>تحقيقات الدرك الوطني: إجراء أمني وليس نتيجة معلنة</AlertTitle>
            <AlertDescription>
              يؤكد المصدر (OF-07) أن قوات الدرك الوطني باشرت التحقيق في أسباب الحرائق ومدى ارتباطها بأفعال إجرامية. هذا الإعلان يوثق بدء التحريات الرسمية الجادة، ولكنه لا يمثل إدانة لجهات بعينها حتى تنتهي التحقيقات.
            </AlertDescription>
          </Alert>

          <StatStrip
            className="mt-8 max-w-4xl"
            items={[
              { value: String(records.length), unit: "سجل مصادر شامل" },
              { value: String(counts.DS + counts.OF), unit: "مصدر بيانات أو بلاغ رسمي" },
              { value: String(counts.MD), unit: "سجل إعلامي" },
              { value: String(unavailable.length), unit: "مصدر بيانات غير متاح (ثغرة معلنة)" },
            ]}
          />

          <Reveal>
            <section id="composition" className="mt-16 scroll-mt-20">
              <SectionLabel>تركيب السجل</SectionLabel>
              <div className="mt-5 grid max-w-4xl gap-6 md:grid-cols-[minmax(0,1fr)_minmax(15rem,0.75fr)]">
                <div>
                  <h2 className="text-2xl font-semibold tracking-tight">
                    أربع عائلات للمصادر بأدوار محددة
                  </h2>
                  <p className="mt-4 max-w-xl leading-8 text-muted-foreground">
                    اللون هنا له دلالة: الأزرق لبيانات الرصد الفضائي، الأخضر للمصادر والبلاغات الرسمية، البرتقالي للتغطية الإعلامية، والكهرماني للمراجع الأكاديمية والمنهجية. قوة الاستنتاج لا تُقاس بكثرة المصادر فحسب، بل باستقلالها ومصداقيتها في الإجابة عن السؤال المطروح.
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
                    عدد السجلات الموثقة في كل عائلة. المصادر التي تعذّر الوصول إليها أو التي تم استبعادها تُعرض في جداول منفصلة ولا تدخل ضمن هذا العدد.
                  </figcaption>
                </figure>
              </div>
            </section>
          </Reveal>

          <Reveal>
            <section id="timing-data" className="mt-16 scroll-mt-20">
              <SectionLabel>تحديث البيانات</SectionLabel>
              <h2 className="mt-5 text-2xl font-semibold tracking-tight">
                طبقة توقيت دقيقة لقياس التزامن الفعلي
              </h2>
              <div className="mt-6 max-w-3xl">
                <EdgePanel label="DS-05b · القمر الثابت Meteosat-10 / MSG" className="border-s-info">
                  <p className="text-lg font-medium leading-8">
                    أضيفت بيانات الرصد الحراري <span className="ltr-embed">LSA SAF MSG FRP-PIXEL</span> التي تُحدّث كل 15 دقيقة فوق جيجل. هذه الإضافة قلّصت النافذة الزمنية (وقت انتظار مرور القمر) إلى ربع ساعة لست بؤر اشتعال كبيرة، في حين تظل أربع بؤر أخرى خافتة وأصغر من أن يكتشفها هذا المستشعر.
                  </p>
                  <p className="mt-4 leading-8 text-muted-foreground">
                    هذه الطبقة مهمة لأنها تقدم قياساً أدق للوقت، ولكن التقارب الزمني لا يعني بالضرورة تنسيقاً فاعلاً بدون تحريات أمنية. تجدر الإشارة إلى أن مستشعر <span className="ltr-embed">MTG FCI</span> الحديث يُعد الأدق، ولكنه صُنّف ضمن البيانات غير المتاحة لنا حالياً.
                  </p>
                </EdgePanel>
              </div>
            </section>
          </Reveal>

          <Reveal>
            <section id="register" className="mt-16 scroll-mt-20">
              <SectionLabel>السجل القابل للبحث</SectionLabel>
              <h2 className="mt-5 text-2xl font-semibold tracking-tight">
                ابحث في جميع السجلات المعتمدة
              </h2>
              <p className="mt-4 max-w-2xl leading-8 text-muted-foreground">
                يمكنك البحث باستخدام المعرّف (ID)، اسم الناشر، أو موضوع المصدر. يظهر الرابط المباشر للوثيقة عند توفره، بينما تُعرض المراجع الأكاديمية بتفاصيلها الببليوغرافية كاملة.
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
                الغياب مسجّل وله أثر
              </h2>
              <p className="mt-4 max-w-2xl leading-8 text-muted-foreground">
                توثيق المصادر المفقودة ليس مجرد قائمة مؤجلة. غياب أي مصدر يعني وجود ثغرة تقنية محددة في التحليل، مثل غياب بيانات شبكات كشف الصواعق أو بيانات الرصد الحراري الفائق الدقة (كل 5-15 دقيقة).
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
                          <dt className="text-[11px] text-muted-foreground">الغرض من المصدر</dt>
                          <dd className="mt-1 text-sm leading-7">{item.purpose}</dd>
                        </div>
                        <div>
                          <dt className="text-[11px] text-muted-foreground">نتيجة محاولة الوصول</dt>
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
              <SectionLabel>سجل الحجر (البيانات المستبعدة)</SectionLabel>
              <h2 className="mt-5 text-2xl font-semibold tracking-tight">
                أخبار مضللة لا علاقة لها بحرائق جيجل في أوت
              </h2>
              <EdgePanel label="أهم نتيجة في تنقية المصادر" className="mt-6 max-w-3xl border-s-destructive">
                <p className="text-lg font-medium leading-8">
                  تداولت بعض المنصات أخباراً عن توقيف أشخاص متورطين. بالتدقيق، تبيّن أن جميع هذه الأخبار تعود لتواريخ سابقة (حرائق جويلية 2026 أو حرائق أوت 2021). ولضمان نزاهة التحقيق، تم استبعادها تماماً ولن نعتمد عليها في تحليلنا لحرائق أوت 2026.
                </p>
              </EdgePanel>
              <div className="mt-6 max-w-4xl border">
                <Table className="min-w-[820px] table-fixed">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-44">الخبر / المرجع</TableHead>
                      <TableHead className="w-36">التاريخ الحقيقي للحدث</TableHead>
                      <TableHead>كيف تم التحقق؟</TableHead>
                      <TableHead className="w-44">القرار النهائي</TableHead>
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
              <SectionLabel>سياسة الاستعمال المعتمدة</SectionLabel>
              <h2 className="mt-5 text-2xl font-semibold tracking-tight">
                نعتمد على المصدر الأولي والموثق حصراً
              </h2>
              <div className="mt-5 flex max-w-2xl flex-col gap-4 leading-8">
                <p>
                  نعتمد على البيانات والبلاغات الصادرة عن قنوات الجهات الرسمية كمصادر أولية، حتى وإن تم نشرها عبر منصات التواصل الاجتماعي الخاصة بها. ومع ذلك، فإن أي بلاغ رسمي تعذّر التحقق منه مباشرة لم نقم ببناء استنتاج حيوي عليه.
                </p>
                <p>
                  لم يتم استخدام أي مقاطع فيديو أو صور مجهولة المصدر متداولة على وسائل التواصل الاجتماعي كدليل. لغياب مواقع التصوير الدقيقة والتوثيق الزمني، تُعتبر هذه المواد مجرد وسائط للمتابعة ولا تصلح كوقائع مثبتة في تحليل جنائي جغرافي.
                </p>
              </div>
              <div className="mt-6 flex min-h-10 items-center border-b">
                <Button asChild variant="ghost" size="sm">
                  <a href="/generated/documentation/sources.md" download>
                    <DownloadIcon data-icon="inline-start" />
                    تنزيل السجل الأصلي كاملاً
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