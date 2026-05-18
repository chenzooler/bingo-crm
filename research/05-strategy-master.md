# BINGO CRM — אסטרטגיה ומפת דרכים למערכת הכי מתקדמת בעולם

> מסמך זה הוא ה-Master Plan לבניית CRM ייעודי לחברת בינגו (יועצי אשראי / גיוס אשראי), עם דגש על אוטומציה מלאה, אינטגרציות מובנות, AI, וחוויית נציג של "click-and-go".

---

## 1. סיכום מנהלים

**מה אנחנו בונים?**
CRM ייעודי לחברת **בינגו ישראל** - חברה שמתמחה ב**גיוס אשראי**: מקבלת לידים → סינון → החתמת הסכם → מכרז מול גופי מימון → סגירת עסקה. המערכת תחליף את `app.yoatsim.co.il`, תאוטמת 80% מהעבודה הידנית, ותספק חוויית עבודה משוקעת לכל נציג.

**העקרונות**
1. **One Lead, One Process** — לכל ליד תהליך אחד ברור, לא חמישה תהליכים מקבילים.
2. **Zero Manual Switching** — נציג עובד במסך אחד, הכל מתעדכן אוטומטית מסביבו.
3. **AI as Co-pilot** — סיכומי שיחה, תסריטי שיחה, החלטות routing - הכל עוזר לנציג מבלי לקחת ממנו שליטה.
4. **Integration-First** — WATI, GreenInvoice, CallMarker, SMS - מובנים נטיב, לא bolt-on.
5. **Data Sovereignty** — כל החלטה ניתנת לביקורת. Audit log מלא.

**הצלחה תיראה כך:**
- נציג סוגר ליד פי 2 מהר יותר
- 50%+ ירידה במשימות שנשכחות
- שיעור המרה +20% הודות ל-routing חכם וסקריפטים
- 100% מהשיחות מתועתקות ונותחות

---

## 2. ניתוח המצב הנוכחי (יועצים)

### בעיות מרכזיות שזיהינו במחקר

| בעיה | השפעה | פתרון מוצע |
|------|-------|------------|
| תהליכים מקבילים על אותו ליד (`מחלקת החתמות` + `שימורים יוני` + `לא מעוניינים`) | בלבול, נציגים לא יודעים מי "בעלים" אמיתי | **Pipeline State Machine** — מצב אחד פעיל בכל רגע |
| 50+ סטטוסים עם emoji ידני | קשה לסנן, אין סטנדרט, חלק לא רלוונטיים | **Status Catalog** מנוהל מרכזית עם type-safe enums |
| 12 בדיקות גופי אשראי - הזנה ידנית | שעות בזבוז, טעויות | **API-first** — חיבור ישיר ל-BDI/Phoenix/Cal/Max דרך API + scraping fallback |
| WATI, GreenInvoice, CallMarker - מערכות נפרדות | נציג מקפיץ בין 4 חלונות | **Unified Inbox** — כל התקשורת זורמת לכרטיס הליד |
| תותח שיחות נפרד מ-CRM | נציג מחייג מבחוץ, רישום ידני | **In-Card Dialer** — לחיצה אחת, שיחה יוצאת + תיעוד + הקלטה |
| אין AI על הקלטות שיחה | יקרה כל פגישת מנהל - מאזינים ידנית | **Auto-transcribe + Auto-score** עם GPT/Claude |
| הרשאות לא ברורות | נציג רואה לידים של אחרים | **RBAC** + **Cell-level permissions** |
| אין SLA אוטומטי | לידים נשכחים | **SLA Engine** — חוקים אוטומטיים, alerts |
| דוחות מוגבלים | מנהלים עובדים על Excel | **Live Dashboard** + Embedded BI |

### זרימת עבודה היום (Pain Points)

```
ליד נכנס מ-Facebook
    ↓
WOKI bot מקצה למחלקת החתמות
    ↓
נציג רואה (אולי) - הליד יכול לחכות 4 שעות
    ↓
נציג מחייג ידנית (CallMarker)
    ↓
שיחה לא מתועדת אוטומטית
    ↓
נציג מקליד סיכום (חלק...)
    ↓
שולח WhatsApp ידני (WATI)
    ↓
שולח SMS ידני
    ↓
מחתים על הסכם (לחיצה ידנית)
    ↓
בודק BDI ידני (אתר חיצוני, copy-paste תוצאות)
    ↓
מתקשר ל-12 גופים, ממלא טבלה ידנית
    ↓
בוחר את הטוב ביותר, מקפיץ ל"שימורים"
    ↓
... ועוד 5 צעדים
```

