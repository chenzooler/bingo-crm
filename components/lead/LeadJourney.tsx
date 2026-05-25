"use client";
import * as React from "react";
import Link from "next/link";
import {
  ChevronLeft, Phone, MessageCircle, Mail, Sparkles, AlertTriangle, CheckCircle2,
  Circle, Clock, FileSignature, Trophy, Send, Wallet, Shield,
  Smile, Frown, Meh, CreditCard, Building2, TrendingUp, Award,
  User as UserIcon, ChevronRight, ChevronDown, DollarSign,
  Briefcase, Home, Car, Plane, Heart, Cake, Receipt, Activity as ActivityIcon,
  MessageSquare, MoreHorizontal, Plus, ChevronsUpDown, Calendar,
} from "lucide-react";
import type { Lead } from "@/lib/types";
import { Avatar } from "@/components/ui/Avatar";
import { cn, formatCurrency } from "@/lib/utils";

type Phase = "qualify" | "sign" | "auction" | "close";

interface PhaseDef {
  key: Phase;
  label: string;
  sublabel: string;
  icon: React.ElementType;
}

const PHASES: PhaseDef[] = [
  { key: "qualify", label: "שאלון",  sublabel: "סינון זכאות", icon: UserIcon },
  { key: "sign",    label: "חתימה",  sublabel: "חוזה דיגיטלי", icon: FileSignature },
  { key: "auction", label: "מכרז",   sublabel: "12 גופים",     icon: Trophy },
  { key: "close",   label: "סגירה",   sublabel: "אישור והעברה", icon: Send },
];

