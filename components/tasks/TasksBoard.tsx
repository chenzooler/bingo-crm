"use client";
/**
 * לוח המשימות המלא — שכפול פאנל "משימות ופעילויות" של Yoatsim בקנה מידה של עמוד.
 * מקור: docs/yoatsim-audit.md §4 —
 *   כפתורים: + משימה (ירוק) · + מתפרצת (אדום)
 *   פילטרים: ✓ (הושלמו) | עתידי | יוצאות | נכנסות | WhatsApp | 🔕 (ללא תזכורת)
 *   שורה: תאריך · מ־משתמש → אל־משתמש · (שם ליד) · טקסט חופשי · 25 בעמוד.
 */
import * as React from "react";
import Link from "next/link";
import {
  ListChecks, Plus, AlarmClock, Check, RotateCcw, Search, X, Loader2,
  Phone, MessageCircle, MessageSquare, Mail, Inbox,
} from "lucide-react";
import { cn, formatDate, formatTime } from "@/lib/utils";

/* ========================= טיפוסים ========================= */

interface UserOption { id: number; name: string; emoji: string | null }

interface TaskDTO {
  id: number;
  text: string;
  urgent: boolean;
  channel: string | null;
  dueAt: string | null;
  done: boolean;
  doneAt: string | null;
  createdAt: string;
  lead: { id: number; fullName: string } | null;
  fromUser: { id: number; name: string; emoji: string | null } | null;
  toUser: { id: number; name: string; emoji: string | null } | null;
}

interface PagedResponse { tasks: TaskDTO[]; total: number; page: number; pageSize: number }

/** מצב תצוגה — ארבעת פילטרי-המצב של המקור (לחיצה חוזרת = כל הפתוחות) */
type Mode = "done" | "future" | "outgoing" | "incoming" | null;

const PAGE_SIZE = 25; // ברירת המחדל של Yoatsim

const CHANNELS = [
  { key: "call", label: "שיחה", Icon: Phone },
  { key: "whatsapp", label: "WhatsApp", Icon: MessageCircle },
  { key: "sms", label: "SMS", Icon: MessageSquare },
  { key: "email", label: "מייל", Icon: Mail },
] as const;

const CHANNEL_ICON: Record<string, React.ComponentType<{ className?: string }>> = {
  call: Phone, whatsapp: MessageCircle, sms: MessageSquare, email: Mail,
};

/* ========================= הלוח ========================= */

