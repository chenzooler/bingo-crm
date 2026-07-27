// עדכון משתמש בודד — שם/אימייל/טלפון/תפקיד/רמת הרשאה/פעיל
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { profileByKey } from "@/lib/yoatsim/permissions";

export const dynamic = "force-dynamic";

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const userId = Number(id);
  if (!Number.isFinite(userId)) return NextResponse.json({ error: "מזהה לא תקין" }, { status: 400 });

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "גוף בקשה חסר" }, { status: 400 });

  if (body.permissionRole != null && body.permissionRole !== "" && !profileByKey(body.permissionRole)) {
    return NextResponse.json({ error: "רמת הרשאה לא מוכרת" }, { status: 400 });
  }

  const data: Record<string, unknown> = {};
  if (body.name !== undefined) {
    const name = String(body.name).trim();
    if (!name) return NextResponse.json({ error: "שם לא יכול להיות ריק" }, { status: 400 });
    data.name = name;
  }
  if (body.email !== undefined) data.email = body.email?.trim() || null;
  if (body.phone !== undefined) data.phone = body.phone?.trim() || null;
  if (body.emoji !== undefined) data.emoji = body.emoji?.trim() || null;
  if (body.role !== undefined) data.role = body.role;
  if (body.permissionRole !== undefined) data.permissionRole = body.permissionRole || null;
  if (body.active !== undefined) data.active = Boolean(body.active);
  if (body.sipExtension !== undefined) data.sipExtension = body.sipExtension?.trim() || null;

  if (Object.keys(data).length === 0) return NextResponse.json({ error: "אין שדות לעדכון" }, { status: 400 });

  try {
    const user = await db.user.update({ where: { id: userId }, data });
    return NextResponse.json(user);
  } catch (e: any) {
    if (e?.code === "P2025") return NextResponse.json({ error: "משתמש לא נמצא" }, { status: 404 });
    if (e?.code === "P2002") return NextResponse.json({ error: "אימייל כבר קיים במערכת" }, { status: 409 });
    return NextResponse.json({ error: "שגיאה בעדכון משתמש" }, { status: 500 });
  }
}
