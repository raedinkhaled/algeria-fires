import { readFileSync, statSync } from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const requiredFiles = [
  "app/icon.svg",
  "app/manifest.ts",
  "app/robots.ts",
  "app/sitemap.ts",
  "app/not-found.tsx",
  "app/error.tsx",
  "lib/site-url.ts",
];
const requiredRoutes = [
  'path: "/"',
  'path: "/investigation"',
  'path: "/chronology"',
  'path: "/map"',
  'path: "/report"',
  'path: "/data"',
  'path: "/methodology"',
  'path: "/sources"',
];
const problems = [];

for (const relative of requiredFiles) {
  try {
    if (!statSync(path.join(root, relative)).isFile()) {
      problems.push(`${relative} ليس ملفاً`);
    }
  } catch {
    problems.push(`${relative} مفقود`);
  }
}

const sitemap = readFileSync(path.join(root, "app/sitemap.ts"), "utf8");
for (const route of requiredRoutes) {
  if (!sitemap.includes(route)) problems.push(`sitemap لا يتضمن ${route}`);
}

const layout = readFileSync(path.join(root, "app/layout.tsx"), "utf8");
for (const feature of ["metadataBase", "openGraph", "twitter", "application/ld+json"]) {
  if (!layout.includes(feature)) problems.push(`layout لا يضبط ${feature}`);
}

if (problems.length) {
  console.error("فشل فحص جاهزية النشر:");
  for (const problem of problems) console.error(`  - ${problem}`);
  process.exit(1);
}

console.log("ملفات النشر وبياناته الوصفية مكتملة.");
