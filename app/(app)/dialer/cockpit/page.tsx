"use client";
import * as React from "react";
import Link from "next/link";
import {
  Play, Pause, Phone, PhoneOff, SkipForward, Volume2, Mic, MicOff,
  Sparkles, Flame, Zap, Target, TrendingUp, Radio, ChevronDown, X,
  Settings, BarChart3, Headphones, Activity, Clock, Trophy, Rocket,
  Star, Users, Wallet, Crown, ChevronRight,
} from "lucide-react";
import { Icon3D } from "@/components/ui/Icon3D";
import { Confetti } from "@/components/ui/Confetti";
import { cn, formatCurrency } from "@/lib/utils";

type CockpitMode = "idle" | "dialing" | "ringing" | "connected" | "wrap-up";

interface QueuedLead {
  id: string;
  name: string;
  phone: string;
  amount: number;
  score: number;
  source: string;
  category: "general" | "vehicle";
  avatar?: string;
}

const MOCK_QUEUE: QueuedLead[] = [
  { id: "q1", name: "דניאל כהן",   phone: "0501234567", amount: 120000, score: 88, source: "Facebook", category: "general" },
  { id: "q2", name: "רותם בן-דוד",  phone: "0529876543", amount: 250000, score: 91, source: "Google",   category: "vehicle" },
  { id: "q3", name: "עידן גולדברג",  phone: "0547654321", amount:  80000, score: 72, source: "WATI",     category: "general" },
  { id: "q4", name: "תמר רוזן",     phone: "0531112233", amount: 180000, score: 85, source: "Landing",  category: "vehicle" },
  { id: "q5", name: "אורי שמואלי",  phone: "0556667788", amount:  65000, score: 68, source: "Facebook", category: "general" },
  { id: "q6", name: "מיכל זהבי",   phone: "0524445566", amount: 200000, score: 94, source: "Referral", category: "general" },
];

