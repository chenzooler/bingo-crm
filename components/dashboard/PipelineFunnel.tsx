"use client";
import * as React from "react";
import Link from "next/link";
import { STAGES, type LifecycleStage } from "@/lib/data/lifecycle";
import { AUGMENTED_LEADS } from "@/lib/data/lead-augment";
import { ArrowLeft } from "lucide-react";
import { cn, formatCurrency, formatNumber } from "@/lib/utils";

export function PipelineFunnel() {
  // Count leads per stage
  const counts = React.useMemo(() => {
    const map = new Map<LifecycleStage, { count: number; volume: number }>();
    STAGES.forEach((s) => map.set(s.key, { count: 0, volume: 0 }));
    AUGMENTED_LEADS.forEach((l) => {
      const stage = (l.stage || "NEW") as LifecycleStage;
      const e = map.get(stage);
      if (e) {
        e.count += 1;
        e.volume += l.amountRequested || 0;
      }
    });
    return map;
  }, []);

  const visibleStages = STAGES.filter((s) => s.key !== "EXIT");
  const maxCount = Math.max(...visibleStages.map((s) => counts.get(s.key)?.count || 0)) || 1;
  const totalCount = visibleStages.reduce((acc, s) => acc + (counts.get(s.key)?.count || 0), 0);
  const totalVolume = visibleStages.reduce((acc, s) => acc + (counts.get(s.key)?.volume || 0), 0);

  return (
    <div className="surface-card-elevated overflow-hidden">
      <div className="px-5 py-3 border-b border-bingo-gray-150 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-extrabold text-bingo-black">משפך לידים</h3>
          <p className="text-[10px] text-bingo-gray-500">פיזור לפי שלבי מחזור חיים</p>
        </div>
        <div className="text-right">
          <div className="text-xl font-black text-bingo-black tabular-nums leading-none">{formatNumber(totalCount)}</div>
          <div className="text-[10px] text-bingo-gray-500">{formatCurrency(totalVolume)}</div>
        </div>
      </div>

      <div className="p-4 space-y-1.5">
        {visibleStages.map((s) => {
          const d = counts.get(s.key) || { count: 0, volume: 0 };
          const pct = (d.count / maxCount) * 100;
          const bg = {
            blue: "bg-status-blue",
            yellow: "bg-status-yellow",
            orange: "bg-status-orange",
            green: "bg-bingo-green",
            purple: "bg-status-purple",
            pink: "bg-status-pink",
            gray: "bg-bingo-gray-300",
          }[s.color];
          return (
            <Link
              key={s.key}
              href={`/leads?stage=${s.key}`}
              className="group flex items-center gap-3 hover:bg-bingo-gray-50 -mx-2 px-2 py-1.5 rounded-lg transition"
            >
              <div className="w-32 flex items-center gap-2 shrink-0">
                <span className="text-[10px] font-mono font-bold text-bingo-gray-400 tabular-nums">
                  {String(s.position).padStart(2, "0")}
                </span>
                <span className="text-[12px] font-bold text-bingo-charcoal truncate">{s.label}</span>
              </div>
              <div className="flex-1 relative h-7 bg-bingo-gray-100 rounded-md overflow-hidden">
                <div
                  className={cn("absolute inset-y-0 right-0 rounded-md transition-all", bg)}
                  style={{ width: `${Math.max(pct, 1)}%` }}
                />
                {d.volume > 0 && (
                  <span className="absolute inset-y-0 right-2 flex items-center text-[10px] font-mono font-bold text-bingo-black/90 tabular-nums">
                    {formatCurrency(d.volume)}
                  </span>
                )}
              </div>
              <div className="w-14 text-right shrink-0">
                <span className="text-[14px] font-extrabold text-bingo-black tabular-nums">{d.count}</span>
              </div>
              <ArrowLeft className="size-3 text-bingo-gray-300 group-hover:text-bingo-green-dark group-hover:-translate-x-0.5 transition shrink-0" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
