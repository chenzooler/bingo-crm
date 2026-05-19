# Pipeline & Status Taxonomy - Redesign

## בעיה
- **9 תהליכים מקבילים** = בלבול. ליד יכול להיות גם ב"מחלקת החתמות" וגם ב"שימורים יוני" וגם ב"לא מעוניינים" - לא ברור מי הבעלים האמיתי.
- **60+ סטטוסים** = יותר מדי. נציג לא יכול לזכור.
- שגיאות שיוך - אותו ליד מופיע כפול במספר רשימות.
- מנהלים לא יכולים לקבל מספרי emek אמיתיים.

## פתרון - Pipeline אחד, Categories מספרים

### העקרון: **One Lead = One Stage + Multiple Tags**

במקום 9 תהליכים נפרדים, מסדרים את הדברים על 2 צירים אורתוגונליים:

**ציר 1: Lifecycle Stage (איפה הליד בתהליך)** - חובה, יחיד
**ציר 2: Category (סוג ההלוואה)** - חובה, יחיד
**ציר 3: Tags (תכונות נוספות)** - אופציונלי, רבים

---

## 🔄 Lifecycle Stages (10 שלבים סטנדרטיים)

| # | Stage | Hebrew | משך טיפוסי |
|---|-------|--------|----|
| 1 | NEW | ליד חדש | 0-2 שעות |
| 2 | CONTACT | שיחה ראשונה | 1-3 ימים |
| 3 | SCREENING | סינון ובדיקה ראשונית | 1-2 ימים |
| 4 | CONTRACT | חתימת הסכם התקשרות | 1-3 ימים |
| 5 | BDI | בדיקת אשראי BDI | 1 יום |
| 6 | AUCTION | מכרז מול גופי מימון | 1-4 ימים |
| 7 | DECISION | הלקוח בוחר הצעה | 1-2 ימים |
| 8 | DOCS | החתמת חוזה סופי + מסמכים | 1-3 ימים |
| 9 | DISBURSEMENT | שחרור הלוואה | 1-2 ימים |
| 10 | PAID | תשלום שכ"ט הושלם | סופי |

כל שלב יכול להוביל ל**Exit** עם reason:
- WON - שולם (success)
- LOST - לא רלוונטי, לא מעוניין, BDI שלילי, חוסר מענה
- LEGAL - הועבר לטיפול משפטי
- SPAM - מספר לא תקין

## 📂 Categories (סוג הלוואה)

| Key | Hebrew |
|-----|--------|
| general | הלוואה לכל מטרה |
| vehicle | הלוואה כנגד רכב |
| property | הלוואה כנגד נכס |
| consolidation | איחוד הלוואות |
| mortgage | משכנתא |

## 🏷️ Tags (אופציונלי, רבים)

תכונות שמותח על הליד אבל אינן מצב:
- 🔥 חם
- ⚡ דחוף
- 💰 סכום גבוה (>100K)
- 👤 שימור יוני / שימור פרגן
- 🆕 עולה חדש
- 🚹 מתחת לגיל 25
- 📞 אין מענה > 3 ניסיונות

---

## 🗺️ מיפוי המצב הקיים → החדש

| יועצים (ישן) | חדש: Stage | חדש: Category | חדש: Tags |
|--------------|------------|---------------|-----------|
| 📝 מחלקת החתמות / ליד חדש | CONTACT | (לפי מקור) | |
| 📝 מחלקת החתמות / אין מענה | CONTACT | | אין מענה |
| 📝 מחלקת החתמות / לחזור ללקוח | CONTACT | | פולואפ |
| 💸 הלוואה לכל מטרה / מוכן לבדיקה | SCREENING | general | |
| 💸 / ממתין למסמכים | DOCS | general | |
| 💸 / הלוואה מאושרת | DECISION | general | |
| 💸 / קיבל הלוואה | DISBURSEMENT | general | |
| 💸 / שילם | PAID | general | WON |
| 💸 / סורב | EXIT (LOST) | general | סורב |
| 🚗 מחלקת רכב / שיעבוד חדש | SCREENING | vehicle | |
| 🚗 / אישור סופי - להחתים חוזה | DOCS | vehicle | |
| 🚗 / שילם | PAID | vehicle | WON |
| שימורים יוני | * | * | shimorin-yoni |
| לא מעוניינים | EXIT (LOST) | * | (reason as tag) |
| ספאם / מספר לא תקין | EXIT (SPAM) | * | |
| טיפול משפטי | LEGAL | * | |
| WATI | * | * | source: wati |

**התוצאה:** במקום ליד עם 3 שיוכים, יש לו שלב אחד + קטגוריה אחת + תגיות לפי הצורך.

---

## 🎨 UI Impact

### Sidebar החדש
במקום 9 רשימות נפרדות:
- **Quick Views:** הלידים שלי / חמים / היום / השבוע
- **By Stage:** 10 שלבים עם count (יותר ברור!)
- **By Category:** 5 קטגוריות
- **By Tag:** רשימה דינמית
- **Smart Filters:** "ממתינים לחתימה" / "עברו 3 ימים בלי טיפול"

### Stage Pipeline View
ויזואל כמו Kanban:
```
[NEW 47] → [CONTACT 152] → [SCREENING 89] → [CONTRACT 23] → [BDI 18] → [AUCTION 12] → [DECISION 8] → [DOCS 14] → [DISBURSEMENT 5] → [PAID 1,247]
```

### Filters (Power Users)
- "כל הלידים בקטגוריה 'רכב' שבשלב 'מכרז' מעל 48 שעות"
- "הלידים שלי שיש להם אישור עקרוני אך עוד לא חתמו"

זה הופך את הנתונים ל-**actionable** במקום בלגן.

---

## 💡 הצעות נוספות

### 1. Smart Views (default)
| View | Filter |
|------|--------|
| 🔥 חמים שלי | mine, stage IN [CONTACT, SCREENING, AUCTION, DECISION], tag=hot |
| ⏰ דחוף - SLA הופר | mine, SLA > target |
| 💸 סגירות השבוע | mine, stage=DOCS, in last 7 days |
| 📞 לחזור היום | mine, hasFollowupToday |
| 💰 גדולים | amount > 100K |

### 2. Power Dialer Queues (אוטומטיים)
| Queue | Auto-fill |
|-------|-----------|
| Follow-ups | tag=פולואפ, mine, dueAt < now |
| Closing Calls | stage=DECISION, hasApproval |
| Lender Checks | stage=AUCTION, pendingLenderResponse |

### 3. Manager View
- Heatmap: זמן ממוצע בכל שלב
- Bottlenecks: שלב עם הכי הרבה נשירה
- Velocity: כמה זמן לוקח מ-NEW עד PAID

---

## 📝 שלב הביצוע

1. הגדרת `LifecycleStage` enum + `LeadCategory` enum + `Tag` type
2. עדכון `Lead` interface - הוספת `stage`, `category`, `tags[]`, `exitReason?`
3. עדכון MOCK data - מיפוי מהישן לחדש
4. עדכון Sidebar - Smart Views + by stage + by category
5. עדכון Settings → Lifecycle (חדש)
6. עדכון Filters בכל הדפים

זה השדרוג הכי משמעותי.
