# תוכנית התקיפה v5 — סופית אחרי שיפוט («הצפת הפסק-דין», מתוקנת)

כל mustFix של שלושת השופטים ממוזג. אומת מול הקוד החי: `globals.css` (832 שורות, `#77777` בשורה 171), `catalog.ts` (תוויות בשורות 163/171, META בשורות 204-209), `CardV4.tsx` (boxShadow אינליין בשורה 298), `Ramzor.tsx` (תומך `lg` = עדשה 72px), `CountUp` ב-`v4/ep.tsx` (כבר מוגן מפני גלגול-בזמן-הקלדה), ומלאי מדויק של 10 `select`/`date` נטיביים.

## טבלת ציות לשופטים (לאן הלך כל mustFix)

| mustFix | פתרון | איפה |
|---|---|---|
| J1: מספר-גיבור 40px+ עם CountUp | `.epv5-hero-amount` clamp(38-46px) בכותרת | CSS §3 + גל 1.6 |
| J1: סצנת פסק-דין בשלב 4 (רמזור 72px, verdict 28-34px) | `Ramzor size="lg"` + `.epv5-scene-verdict` 30px + הצפה | גל 1.7, רגע חתימה 1ב |
| J1: אייקונים בשפת המותג, לא אריח אפור | אריח ממדי (גרדיאנט+inset), webp-3D בשדות דגל, lucide בגוון-חדר לשאר | CSS §5 + גל 2.1 |
| J1: להרוג את **כל** ה-select | מלאי מלא (10 מופעים) + קלט תאריך עברי | גל 2.2 |
| J1: הצפה ברמת עמוד עם META.bg המת | `.epv5-wash` שמקבל `--wash` אינליין מ-`CLIENT_COLOR_META.bg` | גל 1.6 |
| J1: קירות לחדרים | `.epv5-room` על גוף StepCard פתוח | גל 1.8 |
| J1: עמודים 2-4 | צבע-לפי-תוצאה, נגן ממותג, מספר-גיבור בכספים | גל 2.5-2.7 |
| J1: שאלה 7 בשלילי, תוויות קטלוג, פעילויות בעמוד 1 | גל 1.1-1.3 (ראשונים בתור) | |
| J1: התנגשות `#777777` | ערך מובחן `#74746F` (משפחת האפור-החם, בין 300 ל-500 בדארק) | גל 1.4 |
| J1: מובייל | פס התקדמות חלופי + ערימת כותרת | גל 2.10 |
| J2: replay guard חובה + טקסט קריא מפריים 0 | sessionStorage lead:color, `.epv5-still`, הגלולה לעולם לא מונפשת-טקסט | רגע 1 |
| J2: בלי blur על הפופ-אובר | `.epv5-pop` אטום `rgba(255,255,255,.97)` | CSS §7 |
| J2: מלכודת מקלדת ב-reveal | visibility-gate + `inert` + ירידה ל-220ms | CSS §9 |
| J2: שורה פעילה חיוורת | רקע `--cc-soft` מלא + טבעת + פס | CSS §7 |
| J2: קונטרסט 11px | `epv5-pop-label`+`.kbd` → gray-600 | CSS §7 |
| J2: debounce 250→130ms | קבוע אחד | גל 1.4 |
| J2: אריח פוקוס מהבהב | העמקה עדינה במקום היפוך לשחור | CSS §5 |
| J3: התנגשות `--ease-out` עם Tailwind v4 | הכל `--epv5-*` | CSS §1 |
| J3: @layer base גלובלי מוברח | סקופ ל-`[data-client]` (unlayered מנצח utilities); קידום גלובלי = גל 2.11 עם QA | CSS §2 |
| J3: דארק עיוור | overrides לכל משטח חדש צף; זכוכית EP נשארת light-first מוצהר (כמו ep-* הקיים) | CSS פזור |
| J3: קונפליקט MoneyInput | `.fld--money`: אריח בימין הפיזי, ה-₪ עובר לגור בתוך האריח (מבטל את `pe-8`) | CSS §5 |
| J3: כיוון גרדיאנט epv5-ink | 270deg — חזק בימין, דהייה שמאלה | CSS §9 |
| J3: fallback ל---cc-* | `var(--cc-soft, #F1F1EF)` בכל שימוש | בכל ה-CSS |
| J3: `--brand` לא קיים בדאטה | בוטל; מונוגרמה אפורה של LogoBadge הקיים | CSS §6 |
| J3: `!important` על tabpill | בוטל — מוחקים את ה-boxShadow האינליין ב-`CardV4.tsx:298` | גל 1.6 |
| J3: כנות מאמצים | הערכות שעה פר סעיף; גל 1 ≈ 6-7 שעות, גל 2 ≈ 2.5-3.5 ימים | להלן |

---

## 1) ה-CSS הסופי — הדבקה בסוף `/Users/zooler/Desktop/bingo-crm/crm2026/app/globals.css`

(בנוסף: שני תיקונים **בתוך** הקובץ הקיים, לא בדלתא — ראו גל 1.4: שורה 171 `#77777` → `#74746F`, שורה 711 `cover` → `contain`.)

