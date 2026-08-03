"use client";
/**
 * עמוד 2 — בדיקות זכאות בשפת "נייר חשמלי". כרטיס זכוכית לכל גוף מימון עם
 * כניסה מדורגת, קצה מנטה שקט לגוף מאושר, ורצועת סיכום כאי אובסידיאן.
 * אותם מפתחות נתונים כמו ה-LendersSection הקלאסי (lender_<key>_<field>).
 */
import * as React from "react";
import { motion } from "framer-motion";
import { CARD_LENDERS, LENDER_RESULT_Y, INTERESTED_Y, JERUSALEM_STAGE_Y } from "@/lib/yoatsim/card-schema";
import OrgLogo from "@/components/ui/OrgLogo";
import { cn, formatCurrency } from "@/lib/utils";
import type { CardV4PageProps } from "./types";
import { CountUp, Icon3D, SectionHeader, useEpEntrance } from "./ep";

function lval(values: Record<string, unknown>, lender: string, field: string): string {
  const v = values[`lender_${lender}_${field}`];
  return typeof v === "string" ? v : "";
}

function num(s: string): number {
  const n = Number(s.replace(/\D/g, ""));
  return Number.isFinite(n) ? n : 0;
}

/** לוגו לפי מפתח הגוף — phoenix הוא svg, לשאר png */
function logoSrc(key: string): string {
  return `/logos/lenders/${key}.${key === "phoenix" ? "svg" : "png"}`;
}

