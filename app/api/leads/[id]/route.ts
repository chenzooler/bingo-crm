// Single lead — GET full detail + PATCH update (+ מנוע האוטומציות אחרי שמירה)
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { valuesFromLead } from "@/lib/yoatsim/values";
import { runAutomations } from "@/lib/yoatsim/engine";
import { catalogClient, CLIENT_COLOR_META } from "@/lib/catalog";

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
  // שורה מלאה — נדרשת ל-prevValues של מנוע האוטומציות
  const prev = await db.lead.findUnique({ where: { id: Number(id) } });
  if (!prev) return NextResponse.json({ error: "ליד לא נמצא" }, { status: 404 });

  const patch: any = { ...body };
  delete patch.id;
  if (body.stage && body.stage !== prev.stage) patch.stageChangedAt = new Date();

  let lead = await db.lead.update({ where: { id: Number(id) }, data: patch });

  // קטלוג הלקוח — נגזר מערכי הכרטיס ונשמר בעמודות (לרשימות, פילטרים וסנכרון)
  const catalog = catalogClient(valuesFromLead(lead));
  if (catalog.creditIndication !== lead.creditIndication || (catalog.clientColor ?? null) !== (lead.clientColor ?? null)) {
    const colorChanged = (catalog.clientColor ?? null) !== (lead.clientColor ?? null);
    lead = await db.lead.update({
      where: { id: lead.id },
      data: { creditIndication: catalog.creditIndication, clientColor: catalog.clientColor },
    });
    if (colorChanged && catalog.clientColor) {
      await db.activity.create({
        data: {
          leadId: lead.id,
          type: "system",
          text: `הלקוח קוטלג: ${CLIENT_COLOR_META[catalog.clientColor].name} - ${catalog.label}`,
          metaJson: JSON.stringify({ clientColor: catalog.clientColor, creditIndication: catalog.creditIndication }),
        },
      });
    }
  }

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

  // ארכיון — תיעוד ביומן הפעילות
  if (typeof body.archived === "boolean" && body.archived !== prev.archived) {
    await db.activity.create({
      data: {
        leadId: lead.id,
        type: "system",
        text: body.archived ? "הכרטיס הועבר לארכיון" : "הכרטיס שוחזר מהארכיון",
      },
    });
  }

  // מנוע האוטומציות — edge-trigger על ערכי הכרטיס (לעולם לא זורק)
  const { fired } = await runAutomations({
    leadId: lead.id,
    prevValues: valuesFromLead(prev),
    nextValues: valuesFromLead(lead),
    db,
  });

  return NextResponse.json({ ...lead, firedAutomations: fired });
}
