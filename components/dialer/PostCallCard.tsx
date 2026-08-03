"use client";
/**
 * PostCallCard - משוב הבינה בין שיחה לשיחה.
 * מופיע אחרי שהנציג סיווג את השיחה, לפני שהליד הבא מוגש:
 *   "מתמלל..." → "מנתח..." → תוצאה (ציון, סיכום, בקרה, אימון, נתונים שנשלפו).
 * הנתונים מגיעים מ-GET /api/ai/calls/[id] בפולינג. אם ה-API עוד לא קיים,
 * מחזיר 404, נכשל או מדווח skipped - מציגים הערה אפורה רגועה, אף פעם לא שגיאה.
 *
 * עדכון הכרטיס: הנציג רואה רשימת שדות עם צ'קבוקס לכל שדה, כולל ערך קיים,
 * ומאשר במפורש. ערך קיים לא-ריק לא מסומן מראש - אין דריסה שקטה.
 */
import * as React from "react";
import {
  Sparkles, Check, X, ArrowLeft, Loader2, ShieldCheck, ShieldAlert,
  GraduationCap, FileEdit, Info,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  type CallAiDto, type AiStatus, type ComplianceResult,
  PATCHABLE_FIELDS, labelForField, displayValue,
} from "./ai-types";

const POLL_MS = 4000;
const MAX_MS = 120_000;      // ~2 דקות ואז מוותרים בשקט
const MAX_404_MS = 24_000;   // ה-API עוד לא קיים - מוותרים מוקדם יותר
const TURBO_COUNTDOWN = 8;

type Screen = "waiting" | "result" | "gaveup" | "unavailable";

const STATUS_TEXT: Record<AiStatus, string> = {
  pending: "מכין ניתוח...",
  transcribing: "מתמלל...",
  analyzing: "מנתח...",
  done: "מוכן",
  failed: "הניתוח לא הושלם",
  skipped: "אין ניתוח לשיחה הזו",
};

function scoreTone(score: number): { text: string; ring: string } {
  if (score >= 80) return { text: "text-bingo-green-dark", ring: "var(--color-bingo-green, #50FF0A)" };
  if (score >= 55) return { text: "text-status-orange", ring: "var(--color-status-orange, #F09A3E)" };
  return { text: "text-status-red", ring: "var(--color-status-red, #E0483C)" };
}

