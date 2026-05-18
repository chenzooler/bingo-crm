"use client";
import * as React from "react";
import type { Lead } from "@/lib/types";
import { LENDERS } from "@/lib/types";
import { totalApproved, bestLender, generateCallScript, evaluateEligibility } from "@/lib/lead-logic";
import { LenderMark, BingoBall } from "@/components/icons/ServiceIcons";
import { formatCurrency, formatNumber } from "@/lib/utils";

export function ResultsSummary({ lead }: { lead: Lead }) {
  const total = totalApproved(lead);
  const best = bestLender(lead);
  const eligibility = evaluateEligibility(lead);
  const script = generateCallScript(lead, { approved: total, best });

  const allChecks = Object.entries(lead.lenderChecks || {});
  const approvedCount = allChecks.filter(([, c]) => c.approvedAmount && c.approvedAmount > 0).length;
  const rejectedCount = allChecks.filter(([, c]) => c.result === "rejected").length;
  const checkedCount = allChecks.filter(([, c]) => c.result && c.result !== "not-checked").length;

  const monthly = best?.check.monthlyPayment;
  const fee = lead.feeWithVat || lead.feeAmount || 0;
  const customerCurrentMonthly = lead.existingLoans?.reduce((s, x) => s + x.monthly, 0) || 0;
  const newMonthly = monthly || 0;
  const monthlySavings = customerCurrentMonthly - newMonthly;

  const [copied, setCopied] = React.useState(false);
  function copyScript() {
    navigator.clipboard?.writeText(script);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  if (eligibility.verdict === "blocker") {
    return (
      <div className="rounded-2xl border border-status-red/40 bg-gradient-to-bl from-status-red-soft to-red-50 p-5">
        <div className="flex items-start gap-3">
          <div className="size-12 rounded-2xl bg-status-red text-white inline-flex items-center justify-center text-2xl font-black">
            ✕
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-extrabold text-red-700">לא ניתן להתקדם עם הליד</h3>
            <p className="text-[13px] text-red-700/80 mt-0.5">הסיבות שמונעות אישור:</p>
            <ul className="mt-2 space-y-1">
              {eligibility.reasons.map((r, i) => (
                <li key={i} className="text-[13px] text-bingo-charcoal flex items-start gap-2">
                  <span className="size-1.5 rounded-full bg-status-red mt-1.5 shrink-0" />
                  {r}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Hero result */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-bl from-bingo-black via-bingo-charcoal to-[#0E1A0E] text-white p-5 sm:p-7">
        <div className="absolute -top-4 -left-4 size-32 opacity-30">
          <BingoBall size={128} />
        </div>
        <div className="absolute top-1/2 left-12 size-16 opacity-20">
          <BingoBall size={64} />
        </div>

        <div className="relative">
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex size-2 rounded-full bg-bingo-green animate-pulse-green" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-bingo-green">תוצאת בדיקה</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black leading-none">
            הצלחנו לאשר עבור הלקוח
          </h2>
          <div className="mt-4 flex items-baseline gap-3 flex-wrap">
            <div className="text-[56px] sm:text-[68px] font-black leading-none text-bingo-green tabular-nums">
              {formatNumber(total)}
            </div>
            <div className="text-2xl font-bold opacity-80">₪</div>
          </div>

          <div className="mt-4 flex items-center gap-3 flex-wrap">
            {best && (
              <div className="bg-white/10 backdrop-blur rounded-xl px-3 py-2 inline-flex items-center gap-2">
                <LenderMark code={best.key} size={28} />
                <div>
                  <div className="text-[10px] uppercase tracking-wider opacity-60">הצעה הטובה ביותר</div>
                  <div className="text-[13px] font-extrabold">{LENDERS.find((x) => x.key === best.key)?.label}</div>
                </div>
              </div>
            )}
            {monthly && (
              <Stat label="החזר חודשי" value={`${formatNumber(monthly)} ₪`} />
            )}
            {best?.check.maxPayments && (
              <Stat label="תשלומים" value={`${best.check.maxPayments}`} />
            )}
            {best?.check.interest && (
              <Stat label="ריבית" value={`${best.check.interest}%`} />
            )}
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <StatCard label="גופים שנבדקו" value={`${checkedCount}/${LENDERS.length}`} accent="blue" />
        <StatCard label="אישורים" value={`${approvedCount}`} accent="green" />
        <StatCard label="סירובים" value={`${rejectedCount}`} accent="red" />
        <StatCard label="שכר טרחה" value={fee ? formatCurrency(fee) : "—"} accent="purple" />
      </div>

      {/* Customer comparison */}
      {customerCurrentMonthly > 0 && newMonthly > 0 && (
        <div className="rounded-2xl bg-white border border-bingo-gray-200 bingo-shadow-sm p-4">
          <h3 className="text-[11px] font-bold uppercase tracking-wider text-bingo-gray-500 mb-3">השוואה ללקוח</h3>
          <div className="grid grid-cols-3 items-center gap-3">
            <Compare label="היום משלם" value={customerCurrentMonthly} />
            <div className="text-center">
              <ArrowFlow saving={monthlySavings >= 0} />
              <div className={`text-[11px] font-bold mt-1 ${monthlySavings >= 0 ? "text-bingo-green-dark" : "text-status-red"}`}>
                {monthlySavings >= 0 ? `חיסכון ${formatCurrency(monthlySavings)}` : `תוספת ${formatCurrency(Math.abs(monthlySavings))}`}
              </div>
            </div>
            <Compare label="ישלם איתנו" value={newMonthly} highlight />
          </div>
        </div>
      )}

      {/* Call script */}
      <div className="rounded-2xl bg-white border-2 border-bingo-green/40 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2.5 bg-gradient-to-l from-bingo-green/15 to-bingo-green/5 border-b border-bingo-green/30">
          <div className="flex items-center gap-2">
            <BingoBall size={20} />
            <h3 className="text-sm font-extrabold text-bingo-black">תסריט שיחה - מבוסס תוצאות</h3>
          </div>
          <button
            onClick={copyScript}
            className="h-8 px-3 rounded-lg bg-bingo-black text-white text-[11px] font-bold hover:bg-bingo-charcoal transition inline-flex items-center gap-1"
          >
            {copied ? (
              <><Check className="size-3.5" /> הועתק</>
            ) : (
              <><CopyIcon className="size-3.5" /> העתק</>
            )}
          </button>
        </div>
        <div className="p-4 text-[13px] leading-relaxed text-bingo-charcoal whitespace-pre-line font-medium">{script}</div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white/10 backdrop-blur rounded-xl px-3 py-2">
      <div className="text-[10px] uppercase tracking-wider opacity-60">{label}</div>
      <div className="text-[15px] font-extrabold tabular-nums">{value}</div>
    </div>
  );
}

function StatCard({ label, value, accent }: { label: string; value: string; accent: "blue" | "green" | "red" | "purple" }) {
  const accents = {
    blue: "from-status-blue/8 to-status-blue/3 border-status-blue/20 text-status-blue",
    green: "from-bingo-green/15 to-bingo-green/5 border-bingo-green/40 text-bingo-green-dark",
    red: "from-status-red/8 to-status-red/3 border-status-red/20 text-status-red",
    purple: "from-status-purple/8 to-status-purple/3 border-status-purple/20 text-status-purple",
  } as const;
  return (
    <div className={`rounded-xl bg-gradient-to-bl ${accents[accent]} border p-3`}>
      <div className="text-[10px] font-bold uppercase tracking-wider">{label}</div>
      <div className="text-2xl font-black text-bingo-black tabular-nums leading-none mt-1">{value}</div>
    </div>
  );
}

function Compare({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  return (
    <div className="text-center">
      <div className="text-[10px] font-bold uppercase tracking-wider text-bingo-gray-500">{label}</div>
      <div className={`text-2xl font-black tabular-nums leading-none mt-1 ${highlight ? "text-bingo-green-dark" : "text-bingo-charcoal"}`}>
        {formatCurrency(value)}
      </div>
    </div>
  );
}

function ArrowFlow({ saving }: { saving: boolean }) {
  return (
    <svg viewBox="0 0 60 24" className={`mx-auto ${saving ? "text-bingo-green-dark" : "text-status-red"}`}>
      <line x1="55" y1="12" x2="6" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <polyline points="12,7 6,12 12,17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      {saving ? (
        <text x="30" y="9" textAnchor="middle" fontSize="9" fontWeight="800" fill="currentColor">חיסכון</text>
      ) : null}
    </svg>
  );
}

function Check({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function CopyIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
    </svg>
  );
}
