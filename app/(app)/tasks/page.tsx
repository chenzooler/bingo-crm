import { TASKS } from "@/lib/data/leads";
import { getUser } from "@/lib/data/static";
import { Avatar } from "@/components/ui/Avatar";
import { formatDate, formatTime } from "@/lib/utils";
import { Icon3D } from "@/components/ui/Icon3D";
import { ListChecks } from "lucide-react";
import Link from "next/link";

export default function TasksPage() {
  const urgent = TASKS.filter((t) => t.urgent).length;
  return (
    <div className="space-y-5 max-w-[1100px]">
      <div className="relative rounded-3xl bg-white border border-bingo-gray-200 p-5 overflow-hidden" style={{ boxShadow: "0 2px 4px -1px rgba(0,0,0,0.03), 0 8px 24px -6px rgba(46, 161, 13, 0.10)" }}>
        <div className="flex items-center gap-4">
          <Icon3D icon={<ListChecks className="size-6" />} tone="bingo" size={56} />
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-bingo-gray-500 mb-1">לוח משימות</div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-none flex items-center gap-2">
              <span className="text-bingo-black">משימות</span>
              <span className="text-[12px] font-black tabular-nums px-2 py-0.5 rounded-lg text-gradient-bingo bg-bingo-green/10 border border-bingo-green/25">{TASKS.length}</span>
              {urgent > 0 && <span className="text-[11px] font-bold text-white bg-gradient-to-r from-rose-500 to-red-600 rounded-md px-2 py-0.5 shadow-md shadow-red-500/30 animate-pulse">{urgent} דחופות</span>}
            </h1>
            <p className="text-[12px] text-bingo-gray-600 mt-1.5">{TASKS.length} משימות פתוחות · {urgent} דחופות לטיפול מיידי</p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-white border border-bingo-gray-200 bingo-shadow-sm divide-y divide-bingo-gray-100">
        {TASKS.map((t) => {
          const author = getUser(t.authorId);
          return (
            <Link
              key={t.id}
              href={`/leads/${t.leadId}`}
              className="flex items-center gap-4 px-5 py-4 hover:bg-bingo-gray-50 transition"
            >
              <Avatar size="md" name={author?.name || ""} emoji={author?.emoji} />
              <div className="flex-1 min-w-0">
                <div className="font-bold text-bingo-black">{t.leadName}</div>
                <div className="text-sm text-bingo-charcoal mt-0.5">{t.text}</div>
                <div className="text-xs text-bingo-gray-500 mt-1">
                  {formatDate(t.dueAt)} · {formatTime(t.dueAt)} · ע"י {author?.name}
                </div>
              </div>
              <div className="shrink-0">
                {t.urgent ? (
                  <span className="text-xs font-bold text-status-red bg-status-red/12 rounded-full px-2.5 py-1">דחוף</span>
                ) : (
                  <span className="text-xs font-bold text-bingo-green-dark bg-bingo-green/15 rounded-full px-2.5 py-1">פתוח</span>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
