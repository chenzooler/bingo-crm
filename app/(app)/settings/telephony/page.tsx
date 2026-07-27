// הגדרות טלפוניה (Voicenter) — סטטוס חיבור, שלוחות, שיוך שלוחה למשתמש,
// כתובת ה-webhook ל-CDR ושיחת בדיקה.
import { db } from "@/lib/db";
import { readAppSetting } from "@/lib/yoatsim/app-settings";
import type { TelephonyConfig } from "@/lib/yoatsim/app-defaults";
import { getExtensions, type VoicenterExtension } from "@/lib/voicenter";
import { TelephonySettings } from "@/components/settings/TelephonySettings";

export const dynamic = "force-dynamic";

export default async function TelephonySettingsPage() {
  const [users, cfg] = await Promise.all([
    db.user.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true, emoji: true, sipExtension: true },
    }),
    readAppSetting<TelephonyConfig>("telephony"),
  ]);

  let extensions: VoicenterExtension[] = [];
  let connectionError: string | null = null;
  try {
    extensions = await getExtensions();
  } catch (e) {
    connectionError = e instanceof Error ? e.message : "החיבור ל-Voicenter נכשל";
  }

  return (
    <TelephonySettings
      users={users}
      extensions={extensions}
      connectionError={connectionError}
      webhookSecret={cfg?.webhookSecret ?? "bingo-cdr-CHANGE-ME"}
    />
  );
}
