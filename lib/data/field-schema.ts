/**
 * BINGO CRM — Smart Field Schema
 *
 * 70+ fields organized into 8 semantic sections.
 * Each field has metadata: type, validation, relevance per stage, criticality.
 *
 * This is the SINGLE SOURCE OF TRUTH for what a lead is.
 */

import type { LifecycleStage } from "./lifecycle";

export type FieldKind =
  | "text" | "number" | "currency" | "phone" | "id" | "email" | "date"
  | "select" | "multi-select" | "boolean" | "tri-state" | "tags"
  | "textarea" | "rating" | "url" | "computed";

export type FieldRelevance = "critical" | "important" | "optional" | "hidden";

export interface FieldOption {
  value: string;
  label: string;
  emoji?: string;
  color?: string;
}

export interface FieldDef {
  /** Unique key in Lead type */
  key: string;
  /** Hebrew label */
  label: string;
  /** Field input kind */
  kind: FieldKind;
  /** Short helper text */
  hint?: string;
  /** Options for select/multi-select */
  options?: FieldOption[];
  /** Validation regex pattern */
  pattern?: string;
  /** Min/max for numbers */
  min?: number;
  max?: number;
  /** Per-stage relevance — when this field matters */
  relevance?: Partial<Record<LifecycleStage, FieldRelevance>>;
  /** Default relevance if not in map */
  defaultRelevance?: FieldRelevance;
  /** Auto-computed (read-only) */
  computed?: boolean;
  /** Sensitive — masked in lists */
  sensitive?: boolean;
}

export interface SectionDef {
  key: string;
  label: string;
  emoji: string;
  color: "blue" | "green" | "orange" | "purple" | "pink" | "yellow" | "red" | "cyan";
  description: string;
  fields: FieldDef[];
  /** XP awarded per completed field (for gamification) */
  xpPerField?: number;
}

// ────────────────────────────────────────────────────────────────
// SECTION 1: IDENTITY (זהות)
// ────────────────────────────────────────────────────────────────
const SECTION_IDENTITY: SectionDef = {
  key: "identity",
  label: "זהות",
  emoji: "👤",
  color: "blue",
  description: "פרטים אישיים ויצירת קשר",
  xpPerField: 5,
  fields: [
    { key: "fullName", label: "שם מלא", kind: "text", defaultRelevance: "critical", hint: "שם פרטי + משפחה" },
    { key: "firstName", label: "שם פרטי", kind: "text", defaultRelevance: "optional" },
    { key: "lastName", label: "שם משפחה", kind: "text", defaultRelevance: "optional" },
    { key: "idNumber", label: "תעודת זהות", kind: "id", pattern: "^\\d{9}$", defaultRelevance: "critical", sensitive: true, hint: "9 ספרות" },
    { key: "phone", label: "טלפון נייד", kind: "phone", pattern: "^05\\d{8}$", defaultRelevance: "critical" },
    { key: "email", label: "אימייל", kind: "email", defaultRelevance: "important" },
    { key: "birthDate", label: "תאריך לידה", kind: "date", defaultRelevance: "important" },
    {
      key: "gender", label: "מגדר", kind: "select", defaultRelevance: "optional",
      options: [
        { value: "male", label: "זכר", emoji: "👨" },
        { value: "female", label: "נקבה", emoji: "👩" },
      ]
    },
  ],
};

