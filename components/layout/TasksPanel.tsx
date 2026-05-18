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
    <aside className="w-80 shrink-0 bg-white border-r border-bingo-gray-150 h-[calc(100vh-3.5rem)] sticky top-14 overflow-hidden flex flex-col">
      <div className="px-4 pt-3.5 pb-3 border-b border-bingo-gray-150">
        <div className="flex items-center justify-between mb-2.5">
          <h2 className="text-sm font-extrabold text-bingo-black inline-flex items-center gap-1.5">
            <ListChecks className="size-4" />
            משימות
            {urgentCount > 0 && (
              <span className="text-[10px] font-mono tabular-nums font-bold bg-status-red text-white rounded-full px-1.5 py-0.5 animate-pulse-green">
                {urgentCount}
              </span>
            )}
          </h2>
          <div className="flex items-center gap-1">
            <button className="size-7 rounded-lg bg-bingo-green hover:bg-bingo-green-bright text-bingo-black inline-flex items-center justify-center transition" title="הוסף משימה">
              <Plus className="size-3.5" strokeWidth={3} />
            </button>
            <button className="size-7 rounded-lg bg-status-orange hover:bg-orange-500 text-white inline-flex items-center justify-center transition" title="משימה מתפרצת">
              <AlarmClock className="size-3.5" />
            </button>
          </div>
        </div>
        <div className="flex items-center gap-1 bg-bingo-gray-100 rounded-lg p-0.5">
          <TabButton active={tab === "incoming"} onClick={() => setTab("incoming")} label="נכנסות" badge={incomingCount} />
          <TabButton active={tab === "outgoing"} onClick={() => setTab("outgoing")} label="יוצאות" badge={outgoingCount} />
          <TabButton active={tab === "future"} onClick={() => setTab("future")} label="עתידי" badge={futureCount} />
        </div>
      </div>

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
              className="group block px-4 py-2.5 hover:bg-bingo-cream/70 transition border-b border-bingo-gray-100 relative"
            >
              <div
                className={cn(
                  "absolute right-0 top-0 bottom-0 w-1",
                  t.urgent ? "bg-status-red" : "bg-bingo-green"
                )}
              />
              <div className="flex items-start gap-2.5">
                <Avatar size="sm" name={author?.name || ""} emoji={author?.emoji} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 text-[11px] mb-0.5">
                    <span className={cn("font-mono tabular-nums font-bold", t.urgent ? "text-status-red" : "text-bingo-green-dark")}>
                      {formatTime(t.dueAt)}
                    </span>
                    <span className="text-bingo-gray-400">·</span>
                    <span className="font-bold text-bingo-charcoal truncate">{author?.name}</span>
                  </div>
                  <div className="text-[12px] font-bold text-bingo-black truncate group-hover:text-bingo-green-dark">{t.leadName}</div>
                  <div className="text-[12px] text-bingo-gray-700 leading-snug mt-0.5 line-clamp-2">{t.text}</div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
      <div className="px-4 py-2.5 border-t border-bingo-gray-150 flex items-center justify-between text-[11px] text-bingo-gray-500">
        <span>{filtered.length} משימות</span>
        <Link href="/tasks" className="font-bold text-bingo-green-dark hover:underline">
          הצג הכל ←
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
