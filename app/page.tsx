import Image from "next/image";
import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";

import {
  ConfidenceDot,
  ConfidenceMeter,
  confidenceTone,
  DataFigure,
  EdgePanel,
  FileMeta,
  Register,
  RegisterRow,
  SectionLabel,
  StatStrip,
} from "@/components/editorial";
import { StoryBreadcrumb } from "@/components/story-breadcrumb";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { siteSections } from "@/lib/site-navigation";

const fileMeta = [
  { term: "رقم الملف", value: "01 · مراجعة 4" },
  { term: "الولاية", value: "جيجل، الجزائر" },
  { term: "الفترة", value: "22–29.08.2026", mono: true },
  { term: "الإحداثيات", value: "36.72°N · 5.95°E", mono: true },
  { term: "المصادر", value: "VIIRS · S2 · ERA5", mono: true },
  { term: "الحالة", value: "مكتمل · أوت 2026" },
];

const headlineStats = [
  { value: "9,100", unit: "رصد حراري" },
  { value: "4,451", unit: "خلية مكانية" },
  { value: "12", unit: "بداية محتملة" },
  { value: "17", unit: "ندبة كبيرة" },
];

const evidenceRegister = [
  { value: "9,100", label: "رصد حراري", detail: "قراءات صالحة بعد التنظيف والتحقق" },
  { value: "4,451", label: "خلية مكانية", detail: "شبكة بدقة 375 م لتتبع الحركة" },
  { value: "12", label: "بداية محتملة", detail: "مواقع اجتازت شروط المسافة والانفصال" },
  { value: "17", label: "منطقة محترقة كبيرة", detail: "كل واحدة تتجاوز 100 هكتار" },
];

const timeline = [
  {
    date: "23 أوت",
    title: "أول إشارة في المنطقة الأوسع",
    body: "ظهر رصد حراري عند 01:35 في ولاية سطيف، خارج جيجل.",
  },
  {
    date: "24 أوت",
    title: "أول إشارة داخل جيجل",
    body: "سجّل القمر نقطة ساخنة عند 14:53 في الجمعة بني حبيبي.",
  },
  {
    date: "26–27 أوت",
    title: "انتشار سريع تحت طقس قاسٍ",
    body: "ارتفع النشاط مع حرارة وصلت إلى 43°م ورطوبة هبطت إلى 12.5٪.",
  },
  {
    date: "28–29 أوت",
    title: "ظهرت آثار الحرائق بوضوح",
    body: "كشفت صور Sentinel-2 مناطق محترقة منفصلة، وبدأ التحقيق الرسمي في الأسباب.",
  },
];

const findings = [
  {
    value: "origins",
    question: "هل كان حريقاً واحداً؟",
    answer: "على الأرجح لا. البيانات تشير إلى بدايات منفصلة.",
    evidence:
      "تظهر 12 بداية محتملة، وتفصل بينها مسافات وأراضٍ لم تحترق. وتؤكد صور Sentinel-2 وجود 17 منطقة محترقة كبيرة منفصلة.",
    limit:
      "لا تعني كل نقطة بداية حريقاً مستقلاً مؤكداً؛ إنها أفضل المواقع التي اجتازت شروط التحليل.",
    confidence: "عالية",
    confShort: "عالية",
    level: 3,
    sources: "DS-01–05 · OF-06",
  },
  {
    value: "weather",
    question: "لماذا انتشرت النار بهذه السرعة؟",
    answer: "الحرارة والجفاف والرياح تفسر سرعة الانتشار.",
    evidence:
      "وصلت موجة السيروكو إلى ذروتها في الوقت نفسه الذي قفز فيه النشاط الحراري: حرارة مرتفعة جداً، رطوبة شديدة الانخفاض، وهبات قوية.",
    limit: "الطقس يشرح كيف كبر الحريق، لكنه لا يخبرنا كيف بدأت الشرارة الأولى.",
    confidence: "عالية",
    confShort: "عالية",
    level: 3,
    sources: "DS-07 · DS-08",
  },
  {
    value: "cause",
    question: "هل كانت البداية طبيعية؟",
    answer: "السبب المرتبط بنشاط بشري أرجح من البرق.",
    evidence:
      "لم يظهر نشاط رعدي على مسافة أقل من 81 كم من البؤر الرئيسية، وكان الهطول صفراً، وآخر رعد في محطة جيجل يوم 21 أوت. لذلك يبقى السبب البشري هو التفسير الأرجح.",
    limit: "هذا استنتاج بالاستبعاد، وليس دليلاً ميدانياً على سبب محدد.",
    confidence: "متوسطة",
    confShort: "متوسطة",
    level: 2,
    sources: "DS-07 · DS-08 · ME-04",
  },
  {
    value: "intent",
    question: "هل تثبت البيانات أن الحرائق كانت متعمدة؟",
    answer: "لا. صور الأقمار لا تستطيع حسم النية أو المسؤولية.",
    evidence:
      "لا يوجد دليل مباشر على التنسيق. لكن اختبار التزامن نفسه ضعيف جداً: كشف تجربة من 45 بؤرة متزامنة في 1.5٪ من الحالات فقط، لذلك لا تصلح نتيجته السلبية للنفي.",
    limit:
      "يبقى الفعل المنسق احتمالاً مفتوحاً بين 11٪ و26٪، لا نتيجة مثبتة. حسم النية يحتاج إلى تحقيق ميداني وأدلة قضائية.",
    confidence: "عالية في عدم القدرة على الحسم",
    confShort: "عالية",
    level: 3,
    sources: "الفصول 25–27 · OF-07",
  },
];

