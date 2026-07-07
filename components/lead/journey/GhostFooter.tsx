"use client";
/**
 * GhostFooter — חוזה הצעד הבא. Always visible under the card:
 * what WILL be scheduled the moment this call is sealed, derived live
 * from the draft state (nextActionFor). Catches forgetfulness before hangup.
 */
import * as React from "react";
import { MoveLeft } from "lucide-react";
import { nextActionFor } from "@/lib/journey";
import { cn } from "@/lib/utils";
import { useJourney } from "./useJourney";

const TONE: Record<string, string> = {
  blue: "text-bingo-blue", purple: "text-status-purple", amber: "text-[#b45309]",
  teal: "text-teal-600", orange: "text-[#c26a15]", green: "text-bingo-green-deep",
  gold: "text-[#B08900]", gray: "text-bingo-gray-500",
};

export function GhostFooter() {
  const { j } = useJourney();
  const na = nextActionFor(j);
  const due = na.dueAt
    ? new Date(na.dueAt).toLocaleString("he-IL", { weekday: "short", hour: "2-digit", minute: "2-digit" })
    : "עכשיו";

  return (
    <div className="rounded-2xl border-2 border-dashed border-bingo-gray-200 bg-white/60 px-4 py-2.5 flex items-center gap-2.5">
      <span className="b-eyebrow shrink-0">בסיום השיחה</span>
      <MoveLeft className="size-3.5 text-bingo-gray-300 shrink-0" />
      <span className={cn("text-[13px] font-bold", TONE[na.tone])}>{na.label}</span>
      <span className="text-[12px] text-bingo-gray-400 tabular-nums">· {due}</span>
      <span className="mr-auto text-[10.5px] text-bingo-gray-300 hidden sm:block">
        ליד בלי צעד-הבא לא קיים ברֶצֶף
      </span>
    </div>
  );
}
