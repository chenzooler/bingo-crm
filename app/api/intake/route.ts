// קבלת לידים / API — נקודת הקליטה האמיתית (דפי נחיתה, אינטגרציות).
// אימות: header x-api-key מול ההגדרה "lead-intake". מתועד ב-/settings/leads-api.
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { readAppSetting } from "@/lib/yoatsim/app-settings";
import type { LeadIntakeConfig } from "@/lib/yoatsim/app-defaults";
import { processByKey } from "@/lib/yoatsim/processes";

export const dynamic = "force-dynamic";

function optStr(v: unknown): string | null {
  return typeof v === "string" && v.trim() ? v.trim() : null;
}

export async function POST(req: NextRequest) {
  const config = await readAppSetting<LeadIntakeConfig>("lead-intake");
  if (!config) {
    return NextResponse.json({ error: "הגדרת הקליטה חסרה" }, { status: 500 });
  }

  const apiKey = req.headers.get("x-api-key");
  if (!apiKey || apiKey !== config.apiKey) {
    return NextResponse.json({ error: "מפתח API שגוי או חסר" }, { status: 401 });
  }
  if (!config.active) {
    return NextResponse.json({ error: "קליטת הלידים כבויה בהגדרות" }, { status: 403 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "גוף הבקשה אינו JSON תקין" }, { status: 400 });
  }

  const fullName = optStr(body.fullName);
  if (!fullName) {
    return NextResponse.json({ error: "fullName חובה" }, { status: 400 });
  }

  const amountRaw = body.amountRequested;
  const amountRequested =
    typeof amountRaw === "number" && Number.isFinite(amountRaw)
      ? amountRaw
      : typeof amountRaw === "string" && amountRaw.trim() && Number.isFinite(Number(amountRaw))
        ? Number(amountRaw)
        : null;

  // תהליך+סטטוס ברירת מחדל מההגדרות; אם הסטטוס לא קיים בתהליך — הראשון בתהליך
  const proc = processByKey(config.defaultProcess);
  const processKey = proc?.key ?? "signatures";
  const statusKey =
    proc && proc.statuses.includes(config.defaultStatus)
      ? config.defaultStatus
      : (proc?.statuses[0] ?? "ליד חדש");

  const source = optStr(body.source);
  const sourceText = optStr(body.sourceText);

  const lead = await db.lead.create({
    data: {
      fullName,
      phone: optStr(body.phone),
      email: optStr(body.email),
      source,
      sourceText,
      amountRequested,
      loanPurpose: optStr(body.loanPurpose),
      syncSource: "api",
      processes: { create: { processKey, statusKey } },
      activities: {
        create: {
          type: "system",
          text: "ליד התקבל מ-API",
          metaJson: JSON.stringify({ source, sourceText, processKey, statusKey }),
        },
      },
    },
    select: { id: true },
  });

  return NextResponse.json({ id: lead.id }, { status: 201 });
}
