// Dashboard stats — live counts from the real DB
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const [total, byStageRaw, providers, lenders, users, lastImport] = await Promise.all([
    db.lead.count(),
    db.lead.groupBy({ by: ["stage"], _count: { _all: true } }),
    db.leadProvider.count(),
    db.lender.count(),
    db.user.count({ where: { active: true } }),
    db.importBatch.findFirst({ orderBy: { createdAt: "desc" } }),
  ]);

  const byStage: Record<string, number> = {};
  for (const s of byStageRaw) byStage[s.stage] = s._count._all;

  return NextResponse.json({ total, byStage, providers, lenders, users, lastImport });
}