// ────────────────────────────────────────────────────────────────
// SECTION 2: REQUEST (בקשה)
// ────────────────────────────────────────────────────────────────
const SECTION_REQUEST: SectionDef = {
  key: "request",
  label: "בקשת הלוואה",
  emoji: "🎯",
  color: "green",
  description: "מה הלקוח מבקש וכמה",
  xpPerField: 10,
  fields: [
    { key: "amountRequested", label: "סכום מבוקש", kind: "currency", min: 1000, max: 5000000, defaultRelevance: "critical" },
    {
      key: "loanPurpose", label: "מטרת ההלוואה", kind: "select", defaultRelevance: "critical",
      options: [
        { value: "debt-cover", label: "סגירת חובות", emoji: "💳" },
        { value: "family-help", label: "עזרה למשפחה", emoji: "👨‍👩‍👧" },
        { value: "studies", label: "לימודים", emoji: "🎓" },
        { value: "vacation", label: "חופשה", emoji: "✈️" },
        { value: "event", label: "אירוע", emoji: "🎉" },
        { value: "business", label: "עסק", emoji: "💼" },
        { value: "renovation", label: "שיפוץ", emoji: "🔨" },
        { value: "housing", label: "דיור", emoji: "🏠" },
        { value: "vehicle", label: "רכב", emoji: "🚗" },
        { value: "health", label: "בריאות", emoji: "❤️" },
        { value: "other", label: "אחר", emoji: "📦" },
      ]
    },
    { key: "notesEligibility", label: "הערות לבדיקה", kind: "textarea", defaultRelevance: "optional" },
  ],
};

// ────────────────────────────────────────────────────────────────
// SECTION 3: INCOME (הכנסה ותעסוקה)
// ────────────────────────────────────────────────────────────────
const SECTION_INCOME: SectionDef = {
  key: "income",
  label: "הכנסה ותעסוקה",
  emoji: "💼",
  color: "purple",
  description: "מקור הכנסה ותלושים",
  xpPerField: 10,
  fields: [
    {
      key: "employmentStatus", label: "סטטוס תעסוקתי", kind: "select",
      relevance: { NEW: "important", CONTACT: "critical", SCREENING: "critical" },
      options: [
        { value: "employee", label: "שכיר", emoji: "💼" },
        { value: "self-employed", label: "עצמאי", emoji: "🧑‍💼" },
        { value: "stipend", label: "מקבל קצבה", emoji: "💰" },
        { value: "unemployed", label: "ללא עבודה", emoji: "🚫" },
        { value: "retired", label: "פנסיונר", emoji: "👴" },
      ]
    },
    { key: "employmentTenure", label: "וותק במקום (שנים)", kind: "number", min: 0, max: 50, defaultRelevance: "important" },
    { key: "monthlyIncome", label: "הכנסה חודשית נטו", kind: "currency", defaultRelevance: "critical" },
    { key: "spouseIncome", label: "הכנסת בן/בת זוג", kind: "currency", defaultRelevance: "optional" },
    { key: "additionalIncome", label: "הכנסה נוספת", kind: "currency", defaultRelevance: "optional" },
  ],
};

// ────────────────────────────────────────────────────────────────
// SECTION 4: HOUSEHOLD (משק בית)
// ────────────────────────────────────────────────────────────────
const SECTION_HOUSEHOLD: SectionDef = {
  key: "household",
  label: "משק בית",
  emoji: "👨‍👩‍👧",
  color: "pink",
  description: "מצב משפחתי וילדים",
  xpPerField: 5,
  fields: [
    {
      key: "familyStatus", label: "מצב משפחתי", kind: "select", defaultRelevance: "important",
      options: [
        { value: "single", label: "רווק/ה", emoji: "🧑" },
        { value: "married", label: "נשוי/אה", emoji: "💑" },
        { value: "divorced", label: "גרוש/ה", emoji: "💔" },
        { value: "widowed", label: "אלמן/ה", emoji: "🕊" },
        { value: "common-law", label: "ידוע/ה בציבור", emoji: "💞" },
      ]
    },
    { key: "childrenU18", label: "ילדים מתחת ל-18", kind: "number", min: 0, max: 15, defaultRelevance: "optional" },
  ],
};

// ────────────────────────────────────────────────────────────────
// SECTION 5: ASSETS (נכסים)
// ────────────────────────────────────────────────────────────────
const SECTION_ASSETS: SectionDef = {
  key: "assets",
  label: "נכסים",
  emoji: "🏠",
  color: "yellow",
  description: "דירה, רכב, נכסים נוספים",
  xpPerField: 10,
  fields: [
    {
      key: "hasProperty", label: "בעלות על נכס", kind: "select", defaultRelevance: "important",
      options: [
        { value: "yes", label: "כן - חופשי", emoji: "🏠" },
        { value: "yes-charged", label: "כן - משועבד", emoji: "🏚" },
        { value: "no", label: "אין", emoji: "🚫" },
      ]
    },
    { key: "hasVehicle", label: "בעלות על רכב", kind: "boolean", defaultRelevance: "important" },
    { key: "vehicleYear", label: "שנת ייצור רכב", kind: "number", min: 1990, max: 2027, defaultRelevance: "optional" },
    { key: "vehicleMake", label: "יצרן ודגם", kind: "text", defaultRelevance: "optional" },
  ],
};

