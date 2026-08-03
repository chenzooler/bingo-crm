"use client";
/**
 * שלב 4 — זיהוי ובדיקת רמזור. רגע השיא של השיחה: נקי וממוקד.
 * מין + תאריך לידה → הקראת נוסח ההסכמה → הרמזור עצמו
 * (אוטומציה אם שודרה, אחרת בחירה ידנית) → שורת התוצאה מהקטלוג.
 */
import * as React from "react";
import type { ClassicCardState } from "@/components/classic/useClassicCard";
import type { CatalogResult } from "@/lib/catalog";
import { CLIENT_COLOR_META } from "@/lib/catalog";
import { Ramzor } from "@/components/ui/Ramzor";
import { ChoicePills, Field, str, toRamzor, ramzorToDb } from "./shared";
import { ShieldCheck } from "lucide-react";

const CONSENT_LINE =
  "אני מבקש את אישורך לבצע בדיקה על נתוני האשראי שלך במאגר BDI - הבדיקה אינה כרוכה בעלות ואינה מחייבת";

export function Step4Ramzor({ state, catalog }: { state: ClassicCardState; catalog: CatalogResult }) {
  const v = state.values;
  const consentGiven = str(v.bdiClientApproval) === "green";
  const autoValue = toRamzor(v.smileyAuto);
  const manualValue = toRamzor(v.smileyManual);
  const shown = manualValue ?? autoValue; // הידני גובר — כמו בקטלוג

  const confirmConsent = () => {
    state.set("bdiClientApproval", "green");
    state.addNote("system", "הלקוח אישר בדיקת רמזור במאגר BDI - הוקרא הנוסח");
  };

  const colorMeta = catalog.clientColor ? CLIENT_COLOR_META[catalog.clientColor] : null;
  const noTrack = catalog.ramzor !== null && !catalog.tracks.general && !catalog.tracks.vehicle;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="מין">
          <ChoicePills
            options={["זכר", "נקבה"]}
            value={str(v.gender)}
            onChange={(stored) => state.set("gender", stored)}
          />
        </Field>
        <Field label="תאריך לידה">
          <input
            type="date"
            dir="ltr"
            className="b-input w-full tabular-nums"
            value={str(v.birthDate)}
            onChange={(e) => state.set("birthDate", e.target.value)}
          />
        </Field>
      </div>

      {/* נוסח ההסכמה — מקריאים ללקוח */}
      <div className="rounded-[16px] bg-bingo-gray-50 p-5">
        <div className="flex items-start gap-3">
          <span className="w-8 h-8 rounded-full bg-bingo-gray-100 text-bingo-gray-600 flex items-center justify-center shrink-0">
            <ShieldCheck size={16} strokeWidth={1.75} />
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-semibold text-bingo-gray-500 mb-1.5">מקריאים ללקוח</p>
            <p className="text-[15px] leading-relaxed text-bingo-black">"{CONSENT_LINE}"</p>
            {consentGiven ? (
              <p className="text-[13px] font-semibold text-bingo-green-deep mt-3">הלקוח אישר את הבדיקה</p>
            ) : (
              <button
                type="button"
                onClick={confirmConsent}
                className="b-pill-dark min-h-[44px] px-6 text-[13px] mt-4"
              >
                הלקוח אישר
              </button>
            )}
          </div>
        </div>
      </div>

      {/* הרמזור — נחשף אחרי אישור (או כשכבר יש תוצאה) */}
      {(consentGiven || shown !== null) && (
        <div className="flex flex-col items-center gap-3 py-2 v4p1-enter">
          <Ramzor
            value={shown}
            size="md"
            orientation="horizontal"
            onSelect={autoValue === null
              ? (c) => state.set("smileyManual", ramzorToDb(c))
              : undefined}
          />
          <p className="text-[13px] text-bingo-gray-500">
            {autoValue !== null
              ? "הבדיקה משודרת באוטומציה"
              : shown === null
                ? "אין תוצאה אוטומטית - בחר את הצבע לפי תוצאת הבדיקה"
                : "נקבע ידנית לפי תוצאת הבדיקה"}
          </p>
          {/* תוצאת הקטלוג */}
          {catalog.ramzor !== null && (
            <div className="text-center v4p1-enter" aria-live="polite">
              <span
                className="inline-block text-[14px] font-bold px-5 py-1.5 rounded-full"
                style={colorMeta
                  ? { background: colorMeta.bg, color: colorMeta.hex }
                  : undefined}
              >
                {catalog.label}
              </span>
              <p className="text-[13px] text-bingo-gray-500 mt-2">{catalog.hint}</p>
              {noTrack && (
                <p className="text-[13px] text-bingo-gray-600 mt-2">
                  אין מסלול מתאים כרגע - מסכמים את השיחה ברוגע ומתעדים בכרטיס
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
