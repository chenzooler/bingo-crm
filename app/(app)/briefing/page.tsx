"use client";
import * as React from "react";
import Link from "next/link";
import { Sun, Trophy, Flame, Target, Rocket, Phone, Star, Sparkles, TrendingUp, Coffee, Cloud, ChevronLeft, Crown, Zap } from "lucide-react";
import { Icon3D } from "@/components/ui/Icon3D";
import { Confetti } from "@/components/ui/Confetti";
import { cn, formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

// Mock daily briefing data
const AGENT = { name: "חן צולר", emoji: "💼" };
const YESTERDAY = {
  dealsSigned: 5,
  dealsTarget: 4,
  revenue: 148500,
  callsAnswered: 23,
  topMoment: { lead: "אורי שמואלי", amount: 95000 },
  rank: 3,
};
const TODAY = {
  hotLeads: [
    { id: "3035035", name: "דוד קדוש",       score: 94, amount: 250000, reason: "התקשר אתמול, ביקש להתקדם",  category: "general" },
    { id: "2",       name: "מאג'ד אל' חואסה",  score: 88, amount: 180000, reason: "אישור עקרוני חיכה 24 שעות", category: "vehicle" },
    { id: "5",       name: "מוחמד עוזד",      score: 82, amount: 120000, reason: "השאיר פרטים לפני שעתיים",  category: "general" },
  ],
  dailyTarget: 5,
  tasksCount: 12,
  tasksUrgent: 3,
  meetings: 2,
  weatherEmoji: "☀️",
  weatherTemp: "24°",
};
const AI_TIP = {
  headline: "התקשר ראשון לדוד קדוש",
  body: "שעות הבוקר 9:30-11:00 הן הזמן הטוב ביותר לסגירת עסקאות לפי הנתונים שלך. דוד פתח את ההודעה שלך בלילה — תפוס אותו לפני שמתחרים יגיעו אליו.",
  category: "Hot Tip",
};

export default function BriefingPage() {
  const [confetti, setConfetti] = React.useState(0);
  const [time, setTime] = React.useState("");
  const [date, setDate] = React.useState("");

  React.useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" }));
      setDate(now.toLocaleDateString("he-IL", { weekday: "long", day: "numeric", month: "long" }));
    };
    update();
    const t = setInterval(update, 30000);
    return () => clearInterval(t);
  }, []);

  React.useEffect(() => {
    // Celebration if yesterday beat target
    if (YESTERDAY.dealsSigned > YESTERDAY.dealsTarget) {
      const t = setTimeout(() => setConfetti((c) => c + 1), 600);
      return () => clearTimeout(t);
    }
  }, []);

  const beatTarget = YESTERDAY.dealsSigned > YESTERDAY.dealsTarget;
  const greeting = getGreeting();

  return (
    <div className="-mx-6 -mt-6 min-h-[calc(100vh-48px)] relative overflow-hidden text-white" style={{ background: "#050608" }}>
      <Confetti trigger={confetti} count={50} />

      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 opacity-[0.06]" style={{
          backgroundImage: `linear-gradient(rgba(80,255,10,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(80,255,10,0.4) 1px, transparent 1px)`,
          backgroundSize: "48px 48px",
          maskImage: "radial-gradient(ellipse at top, black 20%, transparent 80%)",
        }} />
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[1000px] h-[700px] rounded-full" style={{
          background: "radial-gradient(circle, rgba(80,255,10,0.25) 0%, transparent 60%)",
          filter: "blur(60px)",
        }} />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] rounded-full" style={{
          background: "radial-gradient(circle, rgba(125,255,64,0.20) 0%, transparent 65%)",
          filter: "blur(80px)",
          animation: "orb-float 18s ease-in-out infinite",
        }} />
      </div>

      <div className="relative max-w-[1280px] mx-auto p-8 pb-32">
        {/* GREETING */}
        <div className="text-center mb-10">
          <div className="text-[6xl] mb-2" style={{ fontSize: 64 }}>{greeting.emoji}</div>
          <div className="text-[12px] uppercase tracking-[0.4em] text-bingo-green font-bold mb-2">DAILY BRIEFING</div>
          <h1 className="text-[56px] font-black leading-none tracking-tight">
            {greeting.text}, <span className="text-gradient-bingo">{AGENT.name.split(" ")[0]}</span>!
          </h1>
          <div className="flex items-center justify-center gap-3 mt-3 text-[14px] text-slate-400">
            <span>{date}</span>
            <span className="opacity-30">·</span>
            <span className="font-mono tabular-nums">{time}</span>
            <span className="opacity-30">·</span>
            <span>{TODAY.weatherEmoji} {TODAY.weatherTemp}</span>
          </div>
        </div>

        {/* YESTERDAY'S RECAP */}
        <div className="card-yesterday mb-6">
          <div className="rounded-3xl bg-slate-900/60 backdrop-blur-xl border border-white/10 p-6 relative overflow-hidden">
            {beatTarget && (
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-yellow-500 to-orange-500" />
            )}
            <div className="flex items-start justify-between mb-5">
              <div className="flex items-center gap-3">
                <Icon3D icon={<Trophy className="size-5" />} tone="yellow" size={48} />
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-amber-300 font-bold">אתמול</div>
                  <h2 className="text-[22px] font-black">איך היה?</h2>
                </div>
              </div>
              {beatTarget && (
                <div className="bg-gradient-to-r from-amber-400 to-orange-500 text-slate-900 px-3 py-1.5 rounded-xl text-[12px] font-black inline-flex items-center gap-1.5 shadow-lg shadow-amber-500/30 animate-pulse">
                  <Crown className="size-3.5" />
                  ניצחת את היעד!
                </div>
              )}
            </div>

            <div className="grid grid-cols-4 gap-3">
              <RecapStat label="עסקאות סגרת" value={YESTERDAY.dealsSigned} target={YESTERDAY.dealsTarget} tone="bingo" />
              <RecapStat label="הכנסה" value={formatCurrency(YESTERDAY.revenue)} tone="green" />
              <RecapStat label="שיחות שעניתי" value={YESTERDAY.callsAnswered} tone="blue" />
              <RecapStat label="דירוג צוות" value={`#${YESTERDAY.rank}`} tone="purple" />
            </div>

            <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-yellow-500/5 to-amber-500/10 border border-amber-500/20 flex items-center gap-3">
              <span className="text-3xl">🏆</span>
              <div className="flex-1">
                <div className="text-[10px] uppercase tracking-wider text-amber-300 font-bold">הרגע הכי טוב שלך אתמול</div>
                <div className="text-[14px] font-black">סגרת את {YESTERDAY.topMoment.lead} ב-<span className="text-gradient-bingo">{formatCurrency(YESTERDAY.topMoment.amount)}</span></div>
              </div>
            </div>
          </div>
        </div>

        {/* TODAY'S MISSION */}
        <div className="grid grid-cols-12 gap-4 mb-6">
          {/* HOT LEADS */}
          <div className="col-span-8 rounded-3xl bg-slate-900/60 backdrop-blur-xl border border-white/10 p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <Icon3D icon={<Flame className="size-5" />} tone="red" size={48} />
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-rose-300 font-bold">היום</div>
                  <h2 className="text-[22px] font-black">3 לידים חמים להתחיל איתם</h2>
                </div>
              </div>
              <Link href="/leads?status=hot" className="text-[12px] text-bingo-green font-bold hover:underline flex items-center gap-1">
                כל הלידים החמים
                <ChevronLeft className="size-3.5" />
              </Link>
            </div>

            <div className="space-y-2">
              {TODAY.hotLeads.map((lead, i) => (
                <Link key={lead.id} href={`/leads/${lead.id}`} className="block p-4 rounded-2xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] hover:border-bingo-green/40 transition group">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "size-9 rounded-xl flex items-center justify-center text-[14px] font-black shrink-0",
                      i === 0 ? "bg-gradient-to-br from-amber-300 to-yellow-600 text-slate-900" :
                      i === 1 ? "bg-gradient-to-br from-slate-300 to-slate-500 text-slate-900" :
                                "bg-gradient-to-br from-orange-400 to-orange-700 text-white"
                    )}>{i + 1}</div>
                    <div className="size-11 rounded-2xl bg-gradient-to-br from-lime-400 to-emerald-600 flex items-center justify-center font-black text-slate-900 text-base shadow-md shadow-green-500/30">
                      {lead.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[14px] font-black text-white truncate">{lead.name}</span>
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-bingo-green/15 border border-bingo-green/30 text-bingo-green text-[10px] font-black tabular-nums">
                          <Star className="size-2.5 fill-current" />
                          {lead.score}
                        </span>
                        <span className="text-[10px] text-slate-400">{lead.category === "vehicle" ? "🚗" : "💸"}</span>
                      </div>
                      <div className="text-[11px] text-slate-400">{lead.reason}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-[16px] font-black tabular-nums text-gradient-bingo">{formatCurrency(lead.amount)}</div>
                      <div className="text-[10px] text-slate-500">פוטנציאל</div>
                    </div>
                    <button className="size-10 rounded-xl bg-bingo-green/15 border border-bingo-green/40 text-bingo-green hover:bg-bingo-green/25 hover:scale-110 transition flex items-center justify-center group-hover:bg-bingo-green group-hover:text-slate-900">
                      <Phone className="size-4" />
                    </button>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* TODAY'S NUMBERS */}
          <div className="col-span-4 space-y-3">
            <SidebarStat icon={<Target className="size-5" />} tone="bingo" label="יעד היום" value={`${TODAY.dailyTarget} עסקאות`} sub="בוא נסגור!" />
            <SidebarStat icon={<Sparkles className="size-5" />} tone="orange" label="משימות" value={`${TODAY.tasksUrgent}/${TODAY.tasksCount}`} sub="דחופות / כולל" />
            <SidebarStat icon={<Coffee className="size-5" />} tone="purple" label="פגישות היום" value={String(TODAY.meetings)} sub="בלוח שלך" />
          </div>
        </div>

        {/* AI TIP */}
        <div className="rounded-3xl bg-gradient-to-br from-purple-900/40 via-indigo-900/30 to-slate-900/60 backdrop-blur-xl border border-purple-500/30 p-6 mb-6 relative overflow-hidden">
          <div className="absolute -top-20 -left-20 w-60 h-60 rounded-full bg-purple-500/20 blur-3xl" />
          <div className="relative flex items-start gap-4">
            <Icon3D icon={<Sparkles className="size-6" />} tone="purple" size={64} />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] uppercase tracking-widest text-purple-300 font-bold">{AI_TIP.category}</span>
                <span className="px-2 py-0.5 rounded-md bg-purple-500/20 border border-purple-500/30 text-purple-200 text-[9px] font-bold">AI</span>
              </div>
              <h3 className="text-[20px] font-black mb-2">{AI_TIP.headline}</h3>
              <p className="text-[13px] text-slate-300 leading-relaxed">{AI_TIP.body}</p>
            </div>
          </div>
        </div>

        {/* BIG CTA */}
        <div className="text-center">
          <Link
            href="/dialer/cockpit"
            className="inline-flex items-center gap-4 px-12 py-6 rounded-3xl font-black text-[18px] transition-transform hover:scale-105 active:scale-95"
            style={{
              background: "linear-gradient(180deg, #B5FF8C 0%, #50FF0A 50%, #2EA10D 100%)",
              color: "#0F2A04",
              boxShadow: `inset 0 3px 0 0 rgba(255,255,255,0.55), inset 0 -3px 6px 0 rgba(30,111,8,0.5), 0 8px 32px -4px rgba(80,255,10,0.65), 0 16px 48px -8px rgba(46,161,13,0.5)`,
            }}
          >
            <Rocket className="size-6" />
            יאללה — תתחיל יום מנצח
            <ChevronLeft className="size-5" />
          </Link>
          <div className="mt-3 text-[12px] text-slate-500">
            או <Link href="/dashboard" className="text-bingo-green hover:underline font-bold">דשבורד מלא →</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 5) return { text: "לילה טוב", emoji: "🌙" };
  if (h < 12) return { text: "בוקר טוב", emoji: "☀️" };
  if (h < 17) return { text: "צהריים טובים", emoji: "🌤" };
  if (h < 20) return { text: "אחר הצהריים", emoji: "🌅" };
  return { text: "ערב טוב", emoji: "🌇" };
}

