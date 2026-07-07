"use client";
/**
 * פאנל המשימות הצדדי — מחובר לנתוני אמת (/api/tasks).
 * טאבים: נכנסות (אליי) · יוצאות (ממני) · עתידי — כמו הפאנל של Yoatsim.
 * "me" נפתר בשרת דרך lib/current-user.ts (חן צולר עד שתהיה התחברות).
 */
import * as React from "react";
import Link from "next/link";
import { Plus, ListChecks, AlarmClock } from "lucide-react";
import { cn, formatDate, formatTime } from "@/lib/utils";

type Tab = "incoming" | "outgoing" | "future";

interface TaskDTO {
  id: number;
  text: string;
  urgent: boolean;
  channel: string | null;
  dueAt: string | null;
  createdAt: string;
  lead: { id: number; fullName: string } | null;
  fromUser: { id: number; name: string; emoji: string | null } | null;
  toUser: { id: number; name: string; emoji: string | null } | null;
}

type TaskLists = Record<Tab, TaskDTO[]>;

const TAB_LABELS: Record<Tab, string> = { incoming: "נכנסות", outgoing: "יוצאות", future: "עתידי" };
const TABS: Tab[] = ["incoming", "outgoing", "future"];

export function TasksPanel() {
  const [tab, setTab] = React.useState<Tab>("incoming");
  const [lists, setLists] = React.useState<TaskLists | null>(null);

  React.useEffect(() => {
    let alive = true;
    Promise.all(
      TABS.map((f) =>
        fetch(`/api/tasks?filter=${f}&userId=me`)
          .then((r) => (r.ok ? (r.json() as Promise<TaskDTO[]>) : []))
          .catch(() => [] as TaskDTO[]),
      ),
    ).then(([incoming, outgoing, future]) => {
      if (alive) setLists({ incoming, outgoing, future });
    });
    return () => {
      alive = false;
    };
  }, []);

  const loading = lists === null;
  const filtered = lists?.[tab] ?? [];
  const urgentCount = lists ? lists.incoming.filter((t) => t.urgent).length : 0;

  const markDone = (id: number) => {
    // אופטימי: מסירים מיד מכל הרשימות, ה-API מסמן doneAt בשרת
    setLists((prev) =>
      prev
        ? {
            incoming: prev.incoming.filter((t) => t.id !== id),
            outgoing: prev.outgoing.filter((t) => t.id !== id),
            future: prev.future.filter((t) => t.id !== id),
          }
        : prev,
    );
    fetch(`/api/tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ done: true }),
    }).catch(() => {});
  };

  return (
    <aside className="w-72 shrink-0 surface-sidebar h-[calc(100vh-60px)] sticky top-[60px] overflow-hidden flex flex-col border-r border-bingo-gray-150">
      <div className="px-4 pt-3 pb-2">
        <div className="flex items-center justify-between mb-2.5">
          <h2 className="text-headline inline-flex items-center gap-1.5">
            <ListChecks className="size-3.5 text-[var(--color-tinted-text-secondary)]" />
            משימות
            {urgentCount > 0 && (
              <span className="text-[10px] tabular-nums font-semibold bg-red-500 text-white rounded-full px-1.5 py-0.5">
                {urgentCount}
              </span>
            )}
          </h2>
          <div className="flex items-center gap-1">
            <button className="size-6 rounded-md text-[var(--color-accent)] hover:bg-[var(--color-accent-soft)] inline-flex items-center justify-center transition" title="הוסף משימה">
              <Plus className="size-3.5" />
            </button>
            <button className="size-6 rounded-md text-amber-600 hover:bg-amber-50 inline-flex items-center justify-center transition" title="משימה מתפרצת">
              <AlarmClock className="size-3.5" />
            </button>
          </div>
        </div>
        <div className="segmented-apple w-full grid grid-cols-3 gap-0.5">
          {TABS.map((t) => (
            <button key={t} data-active={tab === t} onClick={() => setTab(t)}>
              {TAB_LABELS[t]}{" "}
              {(lists?.[t].length ?? 0) > 0 && <span className="text-[10px] opacity-60">{lists![t].length}</span>}
            </button>
          ))}
        </div>
      </div>
      <div className="divider-apple mx-4" />

      <div className="flex-1 overflow-y-auto">
        {loading && (
          <div className="px-4 py-3 space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-start gap-2.5 animate-pulse">
                <div className="size-4 rounded-full bg-black/[0.06] mt-0.5 shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-2.5 w-2/3 rounded bg-black/[0.06]" />
                  <div className="h-2 w-full rounded bg-black/[0.05]" />
                  <div className="h-2 w-1/3 rounded bg-black/[0.04]" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="px-6 py-16 text-center">
            <ListChecks className="size-7 text-bingo-gray-300 mx-auto mb-2" />
            <div className="text-xs font-medium text-bingo-gray-500">
              אין משימות {tab === "incoming" ? "נכנסות" : tab === "outgoing" ? "יוצאות" : "עתידיות"}
            </div>
          </div>
        )}

        {!loading &&
          filtered.map((t) => {
            const counterpart = tab === "outgoing" ? t.toUser : t.fromUser;
            const inner = (
              <>
                <button
                  className="size-4 rounded-full border border-black/15 hover:border-[var(--color-accent)] hover:bg-[var(--color-accent-soft)] mt-0.5 shrink-0 transition"
                  title="סמן כבוצעה"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    markDone(t.id);
                  }}
                />
                <div className="flex-1 min-w-0">
                  <div className="text-[12px] font-medium text-[var(--color-tinted-text-primary)] truncate">
                    {t.lead?.fullName ?? "משימה כללית"}
                  </div>
                  <div className="text-[11px] text-[var(--color-tinted-text-secondary)] line-clamp-1 mt-0.5">{t.text}</div>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className={cn("inline-block size-1.5 rounded-full", t.urgent ? "bg-red-500" : "bg-emerald-500")} />
                    {t.dueAt && (
                      <>
                        <span className="text-[10px] text-[var(--color-tinted-text-tertiary)] tabular-nums">
                          {formatDate(t.dueAt)} {formatTime(t.dueAt)}
                        </span>
                        <span className="text-[10px] text-[var(--color-tinted-text-tertiary)]">·</span>
                      </>
                    )}
                    <span className="text-[10px] text-[var(--color-tinted-text-tertiary)] truncate">
                      {counterpart?.name ?? "מערכת"}
                    </span>
                  </div>
                </div>
              </>
            );
            const rowClass = "group flex items-start gap-2.5 px-4 py-2.5 hover:bg-black/[0.02] transition";
            return t.lead ? (
              <Link key={t.id} href={`/leads/${t.lead.id}`} className={rowClass}>
                {inner}
              </Link>
            ) : (
              <div key={t.id} className={rowClass}>
                {inner}
              </div>
            );
          })}
      </div>
      <div className="divider-apple mx-4" />
      <div className="px-4 py-2.5 flex items-center justify-between">
        <span className="text-[11px] text-[var(--color-tinted-text-tertiary)]">{loading ? "טוען…" : `${filtered.length} משימות`}</span>
        <Link href="/tasks" className="text-[11px] font-medium text-[var(--color-accent)] hover:underline">
          הצג הכל
        </Link>
      </div>
    </aside>
  );
}
