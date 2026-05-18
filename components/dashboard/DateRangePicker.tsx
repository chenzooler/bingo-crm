"use client";
import * as React from "react";
import { Calendar, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DateRange } from "@/lib/data/performance";

const PRESETS: { value: DateRange; label: string }[] = [
  { value: "today", label: "היום" },
  { value: "yesterday", label: "אתמול" },
  { value: "7d", label: "7 ימים" },
  { value: "30d", label: "30 ימים" },
  { value: "month", label: "החודש" },
];

export function DateRangePicker({ value, onChange }: { value: DateRange; onChange: (v: DateRange) => void }) {
  return (
    <div className="inline-flex items-center gap-1 bg-white rounded-2xl border border-bingo-gray-200 p-1 bingo-shadow-sm">
      <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-bingo-gray-500 pr-3 pl-1">
        <Calendar className="size-3.5" />
        טווח
      </span>
      {PRESETS.map((p) => (
        <button
          key={p.value}
          onClick={() => onChange(p.value)}
          className={cn(
            "h-8 px-3 rounded-xl text-[12px] font-bold transition",
            value === p.value
              ? "bg-bingo-black text-white"
              : "text-bingo-charcoal hover:bg-bingo-gray-100"
          )}
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}
