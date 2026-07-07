"use client";
/**
 * OptionGrid — every choice list in the card, keyboard-first.
 * Chips carry a small kbd number badge; pressing 1-9 selects (single) or
 * toggles (multi) the matching option via the journey keyboard registry.
 */
import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { JourneyContext } from "../useJourney";

interface SingleProps {
  options: readonly string[];
  value: string | undefined | null;
  onChange: (next: string) => void;
  multi?: false;
  size?: "md" | "lg";
  prefilledGlow?: boolean;
}
interface MultiProps {
  options: readonly string[];
  value: string[];
  onChange: (next: string[]) => void;
  multi: true;
  size?: "md" | "lg";
  prefilledGlow?: boolean;
}
type Props = SingleProps | MultiProps;

export function OptionGrid(props: Props) {
  const { options, size = "md", prefilledGlow } = props;
  const ctx = React.useContext(JourneyContext);

  const isSelected = React.useCallback((opt: string) =>
    props.multi ? props.value.includes(opt) : props.value === opt,
  [props]);

  const pick = React.useCallback((opt: string) => {
    if (props.multi) {
      const cur = props.value;
      props.onChange(cur.includes(opt) ? cur.filter((v) => v !== opt) : [...cur, opt]);
    } else {
      props.onChange(opt);
    }
  }, [props]);

  // keep latest handlers in refs so the registry entry stays stable
  const pickRef = React.useRef(pick);
  pickRef.current = pick;
  const satisfiedRef = React.useRef(false);
  satisfiedRef.current = props.multi ? props.value.length > 0 : !!props.value;
  const optionsRef = React.useRef(options);
  optionsRef.current = options;

  React.useEffect(() => {
    if (!ctx) return;
    return ctx.registerOptionGroup({
      applyDigit: (n) => {
        const opt = optionsRef.current[n - 1];
        if (!opt) return false;
        pickRef.current(opt);
        return true;
      },
      isSatisfied: () => satisfiedRef.current,
    });
  }, [ctx]);

  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((opt, i) => {
        const on = isSelected(opt);
        return (
          <button
            key={opt}
            type="button"
            onClick={() => pick(opt)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border font-semibold transition-all",
              size === "lg" ? "px-4 py-2.5 text-[14px]" : "px-3 py-1.5 text-[12.5px]",
              on
                ? "border-bingo-black bg-bingo-black text-white shadow-sm"
                : cn(
                    "border-bingo-gray-150 bg-white text-bingo-gray-600 hover:border-bingo-gray-300 hover:text-bingo-black",
                    prefilledGlow && "border-bingo-green/40 bg-bingo-green-light/20",
                  ),
            )}
          >
            {on && <Check className="size-3.5 text-bingo-green" strokeWidth={3.5} />}
            {opt}
            {i < 9 && (
              <kbd className={cn(
                "hidden sm:inline-flex items-center justify-center rounded-md text-[9.5px] font-bold size-4",
                on ? "bg-white/20 text-white" : "bg-bingo-gray-100 text-bingo-gray-400",
              )}>
                {i + 1}
              </kbd>
            )}
          </button>
        );
      })}
    </div>
  );
}
