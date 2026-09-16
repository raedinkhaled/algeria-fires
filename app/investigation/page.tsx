import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";

import {
  ClaimBasis,
  confidenceTone,
  DataFigure,
  Dossier,
  EdgePanel,
  Masthead,
  NightPanel,
  SectionLabel,
  StatStrip,
} from "@/components/editorial";
import { OriginFrame, type FrameOrigin } from "@/components/origin-frame";
import { ChekfaTexennaDiagram } from "@/components/evidence-diagrams";
import { HypothesisMatrix } from "@/components/hypothesis-matrix";
import { Reveal } from "@/components/motion";
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
import { cn } from "@/lib/utils";
import { readCsvRows } from "@/lib/published-csv";
import forensicSummary from "@/public/generated/data/forensic-summary.json";
import ignitionWindows from "@/public/generated/data/msg-ignition-windows.json";
import simultaneousPairs from "@/public/generated/data/msg-simultaneous-pairs.json";

export const metadata: Metadata = {
  title: "كيف عرفنا أن السبب ليس طبيعياً؟",
  description:
    "الأدلة خطوة بخطوة: أول إشارة رآها القمر، تعدّد البدايات، استبعاد البرق، دور الطقس، سجلّ الاشتباه، ثم ما يبقى مفتوحاً وحدوده.",
};

const severity = figure("s2-dnbr-severity");
const postScene = figure("s2-post-truecolor");

const measuredOrigins = ignitionWindows.origins.filter(
  (origin) => origin.quality === "clean",
).length;

/** الزوجان اللذان قِيس توقيت طرفيهما معاً؛ ما عداهما يقوم على نافذة عمياء. */
const resolvedPairs = simultaneousPairs.pairs.filter((pair) => pair.resolved);

const windGeometry: Record<string, string> = {
  upwind: "أعلى الريح — الجمرات تُقذف بعيداً",
  crosswind: "عرض الريح",
  downwind: "أسفل الريح",
};

const fileMeta = [
  { term: "القسم", value: "التحقيق" },
  { term: "طريقة القراءة", value: "9 محطات قصيرة" },
  { term: "الفترة", value: "22-29.08.2026", mono: true },
  { term: "المصادر", value: "DS · OF · ME", mono: true },
];

const stations = [
  { id: "first-signal", index: "01", label: "أول إشارة" },
  { id: "multiple-origins", index: "02", label: "تعدّد البدايات" },
  { id: "chekfa-texenna", index: "03", label: "الشقفة وتاكسنة" },
  { id: "geostationary", index: "04", label: "متى بالضبط؟" },
  { id: "lightning", index: "05", label: "البرق مستبعد" },
  { id: "weather", index: "06", label: "الطقس والاتساع" },
  { id: "human", index: "07", label: "إذاً: الفعل البشري" },
  { id: "suspicion-register", index: "08", label: "سجلّ الاشتباه" },
  { id: "limits", index: "09", label: "ما لا نعرفه" },
];

const suspicionSignals = [
  {
    title: "الشقفة وتاكسنة",
    body: "أوضح مؤشر مكاني: بؤرتان مستقلتان تفصلهما 19.52 كم وفجوة غير محترقة، وندبتان منفصلتان في صور الانعكاسية. تفصيلها في المحطة 03.",
  },
  {
    title: "بؤرة الجمعة بني حبيبي",
    body: "أدنى ارتفاع بين كل البؤر (نحو 55 م)، و22 م فقط من طريق ثانوي، وأعلى «درجة مدخنة» في المجموعة. موقعها هذا يطرح تساؤلات قوية حول طبيعة التدخل البشري ومصدر الإشعال المباشر.",
  },
  {
    title: "قياس التوقيت من القمر الثابت",
    body: "تاكسنة وترعي باينان اشتعلتا بفارق 11 إلى 30 دقيقة تحت سماء صافية، والطريق بينهما يستغرق 49 دقيقة. الاستحالة الفيزيائية لانتقال النار بينهما تؤكد تعدد مصادر الإشعال المستقلة، مما يفتح الباب لتساؤلات حول التزامن. تفصيلها في المحطة 04.",
  },
  {
    title: "إشارات التوقيت",
    body: "أربع بؤر أول رصدها ليلاً، ووصف الوزير «الاندلاع المتزامن»، و705 مواقع أعادت الاشتعال وطنياً. هذه المؤشرات تضع الحدث خارج الإطار المعتاد وتستدعي تدقيقاً أمنياً أعمق لثمانٍ من الاثنتي عشرة بؤرة.",
  },
];

