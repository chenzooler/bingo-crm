/**
 * Lead ⇄ JourneyState mapping layer.
 *
 * The journey keeps Hebrew display strings (what the rep sees);
 * the Lead row keeps canonical keys (what lists/reports/import use).
 * - journeyFromLead(): hydrate a JourneyState from a Lead row — this is the
 *   pre-fill path for imported leads (the card confirms instead of asking).
 * - leadPatchFromJourney(): mirror the journey back onto the canonical columns.
 *
 * All maps live HERE and only here — round-trip must stay idempotent.
 */
import type { Lead as PrismaLead, Prisma } from "@prisma/client";
import {
  type JourneyState, initialJourney, deriveTrack, deriveStage, worstIndicator,
} from "@/lib/journey";

/* ---------- value maps (Hebrew ↔ canonical) ---------- */

const MARITAL: Record<string, string> = {
  "רווק/ה": "single", "נשוי/אה": "married", "גרוש/ה": "divorced",
  "אלמן/ה": "widowed", "ידוע/ה בציבור": "common-law",
};
const EMPLOYMENT: Record<string, string> = {
  "שכיר": "employee", "עצמאי": "self-employed", "גמלאי": "retired",
  "פנסיונר": "retired", "לא עובד": "unemployed", "קצבה": "stipend",
};
// reverse maps pick ONE Hebrew label per canonical key
const MARITAL_BACK = invert(MARITAL);
const EMPLOYMENT_BACK: Record<string, string> = {
  employee: "שכיר", "self-employed": "עצמאי", retired: "פנסיונר",
  unemployed: "לא עובד", stipend: "קצבה",
};
const GENDER: Record<string, string> = { "זכר": "male", "נקבה": "female" };
const GENDER_BACK = invert(GENDER);
const CARD_LIMIT: Record<string, string> = { "מעל 5,000 ש\"ח": "above-5k", "עד 5,000 ש\"ח": "below-5k" };
const CARD_LIMIT_BACK = invert(CARD_LIMIT);
const CREDIT_CARD: Record<string, string> = {
  "ישראכרט": "isracard", "כאל": "cal", "מקס": "max",
  "דיירקט": "direct", "יש כרטיס": "has-card", "אין כרטיס בכלל": "none",
};
const CREDIT_CARD_BACK = invert(CREDIT_CARD);
// legacy purpose label from the v2 card → v3 vocabulary
const PURPOSE_ALIAS: Record<string, string> = { "סגירת חובות": "כיסוי חובות" };

function invert(m: Record<string, string>): Record<string, string> {
  return Object.fromEntries(Object.entries(m).map(([k, v]) => [v, k]));
}

/* ---------- small parsers ---------- */

