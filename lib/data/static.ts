import type { PipelineDef, StatusDef, User, SourceDef } from "../types";

export const USERS: User[] = [
  { id: 12251, name: "אריאל פרגן", role: "agent" },
  { id: 12266, name: "אסתר צולר", emoji: "💼", role: "owner" },
  { id: 12394, name: "חן צולר", emoji: "💼", role: "owner" },
  { id: 12533, name: "עמנואל פרגן", emoji: "💸", role: "agent" },
  { id: 12688, name: "רועי גוזלן", emoji: "💸", role: "agent" },
  { id: 13506, name: "מגי ארגאו", role: "underwriter" },
  { id: 13508, name: "רותם טופז", role: "underwriter" },
  { id: 13683, name: "יוסף אברהם", emoji: "👨‍💼", role: "manager" },
  { id: 13897, name: "תותח שיחות", role: "bot" },
  { id: 13986, name: "יוני קיטל", emoji: "👨‍💼", role: "manager" },
  { id: 14053, name: "WOKI", emoji: "🗳️", role: "bot" },
  { id: 14069, name: "אלעד ברומר", emoji: "📝", role: "underwriter" },
  { id: 14117, name: "ניסן מליחי", emoji: "👨‍💼", role: "manager" },
  { id: 14308, name: "בר סולטן", emoji: "📝", role: "underwriter" },
  { id: 14367, name: "יובל יקיר", emoji: "📝", role: "underwriter" },
  { id: 14369, name: "חנה פינטו", emoji: "📝", role: "underwriter" },
  { id: 14543, name: "דודו ווקנין", emoji: "📝", role: "underwriter" },
  { id: 14620, name: "מנדי שיווק", role: "marketing" },
  { id: 14656, name: "דניאל רחמים", emoji: "📝", role: "underwriter" },
  { id: 14657, name: "גל לוי", emoji: "📝", role: "underwriter" },
  { id: 14658, name: "דנה אדרי", emoji: "📝", role: "underwriter" },
  { id: 14671, name: "ליה מיזלס", emoji: "📝", role: "underwriter" },
  { id: 14672, name: "שי צברי", emoji: "📝", role: "underwriter" },
  { id: 14673, name: "טום גליקין", emoji: "📝", role: "underwriter" },
  { id: 14686, name: "יהודית עצור", emoji: "📝", role: "underwriter" },
  { id: 14687, name: "דניאל דוד יוסף", emoji: "📝", role: "underwriter" },
];

export const PIPELINES: PipelineDef[] = [
  { key: "underwriting", label: "מחלקת החתמות", emoji: "📝", color: "blue", count: 793 },
  { key: "irrelevant", label: "לא מעוניינים / רלוונטים", emoji: "🚫", color: "red", count: 11460 },
  { key: "general-loan", label: "הלוואה לכל מטרה", emoji: "💸", color: "green", count: 6969 },
  { key: "vehicle", label: "מחלקת רכב", emoji: "🚗", color: "orange", count: 11578 },
  { key: "retention-yoni", label: "שימורים יוני", emoji: "🤝", color: "purple", count: 2527 },
  { key: "archive", label: "כל הלידים - לא רלוונטי", emoji: "📦", color: "gray", count: 52133 },
  { key: "wati", label: "פרסום WATI - כל מטרה", emoji: "💬", color: "green", count: 60467 },
  { key: "spam", label: "ספאם / מספר לא תקין", emoji: "🚯", color: "red", count: 14028 },
  { key: "legal", label: "טיפול משפטי", emoji: "⚖️", color: "orange", count: 129 },
];

