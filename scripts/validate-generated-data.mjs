// يتحقق من أن أصول public/generated/ المنشورة سليمة ومطابقة للقيم المرجعية قبل
// أي بناء. يعمل في كل بيئة (لا يحتاج Fires/ ولا بايثون)، فيصلح بوابةً على Vercel.
// إعادة توليد هذه الأصول من مصادر التحقيق تبقى مهمة data:build المحلية.

import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const GENERATED = path.join(ROOT, "public", "generated");
// نصّ التقرير يعيش خارج public/ عمداً: يُقرأ عند البناء ولا يُخدَم للتنزيل.
const REPORT = path.join(ROOT, "content", "report_ar.md");

const REFERENCE_COUNTS = {
  hotspots: 9100,
  grid_cells: 4451,
  origins: 12,
  burn_patches: 17,
};

const COUNTED_CSV = {
  hotspots: "data/hotspots_wildfire_only.csv",
  grid_cells: "data/grid_first_detection.csv",
  origins: "data/independent_origins.csv",
  burn_patches: "data/burn_patches.csv",
};

const problems = [];

function read(relative) {
  return readFileSync(path.join(GENERATED, relative));
}

function dataRowCount(relative) {
  const lines = read(relative).toString("utf8").split(/\r?\n/);
  while (lines.length && lines.at(-1) === "") lines.pop();
  return Math.max(0, lines.length - 1);
}

let summary;
try {
  summary = JSON.parse(read("content-summary.json").toString("utf8"));
} catch (error) {
  console.error(`تعذّرت قراءة content-summary.json: ${error.message}`);
  process.exit(1);
}

for (const [key, expected] of Object.entries(REFERENCE_COUNTS)) {
  const declared = summary.reference_counts?.[key];
  if (declared !== expected) {
    problems.push(`content-summary.json: ${key} = ${declared}، المتوقع ${expected}`);
  }
  let rows;
  try {
    rows = dataRowCount(COUNTED_CSV[key]);
  } catch (error) {
    problems.push(`${COUNTED_CSV[key]}: ${error.message}`);
    continue;
  }
  if (rows !== expected) {
    problems.push(`${COUNTED_CSV[key]}: ${rows} صفاً، المتوقع ${expected}`);
  }
}

try {
  const report = readFileSync(REPORT, "utf8");
  if (!/^#\s+\S/m.test(report)) {
    problems.push("content/report_ar.md لا يحتوي عنواناً رئيسياً");
  }
} catch {
  problems.push("content/report_ar.md مفقود: تعذّر بناء صفحة التقرير ونسخة الطباعة");
}

// معرض الأشكال: يتحقق من وجود كل ملف وبصمته، ولا يدخل قائمة التنزيلات.
try {
  const figures = JSON.parse(read("data/figures.json").toString("utf8"));
  const expected = { map: 6, chart: 11, satellite: 5 };
  for (const group of figures.groups ?? []) {
    if (group.count !== expected[group.id]) {
      problems.push(
        `figures.json: ${group.id} = ${group.count}، المتوقع ${expected[group.id]}`,
      );
    }
  }
  for (const item of figures.figures ?? []) {
    const relative = item.path.replace(/^\/generated\//, "");
    let bytes;
    try {
      bytes = read(relative);
    } catch {
      problems.push(`figures.json يشير إلى ملف مفقود: ${item.path}`);
      continue;
    }
    if (bytes.length !== item.bytes) {
      problems.push(`${item.path}: الحجم ${bytes.length}، المُعلن ${item.bytes}`);
    }
    if (createHash("sha256").update(bytes).digest("hex") !== item.sha256) {
      problems.push(`${item.path}: بصمة sha256 لا تطابق figures.json`);
    }
  }
} catch (error) {
  problems.push(`تعذّرت قراءة figures.json: ${error.message}`);
}

let downloads;
try {
  downloads = JSON.parse(read("downloads.json").toString("utf8"));
} catch (error) {
  console.error(`تعذّرت قراءة downloads.json: ${error.message}`);
  process.exit(1);
}

for (const artifact of downloads.artifacts ?? []) {
  const relative = artifact.path.replace(/^\/generated\//, "");
  let bytes;
  try {
    bytes = read(relative);
  } catch {
    problems.push(`downloads.json يشير إلى ملف مفقود: ${artifact.path}`);
    continue;
  }
  if (bytes.length !== artifact.bytes) {
    problems.push(`${artifact.path}: الحجم ${bytes.length}، المُعلن ${artifact.bytes}`);
  }
  const digest = createHash("sha256").update(bytes).digest("hex");
  if (digest !== artifact.sha256) {
    problems.push(`${artifact.path}: بصمة sha256 لا تطابق downloads.json`);
  }
}

if (problems.length) {
  console.error("فشل التحقق من بيانات الموقع المنشورة:");
  for (const problem of problems) console.error(`  - ${problem}`);
  console.error("\nشغّل `npm run data:build` لإعادة التوليد من مصادر التحقيق.");
  process.exit(1);
}

console.log(
  `بيانات الموقع سليمة: ${Object.entries(REFERENCE_COUNTS)
    .map(([key, value]) => `${key} ${value.toLocaleString("en")}`)
    .join(" · ")}`,
);