export default function DialerCockpitPage() {
  const [mode, setMode] = React.useState<CockpitMode>("idle");
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [muted, setMuted] = React.useState(false);
  const [currentIdx, setCurrentIdx] = React.useState(0);
  const [callDuration, setCallDuration] = React.useState(0);
  const [stats, setStats] = React.useState({ dialed: 0, connected: 0, signed: 0, queued: MOCK_QUEUE.length });
  const [waveform, setWaveform] = React.useState<number[]>(Array(64).fill(20));
  const [parallelDialing, setParallelDialing] = React.useState<string[]>([]);
  const [confettiTrigger, setConfettiTrigger] = React.useState(0);
  const [achievement, setAchievement] = React.useState<string | null>(null);

  // Rotating digits for "the spinning numbers wheel"
  const [rotatingDigits, setRotatingDigits] = React.useState<string[]>(Array(10).fill("0"));

  // Waveform animation
  React.useEffect(() => {
    if (mode !== "connected") {
      setWaveform(Array(64).fill(20));
      return;
    }
    const t = setInterval(() => {
      setWaveform((w) => w.map(() => 12 + Math.random() * 70));
    }, 80);
    return () => clearInterval(t);
  }, [mode]);

  // Rotating digits (parallel dialer visualization)
  React.useEffect(() => {
    if (mode !== "dialing" && mode !== "ringing") {
      setRotatingDigits(Array(10).fill("0"));
      return;
    }
    const t = setInterval(() => {
      setRotatingDigits(Array(10).fill(0).map(() => String(Math.floor(Math.random() * 10))));
    }, 70);
    return () => clearInterval(t);
  }, [mode]);

  // Parallel dialing visualization
  React.useEffect(() => {
    if (mode !== "dialing") {
      setParallelDialing([]);
      return;
    }
    const phones = MOCK_QUEUE.slice(0, 3).map((l) => l.phone);
    setParallelDialing(phones);
  }, [mode]);

  // Call timer
  React.useEffect(() => {
    if (mode !== "connected") { setCallDuration(0); return; }
    const t = setInterval(() => setCallDuration((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [mode]);

  // Auto-progress
  React.useEffect(() => {
    if (!isPlaying) return;
    if (mode === "idle") {
      const t = setTimeout(() => setMode("dialing"), 600);
      return () => clearTimeout(t);
    }
    if (mode === "dialing") {
      const t = setTimeout(() => setMode("ringing"), 1200);
      return () => clearTimeout(t);
    }
    if (mode === "ringing") {
      const t = setTimeout(() => {
        if (Math.random() > 0.4) {
          setMode("connected");
          setStats((s) => ({ ...s, dialed: s.dialed + 1, connected: s.connected + 1 }));
          // Trigger achievement
          setAchievement("📞 ענה לי!");
          setTimeout(() => setAchievement(null), 2200);
        } else {
          setStats((s) => ({ ...s, dialed: s.dialed + 1 }));
          setCurrentIdx((i) => (i + 1) % MOCK_QUEUE.length);
          setMode("dialing");
        }
      }, 2500);
      return () => clearTimeout(t);
    }
  }, [isPlaying, mode]);

  const current = MOCK_QUEUE[currentIdx];

  function handlePlayPause() {
    if (!isPlaying) {
      setIsPlaying(true);
      setConfettiTrigger((c) => c + 1);
      setAchievement("🚀 התותח עף!");
      setTimeout(() => setAchievement(null), 2200);
    } else {
      setIsPlaying(false);
      setMode("idle");
    }
  }

  function handleHangup() {
    if (mode === "connected") {
      setMode("wrap-up");
      setTimeout(() => {
        setCurrentIdx((i) => (i + 1) % MOCK_QUEUE.length);
        setMode(isPlaying ? "dialing" : "idle");
      }, 2000);
    }
  }

  function handleSign() {
    setStats((s) => ({ ...s, signed: s.signed + 1 }));
    setConfettiTrigger((c) => c + 1);
    setAchievement("🏆 חתימה!");
    setTimeout(() => setAchievement(null), 2500);
    handleHangup();
  }

  return (
    <div className="-mx-6 -mt-6 min-h-[calc(100vh-48px)] relative overflow-hidden text-white" style={{ background: "#050608" }}>
      <Confetti trigger={confettiTrigger} count={60} />

      {/* ============ COSMIC BACKGROUND LAYERS ============ */}
      <CosmicBackground mode={mode} />

      {/* ============ ACHIEVEMENT POPUP ============ */}
      {achievement && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[60] pointer-events-none">
          <div className="bg-gradient-to-r from-lime-400 via-green-500 to-emerald-600 text-slate-900 px-8 py-4 rounded-2xl text-3xl font-black shadow-2xl shadow-green-500/60 ring-4 ring-bingo-green/40 animate-in zoom-in slide-in-from-top-4 duration-500">
            {achievement}
          </div>
        </div>
      )}

      <div className="relative max-w-[1600px] mx-auto p-6">
        {/* ============ TOP STATUS BAR ============ */}
        <TopStatusBar mode={mode} stats={stats} />

        {/* ============ MAIN GRID ============ */}
        <div className="grid grid-cols-12 gap-4 mt-6">
          {/* LEFT — Current Lead */}
          <aside className="col-span-3">
            <CurrentLeadPanel lead={current} mode={mode} />
            <UpNextStack idx={currentIdx} />
          </aside>

          {/* CENTER — The PSYCHO PLAY button */}
          <main className="col-span-6">
            <CenterDialerStage
              mode={mode}
              isPlaying={isPlaying}
              onPlayPause={handlePlayPause}
              onHangup={handleHangup}
              onSign={handleSign}
              callDuration={callDuration}
              waveform={waveform}
              rotatingDigits={rotatingDigits}
              parallelDialing={parallelDialing}
              current={current}
              muted={muted}
              onMute={() => setMuted(!muted)}
            />
          </main>

          {/* RIGHT — AI Co-pilot + Leaderboard */}
          <aside className="col-span-3 space-y-4">
            <AICoPilotPanel mode={mode} lead={current} />
            <LeaderboardPanel />
          </aside>
        </div>

        {/* ============ BOTTOM CMD STRIP ============ */}
        <BottomCommandStrip mode={mode} stats={stats} />
      </div>
    </div>
  );
}

/* ============================================================
   COSMIC BACKGROUND
   ============================================================ */
function CosmicBackground({ mode }: { mode: CockpitMode }) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Grid */}
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: `linear-gradient(rgba(80,255,10,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(80,255,10,0.4) 1px, transparent 1px)`,
          backgroundSize: "48px 48px",
          maskImage: "radial-gradient(ellipse at center, black 30%, transparent 80%)",
        }}
      />

      {/* Bingo green orb */}
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full" style={{
        background: "radial-gradient(circle, rgba(80,255,10,0.18) 0%, transparent 60%)",
        filter: "blur(60px)",
      }} />

      {/* Side orbs */}
      <div className="absolute top-1/3 -right-40 w-[500px] h-[500px] rounded-full opacity-50" style={{
        background: "radial-gradient(circle, rgba(125,255,64,0.20) 0%, transparent 65%)",
        filter: "blur(80px)",
        animation: "orb-float 14s ease-in-out infinite",
      }} />
      <div className="absolute bottom-0 -left-40 w-[600px] h-[600px] rounded-full opacity-40" style={{
        background: "radial-gradient(circle, rgba(46,161,13,0.30) 0%, transparent 65%)",
        filter: "blur(80px)",
        animation: "orb-float 18s ease-in-out infinite",
        animationDelay: "3s",
      }} />

      {/* Active mode flash */}
      {mode === "connected" && (
        <div className="absolute inset-0" style={{
          background: "radial-gradient(circle at center, rgba(80,255,10,0.08) 0%, transparent 60%)",
          animation: "pulse 2s ease-in-out infinite",
        }} />
      )}

      {/* Scanline */}
      <div className="absolute inset-x-0 h-px top-1/2 opacity-30 cockpit-scanline" style={{
        background: "linear-gradient(90deg, transparent, #50FF0A, transparent)",
        boxShadow: "0 0 24px #50FF0A",
      }} />
    </div>
  );
}

