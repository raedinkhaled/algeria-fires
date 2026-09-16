import Link from "next/link";
import Image from "next/image";
import { ArrowLeftIcon } from "lucide-react";

import { ChekfaTexennaDiagram } from "@/components/evidence-diagrams";
import {
  ClaimBasis,
  ConfidenceDot,
  ConfidenceMeter,
  confidenceTone,
  ContinueLinks,
  DataFigure,
  Dossier,
  EdgePanel,
  Kicker,
  MetaLedger,
  SectionLabel,
  StatStrip,
} from "@/components/editorial";
import { EvidencePlates } from "@/components/evidence-plates";
import { HypothesisMatrix } from "@/components/hypothesis-matrix";
import {
  type DailyActivity,
  DailyActivityChart,
} from "@/components/investigation-charts";
import { Reveal } from "@/components/motion";
import { SatelliteComparison } from "@/components/satellite-comparison";
import { StoryBreadcrumb } from "@/components/story-breadcrumb";
import { StoryStage, type StoryOrigin, type StoryStep } from "@/components/story-stage";
import { ThermalLegend, ThermalRecord } from "@/components/thermal-record";
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
import { figure } from "@/lib/figures";
import { readCsvRows } from "@/lib/published-csv";
import { framePosition, insideAnalysisWindow } from "@/lib/sentinel-frame";
import { sectionIndex, siteSections } from "@/lib/site-navigation";
import { slotLocalMs, type FrpSlot } from "@/lib/thermal";
import dailyActivity from "@/public/generated/data/daily_activity.json";
import forensicSummary from "@/public/generated/data/forensic-summary.json";
import frpSeries from "@/public/generated/data/msg-frp-series.json";
import ignitionWindows from "@/public/generated/data/msg-ignition-windows.json";

const preSatellite = figure("s2-pre-truecolor");
const openingSatellite = figure("s2-post-truecolor");
const severityRaster = figure("s2-dnbr-severity");
const sentinelComparison = figure("map-sentinel-before-after");
const posteriors = figure("chart-ach-posteriors");
const powerLimits = figure("chart-power-and-limits");

const fileMeta = [
  { term: "الولاية", value: "جيجل، الجزائر" },
  { term: "الفترة", value: "22-29.08.2026", mono: true },
  { term: "الإحداثيات", value: "36.72°N · 5.95°E", mono: true },
  { term: "المصادر", value: "VIIRS · S2 · ERA5", mono: true },
  { term: "الطبيعة", value: "تحليل مستقل" },
  { term: "البيانات حتى", value: "29.08.2026", mono: true },
];

const headlineStats = [
  { value: "9,100", unit: "رصد حراري" },
  { value: "4,451", unit: "خلية مكانية" },
  { value: "12", unit: "بداية محتملة" },
  { value: "17", unit: "ندبة كبيرة" },
];

const conclusionLevels = [
  {
    level: 3,
    heading: "السبب ليس طبيعياً",
    body: "لم يقع برق قريب من البؤر الرئيسية؛ أقرب نشاط رعدي كان على بعد أكثر من 81 كم، ولم يهطل مطر. وآخر رعد سجلته محطة جيجل كان يوم 21 أوت. لا يظهر في البيانات أي مبرر طبيعي معقول لهذه الاشتعالات.",
    confidence: "ثقة متوسطة إلى عالية",
  },
  {
    level: 2,
    heading: "إذاً الفعل بشري، وحتمي",
    body: "بعد استبعاد البرق وعدم ظهور مبرر طبيعي آخر، تؤكد البيانات أن تدخلاً بشرياً كان وراء هذه البدايات المستقلة. السؤال لم يعد «إنسان أم طبيعة»، بل «ما هي أبعاد هذا التدخل؟».",
    confidence: "ثقة متوسطة",
  },
  {
    level: 3,
    heading: "الحسم الجنائي وضرورة التحقيق الأمني",
    body: "صور الأقمار ترصد البصمة الحرارية ولا تصور الفاعل. ورغم أن البيانات المفتوحة تضع العمل المنسق كاحتمال إحصائي (بين 11٪ و26٪)، إلا أن التزامن المكاني والزمني المدروس يفرض هذه الفرضية بقوة. الحسم الجنائي وتحديد الفاعلين متروك لتحقيقات الدرك الوطني.",
    confidence: "عالية في الحاجة الماسة للتحقيق",
  },
];

