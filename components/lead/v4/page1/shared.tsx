"use client";
/**
 * עמוד 1 — כלים משותפים: עזרי ערכים, כרטיס-שלב מתקפל, גלולות בחירה,
 * צ'יפים מרובים, קלט כסף, ותג לוגו עם נפילה לאותיות.
 */
import * as React from "react";
import type { ClassicValues } from "@/lib/yoatsim/values";
import type { RamzorValue } from "@/components/ui/Ramzor";
import { ChevronDown, Check } from "lucide-react";

/* ---------- עזרי ערכים ---------- */

export const str = (v: ClassicValues[string] | unknown): string =>
  typeof v === "string" ? v : "";

export const arr = (v: ClassicValues[string] | unknown): string[] =>
  Array.isArray(v) ? (v as string[]) : [];

/** yellow ב-DB ↔ orange ברכיב הרמזור (אוצר traffic) */
export function toRamzor(v: ClassicValues[string]): RamzorValue | null {
  if (v === "green") return "green";
  if (v === "yellow" || v === "orange") return "orange";
  if (v === "red") return "red";
  return null;
}
export function ramzorToDb(v: RamzorValue): string {
  return v === "orange" ? "yellow" : v;
}

export function fmtMoney(raw: string): string {
  const digits = raw.replace(/[^\d]/g, "");
  if (!digits) return "";
  return Number(digits).toLocaleString("he-IL");
}

export function normalizePhoneIL(phone: string | null): string | null {
  if (!phone) return null;
  const digits = phone.replace(/[^\d]/g, "");
  if (!digits) return null;
  if (digits.startsWith("972")) return digits;
  if (digits.startsWith("0")) return `972${digits.slice(1)}`;
  return digits;
}

/* ---------- תווית שדה ---------- */

export function Field({ label, children, className }: {
  label: string; children: React.ReactNode; className?: string;
}) {
  return (
    <label className={`block ${className ?? ""}`}>
      <span className="block text-[13px] font-semibold text-bingo-gray-600 mb-2">{label}</span>
      {children}
    </label>
  );
}

/* ---------- כרטיס שלב: נעול / פתוח / הושלם-מכווץ ---------- */

export interface StepCardProps {
  id: string;
  index: number;
  title: string;
  done: boolean;
  /** שורת הסיכום כשהשלב מכווץ */
  summary?: React.ReactNode;
  /** פתיחה מחדש ידנית של שלב שהושלם */
  forcedOpen: boolean;
  onToggle: (id: string) => void;
  children: React.ReactNode;
}

