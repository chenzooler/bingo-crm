// PATCH /api/alerts/[id] — סימון התראה כנקראה / כטופלה.
// גוף: { read?: boolean, resolved?: boolean }
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const alertId = Number(id);
  if (!Number.isInteger(alertId) || alertId <= 0) {
    return NextResponse.json({ error: "מזהה התראה לא תקין" }, { status: 400 });
  }

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "גוף הבקשה ריק" }, { status: 400 });

  const data: Record<string, unknown> = {};
  if (body.read !== undefined) data.readAt = body.read ? new Date() : null;
  if (body.resolved !== undefined) {
    data.resolvedAt = body.resolved ? new Date() : null;
    // התראה שטופלה נחשבת גם כנקראה
    if (body.resolved && body.read === undefined) data.readAt = new Date();
  }

  if (!Object.keys(data).length) {
    return NextResponse.json({ error: "אין שדות לעדכון" }, { status: 400 });
  }

  try {
    const alert = await db.alert.update({ where: { id: alertId }, data });
    return NextResponse.json(alert);
  } catch {
    return NextResponse.json({ error: "ההתראה לא נמצאה" }, { status: 404 });
  }
}
