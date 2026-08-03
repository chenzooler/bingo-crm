"use client";
/**
 * TotachCockpit — קוקפיט תותח השיחות (Premium v2).
 * זרימה: ליד מוגש → חייג (Enter) / דלג (S) → "בשיחה..." (פולינג) → פאנל סיווג
 * (מקשים 1-4) → הליד הבא נטען אוטומטית. מצב "טורבו" מחייג לבד לליד הבא.
 * מקור הנתונים: GET /api/dialer/next · POST /api/calls/dial · POST /api/dialer/disposition.
 */
import * as React from "react";
import Link from "next/link";
import {
  Phone, PhoneOff, SkipForward, ExternalLink, Loader2, Zap,
  PhoneMissed, CalendarClock, TrendingUp, Ban, Trophy, Clock,
  Headphones, ListChecks, AlarmClock, Sparkles, RotateCcw,
} from "lucide-react";
import { cn, formatCurrency, relativeTime } from "@/lib/utils";
import { Ramzor, type RamzorValue } from "@/components/ui/Ramzor";
import { processByKey } from "@/lib/yoatsim/processes";
import type { DialerQueueResult, QueueReason } from "@/lib/dialer/queue";
import { LiveScript } from "./LiveScript";
import { PostCallCard } from "./PostCallCard";

/** review = אחרי הסיווג, בזמן שהבינה מנתחת - חוסם את המעבר לליד הבא */
type Phase = "ready" | "dialing" | "disposition" | "review";

const REASON_LABEL = (reason: QueueReason, attempt: number | null): string => {
  if (reason === "callback") return "חוזר מתוזמן";
  if (reason === "new") return "ליד חדש";
  return `ניסיון ${attempt ?? 2} אחרי אין מענה`;
};

