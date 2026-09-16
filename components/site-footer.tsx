import Link from "next/link";

import { SiteMark } from "@/components/site-mark";

const dataSources = [
  { label: "VIIRS · 375m", detail: "NASA FIRMS" },
  { label: "MODIS · C6.1", detail: "Terra / Aqua" },
  { label: "Sentinel-2 · L2A", detail: "ESA Copernicus" },
  { label: "ERA5 · Open-Meteo", detail: "ECMWF" },
  { label: "ASOS / METAR", detail: "Iowa Mesonet" },
];

const documents = [
  { label: "التسلسل الزمني", href: "/chronology" },
  { label: "التقرير الكامل", href: "/report" },
  { label: "نسخة الطباعة · PDF", href: "/report/print" },
  { label: "البيانات المعالجة", href: "/data" },
  { label: "المنهجية", href: "/methodology" },
];

const colophon = [
  { term: "آخر تحديث", value: "31.08.2026", mono: true },
  { term: "نافذة الرصد", value: "22-29.08.2026", mono: true },
  { term: "المنطقة", value: "36.72°N · 5.95°E", mono: true },
  { term: "اللغة", value: "العربية" },
];

function ColumnHeading({ children }: { children: string }) {
  return (
    <p className="mb-4 border-b border-rule pb-2 text-[11px] font-medium">{children}</p>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer mt-8 border-t border-rule bg-background">
      <div className="mx-auto max-w-7xl px-4 pb-8 pt-14 sm:px-6 lg:px-8 lg:pt-20">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <div className="flex items-center gap-3">
              <SiteMark size={34} />
              <span className="text-[26px] font-semibold leading-none">حرائق جيجل</span>
            </div>
            <p className="mt-6 max-w-md text-[14px] leading-8 text-muted-foreground">
              تحقيق توثيقي مستقل مبني على بيانات مفتوحة. لا يحدّد مسؤولية
              جنائية، ولا يثبت إضراماً متعمداً، ولا يحلّ محل التحقيق الميداني.
            </p>
            <p className="mt-4 flex flex-wrap items-center gap-1.5 text-[11.5px] text-muted-foreground">
              <span className="ltr-embed text-foreground">DS-01 - DS-09</span>
              <span aria-hidden="true">·</span>
              <span>مصادر مفتوحة</span>
            </p>
          </div>

          <div className="grid gap-10 sm:grid-cols-3 lg:col-span-7">
            <div>
              <ColumnHeading>مصادر البيانات</ColumnHeading>
              <ul className="flex flex-col gap-2.5">
                {dataSources.map((source) => (
                  <li key={source.label}>
                    <Link
                      href="/sources"
                      className="group flex items-baseline justify-between gap-3 text-[12.5px] text-muted-foreground transition-colors hover:text-foreground"
                    >
                      <span className="ltr-embed">{source.label}</span>
                      <span className="text-[10.5px]">{source.detail}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <ColumnHeading>الوثائق</ColumnHeading>
              <ul className="flex flex-col gap-2.5">
                {documents.map((doc) => (
                  <li key={doc.label}>
                    <Link
                      href={doc.href}
                      className="text-[13px] text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {doc.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <ColumnHeading>معلومات النشر</ColumnHeading>
              <dl className="flex flex-col gap-2.5 text-[12.5px] text-muted-foreground">
                {colophon.map((row) => (
                  <div key={row.term} className="flex justify-between gap-3">
                    <dt>{row.term}</dt>
                    <dd className={row.mono ? "numeric text-foreground" : "text-foreground"}>
                      {row.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-2 border-t border-border pt-5 text-[11.5px] leading-6 text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <span>تحليل مستقل بمواد مفتوحة · لا يحل محل التحقيقات الرسمية · يمكن مشاركة المحتوى مع ذكر المصدر</span>
          <span className="ltr-embed">Jijel Wildfire Investigation · 36.72°N · 5.95°E</span>
        </div>
      </div>
    </footer>
  );
}
