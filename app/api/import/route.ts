// POST multipart file + mapping → validate, dedup, upsert leads. Returns full report.
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { parseUpload } from "@/lib/import/parse";
import { autoMapHeaders, transformRow, type RowError } from "@/lib/import/mapping";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get("file") as File | null;
    if (!file) return NextResponse.json({ error: "חסר קובץ" }, { status: 400 });

    const mappingRaw = form.get("mapping") as string | null;
    const { headers, rows } = await parseUpload(file);
    const mapping: Record<string, string | null> = mappingRaw ? JSON.parse(mappingRaw) : autoMapHeaders(headers);

    const batch = await db.importBatch.create({
      data: { filename: file.name, totalRows: rows.length, mappingJson: JSON.stringify(mapping) },
    });

    // Caches to avoid N queries
    const users = await db.user.findMany();
    const userByName = new Map(users.map((u) => [u.name.trim(), u.id]));
    const providerCache = new Map<string, number>();
    for (const p of await db.leadProvider.findMany()) providerCache.set(p.name.trim(), p.id);

    let imported = 0, updated = 0, skipped = 0;
    const allErrors: RowError[] = [];
    const allWarnings: RowError[] = [];

    for (let i = 0; i < rows.length; i++) {
      const t = transformRow(rows[i], mapping, i + 2); // +2 = 1-based + header row
      allErrors.push(...t.errors);
      allWarnings.push(...t.warnings);
      if (t.errors.length) { skipped++; continue; }

      // Resolve owner by name (fuzzy: exact or contains)
      let ownerId: number | null = null;
      if (t.ownerName) {
        ownerId = userByName.get(t.ownerName) ?? users.find((u) => u.name.includes(t.ownerName!) || t.ownerName!.includes(u.name))?.id ?? null;
      }

      // Auto-create provider (ספקי לידים נבנים תוך כדי ייבוא)
      let providerId: number | null = null;
      if (t.providerName) {
        if (!providerCache.has(t.providerName)) {
          const p = await db.leadProvider.create({ data: { name: t.providerName } });
          providerCache.set(t.providerName, p.id);
        }
        providerId = providerCache.get(t.providerName)!;
      }

      const data: any = { ...t.data, ownerId, providerId, importBatchId: batch.id };

      // Dedup priority: externalId → idNumber → phone
      let existing = null;
      if (data.externalId) existing = await db.lead.findUnique({ where: { externalId: data.externalId } });
      if (!existing && data.idNumber) existing = await db.lead.findFirst({ where: { idNumber: data.idNumber } });
      if (!existing && data.phone) existing = await db.lead.findFirst({ where: { phone: data.phone } });

      let leadId: number;
      if (existing) {
        // Yoatsim is source of truth during transition — overwrite non-null values
        const patch: any = {};
        for (const [k, v] of Object.entries(data)) {
          if (v !== null && v !== undefined && k !== "importBatchId") patch[k] = v;
        }
        patch.importBatchId = batch.id;
        await db.lead.update({ where: { id: existing.id }, data: patch });
        leadId = existing.id;
        updated++;
      } else {
        const created = await db.lead.create({ data });
        leadId = created.id;
        imported++;
      }

      // Notes column → activity
      if (t.notes) {
        await db.activity.create({
          data: { leadId, type: "note", text: t.notes, metaJson: JSON.stringify({ source: "yoatsim-import" }) },
        });
      }
    }

    await db.importBatch.update({
      where: { id: batch.id },
      data: {
        imported, updated, skipped,
        errorsJson: JSON.stringify({ errors: allErrors.slice(0, 200), warnings: allWarnings.slice(0, 200) }),
      },
    });

    return NextResponse.json({
      batchId: batch.id,
      totalRows: rows.length,
      imported, updated, skipped,
      errors: allErrors.slice(0, 50),
      warnings: allWarnings.slice(0, 50),
      errorCount: allErrors.length,
      warningCount: allWarnings.length,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "שגיאה בייבוא" }, { status: 500 });
  }
}
