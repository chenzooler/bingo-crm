"use client";
import * as React from "react";
import Link from "next/link";
import {
  ChevronLeft, Phone, MessageCircle, Mail, Sparkles, AlertTriangle, CheckCircle2,
  Circle, Clock, FileSignature, Trophy, Send, Wallet, Shield,
  Smile, Frown, Meh, CreditCard, Building2, TrendingUp, Award,
  User as UserIcon, ChevronRight, ChevronDown, Briefcase, Home, Car, Plane, Heart,
  Cake, Receipt, Activity as ActivityIcon, MessageSquare, MoreHorizontal, Plus,
  Calendar, Zap, Star, Rocket, Target, Banknote, Flame, Coins,
} from "lucide-react";
import type { Lead } from "@/lib/types";
import { Avatar } from "@/components/ui/Avatar";
import { Icon3D } from "@/components/ui/Icon3D";
import { Confetti } from "@/components/ui/Confetti";
import { HotLeadBadge } from "@/components/ui/HotLeadBadge";
import { LiveAgentTicker } from "@/components/ui/LiveAgentTicker";
import { FloatingActionBar } from "@/components/ui/FloatingActionBar";
import { cn, formatCurrency } from "@/lib/utils";

type Phase = "qualify" | "sign" | "auction" | "close";

interface PhaseDef {
  key: Phase;
  label: string;
  sublabel: string;
  icon: React.ElementType;
  tone: "blue" | "purple" | "orange" | "green" | "indigo" | "bingo";
}

const PHASES: PhaseDef[] = [
  { key: "qualify", label: "שאלון", sublabel: "סינון",     icon: Target,        tone: "blue" },
  { key: "sign",    label: "חתימה", sublabel: "חוזה",       icon: FileSignature, tone: "indigo" },
  { key: "auction", label: "מכרז",   sublabel: "12 גופים",  icon: Trophy,        tone: "orange" },
  { key: "close",   label: "סגירה",   sublabel: "אישור",     icon: Rocket,        tone: "bingo" },
];

export function LeadJourney({ lead: initial }: { lead: Lead }) {
  const [lead, setLead] = React.useState<Lead>(initial);
  const [phase, setPhase] = React.useState<Phase>(() => derivePhase(initial));
  const [confettiTrigger, setConfettiTrigger] = React.useState(0);

  function set<K extends keyof Lead>(key: K, val: Lead[K]) {
    setLead((l) => ({ ...l, [key]: val }));
  }

  function advanceTo(next: Phase) {
    setConfettiTrigger((c) => c + 1);
    setPhase(next);
  }

  const bdiNegative = lead.smileyAuto === "red" || lead.smileyAuto === "yellow" ||
    lead.hadCreditIssues === true || lead.accountRestricted === true ||
    (lead.creditCards?.includes("none")) || lead.cardLimit === "below-5k";

  // Compute "temperature" based on score + signals
  const score = 88;
  const temperature: "cold" | "warm" | "hot" | "blazing" =
    score >= 90 ? "blazing" : score >= 75 ? "hot" : score >= 50 ? "warm" : "cold";

  return (
    <>
      <Confetti trigger={confettiTrigger} count={40} />

      <div className="-mx-6 -mt-6 min-h-[calc(100vh-64px)] relative pb-24" style={{ background: "#F5F5F7" }}>
        <Toolbar lead={lead} bdiNegative={bdiNegative} temperature={temperature} score={score} />

        <div className="relative max-w-[1400px] mx-auto px-6 py-5">
          <PhaseRail current={phase} onChange={setPhase} />

          <div className="mt-5 grid grid-cols-12 gap-5">
            <main className="col-span-9 space-y-4">
              {phase === "qualify" && <QualifyFull lead={lead} set={set} bdiNegative={bdiNegative} onAdvance={() => advanceTo("sign")} />}
              {phase === "sign"    && <SignFull lead={lead} onAdvance={() => advanceTo("auction")} />}
              {phase === "auction" && <AuctionFull lead={lead} onAdvance={() => advanceTo("close")} />}
              {phase === "close"   && <CloseFull lead={lead} />}
            </main>

            <aside className="col-span-3 space-y-4">
              <LiveAgentTicker />
              <LeadStatsCard lead={lead} />
              <ActivityRail lead={lead} />
              <TasksRail />
            </aside>
          </div>
        </div>

        <FloatingActionBar />
      </div>
    </>
  );
}

/* ============================================================
   TOOLBAR — translucent with vibrant accents
   ============================================================ */
function Toolbar({ lead, bdiNegative, temperature, score }: { lead: Lead; bdiNegative: boolean; temperature: "cold" | "warm" | "hot" | "blazing"; score: number }) {
  const [fromCockpit, setFromCockpit] = React.useState(false);
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      setFromCockpit(new URLSearchParams(window.location.search).get("from") === "cockpit");
    }
  }, []);
  return (
    <>
      {/* Live-call banner when arrived from cockpit */}
      {fromCockpit && (
        <div className="bg-gradient-to-r from-bingo-green via-emerald-500 to-bingo-green-dark text-white px-6 py-2 flex items-center justify-center gap-3 shadow-lg shadow-green-500/30 animate-in slide-in-from-top duration-500">
          <span className="size-2 rounded-full bg-white dot-pulse" />
          <span className="text-[12px] font-black uppercase tracking-widest">שיחה חיה · נציג מחובר עם הלקוח</span>
          <span className="opacity-70">·</span>
          <Link href="/dialer/cockpit" className="text-[11px] font-bold underline hover:no-underline">
            ← חזור לתותח
          </Link>
        </div>
      )}
    <div className="sticky top-0 z-40 backdrop-blur-2xl bg-white/60 border-b border-white/40">
      <div className="max-w-[1400px] mx-auto px-6 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Link href="/leads" className="text-[12px] font-medium text-slate-600 hover:text-bingo-green-dark flex items-center gap-1 transition">
              <ChevronRight className="size-3.5" />
              <span>לידים</span>
            </Link>
            <div className="h-4 w-px bg-slate-300/60" />
            <div className="relative">
              <Avatar name={lead.fullName} size={40} />
              <span className="absolute -bottom-0.5 -left-0.5 size-3 rounded-full bg-emerald-500 border-2 border-white" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-[17px] font-bold text-slate-900 truncate">{lead.fullName}</h1>
                <HotLeadBadge temperature={temperature} score={score} />
                {bdiNegative && <BDIBadge />}
              </div>
              <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                <span>ID: {lead.idNumber || "—"}</span>
                <span className="opacity-40">·</span>
                <span dir="ltr">{lead.phone}</span>
                {lead.amountRequested && (
                  <>
                    <span className="opacity-40">·</span>
                    <span className="font-black text-gradient-bingo tabular-nums">
                      {formatCurrency(lead.amountRequested)}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ToolbarAction icon={<Phone className="size-3.5" />} label="חיוג" tone="green" />
            <ToolbarAction icon={<MessageCircle className="size-3.5" />} label="WhatsApp" tone="emerald" />
            <ToolbarAction icon={<Mail className="size-3.5" />} label="SMS" tone="blue" />
            <button className="btn-vibrant">
              <Sparkles className="size-3.5" />
              AI Co-pilot
            </button>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}

function ToolbarAction({ icon, label, tone }: { icon: React.ReactNode; label: string; tone: string }) {
  const tones: Record<string, string> = {
    green: "bg-white hover:bg-emerald-50 border-emerald-200/60 text-emerald-700",
    emerald: "bg-white hover:bg-emerald-50 border-emerald-200/60 text-emerald-700",
    blue: "bg-white hover:bg-blue-50 border-blue-200/60 text-blue-700",
  };
  return (
    <button className={cn("inline-flex items-center gap-1.5 h-9 px-3.5 rounded-xl border text-[12px] font-semibold transition shadow-sm hover:shadow-md", tones[tone])}>
      {icon}
      {label}
    </button>
  );
}

function BDIBadge() {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-gradient-to-r from-red-500 to-rose-500 text-white text-[10px] font-bold shadow-sm shadow-red-500/30 animate-pulse">
      <AlertTriangle className="size-2.5" />
      BDI שלילי
    </span>
  );
}

function ScoreBadge({ score }: { score: number }) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-700 text-[10px] font-bold border border-amber-200">
      <Star className="size-2.5 fill-amber-500 stroke-0" />
      {score}
    </span>
  );
}

