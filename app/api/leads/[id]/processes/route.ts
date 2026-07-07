// שכפול Yoatsim — תהליכים על ליד (ריבוי תהליכים, כמו במקור).
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { processByKey } from "@/lib/yoatsim/processes";

export const dynamic = "force-dynamic";

const include = { responsible: { select: { id: true, name: true } } };

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const rows = await db.leadProcess.findMany({
    where: { leadId: Number(id) },
    include,
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const leadId = Number(id);
  const body = await req.json().catch(() => null);
  const def = processByKey(body?.processKey);
  if (!def) return NextResponse.json({ error: "תהליך לא מוכר" }, { status: 400 });

  const statusKey = body.statusKey && def.statuses.includes(body.statusKey)
    ? body.statusKey
    : def.statuses[0];

  const row = await db.leadProcess.create({
    data: { leadId, processKey: def.key, statusKey, responsibleId: body.responsibleId ?? null },
    include,
  });
  await db.activity.create({
    data: { leadId, type: "status-change", text: `נוסף לתהליך "${def.name}" בסטטוס "${statusKey}"` },
  });
  return NextResponse.json(row, { status: 201 });
}

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const leadId = Number(id);
  const body = await req.json().catch(() => null);
  if (!body?.id) return NextResponse.json({ error: "חסר מזהה" }, { status: 400 });

  const prev = await db.leadProcess.findUnique({ where: { id: Number(body.id) } });
  if (!prev || prev.leadId !== leadId) return NextResponse.json({ error: "לא נמצא" }, { status: 404 });

  const row = await db.leadProcess.update({
    where: { id: prev.id },
    data: {
      ...(body.statusKey !== undefined ? { statusKey: body.statusKey } : {}),
      ...(body.responsibleId !== undefined ? { responsibleId: body.responsibleId } : {}),
    },
    include,
  });

  if (body.statusKey && body.statusKey !== prev.statusKey) {
    const def = processByKey(prev.processKey);
    await db.activity.create({
      data: {
        leadId,
        type: "status-change",
        text: `${def?.name ?? prev.processKey}: "${prev.statusKey}" → "${body.statusKey}"`,
        metaJson: JSON.stringify({ processKey: prev.processKey, from: prev.statusKey, to: body.statusKey }),
      },
    });
  }
  return NextResponse.json(row);
}

export async function DELETE(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const leadId = Number(id);
  const body = await req.json().catch(() => null);
  if (!body?.id) return NextResponse.json({ error: "חסר מזהה" }, { status: 400 });
  const prev = await db.leadProcess.findUnique({ where: { id: Number(body.id) } });
  if (!prev || prev.leadId !== leadId) return NextResponse.json({ error: "לא נמצא" }, { status: 404 });
  await db.leadProcess.delete({ where: { id: prev.id } });
  const def = processByKey(prev.processKey);
  await db.activity.create({
    data: { leadId, type: "system", text: `הוסר מהתהליך "${def?.name ?? prev.processKey}"` },
  });
  return NextResponse.json({ ok: true });
}
