// ينشر خرائط التحقيق وأشكاله البيانية ومنتجات Sentinel-2 من Fires/ إلى
// public/generated/media/figures بصيغة WebP محسّنة، ويكتب فهرساً لها في
// data/figures.json. الأوصاف منقولة حرفياً من ملحقَي التقرير أ وب.
//
// الأصول الخام تبلغ نحو 130 ميغابايت، وأكبرها تركيبات Sentinel-2 بحجم 27 م.ب
// للصورة الواحدة؛ لذلك تُصغَّر وتُحوَّل هنا بدل أن تُنسخ كما هي.

import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";

const root = process.cwd();
const fires = path.join(root, "Fires");
const output = path.join(root, "public", "generated");
const figuresDir = path.join(output, "media", "figures");

/** حدود التصغير: النص في الأشكال يجب أن يبقى مقروءاً عند التكبير. */
const PROFILES = {
  map: { maxWidth: 2200, quality: 80 },
  chart: { maxWidth: 2000, quality: 86 },
  satellite: { maxWidth: 2400, quality: 78 },
};

const GROUPS = {
  map: "الخرائط",
  chart: "الأشكال البيانية",
  satellite: "منتجات Sentinel-2",
};

const FIGURES = [
  // ── الملحق أ — الخرائط ──
  {
    id: "map-all-detections",
    source: "maps/MAP1_all_detections.png",
    group: "map",
    label: "خريطة 1",
    title: "كل البؤر الحرارية المرصودة",
    caption:
      "جميع البؤر الحرارية 22-29 أوت، ملوّنة بتاريخ أول رصد، وحجم الرمز يتناسب مع قوة الإشعاع الحراري.",
    sensor: "VIIRS · MODIS",
    chapter: "الملحق أ",
  },
  {
    id: "map-cluster-first-detections",
    source: "maps/MAP2_cluster_first_detections.png",
    group: "map",
    label: "خريطة 2",
    title: "أقدم بؤرة في كل تجمّع",
    caption: "أقدم بؤرة لكل تجمّع مستقل مرشّح.",
    sensor: "VIIRS · MODIS",
    chapter: "الفصل 6",
  },
  {
    id: "map-chronological-spread",
    source: "maps/MAP3_chronological_spread.png",
    group: "map",
    label: "خريطة 3",
    title: "تسلسل الانتشار في ست لوحات",
    caption: "التسلسل الزمني للانتشار في ست لوحات متتابعة.",
    sensor: "VIIRS · MODIS",
    chapter: "الفصل 5",
  },
  {
    id: "map-wind-vectors",
    source: "maps/MAP4_wind_vectors.png",
    group: "map",
    label: "خريطة 4",
    title: "البؤر ومتجهات الرياح",
    caption: "البؤر مع متجهات الرياح في أربع لحظات حرجة.",
    sensor: "Open-Meteo · ERA5",
    chapter: "الفصل 10",
  },
  {
    id: "map-origins-infrastructure",
    source: "maps/MAP5_origins_infrastructure.png",
    group: "map",
    label: "خريطة 5",
    title: "بؤر المنشأ فوق التضاريس والبنى",
    caption:
      "بؤر المنشأ فوق التضاريس والطرق وخطوط الكهرباء والتجمعات السكنية.",
    sensor: "Copernicus DEM · OSM",
    chapter: "الفصل 14",
  },
  {
    id: "map-sentinel-before-after",
    source: "maps/MAP6_sentinel2_before_after.png",
    group: "map",
    label: "خريطة 6",
    title: "قبل وبعد، مع شدّة الاحتراق",
    caption: "Sentinel-2 قبل الحريق وبعده، وخريطة شدّة الاحتراق dNBR.",
    sensor: "Sentinel-2 · MSI L2A",
    chapter: "الفصل 8.4",
  },

  // ── الملحق ب — الأشكال البيانية ──
  {
    id: "chart-detections-frp-time",
    source: "charts/C1_C2_detections_frp_time.png",
    group: "chart",
    label: "شكل 1-2",
    title: "عدد البؤر وإجمالي القدرة الإشعاعية",
    caption: "عدد البؤر وإجمالي FRP لكل تمريرة، مع القيمة التراكمية.",
    sensor: "VIIRS · MODIS",
    chapter: "الفصل 5",
  },
  {
    id: "chart-frp-by-cluster",
    source: "charts/C3_frp_by_cluster.png",
    group: "chart",
    label: "شكل 3",
    title: "مساهمة كل حريق مستقل",
    caption: "مساهمة كل حريق مستقل في النشاط الحراري عبر الزمن.",
    sensor: "VIIRS · MODIS",
    chapter: "الفصل 6",
  },
  {
    id: "chart-fireweather-vs-activity",
    source: "charts/C4_fireweather_vs_activity.png",
    group: "chart",
    label: "شكل 4",
    title: "طقس الحرائق مقابل النشاط",
    caption:
      "طقس الحرائق (حرارة، رطوبة، رياح، هبّات) مقابل النشاط الحراري المرصود.",
    sensor: "Open-Meteo · METAR",
    chapter: "الفصل 12",
  },
  {
    id: "chart-cluster-timeline",
    source: "charts/C5_cluster_timeline.png",
    group: "chart",
    label: "شكل 5",
    title: "أول ظهور لكل حريق مستقل",
    caption: "الجدول الزمني لأول ظهور لكل حريق مستقل.",
    sensor: "VIIRS · MODIS",
    chapter: "الفصل 6",
  },
  {
    id: "chart-cluster-distance-matrix",
    source: "charts/C6_cluster_distance_matrix.png",
    group: "chart",
    label: "شكل 6",
    title: "المسافات بين بؤر المنشأ",
    caption: "مصفوفة المسافات الجيوديسية بين بؤر المنشأ.",
    sensor: "WGS84",
    chapter: "الفصل 7.1",
  },
  {
    id: "chart-transit-feasibility",
    source: "charts/C7_transit_feasibility.png",
    group: "chart",
    label: "شكل 7",
    title: "قابلية تنقّل فاعل واحد",
    caption:
      "اختبار قابلية تنقّل فاعل واحد بين بؤر المنشأ (66 زوجاً)، بالنوافذ العمياء القطبية.",
    note:
      "يعرض التحليل القطبي وحده. توقيت القمر الثابت في الفصل 15.6 يقلب الحكم لزوج O07/O08 إلى «متعذّر».",
    sensor: "VIIRS · OSM",
    chapter: "الفصل 15.3",
  },
  {
    id: "chart-tactical-placement",
    source: "charts/C8_tactical_placement.png",
    group: "chart",
    label: "شكل 8",
    title: "مؤشرات التموضع التكتيكي",
    caption:
      "الرتب المئينية لمؤشرات التموضع التكتيكي الخمسة مقابل نموذج مرجعي إقليمي.",
    sensor: "OSM · نموذج مرجعي",
    chapter: "الفصل 16",
  },
  {
    id: "chart-ach-posteriors",
    source: "charts/C9_ach_posteriors.png",
    group: "chart",
    label: "شكل 9",
    title: "الاحتمالات اللاحقة للفرضيات",
    caption:
      "الاحتمالات اللاحقة لمصفوفة الفرضيات المتنافسة على المستويين، مع اختبار التلطيف.",
    sensor: "ACH",
    chapter: "الفصل 26",
  },
  {
    id: "chart-national-origins",
    source: "charts/C10_national_origins.png",
    group: "chart",
    label: "شكل 10",
    title: "الخلفية الوطنية للاشتعالات",
    caption:
      "199 بؤرة اشتعال مستقلة عبر شمال الجزائر، والأعداد اليومية مقابل شدّة طقس الحرائق.",
    sensor: "VIIRS · وطني",
    chapter: "الفصل 22",
  },
  {
    id: "chart-weather-and-falsealarm",
    source: "charts/C11_weather_and_falsealarm.png",
    group: "chart",
    label: "شكل 11",
    title: "تتبّع الطقس والإنذار الكاذب",
    caption:
      "رتب تتبّع الطقس، والإنذار الكاذب في اختبار التزامن عبر ثلاثة نماذج مرجعية.",
    sensor: "اختبار إحصائي",
    chapter: "الفصل 25",
  },
  {
    id: "chart-power-and-limits",
    source: "charts/C12_power_and_limits.png",
    group: "chart",
    label: "شكل 12",
    title: "قوة الكشف وحدود الرصد",
    caption:
      "منحنيات قوة الكشف، وتوزيع النافذة العمياء القطبية بوصفه حدّاً رصدياً.",
    note:
      "النافذة المعروضة هنا قطبية. الفصل 15.6 يقلّصها إلى نحو 15 دقيقة لست بؤر بالقمر الثابت.",
    sensor: "اختبار القوة",
    chapter: "الفصل 25",
  },

  // ── منتجات Sentinel-2 ──
  {
    id: "s2-dnbr-severity",
    source: "satellite/S2_dNBR_severity.png",
    group: "satellite",
    label: "dNBR",
    title: "خريطة شدّة الاحتراق",
    caption:
      "فرق مؤشر الاحتراق بين مشهدَي 18 و28 أوت، مصنّفاً وفق عتبات Key & Benson. المساحة المحترقة 900.5 كم² عند العتبة 0.10.",
    sensor: "Sentinel-2 · B8A/B12",
    chapter: "الفصل 8.4",
  },
  {
    id: "s2-pre-truecolor",
    source: "satellite/S2_pre_20260818_truecolor.png",
    group: "satellite",
    label: "قبل · لون حقيقي",
    title: "الغطاء قبل الحريق",
    caption:
      "تركيب لوني حقيقي من مشهد 18 أوت، بغطاء سحابي 0.0٪. كتلة الغابة قبل الحدث.",
    sensor: "Sentinel-2 · MSI L2A",
    chapter: "الفصل 8.4",
  },
  {
    id: "s2-post-truecolor",
    source: "satellite/S2_post_20260828_truecolor.png",
    group: "satellite",
    label: "بعد · لون حقيقي",
    title: "الغطاء بعد الحريق",
    caption:
      "تركيب لوني حقيقي من مشهد 28 أوت، بغطاء سحابي 8.7٪. الندبات ظاهرة بالعين المجرّدة.",
    sensor: "Sentinel-2 · MSI L2A",
    chapter: "الفصل 8.4",
  },
  {
    id: "s2-pre-swir",
    source: "satellite/S2_pre_20260818_swir_falsecolor.png",
    group: "satellite",
    label: "قبل · لون كاذب",
    title: "الأشعة تحت الحمراء قبل الحريق",
    caption:
      "تركيب لوني كاذب بالأشعة تحت الحمراء قصيرة الموجة، 18 أوت. الغطاء النباتي الحي يظهر بوضوح أعلى من التركيب الحقيقي.",
    sensor: "Sentinel-2 · SWIR",
    chapter: "الفصل 8.4",
  },
  {
    id: "s2-post-swir",
    source: "satellite/S2_post_20260828_swir_falsecolor.png",
    group: "satellite",
    label: "بعد · لون كاذب",
    title: "الأشعة تحت الحمراء بعد الحريق",
    caption:
      "تركيب لوني كاذب بالأشعة تحت الحمراء قصيرة الموجة، 28 أوت. الأرض المحترقة تفصلها هذه النطاقات عن الغطاء السليم أفضل من الضوء المرئي.",
    sensor: "Sentinel-2 · SWIR",
    chapter: "الفصل 8.4",
  },
];

