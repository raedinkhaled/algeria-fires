import type { Metadata } from "next";
import Link from "next/link";

import {
  ChronologyDayBlock,
  ChronologySection,
  type DayMeasures,
} from "@/components/chronology";
import {
  IgnitionWindowTable,
  QualityLegend,
  type IgnitionWindow,
} from "@/components/timing-tables";
import { EventCurve, type FrpSlot } from "@/components/chronology-chart";
import {
  ClaimBasis,
  DataFigure,
  EdgePanel,
  FileMeta,
  StatStrip,
} from "@/components/editorial";
import { Reveal } from "@/components/motion";
import { StoryBreadcrumb } from "@/components/story-breadcrumb";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { chronologyDays, chronologySections } from "@/lib/chronology";
import dailyActivity from "@/public/generated/data/daily_activity.json";
import forensicSummary from "@/public/generated/data/forensic-summary.json";
import frpSeries from "@/public/generated/data/msg-frp-series.json";
import ignitionWindows from "@/public/generated/data/msg-ignition-windows.json";

export const metadata: Metadata = {
  title: "ماذا حدث، يوماً بيوم",
  description:
    "التسلسل الزمني لحرائق جيجل من 22 إلى 29 أوت 2026: أول بؤرة، وأوقات بداية عرفناها بدقة 15 دقيقة من القمر الثابت، ثم يوم الانفجار والانحسار.",
};

const origins = ignitionWindows.origins as IgnitionWindow[];
const slots = frpSeries.slots as FrpSlot[];
const measured = origins.filter((origin) => origin.quality === "clean");

const measuresByDate = new Map<string, DayMeasures>(
  dailyActivity.days.map((day) => [day.date, day as DayMeasures]),
);

const marks = measured.map((origin) => ({
  origin_id: origin.origin_id,
  at: origin.last_clear_local ?? "",
  place: origin.locality ?? origin.daira ?? "",
}));

const fileMeta = [
  { term: "القسم", value: "التسلسل الزمني" },
  { term: "الفترة", value: "22-29.08.2026", mono: true },
  { term: "التوقيت", value: "محلي · ت.ع.م+1", mono: true },
  { term: "المصادر", value: "DS-01 · DS-05b · ME", mono: true },
];

const stats = [
  { value: `${dailyActivity.days.length}`, unit: "أيام من أول بؤرة إلى الاستقرار" },
  { value: `${origins.length}`, unit: "بداية حريق محتملة" },
  { value: `${measured.length}`, unit: "بدايات حُدّد وقتها خلال 15 دقيقة" },
  {
    value: `${forensicSummary.msg.origins_invisible_to_msg}`,
    unit: "بؤر أضعف من أن يراها القمر الثابت",
  },
];

