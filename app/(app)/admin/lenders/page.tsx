import { LENDERS } from "@/lib/types";
import { LenderMark } from "@/components/icons/ServiceIcons";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { TrendingUp, TrendingDown, Activity } from "lucide-react";

export default function AdminLendersPage() {
  const data = LENDERS.map((l, i) => ({
    ...l,
    checks: Math.round(120 + Math.random() * 250),
    approvals: Math.round(60 + Math.random() * 80),
    avgAmount: Math.round((20000 + Math.random() * 80000) / 1000) * 1000,
    avgInterest: parseFloat((4 + Math.random() * 8).toFixed(1)),
    revenue: Math.round((40 + Math.random() * 100) * 1000),
    trend: (i % 3 === 0 ? "down" : "up") as "up" | "down",
    delta: Math.round(Math.random() * 30),
  }));

  return (
    <div className="rounded-3xl bg-white border border-bingo-gray-200 bingo-shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-bingo-gray-100">
        <h2 className="text-xl font-extrabold text-bingo-black inline-flex items-center gap-2">
          <Activity className="size-5" />
          ביצועי גופי מימון
        </h2>
        <p className="text-[12px] text-bingo-gray-600 mt-1">
          לאיזה גוף הכי משתלם להפנות, מי מאשר הכי מהר, ועם מי אנחנו עושים הכי הרבה כסף
        </p>
      </div>

      <table className="w-full text-sm">
        <thead className="bg-bingo-gray-50/40">
          <tr className="text-right text-[10px] font-bold uppercase tracking-wider text-bingo-gray-500 border-b border-bingo-gray-100">
            <th className="px-6 py-3">גוף</th>
            <th className="px-3 py-3">בדיקות</th>
            <th className="px-3 py-3">% אישור</th>
            <th className="px-3 py-3">ממוצע סכום</th>
            <th className="px-3 py-3">ריבית ממוצעת</th>
            <th className="px-3 py-3">הכנסה לבינגו</th>
            <th className="px-3 py-3">מגמה</th>
          </tr>
        </thead>
        <tbody>
          {data
            .sort((a, b) => b.revenue - a.revenue)
            .map((l) => {
              const approvalPct = Math.round((l.approvals / l.checks) * 100);
              return (
                <tr key={l.key} className="border-b border-bingo-gray-100 last:border-0 hover:bg-bingo-green/[0.03]">
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-3">
                      <LenderMark code={l.key} size={32} />
                      <span className="text-[13px] font-extrabold text-bingo-black">{l.label}</span>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-[13px] font-mono tabular-nums font-bold text-bingo-charcoal">{l.checks}</td>
                  <td className="px-3 py-3 min-w-[120px]">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-bingo-gray-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${approvalPct >= 60 ? "bg-bingo-green-dark" : approvalPct >= 40 ? "bg-status-yellow" : "bg-status-orange"}`} style={{ width: `${approvalPct}%` }} />
                      </div>
                      <span className="text-[11px] font-mono tabular-nums font-bold w-8 text-right">{approvalPct}%</span>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-[12px] font-mono tabular-nums text-bingo-charcoal">{formatNumber(l.avgAmount)} ₪</td>
                  <td className="px-3 py-3 text-[12px] font-mono tabular-nums text-bingo-charcoal">{l.avgInterest}%</td>
                  <td className="px-3 py-3 text-[13px] font-mono tabular-nums font-extrabold text-bingo-green-dark">{formatCurrency(l.revenue)}</td>
                  <td className="px-3 py-3">
                    <span className={`inline-flex items-center gap-0.5 text-[10px] font-mono tabular-nums font-bold rounded-full px-1.5 py-0.5 ${
                      l.trend === "up" ? "bg-bingo-green/15 text-bingo-green-dark" : "bg-status-red-soft text-status-red"
                    }`}>
                      {l.trend === "up" ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
                      {l.delta}%
                    </span>
                  </td>
                </tr>
              );
            })}
        </tbody>
      </table>
    </div>
  );
}
