// בוט ווטסאפ — שכפול Yoatsim §2. ההגדרות ב-AppSetting "whatsapp-bot".
import { readAppSetting } from "@/lib/yoatsim/app-settings";
import { APP_SETTING_DEFAULTS, type WhatsappBotConfig } from "@/lib/yoatsim/app-defaults";
import WhatsappBotManager from "@/components/settings/WhatsappBotManager";

export const dynamic = "force-dynamic";

export default async function WhatsappBotPage() {
  const config =
    (await readAppSetting<WhatsappBotConfig>("whatsapp-bot")) ??
    (APP_SETTING_DEFAULTS["whatsapp-bot"] as WhatsappBotConfig);
  return <WhatsappBotManager initial={config} />;
}
