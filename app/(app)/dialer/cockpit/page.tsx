"use client";
import * as React from "react";
import Link from "next/link";
import {
  Play, Pause, Phone, PhoneOff, SkipForward, Volume2, Mic, MicOff,
  Sparkles, Flame, Zap, Target, TrendingUp, Radio,
  ChevronDown, X, Settings, BarChart3, Headphones, Activity, Clock,
} from "lucide-react";
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
}

const MOCK_QUEUE: QueuedLead[] = [
  { id: "q1", name: "דניאל כהן", phone: "0501234567", amount: 120000, score: 88, source: "Facebook", category: "general" },
  { id: "q2", name: "רותם בן-דוד", phone: "0529876543", amount: 250000, score: 91, source: "Google", category: "vehicle" },
  { id: "q3", name: "עידן גולדברג", phone: "0547654321", amount: 80000, score: 72, source: "WATI", category: "general" },
  { id: "q4", name: "תמר רוזן", phone: "0531112233", amount: 180000, score: 85, source: "Landing", category: "vehicle" },
  { id: "q5", name: "אורי שמואלי", phone: "0556667788", amount: 65000, score: 68, source: "Facebook", category: "general" },
  { id: "q6", name: "מיכל זהבי", phone: "0524445566", amount: 200000, score: 94, source: "Referral", category: "general" },
];

