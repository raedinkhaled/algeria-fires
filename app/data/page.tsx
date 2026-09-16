import type { Metadata } from "next";

import { DataExplorer, type OriginRow, type PatchRow } from "@/components/data-explorer";
import { Dossier, Masthead, NightPanel, SectionLabel } from "@/components/editorial";
import { FigureGallery } from "@/components/figure-gallery";
import { Reveal } from "@/components/motion";
import {
  IgnitionWindowTable,
  QualityLegend,
  SimultaneousPairsTable,
  type IgnitionWindow,
  type SimultaneousPair,
} from "@/components/timing-tables";
import { dataSections } from "@/lib/data-sections";
import { figures } from "@/lib/figures";
import { readCsvRows } from "@/lib/published-csv";
import activity from "@/public/generated/data/daily_activity.json";
import downloads from "@/public/generated/downloads.json";
import ignitionWindows from "@/public/generated/data/msg-ignition-windows.json";
import simultaneousPairs from "@/public/generated/data/msg-simultaneous-pairs.json";

export const metadata: Metadata = {
  title: "مستكشف بيانات حرائق جيجل",
  description:
    "رسوم وجداول قابلة للتصفية وتنزيلات للبيانات المعالجة المستخدمة في تحليل حرائق جيجل.",
};

const fileMeta = [
  { term: "القسم", value: "البيانات" },
  { term: "الفترة", value: "23-29.08.2026", mono: true },
  { term: "الرصدات", value: "9,100", mono: true },
  { term: "الخلايا", value: "4,451", mono: true },
  { term: "المنشأ", value: "12 مرشحاً" },
  { term: "قياس التوقيت", value: "MSG · 15 د", mono: true },
  { term: "الأشكال", value: `${figures.length} خريطة ورسماً` },
  { term: "التنسيقات", value: "CSV · JSON · ZIP", mono: true },
];

const bundle = downloads.artifacts.find((artifact) => artifact.media_type === "application/zip");
const files = downloads.artifacts.filter((artifact) => artifact.media_type !== "application/zip");
const totalRows = files.reduce((sum, artifact) => sum + ("rows" in artifact && artifact.rows ? artifact.rows : 0), 0);

