/**
 * BINGO Journey Engine v3 — mirrors the REAL Yoatsim lead card
 * (documented live in docs/yoatsim-lead-card.md, 06/07/2026).
 *
 * Real card sections, in order:
 * 1. פתיחת שיחה — "איך אפשר לעזור?" (שם, סכום, מטרה)
 * 2. בדיקת נתוני אשראי — אילו כרטיסים · גובה מסגרת · בדיקה קודמת איפה
 * 3. בדיקת חיווי אשראי — אישור לקוח BDI · סמיילי אוטומציה (מערכת חיצונית) ·
 *    סמיילי ידני (נציג) · שם פרטי/משפחה כפי שרשום ב-BDI · מין · לידה
 * 4. השלמת נתונים — תאריך הנפקת ת.ז, מצב משפחתי, ילדים
 * 5. הכנסות — תעסוקה, מקום+תפקיד, ותק, הכנסה, נוספות, פנסיה/השתלמות
 * 6. נכסים ורכב (הרכב = הגיבוי!)
 * 7. בנק
 * 8. הסכם התקשרות
 * ואז: המתנה שעה → בדיקות/מסמכים → תוצאות → תשלום.
 *
 * Routing (Chen's rules, verified against the card):
 * - סמיילי אדום/צהוב (אוטומטי או ידני) → רכב
 * - הצהרה על נתוני אשראי שליליים → רכב
 * - אין כרטיס אשראי → רכב
 * - מסגרת עד 5,000 ₪ → רכב
 * - אין רכב + נפסל → יציאה
 */

export type Track = "general" | "vehicle" | null;
export type Smiley = "green" | "yellow" | "red" | null;
export type YesNo = "yes" | "no" | null;

/* ---------- section 1: opening ---------- */
export const LOAN_PURPOSES = [
  "כיסוי חובות", "רכב", "שיפוץ", "אירוע", "עסק", "רפואי", "לימודים", "אחר",
] as const;

/* ---------- section 2: credit-data questionnaire (exact Yoatsim options) ---------- */
export const CREDIT_CARD_OPTIONS = [
  "ישראכרט", "כאל", "מקס", "דיירקט", "יש כרטיס", "אין כרטיס בכלל",
] as const;

export const CARD_LIMIT_OPTIONS = ["מעל 5,000 ש\"ח", "עד 5,000 ש\"ח"] as const;

export const CHECKED_BEFORE_OPTIONS = [
  "בבנק הפרטי", "בנק ירושלים", "ישראכרט", "כאל", "מקס",
  "בלנדר", "הפניקס", "קרדיט 24", "אחר", "לא בדק",
] as const;

/* ---------- section 4/5 dropdowns ---------- */
export const MARITAL_OPTIONS = ["רווק/ה", "נשוי/אה", "גרוש/ה", "אלמן/ה", "ידוע/ה בציבור"] as const;
export const EMPLOYMENT_OPTIONS = ["שכיר", "עצמאי", "גמלאי", "פנסיונר", "לא עובד", "קצבה"] as const;
export const GENDER_OPTIONS = ["זכר", "נקבה"] as const;

/* ---------- section 6: assets ---------- */
export const PROPERTY_OPTIONS = ["בבעלות", "בבעלות + משכנתא", "בשכירות", "אצל ההורים"] as const;

/* ---------- lenders (with real logos via favicon) ---------- */
export interface JourneyLender {
  key: string;
  name: string;
  domain: string;
  botSupported: boolean;   // התוסף יודע למלא אצלם
  maxAmount: number;
}

