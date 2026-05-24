/**
 * BINGO CRM — Status Metadata Engine
 *
 * Enriches EVERY status (all 62+ from legacy Yoatzim) with:
 *  • emoji + visual identity
 *  • sentiment (positive/negative/neutral/pending/warning)
 *  • recommended next action
 *  • urgency level
 *  • SLA in hours
 *  • textColor + bgColor
 *  • description
 *
 * No status is lost — every one becomes a first-class citizen with full context.
 */

import { STATUSES } from "./static";
import type { StatusDef } from "../types";
import { mapStatusToLifecycle } from "./status-mapper";
import type { LifecycleStage } from "./lifecycle";

export type Sentiment = "positive" | "negative" | "neutral" | "pending" | "warning" | "celebrate";
export type Urgency = "now" | "today" | "this-week" | "monitor" | "none";

export interface StatusMeta {
  /** Status key (matches StatusDef.key) */
  key: string;
  /** Status definition from static.ts */
  def: StatusDef;
  /** Stage in unified lifecycle */
  stage: LifecycleStage;
  /** Emoji icon */
  emoji: string;
  /** Sentiment for color/grouping */
  sentiment: Sentiment;
  /** Urgency for action */
  urgency: Urgency;
  /** Short description (Hebrew) */
  description: string;
  /** Recommended next action for agent (Hebrew) */
  nextAction: string;
  /** SLA in hours (if applicable) */
  slaHours?: number;
  /** Is this a terminal status (lead exits here)? */
  isTerminal: boolean;
}

const SENTIMENT_META: Record<Sentiment, { label: string; bg: string; border: string; text: string; chip: string; dot: string }> = {
  positive: {
    label: "חיובי",
    bg: "bg-bingo-green/8",
    border: "border-bingo-green/40",
    text: "text-bingo-green-dark",
    chip: "bg-bingo-green/15 text-bingo-green-dark border-bingo-green/40",
    dot: "bg-bingo-green",
  },
  negative: {
    label: "שלילי",
    bg: "bg-status-red/8",
    border: "border-status-red/40",
    text: "text-status-red",
    chip: "bg-status-red/10 text-status-red border-status-red/30",
    dot: "bg-status-red",
  },
  pending: {
    label: "ממתין",
    bg: "bg-status-blue/8",
    border: "border-status-blue/30",
    text: "text-status-blue",
    chip: "bg-status-blue/12 text-status-blue border-status-blue/30",
    dot: "bg-status-blue",
  },
  warning: {
    label: "אזהרה",
    bg: "bg-status-orange/8",
    border: "border-status-orange/40",
    text: "text-orange-700",
    chip: "bg-status-orange/12 text-orange-700 border-status-orange/30",
    dot: "bg-status-orange",
  },
  celebrate: {
    label: "ניצחון",
    bg: "bg-bingo-green/20",
    border: "border-bingo-green/60",
    text: "text-bingo-green-dark",
    chip: "bg-bingo-green text-bingo-black border-bingo-green",
    dot: "bg-bingo-green",
  },
  neutral: {
    label: "ניטרלי",
    bg: "bg-bingo-gray-100",
    border: "border-bingo-gray-200",
    text: "text-bingo-charcoal",
    chip: "bg-bingo-gray-100 text-bingo-charcoal border-bingo-gray-200",
    dot: "bg-bingo-gray-400",
  },
};

const URGENCY_META: Record<Urgency, { label: string; color: string }> = {
  now: { label: "עכשיו!", color: "bg-status-red text-white" },
  today: { label: "היום", color: "bg-status-orange text-white" },
  "this-week": { label: "השבוע", color: "bg-status-blue text-white" },
  monitor: { label: "מעקב", color: "bg-bingo-gray-300 text-bingo-charcoal" },
  none: { label: "—", color: "bg-bingo-gray-100 text-bingo-gray-500" },
};

