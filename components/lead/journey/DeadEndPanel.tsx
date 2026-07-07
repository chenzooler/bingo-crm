"use client";
/**
 * DeadEndPanel — disqualified AND no vehicle. Pick an exit reason and close
 * the journey cleanly (stage → EXIT), or undo the vehicle answer.
 */
import * as React from "react";
import { XCircle, Undo2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useJourney } from "./useJourney";

const EXIT_OPTIONS = [
  "לא זכאי — נפסל ואין רכב",
  "BDI שלילי",
  "לא מעוניין לאחר הסבר",
  "גיל נמוך — מתחת ל-25",
  "עולה חדש / אין אזרחות",
  "אחר",
];

export function DeadEndPanel() {
  const { patch, markExit } = useJourney();
  const [reason, setReason] = React.useState(EXIT_OPTIONS[0]);
  const [other, setOther] = React.useState("");

  return (
    <div className="text-center">
      <XCircle className="size-10 text-bingo-gray-300 mx-auto mb-2" />
      <h2 className="text-[20px] font-bold text-bingo-black">הליד לא זכאי — נפסל ואין רכב</h2>
      <p className="text-[12.5px] text-bingo-gray-500 mt-1 mb-4">בחר סיבת יציאה — הליד ייסגר מסודר, בלי כפל תהליכים</p>

      <div className="flex flex-wrap justify-center gap-1.5 mb-4">
        {EXIT_OPTIONS.map((o) => (
          <button
            key={o}
            onClick={() => setReason(o)}
            className={cn("b-chip transition", reason === o ? "b-chip-dark" : "b-chip-gray hover:bg-bingo-gray-150")}
          >
            {o}
          </button>
        ))}
      </div>
      {reason === "אחר" && (
        <input
          className="b-input h-10 text-[13px] mb-4 max-w-sm mx-auto"
          placeholder="פרט את הסיבה..."
          value={other}
          onChange={(e) => setOther(e.target.value)}
        />
      )}

      <button
        onClick={() => markExit(reason === "אחר" && other.trim() ? other.trim() : reason)}
        className="b-pill b-pill-dark b-pill-lg mx-auto"
      >
        סמן יציאה וסגור את המסע
      </button>

      <button
        onClick={() => patch({ hasVehicle: null })}
        className="mt-4 mx-auto flex items-center gap-1 text-[12px] text-bingo-gray-400 hover:text-bingo-gray-600"
      >
        <Undo2 className="size-3.5" /> רגע, בעצם יש רכב — חזור לשאלה
      </button>
    </div>
  );
}
