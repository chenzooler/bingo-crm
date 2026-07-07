// עריכה/מחיקה של תבנית הודעה בודדת
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

const CHANNELS = ["sms", "whatsapp", "wati", "email"];
const SENDERS = ["", "972505696756", "bingoisrael", "bingocredit"];

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const templateId = Number(id);
  if (!Number.isInteger(templateId)) {
    return NextResponse.json({ error: "מזהה תבנית לא תקין" }, { status: 400 });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "גוף הבקשה אינו JSON תקין" }, { status: 400 });
  }

  const data: Record<string, unknown> = {};
  if (typeof body.name === "string") {
    if (!body.name.trim()) return NextResponse.json({ error: "שם התבנית לא יכול להיות ריק" }, { status: 400 });
    data.name = body.name.trim();
  }
  if (typeof body.channel === "string") {
    if (!CHANNELS.includes(body.channel)) return NextResponse.json({ error: "ערוץ לא מוכר" }, { status: 400 });
    data.channel = body.channel;
  }
  if (typeof body.sender === "string") {
    if (!SENDERS.includes(body.sender)) return NextResponse.json({ error: "שולח לא מוכר" }, { status: 400 });
    data.sender = body.sender;
  }
  if (typeof body.body === "string" || body.body === null) data.body = body.body;
  if (body.watiJson !== undefined) {
    if (body.watiJson === null || body.watiJson === "") {
      data.watiJson = null;
    } else {
      const raw = typeof body.watiJson === "string" ? body.watiJson : JSON.stringify(body.watiJson);
      try {
        JSON.parse(raw);
      } catch {
        return NextResponse.json({ error: "watiJson אינו JSON תקין" }, { status: 400 });
      }
      data.watiJson = raw;
    }
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "אין שדות לעדכון" }, { status: 400 });
  }

  try {
    const template = await db.messageTemplate.update({ where: { id: templateId }, data });
    return NextResponse.json(template);
  } catch (e: any) {
    if (e?.code === "P2025") return NextResponse.json({ error: "תבנית לא נמצאה" }, { status: 404 });
    if (e?.code === "P2002") return NextResponse.json({ error: "כבר קיימת תבנית בשם הזה" }, { status: 409 });
    return NextResponse.json({ error: "שגיאה בעדכון התבנית" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const templateId = Number(id);
  if (!Number.isInteger(templateId)) {
    return NextResponse.json({ error: "מזהה תבנית לא תקין" }, { status: 400 });
  }
  try {
    await db.messageTemplate.delete({ where: { id: templateId } });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    if (e?.code === "P2025") return NextResponse.json({ error: "תבנית לא נמצאה" }, { status: 404 });
    return NextResponse.json({ error: "שגיאה במחיקת התבנית" }, { status: 500 });
  }
}
