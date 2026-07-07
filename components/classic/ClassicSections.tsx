"use client";
/**
 * ClassicSection — סקשן בודד של כרטיס הלקוח, משותף לכרטיס הקלאסי ולקוקפיט
 * (מצב "תיק מלא"). חולץ מ-ClassicLeadCard בלי לשנות התנהגות, ועכשיו עם
 * חומרי Premium v2: רקע פסטל עדין קבוע לכל סקשן + אייקון קו בצ'יפ זכוכית.
 */
import * as React from "react";
import {
  ChevronDown, ChevronUp, HandCoins, ShieldCheck, Gauge, UserRound, Wallet,
  Home, Car, Landmark, CreditCard, Building2, Calculator, Megaphone,
  FileSignature, type LucideIcon,
} from "lucide-react";
import type { SectionDef } from "@/lib/yoatsim/card-schema";
import type { ClassicValues } from "@/lib/yoatsim/values";
import { cn } from "@/lib/utils";
import { GlassIcon } from "@/components/ui/GlassIcon";
import type { ClassicCardState } from "./useClassicCard";
import { FieldRenderer, fieldVisible } from "./FieldRenderer";
import { SmileyBanner, LendersSection, SourceSection, FormsSection } from "./CustomSections";

/* חומר 2 — פסטל עם נשימה: המיפוי הקבוע של סקשנים לגוונים (card-concept v2) */
const SECTION_TINT: Record<string, string> = {
  "credit-check": "b-tint-mint",
  income: "b-tint-mint",
  bdi: "b-tint-lilac",
  lenders: "b-tint-lilac",
  personal: "b-tint-sand",
  housing: "b-tint-sand",
  vehicles: "b-tint-peach",
  bank: "b-tint-sky",
  source: "b-tint-sky",
  "card-consent": "b-tint-rose",
  calc: "b-tint-rose",
  forms: "b-tint-rose",
};

const SECTION_ICON: Record<string, LucideIcon> = {
  help: HandCoins,
  "credit-check": ShieldCheck,
  bdi: Gauge,
  personal: UserRound,
  income: Wallet,
  housing: Home,
  vehicles: Car,
  bank: Landmark,
  "card-consent": CreditCard,
  lenders: Building2,
  calc: Calculator,
  source: Megaphone,
  forms: FileSignature,
};

export function ClassicSection({ section, state, values, set }: {
  section: SectionDef;
  state: ClassicCardState;
  values: ClassicValues;
  set: (key: string, value: ClassicValues[string]) => void;
}) {
  const [showExtras, setShowExtras] = React.useState(false);

  if (section.custom === "smiley-banner") {
    return <SmileyBanner values={values} set={set} />;
  }

  const Icon = SECTION_ICON[section.id];
  const tint = SECTION_TINT[section.id];

  return (
    <section className={cn("b-card p-5", tint)}>
      <header className="flex items-center gap-2.5 mb-4">
        {Icon ? (
          <GlassIcon icon={Icon} size={34} tone={section.bullet === "green" ? "green" : "default"} />
        ) : section.bullet === "green" ? (
          <span className="size-2.5 rounded-full bg-bingo-green shrink-0" />
        ) : section.bullet === "dot" ? (
          <span className="size-2.5 rounded-full bg-bingo-black shrink-0" />
        ) : null}
        <h2 className="text-[15.5px] font-bold text-bingo-black">{section.title}</h2>
      </header>

      {section.custom === "lenders" ? (
        <LendersSection values={values} set={set} />
      ) : section.custom === "source" ? (
        <SourceSection lead={state.lead} />
      ) : section.custom === "forms" ? (
        <FormsSection state={state} />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-3.5">
            {section.fields.filter((f) => fieldVisible(f, values)).map((f) => (
              <div key={f.key} className={cn(f.wide && "sm:col-span-2 lg:col-span-3")}>
                {f.type !== "checkbox" && (
                  <label className="block text-[11.5px] font-semibold text-bingo-gray-500 mb-1">{f.label}</label>
                )}
                <FieldRenderer field={f} values={values} set={set} />
                {f.note && f.type !== "checkbox" && f.type !== "readonly" && (
                  <p className="mt-0.5 text-[10px] text-bingo-gray-400">{f.note}</p>
                )}
              </div>
            ))}
          </div>

          {section.collapsedExtras && (
            <div className="mt-3.5 pt-3 border-t border-bingo-gray-100">
              <button onClick={() => setShowExtras((x) => !x)}
                className="text-[12px] font-semibold text-bingo-gray-400 hover:text-bingo-gray-600 inline-flex items-center gap-1">
                {showExtras ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
                שדות נוספים
              </button>
              {showExtras && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-3.5 mt-3 animate-fade-in">
                  {section.collapsedExtras.map((f) => (
                    <div key={f.key}>
                      <label className="block text-[11.5px] font-semibold text-bingo-gray-500 mb-1">{f.label}</label>
                      <FieldRenderer field={f} values={values} set={set} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </section>
  );
}
