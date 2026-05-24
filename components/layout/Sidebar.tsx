"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import * as React from "react";
import { Users, User, Search, X, ChevronDown, Star, Pin } from "lucide-react";
import { STAGES, CATEGORIES, SMART_VIEWS, COMMON_TAGS } from "@/lib/data/lifecycle";
import { AUGMENTED_LEADS } from "@/lib/data/lead-augment";
import { StatusGlyph as Glyph } from "@/components/icons/PipelineIcons";
import { formatNumber, cn } from "@/lib/utils";

type GroupKey = "smart" | "stages" | "categories" | "tags";

const STORAGE_KEY_OPEN = "bingo-sidebar-open";
const STORAGE_KEY_PINS = "bingo-sidebar-pins";

interface PinnedItem { id: string; type: GroupKey; label: string; emoji?: string }

export function Sidebar() {
  const params = useSearchParams();
  const activeView = params.get("view");
  const activeStage = params.get("stage");
  const activeCategory = params.get("category");
  const activeTag = params.get("tag");

  const [scope, setScope] = React.useState<"me" | "all">("all");
  const [filter, setFilter] = React.useState("");

  // Group open/closed state — persisted
  const [openGroups, setOpenGroups] = React.useState<Record<GroupKey, boolean>>({
    smart: true,
    stages: true,
    categories: false,
    tags: false,
  });
  // Pinned favorites — persisted
  const [pins, setPins] = React.useState<PinnedItem[]>([]);

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_OPEN);
      if (raw) setOpenGroups(JSON.parse(raw));
      const rawPins = localStorage.getItem(STORAGE_KEY_PINS);
      if (rawPins) setPins(JSON.parse(rawPins));
    } catch {}
  }, []);

  function toggleGroup(k: GroupKey) {
    setOpenGroups((prev) => {
      const next = { ...prev, [k]: !prev[k] };
      try { localStorage.setItem(STORAGE_KEY_OPEN, JSON.stringify(next)); } catch {}
      return next;
    });
  }

  function togglePin(item: PinnedItem) {
    setPins((prev) => {
      const exists = prev.find((p) => p.id === item.id && p.type === item.type);
      const next = exists
        ? prev.filter((p) => !(p.id === item.id && p.type === item.type))
        : [...prev, item];
      try { localStorage.setItem(STORAGE_KEY_PINS, JSON.stringify(next)); } catch {}
      return next;
    });
  }
  const isPinned = (type: GroupKey, id: string) => pins.some((p) => p.type === type && p.id === id);

  const stageCounts = React.useMemo(() => {
    const counts: Record<string, number> = {};
    AUGMENTED_LEADS.forEach((l) => { const s = l.stage || "NEW"; counts[s] = (counts[s] || 0) + 1; });
    return counts;
  }, []);

  const categoryCounts = React.useMemo(() => {
    const counts: Record<string, number> = {};
    AUGMENTED_LEADS.forEach((l) => { const c = l.category || "general"; counts[c] = (counts[c] || 0) + 1; });
    return counts;
  }, []);

  const matches = (text: string) => !filter || text.toLowerCase().includes(filter.toLowerCase());

  // When searching — auto open all
  const isSearching = filter.trim().length > 0;
  const groupOpen = (k: GroupKey) => isSearching || openGroups[k];

  // Helpers to render link rows
  const renderViewLink = (v: typeof SMART_VIEWS[number]) => (
    <SidebarRow
      key={`smart-${v.key}`}
      href={`/leads?view=${v.key}`}
      active={activeView === v.key}
      pinned={isPinned("smart", v.key)}
      onTogglePin={() => togglePin({ id: v.key, type: "smart", label: v.label })}
      left={
        <>
          <span className="size-5 inline-flex items-center justify-center text-bingo-gray-600">
            <Glyph kind={v.icon} size={12} />
          </span>
          <span className="truncate">{v.label}</span>
        </>
      }
      count={v.count}
    />
  );

  const renderStageLink = (s: typeof STAGES[number]) => {
    const count = stageCounts[s.key] || 0;
    return (
      <SidebarRow
        key={`stage-${s.key}`}
        href={`/leads?stage=${s.key}`}
        active={activeStage === s.key}
        pinned={isPinned("stages", s.key)}
        onTogglePin={() => togglePin({ id: s.key, type: "stages", label: s.label })}
        left={
          <>
            <span className="text-[10px] font-mono tabular-nums font-bold text-bingo-gray-400 w-4 text-center shrink-0">
              {String(s.position).padStart(2, "0")}
            </span>
            <span className={cn("size-1.5 rounded-full shrink-0", stageDotColor(s.color))} />
            <span className="truncate">{s.label}</span>
          </>
        }
        count={count}
      />
    );
  };

  const renderCategoryLink = (c: typeof CATEGORIES[number]) => {
    const count = categoryCounts[c.key] || 0;
    return (
      <SidebarRow
        key={`cat-${c.key}`}
        href={`/leads?category=${c.key}`}
        active={activeCategory === c.key}
        pinned={isPinned("categories", c.key)}
        onTogglePin={() => togglePin({ id: c.key, type: "categories", label: c.label, emoji: c.emoji })}
        left={
          <>
            <span className="text-sm shrink-0">{c.emoji}</span>
            <span className="truncate">{c.label}</span>
          </>
        }
        count={count}
      />
    );
  };

  const renderTagLink = (t: typeof COMMON_TAGS[number]) => (
    <SidebarRow
      key={`tag-${t.key}`}
      href={`/leads?tag=${t.key}`}
      active={activeTag === t.key}
      pinned={isPinned("tags", t.key)}
      onTogglePin={() => togglePin({ id: t.key, type: "tags", label: t.label })}
      left={
        <span className={cn(
          "text-[10px] font-bold rounded-full px-1.5 py-0.5",
          t.color === "red" ? "bg-status-red/15 text-status-red" :
          t.color === "orange" ? "bg-status-orange/15 text-orange-700" :
          t.color === "green" ? "bg-bingo-green/15 text-bingo-green-dark" :
          t.color === "blue" ? "bg-status-blue/12 text-status-blue" :
          t.color === "yellow" ? "bg-status-yellow/20 text-amber-700" :
          "bg-status-purple/15 text-status-purple"
        )}>{t.label}</span>
      }
    />
  );

  // Build pinned list with active state
  const pinnedRows = pins.map((p) => {
    if (p.type === "smart") {
      const v = SMART_VIEWS.find((x) => x.key === p.id);
      return v && matches(v.label) ? renderViewLink(v) : null;
    }
    if (p.type === "stages") {
      const s = STAGES.find((x) => x.key === p.id);
      return s && matches(s.label) ? renderStageLink(s) : null;
    }
    if (p.type === "categories") {
      const c = CATEGORIES.find((x) => x.key === p.id);
      return c && matches(c.label) ? renderCategoryLink(c) : null;
    }
    if (p.type === "tags") {
      const t = COMMON_TAGS.find((x) => x.key === p.id);
      return t && matches(t.label) ? renderTagLink(t) : null;
    }
    return null;
  }).filter(Boolean);

  return (
    <aside className="hidden md:flex w-72 shrink-0 bg-bingo-cream border-l border-bingo-gray-150 h-[calc(100vh-3.5rem)] sticky top-14 overflow-hidden flex-col">
      <div className="px-3 pt-3 pb-2 border-b border-bingo-gray-150">
        <div className="flex items-center gap-1 mb-2 bg-white rounded-lg p-0.5 border border-bingo-gray-200">
          <ScopeBtn active={scope === "me"} onClick={() => setScope("me")} icon={<User className="size-3" />} label="שלי" />
          <ScopeBtn active={scope === "all"} onClick={() => setScope("all")} icon={<Users className="size-3" />} label="כל הצוות" />
        </div>
        <div className="relative">
          <Search className="absolute right-2.5 top-1/2 -translate-y-1/2 size-3.5 text-bingo-gray-400 pointer-events-none" />
          <input
            placeholder="חיפוש תהליכים, תגיות..."
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

      <nav className="flex-1 overflow-y-auto py-2 space-y-1.5">
        {/* Pinned favorites — always visible at top */}
        {pinnedRows.length > 0 && (
          <CollapsibleGroup
            id="pinned"
            title="מועדפים"
            icon={<Star className="size-3 fill-status-yellow text-status-yellow" />}
            count={pinnedRows.length}
            open={true}
            highlight
          >
            {pinnedRows}
          </CollapsibleGroup>
        )}

        {/* Smart Views */}
        <CollapsibleGroup
          id="smart"
          title="תצוגות חכמות"
          open={groupOpen("smart")}
          onToggle={() => toggleGroup("smart")}
          count={SMART_VIEWS.length}
        >
          {SMART_VIEWS.filter((v) => matches(v.label)).map(renderViewLink)}
        </CollapsibleGroup>

        {/* By Stage */}
        <CollapsibleGroup
          id="stages"
          title="לפי שלב במשפך"
          open={groupOpen("stages")}
          onToggle={() => toggleGroup("stages")}
          count={STAGES.filter((s) => s.key !== "EXIT").length}
        >
          {STAGES.filter((s) => s.key !== "EXIT" && matches(s.label)).map(renderStageLink)}
          {matches("סגורים") && (
            <div className="border-t border-bingo-gray-100 mx-1.5 my-1" />
          )}
          {matches("סגורים") && (
            <SidebarRow
              href={`/leads?stage=EXIT`}
              active={activeStage === "EXIT"}
              left={
                <>
                  <span className="size-1.5 rounded-full bg-bingo-gray-400 shrink-0" />
                  <span className="truncate text-bingo-gray-500">סגורים (Exit)</span>
                </>
              }
              count={stageCounts.EXIT || 0}
            />
          )}
        </CollapsibleGroup>

        {/* By Category */}
        <CollapsibleGroup
          id="categories"
          title="לפי סוג הלוואה"
          open={groupOpen("categories")}
          onToggle={() => toggleGroup("categories")}
          count={CATEGORIES.length}
        >
          {CATEGORIES.filter((c) => matches(c.label)).map(renderCategoryLink)}
        </CollapsibleGroup>

        {/* Common Tags */}
        <CollapsibleGroup
          id="tags"
          title="תגיות נפוצות"
          open={groupOpen("tags")}
          onToggle={() => toggleGroup("tags")}
          count={COMMON_TAGS.length}
        >
          {COMMON_TAGS.filter((t) => matches(t.label)).map(renderTagLink)}
        </CollapsibleGroup>
      </nav>

      <div className="px-3 py-2 border-t border-bingo-gray-150 bg-white">
        <div className="text-[10px] text-bingo-gray-500 font-medium flex items-center justify-between">
          <span className="inline-flex items-center gap-1">
            <Pin className="size-3 opacity-60" />
            לחץ כדי להצמיד למועדפים
          </span>
          <span className="font-mono font-bold tabular-nums text-bingo-charcoal">
            {formatNumber(Object.entries(stageCounts).filter(([k]) => k !== "EXIT").reduce((s, [, v]) => s + v, 0))}
          </span>
        </div>
      </div>
    </aside>
  );
}