export default function Home() {
  return (
    <article className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <StoryBreadcrumb current="الملخص التنفيذي" />

      <div className="mt-10 grid gap-8 lg:grid-cols-[210px_1fr] lg:gap-14">
        <aside className="order-2 border-t pt-6 lg:order-1 lg:border-t-0 lg:border-e lg:pe-8 lg:pt-0">
          <FileMeta heading="بيانات الملف" rows={fileMeta} />
          <div className="mt-8 hidden border-t pt-5 lg:block">
            <p className="mb-2 text-[11px] text-muted-foreground">التصنيف</p>
            <span className="inline-flex items-center gap-1.5 border px-2 py-1 text-[11px] text-muted-foreground">
              <span aria-hidden="true" className="size-1.5 bg-foreground" />
              مفتوح · بيانات عامة
            </span>
          </div>
        </aside>

        <div className="order-1 min-w-0 lg:order-2">
          <p className="text-[11px] font-medium text-muted-foreground">
            تحقيق مفتوح بالبيانات
          </p>
          <h1 className="mt-4 max-w-3xl text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
            كيف بدأت حرائق جيجل، وكيف انتشرت؟
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-9 text-muted-foreground">
            جمعنا صور الأقمار وبيانات الطقس لنرتب ما حدث يوماً بيوم. ما وجدناه
            يرجّح أن البداية لم تكن طبيعية، وأن نشاطاً بشرياً كان وراءها. أما
            نوع هذا النشاط ومن المسؤول عنه، فلا تحسمه البيانات وحدها.
          </p>

          <StatStrip className="mt-8" items={headlineStats} />
        </div>
      </div>

      <EdgePanel className="mt-12" label="خلاصة التحقيق">
        <p className="text-lg font-medium leading-8">
          البرق مستبعد من البؤر الرئيسية، ولا يظهر سبب طبيعي معقول آخر. لذلك
          يرجّح التحليل سبباً بشرياً.
        </p>
        <div className="mt-4 flex flex-wrap justify-between gap-2 border-t pt-4 text-xs text-muted-foreground">
          <span>الثقة: متوسطة إلى عالية في استبعاد السبب الطبيعي</span>
          <span>
            <span className="ltr-embed">DS-07 · DS-08</span> · الفصل 32
          </span>
        </div>
      </EdgePanel>

      <div className="mt-14">
        <SectionLabel index="01">دليل بصري</SectionLabel>
        <DataFigure
          className="mx-auto mt-4 max-w-2xl"
          caption={
            <>
              ثلاث لوحات من <span className="ltr-embed">Sentinel-2</span>: الغطاء
              قبل الحريق (18 أوت)، بعده (28 أوت)، وخريطة شدة الاحتراق. الأحمر
              مساحات احترقت بشدة، والرمادي غطاء لم يحترق.
            </>
          }
        >
          <Image
            src="/generated/media/sentinel-comparison.png"
            alt="ثلاث لوحات من Sentinel-2 لمنطقة جيجل: الغطاء النباتي في 18 أوت قبل الحريق، الوضع في 28 أوت بعده، وخريطة شدة الاحتراق dNBR"
            width={2073}
            height={2561}
            priority
            className="h-auto w-full bg-white"
          />
        </DataFigure>
      </div>

      <Alert className="mt-8">
        <AlertTitle>فرق مهم قبل القراءة</AlertTitle>
        <AlertDescription>
          أول رصد فضائي ليس لحظة الاشتعال. قد تبدأ النار قبل مرور القمر بساعات.
        </AlertDescription>
      </Alert>

      <div className="mt-14">
        <SectionLabel index="02">سجل الأدلة</SectionLabel>
        <Register className="mt-4">
          {evidenceRegister.map((row) => (
            <RegisterRow
              key={row.label}
              value={row.value}
              label={row.label}
              detail={row.detail}
            />
          ))}
        </Register>
      </div>

      <div className="mt-14">
        <SectionLabel index="03">التسلسل الزمني · 23–29 أوت 2026</SectionLabel>
        <div className="mt-4 divide-y border">
          {timeline.map((event) => (
            <div
              key={event.title}
              className="grid gap-x-5 gap-y-2 px-4 py-5 sm:grid-cols-[120px_1fr]"
            >
              <p className="text-sm font-medium text-muted-foreground">
                {event.date}
              </p>
              <div>
                <h3 className="text-sm font-semibold">{event.title}</h3>
                <p className="mt-1.5 text-sm leading-7 text-muted-foreground">
                  {event.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-14">
        <SectionLabel index="04">النتيجة في أربعة أسئلة</SectionLabel>
        <Accordion
          type="single"
          collapsible
          defaultValue="origins"
          className="mt-4 border"
        >
          {findings.map((finding, index) => (
            <AccordionItem
              key={finding.value}
              value={finding.value}
              className="px-4"
            >
              <AccordionTrigger className="py-4 text-base hover:no-underline">
                <span className="flex flex-1 items-center gap-3 pe-3 sm:gap-4">
                  <span className="numeric text-xs text-muted-foreground">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="text-start">{finding.question}</span>
                  <span
                    className={`ms-auto flex shrink-0 items-center gap-1.5 text-xs font-medium ${confidenceTone(finding.level).text}`}
                  >
                    <ConfidenceDot level={finding.level} />
                    {finding.confShort}
                  </span>
                </span>
              </AccordionTrigger>
              <AccordionContent className="pb-6">
                <p className="text-base font-medium leading-7">
                  {finding.answer}
                </p>
                <p className="mt-4 leading-7 text-muted-foreground">
                  <span className="font-medium text-foreground">الدليل: </span>
                  {finding.evidence}
                </p>
                <p className="mt-3 leading-7 text-muted-foreground">
                  <span className="font-medium text-foreground">الحد: </span>
                  {finding.limit}
                </p>
                <div className="mt-5 grid gap-4 border-t pt-4 sm:grid-cols-[200px_1fr] sm:items-center">
                  <ConfidenceMeter
                    level={finding.level}
                    label={`الثقة: ${finding.confidence}`}
                  />
                  <Link
                    href="/sources"
                    className="text-xs text-muted-foreground underline decoration-border underline-offset-4 hover:text-foreground hover:decoration-foreground sm:text-end"
                  >
                    {finding.sources}
                  </Link>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      <EdgePanel className="mt-14" label="حدود ما تقوله البيانات">
        <h2 className="max-w-3xl text-2xl font-semibold leading-snug tracking-tight sm:text-3xl">
          نعرف أن السبب الطبيعي غير مرجح، وأن فعلاً بشرياً أرجح. لا نعرف أي فعل
          بشري كان، ولا من المسؤول.
        </h2>
        <p className="mt-5 max-w-2xl leading-8 text-muted-foreground">
          هذا تحليل مستقل للبيانات المفتوحة، وليس تحقيقاً رسمياً. أي حكم على
          المسؤولية يحتاج إلى فحص ميداني وشهادات وأدلة قضائية.
        </p>
        <Alert className="mt-6">
          <AlertTitle>الخلاصة الدقيقة</AlertTitle>
          <AlertDescription>
            البيانات تفرق بين الطبيعة والفعل البشري بدرجة معتبرة، لكنها لا تفرق
            بين الحادث والإهمال والفعل المتعمد.
          </AlertDescription>
        </Alert>
      </EdgePanel>

      <div className="mt-14">
        <SectionLabel index="05">تابع القراءة</SectionLabel>
        <nav aria-label="أقسام المنصة" className="mt-4 divide-y border">
          {siteSections.map((section) => (
            <Link
              key={section.href}
              href={section.href}
              className="group flex items-center justify-between gap-4 px-4 py-4 transition-colors hover:bg-muted/50"
            >
              <span>
                <span className="block text-sm font-medium">
                  {section.title}
                </span>
                <span className="mt-0.5 block text-xs leading-6 text-muted-foreground">
                  {section.summary}
                </span>
              </span>
              <ArrowLeftIcon
                aria-hidden="true"
                className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:-translate-x-0.5"
              />
            </Link>
          ))}
        </nav>
      </div>
    </article>
  );
}
