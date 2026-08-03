"use client";
/**
 * שלב 5 — תעסוקה, נכס וכתובת מגורים.
 * עיר ורחוב בהשלמה אוטומטית מול ‎/api/geo, מיקוד מתמלא לבד
 * כשעיר+רחוב+בית מלאים. כשל בספק — הכל נשאר קלט חופשי.
 */
import * as React from "react";
import type { ClassicCardState } from "@/components/classic/useClassicCard";
import { EMPLOYMENT_Y } from "@/lib/yoatsim/card-schema";
import { AutocompleteInput, type AcSuggestion } from "./AutocompleteInput";
import { ChoicePills, Field, str } from "./shared";

async function fetchCities(q: string): Promise<AcSuggestion[]> {
  const res = await fetch(`/api/geo/cities?q=${encodeURIComponent(q)}`);
  if (!res.ok) throw new Error("cities unavailable");
  const data = await res.json();
  return (data.cities ?? []) as AcSuggestion[];
}

export function Step5Address({ state }: { state: ClassicCardState }) {
  const v = state.values;
  // cityCode נשמר לפעמים כמספר — str() מחזירה "" למספרים, לכן ממירים במפורש
  const cityCode = v.cityCode == null || v.cityCode === "" ? "" : String(v.cityCode);
  const [zipAuto, setZipAuto] = React.useState(false);
  const zipTried = React.useRef<string>("");

  const fetchStreets = React.useCallback(async (q: string): Promise<AcSuggestion[]> => {
    if (!cityCode) return [];
    const res = await fetch(`/api/geo/streets?city=${encodeURIComponent(cityCode)}&q=${encodeURIComponent(q)}`);
    if (!res.ok) throw new Error("streets unavailable");
    const data = await res.json();
    return (data.streets ?? []) as AcSuggestion[];
  }, [cityCode]);

  /* מזהה הרחוב האחרון שנבחר — לשליפת המיקוד (לא נשמר בכרטיס) */
  const streetCode = React.useRef<string>("");

  /* מיקוד אוטומטי: עיר+רחוב+בית מלאים ואין עדיין מיקוד */
  const city = str(v.city);
  const address = str(v.address);
  const houseNum = str(v.houseNum);
  const zip = str(v.zip);

  React.useEffect(() => {
    if (!cityCode || !address || !houseNum || zip) return;
    const sig = `${cityCode}|${streetCode.current || address}|${houseNum}`;
    if (zipTried.current === sig) return;
    // הסימון קורה רק כשהבקשה באמת יוצאת — רינדור מחדש לפני 600ms מתזמן טיימר חדש
    const t = setTimeout(async () => {
      zipTried.current = sig;
      try {
        // שם הרחוב ולא הקוד - לדואר ישראל מזהי רחובות משלו, השם הוא המשותף
        const params = new URLSearchParams({
          city: cityCode,
          street: address,
          house: houseNum,
        });
        const res = await fetch(`/api/geo/zip?${params.toString()}`);
        if (!res.ok) return;
        const data = await res.json();
        if (data.zip) {
          state.set("zip", String(data.zip));
          setZipAuto(true);
        }
      } catch { /* ספק לא זמין — נשאר ידני */ }
    }, 600);
    return () => clearTimeout(t);
  }, [cityCode, address, houseNum, zip, state]);

  return (
    <div className="space-y-5">
      <Field label="מצב תעסוקתי">
        <ChoicePills
          options={[...EMPLOYMENT_Y]}
          value={str(v.employment)}
          onChange={(stored) => state.set("employment", stored)}
        />
      </Field>

      <Field label="נכס בבעלות">
        <ChoicePills
          options={[
            { label: "יש נכס", store: "יש" },
            { label: "אין נכס", store: "אין" },
          ]}
          value={str(v.hasProperty)}
          onChange={(stored) => state.set("hasProperty", stored)}
        />
      </Field>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="עיר מגורים">
          <AutocompleteInput
            value={city}
            placeholder="הקלדה לחיפוש עיר"
            onText={(text) => {
              state.set("city", text);
              if (text !== city) state.set("cityCode", "");
            }}
            onPick={(s) => {
              state.set("city", s.name);
              state.set("cityCode", s.code != null ? String(s.code) : "");
              streetCode.current = "";
            }}
            fetcher={fetchCities}
          />
        </Field>
        <Field label="רחוב">
          <AutocompleteInput
            value={address}
            placeholder={cityCode ? "הקלדה לחיפוש רחוב" : "רחוב (בחירת עיר תפעיל חיפוש)"}
            onText={(text) => state.set("address", text)}
            onPick={(s) => {
              state.set("address", s.name);
              streetCode.current = s.code != null ? String(s.code) : "";
            }}
            fetcher={fetchStreets}
          />
        </Field>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Field label="מספר בית">
          <input
            inputMode="numeric"
            dir="ltr"
            className="b-input w-full tabular-nums text-start"
            value={houseNum}
            onChange={(e) => state.set("houseNum", e.target.value)}
          />
        </Field>
        <Field label="מיקוד" className="sm:col-span-2">
          <div>
            <input
              inputMode="numeric"
              dir="ltr"
              className="b-input w-full tabular-nums text-start"
              value={zip}
              onChange={(e) => { setZipAuto(false); state.set("zip", e.target.value.replace(/[^\d]/g, "")); }}
            />
            {zipAuto && zip && (
              <p className="text-[12px] text-bingo-green-deep mt-1.5">אומת אוטומטית</p>
            )}
          </div>
        </Field>
      </div>
    </div>
  );
}
