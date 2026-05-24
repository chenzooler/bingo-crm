/**
 * BINGO CRM — Status Mapping Engine
 *
 * Maps each of the 114 legacy Yoatzim statuses to:
 *  • Unified lifecycle stage
 *  • Auto-tags
 *  • Exit reason (if terminal)
 *  • Category hint
 *
 * This is the migration engine — no status is lost.
 */

import type { LifecycleStage, LeadCategory, ExitReason } from "./lifecycle";
import { STATUSES } from "./static";

export interface StatusMapping {
  stage: LifecycleStage;
  tags?: string[];
  exitReason?: ExitReason;
  category?: LeadCategory;
  /** Higher = more important / hotter */
  priority?: number;
}

/**
 * Full mapping table: every legacy status → new lifecycle.
 * Keys are status keys from static.ts STATUSES.
 */
export const STATUS_TO_LIFECYCLE: Record<string, StatusMapping> = {
  // ─────────────────────────────────────────────────────────
  // UNDERWRITING pipeline (u-*)
  // ─────────────────────────────────────────────────────────
  "u-collide":              { stage: "BDI", tags: ["collide"] },
  "u-new":                  { stage: "NEW", priority: 8 },
  "u-callback":             { stage: "CONTACT", tags: ["callback"], priority: 7 },
  "u-eligibility-loan":     { stage: "SCREENING", category: "general" },
  "u-eligibility-car":      { stage: "SCREENING", category: "vehicle" },
  "u-no-answer":            { stage: "CONTACT", tags: ["no-answer"], priority: 4 },

  // ─────────────────────────────────────────────────────────
  // IRRELEVANT pipeline (i-*) — all are EXIT
  // ─────────────────────────────────────────────────────────
  "i-no-details":           { stage: "EXIT", exitReason: "NO_ANSWER" },
  "i-not-relevant":         { stage: "EXIT", exitReason: "NOT_INTERESTED" },
  "i-uncooperative":        { stage: "EXIT", exitReason: "NOT_INTERESTED" },
  "i-no-after-explain":     { stage: "EXIT", exitReason: "NOT_INTERESTED" },
  "i-no-contract":          { stage: "EXIT", exitReason: "NOT_INTERESTED" },
  "i-too-good":             { stage: "EXIT", exitReason: "OTHER", tags: ["too-good"] },
  "i-young":                { stage: "EXIT", exitReason: "UNDER_AGE" },
  "i-no-citizenship":       { stage: "EXIT", exitReason: "NO_CITIZENSHIP" },
  "i-other-person":         { stage: "EXIT", exitReason: "OTHER", tags: ["other-person"] },
  "i-mortgage-interest":    { stage: "EXIT", exitReason: "OTHER", category: "mortgage" },
  "i-rejected-all":         { stage: "EXIT", exitReason: "REJECTED" },
  "i-bdi-bad":              { stage: "EXIT", exitReason: "BDI_NEGATIVE" },

  // ─────────────────────────────────────────────────────────
  // GENERAL LOAN pipeline (g-*)
  // ─────────────────────────────────────────────────────────
  "g-ready":                { stage: "SCREENING", category: "general", priority: 8 },
  "g-no-answer":            { stage: "CONTACT", category: "general", tags: ["no-answer"], priority: 4 },
  "g-callback":             { stage: "CONTACT", category: "general", tags: ["callback"], priority: 7 },
  "g-not-interested-check": { stage: "EXIT", exitReason: "NOT_INTERESTED", category: "general" },
  "g-whatsapp-retention":   { stage: "CONTACT", category: "general", tags: ["wati", "retention"] },
  "g-approved-final":       { stage: "DECISION", category: "general", tags: ["hot"], priority: 10 },
  "g-final-id":             { stage: "DOCS", category: "general", tags: ["id-pending"] },
  "g-final-courier":        { stage: "DOCS", category: "general", tags: ["courier-pending"] },
  "g-pension-docs":         { stage: "DOCS", category: "general", tags: ["pension"] },
  "g-jbank-principal":      { stage: "AUCTION", category: "general", tags: ["lender:jerusalem-bank", "approved-principal"] },
  "g-jbank-branch":         { stage: "AUCTION", category: "general", tags: ["lender:jerusalem-bank", "branch-pending"] },
  "g-jbank-account":        { stage: "AUCTION", category: "general", tags: ["lender:jerusalem-bank", "account-pending"] },
  "g-jbank-final":          { stage: "DECISION", category: "general", tags: ["lender:jerusalem-bank"] },
  "g-no-final":             { stage: "EXIT", exitReason: "NOT_INTERESTED", category: "general", tags: ["no-final"] },
  "g-pension-loan":         { stage: "DISBURSEMENT", category: "general", tags: ["pension"] },
  "g-waiting-loan":         { stage: "DISBURSEMENT", category: "general" },
  "g-got-loan":             { stage: "DISBURSEMENT", category: "general", tags: ["got-loan"] },
  "g-paid":                 { stage: "PAID", category: "general" },
  "g-rejected":             { stage: "EXIT", exitReason: "REJECTED", category: "general" },
  "g-bdi-bad":              { stage: "EXIT", exitReason: "BDI_NEGATIVE", category: "general" },
  "g-id-invalid":           { stage: "EXIT", exitReason: "OTHER", tags: ["id-invalid"] },

  // ─────────────────────────────────────────────────────────
  // VEHICLE pipeline (v-*)
  // ─────────────────────────────────────────────────────────
  "v-other-process":        { stage: "AUCTION", category: "vehicle", tags: ["new-encumbrance"] },
  "v-direct-other":         { stage: "AUCTION", category: "vehicle", tags: ["lender:direct-finance", "extend-check"] },
  "v-fama-other":           { stage: "AUCTION", category: "vehicle", tags: ["lender:fama", "extend-check"] },
  "v-new-encumbrance":      { stage: "NEW", category: "vehicle", tags: ["new-encumbrance"], priority: 8 },
  "v-direct-new-add":       { stage: "AUCTION", category: "vehicle", tags: ["lender:direct-finance", "approved-extend"] },
  "v-fama-new-add":         { stage: "AUCTION", category: "vehicle", tags: ["lender:fama", "approved-extend"] },
  "v-no-answer":            { stage: "CONTACT", category: "vehicle", tags: ["no-answer"], priority: 4 },
  "v-callback":             { stage: "CONTACT", category: "vehicle", tags: ["callback"], priority: 7 },
  "v-waiting-docs":         { stage: "DOCS", category: "vehicle", tags: ["docs-pending"] },
  "v-waiting-final":        { stage: "DECISION", category: "vehicle" },
  "v-sign-contract":        { stage: "DOCS", category: "vehicle", tags: ["sign-pending"] },
  "v-test-missing":         { stage: "DOCS", category: "vehicle", tags: ["test-missing", "complex"] },
  "v-final-win":            { stage: "DISBURSEMENT", category: "vehicle", tags: ["winning"] },
  "v-waiting-loan":         { stage: "DISBURSEMENT", category: "vehicle" },
  "v-got-loan":             { stage: "DISBURSEMENT", category: "vehicle", tags: ["got-loan"] },
  "v-paid":                 { stage: "PAID", category: "vehicle" },
  "v-not-relevant-after-docs": { stage: "EXIT", exitReason: "NOT_INTERESTED", category: "vehicle", tags: ["after-docs"] },
  "v-no-room-direct":       { stage: "EXIT", exitReason: "REJECTED", category: "vehicle", tags: ["lender:direct-finance", "no-room"] },
  "v-no-room-fama":         { stage: "EXIT", exitReason: "REJECTED", category: "vehicle", tags: ["lender:fama", "no-room"] },
  "v-not-interested":       { stage: "EXIT", exitReason: "NOT_INTERESTED", category: "vehicle", tags: ["first-call"] },
  "v-no-final":             { stage: "EXIT", exitReason: "NOT_INTERESTED", category: "vehicle", tags: ["no-final"] },
  "v-rejected":             { stage: "EXIT", exitReason: "REJECTED", category: "vehicle" },
  "v-rejected-red":         { stage: "EXIT", exitReason: "REJECTED", category: "vehicle", tags: ["red-alert"] },
};

