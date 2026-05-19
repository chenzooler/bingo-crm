"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import * as React from "react";
import { Users, User, Search, X } from "lucide-react";
import { STAGES, CATEGORIES, SMART_VIEWS, COMMON_TAGS } from "@/lib/data/lifecycle";
import { AUGMENTED_LEADS } from "@/lib/data/lead-augment";
import { StatusGlyph as Glyph } from "@/components/icons/PipelineIcons";
import { formatNumber, cn } from "@/lib/utils";

export function Sidebar() {
  const params = useSearchParams();
  const activeView = params.get("view");
  const activeStage = params.get("stage");
  const activeCategory = params.get("category");

  const [scope, setScope] = React.useState<"me" | "all">("all");
  const [filter, setFilter] = React.useState("");

  const stageCounts = React.useMemo(() => {
    const counts: Record<string, number> = {};
    AUGMENTED_LEADS.forEach((l) => {
      const s = l.stage || "NEW";
      counts[s] = (counts[s] || 0) + 1;
    });
    return counts;
  }, []);

  const categoryCounts = React.useMemo(() => {
    const counts: Record<string, number> = {};
    AUGMENTED_LEADS.forEach((l) => {
      const c = l.category || "general";
      counts[c] = (counts[c] || 0) + 1;
    });
    return counts;
  }, []);

  const matches = (text: string) => !filter || text.toLowerCase().includes(filter.toLowerCase());

  return (
    <aside className="w-72 shrink-0 bg-bingo-cream border-l border-bingo-gray-150 h-[calc(100vh-3.5rem)] sticky top-14 overflow-hidden flex flex-col">
      <div className="px-3 pt-3 pb-2 border-b border-bingo-gray-150">
        <div className="flex items-center gap-1 mb-2 bg-white rounded-lg p-0.5 border border-bingo-gray-200">
          <ScopeBtn active={scope === "me"} onClick={() => setScope("me")} icon={<User className="size-3" />} label="שלי" />
          <ScopeBtn active={scope === "all"} onClick={() => setScope("all")} icon={<Users className="size-3" />} label="כל הצוות" />
        </div>
        <div className="relative">
          <Search className="absolute right-2.5 top-1/2 -translate-y-1/2 size-3.5 text-bingo-gray-400 pointer-events-none" />
          <input
            placeholder="חיפוש בתפריט..."
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

      <nav className="flex-1 overflow-y-auto py-2 space-y-3">
        {/* Smart Views */}
        <Group title="תצוגות חכמות">
          {SMART_VIEWS.filter((v) => matches(v.label)).map((v) => (
            <Link
              key={v.key}
              href={`/leads?view=${v.key}`}
              className={cn(
                "flex items-center justify-between gap-2 mx-1.5 px-2.5 py-1.5 rounded-lg text-[12px] transition",
                activeView === v.key
                  ? "bg-bingo-green/15 text-bingo-green-dark font-bold"
                  : "text-bingo-charcoal hover:bg-white"
              )}
            >
              <span className="flex items-center gap-2 min-w-0">
                <span className="size-5 inline-flex items-center justify-center text-bingo-gray-600">
                  <Glyph kind={v.icon} size={12} />
                </span>
                <span className="truncate">{v.label}</span>
              </span>
              <span className="text-[10px] font-mono tabular-nums font-bold text-bingo-gray-500 shrink-0">
                {formatNumber(v.count)}
              </span>
            </Link>
          ))}
        </Group>

        {/* By Stage */}
        <Group title="לפי שלב במשפך">
          {STAGES.filter((s) => s.key !== "EXIT" && matches(s.label)).map((s) => {
            const count = stageCounts[s.key] || 0;
            const isActive = activeStage === s.key;
            return (
              <Link
                key={s.key}
                href={`/leads?stage=${s.key}`}
                className={cn(
                  "flex items-center justify-between gap-2 mx-1.5 px-2.5 py-1.5 rounded-lg text-[12px] transition",
                  isActive
                    ? "bg-bingo-green/15 text-bingo-green-dark font-bold"
                    : "text-bingo-charcoal hover:bg-white"
                )}
              >
                <span className="flex items-center gap-2 min-w-0">
                  <span className="text-[10px] font-mono tabular-nums font-bold text-bingo-gray-400 w-4 text-center shrink-0">
                    {String(s.position).padStart(2, "0")}
                  </span>
                  <span className={cn("size-1.5 rounded-full shrink-0", stageDotColor(s.color))} />
                  <span className="truncate">{s.label}</span>
                </span>
                <span className="text-[10px] font-mono tabular-nums font-bold text-bingo-gray-500 shrink-0">
                  {formatNumber(count)}
                </span>
              </Link>
            );
          })}
          {matches("סגורים") && (
            <Link
              href={`/leads?stage=EXIT`}
              className={cn(
                "flex items-center justify-between gap-2 mx-1.5 px-2.5 py-1.5 rounded-lg text-[12px] transition mt-1.5 border-t border-bingo-gray-100 pt-2",
                activeStage === "EXIT"
                  ? "bg-bingo-green/15 text-bingo-green-dark font-bold"
                  : "text-bingo-gray-500 hover:bg-white"
              )}
            >
              <span className="flex items-center gap-2 min-w-0">
                <span className="size-1.5 rounded-full bg-bingo-gray-400 shrink-0" />
                <span className="truncate">סגורים (Exit)</span>
              </span>
              <span className="text-[10px] font-mono tabular-nums font-bold text-bingo-gray-400 shrink-0">
                {formatNumber(stageCounts.EXIT || 0)}
              </span>
            </Link>
          )}
        </Group>

        {/* By Category */}
        <Group title="לפי סוג הלוואה">
          {CATEGORIES.filter((c) => matches(c.label)).map((c) => {
            const count = categoryCounts[c.key] || 0;
            const isActive = activeCategory === c.key;
            return (
              <Link
                key={c.key}
                href={`/leads?category=${c.key}`}
                className={cn(
                  "flex items-center justify-between gap-2 mx-1.5 px-2.5 py-1.5 rounded-lg text-[12px] transition",
                  isActive
                    ? "bg-bingo-green/15 text-bingo-green-dark font-bold"
                    : "text-bingo-charcoal hover:bg-white"
                )}
              >
                <span className="flex items-center gap-2 min-w-0">
                  <span className="text-sm shrink-0">{c.emoji}</span>
                  <span className="truncate">{c.label}</span>
                </span>
                <span className="text-[10px] font-mono tabular-nums font-bold text-bingo-gray-500 shrink-0">
                  {formatNumber(count)}
                </span>
              </Link>
            );
          })}
        </Group>

        {/* Common Tags */}
        <Group title="תגיות">
          {COMMON_TAGS.filter((t) => matches(t.label)).slice(0, 8).map((t) => (
            <Link
              key={t.key}
              href={`/leads?tag=${t.key}`}
              className="flex items-center justify-between gap-2 mx-1.5 px-2.5 py-1.5 rounded-lg text-[12px] text-bingo-charcoal hover:bg-white transition"
            >
              <span className={cn(
                "text-[10px] font-bold rounded-full px-1.5 py-0.5",
                t.color === "red" ? "bg-status-red/15 text-status-red" :
                t.color === "orange" ? "bg-status-orange/15 text-orange-700" :
                t.color === "green" ? "bg-bingo-green/15 text-bingo-green-dark" :
                t.color === "blue" ? "bg-status-blue/12 text-status-blue" :
                t.color === "yellow" ? "bg-status-yellow/20 text-amber-700" :
                "bg-status-purple/15 text-status-purple"
              )}>{t.label}</span>
            </Link>
          ))}
        </Group>
      </nav>

      <div className="px-3 py-2 border-t border-bingo-gray-150 bg-white">
        <div className="text-[10px] text-bingo-gray-500 font-medium flex items-center justify-between">
          <span>סה"כ פעילים</span>
          <span className="font-mono font-bold tabular-nums text-bingo-charcoal">
            {formatNumber(Object.entries(stageCounts).filter(([k]) => k !== "EXIT").reduce((s, [, v]) => s + v, 0))}
          </span>
        </div>
      </div>
    </aside>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[9px] font-bold uppercase tracking-wider text-bingo-gray-400 px-3 mb-1">{title}</div>
      <div className="space-y-px">{children}</div>
    </div>
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

function stageDotColor(color: string): string {
  const map: Record<string, string> = {
    blue: "bg-status-blue",
    yellow: "bg-status-yellow",
    orange: "bg-status-orange",
    green: "bg-bingo-green",
    purple: "bg-status-purple",
    pink: "bg-status-pink",
    gray: "bg-bingo-gray-300",
  };
  return map[color] || "bg-bingo-gray-300";
}
