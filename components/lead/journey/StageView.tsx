"use client";
/**
 * StageView — the stage. ONE big card showing only the focused section:
 * script hint on top, oversized fields in the middle, המשך/חזור below.
 * Sections slide with framer-motion (RTL: forward = leftward).
 */
import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, CornerDownLeft } from "lucide-react";
import { sectionMeta, sectionComplete } from "@/lib/journey";
import { cn } from "@/lib/utils";
import { useJourney } from "./useJourney";
import { SectionRenderer } from "./SectionRenderer";

export function StageView() {
  const { j, focused, sections, advance, back, deadEnd } = useJourney();
  const meta = sectionMeta(focused);
  const idx = sections.indexOf(focused);
  const isFirst = idx <= 0;
  const isLast = idx >= sections.length - 1;
  const complete = sectionComplete(j, focused);

  // slide direction: track index changes (RTL — forward slides left)
  const prevIdx = React.useRef(idx);
  const dir = idx >= prevIdx.current ? 1 : -1;
  React.useEffect(() => { prevIdx.current = idx; }, [idx]);

  return (
    <div className="b-card p-6 min-h-[460px] flex flex-col overflow-hidden">
      <AnimatePresence mode="popLayout" custom={dir}>
        <motion.div
          key={focused}
          custom={dir}
          initial={{ x: dir * -32, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: dir * 32, opacity: 0 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          className="flex flex-col flex-1"
        >
          {/* header: number + title + script hint */}
          <header className="mb-6">
            <p className="b-eyebrow mb-1">שלב {meta.num} · {meta.short}</p>
            <h2 className="text-[22px] font-bold text-bingo-black leading-tight">{meta.title}</h2>
            <p className="mt-2 text-[14.5px] text-bingo-gray-600 leading-relaxed border-r-[3px] border-bingo-green pr-3">
              {meta.hint}
            </p>
          </header>

          {/* the section's fields */}
          <div className="flex-1">
            <SectionRenderer id={focused} />
          </div>

          {/* footer: back / continue + kbd legend */}
          {!deadEnd && (
            <footer className="flex items-center gap-3 pt-6 mt-6 border-t border-bingo-gray-100">
              <button
                onClick={back}
                disabled={isFirst}
                className={cn("b-pill b-pill-ghost", isFirst && "opacity-30 cursor-not-allowed")}
              >
                <ChevronRight className="size-4" /> חזור
              </button>
              <div className="flex-1" />
              <span className="hidden md:flex items-center gap-3 text-[10.5px] text-bingo-gray-400">
                <span className="flex items-center gap-1"><kbd className="rounded bg-bingo-gray-100 px-1 py-px font-bold">1-9</kbd> בחירה</span>
                <span className="flex items-center gap-1"><kbd className="rounded bg-bingo-gray-100 px-1 py-px font-bold">↵</kbd> המשך</span>
                <span className="flex items-center gap-1"><kbd className="rounded bg-bingo-gray-100 px-1 py-px font-bold">?</kbd> קיצורים</span>
              </span>
              {!isLast && (
                <button
                  onClick={advance}
                  className={cn(
                    "b-pill b-pill-lg",
                    complete ? "b-pill-green" : "b-pill-dark",
                  )}
                >
                  המשך <CornerDownLeft className="size-4" />
                  {!complete && <ChevronLeft className="size-4 -mr-1" />}
                </button>
              )}
            </footer>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
