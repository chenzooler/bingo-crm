// טפסים שנשלחו/נחתמו (SentForm) — GET רשימה · POST שליחה (סימולציה) · PATCH חתימה.
// התבניות ב-lib/yoatsim/forms.ts; הסקשן בכרטיס: components/classic/CustomSections.tsx.
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { formTemplateByName } from "@/lib/yoatsim/forms";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const leadIdRaw = req.nextUrl.searchParams.get("leadId");
  const leadId = leadIdRaw ? Number(leadIdRaw) : null;
  if (leadIdRaw && !Number.isInteger(leadId)) {
    return NextResponse.json({ error: "leadId לא תקין" }, { status: 400 });
  }
  const forms = await db.sentForm.findMany({
    where: leadId ? { leadId } : undefined,
    include: { lead: { select: { id: true, fullName: true } } },
    orderBy: { sentAt: "desc" },
  });
  return NextResponse.json({ forms });
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "גוף הבקשה אינו JSON תקין" }, { status: 400 });
  }

  const leadId = Number(body.leadId);
  const templateName = typeof body.templateName === "string" ? body.templateName : "";
  if (!Number.isInteger(leadId) || leadId <= 0) {
    return NextResponse.json({ error: "leadId חובה" }, { status: 400 });
  }
  if (!formTemplateByName(templateName)) {
    return NextResponse.json({ error: "תבנית טופס לא מוכרת" }, { status: 400 });
  }
  const lead = await db.lead.findUnique({ where: { id: leadId }, select: { id: true } });
  if (!lead) return NextResponse.json({ error: "ליד לא נמצא" }, { status: 404 });

  const form = await db.sentForm.create({
    data: { leadId, templateName },
    include: { lead: { select: { id: true, fullName: true } } },
  });
  await db.activity.create({
    data: {
      leadId,
      type: "form",
      text: `נשלח טופס: ${templateName} ללקוח בווטסאפ (סימולציה)`,
    },
  });
  return NextResponse.json(form, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "גוף הבקשה אינו JSON תקין" }, { status: 400 });
  }

  const id = Number(body.id);
  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ error: "id חובה" }, { status: 400 });
  }
  if (body.status !== "signed") {
    return NextResponse.json({ error: "status חייב להיות signed" }, { status: 400 });
  }

  const existing = await db.sentForm.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "טופס לא נמצא" }, { status: 404 });
  if (existing.status === "signed") {
    // אידמפוטנטי — כבר נחתם
    const withLead = await db.sentForm.findUnique({
      where: { id },
      include: { lead: { select: { id: true, fullName: true } } },
    });
    return NextResponse.json(withLead);
  }

  const form = await db.sentForm.update({
    where: { id },
    data: { status: "signed", signedAt: new Date() },
    include: { lead: { select: { id: true, fullName: true } } },
  });
  await db.activity.create({
    data: { leadId: form.leadId, type: "form", text: `טופס נחתם: ${form.templateName}` },
  });
  return NextResponse.json(form);
}