**זמן ממוצע לסגור ליד: 4-6 ימים. אנו שואפים ל-24 שעות.**

---

## 3. הארכיטקטורה החדשה - ברמה גבוהה

### עקרון השלם > החלקים
```
┌─────────────────────────────────────────────────────────┐
│            BINGO CRM PLATFORM                            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │ Lead Funnel │  │ Agent Studio│  │  Admin BI   │     │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘     │
│         │                │                │             │
│  ┌──────┴────────────────┴────────────────┴─────┐     │
│  │              ORCHESTRATION ENGINE              │     │
│  │ (State Machine • SLA • Routing • Automation)   │     │
│  └──┬──────────────┬──────────────┬──────────────┬─┘   │
│     │              │              │              │     │
│  ┌──┴───┐    ┌─────┴──┐    ┌──────┴──┐    ┌─────┴──┐  │
│  │ Data │    │  AI    │    │ Comms  │    │ Money  │  │
│  │ Hub  │    │ Layer  │    │ Hub    │    │ Hub    │  │
│  └──┬───┘    └────┬───┘    └────┬───┘    └────┬───┘  │
│     │             │             │              │     │
│  ┌──┴────┐  ┌─────┴───┐  ┌──────┴───┐  ┌──────┴───┐ │
│  │Postgres│  │ OpenAI  │  │  WATI    │  │GreenInv. │ │
│  │ Redis  │  │ Claude  │  │CallMarker│  │ Banks API│ │
│  │   S3   │  │Whisper  │  │   SMS    │  │   BDI    │ │
│  └────────┘  └─────────┘  └──────────┘  └──────────┘ │
└─────────────────────────────────────────────────────────┘
```

### העץ הראשי של המערכת
1. **Lead Funnel** — דף נחיתה, מקורות לידים (Facebook, TikTok, Google, SMS, רפרל)
2. **Agent Studio** — סביבת עבודה של הנציג. **כאן עיקר המאמץ.**
3. **Orchestration Engine** — מנוע התהליכים והכללים העסקיים
4. **Admin BI** — דשבורד מנהלים, דוחות, ניהול תהליכים
5. **Integration Layer** — חיבורים לכל מערכת חיצונית
6. **AI Layer** — תעתוק, ניתוח, סיכום, הצעות
7. **Money Hub** — חשבונית, גביה, מעקב תשלומים

---

## 4. Tech Stack מומלץ

| שכבה | טכנולוגיה | למה? |
|------|----------|------|
| **Frontend** | Next.js 16 + React 19 + TypeScript | SSR, RTL מובנה, App Router, server components |
| **Styling** | Tailwind v4 + Radix UI | מהיר, accessible, design system |
| **State** | Zustand + TanStack Query | פשוט מ-Redux, server cache חכם |
| **Backend** | Next.js API routes + Hono/tRPC | type-safe end-to-end, רץ ב-Vercel/Cloudflare |
| **DB** | PostgreSQL + Prisma | סטנדרט, יחסים, query מורכבים |
| **Cache/Queue** | Redis + BullMQ | אוטומציות אסינכרוניות |
| **Storage** | S3 / R2 | מסמכים, הקלטות |
| **Search** | Meilisearch / Typesense | חיפוש מהיר ב-RTL |
| **Realtime** | Pusher / Ably / Socket.IO | עדכוני סטטוס חיים בין נציגים |
| **AI** | OpenAI GPT-4o + Whisper + Claude | תעתוק עברית, סיכום שיחות, סקריפטים |
| **Auth** | NextAuth + WorkOS / Auth0 | SSO, 2FA, SAML למשרד |
| **Monitoring** | Sentry + Posthog + Better Stack | שגיאות + analytics + uptime |
| **Deploy** | Vercel / Railway | scale אוטומטי, אזור אירופה |
| **CI/CD** | GitHub Actions + Playwright | E2E tests |

---

## 5. Module Breakdown — מודולים מרכזיים

### 5.1 Lead Funnel (Inbox)

**מטרה:** כל ליד שנכנס מכל מקור → רגע אחד עד שמופיע ב-CRM.

