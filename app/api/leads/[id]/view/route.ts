// רישום צפייה בכרטיס — CardV4 יורה POST פעם אחת בטעינה (fire-and-forget).
// הצפייה הקודמת מוצגת ברצועת הסיכום ("נצפה לאחרונה").
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/current-user";

export const dynamic = "force-dynamic";

export async function POST(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const leadId = Number(id);
  if (!Number.isInteger(leadId) || leadId <= 0) {
    return NextResponse.json({ error: "מזהה ליד לא תקין" }, { status: 400 });
  }
  const lead = await db.lead.findUnique({ where: { id: leadId }, select: { id: true } });
  if (!lead) return NextResponse.json({ error: "ליד לא נמצא" }, { status: 404 });

  const me = await currentUser();
  const view = await db.cardView.create({
    data: { leadId, userId: me?.id ?? null },
  });
  return NextResponse.json({ id: view.id, viewedAt: view.viewedAt.toISOString() }, { status: 201 });
}