/* ============================================================
   TOP STATUS BAR
   ============================================================ */
function TopStatusBar({ mode, stats }: { mode: CockpitMode; stats: any }) {
  return (
    <div className="flex items-center justify-between gap-4 px-5 py-3 rounded-2xl bg-slate-900/70 backdrop-blur-xl border border-white/10 shadow-2xl shadow-green-900/30">
      <div className="flex items-center gap-3">
        <Link href="/dialer" className="text-[12px] text-slate-400 hover:text-bingo-green flex items-center gap-1 transition">
          <ChevronRight className="size-3.5" />
          תותח
        </Link>
        <div className="h-4 w-px bg-white/10" />
        <Icon3D icon={<Rocket className="size-4" />} tone="bingo" size={36} />
        <div>
          <div className="text-[10px] uppercase tracking-widest text-bingo-green font-bold">COCKPIT MODE</div>
          <div className="text-[14px] font-black flex items-center gap-2">
            <span>תותח שיחות</span>
            <ModeBadge mode={mode} />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 text-[11px]">
        <StatusChip icon={<Phone className="size-3" />} label="חיוג" value={stats.dialed} tone="green" />
        <StatusChip icon={<Headphones className="size-3" />} label="ענו" value={stats.connected} tone="cyan" />
        <StatusChip icon={<Trophy className="size-3" />} label="חתימות" value={stats.signed} tone="yellow" />
        <StatusChip icon={<Activity className="size-3" />} label="בתור" value={stats.queued} tone="purple" />
      </div>

      <div className="flex items-center gap-2">
        <button className="size-9 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white transition flex items-center justify-center">
          <Settings className="size-4" />
        </button>
        <button className="size-9 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white transition flex items-center justify-center">
          <BarChart3 className="size-4" />
        </button>
      </div>
    </div>
  );
}

function ModeBadge({ mode }: { mode: CockpitMode }) {
  const map = {
    idle:      { label: "במתנה",  color: "bg-slate-500", dot: "bg-slate-400" },
    dialing:   { label: "מחייג",   color: "bg-amber-500", dot: "bg-amber-400 animate-pulse" },
    ringing:   { label: "מצלצל",   color: "bg-blue-500",  dot: "bg-blue-400 animate-pulse" },
    connected: { label: "מחובר",  color: "bg-bingo-green", dot: "bg-bingo-green animate-pulse" },
    "wrap-up": { label: "מסכם",   color: "bg-purple-500", dot: "bg-purple-400" },
  }[mode];
  return (
    <span className={cn("inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-black text-white", map.color)}>
      <span className={cn("inline-block size-1.5 rounded-full", map.dot)} />
      {map.label.toUpperCase()}
    </span>
  );
}

