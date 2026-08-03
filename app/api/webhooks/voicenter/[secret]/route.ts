// POST /api/webhooks/voicenter/[secret] — קליטת CDR מ-Voicenter בסיום כל שיחה.
// אבטחה: אין חתימה — הסוד יושב בנתיב (AppSetting "telephony".webhookSecret).
// חייב להחזיר 200 מהר; מקבל JSON או form-urlencoded.
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { readAppSetting } from "@/lib/yoatsim/app-settings";
import type { TelephonyConfig } from "@/lib/yoatsim/app-defaults";
import { callStatusHebrew, normalizePhone } from "@/lib/voicenter";
import { processCall } from "@/lib/ai/pipeline";

export const dynamic = "force-dynamic";

type CdrPayload = Record<string, unknown>;

async function parseBody(req: NextRequest): Promise<CdrPayload | null> {
  const contentType = req.headers.get("content-type") ?? "";
  try {
    if (contentType.includes("application/json")) {
      return (await req.json()) as CdrPayload;
    }
    const text = await req.text();
    // ניסיון JSON גם בלי header נכון, אחרת form-urlencoded
    try {
      return JSON.parse(text) as CdrPayload;
    } catch {
      const params = new URLSearchParams(text);
      const out: CdrPayload = {};
      params.forEach((v, k) => { out[k] = v; });
      return Object.keys(out).length ? out : null;
    }
  } catch {
    return null;
  }
}

function str(payload: CdrPayload, key: string): string {
  const v = payload[key];
  return v === undefined || v === null ? "" : String(v);
}

export async function POST(req: NextRequest, ctx: { params: Promise<{ secret: string }> }) {
  const { secret } = await ctx.params;
  const cfg = await readAppSetting<TelephonyConfig>("telephony");
  if (!cfg?.webhookSecret || secret !== cfg.webhookSecret) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  const payload = await parseBody(req);
  // תמיד 200 — גם על גוף ריק, כדי ש-Voicenter לא ינסה שוב בלולאה
  if (!payload) return NextResponse.json({ ok: true });

  try {
    const ivruniqueid = str(payload, "ivruniqueid");
    const status = str(payload, "status") || "ANSWER";
    const duration = Number(str(payload, "duration")) || 0;
    const recordUrl = str(payload, "record") || null;
    const timeUnix = Number(str(payload, "time"));
    const endedAt = Number.isFinite(timeUnix) && timeUnix > 0 ? new Date(timeUnix * 1000) : new Date();
    const callRowId = Number(str(payload, "var_CallRowID")) || null;
    const callerPhone = normalizePhone(str(payload, "callerPhone"));
    const targetPhone = normalizePhone(str(payload, "target"));

    // התאמה: קודם לפי CALLID, אחרת לפי var_CallRowID שהדהדנו
    let call =
      (ivruniqueid
        ? await db.call.findUnique({ where: { voicenterId: ivruniqueid } })
        : null) ??
      (callRowId ? await db.call.findUnique({ where: { id: callRowId } }) : null);

    if (call) {
      call = await db.call.update({
        where: { id: call.id },
        data: {
          status,
          duration,
          recordUrl,
          endedAt,
          voicenterId: call.voicenterId ?? (ivruniqueid || null),
        },
      });
    } else {
      // שיחה שלא יזמנו (נכנסת) — יוצרים שורה ומנסים לשייך ליד לפי הטלפון
      const phoneForMatch = callerPhone || targetPhone;
      const lead = phoneForMatch
        ? await db.lead.findFirst({
            where: { phone: { contains: phoneForMatch.slice(-9) } },
            select: { id: true },
          })
        : null;
      call = await db.call.create({
        data: {
          leadId: lead?.id ?? null,
          voicenterId: ivruniqueid || null,
          direction: str(payload, "direction") || "incoming",
          status,
          duration,
          recordUrl,
          targetPhone: targetPhone || callerPhone || null,
          endedAt,
        },
      });
    }

    if (call.leadId) {
      await db.activity.create({
        data: {
          leadId: call.leadId,
          userId: call.userId,
          type: "call",
          text: `שיחה הסתיימה: ${callStatusHebrew(status)} · ${duration} שנ'`,
          metaJson: JSON.stringify({ recordUrl, callRowId: call.id, status, duration }),
        },
      });
    }

    // --- הדק את צינור ה-AI, בלי לחסום את ה-200 ---
    // Voicenter מצפה לתשובה מהירה, ותמלול+ניתוח לוקחים עשרות שניות. לכן
    // יורים את התהליך ומוותרים על ה-Promise (void + catch). המחיר: אם תהליך
    // ה-Node נסגר באמצע (deploy, scale-to-zero) העיבוד נקטע והשיחה נשארת
    // ב-aiStatus שאינו "done". רשת הביטחון לכך היא POST /api/ai/process-pending
    // שאוסף שיחות ממתינות/כושלות ומריץ אותן מחדש.
    if (call.recordUrl && status === "ANSWER") {
      const idForAi = call.id;
      void processCall(idForAi).catch(() => {
        // processCall כבר לא זורק; ה-catch כאן הוא רק חגורת ביטחון
      });
    }
  } catch {
    // בולעים שגיאות — חובה 200 מהיר כלפי Voicenter
  }

  return NextResponse.json({ ok: true });
}