```css
/* ================================================================
   EPv5 — «הצפת הפסק-דין» · דלתא סופית מעל נייר חשמלי (אחרי שיפוט)
   ----------------------------------------------------------------
   · כל הטוקנים --epv5-* — אפס התנגשות עם --ease-out של Tailwind v4.
   · אפס שינוי מחוץ ל-[data-client] — הדלתא חיה רק בכרטיס הליד.
   · כל שימוש ב---cc* עם fallback — הקלאסים בטוחים גם מחוץ לשורש.
   · בלי backdrop-filter על שכבות שמצטיירות תוך הקלדה.
   · משטחי זכוכית EP הם light-first (כמו ep-* הקיים); משטחים צפים
     חדשים (פופ-אובר, kbd, s1) כן מקבלים דארק.
   · דורש Chrome 111+ (color-mix). CRM פנימי.
   ================================================================ */

/* ---------- 1. טוקנים (unlayered, namespaced) ---------- */
:root {
  --epv5-ease: cubic-bezier(.22, 1, .36, 1);
  --epv5-dur-1: 150ms;  /* hover / פוקוס / צבע */
  --epv5-dur-2: 220ms;  /* פתיחה-סגירה / טאב / reveal */
  --epv5-dur-3: 300ms;  /* כניסת עמוד. התקרה. אין רביעי. */
  --epv5-hairline: rgba(41,41,41,.08);
  --epv5-hairline-soft: rgba(41,41,41,.06);
}
html.dark {
  --epv5-hairline: rgba(255,255,255,.10);
  --epv5-hairline-soft: rgba(255,255,255,.07);
}

/* ---------- 2. צנרת צבע-הלקוח ----------
   חיווט: שורש CardV4 ← data-client={catalog.clientColor ?? "none"}.
   --cc-soft = אחד-לאחד הערכים של CLIENT_COLOR_META.bg (lib/catalog.ts:204). */
[data-client] {
  --cc: #9C9C98; --cc-neon: #C9C9C5; --cc-ink: #565654;
  --cc-soft: #F1F1EF; --cc-aura: rgba(156,156,152,.12);
}
[data-client="green"]  { --cc:#2B9410; --cc-neon:#50FF0A; --cc-ink:#1E6F08; --cc-soft:#DAFFCB; --cc-aura:rgba(80,255,10,.17); }
[data-client="blue"]   { --cc:#1F81D6; --cc-neon:#58B0FF; --cc-ink:#16588F; --cc-soft:#DCEBF7; --cc-aura:rgba(88,176,255,.18); }
[data-client="orange"] { --cc:#E28413; --cc-neon:#FFA82E; --cc-ink:#9A5A0B; --cc-soft:#FDEBD4; --cc-aura:rgba(255,168,46,.18); }
[data-client="red"]    { --cc:#E5484D; --cc-neon:#FF6B5E; --cc-ink:#B3261E; --cc-soft:#FFE1DC; --cc-aura:rgba(255,74,46,.20); }
/* דארק: פסטל בהיר מסנוור — ממזגים אל הבמה */
html.dark [data-client] {
  --cc-soft: color-mix(in srgb, var(--cc) 22%, #161613);
  --cc-aura: color-mix(in srgb, var(--cc-neon) 14%, transparent);
}

/* ---------- 3. טיפוגרפיה עברית — בתוך הכרטיס בלבד ----------
   unlayered מנצח כל שכבה: מנטרל גם letter-spacing של @layer base
   וגם של .text-title-* בתוך תת-העץ. קידום גלובלי = גל 2 + QA. */
[data-client] :is(h1,h2,h3,h4,h5,h6) { letter-spacing: 0; }
[data-client] :is(.tabular-nums, .num-display) { letter-spacing: -0.01em; }

@layer utilities {

  /* ==============================================================
     4. הכותרת: הצפת פסק-הדין
     חיווט CardV4: header מקבל ep-island--verdict + data-client על
     השורש; בתוך ה-header, ראשון:
       <span className={cn("epv5-aura", still && "hidden-anim")}
             key={clientColor} aria-hidden />
     שומר-ריפליי (חובה): אם sessionStorage כבר ראה lead:color —
     מוסיפים epv5-still ל-header: התוצאה מוצגת, שום דבר לא זז.
     המידע (הגלולה) לעולם אינו מונפש — קריא מפריים 0.
     ============================================================== */
  .epv5-aura {
    position: absolute; inset: 0; border-radius: inherit;
    pointer-events: none; overflow: hidden;
    background:
      radial-gradient(720px 260px at 88% -30%, var(--cc-aura, transparent), transparent 62%),
      radial-gradient(460px 200px at 4% 118%,
        color-mix(in srgb, var(--cc-aura, transparent) 55%, transparent), transparent 62%);
    animation: epv5-flood 600ms var(--epv5-ease) both;
  }
  [data-client="none"] .epv5-aura { display: none; }
  [data-client="red"] .epv5-aura { animation-duration: 400ms; } /* אדום לא חוגג */
  @keyframes epv5-flood { from { opacity: 0; transform: scale(1.04); } to { opacity: 1; transform: none; } }

  /* הקרן העליונה — "פס הצבע" של חן, נמתחת מימין (RTL) */
  .epv5-aura::after {
    content: ""; position: absolute; inset-inline: 18px; top: 0; height: 3px;
    border-radius: 3px;
    background: linear-gradient(90deg, transparent,
      var(--cc-neon, #C9C9C5) 30%, var(--cc-neon, #C9C9C5) 70%, transparent);
    filter: drop-shadow(0 1px 6px var(--cc-aura, transparent));
    transform-origin: 100% 50%;
    animation: epv5-draw-x 450ms var(--epv5-ease) 120ms both;
  }
  @keyframes epv5-draw-x { from { transform: scaleX(0); } }
  /* שומר-הריפליי: אפס אנימציה בפתיחה חוזרת של אותו ליד+צבע */
  .epv5-still .epv5-aura, .epv5-still .epv5-aura::after,
  .epv5-still .epv5-verdict-dot::before { animation: none; }
  /* ההיירליין הליים של האי מפנה את הבמה לצבע הלקוח */
  .ep-island--verdict::before {
    background: linear-gradient(90deg, transparent,
      color-mix(in srgb, var(--cc-neon, #C9C9C5) 40%, transparent), transparent);
  }

  /* גלולת הפסק-דין — הקטלוג + שם הצבע, סטטית, קריאה מיידית */
  .epv5-verdict {
    position: relative; z-index: 1;
    display: inline-flex; align-items: center; gap: 10px;
    min-height: 40px; padding-inline: 16px 18px; border-radius: 50px;
    font-size: 15px; font-weight: 700; color: #FAFAF9;
    background: color-mix(in srgb, var(--cc-neon, #C9C9C5) 15%, transparent);
    border: 1px solid color-mix(in srgb, var(--cc-neon, #C9C9C5) 45%, transparent);
    box-shadow: 0 0 26px -6px var(--cc-aura, transparent), inset 0 1px 0 rgba(255,255,255,.08);
  }
  .epv5-verdict small {
    font-size: 12px; font-weight: 600;
    color: color-mix(in srgb, var(--cc-neon, #C9C9C5) 75%, #FAFAF9);
  }
  .epv5-verdict-dot {
    position: relative; width: 12px; height: 12px; border-radius: 50%; flex: none;
    background: var(--cc-neon, #C9C9C5);
    box-shadow: 0 0 12px var(--cc-neon, #C9C9C5), 0 0 3px var(--cc-neon, #C9C9C5);
  }
  /* שתי פעימות בהיוולדות קטלוג — ואז שקט (ping-dot קיים ב-globals:516) */
  .epv5-verdict-dot::before {
    content: ""; position: absolute; inset: 0; border-radius: 50%;
    background: inherit; animation: ping-dot 1.6s cubic-bezier(0,0,.2,1) 2;
  }
  [data-client="red"] .epv5-verdict-dot::before { animation: none; }

  /* מספר-גיבור: הסכום שכל השיחה סובבת סביבו. לבן — הליים חזר להיות CTA בלבד */
  .epv5-hero { display: flex; align-items: baseline; gap: 10px; flex-wrap: wrap; }
  .epv5-hero-amount {
    direction: ltr; unicode-bidi: isolate;
    font-size: clamp(38px, 4.5vw, 46px); line-height: 1.05; font-weight: 700;
    color: #FAFAF9; font-feature-settings: "tnum" on, "lnum" on;
    letter-spacing: -0.01em;
  }
  .epv5-hero-amount .curr { font-size: .5em; font-weight: 600; color: rgba(250,250,249,.65); margin-inline-start: 6px; }
  .epv5-hero-label { font-size: 13px; font-weight: 600; color: #9C9C98; }
  .epv5-hero-chip {
    display: inline-flex; align-items: center; gap: 6px; height: 30px;
    padding-inline: 12px; border-radius: 50px; font-size: 13px; font-weight: 700;
    color: #FAFAF9; background: rgba(255,255,255,.08); border: 1px solid rgba(255,255,255,.14);
  }

  /* רחיצת-עמוד — הצבע מגיע אינליין מ-CLIENT_COLOR_META.bg (הקוד המת קם לתחייה) */
  .epv5-wash {
    position: fixed; inset: 0; z-index: -1; pointer-events: none;
    background: linear-gradient(180deg, var(--wash, transparent), transparent 44%);
    opacity: .5; transition: opacity 400ms var(--epv5-ease);
  }
  html.dark .epv5-wash { opacity: .14; }

  /* ==============================================================
     5. אייקון-לכל-שדה — אריח ממדי בשפת המותג (לא קו-על-אפור)
     רקע גרדיאנט-חדר + inset highlight; שדות דגל מקבלים webp מ-3D.
     <div className="fld">
       <span className="fld-ico"><img src="/icons3d/coins.webp" alt=""/></span>
       <input className="b-input ep-input" … />
     </div>
     ============================================================== */
  .fld { position: relative; }
  .fld-ico {
    position: absolute; inset-inline-start: 10px; top: 50%; translate: 0 -50%;
    width: 26px; height: 26px; border-radius: 8px;
    display: inline-flex; align-items: center; justify-content: center;
    background: linear-gradient(145deg, #fff 0%, var(--step-tint, var(--cc-soft, #F1F1EF)) 90%);
    color: var(--step-deep, var(--color-bingo-gray-600));
    box-shadow: inset 0 1px 0 rgba(255,255,255,.85), 0 1px 2px rgba(41,41,41,.07),
                0 0 0 1px var(--epv5-hairline-soft);
    pointer-events: none; z-index: 1;
    transition: background-color var(--epv5-dur-1) var(--epv5-ease),
                box-shadow var(--epv5-dur-1) var(--epv5-ease);
  }
  .fld-ico > img { width: 18px; height: 18px; object-fit: contain; }
  .fld > .b-input, .fld > .ep-input, .fld input.b-input {
    padding-inline-start: 46px; text-overflow: ellipsis; /* רחובות עבריים ארוכים */
  }
  /* פוקוס: העמקה עדינה — בלי היפוך לשחור (אריח מהבהב בזווית העין בין 30 שדות) */
  .fld:focus-within .fld-ico {
    background: color-mix(in srgb, var(--step-deep, #565654) 14%, var(--step-tint, #F1F1EF));
    box-shadow: inset 0 1px 0 rgba(255,255,255,.5),
                0 0 0 1px color-mix(in srgb, var(--step-deep, #565654) 35%, transparent);
  }
  /* שדה כסף: העטיפה dir="ltr" — האריח מעוגן לימין הפיזי (כמו כל שדה עברי)
     וה-₪ גר בתוך האריח. מבטל את סיומת ה-pe-8 — נגמר הסטאק. */
  .fld--money .fld-ico {
    inset-inline-start: auto; inset-inline-end: 10px;
    font-size: 13px; font-weight: 700;
  }
  .fld--money > .b-input { padding-inline-start: 14px; padding-inline-end: 46px; }
  /* שדה עם לוגו נבחר (בנק/ביטוח) — צ'יפ לבן מנרמל מחליף את האריח */
  .fld--logo .fld-ico { background: #fff; padding: 3px; }
  .fld--logo .fld-ico img { width: 100%; height: 100%; object-fit: contain; }
  /* אייקון לקבוצת גלולות (אין אינפוט לעגון בו) */
  .lbl-ico {
    display: inline-flex; align-items: center; justify-content: center;
    width: 22px; height: 22px; border-radius: 7px; flex: none;
    margin-inline-end: 6px; vertical-align: -5px;
    background: linear-gradient(145deg, #fff 0%, var(--step-tint, #F1F1EF) 90%);
    color: var(--step-deep, var(--color-bingo-gray-600));
    box-shadow: inset 0 1px 0 rgba(255,255,255,.85), 0 0 0 1px var(--epv5-hairline-soft);
  }

  /* ==============================================================
     6. צ'יפ-לוגו, שורות ואריחי בנק/ביטוח
     נפילה: מונוגרמת LogoBadge הקיימת (אפור) — אין שדה brandColor בדאטה.
     ============================================================== */
  .logo-chip {
    display: inline-flex; align-items: center; justify-content: center;
    width: 30px; height: 30px; padding: 4px; border-radius: 9px;
    background: #fff; flex: none; box-shadow: 0 0 0 1px var(--epv5-hairline);
  }
  .logo-chip > img { width: 100%; height: 100%; object-fit: contain; }
  html.dark .logo-chip { background: #fff; } /* במכוון: לוגו דורש לבן מנרמל גם בדארק */
  .logo-opt {
    display: flex; align-items: center; gap: 10px; width: 100%;
    min-height: 44px; padding-inline: 10px; border-radius: 12px;
    font-size: 14px; font-weight: 600; color: var(--color-bingo-gray-800);
    transition: background-color var(--epv5-dur-1) var(--epv5-ease);
  }
  .logo-opt:hover { background: var(--color-bingo-gray-100); }
  .logo-opt[aria-selected="true"], .logo-opt--on {
    background: var(--cc-soft, #F1F1EF);
    box-shadow: inset 0 0 0 1.5px color-mix(in srgb, var(--cc, #9C9C98) 40%, transparent);
  }
  /* גריד 13 אריחי הבנקים — שכבת הדאטה הישראלית סוף-סוף על השולחן */
  .logo-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 8px; }
  .logo-tile {
    display: flex; align-items: center; gap: 8px; min-height: 48px; padding-inline: 10px;
    border-radius: 14px; border: 1.5px solid var(--color-bingo-gray-200); background: #fff;
    font-size: 13.5px; font-weight: 600; color: var(--color-bingo-gray-800);
    transition: border-color var(--epv5-dur-1) var(--epv5-ease),
                background-color var(--epv5-dur-1) var(--epv5-ease);
  }
  .logo-tile:hover { border-color: var(--color-bingo-gray-400); }
  .logo-tile[aria-pressed="true"] {
    border-color: color-mix(in srgb, var(--cc, #9C9C98) 55%, transparent);
    background: var(--cc-soft, #F1F1EF);
  }

  /* ==============================================================
     7. פופ-אובר אוטוקומפליט — אטום. בלי blur: הרשימה מצטיירת מחדש
     בכל הקשה, ו-backdrop-filter מעליה = ג'אנק במחשבי המוקד.
     ============================================================== */
  .epv5-pop {
    background: rgba(255,255,255,.97);
    border: 1px solid var(--epv5-hairline);
    border-radius: 16px; padding: 6px;
    box-shadow: 0 0 0 1px rgba(41,41,41,.03), 0 12px 32px -8px rgba(41,41,41,.18),
                inset 0 1px 0 rgba(255,255,255,.9);
  }
  html.dark .epv5-pop { background: rgba(33,31,27,.98); box-shadow: 0 12px 32px -8px rgba(0,0,0,.6); }
  .epv5-opt {
    position: relative; display: flex; align-items: center; gap: 8px;
    width: 100%; min-height: 40px; padding-inline: 12px; border-radius: 10px;
    font-size: 14px; text-align: start; color: var(--color-bingo-gray-800);
  }
  .epv5-opt .sub { font-size: 12px; color: var(--color-bingo-gray-500); }
  /* שורה פעילה: חייבת להיקרא בתאורת ניאון משרדית — רקע מלא, לא רמז */
  .epv5-opt.is-active {
    background: var(--cc-soft, #F1F1EF);
    box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--cc, #9C9C98) 30%, transparent);
  }
  .epv5-opt.is-active::before {
    content: ""; position: absolute; inset-inline-start: 0; top: 9px; bottom: 9px;
    width: 2.5px; border-radius: 2px;
    background: var(--step-dot, var(--cc, var(--color-bingo-blue)));
  }
  .epv5-match { color: var(--color-bingo-blue); font-weight: 700; }
  .epv5-pop-label { padding: 6px 12px 2px; font-size: 11px; font-weight: 700; color: var(--color-bingo-gray-600); }
  .epv5-pop-empty { padding: 14px 12px; font-size: 13px; color: var(--color-bingo-gray-500); }

  /* תג מקלדת — gray-600: ‏11px משלם על כל קונטרסט */
  .kbd {
    display: inline-flex; align-items: center; justify-content: center;
    min-width: 18px; height: 18px; padding-inline: 5px;
    border: 1px solid rgba(41,41,41,.16); border-bottom-width: 2px; border-radius: 4px;
    background: #fff; font-family: var(--font-mono); font-size: 11px; font-weight: 600;
    color: var(--color-bingo-gray-600);
  }
  html.dark .kbd { background: rgba(255,255,255,.06); border-color: rgba(255,255,255,.18); }
  .ep-island .kbd { background: rgba(255,255,255,.08); border-color: rgba(255,255,255,.2); color: rgba(250,250,249,.8); }

  /* ==============================================================
     8. טאבים, חדרים, סצנת שלב 4, משטח S1
     ============================================================== */
  /* בלי !important: מוחקים את ה-boxShadow האינליין ב-CardV4.tsx:298 */
  .epv5-tabpill { box-shadow: 0 8px 22px -8px var(--cc-aura, rgba(0,0,0,.3)), 0 2px 8px rgba(0,0,0,.35); }
  .epv5-tab-badge {
    min-width: 18px; height: 18px; padding-inline: 5px; border-radius: 9px;
    display: inline-grid; place-items: center;
    background: var(--color-bingo-green); color: #292929; font-size: 11px; font-weight: 700;
  }

  /* קירות לחדרים: גוף שלב פתוח בגוון החדר + רצועת זהות עליונה.
     תנאי: הסרת ep-spotlight מ-StepCard (הזרקור כבוי בתוך הכרטיס — החלטה) */
  .epv5-room {
    background: linear-gradient(180deg,
      color-mix(in srgb, var(--step-tint, #F1F1EF) 40%, rgba(255,255,255,.62)) 0,
      rgba(255,255,255,.62) 150px);
  }
  .epv5-room::after {
    content: ""; position: absolute; inset-inline: 18px; top: 0; height: 3px;
    border-radius: 3px; pointer-events: none;
    background: linear-gradient(90deg, transparent,
      color-mix(in srgb, var(--step-dot, #C9C9C5) 65%, transparent), transparent);
  }

  /* סצנת פסק-הדין בשלב 4 — הרגע שבו הלקוח נצבע (על האי הכהה) */
  .epv5-scene-verdict { font-size: 30px; line-height: 1.2; font-weight: 800; color: var(--cc-neon, #FAFAF9); }
  [data-client="green"] .epv5-scene-verdict { text-shadow: 0 0 22px var(--cc-aura, transparent); }
  [data-client="red"] .epv5-scene-verdict { text-shadow: none; font-weight: 700; } /* בשורה קשה — בכבוד */
  .epv5-scene-hint { font-size: 14px; color: rgba(250,250,249,.62); }

  /* S1 — נייר שקט לשורות סיכום/חשבוניות */
  .epv5-s1 { background: #fff; border: 1px solid var(--epv5-hairline); border-radius: 20px;
    box-shadow: inset 0 1px 0 rgba(255,255,255,.9); }
  html.dark .epv5-s1 { background: #1b1b1a; box-shadow: none; }
  .epv5-hairline-b { border-block-end: 1px solid var(--epv5-hairline-soft); }

  /* ==============================================================
     9. רגעי מיקרו + חוזה תנועה
     ============================================================== */
  /* הבזק "מולא לבד" — מיקוד, תווית סניף */
  @keyframes epv5-fill-flash {
    from { background-color: color-mix(in srgb, var(--cc-neon, #50FF0A) 28%, transparent); }
  }
  .epv5-flash { animation: epv5-fill-flash 600ms var(--epv5-ease) 1; }
  .epv5-autofill-note {
    display: inline-flex; align-items: center; gap: 4px; margin-top: 6px;
    font-size: 12px; font-weight: 600; color: var(--color-bingo-green-deep);
  }

  /* reveal מותנה בלי מלכודת מקלדת: מכווץ = מחוץ לטאב ולקורא מסך.
     חובה בנוסף inert={!open} על העטיפה ב-JSX. פוקוס תכנותי — רק
     אחרי שהמעבר הסתיים (onTransitionEnd), בלי scrollIntoView. */
  .epv5-reveal { display: grid; grid-template-rows: 0fr;
    transition: grid-template-rows var(--epv5-dur-2) var(--epv5-ease); }
  .epv5-reveal > * { overflow: hidden; min-height: 0; }
  .epv5-reveal:not([data-open="true"]) > * { visibility: hidden; transition: visibility 0s var(--epv5-dur-2); }
  .epv5-reveal[data-open="true"] { grid-template-rows: 1fr; }
  .epv5-reveal[data-open="true"] > * { visibility: visible; transition: none; }

  /* פעולות בחשיפת-ריחוף (timeline, משימות) */
  .epv5-row-actions { opacity: 0; transition: opacity var(--epv5-dur-1) var(--epv5-ease); }
  .epv5-row:hover .epv5-row-actions, .epv5-row:focus-within .epv5-row-actions { opacity: 1; }

  /* קו הדיו — צומח מימין; 270deg: הצבע החזק בקצה הימני, הדהייה שמאלה */
  .epv5-ink {
    display: block; height: 2px; border-radius: 2px; margin-top: 3px;
    background: linear-gradient(270deg, var(--cc-neon, #C9C9C5),
      color-mix(in srgb, var(--cc-neon, #C9C9C5) 25%, transparent));
    transform-origin: 100% 50%;
    animation: epv5-draw-x 300ms var(--epv5-ease) both;
  }

  /* שלד — שימר בכיוון RTL */
  @keyframes epv5-shimmer-rtl { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
  .epv5-skeleton {
    background: linear-gradient(90deg, var(--color-bingo-gray-100) 0%,
      var(--color-bingo-gray-150) 50%, var(--color-bingo-gray-100) 100%);
    background-size: 200% 100%;
    animation: epv5-shimmer-rtl 1.4s ease-in-out infinite; border-radius: 10px;
  }

  /* חוזה התנועה — 8 שעות ביום:
     1) שום תנועה בשדה בזמן הקלדה (CountUp כבר מגן — 600ms חלון);
     2) width/height של אינפוטים והכותרת הדביקה — לעולם לא מונפשים;
     3) כניסה מדורגת רק לשלב שנפתח עכשיו, לא בטעינת עמוד;
     4) אנימציה אינסופית אסורה חוץ מ-dot-pulse על מידע חי ו-b-scan בזמן בדיקה;
     5) ep-spotlight ו-cockpit-scanline — לא בתוך כרטיס ליד. לעולם;
     6) חלקיקים/קונפטי — רק בחתימת הסכם. */
  @media (prefers-reduced-motion: reduce) {
    .epv5-aura, .epv5-aura::after, .epv5-verdict-dot::before,
    .epv5-flash, .epv5-ink, .epv5-skeleton { animation: none; }
    .epv5-reveal, .epv5-reveal > *, .epv5-wash { transition: none; }
  }
}
```

