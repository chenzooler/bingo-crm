"use client";
/**
 * שלב 3 — הסתעפות חיווי שלילי: שאלת הרכב הגדולה.
 * חיווי שלילי אינו סוף הדרך — רכב בבעלות פותח מסלול הלוואה כנגד רכב.
 */
import type { ClassicCardState } from "@/components/classic/useClassicCard";
import { ChoicePills, str } from "./shared";

export function Step3Vehicle({ state }: { state: ClassicCardState }) {
  const v = state.values;
  return (
    <div className="space-y-5">
      <div>
        <p className="text-[26px] leading-[1.25] font-bold text-bingo-black">
          האם יש בבעלותך <span className="ep-mark">רכב</span>?
        </p>
        <p className="text-[13px] text-bingo-gray-500 mt-2">
          החיווי יצא שלילי - רכב בבעלות פותח מסלול הלוואה כנגד רכב
        </p>
      </div>
      <ChoicePills
        options={["כן", "כן משועבד", "לא"]}
        value={str(v.hasVehicleRaw)}
        onChange={(stored) => state.set("hasVehicleRaw", stored)}
      />
    </div>
  );
}
