"use client";
/**
 * עמוד השיחה — בנטו מדדי-גיבור (קומפוזיציה B מהמחקר):
 * אריח-גיבור (הסכום + מד ציון תיק) · השאלון החי (שערי הסינון האמיתיים) ·
 * דיוקן הלקוח · בדיקות זכאות חיות · KPI · פיד פעילות.
 * הכל קורא-כותב דרך state.set (autosave) — אפס נתונים מומצאים.
 */
import * as React from "react";
import {
  Wallet, ShieldCheck, Briefcase, MapPin, Car, Landmark, Users, HelpCircle,
  Activity as ActivityIcon, Zap, BarChart3, CheckCircle2, Plus,
} from "lucide-react";
import { motion } from "framer-motion";
import OrgLogo from "@/components/ui/OrgLogo";
import {
  GATES, gateAnswered, gateFlagged, gateSummary, ramzorToDb,
} from "@/components/lead/cockpit/shared";
import type { GateDef } from "@/components/lead/cockpit/shared";
import { screeningState } from "@/lib/catalog";
import {
  CARD_LENDERS, LENDER_RESULT_Y, CREDIT_CARDS_Y, CARD_LIMIT_Y, LOAN_PURPOSES_YOATSIM,
} from "@/lib/yoatsim/card-schema";
import { cn, formatCurrency, relativeTime } from "@/lib/utils";
import { CountUp, useEpEntrance } from "@/components/lead/v4/ep";
import type { CardV4PageProps, CardV4Summary, TimelineItem } from "@/components/lead/v4/types";
import type { AgreementApi } from "@/components/lead/v4/page1/useAgreement";
import { Panel, PanelTitle, PortraitRow, sval, nval } from "./shared";

interface BentoProps extends CardV4PageProps {
  summary: CardV4Summary;
  timeline: TimelineItem[];
  signed: boolean;
  agreement: AgreementApi;
  onOpenChecks: () => void;
}

/* ---------- ציון התיק: כמה התיק שלם ומוכן להתקדם (תצוגה בלבד) ---------- */
function fileScore(p: BentoProps): { score: number; label: string } {
  const s = screeningState(p.state.values);
  let score = Math.round((s.answered / s.total) * 35);
  if (p.catalog.ramzor === "green") score += 25;
  else if (p.catalog.ramzor === "yellow") score += 12;
  if (nval(p.state.values, "amountRequested") > 0) score += 5;
  if (sval(p.state.values, "hasVehicleRaw")) score += 5;
  if (p.signed) score += 20;
  const anyApproved = CARD_LENDERS.some((l) => sval(p.state.values, `lender_${l.key}_result`) === "יש אישור");
  if (anyApproved) score += 10;
  score = Math.min(100, score);
  const label = score >= 80 ? "תיק חזק" : score >= 50 ? "תיק בבנייה" : "תחילת הדרך";
  return { score, label };
}

const logoSrc = (key: string) => `/logos/lenders/${key}.${key === "phoenix" ? "svg" : "png"}`;