---

## 2) גל 1 — הערב (≈6-7 שעות). חוקה קודם, ואו אחר כך

| # | שינוי | קובץ ומיקום | לפני ← אחרי | זמן |
|---|---|---|---|---|
| 1.1 | **שאלה 7 גם במסלול השלילי + "בבנק שלי"** | `components/lead/v4/page1/Step2Screening.tsx:338` | גייט `{allCoreAnswered && (` ← `{(allCoreAnswered \|\| screening.negative) && (`; בלולאת הגלולות (שורה 353) התווית: `label={o === "בבנק הפרטי" ? "בבנק שלי" : o}` — **ה-store נשאר** "בבנק הפרטי" (אפס מיגרציית דאטה) | 30ד' |
| 1.2 | **תוויות קטלוג מילה-במילה** (display-only — אומת שאף לוגיקה לא משווה מחרוזת label) | `lib/catalog.ts:163` | `label: "רכב בלבד"` ← `label: ramzor === "yellow" ? "לקוח צהוב רכב" : "לקוח שלילי עם רכב"` | 15ד' |
| | | `lib/catalog.ts:171` | `vehicle === false ? "מתאים לרכב - אין רכב" : "מתאים לרכב בלבד"` ← `vehicle === false ? "לקוח כתום" : "מתאים לרכב בלבד"` (ה-hint הקיים נשאר ומסביר) | |
| 1.3 | **פעילויות בעמוד 1** — סוגר סעיף חוקה "מוסיפים פעילויות" | `components/lead/v4/page1/index.tsx:311` (אחרי `<TasksWidget/>`) | רכיב `QuickNote` חדש וקטן: textarea מתקפל + כפתור "הוסף הערה" ← `state.addNote("note", text)` (הפונקציה קיימת ב-`useClassicCard.ts:95`); עטוף `epv5-s1` | 45ד' |
| 1.4 | **חבילת באגים** | `app/globals.css:171` | `#77777` ← `#74746F` (מובחן: בין gray-300 ‏`#4c4c4a` ל-gray-500 ‏`#9c9c98` בדארק, במשפחת האפור-החם — לא `#777777` שמתנגש עם gray-500 של אור) | 30ד' |
| | | `app/globals.css:711` | `.ep-icon3d > img { object-fit: cover }` ← `contain` | |
| | | `components/lead/v4/page1/Step7Details.tsx:196` | `=== "צעיר" ? "צעיר"` ← `=== "צעיר" ? "לקוח צעיר"` (ערך ישן סוף-סוף מדליק גלולה) | |
| | | `components/lead/v4/page1/Step2Screening.tsx:218-243` | useEffect בלי מערך תלויות ← דפוס latest-ref: `handlerRef.current = onKey` בכל רינדור, `addEventListener` פעם אחת עם `[]` | |
| | | `components/lead/v4/page1/AutocompleteInput.tsx:57` | debounce `250` ← `130` (התוצאות ממילא חתוכות ל-8) | |
| | | `page1/insurers.ts` | **אין פעולה** — נבדק: זה wrapper מעל `lib/israel-data/insurers`, לא כפילות. סעיף הביקורת סגור | |
| 1.5 | **הדבקת ה-CSS** מסעיף 1 | סוף `app/globals.css` (אחרי שורה 832) | | 20ד' |
| 1.6 | **הכותרת: data-client + הצפה + פסק-דין + מספר-גיבור + רחיצה** | `components/lead/v4/CardV4.tsx` | (א) שורש (שורה 179): `<div dir="rtl" data-client={catalog.clientColor ?? "none"} …>`; (ב) header (שורה 185): להוסיף `ep-island--verdict` + קלאס `epv5-still` כששומר-הריפליי אומר "כבר הוצג" + `<span className="epv5-aura" key={catalog.clientColor ?? "none"} aria-hidden />` ראשון בתוכו; (ג) גלולת הצבע (שורות 200-216) ← `.epv5-verdict`: נקודה `epv5-verdict-dot`, `{catalog.label}`, ‏`<small>· {colorMeta.name}</small>`; (ד) רצועת הסיכום (שורות 244-256): הסכום 13.5px ליים-ניאון ← `epv5-hero`: `ביקש` קטן, `<CountUp>` (מ-`./ep`, מוגן-הקלדות) בתוך `epv5-hero-amount` + `<span className="curr">₪</span>`, המטרה כ-`epv5-hero-chip`; שאר הרצועה נשארת שורת מטא; (ה) `{colorMeta && <div aria-hidden className="epv5-wash" style={{ "--wash": colorMeta.bg } as React.CSSProperties} />}` — שימוש ליטרלי ב-META.bg המת; (ו) שורה 298: **למחוק** את `style={{ boxShadow: … }}` ולהוסיף `epv5-tabpill` ל-motion.span | 2ש' |
| 1.7 | **סצנת פסק-הדין בשלב 4** | `components/lead/v4/page1/Step4Ramzor.tsx` | (א) שורה 139: `size="md"` ← `size={shown !== null ? "lg" : "md"}` (עדשה 72px — הרכיב תומך); (ב) שורות 154-161: פסק-הדין 17px ← `<span className="epv5-scene-verdict">{catalog.label}</span>` (30px) + hint ב-`epv5-scene-hint`; (ג) ההבזק הקיים (שורות 99-109) מוחלף מגרדיאנט-ליים-קבוע ל-`var(--cc-aura)` דרך `epv5-aura` בתוך האי, `key={catalog.clientColor}`; (ד) אדום: בלי הבזק ובלי ספרינג — `[data-client="red"]` כבר מטפל ב-CSS | 1-1.5ש' |
| 1.8 | **קירות לחדרים + כיבוי הזרקור** | `components/lead/v4/page1/shared.tsx:144-146` | `"ep-glass ep-spotlight relative p-6"` ← `"ep-glass epv5-room relative p-6"` ולמחוק `onMouseMove={spotlight}` + את ה-import; שבעה שלבים = שבעה חדרים, סוף-סוף על המסך | 30ד' |
| 1.9 | **פופ-אובר האוטוקומפליט ברמת cmdk** | `components/lead/v4/page1/AutocompleteInput.tsx:111-131` | `ul` ← `epv5-pop`; כפתור שורה ← `epv5-opt` + `is-active`; הדגשת התאמה client-side: פיצול `s.name` על `q` (indexOf פשוט) ועטיפת ההתאמה ב-`<b className="epv5-match">`; `extra` ← `<span className="sub">` | 1ש' |

