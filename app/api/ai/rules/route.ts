// GET  /api/ai/rules — כל כללי הבקרה (?active=1 לפעילים בלבד)
// POST /api/ai/rules — יצירת כלל חדש
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

const KINDS = ["required", "forbidden"];
const SEVERITIES = ["low", "medium", "high", "critical"];
const APPLIES = ["all", "first-call", "ramzor", "closing"];

export async function GET(req: NextRequest) {
  const activeOnly = req.nextUrl.searchParams.get("active") === "1";
  const rules = await db.complianceRule.findMany({
    where: activeOnly ? { active: true } : undefined,
    orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
  });
  return NextResponse.json(rules);
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const name = String(body?.name ?? "").trim();
  const criterion = String(body?.criterion ?? "").trim();

  if (!name) return NextResponse.json({ error: "חסר שם לכלל" }, { status: 400 });
  if (!criterion) return NextResponse.json({ error: "חסר קריטריון לבדיקה" }, { status: 400 });

  const kind = KINDS.includes(body?.kind) ? body.kind : "required";
  const severity = SEVERITIES.includes(body?.severity) ? body.severity : "medium";
  const appliesTo = APPLIES.includes(body?.appliesTo) ? body.appliesTo : "all";

  const exists = await db.complianceRule.findUnique({ where: { name } });
  if (exists) {
    return NextResponse.json({ error: "כבר קיים כלל בשם הזה" }, { status: 409 });
  }

  const rule = await db.complianceRule.create({
    data: {
      name,
      description: body?.description ? String(body.description) : null,
      kind,
      criterion,
      severity,
      alertManager: body?.alertManager === undefined ? true : !!body.alertManager,
      active: body?.active === undefined ? true : !!body.active,
      appliesTo,
      sortOrder: Number.isFinite(Number(body?.sortOrder)) ? Number(body.sortOrder) : 100,
    },
  });
  return NextResponse.json(rule, { status: 201 });
}
