"use client";
/**
 * FieldRenderer — מרנדר שדה לפי הסכמה, בדיוק כמו ההתנהגות ב-Yoatsim:
 * dropdowns, כפתורי בחירה (יחיד/מרובה), רמזורים, צ'קבוקס — בעיצוב בינגו.
 */
import * as React from "react";
import type { FieldDef } from "@/lib/yoatsim/card-schema";
import type { ClassicValues } from "@/lib/yoatsim/values";
import { cn } from "@/lib/utils";

const TRAFFIC = [
  { v: "green", dot: "bg-bingo-green", label: "ירוק" },
  { v: "yellow", dot: "bg-status-yellow", label: "כתום" },
  { v: "red", dot: "bg-status-red", label: "אדום" },
] as const;

export function fieldVisible(f: FieldDef, values: ClassicValues): boolean {
  if (!f.showIf) return true;
  const v = values[f.showIf.key];
  if (f.showIf.equals !== undefined) return v === f.showIf.equals;
  if (f.showIf.oneOf) return typeof v === "string" && f.showIf.oneOf.includes(v);
  return true;
}

export function FieldRenderer({ field, values, set }: {
  field: FieldDef;
  values: ClassicValues;
  set: (key: string, value: ClassicValues[string]) => void;
}) {
  const v = values[field.key];

  switch (field.type) {
    case "readonly":
      return (
        <div className="rounded-xl bg-bingo-gray-50 border border-bingo-gray-100 px-3 py-2.5 text-[13px] text-bingo-gray-600 leading-relaxed">
          {field.note}
        </div>
      );

    case "textarea":
      return (
        <textarea
          className="b-input min-h-[72px] py-2.5 text-[13px] leading-relaxed resize-y"
          placeholder={field.placeholder}
          value={(v as string) || ""}
          onChange={(e) => set(field.key, e.target.value)}
        />
      );

    case "money":
      return (
        <div className="relative">
          <input
            className="b-input h-10 text-[13.5px] pl-8 tabular-nums"
            inputMode="numeric" dir="ltr" style={{ textAlign: "right" }}
            placeholder={field.placeholder}
            value={v ? Number(String(v).replace(/\D/g, "") || 0).toLocaleString("he-IL") : ""}
            onChange={(e) => set(field.key, e.target.value.replace(/\D/g, ""))}
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[12px] font-bold text-bingo-gray-400">₪</span>
        </div>
      );

    case "number":
      return (
        <input
          className="b-input h-10 text-[13.5px] tabular-nums"
          inputMode="decimal"
          placeholder={field.placeholder}
          value={(v as string) || ""}
          onChange={(e) => set(field.key, e.target.value)}
        />
      );

    case "date":
      return (
        <input
          className="b-input h-10 text-[13.5px]"
          type="date"
          value={(v as string) || ""}
          onChange={(e) => set(field.key, e.target.value)}
        />
      );

    case "select":
      return (
        <select
          className="b-input h-10 text-[13.5px] cursor-pointer"
          value={(v as string) || ""}
          onChange={(e) => set(field.key, e.target.value || undefined)}
        >
          <option value="">— בחר —</option>
          {field.options!.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      );

    case "buttons":
      return (
        <div className="flex flex-wrap gap-1.5">
          {field.options!.map((o) => (
            <button key={o} type="button" onClick={() => set(field.key, v === o ? undefined : o)}
              className={cn("b-chip transition text-[12.5px]",
                v === o ? "b-chip-dark" : "b-chip-gray hover:bg-bingo-gray-150")}>
              {o}
            </button>
          ))}
        </div>
      );

    case "multi-buttons": {
      const arr = Array.isArray(v) ? (v as string[]) : [];
      return (
        <div className="flex flex-wrap gap-1.5">
          {field.options!.map((o) => {
            const on = arr.includes(o);
            return (
              <button key={o} type="button"
                onClick={() => set(field.key, on ? arr.filter((x) => x !== o) : [...arr, o])}
                className={cn("b-chip transition text-[12.5px]",
                  on ? "b-chip-green font-bold" : "b-chip-gray hover:bg-bingo-gray-150")}>
                {on && "✓ "}{o}
              </button>
            );
          })}
        </div>
      );
    }

    case "checkbox":
      return (
        <label className="flex items-center gap-2 cursor-pointer select-none h-10">
          <input type="checkbox" className="size-4.5 accent-[#292929]"
            checked={!!v} onChange={(e) => set(field.key, e.target.checked)} />
          <span className="text-[13px] text-bingo-gray-600">{field.note || field.label}</span>
        </label>
      );

    case "traffic":
      return (
        <div className="flex items-center gap-2 h-10">
          {TRAFFIC.map((t) => (
            <button key={t.v} type="button" title={t.label}
              onClick={() => set(field.key, v === t.v ? undefined : t.v)}
              className={cn("size-7 rounded-full border-2 transition-all flex items-center justify-center",
                v === t.v ? "border-bingo-black scale-110" : "border-bingo-gray-150 hover:border-bingo-gray-300")}>
              <span className={cn("size-4 rounded-full", t.dot, v === t.v ? "opacity-100" : "opacity-30")} />
            </button>
          ))}
          {field.key === "bdiClientApproval" && (
            <button type="button" onClick={() => set(field.key, "green")}
              className={cn("mr-1 size-8 rounded-lg flex items-center justify-center text-white font-bold transition",
                v === "green" ? "bg-bingo-green-dark" : "bg-bingo-gray-200 hover:bg-bingo-green-dark")}>
              ✔
            </button>
          )}
        </div>
      );

    default:
      return (
        <input
          className="b-input h-10 text-[13.5px]"
          placeholder={field.placeholder}
          value={(v as string) || ""}
          onChange={(e) => set(field.key, e.target.value)}
        />
      );
  }
}
