"use client";
/**
 * DeskClient — the dealt-card surface.
 * One card center-stage with WHY NOW, three peeking behind it (trust, not
 * choice), the day bar with locked promises, and the live "אפס אבודים" counter.
 * Space = take the card (opens the lead in speak face). 0 = quick no-answer.
 */
import * as React from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, PhoneOff, ShieldCheck, Space } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";

export interface DeskCard {
  id: number;
  fullName: string;
  phone: string | null;
  amount: number | null;
  actionType: string;
  actionLabel: string;
  dueAt: string | null;
  tone: string;
  contextLabel: string;
  overdueMin: number;
}

const TONE_BORDER: Record<string, string> = {
  blue: "border-bingo-blue", purple: "border-status-purple", amber: "border-[#f59e0b]",
  teal: "border-teal-500", orange: "border-[#fb923c]", green: "border-bingo-green",
  gold: "border-[#eab308]", gray: "border-bingo-gray-300",
};
const TONE_CHIP: Record<string, string> = {
  blue: "b-chip-blue", purple: "b-chip-blue", amber: "b-chip-orange", teal: "b-chip-blue",
  orange: "b-chip-orange", green: "b-chip-green", gold: "b-chip-orange", gray: "b-chip-gray",
};

function whyNow(c: DeskCard): string {
  if (c.overdueMin > 15) return `${c.actionLabel} — באיחור של ${c.overdueMin >= 60 ? `${Math.floor(c.overdueMin / 60)} שע׳` : `${c.overdueMin} דק׳`}`;
  if (c.dueAt && c.overdueMin === 0) {
    const t = new Date(c.dueAt).toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" });
    return `${c.actionLabel} — מתוזמן ל-${t}`;
  }
  return `${c.actionLabel} — עכשיו. אתה בזמן.`;
}

