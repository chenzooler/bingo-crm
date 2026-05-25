import { LEADS } from "@/lib/data/leads";
import { PIPELINES, STATUSES, SOURCES } from "@/lib/data/static";
import { formatNumber } from "@/lib/utils";
import { Icon3D } from "@/components/ui/Icon3D";
import { BarChart3 } from "lucide-react";

export default function ReportsPage() {
  const total = PIPELINES.reduce((sum, p) => sum + p.count, 0);
  return (
    <div className="space-y-6 max-w-[1400px]">
      <div className="relative rounded-3xl bg-white border border-bingo-gray-200 p-5 overflow-hidden" style={{ boxShadow: "0 2px 4px -1px rgba(0,0,0,0.03), 0 8px 24px -6px rgba(46, 161, 13, 0.10)" }}>
        <div className="flex items-center gap-4">
          <Icon3D icon={<BarChart3 className="size-6" />} tone="indigo" size={56} />
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-bingo-gray-500 mb-1">דוחות וניתוחים</div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-none flex items-center gap-2">
              <span className="text-bingo-black">תצוגת דוח</span>
              <span className="text-[12px] font-black tabular-nums px-2 py-0.5 rounded-lg text-gradient-bingo bg-bingo-green/10 border border-bingo-green/25">{formatNumber(total)}</span>
            </h1>
            <p className="text-[12px] text-bingo-gray-600 mt-1.5">סה"כ {formatNumber(total)} לידים במערכת · עדכון אחרון: עכשיו</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {PIPELINES.slice(0, 4).map((p) => (
          <div key={p.key} className="rounded-2xl bg-white border border-bingo-gray-200 bingo-shadow-sm p-5">
            <div className="text-3xl mb-2">{p.emoji}</div>
            <div className="text-3xl font-black text-bingo-black">{formatNumber(p.count)}</div>
            <div className="text-xs font-bold text-bingo-gray-500 mt-1">{p.label}</div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl bg-white border border-bingo-gray-200 bingo-shadow-sm p-5">
        <h2 className="text-base font-extrabold text-bingo-black mb-4">פילוח לפי תהליך</h2>
        <div className="space-y-3">
          {PIPELINES.map((p) => {
            const pct = (p.count / total) * 100;
            return (
              <div key={p.key}>
                <div className="flex items-center justify-between text-sm mb-1.5">
                  <span className="font-bold text-bingo-charcoal flex items-center gap-2">
                    <span>{p.emoji}</span> {p.label}
                  </span>
                  <span className="text-xs font-bold text-bingo-gray-700">
                    {formatNumber(p.count)} <span className="text-bingo-gray-400">({pct.toFixed(1)}%)</span>
                  </span>
                </div>
                <div className="h-2 bg-bingo-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-l from-bingo-green-dark to-bingo-green rounded-full"
                    style={{ width: `${Math.max(0.5, pct)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="rounded-2xl bg-white border border-bingo-gray-200 bingo-shadow-sm p-5">
        <h2 className="text-base font-extrabold text-bingo-black mb-4">מקורות לידים</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {SOURCES.map((s) => (
            <div
              key={s.key}
              className="rounded-2xl border-2 border-bingo-gray-100 p-4 text-center hover:border-bingo-green/40 transition"
            >
              <div className="size-10 rounded-full mx-auto mb-2" style={{ background: s.color }} />
              <div className="text-xs font-bold text-bingo-charcoal">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
