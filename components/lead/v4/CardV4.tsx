"use client";
/**
 * Card v4 — המעטפת של כרטיס הדגל החדש, בשפת "נייר חשמלי".
 * הכותרת = אי אובסידיאן (הבמה הכהה): שם + קטלוג זוהר + פעולות זכוכית-על-כהה,
 * רצועת סיכום עם מונה ליים, ופיידר 4 עמודים עם אריחי 3D וזחילת layoutId.
 *
 * חוזה אירועים לעמוד 1 (cardv4:action):
 *   הכפתורים "שלח הסכם" / "וואטסאפ" / "מייל" בכותרת יורים
 *   window.dispatchEvent(new CustomEvent("cardv4:action", { detail: { action } }))
 *   עם action אחד מ: "send-agreement" | "whatsapp" | "email".
 *   עמוד 1 מאזין לאירוע ומבצע את הפעולה בהקשר השיחה. "חייג" לא עובר דרך
 *   האירוע — הוא מחייג ישירות (POST /api/calls/dial { leadId }).
 *   כשהלחיצה נעשית מעמוד 2-4 (המאזין לא קיים) — הפעולה נשמרת כ-pendingAction,
 *   הכרטיס מנווט לעמוד 1, ועמוד 1 מבצע אותה דרך הפרופ ומאשר ב-onPendingActionConsumed.
 */
import * as React from "react";
import { Phone, Send, Mail, MessageCircle } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useClassicCard } from "@/components/classic/useClassicCard";
import type { ClassicLeadDTO, ClassicActivity, ClassicProcess, UserOption } from "@/components/classic/useClassicCard";
import type { ClassicValues } from "@/lib/yoatsim/values";
import { catalogClient, CLIENT_COLOR_META } from "@/lib/catalog";
import { cn, formatCurrency, relativeTime } from "@/lib/utils";
import type { CardV4Meta, CardV4Summary, CardV4QuickAction, TimelineItem, InvoiceDTO } from "./types";
import { SPRING_ENTRANCE, SPRING_SNAPPY, TWEEN_REDUCED } from "./ep";
import Page1Talk from "./page1";
import { Page2Checks } from "./Page2Checks";
import { Page3Timeline } from "./Page3Timeline";
import { Page4Finance } from "./Page4Finance";

export interface CardV4Props {
  lead: ClassicLeadDTO;
  meta: CardV4Meta;
  initialValues: ClassicValues;
  initialActivities: ClassicActivity[];
  initialProcesses: ClassicProcess[];
  users: UserOption[];
  summary: CardV4Summary;
  timeline: TimelineItem[];
  invoices: InvoiceDTO[];
}

const PAGES = [
  { n: 1, label: "שיחה ושאלון", icon: "phone" },
  { n: 2, label: "בדיקות זכאות", icon: "shield-check" },
  { n: 3, label: "תיעוד", icon: "hourglass" },
  { n: 4, label: "כספים", icon: "coins" },
] as const;

function fireAction(action: CardV4QuickAction) {
  window.dispatchEvent(new CustomEvent("cardv4:action", { detail: { action } }));
}

function pageFromHash(): number {
  if (typeof window === "undefined") return 1;
  const m = /^#p([1-4])$/.exec(window.location.hash);
  return m ? Number(m[1]) : 1;
}

/* גלולת זכוכית-על-כהה לפעולות המהירות באי */
function IslandPill({ onClick, disabled, lime, danger, reduced, children, ...rest }: {
  onClick: () => void;
  disabled?: boolean;
  /** הגלולה הזוהרת היחידה באי — "חייג" */
  lime?: boolean;
  /** מצב כשל — גלולת אדום רך (למשל "החיוג נכשל") */
  danger?: boolean;
  reduced: boolean;
  children: React.ReactNode;
} & Pick<React.ButtonHTMLAttributes<HTMLButtonElement>, "aria-label">) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={disabled}
      whileHover={reduced ? undefined : { y: -2 }}
      whileTap={reduced ? undefined : { scale: 0.97 }}
      transition={SPRING_SNAPPY}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-4 min-h-11 text-[13px] font-bold",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#50FF0A]",
        "disabled:opacity-60",
        danger
          ? "bg-[#FF4A2E]/15 text-[#FF6B5E] border border-[#FF4A2E]/40"
          : lime
            ? "bg-[#50FF0A] text-[#292929]"
            : "text-[#FAFAF9] bg-white/[.08] border border-white/[.14] hover:bg-white/[.14]",
      )}
      style={!danger && lime ? { boxShadow: "0 0 22px -4px rgba(80,255,10,.55), 0 4px 12px rgba(0,0,0,.3)" } : undefined}
      {...rest}
    >
      {children}
    </motion.button>
  );
}

