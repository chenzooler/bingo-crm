"use client";
import * as React from "react";
import type { Lead } from "@/lib/types";
import { LENDERS } from "@/lib/types";
import { getStage, getCategoryDef, STAGES } from "@/lib/data/lifecycle";
import { LOAN_PURPOSES } from "@/lib/data/static";
import { LenderMark, BingoBall } from "@/components/icons/ServiceIcons";
import { StatusGlyph } from "@/components/icons/PipelineIcons";
import { Avatar } from "@/components/ui/Avatar";
import { formatDate, formatCurrency, cn } from "@/lib/utils";
import { Pencil, Phone, Mail, MessageCircle, MapPin, Calendar, Briefcase, Home, Car, Building2, CreditCard, Banknote, Heart, TrendingUp } from "lucide-react";

/**
 * Smart summary view shown when questionnaire is completed.
 * All answers organized in clean, scannable cards.
 */
export function LeadSummary({ lead }: { lead: Lead }) {
  const stage = getStage(lead.stage || "NEW");
  const category = lead.category ? getCategoryDef(lead.category) : null;
  const purpose = LOAN_PURPOSES.find((p) => p.key === lead.loanPurpose);
  const stageIdx = STAGES.findIndex((s) => s.key === lead.stage);

  return (
    <div className="space-y-4">
      {/* Hero panel - Quick overview */}
      <div className="rounded-3xl bg-gradient-to-bl from-bingo-black via-bingo-charcoal to-[#0E1A0E] text-white p-6 relative overflow-hidden bingo-shadow-lg">
        <div className="absolute -top-4 -left-4 size-32 opacity-25"><BingoBall size={128} /></div>

        <div className="relative">
          <div className="flex items-baseline justify-between flex-wrap gap-2 mb-4">
            <div>
              <div className="text-[10px] uppercase tracking-wider text-bingo-green font-bold mb-1">סיכום ליד</div>
              <h2 className="text-2xl font-black">{lead.fullName}</h2>
              <div className="text-[12px] opacity-70 mt-1">
                {lead.idNumber && <span className="font-mono tabular-nums">ת.ז {lead.idNumber} · </span>}
                {category && <span>{category.label}</span>}
              </div>
            </div>
            <div className="text-left">
              {lead.amountRequested && (
                <>
                  <div className="text-[10px] uppercase tracking-wider text-bingo-green font-bold">סכום מבוקש</div>
                  <div className="text-3xl font-black tabular-nums text-bingo-green">{formatCurrency(lead.amountRequested)}</div>
                </>
              )}
            </div>
          </div>

          {/* Stage progress bar */}
          <div className="grid grid-cols-10 gap-0.5 mb-2">
            {STAGES.slice(0, 10).map((s, i) => (
              <div
                key={s.key}
                className={cn("h-1.5 rounded-full transition-all",
                  i < stageIdx ? "bg-bingo-green" :
                  i === stageIdx ? "bg-bingo-green animate-pulse-green" :
                  "bg-white/15"
                )}
                title={s.label}
              />
            ))}
          </div>
          <div className="flex items-center justify-between text-[11px] opacity-70 font-bold">
            <span>שלב נוכחי: {stage?.label}</span>
            <span>{stageIdx >= 0 ? stageIdx + 1 : 0}/{STAGES.length - 1}</span>
          </div>
        </div>
      </div>

      {/* Quick contact */}
      <SummaryCard title="פרטי קשר" icon={<Phone className="size-4" />}>
        <Grid cols={2}>
          <Field icon={<Phone className="size-3.5" />} label="טלפון" value={lead.phone || "—"} mono />
          <Field icon={<Mail className="size-3.5" />} label="אימייל" value={lead.email || "—"} mono />
          <Field icon={<Calendar className="size-3.5" />} label="תאריך לידה" value={lead.birthDate ? formatDate(lead.birthDate) : "—"} />
          <Field icon={<TrendingUp className="size-3.5" />} label="מגדר" value={lead.gender === "male" ? "זכר" : lead.gender === "female" ? "נקבה" : "—"} />
        </Grid>
      </SummaryCard>

      {/* Loan request */}
      <SummaryCard title="פרטי הבקשה" icon={<Banknote className="size-4" />}>
        <Grid cols={2}>
          <Field label="סכום מבוקש" value={lead.amountRequested ? formatCurrency(lead.amountRequested) : "—"} bold highlight />
          <Field label="מטרת הלוואה" value={purpose?.label || "—"} />
        </Grid>
      </SummaryCard>

      {/* Credit history */}
      <SummaryCard title="היסטוריית אשראי" icon={<CreditCard className="size-4" />}>
        <div className="space-y-2">
          <YesNoRow label="הוצאה לפועל ב-3 שנים" value={lead.hadEnforcement} critical />
          <YesNoRow label="חזרת צ׳קים / הוראות קבע" value={lead.hadCreditIssues} />
          <YesNoRow label="חשבון מוגבל" value={lead.accountRestricted} critical />
          <YesNoRow label="מחיקה / שיפוט BDI" value={lead.bdiCleanup} />
          {lead.creditCards && lead.creditCards.length > 0 && (
            <div className="pt-2 mt-2 border-t border-bingo-gray-100">
              <span className="text-[11px] font-bold text-bingo-gray-500 block mb-1.5">כרטיסי אשראי</span>
              <div className="flex flex-wrap gap-1.5">
                {lead.creditCards.map((c) => (
                  <span key={c} className="text-[11px] font-bold bg-bingo-green/15 text-bingo-green-dark rounded-full px-2 py-0.5">
                    {c === "isracard" ? "ישראכרט" : c === "cal" ? "כאל" : c === "max" ? "מקס" : c === "direct" ? "דיירקט" : "אין"}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </SummaryCard>

      {/* Household */}
      <SummaryCard title="מצב משפחתי" icon={<Heart className="size-4" />}>
        <Grid cols={2}>
          <Field label="סטטוס" value={
            lead.familyStatus === "single" ? "רווק/ה" :
            lead.familyStatus === "married" ? "נשוי/אה" :
            lead.familyStatus === "divorced" ? "גרוש/ה" :
            lead.familyStatus === "widowed" ? "אלמנ/ה" :
            lead.familyStatus === "common-law" ? "ידועים בציבור" : "—"
          } />
          <Field label="ילדים מתחת 18" value={lead.childrenU18?.toString() ?? "—"} />
        </Grid>
      </SummaryCard>

      {/* Income */}
      <SummaryCard title="תעסוקה והכנסות" icon={<Briefcase className="size-4" />}>
        <Grid cols={3}>
          <Field label="תעסוקה" value={
            lead.employmentStatus === "employee" ? "שכיר" :
            lead.employmentStatus === "self-employed" ? "עצמאי" :
            lead.employmentStatus === "stipend" ? "מקבל קצבה" :
            lead.employmentStatus === "retired" ? "פנסיונר" :
            lead.employmentStatus === "unemployed" ? "לא עובד" : "—"
          } />
          <Field label="וותק" value={lead.employmentTenure ? `${lead.employmentTenure} שנים` : "—"} />
          <Field label="הכנסה חודשית" value={lead.monthlyIncome ? formatCurrency(lead.monthlyIncome) : "—"} highlight />
          {lead.spouseIncome != null && lead.spouseIncome > 0 && (
            <Field label="הכנסת בן/בת זוג" value={formatCurrency(lead.spouseIncome)} />
          )}
        </Grid>
      </SummaryCard>

      {/* Assets */}
      <SummaryCard title="נכסים" icon={<Home className="size-4" />}>
        <Field label="דירה / נכס" value={
          lead.hasProperty === "yes" ? "יש - לא משועבד" :
          lead.hasProperty === "yes-charged" ? "יש - משועבד" :
          lead.hasProperty === "no" ? "אין נכס" : "—"
        } />
      </SummaryCard>

      {/* Vehicle */}
      {lead.hasVehicle && (
        <SummaryCard title="פרטי רכב" icon={<Car className="size-4" />}>
          <Grid cols={2}>
            <Field label="שנת ייצור" value={lead.vehicleYear?.toString() ?? "—"} />
            <Field label="יצרן ודגם" value={lead.vehicleMake || "—"} />
          </Grid>
        </SummaryCard>
      )}

      {/* Bank */}
      <SummaryCard title="פרטי בנק" icon={<Building2 className="size-4" />}>
        <Grid cols={3}>
          <Field label="בנק" value={lead.bankName || "—"} />
          <Field label="סניף" value={lead.bankBranch || "—"} mono />
          <Field label="חשבון" value={lead.bankAccount || "—"} mono />
        </Grid>
      </SummaryCard>

      {/* Lender check results */}
      {lead.lenderChecks && Object.keys(lead.lenderChecks).length > 0 && (
        <SummaryCard title="תוצאות בדיקה מול גופים" icon={<MapPin className="size-4" />}>
          <div className="space-y-2">
            {LENDERS.filter((l) => lead.lenderChecks?.[l.key]).map((l) => {
              const check = lead.lenderChecks![l.key];
              return (
                <div key={l.key} className="flex items-center gap-3 p-2.5 rounded-xl bg-bingo-gray-50 border border-bingo-gray-100">
                  <LenderMark code={l.key} size={32} />
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-extrabold text-bingo-black">{l.label}</div>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <span className="text-[10px] font-bold text-bingo-gray-600">
                        {check.result === "approved-final" ? "אישור סופי" :
                         check.result === "approved-principal" ? "אישור עקרוני" :
                         check.result === "rejected" ? "סורב" :
                         check.result === "not-checked" ? "לא נבדק" : check.result}
                      </span>
                      {check.approvedAmount && (
                        <span className="text-[11px] font-mono tabular-nums font-bold text-bingo-green-dark">
                          {formatCurrency(check.approvedAmount)}
                        </span>
                      )}
                      {check.monthlyPayment && (
                        <span className="text-[10px] text-bingo-gray-500">/ {formatCurrency(check.monthlyPayment)} לחודש</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </SummaryCard>
      )}

      {/* Final result */}
      {lead.finalApprovedAmount && (
        <SummaryCard title="הצעה סופית" icon={<TrendingUp className="size-4" />} highlight>
          <Grid cols={2}>
            <Field label="סכום הלוואה מאושר" value={formatCurrency(lead.finalApprovedAmount)} bold highlight />
            <Field label="שכר טרחה (כולל מע״מ)" value={lead.feeWithVat ? formatCurrency(lead.feeWithVat) : lead.feeAmount ? formatCurrency(lead.feeAmount) : "—"} bold />
          </Grid>
        </SummaryCard>
      )}
    </div>
  );
}

/* ===== Internal components ===== */

function SummaryCard({ title, icon, children, highlight }: { title: string; icon: React.ReactNode; children: React.ReactNode; highlight?: boolean }) {
  return (
    <div className={cn(
      "rounded-2xl border bingo-shadow-sm p-4",
      highlight ? "bg-gradient-to-bl from-bingo-green/15 to-bingo-green/5 border-bingo-green/40" : "bg-white border-bingo-gray-200"
    )}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-extrabold text-bingo-black inline-flex items-center gap-2">
          <span className={cn("size-7 rounded-lg inline-flex items-center justify-center",
            highlight ? "bg-bingo-green text-bingo-black" : "bg-bingo-gray-100 text-bingo-charcoal"
          )}>{icon}</span>
          {title}
        </h3>
        <button className="size-7 rounded-lg hover:bg-bingo-gray-100 text-bingo-gray-400 hover:text-bingo-charcoal inline-flex items-center justify-center transition" title="ערוך">
          <Pencil className="size-3.5" />
        </button>
      </div>
      {children}
    </div>
  );
}

function Grid({ cols, children }: { cols: 2 | 3; children: React.ReactNode }) {
  return <div className={cn("grid gap-3", cols === 2 ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-2 sm:grid-cols-3")}>{children}</div>;
}

function Field({ icon, label, value, mono, bold, highlight }: { icon?: React.ReactNode; label: string; value: string; mono?: boolean; bold?: boolean; highlight?: boolean }) {
  return (
    <div>
      <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-bingo-gray-500 mb-0.5">
        {icon}
        {label}
      </div>
      <div className={cn(
        "text-[14px]",
        bold ? "font-extrabold" : "font-bold",
        mono && "font-mono tabular-nums",
        highlight ? "text-bingo-green-dark" : "text-bingo-black"
      )} dir={mono ? "ltr" : "rtl"}>{value}</div>
    </div>
  );
}

function YesNoRow({ label, value, critical }: { label: string; value?: boolean | null; critical?: boolean }) {
  let display: string;
  let color: string;
  if (value === true) {
    display = critical ? "✗ כן" : "כן";
    color = critical ? "text-status-red font-bold" : "text-amber-700 font-bold";
  } else if (value === false) {
    display = "לא";
    color = "text-bingo-green-dark font-bold";
  } else if (value === null) {
    display = "✓ הכל תקין";
    color = "text-bingo-green-dark font-bold";
  } else {
    display = "—";
    color = "text-bingo-gray-400";
  }
  return (
    <div className="flex items-center justify-between text-[12px]">
      <span className="text-bingo-charcoal">{label}</span>
      <span className={color}>{display}</span>
    </div>
  );
}
