// דפי נחיתה — שכפול Yoatsim §2. הרשימה ב-AppSetting "landing-pages",
// ספירת לידים חיה לפי Lead.sourceText (התאמה לשם הדף).
import { db } from "@/lib/db";
import { readAppSetting } from "@/lib/yoatsim/app-settings";
import { APP_SETTING_DEFAULTS, type LandingPage } from "@/lib/yoatsim/app-defaults";
import LandingPagesManager from "@/components/settings/LandingPagesManager";

export const dynamic = "force-dynamic";

export default async function LandingPagesPage() {
  const pages =
    (await readAppSetting<LandingPage[]>("landing-pages")) ??
    (APP_SETTING_DEFAULTS["landing-pages"] as LandingPage[]);

  // ספירת לידים לפי פירוט מקור — best effort: sourceText == שם הדף
  const grouped = await db.lead.groupBy({
    by: ["sourceText"],
    where: { sourceText: { not: null } },
    _count: { _all: true },
  });
  const leadCounts: Record<string, number> = {};
  for (const g of grouped) {
    if (g.sourceText) leadCounts[g.sourceText] = g._count._all;
  }

  return <LandingPagesManager initial={pages} leadCounts={leadCounts} />;
}