export const STATUSES: StatusDef[] = [
  // underwriting
  { key: "u-collide", label: "קולייד", emoji: "🌀", pipeline: "underwriting", color: "blue", count: 1 },
  { key: "u-new", label: "ליד חדש", emoji: "🆕", pipeline: "underwriting", color: "green", count: 415 },
  { key: "u-callback", label: "לחזור ללקוח", emoji: "🔁", pipeline: "underwriting", color: "yellow", count: 159 },
  { key: "u-eligibility-loan", label: "בדיקת זכאות-הלוואה לכל מטרה", emoji: "🩺", pipeline: "underwriting", color: "blue", count: 3 },
  { key: "u-no-answer", label: "אין מענה", emoji: "📞", pipeline: "underwriting", color: "orange", count: 215 },
  { key: "u-eligibility-car", label: "בדיקת זכאות-הלוואה כנגד רכב", emoji: "🚗", pipeline: "underwriting", color: "blue", count: 0 },

  // irrelevant
  { key: "i-no-details", label: "לא השאיר פרטים", emoji: "🟥", pipeline: "irrelevant", color: "red", count: 104 },
  { key: "i-not-relevant", label: "לא רלוונטי / הסתדר לבד", emoji: "🟧", pipeline: "irrelevant", color: "orange", count: 479 },
  { key: "i-uncooperative", label: "לא משתף פעולה", emoji: "🟨", pipeline: "irrelevant", color: "yellow", count: 43 },
  { key: "i-no-after-explain", label: "לא מעוניין לאחר הסבר", emoji: "🟩", pipeline: "irrelevant", color: "green", count: 46 },
  { key: "i-no-contract", label: "לא חותם על הסכם התקשרות", emoji: "🟦", pipeline: "irrelevant", color: "blue", count: 7 },
  { key: "i-too-good", label: "טוב מידי", emoji: "🟪", pipeline: "irrelevant", color: "purple", count: 24 },
  { key: "i-young", label: "גיל נמוך - מתחת 25", emoji: "🧒", pipeline: "irrelevant", color: "gray", count: 134 },
  { key: "i-no-citizenship", label: "עולה חדש / אין אזרחות", emoji: "🛂", pipeline: "irrelevant", color: "gray", count: 59 },
  { key: "i-other-person", label: "השאיר פרטים עבור אחר", emoji: "👥", pipeline: "irrelevant", color: "gray", count: 35 },
  { key: "i-mortgage-interest", label: "מעוניין במשכנתא", emoji: "🏠", pipeline: "irrelevant", color: "blue", count: 10 },
  { key: "i-rejected-all", label: "סורב בכל הגופים", emoji: "❌", pipeline: "irrelevant", color: "red", count: 1416 },
  { key: "i-bdi-bad", label: "BDI שלילי", emoji: "🚷", pipeline: "irrelevant", color: "red", count: 9103 },

  // general-loan
  { key: "g-ready", label: "מוכן לבדיקה", emoji: "🔍", pipeline: "general-loan", color: "blue", count: 0 },
  { key: "g-no-answer", label: "אין מענה", emoji: "📞", pipeline: "general-loan", color: "orange", count: 1 },
  { key: "g-callback", label: "לחזור ללקוח", emoji: "🔁", pipeline: "general-loan", color: "yellow", count: 3 },
  { key: "g-not-interested-check", label: "לא מעוניין לבצע בדיקות", emoji: "🚫", pipeline: "general-loan", color: "red", count: 380 },
  { key: "g-whatsapp-retention", label: "שימור ווצאפ", emoji: "💬", pipeline: "general-loan", color: "green", count: 0 },
  { key: "g-approved-final", label: "הלוואה מאושרת – לאישור סופי", emoji: "✅", pipeline: "general-loan", color: "green", count: 5 },
  { key: "g-final-id", label: "אישור סופי - השלמת זיהוי", emoji: "📱", pipeline: "general-loan", color: "blue", count: 1 },
  { key: "g-final-courier", label: "אישור סופי - ממתין לשליח", emoji: "🛵", pipeline: "general-loan", color: "blue", count: 1 },
  { key: "g-pension-docs", label: "ממתין למסמכים-פנסיה", emoji: "🛡️", pipeline: "general-loan", color: "purple", count: 1 },
  { key: "g-jbank-principal", label: "אישור עקרוני - בנק ירושלים", emoji: "🏦", pipeline: "general-loan", color: "blue", count: 0 },
  { key: "g-jbank-branch", label: "משויך לסניף - בנק ירושלים", emoji: "📍", pipeline: "general-loan", color: "blue", count: 1 },
  { key: "g-jbank-account", label: "ממתין לעו\"ש - בנק ירושלים", emoji: "⏳", pipeline: "general-loan", color: "blue", count: 0 },
  { key: "g-jbank-final", label: "ממתין לאישור סופי - בנק ירושלים", emoji: "🕒", pipeline: "general-loan", color: "blue", count: 0 },
  { key: "g-no-final", label: "לא מעוניין באישור הסופי", emoji: "❗", pipeline: "general-loan", color: "red", count: 493 },
  { key: "g-pension-loan", label: "ממתין להלוואה-פנסיה", emoji: "💰", pipeline: "general-loan", color: "purple", count: 4 },
  { key: "g-waiting-loan", label: "ממתין להלוואה", emoji: "🕰️", pipeline: "general-loan", color: "yellow", count: 17 },
  { key: "g-got-loan", label: "קיבל הלוואה", emoji: "💰", pipeline: "general-loan", color: "green", count: 4 },
  { key: "g-paid", label: "שילם", emoji: "💵", pipeline: "general-loan", color: "green", count: 723 },
  { key: "g-rejected", label: "סורב", emoji: "❌", pipeline: "general-loan", color: "red", count: 4405 },
  { key: "g-bdi-bad", label: "BDI שלילי", emoji: "🚷", pipeline: "general-loan", color: "red", count: 792 },
  { key: "g-id-invalid", label: "תז לא בתוקף", emoji: "🆔", pipeline: "general-loan", color: "red", count: 138 },

  // vehicle (subset of most important)
  { key: "v-other-process", label: "ליד בתהליך אחר - שיעבוד חדש", emoji: "📑", pipeline: "vehicle", color: "blue", count: 501 },
  { key: "v-direct-other", label: "ליד בתהליך אחר-בדיקת הגדלה-מימון ישיר", emoji: "📈", pipeline: "vehicle", color: "blue", count: 2 },
  { key: "v-fama-other", label: "ליד בתהליך אחר-בדיקת הגדלה-פמה", emoji: "🚕", pipeline: "vehicle", color: "blue", count: 0 },
  { key: "v-new-encumbrance", label: "ליד חדש - שיעבוד חדש", emoji: "🆕", pipeline: "vehicle", color: "green", count: 0 },
  { key: "v-direct-new-add", label: "ליד חדש - אושר לתוספת הגדלה-מימון ישיר", emoji: "🆕", pipeline: "vehicle", color: "green", count: 52 },
  { key: "v-fama-new-add", label: "ליד חדש - אושר לתוספת הגדלה-פמה", emoji: "🚕", pipeline: "vehicle", color: "green", count: 36 },
  { key: "v-no-answer", label: "אין מענה", emoji: "📞", pipeline: "vehicle", color: "orange", count: 4 },
  { key: "v-callback", label: "לחזור ללקוח", emoji: "🔁", pipeline: "vehicle", color: "yellow", count: 5 },
  { key: "v-waiting-docs", label: "ממתין למסמכים", emoji: "📂", pipeline: "vehicle", color: "yellow", count: 12 },
  { key: "v-waiting-final", label: "ממתין לאישור סופי", emoji: "⏳", pipeline: "vehicle", color: "yellow", count: 1 },
  { key: "v-sign-contract", label: "אישור סופי - להחתים חוזה", emoji: "🖊️", pipeline: "vehicle", color: "blue", count: 4 },
  { key: "v-test-missing", label: "חסר טסט - תיק מסובך", emoji: "📉", pipeline: "vehicle", color: "orange", count: 7 },
  { key: "v-final-win", label: "ממתין לזכייה / ביטוח", emoji: "🎯", pipeline: "vehicle", color: "blue", count: 2 },
  { key: "v-waiting-loan", label: "ממתין להלוואה", emoji: "🕰️", pipeline: "vehicle", color: "yellow", count: 10 },
  { key: "v-got-loan", label: "קיבל הלוואה", emoji: "💰", pipeline: "vehicle", color: "green", count: 3 },
  { key: "v-paid", label: "שילם", emoji: "💵", pipeline: "vehicle", color: "green", count: 1142 },
  { key: "v-not-relevant-after-docs", label: "לא רלוונטי לאחר מסמכים", emoji: "📄", pipeline: "vehicle", color: "red", count: 2768 },
  { key: "v-no-room-direct", label: "אין מקום לתוספת-מימון ישיר", emoji: "➕", pipeline: "vehicle", color: "red", count: 4363 },
  { key: "v-no-room-fama", label: "אין מקום לתוספת-פמה", emoji: "🚕", pipeline: "vehicle", color: "red", count: 525 },
  { key: "v-not-interested", label: "לא מעוניין שיחה ראשונית", emoji: "🚫", pipeline: "vehicle", color: "red", count: 52 },
  { key: "v-no-final", label: "לא מעוניין באישור הסופי", emoji: "❗", pipeline: "vehicle", color: "red", count: 5 },
  { key: "v-rejected", label: "סורב", emoji: "❌", pipeline: "vehicle", color: "red", count: 1915 },
  { key: "v-rejected-red", label: "סורב - אדום!", emoji: "🛑", pipeline: "vehicle", color: "red", count: 169 },

  // ───────────────────────────────────────────────────────────
  // GENERIC UNDERWRITING ADDITIONS (workflow-wide statuses)
  // ───────────────────────────────────────────────────────────
  { key: "u-waiting-docs", label: "ממתין למסמכים", emoji: "📑", pipeline: "underwriting", color: "yellow", count: 87 },
  { key: "u-waiting-final", label: "ממתין לאישור סופי", emoji: "⏳", pipeline: "underwriting", color: "yellow", count: 42 },
  { key: "u-sign-contract", label: "אישור סופי - להחתים חוזה", emoji: "✍️", pipeline: "underwriting", color: "green", count: 18 },
  { key: "u-waiting-insurance", label: "ממתין לביטוח", emoji: "🛡️", pipeline: "underwriting", color: "yellow", count: 11 },
  { key: "u-waiting-win", label: "ממתין לזכייה / זיהוי", emoji: "🎯", pipeline: "underwriting", color: "blue", count: 9 },
  { key: "u-waiting-loan", label: "ממתין להלוואה", emoji: "⌛", pipeline: "underwriting", color: "yellow", count: 23 },
  { key: "u-got-loan", label: "קיבל הלוואה", emoji: "💰", pipeline: "underwriting", color: "green", count: 14 },
  { key: "u-final-id", label: "אישור סופי - השלמת זיהוי", emoji: "🪪", pipeline: "underwriting", color: "blue", count: 7 },
  { key: "u-deal-cancel", label: "ביטול עסקה", emoji: "🚫", pipeline: "underwriting", color: "red", count: 31 },
  { key: "u-deleted", label: "תהליך נמחק", emoji: "🗑️", pipeline: "underwriting", color: "gray", count: 19 },
  { key: "u-first-no-interest", label: "עבר ללא מעוניינים מהשיחה הראשונית", emoji: "👋", pipeline: "underwriting", color: "red", count: 56 },

  // ───────────────────────────────────────────────────────────
  // RETENTION YONI (y-*) — 2,527 leads
  // ───────────────────────────────────────────────────────────
  { key: "y-pool", label: "מאגר לידים יוני", emoji: "🏊", pipeline: "retention-yoni", color: "purple", count: 1247 },
  { key: "y-new-vehicle", label: "ליד חדש שימור רכב", emoji: "🚗", pipeline: "retention-yoni", color: "purple", count: 184 },
  { key: "y-new-general", label: "ליד חדש שימור הלוואה לכל מטרה", emoji: "💸", pipeline: "retention-yoni", color: "purple", count: 213 },
  { key: "y-new-purchase", label: "ליד חדש קניית שיעבוד", emoji: "🛒", pipeline: "retention-yoni", color: "purple", count: 67 },
  { key: "y-callback", label: "לחזור ללקוח (שימור)", emoji: "📞", pipeline: "retention-yoni", color: "yellow", count: 142 },
  { key: "y-no-answer", label: "אין מענה (שימור)", emoji: "📵", pipeline: "retention-yoni", color: "yellow", count: 198 },
  { key: "y-interested", label: "חזר להתעניין", emoji: "🔥", pipeline: "retention-yoni", color: "green", count: 89 },
  { key: "y-docs-purchase", label: "להשלים מסמכים קניית שיעבוד", emoji: "📑", pipeline: "retention-yoni", color: "yellow", count: 34 },
  { key: "y-waiting-loan", label: "ממתין להלוואה (שימורים יוני)", emoji: "⌛", pipeline: "retention-yoni", color: "yellow", count: 52 },
  { key: "y-got-loan", label: "סגר דרך שימור!", emoji: "🎉", pipeline: "retention-yoni", color: "green", count: 41 },
  { key: "y-paid", label: "שילם דרך שימור", emoji: "💵", pipeline: "retention-yoni", color: "green", count: 187 },
  { key: "y-not-interested", label: "לא חוזר (שימור)", emoji: "👋", pipeline: "retention-yoni", color: "red", count: 73 },

  // ───────────────────────────────────────────────────────────
  // WATI (w-*) — 60,467 leads
  // ───────────────────────────────────────────────────────────
  { key: "w-incoming", label: "פנייה חדשה ב-WATI", emoji: "💬", pipeline: "wati", color: "green", count: 1247 },
  { key: "w-bot-screening", label: "בבדיקת בוט", emoji: "🤖", pipeline: "wati", color: "blue", count: 423 },
  { key: "w-handed-to-agent", label: "הועבר לנציג", emoji: "👤", pipeline: "wati", color: "green", count: 287 },
  { key: "w-no-response", label: "לא הגיב לבוט", emoji: "📭", pipeline: "wati", color: "yellow", count: 8743 },
  { key: "w-promo", label: "תגובה לקמפיין", emoji: "📣", pipeline: "wati", color: "blue", count: 12389 },
  { key: "w-faq", label: "שאלה ב-FAQ", emoji: "❓", pipeline: "wati", color: "gray", count: 4621 },
  { key: "w-greeting", label: "ברכה / שלום", emoji: "👋", pipeline: "wati", color: "gray", count: 5832 },
  { key: "w-spam-detected", label: "זוהה כספאם ב-WATI", emoji: "🚯", pipeline: "wati", color: "red", count: 18743 },
  { key: "w-broadcast-reply", label: "תגובה ל-Broadcast", emoji: "📢", pipeline: "wati", color: "blue", count: 8182 },

  // ───────────────────────────────────────────────────────────
  // LEGAL (l-*) — 129 leads
  // ───────────────────────────────────────────────────────────
  { key: "l-pending", label: "פתיחת תיק משפטי", emoji: "📋", pipeline: "legal", color: "orange", count: 34 },
  { key: "l-in-court", label: "בטיפול עורך דין", emoji: "⚖️", pipeline: "legal", color: "orange", count: 47 },
  { key: "l-mediation", label: "גישור / משא ומתן", emoji: "🤝", pipeline: "legal", color: "yellow", count: 18 },
  { key: "l-settlement", label: "פשרה הושגה", emoji: "✅", pipeline: "legal", color: "green", count: 12 },
  { key: "l-judgement", label: "פסק דין", emoji: "🔨", pipeline: "legal", color: "red", count: 8 },
  { key: "l-bankruptcy", label: "פשיטת רגל", emoji: "💸", pipeline: "legal", color: "red", count: 5 },
  { key: "l-closed", label: "תיק נסגר", emoji: "📁", pipeline: "legal", color: "gray", count: 5 },

  // ───────────────────────────────────────────────────────────
  // SPAM (s-*) — 14,028 leads
  // ───────────────────────────────────────────────────────────
  { key: "s-invalid-phone", label: "מספר לא תקין", emoji: "📵", pipeline: "spam", color: "red", count: 6824 },
  { key: "s-foreign-phone", label: "מספר זר", emoji: "🌍", pipeline: "spam", color: "red", count: 1247 },
  { key: "s-bot-detected", label: "זוהה כבוט", emoji: "🤖", pipeline: "spam", color: "red", count: 2143 },
  { key: "s-duplicate-spam", label: "כפיל / ספאם", emoji: "👥", pipeline: "spam", color: "red", count: 1842 },
  { key: "s-blacklist", label: "ברשימה שחורה", emoji: "🚷", pipeline: "spam", color: "red", count: 437 },
  { key: "s-no-data", label: "ללא נתונים", emoji: "❓", pipeline: "spam", color: "gray", count: 1535 },

  // ───────────────────────────────────────────────────────────
  // ARCHIVE (a-*) — 52,133 leads
  // ───────────────────────────────────────────────────────────
  { key: "a-cold-6m", label: "קר 6 חודשים", emoji: "❄️", pipeline: "archive", color: "blue", count: 18432 },
  { key: "a-cold-1y", label: "קר שנה+", emoji: "🧊", pipeline: "archive", color: "blue", count: 24187 },
  { key: "a-historical", label: "היסטורי (מעל שנתיים)", emoji: "📚", pipeline: "archive", color: "gray", count: 7843 },
  { key: "a-deleted", label: "תהליך נמחק (ארכיב)", emoji: "🗑️", pipeline: "archive", color: "gray", count: 1247 },
  { key: "a-merged", label: "מוזג עם ליד אחר", emoji: "🔗", pipeline: "archive", color: "gray", count: 424 },

  // ───────────────────────────────────────────────────────────
  // IRRELEVANT additions
  // ───────────────────────────────────────────────────────────
  { key: "i-deal-cancel", label: "ביטול עסקה לאחר אישור", emoji: "🚫", pipeline: "irrelevant", color: "red", count: 87 },
  { key: "i-cooling", label: "תקופת התקררות", emoji: "🥶", pipeline: "irrelevant", color: "gray", count: 134 },
  { key: "i-disrespect", label: "התנהגות לא ראויה", emoji: "⛔", pipeline: "irrelevant", color: "red", count: 23 },
];