function StatusChip({ icon, label, value, tone }: { icon: React.ReactNode; label: string; value: number; tone: "green" | "cyan" | "yellow" | "purple" }) {
  const tones = {
    green:  "border-bingo-green/40 bg-bingo-green/10 text-bingo-green",
    cyan:   "border-cyan-400/40 bg-cyan-400/10 text-cyan-300",
    yellow: "border-amber-400/40 bg-amber-400/10 text-amber-300",
    purple: "border-purple-400/40 bg-purple-400/10 text-purple-300",
  };
  return (
    <div className={cn("inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border", tones[tone])}>
      {icon}
      <span className="font-medium opacity-70">{label}</span>
      <span className="font-black tabular-nums text-white text-[13px]">{value}</span>
    </div>
  );
}

/* ============================================================
   LEFT — CURRENT LEAD + UP NEXT
   ============================================================ */
function CurrentLeadPanel({ lead, mode }: { lead: QueuedLead; mode: CockpitMode }) {
  return (
    <div className="rounded-3xl bg-slate-900/60 backdrop-blur-xl border border-white/10 p-5 mb-4 relative overflow-hidden">
      {/* Glow border when connected */}
      {mode === "connected" && (
        <div className="absolute inset-0 rounded-3xl ring-2 ring-bingo-green/60 shadow-[0_0_40px_rgba(80,255,10,0.45)_inset]" />
      )}

      <div className="relative">
        <div className="text-[10px] uppercase tracking-widest text-bingo-green font-bold mb-2">LEAD פעיל</div>
        <div className="flex items-center gap-3">
          <div className="size-14 rounded-2xl bg-gradient-to-br from-lime-400 to-emerald-600 flex items-center justify-center font-black text-slate-900 text-xl shadow-lg shadow-green-500/40">
            {lead.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-black text-[16px] truncate">{lead.name}</div>
            <div className="text-[11px] text-slate-400 tabular-nums" dir="ltr">{lead.phone}</div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <MiniStat icon={<Wallet className="size-3" />} label="סכום" value={formatCurrency(lead.amount)} tone="green" />
          <MiniStat icon={<Star className="size-3" />} label="ציון AI" value={lead.score} tone="yellow" />
        </div>

        <div className="mt-3 flex items-center gap-1.5 text-[10px] text-slate-400">
          <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10">{lead.source}</span>
          <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10">{lead.category === "vehicle" ? "🚗 רכב" : "💸 כל מטרה"}</span>
        </div>
      </div>
    </div>
  );
}

function MiniStat({ icon, label, value, tone }: { icon: React.ReactNode; label: string; value: any; tone: string }) {
  return (
    <div className="rounded-xl bg-white/5 border border-white/10 p-2.5">
      <div className="flex items-center gap-1 text-[9px] uppercase tracking-wider text-slate-400 mb-0.5">
        {icon}
        {label}
      </div>
      <div className={cn("text-[13px] font-black tabular-nums", tone === "green" ? "text-bingo-green" : "text-amber-300")}>{value}</div>
    </div>
  );
}

function UpNextStack({ idx }: { idx: number }) {
  const next = MOCK_QUEUE.slice(idx + 1, idx + 4);
  return (
    <div className="rounded-3xl bg-slate-900/60 backdrop-blur-xl border border-white/10 p-4">
      <div className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-3 flex items-center gap-1.5">
        <SkipForward className="size-3" />
        הבאים בתור
      </div>
      <div className="space-y-2">
        {next.map((l, i) => (
          <div key={l.id} className="flex items-center gap-2 p-2 rounded-xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] transition">
            <div className="size-7 rounded-lg bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-[11px] font-black text-slate-300">
              {l.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[11px] font-bold text-white truncate">{l.name}</div>
              <div className="text-[9px] text-slate-500 tabular-nums">{formatCurrency(l.amount)}</div>
            </div>
            <span className="text-[10px] font-black text-amber-300 tabular-nums">{l.score}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ============================================================
   CENTER — THE BIG PLAY BUTTON + LIVE VISUALS
   ============================================================ */
function CenterDialerStage({
  mode, isPlaying, onPlayPause, onHangup, onSign, callDuration, waveform,
  rotatingDigits, parallelDialing, current, muted, onMute,
}: any) {
  const minutes = String(Math.floor(callDuration / 60)).padStart(2, "0");
  const seconds = String(callDuration % 60).padStart(2, "0");

  return (
    <div className="rounded-3xl bg-slate-900/60 backdrop-blur-2xl border border-white/10 p-6 relative overflow-hidden min-h-[600px]">
      {/* Mode-specific content */}
      {mode === "idle" && <IdleStage onPlay={onPlayPause} isPlaying={isPlaying} />}

      {(mode === "dialing" || mode === "ringing") && (
        <DialingStage
          mode={mode}
          phones={parallelDialing}
          rotatingDigits={rotatingDigits}
          current={current}
        />
      )}

      {mode === "connected" && (
        <ConnectedStage
          time={`${minutes}:${seconds}`}
          waveform={waveform}
          current={current}
          onHangup={onHangup}
          onSign={onSign}
          muted={muted}
          onMute={onMute}
        />
      )}

      {mode === "wrap-up" && <WrapUpStage current={current} />}
    </div>
  );
}

/* ---------- IDLE STAGE ---------- */
function IdleStage({ onPlay, isPlaying }: { onPlay: () => void; isPlaying: boolean }) {
  return (
    <div className="h-full min-h-[540px] flex flex-col items-center justify-center gap-8">
      <div className="text-center">
        <div className="text-[10px] uppercase tracking-[0.3em] text-bingo-green font-bold mb-2">READY FOR LAUNCH</div>
        <h2 className="text-[48px] font-black tracking-tight text-white">
          לחץ ל<span className="text-gradient-bingo">תותח</span>
        </h2>
        <p className="text-[13px] text-slate-400 mt-2">המערכת תחייג ל-3 לקוחות במקביל</p>
      </div>

      {/* THE BUTTON */}
      <button
        onClick={onPlay}
        className="relative group"
        aria-label={isPlaying ? "Pause" : "Play"}
      >
        {/* Outer ring pulses */}
        <span className="absolute inset-0 rounded-full opacity-50" style={{
          background: "radial-gradient(circle, rgba(80,255,10,0.5) 0%, transparent 70%)",
          animation: "pulse 2.5s ease-in-out infinite",
          width: "320px", height: "320px", marginLeft: "-40px", marginTop: "-40px",
        }} />
        <span className="absolute inset-0 rounded-full ring-4 ring-bingo-green/30" style={{
          animation: "ping 3s cubic-bezier(0, 0, 0.2, 1) infinite",
        }} />
        <span className="absolute inset-0 rounded-full ring-2 ring-bingo-green/40" style={{
          animation: "ping 3s cubic-bezier(0, 0, 0.2, 1) infinite",
          animationDelay: "1s",
        }} />

        {/* Inner button */}
        <span className="relative size-60 rounded-full flex items-center justify-center transition-transform group-hover:scale-105 group-active:scale-95" style={{
          background: "radial-gradient(circle at 30% 30%, #B5FF8C 0%, #50FF0A 40%, #2EA10D 100%)",
          boxShadow: `
            inset 0 4px 0 0 rgba(255,255,255,0.45),
            inset 0 -8px 16px 0 rgba(30,111,8,0.5),
            0 0 0 4px rgba(80,255,10,0.25),
            0 0 60px 10px rgba(80,255,10,0.55),
            0 20px 60px 0 rgba(46,161,13,0.5)
          `,
        }}>
          <Play className="size-24 text-slate-900" style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))" }} fill="currentColor" />
        </span>
      </button>

      <div className="text-center">
        <div className="text-[14px] text-slate-400">או לחץ <kbd className="inline-flex items-center px-2 py-1 rounded-md bg-white/10 border border-white/20 text-white text-[11px] font-mono">Space</kbd> להתחלה</div>
      </div>
    </div>
  );
}

/* ---------- DIALING STAGE (THE WHEEL) ---------- */
function DialingStage({ mode, phones, rotatingDigits, current }: any) {
  return (
    <div className="h-full min-h-[540px] flex flex-col items-center justify-center gap-6 relative">
      <div className="text-center">
        <div className="text-[10px] uppercase tracking-[0.3em] text-bingo-green font-bold mb-2 flex items-center justify-center gap-2">
          <Radio className="size-3 animate-pulse" />
          {mode === "dialing" ? "מחייג ל-3 במקביל" : "מצלצל..."}
        </div>
        <h2 className="text-[36px] font-black tracking-tight text-white">{current.name}</h2>
      </div>

      {/* The ROTATING DIGITS WHEEL */}
      <div className="relative flex items-center justify-center">
        {/* Outer orbit rings */}
        <div className="absolute size-[400px] rounded-full border-2 border-bingo-green/20" style={{ animation: "spin 8s linear infinite" }}>
          {[0, 60, 120, 180, 240, 300].map((deg) => (
            <span key={deg} className="absolute size-2 rounded-full bg-bingo-green shadow-[0_0_8px_#50FF0A]" style={{
              top: "50%", left: "50%",
              transform: `rotate(${deg}deg) translateX(200px) translateY(-4px)`,
            }} />
          ))}
        </div>
        <div className="absolute size-[320px] rounded-full border border-bingo-green/30" style={{ animation: "spin 6s linear infinite reverse" }} />

        {/* Center digits display */}
        <div className="relative size-60 rounded-full flex items-center justify-center" style={{
          background: "radial-gradient(circle, #0E1B0E 0%, #050608 70%)",
          boxShadow: "0 0 0 1px rgba(80,255,10,0.3), 0 0 60px rgba(80,255,10,0.4)",
        }}>
          <div className="text-center">
            <div className="text-[11px] uppercase tracking-widest text-bingo-green mb-3">DIALING</div>
            <div className="font-mono text-[28px] font-black text-bingo-green tabular-nums tracking-wider" style={{ textShadow: "0 0 12px rgba(80,255,10,0.7)" }} dir="ltr">
              {rotatingDigits.slice(0, 10).join("")}
            </div>
            <div className="text-[10px] text-slate-500 mt-3 tabular-nums" dir="ltr">{current.phone}</div>
          </div>
        </div>
      </div>

      {/* Parallel phones */}
      <div className="flex items-center gap-4">
        {phones.map((p: string, i: number) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <div className="size-10 rounded-xl bg-gradient-to-br from-bingo-green/30 to-emerald-700/30 border border-bingo-green/40 flex items-center justify-center" style={{
              animation: `pulse ${1 + i * 0.3}s ease-in-out infinite`,
            }}>
              <Phone className="size-4 text-bingo-green" />
            </div>
            <span className="text-[9px] text-slate-500 tabular-nums" dir="ltr">{p.slice(-4)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- CONNECTED STAGE ---------- */
function ConnectedStage({ time, waveform, current, onHangup, onSign, muted, onMute }: any) {
  return (
    <div className="h-full min-h-[540px] flex flex-col items-center justify-between gap-4 py-2">
      {/* Top — Live indicator */}
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/15 border border-red-500/40 text-red-300">
        <span className="size-2 rounded-full bg-red-500 dot-pulse" />
        <span className="text-[11px] font-black uppercase tracking-widest">LIVE</span>
      </div>

      {/* Center — Lead + Big Timer */}
      <div className="text-center">
        <div className="size-20 rounded-3xl bg-gradient-to-br from-lime-400 to-emerald-600 flex items-center justify-center font-black text-slate-900 text-3xl mx-auto mb-3 shadow-2xl shadow-green-500/50">
          {current.name.charAt(0)}
        </div>
        <h2 className="text-[28px] font-black text-white">{current.name}</h2>
        <div className="font-mono text-[72px] font-black tabular-nums text-bingo-green mt-2 leading-none" style={{
          textShadow: "0 0 24px rgba(80,255,10,0.6), 0 0 48px rgba(80,255,10,0.3)",
        }}>
          {time}
        </div>
      </div>

      {/* Waveform */}
      <div className="w-full flex items-center justify-center gap-[3px] h-24 px-4">
        {waveform.map((h: number, i: number) => (
          <span
            key={i}
            className="w-[5px] rounded-full"
            style={{
              height: `${h}%`,
              background: `linear-gradient(180deg, #B5FF8C, #50FF0A ${50 + h * 0.3}%, #2EA10D)`,
              boxShadow: `0 0 6px rgba(80,255,10,${0.4 + h * 0.01})`,
              transition: "height 80ms ease-out",
            }}
          />
        ))}
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-3">
        <CockpitBtn icon={muted ? <MicOff /> : <Mic />} label="השתק" tone="slate" onClick={onMute} active={muted} />
        <CockpitBtn icon={<Sparkles />} label="AI עוזר" tone="purple" />
        <button
          onClick={onSign}
          className="px-8 h-16 rounded-3xl text-white font-black text-[15px] inline-flex items-center gap-2 transition-transform hover:scale-105 active:scale-95"
          style={{
            background: "linear-gradient(180deg, #B5FF8C 0%, #50FF0A 50%, #2EA10D 100%)",
            color: "#0F2A04",
            boxShadow: `
              inset 0 2px 0 0 rgba(255,255,255,0.55),
              inset 0 -3px 6px 0 rgba(30,111,8,0.5),
              0 6px 24px -4px rgba(80,255,10,0.7),
              0 12px 40px -4px rgba(46,161,13,0.5)
            `,
          }}
        >
          <Trophy className="size-5" />
          סגור עסקה!
        </button>
        <CockpitBtn icon={<PhoneOff />} label="נתק" tone="red" onClick={onHangup} />
      </div>
    </div>
  );
}

function CockpitBtn({ icon, label, tone, onClick, active }: any) {
  const tones: Record<string, string> = {
    slate:  "bg-white/5 border-white/15 text-white hover:bg-white/10",
    red:    "bg-red-500/15 border-red-500/40 text-red-300 hover:bg-red-500/25",
    purple: "bg-purple-500/15 border-purple-500/40 text-purple-300 hover:bg-purple-500/25",
  };
  return (
    <button onClick={onClick} className={cn("size-16 rounded-3xl border flex flex-col items-center justify-center gap-0.5 transition", tones[tone], active && "ring-2 ring-white")}>
      <span className="size-5 [&_svg]:size-5">{icon}</span>
      <span className="text-[9px] font-bold">{label}</span>
    </button>
  );
}

function WrapUpStage({ current }: { current: QueuedLead }) {
  return (
    <div className="h-full min-h-[540px] flex flex-col items-center justify-center gap-4">
      <Icon3D icon={<Trophy className="size-8" />} tone="yellow" size={80} />
      <h2 className="text-[28px] font-black text-white">סיכום שיחה</h2>
      <p className="text-slate-400">{current.name} · עוברים ללקוח הבא...</p>
    </div>
  );
}

/* ============================================================
   RIGHT — AI CO-PILOT + LEADERBOARD
   ============================================================ */
function AICoPilotPanel({ mode, lead }: { mode: CockpitMode; lead: QueuedLead }) {
  const tips = {
    idle:      ["💡 הליד הבא ציון 88 — מועמד מצוין", "📊 השעה הכי טובה לחיוג: עכשיו"],
    dialing:   ["📡 מחייג ל-3 במקביל", "⚡ ענו במקביל? נתב לליד עם הציון הגבוה"],
    ringing:   ["🎯 מצלצל — הכן את הפתיחה", "💬 'שלום, אני מ-בינגו אשראי...'"],
    connected: ["💎 הציע סכום של 120K — עובד הכי טוב", "🔥 הזכר את האישור העקרוני", "✅ אישור: 'תרצה לקבל את הכסף השבוע?'"],
    "wrap-up": ["📝 סיכום אוטומטי נשמר", "⏭ ממשיך ללקוח הבא"],
  }[mode];

  return (
    <div className="rounded-3xl bg-slate-900/60 backdrop-blur-xl border border-white/10 p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-bingo-green/8 via-transparent to-emerald-500/5 pointer-events-none" />
      <div className="relative">
        <div className="flex items-center gap-2 mb-3">
          <Icon3D icon={<Sparkles className="size-4" />} tone="bingo" size={32} />
          <div>
            <div className="text-[12px] font-black text-white">AI Co-pilot</div>
            <div className="text-[9px] text-bingo-green flex items-center gap-1">
              <span className="size-1.5 rounded-full bg-bingo-green dot-pulse" />
              חי בזמן אמת
            </div>
          </div>
        </div>
        <div className="space-y-2">
          {tips.map((tip, i) => (
            <div key={i} className="text-[11px] text-white/85 leading-snug p-2.5 rounded-xl bg-white/5 border border-white/10">
              {tip}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const TEAM_LEADERS = [
  { name: "אריאל פרגן",  deals: 8, glow: true,  rank: 1 },
  { name: "ניסן מליחי",  deals: 7, glow: false, rank: 2 },
  { name: "שירה לוי",    deals: 6, glow: false, rank: 3 },
  { name: "חן צולר (אתה)", deals: 4, glow: false, rank: 7, me: true },
];

function LeaderboardPanel() {
  return (
    <div className="rounded-3xl bg-slate-900/60 backdrop-blur-xl border border-white/10 p-4">
      <div className="flex items-center gap-2 mb-3">
        <Icon3D icon={<Crown className="size-4" />} tone="yellow" size={32} />
        <div className="text-[12px] font-black text-white">לוח מצטיינים היום</div>
      </div>
      <div className="space-y-1.5">
        {TEAM_LEADERS.map((l) => (
          <div key={l.name} className={cn(
            "flex items-center gap-2 p-2 rounded-xl border transition",
            l.me ? "bg-bingo-green/10 border-bingo-green/40" :
            l.glow ? "bg-amber-500/8 border-amber-500/30" :
            "bg-white/[0.02] border-white/5"
          )}>
            <div className={cn(
              "size-6 rounded-md flex items-center justify-center text-[11px] font-black",
              l.rank === 1 ? "bg-gradient-to-br from-amber-300 to-yellow-600 text-slate-900" :
              l.rank === 2 ? "bg-gradient-to-br from-slate-300 to-slate-500 text-slate-900" :
              l.rank === 3 ? "bg-gradient-to-br from-orange-400 to-orange-700 text-white" :
              "bg-white/10 text-white/70"
            )}>
              {l.rank}
            </div>
            <span className={cn("flex-1 text-[11px] font-bold truncate", l.me ? "text-bingo-green" : "text-white")}>{l.name}</span>
            <span className={cn("text-[12px] font-black tabular-nums", l.me ? "text-bingo-green" : "text-amber-300")}>{l.deals}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ============================================================
   BOTTOM COMMAND STRIP
   ============================================================ */
function BottomCommandStrip({ mode, stats }: { mode: CockpitMode; stats: any }) {
  const conversionRate = stats.dialed > 0 ? Math.round((stats.connected / stats.dialed) * 100) : 0;
  const signRate = stats.connected > 0 ? Math.round((stats.signed / stats.connected) * 100) : 0;
  return (
    <div className="mt-4 grid grid-cols-3 gap-3">
      <ProgressBar label="מענה לחיוג" pct={conversionRate} color="cyan" big={`${stats.connected}/${stats.dialed}`} />
      <ProgressBar label="המרה לחתימה" pct={signRate} color="bingo" big={`${stats.signed}/${stats.connected}`} />
      <ProgressBar label="יעד יומי" pct={Math.min(100, (stats.signed / 2) * 100)} color="amber" big={`${stats.signed}/2`} />
    </div>
  );
}

function ProgressBar({ label, pct, color, big }: { label: string; pct: number; color: "cyan" | "bingo" | "amber"; big: string }) {
  const fills = {
    cyan:   "from-cyan-400 to-blue-500",
    bingo:  "from-lime-400 via-green-500 to-emerald-600",
    amber:  "from-amber-400 to-orange-500",
  };
  const glows = {
    cyan: "0 0 16px rgba(34,211,238,0.45)",
    bingo: "0 0 16px rgba(80,255,10,0.55)",
    amber: "0 0 16px rgba(251,191,36,0.45)",
  };
  return (
    <div className="rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-white/10 p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">{label}</span>
        <span className="text-[18px] font-black tabular-nums text-white">{big}</span>
      </div>
      <div className="h-2 rounded-full bg-white/5 overflow-hidden">
        <div className={cn("h-full bg-gradient-to-r rounded-full transition-all", fills[color])} style={{ width: `${pct}%`, boxShadow: glows[color] }} />
      </div>
      <div className="text-[10px] text-slate-500 mt-1 text-right tabular-nums">{pct}%</div>
    </div>
  );
}
