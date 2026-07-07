"use client";
/**
 * RightRail — always-visible during the call: quick note (Enter saves),
 * the live activity timeline (server-backed), pending callback, quick facts.
 */
import * as React from "react";
import { StickyNote, RotateCcw, AlarmClock } from "lucide-react";
import { cn, formatCurrency, relativeTime } from "@/lib/utils";
import { useJourney } from "./useJourney";

const DOT: Record<string, string> = {
  note: "bg-status-blue",
  journey: "bg-bingo-green",
  "status-change": "bg-status-purple",
  task: "bg-status-orange",
  call: "bg-bingo-blue",
  whatsapp: "bg-bingo-green",
  sms: "bg-bingo-gray-300",
};

export function RightRail() {
  const { j, addNote, activities, resetJourney, noteInputRef } = useJourney();
  const [note, setNote] = React.useState("");

  function submit() {
    if (!note.trim()) return;
    addNote(note);
    setNote("");
  }

  const callbackPending = j.callbackDueAt && !j.checksStartedAt && j.signedAt;

  return (
    <div className="space-y-4 lg:sticky lg:top-[140px]">
      {/* quick facts — glanceable during the call */}
      <section className="b-card p-4">
        <h3 className="text-[13px] font-bold text-bingo-black mb-2.5">מבט מהיר</h3>
        <dl className="grid grid-cols-2 gap-x-3 gap-y-2 text-[12px]">
          <div>
            <dt className="text-bingo-gray-400">סכום מבוקש</dt>
            <dd className="font-bold text-bingo-black tabular-nums">
              {j.amountRequested ? formatCurrency(Number(String(j.amountRequested).replace(/\D/g, ""))) : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-bingo-gray-400">מטרה</dt>
            <dd className="font-bold text-bingo-black">{j.loanPurpose || "—"}</dd>
          </div>
          <div>
            <dt className="text-bingo-gray-400">הכנסה</dt>
            <dd className="font-bold text-bingo-black tabular-nums">
              {j.monthlyIncome ? formatCurrency(Number(String(j.monthlyIncome).replace(/\D/g, ""))) : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-bingo-gray-400">בנק</dt>
            <dd className="font-bold text-bingo-black">{j.bankName || "—"}</dd>
          </div>
        </dl>
      </section>

      {/* pending callback */}
      {callbackPending && (
        <section className="b-card p-4 border-2 border-status-orange/30">
          <div className="flex items-center gap-2">
            <span className="b-icon b-icon-orange size-8"><AlarmClock className="size-4" /></span>
            <div className="min-w-0">
              <p className="text-[12.5px] font-bold text-bingo-black">חזרה ללקוח</p>
              <p className="text-[11px] text-bingo-gray-500 tabular-nums">
                {new Date(j.callbackDueAt!).toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* quick note */}
      <section className="b-card p-4">
        <div className="flex items-center gap-2 mb-2.5">
          <span className="b-icon b-icon-gray size-8"><StickyNote className="size-4" /></span>
          <h3 className="text-[13.5px] font-bold text-bingo-black">הערה מהירה</h3>
          <kbd className="mr-auto hidden md:inline rounded bg-bingo-gray-100 px-1.5 py-px text-[9.5px] font-bold text-bingo-gray-400">/</kbd>
        </div>
        <div className="flex gap-2">
          <input
            ref={noteInputRef}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); submit(); } }}
            placeholder="כתוב ולחץ Enter..."
            className="b-input h-10 text-[13px]"
          />
          <button onClick={submit} className="b-pill b-pill-dark b-pill-sm shrink-0">שמור</button>
        </div>
      </section>

      {/* timeline (server Activity rows) */}
      <section className="b-card p-4">
        <div className="flex items-center justify-between mb-2.5">
          <h3 className="text-[13.5px] font-bold text-bingo-black">ציר זמן</h3>
          <button
            onClick={() => { if (confirm("לאפס את המסע? הנתונים שהוזנו בכרטיס יימחקו.")) void resetJourney(); }}
            className="text-[11px] text-bingo-gray-400 hover:text-bingo-gray-600 inline-flex items-center gap-1"
          >
            <RotateCcw className="size-3" /> אפס מסע
          </button>
        </div>
        <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
          {activities.length === 0 && (
            <p className="text-[12px] text-bingo-gray-400 text-center py-3">כל פעולה תתועד כאן</p>
          )}
          {activities.map((a) => (
            <div key={a.id} className="flex gap-2.5">
              <span className={cn("size-2 rounded-full mt-1.5 shrink-0", DOT[a.type] ?? "bg-bingo-gray-300")} />
              <div className="min-w-0">
                <p className="text-[12px] text-bingo-black leading-snug">{a.text}</p>
                <p className="text-[10px] text-bingo-gray-400 tabular-nums">
                  {relativeTime(a.createdAt)}{a.userName ? ` · ${a.userName}` : ""}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
