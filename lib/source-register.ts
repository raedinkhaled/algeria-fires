export type SourceFamily = "DS" | "OF" | "MD" | "ME";
export type SourceStatus = "available" | "bibliographic" | "excluded";

export type SourceRecord = {
  id: string;
  family: SourceFamily;
  title: string;
  publisher: string;
  detail: string;
  date: string;
  urls: string[];
  status: SourceStatus;
};

export type UnavailableSource = {
  source: string;
  purpose: string;
  result: string;
};

export type QuarantinedSource = {
  reference: string;
  date: string;
  verification: string;
  verdict: string;
};

const excludedIds = new Set(["OF-05", "OF-08", "OF-09"]);

function westernDigits(value: string) {
  const digits: Record<string, string> = {
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

  return value.replace(/[٠-٩]/g, (digit) => digits[digit]);
}

function plainText(value: string) {
  return westernDigits(value)
    .replace(/\[([^\]]+)]\([^)]+\)/g, "$1")
    .replace(/\*\*|`|\*/g, "")
    .replace(/[—–]/g, " - ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractUrls(value: string) {
  const matches = value.match(/https?:\/\/[^\s*`]+/g) ?? [];
  return matches.map((url) => url.replace(/[،؛,.]+$/g, ""));
}

function tableAfter(source: string, marker: string) {
  const sectionStart = source.indexOf(marker);
  if (sectionStart === -1) return [];

  const lines = source.slice(sectionStart + marker.length).split(/\r?\n/);
  const tableStart = lines.findIndex((line) => line.trim().startsWith("|"));
  if (tableStart === -1) return [];

  const rows = (() => {
    const collected: string[] = [];
    for (const line of lines.slice(tableStart)) {
      if (!line.trim().startsWith("|")) break;
      collected.push(line);
    }
    return collected;
  })();

  return rows.slice(2).map((line) =>
    line
      .trim()
      .slice(1, -1)
      .split("|")
      .map((cell) => cell.trim()),
  );
}

function statusFor(id: string, urls: string[]): SourceStatus {
  if (excludedIds.has(id)) return "excluded";
  return urls.length ? "available" : "bibliographic";
}

export function parseSourceRegister(source: string) {
  const records: SourceRecord[] = [];

  for (const row of tableAfter(source, "### مجموعات البيانات الفضائية")) {
    const [idRaw, title, publisher, detail, date, link] = row;
    const id = plainText(idRaw);
    const urls = extractUrls(link);
    records.push({
      id,
      family: "DS",
      title: plainText(title),
      publisher: plainText(publisher),
      detail: plainText(detail),
      date: plainText(date),
      urls,
      status: statusFor(id, urls),
    });
  }

  for (const row of tableAfter(
    source,
    "## المستوى الأول (تابع) — تصريحات ومصادر رسمية جزائرية",
  )) {
    const [idRaw, title, publisher, date, link] = row;
    const id = plainText(idRaw);
    const urls = extractUrls(link);
    records.push({
      id,
      family: "OF",
      title: plainText(title),
      publisher: plainText(publisher),
      detail: "مصدر رسمي جزائري أو تصريح منقول مباشرة",
      date: plainText(date),
      urls,
      status: statusFor(id, urls),
    });
  }

  for (const row of tableAfter(
    source,
    "## المستوى الثاني (Tier 2) — مؤسسات إعلامية كبرى",
  )) {
    const [idRaw, title, publisher, date, link] = row;
    const id = plainText(idRaw);
    const urls = extractUrls(link);
    records.push({
      id,
      family: "MD",
      title: plainText(title),
      publisher: plainText(publisher),
      detail: "تغطية إعلامية داعمة للسياق والحصائل",
      date: plainText(date),
      urls,
      status: statusFor(id, urls),
    });
  }

  for (const row of tableAfter(source, "## مراجع منهجية")) {
    const [idRaw, reference] = row;
    const id = plainText(idRaw);
    const urls = extractUrls(reference);
    records.push({
      id,
      family: "ME",
      title: plainText(reference.replace(/https?:\/\/[^\s*`]+/g, "")),
      publisher: "مرجع منهجي محكّم أو توثيق تقني",
      detail: "تعريف المنتج أو الخوارزمية أو عتبات التصنيف",
      date: "",
      urls,
      status: statusFor(id, urls),
    });
  }

  const unavailable: UnavailableSource[] = tableAfter(
    source,
    "## مصادر جرى البحث عنها ولم يتيسّر الوصول إليها",
  ).map(([name, purpose, result]) => ({
    source: plainText(name),
    purpose: plainText(purpose),
    result: plainText(result),
  }));

  const quarantined: QuarantinedSource[] = tableAfter(
    source,
    "## سجلّ الحجر: بنود جرى التحقّق منها واستُبعدت لأنها لا تخصّ هذا الحدث",
  ).map(([reference, date, verification, verdict]) => ({
    reference: plainText(reference),
    date: plainText(date),
    verification: plainText(verification),
    verdict: plainText(verdict),
  }));

  return { records, unavailable, quarantined };
}

export const sourceFamilyLabels: Record<SourceFamily, string> = {
  DS: "بيانات رصدية",
  OF: "مصادر رسمية",
  MD: "مؤسسات إعلامية",
  ME: "مراجع منهجية",
};

export const sourceStatusLabels: Record<SourceStatus, string> = {
  available: "رابط متاح",
  bibliographic: "مرجع ببليوغرافي",
  excluded: "خارج نطاق الحدث",
};