const counterSignals = [
  "الاشتعالات تتبّع حقل طقس الحرائق تتبّعاً قوياً جداً (p = 1×10⁻²³). الفاعل المتعمّد الذي يستغلّ ذروة الطقس لتحقيق أقصى اتساع ينتج النتيجة نفسها، مما يعقّد الفصل الإحصائي.",
  "تعدّد البؤر حاضر في الخلفية الوطنية صيفاً (199 بؤرة مستقلة عبر الشمال الجزائري)، مما يستوجب أدلة ميدانية إضافية لتمييز التنسيق المتعمد عن النمط العام.",
  "البيانات الفضائية المفتوحة لم ترصد بصمة تكتيكية غير اعتيادية في التموضع؛ إذ تتوافق المؤشرات المقاسة مع طبيعة التضاريس المحلية الجبلية.",
  "معظم البؤر تقع بالقرب من مسالك منخفضة الانكشاف (10 من أصل 12)، وهو عامل قد يسهل التخفي، وإن كان مألوفاً جغرافياً في تلك النقاط.",
  "توزيع بؤر تاكسنة قرب الطرق لا يظهر نمطاً هندسياً تسلسلياً صريحاً يسهل رصده أو إثباته بالبيانات المفتوحة وحدها.",
  "الاعتماد على الرصد الفضائي يحد من إمكانية توفير الأدلة المادية الإيجابية المباشرة (كأدوات الإشعال الموقوتة)، مما يحيل إثبات التنسيق بالضرورة إلى التحقيقات الميدانية.",
];

const explanations = [
  {
    label: "حريق واحد انتشر",
    reading:
      "المسافات والأراضي غير المحترقة والندبات المنفصلة في Sentinel-2 لا تشبه مساراً واحداً متصلاً.",
    verdict: "غير مرجّح · ثقة عالية",
  },
  {
    label: "سبب طبيعي",
    reading:
      "لا برق دون 81 كم من البؤر الرئيسية، ولا هطول، ولا آلية طبيعية أخرى معقولة في هذا السياق.",
    verdict: "غير مرجّح · ثقة متوسطة إلى عالية",
  },
  {
    label: "أفعال بشرية متفرقة",
    reading:
      "يتّسق معها التعدد العام في الظروف الصيفية المعتادة عبر البلاد، لكنها لا تقدم تفسيراً شاملاً للتزامنات المكانية الدقيقة المرصودة.",
    verdict: "محتملة · ثقة متوسطة",
  },
  {
    label: "فعل منظّم ومتعمّد",
    reading:
      "لا تتوفر أدلة مادية قاطعة في البيانات المفتوحة حصراً، لكن التزامن المكاني والزمني، وتعدد البؤر المستقلة في ذروة الطقس، يُبقي هذه الفرضية مطروحة بقوة للتحقيق.",
    verdict: "فرضية مفتوحة بقوة للتحقيق",
  },
];

/* ثقة كل محطة كما تُعلنها في سندها؛ مصدر واحد للوحة الغلاف ولأسفل المحطة */
const stationBasis: Record<string, { level: number; confidence: string } | undefined> = {
  "first-signal": { level: 3, confidence: "عالية في الرصد" },
  "multiple-origins": { level: 3, confidence: "عالية" },
  "chekfa-texenna": { level: 3, confidence: "عالية في الاستقلال المكاني" },
  geostationary: { level: 3, confidence: "عالية" },
  lightning: { level: 3, confidence: "متوسطة إلى عالية" },
  weather: { level: 3, confidence: "عالية" },
  human: {
    level: 2,
    confidence: "عالية في الترجيح البشري · استكمال الفرضيات يتطلب تحقيقاً ميدانياً",
  },
  "suspicion-register": {
    level: 2,
    confidence: "متفاوتة بحسب المؤشر · تفصيلها في الفصل 31",
  },
};