export default function ChronologyPage() {
  return (
    <article className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <StoryBreadcrumb current="التسلسل الزمني" />

      <div className="mt-10 grid gap-x-8 gap-y-10 lg:grid-cols-[190px_minmax(0,48rem)] lg:justify-center lg:gap-x-16">
        <aside className="order-2 border-t pt-6 lg:sticky lg:top-16 lg:order-1 lg:self-start lg:border-t-0 lg:border-e lg:pe-8 lg:pt-0">
          <FileMeta heading="بيانات الملف" rows={fileMeta} />

          <nav
            aria-label="أقسام التسلسل الزمني"
            className="mt-8 hidden border-t pt-5 lg:block"
          >
            <p className="mb-3 text-[11px] font-medium text-muted-foreground">
              الأقسام
            </p>
            <ol className="flex flex-col gap-2">
              {chronologySections.map((section) => (
                <li key={section.id}>
                  <a
                    href={`#${section.id}`}
                    className="flex gap-2.5 text-[11px] text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <span className="numeric">{section.index}</span>
                    <span>{section.label}</span>
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          <nav
            aria-label="الأيام"
            className="mt-8 hidden border-t pt-5 lg:block"
          >
            <p className="mb-3 text-[11px] font-medium text-muted-foreground">
              الأيام
            </p>
            <ol className="flex flex-col gap-2">
              {chronologyDays.map((day) => (
                <li key={day.id}>
                  <a
                    href={`#${day.id}`}
                    className="flex gap-2.5 text-[11px] text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <span className="numeric">{day.date.slice(-2)}</span>
                    <span className="truncate">{day.headline}</span>
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        </aside>

        <div className="order-1 min-w-0 lg:order-2">
          <p className="text-[11px] font-medium text-muted-foreground">
            مسار الحدث
          </p>
          <h1 className="mt-4 max-w-3xl text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
            ماذا حدث، يوماً بيوم
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-9 text-muted-foreground">
            من 22 أوت، حين لم تكن في الولاية نار، إلى 29 أوت حين استقر الوضع.
            هنا نرتب ما حدث يوماً بيوم: ما رآه القمر، ومتى رآه، وما لا يستطيع
            أن يراه.
          </p>

          <Alert className="mt-8 max-w-2xl">
            <AlertTitle>أول رصد ليس لحظة الاشتعال</AlertTitle>
            <AlertDescription>
              الأقمار القطبية تمرّ مرّتين إلى أربع مرّات في اليوم، فبين الاشتعال
              وأول رصد فجوة قد تبلغ ساعات أو أياماً. القمر الثابت يصوّر كل 15
              دقيقة، ولهذا عرفنا وقت بداية {measured.length} بؤر ضمن فترة لا
              تتجاوز 15 دقيقة. أما البؤر الأخرى فنعرف فقط أنها بدأت قبل أول
              رصد لها، لا الوقت الدقيق.
            </AlertDescription>
          </Alert>

          <Reveal className="mt-12">
            <ChronologySection id="arc" index="01" label="مسار الحدث">
              <StatStrip className="mt-4" items={stats} />
              <p className="mt-6 max-w-2xl leading-8">
                بدأت ثلاث حرائق صغيرة ليلاً خارج جيجل، ثم ظهر أول حريق داخل
                الولاية يوم 24 أوت. لم يكبر الحريق خطوة خطوة: حدث التحول خلال
                ساعات يوم 26 أوت، مع حرارة تتجاوز 44 درجة ورطوبة 8٪ ورياح أقوى،
                ومع ظهور ثلاث بدايات جديدة متباعدة ومستقلة تماماً في اليوم نفسه،
                مما يعكس نمطاً تصعيدياً متزامناً للاشتعال.
              </p>
            </ChronologySection>
          </Reveal>

          <Reveal className="mt-14">
            <ChronologySection id="days" index="02" label="يوماً بيوم">
              <div className="mt-6">
                {chronologyDays.map((day) => (
                  <ChronologyDayBlock
                    key={day.id}
                    day={day}
                    measures={measuresByDate.get(day.date)}
                  />
                ))}
              </div>
              <p className="mt-4 text-[11px] leading-5 text-muted-foreground">
                الأرقام الجانبية من بيانات الرصد المنشورة. وقيم الطقس تقدير ساعي
                للطقس عند بداية حريق الشقفة، وليست متوسطاً للطقس في كل الولاية.
              </p>
            </ChronologySection>
          </Reveal>

          <Reveal className="mt-16">
            <ChronologySection id="ignitions" index="03" label="لحظات البداية">
              <p className="mt-4 max-w-2xl leading-8">
                لكل بداية حريق فترة محتملة: من آخر صورة كان فيها الموقع بلا نار
                إلى أول صورة ظهرت فيها النار. في ست حالات صارت هذه الفترة 15
                دقيقة فقط. وفي أربع حالات لم يرَ القمر الثابت النار لأنها كانت
                ضعيفة، لذلك بقي وقت البداية غير معروف بدقة.
              </p>

              <div className="mt-6">
                <IgnitionWindowTable rows={origins} />
                <QualityLegend />
              </div>

              <EdgePanel className="mt-8 max-w-2xl" label="اللحظة الأهم في الملف">
                <p className="leading-8">
                  يوم 26 أوت رأى القمر الثابت موقع تاكسنة خالياً من النار في كل
                  شريحة ربع ساعة من 07:30 إلى 12:25 — خمس ساعات متصلة بلا سحاب —
                  ثم رأى فيه ناراً بقوة 294 ميغاواط. وبعد إحدى عشرة دقيقة اشتعل
                  موقع ثانٍ في ترعي باينان على بعد{" "}
                  <span className="numeric">27.1</span> كم. والطريق بينهما{" "}
                  <span className="numeric">{forensicSummary.msg.road_km}</span>{" "}
                  كم يستغرق{" "}
                  <span className="numeric">
                    {forensicSummary.msg.transit_minutes}
                  </span>{" "}
                  دقيقة على أفضل تقدير.
                </p>
                <p className="mt-4 leading-8">
                  لا يمكن لنقطة نار واحدة أن تفسر بداية الموقعين. وتظهر صور
                  Sentinel-2 منطقتين منفصلتين احترقتا، بينهما نباتات لم تحترق؛
                  لذلك يُستبعد كلياً أن النار انتقلت من موقع إلى الآخر بشكل طبيعي.
                  النتيجة: هناك <strong className="font-semibold">مصدرَي اشتعال
                    مستقلين تماماً وفي وقت متقارب جداً</strong> — وهو ما يطرح بقوة
                  احتمالية التزامن المتعمّد.
                </p>
                <ClaimBasis
                  level={3}
                  confidence="عالية"
                  sources="الفصل 15.6 · الفصل 15.7 · DS-05b"
                  sourcesHref="/report"
                />
              </EdgePanel>
            </ChronologySection>
          </Reveal>

          <Reveal className="mt-16">
            <ChronologySection id="curve" index="04" label="منحنى كل 15 دقيقة">
              <p className="mt-4 max-w-2xl leading-8">
                يبيّن هذا الرسم ما رآه القمر الثابت من 21 إلى 30 أوت، كل 15
                دقيقة. ترتفع قوة النار عادة بعد الظهر وتهدأ ليلاً، ثم تظهر قفزة
                كبيرة يومي 26 و27 أوت لا تشبه الأيام السابقة.
              </p>

              <DataFigure
                className="mt-6"
                sensor="MSG/SEVIRI · FRP-PIXEL"
                meta="LSA SAF · 21-30.08.2026"
                caption="الخطوط الرأسية المتقطّعة تبيّن آخر صورة كان فيها الموقع بلا نار قبل كل بداية حُدّد وقتها. الفارق بينها وبين أول صورة للنار لا يتجاوز 15 دقيقة."
              >
                <EventCurve slots={slots} marks={marks} />
              </DataFigure>
            </ChronologySection>
          </Reveal>

          <Reveal className="mt-16">
            <ChronologySection id="limits" index="05" label="ما لا نعرفه من هذا التسلسل">
              <EdgePanel className="mt-4 max-w-2xl" label="الرصد الفضائي والتحقيق الجنائي">
                <p className="leading-8">
                  البيانات الفضائية ترصد النتيجة الحرارية بدقة عالية لكنها لا تصور الفاعل.
                  غير أن التزامن الدقيق لبدايات متباعدة في ذروة الطقس القاسي يمثل نمطاً استثنائياً،
                  حيث يعجز التفسير العشوائي عن تبرير هذا التطابق الدقيق. تحديد طبيعة هذا التنسيق المريب
                  هو مهمة التحقيق الأمني والميداني.
                </p>
                <p className="mt-4 leading-8">
                  ما يثبته هذا التسلسل بوضوح: النار لم تنتشر من نقطة واحدة، بل أُضرمت في نقاط منفصلة.
                  وأمام هذه المعطيات، يبرز التدخل البشري كسبب رئيسي وحتمي، وتُطرح فرضية الفعل المتعمد
                  أو المنسق كأولوية قصوى تتطلب تقاطعات استخباراتية لحسمها.
                </p>
              </EdgePanel>
            </ChronologySection>
          </Reveal>

          <nav
            aria-label="روابط متابعة"
            className="mt-14 flex flex-col divide-y border-y"
          >
            <Link
              href="/investigation"
              className="flex items-center justify-between gap-4 py-4 no-underline"
            >
              <span>
                <span className="text-sm font-medium">
                  كيف عرفنا أن السبب ليس طبيعياً؟
                </span>
                <span className="mt-1 block text-xs text-muted-foreground">
                  الأدلة خطوة بخطوة، من أول إشارة إلى ما لا نعرفه بعد.
                </span>
              </span>
              <span aria-hidden="true" className="text-muted-foreground">
                ←
              </span>
            </Link>
            <Link
              href="/map"
              className="flex items-center justify-between gap-4 py-4 no-underline"
            >
              <span>
                <span className="text-sm font-medium">
                  شاهد أين ظهرت البؤر
                </span>
                <span className="mt-1 block text-xs text-muted-foreground">
                  خريطة تفاعلية لما رآه القمر، وبدايات الحرائق، والأرض التي احترقت.
                </span>
              </span>
              <span aria-hidden="true" className="text-muted-foreground">
                ←
              </span>
            </Link>
          </nav>
        </div>
      </div>
    </article>
  );
}