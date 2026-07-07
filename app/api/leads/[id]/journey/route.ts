// Journey persistence — the lead card's save endpoint.
// PUT: optimistic-lock save (409 on version mismatch) + server-derived audit trail.
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  type JourneyState, type SectionId, initialJourney, sectionComplete, sectionMeta,
  FIRST_CALL_SECTIONS, POST_SIGN_SECTIONS, deriveStage,
} from "@/lib/journey";
import { journeyFromLead, leadPatchFromJourney } from "@/lib/journey-db";

export const dynamic = "force-dynamic";

const ALL_SECTION_IDS: SectionId[] = [
  ...FIRST_CALL_SECTIONS.map((s) => s.id),
  ...POST_SIGN_SECTIONS.map((s) => s.id),
];

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const lead = await db.lead.findUnique({ where: { id: Number(id) } });
  if (!lead) return NextResponse.json({ error: "ליד לא נמצא" }, { status: 404 });
  const { journey, prefilled } = journeyFromLead(lead);
  return NextResponse.json({ journey, prefilled, version: lead.journeyVersion });
}

export async function PUT(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const leadId = Number(id);
  const body = await req.json().catch(() => null);
  if (!body?.journey) return NextResponse.json({ error: "חסר journey בבקשה" }, { status: 400 });

  const journey: JourneyState = { ...initialJourney(), ...body.journey };
  const baseVersion: number = Number(body.baseVersion ?? -1);

  const lead = await db.lead.findUnique({ where: { id: leadId } });
  if (!lead) return NextResponse.json({ error: "ליד לא נמצא" }, { status: 404 });

  // optimistic concurrency — another rep saved since this tab loaded
  if (lead.journeyVersion !== baseVersion) {
    const { journey: server, prefilled } = journeyFromLead(lead);
    return NextResponse.json(
      { error: "conflict", journey: server, prefilled, version: lead.journeyVersion },
      { status: 409 },
    );
  }

  // server-derived audit: which sections were just completed?
  const prev = journeyFromLead(lead).journey;
  const completedNow = ALL_SECTION_IDS.filter(
    (sid) => !sectionComplete(prev, sid) && sectionComplete(journey, sid),
  );
  const prevStage = lead.stage;
  const nextStage = deriveStage(journey);

  const updated = await db.lead.update({
    where: { id: leadId },
    data: {
      ...leadPatchFromJourney(journey),
      journeyJson: JSON.stringify(journey),
      journeyUpdatedAt: new Date(),
      journeyVersion: { increment: 1 },
      ...(nextStage !== prevStage ? { stageChangedAt: new Date() } : {}),
    },
  });

  const audits = completedNow.map((sid) => ({
    leadId,
    type: "journey",
    text: `✓ הושלם: ${sectionMeta(sid).title}`,
    metaJson: JSON.stringify({ section: sid }),
  }));
  if (nextStage !== prevStage) {
    audits.push({
      leadId,
      type: "status-change",
      text: `סטטוס עודכן: ${prevStage} → ${nextStage}`,
      metaJson: JSON.stringify({ from: prevStage, to: nextStage }),
    });
  }
  if (audits.length > 0) await db.activity.createMany({ data: audits });

  return NextResponse.json({ ok: true, version: updated.journeyVersion, stage: updated.stage });
}

// admin escape hatch — clear the journey (the card's "אפס מסע")
export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const leadId = Number(id);
  const lead = await db.lead.findUnique({ where: { id: leadId }, select: { id: true } });
  if (!lead) return NextResponse.json({ error: "ליד לא נמצא" }, { status: 404 });
  await db.lead.update({
    where: { id: leadId },
    data: { journeyJson: null, journeyUpdatedAt: new Date(), journeyVersion: { increment: 1 } },
  });
  await db.activity.create({
    data: { leadId, type: "system", text: "המסע אופס על ידי נציג" },
  });
  return NextResponse.json({ ok: true });
}
