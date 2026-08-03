// PATCH  /api/ai/rules/[id] — עדכון כלל בקרה
// DELETE /api/ai/rules/[id] — מחיקת כלל
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

const KINDS = ["required", "forbidden"];
const SEVERITIES = ["low", "medium", "high", "critical"];
const APPLIES = ["all", "first-call", "ramzor", "closing"];

async function ruleId(ctx: { params: Promise<{ id: string }> }): Promise<number | null> {
  const { id } = await ctx.params;
  const n = Number(id);
  return Number.isInteger(n) && n > 0 ? n : null;
}

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const id = await ruleId(ctx);
  if (!id) return NextResponse.json({ error: "מזהה כלל לא תקין" }, { status: 400 });

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "גוף הבקשה ריק" }, { status: 400 });

  const data: Record<string, unknown> = {};
  if (body.name !== undefined) {
    const name = String(body.name).trim();
    if (!name) return NextResponse.json({ error: "שם הכלל לא יכול להיות ריק" }, { status: 400 });
    data.name = name;
  }
  if (body.description !== undefined) data.description = body.description ? String(body.description) : null;
  if (body.criterion !== undefined) {
    const criterion = String(body.criterion).trim();
    if (!criterion) return NextResponse.json({ error: "הקריטריון לא יכול להיות ריק" }, { status: 400 });
    data.criterion = criterion;
  }
  if (body.kind !== undefined && KINDS.includes(body.kind)) data.kind = body.kind;
  if (body.severity !== undefined && SEVERITIES.includes(body.severity)) data.severity = body.severity;
  if (body.appliesTo !== undefined && APPLIES.includes(body.appliesTo)) data.appliesTo = body.appliesTo;
  if (body.alertManager !== undefined) data.alertManager = !!body.alertManager;
  if (body.active !== undefined) data.active = !!body.active;
  if (body.sortOrder !== undefined && Number.isFinite(Number(body.sortOrder))) {
    data.sortOrder = Number(body.sortOrder);
  }

  if (!Object.keys(data).length) {
    return NextResponse.json({ error: "אין שדות לעדכון" }, { status: 400 });
  }

  try {
    const rule = await db.complianceRule.update({ where: { id }, data });
    return NextResponse.json(rule);
  } catch {
    return NextResponse.json({ error: "עדכון הכלל נכשל - ייתכן שהשם כבר תפוס או שהכלל נמחק" }, { status: 400 });
  }
}

export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const id = await ruleId(ctx);
  if (!id) return NextResponse.json({ error: "מזהה כלל לא תקין" }, { status: 400 });

  try {
    await db.complianceRule.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "הכלל לא נמצא" }, { status: 404 });
  }
}
