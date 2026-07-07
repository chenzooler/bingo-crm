"use client";
import * as React from "react";
import { AlertTriangle } from "lucide-react";
import { CREDIT_CARD_OPTIONS, CARD_LIMIT_OPTIONS, CHECKED_BEFORE_OPTIONS } from "@/lib/journey";
import { useJourney } from "../useJourney";
import { Field } from "../controls/Field";
import { OptionGrid } from "../controls/OptionGrid";

export function CreditSection() {
  const { j, patch, prefilled } = useJourney();
  const noCard = j.creditCards.includes("אין כרטיס בכלל");
  const lowLimit = j.cardLimit === "עד 5,000 ש\"ח";

  return (
    <div className="space-y-5">
      <Field label="אילו כרטיסי אשראי יש ללקוח? (אפשר כמה)" prefilled={prefilled.has("creditCards")}>
        <OptionGrid
          multi
          options={CREDIT_CARD_OPTIONS}
          value={j.creditCards}
          onChange={(v) => patch({ creditCards: v })}
          size="lg"
        />
        {noCard && (
          <p className="mt-2 text-[12px] font-semibold text-status-orange flex items-center gap-1">
            <AlertTriangle className="size-3.5" /> אין כרטיס אשראי — פוסל מסלול כל מטרה
          </p>
        )}
      </Field>

      <Field label="גובה המסגרת" prefilled={prefilled.has("cardLimit")}>
        <OptionGrid
          options={CARD_LIMIT_OPTIONS}
          value={j.cardLimit}
          onChange={(v) => patch({ cardLimit: v })}
          size="lg"
        />
        {lowLimit && (
          <p className="mt-2 text-[12px] font-semibold text-status-orange flex items-center gap-1">
            <AlertTriangle className="size-3.5" /> מסגרת עד 5,000 ₪ — פוסל מסלול כל מטרה
          </p>
        )}
      </Field>

      <Field label="בדק כבר במקום אחר? (אפשר כמה)" prefilled={prefilled.has("checkedBefore")}>
        <OptionGrid
          multi
          options={CHECKED_BEFORE_OPTIONS}
          value={j.checkedBefore}
          onChange={(v) => patch({ checkedBefore: v })}
        />
      </Field>

      <Field label="הערות אשראי">
        <input
          className="b-input"
          placeholder="פרטים נוספים מהשיחה..."
          value={j.creditNotes || ""}
          onChange={(e) => patch({ creditNotes: e.target.value })}
        />
      </Field>
    </div>
  );
}
