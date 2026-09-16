import { readFile } from "node:fs/promises";
import path from "node:path";

/** قارئ CSV بسيط يحترم الاقتباس ونهايات الأسطر CRLF، للجداول المنشورة فقط. */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let value = "";
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    if (character === '"') {
      if (quoted && text[index + 1] === '"') {
        value += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
    } else if (character === "," && !quoted) {
      row.push(value);
      value = "";
    } else if ((character === "\n" || character === "\r") && !quoted) {
      if (character === "\r" && text[index + 1] === "\n") index += 1;
      row.push(value);
      if (row.some((cell) => cell !== "")) rows.push(row);
      row = [];
      value = "";
    } else {
      value += character;
    }
  }
  row.push(value);
  if (row.some((cell) => cell !== "")) rows.push(row);
  return rows;
}

/** يقرأ جدولاً من `public/generated/data` عند البناء ويحوّله إلى كائنات. */
export async function readCsvRows<T>(filename: string): Promise<T[]> {
  const text = await readFile(
    path.join(process.cwd(), "public", "generated", "data", filename),
    "utf8",
  );
  const [header, ...rows] = parseCsv(text);
  return rows.map(
    (row) =>
      Object.fromEntries(header.map((key, index) => [key, row[index] ?? ""])) as T,
  );
}
