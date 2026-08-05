/**
 * קטלוג הלקוח - כללי העסק של חן, מילה במילה (27/07/26).
 *
 * שכבה 1: חיווי אשראי (creditIndication) - נגזר משאלות הסינון בלבד:
 *   negative - תשובה שלילית אחת לפחות
 *   positive - כל השאלות נענו וכולן תקינות
 *   unknown  - עוד לא נענו כל השאלות
 *
 * שכבה 2: בדיקת רמזור (ירוק/צהוב/אדום) - אוטומציה או ידני.
 *
 * שכבה 3: צבע הלקוח (clientColor) - הקטלוג בכותרת הכרטיס:
 *   green  - לקוח תקין: חיווי חיובי + רמזור ירוק ← כל מטרה וגם רכב
 *   blue   - רכב בלבד ויש רכב: (רמזור צהוב) או (חיווי שלילי + רמזור ירוק/צהוב), ויש רכב
 *   orange - מתאים רק לרכב אבל אין רכב (או שעוד לא ידוע אם יש)
 *   red    - רמזור אדום: אין מה להציע
 *   null   - עוד אין מספיק מידע לקטלג
 */

export type CreditIndication = "positive" | "negative" | "unknown";
export type RamzorColor = "green" | "yellow" | "red";
export type ClientColor = "green" | "blue" | "orange" | "red";

export interface CatalogInput {
  /** ערכי הכרטיס (extraJson keys) */
  values: Record<string, unknown>;
}

/* ---------- שאלות הסינון: מפתח ← התשובה השלילית ---------- */

const str = (v: unknown): string => (typeof v === "string" ? v : "");

/** האם היו בעיות בהוצאה לפועל? */
const ENFORCEMENT_BAD = ["היו בעיות"];
/** האם חזרו צ'קים / הוראות קבע / הלוואות / מסגרות בשנתיים? */
const RETURNED_BAD = ["חזרו", "היו חזרות"];
/** האם החשבון מוגבל כרגע או היה מוגבל בשנתיים? (הערך הממוזג הישן נשמר לתאימות לאחור) */
const RESTRICTED_BAD = ["מוגבל / היה מוגבל", "חשבון מוגבל", "מוגבל", "מוגבל כרגע", "היה מוגבל"];
/** האם ביצעת מחיקה או שיפור ל-BDI? */
const BDI_REPAIR_BAD = ["ביצעתי"];
/** מסגרת אשראי מתחת ל-5,000 */
const LIMIT_BAD = ["מתחת ל-5,000 ש\"ח", "מתחת ל-5,000"];

/** כרטיסי אשראי: רק דיירקט או אין כרטיס בכלל = שלילי */
export function cardsNegative(values: Record<string, unknown>): boolean | null {
  const raw = values.creditCards;
  const cards = Array.isArray(raw) ? (raw as string[]) : [];
  if (cards.length === 0) return null; // עוד לא נענה
  if (cards.includes("אין כרטיס בכלל")) return true;
  const real = cards.filter((c) => c !== "דיירקט" && c !== "רק כרטיס דיירקט" && c !== "אין כרטיס בכלל");
  return real.length === 0; // נשאר רק דיירקט ← שלילי
}

interface ScreeningState {
  answered: number;
  total: number;
  negative: boolean;
  /** אילו שאלות יצאו שליליות (לתצוגה בכרטיס) */
  reasons: string[];
}

export function screeningState(values: Record<string, unknown>): ScreeningState {
  const reasons: string[] = [];
  let answered = 0;

  const check = (
    key: string,
    bad: string[],
    reason: string,
  ): void => {
    const v = str(values[key]).trim();
    if (v) {
      answered += 1;
      // התאמה מדויקת בלבד - "לא ביצעתי" מכיל את "ביצעתי" ולכן substring מסוכן
      if (bad.some((b) => v === b)) reasons.push(reason);
    }
  };

  check("enforcementIssues", ENFORCEMENT_BAD, "בעיות בהוצאה לפועל");
  check("returnedChecks", RETURNED_BAD, "חזרו צ'קים או הוראות קבע");
  check("accountRestricted", RESTRICTED_BAD, "חשבון מוגבל");
  check("bdiRepair", BDI_REPAIR_BAD, "בוצעה מחיקה או שיפור BDI");

  const cards = cardsNegative(values);
  if (cards === true) {
    // אין כרטיס אמיתי - שאלת המסגרת לא רלוונטית: נספרת כנענתה ולא נבדקת
    // (כדי שערך ישן של מסגרת לא יוסיף סיבה שלילית מטעה)
    answered += 1;
  } else {
    check("cardLimit", LIMIT_BAD, "מסגרת אשראי מתחת ל-5,000 ש\"ח");
  }
  if (cards !== null) {
    answered += 1;
    if (cards) reasons.push("אין כרטיס אשראי (או דיירקט בלבד)");
  }

  return { answered, total: 6, negative: reasons.length > 0, reasons };
}

