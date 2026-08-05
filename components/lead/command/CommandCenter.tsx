"use client";
/**
 * מרכז השליטה — כרטיס הלקוח בכיוון E (docs/command-center-research.md, קומפוזיציה B):
 * במת אובסידיאן, כותרת פסק-דין, 4 טאבים, ובנטו מדדי-גיבור בעמוד השיחה.
 * רץ על אותו מנוע נתונים כמו v4: useClassicCard (autosave) + catalogClient.
 * מקלדת: Alt+1-4 טאבים · 1/2 תשובת השער הנוכחי · הכל עם רמז מקש על הכפתור.
 * העטיפה מסומנת .dark כדי שקומפוננטות Catalyst בפנים ירונדרו בגרסת הדארק שלהן.
 */
import * as React from "react";
import { Phone, Send, Mail, MessageCircle, PhoneCall, ShieldCheck, FileClock, Coins } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Avatar } from "@/components/catalyst/avatar";
import { useClassicCard } from "@/components/classic/useClassicCard";
import { useAgreement } from "@/components/lead/v4/page1/useAgreement";
import { catalogClient, CLIENT_COLOR_META } from "@/lib/catalog";
import { cn, relativeTime } from "@/lib/utils";
import { CountUp, SPRING_ENTRANCE, SPRING_SNAPPY, TWEEN_REDUCED } from "@/components/lead/v4/ep";
import type { CardV4Props } from "@/components/lead/v4/CardV4";
import type { SentFormRow } from "@/components/lead/cockpit/shared";
import { ActionPill } from "./shared";
import { BentoTalk } from "./BentoTalk";
import { ChecksTab } from "./ChecksTab";
import { DocsTab } from "./DocsTab";
import { FinanceTab } from "./FinanceTab";

export interface CommandCenterProps extends CardV4Props {
  initialForms: SentFormRow[];
}

const TABS = [
  { n: 1, label: "שיחה ושאלון", Icon: PhoneCall },
  { n: 2, label: "בדיקות זכאות", Icon: ShieldCheck },
  { n: 3, label: "תיעוד", Icon: FileClock },
  { n: 4, label: "כספים", Icon: Coins },
] as const;

/* צבעי גלולת פסק-הדין לפי קטלוג הלקוח */
const VERDICT: Record<string, { fg: string; bg: string; br: string }> = {
  green: { fg: "#50FF0A", bg: "rgba(80,255,10,.12)", br: "rgba(80,255,10,.35)" },
  blue: { fg: "#3D9BFF", bg: "rgba(61,155,255,.12)", br: "rgba(61,155,255,.35)" },
  orange: { fg: "#FFB224", bg: "rgba(255,178,36,.12)", br: "rgba(255,178,36,.35)" },
  red: { fg: "#FF5D5D", bg: "rgba(255,93,93,.12)", br: "rgba(255,93,93,.35)" },
  none: { fg: "#8B93A1", bg: "rgba(255,255,255,.06)", br: "rgba(255,255,255,.14)" },
};

function tabFromHash(): number {
  if (typeof window === "undefined") return 1;
  const m = /^#p([1-4])$/.exec(window.location.hash);
  return m ? Number(m[1]) : 1;
}

