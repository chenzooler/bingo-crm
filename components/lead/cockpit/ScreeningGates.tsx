"use client";
/**
 * ScreeningGates — חמשת שערי הסינון בהתניות, בדיוק כמו הדגמה 01 בקונספט:
 * רק השער הנוכחי פתוח (קפיץ), שערים שנענו מתקפלים לשורת סיכום
 * (מנטה=תקין, אפרסק=ינותב לרכב), שערים עתידיים נעולים.
 * מקלדת: 1/2 בשערים 1–4 · 1–6 מחליפים כרטיסים בשער 5 · Enter מאשר/ממשיך.
 * כל תשובה נכתבת דרך set() — שמירה אוטומטית + מנוע האוטומציות בשרת.
 */
import * as React from "react";
import { Check, AlertTriangle, Lock, Pencil } from "lucide-react";
import { CREDIT_CARDS_Y, CARD_LIMIT_Y } from "@/lib/yoatsim/card-schema";
import type { ClassicValues } from "@/lib/yoatsim/values";
import { cn } from "@/lib/utils";
import {
  GATES, NO_CARD, gateAnswered, gateFlagged, gateSummary, gate5Complete,
} from "./shared";

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[10px] font-black opacity-45 mr-1.5 border border-current/30 rounded px-1 py-px tabular-nums">
      {children}
    </span>
  );
}

