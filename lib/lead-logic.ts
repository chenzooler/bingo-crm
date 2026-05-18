import type { Lead, LenderCheck } from "./types";

export type StepKey =
  | "intake"
  | "credit-history"
  | "personal"
  | "household"
  | "income"
  | "assets"
  | "vehicle"
  | "bank"
  | "bdi"
  | "lenders"
  | "result"
  | "offer"
  | "forms";

export interface StepDef {
  key: StepKey;
  label: string;
  hint: string;
  required?: boolean;
  visibleWhen?: (l: Lead) => boolean;
}

export const STEPS: StepDef[] = [
  { key: "intake", label: "פתיחת שיחה", hint: "סכום ומטרה", required: true },
  { key: "credit-history", label: "בדיקת אשראי ראשונית", hint: "5 שאלות עם הלקוח", required: true },
  { key: "personal", label: "פרטים אישיים", hint: "תז, גיל, מין", required: true },
  { key: "household", label: "מצב משפחתי", hint: "סטטוס וילדים" },
  { key: "income", label: "תעסוקה והכנסות", hint: "מקור פרנסה ושכר", required: true },
  { key: "assets", label: "נכסים", hint: "דירה / משכנתא" },
  { key: "vehicle", label: "רכב", hint: "פרטי רכב לשעבוד", visibleWhen: (l) => l.primaryPipeline === "vehicle" || !!l.hasVehicle },
  { key: "bank", label: "פרטי בנק", hint: "בנק, סניף, עו\"ש", required: true },
  { key: "bdi", label: "אישור ובדיקת BDI", hint: "אישור הלקוח לבדיקה", required: true },
  { key: "lenders", label: "בדיקות מול גופים", hint: "מימון, ישראכרט, כאל ועוד" },
  { key: "result", label: "תוצאה ובחירה", hint: "סכום סופי וגוף נבחר" },
  { key: "offer", label: "הצעת מחיר", hint: "שכר טרחה והסכמה" },
  { key: "forms", label: "טפסים וחתימות", hint: "החתמת חוזה" },
];

/** Eligibility check evaluation - returns pass/fail + reasoning */
export function evaluateEligibility(l: Lead): { score: number; verdict: Verdict; reasons: string[] } {
  const reasons: string[] = [];
  let blockers = 0;
  let warnings = 0;

  if (l.hadEnforcement === true) {
    reasons.push("הוצאה לפועל ב-3 שנים האחרונות");
    blockers++;
  }
  if (l.hadCreditIssues === true) {
    reasons.push("חזרת צ'קים / הוראות קבע");
    warnings++;
  }
  if (l.accountRestricted === true) {
    reasons.push("חשבון מוגבל");
    blockers++;
  }
  if (l.bdiCleanup === true) {
    reasons.push("מחיקה / שיפוט BDI");
    warnings++;
  }
  if (l.creditCards?.includes("none")) {
    reasons.push("אין כרטיס אשראי");
    warnings++;
  }
  if (l.cardLimit === "below-5k") {
    reasons.push("מסגרת אשראי מתחת ל-5,000");
    warnings++;
  }

  // age check
  if (l.birthDate) {
    const age = new Date().getFullYear() - new Date(l.birthDate).getFullYear();
    if (age < 25) {
      reasons.push(`גיל ${age} - מתחת ל-25`);
      blockers++;
    }
  }

  // income check
  if (l.monthlyIncome !== undefined && l.monthlyIncome < 4000) {
    reasons.push(`הכנסה חודשית נמוכה (${l.monthlyIncome} ₪)`);
    warnings++;
  }

  let verdict: Verdict = "ok";
  if (blockers > 0) verdict = "blocker";
  else if (warnings >= 2) verdict = "warn";
  else if (warnings === 1) verdict = "caution";

  const score = Math.max(0, 100 - blockers * 50 - warnings * 15);
  return { score, verdict, reasons };
}

export type Verdict = "ok" | "caution" | "warn" | "blocker";

