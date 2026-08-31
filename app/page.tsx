import Image from "next/image";
import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";

import { ChekfaTexennaDiagram } from "@/components/evidence-diagrams";
import {
  ClaimBasis,
  ConfidenceDot,
  confidenceTone,
  DataFigure,
  EdgePanel,
  FileMeta,
  SectionLabel,
  StatStrip,
  Timeline,
  TimelineRow,
} from "@/components/editorial";
import {
  type DailyActivity,
  DailyActivityChart,
} from "@/components/investigation-charts";
import { Reveal } from "@/components/motion";
import { StoryBreadcrumb } from "@/components/story-breadcrumb";
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
import { HypothesisMatrix } from "@/components/hypothesis-matrix";
import { figure } from "@/lib/figures";
import { siteSections } from "@/lib/site-navigation";
import dailyActivity from "@/public/generated/data/daily_activity.json";
import forensicSummary from "@/public/generated/data/forensic-summary.json";

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
    body: "لم يُرصد نشاط رعدي على أقل من 81 كم من البؤر الرئيسية، والهطول صفر، وآخر رعد بمحطة جيجل يوم 21 أوت. ولا آلية طبيعية أخرى معقولة في هذا السياق.",
    confidence: "ثقة متوسطة إلى عالية",
  },
  {
    level: 2,
    heading: "إذاً الفعل بشري، بالمعنى العام",
    body: "بعد استبعاد البرق وغياب أي سبب طبيعي آخر، ووقوع البؤر في كتلة جبلية مأهولة، يصبح الفعل البشري التفسير الأرجح. السؤال المتبقّي ليس «إنسان أم طبيعة»، بل «أي فعل بشري».",
    confidence: "ثقة متوسطة",
  },
  {
    level: 3,
    heading: "الحادث والإهمال والتعمّد لا تفصل بينها هذه البيانات",
    body: "صور الأقمار لا تميّز بين عقب سيجارة وشرارة احتكاك وحرق فلاحي وإضرام متعمّد. والفعل المنسّق فرضية مفتوحة احتمالها بين 11٪ و26٪، لا نتيجة. تحقيقات الدرك الوطني في الأسباب جارية.",
    confidence: "ثقة عالية في نفي القدرة على الحسم",
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
    body: "نواة المجمّع الرئيسي، وندبته B00 تبلغ 400 كم² في صور Sentinel-2. سطوع مشبع وثقة رصد مرتفعة.",
  },
  {
    date: "26 أوت",
    title: "الانفجار تحت السيروكو",
    body: "جبهة تاكسنة تظهر بـ43 خلية دفعة واحدة. المحطة تسجّل 43°م ورطوبة 12.5٪ مساءً وهبّات 68 كم/س. في هذه الليلة وقعت الحصيلة البشرية الأثقل.",
  },
  {
    date: "27 أوت",
    title: "الذروة الوطنية",
    body: "780 بؤرة في تمريرة ليلية واحدة، وحرائق في 13 ولاية خلال 24 ساعة. الحكومة تعلن تحقيقات في «الاندلاع المتزامن».",
  },
  {
    date: "28-29 أوت",
    title: "الانحسار",
    body: "عودة الرطوبة إلى جيجل، وانخفاض حادّ في النشاط. الدرك الوطني يباشر تحقيقات في الأسباب ومدى ارتباطها بأفعال إجرامية.",
  },
];

