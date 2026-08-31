// ينشر قياس التوقيت من القمر الثابت MSG/SEVIRI وملخّص احتمالات الفرضيات، وهي
// طبقة لا يغطّيها 36_build_site_data.py. يعمل بعد إعادة بناء public/generated
// ويسجّل ما ينشره في downloads.json حتى يبقى قابلاً للتحقق. الخرائط والأشكال
// ينشرها scripts/publish-figures.mjs.

import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const fires = path.join(root, "Fires");
const output = path.join(root, "public", "generated");
const msg = "data/processed/frp_msg";

function readJson(relativePath) {
  return JSON.parse(readFileSync(path.join(fires, relativePath), "utf8"));
}

function readCsv(relativePath) {
  const text = readFileSync(path.join(fires, relativePath), "utf8")
    .replace(/^\uFEFF/, "")
    .trim();
  const [header, ...lines] = text.split(/\r?\n/);
  const columns = header.split(",").map((column) => column.trim());
  return lines.map((line) => {
    const cells = line.split(",").map((cell) => cell.trim());
    if (cells.length !== columns.length) {
      throw new Error(`صف غير مكتمل في ${relativePath}`);
    }
    return Object.fromEntries(columns.map((column, index) => [column, cells[index]]));
  });
}

/** يحوّل نصاً رقمياً إلى رقم، ويُبقي الفراغ قيمةً غائبة صريحة. */
function number(value) {
  const text = (value ?? "").trim();
  if (text === "") return null;
  const parsed = Number(text);
  if (!Number.isFinite(parsed)) throw new Error(`قيمة رقمية غير صالحة: ${value}`);
  return parsed;
}

function text(value) {
  const trimmed = (value ?? "").trim();
  return trimmed === "" ? null : trimmed;
}

/** التوقيت المحلي في الجزائر هو ت.ع.م + ساعة طوال السنة، بلا توقيت صيفي. */
function toLocal(utc) {
  const value = text(utc);
  if (!value) return null;
  const parsed = new Date(`${value.replace(" ", "T")}Z`);
  if (Number.isNaN(parsed.getTime())) throw new Error(`توقيت غير صالح: ${utc}`);
  parsed.setUTCHours(parsed.getUTCHours() + 1);
  return parsed.toISOString().slice(0, 16).replace("T", " ");
}

mkdirSync(path.join(output, "data"), { recursive: true });

const synchrony = readJson(`${msg}/msg_synchrony_summary.json`);
const sensitivity = readCsv("data/processed/forensic/ach_sensitivity.csv");

const alphaRows = sensitivity.filter(
  (row) => row.run === "alpha" && row.level === "L1",
);
const full = alphaRows.find((row) => row.param === "1.0");
const softened = alphaRows.find((row) => row.param === "0.5");

if (!full || !softened || synchrony.msg_conservative.infeasible_nominal !== 2) {
  throw new Error("تعذّر التحقق من ملخص التوقيت أو حساسية فرضية التنسيق.");
}

/* المستوى الأول بنية الحدث، والثاني سبب الاشتعال المفرد. القيم المعتمدة هي
   قيم المصفوفة بعد تحليل القوة وقاعدة التماثل (الفصل 26.4). */
const STRUCTURE = [
  ["multiple_mixed", "S2_multiple_mixed", "اشتعالات متعددة مستقلة مختلطة الأسباب"],
  ["coordinated", "S3_coordinated_campaign", "عملية إجرامية منسّقة"],
  ["single_fire", "S1_single_fire", "حريق واحد انتشر"],
];

const SINGLE_CAUSE = [
  ["infrastructure_mechanical", "H2b_accidental_nonelectrical", "بنية تحتية أو ميكانيكي"],
  ["isolated_arson", "H3_isolated_arson", "إضرام معزول"],
  ["agricultural", "H5_agricultural", "حرق فلاحي"],
  ["natural", "H1_natural", "سبب طبيعي"],
];

const causeRows = sensitivity.filter(
  (row) => row.run === "alpha" && row.level === "L2",
);
const causeFull = causeRows.find((row) => row.param === "1.0");
const causeSoftened = causeRows.find((row) => row.param === "0.5");

if (!causeFull || !causeSoftened) {
  throw new Error("تعذّر قراءة احتمالات سبب الاشتعال المفرد.");
}

/**
 * يحوّل الاحتمال إلى نسبة مئوية بمنزلة عشرية واحدة **بالطريقة نفسها التي
 * طبعها بها التقرير**: تقريب على ثلاث منازل أولاً ثم الضرب في مئة. الضرب
 * المباشر في مئة يقلب 0.8885 إلى 88.9 بدل 88.8 بسبب تمثيل الفاصلة العائمة.
 */
