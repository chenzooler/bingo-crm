"use client";
/**
 * עמוד 1 — תסריט השיחה המונחה + השאלון (הזרימה המדויקת של חן).
 * שפת "נייר חשמלי": שדרה של חדרים צבעוניים — כל שלב הוא כרטיס זכוכית
 * בזהות צבע משלו, השלב הפעיל באור הזרקורים (קרן גבול אחת במסך),
 * והשאר מעומעמים; קונסטלציית התקדמות אנכית עם חלקיקי השלמה.
 *
 * הלוגיקה, השערים וה-API נשארו אחד לאחד:
 *   1 פתיחה            ← תמיד
 *   2 סינון            ← שם פרטי + מטרה + סכום
 *   3 שאלת רכב         ← חיווי שלילי (תשובה שלילית אחת מספיקה) או רמזור צהוב
 *   4 זיהוי ורמזור     ← חיובי: כל 6 השאלות · שלילי: נענתה שאלת הרכב
 *                        (שלילי + אין רכב = יציאה: הודעת סיום במקום רמזור)
 *   5 תעסוקה וכתובת    ← catalog.tracks.general או vehicle (ירוק/כחול)
 *   6 תסריט והסכם      ← שלב 5 נפתח + מצב תעסוקתי + עיר
 *   7 השלמת פרטים      ← ההסכם נחתם (או הרחבה מוקדמת ידנית)
 */