**רכיבים:**
- **Multi-channel webhooks**: Facebook Lead Ads, TikTok Lead Gen, Google Forms, דף נחיתה עצמי, ספקי לידים (Eilon, Shai, Solido), WATI, אתר
- **Deduplication engine**: מזהה כפילויות לפי טלפון/ת.ז עם פאזי-מאצ׳ינג
- **Auto-enrichment**: מילוי אוטומטי של פרטים (כתובת מ-Google Places, מין מהשם, גיל מת.ז)
- **Auto-routing**: לפי כללים (מקור → מחלקה, סוג הלוואה → צוות)
- **Score on entry**: AI מדרג את הליד 0-100 לפי history+source (אם יש)

**UX:**
- Inbox view דמוי Gmail - לידים חדשים בולטים
- חיפוש מיידי, סינון בצד
- "Convert to Process" בלחיצה אחת

### 5.2 Pipeline State Machine

**עיקרון:** ליד נמצא בדיוק במצב אחד פעיל. לא יכול להיות גם "מחלקת החתמות" וגם "שימורים יוני" - זה bug.

**המצבים העיקריים (uniqfied):**
```
NEW → SCREENING → CONTRACT_SIGNING → BDI_APPROVAL →
LENDER_AUCTION → CUSTOMER_DECISION → DOCUMENTATION →
LOAN_DISBURSED → PAID

[EXITS]: NOT_INTERESTED, NO_ANSWER, BLOCKED, SPAM, LEGAL
```

**כל מצב מנוהל כ-StateMachine:**
- `entry` actions (אוטומציה כשנכנסים)
- `exit` actions (אוטומציה כשיוצאים)
- `allowed transitions` - מאיפה לאן ניתן לעבור
- `timeout` - מה לעשות אם נשארים יותר מ-X זמן
- `assignment` - מי האחראי בשלב הזה
- `KPIs` - מה מדידים בשלב

**דוגמה - מצב `LENDER_AUCTION`:**
```yaml
state: LENDER_AUCTION
description: בודקים מול 12 גופי מימון
entry:
  - send_to_bdi_api()
  - send_to_isracard_api()
  - send_to_phoenix_api()
  - schedule_sms("בודקים עבורך עכשיו", T+1min)
sla: 4 hours
on_timeout:
  - escalate_to_manager()
  - notify_customer_delay()
allowed_next:
  - CUSTOMER_DECISION (if any approval)
  - NOT_INTERESTED (if customer cancels)
  - BLOCKED (if all rejections)
auto_advance_when:
  - 3+ approvals received
  - OR customer interest set to "ready"
```

**מצבי-משנה (sub-statuses)** קיימים בתוך כל state - אבל זה רק תיעוד פנימי, לא משפיע על routing.

### 5.3 Agent Studio - חוויית הנציג

**העיקרון: One Screen, Zero Friction.**

```
┌────────────────────────────────────────────────────────────┐
│ [Logo]    Cmd+K Search    [Inbox 3]  [📞 Auto-dial]  [👤]  │ <- Header
├──────────┬──────────────────────────────────────┬──────────┤
│ Sidebar  │  Lead Card (Center)                  │ Activity │
│          │  ┌──────────────────────────────┐    │ Timeline │
│ Pipelines│  │ Step Navigator               │    │          │
│ Filters  │  ├──────────────────────────────┤    │ ☎ 14:30  │
│ Lists    │  │                              │    │ 💬 14:28 │
│          │  │  Active Wizard Step          │    │ ✅ 14:25 │
│          │  │  (Customer-facing UX)        │    │ 📧 14:20 │
│          │  │                              │    │          │
│ Tasks ▼  │  │  + AI Co-pilot panel         │    │ + Note   │
│ Reports  │  │  (suggestions, scripts)      │    │          │
│ Admin    │  │                              │    │          │
│          │  └──────────────────────────────┘    │          │
│ ──────── │  ┌──────────────────────────────┐    │          │
│ Calls ⏺  │  │ Lender Bidding Grid           │    │          │
│ Live     │  │ [BDI] [Cal] [Max] [Phx]...    │    │          │
└──────────┴──────────────────────────────────────┴──────────┘
```

**Agent Studio בפועל:**

1. **Step Navigator** - מנווט מודרך (כפי שבנינו). הנציג רואה את השלבים, מה הושלם, מה הבא.

2. **Wizard Step Active** - השלב הפעיל מוצג בגדול עם:
   - כותרת + תת-כותרת
   - שאלות עם UI ידידותי (כפתורים, slider, autocomplete)
   - **טיפ לנציג** (תמיד מוצג)
   - **תסריט שיחה מוצע** (collapsable, מותאם למצב הספציפי)
   - כפתורי המשך/הקודם