export function Page2Checks({ state }: CardV4PageProps) {
  const { values, set } = state;
  const { reduced, parent, child } = useEpEntrance();

  const anyChecked = CARD_LENDERS.some((l) => lval(values, l.key, "result") !== "");
  const totalApproved = CARD_LENDERS.reduce((sum, l) =>
    lval(values, l.key, "result") === "יש אישור" ? sum + num(lval(values, l.key, "amount")) : sum, 0);
  const totalFinal = CARD_LENDERS.reduce((sum, l) => sum + num(lval(values, l.key, "proceedAmount")), 0);

  return (
    <motion.div className="space-y-3" variants={parent} initial="hidden" animate="show">
      {/* כותרת הסקשן */}
      <motion.div variants={child}>
        <SectionHeader icon="bank" title="בדיקות זכאות" />
      </motion.div>

      {/* מצב ריק — עוד לא נבדק אף גוף */}
      {!anyChecked && (
        <motion.div variants={child} className="ep-glass px-6 py-5 flex items-center gap-4">
          <Icon3D name="search-doc" size={44} />
          <div>
            <p className="text-[14px] font-bold text-bingo-black">עוד לא נערכו בדיקות זכאות</p>
            <p className="text-[12.5px] text-bingo-gray-500">בחר תוצאת בדיקה בכל גוף מימון ברשימה למטה - הסיכום יתעדכן אוטומטית</p>
          </div>
        </motion.div>
      )}

      {CARD_LENDERS.map((l) => {
        const result = lval(values, l.key, "result");
        const approved = result === "יש אישור";
        const approvedAmount = approved ? num(lval(values, l.key, "amount")) : 0;
        const k = (f: string) => `lender_${l.key}_${f}`;
        return (
          <motion.div
            key={l.key}
            variants={child}
            whileHover={reduced ? undefined : { y: -3 }}
            className="ep-glass p-4"
          >
            {/* קצה מנטה שקט — רק כשהגוף אישר סכום */}
            {approved && approvedAmount > 0 && (
              <span
                aria-hidden
                className="absolute inset-y-3 start-0 w-[2px] rounded-full"
                style={{ background: "rgba(80,255,10,.4)" }}
              />
            )}
            {/* שורת הכותרת: לוגו + שם + תוצאה */}
            <div className="flex items-center gap-3 mb-3 flex-wrap">
              <OrgLogo src={logoSrc(l.key)} name={l.name} size={36} />
              <span className="text-[14.5px] font-bold text-bingo-black min-w-28">{l.name}</span>
              {approved && approvedAmount > 0 && (
                <b className="text-[13.5px] tabular-nums" style={{ color: "#2e7a12" }}>
                  <CountUp value={approvedAmount} format={(n) => formatCurrency(n)} />
                </b>
              )}
              <span className="flex-1" />
              <select className="b-input ep-input h-11 text-[13px] w-44 cursor-pointer"
                aria-label={`תוצאת בדיקה - ${l.name}`}
                value={result} onChange={(e) => set(k("result"), e.target.value || undefined)}>
                <option value="">תוצאת בדיקה</option>
                {LENDER_RESULT_Y.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
              {l.key === "jerusalem" && (
                <select className="b-input ep-input h-11 text-[13px] w-36 cursor-pointer"
                  aria-label="שלב בבנק ירושלים"
                  value={lval(values, l.key, "stage")} onChange={(e) => set(k("stage"), e.target.value || undefined)}>
                  <option value="">שלב</option>
                  {JERUSALEM_STAGE_Y.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              )}
              <input className="b-input ep-input h-11 text-[13px] flex-1 min-w-32" placeholder="סיבה"
                value={lval(values, l.key, "reason")} onChange={(e) => set(k("reason"), e.target.value)} />
            </div>

            {/* נתוני האישור — תוויות קבועות מעל השדות, לא placeholder שנעלם */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
              {([["amount", "סכום מאושר ₪"], ["payments", "תשלומים מקס'"], ["interest", "ריבית %"], ["monthly", "החזר חודשי ₪"]] as const).map(([f, label]) => (
                <label key={f} className="block">
                  <span className="block text-[11px] font-semibold text-bingo-gray-500 mb-0.5">{label}</span>
                  <input className="b-input ep-input h-11 text-[13px] tabular-nums w-full" inputMode="decimal"
                    value={lval(values, l.key, f)} onChange={(e) => set(k(f), e.target.value)} />
                </label>
              ))}
            </div>

            {/* מעוניין להתקדם */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[12.5px] font-semibold text-bingo-gray-500">מעוניין להתקדם?</span>
              {INTERESTED_Y.map((o) => (
                <button key={o} type="button"
                  onClick={() => set(k("interested"), lval(values, l.key, "interested") === o ? undefined : o)}
                  className={cn(
                    "rounded-full px-4 h-9 text-[12px] font-semibold transition-colors duration-120",
                    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bingo-black",
                    lval(values, l.key, "interested") === o
                      ? "bg-bingo-black text-white"
                      : "bg-bingo-gray-100 text-bingo-gray-600 hover:bg-bingo-gray-150 active:bg-bingo-gray-200",
                  )}>
                  {o}
                </button>
              ))}
              <input className="b-input ep-input h-11 text-[13px] w-36 tabular-nums" inputMode="numeric"
                placeholder="סכום שהתקדמו"
                value={lval(values, l.key, "proceedAmount")} onChange={(e) => set(k("proceedAmount"), e.target.value)} />
              {lval(values, l.key, "interested") === "לא" && (
                <input className="b-input ep-input h-11 text-[13px] flex-1 min-w-28" placeholder="סיבה אם לא"
                  value={lval(values, l.key, "noReason")} onChange={(e) => set(k("noReason"), e.target.value)} />
              )}
            </div>
          </motion.div>
        );
      })}

      {/* בר הסיכום — אי אובסידיאן קטן, הליים זוהר רק כאן */}
      <motion.div variants={child} className="ep-island px-6 py-4 flex items-center gap-8 flex-wrap">
        <span className="text-[13px] text-[#9C9C98]">
          סה&quot;כ מאושר
          <b className="ms-2 text-[18px] tabular-nums text-[#50FF0A] ep-neon">
            <CountUp value={totalApproved} format={(n) => (n ? formatCurrency(n) : "0 ₪")} />
          </b>
        </span>
        <span className="text-[13px] text-[#9C9C98]">
          מאושר סופית
          <b className={cn(
            "ms-2 text-[17px] tabular-nums rounded-full px-3 py-0.5",
            totalFinal ? "bg-[#50FF0A] text-bingo-black" : "text-[#FAFAF9]",
          )}
            style={totalFinal ? { boxShadow: "0 0 18px -2px rgba(80,255,10,.5)" } : undefined}>
            <CountUp value={totalFinal} format={(n) => (n ? formatCurrency(n) : "0 ₪")} />
          </b>
        </span>
      </motion.div>
    </motion.div>
  );
}
