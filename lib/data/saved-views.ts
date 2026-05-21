import type { LifecycleStage, LeadCategory } from "./lifecycle";

export interface SavedView {
  id: string;
  name: string;
  emoji: string;
  color: string;
  filters: {
    stages?: LifecycleStage[];
    categories?: LeadCategory[];
    tags?: string[];
    owners?: string[];
    minAmount?: number;
    maxAmount?: number;
    age?: "today" | "week" | "month" | "older";
  };
  pinned?: boolean;
  shared?: boolean;
  createdAt: string;
}

/** Built-in starter views that ship with the CRM */
export const STARTER_VIEWS: SavedView[] = [
  {
    id: "view-hot-today",
    name: "חמים שלי היום",
    emoji: "🔥",
    color: "red",
    filters: { tags: ["hot"], age: "today" },
    pinned: true,
    createdAt: "2026-01-01",
  },
  {
    id: "view-needs-call",
    name: "ממתינים לחיוג",
    emoji: "📞",
    color: "blue",
    filters: { stages: ["CONTACT", "SCREENING"], tags: ["pending"] },
    pinned: true,
    createdAt: "2026-01-01",
  },
  {
    id: "view-big-deals",
    name: "עסקאות גדולות",
    emoji: "💰",
    color: "green",
    filters: { minAmount: 200000 },
    pinned: true,
    createdAt: "2026-01-01",
  },
  {
    id: "view-vehicle",
    name: "רכבים פעילים",
    emoji: "🚗",
    color: "orange",
    filters: { categories: ["vehicle"], stages: ["AUCTION", "DECISION", "DOCS"] },
    createdAt: "2026-01-01",
  },
  {
    id: "view-stuck",
    name: "תקועים מעל שבוע",
    emoji: "⚠️",
    color: "yellow",
    filters: { age: "older", stages: ["BDI", "AUCTION", "DECISION"] },
    shared: true,
    createdAt: "2026-01-01",
  },
  {
    id: "view-disbursement",
    name: "בשלבי תשלום",
    emoji: "🎯",
    color: "purple",
    filters: { stages: ["DISBURSEMENT"] },
    createdAt: "2026-01-01",
  },
];

const STORAGE_KEY = "bingo-saved-views";

export function loadSavedViews(): SavedView[] {
  if (typeof window === "undefined") return STARTER_VIEWS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return STARTER_VIEWS;
    return JSON.parse(raw);
  } catch {
    return STARTER_VIEWS;
  }
}

export function saveSavedViews(views: SavedView[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(views));
  } catch {}
}
