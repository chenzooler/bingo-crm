import { AGENT_PERFORMANCE } from "@/lib/data/admin-mock";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { DollarSign, TrendingUp, FileText, Wallet } from "lucide-react";

export default function FinancialsPage() {
  const totalRevenue = AGENT_PERFORMANCE.reduce((s, a) => s + a.monthlyRevenue, 0);
  const totalCommission = AGENT_PERFORMANCE.reduce((s, a) => s + a.monthlyCommission, 0);
  const totalDeals = AGENT_PERFORMANCE.reduce((s, a) => s + a.monthlyDeals, 0);
  const profit = totalRevenue - totalCommission;
  const avgDeal = totalDeals > 0 ? totalRevenue / totalDeals : 0;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <FinKpi icon={<DollarSign className="size-5" />} label="הכנסות החודש" value={formatCurrency(totalRevenue)} accent="green" />
        <FinKpi icon={<Wallet className="size-5" />} label="עמלות נציגים" value={formatCurrency(totalCommission)} accent="orange" />
        <FinKpi icon={<TrendingUp className="size-5" />} label="רווח גולמי" value={formatCurrency(profit)} accent="blue" />
        <FinKpi icon={<FileText className="size-5" />} label="ממוצע עסקה" value={formatCurrency(avgDeal)} accent="purple" />
      </div>

      <div className="rounded-3xl bg-white border border-bingo-gray-200 bingo-shadow-sm p-6">
        <h2 className="text-xl font-extrabold text-bingo-black mb-1">פירוט פיננסי החודש</h2>
        <p className="text-[12px] text-bingo-gray-600 mb-5">חישוב הכנסות מול עמלות נציגים</p>

        <div className="space-y-3">
          <FinRow label="הכנסות שכ״ט (כולל מע״מ)" value={formatCurrency(totalRevenue * 1.18)} bold />
          <FinRow label="הכנסות נטו (לא כולל מע״מ)" value={formatCurrency(totalRevenue)} />
          <FinRow label="מע״מ לתשלום" value={formatCurrency(totalRevenue * 0.18)} subdued />
          <hr className="my-3 border-bingo-gray-100" />
          <FinRow label="עמלות נציגי מכירות" value={`-${formatCurrency(totalCommission)}`} subdued />
          <FinRow label="הוצאות ספקי לידים (משוער)" value={`-${formatCurrency(totalRevenue * 0.10)}`} subdued />
          <FinRow label="הוצאות תפעול (משוער)" value={`-${formatCurrency(totalRevenue * 0.08)}`} subdued />
          <hr className="my-3 border-bingo-gray-100" />
          <FinRow label="רווח גולמי" value={formatCurrency(profit * 0.82)} bold accent="green" />
        </div>
      </div>
    </div>
  );
}

function FinKpi({ icon, label, value, accent }: { icon: React.ReactNode; label: string; value: string; accent: "green" | "blue" | "orange" | "purple" }) {
  const palette = {
    green: "from-bingo-green/15 to-bingo-green/5 border-bingo-green/40 text-bingo-green-dark",
    blue: "from-status-blue/12 to-status-blue/3 border-status-blue/25 text-status-blue",
    orange: "from-status-orange/12 to-status-orange/3 border-status-orange/25 text-orange-700",
    purple: "from-status-purple/12 to-status-purple/3 border-status-purple/25 text-status-purple",
  }[accent];
  return (
    <div className={`rounded-2xl bg-gradient-to-bl border p-4 ${palette}`}>
      <div className="size-10 rounded-xl inline-flex items-center justify-center bg-white/60">{icon}</div>
      <div className="text-2xl font-black text-bingo-black tabular-nums leading-none mt-3">{value}</div>
      <div className="text-[11px] font-bold mt-1">{label}</div>
    </div>
  );
}

function FinRow({ label, value, bold, subdued, accent }: { label: string; value: string; bold?: boolean; subdued?: boolean; accent?: "green" }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className={`text-[13px] ${subdued ? "text-bingo-gray-600" : "text-bingo-charcoal"} ${bold ? "font-extrabold" : "font-medium"}`}>{label}</span>
      <span className={`text-[15px] font-mono tabular-nums ${bold ? "font-black" : "font-bold"} ${accent === "green" ? "text-bingo-green-dark" : "text-bingo-black"}`}>
        {value}
      </span>
    </div>
  );
}
