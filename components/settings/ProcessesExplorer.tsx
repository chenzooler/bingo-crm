"use client";
/**
 * תהליכים וסטטוסים — 15 התהליכים של Yoatsim עם ספירות חיות מה-DB.
 * הרחבת תהליך חושפת את רשימת הסטטוסים + ספירה לכל סטטוס.
 */
import * as React from "react";
import { PROCESSES } from "@/lib/yoatsim/processes";
import { ChevronDown } from "lucide-react";

export interface ProcessCounts {
  /** processKey → סה"כ לידים בתהליך */
  byProcess: Record<string, number>;
  /** `${processKey}::${statusKey}` → לידים בסטטוס */
  byStatus: Record<string, number>;
}

export function ProcessesExplorer({ counts }: { counts: ProcessCounts }) {
  const [open, setOpen] = React.useState<Set<string>>(new Set());

  function toggle(key: string) {
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  return (
    <div className="space-y-3">
      {PROCESSES.map((proc) => {
        const total = counts.byProcess[proc.key] ?? 0;
        const isOpen = open.has(proc.key);
        return (
          <div key={proc.key} className="b-card p-0 overflow-hidden">
            <button
              onClick={() => toggle(proc.key)}
              className="w-full flex items-center gap-3 px-5 py-4 text-right hover:bg-bingo-gray-50/60 transition"
              aria-expanded={isOpen}
            >
              <span className="b-icon b-icon-green !size-10 text-lg shrink-0">{proc.emoji}</span>
              <span className="flex-1 min-w-0">
                <span className="block text-[15px] font-extrabold text-bingo-black truncate">{proc.name}</span>
                <span className="block text-[11px] text-bingo-gray-500">{proc.statuses.length} סטטוסים</span>
              </span>
              <span className={`b-chip ${total > 0 ? "b-chip-green" : "b-chip-gray"} shrink-0`}>
                {total.toLocaleString("he-IL")} לידים
              </span>
              <ChevronDown
                className={`size-4 text-bingo-gray-400 shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`}
              />
            </button>

            {isOpen && (
              <div className="border-t border-bingo-gray-100 px-5 py-3">
                <ul className="divide-y divide-bingo-gray-100">
                  {proc.statuses.map((status) => {
                    const n = counts.byStatus[`${proc.key}::${status}`] ?? 0;
                    return (
                      <li key={status} className="flex items-center justify-between gap-3 py-2">
                        <span className={`text-[13px] font-bold ${n > 0 ? "text-bingo-charcoal" : "text-bingo-gray-500"}`}>
                          {status}
                        </span>
                        <span className={`b-chip ${n > 0 ? "b-chip-blue" : "b-chip-gray opacity-50"}`}>
                          {n.toLocaleString("he-IL")}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
