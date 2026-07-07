/**
 * שכפול Yoatsim — שכבת הערכים.
 * כל ערכי הכרטיס הקלאסי חיים ב-Lead.extraJson (מפתח = FieldDef.key).
 * תת-קבוצה ממופה גם לעמודות הקנוניות של Lead — כדי שהרשימות, הייבוא
 * והמסכים הקיימים ימשיכו לעבוד. extraJson תמיד מנצח בקריאה.
 */
import type { Lead as PrismaLead, Prisma } from "@prisma/client";
import { EPHEMERAL_KEYS } from "./card-schema";

export type ClassicValues = Record<string, string | string[] | boolean | undefined>;

/* ---------- Hebrew ↔ canonical maps (עמודות בלבד) ---------- */
const MARITAL: Record<string, string> = {
  "רווק/ה": "single", "נשוי/אה": "married", "גרוש/ה": "divorced",
  "אלמן/ה": "widowed", "ידועים בציבור": "common-law",
};
const MARITAL_BACK = invert(MARITAL);
const EMPLOYMENT: Record<string, string> = {
  "שכיר": "employee", "עצמאי": "self-employed", "מקבל קצבה": "stipend",
  "לא עובד": "unemployed", "פנסיונר": "retired",
};
const EMPLOYMENT_BACK = invert(EMPLOYMENT);
const GENDER: Record<string, string> = { "זכר": "male", "נקבה": "female" };
const GENDER_BACK = invert(GENDER);
const CARD_LIMIT: Record<string, string> = { "מעל 5,000 ש\"ח": "above-5k", "מתחת ל-5,000 ש\"ח": "below-5k" };
const CARD_LIMIT_BACK = invert(CARD_LIMIT);
const HOUSING: Record<string, string> = {
  "שכירות": "rent", "בעלות": "owned", "בעלות + משכנתא": "owned-mortgage", "אצל ההורים": "with-family",
};
const HOUSING_BACK = invert(HOUSING);
const CREDIT_CARD: Record<string, string> = {
  "ישראכרט": "isracard", "כאל": "cal", "מקס": "max",
  "דיירקט": "direct", "אין כרטיס בכלל": "none", "יש כרטיסים": "has-card",
};
const CREDIT_CARD_BACK = invert(CREDIT_CARD);

function invert(m: Record<string, string>): Record<string, string> {
  return Object.fromEntries(Object.entries(m).map(([k, v]) => [v, k]));
}
function num(v: unknown): number | undefined {
  if (v === undefined || v === null || v === "") return undefined;
  const n = Number(String(v).replace(/[^\d.-]/g, ""));
  return Number.isFinite(n) ? n : undefined;
}
function dateStr(d?: Date | null): string | undefined {
  return d ? d.toISOString().slice(0, 10) : undefined;
}

/* ============================================================
   Lead → values (עמודות כברירת מחדל, extraJson מנצח)
   ============================================================ */
export function valuesFromLead(lead: PrismaLead): ClassicValues {
  const v: ClassicValues = {};

  // מהעמודות (מילוי מראש מהייבוא / מהמסכים האחרים)
  if (lead.firstName) v.firstName = lead.firstName;
  if (lead.lastName) v.lastName = lead.lastName;
  if (!lead.firstName && !lead.lastName && lead.fullName) {
    const [f, ...rest] = lead.fullName.split(" ");
    v.firstName = f;
    v.lastName = rest.join(" ");
  }
  if (lead.amountRequested != null) v.amountRequested = String(Math.round(lead.amountRequested));
  if (lead.loanPurpose) v.loanPurpose = lead.loanPurpose;
  if (lead.creditCardsJson) {
    try {
      const keys = JSON.parse(lead.creditCardsJson) as string[];
      v.creditCards = keys.map((k) => CREDIT_CARD_BACK[k]).filter(Boolean);
    } catch { /* ignore */ }
  }
  if (lead.cardLimit) v.cardLimit = CARD_LIMIT_BACK[lead.cardLimit];
  if (lead.idNumber) v.idNumber = lead.idNumber;
  if (lead.gender) v.gender = GENDER_BACK[lead.gender];
  if (lead.birthDate) v.birthDate = dateStr(lead.birthDate);
  if (lead.maritalStatus) v.maritalStatus = MARITAL_BACK[lead.maritalStatus];
  if (lead.numberOfChildren != null) v.children = String(lead.numberOfChildren);
  if (lead.employmentStatus) v.employment = EMPLOYMENT_BACK[lead.employmentStatus];
  if (lead.employerName) v.employerAndRole = lead.employerName;
  if (lead.seniorityMonths != null) v.seniority = String(Math.round(lead.seniorityMonths / 12));
  if (lead.monthlyIncome != null) v.monthlyIncome = String(Math.round(lead.monthlyIncome));
  if (lead.spouseIncome != null) v.spouseNetPay = String(Math.round(lead.spouseIncome));
  if (lead.city) v.city = lead.city;
  if (lead.address) v.address = lead.address;
  if (lead.housing) v.housingType = HOUSING_BACK[lead.housing] ?? undefined;
  if (lead.monthlyHousingPayment != null) v.monthlyHousingPayment = String(Math.round(lead.monthlyHousingPayment));
  if (lead.hasProperty) v.hasProperty = lead.hasProperty === "no" ? "אין" : "יש";
  if (lead.hasVehicle != null) v.hasVehicleRaw = lead.hasVehicle ? "כן" : "לא";
  if (lead.vehicleYear != null) v.vehicleYearBand = lead.vehicleYear >= 2013 ? "מעל 2013" : "מתחת 2013";
  if (lead.bankName) v.bankName = lead.bankName;
  if (lead.bankBranch) v.bankBranch = lead.bankBranch;
  if (lead.bankAccount) v.bankAccount = lead.bankAccount;
  if (lead.monthlyObligations != null) v.totalMonthlyPayment = String(Math.round(lead.monthlyObligations));
  if (lead.smiley) v.smileyAuto = lead.smiley;

  // extraJson מנצח על הכל
  if (lead.extraJson) {
    try {
      Object.assign(v, JSON.parse(lead.extraJson));
    } catch { /* corrupt json — keep columns */ }
  }
  return v;
}