function num(s?: string | null): number | undefined {
  if (!s) return undefined;
  const n = Number(String(s).replace(/[^\d.-]/g, ""));
  return Number.isFinite(n) ? n : undefined;
}
function int(s?: string | null): number | undefined {
  const n = num(s);
  return n === undefined ? undefined : Math.round(n);
}
function dateStr(d?: Date | null): string | undefined {
  return d ? d.toISOString().slice(0, 10) : undefined;
}
function parseDate(s?: string): Date | undefined {
  if (!s) return undefined;
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

/* ============================================================
   Lead → JourneyState (hydration + pre-fill)
   ============================================================ */
export function journeyFromLead(lead: PrismaLead): {
  journey: JourneyState;
  prefilled: (keyof JourneyState)[];
} {
  // an existing journey blob wins — it IS the card state
  if (lead.journeyJson) {
    try {
      const parsed = JSON.parse(lead.journeyJson) as Partial<JourneyState>;
      const journey = { ...initialJourney(), ...parsed };
      return { journey, prefilled: (journey.prefilledKeys ?? []) as (keyof JourneyState)[] };
    } catch {
      /* corrupt blob → fall through to column hydration */
    }
  }

  const j = initialJourney();
  const prefilled: (keyof JourneyState)[] = [];
  const set = <K extends keyof JourneyState>(key: K, value: JourneyState[K] | undefined) => {
    if (value === undefined || value === null || value === "") return;
    if (Array.isArray(value) && value.length === 0) return;
    j[key] = value;
    prefilled.push(key);
  };

  // 1. opening
  set("amountRequested", lead.amountRequested != null ? String(Math.round(lead.amountRequested)) : undefined);
  set("loanPurpose", lead.loanPurpose ? (PURPOSE_ALIAS[lead.loanPurpose] ?? lead.loanPurpose) : undefined);

  // 2. credit screening
  if (lead.creditCardsJson) {
    try {
      const keys = JSON.parse(lead.creditCardsJson) as string[];
      set("creditCards", keys.map((k) => CREDIT_CARD_BACK[k]).filter(Boolean));
    } catch { /* ignore bad json */ }
  }
  set("cardLimit", lead.cardLimit ? CARD_LIMIT_BACK[lead.cardLimit] : undefined);

  // 3. indicator (BDI) — an imported smiley came from the external screening system
  set("idNumber", lead.idNumber ?? undefined);
  set("gender", lead.gender ? GENDER_BACK[lead.gender] : undefined);
  set("birthDate", dateStr(lead.birthDate));
  set("smileyFirstName", lead.firstName ?? undefined);
  set("smileyLastName", lead.lastName ?? undefined);
  if (lead.smiley === "green" || lead.smiley === "yellow" || lead.smiley === "red") {
    set("smileyAuto", lead.smiley);
  }
  if (lead.bdiApproved != null) set("bdiApproved", lead.bdiApproved);

  // 4. personal
  set("maritalStatus", lead.maritalStatus ? MARITAL_BACK[lead.maritalStatus] : undefined);
  set("children", lead.numberOfChildren != null ? String(lead.numberOfChildren) : undefined);

  // 5. income
  set("employment", lead.employmentStatus ? EMPLOYMENT_BACK[lead.employmentStatus] : undefined);
  set("employerAndRole", lead.employerName ?? undefined);
  set("seniorityYears", lead.seniorityMonths != null ? String(Math.round((lead.seniorityMonths / 12) * 10) / 10) : undefined);
  set("monthlyIncome", lead.monthlyIncome != null ? String(Math.round(lead.monthlyIncome)) : undefined);
  set("spouseIncome", lead.spouseIncome != null ? String(Math.round(lead.spouseIncome)) : undefined);
  set("additionalIncome", lead.additionalIncome != null ? String(Math.round(lead.additionalIncome)) : undefined);

  // 6. assets
  if (lead.hasProperty === "yes") set("hasProperty", "בבעלות");
  else if (lead.hasProperty === "yes-charged") set("hasProperty", "בבעלות + משכנתא");
  else if (lead.hasProperty === "no") {
    set("hasProperty", lead.housing === "with-family" ? "אצל ההורים" : "בשכירות");
  }
  if (lead.hasVehicle != null) set("hasVehicle", lead.hasVehicle ? "yes" : "no");
  set("vehicleYear", lead.vehicleYear != null ? String(lead.vehicleYear) : undefined);
  set("vehicleMake", lead.vehicleMake ?? undefined);

  // 7. bank
  set("bankName", lead.bankName ?? undefined);
  set("bankBranch", lead.bankBranch ?? undefined);
  set("bankAccount", lead.bankAccount ?? undefined);

  j.prefilledKeys = prefilled as string[];
  return { journey: j, prefilled };
}

/* ============================================================
   JourneyState → Lead columns (the mirror written on save)
   ============================================================ */
export function leadPatchFromJourney(j: JourneyState): Prisma.LeadUpdateInput {
  const p: Prisma.LeadUpdateInput = {};

  if (j.amountRequested) p.amountRequested = num(j.amountRequested);
  if (j.loanPurpose) p.loanPurpose = j.loanPurpose;

  if (j.creditCards.length > 0) {
    p.creditCardsJson = JSON.stringify(j.creditCards.map((c) => CREDIT_CARD[c]).filter(Boolean));
  }
  if (j.cardLimit) p.cardLimit = CARD_LIMIT[j.cardLimit];

  if (j.idNumber) p.idNumber = j.idNumber;
  if (j.gender) p.gender = GENDER[j.gender];
  const bd = parseDate(j.birthDate);
  if (bd) p.birthDate = bd;
  const indicator = worstIndicator(j);
  if (indicator) p.smiley = indicator;
  p.bdiApproved = j.bdiApproved;

  if (j.maritalStatus) p.maritalStatus = MARITAL[j.maritalStatus];
  const children = int(j.children);
  if (children !== undefined) p.numberOfChildren = children;

  if (j.employment) p.employmentStatus = EMPLOYMENT[j.employment];
  if (j.employerAndRole) p.employerName = j.employerAndRole;
  const seniority = num(j.seniorityYears);
  if (seniority !== undefined) p.seniorityMonths = Math.round(seniority * 12);
  if (j.monthlyIncome) p.monthlyIncome = num(j.monthlyIncome);
  if (j.spouseIncome) p.spouseIncome = num(j.spouseIncome);
  if (j.additionalIncome) p.additionalIncome = num(j.additionalIncome);

  if (j.hasProperty === "בבעלות") { p.hasProperty = "yes"; p.housing = "owned"; }
  else if (j.hasProperty === "בבעלות + משכנתא") { p.hasProperty = "yes-charged"; p.housing = "owned"; }
  else if (j.hasProperty === "בשכירות") { p.hasProperty = "no"; p.housing = "rent"; }
  else if (j.hasProperty === "אצל ההורים") { p.hasProperty = "no"; p.housing = "with-family"; }
  if (j.hasVehicle !== null) p.hasVehicle = j.hasVehicle === "yes";
  const vy = int(j.vehicleYear);
  if (vy !== undefined) p.vehicleYear = vy;
  if (j.vehicleMake) p.vehicleMake = j.vehicleMake;

  if (j.bankName) p.bankName = j.bankName;
  if (j.bankBranch) p.bankBranch = j.bankBranch;
  if (j.bankAccount) p.bankAccount = j.bankAccount;

  // deal + lifecycle mirror
  const track = deriveTrack(j);
  if (track) p.category = track;
  p.stage = deriveStage(j);
  if (j.exitReason) p.exitReason = j.exitReason;
  if (j.chosenLender) p.finalLenderKey = j.chosenLender;
  if (j.finalApproval) {
    if (j.finalApproval.amount != null) p.finalApprovedAmount = j.finalApproval.amount;
    if (j.finalApproval.rate != null) p.finalInterest = j.finalApproval.rate;
    if (j.finalApproval.months != null) p.finalMonths = j.finalApproval.months;
  }
  if (j.feeAmount) p.feeAmount = num(j.feeAmount);
  p.feePaid = !!j.paidAt;

  return p;
}
