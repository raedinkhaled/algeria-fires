import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";

import {
  ConfidenceMeter,
  Dossier,
  EdgePanel,
  Masthead,
  NightPanel,
  SectionLabel,
  StatStrip,
} from "@/components/editorial";
import { MethodologyDiagram, methodStages, toneClasses } from "@/components/methodology-diagram";
import { cn } from "@/lib/utils";
import { Reveal } from "@/components/motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const metadata: Metadata = {
  title: "منهجية تحليل حرائق جيجل",
  description:
    "سلسلة معالجة بيانات حرائق جيجل، وتعريف FRP وdNBR وفجوات الرصد، وكيف تحيل البيانات الفضائية التزامن لجهات التحقيق الأمني.",
};

const sections = [
  { id: "scope", label: "النطاق والسؤال" },
  { id: "pipeline", label: "سلسلة المعالجة" },
  { id: "terms", label: "المفاهيم الأساسية" },
  { id: "tests", label: "اختبارات الفرضيات" },
  { id: "confidence", label: "درجات الثقة" },
  { id: "limits", label: "القيود" },
  { id: "reproduce", label: "إعادة الفحص" },
];

const terms = [
  {
    value: "first-detection",
    title: "أول رصد",
    body: "أقدم مرة التقط فيها القمر حرارة داخل الخلية. لا يساوي زمن الاشتعال الفعلي، لأن النار قد تُضرم وتُترك لتنتشر بين تمريرتين وفي أي مكان داخل بصمة البكسل، مما يوفر نافذة زمنية للتلاعب.",
  },
  {
    value: "frp",
    title: "FRP، قوة الإشعاع الحراري",
    body: "مقياس لحظي للطاقة الحرارية المشعّة من البكسل بالميغاواط. يفيد في مقارنة شدة النشاط وشراسة النيران المرصودة، لكنه لا يساوي المساحة المحروقة ولا يثبت بصمة الفاعل.",
  },
  {
    value: "dnbr",
    title: "dNBR، فرق مؤشر الاحتراق",
    body: "فرق الانعكاسية بين صورة قبل الحريق وصورة بعده باستخدام نطاقات Sentinel-2 تحت الحمراء. استُعملت عتبة 0.27 لعزل الندبات الواضحة التي تثبت انقطاع المسار والاستحالة الفيزيائية للانتشار، ثم حُلّلت المكوّنات المتصلة.",
  },
  {
    value: "blind-window",
    title: "النافذة العمياء",
    body: "المدة بين آخر تغطية مقدّرة لم ترصد النار وأول رصد فعلي. على الأقمار القطبية تراوحت بين 0.6 و72.8 ساعة، ووسيطها وطنياً 3.48 ساعة مع 51.4٪ من البؤر فوق ثلاث ساعات — مما يوفر نافذة زمنية واسعة للمفتعلين ويجعل المدار القطبي قاصراً تقنياً عن نفي التزامن. وأرشيف القمر الثابت MSG/SEVIRI كل 15 دقيقة قلّصها إلى دورة رصد واحدة لست بؤر، وتركها كما هي لأربع بؤر أضعف من حدّ الكشف (نحو 30-50 ميغاواط).",
  },
  {
    value: "ach",
    title: "مصفوفة الفرضيات المتنافسة",
    body: "طريقة تزن كل تفسير ممكن بأدلة مؤيدة ومفنّدة معاً، بدل الدفاع عن فرضية واحدة. الأرقام المعروضة على الموقع هي أرقام المصفوفة بعد تحليل القوة وقاعدة التماثل، لا الأرقام الأولية. و«التلطيف» يخفض وزن كل دليل إلى النصف لاختبار متانة الترتيب: ما يصمد متين، وما ينقلب يحيل القضية للتحقيق الميداني.",
  },
  {
    value: "origin-candidate",
    title: "مرشح منشأ مستقل",
    body: "أقدم خلية تستوفي شرطين معاً: تبعد 5 كم على الأقل عن حريق سابق، وتفصلها عنه فجوة غير محترقة لا تقل عن 4 كم. هو إثبات فيزيائي وعلمي لتعدد نقاط الإشعال المستقلة، بانتظار التكييف الجنائي الميداني.",
  },
];