function StationBoard() {
  return (
    <NightPanel label="مسار الاستدلال" meta={`${stations.length} محطات`}>
      <ol className="flex flex-1 flex-col">
        {stations.map((station) => {
          const basis = stationBasis[station.id];
          const tone = basis ? confidenceTone(basis.level) : null;
          return (
            <li key={station.id} className="border-b border-border last:border-b-0">
              <a
                href={`#${station.id}`}
                className="group grid grid-cols-[2rem_minmax(0,1fr)_5.5rem] items-center gap-x-3 px-5 py-2.5 transition-colors hover:bg-card"
              >
                <span className="numeric text-[11px] text-muted-foreground">{station.index}</span>
                <span className="truncate text-[14px] font-medium group-hover:text-signal">
                  {station.label}
                </span>
                <span className="flex gap-[3px]" dir="ltr" title={basis?.confidence}>
                  {Array.from({ length: 4 }, (_, index) => (
                    <span
                      key={index}
                      aria-hidden="true"
                      className={cn(
                        "h-1.5 flex-1",
                        basis && tone && index < basis.level ? tone.fill : "bg-border",
                      )}
                    />
                  ))}
                  <span className="sr-only">{basis ? `الثقة: ${basis.confidence}` : ""}</span>
                </span>
              </a>
            </li>
          );
        })}
      </ol>
      <p className="border-t border-border px-5 py-3 text-[11px] leading-5 text-muted-foreground">
        الشرائح الأربع درجة الثقة المعلنة في سند كل محطة.
      </p>
    </NightPanel>
  );
}

/* أول بؤرة داخل جيجل: ما قاسه القمر الثابت ثم أول مرور قطبي، من الملفات المنشورة */
const firstInJijel = ignitionWindows.origins.find((origin) => origin.origin_id === "O03");

function clock(local: string | null | undefined) {
  return local ? local.slice(11, 16) : "—";
}

function Proposition({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-6 max-w-3xl text-[clamp(1.25rem,2.1vw,1.625rem)] font-medium leading-[1.8]">
      {children}
    </p>
  );
}

