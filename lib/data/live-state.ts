/* Live agent state - simulated for now, will be Pusher/realtime later */

import { USERS } from "./static";

export type AgentStatus =
  | "available"     // 💼 פעיל
  | "on-call"       // 📞 בשיחה
  | "wrap-up"       // ⏸ אחרי שיחה
  | "smoke"         // 🚬 סיגריה
  | "bathroom"      // 🚻 שירותים
  | "lunch"         // 🍽 אוכל
  | "training"      // 📚 הדרכה
  | "meeting"       // 📅 פגישה
  | "offline";      // 🌙 לא נמצא

export interface LiveAgent {
  id: number;
  name: string;
  emoji?: string;
  status: AgentStatus;
  statusSince: string; // ISO
  currentCallLeadName?: string;
  currentCallDuration?: number; // seconds
  todayCallsMade: number;
  todayCallsAnswered: number;
  todayTotalTalkTime: number; // seconds
  todayAvgQualityScore: number; // 0-100
  todayBreakTotal: number; // seconds
}

const STATUS_META = {
  available: { label: "פעיל", emoji: "🟢", color: "green" as const, isBreak: false, isWorking: true },
  "on-call": { label: "בשיחה", emoji: "📞", color: "blue" as const, isBreak: false, isWorking: true },
  "wrap-up": { label: "סיכום שיחה", emoji: "⏸", color: "yellow" as const, isBreak: false, isWorking: true },
  smoke: { label: "סיגריה", emoji: "🚬", color: "orange" as const, isBreak: true, isWorking: false },
  bathroom: { label: "שירותים", emoji: "🚻", color: "orange" as const, isBreak: true, isWorking: false },
  lunch: { label: "אוכל", emoji: "🍽", color: "purple" as const, isBreak: true, isWorking: false },
  training: { label: "הדרכה", emoji: "📚", color: "purple" as const, isBreak: false, isWorking: false },
  meeting: { label: "פגישה", emoji: "📅", color: "purple" as const, isBreak: false, isWorking: false },
  offline: { label: "לא נמצא", emoji: "🌙", color: "gray" as const, isBreak: false, isWorking: false },
};

export function getStatusMeta(s: AgentStatus) {
  return STATUS_META[s];
}

const sampleAgents = USERS.filter((u) => ["agent", "manager", "underwriter"].includes(u.role)).slice(0, 12);

const SAMPLE_LEADS = ["דוד כהן", "שרה לוי", "משה דהן", "רחל בן דוד", "יוסי לוינסון", "מירי שמש"];

const today = new Date();
const T = (offsetMin: number) => {
  const d = new Date(today);
  d.setMinutes(d.getMinutes() - offsetMin);
  return d.toISOString();
};

const STATUSES: AgentStatus[] = ["on-call", "on-call", "on-call", "available", "available", "wrap-up", "smoke", "available", "bathroom", "on-call", "lunch", "available"];

export const LIVE_AGENTS: LiveAgent[] = sampleAgents.map((u, i) => {
  const status = STATUSES[i];
  return {
    id: u.id,
    name: u.name,
    emoji: u.emoji,
    status,
    statusSince: T(2 + (i * 3) % 25),
    currentCallLeadName: status === "on-call" ? SAMPLE_LEADS[i % SAMPLE_LEADS.length] : undefined,
    currentCallDuration: status === "on-call" ? 30 + i * 47 + Math.floor(Math.random() * 200) : undefined,
    todayCallsMade: 25 + i * 8 + Math.floor(Math.random() * 30),
    todayCallsAnswered: Math.round((25 + i * 8) * 0.6),
    todayTotalTalkTime: 1800 + i * 600 + Math.floor(Math.random() * 1800),
    todayAvgQualityScore: 65 + Math.floor(Math.random() * 30),
    todayBreakTotal: 600 + Math.floor(Math.random() * 1800),
  };
});

