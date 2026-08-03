"use client";
/**
 * שלב 2 — בדיקת נתוני אשראי (שאלות הסינון).
 * שש שאלות, אחת גלויה בכל רגע, גדולות וברורות: מילת המפתח מסומנת
 * ב-ep-mark, גלולות תשובה גדולות עם שטיפת צבע נכנסת מימין ווי מצויר;
 * שאלה שנענתה מתכווצת לצ'יפ סיכום (תקין = מנטה, שלילי = ורדרד)
 * והשאלה הבאה מזנקת פנימה. מתחת: בדיקות קודמות + הערות,
 * ושורת חיווי חיה מ-screeningState — קריאת פסק הדין.
 */
import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { ClassicCardState } from "@/components/classic/useClassicCard";
import { cardsNegative, screeningState } from "@/lib/catalog";
import { str, arr } from "./shared";
import { DrawnCheck, SPRING, useEpSpring } from "./ep";
import { CHECKED_BEFORE_Y } from "@/lib/yoatsim/card-schema";

interface Q {
  key: string;
  question: string;
  /** מילת המפתח שמודגשת ב-ep-mark */
  mark: string;
  /** בחירה יחידה */
  options?: { label: string; store: string }[];
  /** בחירה מרובה */
  multi?: { label: string; store: string }[];
  exclusive?: string[];
  badStores: string[];
}

const QUESTIONS: Q[] = [
  {
    key: "enforcementIssues",
    question: "האם היו בעיות בהוצאה לפועל?",
    mark: "הוצאה לפועל",
    options: [
      { label: "הכל תקין", store: "הכל תקין" },
      { label: "היו בעיות", store: "היו בעיות" },
    ],
    badStores: ["היו בעיות"],
  },
  {
    key: "returnedChecks",
    question: "האם חזרו צ'קים, הוראות קבע, הלוואות או מסגרות אשראי בשנתיים האחרונות?",
    mark: "צ'קים",
    options: [
      { label: "לא חזר כלום", store: "לא חזר כלום" },
      { label: "חזרו", store: "חזרו" },
    ],
    badStores: ["חזרו"],
  },
  {
    key: "accountRestricted",
    question: "האם החשבון מוגבל כרגע או היה מוגבל בשנתיים האחרונות?",
    mark: "מוגבל",
    options: [
      { label: "החשבון תקין", store: "החשבון תקין" },
      { label: "מוגבל כרגע", store: "מוגבל כרגע" },
      { label: "היה מוגבל", store: "היה מוגבל" },
    ],
    badStores: ["מוגבל כרגע", "היה מוגבל", "מוגבל / היה מוגבל"],
  },
  {
    key: "bdiRepair",
    question: "האם ביצעת מחיקה או שיפור ל-BDI?",
    mark: "BDI",
    options: [
      { label: "לא ביצעתי", store: "לא ביצעתי" },
      { label: "ביצעתי", store: "ביצעתי" },
    ],
    badStores: ["ביצעתי"],
  },
  {
    key: "creditCards",
    question: "האם יש בבעלותך כרטיס אשראי?",
    mark: "כרטיס אשראי",
    multi: [
      { label: "ישראכרט", store: "ישראכרט" },
      { label: "כאל", store: "כאל" },
      { label: "מקס", store: "מקס" },
      { label: "דיירקט בלבד", store: "דיירקט" },
      { label: "אין כרטיס בכלל", store: "אין כרטיס בכלל" },
    ],
    exclusive: ["אין כרטיס בכלל"],
    badStores: ["אין כרטיס בכלל"],
  },
  {
    key: "cardLimit",
    question: "מה גובה מסגרת האשראי?",
    mark: "מסגרת",
    options: [
      { label: "מעל 5,000 ש\"ח", store: "מעל 5,000 ש\"ח" },
      { label: "מתחת ל-5,000 ש\"ח", store: "מתחת ל-5,000 ש\"ח" },
    ],
    badStores: ["מתחת ל-5,000 ש\"ח"],
  },
];

