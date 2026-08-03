"use client";
/**
 * שלב 1 — פתיחה: שם פרטי + משפחה, מטרת ההלוואה + סכום מבוקש.
 */
import type { ClassicCardState } from "@/components/classic/useClassicCard";
import { LOAN_PURPOSES_YOATSIM } from "@/lib/yoatsim/card-schema";
import { Field, MoneyInput, str } from "./shared";

export function Step1Opening({ state }: { state: ClassicCardState }) {
  const v = state.values;
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="שם פרטי">
          <input
            className="b-input w-full"
            value={str(v.firstName)}
            onChange={(e) => state.set("firstName", e.target.value)}
            autoComplete="off"
          />
        </Field>
        <Field label="שם משפחה">
          <input
            className="b-input w-full"
            value={str(v.lastName)}
            onChange={(e) => state.set("lastName", e.target.value)}
            autoComplete="off"
          />
        </Field>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="מטרת ההלוואה">
          <select
            className="b-input w-full appearance-none cursor-pointer"
            value={str(v.loanPurpose)}
            onChange={(e) => state.set("loanPurpose", e.target.value)}
          >
            <option value="">בחירת מטרה</option>
            {LOAN_PURPOSES_YOATSIM.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </Field>
        <Field label="סכום מבוקש">
          <MoneyInput
            value={str(v.amountRequested)}
            onChange={(raw) => state.set("amountRequested", raw)}
            placeholder="50,000"
          />
        </Field>
      </div>
    </div>
  );
}
