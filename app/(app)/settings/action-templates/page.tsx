// תבניות פעולות/משימות/פגישות/כספים — שכפול Yoatsim §2.
// הנתונים ב-AppSetting "action-templates".
import { readAppSetting } from "@/lib/yoatsim/app-settings";
import { APP_SETTING_DEFAULTS, type ActionTemplatesValue } from "@/lib/yoatsim/app-defaults";
import ActionTemplatesManager from "@/components/settings/ActionTemplatesManager";

export const dynamic = "force-dynamic";

export default async function ActionTemplatesPage() {
  const value =
    (await readAppSetting<ActionTemplatesValue>("action-templates")) ??
    (APP_SETTING_DEFAULTS["action-templates"] as ActionTemplatesValue);
  return <ActionTemplatesManager initial={value} />;
}
