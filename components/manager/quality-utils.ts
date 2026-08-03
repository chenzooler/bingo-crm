// עזרי מסכי האיכות — פירוק בטוח של שדות ה-JSON של מנוע ה-AI + מיפויי תצוגה.
// הכל מוגן: אם המנוע עוד לא כתב כלום, כל פונקציה מחזירה ערך ריק שקט.

export interface TranscriptSegment {
  start: number;
  end: number;
  speaker: "agent" | "customer" | string;
  text: string;
}

export interface ComplianceResult {
  ruleId?: number;
  ruleName?: string;
  severity?: string;
  passed?: boolean;
  evidence?: string;
  explanation?: string;
}

export interface Objection {
  type?: string;
  quote?: string;
  response?: string;
}

export interface CoachingNote {
  title?: string;
  detail?: string;
  priority?: string | number;
}

export interface KeyMoment {
  label?: string;
  quote?: string;
  /** חלק מהמנועים מחזירים גם חותמת זמן — נשתמש בה אם קיימת */
  start?: number;
}

/** פירוק מחרוזת JSON למערך — אף פעם לא זורק */
export function parseArray<T>(raw: string | null | undefined): T[] {
  if (!raw) return [];
  try {
    const v = JSON.parse(raw);
    return Array.isArray(v) ? (v as T[]) : [];
  } catch {
    return [];
  }
}

