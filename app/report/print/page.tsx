import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";

import { PrintControls } from "@/components/print-controls";
import { ReportMarkdown } from "@/components/report-markdown";
import { readReportDocument } from "@/lib/report-document";
import contentSummary from "@/public/generated/content-summary.json";

export const metadata: Metadata = {
  title: "نسخة الطباعة",
  description:
    "نسخة التقرير العربي الكامل المهيّأة للطباعة أو للحفظ بصيغة PDF من المتصفح.",
  robots: { index: false, follow: false },
};

const colophon = [
  { term: "الوثيقة", value: "إعادة بناء جنائي-جغرافي لحرائق ولاية جيجل" },
  { term: "الفترة المدروسة", value: "22-29 أوت 2026" },
  { term: "الرصد الحراري", value: `${contentSummary.reference_counts.hotspots.toLocaleString("en")} رصداً` },
  { term: "بؤر المنشأ المرشحة", value: `${contentSummary.reference_counts.origins}` },
  { term: "الندبات ≥ 100 هكتار", value: `${contentSummary.reference_counts.burn_patches}` },
  { term: "المصدر", value: "بيانات فضائية وجوية مفتوحة" },
];

export default async function ReportPrintPage() {
  const { title, source, chapters } = await readReportDocument();

  return (
    <article className="print-document mx-auto max-w-3xl px-4 pb-16 pt-6 sm:px-6">
      {/* useSearchParams يلزمه حدّ Suspense كي تبقى الصفحة ثابتة عند البناء. */}
      <Suspense fallback={null}>
        <PrintControls />
      </Suspense>

      <header className="border-b pb-8">
        <p className="text-[11px] font-medium text-muted-foreground">
          حرائق جيجل · أوت 2026
        </p>
        <h1 className="mt-4 text-3xl font-semibold leading-tight tracking-tight">
          {title}
        </h1>

        <dl className="mt-8 grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
          {colophon.map((row) => (
            <div key={row.term}>
              <dt className="text-[11px] text-muted-foreground">{row.term}</dt>
              <dd className="mt-0.5">{row.value}</dd>
            </div>
          ))}
        </dl>

        <p className="mt-8 border-s-2 ps-4 text-sm leading-7 text-muted-foreground">
          تحليل توثيقي مستقل مبني على مصادر مفتوحة. لا يحدّد مسؤولية جنائية، ولا
          يثبت إضراماً متعمداً، ولا يحلّ محل التحقيق الميداني الجاري.
        </p>
      </header>

      <nav
        aria-label="فهرس الفصول"
        className="border-b py-8"
        style={{ breakAfter: "page" }}
      >
        <p className="mb-4 text-[11px] font-medium text-muted-foreground">
          فهرس الفصول
        </p>
        <ol className="flex flex-col gap-1.5">
          {chapters.map((chapter, index) => (
            <li key={chapter} className="flex gap-3 text-sm leading-6">
              <span className="numeric shrink-0 text-muted-foreground">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span>{chapter}</span>
            </li>
          ))}
        </ol>
      </nav>

      <ReportMarkdown source={source} />

      <footer className="mt-12 border-t pt-6 text-xs leading-6 text-muted-foreground">
        <p>
          تحليل مستقل بمواد مفتوحة · لا يحل محل التحقيقات الرسمية · يمكن مشاركة المحتوى مع ذكر المصدر.
        </p>
        <p className="mt-1">
          سجلّ المصادر الكامل وحالة الوصول إلى كل مصدر منشوران على صفحة المصادر.
        </p>
      </footer>

      <p data-print-hide className="mt-10 text-sm">
        <Link href="/report" className="underline underline-offset-4">
          العودة إلى التقرير على الموقع
        </Link>
      </p>
    </article>
  );
}