// ────────────────────────────────────────────────────────────────
// SECTION 6: CREDIT (כרטיסי אשראי וגבולות)
// ────────────────────────────────────────────────────────────────
const SECTION_CREDIT: SectionDef = {
  key: "credit",
  label: "אשראי קיים",
  emoji: "💳",
  color: "orange",
  description: "כרטיסי אשראי, גבולות, ספקים",
  xpPerField: 8,
  fields: [
    {
      key: "creditCards", label: "כרטיסי אשראי", kind: "multi-select", defaultRelevance: "important",
      options: [
        { value: "isracard", label: "ישראכרט", emoji: "💳" },
        { value: "cal", label: "כאל", emoji: "💳" },
        { value: "max", label: "מקס", emoji: "💳" },
        { value: "direct", label: "דיירקט", emoji: "💳" },
        { value: "none", label: "ללא", emoji: "🚫" },
      ]
    },
    {
      key: "cardLimit", label: "מסגרת חיוב", kind: "select", defaultRelevance: "important",
      options: [
        { value: "above-5k", label: "מעל ₪5,000", emoji: "💚" },
        { value: "below-5k", label: "מתחת ל-₪5,000", emoji: "⚠️" },
      ]
    },
    { key: "preCheckedSources", label: "מקורות שכבר נבדקו", kind: "tags", defaultRelevance: "optional" },
  ],
};

// ────────────────────────────────────────────────────────────────
// SECTION 7: BANKING (חשבון בנק)
// ────────────────────────────────────────────────────────────────
const SECTION_BANKING: SectionDef = {
  key: "banking",
  label: "חשבון בנק",
  emoji: "🏦",
  color: "cyan",
  description: "בנק, סניף, מספר חשבון",
  xpPerField: 8,
  fields: [
    {
      key: "bankName", label: "שם הבנק", kind: "select",
      relevance: { CONTRACT: "critical", BDI: "critical", AUCTION: "important" },
      defaultRelevance: "important",
      options: [
        { value: "leumi", label: "בנק לאומי" },
        { value: "hapoalim", label: "בנק הפועלים" },
        { value: "mizrahi", label: "בנק מזרחי" },
        { value: "discount", label: "בנק דיסקונט" },
        { value: "jerusalem", label: "בנק ירושלים" },
        { value: "mercantile", label: "בנק מרכנתיל" },
        { value: "first-international", label: "הבינלאומי" },
        { value: "yahav", label: "בנק יהב" },
        { value: "pagi", label: "בנק פאגי" },
        { value: "esh-israel", label: "בנק אש ישראל" },
        { value: "other", label: "אחר" },
      ]
    },
    { key: "bankBranch", label: "מספר סניף", kind: "text", pattern: "^\\d{1,3}$", defaultRelevance: "important" },
    { key: "bankAccount", label: "מספר חשבון", kind: "text", defaultRelevance: "critical", sensitive: true },
  ],
};