export function getSentimentMeta(s: Sentiment) { return SENTIMENT_META[s]; }
export function getUrgencyMeta(u: Urgency) { return URGENCY_META[u]; }

/**
 * Static enrichment data for each known status.
 * Keys match status keys from static.ts STATUSES array.
 */
const STATUS_ENRICHMENTS: Record<string, {
  emoji: string;
  sentiment: Sentiment;
  urgency: Urgency;
  description: string;
  nextAction: string;
  slaHours?: number;
  isTerminal?: boolean;
}> = {
  // UNDERWRITING
  "u-collide":           { emoji: "💥", sentiment: "warning",  urgency: "today",      description: "כפילות עם ליד קיים — נדרשת בדיקה", nextAction: "אחד את הלידים או סמן כעיקרי", slaHours: 24 },
  "u-new":               { emoji: "🆕", sentiment: "pending",  urgency: "now",        description: "ליד חדש שעבר חיתום ראשוני", nextAction: "חייג תוך 2 שעות לקבלת פרטים", slaHours: 2 },
  "u-callback":          { emoji: "📞", sentiment: "pending",  urgency: "today",      description: "הלקוח ביקש שיחזרו אליו", nextAction: "חייג בזמן שהוזכר", slaHours: 24 },
  "u-eligibility-loan":  { emoji: "🔍", sentiment: "pending",  urgency: "this-week",  description: "בדיקת זכאות להלוואה לכל מטרה", nextAction: "השלם בדיקות BDI ומלווים", slaHours: 48 },
  "u-eligibility-car":   { emoji: "🚗", sentiment: "pending",  urgency: "this-week",  description: "בדיקת זכאות להלוואה כנגד רכב", nextAction: "בדוק שיעבוד וזכאות מימון", slaHours: 48 },
  "u-no-answer":         { emoji: "📵", sentiment: "warning",  urgency: "today",      description: "אין מענה מהלקוח", nextAction: "נסה שוב או שלח WhatsApp", slaHours: 24 },

  // IRRELEVANT (all terminal)
  "i-no-details":        { emoji: "📝", sentiment: "negative", urgency: "none", description: "הלקוח לא השאיר פרטים מלאים", nextAction: "ארכב או נסה לחדש קשר", isTerminal: true },
  "i-not-relevant":      { emoji: "🚫", sentiment: "neutral",  urgency: "none", description: "לא רלוונטי / הסתדר לבד", nextAction: "ארכב", isTerminal: true },
  "i-uncooperative":     { emoji: "😤", sentiment: "negative", urgency: "none", description: "הלקוח לא משתף פעולה", nextAction: "ארכב או העבר למנהל", isTerminal: true },
  "i-no-after-explain":  { emoji: "👋", sentiment: "neutral",  urgency: "none", description: "לא מעוניין לאחר הסבר", nextAction: "ארכב", isTerminal: true },
  "i-no-contract":       { emoji: "📄", sentiment: "negative", urgency: "none", description: "סירב לחתום על הסכם", nextAction: "ארכב או שימור", isTerminal: true },
  "i-too-good":          { emoji: "💎", sentiment: "neutral",  urgency: "none", description: "פרופיל טוב מדי — לא צריך אותנו", nextAction: "ארכב", isTerminal: true },
  "i-young":             { emoji: "🧒", sentiment: "negative", urgency: "none", description: "גיל נמוך — מתחת ל-25", nextAction: "ארכב — לא מתאים גילית", isTerminal: true },
  "i-no-citizenship":    { emoji: "🌐", sentiment: "negative", urgency: "none", description: "עולה חדש / אין אזרחות", nextAction: "ארכב", isTerminal: true },
  "i-other-person":      { emoji: "👥", sentiment: "neutral",  urgency: "none", description: "השאיר פרטים עבור אחר", nextAction: "ארכב או צור קשר עם הזכאי", isTerminal: true },
  "i-mortgage-interest": { emoji: "🏠", sentiment: "neutral",  urgency: "none", description: "מעוניין במשכנתא — לא הלוואה", nextAction: "הפנה לצוות משכנתא", isTerminal: true },
  "i-rejected-all":      { emoji: "❌", sentiment: "negative", urgency: "none", description: "סורב בכל הגופים", nextAction: "ארכב — נסה שוב בעוד 6 חודשים", isTerminal: true },
  "i-bdi-bad":           { emoji: "🛑", sentiment: "negative", urgency: "none", description: "BDI שלילי קריטי", nextAction: "ארכב — לא מתאים לאישראי", isTerminal: true },

  // GENERAL LOAN
  "g-ready":             { emoji: "✨", sentiment: "positive", urgency: "today",       description: "מוכן לבדיקה מלאה", nextAction: "הרץ בדיקות BDI + מלווים", slaHours: 48 },
  "g-no-answer":         { emoji: "📵", sentiment: "warning",  urgency: "today",       description: "אין מענה", nextAction: "WhatsApp + חיוג נוסף", slaHours: 24 },
  "g-callback":          { emoji: "📞", sentiment: "pending",  urgency: "today",       description: "ביקש שיחזרו", nextAction: "חייג בזמן המבוקש", slaHours: 24 },
  "g-not-interested-check": { emoji: "🛑", sentiment: "negative", urgency: "none",     description: "לא מעוניין לבצע בדיקות", nextAction: "ארכב או שימור עתידי", isTerminal: true },
  "g-whatsapp-retention":   { emoji: "💬", sentiment: "pending",  urgency: "this-week", description: "שימור דרך WhatsApp", nextAction: "שלח טמפלייט שימור" },
  "g-approved-final":    { emoji: "✅", sentiment: "celebrate", urgency: "now",        description: "הלוואה מאושרת — מחכה לאישור סופי", nextAction: "חייג לסגירה!", slaHours: 4 },
  "g-final-id":          { emoji: "🪪", sentiment: "pending",  urgency: "today",       description: "אישור סופי — השלמת זיהוי", nextAction: "תזכר ללקוח להעלות תעודה", slaHours: 24 },
  "g-final-courier":     { emoji: "📦", sentiment: "pending",  urgency: "today",       description: "ממתין לשליח", nextAction: "תאם עם שליח", slaHours: 48 },
  "g-pension-docs":      { emoji: "📑", sentiment: "pending",  urgency: "this-week",   description: "ממתין למסמכים מקרן פנסיה", nextAction: "תזכר לקוח לפנות לקרן" },
  "g-jbank-principal":   { emoji: "🏦", sentiment: "positive", urgency: "today",       description: "אישור עקרוני בבנק ירושלים", nextAction: "המשך לשיוך סניף", slaHours: 24 },
  "g-jbank-branch":      { emoji: "🏢", sentiment: "pending",  urgency: "this-week",   description: "משויך לסניף בבנק ירושלים", nextAction: "פולואפ עם מנהל סניף" },
  "g-jbank-account":     { emoji: "🏛️", sentiment: "pending",  urgency: "this-week",   description: "ממתין לעו\"ש בבנק ירושלים", nextAction: "בדוק סטטוס חשבון" },
  "g-jbank-final":       { emoji: "🎯", sentiment: "positive", urgency: "today",       description: "ממתין לאישור סופי - בנק ירושלים", nextAction: "פולואפ עם הסניף" },
  "g-no-final":          { emoji: "😞", sentiment: "negative", urgency: "none",        description: "לא מעוניין באישור הסופי", nextAction: "ארכב או שימור", isTerminal: true },
  "g-pension-loan":      { emoji: "💰", sentiment: "positive", urgency: "this-week",   description: "ממתין להלוואה מקרן פנסיה", nextAction: "פולואפ עם הקרן" },
  "g-waiting-loan":      { emoji: "⏳", sentiment: "pending",  urgency: "today",       description: "ממתין להלוואה לאחר אישור", nextAction: "ודא שהמלווה משחרר כסף", slaHours: 48 },
  "g-got-loan":          { emoji: "🎉", sentiment: "celebrate", urgency: "today",      description: "קיבל הלוואה", nextAction: "שלח חשבונית עמלה!", slaHours: 24 },
  "g-paid":              { emoji: "💵", sentiment: "celebrate", urgency: "none",       description: "שילם — תהליך הסתיים בהצלחה!", nextAction: "אין — סגור 🎊", isTerminal: true },
  "g-rejected":          { emoji: "❌", sentiment: "negative", urgency: "none",        description: "סורב", nextAction: "ארכב או נסה גוף אחר", isTerminal: true },
  "g-bdi-bad":           { emoji: "🛑", sentiment: "negative", urgency: "none",        description: "BDI שלילי", nextAction: "ארכב", isTerminal: true },
  "g-id-invalid":        { emoji: "🆔", sentiment: "negative", urgency: "none",        description: "ת\"ז לא בתוקף", nextAction: "ארכב", isTerminal: true },

  // VEHICLE
  "v-other-process":     { emoji: "🔄", sentiment: "pending",  urgency: "this-week",   description: "בתהליך אחר - שיעבוד חדש", nextAction: "ממתין להשלמת בדיקות" },
  "v-direct-other":      { emoji: "🔍", sentiment: "pending",  urgency: "this-week",   description: "בדיקת הגדלה במימון ישיר", nextAction: "ממתין לתשובה ממימון ישיר" },
  "v-fama-other":        { emoji: "🔍", sentiment: "pending",  urgency: "this-week",   description: "בדיקת הגדלה בפמה", nextAction: "ממתין לתשובה מפמה" },
  "v-new-encumbrance":   { emoji: "🆕", sentiment: "positive", urgency: "today",       description: "ליד חדש לשיעבוד חדש", nextAction: "התחל תהליך שיעבוד", slaHours: 24 },
  "v-direct-new-add":    { emoji: "💰", sentiment: "positive", urgency: "today",       description: "מימון ישיר אישר תוספת הגדלה", nextAction: "סגור במהירות!", slaHours: 24 },
  "v-fama-new-add":      { emoji: "💰", sentiment: "positive", urgency: "today",       description: "פמה אישרה תוספת הגדלה", nextAction: "סגור במהירות!", slaHours: 24 },
  "v-no-answer":         { emoji: "📵", sentiment: "warning",  urgency: "today",       description: "אין מענה", nextAction: "נסה שוב + WhatsApp", slaHours: 24 },
  "v-callback":          { emoji: "📞", sentiment: "pending",  urgency: "today",       description: "ביקש שיחזרו", nextAction: "חייג בזמן המבוקש", slaHours: 24 },
  "v-waiting-docs":      { emoji: "📑", sentiment: "pending",  urgency: "today",       description: "ממתין למסמכים", nextAction: "תזכר לקוח להעלות מסמכים", slaHours: 48 },
  "v-waiting-final":     { emoji: "⏳", sentiment: "pending",  urgency: "today",       description: "ממתין לאישור סופי", nextAction: "פולואפ עם המלווה", slaHours: 48 },
  "v-sign-contract":     { emoji: "✍️", sentiment: "positive", urgency: "now",         description: "אישור סופי — להחתים חוזה", nextAction: "סגור חתימה היום!", slaHours: 24 },
  "v-test-missing":      { emoji: "🧪", sentiment: "warning",  urgency: "today",       description: "חסר טסט — תיק מסובך", nextAction: "ודא טסט עם הלקוח", slaHours: 48 },
  "v-final-win":         { emoji: "🏆", sentiment: "positive", urgency: "today",       description: "ממתין לזכייה / ביטוח", nextAction: "פולואפ זכייה", slaHours: 48 },
  "v-waiting-loan":      { emoji: "⏳", sentiment: "pending",  urgency: "today",       description: "ממתין להלוואה", nextAction: "ודא העברה", slaHours: 48 },
  "v-got-loan":          { emoji: "🎉", sentiment: "celebrate", urgency: "today",      description: "קיבל הלוואה!", nextAction: "שלח חשבונית עמלה", slaHours: 24 },
  "v-paid":              { emoji: "💵", sentiment: "celebrate", urgency: "none",       description: "שילם — תהליך הסתיים בהצלחה!", nextAction: "אין — סגור 🎊", isTerminal: true },
  "v-not-relevant-after-docs": { emoji: "📂", sentiment: "negative", urgency: "none",  description: "לא רלוונטי לאחר מסמכים", nextAction: "ארכב", isTerminal: true },
  "v-no-room-direct":    { emoji: "🚫", sentiment: "negative", urgency: "none",        description: "אין מקום לתוספת במימון ישיר", nextAction: "נסה גוף אחר או ארכב", isTerminal: true },
  "v-no-room-fama":      { emoji: "🚫", sentiment: "negative", urgency: "none",        description: "אין מקום לתוספת בפמה", nextAction: "נסה גוף אחר או ארכב", isTerminal: true },
  "v-not-interested":    { emoji: "👋", sentiment: "neutral",  urgency: "none",        description: "לא מעוניין מהשיחה הראשונה", nextAction: "ארכב", isTerminal: true },
  "v-no-final":          { emoji: "😞", sentiment: "negative", urgency: "none",        description: "לא מעוניין באישור הסופי", nextAction: "ארכב", isTerminal: true },
  "v-rejected":          { emoji: "❌", sentiment: "negative", urgency: "none",        description: "סורב", nextAction: "ארכב", isTerminal: true },
  "v-rejected-red":      { emoji: "🚨", sentiment: "negative", urgency: "none",        description: "סורב - אדום! (דגל אזהרה)", nextAction: "ארכב - לא לחזור!", isTerminal: true },

  // ───────────── GENERIC UNDERWRITING ADDITIONS ─────────────
  "u-waiting-docs":      { emoji: "📑", sentiment: "pending",  urgency: "today",       description: "ממתין למסמכים מהלקוח", nextAction: "תזכר ללקוח להעלות מסמכים", slaHours: 48 },
  "u-waiting-final":     { emoji: "⏳", sentiment: "pending",  urgency: "today",       description: "ממתין לאישור סופי מהמלווה", nextAction: "פולואפ עם המלווה", slaHours: 48 },
  "u-sign-contract":     { emoji: "✍️", sentiment: "positive", urgency: "now",         description: "אישור סופי - להחתים חוזה", nextAction: "סגור חתימה היום!", slaHours: 24 },
  "u-waiting-insurance": { emoji: "🛡️", sentiment: "pending",  urgency: "this-week",   description: "ממתין לביטוח", nextAction: "פולואפ עם חברת ביטוח" },
  "u-waiting-win":       { emoji: "🎯", sentiment: "pending",  urgency: "today",       description: "ממתין לזכייה / זיהוי", nextAction: "פולואפ", slaHours: 48 },
  "u-waiting-loan":      { emoji: "⌛", sentiment: "pending",  urgency: "today",       description: "ממתין להלוואה", nextAction: "ודא העברה מהמלווה", slaHours: 48 },
  "u-got-loan":          { emoji: "💰", sentiment: "celebrate", urgency: "today",      description: "קיבל הלוואה!", nextAction: "שלח חשבונית עמלה", slaHours: 24 },
  "u-final-id":          { emoji: "🪪", sentiment: "pending",  urgency: "today",       description: "אישור סופי - השלמת זיהוי", nextAction: "תזכר ללקוח להעלות תעודה", slaHours: 24 },
  "u-deal-cancel":       { emoji: "🚫", sentiment: "negative", urgency: "none",        description: "ביטול עסקה לאחר אישור", nextAction: "תיעוד סיבה - ארכב", isTerminal: true },
  "u-deleted":           { emoji: "🗑️", sentiment: "neutral",  urgency: "none",        description: "תהליך נמחק ידנית", nextAction: "אין", isTerminal: true },
  "u-first-no-interest": { emoji: "👋", sentiment: "negative", urgency: "none",        description: "עבר לסטטוס לא מעוניינים מהשיחה הראשונית", nextAction: "ארכב", isTerminal: true },

  // ───────────── RETENTION YONI ─────────────
  "y-pool":              { emoji: "🏊", sentiment: "neutral",  urgency: "this-week",   description: "מאגר לידים לטיפול יוני", nextAction: "מיון לפי פוטנציאל" },
  "y-new-vehicle":       { emoji: "🚗", sentiment: "positive", urgency: "today",       description: "ליד חדש לשימור רכב", nextAction: "צור קשר תוך 24h", slaHours: 24 },
  "y-new-general":       { emoji: "💸", sentiment: "positive", urgency: "today",       description: "ליד חדש לשימור הלוואה לכל מטרה", nextAction: "חייג היום", slaHours: 24 },
  "y-new-purchase":      { emoji: "🛒", sentiment: "positive", urgency: "today",       description: "ליד חדש לקניית שיעבוד", nextAction: "צור קשר וטפל", slaHours: 24 },
  "y-callback":          { emoji: "📞", sentiment: "pending",  urgency: "today",       description: "לחזור ללקוח (שימור)", nextAction: "חייג בזמן המבוקש", slaHours: 24 },
  "y-no-answer":         { emoji: "📵", sentiment: "warning",  urgency: "today",       description: "אין מענה (שימור)", nextAction: "נסה WhatsApp או שעה אחרת", slaHours: 24 },
  "y-interested":        { emoji: "🔥", sentiment: "celebrate", urgency: "now",        description: "חזר להתעניין! פוטנציאל סגירה", nextAction: "סגור במהירות!", slaHours: 4 },
  "y-docs-purchase":     { emoji: "📑", sentiment: "pending",  urgency: "today",       description: "להשלים מסמכים קניית שיעבוד", nextAction: "תזכר ללקוח", slaHours: 48 },
  "y-waiting-loan":      { emoji: "⌛", sentiment: "pending",  urgency: "today",       description: "ממתין להלוואה (שימור)", nextAction: "פולואפ עם המלווה", slaHours: 48 },
  "y-got-loan":          { emoji: "🎉", sentiment: "celebrate", urgency: "today",      description: "סגר דרך שימור!", nextAction: "תעד הצלחה + חשבונית", slaHours: 24 },
  "y-paid":              { emoji: "💵", sentiment: "celebrate", urgency: "none",       description: "שילם דרך שימור", nextAction: "מזל טוב 🎊", isTerminal: true },
  "y-not-interested":    { emoji: "👋", sentiment: "negative", urgency: "none",        description: "לא חוזר לשימור", nextAction: "ארכב", isTerminal: true },

  // ───────────── WATI ─────────────
  "w-incoming":          { emoji: "💬", sentiment: "positive", urgency: "today",       description: "פנייה חדשה ב-WATI", nextAction: "בוט יענה אוטומטית", slaHours: 1 },
  "w-bot-screening":     { emoji: "🤖", sentiment: "pending",  urgency: "monitor",     description: "בבדיקת בוט", nextAction: "המתן לתשובה מהלקוח" },
  "w-handed-to-agent":   { emoji: "👤", sentiment: "positive", urgency: "now",         description: "בוט סיים — הועבר לנציג", nextAction: "צור קשר תוך שעה!", slaHours: 1 },
  "w-no-response":       { emoji: "📭", sentiment: "warning",  urgency: "none",        description: "לא הגיב לבוט", nextAction: "ארכב או נסה קמפיין חוזר", isTerminal: true },
  "w-promo":             { emoji: "📣", sentiment: "pending",  urgency: "monitor",     description: "תגובה לקמפיין שיווקי", nextAction: "בדוק כוונה" },
  "w-faq":               { emoji: "❓", sentiment: "neutral",  urgency: "monitor",     description: "שאלה ב-FAQ", nextAction: "בוט יענה" },
  "w-greeting":          { emoji: "👋", sentiment: "neutral",  urgency: "monitor",     description: "ברכה / שלום", nextAction: "בוט יחזיר ברכה" },
  "w-spam-detected":     { emoji: "🚯", sentiment: "negative", urgency: "none",        description: "זוהה כספאם ב-WATI", nextAction: "אוטו - חסום", isTerminal: true },
  "w-broadcast-reply":   { emoji: "📢", sentiment: "pending",  urgency: "monitor",     description: "תגובה ל-Broadcast", nextAction: "מיין לפי כוונה" },

  // ───────────── LEGAL ─────────────
  "l-pending":           { emoji: "📋", sentiment: "warning",  urgency: "today",       description: "פתיחת תיק משפטי", nextAction: "העבר לעו\"ד", slaHours: 24 },
  "l-in-court":          { emoji: "⚖️", sentiment: "warning",  urgency: "monitor",     description: "בטיפול עורך דין", nextAction: "פולואפ שבועי עם עו\"ד" },
  "l-mediation":         { emoji: "🤝", sentiment: "pending",  urgency: "this-week",   description: "גישור / משא ומתן", nextAction: "המתן לתוצאת גישור" },
  "l-settlement":        { emoji: "✅", sentiment: "positive", urgency: "today",       description: "פשרה הושגה", nextAction: "בצע פשרה - גבה תשלום", slaHours: 48 },
  "l-judgement":         { emoji: "🔨", sentiment: "warning",  urgency: "monitor",     description: "פסק דין", nextAction: "פעל לפי פסק הדין" },
  "l-bankruptcy":        { emoji: "💸", sentiment: "negative", urgency: "none",        description: "פשיטת רגל", nextAction: "ארכב — אבוד", isTerminal: true },
  "l-closed":            { emoji: "📁", sentiment: "neutral",  urgency: "none",        description: "תיק נסגר", nextAction: "אין", isTerminal: true },

  // ───────────── SPAM ─────────────
  "s-invalid-phone":     { emoji: "📵", sentiment: "negative", urgency: "none",        description: "מספר טלפון לא תקין", nextAction: "אוטו - ספאם", isTerminal: true },
  "s-foreign-phone":     { emoji: "🌍", sentiment: "negative", urgency: "none",        description: "מספר זר / קידומת לא ישראלית", nextAction: "אוטו - ספאם", isTerminal: true },
  "s-bot-detected":      { emoji: "🤖", sentiment: "negative", urgency: "none",        description: "זוהה כבוט", nextAction: "אוטו - חסום", isTerminal: true },
  "s-duplicate-spam":    { emoji: "👥", sentiment: "negative", urgency: "none",        description: "כפיל ספאם", nextAction: "אוטו - חסום", isTerminal: true },
  "s-blacklist":         { emoji: "🚷", sentiment: "negative", urgency: "none",        description: "ברשימה שחורה", nextAction: "חסום - אין לחזור!", isTerminal: true },
  "s-no-data":           { emoji: "❓", sentiment: "neutral",  urgency: "none",        description: "ללא נתונים מספיקים", nextAction: "ארכב", isTerminal: true },

  // ───────────── ARCHIVE ─────────────
  "a-cold-6m":           { emoji: "❄️", sentiment: "neutral",  urgency: "monitor",     description: "קר 6 חודשים — לא פעיל", nextAction: "פוטנציאל לקמפיין שיווק" },
  "a-cold-1y":           { emoji: "🧊", sentiment: "neutral",  urgency: "monitor",     description: "קר שנה+ — לא פעיל", nextAction: "אופציה לקמפיין חימום" },
  "a-historical":        { emoji: "📚", sentiment: "neutral",  urgency: "none",        description: "היסטורי (מעל שנתיים)", nextAction: "שמירה לרגולציה", isTerminal: true },
  "a-deleted":           { emoji: "🗑️", sentiment: "neutral",  urgency: "none",        description: "תהליך נמחק (ארכיב)", nextAction: "אין", isTerminal: true },
  "a-merged":            { emoji: "🔗", sentiment: "neutral",  urgency: "none",        description: "מוזג עם ליד אחר", nextAction: "עיין בליד הראשי", isTerminal: true },

  // ───────────── IRRELEVANT ADDITIONS ─────────────
  "i-deal-cancel":       { emoji: "🚫", sentiment: "negative", urgency: "none",        description: "ביטול עסקה לאחר אישור", nextAction: "ארכב + תיעוד", isTerminal: true },
  "i-cooling":           { emoji: "🥶", sentiment: "neutral",  urgency: "monitor",     description: "תקופת התקררות", nextAction: "חזור בעוד 30 יום" },
  "i-disrespect":        { emoji: "⛔", sentiment: "negative", urgency: "none",        description: "התנהגות לא ראויה", nextAction: "ארכב + הוסף לרשימה שחורה", isTerminal: true },
};

