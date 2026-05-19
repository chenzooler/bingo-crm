/**
 * Lead augmentation - maps legacy pipeline+status to new lifecycle model.
 * This is the transition layer until we fully migrate the seed data.
 */
import type { Lead } from "@/lib/types";
import type { LifecycleStage, LeadCategory, ExitReason } from "./lifecycle";
import { LEADS } from "./leads";

interface MappingRule {
  pipeline?: string;
  statusPattern?: RegExp;
  stage: LifecycleStage;
  category?: LeadCategory;
  exitReason?: ExitReason;
  tags?: string[];
  questionnaireCompleted?: boolean;
}

const RULES: MappingRule[] = [
  // Underwriting → CONTACT / SCREENING
  { pipeline: "underwriting", statusPattern: /^u-new$/, stage: "NEW" },
  { pipeline: "underwriting", statusPattern: /no-answer/, stage: "CONTACT", tags: ["no-answer"] },
  { pipeline: "underwriting", statusPattern: /callback/, stage: "CONTACT", tags: ["callback-today"] },
  { pipeline: "underwriting", statusPattern: /eligibility-loan/, stage: "SCREENING", category: "general" },
  { pipeline: "underwriting", statusPattern: /eligibility-car/, stage: "SCREENING", category: "vehicle" },
  { pipeline: "underwriting", statusPattern: /collide/, stage: "NEW" },

  // General loan
  { pipeline: "general-loan", statusPattern: /ready/, stage: "SCREENING", category: "general" },
  { pipeline: "general-loan", statusPattern: /no-answer/, stage: "CONTACT", category: "general", tags: ["no-answer"] },
  { pipeline: "general-loan", statusPattern: /callback/, stage: "CONTACT", category: "general", tags: ["callback-today"] },
  { pipeline: "general-loan", statusPattern: /not-interested-check/, stage: "EXIT", category: "general", exitReason: "NOT_INTERESTED" },
  { pipeline: "general-loan", statusPattern: /approved-final/, stage: "DECISION", category: "general", questionnaireCompleted: true },
  { pipeline: "general-loan", statusPattern: /final-id/, stage: "DOCS", category: "general", questionnaireCompleted: true },
  { pipeline: "general-loan", statusPattern: /final-courier/, stage: "DOCS", category: "general", questionnaireCompleted: true },
  { pipeline: "general-loan", statusPattern: /jbank-(principal|branch|account|final)/, stage: "AUCTION", category: "general", questionnaireCompleted: true },
  { pipeline: "general-loan", statusPattern: /pension/, stage: "AUCTION", category: "general", questionnaireCompleted: true },
  { pipeline: "general-loan", statusPattern: /no-final/, stage: "EXIT", category: "general", exitReason: "NOT_INTERESTED" },
  { pipeline: "general-loan", statusPattern: /waiting-loan/, stage: "DISBURSEMENT", category: "general", questionnaireCompleted: true },
  { pipeline: "general-loan", statusPattern: /got-loan/, stage: "DISBURSEMENT", category: "general", questionnaireCompleted: true },
  { pipeline: "general-loan", statusPattern: /paid/, stage: "PAID", category: "general", questionnaireCompleted: true },
  { pipeline: "general-loan", statusPattern: /rejected/, stage: "EXIT", category: "general", exitReason: "REJECTED" },
  { pipeline: "general-loan", statusPattern: /bdi-bad/, stage: "EXIT", category: "general", exitReason: "BDI_NEGATIVE" },
  { pipeline: "general-loan", statusPattern: /id-invalid/, stage: "EXIT", category: "general", exitReason: "SPAM" },

  // Vehicle
  { pipeline: "vehicle", statusPattern: /other-process|new-encumbrance|new-add/, stage: "SCREENING", category: "vehicle" },
  { pipeline: "vehicle", statusPattern: /no-answer/, stage: "CONTACT", category: "vehicle", tags: ["no-answer"] },
  { pipeline: "vehicle", statusPattern: /callback/, stage: "CONTACT", category: "vehicle", tags: ["callback-today"] },
  { pipeline: "vehicle", statusPattern: /waiting-docs/, stage: "DOCS", category: "vehicle", questionnaireCompleted: true },
  { pipeline: "vehicle", statusPattern: /waiting-final/, stage: "DECISION", category: "vehicle", questionnaireCompleted: true },
  { pipeline: "vehicle", statusPattern: /sign-contract/, stage: "DOCS", category: "vehicle", questionnaireCompleted: true },
  { pipeline: "vehicle", statusPattern: /test-missing/, stage: "DOCS", category: "vehicle", tags: ["urgent"] },
  { pipeline: "vehicle", statusPattern: /final-win/, stage: "DECISION", category: "vehicle", questionnaireCompleted: true },
  { pipeline: "vehicle", statusPattern: /waiting-loan/, stage: "DISBURSEMENT", category: "vehicle", questionnaireCompleted: true },
  { pipeline: "vehicle", statusPattern: /got-loan/, stage: "DISBURSEMENT", category: "vehicle", questionnaireCompleted: true },
  { pipeline: "vehicle", statusPattern: /paid/, stage: "PAID", category: "vehicle", questionnaireCompleted: true },
  { pipeline: "vehicle", statusPattern: /not-relevant-after-docs|not-interested|no-final|no-room/, stage: "EXIT", category: "vehicle", exitReason: "NOT_INTERESTED" },
  { pipeline: "vehicle", statusPattern: /rejected/, stage: "EXIT", category: "vehicle", exitReason: "REJECTED" },

  // Irrelevant
  { pipeline: "irrelevant", statusPattern: /no-details|not-relevant|uncooperative|no-contract|too-good/, stage: "EXIT", exitReason: "NOT_INTERESTED" },
  { pipeline: "irrelevant", statusPattern: /young/, stage: "EXIT", exitReason: "UNDER_AGE" },
  { pipeline: "irrelevant", statusPattern: /no-citizenship/, stage: "EXIT", exitReason: "NO_CITIZENSHIP" },
  { pipeline: "irrelevant", statusPattern: /other-person|mortgage-interest/, stage: "EXIT", exitReason: "OTHER" },
  { pipeline: "irrelevant", statusPattern: /rejected-all/, stage: "EXIT", exitReason: "REJECTED" },
  { pipeline: "irrelevant", statusPattern: /bdi-bad/, stage: "EXIT", exitReason: "BDI_NEGATIVE" },

  // Spam/Legal
  { pipeline: "spam", stage: "EXIT", exitReason: "SPAM" },
  { pipeline: "legal", stage: "EXIT", exitReason: "LEGAL" },
];