**סיכום גל 1:** ארבעת סעיפי האמון של החוקה סגורים, חמשת הבאגים סגורים, והשלושה שמשנים את הרושם — הצפת פסק-דין + מספר-גיבור + סצנת שלב 4 — חיים. בלי טקס-חוזר (שומר-ריפליי), בלי blur, בלי `!important`.

---

## 3) גל 2 — הסבב הבא (≈2.5-3.5 ימי עבודה, כנות מלאה)

| # | שינוי | קבצים | הערות | זמן |
|---|---|---|---|---|
| 2.1 | **אייקון-לכל-שדה** (סעיף חוקה 3) | `page1/shared.tsx` (‏`Field` מקבל `icon?: React.ReactNode`, ‏`MoneyInput` נעטף `fld fld--money` עם ₪ באריח ומחיקת `pe-8`/ה-span) + ~40 אתרי קריאה בכל שלבי page1 | היברידי בשפת המותג: שדות דגל עם webp קיים — `coins` (סכומים), `car`, `bank`, `house`, `heart-ring` (סטטוס), `briefcase`, `calendar`, `scroll`, `pen-sign`, `shield-check` (BDI), `search-doc` (בדיקות קודמות), `hourglass` (ותק), `key` (מגורים), `receipt` (החזר); השאר lucide 15px/1.75 על האריח הממדי (המיפוי המלא מטבלת v5 בתוקף). קבוצות גלולות ← `lbl-ico` ליד התווית | 6-10ש' (40 אתרים, ילדים מעורבים — לא "נקודת עריכה אחת") |
| 2.2 | **להרוג את כל 10 הנטיביים** (מלאי מאומת) | `page1/Step1Opening.tsx:33` מטרת הלוואה ← listbox עם אייקונים (13 מטרות, הרגע השני בשיחה); `page1/Step7Details.tsx:145` סטטוס ← ChoicePills (5 ערכים); `Page2Checks.tsx:87,94` תוצאה+שלב ← גלולות/listbox; `Page3Timeline.tsx:171,173` ← listbox; `page1/BankFields.tsx:97` נפילה ← listbox סטטי מ-`lib/israel-data/banks` **עם לוגואים** (סוגר גם את פער הנפילה מהביקורת); תאריכים `Step4Ramzor.tsx:88`, `Step7Details.tsx:138`, `TasksWidget.tsx:158` ← קלט תאריך עברי מפולח DD/MM/YYYY | 1-1.5 יום |
| 2.3 | **בוחר בנק כגריד לוגואים** | `page1/BankFields.tsx:106-149` | דרופדאון ← `logo-grid` של 13 `logo-tile`; אחרי בחירה שדה `fld--logo` עם הצ'יפ; חיפוש סניף נשאר "675 ⇒ 675 כפר יונה" | 3-4ש' |
| 2.4 | **ביטוח כשורת צ'יפים-עם-לוגו** | `page1/Step7Details.tsx` ‏`PensionCompanySelect` | 11 לוגואים כ-`logo-tile` קומפקטיים + "אחר" חופשי | 2ש' |
| 2.5 | **עמוד 2 — צבע לפי תוצאה** | `Page2Checks.tsx:57-141` | קצה+רקע רך: "יש אישור"=מנטה, "סורב"=ורד, אחר=חול; סכום מאושר 13.5px ← 24px `CountUp`; קובץ לוגו חדש `public/logos/lenders/pension.svg` (היחיד החסר — נופל היום לאות) | 3ש' |
| 2.6 | **עמוד 3 — נגן ממותג + hover** | `Page3Timeline.tsx:254` | `<audio controls>` ← נגן מותאם (play/pause ליים, פס התקדמות, משך) על הגלולה הכהה הקיימת; שורות ← `epv5-row` + `epv5-row-actions` | 4-5ש' |
| 2.7 | **עמוד 4 — מספר-גיבור פיננסי** | `Page4Finance.tsx:130-132` | "שכר טרחה שסוכם" 17px ← 34px display; שורות חשבונית על `epv5-s1`; קונטרפונקט layout (סכום גדול מול טור פרטים) | 2-3ש' |
| 2.8 | **רגע דואר ישראל** | `page1/Step5Address.tsx:141-144` | "אומת אוטומטית" 12px ← `epv5-flash` על השדה + `epv5-autofill-note`: "מולא אוטומטית · אומת מול דואר ישראל" עם `DrawnCheck`; אותו דפוס לתווית סניף ב-BankFields | 1.5ש' |
| 2.9 | **תמצית כ-4 קפסולות + באדג' טאבים + kbd** | `CardV4.tsx:257-275`, `PAGES` | שורת המטא המנוקדת ← 4 קפסולות (שיחה/משימה/צפייה/חיווי) עם אייקוני 3D; `epv5-tab-badge` משימות פתוחות על "תיעוד" (ספירה מ-page.tsx); תגי `kbd` ‏1/2/Enter לגלולות שאלון (הקיצורים כבר ממומשים ב-Step2Screening:223-242) | 3ש' |
| 2.10 | **מובייל** | `page1/index.tsx:78` | הקונסטלציה (`hidden lg:block`) מקבלת תחליף מתחת ל-lg: פס נקודות אופקי דביק מתחת לכותרת; כותרת: hero כבר clamp, גלולות פעולה נערמות לשתיים | 3-4ש' |
| 2.11 | **קידום טיפוגרפיה + QA דארק** | `app/globals.css` | letter-spacing:0 עברי אפליקציה-רחבה + גוף 15px בכרטיס — עם מעבר ויזואלי על דשבורד/desk/journey/cockpit; פס דארק מלא לשכבת ep-glass (חוב קיים, מוצהר) | 2-3ש' QA |