/** פירוק מחרוזת JSON לאובייקט שטוח (הנתונים שנשלפו לכרטיס) */
export function parseObject(raw: string | null | undefined): Record<string, unknown> {
  if (!raw) return {};
  try {
    const v = JSON.parse(raw);
    return v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

/** mm:ss עם ספרות טבלאיות */
export function formatDuration(sec: number | null | undefined): string {
  const s = Math.max(0, Math.floor(sec ?? 0));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${String(r).padStart(2, "0")}`;
}

export type ScoreBand = "high" | "mid" | "low" | "none";

export function scoreBand(score: number | null | undefined): ScoreBand {
  if (score === null || score === undefined) return "none";
  if (score >= 85) return "high";
  if (score >= 70) return "mid";
  return "low";
}

/** רקע הטינט לפי רמת הציון */
export const SCORE_TINT: Record<ScoreBand, string> = {
  high: "b-tint-mint",
  mid: "b-tint-sand",
  low: "b-tint-rose",
  none: "b-tint-sky",
};

export const SCORE_CHIP: Record<ScoreBand, string> = {
  high: "b-chip-green",
  mid: "b-chip-orange",
  low: "b-chip-red",
  none: "b-chip-gray",
};

export const SCORE_BAR: Record<ScoreBand, string> = {
  high: "var(--color-bingo-green)",
  mid: "var(--color-status-orange)",
  low: "var(--color-status-red)",
  none: "var(--color-bingo-gray-300)",
};

export const SEVERITY_LABEL: Record<string, string> = {
  low: "נמוכה",
  medium: "בינונית",
  high: "גבוהה",
  critical: "קריטית",
};

export const SEVERITY_CHIP: Record<string, string> = {
  low: "b-chip-gray",
  medium: "b-chip-blue",
  high: "b-chip-orange",
  critical: "b-chip-red",
};

export const SEVERITY_DOT: Record<string, string> = {
  low: "bg-bingo-gray-300",
  medium: "bg-status-blue",
  high: "bg-status-orange",
  critical: "bg-status-red",
};

export const AI_STATUS_LABEL: Record<string, string> = {
  pending: "ממתין לניתוח",
  transcribing: "מתמלל את השיחה",
  analyzing: "מנתח את השיחה",
  done: "נותח",
  failed: "הניתוח נכשל",
  skipped: "דולג",
};

export const AI_STATUS_CHIP: Record<string, string> = {
  pending: "b-chip-gray",
  transcribing: "b-chip-blue",
  analyzing: "b-chip-blue",
  done: "b-chip-green",
  failed: "b-chip-red",
  skipped: "b-chip-gray",
};

export const DISPOSITION_LABEL: Record<string, string> = {
  "no-answer": "אין מענה",
  callback: "לחזור ללקוח",
  advanced: "התקדם בתהליך",
  "not-interested": "לא מעוניין",
};

export const SENTIMENT_LABEL: Record<string, string> = {
  positive: "חיובי",
  neutral: "ניטרלי",
  negative: "שלילי",
};

export const SENTIMENT_CHIP: Record<string, string> = {
  positive: "b-chip-green",
  neutral: "b-chip-gray",
  negative: "b-chip-red",
};

export const ALERT_TYPE_LABEL: Record<string, string> = {
  compliance: "בקרה",
  quality: "איכות",
  opportunity: "הזדמנות",
  risk: "סיכון",
};

export const RULE_KIND_LABEL: Record<string, string> = {
  required: "חייב להיאמר",
  forbidden: "אסור להיאמר",
};

export const APPLIES_TO_LABEL: Record<string, string> = {
  all: "כל השיחות",
  "first-call": "שיחה ראשונה",
  ramzor: "שיחת רמזור",
  closing: "שיחת סגירה",
};

/** תוויות עבריות לשדות שהמנוע שולף — מה שלא מוכר מוצג כמו שהוא */
export const EXTRACTED_LABEL: Record<string, string> = {
  amountRequested: "סכום מבוקש",
  monthlyIncome: "הכנסה חודשית",
  employment: "תעסוקה",
  hasVehicle: "יש רכב",
  maritalStatus: "מצב משפחתי",
  loanPurpose: "מטרת ההלוואה",
  age: "גיל",
  city: "עיר",
  hasCreditCard: "כרטיס אשראי",
  creditLimit: "מסגרת אשראי",
  existingLoans: "הלוואות קיימות",
};

/** ערך מ-extractedJson להצגה — בלי [object Object] */
export function displayValue(v: unknown): string {
  if (v === null || v === undefined || v === "") return "-";
  if (typeof v === "boolean") return v ? "כן" : "לא";
  if (typeof v === "number") return v.toLocaleString("he-IL");
  if (typeof v === "string") return v;
  try {
    return JSON.stringify(v);
  } catch {
    return "-";
  }
}

/** ניקוי טקסט להשוואה רופפת בין ציטוט לסגמנט */
function normalize(s: string): string {
  return s.replace(/["'׳״.,!?\-–]/g, " ").replace(/\s+/g, " ").trim();
}

/**
 * מאתר את חותמת הזמן של ציטוט בתוך התמלול — כדי שלחיצה על ראיה או על
 * "רגע מפתח" תקפיץ את ההקלטה. מחזיר null כשאין התאמה סבירה.
 */
export function findQuoteStart(
  quote: string | null | undefined,
  segments: TranscriptSegment[],
): number | null {
  if (!quote || segments.length === 0) return null;
  const q = normalize(quote);
  if (q.length < 3) return null;

  for (const seg of segments) {
    if (normalize(seg.text).includes(q)) return seg.start;
  }
  // התאמה חלקית: החצי הראשון של הציטוט
  const half = q.slice(0, Math.max(8, Math.floor(q.length / 2)));
  for (const seg of segments) {
    if (normalize(seg.text).includes(half)) return seg.start;
  }
  // התאמה הפוכה: הסגמנט קצר והציטוט מכיל אותו
  for (const seg of segments) {
    const t = normalize(seg.text);
    if (t.length >= 8 && q.includes(t)) return seg.start;
  }
  return null;
}

/** מיון הערות אימון: גבוהה קודם */
const PRIORITY_RANK: Record<string, number> = { high: 0, גבוהה: 0, medium: 1, בינונית: 1, low: 2, נמוכה: 2 };

export function coachingSort(a: CoachingNote, b: CoachingNote): number {
  const rank = (p: CoachingNote["priority"]) => {
    if (typeof p === "number") return p;
    if (typeof p === "string") return PRIORITY_RANK[p.toLowerCase()] ?? 1;
    return 1;
  };
  return rank(a.priority) - rank(b.priority);
}

export const PRIORITY_LABEL: Record<string, string> = {
  high: "עדיפות גבוהה",
  medium: "עדיפות בינונית",
  low: "עדיפות נמוכה",
};

export function priorityLabel(p: CoachingNote["priority"]): string {
  if (typeof p === "string") return PRIORITY_LABEL[p.toLowerCase()] ?? p;
  if (typeof p === "number") return p <= 0 ? "עדיפות גבוהה" : p === 1 ? "עדיפות בינונית" : "עדיפות נמוכה";
  return "עדיפות בינונית";
}
