# BINGO CRM — מדריך הפרויקט (קרא ראשון)

> **מטרה:** לבנות את מערכת ה-CRM המתקדמת בעולם עבור **בינגו — מימון בול בשבילך**,
> חברת תיווך אשראי ישראלית. המערכת מחליפה בהדרגה את Yoatsim (app.yoatsim.co.il).
> המשתמש: **חן צולר** (מנכ"ל). עברית RTL. מעדיף עברית בתקשורת.

---

## ⚡ הקשר מהיר לסשן חדש
- זה פרויקט **Next.js 16 + React 19 + Tailwind v4 + TypeScript + Prisma (SQLite)**.
- מריצים מ-`/Users/zooler/Desktop/בינגו crm`. `npm run dev` (פורט 7800 בד"כ).
- פרוס אוטומטית ב-**Coolify** על `crm.bingoisrael.co.il` בכל `git push` ל-main.
- **מודל:** Fable 5. אם מנגנון הבטיחות מסמן ומחליף ל-Opus — זה צד-שרת, לא באג בקוד.
  כדי להימנע: בקוד השתמש במונחים ניטרליים (screening/indicator) במקום
  "אשראי/BDI/סמיילי" בשמות משתנים כשאפשר. `switchModelsOnFlag: false` כבר מוגדר.

## 📚 מסמכי אפיון — קרא לפני שבונים כרטיס/תהליכים
- **`docs/yoatsim-full-spec.md`** ⭐ — האפיון המלא של Yoatsim (כרטיס לקוח מלא,
  15 תהליכים + כל הסטטוסים, 21 אוטומציות, 42 תבניות הודעה, 27 משתמשים + 9 הרשאות).
  **זה מקור האמת. כל בנייה מבוססת עליו.**
- **`docs/yoatsim-lead-card.md`** — תיעוד חי של כרטיס הלקוח האמיתי (שני הרמזורים,
  שאלון האשראי המדויק).
- **`docs/yoatsim-audit.md`** — מודל הנתונים הפנימי (קודי שדות a88/n4/s7, קודי
  אופציות, 14 בנקים), 10 תהליכים + ספירות (~160K לידים).
- **`docs/bingo-operation-mastery.html`** — ניתוח מלא של מערכת הבוט (5 גופי מימון,
  כללי עסק, אוטומציות, בעיות).

## 🏢 איך העסק עובד (התמצית)
הנציג לוחץ "תותח שיחות" → קופץ לקוח → שאלון מיון (בדיקת רמזור/סמיילי) →
לפי התוצאה מנתב ל-**כל מטרה** (תקין) או **רכב** (נפסל+יש רכב) → מחתים על הסכם
התקשרות → חוזר אחרי שעה → בדיקות זכאות ב-5 גופי מימון (ירושלים/פניקס/ישראכרט/
כאל/מקס) או בקשת מסמכים (רכב) → משקף תוצאות → ממתין להלוואה → גובה תשלום.

**כללי ניתוב:** סמיילי צהוב/אדום (אוטומטי או ידני) · אין כרטיס אשראי · מסגרת עד
5,000₪ · מטרה=רכב → כולם מנתבים למסלול רכב (אם יש רכב; אחרת יציאה).

## 🔴 הבעיה המרכזית שאנחנו פותרים
ב-Yoatsim ליד יכול להשתייך ל**מספר תהליכים בו-זמנית** (למשל "BDI שלילי" + "ליד
חדש רכב"). זה יוצר בלגן אדיר. **הפתרון ב-Bingo: ליד אחד = מסע אחד.** "יש רכב" =
תכונה שהמערכת זוכרת ומקפיצה אוטומטית כשצריך, לא תהליך נוסף.

---

## 🎨 מערכת העיצוב (Brand-True v3)
מבוסס על bingoisrael.co.il האמיתי. הכללים ב-`app/globals.css`:
- **פונט:** `Polin` (רשמי, ב-`public/fonts/`), נופל ל-Heebo.
- **צבעים:** `#292929` (טקסט) · `#50FF0A` (ירוק אקסנט) · `#1F81D6` (כחול) ·
  `#FAFAF9` (רקע) · tints: `#DAFFCB` `#C0CFE2` `#FFBC7D`.
- **צורה:** גלולות 50px (`b-pill`), כרטיסים 20px (`b-card`).
- **קלאסים מוכנים:** `b-card` · `b-pill-{dark,green,ghost}` · `b-chip-{green,blue,orange,red,gray,dark}`
  · `b-icon-{green,blue,orange,red,purple,gray}` (עיגולים מגוונים) · `b-input`
  · `b-progress` · `b-segment` · `b-eyebrow` · `b-ball` (כדור הלוגו).
- שכבת תאימות: קלאסים ישנים (`btn-vibrant`, `card-apple`, `icon-3d-*`) ממופים
  אוטומטית לסגנון המותג — לא לשבור.

## 🗂️ מבנה
```
app/(app)/          — כל המסכים (dashboard, leads, dialer, briefing, wallboard,
                       inbox, calls, calendar, admin, admin/import, tasks...)
app/(app)/leads/[id]/page.tsx  → LeadCardV3 (כרטיס הלקוח המונחה)
app/sign/[leadId]/  — דף חתימה ציבורי ללקוח
app/api/            — leads, import, providers, lenders, stats
components/lead/LeadCardV3.tsx  — כרטיס הלקוח (מנוע המסע)
components/layout/  — Header, NavRail, Sidebar, TasksPanel
lib/journey.ts      — מנוע המסע (state machine) — משקף את כרטיס Yoatsim
lib/db.ts + prisma/ — Prisma + SQLite; seed בו 26 משתמשים + 12 גופים
lib/import/         — מנוע ייבוא Excel/CSV מ-Yoatsim (זיהוי עמודות עברית)
```

## 🧭 סטטוס נוכחי / איפה ממשיכים
- ✅ עיצוב מותג, NavRail, Dashboard, ייבוא DB, דף חתימה, wallboard, briefing — בנויים.
- 🚧 **`lib/journey.ts` עודכן ל-v3** (משקף את הכרטיס האמיתי: 8 סקשנים, שני רמזורים,
  שאלון אשראי מדויק). **`components/lead/LeadCardV3.tsx` עדיין מפנה לפונקציות v2
  ושבור — צריך לכתוב אותו מחדש להתאים ל-journey.ts v3.** ← המשימה הבאה.
- ⏭️ אחר כך: תהליכים+סטטוסים אמיתיים (15 תהליכים), אוטומציות, תבניות הודעה,
  הרשאות — הכל מתועד ב-`docs/yoatsim-full-spec.md`.

## 🛠️ פקודות
```bash
npm run dev            # שרת פיתוח
npm run build          # בילד (prisma generate + next build)
npm run db:migrate     # מיגרציית Prisma
npm run db:seed        # זריעת משתמשים+גופים
git push               # → Coolify בונה ופורס אוטומטית
```

## ✍️ מוסכמות
- קוד באנגלית, טקסט UI + קומנטים עסקיים בעברית.
- Commits באנגלית, מסתיימים ב-`Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`.
- אמת ויזואלית עם preview לפני push. אל תיגע בקוד הבוט/דפדפן (תיקיית "בינגו בדיקות").
