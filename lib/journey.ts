/**
 * BINGO Journey Engine v2 — the agent's first-call flow, Yoatsim order.
 *
 * Chen's spec (verbatim answers):
 * - Order: like Yoatsim today — פתיחה (סכום+מטרה) → שאלות אשראי →
 *   פרטים אישיים → משפחה → תעסוקה+הכנסות → נכסים → בנק → רמזור → חתימה
 * - Everything on ONE screen, sections stacked, no locked wizard
 * - Always clear what's next; free navigation (skip/edit anything)
 * - Failing credit OR yellow/red ramzor → vehicle track (assets section
 *   already captured whether there's a car — no separate pivot screen)
 * - After signing: auto +1h callback → checks (general, with logos) /
 *   docs (vehicle) → results → awaiting → payment → done
 */

export type Track = "general" | "vehicle" | null;
export type Ramzor = "green" | "yellow" | "red" | null;
export type YesNo = "yes" | "no" | null;

/** the 5 credit-screening questions, Yoatsim order */
export interface CreditQuestion {
  id: string;
  text: string;
  helper?: string;
  failsWhen: "yes" | "no";
}

export const CREDIT_QUESTIONS: CreditQuestion[] = [
  { id: "enforcement", text: "האם היו חובות בהוצאה לפועל?", failsWhen: "yes" },
  { id: "restricted",  text: "האם החשבון מוגבל או היה מוגבל?", failsWhen: "yes" },
  { id: "bdiCleanup",  text: "האם עבר ניקוי BDI / מחיקת חובות?", failsWhen: "yes" },
  { id: "hasCard",     text: "האם יש כרטיס אשראי פעיל?", failsWhen: "no" },
  { id: "cardLimit",   text: "האם המסגרת מעל 5,000 ₪?", helper: "מסגרת עד 5,000 ₪ — פסילה למסלול כל מטרה", failsWhen: "no" },
];

export const VEHICLE_DOCS = [
  { id: "car-license",   label: "רישיון רכב" },
  { id: "id-copy",       label: "צילום תעודת זהות" },
  { id: "drive-license", label: "רישיון נהיגה" },
  { id: "bank-approval", label: "אישור ניהול חשבון" },
] as const;

export interface JourneyLender {
  key: string;
  name: string;
  domain: string;
  botSupported: boolean;
}

export const JOURNEY_LENDERS: JourneyLender[] = [
  { key: "jerusalem",    name: "בנק ירושלים", domain: "bankjerusalem.co.il",   botSupported: true },
  { key: "phoenix",      name: "פניקס",        domain: "fnx.co.il",             botSupported: true },
  { key: "isracard",     name: "ישראכרט",      domain: "isracard.co.il",        botSupported: true },
  { key: "cal",          name: "כאל",          domain: "cal-online.co.il",      botSupported: true },
  { key: "max",          name: "MAX",          domain: "max.co.il",             botSupported: true },
  { key: "mimun-yashir", name: "מימון ישיר",   domain: "mimun.co.il",           botSupported: false },
  { key: "leumi",        name: "לאומי",        domain: "leumi.co.il",           botSupported: false },
  { key: "hapoalim",     name: "הפועלים",      domain: "bankhapoalim.co.il",    botSupported: false },
  { key: "discount",     name: "דיסקונט",      domain: "discountbank.co.il",    botSupported: false },
  { key: "mizrahi",      name: "מזרחי טפחות",  domain: "mizrahi-tefahot.co.il", botSupported: false },
];