3. **AI Co-pilot Panel** - תמיד נגיש בצד:
   - "מה לשאול עכשיו" (suggestions)
   - "תשובה מומלצת" (אם הלקוח שואל משהו)
   - "התנגדויות צפויות" + תשובות
   - "סיכום אוטומטי של השיחה הזו"

4. **Lender Bidding Grid** - בעת שלב bidding:
   - 12 גופים מוצגים כ-cards
   - תוצאות מתעדכנות בזמן אמת (live websocket)
   - הצעות אוטומטיות חוזרות מ-API
   - תוצאות ידניות נשמרות אוטומטית
   - "Best offer" מודגש אוטומטית
   - Comparison view: סכום, ריבית, החזר, מע"מ

5. **Activity Timeline** (ימין) - כל אינטראקציה:
   - שיחות (עם נגן הקלטה + תעתוק + summary)
   - הודעות WhatsApp (תקבולת)
   - SMS
   - מיילים
   - שינויי סטטוס
   - הערות
   - אישורים/חתימות

6. **Quick Actions** (תמיד נגישים):
   - 📞 התקשר (לחיצה אחת)
   - 💬 שלח WhatsApp (template או custom)
   - 📧 שלח מייל
   - 📲 שלח SMS
   - 📄 שלח טופס לחתימה
   - 📎 צרף קובץ
   - 💰 צור הצעת מחיר
   - 🧾 שלח חשבונית

### 5.4 Communications Hub

**עיקרון:** כל תקשורת זורמת דרך CRM. שום דבר לא קורה "מחוץ".

**ערוצים:**
| ערוץ | אינטגרציה | יכולות |
|------|-----------|--------|
| WhatsApp | WATI API | Send templates, receive, conversation threads, status |
| SMS | משלוח דרך CallMarker/Twilio | Auto-templates, link tracking |
| Phone | CallMarker (PBX) | Click-to-dial, auto-record, transcribe, score |
| Email | SMTP + Postmark/Resend | Templates, tracking opens/clicks |
| WhatsApp Personal | WATI personal numbers | פר נציג |

**Unified Conversation View:**
- כל ההודעות, השיחות, המיילים, מסודרים כרונולוגית בכרטיס הליד
- Threads מתחזקים אוטומטית
- Reply ישירות מהכרטיס - הולך לערוץ הנכון
- Templates מנוהלים מרכזית
- Variables בתבניות ({{firstName}}, {{approvedAmount}}...)

**Auto-Reply / Drip Campaigns:**
- אם ליד לא ענה ל-2 שיחות → שלח WhatsApp אוטומטי "ניסינו להגיע..."
- 24 שעות לפני תאריך פגישה → תזכורת SMS
- אחרי אישור הלוואה → תודה + אישור + מסמכים
- 6 חודשים אחרי הלוואה → "צריך עוד אשראי? אנחנו כאן."

### 5.5 Lender Bidding Workflow

**הלב של בינגו - איפה הכסף נעשה.**

**זרימה אוטומטית:**
1. נציג לוחץ "Start Bidding" (או auto on BDI_APPROVAL state)
2. המערכת שולחת בקשות במקביל ל-12 גופים
3. תשובות חוזרות:
   - **API גופים**: BDI אוטומטי (95%+), Phoenix API, בלנדר API, קרדיט 24 API
   - **Scraping**: Cal, Max, Isracard (אם אין API ישיר)
   - **Manual**: גופים שלא תומכים - נציג מזין ידנית
4. תוצאות מגיעות כ-`LenderQuote`:
   - גוף, סכום מאושר, תשלומים, ריבית, החזר חודשי, תוקף ההצעה
5. UI מציג Grid עם 12 cards - "ירוק" באישור, "אדום" בסירוב
6. **Smart Recommendation Engine** מציג אוטומטית:
   - "ההצעה הטובה ביותר: כאל 50,000 ₪ ב-60 תשלומים, החזר 950 ₪"
   - "חיסכון ללקוח: 320 ₪/חודש לעומת המצב הנוכחי"
   - "Best fit לפרופיל הלקוח: הפניקס (סבירות 92% להתקדמות)"
