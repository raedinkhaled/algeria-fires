import Image from "next/image";
import Link from "next/link";
import { ArrowLeftIcon, CircleDotIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { siteSections } from "@/lib/site-navigation";

const keyFigures = [
  {
    value: "9,100",
    metric: "رصد حراري",
    note: "VIIRS وMODIS",
  },
  {
    value: "4,451",
    metric: "خلية 375 م",
    note: "أول ظهور في الشبكة",
  },
  {
    value: "12",
    metric: "منشأ مرشّح",
    note: "6 داخل ولاية جيجل",
  },
  {
    value: "17",
    metric: "ندبة ≥100 هكتار",
    note: "من Sentinel-2",
  },
];

const evidenceLines = [
  {
    title: "الرصد لا يساوي لحظة الاشتعال",
    body: "تعطي الأقمار نقطة الكشف الأولى، بينما قد يسبقها الاشتعال بساعات تحددها فجوات المرور.",
  },
  {
    title: "السبب البشري أرجح من الطبيعي",
    body: "لا تدعم شاشة البرق تفسيراً طبيعياً للبؤر الرئيسية، لكن ذلك لا يحدّد الفاعل أو القصد.",
  },
  {
    title: "التنسيق غير قابل للحسم من هذه البيانات",
    body: "اختبار التزامن ضعيف القوة؛ النتيجة العلمية هي حدّ القياس، لا إثبات التنسيق ولا نفيه.",
  },
];

export default function Home() {
  return (
    <>
      <section className="border-b">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-10 sm:px-6 sm:py-14 lg:grid-cols-12 lg:gap-12 lg:px-8 lg:py-20">
          <div className="flex flex-col justify-between gap-10 lg:col-span-7">
            <div>
              <div className="mb-6 flex flex-wrap items-center gap-3">
                <Badge variant="outline">تحقيق بيانات مفتوحة</Badge>
                <span className="text-sm text-muted-foreground">أوت 2026</span>
                <span className="ltr-embed text-sm text-muted-foreground">
                  36.72°N · 5.95°E
                </span>
              </div>

              <h1 className="max-w-4xl text-5xl font-semibold leading-tight tracking-tight sm:text-6xl lg:text-7xl">
                حرائق جيجل،
                <span className="block text-primary">
                  كما رصدتها الأقمار.
                </span>
              </h1>

              <p className="mt-7 max-w-2xl text-lg leading-8 text-muted-foreground sm:text-xl sm:leading-9">
                إعادة بناء قابلة للمراجعة لأيام النار بين 22 و29 أوت: أين ظهر
                النشاط أولاً، كيف انتشر، وما الذي تستطيع الأدلة قوله — وما لا
                تستطيع قوله.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="/investigation">
                  اقرأ التحقيق
                  <ArrowLeftIcon data-icon="inline-end" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/methodology">راجع طريقة العمل</Link>
              </Button>
            </div>
          </div>

          <figure className="lg:col-span-5">
            <div className="overflow-hidden rounded-lg border bg-muted">
              <Image
                src="/generated/media/burn-severity.png"
                alt="خريطة شدة الاحتراق dNBR المستخرجة من صور Sentinel-2 بعد حرائق جيجل"
                width={1484}
                height={810}
                priority
                className="aspect-[4/5] w-full object-cover lg:aspect-[5/6]"
              />
            </div>
            <figcaption className="mt-3 flex items-start justify-between gap-4 text-xs leading-5 text-muted-foreground">
              <span>شدة الاحتراق dNBR · Sentinel-2 · 28 أوت 2026</span>
              <span className="ltr-embed shrink-0">ESA / Copernicus</span>
            </figcaption>
          </figure>
        </div>
      </section>

      <section aria-labelledby="figures-title">
        <h2 id="figures-title" className="sr-only">
          الأرقام المرجعية
        </h2>
        <div className="mx-auto grid max-w-7xl border-b sm:grid-cols-2 lg:grid-cols-4">
          {keyFigures.map((figure) => (
            <div
              key={figure.metric}
              className="border-b px-4 py-7 last:border-b-0 sm:px-6 sm:odd:border-s lg:border-b-0 lg:border-s lg:first:border-s-0 lg:px-8"
            >
              <p className="numeric text-4xl font-semibold tracking-tight">
                {figure.value}
              </p>
              <p className="mt-2 font-medium">{figure.metric}</p>
              <p className="mt-1 text-sm text-muted-foreground">{figure.note}</p>
            </div>
          ))}
        </div>
        <p className="mx-auto max-w-7xl px-4 py-3 text-xs text-muted-foreground sm:px-6 lg:px-8">
          قيم مرجعية ثابتة؛ يتوقف إعداد بيانات الموقع تلقائياً إذا اختلفت عنها.
        </p>
      </section>

      <section className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-12 lg:px-8 lg:py-24">
        <div className="lg:col-span-4">
          <Badge variant="secondary">الخلاصة المنهجية</Badge>
          <h2 className="mt-5 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
            أقوى نتيجة ليست اتهاماً؛ بل حدود واضحة لما يمكن قياسه.
          </h2>
          <p className="mt-5 text-base leading-8 text-muted-foreground">
            يفرّق الملف بين الرصد والاستنتاج، وبين السبب البشري العام والقصد
            الجنائي. كل خطوة حساسة مرتبطة بمصدر وقيد ودرجة ثقة.
          </p>
        </div>

        <div className="lg:col-span-7 lg:col-start-6">
          <Separator />
          {evidenceLines.map((line, index) => (
            <div
              key={line.title}
              className="grid gap-3 border-b py-6 sm:grid-cols-[3rem_1fr]"
            >
              <span className="numeric text-sm text-primary">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div>
                <h3 className="text-lg font-semibold">{line.title}</h3>
                <p className="mt-2 max-w-2xl leading-7 text-muted-foreground">
                  {line.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y bg-muted/45">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="grid gap-8 md:grid-cols-12">
            <div className="md:col-span-4">
              <p className="text-sm font-medium text-primary">فهرس الملف</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight">
                ستة مسارات، من السرد إلى المصدر.
              </h2>
            </div>
            <p className="max-w-2xl leading-8 text-muted-foreground md:col-span-7 md:col-start-6">
              ابدأ من التحقيق لفهم التسلسل، ثم انتقل إلى الخريطة والبيانات
              والمنهجية لاختبار الاستنتاجات بنفسك.
            </p>
          </div>

          <div className="mt-12 grid border-t md:grid-cols-2">
            {siteSections.map((section, index) => (
              <Link
                key={section.href}
                href={section.href}
                className="group grid grid-cols-[3rem_1fr_auto] gap-3 border-b py-6 transition-colors hover:text-primary md:odd:border-s md:odd:ps-6 md:even:pe-6"
              >
                <span className="numeric pt-1 text-xs text-muted-foreground">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span>
                  <span className="block text-lg font-semibold">
                    {section.title}
                  </span>
                  <span className="mt-2 block text-sm leading-6 text-muted-foreground">
                    {section.summary}
                  </span>
                </span>
                <ArrowLeftIcon className="mt-1 text-muted-foreground transition-transform group-hover:-translate-x-1" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-primary text-primary-foreground">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-12 lg:px-8 lg:py-16">
          <CircleDotIcon className="size-8 md:col-span-1" aria-hidden="true" />
          <div className="md:col-span-8">
            <h2 className="text-2xl font-semibold">نطاق هذا العمل</h2>
            <p className="mt-4 max-w-3xl text-base leading-8 text-primary-foreground/85">
              تحليل توثيقي مستقل يعتمد بيانات مفتوحة ومتاحة للتحقق. لا يحدّد
              مسؤولية جنائية ولا يثبت إضراماً متعمداً، ولا يمثّل تحقيقاً رسمياً
              أو بديلاً عنه.
            </p>
          </div>
          <Button
            asChild
            variant="secondary"
            className="self-start md:col-span-3 md:justify-self-end"
          >
            <Link href="/sources">افتح سجل المصادر</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
