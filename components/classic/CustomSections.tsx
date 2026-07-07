"use client";
/**
 * הסקשנים המיוחדים של הכרטיס הקלאסי:
 * באנר הסמיילי · בלוקי גופי המימון (6, מבנה זהה) · מקור הליד · טפסים וקבצים.
 * מבנה 1:1 מהאפיון — עיצוב בינגו.
 */
import * as React from "react";
import { CheckCircle2, AlertTriangle, Upload, FileText, Send, PenLine } from "lucide-react";
import { CARD_LENDERS, LENDER_RESULT_Y, INTERESTED_Y, JERUSALEM_STAGE_Y } from "@/lib/yoatsim/card-schema";
import type { ClassicValues } from "@/lib/yoatsim/values";
import { FORM_TEMPLATES } from "@/lib/yoatsim/forms";
import { cn, formatCurrency, formatDate, formatTime } from "@/lib/utils";
import type { ClassicCardState } from "./useClassicCard";

/* ---------- באנר "לקוח תקין בדיקת סמיילי ירוקה" ---------- */
export function SmileyBanner({ values, set }: {
  values: ClassicValues;
  set: ClassicCardState["set"];
}) {
  const ok = !!values.smileyGreenConfirmed;
  const negative = values.smileyAuto === "red" || values.smileyManual === "red" ||
    values.smileyAuto === "yellow" || values.smileyManual === "yellow";

  return (
    <button
      type="button"
      onClick={() => set("smileyGreenConfirmed", !ok)}
      className={cn(
        "w-full rounded-2xl border-2 px-4 py-3.5 flex items-center gap-3 text-right transition-all",
        ok ? "border-bingo-green bg-bingo-green-light/50" :
        negative ? "border-status-red/50 bg-status-red-soft/50" :
        "border-bingo-gray-150 bg-white hover:border-bingo-gray-300",
      )}
    >
      {ok ? <CheckCircle2 className="size-6 text-bingo-green-dark shrink-0" />
          : <AlertTriangle className={cn("size-6 shrink-0", negative ? "text-status-red" : "text-bingo-gray-300")} />}
      <div>
        <p className="text-[14.5px] font-bold text-bingo-black">
          {negative && !ok ? "לקוח עם חיווי אשראי שלילי" : "לקוח תקין בדיקת סמיילי ירוקה ✅"}
        </p>
        <p className="text-[11.5px] text-bingo-gray-500">לחץ לסימון/ביטול — כמו התיבה הירוקה ביועצים</p>
      </div>
    </button>
  );
}

/* ---------- גופי המימון — בלוק זהה לכל גוף ---------- */
function lval(values: ClassicValues, lender: string, field: string): string {
  return (values[`lender_${lender}_${field}`] as string) || "";
}

