# BINGO CRM — תוכנית-אב + מיילסטון 1: כרטיס הלקוח הגאוני

## Context

חן (מנכ"ל בינגו) רוצה לבנות את ה-CRM המתקדם בעולם לתיווך אשראי, שיחליף את Yoatsim.
הכאבים המרכזיים (במילותיו): כרטיס לקוח עמוס שנציגים טובעים בו · מרכזייה חיצונית לא
מחוברת · בלגן במשימות ופולואפים · הנציג לא רואה את הנתונים וההישגים שלו · כפל
תהליכים (ליד ב-5 תהליכים בו-זמנית) · ניווט כבד · עבודה ידנית חוזרת · חוסר שליטה ניהולית.

הכרעות שהתקבלו:
1. **מתחילים מכרטיס הלקוח** (LeadCardV3 שבור — מפנה ל-CREDIT_QUESTIONS/creditFailed/ramzorBad שלא קיימים ב-journey.ts v3).
2. **קפיצה עיצובית** — command-center: מסך אחד מונחה-פעולה, מקלדת-first, בצבעי המותג.
3. עיקרון-העל: **ליד אחד = מסע אחד** ("יש רכב" = תכונה, לא תהליך).

## מצב קיים (ממופה ומאומת)

- `lib/journey.ts` v3 (281 שורות) — מנוע מצב שלם: 8 סקשנים + פוסט-חתימה,
  `disqualified()/deriveTrack()/needsVehicleAnswer()/isDeadEnd()/currentSection()/sectionComplete()`.
- `components/lead/LeadCardV3.tsx` (~820 שורות, מונוליט) — 95% שלם אבל לא מתקמפל:
  שורות 14–15 מייבאות `CREDIT_QUESTIONS`, `creditFailed`, `ramzorBad` שלא קיימים.
  שומר מצב ב-`localStorage` (`bingo-journey-v2-${lead.id}`) — לא רב-משתמשים.
- Prisma: Lead עשיר (רוב שדות המסע כבר קיימים), Activity, LenderCheck, User, Lender.
- API: GET/PATCH `/api/leads/[id]` עובד, מתעד שינויי stage ל-Activity.
- מערכת עיצוב Brand-True v3 (`b-card`, `b-pill-*`, `b-chip-*`...) — מוכנה.
- מסכים: leads אמיתי מ-DB; dashboard/briefing/wallboard/inbox — מוק; 15 עמודי admin — stubs.

---

# חלק א' — תוכנית-האב (הארכיטקטורה של "ליד אחד = מסע אחד")

## העיקרון המבני
- **`Journey`** — לליד יכולים להיות כמה מסעות **לאורך זמן** (לקוח חוזר, שימור, הגדלה), אבל
  לכל היותר **מסע פתוח אחד**. זה הפתרון לליד שהיה ב-Yoatsim עם "BDI שלילי" + "אישור סופי" בו-זמנית.
- **Traits** — עובדות שהמערכת זוכרת על הליד (יש רכב, BDI שלילי, ת"ז לא בתוקף) — עמודות על Lead, לא תהליכים.
- **`SideCase`** — מודול צד קטן לשני העניינים המקביליים באמת: משפטי (132 לידים) וביטוחים.
- **בריכת שיווק** — 61K לידים של WATI הם לא מסע בכלל: `Lead.pool="nurture"`.

## מיפוי 15 התהליכים של Yoatsim
| Yoatsim | הופך ל- |
|---|---|
| מחלקת החתמות | שלבי מסע NEW/FIRST_CALL/AGREEMENT |
| הלוואה לכל מטרה (8.6K) | המסע המרכזי, track=general |
| מחלקת רכב (14K) | אותו מסע, track=vehicle |
| נכסים מכירות+תפעול | track=property |
| מחלקת עסקים | track=business (פעימה 1/2) |
| שימורים יוני (3.2K) | **מסע חדש** type=retention (לא סטטוס מקביל) |
| לא מעוניינים (20K) + ארכיון (51K) | EXIT + exitReason + archived |
| ביטוחים / משפטי | SideCase |
| WATI פרסום (61K) | pool=nurture + CampaignTouch |
| ספאם / דרושים | EXIT + phoneBlocked / job-applicant |

## מכונת השלבים האחודה
```
NEW → FIRST_CALL → SCREENING → AGREEMENT → CHECKS → OFFER → DOCS → FUNDING → PAID
                                          ↘ EXIT (מכל מקום, עם exitReason)
```
+ `substatus` פר-מסלול (מוגדר כדאטה ב-lib, לא enum).

## פירוק הסטטוסים לארבעה דליים
1. **מצבי משימה** (לא סטטוס ליד!): "אין מענה 1-4" → סולם משימות אוטומטי (שעה→4ש'→מחר→3 ימים);
   "לחזור ללקוח" → Task עם dueAt. שלב הליד לא משתנה בגלל אין-מענה.
2. **מצבי LenderCheck**: כל צינור ירושלים ("אישור עקרוני-ירושלים", "ממתין לעו\"ש") → סטטוס על LenderCheck,
   הליד עצמו פשוט ב-CHECKS/OFFER. + שדה interestedToProceed.
3. **שלב+תת-סטטוס במסע**: "מוכן לבדיקה" → CHECKS/ready; "אישור סופי-ממתין לשליח" → DOCS/courier; וכו'.
4. **סיבות יציאה + Traits**: "BDI שלילי" = trait שנשמר + אוטומציה שמציעה מסלול רכב אם יש רכב.

## מודלים חדשים ב-Prisma (עיקרי)
`Journey`, `JourneyEvent` (מזין funnel/SLA), `Task` (callback/docs/payment, dueAt, snooze, סולם אין-מענה),
`Automation`+`AutomationRun` (trigger/conditions/actions JSON — מכסה את כל 21 האוטומציות),
`MessageTemplate`+`MessageOutbox` (42 תבניות, SMS/WhatsApp/WATI, משתנים כמו {{firstName}}),
`SideCase`, `DailyStat`+`Target` (ביצועי נציג), `StageSla`+`Payment` (בקרה ניהולית), `CronLock`.
Lead מקבל: substatus, track, activeJourneyId, pool, archived, phoneBlocked, smileyAuto/smileyManual, traits.
**Lead.stage נשאר כמראה של המסע הפעיל** — הקוד הקיים והאינדקסים ממשיכים לעבוד.

## מנוע האוטומציות (SQLite, קונטיינר יחיד ב-Coolify)
- אירועי שדה/שלב רצים סינכרונית בתוך ה-request דרך `lib/lead-service.ts` (נתיב מוטציה אחד).
- לולאת tick כל 60 שניות דרך `instrumentation.ts` + נעילת CronLock — טיימרים, SLA, אין-מענה, שליחת Outbox.
- הודעות נשלחות דרך Outbox עם retries. ממשק ספקים: WATI / whatsapp-hub (הפרויקט הקיים) / SMS.

## הרשאות (מיפוי 9 תפקידי Yoatsim)
role פשוט: owner / manager / team-lead / agent / marketing / bot + scope (all/team/own+unassigned/own)
+ דגלי יכולות (canDelete, canEmail, dialerOnly...). **אין כיום auth בכלל — נוסף בשלב 4** (login + scoping בכל API).

## טלפוניה (Voicenter) — שלב תחום
Webhook CDR → Activity עם הקלטה ומשך שיחה → מזין סטטיסטיקות ו-wallboard. Click-to-call מהכרטיס והתור.
בלי whisper/IVR — הפאנל של Voicenter ממשיך לנהל את זה.

## מפת שלבים (אחרי מיילסטון 1)
| שלב | מטרה | היקף |
|---|---|---|
| 2. איחוד המסע | Journey+JourneyEvent+traits, מיפוי סטטוסים מיובאים | 2 סשנים |
| 3. משימות + My Day | תור יומי אחד לנציג; אין-מענה/לחזור = משימות | 2 סשנים |
| 4. Auth + הרשאות | login אמיתי, scoping לכל תפקיד | 1-2 |
| 5. תבניות + תקשורת | 42 תבניות, שליחה מהכרטיס, inbox אמיתי | 2 |
| 6. אוטומציות | 21 האוטומציות מוגדרות ופעילות + לוג ריצות | 2-3 |
| 7. ביצועי נציג | dashboard/briefing/profile מנתונים אמיתיים | 1-2 |
| 8. שליטה ניהולית | wallboard אמיתי, funnel, התראות SLA, ROI ספקים | 2 |
| 9. Voicenter | שיחות בטיימליין, click-to-call | 1-2 |
| 10. מודולי צד + nurture | משפטי/ביטוח/נכסים/עסקים + קמפיינים | 2 |
| 11. Cutover | ייבוא מלא 160K, שבוע ריצה מקבילה, עוזבים את Yoatsim | 2-3 |

---

# חלק ב' — מיילסטון 1: כרטיס הלקוח הגאוני (נבנה עכשיו)

## עובדות שאומתו (כולל `tsc --noEmit`)
- שגיאות הקומפילציה ב-LeadCardV3: ייבוא `CREDIT_QUESTIONS/creditFailed/ramzorBad` + שדות v2
  (`j.ramzor`, `j.credit`, `j.birthYear`, `j.familyStatus`, `j.spouseIncome`, `j.loanArrived`) + section ids ישנים (`family`/`ramzor`).
- שגיאה קיימת לא-קשורה ב-`app/(app)/dashboard/page.tsx:146` — נתקן אגב כדי ששער ה-tsc יהיה ירוק.
- **שני עמודי הליד קוראים ממוק** (`lib/data/leads.ts`), לא מה-DB! ב-DB יש 4 לידים אמיתיים (id 1–4).
- SQLite ב-Prisma: אין טיפוס Json — עמודות `String?` JSON (כמו הקונבנציה הקיימת).
- framer-motion@12 כבר מותקן. Confetti קיים. מערכת b-* מוכנה.

## A. השלמת `lib/journey.ts` v3
**לא מחזירים את פונקציות v2** — הכרטיס נכתב מחדש נגד v3. מיפוי call-sites:
`creditFailed||ramzorBad` → `disqualified()` · `CREDIT_QUESTIONS` → אופציות v3 · `j.ramzor` → helper חדש
`worstIndicator(j)` · `birthYear`→`birthDate` · `familyStatus`→`maritalStatus` · section ids → `personal`/`bdi`.

תוספות (שמות ניטרליים לפי CLAUDE.md):
- `screeningFailReasons(j): string[]` — תוויות עברית לרגע הפיבוט ("סמיילי אדום/צהוב", "אין כרטיס אשראי"...).
- `worstIndicator(j): Smiley` — red > yellow > green > null (לצ'יפ בכותרת).
- `activeSections(j): SectionId[]` — רשימה ממוינת מודעת-מסלול כולל פוסט-חתימה.
- `journeyProgress(j): {done,total,pct}`.
- `SECTION_FIELDS: Record<SectionId, (keyof JourneyState)[]>` — מזין את תגי ה"חסרים" ומילוי-מראש.
- `deriveStage(j): string` — מראה של המסע ל-`Lead.stage` (paid→PAID, exit→EXIT, signed→BDI...).
- ל-JourneyState: `spouseIncome?`, `loanArrivedAt: string|null`; **מסירים `timeline`** (עובר ל-Activity ב-DB).
- ל-FIRST_CALL_SECTIONS: שדה `hint` (משפט התסריט לשיחה חיה) + מערך `POST_SIGN_SECTIONS` (סקשנים 9–13).

## B. פרסיסטנטיות בשרת (מחליף localStorage)
- Prisma Lead: `journeyJson String?` + `journeyUpdatedAt DateTime?` + `journeyVersion Int @default(0)`.
  מיגרציה: `npx prisma migrate dev -n journey_persistence`.
- **`lib/journey-db.ts` (חדש)** — שכבת מיפוי דו-כיוונית Lead⇄JourneyState:
  - `journeyFromLead(lead)` → אם יש journeyJson מפרסר; אחרת **הידרציה מעמודות ה-Lead** = מילוי-מראש
    ללידים מיובאים (הפתרון לכאב "נציג מקבל ליד קיים וכרטיס ריק/עמוס"). מחזיר גם `prefilled[]` לתגים.
  - `leadPatchFromJourney(j)` → מראה לעמודות הקנוניות (מצב משפחתי עברית↔`married`, מסגרת↔`above-5k`,
    `seniorityYears`↔`seniorityMonths`×12, `chosenLender`→`finalLenderKey`, `deriveStage`→`stage`...).
- **`app/api/leads/[id]/journey/route.ts` (חדש)** — PUT עם `baseVersion`:
  גרסה לא תואמת → 409 + מצב השרת (רב-נציגים); diff של `sectionComplete` ישן/חדש → רישום Activity
  בצד השרת; עדכון אטומי של journeyJson + עמודות מראה + לוג שינוי stage.
- **`app/api/leads/[id]/activities/route.ts` (חדש)** — POST הערה/אירוע.
- Autosave בקליינט: debounce 800ms, save-in-flight יחיד, flush ב-pagehide עם sendBeacon.
  צ'יפ בכותרת: "נשמר ☁️ / שומר… / שגיאה". מוחקים את השימוש ב-localStorage.

## C. ארכיטקטורת קומפוננטות — `components/lead/journey/` (חדש)
המונוליט בן 820 השורות נמחק. מבנה:
`JourneyCard.tsx` (root + context) · `useJourney.ts` (ה-hook: state, patch, autosave, actions) ·
`useJourneyKeys.ts` (מקלדת) · `JourneyHeader` · `JourneyMap` (סטפר אנכי) · `StageView` (הבמה) ·
`SectionRenderer` · `sections/` (13 קומפוננטות: Opening, Credit, Indicator, Personal, Income, Assets,
Bank, Contract, Cooldown, Checks, Docs, Results, Closing) · `VehiclePivot` (החלטת מסך-מלא) ·
`DeadEndPanel` · `RightRail` (הערות+טיימליין+עובדות) · `CallbackModal` · `controls/` (OptionGrid
עם בחירה במקשי 1–9, YesNoSegment, MoneyInput, Field עם תג "✓ ממערכת").

עמוד `leads/[id]/page.tsx` → server component שקורא Prisma ישירות (לא מוק!) ומרנדר JourneyCard;
`leads/[id]/journey` → redirect. **ליד אחד = מסע אחד = URL אחד.**

## D. חוויית ה-command-center (הקפיצה העיצובית)
- **Layout**: header דביק + 3 עמודות `[230px מפה | במה מרכזית | 320px rail]`, RTL.
- **StageView — הבמה**: כרטיס גדול אחד שמציג רק את הסקשן הנוכחי. למעלה משפט התסריט
  ("כמה כסף אתה צריך, ולמה?") — הנציג מקריא ללקוח. שדות ענקיים; שדות ממולאים-מראש עם רקע ירקרק
  ותג "✓ ממערכת" — מאשרים במקום לשאול. מעבר סקשנים ב-framer-motion (slide 220ms, RTL: קדימה=שמאלה).
  שום דבר לא נעול — המפה מנווטת חופשי.
- **מקלדת-first**: Enter = commit+התקדם · מקשים 1–9 בוחרים אופציות (תגי kbd על הצ'יפים) ·
  Esc = אחורה · `?` = חלון קיצורים.
- **רגע הרמזור**: שתי שורות (סמיילי אוטומציה + ידני) של שלושה עיגולים 72px, מקשים 1/2/3,
  אנימציית scale+glow. צהוב/אדום → beat של 300ms → VehiclePivot.
- **VehiclePivot**: overlay מסך-מלא לא-ניתן-לסגירה — צ'יפים של הסיבות, כותרת ענקית
  "האם יש בבעלותך רכב?", שני כפתורים ענקיים (1=כן 🚗 / 2=אין). כן → צ'יפ מסלול כחול קופץ,
  המפה מחליפה ענף ל-docs. לא → DeadEndPanel באותו overlay (בחירת סיבת יציאה → EXIT).
- **דופמין**: כדור-מפה קופץ בהשלמת סקשן · קונפטי קטן בחתימה · גדול באישור סופי ובתשלום ·
  מסך סיום "העסקה הושלמה! 🎉 → ללקוח הבא" (קישור לתותח). טיימר השעה שורד ריענון (persisted).
- **RightRail**: הערה מהירה (Enter שומר ל-Activity), טיימליין צבעוני, משימת החזרה הקרובה, עובדות מבט.

## E. סדר עבודה ואימות
1. **Phase 0**: תיקון dashboard:146 (שער tsc ירוק).
2. **Phase 1 — תשתית**: journey.ts תוספות → journey-db.ts → מיגרציה → שני ה-API routes.
   אימות: tsc נקי מלבד LeadCardV3; PUT דרך curl → sqlite3 מראה journeyJson + Activity.
3. **Phase 2 — שלד עובד**: useJourney + כל הסקשנים (פורט תוכן מהכרטיס הישן על שדות v3) →
   עמוד server component מ-Prisma → **מחיקת LeadCardV3.tsx**.
   אימות: מילוי → ריענון → המצב נשמר; שני טאבים → טוסט 409.
4. **Phase 3 — הקפיצה**: Header/Map/StageView/מקלדת/VehiclePivot/קונפטי.
   אימות מסלול מלא במקלדת בלבד על ליד 1 (מסלול רכב: סמיילי צהוב → פיבוט → מסמכים → אישור →
   תשלום → stage=PAID ב-sqlite3) + ליד 2 (מסלול כללי: 5 בדיקות מלווים → בחירה → PAID).
   אימות מילוי-מראש: UPDATE על ליד 4 → תגי "✓ ממערכת" + currentSection מדלג לחסר הראשון.
5. **מחוץ לתחום** (מפורש): חתימה אמיתית בדף sign, שליחת WATI, מילוי אוטומטי של סמיילי, לוח משימות.

**סיכונים**: מפות עברית↔DB (קובץ אחד, בדיקת round-trip) · המרת ותק שנים↔חודשים ·
כיוון framer-motion ב-RTL · שמות מזהים ניטרליים (screening/indicator).

## אימות סופי
`npx tsc --noEmit` נקי · `npm run dev` פורט 7800 · מסלול מלא בשני המסלולים · בדיקת DB ב-sqlite3 ·
preview ויזואלי לפני push (לפי מוסכמות הפרויקט).
