import type { Metadata } from "next";
import Link from "next/link";

import {
  ConfidenceMeter,
  EdgePanel,
  FileMeta,
  SectionLabel,
  StatStrip,
} from "@/components/editorial";
import { MethodologyDiagram } from "@/components/methodology-diagram";
import { ReadingProgress, Reveal } from "@/components/motion";
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

export default function MethodologyPage() {
  return (
    <article className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <ReadingProgress />
      <StoryBreadcrumb current="المنهجية" />

      <div className="mt-10 grid gap-8 lg:grid-cols-[220px_minmax(0,48rem)] lg:justify-center lg:gap-14">
        <aside className="order-2 border-t pt-6 lg:sticky lg:top-16 lg:order-1 lg:self-start lg:border-t-0 lg:border-e lg:pe-8 lg:pt-0">
          <FileMeta
            heading="بيانات المنهج"
            rows={[
              { term: "نطاق التحليل", value: "22-29.08.2026", mono: true },
              { term: "أرشيف MSG", value: "21-30.08.2026", mono: true },
              { term: "آخر مراجعة", value: "31.08.2026", mono: true },
              { term: "الدقة الأساسية", value: "375 m", mono: true },
              { term: "تركيبات الحساسية", value: "24", mono: true },
              { term: "المخرجات المرجعية", value: "9,100 / 4,451 / 12 / 17", mono: true },
            ]}
          />
          <nav aria-label="أقسام المنهجية" className="mt-8 hidden border-t pt-5 lg:block">
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
            منهج قابل للمراجعة
          </p>
          <h1 className="mt-4 max-w-3xl text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
            من إشارة القمر إلى نتيجة محدودة بدليلها
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-9 text-muted-foreground">
            كل رقم يمرّ عبر تنظيف واختبار مستقل وضبط جودة. النتيجة تبيّن البصمة
            البشرية الواضحة التي ترصدها البيانات، وتحيل الجوانب الأمنية المخفية لجهات الاختصاص.
          </p>

          <Alert className="mt-8 max-w-3xl border-s-[3px] border-s-warn">
            <AlertTitle>الرصد ليس لحظة الاشتعال الفعلي</AlertTitle>
            <AlertDescription>
              الحد التقني للملف: FIRMS يسجّل ما رآه لحظة مروره فقط. لذلك كل وقت
              بداية منشور هو نافذة تتيح زمناً واسعاً للاستغلال الميداني قبل أن يكتشفها القمر —
              باستثناء ست بؤر ضيّق فيها القمر الثابت النافذة إلى ربع ساعة ففضح التزامن المريب،
              وتبقى أربع بؤر دون حدّ كشفه.
            </AlertDescription>
          </Alert>

          <StatStrip
            className="mt-8 max-w-3xl"
            items={[
              { value: "9,100", unit: "رصد حراري بعد التنظيف" },
              { value: "4,451", unit: "خلية 375 م" },
              { value: "12", unit: "مرشح منشأ مستقل" },
              { value: "17", unit: "ندبة تتجاوز 100 هكتار" },
            ]}
          />

          <Reveal>
            <section id="scope" className="mt-16 scroll-mt-20">
              <SectionLabel>النطاق والسؤال</SectionLabel>
              <h2 className="mt-5 text-2xl font-semibold tracking-tight">
                فصل ما حدث عن تفسير سببه
              </h2>
              <div className="mt-5 flex max-w-2xl flex-col gap-4 leading-8">
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
              <EdgePanel label="قاعدة الاستنتاج" className="mt-6 max-w-2xl border-s-info">
                <p className="text-lg font-medium leading-8">
                  النتيجة الأقوى: الاستحالة الفيزيائية لانتقال النيران تثبت تعدد البدايات المستقلة والسبب الطبيعي مستبعد عملياً. النتيجة المكملة: التدخل البشري حتمي لتفسير الحدث. وبما أن الأقمار ترصد الحرارة لا النوايا، يُترك التكييف الجنائي وتحديد الفاعلين للتحقيقات الأمنية.
                </p>
              </EdgePanel>
            </section>
          </Reveal>

          <Reveal>
            <section id="pipeline" className="mt-16 scroll-mt-20">
              <SectionLabel>سلسلة المعالجة</SectionLabel>
              <h2 className="mt-5 text-2xl font-semibold tracking-tight">
                ثمانية تحوّلات، ولكل تحوّل حاجز خطأ
              </h2>
              <p className="mt-4 max-w-2xl leading-8 text-muted-foreground">
                الرسم يوضح أين تتغير المادة وما الفحص الذي يمنع الانتقال من
                قياس تقني محدود إلى ادعاء قانوني يتطلب تحريات ميدانية.
              </p>
              <div className="mt-6 max-w-3xl">
                <MethodologyDiagram />
              </div>
            </section>
          </Reveal>

          <Reveal>
            <section id="terms" className="mt-16 scroll-mt-20">
              <SectionLabel>المفاهيم الأساسية</SectionLabel>
              <h2 className="mt-5 text-2xl font-semibold tracking-tight">
                ستة مصطلحات تمنع القراءة الخاطئة
              </h2>
              <Accordion type="multiple" className="mt-6 max-w-3xl border-y">
                {terms.map((term) => (
                  <AccordionItem key={term.value} value={term.value} className="px-1">
                    <AccordionTrigger className="py-4 text-base">
                      {term.title}
                    </AccordionTrigger>
                    <AccordionContent className="max-w-2xl pb-4 leading-8 text-muted-foreground">
                      {term.body}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </section>
          </Reveal>

          <Reveal>
            <section id="tests" className="mt-16 scroll-mt-20">
              <SectionLabel>اختبارات الفرضيات</SectionLabel>
              <h2 className="mt-5 text-2xl font-semibold tracking-tight">
                الحدود التقنية تحيل التساؤلات الجنائية للأمن
              </h2>
              <div className="mt-6 max-w-3xl border">
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
                        <TableCell className="align-top whitespace-normal py-3 font-medium">
                          {test.question}
                        </TableCell>
                        <TableCell
                          className="align-top whitespace-normal py-3 text-xs"
                          dir="auto"
                        >
                          {test.data}
                        </TableCell>
                        <TableCell className="align-top whitespace-normal py-3 text-xs leading-6 text-muted-foreground">
                          {test.method}
                        </TableCell>
                        <TableCell className="align-top whitespace-normal py-3 text-xs leading-6">
                          {test.result}
                        </TableCell>
                        <TableCell className="align-top whitespace-normal py-3 text-xs leading-6 text-warn">
                          {test.limit}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </section>
          </Reveal>

          <Reveal>
            <section id="confidence" className="mt-16 scroll-mt-20">
              <SectionLabel>درجات الثقة</SectionLabel>
              <h2 className="mt-5 text-2xl font-semibold tracking-tight">
                الثقة تخص الادعاء المحدد، لا الملف كله
              </h2>
              <div className="mt-6 grid max-w-3xl gap-px border bg-border sm:grid-cols-2">
                {[
                  { level: 4, label: "عالية", body: "رصد مباشر أو تطابق مستقل مع فحص جودة ناجح." },
                  { level: 3, label: "متوسطة إلى عالية", body: "أدلة متقاطعة تقطع الاستحالة الفيزيائية لأسباب أخرى." },
                  { level: 2, label: "متوسطة", body: "ترجيح قوي علمياً، يتطلب تقاطعات أمنية وميدانية لحسم التفاصيل الجنائية." },
                  { level: 1, label: "منخفضة", body: "إشارة تستحق التحري الميداني الدقيق ولا تحسم الكاميرات أمرها." },
                ].map((item) => (
                  <div key={item.label} className="bg-background p-5">
                    <ConfidenceMeter level={item.level} label={item.label} />
                    <p className="mt-3 text-sm leading-7 text-muted-foreground">
                      {item.body}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </Reveal>

          <Reveal>
            <section id="limits" className="mt-16 scroll-mt-20">
              <SectionLabel>القيود</SectionLabel>
              <h2 className="mt-5 text-2xl font-semibold tracking-tight">
                القيود التكنولوجية التي تحجب الفاعلين
              </h2>
              <div className="mt-6 grid max-w-3xl gap-px border bg-border sm:grid-cols-2">
                {[
                  ["فجوات المرور", "على الأقمار القطبية فجوات بين 0.6 و72.8 ساعة تمنح مساحة هائلة للتلاعب؛ القمر الثابت يغلقها لست بؤر فقط."],
                  ["حدّ كشف القمر الثابت", "لا يرى فوق هذا الإقليم ما دون 30-50 ميغاواط، فـ«سماء صافية بلا رصد» تعني «لا حريق كبير»، مما يسمح بنشاطات إشعال خفية."],
                  ["الدقة المكانية", "بصمة VIIRS الاسمية 375 م، وبكسل MSG نحو 3.5 كم؛ لا يمكن رصد الفاعل أو أداة الإشعال الدقيقة."],
                  ["حجب الرصد", "الدخان والسحب والغطاء الشجري قد يخفي النيران في لحظات افتعالها الأولى."],
                  ["الرياح الجبلية", "النماذج الساعية لا تمثل كل التدفقات المحلية داخل التضاريس."],
                  ["الصواعق", "عملياً البرق مستبعد بشدة رغم غياب شبكة صواعق مباشرة للحسم القطعي."],
                  ["البنى البشرية", "شبكات التوزيع الكهربائية غائبة، مما يجعل تقييمها العرضي مستحيلاً فضائياً."],
                ].map(([title, body]) => (
                  <div key={title} className="bg-background p-5">
                    <h3 className="font-semibold">{title}</h3>
                    <p className="mt-2 text-sm leading-7 text-muted-foreground">{body}</p>
                  </div>
                ))}
              </div>
              <Alert className="mt-6 max-w-3xl border-s-[3px] border-s-destructive">
                <AlertTitle>الحدّ الذي لا تتجاوزه البيانات</AlertTitle>
                <AlertDescription>
                  البيانات الفضائية تثبت البصمة البشرية وتعدد البؤر المستقلة وتزامنها المريب. إثبات التنسيق الجنائي وتحديد النوايا أو نسبة المسؤولية لجهات محددة يتجاوز قدرة الكاميرات الفضائية، ويقع حصراً ضمن صلاحيات التحقيقات الأمنية والميدانية.
                </AlertDescription>
              </Alert>
            </section>
          </Reveal>

          <Reveal>
            <section id="reproduce" className="mt-16 scroll-mt-20">
              <SectionLabel>إعادة الفحص</SectionLabel>
              <h2 className="mt-5 text-2xl font-semibold tracking-tight">
                المخرجات المنشورة تكفي لمراجعة الأرقام
              </h2>
              <p className="mt-4 max-w-2xl leading-8 text-muted-foreground">
                البيانات الخام الثقيلة غير منشورة. تتوفر الجداول المعالجة،
                والحزمة المجمعة، وخرائط التحقيق وأشكاله البيانية، وسجل المصادر،
                ونص التقرير الذي يشرح الحسابات والقيود بالتفصيل.
              </p>
              <div className="mt-6 flex min-h-10 flex-wrap items-center gap-1 border-b">
                <Button asChild variant="ghost" size="sm">
                  <Link href="/data">البيانات والتنزيلات</Link>
                </Button>
                <Button asChild variant="ghost" size="sm">
                  <Link href="/report">نص التقرير</Link>
                </Button>
                <Button asChild variant="ghost" size="sm">
                  <Link href="/sources">سجل المصادر</Link>
                </Button>
              </div>
            </section>
          </Reveal>
        </div>
      </div>
    </article>
  );
}