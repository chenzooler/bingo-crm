// Lead activities — append a note/event to the lead's timeline.
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

const ALLOWED_TYPES = new Set(["note", "call", "sms", "whatsapp", "system", "journey", "task"]);

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const leadId = Number(id);
  const body = await req.json().catch(() => null);
  const text = String(body?.text ?? "").trim();
  if (!text) return NextResponse.json({ error: "חסר טקסט" }, { status: 400 });
  const type = ALLOWED_TYPES.has(body?.type) ? body.type : "note";

  const lead = await db.lead.findUnique({ where: { id: leadId }, select: { id: true } });
  if (!lead) return NextResponse.json({ error: "ליד לא נמצא" }, { status: 404 });

  const activity = await db.activity.create({
    data: {
      leadId,
      type,
      text,
      metaJson: body?.meta ? JSON.stringify(body.meta) : null,
    },
  });
  return NextResponse.json(activity, { status: 201 });
}
