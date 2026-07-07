// המשתמש הנוכחי — אין עדיין מערכת התחברות אמיתית.
// כל סמנטיקה של "שלי" (משימות שלי, בטיפולי) עוברת דרך הקובץ הזה,
// כך שכשתגיע אימות אמיתי — מחליפים במקום אחד בלבד.
import { db } from "@/lib/db";

/** Yoatsim external id של חן צולר (המנכ"ל) — המשתמש הקבוע בינתיים */
export const CURRENT_USER_EXTERNAL_ID = "12394";

export async function currentUser() {
  return db.user.findUnique({ where: { externalId: CURRENT_USER_EXTERNAL_ID } });
}