export function PostCallCard({ callId, leadId, turbo, onNext }: {
  /** מזהה שורת ה-Call; null = לא הייתה שיחה (למשל סיווג ידני) */
  callId: number | null;
  leadId: number;
  turbo: boolean;
  onNext: () => void;
}) {
  const [data, setData] = React.useState<CallAiDto | null>(null);
  const [screen, setScreen] = React.useState<Screen>(callId ? "waiting" : "unavailable");
  const [countdown, setCountdown] = React.useState<number | null>(null);
  const [cancelledAuto, setCancelledAuto] = React.useState(false);

  /* ---------- פולינג ---------- */
  React.useEffect(() => {
    if (!callId) return;
    let stopped = false;
    let timer: ReturnType<typeof setTimeout> | null = null;
    const startedAt = Date.now();
    let sawApi = false;

    const poll = async () => {
      if (stopped) return;
      const age = Date.now() - startedAt;
      try {
        const res = await fetch(`/api/ai/calls/${callId}`);
        if (res.status === 404) {
          // או שהשיחה לא נמצאה או שה-API עוד לא קיים
          if (!sawApi && age > MAX_404_MS) { setScreen("unavailable"); return; }
        } else if (res.ok) {
          sawApi = true;
          const json = (await res.json()) as CallAiDto;
          if (stopped) return;
          setData(json);
          const st = (json?.aiStatus ?? "pending") as AiStatus;
          if (st === "done" || st === "failed" || st === "skipped") {
            setScreen("result");
            return;
          }
        }
      } catch {
        // רשת/שרת - ממשיכים לנסות עד התקרה
        if (!sawApi && age > MAX_404_MS) { setScreen("unavailable"); return; }
      }
      if (Date.now() - startedAt > MAX_MS) { setScreen("gaveup"); return; }
      timer = setTimeout(poll, POLL_MS);
    };

    void poll();
    return () => { stopped = true; if (timer) clearTimeout(timer); };
  }, [callId]);

  /* ---------- ספירה לאחור בטורבו ---------- */
  const onNextRef = React.useRef(onNext);
  onNextRef.current = onNext;
  const settled = screen !== "waiting";
  React.useEffect(() => {
    if (!turbo || !settled || cancelledAuto) { setCountdown(null); return; }
    setCountdown(TURBO_COUNTDOWN);
    const t = setInterval(() => {
      setCountdown((c) => {
        if (c === null) return null;
        if (c <= 1) { clearInterval(t); onNextRef.current(); return null; }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [turbo, settled, cancelledAuto]);

  const analysis = data?.analysis ?? null;
  const status = (data?.aiStatus ?? "pending") as AiStatus;

  return (
    <div className="b-spring-in mt-7 rounded-[24px] p-4 sm:p-5" style={{
      background: "radial-gradient(520px 300px at 12% 0%, var(--b-tint-lilac-1), transparent 60%), linear-gradient(180deg, rgba(255,255,255,.75), rgba(255,255,255,.55))",
      border: "1px solid var(--color-bingo-gray-100, rgba(0,0,0,.06))",
    }}>
      <div className="flex items-center gap-2.5 mb-4 flex-wrap">
        <span className="b-glass-ico size-9 rounded-full flex items-center justify-center shrink-0">
          <Sparkles className="size-4 text-bingo-black" />
        </span>
        <div className="text-[15px] font-black text-bingo-black">משוב הבינה על השיחה</div>
        <span className="mr-auto flex items-center gap-2">
          {turbo && countdown !== null && (
            <button
              type="button"
              onClick={() => setCancelledAuto(true)}
              className="b-lift b-glass rounded-full px-3.5 py-1.5 text-[12px] font-extrabold text-bingo-gray-600"
            >
              ממשיך בעוד <span className="tabular-nums">{countdown}</span> - בטל
            </button>
          )}
          <button
            type="button"
            onClick={onNext}
            className="b-lift flex items-center gap-2 rounded-full bg-bingo-black text-white px-5 py-2.5 text-[13px] font-extrabold"
          >
            המשך לליד הבא
            <kbd className="text-[10px] font-bold bg-white/15 rounded px-1.5 py-0.5">Enter</kbd>
            <ArrowLeft className="size-4" />
          </button>
        </span>
      </div>

      {/* ===== ממתינים ===== */}
      {screen === "waiting" && (
        <div className="flex items-center gap-3 py-6">
          <span className="b-scan size-3 rounded-full bg-bingo-green" />
          <span className="text-[16px] font-black text-bingo-black">{STATUS_TEXT[status]}</span>
          <span className="text-[12px] font-semibold text-bingo-gray-400">
            אפשר להמשיך לליד הבא - הניתוח יישמר בכרטיס
          </span>
        </div>
      )}

      {(screen === "unavailable" || screen === "gaveup") && (
        <CalmNote
          text={
            screen === "gaveup"
              ? "הניתוח לוקח יותר מהצפוי - הוא יופיע בכרטיס השיחה כשיסתיים."
              : "אין כרגע ניתוח בינה לשיחה הזו."
          }
        />
      )}

      {/* ===== תוצאה ===== */}
      {screen === "result" && status === "skipped" && (
        <CalmNote text={data?.aiError || "השיחה לא נותחה - קצרה מדי או ללא הקלטה."} />
      )}
      {screen === "result" && status === "failed" && (
        <CalmNote text={data?.aiError || "הניתוח לא הושלם הפעם. אפשר להריץ שוב מכרטיס השיחה."} />
      )}
      {screen === "result" && status === "done" && !analysis && (
        <CalmNote text="השיחה תומללה אך אין עדיין ניתוח." />
      )}

      {screen === "result" && status === "done" && analysis && (
        <div className="b-spring-in space-y-4">
          {/* ציון + סיכום */}
          <div className="flex items-start gap-4 flex-wrap">
            <ScoreRing score={typeof analysis.score === "number" ? analysis.score : null} />
            <p className="min-w-[220px] flex-1 text-[14.5px] font-bold text-bingo-black leading-relaxed">
              {analysis.summary || "אין סיכום לשיחה הזו."}
            </p>
          </div>

          {/* בקרה */}
          {Array.isArray(analysis.compliance) && analysis.compliance.length > 0 && (
            <ComplianceStrip items={analysis.compliance} />
          )}

          {/* הערת אימון מובילה */}
          {Array.isArray(analysis.coaching) && analysis.coaching.length > 0 && (
            <div className="b-tint-sky rounded-2xl px-4 py-3">
              <div className="flex items-center gap-1.5 text-[11.5px] font-black text-bingo-black mb-1">
                <GraduationCap className="size-3.5" />
                הדבר שכדאי לשפר
              </div>
              <div className="text-[14px] font-black text-bingo-black">{analysis.coaching[0]?.title}</div>
              {analysis.coaching[0]?.detail && (
                <div className="text-[12.5px] font-semibold text-bingo-gray-600 mt-0.5">
                  {analysis.coaching[0].detail}
                </div>
              )}
            </div>
          )}

          {/* נתונים שנשלפו */}
          <ExtractedPanel leadId={leadId} extracted={analysis.extracted ?? null} />
        </div>
      )}
    </div>
  );
}

/* ============ הערה רגועה ============ */
function CalmNote({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-2 rounded-2xl bg-black/[.035] px-4 py-3 text-[12.5px] font-semibold text-bingo-gray-500">
      <Info className="size-4 shrink-0 mt-px" />
      <span>{text}</span>
    </div>
  );
}

/* ============ טבעת הציון ============ */
function ScoreRing({ score }: { score: number | null }) {
  if (score === null) {
    return (
      <div className="size-[96px] rounded-full bg-black/[.04] flex items-center justify-center text-[13px] font-black text-bingo-gray-400 shrink-0">
        ללא ציון
      </div>
    );
  }
  const clamped = Math.max(0, Math.min(100, Math.round(score)));
  const tone = scoreTone(clamped);
  return (
    <div
      className="size-[96px] rounded-full flex items-center justify-center shrink-0"
      style={{ background: `conic-gradient(${tone.ring} ${clamped * 3.6}deg, rgba(0,0,0,.07) 0)` }}
      role="img"
      aria-label={`ציון השיחה ${clamped} מתוך 100`}
    >
      <div className="size-[76px] rounded-full bg-white flex flex-col items-center justify-center leading-none">
        <span className={cn("text-[30px] font-black tabular-nums", tone.text)}>{clamped}</span>
        <span className="text-[9.5px] font-bold text-bingo-gray-400 mt-1">ציון שיחה</span>
      </div>
    </div>
  );
}

/* ============ רצועת הבקרה ============ */
function ComplianceStrip({ items }: { items: ComplianceResult[] }) {
  const passed = items.filter((c) => c.passed);
  const failed = items.filter((c) => !c.passed);
  return (
    <div className="space-y-2">
      {passed.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {passed.map((c, i) => (
            <span key={`p${c.ruleId ?? i}`} className="b-chip b-chip-green text-[11.5px] font-extrabold">
              <ShieldCheck className="size-3.5" />
              {c.ruleName || "כלל"}
            </span>
          ))}
        </div>
      )}
      {failed.map((c, i) => (
        <div
          key={`f${c.ruleId ?? i}`}
          className={cn(
            "rounded-2xl px-4 py-2.5",
            c.severity === "critical" || c.severity === "high" ? "b-tint-rose" : "b-tint-peach",
          )}
        >
          <div className="flex items-center gap-1.5 text-[13px] font-black text-bingo-black">
            <ShieldAlert className="size-3.5" />
            {c.ruleName || "כלל בקרה"}
          </div>
          {(c.explanation || c.evidence) && (
            <div className="text-[12px] font-semibold text-bingo-gray-600 mt-0.5">
              {c.explanation || c.evidence}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/* ============ נתונים שנשלפו + עדכון הכרטיס ============ */
function ExtractedPanel({ leadId, extracted }: {
  leadId: number;
  extracted: Record<string, unknown> | null;
}) {
  const entries = React.useMemo(
    () =>
      Object.entries(extracted ?? {}).filter(
        ([k, v]) => PATCHABLE_FIELDS.has(k) && v !== null && v !== undefined && v !== "",
      ),
    [extracted],
  );

  const [current, setCurrent] = React.useState<Record<string, unknown> | null>(null);
  const [checked, setChecked] = React.useState<Set<string>>(new Set());
  const [saving, setSaving] = React.useState(false);
  const [saved, setSaved] = React.useState(false);
  const [failed, setFailed] = React.useState(false);

  /* הערכים הקיימים בכרטיס - כדי לא לדרוס בשקט */
  React.useEffect(() => {
    if (entries.length === 0) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/leads/${leadId}`);
        if (!res.ok) return;
        const lead = await res.json();
        if (cancelled) return;
        setCurrent(lead);
        // מסמנים מראש רק שדות שריקים בכרטיס
        setChecked(new Set(entries.filter(([k]) => {
          const cur = lead?.[k];
          return cur === null || cur === undefined || cur === "";
        }).map(([k]) => k)));
      } catch { /* ממשיכים בלי הערכים הקיימים */ }
    })();
    return () => { cancelled = true; };
  }, [leadId, entries]);

  if (entries.length === 0) return null;

  const apply = async () => {
    if (saving || checked.size === 0) return;
    setSaving(true);
    setFailed(false);
    const patch: Record<string, unknown> = {};
    for (const [k, v] of entries) if (checked.has(k)) patch[k] = v;
    try {
      const res = await fetch(`/api/leads/${leadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      if (!res.ok) throw new Error();
      setSaved(true);
    } catch {
      setFailed(true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-2xl bg-white/70 border border-bingo-gray-100 px-4 py-3">
      <div className="flex items-center gap-1.5 text-[11.5px] font-black text-bingo-black mb-2">
        <FileEdit className="size-3.5" />
        נתונים שנשלפו מהשיחה
      </div>
      <div className="space-y-1.5">
        {entries.map(([k, v]) => {
          const cur = current?.[k];
          const hasCur = cur !== null && cur !== undefined && cur !== "";
          const on = checked.has(k);
          return (
            <label
              key={k}
              className="flex items-center gap-2.5 text-[12.5px] cursor-pointer rounded-xl px-2 py-1.5 hover:bg-black/[.03]"
            >
              <input
                type="checkbox"
                checked={on}
                disabled={saved}
                onChange={() =>
                  setChecked((prev) => {
                    const next = new Set(prev);
                    if (next.has(k)) next.delete(k); else next.add(k);
                    return next;
                  })
                }
                className="size-4 accent-[var(--color-bingo-green,#50FF0A)]"
              />
              <span className="font-bold text-bingo-gray-500 w-[110px] shrink-0">{labelForField(k)}</span>
              {hasCur && (
                <span className="font-semibold text-bingo-gray-400 line-through truncate max-w-[120px]">
                  {displayValue(cur)}
                </span>
              )}
              <span className="font-black text-bingo-black truncate">{displayValue(v)}</span>
              {hasCur && (
                <span className="b-chip b-chip-orange text-[10px] shrink-0">דורס ערך קיים</span>
              )}
            </label>
          );
        })}
      </div>
      <div className="flex items-center gap-2.5 mt-2.5 flex-wrap">
        <button
          type="button"
          onClick={() => void apply()}
          disabled={saving || saved || checked.size === 0}
          className="b-lift rounded-full bg-bingo-green text-bingo-black px-5 py-2 text-[12.5px] font-black disabled:opacity-45 inline-flex items-center gap-2"
        >
          {saving ? <Loader2 className="size-3.5 animate-spin" /> : saved ? <Check className="size-3.5" /> : null}
          {saved ? "הכרטיס עודכן" : `עדכן בכרטיס (${checked.size})`}
        </button>
        {failed && (
          <span className="text-[12px] font-bold text-bingo-gray-500 inline-flex items-center gap-1">
            <X className="size-3.5" /> העדכון לא נשמר - אפשר לעדכן ידנית בכרטיס
          </span>
        )}
      </div>
    </div>
  );
}

export default PostCallCard;
