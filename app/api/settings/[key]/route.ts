// אחסון גנרי למסכי ההגדרות (AppSetting) — GET קורא (וזורע ברירת מחדל), PUT שומר.
import { NextRequest, NextResponse } from "next/server";
import { readAppSetting, writeAppSetting } from "@/lib/yoatsim/app-settings";
import { APP_SETTING_DEFAULTS } from "@/lib/yoatsim/app-defaults";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ key: string }> },
) {
  const { key } = await params;
  const value = await readAppSetting(key);
  if (value === undefined) {
    return NextResponse.json({ error: "מפתח הגדרה לא מוכר" }, { status: 404 });
  }
  return NextResponse.json({ key, value });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ key: string }> },
) {
  const { key } = await params;
  const def = APP_SETTING_DEFAULTS[key];
  if (def === undefined) {
    return NextResponse.json({ error: "מפתח הגדרה לא מוכר" }, { status: 404 });
  }

  let value: unknown;
  try {
    value = await req.json();
  } catch {
    return NextResponse.json({ error: "גוף הבקשה אינו JSON תקין" }, { status: 400 });
  }
  if (value === null || value === undefined) {
    return NextResponse.json({ error: "חסר ערך לשמירה" }, { status: 400 });
  }
  // ולידציה קלה: הצורה העליונה חייבת להתאים לברירת המחדל (מערך מול אובייקט)
  if (Array.isArray(def) !== Array.isArray(value) || typeof def !== typeof value) {
    return NextResponse.json({ error: "מבנה הערך אינו תואם להגדרה" }, { status: 400 });
  }

  await writeAppSetting(key, value);
  return NextResponse.json({ key, value });
}
