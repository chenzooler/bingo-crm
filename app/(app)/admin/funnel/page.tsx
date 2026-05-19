import { PIPELINES, STATUSES } from "@/lib/data/static";
import { PipelineGlyph } from "@/components/icons/PipelineIcons";
import { formatNumber } from "@/lib/utils";
import { TrendingUp } from "lucide-react";

export default function FunnelPage() {
  // Build funnel from primary pipelines
  const funnelStages = [
    { label: "ליד נכנס", count: 8400, color: "bg-status-blue" },
    { label: "סינון ראשוני", count: 5200, color: "bg-status-cyan" },
    { label: "הסכם נחתם", count: 2100, color: "bg-status-orange" },
    { label: "BDI אושר", count: 1450, color: "bg-status-yellow" },
    { label: "מכרז מול גופים", count: 980, color: "bg-status-green" },
    { label: "אישור סופי", count: 670, color: "bg-bingo-green-dark" },
    { label: "הלוואה ניתנה", count: 540, color: "bg-bingo-green" },
    { label: "תשלום נסגר", count: 510, color: "bg-emerald-500" },
  ];

  const maxCount = funnelStages[0].count;

  return (
    <div className="space-y-4">
      {/* Funnel visualization */}
      <div className="rounded-3xl bg-white border border-bingo-gray-200 bingo-shadow-sm p-6">
        <h2 className="text-xl font-extrabold text-bingo-black">משפך המרה - כל הליד מהתחלה עד הסוף</h2>
        <p className="text-[12px] text-bingo-gray-600 mt-1 mb-5">
          ההמרה הסופית: <strong className="text-bingo-green-dark">{((funnelStages[funnelStages.length - 1].count / funnelStages[0].count) * 100).toFixed(1)}%</strong> מהלידים סוגרים
        </p>

        <div className="space-y-2">
          {funnelStages.map((s, i) => {
            const widthPct = (s.count / maxCount) * 100;
            const prevCount = i > 0 ? funnelStages[i - 1].count : s.count;
            const dropoff = i > 0 ? Math.round(((prevCount - s.count) / prevCount) * 100) : 0;
            const conversion = i > 0 ? Math.round((s.count / prevCount) * 100) : 100;
            return (
              <div key={s.label}>
                <div className="flex items-baseline justify-between mb-1.5">
                  <div className="flex items-baseline gap-2">
                    <span className="text-[10px] font-mono tabular-nums font-bold text-bingo-gray-400 w-6">{String(i + 1).padStart(2, "0")}</span>
                    <span className="text-[14px] font-extrabold text-bingo-black">{s.label}</span>
                  </div>
                  <div className="text-[12px] tabular-nums">
                    <span className="font-mono font-bold text-bingo-black">{formatNumber(s.count)}</span>
                    {i > 0 && (
                      <>
                        <span className="text-bingo-gray-500 mx-2">·</span>
                        <span className={`font-bold ${conversion >= 70 ? "text-bingo-green-dark" : conversion >= 50 ? "text-amber-700" : "text-status-red"}`}>
                          {conversion}% המשך
                        </span>
                        {dropoff > 0 && (
                          <>
                            <span className="text-bingo-gray-500 mx-2">·</span>
                            <span className="text-status-red font-bold">-{dropoff}% נשירה</span>
                          </>
                        )}
                      </>
                    )}
                  </div>
                </div>
                <div className="h-10 bg-bingo-gray-100 rounded-xl overflow-hidden relative">
                  <div className={`absolute inset-y-0 right-0 ${s.color} transition-all duration-700 flex items-center px-3`} style={{ width: `${widthPct}%` }}>
                    {widthPct > 12 && (
                      <span className="text-[11px] font-mono tabular-nums font-extrabold text-white">{formatNumber(s.count)}</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* By pipeline */}
      <div className="rounded-3xl bg-white border border-bingo-gray-200 bingo-shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-bingo-gray-100">
          <h2 className="text-xl font-extrabold text-bingo-black inline-flex items-center gap-2">
            <TrendingUp className="size-5" /> פירוק לפי תהליך
          </h2>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-bingo-gray-50/40">
            <tr className="text-right text-[10px] font-bold uppercase tracking-wider text-bingo-gray-500 border-b border-bingo-gray-100">
              <th className="px-6 py-3">תהליך</th>
              <th className="px-3 py-3">סה"כ לידים</th>
              <th className="px-3 py-3">סטטוסים</th>
              <th className="px-3 py-3">% מהמערכת</th>
            </tr>
          </thead>
          <tbody>
            {PIPELINES.map((p) => {
              const subStatuses = STATUSES.filter((s) => s.pipeline === p.key).length;
              const total = PIPELINES.reduce((s, x) => s + x.count, 0);
              const pct = (p.count / total) * 100;
              return (
                <tr key={p.key} className="border-b border-bingo-gray-100 last:border-0 hover:bg-bingo-green/[0.03]">
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-3">
                      <span className="size-9 rounded-xl bg-bingo-gray-100 text-bingo-charcoal inline-flex items-center justify-center">
                        <PipelineGlyph kind={p.key} size={16} />
                      </span>
                      <span className="text-[13px] font-extrabold text-bingo-black">{p.label}</span>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-[13px] font-mono tabular-nums font-bold text-bingo-charcoal">{formatNumber(p.count)}</td>
                  <td className="px-3 py-3 text-[12px] text-bingo-gray-600">{subStatuses} סטטוסים</td>
                  <td className="px-3 py-3 min-w-[180px]">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-bingo-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-bingo-green-dark rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-[11px] font-mono tabular-nums font-bold text-bingo-charcoal w-12 text-right">{pct.toFixed(1)}%</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
