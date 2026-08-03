/**
 * Card v4 — חוזה הטיפוסים המשותף בין המעטפת (CardV4) לארבעת העמודים.
 * עמוד 1 (שיחה ושאלון) נבנה ע"י סוכן מקביל — הוא מקבל CardV4PageProps בלבד.
 */
import type { ClassicCardState } from "@/components/classic/useClassicCard";
import type { CatalogResult } from "@/lib/catalog";

export interface CardV4Meta {
  stage: string;
  cardKind: string;
  archived: boolean;
  ownerName: string | null;
  intakeDate: string;
  source: string | null;
}

/** פעולה מהירה מהכותרת — מועברת לעמוד 1 כשהוא לא היה על המסך בזמן הלחיצה */
export type CardV4QuickAction = "send-agreement" | "whatsapp" | "email";

export interface CardV4PageProps {
  state: ClassicCardState;
  meta: CardV4Meta;
  catalog: CatalogResult;
  /** פעולת כותרת שממתינה לביצוע אחרי ניווט לעמוד 1 (מסופקת רק לעמוד 1) */
  pendingAction?: CardV4QuickAction | null;
  /** עמוד 1 קורא לזה אחרי שביצע את הפעולה הממתינה */
  onPendingActionConsumed?: () => void;
}

/* ---------- נתוני שרת נוספים (נבנים ב-page.tsx, בלי fetch בצד לקוח) ---------- */

/** רצועת הסיכום מתחת לשם — הכל מגיע מהשרת כדי שלא יהיה layout shift */
export interface CardV4Summary {
  /** מועד השיחה האחרונה (Call או Activity מסוג call) */
  lastCallAt: string | null;
  /** המשימה הפתוחה עם היעד הקרוב ביותר */
  openTask: { id: number; text: string; dueAt: string | null } | null;
  /** הצפייה האחרונה בכרטיס (לפני הצפייה הנוכחית) */
  lastView: { userName: string | null; at: string } | null;
}

/** פריט בפיד המאוחד של עמוד התיעוד */
export interface TimelineItem {
  /** מזהה ייחודי חוצה-מקורות: a-<id> / t-<id> / c-<id> */
  key: string;
  kind: "activity" | "task" | "call";
  /** ל-activity: הסוג המקורי (note/call/whatsapp/sms/system...) */
  type: string;
  text: string;
  at: string;
  userName: string | null;
  /* task */
  taskId?: number;
  done?: boolean;
  dueAt?: string | null;
  urgent?: boolean;
  /* call */
  duration?: number | null;
  recordUrl?: string | null;
  direction?: string;
  disposition?: string | null;
}

export interface InvoiceDTO {
  id: number;
  number: number;
  title: string;
  amount: number;
  vatRate: number;
  status: string; // draft | issued | paid | cancelled
  notes: string | null;
  issuedAt: string | null;
  paidAt: string | null;
  createdAt: string;
}