---

## 4) שלושת רגעי החתימה — סופי

**רגע 1 — «הצפת הפסק-דין»** (שני שלבים, שני מקומות):
א. *בכותרת*: כש-`catalog.clientColor` נולד/משתנה — אורורה 600ms + קרן 3px נמתחת מימין 450ms + הגלולה עם שם הצבע ("לקוח תקין · ירוק") + שתי פעימות נקודה. **שומר-ריפליי חובה** ב-`CardV4.tsx`:
```tsx
const floodSeen = React.useMemo(() => {
  try { return sessionStorage.getItem(`epv5-flood:${props.lead.id}`); } catch { return null; }
}, [props.lead.id]);
const color = catalog.clientColor ?? "none";
const still = floodSeen === color; // כבר הוצג לליד הזה — אפס טקס
React.useEffect(() => {
  try { sessionStorage.setItem(`epv5-flood:${props.lead.id}`, color); } catch {}
}, [color, props.lead.id]);
// header: className={cn("ep-island ep-island--verdict …", still && "epv5-still")}
```
הטקסט בגלולה סטטי תמיד — קריא בפריים 0; מונפשות רק שכבות רקע. ב-reduced-motion הכל כבוי.
ב. *בשלב 4 (הסצנה)*: רמזור `lg` (עדשה 72px), verdict ‏30px בצבע הלקוח, הבזק `--cc-aura` חד-פעמי על האי. **אדום לא חוגג**: 400ms שקט, בלי פעימות, בלי ספרינג, משקל 700 במקום 800 — כבוד לבשורה קשה.

