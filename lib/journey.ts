/**
 * BINGO Journey Engine — the single source of truth for the agent workflow.
 *
 * The real flow (from Chen, verbatim):
 * 1. Dialer pops a customer → agent asks screening questions + רמזור check
 * 2. Failed any screening OR ramzor yellow/red → ask "יש בבעלותך רכב?"
 *    - Has car  → vehicle track questions → sign contract
 *    - No car   → exit
 * 3. Fully clean → general track questions → sign contract
 * 4. After signing: AUTO callback task +1 hour
 *    - General: eligibility checks at ALL lenders (with logos) → record
 *      results → reflect to customer → awaiting loan → AUTO payment task
 *      +2-3 days → paid → done
 *    - Vehicle: request 4 documents → upload to lender → final approval
 *      within minutes → show customer → awaiting loan → payment → done
 *
 * THE FIX for today's mess: ONE lead, ONE journey. "Has car" is a
 * remembered attribute — the system offers the vehicle pivot exactly
 * when needed. No duplicate processes, no forgotten questions.
 */

export type Track = "general" | "vehicle" | null;
export type Ramzor = "green" | "yellow" | "red" | null;

export type Stage =
  | "screening"      // שאלות סינון + רמזור
  | "vehicle-pivot"  // נפסל/צהוב → "יש בבעלותך רכב?"
  | "questionnaire"  // שאלון מורחב לפי מסלול
  | "contract"       // שליחת הסכם התקשרות + חתימה
  | "cooldown"       // המתנה של שעה (משימה אוטומטית)
  | "checks"         // כל מטרה: בדיקות זכאות בגופים
  | "docs"           // רכב: בקשת 4 מסמכים + העלאה לגוף
  | "results"        // שיקוף תוצאות ובחירת הצעה
  | "awaiting-loan"  // ממתין להעברת הלוואה
  | "payment"        // גביית תשלום על השירות
  | "done"           // הושלם 🎉
  | "exit";          // יציאה (לא זכאי / לא מעוניין)

export interface ScreeningQuestion {
  id: string;
  text: string;
  helper?: string;
  /** which answer disqualifies from the general track */
  failsWhen: "yes" | "no";
}

export const SCREENING_QUESTIONS: ScreeningQuestion[] = [
  { id: "enforcement", text: "האם יש הגבלות אשראי או חובות בהוצאה לפועל?", failsWhen: "yes" },
  { id: "restricted",  text: "האם חשבון הבנק מוגבל?", failsWhen: "yes" },
  { id: "hasCard",     text: "האם יש כרטיס אשראי פעיל?", failsWhen: "no" },
  { id: "cardLimit",   text: "האם מסגרת האשראי מעל 5,000 ₪?", helper: "מתחת ל-5,000 ₪ — פסילה למסלול כל מטרה", failsWhen: "no" },
];

/** the 4 documents required on the vehicle track */
export const VEHICLE_DOCS = [
  { id: "car-license",  label: "רישיון רכב" },
  { id: "id-copy",      label: "צילום תעודת זהות" },
  { id: "drive-license", label: "רישיון נהיגה" },
  { id: "bank-approval", label: "אישור ניהול חשבון" },
] as const;

/** lenders shown in the checks grid — real logos via favicon service */
export interface JourneyLender {
  key: string;
  name: string;
  domain: string;      // for logo
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

export type CheckOutcome = "approved" | "rejected" | "pending" | null;

export interface LenderResult {
  outcome: CheckOutcome;
  amount?: number | null;
  rate?: number | null;
  months?: number | null;
}

/** everything the card tracks for a lead's journey */
export interface JourneyState {
  stage: Stage;
  track: Track;
  ramzor: Ramzor;
  screening: Record<string, "yes" | "no" | null>;
  /** remembered attribute — drives the automatic vehicle fallback */
  hasVehicle: boolean | null;
  vehicleYear?: string;
  vehicleMake?: string;
  vehicleFree?: "yes" | "no" | null; // נקי משעבוד?
  // questionnaire (general)
  employment?: string;
  monthlyIncome?: string;
  bankName?: string;
  amountRequested?: string;
  loanPurpose?: string;
  // contract
  contractSentAt: string | null;
  contractSentVia?: "whatsapp" | "sms";
  signedAt: string | null;
  /** auto-callback due time (signedAt + 1h) */
  callbackDueAt: string | null;
  // checks (general)
  lenderResults: Record<string, LenderResult>;
  chosenLender: string | null;
  // docs (vehicle)
  docsReceived: Record<string, boolean>;
  docsUploadedAt: string | null;
  finalApproval: { amount?: number | null; rate?: number | null; months?: number | null } | null;
  // payment
  paymentDueAt: string | null;
  feeAmount?: string;
  paidAt: string | null;
  // exit
  exitReason: string | null;
  // log
  timeline: Array<{ at: string; text: string; kind: string }>;
}

export function initialJourney(): JourneyState {
  return {
    stage: "screening",
    track: null,
    ramzor: null,
    screening: Object.fromEntries(SCREENING_QUESTIONS.map((q) => [q.id, null])),
    hasVehicle: null,
    contractSentAt: null,
    signedAt: null,
    callbackDueAt: null,
    lenderResults: {},
    chosenLender: null,
    docsReceived: {},
    docsUploadedAt: null,
    finalApproval: null,
    paymentDueAt: null,
    paidAt: null,
    exitReason: null,
    timeline: [],
  };
}

/** did the lead fail the general-track screening? */
export function screeningFailed(s: JourneyState): boolean {
  const badRamzor = s.ramzor === "yellow" || s.ramzor === "red";
  const failedQuestion = SCREENING_QUESTIONS.some((q) => {
    const a = s.screening[q.id];
    return a !== null && a === q.failsWhen;
  });
  return badRamzor || failedQuestion;
}

/** is screening complete (all questions + ramzor answered)? */
export function screeningComplete(s: JourneyState): boolean {
  return s.ramzor !== null && SCREENING_QUESTIONS.every((q) => s.screening[q.id] !== null);
}

/** human label per stage — for the stepper */
export const STAGE_LABELS: Array<{ key: Stage; label: string; short: string }> = [
  { key: "screening",     label: "סינון ורמזור",   short: "סינון" },
  { key: "questionnaire", label: "שאלון",           short: "שאלון" },
  { key: "contract",      label: "הסכם התקשרות",   short: "חתימה" },
  { key: "cooldown",      label: "המתנה (שעה)",     short: "המתנה" },
  { key: "checks",        label: "בדיקות זכאות",    short: "בדיקות" },
  { key: "docs",          label: "מסמכים",          short: "מסמכים" },
  { key: "results",       label: "תוצאות והצעה",    short: "תוצאות" },
  { key: "awaiting-loan", label: "ממתין להלוואה",   short: "המתנה" },
  { key: "payment",       label: "תשלום",           short: "תשלום" },
  { key: "done",          label: "הושלם",           short: "הושלם" },
];

/** the visible steps for a given track (vehicle skips checks, general skips docs) */
export function stepsForTrack(track: Track): Stage[] {
  const base: Stage[] = ["screening", "questionnaire", "contract", "cooldown"];
  if (track === "vehicle") return [...base, "docs", "results", "awaiting-loan", "payment", "done"];
  return [...base, "checks", "results", "awaiting-loan", "payment", "done"];
}
