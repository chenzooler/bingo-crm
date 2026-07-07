// מודולים — שכפול Yoatsim §2. הרשימה ב-AppSetting "modules".
import { readAppSetting } from "@/lib/yoatsim/app-settings";
import { APP_SETTING_DEFAULTS, type ModuleDef } from "@/lib/yoatsim/app-defaults";
import ModulesManager from "@/components/settings/ModulesManager";

export const dynamic = "force-dynamic";

export default async function ModulesPage() {
  const modules =
    (await readAppSetting<ModuleDef[]>("modules")) ??
    (APP_SETTING_DEFAULTS["modules"] as ModuleDef[]);
  return <ModulesManager initial={modules} />;
}
