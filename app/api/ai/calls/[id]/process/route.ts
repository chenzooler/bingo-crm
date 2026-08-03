// POST /api/ai/calls/[id]/process — הרצה ידנית של צינור ה-AI על שיחה.
// גוף אופציונלי: { force?: boolean } — הרצה מחדש גם על שיחה שכבר נותחה.
import { NextRequest, NextResponse } from "next/server";
import { processCall } from "@/lib/ai/pipeline";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const callId = Number(id);
  if (!Number.isInteger(callId) || callId <= 0) {
    return NextResponse.json({ error: "מזהה שיחה לא תקין" }, { status: 400 });
  }

  const body = await req.json().catch(() => null);
  const force = !!body?.force;

  const result = await processCall(callId, { force });
  const status = result.status === "failed" ? 500 : 200;
  return NextResponse.json(result, { status });
}
