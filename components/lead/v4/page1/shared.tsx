"use client";
/**
 * עמוד 1 — כלים משותפים: עזרי ערכים, כרטיס-שלב מתקפל, גלולות בחירה,
 * צ'יפים מרובים, קלט כסף, ותג לוגו עם נפילה לאותיות.
 */
import * as React from "react";
import type { ClassicValues } from "@/lib/yoatsim/values";
import type { RamzorValue } from "@/components/ui/Ramzor";
import { ChevronDown } from "lucide-react";
import { DrawnCheck, Icon3D } from "./ep";

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
  /** צביעת צ'יפ הסיכום לפי תוצאה (שלילי/חיובי) במקום גוון החדר */
  summaryTone?: "good" | "bad";
  /** פתיחה מחדש ידנית של שלב שהושלם */
  forcedOpen: boolean;
  onToggle: (id: string) => void;
  children: React.ReactNode;
  /** זהות צבע החדר — ep-step-* */
  tone: string;
  /** שם אייקון תלת-ממד מ-public/icons3d */
  icon: string;
  /** השלב שבאור הזרקורים — קרן גבול אחת במסך */
  active: boolean;
  /** קליק על שלב מעומעם מחזיר אליו את הפוקוס */
  onFocus: (id: string) => void;
}

export function StepCard({
  id, index, title, done, summary, summaryTone, forcedOpen, onToggle, children,
  tone, icon, active, onFocus,
}: StepCardProps) {
  /* כל עוד הפוקוס בתוך הכרטיס — לא מתכווצים אוטומטית (הקלדה באמצע שדה) */
  const [holdsFocus, setHoldsFocus] = React.useState(false);
  const collapsed = done && !holdsFocus && !forcedOpen;

  if (collapsed) {
    /* שלב שהושלם — שורת זכוכית דקה עם וי מצויר וצ'יפ סיכום בגוון החדר */
    return (
      <section id={`v4p1-step-${id}`} className={`${tone} v4p1-enter ${active ? "" : "v4p1-dim"}`} aria-label={title}>
        <button
          type="button"
          onClick={() => { onToggle(id); onFocus(id); }}
          className="ep-glass w-full flex items-center gap-3 px-5 py-3 text-start min-h-[52px] transition-colors hover:bg-white/80"
        >
          <Icon3D name={icon} size={28} radius={9} />
          <span
            className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
            style={{ background: "var(--step-tint)", color: "var(--step-deep)" }}
          >
            <DrawnCheck size={12} strokeWidth={3.5} />
          </span>
          <span className="text-[14px] font-semibold shrink-0" style={{ color: "var(--step-deep)" }}>{title}</span>
          {summary ? (
            <span
              className={`text-[12px] font-semibold px-3 py-1 rounded-full truncate min-w-0 ${
                summaryTone === "bad"
                  ? "bg-status-red-soft text-status-red"
                  : summaryTone === "good"
                    ? "bg-bingo-green-light text-bingo-green-deep"
                    : ""
              }`}
              style={summaryTone ? undefined : { background: "var(--step-tint)", color: "var(--step-deep)" }}
            >
              {summary}
            </span>
          ) : null}
          <span className="flex-1" />
          <ChevronDown size={16} className="text-bingo-gray-400 shrink-0" strokeWidth={1.75} />
        </button>
      </section>
    );
  }

  return (
    <section
      id={`v4p1-step-${id}`}
      className={`${tone} v4p1-enter ${active ? "" : "v4p1-dim"}`}
      aria-label={title}
      onClick={active ? undefined : () => onFocus(id)}
      onFocusCapture={() => setHoldsFocus(true)}
      onBlurCapture={(e) => {
        /* מתנקה רק כשהפוקוס באמת עזב את הכרטיס */
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setHoldsFocus(false);
      }}
    >
      <div className={`ep-glass epv5-room relative p-6 ${active ? "ep-glass-active ep-beam" : ""}`}>
        {/* פס הזהות של החדר — קצה פנימי בצד הפתיחה, רק בשלב הפעיל */}
        {active && (
          <span
            aria-hidden="true"
            className="absolute"
            style={{
              insetInlineStart: 0, top: 16, bottom: 16, width: 2,
              background: "var(--step-dot)", borderRadius: 2,
            }}
          />
        )}
        <header className="flex items-center gap-3 mb-5">
          <Icon3D name={icon} size={48} />
          <h3 className="text-[18px] font-semibold flex-1" style={{ color: "var(--step-deep)" }}>{title}</h3>
          <span
            className="rounded-full px-3 py-1 text-[12px] font-bold tabular-nums shrink-0"
            style={{ background: "var(--step-tint)", color: "var(--step-deep)" }}
          >
            שלב {index}
          </span>
          {done && (
            <button
              type="button"
              onClick={() => { setHoldsFocus(false); onToggle(id); }}
              className="text-[12px] text-bingo-gray-500 hover:text-bingo-black px-3 py-2 min-h-[44px] flex items-center"
            >
              כווץ
            </button>
          )}
        </header>
        {children}
      </div>
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
    <div className="relative" dir="ltr">
      <input
        id={id}
        inputMode="numeric"
        dir="ltr"
        className="b-input ep-input w-full text-start tabular-nums pe-8"
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
