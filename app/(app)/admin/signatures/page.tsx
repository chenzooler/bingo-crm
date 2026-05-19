import { SIGNATURE_STATS, SIGNATURE_SERIES, CONTRACT_SERIES, AGENT_PERFORMANCE } from "@/lib/data/admin-mock";
import { BarChart } from "@/components/admin/MiniChart";
import { Avatar } from "@/components/ui/Avatar";
import { Pen, FileSignature, Clock, CheckCircle2, XCircle, TrendingUp, TrendingDown } from "lucide-react";
import { formatNumber } from "@/lib/utils";

export default function SignaturesPage() {
  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {SIGNATURE_STATS.map((s, i) => {
          const palette = [
            "from-bingo-green/15 to-bingo-green/5 border-bingo-green/40 text-bingo-green-dark",
            "from-status-yellow-soft to-amber-50 border-status-yellow/40 text-amber-700",
            "from-status-blue/12 to-status-blue/3 border-status-blue/25 text-status-blue",
            "from-status-red/12 to-status-red/3 border-status-red/25 text-status-red",
          ][i];
          const icons = [
            <FileSignature key="0" className="size-5" />,
            <Clock key="1" className="size-5" />,
            <CheckCircle2 key="2" className="size-5" />,
            <XCircle key="3" className="size-5" />,
          ];
          const positive = s.delta >= 0;
          return (
            <div key={s.label} className={`rounded-2xl bg-gradient-to-bl border p-4 ${palette}`}>
              <div className="flex items-start justify-between mb-2">
                <div className="size-10 rounded-xl inline-flex items-center justify-center bg-white/60">{icons[i]}</div>
                <span className={`inline-flex items-center gap-0.5 text-[10px] font-mono tabular-nums font-bold rounded-full px-1.5 py-0.5 ${
                  positive ? "bg-bingo-green/15 text-bingo-green-dark" : "bg-status-red-soft text-status-red"
                }`}>
                  {positive ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
                  {Math.abs(s.delta)}%
                </span>
              </div>
              <div className="text-3xl font-black text-bingo-black tabular-nums leading-none">{formatNumber(s.value)}</div>
              <div className="text-[11px] font-bold mt-1">{s.label}</div>
            </div>
          );
        })}
      </div>

      {/* Charts side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="rounded-3xl bg-white border border-bingo-gray-200 bingo-shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-extrabold text-bingo-black inline-flex items-center gap-2">
              <Pen className="size-4" /> חתימות חוזים יומיות
            </h3>
            <span className="text-[11px] text-bingo-gray-500">30 ימים</span>
          </div>
          <BarChart data={SIGNATURE_SERIES} color="green" />
        </div>
        <div className="rounded-3xl bg-white border border-bingo-gray-200 bingo-shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-extrabold text-bingo-black inline-flex items-center gap-2">
              <FileSignature className="size-4" /> הסכמי התקשרות
            </h3>
            <span className="text-[11px] text-bingo-gray-500">30 ימים</span>
          </div>
          <BarChart data={CONTRACT_SERIES} color="blue" />
        </div>
      </div>

      {/* Per agent breakdown */}
      <div className="rounded-3xl bg-white border border-bingo-gray-200 bingo-shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-bingo-gray-100">
          <h3 className="text-base font-extrabold text-bingo-black">חתימות לפי נציג</h3>
          <p className="text-[12px] text-bingo-gray-600 mt-1">סה"כ חתימות שאסף כל נציג החודש</p>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-bingo-gray-50/40">
            <tr className="text-right text-[10px] font-bold uppercase tracking-wider text-bingo-gray-500 border-b border-bingo-gray-100">
              <th className="px-6 py-3">נציג</th>
              <th className="px-3 py-3">חתימות החודש</th>
              <th className="px-3 py-3">% מהיעד</th>
              <th className="px-3 py-3">דירוג</th>
            </tr>
          </thead>
          <tbody>
            {AGENT_PERFORMANCE.slice()
              .sort((a, b) => b.signaturesCollected - a.signaturesCollected)
              .map((a, i) => {
                const pct = Math.round((a.signaturesCollected / a.monthlyTarget) * 100);
                return (
                  <tr key={a.id} className="border-b border-bingo-gray-100 last:border-0 hover:bg-bingo-green/[0.03]">
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-2.5">
                        <Avatar name={a.name} emoji={a.emoji} size="sm" />
                        <span className="text-[13px] font-bold text-bingo-black">{a.name}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-[14px] font-mono tabular-nums font-extrabold text-bingo-black">{a.signaturesCollected}</td>
                    <td className="px-3 py-3 min-w-[160px]">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-bingo-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-bingo-green rounded-full" style={{ width: `${Math.min(100, pct)}%` }} />
                        </div>
                        <span className="text-[11px] font-mono tabular-nums font-bold text-bingo-charcoal w-10 text-right">{pct}%</span>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <span className={`text-[11px] font-mono tabular-nums font-bold rounded-full px-2 py-0.5 ${
                        i === 0 ? "bg-amber-100 text-amber-700" :
                        i === 1 ? "bg-bingo-gray-200 text-bingo-gray-700" :
                        i === 2 ? "bg-orange-100 text-orange-700" :
                        "bg-bingo-gray-100 text-bingo-gray-500"
                      }`}>#{i + 1}</span>
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
