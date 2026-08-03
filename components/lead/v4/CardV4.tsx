"use client";
/**
 * Card v4 — המעטפת של כרטיס הדגל החדש.
 * כותרת דביקה (שם + קטלוג צבע + פעולות מהירות) · רצועת סיכום · פיידר 4 עמודים.
 *
 * חוזה אירועים לעמוד 1 (cardv4:action):
 *   הכפתורים "שלח הסכם" / "וואטסאפ" / "מייל" בכותרת יורים
 *   window.dispatchEvent(new CustomEvent("cardv4:action", { detail: { action } }))
 *   עם action אחד מ: "send-agreement" | "whatsapp" | "email".
 *   עמוד 1 מאזין לאירוע ומבצע את הפעולה בהקשר השיחה. "חייג" לא עובר דרך
 *   האירוע — הוא מחייג ישירות (POST /api/calls/dial { leadId }).
 */
import * as React from "react";
import { Phone, Send, Mail, MessageCircle } from "lucide-react";
import { useClassicCard } from "@/components/classic/useClassicCard";
import type { ClassicLeadDTO, ClassicActivity, ClassicProcess, UserOption } from "@/components/classic/useClassicCard";
import type { ClassicValues } from "@/lib/yoatsim/values";
import { catalogClient, CLIENT_COLOR_META } from "@/lib/catalog";
import { cn, formatCurrency, relativeTime } from "@/lib/utils";
import type { CardV4Meta, CardV4Summary, TimelineItem, InvoiceDTO } from "./types";
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
  { n: 1, label: "שיחה ושאלון" },
  { n: 2, label: "בדיקות זכאות" },
  { n: 3, label: "תיעוד" },
  { n: 4, label: "כספים" },
] as const;

type HeaderAction = "send-agreement" | "whatsapp" | "email";

function fireAction(action: HeaderAction) {
  window.dispatchEvent(new CustomEvent("cardv4:action", { detail: { action } }));
}

function pageFromHash(): number {
  if (typeof window === "undefined") return 1;
  const m = /^#p([1-4])$/.exec(window.location.hash);
  return m ? Number(m[1]) : 1;
}

