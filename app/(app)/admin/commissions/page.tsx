"use client";
import { AGENT_PERFORMANCE } from "@/lib/data/admin-mock";
import { Avatar } from "@/components/ui/Avatar";
import { Wallet, TrendingUp, CheckCircle2, Clock, DollarSign } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function CommissionsPage() {
  const totalCommission = AGENT_PERFORMANCE.reduce((s, a) => s + a.monthlyCommission, 0);
  const paid = totalCommission * 0.6;
  const pending = totalCommission * 0.4;

  return (
    <div className="space-y-4">
      <div className="rounded-3xl bg-white border border-bingo-gray-200 bingo-shadow-sm p-6">
        <h2 className="text-xl font-extrabold text-bingo-black">חישוב עמלות נציגים</h2>
        <p className="text-[12px] text-bingo-gray-600 mt-1">החודש: {AGENT_PERFORMANCE.length} נציגים · {formatCurrency(totalCommission)} סה"כ</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Kpi icon={<Wallet />} label="סה״כ עמלות" value={formatCurrency(totalCommission)} color="purple" />
        <Kpi icon={<CheckCircle2 />} label="שולם" value={formatCurrency(paid)} color="green" />
        <Kpi icon={<Clock />} label="ממתין לתשלום" value={formatCurrency(pending)} color="orange" />
        <Kpi icon={<TrendingUp />} label="ממוצע לנציג" value={formatCurrency(totalCommission / AGENT_PERFORMANCE.length)} color="blue" />
      </div>

      <div className="rounded-3xl bg-white border border-bingo-gray-200 bingo-shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-bingo-gray-50/40">
            <tr className="text-right text-[10px] font-bold uppercase tracking-wider text-bingo-gray-500 border-b border-bingo-gray-100">
              <th className="px-5 py-3">נציג</th>
              <th className="px-3 py-3">עסקאות</th>
              <th className="px-3 py-3">הכנסה</th>
              <th className="px-3 py-3">בסיס (30%)</th>
              <th className="px-3 py-3">בונוס</th>
              <th className="px-3 py-3 text-bingo-green-dark">סה״כ עמלה</th>
              <th className="px-3 py-3">סטטוס</th>
            </tr>
          </thead>
          <tbody>
            {AGENT_PERFORMANCE.slice().sort((a,b) => b.monthlyCommission - a.monthlyCommission).map((a, i) => {
              const base = a.monthlyCommission * 0.85;
              const bonus = a.monthlyCommission * 0.15;
              const paid = i < AGENT_PERFORMANCE.length * 0.6;
              return (
                <tr key={a.id} className="border-b border-bingo-gray-100 last:border-0 hover:bg-bingo-green/[0.03]">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2.5">
                      <Avatar name={a.name} emoji={a.emoji} size="sm" />
                      <span className="text-[13px] font-bold text-bingo-black">{a.name}</span>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-[12px] font-mono tabular-nums font-bold text-bingo-charcoal">{a.monthlyDeals}</td>
                  <td className="px-3 py-3 text-[12px] font-mono tabular-nums text-bingo-charcoal">{formatCurrency(a.monthlyRevenue)}</td>
                  <td className="px-3 py-3 text-[12px] font-mono tabular-nums text-bingo-charcoal">{formatCurrency(base)}</td>
                  <td className="px-3 py-3 text-[12px] font-mono tabular-nums text-amber-700">{formatCurrency(bonus)}</td>
                  <td className="px-3 py-3 text-[13px] font-mono tabular-nums font-extrabold text-bingo-green-dark">{formatCurrency(a.monthlyCommission)}</td>
                  <td className="px-3 py-3">
                    {paid ? (
                      <span className="text-[10px] font-bold text-bingo-green-dark bg-bingo-green/15 rounded-full px-2 py-0.5">שולם</span>
                    ) : (
                      <button className="h-7 px-2.5 rounded-lg bg-bingo-black text-white text-[10px] font-bold hover:bg-bingo-charcoal">שלם עכשיו</button>
                    )}
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

function Kpi({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: "green" | "blue" | "orange" | "purple" }) {
  const palette = { green: "from-bingo-green/15 to-bingo-green/5 border-bingo-green/40 text-bingo-green-dark", blue: "from-status-blue/12 to-status-blue/3 border-status-blue/25 text-status-blue", orange: "from-status-orange/12 to-status-orange/3 border-status-orange/25 text-orange-700", purple: "from-status-purple/12 to-status-purple/3 border-status-purple/25 text-status-purple" }[color];
  return (
    <div className={`rounded-2xl bg-gradient-to-bl border p-4 ${palette}`}>
      <div className="size-9 rounded-xl inline-flex items-center justify-center bg-white/60">{icon}</div>
      <div className="text-2xl font-black text-bingo-black tabular-nums mt-2 leading-none">{value}</div>
      <div className="text-[11px] font-bold mt-1">{label}</div>
    </div>
  );
}
