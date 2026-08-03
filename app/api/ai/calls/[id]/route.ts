// GET /api/ai/calls/[id] — תמלול + ניתוח של שיחה, ל-UI הסקירה.
// כל שדות ה-JSON מוחזרים כאובייקטים מפוענחים, לא כמחרוזות.
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

function parse<T>(raw: string | null | undefined, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const callId = Number(id);
  if (!Number.isInteger(callId) || callId <= 0) {
    return NextResponse.json({ error: "מזהה שיחה לא תקין" }, { status: 400 });
  }

  const call = await db.call.findUnique({
    where: { id: callId },
    include: {
      transcript: true,
      analysis: true,
      alerts: { orderBy: { createdAt: "desc" } },
      lead: { select: { id: true, fullName: true, phone: true, stage: true } },
      user: { select: { id: true, name: true, emoji: true } },
    },
  });

  if (!call) {
    return NextResponse.json({ error: "שיחה לא נמצאה" }, { status: 404 });
  }

  return NextResponse.json({
    call: {
      id: call.id,
      leadId: call.leadId,
      userId: call.userId,
      direction: call.direction,
      status: call.status,
      duration: call.duration,
      recordUrl: call.recordUrl,
      targetPhone: call.targetPhone,
      disposition: call.disposition,
      dialedAt: call.dialedAt,
      endedAt: call.endedAt,
      aiStatus: call.aiStatus,
      aiError: call.aiError,
    },
    lead: call.lead,
    agent: call.user,
    transcript: call.transcript
      ? {
          text: call.transcript.text,
          segments: parse<unknown[]>(call.transcript.segmentsJson, []),
          language: call.transcript.language,
          provider: call.transcript.provider,
          durationSec: call.transcript.durationSec,
          wordCount: call.transcript.wordCount,
          createdAt: call.transcript.createdAt,
        }
      : null,
    analysis: call.analysis
      ? {
          score: call.analysis.score,
          summary: call.analysis.summary,
          sentiment: call.analysis.sentiment,
          outcomeGuess: call.analysis.outcomeGuess,
          compliance: parse<unknown[]>(call.analysis.complianceJson, []),
          objections: parse<unknown[]>(call.analysis.objectionsJson, []),
          extracted: parse<Record<string, unknown>>(call.analysis.extractedJson, {}),
          coaching: parse<unknown[]>(call.analysis.coachingJson, []),
          moments: parse<unknown[]>(call.analysis.momentsJson, []),
          violationCount: call.analysis.violationCount,
          model: call.analysis.model,
          tokensIn: call.analysis.tokensIn,
          tokensOut: call.analysis.tokensOut,
          createdAt: call.analysis.createdAt,
        }
      : null,
    alerts: call.alerts,
  });
}
