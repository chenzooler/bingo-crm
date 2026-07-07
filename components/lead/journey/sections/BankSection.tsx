"use client";
import * as React from "react";
import { useJourney } from "../useJourney";
import { Field } from "../controls/Field";

export function BankSection() {
  const { j, patch, prefilled } = useJourney();
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
      <Field label="בנק" prefilled={prefilled.has("bankName")}>
        <input className="b-input" placeholder="הפועלים"
          value={j.bankName || ""} onChange={(e) => patch({ bankName: e.target.value })} />
      </Field>
      <Field label="סניף" prefilled={prefilled.has("bankBranch")}>
        <input className="b-input" inputMode="numeric" placeholder="612"
          value={j.bankBranch || ""} onChange={(e) => patch({ bankBranch: e.target.value })} />
      </Field>
      <Field label="מספר חשבון" prefilled={prefilled.has("bankAccount")}>
        <input className="b-input" inputMode="numeric" placeholder="123456"
          value={j.bankAccount || ""} onChange={(e) => patch({ bankAccount: e.target.value })} />
      </Field>
    </div>
  );
}
