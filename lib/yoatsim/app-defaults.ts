// ברירות מחדל למסכי ההגדרות הגנריים (AppSetting) — שכפול Yoatsim, אפיון §2.
// קובץ נתונים טהור — נטען גם בקליינט (בלי Prisma). הקריאה/כתיבה ב-lib/yoatsim/app-settings.ts.

/* ---------- דפי נחיתה ---------- */
export interface LandingPage {
  name: string;
  url: string;
  active: boolean;
}

/* ---------- בוט ווטסאפ ---------- */
export interface WhatsappBotConfig {
  provider: string; // "WATI"
  phoneNumber: string;
  senders: string[];
  apiToken: string;
  webhookUrl: string;
  active: boolean;
}

/* ---------- מודולים ---------- */
export interface ModuleDef {
  key: string;
  name: string;
  active: boolean;
}

/* ---------- תבניות פעולות/משימות/פגישות/כספים ---------- */
export interface ActionTemplate {
  name: string;
}
export const ACTION_TEMPLATE_KINDS = ["פעולות", "משימות", "פגישות", "כספים"] as const;
export type ActionTemplateKind = (typeof ACTION_TEMPLATE_KINDS)[number];
export type ActionTemplatesValue = Record<ActionTemplateKind, ActionTemplate[]>;

/* ---------- טלפוניה (Voicenter) ---------- */
export interface TelephonyConfig {
  // סוד בנתיב ה-webhook של ה-CDR — מוחלף מהמסך (כפתור "צור סוד חדש")
  webhookSecret: string;
}

/* ---------- קבלת לידים / API ---------- */
export interface LeadIntakeConfig {
  apiKey: string;
  defaultProcess: string; // process key מ-lib/yoatsim/processes.ts
  defaultStatus: string; // סטטוס בתוך התהליך
  active: boolean;
}

/* ---------- קישור מודול → המסך שלו (אם קיים) ---------- */
export const MODULE_LINKS: Record<string, string> = {
  users: "/settings/users",
  fields: "/settings/fields",
  processes: "/settings/processes",
  "leads-api": "/settings/leads-api",
  "landing-pages": "/settings/landing-pages",
  "action-templates": "/settings/action-templates",
  "sms-templates": "/settings/templates",
  "email-templates": "/settings/templates?channel=email",
  forms: "/settings/forms",
  automations: "/settings/automations",
  "whatsapp-bot": "/settings/whatsapp-bot",
  import: "/admin/import",
};

/* ---------- ברירות המחדל — נזרעות בקריאה הראשונה ---------- */
export const APP_SETTING_DEFAULTS: Record<string, unknown> = {
  // שני המקורות האמיתיים מהאפיון §1 ("מקור הליד")
  "landing-pages": [
    { name: "בינגו-פייסבוק כל מטרה", url: "https://bingoisrael.co.il/lp/facebook", active: true },
    { name: "פרסום ווצאפ", url: "https://bingoisrael.co.il/lp/whatsapp", active: true },
  ] satisfies LandingPage[],

  "whatsapp-bot": {
    provider: "WATI",
    phoneNumber: "972505696756",
    senders: ["bingoisrael", "bingocredit"],
    apiToken: "",
    webhookUrl: "",
    active: false,
  } satisfies WhatsappBotConfig,

  // רשימת המודולים מהאפיון §2 — כולם פעילים
  modules: [
    { key: "users", name: "ניהול משתמשים", active: true },
    { key: "fields", name: "הגדרת שדות", active: true },
    { key: "processes", name: "תהליכים וסטטוסים", active: true },
    { key: "leads-api", name: "קבלת לידים/API", active: true },
    { key: "landing-pages", name: "דפי נחיתה", active: true },
    { key: "action-templates", name: "תבניות פעולות", active: true },
    { key: "sms-templates", name: "תבניות סמס/ווטסאפ", active: true },
    { key: "email-templates", name: "תבניות מיילים", active: true },
    { key: "forms", name: "טפסים", active: true },
    { key: "automations", name: "אוטומציות", active: true },
    { key: "whatsapp-bot", name: "בוט ווטסאפ", active: true },
    { key: "import", name: "ייבוא", active: true },
  ] satisfies ModuleDef[],

  "action-templates": {
    פעולות: [{ name: "שיחת תיאום" }, { name: "שיקוף תוצאות" }],
    משימות: [{ name: "לחזור ללקוח" }, { name: "לבדוק מול גוף מממן" }],
    פגישות: [{ name: "פגישת זום נכסים" }],
    כספים: [{ name: "גביית שכר טרחה" }, { name: "חשבונית לקוח" }],
  } satisfies ActionTemplatesValue,

  telephony: {
    webhookSecret: "bingo-cdr-CHANGE-ME",
  } satisfies TelephonyConfig,

  "lead-intake": {
    apiKey: "bingo-intake-demo-key",
    defaultProcess: "signatures",
    defaultStatus: "ליד חדש",
    active: true,
  } satisfies LeadIntakeConfig,
};

export const APP_SETTING_KEYS = Object.keys(APP_SETTING_DEFAULTS);
