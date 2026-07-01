// Parse uploaded CSV/Excel into rows
import Papa from "papaparse";
import * as XLSX from "xlsx";

export interface ParsedFile {
  headers: string[];
  rows: Record<string, unknown>[];
}

export async function parseUpload(file: File): Promise<ParsedFile> {
  const name = file.name.toLowerCase();
  const buf = Buffer.from(await file.arrayBuffer());

  if (name.endsWith(".xlsx") || name.endsWith(".xls")) {
    const wb = XLSX.read(buf, { type: "buffer", cellDates: true });
    const sheet = wb.Sheets[wb.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });
    const headers = rows.length ? Object.keys(rows[0]) : [];
    return { headers, rows };
  }

  // CSV — handle UTF-8 BOM + Windows-1255 fallback for Hebrew
  let text = buf.toString("utf8");
  if (text.charCodeAt(0) === 0xfeff) text = text.slice(1);
  // Heuristic: if Hebrew is garbled (lots of U+FFFD), retry as windows-1255
  if ((text.match(/�/g) || []).length > 5) {
    try {
      const decoder = new TextDecoder("windows-1255");
      text = decoder.decode(buf);
    } catch { /* keep utf8 */ }
  }

  const result = Papa.parse<Record<string, unknown>>(text, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim(),
  });
  return { headers: result.meta.fields || [], rows: result.data };
}
