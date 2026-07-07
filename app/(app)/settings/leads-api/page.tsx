// קבלת לידים / API — שכפול Yoatsim §2. הנתונים: AppSetting "lead-intake".
import { readAppSetting } from "@/lib/yoatsim/app-settings";
import { APP_SETTING_DEFAULTS, type LeadIntakeConfig } from "@/lib/yoatsim/app-defaults";
import LeadsApiManager from "@/components/settings/LeadsApiManager";

export const dynamic = "force-dynamic";

export default async function LeadsApiPage() {
  const config =
    (await readAppSetting<LeadIntakeConfig>("lead-intake")) ??
    (APP_SETTING_DEFAULTS["lead-intake"] as LeadIntakeConfig);
  return <LeadsApiManager initial={config} />;
}