import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { CardV4PageProps } from "../types";
import { hasVehicleAnswer, screeningState } from "@/lib/catalog";
import { str, arr, StepCard, fmtMoney } from "./shared";
import { ParticleBurst, SPRING } from "./ep";
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
  from { opacity: 0; transform: translateX(12px); }
  to { opacity: 1; transform: none; }
}
.v4p1-enter { animation: v4p1-enter 260ms cubic-bezier(.16,1,.3,1) both; }
/* תאורת במה — שלבים שאינם בפוקוס מתעמעמים; קליק מחזיר אליהם את האור */
.v4p1-dim { opacity: .45; filter: saturate(.6); transition: opacity 300ms ease, filter 300ms ease; }
.v4p1-dim:hover { opacity: .72; }
@media (prefers-reduced-motion: reduce) {
  .v4p1-enter { animation: none; }
  .v4p1-dim { transition: none; }
}
`;

/* זהות כל חדר בשדרה: גוון + אייקון תלת-ממד */
const STEP_THEME: Record<string, { tone: string; icon: string }> = {
  opening: { tone: "ep-step-mint", icon: "phone" },
  screening: { tone: "ep-step-sky", icon: "shield-check" },
  "vehicle-q": { tone: "ep-step-peach", icon: "car" },
  ramzor: { tone: "ep-step-lilac", icon: "ramzor" },
  address: { tone: "ep-step-sand", icon: "house" },
  agreement: { tone: "ep-step-rose", icon: "pen-sign" },
  details: { tone: "ep-step-ice", icon: "checklist" },
};

interface StepMeta {
  id: string;
  label: string;
  visible: boolean;
  done: boolean;
}

/* ---------- קונסטלציית ההתקדמות ---------- */

function ProgressConstellation({ steps, activeId, bursts, onJump }: {
  steps: StepMeta[];
  activeId: string | undefined;
  /** מונה פרץ-חלקיקים פר שלב — עולה כשהשלב הושלם הרגע */
  bursts: Record<string, number>;
  onJump: (id: string) => void;
}) {
  const rm = useReducedMotion();
  return (
    <nav aria-label="שלבי השיחה" className="hidden lg:block sticky top-24 w-44 shrink-0 pt-2">
      <ol>
        {steps.map((s, i) => {
          const theme = STEP_THEME[s.id];
          const isActive = s.id === activeId;
          const last = i === steps.length - 1;
          return (
            <li key={s.id} className={`${theme.tone} relative`}>
              {/* קו-שיער אל הנקודה הבאה; מושלם — נצבע בליים שמצייר את עצמו */}
              {!last && (
                <span
                  aria-hidden="true"
                  className="absolute w-px bg-bingo-gray-200"
                  style={{ insetInlineStart: 21, top: 32, bottom: -12 }}
                >
                  {s.done && (
                    <motion.span
                      className="absolute inset-0 origin-top"
                      style={{ background: "#50ff0a", boxShadow: "0 0 6px rgba(80,255,10,.55)" }}
                      initial={rm ? false : { scaleY: 0 }}
                      animate={{ scaleY: 1 }}
                      transition={rm ? { duration: 0 } : SPRING.smooth}
                    />
                  )}
                </span>
              )}
              <button
                type="button"
                aria-current={isActive ? "step" : undefined}
                onClick={() => onJump(s.id)}
                className="relative flex items-center gap-3 w-full min-h-[44px] py-1 text-start"
              >
                <span className="relative w-[26px] h-[26px] flex items-center justify-center shrink-0">
                  {s.done ? (
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{
                        background: "var(--step-dot)",
                        boxShadow: "0 0 8px 1px color-mix(in srgb, var(--step-dot) 55%, transparent)",
                      }}
                    />
                  ) : isActive ? (
                    <motion.span
                      className="w-3.5 h-3.5 rounded-full"
                      style={{ background: "var(--step-dot)" }}
                      animate={rm ? undefined : { scale: [1, 1.15, 1] }}
                      transition={{ duration: 0.9, repeat: Infinity, repeatDelay: 2.1, ease: "easeInOut" }}
                    />
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-bingo-gray-300" />
                  )}
                  {/* חלקיקי השלמת שלב — נורים פעם אחת כשהנקודה מתמלאת */}
                  {bursts[s.id] ? (
                    <ParticleBurst key={bursts[s.id]} count={7} radius={22} size={4} />
                  ) : null}
                </span>
                <span
                  className={`text-[12px] leading-tight ${isActive ? "font-bold" : "text-bingo-gray-600"}`}
                  style={isActive ? { color: "var(--step-deep)" } : undefined}
                >
                  {s.label}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/** פרופס הפעולה-הממתינה מהכותרת — אופציונליים כדי לא לתלות בסדר הנחיתה של types.ts */
type PendingActionProps = {
  pendingAction?: "send-agreement" | "whatsapp" | "email" | null;
  onPendingActionConsumed?: () => void;
};

export default function Page1Talk(props: CardV4PageProps & PendingActionProps) {
  const { state, catalog } = props;
  const pendingAction = props.pendingAction ?? null;
  const onPendingActionConsumed = props.onPendingActionConsumed;
  const v = state.values;
  const screening = screeningState(v);

  /* ---------- שערי השלבים ---------- */
  const step1Done = !!(str(v.firstName) && str(v.loanPurpose) && str(v.amountRequested));
  const show2 = step1Done;
  const screeningCoreDone = screening.answered >= screening.total;
  /* בנתיב שלילי הזרימה ממשיכה אחרי תשובה שלילית אחת — השלב נחשב הושלם */
  const step2Done = screening.negative || (screeningCoreDone && arr(v.checkedBefore).length > 0);
  /* רמזור צהוב = מסלול רכב בלבד — חייבים מקום לענות על שאלת הרכב גם בחיווי חיובי */
  const show3 = screening.negative || catalog.ramzor === "yellow";
  const step3Done = !!str(v.hasVehicleRaw);
  /* חיווי שלילי + אין רכב = יציאה: לא פותחים רמזור אלא מציגים סיכום רגוע */
  const noVehicleExit = screening.negative && hasVehicleAnswer(v) === false;
  const show4 = (screening.negative ? step3Done : screeningCoreDone) && !noVehicleExit;
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

  /* ---------- פתיחה מחדש של שלבים מכווצים + פוקוס תאורת הבמה ---------- */
  const [forced, setForced] = React.useState<Set<string>>(new Set());
  const [focusId, setFocusId] = React.useState<string | null>(null);
  const forcedRef = React.useRef(forced);
  forcedRef.current = forced;
  const toggle = React.useCallback((id: string) => {
    /* כיווץ שלב שנפתח מחדש מחזיר את הקרן לשלב הנוכחי מיד */
    if (forcedRef.current.has(id)) setFocusId((f) => (f === id ? null : f));
    setForced((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);
  const focus = React.useCallback((id: string) => setFocusId(id), []);

  /* ---------- פעולות הכותרת ---------- */
  const agreementRef = React.useRef(agreement);
  agreementRef.current = agreement;
  const show6Ref = React.useRef(show6);
  show6Ref.current = show6;

  /* הודעה חולפת ליד הקונסטלציה — כשהפעולה לא יכולה לרוץ עדיין */
  const [actionNotice, setActionNotice] = React.useState<string | null>(null);
  const noticeTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const showNotice = React.useCallback((msg: string) => {
    setActionNotice(msg);
    if (noticeTimer.current) clearTimeout(noticeTimer.current);
    noticeTimer.current = setTimeout(() => setActionNotice(null), 4000);
  }, []);
  React.useEffect(() => () => { if (noticeTimer.current) clearTimeout(noticeTimer.current); }, []);

  const runAction = React.useCallback((action: string) => {
    const a = agreementRef.current;
    if (action === "send-agreement") {
      document.getElementById("v4p1-step-agreement")?.scrollIntoView({ behavior: "smooth", block: "center" });
      /* שולחים רק כששלב ההסכם פתוח ואין כבר טופס — אחרת רק קופצים ומסבירים */
      if (show6Ref.current && !a.agreementForm) void a.sendAgreement();
      else if (!show6Ref.current) showNotice("השלימו את שלבי השיחה לפני שליחת ההסכם");
    } else if (action === "whatsapp") {
      void a.openWhatsApp();
    } else if (action === "email") {
      a.openEmail();
    }
  }, [showNotice]);

  React.useEffect(() => {
    const onAction = (e: Event) => {
      const action = (e as CustomEvent<{ action?: string }>).detail?.action;
      if (action) runAction(action);
    };
    window.addEventListener("cardv4:action", onAction);
    return () => window.removeEventListener("cardv4:action", onAction);
  }, [runAction]);

  /* פעולה ממתינה מהכותרת (הגיעה מעמוד אחר) — מבוצעת ונצרכת */
  React.useEffect(() => {
    if (!pendingAction) return;
    runAction(pendingAction);
    onPendingActionConsumed?.();
  }, [pendingAction, runAction, onPendingActionConsumed]);

  /* ---------- קונסטלציית ההתקדמות ---------- */
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
  /* השלב הפעיל: פוקוס ידני אם עדיין גלוי, אחרת השלב הפתוח הראשון */
  const activeId = focusId && visibleSteps.some((s) => s.id === focusId) ? focusId : currentId;

  /* שחרור הפוקוס הידני כשהשלב שבפוקוס הושלם — הקרן חוזרת לעקוב אחרי ההתקדמות */
  React.useEffect(() => {
    if (!focusId) return;
    const s = steps.find((x) => x.id === focusId);
    if (s?.done && !forced.has(focusId)) setFocusId(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusId, forced, step1Done, step2Done, step3Done, step4Done, step5Done, step6Done]);

  /* פרצי חלקיקים — נורים כשהשלמה מתרחשת בפועל (לא בטעינה ראשונה) */
  const prevDone = React.useRef<Record<string, boolean>>({});
  const [bursts, setBursts] = React.useState<Record<string, number>>({});
  React.useEffect(() => {
    for (const s of steps) {
      if (s.visible && s.done && prevDone.current[s.id] === false) {
        setBursts((b) => ({ ...b, [s.id]: (b[s.id] ?? 0) + 1 }));
      }
      prevDone.current[s.id] = s.done;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step1Done, step2Done, step3Done, step4Done, step5Done, step6Done, show2, show3, show4, show5, show6, show7]);

  const jump = React.useCallback((id: string) => {
    setFocusId(id);
    document.getElementById(`v4p1-step-${id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, []);

  let stepIndex = 0;
  const cardProps = (id: string) => ({
    tone: STEP_THEME[id].tone,
    icon: STEP_THEME[id].icon,
    active: id === activeId,
    onFocus: focus,
  });

  return (
    <div className="flex gap-5 items-start">
      <style dangerouslySetInnerHTML={{ __html: STYLE }} />

      <ProgressConstellation steps={visibleSteps} activeId={activeId} bursts={bursts} onJump={jump} />

      {/* רצף השלבים */}
      <div className="flex-1 min-w-0 space-y-4">
        {actionNotice && (
          <p role="status" className="text-[13px] font-semibold text-status-red bg-status-red-soft rounded-full px-4 py-2 inline-block">
            {actionNotice}
          </p>
        )}
        <TasksWidget leadId={state.lead.id} />
        <QuickNote onAdd={(text) => state.addNote("note", text)} />

        <StepCard
          id="opening" index={++stepIndex} title="פתיחה"
          done={step1Done}
          summary={`${str(v.firstName)} ${str(v.lastName)}`.trim() + ` · ${str(v.loanPurpose)} · ${fmtMoney(str(v.amountRequested))} ₪`}
          forcedOpen={forced.has("opening")} onToggle={toggle}
          {...cardProps("opening")}
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
            summaryTone={screening.negative ? "bad" : "good"}
            forcedOpen={forced.has("screening")} onToggle={toggle}
            {...cardProps("screening")}
          >
            <Step2Screening state={state} />
          </StepCard>
        )}

        {show3 && (
          <StepCard
            id="vehicle-q" index={++stepIndex} title="רכב בבעלות"
            done={step3Done}
            summary={str(v.hasVehicleRaw)}
            summaryTone={screening.negative && str(v.hasVehicleRaw) === "לא"
              ? "bad"
              : hasVehicleAnswer(v) === true ? "good" : undefined}
            forcedOpen={forced.has("vehicle-q")} onToggle={toggle}
            {...cardProps("vehicle-q")}
          >
            <Step3Vehicle state={state} />
          </StepCard>
        )}

        {/* יציאה רגועה: חיווי שלילי + אין רכב — אין שלב רמזור, מסכמים ומתעדים */}
        {noVehicleExit && (
          <div className="b-card p-5 space-y-1.5" role="status">
            <p className="text-[15px] font-bold text-bingo-black">
              אין מסלול מתאים כרגע - חיווי שלילי וללא רכב
            </p>
            <p className="text-[13px] text-bingo-gray-500">
              מסכמים את השיחה ברוגע, מתעדים בכרטיס ומסמנים את הליד כלא רלוונטי
            </p>
          </div>
        )}

        {show4 && (
          <StepCard
            id="ramzor" index={++stepIndex} title="זיהוי ובדיקת רמזור"
            done={step4Done}
            summary={catalog.label}
            summaryTone={catalog.ramzor === "red" ? "bad" : undefined}
            forcedOpen={forced.has("ramzor")} onToggle={toggle}
            {...cardProps("ramzor")}
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
            {...cardProps("address")}
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
            {...cardProps("agreement")}
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
            {...cardProps("details")}
          >
            <Step7Details state={state} />
          </StepCard>
        )}
      </div>
    </div>
  );
}

