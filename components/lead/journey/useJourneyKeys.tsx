"use client";
/**
 * useJourneyKeys — global keyboard layer.
 *   Enter  → commit + advance (when the focused section is complete)
 *   1-9    → select/toggle option in the first unsatisfied group on stage
 *   Esc    → close overlay / go back a section
 *   /      → focus the quick note
 *   ?      → shortcuts cheat-sheet
 * Digits are ignored while typing in a text field; Enter inside an input
 * blurs it first (commit), then advances if the section is complete.
 */
import * as React from "react";
import { sectionComplete } from "@/lib/journey";
import { useJourney } from "./useJourney";

function isTypingTarget(el: EventTarget | null): boolean {
  if (!(el instanceof HTMLElement)) return false;
  const tag = el.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || el.isContentEditable;
}

export function useJourneyKeys() {
  const ctx = useJourney();
  const ctxRef = React.useRef(ctx);
  ctxRef.current = ctx;

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const c = ctxRef.current;
      const speak = c.face === "speak";
      // modal overlays own their keys; the form-face pivot modal pauses the layer.
      // in speak mode the pivot is a morphed beat — digits must keep flowing.
      if (c.overlay !== null || (!speak && (c.askVehicle || c.deadEnd))) {
        if (e.key === "Escape" && c.overlay !== null && c.overlay !== "outcome") c.setOverlay(null);
        return;
      }
      const typing = isTypingTarget(e.target);

      if (e.key === "Enter" && !e.shiftKey && !e.metaKey && !e.ctrlKey) {
        if (typing) {
          // speak-face inputs (and the quick note) own their Enter
          if (speak || e.target === c.noteInputRef.current) return;
          (e.target as HTMLElement).blur();
          if (sectionComplete(c.j, c.focused)) {
            e.preventDefault();
            c.advance();
          }
          return;
        }
        // רֶצֶף: the speak face claims Enter (beat-level commit)
        if (c.enterRef.current) {
          if (c.enterRef.current()) e.preventDefault();
          return;
        }
        if (sectionComplete(c.j, c.focused)) {
          e.preventDefault();
          c.advance();
        }
        return;
      }

      if (typing) return;

      if (e.key >= "1" && e.key <= "9") {
        if (c.handleDigit(Number(e.key))) e.preventDefault();
        return;
      }
      if (e.key === "Escape") {
        // Esc never closes silently — it opens the outcome stamp
        e.preventDefault();
        c.setOverlay("outcome");
        return;
      }
      if (e.key === "Backspace") {
        e.preventDefault();
        c.back();
        return;
      }
      if (e.key === "/") {
        e.preventDefault();
        c.noteInputRef.current?.focus();
        return;
      }
      if (e.key === "?") {
        e.preventDefault();
        c.setOverlay("shortcuts");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
}

export function ShortcutsOverlay() {
  const { overlay, setOverlay } = useJourney();
  if (overlay !== "shortcuts") return null;
  const rows: Array<[string, string]> = [
    ["↵ Enter", "המשך לשלב הבא (כשהשלב הושלם)"],
    ["1-9", "בחירת אופציה בקבוצה הפתוחה"],
    ["Esc / ⌫", "חזרה שלב אחורה"],
    ["/", "קפיצה להערה מהירה"],
    ["?", "החלון הזה"],
  ];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-bingo-black/40 p-4" onClick={() => setOverlay(null)}>
      <div className="b-card p-6 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-[16px] font-bold text-bingo-black mb-4">קיצורי מקלדת ⚡</h3>
        <div className="space-y-2.5">
          {rows.map(([k, d]) => (
            <div key={k} className="flex items-center gap-3">
              <kbd className="rounded-lg bg-bingo-gray-100 px-2 py-1 text-[11px] font-bold text-bingo-gray-600 min-w-16 text-center" dir="ltr">{k}</kbd>
              <span className="text-[13px] text-bingo-black">{d}</span>
            </div>
          ))}
        </div>
        <button onClick={() => setOverlay(null)} className="mt-5 text-[12px] text-bingo-gray-400 hover:text-bingo-gray-600 w-full text-center">
          סגור (Esc)
        </button>
      </div>
    </div>
  );
}
