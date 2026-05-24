/**
 * BINGO CRM — Process Definitions
 *
 * The 9 legacy "pipelines" are reborn as PROCESS TEMPLATES.
 * Each is a workflow describing:
 *  - Why leads enter it (entry rules)
 *  - Which lifecycle stages they go through
 *  - Who owns it (team / agent)
 *  - Expected conversion goals
 *  - How leads exit
 */

import type { LifecycleStage, LeadCategory } from "./lifecycle";

export type ProcessKind = "active" | "retention" | "archive" | "rejection" | "legal" | "marketing";

export interface ProcessDef {
  /** Original pipeline key */
  key: string;
  /** Hebrew name */
  label: string;
  /** Short purpose statement */
  purpose: string;
  /** Detailed description */
  description: string;
  /** Visual emoji */
  emoji: string;
  /** Color theme */
  color: "green" | "blue" | "orange" | "purple" | "pink" | "yellow" | "red" | "gray";
  /** Process kind */
  kind: ProcessKind;
  /** Current count of leads */
  count: number;
  /** Which lifecycle stages leads in this process can be at */
  stages: LifecycleStage[];
  /** Default loan category for new leads */
  category?: LeadCategory;
  /** Entry conditions (what triggers a lead entering this process) */
  entry: string[];
  /** Exit conditions */
  exit: string[];
  /** Who owns this process (role or specific person) */
  owner: string;
  /** Expected conversion rate (0-100) */
  expectedConversion?: number;
  /** Average days in process */
  avgDays?: number;
  /** Is this an active process (leads flow in) or just archive? */
  isActive: boolean;
}