function fmtTalk(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  if (m >= 60) return `${Math.floor(m / 60)}:${String(m % 60).padStart(2, "0")} ש'`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function fmtPhone(p: string | null): string {
  if (!p) return "";
  return p.length === 10 ? `${p.slice(0, 3)}-${p.slice(3)}` : p;
}

/* מועדי החזרה המהירים בבורר */
function quickCallbackAt(kind: "1h" | "4h" | "tomorrow"): Date {
  const d = new Date();
  if (kind === "1h") d.setHours(d.getHours() + 1);
  else if (kind === "4h") d.setHours(d.getHours() + 4);
  else {
    d.setDate(d.getDate() + 1);
    d.setHours(10, 0, 0, 0);
  }
  return d;
}

export function TotachCockpit({ user, initial }: {
  user: { id: number; name: string; sipExtension: string | null };
  initial: DialerQueueResult;
}) {
  const [queue, setQueue] = React.useState<DialerQueueResult>(initial);
  const [phase, setPhase] = React.useState<Phase>("ready");
  const [callRowId, setCallRowId] = React.useState<number | null>(null);
  const [callStartedAt, setCallStartedAt] = React.useState<number | null>(null);
  const [callEndStatus, setCallEndStatus] = React.useState<string | null>(null);
  const [turbo, setTurbo] = React.useState(false);
  const [loadingNext, setLoadingNext] = React.useState(false);
  const [dialing, setDialing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [callbackPicker, setCallbackPicker] = React.useState(false);
  const [customAt, setCustomAt] = React.useState("");
  const [springKey, setSpringKey] = React.useState(0);
  const skippedRef = React.useRef<number[]>([]);
  const turboRef = React.useRef(false);
  turboRef.current = turbo;

  const lead = queue.lead;

  /* ---------- טעינת הליד הבא ---------- */
  const fetchNext = React.useCallback(async (autoDial = false) => {
    setLoadingNext(true);
    setError(null);
    try {
      const qs = skippedRef.current.length ? `?exclude=${skippedRef.current.join(",")}` : "";
      const res = await fetch(`/api/dialer/next${qs}`);
      if (!res.ok) throw new Error();
      const data = (await res.json()) as DialerQueueResult;
      setQueue(data);
      setPhase("ready");
      setCallRowId(null);
      setCallStartedAt(null);
      setCallEndStatus(null);
      setCallbackPicker(false);
      setSpringKey((k) => k + 1);
      if (autoDial && data.lead) {
        // טורבו — מחייגים אוטומטית לליד שהוגש
        setTimeout(() => void dialRef.current?.(data.lead!.id), 250);
      }
    } catch {
      setError("שגיאה בטעינת הליד הבא");
    } finally {
      setLoadingNext(false);
    }
  }, []);

  /* ---------- חיוג ---------- */
  const dial = React.useCallback(async (leadId?: number) => {
    const targetLeadId = leadId ?? queue.lead?.id;
    if (!targetLeadId || dialing) return;
    setDialing(true);
    setError(null);
    try {
      const res = await fetch("/api/calls/dial", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId: targetLeadId }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.ok) {
        setError(data?.error ?? "החיוג נכשל");
        return;
      }
      setCallRowId(data.callRowId);
      setCallStartedAt(Date.now());
      setPhase("dialing");
    } catch {
      setError("החיוג נכשל - בדוק חיבור");
    } finally {
      setDialing(false);
    }
  }, [queue.lead?.id, dialing]);
  const dialRef = React.useRef<typeof dial | null>(null);
  dialRef.current = dial;

  /* ---------- פולינג מצב השיחה (כל 3 שניות) ---------- */
  React.useEffect(() => {
    if (phase !== "dialing" || !callRowId) return;
    const t = setInterval(async () => {
      try {
        const res = await fetch(`/api/calls/${callRowId}`);
        if (!res.ok) return;
        const call = await res.json();
        if (call.status && call.status !== "dialing") {
          setCallEndStatus(call.status);
          setPhase("disposition");
        }
      } catch { /* ממשיכים לנסות */ }
    }, 3000);
    return () => clearInterval(t);
  }, [phase, callRowId]);

  /* ---------- דילוג ---------- */
  const skip = React.useCallback(() => {
    if (!queue.lead || phase !== "ready") return;
    skippedRef.current = [...skippedRef.current, queue.lead.id];
    void fetchNext();
  }, [queue.lead, phase, fetchNext]);

  /* ---------- סיווג ---------- */
  const sendDisposition = React.useCallback(async (
    disposition: string,
    extra?: { callbackAt?: string },
  ) => {
    if (!lead) return;
    try {
      const res = await fetch("/api/dialer/disposition", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId: lead.id, callRowId, disposition, ...extra }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error ?? "שמירת הסיווג נכשלה");
        return;
      }
      if (disposition === "advanced") {
        window.open(`/leads/${lead.id}`, "_blank", "noopener");
      }
      // משוב הבינה חוסם את המעבר: PostCallCard מגיש "המשך לליד הבא"
      // (ובטורבו סופר לאחור לבד). ללא שיחה - ממשיכים כמו קודם.
      setCallbackPicker(false);
      if (callRowId) {
        setPhase("review");
      } else {
        setTimeout(() => void fetchNext(turboRef.current), 800);
      }
    } catch {
      setError("שמירת הסיווג נכשלה");
    }
  }, [lead, callRowId, fetchNext]);

  const chooseDisposition = React.useCallback((d: string) => {
    if (d === "callback") {
      setCallbackPicker(true);
      return;
    }
    void sendDisposition(d);
  }, [sendDisposition]);

  /* ---------- מקלדת ---------- */
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if (phase === "ready" && lead) {
        if (e.key === "Enter") { e.preventDefault(); void dial(); }
        if (e.key === "s" || e.key === "S" || e.key === "ד") { e.preventDefault(); skip(); }
      } else if (phase === "review") {
        // משוב הבינה פתוח — Enter ממשיך לליד הבא (מקשי הסיווג כבר לא פעילים)
        if (e.key === "Enter") { e.preventDefault(); void fetchNext(turboRef.current); }
      } else if (phase === "disposition" && !callbackPicker) {
        if (e.key === "1") chooseDisposition("no-answer");
        if (e.key === "2") chooseDisposition("callback");
        if (e.key === "3") chooseDisposition("advanced");
        if (e.key === "4") chooseDisposition("not-interested");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, lead, callbackPicker, dial, skip, chooseDisposition, fetchNext]);

  const stats = queue.stats;
  const ramzor: RamzorValue | null =
    lead?.smiley === "green" ? "green"
    : lead?.smiley === "yellow" ? "orange"
    : lead?.smiley === "red" ? "red"
    : null;

  return (
    <div className="max-w-[1100px] mx-auto">
      {/* ============ כותרת ============ */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <h1 className="text-3xl sm:text-[34px] font-black tracking-tight text-bingo-black leading-none">
          תותח שיחות
          <span className="inline-block size-3 rounded-full bg-bingo-green ml-2 align-middle" />
        </h1>
        <span className="text-sm text-bingo-gray-500 font-semibold">{user.name}</span>
        <span className="mr-auto" />
        {/* טורבו */}
        <button
          type="button"
          onClick={() => setTurbo((t) => !t)}
          aria-pressed={turbo}
          className={cn(
            "b-lift flex items-center gap-2 rounded-full px-4 py-2 text-[13px] font-extrabold transition-colors",
            turbo ? "text-bingo-black bg-bingo-green shadow-[0_6px_18px_-6px_var(--b-glow-green)]" : "b-glass text-bingo-gray-600",
          )}
        >
          <Zap className="size-4" />
          טורבו {turbo ? "פעיל" : "כבוי"}
        </button>
      </div>

      {/* ============ רצועת סטטיסטיקת היום ============ */}
      <div className="b-glass rounded-[20px] px-5 py-3 mb-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: Phone, label: "שיחות היום", value: String(stats.calls) },
          { icon: Headphones, label: "נענו", value: String(stats.answered) },
          { icon: Clock, label: "זמן דיבור", value: fmtTalk(stats.talkSeconds) },
          { icon: ListChecks, label: "סיווגים", value: String(stats.dispositions) },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex items-center gap-2.5">
            <span className="b-glass-ico size-9 rounded-full flex items-center justify-center shrink-0">
              <Icon className="size-4 text-bingo-gray-600" />
            </span>
            <div className="leading-tight">
              <div className="text-[18px] font-black text-bingo-black tabular-nums">{value}</div>
              <div className="text-[10.5px] font-bold text-bingo-gray-500">{label}</div>
            </div>
          </div>
        ))}
      </div>

      {error && (
        <div className="rounded-2xl bg-status-red/10 border border-status-red/30 text-status-red text-[13px] font-bold px-4 py-2.5 mb-4">
          {error}
        </div>
      )}

      {!user.sipExtension && (
        <div className="rounded-2xl bg-status-orange/10 border border-status-orange/30 text-[13px] font-bold px-4 py-2.5 mb-4 text-bingo-black">
          לא הוגדרה שלוחת Voicenter למשתמש שלך -{" "}
          <Link href="/settings/telephony" className="underline">בחר שלוחה בהגדרות הטלפוניה</Link>
        </div>
      )}

      {/* ============ הבמה המרכזית ============ */}
      {!lead ? (
        /* תור ריק */
        <div className="b-obsidian rounded-[28px] p-10 text-center text-white b-spring-in">
          <Trophy className="size-12 mx-auto mb-4 text-bingo-green" />
          <div className="text-2xl font-black mb-1.5">אין לידים בתור - כל הכבוד</div>
          <div className="text-[13px] text-white/60 font-semibold mb-5">
            סיימת את כל מה שממתין. התור מתמלא מחזרות מתוזמנות, לידים חדשים וניסיונות חוזרים.
          </div>
          <div className="flex items-center justify-center gap-4 text-[12.5px] font-bold text-white/70">
            <span className="flex items-center gap-1.5"><AlarmClock className="size-3.5" /> חזרות: {queue.queueCounts.callback}</span>
            <span className="flex items-center gap-1.5"><Sparkles className="size-3.5" /> חדשים: {queue.queueCounts.new}</span>
            <span className="flex items-center gap-1.5"><RotateCcw className="size-3.5" /> ניסיונות חוזרים: {queue.queueCounts.retry}</span>
          </div>
          <button
            type="button"
            onClick={() => { skippedRef.current = []; void fetchNext(); }}
            className="b-lift mt-6 rounded-full bg-white/10 hover:bg-white/15 px-5 py-2 text-[13px] font-extrabold"
          >
            {loadingNext ? <Loader2 className="size-4 animate-spin inline" /> : "רענן תור"}
          </button>
        </div>
      ) : (
        <div key={springKey} className="b-obsidian rounded-[28px] p-1.5 b-spring-in">
          <div className="b-glass rounded-[24px] p-6 sm:p-8">
            {/* צ'יפ הסיבה + ספירות התור */}
            <div className="flex items-center gap-2 mb-5 flex-wrap">
              <span className={cn(
                "b-chip text-[12px] font-extrabold",
                queue.reason === "callback" ? "b-chip-orange" : queue.reason === "new" ? "b-chip-green" : "b-chip-blue",
              )}>
                {queue.reason === "callback" && <AlarmClock className="size-3.5" />}
                {queue.reason === "new" && <Sparkles className="size-3.5" />}
                {queue.reason === "retry" && <RotateCcw className="size-3.5" />}
                {REASON_LABEL(queue.reason!, queue.retryAttempt)}
              </span>
              <span className="mr-auto text-[11.5px] font-bold text-bingo-gray-500 tabular-nums">
                בתור: {queue.queueCounts.callback} חזרות · {queue.queueCounts.new} חדשים · {queue.queueCounts.retry} חוזרים
              </span>
            </div>

            {/* שם + טלפון ענק + רמזור */}
            <div className="flex items-start gap-5 flex-wrap">
              <div className="min-w-0 flex-1">
                <h2 className="text-[28px] font-black text-bingo-black leading-tight truncate">{lead.fullName}</h2>
                <div className="text-[38px] sm:text-[46px] font-black text-bingo-black tabular-nums tracking-tight leading-none mt-1" dir="ltr" style={{ textAlign: "right" }}>
                  {fmtPhone(lead.phone)}
                </div>
              </div>
              <div className="flex flex-col items-center gap-1.5 shrink-0">
                <Ramzor size="sm" orientation="horizontal" value={ramzor} />
                <span className="text-[10.5px] font-extrabold text-bingo-gray-500">רמזור</span>
              </div>
            </div>

            {/* שורת המספרים */}
            <div className="grid grid-cols-3 gap-3 mt-5">
              {[
                { label: "סכום מבוקש", value: lead.amountRequested },
                { label: "הכנסה חודשית", value: lead.monthlyIncome },
                { label: "החזר חודשי", value: lead.monthlyObligations },
              ].map(({ label, value }) => (
                <div key={label} className="rounded-2xl bg-white/60 border border-bingo-gray-100 px-4 py-3">
                  <div className="text-[10.5px] font-bold text-bingo-gray-500 mb-0.5">{label}</div>
                  <div className="text-[17px] font-black text-bingo-black tabular-nums">
                    {value != null ? formatCurrency(value) : "-"}
                  </div>
                </div>
              ))}
            </div>

            {/* צ'יפי תהליכים */}
            {lead.processes.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap mt-4">
                {lead.processes.map((p, i) => (
                  <span key={i} className="b-chip b-chip-gray text-[11px]">
                    {processByKey(p.processKey)?.name ?? p.processKey} · {p.statusKey}
                  </span>
                ))}
              </div>
            )}

            {/* פעילות אחרונה + פתק */}
            {(lead.lastActivity || lead.latestNote) && (
              <div className="mt-4 space-y-1">
                {lead.lastActivity && (
                  <div className="text-[12px] text-bingo-gray-500 font-semibold truncate">
                    פעילות אחרונה: {lead.lastActivity.text} · {relativeTime(lead.lastActivity.createdAt)}
                  </div>
                )}
                {lead.latestNote && (
                  <div className="text-[12.5px] font-bold text-bingo-black bg-bingo-green/10 rounded-xl px-3 py-1.5 truncate">
                    {lead.latestNote}
                  </div>
                )}
              </div>
            )}

            {/* ============ אזור הפעולה ============ */}
            {phase === "ready" && (
              <div className="flex items-center gap-3 mt-7 flex-wrap">
                <button
                  type="button"
                  onClick={() => void dial()}
                  disabled={dialing || loadingNext || !user.sipExtension}
                  className={cn(
                    "b-lift flex items-center gap-2.5 rounded-full bg-bingo-green text-bingo-black px-9 py-4 text-[17px] font-black disabled:opacity-50",
                    "shadow-[0_12px_30px_-8px_var(--b-glow-green)]",
                  )}
                >
                  {dialing ? <Loader2 className="size-5 animate-spin" /> : <Phone className="size-5" />}
                  חייג
                  <kbd className="text-[10px] font-bold bg-black/10 rounded px-1.5 py-0.5">Enter</kbd>
                </button>
                <button
                  type="button"
                  onClick={skip}
                  disabled={loadingNext}
                  className="b-lift b-glass flex items-center gap-2 rounded-full px-6 py-4 text-[14px] font-extrabold text-bingo-gray-600 disabled:opacity-50"
                >
                  {loadingNext ? <Loader2 className="size-4 animate-spin" /> : <SkipForward className="size-4" />}
                  דלג
                  <kbd className="text-[10px] font-bold bg-black/5 rounded px-1.5 py-0.5">S</kbd>
                </button>
                <Link
                  href={`/leads/${lead.id}`}
                  target="_blank"
                  className="b-lift flex items-center gap-2 rounded-full px-5 py-4 text-[13.5px] font-extrabold text-bingo-gray-500 hover:text-bingo-black"
                >
                  <ExternalLink className="size-4" />
                  פתח כרטיס מלא
                </Link>
              </div>
            )}

            {phase === "dialing" && (
              <div className="flex items-center gap-4 mt-7 flex-wrap">
                <span className="b-pulse-glow flex items-center gap-2.5 rounded-full bg-bingo-black text-white px-7 py-4 text-[15px] font-black">
                  <span className="size-2.5 rounded-full bg-bingo-green animate-pulse" />
                  בשיחה...
                </span>
                <button
                  type="button"
                  onClick={() => { setCallEndStatus(null); setPhase("disposition"); }}
                  className="b-lift b-glass flex items-center gap-2 rounded-full px-6 py-4 text-[14px] font-extrabold text-bingo-gray-600"
                >
                  <PhoneOff className="size-4" />
                  סיים וסווג
                </button>
              </div>
            )}

            {/* התסריט החי - רק תוך כדי שיחה */}
            <LiveScript active={phase === "dialing"} startedAt={callStartedAt} />

            {phase === "disposition" && !callbackPicker && (
              <div className="mt-7">
                <div className="text-[12.5px] font-extrabold text-bingo-gray-500 mb-2.5">
                  איך הסתיימה השיחה?
                  {callEndStatus && callEndStatus !== "ANSWER" && (
                    <span className="mr-2 b-chip b-chip-orange text-[11px]">סטטוס מרכזייה: {callEndStatus}</span>
                  )}
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
                  {[
                    { d: "no-answer", key: "1", label: "אין מענה", icon: PhoneMissed, cls: "bg-white/70 text-bingo-black" },
                    { d: "callback", key: "2", label: "לחזור", icon: CalendarClock, cls: "bg-status-orange/15 text-bingo-black" },
                    { d: "advanced", key: "3", label: "התקדם", icon: TrendingUp, cls: "bg-bingo-green/20 text-bingo-black" },
                    { d: "not-interested", key: "4", label: "לא מעוניין", icon: Ban, cls: "bg-status-red/12 text-bingo-black" },
                  ].map(({ d, key, label, icon: Icon, cls }) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => chooseDisposition(d)}
                      className={cn("b-lift rounded-2xl border border-bingo-gray-100 px-4 py-5 flex flex-col items-center gap-2", cls)}
                    >
                      <Icon className="size-6" />
                      <span className="text-[14px] font-black">{label}</span>
                      <kbd className="text-[10px] font-bold bg-black/8 rounded px-1.5 py-0.5">{key}</kbd>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {phase === "disposition" && callbackPicker && (
              <div className="mt-7 b-spring-in">
                <div className="text-[12.5px] font-extrabold text-bingo-gray-500 mb-2.5">מתי לחזור ללקוח?</div>
                <div className="flex items-center gap-2 flex-wrap">
                  {([
                    ["1h", "+1 שעה"],
                    ["4h", "+4 שעות"],
                    ["tomorrow", "מחר 10:00"],
                  ] as const).map(([kind, label]) => (
                    <button
                      key={kind}
                      type="button"
                      onClick={() => void sendDisposition("callback", { callbackAt: quickCallbackAt(kind).toISOString() })}
                      className="b-lift b-glass rounded-full px-5 py-2.5 text-[13px] font-extrabold text-bingo-black"
                    >
                      {label}
                    </button>
                  ))}
                  <input
                    type="datetime-local"
                    value={customAt}
                    onChange={(e) => setCustomAt(e.target.value)}
                    className="b-input !w-auto text-[13px]"
                    aria-label="מועד מותאם"
                  />
                  <button
                    type="button"
                    disabled={!customAt}
                    onClick={() => void sendDisposition("callback", { callbackAt: new Date(customAt).toISOString() })}
                    className="b-lift rounded-full bg-bingo-black text-white px-5 py-2.5 text-[13px] font-extrabold disabled:opacity-40"
                  >
                    קבע
                  </button>
                  <button
                    type="button"
                    onClick={() => setCallbackPicker(false)}
                    className="text-[12.5px] font-bold text-bingo-gray-500 hover:text-bingo-black px-2"
                  >
                    חזרה
                  </button>
                </div>
              </div>
            )}

            {/* משוב הבינה בין השיחות - שער המעבר לליד הבא */}
            {phase === "review" && (
              <PostCallCard
                callId={callRowId}
                leadId={lead.id}
                turbo={turbo}
                onNext={() => void fetchNext(turboRef.current)}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
