import { readFile } from "node:fs/promises";
import path from "node:path";

/**
 * قراءة التقرير العربي المنشور وتهيئته للعرض. تستعمله صفحة `/report`
 * وصفحة الطباعة معاً، فيبقى العنوان وفهرس الفصول والنصّ من مصدر واحد.
 */

const digitMap: Record<string, string> = {
  "٠": "0",
  "١": "1",
  "٢": "2",
  "٣": "3",
  "٤": "4",
  "٥": "5",
  "٦": "6",
  "٧": "7",
  "٨": "8",
  "٩": "9",
};

/** الواجهة العربية كلها بأرقام غربية، والتقرير قد يحمل أرقاماً هندية. */
export function toWesternDigits(value: string): string {
  return value.replace(/[٠-٩]/g, (digit) => digitMap[digit]);
}

export function plainHeading(value: string): string {
  return value
    .replace(/[`*_~]/g, "")
    .replace(/\[(.*?)\]\([^)]*\)/g, "$1")
    .trim();
}

export type ReportDocument = {
  /** العنوان الرئيسي، مفصولاً عن النصّ حتى لا يتكرّر في العرض. */
  title: string;
  source: string;
  /** عناوين الفصول كما ترد في النصّ، بترتيبها. */
  chapters: string[];
};

export async function readReportDocument(): Promise<ReportDocument> {
  // خارج public/ عمداً: يُقرأ عند البناء ولا يُخدَم ملفاً قابلاً للتنزيل.
  const reportPath = path.join(process.cwd(), "content", "report_ar.md");
  const raw = toWesternDigits(await readFile(reportPath, "utf8"));
  const lines = raw.replace(/^﻿/, "").split(/\r?\n/);
  const title = lines[0]?.replace(/^#\s+/, "") || "التقرير العربي الكامل";
  const source = lines.slice(1).join("\n");
  const chapters = Array.from(source.matchAll(/^#\s+(.+)$/gm)).map(
    ([, heading]) => plainHeading(heading),
  );

  return { title, source, chapters };
}
