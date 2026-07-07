"use client";
import * as React from "react";
import Link from "next/link";
import { PartyPopper, Phone, Banknote, CheckCircle2 } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { useJourney } from "../useJourney";
import { Field } from "../controls/Field";
import { MoneyInput } from "../controls/MoneyInput";

/** loan arrival → fee collection → the celebration screen */
export function ClosingSection() {
  const { j, patch, markLoanArrived, markPaid } = useJourney();
  const dueTxt = j.paymentDueAt
    ? new Date(j.paymentDueAt).toLocaleDateString("he-IL", { weekday: "long", day: "numeric", month: "long" })
    : "";

  if (j.paidAt) {
    return (
      <div className="text-center py-4">
        <span className="b-icon b-icon-green size-16 mx-auto mb-3"><PartyPopper className="size-8" /></span>
        <h3 className="text-[24px] font-bold text-bingo-black">העסקה הושלמה! 🎉</h3>
        <p className="text-[14px] text-bingo-gray-500 mt-1">
          שכר טרחה: <b className="text-bingo-black">{j.feeAmount ? formatCurrency(Number(j.feeAmount)) : "—"}</b>
        </p>
        <Link href="/dialer/cockpit" className="b-pill b-pill-dark b-pill-lg mx-auto mt-5 inline-flex">
          <Phone className="size-4" /> ללקוח הבא
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <span className="b-icon b-icon-green size-11"><Banknote className="size-5" /></span>
        <div>
          <h3 className="text-[15px] font-bold text-bingo-black">ממתין להלוואה → גביית שכר טרחה</h3>
          {dueTxt && (
            <p className="text-[12px] text-bingo-gray-500">
              ⏰ משימת תשלום: <b className="text-bingo-black">{dueTxt}</b>
            </p>
          )}
        </div>
      </div>

      {!j.loanArrivedAt && (
        <button onClick={markLoanArrived} className="b-pill b-pill-ghost w-full">
          <CheckCircle2 className="size-4" /> ההלוואה הגיעה לחשבון הלקוח ✓
        </button>
      )}

      <div className="flex items-end gap-2.5 max-w-md">
        <Field label="שכר טרחה (₪)">
          <MoneyInput big placeholder="2,500" value={j.feeAmount} onChange={(v) => patch({ feeAmount: v })} />
        </Field>
        <button
          onClick={markPaid}
          disabled={!j.feeAmount}
          className={cn("b-pill b-pill-lg shrink-0", j.feeAmount ? "b-pill-green" : "b-pill-ghost opacity-40 cursor-not-allowed")}
        >
          <CheckCircle2 className="size-4" /> התשלום התקבל
        </button>
      </div>
    </div>
  );
}
