"use client";
/**
 * JourneyMap — the vertical stepper. Shows the whole journey at a glance:
 * done/current/todo balls, missing-field badges (the pre-fill payoff),
 * and the track fork (checks vs docs) after the signature divider.
 */
import * as React from "react";
import { motion } from "framer-motion";
import { Check, Car, Banknote } from "lucide-react";
import { sectionMeta, sectionComplete, missingCount, FIRST_CALL_SECTIONS } from "@/lib/journey";
import { cn } from "@/lib/utils";
import { useJourney } from "./useJourney";

export function JourneyMap() {
  const { j, sections, focused, current, goto, track } = useJourney();
  const firstCallIds = new Set(FIRST_CALL_SECTIONS.map((s) => s.id));

  function rowState(id: (typeof sections)[number]): "done" | "current" | "focused" | "todo" {
    if (id === focused) return "focused";
    if (sectionComplete(j, id)) return "done";
    if (id === current) return "current";
    return "todo";
  }

  return (
    <>
      {/* desktop: vertical stepper */}
      <nav className="hidden lg:block b-card p-3 sticky top-[140px]">
        <ul className="space-y-0.5">
          {sections.map((id, i) => {
            const st = rowState(id);
            const meta = sectionMeta(id);
            const missing = firstCallIds.has(id) ? missingCount(j, id) : 0;
            const showDivider = id === "cooldown";
            return (
              <React.Fragment key={id}>
                {showDivider && (
                  <li className="flex items-center gap-2 py-2 px-1.5">
                    <div className="flex-1 h-px bg-bingo-gray-150" />
                    <span className="b-eyebrow flex items-center gap-1">
                      אחרי החתימה
                      {track === "vehicle" ? <Car className="size-3" /> : <Banknote className="size-3" />}
                    </span>
                    <div className="flex-1 h-px bg-bingo-gray-150" />
                  </li>
                )}
                <li>
                  <button
                    onClick={() => goto(id)}
                    className={cn(
                      "w-full flex items-center gap-2.5 rounded-xl px-2 py-1.5 text-right transition-colors",
                      st === "focused" ? "bg-bingo-gray-100" : "hover:bg-bingo-gray-50",
                    )}
                  >
                    <motion.span
                      animate={st === "done" ? { scale: [1, 1.25, 1] } : { scale: 1 }}
                      transition={{ duration: 0.35, ease: "easeOut" }}
                      className={cn(
                        "size-6 rounded-full flex items-center justify-center text-[10.5px] font-bold shrink-0 transition-colors",
                        st === "done" ? "bg-bingo-green text-bingo-black" :
                        st === "current" || st === "focused" ? "bg-bingo-black text-white" :
                        "bg-bingo-gray-100 text-bingo-gray-400",
                      )}
                    >
                      {st === "done" ? <Check className="size-3.5" strokeWidth={3.5} /> : i + 1}
                    </motion.span>
                    <span className={cn(
                      "text-[12.5px] font-semibold flex-1 truncate",
                      st === "todo" ? "text-bingo-gray-400" : "text-bingo-black",
                    )}>
                      {meta.short}
                    </span>
                    {missing > 0 && st !== "done" && (
                      <span className="text-[9.5px] font-bold rounded-full bg-bingo-gray-100 text-bingo-gray-500 px-1.5 py-px shrink-0">
                        {missing} חסרים
                      </span>
                    )}
                  </button>
                </li>
              </React.Fragment>
            );
          })}
        </ul>
      </nav>

      {/* mobile: horizontal dot strip */}
      <nav className="lg:hidden flex items-center gap-1 overflow-x-auto scrollbar-none pb-1">
        {sections.map((id) => {
          const st = rowState(id);
          const meta = sectionMeta(id);
          return (
            <button
              key={id}
              onClick={() => goto(id)}
              className={cn(
                "flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[11px] font-semibold whitespace-nowrap transition",
                st === "done" ? "bg-bingo-green-light text-bingo-green-deep" :
                st === "current" || st === "focused" ? "bg-bingo-black text-white" :
                "bg-bingo-gray-100 text-bingo-gray-400",
              )}
            >
              {st === "done" ? <Check className="size-3" strokeWidth={3} /> : meta.num}
              {meta.short}
            </button>
          );
        })}
      </nav>
    </>
  );
}
