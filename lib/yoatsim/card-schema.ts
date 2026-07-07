/**
 * שכפול Yoatsim 1:1 — סכמת כרטיס הלקוח.
 * מקור: docs/yoatsim-full-spec.md §1 + docs/yoatsim-lead-card.md (תיעוד חי).
 * כל סקשן/שדה/אופציה — בדיוק כמו במקור. העיצוב בלבד הוא של בינגו.
 *
 * אחסון: כל הערכים חיים ב-Lead.extraJson (מפתח=key); תת-קבוצה ממופה
 * גם לעמודות הקנוניות (lib/yoatsim/values.ts) כדי שהרשימות ימשיכו לעבוד.
 */

export type FieldType =
  | "text" | "textarea" | "number" | "money" | "date"
  | "select" | "buttons" | "multi-buttons" | "checkbox" | "traffic" | "readonly";

export interface FieldDef {
  key: string;
  label: string;
  type: FieldType;
  options?: readonly string[];
  placeholder?: string;
  /** מוצג רק כאשר ערך של שדה אחר עונה לתנאי */
  showIf?: { key: string; equals?: string; oneOf?: string[] };
  note?: string;
  /** שדה שלא נשמר לעולם (פרטי אשראי) */
  ephemeral?: boolean;
  wide?: boolean;
}

export interface SectionDef {
  id: string;
  title: string;
  bullet?: "green" | "dot" | "none";
  /** קומפוננטה מיוחדת במקום רינדור שדות רגיל */
  custom?: "smiley-banner" | "lenders" | "source" | "forms";
  fields: FieldDef[];
  collapsedExtras?: FieldDef[]; // "שדות נוספים (לא תמיד מוצגים)"
}

/* ---------- אופציות (מהאפיון, מילה במילה) ---------- */
export const LOAN_PURPOSES_YOATSIM = [
  "כיסוי חוב", "עזרה לבן משפחה", "לימודים", "חופשה", "אירוע", "עסק",
  "שיפוץ", "דיור/משכנתא", "קניות", "רכב", "בריאותי", "טיפול שיניים", "אחר",
] as const;

export const CREDIT_CARDS_Y = ["ישראכרט", "כאל", "מקס", "דיירקט", "אין כרטיס בכלל", "יש כרטיסים"] as const;
export const CARD_LIMIT_Y = ["מעל 5,000 ש\"ח", "מתחת ל-5,000 ש\"ח"] as const;
export const CHECKED_BEFORE_Y = [
  "בבנק הפרטי", "בנק ירושלים", "ישראכרט", "כאל", "מקס", "בלנדר", "הפניקס", "קרדיט 24", "אחר", "לא בדק",
] as const;
export const MARITAL_Y = ["רווק/ה", "נשוי/אה", "גרוש/ה", "אלמן/ה", "ידועים בציבור"] as const;
export const EMPLOYMENT_Y = ["שכיר", "עצמאי", "מקבל קצבה", "לא עובד", "פנסיונר"] as const;
export const PENSION_Y = ["כן", "לא", "לא ידוע", "צעיר"] as const;
export const HOUSING_Y = ["שכירות", "בעלות", "בעלות + משכנתא", "אצל ההורים"] as const;
export const BANKS_Y = [
  "הפועלים (12)", "לאומי (10)", "דיסקונט (11)", "מזרחי טפחות (20)", "הבינלאומי (31)",
  "מרכנתיל (17)", "אוצר החייל (14)", "יהב (4)", "בנק ירושלים (54)", "מסד (46)",
  "פאגי (52)", "וואן זירו (18)", "בנק דיגיטלי אחר", "אחר",
] as const;
export const ACTIVE_LOANS_Y = [
  "ישראכרט", "כאל", "מקס", "ירושלים", "בלנדר", "פנסיה", "בנק אחר", "פרטי", "אין",
] as const;
export const LENDER_RESULT_Y = [
  "יש אישור", "סורב", "לא נבדק", "שגיאה", "היה אישור עצמאי", "קיבל אישור מגוף אחר",
] as const;
export const INTERESTED_Y = ["כן", "כן על חלק", "לא", "מתלבט"] as const;
export const JERUSALEM_STAGE_Y = ["אישור עקרוני", "עו\"ש", "אישור סופי"] as const;