export function ScreeningGates({ values, set, disabled, onLaunch }: {
  values: ClassicValues;
  set: (key: string, value: ClassicValues[string]) => void;
  /** true בזמן שמודאל הרמזור פתוח — משתיק את המקלדת */
  disabled?: boolean;
  onLaunch: () => void;
}) {
  /* שער 5 דורש אישור מפורש (בחירה מרובה); נחשב "נענה" מראש אם הגיע מלא */
  const [gate5Done, setGate5Done] = React.useState(() => gate5Complete(values));
  /* עריכה חוזרת של שער שנענה (קליק על שורת סיכום) */
  const [editing, setEditing] = React.useState<number | null>(null);

  const answered = GATES.map((g, i) =>
    g.combined ? gate5Done && gate5Complete(values) : gateAnswered(g, values),
  );
  const firstOpen = answered.findIndex((a) => !a);
  const current = editing ?? (firstOpen === -1 ? -1 : firstOpen);
  const doneCount = answered.filter(Boolean).length;
  const allAnswered = doneCount === GATES.length && editing === null;
  const anyFlagged = GATES.some((g, i) => answered[i] && gateFlagged(g, values));

  const answerSimple = React.useCallback((gateIdx: number, good: boolean) => {
    const gate = GATES[gateIdx];
    if (!gate || gate.combined) return;
    set(gate.key, good ? gate.good : gate.bad);
    setEditing(null);
  }, [set]);

  const toggleCard = React.useCallback((card: string) => {
    const arr = Array.isArray(values.creditCards) ? (values.creditCards as string[]) : [];
    if (card === NO_CARD) {
      // "אין כרטיס בכלל" מבטל את השאר
      set("creditCards", arr.includes(NO_CARD) ? [] : [NO_CARD]);
      return;
    }
    const base = arr.filter((c) => c !== NO_CARD);
    set("creditCards", base.includes(card) ? base.filter((c) => c !== card) : [...base, card]);
  }, [set, values.creditCards]);

  const confirmGate5 = React.useCallback(() => {
    if (!gate5Complete(values)) return;
    setGate5Done(true);
    setEditing(null);
  }, [values]);

  /* ---------- מקלדת ---------- */
  const kb = React.useRef({ current, allAnswered, values });
  kb.current = { current, allAnswered, values };
  React.useEffect(() => {
    if (disabled) return;
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const { current: cur, allAnswered: done } = kb.current;

      if (done && e.key === "Enter") {
        e.preventDefault();
        onLaunch();
        return;
      }
      const gate = cur >= 0 ? GATES[cur] : undefined;
      if (!gate) return;
      if (gate.combined) {
        const idx = Number(e.key) - 1;
        if (Number.isInteger(idx) && idx >= 0 && idx < CREDIT_CARDS_Y.length) {
          e.preventDefault();
          toggleCard(CREDIT_CARDS_Y[idx]);
        } else if (e.key === "Enter") {
          e.preventDefault();
          confirmGate5();
        }
      } else if (e.key === "1" || e.key === "2") {
        e.preventDefault();
        answerSimple(cur, e.key === "1");
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [disabled, answerSimple, toggleCard, confirmGate5, onLaunch]);

  const cards = Array.isArray(values.creditCards) ? (values.creditCards as string[]) : [];
  const noCard = cards.includes(NO_CARD);

  return (
    <div>
      {/* פס התקדמות */}
      <div className="flex items-center gap-2.5 mb-4">
        <div className="flex-1 h-[7px] rounded-full bg-bingo-gray-100 overflow-hidden">
          <div
            className="h-full rounded-full"
            style={{
              width: `${(doneCount / GATES.length) * 100}%`,
              background: "linear-gradient(90deg, var(--color-bingo-green-dark, #2B9410), var(--color-bingo-green, #50FF0A))",
              boxShadow: "0 0 10px var(--b-glow-green)",
              transition: "width 600ms var(--b-spring)",
            }}
          />
        </div>
        <span className="text-[12px] font-extrabold text-bingo-gray-500 tabular-nums whitespace-nowrap">
          {doneCount >= GATES.length ? "כל השערים נענו" : `שער ${doneCount + 1} מתוך ${GATES.length}`}
        </span>
      </div>

      {/* השערים */}
      <div className="flex flex-col gap-2.5">
        {GATES.map((gate, i) => {
          const isDone = answered[i] && i !== current;
          const isActive = i === current;
          const flagged = answered[i] && gateFlagged(gate, values);

          /* --- שורת סיכום (נענה) --- */
          if (isDone) {
            return (
              <button
                key={gate.key}
                type="button"
                onClick={() => { setEditing(i); if (gate.combined) setGate5Done(false); }}
                className={cn(
                  "b-lift group w-full rounded-2xl px-4 py-3 flex items-center gap-3 text-right",
                  flagged ? "b-tint-peach" : "b-tint-mint",
                )}
                title="לחיצה לעריכת התשובה"
              >
                <span className={cn(
                  "size-[26px] rounded-full flex items-center justify-center text-white shrink-0",
                  flagged ? "bg-status-orange" : "bg-bingo-green-dark",
                )}>
                  {flagged ? <AlertTriangle className="size-3.5" /> : <Check className="size-3.5" />}
                </span>
                <span className="text-[14px] font-bold text-bingo-black flex-1 min-w-0 truncate">{gate.question}</span>
                <span className={cn(
                  "text-[12.5px] font-extrabold whitespace-nowrap",
                  flagged ? "text-status-orange" : "text-bingo-green-dark",
                )}>
                  {gateSummary(gate, values)}{flagged ? " · ינותב לרכב" : ""}
                </span>
                <Pencil className="size-3.5 text-bingo-gray-300 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
              </button>
            );
          }

          /* --- שער פעיל --- */
          if (isActive) {
            return (
              <div key={gate.key} className="b-spring-in rounded-2xl bg-white dark:bg-bingo-gray-50 shadow-[var(--b-sh-lg)] p-4 sm:p-5">
                <div className="flex items-center gap-3">
                  <span className="size-[26px] rounded-full bg-bingo-black text-white flex items-center justify-center text-[12px] font-black shrink-0">
                    {i + 1}
                  </span>
                  <p className="text-[15.5px] font-extrabold text-bingo-black">{gate.question}</p>
                </div>
                <p className="text-[12.5px] text-bingo-gray-400 mt-1 mr-[38px]">{gate.hint}</p>

                {!gate.combined ? (
                  <div className="flex flex-wrap gap-2 mt-3.5 mr-[38px]">
                    <button
                      type="button"
                      onClick={() => answerSimple(i, true)}
                      className="b-lift rounded-full border-[1.5px] border-bingo-gray-150 bg-white px-5 py-2.5 text-[14px] font-extrabold text-bingo-black hover:bg-[var(--b-tint-mint-1)]"
                    >
                      {gate.good}<Kbd>1</Kbd>
                    </button>
                    <button
                      type="button"
                      onClick={() => answerSimple(i, false)}
                      className="b-lift rounded-full border-[1.5px] border-bingo-gray-150 bg-white px-5 py-2.5 text-[14px] font-extrabold text-bingo-black hover:bg-[var(--b-tint-peach-1)]"
                    >
                      {gate.bad}<Kbd>2</Kbd>
                    </button>
                  </div>
                ) : (
                  <div className="mt-3.5 mr-[38px] space-y-3">
                    {/* בחירת כרטיסים */}
                    <div className="flex flex-wrap gap-1.5">
                      {CREDIT_CARDS_Y.map((c, ci) => {
                        const on = cards.includes(c);
                        return (
                          <button
                            key={c}
                            type="button"
                            onClick={() => toggleCard(c)}
                            className={cn(
                              "b-lift b-chip text-[12.5px] transition",
                              on
                                ? c === NO_CARD ? "b-chip-orange font-bold" : "b-chip-green font-bold"
                                : "b-chip-gray hover:bg-bingo-gray-150",
                            )}
                          >
                            {c}<Kbd>{ci + 1}</Kbd>
                          </button>
                        );
                      })}
                    </div>
                    {/* מסגרת — רק כשיש כרטיס */}
                    {!noCard && cards.length > 0 && (
                      <div className="b-spring-in flex items-center gap-2 flex-wrap">
                        <span className="text-[12px] font-bold text-bingo-gray-500">המסגרת שם:</span>
                        {CARD_LIMIT_Y.map((o) => (
                          <button
                            key={o}
                            type="button"
                            onClick={() => set("cardLimit", o)}
                            className={cn(
                              "b-lift b-chip text-[12.5px] transition",
                              values.cardLimit === o ? "b-chip-dark" : "b-chip-gray hover:bg-bingo-gray-150",
                            )}
                          >
                            {o}
                          </button>
                        ))}
                      </div>
                    )}
                    <button
                      type="button"
                      disabled={!gate5Complete(values)}
                      onClick={confirmGate5}
                      className="b-lift b-pill b-pill-dark b-pill-sm disabled:opacity-40 disabled:pointer-events-none"
                    >
                      אישור והמשך<Kbd>↵</Kbd>
                    </button>
                  </div>
                )}
              </div>
            );
          }

          /* --- שער נעול --- */
          return (
            <div
              key={gate.key}
              className="rounded-2xl border border-bingo-gray-100 bg-white/50 px-4 py-3 flex items-center gap-3 opacity-35 saturate-[.2] pointer-events-none select-none"
              aria-hidden="true"
            >
              <span className="size-[26px] rounded-full bg-bingo-gray-100 text-bingo-gray-400 flex items-center justify-center text-[12px] font-black shrink-0">
                {i + 1}
              </span>
              <span className="text-[14px] font-bold text-bingo-gray-500 flex-1 truncate">{gate.question}</span>
              <Lock className="size-3.5 text-bingo-gray-300 shrink-0" />
            </div>
          );
        })}
      </div>

      {/* CTA סופי — במת האבסידיאן */}
      <button
        type="button"
        disabled={!allAnswered}
        onClick={onLaunch}
        className={cn(
          "mt-4 w-full rounded-2xl px-5 py-4 flex items-center justify-center gap-3 text-[15.5px] font-black text-white text-center transition-all",
          "disabled:opacity-35 disabled:cursor-default",
          allAnswered && "b-lift cursor-pointer",
        )}
        style={{
          background: allAnswered && anyFlagged
            ? "linear-gradient(140deg, #C97A28, #A35E17)"
            : "linear-gradient(140deg, #35342E, #1E1D19)",
          boxShadow: allAnswered && !anyFlagged ? "0 18px 44px -16px rgba(43,148,16,.55)" : undefined,
          transition: "all 500ms var(--b-spring)",
        }}
      >
        <span
          className={cn("size-[11px] rounded-full shrink-0", allAnswered && !anyFlagged && "b-pulse-glow")}
          style={{ background: "radial-gradient(circle at 32% 28%, #C6FFA1, #50FF0A 55%, #2B9410)" }}
        />
        {!allAnswered
          ? "ענו על כל השערים כדי להמשיך לבדיקת הרמזור"
          : anyFlagged
            ? "בדיקת רמזור · ניתוב למסלול רכב"
            : "בדיקת רמזור"}
        {allAnswered && <Kbd>↵</Kbd>}
      </button>
    </div>
  );
}
