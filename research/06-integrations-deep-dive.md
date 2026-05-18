# Deep Dive — אינטגרציות קריטיות

## 1. WATI (WhatsApp Business API)

**מה זה:** WATI הוא BSP (Business Solution Provider) של WhatsApp Cloud API. מאפשר שליחת הודעות עסקיות, templates, ובוטים.

**מה אנו צריכים מ-WATI:**
- שליחת WhatsApp ללקוח מהכרטיס (single + bulk)
- קבלת תגובות → מופיע ב-timeline של הליד
- Templates מאושרים על ידי WhatsApp (HSM templates)
- 2-way conversation (לא רק broadcast)
- Status: sent / delivered / read / replied

**אסטרטגיה:**
1. **API Direct Integration:**
   - WATI חושף REST API לכל פעולה
   - Endpoint דוגמה: `POST /api/v1/sendTemplateMessage`
   - Webhook לקבלת הודעות נכנסות
2. **טבלאות חדשות ב-DB:**
   - `WhatsAppConversation` (1:1 with Lead by phone)
   - `WhatsAppMessage` (timeline)
   - `WhatsAppTemplate` (synced from WATI)
3. **UI ב-CRM:**
   - בכרטיס הליד: tab "WhatsApp" עם conversation
   - כפתור "Send" מהיר עם template selector + custom mode
   - Variables בתבניות מולאות אוטומטית מנתוני הליד
4. **ניתוב:**
   - הודעה נכנסת → מזהים phone → לקפוץ כרטיס + assignee notification
   - אם אין כרטיס - יוצרים אוטומטית

**Code skeleton:**
```typescript
// lib/integrations/wati.ts
export async function sendWhatsAppTemplate(opts: {
  to: string;        // phone in international format
  templateName: string;
  parameters: Record<string, string>;
  brokerId: string;
}) {
  return fetch(`${WATI_BASE}/api/v1/sendTemplateMessage`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${WATI_TOKEN}` },
    body: JSON.stringify({
      whatsappNumber: opts.to,
      template_name: opts.templateName,
      broadcast_name: `lead_${opts.brokerId}_${Date.now()}`,
      parameters: Object.entries(opts.parameters).map(([name, value]) => ({ name, value })),
    }),
  });
}

// app/api/webhooks/wati/route.ts
export async function POST(req: Request) {
  const body = await req.json();
  // body.eventType = "message" | "delivery" | "status"
  // body.waId = phone, body.text = content
  await db.activity.create({
    type: 'whatsapp',
    leadId: findLeadByPhone(body.waId),
    text: body.text,
    metadata: { messageId: body.id, raw: body },
  });
  // realtime push to assignee
  pusher.trigger(`agent-${leadAgent}`, 'whatsapp:new', { ... });
  return Response.json({ ok: true });
}
```

**טיפים מהשטח:**
- Templates מאושרים לוקח 24-48 שעות
- Free-form messages רק תוך 24 שעות מהודעה אחרונה של לקוח
- Pricing: ~$0.005 per message in Israel
- Conversation window: WhatsApp פותחים "session" של 24 שעות

---

## 2. CallMarker (PBX/Call Center)

**מה זה:** CallMarker היא מרכזיה ישראלית עם API לחיוג, הקלטה, ניתוב, IVR.

**מה אנו צריכים:**
- Click-to-dial מהכרטיס (קליק = שיחה מהמרכזיה לטלפון של הנציג)
- שיחות נכנסות מציגות popup עם זיהוי הליד
- הקלטות נשמרות אוטומטית בכרטיס
- Live status: מי בשיחה, עם מי, כמה זמן
- Transfer בין נציגים מתוך הכרטיס
- Power Dialer מובנה

**אסטרטגיה:**
1. **CallMarker API:** יש להם API ל-call control. צריך לקבל docs מהם.
2. **WebRTC לחילופין:** אם API מוגבל, ניתן להשתמש ב-WebRTC + SIP trunk - חיוג ישיר מהדפדפן
3. **Recording sync:** הקלטות נשמרות אצל CallMarker → cron job יומי שמושך אותן ל-S3 שלנו → מתעתק + מצרף לכרטיס

**Click-to-Dial UX:**
```
[נציג לוחץ "📞 חייג" בכרטיס]
   ↓ (POST /api/calls/start)
   ↓ CallMarker.dialBridge(agentExt, customerPhone)
   ↓ הטלפון של הנציג מצלצל - הוא עונה
   ↓ המערכת מחייגת ללקוח, מחברת
   ↓ Activity מתחיל להירשם: type=call, status=in-progress
   ↓ פופאפ "שיחה פעילה" עם טיימר ועם תסריט מוצע
   ↓ סיום שיחה → הקלטה תגיע ב-X דקות → transcribe + score