const hypothesisTests = [
  {
    question: "حريق واحد أم بدايات متعددة؟",
    data: "FIRMS + Sentinel-2",
    method: "قابلية البلوغ، فجوة المسار، الندبات المتصلة",
    result: "12 مرشحاً و17 ندبة تثبت الاستحالة الفيزيائية للانتشار الطبيعي",
    limit: "العدد حساس للعتبات",
  },
  {
    question: "هل البرق تفسير معقول؟",
    data: "METAR + Open-Meteo",
    method: "المسافة والزمن والهطول ورموز العواصف",
    result: "مستبعد بشدة عملياً لبؤر جيجل الرئيسية",
    limit: "لا شبكة مواقع صواعق مباشرة",
  },
  {
    question: "هل المواقع مختارة قرب النشاط البشري؟",
    data: "OSM + نموذج عشوائي",
    method: "مقارنة الطرق والبنى بخلفية قابلة للاختيار",
    result: "لا شذوذ هندسي فاضح (يتوافق مع أسلوب التخفي في المشهد المألوف)",
    limit: "الرصد الفضائي لا يكشف الفاعلين",
  },
  {
    question: "متى بدأت كل بؤرة بالضبط؟",
    data: "MSG/SEVIRI كل 15 دقيقة",
    method: "آخر شريحة صافية بلا نار ← أول رصد للنار",
    result: "نافذة ربع ساعة لست بؤر من اثنتي عشرة أثبتت التزامن",
    limit: "لا يرى ما دون 30-50 ميغاواط",
  },
  {
    question: "هل يكفي مصدر واحد لتفسير الأزواج المتقاربة؟",
    data: "توقيت MSG + شبكة 504,477 عقدة طرق + الرياح",
    method: "زمن تنقل متحيّز للتسهيل وهندسة الريح والندبات",
    result: "الاستحالة الفيزيائية للانتقال تثبت تعدد مصادر الإشعال",
    limit: "إثبات التنسيق يتجاوز الأقمار نحو التحقيق الأمني",
  },
  {
    question: "هل التوقيت يثبت التنسيق؟",
    data: "اختبارات التزامن + اختبار القوة",
    method: "مقارنة بالخلفية الوطنية وقياس قدرة الاختبار",
    result: "غياب البصمة الفضائية الصريحة لا ينفي التنسيق المتعمد",
    limit: "اختبار الحقن القطبي قاصر إحصائياً ولا يكشف إلا 1.5٪ من الحالات",
  },
  {
    question: "أي فرضية تفسّر الملف كله؟",
    data: "مصفوفة ACH + اختبارات القوة",
    method: "أدلة مؤيدة ومفنّدة لكل تفسير",
    result: "التدخل البشري حتمي، وفرضية التنسيق مسار أمني قوي",
    limit: "تتطلب فحصاً ميدانياً استخباراتياً",
  },
];

const confidenceLevels = [
  { level: 4, label: "عالية", body: "رصد مباشر أو تطابق مستقل مع فحص جودة ناجح." },
  { level: 3, label: "متوسطة إلى عالية", body: "أدلة متقاطعة تقطع الاستحالة الفيزيائية لأسباب أخرى." },
  { level: 2, label: "متوسطة", body: "ترجيح قوي علمياً، يتطلب تقاطعات أمنية وميدانية لحسم التفاصيل الجنائية." },
  { level: 1, label: "منخفضة", body: "إشارة تستحق التحري الميداني الدقيق ولا تحسم الكاميرات أمرها." },
];

