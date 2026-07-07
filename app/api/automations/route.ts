// אוטומציות (שכפול Yoatsim) — רשימה מלאה מה-DB, תנאים/פעולות מפוענחים
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

function parseJson<T>(raw: string | null | undefined, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function serializeAutomation(a: {
  id: number;
  name: string;
  cardType: string;
  actionType: string | null;
  enabled: boolean;
  conditionsJson: string | null;
  actionsJson: string | null;
  updatedAt: Date;
}) {
  return {
    id: a.id,
    name: a.name,
    cardType: a.cardType,
    actionType: a.actionType,
    enabled: a.enabled,
    conditions: parseJson<unknown[]>(a.conditionsJson, []),
    actions: parseJson<unknown[]>(a.actionsJson, []),
    updatedAt: a.updatedAt,
  };
}

export async function GET() {
  const rows = await db.automation.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json({ automations: rows.map(serializeAutomation) });
}
