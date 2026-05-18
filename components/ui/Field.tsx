"use client";
import * as React from "react";
import { cn } from "@/lib/utils";

interface FieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  label?: string;
  hint?: string;
  error?: string;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
}

export const Field = React.forwardRef<HTMLInputElement, FieldProps>(
  ({ label, hint, error, prefix, suffix, className, ...props }, ref) => (
    <label className="block">
      {label && <span className="block text-[13px] font-bold text-bingo-charcoal mb-2">{label}</span>}
      <div className="relative">
        {prefix && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-bingo-gray-400">{prefix}</span>}
        <input
          ref={ref}
          {...props}
          className={cn(
            "h-12 w-full rounded-2xl bg-white border-2 text-base font-bold text-bingo-black placeholder:text-bingo-gray-400 outline-none transition",
            prefix ? "pr-11 pl-4" : "px-4",
            suffix && "pl-11",
            error
              ? "border-status-red focus:ring-4 focus:ring-status-red/15"
              : "border-bingo-gray-200 hover:border-bingo-gray-300 focus:border-bingo-green focus:ring-4 focus:ring-bingo-green/15",
            "disabled:opacity-60 disabled:cursor-not-allowed",
            className
          )}
        />
        {suffix && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-bingo-gray-400 text-sm font-bold">{suffix}</span>}
      </div>
      {error && <div className="text-[11px] font-bold text-status-red mt-1.5">{error}</div>}
      {!error && hint && <div className="text-[11px] text-bingo-gray-500 mt-1.5">{hint}</div>}
    </label>
  )
);
Field.displayName = "Field";
