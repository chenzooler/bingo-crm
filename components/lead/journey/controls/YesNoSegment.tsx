"use client";
import * as React from "react";
import type { YesNo } from "@/lib/journey";
import { JourneyContext } from "../useJourney";

/** yes/no segmented control, registered on the keyboard registry (1=yes, 2=no) */
export function YesNoSegment({ value, onChange, yesLabel = "כן", noLabel = "לא" }: {
  value: YesNo;
  onChange: (v: "yes" | "no") => void;
  yesLabel?: string;
  noLabel?: string;
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
        if (n === 1) { onChangeRef.current("yes"); return true; }
        if (n === 2) { onChangeRef.current("no"); return true; }
        return false;
      },
      isSatisfied: () => valueRef.current !== null,
    });
  }, [ctx]);

  return (
    <div className="b-segment w-full">
      <button type="button" className="flex-1" data-active={value === "yes"} onClick={() => onChange("yes")}>
        {yesLabel} <kbd className="hidden sm:inline text-[9px] opacity-50">1</kbd>
      </button>
      <button type="button" className="flex-1" data-active={value === "no"} onClick={() => onChange("no")}>
        {noLabel} <kbd className="hidden sm:inline text-[9px] opacity-50">2</kbd>
      </button>
    </div>
  );
}
