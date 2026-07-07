"use client";
/**
 * RamzorModal — במת הרמזור (הדגמה 02 בקונספט): מודאל מסך-מלא עם רקע זכוכית,
 * הרמזור הפיזי, נוסח ההסכמה בגודל טלפרומפטר וכפתור אחד.
 * הסכמה → נרשם Activity + bdiClientApproval=ירוק → סריקה ~2 שניות →
 * תוצאה (אוטומטית אם smileyAuto קיים, אחרת בחירה ידנית על העדשות) →
 * פאנל ניתוב: ירוק=כתובת+הסכם · כתום/שער שנכשל=רכב · אדום=פרידה מכובדת.
 * Esc סוגר בכל שלב — שום נתון לא הולך לאיבוד (הכל כבר נשמר).
 */
import * as React from "react";
import { X, Send, PartyPopper, Car, CarFront, DoorOpen, Loader2 } from "lucide-react";
import { Ramzor, type RamzorValue } from "@/components/ui/Ramzor";
import { Confetti } from "@/components/ui/Confetti";
import type { ClassicValues } from "@/lib/yoatsim/values";
import { cn } from "@/lib/utils";
import { toRamzor, ramzorToDb } from "./shared";

const CONSENT_TEXT =
  "הלקוח אישר בדיקת רמזור במאגר BDI — הוקרא הנוסח המלא";

const GENERAL_FORM = "הלוואה לכל מטרה – בינגו";
const VEHICLE_FORM = "הלוואה כנגד רכב – בינגו";

type Phase = "consent" | "scanning" | "choose" | "route";

