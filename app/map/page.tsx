import type { Metadata } from "next";
import Link from "next/link";

import { FileMeta, SectionLabel } from "@/components/editorial";
import { FireMap } from "@/components/fire-map";
import { Reveal } from "@/components/motion";
import { StoryBreadcrumb } from "@/components/story-breadcrumb";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { mapLayers } from "@/lib/map-layers";
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

const fileMeta = [
  { term: "القسم", value: "الخريطة" },
  { term: "المنطقة", value: "ولاية جيجل وما حولها" },
  { term: "الإطار", value: "36.72°N · 5.95°E", mono: true },
  { term: "الفترة", value: "23-29.08.2026", mono: true },
  { term: "المصادر", value: "VIIRS · MODIS · S2", mono: true },
  { term: "الطبقات", value: "5", mono: true },
];

export default function MapPage() {
  return (
    <article className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <StoryBreadcrumb current="الخريطة" />

      <div className="mt-10 grid gap-8 lg:grid-cols-[220px_1fr] lg:gap-14">
        <aside className="order-2 border-t pt-6 lg:sticky lg:top-14 lg:order-1 lg:self-start lg:border-t-0 lg:border-e lg:pe-8 lg:pt-0">
          <FileMeta heading="بيانات الملف" rows={fileMeta} />
        </aside>

        <div className="order-1 min-w-0 lg:order-2">
          <p className="text-[11px] font-medium text-muted-foreground">
            المشهد المكاني
          </p>
          <h1 className="mt-4 max-w-2xl text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
            أين ظهرت الحرائق، ومتى؟
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-9">
            حرّك شريط الزمن وقارن الرصد الحراري بالبدايات المحتملة وآثار الاحتراق
            يوماً بيوم. الخريطة تعرض ما هو منشور فقط، ولا ترسم هندسات غير موجودة في
            البيانات.
          </p>

          <p className="mt-4 max-w-2xl leading-8 text-muted-foreground">
            وموضع البؤرة على الخريطة هو أول ما رآه قمر قطبي، لا لحظة الاشتعال.
            أما متى بدأت كل بؤرة فعلاً فقد قاسه القمر الثابت لست منها بدقّة ربع
            ساعة:{" "}
            <Link
              href="/chronology#ignitions"
              className="underline decoration-border underline-offset-4 hover:decoration-foreground"
            >
              سجل لحظات البداية
            </Link>
            .
          </p>

          <Alert className="mt-6 max-w-2xl">
            <AlertTitle>مراكز لا حدود</AlertTitle>
            <AlertDescription>
              نقاط المناطق المحترقة هي مراكز هندسية فقط. لا توجد مضلعات منشورة
              لحدود الندبات، لذلك لم نختلقها.
            </AlertDescription>
          </Alert>

          <div className="mt-10">
            <SectionLabel>الخريطة التفاعلية</SectionLabel>
            <FireMap className="mt-4" activity={activityDays} />
          </div>

          <Reveal className="mt-12">
            <SectionLabel>دليل الطبقات</SectionLabel>
            <dl className="mt-4 divide-y border">
              {mapLayers.map((layer) => (
                <div key={layer.id} className="px-4 py-3.5">
                  <dt className="flex items-baseline gap-2.5">
                    {layer.count ? (
                      <span className="numeric text-sm text-muted-foreground">
                        {layer.count}
                      </span>
                    ) : null}
                    <span className="text-sm font-medium">{layer.label}</span>
                  </dt>
                  <dd className="mt-1 max-w-2xl text-[13px] leading-6 text-muted-foreground">
                    {layer.note}
                  </dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
      </div>
    </article>
  );
}
