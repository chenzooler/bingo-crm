"use client";
/**
 * שורת כפתורי הפעולה של המסך הראשי — שכפול Main.aspx של Yoatsim:
 * משימות באיחור (אדום) · נצפו לאחרונה (כתום) · ליד חדש בטיפולי (ירוק) · תצוגת דוח (כחול).
 */
import * as React from "react";
import Link from "next/link";
import { AlarmClock, History, Sparkles, BarChart3, X, Loader2 } from "lucide-react";
import { cn, formatDate, formatTime, relativeTime } from "@/lib/utils";

interface TaskDTO {
  id: number;
  text: string;
  urgent: boolean;
  dueAt: string | null;
  lead: { id: number; fullName: string } | null;
  fromUser: { id: number; name: string; emoji: string | null } | null;
  toUser: { id: number; name: string; emoji: string | null } | null;
}

interface RecentItem {
  id: number;
  name: string;
  at: string;
}

export const RECENTLY_VIEWED_KEY = "bingo-recently-viewed";

export function ActionButtons({ overdueCount, newLeadsCount }: {
  overdueCount: number;
  newLeadsCount: number;
}) {
  const [open, setOpen] = React.useState<null | "overdue" | "recent">(null);
  const [overdue, setOverdue] = React.useState<TaskDTO[] | null>(null);
  const [recent, setRecent] = React.useState<RecentItem[]>([]);

  const toggleOverdue = () => {
    setOpen((o) => (o === "overdue" ? null : "overdue"));
    if (overdue === null) {
      fetch("/api/tasks?filter=overdue")
        .then((r) => (r.ok ? r.json() : []))
        .then(setOverdue)
        .catch(() => setOverdue([]));
    }
  };

  const toggleRecent = () => {
    try {
      const raw = localStorage.getItem(RECENTLY_VIEWED_KEY);
      setRecent(raw ? (JSON.parse(raw) as RecentItem[]) : []);
    } catch {
      setRecent([]);
    }
    setOpen((o) => (o === "recent" ? null : "recent"));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={toggleOverdue}
          className={cn(
            "b-pill b-pill-sm bg-status-red text-white shadow-[0_4px_14px_-4px_rgba(229,72,77,0.5)] hover:brightness-110",
            open === "overdue" && "ring-2 ring-status-red ring-offset-2",
          )}
        >
          <AlarmClock className="size-4" />
          משימות באיחור <span className="tabular-nums font-bold">({overdueCount})</span>
        </button>

        <button
          onClick={toggleRecent}
          className={cn(
            "b-pill b-pill-sm bg-status-orange text-white shadow-[0_4px_14px_-4px_rgba(240,140,46,0.5)] hover:brightness-105",
            open === "recent" && "ring-2 ring-status-orange ring-offset-2",
          )}
        >
          <History className="size-4" />
          נצפו לאחרונה
        </button>

        <Link href="/leads?stage=NEW" className="b-pill b-pill-sm b-pill-green">
          <Sparkles className="size-4" />
          ליד חדש בטיפולי <span className="tabular-nums font-bold">({newLeadsCount})</span>
        </Link>

        <Link href="/reports" className="b-pill b-pill-sm bg-bingo-blue text-white shadow-[0_4px_14px_-4px_rgba(31,129,214,0.5)] hover:brightness-110">
          <BarChart3 className="size-4" />
          תצוגת דוח
        </Link>
      </div>

      {/* ===== פאנל משימות באיחור ===== */}
      {open === "overdue" && (
        <div className="b-card p-4 animate-fade-in">
          <PanelHeader title="משימות באיחור" tone="red" onClose={() => setOpen(null)} />
          {overdue === null ? (
            <div className="py-6 text-center text-bingo-gray-400 text-[13px]">
              <Loader2 className="size-4 animate-spin inline-block ml-1.5" /> טוען משימות…
            </div>
          ) : overdue.length === 0 ? (
            <div className="py-6 text-center text-[13px] text-bingo-gray-500">אין משימות באיחור 🎉</div>
          ) : (
            <div className="divide-y divide-bingo-gray-100 max-h-80 overflow-y-auto">
              {overdue.map((t) => (
                <div key={t.id} className="flex items-center gap-2.5 py-2.5 text-[12.5px]">
                  <span className="tabular-nums font-bold text-status-red shrink-0">
                    {t.dueAt ? formatDate(t.dueAt) : "—"}
                  </span>
                  {t.dueAt && (
                    <span className="tabular-nums text-bingo-gray-400 shrink-0">{formatTime(t.dueAt)}</span>
                  )}
                  <span className="text-bingo-gray-500 shrink-0">
                    {t.fromUser?.name ?? "מערכת"} ← {t.toUser?.name ?? "—"}
                  </span>
                  {t.lead && (
                    <Link
                      href={`/leads/${t.lead.id}`}
                      className="font-semibold text-bingo-blue hover:underline shrink-0"
                    >
                      ({t.lead.fullName})
                    </Link>
                  )}
                  <span className="flex-1 min-w-0 truncate text-bingo-black font-medium">{t.text}</span>
                  {t.urgent && <span className="b-chip b-chip-red text-[10px] shrink-0">מתפרצת</span>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ===== פאנל נצפו לאחרונה ===== */}
      {open === "recent" && (
        <div className="b-card p-4 animate-fade-in">
          <PanelHeader title="נצפו לאחרונה" tone="orange" onClose={() => setOpen(null)} />
          {recent.length === 0 ? (
            <div className="py-6 text-center text-[13px] text-bingo-gray-500">עוד לא נצפו לידים</div>
          ) : (
            <div className="divide-y divide-bingo-gray-100 max-h-80 overflow-y-auto">
              {recent.map((r) => (
                <Link
                  key={r.id}
                  href={`/leads/${r.id}`}
                  className="flex items-center gap-2.5 py-2.5 text-[13px] hover:bg-bingo-gray-50 rounded-lg px-1.5 -mx-1.5 transition"
                >
                  <span className="font-semibold text-bingo-black flex-1 min-w-0 truncate">{r.name}</span>
                  <span className="text-[11.5px] text-bingo-gray-400">{relativeTime(r.at)}</span>
                  <span className="text-[11.5px] tabular-nums text-bingo-gray-300">#{r.id}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function PanelHeader({ title, tone, onClose }: { title: string; tone: "red" | "orange"; onClose: () => void }) {
  return (
    <div className="flex items-center justify-between mb-2">
      <h3 className="text-[13.5px] font-bold text-bingo-black flex items-center gap-2">
        <span className={cn("size-2 rounded-full", tone === "red" ? "bg-status-red" : "bg-status-orange")} />
        {title}
      </h3>
      <button
        onClick={onClose}
        className="size-7 rounded-full bg-bingo-gray-100 hover:bg-bingo-gray-150 flex items-center justify-center text-bingo-gray-500"
        aria-label="סגירה"
      >
        <X className="size-3.5" />
      </button>
    </div>
  );
}
