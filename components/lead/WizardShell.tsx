"use client";
import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  stepKey: string;
  title: string;
  subtitle?: string;
  agentTip?: string;
  children: React.ReactNode;
  onNext?: () => void;
  onBack?: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
}

export function WizardShell({
  stepKey,
  title,
  subtitle,
  agentTip,
  children,
  onNext,
  onBack,
  nextLabel = "המשך",
  nextDisabled,
}: Props) {
  return (
    <div className="relative bg-white rounded-3xl border border-bingo-gray-200 bingo-shadow-sm overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={stepKey}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.25 }}
          className="p-6 sm:p-8"
        >
          <div className="mb-5">
            <h2 className="text-2xl sm:text-[28px] font-black text-bingo-black leading-tight tracking-tight">
              {title}
            </h2>
            {subtitle && (
              <p className="text-bingo-gray-500 mt-1.5 text-[13px] sm:text-sm">{subtitle}</p>
            )}
          </div>

          {agentTip && (
            <div className="mb-5 rounded-2xl bg-gradient-to-bl from-status-blue-soft/80 to-status-blue-soft/40 border border-status-blue/20 p-3 sm:p-3.5 flex items-start gap-2.5">
              <span className="size-7 rounded-xl bg-status-blue text-white inline-flex items-center justify-center shrink-0">
                <Lightbulb className="size-4" />
              </span>
              <div className="text-[12px] sm:text-[13px] text-status-blue leading-relaxed">
                <span className="font-extrabold ml-1">טיפ לנציג:</span>
                {agentTip}
              </div>
            </div>
          )}

          <div className="space-y-4">{children}</div>

          {(onNext || onBack) && (
            <div className="mt-8 flex items-center gap-3 justify-between">
              {onBack && (
                <button
                  type="button"
                  onClick={onBack}
                  className="inline-flex items-center gap-1.5 bg-white border border-bingo-gray-200 hover:border-bingo-gray-300 hover:shadow-sm text-bingo-charcoal font-bold text-sm rounded-full px-4 sm:px-5 py-3 transition flex-shrink-0"
                >
                  <ChevronRight className="size-4" />
                  הקודם
                </button>
              )}
              {onNext && (
                <button
                  type="button"
                  onClick={onNext}
                  disabled={nextDisabled}
                  className={cn(
                    "flex-1 sm:flex-none sm:min-w-[200px] h-12 rounded-full font-extrabold text-base transition inline-flex items-center justify-center gap-2",
                    nextDisabled
                      ? "bg-bingo-gray-200 text-bingo-gray-500 cursor-not-allowed"
                      : "bg-bingo-black hover:bg-bingo-charcoal text-white bingo-shadow-lg"
                  )}
                >
                  <span>{nextLabel}</span>
                  <ChevronLeft className="size-5" />
                </button>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/** Big card option button - matches landing page styling */
export function OptionCard({
  selected,
  onClick,
  icon,
  label,
  sub,
  className,
}: {
  selected?: boolean;
  onClick?: () => void;
  icon?: React.ReactNode;
  label: string;
  sub?: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative flex flex-col items-center justify-center text-center gap-2 p-3 sm:p-4 rounded-2xl border-2 transition-all duration-200",
        selected
          ? "border-bingo-green bg-gradient-to-b from-[rgba(80,255,10,0.10)] to-[rgba(80,255,10,0.02)] shadow-[0_8px_24px_-10px_rgba(80,255,10,0.45)] -translate-y-0.5"
          : "border-bingo-gray-200 bg-white hover:border-bingo-green/60 hover:-translate-y-0.5",
        className
      )}
    >
      {icon && <div className={selected ? "scale-105 transition" : "transition"}>{icon}</div>}
      <div className="font-black text-[13px] sm:text-sm leading-tight text-bingo-black">{label}</div>
      {sub && <div className="text-[11px] text-bingo-gray-500 font-medium">{sub}</div>}
    </button>
  );
}

/** Row option (full-width) - for longer labels */
export function OptionRow({
  selected,
  onClick,
  icon,
  label,
  sub,
}: {
  selected?: boolean;
  onClick?: () => void;
  icon?: React.ReactNode;
  label: string;
  sub?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 p-3 sm:p-3.5 rounded-2xl border-2 transition-all duration-200 text-right",
        selected
          ? "border-bingo-green bg-gradient-to-b from-[rgba(80,255,10,0.10)] to-[rgba(80,255,10,0.02)] shadow-[0_8px_24px_-10px_rgba(80,255,10,0.45)]"
          : "border-bingo-gray-200 bg-white hover:border-bingo-green/60"
      )}
    >
      {icon && <div className="shrink-0">{icon}</div>}
      <div className="flex-1 min-w-0">
        <div className="font-black text-[14px] text-bingo-black leading-tight">{label}</div>
        {sub && <div className="text-[12px] text-bingo-gray-500 mt-0.5">{sub}</div>}
      </div>
      <span
        className={cn(
          "size-5 rounded-full border-2 flex items-center justify-center shrink-0",
          selected ? "border-bingo-green-dark bg-bingo-green" : "border-bingo-gray-300"
        )}
      >
        {selected && (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="size-3 text-bingo-black">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        )}
      </span>
    </button>
  );
}

/** Premium input field with floating label */
export function PremiumField({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <div className="text-[13px] font-bold text-bingo-charcoal mb-2">{label}</div>
      {children}
      {error && <div className="text-[11px] font-bold text-status-red mt-1.5">{error}</div>}
      {!error && hint && <div className="text-[11px] text-bingo-gray-500 mt-1.5">{hint}</div>}
    </label>
  );
}

/** Yes/No/OK button row */
export function YesNoOk({
  value,
  onChange,
  critical,
}: {
  value?: boolean | null;
  onChange: (v: boolean | null) => void;
  critical?: boolean;
}) {
  return (
    <div className="grid grid-cols-3 gap-2">
      <BigPill active={value === false} onClick={() => onChange(false)} label="לא" tone="green" />
      <BigPill active={value === true} onClick={() => onChange(true)} label="כן" tone={critical ? "red" : "yellow"} />
      <BigPill active={value === null} onClick={() => onChange(null)} label="הכל תקין" tone="info" />
    </div>
  );
}

function BigPill({
  active,
  onClick,
  label,
  tone,
}: {
  active?: boolean;
  onClick: () => void;
  label: string;
  tone: "green" | "yellow" | "red" | "info";
}) {
  const palette = {
    green: active
      ? "border-bingo-green bg-gradient-to-b from-[rgba(80,255,10,0.18)] to-[rgba(80,255,10,0.04)] text-bingo-black shadow-[0_6px_18px_-8px_rgba(80,255,10,0.5)]"
      : "border-bingo-gray-200 bg-white hover:border-bingo-green/60",
    yellow: active
      ? "border-status-yellow bg-gradient-to-b from-amber-100 to-amber-50 text-amber-900 shadow-[0_6px_18px_-8px_rgba(250,204,21,0.5)]"
      : "border-bingo-gray-200 bg-white hover:border-status-yellow/60",
    red: active
      ? "border-status-red bg-gradient-to-b from-red-100 to-red-50 text-red-700 shadow-[0_6px_18px_-8px_rgba(239,68,68,0.5)]"
      : "border-bingo-gray-200 bg-white hover:border-status-red/60",
    info: active
      ? "border-status-blue bg-gradient-to-b from-blue-100 to-blue-50 text-status-blue shadow-[0_6px_18px_-8px_rgba(45,123,247,0.5)]"
      : "border-bingo-gray-200 bg-white hover:border-status-blue/60",
  } as const;
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "h-12 rounded-2xl font-extrabold text-sm border-2 transition-all duration-150 hover:-translate-y-0.5",
        palette[tone]
      )}
    >
      {label}
    </button>
  );
}