const limits = [
  ["فجوات المرور", "على الأقمار القطبية فجوات بين 0.6 و72.8 ساعة تمنح مساحة هائلة للتلاعب؛ القمر الثابت يغلقها لست بؤر فقط."],
  ["حدّ كشف القمر الثابت", "لا يرى فوق هذا الإقليم ما دون 30-50 ميغاواط، فـ«سماء صافية بلا رصد» تعني «لا حريق كبير»، مما يسمح بنشاطات إشعال خفية."],
  ["الدقة المكانية", "بصمة VIIRS الاسمية 375 م، وبكسل MSG نحو 3.5 كم؛ لا يمكن رصد الفاعل أو أداة الإشعال الدقيقة."],
  ["حجب الرصد", "الدخان والسحب والغطاء الشجري قد يخفي النيران في لحظات افتعالها الأولى."],
  ["الرياح الجبلية", "النماذج الساعية لا تمثل كل التدفقات المحلية داخل التضاريس."],
  ["الصواعق", "عملياً البرق مستبعد بشدة رغم غياب شبكة صواعق مباشرة للحسم القطعي."],
  ["البنى البشرية", "شبكات التوزيع الكهربائية غائبة، مما يجعل تقييمها العرضي مستحيلاً فضائياً."],
];

const indexedSections = sections.map((section, position) => ({
  ...section,
  index: String(position + 1).padStart(2, "0"),
}));

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

