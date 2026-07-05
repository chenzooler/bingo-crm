/**
 * BINGO Journey Engine v3 — mirrors the REAL Yoatsim lead card
 * (documented live in docs/yoatsim-lead-card.md, 06/07/2026).
 *
 * Real card sections, in order:
 * 1. פתיחת שיחה — "איך אפשר לעזור?" (שם, סכום, מטרה)
 * 2. בדיקת נתוני אשראי — אילו כרטיסים · גובה מסגרת · בדיקה קודמת איפה
 * 3. בדיקת חיווי אשראי — אישור לקוח BDI · סמיילי אוטומציה (בוט) ·
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
  smileyAuto: Smiley;                 // סמיילי אוטומציה (הבוט)
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

  // --- 8. הסכם התקשרות ---
  contractSentAt: string | null;
  contractSentVia?: "whatsapp" | "sms";
  signedAt: string | null;
  callbackDueAt: string | null;

  // --- post-signature lifecycle ---
  checksStartedAt: string | null;
  lenderResults: Record<string, LenderResult>;
  checksDone: boolean;
  docsReceived: Record<string, boolean>;
  docsUploadedAt: string | null;
  finalApproval: { amount?: number | null; rate?: number | null; months?: number | null } | null;
  chosenLender: string | null;
  paymentDueAt: string | null;
  feeAmount?: string;
  paidAt: string | null;

  exitReason: string | null;
  timeline: Array<{ at: string; text: string; kind: string }>;
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
    contractSentAt: null,
    signedAt: null,
    callbackDueAt: null,
    checksStartedAt: null,
    lenderResults: {},
    checksDone: false,
    docsReceived: {},
    docsUploadedAt: null,
    finalApproval: null,
    chosenLender: null,
    paymentDueAt: null,
    paidAt: null,
    exitReason: null,
    timeline: [],
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

/** current track, derived from the data */
export function deriveTrack(j: JourneyState): Track {
  const purposeVehicle = j.loanPurpose === "רכב";
  if (disqualified(j) || purposeVehicle) {
    return j.hasVehicle === "yes" ? "vehicle" : null;
  }
  // clean so far → general once we know enough
  const answeredAny = j.smileyAuto !== null || j.smileyManual !== null ||
                      j.creditCards.length > 0 || j.smileyGreenConfirmed;
  return answeredAny ? "general" : null;
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

export const FIRST_CALL_SECTIONS: Array<{ id: SectionId; num: number; title: string; short: string }> = [
  { id: "opening",  num: 1, title: "פתיחת שיחה — סכום ומטרה",  short: "פתיחה" },
  { id: "credit",   num: 2, title: "בדיקת נתוני אשראי",        short: "אשראי" },
  { id: "bdi",      num: 3, title: "בדיקת חיווי אשראי (סמיילי)", short: "סמיילי" },
  { id: "personal", num: 4, title: "השלמת נתונים",             short: "נתונים" },
  { id: "income",   num: 5, title: "תעסוקה והכנסות",           short: "הכנסות" },
  { id: "assets",   num: 6, title: "נכסים ורכב",               short: "נכסים" },
  { id: "bank",     num: 7, title: "פרטי בנק",                 short: "בנק" },
  { id: "contract", num: 8, title: "הסכם התקשרות",             short: "חתימה" },
];

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
  return "closing";
}
