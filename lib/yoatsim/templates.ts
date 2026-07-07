/**
 * שכפול Yoatsim 1:1 — תבניות הודעות (SMS / WhatsApp / WATI).
 * מקור: docs/yoatsim-full-spec.md §2.4 — כל שם שהאפיון מונה, כולל פירוק
 * הווריאציות (רגיל/רותם, 1/2, סמס+מייל). מבנה כמו במקור: שם פנימי · שולח
 * (ריק = הטלפון של היוזר / מספר קבוע 972505696756 / bingoisrael / bingocredit)
 * · גוף (טקסט חופשי או JSON ל-WATI).
 *
 * גופי ההודעות שהאפיון לא ציטט שוחזרו לפי ההקשר העסקי — ניתנים לעריכה מלאה
 * במסך ההגדרות (נזרעים ל-DB, מודל MessageTemplate). משתנים: {{firstName}} וכו'.
 */

export interface TemplateDef {
  name: string;
  channel: "sms" | "whatsapp" | "wati" | "email";
  /** ריק = נשלח מהטלפון של היוזר המחובר */
  sender: "" | "972505696756" | "bingoisrael" | "bingocredit";
  body?: string;
  wati?: {
    template_name: string;
    broadcast_name: string;
    parameters: { name: string; value: string }[];
    buttons?: { type: "url"; url: string }[];
  };
}

const SIGN_URL = "https://crm.bingoisrael.co.il/sign/{{leadId}}";

