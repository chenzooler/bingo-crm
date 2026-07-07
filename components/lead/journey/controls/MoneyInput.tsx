"use client";
import * as React from "react";
import { cn } from "@/lib/utils";

/** ₪ input — formats thousands while typing, keeps digits in state */
export function MoneyInput({ value, onChange, placeholder, big, autoFocus, onCommit }: {
  value: string | undefined;
  onChange: (v: string) => void;
  placeholder?: string;
  big?: boolean;
  autoFocus?: boolean;
  onCommit?: () => void;
}) {
  const display = value ? Number(String(value).replace(/\D/g, "") || 0).toLocaleString("he-IL") : "";
  return (
    <div className="relative">
      <input
        className={cn("b-input pl-9", big && "h-14 text-[22px] font-bold tabular-nums")}
        inputMode="numeric"
        dir="ltr"
        style={{ textAlign: "right" }}
        placeholder={placeholder}
        autoFocus={autoFocus}
        value={display}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, ""))}
        onKeyDown={(e) => {
          if (e.key === "Enter" && onCommit) { e.preventDefault(); onCommit(); }
        }}
      />
      <span className={cn(
        "absolute left-3 top-1/2 -translate-y-1/2 font-bold text-bingo-gray-400",
        big ? "text-[18px]" : "text-[13px]",
      )}>₪</span>
    </div>
  );
}
