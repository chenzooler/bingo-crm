/**
 * Field Completion Engine — calculates completion % per section + suggestions.
 */

import type { Lead } from "@/lib/types";
import { FIELD_SECTIONS, getFieldRelevance, type SectionDef, type FieldDef } from "./field-schema";

export interface SectionStats {
  section: SectionDef;
  totalFields: number;
  filledFields: number;
  criticalFields: number;
  criticalFilled: number;
  pctComplete: number;
  pctCriticalComplete: number;
  missingCritical: FieldDef[];
  isFullyComplete: boolean;
}

/** Is a field "filled" (non-empty)? */
export function isFieldFilled(lead: Lead, field: FieldDef): boolean {
  const v = (lead as unknown as Record<string, unknown>)[field.key];
  if (v === undefined || v === null) return false;
  if (typeof v === "string") return v.trim().length > 0;
  if (typeof v === "number") return true;
  if (typeof v === "boolean") return true;
  if (Array.isArray(v)) return v.length > 0;
  if (typeof v === "object") return Object.keys(v).length > 0;
  return false;
}

/** Compute stats for a single section */
export function getSectionStats(lead: Lead, section: SectionDef): SectionStats {
  const stage = (lead.stage as never) || "NEW";
  const total = section.fields.length;
  let filled = 0;
  let criticalCount = 0;
  let criticalFilled = 0;
  const missingCritical: FieldDef[] = [];

  section.fields.forEach((f) => {
    const relevance = getFieldRelevance(f, stage);
    if (relevance === "hidden") return;
    const isCritical = relevance === "critical";
    if (isCritical) criticalCount++;
    if (isFieldFilled(lead, f)) {
      filled++;
      if (isCritical) criticalFilled++;
    } else if (isCritical) {
      missingCritical.push(f);
    }
  });

  return {
    section,
    totalFields: total,
    filledFields: filled,
    criticalFields: criticalCount,
    criticalFilled,
    pctComplete: total > 0 ? Math.round((filled / total) * 100) : 0,
    pctCriticalComplete: criticalCount > 0 ? Math.round((criticalFilled / criticalCount) * 100) : 100,
    missingCritical,
    isFullyComplete: filled === total,
  };
}

/** All sections stats */
export function getAllSectionStats(lead: Lead): SectionStats[] {
  return FIELD_SECTIONS.map((s) => getSectionStats(lead, s));
}

/** Overall completion (across all sections, weighted) */
export function getOverallCompletion(lead: Lead): { pct: number; xp: number; nextSection?: SectionDef } {
  const all = getAllSectionStats(lead);
  const totalFields = all.reduce((s, x) => s + x.totalFields, 0);
  const filled = all.reduce((s, x) => s + x.filledFields, 0);
  const xp = all.reduce((sum, s) => sum + s.filledFields * (s.section.xpPerField || 5), 0);
  // Find least complete section as next focus
  const incomplete = all
    .filter((s) => !s.isFullyComplete)
    .sort((a, b) => a.pctComplete - b.pctComplete);
  return {
    pct: totalFields > 0 ? Math.round((filled / totalFields) * 100) : 0,
    xp,
    nextSection: incomplete[0]?.section,
  };
}
