"use client";
import * as React from "react";
import { LOAN_PURPOSES } from "@/lib/journey";
import { useJourney } from "../useJourney";
import { Field } from "../controls/Field";
import { OptionGrid } from "../controls/OptionGrid";
import { MoneyInput } from "../controls/MoneyInput";

export function OpeningSection() {
  const { j, patch, prefilled, advance, current } = useJourney();
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
      <Field label="סכום מבוקש" prefilled={prefilled.has("amountRequested")}>
        <MoneyInput
          big
          autoFocus={current === "opening" && !j.amountRequested}
          placeholder="100,000"
          value={j.amountRequested}
          onChange={(v) => patch({ amountRequested: v })}
          onCommit={() => { if (j.amountRequested && j.loanPurpose) advance(); }}
        />
      </Field>
      <Field label="מטרת ההלוואה" prefilled={prefilled.has("loanPurpose")}>
        <OptionGrid
          options={LOAN_PURPOSES}
          value={j.loanPurpose}
          onChange={(v) => patch({ loanPurpose: v })}
          size="lg"
        />
      </Field>
    </div>
  );
}
