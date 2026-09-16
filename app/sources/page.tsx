import type { Metadata } from "next";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { DownloadIcon } from "lucide-react";

import {
  Dossier,
  EdgePanel,
  Masthead,
  NightPanel,
  SectionLabel,
  StatStrip,
} from "@/components/editorial";
import { Reveal } from "@/components/motion";
import { SourceOverviewChart } from "@/components/source-overview-chart";
import { SourceRegister } from "@/components/source-register";
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

const indexedSections = sections.map((section, position) => ({
  ...section,
  index: String(position + 1).padStart(2, "0"),
}));

/* لون كل عائلة كما في الرسم والسجل: مداري للرصد، أخضر للرسمي، برتقالي للإعلام، كهرماني للمراجع */
const familySwatch: Record<SourceFamily, string> = {
  DS: "bg-info",
  OF: "bg-ok",
  MD: "bg-support",
  ME: "bg-warn",
};

function SectionHead({ id, title }: { id: string; title: string }) {
  const section = indexedSections.find((item) => item.id === id)!;
  return (
    <>
      <SectionLabel as="p" index={section.index}>
        {section.label}
      </SectionLabel>
      <h2 className="mt-3 text-[clamp(1.5rem,2.6vw,2.125rem)] font-semibold leading-[1.45]">
        {title}
      </h2>
    </>
  );
}

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
    <article className="publication mx-auto max-w-7xl px-4 pb-16 pt-6 sm:px-6 lg:px-8">
      <Masthead
        current="المصادر"
        file="07"
        kicker="تتبع أثر كل معلومة إلى مصدرها"
        title="سجل المصادر الكامل"
        lede="يضم هذا السجل بيانات الأقمار الاصطناعية، البلاغات الرسمية، التغطيات الإعلامية، والمراجع المنهجية المعتمدة. كما يوضّح بصراحة ما تعذّر الوصول إليه من بيانات، وما تم استبعاده لتفادي التضليل."
        meta={[
          { term: "السجلات المرمّزة", value: String(records.length), mono: true },
          { term: "المستوى الأول", value: String(counts.DS + counts.OF), mono: true },
          { term: "غير المتاحة", value: String(unavailable.length), mono: true },
          { term: "المستبعدة (سجل الحجر)", value: String(quarantined.length), mono: true },
          { term: "تاريخ الاطلاع", value: "29.08.2026", mono: true },
          { term: "آخر تحديث للموقع", value: "31.08.2026", mono: true },
        ]}
        panel={
          <NightPanel label="تركيب السجل" meta={`${records.length} سجلاً`}>
            <div className="px-5 pb-5 pt-5">
              <div className="flex h-10 gap-[3px]" dir="rtl">
                {(Object.keys(counts) as SourceFamily[]).map((family) => (
                  <span
                    key={family}
                    aria-hidden="true"
                    className={familySwatch[family]}
                    style={{ flexGrow: counts[family], flexBasis: 0 }}
                  />
                ))}
              </div>
              <dl className="mt-5 grid grid-cols-2 gap-x-6">
                {(Object.keys(counts) as SourceFamily[]).map((family) => (
                  <div key={family} className="flex items-baseline justify-between gap-3 border-b border-border py-2.5">
                    <dt className="flex items-center gap-2 text-[12.5px]">
                      <span aria-hidden="true" className={`size-2.5 ${familySwatch[family]}`} />
                      {sourceFamilyLabels[family]}
                    </dt>
                    <dd className="figure-num text-[1.375rem] font-light leading-none">{counts[family]}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <dl className="mt-auto grid grid-cols-2 gap-px border-t border-border bg-border">
              <div className="flex flex-col-reverse justify-end bg-background px-5 py-4">
                <dt className="mt-2 text-[12px] text-muted-foreground">غير المتاحة</dt>
                <dd className="figure-num text-[2rem] font-light leading-none text-warn">{unavailable.length}</dd>
              </div>
              <div className="flex flex-col-reverse justify-end bg-background px-5 py-4">
                <dt className="mt-2 text-[12px] text-muted-foreground">المستبعدة (سجل الحجر)</dt>
                <dd className="figure-num text-[2rem] font-light leading-none text-destructive">{quarantined.length}</dd>
              </div>
            </dl>
          </NightPanel>
        }
      >
        <p className="sr-only">بيانات السجل</p>
      </Masthead>

      <Alert className="mt-10 max-w-3xl border-s-orbit">
        <AlertTitle>تحقيقات الدرك الوطني: إجراء أمني وليس نتيجة معلنة</AlertTitle>
        <AlertDescription>
          يؤكد المصدر (OF-07) أن قوات الدرك الوطني باشرت التحقيق في أسباب الحرائق ومدى ارتباطها بأفعال إجرامية. هذا الإعلان يوثق بدء التحريات الرسمية الجادة، ولكنه لا يمثل إدانة لجهات بعينها حتى تنتهي التحقيقات.
        </AlertDescription>
      </Alert>

      <StatStrip
        className="mt-12"
        items={[
          { value: String(records.length), unit: "سجل مصادر شامل" },
          { value: String(counts.DS + counts.OF), unit: "مصدر بيانات أو بلاغ رسمي" },
          { value: String(counts.MD), unit: "سجل إعلامي" },
          { value: String(unavailable.length), unit: "مصدر بيانات غير متاح (ثغرة معلنة)" },
        ]}
      />

      <Dossier index={indexedSections} indexHeading="محتويات الصفحة" indexLabel="أقسام سجل المصادر">
        <Reveal>
          <section id="composition">
            <SectionHead id="composition" title="أربع عائلات للمصادر بأدوار محددة" />
            <p className="mt-6 max-w-2xl text-[16px] leading-8 text-muted-foreground">
              اللون هنا له دلالة: الأزرق لبيانات الرصد الفضائي، الأخضر للمصادر والبلاغات الرسمية، البرتقالي للتغطية الإعلامية، والكهرماني للمراجع الأكاديمية والمنهجية. قوة الاستنتاج لا تُقاس بكثرة المصادر فحسب، بل باستقلالها ومصداقيتها في الإجابة عن السؤال المطروح.
            </p>
            <div className="mt-10 grid gap-10 xl:grid-cols-[minmax(0,1fr)_minmax(18rem,0.8fr)]">
              <dl className="grid grid-cols-2 gap-px self-start border-t border-rule bg-border">
                {(Object.keys(counts) as SourceFamily[]).map((family) => (
                  <div key={family} className="flex flex-col bg-background py-5 pe-4">
                    <dt className="flex items-center gap-2">
                      <span aria-hidden="true" className={`size-2.5 ${familySwatch[family]}`} />
                      <span className="ltr-embed text-xs text-muted-foreground">{family}</span>
                    </dt>
                    <dd className="mt-3 text-[15px] font-semibold leading-7">
                      {sourceFamilyLabels[family]}
                    </dd>
                    <dd className="figure-num mt-2 text-[2.5rem] font-light leading-none">
                      {counts[family]}
                    </dd>
                  </div>
                ))}
              </dl>
              <figure className="data-figure min-w-0">
                <div className="flex min-h-9 items-center border-t border-rule py-2 text-[11px] text-muted-foreground">
                  <span className="ltr-embed">DS · OF · MD · ME</span>
                </div>
                <div className="border border-border bg-card px-2 pt-2">
                  <SourceOverviewChart data={chartData} />
                </div>
                <figcaption className="grid gap-x-6 gap-y-1 pt-3 text-[13px] leading-7 text-muted-foreground sm:grid-cols-[4rem_minmax(0,1fr)]">
                  <span className="text-[11px] font-medium leading-7 text-foreground">
                    شكل <span className="numeric figure-index" />
                  </span>
                  <span>
                    عدد السجلات الموثقة في كل عائلة. المصادر التي تعذّر الوصول إليها أو التي تم استبعادها تُعرض في جداول منفصلة ولا تدخل ضمن هذا العدد.
                  </span>
                </figcaption>
              </figure>
            </div>
          </section>
        </Reveal>

        <Reveal className="mt-24">
          <section id="timing-data">
            <SectionLabel as="p" index={indexedSections[1].index}>
              تحديث البيانات
            </SectionLabel>
            <h2 className="mt-3 text-[clamp(1.5rem,2.6vw,2.125rem)] font-semibold leading-[1.45]">
              طبقة توقيت دقيقة لقياس التزامن الفعلي
            </h2>
            <EdgePanel label="DS-05b · القمر الثابت Meteosat-10 / MSG" tone="info" className="mt-10 max-w-3xl">
              <p className="text-lg font-medium leading-9">
                أضيفت بيانات الرصد الحراري <span className="ltr-embed">LSA SAF MSG FRP-PIXEL</span> التي تُحدّث كل 15 دقيقة فوق جيجل. هذه الإضافة قلّصت النافذة الزمنية (وقت انتظار مرور القمر) إلى ربع ساعة لست بؤر اشتعال كبيرة، في حين تظل أربع بؤر أخرى خافتة وأصغر من أن يكتشفها هذا المستشعر.
              </p>
              <p className="mt-4 leading-8 text-muted-foreground">
                هذه الطبقة مهمة لأنها تقدم قياساً أدق للوقت، ولكن التقارب الزمني لا يعني بالضرورة تنسيقاً فاعلاً بدون تحريات أمنية. تجدر الإشارة إلى أن مستشعر <span className="ltr-embed">MTG FCI</span> الحديث يُعد الأدق، ولكنه صُنّف ضمن البيانات غير المتاحة لنا حالياً.
              </p>
            </EdgePanel>
          </section>
        </Reveal>

        <Reveal className="mt-24">
          <section id="register">
            <SectionHead id="register" title="ابحث في جميع السجلات المعتمدة" />
            <p className="mt-6 max-w-2xl text-[16px] leading-8 text-muted-foreground">
              يمكنك البحث باستخدام المعرّف (ID)، اسم الناشر، أو موضوع المصدر. يظهر الرابط المباشر للوثيقة عند توفره، بينما تُعرض المراجع الأكاديمية بتفاصيلها الببليوغرافية كاملة.
            </p>
            <div className="mt-10">
              <SourceRegister records={records} />
            </div>
          </section>
        </Reveal>

        <Reveal className="mt-24">
          <section id="unavailable">
            <SectionHead id="unavailable" title="الغياب مسجّل وله أثر" />
            <p className="mt-6 max-w-2xl text-[16px] leading-8 text-muted-foreground">
              توثيق المصادر المفقودة ليس مجرد قائمة مؤجلة. غياب أي مصدر يعني وجود ثغرة تقنية محددة في التحليل، مثل غياب بيانات شبكات كشف الصواعق أو بيانات الرصد الحراري الفائق الدقة (كل 5-15 دقيقة).
            </p>
            <Accordion type="multiple" className="mt-8 max-w-4xl border-t border-rule">
              {unavailable.map((item, position) => (
                <AccordionItem key={item.source} value={item.source} className="border-b border-border">
                  <AccordionTrigger className="rounded-none py-5 text-[16px] hover:no-underline">
                    <span className="flex items-baseline gap-4">
                      <span className="numeric text-[11px] text-muted-foreground">
                        {String(position + 1).padStart(2, "0")}
                      </span>
                      <span className="font-semibold">{item.source}</span>
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="pb-6 ps-9">
                    <dl className="grid gap-6 sm:grid-cols-2">
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

        <Reveal className="mt-24">
          <section id="quarantine">
            <SectionLabel as="p" index={indexedSections[4].index}>
              سجل الحجر (البيانات المستبعدة)
            </SectionLabel>
            <h2 className="mt-3 text-[clamp(1.5rem,2.6vw,2.125rem)] font-semibold leading-[1.45]">
              أخبار مضللة لا علاقة لها بحرائق جيجل في أوت
            </h2>
            <EdgePanel label="أهم نتيجة في تنقية المصادر" tone="destructive" className="mt-10 max-w-3xl">
              <p className="text-lg font-medium leading-9">
                تداولت بعض المنصات أخباراً عن توقيف أشخاص متورطين. بالتدقيق، تبيّن أن جميع هذه الأخبار تعود لتواريخ سابقة (حرائق جويلية 2026 أو حرائق أوت 2021). ولضمان نزاهة التحقيق، تم استبعادها تماماً ولن نعتمد عليها في تحليلنا لحرائق أوت 2026.
              </p>
            </EdgePanel>
            <div className="mt-10 max-w-5xl">
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
                      <TableCell className="align-top whitespace-normal py-4 font-medium">
                        {item.reference}
                      </TableCell>
                      <TableCell className="numeric align-top whitespace-normal py-4 text-xs">
                        {item.date}
                      </TableCell>
                      <TableCell className="align-top whitespace-normal py-4 text-xs leading-6 text-muted-foreground">
                        {item.verification}
                      </TableCell>
                      <TableCell className="align-top whitespace-normal py-4 text-xs font-medium leading-6 text-destructive">
                        {item.verdict}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </section>
        </Reveal>

        <Reveal className="mt-24">
          <section id="policy">
            <SectionLabel as="p" index={indexedSections[5].index}>
              سياسة الاستعمال المعتمدة
            </SectionLabel>
            <h2 className="mt-3 text-[clamp(1.5rem,2.6vw,2.125rem)] font-semibold leading-[1.45]">
              نعتمد على المصدر الأولي والموثق حصراً
            </h2>
            <div className="mt-6 flex max-w-2xl flex-col gap-4 text-[16px] leading-8">
              <p>
                نعتمد على البيانات والبلاغات الصادرة عن قنوات الجهات الرسمية كمصادر أولية، حتى وإن تم نشرها عبر منصات التواصل الاجتماعي الخاصة بها. ومع ذلك، فإن أي بلاغ رسمي تعذّر التحقق منه مباشرة لم نقم ببناء استنتاج حيوي عليه.
              </p>
              <p>
                لم يتم استخدام أي مقاطع فيديو أو صور مجهولة المصدر متداولة على وسائل التواصل الاجتماعي كدليل. لغياب مواقع التصوير الدقيقة والتوثيق الزمني، تُعتبر هذه المواد مجرد وسائط للمتابعة ولا تصلح كوقائع مثبتة في تحليل جنائي جغرافي.
              </p>
            </div>
            <div className="mt-8 flex max-w-3xl items-center border-t border-rule pt-5">
              <Button asChild size="lg" className="h-11 px-5">
                <a href="/generated/documentation/sources.md" download>
                  <DownloadIcon data-icon="inline-start" />
                  تنزيل السجل الأصلي كاملاً
                </a>
              </Button>
            </div>
          </section>
        </Reveal>
      </Dossier>
    </article>
  );
}
