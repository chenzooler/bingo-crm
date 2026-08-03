"use client";
/**
 * שלב 6 — תסריט שיחה ומעבר להסכם.
 * כרטיס קריאה על זכוכית עם אייקון המגילה, שליחת הסכם התקשרות
 * (ה-CTA הליים של העמוד), סטטוס חי כקונסטלציה אופקית קטנה
 * (נשלח → הלקוח פתח → נחתם), ועם החתימה — פרץ חלקיקים חד-פעמי
 * ומטוס הנייר שחוצה את הכרטיס. וואטסאפ ומייל כגלולות זכוכית.
 */
import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { ClassicCardState } from "@/components/classic/useClassicCard";
import type { AgreementApi } from "./useAgreement";
import { str } from "./shared";
import { Icon3D, ParticleBurst, SPRING, useEpSpring } from "./ep";

function scriptFor(vehicleTrack: boolean, firstName: string): string[] {
  const name = firstName ? ` ${firstName}` : "";
  if (vehicleTrack) {
    return [
      `אז ככה${name}, אני אסביר איך זה עובד אצלנו בבינגו. אנחנו חברת תיווך אשראי, ובמקרה שלך המסלול המתאים הוא הלוואה כנגד הרכב - הרכב משמש בטוחה, וזה מה שמאפשר לגופי המימון לבחון את הבקשה גם כשנתוני האשראי פחות פשוטים.`,
      `אנחנו עובדים מול מספר גופי מימון מפוקחים, ומגישים את הבקשה עבורך כדי לבדוק איפה אפשר לקבל את התנאים הטובים ביותר בהתאם לנתונים שלך ולרכב.`,
      `חשוב לי להדגיש - הבדיקה עצמה לא עולה כסף ולא מחייבת אותך בכלום. שכר הטרחה שלנו נגבה רק אם ההלוואה מתקבלת בפועל, ורק אחרי שקיבלת אותה.`,
      `כדי שנתחיל בבדיקה, אני שולח לך עכשיו הסכם התקשרות דיגיטלי לחתימה - זה לוקח דקה בטלפון. אחרי החתימה נבקש כמה מסמכים על הרכב ונחזור אליך עם תשובות.`,
    ];
  }
  return [
    `אז ככה${name}, אני אסביר איך זה עובד אצלנו בבינגו. אנחנו חברת תיווך אשראי שעובדת מול מספר גופי מימון מפוקחים - במקום שתתרוצץ בין גופים לבד, אנחנו מגישים את הבקשה עבורך לכמה גופים במקביל.`,
    `ככה בודקים איפה אפשר לקבל את התנאים הטובים ביותר בהתאם לנתונים שלך, בלי שזה פוגע לך בזמן או בכיס.`,
    `חשוב לי להדגיש - הבדיקה עצמה לא עולה כסף ולא מחייבת אותך בכלום. שכר הטרחה שלנו נגבה רק אם ההלוואה מתקבלת בפועל, ורק אחרי שקיבלת אותה.`,
    `כדי שנוכל להתחיל בבדיקה, אני שולח לך עכשיו הסכם התקשרות דיגיטלי לחתימה - זה לוקח דקה בטלפון. אחרי החתימה נריץ את הבדיקות ונחזור אליך עם תשובות.`,
  ];
}

/* שלוש תחנות הסטטוס — קונסטלציה אופקית קטנה */
const STAGES: { key: string; label: string }[] = [
  { key: "sent", label: "נשלח ללקוח" },
  { key: "viewed", label: "הלקוח פתח" },
  { key: "signed", label: "נחתם" },
];

function stageIndex(status: string): number {
  if (status === "signed") return 2;
  if (status === "viewed") return 1;
  return 0;
}

