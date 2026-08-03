"use client";
/**
 * עמוד 1 — תסריט השיחה המונחה + השאלון (הזרימה המדויקת של חן).
 *
 * רצף כרטיסים לבנים אנכי; כל שלב נחשף כשהתנאי המקדים שלו מתקיים
 * (אנימציית כניסה 200ms), שלב שהושלם מתכווץ לשורת סיכום. מסילת
 * התקדמות דקה בצד. פעולות הכותרת (cardv4:action) מנותבות לכאן.
 *
 * טבלת השערים (שלב ← תנאי):
 *   1 פתיחה            ← תמיד
 *   2 סינון            ← שם פרטי + מטרה + סכום
 *   3 שאלת רכב         ← חיווי שלילי (תשובה שלילית אחת מספיקה)
 *   4 זיהוי ורמזור     ← חיובי: כל 6 השאלות · שלילי: נענתה שאלת הרכב
 *   5 תעסוקה וכתובת    ← catalog.tracks.general או vehicle (ירוק/כחול)
 *   6 תסריט והסכם      ← שלב 5 נפתח + מצב תעסוקתי + עיר
 *   7 השלמת פרטים      ← ההסכם נחתם (או הרחבה מוקדמת ידנית)
 */
import * as React from "react";
import type { CardV4PageProps } from "../types";
import { screeningState } from "@/lib/catalog";
import { str, arr, StepCard, fmtMoney } from "./shared";
import { TasksWidget } from "./TasksWidget";
import { Step1Opening } from "./Step1Opening";
import { Step2Screening } from "./Step2Screening";
import { Step3Vehicle } from "./Step3Vehicle";
import { Step4Ramzor } from "./Step4Ramzor";
import { Step5Address } from "./Step5Address";
import { Step6Agreement } from "./Step6Agreement";
import { Step7Details } from "./Step7Details";
import { useAgreement } from "./useAgreement";

const STYLE = `
@keyframes v4p1-enter {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: none; }
}
.v4p1-enter { animation: v4p1-enter 200ms cubic-bezier(.16,1,.3,1) both; }
@media (prefers-reduced-motion: reduce) {
  .v4p1-enter { animation: none; }
}
`;

interface StepMeta {
  id: string;
  label: string;
  visible: boolean;
  done: boolean;
}