7. נציג בוחר → סטטוס עובר ל-`CUSTOMER_DECISION`
8. שולח את ההצעה ללקוח (WhatsApp/Email) - PDF מתוצר אוטומטית

**Bidding Insights:**
- היסטוריה: "כאל אישרו 85% מהפרופילים הדומים בחודש האחרון"
- Performance per lender: זמן תגובה, % אישור, ריבית ממוצעת
- Auto-blacklist גופים שלא עונים

### 5.6 BDI Integration (CRITICAL)

**זוהי הבדיקה המרכזית.** היום עושים ידנית - בעתיד אוטומטי.

**Architecture:**
- שירות BDI חיצוני יש לו API (בנק ישראל - דירוג אשראי)
- הסכמה ללקוח (e-signature) נשמרת + audit log
- שליחה אוטומטית עם t.z + שם
- תוצאה חוזרת: נתוני אשראי מלאים
- AI מנתח: דירוג, התראות, המלצה
- מציג בכרטיס הליד כ-Report:
  - דירוג כללי (FICO-style: 300-850)
  - היסטוריית פיגורים
  - מצב חשבונות, התחייבויות
  - "כדאיות": מה הסיכוי לאישור הלוואה

**טעויות שיש לתפוס:**
- חוזר ת.ז לא תקין
- הלקוח לא בגיל 18+
- חוסר הסכמה ידועה - לא נשלח

### 5.7 Contract Signing (E-Signature)

**שלב חוקי קריטי.**

- מנהל יוצר תבניות חוזה (Word/PDF) + variables
- במסך הליד: כפתור "שלח לחתימה"
- הלקוח מקבל WhatsApp/SMS עם קישור
- חותם בטלפון (SignatureCanvas)
- חוזה חתום עם **timestamping + IP** נשמר ב-S3 עם חתימה דיגיטלית
- Audit log: מי שלח, מתי, IP חתימה, מכשיר
- אינטגרציה עם **Signnow / DocuSign / Comsign** למקרים מורכבים

### 5.8 Payment & Invoicing (GreenInvoice)

- כל "אישור סופי" יוצר אוטומטית חשבונית עסקה ב-GreenInvoice API
- מעקב תשלומים: paid / pending / overdue
- שליחת תזכורות אוטומטית ללקוחות שלא שילמו
- דשבורד CFO: cashflow, MRR, צפי
- Reconciliation עם הבנק (Open Banking API)

### 5.9 Call Center Integration (CallMarker + Power Dialer)

**הבעיה היום:** CallMarker נפרד. תותח שיחות נפרד. אין שליטה.

**הפתרון:**

1. **CallMarker API**:
   - Click-to-dial מהכרטיס
   - שיחה מתחילה - הקלטה אוטומטית
   - הקלטה נמשכת ל-S3 שלנו
   - תעתוק אוטומטי (Whisper / Google Speech)
   - AI scoring (Claude):
     - "האם הנציג השיג את היעד?"
     - "טעויות בשפה"
     - "המלצות לשיפור"
   - הקלטה + תעתוק + ניקוד נשמרים בכרטיס

2. **Power Dialer (תותח שיחות)** מובנה ב-CRM:
   - נציג בוחר רשימת לידים + לוחץ "Start"
   - המערכת מחייגת אוטומטית, כל פעם הקפיצה לכרטיס הפתוח
   - אם הלקוח לא עונה → status "no answer" אוטומטית
   - אם עונה → טיימר רץ + תסריט שיחה מוצג
   - אחרי שיחה → AI מציע סטטוס עדכון
   - **Predictive dialing**: מחייג ל-N לידים במקביל, מתחבר לנציג כשמישהו עונה

3. **שיחות נכנסות**:
   - לקוח מתקשר → מזהים מספר → קופץ כרטיס שלו ב-CRM
   - היסטוריה אחרונה נטענת אוטומטית
   - אם אין כרטיס - מוצע ליצור

### 5.10 SMS Hub

- שליחת SMS מהכרטיס (campaigns + individual)
- Tracking: delivered / clicked
- 2-way: לקוח מגיב ל-SMS → מופיע בכרטיס
- Templates מנוהלים מרכזית
- Compliance: blocklist, opt-out auto

### 5.11 Document Vault

- כל קובץ ליד: PDF, JPG, חוזה, BDI report, תלוש משכורת
- Drag & drop
- AI auto-tag: "תלוש משכורת" / "תעודת זהות" / "אישור הכנסה"
- OCR: שולף נתונים מתלושי שכר ומכניס אוטומטית לשדות הליד
- Audit: מי הוריד, מתי, IP

