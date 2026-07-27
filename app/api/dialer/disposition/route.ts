// POST /api/dialer/disposition — סיווג סוף שיחה בתותח.
// גוף: { callRowId?, leadId, disposition, note?, callbackAt? }
//   no-answer      → כלום נוסף (סולם החזרות של התור מטפל)
//   callback       → משימת חזרה (channel=call, dueAt חובה)
//   not-interested → שיוך לתהליך "לא מעוניינים/רלוונטים" בסטטוס "לא מעוניין לאחר הסבר"
//   advanced       → כלום נוסף (הנציג ממשיך בכרטיס)
// תמיד: Call.disposition + Activity על הליד.
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/current-user";

export const dynamic = "force-dynamic";

const DISPOSITION_HEBREW: Record<string, string> = {
  "no-answer": "אין מענה",
  callback: "לחזור ללקוח",
  advanced: "התקדם בתהליך",
  "not-interested": "לא מעוניין",
};

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "גוף בקשה חסר" }, { status: 400 });

  const me = await currentUser();
  if (!me) return NextResponse.json({ error: "משתמש לא מזוהה" }, { status: 401 });

  const leadId = Number(body.leadId);
  if (!Number.isFinite(leadId)) return NextResponse.json({ error: "מזהה ליד חסר" }, { status: 400 });
  const disposition = String(body.disposition ?? "");
  const label = DISPOSITION_HEBREW[disposition];
  if (!label) return NextResponse.json({ error: "סיווג לא מוכר" }, { status: 400 });

  const note = body.note ? String(body.note).trim() : "";

  // שורת השיחה: לפי מזהה מפורש, אחרת האחרונה של הליד
  const callRowId = body.callRowId ? Number(body.callRowId) : null;
  const call = callRowId
    ? await db.call.findUnique({ where: { id: callRowId } })
    : await db.call.findFirst({ where: { leadId }, orderBy: { dialedAt: "desc" } });
  if (call) {
    await db.call.update({ where: { id: call.id }, data: { disposition } });
  }

  if (disposition === "callback") {
    if (!body.callbackAt) {
      return NextResponse.json({ error: "חסר מועד חזרה ללקוח" }, { status: 400 });
    }
    const dueAt = new Date(body.callbackAt);
    if (Number.isNaN(dueAt.getTime())) {
      return NextResponse.json({ error: "מועד חזרה לא תקין" }, { status: 400 });
    }
    await db.task.create({
      data: {
        leadId,
        fromUserId: me.id,
        toUserId: me.id,
        channel: "call",
        dueAt,
        text: note ? `לחזור ללקוח - ${note}` : "לחזור ללקוח",
      },
    });
  }

  if (disposition === "not-interested") {
    // upsert בסגנון המנוע — אם כבר בתהליך מעדכנים סטטוס, אחרת יוצרים שיוך
    const existing = await db.leadProcess.findFirst({
      where: { leadId, processKey: "not-interested" },
    });
    if (existing) {
      await db.leadProcess.update({
        where: { id: existing.id },
        data: { statusKey: "לא מעוניין לאחר הסבר", responsibleId: me.id },
      });
    } else {
      await db.leadProcess.create({
        data: {
          leadId,
          processKey: "not-interested",
          statusKey: "לא מעוניין לאחר הסבר",
          responsibleId: me.id,
        },
      });
    }
  }

  await db.activity.create({
    data: {
      leadId,
      userId: me.id,
      type: "call",
      text: `סיווג שיחה: ${label}${note ? ` · ${note}` : ""}`,
      metaJson: JSON.stringify({ disposition, callRowId: call?.id ?? null }),
    },
  });

  return NextResponse.json({ ok: true });
}
