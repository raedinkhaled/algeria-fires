import Link from "next/link";

import { SiteMark } from "@/components/site-mark";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[calc(100dvh-3rem)] max-w-7xl items-center px-4 py-10 sm:px-6 lg:px-8">
      <section className="max-w-2xl border-s-[3px] border-s-foreground ps-6">
        <div className="flex items-center gap-3 text-muted-foreground">
          <SiteMark size={28} />
          <span className="numeric text-sm">404</span>
        </div>
        <h1 className="mt-7 text-3xl font-semibold tracking-tight sm:text-4xl">
          هذه الصفحة غير موجودة
        </h1>
        <p className="mt-4 max-w-xl leading-8 text-muted-foreground">
          قد يكون الرابط غير صحيح أو أن المادة نُقلت إلى مسار آخر في التحقيق.
        </p>
        <Button asChild variant="outline" className="mt-7">
          <Link href="/">العودة إلى الملخص</Link>
        </Button>
      </section>
    </main>
  );
}