export default function Page1Talk({ state, catalog }: CardV4PageProps) {
  const v = state.values;
  const screening = screeningState(v);

  /* ---------- שערי השלבים ---------- */
  const step1Done = !!(str(v.firstName) && str(v.loanPurpose) && str(v.amountRequested));
  const show2 = step1Done;
  const screeningCoreDone = screening.answered >= screening.total;
  const step2Done = screeningCoreDone && arr(v.checkedBefore).length > 0;
  const show3 = screening.negative;
  const step3Done = !!str(v.hasVehicleRaw);
  const show4 = screening.negative ? step3Done : screeningCoreDone;
  const step4Done = catalog.ramzor !== null;
  const trackOpen = catalog.tracks.general || catalog.tracks.vehicle;
  const vehicleTrack = catalog.tracks.vehicle && !catalog.tracks.general;
  const show5 = trackOpen;
  const step5Done = !!(str(v.employment) && str(v.hasProperty) && str(v.city) && str(v.address) && str(v.houseNum));
  const show6 = show5 && !!(str(v.employment) && str(v.city));

  const agreement = useAgreement(state, vehicleTrack);
  const step6Done = agreement.signed;
  const [earlyDetails, setEarlyDetails] = React.useState(false);
  const show7 = show6 && (agreement.signed || earlyDetails);

  /* ---------- פתיחה מחדש של שלבים מכווצים ---------- */
  const [forced, setForced] = React.useState<Set<string>>(new Set());
  const toggle = React.useCallback((id: string) => {
    setForced((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  /* ---------- פעולות הכותרת ---------- */
  const agreementRef = React.useRef(agreement);
  agreementRef.current = agreement;
  React.useEffect(() => {
    const onAction = (e: Event) => {
      const action = (e as CustomEvent<{ action?: string }>).detail?.action;
      const a = agreementRef.current;
      if (action === "send-agreement") {
        document.getElementById("v4p1-step-agreement")?.scrollIntoView({ behavior: "smooth", block: "center" });
        if (!a.agreementForm) void a.sendAgreement();
      } else if (action === "whatsapp") {
        void a.openWhatsApp();
      } else if (action === "email") {
        a.openEmail();
      }
    };
    window.addEventListener("cardv4:action", onAction);
    return () => window.removeEventListener("cardv4:action", onAction);
  }, []);

  /* ---------- מסילת ההתקדמות ---------- */
  const steps: StepMeta[] = [
    { id: "opening", label: "פתיחה", visible: true, done: step1Done },
    { id: "screening", label: "בדיקת נתוני אשראי", visible: show2, done: step2Done },
    { id: "vehicle-q", label: "רכב בבעלות", visible: show3, done: step3Done },
    { id: "ramzor", label: "זיהוי ובדיקת רמזור", visible: show4, done: step4Done },
    { id: "address", label: "תעסוקה וכתובת", visible: show5, done: step5Done },
    { id: "agreement", label: "תסריט והסכם", visible: show6, done: step6Done },
    { id: "details", label: "השלמת פרטים", visible: show7, done: false },
  ];
  const visibleSteps = steps.filter((s) => s.visible);
  const currentId = visibleSteps.find((s) => !s.done)?.id ?? visibleSteps[visibleSteps.length - 1]?.id;

  let stepIndex = 0;

  return (
    <div className="flex gap-4 items-start">
      <style dangerouslySetInnerHTML={{ __html: STYLE }} />

      {/* מסילת ההתקדמות */}
      <nav
        aria-label="שלבי השיחה"
        className="hidden lg:flex flex-col items-center gap-1 sticky top-24 pt-2 w-8 shrink-0"
      >
        {visibleSteps.map((s, i) => (
          <React.Fragment key={s.id}>
            {i > 0 && <span className="w-px h-5 bg-bingo-gray-200" aria-hidden="true" />}
            <button
              type="button"
              title={s.label}
              aria-label={s.label}
              aria-current={s.id === currentId ? "step" : undefined}
              onClick={() =>
                document.getElementById(`v4p1-step-${s.id}`)?.scrollIntoView({ behavior: "smooth", block: "center" })
              }
              className="w-6 h-6 flex items-center justify-center"
            >
              <span
                className={`rounded-full transition-all duration-200 ${
                  s.done
                    ? "w-2.5 h-2.5 bg-bingo-green-dark"
                    : s.id === currentId
                      ? "w-3 h-3 bg-bingo-black"
                      : "w-2 h-2 bg-bingo-gray-300"
                }`}
              />
            </button>
          </React.Fragment>
        ))}
      </nav>

      {/* רצף השלבים */}
      <div className="flex-1 min-w-0 space-y-4">
        <TasksWidget leadId={state.lead.id} />

        <StepCard
          id="opening" index={++stepIndex} title="פתיחה"
          done={step1Done}
          summary={`${str(v.firstName)} ${str(v.lastName)}`.trim() + ` · ${str(v.loanPurpose)} · ${fmtMoney(str(v.amountRequested))} ₪`}
          forcedOpen={forced.has("opening")} onToggle={toggle}
        >
          <Step1Opening state={state} />
        </StepCard>

        {show2 && (
          <StepCard
            id="screening" index={++stepIndex} title="בדיקת נתוני אשראי"
            done={step2Done}
            summary={screening.negative
              ? `חיווי שלילי · ${screening.reasons.join(" · ")}`
              : "חיווי אשראי חיובי"}
            forcedOpen={forced.has("screening")} onToggle={toggle}
          >
            <Step2Screening state={state} />
          </StepCard>
        )}

        {show3 && (
          <StepCard
            id="vehicle-q" index={++stepIndex} title="רכב בבעלות"
            done={step3Done}
            summary={str(v.hasVehicleRaw)}
            forcedOpen={forced.has("vehicle-q")} onToggle={toggle}
          >
            <Step3Vehicle state={state} />
          </StepCard>
        )}

        {show4 && (
          <StepCard
            id="ramzor" index={++stepIndex} title="זיהוי ובדיקת רמזור"
            done={step4Done}
            summary={catalog.label}
            forcedOpen={forced.has("ramzor")} onToggle={toggle}
          >
            <Step4Ramzor state={state} catalog={catalog} />
          </StepCard>
        )}

        {show5 && (
          <StepCard
            id="address" index={++stepIndex} title="תעסוקה וכתובת"
            done={step5Done}
            summary={[str(v.employment), `${str(v.city)} ${str(v.address)} ${str(v.houseNum)}`.trim()]
              .filter(Boolean).join(" · ")}
            forcedOpen={forced.has("address")} onToggle={toggle}
          >
            <Step5Address state={state} />
          </StepCard>
        )}

        {show6 && (
          <StepCard
            id="agreement" index={++stepIndex} title="תסריט ומעבר להסכם"
            done={step6Done}
            summary="ההסכם נחתם"
            forcedOpen={forced.has("agreement")} onToggle={toggle}
          >
            <Step6Agreement state={state} agreement={agreement} vehicleTrack={vehicleTrack} />
          </StepCard>
        )}

        {show6 && !show7 && (
          <div className="px-2">
            <button
              type="button"
              onClick={() => setEarlyDetails(true)}
              className="text-[13px] text-bingo-gray-500 hover:text-bingo-black min-h-[44px]"
            >
              השלמת פרטים - אפשר גם לפני חתימה
            </button>
          </div>
        )}

        {show7 && (
          <StepCard
            id="details" index={++stepIndex} title="השלמת פרטים"
            done={false}
            forcedOpen={forced.has("details")} onToggle={toggle}
          >
            <Step7Details state={state} />
          </StepCard>
        )}
      </div>
    </div>
  );
}
