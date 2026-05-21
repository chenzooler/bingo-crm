/**
 * Mock AI Assistant — simulates a knowledgeable agent assistant.
 * In production this would stream from Claude/GPT with tools.
 */

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  suggestions?: string[];
  citations?: { label: string; href: string }[];
  data?: Array<{ label: string; value: string; href?: string }>;
}

export interface QuickAction {
  emoji: string;
  label: string;
  prompt: string;
}

export const QUICK_ACTIONS: QuickAction[] = [
  { emoji: "🔥", label: "מי הלידים החמים שלי?", prompt: "תראה לי את הלידים הכי חמים שלי כרגע" },
  { emoji: "📞", label: "למי לחייג עכשיו?", prompt: "תמליץ לי על 3 לידים שכדאי לחייג אליהם בשעה הזאת" },
  { emoji: "💰", label: "מה ביצועי החודש?", prompt: "סכם לי את הביצועים שלי החודש" },
  { emoji: "📝", label: "תכין תסריט שיחה", prompt: "תכין תסריט שיחה ללקוח שמהסס לסגור" },
  { emoji: "📊", label: "השווה צוות", prompt: "איך אני ביחס לשאר הצוות החודש?" },
  { emoji: "⚡", label: "מה קורה היום?", prompt: "סכם לי את כל מה שקורה במערכת היום" },
];

/** Simulate AI response based on prompt keywords. Stable & deterministic. */
export function generateAIResponse(prompt: string): Omit<ChatMessage, "id" | "role" | "timestamp"> {
  const p = prompt.toLowerCase();

  // Hot leads
  if (p.includes("חמים") || p.includes("hot") || p.includes("חייג")) {
    return {
      content: "מצאתי 3 לידים חמים במיוחד עבורך כרגע. כולם הראו עניין גבוה בשיחה הקודמת ועומדים לפני החלטה. אני ממליץ לתעדף את דנה כהן — היא דחופה ביותר.",
      data: [
        { label: "🔥 דנה כהן", value: "₪180K · 92% סיכוי · סגירה צפויה השבוע", href: "/leads/3035035" },
        { label: "💎 יואב פרי", value: "₪95K · 84% סיכוי · ממתין להחלטת מלווה", href: "/leads/1" },
        { label: "🎯 רותי שטרן", value: "₪220K · 78% סיכוי · רוצה לחתום מחר", href: "/leads/3035035" },
      ],
      suggestions: ["חייג לדנה", "שלח WhatsApp ליואב", "תזכיר לי בעוד שעה"],
    };
  }

  // Performance
  if (p.includes("ביצועים") || p.includes("חודש") || p.includes("performance")) {
    return {
      content: "החודש שלך מצוין! אתה ב-+18% מהממוצע, עם 12 עסקאות שנסגרו וצפי לעוד 4-6 בשבוע הבא. נקודת השיא שלך היתה ביום שלישי. נקודת התורפה — שיחות חוזרות (אחוז סגירה 41%, מתחת לממוצע הצוות).",
      data: [
        { label: "עסקאות החודש", value: "12 (יעד: 15)" },
        { label: "עמלה שנצברה", value: "₪48,200" },
        { label: "המיקום שלך", value: "#3 מתוך 12 נציגים" },
        { label: "רצף ימים", value: "7 ימים רצופים" },
      ],
      suggestions: ["איך אני יכול להשתפר?", "תראה לי את הרצף", "השווה לחודש שעבר"],
    };
  }

  // Script
  if (p.includes("תסריט") || p.includes("שיחה") || p.includes("script")) {
    return {
      content: `הנה תסריט מותאם ללקוח מהוסס שכדאי לסגירה:

**פתיחה (10 שניות)**
"שלום [שם], מדבר [שם נציג] מבינגו. אני יודע שאתה שוקל את ההצעה — רציתי לעדכן אותך בחדשה חשובה."

**יצירת דחיפות**
"המלווה אמר לי שההצעה תקפה עד יום [תאריך]. אחרי זה הריבית יכולה לעלות בעקבות עדכון."

**הסרת התנגדות**
"אני מבין את החששות. מה הדבר היחיד שמעצור אותך כרגע מלסגור?" — תקשיב, שתוק.

**סגירה**
"בוא נסדר עכשיו את החתימה. אני שולח לך לינק לוואטסאפ ב-30 שניות."`,
      suggestions: ["תכין עוד תסריטים", "מה לעשות אם הוא דוחה?", "שמור את התסריט"],
    };
  }

  // Compare team
  if (p.includes("צוות") || p.includes("השווה") || p.includes("דירוג")) {
    return {
      content: "אתה ב-#3 בצוות החודש. מעליך מאיה לוי (14 עסקאות) ואורי כהן (13). הפער הוא 2 עסקאות — אם תסגור 3 עד יום חמישי תהיה ראשון.",
      data: [
        { label: "🥇 מאיה לוי", value: "14 עסקאות · ₪62K עמלה" },
        { label: "🥈 אורי כהן", value: "13 עסקאות · ₪55K עמלה" },
        { label: "🥉 חן צולר (אתה)", value: "12 עסקאות · ₪48K עמלה" },
        { label: "תמר רז", value: "10 עסקאות · ₪41K עמלה" },
      ],
      suggestions: ["מה אני יכול ללמוד ממאיה?", "תראה לי את הלוח המלא", "תגדיר לי יעד חדש"],
    };
  }

  // Today summary
  if (p.includes("היום") || p.includes("מה קורה") || p.includes("today")) {
    return {
      content: "היום היה יום פעיל מאוד. נכנסו 23 לידים חדשים, 4 עסקאות נסגרו בצוות, ויש 7 משימות פתוחות שלך. הליד החם ביותר היום: אבי גולד — ביקש ₪150K והגיב מהר.",
      data: [
        { label: "לידים חדשים", value: "23 (4 שלך)" },
        { label: "סגירות בצוות", value: "4 (אחת שלך)" },
        { label: "שיחות בוצעו", value: "47 שיחות, סה\"כ 4:12 שעות" },
        { label: "המשימות שלך", value: "7 פתוחות, 2 דחופות" },
      ],
      suggestions: ["תראה לי את המשימות הדחופות", "מי הליד החם של היום?", "מה עוד צריך לעשות?"],
    };
  }

  // Default — helpful response
  return {
    content: "אני העוזר האישי שלך ב-BINGO. אני יכול לעזור לך עם:\n\n• ניתוח לידים והמלצות מי לחייג\n• סיכומי ביצועים והשוואות\n• יצירת תסריטי שיחה מותאמים\n• מציאת מידע מהיר על כל ליד\n• הגדרת תזכורות ומשימות\n\nפשוט תשאל אותי בעברית רגילה — אני אבין.",
    suggestions: ["מי הלידים החמים שלי?", "סכם את החודש", "תכין תסריט שיחה"],
  };
}