function percent(row, column) {
  if (!(column in row)) {
    throw new Error(`عمود ${column} غير موجود في ach_sensitivity.csv`);
  }
  const value = number(row[column]);
  return Number((Number(value.toFixed(3)) * 100).toFixed(1));
}

const hypotheses = {
  /** المستوى الأول: متين الاتجاه، يصمد عند أشدّ تلطيف. */
  structure: STRUCTURE.map(([id, column, label]) => ({
    id,
    label,
    full_weight: percent(full, column),
    softened_weight: percent(softened, column),
  })),
  /** المستوى الثاني: ترتيبه لا يصمد أمام التلطيف؛ يُعرض مع هذا الحدّ. */
  single_cause: SINGLE_CAUSE.map(([id, column, label]) => ({
    id,
    label,
    full_weight: percent(causeFull, column),
    softened_weight: percent(causeSoftened, column),
  })),
  single_cause_robust: false,
};

// بوابة على القيم التي ينشرها التقرير في الفصلين 1.2 و26.4.
const PUBLISHED = { multiple_mixed: 88.8, coordinated: 11.1, single_fire: 0.1 };
for (const row of hypotheses.structure) {
  if (row.full_weight !== PUBLISHED[row.id]) {
    throw new Error(
      `احتمال «${row.label}» ${row.full_weight}٪ لا يطابق التقرير (${PUBLISHED[row.id]}٪)`,
    );
  }
}

// ——— نوافذ الاشتعال: كم ضيّق القمرُ الثابت الجهلَ بلحظة الاشتعال ———

const origins = readCsv("data/processed/independent_origins.csv");
const originById = new Map(origins.map((row) => [row.origin_id, row]));
const windows = readCsv(`${msg}/msg_ignition_windows.csv`);

if (windows.length !== origins.length || windows.length !== 12) {
  throw new Error(`عدد نوافذ الاشتعال ${windows.length}، المتوقع 12`);
}

const ignitionWindows = windows.map((row) => {
  const origin = originById.get(row.origin_id);
  if (!origin) throw new Error(`بؤرة غير معروفة: ${row.origin_id}`);

  const geo = number(row.geo_blind_window_h);
  return {
    origin_id: row.origin_id,
    locality: text(row.locality) ?? text(origin.locality),
    daira: text(origin.daira),
    wilaya: text(row.wilaya),
    first_detection_utc: row.first_detection_utc,
    first_detection_local: toLocal(row.first_detection_utc),
    first_via: row.first_via,
    /** آخر شريحة رأى فيها القمرُ الموقعَ صافياً بلا نار. */
    last_clear_utc: text(row.msg_last_clear_utc),
    last_clear_local: toLocal(row.msg_last_clear_utc),
    polar_blind_window_h: number(row.polar_blind_window_h),
    geo_blind_window_h: geo,
    /** دقيقة واحدة أدقّ من ساعة: النافذة الثابتة دورة رصد واحدة. */
    geo_blind_window_min: geo === null ? null : Math.round(geo * 60),
    peak_frp_1h_mw: number(row.peak_frp_1h_mw),
    quality: row.quality,
  };
});

const resolved = ignitionWindows.filter((row) => row.geo_blind_window_h !== null);
const tightened = resolved.filter((row) => row.quality === "clean");

if (tightened.length !== 6) {
  throw new Error(`البؤر المحلولة بدقة الربع ساعة ${tightened.length}، المتوقع 6`);
}

// ——— الأزواج المتقاربة زمنياً: المسافة والاتجاه والريح ———

const pairs = readCsv(`${msg}/simultaneous_pairs.csv`)
  .filter((row) => row.set === "origins")
  .map((row) => ({
    a_id: row.a_id,
    a_locality: text(row.a_locality),
    a_wilaya: text(row.a_wilaya),
    a_precision: row.a_precision,
    b_id: row.b_id,
    b_locality: text(row.b_locality),
    b_wilaya: text(row.b_wilaya),
    b_precision: row.b_precision,
    gap_min: number(row.gap_min),
    separation_km: number(row.separation_km),
    bearing_a_to_b: number(row.bearing_a_to_b),
    bearing_compass: row.bearing_compass,
    wind_from_deg: number(row.wind_from_deg),
    wind_from_compass: row.wind_from_compass,
    wind_kmh: number(row.wind_kmh),
    gust_kmh: number(row.gust_kmh),
    temp_c: number(row.temp_c),
    rh_pct: number(row.rh_pct),
    angle_wind_vs_bearing: number(row.angle_wind_vs_bearing),
    geometry: row.geometry,
    /** الحكم هندسي بحت: مصدرا اشتعال، لا فاعلان ولا تنسيق. */
    two_sources: row.verdict.startsWith("too far"),
    /** التوقيتان مقيسان فعلاً حين لا يقوم أيّ طرف على نافذة عمياء. */
    resolved: !row.a_precision.includes("blind") && !row.b_precision.includes("blind"),
  }));

