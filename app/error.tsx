"use client";

import { useEffect } from "react";
import Link from "next/link";

import { SiteMark } from "@/components/site-mark";
import { Button } from "@/components/ui/button";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto flex min-h-[calc(100dvh-3rem)] max-w-7xl items-center px-4 py-10 sm:px-6 lg:px-8">
      <section className="max-w-2xl border-s-[3px] border-s-destructive ps-6">
        <div className="flex items-center gap-3 text-muted-foreground">
          <SiteMark size={28} />
          <span className="text-sm">تعذّر عرض هذه المادة</span>
        </div>
        <h1 className="mt-7 text-3xl font-semibold tracking-tight sm:text-4xl">
          حدث خلل أثناء تحميل الصفحة
        </h1>
        <p className="mt-4 max-w-xl leading-8 text-muted-foreground">
          أعد المحاولة. إن استمر الخلل، ابدأ من الملخص أو عد لاحقاً بعد تحديث
          البيانات المنشورة.
        </p>
        <div className="mt-7 flex flex-wrap gap-2">
          <Button type="button" variant="outline" onClick={reset}>
            إعادة المحاولة
          </Button>
          <Button asChild variant="ghost">
            <Link href="/">العودة إلى الملخص</Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
