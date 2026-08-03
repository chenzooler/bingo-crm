// GET /api/ai/status — יכולות ה-AI + מונים, למסך ההגדרות.
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ANALYSIS_MODEL, aiCapabilities, aiModeLabel } from "@/lib/ai/config";

export const dynamic = "force-dynamic";

export async function GET() {
  const caps = aiCapabilities();

  const [done, pending, failed, skipped, inFlight, rules, activeRules, unreadAlerts] =
    await Promise.all([
      db.call.count({ where: { aiStatus: "done" } }),
      db.call.count({
        where: { aiStatus: "pending", status: "ANSWER", recordUrl: { not: null } },
      }),
      db.call.count({ where: { aiStatus: "failed" } }),
      db.call.count({ where: { aiStatus: "skipped" } }),
      db.call.count({ where: { aiStatus: { in: ["transcribing", "analyzing"] } } }),
      db.complianceRule.count(),
      db.complianceRule.count({ where: { active: true } }),
      db.alert.count({ where: { readAt: null } }),
    ]);

  return NextResponse.json({
    capabilities: caps,
    mode: aiModeLabel(),
    model: caps.analysis === "claude" ? ANALYSIS_MODEL : "mock",
    counts: {
      processed: done,
      pending,
      failed,
      skipped,
      inFlight,
      rules,
      activeRules,
      unreadAlerts,
    },
  });
}
