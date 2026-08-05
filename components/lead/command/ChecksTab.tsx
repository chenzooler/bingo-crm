"use client";
/**
 * טאב בדיקות הזכאות — הגרסה המלאה והעריכה בשפת מרכז השליטה.
 * אותם מפתחות נתונים כמו הקלאסי/v4 (lender_<key>_<field>) — אפס שינוי דאטה.
 */
import * as React from "react";
import { motion } from "framer-motion";
import { Zap } from "lucide-react";
import OrgLogo from "@/components/ui/OrgLogo";
import { CARD_LENDERS, LENDER_RESULT_Y, INTERESTED_Y, JERUSALEM_STAGE_Y } from "@/lib/yoatsim/card-schema";
import { cn, formatCurrency } from "@/lib/utils";
import { CountUp, useEpEntrance } from "@/components/lead/v4/ep";
import type { CardV4PageProps } from "@/components/lead/v4/types";
import { Panel, PanelTitle, sval, nval } from "./shared";

const logoSrc = (key: string) => `/logos/lenders/${key}.${key === "phoenix" ? "svg" : "png"}`;

export function ChecksTab({ state }: CardV4PageProps) {
  const { values, set } = state;
  const { parent, child } = useEpEntrance();

  const totalApproved = CARD_LENDERS.reduce((sum, l) =>
    sval(values, `lender_${l.key}_result`) === "יש אישור" ? sum + nval(values, `lender_${l.key}_amount`) : sum, 0);
  const totalFinal = CARD_LENDERS.reduce((sum, l) => sum + nval(values, `lender_${l.key}_proceedAmount`), 0);

  return (
    <motion.div variants={parent} initial="hidden" animate="show" className="space-y-3">
      {CARD_LENDERS.map((l) => {
        const k = (f: string) => `lender_${l.key}_${f}`;
        const result = sval(values, k("result"));
        const approved = result === "יש אישור";
        const approvedAmount = approved ? nval(values, k("amount")) : 0;
        return (
          <Panel key={l.key} variants={child} className="p-4">
            {approved && approvedAmount > 0 && (
              <span aria-hidden className="absolute inset-y-3 start-0 w-[2px] rounded-full" style={{ background: "rgba(80,255,10,.5)" }} />
            )}
            <div className="flex items-center gap-3 mb-3 flex-wrap">
              <OrgLogo src={logoSrc(l.key)} name={l.name} size={36} />
              <span className="text-[14.5px] font-bold min-w-28" style={{ color: "var(--cmd-tx)" }}>{l.name}</span>
              {approved && approvedAmount > 0 && (
                <b className="text-[13.5px] tabular-nums font-extrabold" style={{ color: "var(--cmd-lime)" }}>
                  <CountUp value={approvedAmount} format={(n) => formatCurrency(n)} />
                </b>
              )}
              <span className="flex-1" />
              <select
                className="cmd-input !w-44"
                aria-label={`תוצאת בדיקה - ${l.name}`}
                value={result}
                onChange={(e) => set(k("result"), e.target.value || undefined)}
              >
                <option value="">תוצאת בדיקה</option>
                {LENDER_RESULT_Y.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
              {l.key === "jerusalem" && (
                <select
                  className="cmd-input !w-36"
                  aria-label="שלב בבנק ירושלים"
                  value={sval(values, k("stage"))}
                  onChange={(e) => set(k("stage"), e.target.value || undefined)}
                >
                  <option value="">שלב</option>
                  {JERUSALEM_STAGE_Y.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              )}
              <input
                className="cmd-input !w-auto flex-1 min-w-32"
                placeholder="סיבה"
                value={sval(values, k("reason"))}
                onChange={(e) => set(k("reason"), e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
              {([["amount", "סכום מאושר ₪"], ["payments", "תשלומים מקס'"], ["interest", "ריבית %"], ["monthly", "החזר חודשי ₪"]] as const).map(([f, label]) => (
                <label key={f} className="block">
                  <span className="block text-[11px] font-semibold mb-0.5" style={{ color: "var(--cmd-tx2)" }}>{label}</span>
                  <input
                    className="cmd-input tabular-nums"
                    inputMode="decimal"
                    value={sval(values, k(f))}
                    onChange={(e) => set(k(f), e.target.value)}
                  />
                </label>
              ))}
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[12.5px] font-semibold" style={{ color: "var(--cmd-tx2)" }}>מעוניין להתקדם?</span>
              {INTERESTED_Y.map((o) => (
                <button
                  key={o}
                  type="button"
                  onClick={() => set(k("interested"), sval(values, k("interested")) === o ? undefined : o)}
                  className={cn(
                    "rounded-full px-4 h-9 text-[12px] font-semibold cursor-pointer transition-colors duration-150 border",
                    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#50FF0A]",
                    sval(values, k("interested")) === o
                      ? "bg-[#50FF0A] text-[#0A2500] border-transparent"
                      : "bg-[#1A1F28] border-white/[.08] hover:border-white/[.2]",
                  )}
                  style={sval(values, k("interested")) === o ? undefined : { color: "var(--cmd-tx2)" }}
                >
                  {o}
                </button>
              ))}
              <input
                className="cmd-input !w-36 tabular-nums"
                inputMode="numeric"
                placeholder="סכום שהתקדמו"
                value={sval(values, k("proceedAmount"))}
                onChange={(e) => set(k("proceedAmount"), e.target.value)}
              />
              {sval(values, k("interested")) === "לא" && (
                <input
                  className="cmd-input !w-auto flex-1 min-w-28"
                  placeholder="סיבה אם לא"
                  value={sval(values, k("noReason"))}
                  onChange={(e) => set(k("noReason"), e.target.value)}
                />
              )}
            </div>
          </Panel>
        );
      })}

      {/* בר הסיכום */}
      <Panel hero variants={child} className="px-6 py-4 flex items-center gap-8 flex-wrap">
        <PanelTitle icon={<Zap className="size-3.5" strokeWidth={1.75} />}>סיכום</PanelTitle>
        <span className="text-[13px]" style={{ color: "var(--cmd-tx2)" }}>
          סה&quot;כ מאושר
          <b className="ms-2 text-[18px] tabular-nums font-extrabold" style={{ color: "var(--cmd-lime)" }}>
            <CountUp value={totalApproved} format={(n) => (n ? formatCurrency(n) : "0 ₪")} />
          </b>
        </span>
        <span className="text-[13px]" style={{ color: "var(--cmd-tx2)" }}>
          מאושר סופית
          <b
            className={cn("ms-2 text-[17px] tabular-nums font-extrabold rounded-full px-3 py-0.5", totalFinal && "text-[#0A2500]")}
            style={totalFinal
              ? { background: "var(--cmd-lime)", boxShadow: "0 0 18px -2px rgba(80,255,10,.5)" }
              : { color: "var(--cmd-tx)" }}
          >
            <CountUp value={totalFinal} format={(n) => (n ? formatCurrency(n) : "0 ₪")} />
          </b>
        </span>
      </Panel>
    </motion.div>
  );
}
