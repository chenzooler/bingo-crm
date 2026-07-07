// עדכון אוטומציה בודדת — מתג, פרטי בסיס, תנאים ופעולות
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

const CARD_TYPES = ["כרטיס", "שכפול", "כרטיס בדיקה"];

function parseJson<T>(raw: string | null | undefined, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const automationId = Number(id);
  if (!Number.isInteger(automationId)) {
    return NextResponse.json({ error: "מזהה אוטומציה לא תקין" }, { status: 400 });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "גוף הבקשה אינו JSON תקין" }, { status: 400 });
  }

  const data: Record<string, unknown> = {};
  if (typeof body.enabled === "boolean") data.enabled = body.enabled;
  if (typeof body.name === "string") {
    if (!body.name.trim()) return NextResponse.json({ error: "שם האוטומציה לא יכול להיות ריק" }, { status: 400 });
    data.name = body.name.trim();
  }
  if (typeof body.cardType === "string") {
    if (!CARD_TYPES.includes(body.cardType)) {
      return NextResponse.json({ error: "סוג כרטיס לא מוכר" }, { status: 400 });
    }
    data.cardType = body.cardType;
  }
  if (typeof body.actionType === "string") data.actionType = body.actionType.trim();
  if (Array.isArray(body.conditions)) data.conditionsJson = JSON.stringify(body.conditions);
  if (Array.isArray(body.actions)) data.actionsJson = JSON.stringify(body.actions);

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "אין שדות לעדכון" }, { status: 400 });
  }

  try {
    const row = await db.automation.update({ where: { id: automationId }, data });
    return NextResponse.json({
      id: row.id,
      name: row.name,
      cardType: row.cardType,
      actionType: row.actionType,
      enabled: row.enabled,
      conditions: parseJson<unknown[]>(row.conditionsJson, []),
      actions: parseJson<unknown[]>(row.actionsJson, []),
      updatedAt: row.updatedAt,
    });
  } catch (e: any) {
    if (e?.code === "P2025") return NextResponse.json({ error: "אוטומציה לא נמצאה" }, { status: 404 });
    if (e?.code === "P2002") return NextResponse.json({ error: "כבר קיימת אוטומציה בשם הזה" }, { status: 409 });
    return NextResponse.json({ error: "שגיאה בעדכון האוטומציה" }, { status: 500 });
  }
}