/** Default enrichment for unknown statuses (fallback) */
const DEFAULT_ENRICHMENT = {
  emoji: "📌",
  sentiment: "neutral" as Sentiment,
  urgency: "monitor" as Urgency,
  description: "סטטוס במערכת",
  nextAction: "בדוק עם המנהל",
  isTerminal: false,
};

/** Get full metadata for a status (or fallback) */
export function getStatusMeta(statusKey: string): StatusMeta | null {
  const def = STATUSES.find((s) => s.key === statusKey);
  if (!def) return null;
  const enrich = STATUS_ENRICHMENTS[statusKey] || DEFAULT_ENRICHMENT;
  const mapping = mapStatusToLifecycle(statusKey);
  return {
    key: statusKey,
    def,
    stage: mapping.stage,
    emoji: enrich.emoji,
    sentiment: enrich.sentiment,
    urgency: enrich.urgency,
    description: enrich.description,
    nextAction: enrich.nextAction,
    slaHours: enrich.slaHours,
    isTerminal: enrich.isTerminal || false,
  };
}

/** Get all statuses with full meta */
export const ALL_STATUS_META: StatusMeta[] = STATUSES
  .map((s) => getStatusMeta(s.key))
  .filter((m): m is StatusMeta => m !== null);

/** Group statuses by lifecycle stage */
export function groupStatusesByStage(): Record<LifecycleStage, StatusMeta[]> {
  const groups: Partial<Record<LifecycleStage, StatusMeta[]>> = {};
  ALL_STATUS_META.forEach((s) => {
    if (!groups[s.stage]) groups[s.stage] = [];
    groups[s.stage]!.push(s);
  });
  return groups as Record<LifecycleStage, StatusMeta[]>;
}

/** Group statuses by sentiment */
export function groupStatusesBySentiment(): Record<Sentiment, StatusMeta[]> {
  const groups: Partial<Record<Sentiment, StatusMeta[]>> = {};
  ALL_STATUS_META.forEach((s) => {
    if (!groups[s.sentiment]) groups[s.sentiment] = [];
    groups[s.sentiment]!.push(s);
  });
  return groups as Record<Sentiment, StatusMeta[]>;
}

/** Statuses sorted by lead count (popular first) */
export const TOP_STATUSES_BY_COUNT = [...ALL_STATUS_META].sort(
  (a, b) => b.def.count - a.def.count
);
