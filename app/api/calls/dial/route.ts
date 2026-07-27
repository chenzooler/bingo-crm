// POST /api/calls/dial — חיוג Click2Call דרך Voicenter.
// גוף: { leadId?, phone? } — לפחות אחד. השלוחה נלקחת מ-User.sipExtension של המשתמש הנוכחי.
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/current-user";
import { click2call, normalizePhone } from "@/lib/voicenter";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "גוף בקשה חסר" }, { status: 400 });

  const me = await currentUser();
  if (!me) return NextResponse.json({ error: "משתמש לא מזוהה" }, { status: 401 });
  if (!me.sipExtension) {
    return NextResponse.json(
      { error: "בחר שלוחה בהגדרות הטלפוניה" },
      { status: 400 },
    );
  }

  const leadId = body.leadId ? Number(body.leadId) : null;
  const lead = leadId
    ? await db.lead.findUnique({ where: { id: leadId }, select: { id: true, phone: true, fullName: true } })
    : null;
  if (leadId && !lead) return NextResponse.json({ error: "ליד לא נמצא" }, { status: 404 });

  const target = normalizePhone(String(body.phone ?? lead?.phone ?? ""));
  if (!target || target.length < 9) {
    return NextResponse.json({ error: "אין מספר טלפון תקין לחיוג" }, { status: 400 });
  }

  // שורת השיחה נוצרת לפני החיוג — var_CallRowID מאפשר התאמה גם בלי CALLID
  const call = await db.call.create({
    data: {
      leadId: lead?.id ?? null,
      userId: me.id,
      direction: "click2call",
      status: "dialing",
      extension: me.sipExtension,
      targetPhone: target,
    },
  });

  const result = await click2call({
    extension: me.sipExtension,
    target,
    vars: {
      var_LeadID: lead?.id ?? "",
      var_UserID: me.id,
      var_CallRowID: call.id,
    },
  });

  if (!result.ok) {
    await db.call.update({
      where: { id: call.id },
      data: { status: "error", endedAt: new Date() },
    });
    return NextResponse.json({ ok: false, error: result.error, callRowId: call.id }, { status: 502 });
  }

  await db.call.update({ where: { id: call.id }, data: { voicenterId: result.callId } });

  if (lead) {
    await db.activity.create({
      data: {
        leadId: lead.id,
        userId: me.id,
        type: "call",
        text: "חיוג ללקוח התחיל (תותח)",
        metaJson: JSON.stringify({ callRowId: call.id, voicenterId: result.callId, target }),
      },
    });
  }

  return NextResponse.json({ ok: true, callId: result.callId, callRowId: call.id });
}
