import type { Metadata } from "next";

import { FireMap } from "@/components/fire-map";
import { StoryBreadcrumb } from "@/components/story-breadcrumb";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import activity from "@/public/generated/data/daily_activity.json";

export const metadata: Metadata = {
  title: "خريطة حرائق جيجل",
  description:
    "خريطة تفاعلية للرصد الحراري والبدايات المحتملة وشدة الاحتراق في حرائق جيجل خلال 23-29 أوت 2026.",
};

const activityDays = activity.days.map((day) => ({
  date: day.date,
  detections: day.detections,
}));

export default function MapPage() {
  return (
    <article>
      <header className="mx-auto max-w-7xl px-4 pb-5 pt-5 sm:px-6 sm:pb-6 sm:pt-7 lg:px-8">
        <StoryBreadcrumb current="الخريطة" />
        <div className="mt-5 grid gap-5 lg:grid-cols-12 lg:gap-6">
          <div className="order-2 flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted-foreground lg:order-1 lg:col-span-3 lg:block lg:text-sm lg:leading-6">
            <p className="font-medium text-foreground">المشهد الكامل</p>
            <p className="lg:mt-1">23-29 أوت 2026</p>
            <p className="lg:mt-1">ولاية جيجل وما حولها</p>
          </div>
          <div className="order-1 lg:order-2 lg:col-span-8 lg:col-start-5">
            <h1 className="text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
              أين ظهرت الحرائق، ومتى؟
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
              حرّك الزمن وقارن الرصد الحراري بالبدايات المحتملة وآثار الاحتراق.
              الخريطة تعرض ما هو منشور فعلاً، ولا ترسم حدوداً غير موجودة في
              البيانات.
            </p>
          </div>
        </div>
        <Alert className="mt-4 py-2.5 sm:mt-5">
          <AlertTitle>مراكز لا حدود</AlertTitle>
          <AlertDescription>
            نقاط المناطق المحترقة هي مراكز هندسية فقط. لا توجد مضلعات منشورة لحدود
            الندبات، لذلك لم نختلقها.
          </AlertDescription>
        </Alert>
      </header>

      <FireMap activity={activityDays} />
    </article>
  );
}
