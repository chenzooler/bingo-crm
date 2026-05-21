/**
 * Smart Search - parses natural language queries into structured filters.
 * Examples:
 *  "כל הלידים שביקשו מעל 100K" → {minAmount: 100000}
 *  "לידים חמים החודש" → {tags: ["hot"], dateRange: "month"}
 *  "תקועים יותר משבוע" → {tags: ["stuck"], olderThan: 7}
 */

import { LEADS } from "@/lib/data/leads";
import { AUGMENTED_LEADS } from "@/lib/data/lead-augment";
import { generateInsights } from "@/lib/data/ai-insights";
import type { Lead } from "@/lib/types";

export interface ParsedQuery {
  minAmount?: number;
  maxAmount?: number;
  tags?: string[];
  categories?: string[];
  stages?: string[];
  dateRange?: "today" | "yesterday" | "week" | "month";
  hotScore?: number;
  ownerName?: string;
  searchText?: string;
}

const AMOUNT_PATTERNS = [
  { re: /(?:מעל|יותר מ-?|גדול מ-?|לפחות)\s*(\d+)\s*[kK]/i, key: "minAmount" as const, mult: 1000 },
  { re: /(?:מעל|יותר מ-?|גדול מ-?|לפחות)\s*(\d+)\s*(?:אלף)/i, key: "minAmount" as const, mult: 1000 },
  { re: /(?:מתחת ל|פחות מ-?|קטן מ-?)\s*(\d+)\s*[kK]/i, key: "maxAmount" as const, mult: 1000 },
  { re: /(?:מתחת ל|פחות מ-?|קטן מ-?)\s*(\d+)\s*(?:אלף)/i, key: "maxAmount" as const, mult: 1000 },
];

const KEYWORDS = {
  hot: ["חם", "חמים", "בוערים", "לוהט"],
  urgent: ["דחוף", "דחופים", "בהול"],
  stuck: ["תקוע", "תקועים", "תקועה"],
  callback: ["חוזר", "קולבק", "מענה"],
  vehicle: ["רכב", "רכבים", "אוטו"],
  property: ["נכס", "משכנתא", "בית"],
  consolidation: ["איחוד", "מיחזור"],
};

const DATE_KEYWORDS = {
  today: ["היום"],
  yesterday: ["אתמול"],
  week: ["השבוע", "שבוע", "7 ימים"],
  month: ["החודש", "חודש", "30 ימים"],
};

export function parseSmartQuery(input: string): ParsedQuery {
  const q: ParsedQuery = {};
  let rest = input.trim();

  // Amount patterns
  for (const p of AMOUNT_PATTERNS) {
    const m = rest.match(p.re);
    if (m) {
      q[p.key] = parseInt(m[1], 10) * p.mult;
      rest = rest.replace(m[0], "").trim();
    }
  }

  // Number K patterns (50K, 100K)
  const kMatch = rest.match(/(\d+)\s*[kK]/);
  if (kMatch && !q.minAmount) {
    q.minAmount = parseInt(kMatch[1], 10) * 1000;
    rest = rest.replace(kMatch[0], "").trim();
  }

  // Tags
  const foundTags: string[] = [];
  for (const [tag, kws] of Object.entries(KEYWORDS)) {
    if (kws.some((k) => rest.includes(k))) {
      if (["vehicle", "property", "consolidation"].includes(tag)) {
        q.categories = [...(q.categories || []), tag];
      } else {
        foundTags.push(tag);
      }
      kws.forEach((k) => { rest = rest.replace(k, "").trim(); });
    }
  }
  if (foundTags.length) q.tags = foundTags;

  // Date range
  for (const [range, kws] of Object.entries(DATE_KEYWORDS)) {
    if (kws.some((k) => rest.includes(k))) {
      q.dateRange = range as ParsedQuery["dateRange"];
      kws.forEach((k) => { rest = rest.replace(k, "").trim(); });
      break;
    }
  }

  // High AI score
  if (/(?:סיכוי|score|הזדמנות)\s*(?:גבוה|גבוהה)/.test(rest)) {
    q.hotScore = 70;
    rest = rest.replace(/(?:סיכוי|score|הזדמנות)\s*(?:גבוה|גבוהה)/, "").trim();
  }

  // Remaining as free text
  rest = rest.replace(/\s+/g, " ").trim();
  if (rest && rest.length > 1) q.searchText = rest;

  return q;
}

export function applyQuery(leads: Lead[], q: ParsedQuery): Lead[] {
  let result = leads;

  if (q.minAmount !== undefined) {
    result = result.filter((l) => (l.amountRequested || 0) >= q.minAmount!);
  }
  if (q.maxAmount !== undefined) {
    result = result.filter((l) => (l.amountRequested || 0) <= q.maxAmount!);
  }
  if (q.tags?.length) {
    result = result.filter((l) => q.tags!.some((t) => l.tags?.includes(t)));
  }
  if (q.categories?.length) {
    result = result.filter((l) => q.categories!.includes(l.category || ""));
  }
  if (q.stages?.length) {
    result = result.filter((l) => q.stages!.includes(l.stage || ""));
  }
  if (q.hotScore) {
    result = result.filter((l) => generateInsights(l).closeProbability >= q.hotScore!);
  }
  if (q.searchText) {
    const t = q.searchText.toLowerCase();
    result = result.filter((l) =>
      l.fullName.toLowerCase().includes(t) ||
      l.phone?.includes(t) ||
      l.idNumber?.includes(t) ||
      l.email?.toLowerCase().includes(t)
    );
  }

  return result;
}

export function describeQuery(q: ParsedQuery): string[] {
  const parts: string[] = [];
  if (q.minAmount) parts.push(`סכום ≥ ₪${q.minAmount.toLocaleString("he-IL")}`);
  if (q.maxAmount) parts.push(`סכום ≤ ₪${q.maxAmount.toLocaleString("he-IL")}`);
  if (q.tags?.length) parts.push(`תיוג: ${q.tags.join(", ")}`);
  if (q.categories?.length) parts.push(`קטגוריה: ${q.categories.join(", ")}`);
  if (q.dateRange) parts.push(`טווח: ${q.dateRange}`);
  if (q.hotScore) parts.push(`AI score ≥ ${q.hotScore}`);
  if (q.searchText) parts.push(`טקסט: "${q.searchText}"`);
  return parts;
}

/** Suggest popular searches */
export const POPULAR_SEARCHES = [
  "לידים חמים החודש",
  "לקוחות שביקשו מעל 200K",
  "לידים תקועים יותר משבוע",
  "רכבים פעילים בשלב סגירה",
  "כל הסיכויים הגבוהים",
];
