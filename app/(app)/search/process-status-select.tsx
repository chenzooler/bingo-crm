"use client";
/**
 * בורר תהליך + סטטוס תלוי — משתתף בטופס ה-GET של החיפוש המתקדם.
 * החלפת תהליך מאפסת את הסטטוס; אופציות הסטטוס נגזרות מהתהליך הנבחר.
 */
import * as React from "react";
import { PROCESSES, processByKey } from "@/lib/yoatsim/processes";

export function ProcessStatusSelect({ process, status }: { process?: string; status?: string }) {
  const [selected, setSelected] = React.useState(process ?? "");
  const [statusValue, setStatusValue] = React.useState(status ?? "");
  const def = selected ? processByKey(selected) : undefined;

  return (
    <>
      <label className="block">
        <span className="text-[11px] font-bold text-bingo-gray-500 mb-1 block">תהליך</span>
        <select
          name="process"
          value={selected}
          onChange={(e) => { setSelected(e.target.value); setStatusValue(""); }}
          className="b-input h-10 text-[13px] cursor-pointer"
        >
          <option value="">כל התהליכים</option>
          {PROCESSES.map((p) => (
            <option key={p.key} value={p.key}>
              {p.emoji} {p.name}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="text-[11px] font-bold text-bingo-gray-500 mb-1 block">סטטוס</span>
        <select
          name="status"
          value={statusValue}
          onChange={(e) => setStatusValue(e.target.value)}
          disabled={!def}
          className="b-input h-10 text-[13px] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <option value="">{def ? "כל הסטטוסים" : "בחר תהליך תחילה"}</option>
          {def?.statuses.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </label>
    </>
  );
}
