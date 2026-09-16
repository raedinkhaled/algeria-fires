"use client";

import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { PrinterIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

/**
 * شريط الطباعة: ورقة عميلة صغيرة تظهر على الشاشة فقط. المتصفح هو من يبني ملف
 * PDF من هذه الصفحة، فلا يُشحن ملف جاهز مع الموقع.
 *
 * تُفتح نافذة الطباعة تلقائياً فقط حين يأتي الزائر من زرّ «حفظ PDF» (‎?auto=1‎)،
 * لأن نافذة الطباعة نافذة حاجزة: فتحُها على من وصل إلى المسار مباشرةً يحجب
 * الصفحة قبل أن يراها.
 */
export function PrintControls() {
  const auto = useSearchParams().get("auto") === "1";
  const opened = useRef(false);

  useEffect(() => {
    if (!auto || opened.current) return;
    opened.current = true;

    // انتظار تحميل الخطوط: الطباعة قبلها تقيس أسطراً بخط بديل.
    const start = () => window.print();
    const fonts = document.fonts;
    if (fonts?.ready) {
      let cancelled = false;
      fonts.ready.then(() => {
        if (!cancelled) window.setTimeout(start, 250);
      });
      return () => {
        cancelled = true;
      };
    }

    const timer = window.setTimeout(start, 600);
    return () => window.clearTimeout(timer);
  }, [auto]);

  return (
    <div
      data-print-hide
      className="sticky top-16 z-30 -mx-4 mb-8 flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-border bg-background px-4 py-3 sm:-mx-6 sm:px-6"
    >
      <Button size="sm" variant="outline" onClick={() => window.print()}>
        <PrinterIcon data-icon="inline-start" />
        حفظ PDF أو طباعة
      </Button>
      <p className="text-[11px] leading-5 text-muted-foreground">
        اختر «حفظ بصيغة PDF» في وجهة الطباعة. الوثيقة مهيّأة لمقاس A4.
      </p>
    </div>
  );
}
