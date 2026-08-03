// POST /api/ai/process-pending — רשת הביטחון של הצינור.
// מריץ עיבוד על שיחות שממתינות (ועל כשלים ישנים). בטוח לקריאה מ-cron.
// גוף אופציונלי: { limit?: number } (ברירת מחדל 10, מקסימום 50).
import { NextRequest, NextResponse } from "next/server";
import { processPending } from "@/lib/ai/pipeline";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const limit = Number(body?.limit) || 10;

  try {
    const result = await processPending(limit);
    return NextResponse.json({
      ok: true,
      processed: result.processed,
      results: result.results,
    });
  } catch (err) {
    return NextResponse.json(
      { error: `עיבוד השיחות הממתינות נכשל: ${(err as Error).message}` },
      { status: 500 },
    );
  }
}
