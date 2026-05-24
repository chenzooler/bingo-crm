"use client";
import * as React from "react";
import Link from "next/link";
import {
  Activity, Radio, Zap, TrendingUp, TrendingDown, Users, Phone, MessageCircle,
  AlertTriangle, CheckCircle2, Clock, Target, Flame, Sparkles, Eye, ChevronUp,
  ChevronDown, Award, Globe, Wifi, Cpu, Database, Shield, Bell, Radar,
} from "lucide-react";
import { LIVE_AGENTS, getStatusMeta as getAgentStatusMeta, type LiveAgent } from "@/lib/data/live-state";
import { Avatar } from "@/components/ui/Avatar";
import { STAGES } from "@/lib/data/lifecycle";
import { AUGMENTED_LEADS } from "@/lib/data/lead-augment";
import { generateInsights } from "@/lib/data/ai-insights";
import { cn, formatCurrency } from "@/lib/utils";

interface LiveDeal {
  agentName: string;
  customerName: string;
  category: string;
  time: string;
  amount: number;
  commission: number;
}

const LIVE_DEALS_TODAY: LiveDeal[] = [
  { agentName: "מאיה לוי", customerName: "דנה שטרן", category: "כל מטרה", time: "14:08", amount: 180000, commission: 6300 },
  { agentName: "אורי כהן", customerName: "יואב פרי", category: "רכב", time: "12:42", amount: 95000, commission: 3325 },
  { agentName: "חן צולר", customerName: "אבי גולד", category: "כל מטרה", time: "11:15", amount: 220000, commission: 7700 },
  { agentName: "תמר רז", customerName: "רותי שטרן", category: "איחוד", time: "10:34", amount: 145000, commission: 5075 },
  { agentName: "מאיה לוי", customerName: "אריאל כהן", category: "כל מטרה", time: "09:51", amount: 75000, commission: 2625 },
];

