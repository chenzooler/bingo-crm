"use client";
/**
 * IndicatorSection — the traffic-light moment (the "smiley" checks).
 * Two rows of three big circles: the automatic indicator (external screening)
 * and the rep's manual one. Selecting yellow/red anywhere triggers the
 * vehicle pivot (handled by JourneyCard via needsVehicleAnswer).
 */
import * as React from "react";
import { Bot, UserCheck } from "lucide-react";
import type { Smiley } from "@/lib/journey";
import { GENDER_OPTIONS } from "@/lib/journey";
import { cn } from "@/lib/utils";
import { useJourney, JourneyContext } from "../useJourney";
import { Field } from "../controls/Field";
import { OptionGrid } from "../controls/OptionGrid";

const LIGHTS: Array<{ v: Exclude<Smiley, null>; label: string; ring: string; fill: string; glow: string }> = [
  { v: "green",  label: "ירוק",  ring: "border-bingo-green",   fill: "bg-bingo-green",   glow: "shadow-[0_0_24px_rgba(80,255,10,0.45)]" },
  { v: "yellow", label: "צהוב", ring: "border-status-yellow", fill: "bg-status-yellow", glow: "shadow-[0_0_24px_rgba(255,200,0,0.45)]" },
  { v: "red",    label: "אדום",  ring: "border-status-red",    fill: "bg-status-red",    glow: "shadow-[0_0_24px_rgba(255,60,60,0.4)]" },
];

function TrafficLight({ value, onChange, label, icon }: {
  value: Smiley;
  onChange: (v: Exclude<Smiley, null>) => void;
  label: string;
  icon: React.ReactNode;
}) {
  const ctx = React.useContext(JourneyContext);
  const onChangeRef = React.useRef(onChange);
  onChangeRef.current = onChange;
  const valueRef = React.useRef(value);
  valueRef.current = value;

  React.useEffect(() => {
    if (!ctx) return;
    return ctx.registerOptionGroup({
      applyDigit: (n) => {
        const light = LIGHTS[n - 1];
        if (!light) return false;
        onChangeRef.current(light.v);
        return true;
      },
      isSatisfied: () => valueRef.current !== null,
    });
  }, [ctx]);

  return (
    <div className="flex items-center gap-4 flex-wrap">
      <div className="flex items-center gap-2 w-40 shrink-0">
        <span className="b-icon b-icon-gray size-8">{icon}</span>
        <span className="text-[13px] font-bold text-bingo-black">{label}</span>
      </div>
      <div className="flex items-center gap-3">
        {LIGHTS.map((l, i) => {
          const on = value === l.v;
          return (
            <button
              key={l.v}
              type="button"
              onClick={() => onChange(l.v)}
              aria-label={`${label}: ${l.label}`}
              className={cn(
                "relative size-[72px] rounded-full border-4 transition-all duration-200 flex items-center justify-center",
                on ? cn(l.ring, l.glow, "scale-110") : "border-bingo-gray-150 hover:border-bingo-gray-300",
              )}
            >
              <span className={cn(
                "size-[46px] rounded-full transition-all",
                l.fill,
                on ? "opacity-100" : "opacity-25",
              )} />
              <kbd className="absolute -bottom-5 text-[10px] font-bold text-bingo-gray-400 hidden sm:block">{i + 1}</kbd>
            </button>
          );
        })}
      </div>
      <span className={cn(
        "b-chip text-[11px]",
        value === "green" ? "b-chip-green" : value === "yellow" ? "b-chip-orange" : value === "red" ? "b-chip-red" : "b-chip-gray",
      )}>
        {value === null ? "טרם נבדק" : LIGHTS.find((l) => l.v === value)!.label}
      </span>
    </div>
  );
}

export function IndicatorSection() {
  const { j, patch, prefilled } = useJourney();
  return (
    <div className="space-y-7">
      {/* consent */}
      <label className="flex items-center gap-2.5 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={j.bdiApproved}
          onChange={(e) => patch({ bdiApproved: e.target.checked })}
          className="size-5 accent-[#292929]"
        />
        <span className="text-[13.5px] font-semibold text-bingo-black">
          הלקוח אישר בדיקת חיווי אשראי
        </span>
      </label>

      {/* the two traffic lights */}
      <div className="space-y-8 py-2">
        <TrafficLight
          label="סמיילי אוטומטי"
          icon={<Bot className="size-4" />}
          value={j.smileyAuto}
          onChange={(v) => patch({ smileyAuto: v })}
        />
        <TrafficLight
          label="סמיילי ידני (שלך)"
          icon={<UserCheck className="size-4" />}
          value={j.smileyManual}
          onChange={(v) => patch({ smileyManual: v })}
        />
      </div>

      {/* identity as registered in the screening system */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 pt-1 border-t border-bingo-gray-100">
        <Field label="תעודת זהות" prefilled={prefilled.has("idNumber")}>
          <input className="b-input" inputMode="numeric" dir="ltr" style={{ textAlign: "right" }}
            value={j.idNumber || ""} onChange={(e) => patch({ idNumber: e.target.value })} />
        </Field>
        <Field label="שם פרטי (כפי שרשום)" prefilled={prefilled.has("smileyFirstName")}>
          <input className="b-input" value={j.smileyFirstName || ""} onChange={(e) => patch({ smileyFirstName: e.target.value })} />
        </Field>
        <Field label="שם משפחה (כפי שרשום)" prefilled={prefilled.has("smileyLastName")}>
          <input className="b-input" value={j.smileyLastName || ""} onChange={(e) => patch({ smileyLastName: e.target.value })} />
        </Field>
        <Field label="תאריך לידה" prefilled={prefilled.has("birthDate")}>
          <input className="b-input" type="date" value={j.birthDate || ""} onChange={(e) => patch({ birthDate: e.target.value })} />
        </Field>
      </div>
      <Field label="מין" prefilled={prefilled.has("gender")}>
        <OptionGrid options={GENDER_OPTIONS} value={j.gender} onChange={(v) => patch({ gender: v })} />
      </Field>
    </div>
  );
}