export function lenderLogo(domain: string, size = 64): string {
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=${size}`;
}

export interface LenderResult {
  outcome: "approved" | "rejected" | "pending" | null;
  amount?: number | null;
  rate?: number | null;
  months?: number | null;
}

/** everything the card tracks — flat, section-oriented */
export interface JourneyState {
  // 1. פתיחת שיחה
  amountRequested?: string;
  loanPurpose?: string;
  // 2. בדיקת אשראי (5 שאלות)
  credit: Record<string, YesNo>;
  // 3. פרטים אישיים
  idNumber?: string;
  birthYear?: string;
  gender?: "male" | "female" | null;
  // 4. מצב משפחתי
  familyStatus?: string;
  children?: string;
  // 5. תעסוקה והכנסות
  employment?: string;
  seniorityYears?: string;
  monthlyIncome?: string;
  spouseIncome?: string;
  // 6. נכסים
  hasProperty?: "yes" | "yes-mortgaged" | "no" | null;
  hasVehicle: YesNo;
  vehicleYear?: string;
  vehicleMake?: string;
  vehicleFree?: YesNo;
  // 7. בנק
  bankName?: string;
  bankBranch?: string;
  bankAccount?: string;
  // 8. רמזור
  ramzor: Ramzor;
  // 9. חתימה
  contractSentAt: string | null;
  contractSentVia?: "whatsapp" | "sms";
  signedAt: string | null;
  callbackDueAt: string | null;
  // -------- post-signature lifecycle --------
  checksStartedAt: string | null;
  lenderResults: Record<string, LenderResult>;
  checksDone: boolean;
  docsReceived: Record<string, boolean>;
  docsUploadedAt: string | null;
  finalApproval: { amount?: number | null; rate?: number | null; months?: number | null } | null;
  chosenLender: string | null;
  loanArrived: boolean;
  paymentDueAt: string | null;
  feeAmount?: string;
  paidAt: string | null;
  // meta
  exitReason: string | null;
  timeline: Array<{ at: string; text: string; kind: string }>;
}

export function initialJourney(): JourneyState {
  return {
    credit: Object.fromEntries(CREDIT_QUESTIONS.map((q) => [q.id, null])),
    hasVehicle: null,
    ramzor: null,
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
    loanArrived: false,
    paymentDueAt: null,
    paidAt: null,
    exitReason: null,
    timeline: [],
  };
}

/* ---------- live verdict ---------- */
export function creditFailed(j: JourneyState): boolean {
  return CREDIT_QUESTIONS.some((q) => j.credit[q.id] !== null && j.credit[q.id] === q.failsWhen);
}
export function ramzorBad(j: JourneyState): boolean {
  return j.ramzor === "yellow" || j.ramzor === "red";
}
/** the current track, derived live from the data — never set by hand */
export function deriveTrack(j: JourneyState): Track {
  const disqualified = creditFailed(j) || ramzorBad(j);
  if (!disqualified) {
    // fully clean so far → general (only once we know enough)
    const answeredAny = CREDIT_QUESTIONS.some((q) => j.credit[q.id] !== null) || j.ramzor !== null;
    return answeredAny ? "general" : null;
  }
  // disqualified → vehicle if there is a car, else exit-bound
  if (j.hasVehicle === "yes") return "vehicle";
  return null;
}
/** disqualified from general AND no car answer yet → the agent MUST ask */
export function needsVehicleAnswer(j: JourneyState): boolean {
  return (creditFailed(j) || ramzorBad(j)) && j.hasVehicle === null;
}
/** disqualified AND no car → dead end */
export function isDeadEnd(j: JourneyState): boolean {
  return (creditFailed(j) || ramzorBad(j)) && j.hasVehicle === "no";
}

/* ---------- section completion (drives the "what's next" logic) ---------- */
export type SectionId =
  | "opening" | "credit" | "personal" | "family" | "income"
  | "assets" | "bank" | "ramzor" | "contract"
  | "cooldown" | "checks" | "docs" | "results" | "closing";

export function sectionComplete(j: JourneyState, id: SectionId): boolean {
  switch (id) {
    case "opening":  return !!(j.amountRequested && j.loanPurpose);
    case "credit":   return CREDIT_QUESTIONS.every((q) => j.credit[q.id] !== null);
    case "personal": return !!(j.idNumber && j.birthYear);
    case "family":   return !!j.familyStatus;
    case "income":   return !!(j.employment && j.monthlyIncome);
    case "assets":   return j.hasProperty != null && j.hasVehicle !== null;
    case "bank":     return !!(j.bankName && j.bankBranch && j.bankAccount);
    case "ramzor":   return j.ramzor !== null;
    case "contract": return j.signedAt !== null;
    case "cooldown": return j.checksStartedAt !== null;
    case "checks":   return j.checksDone;
    case "docs":     return j.finalApproval !== null;
    case "results":  return j.chosenLender !== null || (deriveTrack(j) === "vehicle" && j.loanArrived);
    case "closing":  return j.paidAt !== null;
  }
}

export const FIRST_CALL_SECTIONS: Array<{ id: SectionId; num: number; title: string; short: string }> = [
  { id: "opening",  num: 1, title: "פתיחת שיחה — סכום ומטרה", short: "פתיחה" },
  { id: "credit",   num: 2, title: "בדיקת אשראי ראשונית",      short: "אשראי" },
  { id: "personal", num: 3, title: "פרטים אישיים",              short: "פרטים" },
  { id: "family",   num: 4, title: "מצב משפחתי",                short: "משפחה" },
  { id: "income",   num: 5, title: "תעסוקה והכנסות",            short: "הכנסות" },
  { id: "assets",   num: 6, title: "נכסים ורכב",                short: "נכסים" },
  { id: "bank",     num: 7, title: "פרטי בנק",                  short: "בנק" },
  { id: "ramzor",   num: 8, title: "בדיקת רמזור",               short: "רמזור" },
  { id: "contract", num: 9, title: "הסכם התקשרות",              short: "חתימה" },
];

/** first incomplete section = the current one */
export function currentSection(j: JourneyState): SectionId {
  for (const s of FIRST_CALL_SECTIONS) {
    if (!sectionComplete(j, s.id)) return s.id;
  }
  // post-signature lifecycle
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