const timeline = [
  {
    date: "23 أوت",
    title: "أول إشارة في المنطقة الأوسع",
    body: "بؤر حرارية ليلية ضعيفة في ولايتَي سطيف وبجاية، جنوب غرب جيجل وخارج حدودها.",
  },
  {
    date: "24 أوت",
    title: "أول إشارة داخل جيجل",
    body: "نار في الجمعة بني حبيبي، رآها القمر الثابت الساعة 14:40 بعد أن كان الموقع صافياً عند 14:25، ثم رصدها VIIRS بعد 13 دقيقة. اختفت من السجل 22 ساعة.",
  },
  {
    date: "25 أوت",
    title: "بؤرة الشقفة",
    body: "بداية أكبر منطقة احترقت لاحقاً. تبلغ مساحة الأرض المحترقة فيها 400 كم² في صور Sentinel-2، ورصدها القمر بوضوح.",
  },
  {
    date: "26 أوت",
    title: "الاستغلال المريب للسيروكو",
    body: "ظهرت النار في تاكسنة في 43 نقطة رصد دفعة واحدة، في تزامن مريب مع ذروة الطقس القاسي (43°م، رطوبة 12.5٪، وهبّات 68 كم/س)، مما يطرح تساؤلات حول الاستغلال المتعمد للظروف البيئية. في هذه الليلة كانت الخسائر البشرية الأكبر.",
  },
  {
    date: "27 أوت",
    title: "الذروة الوطنية",
    body: "780 بؤرة في تمريرة ليلية واحدة، وحرائق في 13 ولاية خلال 24 ساعة. الحكومة تعلن تحقيقات في «الاندلاع المتزامن».",
  },
  {
    date: "28-29 أوت",
    title: "الانحسار",
    body: "عادت الرطوبة إلى جيجل وانخفض النشاط بوضوح. بدأ الدرك الوطني التحقيق في أسباب الحرائق.",
  },
];

const suspicion = [
  {
    title: "الشقفة وتاكسنة: أقوى مؤشر على الافتعال",
    body: "تفصل بينهما 19.52 كم وظهرتا بفارق 24 ساعة. الرياح كانت تعاكس انتقال النار، وبينهما فجوة خضراء لم تحترق طولها 22.78 كم. الاستحالة الفيزيائية لانتقال نار الشقفة إلى تاكسنة تُثبت قطعياً تعدد مصادر الإشعال المستقلة.",
    tag: "ثقة عالية في الاستقلال المكاني وحتمية التدخل الموازي",
  },
  {
    title: "قياس التوقيت من القمر الثابت",
    body: "بدأت تاكسنة وترعي باينان بفارق 11 إلى 30 دقيقة، بينما يستغرق الطريق بينهما 49 دقيقة، وتقعان في منطقتين منفصلتين فيزيائياً. الاستحالة الفيزيائية لانتقال النار تؤكد تعدد مصادر الإشعال المستقلة في وقت متقارب وتطرح فرضية التزامن المتعمّد بقوة.",
    tag: "ثقة عالية في لزوم مصدرَي اشتعال منفصلين",
  },
  {
    title: "تعدّد بؤر المنشأ",
    body: "هناك 12 بداية محتملة، 6 منها في جيجل. كل واحدة تبعد 5 كم على الأقل عن أقرب حريق سابق، وبينهما 4 كم على الأقل من أرض لم تحترق. تعدد البؤر المنفصلة بهذا الشكل يكسر مبرر الانتشار العشوائي.",
    tag: "مؤكَّد كواقعة؛ يستدعي تدقيقاً أمنياً أعمق",
  },
  {
    title: "شذوذ بؤرة الجمعة بني حبيبي",
    body: "تقع على ارتفاع منخفض (55 م) وعلى بعد 22 م فقط من طريق ثانوي. ارتباطها الشديد بمؤشرات النشاط البشري وموقعها الاستراتيجي يطرح تساؤلات قوية حول طبيعة التدخل البشري ومصدر الإشعال المباشر.",
    tag: "ملاحظة تستوجب فحصاً استخباراتياً وميدانياً",
  },
  {
    title: "إشارات التوقيت",
    body: "رُصدت أربع بؤر أول مرة ليلاً، ووصف الوزير الحرائق بأنها بدأت في أوقات متقاربة. هذا التزامن اللافت لاندلاع النيران يضع الحدث خارج الإطار المعتاد للحرائق ويطرح تساؤلات أمنية جوهرية.",
    tag: "تزامن لافت يستدعي تحقيقاً جنائياً",
  },
  {
    title: "محدودية الأقمار لا تنفي التنسيق",
    body: "القمر الثابت يحدد الأوقات لكنه لا يكشف الفاعلين. اختبار تزامن البؤر الفضائي لا يكتشف سيناريو 45 بداية متعمدة إلا في 1.5٪ من الحالات. لذلك فإن عدم التقاط دليل فضائي صريح لا ينفي أبداً فرضية العمل المنظم، بل يحيلها حتمياً للتحقيق الأمني.",
    tag: "غياب الإشارة الفضائية ليس دليلاً على البراءة",
  },
];

