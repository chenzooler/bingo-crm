"use client";
/**
 * OutcomePanel — החותמת. Esc opens it; there is no X and no silent close.
 * Fixed 1-9 mapping (same key = same outcome, forever). Enter = the engine's
 * suggested outcome. Every outcome births a next step with a time — or a
 * controlled exit with a reason. No third way.
 */
import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Stamp } from "lucide-react";
import { nextActionFor } from "@/lib/journey";
import { cn } from "@/lib/utils";
import { useJourney } from "./useJourney";

type JourneyCtxT = ReturnType<typeof useJourney>;

interface Outcome {
  key: string;
  digit: number;
  label: string;
  preview: (ctx: JourneyCtxT) => string;
  /** follow-up chips; outcomes without chips execute immediately */
  chips?: string[];
}

const NOT_INTERESTED_REASONS = ["יקר לו", "סגר במקום אחר", "חושש", "לא מעוניין לאחר הסבר", "אחר"];
const NOT_RELEVANT_REASONS = ["גיל נמוך — מתחת ל-25", "עולה חדש / אין אזרחות", "מעוקל / פש\"ר", "ביקש הסרה", "אחר"];
const CALLBACK_TIMES = ["בעוד שעה", "בעוד 3 שעות", "מחר בבוקר (10:00)", "בעוד יומיים"];

