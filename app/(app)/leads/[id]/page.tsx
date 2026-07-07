// כרטיס הלקוח — ברירת המחדל: השכפול הקלאסי של Yoatsim (1:1, עיצוב בינגו).
// ?view=retzef → רֶצֶף (התסריט המדובר) · ?view=form → הטופס המונחה.
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { journeyFromLead } from "@/lib/journey-db";
import { valuesFromLead } from "@/lib/yoatsim/values";
import { JourneyCard } from "@/components/lead/journey/JourneyCard";
import { ClassicLeadCard } from "@/components/classic/ClassicLeadCard";
import { RecentlyViewedTracker } from "@/components/leads/RecentlyViewedTracker";

export const dynamic = "force-dynamic";

export default async function LeadPage({ params, searchParams }: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const view = sp.view === "retzef" ? "retzef" : sp.view === "form" ? "form" : "classic";
  const idNum = Number(id);

  const include = {
    owner: { select: { name: true } },
    provider: { select: { name: true } },
    processes: { include: { responsible: { select: { id: true, name: true } } }, orderBy: { createdAt: "asc" as const } },
    activities: {
      orderBy: { createdAt: "desc" as const },
      take: 80,
      include: { user: { select: { name: true } } },
    },
  };

  const lead = Number.isInteger(idNum) && idNum > 0
    ? await db.lead.findUnique({ where: { id: idNum }, include })
    : await db.lead.findFirst({ where: { externalId: id }, include });

  if (!lead) notFound();

  const activities = lead.activities.map((a) => ({
    id: a.id,
    type: a.type,
    text: a.text,
    createdAt: a.createdAt.toISOString(),
    userName: a.user?.name ?? null,
  }));

  /* ---------- רֶצֶף / הטופס המונחה ---------- */
  if (view !== "classic") {
    const { journey, prefilled } = journeyFromLead(lead);
    return (
      <><RecentlyViewedTracker id={lead.id} name={lead.fullName} />
      <JourneyCard
        face={view === "retzef" ? "speak" : "form"}
        lead={{
          id: lead.id,
          externalId: lead.externalId,
          fullName: lead.fullName,
          phone: lead.phone,
          email: lead.email,
          idNumber: lead.idNumber,
          city: lead.city,
          stage: lead.stage,
          ownerName: lead.owner?.name ?? null,
          providerName: lead.provider?.name ?? null,
          source: lead.sourceText ?? lead.source,
          intakeDate: lead.intakeDate.toISOString(),
        }}
        initialJourney={journey}
        initialVersion={lead.journeyVersion}
        initialPrefilled={prefilled as string[]}
        initialActivities={activities.slice(0, 50)}
      /></>
    );
  }

  /* ---------- השכפול הקלאסי (ברירת מחדל) ---------- */
  const users = await db.user.findMany({
    where: { active: true, role: { notIn: ["bot"] } },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  return (
    <><RecentlyViewedTracker id={lead.id} name={lead.fullName} />
    <ClassicLeadCard
      lead={{
        id: lead.id,
        fullName: lead.fullName,
        phone: lead.phone,
        email: lead.email,
        intakeDate: lead.intakeDate.toISOString(),
        source: lead.source,
        sourceText: lead.sourceText,
        ownerName: lead.owner?.name ?? null,
        cardKind: lead.cardKind,
        parentLeadId: lead.parentLeadId,
        archived: lead.archived,
      }}
      initialValues={valuesFromLead(lead)}
      initialActivities={activities}
      initialProcesses={lead.processes.map((p) => ({
        id: p.id,
        processKey: p.processKey,
        statusKey: p.statusKey,
        responsible: p.responsible,
      }))}
      users={users}
    /></>
  );
}
