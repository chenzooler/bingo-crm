"use client";
import * as React from "react";
import { Trophy, Flame, TrendingUp, Phone, Crown, Target, Banknote, Zap, Rocket, Star, Award, Sparkles } from "lucide-react";
import { Icon3D } from "@/components/ui/Icon3D";
import { Confetti } from "@/components/ui/Confetti";
import { cn, formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

// Mock team data — would come from real-time API in production
const AGENTS = [
  { id: 1, name: "אריאל פרגן",  emoji: "💼", deals: 8, revenue: 248000, calls: 47, streak: 6 },
  { id: 2, name: "ניסן מליחי",  emoji: "🔥", deals: 7, revenue: 215000, calls: 52, streak: 4 },
  { id: 3, name: "שירה לוי",    emoji: "💎", deals: 6, revenue: 190000, calls: 41, streak: 3 },
  { id: 4, name: "דנה ברק",     emoji: "🚀", deals: 5, revenue: 155000, calls: 38, streak: 2 },
  { id: 5, name: "חן צולר",     emoji: "⚡", deals: 4, revenue: 132000, calls: 35, streak: 5 },
  { id: 6, name: "משה יונה",    emoji: "🎯", deals: 4, revenue: 118000, calls: 29, streak: 1 },
  { id: 7, name: "יוסי כהן",    emoji: "🏆", deals: 3, revenue:  98000, calls: 31, streak: 1 },
  { id: 8, name: "ליאת אדרי",   emoji: "✨", deals: 3, revenue:  85000, calls: 26, streak: 2 },
];

const LIVE_FEED = [
  { id: "1", agent: "אריאל פרגן",  emoji: "💼", action: "סגרה עסקה",     amount: 32000, time: "עכשיו",  tone: "green" },
  { id: "2", agent: "ניסן מליחי",  emoji: "🔥", action: "פתח מכרז ל-12 גופים",                time: "30ש׳",   tone: "amber" },
  { id: "3", agent: "שירה לוי",    emoji: "💎", action: "חוזה נחתם!",       amount: 45000, time: "1ד׳",    tone: "purple" },
  { id: "4", agent: "משה יונה",    emoji: "🎯", action: "ענה לליד חם",                          time: "2ד׳",    tone: "rose" },
  { id: "5", agent: "דנה ברק",     emoji: "🚀", action: "הצעה אושרה",       amount: 120000, time: "5ד׳",   tone: "blue" },
];

export default function WallboardPage() {
  const sorted = [...AGENTS].sort((a, b) => b.deals - a.deals);
  const topAgent = sorted[0];
  const totalDeals = AGENTS.reduce((s, a) => s + a.deals, 0);
  const totalRevenue = AGENTS.reduce((s, a) => s + a.revenue, 0);
  const totalCalls = AGENTS.reduce((s, a) => s + a.calls, 0);
  const dailyGoal = 60;
  const goalProgress = Math.min(100, (totalDeals / dailyGoal) * 100);

  const [time, setTime] = React.useState("");
  const [date, setDate] = React.useState("");
  const [feedIdx, setFeedIdx] = React.useState(0);
  const [confetti, setConfetti] = React.useState(0);

  React.useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
      setDate(now.toLocaleDateString("he-IL", { weekday: "long", day: "numeric", month: "long", year: "numeric" }));
    };
    update();
    const t = setInterval(update, 1000);
    return () => clearInterval(t);
  }, []);

  React.useEffect(() => {
    const t = setInterval(() => setFeedIdx((i) => (i + 1) % LIVE_FEED.length), 4000);
    return () => clearInterval(t);
  }, []);

  // Trigger confetti on big deal animation every 30s
  React.useEffect(() => {
    const t = setInterval(() => setConfetti((c) => c + 1), 30000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="-mx-6 -mt-6 min-h-[calc(100vh-48px)] relative overflow-hidden text-white" style={{ background: "#050608" }}>
      <Confetti trigger={confetti} count={50} />

      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: `linear-gradient(rgba(80,255,10,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(80,255,10,0.5) 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
            maskImage: "radial-gradient(ellipse at center, black 30%, transparent 80%)",
          }}
        />
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[1200px] h-[800px] rounded-full" style={{
          background: "radial-gradient(circle, rgba(80,255,10,0.20) 0%, transparent 60%)",
          filter: "blur(80px)",
        }} />
        <div className="absolute top-1/3 -right-40 w-[600px] h-[600px] rounded-full" style={{
          background: "radial-gradient(circle, rgba(125,255,64,0.20) 0%, transparent 65%)",
          filter: "blur(80px)",
          animation: "orb-float 14s ease-in-out infinite",
        }} />
        <div className="absolute bottom-0 -left-40 w-[700px] h-[700px] rounded-full" style={{
          background: "radial-gradient(circle, rgba(46,161,13,0.30) 0%, transparent 65%)",
          filter: "blur(80px)",
          animation: "orb-float 18s ease-in-out infinite",
          animationDelay: "3s",
        }} />
      </div>

      <div className="relative max-w-[1920px] mx-auto p-8">
        {/* ============ TOP HEADER BAR ============ */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Icon3D icon={<Rocket className="size-8" />} tone="bingo" size={72} />
            <div>
              <div className="text-[12px] uppercase tracking-[0.3em] text-bingo-green font-bold mb-1">WALLBOARD · LIVE</div>
              <h1 className="text-[36px] font-black leading-none">
                בינגו <span className="text-gradient-bingo">תותח</span> ✨
              </h1>
              <div className="text-[14px] text-slate-400 mt-1">{date}</div>
            </div>
          </div>
          <div className="text-right">
            <div className="font-mono text-[64px] font-black tabular-nums text-bingo-green leading-none" style={{
              textShadow: "0 0 24px rgba(80,255,10,0.6)",
            }}>{time}</div>
            <div className="flex items-center gap-2 justify-end mt-1">
              <span className="size-2 rounded-full bg-red-500 dot-pulse" />
              <span className="text-[11px] uppercase tracking-widest text-red-300 font-bold">LIVE</span>
            </div>
          </div>
        </div>

        {/* ============ HERO STATS ============ */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <HeroStat icon={<Trophy className="size-7" />} tone="yellow" label="עסקאות היום" value={totalDeals} target={dailyGoal} pct={goalProgress} />
          <HeroStat icon={<Banknote className="size-7" />} tone="bingo" label="הכנסה היום" value={formatCurrency(totalRevenue)} pct={Math.min(100, (totalRevenue / 600000) * 100)} />
          <HeroStat icon={<Phone className="size-7" />} tone="blue" label="שיחות היום" value={totalCalls} pct={Math.min(100, (totalCalls / 400) * 100)} />
          <HeroStat icon={<Flame className="size-7" />} tone="orange" label="נציג מוביל" value={topAgent.name} sub={`${topAgent.deals} עסקאות 🏆`} />
        </div>

        {/* ============ MAIN GRID ============ */}
        <div className="grid grid-cols-12 gap-4">
          {/* LEADERBOARD - takes 8 cols */}
          <div className="col-span-8 rounded-3xl bg-slate-900/60 backdrop-blur-xl border border-white/10 p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <Icon3D icon={<Crown className="size-6" />} tone="yellow" size={48} />
                <div>
                  <h2 className="text-[24px] font-black">לוח מצטיינים</h2>
                  <div className="text-[12px] text-slate-400">מדורג לפי עסקאות סגורות היום</div>
                </div>
              </div>
              <div className="text-[12px] text-bingo-green font-bold flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-bingo-green dot-pulse" />
                מתעדכן חי
              </div>
            </div>

            <div className="space-y-2">
              {sorted.map((agent, idx) => (
                <LeaderRow key={agent.id} agent={agent} rank={idx + 1} maxDeals={topAgent.deals} />
              ))}
            </div>
          </div>

          {/* LIVE ACTIVITY FEED - 4 cols */}
          <div className="col-span-4 space-y-4">
            <div className="rounded-3xl bg-slate-900/60 backdrop-blur-xl border border-white/10 p-5">
              <div className="flex items-center gap-3 mb-4">
                <Icon3D icon={<Zap className="size-5" />} tone="bingo" size={40} />
                <div>
                  <h2 className="text-[18px] font-black">פיד חי</h2>
                  <div className="text-[11px] text-slate-400">מה קורה ברגעים אלו</div>
                </div>
              </div>

              <div className="space-y-2">
                {LIVE_FEED.map((f, i) => {
                  const tones: Record<string, string> = {
                    green:  "from-emerald-500/20 to-green-700/10 border-emerald-500/30",
                    amber:  "from-amber-500/20 to-orange-700/10 border-amber-500/30",
                    purple: "from-purple-500/20 to-indigo-700/10 border-purple-500/30",
                    rose:   "from-rose-500/20 to-red-700/10 border-rose-500/30",
                    blue:   "from-blue-500/20 to-cyan-700/10 border-blue-500/30",
                  };
                  const isLatest = i === 0;
                  return (
                    <div key={f.id} className={cn(
                      "p-3 rounded-2xl border bg-gradient-to-br relative",
                      tones[f.tone],
                      isLatest && "shadow-lg shadow-bingo-green/15"
                    )}>
                      {isLatest && <span className="absolute top-2 left-2 size-2 rounded-full bg-bingo-green dot-pulse" />}
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-2xl">{f.emoji}</span>
                        <span className="text-[13px] font-black truncate">{f.agent}</span>
                        <span className="text-[10px] font-mono text-slate-400 mr-auto tabular-nums">{f.time}</span>
                      </div>
                      <div className="text-[11px] text-slate-300">{f.action}</div>
                      {f.amount && (
                        <div className="text-[16px] font-black text-gradient-bingo tabular-nums mt-1">{formatCurrency(f.amount)}</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Streak Ticker */}
            <div className="rounded-3xl bg-gradient-to-br from-amber-500/15 via-orange-500/10 to-red-500/15 border border-amber-500/30 p-5">
              <div className="flex items-center gap-3 mb-3">
                <Icon3D icon={<Flame className="size-5" />} tone="orange" size={40} />
                <div>
                  <h2 className="text-[16px] font-black">רצף החודש</h2>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {sorted.slice(0, 3).map((a, i) => (
                  <div key={a.id} className="text-center p-2 rounded-xl bg-white/5">
                    <div className="text-3xl">{a.emoji}</div>
                    <div className="text-[10px] text-slate-300 truncate">{a.name.split(" ")[0]}</div>
                    <div className="text-[20px] font-black tabular-nums text-amber-300 mt-1">{a.streak}🔥</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ============ BOTTOM CTA — Big Goal Progress ============ */}
        <div className="mt-6 rounded-3xl bg-slate-900/60 backdrop-blur-xl border border-white/10 p-5 relative overflow-hidden">
          <div className="flex items-center gap-4">
            <Icon3D icon={<Target className="size-6" />} tone="bingo" size={56} />
            <div className="flex-1">
              <div className="flex items-baseline justify-between mb-2">
                <div>
                  <div className="text-[11px] uppercase tracking-wider text-bingo-green font-bold">יעד יומי קולקטיבי</div>
                  <div className="text-[22px] font-black">{totalDeals} / {dailyGoal} עסקאות</div>
                </div>
                <div className="text-[40px] font-black tabular-nums text-gradient-bingo">{goalProgress.toFixed(0)}%</div>
              </div>
              <div className="h-4 rounded-full bg-white/5 overflow-hidden">
                <div className="h-full rounded-full transition-all duration-700" style={{
                  width: `${goalProgress}%`,
                  background: "linear-gradient(90deg, #B5FF8C 0%, #50FF0A 50%, #2EA10D 100%)",
                  boxShadow: "0 0 24px rgba(80,255,10,0.7)",
                }} />
              </div>
              <div className="text-[11px] text-slate-400 mt-1.5 tabular-nums">
                עוד {Math.max(0, dailyGoal - totalDeals)} עסקאות עד היעד היומי
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   HERO STAT
   ============================================================ */
function HeroStat({ icon, tone, label, value, target, sub, pct }: { icon: React.ReactNode; tone: any; label: string; value: any; target?: number; sub?: string; pct?: number }) {
  const tones: Record<string, string> = {
    yellow: "from-amber-500/20 to-yellow-700/10 border-amber-500/30 shadow-amber-500/20",
    bingo:  "from-bingo-green/20 to-emerald-700/10 border-bingo-green/30 shadow-bingo-green/30",
    blue:   "from-blue-500/20 to-cyan-700/10 border-blue-500/30 shadow-blue-500/20",
    orange: "from-orange-500/20 to-red-700/10 border-orange-500/30 shadow-orange-500/20",
  };
  return (
    <div className={cn("rounded-3xl p-5 border bg-gradient-to-br backdrop-blur-xl shadow-2xl", tones[tone])}>
      <div className="flex items-start justify-between mb-3">
        <Icon3D icon={icon} tone={tone} size={56} />
        {target && <span className="text-[11px] font-bold text-slate-400 tabular-nums">/ {target}</span>}
      </div>
      <div className="text-[12px] uppercase tracking-wider text-slate-400 font-bold">{label}</div>
      <div className="text-[36px] font-black tabular-nums leading-tight mt-1 truncate">{value}</div>
      {sub && <div className="text-[12px] text-bingo-green font-bold mt-1">{sub}</div>}
      {pct !== undefined && (
        <div className="mt-3 h-1.5 rounded-full bg-white/5 overflow-hidden">
          <div className="h-full rounded-full transition-all" style={{
            width: `${pct}%`,
            background: "linear-gradient(90deg, #B5FF8C, #50FF0A, #2EA10D)",
            boxShadow: "0 0 12px rgba(80,255,10,0.5)",
          }} />
        </div>
      )}
    </div>
  );
}

/* ============================================================
   LEADER ROW
   ============================================================ */
function LeaderRow({ agent, rank, maxDeals }: { agent: any; rank: number; maxDeals: number }) {
  const pct = (agent.deals / maxDeals) * 100;
  const medals = {
    1: { bg: "bg-gradient-to-br from-amber-300 to-yellow-600", text: "text-slate-900", glow: "shadow-yellow-500/40", icon: "🥇" },
    2: { bg: "bg-gradient-to-br from-slate-300 to-slate-500", text: "text-slate-900", glow: "shadow-slate-400/30", icon: "🥈" },
    3: { bg: "bg-gradient-to-br from-orange-400 to-orange-700", text: "text-white",   glow: "shadow-orange-500/30", icon: "🥉" },
  } as Record<number, { bg: string; text: string; glow: string; icon: string }>;
  const m = medals[rank];
  return (
    <div className={cn(
      "relative flex items-center gap-4 p-4 rounded-2xl border transition",
      rank <= 3 ? "bg-white/[0.04] border-white/15" : "bg-white/[0.02] border-white/5"
    )}>
      {/* Rank */}
      <div className={cn(
        "size-12 rounded-2xl flex items-center justify-center text-[18px] font-black shrink-0 shadow-lg",
        m ? `${m.bg} ${m.text} ${m.glow}` : "bg-white/10 text-white"
      )}>
        {m?.icon || rank}
      </div>

      {/* Avatar + name */}
      <div className="flex items-center gap-3 w-44 shrink-0">
        <span className="text-3xl">{agent.emoji}</span>
        <div>
          <div className="text-[15px] font-black text-white">{agent.name}</div>
          <div className="text-[10px] text-slate-400">{agent.calls} שיחות · {agent.streak}🔥</div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="flex-1 h-3 rounded-full bg-white/5 overflow-hidden relative">
        <div className={cn("h-full rounded-full transition-all duration-700", rank <= 3 ? "bg-gradient-to-r from-lime-400 via-green-500 to-emerald-600" : "bg-gradient-to-r from-slate-500 to-slate-600")} style={{
          width: `${pct}%`,
          boxShadow: rank <= 3 ? "0 0 16px rgba(80,255,10,0.5)" : "none",
        }} />
      </div>

      {/* Numbers */}
      <div className="text-right shrink-0 w-28">
        <div className="text-[24px] font-black tabular-nums text-white leading-none">{agent.deals}</div>
        <div className="text-[10px] text-slate-400 mt-0.5">עסקאות</div>
      </div>
      <div className="text-right shrink-0 w-32">
        <div className="text-[18px] font-black tabular-nums text-bingo-green leading-none">{formatCurrency(agent.revenue)}</div>
        <div className="text-[10px] text-slate-400 mt-0.5">הכנסה</div>
      </div>
    </div>
  );
}
