"use client";
/**
 * מרכז השליטה — עזרים משותפים.
 * Panel = אריח בנטו עם זרקור-עכבר (בסגנון Aceternity card-spotlight, CSS בלבד),
 * PanelTitle, שדות כהים, ועזרי קריאת ערכים מ-ClassicValues.
 */
import * as React from "react";
import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import { cn } from "@/lib/utils";
import type { ClassicValues } from "@/lib/yoatsim/values";

/* ---------- קריאת ערכים ---------- */
export const sval = (values: ClassicValues, key: string): string => {
  const v = values[key];
  return typeof v === "string" ? v : "";
};
export const nval = (values: ClassicValues, key: string): number => {
  const n = Number(sval(values, key).replace(/[^\d.]/g, ""));
  return Number.isFinite(n) ? n : 0;
};

/* ---------- אריח בנטו ---------- */
export function Panel({ hero, className, children, variants }: {
  hero?: boolean;
  className?: string;
  children: React.ReactNode;
  variants?: Variants;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const onMove = React.useCallback((e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - r.left}px`);
    el.style.setProperty("--my", `${e.clientY - r.top}px`);
  }, []);
  return (
    <motion.div
      ref={ref}
      variants={variants}
      onMouseMove={onMove}
      className={cn("cmd-panel p-4", hero && "cmd-panel--hero", className)}
    >
      {children}
    </motion.div>
  );
}

export function PanelTitle({ icon, children, trailing }: {
  icon: React.ReactNode;
  children: React.ReactNode;
  trailing?: React.ReactNode;
}) {
  return (
    <h3 className="cmd-h mb-3">
      <span className="ico" aria-hidden>{icon}</span>
      <span>{children}</span>
      {trailing && <span className="ms-auto font-normal normal-case">{trailing}</span>}
    </h3>
  );
}

/* ---------- שורת שדה בדיוקן ---------- */
export function PortraitRow({ icon, label, value, hot }: {
  icon: React.ReactNode;
  label: string;
  value: string | null;
  hot?: boolean;
}) {
  return (
    <div className="flex items-center gap-2.5 py-2 border-b last:border-b-0" style={{ borderColor: "var(--cmd-line)" }}>
      <span
        className="w-8 h-8 rounded-[9px] grid place-items-center flex-none"
        style={{ background: hot ? "var(--cmd-mint)" : "var(--cmd-panel2)", color: hot ? "var(--cmd-lime)" : "var(--cmd-tx2)" }}
        aria-hidden
      >
        {icon}
      </span>
      <div className="min-w-0">
        <div className="text-[10.5px]" style={{ color: "var(--cmd-tx3)" }}>{label}</div>
        <div
          className={cn("text-[13px] truncate", value ? "font-bold" : "font-normal")}
          style={{ color: value ? "var(--cmd-tx)" : "var(--cmd-tx3)" }}
        >
          {value ?? "טרם נשאל"}
        </div>
      </div>
    </div>
  );
}

/* ---------- גלולת פעולה בכותרת ---------- */
export function ActionPill({ onClick, disabled, lime, danger, title, children }: {
  onClick: () => void;
  disabled?: boolean;
  lime?: boolean;
  danger?: boolean;
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-4 min-h-11 text-[13px] font-bold cursor-pointer",
        "transition-[transform,background,border-color] duration-150 hover:-translate-y-0.5 active:scale-[.97]",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#50FF0A]",
        "disabled:opacity-50 disabled:pointer-events-none",
        danger
          ? "bg-[#FF5D5D]/15 text-[#FF7A7A] border border-[#FF5D5D]/40"
          : lime
            ? "bg-[#50FF0A] text-[#0A2500] border border-transparent"
            : "text-[var(--cmd-tx)] bg-white/[.06] border border-white/[.12] hover:bg-white/[.12]",
      )}
      style={lime && !danger ? { boxShadow: "0 4px 24px -6px rgba(80,255,10,.5)" } : undefined}
    >
      {children}
    </button>
  );
}
