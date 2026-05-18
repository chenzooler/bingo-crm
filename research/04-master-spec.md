# Bingo CRM - Master Spec

## חזון
CRM ייעודי לחברת **בינגו ישראל** - יועצי מימון - להחליף את `app.yoatsim.co.il` בעיצוב מותאם, חוויית משתמש מודרנית, ויכולות מתקדמות. שומר על כל הזרימות העסקיות הקיימות, אך נקי ומהיר יותר.

## ארכיטקטורה

### Stack
- **Frontend:** Next.js 16 + React 19 + TypeScript
- **Styling:** Tailwind v4 + custom Bingo design tokens
- **State:** Zustand (לטוב המוח, פשוט) + React Query (לסרוור)
- **DB:** PostgreSQL (Prisma) - יטופל בשלב 2
- **Auth:** NextAuth (יטופל בשלב 2)
- **Hebrew/RTL:** מתחילה - dir=rtl, Noto Sans Hebrew
- **UI primitives:** Radix UI + custom components

### תיקייה
`/Users/zooler/Desktop/bingo-crm-new/`
**לא** קשור ל-bingo-landing-test, פרויקט עצמאי.

## תכונות עיקריות (MVP)

### 1. Layout
- **Header עליון:** לוגו BINGO + תפריט מהיר (התראות, חיפוש מתקדם, פרופיל, הגדרות)
- **Sidebar שמאלי (RTL = right side visually):** רשימת תהליכים עם ספירה
- **Main:** רשימת לידים / כרטיס ליד / דשבורד / דוחות
- **Tasks panel ימני (collapsible):** משימות נכנסות/יוצאות/עתידי

### 2. דשבורד הבית
- 4 widgets צבעוניים:
  - **תצוגת דוח** (כחול)
  - **ליד חדש בטיפולי** (ירוק) - ספירה
  - **נצפו לאחרונה** (כתום)
  - **משימות באיחור** (אדום) - ספירה דחיפות
- שורת חיפוש מהיר
- כפתור "הוספת כרטיס +"
- **רשימת לידים** עם עמודות:
  - # (ספירה)
  - שם פרטי + משפחה
  - תעודת זהות
  - מקור הליד (תגיות)
  - אחראי (אווטאר + שם)
  - סטטוס (תגית עם emoji + צבע)
  - קליטה (תאריך)
- **סינון inline** מתחת לכל עמודה
- **ניווט עמודים** - 25/50/100 רשומות לעמוד
- **טאבים:** כרטיסים | שכפול | כרטיסים בדיקה | אנשי קשר

### 3. כרטיס ליד
**3 עמודות (large screens):**

**עמודה ימנית (פרטי לקוח):**
- אנשי קשר (שם, טלפון, אימייל)
- תהליכים פעילים (פיפליין + סטטוס + אחראי)

**עמודה אמצעית (פעילות):**
- סינון לפי סוג: 📷 / 💬 / 📞 / ✉️ / ☰ / ✅ / 🕐 / הצג הכל
- timeline של פעילויות עם תאריך, מבצע, תיאור
- כפתור "הוספה +"

**עמודה שמאלית (פרטי כרטיס):**
- תפריט סקציות מתקפלות:
  1. איך אפשר לעזור (סכום, מטרה)
  2. בדיקת נתוני אשראי (5 שאלות yes/no)
  3. בדיקת חיוויי אשראי (תז, מין, ת.לידה, BDI button)
  4. השלמת נתונים (סטטוס משפחתי, ילדים)
  5. הכנסות (תעסוקה, וותק, הכנסה, בן/בת זוג)
  6. נכסים
  7. רכבים (אם רלוונטי)
  8. נתונים בנקאיים (בנק, סניף, חשבון)
  9. הלוואות קיימות
  10. בדיקות לפי גוף (12 גופי אשראי)
  11. סה"כ סכום מאושר
  12. תסריט שיחה
  13. הצעת מחיר
  14. חישובים (מחשבון הלוואה, חיסכון)
  15. נדרש לתשלום סופי
  16. מקור הליד
  17. טפסים
  18. קבצים (drag & drop)

### 4. ניווט תהליכים (Sidebar)
- רשימה היררכית: תהליך > סטטוס
- כל פריט עם emoji + ספירה
- מתקפלים בלחיצה
- חיפוש בתוך התפריט
- פילטר: רק אני / כל המשתמשים
- פילטר: כל התהליכים / ללא / ספציפי

