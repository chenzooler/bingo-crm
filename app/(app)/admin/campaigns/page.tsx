"use client";
import { Megaphone, Plus, TrendingUp, MessageCircle, Mail, Users, Play, Pause } from "lucide-react";

const CAMPAIGNS = [
  { name: "60 ימים - הצעת חידוש", channel: "WhatsApp", sent: 67, opened: 51, replied: 14, converted: 8, status: "active" },
  { name: "ברוכים הבאים", channel: "Email", sent: 423, opened: 312, replied: 89, converted: 34, status: "active" },
  { name: "תזכורת חתימה", channel: "WhatsApp", sent: 89, opened: 84, replied: 67, converted: 51, status: "active" },
  { name: "Black Friday 2026", channel: "WhatsApp", sent: 1247, opened: 891, replied: 312, converted: 87, status: "completed" },
  { name: "סקר שביעות רצון", channel: "Email", sent: 0, opened: 0, replied: 0, converted: 0, status: "draft" },
];

export default function CampaignsPage() {
  const active = CAMPAIGNS.filter((c) => c.status === "active").length;
  const totalSent = CAMPAIGNS.reduce((s, c) => s + c.sent, 0);
  const totalConverted = CAMPAIGNS.reduce((s, c) => s + c.converted, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-bingo-black inline-flex items-center gap-2"><Megaphone className="size-5" /> Drip Campaigns</h2>
          <p className="text-[12px] text-bingo-gray-600 mt-1">קמפיינים אוטומטיים - WhatsApp, SMS, Email</p>
        </div>
        <button className="h-10 px-4 rounded-xl bg-bingo-black text-white text-sm font-bold inline-flex items-center gap-1.5 hover:bg-bingo-charcoal">
          <Plus className="size-4" /> קמפיין חדש
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-2xl bg-gradient-to-bl from-bingo-green/15 to-bingo-green/5 border border-bingo-green/40 p-4">
          <Users className="size-5 text-bingo-green-dark" />
          <div className="text-3xl font-black tabular-nums mt-2">{active}</div>
          <div className="text-[11px] font-bold text-bingo-green-dark">קמפיינים פעילים</div>
        </div>
        <div className="rounded-2xl bg-gradient-to-bl from-status-blue/12 to-status-blue/3 border border-status-blue/25 p-4">
          <MessageCircle className="size-5 text-status-blue" />
          <div className="text-3xl font-black tabular-nums mt-2">{totalSent.toLocaleString()}</div>
          <div className="text-[11px] font-bold text-status-blue">הודעות נשלחו</div>
        </div>
        <div className="rounded-2xl bg-gradient-to-bl from-status-orange/12 to-status-orange/3 border border-status-orange/25 p-4">
          <TrendingUp className="size-5 text-orange-700" />
          <div className="text-3xl font-black tabular-nums mt-2">{totalConverted}</div>
          <div className="text-[11px] font-bold text-orange-700">הומרו</div>
        </div>
      </div>

      <div className="space-y-3">
        {CAMPAIGNS.map((c, i) => (
          <div key={i} className="rounded-3xl bg-white border border-bingo-gray-200 p-5">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg font-extrabold text-bingo-black">{c.name}</h3>
                  <span className={`text-[10px] font-bold rounded-full px-2 py-0.5 ${
                    c.status === "active" ? "bg-bingo-green/15 text-bingo-green-dark" :
                    c.status === "draft" ? "bg-bingo-gray-100 text-bingo-gray-600" :
                    "bg-status-blue-soft text-status-blue"
                  }`}>
                    {c.status === "active" ? "פעיל" : c.status === "draft" ? "טיוטה" : "הסתיים"}
                  </span>
                  <span className="text-[10px] font-bold bg-bingo-gray-100 text-bingo-gray-700 rounded-full px-2 py-0.5">{c.channel}</span>
                </div>
              </div>
              <button className="size-9 rounded-xl bg-bingo-gray-100 hover:bg-bingo-gray-200 inline-flex items-center justify-center">
                {c.status === "active" ? <Pause className="size-4" /> : <Play className="size-4" />}
              </button>
            </div>
            {c.sent > 0 && (
              <div className="grid grid-cols-4 gap-3">
                <Metric label="נשלחו" value={c.sent} />
                <Metric label="נפתחו" value={c.opened} pct={Math.round((c.opened / c.sent) * 100)} />
                <Metric label="הגיבו" value={c.replied} pct={Math.round((c.replied / c.sent) * 100)} />
                <Metric label="הומרו" value={c.converted} pct={Math.round((c.converted / c.sent) * 100)} highlight />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function Metric({ label, value, pct, highlight }: { label: string; value: number; pct?: number; highlight?: boolean }) {
  return (
    <div>
      <div className="text-[10px] font-bold uppercase tracking-wider text-bingo-gray-500">{label}</div>
      <div className="flex items-baseline gap-1.5">
        <span className={`text-2xl font-black tabular-nums ${highlight ? "text-bingo-green-dark" : "text-bingo-black"}`}>{value}</span>
        {pct !== undefined && <span className="text-[11px] font-mono tabular-nums text-bingo-gray-500">{pct}%</span>}
      </div>
    </div>
  );
}