/* ============================================================
   PHASE RAIL — animated chunky steps with 3D icons
   ============================================================ */
function PhaseRail({ current, onChange }: { current: Phase; onChange: (p: Phase) => void }) {
  const idx = PHASES.findIndex((p) => p.key === current);
  return (
    <div className="card-vibrant p-4">
      <div className="relative flex items-center justify-between">
        <div className="absolute top-1/2 left-8 right-8 h-1 bg-slate-200/60 rounded-full -translate-y-1/2" />
        <div
          className="absolute top-1/2 left-8 h-1 rounded-full -translate-y-1/2 transition-all duration-700"
          style={{
            width: `calc(${(idx / (PHASES.length - 1)) * 100}% - ${(idx / (PHASES.length - 1)) * 16}px)`,
            background: "linear-gradient(90deg, #3B82F6, #4F46E5, #F59E0B, #50FF0A)",
            boxShadow: "0 0 18px rgba(80, 255, 10, 0.45)",
          }}
        />
        {PHASES.map((p, i) => {
          const Icon = p.icon;
          const done = i < idx;
          const active = i === idx;
          return (
            <button
              key={p.key}
              onClick={() => onChange(p.key)}
              className="relative z-10 flex flex-col items-center gap-2 group"
            >
              <div className={cn(
                "transition-all duration-300",
                active && "scale-110",
              )}>
                <Icon3D
                  icon={done ? <CheckCircle2 className="size-6" /> : <Icon className="size-6" />}
                  tone={done ? "green" : active ? p.tone : "indigo"}
                  size={56}
                  className={cn(
                    !done && !active && "opacity-50 saturate-50",
                    active && "ring-4 ring-white shadow-xl",
                  )}
                />
              </div>
              <div className="text-center">
                <div className={cn(
                  "text-[12px] font-bold transition-colors",
                  active ? "text-slate-900" : done ? "text-emerald-700" : "text-slate-400"
                )}>{p.label}</div>
                <div className="text-[10px] text-slate-400">{p.sublabel}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ============================================================
   PHASE 1 — FULL QUESTIONNAIRE (vibrant, all visible)
   ============================================================ */
function QualifyFull({ lead, set, bdiNegative, onAdvance }: {
  lead: Lead;
  set: <K extends keyof Lead>(key: K, val: Lead[K]) => void;
  bdiNegative: boolean;
  onAdvance: () => void;
}) {
  const completion = computeCompletion(lead);

  return (
    <div className="space-y-4">
      {/* Hero header card */}
      <div className="card-vibrant p-6 relative shimmer-overlay">
        <div className="flex items-start justify-between gap-6">
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 text-[10px] font-bold px-2 py-1 rounded-md bg-blue-100 text-blue-700 mb-3">
              <Zap className="size-3" />
              שלב 1 מתוך 4 · שאלון אבחון
            </div>
            <h2 className="text-[28px] font-black tracking-tight leading-tight">
              <span className="text-slate-900">בואו נכיר את </span>
              <span className="text-gradient-bingo">{lead.firstName || lead.fullName}</span>
            </h2>
            <p className="text-[13px] text-slate-600 mt-2 max-w-md">
              מלא את כל הסעיפים. הניתוב לחבילה (כל מטרה / רכב) נקבע אוטומטית.
            </p>
          </div>
          <CompletionRing pct={completion} />
        </div>

        {bdiNegative && (
          <div className="mt-4 card-glow-amber p-3.5 flex items-start gap-3">
            <Icon3D icon={<AlertTriangle className="size-4" />} tone="orange" size={32} />
            <div className="flex-1">
              <div className="text-[13px] font-bold text-amber-900">ניתוב אוטומטי למחלקת רכב 🚗</div>
              <div className="text-[11px] text-amber-800/80 mt-0.5">לפי הסימנים — הלקוח אינו זכאי להלוואה לכל מטרה.</div>
            </div>
          </div>
        )}
      </div>

      {/* === Sections with 3D icons === */}
      <SectionCard icon={Shield}    tone="red"    title="סינון ראשוני"  subtitle="קובע את המסלול">
        <FieldGroup>
          <FieldRow label="סמיילי בנק ישראל" hint="אדום/כתום → רכב">
            <SmileyControl value={lead.smileyAuto} onChange={(v) => set("smileyAuto", v as any)} />
          </FieldRow>
          <FieldRow label="הגבלת אשראי / הוצאה לפועל">
            <YesNoControl value={lead.hadCreditIssues} onChange={(v) => set("hadCreditIssues", v)} negative />
          </FieldRow>
          <FieldRow label="חשבון בנק מוגבל">
            <YesNoControl value={lead.accountRestricted} onChange={(v) => set("accountRestricted", v)} negative />
          </FieldRow>
        </FieldGroup>
      </SectionCard>

      <SectionCard icon={Banknote}  tone="green"  title="פרטי הלוואה"   subtitle="סכום ומטרה">
        <FieldGroup>
          <FieldRow label="מטרת ההלוואה">
            <PurposeControl value={lead.loanPurpose} onChange={(v) => set("loanPurpose", v as any)} />
          </FieldRow>
          <FieldRow label="סכום מבוקש">
            <AmountControl value={lead.amountRequested} onChange={(v) => set("amountRequested", v)} />
          </FieldRow>
        </FieldGroup>
      </SectionCard>

      <SectionCard icon={CreditCard} tone="purple" title="כרטיסי אשראי" subtitle="סוג ומסגרת">
        <FieldGroup>
          <FieldRow label="כרטיסים פעילים">
            <CardsControl value={lead.creditCards} onChange={(v) => set("creditCards", v as any)} />
          </FieldRow>
          <FieldRow label="מסגרת בכרטיס המרכזי" hint="פחות מ-5,000 → רכב">
            <CardLimitControl value={lead.cardLimit} onChange={(v) => set("cardLimit", v as any)} />
          </FieldRow>
        </FieldGroup>
      </SectionCard>

      <SectionCard icon={Briefcase} tone="cyan"   title="תעסוקה והכנסה">
        <FieldGroup>
          <FieldRow label="סטטוס תעסוקתי">
            <EmploymentControl value={lead.employmentStatus} onChange={(v) => set("employmentStatus", v as any)} />
          </FieldRow>
          <FieldRow label="ותק במקום העבודה" hint="במספר חודשים">
            <NumberInput value={lead.employmentTenure} onChange={(v) => set("employmentTenure", v)} placeholder="36" suffix="חודשים" />
          </FieldRow>
          <FieldRow label="הכנסה חודשית נטו">
            <NumberInput value={lead.monthlyIncome} onChange={(v) => set("monthlyIncome", v)} placeholder="12,000" suffix="₪" />
          </FieldRow>
          <FieldRow label="הכנסת בן/בת זוג">
            <NumberInput value={lead.spouseIncome} onChange={(v) => set("spouseIncome", v)} placeholder="0" suffix="₪" />
          </FieldRow>
        </FieldGroup>
      </SectionCard>

      <SectionCard icon={Home}      tone="orange" title="נכסים ורכוש">
        <FieldGroup>
          <FieldRow label="נכס בבעלות">
            <PropertyControl value={lead.hasProperty} onChange={(v) => set("hasProperty", v as any)} />
          </FieldRow>
          <FieldRow label="רכב בבעלות">
            <YesNoControl value={lead.hasVehicle} onChange={(v) => set("hasVehicle", v)} />
          </FieldRow>
          {lead.hasVehicle && (
            <>
              <FieldRow label="שנת ייצור">
                <NumberInput value={lead.vehicleYear} onChange={(v) => set("vehicleYear", v)} placeholder="2020" />
              </FieldRow>
              <FieldRow label="יצרן">
                <TextInput value={lead.vehicleMake} onChange={(v) => set("vehicleMake", v as any)} placeholder="טויוטה" />
              </FieldRow>
            </>
          )}
        </FieldGroup>
      </SectionCard>

      <SectionCard icon={Building2} tone="indigo" title="פרטי בנק">
        <FieldGroup>
          <FieldRow label="שם בנק">
            <TextInput value={lead.bankName} onChange={(v) => set("bankName", v as any)} placeholder="הפועלים" />
          </FieldRow>
          <FieldRow label="סניף">
            <TextInput value={lead.bankBranch} onChange={(v) => set("bankBranch", v as any)} placeholder="600" />
          </FieldRow>
          <FieldRow label="מספר חשבון">
            <TextInput value={lead.bankAccount} onChange={(v) => set("bankAccount", v as any)} placeholder="123456" />
          </FieldRow>
        </FieldGroup>
      </SectionCard>

      {/* Sticky CTA footer */}
      <div className="card-vibrant p-4 flex items-center justify-between sticky bottom-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="size-2 rounded-full bg-gradient-to-r from-lime-400 to-green-500 dot-pulse" />
          <span className="text-[13px] font-semibold text-slate-700">
            {completion === 100 ? "השאלון מלא — מוכן לחתימה" : `${Math.round(completion)}% הושלמו`}
          </span>
        </div>
        <button onClick={onAdvance} className="btn-vibrant">
          המשך לחתימה
          <ChevronLeft className="size-3.5" />
        </button>
      </div>
    </div>
  );
}

/* ============================================================
   SECTION CARD — vibrant with 3D icon
   ============================================================ */
function SectionCard({ icon: Icon, tone, title, subtitle, children }: {
  icon: React.ElementType;
  tone: "purple" | "blue" | "cyan" | "green" | "orange" | "red" | "pink" | "indigo" | "teal" | "rose" | "yellow" | "lime";
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(true);
  return (
    <div className="card-vibrant overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full px-5 py-4 flex items-center justify-between hover:bg-white/40 transition"
      >
        <div className="flex items-center gap-3.5">
          <Icon3D icon={<Icon className="size-5" />} tone={tone} size={40} />
          <div className="text-right">
            <div className="text-[15px] font-bold text-slate-900">{title}</div>
            {subtitle && <div className="text-[11px] text-slate-500 mt-0.5">{subtitle}</div>}
          </div>
        </div>
        <ChevronDown className={cn("size-4 text-slate-400 transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <>
          <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
          <div className="p-5">{children}</div>
        </>
      )}
    </div>
  );
}

function FieldGroup({ children }: { children: React.ReactNode }) {
  return <div className="space-y-4">{children}</div>;
}

function FieldRow({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-12 gap-4 items-start">
      <div className="col-span-4">
        <div className="text-[13px] font-semibold text-slate-800">{label}</div>
        {hint && <div className="text-[11px] text-slate-400 mt-0.5">{hint}</div>}
      </div>
      <div className="col-span-8">{children}</div>
    </div>
  );
}

/* ============================================================
   FIELD CONTROLS — vibrant
   ============================================================ */
function SmileyControl({ value, onChange }: { value?: string; onChange: (v: string) => void }) {
  const opts = [
    { v: "green",  label: "ירוק", Icon: Smile, grad: "from-emerald-400 to-green-600", ring: "ring-emerald-300" },
    { v: "yellow", label: "כתום", Icon: Meh,   grad: "from-amber-400 to-orange-600",  ring: "ring-amber-300" },
    { v: "red",    label: "אדום", Icon: Frown, grad: "from-rose-400 to-red-600",      ring: "ring-rose-300" },
  ];
  return (
    <div className="grid grid-cols-3 gap-2.5">
      {opts.map((o) => {
        const sel = value === o.v;
        const Icon = o.Icon;
        return (
          <button
            key={o.v}
            onClick={() => onChange(o.v)}
            className={cn(
              "relative flex flex-col items-center gap-2 py-4 rounded-xl border transition overflow-hidden",
              sel ? `bg-gradient-to-br ${o.grad} text-white border-transparent shadow-lg` : "bg-white border-slate-200 text-slate-500 hover:border-slate-300"
            )}
          >
            <Icon className="size-8" />
            <span className="text-[13px] font-bold">{o.label}</span>
            {sel && <span className="absolute top-2 right-2 size-2 rounded-full bg-white/80 dot-pulse" />}
          </button>
        );
      })}
    </div>
  );
}

function YesNoControl({ value, onChange, negative }: { value?: boolean | null; onChange: (v: boolean) => void; negative?: boolean }) {
  return (
    <div className="inline-flex p-1 bg-slate-100 rounded-xl">
      <button
        onClick={() => onChange(false)}
        className={cn(
          "px-5 py-2 text-[12px] font-bold rounded-lg transition",
          value === false ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"
        )}
      >
        ✗ לא
      </button>
      <button
        onClick={() => onChange(true)}
        className={cn(
          "px-5 py-2 text-[12px] font-bold rounded-lg transition",
          value === true
            ? negative
              ? "bg-gradient-to-r from-rose-500 to-red-600 text-white shadow-sm shadow-red-500/30"
              : "bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-sm shadow-emerald-500/30"
            : "text-slate-500 hover:text-slate-900"
        )}
      >
        ✓ כן
      </button>
    </div>
  );
}

const PURPOSES = [
  { v: "debt-cover", label: "כיסוי חובות", Icon: Receipt,    tone: "red"    as const },
  { v: "vehicle",    label: "רכב",          Icon: Car,        tone: "blue"   as const },
  { v: "renovation", label: "שיפוץ",        Icon: Home,       tone: "orange" as const },
  { v: "vacation",   label: "חופשה",        Icon: Plane,      tone: "cyan"   as const },
  { v: "event",      label: "אירוע",        Icon: Cake,       tone: "pink"   as const },
  { v: "business",   label: "עסק",          Icon: Briefcase,  tone: "indigo" as const },
  { v: "studies",    label: "לימודים",      Icon: Award,      tone: "purple" as const },
  { v: "health",     label: "רפואה",         Icon: Heart,      tone: "rose"   as const },
  { v: "other",      label: "אחר",          Icon: MoreHorizontal, tone: "teal" as const },
];

function PurposeControl({ value, onChange }: { value?: string; onChange: (v: string) => void }) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {PURPOSES.map((p) => {
        const sel = value === p.v;
        const Icon = p.Icon;
        return (
          <button
            key={p.v}
            onClick={() => onChange(p.v)}
            className={cn(
              "flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-right transition",
              sel ? "border-lime-400 bg-gradient-to-br from-lime-50 to-green-50 shadow-md shadow-green-500/20" : "bg-white border-slate-200 hover:border-slate-300"
            )}
          >
            <Icon3D icon={<Icon className="size-3.5" />} tone={p.tone} size={28} />
            <span className={cn("text-[12px] font-semibold", sel ? "text-green-900" : "text-slate-700")}>{p.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function AmountControl({ value, onChange }: { value?: number; onChange: (v: number) => void }) {
  const presets = [20000, 50000, 100000, 150000, 200000, 300000];
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-6 gap-2">
        {presets.map((p) => (
          <button
            key={p}
            onClick={() => onChange(p)}
            className={cn(
              "py-2.5 text-[12px] font-bold rounded-lg border tabular-nums transition",
              value === p
                ? "bg-gradient-to-br from-lime-400 via-green-500 to-emerald-600 text-white border-transparent shadow-md shadow-green-500/40"
                : "bg-white border-slate-200 text-slate-700 hover:border-slate-300"
            )}
          >
            {(p / 1000).toFixed(0)}K
          </button>
        ))}
      </div>
      <input
        type="number"
        value={value || ""}
        onChange={(e) => onChange(Number(e.target.value))}
        placeholder="או הזן סכום ידני"
        className="w-full h-10 px-3 rounded-lg border border-slate-200 text-[13px] text-slate-900 placeholder:text-slate-400 focus:border-green-500 focus:ring-2 focus:ring-green-500/25 outline-none transition tabular-nums"
      />
    </div>
  );
}

function CardsControl({ value, onChange }: { value?: string[]; onChange: (v: string[]) => void }) {
  const opts = [
    { v: "isracard", label: "ישראכרט", tone: "blue"   as const },
    { v: "cal",      label: "כאל",      tone: "purple" as const },
    { v: "max",      label: "MAX",     tone: "orange" as const },
    { v: "direct",   label: "Direct",  tone: "cyan"   as const },
    { v: "none",     label: "אין כרטיס", tone: "red"   as const, neg: true },
  ];
  function toggle(v: string) {
    const cur = value || [];
    if (cur.includes(v)) onChange(cur.filter((x) => x !== v));
    else onChange([...cur, v]);
  }
  return (
    <div className="flex flex-wrap gap-2">
      {opts.map((o) => {
        const sel = (value || []).includes(o.v);
        return (
          <button
            key={o.v}
            onClick={() => toggle(o.v)}
            className={cn(
              "inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-[12px] font-semibold transition",
              sel
                ? o.neg
                  ? "bg-gradient-to-r from-rose-500 to-red-600 text-white border-transparent shadow-md"
                  : "bg-gradient-to-br from-lime-400 via-green-500 to-emerald-600 text-white border-transparent shadow-md"
                : "bg-white border-slate-200 text-slate-700 hover:border-slate-300"
            )}
          >
            {!sel && <Icon3D icon={<CreditCard className="size-3" />} tone={o.tone} size={20} />}
            {sel && <CreditCard className="size-3.5" />}
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

function CardLimitControl({ value, onChange }: { value?: string; onChange: (v: string) => void }) {
  return (
    <div className="grid grid-cols-2 gap-2.5">
      <button
        onClick={() => onChange("above-5k")}
        className={cn(
          "p-4 rounded-xl border text-right transition",
          value === "above-5k" ? "bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-300 shadow-md" : "bg-white border-slate-200 hover:border-slate-300"
        )}
      >
        <div className="flex items-center justify-between mb-1">
          <CheckCircle2 className={cn("size-4", value === "above-5k" ? "text-emerald-600" : "text-slate-300")} />
          <div className="text-[15px] font-black text-slate-900 tabular-nums">5,000₪+</div>
        </div>
        <div className="text-[11px] font-semibold text-emerald-700">תקין — לכל מטרה</div>
      </button>
      <button
        onClick={() => onChange("below-5k")}
        className={cn(
          "p-4 rounded-xl border text-right transition",
          value === "below-5k" ? "bg-gradient-to-br from-rose-50 to-red-50 border-rose-300 shadow-md" : "bg-white border-slate-200 hover:border-slate-300"
        )}
      >
        <div className="flex items-center justify-between mb-1">
          <AlertTriangle className={cn("size-4", value === "below-5k" ? "text-rose-600" : "text-slate-300")} />
          <div className="text-[15px] font-black text-slate-900 tabular-nums">פחות מ-5,000₪</div>
        </div>
        <div className="text-[11px] font-semibold text-rose-600">מסלול רכב</div>
      </button>
    </div>
  );
}

function EmploymentControl({ value, onChange }: { value?: string; onChange: (v: string) => void }) {
  const opts = [
    { v: "employee",      label: "שכיר",    Icon: Building2,  tone: "blue"   as const },
    { v: "self-employed", label: "עצמאי",   Icon: Briefcase,  tone: "purple" as const },
    { v: "retired",       label: "פנסיונר", Icon: Award,      tone: "green"  as const },
    { v: "stipend",       label: "קצבה",    Icon: Coins,      tone: "yellow" as const },
    { v: "unemployed",    label: "ללא",     Icon: Circle,     tone: "red"    as const },
  ];
  return (
    <div className="grid grid-cols-5 gap-2">
      {opts.map((o) => {
        const sel = value === o.v;
        const Icon = o.Icon;
        return (
          <button
            key={o.v}
            onClick={() => onChange(o.v)}
            className={cn(
              "flex flex-col items-center gap-1.5 py-3 rounded-xl border text-[11px] font-semibold transition",
              sel ? "border-lime-400 bg-gradient-to-br from-lime-50 to-green-50 shadow-md shadow-green-500/20 text-green-900" : "bg-white border-slate-200 text-slate-700 hover:border-slate-300"
            )}
          >
            <Icon3D icon={<Icon className="size-4" />} tone={o.tone} size={32} />
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

function PropertyControl({ value, onChange }: { value?: string; onChange: (v: string) => void }) {
  const opts = [
    { v: "yes",         label: "כן, חופשי" },
    { v: "yes-charged", label: "כן, ממושכן" },
    { v: "no",          label: "אין" },
  ];
  return (
    <div className="inline-flex p-1 bg-slate-100 rounded-xl">
      {opts.map((o) => (
        <button
          key={o.v}
          onClick={() => onChange(o.v)}
          className={cn(
            "px-4 py-2 text-[12px] font-bold rounded-lg transition",
            value === o.v ? "bg-gradient-to-br from-lime-400 via-green-500 to-emerald-600 text-white shadow-sm" : "text-slate-500 hover:text-slate-900"
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function NumberInput({ value, onChange, placeholder, suffix }: { value?: number; onChange: (v: number) => void; placeholder?: string; suffix?: string }) {
  return (
    <div className="relative inline-flex w-full">
      <input
        type="number"
        value={value || ""}
        onChange={(e) => onChange(Number(e.target.value))}
        placeholder={placeholder}
        className="w-full h-10 px-3 rounded-lg border border-slate-200 text-[13px] text-slate-900 placeholder:text-slate-400 focus:border-green-500 focus:ring-2 focus:ring-green-500/25 outline-none transition tabular-nums"
      />
      {suffix && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[11px] font-medium text-slate-400">{suffix}</span>}
    </div>
  );
}

function TextInput({ value, onChange, placeholder }: { value?: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <input
      type="text"
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full h-10 px-3 rounded-lg border border-slate-200 text-[13px] text-slate-900 placeholder:text-slate-400 focus:border-green-500 focus:ring-2 focus:ring-green-500/25 outline-none transition"
    />
  );
}

/* ============================================================
   PHASE 2 — SIGN
   ============================================================ */
function SignFull({ lead, onAdvance }: { lead: Lead; onAdvance: () => void }) {
  const [channel, setChannel] = React.useState<"whatsapp" | "sms">("whatsapp");
  const [sent, setSent] = React.useState(false);
  const [signed, setSigned] = React.useState(false);

  function send() {
    setSent(true);
    setTimeout(() => setSigned(true), 3500);
  }

  return (
    <div className="card-vibrant p-6 relative">
      <div className="absolute top-6 left-6">
        <Icon3D icon={<FileSignature className="size-6" />} tone="bingo" size={56} className="float-rotate" />
      </div>

      <div className="inline-flex items-center gap-2 text-[10px] font-bold px-2 py-1 rounded-md bg-bingo-green/15 text-bingo-green-deep mb-3">
        <Zap className="size-3" />
        שלב 2 מתוך 4 · חתימה דיגיטלית
      </div>
      <h2 className="text-[26px] font-black tracking-tight">
        <span className="text-gradient-bingo">חתימה</span>
        <span className="text-slate-900"> ב-30 שניות</span>
      </h2>
      <p className="text-[13px] text-slate-600 mb-6 mt-1">שלח חוזה בערוץ המתאים והלקוח חותם מהמכשיר שלו.</p>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <ChannelCard icon={MessageCircle} tone="green" label="WhatsApp" sub="87% פתיחה" active={channel === "whatsapp"} onClick={() => setChannel("whatsapp")} />
        <ChannelCard icon={Mail}          tone="blue"  label="SMS"      sub="חלופה — ללא WhatsApp" active={channel === "sms"} onClick={() => setChannel("sms")} />
      </div>

      <div className="card-glow-bingo p-4 mb-4">
        <div className="text-[10px] font-bold text-bingo-green-dark uppercase tracking-wider mb-2">תצוגה מקדימה של ההודעה</div>
        <div className="text-[13px] leading-relaxed text-slate-700">
          שלום {lead.firstName || lead.fullName} 👋<br />
          להלן קישור לחתימה דיגיטלית על חוזה הלוואה לסך{" "}
          <span className="font-bold text-bingo-green-dark tabular-nums">{formatCurrency(lead.amountRequested || 50000)}</span>.<br />
          ⏱ חתימה לוקחת 30 שניות.<br />
          <span className="text-bingo-green-dark underline">https://bingo.app/sign/{lead.id}</span>
        </div>
      </div>

      {!sent ? (
        <button onClick={send} className="btn-vibrant w-full justify-center" style={{ padding: "12px 18px", fontSize: "14px" }}>
          <Send className="size-4" />
          שלח חוזה ב-{channel === "whatsapp" ? "WhatsApp" : "SMS"}
        </button>
      ) : !signed ? (
        <div className="flex items-center justify-center gap-2.5 py-4 text-[14px] font-semibold text-slate-600">
          <Clock className="size-5 animate-spin text-bingo-green-dark" />
          ממתין לחתימת הלקוח...
        </div>
      ) : (
        <div className="text-center py-4 animate-in zoom-in">
          <div className="inline-flex items-center gap-2.5 text-[16px] font-black text-emerald-700 mb-3">
            <CheckCircle2 className="size-6" />
            החוזה נחתם בהצלחה
          </div>
          <button onClick={onAdvance} className="btn-vibrant-green inline-flex items-center gap-2 mx-auto" style={{ padding: "10px 18px", borderRadius: "11px", fontSize: "13px", fontWeight: 600, color: "white" }}>
            <Trophy className="size-4" />
            התחל מכרז זכאות
          </button>
        </div>
      )}
    </div>
  );
}

function ChannelCard({ icon: Icon, tone, label, sub, active, onClick }: {
  icon: React.ElementType;
  tone: "green" | "blue";
  label: string;
  sub: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "p-4 rounded-xl border text-right transition",
        active ? "border-lime-400 bg-gradient-to-br from-lime-50 to-green-50 shadow-lg shadow-green-500/20" : "bg-white border-slate-200 hover:border-slate-300"
      )}
    >
      <div className="flex items-center gap-3">
        <Icon3D icon={<Icon className="size-4" />} tone={tone === "green" ? "green" : "blue"} size={40} />
        <div>
          <div className="text-[14px] font-bold text-slate-900">{label}</div>
          <div className="text-[11px] text-slate-500">{sub}</div>
        </div>
      </div>
    </button>
  );
}

/* ============================================================
   PHASE 3 — AUCTION
   ============================================================ */
const LENDERS = [
  { key: "jerusalem", name: "בנק ירושלים", tone: "blue"   as const },
  { key: "cal",       name: "כאל",          tone: "purple" as const },
  { key: "isracard",  name: "ישראכרט",      tone: "indigo" as const },
  { key: "max",       name: "MAX",         tone: "orange" as const },
  { key: "leumi",     name: "לאומי",        tone: "red"    as const },
  { key: "hapoalim",  name: "הפועלים",      tone: "rose"   as const },
  { key: "discount",  name: "דיסקונט",      tone: "green"  as const },
  { key: "mizrahi",   name: "מזרחי",        tone: "cyan"   as const },
  { key: "esh",       name: "ESH",         tone: "yellow" as const },
  { key: "panim",     name: "פנים",        tone: "teal"   as const },
  { key: "abedalim",  name: "אבדאלים",      tone: "lime"   as const },
  { key: "shotef",    name: "שוטף+",       tone: "pink"   as const },
];

type CheckState = { status: "pending" | "running" | "approved" | "rejected"; amount?: number; interest?: number };

function AuctionFull({ lead, onAdvance }: { lead: Lead; onAdvance: () => void }) {
  const [checks, setChecks] = React.useState<Record<string, CheckState>>(() =>
    Object.fromEntries(LENDERS.map((l) => [l.key, { status: "pending" as const }]))
  );
  const [started, setStarted] = React.useState(false);

  React.useEffect(() => {
    if (!started) return;
    LENDERS.forEach((l, i) => {
      setTimeout(() => {
        setChecks((prev) => ({ ...prev, [l.key]: { status: "running" } }));
        setTimeout(() => {
          const approved = Math.random() > 0.4;
          const amount = approved ? Math.round((30000 + Math.random() * 100000) / 1000) * 1000 : undefined;
          const interest = approved ? Number((6 + Math.random() * 6).toFixed(2)) : undefined;
          setChecks((prev) => ({ ...prev, [l.key]: { status: approved ? "approved" : "rejected", amount, interest } }));
        }, 1500 + Math.random() * 2000);
      }, i * 350);
    });
  }, [started]);

  const approved = LENDERS
    .map((l) => ({ ...l, ...checks[l.key] }))
    .filter((l) => l.status === "approved")
    .sort((a, b) => (b.amount || 0) - (a.amount || 0));
  const best = approved[0];
  const done = Object.values(checks).filter((c) => c.status === "approved" || c.status === "rejected").length;
  const allDone = done === LENDERS.length;

  return (
    <div className="space-y-4">
      <div className="card-vibrant p-6 relative">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <Icon3D icon={<Trophy className="size-6" />} tone="orange" size={56} className="float-rotate" />
            <div>
              <div className="inline-flex items-center gap-2 text-[10px] font-bold px-2 py-1 rounded-md bg-amber-100 text-amber-700 mb-2">
                <Flame className="size-3" />
                שלב 3 מתוך 4 · מכרז זכאות
              </div>
              <h2 className="text-[26px] font-black tracking-tight">
                <span className="text-gradient-warm">12 גופים</span>
                <span className="text-slate-900"> מתחרים על {lead.firstName || lead.fullName}</span>
              </h2>
              <p className="text-[13px] text-slate-600 mt-1">
                {!started ? "לחץ פתח מכרז כדי לפתוח את הבדיקות במקביל." : allDone ? "המכרז הסתיים. בחר את ההצעה הטובה ביותר." : `${done} מתוך ${LENDERS.length} השיבו`}
              </p>
            </div>
          </div>
          {!started && (
            <button onClick={() => setStarted(true)} className="btn-vibrant-orange inline-flex items-center gap-2" style={{ padding: "12px 20px", borderRadius: "11px", fontSize: "13px", fontWeight: 600, color: "white" }}>
              <Zap className="size-4" />
              פתח מכרז
            </button>
          )}
          {allDone && (
            <button onClick={onAdvance} className="btn-vibrant-green inline-flex items-center gap-2" style={{ padding: "12px 20px", borderRadius: "11px", fontSize: "13px", fontWeight: 600, color: "white" }}>
              עבור להחלטה
              <Rocket className="size-4" />
            </button>
          )}
        </div>
      </div>

      {best && (
        <div className="card-glow-amber p-5 shimmer-overlay">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Icon3D icon={<Trophy className="size-6" />} tone="yellow" size={56} />
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-amber-700">🏆 הצעה מובילה</div>
                <div className="text-[18px] font-black text-slate-900 mt-0.5">{best.name}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-[28px] font-black text-gradient-warm tabular-nums">{formatCurrency(best.amount || 0)}</div>
              <div className="text-[12px] font-semibold text-amber-700">ריבית {best.interest}%</div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-3">
        {LENDERS.map((l) => {
          const c = checks[l.key];
          return <LenderTile key={l.key} lender={l} state={c} />;
        })}
      </div>
    </div>
  );
}

function LenderTile({ lender, state }: { lender: { name: string; tone: any }; state: CheckState }) {
  return (
    <div className={cn(
      "p-4 rounded-2xl border transition-all duration-300 relative overflow-hidden",
      state.status === "pending"  && "bg-white border-slate-200 opacity-60",
      state.status === "running"  && "bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-300 shadow-md",
      state.status === "approved" && "bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-300 shadow-lg",
      state.status === "rejected" && "bg-white border-slate-200 opacity-40",
    )}>
      <div className="flex items-center justify-between mb-2">
        <Icon3D icon={<Building2 className="size-3.5" />} tone={lender.tone} size={32} />
        {state.status === "approved" && <CheckCircle2 className="size-5 text-emerald-600" />}
        {state.status === "rejected" && <Circle className="size-5 text-slate-300" />}
        {state.status === "running"  && <div className="size-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />}
      </div>
      <div className="text-[13px] font-bold text-slate-900">{lender.name}</div>
      {state.status === "approved" && (
        <div className="mt-1">
          <div className="text-[16px] font-black text-emerald-700 tabular-nums">{formatCurrency(state.amount || 0)}</div>
          <div className="text-[11px] text-slate-500">ריבית {state.interest}%</div>
        </div>
      )}
      {state.status === "rejected" && <div className="text-[11px] font-semibold text-slate-400">נדחה</div>}
      {state.status === "running"  && <div className="text-[11px] font-semibold text-blue-600">בודק...</div>}
      {state.status === "pending"  && <div className="text-[11px] font-semibold text-slate-400">בתור</div>}
    </div>
  );
}

/* ============================================================
   PHASE 4 — CLOSE
   ============================================================ */
function CloseFull({ lead }: { lead: Lead }) {
  const [sent, setSent] = React.useState(false);
  return (
    <div className="card-glow-green p-8 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 via-green-500 to-teal-500" />

      <div className="text-center">
        <Icon3D icon={<Rocket className="size-8" />} tone="green" size={80} className="mx-auto mb-4 float-rotate" />
        <div className="inline-flex items-center gap-2 text-[10px] font-bold px-2 py-1 rounded-md bg-emerald-100 text-emerald-700 mb-2">
          <Zap className="size-3" />
          שלב 4 מתוך 4 · סגירה
        </div>
        <h2 className="text-[28px] font-black tracking-tight">
          <span className="text-gradient-cool">סגירת עסקה</span>
          <span className="text-slate-900"> 🎉</span>
        </h2>
        <p className="text-[13px] text-slate-600 mt-1 mb-6">סקירת ההצעה הסופית ושליחה ללקוח לאישור.</p>
      </div>

      <div className="bg-white rounded-2xl p-5 mb-5 border border-emerald-100">
        <div className="grid grid-cols-2 gap-y-4">
          <SummaryItem label="לקוח" value={lead.fullName} icon={UserIcon} tone="blue" />
          <SummaryItem label="גוף מלווה" value="בנק ירושלים" icon={Building2} tone="indigo" />
          <SummaryItem label="סכום הלוואה" value={formatCurrency(lead.amountRequested || 0)} icon={Banknote} tone="green" highlight />
          <SummaryItem label="ריבית" value="6.4%" icon={TrendingUp} tone="orange" />
          <SummaryItem label="תקופה" value="60 חודשים" icon={Calendar} tone="purple" />
          <SummaryItem label="עמלת בינגו" value={formatCurrency(2500)} icon={Coins} tone="yellow" />
        </div>
      </div>

      {!sent ? (
        <button onClick={() => setSent(true)} className="btn-vibrant-green w-full justify-center" style={{ padding: "14px 18px", fontSize: "14px", fontWeight: 700, color: "white", borderRadius: "12px", display: "inline-flex", alignItems: "center", gap: "8px" }}>
          <Send className="size-5" />
          שלח הצעה סופית ללקוח
        </button>
      ) : (
        <div className="flex items-center justify-center gap-2.5 text-[16px] font-black text-emerald-700">
          <CheckCircle2 className="size-6" />
          ההצעה נשלחה — ממתין לאישור סופי
        </div>
      )}
    </div>
  );
}

function SummaryItem({ label, value, icon: Icon, tone, highlight }: {
  label: string;
  value: string;
  icon: React.ElementType;
  tone: any;
  highlight?: boolean;
}) {
  return (
    <div className={cn("flex items-center gap-2.5", highlight && "col-span-2 p-3 rounded-xl bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200")}>
      <Icon3D icon={<Icon className="size-3.5" />} tone={tone} size={32} />
      <div>
        <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">{label}</div>
        <div className={cn("font-black tabular-nums", highlight ? "text-[20px] text-emerald-700" : "text-[14px] text-slate-900")}>{value}</div>
      </div>
    </div>
  );
}

/* ============================================================
   RIGHT RAIL
   ============================================================ */
function LeadStatsCard({ lead }: { lead: Lead }) {
  return (
    <div className="card-glow-blue p-4">
      <div className="flex items-center gap-2 mb-3">
        <Icon3D icon={<Zap className="size-3.5" />} tone="blue" size={28} />
        <span className="text-[13px] font-bold text-slate-900">סטטיסטיקה חיה</span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <MiniStat label="קל״ט" value="היום" />
        <MiniStat label="מקור" value="Facebook" />
        <MiniStat label="ניסיונות" value="3" />
        <MiniStat label="ציון AI" value="88" accent />
      </div>
    </div>
  );
}

function MiniStat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="bg-white rounded-lg p-2 border border-slate-100">
      <div className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">{label}</div>
      <div className={cn("text-[14px] font-black tabular-nums mt-0.5", accent ? "text-gradient-warm" : "text-slate-900")}>{value}</div>
    </div>
  );
}

function ActivityRail({ lead }: { lead: Lead }) {
  const recent = (lead.activities || []).slice(0, 6);
  return (
    <div className="card-vibrant overflow-hidden">
      <div className="px-4 py-3 flex items-center justify-between border-b border-slate-100/70">
        <div className="flex items-center gap-2">
          <Icon3D icon={<ActivityIcon className="size-3" />} tone="purple" size={24} />
          <span className="text-[13px] font-bold text-slate-900">פעילות</span>
        </div>
        <button className="text-[11px] text-bingo-green-dark font-semibold hover:underline">הצג הכל</button>
      </div>
      <div className="divide-y divide-slate-100/70 max-h-72 overflow-y-auto">
        {recent.length === 0 ? (
          <div className="px-4 py-8 text-center text-[12px] text-slate-400">אין פעילות עדיין</div>
        ) : (
          recent.map((a) => <ActivityItem key={a.id} activity={a} />)
        )}
      </div>
      <div className="px-3 py-2 border-t border-slate-100/70">
        <button className="w-full inline-flex items-center justify-center gap-1.5 py-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-[11px] font-semibold text-slate-700 transition">
          <MessageSquare className="size-3" />
          הוסף הערה
        </button>
      </div>
    </div>
  );
}

function ActivityItem({ activity }: { activity: any }) {
  const map: Record<string, { tone: any; Icon: any }> = {
    note: { tone: "blue", Icon: MessageSquare },
    "status-change": { tone: "purple", Icon: TrendingUp },
    call: { tone: "green", Icon: Phone },
    sms: { tone: "cyan", Icon: Mail },
    whatsapp: { tone: "green", Icon: MessageCircle },
  };
  const item = map[activity.type] || map.note;
  const Icon = item.Icon;
  return (
    <div className="px-4 py-2.5 flex items-start gap-2.5">
      <Icon3D icon={<Icon className="size-3" />} tone={item.tone} size={24} className="shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <div className="text-[12px] text-slate-700 line-clamp-2 leading-snug">{activity.text}</div>
        <div className="text-[10px] text-slate-400 mt-0.5 tabular-nums">{formatRelativeDate(activity.date)}</div>
      </div>
    </div>
  );
}

function TasksRail() {
  const tasks = [
    { id: "t1", title: "להתקשר ולעדכן סטטוס", due: "היום, 14:30", priority: "high"   as const },
    { id: "t2", title: "לשלוח מסמכים נדרשים", due: "מחר",          priority: "med"   as const },
    { id: "t3", title: "פולואפ אחרי חתימה",  due: "ב-3 ימים",     priority: "low"    as const },
  ];
  return (
    <div className="card-vibrant overflow-hidden">
      <div className="px-4 py-3 flex items-center justify-between border-b border-slate-100/70">
        <div className="flex items-center gap-2">
          <Icon3D icon={<Calendar className="size-3" />} tone="orange" size={24} />
          <span className="text-[13px] font-bold text-slate-900">משימות</span>
          <span className="text-[10px] font-bold text-white bg-gradient-to-r from-orange-500 to-pink-500 rounded-full px-1.5 py-0.5">{tasks.length}</span>
        </div>
        <button className="size-6 rounded-md bg-gradient-to-br from-lime-400 via-green-500 to-emerald-600 text-white inline-flex items-center justify-center shadow-sm shadow-green-500/40 hover:scale-110 transition">
          <Plus className="size-3" />
        </button>
      </div>
      <div className="divide-y divide-slate-100/70">
        {tasks.map((t) => <TaskItem key={t.id} task={t} />)}
      </div>
    </div>
  );
}

function TaskItem({ task }: { task: any }) {
  const pri = { high: "bg-rose-500", med: "bg-amber-500", low: "bg-emerald-500" };
  return (
    <div className="px-4 py-2.5 flex items-start gap-2.5 hover:bg-white/40 transition">
      <button className="size-4 rounded-full border-2 border-slate-300 hover:border-bingo-green mt-0.5 shrink-0 transition" />
      <div className="flex-1 min-w-0">
        <div className="text-[12px] font-semibold text-slate-800">{task.title}</div>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className={cn("inline-block size-1.5 rounded-full", pri[task.priority as "high" | "med" | "low"])} />
          <span className="text-[10px] text-slate-400 tabular-nums">{task.due}</span>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   COMPLETION RING — animated conic gradient
   ============================================================ */
function CompletionRing({ pct }: { pct: number }) {
  return (
    <div className="relative size-20" style={{ filter: "drop-shadow(0 0 12px rgba(80,255,10,0.35))" }}>
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: `conic-gradient(from -90deg, #7DFF40 0deg, #50FF0A ${pct * 0.9}deg, #2EA10D ${pct * 1.8}deg, rgba(0,0,0,0.06) ${pct * 1.8}deg)`,
        }}
      />
      <div className="absolute inset-1.5 rounded-full bg-white flex flex-col items-center justify-center">
        <span className="text-[18px] font-black text-slate-900 tabular-nums leading-none">{Math.round(pct)}<span className="text-[10px] text-slate-400">%</span></span>
        <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">הושלם</span>
      </div>
    </div>
  );
}

/* ============================================================
   HELPERS
   ============================================================ */
function derivePhase(lead: Lead): Phase {
  const signed = lead.forms?.some((f) => f.status === "signed");
  const checks = Object.keys(lead.lenderChecks || {}).length;
  if (lead.finalLender) return "close";
  if (signed && checks > 0) return "auction";
  if (signed) return "sign";
  return "qualify";
}

function computeCompletion(lead: Lead): number {
  const fields = [
    lead.smileyAuto, lead.hadCreditIssues, lead.accountRestricted,
    lead.loanPurpose, lead.amountRequested,
    lead.creditCards?.length, lead.cardLimit,
    lead.employmentStatus, lead.monthlyIncome,
    lead.hasProperty, lead.bankName,
  ];
  const filled = fields.filter((f) => f !== undefined && f !== null && f !== "" && f !== 0).length;
  return (filled / fields.length) * 100;
}

function formatRelativeDate(d: string): string {
  const date = new Date(d);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.round(diffMs / 60000);
  const diffH = Math.round(diffMs / 3600000);
  const diffD = Math.round(diffMs / 86400000);
  if (diffMin < 1) return "עכשיו";
  if (diffMin < 60) return `לפני ${diffMin}d`;
  if (diffH < 24) return `לפני ${diffH}ש'`;
  if (diffD < 7) return `לפני ${diffD}י'`;
  return date.toLocaleDateString("he-IL", { day: "2-digit", month: "2-digit" });
}