export default function MethodologyPage() {
  return (
    <article className="publication mx-auto max-w-7xl px-4 pb-16 pt-6 sm:px-6 lg:px-8">
      <Masthead
        current="المنهجية"
        file="06"
        kicker="منهج قابل للمراجعة"
        title="من إشارة القمر إلى نتيجة محدودة بدليلها"
        lede="كل رقم يمرّ عبر تنظيف واختبار مستقل وضبط جودة. النتيجة تبيّن البصمة البشرية الواضحة التي ترصدها البيانات، وتحيل الجوانب الأمنية المخفية لجهات الاختصاص."
        meta={[
          { term: "نطاق التحليل", value: "22-29.08.2026", mono: true },
          { term: "أرشيف MSG", value: "21-30.08.2026", mono: true },
          { term: "آخر مراجعة", value: "31.08.2026", mono: true },
          { term: "الدقة الأساسية", value: "375 m", mono: true },
          { term: "تركيبات الحساسية", value: "24", mono: true },
          { term: "المخرجات المرجعية", value: "9,100 / 4,451 / 12 / 17", mono: true },
        ]}
        panel={
          <NightPanel label="سلسلة المعالجة" meta={`${methodStages.length} تحوّلات`}>
            <ol className="relative flex flex-1 flex-col justify-center px-5 py-4">
              {methodStages.map((stage, position) => (
                <li key={stage.title} className="relative grid grid-cols-[2rem_minmax(0,1fr)] items-center gap-x-3 py-1.5">
                  {position < methodStages.length - 1 ? (
                    <span aria-hidden="true" className="absolute start-[0.9375rem] top-[1.75rem] h-[calc(100%-0.5rem)] w-px bg-border" />
                  ) : null}
                  <span
                    className={cn(
                      "numeric relative flex size-7.5 items-center justify-center border bg-background text-[10.5px]",
                      toneClasses[stage.tone],
                    )}
                  >
                    {String(position + 1).padStart(2, "0")}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-[13.5px] font-medium">{stage.title}</span>
                    <span className="block truncate text-[11px] text-muted-foreground">{stage.output}</span>
                  </span>
                </li>
              ))}
            </ol>
          </NightPanel>
        }
      >
        <p className="sr-only">بيانات المنهج</p>
      </Masthead>

      <Alert className="mt-10 max-w-3xl border-s-warn">
        <AlertTitle>الرصد ليس لحظة الاشتعال الفعلي</AlertTitle>
        <AlertDescription>
          الحد التقني للملف: FIRMS يسجّل ما رآه لحظة مروره فقط. لذلك كل وقت
          بداية منشور هو نافذة تتيح زمناً واسعاً للاستغلال الميداني قبل أن يكتشفها القمر —
          باستثناء ست بؤر ضيّق فيها القمر الثابت النافذة إلى ربع ساعة ففضح التزامن المريب،
          وتبقى أربع بؤر دون حدّ كشفه.
        </AlertDescription>
      </Alert>

      <StatStrip
        className="mt-12"
        items={[
          { value: "9,100", unit: "رصد حراري بعد التنظيف" },
          { value: "4,451", unit: "خلية 375 م" },
          { value: "12", unit: "مرشح منشأ مستقل" },
          { value: "17", unit: "ندبة تتجاوز 100 هكتار" },
        ]}
      />

      <Dossier index={indexedSections} indexHeading="محتويات الصفحة" indexLabel="أقسام المنهجية">
        <Reveal>
          <section id="scope">
            <SectionHead id="scope" title="فصل ما حدث عن تفسير سببه" />
            <div className="mt-6 flex max-w-2xl flex-col gap-4 text-[16px] leading-8">
              <p>
                يعيد التحليل بناء أماكن أول الرصد وتسلسل الانتشار، ثم يختبر
                الفرضيات. البيانات تثبت الاستقلال المكاني والزماني للبؤر كخطوة
                أولى حاسمة نحو إثبات القصد الجنائي المتعمّد.
              </p>
              <p>
                المبدأ الحاكم هو البحث عمّا يفنّد الفرضية، لا عمّا يؤيدها
                فقط. لذلك تمت دراسة كل المؤشرات بدقة: التزامن الخطير مع ذروة الطقس
                الذي يعكس استغلالاً متعمداً للظروف، احتمالية التخفي قرب الطرقات،
                والقصور الإحصائي لاختبار التزامن الفضائي الذي يجعل حسم التنسيق مهمة أمنية خالصة.
              </p>
            </div>
            <EdgePanel label="قاعدة الاستنتاج" tone="info" className="mt-10 max-w-3xl">
              <p className="text-lg font-medium leading-9">
                النتيجة الأقوى: الاستحالة الفيزيائية لانتقال النيران تثبت تعدد البدايات المستقلة والسبب الطبيعي مستبعد عملياً. النتيجة المكملة: التدخل البشري حتمي لتفسير الحدث. وبما أن الأقمار ترصد الحرارة لا النوايا، يُترك التكييف الجنائي وتحديد الفاعلين للتحقيقات الأمنية.
              </p>
            </EdgePanel>
          </section>
        </Reveal>

        <Reveal className="mt-24">
          <section id="pipeline">
            <SectionHead id="pipeline" title="ثمانية تحوّلات، ولكل تحوّل حاجز خطأ" />
            <p className="mt-6 max-w-2xl text-[16px] leading-8 text-muted-foreground">
              الرسم يوضح أين تتغير المادة وما الفحص الذي يمنع الانتقال من
              قياس تقني محدود إلى ادعاء قانوني يتطلب تحريات ميدانية.
            </p>
            <div className="mt-10">
              <MethodologyDiagram />
            </div>
          </section>
        </Reveal>

        <Reveal className="mt-24">
          <section id="terms">
            <SectionHead id="terms" title="ستة مصطلحات تمنع القراءة الخاطئة" />
            <Accordion type="multiple" className="mt-8 max-w-3xl border-t border-rule">
              {terms.map((term, position) => (
                <AccordionItem key={term.value} value={term.value} className="border-b border-border">
                  <AccordionTrigger className="rounded-none py-5 text-[17px] hover:no-underline">
                    <span className="flex items-baseline gap-4">
                      <span className="numeric text-[11px] text-muted-foreground">
                        {String(position + 1).padStart(2, "0")}
                      </span>
                      <span className="font-semibold">{term.title}</span>
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="max-w-2xl pb-6 ps-9 text-[15px] leading-8 text-muted-foreground">
                    {term.body}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>
        </Reveal>

        <Reveal className="mt-24">
          <section id="tests">
            <SectionHead id="tests" title="الحدود التقنية تحيل التساؤلات الجنائية للأمن" />
            <div className="mt-10">
              <Table className="min-w-[860px] table-fixed">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-48">السؤال</TableHead>
                    <TableHead className="w-40">البيانات</TableHead>
                    <TableHead>الاختبار</TableHead>
                    <TableHead className="w-44">النتيجة</TableHead>
                    <TableHead className="w-40">الحدّ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {hypothesisTests.map((test) => (
                    <TableRow key={test.question}>
                      <TableCell className="align-top whitespace-normal py-4 text-[14px] font-semibold leading-7">
                        {test.question}
                      </TableCell>
                      <TableCell
                        className="align-top whitespace-normal py-4 text-xs leading-6"
                        dir="auto"
                      >
                        {test.data}
                      </TableCell>
                      <TableCell className="align-top whitespace-normal py-4 text-xs leading-6 text-muted-foreground">
                        {test.method}
                      </TableCell>
                      <TableCell className="align-top whitespace-normal py-4 text-xs leading-6">
                        {test.result}
                      </TableCell>
                      <TableCell className="align-top whitespace-normal py-4 text-xs leading-6 text-warn">
                        {test.limit}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </section>
        </Reveal>

        <Reveal className="mt-24">
          <section id="confidence">
            <SectionHead id="confidence" title="الثقة تخص الادعاء المحدد، لا الملف كله" />
            <div className="mt-10 grid gap-px border-t border-rule bg-border sm:grid-cols-2 xl:grid-cols-4">
              {confidenceLevels.map((item) => (
                <div key={item.label} className="bg-background py-6 sm:px-5 xl:first:ps-0">
                  <ConfidenceMeter level={item.level} label={item.label} />
                  <p className="mt-4 text-sm leading-7 text-muted-foreground">
                    {item.body}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </Reveal>

        <Reveal className="mt-24">
          <section id="limits">
            <SectionHead id="limits" title="القيود التكنولوجية التي تحجب الفاعلين" />
            <ol className="mt-10 grid border-t border-rule md:grid-cols-2 md:gap-x-10">
              {limits.map(([title, body], position) => (
                <li
                  key={title}
                  className="grid grid-cols-[2.25rem_minmax(0,1fr)] gap-x-3 border-b border-border py-6"
                >
                  <span className="numeric pt-1 text-[11px] text-muted-foreground">
                    {String(position + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3 className="text-[16px] font-semibold leading-7">{title}</h3>
                    <p className="mt-2 text-sm leading-7 text-muted-foreground">{body}</p>
                  </div>
                </li>
              ))}
            </ol>
            <Alert className="mt-10 max-w-3xl border-s-destructive">
              <AlertTitle>الحدّ الذي لا تتجاوزه البيانات</AlertTitle>
              <AlertDescription>
                البيانات الفضائية تثبت البصمة البشرية وتعدد البؤر المستقلة وتزامنها المريب. إثبات التنسيق الجنائي وتحديد النوايا أو نسبة المسؤولية لجهات محددة يتجاوز قدرة الكاميرات الفضائية، ويقع حصراً ضمن صلاحيات التحقيقات الأمنية والميدانية.
              </AlertDescription>
            </Alert>
          </section>
        </Reveal>

        <Reveal className="mt-24">
          <section id="reproduce">
            <SectionHead id="reproduce" title="المخرجات المنشورة تكفي لمراجعة الأرقام" />
            <p className="mt-6 max-w-2xl text-[16px] leading-8 text-muted-foreground">
              البيانات الخام الثقيلة غير منشورة. تتوفر الجداول المعالجة،
              والحزمة المجمعة، وخرائط التحقيق وأشكاله البيانية، وسجل المصادر،
              ونص التقرير الذي يشرح الحسابات والقيود بالتفصيل.
            </p>
            <nav aria-label="مواد إعادة الفحص" className="mt-8 grid max-w-3xl border-t border-rule sm:grid-cols-3">
              {[
                { href: "/data", label: "البيانات والتنزيلات" },
                { href: "/report", label: "نص التقرير" },
                { href: "/sources", label: "سجل المصادر" },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="group flex items-center justify-between gap-3 border-b border-border py-4 text-[15px] font-medium transition-colors hover:bg-card sm:border-s sm:px-4 sm:first:border-s-0 sm:first:ps-0"
                >
                  {link.label}
                  <ArrowLeftIcon
                    aria-hidden="true"
                    className="size-4 text-muted-foreground transition-transform group-hover:-translate-x-1 group-hover:text-signal-ink"
                  />
                </Link>
              ))}
            </nav>
          </section>
        </Reveal>
      </Dossier>
    </article>
  );
}