export function DeskClient({ cards: initial }: { cards: DeskCard[] }) {
  const router = useRouter();
  const [cards, setCards] = React.useState(initial);
  const top = cards[0] ?? null;

  const take = React.useCallback(() => {
    if (top) router.push(`/leads/${top.id}?from=desk`);
  }, [top, router]);

  const noAnswer = React.useCallback(() => {
    if (!top) return;
    void fetch(`/api/leads/${top.id}/activities`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "call", text: "אין מענה (מהשולחן) — חוזר בעוד שעה" }),
    });
    // requeue locally: card returns in an hour
    setCards((cs) => {
      const [first, ...rest] = cs;
      const requeued = { ...first, dueAt: new Date(Date.now() + 3600_000).toISOString(), overdueMin: 0 };
      return [...rest, requeued];
    });
  }, [top]);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.code === "Space" || e.key === "Enter" || e.key === "1") { e.preventDefault(); take(); }
      if (e.key === "0") { e.preventDefault(); noAnswer(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [take, noAnswer]);

  // day bar: today's future-scheduled promises
  const pinned = cards
    .filter((c) => c.dueAt && new Date(c.dueAt).getTime() > Date.now() && new Date(c.dueAt).toDateString() === new Date().toDateString())
    .slice(0, 8);
  const overdue = cards.filter((c) => c.overdueMin > 15).length;

  return (
    <div className="max-w-[1100px] mx-auto">
      {/* ---- day bar ---- */}
      <div className="b-card px-4 py-2.5 mb-8 flex items-center gap-3 overflow-x-auto scrollbar-none">
        <span className="b-eyebrow shrink-0">רצועת היום</span>
        {pinned.length === 0 && <span className="text-[12px] text-bingo-gray-400">אין הבטחות מתוזמנות קדימה</span>}
        {pinned.map((p) => (
          <span key={p.id} className="inline-flex items-center gap-1.5 rounded-full bg-status-blue-soft px-2.5 py-1 text-[11.5px] font-bold text-bingo-blue whitespace-nowrap shrink-0">
            {new Date(p.dueAt!).toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" })} · {p.fullName.split(" ")[0]}
          </span>
        ))}
        <span className="mr-auto shrink-0 inline-flex items-center gap-1.5 text-[12px] font-bold">
          <ShieldCheck className="size-4 text-bingo-green-dark" />
          לידים בלי צעד הבא: <span className="text-bingo-green-deep text-[15px]">0</span>
          <span className="text-bingo-gray-300 font-medium">· פתוחים: {cards.length}{overdue > 0 && <span className="text-status-red font-bold"> · באיחור: {overdue}</span>}</span>
        </span>
      </div>

      {/* ---- the dealt card ---- */}
      {!top ? (
        <div className="b-card p-16 text-center">
          <h2 className="text-[28px] font-extrabold text-bingo-black">זהו. השולחן נקי 🎉</h2>
          <p className="text-[14px] text-bingo-gray-500 mt-2">כל הלידים הפעילים מטופלים — אין אף צעד ממתין.</p>
        </div>
      ) : (
        <div className="relative flex flex-col items-center" style={{ perspective: 1200 }}>
          {/* peeking next cards — trust, not choice */}
          {cards.slice(1, 4).map((c, i) => (
            <div
              key={c.id}
              aria-hidden
              className="absolute inset-x-0 mx-auto b-card h-24 opacity-40 blur-[1.5px]"
              style={{ width: `${74 - i * 4}%`, top: -14 * (i + 1), zIndex: -1 - i, transform: `scale(${1 - (i + 1) * 0.03})` }}
            />
          ))}

          <AnimatePresence mode="popLayout">
            <motion.div
              key={top.id}
              initial={{ y: -24, opacity: 0, rotateX: 8 }}
              animate={{ y: 0, opacity: 1, rotateX: 0 }}
              exit={{ y: 60, opacity: 0, transition: { duration: 0.25 } }}
              transition={{ type: "spring", stiffness: 300, damping: 26 }}
              className={cn("b-card w-[78%] min-w-80 p-10 border-t-4 text-center", TONE_BORDER[top.tone])}
            >
              {/* why now — the sentence that replaces every list in the company */}
              <p className={cn("inline-flex items-center gap-2 rounded-full px-3 py-1 text-[13px] font-bold b-chip mb-5", TONE_CHIP[top.tone], top.overdueMin > 15 && "b-chip-red")}>
                {whyNow(top)}
              </p>

              <h1 className="text-[40px] font-extrabold text-bingo-black leading-tight">{top.fullName}</h1>
              <p className="text-[13.5px] text-bingo-gray-500 mt-1">{top.contextLabel}
                {top.amount ? <span className="font-bold text-bingo-black"> · {formatCurrency(top.amount)}</span> : null}
              </p>

              <p className="text-[34px] font-bold tabular-nums text-bingo-black mt-6 tracking-wide" dir="ltr">
                {top.phone || "— אין טלפון —"}
              </p>

              <div className="flex items-center justify-center gap-3 mt-8">
                <button onClick={take} className="b-pill b-pill-green b-pill-lg h-16 px-10 text-[18px]">
                  <Phone className="size-5" /> קח את הקלף
                  <span className="inline-flex items-center gap-1 rounded-lg bg-black/10 px-2 py-1 text-[11px] font-bold"><Space className="size-3" /> רווח</span>
                </button>
                <button onClick={noAnswer} className="b-pill b-pill-ghost b-pill-lg h-16">
                  <PhoneOff className="size-4" /> אין מענה
                  <kbd className="rounded bg-bingo-gray-100 px-1.5 text-[10px] font-bold">0</kbd>
                </button>
              </div>
            </motion.div>
          </AnimatePresence>

          <p className="mt-10 text-[11.5px] text-bingo-gray-400">
            אתה לא בוחר את הקלף — הרֶצֶף בוחר בשבילך. הבאים בתור מציצים מאחור.
          </p>
        </div>
      )}
    </div>
  );
}
