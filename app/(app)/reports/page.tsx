import { LEADS } from "@/lib/data/leads";
import { PIPELINES, STATUSES, SOURCES } from "@/lib/data/static";
import { formatNumber } from "@/lib/utils";

export default function ReportsPage() {
  const total = PIPELINES.reduce((sum, p) => sum + p.count, 0);
  return (
    <div className="space-y-6 max-w-[1400px]">
      <div>
        <h1 className="text-3xl font-black text-bingo-black">תצוגת דוח</h1>
        <p className="text-sm text-bingo-gray-500 mt-1">
          סה"כ {formatNumber(total)} לידים במערכת · עדכון אחרון: עכשיו
        </p>
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
