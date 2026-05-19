import { AGENT_PERFORMANCE } from "@/lib/data/admin-mock";
import { Avatar } from "@/components/ui/Avatar";
import { formatCurrency, formatNumber, cn } from "@/lib/utils";
import { TrendingUp, Phone, Pen, ShieldCheck } from "lucide-react";

export default function TeamPage() {
  return (
    <div className="rounded-3xl bg-white border border-bingo-gray-200 bingo-shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-bingo-gray-100">
        <h2 className="text-xl font-extrabold text-bingo-black">ביצועי הצוות - מבט מקיף</h2>
        <p className="text-[12px] text-bingo-gray-600 mt-1">
          ניתוח עומק לכל נציג - עסקאות, שיחות, חתימות, בדיקות BDI, ויחס המרה.
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-bingo-gray-50/40">
            <tr className="text-right text-[10px] font-bold uppercase tracking-wider text-bingo-gray-500 border-b border-bingo-gray-100">
              <th className="px-5 py-3">נציג</th>
              <th className="px-3 py-3">יעד / הושג</th>
              <th className="px-3 py-3">המרה</th>
              <th className="px-3 py-3"><Phone className="size-3.5 inline" /> שיחות</th>
              <th className="px-3 py-3">משך ממוצע</th>
              <th className="px-3 py-3"><Pen className="size-3.5 inline" /> חתימות</th>
              <th className="px-3 py-3"><ShieldCheck className="size-3.5 inline" /> BDI</th>
              <th className="px-3 py-3 text-bingo-green-dark">עמלה</th>
            </tr>
          </thead>
          <tbody>
            {AGENT_PERFORMANCE.slice()
              .sort((a, b) => b.monthlyRevenue - a.monthlyRevenue)
              .map((a) => {
                const targetPct = Math.round((a.monthlyDeals / a.monthlyTarget) * 100);
                const answeredPct = Math.round((a.callsAnswered / Math.max(1, a.callsMade)) * 100);
                const bdiTotal = a.bdiApprovals + a.bdiRejections;
                const bdiPct = bdiTotal > 0 ? Math.round((a.bdiApprovals / bdiTotal) * 100) : 0;
                return (
                  <tr key={a.id} className="border-b border-bingo-gray-100 last:border-0 hover:bg-bingo-green/[0.03]">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2.5">
                        <Avatar name={a.name} emoji={a.emoji} size="md" />
                        <div>
                          <div className="text-[13px] font-extrabold text-bingo-black">{a.name}</div>
                          <div className="text-[10px] text-bingo-gray-500">{a.role}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3 min-w-[140px]">
                      <div className="text-[12px] font-mono tabular-nums font-bold text-bingo-charcoal mb-1">
                        {a.monthlyDeals}/{a.monthlyTarget}
                      </div>
                      <div className="h-1.5 bg-bingo-gray-100 rounded-full overflow-hidden">
                        <div
                          className={cn("h-full rounded-full", targetPct >= 100 ? "bg-bingo-green-dark" : targetPct >= 60 ? "bg-status-yellow" : "bg-status-orange")}
                          style={{ width: `${Math.min(100, targetPct)}%` }}
                        />
                      </div>
                    </td>
                    <td className="px-3 py-3 text-[12px] font-mono tabular-nums font-bold">
                      <span className={cn(a.conversionRate >= 25 ? "text-bingo-green-dark" : a.conversionRate >= 15 ? "text-amber-700" : "text-status-red")}>
                        {a.conversionRate}%
                      </span>
                    </td>
                    <td className="px-3 py-3 text-[12px] font-mono tabular-nums text-bingo-charcoal">
                      <div className="font-bold">{a.callsMade}</div>
                      <div className="text-[10px] text-bingo-gray-500">{a.callsAnswered} ענו · {answeredPct}%</div>
                    </td>
                    <td className="px-3 py-3 text-[12px] font-mono tabular-nums text-bingo-charcoal">
                      {Math.floor(a.avgCallDuration / 60)}:{String(a.avgCallDuration % 60).padStart(2, "0")}
                    </td>
                    <td className="px-3 py-3 text-[12px] font-mono tabular-nums font-bold text-bingo-charcoal">{a.signaturesCollected}</td>
                    <td className="px-3 py-3 text-[12px] font-mono tabular-nums">
                      <div className="font-bold text-bingo-charcoal">{bdiTotal}</div>
                      <div className="text-[10px] text-bingo-gray-500">{bdiPct}% אישור</div>
                    </td>
                    <td className="px-3 py-3 text-[12px] font-mono tabular-nums font-extrabold text-bingo-green-dark">
                      {formatCurrency(a.monthlyCommission)}
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