export default async function DataPage() {
  const [origins, patches] = await Promise.all([
    readCsvRows<OriginRow>("independent_origins.csv"),
    readCsvRows<PatchRow>("burn_patches.csv"),
  ]);

  return (
    <article className="publication mx-auto max-w-7xl px-4 pb-16 pt-6 sm:px-6 lg:px-8">
      <Masthead
        current="البيانات"
        file="04"
        kicker="المستكشف"
        title="افحص البيانات المعالجة بنفسك"
        lede="هذه الرسوم والجداول تعيد عرض مجموعة التحليل المنشورة للندبات الكبرى وبؤر المنشأ المستقلة. كل نقطة حرارية هي رصد قمري يوثق بدقة موقع البؤر المنفصلة وتعددها."
        meta={fileMeta}
        panel={
          <NightPanel label="مخزن البيانات" meta="CSV · JSON · ZIP">
            <dl className="grid grid-cols-2 gap-px bg-border">
              <div className="flex flex-col-reverse justify-end bg-background px-5 py-4">
                <dt className="mt-2 text-[12px] text-muted-foreground">ملفاً معالجاً</dt>
                <dd className="figure-num text-[2.5rem] font-light leading-none">{files.length}</dd>
              </div>
              <div className="flex flex-col-reverse justify-end bg-background px-5 py-4">
                <dt className="mt-2 text-[12px] text-muted-foreground">صف في الجداول</dt>
                <dd className="figure-num text-[2.5rem] font-light leading-none">
                  {totalRows.toLocaleString("en")}
                </dd>
              </div>
            </dl>
            <ol className="flex-1 border-t border-border">
              {files.slice(0, 6).map((artifact) => (
                <li
                  key={artifact.path}
                  className="flex items-baseline justify-between gap-4 border-b border-border px-5 py-2.5 last:border-b-0"
                >
                  <span className="ltr-embed truncate text-[12px]">
                    {artifact.path.split("/").at(-1)}
                  </span>
                  <span className="shrink-0 text-[11px] text-muted-foreground">
                    {artifact.rows ? (
                      <>
                        <span className="numeric">{artifact.rows.toLocaleString("en")}</span>{" "}
                        <span className="font-sans">صف</span>
                      </>
                    ) : (
                      <span className="numeric">{`${(artifact.bytes / 1000).toFixed(1)} KB`}</span>
                    )}
                  </span>
                </li>
              ))}
            </ol>
            {bundle ? (
              <a
                href={bundle.path}
                download
                className="flex items-center justify-between gap-4 border-t border-border bg-signal px-5 py-3 text-[13px] font-medium text-black transition-colors hover:bg-signal/85"
              >
                <span>{bundle.description}</span>
                <span className="numeric text-[11px]">
                  ZIP · {(bundle.bytes / 1_000_000).toFixed(1)} MB
                </span>
              </a>
            ) : null}
          </NightPanel>
        }
      />

      <Dossier index={dataSections} indexHeading="الأقسام" indexLabel="أقسام الصفحة">
        <DataExplorer
          activity={activity.days}
          origins={origins}
          patches={patches}
          downloads={downloads.artifacts}
        >
          <Reveal>
            <section id="ignition-windows">
              <SectionLabel index="04">نوافذ الاشتعال</SectionLabel>
              <p className="mt-6 max-w-2xl text-[16px] leading-8">
                نافذة الاشتعال تمتدّ من آخر لحظة رأى فيها القمر الموقع خالياً من
                النار إلى أول لحظة رأى فيها ناراً. القمر الثابت{" "}
                <span className="ltr-embed">Meteosat-10</span> يصوّر كل 15 دقيقة،
                فقلّص هذه النافذة إلى ربع ساعة فقط في ست حالات، ما كشف عن تقارب
                زمني شديد لبدايات متباعدة جغرافياً، وضيّق الخناق على فرضيات الانتشار العشوائي.
              </p>
              <div className="mt-10">
                <IgnitionWindowTable rows={ignitionWindows.origins as IgnitionWindow[]} />
                <QualityLegend />
              </div>
              <p className="mt-4 max-w-3xl text-[12px] leading-6 text-muted-foreground">
                {ignitionWindows.note}
              </p>
            </section>
          </Reveal>

          <Reveal>
            <section id="pairs">
              <SectionLabel index="05">الأزواج المتقاربة</SectionLabel>
              <p className="mt-6 max-w-2xl text-[16px] leading-8">
                كل زوج من بؤر المنشأ بدأ خلال ثلاث ساعات من الآخر، مصحوباً بالمعطيات
                التي تحسم فيزيائياً إمكانية انتقال النار بينهما: المسافة، والاتجاه،
                وهندسة الرياح في تلك اللحظة. النار لا تنتقل عكس الريح أو خارج مدى جمراتها؛
                لذا فإن الاستحالة الفيزيائية لانتقالها تُثبت وجود مصادر إشعال مستقلة تماماً،
                مما يجعل التزامن الزمني بينها مؤشراً قوياً يستدعي التدقيق الأمني.
              </p>
              <div className="mt-10">
                <SimultaneousPairsTable
                  rows={simultaneousPairs.pairs as SimultaneousPair[]}
                />
              </div>
              <p className="mt-4 max-w-3xl text-[12px] leading-6 text-muted-foreground">
                {simultaneousPairs.note}
              </p>
            </section>
          </Reveal>

          <Reveal>
            <section id="figures">
              <SectionLabel index="06">الخرائط والأشكال</SectionLabel>
              <p className="mt-6 max-w-2xl text-[16px] leading-8">
                كل خرائط التحقيق وأشكاله البيانية ومنتجات Sentinel-2، بترتيب
                ملحقَي التقرير ووصفهما. الأصول مرسومة يدوياً بالعربية في مساحة
                التحقيق، وتُنشر هنا بنسخ محسّنة للعرض.
              </p>
              <FigureGallery />
              <p className="mt-8 text-[12px] leading-6 text-muted-foreground">
                {figures.length} شكلاً. جميع الخرائط بمرجع WGS84 مع سهم شمال
                ومقياس رسم ومفتاح وأختام زمنية، والإظلال التلّي من Copernicus DEM
                GLO-30.
              </p>
            </section>
          </Reveal>
        </DataExplorer>
      </Dossier>
    </article>
  );
}
