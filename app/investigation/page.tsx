import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import {
  ClaimBasis,
  DataFigure,
  EdgePanel,
  FileMeta,
  SectionLabel,
  StatStrip,
} from "@/components/editorial";
import { Reveal } from "@/components/motion";
import { StoryBreadcrumb } from "@/components/story-breadcrumb";
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
import forensicSummary from "@/public/generated/data/forensic-summary.json";
import ignitionWindows from "@/public/generated/data/msg-ignition-windows.json";
import simultaneousPairs from "@/public/generated/data/msg-simultaneous-pairs.json";

export const metadata: Metadata = {
  title: "كيف عرفنا أن السبب ليس طبيعياً؟",
  description:
    "الأدلة خطوة بخطوة: أول إشارة رآها القمر، تعدّد البدايات، استبعاد البرق، دور الطقس، سجلّ الاشتباه، ثم ما يبقى مفتوحاً وحدوده.",
};

const severity = figure("s2-dnbr-severity");

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
    body: "أدنى ارتفاع بين كل البؤر (نحو 55 م)، و22 م فقط من طريق ثانوي، وأعلى «درجة مدخنة» في المجموعة. لكن وجود بؤرة واحدة عند هذا المستوى بين اثنتي عشرة هو ما تنتجه الصدفة، والقرب من الطريق يتوافق مع سبب عرضي بقدر التعمّد.",
  },
  {
    title: "قياس التوقيت من القمر الثابت",
    body: "تاكسنة وترعي باينان اشتعلتا بفارق 11 إلى 30 دقيقة تحت سماء صافية، والطريق بينهما يستغرق 49 دقيقة. مصدر واحد لا يكفي — لكن مصدرين لا يعنيان فاعلين ولا تنسيقاً. تفصيلها في المحطة 04.",
  },
  {
    title: "إشارات التوقيت",
    body: "أربع بؤر أول رصدها ليلاً، ووصف الوزير «الاندلاع المتزامن»، و705 مواقع أعادت الاشتعال وطنياً. لافتة، لكن كلاً منها يحتمل تفسيراً عادياً — وثمانٍ من اثنتي عشرة بؤرة رُصدت أول مرة داخل نافذة الطيران النهاري لا خارجها.",
  },
];

const counterSignals = [
  "الاشتعالات تتبّع حقل طقس الحرائق تتبّعاً قوياً جداً (p = 1×10⁻²³)؛ احتمال المصادفة ضئيل. لكن الفاعل الذي يستغلّ ذروة الطقس ينتج النتيجة نفسها.",
  "تعدّد البؤر هو الخلفية الوطنية الدائمة صيفاً: 199 بؤرة مستقلة عبر الشمال الجزائري، من 7 إلى 58 يومياً، وترتبط أعدادها اليومية بشدّة الطقس (r = 0.778).",
  "لا بصمة اختيار تكتيكي: خمسة مؤشرات للتموضع قيست في مقابل نموذجين مرجعيين، ولا واحد منها يفارق العشوائية (درجة المدخنة: p = 0.94).",
  "لا انتقاء لمسالك التخفّي: 10 بؤر من 12 أقرب طريق إليها منخفض الانكشاف، لكن احتمال ذلك في نقطة عشوائية بهذه التضاريس 0.891 أصلاً.",
  "لا بصمة «خط إضرام متسلسل»: ارتباط دفعة تاكسنة بالطرق مطابق للعشوائية (58٪ ضمن 250 م مقابل 55.6٪).",
  "لا دليل إيجابي واحد على التنسيق: لا أثر مادي ولا شهادة ولا جهاز إشعال ولا توقيف يخصّ 24-29 أوت.",
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
    label: "أفعال بشرية مستقلة",
    reading:
      "يتّسق معها تعدّد البؤر في جيجل، وظهور حرائق في ولايات مجاورة خلال الطقس نفسه، وكون التعدّد الخلفية الوطنية الدائمة صيفاً.",
    verdict: "الأرجح · ثقة متوسطة",
  },
  {
    label: "فعل منظّم ومتعمّد",
    reading:
      "لا دليل إيجابي واحد عليه. لكن اختبار التزامن بلا قوة، فلا يصلح لنفيه أيضاً.",
    verdict: "فرضية مفتوحة · 11٪-26٪",
  },
];

