import { CHECK_STATS, BDI_SERIES, LENDER_CHECK_SERIES, AGENT_PERFORMANCE } from "@/lib/data/admin-mock";
import { BarChart } from "@/components/admin/MiniChart";
import { LenderMark } from "@/components/icons/ServiceIcons";
import { Avatar } from "@/components/ui/Avatar";
import { LENDERS } from "@/lib/types";
import { ShieldCheck, Clock, Building2, TrendingUp, TrendingDown, AlertCircle } from "lucide-react";
import { formatNumber } from "@/lib/utils";

export default function ChecksPage() {
  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {CHECK_STATS.map((s, i) => {
          const palette = [
            "from-status-blue/12 to-status-blue/3 border-status-blue/25 text-status-blue",
            "from-bingo-green/15 to-bingo-green/5 border-bingo-green/40 text-bingo-green-dark",
            "from-status-orange/12 to-status-orange/3 border-status-orange/25 text-orange-700",
            "from-status-yellow-soft to-amber-50 border-status-yellow/40 text-amber-700",
          ][i];
          const icons = [
            <ShieldCheck key="0" className="size-5" />,
            <TrendingUp key="1" className="size-5" />,
            <Building2 key="2" className="size-5" />,
            <Clock key="3" className="size-5" />,
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
              <div className="text-3xl font-black text-bingo-black tabular-nums leading-none">{formatNumber(s.value)}{s.label.includes("%") ? "%" : ""}</div>
              <div className="text-[11px] font-bold mt-1">{s.label}</div>
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="rounded-3xl bg-white border border-bingo-gray-200 bingo-shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-extrabold text-bingo-black inline-flex items-center gap-2">
              <ShieldCheck className="size-4" /> בדיקות BDI יומיות
            </h3>
            <span className="text-[11px] text-bingo-gray-500">30 ימים</span>
          </div>
          <BarChart data={BDI_SERIES} color="blue" />
        </div>
        <div className="rounded-3xl bg-white border border-bingo-gray-200 bingo-shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-extrabold text-bingo-black inline-flex items-center gap-2">
              <Building2 className="size-4" /> בדיקות גופי מימון יומיות
            </h3>
            <span className="text-[11px] text-bingo-gray-500">30 ימים</span>
          </div>
          <BarChart data={LENDER_CHECK_SERIES} color="orange" />
        </div>
      </div>

      {/* Per lender breakdown */}
      <div className="rounded-3xl bg-white border border-bingo-gray-200 bingo-shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-bingo-gray-100">
          <h3 className="text-base font-extrabold text-bingo-black">בדיקות לפי גוף מימון</h3>
          <p className="text-[12px] text-bingo-gray-600 mt-1">כמות בדיקות, אחוזי אישור, וזמני תגובה</p>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-bingo-gray-50/40">
            <tr className="text-right text-[10px] font-bold uppercase tracking-wider text-bingo-gray-500 border-b border-bingo-gray-100">
              <th className="px-6 py-3">גוף</th>
              <th className="px-3 py-3">בדיקות החודש</th>
              <th className="px-3 py-3">% אישור</th>
              <th className="px-3 py-3">סכום ממוצע מאושר</th>
              <th className="px-3 py-3">זמן תגובה</th>
            </tr>
          </thead>
          <tbody>
            {LENDERS.map((l, i) => {
              const checks = Math.round(120 + Math.random() * 200);
              const approval = 30 + Math.round(Math.random() * 50);
              const avgAmount = Math.round((20000 + Math.random() * 80000) / 1000) * 1000;
              const responseTime = ["8 שניות", "12 שניות", "30 שניות", "3-5 דק", "2-4 דק"][i % 5];
              return (
                <tr key={l.key} className="border-b border-bingo-gray-100 last:border-0 hover:bg-bingo-green/[0.03]">
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-3">
                      <LenderMark code={l.key} size={32} />
                      <span className="text-[13px] font-extrabold text-bingo-black">{l.label}</span>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-[12px] font-mono tabular-nums font-bold text-bingo-charcoal">{checks}</td>
                  <td className="px-3 py-3 min-w-[140px]">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-bingo-gray-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${approval >= 60 ? "bg-bingo-green-dark" : approval >= 40 ? "bg-status-yellow" : "bg-status-orange"}`} style={{ width: `${approval}%` }} />
                      </div>
                      <span className="text-[11px] font-mono tabular-nums font-bold text-bingo-charcoal w-10 text-right">{approval}%</span>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-[12px] font-mono tabular-nums text-bingo-charcoal">{formatNumber(avgAmount)} ₪</td>
                  <td className="px-3 py-3 text-[12px] text-bingo-gray-600">{responseTime}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Per agent BDI */}
      <div className="rounded-3xl bg-white border border-bingo-gray-200 bingo-shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-bingo-gray-100">
          <h3 className="text-base font-extrabold text-bingo-black">בדיקות BDI לפי נציג</h3>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-bingo-gray-50/40">
            <tr className="text-right text-[10px] font-bold uppercase tracking-wider text-bingo-gray-500 border-b border-bingo-gray-100">
              <th className="px-6 py-3">נציג</th>
              <th className="px-3 py-3">סה"כ</th>
              <th className="px-3 py-3 text-bingo-green-dark">אושרו</th>
              <th className="px-3 py-3 text-status-red">סורבו</th>
              <th className="px-3 py-3">% אישור</th>
            </tr>
          </thead>
          <tbody>
            {AGENT_PERFORMANCE.slice()
              .sort((a, b) => b.bdiApprovals + b.bdiRejections - (a.bdiApprovals + a.bdiRejections))
              .map((a) => {
                const total = a.bdiApprovals + a.bdiRejections;
                const pct = total > 0 ? Math.round((a.bdiApprovals / total) * 100) : 0;
                return (
                  <tr key={a.id} className="border-b border-bingo-gray-100 last:border-0 hover:bg-bingo-green/[0.03]">
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-2.5">
                        <Avatar name={a.name} emoji={a.emoji} size="sm" />
                        <span className="text-[13px] font-bold text-bingo-black">{a.name}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-[13px] font-mono tabular-nums font-bold text-bingo-charcoal">{total}</td>
                    <td className="px-3 py-3 text-[13px] font-mono tabular-nums font-bold text-bingo-green-dark">{a.bdiApprovals}</td>
                    <td className="px-3 py-3 text-[13px] font-mono tabular-nums font-bold text-status-red">{a.bdiRejections}</td>
                    <td className="px-3 py-3 text-[12px] font-mono tabular-nums font-bold text-bingo-charcoal">{pct}%</td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
