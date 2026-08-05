"use client";
/**
 * שלב 4 — זיהוי ובדיקת רמזור. רגע השיא של השיחה: הבמה הכהה.
 * מין + תאריך לידה על הזכוכית → אי אובסידיאן: הקראת נוסח ההסכמה,
 * הרמזור במרכז הבמה, וכשהתוצאה נוחתת — הבזק ליים סביבתי חד-פעמי
 * ושורת פסק הדין (ירוק = ניאון, אדום = אדום רך).
 */
import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { ClassicCardState } from "@/components/classic/useClassicCard";
import type { CatalogResult } from "@/lib/catalog";
import { CLIENT_COLOR_META } from "@/lib/catalog";
import { Ramzor } from "@/components/ui/Ramzor";
import { ChoicePills, Field, str, toRamzor, ramzorToDb } from "./shared";
import { Icon3D } from "./ep";

const CONSENT_LINE =
  "אני מבקש את אישורך לבצע בדיקה על נתוני האשראי שלך במאגר BDI - הבדיקה אינה כרוכה בעלות ואינה מחייבת";

/** ספרת ביקורת של תעודת זהות ישראלית (וריאנט Luhn) — אזהרה רכה בלבד */
function isValidIsraeliId(id: string): boolean {
  if (!/^\d{9}$/.test(id)) return false;
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    let n = Number(id[i]) * (i % 2 === 0 ? 1 : 2);
    if (n > 9) n -= 9;
    sum += n;
  }
  return sum % 10 === 0;
}

export function Step4Ramzor({ state, catalog }: { state: ClassicCardState; catalog: CatalogResult }) {
  const v = state.values;
  const rm = useReducedMotion();
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

  /* הבזק הליים — נורה פעם אחת כשהתוצאה נוחתת (null → צבע) */
  const prevRamzor = React.useRef(catalog.ramzor);
  const [flareKey, setFlareKey] = React.useState(0);
  React.useEffect(() => {
    if (prevRamzor.current === null && catalog.ramzor !== null) setFlareKey((k) => k + 1);
    prevRamzor.current = catalog.ramzor;
  }, [catalog.ramzor]);

  const verdictColor =
    catalog.ramzor === "green" ? "#50ff0a"
      : catalog.ramzor === "red" ? "#ff9e8f"
        : colorMeta?.hex ?? "#fafaf9";

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Field label="תעודת זהות">
          <input
            inputMode="numeric"
            dir="ltr"
            maxLength={9}
            pattern="[0-9]*"
            className="b-input ep-input w-full tabular-nums"
            placeholder="9 ספרות"
            value={str(v.idNumber)}
            onChange={(e) => state.set("idNumber", e.target.value.replace(/\D/g, ""))}
          />
          {str(v.idNumber).length === 9 && !isValidIsraeliId(str(v.idNumber)) && (
            <p className="text-[12px] text-[#C87413] mt-1.5">מספר לא תקין - בדוק שוב</p>
          )}
        </Field>
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
            className="b-input ep-input w-full tabular-nums"
            value={str(v.birthDate)}
            onChange={(e) => state.set("birthDate", e.target.value)}
          />
        </Field>
      </div>

      {/* אי האובסידיאן — הבמה הכהה של הרמזור */}
      <div className="ep-island relative overflow-hidden p-6">
        {/* ההבזק בצבע הלקוח — לא ליים קבוע; אדום לא חוגג (מטופל ב-CSS) */}
        {flareKey > 0 && !rm && catalog.clientColor && (
          <span className="epv5-aura" key={`${flareKey}-${catalog.clientColor}`} aria-hidden />
        )}

        <div className="relative space-y-5">
          {/* נוסח ההסכמה — מקריאים ללקוח */}
          <div className="flex items-start gap-3">
            <Icon3D name="ramzor" size={44} />
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-semibold text-white/50 mb-1.5">מקריאים ללקוח</p>
              <p className="text-[15px] leading-relaxed text-[#FAFAF9]">"{CONSENT_LINE}"</p>
              {consentGiven ? (
                <p className="text-[13px] font-semibold mt-3" style={{ color: "#b7f7a1" }}>
                  הלקוח אישר את הבדיקה
                </p>
              ) : (
                <button
                  type="button"
                  onClick={confirmConsent}
                  className="min-h-[44px] px-6 mt-4 rounded-full text-[13px] font-semibold bg-white/10 border border-white/20 text-white hover:bg-white/15 transition-colors"
                >
                  הלקוח אישר
                </button>
              )}
            </div>
          </div>

          {/* הרמזור — מרכז הבמה, נחשף אחרי אישור (או כשכבר יש תוצאה) */}
          {(consentGiven || shown !== null) && (
            <div className="flex flex-col items-center gap-3 py-2 v4p1-enter">
              <Ramzor
                value={shown}
                size={shown !== null ? "lg" : "md"}
                orientation="horizontal"
                onSelect={autoValue === null
                  ? (c) => state.set("smileyManual", ramzorToDb(c))
                  : undefined}
              />
              <p className="text-[13px] text-white/55">
                {autoValue !== null
                  ? "הבדיקה משודרת באוטומציה"
                  : shown === null
                    ? "אין תוצאה אוטומטית - בחר את הצבע לפי תוצאת הבדיקה"
                    : "נקבע ידנית לפי תוצאת הבדיקה"}
              </p>
              {/* סצנת פסק-הדין — 30px, בצבע הלקוח (רגע חתימה 1ב) */}
              {catalog.ramzor !== null && (
                <div className="text-center v4p1-enter" aria-live="polite">
                  <span className="epv5-scene-verdict" style={{ color: verdictColor }}>
                    {catalog.label}
                  </span>
                  <p className="epv5-scene-hint mt-2">{catalog.hint}</p>
                  {noTrack && (
                    <p className="text-[13px] text-white/70 mt-2">
                      אין מסלול מתאים כרגע - מסכמים את השיחה ברוגע ומתעדים בכרטיס
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
