import { AGENT_PERFORMANCE, SIGNATURE_SERIES, BDI_SERIES, CONTRACT_SERIES, LENDER_CHECK_SERIES } from "@/lib/data/admin-mock";
import { PIPELINES, STATUSES } from "@/lib/data/static";
import { MiniChart, BarChart } from "@/components/admin/MiniChart";
import { formatNumber, formatCurrency } from "@/lib/utils";
import { TrendingUp, TrendingDown, Pen, ShieldCheck, Phone, FileSignature, Building2, Users } from "lucide-react";
import Link from "next/link";

export default function AdminOverviewPage() {
  const totalRevenue = AGENT_PERFORMANCE.reduce((s, a) => s + a.monthlyRevenue, 0);
  const totalDeals = AGENT_PERFORMANCE.reduce((s, a) => s + a.monthlyDeals, 0);
  const totalCalls = AGENT_PERFORMANCE.reduce((s, a) => s + a.callsMade, 0);
  const totalSignatures = AGENT_PERFORMANCE.reduce((s, a) => s + a.signaturesCollected, 0);
  const totalBDI = AGENT_PERFORMANCE.reduce((s, a) => s + a.bdiApprovals + a.bdiRejections, 0);
  const totalLeads = PIPELINES.reduce((s, p) => s + p.count, 0);
  const avgConversion = Math.round(AGENT_PERFORMANCE.reduce((s, a) => s + a.conversionRate, 0) / AGENT_PERFORMANCE.length);

  return (
    <div className="space-y-4">
      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard
          icon={<TrendingUp className="size-5" />}
          label="הכנסה החודש"
          value={formatCurrency(totalRevenue)}
          delta={18}
          accent="green"
        />
        <KpiCard
          icon={<FileSignature className="size-5" />}
          label="עסקאות סגורות"
          value={formatNumber(totalDeals)}
          delta={12}
          accent="blue"
        />
        <KpiCard
          icon={<Phone className="size-5" />}
          label="שיחות בוצעו"
          value={formatNumber(totalCalls)}
          delta={8}
          accent="orange"
        />
        <KpiCard
          icon={<TrendingUp className="size-5" />}
          label="המרה ממוצעת"
          value={`${avgConversion}%`}
          delta={-2}
          accent="purple"
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <ChartCard
          title="חתימות חוזים - 30 ימים"
          subtitle={`סה"כ ${formatNumber(totalSignatures)} חתימות`}
          icon={<Pen className="size-4" />}
        >
          <BarChart data={CONTRACT_SERIES} color="green" />
        </ChartCard>
        <ChartCard
          title="בדיקות BDI - 30 ימים"
          subtitle={`סה"כ ${formatNumber(totalBDI)} בדיקות`}
          icon={<ShieldCheck className="size-4" />}
        >
          <BarChart data={BDI_SERIES} color="blue" />
        </ChartCard>
        <ChartCard
          title="בדיקות גופי מימון - 30 ימים"
          subtitle={`${formatNumber(LENDER_CHECK_SERIES.reduce((s, d) => s + d.count, 0))} בדיקות מצטברות`}
          icon={<Building2 className="size-4" />}
        >
          <BarChart data={LENDER_CHECK_SERIES} color="orange" />
        </ChartCard>
        <ChartCard
          title="חתימות הסכמי התקשרות"
          subtitle="לפני התחלת טיפול"
          icon={<FileSignature className="size-4" />}
        >
          <BarChart data={SIGNATURE_SERIES} color="green" />
        </ChartCard>
      </div>

      {/* Top performers + alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <div className="lg:col-span-2 rounded-3xl bg-white border border-bingo-gray-200 bingo-shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-bingo-gray-100 flex items-center justify-between">
            <h3 className="text-base font-extrabold text-bingo-black inline-flex items-center gap-2">
              <Users className="size-4" />
              Top Performers החודש
            </h3>
            <Link href="/admin/team" className="text-[12px] font-bold text-bingo-green-dark hover:underline">
              כל הצוות ←
            </Link>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-bingo-gray-50/40">
              <tr className="text-right text-[10px] font-bold uppercase tracking-wider text-bingo-gray-500 border-b border-bingo-gray-100">
                <th className="px-5 py-2.5">נציג</th>
                <th className="px-3 py-2.5">עסקאות</th>
                <th className="px-3 py-2.5">המרה</th>
                <th className="px-3 py-2.5">הכנסה</th>
              </tr>
            </thead>
            <tbody>
              {AGENT_PERFORMANCE.slice()
                .sort((a, b) => b.monthlyRevenue - a.monthlyRevenue)
                .slice(0, 6)
                .map((a, i) => (
                  <tr key={a.id} className="border-b border-bingo-gray-100 last:border-0 hover:bg-bingo-green/[0.03]">
                    <td className="px-5 py-2.5">
                      <div className="flex items-center gap-2">
                        <span className="size-6 rounded-md bg-bingo-gray-100 text-bingo-charcoal text-[10px] font-mono font-bold inline-flex items-center justify-center">
                          {i + 1}
                        </span>
                        <span className="text-[13px] font-bold text-bingo-black">{a.name}</span>
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-[12px] font-mono tabular-nums font-bold text-bingo-charcoal">
                      {a.monthlyDeals}/{a.monthlyTarget}
                    </td>
                    <td className="px-3 py-2.5 text-[12px] font-mono tabular-nums text-bingo-charcoal">{a.conversionRate}%</td>
                    <td className="px-3 py-2.5 text-[12px] font-mono tabular-nums font-extrabold text-bingo-green-dark">
                      {formatCurrency(a.monthlyRevenue)}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        <div className="rounded-3xl bg-white border border-bingo-gray-200 bingo-shadow-sm p-5">
          <h3 className="text-base font-extrabold text-bingo-black mb-3">מבט עליון</h3>
          <div className="space-y-3">
            <Stat label="לידים פעילים במערכת" value={formatNumber(totalLeads)} />
            <Stat label="תהליכים פעילים" value={String(PIPELINES.length)} />
            <Stat label="סטטוסים שונים" value={String(STATUSES.length)} />
            <Stat label="נציגים פעילים" value={String(AGENT_PERFORMANCE.length)} />
            <Stat label="ממוצע סכום הלוואה" value={formatCurrency(Math.round(totalRevenue / Math.max(1, totalDeals) * 20))} />
          </div>
        </div>
      </div>
    </div>
  );
}

function KpiCard({ icon, label, value, delta, accent }: { icon: React.ReactNode; label: string; value: string; delta: number; accent: "green" | "blue" | "orange" | "purple" }) {
  const palette = {
    green: "from-bingo-green/15 to-bingo-green/5 border-bingo-green/40 text-bingo-green-dark",
    blue: "from-status-blue/12 to-status-blue/3 border-status-blue/25 text-status-blue",
    orange: "from-status-orange/12 to-status-orange/3 border-status-orange/25 text-orange-700",
    purple: "from-status-purple/12 to-status-purple/3 border-status-purple/25 text-status-purple",
  }[accent];
  const positive = delta >= 0;
  return (
    <div className={`rounded-2xl bg-gradient-to-bl border p-4 ${palette}`}>
      <div className="flex items-start justify-between mb-2">
        <div className={`size-10 rounded-xl inline-flex items-center justify-center bg-white/60`}>{icon}</div>
        <span className={`inline-flex items-center gap-0.5 text-[10px] font-mono tabular-nums font-bold rounded-full px-1.5 py-0.5 ${
          positive ? "bg-bingo-green/15 text-bingo-green-dark" : "bg-status-red-soft text-status-red"
        }`}>
          {positive ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
          {Math.abs(delta)}%
        </span>
      </div>
      <div className="text-3xl font-black text-bingo-black tabular-nums leading-none">{value}</div>
      <div className="text-[11px] font-bold mt-1">{label}</div>
    </div>
  );
}

function ChartCard({ title, subtitle, icon, children }: { title: string; subtitle?: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="rounded-3xl bg-white border border-bingo-gray-200 bingo-shadow-sm p-5">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-base font-extrabold text-bingo-black inline-flex items-center gap-2">
            {icon}
            {title}
          </h3>
          {subtitle && <p className="text-[11px] text-bingo-gray-500 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {children}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-[12px] text-bingo-charcoal">{label}</span>
      <span className="text-[14px] font-mono tabular-nums font-extrabold text-bingo-black">{value}</span>
    </div>
  );
}
