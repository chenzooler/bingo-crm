/**
 * שכפול Yoatsim 1:1 — 21 האוטומציות. מקור: docs/yoatsim-full-spec.md §2.3.
 * מבנה קבוע כמו במקור: פרטי בסיס (שם, סוג כרטיס, סוג פעולה, מתג) →
 * תנאים (שם שדה, אופרטור "שווה ל", ערך) → פעולות (הוספת תהליך/סטטוס, שליחת תבנית).
 *
 * השמות — מילה במילה מהאפיון. התנאים/הפעולות של האוטומציות שהאפיון לא פירט
 * שוחזרו לפי הלוגיקה העסקית המתועדת (כללי הניתוב ב-CLAUDE.md) — ניתנים לעריכה
 * במסך ההגדרות. הנתונים נזרעים ל-DB (מודל Automation) ומשם נערכים.
 */

export interface AutomationCondition {
  fieldType: string; // סוג שדה (בחירה מרשימה / כן-לא / רמזור...)
  fieldName: string; // שם השדה בכרטיס
  operator: string;  // "שווה ל" — האופרטור היחיד במקור
  value: string;
}

export interface AutomationAction {
  type: "add-process" | "send-template" | "assign-user";
  processKey?: string;  // מפתח מ-lib/yoatsim/processes.ts
  statusKey?: string;   // סטטוס בתוך התהליך
  templateName?: string; // שם תבנית הודעה
  note?: string;
}

export interface AutomationDef {
  name: string;
  cardType: "כרטיס" | "שכפול" | "כרטיס בדיקה";
  actionType: string; // "סוג פעולה" במסך המקור
  enabled: boolean;
  conditions: AutomationCondition[];
  actions: AutomationAction[];
}

const EQ = "שווה ל";

