// GET /api/alerts — התראות למנהלים.
// פרמטרים: ?unread=1 (רק שלא נקראו) · ?limit=N (ברירת מחדל 50) ·
//           ?open=1 (רק שלא טופלו) · ?severity=critical · ?agentId=N
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const where: Record<string, unknown> = {};

  if (sp.get("unread") === "1") where.readAt = null;
  if (sp.get("open") === "1") where.resolvedAt = null;
  const severity = sp.get("severity");
  if (severity) where.severity = severity;
  const agentId = Number(sp.get("agentId"));
  if (Number.isInteger(agentId) && agentId > 0) where.agentId = agentId;

  const limit = Math.min(200, Math.max(1, Number(sp.get("limit")) || 50));

  const [alerts, unreadCount] = await Promise.all([
    db.alert.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        agent: { select: { id: true, name: true, emoji: true } },
        call: { select: { id: true, duration: true, recordUrl: true, dialedAt: true } },
      },
    }),
    db.alert.count({ where: { readAt: null } }),
  ]);

  return NextResponse.json({ alerts, unreadCount });
}