export default async function InvestigationPage() {
  const origins = await readCsvRows<FrameOrigin>("independent_origins.csv");
  const firstPolar = origins.find((origin) => origin.origin_id === "O03");

  return (
    <article className="publication mx-auto max-w-7xl px-4 pb-16 pt-6 sm:px-6 lg:px-8">
      <Masthead
        current="التحقيق"
        file="02"
        kicker="بناء الأدلة"
        title="كيف عرفنا أن السبب ليس طبيعياً؟"
        lede="نبدأ بأول إشارة رآها القمر، ثم نختبر تعدّد البدايات والبرق والطقس. تقود الأدلة إلى أن السبب الطبيعي غير مرجّح، وأن الفعل البشري أرجح. أما نوع هذا الفعل فيبقى سؤالاً مفتوحاً."
        meta={fileMeta}
        panel={<StationBoard />}
      />

      <Dossier index={stations} indexHeading="المحطات" indexLabel="محطات التحقيق">
        {/* ── 01 ── */}
        <Reveal>
          <section id="first-signal">
            <SectionLabel index="01">أول إشارة</SectionLabel>
            <Proposition>
              رأى القمر أول نقطة ساخنة داخل جيجل يوم 24 أوت عند 14:53، في الجمعة
              بني حبيبي.
            </Proposition>

            <ol className="mt-8 grid max-w-3xl grid-cols-3 border-t border-rule">
              {[
                { time: clock(firstInJijel?.last_clear_local), label: "آخر صورة بلا نار", sensor: "MSG", tone: "border border-foreground" },
                { time: clock(firstInJijel?.first_detection_local), label: "أول صورة للنار", sensor: "MSG", tone: "bg-orbit" },
                { time: clock(firstPolar?.first_local), label: "أول رصد قطبي", sensor: "VIIRS", tone: "bg-signal" },
              ].map((step) => (
                <li key={step.label} className="border-s border-border ps-4 pt-4 first:border-s-0 first:ps-0 sm:ps-6">
                  <span className="flex items-center gap-2">
                    <span aria-hidden="true" className={`size-2 shrink-0 ${step.tone}`} />
                    <span className="ltr-embed text-[10.5px] text-muted-foreground">{step.sensor}</span>
                  </span>
                  <span className="figure-num mt-3 block text-[clamp(1.75rem,3.5vw,2.75rem)] font-light leading-none">
                    {step.time}
                  </span>
                  <span className="mt-2 block text-[12.5px] leading-6 text-muted-foreground">
                    {step.label}
                  </span>
                </li>
              ))}
            </ol>

            <div className="mt-8 flex max-w-2xl flex-col gap-4 text-[16px] leading-8">
              <p>
                سجّلها مستشعر{" "}
                <span className="ltr-embed text-foreground">VIIRS</span> على القمر{" "}
                <span className="ltr-embed text-foreground">Suomi-NPP</span> عند{" "}
                <span className="ltr-embed text-foreground">
                  36.78738°N, 6.11795°E
                </span>{" "}
                بثقة رصد مرتفعة. أما أول إشارة في المنطقة الأوسع فظهرت قبلها بيوم
                في ولايتَي سطيف وبجاية، خارج جيجل.
              </p>
              <p>
                والقمر الثابت رأى ناراً في البكسل نفسه قبل ذلك بثلاث عشرة دقيقة،
                عند 14:40، بعد أن كان الموقع صافياً بلا نار عند 14:25. فالنافذة
                التي وقع فيها الاشتعال هنا ربع ساعة لا أكثر — وهي أدقّ ما نعرفه
                عن بداية أي حريق في هذا الملف. تفصيلها في المحطة 04.
              </p>
            </div>
            <Alert className="mt-8 max-w-2xl">
              <AlertTitle>هذه ليست نقطة الاشتعال المؤكدة</AlertTitle>
              <AlertDescription>
                إنها أول مرة رأى فيها القمر حرارة الحريق. الدقة نحو 375 م،
                والاشتعال يسبق الرصد بفترة تحدّها فجوة المرور بين تمريرتين.
              </AlertDescription>
            </Alert>
            <ClaimBasis
              className="max-w-3xl"
              level={3}
              confidence="عالية في الرصد"
              sources="DS-01 · DS-02 · ME-01 · ME-04"
            />
          </section>
        </Reveal>

        {/* ── 02 ── */}
        <Reveal className="mt-24">
          <section id="multiple-origins">
            <SectionLabel index="02">تعدّد البدايات</SectionLabel>
            <Proposition>
              البيانات لا تشبه حريقاً واحداً تحرّك من نقطة إلى أخرى. وجدنا 12
              بداية محتملة، 6 منها داخل جيجل.
            </Proposition>
            <div className="mt-6 flex max-w-2xl flex-col gap-4 text-[16px] leading-8">
              <p>
                لم نعدّ النقاط المتباعدة فقط. يجب أن يكون كل موقع بعيداً 5 كم على
                الأقل عن أي حريق سبق رصده، وأن تفصله عن المسار السابق أرض غير
                محترقة لمسافة 4 كم على الأقل، أي الشرطان معاً.
              </p>
              <p>
                وصلت صور{" "}
                <span className="ltr-embed text-foreground">Sentinel-2</span> إلى
                النتيجة نفسها بطريقة مختلفة: 17 ندبة حريق كبيرة، أكبرها ثلاث ندبات
                يفصل بينها غطاء نباتي سليم. ثم جاء بلاغ الحماية المدنية ليسمّي
                حرائق منفصلة في خمس من البلديات الست نفسها.
              </p>
            </div>
            <OriginFrame className="mt-10" image={postScene} origins={origins} />
            <DataFigure
              className="mt-14"
              sensor="Sentinel-2 · MSI L2A"
              meta="dNBR · 18 → 28.08.2026"
              caption="خريطة شدة الاحتراق. الألوان تمثّل شدة الحريق، لا حدوداً إدارية."
            >
              <Image
                src={severity.path}
                alt="خريطة شدة الاحتراق في جيجل محسوبة من صور Sentinel-2، تُظهر ندبات حريق منفصلة"
                width={severity.width}
                height={severity.height}
                sizes="(min-width: 1024px) 60rem, 100vw"
                loading="eager"
                className="h-auto w-full bg-white"
              />
            </DataFigure>
            <ClaimBasis
              className="max-w-3xl"
              level={3}
              confidence="عالية"
              sources="الفصل 8 · OF-06 · OF-03"
              sourcesHref="/report"
            />
          </section>
        </Reveal>

        {/* ── 03 ── */}
        <Reveal className="mt-24">
          <section id="chekfa-texenna">
            <SectionLabel index="03">الشقفة وتاكسنة: أقوى مؤشر</SectionLabel>
            <Proposition>
              تاكسنة لم يصلها الحريق من الشقفة. إنها بداية مستقلة، وهذا أوضح ما
              استوقف التحقيق كله.
            </Proposition>
            <StatStrip
              className="mt-8"
              items={[
                { value: "19.52 كم", unit: "بين البؤرتين" },
                { value: "132°", unit: "بين المسار واتجاه الريح" },
                { value: "22.78 كم", unit: "فجوة غير محترقة" },
                { value: "2.48 كم/س", unit: "أقصى سرعة تقدّم جبهة" },
              ]}
            />
            <div className="mt-8 flex max-w-2xl flex-col gap-4 text-[16px] leading-8">
              <p>
                تفصل بين البؤرتين 19.52 كم و24 ساعة. والسمت بينهما 262°، بينما
                كانت الريح تدفع بين 33° و35° بسرعة 29 كم/س وهبّات 68 كم/س، أي أن
                النار كان عليها أن تسير عكس الريح. وبينهما فجوة غير محترقة طولها
                22.78 كم.
              </p>
              <p>
                والأقوى من نموذج الرياح أن صور{" "}
                <span className="ltr-embed text-foreground">Sentinel-2</span>{" "}
                تُظهر ندبتين منفصلتين: B00 بمساحة 400 كم² و B01 بمساحة 122 كم²،
                يفصل بينهما غطاء نباتي سليم. أقصى سرعة تقدّم جبهة قِيست في هذا
                الحدث 2.48 كم/س، ولا أثر حرارياً متّصلاً بين الحريقين.
              </p>
              <p>
                هذا يؤكد استقلال الحريقين مكانياً. هذه المعطيات تثبت قطعاً تعدد
                نقاط الاشتعال المستقلة في أوقات حاسمة.
              </p>
            </div>
            <DataFigure
              className="mt-10"
              sensor="O05 → O08"
              meta="25-26.08.2026 · 24 h"
              caption="الاتجاه غرباً مع رياح تعاكس مسار النار نحو الشمال الشرقي. الفجوة الخضراء والندبتان المنفصلتان تثبتان فيزيائياً تعدد الإشعال واستحالة زحف نار الشقفة إلى تاكسنة بشكل طبيعي."
            >
              <ChekfaTexennaDiagram />
            </DataFigure>
            <ClaimBasis
              className="max-w-3xl"
              level={3}
              confidence="عالية في الاستقلال المكاني"
              sources="DS-05 · DS-08 · الفصل 31"
              sourcesHref="/report"
            />
          </section>
        </Reveal>

        {/* ── 04 ── */}
        <Reveal className="mt-24">
          <section id="geostationary">
            <SectionLabel index="04">متى بالضبط؟</SectionLabel>
            <Proposition>
              قمر يصوّر المنطقة كل 15 دقيقة قلّص الجهل بلحظة البداية من أيام إلى
              ربع ساعة — فظهر أن حريقين اشتعلا في وقت لا يكفي للانتقال بينهما.
            </Proposition>
            <div className="mt-6 flex max-w-2xl flex-col gap-4 text-[16px] leading-8">
              <p>
                الأقمار القطبية تمرّ مرّتين إلى أربع في اليوم، فأقصى ما تعطيه هو
                «اشتعل في مكان ما داخل هذه الساعات». أما{" "}
                <span className="ltr-embed text-foreground">Meteosat-10</span>{" "}
                فيصوّر الإقليم كل ربع ساعة دون انقطاع، فصارت بداية{" "}
                <span className="numeric">{measuredOrigins}</span> بؤر من أصل{" "}
                <span className="numeric">12</span> معروفة بدقّة دورة رصد واحدة.
                البؤر الأربع الباقية أضعف من حدّ الكشف، ونوافذها لم تتغيّر.
              </p>
              <p>
                يوم 26 أوت رأى القمر موقع تاكسنة صافياً بلا نار خمس ساعات متصلة،
                ثم رأى فيه ناراً بقوة 294 ميغاواط. وبعد{" "}
                <span className="numeric">11</span> إلى{" "}
                <span className="numeric">30</span> دقيقة اشتعل موقع ثانٍ في ترعي
                باينان. الطريق بينهما{" "}
                <span className="numeric">{forensicSummary.msg.road_km}</span> كم
                ويستغرق{" "}
                <span className="numeric">
                  {forensicSummary.msg.transit_minutes}
                </span>{" "}
                دقيقة على أفضل تقدير — أي أن مصدراً واحداً لا يكفي فيزيائياً لتفسير المشهد.
              </p>
              <p>
                والحجّة لا تقوم على الوقت وحده: الموقعان يقعان في ندبتين منفصلتين
                في صور{" "}
                <span className="ltr-embed text-foreground">Sentinel-2</span>،
                بينهما غطاء نباتي سليم لم يحترق، ولم تشهد أيّ منهما ناراً قبل تلك
                اللحظة. فالانتشار مستبعد بمعيار مستقل تماماً عن حساب الرياح.
              </p>
            </div>

            <div className="mt-10 max-w-3xl">
              <Table className="min-w-[36rem] text-sm">
                <TableHeader>
                  <TableRow>
                    <TableHead>الزوج</TableHead>
                    <TableHead>الفارق</TableHead>
                    <TableHead>المسافة</TableHead>
                    <TableHead>هندسة الريح</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {resolvedPairs.map((pair) => (
                    <TableRow key={`${pair.a_id}-${pair.b_id}`}>
                      <TableCell className="whitespace-normal">
                        <span className="ltr-embed font-medium">
                          {pair.a_id} → {pair.b_id}
                        </span>
                        <span className="mt-0.5 block text-[11px] text-muted-foreground">
                          {pair.a_locality} ← {pair.b_locality}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="figure-num text-[20px] font-light">{pair.gap_min}</span> د
                      </TableCell>
                      <TableCell>
                        <span className="figure-num text-[20px] font-light">{pair.separation_km}</span> كم
                      </TableCell>
                      <TableCell className="whitespace-normal">
                        {windGeometry[pair.geometry] ?? pair.geometry}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <p className="mt-3 max-w-3xl text-[12px] leading-6 text-muted-foreground">
              الزوجان الوحيدان اللذان قِيس توقيت طرفيهما معاً. أربعة أزواج أخرى
              يقوم أحد طرفيها على نافذة عمياء تمتدّ ساعات أو أياماً، فالفارق
              المذكور فيها ليس قياساً. وأحدها — بابور ودرقينة — تفصله 9.6 كم
              فقط ويقع أسفل الريح، فقد يكون امتداداً بالجمرات ولا يصلح دليلاً.
            </p>

            <Alert className="mt-8 max-w-2xl">
              <AlertTitle>تعدد مؤكد لنقاط الإشعال</AlertTitle>
              <AlertDescription>
                تأكيد وجود مصدرين مستقلين في وقت متقارب يعزز الحاجة للتدقيق الجنائي، إذ لا يمكن علمياً تفسير الحدث بانتقال النيران من بؤرة لأخرى، مما يثبت أن النار أُضرمت بشكل منفصل في المكانين.
              </AlertDescription>
            </Alert>

            <ClaimBasis
              className="max-w-3xl"
              level={3}
              confidence="عالية"
              sources="DS-05b · الفصل 15.6 · الفصل 15.7"
              sourcesHref="/report"
            />
          </section>
        </Reveal>

        {/* ── 05 ── */}
        <Reveal className="mt-24">
          <section id="lightning">
            <SectionLabel index="05">البرق مستبعد</SectionLabel>
            <Proposition>
              لم يُرصد أي نشاط رعدي قريب من البؤر الرئيسية، ولا أي هطول، خلال
              الفترة الحرجة.
            </Proposition>
            <StatStrip
              className="mt-8 sm:grid-cols-3"
              items={[
                { value: ">81 كم", unit: "أقرب نشاط رعدي من البؤر الرئيسية" },
                { value: "21.08", unit: "آخر رعد سجّلته محطة جيجل" },
                { value: "≈0", unit: "مجموع الهطول المقاس والمنمذج" },
              ]}
            />
            <div className="mt-8 flex max-w-2xl flex-col gap-4 text-[16px] leading-8">
              <p>
                آخر رعد سجّلته محطة جيجل كان يوم 21 أوت، قبل أقدم بؤرة بالولاية
                بأكثر من ثلاثة أيام. ولم يظهر نشاط رعدي على مسافة أقل من 81 كم من
                البؤر الرئيسية، وكان مجموع الهطول المقاس والمنمذج صفراً تقريباً.
              </p>
              <p>
                تحفّظان صريحان: تعذّر الوصول إلى أي شبكة لتحديد مواقع الصواعق،
                فالاستدلال غير مباشر؛ وسُجّل رعد في بجاية على بعد 34 كم من بؤرها
                الليلية يومي 23-24 أوت، فلا يُستبعد البرق تماماً لتلك البؤر
                الغربية وإن بقي مستبعداً بشدة في جيجل.
              </p>
            </div>
            <ClaimBasis
              className="max-w-3xl"
              level={3}
              confidence="متوسطة إلى عالية"
              sources="DS-07 · DS-08 · الفصل 13"
              sourcesHref="/report"
            />
          </section>
        </Reveal>

        {/* ── 06 ── */}
        <Reveal className="mt-24">
          <section id="weather">
            <SectionLabel index="06">الطقس يشرح الاتساع لا البداية</SectionLabel>
            <Proposition>
              مساء 26 أوت اجتمعت حرارة شديدة وهواء جاف ورياح قوية. في الوقت نفسه
              قفز النشاط الحراري.
            </Proposition>
            <StatStrip
              className="mt-8 sm:grid-cols-3"
              items={[
                { value: "43-45°م", unit: "حرارة متوقعة في الداخل" },
                { value: "8-12٪", unit: "رطوبة متوقعة في الداخل" },
                { value: "68 كم/س", unit: "أقوى هبّات مرصودة" },
              ]}
            />
            <div className="mt-8 flex max-w-2xl flex-col gap-4 text-[16px] leading-8">
              <p>
                بلغ مجموع قوة الإشعاع الحراري 60,792 ميغاواط في تمريرة واحدة يوم
                26 أوت، وهي أعلى قيمة في الحدث كله، متزامناً مع ذروة موجة السيروكو.
                هذا يفسر سرعة الانتشار وشراسة الحرائق المفتعلة في هذا التوقيت، ولكنه لا يفسر كيف بدأت الشرارة الأولى.
                قد تكون هذه الظروف المناخية مختارة بعناية إن كانت فرضية الحرائق المفتعلة صحيحة. وهذا ما ستثبته أو تنفيه التحقيقات الرسميّة المفتوحة في هذا الشأن.
              </p>
            </div>
            <ClaimBasis
              className="max-w-3xl"
              level={3}
              confidence="عالية"
              sources="DS-07 · DS-08"
              sourcesHref="/report"
            />
          </section>
        </Reveal>

        {/* ── 07 ── */}
        <Reveal className="mt-24">
          <section id="human">
            <SectionLabel index="07">إذاً: الفعل البشري</SectionLabel>
            <Proposition>
              بعد استبعاد احتمالية البرق وتضافر الظروف، يصبح التدخل البشري التفسير الرئيسي والحتمي لاشتعال هذه البؤر المنفصلة.
            </Proposition>
            <div className="mt-6 max-w-2xl space-y-4 text-[16px] leading-8">
              <p>
                البؤر تقع في كتلة جبلية تشهد نشاطاً ريفياً واسعاً. وفي حين تسجل الخلفية الوطنية الدائمة اشتعالات متفرقة صيفاً، فإن الخصائص الزمانية والمكانية المرصودة هنا تستدعي وقفة أعمق.
              </p>
              <p>
                تؤكد صور الأقمار الاصطناعية البصمة الحرارية للتدخل البشري، لكنها تترك تحديد القصد الدقيق للتحقيق الميداني. اختبار التزامن يكشف عن تقارب زمني ومكاني ملفت، مما يشير إلى أن محدودية الرصد الفضائي المفتوح في تتبع أداة الإشعال لا تلغي ضرورة التحقيق المعمق في احتمالية التنسيق.
              </p>
            </div>

            <div className="mt-10 max-w-4xl">
              <Table className="min-w-[34rem]">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-40 whitespace-normal align-top">
                      التفسير
                    </TableHead>
                    <TableHead className="whitespace-normal align-top">
                      ماذا تقول البيانات؟
                    </TableHead>
                    <TableHead className="w-44 whitespace-normal align-top">
                      النتيجة
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {explanations.map((row, index) => (
                    <TableRow key={row.label}>
                      <TableCell className="whitespace-normal py-5 align-top text-[15px] font-semibold">
                        {row.label}
                      </TableCell>
                      <TableCell className="whitespace-normal py-5 align-top leading-7">
                        {row.reading}
                      </TableCell>
                      <TableCell className="whitespace-normal py-5 align-top">
                        <span className="flex items-start gap-2 text-[13px] font-medium leading-6">
                          <span
                            aria-hidden="true"
                            className={
                              index < 2
                                ? "mt-2 size-1.5 shrink-0 border border-foreground"
                                : "mt-2 size-1.5 shrink-0 bg-signal"
                            }
                          />
                          {row.verdict}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <h3 className="mt-14 max-w-2xl text-xl font-semibold leading-9">
              طبيعة الفعل البشري: ضرورة التحقيق الأمني
            </h3>
            <p className="mt-3 max-w-2xl text-[16px] leading-8">
              رجّحت مصفوفة الفرضيات بناءً على المؤشرات المتاحة أرجحية التدخل البشري. نعرض هنا الترتيب الناتج عن التحليل المعالج بالبيانات المفتوحة، مع الإشارة إلى أن تقارب النسب يعكس الحاجة الماسة لاستكمال الصورة بالمعطيات الأمنية لتأكيد القصد العمدي.
            </p>
            <HypothesisMatrix
              className="mt-8 max-w-3xl"
              rows={forensicSummary.hypotheses.single_cause}
              caption="الأدلة المفتوحة تضع الفعل البشري كمرجح أساسي، ولكن تقارب النسب الداخلية (بعد التلطيف) يؤكد ضرورة إجراء تقاطعات استخباراتية وميدانية لحسم طبيعة التنسيق."
            />

            <ClaimBasis
              className="max-w-3xl"
              level={2}
              confidence="عالية في الترجيح البشري · استكمال الفرضيات يتطلب تحقيقاً ميدانياً"
              sources="الفصل 14 · الفصل 26 · الفصل 32"
              sourcesHref="/report"
            />
          </section>
        </Reveal>

        {/* ── 08 ── */}
        <Reveal className="mt-24">
          <section id="suspicion-register">
            <SectionLabel index="08">سجلّ الاشتباه</SectionLabel>
            <Proposition>
              ما يشدّ نحو فعل غير عرضي، والقيود التي تفرضها البيانات عند دراسة الاتجاهات.
            </Proposition>
            <ol className="mt-8 grid max-w-4xl border-t border-rule md:grid-cols-2 md:gap-x-10">
              {suspicionSignals.map((item, index) => (
                <li
                  key={item.title}
                  className="grid grid-cols-[2.5rem_minmax(0,1fr)] gap-x-3 border-b border-border py-6"
                >
                  <span className="numeric pt-1 text-[12px] text-signal-ink">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3 className="text-[16px] font-semibold leading-7">{item.title}</h3>
                    <p className="mt-2 text-[14.5px] leading-8">{item.body}</p>
                  </div>
                </li>
              ))}
            </ol>
            <EdgePanel
              className="mt-10 max-w-3xl"
              tone="warn"
              label="حدود الإحصاء المكاني المفتوح"
            >
              <ul className="flex list-disc flex-col gap-2.5 pe-5 leading-8 marker:text-muted-foreground">
                {counterSignals.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
              <p className="mt-5 border-t border-border pt-4 text-sm leading-7">
                ثقل هذه المحددات يوضح أمراً جوهرياً: عدم قدرة البيانات الفضائية المفتوحة على إثبات التنسيق رياضياً لا يعني نفيه، بل يثبت أن تقييم احتمالية الفعل المتعمّد يتطلب حتمياً تجاوز الأقمار إلى التحقيق الجنائي والأمني.
              </p>
            </EdgePanel>
            <ClaimBasis
              className="max-w-3xl"
              level={2}
              confidence="متفاوتة بحسب المؤشر · تفصيلها في الفصل 31"
              sources="الفصل 31 · الفصل 25"
              sourcesHref="/report"
            />
          </section>
        </Reveal>

        {/* ── 09 ── */}
        <Reveal className="mt-24">
          <section id="limits">
            <SectionLabel index="09">ما لا نعرفه، والحدّ</SectionLabel>
            <EdgePanel className="mt-8 max-w-3xl" label="حدود ما تقوله البيانات">
              <p className="text-lg font-medium leading-9">
                تؤكد البيانات بوضوح الارتباط بنشاط بشري، وتكشف عن سلوكيات مكانية وزمانية تستوجب التحقيق. لكن الجزم بالتوصيف القانوني والجنائي يتجاوز قدرة الرصد الفضائي وحيداً.
              </p>
              <ul className="mt-5 flex list-disc flex-col gap-2.5 pe-5 leading-8 marker:text-signal">
                <li>الآلية المباشرة لاشتعال أي بؤرة والأداة المستخدمة.</li>
                <li>
                  نقطة الاشتعال الفعلية الدقيقة وزمنها المطلق؛ النوافذ العمياء بين 11 و73 ساعة للبؤر الليلية تترك حيزاً للتلاعب.
                </li>
                <li>
                  الحسم الاستخباراتي لمدى تنسيق هذه الاشتعالات، وهو بُعد يتطلب وصولاً إلى معطيات اتصالية أو شهادات ميدانية لتعزيز الملاحظات الفضائية.
                </li>
              </ul>
            </EdgePanel>
            <p className="mt-6 max-w-2xl text-[16px] leading-8">
              هذه الحدود تمثل عجزاً تقنياً في أدوات الرصد المتاحة، لا تبرئة لأي فاعل. ما يحسم المسألة هو الفحص الميداني لمناطق المنشأ والتحقيقات الأمنية الموازية، وهو ما باشرته مصالح الدرك الوطني فعلياً يوم 29 أوت.
            </p>
            <div className="mt-10 flex max-w-3xl flex-wrap items-center gap-x-8 gap-y-3 border-t border-rule pt-5 text-sm">
              <Link
                href="/report"
                className="inline-flex items-center gap-2 font-medium underline decoration-border underline-offset-8 hover:decoration-foreground"
              >
                اقرأ التقرير الكامل ←
              </Link>
              <Link
                href="/methodology"
                className="inline-flex items-center gap-2 text-muted-foreground underline decoration-border underline-offset-8 hover:text-foreground hover:decoration-foreground"
              >
                راجع طريقة العمل
                <ArrowLeftIcon aria-hidden="true" className="size-3.5" />
              </Link>
            </div>
          </section>
        </Reveal>
      </Dossier>
    </article>
  );
}