rmSync(figuresDir, { recursive: true, force: true });
mkdirSync(figuresDir, { recursive: true });

const published = [];

for (const figure of FIGURES) {
  const profile = PROFILES[figure.group];
  if (!profile) throw new Error(`مجموعة غير معروفة: ${figure.group}`);

  const sourcePath = path.join(fires, figure.source);
  const target = path.join(figuresDir, `${figure.id}.webp`);

  const info = await sharp(sourcePath)
    .resize({ width: profile.maxWidth, withoutEnlargement: true })
    .webp({ quality: profile.quality, effort: 6 })
    .toFile(target);

  const bytes = readFileSync(target);
  published.push({
    id: figure.id,
    group: figure.group,
    group_label: GROUPS[figure.group],
    label: figure.label,
    title: figure.title,
    caption: figure.caption,
    note: figure.note ?? null,
    sensor: figure.sensor,
    chapter: figure.chapter,
    path: `/generated/media/figures/${figure.id}.webp`,
    width: info.width,
    height: info.height,
    bytes: info.size,
    sha256: createHash("sha256").update(bytes).digest("hex"),
    source: figure.source,
  });
}

const counts = published.reduce((totals, figure) => {
  totals[figure.group] = (totals[figure.group] ?? 0) + 1;
  return totals;
}, {});

if (counts.map !== 6 || counts.chart !== 11 || counts.satellite !== 5) {
  throw new Error(
    `عدد الأشكال المنشورة غير متوقع: ${JSON.stringify(counts)}`,
  );
}

writeFileSync(
  path.join(output, "data", "figures.json"),
  `${JSON.stringify(
    {
      schema_version: 1,
      note:
        "أوصاف الخرائط والأشكال منقولة من ملحقَي التقرير أ وب. الأصول الخام "
        + "تبقى في مساحة التحقيق؛ المنشور هنا نسخ WebP محسّنة للعرض.",
      groups: Object.entries(GROUPS).map(([id, label]) => ({
        id,
        label,
        count: counts[id] ?? 0,
      })),
      figures: published,
    },
    null,
    0,
  )}\n`,
  "utf8",
);

const totalBytes = published.reduce((sum, figure) => sum + figure.bytes, 0);
console.log(
  `نُشر ${published.length} شكلاً (${(totalBytes / 1024 / 1024).toFixed(1)} م.ب): `
  + Object.entries(counts)
    .map(([group, count]) => `${GROUPS[group]} ${count}`)
    .join(" · "),
);
