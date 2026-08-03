// כרטיס הלקוח — ברירת המחדל: Card v4 (כרטיס הדגל החדש).
// ?view=cockpit → קוקפיט השיחה · ?view=classic → השכפול הקלאסי של Yoatsim ·
// ?view=retzef → רֶצֶף · ?view=form → הטופס המונחה.
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { journeyFromLead } from "@/lib/journey-db";
import { valuesFromLead } from "@/lib/yoatsim/values";
import { JourneyCard } from "@/components/lead/journey/JourneyCard";
import { ClassicLeadCard } from "@/components/classic/ClassicLeadCard";
import { CockpitCard } from "@/components/lead/cockpit/CockpitCard";
import { CardV4 } from "@/components/lead/v4/CardV4";
import type { CardV4Summary, TimelineItem } from "@/components/lead/v4/types";
import { RecentlyViewedTracker } from "@/components/leads/RecentlyViewedTracker";

export const dynamic = "force-dynamic";

export default async function LeadPage({ params, searchParams }: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const view =
    sp.view === "retzef" ? "retzef"
      : sp.view === "form" ? "form"
        : sp.view === "classic" ? "classic"
          : sp.view === "cockpit" ? "cockpit"
            : "v4";
  const idNum = Number(id);

  const include = {
    owner: { select: { name: true } },
    provider: { select: { name: true } },
    processes: { include: { responsible: { select: { id: true, name: true } } }, orderBy: { createdAt: "asc" as const } },
    sentForms: { orderBy: { sentAt: "desc" as const } },
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
  if (view === "retzef" || view === "form") {
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

  /* ---------- v4 (ברירת מחדל) / קוקפיט / השכפול הקלאסי ---------- */
  const users = await db.user.findMany({
    where: { active: true, role: { notIn: ["bot"] } },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  const leadDTO = {
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
  };
  const initialValues = valuesFromLead(lead);
  const initialProcesses = lead.processes.map((p) => ({
    id: p.id,
    processKey: p.processKey,
    statusKey: p.statusKey,
    responsible: p.responsible,
  }));

  if (view === "classic") {
    return (
      <><RecentlyViewedTracker id={lead.id} name={lead.fullName} />
      <ClassicLeadCard
        lead={leadDTO}
        initialValues={initialValues}
        initialActivities={activities}
        initialProcesses={initialProcesses}
        users={users}
      /></>
    );
  }

  if (view === "cockpit") {
    return (
      <><RecentlyViewedTracker id={lead.id} name={lead.fullName} />
      <CockpitCard
        lead={{ ...leadDTO, stage: lead.stage }}
        initialValues={initialValues}
        initialActivities={activities}
        initialProcesses={initialProcesses}
        initialForms={lead.sentForms.map((f) => ({
          id: f.id,
          templateName: f.templateName,
          status: f.status,
          sentAt: f.sentAt.toISOString(),
          signedAt: f.signedAt ? f.signedAt.toISOString() : null,
        }))}
        users={users}
      /></>
    );
  }

  /* ---------- Card v4 — נתוני הסיכום והפיד נבנים כאן, בשרת ---------- */
  const [lastView, lastCall, openTasks, leadTasks, calls, invoices] = await Promise.all([
    // הצפייה האחרונה — לפני שהצפייה הנוכחית תירשם (CardV4 יורה POST רק אחרי הרינדור)
    db.cardView.findFirst({
      where: { leadId: lead.id },
      orderBy: { viewedAt: "desc" },
      include: { user: { select: { name: true } } },
    }),
    db.call.findFirst({ where: { leadId: lead.id }, orderBy: { dialedAt: "desc" } }),
    db.task.findMany({
      where: { leadId: lead.id, done: false },
      orderBy: [{ dueAt: { sort: "asc", nulls: "last" } }, { createdAt: "desc" }],
      take: 3,
    }),
    db.task.findMany({
      where: { leadId: lead.id },
      orderBy: { createdAt: "desc" },
      take: 100,
      include: { toUser: { select: { name: true } } },
    }),
    db.call.findMany({ where: { leadId: lead.id }, orderBy: { dialedAt: "desc" }, take: 100 }),
    db.invoice.findMany({ where: { leadId: lead.id }, orderBy: { number: "desc" } }),
  ]);

  const lastCallActivity = lead.activities.find((a) => a.type === "call");
  const lastCallAt = [lastCall?.dialedAt, lastCallActivity?.createdAt]
    .filter((d): d is Date => !!d)
    .sort((a, b) => b.getTime() - a.getTime())[0] ?? null;

  const summary: CardV4Summary = {
    lastCallAt: lastCallAt ? lastCallAt.toISOString() : null,
    openTask: openTasks[0]
      ? {
          id: openTasks[0].id,
          text: openTasks[0].text,
          dueAt: openTasks[0].dueAt ? openTasks[0].dueAt.toISOString() : null,
        }
      : null,
    lastView: lastView
      ? { userName: lastView.user?.name ?? null, at: lastView.viewedAt.toISOString() }
      : null,
  };

  /* הפיד המאוחד — פעילויות + משימות + שיחות, ממוין יורד */
  const timeline: TimelineItem[] = [
    ...activities.map((a): TimelineItem => ({
      key: `a-${a.id}`, kind: "activity", type: a.type, text: a.text,
      at: a.createdAt, userName: a.userName,
    })),
    ...leadTasks.map((t): TimelineItem => ({
      key: `t-${t.id}`, kind: "task", type: "task", text: t.text,
      at: t.createdAt.toISOString(), userName: t.toUser?.name ?? null,
      taskId: t.id, done: t.done, urgent: t.urgent,
      dueAt: t.dueAt ? t.dueAt.toISOString() : null,
    })),
    ...calls.map((c): TimelineItem => ({
      key: `c-${c.id}`, kind: "call", type: "call",
      text: c.direction === "incoming" ? "שיחה נכנסת" : "שיחה יוצאת",
      at: c.dialedAt.toISOString(), userName: null,
      duration: c.duration, recordUrl: c.recordUrl,
      direction: c.direction, disposition: c.disposition,
    })),
  ].sort((x, y) => (x.at < y.at ? 1 : -1));

  return (
    <><RecentlyViewedTracker id={lead.id} name={lead.fullName} />
    <CardV4
      lead={leadDTO}
      meta={{
        stage: lead.stage,
        cardKind: lead.cardKind,
        archived: lead.archived,
        ownerName: lead.owner?.name ?? null,
        intakeDate: lead.intakeDate.toISOString(),
        source: lead.sourceText ?? lead.source,
      }}
      initialValues={initialValues}
      initialActivities={activities}
      initialProcesses={initialProcesses}
      users={users}
      summary={summary}
      timeline={timeline}
      invoices={invoices.map((inv) => ({
        id: inv.id,
        number: inv.number,
        title: inv.title,
        amount: inv.amount,
        vatRate: inv.vatRate,
        status: inv.status,
        notes: inv.notes,
        issuedAt: inv.issuedAt ? inv.issuedAt.toISOString() : null,
        paidAt: inv.paidAt ? inv.paidAt.toISOString() : null,
        createdAt: inv.createdAt.toISOString(),
      }))}
    /></>
  );
}
