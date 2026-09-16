import type { Metadata } from "next";
import Link from "next/link";

import { Masthead, NightPanel, SectionLabel } from "@/components/editorial";
import { FireMap } from "@/components/fire-map";
import { Reveal } from "@/components/motion";
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

const maxDetections = Math.max(...activityDays.map((day) => day.detections));

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
    <article className="publication mx-auto max-w-7xl px-4 pb-16 pt-6 sm:px-6 lg:px-8">
      <Masthead
        current="الخريطة"
        file="03"
        kicker="المشهد المكاني"
        title="أين ظهرت الحرائق، ومتى؟"
        lede="حرّك شريط الزمن وقارن الرصد الحراري بالبدايات المحتملة وآثار الاحتراق يوماً بيوم. الخريطة تعرض ما هو منشور فقط، ولا ترسم هندسات غير موجودة في البيانات."
        meta={fileMeta}
        panel={
          <NightPanel label="لوحة الطبقات" meta="23-29.08.2026">
            <dl className="grid grid-cols-2 gap-px bg-border sm:grid-cols-3">
              {mapLayers.map((layer) => (
                <div key={layer.id} className="flex flex-col-reverse justify-end bg-background px-4 py-4">
                  <dt className="mt-2 text-[12px] leading-5 text-muted-foreground">{layer.label}</dt>
                  <dd className="figure-num text-[1.875rem] font-light leading-none">
                    {layer.count ?? "—"}
                  </dd>
                </div>
              ))}
              <div className="bg-background" aria-hidden="true" />
            </dl>
            <div className="mt-auto border-t border-border px-5 pb-5 pt-4">
              <p className="text-[12px] font-medium">الرصد الحراري في اليوم</p>
              <ol className="mt-4 grid h-28 grid-cols-7 items-end gap-2" dir="ltr">
                {activityDays.map((day) => (
                  <li key={day.date} className="flex h-full flex-col justify-end gap-1.5">
                    <span className="numeric text-center text-[10px] text-muted-foreground">
                      {day.detections.toLocaleString("en")}
                    </span>
                    <span
                      aria-hidden="true"
                      className="bg-signal"
                      style={{ height: `${Math.max(3, (day.detections / maxDetections) * 70)}%` }}
                    />
                    <span className="numeric text-center text-[10.5px]">{day.date.slice(-2)}</span>
                  </li>
                ))}
              </ol>
            </div>
          </NightPanel>
        }
      />

      <div className="mt-10 grid gap-x-12 gap-y-6 lg:grid-cols-12">
        <p className="text-[15px] leading-8 text-muted-foreground lg:col-span-7">
          وموضع البؤرة على الخريطة هو أول ما رآه قمر قطبي، لا لحظة الاشتعال.
          أما متى بدأت كل بؤرة فعلاً فقد قاسه القمر الثابت لست منها بدقّة ربع
          ساعة:{" "}
          <Link
            href="/chronology#ignitions"
            className="text-foreground underline decoration-border underline-offset-4 hover:decoration-foreground"
          >
            سجل لحظات البداية
          </Link>
          .
        </p>
        <Alert className="lg:col-span-5">
          <AlertTitle>مراكز لا حدود</AlertTitle>
          <AlertDescription>
            نقاط المناطق المحترقة هي مراكز هندسية فقط. لا توجد مضلعات منشورة
            لحدود الندبات، لذلك لم نختلقها.
          </AlertDescription>
        </Alert>
      </div>

      <section aria-labelledby="interactive-map" className="mt-12">
        <h2 id="interactive-map" className="sr-only">
          الخريطة التفاعلية
        </h2>
        <FireMap activity={activityDays} />
      </section>

      <Reveal className="mt-20">
        <SectionLabel>دليل الطبقات</SectionLabel>
        <dl className="mt-8 grid border-t border-rule sm:grid-cols-2 lg:grid-cols-5">
          {mapLayers.map((layer) => (
            <div
              key={layer.id}
              className="flex flex-col-reverse justify-end border-b border-border py-5 sm:pe-6 lg:border-b-0 lg:border-s lg:ps-6 lg:first:border-s-0 lg:first:ps-0"
            >
              <dd className="mt-2 text-[13px] leading-7 text-muted-foreground">
                {layer.note}
              </dd>
              <dt>
                <span className="figure-num block text-[2.5rem] font-light leading-none">
                  {layer.count ?? "—"}
                </span>
                <span className="mt-3 block text-[15px] font-semibold">{layer.label}</span>
              </dt>
            </div>
          ))}
        </dl>
      </Reveal>
    </article>
  );
}