**רגע 2 — «מולא לבד»**: מיקוד שמתמלא מדואר ישראל ותווית סניף מ-"675" מקבלים `epv5-flash` ‏600ms + `epv5-autofill-note` קבוע. שום גליטר מתמשך — המערכת מראה שהיא עבדה בשבילך ונרגעת. (חיווט: `Step5Address` כבר מחזיק `zipAuto` — להוסיף `key={zip}` על האינפוט עם הקלאס; `BankFields.onPick` — סטייט `flashBranch` חד-פעמי.)

**רגע 3 — «קו הדיו»**: עם `agreement.signed === true` — `useAgreement.ts` יורה `window.dispatchEvent(new CustomEvent("cardv4:agreement-signed"))` במעבר false→true; `CardV4` מאזין ומרנדר `<span className="epv5-ink" />` מתחת לשם באי (מצב פתיחה: דגל `agreementSigned` שמגיע מהשרת ב-`app/(app)/leads/[id]/page.tsx` — אז הקו מרונדר בלי אנימציה). הקו נשאר לתמיד — הכרטיס נחתם פיזית. **הקונפטי עובר לכאן בלבד**: ה-`ParticleBurst` בחתימה (`Step6Agreement.tsx:174`) נשאר, פרצי החלקיקים על כל השלמת שלב בקונסטלציה (`index.tsx:272-283`) — נמחקים.

