/**
 * רֶצֶף — התסריט המדובר. DISPLAY STRINGS ONLY.
 *
 * כל הלוגיקה (פסילה, מסלולים, השלמת סקשן) נשארת ב-lib/journey.ts —
 * הקובץ הזה ממפה כל סקשן לרצף "ביטים": משפט שהנציג מקריא + שדה אחד מתחתיו.
 * הערך "נשאב" אל המשפט אחרי ה-Enter (העבר מוצג דהוי עם הערך בזהב).
 * ביט עם showIf שלא מתקיים — פשוט לא קיים בזרם.
 */
import type { JourneyState, SectionId } from "@/lib/journey";
import {
  LOAN_PURPOSES, CREDIT_CARD_OPTIONS, CARD_LIMIT_OPTIONS, CHECKED_BEFORE_OPTIONS,
  MARITAL_OPTIONS, EMPLOYMENT_OPTIONS, GENDER_OPTIONS, PROPERTY_OPTIONS,
} from "@/lib/journey";

export type BeatKind =
  | "money" | "chips" | "chips-multi" | "text" | "pair-text"
  | "id" | "date" | "number" | "lights" | "yesno" | "text-suggest";

export interface Beat {
  key: string;
  section: SectionId;
  /** the sentence the rep SAYS out loud (or reads silently if internal) */
  say: string;
  /** how the answered sentence reads in the past stream; {v} = the absorbed value */
  done?: string;
  kind: BeatKind;
  fields: (keyof JourneyState)[];
  options?: readonly string[];
  /** (פנימי) — לא מקריאים ללקוח */
  internal?: boolean;
  /** Enter על ריק מדלג */
  skippable?: boolean;
  placeholder?: string;
  showIf?: (j: JourneyState) => boolean;
}

const married = (j: JourneyState) =>
  j.maritalStatus === "נשוי/אה" || j.maritalStatus === "ידוע/ה בציבור";
const hasCar = (j: JourneyState) => j.hasVehicle === "yes";