export const AUTOMATIONS: AutomationDef[] = [
  {
    // הדוגמה המתועדת באפיון — מילה במילה
    name: "BDI שלילי",
    cardType: "כרטיס",
    actionType: "שינוי שדה",
    enabled: true,
    conditions: [
      { fieldType: "בחירה מרשימה", fieldName: "האם היו בעיות בהוצל\"פ ב-3 שנים", operator: EQ, value: "היו בעיות" },
    ],
    actions: [
      { type: "add-process", processKey: "not-interested", statusKey: "BDI שלילי" },
    ],
  },
  {
    name: "BDI שלילי-רכב",
    cardType: "כרטיס",
    actionType: "שינוי שדה",
    enabled: true,
    conditions: [
      { fieldType: "בחירה מרשימה", fieldName: "האם היו בעיות בהוצל\"פ ב-3 שנים", operator: EQ, value: "היו בעיות" },
      { fieldType: "בחירה מרשימה", fieldName: "יש רכב", operator: EQ, value: "כן" },
    ],
    actions: [
      { type: "add-process", processKey: "vehicle", statusKey: "שיעבוד חדש" },
    ],
  },
  {
    name: "אישור לקוח-בדיקת סמיילי",
    cardType: "כרטיס",
    actionType: "שינוי שדה",
    enabled: true,
    conditions: [
      { fieldType: "רמזור", fieldName: "אישור לקוח בדיקת BDI", operator: EQ, value: "ירוק" },
    ],
    actions: [
      { type: "add-process", processKey: "general-loan", statusKey: "מוכן לבדיקה" },
    ],
  },
  {
    name: "אישור עקרוני משכנתא",
    cardType: "כרטיס",
    actionType: "שינוי סטטוס",
    enabled: true,
    conditions: [
      { fieldType: "בחירה מרשימה", fieldName: "סטטוס נכסים", operator: EQ, value: "הוגש לאישור עקרוני" },
    ],
    actions: [
      { type: "add-process", processKey: "property-ops", statusKey: "קיבל אישור עקרוני" },
      { type: "send-template", templateName: "חיסיון סופי (אישור עקרוני)" },
    ],
  },
  {
    name: "בדיקת הגדלה",
    cardType: "כרטיס",
    actionType: "שינוי שדה",
    enabled: true,
    conditions: [
      { fieldType: "תאריך", fieldName: "בדיקת הגדלה — תאריך", operator: EQ, value: "הגיע" },
    ],
    actions: [
      { type: "add-process", processKey: "vehicle", statusKey: "להעביר לבדיקת הגדלה" },
    ],
  },
  {
    name: "בן/בת זוג חדש",
    cardType: "כרטיס",
    actionType: "שינוי שדה",
    enabled: true,
    conditions: [
      { fieldType: "טקסט", fieldName: "ת.ז בן/בת זוג לאימות", operator: EQ, value: "מולא" },
    ],
    actions: [
      { type: "add-process", processKey: "signatures", statusKey: "ליד חדש" },
    ],
  },
  {
    name: "טיפול משפטי",
    cardType: "כרטיס",
    actionType: "שינוי סטטוס",
    enabled: true,
    conditions: [
      { fieldType: "בחירה מרשימה", fieldName: "סטטוס תשלום", operator: EQ, value: "לא שילם" },
    ],
    actions: [
      { type: "add-process", processKey: "legal", statusKey: "בטיפול" },
    ],
  },
  {
    name: "לא מעוניין באישור",
    cardType: "כרטיס",
    actionType: "שינוי סטטוס",
    enabled: true,
    conditions: [
      { fieldType: "בחירה מרשימה", fieldName: "מעוניין להתקדם?", operator: EQ, value: "לא" },
    ],
    actions: [
      { type: "add-process", processKey: "general-loan", statusKey: "לא מעוניין באישור הסופי" },
      { type: "send-template", templateName: "לקוח נדחה (רגיל)" },
    ],
  },
  {
    name: "לא מעוניין רכב",
    cardType: "כרטיס",
    actionType: "שינוי סטטוס",
    enabled: true,
    conditions: [
      { fieldType: "בחירה מרשימה", fieldName: "מעוניין להתקדם? (רכב)", operator: EQ, value: "לא" },
    ],
    actions: [
      { type: "add-process", processKey: "vehicle", statusKey: "לא מעוניין שיחה ראשונית" },
    ],
  },
  {
    name: "מזרחי טפחות",
    cardType: "כרטיס",
    actionType: "שינוי שדה",
    enabled: true,
    conditions: [
      { fieldType: "בחירה מרשימה", fieldName: "לאן/למי השיעבוד", operator: EQ, value: "מזרחי טפחות" },
    ],
    actions: [
      { type: "add-process", processKey: "vehicle", statusKey: "ליד בתהליך אחר-בדיקת הגדלה (מימון ישיר)" },
    ],
  },
  {
    name: "ממתין להלוואה",
    cardType: "כרטיס",
    actionType: "שינוי סטטוס",
    enabled: true,
    conditions: [
      { fieldType: "בחירה מרשימה", fieldName: "אישור סופי", operator: EQ, value: "כן" },
    ],
    actions: [
      { type: "add-process", processKey: "general-loan", statusKey: "ממתין להלוואה" },
    ],
  },
  {
    name: "סגירת עסקה בינגו",
    cardType: "כרטיס",
    actionType: "שינוי סטטוס",
    enabled: true,
    conditions: [
      { fieldType: "בחירה מרשימה", fieldName: "סטטוס תשלום", operator: EQ, value: "שילם" },
    ],
    actions: [
      { type: "add-process", processKey: "general-loan", statusKey: "שילם" },
      { type: "send-template", templateName: "תודה BINGO" },
    ],
  },
  {
    name: "סמיילי אדום",
    cardType: "כרטיס",
    actionType: "שינוי שדה",
    enabled: true,
    conditions: [
      { fieldType: "רמזור", fieldName: "בדיקת סמיילי - אוטומציה", operator: EQ, value: "אדום" },
    ],
    actions: [
      { type: "add-process", processKey: "all-irrelevant", statusKey: "אדום!!" },
      { type: "send-template", templateName: "BDI שלילי" },
    ],
  },
  {
    name: "פרסום וואצאפ כל מטרה",
    cardType: "כרטיס",
    actionType: "שליחת הודעה",
    enabled: true,
    conditions: [
      { fieldType: "בחירה מרשימה", fieldName: "סטטוס פרסום", operator: EQ, value: "חדש חדש" },
    ],
    actions: [
      { type: "add-process", processKey: "wati-broadcast", statusKey: "נשלח הודעת פרסום" },
      { type: "send-template", templateName: "WATI-פרסום כל מטרה" },
    ],
  },
  {
    name: "פרסום סמס כל מטרה",
    cardType: "כרטיס",
    actionType: "שליחת הודעה",
    enabled: true,
    conditions: [
      { fieldType: "בחירה מרשימה", fieldName: "סטטוס פרסום", operator: EQ, value: "חדש חדש" },
    ],
    actions: [
      { type: "add-process", processKey: "wati-broadcast", statusKey: "נשלח הודעת פרסום" },
      { type: "send-template", templateName: "פרסום-מלא לידים" },
    ],
  },
  {
    name: "קניית שיעבוד",
    cardType: "כרטיס",
    actionType: "שינוי שדה",
    enabled: true,
    conditions: [
      { fieldType: "בחירה מרשימה", fieldName: "יש רכב", operator: EQ, value: "כן משועבד" },
    ],
    actions: [
      { type: "add-process", processKey: "retention-yoni", statusKey: "ליד חדש שימור קניית שיעבוד" },
    ],
  },
  {
    name: "רכב-לא משועבד",
    cardType: "כרטיס",
    actionType: "שינוי שדה",
    enabled: true,
    conditions: [
      { fieldType: "בחירה מרשימה", fieldName: "יש רכב", operator: EQ, value: "כן" },
    ],
    actions: [
      { type: "add-process", processKey: "vehicle", statusKey: "שיעבוד חדש" },
    ],
  },
  {
    name: "רכב-משועבד (מזרחי)",
    cardType: "כרטיס",
    actionType: "שינוי שדה",
    enabled: true,
    conditions: [
      { fieldType: "בחירה מרשימה", fieldName: "יש רכב", operator: EQ, value: "כן משועבד" },
      { fieldType: "טקסט", fieldName: "לאן/למי השיעבוד", operator: EQ, value: "מזרחי" },
    ],
    actions: [
      { type: "add-process", processKey: "vehicle", statusKey: "ליד בתהליך אחר-בדיקת הגדלה (מימון ישיר)" },
    ],
  },
  {
    name: "רכב-משועבד (מימון ישיר)",
    cardType: "כרטיס",
    actionType: "שינוי שדה",
    enabled: true,
    conditions: [
      { fieldType: "בחירה מרשימה", fieldName: "יש רכב", operator: EQ, value: "כן משועבד" },
      { fieldType: "טקסט", fieldName: "לאן/למי השיעבוד", operator: EQ, value: "מימון ישיר" },
    ],
    actions: [
      { type: "add-process", processKey: "vehicle", statusKey: "ליד בתהליך אחר-בדיקת הגדלה (מימון ישיר)" },
    ],
  },
  {
    name: "רכב-משועבד (פמה)",
    cardType: "כרטיס",
    actionType: "שינוי שדה",
    enabled: true,
    conditions: [
      { fieldType: "בחירה מרשימה", fieldName: "יש רכב", operator: EQ, value: "כן משועבד" },
      { fieldType: "טקסט", fieldName: "לאן/למי השיעבוד", operator: EQ, value: "פמה" },
    ],
    actions: [
      { type: "add-process", processKey: "vehicle", statusKey: "ליד בתהליך אחר-בדיקת הגדלה (פמה)" },
    ],
  },
  {
    name: "בדיקת הגדלה בן/בת זוג חדש",
    cardType: "כרטיס",
    actionType: "שינוי שדה",
    enabled: true,
    conditions: [
      { fieldType: "טקסט", fieldName: "ת.ז בן/בת זוג לאימות", operator: EQ, value: "מולא" },
      { fieldType: "בחירה מרשימה", fieldName: "יש רכב", operator: EQ, value: "כן משועבד" },
    ],
    actions: [
      { type: "add-process", processKey: "vehicle", statusKey: "להעביר לבדיקת הגדלה" },
    ],
  },
];

// ודא שהמספר תואם לאפיון (21)
export const AUTOMATIONS_COUNT = AUTOMATIONS.length;