/** Maps legacy pipeline+status to new lifecycle model */
export function deriveLifecycle(lead: Lead): {
  stage: LifecycleStage;
  category: LeadCategory;
  tags: string[];
  exitReason?: ExitReason;
  questionnaireCompleted: boolean;
} {
  if (lead.stage) {
    return {
      stage: lead.stage,
      category: lead.category || "general",
      tags: lead.tags || [],
      exitReason: lead.exitReason,
      questionnaireCompleted: lead.questionnaireCompleted ?? false,
    };
  }

  // Walk rules
  for (const rule of RULES) {
    if (rule.pipeline && lead.primaryPipeline !== rule.pipeline) continue;
    if (rule.statusPattern && !rule.statusPattern.test(lead.primaryStatus)) continue;
    return {
      stage: rule.stage,
      category: rule.category || (lead.primaryPipeline === "vehicle" ? "vehicle" : "general"),
      tags: rule.tags || [],
      exitReason: rule.exitReason,
      questionnaireCompleted: rule.questionnaireCompleted ?? false,
    };
  }

  // Default fallback
  return {
    stage: "NEW",
    category: "general",
    tags: [],
    questionnaireCompleted: false,
  };
}

/** Augment all leads with the derived lifecycle data */
export function augmentLeads() {
  return LEADS.map((lead) => {
    const derived = deriveLifecycle(lead);
    return { ...lead, ...derived };
  });
}

export const AUGMENTED_LEADS = augmentLeads();
