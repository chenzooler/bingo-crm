"use client";
import { Gift, TrendingUp, Users, DollarSign, Copy, Share2, Sparkles } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Icon3D } from "@/components/ui/Icon3D";
import { LEADS } from "@/lib/data/leads";
import { formatCurrency } from "@/lib/utils";

const REFERRERS = LEADS.slice(0, 8).map((l, i) => ({
  ...l,
  referrals: 5 - Math.floor(i / 2),
  earnings: (5 - Math.floor(i / 2)) * 250,
  conversionRate: 80 - i * 7,
}));

export default function ReferralsPage() {
  return (
    <div className="max-w-[1400px] space-y-4">
      <div className="relative rounded-3xl bg-white border border-bingo-gray-200 p-5 overflow-hidden" style={{ boxShadow: "0 2px 4px -1px rgba(0,0,0,0.03), 0 8px 24px -6px rgba(46, 161, 13, 0.10)" }}>
        <div className="flex items-center gap-4">
          <Icon3D icon={<Users className="size-6" />} tone="pink" size={56} />
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-bingo-gray-500 mb-1">תוכנית חברים מביאים חברים</div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-none flex items-center gap-2">
              <span className="text-bingo-black">מערכת רפרל</span>
              <span className="text-[12px] font-black tabular-nums px-2 py-0.5 rounded-lg text-gradient-bingo bg-bingo-green/10 border border-bingo-green/25">{REFERRERS.length} ממליצים</span>
            </h1>
            <p className="text-[12px] text-bingo-gray-600 mt-1.5">לקוחות מרוצים מביאים לידים חדשים - תמורת תגמול</p>
          </div>
        </div>
      </div>

      {/* Hero stats */}
      <div className="rounded-3xl bg-gradient-to-bl from-bingo-onyx to-bingo-charcoal text-white p-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <HeroStat icon={<Users className="size-5" />} label="לקוחות עם רפרלים" value="47" sub="פעילים החודש" />
          <HeroStat icon={<TrendingUp className="size-5" />} label="לידים מרפרלים" value="124" sub="ב-30 ימים" highlight />
          <HeroStat icon={<DollarSign className="size-5" />} label="תגמולים שולמו" value={formatCurrency(31000)} sub="החודש" />
          <HeroStat icon={<Sparkles className="size-5" />} label="המרה ממוצעת" value="68%" sub="פי 3 מ-Facebook" />
        </div>
      </div>

      {/* Settings */}
      <div className="rounded-3xl bg-white border border-bingo-gray-200 bingo-shadow-sm p-5">
        <h2 className="text-base font-extrabold text-bingo-black mb-3">תוכנית התגמולים</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="rounded-2xl bg-gradient-to-bl from-bingo-green/15 to-bingo-green/5 border border-bingo-green/40 p-4">
            <div className="text-[10px] font-bold uppercase tracking-wider text-bingo-green-dark mb-1">תגמול הממליץ</div>
            <div className="text-2xl font-black text-bingo-black">₪250</div>
            <div className="text-[11px] text-bingo-gray-600 mt-0.5">על כל ליד שסוגר</div>
          </div>
          <div className="rounded-2xl bg-gradient-to-bl from-status-blue/12 to-status-blue/3 border border-status-blue/25 p-4">
            <div className="text-[10px] font-bold uppercase tracking-wider text-status-blue mb-1">הטבה ללקוח חדש</div>
            <div className="text-2xl font-black text-bingo-black">10%</div>
            <div className="text-[11px] text-bingo-gray-600 mt-0.5">הנחה בשכ״ט</div>
          </div>
          <div className="rounded-2xl bg-gradient-to-bl from-status-purple/12 to-status-purple/3 border border-status-purple/25 p-4">
            <div className="text-[10px] font-bold uppercase tracking-wider text-status-purple mb-1">בונוס Top Referrer</div>
            <div className="text-2xl font-black text-bingo-black">₪1,500</div>
            <div className="text-[11px] text-bingo-gray-600 mt-0.5">5+ רפרלים בחודש</div>
          </div>
        </div>
      </div>

      {/* Top referrers */}
      <div className="rounded-3xl bg-white border border-bingo-gray-200 bingo-shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-bingo-gray-100">
          <h2 className="text-base font-extrabold text-bingo-black inline-flex items-center gap-2"><Sparkles className="size-4 text-amber-500" /> Top Referrers</h2>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-bingo-gray-50/40">
            <tr className="text-right text-[10px] font-bold uppercase tracking-wider text-bingo-gray-500 border-b border-bingo-gray-100">
              <th className="px-5 py-3">לקוח</th>
              <th className="px-3 py-3">רפרלים</th>
              <th className="px-3 py-3">המרה</th>
              <th className="px-3 py-3">תגמול מצטבר</th>
              <th className="px-3 py-3">קישור אישי</th>
            </tr>
          </thead>
          <tbody>
            {REFERRERS.map((r) => (
              <tr key={r.id} className="border-b border-bingo-gray-100 last:border-0 hover:bg-bingo-green/[0.03] group">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2.5">
                    <Avatar name={r.fullName} size="sm" />
                    <span className="text-[13px] font-bold text-bingo-black">{r.fullName}</span>
                  </div>
                </td>
                <td className="px-3 py-3 text-[13px] font-mono tabular-nums font-extrabold text-bingo-black">{r.referrals}</td>
                <td className="px-3 py-3 text-[12px] font-mono tabular-nums font-bold text-bingo-green-dark">{r.conversionRate}%</td>
                <td className="px-3 py-3 text-[13px] font-mono tabular-nums font-extrabold text-bingo-green-dark">{formatCurrency(r.earnings)}</td>
                <td className="px-3 py-3">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-mono bg-bingo-gray-100 rounded px-2 py-1 text-bingo-charcoal" dir="ltr">bingo.com/r/{r.id}</span>
                    <button className="size-7 rounded-md hover:bg-bingo-gray-100 text-bingo-gray-500 inline-flex items-center justify-center" title="העתק">
                      <Copy className="size-3" />
                    </button>
                    <button className="size-7 rounded-md hover:bg-bingo-gray-100 text-bingo-gray-500 inline-flex items-center justify-center" title="שתף">
                      <Share2 className="size-3" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function HeroStat({ icon, label, value, sub, highlight }: { icon: React.ReactNode; label: string; value: string; sub: string; highlight?: boolean }) {
  return (
    <div className={`rounded-2xl ${highlight ? "bg-bingo-green/20" : "bg-white/10"} backdrop-blur p-3.5`}>
      <div className="size-9 rounded-lg bg-white/20 inline-flex items-center justify-center">{icon}</div>
      <div className="text-[10px] uppercase tracking-wider opacity-60 mt-2">{label}</div>
      <div className="text-3xl font-black tabular-nums leading-none mt-1">{value}</div>
      <div className="text-[11px] opacity-70 mt-1">{sub}</div>
    </div>
  );
}