### 5.12 Reports & BI

**3 רמות:**

1. **Real-Time Tile Dashboard** (לנציגים):
   - הלידים שלי, משימות באיחור, ביצועי היום

2. **Manager Dashboard**:
   - Funnel conversion (כמה מ-1000 לידים סוגרים)
   - Per-agent performance: שיחות, סטטוסים, סגירות, חוזה ב$
   - Bottlenecks: איפה לידים נתקעים
   - Source ROI: כמה עולה ליד פר מקור, כמה מרוויחים

3. **C-level BI**:
   - MRR / ARR
   - Lifetime value per customer
   - Lender performance (% אישור, ריבית, חיסכון ללקוח)
   - Cohort analysis

**טכנולוגיה:** Metabase / Tableau embedded, או מותאם.

### 5.13 Admin & Configuration

מנהל יכול ב-UI (ללא קוד):
- להוסיף/לערוך תהליכים וסטטוסים
- להגדיר חוקי routing
- להגדיר SLA + escalation
- ליצור templates (WhatsApp, SMS, Email)
- לנהל משתמשים והרשאות (RBAC)
- לנהל גופי מימון (פעיל/לא, יחס API)
- לנהל מקורות לידים + UTM tracking
- לראות audit log מלא

---

## 6. AI Layer - הסוד התחרותי

### 6.1 Call Analysis
- כל שיחה מתועתקת (Whisper - תומך עברית מעולה)
- Claude/GPT-4 מנתח:
  - **Sentiment**: התלהבות / נטרליות / כעס
  - **Objections raised**: רשימת התנגדויות שעלו
  - **Action items**: מה הלקוח ביקש, מה הנציג הבטיח
  - **Quality score**: 0-100 לפי 10 פרמטרים
  - **Compliance check**: האם נאמרו דברים חוקיים אסורים
- Summary של 3 שורות נשמר בטיימליין

### 6.2 Smart Co-pilot
- בזמן שיחה: AI שומע + מציע (text suggestions)
- "הלקוח אמר שהוא מהסס - הצע: הצעה זמנית 30 יום"
- אחרי שיחה: "סטטוס מומלץ: ממתין למסמכים"

### 6.3 Auto-routing
- ליד חדש נכנס → AI מחליט מי הנציג הטוב ביותר לקבל אותו על סמך:
  - Performance היסטורי על פרופילים דומים
  - עומס נוכחי
  - שעה/יום
  - מקור הליד

### 6.4 Smart Script Generation
- תסריט שיחה נוצר דינמית לפי מצב הליד
- "הלקוח נדחה ב-3 גופים אבל אושר בכאל - הצע אישור מהיר עם דחיפות"

### 6.5 Customer Intent Detection
- WhatsApp/SMS נכנס → AI מסווג:
  - intent: question / complaint / cancellation / agreement
  - urgency: low / med / high
  - מקפיץ alert / מצמיד למשימה

### 6.6 Document AI (OCR + Extraction)
- תלוש שכר → שולף שם, חברה, סכום נטו, וותק
- ת.ז → מאמת אוטומטית
- חוזה ישן → מציין שדות חסרים

### 6.7 Anomaly Detection
- ליד שעבר 4 ימים בלי טיפול → ניקוד בלקרסט
- נציג עם המרה נמוכה ב-30% השבוע → notification למנהל
- גוף מימון שמסרב יותר מהרגיל → מנהל מקבל אזהרה

---

## 7. UX Principles - חוויית עבודה יוצאת דופן

### 7.1 No-Click Defaults
- 80% מהשדות נמלאים אוטומטית מהמערכת
- ת.ז → אוטו מילוי שם, גיל, מין
- כתובת → אוטו מילוי עיר, רחוב, מיקוד

### 7.2 Keyboard-First
- כל פעולה חשובה - shortcut מקלדת
- Cmd+K - command palette (קיים)
- C - ליד חדש, T - משימה, P - חיוג, A - ארכיון
- Tab - ניווט בין שדות, Enter - שלב הבא

### 7.3 Smart Defaults
- Status הבא מוצע אוטומטית לפי הנתונים
- שכר טרחה מחושב לפי סוג הלוואה וסכום
- "Suggested next action" תמיד מוצגת

### 7.4 Optimistic UI
- כל פעולה מעודכנת מיידית - הסנכרון לרשת קורה ברקע
- אם נכשל - rollback + הודעה