const suspicion = [
  {
    title: "الشقفة وتاكسنة: أقوى مؤشر في الملف",
    body: "بؤرتان تفصلهما 19.52 كم وظهرتا بفارق 24 ساعة. السمت بينهما 262° بينما الريح تدفع بين 33° و35°، وبينهما فجوة غير محترقة طولها 22.78 كم، وندبتان منفصلتان في Sentinel-2 يفصل بينهما غطاء سليم. حريق تاكسنة اشتعال مستقل لم يأتِ من الشقفة.",
    tag: "ثقة عالية في الاستقلال المكاني",
  },
  {
    title: "قياس التوقيت من القمر الثابت",
    body: "قمر يصوّر الإقليم كل 15 دقيقة قلّص نافذة الجهل بلحظة البداية من أيام إلى ربع ساعة لست بؤر. وظهر أن تاكسنة وترعي باينان اشتعلتا بفارق 11 إلى 30 دقيقة، بينما يستغرق الطريق بينهما 49 دقيقة على أفضل تقدير، وتقعان في ندبتين منفصلتين. مصدر واحد لا يكفي لتفسيرهما.",
    tag: "ثقة عالية في لزوم مصدرَي اشتعال",
  },
  {
    title: "تعدّد بؤر المنشأ",
    body: "12 مرشّحاً، 6 منها بجيجل. كلٌّ يستوفي معاً معيارَي البُعد (≥5 كم عن أقرب حريق سابق) وانقطاع المسار (فجوة غير محترقة ≥4 كم). ويطابق التحليل الفضائي خمساً من ست بلديات وردت بالاسم في بلاغ الحماية المدنية.",
    tag: "مؤكَّد كواقعة؛ لا يدلّ بذاته على التعمّد",
  },
  {
    title: "شذوذ بؤرة الجمعة بني حبيبي",
    body: "أدنى ارتفاع بين كل البؤر (نحو 55 م مقابل نطاق من 190 إلى 923 م)، و22 م فقط من طريق ثانوي، وأعلى «درجة مدخنة» في المجموعة، وهي بلدية الحصيلة البشرية الأثقل. لكن القرب من الطريق يتوافق مع سبب عرضي بقدر ما يتوافق مع التعمّد.",
    tag: "ملاحظة تستحق فحصاً ميدانياً",
  },
  {
    title: "إشارات التوقيت",
    body: "أربع بؤر أول رصدها ليلاً، والوزير يصف «الاندلاع المتزامن»، و705 مواقع أعادت الاشتعال وطنياً بعد خمود. أما «التزامن التام» بين بابور ودرقينة فقد سقط: نافذتهما العمياء 24.6 ساعة لكلٍّ منهما، ولا تفصلهما إلا 9.6 كم أسفل الريح، فقد تكون الثانية امتداداً بالجمرات.",
    tag: "لافتة، وغامضة الدلالة",
  },
  {
    title: "اختبارات النفي بلا قوة",
    body: "أغلق القمر الثابت فجوة التوقيت لنصف البؤر، لكنه لا يفرّق بين فعلين مستقلين وعمل منسّق. واختبار التزامن نفسه يكشف عملية محقونة من 45 بؤرة في 1.5٪ من الحالات فقط. غياب البصمة ليس تبرئة.",
    tag: "ثقة عالية في ضعف الاختبار",
  },
];

