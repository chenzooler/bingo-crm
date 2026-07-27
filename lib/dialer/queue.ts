// מנוע התור של תותח השיחות — מי הליד הבא שמוגש לנציג.
// סדר עדיפויות:
//   1. callback — משימות חזרה (channel=call) שעבר זמנן, של המשתמש הנוכחי
//   2. new      — לידים בתהליך החתמות בסטטוס "ליד חדש" שמעולם לא חויגו (חדש ראשון)
//   3. retry    — סולם ניסיונות אחרי אין מענה/תפוס: 1ש → 4ש → 24ש → 72ש
// לא מוגשים: ארכיון, כרטיס לא-רגיל (שכפול/בדיקה), stage=EXIT, חויג ב-5 הדקות האחרונות.
import { db } from "@/lib/db";

const RETRY_LADDER_HOURS = [1, 4, 24]; // ניסיון רביעי ומעלה — 72 שעות
const RECENT_CALL_MINUTES = 5;
const NO_ANSWER_STATUSES = new Set(["NOANSWER", "BUSY"]);

export type QueueReason = "callback" | "new" | "retry";

export interface ServedLead {
  id: number;
  fullName: string;
  phone: string | null;
  amountRequested: number | null;
  monthlyIncome: number | null;
  monthlyObligations: number | null;
  smiley: string | null;
  stage: string;
  processes: { processKey: string; statusKey: string }[];
  lastActivity: { text: string; createdAt: string } | null;
  latestNote: string | null;
}

export interface DialerQueueResult {
  lead: ServedLead | null;
  reason: QueueReason | null;
  retryAttempt: number | null; // מספר הניסיון הבא (retry בלבד)
  queueCounts: { callback: number; new: number; retry: number };
  stats: { calls: number; answered: number; talkSeconds: number; dispositions: number };
}

const LEAD_SELECT = {
  id: true,
  fullName: true,
  phone: true,
  amountRequested: true,
  monthlyIncome: true,
  monthlyObligations: true,
  smiley: true,
  stage: true,
  archived: true,
  cardKind: true,
  processes: { select: { processKey: true, statusKey: true } },
  calls: { select: { status: true, dialedAt: true }, orderBy: { dialedAt: "desc" as const } },
} as const;

type LeadWithCalls = {
  id: number;
  fullName: string;
  phone: string | null;
  amountRequested: number | null;
  monthlyIncome: number | null;
  monthlyObligations: number | null;
  smiley: string | null;
  stage: string;
  archived: boolean;
  cardKind: string;
  processes: { processKey: string; statusKey: string }[];
  calls: { status: string; dialedAt: Date }[];
};

function eligible(lead: LeadWithCalls, now: Date, excluded: Set<number>): boolean {
  if (excluded.has(lead.id)) return false;
  if (lead.archived || lead.cardKind !== "card" || lead.stage === "EXIT") return false;
  if (!lead.phone) return false;
  const recentCutoff = now.getTime() - RECENT_CALL_MINUTES * 60_000;
  if (lead.calls.some((c) => c.dialedAt.getTime() > recentCutoff)) return false;
  return true;
}

/** ניסיון-החזרה הבא של הליד (1-based) אם הוא בשל להגשה, אחרת null */
function retryDue(lead: LeadWithCalls, now: Date): number | null {
  const last = lead.calls[0];
  if (!last || !NO_ANSWER_STATUSES.has(last.status)) return null;
  const attempts = lead.calls.filter((c) => NO_ANSWER_STATUSES.has(c.status)).length;
  const waitHours =
    attempts <= RETRY_LADDER_HOURS.length ? RETRY_LADDER_HOURS[attempts - 1] : 72;
  const dueAt = last.dialedAt.getTime() + waitHours * 3_600_000;
  return now.getTime() >= dueAt ? attempts + 1 : null;
}