export function LendersSection({ values, set }: {
  values: ClassicValues;
  set: ClassicCardState["set"];
}) {
  const totalApproved = CARD_LENDERS.reduce((sum, l) => {
    const n = Number(String(lval(values, l.key, "amount")).replace(/\D/g, ""));
    return lval(values, l.key, "result") === "יש אישור" && Number.isFinite(n) ? sum + n : sum;
  }, 0);
  const totalFinal = CARD_LENDERS.reduce((sum, l) => {
    const n = Number(String(lval(values, l.key, "proceedAmount")).replace(/\D/g, ""));
    return Number.isFinite(n) ? sum + n : sum;
  }, 0);

  return (
    <div className="space-y-3">
      {CARD_LENDERS.map((l) => {
        const result = lval(values, l.key, "result");
        const approved = result === "יש אישור";
        const k = (f: string) => `lender_${l.key}_${f}`;
        return (
          <div key={l.key} className={cn(
            "rounded-2xl border p-3.5 transition-colors",
            approved ? "border-bingo-green/40 bg-bingo-green-light/20" :
            result === "סורב" ? "border-bingo-gray-150 bg-bingo-gray-50" : "border-bingo-gray-150",
          )}>
            <div className="flex items-center gap-2.5 mb-2.5 flex-wrap">
              <span className="text-[14px] font-bold text-bingo-black">{l.name}</span>
              <select className="b-input h-9 text-[12.5px] w-44 cursor-pointer"
                value={result} onChange={(e) => set(k("result"), e.target.value || undefined)}>
                <option value="">תוצאת בדיקה —</option>
                {LENDER_RESULT_Y.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
              {l.key === "jerusalem" && (
                <select className="b-input h-9 text-[12.5px] w-36 cursor-pointer"
                  value={lval(values, l.key, "stage")} onChange={(e) => set(k("stage"), e.target.value || undefined)}>
                  <option value="">שלב —</option>
                  {JERUSALEM_STAGE_Y.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              )}
              <input className="b-input h-9 text-[12.5px] flex-1 min-w-32" placeholder="סיבה"
                value={lval(values, l.key, "reason")} onChange={(e) => set(k("reason"), e.target.value)} />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-2.5">
              {([["amount", "סכום מאושר ₪"], ["payments", "תשלומים מקס'"], ["interest", "ריבית %"], ["monthly", "החזר חודשי ₪"]] as const).map(([f, ph]) => (
                <input key={f} className="b-input h-9 text-[12.5px] tabular-nums" inputMode="decimal" placeholder={ph}
                  value={lval(values, l.key, f)} onChange={(e) => set(k(f), e.target.value)} />
              ))}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[12px] font-semibold text-bingo-gray-500">מעוניין להתקדם?</span>
              {INTERESTED_Y.map((o) => (
                <button key={o} type="button"
                  onClick={() => set(k("interested"), lval(values, l.key, "interested") === o ? undefined : o)}
                  className={cn("b-chip text-[11.5px] transition",
                    lval(values, l.key, "interested") === o ? "b-chip-dark" : "b-chip-gray hover:bg-bingo-gray-150")}>
                  {o}
                </button>
              ))}
              <input className="b-input h-9 text-[12.5px] w-32 tabular-nums" inputMode="numeric" placeholder="סכום שהתקדמו"
                value={lval(values, l.key, "proceedAmount")} onChange={(e) => set(k("proceedAmount"), e.target.value)} />
              {lval(values, l.key, "interested") === "לא" && (
                <input className="b-input h-9 text-[12.5px] flex-1 min-w-28" placeholder="סיבה אם לא"
                  value={lval(values, l.key, "noReason")} onChange={(e) => set(k("noReason"), e.target.value)} />
              )}
            </div>
          </div>
        );
      })}

      {/* סה"כ — מסכם אוטומטית כמו במקור */}
      <div className="rounded-2xl bg-bingo-black text-white px-4 py-3 flex items-center gap-6 flex-wrap">
        <span className="text-[13px]">סה״כ מאושר מכל הגופים: <b className="text-bingo-green text-[16px] tabular-nums">{totalApproved ? formatCurrency(totalApproved) : "—"}</b></span>
        <span className="text-[13px]">מאושר סופית: <b className="text-bingo-green text-[16px] tabular-nums">{totalFinal ? formatCurrency(totalFinal) : "—"}</b></span>
      </div>
    </div>
  );
}

/* ---------- מקור הליד — טבלת "אנשי קשר לפי מקור" כמו במקור (אפיון §1) ---------- */
export function SourceSection({ lead }: {
  lead: {
    source: string | null;
    sourceText: string | null;
    intakeDate: string;
    providerName?: string | null;
  };
}) {
  const hasSource = !!(lead.source || lead.sourceText || lead.providerName);
  return (
    <div>
      <div className="text-[11px] font-bold text-bingo-gray-500 mb-1.5">אנשי קשר לפי מקור</div>
      <div className="rounded-2xl border border-bingo-gray-150 overflow-hidden">
        <table className="w-full text-[12.5px]">
          <thead className="bg-bingo-gray-50 text-bingo-gray-500">
            <tr>
              <th className="text-right px-3 py-2 font-semibold">מקור</th>
              <th className="text-right px-3 py-2 font-semibold">פירוט</th>
              <th className="text-right px-3 py-2 font-semibold">ספק</th>
              <th className="text-right px-3 py-2 font-semibold">תאריך ושעה</th>
            </tr>
          </thead>
          <tbody>
            {/* השורה הראשונה — נתוני המקור האמיתיים של הליד */}
            <tr className="border-t border-bingo-gray-100">
              <td className="px-3 py-2 font-bold text-bingo-black">{hasSource ? (lead.source || "—") : "—"}</td>
              <td className="px-3 py-2 text-bingo-gray-600">{lead.sourceText || "—"}</td>
              <td className="px-3 py-2 text-bingo-gray-600">{lead.providerName || "—"}</td>
              <td className="px-3 py-2 tabular-nums text-bingo-gray-500">
                {formatDate(lead.intakeDate)} · {formatTime(lead.intakeDate)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p className="text-[10.5px] text-bingo-gray-400 mt-1.5">
        ערוצים במקור: דף נחיתה · בנק · אתר · ניוזלטר · פקס · פייסבוק · טלפון · ספקי לידים.
        ניהול הדפים — בהגדרות ← דפי נחיתה.
      </p>
    </div>
  );
}

/* ---------- טפסים וקבצים — SentForm אמיתי דרך /api/forms ---------- */
interface SentFormRow {
  id: number;
  templateName: string;
  status: string; // sent | signed
  sentAt: string;
  signedAt: string | null;
}

export function FormsSection({ state }: { state: ClassicCardState }) {
  const leadId = state.lead.id;
  const [rows, setRows] = React.useState<SentFormRow[]>([]);
  const [loaded, setLoaded] = React.useState(false);
  const [sending, setSending] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    fetch(`/api/forms?leadId=${leadId}`)
      .then((r) => (r.ok ? r.json() : { forms: [] }))
      .then((d) => {
        if (!cancelled) {
          setRows(Array.isArray(d.forms) ? d.forms : []);
          setLoaded(true);
        }
      })
      .catch(() => { if (!cancelled) setLoaded(true); });
    return () => { cancelled = true; };
  }, [leadId]);

  const send = async (templateName: string) => {
    setSending(templateName);
    const optimistic: SentFormRow = {
      id: -Date.now(), templateName, status: "sent",
      sentAt: new Date().toISOString(), signedAt: null,
    };
    setRows((r) => [optimistic, ...r]);
    try {
      const res = await fetch("/api/forms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId, templateName }),
      });
      if (res.ok) {
        const row = await res.json();
        setRows((r) => r.map((x) => (x.id === optimistic.id ? row : x)));
      } else {
        setRows((r) => r.filter((x) => x.id !== optimistic.id));
      }
    } catch {
      setRows((r) => r.filter((x) => x.id !== optimistic.id));
    } finally {
      setSending(null);
    }
  };

  const markSigned = async (id: number) => {
    setRows((r) => r.map((x) => (x.id === id ? { ...x, status: "signed", signedAt: new Date().toISOString() } : x)));
    try {
      const res = await fetch("/api/forms", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: "signed" }),
      });
      if (res.ok) {
        const row = await res.json();
        setRows((r) => r.map((x) => (x.id === id ? { ...x, ...row } : x)));
      }
    } catch { /* האופטימי נשאר — יתעדכן ברענון */ }
  };

  return (
    <div className="space-y-3">
      {/* תבניות הטפסים — "שלח לחתימה" (סימולציה, נרשם כפעילות בשרת) */}
      <div className="space-y-2">
        {FORM_TEMPLATES.map((t) => (
          <div key={t.key} className="rounded-2xl border border-bingo-gray-150 px-3.5 py-2.5 flex items-center gap-3 flex-wrap">
            <FileText className="size-4 text-bingo-gray-400 shrink-0" />
            <div className="flex-1 min-w-40">
              <div className="text-[13px] font-bold text-bingo-black">{t.name}</div>
              <div className="text-[11px] text-bingo-gray-500">{t.description}</div>
            </div>
            <button
              type="button"
              disabled={sending === t.name}
              onClick={() => void send(t.name)}
              className="b-pill b-pill-ghost b-pill-sm shrink-0 disabled:opacity-50"
            >
              <Send className="size-3.5" /> {sending === t.name ? "שולח…" : "שלח לחתימה"}
            </button>
          </div>
        ))}
      </div>

      {/* היסטוריית הטפסים של הליד */}
      {rows.length > 0 && (
        <div className="rounded-2xl border border-bingo-gray-150 divide-y divide-bingo-gray-100">
          {rows.map((f) => (
            <div key={f.id} className="px-3 py-2 flex items-center gap-2 text-[12.5px] flex-wrap">
              <FileText className="size-3.5 text-bingo-gray-400 shrink-0" />
              <span className="flex-1 min-w-32 text-bingo-black font-semibold">{f.templateName}</span>
              {f.status === "signed" ? (
                <span className="b-chip b-chip-green text-[10.5px]">נחתם</span>
              ) : (
                <span className="b-chip b-chip-blue text-[10.5px]">נשלח</span>
              )}
              <span className="text-bingo-gray-400 tabular-nums text-[11.5px]">
                {formatDate(f.sentAt)}
                {f.signedAt ? ` ← נחתם ${formatDate(f.signedAt)}` : ""}
              </span>
              {f.status === "sent" && f.id > 0 && (
                <button
                  type="button"
                  onClick={() => void markSigned(f.id)}
                  className="b-pill b-pill-ghost b-pill-sm"
                >
                  <PenLine className="size-3.5" /> סמן כנחתם
                </button>
              )}
            </div>
          ))}
        </div>
      )}
      {loaded && rows.length === 0 && (
        <p className="text-[11.5px] text-bingo-gray-400">עדיין לא נשלחו טפסים ללקוח.</p>
      )}

      <div className="rounded-2xl border-2 border-dashed border-bingo-gray-200 p-6 text-center text-[12.5px] text-bingo-gray-400">
        <Upload className="size-5 mx-auto mb-1.5 text-bingo-gray-300" />
        אזור העלאת קבצים — יחובר בשלב הסנכרון
      </div>
    </div>
  );
}