export default function InvestigationPage() {
  return (
    <article className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <StoryBreadcrumb current="التحقيق" />

      <div className="mt-10 grid gap-x-8 gap-y-10 lg:grid-cols-[190px_minmax(0,45rem)] lg:justify-center lg:gap-x-16">
        <aside className="order-2 border-t pt-6 lg:sticky lg:top-16 lg:order-1 lg:self-start lg:border-t-0 lg:border-e lg:pe-8 lg:pt-0">
          <FileMeta heading="بيانات الملف" rows={fileMeta} />
          <nav
            aria-label="محطات التحقيق"
            className="mt-8 hidden border-t pt-5 lg:block"
          >
            <p className="mb-3 text-[11px] font-medium text-muted-foreground">
              المحطات
            </p>
            <ol className="flex flex-col gap-2">
              {stations.map((station) => (
                <li key={station.id}>
                  <a
                    href={`#${station.id}`}
                    className="flex gap-2.5 text-[11px] text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <span className="numeric">{station.index}</span>
                    <span>{station.label}</span>
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        </aside>

        <div className="order-1 min-w-0 lg:order-2">
          <p className="text-[11px] font-medium text-muted-foreground">
            بناء الأدلة
          </p>
          <h1 className="mt-4 max-w-3xl text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
            كيف عرفنا أن السبب ليس طبيعياً؟
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-9">
            نبدأ بأول إشارة رآها القمر، ثم نختبر تعدّد البدايات والبرق والطقس.
            تقود الأدلة إلى أن السبب الطبيعي غير مرجّح، وأن الفعل البشري أرجح.
            أما نوع هذا الفعل فيبقى سؤالاً مفتوحاً.
          </p>

          {/* ── 01 ── */}
          <Reveal>
          <section id="first-signal" className="mt-14 scroll-mt-20">
            <SectionLabel index="01">أول إشارة</SectionLabel>
            <p className="mt-4 max-w-2xl text-xl font-medium leading-9">
              رأى القمر أول نقطة ساخنة داخل جيجل يوم 24 أوت عند 14:53، في الجمعة
              بني حبيبي.
            </p>
            <div className="mt-5 flex max-w-2xl flex-col gap-4 leading-8">
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
            <Alert className="mt-6 max-w-2xl">
              <AlertTitle>هذه ليست نقطة الاشتعال المؤكدة</AlertTitle>
              <AlertDescription>
                إنها أول مرة رأى فيها القمر حرارة الحريق. الدقة نحو 375 م،
                والاشتعال يسبق الرصد بفترة تحدّها فجوة المرور بين تمريرتين.
              </AlertDescription>
            </Alert>
            <ClaimBasis
              className="max-w-2xl"
              level={3}
              confidence="عالية في الرصد"
              sources="DS-01 · DS-02 · ME-01 · ME-04"
            />
          </section>
          </Reveal>

          {/* ── 02 ── */}
          <Reveal>
          <section id="multiple-origins" className="mt-16 scroll-mt-20">
            <SectionLabel index="02">تعدّد البدايات</SectionLabel>
            <p className="mt-4 max-w-2xl text-xl font-medium leading-9">
              البيانات لا تشبه حريقاً واحداً تحرّك من نقطة إلى أخرى. وجدنا 12
              بداية محتملة، 6 منها داخل جيجل.
            </p>
            <div className="mt-5 flex max-w-2xl flex-col gap-4 leading-8">
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
            <DataFigure
              className="mt-6 max-w-2xl"
              sensor="Sentinel-2 · MSI L2A"
              meta="dNBR · 18 → 28.08.2026"
              caption="خريطة شدة الاحتراق. الألوان تمثّل شدة الحريق، لا حدوداً إدارية."
            >
              <Image
                src={severity.path}
                alt="خريطة شدة الاحتراق في جيجل محسوبة من صور Sentinel-2، تُظهر ندبات حريق منفصلة"
                width={severity.width}
                height={severity.height}
                loading="eager"
                className="h-auto w-full bg-white"
              />
            </DataFigure>
            <ClaimBasis
              className="max-w-2xl"
              level={3}
              confidence="عالية"
              sources="الفصل 8 · OF-06 · OF-03"
              sourcesHref="/report"
            />
          </section>
          </Reveal>

          {/* ── 03 ── */}
          <Reveal>
          <section id="chekfa-texenna" className="mt-16 scroll-mt-20">
            <SectionLabel index="03">الشقفة وتاكسنة: أقوى مؤشر</SectionLabel>
            <p className="mt-4 max-w-2xl text-xl font-medium leading-9">
              تاكسنة لم يصلها الحريق من الشقفة. إنها بداية مستقلة، وهذا أوضح ما
              استوقف التحقيق كله.
            </p>
            <div className="mt-5 flex max-w-2xl flex-col gap-4 leading-8">
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
                هذا يؤكد استقلال الحريقين مكانياً. لكنه لا يحدّد سبب اشتعال
                تاكسنة؛ الاستقلال المكاني ليس سبباً.
              </p>
            </div>
            <ClaimBasis
              className="max-w-2xl"
              level={3}
              confidence="عالية في الاستقلال المكاني"
              sources="DS-05 · DS-08 · الفصل 31"
              sourcesHref="/report"
            />
          </section>
          </Reveal>

          {/* ── 04 ── */}
          <Reveal>
          <section id="geostationary" className="mt-16 scroll-mt-20">
            <SectionLabel index="04">متى بالضبط؟</SectionLabel>
            <p className="mt-4 max-w-2xl text-xl font-medium leading-9">
              قمر يصوّر المنطقة كل 15 دقيقة قلّص الجهل بلحظة البداية من أيام إلى
              ربع ساعة — فظهر أن حريقين اشتعلا في وقت لا يكفي للانتقال بينهما.
            </p>
            <div className="mt-5 flex max-w-2xl flex-col gap-4 leading-8">
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
                دقيقة على أفضل تقدير — أي أن مصدراً واحداً لا يكفي.
              </p>
              <p>
                والحجّة لا تقوم على الوقت وحده: الموقعان يقعان في ندبتين منفصلتين
                في صور{" "}
                <span className="ltr-embed text-foreground">Sentinel-2</span>،
                بينهما غطاء نباتي سليم لم يحترق، ولم تشهد أيّ منهما ناراً قبل تلك
                اللحظة. فالانتشار مستبعد بمعيار مستقل تماماً عن حساب الرياح.
              </p>
            </div>

            <div className="mt-6 max-w-2xl border">
              <Table className="min-w-[36rem] text-sm">
                <TableHeader className="bg-muted/40">
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
                        <span className="numeric">{pair.gap_min}</span> د
                      </TableCell>
                      <TableCell>
                        <span className="numeric">{pair.separation_km}</span> كم
                      </TableCell>
                      <TableCell className="whitespace-normal">
                        {windGeometry[pair.geometry] ?? pair.geometry}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <p className="mt-3 max-w-2xl text-[11px] leading-5 text-muted-foreground">
              الزوجان الوحيدان اللذان قِيس توقيت طرفيهما معاً. أربعة أزواج أخرى
              يقوم أحد طرفيها على نافذة عمياء تمتدّ ساعات أو أياماً، فالفارق
              المذكور فيها ليس قياساً. وأحدها — بابور ودرقينة — تفصله 9.6 كم
              فقط ويقع أسفل الريح، فقد يكون امتداداً بالجمرات ولا يصلح دليلاً.
            </p>

            <Alert className="mt-6 max-w-2xl">
              <AlertTitle>مصدرا اشتعال، لا فاعلان</AlertTitle>
              <AlertDescription>
                «يلزم مصدران» تعني أن النار بدأت في موضعين، ولا تقول شيئاً عن
                كونهما مرتبطين أو متعمّدين أو منسّقين. حريقان مستقلان تماماً —
                عقب سيجارة هنا وشرارة آلة هناك — ينتجان القياس نفسه.
              </AlertDescription>
            </Alert>

            <ClaimBasis
              className="max-w-2xl"
              level={3}
              confidence="عالية"
              sources="DS-05b · الفصل 15.6 · الفصل 15.7"
              sourcesHref="/report"
            />
          </section>
          </Reveal>

          {/* ── 05 ── */}
          <Reveal>
          <section id="lightning" className="mt-16 scroll-mt-20">
            <SectionLabel index="05">البرق مستبعد</SectionLabel>
            <p className="mt-4 max-w-2xl text-xl font-medium leading-9">
              لم يُرصد أي نشاط رعدي قريب من البؤر الرئيسية، ولا أي هطول، خلال
              الفترة الحرجة.
            </p>
            <div className="mt-5 flex max-w-2xl flex-col gap-4 leading-8">
              <p>
                آخر رعد سجّلته محطة جيجل كان يوم 21 أوت، قبل أقدم بؤرة بالولاية
                بأكثر من ثلاثة أيام. ولم يظهر نشاط رعدي على مسافة أقل من 81 كم من
                البؤر الرئيسية، وكان مجموع الهطول المقاس والمنمذج صفراً تقريباً.
              </p>
              <p>
                تحفّظان صريحان: تعذّر الوصول إلى أي شبكة لتحديد مواقع الصواعق،
                فالاستدلال غير مباشر؛ وسُجّل رعد في بجاية على بعد 34 كم من بؤرها
                الليلية يومي 23-24 أوت، فلا يُستبعد البرق تماماً لتلك البؤر
                الغربية وإن بقي غير مرجّح لبؤر جيجل.
              </p>
            </div>
            <Alert className="mt-6 max-w-2xl">
              <AlertTitle>غياب البرق لا يُثبت الفعل البشري</AlertTitle>
              <AlertDescription>
                هو ينفي أحد التفسيرات الطبيعية فحسب. الانتقال إلى «السبب بشري»
                يحتاج خطوة أخرى.
              </AlertDescription>
            </Alert>
            <ClaimBasis
              className="max-w-2xl"
              level={3}
              confidence="متوسطة إلى عالية"
              sources="DS-07 · DS-08 · الفصل 13"
              sourcesHref="/report"
            />
          </section>
          </Reveal>

          {/* ── 06 ── */}
          <Reveal>
          <section id="weather" className="mt-16 scroll-mt-20">
            <SectionLabel index="06">الطقس يشرح الاتساع لا البداية</SectionLabel>
            <p className="mt-4 max-w-2xl text-xl font-medium leading-9">
              مساء 26 أوت اجتمعت حرارة شديدة وهواء جاف ورياح قوية. في الوقت نفسه
              قفز النشاط الحراري.
            </p>
            <StatStrip
              className="mt-6 max-w-2xl sm:grid-cols-3"
              items={[
                { value: "43-45°م", unit: "حرارة متوقعة في الداخل" },
                { value: "8-12٪", unit: "رطوبة متوقعة في الداخل" },
                { value: "68 كم/س", unit: "أقوى هبّات مرصودة" },
              ]}
            />
            <div className="mt-5 flex max-w-2xl flex-col gap-4 leading-8">
              <p>
                بلغ مجموع قوة الإشعاع الحراري 60,792 ميغاواط في تمريرة واحدة يوم
                26 أوت، وهي أعلى قيمة في الحدث كله، متزامناً مع ذروة موجة السيروكو.
                هذا يشرح لماذا كبرت الحرائق بهذه السرعة، لا كيف بدأت الشرارة
                الأولى.
              </p>
            </div>
            <ClaimBasis
              className="max-w-2xl"
              level={3}
              confidence="عالية"
              sources="DS-07 · DS-08"
              sourcesHref="/report"
            />
          </section>
          </Reveal>

          {/* ── 07 ── */}
          <Reveal>
          <section id="human" className="mt-16 scroll-mt-20">
            <SectionLabel index="07">إذاً: الفعل البشري</SectionLabel>
            <p className="mt-4 max-w-2xl text-xl font-medium leading-9">
              بعد أن أصبح البرق غير مرجّح ولم يبقَ سبب طبيعي معقول، يصبح الفعل
              البشري، بالمعنى العام، التفسير الأرجح.
            </p>
            <div className="mt-5 max-w-2xl space-y-4 leading-8">
              <p>
                هذا ترجيح بالاستبعاد، لا دليل ميداني. البؤر تقع في كتلة جبلية
                مأهولة بكثافة ريفية ونشاط بشري واسع، والتعدّد المرصود هو الخلفية
                الوطنية الدائمة صيفاً (199 بؤرة مستقلة عبر الشمال الجزائري).
              </p>
              <p>
                ثم يتوقّف ما تستطيع البيانات قوله. صور الأقمار لا تميّز بين عقب
                سيجارة وشرارة احتكاك وحرق فلاحي وإضرام متعمّد، كلها تترك البصمة
                الحرارية نفسها. واختبار التزامن، المؤشر المركزي لفرضية التنسيق،
                يكشف عملية محقونة من 45 بؤرة متزامنة في 1.5٪ من الحالات فقط. فلا
                نتيجته السلبية تنفي التنسيق، ولا يوجد دليل إيجابي واحد عليه.
              </p>
            </div>

            <div className="mt-8 max-w-2xl overflow-x-auto">
              <Table className="min-w-[34rem]">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-28 whitespace-normal align-top">
                      التفسير
                    </TableHead>
                    <TableHead className="whitespace-normal align-top">
                      ماذا تقول البيانات؟
                    </TableHead>
                    <TableHead className="w-32 whitespace-normal align-top">
                      النتيجة
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {explanations.map((row) => (
                    <TableRow key={row.label}>
                      <TableCell className="whitespace-normal align-top font-medium">
                        {row.label}
                      </TableCell>
                      <TableCell className="whitespace-normal align-top leading-7">
                        {row.reading}
                      </TableCell>
                      <TableCell className="whitespace-normal align-top">
                        {row.verdict}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <p className="mt-3 max-w-2xl text-sm leading-7">
              الجدول يشرح شكل الحدث، لا سبب كل حريق. لم تُنشر نتيجة ميدانية أو
              قضائية تحسم السبب حتى تاريخ التقرير.
            </p>

            <h3 className="mt-8 max-w-2xl text-lg font-semibold leading-8">
              وأيّ فعل بشري؟ هنا تضعف الأدلة فعلاً
            </h3>
            <p className="mt-3 max-w-2xl leading-8">
              رجّحت مصفوفة الفرضيات ترتيباً بين فروع السبب البشري، لكنه{" "}
              <strong className="font-semibold">لا يصمد</strong>: يكفي أن تُلطَّف
              الأدلة إلى النصف حتى يتقارب الفروع ويكاد الترتيب ينقلب. نعرضه لأنه
              نتيجة التحليل، مع حدّه صريحاً.
            </p>
            <HypothesisMatrix
              className="mt-5 max-w-2xl"
              rows={forensicSummary.hypotheses.single_cause}
              caption="ترتيب غير متين: عند التلطيف يصير 41٪ و24.4٪ و24.4٪ و10.2٪، أي أن الأدلة لا تفصل بين فروع السبب البشري. لا تُقرأ هذه النسب حكماً على أي حريق بعينه."
            />
            <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">
              لا يتناول هذا التحليل فرضية العطل الكهربائي أو المرفقي: هي خارج نطاق
              التقرير، والبيانات المفتوحة لا تتيح اختبارها لأن شبكة التوزيع
              متوسّط الجهد غائبة كلياً عنها. واستبعاد فرضية من المقارنة يرفع وزن ما
              تبقّى، ومنه الفعل المتعمّد؛ فالأسباب العرضية غير الكهربائية تبقى
              قائمة بكامل وزنها.
            </p>

            <ClaimBasis
              className="max-w-2xl"
              level={2}
              confidence="متوسطة في الترجيح البشري · عالية في نفي القدرة على التمييز"
              sources="الفصل 14 · الفصل 26 · الفصل 32"
              sourcesHref="/report"
            />
          </section>
          </Reveal>

          {/* ── 08 ── */}
          <Reveal>
          <section id="suspicion-register" className="mt-16 scroll-mt-20">
            <SectionLabel index="08">سجلّ الاشتباه</SectionLabel>
            <p className="mt-4 max-w-2xl text-xl font-medium leading-9">
              ما يشدّ نحو فعل غير عرضي، وما يشدّ في الاتجاه المضاد. نعرضهما
              معاً وبالأرقام نفسها.
            </p>
            <div className="mt-5 max-w-2xl divide-y border">
              {suspicionSignals.map((item) => (
                <div key={item.title} className="px-4 py-4">
                  <h3 className="text-sm font-semibold leading-6">
                    {item.title}
                  </h3>
                  <p className="mt-1.5 text-sm leading-7">{item.body}</p>
                </div>
              ))}
            </div>
            <EdgePanel
              className="mt-6 max-w-2xl"
              label="وما وجدناه في الاتجاه المضاد"
            >
              <ul className="flex list-disc flex-col gap-2 pe-5 leading-8 marker:text-border">
                {counterSignals.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
              <p className="mt-4 border-t pt-4 text-sm leading-7">
                ثقل هذه المادة لا يقلب الخلاصة: السبب ما زال غير طبيعي، والفعل
                البشري ما زال أرجح. لكنه يبقي فرضية الفعل المتعمّد أو المنسّق
                مفتوحة، لا مثبتة ولا منفية.
              </p>
            </EdgePanel>
            <ClaimBasis
              className="max-w-2xl"
              level={2}
              confidence="متفاوتة بحسب المؤشر · تفصيلها في الفصل 31"
              sources="الفصل 31 · الفصل 25"
              sourcesHref="/report"
            />
          </section>
          </Reveal>

          {/* ── 09 ── */}
          <Reveal>
          <section id="limits" className="mt-16 scroll-mt-20">
            <SectionLabel index="09">ما لا نعرفه، والحدّ</SectionLabel>
            <EdgePanel className="mt-4 max-w-2xl" label="حدود ما تقوله البيانات">
              <p className="text-lg font-medium leading-8">
                من المرجّح أن البدايات ارتبطت بنشاط بشري. لكننا لا نستطيع تحديد إن
                كان السبب حادثاً أو إهمالاً أو فعلاً متعمّداً.
              </p>
              <ul className="mt-4 flex list-disc flex-col gap-2 pe-5 leading-8 marker:text-border">
                <li>سبب اشتعال أي بؤرة من البؤر الاثنتي عشرة. لا واحدة منها.</li>
                <li>
                  نقطة الاشتعال الفعلية وزمنها؛ النوافذ العمياء بين 11 و73 ساعة
                  للبؤر الليلية.
                </li>
                <li>
                  ما إذا كانت الاشتعالات منسّقة أم متفرّقة، وهو سؤال لم يُختبر
                  اختباراً ذا قوة، لا سؤال أُجيب عنه بالنفي.
                </li>
              </ul>
            </EdgePanel>
            <p className="mt-5 max-w-2xl leading-8">
              هذا عجزٌ في أدوات الرصد المتاحة، لا براءة ثبتت. ما يحسم المسألة فحص
              ميداني لمناطق المنشأ، وبيانات أقمار ثابتة بتردد دقائق، وأرشيف حرائق
              متعدّد السنوات، وكلها خارج ما تبلغه البيانات المفتوحة. وقد باشر
              الدرك الوطني تحقيقات في الأسباب يوم 29 أوت.
            </p>
            <div className="mt-8 flex max-w-2xl flex-wrap gap-x-6 gap-y-3 border-t pt-5 text-sm">
              <Link
                href="/report"
                className="font-medium underline decoration-border underline-offset-8 hover:decoration-foreground"
              >
                اقرأ التقرير الكامل ←
              </Link>
              <Link
                href="/methodology"
                className="text-muted-foreground underline decoration-border underline-offset-8 hover:text-foreground hover:decoration-foreground"
              >
                راجع طريقة العمل
              </Link>
            </div>
          </section>
          </Reveal>
        </div>
      </div>
    </article>
  );
}