/**
 * Map a legacy status key to its new lifecycle.
 * Returns sensible defaults if not in mapping table.
 */
export function mapStatusToLifecycle(statusKey: string | undefined): StatusMapping {
  if (!statusKey) return { stage: "NEW" };
  const mapping = STATUS_TO_LIFECYCLE[statusKey];
  if (mapping) return mapping;

  // Fallback heuristics by prefix
  if (statusKey.startsWith("u-")) return { stage: "SCREENING" };
  if (statusKey.startsWith("i-")) return { stage: "EXIT", exitReason: "OTHER" };
  if (statusKey.startsWith("g-")) return { stage: "SCREENING", category: "general" };
  if (statusKey.startsWith("v-")) return { stage: "SCREENING", category: "vehicle" };
  return { stage: "NEW" };
}

/**
 * Coverage report: how many statuses are mapped vs total.
 */
export function getMappingCoverage(): { mapped: number; total: number; pct: number; unmapped: string[] } {
  const total = STATUSES.length;
  const unmapped: string[] = [];
  let mapped = 0;
  STATUSES.forEach((s) => {
    if (STATUS_TO_LIFECYCLE[s.key]) mapped++;
    else unmapped.push(s.key);
  });
  return { mapped, total, pct: Math.round((mapped / total) * 100), unmapped };
}

/**
 * Reverse lookup: which legacy statuses map to a given stage?
 */
export function getStatusesForStage(stage: LifecycleStage): string[] {
  return Object.entries(STATUS_TO_LIFECYCLE)
    .filter(([, m]) => m.stage === stage)
    .map(([k]) => k);
}
