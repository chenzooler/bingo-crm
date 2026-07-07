/**
 * מנוע האוטומציות — שכפול Yoatsim 1:1 (רץ בשרת בלבד).
 *
 * נקרא אחרי כל שמירת כרטיס (PATCH /api/leads/[id]):
 * משווה prevValues↔nextValues ומפעיל כל אוטומציה שהתנאים שלה התקיימו
 * *רק עכשיו* (edge-trigger — לא level: שמירה חוזרת עם אותם ערכים לא תירה שוב).
 *
 * תנאים: fieldName בעברית (label מהכרטיס) → key בסכמה, עם כינויים לשדות
 * שהאפיון מנסח אחרת. ערכים מיוחדים: "מולא" · "הגיע" · "היו בעיות" · צבעי רמזור.
 * פעולות: add-process (הוספה/עדכון LeadProcess) · send-template (סימולציה —
 * Activity בלבד עד חיבור ספק שליחה) · assign-user (מדולג — אין משתמש יעד בנתונים).
 *
 * לעולם לא זורק החוצה — אוטומציה שבורה לא מפילה שמירה.
 */
import type { PrismaClient } from "@prisma/client";
import { CARD_SECTIONS } from "./card-schema";
import { processByKey } from "./processes";
import type { AutomationAction, AutomationCondition } from "./automations";

type Values = Record<string, unknown>;

export interface RunAutomationsResult {
  fired: string[]; // שמות האוטומציות שנורו
}

/* ============================================================
   מיפוי שם-שדה (עברית) → key בסכמה
   ============================================================ */

/** נרמול label: רווחים + הסרת אימוג'י (🚦 ✅ וכו', כולל variation-selector/ZWJ) */
const EMOJI_RE = new RegExp("[\\p{Extended_Pictographic}\\u{FE0F}\\u{200D}]", "gu");
function normalizeLabel(label: string): string {
  return label.replace(EMOJI_RE, "").trim();
}

let labelMapCache: Map<string, string> | null = null;

/** label מנורמל → key, מכל הסקשנים כולל "שדות נוספים" */
function labelMap(): Map<string, string> {
  if (labelMapCache) return labelMapCache;
  const map = new Map<string, string>();
  for (const section of CARD_SECTIONS) {
    for (const f of [...section.fields, ...(section.collapsedExtras ?? [])]) {
      map.set(normalizeLabel(f.label), f.key);
    }
  }
  labelMapCache = map;
  return map;
}

/** כינויים — שמות שדה בתנאי האוטומציות שלא תואמים 1:1 את labels הסכמה */
const ALIASES: Record<string, string> = {
  'האם היו בעיות בהוצל"פ ב-3 שנים': "enforcementIssues", // ניסוח האפיון המקורי
  // שמות היסטוריים + שני סגנונות מקף — כולם אותו שדה (הכינוי "רמזור" הוא שם התצוגה החדש)
  "בדיקת סמיילי - אוטומציה": "smileyAuto",
  "בדיקת סמיילי — אוטומציה": "smileyAuto",
  "בדיקת רמזור - אוטומציה": "smileyAuto",
  "בדיקת רמזור — אוטומציה": "smileyAuto",
};

/** תנאי מיוחד: "מעוניין להתקדם?" — נבדק מול כל אחד מ-6 גופי המימון */
const LENDER_INTEREST_FIELD = "מעוניין להתקדם?";
const LENDER_INTEREST_KEY = /^lender_.+_interested$/; // המפתחות מ-CustomSections (lval)

/** רמזורים נשמרים כ-green/yellow/red (FieldRenderer); בתנאים — בעברית */
const TRAFFIC_HE: Record<string, string> = {
  "ירוק": "green",
  "צהוב": "yellow",
  "כתום": "yellow", // ה-UI מכנה את האמצעי "כתום"
  "אדום": "red",
};

/* ============================================================
   הערכת תנאי בודד
   ============================================================ */

/** ערכים שמשמעותם "אין בעיה" — התנאי המיוחד "היו בעיות" לא מתקיים עבורם */
const NO_PROBLEM_VALUES = new Set(["לא", "הכל תקין", "לא חזר כלום", "החשבון תקין", "לא ביצעתי"]);

function isFilled(v: unknown): boolean {
  if (Array.isArray(v)) return v.length > 0;
  if (typeof v === "string") return v.trim().length > 0;
  return v === true;
}

function valueMatches(v: unknown, condValue: string): boolean {
  // "מולא" — השדה אינו ריק
  if (condValue === "מולא") return isFilled(v);

  // "הגיע" — תאריך שהגיע (≤ היום)
  if (condValue === "הגיע") {
    if (typeof v !== "string" || !v.trim()) return false;
    const d = new Date(v);
    if (Number.isNaN(d.getTime())) return false;
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);
    return d.getTime() <= endOfToday.getTime();
  }

  // "היו בעיות" — מולא וגם לא אחד מערכי "תקין" (הניסוחים הישנים + החדשים)
  if (condValue === "היו בעיות") {
    return isFilled(v) && !NO_PROBLEM_VALUES.has(String(v));
  }

  // רמזור בעברית → הפורמט השמור
  const traffic = TRAFFIC_HE[condValue];
  if (traffic !== undefined) return v === traffic || v === condValue;

  // שוויון מדויק (מערכים: includes)
  if (Array.isArray(v)) return (v as unknown[]).includes(condValue);
  return v === condValue;
}

