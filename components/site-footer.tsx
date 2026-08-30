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
  { label: "التقرير الكامل · PDF", href: "/generated/report/report_ar_compact.pdf", download: true },
  { label: "ملف Markdown", href: "/generated/documentation/report_ar.md", download: true },
  { label: "البيانات المعالجة", href: "/data" },
  { label: "المنهجية", href: "/methodology" },
];

const colophon = [
  { term: "آخر تحديث", value: "29.08.2026", mono: true },
  { term: "المراجعة", value: "4", mono: true },
  { term: "نافذة الرصد", value: "22–29.08.2026", mono: true },
  { term: "اللغة", value: "العربية" },
];

function ColumnHeading({ children }: { children: string }) {
  return (
    <p className="mb-3 text-[11px] font-medium text-muted-foreground">{children}</p>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
          <div className="sm:col-span-2 md:col-span-1">
            <div className="flex items-center gap-2">
              <SiteMark size={16} />
              <span className="text-sm font-semibold">حرائق جيجل</span>
            </div>
            <p className="mt-3 max-w-sm text-xs leading-6 text-muted-foreground">
              تحقيق توثيقي مستقل مبني على بيانات مفتوحة. لا يحدّد مسؤولية
              جنائية، ولا يثبت إضراماً متعمداً، ولا يحلّ محل التحقيق الميداني.
            </p>
            <p className="mt-3 flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground">
              <span className="ltr-embed">DS-01 – DS-11</span>
              <span aria-hidden="true">·</span>
              <span>مصادر مفتوحة</span>
            </p>
          </div>

          <div>
            <ColumnHeading>مصادر البيانات</ColumnHeading>
            <ul className="flex flex-col gap-2">
              {dataSources.map((source) => (
                <li key={source.label}>
                  <Link
                    href="/sources"
                    className="group flex items-baseline justify-between gap-3 text-xs text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <span className="ltr-embed">{source.label}</span>
                    <span className="text-[10px] opacity-70">{source.detail}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <ColumnHeading>الوثائق</ColumnHeading>
            <ul className="flex flex-col gap-2">
              {documents.map((doc) => (
                <li key={doc.label}>
                  {doc.download ? (
                    <a
                      href={doc.href}
                      download
                      className="text-xs text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {doc.label}
                    </a>
                  ) : (
                    <Link
                      href={doc.href}
                      className="text-xs text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {doc.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <ColumnHeading>معلومات النشر</ColumnHeading>
            <dl className="flex flex-col gap-2 text-xs text-muted-foreground">
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

        <div className="mt-9 flex flex-col gap-2 border-t pt-5 text-[11px] text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <span>بيانات فضائية مفتوحة · لا تمثل موقفاً رسمياً · استخدام حر مع الإسناد</span>
          <span className="ltr-embed">Jijel Wildfire Investigation · 36.72°N · 5.95°E</span>
        </div>
      </div>
    </footer>
  );
}