// ────────────────────────────────────────────────────────────────
// SECTION 8: BACKGROUND (רקע אשראי - BDI)
// ────────────────────────────────────────────────────────────────
const SECTION_BACKGROUND: SectionDef = {
  key: "background",
  label: "רקע אשראי",
  emoji: "🛡️",
  color: "red",
  description: "BDI, הוצאה לפועל, היסטוריה",
  xpPerField: 12,
  fields: [
    {
      key: "hadEnforcement", label: "הוצאה לפועל", kind: "tri-state",
      relevance: { BDI: "critical", SCREENING: "critical" },
      defaultRelevance: "important",
      hint: "האם היה רישום בהוצאה לפועל?"
    },
    {
      key: "hadCreditIssues", label: "בעיות אשראי בעבר", kind: "tri-state",
      relevance: { BDI: "critical", SCREENING: "important" },
      defaultRelevance: "important"
    },
    {
      key: "accountRestricted", label: "חשבון מוגבל", kind: "tri-state",
      relevance: { BDI: "critical" },
      defaultRelevance: "important"
    },
    {
      key: "bdiCleanup", label: "ניקוי BDI", kind: "boolean",
      relevance: { BDI: "important" },
      defaultRelevance: "optional"
    },
    {
      key: "bdiApproved", label: "אישור BDI", kind: "boolean", computed: true,
      relevance: { BDI: "critical", AUCTION: "critical" }
    },
    {
      key: "smileyAuto", label: "ציון אוטומטי", kind: "rating", computed: true,
      defaultRelevance: "optional"
    },
    {
      key: "smileyManual", label: "ציון ידני (נציג)", kind: "rating",
      defaultRelevance: "optional"
    },
  ],
};

// ────────────────────────────────────────────────────────────────
// EXPORT ALL SECTIONS (in display order)
// ────────────────────────────────────────────────────────────────
export const FIELD_SECTIONS: SectionDef[] = [
  SECTION_IDENTITY,
  SECTION_REQUEST,
  SECTION_INCOME,
  SECTION_HOUSEHOLD,
  SECTION_ASSETS,
  SECTION_CREDIT,
  SECTION_BANKING,
  SECTION_BACKGROUND,
];

/** Total field count across all sections */
export const TOTAL_FIELDS = FIELD_SECTIONS.reduce((sum, s) => sum + s.fields.length, 0);

/** Get all fields flattened */
export const ALL_FIELDS: FieldDef[] = FIELD_SECTIONS.flatMap((s) => s.fields);

/** Lookup field by key */
export function getFieldDef(key: string): FieldDef | undefined {
  return ALL_FIELDS.find((f) => f.key === key);
}

/** Get section containing a field */
export function getFieldSection(fieldKey: string): SectionDef | undefined {
  return FIELD_SECTIONS.find((s) => s.fields.some((f) => f.key === fieldKey));
}

/** Compute relevance for a field at a given stage */
export function getFieldRelevance(field: FieldDef, stage: LifecycleStage): FieldRelevance {
  if (field.relevance?.[stage]) return field.relevance[stage]!;
  return field.defaultRelevance || "optional";
}

/** Section meta colors */
export const SECTION_COLORS: Record<SectionDef["color"], { bg: string; border: string; text: string; ring: string; progress: string }> = {
  blue:   { bg: "bg-status-blue/10", border: "border-status-blue/30", text: "text-status-blue", ring: "ring-status-blue/30", progress: "bg-status-blue" },
  green:  { bg: "bg-bingo-green/12", border: "border-bingo-green/40", text: "text-bingo-green-dark", ring: "ring-bingo-green/40", progress: "bg-bingo-green" },
  orange: { bg: "bg-status-orange/10", border: "border-status-orange/30", text: "text-orange-700", ring: "ring-status-orange/30", progress: "bg-status-orange" },
  purple: { bg: "bg-status-purple/10", border: "border-status-purple/30", text: "text-status-purple", ring: "ring-status-purple/30", progress: "bg-status-purple" },
  pink:   { bg: "bg-status-pink/10", border: "border-status-pink/30", text: "text-pink-700", ring: "ring-status-pink/30", progress: "bg-status-pink" },
  yellow: { bg: "bg-status-yellow/15", border: "border-status-yellow/40", text: "text-amber-700", ring: "ring-status-yellow/40", progress: "bg-status-yellow" },
  red:    { bg: "bg-status-red/10", border: "border-status-red/30", text: "text-status-red", ring: "ring-status-red/30", progress: "bg-status-red" },
  cyan:   { bg: "bg-cyan-500/10", border: "border-cyan-500/30", text: "text-cyan-700", ring: "ring-cyan-500/30", progress: "bg-cyan-500" },
};
