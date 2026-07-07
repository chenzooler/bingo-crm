// קריאת/זריעת AppSetting — צד שרת בלבד (Prisma).
// קריאה ראשונה של מפתח מוכר זורעת את ברירת המחדל מ-app-defaults.ts לתוך ה-DB.
import { db } from "@/lib/db";
import { APP_SETTING_DEFAULTS } from "@/lib/yoatsim/app-defaults";

/** מחזיר את הערך השמור; אם אין שורה — זורע את ברירת המחדל ומחזיר אותה.
 *  מפתח לא מוכר בלי שורה → undefined (ה-API מחזיר 404). */
export async function readAppSetting<T = unknown>(key: string): Promise<T | undefined> {
  const row = await db.appSetting.findUnique({ where: { key } });
  if (row) {
    try {
      return JSON.parse(row.valueJson) as T;
    } catch {
      // valueJson פגום — ניפול לברירת המחדל בלי לדרוס
    }
  }
  const def = APP_SETTING_DEFAULTS[key];
  if (def === undefined) return undefined;
  if (!row) {
    const valueJson = JSON.stringify(def);
    await db.appSetting.upsert({
      where: { key },
      update: {}, // אם נזרע במקביל — לא דורסים
      create: { key, valueJson },
    });
  }
  return def as T;
}

/** שמירת ערך (upsert). הערך חייב להיות JSON-serializable. */
export async function writeAppSetting(key: string, value: unknown): Promise<void> {
  const valueJson = JSON.stringify(value);
  await db.appSetting.upsert({
    where: { key },
    update: { valueJson },
    create: { key, valueJson },
  });
}
