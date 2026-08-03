// חשבוניות של ליד — מסמכים פנימיים ממוספרים (לא חשבונית מס רשמית).
// GET  /api/leads/[id]/invoices → { invoices: [...] }
// POST /api/leads/[id]/invoices { title?, amount, vatRate?, notes? } → החשבונית שנוצרה (draft).
// המספור רץ גלובלית: (המספר הגבוה ביותר)+1, בטרנזקציה כדי שלא יהיו כפילויות.
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/current-user";

export const dynamic = "force-dynamic";

function toDTO(inv: {
  id: number; number: number; title: string; amount: number; vatRate: number;
  status: string; notes: string | null; issuedAt: Date | null; paidAt: Date | null; createdAt: Date;
}) {
  return {
    id: inv.id,
    number: inv.number,
    title: inv.title,
    amount: inv.amount,
    vatRate: inv.vatRate,
    status: inv.status,
    notes: inv.notes,
    issuedAt: inv.issuedAt ? inv.issuedAt.toISOString() : null,
    paidAt: inv.paidAt ? inv.paidAt.toISOString() : null,
    createdAt: inv.createdAt.toISOString(),
  };
}

async function leadIdFrom(ctx: { params: Promise<{ id: string }> }): Promise<number | null> {
  const { id } = await ctx.params;
  const n = Number(id);
  return Number.isInteger(n) && n > 0 ? n : null;
}

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const leadId = await leadIdFrom(ctx);
  if (!leadId) return NextResponse.json({ error: "מזהה ליד לא תקין" }, { status: 400 });
  const invoices = await db.invoice.findMany({
    where: { leadId },
    orderBy: { number: "desc" },
  });
  return NextResponse.json({ invoices: invoices.map(toDTO) });
}

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const leadId = await leadIdFrom(ctx);
  if (!leadId) return NextResponse.json({ error: "מזהה ליד לא תקין" }, { status: 400 });

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "גוף בקשה חסר" }, { status: 400 });

  const amount = Number(body.amount);
  if (!Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json({ error: "סכום החשבונית חייב להיות מספר חיובי" }, { status: 400 });
  }
  const vatRate = body.vatRate === undefined || body.vatRate === null ? 18 : Number(body.vatRate);
  if (!Number.isFinite(vatRate) || vatRate < 0 || vatRate > 100) {
    return NextResponse.json({ error: "שיעור מע\"מ לא תקין" }, { status: 400 });
  }
  const title = String(body.title ?? "").trim() || "שכר טרחה - תיווך אשראי";
  const notes = body.notes ? String(body.notes).trim() : null;

  const lead = await db.lead.findUnique({ where: { id: leadId }, select: { id: true } });
  if (!lead) return NextResponse.json({ error: "ליד לא נמצא" }, { status: 404 });

  const me = await currentUser();

  // מספור רץ בטרנזקציה — max+1
  const invoice = await db.$transaction(async (tx) => {
    const last = await tx.invoice.aggregate({ _max: { number: true } });
    const number = (last._max.number ?? 0) + 1;
    return tx.invoice.create({
      data: {
        number,
        leadId,
        title,
        amount,
        vatRate,
        notes,
        status: "draft",
        createdById: me?.id ?? null,
      },
    });
  });

  return NextResponse.json(toDTO(invoice), { status: 201 });
}
