import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const metadata: Metadata = {
  title: "مسار التحقيق",
  description:
    "شرح مبسط للأصول المرشحة وانتشار حرائق جيجل والطقس والتضاريس والفرضيات وحدود الأدلة.",
};

const sections = [
  { id: "first-observation", number: "01", label: "أول رصد" },
  { id: "multiple-origins", number: "02", label: "تعدد المنشأ" },
  { id: "weather", number: "03", label: "الطقس والاتساع" },
  { id: "terrain", number: "04", label: "الرياح والتضاريس" },
  { id: "hypotheses", number: "05", label: "اختبار الفرضيات" },
  { id: "limits", number: "06", label: "حدود الاستنتاج" },
];

function EvidenceMeta({
  confidence,
  sources,
}: {
  confidence: string;
  sources: string;
}) {
  return (
    <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-xs">
      <span>درجة الثقة: {confidence}</span>
      <Link
        href="/sources"
        className="ltr-embed text-muted-foreground underline underline-offset-4 hover:text-foreground"
      >
        {sources}
      </Link>
    </div>
  );
}

export default function InvestigationPage() {
  return (
    <article>
      <header className="mx-auto max-w-7xl px-4 pb-12 pt-10 sm:px-6 sm:pb-16 sm:pt-14 lg:px-8 lg:pb-20">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="text-sm leading-6 text-muted-foreground lg:col-span-3">
            <p className="font-medium text-foreground">مسار الأدلة</p>
            <p className="mt-2">6 محطات قراءة</p>
            <p className="mt-1">المراجعة 4</p>
          </div>
          <div className="lg:col-span-8 lg:col-start-5">
            <h1 className="max-w-4xl text-4xl font-semibold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              من أول رصد إلى حدود الاستنتاج
            </h1>
            <p className="mt-7 max-w-3xl text-lg leading-9 text-muted-foreground">
              قراءة من ست خطوات توضّح كيف انتقل التحقيق من قياسات الأقمار إلى
              تقييم الفرضيات، وأين يجب التوقف لأن الدليل المتاح لم يعد كافياً.
            </p>
          </div>
        </div>

        <Separator className="my-10 sm:my-14" />

        <nav aria-label="فهرس مسار التحقيق" className="grid sm:grid-cols-2 lg:grid-cols-3">
          {sections.map((section) => (
            <Link
              key={section.id}
              href={`#${section.id}`}
              className="flex gap-4 border-b py-4 text-sm sm:px-5 sm:odd:border-s lg:border-s lg:first:border-s-0"
            >
              <span className="numeric text-muted-foreground">{section.number}</span>
              <span className="font-medium underline-offset-4 hover:underline">
                {section.label}
              </span>
            </Link>
          ))}
        </nav>
      </header>

      <section id="first-observation" className="scroll-mt-24 border-t">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-12 lg:px-8 lg:py-20">
          <div className="lg:col-span-3">
            <p className="numeric text-xs text-muted-foreground">01 / 06</p>
            <h2 className="mt-3 text-2xl font-semibold">أول رصد</h2>
          </div>
          <div className="lg:col-span-8 lg:col-start-5">
            <p className="text-2xl font-medium leading-10">
              أقدم بؤرة داخل جيجل رُصدت يوم 24 أوت عند 14:53 بالجمعة بني حبيبي.
            </p>
            <p className="mt-6 leading-8 text-muted-foreground">
              سجّلها مستشعر VIIRS على القمر Suomi-NPP عند
              <span className="ltr-embed mx-1 text-foreground">
                36.78738°N, 6.11795°E
              </span>
              بقوة إشعاع حراري 20.9 ميغاواط. أما أقدم رصد في النطاق الأوسع
              فكان يوم 23 أوت في ولاية سطيف، لا في جيجل.
            </p>
            <blockquote className="mt-8 border-s-2 ps-6 leading-8">
              هذه نقطة أول رصد فضائي وليست نقطة اشتعال مؤكدة. يمكن أن تسبق النار
              مرور القمر بساعات.
            </blockquote>
            <EvidenceMeta confidence="عالية في الرصد" sources="DS-01 · ME-01 · ME-04" />
          </div>
        </div>
      </section>

      <section id="multiple-origins" className="scroll-mt-24 border-t">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-12 lg:px-8 lg:py-20">
          <div className="lg:col-span-3">
            <p className="numeric text-xs text-muted-foreground">02 / 06</p>
            <h2 className="mt-3 text-2xl font-semibold">تعدد المنشأ</h2>
          </div>
          <div className="lg:col-span-9">
            <div className="grid gap-8 lg:grid-cols-9">
              <div className="lg:col-span-5">
                <p className="text-2xl font-medium leading-10">
                  12 مرشحاً استوفوا معاً شرط المسافة وفجوة المسار غير المحترق؛ 6
                  منها داخل الولاية.
                </p>
                <p className="mt-6 leading-8 text-muted-foreground">
                  لم يعتمد الاستنتاج على عدّ نقاط متباعدة فقط. اشترط التحليل أن
                  يبعد المرشح 5 كم على الأقل عن أقرب حريق سابق، وأن تفصله فجوة
                  غير محترقة لا تقل عن 4 كم على أفضل مسار ممكن.
                </p>
                <p className="mt-5 leading-8 text-muted-foreground">
                  وقد وصل دليل مستقل من Sentinel-2 إلى النتيجة نفسها: 17 ندبة
                  تتجاوز كل منها 100 هكتار، وبين أكبرها غطاء نباتي سليم.
                </p>
                <EvidenceMeta confidence="عالية" sources="DS-01–05 · OF-06" />
              </div>

              <figure className="lg:col-span-4">
                <div className="overflow-hidden border bg-muted">
                  <Image
                    src="/generated/media/burn-severity.png"
                    alt="خريطة شدة الاحتراق dNBR المستخرجة من Sentinel-2"
                    width={4946}
                    height={2700}
                    className="h-full w-full object-cover"
                  />
                </div>
                <figcaption className="mt-3 text-xs leading-5 text-muted-foreground">
                  الشكل 02 — شدة الاحتراق dNBR، مشهد 28 أوت
                </figcaption>
              </figure>
            </div>
          </div>
        </div>
      </section>

      <section id="weather" className="scroll-mt-24 border-y bg-muted/35">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-12 lg:px-8 lg:py-20">
          <div className="lg:col-span-3">
            <p className="numeric text-xs text-muted-foreground">03 / 06</p>
            <h2 className="mt-3 text-2xl font-semibold">الطقس والاتساع</h2>
          </div>
          <div className="lg:col-span-8 lg:col-start-5">
            <p className="text-2xl font-medium leading-10">
              بلغت موجة السيروكو ذروتها مساء 26 أوت: 43°م، ورطوبة بين 12.5٪
              و13.3٪ على الساحل.
            </p>
            <div className="mt-8 grid sm:grid-cols-3">
              <div className="border-y py-5 sm:border-s sm:px-5">
                <p className="numeric text-3xl font-semibold">43–45°م</p>
                <p className="mt-2 text-sm text-muted-foreground">حرارة الداخل المنمذجة</p>
              </div>
              <div className="border-b py-5 sm:border-y sm:border-s sm:px-5">
                <p className="numeric text-3xl font-semibold">8–12٪</p>
                <p className="mt-2 text-sm text-muted-foreground">رطوبة الداخل</p>
              </div>
              <div className="border-b py-5 sm:border-y sm:border-s sm:px-5">
                <p className="numeric text-3xl font-semibold">68 كم/س</p>
                <p className="mt-2 text-sm text-muted-foreground">أقصى هبّات منمذجة</p>
              </div>
            </div>
            <p className="mt-7 leading-8 text-muted-foreground">
              تزامنت الذروة الجوية مع القفزة الكبرى في قوة الإشعاع الحراري. هذا
              خط دليل قوي على محرّك الانتشار، لا على سبب الاشتعال الأول.
            </p>
            <EvidenceMeta confidence="عالية" sources="DS-07 · DS-08" />
          </div>
        </div>
      </section>

      <section id="terrain" className="scroll-mt-24">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-12 lg:px-8 lg:py-20">
          <div className="lg:col-span-3">
            <p className="numeric text-xs text-muted-foreground">04 / 06</p>
            <h2 className="mt-3 text-2xl font-semibold">الرياح والتضاريس</h2>
          </div>
          <div className="lg:col-span-8 lg:col-start-5">
            <p className="text-2xl font-medium leading-10">
              اتجه المجمّع الرئيسي إجمالاً شمالاً وشمال شرق، لكن 37٪ من خطوات
              التقدّم خالفت الرياح المنمذجة.
            </p>
            <p className="mt-6 leading-8 text-muted-foreground">
              التضاريس الجبلية المتقطعة تصنع تدفقات محلية لا يحلّها النموذج
              الشبكي، كما تسمح بالانتشار الجانبي والصعود على المنحدرات. لذلك لم
              يستخدم التقرير اتجاه الرياح دليلاً أساسياً على منشأ أو قصد.
            </p>
            <p className="mt-5 leading-8 text-muted-foreground">
              القرب من الطرق لم يكن فاصلاً أيضاً: 10 من 12 مرشحاً تقع على مسافة
              أقل من 500 م، لكن الخلفية العشوائية داخل المساحة المحترقة قريبة
              بالقدر نفسه تقريباً. إنها خاصية للجغرافيا، لا بصمة سببية.
            </p>
            <EvidenceMeta confidence="متوسطة" sources="DS-06 · DS-08 · DS-09" />
          </div>
        </div>
      </section>

      <section id="hypotheses" className="scroll-mt-24 border-y bg-muted/35">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-12 lg:px-8 lg:py-20">
          <div className="lg:col-span-3">
            <p className="numeric text-xs text-muted-foreground">05 / 06</p>
            <h2 className="mt-3 text-2xl font-semibold">اختبار الفرضيات</h2>
          </div>
          <div className="lg:col-span-9">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>الفرضية</TableHead>
                  <TableHead>ما تسنده البيانات</TableHead>
                  <TableHead>الحكم</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="whitespace-normal align-top font-medium">
                    حريق واحد انتشر
                  </TableCell>
                  <TableCell className="max-w-md whitespace-normal align-top leading-7 text-muted-foreground">
                    المسافات والفجوات والندبات المنفصلة لا تتوافق مع مسار متصل.
                  </TableCell>
                  <TableCell className="whitespace-normal align-top">مرفوضة · ثقة عالية</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="whitespace-normal align-top font-medium">
                    اشتعالات مستقلة متعددة
                  </TableCell>
                  <TableCell className="max-w-md whitespace-normal align-top leading-7 text-muted-foreground">
                    تتوافق مع القياس الحراري والندبات والخلفية الوطنية خلال موجة الطقس.
                  </TableCell>
                  <TableCell className="whitespace-normal align-top">الأبسط تفسيراً</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="whitespace-normal align-top font-medium">
                    فعل منسّق
                  </TableCell>
                  <TableCell className="max-w-md whitespace-normal align-top leading-7 text-muted-foreground">
                    لا دليل إيجابياً عليه، لكن اختبار التزامن نفسه ضعيف القوة بسبب نوافذ الرصد العمياء.
                  </TableCell>
                  <TableCell className="whitespace-normal align-top">غير قابل للحسم</TableCell>
                </TableRow>
              </TableBody>
            </Table>
            <p className="mt-5 text-sm leading-7 text-muted-foreground">
              يعرض الجدول بنية الحدث، لا سبب كل اشتعال مفرد. لا توجد نتيجة
              ميدانية أو قضائية منشورة تحسم السبب حتى تاريخ التقرير.
            </p>
          </div>
        </div>
      </section>

      <section id="limits" className="scroll-mt-24">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-12 lg:px-8 lg:py-20">
          <div className="lg:col-span-3">
            <p className="numeric text-xs text-muted-foreground">06 / 06</p>
            <h2 className="mt-3 text-2xl font-semibold">حدود الاستنتاج</h2>
          </div>
          <div className="lg:col-span-8 lg:col-start-5">
            <p className="text-3xl font-semibold leading-snug tracking-tight">
              يمكن ترجيح السبب البشري بالمعنى العام. لا يمكن تحديد العمد، ولا
              نسبة المسؤولية، ولا نفي عملية محترفة من هذه البيانات وحدها.
            </p>
            <div className="mt-9 grid gap-8 sm:grid-cols-2">
              <div>
                <h3 className="font-semibold">ما نعرفه</h3>
                <ul className="mt-4 flex list-disc flex-col gap-3 pe-5 leading-7 text-muted-foreground marker:text-foreground">
                  <li>تعددت مناطق المنشأ المرشحة.</li>
                  <li>كان الطقس المتطرف محرّك الاتساع.</li>
                  <li>البرق غير مرجح لبؤر جيجل الرئيسية.</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold">ما لا نعرفه</h3>
                <ul className="mt-4 flex list-disc flex-col gap-3 pe-5 leading-7 text-muted-foreground marker:text-foreground">
                  <li>لحظة الاشتعال الفعلية لكل بؤرة.</li>
                  <li>السبب المفرد: حادث، إهمال، أو عمد.</li>
                  <li>هوية أي فاعل أو مسؤولية جنائية.</li>
                </ul>
              </div>
            </div>
            <Separator className="my-9" />
            <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm">
              <Link
                href="/report"
                className="font-medium underline decoration-border underline-offset-8 hover:decoration-foreground"
              >
                انتقل إلى التقرير الكامل ←
              </Link>
              <Link
                href="/methodology"
                className="text-muted-foreground underline decoration-border underline-offset-8 hover:text-foreground hover:decoration-foreground"
              >
                راجع المنهجية
              </Link>
            </div>
          </div>
        </div>
      </section>
    </article>
  );
}