export const JOURNEY_LENDERS: JourneyLender[] = [
  { key: "jerusalem",    name: "בנק ירושלים", domain: "bankjerusalem.co.il",   botSupported: true,  maxAmount: 200000 },
  { key: "phoenix",      name: "הפניקס",       domain: "fnx.co.il",             botSupported: true,  maxAmount: 150000 },
  { key: "isracard",     name: "ישראכרט",      domain: "isracard.co.il",        botSupported: true,  maxAmount: 200000 },
  { key: "cal",          name: "כאל",          domain: "cal-online.co.il",      botSupported: true,  maxAmount: 200000 },
  { key: "max",          name: "MAX",          domain: "max.co.il",             botSupported: true,  maxAmount: 200000 },
  { key: "mimun-yashir", name: "מימון ישיר",   domain: "mimun.co.il",           botSupported: false, maxAmount: 150000 },
  { key: "blender",      name: "בלנדר",        domain: "blender.co.il",         botSupported: false, maxAmount: 100000 },
  { key: "leumi",        name: "לאומי",        domain: "leumi.co.il",           botSupported: false, maxAmount: 100000 },
  { key: "hapoalim",     name: "הפועלים",      domain: "bankhapoalim.co.il",    botSupported: false, maxAmount: 100000 },
];

export function lenderLogo(domain: string, size = 64): string {
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=${size}`;
}

/* ---------- vehicle docs (the 4 documents) ---------- */
export const VEHICLE_DOCS = [
  { id: "car-license",   label: "רישיון רכב" },
  { id: "id-copy",       label: "צילום תעודת זהות" },
  { id: "drive-license", label: "רישיון נהיגה" },
  { id: "bank-approval", label: "אישור ניהול חשבון" },
] as const;

export interface LenderResult {
  outcome: "approved" | "rejected" | "pending" | null;
  amount?: number | null;
  rate?: number | null;
  months?: number | null;
}

/* ============================================================
   The complete journey state — flat, mirrors the real card
   ============================================================ */
export interface JourneyState {
  // --- 1. פתיחת שיחה ---
  amountRequested?: string;
  loanPurpose?: string;

  // --- 2. בדיקת נתוני אשראי ---
  creditCards: string[];              // multi-select
  cardLimit?: string;                 // מעל / עד 5,000
  checkedBefore: string[];            // איפה בדק קודם
  creditNotes?: string;
  smileyGreenConfirmed: boolean;      // checkbox "לקוח תקין בדיקת סמיילי ירוקה"

  // --- 3. בדיקת חיווי אשראי (BDI) ---
  idNumber?: string;
  gender?: string;
  smileyFirstName?: string;           // שם כפי שרשום ב-BDI
  smileyLastName?: string;
  birthDate?: string;
  bdiApproved: boolean;               // אישור לקוח לבדיקת BDI
  smileyAuto: Smiley;                 // סמיילי אוטומציה (מערכת חיצונית)
  smileyManual: Smiley;               // סמיילי ידני (הנציג)

  // --- 4. השלמת נתונים ---
  idIssueDate?: string;
  maritalStatus?: string;
  children?: string;

  // --- 5. הכנסות ---
  employment?: string;
  employerAndRole?: string;
  seniorityYears?: string;
  monthlyIncome?: string;
  spouseIncome?: string;
  additionalIncome?: string;
  hasPension?: YesNo;
  pensionCompany?: string;
  pensionAmount?: string;

  // --- 6. נכסים ורכב ---
  hasProperty?: string;
  hasVehicle: YesNo;
  vehicleYear?: string;
  vehicleMake?: string;
  vehicleFree?: YesNo;                // נקי משעבוד

  // --- 7. בנק ---
  bankName?: string;
  bankBranch?: string;
  bankAccount?: string;

  // --- מסלול רכב: למה הלקוח שם + מסלול משולב ---
  /** screening-failed | rejected-general | amount-insufficient | combo */
  vehicleReason: string | null;
  /** הלקוח לוקח גם כל-מטרה וגם רכב במקביל */
  comboVehicle: boolean;

  // --- 8. הסכם התקשרות ---
  contractSentAt: string | null;
  contractSentVia?: "whatsapp" | "sms";
  signedAt: string | null;
  callbackDueAt: string | null;
  /** חזרה שנקבעה ידנית ("ביקש שנחזור אליו") */
  manualCallbackAt: string | null;
  manualCallbackNote?: string;

  // --- post-signature lifecycle ---
  checksStartedAt: string | null;
  lenderResults: Record<string, LenderResult>;
  checksDone: boolean;
  docsReceived: Record<string, boolean>;
  docsUploadedAt: string | null;
  finalApproval: { amount?: number | null; rate?: number | null; months?: number | null } | null;
  chosenLender: string | null;
  loanArrivedAt: string | null;
  paymentDueAt: string | null;
  feeAmount?: string;
  paidAt: string | null;

  exitReason: string | null;
  /** keys hydrated from the DB on first load — powers the "✓ ממערכת" badges */
  prefilledKeys?: string[];
}

export function initialJourney(): JourneyState {
  return {
    creditCards: [],
    checkedBefore: [],
    smileyGreenConfirmed: false,
    bdiApproved: false,
    smileyAuto: null,
    smileyManual: null,
    hasVehicle: null,
    hasPension: null,
    vehicleReason: null,
    comboVehicle: false,
    contractSentAt: null,
    signedAt: null,
    callbackDueAt: null,
    manualCallbackAt: null,
    checksStartedAt: null,
    lenderResults: {},
    checksDone: false,
    docsReceived: {},
    docsUploadedAt: null,
    finalApproval: null,
    chosenLender: null,
    loanArrivedAt: null,
    paymentDueAt: null,
    paidAt: null,
    exitReason: null,
  };
}

/* ============================================================
   Routing logic — derived live from the data (never set by hand)
   ============================================================ */

/** did the customer fail the general-track screening? */
export function disqualified(j: JourneyState): boolean {
  const badSmiley = j.smileyAuto === "yellow" || j.smileyAuto === "red" ||
                    j.smileyManual === "yellow" || j.smileyManual === "red";
  const noCard = j.creditCards.includes("אין כרטיס בכלל");
  const lowLimit = j.cardLimit === "עד 5,000 ש\"ח";
  return badSmiley || noCard || lowLimit;
}

/** every lender check came back rejected (general track failed at the auction) */
export function generalRejected(j: JourneyState): boolean {
  const outcomes = Object.values(j.lenderResults).map((r) => r.outcome);
  return j.checksDone && outcomes.length > 0 && !outcomes.includes("approved");
}

/** current track, derived from the data */
export function deriveTrack(j: JourneyState): Track {
  const purposeVehicle = j.loanPurpose === "רכב";
  if (disqualified(j) || purposeVehicle) {
    return j.hasVehicle === "yes" ? "vehicle" : null;
  }
  // סורב בכל הגופים במסלול כל מטרה + יש רכב → הרכב הופך למסלול
  if (generalRejected(j) && j.hasVehicle === "yes" && !j.chosenLender) return "vehicle";
  // clean so far → general once we know enough
  const answeredAny = j.smileyAuto !== null || j.smileyManual !== null ||
                      j.creditCards.length > 0 || j.smileyGreenConfirmed;
  return answeredAny ? "general" : null;
}

/* ---------- why is the customer on the vehicle track? ---------- */
export const VEHICLE_REASONS: Record<string, string> = {
  "screening-failed":    "נפסל בסינון (סמיילי/אשראי)",
  "rejected-general":    "סורב בהלוואה לכל מטרה",
  "amount-insufficient": "הסכום בכל מטרה לא הספיק",
  "combo":               "משולב — גם כל מטרה וגם רכב",
};

export function vehicleReasonLabel(j: JourneyState): string | null {
  return j.vehicleReason ? (VEHICLE_REASONS[j.vehicleReason] ?? j.vehicleReason) : null;
}

/** disqualified but no car answer yet → agent MUST ask */
export function needsVehicleAnswer(j: JourneyState): boolean {
  return (disqualified(j) || j.loanPurpose === "רכב") && j.hasVehicle === null;
}

/** disqualified AND no car → dead end */
export function isDeadEnd(j: JourneyState): boolean {
  return (disqualified(j) || j.loanPurpose === "רכב") && j.hasVehicle === "no";
}

/* ============================================================
   Sections — drives the stepper + "what's next"
   ============================================================ */
export type SectionId =
  | "opening" | "credit" | "bdi" | "personal" | "income"
  | "assets" | "bank" | "contract"
  | "cooldown" | "checks" | "docs" | "results" | "closing";

export interface SectionMeta {
  id: SectionId;
  num: number;
  title: string;
  short: string;
  /** משפט התסריט — מה הנציג אומר ללקוח בשלב הזה */
  hint: string;
}

export const FIRST_CALL_SECTIONS: SectionMeta[] = [
  { id: "opening",  num: 1, title: "פתיחת שיחה — סכום ומטרה",  short: "פתיחה",
    hint: "\"היי, מדברים מבינגו מימון! כמה כסף אתה צריך — ולמה?\"" },
  { id: "credit",   num: 2, title: "בדיקת נתוני אשראי",        short: "אשראי",
    hint: "\"יש בבעלותך כרטיסי אשראי? מה גובה המסגרת? בדקת כבר במקום אחר?\"" },
  { id: "bdi",      num: 3, title: "בדיקת חיווי אשראי (סמיילי)", short: "סמיילי",
    hint: "\"אני מריץ בדיקת חיווי אשראי — אקריא לך את הפרטים כפי שהם רשומים\"" },
  { id: "personal", num: 4, title: "השלמת נתונים",             short: "נתונים",
    hint: "\"כמה שאלות קצרות — מצב משפחתי? ילדים מתחת ל-18?\"" },
  { id: "income",   num: 5, title: "תעסוקה והכנסות",           short: "הכנסות",
    hint: "\"במה אתה עובד? כמה יוצא נטו בחודש?\"" },
  { id: "assets",   num: 6, title: "נכסים ורכב",               short: "נכסים",
    hint: "\"יש דירה בבעלותך? ורכב? (הרכב הוא הגיבוי — תמיד לשאול!)\"" },
  { id: "bank",     num: 7, title: "פרטי בנק",                 short: "בנק",
    hint: "\"באיזה בנק מתנהל החשבון שלך?\"" },
  { id: "contract", num: 8, title: "הסכם התקשרות",             short: "חתימה",
    hint: "\"אני שולח לך עכשיו הסכם התקשרות — תחתום ונתחיל לעבוד בשבילך\"" },
];

export const POST_SIGN_SECTIONS: SectionMeta[] = [
  { id: "cooldown", num: 9,  title: "המתנה — חזרה ללקוח", short: "המתנה",
    hint: "שעה אחרי החתימה חוזרים ללקוח ומתחילים לעבוד" },
  { id: "checks",   num: 10, title: "בדיקות זכאות — כל הגופים", short: "בדיקות",
    hint: "\"אני מריץ עכשיו בדיקות זכאות בכל גופי המימון במקביל\"" },
  { id: "docs",     num: 10, title: "מסמכים — מסלול רכב", short: "מסמכים",
    hint: "\"שלח לי 4 מסמכים: רישיון רכב, ת.ז, רישיון נהיגה ואישור ניהול חשבון\"" },
  { id: "results",  num: 11, title: "שיקוף תוצאות", short: "תוצאות",
    hint: "\"יש לי בשורות! הנה האישורים שקיבלת — בוא נבחר את הטוב ביותר\"" },
  { id: "closing",  num: 12, title: "הלוואה ותשלום", short: "תשלום",
    hint: "\"ההלוואה בדרך אליך — נשאר רק להסדיר את שכר הטרחה\"" },
];

export function sectionMeta(id: SectionId): SectionMeta {
  return [...FIRST_CALL_SECTIONS, ...POST_SIGN_SECTIONS].find((s) => s.id === id)!;
}

export function sectionComplete(j: JourneyState, id: SectionId): boolean {
  switch (id) {
    case "opening":  return !!(j.amountRequested && j.loanPurpose);
    case "credit":   return j.creditCards.length > 0 && !!j.cardLimit;
    case "bdi":      return j.smileyAuto !== null || j.smileyManual !== null;
    case "personal": return !!j.maritalStatus;
    case "income":   return !!(j.employment && j.monthlyIncome);
    case "assets":   return j.hasVehicle !== null;
    case "bank":     return !!(j.bankName && j.bankAccount);
    case "contract": return j.signedAt !== null;
    case "cooldown": return j.checksStartedAt !== null;
    case "checks":   return j.checksDone;
    case "docs":     return j.finalApproval !== null;
    case "results":  return j.chosenLender !== null || (deriveTrack(j) === "vehicle" && !!j.paymentDueAt);
    case "closing":  return j.paidAt !== null;
  }
}

/** first incomplete section = the current one */
export function currentSection(j: JourneyState): SectionId {
  for (const s of FIRST_CALL_SECTIONS) {
    if (!sectionComplete(j, s.id)) return s.id;
  }
  const track = deriveTrack(j);
  if (!sectionComplete(j, "cooldown")) return "cooldown";
  if (track === "vehicle") {
    if (!sectionComplete(j, "docs")) return "docs";
  } else {
    if (!sectionComplete(j, "checks")) return "checks";
  }
  if (!sectionComplete(j, "results")) return "results";
  // מסלול משולב: אחרי בחירת הצעה בכל-מטרה ממשיכים למסמכי הרכב
  if (deriveTrack(j) !== "vehicle" && j.comboVehicle && !sectionComplete(j, "docs")) return "docs";
  return "closing";
}

/* ============================================================
   Derived helpers — the card, the map and the DB mirror
   ============================================================ */

/** the worst of the two indicator lights (red > yellow > green > null) */
export function worstIndicator(j: JourneyState): Smiley {
  const vals = [j.smileyAuto, j.smileyManual];
  if (vals.includes("red")) return "red";
  if (vals.includes("yellow")) return "yellow";
  if (vals.includes("green")) return "green";
  return null;
}

/** why the customer failed general-track screening — Hebrew labels for the pivot moment */
export function screeningFailReasons(j: JourneyState): string[] {
  const reasons: string[] = [];
  const badAuto = j.smileyAuto === "yellow" || j.smileyAuto === "red";
  const badManual = j.smileyManual === "yellow" || j.smileyManual === "red";
  if (badAuto) reasons.push(`סמיילי אוטומטי ${j.smileyAuto === "red" ? "אדום" : "צהוב"}`);
  if (badManual) reasons.push(`סמיילי ידני ${j.smileyManual === "red" ? "אדום" : "צהוב"}`);
  if (j.creditCards.includes("אין כרטיס בכלל")) reasons.push("אין כרטיס אשראי");
  if (j.cardLimit === "עד 5,000 ש\"ח") reasons.push("מסגרת עד 5,000 ₪");
  if (j.loanPurpose === "רכב") reasons.push("מטרת ההלוואה: רכב");
  return reasons;
}

/** the ordered section list for THIS journey (track-aware, incl. post-signature) */
export function activeSections(j: JourneyState): SectionId[] {
  const track = deriveTrack(j);
  const post: SectionId[] =
    track === "vehicle" ? ["docs", "results"] :
    j.comboVehicle ? ["checks", "results", "docs"] :   // משולב: תוצאות כל-מטרה ואז מסמכי רכב
    ["checks", "results"];
  return [
    ...FIRST_CALL_SECTIONS.map((s) => s.id),
    "cooldown",
    ...post,
    "closing",
  ] as SectionId[];
}

/* ============================================================
   Context — מי הלקוח הזה ולמה אנחנו מדברים איתו עכשיו
   ============================================================ */
export interface JourneyContextInfo {
  label: string;
  tone: "green" | "blue" | "orange" | "red" | "gray";
  detail?: string;
}

export function journeyContext(j: JourneyState, hasHistory: boolean): JourneyContextInfo {
  const trackLabel =
    deriveTrack(j) === "vehicle" ? "הלוואה כנגד רכב" :
    j.comboVehicle ? "כל מטרה + רכב במקביל" : "הלוואה לכל מטרה";

  if (j.paidAt) return { label: "העסקה הושלמה — שילם ✅", tone: "green", detail: trackLabel };
  if (j.exitReason) return { label: "יצא מהמערכת", tone: "red", detail: j.exitReason };

  if (j.manualCallbackAt && !j.signedAt) {
    const when = new Date(j.manualCallbackAt);
    const fmt = when.toLocaleString("he-IL", { weekday: "short", hour: "2-digit", minute: "2-digit" });
    return {
      label: `ביקש שנחזור אליו — ${fmt}`,
      tone: "orange",
      detail: j.manualCallbackNote || undefined,
    };
  }

  if (j.signedAt) {
    const detail =
      j.chosenLender || j.finalApproval ? "אחרי אישור — לקראת הלוואה ותשלום" :
      j.checksStartedAt ? (deriveTrack(j) === "vehicle" ? "באיסוף מסמכים" : "בבדיקות זכאות") :
      "ממתין לחזרה של שעה";
    return { label: `לקוח חתום — ${trackLabel}`, tone: "blue", detail };
  }
  if (j.contractSentAt) return { label: `נשלח הסכם — ממתין לחתימה`, tone: "orange", detail: trackLabel };

  const startedAnything =
    !!j.amountRequested || !!j.loanPurpose || j.creditCards.length > 0 ||
    j.smileyAuto !== null || j.smileyManual !== null;
  if (startedAnything) {
    return { label: "בתהליך שיחה ראשונה", tone: "blue", detail: sectionMeta(currentSection(j)).title };
  }
  if (hasHistory) return { label: "לקוח חוזר — יש היסטוריה קודמת", tone: "orange", detail: "בדוק את ציר הזמן לפני השיחה" };
  return { label: "ליד חדש — טרם דיברו", tone: "gray", detail: "פתח בשיחת היכרות" };
}

export function journeyProgress(j: JourneyState): { done: number; total: number; pct: number } {
  const ids = activeSections(j);
  const done = ids.filter((id) => sectionComplete(j, id)).length;
  return { done, total: ids.length, pct: Math.round((done / ids.length) * 100) };
}

/** which JourneyState keys belong to each section — powers pre-fill badges + missing counts */
export const SECTION_FIELDS: Record<SectionId, (keyof JourneyState)[]> = {
  opening:  ["amountRequested", "loanPurpose"],
  credit:   ["creditCards", "cardLimit", "checkedBefore"],
  bdi:      ["idNumber", "gender", "smileyFirstName", "smileyLastName", "birthDate", "smileyAuto", "smileyManual"],
  personal: ["idIssueDate", "maritalStatus", "children"],
  income:   ["employment", "employerAndRole", "seniorityYears", "monthlyIncome", "spouseIncome"],
  assets:   ["hasProperty", "hasVehicle", "vehicleYear", "vehicleMake", "vehicleFree"],
  bank:     ["bankName", "bankBranch", "bankAccount"],
  contract: ["contractSentAt", "signedAt"],
  cooldown: ["checksStartedAt"],
  checks:   ["lenderResults", "checksDone"],
  docs:     ["docsReceived", "docsUploadedAt", "finalApproval"],
  results:  ["chosenLender"],
  closing:  ["feeAmount", "paidAt"],
};

/** is a journey value "filled"? (arrays → non-empty, objects → non-empty, else truthy/false-ok) */
export function fieldFilled(j: JourneyState, key: keyof JourneyState): boolean {
  const v = j[key];
  if (v === null || v === undefined || v === "") return false;
  if (Array.isArray(v)) return v.length > 0;
  if (typeof v === "object") return Object.keys(v).length > 0;
  return true;
}

/** how many of the section's fields are still empty (for the map badges) */
export function missingCount(j: JourneyState, id: SectionId): number {
  return SECTION_FIELDS[id].filter((k) => !fieldFilled(j, k)).length;
}

/* ============================================================
   Next Action — חוק הברזל של רֶצֶף: לכל ליד פעיל יש בדיוק צעד-הבא אחד.
   נגזר-בקריאה מהמצב — ליד "בלי צעד הבא" הוא מצב בלתי-אפשרי מבנית.
   ============================================================ */
export interface NextAction {
  type: string;
  /** מה עושים — בעברית, מנוסח לנציג */
  label: string;
  /** מתי — ISO; null = עכשיו */
  dueAt: string | null;
  tone: "blue" | "purple" | "amber" | "teal" | "orange" | "green" | "gold" | "gray";
}

function plusHours(iso: string, h: number): string {
  return new Date(new Date(iso).getTime() + h * 3600_000).toISOString();
}

export function nextActionFor(j: JourneyState): NextAction {
  if (j.paidAt) return { type: "done", label: "העסקה הושלמה — אין צעד נוסף", dueAt: null, tone: "green" };
  if (j.exitReason) {
    return { type: "reentry", label: "בדיקה מחדש בעוד 90 יום", dueAt: plusHours(new Date().toISOString(), 90 * 24), tone: "gray" };
  }
  if (j.loanArrivedAt && !j.paidAt) {
    return { type: "collect", label: "גביית שכר טרחה", dueAt: plusHours(j.loanArrivedAt, 24), tone: "gold" };
  }
  const track = deriveTrack(j);
  if ((j.chosenLender || (track === "vehicle" && j.paymentDueAt)) && !j.loanArrivedAt && j.signedAt) {
    return { type: "await-loan", label: "מעקב העברת ההלוואה", dueAt: j.paymentDueAt, tone: "green" };
  }
  if ((j.checksDone || j.finalApproval) && !j.chosenLender && track !== "vehicle" && !j.comboVehicle) {
    return { type: "reflect", label: "שיחת שיקוף תוצאות ללקוח", dueAt: null, tone: "green" };
  }
  if (j.checksStartedAt && (track === "vehicle" || j.comboVehicle) && !j.finalApproval) {
    const missing = VEHICLE_DOCS.filter((d) => !j.docsReceived[d.id]).length;
    return {
      type: "docs",
      label: missing > 0 ? `רדיפת מסמכים — חסרים ${missing}` : "העלאת מסמכים ואישור סופי",
      dueAt: plusHours(j.checksStartedAt, 3),
      tone: "orange",
    };
  }
  if (j.checksStartedAt && !j.checksDone && track !== "vehicle") {
    return { type: "checks", label: "השלמת בדיקות זכאות", dueAt: plusHours(j.checksStartedAt, 0.5), tone: "teal" };
  }
  if (j.signedAt && !j.checksStartedAt) {
    return { type: "cooldown", label: "חזרה ללקוח אחרי הצינון", dueAt: j.callbackDueAt, tone: "amber" };
  }
  if (j.contractSentAt && !j.signedAt) {
    return { type: "sign-chase", label: "רדיפת חתימה על ההסכם", dueAt: plusHours(j.contractSentAt, 3), tone: "purple" };
  }
  if (j.manualCallbackAt && new Date(j.manualCallbackAt).getTime() > Date.now()) {
    return { type: "callback", label: "חזרה שהובטחה ללקוח", dueAt: j.manualCallbackAt, tone: "purple" };
  }
  const started = !!j.amountRequested || !!j.loanPurpose || j.creditCards.length > 0 ||
    j.smileyAuto !== null || j.smileyManual !== null;
  if (started) return { type: "continue", label: "המשך שאלון — שיחה באמצע", dueAt: null, tone: "blue" };
  return { type: "first-call", label: "שיחה ראשונה", dueAt: null, tone: "blue" };
}

/**
 * lifecycle mirror — maps the journey onto Lead.stage
 * (vocabulary from lib/data/lifecycle.ts: NEW → CONTACT → SCREENING → CONTRACT →
 *  BDI → AUCTION → DECISION → DOCS → DISBURSEMENT → PAID | EXIT)
 */
export function deriveStage(j: JourneyState): string {
  if (j.paidAt) return "PAID";
  if (j.exitReason) return "EXIT";
  if (j.chosenLender || j.loanArrivedAt || (deriveTrack(j) === "vehicle" && j.paymentDueAt)) return "DISBURSEMENT";
  if (j.checksDone || j.finalApproval) return "DECISION";
  if (j.checksStartedAt) return deriveTrack(j) === "vehicle" ? "DOCS" : "AUCTION";
  if (j.signedAt) return "BDI";
  if (j.contractSentAt) return "CONTRACT";
  if (j.smileyAuto !== null || j.smileyManual !== null || j.creditCards.length > 0 || j.cardLimit) return "SCREENING";
  if (j.amountRequested || j.loanPurpose) return "CONTACT";
  return "NEW";
}
