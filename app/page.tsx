import Image from "next/image";
import Link from "next/link";

import { Separator } from "@/components/ui/separator";
import { siteSections } from "@/lib/site-navigation";

const keyFigures = [
  { value: "9,100", label: "رصداً حرارياً صالحاً للتحليل" },
  { value: "4,451", label: "خلية شبكية بدقة 375 م" },
  { value: "12", label: "مرشحاً لمنشأ مستقل" },
  { value: "17", label: "ندبة تتجاوز 100 هكتار" },
];

const timeline = [
  {
    date: "23 أوت",
    title: "أقدم رصد في النطاق الأوسع",
    body: "ظهر عند 01:35 محلياً في ولاية سطيف، خارج حدود جيجل.",
  },
  {
    date: "24 أوت",
    title: "أقدم رصد داخل جيجل",
    body: "الساعة 14:53 بالجمعة بني حبيبي؛ رصد فضائي، لا نقطة اشتعال مؤكدة.",
  },
  {
    date: "26–27 أوت",
    title: "ذروة الحدث",
    body: "تزامن انفجار النشاط الحراري مع حرارة بلغت 43°م ورطوبة هبطت إلى 12.5٪.",
  },
  {
    date: "28–29 أوت",
    title: "توثيق الندبات وفتح التحقيقات",
    body: "أظهرت Sentinel-2 الندبات المنفصلة، وأعلن الدرك الوطني مباشرة التحقيق في الأسباب.",
  },
];

const findings = [
  {
    number: "01",
    title: "الحدث لم يبدأ من بؤرة واحدة",
    body: "تتقارب ثلاثة خطوط مستقلة: أول رصد حراري لكل خلية، فجوات غير محترقة بين المسارات، و17 ندبة منفصلة في Sentinel-2.",
    confidence: "الثقة: عالية",
    sources: "DS-01–05 · OF-06",
  },
  {
    number: "02",
    title: "الطقس يفسّر سرعة الاتساع",
    body: "بلغت موجة السيروكو ذروتها مع حرارة وجفاف ورياح شديدة. هذا يشرح شدة الانتشار، لكنه لا يحدد مصدر الشرارة الأولى.",
    confidence: "الثقة: عالية",
    sources: "DS-07 · DS-08",
  },
  {
    number: "03",
    title: "السبب البشري العام أرجح من البرق",
    body: "لم يظهر برق أو هطول يدعم تفسيراً طبيعياً لبؤر جيجل الرئيسية. الاستنتاج بالاستبعاد يبقى أضعف من فحص موقع المنشأ.",
    confidence: "الثقة: متوسطة",
    sources: "DS-07 · DS-08 · ME-04",
  },
  {
    number: "04",
    title: "القصد والتنسيق لا يمكن حسمهما",
    body: "لا تحمل البيانات الفضائية خاصية تفصل بين الإهمال والحادث والفعل المتعمد، كما أن فجوات مرور الأقمار تجعل التزامن المطلوب غير قابل للقياس بدقة كافية.",
    confidence: "الثقة: عالية في نفي القدرة على الحسم",
    sources: "الفصول 25–27 · OF-07",
  },
];