export function BentoTalk(props: BentoProps) {
  const { state, catalog, summary, timeline, signed, agreement, onOpenChecks } = props;
  const { values, set } = state;
  const { parent, child } = useEpEntrance();

  const screening = screeningState(values);
  const gate = GATES.find((g) => !gateAnswered(g, values)) ?? null;
  const answered = GATES.filter((g) => gateAnswered(g, values));
  const { score, label: scoreLabel } = fileScore(props);

  /* ---------- מקלדת: 1/2 עונות על השער הפשוט הנוכחי ---------- */
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.altKey || e.ctrlKey || e.metaKey) return;
      const t = e.target as HTMLElement | null;
      if (t && ["INPUT", "SELECT", "TEXTAREA"].includes(t.tagName)) return;
      if (!gate || gate.combined) return;
      if (e.key === "1" && gate.good) { e.preventDefault(); set(gate.key, gate.good); }
      if (e.key === "2" && gate.bad) { e.preventDefault(); set(gate.key, gate.bad); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [gate, set]);

  /* ---------- נתוני עזר ---------- */
  const amount = nval(values, "amountRequested");
  const purpose = sval(values, "loanPurpose");
  const callsCount = timeline.filter((t) => t.kind === "call").length;
  const totalApproved = CARD_LENDERS.reduce((sum, l) =>
    sval(values, `lender_${l.key}_result`) === "יש אישור"
      ? sum + nval(values, `lender_${l.key}_amount`) : sum, 0);
  const approvedLenders = CARD_LENDERS.filter((l) => sval(values, `lender_${l.key}_result`) === "יש אישור").length;
  const daysIn = Math.max(0, Math.floor((Date.now() - new Date(props.meta.intakeDate).getTime()) / 86400000));
  const progressPct = Math.round((screening.answered / screening.total) * 100);

  /* ---------- הוספת הערה מהפיד ---------- */
  const [note, setNote] = React.useState("");
  const submitNote = () => {
    if (!note.trim()) return;
    state.addNote("note", note);
    setNote("");
  };

  /* קשת המד: היקף חצי-קשת r=60 ≈ 188 */
  const ARC = 188;

  return (
    <motion.div
      variants={parent}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-3 items-stretch"
    >
      {/* ================= אריח-הגיבור: הבקשה + ציון התיק ================= */}
      <Panel hero variants={child} className="xl:col-span-4 xl:row-span-2 flex flex-col min-h-[330px]">
        <PanelTitle icon={<Wallet className="size-3.5" strokeWidth={1.75} />}>הבקשה</PanelTitle>
        <div className="flex items-baseline gap-2 flex-wrap">
          <label className="sr-only" htmlFor="cmd-amount">סכום הלוואה מבוקש</label>
          <input
            id="cmd-amount"
            inputMode="numeric"
            dir="ltr"
            value={amount ? amount.toLocaleString("he-IL") : ""}
            placeholder="0"
            onChange={(e) => {
              const raw = e.target.value.replace(/\D/g, "");
              set("amountRequested", raw ? raw : undefined);
            }}
            className={cn(
              "bg-transparent border-0 p-0 text-[46px] font-black leading-none tabular-nums w-[7ch]",
              "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#50FF0A] rounded-md",
            )}
            style={{ color: "var(--cmd-tx)" }}
          />
          <span className="text-[22px] font-extrabold" style={{ color: "var(--cmd-lime)" }}>₪</span>
        </div>
        <div className="mt-2.5">
          <label className="sr-only" htmlFor="cmd-purpose">מטרת ההלוואה</label>
          <select
            id="cmd-purpose"
            className="cmd-input !min-h-10 !w-auto pe-8 text-[13px] font-semibold"
            value={purpose}
            onChange={(e) => set("loanPurpose", e.target.value || undefined)}
          >
            <option value="">מטרת ההלוואה...</option>
            {LOAN_PURPOSES_YOATSIM.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
        <p className="mt-3 text-[12.5px] leading-relaxed" style={{ color: "var(--cmd-tx2)" }}>
          {summary.lastCallAt ? <>שיחה אחרונה {relativeTime(summary.lastCallAt)}</> : "עוד לא נערכה שיחה"}
          {summary.openTask && <> · משימה פתוחה: {summary.openTask.text}</>}
        </p>

        {/* מד ציון התיק */}
        <div className="mt-auto relative h-[122px] grid place-items-center">
          <svg width="150" height="118" viewBox="0 0 150 118" className="absolute inset-0 m-auto" aria-hidden>
            <defs>
              <linearGradient id="cmd-g1" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" stopColor="#2B9410" />
                <stop offset="1" stopColor="#50FF0A" />
              </linearGradient>
            </defs>
            <path d="M15 105 A60 60 0 0 1 135 105" fill="none" strokeWidth="12" strokeLinecap="round" stroke="var(--cmd-panel2)" />
            <path
              d="M15 105 A60 60 0 0 1 135 105"
              fill="none" strokeWidth="12" strokeLinecap="round"
              stroke="url(#cmd-g1)"
              className="cmd-arc-val"
              strokeDasharray={ARC}
              strokeDashoffset={ARC - (ARC * score) / 100}
            />
          </svg>
          <div className="relative text-center top-[18px]">
            <b className="block text-[24px] font-black" style={{ color: "var(--cmd-lime)" }}>
              <CountUp value={score} />
            </b>
            <span className="text-[11px]" style={{ color: "var(--cmd-tx2)" }}>ציון תיק · {scoreLabel}</span>
          </div>
        </div>
      </Panel>

      {/* ================= השאלון החי ================= */}
      <Panel variants={child} className="xl:col-span-5 xl:row-span-2 flex flex-col min-h-[330px]">
        <PanelTitle icon={<HelpCircle className="size-3.5" strokeWidth={1.75} />}>
          {gate
            ? <>השאלון החי · שאלה {answered.length + 1} מתוך {GATES.length}</>
            : "השאלון הושלם"}
        </PanelTitle>

        {/* פס התקדמות מקטעי — מקטע לכל שער */}
        <div className="flex gap-1.5 mb-3" role="progressbar" aria-valuenow={answered.length} aria-valuemin={0} aria-valuemax={GATES.length} aria-label="התקדמות השאלון">
          {GATES.map((g, i) => (
            <i
              key={g.key}
              className="h-1 flex-1 rounded-full"
              style={i < answered.length
                ? { background: "var(--cmd-lime)", boxShadow: "0 0 8px rgba(80,255,10,.6)" }
                : { background: "var(--cmd-panel2)" }}
            />
          ))}
        </div>

        {gate && !gate.combined && (
          <>
            <p className="text-[20px] font-extrabold leading-snug mb-1.5" style={{ color: "var(--cmd-tx)" }}>
              {gate.question}
            </p>
            <p className="text-[12px] mb-3.5" style={{ color: "var(--cmd-tx3)" }}>{gate.hint}</p>
            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={() => set(gate.key, gate.good)}
                className={cn(
                  "flex-1 rounded-[14px] border px-4 py-4 text-[15px] font-extrabold cursor-pointer text-start",
                  "transition-[transform,background,border-color,color] duration-150 hover:-translate-y-0.5",
                  "border-white/[.08] bg-[#1A1F28] hover:border-[#50FF0A] hover:bg-[rgba(80,255,10,.1)] hover:text-[#50FF0A]",
                  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#50FF0A]",
                )}
                style={{ color: "var(--cmd-tx)" }}
              >
                {gate.good} <span className="cmd-kbd float-left">1</span>
              </button>
              <button
                type="button"
                onClick={() => set(gate.key, gate.bad)}
                className={cn(
                  "flex-1 rounded-[14px] border px-4 py-4 text-[15px] font-extrabold cursor-pointer text-start",
                  "transition-[transform,background,border-color,color] duration-150 hover:-translate-y-0.5",
                  "border-white/[.08] bg-[#1A1F28] hover:border-[#FF5D5D] hover:bg-[rgba(255,93,93,.1)] hover:text-[#FF7A7A]",
                  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF5D5D]",
                )}
                style={{ color: "var(--cmd-tx)" }}
              >
                {gate.bad} <span className="cmd-kbd float-left">2</span>
              </button>
            </div>
          </>
        )}

        {gate?.combined && (
          <>
            <p className="text-[20px] font-extrabold leading-snug mb-1.5" style={{ color: "var(--cmd-tx)" }}>
              {gate.question}
            </p>
            <p className="text-[12px] mb-3" style={{ color: "var(--cmd-tx3)" }}>{gate.hint}</p>
            <div className="flex gap-2 flex-wrap mb-3">
              {CREDIT_CARDS_Y.map((c) => {
                const cards = Array.isArray(values.creditCards) ? (values.creditCards as string[]) : [];
                const on = cards.includes(c);
                return (
                  <button
                    key={c}
                    type="button"
                    aria-pressed={on}
                    onClick={() => {
                      const next = on ? cards.filter((x) => x !== c)
                        : c === "אין כרטיס בכלל" ? [c] : [...cards.filter((x) => x !== "אין כרטיס בכלל"), c];
                      set("creditCards", next.length ? next : undefined);
                    }}
                    className={cn(
                      "rounded-full px-4 min-h-10 text-[13px] font-bold cursor-pointer border transition-colors duration-150",
                      "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#50FF0A]",
                      on
                        ? "bg-[rgba(80,255,10,.14)] border-[#50FF0A]/50 text-[#50FF0A]"
                        : "bg-[#1A1F28] border-white/[.08] hover:border-white/[.2]",
                    )}
                    style={on ? undefined : { color: "var(--cmd-tx2)" }}
                  >
                    {c}
                  </button>
                );
              })}
            </div>
            {Array.isArray(values.creditCards) && (values.creditCards as string[]).length > 0
              && !(values.creditCards as string[]).includes("אין כרטיס בכלל") && (
                <select
                  className="cmd-input !w-auto pe-8"
                  aria-label="גובה המסגרת בכרטיס"
                  value={sval(values, "cardLimit")}
                  onChange={(e) => set("cardLimit", e.target.value || undefined)}
                >
                  <option value="">גובה המסגרת...</option>
                  {CARD_LIMIT_Y.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              )}
          </>
        )}

        {/* השאלון הושלם — רגע הרמזור והפסק-דין */}
        {!gate && (
          <div className="flex flex-col gap-3">
            <p className="text-[20px] font-extrabold leading-snug" style={{ color: "var(--cmd-tx)" }}>
              {catalog.ramzor
                ? catalog.hint
                : "כל השאלות נענו - נשאר לבצע בדיקת רמזור"}
            </p>
            {!catalog.ramzor && (
              <div className="flex gap-2.5">
                {([["green", "ירוק", "#50FF0A"], ["yellow", "כתום", "#FFB224"], ["red", "אדום", "#FF5D5D"]] as const).map(([v, label, color], i) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => {
                      set("smileyManual", ramzorToDb(v === "yellow" ? "orange" : v));
                      state.addNote("system", `נבחר רמזור ידני: ${label}`);
                    }}
                    className={cn(
                      "flex-1 rounded-[14px] border border-white/[.08] bg-[#1A1F28] px-4 py-4 text-[15px] font-extrabold cursor-pointer",
                      "transition-transform duration-150 hover:-translate-y-0.5",
                      "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current",
                    )}
                    style={{ color }}
                  >
                    <span className="inline-block w-3 h-3 rounded-full me-2" style={{ background: color, boxShadow: `0 0 10px ${color}` }} aria-hidden />
                    {label} <span className="cmd-kbd float-left">{i + 1}</span>
                  </button>
                ))}
              </div>
            )}
            {catalog.ramzor && (
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={cn("rounded-[10px] px-3.5 py-2 text-[12px] font-extrabold", catalog.tracks.general ? "" : "opacity-45")}
                  style={{ background: "var(--cmd-mint)", color: "var(--cmd-lime)" }}
                >
                  {catalog.tracks.general ? "✓ " : ""}כל מטרה
                </span>
                <span
                  className={cn("rounded-[10px] px-3.5 py-2 text-[12px] font-extrabold", catalog.tracks.vehicle ? "" : "opacity-45")}
                  style={{ background: "rgba(61,155,255,.12)", color: "var(--cmd-blue)" }}
                >
                  {catalog.tracks.vehicle ? "✓ " : ""}רכב
                </span>
                <span className="flex-1" />
                {(catalog.tracks.general || catalog.tracks.vehicle) && !signed && (
                  <button
                    type="button"
                    onClick={() => void agreement.sendAgreement()}
                    disabled={agreement.sending}
                    className={cn(
                      "rounded-full px-5 min-h-11 text-[13.5px] font-extrabold cursor-pointer bg-[#50FF0A] text-[#0A2500]",
                      "transition-transform duration-150 hover:-translate-y-0.5 disabled:opacity-60",
                      "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#50FF0A]",
                    )}
                    style={{ boxShadow: "0 4px 24px -6px rgba(80,255,10,.5)" }}
                  >
                    {agreement.sending ? "שולח הסכם..." : "שלח הסכם התקשרות"}
                  </button>
                )}
                {signed && (
                  <span className="inline-flex items-center gap-1.5 text-[13px] font-extrabold" style={{ color: "var(--cmd-lime)" }}>
                    <CheckCircle2 className="size-4" /> ההסכם נחתם
                  </span>
                )}
              </div>
            )}
            {agreement.error && <p className="text-[12px]" style={{ color: "var(--cmd-red)" }}>{agreement.error}</p>}
          </div>
        )}

        {/* מה שכבר נענה */}
        {answered.length > 0 && (
          <div className="mt-auto pt-3 flex flex-col gap-1.5">
            {answered.slice(-2).map((g: GateDef) => (
              <div key={g.key} className="flex items-center gap-2 text-[12.5px]" style={{ color: "var(--cmd-tx2)" }}>
                <span
                  className="w-4 h-4 rounded-full grid place-items-center text-[10px] flex-none"
                  style={gateFlagged(g, values)
                    ? { background: "rgba(255,178,36,.15)", color: "var(--cmd-amber)" }
                    : { background: "var(--cmd-mint)", color: "var(--cmd-lime)" }}
                  aria-hidden
                >
                  {gateFlagged(g, values) ? "!" : "✓"}
                </span>
                <span className="truncate">{g.question}</span>
                <b className="flex-none font-bold" style={{ color: gateFlagged(g, values) ? "var(--cmd-amber)" : "var(--cmd-lime)" }}>
                  {gateSummary(g, values)}
                </b>
              </div>
            ))}
          </div>
        )}
      </Panel>

      {/* ================= דיוקן הלקוח ================= */}
      <Panel variants={child} className="xl:col-span-3 xl:row-span-2 flex flex-col">
        <PanelTitle icon={<Users className="size-3.5" strokeWidth={1.75} />}>
          דיוקן הלקוח
        </PanelTitle>
        <div className="flex gap-2 mb-1.5">
          <span
            className={cn("flex-1 text-center rounded-[10px] py-1.5 text-[11.5px] font-extrabold", !catalog.tracks.general && "opacity-40")}
            style={{ background: "var(--cmd-mint)", color: "var(--cmd-lime)" }}
          >
            {catalog.tracks.general ? "✓ " : ""}כל מטרה
          </span>
          <span
            className={cn("flex-1 text-center rounded-[10px] py-1.5 text-[11.5px] font-extrabold", !catalog.tracks.vehicle && "opacity-40")}
            style={{ background: "rgba(61,155,255,.12)", color: "var(--cmd-blue)" }}
          >
            {catalog.tracks.vehicle ? "✓ " : ""}רכב
          </span>
        </div>
        <PortraitRow
          icon={<Wallet className="size-4" strokeWidth={1.75} />}
          label="סכום ומטרה"
          hot={amount > 0}
          value={amount ? `${formatCurrency(amount)}${purpose ? ` · ${purpose}` : ""}` : null}
        />
        <PortraitRow
          icon={<ShieldCheck className="size-4" strokeWidth={1.75} />}
          label="חיווי אשראי"
          hot={catalog.creditIndication !== "unknown"}
          value={catalog.creditIndication === "positive" ? "חיובי" : catalog.creditIndication === "negative" ? "שלילי" : null}
        />
        <PortraitRow
          icon={<Briefcase className="size-4" strokeWidth={1.75} />}
          label="תעסוקה"
          hot={!!sval(values, "employment")}
          value={sval(values, "employment")
            ? `${sval(values, "employment")}${nval(values, "monthlyIncome") ? ` · ${formatCurrency(nval(values, "monthlyIncome"))} נטו` : ""}`
            : null}
        />
        <PortraitRow
          icon={<MapPin className="size-4" strokeWidth={1.75} />}
          label="כתובת"
          hot={!!sval(values, "city")}
          value={sval(values, "city") ? [sval(values, "city"), sval(values, "address")].filter(Boolean).join(" · ") : null}
        />
        <PortraitRow
          icon={<Car className="size-4" strokeWidth={1.75} />}
          label="רכב"
          hot={!!sval(values, "hasVehicleRaw")}
          value={sval(values, "hasVehicleRaw")
            ? `${sval(values, "hasVehicleRaw")}${sval(values, "vehicleYearBand") ? ` · ${sval(values, "vehicleYearBand")}` : ""}`
            : null}
        />
        <PortraitRow
          icon={<Landmark className="size-4" strokeWidth={1.75} />}
          label="בנק"
          hot={!!sval(values, "bankName")}
          value={sval(values, "bankName") || null}
        />
        <PortraitRow
          icon={<Users className="size-4" strokeWidth={1.75} />}
          label="משפחה"
          hot={!!sval(values, "maritalStatus")}
          value={sval(values, "maritalStatus")
            ? `${sval(values, "maritalStatus")}${sval(values, "children") ? ` · ${sval(values, "children")} ילדים` : ""}`
            : null}
        />
      </Panel>

      {/* ================= בדיקות זכאות ================= */}
      <Panel variants={child} className="xl:col-span-5">
        <PanelTitle
          icon={<Zap className="size-3.5" strokeWidth={1.75} />}
          trailing={
            <button
              type="button"
              onClick={onOpenChecks}
              className="text-[11px] font-bold cursor-pointer hover:underline"
              style={{ color: "var(--cmd-blue)" }}
            >
              לכל הבדיקות ←
            </button>
          }
        >
          בדיקות זכאות
        </PanelTitle>
        <div className="flex flex-col">
          {CARD_LENDERS.slice(0, 5).map((l) => {
            const result = sval(values, `lender_${l.key}_result`);
            const lAmount = nval(values, `lender_${l.key}_amount`);
            const approved = result === "יש אישור";
            const refused = result === "אין אישור";
            const pending = result !== "" && !approved && !refused;
            const pct = approved && amount > 0 ? Math.min(100, Math.max(10, (lAmount / amount) * 100))
              : approved ? 70 : refused ? 100 : pending ? 38 : 0;
            const color = approved ? "var(--cmd-lime)" : refused ? "var(--cmd-red)" : pending ? "var(--cmd-amber)" : "var(--cmd-tx3)";
            return (
              <div key={l.key} className="flex items-center gap-2.5 py-[7px] flex-wrap sm:flex-nowrap">
                <OrgLogo src={logoSrc(l.key)} name={l.name} size={26} />
                <span className="text-[12.5px] font-bold flex-1 min-w-[76px] sm:flex-none sm:w-[92px] truncate" style={{ color: "var(--cmd-tx)" }}>{l.name}</span>
                <div className="cmd-bar order-last basis-full sm:order-none sm:basis-0 sm:flex-1" aria-hidden>
                  <i className={cn(pending && "cmd-scan")} style={{ width: `${pct || 4}%`, background: pct ? color : "transparent" }} />
                </div>
                <b className="text-[12.5px] font-extrabold min-w-[54px] sm:w-[86px] flex-none text-left tabular-nums" dir="ltr" style={{ color }}>
                  {approved ? formatCurrency(lAmount) : refused ? "סורב" : pending ? result : "בתור"}
                </b>
                <label className="sr-only" htmlFor={`cmd-lr-${l.key}`}>תוצאת בדיקה - {l.name}</label>
                <select
                  id={`cmd-lr-${l.key}`}
                  className="cmd-input !min-h-9 !w-[110px] !px-2.5 text-[11.5px] flex-none"
                  value={result}
                  onChange={(e) => set(`lender_${l.key}_result`, e.target.value || undefined)}
                >
                  <option value="">תוצאה...</option>
                  {LENDER_RESULT_Y.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
            );
          })}
        </div>
      </Panel>

      {/* ================= מדדים ================= */}
      <Panel variants={child} className="xl:col-span-4">
        <PanelTitle icon={<BarChart3 className="size-3.5" strokeWidth={1.75} />}>מדדים</PanelTitle>
        <div className="grid grid-cols-2 gap-2.5">
          <div className="rounded-[14px] p-3" style={{ background: "var(--cmd-panel2)" }}>
            <b className="block text-[24px] font-black tabular-nums" style={{ color: "var(--cmd-tx)" }}>{daysIn}</b>
            <span className="text-[11px]" style={{ color: "var(--cmd-tx2)" }}>ימים בתהליך</span>
          </div>
          <div className="rounded-[14px] p-3" style={{ background: "var(--cmd-panel2)" }}>
            <b className="block text-[24px] font-black tabular-nums" style={{ color: "var(--cmd-tx)" }}>{callsCount}</b>
            <span className="text-[11px]" style={{ color: "var(--cmd-tx2)" }}>
              שיחות {summary.lastCallAt ? "· מענה ✓" : ""}
            </span>
          </div>
          <div className="rounded-[14px] p-3 grid place-items-center relative" style={{ background: "var(--cmd-panel2)" }}>
            <svg width="58" height="58" className="-rotate-90" aria-hidden>
              <circle cx="29" cy="29" r="23" fill="none" strokeWidth="6" stroke="var(--cmd-bg)" />
              <circle
                cx="29" cy="29" r="23" fill="none" strokeWidth="6" strokeLinecap="round"
                stroke="var(--cmd-lime)"
                strokeDasharray={2 * Math.PI * 23}
                strokeDashoffset={2 * Math.PI * 23 * (1 - progressPct / 100)}
              />
            </svg>
            <b className="absolute text-[13.5px] font-black tabular-nums" style={{ color: "var(--cmd-lime)" }}>{progressPct}%</b>
            <span className="sr-only">התקדמות השאלון {progressPct} אחוז</span>
          </div>
          <div className="rounded-[14px] p-3" style={{ background: "var(--cmd-panel2)" }}>
            <b className="block text-[19px] font-black tabular-nums" style={{ color: totalApproved ? "var(--cmd-lime)" : "var(--cmd-tx)" }}>
              <CountUp value={totalApproved} format={(n) => (n ? formatCurrency(n) : "0 ₪")} />
            </b>
            <span className="text-[11px]" style={{ color: "var(--cmd-tx2)" }}>
              סה&quot;כ אושר{approvedLenders ? ` · ${approvedLenders} גופים` : ""}
            </span>
          </div>
        </div>
      </Panel>

      {/* ================= פעילות חיה ================= */}
      <Panel variants={child} className="xl:col-span-3 flex flex-col">
        <PanelTitle icon={<ActivityIcon className="size-3.5" strokeWidth={1.75} />}>פעילות חיה</PanelTitle>
        <div className="cmd-feedmask flex-1 min-h-[120px] max-h-[190px]">
          {state.activities.length === 0 && (
            <p className="text-[12px]" style={{ color: "var(--cmd-tx3)" }}>עוד אין פעילות בכרטיס</p>
          )}
          {state.activities.slice(0, 8).map((a) => {
            const color =
              a.type === "call" ? "var(--cmd-blue)"
                : a.type === "system" ? "var(--cmd-amber)"
                  : a.type === "whatsapp" || a.type === "email" ? "var(--cmd-lime)"
                    : "var(--cmd-tx3)";
            return (
              <div key={a.id} className="flex gap-2 py-[6px] border-b" style={{ borderColor: "var(--cmd-line)" }}>
                <i className="w-[3px] rounded-full flex-none" style={{ background: color }} aria-hidden />
                <div className="min-w-0">
                  <p className="text-[11.5px] leading-snug line-clamp-2" style={{ color: "var(--cmd-tx)" }}>{a.text}</p>
                  <small className="text-[10px] tabular-nums" style={{ color: "var(--cmd-tx3)" }}>
                    {relativeTime(a.createdAt)}{a.userName ? ` · ${a.userName}` : ""}
                  </small>
                </div>
              </div>
            );
          })}
        </div>
        <form
          className="mt-2 flex gap-1.5"
          onSubmit={(e) => { e.preventDefault(); submitNote(); }}
        >
          <label className="sr-only" htmlFor="cmd-note">הוסף הערה</label>
          <input
            id="cmd-note"
            className="cmd-input !min-h-10 text-[12px]"
            placeholder="הערה מהירה..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
          <button
            type="submit"
            aria-label="הוסף הערה"
            className={cn(
              "w-10 h-10 rounded-[10px] grid place-items-center flex-none cursor-pointer",
              "bg-white/[.06] border border-white/[.12] hover:bg-white/[.12] transition-colors duration-150",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#50FF0A]",
            )}
            style={{ color: "var(--cmd-tx)" }}
          >
            <Plus className="size-4" strokeWidth={2} />
          </button>
        </form>
      </Panel>
    </motion.div>
  );
}
