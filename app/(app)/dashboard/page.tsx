"use client";
import * as React from "react";
import Link from "next/link";
import {
  Phone, Target, Banknote, Flame, Trophy, TrendingUp, TrendingDown,
  ChevronLeft, Star, Rocket, ListChecks, MessageCircle, Crown, Gift,
} from "lucide-react";
import { DEALS, AGENT_GOALS, BONUS_TIERS, filterDealsByRange, summarizeDeals, getStreak, type DateRange } from "@/lib/data/performance";
import { TASKS, LEADS } from "@/lib/data/leads";
import { formatNumber, formatCurrency, cn } from "@/lib/utils";

const AGENT_ID = 12394; // חן צולר

/* ============================================================
   DASHBOARD v3 — הבית של הנציג.
   שקט, ברור, כל מספר במקום שלו. שפת המותג: bingoisrael.co.il
   ============================================================ */
export default function DashboardPage() {
  const [range, setRange] = React.useState<DateRange>("month");
  const goal = AGENT_GOALS[AGENT_ID];

  const todayDeals = React.useMemo(() => filterDealsByRange(DEALS, "today"), []);
  const monthDeals = React.useMemo(() => filterDealsByRange(DEALS, "month"), []);
  const monthSummary = React.useMemo(() => summarizeDeals(monthDeals), [monthDeals]);
  const rangeDeals = React.useMemo(() => filterDealsByRange(DEALS, range), [range]);
  const rangeSummary = React.useMemo(() => summarizeDeals(rangeDeals), [rangeDeals]);
  const streak = React.useMemo(() => getStreak(DEALS, goal.dailyDealsTarget), [goal.dailyDealsTarget]);

  const [greeting, setGreeting] = React.useState("שלום");
  const [dateStr, setDateStr] = React.useState("");
  React.useEffect(() => {
    const h = new Date().getHours();
    setGreeting(h < 12 ? "בוקר טוב" : h < 17 ? "צהריים טובים" : "ערב טוב");
    setDateStr(new Date().toLocaleDateString("he-IL", { weekday: "long", day: "numeric", month: "long" }));
  }, []);

  const overdueTasks = TASKS.filter((t) => t.urgent).length;
  const hotLeads = LEADS.slice(0, 5);

  // bonus track
  const nextTier = BONUS_TIERS.find((t) => monthDeals.length < t.threshold) || BONUS_TIERS[BONUS_TIERS.length - 1];
  const prevThreshold = BONUS_TIERS[BONUS_TIERS.indexOf(nextTier) - 1]?.threshold ?? 0;
  const bonusPct = Math.min(100, ((monthDeals.length - prevThreshold) / (nextTier.threshold - prevThreshold)) * 100);

  return (
    <div className="max-w-[1280px] space-y-5">
      {/* ============ GREETING ROW ============ */}
      <div className="flex items-end justify-between gap-4 flex-wrap px-1">
        <div>
          <h1 className="text-[30px] font-bold tracking-tight text-bingo-black leading-tight">
            {greeting}, חן <span className="inline-block b-ball size-3.5 align-baseline" />
          </h1>
          <p className="text-[13px] text-bingo-gray-500 mt-0.5">{dateStr} · יש לך {TASKS.length} משימות היום{overdueTasks > 0 ? `, ${overdueTasks} דחופות` : ""}</p>
        </div>
        <div className="b-segment">
          {([["today", "היום"], ["week", "שבוע"], ["month", "חודש"]] as [DateRange, string][]).map(([v, l]) => (
            <button key={v} data-active={range === v} onClick={() => setRange(v)}>{l}</button>
          ))}
        </div>
      </div>

      {/* ============ KPI ROW ============ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          icon={<Target className="size-5" />} tone="green"
          label="עסקאות היום" value={String(todayDeals.length)} suffix={`/ ${goal.dailyDealsTarget} יעד`}
          pct={(todayDeals.length / goal.dailyDealsTarget) * 100}
          hint={todayDeals.length >= goal.dailyDealsTarget ? "היעד הושג! כל הכבוד 🎉" : `עוד ${goal.dailyDealsTarget - todayDeals.length} להשגת היעד`}
        />
        <KpiCard
          icon={<Trophy className="size-5" />} tone="blue"
          label="עסקאות החודש" value={String(monthDeals.length)} suffix={`/ ${goal.monthlyDealsTarget}`}
          pct={(monthDeals.length / goal.monthlyDealsTarget) * 100}
          hint={`${Math.round((monthDeals.length / goal.monthlyDealsTarget) * 100)}% מהיעד החודשי`}
        />
        <KpiCard
          icon={<Banknote className="size-5" />} tone="green"
          label="עמלה החודש" value={formatCurrency(monthSummary.commission)}
          pct={(monthSummary.commission / (goal.monthlyCommissionTarget * 0.3)) * 100}
          hint={`יעד: ${formatCurrency(goal.monthlyCommissionTarget * 0.3)}`}
        />
        <KpiCard
          icon={<Flame className="size-5" />} tone="orange"
          label="רצף ימים" value={`${streak.current}`} suffix="ימים"
          hint={`השיא שלך: ${streak.longest} ימים`}
        />
      </div>

      {/* ============ MAIN GRID ============ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* ---- MAIN COLUMN ---- */}
        <div className="lg:col-span-2 space-y-5">
          {/* לטיפול עכשיו */}
          <section className="b-card p-5">
            <header className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="b-icon b-icon-red size-10"><Flame className="size-[18px]" /></span>
                <div>
                  <h2 className="text-[17px] font-bold text-bingo-black">לטיפול עכשיו</h2>
                  <p className="text-[12px] text-bingo-gray-500">הלידים החמים ביותר שלך, לפי ציון AI</p>
                </div>
              </div>
              <Link href="/leads" className="text-[13px] font-semibold text-bingo-green-dark hover:underline inline-flex items-center gap-1">
                כל הלידים <ChevronLeft className="size-3.5" />
              </Link>
            </header>

            <div className="divide-y divide-bingo-gray-100">
              {hotLeads.map((lead, i) => (
                <Link key={lead.id} href={`/leads/${lead.id}`} className="flex items-center gap-3 py-3 group hover:bg-bingo-gray-50 -mx-2 px-2 rounded-xl transition">
                  <span className={cn(
                    "size-10 rounded-full flex items-center justify-center text-[15px] font-bold shrink-0",
                    i === 0 ? "bg-bingo-green text-bingo-black" : "bg-bingo-gray-100 text-bingo-gray-600"
                  )}>
                    {lead.fullName.charAt(0)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[14px] font-semibold text-bingo-black truncate">{lead.fullName}</span>
                      <span className="b-chip b-chip-green tabular-nums text-[11px] py-0.5 px-2">
                        <Star className="size-3 fill-current" /> {92 - i * 5}
                      </span>
                    </div>
                    <div className="text-[12px] text-bingo-gray-500 tabular-nums">
                      {lead.amountRequested ? formatCurrency(lead.amountRequested) : "—"} · {lead.phone || "אין טלפון"}
                    </div>
                  </div>
                  <button
                    className="size-10 rounded-full bg-bingo-gray-100 text-bingo-gray-600 group-hover:bg-bingo-green group-hover:text-bingo-black flex items-center justify-center transition shrink-0"
                    aria-label={`חייג ל${lead.fullName}`}
                    onClick={(e) => e.preventDefault()}
                  >
                    <Phone className="size-4" />
                  </button>
                </Link>
              ))}
            </div>
          </section>

          {/* ביצועים בטווח */}
          <section className="b-card p-5">
            <header className="flex items-center gap-3 mb-4">
              <span className="b-icon b-icon-blue size-10"><TrendingUp className="size-[18px]" /></span>
              <div>
                <h2 className="text-[17px] font-bold text-bingo-black">
                  ביצועים — {range === "today" ? "היום" : range === "7d" ? "השבוע" : "החודש"}
                </h2>
                <p className="text-[12px] text-bingo-gray-500">כל המספרים שלך בטווח שבחרת</p>
              </div>
            </header>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <MiniStat label="עסקאות" value={formatNumber(rangeSummary.count)} delta={12.4} />
              <MiniStat label="היקף הלוואות" value={formatCurrency(rangeSummary.loanVolume)} delta={8.7} />
              <MiniStat label="שכר טרחה" value={formatCurrency(rangeSummary.revenue)} delta={-2.3} />
              <MiniStat label="עמלה שלי" value={formatCurrency(rangeSummary.commission)} delta={18.2} highlight />
            </div>
          </section>
        </div>

        {/* ---- SIDE COLUMN ---- */}
        <div className="space-y-5">
          {/* מסלול בונוס */}
          <section className="b-card p-5">
            <header className="flex items-center gap-3 mb-4">
              <span className="b-icon b-icon-green size-10"><Gift className="size-[18px]" /></span>
              <div>
                <h2 className="text-[15px] font-bold text-bingo-black">מסלול הבונוס</h2>
                <p className="text-[12px] text-bingo-gray-500">בונוס {nextTier.label}: {formatCurrency(nextTier.bonus)}</p>
              </div>
            </header>
            <div className="flex items-baseline justify-between mb-2">
              <span className="text-[24px] font-bold text-bingo-black tabular-nums">{monthDeals.length}</span>
              <span className="text-[13px] text-bingo-gray-500 tabular-nums">/ {nextTier.threshold} עסקאות</span>
            </div>
            <div className="b-progress mb-2"><div style={{ width: `${bonusPct}%` }} /></div>
            <p className="text-[12px] text-bingo-gray-500">
              עוד <b className="text-bingo-black">{Math.max(0, nextTier.threshold - monthDeals.length)}</b> עסקאות לבונוס של <b className="text-bingo-green-dark">{formatCurrency(nextTier.bonus)}</b>
            </p>
          </section>

          {/* מצטייני היום */}
          <section className="b-card p-5">
            <header className="flex items-center gap-3 mb-3">
              <span className="b-icon b-icon-orange size-10"><Crown className="size-[18px]" /></span>
              <h2 className="text-[15px] font-bold text-bingo-black">מצטייני היום</h2>
            </header>
            <div className="space-y-1">
              {[
                { name: "אריאל פרגן", deals: 4, medal: "🥇" },
                { name: "ניסן מליחי", deals: 3, medal: "🥈" },
                { name: "חן צולר (אתה)", deals: todayDeals.length, medal: "🥉", me: true },
              ].map((a) => (
                <div key={a.name} className={cn(
                  "flex items-center gap-2.5 py-2 px-2.5 rounded-xl",
                  a.me && "bg-bingo-green-light/60"
                )}>
                  <span className="text-[16px]">{a.medal}</span>
                  <span className={cn("flex-1 text-[13px] font-semibold truncate", a.me ? "text-bingo-green-deep" : "text-bingo-black")}>{a.name}</span>
                  <span className="text-[14px] font-bold tabular-nums text-bingo-black">{a.deals}</span>
                </div>
              ))}
            </div>
            <Link href="/wallboard" className="mt-3 b-pill b-pill-ghost b-pill-sm w-full">
              למסך החי המלא
            </Link>
          </section>

          {/* פעולות מהירות */}
          <section className="b-card p-5">
            <h2 className="text-[15px] font-bold text-bingo-black mb-3">פעולות מהירות</h2>
            <div className="grid grid-cols-2 gap-2">
              <QuickAction href="/dialer/cockpit" icon={<Rocket className="size-4" />} label="תותח שיחות" primary />
              <QuickAction href="/tasks" icon={<ListChecks className="size-4" />} label="משימות" />
              <QuickAction href="/leads?status=u-callback" icon={<Phone className="size-4" />} label="פולואפים" />
              <QuickAction href="/inbox" icon={<MessageCircle className="size-4" />} label="הודעות" />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

/* ============ KPI CARD ============ */
function KpiCard({ icon, tone, label, value, suffix, pct, hint }: {
  icon: React.ReactNode;
  tone: "green" | "blue" | "orange" | "red";
  label: string;
  value: string;
  suffix?: string;
  pct?: number;
  hint?: string;
}) {
  const iconClass = { green: "b-icon-green", blue: "b-icon-blue", orange: "b-icon-orange", red: "b-icon-red" }[tone];
  return (
    <div className="b-card b-card-hover p-5">
      <div className="flex items-center justify-between mb-3">
        <span className={cn("b-icon size-11", iconClass)}>{icon}</span>
        {pct !== undefined && pct >= 100 && <span className="b-chip b-chip-green text-[11px]">הושג ✓</span>}
      </div>
      <div className="b-eyebrow mb-1">{label}</div>
      <div className="flex items-baseline gap-1.5">
        <span className="b-stat text-[28px] leading-none">{value}</span>
        {suffix && <span className="text-[13px] text-bingo-gray-400 font-medium tabular-nums">{suffix}</span>}
      </div>
      {pct !== undefined && (
        <div className="b-progress mt-3"><div style={{ width: `${Math.min(100, pct)}%` }} /></div>
      )}
      {hint && <p className="text-[11px] text-bingo-gray-500 mt-2">{hint}</p>}
    </div>
  );
}

/* ============ MINI STAT ============ */
function MiniStat({ label, value, delta, highlight }: { label: string; value: string; delta?: number; highlight?: boolean }) {
  return (
    <div className={cn("rounded-2xl p-3.5 border", highlight ? "bg-bingo-green-light/50 border-bingo-green/25" : "bg-bingo-gray-50 border-bingo-gray-150")}>
      <div className="text-[11px] font-semibold text-bingo-gray-500 mb-1">{label}</div>
      <div className="text-[18px] font-bold text-bingo-black tabular-nums leading-tight">{value}</div>
      {delta !== undefined && (
        <div className={cn("inline-flex items-center gap-0.5 text-[11px] font-semibold tabular-nums mt-1", delta >= 0 ? "text-bingo-green-dark" : "text-status-red")}>
          {delta >= 0 ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
          {Math.abs(delta).toFixed(1)}%
        </div>
      )}
    </div>
  );
}

/* ============ QUICK ACTION ============ */
function QuickAction({ href, icon, label, primary }: { href: string; icon: React.ReactNode; label: string; primary?: boolean }) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-2 h-11 px-3.5 rounded-full text-[13px] font-semibold transition",
        primary
          ? "bg-bingo-black text-white hover:bg-bingo-charcoal"
          : "bg-bingo-gray-100 text-bingo-charcoal hover:bg-bingo-gray-150"
      )}
    >
      <span className={cn(primary && "text-bingo-green")}>{icon}</span>
      <span className="truncate">{label}</span>
    </Link>
  );
}