export function CardV4(props: CardV4Props) {
  const state = useClassicCard({
    lead: props.lead,
    initialValues: props.initialValues,
    initialActivities: props.initialActivities,
    initialProcesses: props.initialProcesses,
  });
  const catalog = React.useMemo(() => catalogClient(state.values), [state.values]);

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
  const askLine = amount
    ? `ביקש ${formatCurrency(Number(amount))}${purpose ? ` ל${purpose}` : ""}`
    : "סכום מבוקש טרם צוין";
  const { summary } = props;

  const colorMeta = catalog.clientColor ? CLIENT_COLOR_META[catalog.clientColor] : null;

  const pageProps = { state, meta: props.meta, catalog };

  return (
    <div dir="rtl" className="max-w-5xl mx-auto space-y-4 pb-16">
      {/* אנימציית הכניסה של העמודים — transform+opacity בלבד, מכבדת reduced-motion */}
      <style>{`
        @keyframes cardv4-page-enter {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .cardv4-page-enter { animation: cardv4-page-enter 200ms cubic-bezier(.16,1,.3,1) both; }
        @media (prefers-reduced-motion: reduce) {
          .cardv4-page-enter { animation: none; }
        }
      `}</style>

      {/* ---------- כותרת דביקה ---------- */}
      <header className="sticky top-0 z-30 bg-white rounded-[20px] border border-[#E6E8E4] px-6 py-4"
        style={{ boxShadow: "0 1px 2px rgba(0,0,0,.06)" }}>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          {/* צד ימין: שם + טלפון + קטלוג */}
          <div className="flex items-center gap-3 flex-wrap min-w-0">
            <h1 className="text-[22px] font-bold text-bingo-black leading-tight truncate">
              {props.lead.fullName}
            </h1>
            {props.lead.phone && (
              <span dir="ltr" className="text-[14px] text-bingo-gray-600 tabular-nums">
                {props.lead.phone}
              </span>
            )}
            {/* תג צבע הלקוח — מהקטלוג החי */}
            <span
              title={catalog.hint}
              className="inline-flex items-center gap-2 rounded-full px-4 h-9 text-[13.5px] font-bold"
              style={colorMeta
                ? { background: colorMeta.bg, color: "#292929" }
                : { background: "#F1F2F0", color: "#696967" }}
            >
              <span className="size-2.5 rounded-full shrink-0"
                style={{ background: colorMeta ? colorMeta.hex : "#A8AAA5" }} />
              {catalog.label}
            </span>
          </div>

          {/* צד שמאל: פעולות מהירות */}
          <div className="flex items-center gap-2 flex-wrap">
            <button type="button" onClick={() => fireAction("send-agreement")}
              className="b-pill b-pill-ghost b-pill-sm min-h-9">
              <Send className="size-4" strokeWidth={1.75} /> שלח הסכם
            </button>
            <button type="button" onClick={() => fireAction("whatsapp")}
              className="b-pill b-pill-ghost b-pill-sm min-h-9">
              <MessageCircle className="size-4" strokeWidth={1.75} /> וואטסאפ
            </button>
            <button type="button" onClick={() => fireAction("email")}
              className="b-pill b-pill-ghost b-pill-sm min-h-9">
              <Mail className="size-4" strokeWidth={1.75} /> מייל
            </button>
            <button type="button" onClick={() => void dial()} disabled={dialState === "dialing"}
              className="b-pill b-pill-dark b-pill-sm min-h-9 disabled:opacity-60">
              <Phone className="size-4" strokeWidth={1.75} />
              {dialState === "dialing" ? "מחייג..." : dialState === "error" ? "החיוג נכשל" : "חייג"}
            </button>
          </div>
        </div>

        {/* ---------- רצועת סיכום ---------- */}
        <p className="mt-3 text-[12.5px] text-bingo-gray-600 leading-relaxed">
          <span>{askLine}</span>
          <span className="mx-2 text-bingo-gray-300">·</span>
          <span>
            {summary.lastCallAt ? `שיחה אחרונה: ${relativeTime(summary.lastCallAt)}` : "עוד לא נערכה שיחה"}
          </span>
          <span className="mx-2 text-bingo-gray-300">·</span>
          <span>
            {summary.openTask ? `משימה פתוחה: ${summary.openTask.text}` : "אין משימות פתוחות"}
          </span>
          <span className="mx-2 text-bingo-gray-300">·</span>
          <span>
            {summary.lastView
              ? `נצפה לאחרונה: ${summary.lastView.userName ?? "משתמש"} · ${relativeTime(summary.lastView.at)}`
              : "צפייה ראשונה בכרטיס"}
          </span>
        </p>
      </header>

      {/* ---------- הפיידר ---------- */}
      <nav aria-label="עמודי הכרטיס"
        className="bg-white rounded-full border border-[#E6E8E4] p-1 inline-flex gap-1"
        style={{ boxShadow: "0 1px 2px rgba(0,0,0,.06)" }}>
        {PAGES.map((p) => (
          <button key={p.n} type="button" onClick={() => goTo(p.n)}
            aria-current={page === p.n ? "page" : undefined}
            className={cn(
              "rounded-full px-5 h-11 text-[13.5px] font-bold transition-colors duration-120",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bingo-black",
              page === p.n
                ? "bg-bingo-black text-white"
                : "text-bingo-gray-600 hover:bg-bingo-gray-100 active:bg-bingo-gray-150",
            )}>
            {p.label}
          </button>
        ))}
      </nav>

      {/* ---------- העמוד הפעיל ---------- */}
      <main key={page} className="cardv4-page-enter">
        {page === 1 && <Page1Talk {...pageProps} />}
        {page === 2 && <Page2Checks {...pageProps} />}
        {page === 3 && (
          <Page3Timeline {...pageProps} timeline={props.timeline} users={props.users} />
        )}
        {page === 4 && (
          <Page4Finance {...pageProps} initialInvoices={props.invoices} />
        )}
      </main>
    </div>
  );
}

export type { CardV4Meta, CardV4Summary, TimelineItem, InvoiceDTO };