export default function DialerCockpitPage() {
  const [mode, setMode] = React.useState<CockpitMode>("idle");
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [muted, setMuted] = React.useState(false);
  const [currentIdx, setCurrentIdx] = React.useState(0);
  const [callDuration, setCallDuration] = React.useState(0);
  const [stats, setStats] = React.useState({ dialed: 0, connected: 0, signed: 0, queued: MOCK_QUEUE.length });
  const [pulseFrame, setPulseFrame] = React.useState(0);
  const [waveform, setWaveform] = React.useState<number[]>(Array(40).fill(20));

  // Pulse animation
  React.useEffect(() => {
    const t = setInterval(() => setPulseFrame((v) => v + 1), 150);
    return () => clearInterval(t);
  }, []);

  // Waveform animation when connected
  React.useEffect(() => {
    if (mode !== "connected") return;
    const t = setInterval(() => {
      setWaveform((w) => w.map(() => 15 + Math.random() * 50));
    }, 100);
    return () => clearInterval(t);
  }, [mode]);

  // Call timer
  React.useEffect(() => {
    if (mode !== "connected") {
      setCallDuration(0);
      return;
    }
    const t = setInterval(() => setCallDuration((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [mode]);

  // Auto-progress states when playing
  React.useEffect(() => {
    if (!isPlaying) return;
    if (mode === "idle") {
      const t = setTimeout(() => setMode("dialing"), 800);
      return () => clearTimeout(t);
    }
    if (mode === "dialing") {
      const t = setTimeout(() => setMode("ringing"), 1500);
      return () => clearTimeout(t);
    }
    if (mode === "ringing") {
      const t = setTimeout(() => {
        if (Math.random() > 0.4) {
          setMode("connected");
          setStats((s) => ({ ...s, dialed: s.dialed + 1, connected: s.connected + 1 }));
        } else {
          setStats((s) => ({ ...s, dialed: s.dialed + 1, queued: Math.max(0, s.queued - 1) }));
          setCurrentIdx((i) => (i + 1) % MOCK_QUEUE.length);
          setMode("dialing");
        }
      }, 3000);
      return () => clearTimeout(t);
    }
  }, [isPlaying, mode]);

  const current = MOCK_QUEUE[currentIdx];
  const nextLeads = [...MOCK_QUEUE.slice(currentIdx + 1), ...MOCK_QUEUE.slice(0, currentIdx)].slice(0, 5);

  function handlePlay() {
    setIsPlaying(true);
    setMode("dialing");
  }
  function handleStop() {
    setIsPlaying(false);
    setMode("idle");
  }
  function handleEndCall() {
    setMode("wrap-up");
    setTimeout(() => {
      setCurrentIdx((i) => (i + 1) % MOCK_QUEUE.length);
      setMode(isPlaying ? "dialing" : "idle");
    }, 2000);
  }
  function handleSkip() {
    setCurrentIdx((i) => (i + 1) % MOCK_QUEUE.length);
    if (isPlaying) setMode("dialing");
  }

  const mins = Math.floor(callDuration / 60).toString().padStart(2, "0");
  const secs = (callDuration % 60).toString().padStart(2, "0");

  return (
    <div className="min-h-screen bg-bingo-onyx text-white -mt-4 sm:-mt-6 -mx-4 sm:-mx-6 overflow-hidden relative">
      {/* Background — grid + animated gradient orbs */}
      <div
        className="absolute inset-0 pointer-events-none opacity-40"
        style={{
          backgroundImage:
            "linear-gradient(rgba(80,255,10,.05) 1px, transparent 1px), linear-gradient(90deg, rgba(80,255,10,.05) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
      <div className="absolute top-1/4 -right-32 size-96 rounded-full bg-bingo-green/30 blur-3xl pointer-events-none animate-pulse-green" />
      <div className="absolute bottom-1/4 -left-32 size-96 rounded-full bg-status-blue/20 blur-3xl pointer-events-none" />

      {/* Connection lines (sci-fi vibe) */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-10" preserveAspectRatio="none">
        <defs>
          <linearGradient id="line-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#50FF0A" stopOpacity="0" />
            <stop offset="50%" stopColor="#50FF0A" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#50FF0A" stopOpacity="0" />
          </linearGradient>
        </defs>
        <line x1="0" y1="20%" x2="100%" y2="80%" stroke="url(#line-grad)" strokeWidth="1" />
        <line x1="0" y1="80%" x2="100%" y2="20%" stroke="url(#line-grad)" strokeWidth="1" />
      </svg>

      <div className="relative max-w-[1600px] mx-auto p-6 space-y-4">
        {/* TOP STATUS BAR */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/dialer" className="size-9 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 inline-flex items-center justify-center transition">
              <X className="size-4" />
            </Link>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-bingo-green opacity-70">BINGO COCKPIT</div>
              <h1 className="text-xl md:text-2xl font-black tracking-tight">
                {mode === "idle" && "מוכן לטיסה 🚀"}
                {mode === "dialing" && "מחייג..."}
                {mode === "ringing" && "מצלצל..."}
                {mode === "connected" && "🟢 שיחה פעילה"}
                {mode === "wrap-up" && "סיכום שיחה"}
              </h1>
            </div>
          </div>

          {/* Live mini-stats */}
          <div className="flex items-center gap-2">
            <MiniStat icon="📞" label="חיוגים" value={stats.dialed} />
            <MiniStat icon="✅" label="חיבורים" value={stats.connected} color="green" />
            <MiniStat icon="✍️" label="הסכמים" value={stats.signed} color="green" />
            <MiniStat icon="📋" label="בתור" value={stats.queued} color="blue" />
          </div>
        </div>

        {/* MAIN COCKPIT — Center stage */}
        <div className="relative rounded-3xl border border-white/10 overflow-hidden bg-gradient-to-br from-white/[0.04] via-white/[0.02] to-transparent backdrop-blur-xl">
          {/* Header glow */}
          <div className={cn(
            "absolute inset-x-0 top-0 h-1 transition-all",
            mode === "connected" ? "bg-bingo-green animate-pulse" :
            mode === "ringing" ? "bg-status-yellow animate-pulse" :
            mode === "dialing" ? "bg-status-blue animate-pulse" :
            "bg-white/10"
          )} />

          <div className="p-8 md:p-10 grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* LEFT: Lead Info Big */}
            <div className="lg:col-span-5 space-y-4">
              <div className={cn(
                "rounded-3xl border-2 p-6 transition-all bg-gradient-to-br relative overflow-hidden",
                mode === "connected"
                  ? "border-bingo-green from-bingo-green/20 to-bingo-green/5 ring-4 ring-bingo-green/20"
                  : mode === "ringing"
                    ? "border-status-yellow from-status-yellow/15 to-transparent animate-pulse"
                    : "border-white/15 from-white/5 to-transparent"
              )}>
                {/* Decorative pulse */}
                {mode === "connected" && (
                  <div className="absolute -top-10 -right-10 size-32 rounded-full bg-bingo-green/30 blur-2xl animate-pulse pointer-events-none" />
                )}

                {/* Avatar + score */}
                <div className="flex items-start gap-4 mb-4">
                  <div className="relative">
                    <div className="size-20 rounded-3xl bg-bingo-green text-bingo-black inline-flex items-center justify-center text-3xl font-black bingo-shadow-lg">
                      {current.name[0]}
                    </div>
                    <div className="absolute -bottom-1 -right-1 size-7 rounded-full bg-bingo-black border-2 border-bingo-green inline-flex items-center justify-center text-[10px] font-black text-bingo-green tabular-nums">
                      {current.score}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-white/50">{current.source} · {current.category === "vehicle" ? "🚗 רכב" : "💸 כל מטרה"}</div>
                    <h2 className="text-3xl md:text-4xl font-black truncate leading-tight">{current.name}</h2>
                    <div className="text-base font-mono tabular-nums text-white/70 mt-1" dir="ltr">{current.phone}</div>
                  </div>
                </div>

                {/* Big amount */}
                <div className="rounded-2xl bg-white/5 border border-white/10 px-5 py-3 mb-4">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-white/50 mb-1">סכום מבוקש</div>
                  <div className="text-3xl md:text-4xl font-black text-bingo-green tabular-nums num-display">
                    {formatCurrency(current.amount)}
                  </div>
                </div>

                {/* Timer (when connected) */}
                {mode === "connected" && (
                  <div className="rounded-2xl bg-bingo-green/10 border border-bingo-green/30 px-5 py-3 mb-4">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-bingo-green/80 mb-1">זמן שיחה</div>
                    <div className="text-4xl font-black font-mono tabular-nums text-bingo-green">
                      {mins}:{secs}
                    </div>
                  </div>
                )}

                {/* Waveform when connected */}
                {mode === "connected" && (
                  <div className="rounded-2xl bg-bingo-black/40 border border-white/10 px-3 py-3 mb-4">
                    <div className="flex items-end gap-0.5 h-12">
                      {waveform.map((h, i) => (
                        <div
                          key={i}
                          className="flex-1 bg-bingo-green rounded-sm transition-all"
                          style={{ height: `${h}%` }}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Status text */}
                {mode === "dialing" && (
                  <div className="flex items-center gap-2 text-white/80">
                    <span className="size-2 rounded-full bg-status-blue animate-pulse" />
                    <span className="text-sm font-bold">חיוג ל-{current.phone}...</span>
                  </div>
                )}
                {mode === "ringing" && (
                  <div className="flex items-center gap-2 text-status-yellow">
                    <span className="size-2 rounded-full bg-status-yellow animate-pulse" />
                    <span className="text-sm font-bold">מצלצל אצל הלקוח...</span>
                  </div>
                )}
                {mode === "wrap-up" && (
                  <div className="flex items-center gap-2 text-white/70">
                    <span className="size-2 rounded-full bg-bingo-gray-400" />
                    <span className="text-sm font-bold">סיכום שיחה אוטומטי...</span>
                  </div>
                )}
              </div>
            </div>

            {/* CENTER: BIG PLAY BUTTON */}
            <div className="lg:col-span-3 flex flex-col items-center justify-center gap-6">
              {mode === "idle" ? (
                <button
                  onClick={handlePlay}
                  className="relative group"
                >
                  {/* Outer pulse rings */}
                  <span className="absolute inset-0 rounded-full bg-bingo-green/20 animate-ping" />
                  <span className="absolute inset-0 rounded-full bg-bingo-green/30 animate-pulse" />
                  <div className="relative size-48 md:size-56 rounded-full bg-gradient-to-br from-bingo-green to-emerald-700 text-bingo-black inline-flex items-center justify-center bingo-shadow-lg group-hover:scale-105 transition-transform">
                    <Play className="size-24 md:size-28 fill-bingo-black" strokeWidth={2.5} />
                  </div>
                  <div className="text-center mt-4 text-xl font-black tracking-wider">לחץ להתחלה</div>
                  <div className="text-center text-[11px] text-white/60 mt-1">⌘ + לחיצה למצב Power</div>
                </button>
              ) : mode === "connected" ? (
                <div className="flex flex-col items-center gap-3 w-full">
                  {/* Big End Call button */}
                  <button
                    onClick={handleEndCall}
                    className="size-32 md:size-40 rounded-full bg-status-red text-white inline-flex items-center justify-center bingo-shadow-lg hover:bg-red-600 transition group"
                  >
                    <PhoneOff className="size-12 md:size-14" />
                  </button>
                  <div className="text-base font-bold">סיים שיחה</div>

                  {/* Quick action buttons */}
                  <div className="flex items-center gap-2 mt-2">
                    <CockpitBtn icon={muted ? <MicOff className="size-4" /> : <Mic className="size-4" />} active={muted} onClick={() => setMuted(!muted)} />
                    <CockpitBtn icon={<Pause className="size-4" />} />
                    <CockpitBtn icon={<Volume2 className="size-4" />} />
                    <CockpitBtn icon={<Headphones className="size-4" />} />
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-4">
                  <button
                    onClick={handleStop}
                    className="size-32 md:size-40 rounded-full bg-status-red/20 text-status-red border-2 border-status-red inline-flex items-center justify-center hover:bg-status-red/30 transition"
                  >
                    <Pause className="size-12 fill-status-red" />
                  </button>
                  <div className="text-base font-bold">עצור תור</div>

                  <button
                    onClick={handleSkip}
                    className="h-10 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[12px] font-bold inline-flex items-center gap-1.5 transition"
                  >
                    <SkipForward className="size-4" />
                    דלג לבא
                  </button>
                </div>
              )}
            </div>

            {/* RIGHT: AI Co-pilot Live */}
            <div className="lg:col-span-4 space-y-3">
              <div className="rounded-3xl border border-bingo-green/30 bg-gradient-to-br from-bingo-green/15 via-bingo-green/5 to-transparent p-5 backdrop-blur">
                <div className="flex items-center gap-2 mb-3">
                  <div className="size-9 rounded-xl bg-bingo-black text-bingo-green inline-flex items-center justify-center">
                    <Sparkles className="size-4" />
                  </div>
                  <div>
                    <div className="text-sm font-extrabold">BINGO AI</div>
                    <div className="text-[10px] text-bingo-green/80">Live Co-pilot</div>
                  </div>
                  <span className="ml-auto text-[9px] font-bold bg-bingo-green/20 text-bingo-green rounded-md px-2 py-0.5 inline-flex items-center gap-1">
                    <span className="size-1.5 rounded-full bg-bingo-green animate-pulse" />
                    LIVE
                  </span>
                </div>

                {mode === "idle" && (
                  <div className="space-y-2">
                    <p className="text-[13px] text-white/90 leading-relaxed">
                      ☕ <strong>בוקר טוב!</strong> יש לך <strong className="text-bingo-green">{MOCK_QUEUE.length} לידים חמים</strong> בתור.
                      ממוצע סיכויי סגירה: <strong className="text-bingo-green">81%</strong>.
                    </p>
                    <p className="text-[12px] text-white/70 leading-relaxed">
                      💡 הזמן הטוב ביותר לחיוג עכשיו. הליד הראשון: <strong>{current.name}</strong>.
                    </p>
                  </div>
                )}

                {mode === "dialing" && (
                  <div className="space-y-2">
                    <p className="text-[13px] text-white/90 leading-relaxed">
                      🎯 <strong>{current.name}</strong> — סיכוי סגירה <strong className="text-bingo-green">{current.score}%</strong>
                    </p>
                    <p className="text-[12px] text-white/70">היסטוריה: 0 שיחות קודמות · ליד חדש</p>
                  </div>
                )}

                {mode === "ringing" && (
                  <div className="space-y-2">
                    <p className="text-[13px] text-white/90 leading-relaxed">
                      📞 <strong>מצלצל...</strong>
                    </p>
                    <p className="text-[12px] text-white/70">בזמן ההמתנה — תן עין על: {current.source} ליד מ-{current.category === "vehicle" ? "מחלקת רכב" : "כל מטרה"}</p>
                  </div>
                )}

                {mode === "connected" && (
                  <div className="space-y-2.5">
                    <div className="rounded-xl bg-bingo-black/40 border border-bingo-green/20 px-3 py-2">
                      <div className="text-[9px] font-bold uppercase tracking-wider text-bingo-green/80 mb-1">פתח עם</div>
                      <p className="text-[13px] font-bold text-white leading-snug">
                        "שלום {current.name.split(" ")[0]}, מדבר חן מבינגו, איך אני יכול לעזור היום?"
                      </p>
                    </div>
                    <div className="text-[11px] text-white/70 space-y-1">
                      <div className="flex items-center gap-1.5">
                        <Sparkles className="size-3 text-bingo-green" />
                        <span>אם יזכיר ריבית — תזכיר חיסכון של ₪240 בחודש</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Sparkles className="size-3 text-bingo-green" />
                        <span>הלקוח רוצה {formatCurrency(current.amount)} — מתאים לבנק ירושלים</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Voicenter status mini */}
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur">
                <div className="flex items-center gap-2">
                  <span className="size-2 rounded-full bg-bingo-green animate-pulse" />
                  <span className="text-[11px] font-bold">Voicenter Connected</span>
                  <span className="text-[10px] text-white/50 mr-auto">פינג: 12ms · קו: HD</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM: Queue preview */}
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl overflow-hidden">
          <div className="px-5 py-3 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="size-4 text-bingo-green" />
              <h3 className="text-sm font-extrabold">תור הלידים</h3>
              <span className="text-[10px] font-mono text-white/50">5 הבאים</span>
            </div>
            <div className="text-[10px] text-white/50 inline-flex items-center gap-1">
              <Settings className="size-3" />
              מסונן: 🔥 חמים בלבד
            </div>
          </div>
          <div className="p-3 grid grid-cols-1 md:grid-cols-5 gap-2">
            {nextLeads.map((lead, i) => (
              <div key={lead.id} className="rounded-xl bg-white/5 border border-white/10 p-3 hover:bg-white/10 transition relative">
                <div className="absolute top-1 left-1 text-[9px] font-mono font-bold text-white/40">#{i + 1}</div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="size-8 rounded-lg bg-white/10 inline-flex items-center justify-center text-sm font-black">
                    {lead.name[0]}
                  </div>
                  <div className="min-w-0">
                    <div className="text-[12px] font-bold truncate">{lead.name}</div>
                    <div className="text-[9px] font-mono text-white/50" dir="ltr">{lead.phone}</div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-bingo-green font-bold">{formatCurrency(lead.amount)}</span>
                  <span className="text-[9px] font-bold tabular-nums bg-bingo-green/15 text-bingo-green rounded px-1.5">
                    {lead.score}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function MiniStat({ icon, label, value, color }: { icon: string; label: string; value: number; color?: "green" | "blue" }) {
  return (
    <div className={cn(
      "rounded-xl border px-3 py-2 backdrop-blur min-w-[80px]",
      color === "green" ? "bg-bingo-green/12 border-bingo-green/30" :
      color === "blue" ? "bg-status-blue/12 border-status-blue/30" :
      "bg-white/5 border-white/10"
    )}>
      <div className="text-[9px] font-bold uppercase text-white/60 inline-flex items-center gap-1">
        <span className="text-sm">{icon}</span>
        {label}
      </div>
      <div className="text-xl font-black tabular-nums leading-none mt-0.5">{value}</div>
    </div>
  );
}

function CockpitBtn({ icon, onClick, active }: { icon: React.ReactNode; onClick?: () => void; active?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "size-10 rounded-xl border inline-flex items-center justify-center transition",
        active
          ? "bg-status-red/20 border-status-red text-status-red"
          : "bg-white/5 border-white/10 hover:bg-white/10 text-white/80"
      )}
    >
      {icon}
    </button>
  );
}