/** Step completion state */
export function evaluateStep(l: Lead, step: StepKey): "done" | "partial" | "empty" {
  switch (step) {
    case "intake":
      return l.amountRequested && l.loanPurpose ? "done" : (l.amountRequested || l.loanPurpose) ? "partial" : "empty";
    case "credit-history": {
      const fields = [l.hadEnforcement, l.hadCreditIssues, l.accountRestricted, l.bdiCleanup];
      const filled = fields.filter((v) => v !== undefined && v !== null).length;
      return filled === 4 ? "done" : filled > 0 ? "partial" : "empty";
    }
    case "personal":
      return l.idNumber && l.gender && l.birthDate ? "done" : (l.idNumber || l.gender || l.birthDate) ? "partial" : "empty";
    case "household":
      return l.familyStatus ? "done" : "empty";
    case "income":
      return l.employmentStatus && l.monthlyIncome ? "done" : (l.employmentStatus || l.monthlyIncome) ? "partial" : "empty";
    case "assets":
      return l.hasProperty ? "done" : "empty";
    case "vehicle":
      return l.hasVehicle && l.vehicleYear ? "done" : l.hasVehicle ? "partial" : "empty";
    case "bank":
      return l.bankName && l.bankBranch && l.bankAccount ? "done" : (l.bankName || l.bankBranch) ? "partial" : "empty";
    case "bdi":
      return l.bdiApproved ? "done" : "empty";
    case "lenders": {
      const checks = Object.values(l.lenderChecks || {});
      const decided = checks.filter((c) => c.result && c.result !== "not-checked").length;
      return decided >= 1 ? "done" : "empty";
    }
    case "result":
      return l.finalApprovedAmount ? "done" : "empty";
    case "offer":
      return l.feeAmount ? "done" : "empty";
    case "forms":
      return l.forms?.some((f) => f.status === "signed") ? "done" : "empty";
  }
}

/** Total approved across all lenders */
export function totalApproved(l: Lead): number {
  const checks = Object.values(l.lenderChecks || {});
  return checks.reduce((s, c) => s + (c.approvedAmount || 0), 0);
}

export function bestLender(l: Lead): { key: string; check: LenderCheck } | null {
  const entries = Object.entries(l.lenderChecks || {}) as [string, LenderCheck][];
  let best: { key: string; check: LenderCheck } | null = null;
  for (const [k, c] of entries) {
    if (!c.approvedAmount) continue;
    if (!best || (c.approvedAmount > (best.check.approvedAmount || 0))) best = { key: k, check: c };
  }
  return best;
}

/** Generate call script based on lead state */
export function generateCallScript(l: Lead, totals: { approved: number; best: { key: string; check: LenderCheck } | null }): string {
  const greet = `שלום ${l.firstName || l.fullName}, מדבר/ת מבינגו - מימון בול בשבילך.`;
  const eligibility = evaluateEligibility(l);
  if (eligibility.verdict === "blocker") {
    return [
      greet,
      "",
      `לפי הבדיקה שעשינו יחד, יש מספר נתונים שמונעים מאיתנו לקדם הלוואה כרגע:`,
      ...eligibility.reasons.map((r) => `  • ${r}`),
      "",
      "אנחנו לא יכולים לאשר הלוואה במצב הנוכחי, אבל אם הנתונים ישתנו - נשמח לחזור ולבדוק.",
    ].join("\n");
  }
  if (totals.approved > 0) {
    const monthly = totals.best?.check.monthlyPayment;
    return [
      greet,
      "",
      `יש לי בשבילך חדשות מצוינות 💚`,
      `הצלחנו לאשר עבורך הלוואה של ${totals.approved.toLocaleString("he-IL")} ₪.`,
      monthly ? `החזר חודשי: ${monthly.toLocaleString("he-IL")} ₪` : "",
      l.feeWithVat ? `שכר טרחת בינגו: ${l.feeWithVat.toLocaleString("he-IL")} ₪ (כולל מע״מ)` : "",
      "",
      "השלב הבא: נשלח אליך הסכם להחתמה ואז נסיים את התהליך תוך 24 שעות.",
      "אפשר להתקדם?",
    ].filter(Boolean).join("\n");
  }
  return [
    greet,
    "",
    `סיימתי לבדוק את הנתונים שלך מול הגופים.`,
    `בשלב זה יש כמה שאלות שצריך לחדד לפני שנקבל אישור.`,
    `אעבור איתך עליהן עכשיו.`,
  ].join("\n");
}