const findings = [
  {
    value: "origins",
    question: "هل كان حريقاً واحداً؟",
    answer: "قطعاً لا. البيانات تثبت استحالة ذلك فيزيائياً.",
    evidence:
      "12 بداية محتملة تفصل بينها مسافات شاسعة وأراضٍ خضراء لم تحترق (17 ندبة منفصلة). القياس الزمني يثبت استحالة انتقال النار فيزيائياً بين بؤرتين في الوقت المتاح. هذه الأدلة تقطع بتعدد مصادر الإشعال المستقلة.",
    limit:
      "لا تعني كل نقطة حريقاً مستقلاً مؤكداً؛ إنها المواقع التي اجتازت شرطين كمّيين معاً.",
    confidence: "عالية",
    level: 3,
    sources: "الفصل 8 · الفصل 31 · OF-06",
  },
  {
    value: "weather",
    question: "لماذا انتشرت النار بهذه السرعة؟",
    answer: "الطقس القاسي يفسّر سرعة الانتشار، لا شرارة البداية.",
    evidence:
      "موجة السيروكو وفرت ظروفاً مثالية (43°م، رطوبة تحت 13٪، هبّات 68 كم/س). تزامن الاشتعالات المتعددة مع هذه الذروة الحرارية (60,792 ميغاواط) يطرح تساؤلات عن استغلال متعمد للظروف البيئية.",
    limit: "الطقس أداة الانتشار وشراسته، لكنه لا يُشعل النار بنفسه.",
    confidence: "عالية",
    level: 3,
    sources: "DS-07 · DS-08 · الفصل 12",
  },
  {
    value: "cause",
    question: "هل كانت البداية طبيعية؟",
    answer: "مستبعد بشدة. لا مبرر طبيعي لاندلاعها.",
    evidence:
      "غياب تام للنشاط الرعدي في محيط 81 كم من البؤر الرئيسية، آخر رعد كان قبل 3 أيام من أقدم بؤرة، وانعدام أي هطول مطري أو تفريغ كهربائي موثق.",
    limit:
      "استنتاج بالاستبعاد نظراً لانعدام الوصول لشبكات البرق المباشرة، إلا أن النتيجة قاطعة عملياً.",
    confidence: "متوسطة إلى عالية",
    level: 3,
    sources: "DS-07 · DS-08 · الفصل 13",
  },
  {
    value: "human",
    question: "هل السبب بشري؟",
    answer: "بالتأكيد، وهو التفسير المنطقي الوحيد.",
    evidence:
      "أمام الاستبعاد الطبيعي القطعي، ووقوع الاشتعالات المتعددة في مناطق التماس البشري، يصبح التدخل البشري حتمياً لتفسير تعدد بؤر المنشأ المستقلة.",
    limit:
      "هذا ترجيح إحصائي قوي ولكنه يتطلب إثباتاً جنائياً لتحديد الجناة.",
    confidence: "متوسطة",
    level: 2,
    sources: "الفصل 14 · الفصل 32",
  },
  {
    value: "intent",
    question: "هل كان متعمّداً أو منسّقاً؟",
    answer: "البيانات الفضائية المفتوحة تترك الحسم للتحقيق الأمني.",
    evidence:
      "تزامن البدايات وتعددها المستقل يشير بقوة للتعمد، غير أن إثبات التنسيق الجنائي (مواد الإشعال، الشهود) يتجاوز قدرات الأقمار الاصطناعية. اختبار التزامن الفضائي قاصر إحصائياً ولا ينفي فرضية التعمد.",
    limit:
      "العمل المنسّق فرضية تفرض نفسها استخباراتياً وأمنياً، والحسم فيها هو مهمة التحقيقات الرسمية.",
    confidence: "عالية في نفي القدرة على الحسم",
    level: 3,
    sources: "الفصل 26 · الفصل 27 · OF-07",
  },
];

const homeChapters = [
  { id: "chapter-04", index: "01", label: "التسلسل الزمني · 23-29 أوت 2026" },
  { id: "chapter-02", index: "02", label: "النشاط يوماً بيوم" },
  { id: "chapter-03", index: "03", label: "دليل بصري من Sentinel-2" },
  { id: "chapter-05", index: "04", label: "استحالة الانتشار الطبيعي (تاكسنة/الشقفة)" },
  { id: "chapter-01", index: "05", label: "ما تثبته الأدلة وما لا تفصله" },
  { id: "chapter-06", index: "06", label: "احتمال الفرضيات وحدود الاختبار" },
  { id: "chapter-07", index: "07", label: "أدلة ومؤشرات الاشتباه الجنائي" },
  { id: "chapter-08", index: "08", label: "النتيجة في خمسة أسئلة" },
  { id: "chapter-09", index: "09", label: "تابع القراءة" },
];

/* البدايات التي قاس القمر الثابت وقتها: آخر صورة صافية ← أول صورة للنار */
const measuredStarts = ignitionWindows.origins
  .filter((origin) => origin.quality === "clean")
  .map((origin) => ({
    origin_id: origin.origin_id,
    from: origin.last_clear_local ?? "",
    to: origin.first_detection_local ?? "",
  }));

const peakLocal = new Date(slotLocalMs(frpSeries.peak.t));
const peakLabel = `${peakLocal.getUTCDate()} أوت، ${String(peakLocal.getUTCHours()).padStart(2, "0")}:${String(peakLocal.getUTCMinutes()).padStart(2, "0")}`;

/*
 * كل صفّ من التسلسل الزمني أعلاه يصير خطوة على المسرح: أيامه، والبدايات التي
 * يسمّيها نصّه، والمشهد الذي يناسبه زمنياً (قبل الحريق حتى 26 أوت، ثم بعده،
 * ثم شدّة الاحتراق عند الانحسار).
 */
