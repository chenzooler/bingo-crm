"use client";
/**
 * שלב 2 — בדיקת נתוני אשראי (שאלות הסינון).
 * שש שאלות, אחת גלויה בכל רגע; שאלה שנענתה מתכווצת לצ'יפ סיכום
 * (תקין = ירקרק, שלילי = אדום רך). מתחת: בדיקות קודמות + הערות,
 * ושורת חיווי חיה מ-screeningState.
 */
import * as React from "react";
import type { ClassicCardState } from "@/components/classic/useClassicCard";
import { screeningState } from "@/lib/catalog";
import { ChoicePills, MultiChips, str, arr } from "./shared";
import { CHECKED_BEFORE_Y } from "@/lib/yoatsim/card-schema";

interface Q {
  key: string;
  question: string;
  /** בחירה יחידה */
  options?: { label: string; store: string }[];
  /** בחירה מרובה */
  multi?: { label: string; store: string }[];
  exclusive?: string[];
  badStores: string[];
}

const RESTRICTED_BAD = "מוגבל / היה מוגבל";

const QUESTIONS: Q[] = [
  {
    key: "enforcementIssues",
    question: "האם היו בעיות בהוצאה לפועל?",
    options: [
      { label: "הכל תקין", store: "הכל תקין" },
      { label: "היו בעיות", store: "היו בעיות" },
    ],
    badStores: ["היו בעיות"],
  },
  {
    key: "returnedChecks",
    question: "האם חזרו צ'קים, הוראות קבע, הלוואות או מסגרות אשראי בשנתיים האחרונות?",
    options: [
      { label: "לא חזר כלום", store: "לא חזר כלום" },
      { label: "חזרו", store: "חזרו" },
    ],
    badStores: ["חזרו"],
  },
  {
    key: "accountRestricted",
    question: "האם החשבון מוגבל כרגע או היה מוגבל בשנתיים האחרונות?",
    options: [
      { label: "החשבון תקין", store: "החשבון תקין" },
      { label: "מוגבל", store: RESTRICTED_BAD },
      { label: "היה מוגבל", store: RESTRICTED_BAD },
    ],
    badStores: [RESTRICTED_BAD],
  },
  {
    key: "bdiRepair",
    question: "האם ביצעת מחיקה או שיפור ל-BDI?",
    options: [
      { label: "לא ביצעתי", store: "לא ביצעתי" },
      { label: "ביצעתי", store: "ביצעתי" },
    ],
    badStores: ["ביצעתי"],
  },
  {
    key: "creditCards",
    question: "האם יש בבעלותך כרטיס אשראי?",
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
    options: [
      { label: "מעל 5,000 ש\"ח", store: "מעל 5,000 ש\"ח" },
      { label: "מתחת ל-5,000 ש\"ח", store: "מתחת ל-5,000 ש\"ח" },
    ],
    badStores: ["מתחת ל-5,000 ש\"ח"],
  },
];

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

export function Step2Screening({ state }: { state: ClassicCardState }) {
  const v = state.values;
  const screening = screeningState(v);

  /** השאלה הפתוחה: ברירת מחדל — הראשונה שלא נענתה; קליק על צ'יפ פותח מחדש */
  const [openKey, setOpenKey] = React.useState<string | null>(null);
  const firstUnanswered = QUESTIONS.find((q) => !answerOf(q, v).answered)?.key ?? null;
  const activeKey = openKey ?? firstUnanswered;

  const answer = (q: Q, stored: string) => {
    state.set(q.key, stored);
    setOpenKey(null); // ממשיכים לשאלה הבאה
  };

  const allCoreAnswered = screening.answered >= screening.total;

  return (
    <div className="space-y-3">
      {QUESTIONS.map((q, i) => {
        const a = answerOf(q, v);
        const isOpen = activeKey === q.key;
        // שאלה עתידית שעוד לא הגיע תורה — לא מוצגת
        if (!isOpen && !a.answered) return null;

        if (!isOpen && a.answered) {
          return (
            <button
              key={q.key}
              type="button"
              onClick={() => setOpenKey(q.key)}
              className="w-full flex items-center gap-3 rounded-[16px] border border-bingo-gray-150 px-4 py-2.5 min-h-[44px] text-start hover:border-bingo-gray-300 transition-colors"
            >
              <span className="text-[13px] text-bingo-gray-600 flex-1 min-w-0 truncate">{q.question}</span>
              <span className={`text-[12px] font-semibold px-3 py-1 rounded-full shrink-0 ${
                a.bad ? "bg-status-red-soft text-status-red" : "bg-bingo-green-light text-bingo-green-deep"
              }`}>
                {a.bad ? "שלילי" : "תקין"}{a.display ? ` · ${a.display}` : ""}
              </span>
            </button>
          );
        }

        return (
          <div key={q.key} className="rounded-[16px] bg-bingo-gray-50 p-5 v4p1-enter">
            <p className="text-[15px] font-bold text-bingo-black mb-4">
              <span className="text-bingo-gray-400 tabular-nums me-2">{i + 1}.</span>
              {q.question}
            </p>
            {q.multi ? (
              <div className="space-y-3">
                <MultiChips
                  options={q.multi}
                  values={arr(v[q.key])}
                  exclusive={q.exclusive}
                  onChange={(next) => state.set(q.key, next)}
                />
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
              <ChoicePills
                options={q.options!}
                value={str(v[q.key])}
                badStores={q.badStores}
                onChange={(stored) => answer(q, stored)}
              />
            )}
          </div>
        );
      })}

      {/* בדיקות קודמות + הערות — אחרי שש השאלות */}
      {allCoreAnswered && (
        <div className="rounded-[16px] bg-bingo-gray-50 p-5 space-y-4 v4p1-enter">
          <div>
            <p className="text-[14px] font-bold text-bingo-black mb-3">
              האם ביצעת בדיקה להלוואה לפני שפנית אלינו?
            </p>
            <MultiChips
              options={CHECKED_BEFORE_Y.filter((o) => o !== "בלנדר").map((o) => ({ label: o, store: o }))}
              values={arr(v.checkedBefore)}
              exclusive={["לא בדק"]}
              onChange={(next) => state.set("checkedBefore", next)}
            />
          </div>
          <label className="block">
            <span className="block text-[13px] font-semibold text-bingo-gray-600 mb-2">הערות לבדיקות</span>
            <textarea
              className="b-input w-full min-h-20 resize-y rounded-[16px]"
              value={str(v.creditNotes)}
              onChange={(e) => state.set("creditNotes", e.target.value)}
            />
          </label>
        </div>
      )}

      {/* שורת החיווי החיה */}
      <div className="flex flex-wrap items-center gap-2 pt-1" aria-live="polite">
        {screening.negative ? (
          <>
            <span className="bg-status-red-soft text-status-red text-[13px] font-semibold px-4 py-1.5 rounded-full">
              חיווי אשראי שלילי
            </span>
            <span className="text-[13px] text-bingo-gray-500">
              {screening.reasons.join(" · ")}
            </span>
          </>
        ) : allCoreAnswered ? (
          <span className="bg-bingo-green-light text-bingo-green-deep text-[13px] font-semibold px-4 py-1.5 rounded-full">
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
