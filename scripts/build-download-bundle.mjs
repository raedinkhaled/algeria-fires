// يجمع البيانات المعالجة المنشورة في حزمة واحدة بعد بنائها، من دون إدخال الأصول
// الخام أو الوثائق الكبيرة. يبقى downloads.json سجلّ التحقق الوحيد للتنزيلات.

import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const GENERATED = path.join(ROOT, "public", "generated");
const manifestPath = path.join(GENERATED, "downloads.json");
const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
const bundlePath = "downloads/jijel-fire-processed-data.zip";
const bundleTarget = path.join(GENERATED, bundlePath);
const files = manifest.artifacts
  .map((artifact) => artifact.path.replace(/^\/generated\//, ""))
  .filter((artifact) => artifact.startsWith("data/"));

mkdirSync(path.dirname(bundleTarget), { recursive: true });
execFileSync("zip", ["-q", "-9", bundleTarget, ...files], {
  cwd: GENERATED,
});

const bytes = readFileSync(bundleTarget);
manifest.artifacts = manifest.artifacts.filter(
  (artifact) => artifact.path !== `/generated/${bundlePath}`,
);
manifest.artifacts.push({
  path: `/generated/${bundlePath}`,
  media_type: "application/zip",
  bytes: statSync(bundleTarget).size,
  sha256: createHash("sha256").update(bytes).digest("hex"),
  description: "حزمة واحدة للبيانات المعالجة وملخصاتها بصيغة ZIP.",
});
writeFileSync(manifestPath, `${JSON.stringify(manifest)}\n`);
