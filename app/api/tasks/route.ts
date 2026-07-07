// Tasks API — שכפול פאנל "משימות ופעילויות" של Yoatsim.
// GET  /api/tasks?filter=overdue|incoming|outgoing|future|done&userId=N|me
//      פילטרים משלימים: &channel=call|whatsapp|sms|email · &noReminder=1 (ללא תזכורת)
//      עימוד: &page=1&pageSize=25 → { tasks, total, page, pageSize }
//      בלי page — מערך רגיל (תאימות לאחור ל-TasksPanel/ActionButtons).
// POST /api/tasks — יצירת משימה חדשה
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/current-user";

export const dynamic = "force-dynamic";

const include = {
  lead: { select: { id: true, fullName: true } },
  fromUser: { select: { id: true, name: true, emoji: true } },
  toUser: { select: { id: true, name: true, emoji: true } },
};

const orderBy = [
  { dueAt: { sort: "asc" as const, nulls: "last" as const } },
  { createdAt: "desc" as const },
];

async function resolveUserId(raw: string | null): Promise<number | undefined> {
  if (!raw) return undefined;
  if (raw === "me") {
    const me = await currentUser();
    return me?.id;
  }
  const n = Number(raw);
  return Number.isInteger(n) && n > 0 ? n : undefined;
}

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const filter = sp.get("filter") || "";
  const userId = await resolveUserId(sp.get("userId"));
  const channel = sp.get("channel") || undefined;
  const noReminder = sp.get("noReminder") === "1";
  const now = new Date();

  const where: Record<string, unknown> = { done: false };
  switch (filter) {
    case "done":
      // הושלמו — כולל משימות שאני יצרתי או שהופנו אליי
      where.done = true;
      if (userId) where.OR = [{ toUserId: userId }, { fromUserId: userId }];
      break;
    case "overdue":
      where.dueAt = { lt: now };
      if (userId) where.toUserId = userId;
      break;
    case "future":
      where.dueAt = { gt: now };
      if (userId) where.toUserId = userId;
      break;
    case "incoming":
      // נכנסות = משימות שהופנו אליי
      if (!userId) return NextResponse.json([]);
      where.toUserId = userId;
      break;
    case "outgoing":
      // יוצאות = משימות שאני פתחתי לאחרים
      if (!userId) return NextResponse.json([]);
      where.fromUserId = userId;
      break;
    default:
      // ללא פילטר — כל המשימות הפתוחות (אופציונלית לפי משתמש)
      if (userId) where.toUserId = userId;
      break;
  }
  if (channel) where.channel = channel;
  if (noReminder) where.dueAt = null; // 🔕 — ללא תזכורת

  const order = filter === "done" ? [{ doneAt: "desc" as const }] : orderBy;

  // עימוד (מסך /tasks — 25 בעמוד כמו במקור). בלי page — מערך, תאימות לאחור.
  const pageRaw = sp.get("page");
  if (pageRaw) {
    const page = Math.max(1, Number(pageRaw) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(sp.get("pageSize")) || 25));
    const [total, tasks] = await Promise.all([
      db.task.count({ where }),
      db.task.findMany({ where, include, orderBy: order, skip: (page - 1) * pageSize, take: pageSize }),
    ]);
    return NextResponse.json({ tasks, total, page, pageSize });
  }

  const tasks = await db.task.findMany({ where, include, orderBy: order, take: 200 });
  return NextResponse.json(tasks);
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body?.text || !String(body.text).trim()) {
    return NextResponse.json({ error: "חסר טקסט משימה" }, { status: 400 });
  }
  const me = await currentUser();
  const task = await db.task.create({
    data: {
      text: String(body.text).trim(),
      leadId: body.leadId ? Number(body.leadId) : null,
      fromUserId: body.fromUserId ? Number(body.fromUserId) : me?.id ?? null,
      toUserId: body.toUserId ? Number(body.toUserId) : null,
      urgent: !!body.urgent,
      channel: body.channel || null,
      dueAt: body.dueAt ? new Date(body.dueAt) : null,
    },
    include,
  });
  return NextResponse.json(task, { status: 201 });
}