export function CommandCenter(props: CommandCenterProps) {
  const state = useClassicCard({
    lead: props.lead,
    initialValues: props.initialValues,
    initialActivities: props.initialActivities,
    initialProcesses: props.initialProcesses,
  });
  const catalog = React.useMemo(() => catalogClient(state.values), [state.values]);
  const reduced = !!useReducedMotion();
  const agreement = useAgreement(state, !catalog.tracks.general && catalog.tracks.vehicle);

  /* חתום? — משרת עד שה-hook טוען, ואז ממנו (הוא מרענן בפולינג) */
  const signedFromServer = props.initialForms.some((f) => f.status === "signed");
  const signed = agreement.forms === null ? signedFromServer : agreement.signed;

  /* ---------- רישום צפייה ---------- */
  const viewSent = React.useRef(false);
  React.useEffect(() => {
    if (viewSent.current) return;
    viewSent.current = true;
    void fetch(`/api/leads/${props.lead.id}/view`, { method: "POST" }).catch(() => {});
  }, [props.lead.id]);

  /* ---------- טאבים: hash + Alt+1-4 ---------- */
  const [tab, setTab] = React.useState(1);
  React.useEffect(() => { setTab(tabFromHash()); }, []);
  const goTo = React.useCallback((n: number) => {
    setTab(n);
    try { history.replaceState(null, "", `#p${n}`); } catch { /* noop */ }
  }, []);
  React.useEffect(() => {
    const onHash = () => setTab(tabFromHash());
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

  const verdict = VERDICT[catalog.clientColor ?? "none"];
  const colorMeta = catalog.clientColor ? CLIENT_COLOR_META[catalog.clientColor] : null;
  const initials = props.lead.fullName.trim().charAt(0) || "?";
  const daysIn = Math.max(0, Math.floor((Date.now() - new Date(props.meta.intakeDate).getTime()) / 86400000));

  const tabProps = { state, meta: props.meta, catalog };

  return (
    <div dir="rtl" className="dark cmd-root mx-auto max-w-7xl px-5 py-5 pb-8 min-h-[calc(100dvh-120px)]">
      {/* ---------- הכותרת ---------- */}
      <motion.header
        initial={reduced ? { opacity: 0 } : { opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={reduced ? TWEEN_REDUCED : SPRING_ENTRANCE}
        className="flex items-center gap-3.5 flex-wrap"
      >
        <Avatar
          initials={initials}
          className="size-11 rounded-[14px] bg-[#1A212B] text-[#50FF0A] font-extrabold border border-white/[.08] [--avatar-radius:14px]"
          square
          alt=""
        />
        <div className="min-w-0">
          <h1 className="text-[19px] font-extrabold leading-tight truncate" style={{ color: "var(--cmd-tx)" }}>
            {props.lead.fullName}
          </h1>
          <p className="text-[12px] tabular-nums" style={{ color: "var(--cmd-tx2)" }}>
            {props.lead.phone && <span dir="ltr">{props.lead.phone}</span>}
            {props.lead.phone && " · "}
            ליד #{props.lead.id} · נכנס {daysIn === 0 ? "היום" : `לפני ${daysIn === 1 ? "יום" : `${daysIn} ימים`}`}
            {props.meta.ownerName && <> · באחריות {props.meta.ownerName}</>}
          </p>
        </div>

        {/* גלולת פסק-הדין */}
        <span
          className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-[13.5px] font-extrabold"
          style={{ color: verdict.fg, background: verdict.bg, border: `1px solid ${verdict.br}` }}
          title={catalog.hint}
          aria-live="polite"
        >
          <span
            className={cn("cmd-dot", catalog.clientColor === "green" && "cmd-dot--live")}
            style={{ background: verdict.fg, boxShadow: catalog.clientColor === "green" ? undefined : "none" }}
            aria-hidden
          />
          {catalog.label}
          {colorMeta && <small className="font-semibold opacity-70">· {colorMeta.name}</small>}
        </span>

        {/* פעולות — "חייג" הוא הליים היחיד */}
        <div className="ms-auto flex items-center gap-2 flex-wrap">
          <ActionPill onClick={() => void agreement.openEmail()} disabled={!agreement.hasEmail} title={agreement.hasEmail ? undefined : "אין כתובת מייל בכרטיס"}>
            <Mail className="size-4" strokeWidth={1.75} /> מייל
          </ActionPill>
          <ActionPill onClick={() => void agreement.sendAgreement()} disabled={agreement.sending}>
            <Send className="size-4" strokeWidth={1.75} />
            {agreement.sending ? "שולח..." : signed ? "הסכם נחתם ✓" : "שלח הסכם"}
          </ActionPill>
          <ActionPill onClick={() => void agreement.openWhatsApp()} disabled={!agreement.hasPhone} title={agreement.hasPhone ? undefined : "אין טלפון בכרטיס"}>
            <MessageCircle className="size-4" strokeWidth={1.75} /> וואטסאפ
          </ActionPill>
          <ActionPill
            lime={dialState !== "error"}
            danger={dialState === "error"}
            onClick={() => void dial()}
            disabled={dialState === "dialing"}
          >
            <Phone className="size-4" strokeWidth={1.75} />
            {dialState === "dialing" ? "מחייג..." : dialState === "error" ? "החיוג נכשל" : "חייג"}
          </ActionPill>
        </div>
      </motion.header>

      {/* ---------- הטאבים ---------- */}
      <nav aria-label="עמודי הכרטיס" className="mt-4 mb-4">
        <div
          className="inline-flex gap-1 p-1 rounded-[12px] flex-wrap"
          style={{ background: "var(--cmd-panel)", border: "1px solid var(--cmd-line)" }}
        >
          {TABS.map(({ n, label, Icon }) => (
            <button
              key={n}
              type="button"
              onClick={() => goTo(n)}
              aria-current={tab === n ? "page" : undefined}
              className={cn(
                "relative rounded-[9px] px-4 h-10 text-[13px] font-bold inline-flex items-center gap-2 cursor-pointer",
                "transition-colors duration-150",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#50FF0A]",
              )}
              style={{ color: tab === n ? "var(--cmd-tx)" : "var(--cmd-tx2)" }}
            >
              {tab === n && (
                <motion.span
                  layoutId="cmd-tab"
                  transition={reduced ? TWEEN_REDUCED : SPRING_SNAPPY}
                  className="absolute inset-0 rounded-[9px]"
                  style={{ background: "var(--cmd-panel2)", boxShadow: "inset 0 0 0 1px rgba(80,255,10,.4)" }}
                />
              )}
              <Icon className="size-4 relative z-[1]" strokeWidth={1.75} aria-hidden />
              <span className="relative z-[1]">{label}</span>
              <span className="cmd-kbd relative z-[1] hidden sm:grid" aria-hidden>Alt+{n}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* ---------- העמוד הפעיל ---------- */}
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.main
          key={tab}
          initial={reduced ? { opacity: 0 } : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: reduced ? 0 : -8, transition: { duration: 0.14 } }}
          transition={reduced ? TWEEN_REDUCED : SPRING_ENTRANCE}
        >
          {tab === 1 && (
            <BentoTalk
              {...tabProps}
              summary={props.summary}
              timeline={props.timeline}
              signed={signed}
              agreement={agreement}
              onOpenChecks={() => goTo(2)}
            />
          )}
          {tab === 2 && <ChecksTab {...tabProps} />}
          {tab === 3 && <DocsTab {...tabProps} timeline={props.timeline} />}
          {tab === 4 && <FinanceTab {...tabProps} initialInvoices={props.invoices} />}
        </motion.main>
      </AnimatePresence>

      {/* ---------- תחתית: LIVE + סטטוס שמירה ---------- */}
      <footer className="mt-4 flex items-center gap-2 text-[11.5px]" style={{ color: "var(--cmd-tx3)" }}>
        <span className="inline-flex items-center gap-1.5 font-bold" style={{ color: "var(--cmd-lime)" }}>
          <span className="cmd-dot cmd-dot--live" aria-hidden /> LIVE
        </span>
        <span>מרכז שליטה · בינגו CRM</span>
        <span className="ms-auto" aria-live="polite">
          {state.saveState === "saving" ? "שומר..." : state.saveState === "error" ? "שגיאת שמירה - ננסה שוב אוטומטית" : "כל השינויים נשמרו"}
        </span>
      </footer>
    </div>
  );
}
