/**
 * Unified Lifecycle Taxonomy
 * One source of truth for lead progression - replaces 9 mixed pipelines with
 * 10 clear stages + 5 categories + flexible tags.
 */

import type { StatusGlyph as IconKind } from "@/components/icons/PipelineIcons";

export type LifecycleStage =
  | "NEW"            // ליד חדש
  | "CONTACT"        // שיחה ראשונה
  | "SCREENING"      // סינון ובדיקת נתונים
  | "CONTRACT"       // החתמת הסכם התקשרות
  | "BDI"            // בדיקת אשראי BDI
  | "AUCTION"        // מכרז מול גופי מימון
  | "DECISION"       // הלקוח בוחר הצעה
  | "DOCS"           // השלמת מסמכים והחתמת חוזה
  | "DISBURSEMENT"   // שחרור הלוואה
  | "PAID"           // תשלום שכ"ט הושלם
  | "EXIT";          // יצא מהמערכת

export type ExitReason =
  | "WON"
  | "NOT_INTERESTED"
  | "NO_ANSWER"
  | "REJECTED"
  | "BDI_NEGATIVE"
  | "UNDER_AGE"
  | "NO_CITIZENSHIP"
  | "SPAM"
  | "LEGAL"
  | "DUPLICATE"
  | "OTHER";

export type LeadCategory = "general" | "vehicle" | "property" | "consolidation" | "mortgage";

export interface StageDef {
  key: LifecycleStage;
  label: string;
  description: string;
  emoji: string;
  glyph: IconKind;
  color: "blue" | "yellow" | "orange" | "green" | "purple" | "pink" | "gray";
  position: number;       // ordering 1-10
  slaHours: number;       // expected duration
  isTerminal: boolean;
}

export const STAGES: StageDef[] = [
  { key: "NEW", label: "ליד חדש", description: "נכנס למערכת זה עתה - מחכה לטיפול ראשון", emoji: "🆕", glyph: "new", color: "blue", position: 1, slaHours: 2, isTerminal: false },
  { key: "CONTACT", label: "שיחה ראשונה", description: "שיחה ראשונית עם הלקוח - הסבר ומיון", emoji: "📞", glyph: "call", color: "blue", position: 2, slaHours: 24, isTerminal: false },
  { key: "SCREENING", label: "סינון", description: "בדיקת זכאות ראשונית, מילוי נתונים", emoji: "🔍", glyph: "checking", color: "yellow", position: 3, slaHours: 48, isTerminal: false },
  { key: "CONTRACT", label: "הסכם התקשרות", description: "החתמת הסכם התקשרות עם בינגו", emoji: "📝", glyph: "sign", color: "purple", position: 4, slaHours: 72, isTerminal: false },
  { key: "BDI", label: "בדיקת BDI", description: "בדיקת אשראי BDI - דירוג, היסטוריה", emoji: "🛡️", glyph: "checking", color: "blue", position: 5, slaHours: 24, isTerminal: false },
  { key: "AUCTION", label: "מכרז גופי מימון", description: "בדיקה מול 12 גופי המימון במקביל", emoji: "🏛️", glyph: "checking", color: "orange", position: 6, slaHours: 96, isTerminal: false },
  { key: "DECISION", label: "בחירת הצעה", description: "הלקוח בוחר את ההצעה הטובה ביותר", emoji: "✅", glyph: "approved", color: "yellow", position: 7, slaHours: 48, isTerminal: false },
  { key: "DOCS", label: "מסמכים וחוזה", description: "השלמת מסמכים, חתימת חוזה סופי", emoji: "📄", glyph: "docs", color: "purple", position: 8, slaHours: 72, isTerminal: false },
  { key: "DISBURSEMENT", label: "שחרור הלוואה", description: "הגוף מעביר את הכסף ללקוח", emoji: "💰", glyph: "paid", color: "green", position: 9, slaHours: 48, isTerminal: false },
  { key: "PAID", label: "שולם", description: "הלקוח שילם שכ\"ט - תהליך הסתיים בהצלחה", emoji: "💵", glyph: "paid", color: "green", position: 10, slaHours: 0, isTerminal: true },
  { key: "EXIT", label: "יצא מהמערכת", description: "סגור עם סיבה", emoji: "🚪", glyph: "blocked", color: "gray", position: 11, slaHours: 0, isTerminal: true },
];

