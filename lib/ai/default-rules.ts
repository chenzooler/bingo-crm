// כללי הבקרה של בינגו - מה הנציג חייב (ואסור) לומר בשיחה.
// נזרעים ל-DB ב-prisma/seed.ts (upsert לפי שם, לא דורס עריכות UI).
// ה-criterion הוא ההנחיה שהמנוע בודק מולה - עברית חופשית, מנוסחת כטענה
// שאמורה להיות נכונה כדי לעבור.

export type DefaultRule = {
  name: string;
  description: string;
  kind: "required" | "forbidden";
  criterion: string;
  severity: "low" | "medium" | "high" | "critical";
  alertManager: boolean;
  appliesTo: "all" | "first-call" | "ramzor" | "closing";
  sortOrder: number;
};

export const DEFAULT_COMPLIANCE_RULES: DefaultRule[] = [
  {
    name: "הקראת נוסח ההסכמה לבדיקת רמזור",
    description: "לפני בדיקת נתוני אשראי חובה לקבל אישור מפורש מהלקוח.",
    kind: "required",
    criterion:
      "הנציג הקריא ללקוח שהוא מבקש אישור לבדוק את נתוני האשראי שלו במאגר BDI, וקיבל מהלקוח אישור מפורש בקול (למשל כן/אני מאשר). אם הנציג ביצע או הזכיר בדיקה בלי לבקש אישור - הכלל נכשל.",
    severity: "critical",
    alertManager: true,
    appliesTo: "ramzor",
    sortOrder: 10,
  },
  {
    name: "הצגה בשם בינגו",
    description: "פתיחת שיחה תקינה - שם הנציג ושם החברה.",
    kind: "required",
    criterion:
      "בתחילת השיחה הנציג הציג את עצמו בשמו וציין במפורש שהוא מחברת בינגו.",
    severity: "medium",
    alertManager: true,
    appliesTo: "all",
    sortOrder: 20,
  },
  {
    name: "הסבר על שכר טרחה",
    description: "שקיפות מלאה לגבי העמלה ומתי היא נגבית.",
    kind: "required",
    criterion:
      "הנציג הסביר ללקוח שקיים שכר טרחה לחברה, והבהיר שהוא נגבה רק לאחר קבלת ההלוואה בפועל (כלומר אם לא מתקבלת הלוואה - הלקוח לא משלם).",
    severity: "high",
    alertManager: true,
    appliesTo: "all",
    sortOrder: 30,
  },
  {
    name: "איסור הבטחת אישור",
    description: "אסור להבטיח ללקוח שההלוואה תאושר או לנקוב באחוזי הצלחה.",
    kind: "forbidden",
    criterion:
      "הנציג הבטיח ללקוח שההלוואה תאושר, אמר משפט כמו זה בטוח יעבור או אין בעיה תקבל, או נקב באחוזי הצלחה. כל אמירה כזאת אסורה. אמירה זהירה כמו נראה טוב או יש סיכוי סביר אינה הפרה.",
    severity: "critical",
    alertManager: true,
    appliesTo: "all",
    sortOrder: 40,
  },
  {
    name: "איסור הצגת ריבית כסופית לפני אישור",
    description: "אסור לנקוב בריבית או בהחזר חודשי כאילו הם סופיים לפני אישור הגוף המממן.",
    kind: "forbidden",
    criterion:
      "הנציג נקב בריבית מסוימת או בהחזר חודשי מסוים והציג אותם כסופיים או כמובטחים, לפני שהתקבל אישור מהגוף המממן. הצגת טווח משוער עם הבהרה שזה לא סופי אינה הפרה.",
    severity: "high",
    alertManager: true,
    appliesTo: "all",
    sortOrder: 50,
  },
  {
    name: "בדיקת מטרת ההלוואה",
    description: "מטרת ההלוואה מכתיבה את הגוף המממן המתאים.",
    kind: "required",
    criterion: "הנציג שאל את הלקוח למה הכסף מיועד או מה מטרת ההלוואה.",
    severity: "low",
    alertManager: false,
    appliesTo: "all",
    sortOrder: 60,
  },
  {
    name: "סיכום צעד הבא",
    description: "אסור לסיים שיחה בלי שהלקוח יודע מה קורה עכשיו ומתי חוזרים אליו.",
    kind: "required",
    criterion:
      "בסוף השיחה הנציג סיכם ללקוח מה הצעד הבא (מה נשלח אליו או מה הוא צריך לעשות) וגם מתי חוזרים אליו.",
    severity: "medium",
    alertManager: true,
    appliesTo: "closing",
    sortOrder: 70,
  },
];
