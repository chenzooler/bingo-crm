"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import * as React from "react";
import { ChevronDown, Users, User, Search, X } from "lucide-react";
import { PIPELINES, STATUSES, USERS } from "@/lib/data/static";
import { formatNumber, cn } from "@/lib/utils";

export function Sidebar() {
  const params = useSearchParams();
  const activePipeline = params.get("p") || "underwriting";
  const activeStatus = params.get("s") || "";

  const [openPipelines, setOpenPipelines] = React.useState<Set<string>>(new Set([activePipeline]));
  const [scope, setScope] = React.useState<"me" | "all">("all");
  const [filter, setFilter] = React.useState("");

  function togglePipeline(key: string) {
    setOpenPipelines((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  const visiblePipelines = PIPELINES.filter(
    (p) => !filter || p.label.includes(filter) || STATUSES.some((s) => s.pipeline === p.key && s.label.includes(filter))
  );

  return (
    <aside className="w-72 shrink-0 bg-bingo-cream border-l border-bingo-gray-150 h-[calc(100vh-3.5rem)] sticky top-14 overflow-hidden flex flex-col">
      <div className="px-3 pt-3 pb-2 border-b border-bingo-gray-150">
        <div className="flex items-center justify-between mb-2 px-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-bingo-gray-400">משתמשים ותהליכים</span>
        </div>
        <div className="flex items-center gap-1 mb-2 bg-white rounded-lg p-0.5 border border-bingo-gray-200">
          <ScopeBtn active={scope === "me"} onClick={() => setScope("me")} icon={<User className="size-3" />} label="רק אני" />
          <ScopeBtn active={scope === "all"} onClick={() => setScope("all")} icon={<Users className="size-3" />} label="כל המשתמשים" />
        </div>
        <select
          className="w-full h-8 rounded-lg border border-bingo-gray-200 text-xs font-bold px-2 bg-white focus:border-bingo-green focus:outline-none focus:ring-2 focus:ring-bingo-green/15"
          defaultValue=""
        >
          <option value="">— כל המשתמשים —</option>
          {USERS.map((u) => (
            <option key={u.id} value={u.id}>{u.emoji ? `${u.emoji} ` : ""}{u.name}</option>
          ))}
        </select>
        <div className="relative mt-2">
          <Search className="absolute right-2.5 top-1/2 -translate-y-1/2 size-3.5 text-bingo-gray-400 pointer-events-none" />
          <input
            placeholder="חיפוש בתהליכים..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full h-8 rounded-lg border border-bingo-gray-200 text-xs font-medium pr-8 pl-2 bg-white placeholder:text-bingo-gray-400 focus:border-bingo-green focus:outline-none focus:ring-2 focus:ring-bingo-green/15"
          />
          {filter && (
            <button onClick={() => setFilter("")} className="absolute left-2 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-bingo-gray-100">
              <X className="size-3 text-bingo-gray-500" />
            </button>
          )}
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-2">
        {visiblePipelines.map((p) => {
          const isOpen = openPipelines.has(p.key);
          const isActive = activePipeline === p.key;
          const subStatuses = STATUSES.filter((s) => s.pipeline === p.key);
          const filteredSubs = filter ? subStatuses.filter((s) => s.label.includes(filter)) : subStatuses;
          return (
            <div key={p.key} className="mb-0.5">
              <button
                onClick={() => togglePipeline(p.key)}
                className={cn(
                  "w-full flex items-center justify-between gap-2 pl-2 pr-2.5 py-2 text-[13px] font-bold rounded-lg mx-1.5 transition",
                  isActive
                    ? "bg-white text-bingo-black bingo-shadow-sm"
                    : "text-bingo-charcoal hover:bg-white/60"
                )}
              >
                <span className="flex items-center gap-2 min-w-0">
                  <ChevronDown
                    className={cn("size-3.5 shrink-0 text-bingo-gray-400 transition-transform", !isOpen && "-rotate-90")}
                  />
                  <span className="text-base shrink-0">{p.emoji}</span>
                  <span className="truncate">{p.label}</span>
                </span>
                <span className={cn(
                  "text-[10px] font-mono font-bold tabular-nums shrink-0 rounded-md px-1.5 py-0.5 border",
                  isActive
                    ? "bg-bingo-green text-bingo-black border-bingo-green"
                    : "bg-bingo-gray-100 text-bingo-gray-600 border-transparent"
                )}>
                  {formatNumber(p.count)}
                </span>
              </button>
              {isOpen && filteredSubs.length > 0 && (
                <div className="ml-3 mr-5 mt-0.5 mb-1 space-y-px">
                  {filteredSubs.map((s) => (
                    <Link
                      key={s.key}
                      href={`/leads?p=${p.key}&s=${s.key}`}
                      className={cn(
                        "flex items-center justify-between gap-2 px-2.5 py-1.5 text-[12px] rounded-md transition group",
                        activeStatus === s.key
                          ? "bg-bingo-green/15 text-bingo-green-dark font-bold"
                          : "text-bingo-gray-600 hover:bg-white hover:text-bingo-black"
                      )}
                    >
                      <span className="flex items-center gap-1.5 truncate">
                        <span className="text-[13px] leading-none">{s.emoji}</span>
                        <span className="truncate">{s.label}</span>
                      </span>
                      <span className={cn(
                        "text-[10px] font-mono tabular-nums font-bold shrink-0",
                        activeStatus === s.key ? "text-bingo-green-dark" : "text-bingo-gray-400 group-hover:text-bingo-gray-600"
                      )}>
                        {formatNumber(s.count)}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
        {visiblePipelines.length === 0 && (
          <div className="px-6 py-12 text-center">
            <Search className="size-6 text-bingo-gray-300 mx-auto mb-2" />
            <div className="text-xs font-medium text-bingo-gray-500">אין תוצאות</div>
          </div>
        )}
      </nav>

      <div className="px-3 py-2 border-t border-bingo-gray-150 bg-white">
        <div className="text-[10px] text-bingo-gray-500 font-medium flex items-center justify-between">
          <span>סה"כ במערכת</span>
          <span className="font-mono font-bold tabular-nums text-bingo-charcoal">
            {formatNumber(PIPELINES.reduce((s, p) => s + p.count, 0))}
          </span>
        </div>
      </div>
    </aside>
  );
}

function ScopeBtn({ active, onClick, icon, label }: { active?: boolean; onClick?: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex-1 h-7 rounded-md inline-flex items-center justify-center gap-1.5 text-[11px] font-bold transition",
        active ? "bg-bingo-green text-bingo-black bingo-shadow-sm" : "text-bingo-gray-500 hover:text-bingo-charcoal"
      )}
    >
      {icon}
      {label}
    </button>
  );
}
