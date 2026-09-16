"use client";

import { useEffect } from "react";
import Link from "next/link";

import { Kicker } from "@/components/editorial";
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
    <div className="mx-auto flex min-h-[calc(100dvh-4rem)] max-w-7xl flex-col justify-center px-4 py-16 sm:px-6 lg:px-8">
      <section className="max-w-3xl border-t-2 border-destructive pt-10">
        <Kicker className="text-destructive">تعذّر عرض هذه المادة</Kicker>
        <h1 className="mt-5 text-[clamp(2rem,4vw,3.25rem)] font-semibold leading-[1.3]">
          حدث خلل أثناء تحميل الصفحة
        </h1>
        <p className="mt-5 max-w-xl text-[17px] leading-9 text-muted-foreground">
          أعد المحاولة. إن استمر الخلل، ابدأ من الملخص أو عد لاحقاً بعد تحديث
          البيانات المنشورة.
        </p>
        <div className="mt-8 flex flex-wrap gap-2">
          <Button type="button" size="lg" className="h-11 px-5" onClick={reset}>
            إعادة المحاولة
          </Button>
          <Button asChild variant="outline" size="lg" className="h-11 px-5">
            <Link href="/">العودة إلى الملخص</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
