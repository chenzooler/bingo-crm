"use client";
import * as React from "react";
import { Check, Clock, Upload, Sparkles, Trophy, CheckCircle2 } from "lucide-react";
import { VEHICLE_DOCS } from "@/lib/journey";
import { cn, formatCurrency } from "@/lib/utils";
import { useJourney } from "../useJourney";
import { MoneyInput } from "../controls/MoneyInput";

/** vehicle track — collect the 4 documents, upload, enter the final approval */
export function DocsSection() {
  const { j, patch, setApproval, addNote } = useJourney();
  const received = VEHICLE_DOCS.filter((d) => j.docsReceived[d.id]).length;
  const all = received === VEHICLE_DOCS.length;
  const [amount, setAmount] = React.useState("");
  const [rate, setRate] = React.useState("");
  const [months, setMonths] = React.useState("");

  return (
    <div className="space-y-4">
      <p className="text-[12.5px] text-bingo-gray-500">התקבלו <b className="text-bingo-black">{received}</b>/4 מסמכים</p>
      <div className="grid grid-cols-2 gap-2">
        {VEHICLE_DOCS.map((d) => {
          const got = !!j.docsReceived[d.id];
          return (
            <button key={d.id} type="button"
              onClick={() => patch({ docsReceived: { ...j.docsReceived, [d.id]: !got } })}
              className={cn(
                "rounded-2xl border-2 px-3.5 py-3.5 flex items-center gap-2.5 text-right transition-all",
                got ? "border-bingo-green bg-bingo-green-light/40" : "border-bingo-gray-150 hover:border-bingo-gray-300",
              )}>
              <span className={cn("size-7 rounded-full flex items-center justify-center shrink-0",
                got ? "bg-bingo-green text-bingo-black" : "bg-bingo-gray-100 text-bingo-gray-400")}>
                {got ? <Check className="size-4" strokeWidth={3} /> : <Clock className="size-3.5" />}
              </span>
              <span className="text-[13.5px] font-semibold text-bingo-black">{d.label}</span>
            </button>
          );
        })}
      </div>

      {!j.docsUploadedAt ? (
        <button
          onClick={() => { patch({ docsUploadedAt: new Date().toISOString() }); addNote("המסמכים הועלו לגוף המימון"); }}
          disabled={!all}
          className={cn("b-pill b-pill-lg w-full", all ? "b-pill-green" : "b-pill-ghost opacity-40 cursor-not-allowed")}
        >
          <Upload className="size-4" /> הכל התקבל — העלה לגוף המימון
        </button>
      ) : !j.finalApproval ? (
        <div className="rounded-2xl border border-bingo-green/40 bg-bingo-green-light/25 p-4">
          <p className="text-[13px] font-bold text-bingo-black mb-2.5 flex items-center gap-1.5">
            <Sparkles className="size-4 text-bingo-green-dark" /> הועלה — כשמגיע האישור הסופי הזן אותו:
          </p>
          <div className="grid grid-cols-3 gap-2 mb-2.5">
            <MoneyInput placeholder="סכום" value={amount} onChange={setAmount} />
            <input className="b-input" inputMode="decimal" placeholder="ריבית %" value={rate} onChange={(e) => setRate(e.target.value)} />
            <input className="b-input" inputMode="numeric" placeholder="חודשים" value={months} onChange={(e) => setMonths(e.target.value)} />
          </div>
          <button
            onClick={() => setApproval(Number(amount), Number(rate || 0), Number(months || 0))}
            disabled={!amount}
            className={cn("b-pill w-full", amount ? "b-pill-green" : "b-pill-ghost opacity-40 cursor-not-allowed")}
          >
            <Trophy className="size-4" /> התקבל אישור סופי!
          </button>
        </div>
      ) : (
        <p className="text-[14px] font-bold text-bingo-green-dark flex items-center gap-2">
          <CheckCircle2 className="size-4" />
          אישור סופי: {formatCurrency(j.finalApproval.amount || 0)} · {j.finalApproval.rate}% · {j.finalApproval.months} חודשים
        </p>
      )}
    </div>
  );
}
