"use client";
import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

/** labeled field wrapper; `prefilled` shows the "✓ ממערכת" badge (data came from the DB) */
export function Field({ label, prefilled, hintText, className, children }: {
  label: string;
  prefilled?: boolean;
  hintText?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-center gap-1.5 mb-1.5">
        <label className="block text-[12px] font-semibold text-bingo-gray-600">{label}</label>
        {prefilled && (
          <span className="inline-flex items-center gap-0.5 rounded-full bg-bingo-green-light px-1.5 py-px text-[9.5px] font-bold text-bingo-green-deep">
            <Check className="size-2.5" strokeWidth={3.5} /> ממערכת
          </span>
        )}
      </div>
      {children}
      {hintText && <p className="mt-1 text-[10.5px] text-bingo-gray-400">{hintText}</p>}
    </div>
  );
}
