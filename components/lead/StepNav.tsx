"use client";
import * as React from "react";
import type { Lead } from "@/lib/types";
import { STEPS, evaluateStep, type StepKey } from "@/lib/lead-logic";
import { SectionIcon } from "@/components/icons/ServiceIcons";
import { cn } from "@/lib/utils";

const ICON: Record<StepKey, Parameters<typeof SectionIcon>[0]["kind"]> = {
  intake: "intake",
  "credit-history": "credit",
  personal: "user",
  household: "user",
  income: "income",
  assets: "home",
  vehicle: "car",
  bank: "bank",
  bdi: "pulse",
  lenders: "lenders",
  result: "calc",
  offer: "offer",
  forms: "forms",
};

export function StepNav({
  lead,
  active,
  onChange,
}: {
  lead: Lead;
  active: StepKey;
  onChange: (step: StepKey) => void;
}) {
  const steps = STEPS.filter((s) => !s.visibleWhen || s.visibleWhen(lead));
  const completed = steps.filter((s) => evaluateStep(lead, s.key) === "done").length;
  const progress = (completed / steps.length) * 100;
  const activeIdx = steps.findIndex((s) => s.key === active);
  const scrollerRef = React.useRef<HTMLDivElement>(null);

  return (
    <div className="bg-white rounded-2xl border border-bingo-gray-200 bingo-shadow-sm overflow-hidden">
      <div className="px-4 pt-3 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-bingo-gray-500">תהליך מילוי</span>
          <span className="text-[11px] font-mono tabular-nums font-bold text-bingo-charcoal">
            {completed}/{steps.length}
          </span>
        </div>
        <div className="text-[11px] font-bold text-bingo-green-dark">{Math.round(progress)}% הושלם</div>
      </div>
      <div className="h-1 bg-bingo-gray-100 mx-4 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-l from-bingo-green-dark to-bingo-green transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div ref={scrollerRef} className="overflow-x-auto px-2 py-2 mt-1 flex items-stretch gap-1 scroll-smooth">
        {steps.map((s, i) => {
          const state = evaluateStep(lead, s.key);
          const isActive = s.key === active;
          return (
            <button
              key={s.key}
              onClick={() => onChange(s.key)}
              className={cn(
                "shrink-0 flex items-center gap-2 h-12 px-3 rounded-xl text-right transition relative",
                isActive
                  ? "bg-bingo-black text-white"
                  : state === "done"
                    ? "bg-bingo-green/12 hover:bg-bingo-green/20 text-bingo-charcoal"
                    : "bg-bingo-gray-100/70 hover:bg-bingo-gray-100 text-bingo-charcoal"
              )}
            >
              <span
                className={cn(
                  "size-7 rounded-lg inline-flex items-center justify-center shrink-0 relative",
                  isActive ? "bg-bingo-green text-bingo-black" : state === "done" ? "bg-bingo-green text-bingo-black" : "bg-white text-bingo-gray-500"
                )}
              >
                {state === "done" ? (
                  <Check className="size-4" />
                ) : (
                  <SectionIcon kind={ICON[s.key]} className="size-4" />
                )}
                {state === "partial" && (
                  <span className="absolute -top-0.5 -left-0.5 size-2 rounded-full bg-status-yellow ring-2 ring-white" />
                )}
              </span>
              <span className="hidden md:flex flex-col items-start leading-none">
                <span className="text-[11px] font-mono tabular-nums opacity-60">{i + 1 < 10 ? `0${i + 1}` : i + 1}</span>
                <span className="text-[12px] font-extrabold">{s.label}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Check({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