---

## 5) משמר רגרסיה — מה מאמתים לפני ואחרי כל גל

**דליפת טוקנים (אחרי הדבקת ה-CSS):** `grep -rn "ease-out\|duration-" components/ui/LeadTemperatureGauge.tsx` — האנימציה ב-1000ms נשארת זהה (הטוקן של Tailwind לא נגענו); `grep -rn "\-\-ease-out\|--dur-" app/ components/` מחזיר רק epv5. דשבורד, ‏`/desk`, ‏journey, ‏cockpit, רשימת לידים — ללא שינוי פיקסל (הדלתא כולה תחת `[data-client]`).

**קטלוג ודאטה:** `grep -rn "רכב בלבד\|מתאים לרכב"` — אומת היום: אף השוואת מחרוזת על label (הלוגיקה על `clientColor`); אחרי 1.2 להריץ שוב. ערכי store לא השתנו בשום מקום ("בבנק הפרטי", "צעיר" — display-map בלבד). ארבעת מסלולי הקטלוג: ירוק, צהוב+רכב ("לקוח צהוב רכב"), שלילי+רכב ("לקוח שלילי עם רכב"), אין-רכב ("לקוח כתום"), אדום — כולל יציאת `noVehicleExit` ושאלה 7 שמופיעה עכשיו גם בשלילי.

