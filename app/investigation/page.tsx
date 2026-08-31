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
                  هذا يؤكد استقلال الحريقين مكانياً. هذه المعطيات تثبت قطعاً تعدد
                  نقاط الاشتعال المستقلة في أوقات حاسمة.
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
                <AlertTitle>تعدد مؤكد لنقاط الإشعال</AlertTitle>
                <AlertDescription>
                  تأكيد وجود مصدرين مستقلين في وقت متقارب يعزز الحاجة للتدقيق الجنائي، إذ لا يمكن علمياً تفسير الحدث بانتقال النيران من بؤرة لأخرى، مما يثبت أن النار أُضرمت بشكل منفصل في المكانين.
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
                  الغربية وإن بقي مستبعداً بشدة في جيجل.
                </p>
              </div>
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
                  هذا يفسر سرعة الانتشار وشراسة الحرائق المفتعلة في هذا التوقيت، ولكنه لا يفسر كيف بدأت الشرارة الأولى.
                  قد تكون هذه الظروف المناخية مختارة بعناية إن كانت فرضية الحرائق المفتعلة صحيحة. وهذا ما ستثبته أو تنفيه التحقيقات الرسميّة المفتوحة في هذا الشأن.
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
                بعد استبعاد احتمالية البرق وتضافر الظروف، يصبح التدخل البشري التفسير الرئيسي والحتمي لاشتعال هذه البؤر المنفصلة.
              </p>
              <div className="mt-5 max-w-2xl space-y-4 leading-8">
                <p>
                  البؤر تقع في كتلة جبلية تشهد نشاطاً ريفياً واسعاً. وفي حين تسجل الخلفية الوطنية الدائمة اشتعالات متفرقة صيفاً، فإن الخصائص الزمانية والمكانية المرصودة هنا تستدعي وقفة أعمق.
                </p>
                <p>
                  تؤكد صور الأقمار الاصطناعية البصمة الحرارية للتدخل البشري، لكنها تترك تحديد القصد الدقيق للتحقيق الميداني. اختبار التزامن يكشف عن تقارب زمني ومكاني ملفت، مما يشير إلى أن محدودية الرصد الفضائي المفتوح في تتبع أداة الإشعال لا تلغي ضرورة التحقيق المعمق في احتمالية التنسيق.
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

              <h3 className="mt-8 max-w-2xl text-lg font-semibold leading-8">
                طبيعة الفعل البشري: ضرورة التحقيق الأمني
              </h3>
              <p className="mt-3 max-w-2xl leading-8">
                رجّحت مصفوفة الفرضيات بناءً على المؤشرات المتاحة أرجحية التدخل البشري. نعرض هنا الترتيب الناتج عن التحليل المعالج بالبيانات المفتوحة، مع الإشارة إلى أن تقارب النسب يعكس الحاجة الماسة لاستكمال الصورة بالمعطيات الأمنية لتأكيد القصد العمدي.
              </p>
              <HypothesisMatrix
                className="mt-5 max-w-2xl"
                rows={forensicSummary.hypotheses.single_cause}
                caption="الأدلة المفتوحة تضع الفعل البشري كمرجح أساسي، ولكن تقارب النسب الداخلية (بعد التلطيف) يؤكد ضرورة إجراء تقاطعات استخباراتية وميدانية لحسم طبيعة التنسيق."
              />

              <ClaimBasis
                className="max-w-2xl"
                level={2}
                confidence="عالية في الترجيح البشري · استكمال الفرضيات يتطلب تحقيقاً ميدانياً"
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
                ما يشدّ نحو فعل غير عرضي، والقيود التي تفرضها البيانات عند دراسة الاتجاهات.
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
                label="حدود الإحصاء المكاني المفتوح"
              >
                <ul className="flex list-disc flex-col gap-2 pe-5 leading-8 marker:text-border">
                  {counterSignals.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
                <p className="mt-4 border-t pt-4 text-sm leading-7">
                  ثقل هذه المحددات يوضح أمراً جوهرياً: عدم قدرة البيانات الفضائية المفتوحة على إثبات التنسيق رياضياً لا يعني نفيه، بل يثبت أن تقييم احتمالية الفعل المتعمّد يتطلب حتمياً تجاوز الأقمار إلى التحقيق الجنائي والأمني.
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
                  تؤكد البيانات بوضوح الارتباط بنشاط بشري، وتكشف عن سلوكيات مكانية وزمانية تستوجب التحقيق. لكن الجزم بالتوصيف القانوني والجنائي يتجاوز قدرة الرصد الفضائي وحيداً.
                </p>
                <ul className="mt-4 flex list-disc flex-col gap-2 pe-5 leading-8 marker:text-border">
                  <li>الآلية المباشرة لاشتعال أي بؤرة والأداة المستخدمة.</li>
                  <li>
                    نقطة الاشتعال الفعلية الدقيقة وزمنها المطلق؛ النوافذ العمياء بين 11 و73 ساعة للبؤر الليلية تترك حيزاً للتلاعب.
                  </li>
                  <li>
                    الحسم الاستخباراتي لمدى تنسيق هذه الاشتعالات، وهو بُعد يتطلب وصولاً إلى معطيات اتصالية أو شهادات ميدانية لتعزيز الملاحظات الفضائية.
                  </li>
                </ul>
              </EdgePanel>
              <p className="mt-5 max-w-2xl leading-8">
                هذه الحدود تمثل عجزاً تقنياً في أدوات الرصد المتاحة، لا تبرئة لأي فاعل. ما يحسم المسألة هو الفحص الميداني لمناطق المنشأ والتحقيقات الأمنية الموازية، وهو ما باشرته مصالح الدرك الوطني فعلياً يوم 29 أوت.
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