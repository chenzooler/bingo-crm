"use client";
import * as React from "react";
import Link from "next/link";
import { Plus, ListChecks, ChevronDown, AlarmClock } from "lucide-react";
import { TASKS } from "@/lib/data/leads";
import { getUser } from "@/lib/data/static";
import { Avatar } from "@/components/ui/Avatar";
import { cn, formatTime } from "@/lib/utils";

type Tab = "incoming" | "outgoing" | "future";

export function TasksPanel() {
  const [tab, setTab] = React.useState<Tab>("incoming");
  const filtered = TASKS.filter((t) => t.type === tab);
  const incomingCount = TASKS.filter((t) => t.type === "incoming").length;
  const outgoingCount = TASKS.filter((t) => t.type === "outgoing").length;
  const futureCount = TASKS.filter((t) => t.type === "future").length;
  const urgentCount = TASKS.filter((t) => t.urgent).length;

  return (
    <aside className="w-72 shrink-0 surface-sidebar h-[calc(100vh-3rem)] sticky top-12 overflow-hidden flex flex-col">
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
          <button data-active={tab === "incoming"} onClick={() => setTab("incoming")}>נכנסות {incomingCount > 0 && <span className="text-[10px] opacity-60">{incomingCount}</span>}</button>
          <button data-active={tab === "outgoing"} onClick={() => setTab("outgoing")}>יוצאות {outgoingCount > 0 && <span className="text-[10px] opacity-60">{outgoingCount}</span>}</button>
          <button data-active={tab === "future"} onClick={() => setTab("future")}>עתידי {futureCount > 0 && <span className="text-[10px] opacity-60">{futureCount}</span>}</button>
        </div>
      </div>
      <div className="divider-apple mx-4" />

      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 && (
          <div className="px-6 py-16 text-center">
            <ListChecks className="size-7 text-bingo-gray-300 mx-auto mb-2" />
            <div className="text-xs font-medium text-bingo-gray-500">
              אין משימות {tab === "incoming" ? "נכנסות" : tab === "outgoing" ? "יוצאות" : "עתידיות"}
            </div>
          </div>
        )}

        {filtered.map((t) => {
          const author = getUser(t.authorId);
          return (
            <Link
              key={t.id}
              href={`/leads/${t.leadId}`}
              className="group flex items-start gap-2.5 px-4 py-2.5 hover:bg-black/[0.02] transition"
            >
              <button
                className="size-4 rounded-full border border-black/15 hover:border-[var(--color-accent)] mt-0.5 shrink-0 transition"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
              />
              <div className="flex-1 min-w-0">
                <div className="text-[12px] font-medium text-[var(--color-tinted-text-primary)] truncate">{t.leadName}</div>
                <div className="text-[11px] text-[var(--color-tinted-text-secondary)] line-clamp-1 mt-0.5">{t.text}</div>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className={cn("inline-block size-1.5 rounded-full", t.urgent ? "bg-red-500" : "bg-emerald-500")} />
                  <span className="text-[10px] text-[var(--color-tinted-text-tertiary)] tabular-nums">{formatTime(t.dueAt)}</span>
                  <span className="text-[10px] text-[var(--color-tinted-text-tertiary)]">·</span>
                  <span className="text-[10px] text-[var(--color-tinted-text-tertiary)] truncate">{author?.name}</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
      <div className="divider-apple mx-4" />
      <div className="px-4 py-2.5 flex items-center justify-between">
        <span className="text-[11px] text-[var(--color-tinted-text-tertiary)]">{filtered.length} משימות</span>
        <Link href="/tasks" className="text-[11px] font-medium text-[var(--color-accent)] hover:underline">
          הצג הכל
        </Link>
      </div>
    </aside>
  );
}

function TabButton({ active, onClick, label, badge }: { active?: boolean; onClick?: () => void; label: string; badge?: number }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex-1 h-7 rounded-md text-[11px] font-bold inline-flex items-center justify-center gap-1.5 transition",
        active ? "bg-white text-bingo-black bingo-shadow-sm" : "text-bingo-gray-500 hover:text-bingo-black"
      )}
    >
      {label}
      {badge !== undefined && badge > 0 && (
        <span className={cn("text-[9px] font-mono tabular-nums rounded px-1", active ? "bg-bingo-green text-bingo-black" : "bg-bingo-gray-200 text-bingo-gray-600")}>
          {badge}
        </span>
      )}
    </button>
  );
}
