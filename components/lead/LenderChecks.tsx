"use client";
import * as React from "react";
import type { Lead, LenderCheck } from "@/lib/types";
import { LENDERS } from "@/lib/types";
import { LenderMark } from "@/components/icons/ServiceIcons";
import { Input } from "@/components/ui/Input";
import { cn, formatCurrency, formatNumber } from "@/lib/utils";

const RESULT_LABELS: Record<string, { label: string; color: string }> = {
  "approved-principal": { label: "אישור עקרוני", color: "text-status-green bg-status-green-soft border-status-green/30" },
  "approved-principal-needs-account": { label: "עקרוני - נדרש עו\"ש", color: "text-status-blue bg-status-blue-soft border-status-blue/30" },
  "approved-final": { label: "אישור סופי", color: "text-status-green bg-status-green-soft border-status-green/40 font-extrabold" },
  rejected: { label: "סורב", color: "text-status-red bg-status-red-soft border-status-red/30" },
  "not-checked": { label: "לא נבדק", color: "text-bingo-gray-600 bg-bingo-gray-100 border-bingo-gray-200" },
  "check-error": { label: "שגיאה בבדיקה", color: "text-status-orange bg-status-orange-soft border-status-orange/30" },
  "had-other-approval": { label: "אישור עצמאי", color: "text-status-purple bg-status-purple-soft border-status-purple/30" },
  "got-other-approval": { label: "אישור מגוף אחר", color: "text-status-cyan bg-status-cyan-soft border-status-cyan/30" },
};

