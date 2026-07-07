"use client";
import * as React from "react";
import { Bot } from "lucide-react";
import { JOURNEY_LENDERS, lenderLogo, type LenderResult } from "@/lib/journey";
import { cn } from "@/lib/utils";
import { useJourney } from "../useJourney";

/** eligibility checks board — bot-supported lenders first */
export function ChecksSection() {
  const { j, patch, finishChecks } = useJourney();
  const ordered = [...JOURNEY_LENDERS].sort((a, b) => Number(b.botSupported) - Number(a.botSupported));
  const answered = JOURNEY_LENDERS.filter((l) =>
    ["approved", "rejected"].includes(j.lenderResults[l.key]?.outcome as string),
  ).length;

  function setResult(key: string, r: Partial<LenderResult>) {
    patch({
      lenderResults: {
        ...j.lenderResults,
        [key]: { ...(j.lenderResults[key] || { outcome: null }), ...r },
      },
    });
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <p className="text-[12.5px] text-bingo-gray-500">הוזנו <b className="text-bingo-black">{answered}</b> מתוך {JOURNEY_LENDERS.length} גופים</p>
        {!j.checksDone && (
          <button
            onClick={finishChecks}
            disabled={answered === 0}
            className={cn("b-pill b-pill-sm", answered > 0 ? "b-pill-dark" : "b-pill-ghost opacity-40 cursor-not-allowed")}
          >
            סיים ושקף ללקוח ↵
          </button>
        )}
      </div>
      <div className="space-y-2">
        {ordered.map((l) => {
          const r = j.lenderResults[l.key];
          const st = r?.outcome ?? null;
          return (
            <div key={l.key} className={cn(
              "rounded-2xl border px-3.5 py-2.5 transition-colors",
              st === "approved" ? "border-bingo-green/40 bg-bingo-green-light/25" :
              st === "rejected" ? "border-bingo-gray-150 bg-bingo-gray-50 opacity-70" : "border-bingo-gray-150",
            )}>
              <div className="flex items-center gap-3 flex-wrap">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={lenderLogo(l.domain)} alt={l.name} className="size-8 rounded-lg border border-bingo-gray-150 bg-white object-contain p-0.5 shrink-0" />
                <span className="text-[13.5px] font-bold text-bingo-black flex-1 min-w-24">{l.name}</span>
                {l.botSupported && (
                  <span className="b-chip b-chip-blue text-[10px] py-0.5"><Bot className="size-3" /> אוטומטי</span>
                )}
                <div className="b-segment shrink-0">
                  <button data-active={st === "approved"} onClick={() => setResult(l.key, { outcome: "approved" })}>אושר</button>
                  <button data-active={st === "rejected"} onClick={() => setResult(l.key, { outcome: "rejected" })}>נדחה</button>
                </div>
              </div>
              {st === "approved" && (
                <div className="grid grid-cols-3 gap-2 mt-2.5">
                  <input className="b-input h-9 text-[12.5px]" inputMode="numeric" placeholder="סכום ₪"
                    value={r?.amount ?? ""} onChange={(e) => setResult(l.key, { amount: e.target.value ? Number(e.target.value) : null })} />
                  <input className="b-input h-9 text-[12.5px]" inputMode="decimal" placeholder="ריבית %"
                    value={r?.rate ?? ""} onChange={(e) => setResult(l.key, { rate: e.target.value ? Number(e.target.value) : null })} />
                  <input className="b-input h-9 text-[12.5px]" inputMode="numeric" placeholder="חודשים"
                    value={r?.months ?? ""} onChange={(e) => setResult(l.key, { months: e.target.value ? Number(e.target.value) : null })} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
