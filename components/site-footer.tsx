import Link from "next/link";

import { Separator } from "@/components/ui/separator";

const colophonLinks = [
  { href: "/report", label: "التقرير الكامل" },
  { href: "/methodology", label: "المنهجية" },
  { href: "/sources", label: "المصادر" },
  { href: "/data", label: "البيانات" },
];

export function SiteFooter() {
  return (
    <footer className="border-t">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-12">
          <div className="md:col-span-7">
            <p className="text-sm font-semibold">حرائق جيجل</p>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">
              تحقيق توثيقي مستقل مبني على بيانات مفتوحة. لا يحدّد مسؤولية
              جنائية، ولا يثبت إضراماً متعمداً، ولا يحلّ محل التحقيق الميداني.
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
        </div>

        <Separator className="my-8" />

        <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground md:justify-between">
          <p>المراجعة 4 · نافذة الرصد 22–29 أوت 2026</p>
          <p className="ltr-embed">Jijel · 36.72°N · 5.95°E</p>
        </div>
      </div>
    </footer>
  );
}