**RTL:** קרן ההצפה וקו הדיו צומחים מימין והצבע החזק בימין (270deg); שימר-שלד נע שמאלה; אריח שדה בימין בכל השדות **כולל כסף** (₪ באריח, בלי התנגשות עם ספרות ltr); פס-הרכבת בשורה הפעילה בצד הפתיחה; Alt+1-4 והאש `#p1-4` שרדו.

**מקלדת (הבאג הקשה של שופט 2):** טאב עובר בין 30 שדות בלי לנחות בשדה בלתי-נראה (reveal מכווץ = `visibility:hidden` + `inert`); Enter בוחר את השורה המודגשת והיא נראית בתאורת פלורסנט (רקע `--cc-soft` מלא); קיצורי 1/2 בשאלון עובדים אחרי תיקון ה-useEffect; פוקוס אחרי reveal לא גורם scroll-jump.

**ביצועים (מכונת מוקד חלשה):** הקלדה רציפה בעיר/רחוב — אפס ג'אנק (בלי blur על הפופ-אובר, debounce ‏130ms, ‏8 שורות); הקלדת סכום — אפס תנועה (חלון 600ms של CountUp); פתיחה חוזרת של אותו ליד — אפס טקס (sessionStorage); גלילה בכותרת דביקה — האורורה absolute בתוך האי, לא מציירת מחדש; `prefers-reduced-motion` מכבה הכל.

**דארק + נגישות:** מעבר toggle (`bingo-theme`) על 4 העמודים: פופ-אובר כהה אטום, wash ב-14%, ‏kbd/s1 כהים, צ'יפ-לוגו נשאר לבן במכוון; ‏gray-400 החדש `#74746F` נבדל מ-gray-500 בשני המצבים; `epv5-pop-label` ו-`kbd` ב-gray-600 ≥4.5:1; קונטרסט verdict כתום/אדום על האי הכהה; `aria-live` של פסק-הדין נשאר.

**עשן פונקציונלי:** חיוג/וואטסאפ/מייל/שלח-הסכם מכל עמוד; שליחת הסכם → polling → חתימה → קו דיו + חלקיקים פעם אחת; מיקוד מדואר ישראל + נפילת ספק (טקסט חופשי); נפילת `/api/banks/list` → listbox סטטי עם לוגואים; הנפקת חשבונית ומספור רץ בעמוד 4.