const findings = [
  {
    value: "origins",
    question: "هل كان حريقاً واحداً؟",
    answer: "على الأرجح لا. البيانات تشير إلى بدايات منفصلة.",
    evidence:
      "12 بداية محتملة تفصل بينها مسافات وأراضٍ لم تحترق، و17 ندبة كبيرة منفصلة في صور Sentinel-2، ثم قياس زمني من قمر ثابت يثبت أن بدايتين منها اشتعلتا في وقت لا يكفي للانتقال بينهما. ثلاث طرق مستقلة تصل إلى النتيجة نفسها.",
    limit:
      "لا تعني كل نقطة حريقاً مستقلاً مؤكداً؛ إنها المواقع التي اجتازت شرطين كمّيين معاً.",
    confidence: "عالية",
    level: 3,
    sources: "الفصل 8 · الفصل 31 · OF-06",
  },
  {
    value: "weather",
    question: "لماذا انتشرت النار بهذه السرعة؟",
    answer: "الحرارة والجفاف والرياح تفسّر سرعة الانتشار.",
    evidence:
      "بلغت موجة السيروكو ذروتها في الوقت نفسه الذي قفز فيه النشاط الحراري إلى 60,792 ميغاواط في تمريرة واحدة: حرارة تتجاوز 43°م، ورطوبة تحت 13٪، وهبّات حتى 68 كم/س.",
    limit: "الطقس يشرح كيف كبر الحريق، لا كيف بدأت الشرارة الأولى.",
    confidence: "عالية",
    level: 3,
    sources: "DS-07 · DS-08 · الفصل 12",
  },
  {
    value: "cause",
    question: "هل كانت البداية طبيعية؟",
    answer: "غير مرجّح. البرق مستبعد ولا آلية طبيعية أخرى.",
    evidence:
      "لا نشاط رعدي دون 81 كم من البؤر الرئيسية، هطول صفر، وآخر رعد بمحطة جيجل يوم 21 أوت، أي قبل أقدم بؤرة بالولاية بأكثر من ثلاثة أيام.",
    limit:
      "استنتاج بالاستبعاد لا دليل ميداني. وتعذّر الوصول إلى أي شبكة لتحديد مواقع الصواعق يبقي الاستدلال غير مباشر.",
    confidence: "متوسطة إلى عالية",
    level: 3,
    sources: "DS-07 · DS-08 · الفصل 13",
  },
  {
    value: "human",
    question: "هل السبب بشري؟",
    answer: "يرجّح، بالمعنى العام.",
    evidence:
      "بعد أن أصبح البرق غير مرجّح، ومع انتفاء أي سبب طبيعي آخر، ووقوع البؤر في كتلة جبلية مأهولة بنشاط بشري واسع، يصبح الفعل البشري التفسير الأرجح.",
    limit:
      "هذا ترجيح بالاستبعاد، وقوّته محدودة بجودة البيانات التي استبعدت البرق.",
    confidence: "متوسطة",
    level: 2,
    sources: "الفصل 14 · الفصل 32",
  },
  {
    value: "intent",
    question: "هل كان متعمّداً أو منسّقاً؟",
    answer: "لا تحسمه هذه البيانات.",
    evidence:
      "لا فحص ميداني، ولا شهود، ولا مواد إشعال، ولا توقيفات تخصّ حرائق 24-29 أوت. واختبار التزامن، وهو المؤشر المركزي، قوّته صفر عملياً، فلا تصلح نتيجته السلبية للنفي.",
    limit:
      "الفعل المنسّق فرضية مفتوحة احتمالها بين 11٪ و26٪، لا نتيجة مثبتة ولا منفية. الحسم من اختصاص التحقيق الرسمي.",
    confidence: "عالية في نفي القدرة على الحسم",
    level: 3,
    sources: "الفصل 26 · الفصل 27 · OF-07",
  },
];

