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
    // ספרות בלבד משוות מול טלפון/ת.ז — שאילתה עברית לא תתפוס הכל דרך contains("")
    const digits = q.replace(/\D/g, "");
    where.OR = [
      { fullName: { contains: q } },
      { email: { contains: q } },
      ...(digits ? [{ phone: { contains: digits } }, { idNumber: { contains: digits } }] : []),
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

// יצירת ליד ידנית — כמו ב-Yoatsim: כל ליד חדש נכנס למחלקת החתמות בסטטוס "ליד חדש".
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const fullName = typeof body?.fullName === "string" && body.fullName.trim()
    ? body.fullName.trim()
    : "ליד חדש";

  const lead = await db.lead.create({
    data: {
      fullName,
      phone: typeof body?.phone === "string" && body.phone.trim() ? body.phone.trim() : null,
      source: "manual",
      syncSource: "manual",
      cardKind: "card",
    },
  });
  await db.leadProcess.create({
    data: { leadId: lead.id, processKey: "signatures", statusKey: "ליד חדש" },
  });
  await db.activity.create({
    data: { leadId: lead.id, type: "system", text: "ליד נוצר ידנית" },
  });

  return NextResponse.json(lead, { status: 201 });
}
