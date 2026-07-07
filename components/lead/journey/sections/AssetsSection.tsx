"use client";
import * as React from "react";
import { Car } from "lucide-react";
import { PROPERTY_OPTIONS } from "@/lib/journey";
import { useJourney } from "../useJourney";
import { Field } from "../controls/Field";
import { OptionGrid } from "../controls/OptionGrid";
import { YesNoSegment } from "../controls/YesNoSegment";

export function AssetsSection() {
  const { j, patch, prefilled } = useJourney();
  return (
    <div className="space-y-5">
      <Field label="מגורים / דירה" prefilled={prefilled.has("hasProperty")}>
        <OptionGrid options={PROPERTY_OPTIONS} value={j.hasProperty} onChange={(v) => patch({ hasProperty: v })} size="lg" />
      </Field>

      <div className="rounded-2xl border-2 border-bingo-blue/25 bg-status-blue-soft/30 p-4 space-y-3">
        <div className="flex items-center gap-2">
          <span className="b-icon b-icon-blue size-8"><Car className="size-4" /></span>
          <div>
            <p className="text-[13.5px] font-bold text-bingo-black">רכב בבעלות?</p>
            <p className="text-[11px] text-bingo-gray-500">הרכב הוא הגיבוי — תמיד לשאול, גם אם הכל תקין</p>
          </div>
        </div>
        <YesNoSegment value={j.hasVehicle} onChange={(v) => patch({ hasVehicle: v })} yesLabel="כן, יש רכב" noLabel="אין רכב" />
        {j.hasVehicle === "yes" && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 animate-fade-in">
            <Field label="שנת ייצור" prefilled={prefilled.has("vehicleYear")}>
              <input className="b-input" inputMode="numeric" placeholder="2020"
                value={j.vehicleYear || ""} onChange={(e) => patch({ vehicleYear: e.target.value })} />
            </Field>
            <Field label="יצרן ודגם" prefilled={prefilled.has("vehicleMake")}>
              <input className="b-input" placeholder="טויוטה קורולה"
                value={j.vehicleMake || ""} onChange={(e) => patch({ vehicleMake: e.target.value })} />
            </Field>
            <Field label="נקי משעבוד?">
              <div className="b-segment w-full">
                <button type="button" className="flex-1" data-active={j.vehicleFree === "yes"} onClick={() => patch({ vehicleFree: "yes" })}>נקי</button>
                <button type="button" className="flex-1" data-active={j.vehicleFree === "no"} onClick={() => patch({ vehicleFree: "no" })}>משועבד</button>
              </div>
            </Field>
          </div>
        )}
      </div>
    </div>
  );
}