export function TasksBoard({ meId, users, initialOverdue }: {
  meId: number | null;
  users: UserOption[];
  initialOverdue: number;
}) {
  const [mode, setMode] = React.useState<Mode>("incoming"); // ברירת מחדל: נכנסות
  const [whatsappOnly, setWhatsappOnly] = React.useState(false);
  const [noReminder, setNoReminder] = React.useState(false);
  const [search, setSearch] = React.useState("");

  const [tasks, setTasks] = React.useState<TaskDTO[]>([]);
  const [total, setTotal] = React.useState(0);
  const [page, setPage] = React.useState(1);
  const [loading, setLoading] = React.useState(true);
  const [loadingMore, setLoadingMore] = React.useState(false);
  const [formOpen, setFormOpen] = React.useState<null | "task" | "urgent">(null);

  const buildUrl = React.useCallback((p: number) => {
    const usp = new URLSearchParams();
    if (mode) usp.set("filter", mode);
    // נכנסות/יוצאות מוגדרות ביחס אליי; הושלמו — גם כן שלי (יצרתי/קיבלתי)
    if (mode === "incoming" || mode === "outgoing" || mode === "done") usp.set("userId", "me");
    if (whatsappOnly) usp.set("channel", "whatsapp");
    if (noReminder) usp.set("noReminder", "1");
    usp.set("page", String(p));
    usp.set("pageSize", String(PAGE_SIZE));
    return `/api/tasks?${usp.toString()}`;
  }, [mode, whatsappOnly, noReminder]);

  // טעינה מחדש בכל שינוי פילטר
  React.useEffect(() => {
    let alive = true;
    setLoading(true);
    setPage(1);
    fetch(buildUrl(1))
      .then((r) => (r.ok ? (r.json() as Promise<PagedResponse>) : { tasks: [], total: 0, page: 1, pageSize: PAGE_SIZE }))
      .then((d) => {
        if (!alive) return;
        setTasks(d.tasks);
        setTotal(d.total);
        setLoading(false);
      })
      .catch(() => alive && setLoading(false));
    return () => { alive = false; };
  }, [buildUrl]);

  const loadMore = () => {
    const next = page + 1;
    setLoadingMore(true);
    fetch(buildUrl(next))
      .then((r) => (r.ok ? (r.json() as Promise<PagedResponse>) : null))
      .then((d) => {
        if (d) {
          setTasks((prev) => [...prev, ...d.tasks.filter((t) => !prev.some((p) => p.id === t.id))]);
          setTotal(d.total);
          setPage(next);
        }
      })
      .finally(() => setLoadingMore(false));
  };

  /** סימון בוצע / שחזור — אופטימי, בתוך השורה (נותן צ'אנס לשחזר) */
  const toggleDone = (id: number, done: boolean) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done, doneAt: done ? new Date().toISOString() : null } : t)));
    fetch(`/api/tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ done }),
    }).catch(() => {
      // כישלון — מחזירים למצב הקודם
      setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done: !done, doneAt: null } : t)));
    });
  };

  const onCreated = (task: TaskDTO) => {
    setTasks((prev) => [task, ...prev]);
    setTotal((t) => t + 1);
    setFormOpen(null);
  };

  // חיפוש חופשי — צד לקוח, על טקסט המשימה + שם הליד
  const q = search.trim();
  const visible = q
    ? tasks.filter((t) => t.text.includes(q) || (t.lead?.fullName ?? "").includes(q) ||
        (t.fromUser?.name ?? "").includes(q) || (t.toUser?.name ?? "").includes(q))
    : tasks;

  const overdueCount = initialOverdue; // מהשרת — כמו הצ'יפ במסך הראשי

  return (
    <div className="space-y-4 max-w-[1100px]">
      {/* ===== כותרת ===== */}
      <div className="b-card p-5 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4 min-w-0">
          <span className="b-icon b-icon-green size-14">
            <ListChecks className="size-6" />
          </span>
          <div className="min-w-0">
            <h1 className="text-[26px] font-bold tracking-tight text-bingo-black leading-none flex items-center gap-2.5 flex-wrap">
              משימות ופעילויות
              <span className="b-chip b-chip-green tabular-nums">{total}</span>
              {overdueCount > 0 && (
                <span className="b-chip b-chip-red tabular-nums">
                  <AlarmClock className="size-3" /> {overdueCount} באיחור
                </span>
              )}
            </h1>
            <p className="text-[13px] text-bingo-gray-500 mt-1.5">
              פאנל המשימות המלא — נכנסות, יוצאות, עתידיות והושלמו · כמו ביועצים
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setFormOpen(formOpen === "task" ? null : "task")} className="b-pill b-pill-sm b-pill-green">
            <Plus className="size-4" strokeWidth={2.6} /> משימה
          </button>
          <button
            onClick={() => setFormOpen(formOpen === "urgent" ? null : "urgent")}
            className="b-pill b-pill-sm bg-status-red text-white shadow-[0_4px_14px_-4px_rgba(229,72,77,0.5)] hover:brightness-110"
          >
            <AlarmClock className="size-4" /> מתפרצת
          </button>
        </div>
      </div>

      {/* ===== טופס משימה חדשה ===== */}
      {formOpen && (
        <TaskForm
          key={formOpen}
          urgent={formOpen === "urgent"}
          users={users}
          meId={meId}
          onCreated={onCreated}
          onClose={() => setFormOpen(null)}
        />
      )}

      {/* ===== שורת פילטרים — ✓ | עתידי | יוצאות | נכנסות | WhatsApp | 🔕 ===== */}
      <div className="b-card p-3 flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 flex-wrap">
          <FilterChip active={mode === "done"} onClick={() => setMode(mode === "done" ? null : "done")} tone="green">
            <Check className="size-3.5" /> הושלמו
          </FilterChip>
          <FilterChip active={mode === "future"} onClick={() => setMode(mode === "future" ? null : "future")}>
            עתידי
          </FilterChip>
          <FilterChip active={mode === "outgoing"} onClick={() => setMode(mode === "outgoing" ? null : "outgoing")}>
            יוצאות
          </FilterChip>
          <FilterChip active={mode === "incoming"} onClick={() => setMode(mode === "incoming" ? null : "incoming")}>
            נכנסות
          </FilterChip>
          <span className="w-px h-5 bg-bingo-gray-150 mx-0.5" />
          <FilterChip active={whatsappOnly} onClick={() => setWhatsappOnly((v) => !v)} tone="green">
            <MessageCircle className="size-3.5" /> WhatsApp
          </FilterChip>
          <FilterChip active={noReminder} onClick={() => setNoReminder((v) => !v)} title="ללא תזכורת">
            🔕
          </FilterChip>
        </div>
        <div className="relative flex-1 min-w-44 mr-auto">
          <Search className="size-4 text-bingo-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="חיפוש בטקסט או בשם הליד…"
            className="b-input h-9 pr-9 text-[12.5px]"
          />
        </div>
      </div>

      {/* ===== רשימת המשימות ===== */}
      <div className="b-card overflow-hidden">
        {loading ? (
          <div className="px-5 py-4 space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 animate-pulse">
                <div className="size-5 rounded-full bg-bingo-gray-100 shrink-0" />
                <div className="h-3 w-28 rounded bg-bingo-gray-100" />
                <div className="h-3 flex-1 rounded bg-bingo-gray-50" />
              </div>
            ))}
          </div>
        ) : visible.length === 0 ? (
          <div className="py-16 text-center">
            <Inbox className="size-8 text-bingo-gray-300 mx-auto mb-2.5" />
            <div className="text-[13.5px] font-semibold text-bingo-gray-500">
              {q ? "אין תוצאות לחיפוש" : "אין משימות בסינון הנוכחי"}
            </div>
          </div>
        ) : (
          <div className="divide-y divide-bingo-gray-100">
            {visible.map((t) => (
              <TaskRow key={t.id} task={t} onToggleDone={toggleDone} />
            ))}
          </div>
        )}

        {/* עימוד — טען עוד (25 בכל פעם, כמו במקור) */}
        {!loading && tasks.length < total && !q && (
          <div className="border-t border-bingo-gray-100 p-3 text-center">
            <button onClick={loadMore} disabled={loadingMore} className="b-pill b-pill-sm b-pill-ghost">
              {loadingMore ? <Loader2 className="size-4 animate-spin" /> : null}
              טען עוד <span className="text-bingo-gray-400 tabular-nums">({tasks.length} מתוך {total})</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ========================= שורת משימה ========================= */

function TaskRow({ task: t, onToggleDone }: { task: TaskDTO; onToggleDone: (id: number, done: boolean) => void }) {
  const dateSource = t.dueAt ?? t.createdAt;
  const overdue = !t.done && !!t.dueAt && new Date(t.dueAt) < new Date();
  const ChannelIcon = t.channel ? CHANNEL_ICON[t.channel] : null;

  return (
    <div
      className={cn(
        "flex items-start gap-3 px-4 py-3 transition-colors hover:bg-bingo-gray-50",
        t.urgent && !t.done && "border-r-[3px] border-status-red bg-status-red-soft/20",
        t.done && "opacity-70",
      )}
    >
      {/* בוצע / שחזור */}
      {t.done ? (
        <span className="size-5 rounded-full bg-bingo-green-light text-bingo-green-deep flex items-center justify-center mt-0.5 shrink-0">
          <Check className="size-3" strokeWidth={3} />
        </span>
      ) : (
        <button
          onClick={() => onToggleDone(t.id, true)}
          title="סמן כבוצעה"
          className="size-5 rounded-full border-[1.5px] border-bingo-gray-300 hover:border-bingo-green-deep hover:bg-bingo-green-light mt-0.5 shrink-0 transition-colors"
        />
      )}

      {/* תאריך dd/mm/yyyy HH:mm */}
      <span
        className={cn(
          "tabular-nums text-[12.5px] font-bold shrink-0 mt-0.5 whitespace-nowrap",
          overdue ? "text-status-red" : "text-bingo-gray-600",
          t.done && "line-through text-bingo-gray-400",
        )}
        title={t.dueAt ? "מועד יעד" : "ללא תזכורת — מועד יצירה"}
      >
        {formatDate(dateSource)} {formatTime(dateSource)}
        {!t.dueAt && <span className="mr-1 text-[11px] font-normal">🔕</span>}
      </span>

      {/* מ־משתמש → אל־משתמש */}
      <span className={cn("text-[12.5px] text-bingo-gray-500 shrink-0 mt-0.5 whitespace-nowrap", t.done && "line-through")}>
        {t.fromUser?.name ?? "מערכת"} ← {t.toUser?.name ?? "—"}
      </span>

      {/* (שם הליד) */}
      {t.lead && (
        <Link
          href={`/leads/${t.lead.id}`}
          className={cn("text-[12.5px] font-semibold text-bingo-blue hover:underline shrink-0 mt-0.5 whitespace-nowrap", t.done && "line-through")}
        >
          ({t.lead.fullName})
        </Link>
      )}

      {/* טקסט חופשי */}
      <span className={cn("flex-1 min-w-0 text-[13px] text-bingo-black font-medium mt-0.5", t.done && "line-through text-bingo-gray-400")}>
        {t.text}
      </span>

      {/* צ'יפים ופעולות */}
      <span className="flex items-center gap-1.5 shrink-0">
        {ChannelIcon && (
          <span className={cn("b-chip text-[10px]", t.channel === "whatsapp" ? "b-chip-green" : "b-chip-blue")}>
            <ChannelIcon className="size-3" />
          </span>
        )}
        {t.urgent && <span className="b-chip b-chip-red text-[10px]">מתפרצת</span>}
        {t.done && (
          <>
            {t.doneAt && (
              <span className="text-[11px] text-bingo-gray-400 tabular-nums whitespace-nowrap">
                בוצע {formatDate(t.doneAt)} {formatTime(t.doneAt)}
              </span>
            )}
            <button onClick={() => onToggleDone(t.id, false)} title="שחזר משימה" className="b-chip b-chip-gray text-[10px] hover:bg-bingo-gray-150 transition">
              <RotateCcw className="size-3" /> שחזר
            </button>
          </>
        )}
      </span>
    </div>
  );
}

/* ========================= צ'יפ פילטר ========================= */

function FilterChip({ active, onClick, children, tone = "dark", title }: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  tone?: "dark" | "green";
  title?: string;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={cn(
        "inline-flex items-center gap-1 h-8 px-3 rounded-full text-[12.5px] font-bold transition-colors",
        active
          ? tone === "green"
            ? "bg-bingo-green-light text-bingo-green-deep ring-1 ring-bingo-green-deep/30"
            : "bg-bingo-black text-white"
          : "bg-bingo-gray-100 text-bingo-gray-600 hover:bg-bingo-gray-150 hover:text-bingo-black",
      )}
    >
      {children}
    </button>
  );
}

/* ========================= טופס משימה חדשה ========================= */

function TaskForm({ urgent, users, meId, onCreated, onClose }: {
  urgent: boolean;
  users: UserOption[];
  meId: number | null;
  onCreated: (t: TaskDTO) => void;
  onClose: () => void;
}) {
  const [toUserId, setToUserId] = React.useState<string>(meId ? String(meId) : "");
  const [lead, setLead] = React.useState<{ id: number; fullName: string } | null>(null);
  const [text, setText] = React.useState("");
  const [dueAt, setDueAt] = React.useState("");
  const [channel, setChannel] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) { setError("חסר טקסט משימה"); return; }
    setSaving(true);
    setError(null);
    fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: text.trim(),
        toUserId: toUserId ? Number(toUserId) : null,
        leadId: lead?.id ?? null,
        dueAt: dueAt || null,
        channel,
        urgent,
      }),
    })
      .then(async (r) => {
        if (!r.ok) throw new Error((await r.json().catch(() => null))?.error ?? "שגיאה בשמירה");
        return r.json() as Promise<TaskDTO>;
      })
      .then(onCreated)
      .catch((err: Error) => setError(err.message))
      .finally(() => setSaving(false));
  };

  return (
    <form onSubmit={submit} className={cn("b-card p-4 animate-fade-in", urgent && "ring-2 ring-status-red/40")}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[14px] font-bold text-bingo-black flex items-center gap-2">
          <span className={cn("size-2 rounded-full", urgent ? "bg-status-red" : "bg-bingo-green")} />
          {urgent ? "משימה מתפרצת" : "משימה חדשה"}
          {urgent && <span className="b-chip b-chip-red text-[10px]">מתפרצת</span>}
        </h3>
        <button type="button" onClick={onClose} aria-label="סגירה" className="size-7 rounded-full bg-bingo-gray-100 hover:bg-bingo-gray-150 flex items-center justify-center text-bingo-gray-500">
          <X className="size-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <label className="block">
          <span className="text-[11px] font-bold text-bingo-gray-500 mb-1 block">אל משתמש</span>
          <select value={toUserId} onChange={(e) => setToUserId(e.target.value)} className="b-input h-10 text-[13px] cursor-pointer">
            <option value="">בחר משתמש…</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>{u.emoji ? `${u.emoji} ` : ""}{u.name}</option>
            ))}
          </select>
        </label>

        <div>
          <span className="text-[11px] font-bold text-bingo-gray-500 mb-1 block">ליד (אופציונלי)</span>
          <LeadPicker value={lead} onChange={setLead} />
        </div>

        <label className="block">
          <span className="text-[11px] font-bold text-bingo-gray-500 mb-1 block">תאריך + שעה יעד</span>
          <input type="datetime-local" value={dueAt} onChange={(e) => setDueAt(e.target.value)} className="b-input h-10 text-[13px]" />
        </label>

        <div>
          <span className="text-[11px] font-bold text-bingo-gray-500 mb-1 block">ערוץ</span>
          <div className="flex items-center gap-1">
            {CHANNELS.map(({ key, label, Icon }) => (
              <button
                key={key}
                type="button"
                title={label}
                onClick={() => setChannel(channel === key ? null : key)}
                className={cn(
                  "size-10 rounded-xl flex items-center justify-center transition-colors",
                  channel === key
                    ? "bg-bingo-green-light text-bingo-green-deep ring-1 ring-bingo-green-deep/30"
                    : "bg-bingo-gray-100 text-bingo-gray-500 hover:bg-bingo-gray-150",
                )}
              >
                <Icon className="size-4" />
              </button>
            ))}
          </div>
        </div>
      </div>

      <label className="block mt-3">
        <span className="text-[11px] font-bold text-bingo-gray-500 mb-1 block">טקסט המשימה *</span>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={2}
          required
          placeholder={urgent ? "מה בוער? המשימה תסומן כמתפרצת…" : "מה צריך לעשות?"}
          className="b-input py-2.5 text-[13px] min-h-16 resize-y"
        />
      </label>

      <div className="flex items-center justify-between mt-3">
        <span className="text-[12px] text-status-red font-semibold">{error}</span>
        <div className="flex items-center gap-2">
          <button type="button" onClick={onClose} className="b-pill b-pill-sm b-pill-ghost">ביטול</button>
          <button
            type="submit"
            disabled={saving}
            className={cn(
              "b-pill b-pill-sm",
              urgent ? "bg-status-red text-white shadow-[0_4px_14px_-4px_rgba(229,72,77,0.5)] hover:brightness-110" : "b-pill-green",
            )}
          >
            {saving ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" strokeWidth={2.6} />}
            {urgent ? "שגר מתפרצת" : "צור משימה"}
          </button>
        </div>
      </div>
    </form>
  );
}

/* ========================= בורר ליד (חיפוש חי) ========================= */

interface LeadHit { id: number; fullName: string; phone: string | null; idNumber?: string | null }

/** עידון צד-לקוח: ה-API מחזיר לפעמים התאמות-יתר (טלפון ריק ⊂ הכל) — מסננים כאן */
function refineHits(hits: LeadHit[], term: string): LeadHit[] {
  const digits = term.replace(/\D/g, "");
  return hits.filter(
    (h) =>
      h.fullName.includes(term) ||
      (digits.length >= 2 &&
        ((h.phone ?? "").includes(digits) || (h.idNumber ?? "").includes(digits))),
  );
}

function LeadPicker({ value, onChange }: {
  value: { id: number; fullName: string } | null;
  onChange: (v: { id: number; fullName: string } | null) => void;
}) {
  const [q, setQ] = React.useState("");
  const [hits, setHits] = React.useState<LeadHit[]>([]);
  const [open, setOpen] = React.useState(false);
  const [searching, setSearching] = React.useState(false);

  React.useEffect(() => {
    const term = q.trim();
    if (term.length < 2) { setHits([]); setOpen(false); return; }
    setSearching(true);
    const timer = setTimeout(() => {
      fetch(`/api/leads?q=${encodeURIComponent(term)}&pageSize=8`)
        .then((r) => (r.ok ? r.json() : { leads: [] }))
        .then((d: { leads: LeadHit[] }) => { setHits(refineHits(d.leads ?? [], term)); setOpen(true); })
        .catch(() => setHits([]))
        .finally(() => setSearching(false));
    }, 250);
    return () => clearTimeout(timer);
  }, [q]);

  if (value) {
    return (
      <div className="flex items-center gap-2 h-10">
        <Link href={`/leads/${value.id}`} className="b-chip b-chip-blue text-[12px] hover:brightness-95">
          {value.fullName}
        </Link>
        <button type="button" onClick={() => onChange(null)} aria-label="הסר ליד" className="size-6 rounded-full bg-bingo-gray-100 hover:bg-bingo-gray-150 flex items-center justify-center text-bingo-gray-500">
          <X className="size-3" />
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onFocus={() => hits.length > 0 && setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        placeholder="חפש שם / טלפון / ת.ז…"
        className="b-input h-10 text-[13px]"
      />
      {searching && <Loader2 className="size-3.5 animate-spin text-bingo-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />}
      {open && (
        <div className="absolute z-20 top-11 right-0 left-0 b-card p-1 max-h-56 overflow-y-auto shadow-lg">
          {hits.length === 0 ? (
            <div className="px-3 py-2.5 text-[12px] text-bingo-gray-400">לא נמצאו לידים</div>
          ) : (
            hits.map((h) => (
              <button
                key={h.id}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => { onChange({ id: h.id, fullName: h.fullName }); setQ(""); setOpen(false); }}
                className="w-full text-right px-3 py-2 rounded-xl hover:bg-bingo-gray-50 transition-colors flex items-center justify-between gap-2"
              >
                <span className="text-[13px] font-semibold text-bingo-black truncate">{h.fullName}</span>
                <span className="text-[11px] tabular-nums text-bingo-gray-400 shrink-0">{h.phone ?? `#${h.id}`}</span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