export function CardV4(props: CardV4Props) {
  const state = useClassicCard({
    lead: props.lead,
    initialValues: props.initialValues,
    initialActivities: props.initialActivities,
    initialProcesses: props.initialProcesses,
  });
  const catalog = React.useMemo(() => catalogClient(state.values), [state.values]);
  const reduced = !!useReducedMotion();

  /* ---------- רישום צפייה — פעם אחת, fire-and-forget ---------- */
  const viewSent = React.useRef(false);
  React.useEffect(() => {
    if (viewSent.current) return;
    viewSent.current = true;
    void fetch(`/api/leads/${props.lead.id}/view`, { method: "POST" }).catch(() => {});
  }, [props.lead.id]);

  /* ---------- פיידר: hash sync + Alt+1..4 ---------- */
  const [page, setPage] = React.useState(1);
  React.useEffect(() => { setPage(pageFromHash()); }, []);
  const goTo = React.useCallback((n: number) => {
    setPage(n);
    try { history.replaceState(null, "", `#p${n}`); } catch { /* noop */ }
  }, []);
  React.useEffect(() => {
    const onHash = () => setPage(pageFromHash());
    const onKey = (e: KeyboardEvent) => {
      if (e.altKey && !e.ctrlKey && !e.metaKey && ["1", "2", "3", "4"].includes(e.key)) {
        e.preventDefault();
        goTo(Number(e.key));
      }
    };
    window.addEventListener("hashchange", onHash);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("hashchange", onHash);
      window.removeEventListener("keydown", onKey);
    };
  }, [goTo]);

  /* ---------- פעולות מהירות מהכותרת ----------
     בעמוד 1 המאזין של Page1Talk קיים — יורים אירוע כרגיל. בעמודים 2-4 המאזין
     לא מורכב, לכן שומרים את הפעולה ומנווטים לעמוד 1; הניווט עצמו הוא הפידבק. */
  const [pendingAction, setPendingAction] = React.useState<CardV4QuickAction | null>(null);
  const quickAction = React.useCallback((action: CardV4QuickAction) => {
    if (page === 1) {
      fireAction(action);
    } else {
      setPendingAction(action);
      goTo(1);
    }
  }, [page, goTo]);

  /* ---------- חיוג ---------- */
  const [dialState, setDialState] = React.useState<"idle" | "dialing" | "error">("idle");
  const dial = React.useCallback(async () => {
    if (dialState === "dialing") return;
    setDialState("dialing");
    try {
      const res = await fetch("/api/calls/dial", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId: props.lead.id }),
      });
      setDialState(res.ok ? "idle" : "error");
    } catch {
      setDialState("error");
    }
    setTimeout(() => setDialState("idle"), 2500);
  }, [dialState, props.lead.id]);

  /* ---------- רצועת הסיכום ---------- */
  const amount = String(state.values.amountRequested ?? "").replace(/\D/g, "");
  const purpose = String(state.values.loanPurpose ?? "");
  const { summary } = props;

  const colorMeta = catalog.clientColor ? CLIENT_COLOR_META[catalog.clientColor] : null;

  const pageProps = { state, meta: props.meta, catalog };

  return (
    <div dir="rtl" className="max-w-5xl mx-auto space-y-4 pb-16">
      {/* ---------- הכותרת: אי אובסידיאן דביק ---------- */}
      <motion.header
        initial={reduced ? { opacity: 0 } : { opacity: 0, y: -14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={reduced ? TWEEN_REDUCED : SPRING_ENTRANCE}
        className="ep-island sticky top-2 z-30 px-6 pt-5 pb-4"
        /* ‎.ep-island מגדיר position:relative — הדביקות חייבת לנצח אינליין */
        style={{ position: "sticky" }}
      >
        <div className="flex items-start justify-between gap-4 flex-wrap">
          {/* צד ימין: שם + טלפון + קטלוג */}
          <div className="flex items-center gap-3.5 flex-wrap min-w-0">
            <h1 className="text-[28px] font-bold text-[#FAFAF9] leading-tight truncate">
              {props.lead.fullName}
            </h1>
            {props.lead.phone && (
              <span dir="ltr" className="text-[14px] text-[#C9C9C5] tabular-nums">
                {props.lead.phone}
              </span>
            )}
            {/* תג צבע הלקוח — גלולה זוהרת על הבמה הכהה */}
            <span
              title={catalog.hint}
              className="inline-flex items-center gap-2 rounded-full px-4 h-9 text-[13px] font-bold border"
              style={colorMeta
                ? { background: "rgba(255,255,255,.07)", borderColor: "rgba(255,255,255,.16)", color: "#FAFAF9" }
                : { background: "rgba(255,255,255,.04)", borderColor: "rgba(255,255,255,.1)", color: "#A8AAA5" }}
            >
              <span
                className="size-2.5 rounded-full shrink-0"
                style={{
                  background: colorMeta ? colorMeta.hex : "#A8AAA5",
                  boxShadow: colorMeta ? `0 0 10px ${colorMeta.hex}, 0 0 3px ${colorMeta.hex}` : "none",
                }}
              />
              {catalog.label}
            </span>
          </div>

          {/* צד שמאל: פעולות מהירות — זכוכית על כהה, "חייג" הוא הליים היחיד */}
          <div className="flex items-center gap-2 flex-wrap">
            <IslandPill reduced={reduced} onClick={() => quickAction("send-agreement")}>
              <Send className="size-4" strokeWidth={1.75} /> שלח הסכם
            </IslandPill>
            <IslandPill reduced={reduced} onClick={() => quickAction("whatsapp")}>
              <MessageCircle className="size-4" strokeWidth={1.75} /> וואטסאפ
            </IslandPill>
            <IslandPill reduced={reduced} onClick={() => quickAction("email")}>
              <Mail className="size-4" strokeWidth={1.75} /> מייל
            </IslandPill>
            <IslandPill
              reduced={reduced}
              lime={dialState !== "error"}
              danger={dialState === "error"}
              onClick={() => void dial()}
              disabled={dialState === "dialing"}
            >
              <Phone className="size-4" strokeWidth={1.75} />
              {dialState === "dialing" ? "מחייג..." : dialState === "error" ? "החיוג נכשל" : "חייג"}
            </IslandPill>
          </div>
        </div>

        {/* ---------- רצועת סיכום ---------- */}
        <p className="mt-3 text-[12.5px] text-[#9C9C98] leading-relaxed">
          {amount ? (
            <span>
              ביקש{" "}
              {/* טקסט סטטי — CountUp כאן רץ מחדש על כל הקשה בשדה הסכום */}
              <b className="text-[#50FF0A] ep-neon font-bold tabular-nums text-[13.5px]">
                {formatCurrency(Number(amount))}
              </b>
              {purpose ? ` ל${purpose}` : ""}
            </span>
          ) : (
            <span>סכום מבוקש טרם צוין</span>
          )}
          <span className="mx-2 text-white/20">·</span>
          <span>
            {summary.lastCallAt
              ? <>שיחה אחרונה: <span className="text-[#FAFAF9]">{relativeTime(summary.lastCallAt)}</span></>
              : "עוד לא נערכה שיחה"}
          </span>
          <span className="mx-2 text-white/20">·</span>
          <span>
            {summary.openTask
              ? <>משימה פתוחה: <span className="text-[#FAFAF9]">{summary.openTask.text}</span></>
              : "אין משימות פתוחות"}
          </span>
          <span className="mx-2 text-white/20">·</span>
          <span>
            {summary.lastView
              ? <>נצפה לאחרונה: <span className="text-[#FAFAF9]">{summary.lastView.userName ?? "משתמש"}</span> · {relativeTime(summary.lastView.at)}</>
              : "צפייה ראשונה בכרטיס"}
          </span>
        </p>

        {/* ---------- הפיידר — על שפת האי ---------- */}
        <nav aria-label="עמודי הכרטיס" className="mt-4">
          <div className="rounded-full bg-white/[.06] border border-white/[.08] p-1 inline-flex gap-1 flex-wrap">
            {PAGES.map((p) => (
              <button
                key={p.n}
                type="button"
                onClick={() => goTo(p.n)}
                aria-current={page === p.n ? "page" : undefined}
                className={cn(
                  "relative rounded-full ps-2.5 pe-4 h-11 text-[13px] font-bold inline-flex items-center gap-2",
                  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#50FF0A]",
                  "transition-colors duration-150",
                  page === p.n ? "text-[#292929]" : "text-white/70 hover:text-white",
                )}
              >
                {page === p.n && (
                  <motion.span
                    layoutId="cardv4-tab"
                    transition={reduced ? TWEEN_REDUCED : SPRING_SNAPPY}
                    className="absolute inset-0 rounded-full bg-[#FAFAF9]"
                    style={{ boxShadow: "0 8px 20px -8px rgba(80,255,10,.6), 0 2px 8px rgba(0,0,0,.35)" }}
                  />
                )}
                <span className="ep-icon3d relative z-[1]" style={{ width: 22, height: 22, borderRadius: 7 }} aria-hidden>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={`/icons3d/${p.icon}.webp`} alt="" />
                </span>
                <span className="relative z-[1]">{p.label}</span>
              </button>
            ))}
          </div>
        </nav>
      </motion.header>

      {/* ---------- העמוד הפעיל ---------- */}
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.main
          key={page}
          initial={reduced ? { opacity: 0 } : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: reduced ? 0 : -10, transition: { duration: 0.14 } }}
          transition={reduced ? TWEEN_REDUCED : SPRING_ENTRANCE}
        >
          {page === 1 && (
            <Page1Talk
              {...pageProps}
              pendingAction={pendingAction}
              onPendingActionConsumed={() => setPendingAction(null)}
            />
          )}
          {page === 2 && <Page2Checks {...pageProps} />}
          {page === 3 && (
            <Page3Timeline {...pageProps} timeline={props.timeline} users={props.users} />
          )}
          {page === 4 && (
            <Page4Finance {...pageProps} initialInvoices={props.invoices} />
          )}
        </motion.main>
      </AnimatePresence>
    </div>
  );
}

export type { CardV4Meta, CardV4Summary, TimelineItem, InvoiceDTO };