export const TEMPLATES: TemplateDef[] = [
  {
    name: "BDI שלילי",
    channel: "sms",
    sender: "",
    body: "היי {{firstName}}, כאן בינגו — מימון בול בשבילך. לצערנו בבדיקה הראשונית עלה חיווי אשראי שלילי, ולכן לא נוכל להתקדם בבקשה במסלול הרגיל. אם יש בבעלותך רכב — ייתכן שנוכל לעזור במסלול הלוואה כנגד רכב. נשמח לעמוד לרשותך: 972505696756",
  },
  {
    name: "WATI-אופציה חדשה",
    channel: "wati",
    sender: "bingoisrael",
    wati: {
      template_name: "new_option",
      broadcast_name: "אופציה חדשה",
      parameters: [{ name: "name", value: "{{firstName}}" }],
      buttons: [{ type: "url", url: "https://bingoisrael.co.il" }],
    },
  },
  {
    name: "WATI-דני עם בשורה",
    channel: "wati",
    sender: "bingoisrael",
    wati: {
      template_name: "dani_news",
      broadcast_name: "דני עם בשורה",
      parameters: [{ name: "name", value: "{{firstName}}" }],
    },
  },
  {
    name: "WATI-חן צולר",
    channel: "wati",
    sender: "bingoisrael",
    wati: {
      template_name: "chen_zooler",
      broadcast_name: "חן צולר",
      parameters: [{ name: "name", value: "{{firstName}}" }],
    },
  },
  {
    name: "WATI-פרסום כל מטרה",
    channel: "wati",
    sender: "bingocredit",
    wati: {
      template_name: "promo_all_purpose",
      broadcast_name: "פרסום כל מטרה",
      parameters: [{ name: "name", value: "{{firstName}}" }],
      buttons: [{ type: "url", url: "https://bingoisrael.co.il" }],
    },
  },
  {
    name: "אין מענה אישורים",
    channel: "sms",
    sender: "",
    body: "היי {{firstName}}, ניסינו להשיג אותך בנוגע לאישורי ההלוואה שלך בבינגו ולא היה מענה. חשוב שנדבר כדי לא לאבד את האישור — חייג/י אלינו חזרה: 972505696756",
  },
  {
    name: "אין מענה נכסים 1",
    channel: "sms",
    sender: "",
    body: "היי {{firstName}}, כאן מחלקת הנכסים של בינגו. ניסינו להשיג אותך ללא מענה. נשמח לתאם שיחה קצרה בנושא הבקשה שלך — השב/י להודעה או חייג/י 972505696756",
  },
  {
    name: "אין מענה נכסים 2",
    channel: "sms",
    sender: "",
    body: "היי {{firstName}}, זו פנייה שנייה ממחלקת הנכסים של בינגו — עדיין לא הצלחנו להשיג אותך. אם הנושא עדיין רלוונטי נשמח שתחזור/תחזרי אלינו: 972505696756",
  },
  {
    name: "אין מענה פרסום",
    channel: "whatsapp",
    sender: "972505696756",
    body: "היי {{firstName}} 👋 פנית אלינו בעקבות הפרסום של בינגו וניסינו לחזור אליך ללא מענה. עדיין מעוניין/ת בהלוואה? השב/י כאן ונחזור אליך מיד.",
  },
  {
    name: "הודעה ראשונית-נכסים",
    channel: "whatsapp",
    sender: "972505696756",
    body: "היי {{firstName}}, כאן מחלקת הנכסים של בינגו — מימון בול בשבילך 🏠 קיבלנו את פנייתך בנושא הלוואה כנגד נכס. כדי להתקדם נצטרך נסח טאבו ודוח אשראי. נציג יחזור אליך בהקדם.",
  },
  {
    name: "זיהוי ישראכרט",
    channel: "sms",
    sender: "",
    body: "היי {{firstName}}, לצורך השלמת הזיהוי מול ישראכרט ישלח אליך קוד ב-SMS. אנא הקרא/י לנציג את הקוד ברגע שמתקבל. תודה, בינגו.",
  },
  {
    name: "זיהוי רועי",
    channel: "sms",
    sender: "",
    body: "היי {{firstName}}, כאן רועי מבינגו. לצורך השלמת הזיהוי אשלח לך עכשיו קוד אימות — אנא החזר/י אותו אליי בהודעה. תודה!",
  },
  {
    name: "המשך שיחה",
    channel: "whatsapp",
    sender: "",
    body: "היי {{firstName}}, בהמשך לשיחתנו — מצרף/ת כאן את הפרטים שסיכמנו. לכל שאלה אני זמין/ה כאן. בינגו — מימון בול בשבילך 💚",
  },
  {
    name: "הסכם סמס",
    channel: "sms",
    sender: "",
    body: "היי {{firstName}}, מצורף קישור להסכם ההתקשרות עם בינגו לחתימה דיגיטלית: " + SIGN_URL + " — החתימה אורכת פחות מדקה.",
  },
  {
    name: "הסכם מייל",
    channel: "email",
    sender: "",
    body: "שלום {{firstName}},\n\nמצורף קישור להסכם ההתקשרות עם בינגו — מימון בול בשבילך:\n" + SIGN_URL + "\n\nלאחר החתימה נתקדם מיד לבדיקות הזכאות.\n\nבברכה,\nצוות בינגו",
  },
  {
    name: "חיסיון סופי (אישור עקרוני)",
    channel: "whatsapp",
    sender: "972505696756",
    body: "היי {{firstName}}, חדשות טובות 🎉 התקבל אישור עקרוני לבקשתך! נציג יחזור אליך עם פירוט התנאים והמסמכים הנדרשים להמשך.",
  },
  {
    name: "חשבונית לקוח",
    channel: "whatsapp",
    sender: "972505696756",
    body: "היי {{firstName}}, מצורפת החשבונית עבור שכר הטרחה כפי שסוכם. תודה שבחרת בבינגו — מימון בול בשבילך 💚",
  },
  {
    name: "לא מעוניין ראשוני",
    channel: "sms",
    sender: "",
    body: "היי {{firstName}}, הבנו שכרגע זה לא הזמן הנכון. אם תרצה/י לבדוק זכאות להלוואה בעתיד — אנחנו כאן. בינגו — מימון בול בשבילך.",
  },
  {
    name: "לחזור ללקוח",
    channel: "sms",
    sender: "",
    body: "היי {{firstName}}, כפי שביקשת נחזור אליך במועד שסיכמנו. אם משהו השתנה — אפשר לחייג אלינו בכל שלב: 972505696756. בינגו.",
  },
  {
    name: "לקוח נדחה (רגיל)",
    channel: "sms",
    sender: "",
    body: "היי {{firstName}}, לצערנו לאחר בדיקה מול הגופים המממנים לא אושרה הבקשה בשלב זה. ניתן לנסות שוב בעוד מספר חודשים. תודה שפנית לבינגו.",
  },
  {
    name: "לקוח נדחה (רותם)",
    channel: "sms",
    sender: "",
    body: "היי {{firstName}}, כאן רותם מבינגו. לצערי לאחר בדיקה מעמיקה לא נוכל לאשר את הבקשה כרגע. אם המצב ישתנה — נשמח לבדוק שוב. בהצלחה!",
  },
  {
    name: "מיופה כח+הגנת הפרט",
    channel: "whatsapp",
    sender: "972505696756",
    body: "היי {{firstName}}, לצורך המשך הטיפול מצורפים טופס ייפוי כוח וטופס הסכמה לפי חוק הגנת הפרטיות לחתימה: " + SIGN_URL,
  },
  {
    name: "מסמכים בנק 3 חודשים",
    channel: "whatsapp",
    sender: "972505696756",
    body: "היי {{firstName}}, להמשך הטיפול נדרשים: תדפיסי עו\"ש של 3 החודשים האחרונים + צילום ת.ז + תלושי שכר אחרונים. אפשר לצלם ולשלוח כאן בווטסאפ 📎",
  },
  {
    name: "מסמכים כנגד פנסיה",
    channel: "whatsapp",
    sender: "972505696756",
    body: "היי {{firstName}}, עבור הלוואה כנגד קרן פנסיה/השתלמות נדרשים: דוח שנתי אחרון מהקרן + צילום ת.ז + אישור ניהול חשבון. אפשר לשלוח כאן 📎",
  },
  {
    name: "מסמכים לחתימה",
    channel: "whatsapp",
    sender: "972505696756",
    body: "היי {{firstName}}, מצורפים המסמכים לחתימה דיגיטלית: " + SIGN_URL + " — לאחר החתימה נמשיך מיד בתהליך.",
  },
  {
    name: "מסמכים רכב",
    channel: "whatsapp",
    sender: "972505696756",
    body: "היי {{firstName}}, עבור הלוואה כנגד רכב נדרשים: רישיון רכב בתוקף + טסט + צילום ת.ז + תדפיסי עו\"ש 3 חודשים. אפשר לצלם ולשלוח כאן 🚗📎",
  },
  {
    name: "מציב הסכם ההתקשרות",
    channel: "whatsapp",
    sender: "972505696756",
    body: "היי {{firstName}}, כפי שסיכמנו בשיחה — מצורף הסכם ההתקשרות עם בינגו לחתימה: " + SIGN_URL + " לאחר החתימה נחזור אליך תוך כשעה עם תוצאות הבדיקות.",
  },
  {
    name: "פרסום-מלא לידים",
    channel: "sms",
    sender: "972505696756",
    body: "בינגו — מימון בול בשבילך 💚 הלוואות עד 100,000 ₪ בכל מטרה, גם אם סורבת בבנק. בדיקת זכאות חינם: https://bingoisrael.co.il להסרה השב הסר",
  },
  {
    name: "קבלת ליד חדש (רגיל)",
    channel: "sms",
    sender: "",
    body: "היי {{firstName}}, תודה שפנית לבינגו — מימון בול בשבילך! קיבלנו את פנייתך ונציג מטעמנו יחזור אליך בדקות הקרובות.",
  },
  {
    name: "קבלת ליד חדש (שאלון)",
    channel: "whatsapp",
    sender: "bingoisrael",
    body: "היי {{firstName}} 👋 תודה שפנית לבינגו! כדי לזרז את הבדיקה — מלא/י את השאלון הדיגיטלי הקצר: https://bingoisrael.co.il/questionnaire נחזור אליך מיד בסיום.",
  },
  {
    name: "שכר טרחה",
    channel: "whatsapp",
    sender: "972505696756",
    body: "היי {{firstName}}, ההלוואה בדרך אליך 🎉 להשלמת התהליך נותר תשלום שכר הטרחה כפי שסוכם: {{feeAmount}} ₪. קישור לתשלום מאובטח יישלח בהודעה נפרדת.",
  },
  {
    name: "תודה BINGO",
    channel: "whatsapp",
    sender: "bingoisrael",
    body: "{{firstName}}, תודה שבחרת בבינגו — מימון בול בשבילך! 💚 היה לנו לעונג ללוות אותך. נשמח אם תמליץ/י עלינו לחברים — ולכל צורך עתידי אנחנו כאן.",
  },
];

export const TEMPLATES_COUNT = TEMPLATES.length;