export default function Home() {
  return (
    <>
      <section className="mx-auto max-w-7xl px-4 pb-12 pt-10 sm:px-6 sm:pb-16 sm:pt-14 lg:px-8 lg:pb-20">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
          <aside className="text-sm leading-6 text-muted-foreground lg:col-span-3">
            <p className="font-medium text-foreground">ملف 01 / المراجعة 4</p>
            <p className="mt-2">ولاية جيجل، الجزائر</p>
            <p className="numeric mt-1">22–29.08.2026</p>
            <p className="ltr-embed mt-1">36.72°N · 5.95°E</p>
          </aside>

          <div className="lg:col-span-8 lg:col-start-5">
            <p className="text-sm font-medium">إعادة بناء جنائي-جغرافي</p>
            <h1 className="mt-5 max-w-4xl text-4xl font-semibold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              ماذا تقول بيانات الأقمار عن حرائق جيجل؟
            </h1>
            <p className="mt-7 max-w-3xl text-lg leading-8 text-muted-foreground sm:text-xl sm:leading-9">
              سجل قابل للمراجعة لأيام 22–29 أوت 2026: أين ظهر النشاط أولاً،
              كيف اتسع، وأين تنتهي قدرة البيانات المفتوحة على التفسير.
            </p>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm">
              <Link
                href="/investigation"
                className="font-medium underline decoration-border underline-offset-8 hover:decoration-foreground"
              >
                ابدأ بمسار الأدلة ←
              </Link>
              <Link
                href="/report"
                className="text-muted-foreground underline decoration-border underline-offset-8 hover:text-foreground hover:decoration-foreground"
              >
                اقرأ التقرير الكامل
              </Link>
            </div>
          </div>
        </div>

        <Separator className="my-10 sm:my-14" />

        <dl className="grid sm:grid-cols-2 lg:grid-cols-4">
          {keyFigures.map((figure, index) => (
            <div
              key={figure.label}
              className="border-b py-6 sm:px-6 sm:odd:border-s lg:border-b-0 lg:border-s lg:first:border-s-0 lg:first:ps-0"
            >
              <dt className="max-w-48 text-sm leading-6 text-muted-foreground">
                {figure.label}
              </dt>
              <dd className="numeric mt-3 text-4xl font-semibold tracking-tight">
                {figure.value}
              </dd>
              <p className="numeric mt-3 text-xs text-muted-foreground">
                {String(index + 1).padStart(2, "0")} / 04
              </p>
            </div>
          ))}
        </dl>
      </section>

      <section className="border-y">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-12 lg:px-8 lg:py-20">
          <div className="lg:col-span-3">
            <p className="text-sm font-medium">الخلاصة التنفيذية</p>
          </div>
          <div className="lg:col-span-8 lg:col-start-5">
            <h2 className="max-w-3xl text-3xl font-semibold leading-snug tracking-tight sm:text-4xl">
              تعددت بؤر المنشأ، وكانت الظروف الجوية محرّك الاتساع. أما القصد
              الجنائي فلا تثبته هذه البيانات.
            </h2>
            <p className="mt-7 max-w-3xl text-lg leading-9 text-muted-foreground">
              تشير المعطيات بدرجة ثقة عالية إلى عدة بؤر مستقلة مكانياً، وترجّح
              بدرجة متوسطة سبباً بشرياً بالمعنى العام بعد أن أصبح البرق تفسيراً
              غير مرجّح. لكنها لا تفصل بين الإهمال والحادث والفعل المتعمّد؛ ذلك
              يحتاج أدلة ميدانية لا تلتقطها الأقمار.
            </p>
            <blockquote className="mt-9 border-s-2 ps-6 text-base leading-8">
              ضعف الاحتمال ليس تبرئة، وانعدام القدرة على الكشف ليس دليل غياب.
              التحقيق الرسمي إجراء مختص، وليس نتيجة يمكن استعارتها كدليل.
            </blockquote>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <div className="grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-3">
            <p className="text-sm font-medium">الدليل الانعكاسي</p>
            <p className="mt-3 max-w-xs text-sm leading-7 text-muted-foreground">
              مقارنة Sentinel-2 قبل الحدث وبعده، مع خريطة dNBR التي تفصل بين
              الغطاء السليم وشدة الاحتراق.
            </p>
          </div>
          <figure className="lg:col-span-9">
            <div className="overflow-hidden border bg-muted">
              <Image
                src="/generated/media/sentinel-comparison.png"
                alt="مقارنة صور Sentinel-2 قبل حرائق جيجل وبعدها مع خريطة شدة الاحتراق dNBR"
                width={2073}
                height={2561}
                priority
                className="h-auto w-full"
              />
            </div>
            <figcaption className="mt-4 flex flex-wrap justify-between gap-3 text-xs leading-5 text-muted-foreground">
              <span>الشكل 01 — مشاهد 18 و28 أوت وخريطة فرق الاحتراق</span>
              <span className="ltr-embed">Sentinel-2 / DS-05</span>
            </figcaption>
          </figure>
        </div>
      </section>

      <section className="border-y bg-muted/35">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
          <div className="grid gap-8 lg:grid-cols-12">
            <div className="lg:col-span-3">
              <p className="text-sm font-medium">التسلسل المختصر</p>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                تاريخ الرصد لا يساوي تاريخ الاشتعال؛ مرور الأقمار متقطع.
              </p>
            </div>
            <ol className="lg:col-span-8 lg:col-start-5">
              {timeline.map((event) => (
                <li
                  key={event.date}
                  className="grid gap-3 border-t py-6 sm:grid-cols-4 sm:gap-6"
                >
                  <time className="numeric text-sm font-medium">{event.date}</time>
                  <div className="sm:col-span-3">
                    <h3 className="font-semibold">{event.title}</h3>
                    <p className="mt-2 leading-7 text-muted-foreground">
                      {event.body}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <div className="grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-3">
            <p className="text-sm font-medium">النتائج وحدودها</p>
          </div>
          <div className="lg:col-span-9">
            {findings.map((finding) => (
              <article
                key={finding.number}
                className="grid gap-4 border-t py-7 md:grid-cols-12 md:gap-6"
              >
                <p className="numeric text-xs text-muted-foreground md:col-span-1">
                  {finding.number}
                </p>
                <h3 className="text-xl font-semibold leading-8 md:col-span-4">
                  {finding.title}
                </h3>
                <div className="md:col-span-7">
                  <p className="leading-8 text-muted-foreground">{finding.body}</p>
                  <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs">
                    <span>{finding.confidence}</span>
                    <Link
                      href="/sources"
                      className="ltr-embed text-muted-foreground underline underline-offset-4 hover:text-foreground"
                    >
                      {finding.sources}
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
          <div className="grid gap-8 lg:grid-cols-12">
            <div className="lg:col-span-3">
              <p className="text-sm font-medium">فهرس الملف</p>
            </div>
            <nav aria-label="أقسام الملف" className="lg:col-span-9">
              {siteSections.map((section, index) => (
                <Link
                  key={section.href}
                  href={section.href}
                  className="group grid gap-3 border-t py-5 sm:grid-cols-12 sm:gap-6"
                >
                  <span className="numeric text-xs text-muted-foreground sm:col-span-1">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="font-semibold underline-offset-4 group-hover:underline sm:col-span-3">
                    {section.title}
                  </span>
                  <span className="text-sm leading-7 text-muted-foreground sm:col-span-7">
                    {section.summary}
                  </span>
                  <span aria-hidden="true" className="text-end sm:col-span-1">
                    ←
                  </span>
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </section>
    </>
  );
}