export const SOURCES: SourceDef[] = [
  { key: "facebook", label: "פייסבוק", color: "#1877F2" },
  { key: "tiktok", label: "טיק טוק", color: "#000000" },
  { key: "google", label: "גוגל", color: "#4285F4" },
  { key: "landing-page", label: "דף נחיתה", color: "#50FF0A" },
  { key: "website", label: "אתר אינטרנט", color: "#2EA10D" },
  { key: "newsletter", label: "ניוזלטר", color: "#FF9D29" },
  { key: "referral-bank", label: "הופנה מבנק", color: "#2D7BF7" },
  { key: "phone", label: "טלפון", color: "#8B5CF6" },
  { key: "lead-providers", label: "ספקי לידים", color: "#EC4899" },
  { key: "fax", label: "פקסים", color: "#6B7280" },
  { key: "wati", label: "WATI", color: "#25D366" },
  { key: "sms", label: "SMS", color: "#FFCB1F" },
];

export const LOAN_PURPOSES: { key: string; label: string }[] = [
  { key: "debt-cover", label: "כיסוי חוב" },
  { key: "family-help", label: "עזרה לבן משפחה" },
  { key: "studies", label: "לימודים" },
  { key: "vacation", label: "חופשה" },
  { key: "event", label: "אירוע" },
  { key: "business", label: "עסק" },
  { key: "renovation", label: "שיפוץ" },
  { key: "housing", label: "דיור / משכנתא" },
  { key: "shopping", label: "קניות" },
  { key: "vehicle", label: "רכב" },
  { key: "health", label: "בריאותי" },
  { key: "other", label: "אחר" },
];

export function getUser(id: number) {
  return USERS.find((u) => u.id === id);
}

export function getStatus(key: string) {
  return STATUSES.find((s) => s.key === key);
}

export function getPipeline(key: string) {
  return PIPELINES.find((p) => p.key === key);
}
