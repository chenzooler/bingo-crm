"use client";
import * as React from "react";
import type { SectionId } from "@/lib/journey";
import { OpeningSection } from "./sections/OpeningSection";
import { CreditSection } from "./sections/CreditSection";
import { IndicatorSection } from "./sections/IndicatorSection";
import { PersonalSection } from "./sections/PersonalSection";
import { IncomeSection } from "./sections/IncomeSection";
import { AssetsSection } from "./sections/AssetsSection";
import { BankSection } from "./sections/BankSection";
import { ContractSection } from "./sections/ContractSection";
import { CooldownSection } from "./sections/CooldownSection";
import { ChecksSection } from "./sections/ChecksSection";
import { DocsSection } from "./sections/DocsSection";
import { ResultsSection } from "./sections/ResultsSection";
import { ClosingSection } from "./sections/ClosingSection";

const REGISTRY: Record<SectionId, React.ComponentType> = {
  opening: OpeningSection,
  credit: CreditSection,
  bdi: IndicatorSection,
  personal: PersonalSection,
  income: IncomeSection,
  assets: AssetsSection,
  bank: BankSection,
  contract: ContractSection,
  cooldown: CooldownSection,
  checks: ChecksSection,
  docs: DocsSection,
  results: ResultsSection,
  closing: ClosingSection,
};

export function SectionRenderer({ id }: { id: SectionId }) {
  const Cmp = REGISTRY[id];
  return <Cmp />;
}
