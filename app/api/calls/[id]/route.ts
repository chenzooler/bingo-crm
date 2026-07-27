// GET /api/calls/[id] — מצב שיחה בודדת (פולינג הקוקפיט בזמן חיוג)
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const callId = Number(id);
  if (!Number.isFinite(callId)) return NextResponse.json({ error: "מזהה לא תקין" }, { status: 400 });
  const call = await db.call.findUnique({
    where: { id: callId },
    select: {
      id: true, status: true, duration: true, disposition: true,
      recordUrl: true, dialedAt: true, endedAt: true, leadId: true,
      errorText: true,
    },
  });
  if (!call) return NextResponse.json({ error: "שיחה לא נמצאה" }, { status: 404 });
  return NextResponse.json(call);
}
