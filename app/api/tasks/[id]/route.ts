// Task item API — סימון כבוצעה / עריכת טקסט ותאריך יעד.
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

const include = {
  lead: { select: { id: true, fullName: true } },
  fromUser: { select: { id: true, name: true, emoji: true } },
  toUser: { select: { id: true, name: true, emoji: true } },
};

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const taskId = Number(id);
  if (!Number.isInteger(taskId) || taskId <= 0) {
    return NextResponse.json({ error: "מזהה לא תקין" }, { status: 400 });
  }
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "גוף בקשה חסר" }, { status: 400 });

  const prev = await db.task.findUnique({ where: { id: taskId } });
  if (!prev) return NextResponse.json({ error: "משימה לא נמצאה" }, { status: 404 });

  const data: Record<string, unknown> = {};
  if (body.done !== undefined) {
    data.done = !!body.done;
    data.doneAt = body.done ? new Date() : null;
  }
  if (body.text !== undefined) data.text = String(body.text);
  if (body.dueAt !== undefined) data.dueAt = body.dueAt ? new Date(body.dueAt) : null;
  if (body.urgent !== undefined) data.urgent = !!body.urgent;
  if (body.channel !== undefined) data.channel = body.channel || null;

  const task = await db.task.update({ where: { id: taskId }, data, include });
  return NextResponse.json(task);
}
