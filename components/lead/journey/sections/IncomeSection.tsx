"use client";
import * as React from "react";
import { EMPLOYMENT_OPTIONS } from "@/lib/journey";
import { useJourney } from "../useJourney";
import { Field } from "../controls/Field";
import { OptionGrid } from "../controls/OptionGrid";
import { MoneyInput } from "../controls/MoneyInput";
import { YesNoSegment } from "../controls/YesNoSegment";

export function IncomeSection() {
  const { j, patch, prefilled } = useJourney();
  const married = j.maritalStatus === "נשוי/אה" || j.maritalStatus === "ידוע/ה בציבור";
  return (
    <div className="space-y-5">
      <Field label="תעסוקה" prefilled={prefilled.has("employment")}>
        <OptionGrid options={EMPLOYMENT_OPTIONS} value={j.employment} onChange={(v) => patch({ employment: v })} size="lg" />
      </Field>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <Field label="הכנסה חודשית נטו" prefilled={prefilled.has("monthlyIncome")}>
          <MoneyInput big placeholder="12,000" value={j.monthlyIncome} onChange={(v) => patch({ monthlyIncome: v })} />
        </Field>
        {married && (
          <Field label="הכנסת בן/בת זוג" prefilled={prefilled.has("spouseIncome")}>
            <MoneyInput big placeholder="8,000" value={j.spouseIncome} onChange={(v) => patch({ spouseIncome: v })} />
          </Field>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <Field label="מקום עבודה + תפקיד" prefilled={prefilled.has("employerAndRole")}>
          <input className="b-input" placeholder="חברת חשמל · טכנאי"
            value={j.employerAndRole || ""} onChange={(e) => patch({ employerAndRole: e.target.value })} />
        </Field>
        <Field label="ותק (שנים)" prefilled={prefilled.has("seniorityYears")}>
          <input className="b-input" inputMode="decimal" placeholder="3"
            value={j.seniorityYears || ""} onChange={(e) => patch({ seniorityYears: e.target.value })} />
        </Field>
        <Field label="הכנסות נוספות" prefilled={prefilled.has("additionalIncome")}>
          <input className="b-input" placeholder="שכירות, קצבה..."
            value={j.additionalIncome || ""} onChange={(e) => patch({ additionalIncome: e.target.value })} />
        </Field>
      </div>

      <div className="rounded-2xl border border-bingo-gray-150 p-3.5 space-y-3">
        <Field label="קרן פנסיה / השתלמות?">
          <YesNoSegment value={j.hasPension ?? null} onChange={(v) => patch({ hasPension: v })} yesLabel="יש" noLabel="אין" />
        </Field>
        {j.hasPension === "yes" && (
          <div className="grid grid-cols-2 gap-3.5 animate-fade-in">
            <Field label="חברה מנהלת">
              <input className="b-input" placeholder="מגדל / הראל..."
                value={j.pensionCompany || ""} onChange={(e) => patch({ pensionCompany: e.target.value })} />
            </Field>
            <Field label="סכום משוער">
              <MoneyInput placeholder="150,000" value={j.pensionAmount} onChange={(v) => patch({ pensionAmount: v })} />
            </Field>
          </div>
        )}
      </div>
    </div>
  );
}
