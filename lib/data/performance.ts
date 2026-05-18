/* Performance data for agent home dashboard */

export interface Deal {
  id: string;
  leadId: string;
  leadName: string;
  closedAt: string;
  loanAmount: number;       // סכום ההלוואה שאושרה
  fee: number;              // שכר טרחה (לפני מע"מ)
  commission: number;       // עמלת הנציג
  lender: string;           // איזה גוף נתן את ההלוואה
  loanType: "general" | "vehicle" | "property" | "consolidation";
  status: "signed" | "paid" | "pending";
}

export interface AgentGoal {
  agentId: number;
  dailyDealsTarget: number;
  monthlyDealsTarget: number;
  monthlyCommissionTarget: number;
}

export interface BonusTier {
  threshold: number;        // number of deals
  bonus: number;            // bonus amount in ILS
  label: string;
}

export const BONUS_TIERS: BonusTier[] = [
  { threshold: 20, bonus: 1500, label: "ברונזה" },
  { threshold: 35, bonus: 3500, label: "כסף" },
  { threshold: 50, bonus: 6000, label: "זהב" },
  { threshold: 75, bonus: 10000, label: "פלטינום" },
  { threshold: 100, bonus: 18000, label: "יהלום" },
];

export const AGENT_GOALS: Record<number, AgentGoal> = {
  12394: { agentId: 12394, dailyDealsTarget: 2, monthlyDealsTarget: 40, monthlyCommissionTarget: 50000 },
  12266: { agentId: 12266, dailyDealsTarget: 2, monthlyDealsTarget: 40, monthlyCommissionTarget: 50000 },
  13986: { agentId: 13986, dailyDealsTarget: 3, monthlyDealsTarget: 60, monthlyCommissionTarget: 75000 },
};

const today = new Date();
const D = (offsetDays: number, h = 12, m = 0) => {
  const d = new Date(today);
  d.setDate(d.getDate() - offsetDays);
  d.setHours(h, m, 0, 0);
  return d.toISOString();
};

const LENDERS_LIST = ["cal", "max", "isracard", "phoenix", "blender", "jerusalem-bank", "fama", "direct-finance"];

/** Generate realistic deal history for current month */
function generateDeals(agentId: number, daysBack: number, dealsPerDay: number): Deal[] {
  const deals: Deal[] = [];
  let counter = 1;
  for (let day = 0; day < daysBack; day++) {
    // Skip Fridays / Saturdays
    const date = new Date(today);
    date.setDate(date.getDate() - day);
    const dow = date.getDay();
    if (dow === 5 || dow === 6) continue;

    const dealsThisDay = Math.max(0, Math.round(dealsPerDay + (Math.random() - 0.4) * 2));
    for (let i = 0; i < dealsThisDay; i++) {
      const loanAmount = Math.round((20000 + Math.random() * 130000) / 1000) * 1000;
      const feeRate = 0.02 + Math.random() * 0.04; // 2-6%
      const fee = Math.round(loanAmount * feeRate / 100) * 100;
      const commission = Math.round(fee * 0.30);
      deals.push({
        id: `d-${agentId}-${counter++}`,
        leadId: `lead-${agentId}-${counter}`,
        leadName: HEBREW_NAMES[counter % HEBREW_NAMES.length],
        closedAt: D(day, 9 + (i * 2), Math.floor(Math.random() * 60)),
        loanAmount,
        fee,
        commission,
        lender: LENDERS_LIST[counter % LENDERS_LIST.length],
        loanType: (["general", "vehicle", "property", "consolidation"] as const)[counter % 4],
        status: day === 0 ? "signed" : day < 5 ? "pending" : "paid",
      });
    }
  }
  return deals;
}

const HEBREW_NAMES = [
  "דוד כהן", "שרה לוי", "משה דהן", "רחל בן דוד", "יוסי לוינסון",
  "מירי שמש", "אליאב ארד", "אסתר בן זקן", "אהוד פרנקל", "מיכל גולן",
  "שלמה אמסלם", "טל ברק", "ענת פלג", "ניר טבק", "נועה בנימין",
  "אלי כהן", "תמר אהרון", "עומר חי", "ליאת מימון", "אבי טל",
  "רותי שגיא", "אורן בכר", "מורן זילבר", "אדם רובין", "שיר אסולין",
];

export const DEALS: Deal[] = [
  ...generateDeals(12394, 30, 2.2),
];

/* ---------- Helpers ---------- */

export type DateRange = "today" | "yesterday" | "7d" | "30d" | "month" | "custom";

export function filterDealsByRange(deals: Deal[], range: DateRange, customFrom?: string, customTo?: string): Deal[] {
  const now = new Date();
  const start = new Date(now);
  let end = new Date(now);
  end.setHours(23, 59, 59, 999);

  switch (range) {
    case "today":
      start.setHours(0, 0, 0, 0);
      break;
    case "yesterday":
      start.setDate(start.getDate() - 1);
      start.setHours(0, 0, 0, 0);
      end = new Date(start);
      end.setHours(23, 59, 59, 999);
      break;
    case "7d":
      start.setDate(start.getDate() - 7);
      start.setHours(0, 0, 0, 0);
      break;
    case "30d":
      start.setDate(start.getDate() - 30);
      start.setHours(0, 0, 0, 0);
      break;
    case "month":
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      break;
    case "custom":
      if (customFrom) start.setTime(new Date(customFrom).getTime());
      if (customTo) end.setTime(new Date(customTo).getTime());
      break;
  }
  return deals.filter((d) => {
    const t = new Date(d.closedAt).getTime();
    return t >= start.getTime() && t <= end.getTime();
  });
}