export const SCRIPT: Record<SectionId, Beat[]> = {
  opening: [
    { key: "amount", section: "opening", kind: "money", fields: ["amountRequested"],
      say: "כמה כסף אתה צריך היום?", done: "ביקש {v}", placeholder: "40,000" },
    { key: "purpose", section: "opening", kind: "chips", fields: ["loanPurpose"],
      say: "ולאיזו מטרה הכסף?", done: "המטרה: {v}", options: LOAN_PURPOSES },
  ],
  credit: [
    { key: "cards", section: "credit", kind: "chips-multi", fields: ["creditCards"],
      say: "יש לך כרטיס אשראי פעיל על השם שלך? של איזו חברה?", done: "כרטיסים: {v}",
      options: CREDIT_CARD_OPTIONS },
    { key: "limit", section: "credit", kind: "chips", fields: ["cardLimit"],
      say: "ומה המסגרת שמאושרת לך בכרטיס — מעל 5,000 שקל או פחות?", done: "מסגרת: {v}",
      options: CARD_LIMIT_OPTIONS },
    { key: "checkedBefore", section: "credit", kind: "chips-multi", fields: ["checkedBefore"],
      say: "בדקת כבר הלוואה במקום אחר לאחרונה? איפה?", done: "בדק קודם: {v}",
      options: CHECKED_BEFORE_OPTIONS, skippable: true },
  ],
  bdi: [
    { key: "id", section: "bdi", kind: "id", fields: ["idNumber"],
      say: "מעולה. אני מריץ עליך בדיקת חיווי — צריך רק כמה פרטים. תעודת זהות?",
      done: "ת\"ז {v}", placeholder: "9 ספרות" },
    { key: "names", section: "bdi", kind: "pair-text", fields: ["smileyFirstName", "smileyLastName"],
      say: "שם פרטי ושם משפחה, בדיוק כמו שרשום בתעודה?", done: "רשום בתעודה: {v}",
      placeholder: "שם פרטי · שם משפחה" },
    { key: "birth", section: "bdi", kind: "date", fields: ["birthDate"],
      say: "ותאריך לידה?", done: "נולד {v}" },
    { key: "gender", section: "bdi", kind: "chips", fields: ["gender"],
      say: "מין (לרישום החיווי)", done: "מין: {v}", options: GENDER_OPTIONS, internal: true },
    { key: "lightAuto", section: "bdi", kind: "lights", fields: ["smileyAuto"],
      say: "\"שניה אחת, אני שולח לבדיקה…\" — מה החיווי האוטומטי שחזר?",
      done: "חיווי אוטומטי: {v}", internal: true },
    { key: "lightManual", section: "bdi", kind: "lights", fields: ["smileyManual"],
      say: "ואיך הלקוח נשמע לך? (הרמזור שלך — לא מקריאים)",
      done: "הרמזור שלי: {v}", internal: true },
  ],
  personal: [
    { key: "marital", section: "personal", kind: "chips", fields: ["maritalStatus"],
      say: "כמה השלמות קטנות — מצב משפחתי?", done: "מצב משפחתי: {v}", options: MARITAL_OPTIONS },
    { key: "children", section: "personal", kind: "number", fields: ["children"],
      say: "ילדים מתחת ל-18? כמה?", done: "{v} ילדים", skippable: true, placeholder: "0" },
    { key: "idIssue", section: "personal", kind: "date", fields: ["idIssueDate"],
      say: "מתי הונפקה תעודת הזהות? מופיע על התעודה.", done: "ת\"ז הונפקה {v}", skippable: true },
  ],
  income: [
    { key: "employment", section: "income", kind: "chips", fields: ["employment"],
      say: "מה אתה עושה היום — שכיר? עצמאי?", done: "תעסוקה: {v}", options: EMPLOYMENT_OPTIONS },
    { key: "employer", section: "income", kind: "text", fields: ["employerAndRole"],
      say: "איפה אתה עובד, ובאיזה תפקיד?", done: "עובד ב־{v}", skippable: true,
      placeholder: "חברת חשמל · טכנאי" },
    { key: "seniority", section: "income", kind: "number", fields: ["seniorityYears"],
      say: "כמה שנים אתה שם?", done: "ותק {v} שנים", skippable: true, placeholder: "3" },
    { key: "income", section: "income", kind: "money", fields: ["monthlyIncome"],
      say: "מה המשכורת נטו בחודש?", done: "נטו {v} בחודש", placeholder: "9,500" },
    { key: "spouse", section: "income", kind: "money", fields: ["spouseIncome"],
      say: "ויש הכנסה נוספת בבית — בן או בת זוג?", done: "בן/בת זוג: {v}",
      skippable: true, showIf: married, placeholder: "8,000" },
  ],
  assets: [
    { key: "property", section: "assets", kind: "chips", fields: ["hasProperty"],
      say: "דירה — בבעלות או בשכירות?", done: "מגורים: {v}", options: PROPERTY_OPTIONS },
    { key: "vehicle", section: "assets", kind: "yesno", fields: ["hasVehicle"],
      say: "יש רכב רשום על השם שלך?", done: "רכב: {v}" },
    { key: "vehicleDetails", section: "assets", kind: "pair-text", fields: ["vehicleMake", "vehicleYear"],
      say: "איזה רכב, ואיזו שנה?", done: "הרכב: {v}", showIf: hasCar, skippable: true,
      placeholder: "טויוטה קורולה · 2020" },
    { key: "vehicleFree", section: "assets", kind: "chips", fields: ["vehicleFree"],
      say: "הרכב נקי, בלי שעבוד?", done: "שעבוד: {v}", showIf: hasCar,
      options: ["נקי", "משועבד"] as const, skippable: true },
  ],
  bank: [
    { key: "bankName", section: "bank", kind: "text-suggest", fields: ["bankName"],
      say: "באיזה בנק מתנהל החשבון שלך?", done: "בנק {v}",
      options: ["הפועלים", "לאומי", "דיסקונט", "מזרחי"] as const, placeholder: "שם הבנק" },
    { key: "branchAccount", section: "bank", kind: "pair-text", fields: ["bankBranch", "bankAccount"],
      say: "סניף ומספר חשבון?", done: "חשבון: {v}", placeholder: "סניף · חשבון" },
  ],
  // הסכם/פוסט-חתימה — נשארים כקומפוננטות הקיימות; המשפט למעלה בלבד
  contract: [],
  cooldown: [],
  checks: [],
  docs: [],
  results: [],
  closing: [],
};

/** the special pivot beat — injected by the stage when needsVehicleAnswer() */
export const PIVOT_BEAT: Beat = {
  key: "pivot", section: "assets", kind: "yesno", fields: ["hasVehicle"],
  say: "דרך אגב — יש רכב רשום על השם שלך?",
  done: "רכב: {v}",
};

/** flatten the first-call beats in journey order, respecting showIf */
export function activeBeats(j: JourneyState): Beat[] {
  const order: SectionId[] = ["opening", "credit", "bdi", "personal", "income", "assets", "bank"];
  return order.flatMap((s) => SCRIPT[s]).filter((b) => !b.showIf || b.showIf(j));
}
