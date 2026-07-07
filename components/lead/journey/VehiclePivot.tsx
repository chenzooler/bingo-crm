"use client";
/**
 * VehiclePivot — the forced full-screen decision moment.
 * Appears when the customer fails general-track screening (or purpose=vehicle)
 * and the vehicle question is still unanswered. Non-dismissable by design:
 * the rep MUST ask. Keys: 1 = has vehicle, 2 = no vehicle.
 */
import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Car, Check, Undo2 } from "lucide-react";
import { screeningFailReasons } from "@/lib/journey";
import { useJourney } from "./useJourney";
import { DeadEndPanel } from "./DeadEndPanel";

export function VehiclePivot() {
  const { j, askVehicle, deadEnd, answerVehicle, pivotSnoozed, snoozePivot, goto, patch } = useJourney();
  const open = (askVehicle && !pivotSnoozed) || (deadEnd && !j.exitReason);
  const reasons = screeningFailReasons(j);

  // keyboard: 1/2 while open
  React.useEffect(() => {
    if (!open || deadEnd) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "1") { e.preventDefault(); answerVehicle(true); }
      if (e.key === "2") { e.preventDefault(); answerVehicle(false); }
      // Esc intentionally does nothing — forced binary
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, deadEnd, answerVehicle]);

  /** revert the most recent disqualifying manual choice and go back to fix it */
  function undoToIndicator() {
    if (j.smileyManual === "yellow" || j.smileyManual === "red") {
      patch({ smileyManual: null });
      goto("bdi");
    } else if (j.smileyAuto === "yellow" || j.smileyAuto === "red") {
      patch({ smileyAuto: null });
      goto("bdi");
    } else {
      snoozePivot();
      goto("credit");
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-bingo-black/60 backdrop-blur-sm p-4"
        >
          <motion.div
            initial={{ y: 48, opacity: 0, scale: 0.97 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 24, opacity: 0, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            className="b-card w-full max-w-lg p-7"
          >
            {deadEnd ? (
              <DeadEndPanel />
            ) : (
              <>
                {reasons.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {reasons.map((r) => (
                      <span key={r} className="b-chip b-chip-orange text-[11px]">{r}</span>
                    ))}
                  </div>
                )}
                <p className="b-eyebrow mb-1">מסלול כל מטרה נפסל — עוברים לגיבוי</p>
                <h2 className="text-[28px] font-bold text-bingo-black leading-tight mb-1">
                  ״האם יש בבעלותך רכב?״
                </h2>
                <p className="text-[13.5px] text-bingo-gray-500 mb-6">
                  שאל את הלקוח <b className="text-bingo-black">עכשיו</b> — אל תמשיך בלי תשובה.
                </p>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => answerVehicle(true)}
                    className="b-pill b-pill-green b-pill-lg h-16 text-[16px] justify-center"
                  >
                    <Car className="size-5" /> כן, יש רכב
                    <kbd className="hidden sm:inline-flex rounded-md bg-black/10 px-1.5 text-[10px] font-bold">1</kbd>
                  </button>
                  <button
                    onClick={() => answerVehicle(false)}
                    className="b-pill b-pill-ghost b-pill-lg h-16 text-[16px] justify-center"
                  >
                    אין רכב
                    <kbd className="hidden sm:inline-flex rounded-md bg-bingo-gray-100 px-1.5 text-[10px] font-bold">2</kbd>
                  </button>
                </div>

                <button
                  onClick={undoToIndicator}
                  className="mt-5 mx-auto flex items-center gap-1 text-[12px] text-bingo-gray-400 hover:text-bingo-gray-600"
                >
                  <Undo2 className="size-3.5" /> טעות בסימון? חזור לרמזור
                </button>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function PivotReminder() {
  const { askVehicle, pivotSnoozed, snoozePivot: _s, answerVehicle } = useJourney();
  if (!askVehicle || !pivotSnoozed) return null;
  return (
    <div className="rounded-2xl border-2 border-bingo-blue/40 bg-status-blue-soft/50 p-4 flex items-center gap-3 animate-fade-in">
      <span className="b-icon b-icon-blue size-10 shrink-0"><Car className="size-5" /></span>
      <p className="text-[13px] font-semibold text-bingo-black flex-1">
        שאלת הרכב עדיין ממתינה — ״האם יש בבעלותך רכב?״
      </p>
      <button onClick={() => answerVehicle(true)} className="b-pill b-pill-green b-pill-sm">
        <Check className="size-3.5" strokeWidth={3} /> יש רכב
      </button>
      <button onClick={() => answerVehicle(false)} className="b-pill b-pill-ghost b-pill-sm">אין</button>
    </div>
  );
}