export function RamzorModal({ open, flagged, values, set, addNote, addProcess, sendForm, onClose }: {
  open: boolean;
  /** שער סינון נכשל — ניתוב לרכב גם ברמזור ירוק */
  flagged: boolean;
  values: ClassicValues;
  set: (key: string, value: ClassicValues[string]) => void;
  addNote: (type: string, text: string) => void;
  addProcess: (processKey: string) => Promise<void>;
  /** שליחת טופס דרך /api/forms — מחזיר הצלחה */
  sendForm: (templateName: string) => Promise<boolean>;
  onClose: () => void;
}) {
  const [phase, setPhase] = React.useState<Phase>("consent");
  const [result, setResult] = React.useState<RamzorValue | null>(null);
  const [sending, setSending] = React.useState(false);
  const [closing, setClosing] = React.useState(false);
  const [confetti, setConfetti] = React.useState(0);
  const [vehicleChoice, setVehicleChoice] = React.useState<"" | "כן" | "כן משועבד" | "אין">("");
  const dialogRef = React.useRef<HTMLDivElement>(null);
  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  /* ערכים חיים לתוך ה-timeout של הסריקה */
  const valuesRef = React.useRef(values);
  valuesRef.current = values;

  /* איפוס בפתיחה: אם כבר יש תוצאת רמזור — ישר לפאנל הניתוב (בלי הסכמה כפולה) */
  React.useEffect(() => {
    if (!open) return;
    const existing = toRamzor(values.smileyAuto) ?? toRamzor(values.smileyManual);
    setPhase(existing ? "route" : "consent");
    setResult(existing);
    setSending(false);
    setClosing(false);
    setVehicleChoice("");
    // eslint-disable-next-line react-hooks/exhaustive-deps -- מאתחלים רק ברגע הפתיחה
  }, [open]);

  React.useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  /* פוקוס + מלכודת מקלדת */
  React.useEffect(() => {
    if (!open) return;
    dialogRef.current?.focus();
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key === "Tab" && dialogRef.current) {
        const focusables = dialogRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        const active = document.activeElement;
        if (e.shiftKey && (active === first || active === dialogRef.current)) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && active === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", handler, true);
    return () => window.removeEventListener("keydown", handler, true);
  }, [open, onClose]);

  if (!open) return null;

  /* ---------- ההסכמה: Activity + אישור לקוח, ואז סריקה ---------- */
  const runCheck = () => {
    addNote("system", CONSENT_TEXT);
    set("bdiClientApproval", "green");
    setPhase("scanning");
    timerRef.current = setTimeout(() => {
      const auto = toRamzor(valuesRef.current.smileyAuto);
      if (auto) {
        setResult(auto);
        setPhase("route");
      } else {
        setPhase("choose");
      }
    }, 2000);
  };

  const chooseManual = (v: RamzorValue) => {
    set("smileyManual", ramzorToDb(v));
    setResult(v);
    setPhase("route");
  };

  /* ---------- ניתוב ---------- */
  const routing: "green" | "vehicle" | "red" | null =
    phase !== "route" || !result ? null
      : result === "red" ? "red"
        : result === "orange" || flagged ? "vehicle"
          : "green";

  const sendAgreement = async (templateName: string, celebrate: boolean) => {
    if (sending || closing) return;
    setSending(true);
    const ok = await sendForm(templateName);
    setSending(false);
    if (!ok) return;
    if (celebrate) setConfetti((c) => c + 1);
    setClosing(true);
    timerRef.current = setTimeout(onClose, celebrate ? 1200 : 500);
  };

  const closeLead = async () => {
    if (sending || closing) return;
    setSending(true);
    await addProcess("not-interested");
    setSending(false);
    setClosing(true);
    timerRef.current = setTimeout(onClose, 400);
  };

  const scriptScale = "text-[18px] sm:text-[19px] font-extrabold leading-[1.6]";

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center p-4 sm:p-8"
      style={{ background: "rgba(38,37,31,.35)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)" }}
      role="dialog"
      aria-modal="true"
      aria-label="בדיקת רמזור"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <Confetti trigger={confetti} count={16} />
      <div
        ref={dialogRef}
        tabIndex={-1}
        className="b-spring-in relative w-full max-w-[860px] max-h-full overflow-y-auto rounded-[30px] outline-none"
        style={{
          background: "linear-gradient(165deg, var(--b-obsidian-1, #3B3A34), var(--b-obsidian-2, #211F1B) 60%, var(--b-obsidian-3, #191813))",
          border: "1px solid rgba(255,255,255,.1)",
          boxShadow: "0 40px 90px -20px rgba(0,0,0,.55), inset 0 1.5px 0 rgba(255,255,255,.12)",
          padding: 10,
        }}
      >
        {/* הבמה הפנימית */}
        <div
          className="rounded-[22px] p-6 sm:p-8"
          style={{
            background: "radial-gradient(560px 320px at 78% 12%, var(--b-tint-lilac-1), transparent 65%), linear-gradient(180deg, var(--color-bingo-white, #fff), #FCFBF9)",
          }}
        >
          <button
            type="button"
            onClick={onClose}
            className="b-lift absolute top-5 left-5 size-9 rounded-full bg-black/20 text-white flex items-center justify-center hover:bg-black/35"
            aria-label="סגירה (Esc) — הכל נשמר"
          >
            <X className="size-4" />
          </button>

          <div className="grid grid-cols-1 sm:grid-cols-[auto_1fr] gap-7 sm:gap-9 items-center">
            {/* הרמזור */}
            <div className="justify-self-center">
              <Ramzor
                size="lg"
                value={phase === "scanning" ? null : result}
                state={phase === "scanning" ? "scanning" : "idle"}
                onSelect={phase === "choose" ? chooseManual : undefined}
              />
            </div>

            {/* צד הטקסט */}
            <div className="min-w-0">
              {(phase === "consent" || phase === "scanning") && (
                <div className="b-spring-in">
                  <h3 className="text-[22px] font-black text-bingo-black mb-2.5">בדיקת רמזור</h3>
                  <div className={cn("b-glass rounded-2xl px-5 py-4 text-bingo-black text-balance", scriptScale)}>
                    &quot;לפני שנמשיך אני צריך את האישור שלך: האם את/ה{" "}
                    <mark className="bg-transparent text-bingo-green-dark font-black">
                      מאשר/ת לי לבצע בדיקה על נתוני האשראי שלך במאגר BDI
                    </mark>
                    ? הבדיקה לא כרוכה בעלות ולא מחייבת אותך.&quot;
                  </div>
                  <p className={cn(
                    "mt-3.5 text-[14px] font-extrabold min-h-6",
                    phase === "scanning" ? "text-bingo-gray-500" : "text-bingo-gray-400",
                  )}>
                    {phase === "scanning" ? "מריץ בדיקה מול המאגר…" : "ממתין להקראה ולאישור הלקוח"}
                  </p>
                  <button
                    type="button"
                    disabled={phase === "scanning"}
                    onClick={runCheck}
                    className="b-lift mt-4 rounded-full px-8 py-3.5 text-[15px] font-black disabled:opacity-50 disabled:pointer-events-none"
                    style={{
                      background: "linear-gradient(150deg, #6DFF33, #46E607)",
                      color: "#123307",
                      boxShadow: "0 14px 34px -12px var(--b-glow-green), inset 0 1.5px 0 rgba(255,255,255,.55)",
                    }}
                  >
                    {phase === "scanning" ? "בודק…" : "הלקוח אישר — הפעל בדיקה"}
                  </button>
                  <p className="mt-2.5 text-[11px] text-bingo-gray-400">
                    ההסכמה נרשמת כאירוע עם חותמת זמן ונוסח מדויק.
                  </p>
                </div>
              )}

              {phase === "choose" && (
                <div className="b-spring-in">
                  <h3 className="text-[22px] font-black text-bingo-black mb-2">מה הראה המאגר?</h3>
                  <p className="text-[14.5px] text-bingo-gray-500">
                    אין תוצאת אוטומציה לליד הזה — בחר את הצבע שהתקבל בבדיקה, ישירות על עדשות הרמזור.
                  </p>
                </div>
              )}

              {/* ---------- פאנלי הניתוב ---------- */}
              {routing === "green" && (
                <GreenPanel
                  values={values}
                  set={set}
                  sending={sending}
                  closing={closing}
                  onSend={() => void sendAgreement(GENERAL_FORM, true)}
                />
              )}
              {routing === "vehicle" && (
                <VehiclePanel
                  result={result}
                  flagged={flagged}
                  choice={vehicleChoice}
                  onChoose={(c) => {
                    setVehicleChoice(c);
                    set("hasVehicleRaw", c === "אין" ? "לא" : c);
                  }}
                  sending={sending}
                  closing={closing}
                  onSend={() => void sendAgreement(VEHICLE_FORM, false)}
                  onCloseLead={() => void closeLead()}
                />
              )}
              {routing === "red" && (
                <RedPanel sending={sending} closing={closing} onCloseLead={() => void closeLead()} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============ ירוק — כתובת + הסכם התקשרות ============ */
function GreenPanel({ values, set, sending, closing, onSend }: {
  values: ClassicValues;
  set: (key: string, value: ClassicValues[string]) => void;
  sending: boolean;
  closing: boolean;
  onSend: () => void;
}) {
  return (
    <div className="b-spring-in">
      <h3 className="text-[22px] font-black text-bingo-green-dark flex items-center gap-2.5 mb-1.5">
        <PartyPopper className="size-5" /> הלקוח תקין — רמזור ירוק
      </h3>
      <p className="text-[14px] text-bingo-gray-500 mb-4">
        ממשיכים: לוקחים כתובת ושולחים הסכם התקשרות בוואטסאפ.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        <div>
          <label className="block text-[11.5px] font-semibold text-bingo-gray-500 mb-1">עיר</label>
          <input
            className="b-input h-10 text-[13.5px]"
            value={(values.city as string) || ""}
            onChange={(e) => set("city", e.target.value)}
            placeholder="עיר מגורים"
          />
        </div>
        <div>
          <label className="block text-[11.5px] font-semibold text-bingo-gray-500 mb-1">כתובת</label>
          <input
            className="b-input h-10 text-[13.5px]"
            value={(values.address as string) || ""}
            onChange={(e) => set("address", e.target.value)}
            placeholder="רחוב ומספר"
          />
        </div>
      </div>
      <button
        type="button"
        disabled={sending || closing}
        onClick={onSend}
        className="b-lift rounded-full px-8 py-3.5 text-[15px] font-black inline-flex items-center gap-2 disabled:opacity-60"
        style={{
          background: "linear-gradient(150deg, #6DFF33, #46E607)",
          color: "#123307",
          boxShadow: "0 14px 34px -12px var(--b-glow-green), inset 0 1.5px 0 rgba(255,255,255,.55)",
        }}
      >
        {sending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
        {closing ? "ההסכם נשלח!" : "שלח הסכם התקשרות בוואטסאפ"}
      </button>
    </div>
  );
}

/* ============ כתום / שער שנכשל — ממשיכים דרך הרכב ============ */
function VehiclePanel({ result, flagged, choice, onChoose, sending, closing, onSend, onCloseLead }: {
  result: RamzorValue | null;
  flagged: boolean;
  choice: "" | "כן" | "כן משועבד" | "אין";
  onChoose: (c: "כן" | "כן משועבד" | "אין") => void;
  sending: boolean;
  closing: boolean;
  onSend: () => void;
  onCloseLead: () => void;
}) {
  const hasVehicle = choice === "כן" || choice === "כן משועבד";
  return (
    <div className="b-spring-in">
      <h3 className="text-[22px] font-black text-status-orange flex items-center gap-2.5 mb-1.5">
        <Car className="size-5" /> ממשיכים דרך הרכב
      </h3>
      <p className="text-[14px] text-bingo-gray-500 mb-4">
        {result === "orange" ? "רמזור כתום" : flagged ? "שער סינון נכשל" : "לפי הנתונים"} — המסלול היחיד שנשאר פתוח הוא הלוואה כנגד רכב. מקריאים ללקוח:
      </p>
      <div className="b-glass rounded-2xl px-5 py-4 text-[18px] font-extrabold leading-relaxed text-bingo-black mb-4 text-balance">
        &quot;יש בבעלותך רכב?&quot;
      </div>

      {choice !== "אין" && (
        <div className="flex flex-wrap gap-2.5 mb-4">
          <button
            type="button"
            onClick={() => onChoose(choice === "כן משועבד" ? "כן משועבד" : "כן")}
            className={cn(
              "b-lift rounded-2xl border-[1.5px] px-6 py-4 text-[15.5px] font-black inline-flex items-center gap-2.5",
              hasVehicle
                ? "border-transparent b-tint-peach text-bingo-black"
                : "border-bingo-gray-150 bg-white text-bingo-black hover:bg-[var(--b-tint-peach-1)]",
            )}
          >
            <CarFront className="size-5" /> יש רכב
          </button>
          <button
            type="button"
            onClick={() => onChoose("אין")}
            className="b-lift rounded-2xl border-[1.5px] border-bingo-gray-150 bg-white px-6 py-4 text-[15.5px] font-black text-bingo-gray-500 hover:bg-bingo-gray-50 inline-flex items-center gap-2.5"
          >
            <DoorOpen className="size-5" /> אין רכב
          </button>
        </div>
      )}

      {hasVehicle && (
        <div className="b-spring-in space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[12px] font-bold text-bingo-gray-500">הרכב:</span>
            {(["כן", "כן משועבד"] as const).map((o) => (
              <button
                key={o}
                type="button"
                onClick={() => onChoose(o)}
                className={cn(
                  "b-lift b-chip text-[12.5px]",
                  choice === o ? "b-chip-dark" : "b-chip-gray hover:bg-bingo-gray-150",
                )}
              >
                {o === "כן" ? "רכב חופשי" : "רכב משועבד"}
              </button>
            ))}
          </div>
          <button
            type="button"
            disabled={sending || closing}
            onClick={onSend}
            className="b-lift rounded-full px-8 py-3.5 text-[15px] font-black text-white inline-flex items-center gap-2 disabled:opacity-60"
            style={{
              background: "linear-gradient(140deg, #C97A28, #A35E17)",
              boxShadow: "0 14px 34px -12px rgba(240,154,62,.5)",
            }}
          >
            {sending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
            {closing ? "ההסכם נשלח!" : "שלח הסכם הלוואה כנגד רכב"}
          </button>
          <p className="text-[11px] text-bingo-gray-400">המערכת מוסיפה את הליד למסלול הרכב אוטומטית.</p>
        </div>
      )}

      {choice === "אין" && (
        <div className="b-spring-in">
          <div className="b-glass rounded-2xl px-5 py-4 text-[15px] font-bold leading-relaxed text-bingo-black mb-4 text-balance">
            &quot;בלי רכב אין לנו כרגע מסלול שמתאים לנתונים שלך. אם המצב ישתנה — נשמח מאוד לבדוק שוב. תודה על הזמן!&quot;
          </div>
          <button
            type="button"
            disabled={sending || closing}
            onClick={onCloseLead}
            className="b-lift b-pill b-pill-dark disabled:opacity-60"
          >
            {sending ? <Loader2 className="size-4 animate-spin" /> : null}
            סגור ליד
          </button>
        </div>
      )}
    </div>
  );
}

/* ============ אדום — פרידה מכובדת ============ */
function RedPanel({ sending, closing, onCloseLead }: {
  sending: boolean;
  closing: boolean;
  onCloseLead: () => void;
}) {
  return (
    <div className="b-spring-in">
      <h3 className="text-[22px] font-black text-status-red mb-1.5">אין לנו איך לעזור כרגע</h3>
      <p className="text-[14px] text-bingo-gray-500 mb-4">רמזור אדום. מקריאים ללקוח את נוסח הפרידה:</p>
      <div className="b-glass rounded-2xl px-5 py-4 text-[18px] font-extrabold leading-relaxed text-bingo-black mb-4 text-balance">
        &quot;לפי הבדיקה, בשלב הזה אין לנו מסלול שמתאים לנתונים שלך. אם המצב ישתנה בהמשך —
        נשמח מאוד לבדוק שוב. תודה על הזמן והסבלנות.&quot;
      </div>
      <button
        type="button"
        disabled={sending || closing}
        onClick={onCloseLead}
        className="b-lift b-pill b-pill-dark disabled:opacity-60"
      >
        {sending ? <Loader2 className="size-4 animate-spin" /> : null}
        סגור ליד
      </button>
      <p className="mt-2.5 text-[11px] text-bingo-gray-400">
        הליד עובר לתהליך &quot;לא מעוניין/לא רלוונטי&quot; — אפשר לדייק סטטוס בפס התהליכים.
      </p>
    </div>
  );
}
