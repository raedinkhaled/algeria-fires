// ينسخ عامل MapLibre وملفه المشترك من node_modules إلى public/vendor.
// حزم Turbopack في وضع التطوير لا تحلّ مسار العامل الداخلي في MapLibre حلاً
// صحيحاً، فنخدمه بأنفسنا ونمرّره عبر setWorkerUrl. الملفان مربوطان بنسخة
// maplibre-gl في package-lock؛ يُعاد تشغيل هذا السكربت عند ترقيتها.

import { copyFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const dist = path.dirname(require.resolve("maplibre-gl/package.json")) + "/dist";
const outDir = path.resolve(import.meta.dirname, "..", "public", "vendor", "maplibre");

mkdirSync(outDir, { recursive: true });
for (const file of ["maplibre-gl-worker.mjs", "maplibre-gl-shared.mjs"]) {
  copyFileSync(path.join(dist, file), path.join(outDir, file));
}
console.log("عامل MapLibre منسوخ إلى public/vendor/maplibre");
