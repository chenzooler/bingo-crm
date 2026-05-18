"use client";
import * as React from "react";
import Link from "next/link";
import { Trophy, Flame, Phone, MessageCircle, ChevronLeft, Sparkles } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { BingoBall } from "@/components/icons/ServiceIcons";
import { formatCurrency, formatNumber, cn } from "@/lib/utils";
import { getMotivationalMessage } from "@/lib/data/performance";

export function PerformanceHero({
  agentName,
  agentEmoji,
  dealsToday,
  dailyTarget,
  monthlyDeals,
  monthlyTarget,
  monthlyCommission,
  monthlyCommissionTarget,
  streak,
}: {
  agentName: string;
  agentEmoji?: string;
  dealsToday: number;
  dailyTarget: number;
  monthlyDeals: number;
  monthlyTarget: number;
  monthlyCommission: number;
  monthlyCommissionTarget: number;
  streak: number;
}) {
  const dayPct = Math.min(100, (dealsToday / dailyTarget) * 100);
  const monthPct = Math.min(100, (monthlyDeals / monthlyTarget) * 100);
  const commissionPct = Math.min(100, (monthlyCommission / monthlyCommissionTarget) * 100);
  const remainingToday = Math.max(0, dailyTarget - dealsToday);

  const msg = getMotivationalMessage({ dealsToday, dailyTarget, monthlyDeals, monthlyTarget, streak });
  const toneClass = {
    celebration: "from-bingo-green/20 to-bingo-green/5 border-bingo-green/40 text-bingo-green-dark",
    encouragement: "from-status-blue/12 to-status-blue/3 border-status-blue/30 text-status-blue",
    push: "from-status-orange/12 to-status-orange/3 border-status-orange/30 text-orange-700",
    calm: "from-bingo-gray-100 to-white border-bingo-gray-200 text-bingo-charcoal",
  }[msg.tone];

  const now = new Date();
  const greeting =
    now.getHours() < 12 ? "בוקר טוב" : now.getHours() < 17 ? "צהריים טובים" : "ערב טוב";

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-bl from-bingo-onyx via-bingo-charcoal to-[#0E1A0E] text-white p-5 sm:p-8 bingo-shadow-lg">
      <div className="absolute -top-8 -left-8 size-44 opacity-25 pointer-events-none"><BingoBall size={176} /></div>
      <div className="absolute top-1/3 -left-4 size-24 opacity-15 pointer-events-none"><BingoBall size={96} /></div>

      <div className="relative">
        <div className="flex items-center gap-3 mb-1.5">
          <Avatar name={agentName} emoji={agentEmoji} size="lg" />
          <div>
            <div className="text-[12px] uppercase tracking-wider text-bingo-green font-bold">{greeting}</div>
            <h1 className="text-2xl sm:text-3xl font-black leading-none">{agentName}</h1>
          </div>
          {streak >= 2 && (
            <div className="mr-auto inline-flex items-center gap-1.5 bg-status-orange/20 backdrop-blur border border-status-orange/40 rounded-full px-3 py-1.5">
              <Flame className="size-4 text-status-orange" />
              <span className="text-xs font-extrabold">רצף {streak} ימים</span>
            </div>
          )}
        </div>

        {/* Motivational nudge */}
        <div className={cn("mt-4 rounded-2xl border bg-gradient-to-bl backdrop-blur-sm p-3 sm:p-3.5 inline-flex items-center gap-2", toneClass)}>
          <Sparkles className="size-4 shrink-0" />
          <span className="text-[13px] font-extrabold">{msg.text}</span>
        </div>

        {/* Triple progress */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-5">
          <ProgressTile
            label="היום"
            current={dealsToday}
            target={dailyTarget}
            unit="עסקאות"
            pct={dayPct}
            color="bingo"
            sub={remainingToday > 0 ? `עוד ${remainingToday} ליעד יומי` : `+${dealsToday - dailyTarget} מעל היעד`}
          />
          <ProgressTile
            label="החודש"
            current={monthlyDeals}
            target={monthlyTarget}
            unit="עסקאות"
            pct={monthPct}
            color="blue"
            sub={`${Math.max(0, monthlyTarget - monthlyDeals)} ליעד החודשי`}
          />
          <ProgressTile
            label="עמלות החודש"
            current={Math.round(monthlyCommission)}
            target={monthlyCommissionTarget}
            unit="₪"
            pct={commissionPct}
            color="orange"
            sub={`${Math.round(commissionPct)}% מהיעד הכספי`}
            currency
          />
        </div>

        {/* Quick actions */}
        <div className="flex items-center gap-2 mt-5 flex-wrap">
          <Link
            href="/dialer"
            className="h-10 px-4 rounded-xl bg-bingo-green hover:bg-bingo-green-bright text-bingo-black text-[13px] font-extrabold inline-flex items-center gap-1.5 transition"
          >
            <Phone className="size-4" />
            תותח שיחות
            <ChevronLeft className="size-3.5" />
          </Link>
          <Link
            href="/leads?status=g-approved-final"
            className="h-10 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white text-[13px] font-bold inline-flex items-center gap-1.5 transition backdrop-blur"
          >
            <Trophy className="size-4" />
            שיחות סגירה
          </Link>
          <Link
            href="/leads?status=u-callback"
            className="h-10 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white text-[13px] font-bold inline-flex items-center gap-1.5 transition backdrop-blur"
          >
            <MessageCircle className="size-4" />
            פולואפים
          </Link>
        </div>
      </div>
    </div>
  );
}

function ProgressTile({
  label,
  current,
  target,
  unit,
  pct,
  color,
  sub,
  currency,
}: {
  label: string;
  current: number;
  target: number;
  unit: string;
  pct: number;
  color: "bingo" | "blue" | "orange";
  sub?: string;
  currency?: boolean;
}) {
  const colorClass = {
    bingo: "bg-bingo-green text-bingo-black",
    blue: "bg-status-blue text-white",
    orange: "bg-status-orange text-white",
  }[color];
  const barClass = {
    bingo: "bg-gradient-to-l from-bingo-green-dark via-bingo-green to-bingo-green-bright",
    blue: "bg-gradient-to-l from-blue-700 to-status-blue",
    orange: "bg-gradient-to-l from-orange-600 to-status-orange",
  }[color];

  return (
    <div className="bg-white/8 backdrop-blur rounded-2xl border border-white/10 p-3.5">
      <div className="flex items-baseline justify-between mb-1">
        <span className="text-[10px] font-bold uppercase tracking-wider opacity-70">{label}</span>
        <span className="text-[10px] font-mono tabular-nums opacity-60">{Math.round(pct)}%</span>
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className="text-3xl font-black tabular-nums">
          {currency ? formatCurrency(current) : formatNumber(current)}
        </span>
        <span className="text-sm font-bold opacity-60">
          {currency ? "" : unit} / {currency ? formatCurrency(target) : `${formatNumber(target)} ${unit}`}
        </span>
      </div>
      <div className="mt-2.5 h-1.5 bg-white/10 rounded-full overflow-hidden">
        <div className={cn("h-full rounded-full transition-all duration-700", barClass)} style={{ width: `${pct}%` }} />
      </div>
      {sub && <div className="text-[11px] mt-1.5 opacity-70 font-medium">{sub}</div>}
    </div>
  );
}
