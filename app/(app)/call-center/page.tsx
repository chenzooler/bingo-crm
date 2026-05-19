"use client";
import * as React from "react";
import Link from "next/link";
import { LIVE_AGENTS, TALK_TIME_LEADERBOARD, getStatusMeta, formatLiveDuration, type AgentStatus } from "@/lib/data/live-state";
import { Avatar } from "@/components/ui/Avatar";
import { Phone, PhoneIncoming, PhoneOff, Mic, MicOff, Users, Headphones, MessageCircleQuestion, Crown, Coffee, Cigarette, Salad, BookOpen, Calendar, Eye, Volume2, UserX } from "lucide-react";
import { cn, formatTime } from "@/lib/utils";

/**
 * Live Manager Call Center - the war room.
 * Shows every agent's status in real-time, lets manager listen/whisper/barge.
 */
export default function CallCenterPage() {
  const onCallCount = LIVE_AGENTS.filter((a) => a.status === "on-call").length;
  const availableCount = LIVE_AGENTS.filter((a) => a.status === "available").length;
  const onBreakCount = LIVE_AGENTS.filter((a) => getStatusMeta(a.status).isBreak).length;
  const totalCallsToday = LIVE_AGENTS.reduce((s, a) => s + a.todayCallsMade, 0);

  return (
    <div className="max-w-[1600px] space-y-4">
      <div className="flex items-end justify-between gap-3 flex-wrap">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-bingo-gray-500 mb-1">
            <span className="size-2 rounded-full bg-status-red animate-pulse" />
            Live Call Center · Manager War Room
          </div>
          <h1 className="text-3xl sm:text-[34px] font-black tracking-tight text-bingo-black leading-none">
            מרכזיה חיה
            <span className="inline-block size-3 rounded-full bg-bingo-green ml-2 align-middle" />
          </h1>
          <p className="text-sm text-bingo-gray-600 mt-1.5">
            כל המוקד בזמן אמת - שיחות פעילות, סטטוסים, ביצועים
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/dialer" className="h-10 px-4 rounded-xl bg-white border border-bingo-gray-200 text-xs font-bold inline-flex items-center gap-1.5 hover:bg-bingo-gray-100">
            תותח שיחות
          </Link>
          <Link href="/call-center/leaderboard" className="h-10 px-4 rounded-xl bg-bingo-black text-white text-xs font-bold inline-flex items-center gap-1.5 hover:bg-bingo-charcoal">
            <Crown className="size-4" /> Leaderboard
          </Link>
        </div>
      </div>

      {/* Quick KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <KpiCard icon={<Phone className="size-4" />} label="בשיחה כעת" value={onCallCount.toString()} accent="green" highlight />
        <KpiCard icon={<Users className="size-4" />} label="פנויים" value={availableCount.toString()} accent="blue" />
        <KpiCard icon={<Coffee className="size-4" />} label="בהפסקה" value={onBreakCount.toString()} accent="orange" />
        <KpiCard icon={<Phone className="size-4" />} label="שיחות היום" value={totalCallsToday.toString()} accent="purple" />
        <KpiCard icon={<PhoneIncoming className="size-4" />} label="שיחות נכנסות בהמתנה" value="3" accent="red" />
      </div>

      {/* Pool dialer status */}
      <div className="rounded-3xl bg-gradient-to-bl from-bingo-onyx to-bingo-charcoal text-white p-5">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-bingo-green font-bold mb-1 inline-flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-bingo-green animate-pulse" />
              Smart Pool Dialer פעיל
            </div>
            <h2 className="text-2xl font-black">7 שיחות בהקבלה</h2>
            <p className="text-[12px] opacity-70 mt-1">12 מספרים פעילים · 234 לידים בתור · ממוצע ענייה: 28%</p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <PoolMetric label="חויגו" value="312" />
            <PoolMetric label="ענו" value="87" />
            <PoolMetric label="ניתב לנציג" value="74" />
          </div>
        </div>
      </div>

      {/* Agents grid */}
      <div className="rounded-3xl bg-white border border-bingo-gray-200 bingo-shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-bingo-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-bingo-black inline-flex items-center gap-2">
            <Users className="size-5" />
            הצוות בזמן אמת ({LIVE_AGENTS.length})
          </h2>
          <div className="flex items-center gap-1.5 text-[10px] font-bold">
            <span className="inline-flex items-center gap-1">
              <span className="size-2 rounded-full bg-bingo-green" /> פנוי
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="size-2 rounded-full bg-status-blue animate-pulse" /> שיחה
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="size-2 rounded-full bg-status-orange" /> הפסקה
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 p-3">
          {LIVE_AGENTS.map((a) => (
            <AgentLiveCard key={a.id} agent={a} />
          ))}
        </div>
      </div>

      {/* Talk time leaderboard preview */}
      <div className="rounded-3xl bg-white border border-bingo-gray-200 bingo-shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-bingo-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-bingo-black inline-flex items-center gap-2">
            <Crown className="size-5 text-amber-500" />
            Top Talkers היום
          </h2>
          <Link href="/call-center/leaderboard" className="text-[12px] font-bold text-bingo-green-dark hover:underline">
            דירוג מלא ←
          </Link>
        </div>

        <table className="w-full text-sm">
          <thead className="bg-bingo-gray-50/40">
            <tr className="text-right text-[10px] font-bold uppercase tracking-wider text-bingo-gray-500 border-b border-bingo-gray-100">
              <th className="px-5 py-2.5 w-12">#</th>
              <th className="px-3 py-2.5">נציג</th>
              <th className="px-3 py-2.5">זמן דיבור היום</th>
              <th className="px-3 py-2.5">שיחות</th>
              <th className="px-3 py-2.5">ממוצע</th>
              <th className="px-3 py-2.5">איכות</th>
            </tr>
          </thead>
          <tbody>
            {TALK_TIME_LEADERBOARD.slice(0, 5).map((row) => (
              <tr key={row.agent.id} className="border-b border-bingo-gray-100 last:border-0 hover:bg-bingo-green/[0.03]">
                <td className="px-5 py-2.5">
                  <span className={cn("size-7 rounded-md inline-flex items-center justify-center font-mono tabular-nums font-bold text-xs",
                    row.rank === 1 ? "bg-amber-100 text-amber-700" :
                    row.rank === 2 ? "bg-bingo-gray-200 text-bingo-gray-700" :
                    row.rank === 3 ? "bg-orange-100 text-orange-700" :
                    "bg-bingo-gray-100 text-bingo-gray-600"
                  )}>{row.rank}</span>
                </td>
                <td className="px-3 py-2.5">
                  <div className="flex items-center gap-2.5">
                    <Avatar name={row.agent.name} emoji={row.agent.emoji} size="sm" />
                    <span className="text-[13px] font-bold text-bingo-black">{row.agent.name}</span>
                  </div>
                </td>
                <td className="px-3 py-2.5 text-[13px] font-mono tabular-nums font-extrabold text-bingo-green-dark">{formatLiveDuration(row.talkTime)}</td>
                <td className="px-3 py-2.5 text-[12px] font-mono tabular-nums text-bingo-charcoal">{row.callsMade}</td>
                <td className="px-3 py-2.5 text-[11px] font-mono tabular-nums text-bingo-gray-600">{formatLiveDuration(row.avgDuration)}</td>
                <td className="px-3 py-2.5">
                  <div className="flex items-center gap-1.5">
                    <div className="w-16 h-1.5 bg-bingo-gray-100 rounded-full overflow-hidden">
                      <div className={cn("h-full rounded-full", row.qualityScore >= 80 ? "bg-bingo-green" : row.qualityScore >= 60 ? "bg-status-yellow" : "bg-status-red")} style={{ width: `${row.qualityScore}%` }} />
                    </div>
                    <span className="text-[11px] font-mono tabular-nums font-bold text-bingo-charcoal">{row.qualityScore}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function KpiCard({ icon, label, value, accent, highlight }: { icon: React.ReactNode; label: string; value: string; accent: "green" | "blue" | "orange" | "purple" | "red"; highlight?: boolean }) {
  const palette = {
    green: "from-bingo-green/15 to-bingo-green/5 border-bingo-green/40 text-bingo-green-dark",
    blue: "from-status-blue/12 to-status-blue/3 border-status-blue/25 text-status-blue",
    orange: "from-status-orange/12 to-status-orange/3 border-status-orange/25 text-orange-700",
    purple: "from-status-purple/12 to-status-purple/3 border-status-purple/25 text-status-purple",
    red: "from-status-red/12 to-status-red/3 border-status-red/25 text-status-red",
  }[accent];
  return (
    <div className={cn(`rounded-2xl bg-gradient-to-bl border p-4 ${palette}`, highlight && "bingo-glow-soft")}>
      <div className="size-9 rounded-xl bg-white/60 inline-flex items-center justify-center">{icon}</div>
      <div className="text-3xl font-black text-bingo-black tabular-nums leading-none mt-2">{value}</div>
      <div className="text-[11px] font-bold mt-1">{label}</div>
    </div>
  );
}

function PoolMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white/10 backdrop-blur rounded-xl px-3 py-2">
      <div className="text-[10px] uppercase tracking-wider opacity-60">{label}</div>
      <div className="text-xl font-black tabular-nums">{value}</div>
    </div>
  );
}

function AgentLiveCard({ agent }: { agent: typeof LIVE_AGENTS[0] }) {
  const meta = getStatusMeta(agent.status);
  const since = new Date(agent.statusSince).getTime();
  const now = Date.now();
  const duration = Math.floor((now - since) / 1000);

  const ringColor = {
    green: "ring-bingo-green",
    blue: "ring-status-blue animate-pulse",
    orange: "ring-status-orange",
    yellow: "ring-status-yellow",
    purple: "ring-status-purple",
    gray: "ring-bingo-gray-300",
  }[meta.color];

  const bgColor = {
    green: "bg-bingo-green/8",
    blue: "bg-status-blue/8",
    orange: "bg-status-orange/8",
    yellow: "bg-status-yellow/15",
    purple: "bg-status-purple/8",
    gray: "bg-bingo-gray-50",
  }[meta.color];

  return (
    <div className={cn("rounded-2xl border-2 p-3.5", bgColor, ringColor.replace("ring-", "border-"))}>
      <div className="flex items-start gap-3">
        <div className="relative shrink-0">
          <Avatar name={agent.name} emoji={agent.emoji} size="md" className={cn("ring-2", ringColor)} />
          <span className="absolute -bottom-0.5 -right-0.5 text-base leading-none">{meta.emoji}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[13px] font-extrabold text-bingo-black truncate">{agent.name}</div>
          <div className="text-[11px] font-bold text-bingo-charcoal mt-0.5 flex items-center gap-1.5">
            <span>{meta.label}</span>
            <span className="text-bingo-gray-500">·</span>
            <span className="font-mono tabular-nums">{formatLiveDuration(duration)}</span>
          </div>
          {agent.status === "on-call" && agent.currentCallLeadName && (
            <div className="text-[11px] text-bingo-charcoal mt-1 truncate">
              עם <strong>{agent.currentCallLeadName}</strong>
            </div>
          )}
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-1.5 mt-3 pt-3 border-t border-bingo-gray-100">
        <Stat label="שיחות" value={agent.todayCallsMade.toString()} />
        <Stat label="זמן דיבור" value={formatLiveDuration(agent.todayTotalTalkTime)} />
        <Stat label="איכות" value={`${agent.todayAvgQualityScore}`} />
      </div>

      {/* Manager controls - only show when on-call */}
      {agent.status === "on-call" && (
        <div className="grid grid-cols-4 gap-1 mt-2">
          <button title="האזנה - הלקוח/נציג לא ידעו" className="h-8 rounded-lg bg-bingo-gray-100 hover:bg-status-blue hover:text-white text-bingo-charcoal text-[10px] font-bold inline-flex items-center justify-center transition">
            <Eye className="size-3" />
          </button>
          <button title="לחישה לאוזן הנציג" className="h-8 rounded-lg bg-bingo-gray-100 hover:bg-status-purple hover:text-white text-bingo-charcoal text-[10px] font-bold inline-flex items-center justify-center transition">
            <Volume2 className="size-3" />
          </button>
          <button title="הצטרפות לשיחה (3-way)" className="h-8 rounded-lg bg-bingo-gray-100 hover:bg-bingo-green hover:text-bingo-black text-bingo-charcoal text-[10px] font-bold inline-flex items-center justify-center transition">
            <MessageCircleQuestion className="size-3" />
          </button>
          <button title="גנוב שיחה - הנציג ייפול" className="h-8 rounded-lg bg-bingo-gray-100 hover:bg-status-red hover:text-white text-bingo-charcoal text-[10px] font-bold inline-flex items-center justify-center transition">
            <UserX className="size-3" />
          </button>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <div className="text-[9px] uppercase tracking-wider text-bingo-gray-500 font-bold">{label}</div>
      <div className="text-[12px] font-mono tabular-nums font-extrabold text-bingo-black">{value}</div>
    </div>
  );
}
