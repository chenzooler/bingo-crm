"use client";
import * as React from "react";
import { TALK_TIME_LEADERBOARD, formatLiveDuration } from "@/lib/data/live-state";
import { Avatar } from "@/components/ui/Avatar";
import { Crown, Trophy, Medal, Phone, Clock, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function LeaderboardPage() {
  const [period, setPeriod] = React.useState<"today" | "week" | "month">("today");

  // Top 3 special podium
  const top3 = TALK_TIME_LEADERBOARD.slice(0, 3);
  const rest = TALK_TIME_LEADERBOARD.slice(3);

  return (
    <div className="max-w-[1300px] space-y-5">
      <div className="flex items-end justify-between gap-3 flex-wrap">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-bingo-gray-500 mb-1">
            <Crown className="size-3 text-amber-500" /> דירוג ביצועים
          </div>
          <h1 className="text-3xl sm:text-[34px] font-black tracking-tight text-bingo-black leading-none">
            Hall of Fame
            <span className="inline-block size-3 rounded-full bg-bingo-green ml-2 align-middle" />
          </h1>
          <p className="text-sm text-bingo-gray-600 mt-1.5">
            מי דיבר הכי הרבה, מי הביא הכי הרבה איכות
          </p>
        </div>
        <Link href="/call-center" className="h-10 px-4 rounded-xl bg-white border border-bingo-gray-200 text-xs font-bold inline-flex items-center hover:bg-bingo-gray-100">
          חזרה ל-Call Center
        </Link>
      </div>

      <div className="flex items-center gap-1 bg-white border border-bingo-gray-200 rounded-xl p-1 w-fit bingo-shadow-sm">
        {[
          { v: "today" as const, l: "היום" },
          { v: "week" as const, l: "השבוע" },
          { v: "month" as const, l: "החודש" },
        ].map((opt) => (
          <button
            key={opt.v}
            onClick={() => setPeriod(opt.v)}
            className={cn("h-9 px-4 rounded-lg text-[12px] font-bold transition", period === opt.v ? "bg-bingo-black text-white" : "text-bingo-charcoal hover:bg-bingo-gray-100")}
          >
            {opt.l}
          </button>
        ))}
      </div>

      {/* Top 3 Podium */}
      <div className="grid grid-cols-3 gap-3 items-end">
        {/* 2nd */}
        <PodiumCard row={top3[1]} rank={2} height="h-72" />
        {/* 1st */}
        <PodiumCard row={top3[0]} rank={1} height="h-80" />
        {/* 3rd */}
        <PodiumCard row={top3[2]} rank={3} height="h-64" />
      </div>

      {/* Rest of leaderboard */}
      <div className="rounded-3xl bg-white border border-bingo-gray-200 bingo-shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-bingo-gray-100">
          <h2 className="text-base font-extrabold text-bingo-black">הדירוג המלא</h2>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-bingo-gray-50/40">
            <tr className="text-right text-[10px] font-bold uppercase tracking-wider text-bingo-gray-500 border-b border-bingo-gray-100">
              <th className="px-5 py-3 w-12">#</th>
              <th className="px-3 py-3">נציג</th>
              <th className="px-3 py-3"><Clock className="size-3 inline" /> זמן דיבור</th>
              <th className="px-3 py-3"><Phone className="size-3 inline" /> שיחות בוצעו</th>
              <th className="px-3 py-3">שיחות שענו</th>
              <th className="px-3 py-3">% מענה</th>
              <th className="px-3 py-3">משך ממוצע</th>
              <th className="px-3 py-3"><TrendingUp className="size-3 inline" /> ציון איכות</th>
            </tr>
          </thead>
          <tbody>
            {TALK_TIME_LEADERBOARD.map((row) => {
              const answerRate = Math.round((row.agent.todayCallsAnswered / Math.max(1, row.agent.todayCallsMade)) * 100);
              return (
                <tr key={row.agent.id} className="border-b border-bingo-gray-100 last:border-0 hover:bg-bingo-green/[0.03]">
                  <td className="px-5 py-3">
                    <span className={cn("size-8 rounded-lg inline-flex items-center justify-center font-mono tabular-nums font-bold text-sm",
                      row.rank === 1 ? "bg-amber-100 text-amber-700" :
                      row.rank === 2 ? "bg-bingo-gray-200 text-bingo-gray-700" :
                      row.rank === 3 ? "bg-orange-100 text-orange-700" :
                      "bg-bingo-gray-100 text-bingo-gray-600"
                    )}>{row.rank}</span>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2.5">
                      <Avatar name={row.agent.name} emoji={row.agent.emoji} size="md" />
                      <div>
                        <div className="text-[13px] font-extrabold text-bingo-black">{row.agent.name}</div>
                        <div className="text-[10px] text-bingo-gray-500">{row.agent.todayCallsMade} שיחות היום</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-[14px] font-mono tabular-nums font-extrabold text-bingo-green-dark">{formatLiveDuration(row.talkTime)}</td>
                  <td className="px-3 py-3 text-[13px] font-mono tabular-nums font-bold text-bingo-charcoal">{row.callsMade}</td>
                  <td className="px-3 py-3 text-[13px] font-mono tabular-nums text-bingo-charcoal">{row.agent.todayCallsAnswered}</td>
                  <td className="px-3 py-3 min-w-[100px]">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-bingo-gray-100 rounded-full overflow-hidden">
                        <div className={cn("h-full rounded-full", answerRate >= 55 ? "bg-bingo-green-dark" : answerRate >= 35 ? "bg-status-yellow" : "bg-status-orange")} style={{ width: `${answerRate}%` }} />
                      </div>
                      <span className="text-[11px] font-mono tabular-nums font-bold w-9 text-right">{answerRate}%</span>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-[12px] font-mono tabular-nums text-bingo-charcoal">{formatLiveDuration(row.avgDuration)}</td>
                  <td className="px-3 py-3 min-w-[120px]">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-bingo-gray-100 rounded-full overflow-hidden">
                        <div className={cn("h-full rounded-full", row.qualityScore >= 80 ? "bg-bingo-green" : row.qualityScore >= 60 ? "bg-status-yellow" : "bg-status-red")} style={{ width: `${row.qualityScore}%` }} />
                      </div>
                      <span className="text-[11px] font-mono tabular-nums font-bold w-7 text-right">{row.qualityScore}</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PodiumCard({ row, rank, height }: { row: typeof TALK_TIME_LEADERBOARD[0]; rank: 1 | 2 | 3; height: string }) {
  if (!row) return <div className={height} />;
  const config = {
    1: { color: "from-amber-200 to-amber-50 border-amber-400", icon: <Crown className="size-6 text-amber-600" />, badge: "bg-amber-500 text-white" },
    2: { color: "from-bingo-gray-200 to-bingo-gray-50 border-bingo-gray-400", icon: <Trophy className="size-6 text-bingo-gray-600" />, badge: "bg-bingo-gray-500 text-white" },
    3: { color: "from-orange-200 to-orange-50 border-orange-400", icon: <Medal className="size-6 text-orange-600" />, badge: "bg-orange-500 text-white" },
  }[rank];

  return (
    <div className={cn("rounded-3xl bg-gradient-to-b border-2 p-5 flex flex-col items-center justify-end text-center bingo-shadow-lg", config.color, height)}>
      <div className="absolute -mt-32">{config.icon}</div>
      <Avatar name={row.agent.name} emoji={row.agent.emoji} size="lg" className="size-20 text-xl mb-3 ring-4 ring-white shadow-lg" />
      <div className={cn("text-[10px] font-bold uppercase tracking-wider rounded-full px-2 py-0.5 mb-2", config.badge)}>
        #{rank}
      </div>
      <div className="text-[15px] font-black text-bingo-black mb-1">{row.agent.name}</div>
      <div className="text-3xl font-black tabular-nums text-bingo-green-dark mb-1">{formatLiveDuration(row.talkTime)}</div>
      <div className="text-[11px] text-bingo-charcoal">זמן דיבור</div>
      <div className="grid grid-cols-2 gap-2 mt-3 w-full">
        <div className="bg-white/60 rounded-lg p-1.5">
          <div className="text-[9px] uppercase font-bold text-bingo-gray-600">שיחות</div>
          <div className="text-sm font-mono tabular-nums font-bold text-bingo-black">{row.callsMade}</div>
        </div>
        <div className="bg-white/60 rounded-lg p-1.5">
          <div className="text-[9px] uppercase font-bold text-bingo-gray-600">איכות</div>
          <div className="text-sm font-mono tabular-nums font-bold text-bingo-black">{row.qualityScore}</div>
        </div>
      </div>
    </div>
  );
}
