import type { Metadata } from "next";

import {
  ChronologyDayBlock,
  ChronologySection,
  type DayMeasures,
} from "@/components/chronology";
import { EventCurve } from "@/components/chronology-chart";
import {
  ClaimBasis,
  ContinueLinks,
  DataFigure,
  Dossier,
  EdgePanel,
  IndexNav,
  Masthead,
  NightPanel,
  StatStrip,
} from "@/components/editorial";
import { DayNavigator } from "@/components/day-navigator";
import { Reveal } from "@/components/motion";
import { ThermalLegend, ThermalRecord } from "@/components/thermal-record";
import {
  IgnitionWindowTable,
  QualityLegend,
  type IgnitionWindow,
} from "@/components/timing-tables";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { chronologyDays, chronologySections } from "@/lib/chronology";
import type { FrpSlot } from "@/lib/thermal";
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
const peak = Math.max(...slots.map((slot) => slot.frp));
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


const dayAnchors = new Map(
  chronologyDays.map((day) => [Number(day.date.slice(-2)), `#${day.id}`]),
);

const thermalMarks = measured.map((origin) => ({
  origin_id: origin.origin_id,
  from: origin.last_clear_local ?? "",
  to: origin.first_detection_local ?? "",
}));

export default function ChronologyPage() {
  return (
    <article className="publication mx-auto max-w-7xl px-4 pb-16 pt-6 sm:px-6 lg:px-8">
      <Masthead
        current="التسلسل الزمني"
        file="01"
        kicker="مسار الحدث"
        title="ماذا حدث، يوماً بيوم"
        lede="من 22 أوت، حين لم تكن في الولاية نار، إلى 29 أوت حين استقر الوضع. هنا نرتب ما حدث يوماً بيوم: ما رآه القمر، ومتى رآه، وما لا يستطيع أن يراه."
        meta={fileMeta}
        panel={
          <NightPanel label="سجلّ الحرارة" meta="21-30.08.2026">
            <StatStrip className="border-t-0 sm:grid-cols-2" items={stats} />
            <div className="mt-auto border-t border-border px-5 pb-5 pt-4">
              <ThermalRecord
                trackClassName="h-24"
                slots={slots}
                marks={thermalMarks}
                dayHref={(day) => dayAnchors.get(day)}
                label="قوة النار كل 15 دقيقة من القمر الثابت بين 21 و30 أوت 2026."
              />
              <ThermalLegend className="mt-3" />
            </div>
          </NightPanel>
        }
      />

      <Alert className="mt-10 max-w-3xl">
        <AlertTitle>أول رصد ليس لحظة الاشتعال</AlertTitle>
        <AlertDescription>
          الأقمار القطبية تمرّ مرّتين إلى أربع مرّات في اليوم، فبين الاشتعال
          وأول رصد فجوة قد تبلغ ساعات أو أياماً. القمر الثابت يصوّر كل 15
          دقيقة، ولهذا عرفنا وقت بداية {measured.length} بؤر ضمن فترة لا
          تتجاوز 15 دقيقة. أما البؤر الأخرى فنعرف فقط أنها بدأت قبل أول
          رصد لها، لا الوقت الدقيق.
        </AlertDescription>
      </Alert>

      <Dossier
        index={chronologySections}
        indexHeading="الأقسام"
        indexLabel="أقسام التسلسل الزمني"
        aside={
          <IndexNav
            heading="الأيام"
            label="الأيام"
            items={chronologyDays.map((day) => ({
              id: day.id,
              index: day.date.slice(-2),
              label: day.headline,
            }))}
          />
        }
      >
        <Reveal>
          <ChronologySection id="arc" index="01" label="مسار الحدث">
            <p className="mt-8 max-w-2xl text-[19px] leading-[1.95]">
              بدأت ثلاث حرائق صغيرة ليلاً خارج جيجل، ثم ظهر أول حريق داخل
              الولاية يوم 24 أوت. لم يكبر الحريق خطوة خطوة: حدث التحول خلال
              ساعات يوم 26 أوت، مع حرارة تتجاوز 44 درجة ورطوبة 8٪ ورياح أقوى،
              ومع ظهور ثلاث بدايات جديدة متباعدة ومستقلة تماماً في اليوم نفسه،
              مما يعكس نمطاً تصعيدياً متزامناً للاشتعال.
            </p>
          </ChronologySection>
        </Reveal>

        <ChronologySection id="days" index="02" label="يوماً بيوم" className="mt-24">
          <p className="mt-6 max-w-2xl text-[13px] leading-7 text-muted-foreground">
            الأرقام الجانبية من بيانات الرصد المنشورة. وقيم الطقس تقدير ساعي
            للطقس عند بداية حريق الشقفة، وليست متوسطاً للطقس في كل الولاية.
          </p>
          <div className="mt-8">
            <DayNavigator
              days={chronologyDays.map((day) => ({
                id: day.id,
                day: day.date.slice(-2),
                headline: day.headline,
                detections: measuresByDate.get(day.date)?.detections ?? 0,
              }))}
            />
            <div className="mt-12">
              {chronologyDays.map((day) => (
                <ChronologyDayBlock
                  key={day.id}
                  day={day}
                  measures={measuresByDate.get(day.date)}
                  slots={slots}
                  peak={peak}
                />
              ))}
            </div>
          </div>
        </ChronologySection>

        <Reveal className="mt-24">
          <ChronologySection id="ignitions" index="03" label="لحظات البداية">
            <p className="mt-6 max-w-2xl text-[16px] leading-8">
              لكل بداية حريق فترة محتملة: من آخر صورة كان فيها الموقع بلا نار
              إلى أول صورة ظهرت فيها النار. في ست حالات صارت هذه الفترة 15
              دقيقة فقط. وفي أربع حالات لم يرَ القمر الثابت النار لأنها كانت
              ضعيفة، لذلك بقي وقت البداية غير معروف بدقة.
            </p>

            <div className="mt-10">
              <IgnitionWindowTable rows={origins} />
              <QualityLegend />
            </div>

            <EdgePanel className="mt-12 max-w-3xl" tone="info" label="اللحظة الأهم في الملف">
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

        <Reveal className="mt-24">
          <ChronologySection id="curve" index="04" label="منحنى كل 15 دقيقة">
            <p className="mt-6 max-w-2xl text-[16px] leading-8">
              يبيّن هذا الرسم ما رآه القمر الثابت من 21 إلى 30 أوت، كل 15
              دقيقة. ترتفع قوة النار عادة بعد الظهر وتهدأ ليلاً، ثم تظهر قفزة
              كبيرة يومي 26 و27 أوت لا تشبه الأيام السابقة.
            </p>

            <DataFigure
              className="mt-10"
              sensor="MSG/SEVIRI · FRP-PIXEL"
              meta="LSA SAF · 21-30.08.2026"
              caption="الخطوط الرأسية المتقطّعة تبيّن آخر صورة كان فيها الموقع بلا نار قبل كل بداية حُدّد وقتها. الفارق بينها وبين أول صورة للنار لا يتجاوز 15 دقيقة."
            >
              <EventCurve slots={slots} marks={marks} />
            </DataFigure>
          </ChronologySection>
        </Reveal>

        <Reveal className="mt-24">
          <ChronologySection id="limits" index="05" label="ما لا نعرفه من هذا التسلسل">
            <EdgePanel className="mt-8 max-w-3xl" label="الرصد الفضائي والتحقيق الجنائي">
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

        <ContinueLinks
          className="mt-20 max-w-4xl"
          label="روابط متابعة"
          links={[
            {
              href: "/investigation",
              index: "02",
              title: "كيف عرفنا أن السبب ليس طبيعياً؟",
              summary: "الأدلة خطوة بخطوة، من أول إشارة إلى ما لا نعرفه بعد.",
            },
            {
              href: "/map",
              index: "03",
              title: "شاهد أين ظهرت البؤر",
              summary: "خريطة تفاعلية لما رآه القمر، وبدايات الحرائق، والأرض التي احترقت.",
            },
          ]}
        />
      </Dossier>
    </article>
  );
}
