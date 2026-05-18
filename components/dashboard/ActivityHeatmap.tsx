import { getDailyActivity } from "@/lib/data/performance";
import type { Deal } from "@/lib/data/performance";
import { cn, formatDate } from "@/lib/utils";

export function ActivityHeatmap({ deals, dailyTarget }: { deals: Deal[]; dailyTarget: number }) {
  const days = getDailyActivity(deals, 35);
  // Group into weeks of 7
  const weeks: typeof days[] = [];
  for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7));

  const maxCount = Math.max(...days.map((d) => d.count));
  const totalDeals = days.reduce((s, d) => s + d.count, 0);
  const activeDays = days.filter((d) => d.count > 0).length;

  return (
    <div className="rounded-3xl bg-white border border-bingo-gray-200 bingo-shadow-sm p-5">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-base font-extrabold text-bingo-black">פעילות 35 ימים</h2>
          <p className="text-[11px] text-bingo-gray-500 mt-0.5">
            {totalDeals} עסקאות · {activeDays} ימים פעילים
          </p>
        </div>
        <div className="flex items-center gap-1 text-[10px]">
          <span className="text-bingo-gray-500">פחות</span>
          {[0, 1, 2, 3, 4].map((i) => (
            <span key={i} className={cn("size-3 rounded-sm", getColorClass(i, dailyTarget))} />
          ))}
          <span className="text-bingo-gray-500">יותר</span>
        </div>
      </div>

      <div className="flex flex-row-reverse gap-1.5 overflow-x-auto pb-2" dir="ltr">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-1">
            {week.map((day) => {
              const intensity = Math.min(4, Math.ceil((day.count / Math.max(1, dailyTarget)) * 2));
              return (
                <div
                  key={day.date}
                  className={cn(
                    "size-4 rounded-sm transition",
                    day.isWeekend ? "bg-bingo-gray-100 opacity-50" : getColorClass(intensity, dailyTarget)
                  )}
                  title={`${formatDate(day.date)}: ${day.count} עסקאות`}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

function getColorClass(intensity: number, _target: number): string {
  if (intensity === 0) return "bg-bingo-gray-100";
  if (intensity === 1) return "bg-bingo-green/30";
  if (intensity === 2) return "bg-bingo-green/55";
  if (intensity === 3) return "bg-bingo-green/80";
  return "bg-bingo-green-dark";
}