/** עוטפת את מילת המפתח בשאלה במברשת ep-mark */
function markWord(question: string, word: string): React.ReactNode {
  const idx = question.indexOf(word);
  if (idx < 0) return question;
  return (
    <>
      {question.slice(0, idx)}
      <span className="ep-mark">{word}</span>
      {question.slice(idx + word.length)}
    </>
  );
}

/** האם השאלה נענתה + האם התשובה שלילית (לצ'יפ הסיכום) */
function answerOf(q: Q, values: Record<string, unknown>): { answered: boolean; bad: boolean; display: string } {
  if (q.multi) {
    const vals = arr(values[q.key] as string[] | undefined);
    const bad = vals.length > 0 &&
      (vals.includes("אין כרטיס בכלל") || vals.every((c) => c === "דיירקט"));
    return { answered: vals.length > 0, bad, display: vals.join(", ") };
  }
  const v = str(values[q.key] as string | undefined);
  return { answered: !!v, bad: q.badStores.includes(v), display: v };
}

/* ---------- גלולת תשובה גדולה: שטיפת צבע מימין + וי מצויר ---------- */

function AnswerPill({ label, selected, bad, onClick, role = "radio" }: {
  label: string;
  selected: boolean;
  bad: boolean;
  onClick: () => void;
  role?: "radio" | "checkbox";
}) {
  const rm = useReducedMotion();
  const spring = useEpSpring();
  return (
    <motion.button
      type="button"
      role={role}
      aria-checked={selected}
      onClick={onClick}
      whileTap={rm ? undefined : { scale: 0.97 }}
      transition={spring(SPRING.snappy)}
      className={`relative overflow-hidden min-h-[52px] px-6 rounded-full text-[16px] font-semibold border transition-colors ${
        selected
          ? bad
            ? "border-status-red text-status-red"
            : "border-bingo-green-dark text-bingo-green-deep"
          : "bg-white border-bingo-gray-200 text-bingo-gray-700 hover:border-bingo-gray-400"
      }`}
    >
      {/* שכבת השטיפה — נכנסת ב-scaleX מימין */}
      {selected && (
        <motion.span
          aria-hidden="true"
          className="absolute inset-0"
          style={{ background: bad ? "#FFE1DC" : "#DAFFCB", originX: 1 }}
          initial={rm ? false : { scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={spring(SPRING.snappy)}
        />
      )}
      <span className="relative flex items-center gap-2">
        {selected && <DrawnCheck size={15} strokeWidth={3.25} />}
        {label}
      </span>
    </motion.button>
  );
}

export function Step2Screening({ state }: { state: ClassicCardState }) {
  const v = state.values;
  const screening = screeningState(v);
  const spring = useEpSpring();

  /** אין כרטיס אמיתי — שאלת המסגרת לא רלוונטית ולא מוצגת */
  const noCard = cardsNegative(v) === true;
  const visibleQuestions = noCard ? QUESTIONS.filter((q) => q.key !== "cardLimit") : QUESTIONS;

  /** השאלה הפתוחה: ברירת מחדל — הראשונה שלא נענתה; קליק על צ'יפ פותח מחדש */
  const [openKey, setOpenKey] = React.useState<string | null>(null);
  const firstUnanswered = visibleQuestions.find((q) => !answerOf(q, v).answered)?.key ?? null;
  const activeKey = openKey ?? firstUnanswered;
  const holdTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  React.useEffect(() => () => { if (holdTimer.current) clearTimeout(holdTimer.current); }, []);

  /** שומרים את השאלה פתוחה כ-420ms — הווי מספיק להצטייר לפני הכיווץ לצ'יפ */
  const answer = (q: Q, stored: string) => {
    state.set(q.key, stored);
    setOpenKey(q.key);
    if (holdTimer.current) clearTimeout(holdTimer.current);
    holdTimer.current = setTimeout(() => {
      setOpenKey((k) => (k === q.key ? null : k));
    }, 420);
  };

  /** לוגיקת הריבוי — זהה ל-MultiChips; בחירת אופציה בלעדית מתקדמת לבד כמו תשובה יחידה */
  const toggleMulti = (q: Q, stored: string) => {
    const values = arr(v[q.key]);
    if (q.exclusive?.includes(stored) && !values.includes(stored)) {
      /* תשובה סופית ("אין כרטיס בכלל") — אותה מכניקת החזק-וכווץ של שאלה יחידה */
      state.set(q.key, [stored]);
      setOpenKey(q.key);
      if (holdTimer.current) clearTimeout(holdTimer.current);
      holdTimer.current = setTimeout(() => {
        setOpenKey((k) => (k === q.key ? null : k));
      }, 420);
      return;
    }
    let next: string[];
    if (values.includes(stored)) next = values.filter((x) => x !== stored);
    else next = [...values.filter((x) => !q.exclusive?.includes(x)), stored];
    state.set(q.key, next);
  };

  const allCoreAnswered = screening.answered >= screening.total;

  /** מענה במקלדת: ספרות 1..n בוחרות גלולה בשאלה הפעילה, Enter מאשר ריבוי */
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.tagName === "SELECT" || t.isContentEditable)) return;
      const q = visibleQuestions.find((x) => x.key === activeKey);
      if (!q) return;
      if (e.key === "Enter") {
        if (q.multi && arr(v[q.key]).length > 0) {
          e.preventDefault();
          setOpenKey(null);
        }
        return;
      }
      const n = Number(e.key);
      if (!Number.isInteger(n) || n < 1) return;
      const opts = q.multi ?? q.options ?? [];
      if (n > opts.length) return;
      e.preventDefault();
      const opt = opts[n - 1];
      if (q.multi) toggleMulti(q, opt.store);
      else answer(q, opt.store);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  return (
    <div className="space-y-3">
      <AnimatePresence mode="popLayout" initial={false}>
        {visibleQuestions.map((q, i) => {
          const a = answerOf(q, v);
          const isOpen = activeKey === q.key;
          // שאלה עתידית שעוד לא הגיע תורה — לא מוצגת
          if (!isOpen && !a.answered) return null;

          if (!isOpen && a.answered) {
            /* צ'יפ שאלה שנענתה — שומר את גוון השטיפה */
            return (
              <motion.button
                layout
                key={`${q.key}-chip`}
                type="button"
                onClick={() => setOpenKey(q.key)}
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                transition={spring(SPRING.entrance)}
                className={`w-full flex items-center gap-3 rounded-[18px] border px-4 py-2.5 min-h-[44px] text-start transition-colors ${
                  a.bad
                    ? "border-[#ffcdc2] bg-[#fff3f0] hover:border-status-red"
                    : "border-[#c4efac] bg-[#f0ffe7] hover:border-bingo-green-dark"
                }`}
              >
                <span className="text-[13px] text-bingo-gray-600 flex-1 min-w-0 truncate">{q.question}</span>
                <span className={`text-[12px] font-semibold px-3 py-1 rounded-full shrink-0 ${
                  a.bad ? "bg-[#FFE1DC] text-status-red" : "bg-[#DAFFCB] text-bingo-green-deep"
                }`}>
                  {a.bad ? "שלילי" : "תקין"}{a.display ? ` · ${a.display}` : ""}
                </span>
              </motion.button>
            );
          }

          /* השאלה שבאור הזרקורים — גדולה, חיה, אחת בכל רגע */
          return (
            <motion.div
              layout
              key={`${q.key}-open`}
              initial={{ opacity: 0, x: 24, scale: 0.98 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={spring(SPRING.entrance)}
              className="rounded-[20px] bg-white/70 border border-bingo-gray-150 p-6"
            >
              <p className="text-[27px] leading-[1.25] font-bold text-bingo-black mb-6">
                <span className="text-bingo-gray-300 tabular-nums me-2 text-[20px] font-semibold">{i + 1}.</span>
                {markWord(q.question, q.mark)}
              </p>
              {q.multi ? (
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2.5">
                    {q.multi.map((opt) => (
                      <AnswerPill
                        key={opt.label}
                        role="checkbox"
                        label={opt.label}
                        selected={arr(v[q.key]).includes(opt.store)}
                        bad={q.badStores.includes(opt.store)}
                        onClick={() => toggleMulti(q, opt.store)}
                      />
                    ))}
                  </div>
                  <button
                    type="button"
                    disabled={arr(v[q.key]).length === 0}
                    onClick={() => setOpenKey(null)}
                    className="b-pill-dark min-h-[44px] px-6 text-[13px] disabled:opacity-40"
                  >
                    המשך
                  </button>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2.5" role="radiogroup">
                  {q.options!.map((opt) => (
                    <AnswerPill
                      key={opt.label}
                      label={opt.label}
                      selected={str(v[q.key]) === opt.store && str(v[q.key]) !== ""}
                      bad={q.badStores.includes(opt.store)}
                      onClick={() => answer(q, opt.store)}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          );
        })}

        {/* בדיקות קודמות + הערות — אחרי שש השאלות */}
        {allCoreAnswered && (
          <motion.div
            layout
            key="checked-before"
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            transition={spring(SPRING.entrance)}
            className="rounded-[20px] bg-white/70 border border-bingo-gray-150 p-5 space-y-4"
          >
            <div>
              <p className="text-[16px] font-bold text-bingo-black mb-3">
                האם ביצעת בדיקה להלוואה לפני שפנית אלינו?
              </p>
              <div className="flex flex-wrap gap-2">
                {CHECKED_BEFORE_Y.filter((o) => o !== "בלנדר").map((o) => {
                  const selected = arr(v.checkedBefore).includes(o);
                  return (
                    <AnswerPill
                      key={o}
                      role="checkbox"
                      label={o}
                      selected={selected}
                      bad={false}
                      onClick={() => {
                        const values = arr(v.checkedBefore);
                        let next: string[];
                        if (values.includes(o)) next = values.filter((x) => x !== o);
                        else if (o === "לא בדק") next = [o];
                        else next = [...values.filter((x) => x !== "לא בדק"), o];
                        state.set("checkedBefore", next);
                      }}
                    />
                  );
                })}
              </div>
            </div>
            <label className="block">
              <span className="block text-[13px] font-semibold text-bingo-gray-600 mb-2">הערות לבדיקות</span>
              <textarea
                className="b-input ep-input w-full min-h-20 resize-y rounded-[16px]"
                value={str(v.creditNotes)}
                onChange={(e) => state.set("creditNotes", e.target.value)}
              />
            </label>
          </motion.div>
        )}
      </AnimatePresence>

      {/* שורת החיווי החיה — קריאת פסק הדין */}
      <div className="flex flex-wrap items-center gap-2 pt-1" aria-live="polite">
        {screening.negative ? (
          <>
            <span className="bg-[#FFE1DC] text-status-red text-[14px] font-bold px-4 py-2 rounded-full">
              חיווי אשראי שלילי
            </span>
            <span className="text-[13px] text-bingo-gray-500">
              {screening.reasons.join(" · ")}
            </span>
          </>
        ) : allCoreAnswered ? (
          <span className="bg-[#DAFFCB] text-bingo-green-deep text-[14px] font-bold px-4 py-2 rounded-full flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/icons3d/sparkle.webp" alt="" width={22} height={22} />
            חיווי אשראי חיובי
          </span>
        ) : (
          <span className="b-chip-gray text-[13px] font-semibold px-4 py-1.5 rounded-full">
            בבדיקה · {screening.answered}/{screening.total}
          </span>
        )}
      </div>
    </div>
  );
}