export function StepCard({ id, index, title, done, summary, forcedOpen, onToggle, children }: StepCardProps) {
  const collapsed = done && !forcedOpen;
  return (
    <section id={`v4p1-step-${id}`} className="b-card v4p1-enter overflow-hidden" aria-label={title}>
      {collapsed ? (
        <button
          type="button"
          onClick={() => onToggle(id)}
          className="w-full flex items-center gap-3 px-6 py-4 text-start min-h-[44px] hover:bg-bingo-gray-50 transition-colors"
        >
          <span className="w-6 h-6 rounded-full bg-bingo-green-light text-bingo-green-deep flex items-center justify-center shrink-0">
            <Check size={14} strokeWidth={2.25} />
          </span>
          <span className="text-[14px] font-semibold text-bingo-black shrink-0">{title}</span>
          <span className="text-[13px] text-bingo-gray-500 truncate flex-1 min-w-0">{summary}</span>
          <ChevronDown size={16} className="text-bingo-gray-400 shrink-0" strokeWidth={1.75} />
        </button>
      ) : (
        <div className="p-6">
          <header className="flex items-center gap-3 mb-5">
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[12px] font-bold shrink-0 tabular-nums ${
              done ? "bg-bingo-green-light text-bingo-green-deep" : "bg-bingo-gray-100 text-bingo-gray-600"
            }`}>
              {done ? <Check size={14} strokeWidth={2.25} /> : index}
            </span>
            <h3 className="text-[16px] font-bold text-bingo-black flex-1">{title}</h3>
            {done && (
              <button
                type="button"
                onClick={() => onToggle(id)}
                className="text-[12px] text-bingo-gray-500 hover:text-bingo-black px-3 py-2 min-h-[44px] flex items-center"
              >
                כווץ
              </button>
            )}
          </header>
          {children}
        </div>
      )}
    </section>
  );
}

/* ---------- גלולות בחירה יחידה ---------- */

export interface PillOption {
  label: string;
  /** הערך שנשמר (ברירת מחדל: label) */
  store?: string;
}

export function ChoicePills({ options, value, onChange, badStores }: {
  options: (string | PillOption)[];
  value: string;
  onChange: (stored: string) => void;
  /** ערכים שנחשבים שליליים — צביעה אדומה רכה כשנבחרו */
  badStores?: string[];
}) {
  return (
    <div className="flex flex-wrap gap-2" role="radiogroup">
      {options.map((o) => {
        const opt = typeof o === "string" ? { label: o, store: o } : { store: o.label, ...o };
        const selected = value === opt.store && value !== "";
        const bad = badStores?.includes(opt.store!) ?? false;
        return (
          <button
            key={opt.label}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(opt.store!)}
            className={`min-h-[44px] px-5 rounded-full text-[14px] font-semibold border transition-colors ${
              selected
                ? bad
                  ? "bg-status-red-soft border-status-red text-status-red"
                  : "bg-bingo-black border-bingo-black text-white"
                : "bg-white border-bingo-gray-200 text-bingo-gray-700 hover:border-bingo-gray-400"
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

/* ---------- צ'יפים מרובי בחירה ---------- */

export function MultiChips({ options, values, onChange, exclusive }: {
  options: (string | PillOption)[];
  values: string[];
  onChange: (next: string[]) => void;
  /** ערכים שמאפסים את כל השאר (למשל "אין כרטיס בכלל") */
  exclusive?: string[];
}) {
  const toggle = (stored: string) => {
    if (values.includes(stored)) {
      onChange(values.filter((v) => v !== stored));
      return;
    }
    if (exclusive?.includes(stored)) {
      onChange([stored]);
      return;
    }
    onChange([...values.filter((v) => !exclusive?.includes(v)), stored]);
  };
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => {
        const opt = typeof o === "string" ? { label: o, store: o } : { store: o.label, ...o };
        const selected = values.includes(opt.store!);
        return (
          <button
            key={opt.label}
            type="button"
            aria-pressed={selected}
            onClick={() => toggle(opt.store!)}
            className={`min-h-[44px] px-4 rounded-full text-[14px] font-semibold border transition-colors ${
              selected
                ? "bg-bingo-green-light border-bingo-green-dark text-bingo-green-deep"
                : "bg-white border-bingo-gray-200 text-bingo-gray-700 hover:border-bingo-gray-400"
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

/* ---------- קלט כסף ---------- */

export function MoneyInput({ value, onChange, placeholder, id }: {
  value: string;
  onChange: (raw: string) => void;
  placeholder?: string;
  id?: string;
}) {
  return (
    <div className="relative">
      <input
        id={id}
        inputMode="numeric"
        dir="ltr"
        className="b-input w-full text-start tabular-nums pe-8"
        value={fmtMoney(value)}
        placeholder={placeholder ?? "0"}
        onChange={(e) => onChange(e.target.value.replace(/[^\d]/g, ""))}
      />
      <span className="absolute top-1/2 -translate-y-1/2 end-4 text-[13px] text-bingo-gray-400 pointer-events-none">₪</span>
    </div>
  );
}

/* ---------- ותג לוגו: תמונה אם יש, אחרת אותיות ---------- */

export function LogoBadge({ src, name, size = 24 }: { src?: string | null; name: string; size?: number }) {
  const [broken, setBroken] = React.useState(false);
  if (src && !broken) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt=""
        width={size}
        height={size}
        onError={() => setBroken(true)}
        className="rounded-full object-contain bg-white border border-bingo-gray-150 shrink-0"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <span
      aria-hidden="true"
      className="rounded-full bg-bingo-gray-100 text-bingo-gray-600 flex items-center justify-center font-bold shrink-0"
      style={{ width: size, height: size, fontSize: Math.max(10, size * 0.42) }}
    >
      {name.trim().charAt(0) || "?"}
    </span>
  );
}
