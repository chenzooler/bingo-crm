"use client";
/**
 * עץ התהליכים — שכפול הסרגל של Yoatsim: 15 תהליכים + ספירות חיות,
 * לחיצה על תהליך פותחת את הסטטוסים שלו עם ספירה לכל סטטוס.
 * הבחירה חיה ב-URL (?process= & ?status=) — לחיצה חוזרת מנקה.
 */
import Link from "next/link";
import { ChevronDown, ChevronLeft, Layers } from "lucide-react";
import { PROCESSES } from "@/lib/yoatsim/processes";
import { cn, formatNumber } from "@/lib/utils";

export function ProcessTree({ total, counts, statusCounts, selectedProcess, selectedStatus }: {
  total: number;
  counts: Record<string, number>;
  /** ספירות סטטוסים של התהליך הנבחר בלבד */
  statusCounts: Record<string, number>;
  selectedProcess?: string;
  selectedStatus?: string;
}) {
  return (
    <aside className="w-[260px] shrink-0 hidden lg:block sticky top-[76px]">
      <div className="b-card p-3 max-h-[calc(100vh-100px)] overflow-y-auto">
        <div className="b-eyebrow px-2 pt-1 pb-2 flex items-center gap-1.5">
          <Layers className="size-3.5" />
          תהליכים
        </div>

        {/* כל הלידים */}
        <Link
          href="/leads"
          className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-full text-[13px] font-semibold transition mb-0.5",
            !selectedProcess
              ? "bg-bingo-black text-white"
              : "text-bingo-gray-600 hover:bg-bingo-gray-100",
          )}
        >
          <span className="text-[14px] leading-none">📁</span>
          <span className="flex-1 truncate">כל הלידים</span>
          <span className={cn("text-[11px] tabular-nums font-bold", !selectedProcess ? "text-bingo-green" : "text-bingo-gray-400")}>
            {formatNumber(total)}
          </span>
        </Link>

        {PROCESSES.map((p) => {
          const selected = selectedProcess === p.key;
          const count = counts[p.key] ?? 0;
          return (
            <div key={p.key} className="mb-0.5">
              <Link
                // לחיצה על תהליך נבחר — סוגרת אותו (חזרה לכל הלידים)
                href={selected ? "/leads" : `/leads?process=${p.key}`}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-full text-[13px] font-semibold transition",
                  selected ? "bg-bingo-black text-white" : "text-bingo-gray-600 hover:bg-bingo-gray-100",
                )}
              >
                <span className="text-[14px] leading-none">{p.emoji}</span>
                <span className="flex-1 truncate">{p.name}</span>
                <span className={cn("text-[11px] tabular-nums font-bold", selected ? "text-bingo-green" : count === 0 ? "text-bingo-gray-300" : "text-bingo-gray-400")}>
                  {formatNumber(count)}
                </span>
                {selected
                  ? <ChevronDown className="size-3.5 opacity-70" />
                  : <ChevronLeft className="size-3.5 opacity-40" />}
              </Link>

              {/* סטטוסים של התהליך הפתוח */}
              {selected && (
                <div className="mr-4 mt-1 mb-1.5 pr-2.5 border-r-2 border-bingo-gray-150 space-y-px animate-fade-in">
                  {p.statuses.map((s) => {
                    const sCount = statusCounts[s] ?? 0;
                    const sSelected = selectedStatus === s;
                    return (
                      <Link
                        key={s}
                        href={`/leads?process=${p.key}&status=${encodeURIComponent(s)}`}
                        className={cn(
                          "flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[12px] transition",
                          sSelected
                            ? "bg-bingo-green-light text-bingo-green-deep font-bold"
                            : sCount === 0
                              ? "text-bingo-gray-300 hover:bg-bingo-gray-50"
                              : "text-bingo-gray-600 font-medium hover:bg-bingo-gray-100",
                        )}
                      >
                        <span className="flex-1 truncate">{s}</span>
                        <span className="text-[10.5px] tabular-nums font-bold shrink-0">
                          {formatNumber(sCount)}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
}