export default function Home() {
  return (
    <article className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <StoryBreadcrumb current="الملخص التنفيذي" />

      <div className="mt-10 grid gap-x-8 gap-y-10 lg:grid-cols-[190px_minmax(0,45rem)] lg:justify-center lg:gap-x-16">
        <aside className="order-2 border-t pt-6 lg:sticky lg:top-16 lg:order-1 lg:self-start lg:border-t-0 lg:border-e lg:pe-8 lg:pt-0">
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
          <Reveal>
            <p className="text-[11px] font-medium text-muted-foreground">
              تحقيق مستقل بالبيانات المفتوحة
            </p>
            <h1 className="mt-4 max-w-3xl text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
              كيف بدأت حرائق جيجل، وكيف انتشرت؟
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-9">
              جمعنا صور الأقمار وبيانات الطقس ورتّبنا ما حدث يوماً بيوم. الأرقام
              ترجّح أن البداية لم تكن طبيعية، وأن وراءها فعلاً بشرياً. أما نوع هذا
              الفعل، حادث أم إهمال أم تعمّد، ومن يقف خلفه، فلا تحسمه هذه البيانات.
            </p>
            <StatStrip className="mt-8" items={headlineStats} />
          </Reveal>

          <Reveal className="mt-14">
            <section>
              <SectionLabel>الخلاصة على ثلاث درجات</SectionLabel>
              <ol className="mt-4 max-w-3xl divide-y border border-s-[3px] border-s-foreground">
                {conclusionLevels.map((item, index) => (
                  <li key={item.heading} className="px-5 py-5">
                    <div className="flex items-baseline gap-3">
                      <span className="numeric text-xs text-muted-foreground">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <div className="min-w-0">
                        <h3 className="text-base font-semibold leading-6">
                          {item.heading}
                        </h3>
                        <p className="mt-2 leading-8">{item.body}</p>
                        <p
                          className={`mt-3 flex items-center gap-1.5 text-xs font-medium ${confidenceTone(item.level).text}`}
                        >
                          <ConfidenceDot level={item.level} />
                          {item.confidence}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          </Reveal>

          <Reveal className="mt-10">
            <EdgePanel
              className="max-w-3xl"
              label="قراءة ملزمة لحدود النتيجة"
            >
              <h2 className="max-w-2xl text-2xl font-semibold leading-snug tracking-tight sm:text-3xl">
                لم ينفِ التقرير الفعل المنسّق؛ لم يستطع اختباره اختباراً ذا قوة.
              </h2>
              <p className="mt-5 max-w-2xl leading-8">
                احتمال العملية الإجرامية المنسّقة بين{" "}
                <span className="numeric font-semibold">11٪–26٪</span> بحسب
                درجة تلطيف الأدلة: غير مرجّح، لكنه ضمن نطاق يستوجب تحقيقاً
                جدياً، لا مستبعد.
              </p>
              <p className="mt-4 max-w-2xl leading-8">
                بيانات القمر الثابت أثبتت مصدرَي اشتعال على الأقل لزوج{" "}
                <span className="ltr-embed">O07/O08</span>، لكنها لا تفرّق بين
                فعلين مستقلين وعمل منسّق. والاختبارات البديلة بلا قوة ضد فاعل
                محترف؛ عجز أدوات الرصد ليس براءة ثبتت.
              </p>
              <ClaimBasis
                level={3}
                confidence="عالية في نفي القدرة على الحسم"
                sources="الفصل 15.6 · الفصل 26 · الفصل 32"
                sourcesHref="/report#26"
              />
            </EdgePanel>
          </Reveal>

          <Reveal className="mt-14">
            <SectionLabel index="01">ما تثبته الأدلة وما لا تفصله</SectionLabel>
            <div className="mt-4 max-w-3xl border">
              <Table className="min-w-[42rem] text-sm">
                <TableHeader className="bg-muted/40">
                  <TableRow>
                    <TableHead>السؤال</TableHead>
                    <TableHead>ما تقوله البيانات</TableHead>
                    <TableHead>درجة الثقة</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="whitespace-normal font-medium">
                      هل انتشرت من حريق واحد؟
                    </TableCell>
                    <TableCell className="whitespace-normal leading-7">
                      لا. عدة بؤر مستقلة مكانياً وزمنياً؛ وأوضحها انفصال تاكسنة
                      عن الشقفة بصور الانعكاسية والندبات المنفصلة.
                    </TableCell>
                    <TableCell className="whitespace-normal">عالية</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="whitespace-normal font-medium">
                      هل السبب طبيعي؟
                    </TableCell>
                    <TableCell className="whitespace-normal leading-7">
                      غير مرجّح. البرق استُبعد عملياً، ولا بقي سبب طبيعي معقول في
                      نطاق الأدلة المتاحة.
                    </TableCell>
                    <TableCell className="whitespace-normal">
                      متوسطة إلى عالية
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="whitespace-normal font-medium">
                      هل السبب بشري؟
                    </TableCell>
                    <TableCell className="whitespace-normal leading-7">
                      يرجّح بالمعنى العام، من دون فصل عرضي أو إهمال أو فعل متعمّد.
                    </TableCell>
                    <TableCell className="whitespace-normal">متوسطة</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="whitespace-normal font-medium">
                      هل كان منسّقاً؟
                    </TableCell>
                    <TableCell className="whitespace-normal leading-7">
                      لا يمكن الحسم. الفعل المتعمّد، بما فيه المنسّق، فرضية حيّة
                      مفتوحة تتطلب أدلة التحقيق الميداني.
                    </TableCell>
                    <TableCell className="whitespace-normal">
                      عالية في نفي القدرة على الحسم
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </Reveal>

          <Reveal className="mt-14">
            <SectionLabel index="02">النشاط يوماً بيوم</SectionLabel>
            <DataFigure
              className="mt-4"
              sensor="VIIRS · P1_Chekfa_origin"
              meta="23-29.08.2026 · توقيت محلي"
              caption={
                <>
                  بلغت القفزة الحاسمة يومَي 26 و27 أوت. بيانات الطقس في تبويب
                  «الطقس» مشتقة من السلسلة الساعية المنمذجة عند منشأ الشقفة، وليست
                  متوسطاً مكانياً لولاية جيجل.
                </>
              }
            >
              <DailyActivityChart days={dailyActivity.days as DailyActivity[]} />
            </DataFigure>
          </Reveal>

          <Reveal className="mt-14">
            <SectionLabel index="03">دليل بصري من Sentinel-2</SectionLabel>
            <DataFigure
              className="mt-4 max-w-xl"
              sensor="Sentinel-2 · MSI L2A"
              meta="18 → 28.08.2026 · dNBR"
              caption={
                <>
                  ثلاث لوحات من <span className="ltr-embed">Sentinel-2</span>:
                  الغطاء قبل الحريق (18 أوت)، بعده (28 أوت)، وخريطة شدة الاحتراق.
                  الأحمر مساحات احترقت بشدة، والرمادي غطاء لم يحترق.
                </>
              }
            >
              <Image
                src={sentinelComparison.path}
                alt="ثلاث لوحات من Sentinel-2 لمنطقة جيجل: الغطاء النباتي في 18 أوت قبل الحريق، الوضع في 28 أوت بعده، وخريطة شدة الاحتراق dNBR"
                width={sentinelComparison.width}
                height={sentinelComparison.height}
                className="h-auto w-full bg-white"
              />
            </DataFigure>

            <Alert className="mt-6 max-w-2xl">
              <AlertTitle>فرق مهم قبل القراءة</AlertTitle>
              <AlertDescription>
                أول رصد فضائي ليس لحظة الاشتعال. قد تبدأ النار قبل مرور القمر
                بساعات؛ بلغت فجوة الرصد فوق القطاع الغربي نحو عشر ساعات يوم 26 أوت.
              </AlertDescription>
            </Alert>
          </Reveal>

          <Reveal className="mt-14">
            <SectionLabel index="04">
              التسلسل الزمني · 23-29 أوت 2026
            </SectionLabel>
            <Timeline className="mt-4 max-w-3xl">
              {timeline.map((event) => (
                <TimelineRow
                  key={event.title}
                  date={event.date}
                  title={event.title}
                >
                  {event.body}
                </TimelineRow>
              ))}
            </Timeline>
            <p className="mt-3 max-w-3xl text-sm">
              <Link
                href="/chronology"
                className="underline decoration-border underline-offset-4 hover:decoration-foreground"
              >
                السرد الكامل يوماً بيوم، مع لحظات البداية المقيسة بدقّة ربع ساعة
              </Link>
            </p>
          </Reveal>

          <Reveal className="mt-14">
            <SectionLabel index="05">أقوى اختبار مكاني</SectionLabel>
            <DataFigure
              className="mt-4"
              sensor="O05 → O08"
              meta="25-26.08.2026 · 24 h"
              caption="يتجه المسار من الشقفة إلى تاكسنة غرباً، بينما كانت الريح تدفع النار نحو الشمال الشرقي. مع الفجوة غير المحترقة والندبتين المنفصلتين، يستبعد ذلك وصول نار الشقفة إلى تاكسنة بالانتشار السطحي المرصود."
            >
              <ChekfaTexennaDiagram />
            </DataFigure>
          </Reveal>

          <Reveal className="mt-14">
            <SectionLabel index="06">احتمال الفرضيات وحدود الاختبار</SectionLabel>
            <p className="mt-4 max-w-2xl leading-8">
              وزنت مصفوفة الفرضيات المتنافسة كل تفسير ممكن لبنية الحدث بأدلة
              مؤيدة ومفنّدة. النتيجة أن التفسير الأرجح بفارق كبير هو تراكم
              اشتعالات مستقلة مختلطة الأسباب تحت موجة حرّ واحدة، وأن الحريق
              الواحد المنتشر شبه مستبعد.
            </p>
            <HypothesisMatrix
              className="mt-5 max-w-2xl"
              rows={forensicSummary.hypotheses.structure}
              caption="«بعد التلطيف» يخفض وزن كل دليل إلى النصف لاختبار متانة الترتيب. الاتجاه يصمد: يلزم احتمال قبلي قدره 0.80 قبل أن تتقدّم فرضية التنسيق."
            />
            <DataFigure
              className="mt-4"
              sensor="ACH · EUMETSAT MSG/SEVIRI"
              meta="الفصل 15.6 · الفصل 26"
              caption="النطاق 11٪–26٪ هو قراءة حساسية لفرضية العملية المنسّقة، لا حكم بالاستبعاد. القياس الجديد يثبت مصدرين على الأقل لزوج O07/O08، لكنه لا يميّز بين سببين مستقلين وتنسيق مقصود."
            >
              <Image
                src={posteriors.path}
                alt="رسم للاحتمالات اللاحقة لفرضيات بنية الحدث، يضع العملية الإجرامية المنسقة بين 11 و26 بالمئة بحسب تلطيف الأدلة"
                width={posteriors.width}
                height={posteriors.height}
                className="h-auto w-full bg-white"
              />
            </DataFigure>
            <DataFigure
              className="mt-6"
              sensor="اختبار القوة · بيانات قطبية"
              meta="الفصل 25 · الفصل 26"
              caption="الاختبار السلبي لا ينفي التنسيق: اختبار التزامن على البيانات القطبية يكشف عملية محقونة من 45 بؤرة في 1.5٪ فقط من الحالات."
            >
              <Image
                src={powerLimits.path}
                alt="رسم يوضح أن اختبارات التزامن والاختبارات البديلة محدودة القوة ولا تصلح لنفي عملية منسقة محترفة"
                width={powerLimits.width}
                height={powerLimits.height}
                className="h-auto w-full bg-white"
              />
            </DataFigure>
          </Reveal>

          <Reveal className="mt-14">
            <SectionLabel index="07">أدلة الاشتباه</SectionLabel>
            <p className="mt-4 max-w-2xl leading-8">
              ستة عناصر استوقفت التحليل، مرتّبة بحسب قوّتها. لا واحد منها دليل على
              فعل متعمّد، لكنها مجتمعة ترسم ما يستحق تحقيقاً ميدانياً.
            </p>
            <div className="mt-5 max-w-3xl divide-y border">
              {suspicion.map((item) => (
                <div key={item.title} className="px-4 py-5">
                  <h3 className="text-sm font-semibold leading-6">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-7">{item.body}</p>
                  <p className="mt-3 text-[11px] text-muted-foreground">
                    {item.tag}
                  </p>
                </div>
              ))}
            </div>
          </Reveal>

          <EdgePanel className="mt-14 max-w-3xl" label="المادة المضادة">
            <p className="leading-8">
              يُذكر ما يشدّ في الاتجاه الآخر، لأن إخفاءه يفسد التحليل:
            </p>
            <ul className="mt-3 flex list-disc flex-col gap-2 pe-5 leading-8 marker:text-border">
              <li>
                الاشتعالات تتبّع طقس الحرائق بقوة شديدة؛ احتمال أن يكون ذلك مصادفة
                ضئيل جداً (<span className="ltr-embed">p = 1×10⁻²³</span>).
              </li>
              <li>
                تعدّد البؤر هو الخلفية الوطنية الدائمة صيفاً: 199 بؤرة مستقلة عبر
                الشمال الجزائري، بمعدل من 7 إلى 58 يومياً.
              </li>
              <li>
                لا بصمة اختيار تكتيكي للمواقع، ولا دليل إيجابي واحد على التنسيق.
              </li>
            </ul>
            <p className="mt-4 border-t pt-4 text-sm leading-7">
              لكن ثقل هذه المادة لا يقلب الدرجتين الأوليين: السبب ما زال غير
              طبيعي، والفعل البشري ما زال أرجح.
            </p>
          </EdgePanel>

          <Reveal className="mt-14">
            <SectionLabel index="08">النتيجة في خمسة أسئلة</SectionLabel>
            <Accordion
              type="single"
              collapsible
              defaultValue="origins"
              className="mt-4 max-w-3xl border"
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
                        <span className="hidden sm:inline">
                          {finding.confidence}
                        </span>
                      </span>
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="pb-6">
                    <p className="text-base font-medium leading-7">
                      {finding.answer}
                    </p>
                    <p className="mt-4 leading-7">
                      <span className="font-medium">الدليل: </span>
                      {finding.evidence}
                    </p>
                    <p className="mt-3 leading-7 text-muted-foreground">
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

          <EdgePanel className="mt-14 max-w-3xl" label="حدود ما تقوله البيانات">
            <h2 className="max-w-2xl text-2xl font-semibold leading-snug tracking-tight sm:text-3xl">
              نعرف أن السبب الطبيعي غير مرجّح، وأن فعلاً بشرياً أرجح. لا نعرف أي
              فعل بشري كان، ولا من يقف خلفه.
            </h2>
            <p className="mt-5 max-w-2xl leading-8">
              هذا تحليل مستقل للبيانات المفتوحة، لا تحقيق رسمي. لا يصف الحرائق
              بأنها «مفتعلة» ولا «هجوم»، ولا ينسب مسؤولية جنائية لأحد. الحدث كارثة
              بشرية حقيقية: أفادت مصادر إعلامية معتبرة بحصيلة أولية بلغت 73 وفاة
              في الجمعة بني حبيبي، من بينهم 21 شخصاً من عائلة واحدة، بينما كانت
              الحصيلة الرسمية المعلنة يوم 27 أوت 12 وفاة وطنياً و54 جريحاً. وتحقيقات
              الدرك الوطني في الأسباب جارية.
            </p>
            <p className="mt-4 max-w-2xl border-t pt-4 text-sm leading-7 text-muted-foreground">
              لا يتناول هذا التحليل فرضية العطل الكهربائي أو المرفقي: هي خارج نطاق
              التقرير، والبيانات المفتوحة لا تتيح اختبارها أصلاً لأن شبكة التوزيع
              متوسّط الجهد غائبة كلياً عنها. واستبعاد فرضية من المقارنة يرفع آلياً
              وزن ما تبقّى، ومنه الفعل المتعمّد؛ فالأسباب العرضية غير الكهربائية
              تبقى قائمة بكامل وزنها.
            </p>
            <Alert className="mt-6 max-w-2xl">
              <AlertTitle>الخلاصة الدقيقة</AlertTitle>
              <AlertDescription>
                البيانات تفرّق بين الطبيعة والفعل البشري بدرجة معتبرة، لكنها لا
                تفرّق بين الحادث والإهمال والفعل المتعمّد.
              </AlertDescription>
            </Alert>
          </EdgePanel>

          <Reveal className="mt-14">
            <SectionLabel index="09">تابع القراءة</SectionLabel>
            <nav
              aria-label="أقسام المنصة"
              className="mt-4 max-w-3xl divide-y border"
            >
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
          </Reveal>
        </div>
      </div>
    </article>
  );
}
