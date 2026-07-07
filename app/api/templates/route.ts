// תבניות הודעות (שכפול Yoatsim) — רשימה + יצירה
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

const CHANNELS = ["sms", "whatsapp", "wati", "email"];
const SENDERS = ["", "972505696756", "bingoisrael", "bingocredit"];

export async function GET() {
  const templates = await db.messageTemplate.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json({ templates });
}

export async function POST(req: NextRequest) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "גוף הבקשה אינו JSON תקין" }, { status: 400 });
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  if (!name) return NextResponse.json({ error: "שם התבנית חובה" }, { status: 400 });
  const channel = typeof body.channel === "string" ? body.channel : "sms";
  if (!CHANNELS.includes(channel)) return NextResponse.json({ error: "ערוץ לא מוכר" }, { status: 400 });
  const sender = typeof body.sender === "string" ? body.sender : "";
  if (!SENDERS.includes(sender)) return NextResponse.json({ error: "שולח לא מוכר" }, { status: 400 });

  let watiJson: string | null = null;
  if (body.watiJson != null && body.watiJson !== "") {
    const raw = typeof body.watiJson === "string" ? body.watiJson : JSON.stringify(body.watiJson);
    try {
      JSON.parse(raw);
    } catch {
      return NextResponse.json({ error: "watiJson אינו JSON תקין" }, { status: 400 });
    }
    watiJson = raw;
  }

  try {
    const template = await db.messageTemplate.create({
      data: {
        name,
        channel,
        sender,
        body: typeof body.body === "string" ? body.body : null,
        watiJson,
      },
    });
    return NextResponse.json(template, { status: 201 });
  } catch (e: any) {
    if (e?.code === "P2002") return NextResponse.json({ error: "כבר קיימת תבנית בשם הזה" }, { status: 409 });
    return NextResponse.json({ error: "שגיאה ביצירת התבנית" }, { status: 500 });
  }
}
