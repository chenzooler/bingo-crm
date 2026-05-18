"use client";
import * as React from "react";
import Link from "next/link";
import { PerformanceHero } from "@/components/dashboard/PerformanceHero";
import { BonusTrack } from "@/components/dashboard/BonusTrack";
import { DealsList } from "@/components/dashboard/DealsList";
import { ActivityHeatmap } from "@/components/dashboard/ActivityHeatmap";
import { DateRangePicker } from "@/components/dashboard/DateRangePicker";
import { Phone, MessageCircle, ListChecks, BarChart3 } from "lucide-react";
import { DEALS, AGENT_GOALS, filterDealsByRange, summarizeDeals, getStreak, type DateRange } from "@/lib/data/performance";
import { TASKS } from "@/lib/data/leads";
import { formatNumber, formatCurrency } from "@/lib/utils";

const AGENT_ID = 12394; // chen zooler - mocked

export default function DashboardPage() {
  const [range, setRange] = React.useState<DateRange>("month");
  const goal = AGENT_GOALS[AGENT_ID];

  const filtered = React.useMemo(() => filterDealsByRange(DEALS, range), [range]);
  const summary = React.useMemo(() => summarizeDeals(filtered), [filtered]);

  // Today & month metrics (always)
  const todayDeals = React.useMemo(() => filterDealsByRange(DEALS, "today"), []);
  const monthDeals = React.useMemo(() => filterDealsByRange(DEALS, "month"), []);
  const monthSummary = React.useMemo(() => summarizeDeals(monthDeals), [monthDeals]);
  const streak = React.useMemo(() => getStreak(DEALS, goal.dailyDealsTarget), [goal.dailyDealsTarget]);
  const overdueTasks = TASKS.filter((t) => t.urgent).length;

  return (
    <div className="space-y-4 max-w-[1400px]">
      <PerformanceHero
        agentName="חן צולר"
        agentEmoji="💼"
        dealsToday={todayDeals.length}
        dailyTarget={goal.dailyDealsTarget}
        monthlyDeals={monthDeals.length}
        monthlyTarget={goal.monthlyDealsTarget}
        monthlyCommission={monthSummary.commission}
        monthlyCommissionTarget={goal.monthlyCommissionTarget * 0.30}
        streak={streak.current}
      />

      <BonusTrack monthlyDeals={monthDeals.length} />

      <div className="flex items-center justify-between gap-3 flex-wrap pt-2">
        <h2 className="text-xl font-extrabold text-bingo-black inline-flex items-center gap-2">
          <BarChart3 className="size-5" />
          ביצועים בטווח
        </h2>
        <DateRangePicker value={range} onChange={setRange} />
      </div>

      {/* Period KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Kpi label="עסקאות" value={formatNumber(summary.count)} accent="bingo" />
        <Kpi label="היקף הלוואות" value={formatCurrency(summary.loanVolume)} accent="blue" />
        <Kpi label="שכר טרחה (הכנסה)" value={formatCurrency(summary.revenue)} accent="orange" />
        <Kpi label="עמלה שלי" value={formatCurrency(summary.commission)} accent="green" highlight />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <div className="lg:col-span-2">
          <DealsList deals={filtered} />
        </div>
        <div className="space-y-3">
          <ActivityHeatmap deals={DEALS} dailyTarget={goal.dailyDealsTarget} />
          <QuickStats todayCount={todayDeals.length} dailyTarget={goal.dailyDealsTarget} overdueTasks={overdueTasks} streak={streak.current} longestStreak={streak.longest} />
          <QuickActions />
        </div>
      </div>
    </div>
  );
}

function Kpi({ label, value, accent, highlight }: { label: string; value: string; accent: "bingo" | "blue" | "orange" | "green"; highlight?: boolean }) {
  const palette = {
    bingo: "from-bingo-green/15 to-bingo-green/5 border-bingo-green/40",
    blue: "from-status-blue/12 to-status-blue/3 border-status-blue/25",
    orange: "from-status-orange/12 to-status-orange/3 border-status-orange/25",
    green: "from-bingo-green/20 to-bingo-green/8 border-bingo-green/50",
  }[accent];
  return (
    <div className={`rounded-2xl bg-gradient-to-bl ${palette} border p-4 ${highlight ? "bingo-glow-soft" : ""}`}>
      <div className="text-[10px] font-bold uppercase tracking-wider text-bingo-gray-600">{label}</div>
      <div className="text-2xl sm:text-3xl font-black text-bingo-black tabular-nums mt-1 leading-none">{value}</div>
    </div>
  );
}

function QuickStats({ todayCount, dailyTarget, overdueTasks, streak, longestStreak }: { todayCount: number; dailyTarget: number; overdueTasks: number; streak: number; longestStreak: number }) {
  return (
    <div className="rounded-3xl bg-white border border-bingo-gray-200 bingo-shadow-sm p-5">
      <h3 className="text-sm font-extrabold text-bingo-black mb-3">סטטוס מהיר</h3>
      <div className="space-y-2.5">
        <StatRow label="היעד היומי" value={`${todayCount}/${dailyTarget}`} status={todayCount >= dailyTarget ? "good" : todayCount === 0 ? "bad" : "warn"} />
        <StatRow label="משימות באיחור" value={`${overdueTasks}`} status={overdueTasks === 0 ? "good" : overdueTasks > 2 ? "bad" : "warn"} />
        <StatRow label="רצף ימים" value={`${streak} ימים`} status={streak >= 3 ? "good" : streak >= 1 ? "warn" : "bad"} />
        <StatRow label="רצף הכי ארוך" value={`${longestStreak} ימים`} status="info" />
      </div>
    </div>
  );
}

function StatRow({ label, value, status }: { label: string; value: string; status: "good" | "warn" | "bad" | "info" }) {
  const dot = {
    good: "bg-bingo-green",
    warn: "bg-status-yellow",
    bad: "bg-status-red",
    info: "bg-status-blue",
  }[status];
  return (
    <div className="flex items-center justify-between">
      <span className="text-[12px] text-bingo-charcoal font-medium inline-flex items-center gap-2">
        <span className={`size-1.5 rounded-full ${dot}`} />
        {label}
      </span>
      <span className="text-[13px] font-extrabold text-bingo-black tabular-nums">{value}</span>
    </div>
  );
}

function QuickActions() {
  return (
    <div className="rounded-3xl bg-white border border-bingo-gray-200 bingo-shadow-sm p-5">
      <h3 className="text-sm font-extrabold text-bingo-black mb-3">קיצורי דרך</h3>
      <div className="grid grid-cols-2 gap-2">
        <ActionBtn href="/dialer" icon={<Phone className="size-4" />} label="תותח שיחות" />
        <ActionBtn href="/leads?status=u-callback" icon={<MessageCircle className="size-4" />} label="פולואפים" />
        <ActionBtn href="/leads?status=g-approved-final" icon={<MessageCircle className="size-4" />} label="שיחות סגירה" />
        <ActionBtn href="/tasks" icon={<ListChecks className="size-4" />} label="המשימות שלי" />
      </div>
    </div>
  );
}

function ActionBtn({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link href={href} className="inline-flex items-center gap-1.5 h-10 px-3 rounded-xl bg-bingo-gray-100 hover:bg-bingo-green hover:text-bingo-black text-bingo-charcoal text-[12px] font-bold transition">
      {icon}
      <span className="truncate">{label}</span>
    </Link>
  );
}
