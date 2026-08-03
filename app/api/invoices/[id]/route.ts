// עדכון סטטוס חשבונית — מעברים חוקיים בלבד:
//   draft → issued (נקבע issuedAt)
//   issued → paid (נקבע paidAt) | cancelled
// PATCH /api/invoices/[id] { status } → החשבונית המעודכנת.
// הנפקה ותשלום נרשמים כ-Activity על הליד.
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/current-user";
import { formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

const TRANSITIONS: Record<string, string[]> = {
  draft: ["issued"],
  issued: ["paid", "cancelled"],
  paid: [],
  cancelled: [],
};

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const invId = Number(id);
  if (!Number.isInteger(invId) || invId <= 0) {
    return NextResponse.json({ error: "מזהה חשבונית לא תקין" }, { status: 400 });
  }
  const body = await req.json().catch(() => null);
  const status = String(body?.status ?? "");
  if (!["issued", "paid", "cancelled"].includes(status)) {
    return NextResponse.json({ error: "סטטוס לא מוכר" }, { status: 400 });
  }

  const inv = await db.invoice.findUnique({ where: { id: invId } });
  if (!inv) return NextResponse.json({ error: "חשבונית לא נמצאה" }, { status: 404 });

  if (!TRANSITIONS[inv.status]?.includes(status)) {
    return NextResponse.json(
      { error: `אי אפשר לעבור מסטטוס "${inv.status}" ל"${status}"` },
      { status: 409 },
    );
  }

  const data: { status: string; issuedAt?: Date; paidAt?: Date } = { status };
  if (status === "issued") data.issuedAt = new Date();
  if (status === "paid") data.paidAt = new Date();

  const updated = await db.invoice.update({ where: { id: invId }, data });

  // תיעוד בכרטיס — הנפקה ותשלום בלבד
  if (status === "issued" || status === "paid") {
    const me = await currentUser();
    const total = updated.amount * (1 + updated.vatRate / 100);
    const text = status === "issued"
      ? `הונפקה חשבונית מס' ${updated.number} על ${formatCurrency(total)}`
      : `חשבונית מס' ${updated.number} סומנה כשולמה (${formatCurrency(total)})`;
    await db.activity.create({
      data: { leadId: updated.leadId, userId: me?.id ?? null, type: "system", text },
    });
  }

  return NextResponse.json({
    id: updated.id,
    number: updated.number,
    title: updated.title,
    amount: updated.amount,
    vatRate: updated.vatRate,
    status: updated.status,
    notes: updated.notes,
    issuedAt: updated.issuedAt ? updated.issuedAt.toISOString() : null,
    paidAt: updated.paidAt ? updated.paidAt.toISOString() : null,
    createdAt: updated.createdAt.toISOString(),
  });
}