function RecapStat({ label, value, target, tone }: { label: string; value: any; target?: number; tone: any }) {
  const tones: Record<string, string> = {
    bingo:  "from-bingo-green/20 to-emerald-700/10 border-bingo-green/30",
    green:  "from-emerald-500/20 to-green-700/10 border-emerald-500/30",
    blue:   "from-blue-500/20 to-cyan-700/10 border-blue-500/30",
    purple: "from-purple-500/20 to-indigo-700/10 border-purple-500/30",
  };
  return (
    <div className={cn("rounded-2xl p-4 border bg-gradient-to-br", tones[tone])}>
      <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">{label}</div>
      <div className="text-[22px] font-black tabular-nums">{value}</div>
      {target && <div className="text-[10px] text-slate-500 mt-0.5">/ {target} יעד</div>}
    </div>
  );
}

function SidebarStat({ icon, tone, label, value, sub }: { icon: React.ReactNode; tone: any; label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-white/10 p-4">
      <div className="flex items-center gap-3">
        <Icon3D icon={icon} tone={tone} size={40} />
        <div className="flex-1 min-w-0">
          <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">{label}</div>
          <div className="text-[18px] font-black tabular-nums leading-tight">{value}</div>
          {sub && <div className="text-[10px] text-slate-500 mt-0.5">{sub}</div>}
        </div>
      </div>
    </div>
  );
}