export function LenderChecks({
  lead,
  onChange,
}: {
  lead: Lead;
  onChange: (key: string, check: LenderCheck) => void;
}) {
  const [open, setOpen] = React.useState<string | null>(null);

  return (
    <div className="space-y-2">
      {LENDERS.map((l) => {
        const check = lead.lenderChecks?.[l.key] || { key: l.key, result: "not-checked" };
        const isOpen = open === l.key;
        const r = check.result || "not-checked";
        const resultCfg = RESULT_LABELS[r];
        const interested = check.customerInterest;

        return (
          <div key={l.key} className={cn("rounded-2xl border bg-white transition", isOpen ? "border-bingo-green/50 bingo-shadow" : "border-bingo-gray-200")}>
            <button
              type="button"
              onClick={() => setOpen((o) => (o === l.key ? null : l.key))}
              className="w-full flex items-center gap-3 p-3 text-right"
            >
              <LenderMark code={l.key} size={36} />
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-extrabold text-bingo-black">{l.label}</div>
                <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                  <span className={cn("text-[10px] font-bold rounded-full px-2 py-0.5 border", resultCfg.color)}>
                    {resultCfg.label}
                  </span>
                  {check.approvedAmount ? (
                    <span className="text-[10px] font-mono tabular-nums font-bold text-bingo-charcoal bg-bingo-green/15 rounded-full px-2 py-0.5">
                      {formatCurrency(check.approvedAmount)}
                    </span>
                  ) : null}
                  {check.monthlyPayment ? (
                    <span className="text-[10px] font-mono tabular-nums text-bingo-gray-600">
                      החזר: {formatCurrency(check.monthlyPayment)}/חודש
                    </span>
                  ) : null}
                  {interested === "yes-progress" && (
                    <span className="text-[10px] font-bold text-bingo-green-dark inline-flex items-center gap-0.5">
                      ● הלקוח מעוניין
                    </span>
                  )}
                </div>
              </div>
              <ChevronDown className={cn("size-4 text-bingo-gray-500 transition-transform", isOpen && "rotate-180")} />
            </button>

            {isOpen && (
              <div className="border-t border-bingo-gray-150 p-4 space-y-3 bg-bingo-cream/40">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <SelectField
                    label="תוצאת בדיקה"
                    value={r}
                    onChange={(v) => onChange(l.key, { ...check, result: v as LenderCheck["result"] })}
                    options={[
                      { v: "not-checked", l: "לא נבדק" },
                      { v: "approved-principal", l: "אישור עקרוני" },
                      { v: "approved-principal-needs-account", l: "עקרוני - נדרש עו\"ש" },
                      { v: "approved-final", l: "אישור סופי" },
                      { v: "rejected", l: "סורב" },
                      { v: "check-error", l: "שגיאה בבדיקה" },
                      { v: "had-other-approval", l: "אישור עצמאי" },
                    ]}
                  />
                  <NumField
                    label="סכום מאושר"
                    suffix="₪"
                    value={check.approvedAmount}
                    onChange={(v) => onChange(l.key, { ...check, approvedAmount: v })}
                  />
                  <NumField
                    label="תשלומים"
                    value={check.maxPayments}
                    onChange={(v) => onChange(l.key, { ...check, maxPayments: v })}
                  />
                  <NumField
                    label="ריבית"
                    suffix="%"
                    value={check.interest}
                    onChange={(v) => onChange(l.key, { ...check, interest: v })}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <NumField
                    label="החזר חודשי"
                    suffix="₪"
                    value={check.monthlyPayment}
                    onChange={(v) => onChange(l.key, { ...check, monthlyPayment: v })}
                  />
                  <SelectField
                    label="הלקוח מעוניין?"
                    value={check.customerInterest || ""}
                    onChange={(v) => onChange(l.key, { ...check, customerInterest: (v || undefined) as LenderCheck["customerInterest"] })}
                    options={[
                      { v: "", l: "לא הוחלט" },
                      { v: "yes-progress", l: "כן - מתקדם" },
                      { v: "yes-partial", l: "כן - חלקי" },
                      { v: "hesitating", l: "מתלבט" },
                      { v: "not-interested", l: "לא מעוניין" },
                    ]}
                  />
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => onChange(l.key, { ...check, result: "approved-final", approvedAmount: check.approvedAmount, customerInterest: "yes-progress" })}
                    className="h-8 px-3 rounded-lg bg-bingo-green hover:bg-bingo-green-bright text-bingo-black text-xs font-bold inline-flex items-center gap-1 transition"
                  >
                    ✓ אשר וסמן מתקדם
                  </button>
                  <button
                    onClick={() => onChange(l.key, { ...check, result: "rejected" })}
                    className="h-8 px-3 rounded-lg bg-status-red-soft hover:bg-red-200 text-status-red text-xs font-bold transition"
                  >
                    ✕ סמן כסירוב
                  </button>
                  <button
                    onClick={() => onChange(l.key, { key: l.key, result: "not-checked" })}
                    className="h-8 px-3 rounded-lg bg-white border border-bingo-gray-200 hover:bg-bingo-gray-100 text-bingo-charcoal text-xs font-bold transition mr-auto"
                  >
                    איפוס
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function NumField({ label, suffix, value, onChange }: { label: string; suffix?: string; value?: number; onChange: (v: number | undefined) => void }) {
  return (
    <label className="block">
      <span className="block text-[10px] font-bold uppercase tracking-wider text-bingo-gray-500 mb-1">{label}</span>
      <div className="relative">
        <input
          type="number"
          inputMode="numeric"
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value === "" ? undefined : Number(e.target.value))}
          className="h-9 w-full rounded-lg border border-bingo-gray-200 bg-white px-2.5 text-sm font-mono tabular-nums font-bold text-bingo-black hover:border-bingo-gray-300 focus:border-bingo-green focus:outline-none focus:ring-2 focus:ring-bingo-green/15"
        />
        {suffix && (
          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[11px] font-bold text-bingo-gray-400">{suffix}</span>
        )}
      </div>
    </label>
  );
}

function SelectField({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: { v: string; l: string }[] }) {
  return (
    <label className="block">
      <span className="block text-[10px] font-bold uppercase tracking-wider text-bingo-gray-500 mb-1">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 w-full rounded-lg border border-bingo-gray-200 bg-white px-2 text-[12px] font-bold text-bingo-black hover:border-bingo-gray-300 focus:border-bingo-green focus:outline-none focus:ring-2 focus:ring-bingo-green/15"
      >
        {options.map((o) => (
          <option key={o.v} value={o.v}>{o.l}</option>
        ))}
      </select>
    </label>
  );
}

function ChevronDown({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}
