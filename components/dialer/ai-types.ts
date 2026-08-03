/**
 * טיפוסי שכבת ה-AI כפי שהם מוגשים מ-/api/ai/* .
 * הקבצים ב-lib/ai ו-app/api/ai נבנים במקביל - הטיפוסים כאן הם החוזה מצד ה-UI
 * בלבד, וכל שדה אופציונלי כדי שהרכיבים ישרדו תשובה חלקית / API שעוד לא קיים.
 */

export type AiStatus = "pending" | "transcribing" | "analyzing" | "done" | "failed" | "skipped";

export interface ComplianceRuleDto {
  id: number;
  name: string;
  description?: string | null;
  kind: "required" | "forbidden";
  criterion: string;
  severity: "low" | "medium" | "high" | "critical";
  appliesTo: string;
  sortOrder: number;
}

export interface ComplianceResult {
  ruleId?: number;
  ruleName?: string;
  severity?: string;
  passed?: boolean;
  evidence?: string | null;
  explanation?: string | null;
}

export interface CoachingNote {
  title?: string;
  detail?: string;
  priority?: string;
}

export interface CallAnalysisDto {
  score?: number | null;
  summary?: string | null;
  sentiment?: string | null;
  outcomeGuess?: string | null;
  compliance?: ComplianceResult[] | null;
  objections?: { type?: string; quote?: string; response?: string }[] | null;
  extracted?: Record<string, unknown> | null;
  coaching?: CoachingNote[] | null;
  moments?: { label?: string; quote?: string }[] | null;
}

export interface CallAiDto {
  transcript?: { text?: string; segments?: unknown[] } | null;
  analysis?: CallAnalysisDto | null;
  aiStatus?: AiStatus | null;
  aiError?: string | null;
}

/** תוויות עבריות לשדות שהמנוע שולף מהשיחה */
export const EXTRACTED_LABELS: Record<string, string> = {
  amountRequested: "סכום מבוקש",
  monthlyIncome: "הכנסה חודשית",
  monthlyObligations: "החזר חודשי קיים",
  employment: "מצב תעסוקתי",
  employer: "מקום עבודה",
  hasVehicle: "רכב בבעלות",
  city: "עיר",
  address: "כתובת",
  email: "אימייל",
  idNumber: "תעודת זהות",
  birthDate: "תאריך לידה",
  maritalStatus: "מצב משפחתי",
  purpose: "מטרת ההלוואה",
  notes: "הערות",
};

/** רק שדות שאפשר לכתוב ישירות לעמודות ה-Lead דרך PATCH /api/leads/[id] */
export const PATCHABLE_FIELDS = new Set([
  "amountRequested",
  "monthlyIncome",
  "monthlyObligations",
  "city",
  "address",
  "email",
  "idNumber",
]);

export function labelForField(key: string): string {
  return EXTRACTED_LABELS[key] ?? key;
}

export function displayValue(v: unknown): string {
  if (v == null || v === "") return "-";
  if (typeof v === "boolean") return v ? "כן" : "לא";
  if (typeof v === "number") return new Intl.NumberFormat("he-IL").format(v);
  return String(v);
}