export const PROCESSES: ProcessDef[] = [
  // 1. UNDERWRITING — מחלקת החתמות
  {
    key: "underwriting",
    label: "מחלקת החתמות",
    purpose: "הליך עיקרי — מאישור עקרוני עד חתימה וקבלת הלוואה",
    description: "ליד שעבר אישור עקרוני ומחכה לחתימה. ליבת הפעילות של הצוות. כולל בדיקת BDI, מכרז גופים, החלטה, מסמכים ושחרור.",
    emoji: "📝",
    color: "blue",
    kind: "active",
    count: 793,
    stages: ["SCREENING", "CONTRACT", "BDI", "AUCTION", "DECISION", "DOCS", "DISBURSEMENT"],
    entry: [
      "ליד עבר אישור עקרוני בטופס",
      "ליד שעבר screening ידני של נציג",
      "ליד שחזר אחרי שיחת איסוף פרטים",
    ],
    exit: [
      "חתימה + שחרור הלוואה → PAID",
      "סירוב סופי → EXIT (REJECTED)",
      "לא חוזר → EXIT (NO_ANSWER)",
    ],
    owner: "צוות החתמות (14 אנשים)",
    expectedConversion: 35,
    avgDays: 14,
    isActive: true,
  },

  // 2. GENERAL LOAN — הלוואה לכל מטרה
  {
    key: "general-loan",
    label: "הלוואה לכל מטרה",
    purpose: "תהליך ייעודי להלוואות אישיות ללא בטוחות",
    description: "ליד שמעוניין בהלוואה לכל מטרה (איחוד חובות, שיפוץ, אירועים וכו'). עובד מול בנקים פרטיים, כרטיסי אשראי וקרנות.",
    emoji: "💸",
    color: "green",
    kind: "active",
    count: 6969,
    stages: ["NEW", "CONTACT", "SCREENING", "CONTRACT", "BDI", "AUCTION", "DECISION", "DOCS", "DISBURSEMENT"],
    category: "general",
    entry: [
      "ליד מטופס נחיתה / פרסום פייסבוק",
      "ליד מ-WATI ששאל הלוואה לכל מטרה",
      "ליד שעלה בשיחה כצורך כל-מטרה",
    ],
    exit: [
      "אישור סופי וקבלת הלוואה → PAID",
      "סירוב בכל הגופים → EXIT (REJECTED)",
      "לא רוצה אישור סופי → EXIT (NOT_INTERESTED)",
    ],
    owner: "צוות מכירות אשראי",
    expectedConversion: 28,
    avgDays: 10,
    isActive: true,
  },

  // 3. VEHICLE — מחלקת רכב
  {
    key: "vehicle",
    label: "מחלקת רכב",
    purpose: "הלוואות כנגד שיעבוד רכב",
    description: "ליד עם רכב בבעלות — הלוואה כנגד שיעבוד הרכב, חידוש שיעבוד, או הגדלת מסגרת לרכב קיים אצל מימון ישיר/פמה.",
    emoji: "🚗",
    color: "orange",
    kind: "active",
    count: 11578,
    stages: ["NEW", "CONTACT", "SCREENING", "CONTRACT", "BDI", "AUCTION", "DECISION", "DOCS", "DISBURSEMENT"],
    category: "vehicle",
    entry: [
      "ליד שמילא טופס הלוואה לרכב",
      "ליד עם רכב בבעלות (לפי שאלון)",
      "ליד פעיל אצל מימון ישיר / פמה",
    ],
    exit: [
      "שיעבוד הושלם + תשלום → PAID",
      "אין מקום להגדלה → EXIT (REJECTED)",
      "סירוב אדום (אזהרה) → EXIT (REJECTED + red-alert)",
    ],
    owner: "צוות רכב מקצועי",
    expectedConversion: 22,
    avgDays: 21,
    isActive: true,
  },

  // 4. RETENTION YONI — שימורים יוני
  {
    key: "retention-yoni",
    label: "שימורים יוני קיטל",
    purpose: "תהליך שימור ייעודי של יוני קיטל",
    description: "צוות שימור עצמאי בניהול יוני קיטל. מטפל בלידים שכבר עברו תהליך אבל לא סגרו - הוצאה מארכיב, שיחת שכנוע, הצעת תנאים משופרים.",
    emoji: "🤝",
    color: "purple",
    kind: "retention",
    count: 2527,
    stages: ["CONTACT", "SCREENING", "CONTRACT", "BDI", "AUCTION", "DECISION"],
    entry: [
      "ליד שיצא ממערכת לפני 30+ ימים",
      "ליד שסירב הצעה ראשונה",
      "ליד עם פוטנציאל מחודש (לפי AI)",
    ],
    exit: [
      "מצליח לסגור → DISBURSEMENT",
      "לא מתעניין → EXIT",
      "מועבר חזרה לצוות ראשי",
    ],
    owner: "יוני קיטל + צוות שימור",
    expectedConversion: 15,
    avgDays: 7,
    isActive: true,
  },

  // 5. WATI — ווצאפ מסלול שיווק
  {
    key: "wati",
    label: "WATI - פרסום WhatsApp",
    purpose: "לידים שמגיעים דרך קמפיינים בווצאפ עסקי",
    description: "תהליך אוטומטי לסינון ראשוני של לידים שהגיעו מ-WATI. בוט מסנן, מבצע שאלות בסיס, ומעביר לצוות מכירות רק לידים בשלים.",
    emoji: "💬",
    color: "green",
    kind: "marketing",
    count: 60467,
    stages: ["NEW", "CONTACT"],
    entry: [
      "ליד שיצר קשר ב-WATI",
      "תשובה לקמפיין WhatsApp Broadcast",
      "סריקת QR מ-קמפיין יחצנות",
    ],
    exit: [
      "ליד 'בשל' → מועבר לצוות מכירות",
      "אין מענה לבוט → EXIT (NO_ANSWER)",
      "ספאם → SPAM",
    ],
    owner: "מנדי שיווק + WOKI Bot",
    expectedConversion: 8,
    avgDays: 1,
    isActive: true,
  },

  // 6. LEGAL — טיפול משפטי
  {
    key: "legal",
    label: "טיפול משפטי",
    purpose: "תיקים שעוברים לטיפול משפטי",
    description: "ליד שלא הצליח לשלם את עמלת השירות, או לקוח שמערער. המקרה עובר ליועץ המשפטי של החברה לטיפול נפרד.",
    emoji: "⚖️",
    color: "red",
    kind: "legal",
    count: 129,
    stages: ["EXIT"],
    entry: [
      "אי תשלום עמלה לאחר תאריך יעד",
      "מחלוקת עם הלקוח",
      "תלונה רשמית / רגולציה",
    ],
    exit: [
      "פשרה / תשלום → סגירה רגילה",
      "פסק דין / פשיטת רגל → EXIT",
    ],
    owner: "עו\"ד חיצוני",
    avgDays: 90,
    isActive: false,
  },

  // 7. SPAM — ספאם
  {
    key: "spam",
    label: "ספאם / מספר לא תקין",
    purpose: "פילטר אוטומטי של לידים לא חוקיים",
    description: "פילטר טכני שמסנן מספרים לא תקינים, מספרים זרים, ובוטים. הליד לא מגיע לצוות בכלל.",
    emoji: "🚯",
    color: "gray",
    kind: "rejection",
    count: 14028,
    stages: ["EXIT"],
    entry: [
      "מספר טלפון לא תקין (regex)",
      "מספר זר / קידומת לא ישראלית",
      "ליד שזיהינו כבוט / spam pattern",
    ],
    exit: ["EXIT אוטומטי - לא חוזר"],
    owner: "מערכת אוטומטית",
    isActive: false,
  },

  // 8. IRRELEVANT — לא רלוונטי
  {
    key: "irrelevant",
    label: "לא רלוונטי / לא מעוניינים",
    purpose: "ארכיב לידים שהוחלט שלא רלוונטיים",
    description: "ליד שעבר הערכה ראשונית והנציג סימן כלא רלוונטי. כולל לידים מתחת לגיל, ללא אזרחות, לא חותם על הסכם, ועוד.",
    emoji: "🚫",
    color: "gray",
    kind: "archive",
    count: 11460,
    stages: ["EXIT"],
    entry: [
      "סימון ידני של נציג",
      "BDI שלילי קריטי",
      "סורב בכל גופי המימון",
      "גיל נמוך / אין אזרחות",
    ],
    exit: [
      "פעם בשנה - סקירה ע\"י צוות שימור",
      "אחרת - נשאר בארכיב",
    ],
    owner: "כל הצוות (סימון ידני)",
    isActive: false,
  },

  // 9. ARCHIVE — ארכיב ראשי
  {
    key: "archive",
    label: "ארכיב כללי",
    purpose: "מאגר היסטורי של כל הלידים הלא פעילים",
    description: "ארכיב גדול של 52K+ לידים שעברו את המערכת. שמורים לצורכי דיווח, רגולציה ומקור פוטנציאלי לקמפיינים עתידיים.",
    emoji: "📦",
    color: "gray",
    kind: "archive",
    count: 52133,
    stages: ["EXIT"],
    entry: [
      "ליד שלא פעיל מעל 6 חודשים",
      "סגירה רגילה אחרי תקופת המתנה",
    ],
    exit: [
      "פנייה מחדש (קמפיין שיווק)",
      "ליד אבוד לצמיתות",
    ],
    owner: "מערכת אוטומטית",
    isActive: false,
  },
];

/** Helper: get process by key */
export function getProcess(key: string): ProcessDef | undefined {
  return PROCESSES.find((p) => p.key === key);
}

/** Helper: get active processes only */
export const ACTIVE_PROCESSES = PROCESSES.filter((p) => p.isActive);

/** Helper: get total lead counts */
export const TOTAL_LEADS_ALL_PROCESSES = PROCESSES.reduce((sum, p) => sum + p.count, 0);
export const TOTAL_LEADS_ACTIVE = ACTIVE_PROCESSES.reduce((sum, p) => sum + p.count, 0);