### 5. Tasks Panel
- 3 טאבים: נכנסות / יוצאות / עתידי
- כפתורים: "+ משימה" / "+ מתפרצת"
- כל משימה: זמן, מבצע, תיאור
- לחיצה -> פותחת את הליד
- אפשרות לסמן ✅ executed

### 6. סטטוסים & פיפליינים
- ניהול דינמי של תהליכים וסטטוסים
- כל סטטוס: שם, emoji, צבע, פיפליין אב, סדר
- תמיכה ב-multi-pipeline (ליד יכול להיות בכמה)

### 7. Reports / תצוגת דוח
- Funnel analysis: מקור > סטטוס > תוצאה
- Conversion rates per stage
- Performance per agent
- Filter by date range / source / agent

### 8. תכונות מערכת
- **Activity log** (auto): שינויי סטטוס, צפיה בליד, הוספת הערה
- **WhatsApp integration** indicator
- **Phone calls** with duration
- **SMS sender**
- **Email sender**
- **Forms** (signature pad)
- **Files** (drag & drop)
- **Tags**: emoji + color
- **Smiley scoring**: 🟢🟡🔴 manual + automatic
- **BDI check button** (large green CTA)

## תכונות מתקדמות (Phase 2)
- אוטומציות (Webhooks, triggers על שינוי סטטוס)
- חיוג מהמערכת (CTI)
- שילוב WhatsApp WATI
- ייבוא לידים מ-Facebook Ads
- ייצוא דוחות Excel
- ניהול משתמשים והרשאות
- צ'אט פנימי (כמו צ'אט בין נציגים)
- חתימה דיגיטלית
- אישור BDI אוטומטי דרך API
- בדיקות אשראי אוטומטיות מול גופים

## עיצוב

### צבעי בינגו
```css
--bingo-green: #50FF0A;    /* primary */
--bingo-green-dark: #2EA10D;
--bingo-black: #292929;     /* text */
--bingo-charcoal: #30302E;  /* dark buttons */
--bingo-cream: #FAF9F5;     /* main bg */
--bingo-gray-100: #ECECEA;
--bingo-gray-200: #C0CFE2;

/* Status colors */
--status-blue: #2D7BF7;     /* תצוגת דוח */
--status-green: #50FF0A;    /* ליד חדש בטיפולי */
--status-orange: #FF9D29;   /* נצפו לאחרונה */
--status-red: #FF4747;      /* משימות באיחור */
--status-yellow: #FFCB1F;
```

### טיפוגרפיה
- **Font:** Noto Sans Hebrew
- **Direction:** rtl
- **Sizes:** Tailwind defaults (xs..6xl)
- כותרות: bold + נקודה ירוקה accent

### Components
- כפתורים: rounded-2xl, shadow רך
- כרטיסים: white bg, border-bingo-gray-200, rounded-2xl
- Inputs: bg-white, border-2, focus:border-bingo-green
- Tables: border-collapse, hover:bg-bingo-green/5
- Tags: pill-shape, with emoji + colored bg
- Avatars: circles עם אותיות / תמונה

## מבנה הפרויקט
```
/Users/zooler/Desktop/bingo-crm-new/
├── app/
│   ├── (auth)/
│   │   └── login/
│   ├── (app)/
│   │   ├── dashboard/      # ראשי + רשימת לידים
│   │   ├── leads/[id]/     # כרטיס ליד
│   │   ├── reports/        # דוחות
│   │   ├── tasks/          # משימות
│   │   └── settings/       # הגדרות
│   ├── api/
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── layout/             # Header, Sidebar, TasksPanel
│   ├── lead/               # LeadCard, LeadList, LeadActivity
│   ├── ui/                 # Button, Input, Card, Tag, etc
│   └── icons/              # SVG icons + emoji components
├── lib/
│   ├── data/               # mock data
│   ├── store/              # zustand stores
│   ├── types.ts            # types & enums
│   └── utils.ts
├── public/
│   └── logos/
├── package.json
└── tailwind.config.ts
```

## שלבי בנייה
1. ✅ מחקר ותיעוד
2. הקמת פרויקט Next.js (npm install)
3. עיצוב & layout בסיסי (Header, Sidebar, RTL)
4. דשבורד עם 4 widgets + רשימת לידים (mock data)
5. כרטיס ליד מלא עם כל הסקציות
6. Tasks panel
7. ניווט תהליכים מתקפל
8. דוחות בסיסיים
9. Auth & DB (phase 2)
