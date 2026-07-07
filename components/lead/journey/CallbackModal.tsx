"use client";
import * as React from "react";
import { useJourney } from "./useJourney";

const OPTIONS = ["בעוד שעה", "בעוד 3 שעות", "מחר בבוקר (10:00)", "בעוד יומיים"];

export function CallbackModal() {
  const { overlay, setOverlay, setCallback } = useJourney();
  const [note, setNote] = React.useState("");
  if (overlay !== "callback") return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-bingo-black/40 p-4" onClick={() => setOverlay(null)}>
      <div className="b-card p-6 w-full max-w-sm animate-slide-in-up" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-[16px] font-bold text-bingo-black mb-1">קבע חזרה ללקוח</h3>
        <p className="text-[12px] text-bingo-gray-500 mb-3.5">החזרה תתועד בציר הזמן של הליד</p>
        <div className="grid grid-cols-2 gap-2 mb-3">
          {OPTIONS.map((o) => (
            <button key={o} onClick={() => { setCallback(o, note); setNote(""); }} className="b-pill b-pill-ghost b-pill-sm">
              {o}
            </button>
          ))}
        </div>
        <input
          className="b-input h-10 text-[13px] mb-3"
          placeholder="הערה (אופציונלי)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
        <button onClick={() => setOverlay(null)} className="text-[12px] text-bingo-gray-400 hover:text-bingo-gray-600 w-full text-center">
          ביטול
        </button>
      </div>
    </div>
  );
}
