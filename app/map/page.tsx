import type { Metadata } from "next";

import { FireMap } from "@/components/fire-map";
import { StoryBreadcrumb } from "@/components/story-breadcrumb";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export const metadata: Metadata = {
  title: "خريطة حرائق جيجل",
  description: "خريطة تفاعلية للرصد الحراري والبدايات المحتملة وشدة الاحتراق في حرائق جيجل خلال 23-29 أوت 2026.",
};

export default function MapPage() {
  return (
    <article>
      <header className="mx-auto max-w-7xl px-4 pb-10 pt-8 sm:px-6 sm:pt-10 lg:px-8">
        <StoryBreadcrumb current="الخريطة" />
        <div className="mt-10 grid gap-8 lg:grid-cols-12">
          <div className="text-sm leading-6 text-muted-foreground lg:col-span-3">
            <p className="font-medium text-foreground">المشهد الكامل</p>
            <p className="mt-2">23-29 أوت 2026</p>
            <p className="mt-1">ولاية جيجل وما حولها</p>
          </div>
          <div className="lg:col-span-8 lg:col-start-5">
            <h1 className="text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">أين ظهرت الحرائق، ومتى؟</h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-muted-foreground">حرّك الزمن وقارن الرصد الحراري بالبدايات المحتملة وآثار الاحتراق. الخريطة تعرض ما هو منشور فعلاً، ولا ترسم حدوداً غير موجودة في البيانات.</p>
          </div>
        </div>
        <Alert className="mt-8">
          <AlertTitle>مراكز لا حدود</AlertTitle>
          <AlertDescription>نقاط المناطق المحترقة هي مراكز هندسية فقط. لا توجد مضلعات منشورة لحدود الندبات، لذلك لم نختلقها.</AlertDescription>
        </Alert>
      </header>

      <FireMap />
    </article>
  );
}