/* ---------- הערה מהירה — סוגר את סעיף "מוסיפים פעילויות" בעמוד 1 (חוקה §2) ---------- */
function QuickNote({ onAdd }: { onAdd: (text: string) => void }) {
  const [open, setOpen] = React.useState(false);
  const [text, setText] = React.useState("");
  const submit = () => {
    if (!text.trim()) return;
    onAdd(text.trim());
    setText("");
    setOpen(false);
  };
  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-[13px] font-semibold text-bingo-gray-500 hover:text-bingo-black transition-colors"
      >
        + הוסף הערה
      </button>
    );
  }
  return (
    <div className="epv5-s1 p-3 space-y-2">
      <textarea
        autoFocus
        className="b-input ep-input w-full min-h-[64px] py-2.5 text-[13.5px] resize-y"
        placeholder="הערה לציר הזמן..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); submit(); }
          if (e.key === "Escape") setOpen(false);
        }}
      />
      <div className="flex gap-2">
        <button type="button" onClick={submit} disabled={!text.trim()}
          className="b-pill-dark min-h-[40px] px-5 text-[13px] disabled:opacity-40">
          הוסף הערה
        </button>
        <button type="button" onClick={() => setOpen(false)}
          className="text-[12.5px] text-bingo-gray-400 hover:text-bingo-gray-600">
          ביטול
        </button>
      </div>
    </div>
  );
}
