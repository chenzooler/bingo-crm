import { TASKS } from "@/lib/data/leads";
import { getUser } from "@/lib/data/static";
import { Avatar } from "@/components/ui/Avatar";
import { formatDate, formatTime } from "@/lib/utils";
import Link from "next/link";

export default function TasksPage() {
  return (
    <div className="space-y-5 max-w-[1100px]">
      <div>
        <h1 className="text-3xl font-black text-bingo-black">משימות</h1>
        <p className="text-sm text-bingo-gray-500 mt-1">{TASKS.length} משימות · {TASKS.filter((t) => t.urgent).length} דחופות</p>
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
