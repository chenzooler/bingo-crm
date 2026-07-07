"use client";
import * as React from "react";
import { MARITAL_OPTIONS } from "@/lib/journey";
import { useJourney } from "../useJourney";
import { Field } from "../controls/Field";
import { OptionGrid } from "../controls/OptionGrid";

export function PersonalSection() {
  const { j, patch, prefilled } = useJourney();
  return (
    <div className="space-y-5">
      <Field label="מצב משפחתי" prefilled={prefilled.has("maritalStatus")}>
        <OptionGrid options={MARITAL_OPTIONS} value={j.maritalStatus} onChange={(v) => patch({ maritalStatus: v })} size="lg" />
      </Field>
      <div className="grid grid-cols-2 gap-3.5">
        <Field label="ילדים מתחת ל-18" prefilled={prefilled.has("children")}>
          <input className="b-input" inputMode="numeric" placeholder="0"
            value={j.children || ""} onChange={(e) => patch({ children: e.target.value })} />
        </Field>
        <Field label="תאריך הנפקת ת.ז">
          <input className="b-input" type="date"
            value={j.idIssueDate || ""} onChange={(e) => patch({ idIssueDate: e.target.value })} />
        </Field>
      </div>
    </div>
  );
}