```

**שיחות נכנסות:**
```
לקוח מתקשר ל-1800-BINGO
   ↓ CallMarker IVR (אופציונלי)
   ↓ ניתוב לפי owner קודם או queue
   ↓ Pre-call: שאילתת CRM לפי caller ID
   ↓ Push notification ל-Browser של הנציג:
     "📞 שיחה נכנסת - יוסי כהן (ת.ז 12345... יש לו תהליך פעיל)"
   ↓ נציג עונה במחשב / טלפון
   ↓ הכרטיס נפתח אוטומטית
   ↓ הקלטה + תיעוד
```

**Power Dialer (תותח שיחות) — איך לעשות את זה נכון:**

**הבעיה היום:** "תותח" של CallMarker יוצר כמה שיחות, אבל לא משולב ב-CRM.

**הפתרון:**
```typescript
// lib/dialer.ts
class PowerDialer {
  queue: Lead[];
  agent: User;
  pace: 'predictive' | 'progressive' | 'preview';

  async start() {
    if (this.pace === 'predictive') {
      // מחייג ל-N לקוחות במקביל, מחבר עם נציג כשמישהו עונה
      const concurrency = Math.ceil(this.agent.efficiency * 2);
      for (const batch of chunks(this.queue, concurrency)) {
        const calls = await Promise.race(
          batch.map(l => this.dialAndAwait(l, 20s))
        );
        await this.onConnected(calls.firstAnswered);
      }
    } else if (this.pace === 'progressive') {
      // 1 ליד אחר השני, רק כשמחבר עוברים לבא
      for (const lead of this.queue) {
        const result = await this.dialAndAwait(lead, 30s);
        if (result.connected) await this.popLeadCard(lead);
        // נציג עובד עם הלקוח
        await this.waitForAgentReady();
      }
    }
  }
}
```

**UX לתותח:**
- Dropdown לבחירת רשימת לידים (queue)
- "▶ Start Power Dialer"
- מסך מצב חי: כמה שיחות נעשו, כמה ענו, כמה דחו, ממוצע משך
- Pause / Resume / Stop
- אחרי כל שיחה - 30 שניות "wrap-up" אוטומטיים + שדה הערות

---

## 3. GreenInvoice (חשבונית ירוקה)

**מה זה:** GreenInvoice היא ספק חשבונאות + חשבוניות בענן, פופולרי מאוד בישראל.

**מה אנו צריכים:**
- יצירת חשבונית עסקה אוטומטית כשליד מסתיים ב-`PAID`
- שליחת חשבונית ללקוח במייל
- מעקב סטטוס תשלום
- הצעת מחיר ללקוח (לפני סגירה)

**API שלהם:**
- REST API מלא, OAuth2
- Endpoints חשובים:
  - `POST /api/v1/documents/new` - יצירת מסמך (חשבונית, הצעת מחיר, קבלה)
  - `GET /api/v1/documents/{id}` - סטטוס מסמך
  - `POST /api/v1/documents/{id}/send` - שליחה ללקוח

**אינטגרציה:**
```typescript
// lib/integrations/greeninvoice.ts
export async function createInvoice(lead: Lead) {
  return fetch(`${GI_BASE}/api/v1/documents/new`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${GI_TOKEN}` },
    body: JSON.stringify({
      type: 305,  // חשבונית מס
      client: {
        id: lead.idNumber,
        name: lead.fullName,
        emails: [lead.email],
      },
      income: [{
        description: `שכר טרחה - הלוואה ${formatCurrency(lead.finalApprovedAmount)}`,
        quantity: 1,
        price: lead.feeAmount,
        vatType: 1, // עם מע"מ
      }],
      remarks: `תהליך מס׳ ${lead.id}`,
      footer: `תודה על בחירה בבינגו!`,
    }),
  });
}
```

**Auto-trigger:**
- כשהליד מגיע למצב `PAID` → trigger יוצר חשבונית
- שליחה ללקוח באוטומציה
- קישור לחשבונית מוצמד לכרטיס
- אם פתחה - status update

---

## 4. AI Call Analysis Pipeline

**הזהב של המערכת.** היום שעות של מנהלים מאזינים לשיחות בידיים. אנחנו נעשה את זה ב-100% אוטומטי.

**Pipeline:**
```
שיחה הסתיימה (CallMarker webhook)
   ↓ (5-10 דק לאחר השיחה)
שולפים את ההקלטה מ-CallMarker S3
   ↓ אוחסון ב-S3 שלנו (encryption)
   ↓
Whisper API (Hebrew):
   POST audio/transcribe
   → Transcript מלא + timestamps + speakers
   ↓
Claude/GPT-4 analysis (parallel calls):
   1. Summary: "הלקוח התעניין בהלוואה של 50K לרכב. הנציג הציע פגישה."
   2. Sentiment: 0.8 positive
   3. Objections: ["מחיר יקר", "צריך לחשוב"]
   4. Action items: ["שלח מחירון", "התקשר ביום ה׳"]
   5. Compliance: ✅ הזכיר ריבית? ✅ אישור BDI? ✅
   6. Quality score: 78/100
      - Opening: 8/10
      - Discovery: 7/10
      - Objection handling: 6/10
      - Closing: 8/10
   ↓
שמירה ב-DB:
   - Activity.aiSummary
   - Activity.aiScores
   - Activity.transcript
   ↓
Webhook ל-Slack/Email למנהלים:
   - אם score < 50 → אזהרה
   - אם compliance fail → דחוף
   - דוח שבועי per agent
```

**טכנולוגיה:**
- Whisper (OpenAI) - תומך עברית ברמה מצוינת, $0.006 לדקה
- Claude 4 Sonnet - הטוב ביותר לניתוח עברית
- Background jobs - BullMQ
- שמירה זול: 1 שיחה ממוצעת 5 דק = 30 שניות עיבוד + ~$0.05 עלות AI

---

## 5. BDI Integration

**הסיפור:** BDI = Business Data Index, השירות הראשי בישראל לקבלת דירוג אשראי של לקוח.

**איך עובד היום:** נציג נכנס לאתר BDI, מקליד פרטים, מקבל דוח PDF, מעלה ידנית, copy-paste נתונים.

**איך נעבוד:**
1. **חוזה ישיר עם BDI** (יש להם תכנית partners)
2. **API**:
   - `POST /api/check` עם {idNumber, fullName, dateOfBirth, consentSignature}
   - מקבלים JSON עם דירוג + history
3. **שמירה כ-PDF** עם signature → audit log
4. **ניתוח אוטומטי:**
   - דירוג מתחת 600 → אזהרה לנציג
   - חובות מעל מסוים → flag
   - הוצאה לפועל פעילה → block automatic
5. **Compliance:**
   - חתימה דיגיטלית של הלקוח לבדיקה - חובה
   - 7 שנים שמירת מסמכים
   - GDPR-equivalent ישראלית

---

## 6. Banking & Lender APIs

**גופי מימון - מי יש לו API?**

| גוף | API ישיר | תחליפים |
|-----|---------|---------|
| **בנק ירושלים** | יש (Open Banking) | — |
| **כאל** | חלקי | Scraping של הפורטל |
| **מקס** | חלקי | Scraping |
| **ישראכרט** | חלקי | Scraping |
| **בלנדר** | יש (לפי בקשה) | — |
| **קרדיט 24** | יש (לפי בקשה) | — |
| **הפניקס** | יש (B2B) | — |
| **מימון ישיר** | יש (partners) | — |
| **פמה** | חלקי | Scraping |
| **קרנות פנסיה** | תלוי בקרן | מודולרי |

**Strategy:**
1. **חוזה עם 3-4 הגדולים** (קרדיט 24, בלנדר, הפניקס, מימון ישיר)
2. **Scraping ל-3 הבאים** (Cal, Max, Isracard) - בענן עם Puppeteer/Playwright
3. **Manual fallback** ל-rest - עם UI חכם להזנה מהירה
4. **Abstraction layer** - כל גוף מאחורי אותו interface `ILender`:
   ```typescript
   interface ILender {
     check(profile: CustomerProfile): Promise<LenderQuote>;
     status: 'api' | 'scraping' | 'manual';
     avgResponseTime: number;
   }
   ```
5. **Parallel bidding:** שולחים ל-12 בו זמנית, מציגים תוצאות כשמגיעות

---

## 7. SMS Hub

**Twilio / CallMarker / Lir SMS** - אופציות.

**Recommendation:** CallMarker SMS - כבר מחוברים, חיסכון על vendor.

**UX:**
- שליחת SMS מהכרטיס בלחיצה
- Templates עם variables
- Bulk send (SMS campaign)
- Tracking: delivered / read (via link click)
- 2-way: לקוח עונה → מופיע בtimeline

**Code:**
```typescript
await callmarker.sendSms({
  to: lead.phone,
  body: `שלום ${lead.firstName}, אישרנו לך הלוואה ${formatCurrency(amount)}. לחיצה לאישור: ${shortlink}`,
  callbackUrl: '/api/webhooks/sms-status',
});
```

---

## 8. E-Signature

**מי:** Comsign / SignNow / DocuSign

**עיקרון:** מסמך נשלח דיגיטלית → לקוח חותם מהטלפון → חוזה חתום + timestamp + IP + audit נשמרים.

**Implementation:**
1. תבנית מסמך (HTML/Word) עם merge fields
2. נציג לוחץ "Send for signature" בכרטיס
3. שירות יוצר signing flow:
   - SMS/WhatsApp ללקוח עם link
   - Page של חתימה (responsive, mobile-first)
   - Multiple signers אם צריך
4. Webhook חזרה: signed / declined
5. PDF חתום + audit trail נשמרים ב-Document Vault

---

## 9. Open Banking & Reconciliation

**מטרה:** התאמת תשלומים מהבנק לחשבוניות.

**עם הבנקים שעובדים יחד בישראל (Yodlee, Open Banking):**
- API מציג עסקאות נכנסות
- Match by amount + date + reference
- Auto-mark invoice as paid
- Alert אם תשלום לא הגיע בזמן

---

## 10. Slack / Microsoft Teams Integration

**למה:** התראות מנהלים, alerts קריטיים, daily standups.

- **Bot ב-Slack:**
  - `/bingo lead 12345` - מציג סטטוס
  - אזהרות אוטומטיות: "Lead 12345 has been in BDI_APPROVAL for 6 hours"
  - דוח יומי בשעה 18:00 לכל מנהל

---

## 11. Calendar / Meetings

**Google Calendar / Outlook:**
- פגישות עם לקוחות
- תיאום אוטומטי דרך Calendly-like
- Reminders ללקוח לפני פגישה

---

## 12. Security & Compliance

**Encryption:**
- כל הנתונים at-rest מוצפנים (AES-256)
- TLS 1.3 in-transit
- Secrets ב-Vault / AWS KMS

**Compliance:**
- חוק הגנת הפרטיות 1981 (ישראל)
- ת"ז וכרטיסי אשראי - PCI-like
- BDI: 7 שנים שמירה, מחיקה לפי בקשה
- Audit log לכל פעולה: מי, מתי, מה, IP

**Permissions:**
- RBAC: Owner, Manager, Agent, Underwriter, Marketing, Bot
- Row-level security: נציג רואה רק לידים שלו או של הצוות שלו
- Field-level: רק מנהלים רואים BDI scores

**2FA:**
- חובה לכל משתמש
- SMS / Authenticator app / Hardware key

---

## סיכום אינטגרציות

| שירות | עדיפות | זמן | ROI |
|-------|--------|-----|-----|
| WATI | 🔥🔥🔥 | 1-2 שבועות | מאוד גבוה |
| CallMarker click-to-dial | 🔥🔥🔥 | 1-2 שבועות | גבוה |
| Power Dialer | 🔥🔥🔥 | 3 שבועות | מאוד גבוה |
| BDI API | 🔥🔥🔥 | 4 שבועות | קריטי |
| GreenInvoice | 🔥🔥 | 2 שבועות | בינוני |
| Call recording + AI analysis | 🔥🔥 | 6 שבועות | גבוה (לאיכות) |
| Lender APIs (top 4) | 🔥🔥 | 8 שבועות | קריטי |
| E-Signature | 🔥🔥 | 3 שבועות | קריטי (חוקי) |
| Lender Scraping (3) | 🔥 | 4 שבועות | בינוני |
| Slack Bot | 🔥 | 1 שבוע | נמוך |
| Open Banking | 🔸 | 4 שבועות | בינוני |
