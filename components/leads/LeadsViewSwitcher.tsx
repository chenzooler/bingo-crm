"use client";
import * as React from "react";
import { LeadsTable } from "@/components/dashboard/LeadsTable";
import { KanbanBoard } from "@/components/leads/KanbanBoard";
import { SavedViewsBar } from "@/components/leads/SavedViewsBar";
import { MobileLeadList } from "@/components/leads/MobileLeadList";
import { LayoutGrid, Table2, Smartphone } from "lucide-react";
import { cn } from "@/lib/utils";

type ViewMode = "table" | "kanban";

interface LeadsViewSwitcherProps {
  pipeline?: string;
  status?: string;
}

export function LeadsViewSwitcher({ pipeline, status }: LeadsViewSwitcherProps) {
  const [view, setView] = React.useState<ViewMode>("table");
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    const stored = localStorage.getItem("bingo-leads-view") as ViewMode | null;
    if (stored === "table" || stored === "kanban") setView(stored);
    setMounted(true);
  }, []);

  const handleSetView = (v: ViewMode) => {
    setView(v);
    try {
      localStorage.setItem("bingo-leads-view", v);
    } catch {}
  };

  return (
    <div className="space-y-3">
      {/* Saved views bar */}
      <SavedViewsBar />

      {/* View toggle bar — hidden on mobile (auto card view) */}
      <div className="hidden md:flex items-center justify-between gap-3">
        <div className="flex items-center gap-0.5 bg-bingo-gray-100 rounded-xl p-0.5">
          <button
            onClick={() => handleSetView("table")}
            className={cn(
              "h-8 px-3 rounded-lg text-[12px] font-bold inline-flex items-center gap-1.5 transition",
              view === "table"
                ? "bg-white text-bingo-black bingo-shadow-sm"
                : "text-bingo-gray-500 hover:text-bingo-black",
            )}
          >
            <Table2 className="size-3.5" /> טבלה
          </button>
          <button
            onClick={() => handleSetView("kanban")}
            className={cn(
              "h-8 px-3 rounded-lg text-[12px] font-bold inline-flex items-center gap-1.5 transition",
              view === "kanban"
                ? "bg-white text-bingo-black bingo-shadow-sm"
                : "text-bingo-gray-500 hover:text-bingo-black",
            )}
          >
            <LayoutGrid className="size-3.5" /> Kanban
          </button>
        </div>
        <div className="text-[11px] text-bingo-gray-500">
          {view === "kanban" ? "תצוגת לוח לפי שלבי מחזור חיים" : "תצוגת טבלה מפורטת"}
        </div>
      </div>

      {/* View content */}
      {!mounted ? (
        <div className="h-96 bg-bingo-gray-50 rounded-2xl animate-pulse" />
      ) : (
        <>
          {/* Mobile — always card list */}
          <div className="md:hidden">
            <MobileLeadList pipeline={pipeline} status={status} />
          </div>
          {/* Desktop — table or kanban */}
          <div className="hidden md:block">
            {view === "table" ? (
              <LeadsTable pipeline={pipeline} status={status} />
            ) : (
              <KanbanBoard />
            )}
          </div>
        </>
      )}
    </div>
  );
}
