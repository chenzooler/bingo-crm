// ניהול משתמשים — רשימה + יצירה (מסך הגדרות → ניהול משתמשים)
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { profileByKey } from "@/lib/yoatsim/permissions";

export const dynamic = "force-dynamic";

export async function GET() {
  const users = await db.user.findMany({
    orderBy: [{ active: "desc" }, { name: "asc" }],
  });
  return NextResponse.json(users);
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const name = body?.name?.trim();
  if (!name) return NextResponse.json({ error: "שם חסר" }, { status: 400 });
  if (body.permissionRole && !profileByKey(body.permissionRole)) {
    return NextResponse.json({ error: "רמת הרשאה לא מוכרת" }, { status: 400 });
  }
  try {
    const user = await db.user.create({
      data: {
        name,
        email: body.email?.trim() || null,
        phone: body.phone?.trim() || null,
        emoji: body.emoji?.trim() || null,
        role: body.role || "agent",
        permissionRole: body.permissionRole || null,
      },
    });
    return NextResponse.json(user, { status: 201 });
  } catch (e: any) {
    if (e?.code === "P2002") return NextResponse.json({ error: "אימייל כבר קיים במערכת" }, { status: 409 });
    return NextResponse.json({ error: "שגיאה ביצירת משתמש" }, { status: 500 });
  }
}