export default function CommandCenterPage() {
  const [time, setTime] = React.useState(new Date());
  const [pulse, setPulse] = React.useState(0);

  React.useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    const p = setInterval(() => setPulse((v) => v + 1), 3000);
    return () => { clearInterval(t); clearInterval(p); };
  }, []);

  // Live metrics
  const onCallAgents = LIVE_AGENTS.filter((a) => a.status === "on-call").length;
  const availableAgents = LIVE_AGENTS.filter((a) => a.status === "available").length;
  const totalOnBreak = LIVE_AGENTS.filter((a) => ["smoke", "bathroom", "lunch"].includes(a.status)).length;
  const totalActive = LIVE_AGENTS.filter((a) => a.status !== "offline").length;

  const hotLeads = AUGMENTED_LEADS.filter((l) => {
    const insights = generateInsights(l);
    return insights.closeProbability > 75;
  }).slice(0, 5);

  const totalDealsValue = LIVE_DEALS_TODAY.reduce((sum, d) => sum + d.amount, 0);
  const totalCommission = LIVE_DEALS_TODAY.reduce((sum, d) => sum + d.commission, 0);

  return (
    <div className="min-h-screen bg-bingo-onyx text-white -mt-4 sm:-mt-6 -mx-4 sm:-mx-6 p-4 sm:p-6 overflow-hidden">
      {/* Grid bg + glow */}
      <div
        className="absolute inset-0 pointer-events-none opacity-30"
        style={{
          backgroundImage: "linear-gradient(rgba(80,255,10,.07) 1px, transparent 1px), linear-gradient(90deg, rgba(80,255,10,.07) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />
      <div className="absolute -top-32 -right-32 size-96 rounded-full bg-bingo-green/20 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 size-96 rounded-full bg-bingo-green/10 blur-3xl pointer-events-none" />

      <div className="relative max-w-[1600px] mx-auto space-y-4">
        {/* HEADER */}
        <header className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="relative size-14 rounded-2xl bg-gradient-to-br from-bingo-green to-emerald-700 inline-flex items-center justify-center bingo-shadow-lg">
              <Radar className="size-7 text-bingo-black" />
              <span className="absolute inset-0 rounded-2xl ring-2 ring-bingo-green/40 animate-pulse-green pointer-events-none" />
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-bingo-green opacity-80">BINGO COMMAND CENTER</div>
              <h1 className="text-2xl md:text-3xl font-black tracking-tight">Mission Control</h1>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <SystemBadge icon={<Wifi className="size-3" />} label="Online" color="green" />
            <SystemBadge icon={<Cpu className="size-3" />} label="AI Active" color="green" />
            <SystemBadge icon={<Database className="size-3" />} label="DB Synced" color="green" />
            <SystemBadge icon={<Shield className="size-3" />} label="Secure" color="green" />
            <div className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 backdrop-blur">
              <div className="text-[10px] text-white/60">{time.toLocaleDateString("he-IL", { weekday: "long", day: "numeric", month: "long" })}</div>
              <div className="text-base font-mono font-bold tabular-nums">{time.toLocaleTimeString("he-IL")}</div>
            </div>
          </div>
        </header>

        {/* TOP STATS — Real-time pulse */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <PulseStat
            icon={<Phone className="size-5" />}
            label="שיחות פעילות"
            value={onCallAgents}
            sub={`${availableAgents} נציגים זמינים`}
            color="green"
            pulse={pulse}
          />
          <PulseStat
            icon={<Target className="size-5" />}
            label="עסקאות היום"
            value={LIVE_DEALS_TODAY.length}
            sub={formatCurrency(totalDealsValue)}
            color="blue"
            pulse={pulse}
          />
          <PulseStat
            icon={<Flame className="size-5" />}
            label="לידים חמים"
            value={hotLeads.length}
            sub="ממתינים לטיפול"
            color="red"
            pulse={pulse}
          />
          <PulseStat
            icon={<Award className="size-5" />}
            label="עמלות היום"
            value={formatCurrency(totalCommission)}
            sub={`+18% מאתמול`}
            color="yellow"
            pulse={pulse}
            isText
          />
        </section>

        {/* MAIN GRID */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-3">
          {/* Live Agent Grid */}
          <div className="lg:col-span-7 rounded-2xl bg-bingo-charcoal/60 backdrop-blur border border-white/10 overflow-hidden">
            <div className="px-5 py-3 border-b border-white/10 flex items-center justify-between">
              <h2 className="text-sm font-extrabold flex items-center gap-2">
                <span className="size-2 rounded-full bg-bingo-green animate-pulse" />
                <Activity className="size-4 text-bingo-green" />
                Live Agents
                <span className="text-[10px] text-white/50 font-mono">{totalActive}/{LIVE_AGENTS.length} active</span>
              </h2>
              <div className="flex items-center gap-2 text-[10px] text-white/60">
                <span className="inline-flex items-center gap-1"><span className="size-1.5 rounded-full bg-bingo-green" /> זמין</span>
                <span className="inline-flex items-center gap-1"><span className="size-1.5 rounded-full bg-status-blue" /> בשיחה</span>
                <span className="inline-flex items-center gap-1"><span className="size-1.5 rounded-full bg-status-yellow" /> wrap-up</span>
                <span className="inline-flex items-center gap-1"><span className="size-1.5 rounded-full bg-status-orange" /> הפסקה</span>
              </div>
            </div>
            <div className="p-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-[420px] overflow-y-auto">
              {LIVE_AGENTS.map((agent) => <AgentTile key={agent.id} agent={agent} />)}
            </div>
          </div>

          {/* Hot Leads Panel */}
          <div className="lg:col-span-5 rounded-2xl bg-bingo-charcoal/60 backdrop-blur border border-white/10 overflow-hidden">
            <div className="px-5 py-3 border-b border-white/10 flex items-center justify-between">
              <h2 className="text-sm font-extrabold flex items-center gap-2">
                <Flame className="size-4 text-status-red" />
                Hot Leads — דורש פעולה
              </h2>
              <span className="text-[10px] font-bold bg-status-red/20 text-status-red rounded-md px-2 py-0.5">URGENT</span>
            </div>
            <div className="p-3 space-y-2">
              {hotLeads.map((lead) => {
                const insights = generateInsights(lead);
                return (
                  <Link
                    key={lead.id}
                    href={`/leads/${lead.id}`}
                    className="block rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition p-3 group"
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <Avatar name={lead.fullName} size="sm" />
                        <div className="min-w-0">
                          <div className="text-sm font-bold truncate">{lead.fullName}</div>
                          <div className="text-[10px] text-white/50 font-mono" dir="ltr">{lead.phone || "—"}</div>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-[10px] text-white/50">סיכוי</div>
                        <div className="text-lg font-black text-bingo-green tabular-nums leading-none">{insights.closeProbability}%</div>
                      </div>
                    </div>
                    {lead.amountRequested && (
                      <div className="text-xs font-mono tabular-nums text-white/80">
                        {formatCurrency(lead.amountRequested)}
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Pipeline Pulse — full width */}
          <div className="lg:col-span-12 rounded-2xl bg-bingo-charcoal/60 backdrop-blur border border-white/10 overflow-hidden">
            <div className="px-5 py-3 border-b border-white/10 flex items-center justify-between">
              <h2 className="text-sm font-extrabold flex items-center gap-2">
                <Radio className="size-4 text-bingo-green animate-pulse" />
                Pipeline Pulse — Real Time
              </h2>
              <div className="text-[10px] text-white/50 font-mono">10 stages active</div>
            </div>
            <div className="p-3 grid grid-cols-2 sm:grid-cols-5 md:grid-cols-10 gap-1.5">
              {STAGES.filter((s) => s.key !== "EXIT").map((stage) => {
                const count = AUGMENTED_LEADS.filter((l) => l.stage === stage.key).length;
                const colorBg = {
                  blue: "bg-status-blue", yellow: "bg-status-yellow",
                  orange: "bg-status-orange", green: "bg-bingo-green",
                  purple: "bg-status-purple", pink: "bg-status-pink",
                  gray: "bg-bingo-gray-400",
                }[stage.color];
                return (
                  <Link
                    key={stage.key}
                    href={`/leads?stage=${stage.key}`}
                    className="rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 p-2.5 group transition relative overflow-hidden"
                  >
                    <div className="text-[9px] font-mono text-white/40 tabular-nums">{String(stage.position).padStart(2, "0")}</div>
                    <div className="text-[11px] font-bold text-white/80 truncate">{stage.label}</div>
                    <div className="text-xl font-black text-white tabular-nums mt-1">{count}</div>
                    <div className={cn("absolute bottom-0 left-0 h-1 transition-all", colorBg)} style={{ width: `${Math.min((count / 50) * 100, 100)}%` }} />
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Live Deals Stream */}
          <div className="lg:col-span-8 rounded-2xl bg-bingo-charcoal/60 backdrop-blur border border-white/10 overflow-hidden">
            <div className="px-5 py-3 border-b border-white/10 flex items-center justify-between">
              <h2 className="text-sm font-extrabold flex items-center gap-2">
                <Sparkles className="size-4 text-bingo-green" />
                Deals Stream Today
              </h2>
              <span className="text-[10px] font-bold text-bingo-green-dark bg-bingo-green/20 rounded-md px-2 py-0.5 inline-flex items-center gap-1">
                <span className="size-1.5 rounded-full bg-bingo-green animate-pulse" />
                LIVE
              </span>
            </div>
            <div className="divide-y divide-white/5 max-h-80 overflow-y-auto">
              {LIVE_DEALS_TODAY.map((deal, i) => (
                <div key={i} className="px-5 py-3 hover:bg-white/5 transition flex items-center gap-3">
                  <div className="size-9 rounded-xl bg-bingo-green/20 text-bingo-green inline-flex items-center justify-center shrink-0">
                    <CheckCircle2 className="size-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold truncate">{deal.agentName}</span>
                      <span className="text-[10px] text-white/40">·</span>
                      <span className="text-[11px] text-white/70 truncate">{deal.customerName}</span>
                    </div>
                    <div className="text-[10px] text-white/50 mt-0.5">{deal.category} · {deal.time}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-extrabold tabular-nums text-white">{formatCurrency(deal.amount)}</div>
                    <div className="text-[10px] text-bingo-green tabular-nums">+{formatCurrency(deal.commission)}</div>
                  </div>
                </div>
              ))}
              {LIVE_DEALS_TODAY.length === 0 && (
                <div className="px-5 py-8 text-center text-white/40 text-sm">אין עסקאות שנסגרו היום</div>
              )}
            </div>
          </div>

          {/* AI Insights Panel */}
          <div className="lg:col-span-4 rounded-2xl bg-gradient-to-br from-bingo-green/20 via-bingo-green/5 to-transparent backdrop-blur border border-bingo-green/30 overflow-hidden">
            <div className="px-5 py-3 border-b border-white/10 flex items-center justify-between">
              <h2 className="text-sm font-extrabold flex items-center gap-2">
                <Sparkles className="size-4 text-bingo-green animate-pulse" />
                AI Insights
              </h2>
              <span className="text-[10px] font-mono text-bingo-green">BINGO BRAIN</span>
            </div>
            <div className="p-4 space-y-3">
              <Insight
                emoji="🎯"
                text="3 לידים חמים לא טופלו ב-2 שעות. ROI צפוי: ₪45K"
                action="חייג עכשיו"
              />
              <Insight
                emoji="🔥"
                text="היום שיא — 47 שיחות, ממוצע 4:12 דקות"
                action="צפה בלוח"
              />
              <Insight
                emoji="⚡"
                text="WATI Bot סנן 287 לידים — 12 מתאימים לצוות"
                action="בדוק"
              />
              <Insight
                emoji="🚨"
                text="2 לידים בסיכון יציאה — לא נגעו 4 ימים"
                action="התערב"
              />
              <Insight
                emoji="💎"
                text="מאיה לוי שוברת שיא — 14 עסקאות בחודש"
                action="הכר"
              />
            </div>
          </div>
        </section>

        {/* Footer status bar */}
        <footer className="rounded-2xl bg-bingo-charcoal/60 backdrop-blur border border-white/10 px-5 py-3 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3 text-[11px] text-white/60">
            <span className="inline-flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-bingo-green animate-pulse" />
              All systems operational
            </span>
            <span>·</span>
            <span>API 12ms</span>
            <span>·</span>
            <span>DB 4ms</span>
            <span>·</span>
            <span>AI 240ms avg</span>
          </div>
          <div className="text-[11px] text-white/60 font-mono">
            BINGO CRM v2.0 · Powered by Claude · Last sync: {time.toLocaleTimeString("he-IL")}
          </div>
        </footer>
      </div>
    </div>
  );
}

// ─────────── Sub Components ───────────

function SystemBadge({ icon, label, color }: { icon: React.ReactNode; label: string; color: "green" | "red" }) {
  return (
    <div className={cn(
      "inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold border backdrop-blur",
      color === "green" ? "bg-bingo-green/15 text-bingo-green border-bingo-green/30" : "bg-status-red/15 text-status-red border-status-red/30"
    )}>
      {icon}
      {label}
    </div>
  );
}

function PulseStat({ icon, label, value, sub, color, pulse, isText }: {
  icon: React.ReactNode; label: string; value: number | string; sub: string;
  color: "green" | "blue" | "red" | "yellow"; pulse: number; isText?: boolean;
}) {
  const colors = {
    green: { bg: "from-bingo-green/20 to-bingo-green/5", border: "border-bingo-green/40", text: "text-bingo-green", glow: "shadow-bingo-green/30" },
    blue: { bg: "from-status-blue/20 to-status-blue/5", border: "border-status-blue/40", text: "text-status-blue", glow: "shadow-status-blue/30" },
    red: { bg: "from-status-red/20 to-status-red/5", border: "border-status-red/40", text: "text-status-red", glow: "shadow-status-red/30" },
    yellow: { bg: "from-status-yellow/25 to-status-yellow/5", border: "border-status-yellow/50", text: "text-status-yellow", glow: "shadow-status-yellow/30" },
  }[color];

  return (
    <div className={cn(
      "relative rounded-2xl bg-gradient-to-br backdrop-blur border p-4 overflow-hidden transition-all",
      colors.bg, colors.border
    )}>
      {/* Animated glow */}
      <div
        key={pulse}
        className={cn("absolute inset-0 rounded-2xl opacity-30 animate-ping pointer-events-none", colors.text.replace("text-", "bg-"))}
        style={{ animationDuration: "3s" }}
      />
      <div className="relative">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-white/70">{label}</span>
          <span className={colors.text}>{icon}</span>
        </div>
        <div className={cn("text-3xl md:text-4xl font-black text-white tabular-nums leading-none", isText && "text-2xl md:text-3xl")}>{value}</div>
        <div className="text-[11px] text-white/60 mt-1.5">{sub}</div>
      </div>
    </div>
  );
}

function AgentTile({ agent }: { agent: typeof LIVE_AGENTS[number] }) {
  const meta = getAgentStatusMeta(agent.status);
  const dotColor = {
    available: "bg-bingo-green", "on-call": "bg-status-blue", "wrap-up": "bg-status-yellow",
    smoke: "bg-status-orange", bathroom: "bg-status-orange", lunch: "bg-status-orange",
    training: "bg-status-purple", meeting: "bg-status-purple", offline: "bg-bingo-gray-400",
  }[agent.status];

  return (
    <div className={cn(
      "rounded-xl bg-white/5 border border-white/10 p-2.5 transition hover:bg-white/10",
      agent.status === "on-call" && "ring-2 ring-status-blue/40"
    )}>
      <div className="flex items-center gap-2 mb-1.5">
        <div className="relative shrink-0">
          <Avatar name={agent.name} emoji={agent.emoji} size="sm" />
          <span className={cn("absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full ring-2 ring-bingo-charcoal", dotColor, agent.status === "on-call" && "animate-pulse")} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[11px] font-bold text-white truncate">{agent.name.split(" ")[0]}</div>
          <div className={cn("text-[9px] font-bold truncate")} style={{ color: meta.color === "green" ? "#50FF0A" : meta.color === "blue" ? "#0A66FF" : meta.color === "yellow" ? "#FFCB1F" : meta.color === "orange" ? "#FF8514" : meta.color === "purple" ? "#8A4FFF" : "#9B9A95" }}>
            {meta.label}
          </div>
        </div>
      </div>
      {agent.currentCallLeadName && (
        <div className="text-[9px] text-white/50 truncate">
          📞 {agent.currentCallLeadName}
        </div>
      )}
    </div>
  );
}

function Insight({ emoji, text, action }: { emoji: string; text: string; action: string }) {
  return (
    <div className="rounded-xl bg-white/5 border border-white/10 p-3 hover:bg-white/10 transition group cursor-pointer">
      <div className="flex items-start gap-2 mb-2">
        <span className="text-base shrink-0">{emoji}</span>
        <p className="text-[12px] text-white/90 leading-snug">{text}</p>
      </div>
      <button className="text-[10px] font-bold text-bingo-green hover:underline">
        {action} ←
      </button>
    </div>
  );
}