/** גופי המימון בכרטיס — הסדר מהאפיון */
export const CARD_LENDERS = [
  { key: "isracard", name: "ישראכרט" },
  { key: "cal", name: "כאל" },
  { key: "max", name: "מקס" },
  { key: "phoenix", name: "הפניקס" },
  { key: "jerusalem", name: "בנק ירושלים" },
  { key: "pension", name: "הלוואה כנגד קרנות/ביטוח" },
] as const;

/* ============================================================
   15 הסקשנים — הסדר המדויק מהכרטיס החי
   ============================================================ */
export const CARD_SECTIONS: SectionDef[] = [
  {
    id: "questionnaire",
    title: "תוצאות שאלון",
    bullet: "none",
    fields: [
      { key: "questionnaireResults", label: "תוצאות שאלון", type: "textarea", wide: true, placeholder: "טקסט חופשי..." },
    ],
  },
  {
    id: "help",
    title: "איך אפשר לעזור?",
    bullet: "dot",
    fields: [
      { key: "firstName", label: "שם פרטי", type: "text" },
      { key: "lastName", label: "שם משפחה", type: "text" },
      { key: "amountRequested", label: "סכום הלוואה המבוקש", type: "money" },
      { key: "loanPurpose", label: "מטרת ההלוואה", type: "select", options: LOAN_PURPOSES_YOATSIM },
      { key: "rotem", label: "רותם", type: "checkbox", note: "העברה לנציג" },
    ],
  },
  {
    id: "credit-check",
    title: "בדיקת נתוני אשראי",
    bullet: "green",
    fields: [
      { key: "creditCards", label: "יש בבעלותך כרטיסי אשראי?", type: "multi-buttons", options: CREDIT_CARDS_Y, wide: true },
      { key: "cardLimit", label: "מה גובה המסגרת בכרטיס האשראי?", type: "select", options: CARD_LIMIT_Y },
      { key: "checkedBefore", label: "ביצעת בדיקה להלוואה לפני שפנית אלינו?", type: "multi-buttons", options: CHECKED_BEFORE_Y, wide: true },
      { key: "creditNotes", label: "הערות בדיקות", type: "textarea", wide: true },
    ],
    collapsedExtras: [
      { key: "enforcementIssues", label: "בעיות בהוצל\"פ ב-3/5 שנים", type: "select", options: ["לא", "ב-3 שנים", "ב-5 שנים"] },
      { key: "returnedChecks", label: "חזרו צ'קים/הו\"ק/הלוואות בשנתיים", type: "select", options: ["לא", "כן"] },
      { key: "accountRestricted", label: "חשבון מוגבל", type: "select", options: ["לא", "כעת", "בעבר"] },
      { key: "bdiRepair", label: "מחיקה/שיפור BDI", type: "text" },
    ],
  },
  {
    id: "smiley-banner",
    title: "לקוח תקין בדיקת סמיילי ירוקה",
    custom: "smiley-banner",
    fields: [
      { key: "smileyGreenConfirmed", label: "לקוח תקין בדיקת סמיילי ירוקה ✅", type: "checkbox" },
    ],
  },
  {
    id: "bdi",
    title: "בדיקת חיווי אשראי",
    bullet: "green",
    fields: [
      { key: "idNumber", label: "תעודת זהות", type: "text", placeholder: "9 ספרות" },
      { key: "gender", label: "מין", type: "select", options: ["זכר", "נקבה"] },
      { key: "smileyFirstName", label: "שם פרטי - סמיילי", type: "text" },
      { key: "smileyLastName", label: "שם משפחה - סמיילי", type: "text" },
      { key: "birthDate", label: "תאריך לידה", type: "date" },
      { key: "bdiClientApproval", label: "אישור לקוח בדיקת BDI", type: "traffic" },
      { key: "smileyAuto", label: "בדיקת סמיילי - אוטומציה 🚦", type: "traffic", note: "מתמלא אוטומטית מהבוט" },
      { key: "smileyManual", label: "בדיקת סמיילי - ידנית 🚦", type: "traffic" },
    ],
  },
  {
    id: "personal",
    title: "השלמת נתונים",
    bullet: "green",
    fields: [
      { key: "idIssueDate", label: "תאריך הנפקת תעודת זהות", type: "date" },
      { key: "maritalStatus", label: "סטטוס משפחתי", type: "select", options: MARITAL_Y },
      { key: "children", label: "מספר ילדים (מתחת לגיל 18)", type: "number" },
      { key: "spouseIdNumber", label: "ת.ז בן/בת זוג לאימות", type: "text" },
    ],
  },
  {
    id: "income",
    title: "הכנסות",
    bullet: "green",
    fields: [
      { key: "employment", label: "מצב תעסוקתי", type: "select", options: EMPLOYMENT_Y },
      { key: "employerAndRole", label: "שם מקום עבודה + תפקיד", type: "text" },
      { key: "seniority", label: "ותק במקום העבודה", type: "number" },
      { key: "monthlyIncome", label: "הכנסה חודשית", type: "money" },
      { key: "spouseNetPay", label: "תלוש אחרון נטו של בן/בת זוג", type: "money" },
      { key: "additionalIncome", label: "הכנסות נוספות", type: "textarea", wide: true },
      { key: "hasPension", label: "יש קרן פנסיה/השתלמות בבעלותך?", type: "select", options: PENSION_Y },
      { key: "pensionCompany", label: "באיזו חברת ביטוח הקרן מנוהלת?", type: "text", showIf: { key: "hasPension", equals: "כן" } },
      { key: "pensionAmount", label: "סכום משוער בקרנות?", type: "money", showIf: { key: "hasPension", equals: "כן" } },
      { key: "incomeNotes", label: "הערות", type: "textarea", wide: true },
    ],
  },
  {
    id: "housing",
    title: "מגורים / נכסים",
    bullet: "green",
    fields: [
      { key: "hasProperty", label: "נכס בבעלות", type: "select", options: ["יש", "אין"] },
      { key: "city", label: "עיר", type: "text" },
      { key: "address", label: "כתובת", type: "text" },
      { key: "housingType", label: "סוג מגורים", type: "select", options: HOUSING_Y },
      { key: "monthlyHousingPayment", label: "החזר חודשי משכנתא/שכירות", type: "money" },
      { key: "mortgageBank", label: "בנק מנהל משכנתא", type: "text", showIf: { key: "hasProperty", equals: "יש" } },
      { key: "propertyValue", label: "שווי מוערך", type: "money", showIf: { key: "hasProperty", equals: "יש" } },
      { key: "appraisalYear", label: "שנת שמאות", type: "number", showIf: { key: "hasProperty", equals: "יש" } },
      { key: "appraisalValue", label: "שווי השמאות", type: "money", showIf: { key: "hasProperty", equals: "יש" } },
      { key: "payoffBalance", label: "יתרת סילוק", type: "money", showIf: { key: "hasProperty", equals: "יש" } },
      { key: "soleOwner", label: "רשום רק על שם הלקוח", type: "select", options: ["כן", "לא"], showIf: { key: "hasProperty", equals: "יש" } },
      { key: "warningNote", label: "הערת אזהרה / הוצל\"פ", type: "text", showIf: { key: "hasProperty", equals: "יש" } },
    ],
  },
  {
    id: "vehicles",
    title: "רכבים",
    bullet: "green",
    fields: [
      { key: "hasVehicleRaw", label: "יש רכב", type: "select", options: ["כן", "כן משועבד", "לא"] },
      { key: "seizedBy", label: "לאן/למי השיעבוד", type: "text", showIf: { key: "hasVehicleRaw", equals: "כן משועבד" } },
      { key: "vehicleYearBand", label: "שנת ייצור", type: "select", options: ["מעל 2013", "מתחת 2013"], showIf: { key: "hasVehicleRaw", oneOf: ["כן", "כן משועבד"] } },
      { key: "vehicleNotes", label: "הערות", type: "textarea", wide: true, showIf: { key: "hasVehicleRaw", oneOf: ["כן", "כן משועבד"] } },
      { key: "upgradeCheckDate", label: "בדיקת הגדלה — תאריך", type: "date", showIf: { key: "hasVehicleRaw", oneOf: ["כן", "כן משועבד"] } },
      { key: "upgradeRoom", label: "מקום לתוספת", type: "money", showIf: { key: "hasVehicleRaw", oneOf: ["כן", "כן משועבד"] } },
      { key: "upgradeAmount", label: "סכום", type: "money", showIf: { key: "hasVehicleRaw", oneOf: ["כן", "כן משועבד"] } },
      { key: "vehicleFinalApproval", label: "אישור סופי", type: "select", options: ["כן", "לא"], showIf: { key: "hasVehicleRaw", oneOf: ["כן", "כן משועבד"] } },
      { key: "vehicleFinancer", label: "גוף ממן", type: "text", showIf: { key: "hasVehicleRaw", oneOf: ["כן", "כן משועבד"] } },
      { key: "vehicleLoanType", label: "סוג הלוואה", type: "text", showIf: { key: "hasVehicleRaw", oneOf: ["כן", "כן משועבד"] } },
      { key: "vehicleApprovedAmount", label: "סכום מאושר", type: "money", showIf: { key: "hasVehicleRaw", oneOf: ["כן", "כן משועבד"] } },
      { key: "vehicleMaxPayments", label: "תשלומים מקס'", type: "number", showIf: { key: "hasVehicleRaw", oneOf: ["כן", "כן משועבד"] } },
      { key: "vehicleInterest", label: "ריבית", type: "number", showIf: { key: "hasVehicleRaw", oneOf: ["כן", "כן משועבד"] } },
      { key: "vehicleMonthly", label: "החזר חודשי", type: "money", showIf: { key: "hasVehicleRaw", oneOf: ["כן", "כן משועבד"] } },
      { key: "vehicleFileOpened", label: "פתיחת תיק", type: "select", options: ["כן", "לא"], showIf: { key: "hasVehicleRaw", oneOf: ["כן", "כן משועבד"] } },
    ],
  },
  {
    id: "bank",
    title: "בנק",
    bullet: "green",
    fields: [
      { key: "bankName", label: "באיזה בנק", type: "select", options: BANKS_Y },
      { key: "bankBranch", label: "מספר סניף", type: "text" },
      { key: "bankAccount", label: "מספר חשבון", type: "text" },
      { key: "activeLoansFrom", label: "הלוואות פעילות ומאיפה", type: "multi-buttons", options: ACTIVE_LOANS_Y, wide: true },
      { key: "totalMonthlyPayment", label: "החזר חודשי כולל", type: "money" },
      { key: "totalDebt", label: "סך חוב לכל הגופים", type: "money" },
      { key: "loansDetail", label: "פירוט הלוואות / ריביות", type: "textarea", wide: true },
    ],
  },
  {
    id: "card-consent",
    title: "בדיקת חיווי אשראי — הסכמה ופרטי כרטיס",
    bullet: "green",
    fields: [
      {
        key: "consentScript", label: "תסריט ללקוח", type: "readonly", wide: true,
        note: "\"לצורך הבדיקה אני צריך את פרטי כרטיס האשראי שלך — הפרטים אינם נשמרים ואין שום חיוב.\"",
      },
      { key: "ccNumber", label: "מספר כרטיס", type: "text", ephemeral: true, placeholder: "אינו נשמר" },
      { key: "ccExpiry", label: "תוקף", type: "text", ephemeral: true, placeholder: "MM/YY" },
      { key: "ccCvv", label: "3 ספרות", type: "text", ephemeral: true, placeholder: "אינו נשמר" },
    ],
  },
  {
    id: "lenders",
    title: "גופי המימון — תוצאות בדיקה",
    custom: "lenders",
    fields: [],
  },
  {
    id: "calc",
    title: "חישובים",
    bullet: "green",
    fields: [
      { key: "calcRequiredPayment", label: "נדרש לתשלום", type: "money" },
      { key: "calcCloseDate", label: "תאריך סגירה", type: "date" },
      { key: "calcActualLenders", label: "אילו גופים נתנו בפועל", type: "multi-buttons", options: ["ישראכרט", "כאל", "מקס", "הפניקס", "בנק ירושלים", "קרנות/ביטוח"], wide: true },
      { key: "calcActualAmounts", label: "סכומים בפועל", type: "text", wide: true },
      { key: "calcFinalAmount", label: "סכום סופי", type: "money" },
      { key: "calcPaymentNoVat", label: "נדרש לתשלום ללא מע\"מ", type: "money" },
      { key: "calcPaymentWithVat", label: "נדרש לתשלום כולל מע\"מ", type: "money" },
      { key: "calcSavings", label: "השוואת ריביות — חיסכון מול הלוואה קיימת", type: "text", wide: true },
    ],
  },
  {
    id: "source",
    title: "מקור הליד",
    custom: "source",
    fields: [],
  },
  {
    id: "forms",
    title: "טפסים וקבצים",
    custom: "forms",
    fields: [],
  },
];

/** מפתחות של שדות שלא נשמרים לעולם */
export const EPHEMERAL_KEYS = new Set(
  CARD_SECTIONS.flatMap((s) => s.fields.filter((f) => f.ephemeral).map((f) => f.key)),
);