function AgreementConstellation({ status }: { status: string }) {
  const idx = stageIndex(status);
  const spring = useEpSpring();
  return (
    <div className="flex items-center gap-1.5" aria-label={`סטטוס ההסכם: ${STAGES[idx].label}`}>
      {STAGES.map((s, i) => {
        const reached = i <= idx;
        return (
          <React.Fragment key={s.key}>
            {i > 0 && (
              <span aria-hidden="true" className="relative w-7 h-px bg-bingo-gray-200 overflow-hidden">
                {i <= idx && (
                  <motion.span
                    className="absolute inset-0 origin-right"
                    style={{ background: "#50ff0a" }}
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={spring(SPRING.smooth)}
                  />
                )}
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={reached
                  ? { background: "#50ff0a", boxShadow: "0 0 6px rgba(80,255,10,.6)" }
                  : { background: "#e2e0dc" }}
              />
              <span className={`text-[12px] ${reached ? "font-bold text-bingo-green-deep" : "text-bingo-gray-500"}`}>
                {s.label}
              </span>
            </span>
          </React.Fragment>
        );
      })}
    </div>
  );
}

export function Step6Agreement({ state, agreement, vehicleTrack }: {
  state: ClassicCardState;
  agreement: AgreementApi;
  vehicleTrack: boolean;
}) {
  const rm = useReducedMotion();
  const firstName = str(state.values.firstName) || state.lead.fullName.split(" ")[0] || "";
  const paragraphs = scriptFor(vehicleTrack, firstName);
  const form = agreement.agreementForm;

  /* החגיגה — פעם אחת, רק כשהחתימה מתרחשת בפועל */
  const prevSigned = React.useRef(agreement.signed);
  const [celebrateKey, setCelebrateKey] = React.useState(0);
  React.useEffect(() => {
    if (!prevSigned.current && agreement.signed) setCelebrateKey((k) => k + 1);
    prevSigned.current = agreement.signed;
  }, [agreement.signed]);

  return (
    <div className="space-y-5">
      {/* כרטיס הקריאה */}
      <div className="ep-glass p-6">
        <header className="flex items-center gap-3 mb-4">
          <Icon3D name="scroll" size={44} />
          <p className="text-[13px] font-semibold text-bingo-gray-500">
            תסריט שיחה · {vehicleTrack ? "מסלול רכב" : "מסלול כל מטרה"}
          </p>
        </header>
        <div className="space-y-3">
          {paragraphs.map((p, i) => (
            <p key={i} className="text-[17px] leading-[1.7] text-bingo-black">{p}</p>
          ))}
        </div>
      </div>

      {/* בלוק ההסכם */}
      <div className="ep-glass relative p-5">
        <div className="flex flex-wrap items-center gap-3">
          <Icon3D name="pen-sign" size={36} radius={11} />
          <div className="flex-1 min-w-0">
            <p className="text-[14px] font-bold text-bingo-black">הסכם התקשרות</p>
            <p className="text-[12px] text-bingo-gray-500 truncate">{agreement.templateName}</p>
          </div>

          {form ? (
            <div className="flex items-center gap-3">
              <AgreementConstellation status={form.status} />
              {form.status !== "signed" && (
                <button
                  type="button"
                  onClick={() => void agreement.markSigned(form.id)}
                  className="b-pill-ghost min-h-[44px] px-4 text-[13px]"
                >
                  סמן כנחתם
                </button>
              )}
            </div>
          ) : (
            <span className="relative">
              <button
                type="button"
                onClick={() => void agreement.sendAgreement()}
                disabled={agreement.sending}
                className="b-pill-green min-h-[44px] px-6 text-[14px] font-bold disabled:opacity-50"
              >
                {agreement.sending ? "שולח" : "שלח הסכם התקשרות"}
              </button>
            </span>
          )}
        </div>

        {/* כשל שליחה/עדכון — נשאר עד שניסיון חוזר מצליח, הכפתור נשאר זמין */}
        {agreement.error && !agreement.sending && (
          <p role="alert" className="text-[12px] font-bold mt-3" style={{ color: "#FF4A2E" }}>
            {agreement.error}
          </p>
        )}

        {form && form.status !== "signed" && (
          <p className="text-[12px] text-bingo-gray-500 mt-3">
            הסטטוס מתעדכן אוטומטית כל כמה שניות - אפשר להמשיך בשיחה בינתיים
          </p>
        )}

        {/* החגיגה: פרץ חלקיקים + מטוס הנייר שחוצה את הכרטיס — פעם אחת */}
        {celebrateKey > 0 && (
          <>
            <ParticleBurst
              key={`burst-${celebrateKey}`}
              count={14}
              radius={64}
              size={6}
              duration={0.65}
              colors={["#50ff0a", "#daffcb", "#b7f7a1", "#fafaf9"]}
            />
            {!rm && (
              /* eslint-disable-next-line @next/next/no-img-element */
              <motion.img
                key={`plane-${celebrateKey}`}
                src="/icons3d/paper-plane.webp"
                alt=""
                width={44}
                height={44}
                aria-hidden="true"
                className="absolute top-1/2 start-1/2 pointer-events-none"
                initial={{ x: 0, y: 0, opacity: 0, rotate: 0 }}
                animate={{ x: -240, y: -80, opacity: [0, 1, 1, 0], rotate: -16 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            )}
          </>
        )}
      </div>

      {/* ערוצי פנייה — גלולות זכוכית עם אייקוני צ'אט ומעטפה */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => void agreement.openWhatsApp()}
          disabled={!agreement.hasPhone}
          title={agreement.hasPhone ? undefined : "אין מספר טלפון בכרטיס"}
          className="ep-glass min-h-[44px] px-5 text-[13px] font-semibold text-bingo-gray-700 flex items-center gap-2 hover:bg-white/85 transition-colors disabled:opacity-40"
          style={{ borderRadius: 9999 }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icons3d/chat.webp" alt="" width={22} height={22} />
          וואטסאפ ללקוח
        </button>
        <button
          type="button"
          onClick={() => agreement.openEmail()}
          disabled={!agreement.hasEmail}
          title={agreement.hasEmail ? undefined : "אין כתובת מייל בכרטיס"}
          className="ep-glass min-h-[44px] px-5 text-[13px] font-semibold text-bingo-gray-700 flex items-center gap-2 hover:bg-white/85 transition-colors disabled:opacity-40"
          style={{ borderRadius: 9999 }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icons3d/envelope.webp" alt="" width={22} height={22} />
          מייל ללקוח
        </button>
      </div>
    </div>
  );
}
