"use client";
import * as React from "react";
import { Trophy, Check, Car, PlusCircle } from "lucide-react";
import { JOURNEY_LENDERS, lenderLogo } from "@/lib/journey";
import { cn, formatCurrency } from "@/lib/utils";
import { useJourney } from "../useJourney";

/** אפשרויות הרכב אחרי תוצאות כל-מטרה: לא הספיק / רוצה גם / סורב */
function VehicleUpsell({ hasOffers }: { hasOffers: boolean }) {
  const { j, patch, addVehicleTrack } = useJourney();
  if (j.comboVehicle || j.paidAt) return null;

  if (j.hasVehicle !== "yes") {
    return (
      <p className="mt-3 text-[11.5px] text-bingo-gray-400">
        💡 {j.hasVehicle === null ? "לא נשאל על רכב — " : ""}
        אם יש ללקוח רכב, אפשר להציע גם הלוואה כנגד רכב
        {j.hasVehicle === null && (
          <button onClick={() => patch({ hasVehicle: "yes" })} className="mr-1 font-bold text-bingo-blue hover:underline">
            יש רכב ✓
          </button>
        )}
      </p>
    );
  }
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {hasOffers && (
        <>
          <button onClick={() => addVehicleTrack("amount-insufficient")} className="b-pill b-pill-ghost b-pill-sm">
            <PlusCircle className="size-3.5" /> הסכום לא מספיק — הוסף מסלול רכב
          </button>
          <button onClick={() => addVehicleTrack("combo")} className="b-pill b-pill-ghost b-pill-sm">
            <Car className="size-3.5" /> הלקוח רוצה גם הלוואת רכב (משולב)
          </button>
        </>
      )}
    </div>
  );
}

/** reflect results to the customer — pick the winning offer together */
export function ResultsSection() {
  const { j, track, patch, chooseLender, markVehicleApprovalReflected, addVehicleTrack } = useJourney();
  const addVehicleTrackSafe = () => addVehicleTrack("rejected-general");

  if (track === "vehicle") {
    const a = j.finalApproval;
    return (
      <div className="flex items-center gap-4 flex-wrap">
        <span className="b-icon b-icon-green size-14"><Trophy className="size-7" /></span>
        <div className="flex-1 min-w-48">
          <h3 className="text-[16px] font-bold text-bingo-black">שקף ללקוח את האישור 🎉</h3>
          <p className="text-[24px] font-bold text-bingo-green-dark tabular-nums">
            {a?.amount ? formatCurrency(a.amount) : "—"}
            <span className="text-[13px] text-bingo-gray-500 font-medium"> · {a?.rate}% · {a?.months} תשלומים</span>
          </p>
        </div>
        {!j.paymentDueAt ? (
          <button onClick={markVehicleApprovalReflected} className="b-pill b-pill-green b-pill-lg">
            <Check className="size-4" strokeWidth={3} /> הלקוח מאשר
          </button>
        ) : (
          <span className="b-chip b-chip-green">✓ שוקף — ממתינים להלוואה</span>
        )}
      </div>
    );
  }

  const offers = JOURNEY_LENDERS.map((l) => ({ ...l, r: j.lenderResults[l.key] }))
    .filter((l) => l.r?.outcome === "approved")
    .sort((a, b) => (b.r?.amount || 0) - (a.r?.amount || 0));

  if (offers.length === 0) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-bingo-gray-200 p-8 text-center">
        <p className="text-[13.5px] text-bingo-gray-500 mb-3">כל הגופים דחו את הבקשה.</p>
        {j.hasVehicle === "yes" ? (
          <button onClick={() => addVehicleTrackSafe()} className="b-pill b-pill-green b-pill-lg mx-auto">
            <Car className="size-4" /> יש רכב — עבור למסלול רכב
          </button>
        ) : j.hasVehicle === null ? (
          <div className="flex justify-center gap-2">
            <span className="text-[13px] font-bold text-bingo-black self-center">"האם יש בבעלותך רכב?"</span>
            <button onClick={() => addVehicleTrackSafe()} className="b-pill b-pill-green b-pill-sm"><Car className="size-3.5" /> יש רכב</button>
            <button onClick={() => patch({ hasVehicle: "no" })} className="b-pill b-pill-ghost b-pill-sm">אין</button>
          </div>
        ) : (
          <p className="text-[12.5px] text-bingo-gray-400">אין רכב — שקול לסמן יציאה</p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {j.comboVehicle && (
        <p className="text-[12px] font-semibold text-bingo-blue flex items-center gap-1.5">
          <Car className="size-3.5" /> מסלול משולב פעיל — אחרי הבחירה כאן ממשיכים למסמכי הרכב
        </p>
      )}
      {offers.map((o, i) => (
        <div key={o.key} className={cn(
          "rounded-2xl border px-3.5 py-3 flex items-center gap-3 flex-wrap transition-colors",
          j.chosenLender === o.key ? "border-bingo-green bg-bingo-green-light/40" :
          i === 0 ? "border-bingo-green/40 bg-bingo-green-light/20" : "border-bingo-gray-150",
        )}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={lenderLogo(o.domain)} alt={o.name} className="size-9 rounded-lg border border-bingo-gray-150 bg-white object-contain p-0.5" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[14px] font-bold text-bingo-black">{o.name}</span>
              {i === 0 && !j.chosenLender && <span className="b-chip b-chip-green text-[10px] py-0.5">ההצעה הטובה ביותר</span>}
              {j.chosenLender === o.key && <span className="b-chip b-chip-green text-[10px] py-0.5">✓ נבחרה</span>}
            </div>
            <span className="text-[12.5px] text-bingo-gray-500 tabular-nums">
              {o.r?.amount ? formatCurrency(o.r.amount) : "—"} · {o.r?.rate ?? "—"}% · {o.r?.months ?? "—"} חודשים
            </span>
          </div>
          {!j.chosenLender && (
            <button onClick={() => chooseLender(o.key)} className="b-pill b-pill-dark b-pill-sm">הלקוח בחר</button>
          )}
        </div>
      ))}
      <VehicleUpsell hasOffers />
    </div>
  );
}
