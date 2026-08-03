"use client";
/**
 * עמוד 3 — תיעוד בשפת "נייר חשמלי": ציר קונסטלציה — פס שיער אנכי עם נקודות
 * צבעוניות לפי סוג הפריט, שורות זכוכית שנכנסות בגלילה, ונגן הקלטות כהה.
 * המיזוג נבנה בשרת (page.tsx) ומגיע כ-prop — אין fetch בצד לקוח ואין layout shift.
 */
import * as React from "react";
import {
  Phone, MessageCircle, StickyNote, CheckSquare, Settings2, Mail,
  MessageSquareText, Plus,
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { cn, formatDate, formatTime, relativeTime } from "@/lib/utils";
import type { UserOption } from "@/components/classic/useClassicCard";
import type { CardV4PageProps, TimelineItem } from "./types";
import { Icon3D, SectionHeader, SPRING_ENTRANCE, SPRING_SNAPPY, TWEEN_REDUCED } from "./ep";

type Filter = "all" | "calls" | "whatsapp" | "notes" | "tasks" | "system";

const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "הכל" },
  { key: "calls", label: "שיחות" },
  { key: "whatsapp", label: "וואטסאפ" },
  { key: "notes", label: "הערות" },
  { key: "tasks", label: "משימות" },
  { key: "system", label: "מערכת" },
];

function matches(item: TimelineItem, f: Filter): boolean {
  switch (f) {
    case "all": return true;
    case "calls": return item.kind === "call" || item.type === "call";
    case "whatsapp": return item.type === "whatsapp";
    case "notes": return item.kind === "activity" && item.type === "note";
    case "tasks": return item.kind === "task";
    case "system": return item.kind === "activity" && ["system", "status-change", "journey", "bot"].includes(item.type);
    default: return true;
  }
}

/* צבעי הקונסטלציה — נקודה (dot) + צבע עומק לאייקון, לפי פלטת השלבים */
function itemPalette(item: TimelineItem): { dot: string; deep: string } {
  if (item.kind === "call" || item.type === "call") return { dot: "#6fc3ff", deep: "#1e5f8a" };   // sky
  if (item.kind === "task") return { dot: "#ffb080", deep: "#a05224" };                            // peach
  switch (item.type) {
    case "whatsapp": return { dot: "#50ff0a", deep: "#2e7a12" };                                   // mint
    case "sms":
    case "email": return { dot: "#b49cff", deep: "#5b3fa0" };                                      // lilac
    case "note": return { dot: "#e8cf7a", deep: "#8a6d1e" };                                       // sand
    default: return { dot: "#A8AAA5", deep: "#696967" };                                           // system gray
  }
}

function ItemIcon({ item, deep }: { item: TimelineItem; deep: string }) {
  const cls = "size-4 shrink-0";
  const sw = 1.75;
  const style = { color: deep };
  if (item.kind === "call" || item.type === "call") return <Phone className={cls} style={style} strokeWidth={sw} />;
  if (item.kind === "task") return <CheckSquare className={cls} style={style} strokeWidth={sw} />;
  switch (item.type) {
    case "whatsapp": return <MessageCircle className={cls} style={style} strokeWidth={sw} />;
    case "sms": return <MessageSquareText className={cls} style={style} strokeWidth={sw} />;
    case "email": return <Mail className={cls} style={style} strokeWidth={sw} />;
    case "note": return <StickyNote className={cls} style={style} strokeWidth={sw} />;
    default: return <Settings2 className={cls} style={style} strokeWidth={sw} />;
  }
}