export function LeadJourney({ lead: initial }: { lead: Lead }) {
  const [lead, setLead] = React.useState<Lead>(initial);
  const [phase, setPhase] = React.useState<Phase>(() => derivePhase(initial));

  function set<K extends keyof Lead>(key: K, val: Lead[K]) {
    setLead((l) => ({ ...l, [key]: val }));
  }

  const bdiNegative = lead.smileyAuto === "red" || lead.smileyAuto === "yellow" ||
    lead.hadCreditIssues === true || lead.accountRestricted === true ||
    (lead.creditCards?.includes("none")) || lead.cardLimit === "below-5k";

  return (
    <div className="-mx-6 -mt-6 min-h-[calc(100vh-64px)]" style={{ background: "#F5F5F7" }}>
      {/* Translucent toolbar */}
      <Toolbar lead={lead} bdiNegative={bdiNegative} />

      <div className="max-w-[1400px] mx-auto px-6 py-5">
        {/* Phase segmented control */}
        <PhaseSegmented current={phase} onChange={setPhase} />

        {/* Main two-column work area */}
        <div className="mt-5 grid grid-cols-12 gap-5">
          {/* MAIN COLUMN */}
          <main className="col-span-9 space-y-4">
            {phase === "qualify" && <QualifyFull lead={lead} set={set} bdiNegative={bdiNegative} onAdvance={() => setPhase("sign")} />}
            {phase === "sign"    && <SignFull lead={lead} onAdvance={() => setPhase("auction")} />}
            {phase === "auction" && <AuctionFull lead={lead} onAdvance={() => setPhase("close")} />}
            {phase === "close"   && <CloseFull lead={lead} />}
          </main>

          {/* RIGHT RAIL: Activity + Tasks */}
          <aside className="col-span-3 space-y-4">
            <ActivityRail lead={lead} />
            <TasksRail lead={lead} />
          </aside>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   TOOLBAR (translucent, Apple-style)
   ============================================================ */
function Toolbar({ lead, bdiNegative }: { lead: Lead; bdiNegative: boolean }) {
  return (
    <div className="sticky top-0 z-40 surface-toolbar">
      <div className="max-w-[1400px] mx-auto px-6 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Link href={`/leads/${lead.id}`} className="text-callout hover:text-[var(--color-accent)] flex items-center gap-1 transition">
              <ChevronRight className="size-3.5" />
              <span>לכרטיס</span>
            </Link>
            <div className="h-4 w-px bg-black/8" />
            <Avatar name={lead.fullName} size={32} />
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-headline truncate">{lead.fullName}</h1>
                {bdiNegative && <BDIBadge />}
              </div>
              <div className="flex items-center gap-2 text-[11px] text-[var(--color-tinted-text-secondary)] mt-0.5">
                <span>ID: {lead.idNumber || "—"}</span>
                <span className="opacity-40">·</span>
                <span>{lead.phone}</span>
                {lead.amountRequested && (
                  <>
                    <span className="opacity-40">·</span>
                    <span className="font-semibold text-[var(--color-tinted-text-primary)] tabular-nums">{formatCurrency(lead.amountRequested)}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button className="btn-apple">
              <Phone className="size-3.5" />
              חיוג
            </button>
            <button className="btn-apple">
              <MessageCircle className="size-3.5" />
              WhatsApp
            </button>
            <button className="btn-apple">
              <Mail className="size-3.5" />
              SMS
            </button>
            <button className="btn-apple btn-apple-primary">
              <Sparkles className="size-3.5" />
              AI
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function BDIBadge() {
  return (
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-red-50 text-red-600 text-[10px] font-semibold border border-red-100">
      <AlertTriangle className="size-2.5" />
      BDI שלילי
    </span>
  );
}

/* ============================================================
   PHASE SEGMENTED CONTROL
   ============================================================ */
function PhaseSegmented({ current, onChange }: { current: Phase; onChange: (p: Phase) => void }) {
  return (
    <div className="card-apple p-2 flex items-center justify-between">
      <div className="segmented-apple flex-1 grid grid-cols-4 gap-0.5">
        {PHASES.map((p) => {
          const Icon = p.icon;
          const active = p.key === current;
          return (
            <button
              key={p.key}
              data-active={active}
              onClick={() => onChange(p.key)}
              className="flex items-center justify-center gap-1.5"
            >
              <Icon className="size-3.5" />
              <span>{p.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ============================================================
   PHASE 1 — FULL QUESTIONNAIRE (all visible, organized sections)
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
      {/* Header card */}
      <div className="card-apple p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-caption mb-1">שלב 1 מתוך 4</div>
            <h2 className="text-title-2">שאלון אבחון לקוח</h2>
            <p className="text-callout mt-1">מלא את כל הסעיפים. כיוון נתיב נקבע אוטומטית לפי תשובות.</p>
          </div>
          <div className="text-right">
            <div className="text-caption mb-1">השלמה</div>
            <div className="flex items-center gap-2">
              <ProgressRing pct={completion} />
              <span className="text-title-3 tabular-nums">{Math.round(completion)}%</span>
            </div>
          </div>
        </div>

        {/* Smart routing alert */}
        {bdiNegative && (
          <div className="mt-3 flex items-start gap-2.5 p-3 rounded-xl bg-amber-50/60 border border-amber-200/60">
            <AlertTriangle className="size-4 text-amber-600 mt-0.5 shrink-0" />
            <div>
              <div className="text-[13px] font-semibold text-amber-900">ניתוב אוטומטי למחלקת רכב</div>
              <div className="text-[12px] text-amber-800/80 mt-0.5">לפי הסימנים שמולאו, הלקוח אינו זכאי להלוואה לכל מטרה. המסלול ימשיך כהלוואת רכב.</div>
            </div>
          </div>
        )}
      </div>

      {/* === SECTION 1: סינון ראשוני (Triage) === */}
      <SectionCard icon={Shield} title="סינון ראשוני" subtitle="הסעיפים הקריטיים — קובעים את המסלול">
        <FieldGroup>
          <FieldRow label="סמיילי בנק ישראל" hint="אדום או כתום → מסלול רכב">
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

      {/* === SECTION 2: מטרת הלוואה === */}
      <SectionCard icon={Wallet} title="פרטי הלוואה" subtitle="סכום, מטרה, ופירוט">
        <FieldGroup>
          <FieldRow label="מטרת ההלוואה">
            <PurposeControl value={lead.loanPurpose} onChange={(v) => set("loanPurpose", v as any)} />
          </FieldRow>
          <FieldRow label="סכום מבוקש">
            <AmountControl value={lead.amountRequested} onChange={(v) => set("amountRequested", v)} />
          </FieldRow>
        </FieldGroup>
      </SectionCard>

      {/* === SECTION 3: אשראי === */}
      <SectionCard icon={CreditCard} title="כרטיסי אשראי" subtitle="סוג כרטיס + מסגרת">
        <FieldGroup>
          <FieldRow label="כרטיסים פעילים">
            <CardsControl value={lead.creditCards} onChange={(v) => set("creditCards", v as any)} />
          </FieldRow>
          <FieldRow label="מסגרת בכרטיס המרכזי" hint="מתחת ל-5,000₪ → מסלול רכב">
            <CardLimitControl value={lead.cardLimit} onChange={(v) => set("cardLimit", v as any)} />
          </FieldRow>
        </FieldGroup>
      </SectionCard>

      {/* === SECTION 4: תעסוקה והכנסה === */}
      <SectionCard icon={Briefcase} title="תעסוקה והכנסה">
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

      {/* === SECTION 5: נכסים === */}
      <SectionCard icon={Home} title="נכסים ורכוש">
        <FieldGroup>
          <FieldRow label="נכס בבעלות">
            <PropertyControl value={lead.hasProperty} onChange={(v) => set("hasProperty", v as any)} />
          </FieldRow>
          <FieldRow label="רכב בבעלות">
            <YesNoControl value={lead.hasVehicle} onChange={(v) => set("hasVehicle", v)} />
          </FieldRow>
          {lead.hasVehicle && (
            <>
              <FieldRow label="שנת ייצור רכב">
                <NumberInput value={lead.vehicleYear} onChange={(v) => set("vehicleYear", v)} placeholder="2020" />
              </FieldRow>
              <FieldRow label="יצרן">
                <TextInput value={lead.vehicleMake} onChange={(v) => set("vehicleMake", v as any)} placeholder="טויוטה" />
              </FieldRow>
            </>
          )}
        </FieldGroup>
      </SectionCard>

      {/* === SECTION 6: בנק === */}
      <SectionCard icon={Building2} title="פרטי בנק">
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

      {/* Submit footer */}
      <div className="card-apple p-4 flex items-center justify-between sticky bottom-4">
        <div className="text-callout">
          {completion === 100 ? "השאלון מלא — מוכן לחתימה" : `${100 - Math.round(completion)}% חסר להשלמה`}
        </div>
        <button onClick={onAdvance} className="btn-apple btn-apple-primary">
          המשך לחתימה
          <ChevronLeft className="size-3.5" />
        </button>
      </div>
    </div>
  );
}

/* ============================================================
   SECTION CARD
   ============================================================ */
function SectionCard({ icon: Icon, title, subtitle, children }: { icon: React.ElementType; title: string; subtitle?: string; children: React.ReactNode }) {
  const [open, setOpen] = React.useState(true);
  return (
    <div className="card-apple overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full px-5 py-4 flex items-center justify-between hover:bg-black/[0.015] transition"
      >
        <div className="flex items-center gap-3">
          <div className="size-8 rounded-lg flex items-center justify-center bg-[var(--color-accent-soft)] text-[var(--color-accent)]">
            <Icon className="size-4" />
          </div>
          <div className="text-right">
            <div className="text-headline">{title}</div>
            {subtitle && <div className="text-[12px] text-[var(--color-tinted-text-secondary)] mt-0.5">{subtitle}</div>}
          </div>
        </div>
        <ChevronDown className={cn("size-4 text-[var(--color-tinted-text-tertiary)] transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <>
          <div className="divider-apple" />
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
        <div className="text-[13px] font-medium text-[var(--color-tinted-text-primary)]">{label}</div>
        {hint && <div className="text-[11px] text-[var(--color-tinted-text-tertiary)] mt-0.5">{hint}</div>}
      </div>
      <div className="col-span-8">{children}</div>
    </div>
  );
}

/* ============================================================
   APPLE-STYLE FIELD CONTROLS
   ============================================================ */
function SmileyControl({ value, onChange }: { value?: string; onChange: (v: string) => void }) {
  const opts = [
    { v: "green", label: "ירוק", Icon: Smile, ring: "ring-emerald-500/30", text: "text-emerald-600" },
    { v: "yellow", label: "כתום", Icon: Meh, ring: "ring-amber-500/30", text: "text-amber-600" },
    { v: "red", label: "אדום", Icon: Frown, ring: "ring-red-500/30", text: "text-red-600" },
  ];
  return (
    <div className="grid grid-cols-3 gap-2">
      {opts.map((o) => {
        const sel = value === o.v;
        const Icon = o.Icon;
        return (
          <button
            key={o.v}
            onClick={() => onChange(o.v)}
            className={cn(
              "flex flex-col items-center justify-center gap-1.5 py-3 rounded-xl border transition",
              sel ? `bg-white ring-2 ${o.ring} border-transparent shadow-sm` : "bg-white border-black/8 hover:border-black/15"
            )}
          >
            <Icon className={cn("size-6", sel ? o.text : "text-[var(--color-tinted-text-tertiary)]")} />
            <span className="text-[12px] font-semibold text-[var(--color-tinted-text-primary)]">{o.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function YesNoControl({ value, onChange, negative }: { value?: boolean | null; onChange: (v: boolean) => void; negative?: boolean }) {
  return (
    <div className="inline-flex p-0.5 bg-black/5 rounded-lg">
      <button
        onClick={() => onChange(false)}
        className={cn(
          "px-4 py-1.5 text-[12px] font-semibold rounded-md transition",
          value === false ? "bg-white text-[var(--color-tinted-text-primary)] shadow-sm" : "text-[var(--color-tinted-text-secondary)] hover:text-[var(--color-tinted-text-primary)]"
        )}
      >
        לא
      </button>
      <button
        onClick={() => onChange(true)}
        className={cn(
          "px-4 py-1.5 text-[12px] font-semibold rounded-md transition",
          value === true
            ? negative ? "bg-red-500 text-white shadow-sm" : "bg-emerald-500 text-white shadow-sm"
            : "text-[var(--color-tinted-text-secondary)] hover:text-[var(--color-tinted-text-primary)]"
        )}
      >
        כן
      </button>
    </div>
  );
}

const PURPOSES = [
  { v: "debt-cover", label: "כיסוי חובות", Icon: Receipt },
  { v: "vehicle",    label: "רכב",          Icon: Car },
  { v: "renovation", label: "שיפוץ",        Icon: Home },
  { v: "vacation",   label: "חופשה",        Icon: Plane },
  { v: "event",      label: "אירוע",        Icon: Cake },
  { v: "business",   label: "עסק",          Icon: Briefcase },
  { v: "studies",    label: "לימודים",      Icon: Award },
  { v: "health",     label: "רפואה",         Icon: Heart },
  { v: "other",      label: "אחר",          Icon: MoreHorizontal },
];

function PurposeControl({ value, onChange }: { value?: string; onChange: (v: string) => void }) {
  return (
    <div className="grid grid-cols-3 gap-1.5">
      {PURPOSES.map((p) => {
        const sel = value === p.v;
        const Icon = p.Icon;
        return (
          <button
            key={p.v}
            onClick={() => onChange(p.v)}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-lg border text-[12px] font-medium transition",
              sel ? "bg-[var(--color-accent-soft)] border-[var(--color-accent)] text-[var(--color-accent)]" : "bg-white border-black/8 text-[var(--color-tinted-text-primary)] hover:border-black/15"
            )}
          >
            <Icon className="size-3.5" />
            {p.label}
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
      <div className="grid grid-cols-6 gap-1.5">
        {presets.map((p) => (
          <button
            key={p}
            onClick={() => onChange(p)}
            className={cn(
              "py-2 text-[12px] font-semibold rounded-md border tabular-nums transition",
              value === p ? "bg-[var(--color-accent)] text-white border-transparent" : "bg-white border-black/8 text-[var(--color-tinted-text-primary)] hover:border-black/15"
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
        className="w-full h-9 px-3 rounded-lg border border-black/8 text-[13px] text-[var(--color-tinted-text-primary)] placeholder:text-[var(--color-tinted-text-tertiary)] focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/20 outline-none transition tabular-nums"
      />
    </div>
  );
}

function CardsControl({ value, onChange }: { value?: string[]; onChange: (v: string[]) => void }) {
  const opts = [
    { v: "isracard", label: "ישראכרט" },
    { v: "cal",      label: "כאל" },
    { v: "max",      label: "MAX" },
    { v: "direct",   label: "Direct" },
    { v: "none",     label: "אין כרטיס", neg: true },
  ];
  function toggle(v: string) {
    const cur = value || [];
    if (cur.includes(v)) onChange(cur.filter((x) => x !== v));
    else onChange([...cur, v]);
  }
  return (
    <div className="flex flex-wrap gap-1.5">
      {opts.map((o) => {
        const sel = (value || []).includes(o.v);
        return (
          <button
            key={o.v}
            onClick={() => toggle(o.v)}
            className={cn(
              "px-3 py-1.5 text-[12px] font-medium rounded-md border transition",
              sel
                ? o.neg
                  ? "bg-red-50 border-red-300 text-red-700"
                  : "bg-[var(--color-accent-soft)] border-[var(--color-accent)] text-[var(--color-accent)]"
                : "bg-white border-black/8 text-[var(--color-tinted-text-primary)] hover:border-black/15"
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

function CardLimitControl({ value, onChange }: { value?: string; onChange: (v: string) => void }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      <button
        onClick={() => onChange("above-5k")}
        className={cn(
          "p-3 rounded-lg border text-right transition",
          value === "above-5k" ? "bg-emerald-50 border-emerald-300" : "bg-white border-black/8 hover:border-black/15"
        )}
      >
        <div className="text-[14px] font-bold text-[var(--color-tinted-text-primary)] tabular-nums">5,000₪+</div>
        <div className="text-[11px] text-emerald-700">תקין</div>
      </button>
      <button
        onClick={() => onChange("below-5k")}
        className={cn(
          "p-3 rounded-lg border text-right transition",
          value === "below-5k" ? "bg-red-50 border-red-300" : "bg-white border-black/8 hover:border-black/15"
        )}
      >
        <div className="text-[14px] font-bold text-[var(--color-tinted-text-primary)] tabular-nums">פחות מ-5,000₪</div>
        <div className="text-[11px] text-red-600">מסלול רכב</div>
      </button>
    </div>
  );
}

function EmploymentControl({ value, onChange }: { value?: string; onChange: (v: string) => void }) {
  const opts = [
    { v: "employee",      label: "שכיר",      Icon: Building2 },
    { v: "self-employed", label: "עצמאי",     Icon: Briefcase },
    { v: "retired",       label: "פנסיונר",   Icon: Award },
    { v: "stipend",       label: "קצבה",      Icon: Wallet },
    { v: "unemployed",    label: "ללא",       Icon: Circle },
  ];
  return (
    <div className="grid grid-cols-5 gap-1.5">
      {opts.map((o) => {
        const sel = value === o.v;
        const Icon = o.Icon;
        return (
          <button
            key={o.v}
            onClick={() => onChange(o.v)}
            className={cn(
              "flex flex-col items-center gap-1 py-2.5 rounded-lg border text-[11px] font-medium transition",
              sel ? "bg-[var(--color-accent-soft)] border-[var(--color-accent)] text-[var(--color-accent)]" : "bg-white border-black/8 text-[var(--color-tinted-text-primary)] hover:border-black/15"
            )}
          >
            <Icon className="size-4" />
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
    <div className="inline-flex p-0.5 bg-black/5 rounded-lg">
      {opts.map((o) => (
        <button
          key={o.v}
          onClick={() => onChange(o.v)}
          className={cn(
            "px-3 py-1.5 text-[12px] font-semibold rounded-md transition",
            value === o.v ? "bg-white text-[var(--color-tinted-text-primary)] shadow-sm" : "text-[var(--color-tinted-text-secondary)] hover:text-[var(--color-tinted-text-primary)]"
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
        className="w-full h-9 px-3 rounded-lg border border-black/8 text-[13px] text-[var(--color-tinted-text-primary)] placeholder:text-[var(--color-tinted-text-tertiary)] focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/20 outline-none transition tabular-nums"
      />
      {suffix && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[11px] text-[var(--color-tinted-text-tertiary)]">{suffix}</span>}
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
      className="w-full h-9 px-3 rounded-lg border border-black/8 text-[13px] text-[var(--color-tinted-text-primary)] placeholder:text-[var(--color-tinted-text-tertiary)] focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/20 outline-none transition"
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
    <div className="card-apple p-6">
      <div className="text-caption mb-1">שלב 2 מתוך 4</div>
      <h2 className="text-title-2 mb-1">חתימה דיגיטלית</h2>
      <p className="text-callout mb-5">שלח חוזה ב-WhatsApp או SMS. הלקוח חותם מהמכשיר שלו ב-30 שניות.</p>

      <div className="grid grid-cols-2 gap-2 mb-4">
        <ChannelCard
          icon={<MessageCircle className="size-4" />}
          label="WhatsApp"
          sub="87% פתיחה — מומלץ"
          active={channel === "whatsapp"}
          onClick={() => setChannel("whatsapp")}
        />
        <ChannelCard
          icon={<Mail className="size-4" />}
          label="SMS"
          sub="חלופה — ללא WhatsApp"
          active={channel === "sms"}
          onClick={() => setChannel("sms")}
        />
      </div>

      <div className="rounded-xl p-4 bg-[var(--color-tinted-bg)] border border-black/5 mb-4">
        <div className="text-caption mb-2">תצוגה מקדימה</div>
        <div className="text-[13px] leading-relaxed text-[var(--color-tinted-text-primary)]">
          שלום {lead.firstName || lead.fullName},<br />
          להלן קישור לחתימה דיגיטלית על חוזה הלוואה לסך{" "}
          <span className="font-semibold tabular-nums">{formatCurrency(lead.amountRequested || 50000)}</span>.<br />
          חתימה לוקחת 30 שניות.<br />
          <a className="text-[var(--color-accent)]">https://bingo.app/sign/{lead.id}</a>
        </div>
      </div>

      {!sent ? (
        <button onClick={send} className="btn-apple btn-apple-primary w-full justify-center" style={{ padding: "10px 16px" }}>
          <Send className="size-4" />
          שלח חוזה ב-{channel === "whatsapp" ? "WhatsApp" : "SMS"}
        </button>
      ) : !signed ? (
        <div className="flex items-center justify-center gap-2 py-3 text-[13px] font-medium text-[var(--color-tinted-text-secondary)]">
          <Clock className="size-4 animate-spin" />
          ממתין לחתימת הלקוח...
        </div>
      ) : (
        <div className="text-center py-3">
          <div className="inline-flex items-center gap-2 text-[14px] font-semibold text-emerald-700 mb-3">
            <CheckCircle2 className="size-5" />
            החוזה נחתם בהצלחה
          </div>
          <button onClick={onAdvance} className="btn-apple btn-apple-primary mx-auto">
            התחל מכרז זכאות
            <ChevronLeft className="size-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}

function ChannelCard({ icon, label, sub, active, onClick }: { icon: React.ReactNode; label: string; sub: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "p-4 rounded-xl border text-right transition",
        active ? "bg-[var(--color-accent-soft)] border-[var(--color-accent)]" : "bg-white border-black/8 hover:border-black/15"
      )}
    >
      <div className="flex items-center gap-3">
        <div className={cn("size-9 rounded-lg flex items-center justify-center", active ? "bg-[var(--color-accent)] text-white" : "bg-black/5 text-[var(--color-tinted-text-secondary)]")}>
          {icon}
        </div>
        <div>
          <div className="text-[14px] font-semibold text-[var(--color-tinted-text-primary)]">{label}</div>
          <div className="text-[11px] text-[var(--color-tinted-text-secondary)]">{sub}</div>
        </div>
      </div>
    </button>
  );
}

/* ============================================================
   PHASE 3 — AUCTION
   ============================================================ */
const LENDERS = [
  { key: "jerusalem", name: "בנק ירושלים" },
  { key: "cal",       name: "כאל" },
  { key: "isracard",  name: "ישראכרט" },
  { key: "max",       name: "MAX" },
  { key: "leumi",     name: "לאומי" },
  { key: "hapoalim",  name: "הפועלים" },
  { key: "discount",  name: "דיסקונט" },
  { key: "mizrahi",   name: "מזרחי" },
  { key: "esh",       name: "ESH" },
  { key: "panim",     name: "פנים" },
  { key: "abedalim",  name: "אבדאלים" },
  { key: "shotef",    name: "שוטף+" },
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
          setChecks((prev) => ({
            ...prev,
            [l.key]: { status: approved ? "approved" : "rejected", amount, interest },
          }));
        }, 1500 + Math.random() * 2000);
      }, i * 350);
    });
  }, [started]);

  const approvedList = LENDERS
    .map((l) => ({ ...l, ...checks[l.key] }))
    .filter((l) => l.status === "approved")
    .sort((a, b) => (b.amount || 0) - (a.amount || 0));
  const best = approvedList[0];
  const done = Object.values(checks).filter((c) => c.status === "approved" || c.status === "rejected").length;
  const allDone = done === LENDERS.length;

  return (
    <div className="space-y-4">
      <div className="card-apple p-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-caption mb-1">שלב 3 מתוך 4</div>
            <h2 className="text-title-2">מכרז זכאות</h2>
            <p className="text-callout mt-1">
              {!started ? "12 גופי מימון בודקים זכאות במקביל." : allDone ? "המכרז הסתיים." : `${done} מתוך ${LENDERS.length} השיבו.`}
            </p>
          </div>
          {!started && (
            <button onClick={() => setStarted(true)} className="btn-apple btn-apple-primary">
              <Trophy className="size-3.5" />
              פתח מכרז
            </button>
          )}
          {allDone && (
            <button onClick={onAdvance} className="btn-apple btn-apple-primary">
              עבור להחלטה
              <ChevronLeft className="size-3.5" />
            </button>
          )}
        </div>
      </div>

      {best && (
        <div className="card-apple p-5 border-l-2" style={{ borderLeftColor: "var(--color-accent)" }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl flex items-center justify-center bg-[var(--color-accent-soft)] text-[var(--color-accent)]">
                <Trophy className="size-5" />
              </div>
              <div>
                <div className="text-caption text-[var(--color-accent)]">הצעה מובילה</div>
                <div className="text-title-3">{best.name}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-title-2 tabular-nums">{formatCurrency(best.amount || 0)}</div>
              <div className="text-callout">ריבית {best.interest}%</div>
            </div>
          </div>
        </div>
      )}

      <div className="card-apple p-4">
        <div className="grid grid-cols-3 gap-2">
          {LENDERS.map((l) => {
            const c = checks[l.key];
            return <LenderRow key={l.key} lender={l} state={c} />;
          })}
        </div>
      </div>
    </div>
  );
}

function LenderRow({ lender, state }: { lender: { name: string }; state: CheckState }) {
  const tone =
    state.status === "approved" ? "bg-emerald-50 border-emerald-200" :
    state.status === "rejected" ? "bg-black/[0.02] border-black/8 opacity-60" :
    state.status === "running"  ? "bg-blue-50 border-blue-200" :
                                  "bg-white border-black/8";
  return (
    <div className={cn("rounded-lg border p-3 transition", tone)}>
      <div className="flex items-center justify-between mb-1">
        <div className="text-[12px] font-semibold text-[var(--color-tinted-text-primary)]">{lender.name}</div>
        {state.status === "approved" && <CheckCircle2 className="size-4 text-emerald-600" />}
        {state.status === "rejected" && <Circle className="size-4 text-[var(--color-tinted-text-tertiary)]" />}
        {state.status === "running" && <div className="size-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />}
      </div>
      {state.status === "approved" && (
        <>
          <div className="text-[14px] font-bold text-emerald-700 tabular-nums">{formatCurrency(state.amount || 0)}</div>
          <div className="text-[11px] text-[var(--color-tinted-text-secondary)]">{state.interest}%</div>
        </>
      )}
      {state.status === "rejected" && <div className="text-[11px] text-[var(--color-tinted-text-tertiary)]">נדחה</div>}
      {state.status === "running" && <div className="text-[11px] text-blue-600">בודק...</div>}
      {state.status === "pending" && <div className="text-[11px] text-[var(--color-tinted-text-tertiary)]">בתור</div>}
    </div>
  );
}

/* ============================================================
   PHASE 4 — CLOSE
   ============================================================ */
function CloseFull({ lead }: { lead: Lead }) {
  const [sent, setSent] = React.useState(false);
  return (
    <div className="card-apple p-6">
      <div className="text-caption mb-1">שלב 4 מתוך 4</div>
      <h2 className="text-title-2 mb-1">סגירת עסקה</h2>
      <p className="text-callout mb-5">סקירת ההצעה הסופית ושליחה ללקוח לאישור.</p>

      <div className="surface-2 rounded-xl p-5 mb-5">
        <div className="grid grid-cols-2 gap-y-3">
          <SummaryItem label="לקוח" value={lead.fullName} />
          <SummaryItem label="גוף מלווה" value="בנק ירושלים" />
          <SummaryItem label="סכום הלוואה" value={formatCurrency(lead.amountRequested || 0)} accent />
          <SummaryItem label="ריבית" value="6.4%" />
          <SummaryItem label="תקופה" value="60 חודשים" />
          <SummaryItem label="עמלת בינגו" value={formatCurrency(2500)} />
        </div>
      </div>

      {!sent ? (
        <button onClick={() => setSent(true)} className="btn-apple btn-apple-primary w-full justify-center" style={{ padding: "10px 16px" }}>
          <Send className="size-4" />
          שלח הצעה סופית ללקוח
        </button>
      ) : (
        <div className="flex items-center justify-center gap-2 text-[14px] font-semibold text-emerald-700">
          <CheckCircle2 className="size-5" />
          ההצעה נשלחה — ממתין לאישור סופי
        </div>
      )}
    </div>
  );
}

function SummaryItem({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div>
      <div className="text-caption mb-0.5">{label}</div>
      <div className={cn("text-[14px] font-semibold tabular-nums", accent && "text-[var(--color-accent)] text-[18px] font-bold")}>{value}</div>
    </div>
  );
}

/* ============================================================
   RIGHT RAIL — Activity + Tasks (Apple list style)
   ============================================================ */
function ActivityRail({ lead }: { lead: Lead }) {
  const recent = (lead.activities || []).slice(0, 6);
  return (
    <div className="card-apple overflow-hidden">
      <div className="px-4 py-3 flex items-center justify-between border-b border-black/5">
        <div className="flex items-center gap-2">
          <ActivityIcon className="size-3.5 text-[var(--color-tinted-text-secondary)]" />
          <span className="text-headline">פעילות</span>
        </div>
        <button className="text-[11px] text-[var(--color-accent)] font-medium hover:underline">הצג הכל</button>
      </div>
      <div className="divide-y divide-black/5">
        {recent.length === 0 ? (
          <div className="px-4 py-6 text-center text-[12px] text-[var(--color-tinted-text-tertiary)]">אין פעילות עדיין</div>
        ) : (
          recent.map((a) => (
            <div key={a.id} className="px-4 py-2.5 flex items-start gap-3">
              <div className="size-7 rounded-full bg-[var(--color-tinted-bg)] flex items-center justify-center shrink-0">
                <ActivityDot type={a.type} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[12px] text-[var(--color-tinted-text-primary)] line-clamp-2">{a.text}</div>
                <div className="text-[10px] text-[var(--color-tinted-text-tertiary)] mt-0.5 tabular-nums">{formatRelativeDate(a.date)}</div>
              </div>
            </div>
          ))
        )}
      </div>
      <div className="px-4 py-2 border-t border-black/5 flex items-center gap-2">
        <button className="flex-1 btn-apple text-[12px]" style={{ padding: "5px 10px" }}>
          <MessageSquare className="size-3" />
          הוסף הערה
        </button>
      </div>
    </div>
  );
}

function ActivityDot({ type }: { type: string }) {
  const map: Record<string, { color: string; Icon: any }> = {
    note: { color: "text-blue-500", Icon: MessageSquare },
    "status-change": { color: "text-purple-500", Icon: TrendingUp },
    call: { color: "text-emerald-500", Icon: Phone },
    sms: { color: "text-cyan-500", Icon: Mail },
    whatsapp: { color: "text-emerald-500", Icon: MessageCircle },
  };
  const item = map[type] || map.note;
  const Icon = item.Icon;
  return <Icon className={cn("size-3.5", item.color)} />;
}

function TasksRail({ lead }: { lead: Lead }) {
  // Mock 3 tasks
  const tasks = [
    { id: "t1", title: "להתקשר ולעדכן סטטוס", due: "היום, 14:30", done: false, priority: "high" as const },
    { id: "t2", title: "לשלוח מסמכים נדרשים", due: "מחר", done: false, priority: "med" as const },
    { id: "t3", title: "פולואפ אחרי חתימה", due: "ב-3 ימים", done: false, priority: "low" as const },
  ];
  return (
    <div className="card-apple overflow-hidden">
      <div className="px-4 py-3 flex items-center justify-between border-b border-black/5">
        <div className="flex items-center gap-2">
          <Calendar className="size-3.5 text-[var(--color-tinted-text-secondary)]" />
          <span className="text-headline">משימות</span>
          <span className="text-[11px] text-[var(--color-tinted-text-tertiary)]">{tasks.length}</span>
        </div>
        <button className="text-[var(--color-accent)] hover:bg-[var(--color-accent-soft)] rounded-md size-6 flex items-center justify-center transition">
          <Plus className="size-3.5" />
        </button>
      </div>
      <div className="divide-y divide-black/5">
        {tasks.map((t) => (
          <div key={t.id} className="px-4 py-2.5 flex items-start gap-2.5">
            <button className="size-4 rounded-full border border-black/15 hover:border-[var(--color-accent)] mt-0.5 shrink-0 transition" />
            <div className="flex-1 min-w-0">
              <div className="text-[12px] font-medium text-[var(--color-tinted-text-primary)]">{t.title}</div>
              <div className="flex items-center gap-2 mt-0.5">
                <PriorityDot priority={t.priority} />
                <span className="text-[10px] text-[var(--color-tinted-text-tertiary)] tabular-nums">{t.due}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PriorityDot({ priority }: { priority: "high" | "med" | "low" }) {
  const map = { high: "bg-red-500", med: "bg-amber-500", low: "bg-emerald-500" };
  return <span className={cn("inline-block size-1.5 rounded-full", map[priority])} />;
}

/* ============================================================
   PROGRESS RING
   ============================================================ */
function ProgressRing({ pct }: { pct: number }) {
  const r = 14;
  const c = 2 * Math.PI * r;
  return (
    <svg width="36" height="36" className="-rotate-90">
      <circle cx="18" cy="18" r={r} stroke="rgba(0,0,0,0.08)" strokeWidth="3" fill="none" />
      <circle cx="18" cy="18" r={r} stroke="var(--color-accent)" strokeWidth="3" fill="none"
              strokeDasharray={c} strokeDashoffset={c - (c * pct) / 100}
              strokeLinecap="round" style={{ transition: "stroke-dashoffset 400ms ease" }} />
    </svg>
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
