// POST multipart file → headers + sample rows + suggested column mapping
import { NextRequest, NextResponse } from "next/server";
import { parseUpload } from "@/lib/import/parse";
import { autoMapHeaders } from "@/lib/import/mapping";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get("file") as File | null;
    if (!file) return NextResponse.json({ error: "חסר קובץ" }, { status: 400 });

    const { headers, rows } = await parseUpload(file);
    if (!headers.length) return NextResponse.json({ error: "לא נמצאו עמודות בקובץ" }, { status: 400 });

    const mapping = autoMapHeaders(headers);
    const mappedCount = Object.values(mapping).filter(Boolean).length;

    return NextResponse.json({
      filename: file.name,
      totalRows: rows.length,
      headers,
      mapping,
      mappedCount,
      sample: rows.slice(0, 5),
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "שגיאה בניתוח הקובץ" }, { status: 500 });
  }
}