### 7.5 No Modal Hell
- שום פעולה לא דורשת modals שלא ניתן לסגור
- "Save" אוטומטי כמעט תמיד

### 7.6 Mobile-First Internals
- נציג שעובד משטח עם טאבלט - חוויה זהה
- הכרטיס נסגר יפה לטלפון
- אישור חוזה - חתימה בטלפון של הלקוח

### 7.7 Onboarding Built-in
- נציג חדש מקבל tour מובנה (Shepherd.js / Driver.js)
- "Hint of the day" - tip לוויטלי בכל הפעלה

### 7.8 Speed = UX
- Page load < 800ms
- Search response < 200ms
- API calls אופטימליים, batching, caching

---

## 8. Data Model (Core Entities)

```typescript
Lead {
  id, fullName, idNumber, phone, email, birthDate, gender
  state: LeadState (NEW, SCREENING, ..., PAID)
  ownerId
  createdAt, updatedAt
  source, sourceCampaign, utm*
}

LeadDetails {  // 1:1 with Lead
  amountRequested, loanPurpose
  family*, employment*, income*, assets*, vehicle*, bank*
  creditHistory* (yes/no fields)
  bdiApproved, bdiReportUrl, bdiScore
  ...
}

LenderQuote {  // many per Lead
  leadId, lenderKey, result, approvedAmount, payments, interest, monthly
  receivedAt, validUntil, source: api|manual
}

Activity {  // many per Lead - unified timeline
  leadId, type (call|message|email|status|note|task)
  authorId, content, metadata
  createdAt
  // For calls:
  recordingUrl, transcript, aiSummary, aiScore
}

Task {
  leadId, assigneeId, title, description, dueAt, urgent
  status: pending|done|cancelled
}

Document {
  leadId, kind, fileUrl, ocrData, signed*, addedBy
}

Process {  // = Pipeline definition
  key, label, statuses[]
}

ProcessStatus {
  processKey, key, label, emoji, color, position
  isTerminal, slaHours, autoActions
}

CommunicationTemplate {
  channel: whatsapp|sms|email
  category, body, variables[]
}

User {
  id, name, email, role, permissions[]
  workingHours, callQueue, performance
}

Integration {
  kind: wati|callmarker|greeninvoice|...
  credentials (encrypted), config, status
}
```

### Migration Strategy from יועצים
1. **ETL job** - שואב כל הנתונים מ-יועצים API
2. Field mapping: יועצים schema → BINGO schema
3. Tests ב-dataset קטן (100 לידים)
4. Run on dev → review → run on prod
5. Cutover ב-shabbat: ייצוא סופי, בדיקה, החלפה

---

## 9. Roadmap - מפת דרכים

### Phase 1 — Foundation (חודש 1-2)
**מטרה:** MVP עובד פר נציג

- [x] עיצוב + design system + מותג
- [x] Layout (Header, Sidebar, Tasks)
- [x] Dashboard with widgets + leads table
- [x] Lead card with wizard flow (13 steps)
- [x] Command palette (⌘K)
- [ ] Backend setup: Postgres + Prisma + Next API
- [ ] Auth (NextAuth + email/SMS OTP)
- [ ] Permissions (RBAC)
- [ ] CRUD בסיסי: Leads, Activities, Users, Statuses
- [ ] Mock data → real data
- [ ] Deploy to Vercel
- [ ] Training למשתמשי בטא

**Deliverables:** מערכת ש-2-3 נציגים יכולים לעבוד עליה במקביל ל-יועצים.

### Phase 2 — Communications (חודש 3)
- [ ] WATI integration (send/receive WhatsApp)
- [ ] SMS sending (CallMarker / Twilio)
- [ ] CallMarker click-to-dial
- [ ] Email integration (SMTP)
- [ ] Unified inbox + threading
- [ ] Templates manager

### Phase 3 — Automation Engine (חודש 4)
- [ ] State Machine engine
- [ ] Rules builder UI (no-code automations)
- [ ] SLA + escalations
- [ ] Auto-routing
- [ ] Drip campaigns
- [ ] Power Dialer

### Phase 4 — Lender Integration (חודש 5)
- [ ] BDI API integration
- [ ] Lender bidding workflow
- [ ] APIs: Phoenix, Cal, Max, Blender, Credit24
- [ ] Web scraping fallbacks
- [ ] Recommendation engine
- [ ] PDF offer generation