if (pairs.length !== 6) {
  throw new Error(`عدد الأزواج المتقاربة ${pairs.length}، المتوقع 6`);
}

// ——— سلسلة القدرة الإشعاعية كل 15 دقيقة فوق صندوق الحدث ———

const series = readCsv(`${msg}/frp_regional_timeseries.csv`).map((row) => ({
  t: row.slot_utc,
  n: number(row.n_fire_bbox),
  frp: Math.round(number(row.sum_frp_bbox_mw)),
}));

if (series.length < 900) {
  throw new Error(`سلسلة MSG قصيرة: ${series.length} شريحة`);
}

const peak = series.reduce((best, slot) => (slot.frp > best.frp ? slot : best));

// ——— الكتابة والتسجيل ———

const publications = [
  [
    "data/forensic-summary.json",
    "application/json",
    "ملخص احتمالات الفرضيات وقياس التوقيت من القمر الثابت.",
    {
      schema_version: 3,
      coordinated_probability: {
        full_weight: number(full.S3_coordinated_campaign),
        softened_weight: number(softened.S3_coordinated_campaign),
      },
      hypotheses,
      msg: {
        cadence_minutes: 15,
        minimum_sources: synchrony.msg_conservative.infeasible_nominal,
        pair: synchrony.infeasible_pairs[0]?.pair,
        road_km: number(synchrony.infeasible_pairs[0]?.road_km),
        transit_minutes: Math.round(number(synchrony.infeasible_pairs[0]?.transit_h) * 60),
        timing_window_minutes: [11, 30],
        origins_resolved_to_quarter_hour: tightened.length,
        origins_invisible_to_msg: ignitionWindows.length - resolved.length,
      },
    },
  ],
  [
    "data/msg-ignition-windows.json",
    "application/json",
    "نافذة الجهل بلحظة الاشتعال لكل بؤرة منشأ، قبل القمر الثابت وبعده.",
    {
      schema_version: 1,
      source: "LSA SAF MSG FRP-PIXEL · Meteosat-10",
      cadence_minutes: 15,
      note:
        "النافذة العمياء تمتد من آخر رصد صافٍ بلا نار إلى أول رصد فعلي. "
        + "«سماء صافية بلا رصد» تعني «لا حريق كبير» لا «لا حريق»؛ "
        + "حدّ الكشف فوق هذا الإقليم نحو 30-50 ميغاواط.",
      origins: ignitionWindows,
    },
  ],
  [
    "data/msg-simultaneous-pairs.json",
    "application/json",
    "أزواج بؤر المنشأ التي بدأت خلال ثلاث ساعات، مع المسافة واتجاه الريح.",
    {
      schema_version: 1,
      spot_max_km: 10,
      downwind_deg: 45,
      crosswind_deg: 135,
      note:
        "سجلّ هندسي لا نتيجة عن التنسيق. «يلزم مصدران» تعني مصدرَي اشتعال، "
        + "ولا تقول شيئاً عن كونهما مرتبطين أو متعمّدين. والريح منمذجة "
        + "عند أقرب نقطة وأقرب ساعة، ولا محطة أرصاد داخل الكتلة الجبلية.",
      pairs,
    },
  ],
  [
    "data/msg-frp-series.json",
    "application/json",
    "مجموع القدرة الإشعاعية كل 15 دقيقة فوق صندوق الحدث من القمر الثابت.",
    {
      schema_version: 1,
      source: "LSA SAF MSG FRP-PIXEL · Meteosat-10",
      cadence_minutes: 15,
      timezone: "UTC",
      unit: "MW",
      peak: { t: peak.t, frp: peak.frp },
      slots: series,
    },
  ],
];

const manifestPath = path.join(output, "downloads.json");
const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));

for (const [relative, mediaType, description, value] of publications) {
  const target = path.join(output, relative);
  writeFileSync(target, `${JSON.stringify(value)}\n`, "utf8");

  const bytes = readFileSync(target);
  manifest.artifacts = manifest.artifacts.filter(
    (artifact) => artifact.path !== `/generated/${relative}`,
  );
  manifest.artifacts.push({
    path: `/generated/${relative}`,
    media_type: mediaType,
    bytes: statSync(target).size,
    sha256: createHash("sha256").update(bytes).digest("hex"),
    description,
  });
}

writeFileSync(manifestPath, `${JSON.stringify(manifest)}\n`, "utf8");