export function OutcomePanel() {
  const ctx = useJourney();
  const { overlay, setOverlay, j } = ctx;
  const open = overlay === "outcome";
  const [sub, setSub] = React.useState<string | null>(null); // outcome awaiting chips
  const na = nextActionFor(j);

  const fromDesk = typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).get("from") === "desk";

  const seal = React.useCallback((text: string) => {
    ctx.addNote(`🔏 ${text}`);
    setSub(null);
    setOverlay(null);
    if (fromDesk) setTimeout(() => { window.location.href = "/desk"; }, 350);
  }, [ctx, setOverlay, fromDesk]);

  const OUTCOMES: Outcome[] = React.useMemo(() => [
    { key: "no-answer", digit: 1, label: "אין מענה", preview: () => "חזרה אוטומטית בעוד שעה (סולם: 1ש׳ → 4ש׳ → מחר)" },
    { key: "callback", digit: 2, label: "ביקש שאחזור", preview: () => "בחר מתי — החזרה ננעלת ברצועת היום", chips: CALLBACK_TIMES },
    { key: "suggested", digit: 3, label: "אשר את הצעד המוצע", preview: (c: JourneyCtxT) => nextActionFor(c.j).label },
    { key: "signed", digit: 4, label: "נחתם עכשיו", preview: () => "חזרה אוטומטית בעוד שעה — צינון" },
    { key: "not-interested", digit: 5, label: "לא מעוניין", preview: () => "סיבה → ארכיון חכם + בדיקה מחדש בעוד 90 יום", chips: NOT_INTERESTED_REASONS },
    { key: "not-relevant", digit: 6, label: "לא רלוונטי", preview: () => "סיבה → יציאה מבוקרת", chips: NOT_RELEVANT_REASONS },
    { key: "manager", digit: 7, label: "חריג — העבר למנהל", preview: () => "נרשם בציר הזמן + תור המנהל" },
    { key: "wrong-number", digit: 8, label: "מספר שגוי", preview: () => "יציאה: מספר לא תקין" },
    { key: "busy", digit: 9, label: "תפוס — חזור בעוד 10 דק׳", preview: () => "הקלף חוזר לראש התור בעוד 10 דקות" },
  ], []);

  const execute = React.useCallback((o: Outcome, chip?: string) => {
    switch (o.key) {
      case "no-answer": {
        const when = new Date(Date.now() + 3600_000);
        ctx.patch({ manualCallbackAt: when.toISOString(), manualCallbackNote: "אין מענה — שלב 1 בסולם" });
        seal("אין מענה — חזרה אוטומטית בעוד שעה");
        break;
      }
      case "callback":
        ctx.setCallback(chip!, "");
        seal(`ביקש שאחזור — ${chip}`);
        break;
      case "suggested":
        seal(`נחתם: ${na.label}`);
        break;
      case "signed":
        ctx.markSigned();
        seal("הלקוח חתם — צינון שעה");
        break;
      case "not-interested":
        ctx.markExit(`לא מעוניין — ${chip}`);
        seal(`לא מעוניין: ${chip}`);
        break;
      case "not-relevant":
        ctx.markExit(chip === "אחר" ? "לא רלוונטי" : `לא רלוונטי — ${chip}`);
        seal(`לא רלוונטי: ${chip}`);
        break;
      case "manager":
        seal("חריג — הועבר למנהל");
        break;
      case "wrong-number":
        ctx.markExit("מספר לא תקין");
        seal("מספר שגוי");
        break;
      case "busy": {
        const when = new Date(Date.now() + 10 * 60_000);
        ctx.patch({ manualCallbackAt: when.toISOString(), manualCallbackNote: "תפוס — ניסיון חוזר" });
        seal("תפוס — חוזרים בעוד 10 דקות");
        break;
      }
    }
  }, [ctx, na.label, seal]);

  // keyboard: digits pick outcome / chip; Enter = suggested
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        // Esc from a sub-choice goes back to the panel, not out of it
        if (sub) setSub(null);
        else setOverlay(null);
        return;
      }
      const active = sub ? OUTCOMES.find((o) => o.key === sub) : null;
      if (e.key === "Enter" && !sub) {
        e.preventDefault();
        execute(OUTCOMES.find((o) => o.key === "suggested")!);
        return;
      }
      if (e.key >= "1" && e.key <= "9") {
        e.preventDefault();
        const n = Number(e.key);
        if (active?.chips) {
          const chip = active.chips[n - 1];
          if (chip) execute(active, chip);
          return;
        }
        const o = OUTCOMES.find((x) => x.digit === n);
        if (!o) return;
        if (o.chips) setSub(o.key);
        else execute(o);
      }
    };
    window.addEventListener("keydown", onKey, { capture: true });
    return () => window.removeEventListener("keydown", onKey, { capture: true });
  }, [open, sub, OUTCOMES, execute, setOverlay]);

  const activeSub = sub ? OUTCOMES.find((o) => o.key === sub) : null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-bingo-black/60 backdrop-blur-sm p-4"
        >
          <motion.div
            initial={{ y: 40, opacity: 0, scale: 0.98 }} animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 20, opacity: 0 }} transition={{ type: "spring", stiffness: 340, damping: 30 }}
            className="b-card w-full max-w-2xl p-6"
          >
            <div className="flex items-center gap-2.5 mb-4">
              <span className="b-icon b-icon-green size-10"><Stamp className="size-5" /></span>
              <div>
                <h2 className="text-[20px] font-bold text-bingo-black">איך נגמרה השיחה?</h2>
                <p className="text-[12px] text-bingo-gray-500">כל תוצאה מולידה צעד-הבא. אין דרך שלישית.</p>
              </div>
            </div>

            {!activeSub ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {OUTCOMES.map((o) => {
                  const suggested = o.key === "suggested";
                  return (
                    <button
                      key={o.key}
                      onClick={() => (o.chips ? setSub(o.key) : execute(o))}
                      className={cn(
                        "rounded-2xl border-2 px-3.5 py-3 text-right transition-all group",
                        suggested
                          ? "border-bingo-green bg-bingo-green-light/40 sm:col-span-2"
                          : "border-bingo-gray-150 hover:border-bingo-gray-300",
                      )}
                    >
                      <div className="flex items-center gap-2.5">
                        <kbd className={cn(
                          "size-7 rounded-lg flex items-center justify-center text-[13px] font-bold shrink-0",
                          suggested ? "bg-bingo-green text-bingo-black" : "bg-bingo-gray-100 text-bingo-gray-500",
                        )}>
                          {o.digit}
                        </kbd>
                        <span className={cn("font-bold", suggested ? "text-[17px]" : "text-[14.5px]", "text-bingo-black")}>
                          {o.label}
                          {suggested && <kbd className="mr-2 rounded bg-black/10 px-1.5 py-0.5 text-[10px]">↵ Enter</kbd>}
                        </span>
                      </div>
                      <p className="mt-1 mr-9.5 pr-0 text-[11.5px] text-bingo-gray-500">← {o.preview(ctx)}</p>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div>
                <p className="text-[15px] font-bold text-bingo-black mb-3">{activeSub.label} — בחר:</p>
                <div className="flex flex-wrap gap-2">
                  {activeSub.chips!.map((c, i) => (
                    <button key={c} onClick={() => execute(activeSub, c)}
                      className="b-pill b-pill-ghost">
                      {c} <kbd className="rounded bg-bingo-gray-100 px-1.5 text-[10px] font-bold">{i + 1}</kbd>
                    </button>
                  ))}
                </div>
                <button onClick={() => setSub(null)} className="mt-4 text-[12px] text-bingo-gray-400 hover:text-bingo-gray-600">
                  → חזרה (Esc)
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
