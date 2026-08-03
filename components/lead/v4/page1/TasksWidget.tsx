"use client";
/**
 * וידג'ט משימות צר בראש עמוד 1 — המשימות הפתוחות של הליד + הוספה מהירה.
 * ‎/api/tasks לא מסנן לפי ליד — מסננים בצד הלקוח.
 */
import * as React from "react";
import { ChevronDown, Plus, Zap, CalendarClock } from "lucide-react";
import { Icon3D } from "./ep";

interface TaskRow {
  id: number;
  text: string;
  urgent: boolean;
  done: boolean;
  dueAt: string | null;
  leadId?: number | null;
  lead?: { id: number } | null;
}

function fmtDue(dueAt: string | null): string {
  if (!dueAt) return "";
  const d = new Date(dueAt);
  return d.toLocaleDateString("he-IL", { day: "numeric", month: "numeric" }) +
    " " + d.toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" });
}

export function TasksWidget({ leadId }: { leadId: number }) {
  const [tasks, setTasks] = React.useState<TaskRow[] | null>(null);
  const [open, setOpen] = React.useState(false);
  const [adding, setAdding] = React.useState(false);
  const [text, setText] = React.useState("");
  const [dueAt, setDueAt] = React.useState("");
  const [urgent, setUrgent] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [err, setErr] = React.useState("");

  const refresh = React.useCallback(async () => {
    try {
      const res = await fetch("/api/tasks");
      if (!res.ok) return;
      const data = await res.json();
      const list: TaskRow[] = Array.isArray(data) ? data : data.tasks ?? [];
      setTasks(list.filter((t) => (t.lead?.id ?? t.leadId) === leadId && !t.done));
    } catch { /* הווידג'ט לא חוסם את הכרטיס */ }
  }, [leadId]);

  React.useEffect(() => { void refresh(); }, [refresh]);

  const add = async () => {
    if (!text.trim() || saving) return;
    setSaving(true);
    setErr("");
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId, text: text.trim(), urgent, dueAt: dueAt || null }),
      });
      if (!res.ok) throw new Error();
      /* הצלחה בלבד מנקה את הטופס — בכשל הטקסט והמועד נשארים לניסיון חוזר */
      setText(""); setDueAt(""); setUrgent(false); setAdding(false);
      await refresh();
    } catch {
      setErr("שמירת המשימה נכשלה - נסה שוב");
    } finally {
      setSaving(false);
    }
  };

  const complete = async (id: number) => {
    /* הסרה אופטימית + החזרה לרשימה אם העדכון בשרת נכשל */
    const removed = tasks?.find((x) => x.id === id) ?? null;
    setErr("");
    setTasks((t) => (t ? t.filter((x) => x.id !== id) : t));
    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ done: true }),
      });
      if (!res.ok) throw new Error();
    } catch {
      setTasks((t) => (removed && t ? [...t, removed].sort((a, b) => a.id - b.id) : t));
      setErr("סימון המשימה נכשל - נסה שוב");
    }
  };

  const count = tasks?.length ?? 0;

  return (
    <section className="ep-glass overflow-hidden" aria-label="משימות פתוחות">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-3 px-5 py-2.5 min-h-[48px] text-start hover:bg-white/80 transition-colors"
        aria-expanded={open}
      >
        <Icon3D name="calendar" size={28} radius={9} />
        <span className="text-[14px] font-bold text-bingo-black">משימות</span>
        <span className="b-chip-gray text-[12px] px-2.5 py-0.5 rounded-full tabular-nums">{count}</span>
        <span className="flex-1" />
        <ChevronDown
          size={16}
          strokeWidth={1.75}
          className={`text-bingo-gray-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="px-6 pb-5 v4p1-enter">
          {tasks === null ? (
            <p className="text-[13px] text-bingo-gray-500 py-2">טוען משימות</p>
          ) : count === 0 ? (
            <p className="text-[13px] text-bingo-gray-500 py-2">אין משימות פתוחות לליד הזה</p>
          ) : (
            <ul className="space-y-1 mb-3">
              {tasks!.map((t) => (
                <li key={t.id} className="flex items-center gap-3 py-1.5">
                  <input
                    type="checkbox"
                    aria-label={`סמן כבוצעה: ${t.text}`}
                    className="w-4 h-4 accent-[#292929] cursor-pointer"
                    onChange={() => void complete(t.id)}
                  />
                  <span className="text-[14px] text-bingo-black flex-1 min-w-0 truncate">{t.text}</span>
                  {t.urgent && (
                    <span className="b-chip-red text-[11px] px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Zap size={11} strokeWidth={1.75} /> מתפרצת
                    </span>
                  )}
                  {t.dueAt && (
                    <span className="text-[12px] text-bingo-gray-500 tabular-nums flex items-center gap-1 shrink-0">
                      <CalendarClock size={13} strokeWidth={1.75} /> {fmtDue(t.dueAt)}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}

          {err && (
            <p role="alert" aria-live="assertive" className="text-[12px] font-bold text-status-red mb-2">
              {err}
            </p>
          )}

          {adding ? (
            <div className="flex flex-wrap items-center gap-2">
              <input
                autoFocus
                className="b-input ep-input flex-1 min-w-40"
                placeholder="מה צריך לעשות"
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") void add(); }}
              />
              <input
                type="datetime-local"
                className="b-input ep-input w-auto tabular-nums"
                value={dueAt}
                onChange={(e) => setDueAt(e.target.value)}
                aria-label="מועד יעד"
              />
              <button
                type="button"
                aria-pressed={urgent}
                onClick={() => setUrgent((u) => !u)}
                className={`min-h-[44px] px-4 rounded-full text-[13px] font-semibold border transition-colors ${
                  urgent
                    ? "bg-status-red-soft border-status-red text-status-red"
                    : "bg-white border-bingo-gray-200 text-bingo-gray-600 hover:border-bingo-gray-400"
                }`}
              >
                מתפרצת
              </button>
              <button
                type="button"
                onClick={() => void add()}
                disabled={!text.trim() || saving}
                className="b-pill-dark min-h-[44px] px-5 text-[13px] disabled:opacity-50"
              >
                הוסף
              </button>
              <button
                type="button"
                onClick={() => setAdding(false)}
                className="min-h-[44px] px-3 text-[13px] text-bingo-gray-500 hover:text-bingo-black"
              >
                ביטול
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setAdding(true)}
              className="flex items-center gap-1.5 text-[13px] font-semibold text-bingo-gray-600 hover:text-bingo-black min-h-[44px]"
            >
              <Plus size={15} strokeWidth={1.75} /> משימה חדשה
            </button>
          )}
        </div>
      )}
    </section>
  );
}
