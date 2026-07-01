// Leads API — list with filters/search/pagination + create
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const page = Math.max(1, Number(sp.get("page") || 1));
  const pageSize = Math.min(100, Number(sp.get("pageSize") || 50));
  const q = sp.get("q")?.trim();
  const stage = sp.get("stage");
  const category = sp.get("category");
  const ownerId = sp.get("ownerId");
  const providerId = sp.get("providerId");

  const where: any = {};
  if (stage) where.stage = stage;
  if (category) where.category = category;
  if (ownerId) where.ownerId = Number(ownerId);
  if (providerId) where.providerId = Number(providerId);
  if (q) {
    where.OR = [
      { fullName: { contains: q } },
      { phone: { contains: q.replace(/\D/g, "") } },
      { idNumber: { contains: q.replace(/\D/g, "") } },
      { email: { contains: q } },
    ];
  }

  const [total, leads] = await Promise.all([
    db.lead.count({ where }),
    db.lead.findMany({
      where,
      include: { owner: { select: { id: true, name: true, emoji: true } }, provider: { select: { id: true, name: true } } },
      orderBy: { intakeDate: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  return NextResponse.json({ total, page, pageSize, leads });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  if (!body.fullName) return NextResponse.json({ error: "שם חסר" }, { status: 400 });
  const lead = await db.lead.create({ data: { ...body, syncSource: body.syncSource || "manual" } });
  return NextResponse.json(lead, { status: 201 });
}