### Phase 5 — AI Layer (חודש 6)
- [ ] Call recording + transcription
- [ ] Call scoring
- [ ] Smart suggestions
- [ ] Document OCR
- [ ] Auto-summaries
- [ ] Sentiment analysis

### Phase 6 — Money & Compliance (חודש 7)
- [ ] GreenInvoice integration
- [ ] E-signature (Comsign / SignNow)
- [ ] Audit log full
- [ ] GDPR/Privacy compliance
- [ ] Open Banking reconciliation

### Phase 7 — BI & Optimization (חודש 8)
- [ ] Full BI dashboards
- [ ] Manager analytics
- [ ] Lender performance reports
- [ ] Cohort analysis
- [ ] Predictive analytics

### Phase 8 — Scale & Migration (חודש 9-10)
- [ ] Migration from יועצים (full)
- [ ] Decommission יועצים
- [ ] Performance optimization
- [ ] Load testing
- [ ] Multi-region deployment

---

## 10. KPIs להצלחה

| KPI | יעד | מדידה |
|-----|-----|-------|
| זמן ממוצע לסגור ליד | מ-6 ימים → 1-2 ימים | DB query |
| משימות שנשכחות | מ-25% → <5% | SLA breach % |
| Conversion rate | +20% | sales / leads |
| Time to first contact | מ-4 שעות → 5 דקות | event log |
| נציג satisfaction | NPS 50+ | survey רבעוני |
| הקלטות שיחה מנותחות | 100% (היום: 5% ידני) | recordings / total calls |
| ROI per source | מנוטר רציף | revenue / cost per source |

---

## 11. סיכונים ופתרונות

| סיכון | פתרון |
|-------|-------|
| גופי מימון לא יספקו API | scraping + ידני fallback |
| תעתוק עברית לא מדויק | Whisper-large + human review + feedback loop |
| נציגים עמידים לשינוי | UI דומה ליועצים בהתחלה, שינויים הדרגתיים, training |
| Compliance (פרטיות, BDI) | יועץ משפטי + audit logs מהיום הראשון |
| Migration data loss | Backup + parallel running + rollback plan |
| Vendor lock-in (WATI, CallMarker) | Abstract interfaces, multi-vendor support |
| AI hallucinations | Always confidence scores + human review on critical actions |

---

## 12. ההמלצה - איך מתחילים מחר

**Quick Wins (1-2 שבועות):**

1. **תשלים את MVP** הנוכחי שבניתי (הוא כבר 60% מ-Phase 1):
   - הוסף PostgreSQL + Prisma
   - הוסף NextAuth
   - העבר את ה-mock data ל-DB

2. **התחבר ל-WATI** - 3 ימים של עבודה לקבל שליחת WhatsApp מהכרטיס

3. **חבר את CallMarker click-to-dial** - שליטה משופרת על שיחות

4. **תכננו workshop של חצי יום** עם הנציגים - מה הכי כואב להם היום? תקבל insights זהב

5. **בחר 1-2 גופי מימון** והוסף אינטגרציה API ישירה - quick win עצום

**Slow & Steady (3-6 חודשים):**
- כל מודול לפי הroadmap
- 80% MVP על כל מודול, 20% polish
- A/B test פיצ׳רים עם 2 נציגים לפני הפצה לכולם

**Long-term (6-12 חודשים):**
- AI layer מלא
- Migration סופי מ-יועצים
- מערכת מובילה בענף

---

## 13. סיכום

**הבעיה היום:**
מערכת מיושנת, ידנית, מנותקת. נציגים מבזבזים 60% מהזמן על drudge work במקום על שיחות.

**הפתרון:**
CRM ייעודי לבינגו, עם state machine ברור, אוטומציה מקיפה, אינטגרציות native, AI co-pilot, ו-UX של "click and go".

**ערך כלכלי משוער:**
- חיסכון של 3-4 שעות לנציג ביום = ~10 שעות פר נציג בשבוע = 40 ק"ש פר נציג בחודש = 480 ק"ש בשנה
- עליית conversion ב-20% = משמעות תוצאות עסקיות גבוהות בעצימות גבוהה
- ROI חזוי: 12-18 חודשים (לפי גודל החברה)

**הצעד הבא:**
לעבור על המסמך הזה, לסמן את ה-Phase 1 שלא הושלם, להחליט על תקציב התחלתי ותאריך התחלה.
