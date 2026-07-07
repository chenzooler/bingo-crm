"use client";
/**
 * בקרים משותפים למסכי ההגדרות הגנריים (AppSetting):
 * מתג · תג מצב שמירה · hook לשמירת ערך שלם ב-PUT /api/settings/[key].
 */
import * as React from "react";
import { cn } from "@/lib/utils";

/* ---------- מתג הפעלה ---------- */
export function AppToggle({ checked, onChange, disabled }: {
  checked: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      dir="ltr"
      onClick={() => onChange(!checked)}
      className={cn(
        "relative h-6 w-11 shrink-0 rounded-full transition-colors",
        checked ? "bg-bingo-green" : "bg-bingo-gray-200",
        disabled && "opacity-50 cursor-not-allowed",
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 left-0.5 size-5 rounded-full bg-white shadow transition-transform",
          checked && "translate-x-5",
        )}
      />
    </button>
  );
}

/* ---------- תג מצב שמירה — כמו "נשמר ☁️" בכרטיס ---------- */
export type SaveState = "saved" | "saving" | "error";

export function SaveBadge({ state }: { state: SaveState }) {
  return (
    <span
      className={cn(
        "b-chip text-[11px]",
        state === "saved" && "b-chip-green",
        state === "saving" && "b-chip-gray",
        state === "error" && "b-chip-red",
      )}
    >
      {state === "saved" ? "נשמר ☁️" : state === "saving" ? "שומר…" : "שגיאה בשמירה"}
    </span>
  );
}

/* ---------- שמירת ערך שלם למפתח הגדרה ---------- */
export function useAppSettingSaver<T>(key: string, initial: T) {
  const [value, setValue] = React.useState<T>(initial);
  const [state, setState] = React.useState<SaveState>("saved");

  const save = React.useCallback(async (next: T) => {
    setValue(next);
    setState("saving");
    try {
      const res = await fetch(`/api/settings/${key}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(next),
      });
      setState(res.ok ? "saved" : "error");
      return res.ok;
    } catch {
      setState("error");
      return false;
    }
  }, [key]);

  return { value, setValue, save, state };
}

/* ---------- כפתור העתקה קטן ---------- */
export function CopyButton({ text, label = "העתק" }: { text: string; label?: string }) {
  const [copied, setCopied] = React.useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        void navigator.clipboard.writeText(text);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1600);
      }}
      className={cn("b-chip text-[11px] transition", copied ? "b-chip-green" : "b-chip-gray hover:bg-bingo-gray-150")}
    >
      {copied ? "הועתק ✓" : label}
    </button>
  );
}
