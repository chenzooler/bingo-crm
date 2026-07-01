"use client";
import * as React from "react";
import Link from "next/link";
import {
  Phone, MessageCircle, ChevronLeft, ChevronRight, Check, X, Car,
  FileSignature, Clock, AlarmClock, Banknote, ShieldCheck, Trophy,
  Send, StickyNote, CalendarClock, AlertTriangle, PartyPopper, Upload,
  CheckCircle2, XCircle, RotateCcw, Sparkles,
} from "lucide-react";
import type { Lead } from "@/lib/types";
import {
  type JourneyState, type Stage, type Track, initialJourney,
  SCREENING_QUESTIONS, VEHICLE_DOCS, JOURNEY_LENDERS, lenderLogo,
  screeningFailed, screeningComplete, stepsForTrack, STAGE_LABELS,
} from "@/lib/journey";
import { Confetti } from "@/components/ui/Confetti";
import { cn, formatCurrency } from "@/lib/utils";

/* ============================================================
   LEAD CARD v3 — "המסלול המונחה"
   הנציג אף פעם לא שואל "מה עכשיו?" — המסך אומר לו.
   ליד אחד · מסע אחד · אפס תהליכים כפולים.
   ============================================================ */

export function LeadCardV3({ lead }: { lead: Lead }) {
  const storageKey = `bingo-journey-${lead.id}`;
  const [j, setJ] = React.useState<JourneyState>(initialJourney);
  const [loaded, setLoaded] = React.useState(false);
  const [confetti, setConfetti] = React.useState(0);
  const [note, setNote] = React.useState("");
  const [showCallback, setShowCallback] = React.useState(false);

  // persist per-lead so an agent never loses mid-call progress
  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) setJ({ ...initialJourney(), ...JSON.parse(raw) });
    } catch {}
    setLoaded(true);
  }, [storageKey]);
  React.useEffect(() => {
    if (loaded) try { localStorage.setItem(storageKey, JSON.stringify(j)); } catch {}
  }, [j, loaded, storageKey]);

  function log(text: string, kind = "system") {
    setJ((s) => ({ ...s, timeline: [{ at: new Date().toISOString(), text, kind }, ...s.timeline] }));
  }
  function patch(p: Partial<JourneyState>) { setJ((s) => ({ ...s, ...p })); }

  /* ---------- transitions ---------- */
  function finishScreening() {
    if (screeningFailed(j)) {
      patch({ stage: "vehicle-pivot" });
      log("סינון: נפסל למסלול כל מטרה — נשאלת שאלת רכב", "flow");
    } else {
      patch({ stage: "questionnaire", track: "general" });
      log("סינון עבר בהצלחה ✓ — מסלול הלוואה לכל מטרה", "flow");
    }
  }
  function answerVehiclePivot(has: boolean) {
    if (has) {
      patch({ hasVehicle: true, track: "vehicle", stage: "questionnaire" });
      log("יש רכב 🚗 — ממשיכים במסלול הלוואה כנגד רכב", "flow");
    } else {
      patch({ hasVehicle: false, stage: "exit", exitReason: "לא זכאי — אין רכב" });
      log("אין רכב — הליד יוצא (לא זכאי)", "flow");
    }
  }
  function finishQuestionnaire() {
    patch({ stage: "contract" });
    log("השאלון הושלם — עוברים להסכם התקשרות", "flow");
  }
  function sendContract(via: "whatsapp" | "sms") {
    patch({ contractSentAt: new Date().toISOString(), contractSentVia: via });
    log(`הסכם התקשרות נשלח ב-${via === "whatsapp" ? "WhatsApp" : "SMS"}`, "contract");
  }
  function markSigned() {
    const now = new Date();
    const due = new Date(now.getTime() + 60 * 60 * 1000);
    patch({ signedAt: now.toISOString(), callbackDueAt: due.toISOString(), stage: "cooldown" });
    setConfetti((c) => c + 1);
    log("✍️ הלקוח חתם על הסכם התקשרות! נוצרה משימת חזרה אוטומטית בעוד שעה", "contract");
  }
  function startAfterCooldown() {
    if (j.track === "vehicle") {
      patch({ stage: "docs" });
      log("חזרה ללקוח — מבקשים 4 מסמכים (מסלול רכב)", "flow");
    } else {
      patch({ stage: "checks" });
      log("חזרה ללקוח — מתחילים בדיקות זכאות בכל הגופים", "flow");
    }
  }
  function allDocsIn() {
    patch({ docsUploadedAt: new Date().toISOString() });
    log("כל המסמכים התקבלו והועלו לגוף המימון — ממתינים לאישור סופי", "docs");
  }
  function setFinalApproval(amount: number, rate: number, months: number) {
    patch({ finalApproval: { amount, rate, months }, stage: "results" });
    setConfetti((c) => c + 1);
    log(`🎉 אישור סופי: ${formatCurrency(amount)} · ריבית ${rate}% · ${months} חודשים`, "approval");
  }
  function finishChecks() {
    patch({ stage: "results" });
    log("כל הבדיקות הוזנו — משקפים תוצאות ללקוח", "checks");
  }
  function chooseLender(key: string) {
    const due = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
    patch({ chosenLender: key, stage: "awaiting-loan", paymentDueAt: due.toISOString() });
    const name = JOURNEY_LENDERS.find((l) => l.key === key)?.name || key;
    log(`הלקוח בחר את ההצעה של ${name} — ממתין להלוואה. משימת תשלום נוצרה לעוד יומיים`, "flow");
  }
  function vehicleProceed() {
    const due = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
    patch({ stage: "awaiting-loan", paymentDueAt: due.toISOString() });
    log("האישור הוצג ללקוח — ממתין להעברת ההלוואה. משימת תשלום בעוד יומיים", "flow");
  }
  function markPaid() {
    patch({ paidAt: new Date().toISOString(), stage: "done" });
    setConfetti((c) => c + 1);
    log("💰 התשלום התקבל — העסקה הושלמה!", "payment");
  }
  function addNote() {
    if (!note.trim()) return;
    log(note.trim(), "note");
    setNote("");
  }
  function resetJourney() {
    if (!confirm("לאפס את המסע של הליד הזה?")) return;
    setJ(initialJourney());
  }

  const steps = stepsForTrack(j.track);
  const stageIdx = steps.indexOf(j.stage === "vehicle-pivot" ? "screening" : j.stage);

  return (
    <div className="max-w-[1180px] space-y-4">
      <Confetti trigger={confetti} count={40} />

      {/* ============ IDENTITY BAR ============ */}
      <div className="b-card px-5 py-4 flex items-center gap-4 flex-wrap">
        <Link href="/leads" className="size-10 rounded-full bg-bingo-gray-100 hover:bg-bingo-gray-150 flex items-center justify-center text-bingo-gray-600 shrink-0" aria-label="חזרה ללידים">
          <ChevronRight className="size-4" />
        </Link>
        <span className={cn(
          "size-12 rounded-full flex items-center justify-center text-[18px] font-bold shrink-0",
          j.stage === "done" ? "bg-bingo-green text-bingo-black" : "bg-bingo-gray-100 text-bingo-gray-700"
        )}>
          {lead.fullName.charAt(0)}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-[20px] font-bold text-bingo-black truncate">{lead.fullName}</h1>
            <RamzorBadge ramzor={j.ramzor} />
            {j.track && (
              <span className={cn("b-chip", j.track === "vehicle" ? "b-chip-blue" : "b-chip-green")}>
                {j.track === "vehicle" ? <><Car className="size-3.5" /> מסלול רכב</> : <><Banknote className="size-3.5" /> כל מטרה</>}
              </span>
            )}
            {/* THE fallback memory — no more duplicate processes */}
            {j.track === "general" && j.hasVehicle && (
              <span className="b-chip b-chip-blue"><Car className="size-3.5" /> יש רכב — מסלול חלופי</span>
            )}
          </div>
          <div className="text-[12px] text-bingo-gray-500 tabular-nums mt-0.5" dir="ltr">
            {lead.phone || "—"} · ת.ז {lead.idNumber || "—"}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <a href={`tel:${lead.phone}`} className="b-pill b-pill-green b-pill-sm"><Phone className="size-4" /> חייג</a>
          <button className="b-pill b-pill-ghost b-pill-sm"><MessageCircle className="size-4" /> WhatsApp</button>
          <button onClick={() => setShowCallback(true)} className="b-pill b-pill-ghost b-pill-sm"><CalendarClock className="size-4" /> קבע חזרה</button>
        </div>
      </div>

      {/* ============ JOURNEY STEPPER ============ */}
      {j.stage !== "exit" && (
        <div className="b-card px-5 py-4 overflow-x-auto scrollbar-none">
          <div className="flex items-center min-w-[720px]">
            {steps.map((s, i) => {
              const meta = STAGE_LABELS.find((m) => m.key === s)!;
              const done = i < stageIdx || j.stage === "done";
              const active = i === stageIdx && j.stage !== "done";
              return (
                <React.Fragment key={s}>
                  {i > 0 && <div className={cn("flex-1 h-[3px] rounded-full mx-1.5", done ? "bg-bingo-green" : "bg-bingo-gray-150")} />}
                  <div className="flex flex-col items-center gap-1 shrink-0">
                    <span className={cn(
                      "size-8 rounded-full flex items-center justify-center text-[12px] font-bold transition-all",
                      done ? "bg-bingo-green text-bingo-black" :
                      active ? "bg-bingo-black text-white ring-4 ring-bingo-green/30" :
                      "bg-bingo-gray-100 text-bingo-gray-400"
                    )}>
                      {done ? <Check className="size-4" strokeWidth={3} /> : i + 1}
                    </span>
                    <span className={cn("text-[10.5px] font-semibold whitespace-nowrap", active ? "text-bingo-black" : "text-bingo-gray-400")}>
                      {meta.short}
                    </span>
                  </div>
                </React.Fragment>
              );
            })}
          </div>
        </div>
      )}

      {/* ============ MAIN GRID ============ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
        {/* -------- STAGE AREA -------- */}
        <div className="lg:col-span-2 space-y-4">
          {j.stage === "screening" && <ScreeningStage j={j} patch={patch} onFinish={finishScreening} />}
          {j.stage === "vehicle-pivot" && <VehiclePivotStage onAnswer={answerVehiclePivot} />}
          {j.stage === "questionnaire" && <QuestionnaireStage j={j} patch={patch} onFinish={finishQuestionnaire} />}
          {j.stage === "contract" && <ContractStage j={j} lead={lead} onSend={sendContract} onSigned={markSigned} />}
          {j.stage === "cooldown" && <CooldownStage j={j} onReady={startAfterCooldown} />}
          {j.stage === "checks" && <ChecksStage j={j} patch={patch} onFinish={finishChecks} />}
          {j.stage === "docs" && <DocsStage j={j} patch={patch} onAllIn={allDocsIn} onApproval={setFinalApproval} />}
          {j.stage === "results" && <ResultsStage j={j} onChoose={chooseLender} onVehicleProceed={vehicleProceed} />}
          {j.stage === "awaiting-loan" && <AwaitingStage j={j} onAdvance={() => patch({ stage: "payment" })} />}
          {j.stage === "payment" && <PaymentStage j={j} patch={patch} onPaid={markPaid} />}
          {j.stage === "done" && <DoneStage j={j} lead={lead} />}
          {j.stage === "exit" && <ExitStage j={j} onReopen={() => patch({ stage: "screening", exitReason: null })} />}
        </div>

        {/* -------- SIDE RAIL: notes + timeline -------- */}
        <div className="space-y-4">
          <section className="b-card p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="b-icon b-icon-gray size-8"><StickyNote className="size-4" /></span>
              <h3 className="text-[14px] font-bold text-bingo-black">הערה מהירה</h3>
            </div>
            <div className="flex gap-2">
              <input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addNote()}
                placeholder="כתוב הערה ולחץ Enter..."
                className="b-input h-10 text-[13px]"
              />
              <button onClick={addNote} className="b-pill b-pill-dark b-pill-sm shrink-0">שמור</button>
            </div>
          </section>

          <section className="b-card p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[14px] font-bold text-bingo-black">ציר זמן</h3>
              <button onClick={resetJourney} className="text-[11px] text-bingo-gray-400 hover:text-bingo-gray-600 inline-flex items-center gap-1">
                <RotateCcw className="size-3" /> אפס מסע
              </button>
            </div>
            <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
              {j.timeline.length === 0 && (
                <p className="text-[12px] text-bingo-gray-400 text-center py-4">כל פעולה תתועד כאן אוטומטית</p>
              )}
              {j.timeline.map((t, i) => (
                <div key={i} className="flex gap-2.5">
                  <span className={cn(
                    "size-2 rounded-full mt-1.5 shrink-0",
                    t.kind === "note" ? "bg-status-blue" :
                    t.kind === "approval" || t.kind === "payment" ? "bg-bingo-green" :
                    t.kind === "contract" ? "bg-status-purple" : "bg-bingo-gray-300"
                  )} />
                  <div className="min-w-0">
                    <p className="text-[12.5px] text-bingo-black leading-snug">{t.text}</p>
                    <p className="text-[10.5px] text-bingo-gray-400 tabular-nums">
                      {new Date(t.at).toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" })} · {new Date(t.at).toLocaleDateString("he-IL", { day: "numeric", month: "numeric" })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      {/* callback modal */}
      {showCallback && (
        <CallbackModal
          onClose={() => setShowCallback(false)}
          onSet={(when, txt) => {
            log(`⏰ נקבעה חזרה ללקוח: ${when}${txt ? ` — ${txt}` : ""}`, "note");
            setShowCallback(false);
          }}
        />
      )}
    </div>
  );
}

/* ============================================================
   STAGE 1 — SCREENING (שאלות סינון + רמזור)
   ============================================================ */
function ScreeningStage({ j, patch, onFinish }: { j: JourneyState; patch: (p: Partial<JourneyState>) => void; onFinish: () => void }) {
  const failed = screeningFailed(j);
  const complete = screeningComplete(j);
  return (
    <section className="b-card p-6">
      <StageHeader icon={<ShieldCheck className="size-5" />} tone="green" title="שאלות סינון + בדיקת רמזור"
        subtitle="שאל את הלקוח לפי הסדר — המערכת תקבע את המסלול אוטומטית" />

      <div className="space-y-3 mb-6">
        {SCREENING_QUESTIONS.map((q, i) => {
          const val = j.screening[q.id];
          const isFail = val !== null && val === q.failsWhen;
          return (
            <div key={q.id} className={cn(
              "rounded-2xl border p-4 transition-colors",
              isFail ? "border-status-orange/50 bg-status-orange-soft/40" :
              val !== null ? "border-bingo-green/40 bg-bingo-green-light/30" : "border-bingo-gray-150 bg-white"
            )}>
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="min-w-0">
                  <p className="text-[14.5px] font-semibold text-bingo-black">{i + 1}. {q.text}</p>
                  {q.helper && <p className="text-[11.5px] text-bingo-gray-500 mt-0.5">{q.helper}</p>}
                </div>
                <div className="b-segment shrink-0">
                  <button data-active={val === "yes"} onClick={() => patch({ screening: { ...j.screening, [q.id]: "yes" } })}>כן</button>
                  <button data-active={val === "no"} onClick={() => patch({ screening: { ...j.screening, [q.id]: "no" } })}>לא</button>
                </div>
              </div>
              {isFail && (
                <p className="text-[12px] font-semibold text-status-orange mt-2 flex items-center gap-1.5">
                  <AlertTriangle className="size-3.5" /> תשובה פוסלת למסלול כל מטרה — בסיום נבדוק מסלול רכב
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* ramzor */}
      <div className="rounded-2xl border border-bingo-gray-150 p-4 mb-6">
        <p className="text-[14.5px] font-semibold text-bingo-black mb-3">בדיקת רמזור (חיווי אשראי בנק ישראל)</p>
        <div className="grid grid-cols-3 gap-2.5">
          {([
            { v: "green",  label: "ירוק — תקין",  cls: "border-bingo-green bg-bingo-green-light/60 text-bingo-green-deep" },
            { v: "yellow", label: "צהוב",          cls: "border-status-yellow bg-status-yellow-soft text-[#8a6d00]" },
            { v: "red",    label: "אדום",          cls: "border-status-red bg-status-red-soft text-status-red" },
          ] as const).map((o) => (
            <button
              key={o.v}
              onClick={() => patch({ ramzor: o.v })}
              className={cn(
                "h-16 rounded-2xl border-2 font-bold text-[14px] transition-all flex items-center justify-center gap-2",
                j.ramzor === o.v ? o.cls + " scale-[1.02] shadow-sm" : "border-bingo-gray-150 bg-white text-bingo-gray-500 hover:border-bingo-gray-300"
              )}
            >
              <span className={cn("size-4 rounded-full", o.v === "green" ? "bg-bingo-green" : o.v === "yellow" ? "bg-status-yellow" : "bg-status-red")} />
              {o.label}
            </button>
          ))}
        </div>
      </div>

      {/* live verdict + CTA */}
      <div className={cn(
        "rounded-2xl p-4 flex items-center justify-between gap-3 flex-wrap",
        !complete ? "bg-bingo-gray-50 border border-bingo-gray-150" :
        failed ? "bg-status-orange-soft border border-status-orange/40" :
        "bg-bingo-green-light border border-bingo-green/40"
      )}>
        <p className="text-[13.5px] font-semibold text-bingo-black">
          {!complete ? `נותרו ${SCREENING_QUESTIONS.filter((q) => j.screening[q.id] === null).length + (j.ramzor === null ? 1 : 0)} שאלות` :
           failed ? "הלקוח נפסל למסלול כל מטרה — עוברים לשאלת רכב" :
           "הלקוח תקין לגמרי ✓ — ממשיכים למסלול הלוואה לכל מטרה"}
        </p>
        <button onClick={onFinish} disabled={!complete} className={cn("b-pill", complete ? "b-pill-dark" : "b-pill-ghost opacity-40 cursor-not-allowed")}>
          המשך <ChevronLeft className="size-4" />
        </button>
      </div>
    </section>
  );
}

/* ============================================================
   VEHICLE PIVOT — the automatic question that saves the deal
   ============================================================ */
function VehiclePivotStage({ onAnswer }: { onAnswer: (has: boolean) => void }) {
  return (
    <section className="b-card p-8 text-center border-2 border-status-blue/30">
      <span className="b-icon b-icon-blue size-16 mx-auto mb-4"><Car className="size-8" /></span>
      <p className="b-eyebrow mb-2">שאלה קריטית — אל תדלג</p>
      <h2 className="text-[24px] font-bold text-bingo-black mb-2">"האם יש בבעלותך רכב?"</h2>
      <p className="text-[13.5px] text-bingo-gray-500 mb-6 max-w-md mx-auto">
        הלקוח נפסל למסלול כל מטרה — אבל עם רכב בבעלותו אפשר להמשיך במסלול הלוואה כנגד רכב.
      </p>
      <div className="flex items-center justify-center gap-3">
        <button onClick={() => onAnswer(true)} className="b-pill b-pill-green b-pill-lg">
          <Check className="size-5" strokeWidth={3} /> כן, יש רכב
        </button>
        <button onClick={() => onAnswer(false)} className="b-pill b-pill-ghost b-pill-lg">
          <X className="size-5" /> אין רכב
        </button>
      </div>
    </section>
  );
}

/* ============================================================
   QUESTIONNAIRE — per track
   ============================================================ */
function QuestionnaireStage({ j, patch, onFinish }: { j: JourneyState; patch: (p: Partial<JourneyState>) => void; onFinish: () => void }) {
  const vehicle = j.track === "vehicle";
  const ready = vehicle
    ? !!(j.vehicleYear && j.vehicleMake && j.vehicleFree !== null && j.vehicleFree !== undefined)
    : !!(j.employment && j.monthlyIncome && j.bankName && j.amountRequested);

  return (
    <section className="b-card p-6">
      <StageHeader
        icon={vehicle ? <Car className="size-5" /> : <Banknote className="size-5" />}
        tone={vehicle ? "blue" : "green"}
        title={vehicle ? "שאלון מסלול רכב" : "שאלון הלוואה לכל מטרה"}
        subtitle="מלא תוך כדי שיחה — הכל נשמר אוטומטית"
      />
      {vehicle ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <Field label="שנת ייצור הרכב">
            <input className="b-input" inputMode="numeric" placeholder="2020" value={j.vehicleYear || ""} onChange={(e) => patch({ vehicleYear: e.target.value })} />
          </Field>
          <Field label="יצרן ודגם">
            <input className="b-input" placeholder="טויוטה קורולה" value={j.vehicleMake || ""} onChange={(e) => patch({ vehicleMake: e.target.value })} />
          </Field>
          <Field label="האם הרכב נקי משעבוד?">
            <div className="b-segment w-full">
              <button className="flex-1" data-active={j.vehicleFree === "yes"} onClick={() => patch({ vehicleFree: "yes" })}>כן, נקי</button>
              <button className="flex-1" data-active={j.vehicleFree === "no"} onClick={() => patch({ vehicleFree: "no" })}>משועבד</button>
            </div>
          </Field>
          <Field label="סכום מבוקש (₪)">
            <input className="b-input" inputMode="numeric" placeholder="80,000" value={j.amountRequested || ""} onChange={(e) => patch({ amountRequested: e.target.value })} />
          </Field>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <Field label="תעסוקה">
            <div className="b-segment w-full">
              {["שכיר", "עצמאי", "פנסיונר"].map((o) => (
                <button key={o} className="flex-1" data-active={j.employment === o} onClick={() => patch({ employment: o })}>{o}</button>
              ))}
            </div>
          </Field>
          <Field label="הכנסה חודשית נטו (₪)">
            <input className="b-input" inputMode="numeric" placeholder="12,000" value={j.monthlyIncome || ""} onChange={(e) => patch({ monthlyIncome: e.target.value })} />
          </Field>
          <Field label="בנק">
            <input className="b-input" placeholder="הפועלים" value={j.bankName || ""} onChange={(e) => patch({ bankName: e.target.value })} />
          </Field>
          <Field label="סכום מבוקש (₪)">
            <input className="b-input" inputMode="numeric" placeholder="100,000" value={j.amountRequested || ""} onChange={(e) => patch({ amountRequested: e.target.value })} />
          </Field>
        </div>
      )}
      <div className="flex justify-end">
        <button onClick={onFinish} disabled={!ready} className={cn("b-pill", ready ? "b-pill-dark" : "b-pill-ghost opacity-40 cursor-not-allowed")}>
          המשך להסכם התקשרות <ChevronLeft className="size-4" />
        </button>
      </div>
    </section>
  );
}

/* ============================================================
   CONTRACT — send + signed
   ============================================================ */
function ContractStage({ j, lead, onSend, onSigned }: { j: JourneyState; lead: Lead; onSend: (via: "whatsapp" | "sms") => void; onSigned: () => void }) {
  return (
    <section className="b-card p-6">
      <StageHeader icon={<FileSignature className="size-5" />} tone="purple" title="הסכם התקשרות"
        subtitle="שלח לחתימה דיגיטלית — הלקוח חותם מהנייד תוך 30 שניות" />

      <div className="rounded-2xl bg-bingo-gray-50 border border-bingo-gray-150 p-4 mb-5 text-[13px] text-bingo-gray-600 leading-relaxed">
        שלום {lead.fullName?.split(" ")[0]}, מצורף הסכם ההתקשרות עם בינגו —
        {" "}{j.track === "vehicle" ? "מסלול הלוואה כנגד רכב" : "מסלול הלוואה לכל מטרה"}
        {j.amountRequested ? ` על סך ${j.amountRequested} ₪` : ""}.
        {" "}לחתימה: <span className="text-bingo-blue underline">bingo.co.il/sign/{lead.id}</span>
      </div>

      {!j.contractSentAt ? (
        <div className="flex items-center gap-3">
          <button onClick={() => onSend("whatsapp")} className="b-pill b-pill-green flex-1"><MessageCircle className="size-4" /> שלח ב-WhatsApp</button>
          <button onClick={() => onSend("sms")} className="b-pill b-pill-ghost flex-1"><Send className="size-4" /> שלח ב-SMS</button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-[13.5px] font-semibold text-bingo-green-dark">
            <CheckCircle2 className="size-4" />
            נשלח ב-{j.contractSentVia === "whatsapp" ? "WhatsApp" : "SMS"} · {new Date(j.contractSentAt).toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" })}
          </div>
          <div className="rounded-2xl border-2 border-dashed border-bingo-gray-200 p-5 text-center">
            <p className="text-[13px] text-bingo-gray-500 mb-3">ברגע שהלקוח חותם — לחץ כאן. המערכת תיצור אוטומטית משימת חזרה בעוד שעה.</p>
            <button onClick={onSigned} className="b-pill b-pill-green b-pill-lg mx-auto">
              <FileSignature className="size-5" /> הלקוח חתם ✓
            </button>
          </div>
          <button onClick={() => onSend(j.contractSentVia === "whatsapp" ? "sms" : "whatsapp")} className="text-[12px] text-bingo-gray-400 hover:text-bingo-gray-600">
            שלח שוב בערוץ אחר
          </button>
        </div>
      )}
    </section>
  );
}

/* ============================================================
   COOLDOWN — the automatic +1 hour callback
   ============================================================ */
function CooldownStage({ j, onReady }: { j: JourneyState; onReady: () => void }) {
  const [now, setNow] = React.useState(Date.now());
  React.useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const due = j.callbackDueAt ? new Date(j.callbackDueAt).getTime() : now;
  const remain = Math.max(0, due - now);
  const ready = remain === 0;
  const mm = String(Math.floor(remain / 60000)).padStart(2, "0");
  const ss = String(Math.floor((remain % 60000) / 1000)).padStart(2, "0");

  return (
    <section className="b-card p-8 text-center">
      <span className={cn("b-icon size-16 mx-auto mb-4", ready ? "b-icon-green" : "b-icon-orange")}>
        <AlarmClock className="size-8" />
      </span>
      <p className="b-eyebrow mb-1">משימה אוטומטית — נוצרה ברגע החתימה</p>
      <h2 className="text-[22px] font-bold text-bingo-black mb-1">
        {ready ? "הגיע הזמן — חזור ללקוח עכשיו!" : "חזרה ללקוח בעוד"}
      </h2>
      {!ready && (
        <div className="font-mono text-[56px] font-bold text-bingo-black tabular-nums leading-none my-4">
          {mm}:{ss}
        </div>
      )}
      <p className="text-[13px] text-bingo-gray-500 mb-6 max-w-md mx-auto">
        {j.track === "vehicle"
          ? "בשיחה הבאה: בקש מהלקוח את 4 המסמכים (רישיון רכב, ת.ז, רישיון נהיגה, אישור ניהול חשבון)"
          : "בשיחה הבאה: מריצים בדיקות זכאות בכל גופי המימון ומשקפים תוצאות"}
      </p>
      <div className="flex items-center justify-center gap-3">
        <button onClick={onReady} className={cn("b-pill b-pill-lg", ready ? "b-pill-green animate-pulse-green" : "b-pill-dark")}>
          <Phone className="size-5" /> {ready ? "התקשר ללקוח" : "הלקוח זמין עכשיו — דלג על ההמתנה"}
        </button>
      </div>
    </section>
  );
}

/* ============================================================
   CHECKS — general track, all lenders, WITH LOGOS
   ============================================================ */
function ChecksStage({ j, patch, onFinish }: { j: JourneyState; patch: (p: Partial<JourneyState>) => void; onFinish: () => void }) {
  const answered = JOURNEY_LENDERS.filter((l) => j.lenderResults[l.key]?.outcome === "approved" || j.lenderResults[l.key]?.outcome === "rejected").length;
  const approved = JOURNEY_LENDERS.filter((l) => j.lenderResults[l.key]?.outcome === "approved").length;

  function setResult(key: string, r: Partial<import("@/lib/journey").LenderResult>) {
    patch({ lenderResults: { ...j.lenderResults, [key]: { ...(j.lenderResults[key] || { outcome: null }), ...r } } });
  }

  return (
    <section className="b-card p-6">
      <StageHeader icon={<ShieldCheck className="size-5" />} tone="green" title="בדיקות זכאות — כל הגופים"
        subtitle={`הוזנו ${answered}/${JOURNEY_LENDERS.length} · ${approved} אישורים`} />

      <div className="space-y-2.5 mb-5">
        {JOURNEY_LENDERS.map((l) => {
          const r = j.lenderResults[l.key];
          const st = r?.outcome ?? null;
          return (
            <div key={l.key} className={cn(
              "rounded-2xl border p-3.5 transition-colors",
              st === "approved" ? "border-bingo-green/50 bg-bingo-green-light/30" :
              st === "rejected" ? "border-bingo-gray-200 bg-bingo-gray-50 opacity-75" :
              "border-bingo-gray-150 bg-white"
            )}>
              <div className="flex items-center gap-3 flex-wrap">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={lenderLogo(l.domain)} alt={l.name} className="size-9 rounded-xl border border-bingo-gray-150 bg-white object-contain p-1 shrink-0" />
                <div className="min-w-0 flex-1">
                  <span className="text-[14px] font-bold text-bingo-black">{l.name}</span>
                  {l.botSupported && <span className="b-chip b-chip-gray text-[10px] py-0 px-2 mr-2">🤖 בוט</span>}
                </div>
                <div className="b-segment shrink-0">
                  <button data-active={st === "approved"} onClick={() => setResult(l.key, { outcome: "approved" })}>אושר</button>
                  <button data-active={st === "rejected"} onClick={() => setResult(l.key, { outcome: "rejected" })}>נדחה</button>
                </div>
              </div>
              {st === "approved" && (
                <div className="grid grid-cols-3 gap-2.5 mt-3">
                  <input className="b-input h-10 text-[13px]" inputMode="numeric" placeholder="סכום ₪" value={r?.amount ?? ""} onChange={(e) => setResult(l.key, { amount: e.target.value ? Number(e.target.value) : null })} />
                  <input className="b-input h-10 text-[13px]" inputMode="decimal" placeholder="ריבית %" value={r?.rate ?? ""} onChange={(e) => setResult(l.key, { rate: e.target.value ? Number(e.target.value) : null })} />
                  <input className="b-input h-10 text-[13px]" inputMode="numeric" placeholder="חודשים" value={r?.months ?? ""} onChange={(e) => setResult(l.key, { months: e.target.value ? Number(e.target.value) : null })} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between gap-3 flex-wrap">
        <p className="text-[12.5px] text-bingo-gray-500">אפשר לסיים גם בלי להזין את כולם</p>
        <button onClick={onFinish} disabled={answered === 0} className={cn("b-pill", answered > 0 ? "b-pill-dark" : "b-pill-ghost opacity-40 cursor-not-allowed")}>
          סיים בדיקות — שקף ללקוח <ChevronLeft className="size-4" />
        </button>
      </div>
    </section>
  );
}

/* ============================================================
   DOCS — vehicle track, the 4 documents
   ============================================================ */
function DocsStage({ j, patch, onAllIn, onApproval }: {
  j: JourneyState; patch: (p: Partial<JourneyState>) => void;
  onAllIn: () => void; onApproval: (amount: number, rate: number, months: number) => void;
}) {
  const received = VEHICLE_DOCS.filter((d) => j.docsReceived[d.id]).length;
  const all = received === VEHICLE_DOCS.length;
  const [amount, setAmount] = React.useState("");
  const [rate, setRate] = React.useState("");
  const [months, setMonths] = React.useState("");

  return (
    <section className="b-card p-6">
      <StageHeader icon={<Upload className="size-5" />} tone="blue" title="מסמכים — מסלול רכב"
        subtitle={`התקבלו ${received}/4 מסמכים`} />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-5">
        {VEHICLE_DOCS.map((d) => {
          const got = !!j.docsReceived[d.id];
          return (
            <button
              key={d.id}
              onClick={() => patch({ docsReceived: { ...j.docsReceived, [d.id]: !got } })}
              className={cn(
                "rounded-2xl border-2 p-4 flex items-center gap-3 text-right transition-all",
                got ? "border-bingo-green bg-bingo-green-light/40" : "border-bingo-gray-150 bg-white hover:border-bingo-gray-300"
              )}
            >
              <span className={cn("size-7 rounded-full flex items-center justify-center shrink-0", got ? "bg-bingo-green text-bingo-black" : "bg-bingo-gray-100 text-bingo-gray-400")}>
                {got ? <Check className="size-4" strokeWidth={3} /> : <Clock className="size-3.5" />}
              </span>
              <span className="text-[14px] font-semibold text-bingo-black">{d.label}</span>
            </button>
          );
        })}
      </div>

      {!j.docsUploadedAt ? (
        <button onClick={onAllIn} disabled={!all} className={cn("b-pill w-full", all ? "b-pill-green" : "b-pill-ghost opacity-40 cursor-not-allowed")}>
          <Upload className="size-4" /> כל המסמכים בידי — העלה לגוף המימון
        </button>
      ) : (
        <div className="rounded-2xl border-2 border-bingo-green/40 bg-bingo-green-light/30 p-5">
          <p className="text-[14px] font-bold text-bingo-black mb-1 flex items-center gap-2">
            <Sparkles className="size-4 text-bingo-green-dark" /> המסמכים הועלו — האישור מגיע תוך דקות
          </p>
          <p className="text-[12.5px] text-bingo-gray-500 mb-4">כשהאישור הסופי מתקבל מהגוף — הזן אותו כאן:</p>
          <div className="grid grid-cols-3 gap-2.5 mb-3">
            <input className="b-input h-11" inputMode="numeric" placeholder="סכום מאושר ₪" value={amount} onChange={(e) => setAmount(e.target.value)} />
            <input className="b-input h-11" inputMode="decimal" placeholder="ריבית %" value={rate} onChange={(e) => setRate(e.target.value)} />
            <input className="b-input h-11" inputMode="numeric" placeholder="חודשים" value={months} onChange={(e) => setMonths(e.target.value)} />
          </div>
          <button
            onClick={() => onApproval(Number(amount), Number(rate), Number(months))}
            disabled={!amount}
            className={cn("b-pill w-full", amount ? "b-pill-green" : "b-pill-ghost opacity-40 cursor-not-allowed")}
          >
            <Trophy className="size-4" /> התקבל אישור סופי!
          </button>
        </div>
      )}
    </section>
  );
}

/* ============================================================
   RESULTS — reflect to customer, choose offer
   ============================================================ */
function ResultsStage({ j, onChoose, onVehicleProceed }: { j: JourneyState; onChoose: (key: string) => void; onVehicleProceed: () => void }) {
  if (j.track === "vehicle") {
    const a = j.finalApproval;
    return (
      <section className="b-card p-6 text-center">
        <span className="b-icon b-icon-green size-16 mx-auto mb-4"><Trophy className="size-8" /></span>
        <h2 className="text-[22px] font-bold text-bingo-black mb-1">אישור סופי — הצג ללקוח 🎉</h2>
        <div className="max-w-sm mx-auto rounded-2xl border border-bingo-green/40 bg-bingo-green-light/30 p-5 my-5">
          <div className="text-[36px] font-bold text-bingo-black tabular-nums leading-none">{a?.amount ? formatCurrency(a.amount) : "—"}</div>
          <div className="text-[13px] text-bingo-gray-600 mt-2 tabular-nums">ריבית {a?.rate ?? "—"}% · {a?.months ?? "—"} תשלומים</div>
        </div>
        <button onClick={onVehicleProceed} className="b-pill b-pill-green b-pill-lg mx-auto">
          <Check className="size-5" strokeWidth={3} /> הלקוח מאשר — ממשיכים
        </button>
      </section>
    );
  }

  const offers = JOURNEY_LENDERS
    .map((l) => ({ ...l, r: j.lenderResults[l.key] }))
    .filter((l) => l.r?.outcome === "approved")
    .sort((a, b) => (b.r?.amount || 0) - (a.r?.amount || 0));

  return (
    <section className="b-card p-6">
      <StageHeader icon={<Trophy className="size-5" />} tone="green" title="שיקוף תוצאות ללקוח"
        subtitle={offers.length ? `${offers.length} אישורים — עבור עליהם עם הלקוח ובחרו יחד` : "אין אישורים — שקול מסלול רכב או יציאה"} />

      {offers.length > 0 ? (
        <div className="space-y-2.5">
          {offers.map((o, i) => (
            <div key={o.key} className={cn(
              "rounded-2xl border p-4 flex items-center gap-3 flex-wrap",
              i === 0 ? "border-bingo-green/60 bg-bingo-green-light/30" : "border-bingo-gray-150"
            )}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={lenderLogo(o.domain)} alt={o.name} className="size-10 rounded-xl border border-bingo-gray-150 bg-white object-contain p-1" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[15px] font-bold text-bingo-black">{o.name}</span>
                  {i === 0 && <span className="b-chip b-chip-green text-[10.5px]">ההצעה הטובה ביותר</span>}
                </div>
                <div className="text-[13px] text-bingo-gray-500 tabular-nums">
                  {o.r?.amount ? formatCurrency(o.r.amount) : "—"} · ריבית {o.r?.rate ?? "—"}% · {o.r?.months ?? "—"} חודשים
                </div>
              </div>
              <button onClick={() => onChoose(o.key)} className="b-pill b-pill-dark b-pill-sm">הלקוח בחר בזה</button>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border-2 border-dashed border-bingo-gray-200 p-8 text-center">
          <XCircle className="size-8 text-bingo-gray-300 mx-auto mb-2" />
          <p className="text-[13.5px] text-bingo-gray-500">כל הגופים דחו. {j.hasVehicle ? "ללקוח יש רכב — הצע מסלול רכב!" : "בדוק אם יש רכב בבעלותו."}</p>
        </div>
      )}
    </section>
  );
}

/* ============================================================
   AWAITING LOAN + PAYMENT + DONE + EXIT
   ============================================================ */
function AwaitingStage({ j, onAdvance }: { j: JourneyState; onAdvance: () => void }) {
  const dueTxt = j.paymentDueAt ? new Date(j.paymentDueAt).toLocaleDateString("he-IL", { weekday: "long", day: "numeric", month: "long" }) : "";
  return (
    <section className="b-card p-8 text-center">
      <span className="b-icon b-icon-blue size-16 mx-auto mb-4"><Clock className="size-8" /></span>
      <h2 className="text-[22px] font-bold text-bingo-black mb-1">ממתין להעברת ההלוואה</h2>
      <p className="text-[13.5px] text-bingo-gray-500 mb-2">ההלוואה תגיע ללקוח תוך מספר ימים.</p>
      <p className="text-[13px] font-semibold text-bingo-black mb-6">
        ⏰ משימת תשלום אוטומטית: <span className="text-bingo-green-dark">{dueTxt}</span>
      </p>
      <button onClick={onAdvance} className="b-pill b-pill-dark mx-auto"><Banknote className="size-4" /> ההלוואה הגיעה — עבור לתשלום</button>
    </section>
  );
}

function PaymentStage({ j, patch, onPaid }: { j: JourneyState; patch: (p: Partial<JourneyState>) => void; onPaid: () => void }) {
  return (
    <section className="b-card p-6">
      <StageHeader icon={<Banknote className="size-5" />} tone="green" title="גביית תשלום על השירות"
        subtitle="השלב האחרון — עמלת בינגו" />
      <div className="max-w-sm space-y-4">
        <Field label="סכום העמלה (₪)">
          <input className="b-input" inputMode="numeric" placeholder="2,500" value={j.feeAmount || ""} onChange={(e) => patch({ feeAmount: e.target.value })} />
        </Field>
        <button onClick={onPaid} disabled={!j.feeAmount} className={cn("b-pill b-pill-lg w-full", j.feeAmount ? "b-pill-green" : "b-pill-ghost opacity-40 cursor-not-allowed")}>
          <CheckCircle2 className="size-5" /> התשלום התקבל
        </button>
      </div>
    </section>
  );
}

function DoneStage({ j, lead }: { j: JourneyState; lead: Lead }) {
  return (
    <section className="b-card p-10 text-center border-2 border-bingo-green/40">
      <span className="b-icon b-icon-green size-20 mx-auto mb-4"><PartyPopper className="size-10" /></span>
      <h2 className="text-[26px] font-bold text-bingo-black mb-1">העסקה הושלמה! 🎉</h2>
      <p className="text-[14px] text-bingo-gray-500">
        {lead.fullName} · {j.track === "vehicle" ? "הלוואה כנגד רכב" : "הלוואה לכל מטרה"}
        {j.feeAmount ? ` · עמלה ${j.feeAmount} ₪` : ""}
      </p>
      <Link href="/dialer/cockpit" className="b-pill b-pill-dark mx-auto mt-6 inline-flex">
        <Phone className="size-4" /> ללקוח הבא בתותח
      </Link>
    </section>
  );
}

function ExitStage({ j, onReopen }: { j: JourneyState; onReopen: () => void }) {
  return (
    <section className="b-card p-8 text-center">
      <span className="b-icon b-icon-gray size-16 mx-auto mb-4"><XCircle className="size-8" /></span>
      <h2 className="text-[22px] font-bold text-bingo-black mb-1">הליד יצא מהמשפך</h2>
      <p className="text-[13.5px] text-bingo-gray-500 mb-6">{j.exitReason || "לא צוינה סיבה"}</p>
      <button onClick={onReopen} className="b-pill b-pill-ghost mx-auto"><RotateCcw className="size-4" /> פתח מחדש</button>
    </section>
  );
}

/* ============================================================
   SHARED BITS
   ============================================================ */
function StageHeader({ icon, tone, title, subtitle }: { icon: React.ReactNode; tone: "green" | "blue" | "purple" | "orange"; title: string; subtitle?: string }) {
  const cls = { green: "b-icon-green", blue: "b-icon-blue", purple: "b-icon-purple", orange: "b-icon-orange" }[tone];
  return (
    <header className="flex items-center gap-3 mb-5">
      <span className={cn("b-icon size-11", cls)}>{icon}</span>
      <div>
        <h2 className="text-[17px] font-bold text-bingo-black">{title}</h2>
        {subtitle && <p className="text-[12.5px] text-bingo-gray-500">{subtitle}</p>}
      </div>
    </header>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[12.5px] font-semibold text-bingo-gray-600 mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function RamzorBadge({ ramzor }: { ramzor: import("@/lib/journey").Ramzor }) {
  if (!ramzor) return null;
  const map = {
    green:  { label: "רמזור ירוק",  cls: "b-chip-green" },
    yellow: { label: "רמזור צהוב", cls: "b-chip-orange" },
    red:    { label: "רמזור אדום",  cls: "b-chip-red" },
  }[ramzor];
  return (
    <span className={cn("b-chip", map.cls)}>
      <span className={cn("size-2.5 rounded-full", ramzor === "green" ? "bg-bingo-green" : ramzor === "yellow" ? "bg-status-yellow" : "bg-status-red")} />
      {map.label}
    </span>
  );
}

function CallbackModal({ onClose, onSet }: { onClose: () => void; onSet: (when: string, note: string) => void }) {
  const [note, setNote] = React.useState("");
  const options = [
    { label: "בעוד שעה", h: 1 },
    { label: "בעוד 3 שעות", h: 3 },
    { label: "מחר בבוקר (10:00)", h: -1 },
    { label: "בעוד יומיים", h: 48 },
  ];
  function pick(o: { label: string; h: number }) {
    onSet(o.label, note);
  }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-bingo-black/40 p-4" onClick={onClose}>
      <div className="b-card p-6 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-[17px] font-bold text-bingo-black mb-1">קבע חזרה ללקוח</h3>
        <p className="text-[12.5px] text-bingo-gray-500 mb-4">תיווצר משימה ותופיע בלוח המשימות שלך</p>
        <div className="grid grid-cols-2 gap-2 mb-3">
          {options.map((o) => (
            <button key={o.label} onClick={() => pick(o)} className="b-pill b-pill-ghost b-pill-sm">{o.label}</button>
          ))}
        </div>
        <input className="b-input h-10 text-[13px] mb-3" placeholder="הערה (אופציונלי)" value={note} onChange={(e) => setNote(e.target.value)} />
        <button onClick={onClose} className="text-[12px] text-bingo-gray-400 hover:text-bingo-gray-600 w-full text-center">ביטול</button>
      </div>
    </div>
  );
}