async function serve(lead: LeadWithCalls): Promise<ServedLead> {
  const [lastActivity, note] = await Promise.all([
    db.activity.findFirst({
      where: { leadId: lead.id },
      orderBy: { createdAt: "desc" },
      select: { text: true, createdAt: true },
    }),
    db.activity.findFirst({
      where: { leadId: lead.id, type: "note" },
      orderBy: { createdAt: "desc" },
      select: { text: true },
    }),
  ]);
  return {
    id: lead.id,
    fullName: lead.fullName,
    phone: lead.phone,
    amountRequested: lead.amountRequested,
    monthlyIncome: lead.monthlyIncome,
    monthlyObligations: lead.monthlyObligations,
    smiley: lead.smiley,
    stage: lead.stage,
    processes: lead.processes,
    lastActivity: lastActivity
      ? { text: lastActivity.text, createdAt: lastActivity.createdAt.toISOString() }
      : null,
    latestNote: note ? note.text.split("\n")[0] : null,
  };
}

export async function nextInQueue(
  userId: number,
  excludeIds: number[] = [],
): Promise<DialerQueueResult> {
  const now = new Date();
  const excluded = new Set(excludeIds);

  /* ---------- דלי 1: משימות חזרה שעבר זמנן ---------- */
  const callbackTasks = await db.task.findMany({
    where: {
      done: false,
      channel: "call",
      dueAt: { lte: now },
      toUserId: userId,
      leadId: { not: null },
    },
    orderBy: { dueAt: "asc" },
    select: { lead: { select: LEAD_SELECT } },
    take: 200,
  });
  const callbackLeads: LeadWithCalls[] = [];
  const seenCallback = new Set<number>();
  for (const t of callbackTasks) {
    const lead = t.lead as LeadWithCalls | null;
    if (lead && !seenCallback.has(lead.id) && eligible(lead, now, excluded)) {
      seenCallback.add(lead.id);
      callbackLeads.push(lead);
    }
  }

  /* ---------- דלי 2: לידים חדשים שמעולם לא חויגו ---------- */
  const newLeadsRaw = await db.lead.findMany({
    where: {
      archived: false,
      cardKind: "card",
      stage: { not: "EXIT" },
      calls: { none: {} },
      processes: { some: { processKey: "signatures", statusKey: "ליד חדש" } },
    },
    orderBy: { createdAt: "desc" },
    select: LEAD_SELECT,
    take: 500,
  });
  const newLeads = (newLeadsRaw as LeadWithCalls[]).filter((l) => eligible(l, now, excluded));

  /* ---------- דלי 3: סולם אין-מענה ---------- */
  const retryRaw = await db.lead.findMany({
    where: {
      archived: false,
      cardKind: "card",
      stage: { not: "EXIT" },
      calls: { some: { status: { in: [...NO_ANSWER_STATUSES] } } },
    },
    select: LEAD_SELECT,
    take: 1000,
  });
  const retryLeads = (retryRaw as LeadWithCalls[])
    .filter((l) => eligible(l, now, excluded) && retryDue(l, now) !== null)
    // הוותיק ביותר בהמתנה — ראשון
    .sort((a, b) => a.calls[0].dialedAt.getTime() - b.calls[0].dialedAt.getTime());

  const queueCounts = {
    callback: callbackLeads.length,
    new: newLeads.length,
    retry: retryLeads.length,
  };

  /* ---------- סטטיסטיקת היום של הנציג ---------- */
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);
  const todayCalls = await db.call.findMany({
    where: { userId, dialedAt: { gte: startOfDay } },
    select: { status: true, duration: true, disposition: true },
  });
  const stats = {
    calls: todayCalls.length,
    answered: todayCalls.filter((c) => c.status === "ANSWER").length,
    talkSeconds: todayCalls.reduce((s, c) => s + (c.duration ?? 0), 0),
    dispositions: todayCalls.filter((c) => c.disposition).length,
  };

  const pick =
    callbackLeads[0] != null
      ? { lead: callbackLeads[0], reason: "callback" as const }
      : newLeads[0] != null
        ? { lead: newLeads[0], reason: "new" as const }
        : retryLeads[0] != null
          ? { lead: retryLeads[0], reason: "retry" as const }
          : null;

  if (!pick) {
    return { lead: null, reason: null, retryAttempt: null, queueCounts, stats };
  }

  return {
    lead: await serve(pick.lead),
    reason: pick.reason,
    retryAttempt: pick.reason === "retry" ? retryDue(pick.lead, now) : null,
    queueCounts,
    stats,
  };
}
