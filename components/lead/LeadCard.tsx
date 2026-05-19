"use client";
import * as React from "react";
import Link from "next/link";
import { ChevronRight, Trash2, Copy as CopyIcon, Phone, Mail, MessageCircle, Plus, Cloud, ShieldCheck } from "lucide-react";
import type { Lead, LenderCheck } from "@/lib/types";
import { getUser, getStatus, getPipeline } from "@/lib/data/static";
import { Avatar } from "@/components/ui/Avatar";
import { Tag } from "@/components/ui/Tag";
import { Field } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { ActivityTimeline } from "./Activity";
import { StepNav } from "./StepNav";
import { EligibilityCard } from "./EligibilityCard";
import { LenderChecks } from "./LenderChecks";
import { ResultsSummary } from "./ResultsSummary";
import { WizardShell, OptionCard, OptionRow, YesNoOk } from "./WizardShell";
import { STEPS, evaluateStep, type StepKey } from "@/lib/lead-logic";
import {
  IconDebt, IconStudy, IconPlane, IconEvent, IconHeart, IconMore,
  IconHome, IconCar, IconBriefcase, IconWallet, IconUser, IconID,
  IconCalendar, IconCreditCard, IconBank, IconCash, IconChart,
  IconShieldCheck, IconClock, IconKids, IconHeartFamily, IconPhone, IconBolt,
} from "@/components/icons/PremiumIcon";
import { BingoBall } from "@/components/icons/ServiceIcons";
import { LeadSummary } from "./LeadSummary";
import { deriveLifecycle } from "@/lib/data/lead-augment";
import { formatDate, formatCurrency, cn, isValidIsraeliId, isValidIsraeliPhone } from "@/lib/utils";

