"use client";
import * as React from "react";
import { Star, Plus, Share2, MoreHorizontal, Filter } from "lucide-react";
import { type SavedView, STARTER_VIEWS, loadSavedViews, saveSavedViews } from "@/lib/data/saved-views";
import { cn } from "@/lib/utils";

const COLOR_MAP: Record<string, string> = {
  red: "border-status-red/40 bg-status-red/8 text-status-red",
  blue: "border-status-blue/40 bg-status-blue/8 text-status-blue",
  green: "border-bingo-green/50 bg-bingo-green/12 text-bingo-green-dark",
  orange: "border-status-orange/40 bg-status-orange/8 text-orange-700",
  yellow: "border-status-yellow/50 bg-status-yellow/15 text-amber-700",
  purple: "border-status-purple/40 bg-status-purple/8 text-status-purple",
};

export function SavedViewsBar() {
  const [views, setViews] = React.useState<SavedView[]>(STARTER_VIEWS);
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setViews(loadSavedViews());
    setActiveId(localStorage.getItem("bingo-active-view"));
    setMounted(true);
  }, []);

  function selectView(id: string | null) {
    setActiveId(id);
    try {
      if (id) localStorage.setItem("bingo-active-view", id);
      else localStorage.removeItem("bingo-active-view");
    } catch {}
  }

  function togglePin(id: string) {
    const next = views.map((v) => (v.id === id ? { ...v, pinned: !v.pinned } : v));
    setViews(next);
    saveSavedViews(next);
  }

  if (!mounted) return <div className="h-10" />;

  const pinned = views.filter((v) => v.pinned);
  const others = views.filter((v) => !v.pinned);

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 -mb-1">
      <button
        onClick={() => selectView(null)}
        className={cn(
          "h-9 px-3 rounded-xl text-[12px] font-bold inline-flex items-center gap-1.5 transition shrink-0 border",
          !activeId
            ? "bg-bingo-black text-white border-bingo-black"
            : "bg-white text-bingo-charcoal border-bingo-gray-200 hover:border-bingo-gray-300"
        )}
      >
        <Filter className="size-3.5" /> הכל
      </button>

      {pinned.map((v) => (
        <ViewChip
          key={v.id}
          view={v}
          active={activeId === v.id}
          onClick={() => selectView(v.id)}
          onTogglePin={() => togglePin(v.id)}
        />
      ))}

      {others.length > 0 && <div className="w-px h-6 bg-bingo-gray-200 mx-1 shrink-0" />}

      {others.map((v) => (
        <ViewChip
          key={v.id}
          view={v}
          active={activeId === v.id}
          onClick={() => selectView(v.id)}
          onTogglePin={() => togglePin(v.id)}
        />
      ))}

      <button className="h-9 px-3 rounded-xl text-[12px] font-bold inline-flex items-center gap-1.5 shrink-0 border border-dashed border-bingo-gray-300 text-bingo-gray-600 hover:border-bingo-green hover:text-bingo-green-dark transition">
        <Plus className="size-3.5" /> תצוגה חדשה
      </button>
    </div>
  );
}

function ViewChip({
  view,
  active,
  onClick,
  onTogglePin,
}: {
  view: SavedView;
  active: boolean;
  onClick: () => void;
  onTogglePin: () => void;
}) {
  const colorClass = COLOR_MAP[view.color] || COLOR_MAP.blue;
  return (
    <div
      className={cn(
        "group h-9 rounded-xl border inline-flex items-center gap-1 transition shrink-0 overflow-hidden",
        active
          ? cn("bingo-shadow-sm", colorClass)
          : "bg-white border-bingo-gray-200 text-bingo-charcoal hover:border-bingo-gray-300"
      )}
    >
      <button onClick={onClick} className="pl-3 pr-2 h-full inline-flex items-center gap-1.5 text-[12px] font-bold">
        <span className="text-sm leading-none">{view.emoji}</span>
        <span className="whitespace-nowrap">{view.name}</span>
        {view.shared && <Share2 className="size-3 opacity-60" />}
      </button>
      <button
        onClick={onTogglePin}
        title={view.pinned ? "הסר מהמועדפים" : "הוסף למועדפים"}
        className={cn(
          "size-6 rounded-md inline-flex items-center justify-center ml-1 mr-0.5 transition",
          view.pinned ? "text-status-yellow" : "text-bingo-gray-400 hover:text-bingo-charcoal opacity-0 group-hover:opacity-100"
        )}
      >
        <Star className={cn("size-3", view.pinned && "fill-status-yellow")} />
      </button>
    </div>
  );
}
