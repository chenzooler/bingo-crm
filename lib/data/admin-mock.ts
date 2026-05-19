import { USERS } from "./static";

export interface AgentPerformance {
  id: number;
  name: string;
  emoji?: string;
  role: string;
  monthlyDeals: number;
  monthlyTarget: number;
  monthlyRevenue: number;
  monthlyCommission: number;
  callsMade: number;
  callsAnswered: number;
  avgCallDuration: number; // seconds
  signaturesCollected: number;
  bdiApprovals: number;
  bdiRejections: number;
  conversionRate: number; // %
  smileyAvg: "green" | "yellow" | "red";
}

const SAMPLE_AGENTS = USERS.filter((u) => ["manager", "agent", "underwriter"].includes(u.role)).slice(0, 12);

export const AGENT_PERFORMANCE: AgentPerformance[] = SAMPLE_AGENTS.map((u, i) => {
  const base = 35 - i * 2;
  const monthlyDeals = Math.max(0, base + Math.round((Math.random() - 0.5) * 10));
  const monthlyTarget = 40;
  const revenue = Math.round(monthlyDeals * (2500 + Math.random() * 2500) / 100) * 100;
  const commission = Math.round(revenue * 0.30);
  return {
    id: u.id,
    name: u.name,
    emoji: u.emoji,
    role: u.role,
    monthlyDeals,
    monthlyTarget,
    monthlyRevenue: revenue,
    monthlyCommission: commission,
    callsMade: 150 + i * 20 + Math.round(Math.random() * 50),
    callsAnswered: Math.round((100 + i * 12) * 0.6),
    avgCallDuration: Math.round(95 + Math.random() * 90),
    signaturesCollected: Math.max(0, Math.round(monthlyDeals * 0.8)),
    bdiApprovals: Math.max(0, Math.round(monthlyDeals * 1.3)),
    bdiRejections: Math.max(0, Math.round(monthlyDeals * 0.5)),
    conversionRate: Math.max(5, Math.round(15 + Math.random() * 25)),
    smileyAvg: i % 5 === 0 ? "red" : i % 3 === 0 ? "yellow" : "green",
  };
});

/* Time series for various metrics */
export interface DailyStat {
  date: string;
  count: number;
}

function generateSeries(days: number, base: number, variance: number): DailyStat[] {
  const today = new Date();
  const result: DailyStat[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dow = d.getDay();
    const isWeekend = dow === 5 || dow === 6;
    const factor = isWeekend ? 0.2 : 1;
    const count = Math.max(0, Math.round((base + (Math.random() - 0.5) * variance) * factor));
    result.push({ date: d.toISOString().slice(0, 10), count });
  }
  return result;
}

export const SIGNATURE_SERIES = generateSeries(30, 18, 8);
export const BDI_SERIES = generateSeries(30, 45, 20);
export const CONTRACT_SERIES = generateSeries(30, 22, 10);
export const LENDER_CHECK_SERIES = generateSeries(30, 280, 80);

/* Aggregate stats */
export interface AggStat {
  label: string;
  value: number;
  delta: number; // % vs previous period
  trend: "up" | "down" | "flat";
}

export const SIGNATURE_STATS: AggStat[] = [
  { label: "חתימות החודש", value: SIGNATURE_SERIES.reduce((s, d) => s + d.count, 0), delta: 12, trend: "up" },
  { label: "ממתינות לחתימה", value: 47, delta: -8, trend: "down" },
  { label: "אישור סופי השבוע", value: 23, delta: 18, trend: "up" },
  { label: "סורבו השבוע", value: 5, delta: -23, trend: "down" },
];

export const CHECK_STATS: AggStat[] = [
  { label: "בדיקות BDI החודש", value: BDI_SERIES.reduce((s, d) => s + d.count, 0), delta: 8, trend: "up" },
  { label: "% אישורים", value: 57, delta: 3, trend: "up" },
  { label: "בדיקות גופי מימון", value: LENDER_CHECK_SERIES.reduce((s, d) => s + d.count, 0), delta: 22, trend: "up" },
  { label: "ממתינות לבדיקה", value: 18, delta: -12, trend: "down" },
];
