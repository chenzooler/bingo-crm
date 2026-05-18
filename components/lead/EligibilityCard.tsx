"use client";
import * as React from "react";
import type { Lead } from "@/lib/types";
import { evaluateEligibility } from "@/lib/lead-logic";
import { cn } from "@/lib/utils";

export function EligibilityCard({ lead }: { lead: Lead }) {
  const r = evaluateEligibility(lead);
  const config = {
    ok: {
      bg: "bg-gradient-to-bl from-bingo-green/15 to-bingo-green/5 border-bingo-green/40",
      label: "כשיר להתקדם",
      sub: "כל הנתונים תקינים, אפשר לעבור לבדיקה מול גופי המימון",
      icon: "✓",
      iconBg: "bg-bingo-green text-bingo-black",
      tone: "text-bingo-green-dark",
    },
    caution: {
      bg: "bg-gradient-to-bl from-status-yellow-soft to-amber-50 border-status-yellow/50",
      label: "כשיר עם הסתייגות",
      sub: "יש נקודה אחת לתשומת לב, אפשר להתקדם",
      icon: "i",
      iconBg: "bg-status-yellow text-amber-900",
      tone: "text-amber-700",
    },
    warn: {
      bg: "bg-gradient-to-bl from-status-orange-soft to-orange-50 border-status-orange/50",
      label: "טיפול מורכב - דרושה תשומת לב",
      sub: "יש מספר נקודות שצריך להתייחס אליהן לפני התקדמות",
      icon: "!",
      iconBg: "bg-status-orange text-white",
      tone: "text-orange-700",
    },
    blocker: {
      bg: "bg-gradient-to-bl from-status-red-soft to-red-50 border-status-red/50",
      label: "לא ניתן להתקדם",
      sub: "קיימים נתונים שמונעים אישור הלוואה כרגע",
      icon: "✕",
      iconBg: "bg-status-red text-white",
      tone: "text-red-700",
    },
  } as const;
  const c = config[r.verdict];

  return (
    <div className={cn("rounded-2xl border p-4 sm:p-5", c.bg)}>
      <div className="flex items-start gap-3">
        <div className={cn("size-12 rounded-2xl inline-flex items-center justify-center text-2xl font-black shrink-0", c.iconBg)}>{c.icon}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline justify-between gap-2 flex-wrap">
            <h3 className={cn("text-base font-extrabold", c.tone)}>{c.label}</h3>
            <span className="text-[11px] font-mono tabular-nums font-bold text-bingo-charcoal">
              ציון: <span className="text-base">{r.score}</span>/100
            </span>
          </div>
          <p className="text-[12px] text-bingo-charcoal/80 mt-0.5">{c.sub}</p>
          {r.reasons.length > 0 && (
            <ul className="mt-3 space-y-1">
              {r.reasons.map((reason, i) => (
                <li key={i} className="flex items-start gap-1.5 text-[12px] text-bingo-charcoal">
                  <span className={cn("inline-block size-1.5 rounded-full mt-1.5 shrink-0", c.iconBg)} />
                  {reason}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
