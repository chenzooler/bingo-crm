// Single lead — GET full detail + PATCH update
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const lead = await db.lead.findUnique({
    where: { id: Number(id) },
    include: {
      owner: { select: { id: true, name: true, emoji: true } },
      provider: { select: { id: true, name: true } },
      activities: { orderBy: { createdAt: "desc" }, take: 50, include: { user: { select: { name: true, emoji: true } } } },
      checks: { include: { lender: true }, orderBy: { checkedAt: "desc" } },
    },
  });
  if (!lead) return NextResponse.json({ error: "ליד לא נמצא" }, { status: 404 });
  return NextResponse.json(lead);
}

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const body = await req.json();
  const prev = await db.lead.findUnique({ where: { id: Number(id) }, select: { stage: true } });
  if (!prev) return NextResponse.json({ error: "ליד לא נמצא" }, { status: 404 });

  const patch: any = { ...body };
  delete patch.id;
  if (body.stage && body.stage !== prev.stage) patch.stageChangedAt = new Date();

  const lead = await db.lead.update({ where: { id: Number(id) }, data: patch });

  // Auto-log stage transitions
  if (body.stage && body.stage !== prev.stage) {
    await db.activity.create({
      data: {
        leadId: lead.id,
        type: "status-change",
        text: `סטטוס עודכן: ${prev.stage} → ${body.stage}`,
        metaJson: JSON.stringify({ from: prev.stage, to: body.stage }),
      },
    });
  }
  return NextResponse.json(lead);
}
