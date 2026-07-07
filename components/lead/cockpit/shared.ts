/**
 * קוקפיט השיחה — טיפוסים ועזרי ליבה משותפים.
 * חמשת שערי הסינון (הניסוח המאושר מ-card-concept v2) + מיפוי ערכי הרמזור.
 * ערכי traffic ב-DB נשארים "green"|"yellow"|"red" (אוצר Yoatsim);
 * רכיב ה-Ramzor מדבר "green"|"orange"|"red" — ההמרה כאן.
 */
import type { ClassicValues } from "@/lib/yoatsim/values";
import type { RamzorValue } from "@/components/ui/Ramzor";

export interface SentFormRow {
  id: number;
  templateName: string;
  status: string; // sent | signed
  sentAt: string;
  signedAt: string | null;
}

/* ---------- רמזור: DB ↔ תצוגה ---------- */
export function toRamzor(v: ClassicValues[string]): RamzorValue | null {
  if (v === "green") return "green";
  if (v === "yellow" || v === "orange") return "orange";
  if (v === "red") return "red";
  return null;
}

/** ערך ה-DB עבור בחירת רמזור ידנית (כתום נשמר כ-yellow — אוצר traffic) */
export function ramzorToDb(v: RamzorValue): string {
  return v === "orange" ? "yellow" : v;
}

/** הגרוע מבין רמזור-אוטומציה ורמזור-ידני — החיווי הקבוע בכותרת */
export function worstRamzor(values: ClassicValues): RamzorValue | null {
  const a = toRamzor(values.smileyAuto);
  const b = toRamzor(values.smileyManual);
  for (const c of ["red", "orange", "green"] as const) {
    if (a === c || b === c) return c;
  }
  return null;
}

/* ---------- חמשת שערי הסינון ---------- */
export interface GateDef {
  key: string; // מפתח הערך הראשי (עבור שער 5: creditCards)
  question: string;
  hint: string;
  /** שערים 1–4: שתי תשובות; שער 5 משולב (כרטיסים + מסגרת) */
  good?: string;
  bad?: string;
  combined?: boolean;
}

export const GATES: GateDef[] = [
  {
    key: "enforcementIssues",
    question: "היו בעיות בהוצאה לפועל בשלוש השנים האחרונות?",
    hint: "שער כבד — תשובה חיובית מנתבת למסלול רכב",
    good: "הכל תקין",
    bad: "היו בעיות",
  },
  {
    key: "returnedChecks",
    question: "חזרו צ'קים, הוראות קבע או תשלומי הלוואה בשנתיים האחרונות?",
    hint: "כולל מסגרות אשראי שקפצו",
    good: "לא חזר כלום",
    bad: "חזרו",
  },
  {
    key: "accountRestricted",
    question: "החשבון מתנהל תקין? לא מוגבל היום ולא היה מוגבל?",
    hint: "הגבלה בשנתיים האחרונות נחשבת",
    good: "החשבון תקין",
    bad: "מוגבל / היה מוגבל",
  },
  {
    key: "bdiRepair",
    question: "עשית פעם מחיקה או שיפור נתונים ב־BDI?",
    hint: "שיפור BDI משפיע על תוצאת הרמזור",
    good: "לא ביצעתי",
    bad: "ביצעתי",
  },
  {
    key: "creditCards",
    question: "איזה כרטיס אשראי יש לך, והמסגרת שם מעל 5,000 ₪?",
    hint: "בלי כרטיס או מסגרת מתחת ל-5,000 — מסלול רכב בלבד",
    combined: true,
  },
];

export const NO_CARD = "אין כרטיס בכלל";
export const LIMIT_BELOW = "מתחת ל-5,000 ש\"ח";

/** האם ערכי שער 5 שלמים (כרטיסים נבחרו + מסגרת, או "אין כרטיס") */
export function gate5Complete(values: ClassicValues): boolean {
  const cards = Array.isArray(values.creditCards) ? (values.creditCards as string[]) : [];
  if (cards.length === 0) return false;
  if (cards.includes(NO_CARD)) return true;
  return typeof values.cardLimit === "string" && values.cardLimit.length > 0;
}

/** האם לשער יש כבר תשובה (לידים מיובאים — מגיעים מלאים) */
export function gateAnswered(gate: GateDef, values: ClassicValues): boolean {
  if (gate.combined) return gate5Complete(values);
  const v = values[gate.key];
  return typeof v === "string" && v.length > 0;
}

/** האם התשובה של השער "בעייתית" — מנתבת למסלול רכב */
export function gateFlagged(gate: GateDef, values: ClassicValues): boolean {
  if (gate.combined) {
    const cards = Array.isArray(values.creditCards) ? (values.creditCards as string[]) : [];
    return cards.includes(NO_CARD) || values.cardLimit === LIMIT_BELOW;
  }
  return values[gate.key] === gate.bad;
}

/** שורת הסיכום של שער שנענה (השורה המקופלת) */
export function gateSummary(gate: GateDef, values: ClassicValues): string {
  if (gate.combined) {
    const cards = Array.isArray(values.creditCards) ? (values.creditCards as string[]) : [];
    const limit = typeof values.cardLimit === "string" ? values.cardLimit : "";
    if (cards.includes(NO_CARD)) return NO_CARD;
    return [cards.join(", "), limit].filter(Boolean).join(" · ");
  }
  const v = values[gate.key];
  return typeof v === "string" ? v : "";
}