function conditionMet(cond: AutomationCondition, values: Values): boolean {
  const fieldName = normalizeLabel(cond.fieldName ?? "");
  if (!fieldName) return false;

  // "מעוניין להתקדם?" — מספיק גוף מימון אחד שעונה לערך
  if (fieldName === LENDER_INTEREST_FIELD) {
    return Object.entries(values).some(
      ([k, v]) => LENDER_INTEREST_KEY.test(k) && valueMatches(v, cond.value),
    );
  }

  const key = ALIASES[fieldName] ?? labelMap().get(fieldName);
  if (!key) return false; // שדה לא מוכר — האוטומציה נשארת רדומה (ניתנת לעריכה במסך ההגדרות)
  return valueMatches(values[key], cond.value);
}

/* ============================================================
   פעולות
   ============================================================ */

async function runAction(
  db: PrismaClient,
  leadId: number,
  autoName: string,
  action: AutomationAction,
): Promise<void> {
  if (action.type === "add-process" && action.processKey && action.statusKey) {
    const processName = processByKey(action.processKey)?.name ?? action.processKey;
    // כבר בתהליך הזה? מעדכנים סטטוס; אחרת יוצרים שיוך חדש
    const existing = await db.leadProcess.findFirst({
      where: { leadId, processKey: action.processKey },
    });
    if (existing) {
      await db.leadProcess.update({ where: { id: existing.id }, data: { statusKey: action.statusKey } });
    } else {
      await db.leadProcess.create({
        data: { leadId, processKey: action.processKey, statusKey: action.statusKey },
      });
    }
    await db.activity.create({
      data: {
        leadId,
        type: "system",
        text: `אוטומציה "${autoName}": התווסף לתהליך "${processName}" בסטטוס "${action.statusKey}"`,
        metaJson: JSON.stringify({ automation: autoName, processKey: action.processKey, statusKey: action.statusKey }),
      },
    });
    return;
  }

  if (action.type === "send-template" && action.templateName) {
    const template = await db.messageTemplate.findUnique({ where: { name: action.templateName } });
    if (!template) {
      await db.activity.create({
        data: {
          leadId,
          type: "system",
          text: `אוטומציה "${autoName}": תבנית ההודעה "${action.templateName}" לא נמצאה — לא נשלח דבר`,
        },
      });
      return;
    }
    await db.activity.create({
      data: {
        leadId,
        type: template.channel === "sms" ? "sms" : "whatsapp",
        text: `אוטומציה "${autoName}": נשלחה תבנית "${action.templateName}" (סימולציה — ספק שליחה יחובר בהמשך)`,
        metaJson: JSON.stringify({ automation: autoName, templateName: action.templateName, channel: template.channel }),
      },
    });
    return;
  }

  // assign-user — אין משתמש יעד בנתוני האוטומציות; מדלגים בשקט
}

/* ============================================================
   הרצה
   ============================================================ */

/** "סוג כרטיס" של האוטומציה ↔ Lead.cardKind */
const CARD_TYPE_TO_KIND: Record<string, string> = {
  "כרטיס": "card",
  "שכפול": "duplicate",
  "כרטיס בדיקה": "test",
};

export async function runAutomations(opts: {
  leadId: number;
  prevValues: Values;
  nextValues: Values;
  db: PrismaClient;
}): Promise<RunAutomationsResult> {
  const { leadId, prevValues, nextValues, db } = opts;
  const fired: string[] = [];

  try {
    const [automations, lead] = await Promise.all([
      db.automation.findMany({ where: { enabled: true } }),
      db.lead.findUnique({ where: { id: leadId }, select: { cardKind: true } }),
    ]);
    if (!lead) return { fired };

    for (const auto of automations) {
      try {
        // האוטומציה מוגדרת לסוג כרטיס מסוים — כמו במקור
        if ((CARD_TYPE_TO_KIND[auto.cardType] ?? "card") !== lead.cardKind) continue;

        const conditions: AutomationCondition[] = auto.conditionsJson
          ? JSON.parse(auto.conditionsJson)
          : [];
        if (!Array.isArray(conditions) || conditions.length === 0) continue; // בלי תנאים — לא יורים על כל שמירה

        // edge-trigger: כל התנאים מתקיימים עכשיו, ולא כולם התקיימו קודם
        const metNow = conditions.every((c) => conditionMet(c, nextValues));
        if (!metNow) continue;
        const metBefore = conditions.every((c) => conditionMet(c, prevValues));
        if (metBefore) continue;

        const actions: AutomationAction[] = auto.actionsJson ? JSON.parse(auto.actionsJson) : [];
        for (const action of actions) {
          await runAction(db, leadId, auto.name, action);
        }
        fired.push(auto.name);
      } catch {
        // אוטומציה שבורה (JSON פגום וכו') לא מפילה את השמירה
      }
    }
  } catch {
    // never throw out of runAutomations
  }

  return { fired };
}
