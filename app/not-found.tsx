import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";

import { Kicker } from "@/components/editorial";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[calc(100dvh-4rem)] max-w-7xl flex-col justify-center px-4 py-16 sm:px-6 lg:px-8">
      <div className="grid gap-10 border-t border-rule pt-10 lg:grid-cols-12">
        <p
          aria-hidden="true"
          className="figure-num text-[clamp(6rem,18vw,13rem)] font-light leading-none text-muted-foreground lg:col-span-5"
        >
          404
        </p>
        <section className="lg:col-span-7 lg:self-end">
          <Kicker>
            <span className="numeric">404</span>
          </Kicker>
          <h1 className="mt-5 text-[clamp(2rem,4vw,3.25rem)] font-semibold leading-[1.3]">
            هذه الصفحة غير موجودة
          </h1>
          <p className="mt-5 max-w-xl text-[17px] leading-9 text-muted-foreground">
            قد يكون الرابط غير صحيح أو أن المادة نُقلت إلى مسار آخر في التحقيق.
          </p>
          <Button asChild size="lg" className="mt-8 h-11 px-5">
            <Link href="/">
              العودة إلى الملخص
              <ArrowLeftIcon data-icon="inline-end" />
            </Link>
          </Button>
        </section>
      </div>
    </div>
  );
}
