"use client";
import * as React from "react";
import { NUMBER_POOL } from "@/lib/data/live-state";
import { Phone, Plus, Shield, AlertTriangle, CheckCircle2, Coffee, RotateCw, Trash2 } from "lucide-react";
import { cn, formatTime } from "@/lib/utils";

export default function NumbersSettingsPage() {
  const activeCount = NUMBER_POOL.filter((n) => n.status === "active").length;
  const warningCount = NUMBER_POOL.filter((n) => n.status === "warning").length;
  const spamCount = NUMBER_POOL.filter((n) => n.status === "spam-risk").length;
  const restingCount = NUMBER_POOL.filter((n) => n.status === "resting").length;
  const totalCalls = NUMBER_POOL.reduce((s, n) => s + n.todayCalls, 0);

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-3xl border border-bingo-gray-200 bingo-shadow-sm p-6">
        <div className="text-[10px] font-bold uppercase tracking-wider text-bingo-gray-500">מרכזיה</div>
        <h2 className="text-xl font-extrabold text-bingo-black">מאגר מספרי טלפון + הגנת ספאם</h2>
        <p className="text-[12px] text-bingo-gray-600 mt-1 leading-relaxed">
          ניהול חכם של מספרי הטלפון - חיוג מסתובב, מעקב reputation, הגנה אוטומטית מסטטוס ספאם.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <NumStat icon={<Phone className="size-4" />} label="סה״כ מספרים" value={NUMBER_POOL.length.toString()} color="blue" />
        <NumStat icon={<CheckCircle2 className="size-4" />} label="פעילים" value={activeCount.toString()} color="green" />
        <NumStat icon={<AlertTriangle className="size-4" />} label="באזהרה" value={warningCount.toString()} color="orange" />
        <NumStat icon={<Shield className="size-4" />} label="בסיכון ספאם" value={spamCount.toString()} color="red" />
        <NumStat icon={<Coffee className="size-4" />} label="במנוחה" value={restingCount.toString()} color="gray" />
      </div>

      {/* Rotation strategy */}
      <div className="rounded-3xl bg-gradient-to-bl from-bingo-green/10 to-white border border-bingo-green/30 p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="size-10 rounded-xl bg-bingo-green text-bingo-black inline-flex items-center justify-center">
            <RotateCw className="size-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-bingo-black">אסטרטגיית חיוג חכמה</h3>
            <p className="text-[11px] text-bingo-gray-600 mt-0.5">איך המערכת בוחרת איזה מספר לחייג ממנו</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[12px] text-bingo-charcoal">
          <div className="bg-white rounded-xl p-3 border border-bingo-gray-100">
            <div className="font-extrabold mb-1">🆕 ליד חדש (שיחה #1)</div>
            מספר עם reputation גבוה (90+), פחות מ-20 שיחות היום
          </div>
          <div className="bg-white rounded-xl p-3 border border-bingo-gray-100">
            <div className="font-extrabold mb-1">🔁 שיחה חוזרת (#2-3)</div>
            מספר שונה מהקודמת - מונע "תייוג ספאם" של אותו מספר
          </div>
          <div className="bg-white rounded-xl p-3 border border-bingo-gray-100">
            <div className="font-extrabold mb-1">💚 לקוח מתקדם בתהליך</div>
            <strong>תמיד אותו מספר</strong> - הלקוח מזהה אותנו
          </div>
          <div className="bg-white rounded-xl p-3 border border-bingo-gray-100">
            <div className="font-extrabold mb-1">⚠️ הגנת ספאם אוטומטית</div>
            מספר שמגיע ל-80 שיחות/יום → "מנוחה" של 24 שעות
          </div>
        </div>
      </div>

      {/* Numbers list */}
      <div className="rounded-3xl bg-white border border-bingo-gray-200 bingo-shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-bingo-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-extrabold text-bingo-black">מספרי המוקד</h3>
            <p className="text-[11px] text-bingo-gray-600 mt-0.5">{totalCalls} שיחות היום מכל המספרים יחד</p>
          </div>
          <button className="h-9 px-3 rounded-xl bg-bingo-black text-white text-xs font-bold inline-flex items-center gap-1.5 hover:bg-bingo-charcoal">
            <Plus className="size-3.5" /> רכוש מספר חדש
          </button>
        </div>

        <table className="w-full text-sm">
          <thead className="bg-bingo-gray-50/40">
            <tr className="text-right text-[10px] font-bold uppercase tracking-wider text-bingo-gray-500 border-b border-bingo-gray-100">
              <th className="px-5 py-3">מספר</th>
              <th className="px-3 py-3">סטטוס</th>
              <th className="px-3 py-3">Reputation</th>
              <th className="px-3 py-3">שיחות היום</th>
              <th className="px-3 py-3">% מהמכסה</th>
              <th className="px-3 py-3">שימוש אחרון</th>
              <th className="px-3 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {NUMBER_POOL.map((n) => {
              const statusMeta = NUM_STATUS[n.status as keyof typeof NUM_STATUS];
              const quotaPct = Math.round((n.todayCalls / 80) * 100);
              return (
                <tr key={n.number} className="border-b border-bingo-gray-100 last:border-0 hover:bg-bingo-green/[0.03] group">
                  <td className="px-5 py-3 font-mono tabular-nums text-[13px] font-extrabold text-bingo-black" dir="ltr">{n.number}</td>
                  <td className="px-3 py-3">
                    <span className={cn("inline-flex items-center gap-1 text-[10px] font-bold rounded-full px-2 py-0.5 border", statusMeta.color)}>
                      {statusMeta.icon}
                      {statusMeta.label}
                    </span>
                  </td>
                  <td className="px-3 py-3 min-w-[120px]">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-bingo-gray-100 rounded-full overflow-hidden">
                        <div className={cn("h-full rounded-full", n.reputation >= 80 ? "bg-bingo-green-dark" : n.reputation >= 60 ? "bg-status-yellow" : "bg-status-red")} style={{ width: `${n.reputation}%` }} />
                      </div>
                      <span className="text-[11px] font-mono tabular-nums font-bold w-8 text-right">{n.reputation}</span>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-[13px] font-mono tabular-nums font-bold text-bingo-charcoal">{n.todayCalls}/80</td>
                  <td className="px-3 py-3 min-w-[100px]">
                    <div className="h-1.5 bg-bingo-gray-100 rounded-full overflow-hidden">
                      <div className={cn("h-full rounded-full", quotaPct >= 90 ? "bg-status-red" : quotaPct >= 70 ? "bg-status-orange" : "bg-bingo-green")} style={{ width: `${quotaPct}%` }} />
                    </div>
                  </td>
                  <td className="px-3 py-3 text-[11px] font-mono tabular-nums text-bingo-gray-600">{formatTime(n.lastUsed)}</td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition justify-end">
                      <button title="הגדרות" className="size-7 rounded-md hover:bg-bingo-gray-100 text-bingo-gray-500 inline-flex items-center justify-center">
                        <Shield className="size-3.5" />
                      </button>
                      <button title="הסר" className="size-7 rounded-md hover:bg-status-red/10 text-bingo-gray-500 hover:text-status-red inline-flex items-center justify-center">
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
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

const NUM_STATUS = {
  active: { label: "פעיל", icon: <CheckCircle2 className="size-3" />, color: "bg-bingo-green/15 text-bingo-green-dark border-bingo-green/40" },
  warning: { label: "אזהרה", icon: <AlertTriangle className="size-3" />, color: "bg-status-orange-soft text-orange-700 border-status-orange/40" },
  "spam-risk": { label: "סיכון ספאם", icon: <Shield className="size-3" />, color: "bg-status-red-soft text-status-red border-status-red/40" },
  resting: { label: "במנוחה", icon: <Coffee className="size-3" />, color: "bg-bingo-gray-100 text-bingo-gray-700 border-bingo-gray-200" },
};

function NumStat({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: "green" | "blue" | "orange" | "red" | "gray" }) {
  const palette = {
    green: "from-bingo-green/15 to-bingo-green/5 border-bingo-green/40 text-bingo-green-dark",
    blue: "from-status-blue/12 to-status-blue/3 border-status-blue/25 text-status-blue",
    orange: "from-status-orange/12 to-status-orange/3 border-status-orange/25 text-orange-700",
    red: "from-status-red/12 to-status-red/3 border-status-red/25 text-status-red",
    gray: "from-bingo-gray-100 to-bingo-gray-50 border-bingo-gray-200 text-bingo-gray-700",
  }[color];
  return (
    <div className={`rounded-2xl bg-gradient-to-bl border p-3 ${palette}`}>
      <div className="size-8 rounded-lg inline-flex items-center justify-center bg-white/60">{icon}</div>
      <div className="text-2xl font-black text-bingo-black tabular-nums mt-1.5 leading-none">{value}</div>
      <div className="text-[10px] font-bold mt-0.5">{label}</div>
    </div>
  );
}