/* Helper to format duration */
export function formatLiveDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}״`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m < 60) return `${m}:${String(s).padStart(2, "0")}`;
  const h = Math.floor(m / 60);
  const remMin = m % 60;
  return `${h}:${String(remMin).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export const POOL_QUEUE = [
  { leadName: "אבי לוי", phone: "050-1234567", attempts: 0, score: 85, queue: "new-leads", source: "facebook", lastAttempt: null },
  { leadName: "רחל כהן", phone: "052-7891011", attempts: 1, score: 72, queue: "callbacks", source: "wati", lastAttempt: T(120) },
  { leadName: "יוסף ארד", phone: "053-1112233", attempts: 3, score: 35, queue: "callbacks", source: "tiktok", lastAttempt: T(240) },
  { leadName: "נטע פרץ", phone: "054-4445566", attempts: 0, score: 91, queue: "closing", source: "lp", lastAttempt: null },
  { leadName: "אורן יעקב", phone: "050-7778899", attempts: 5, score: 12, queue: "callbacks", source: "facebook", lastAttempt: T(60 * 4), skipped: true },
  { leadName: "מאיה דהן", phone: "055-1212121", attempts: 2, score: 58, queue: "callbacks", source: "facebook", lastAttempt: T(180) },
];

export const NUMBER_POOL = [
  { number: "+972-3-9101010", reputation: 92, todayCalls: 45, status: "active", lastUsed: T(5) },
  { number: "+972-3-9101011", reputation: 87, todayCalls: 38, status: "active", lastUsed: T(8) },
  { number: "+972-3-9101012", reputation: 78, todayCalls: 67, status: "warning", lastUsed: T(3) },
  { number: "+972-3-9101013", reputation: 65, todayCalls: 79, status: "warning", lastUsed: T(15) },
  { number: "+972-3-9101014", reputation: 95, todayCalls: 12, status: "active", lastUsed: T(45) },
  { number: "+972-3-9101015", reputation: 32, todayCalls: 80, status: "spam-risk", lastUsed: T(2) },
  { number: "+972-3-9101016", reputation: 88, todayCalls: 22, status: "active", lastUsed: T(120) },
  { number: "+972-3-9101017", reputation: 100, todayCalls: 0, status: "resting", lastUsed: T(60 * 24 * 30) },
];

export const LEARNED_OBJECTIONS = [
  {
    obj: "יקר מדי",
    bestResponse: "אני מבין. השוויתי את ההצעה מול 12 גופים שונים. ההצעה שלנו היא הזולה ביותר עבור הפרופיל שלך. אסביר במה?",
    successRate: 73,
    timesUsed: 247,
    lastUpdated: "אתמול",
  },
  {
    obj: "צריך לחשוב",
    bestResponse: "מה הכי מטריד אותך בהצעה? אם נתקדם היום הריבית מובטחת ל-7 ימים. אם לא תתקדם תוך השבוע ייתכן שהריבית תעלה.",
    successRate: 65,
    timesUsed: 189,
    lastUpdated: "השבוע",
  },
  {
    obj: "יש לי הצעה אחרת",
    bestResponse: "מצוין שעשית סקר שוק. אפשר לראות את ההצעה? אם אני לא מצליח לתת לך 3 פרמטרים טובים יותר - אתה חופשי. הסכם?",
    successRate: 81,
    timesUsed: 156,
    lastUpdated: "אתמול",
  },
  {
    obj: "לא בטוח שאני אעמוד בהחזרים",
    bestResponse: "שאלה מעולה ואחראית. בדקתי את הנתונים שלך - יש לך כושר החזר ל-X בנוח. בנוסף, יש לנו ביטוח אובדן כושר עבודה.",
    successRate: 58,
    timesUsed: 92,
    lastUpdated: "השבוע",
  },
  {
    obj: "מה הביטחונות?",
    bestResponse: "ההלוואה לכל מטרה היא ללא ביטחונות. אם תרצה ריבית נמוכה יותר, יש לי אופציה להלוואה כנגד רכב או נכס.",
    successRate: 70,
    timesUsed: 134,
    lastUpdated: "השבוע",
  },
];

export const TALK_TIME_LEADERBOARD = LIVE_AGENTS.slice()
  .sort((a, b) => b.todayTotalTalkTime - a.todayTotalTalkTime)
  .map((a, i) => ({
    rank: i + 1,
    agent: a,
    talkTime: a.todayTotalTalkTime,
    callsMade: a.todayCallsMade,
    avgDuration: Math.round(a.todayTotalTalkTime / Math.max(1, a.todayCallsAnswered)),
    qualityScore: a.todayAvgQualityScore,
  }));
