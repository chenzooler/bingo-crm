"use client";
import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export function Section({
  title,
  emoji,
  defaultOpen = true,
  status = "incomplete",
  children,
}: {
  title: string;
  emoji?: string;
  defaultOpen?: boolean;
  status?: "complete" | "incomplete" | "warning";
  children: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(defaultOpen);
  const dot =
    status === "complete" ? "bg-bingo-green" : status === "warning" ? "bg-status-yellow" : "bg-bingo-gray-300";
  return (
    <div className="border-t-2 border-bingo-gray-100 first:border-t-0">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-3 py-4 group"
      >
        <h3 className="flex items-center gap-2 text-base font-extrabold text-bingo-black">
          <span className={cn("size-2.5 rounded-full ring-4 ring-white transition", dot)} />
          {emoji && <span className="text-lg">{emoji}</span>}
          {title}
        </h3>
        <ChevronDown
          className={cn("size-4 text-bingo-gray-500 transition-transform", open && "rotate-180")}
        />
      </button>
      {open && <div className="pb-5 space-y-4">{children}</div>}
    </div>
  );
}

export function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <label className="block">
      <div className="text-xs font-bold text-bingo-charcoal mb-1.5">{label}</div>
      {children}
      {hint && <div className="text-[11px] text-bingo-gray-500 mt-1">{hint}</div>}
    </label>
  );
}

export function Pills({
  options,
  value,
  onChange,
  multiple,
}: {
  options: { key: string; label: string; emoji?: string }[];
  value: string | string[] | undefined;
  onChange: (v: string | string[]) => void;
  multiple?: boolean;
}) {
  const isActive = (k: string) => (Array.isArray(value) ? value.includes(k) : value === k);
  function toggle(k: string) {
    if (multiple) {
      const arr = Array.isArray(value) ? [...value] : [];
      const idx = arr.indexOf(k);
      if (idx >= 0) arr.splice(idx, 1);
      else arr.push(k);
      onChange(arr);
    } else {
      onChange(k);
    }
  }
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((o) => (
        <button
          key={o.key}
          type="button"
          onClick={() => toggle(o.key)}
          className={cn(
            "px-3 h-8 rounded-full text-xs font-bold border-2 transition",
            isActive(o.key)
              ? "bg-bingo-green border-bingo-green text-bingo-black"
              : "bg-white border-bingo-gray-200 text-bingo-charcoal hover:border-bingo-gray-300"
          )}
        >
          {o.emoji && <span className="ml-1">{o.emoji}</span>}
          {o.label}
        </button>
      ))}
    </div>
  );
}