/** חיווי אשראי - שכבה 1 */
export function deriveCreditIndication(values: Record<string, unknown>): CreditIndication {
  const s = screeningState(values);
  if (s.negative) return "negative"; // תשובה שלילית אחת מספיקה
  if (s.answered >= s.total) return "positive";
  return "unknown";
}

/* ---------- רמזור ---------- */

export function ramzorOf(values: Record<string, unknown>): RamzorColor | null {
  // הידני גובר על האוטומציה כשקיים (הנציג ראה את התוצאה בפועל)
  const manual = str(values.smileyManual);
  const auto = str(values.smileyAuto);
  const v = manual || auto;
  return v === "green" || v === "yellow" || v === "red" ? v : null;
}

/* ---------- רכב ---------- */

export function hasVehicleAnswer(values: Record<string, unknown>): boolean | null {
  const v = str(values.hasVehicleRaw);
  if (!v) return null;
  return v === "כן" || v === "כן משועבד";
}

/* ---------- הקטלוג המלא - שכבה 3 ---------- */

export interface CatalogResult {
  creditIndication: CreditIndication;
  ramzor: RamzorColor | null;
  clientColor: ClientColor | null;
  /** התווית בכותרת, בעברית */
  label: string;
  /** משפט הסבר קצר לנציג */
  hint: string;
  /** אילו מסלולים פתוחים */
  tracks: { general: boolean; vehicle: boolean };
}

export function catalogClient(values: Record<string, unknown>): CatalogResult {
  const indication = deriveCreditIndication(values);
  const ramzor = ramzorOf(values);
  const vehicle = hasVehicleAnswer(values);

  // אדום - סוף הדרך
  if (ramzor === "red") {
    return {
      creditIndication: indication, ramzor,
      clientColor: "red",
      label: "לקוח אדום",
      hint: "בדיקת הרמזור יצאה אדומה - אין מסלול להציע",
      tracks: { general: false, vehicle: false },
    };
  }

  // מסלול רכב בלבד: רמזור צהוב, או חיווי שלילי (עם רמזור ירוק/צהוב או עוד בלי רמזור)
  const vehicleOnly = ramzor === "yellow" || indication === "negative";

  if (vehicleOnly) {
    if (vehicle === true) {
      return {
        creditIndication: indication, ramzor,
        clientColor: "blue",
        label: ramzor === "yellow" ? "לקוח צהוב רכב" : "לקוח שלילי עם רכב",
        hint: ramzor === "yellow" ? "רמזור צהוב - ממשיכים בהלוואה כנגד רכב" : "חיווי שלילי אבל יש רכב - ממשיכים בהלוואה כנגד רכב",
        tracks: { general: false, vehicle: ramzor !== null }, // מחכים לרמזור ירוק/צהוב לפני התקדמות
      };
    }
    return {
      creditIndication: indication, ramzor,
      clientColor: "orange",
      label: vehicle === false ? "לקוח כתום" : "מתאים לרכב בלבד",
      hint: vehicle === false
        ? "רק מסלול רכב רלוונטי אבל אין רכב בבעלות"
        : "רק מסלול רכב רלוונטי - לברר אם יש רכב בבעלות",
      tracks: { general: false, vehicle: false },
    };
  }

  // ירוק מלא: חיווי חיובי + רמזור ירוק
  if (indication === "positive" && ramzor === "green") {
    return {
      creditIndication: indication, ramzor,
      clientColor: "green",
      label: "לקוח תקין",
      hint: "חיווי אשראי חיובי ורמזור ירוק - כל מטרה וגם רכב",
      tracks: { general: true, vehicle: true },
    };
  }

  // עוד אין מספיק מידע
  return {
    creditIndication: indication, ramzor,
    clientColor: null,
    label: indication === "positive" ? "ממתין לבדיקת רמזור" : "בבדיקה",
    hint: indication === "positive"
      ? "הסינון תקין - נשאר לבצע בדיקת רמזור"
      : "עוד לא הושלמו שאלות הסינון",
    tracks: { general: false, vehicle: false },
  };
}

/* ---------- תצוגה ---------- */

export const CLIENT_COLOR_META: Record<ClientColor, { hex: string; bg: string; name: string }> = {
  green:  { hex: "#2B9410", bg: "#DAFFCB", name: "ירוק" },
  blue:   { hex: "#1F6FB2", bg: "#DCEBF7", name: "כחול" },
  orange: { hex: "#C87413", bg: "#FDEBD4", name: "כתום" },
  red:    { hex: "#FF4A2E", bg: "#FFE1DC", name: "אדום" },
};
