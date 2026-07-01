// Funding bodies — list with check counts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const lenders = await db.lender.findMany({
    include: { _count: { select: { checks: true } } },
    orderBy: [{ botSupported: "desc" }, { name: "asc" }],
  });
  return NextResponse.json(lenders);
}