export function LeadCard({ lead: initial }: { lead: Lead }) {
  const augmented = React.useMemo(() => ({ ...initial, ...deriveLifecycle(initial) }), [initial]);
  const [lead, setLead] = React.useState<Lead>(augmented);
  const [mode, setMode] = React.useState<"summary" | "wizard">(() =>
    lead.questionnaireCompleted ? "summary" : "wizard"
  );
  const [activeStep, setActiveStep] = React.useState<StepKey>(() => {
    const visible = STEPS.filter((s) => !s.visibleWhen || s.visibleWhen(initial));
    const next = visible.find((s) => evaluateStep(initial, s.key) !== "done");
    return next?.key || visible[0].key;
  });

  function set<K extends keyof Lead>(key: K, val: Lead[K]) {
    setLead((l) => ({ ...l, [key]: val }));
  }
  function setLender(key: string, c: LenderCheck) {
    setLead((l) => ({ ...l, lenderChecks: { ...(l.lenderChecks || {}), [key]: c } }));
  }

  const visible = STEPS.filter((s) => !s.visibleWhen || s.visibleWhen(lead));
  const idx = visible.findIndex((s) => s.key === activeStep);
  const prev = idx > 0 ? visible[idx - 1] : null;
  const next = idx < visible.length - 1 ? visible[idx + 1] : null;

  return (
    <div className="space-y-3 max-w-[1600px]">
      <CardHeaderBar lead={lead} />

      {/* Mode switcher - show only if questionnaire is completed */}
      {lead.questionnaireCompleted && (
        <div className="flex items-center gap-1 bg-white border border-bingo-gray-200 rounded-2xl p-1 bingo-shadow-sm w-fit">
          <button
            onClick={() => setMode("summary")}
            className={cn("h-9 px-4 rounded-xl text-[12px] font-bold transition inline-flex items-center gap-1.5",
              mode === "summary" ? "bg-bingo-black text-white" : "text-bingo-charcoal hover:bg-bingo-gray-100"
            )}
          >
            📊 סיכום ליד
          </button>
          <button
            onClick={() => setMode("wizard")}
            className={cn("h-9 px-4 rounded-xl text-[12px] font-bold transition inline-flex items-center gap-1.5",
              mode === "wizard" ? "bg-bingo-black text-white" : "text-bingo-charcoal hover:bg-bingo-gray-100"
            )}
          >
            ✏️ ערוך שאלון
          </button>
        </div>
      )}

      {mode === "wizard" && <StepNav lead={lead} active={activeStep} onChange={setActiveStep} />}

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-3">
        <div className="xl:col-span-3 space-y-3 xl:order-1">
          <ContactsCard lead={lead} />
          <ProcessesCard lead={lead} />
          <EligibilityCard lead={lead} />
        </div>

        <div className="xl:col-span-6 xl:order-2">
          {mode === "summary" && <LeadSummary lead={lead} />}
          {mode === "wizard" && activeStep === "intake" && <StepIntake lead={lead} set={set} onNext={next ? () => setActiveStep(next.key) : undefined} onBack={prev ? () => setActiveStep(prev.key) : undefined} />}
          {mode === "wizard" && activeStep === "credit-history" && <StepCreditHistory lead={lead} set={set} onNext={next ? () => setActiveStep(next.key) : undefined} onBack={prev ? () => setActiveStep(prev.key) : undefined} />}
          {mode === "wizard" && activeStep === "personal" && <StepPersonal lead={lead} set={set} onNext={next ? () => setActiveStep(next.key) : undefined} onBack={prev ? () => setActiveStep(prev.key) : undefined} />}
          {mode === "wizard" && activeStep === "household" && <StepHousehold lead={lead} set={set} onNext={next ? () => setActiveStep(next.key) : undefined} onBack={prev ? () => setActiveStep(prev.key) : undefined} />}
          {mode === "wizard" && activeStep === "income" && <StepIncome lead={lead} set={set} onNext={next ? () => setActiveStep(next.key) : undefined} onBack={prev ? () => setActiveStep(prev.key) : undefined} />}
          {mode === "wizard" && activeStep === "assets" && <StepAssets lead={lead} set={set} onNext={next ? () => setActiveStep(next.key) : undefined} onBack={prev ? () => setActiveStep(prev.key) : undefined} />}
          {mode === "wizard" && activeStep === "vehicle" && <StepVehicle lead={lead} set={set} onNext={next ? () => setActiveStep(next.key) : undefined} onBack={prev ? () => setActiveStep(prev.key) : undefined} />}
          {mode === "wizard" && activeStep === "bank" && <StepBank lead={lead} set={set} onNext={next ? () => setActiveStep(next.key) : undefined} onBack={prev ? () => setActiveStep(prev.key) : undefined} />}
          {mode === "wizard" && activeStep === "bdi" && <StepBDI lead={lead} set={set} onNext={next ? () => setActiveStep(next.key) : undefined} onBack={prev ? () => setActiveStep(prev.key) : undefined} />}
          {mode === "wizard" && activeStep === "lenders" && (
            <WizardShell
              stepKey="lenders"
              title="בדיקות מול גופי המימון"
              subtitle="בחר את הגוף, הזן את התוצאה והסכם המאושר."
              agentTip="לכל גוף לחץ על השורה כדי לפתוח את שדות ההזנה. סמן את הגופים שאישרו ואת הסכומים."
              onNext={next ? () => setActiveStep(next.key) : undefined}
              onBack={prev ? () => setActiveStep(prev.key) : undefined}
            >
              <LenderChecks lead={lead} onChange={setLender} />
            </WizardShell>
          )}
          {mode === "wizard" && activeStep === "result" && (
            <WizardShell
              stepKey="result"
              title="התוצאה לבחור הלקוח"
              subtitle="סיכום אוטומטי של מה שאישרנו, חיסכון ללקוח, ותסריט שיחה מוכן."
              onNext={next ? () => setActiveStep(next.key) : undefined}
              onBack={prev ? () => setActiveStep(prev.key) : undefined}
            >
              <ResultsSummary lead={lead} />
            </WizardShell>
          )}
          {mode === "wizard" && activeStep === "offer" && <StepOffer lead={lead} set={set} onNext={next ? () => setActiveStep(next.key) : undefined} onBack={prev ? () => setActiveStep(prev.key) : undefined} />}
          {mode === "wizard" && activeStep === "forms" && <StepForms lead={lead} onBack={prev ? () => setActiveStep(prev.key) : undefined} />}
        </div>

        <div className="xl:col-span-3 xl:order-3">
          <div className="bg-white rounded-3xl border border-bingo-gray-200 bingo-shadow-sm p-4 xl:sticky xl:top-[72px] xl:max-h-[calc(100vh-90px)] xl:overflow-y-auto">
            <ActivityTimeline activities={lead.activities} />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============ HEADER ============ */
function CardHeaderBar({ lead }: { lead: Lead }) {
  const status = getStatus(lead.primaryStatus);
  const pipe = getPipeline(lead.primaryPipeline);
  return (
    <div className="flex items-center justify-between gap-3 flex-wrap">
      <div className="flex items-center gap-3 min-w-0">
        <Link
          href="/dashboard"
          className="size-10 rounded-2xl bg-white hover:bg-bingo-gray-100 border border-bingo-gray-200 inline-flex items-center justify-center transition shrink-0"
          aria-label="חזרה"
        >
          <ChevronRight className="size-4 text-bingo-charcoal" />
        </Link>
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-[11px] text-bingo-gray-500">
            <Link href="/dashboard" className="hover:underline">לידים</Link>
            <ChevronRight className="size-3 -scale-x-100" />
            <span>{pipe?.label}</span>
          </div>
          <h1 className="text-2xl font-black text-bingo-black flex items-center gap-2.5 mt-0.5 min-w-0 flex-wrap">
            <span className="truncate">{lead.fullName}</span>
            {status && (
              <Tag color={status.color}>
                <span>{status.emoji}</span>
                <span>{status.label}</span>
              </Tag>
            )}
          </h1>
          <div className="text-[11px] text-bingo-gray-500 mt-0.5 font-mono tabular-nums">
            ת.ז {lead.idNumber || "—"} · קל"ט {formatDate(lead.intakeDate)}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 rounded-md px-2 py-1 inline-flex items-center gap-1">
          <Cloud className="size-3" /> נשמר אוטומטית
        </span>
        <Button variant="ghost" size="icon" title="שכפול"><CopyIcon className="size-4" /></Button>
        <Button variant="ghost" size="icon" title="מחיקה"><Trash2 className="size-4 text-status-red" /></Button>
      </div>
    </div>
  );
}

/* ============ STEPS ============ */
type StepProps = {
  lead: Lead;
  set: <K extends keyof Lead>(k: K, v: Lead[K]) => void;
  onNext?: () => void;
  onBack?: () => void;
};

const PURPOSES: { value: string; label: string; icon: React.ReactNode }[] = [
  { value: "debt-cover", label: "כיסוי התחייבות", icon: <IconDebt size={56} /> },
  { value: "family-help", label: "עזרה לבן משפחה", icon: <IconHeart size={56} /> },
  { value: "studies", label: "לימודים", icon: <IconStudy size={56} /> },
  { value: "vacation", label: "חופשה", icon: <IconPlane size={56} /> },
  { value: "event", label: "אירוע משפחתי", icon: <IconEvent size={56} /> },
  { value: "business", label: "עסק", icon: <IconBriefcase size={56} /> },
  { value: "renovation", label: "שיפוץ", icon: <IconHome size={56} /> },
  { value: "housing", label: "דיור / משכנתא", icon: <IconHome size={56} /> },
  { value: "shopping", label: "קניות", icon: <IconWallet size={56} /> },
  { value: "vehicle", label: "רכב", icon: <IconCar size={56} /> },
  { value: "health", label: "בריאותי", icon: <IconHeart size={56} /> },
  { value: "other", label: "אחר", icon: <IconMore size={56} /> },
];

function StepIntake({ lead, set, onNext, onBack }: StepProps) {
  const valid = lead.fullName.trim().length >= 2 && !!lead.amountRequested && lead.amountRequested >= 1000 && !!lead.loanPurpose;
  return (
    <WizardShell
      stepKey="intake"
      title="לאיזו מטרה הלקוח צריך את הכסף?"
      subtitle="פתח את השיחה - שאל את הלקוח באיזה סכום מדובר ולמה הוא צריך אותו."
      agentTip="הצג את עצמך, ספר לו שאנחנו עוזרים למצוא את ההלוואה הטובה ביותר עבורו ושהבדיקה חינמית."
      onNext={onNext}
      onBack={onBack}
      nextDisabled={!valid}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-2">
        <Field
          label="שם מלא של הלקוח"
          value={lead.fullName}
          onChange={(e) => set("fullName", e.target.value)}
          placeholder="לדוגמה: דוד כהן"
        />
        <Field
          label="סכום הלוואה מבוקש"
          type="number"
          inputMode="numeric"
          suffix="₪"
          value={lead.amountRequested ?? ""}
          onChange={(e) => set("amountRequested", e.target.value === "" ? undefined : Number(e.target.value))}
          placeholder="50000"
        />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3">
        {PURPOSES.map((p) => (
          <OptionCard
            key={p.value}
            selected={lead.loanPurpose === p.value}
            onClick={() => set("loanPurpose", p.value as Lead["loanPurpose"])}
            icon={p.icon}
            label={p.label}
          />
        ))}
      </div>
    </WizardShell>
  );
}

function StepCreditHistory({ lead, set, onNext, onBack }: StepProps) {
  const QS: { key: keyof Lead; label: string; critical?: boolean }[] = [
    { key: "hadEnforcement", label: "האם היו בעיות בהוצאה לפועל ב-3 שנים האחרונות?", critical: true },
    { key: "hadCreditIssues", label: "חזרו צ׳קים, הוראות קבע או הלוואות בשנתיים האחרונות?" },
    { key: "accountRestricted", label: "האם החשבון מוגבל כרגע, או היה מוגבל בשנתיים?", critical: true },
    { key: "bdiCleanup", label: "האם ביצעת מחיקה או שיפוט BDI?" },
  ];

  return (
    <WizardShell
      stepKey="credit-history"
      title="בדיקת אשראי ראשונית"
      subtitle="עבור על כל אחת מהשאלות יחד עם הלקוח."
      agentTip="שאלות עם כוכבית (*) הן חוסמות. אם הלקוח עונה כן עליהן - לרוב לא נוכל להתקדם."
      onNext={onNext}
      onBack={onBack}
    >
      <div className="space-y-2.5">
        {QS.map((q) => {
          const val = lead[q.key] as boolean | null | undefined;
          const danger = q.critical && val === true;
          return (
            <div
              key={q.key as string}
              className={cn(
                "rounded-2xl border-2 p-3.5 sm:p-4 transition",
                danger ? "border-status-red/50 bg-red-50/60" : "border-bingo-gray-200 bg-white"
              )}
            >
              <div className="text-[14px] font-bold text-bingo-charcoal mb-3 leading-snug">
                {q.critical && <span className="text-status-red ml-1">*</span>}
                {q.label}
              </div>
              <YesNoOk
                value={val}
                onChange={(v) => set(q.key, v as Lead[typeof q.key])}
                critical={q.critical}
              />
            </div>
          );
        })}
      </div>
    </WizardShell>
  );
}

function StepPersonal({ lead, set, onNext, onBack }: StepProps) {
  const idOk = !lead.idNumber || isValidIsraeliId(lead.idNumber);
  const phoneOk = !lead.phone || isValidIsraeliPhone(lead.phone);
  const valid = (lead.firstName?.length ?? 0) >= 2 && (lead.lastName?.length ?? 0) >= 2 && idOk && phoneOk && !!lead.birthDate && !!lead.gender;
  return (
    <WizardShell
      stepKey="personal"
      title="כמה פרטים אישיים"
      subtitle="כל הנתונים מאובטחים ומוצפנים, נשמרים בעת הקלדה."
      agentTip="חשוב לקבל את הנתונים בדיוק כמו בתעודת הזהות, כולל ספרה לבדיקה."
      onNext={onNext}
      onBack={onBack}
      nextDisabled={!valid}
    >
      <div>
        <div className="text-sm font-bold text-bingo-charcoal mb-2.5">
          שם מלא של הלקוח <span className="text-bingo-gray-500 font-medium">(כמו בת״ז)</span>
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          <Field placeholder="שם פרטי" value={lead.firstName ?? ""} onChange={(e) => set("firstName", e.target.value)} />
          <Field placeholder="שם משפחה" value={lead.lastName ?? ""} onChange={(e) => set("lastName", e.target.value)} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        <Field
          label="טלפון נייד"
          placeholder="050-1234567"
          inputMode="tel"
          dir="ltr"
          value={lead.phone ?? ""}
          onChange={(e) => set("phone", e.target.value)}
          error={lead.phone && !phoneOk ? "מספר לא תקין" : undefined}
        />
        <Field
          label="תעודת זהות"
          placeholder="123456789"
          inputMode="numeric"
          maxLength={9}
          dir="ltr"
          value={lead.idNumber || ""}
          onChange={(e) => set("idNumber", e.target.value.replace(/\D/g, ""))}
          error={lead.idNumber && lead.idNumber.length >= 9 && !idOk ? "ת.ז. לא תקינה" : undefined}
        />
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        <Field label="תאריך לידה" type="date" value={lead.birthDate ?? ""} onChange={(e) => set("birthDate", e.target.value)} />
        <div>
          <span className="block text-[13px] font-bold text-bingo-charcoal mb-2">מין</span>
          <div className="grid grid-cols-2 gap-1.5">
            {[
              { v: "male", l: "זכר", sym: "♂" },
              { v: "female", l: "נקבה", sym: "♀" },
            ].map((g) => {
              const selected = lead.gender === g.v;
              return (
                <button
                  key={g.v}
                  type="button"
                  onClick={() => set("gender", g.v as "male" | "female")}
                  className={cn(
                    "flex items-center justify-center gap-1.5 h-12 rounded-2xl text-sm font-bold transition-all border-2",
                    selected
                      ? "bg-gradient-to-b from-[rgba(80,255,10,0.10)] to-[rgba(80,255,10,0.02)] border-bingo-green text-bingo-black shadow-[0_4px_14px_-6px_rgba(80,255,10,0.4)]"
                      : "bg-white border-bingo-gray-200 text-bingo-charcoal hover:border-bingo-green/60"
                  )}
                >
                  <span className={cn("text-lg leading-none", selected ? "text-bingo-green-dark" : "text-bingo-gray-500")}>{g.sym}</span>
                  {g.l}
                </button>
              );
            })}
          </div>
        </div>
      </div>
      <Field
        label="אימייל"
        type="email"
        dir="ltr"
        placeholder="example@email.com"
        value={lead.email ?? ""}
        onChange={(e) => set("email", e.target.value)}
      />
    </WizardShell>
  );
}

function StepHousehold({ lead, set, onNext, onBack }: StepProps) {
  const F: { v: string; l: string; icon: React.ReactNode }[] = [
    { v: "single", l: "רווק/ה", icon: <IconUser size={48} /> },
    { v: "married", l: "נשוי/אה", icon: <IconHeartFamily size={48} /> },
    { v: "divorced", l: "גרוש/ה", icon: <IconUser size={48} /> },
    { v: "widowed", l: "אלמנ/ה", icon: <IconUser size={48} /> },
    { v: "common-law", l: "ידועים בציבור", icon: <IconHeartFamily size={48} /> },
  ];
  return (
    <WizardShell
      stepKey="household"
      title="מצב משפחתי"
      subtitle="פרטים על מצב משפחתי וילדים בבית."
      onNext={onNext}
      onBack={onBack}
    >
      <div>
        <div className="text-sm font-bold text-bingo-charcoal mb-2.5">סטטוס משפחתי</div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {F.map((f) => (
            <OptionCard
              key={f.v}
              selected={lead.familyStatus === f.v}
              onClick={() => set("familyStatus", f.v as Lead["familyStatus"])}
              icon={f.icon}
              label={f.l}
            />
          ))}
        </div>
      </div>
      <Field
        label="מספר ילדים מתחת לגיל 18"
        type="number"
        inputMode="numeric"
        suffix="ילדים"
        value={lead.childrenU18 ?? ""}
        onChange={(e) => set("childrenU18", e.target.value === "" ? undefined : Number(e.target.value))}
      />
    </WizardShell>
  );
}

function StepIncome({ lead, set, onNext, onBack }: StepProps) {
  const E: { v: string; l: string; icon: React.ReactNode }[] = [
    { v: "employee", l: "שכיר", icon: <IconBriefcase size={48} /> },
    { v: "self-employed", l: "עצמאי", icon: <IconBriefcase size={48} /> },
    { v: "stipend", l: "מקבל קצבה", icon: <IconCash size={48} /> },
    { v: "retired", l: "פנסיונר", icon: <IconClock size={48} /> },
    { v: "unemployed", l: "לא עובד", icon: <IconUser size={48} /> },
  ];
  return (
    <WizardShell
      stepKey="income"
      title="תעסוקה והכנסות"
      subtitle="מקור הפרנסה, וותק וגובה ההכנסה."
      onNext={onNext}
      onBack={onBack}
    >
      <div>
        <div className="text-sm font-bold text-bingo-charcoal mb-2.5">מצב תעסוקתי</div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
          {E.map((e) => (
            <OptionCard
              key={e.v}
              selected={lead.employmentStatus === e.v}
              onClick={() => set("employmentStatus", e.v as Lead["employmentStatus"])}
              icon={e.icon}
              label={e.l}
            />
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        <Field
          label="וותק (שנים)"
          type="number"
          inputMode="numeric"
          value={lead.employmentTenure ?? ""}
          onChange={(e) => set("employmentTenure", e.target.value === "" ? undefined : Number(e.target.value))}
        />
        <Field
          label="הכנסה חודשית נטו"
          type="number"
          inputMode="numeric"
          suffix="₪"
          value={lead.monthlyIncome ?? ""}
          onChange={(e) => set("monthlyIncome", e.target.value === "" ? undefined : Number(e.target.value))}
        />
        <Field
          label="הכנסת בן/בת זוג"
          type="number"
          inputMode="numeric"
          suffix="₪"
          value={lead.spouseIncome ?? ""}
          onChange={(e) => set("spouseIncome", e.target.value === "" ? undefined : Number(e.target.value))}
        />
      </div>
    </WizardShell>
  );
}

function StepAssets({ lead, set, onNext, onBack }: StepProps) {
  return (
    <WizardShell
      stepKey="assets"
      title="נכסים"
      subtitle="האם יש בבעלות הלקוח דירה או נכס?"
      agentTip="שעבוד נכס פותח אפיק להלוואה כנגד נכס בריבית נמוכה משמעותית."
      onNext={onNext}
      onBack={onBack}
    >
      <div className="space-y-2">
        <OptionRow
          icon={<IconHome size={48} />}
          label="יש נכס - לא משועבד"
          sub="אופציה מצוינת להלוואה בריבית נמוכה"
          selected={lead.hasProperty === "yes"}
          onClick={() => set("hasProperty", "yes")}
        />
        <OptionRow
          icon={<IconHome size={48} />}
          label="יש נכס - משועבד"
          sub="ניתן לבצע שעבוד נוסף בתנאים מסוימים"
          selected={lead.hasProperty === "yes-charged"}
          onClick={() => set("hasProperty", "yes-charged")}
        />
        <OptionRow
          icon={<IconUser size={48} />}
          label="אין נכס"
          selected={lead.hasProperty === "no"}
          onClick={() => set("hasProperty", "no")}
        />
      </div>
    </WizardShell>
  );
}

function StepVehicle({ lead, set, onNext, onBack }: StepProps) {
  return (
    <WizardShell
      stepKey="vehicle"
      title="פרטי רכב"
      subtitle="מידע על הרכב לצורך בדיקת אופציית שעבוד."
      onNext={onNext}
      onBack={onBack}
    >
      <div className="grid grid-cols-2 gap-2.5">
        <OptionCard
          icon={<IconCar size={56} />}
          label="יש רכב בבעלותי"
          selected={lead.hasVehicle === true}
          onClick={() => set("hasVehicle", true)}
        />
        <OptionCard
          icon={<IconUser size={56} />}
          label="אין רכב"
          selected={lead.hasVehicle === false}
          onClick={() => set("hasVehicle", false)}
        />
      </div>
      {lead.hasVehicle && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <Field
            label="שנת ייצור"
            type="number"
            inputMode="numeric"
            placeholder="2018"
            value={lead.vehicleYear ?? ""}
            onChange={(e) => set("vehicleYear", e.target.value === "" ? undefined : Number(e.target.value))}
          />
          <Field
            label="יצרן ודגם"
            placeholder="טויוטה קורולה"
            value={lead.vehicleMake ?? ""}
            onChange={(e) => set("vehicleMake", e.target.value)}
          />
        </div>
      )}
    </WizardShell>
  );
}

function StepBank({ lead, set, onNext, onBack }: StepProps) {
  return (
    <WizardShell
      stepKey="bank"
      title="פרטי הבנק של הלקוח"
      subtitle="הפרטים מאובטחים ומשמשים לבדיקת זכאות בלבד."
      onNext={onNext}
      onBack={onBack}
    >
      <div className="rounded-2xl bg-gradient-to-bl from-bingo-green/12 to-bingo-green/3 border border-bingo-green/30 p-3 flex items-start gap-2.5">
        <span className="size-7 rounded-xl bg-bingo-green-dark text-white inline-flex items-center justify-center shrink-0">
          <ShieldCheck className="size-4" />
        </span>
        <div className="text-[12px] text-bingo-charcoal leading-relaxed">
          <strong className="block text-bingo-black">המידע מאובטח</strong>
          הצפנה בנקאית SSL/TLS · לא נחשף לאף גורם נוסף
        </div>
      </div>
      <Field
        label="שם הבנק"
        placeholder="לאומי, פועלים, מזרחי, דיסקונט..."
        value={lead.bankName ?? ""}
        onChange={(e) => set("bankName", e.target.value)}
      />
      <div className="grid grid-cols-2 gap-2.5">
        <Field
          label="מספר סניף"
          inputMode="numeric"
          maxLength={4}
          dir="ltr"
          placeholder="מספר סניף"
          value={lead.bankBranch ?? ""}
          onChange={(e) => set("bankBranch", e.target.value.replace(/\D/g, ""))}
        />
        <Field
          label="מספר חשבון"
          inputMode="numeric"
          dir="ltr"
          placeholder="123456"
          value={lead.bankAccount ?? ""}
          onChange={(e) => set("bankAccount", e.target.value.replace(/\D/g, ""))}
        />
      </div>
    </WizardShell>
  );
}

function StepBDI({ lead, set, onNext, onBack }: StepProps) {
  const approved = !!lead.bdiApproved;
  return (
    <WizardShell
      stepKey="bdi"
      title="אישור הלקוח לבדיקת BDI"
      subtitle="הבדיקה רכה - לא משפיעה על דירוג האשראי."
      agentTip="חשוב לקבל אישור מפורש מהלקוח לפני לחיצה. אסור לבצע ללא אישור."
      onNext={onNext}
      onBack={onBack}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <div>
          <div className="text-sm font-bold text-bingo-charcoal mb-2.5">ציון איכות (אוטומציה)</div>
          <div className="grid grid-cols-3 gap-1.5">
            {[
              { v: "green", l: "🟢", color: "border-bingo-green bg-bingo-green/15" },
              { v: "yellow", l: "🟡", color: "border-status-yellow bg-amber-50" },
              { v: "red", l: "🔴", color: "border-status-red bg-red-50" },
            ].map((s) => (
              <button
                key={s.v}
                onClick={() => set("smileyAuto", s.v as Lead["smileyAuto"])}
                className={cn(
                  "h-14 rounded-2xl border-2 text-2xl transition",
                  lead.smileyAuto === s.v ? s.color : "border-bingo-gray-200 bg-white hover:border-bingo-gray-300"
                )}
              >
                {s.l}
              </button>
            ))}
          </div>
        </div>
        <div>
          <div className="text-sm font-bold text-bingo-charcoal mb-2.5">ציון איכות (ידני)</div>
          <div className="grid grid-cols-3 gap-1.5">
            {[
              { v: "green", l: "🟢", color: "border-bingo-green bg-bingo-green/15" },
              { v: "yellow", l: "🟡", color: "border-status-yellow bg-amber-50" },
              { v: "red", l: "🔴", color: "border-status-red bg-red-50" },
            ].map((s) => (
              <button
                key={s.v}
                onClick={() => set("smileyManual", s.v as Lead["smileyManual"])}
                className={cn(
                  "h-14 rounded-2xl border-2 text-2xl transition",
                  lead.smileyManual === s.v ? s.color : "border-bingo-gray-200 bg-white hover:border-bingo-gray-300"
                )}
              >
                {s.l}
              </button>
            ))}
          </div>
        </div>
      </div>
      <button
        type="button"
        onClick={() => set("bdiApproved", !approved)}
        className={cn(
          "w-full h-20 rounded-3xl font-extrabold text-lg transition relative overflow-hidden inline-flex items-center justify-center gap-3",
          approved
            ? "bg-bingo-green text-bingo-black bingo-glow"
            : "bg-bingo-black text-white hover:bg-bingo-charcoal"
        )}
      >
        {approved ? (
          <>
            <BingoBall size={32} />
            <span>הלקוח אישר את בדיקת ה-BDI</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="size-6"><polyline points="20 6 9 17 4 12" /></svg>
          </>
        ) : (
          <>
            <ShieldCheck className="size-6" />
            <span>קבל אישור מהלקוח לבדיקת BDI</span>
          </>
        )}
      </button>
    </WizardShell>
  );
}

function StepOffer({ lead, set, onNext, onBack }: StepProps) {
  const fee = lead.feeAmount || 0;
  const withVat = Math.round(fee * 1.18);
  React.useEffect(() => {
    if (fee && lead.feeWithVat !== withVat) set("feeWithVat", withVat);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fee]);
  return (
    <WizardShell
      stepKey="offer"
      title="הצעת מחיר ללקוח"
      subtitle="סכום סופי, שכר טרחה והתחשבנות מע״מ."
      agentTip="הצג ללקוח את הסכום הסופי שאישרנו ואת שכר הטרחה הכולל מע״מ."
      onNext={onNext}
      onBack={onBack}
    >
      <div className="rounded-3xl bg-gradient-to-bl from-bingo-black to-[#0E1A0E] text-white p-5">
        <div className="text-[11px] uppercase tracking-wider text-bingo-green font-bold">הסכום שאושר ללקוח</div>
        <Field
          label=""
          type="number"
          inputMode="numeric"
          className="bg-white/10 border-white/15 text-white text-3xl font-black h-16 mt-2"
          value={lead.finalApprovedAmount ?? ""}
          onChange={(e) => set("finalApprovedAmount", e.target.value === "" ? undefined : Number(e.target.value))}
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <Field
          label="שכר טרחה (לא כולל מע״מ)"
          type="number"
          inputMode="numeric"
          suffix="₪"
          value={lead.feeAmount ?? ""}
          onChange={(e) => set("feeAmount", e.target.value === "" ? undefined : Number(e.target.value))}
        />
        <Field
          label="כולל מע״מ (אוטומטי)"
          readOnly
          suffix="₪"
          value={withVat ? withVat.toLocaleString("he-IL") : ""}
          className="bg-bingo-cream"
        />
      </div>
    </WizardShell>
  );
}

function StepForms({ lead, onBack }: { lead: Lead; onBack?: () => void }) {
  const forms = [
    { kind: "הלוואה לכל מטרה - בינגו", icon: <IconBolt size={48} /> },
    { kind: "הלוואה כנגד רכב - בינגו", icon: <IconCar size={48} /> },
    { kind: "הלוואה כנגד נכס - בינגו", icon: <IconHome size={48} /> },
    { kind: "הסכם התקשרות - יועצי אשראי בינגו", icon: <IconShieldCheck size={48} /> },
  ];
  return (
    <WizardShell
      stepKey="forms"
      title="טפסים וחתימות"
      subtitle="שלח להחתמה דיגיטלית - הלקוח חותם מהטלפון."
      agentTip="לאחר שליחה ללקוח, הסטטוס מתעדכן אוטומטית כשהוא חותם."
      onBack={onBack}
    >
      {forms.map((f) => {
        const existing = lead.forms?.find((x) => x.kind === f.kind);
        const status = existing?.status;
        return (
          <div key={f.kind} className="rounded-2xl border-2 border-bingo-gray-200 bg-white p-3.5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              {f.icon}
              <div className="min-w-0">
                <div className="text-[14px] font-extrabold text-bingo-black truncate">{f.kind}</div>
                <div className="text-[12px] text-bingo-gray-500">
                  {status === "signed" ? `נחתם ב-${formatDate(existing!.signedAt!)}` : status === "sent" ? "נשלח להחתמה" : "לא נשלח עדיין"}
                </div>
              </div>
            </div>
            <div className="shrink-0">
              {status === "signed" ? (
                <span className="text-[11px] font-bold text-bingo-green-dark bg-bingo-green/15 rounded-full px-2.5 py-1">✓ חתום</span>
              ) : (
                <button className="h-9 px-4 rounded-xl bg-bingo-black text-white text-[12px] font-bold hover:bg-bingo-charcoal transition">
                  שלח להחתמה
                </button>
              )}
            </div>
          </div>
        );
      })}
    </WizardShell>
  );
}

/* ============ SIDE CARDS ============ */
function ContactsCard({ lead }: { lead: Lead }) {
  return (
    <div className="bg-white rounded-3xl border border-bingo-gray-200 bingo-shadow-sm p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[11px] font-bold uppercase tracking-wider text-bingo-gray-500">איש קשר</h3>
        <button className="size-7 rounded-lg bg-bingo-gray-100 hover:bg-bingo-green hover:text-bingo-black text-bingo-charcoal inline-flex items-center justify-center transition">
          <Plus className="size-3.5" />
        </button>
      </div>
      <div className="flex items-center gap-3">
        <Avatar name={lead.fullName} size="lg" />
        <div className="min-w-0">
          <div className="text-sm font-extrabold text-bingo-black truncate">{lead.fullName}</div>
          {lead.phone && (
            <a href={`tel:${lead.phone}`} className="block text-[11px] font-mono tabular-nums font-bold text-bingo-charcoal hover:text-bingo-green-dark mt-0.5" dir="ltr">{lead.phone}</a>
          )}
          {lead.email && (
            <a href={`mailto:${lead.email}`} className="block text-[10px] text-bingo-gray-600 hover:text-bingo-green-dark truncate mt-0.5" dir="ltr">{lead.email}</a>
          )}
        </div>
      </div>
      <div className="grid grid-cols-3 gap-1.5 mt-3">
        <CommBtn href={lead.phone ? `tel:${lead.phone}` : undefined} icon={<Phone className="size-3.5" />} label="חיוג" tone="blue" />
        <CommBtn href={lead.phone ? `https://wa.me/${lead.phone}` : undefined} icon={<MessageCircle className="size-3.5" />} label="WhatsApp" tone="green" />
        <CommBtn href={lead.email ? `mailto:${lead.email}` : undefined} icon={<Mail className="size-3.5" />} label="מייל" tone="purple" />
      </div>
    </div>
  );
}

function CommBtn({ href, icon, label, tone }: { href?: string; icon: React.ReactNode; label: string; tone: "blue" | "green" | "purple" }) {
  const palette = {
    blue: "bg-status-blue-soft text-status-blue hover:bg-status-blue hover:text-white",
    green: "bg-emerald-100 text-emerald-700 hover:bg-emerald-600 hover:text-white",
    purple: "bg-status-purple-soft text-status-purple hover:bg-status-purple hover:text-white",
  } as const;
  return (
    <a href={href || "#"} className={cn("h-9 rounded-lg inline-flex items-center justify-center gap-1.5 text-[11px] font-bold transition", palette[tone], !href && "opacity-50 pointer-events-none")}>
      {icon}{label}
    </a>
  );
}

function ProcessesCard({ lead }: { lead: Lead }) {
  const all = [
    { pipeline: lead.primaryPipeline, status: lead.primaryStatus, ownerId: lead.ownerId, startedAt: lead.intakeDate, primary: true },
    ...lead.processes.map((p) => ({ ...p, primary: false })),
  ];
  return (
    <div className="bg-white rounded-3xl border border-bingo-gray-200 bingo-shadow-sm p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[11px] font-bold uppercase tracking-wider text-bingo-gray-500">תהליכים פעילים</h3>
        <button className="size-7 rounded-lg bg-bingo-gray-100 hover:bg-bingo-green hover:text-bingo-black text-bingo-charcoal inline-flex items-center justify-center transition">
          <Plus className="size-3.5" />
        </button>
      </div>
      <div className="space-y-2">
        {all.map((p, i) => {
          const pipe = getPipeline(p.pipeline);
          const st = getStatus(p.status);
          const owner = getUser(p.ownerId);
          return (
            <div key={i} className={cn("rounded-xl border p-2.5", p.primary ? "border-bingo-green/40 bg-bingo-green/5" : "border-bingo-gray-200")}>
              <div className="text-[11px] font-extrabold text-bingo-black mb-1">{pipe?.emoji} {pipe?.label}</div>
              {st && (
                <Tag color={st.color} className="text-[10px]"><span>{st.emoji}</span><span>{st.label}</span></Tag>
              )}
              <div className="flex items-center gap-1.5 text-[10px] text-bingo-gray-500 mt-1.5">
                <Avatar size="sm" name={owner?.name || ""} emoji={owner?.emoji} />
                <span className="font-bold text-bingo-charcoal">{owner?.name}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