/* ============================================================
   values → Lead patch (extraJson מלא + מראה עמודות)
   ============================================================ */
export function leadPatchFromValues(values: ClassicValues): Prisma.LeadUpdateInput {
  // לעולם לא שומרים שדות רגישים
  const persisted: ClassicValues = {};
  for (const [k, val] of Object.entries(values)) {
    if (!EPHEMERAL_KEYS.has(k)) persisted[k] = val;
  }

  const p: Prisma.LeadUpdateInput = { extraJson: JSON.stringify(persisted) };
  const s = (k: string) => (typeof persisted[k] === "string" ? (persisted[k] as string) : undefined);

  const first = s("firstName");
  const last = s("lastName");
  if (first !== undefined) p.firstName = first;
  if (last !== undefined) p.lastName = last;
  if (first || last) p.fullName = [first, last].filter(Boolean).join(" ");

  const amount = num(persisted.amountRequested);
  if (amount !== undefined) p.amountRequested = amount;
  if (s("loanPurpose")) p.loanPurpose = s("loanPurpose");
  if (Array.isArray(persisted.creditCards)) {
    p.creditCardsJson = JSON.stringify((persisted.creditCards as string[]).map((c) => CREDIT_CARD[c]).filter(Boolean));
  }
  if (s("cardLimit")) p.cardLimit = CARD_LIMIT[s("cardLimit")!];
  if (s("idNumber")) p.idNumber = s("idNumber");
  if (s("gender")) p.gender = GENDER[s("gender")!];
  if (s("birthDate")) {
    const d = new Date(s("birthDate")!);
    if (!Number.isNaN(d.getTime())) p.birthDate = d;
  }
  if (s("maritalStatus")) p.maritalStatus = MARITAL[s("maritalStatus")!];
  const children = num(persisted.children);
  if (children !== undefined) p.numberOfChildren = Math.round(children);
  if (s("employment")) p.employmentStatus = EMPLOYMENT[s("employment")!];
  if (s("employerAndRole")) p.employerName = s("employerAndRole");
  const seniority = num(persisted.seniority);
  if (seniority !== undefined) p.seniorityMonths = Math.round(seniority * 12);
  const income = num(persisted.monthlyIncome);
  if (income !== undefined) p.monthlyIncome = income;
  const spouse = num(persisted.spouseNetPay);
  if (spouse !== undefined) p.spouseIncome = spouse;
  if (s("city")) p.city = s("city");
  if (s("address")) p.address = s("address");
  if (s("housingType")) p.housing = HOUSING[s("housingType")!];
  const housePay = num(persisted.monthlyHousingPayment);
  if (housePay !== undefined) p.monthlyHousingPayment = housePay;
  if (s("hasProperty")) p.hasProperty = s("hasProperty") === "אין" ? "no" : "yes";
  if (s("hasVehicleRaw")) p.hasVehicle = s("hasVehicleRaw") !== "לא";
  if (s("bankName")) p.bankName = s("bankName");
  if (s("bankBranch")) p.bankBranch = s("bankBranch");
  if (s("bankAccount")) p.bankAccount = s("bankAccount");
  const obligations = num(persisted.totalMonthlyPayment);
  if (obligations !== undefined) p.monthlyObligations = obligations;

  // רמזור — הגרוע מבין השניים משתקף לעמודה (לרשימות)
  const worst = (["red", "yellow", "green"] as const).find(
    (c) => persisted.smileyAuto === c || persisted.smileyManual === c,
  );
  if (worst) p.smiley = worst;

  return p;
}
