/**
 * AI Co-pilot insights for a lead.
 * In production these would come from a real LLM call combining:
 *  - Lead profile + history
 *  - Call transcripts (Whisper)
 *  - WhatsApp conversation
 *  - Behavioral data
 *  - Comparable closed deals
 */

import type { Lead } from "@/lib/types";

export type SentimentScore = "very-positive" | "positive" | "neutral" | "concerned" | "negative";
export type ActionPriority = "now" | "today" | "this-week";
export type ActionType = "call" | "whatsapp" | "email" | "document" | "lender" | "meeting" | "internal";

export interface AIAction {
  id: string;
  type: ActionType;
  title: string;
  reason: string;
  priority: ActionPriority;
  confidence: number; // 0-100
}

export interface AIInsights {
  closeProbability: number; // 0-100
  sentiment: SentimentScore;
  riskScore: number; // 0-100, higher = more risk
  estimatedCloseInDays: number;
  estimatedRevenue: number;
  similarDealsClosed: number;
  similarDealsAvgRevenue: number;
  summary: string;
  keyInsights: string[];
  redFlags: string[];
  opportunities: string[];
  nextActions: AIAction[];
  scriptHint: string;
  bestCallTimes: string[];
  competitorMentions?: string[];
}

const SENTIMENT_META: Record<SentimentScore, { label: string; color: string; emoji: string }> = {
  "very-positive": { label: "מעולה", color: "bg-bingo-green text-bingo-black", emoji: "🤩" },
  positive: { label: "חיובי", color: "bg-emerald-100 text-emerald-800", emoji: "😊" },
  neutral: { label: "ניטרלי", color: "bg-bingo-gray-100 text-bingo-charcoal", emoji: "😐" },
  concerned: { label: "מהוסס", color: "bg-amber-100 text-amber-800", emoji: "🤔" },
  negative: { label: "שלילי", color: "bg-red-100 text-red-800", emoji: "😟" },
};

export function getSentimentMeta(s: SentimentScore) {
  return SENTIMENT_META[s];
}

/**
 * Deterministically generate AI insights for a lead.
 * Stable across reloads by using the lead's ID as seed.
 */
export function generateInsights(lead: Lead): AIInsights {
  const seed = lead.id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const r = (offset: number) => ((seed + offset * 17) % 100) / 100;

  const closeProbability = Math.round(35 + r(1) * 55);
  const riskScore = Math.round(15 + r(2) * 60);
  const sentimentIdx = Math.floor(r(3) * 5);
  const sentiments: SentimentScore[] = ["negative", "concerned", "neutral", "positive", "very-positive"];
  // Bias toward positive for high close probability
  const sentiment = closeProbability > 70
    ? sentiments[3 + Math.floor(r(4) * 2)]
    : closeProbability > 50
      ? sentiments[2 + Math.floor(r(4) * 2)]
      : sentiments[Math.max(0, sentimentIdx - 1)];

  const requested = lead.amountRequested || 80000;
  const commissionRate = 0.035 + r(5) * 0.02;
  const estimatedRevenue = Math.round(requested * commissionRate);

  return {
    closeProbability,
    sentiment,
    riskScore,
    estimatedCloseInDays: Math.round(3 + r(6) * 14),
    estimatedRevenue,
    similarDealsClosed: Math.round(8 + r(7) * 35),
    similarDealsAvgRevenue: Math.round(estimatedRevenue * (0.85 + r(8) * 0.3)),
    summary: buildSummary(lead, closeProbability, sentiment),
    keyInsights: buildKeyInsights(lead, r),
    redFlags: buildRedFlags(lead, riskScore, r),
    opportunities: buildOpportunities(lead, r),
    nextActions: buildNextActions(lead, sentiment, r),
    scriptHint: buildScriptHint(lead, sentiment),
    bestCallTimes: ["09:30-11:00", "14:00-15:30", "17:00-18:30"].filter((_, i) => r(20 + i) > 0.3),
    competitorMentions: r(30) > 0.6 ? ["מימון ישיר", "כספית"] : undefined,
  };
}

function buildSummary(lead: Lead, prob: number, sentiment: SentimentScore): string {
  const cat = lead.category === "vehicle" ? "רכב" : lead.category === "property" ? "נכס" : "כל מטרה";
  if (prob > 75) {
    return `ליד חם — ${lead.fullName} מתעניין בהלוואת ${cat} ומגלה עניין רב. נראה שיש כאן הזדמנות סגירה תוך זמן קצר.`;
  }
  if (prob > 55) {
    return `ליד פוטנציאלי — ${lead.fullName} עדיין מתלבט אבל מתעניין. כדאי להעמיק את השיחה ולענות על התנגדויות.`;
  }
  return `ליד צריך חימום — ${lead.fullName} עוד לא בשל לסגירה. בנה קשר אישי, ספק ערך לפני בקשת התחייבות.`;
}

function buildKeyInsights(lead: Lead, r: (n: number) => number): string[] {
  const insights = [
    `ביקש ${lead.amountRequested ? `₪${lead.amountRequested.toLocaleString("he-IL")}` : "סכום לא צוין"} — בטווח אופייני לקטגוריה`,
    "פנה בשעות הערב — ככל הנראה עובד בשעות הבוקר",
    "ענה תוך 4 דקות לוואטסאפ — תקשורת זריזה",
    "שאל שאלות מקצועיות על ריבית — מבין מה הוא רוצה",
    "צפה ב-3 הצעות לפני שהשאיר פרטים — מחפש את הטוב ביותר",
  ];
  return insights.filter((_, i) => r(10 + i) > 0.3).slice(0, 3);
}