export const EXIT_REASONS: { key: ExitReason; label: string; color: "green" | "red" | "yellow" | "gray" }[] = [
  { key: "WON", label: "✓ סגירה מוצלחת", color: "green" },
  { key: "NOT_INTERESTED", label: "לא מעוניין", color: "yellow" },
  { key: "NO_ANSWER", label: "חוסר מענה", color: "yellow" },
  { key: "REJECTED", label: "סורב בכל הגופים", color: "red" },
  { key: "BDI_NEGATIVE", label: "BDI שלילי", color: "red" },
  { key: "UNDER_AGE", label: "גיל נמוך", color: "gray" },
  { key: "NO_CITIZENSHIP", label: "אין אזרחות", color: "gray" },
  { key: "SPAM", label: "ספאם / מספר לא תקין", color: "gray" },
  { key: "LEGAL", label: "טיפול משפטי", color: "red" },
  { key: "DUPLICATE", label: "כפיל", color: "gray" },
  { key: "OTHER", label: "אחר", color: "gray" },
];

export const CATEGORIES: { key: LeadCategory; label: string; description: string; emoji: string }[] = [
  { key: "general", label: "הלוואה לכל מטרה", description: "הלוואה אישית ללא ביטחונות", emoji: "💸" },
  { key: "vehicle", label: "הלוואה כנגד רכב", description: "שעבוד רכב לטובת הלוואה", emoji: "🚗" },
  { key: "property", label: "הלוואה כנגד נכס", description: "שעבוד דירה / נכס", emoji: "🏠" },
  { key: "consolidation", label: "איחוד הלוואות", description: "מיזוג הלוואות קיימות לאחת", emoji: "🔄" },
  { key: "mortgage", label: "משכנתא", description: "משכנתא חדשה או מיחזור", emoji: "🏦" },
];

/* Common tags */
export const COMMON_TAGS = [
  { key: "hot", label: "חם", color: "red" },
  { key: "urgent", label: "דחוף", color: "red" },
  { key: "high-value", label: "סכום גבוה", color: "green" },
  { key: "no-answer-3", label: "אין מענה 3+", color: "orange" },
  { key: "shimor-yoni", label: "שימורים יוני", color: "purple" },
  { key: "shimor-pargen", label: "שימורים פרגן", color: "purple" },
  { key: "vip", label: "VIP", color: "yellow" },
  { key: "callback-today", label: "לחזור היום", color: "blue" },
  { key: "first-time", label: "פעם ראשונה", color: "blue" },
  { key: "returning", label: "לקוח חוזר", color: "green" },
] as const;

/* Smart Views - saved filters that appear in sidebar */
export interface SmartView {
  key: string;
  label: string;
  icon: IconKind;
  count: number;
  description: string;
  filter: (l: { stage?: LifecycleStage; ownerId?: number; tags?: string[]; dueAt?: string }) => boolean;
}

export const SMART_VIEWS: SmartView[] = [
  { key: "my-hot", label: "החמים שלי", icon: "hot", count: 12, description: "לידים שלך, חמים, עכשיו", filter: () => true },
  { key: "my-today", label: "לטיפול היום", icon: "call", count: 24, description: "לידים שלך עם משימה היום", filter: () => true },
  { key: "my-overdue", label: "באיחור", icon: "no-answer", count: 5, description: "מעבר ל-SLA", filter: () => true },
  { key: "closing-this-week", label: "סגירות השבוע", icon: "approved", count: 8, description: "DECISION בשלב סיום", filter: () => true },
  { key: "callbacks", label: "פולואפים", icon: "callback", count: 31, description: "ממתינים לפולואפ", filter: () => true },
  { key: "lender-pending", label: "ממתינים לגופים", icon: "waiting", count: 18, description: "מכרז בעיצומו", filter: () => true },
];

/* Helpers */
export function getStage(key: LifecycleStage): StageDef | undefined {
  return STAGES.find((s) => s.key === key);
}

export function getNextStage(key: LifecycleStage): StageDef | undefined {
  const cur = getStage(key);
  if (!cur || cur.isTerminal) return undefined;
  return STAGES.find((s) => s.position === cur.position + 1);
}

export function getCategoryDef(key: LeadCategory) {
  return CATEGORIES.find((c) => c.key === key);
}