export function summarizeDeals(deals: Deal[]) {
  return {
    count: deals.length,
    loanVolume: deals.reduce((s, d) => s + d.loanAmount, 0),
    revenue: deals.reduce((s, d) => s + d.fee, 0),
    commission: deals.reduce((s, d) => s + d.commission, 0),
  };
}

export function getCurrentBonus(monthlyDeals: number): { current: BonusTier | null; next: BonusTier | null; progress: number; remaining: number } {
  let current: BonusTier | null = null;
  let next: BonusTier | null = null;
  for (const t of BONUS_TIERS) {
    if (monthlyDeals >= t.threshold) current = t;
    else if (!next) next = t;
  }
  const baseline = current?.threshold || 0;
  const targetThreshold = next?.threshold || baseline;
  const progress = next ? ((monthlyDeals - baseline) / (targetThreshold - baseline)) * 100 : 100;
  const remaining = next ? next.threshold - monthlyDeals : 0;
  return { current, next, progress: Math.max(0, Math.min(100, progress)), remaining };
}

export function getStreak(deals: Deal[], dailyTarget: number): { current: number; longest: number } {
  const dealsByDay = new Map<string, number>();
  for (const d of deals) {
    const day = new Date(d.closedAt).toISOString().slice(0, 10);
    dealsByDay.set(day, (dealsByDay.get(day) || 0) + 1);
  }
  let current = 0;
  let longest = 0;
  const today = new Date();
  for (let i = 0; i < 60; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const count = dealsByDay.get(key) || 0;
    const dow = d.getDay();
    // Skip Fri/Sat
    if (dow === 5 || dow === 6) continue;
    if (count >= dailyTarget) {
      current = i === 0 || current > 0 ? current + 1 : 0;
      longest = Math.max(longest, current);
    } else {
      if (i === 0) current = 0;
      else break;
    }
  }
  return { current, longest };
}

/** Daily activity heatmap data */
export function getDailyActivity(deals: Deal[], days: number = 35): { date: string; count: number; isWeekend: boolean }[] {
  const map = new Map<string, number>();
  for (const d of deals) {
    const day = new Date(d.closedAt).toISOString().slice(0, 10);
    map.set(day, (map.get(day) || 0) + 1);
  }
  const result: { date: string; count: number; isWeekend: boolean }[] = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const dow = d.getDay();
    result.push({
      date: key,
      count: map.get(key) || 0,
      isWeekend: dow === 5 || dow === 6,
    });
  }
  return result;
}

/** Motivational message based on progress */
export function getMotivationalMessage(opts: {
  dealsToday: number;
  dailyTarget: number;
  monthlyDeals: number;
  monthlyTarget: number;
  streak: number;
}): { text: string; tone: "celebration" | "encouragement" | "push" | "calm" } {
  const { dealsToday, dailyTarget, monthlyDeals, monthlyTarget, streak } = opts;
  const dayPct = (dealsToday / dailyTarget) * 100;
  const monthPct = (monthlyDeals / monthlyTarget) * 100;

  if (dealsToday >= dailyTarget * 2) {
    return { text: `🔥 ${dealsToday} עסקאות היום! זה הזמן לשתי עסקאות נוספות לקפיצה בבונוס.`, tone: "celebration" };
  }
  if (dealsToday >= dailyTarget) {
    return { text: `✅ עברת את היעד היומי! עוד עסקה תקרב אותך לבונוס הבא.`, tone: "celebration" };
  }
  if (streak >= 5) {
    return { text: `🚀 רצף של ${streak} ימים מעל היעד - שמור על המומנטום!`, tone: "celebration" };
  }
  if (dealsToday === dailyTarget - 1) {
    return { text: `💪 עוד עסקה אחת והיעד היומי שלך הושג. מי הליד הכי חם ברשימה?`, tone: "push" };
  }
  if (dayPct === 0 && new Date().getHours() < 11) {
    return { text: `☀️ בוקר טוב! היעד היומי: ${dailyTarget} עסקאות. בוא נתחיל מהפולואפים.`, tone: "encouragement" };
  }
  if (dayPct === 0 && new Date().getHours() >= 14) {
    return { text: `⏰ עוד לא סגרת היום. יש לך אישורים עקרוניים שמחכים - שווה שיחת סגירה.`, tone: "push" };
  }
  if (monthPct >= 100) {
    return { text: `🏆 השגת את היעד החודשי! כל עסקה נוספת = בונוס נטו.`, tone: "celebration" };
  }
  if (monthPct >= 75) {
    return { text: `🎯 אתה ב-${Math.round(monthPct)}% מהיעד החודשי. שתי שיחות סגירה ביום יביאו אותך לשם.`, tone: "encouragement" };
  }
  return { text: `📞 כל שיחה מקרבת אותך ליעד. בוא נראה אותך עובד.`, tone: "calm" };
}
