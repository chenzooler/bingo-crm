"use client";
import * as React from "react";
import { Brain, TrendingUp, AlertTriangle, Target, Users, Sparkles, ChevronLeft } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { LEADS } from "@/lib/data/leads";
import { Icon3D } from "@/components/ui/Icon3D";
import Link from "next/link";
import { cn, formatCurrency } from "@/lib/utils";

export default function InsightsPage() {
  const hotLeads = LEADS.slice(0, 6).map((l, i) => ({ ...l, score: 95 - i * 4 }));
  const atRisk = LEADS.slice(6, 12).map((l, i) => ({ ...l, churnRisk: 78 - i * 5 }));

  return (
    <div className="max-w-[1500px] space-y-4">
      <div className="relative rounded-3xl bg-white border border-bingo-gray-200 p-5 overflow-hidden" style={{ boxShadow: "0 2px 4px -1px rgba(0,0,0,0.03), 0 8px 24px -6px rgba(46, 161, 13, 0.10)" }}>
        <div className="flex items-center gap-4">
          <Icon3D icon={<Brain className="size-6" />} tone="purple" size={56} />
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-bingo-gray-500 mb-1">AI Insights · Predictive Analytics</div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-none flex items-center gap-2">
              <span className="text-bingo-black">תובנות חכמות</span>
              <span className="text-[12px] font-black tabular-nums px-2 py-0.5 rounded-lg text-gradient-bingo bg-bingo-green/10 border border-bingo-green/25">{hotLeads.length + atRisk.length} תובנות</span>
            </h1>
            <p className="text-[12px] text-bingo-gray-600 mt-1.5">ML מנבא איזה לידים יסגרו, אילו לקוחות בסיכון נטישה, ומה צפוי לקרות החודש</p>
          </div>
        </div>
      </div>

      {/* Forecast */}
      <div className="rounded-3xl bg-gradient-to-bl from-status-purple/10 to-white border-2 border-status-purple/30 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="size-12 rounded-2xl bg-status-purple text-white inline-flex items-center justify-center">
            <Sparkles className="size-6" />
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-status-purple">תחזית חודש מאי</div>
            <h2 className="text-xl font-extrabold text-bingo-black">צפי סגירות החודש</h2>
          </div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <ForecastTile label="סגירות צפויות" value="47" sub="ביטחון 87%" color="green" />
          <ForecastTile label="היקף הלוואות צפוי" value="₪3.2M" sub="±420K" color="blue" />
          <ForecastTile label="הכנסה צפויה" value="₪127K" sub="כולל מע״מ" color="orange" />
          <ForecastTile label="ROI צפוי" value="312%" sub="vs הוצאות שיווק" color="green" />
        </div>
      </div>

      {/* Hot Leads */}
      <div className="rounded-3xl bg-white border border-bingo-gray-200 bingo-shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-bingo-gray-100">
          <div className="flex items-center gap-2 mb-1">
            <Target className="size-5 text-status-red" />
            <h2 className="text-base font-extrabold text-bingo-black">Hot Leads - הסיכוי הגבוה לסגור</h2>
          </div>
          <p className="text-[11px] text-bingo-gray-600">ML חישב סבירות סגירה לפי 47 פרמטרים</p>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-bingo-gray-50/40">
            <tr className="text-right text-[10px] font-bold uppercase tracking-wider text-bingo-gray-500 border-b border-bingo-gray-100">
              <th className="px-5 py-3 w-12">דירוג</th>
              <th className="px-3 py-3">לקוח</th>
              <th className="px-3 py-3">סבירות סגירה</th>
              <th className="px-3 py-3">סכום צפוי</th>
              <th className="px-3 py-3">פעולה מומלצת</th>
            </tr>
          </thead>
          <tbody>
            {hotLeads.map((l, i) => (
              <tr key={l.id} className="border-b border-bingo-gray-100 last:border-0 hover:bg-bingo-green/[0.03]">
                <td className="px-5 py-3">
                  <span className={cn("size-7 rounded-md inline-flex items-center justify-center font-bold text-xs", l.score >= 90 ? "bg-status-red text-white" : l.score >= 80 ? "bg-status-orange text-white" : "bg-status-yellow text-amber-900")}>
                    {i + 1}
                  </span>
                </td>
                <td className="px-3 py-3">
                  <Link href={`/leads/${l.id}`} className="flex items-center gap-2.5 hover:text-bingo-green-dark">
                    <Avatar name={l.fullName} size="sm" />
                    <span className="text-[13px] font-bold text-bingo-black">{l.fullName}</span>
                  </Link>
                </td>
                <td className="px-3 py-3 min-w-[180px]">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-bingo-gray-100 rounded-full overflow-hidden">
                      <div className={cn("h-full rounded-full", l.score >= 90 ? "bg-status-red" : l.score >= 80 ? "bg-status-orange" : "bg-bingo-green")} style={{ width: `${l.score}%` }} />
                    </div>
                    <span className="text-[13px] font-mono tabular-nums font-extrabold w-9 text-right">{l.score}%</span>
                  </div>
                </td>
                <td className="px-3 py-3 text-[12px] font-mono tabular-nums font-bold text-bingo-charcoal">{formatCurrency(l.amountRequested || 50000)}</td>
                <td className="px-3 py-3">
                  <span className="text-[11px] font-bold text-bingo-green-dark bg-bingo-green/15 rounded-full px-2.5 py-1">📞 התקשר עכשיו</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* At Risk */}
      <div className="rounded-3xl bg-white border border-bingo-gray-200 bingo-shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-bingo-gray-100">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="size-5 text-status-orange" />
            <h2 className="text-base font-extrabold text-bingo-black">Churn Risk - לידים שבסיכון לעזוב</h2>
          </div>
          <p className="text-[11px] text-bingo-gray-600">חישוב מבוסס: זמן בשלב, חוסר תקשורת, ערוצים נטושים</p>
        </div>
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
          {atRisk.map((l) => (
            <Link key={l.id} href={`/leads/${l.id}`} className="rounded-2xl border border-status-orange/30 bg-status-orange-soft/30 hover:bg-status-orange-soft p-3 transition flex items-center gap-3 group">
              <Avatar name={l.fullName} size="md" />
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-extrabold text-bingo-black truncate">{l.fullName}</div>
                <div className="text-[11px] text-bingo-charcoal mt-0.5">סיכון: <strong>{l.churnRisk}%</strong> · 4 ימים בלי תגובה</div>
              </div>
              <ChevronLeft className="size-4 text-bingo-gray-400 group-hover:text-bingo-charcoal" />
            </Link>
          ))}
        </div>
      </div>

      {/* AI Recommendations */}
      <div className="rounded-3xl bg-gradient-to-bl from-bingo-green/10 to-white border-2 border-bingo-green/30 p-5">
        <h2 className="text-lg font-extrabold text-bingo-black mb-3 inline-flex items-center gap-2"><Sparkles className="size-5 text-bingo-green-dark" /> המלצות AI לשבוע הקרוב</h2>
        <div className="space-y-2">
          {[
            { text: "12 לידים מעל 70% הצלחה - שווה לתת להם עדיפות בתותח השיחות", action: "פתח בתותח" },
            { text: "ביצועי 'יוני קיטל' ירדו ב-22% בשבוע - בדוק הקלטות אחרונות", action: "פתח דשבורד" },
            { text: "מקור 'TikTok' המיר הרבה יותר טוב החודש (24% vs 14%) - שווה להגדיל תקציב", action: "פתח דוחות" },
            { text: "5 לידים סגורים שייתכן ויחזרו לאשראי תוך 60 יום", action: "Drip Campaign" },
          ].map((rec, i) => (
            <div key={i} className="flex items-center justify-between gap-3 p-3 rounded-xl bg-white border border-bingo-green/20">
              <div className="text-[13px] text-bingo-charcoal leading-relaxed">{rec.text}</div>
              <button className="h-8 px-3 rounded-lg bg-bingo-green text-bingo-black text-[11px] font-bold hover:bg-bingo-green-bright transition shrink-0">{rec.action}</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ForecastTile({ label, value, sub, color }: { label: string; value: string; sub: string; color: "green" | "blue" | "orange" }) {
  const palette = {
    green: "from-bingo-green/15 to-bingo-green/5 border-bingo-green/40",
    blue: "from-status-blue/12 to-status-blue/3 border-status-blue/25",
    orange: "from-status-orange/12 to-status-orange/3 border-status-orange/25",
  }[color];
  return (
    <div className={`rounded-2xl bg-gradient-to-bl border p-4 ${palette}`}>
      <div className="text-[10px] font-bold uppercase tracking-wider text-bingo-gray-600">{label}</div>
      <div className="text-3xl font-black text-bingo-black tabular-nums mt-1 leading-none">{value}</div>
      <div className="text-[10px] text-bingo-gray-500 mt-0.5">{sub}</div>
    </div>
  );
}
