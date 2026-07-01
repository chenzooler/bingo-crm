// Lead providers — list with lead counts + create
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const providers = await db.leadProvider.findMany({
    include: { _count: { select: { leads: true } } },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(providers);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  if (!body.name) return NextResponse.json({ error: "שם חסר" }, { status: 400 });
  const p = await db.leadProvider.create({ data: body });
  return NextResponse.json(p, { status: 201 });
}