function buildRedFlags(lead: Lead, risk: number, r: (n: number) => number): string[] {
  if (risk < 30) return [];
  const flags = [
    "החזר חודשי יחסית גבוה ביחס להכנסה המשוערת",
    "מספר בקשות נדחו בעבר אצל מתחרים",
    "BDI מציג חוב פתוח של מעל ₪15K",
    "כתובת התגוררות שונתה ב-12 החודשים האחרונים",
    "טלפון נייד לא רשום על שם הליד",
  ];
  const count = risk > 60 ? 3 : risk > 45 ? 2 : 1;
  return flags.filter((_, i) => r(15 + i) > 0.4).slice(0, count);
}

function buildOpportunities(lead: Lead, r: (n: number) => number): string[] {
  const opps = [
    "זכאי להנחה לקוחות חוזרים (בגלל היסטוריה אצלנו)",
    "מתאים גם לאיחוד הלוואות — צ'אנס לעסקה גדולה יותר",
    "יש לו רכב משועבד שאפשר להוסיף כביטחון",
    "בן/בת זוג עם הכנסה גבוהה — אפשר להוסיף ערב",
    "סוכן הביטוח שלו שלח אותנו — יחסים טובים",
  ];
  return opps.filter((_, i) => r(25 + i) > 0.4).slice(0, 2);
}

function buildNextActions(lead: Lead, sentiment: SentimentScore, r: (n: number) => number): AIAction[] {
  const all: AIAction[] = [
    {
      id: "a1",
      type: "call",
      title: "חיוג להמשך שיחה",
      reason: "עברו 18 שעות מהשיחה האחרונה. לפי המודל — סיכוי גבוה לזמינות עכשיו.",
      priority: "now",
      confidence: 92,
    },
    {
      id: "a2",
      type: "whatsapp",
      title: "שליחת השוואת הצעות",
      reason: "הליד ציין שהוא משווה — שלח טבלת השוואה מותאמת אישית.",
      priority: "today",
      confidence: 85,
    },
    {
      id: "a3",
      type: "document",
      title: "בקש תלוש שכר אחרון",
      reason: "ללא תלוש לא נוכל להמשיך לשלב BDI.",
      priority: "today",
      confidence: 95,
    },
    {
      id: "a4",
      type: "lender",
      title: "פנייה ל-3 מלווים נוספים",
      reason: "פרופיל ההלוואה מתאים גם ל-MFK, אופאל ובנק מרכנתיל.",
      priority: "this-week",
      confidence: 78,
    },
    {
      id: "a5",
      type: "meeting",
      title: "תיאום פגישה פיזית",
      reason: "עסקאות מעל ₪150K סוגרות ב-3x סיכוי בפגישה פיזית.",
      priority: "this-week",
      confidence: 70,
    },
  ];
  const count = sentiment === "very-positive" || sentiment === "positive" ? 4 : 3;
  return all.filter((_, i) => r(35 + i) > 0.2).slice(0, count);
}

function buildScriptHint(lead: Lead, sentiment: SentimentScore): string {
  if (sentiment === "very-positive" || sentiment === "positive") {
    return `פתח ב: "${lead.fullName.split(" ")[0]}, יופי שהתקשרנו בחזרה. רציתי לעדכן אותך בחדשות טובות..." — והמשך ישר להצעה הקונקרטית.`;
  }
  if (sentiment === "concerned") {
    return `התחל בשאלה פתוחה: "${lead.fullName.split(" ")[0]}, מה היה הדבר הכי חשוב לך בשיחה הקודמת?" — תן לו לדבר, לא תלחץ.`;
  }
  return `אל תתחיל מההצעה. שאל: "מה השתנה אצלך מאז שהשארת פרטים? איך אתה רואה את התהליך הזה?"`;
}

export const ACTION_TYPE_META: Record<ActionType, { icon: string; color: string; label: string }> = {
  call: { icon: "Phone", color: "bg-status-blue/15 text-status-blue", label: "חיוג" },
  whatsapp: { icon: "MessageCircle", color: "bg-emerald-100 text-emerald-700", label: "WhatsApp" },
  email: { icon: "Mail", color: "bg-status-purple/15 text-status-purple", label: "אימייל" },
  document: { icon: "FileText", color: "bg-status-orange/15 text-orange-700", label: "מסמך" },
  lender: { icon: "Building2", color: "bg-bingo-green/15 text-bingo-green-dark", label: "מלווה" },
  meeting: { icon: "Calendar", color: "bg-status-pink/15 text-pink-700", label: "פגישה" },
  internal: { icon: "Users", color: "bg-bingo-gray-100 text-bingo-charcoal", label: "פנימי" },
};

export const PRIORITY_META: Record<ActionPriority, { label: string; color: string }> = {
  now: { label: "עכשיו", color: "bg-status-red text-white" },
  today: { label: "היום", color: "bg-status-orange text-white" },
  "this-week": { label: "השבוע", color: "bg-status-blue text-white" },
};
