"use client";
import * as React from "react";
import { STAGES, CATEGORIES, EXIT_REASONS, COMMON_TAGS } from "@/lib/data/lifecycle";
import { Plus, GripVertical, Pencil, Trash2, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";

export default function LifecycleSettingsPage() {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white rounded-3xl border border-bingo-gray-200 bingo-shadow-sm p-6">
        <div className="text-[10px] font-bold uppercase tracking-wider text-bingo-gray-500">זרימת עבודה</div>
        <h2 className="text-xl font-extrabold text-bingo-black">Lifecycle - שלבי חיי ליד</h2>
        <p className="text-[12px] text-bingo-gray-600 mt-1 leading-relaxed">
          המסלול האחד והיחיד של כל ליד במערכת. במקום 9 תהליכים מקבילים - <strong>10 שלבים ברצף</strong> + סוג הלוואה + תגיות.
          זה מבטל בלגן ומאפשר מדידה ברורה של זמן בכל שלב.
        </p>
      </div>

      {/* Stages - visual funnel */}
      <div className="bg-white rounded-3xl border border-bingo-gray-200 bingo-shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-extrabold text-bingo-black">שלבים (10)</h3>
            <p className="text-[11px] text-bingo-gray-600 mt-0.5">ליד נע בשלבים מ-NEW עד PAID. ב-EXIT הוא נסגר עם סיבה.</p>
          </div>
          <button className="h-8 px-3 rounded-xl bg-bingo-green hover:bg-bingo-green-bright text-bingo-black text-xs font-bold inline-flex items-center gap-1.5">
            <Plus className="size-3.5" /> שלב חדש
          </button>
        </div>

        <div className="space-y-2">
          {STAGES.filter((s) => s.key !== "EXIT").map((s, i) => (
            <div key={s.key} className="group flex items-center gap-3 p-3 rounded-2xl border border-bingo-gray-200 hover:border-bingo-green/40 transition">
              <GripVertical className="size-4 text-bingo-gray-300 cursor-grab shrink-0" />
              <span className="text-[10px] font-mono tabular-nums font-bold text-bingo-gray-400 w-6 text-center shrink-0">
                {String(s.position).padStart(2, "0")}
              </span>
              <span className={cn("size-3 rounded-full shrink-0", stageDot(s.color))} />
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-extrabold text-bingo-black">{s.label}</div>
                <div className="text-[11px] text-bingo-gray-600 mt-0.5">{s.description}</div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[10px] font-mono tabular-nums font-bold text-bingo-gray-500">SLA: {s.slaHours}ש׳</span>
                <button className="size-7 rounded-lg hover:bg-bingo-gray-100 text-bingo-gray-500 inline-flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                  <Pencil className="size-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t border-bingo-gray-100">
          <div className="text-[10px] font-bold uppercase tracking-wider text-bingo-gray-500 mb-2">EXIT (סגירה) - סיבות יציאה</div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {EXIT_REASONS.map((r) => (
              <div key={r.key} className="flex items-center gap-2 p-2 rounded-xl bg-bingo-gray-50 border border-bingo-gray-100">
                <span className={cn("size-2 rounded-full",
                  r.color === "green" ? "bg-bingo-green" :
                  r.color === "red" ? "bg-status-red" :
                  r.color === "yellow" ? "bg-status-yellow" :
                  "bg-bingo-gray-300"
                )} />
                <span className="text-[12px] font-bold text-bingo-charcoal">{r.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="bg-white rounded-3xl border border-bingo-gray-200 bingo-shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-extrabold text-bingo-black">סוגי הלוואה ({CATEGORIES.length})</h3>
            <p className="text-[11px] text-bingo-gray-600 mt-0.5">קטגוריות לסיווג הליד - מקבילות לשלבים</p>
          </div>
          <button className="h-8 px-3 rounded-xl bg-bingo-green hover:bg-bingo-green-bright text-bingo-black text-xs font-bold inline-flex items-center gap-1.5">
            <Plus className="size-3.5" /> סוג הלוואה
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {CATEGORIES.map((c) => (
            <div key={c.key} className="flex items-center gap-3 p-3 rounded-2xl border border-bingo-gray-200 hover:border-bingo-green/40 transition group">
              <div className="size-10 rounded-xl bg-bingo-gray-100 inline-flex items-center justify-center text-xl">
                {c.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-extrabold text-bingo-black">{c.label}</div>
                <div className="text-[11px] text-bingo-gray-600 mt-0.5">{c.description}</div>
              </div>
              <button className="size-7 rounded-lg hover:bg-bingo-gray-100 text-bingo-gray-500 inline-flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                <Pencil className="size-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Tags */}
      <div className="bg-white rounded-3xl border border-bingo-gray-200 bingo-shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-extrabold text-bingo-black">תגיות ({COMMON_TAGS.length})</h3>
            <p className="text-[11px] text-bingo-gray-600 mt-0.5">תכונות שמותחות על לידים בנוסף לשלב והקטגוריה</p>
          </div>
          <button className="h-8 px-3 rounded-xl bg-bingo-green hover:bg-bingo-green-bright text-bingo-black text-xs font-bold inline-flex items-center gap-1.5">
            <Plus className="size-3.5" /> תגית
          </button>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {COMMON_TAGS.map((t) => (
            <span key={t.key} className={cn(
              "inline-flex items-center gap-1.5 text-[12px] font-bold rounded-full px-3 py-1 border",
              t.color === "red" ? "bg-status-red/15 text-status-red border-status-red/30" :
              t.color === "orange" ? "bg-status-orange/15 text-orange-700 border-status-orange/30" :
              t.color === "green" ? "bg-bingo-green/15 text-bingo-green-dark border-bingo-green/40" :
              t.color === "blue" ? "bg-status-blue/12 text-status-blue border-status-blue/30" :
              t.color === "yellow" ? "bg-status-yellow/20 text-amber-700 border-status-yellow/40" :
              "bg-status-purple/15 text-status-purple border-status-purple/30"
            )}>
              {t.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function stageDot(color: string): string {
  const map: Record<string, string> = {
    blue: "bg-status-blue",
    yellow: "bg-status-yellow",
    orange: "bg-status-orange",
    green: "bg-bingo-green",
    purple: "bg-status-purple",
    pink: "bg-status-pink",
    gray: "bg-bingo-gray-300",
  };
  return map[color] || "bg-bingo-gray-300";
}