function CollapsibleGroup({
  id, title, icon, count, open, onToggle, highlight, children,
}: {
  id: string; title: string; icon?: React.ReactNode; count?: number;
  open: boolean; onToggle?: () => void; highlight?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={cn(highlight && "bg-status-yellow/8 border-y border-status-yellow/20 py-1.5")}>
      <button
        onClick={onToggle}
        disabled={!onToggle}
        className={cn(
          "w-full flex items-center justify-between gap-1 px-3 py-1 group",
          onToggle && "hover:bg-white rounded-md"
        )}
      >
        <span className="text-[9px] font-bold uppercase tracking-wider text-bingo-gray-500 inline-flex items-center gap-1.5">
          {icon}
          {title}
          {count !== undefined && (
            <span className="font-mono tabular-nums text-bingo-gray-400 normal-case font-bold">
              ({count})
            </span>
          )}
        </span>
        {onToggle && (
          <ChevronDown className={cn("size-3 text-bingo-gray-400 transition-transform", open && "rotate-180")} />
        )}
      </button>
      {open && <div className="space-y-px mt-0.5">{children}</div>}
    </div>
  );
}

function SidebarRow({
  href, active, pinned, onTogglePin, left, count,
}: {
  href: string; active?: boolean; pinned?: boolean;
  onTogglePin?: () => void; left: React.ReactNode; count?: number;
}) {
  return (
    <div className="relative group/row">
      <Link
        href={href}
        className={cn(
          "flex items-center justify-between gap-2 mx-1.5 px-2.5 py-1.5 rounded-lg text-[12px] transition",
          active
            ? "bg-bingo-green/15 text-bingo-green-dark font-bold"
            : "text-bingo-charcoal hover:bg-white"
        )}
      >
        <span className="flex items-center gap-2 min-w-0">{left}</span>
        {count !== undefined && (
          <span className="text-[10px] font-mono tabular-nums font-bold text-bingo-gray-500 shrink-0 group-hover/row:opacity-0 transition-opacity">
            {formatNumber(count)}
          </span>
        )}
      </Link>
      {onTogglePin && (
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onTogglePin(); }}
          className={cn(
            "absolute left-2.5 top-1/2 -translate-y-1/2 size-5 rounded-md inline-flex items-center justify-center transition",
            pinned
              ? "text-status-yellow opacity-100"
              : "text-bingo-gray-400 opacity-0 group-hover/row:opacity-100 hover:bg-bingo-gray-100"
          )}
          title={pinned ? "הסר מהמועדפים" : "הצמד למועדפים"}
        >
          <Star className={cn("size-3", pinned && "fill-status-yellow")} />
        </button>
      )}
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
