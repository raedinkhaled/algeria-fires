import Link from "next/link";

import { Separator } from "@/components/ui/separator";

const colophonLinks = [
  { href: "/methodology", label: "المنهجية" },
  { href: "/sources", label: "سجل المصادر" },
  { href: "/data", label: "تنزيل البيانات" },
];

export function SiteFooter() {
  return (
    <footer className="border-t bg-muted/45">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-12 lg:px-8">
        <div className="md:col-span-7">
          <p className="font-semibold">
            حرائق جيجل — إعادة بناء بالبيانات المفتوحة
          </p>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">
            تحليل توثيقي مستقل. لا يحدّد مسؤولية جنائية ولا يثبت إضراماً
            متعمداً، ولا يغني عن التحقيق الميداني الرسمي.
          </p>
        </div>

        <nav
          aria-label="روابط التذييل"
          className="flex flex-wrap content-start gap-x-6 gap-y-3 text-sm md:col-span-5 md:justify-end"
        >
          {colophonLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <Separator className="md:col-span-12" />

        <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground md:col-span-12 md:justify-between">
          <p>تُعرض الأرقام بالصيغة الغربية 0–9 لتسهيل المراجعة والنسخ.</p>
          <p className="ltr-embed">Jijel · 36.72°N · 5.95°E</p>
        </div>
      </div>
    </footer>
  );
}
