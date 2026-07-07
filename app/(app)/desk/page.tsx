// רֶצֶף — "השולחן": the rep's whole day as one dealt card at a time.
// Server side: derive every open lead's single next action (nextActionFor —
// a lead without a next step is structurally impossible) and deal by urgency.
import { db } from "@/lib/db";
import { journeyFromLead } from "@/lib/journey-db";
import { nextActionFor, journeyContext } from "@/lib/journey";
import { DeskClient, type DeskCard } from "@/components/desk/DeskClient";

export const dynamic = "force-dynamic";

export default async function DeskPage() {
  const leads = await db.lead.findMany({
    where: { stage: { notIn: ["PAID", "EXIT"] } },
    orderBy: { intakeDate: "asc" },
    take: 200,
    include: { activities: { select: { id: true }, take: 1 } },
  });

  const now = Date.now();
  const cards: DeskCard[] = leads.map((lead) => {
    const { journey } = journeyFromLead(lead);
    const na = nextActionFor(journey);
    const ctx = journeyContext(journey, lead.activities.length > 0);
    return {
      id: lead.id,
      fullName: lead.fullName,
      phone: lead.phone,
      amount: lead.amountRequested,
      actionType: na.type,
      actionLabel: na.label,
      dueAt: na.dueAt,
      tone: na.tone,
      contextLabel: ctx.label,
      overdueMin: na.dueAt ? Math.max(0, Math.round((now - new Date(na.dueAt).getTime()) / 60000)) : 0,
    };
  });

  // deal order: overdue first (most overdue on top), then "now", then nearest future
  cards.sort((a, b) => {
    const ta = a.dueAt ? new Date(a.dueAt).getTime() : now;
    const tb = b.dueAt ? new Date(b.dueAt).getTime() : now;
    return ta - tb;
  });

  return <DeskClient cards={cards} />;
}
