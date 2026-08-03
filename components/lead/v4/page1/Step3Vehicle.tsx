"use client";
/**
 * שלב 3 — הסתעפות חיווי שלילי: שאלת הרכב הגדולה.
 * חיווי שלילי אינו סוף הדרך — רכב בבעלות פותח מסלול הלוואה כנגד רכב.
 */
import type { ClassicCardState } from "@/components/classic/useClassicCard";
import { ChoicePills, str } from "./shared";
import { Car } from "lucide-react";

export function Step3Vehicle({ state }: { state: ClassicCardState }) {
  const v = state.values;
  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3">
        <span className="w-9 h-9 rounded-full bg-bingo-gray-100 text-bingo-gray-600 flex items-center justify-center shrink-0">
          <Car size={18} strokeWidth={1.75} />
        </span>
        <div>
          <p className="text-[17px] font-bold text-bingo-black">האם יש בבעלותך רכב?</p>
          <p className="text-[13px] text-bingo-gray-500 mt-1">
            החיווי יצא שלילי - רכב בבעלות פותח מסלול הלוואה כנגד רכב
          </p>
        </div>
      </div>
      <ChoicePills
        options={["כן", "כן משועבד", "לא"]}
        value={str(v.hasVehicleRaw)}
        onChange={(stored) => state.set("hasVehicleRaw", stored)}
      />
    </div>
  );
}