function fmtDuration(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

const DISPOSITION_HE: Record<string, string> = {
  "no-answer": "אין מענה",
  callback: "לחזור אליו",
  advanced: "התקדם",
  "not-interested": "לא מעוניין",
};

export function Page3Timeline({ state, timeline, users }: CardV4PageProps & {
  timeline: TimelineItem[];
  users: UserOption[];
}) {
  const reduced = !!useReducedMotion();
  const [items, setItems] = React.useState<TimelineItem[]>(timeline);
  const [filter, setFilter] = React.useState<Filter>("all");
  const [note, setNote] = React.useState("");
  const [taskOpen, setTaskOpen] = React.useState(false);
  const [taskText, setTaskText] = React.useState("");
  const [taskDue, setTaskDue] = React.useState("");
  const [taskTo, setTaskTo] = React.useState("");
  const [taskSaving, setTaskSaving] = React.useState(false);

  const visible = items.filter((i) => matches(i, filter));

  const addNote = () => {
    const text = note.trim();
    if (!text) return;
    state.addNote("note", text);
    setItems((arr) => [{
      key: `a-local-${Date.now()}`, kind: "activity", type: "note", text,
      at: new Date().toISOString(), userName: null,
    }, ...arr]);
    setNote("");
  };

  const addTask = async () => {
    const text = taskText.trim();
    if (!text || taskSaving) return;
    setTaskSaving(true);
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leadId: state.lead.id,
          text,
          dueAt: taskDue || null,
          toUserId: taskTo ? Number(taskTo) : null,
        }),
      });
      if (res.ok) {
        const row = await res.json();
        setItems((arr) => [{
          key: `t-${row.id}`, kind: "task", type: "task", text,
          at: new Date().toISOString(), userName: row.toUser?.name ?? null,
          taskId: row.id, done: false, dueAt: taskDue ? new Date(taskDue).toISOString() : null,
        }, ...arr]);
        setTaskText(""); setTaskDue(""); setTaskTo(""); setTaskOpen(false);
      }
    } finally {
      setTaskSaving(false);
    }
  };

  const markDone = (taskId: number) => {
    setItems((arr) => arr.map((i) => (i.taskId === taskId ? { ...i, done: true } : i)));
    void fetch(`/api/tasks/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ done: true }),
    }).catch(() => {});
  };

  return (
    <div className="space-y-3">
      <SectionHeader icon="hourglass" title="תיעוד" />

      {/* ---------- שורת הוספה מהירה — זכוכית ---------- */}
      <div className="ep-glass p-4 space-y-3">
        <div className="flex items-center gap-2">
          <input
            className="b-input ep-input h-11 text-[13.5px] flex-1"
            placeholder="הוסף הערה ולחץ Enter"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addNote(); } }}
          />
          <button type="button" onClick={() => setTaskOpen((v) => !v)}
            className={cn("b-pill b-pill-sm min-h-11", taskOpen ? "b-pill-dark" : "b-pill-ghost")}>
            <Plus className="size-4" strokeWidth={1.75} /> משימה
          </button>
        </div>
        {taskOpen && (
          <div className="flex items-center gap-2 flex-wrap">
            <input className="b-input ep-input h-11 text-[13px] flex-1 min-w-44" placeholder="תוכן המשימה"
              value={taskText} onChange={(e) => setTaskText(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); void addTask(); } }} />
            <input type="datetime-local" className="b-input ep-input h-11 text-[13px] w-52 tabular-nums"
              aria-label="תאריך יעד" value={taskDue} onChange={(e) => setTaskDue(e.target.value)} />
            <select className="b-input ep-input h-11 text-[13px] w-40 cursor-pointer" aria-label="למי המשימה"
              value={taskTo} onChange={(e) => setTaskTo(e.target.value)}>
              <option value="">אליי</option>
              {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
            <button type="button" onClick={() => void addTask()} disabled={taskSaving || !taskText.trim()}
              className="b-pill b-pill-dark b-pill-sm min-h-11 disabled:opacity-50">
              {taskSaving ? "שומר..." : "צור משימה"}
            </button>
          </div>
        )}
      </div>

      {/* ---------- פילטרים ---------- */}
      <div className="flex items-center gap-2 flex-wrap">
        {FILTERS.map((f) => (
          <motion.button key={f.key} type="button" onClick={() => setFilter(f.key)}
            whileTap={reduced ? undefined : { scale: 0.94 }}
            transition={SPRING_SNAPPY}
            className={cn(
              "rounded-full px-4 h-9 min-w-11 text-[12.5px] font-semibold transition-colors duration-120",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bingo-black",
              filter === f.key
                ? "bg-bingo-black text-white"
                : "bg-white/60 border border-bingo-black/10 text-bingo-gray-600 hover:bg-white",
            )}>
            {f.label}
          </motion.button>
        ))}
      </div>

      {/* ---------- ציר הקונסטלציה ---------- */}
      {visible.length === 0 ? (
        <div className="ep-glass px-6 py-10 flex flex-col items-center gap-3 text-center">
          <Icon3D name="checklist" size={44} />
          <p className="text-[14px] font-bold text-bingo-black">
            {filter === "all" ? "עוד אין תיעוד בכרטיס" : "אין פריטים בסינון הזה"}
          </p>
          <p className="text-[12.5px] text-bingo-gray-500">
            {filter === "all" ? "ההערה הראשונה שתוסיף למעלה תופיע כאן" : "נסה סינון אחר או חזור להכל"}
          </p>
        </div>
      ) : (
        <div className="relative ps-6">
          {/* פס השיער של הציר */}
          <span aria-hidden className="absolute top-2 bottom-2 start-[9px] w-px bg-bingo-black/10" />
          <div className="space-y-2">
            {visible.map((item, i) => {
              const pal = itemPalette(item);
              return (
                <motion.div
                  key={item.key}
                  initial={reduced ? { opacity: 0 } : { opacity: 0, y: 14, scale: 0.98 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true, margin: "-20px" }}
                  transition={reduced ? TWEEN_REDUCED : { ...SPRING_ENTRANCE, delay: Math.min(i, 5) * 0.05 }}
                  className="relative ep-glass px-4 py-3 min-h-11 flex items-start gap-3"
                >
                  {/* נקודת הקונסטלציה על הפס */}
                  <span
                    aria-hidden
                    className="absolute top-[18px] -start-[19.5px] size-2 rounded-full"
                    style={{ background: pal.dot, boxShadow: `0 0 8px ${pal.dot}` }}
                  />
                  <span className="mt-0.5"><ItemIcon item={item} deep={pal.deep} /></span>
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      "text-[13.5px] text-bingo-black leading-snug break-words",
                      item.kind === "task" && item.done && "line-through text-bingo-gray-400",
                    )}>
                      {item.text}
                    </p>
                    {item.kind === "call" && (
                      <div className="mt-1 flex items-center gap-3 flex-wrap text-[12px] text-bingo-gray-500">
                        {typeof item.duration === "number" && item.duration > 0 && (
                          <span className="tabular-nums">משך {fmtDuration(item.duration)}</span>
                        )}
                        {item.disposition && <span>{DISPOSITION_HE[item.disposition] ?? item.disposition}</span>}
                        {item.recordUrl && (
                          <span className="inline-flex rounded-full p-0.5"
                            style={{ background: "linear-gradient(180deg,#2e2e2e,#1e1e1e)", border: "1px solid rgba(255,255,255,.1)" }}>
                            <audio controls preload="none" src={item.recordUrl} className="h-8 max-w-72 rounded-full" />
                          </span>
                        )}
                      </div>
                    )}
                    {item.kind === "task" && item.dueAt && (
                      <p className="mt-0.5 text-[12px] text-bingo-gray-500 tabular-nums">
                        יעד: {formatDate(item.dueAt)} {formatTime(item.dueAt)}
                      </p>
                    )}
                  </div>
                  {item.kind === "task" && !item.done && item.taskId && (
                    <button type="button" onClick={() => markDone(item.taskId!)}
                      className="b-pill b-pill-ghost b-pill-sm shrink-0">
                      סמן כבוצעה
                    </button>
                  )}
                  <span className="text-[11.5px] text-bingo-gray-600 tabular-nums shrink-0 mt-1"
                    title={`${formatDate(item.at)} ${formatTime(item.at)}`}>
                    {relativeTime(item.at)}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
