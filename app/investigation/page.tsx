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

export const metadata: Metadata = {
  title: "كيف عرفنا أن السبب ليس طبيعياً؟",
  description:
    "الأدلة خطوة بخطوة: أول إشارة رآها القمر، تعدّد البدايات، استبعاد البرق، دور الطقس، سجلّ الاشتباه، ثم ما يبقى مفتوحاً وحدوده.",
};

const fileMeta = [
  { term: "القسم", value: "التحقيق" },
  { term: "طريقة القراءة", value: "8 محطات قصيرة" },
  { term: "الفترة", value: "22-29.08.2026", mono: true },
  { term: "المصادر", value: "DS · OF · ME", mono: true },
];

const stations = [
  { id: "first-signal", index: "01", label: "أول إشارة" },
  { id: "multiple-origins", index: "02", label: "تعدّد البدايات" },
  { id: "chekfa-texenna", index: "03", label: "الشقفة وتاكسنة" },
  { id: "lightning", index: "04", label: "البرق مستبعد" },
  { id: "weather", index: "05", label: "الطقس والاتساع" },
  { id: "human", index: "06", label: "إذاً: الفعل البشري" },
  { id: "suspicion-register", index: "07", label: "سجلّ الاشتباه" },
  { id: "limits", index: "08", label: "ما لا نعرفه" },
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
    title: "إشارات التوقيت",
    body: "حالتا ظهور بؤرتين في تمريرة قمر واحدة، وأربع بؤر أول رصدها ليلاً، ووصف الوزير «الاندلاع المتزامن»، و705 مواقع أعادت الاشتعال وطنياً. لافتة، لكن كلاً منها يحتمل تفسيراً عادياً.",
  },
];

const counterSignals = [
  "الاشتعالات تتبّع طقس الحرائق بقوة شديدة؛ احتمال المصادفة ضئيل جداً.",
  "تعدّد البؤر هو الخلفية الوطنية الدائمة صيفاً: 199 بؤرة مستقلة، من 7 إلى 58 يومياً.",
  "لا بصمة اختيار تكتيكي للمواقع، ولا دليل إيجابي واحد على التنسيق.",
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
                src="/generated/media/burn-severity.png"
                alt="خريطة شدة الاحتراق في جيجل محسوبة من صور Sentinel-2، تُظهر ندبات حريق منفصلة"
                width={4946}
                height={2700}
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
          <section id="lightning" className="mt-16 scroll-mt-20">
            <SectionLabel index="04">البرق مستبعد</SectionLabel>
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

          {/* ── 05 ── */}
          <Reveal>
          <section id="weather" className="mt-16 scroll-mt-20">
            <SectionLabel index="05">الطقس يشرح الاتساع لا البداية</SectionLabel>
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

          {/* ── 06 ── */}
          <Reveal>
          <section id="human" className="mt-16 scroll-mt-20">
            <SectionLabel index="06">إذاً: الفعل البشري</SectionLabel>
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

          {/* ── 07 ── */}
          <Reveal>
          <section id="suspicion-register" className="mt-16 scroll-mt-20">
            <SectionLabel index="07">سجلّ الاشتباه</SectionLabel>
            <p className="mt-4 max-w-2xl text-xl font-medium leading-9">
              ثلاثة عناصر تشدّ نحو فعل غير عرضي، وثلاثة تشدّ في الاتجاه المضاد.
              نعرضها معاً.
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

          {/* ── 08 ── */}
          <Reveal>
          <section id="limits" className="mt-16 scroll-mt-20">
            <SectionLabel index="08">ما لا نعرفه، والحدّ</SectionLabel>
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