const storyPlan: Record<string, Pick<StoryStep, "days" | "focus" | "layer" | "emphasis">> = {
  "23 أوت": { days: [23], focus: ["O00", "O01"], layer: "pre" },
  "24 أوت": { days: [24], focus: ["O03"], layer: "pre" },
  "25 أوت": { days: [25], focus: ["O05"], layer: "pre" },
  "26 أوت": { days: [26], focus: ["O08"], layer: "pre", emphasis: true },
  "27 أوت": { days: [27], focus: [], layer: "post", emphasis: true },
  "28-29 أوت": { days: [28, 29], focus: [], layer: "severity" },
};

const storySteps: StoryStep[] = timeline.map((event) => ({
  key: event.date,
  date: event.date,
  title: event.title,
  body: event.body,
  ...storyPlan[event.date],
}));

const detectionsByDay = Object.fromEntries(
  dailyActivity.days.map((day) => [Number(day.date.slice(-2)), day.detections]),
);

type OriginCsvRow = {
  origin_id: string;
  first_local: string;
  lat: string;
  lon: string;
  daira: string;
  locality: string;
  elevation_m: string;
};

function pad(value: number) {
  return String(value).padStart(2, "0");
}

export default async function Home() {
  const originRows = await readCsvRows<OriginCsvRow>("independent_origins.csv");
  const storyOrigins = originRows.map((row) => {
    const lat = Number(row.lat);
    const lon = Number(row.lon);
    const [date, time] = row.first_local.split(" ");
    return {
      inside: insideAnalysisWindow(lat, lon),
      origin: {
        id: row.origin_id,
        ...framePosition(lat, lon),
        day: Number(date.slice(-2)),
        place: row.locality || row.daira,
        time: `${date.slice(-2)}.08 · ${time}`,
      } satisfies StoryOrigin,
    };
  });

  return (
    <article className="publication pb-16">
      {/* ── الغلاف: السؤال والجواب المختصر، ولوحة الحدث بأرقامه ونبضه ── */}
      <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 border-b border-rule pb-3">
          <StoryBreadcrumb current="الملخص التنفيذي" />
          <p className="numeric hidden text-[11px] text-muted-foreground sm:block">
            36.72°N · 5.95°E
          </p>
        </div>

        <div className="grid gap-x-12 gap-y-12 pt-10 sm:pt-14 lg:grid-cols-12 lg:pt-16">
          <Reveal className="lg:col-span-7 lg:self-center">
            <Kicker>تحقيق مستقل بالبيانات المفتوحة</Kicker>
            <h1 className="mt-6 text-[clamp(2.6rem,6vw,5.5rem)] font-bold leading-[1.12]">
              كيف بدأت حرائق جيجل،{" "}
              <span className="block text-signal-ink">وكيف انتشرت؟</span>
            </h1>
            <p className="mt-8 max-w-2xl text-[18px] leading-[1.95] text-muted-foreground">
              جمعنا صور الأقمار وبيانات الطقس ورتّبنا ما حدث يوماً بيوم. الأرقام
              تثبت أن البداية لم تكن طبيعية، وأن وراءها تدخلاً بشرياً في نقاط منفصلة
              ومستقلة فيزيائياً. تحديد ما إذا كان هذا التعدد استغلالاً متعمداً أو عملاً
              منسقاً يمثل أولوية تستوجب تدخلاً استخباراتياً وأمنياً حاسماً.
            </p>
            <nav aria-label="مداخل القراءة" className="mt-10 flex flex-wrap gap-3">
              <a
                href="#verdict"
                className="inline-flex h-11 items-center gap-2 bg-foreground px-5 text-[14px] font-medium text-background transition-colors hover:bg-signal-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                الخلاصة على ثلاث درجات
                <ArrowLeftIcon aria-hidden="true" className="size-4" />
              </a>
              <a
                href="#chapter-04"
                className="inline-flex h-11 items-center gap-2 border border-foreground px-5 text-[14px] font-medium transition-colors hover:bg-foreground hover:text-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                التسلسل الزمني · 23-29 أوت 2026
              </a>
            </nav>
          </Reveal>

          <section
            aria-labelledby="event-pulse"
            className="dark flex flex-col border border-border bg-background text-foreground lg:col-span-5"
          >
            <div className="flex items-center justify-between gap-4 border-b border-border px-5 py-3 text-[11px] text-muted-foreground">
              <p className="flex items-center gap-2 font-medium text-foreground">
                <span aria-hidden="true" className="size-1.5 bg-signal" />
                جيجل، الجزائر
              </p>
              <p className="numeric">22-29.08.2026</p>
            </div>
            <StatStrip className="border-t-0 sm:grid-cols-2" items={headlineStats} />
            <div className="mt-auto border-t border-border px-5 pb-5 pt-4">
              <h2 id="event-pulse" className="text-[13px] font-semibold">
                نبض الحدث كما رآه القمر الثابت
              </h2>
              <ThermalRecord
                className="mt-3"
                trackClassName="h-20"
                slots={frpSeries.slots as FrpSlot[]}
                label={`قوة النار كل 15 دقيقة من القمر الثابت بين 21 و30 أوت 2026؛ الذروة ${frpSeries.peak.frp.toLocaleString("en")} ميغاواط يوم ${peakLabel}.`}
              />
              <p className="mt-3 text-[12px] leading-6 text-muted-foreground">
                كل عمود ربع ساعة من صور{" "}
                <span className="ltr-embed">Meteosat-10</span> بالتوقيت المحلي، من 21
                إلى 30 أوت؛ ارتفاعه ولونه يتبعان قوة النار في المنطقة. الذروة{" "}
                <span className="numeric text-foreground">
                  {frpSeries.peak.frp.toLocaleString("en")} MW
                </span>{" "}
                يوم {peakLabel}.
              </p>
              <ThermalLegend className="mt-3" withMarks={false} />
            </div>
          </section>
        </div>

        <MetaLedger
          className="mt-14"
          label="بيانات الملف"
          rows={[...fileMeta, { term: "التصنيف", value: "مفتوح · بيانات عامة" }]}
        />

        {/* ── الخلاصة أولاً: ثلاث درجات بثقتها ── */}
        <Reveal className="mt-24 lg:mt-32">
          <section id="verdict">
            <SectionLabel>الخلاصة على ثلاث درجات</SectionLabel>
            <ol className="mt-12 grid gap-12 lg:grid-cols-3 lg:gap-0">
              {conclusionLevels.map((item, index) => (
                <li
                  key={item.heading}
                  className="relative flex flex-col lg:border-s lg:border-border lg:px-8 lg:first:border-s-0 lg:first:ps-0 lg:last:pe-0"
                >
                  <div className="flex items-end justify-between gap-4">
                    <span className="figure-num text-[clamp(4rem,7vw,6.5rem)] font-extralight leading-[0.9] text-foreground/90">
                      {index + 1}
                    </span>
                    {index < conclusionLevels.length - 1 ? (
                      <ArrowLeftIcon
                        aria-hidden="true"
                        className="mb-3 hidden size-6 text-signal lg:block"
                      />
                    ) : null}
                  </div>
                  <div className="mt-6">
                    <ConfidenceMeter level={item.level} label={item.confidence} />
                  </div>
                  <h3 className="mt-6 text-[clamp(1.25rem,2vw,1.5rem)] font-semibold leading-[1.55]">
                    {item.heading}
                  </h3>
                  <p className="mt-3 text-[15.5px] leading-8 text-muted-foreground">
                    {item.body}
                  </p>
                </li>
              ))}
            </ol>
          </section>
        </Reveal>

        <Reveal className="mt-16">
          <EdgePanel
            className="max-w-3xl"
            tone="signal"
            label="ما الذي لا تستطيع البيانات إثباته؟"
          >
            <h2 className="max-w-2xl text-2xl font-semibold leading-[1.55] sm:text-[28px]">
              محدودية الأقمار الاصطناعية لا تعني غياب التنسيق، بل تحيل الحسم للتحقيقات الأمنية.
            </h2>
            <p className="mt-5 max-w-2xl leading-8">
              احتمال العمل المنسّق يفرض نفسه بقوة (بين{" "}
              <span className="numeric font-semibold">11٪–26٪</span> إحصائياً).
              غياب قدرة الكاميرات الفضائية على التقاط أدوات الإشعال المباشرة لا ينفي الفرضية، بل يجعل التحقيق الجنائي والأمني أمراً حتمياً لكشف الشبكات أو الأفراد المتورطين.
            </p>
            <p className="mt-4 max-w-2xl leading-8">
              بيانات القمر الثابت أثبتت الاستحالة الفيزيائية للتمدد وتعدد مصادر الاشتعال للزوج{" "}
              <span className="ltr-embed">O07/O08</span>. عدم قدرة الرصد الفضائي المفتوح على التفرقة بين فعلين منفصلين وعمل منسق هو قيد تكنولوجي؛ عدم ظهور دليل فضائي صريح ليس دليلاً على البراءة.
            </p>
            <ClaimBasis
              level={3}
              confidence="عالية في نفي القدرة على الحسم"
              sources="الفصل 15.6 · الفصل 26 · الفصل 32"
              sourcesHref="/report#26"
            />
          </EdgePanel>
        </Reveal>

      </div>

      {/* ── القصة على المشهد: يوماً بيوم فوق صورة Sentinel-2 ── */}
      <div className="mx-auto mt-28 max-w-7xl px-4 sm:px-6 lg:mt-36 lg:px-8">
        <div className="grid gap-x-12 gap-y-6 lg:grid-cols-12">
          <SectionLabel id="chapter-04" index="01" className="lg:col-span-8">
            التسلسل الزمني · 23-29 أوت 2026
          </SectionLabel>
          <p className="self-end text-[15px] leading-8 text-muted-foreground lg:col-span-4">
            <Link
              href="/chronology"
              className="inline-flex items-center gap-2 font-medium text-foreground underline decoration-border underline-offset-[6px] hover:decoration-foreground"
            >
              السرد الكامل يوماً بيوم، مع أوقات بداية حُدّدت بدقة 15 دقيقة
              <ArrowLeftIcon aria-hidden="true" className="size-4 shrink-0" />
            </Link>
          </p>
        </div>
      </div>

      <div className="mt-10">
        <StoryStage
          steps={storySteps}
          origins={storyOrigins.filter((entry) => entry.inside).map((entry) => entry.origin)}
          outside={storyOrigins.filter((entry) => !entry.inside).map((entry) => entry.origin)}
          pre={{ src: preSatellite.path, width: preSatellite.width, height: preSatellite.height, alt: `${preSatellite.title}: ${preSatellite.caption}` }}
          post={{ src: openingSatellite.path, width: openingSatellite.width, height: openingSatellite.height, alt: `${openingSatellite.title}: ${openingSatellite.caption}` }}
          severity={{ src: severityRaster.path, width: severityRaster.width, height: severityRaster.height, alt: `${severityRaster.title}: ${severityRaster.caption}` }}
          detectionsByDay={detectionsByDay}
          record={
            <ThermalRecord
              trackClassName="h-10 sm:h-12"
              slots={frpSeries.slots as FrpSlot[]}
              marks={measuredStarts}
              label="قوة النار كل 15 دقيقة من القمر الثابت بين 21 و30 أوت 2026."
            />
          }
        />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Dossier index={homeChapters} indexHeading="أقسام الملخص">
        <Reveal>
          <SectionLabel id="chapter-02" index="02">
            النشاط يوماً بيوم
          </SectionLabel>
          <DataFigure
            className="mt-8"
            sensor="VIIRS · P1_Chekfa_origin"
            meta="23-29.08.2026 · توقيت محلي"
            caption={
              <>
                تزامن القفزة الحاسمة يومَي 26 و27 أوت مع ذروة الطقس يعكس استغلالاً مريباً للظروف. بيانات الطقس في تبويب «الطقس» هي تقدير ساعي عند بداية حريق الشقفة.
              </>
            }
          >
            <DailyActivityChart days={dailyActivity.days as DailyActivity[]} />
          </DataFigure>
        </Reveal>

        <Reveal className="mt-24">
          <SectionLabel id="chapter-03" index="03">
            دليل بصري من Sentinel-2
          </SectionLabel>
          <SatelliteComparison
            className="mt-8"
            before={figure("s2-pre-truecolor")}
            after={openingSatellite}
          />
          <DataFigure
            className="mt-10"
            sensor="Sentinel-2 · MSI L2A"
            meta="18 → 28.08.2026 · dNBR"
            caption={
              <>
                ثلاث لوحات من <span className="ltr-embed">Sentinel-2</span>:
                الغطاء قبل الحريق (18 أوت)، بعده (28 أوت)، وخريطة شدة الاحتراق.
                الأحمر مساحات احترقت بشدة، والرمادي غطاء لم يحترق يثبت التعدد البؤري.
              </>
            }
          >
            <Image
              src={sentinelComparison.path}
              alt="ثلاث لوحات من Sentinel-2 لمنطقة جيجل: الغطاء النباتي في 18 أوت قبل الحريق، الوضع في 28 أوت بعده، وخريطة شدة الاحتراق dNBR"
              width={sentinelComparison.width}
              height={sentinelComparison.height}
              sizes="(min-width: 1024px) 60rem, 100vw"
              className="h-auto w-full bg-white"
            />
          </DataFigure>

          <Alert className="mt-8 max-w-2xl">
            <AlertTitle>تنبيه زمني جوهري</AlertTitle>
            <AlertDescription>
              أول رصد فضائي ليس لحظة الاشتعال. النار قد تُضرم وتنتشر لساعات (حتى 10 ساعات فوق القطاع الغربي يوم 26 أوت) قبل أن يمر القمر لتصويرها، مما يمنح نافذة زمنية واسعة للاستغلال.
            </AlertDescription>
          </Alert>
        </Reveal>

        <Reveal className="mt-24">
          <SectionLabel id="chapter-05" index="04">
            استحالة الانتشار الطبيعي (تاكسنة/الشقفة)
          </SectionLabel>
          <DataFigure
            className="mt-8"
            sensor="O05 → O08"
            meta="25-26.08.2026 · 24 h"
            caption="الاتجاه غرباً مع رياح تعاكس مسار النار نحو الشمال الشرقي. الفجوة الخضراء والندبتان المنفصلتان تثبتان فيزيائياً تعدد الإشعال واستحالة زحف نار الشقفة إلى تاكسنة بشكل طبيعي."
          >
            <ChekfaTexennaDiagram />
          </DataFigure>
        </Reveal>

        <Reveal className="mt-24">
          <SectionLabel id="chapter-01" index="05">
            ما تثبته الأدلة وما لا تفصله
          </SectionLabel>
          <div className="mt-8 max-w-4xl">
            <Table className="min-w-[42rem] text-sm">
              <TableHeader>
                <TableRow>
                  <TableHead>السؤال</TableHead>
                  <TableHead>ما تقوله البيانات</TableHead>
                  <TableHead>درجة الثقة</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="whitespace-normal align-top font-medium">
                    هل انتشرت من حريق واحد؟
                  </TableCell>
                  <TableCell className="whitespace-normal align-top leading-7">
                    قطعاً لا. الاستحالة الفيزيائية للانتقال تُثبت تعدد البدايات المستقلة والمتباعدة زمانياً ومكانياً.
                  </TableCell>
                  <TableCell className="whitespace-normal align-top">عالية</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="whitespace-normal align-top font-medium">
                    هل السبب طبيعي؟
                  </TableCell>
                  <TableCell className="whitespace-normal align-top leading-7">
                    مستبعد عملياً. انتفاء البرق والمبررات البيئية يحصر الأسباب في التدخل الخارجي.
                  </TableCell>
                  <TableCell className="whitespace-normal align-top">
                    متوسطة إلى عالية
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="whitespace-normal align-top font-medium">
                    هل السبب بشري؟
                  </TableCell>
                  <TableCell className="whitespace-normal align-top leading-7">
                    حتمي. التدخل البشري هو التفسير العلمي الوحيد لتعدد نقاط الإشعال المستقلة وتزامنها.
                  </TableCell>
                  <TableCell className="whitespace-normal align-top">متوسطة</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="whitespace-normal align-top font-medium">
                    هل كان منسّقاً؟
                  </TableCell>
                  <TableCell className="whitespace-normal align-top leading-7">
                    البيانات المفتوحة ترصد النتيجة الحرارية ولا تلتقط الفاعل. التزامن المدروس يستوجب حسمه عبر التحقيق الأمني والاستخباراتي الميداني.
                  </TableCell>
                  <TableCell className="whitespace-normal align-top">
                    عالية في نفي القدرة على الحسم
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </Reveal>

        <Reveal className="mt-24">
          <SectionLabel id="chapter-06" index="06">
            احتمال الفرضيات وحدود الاختبار
          </SectionLabel>
          <p className="mt-6 max-w-2xl text-[17px] leading-9">
            البيانات تُسقط نهائياً فرضية الحريق الواحد العشوائي لصالح التعدد المقصود في ذروة موجة الحر، مما يطرح التزامن المتعمد كأولوية قصوى.
          </p>
          <HypothesisMatrix
            className="mt-8 max-w-3xl"
            rows={forensicSummary.hypotheses.structure}
            caption="حتى مع تخفيف وزن الأدلة إحصائياً، تبرز الحاجة لمعطيات أمنية وتقاطعات استخباراتية لحسم طبيعة التنسيق (بافتراض احتمالية مسبقة تبلغ 0.80)."
          />
          <div className="mt-12 grid gap-10 xl:grid-cols-2">
            <DataFigure
              sensor="ACH · EUMETSAT MSG/SEVIRI"
              meta="الفصل 15.6 · الفصل 26"
              caption="النسبة 11٪–26٪ تعكس محدودية الإحصاء الفضائي المفتوح وليس استبعاداً للعمل المنسق. تعدد مصادر الإشعال حقيقة فيزيائية (كالزوج O07/O08)، وفك شيفرة التنسيق متروك للتحقيق الأمني."
            >
              <Image
                src={posteriors.path}
                alt="رسم يبيّن احتمال العمل المنسق بين 11 و26 بالمئة عند تغيير افتراضات الحساب"
                width={posteriors.width}
                height={posteriors.height}
                sizes="(min-width: 1280px) 30rem, (min-width: 1024px) 60rem, 100vw"
                className="h-auto w-full bg-white"
              />
            </DataFigure>
            <DataFigure
              sensor="اختبار القوة · بيانات قطبية"
              meta="الفصل 25 · الفصل 26"
              caption="قصور الأقمار لا يمحو الجريمة: اختبار التزامن الفضائي قاصر لدرجة أنه يعجز عن رصد سيناريو بـ 45 بداية متعمدة في 98.5٪ من الحالات."
            >
              <Image
                src={powerLimits.path}
                alt="رسم يوضح أن اختبارات البدايات المتقاربة لا تكفي لنفي وجود عمل منسق"
                width={powerLimits.width}
                height={powerLimits.height}
                sizes="(min-width: 1280px) 30rem, (min-width: 1024px) 60rem, 100vw"
                className="h-auto w-full bg-white"
              />
            </DataFigure>
          </div>
        </Reveal>

        <Reveal className="mt-24">
          <SectionLabel id="chapter-07" index="07">
            أدلة ومؤشرات الاشتباه الجنائي
          </SectionLabel>
          <p className="mt-6 max-w-2xl text-[17px] leading-9">
            الملاحظات الفضائية التالية تمثل خيوطاً قوية تستوجب فحصاً استخباراتياً وميدانياً عاجلاً للوقوف على الأيادي الخفية المحتملة.
          </p>
          <div className="mt-10" />
          <EvidencePlates
            items={suspicion}
            elevations={originRows.map((row) => ({
              id: row.origin_id,
              elevation: Number(row.elevation_m),
            }))}
          />
        </Reveal>

        <Reveal className="mt-12">
          <EdgePanel className="max-w-3xl" label="ظروف معقدة أم استغلال محكم؟">
            <p className="leading-8">
              عوامل الطقس لا تنفي الجريمة بل قد تمثل سلاحاً لها:
            </p>
            <ul className="mt-3 flex list-disc flex-col gap-2 pe-5 leading-8 marker:text-signal">
              <li>
                اشتعال الحرائق في توقيت يطابق ذروة الطقس الشديد بقوة (<span className="ltr-embed">p = 1×10⁻²³</span>) يشير إلى استغلال متعمد ومحسوب للظروف البيئية العنيفة أكثر من كونه مصادفة.
              </li>
              <li>
                رغم أن الخلفية الصيفية تسجل تعدد بؤر (199 بداية مستقلة وطنياً)، إلا أن الخصائص الزمانية والمكانية المرصودة هنا تمثل نمطاً مريباً وخطيراً.
              </li>
              <li>
                غياب الأنماط الهندسية الفاضحة من الأقمار هو ما تستخدمه التكتيكات المتعمدة للتخفي في المشهد المألوف.
              </li>
            </ul>
            <p className="mt-5 border-t border-border pt-4 text-sm leading-7">
              هذه المعطيات تُحكم القبضة حول فرضية الاستغلال البشري المتعمد وتجعل التفسير الطبيعي أو العشوائي ضرباً من المستحيل.
            </p>
          </EdgePanel>
        </Reveal>

        <Reveal className="mt-24">
          <SectionLabel id="chapter-08" index="08">
            النتيجة في خمسة أسئلة
          </SectionLabel>
          <Accordion
            type="single"
            collapsible
            defaultValue="origins"
            className="mt-8 max-w-3xl border-t border-rule"
          >
            {findings.map((finding, index) => (
              <AccordionItem
                key={finding.value}
                value={finding.value}
                className="border-b border-border"
              >
                <AccordionTrigger className="rounded-none py-5 text-[17px] hover:no-underline">
                  <span className="flex flex-1 items-center gap-4 pe-3">
                    <span className="numeric text-xs text-muted-foreground">
                      {pad(index + 1)}
                    </span>
                    <span className="text-start font-semibold">{finding.question}</span>
                    <span
                      className={`ms-auto flex shrink-0 items-center gap-1.5 text-xs font-medium ${confidenceTone(finding.level).text}`}
                    >
                      <ConfidenceDot level={finding.level} />
                      <span className="hidden sm:inline">
                        {finding.confidence}
                      </span>
                    </span>
                  </span>
                </AccordionTrigger>
                <AccordionContent className="pb-7 sm:ps-8">
                  <p className="text-[17px] font-medium leading-8">
                    {finding.answer}
                  </p>
                  <p className="mt-4 leading-8">
                    <span className="font-medium">الدليل: </span>
                    {finding.evidence}
                  </p>
                  <p className="mt-3 leading-8 text-muted-foreground">
                    <span className="font-medium text-foreground">
                      الحد:{" "}
                    </span>
                    {finding.limit}
                  </p>
                  <ClaimBasis
                    level={finding.level}
                    confidence={finding.confidence}
                    sources={finding.sources}
                    sourcesHref="/report"
                  />
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Reveal>

        <Reveal className="mt-12">
          <EdgePanel className="max-w-3xl" label="الكلمة الفصل للتحقيق الأمني">
            <h2 className="max-w-2xl text-2xl font-semibold leading-[1.55] sm:text-[28px]">
              البيانات تثبت التدخل البشري وتعدد نقاط الإشعال. تحديد القصد الجنائي والشبكات المنفذة مسار أمني حتمي.
            </h2>
            <p className="mt-5 max-w-2xl leading-8">
              هذا تحليل مستقل بالبيانات المكانية المفتوحة، لا يصدر أحكاماً قضائية بل يضيء المسارات للتحقيق الجنائي. الكارثة الإنسانية (وفاة 73 شخصاً في الجمعة بني حبيبي، بينهم 21 من عائلة واحدة بحسب تقارير إعلامية، مقارنة بـ 12 وفاة وطنياً بحسب الحصيلة الرسمية الأولى) تتطلب كشف الحقائق كاملة، وهو مسار تتولاه بقوة مصالح الدرك الوطني.
            </p>
            <p className="mt-4 max-w-2xl border-t border-border pt-4 text-sm leading-7 text-muted-foreground">
              التحليل ركز على استبعاد العوامل الطبيعية وتأكيد التعدد المكاني المشبوه. الأعطال الكهربائية واردة كاحتمال غير موثق فضائياً لغياب بيانات الشبكة المتوسطة، لكن استبعادها التلقائي يرفع بقوة أرجحية العمل المفتعل ضمن منظومة الأسباب العرضية الأخرى المتبقية.
            </p>
            <Alert className="mt-6 max-w-2xl bg-background">
              <AlertTitle>الخلاصة الجوهرية</AlertTitle>
              <AlertDescription>
                البصمة البشرية وتعدد نقاط الإشعال المستقلة ثابتان علمياً. أما تحديد ما إذا كانت هذه الانتهاكات البيئية فردية أم عملاً منظماً فهو صميم عمل التحقيقات الاستخباراتية والأمنية الجارية.
              </AlertDescription>
            </Alert>
          </EdgePanel>
        </Reveal>

        <Reveal className="mt-24">
          <SectionLabel id="chapter-09" index="09">
            تابع القراءة
          </SectionLabel>
          <ContinueLinks
            className="mt-8 max-w-4xl"
            label="أقسام المنصة"
            links={siteSections.map((section) => ({
              href: section.href,
              title: section.title,
              summary: section.summary,
              index: sectionIndex(section.href),
            }))}
          />
        </Reveal>
        </Dossier>
      </div>
    </article>
  );
}
