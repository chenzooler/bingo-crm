"use client";
import * as React from "react";
import { LEADS } from "@/lib/data/leads";
import { LIVE_AGENTS } from "@/lib/data/live-state";
import { Avatar } from "@/components/ui/Avatar";
import { MessageCircle, Search, AlertTriangle, Clock, CheckCircle2 } from "lucide-react";
import { cn, formatTime, relativeTime } from "@/lib/utils";

interface Convo {
  leadId: string;
  leadName: string;
  agentId: number;
  agentName: string;
  lastMessage: string;
  lastFromCustomer: boolean;
  lastTime: string;
  unreadByAgent: number;
  responseTime?: number; // seconds since customer's last message
  flagged?: "long-wait" | "unanswered" | null;
}

const today = Date.now();
const T = (offsetMin: number) => new Date(today - offsetMin * 60 * 1000).toISOString();

const CONVOS: Convo[] = LEADS.slice(0, 15).map((l, i) => {
  const agent = LIVE_AGENTS[i % LIVE_AGENTS.length];
  const offset = i * 13;
  const lastFromCustomer = i % 3 === 0;
  const flagged = i === 0 ? "long-wait" as const : i === 3 ? "unanswered" as const : null;
  return {
    leadId: l.id,
    leadName: l.fullName,
    agentId: agent.id,
    agentName: agent.name,
    lastMessage: [
      "מתי אקבל את הכסף בחשבון?",
      "תודה רבה, הוצאתי את הטופס",
      "אני צריך לחשוב על זה",
      "מה הריבית בדיוק?",
      "תודה!",
      "כן מעוניין להתקדם",
      "מתי אפשר לחתום?",
    ][i % 7],
    lastFromCustomer,
    lastTime: T(offset),
    unreadByAgent: lastFromCustomer && offset < 60 ? 1 + Math.floor(Math.random() * 3) : 0,
    responseTime: lastFromCustomer ? offset * 60 : undefined,
    flagged,
  };
});

export default function WATIManagerPage() {
  const [filter, setFilter] = React.useState<"all" | "unanswered" | "long-wait">("all");
  const filtered = CONVOS.filter((c) => {
    if (filter === "unanswered") return c.unreadByAgent > 0;
    if (filter === "long-wait") return c.flagged === "long-wait";
    return true;
  });

  const stats = {
    total: CONVOS.length,
    unanswered: CONVOS.filter((c) => c.unreadByAgent > 0).length,
    longWait: CONVOS.filter((c) => c.flagged === "long-wait").length,
    avgResponseMin: 8,
  };

  return (
    <div className="space-y-4">
      <div className="rounded-3xl bg-white border border-bingo-gray-200 bingo-shadow-sm p-6">
        <div className="text-[10px] font-bold uppercase tracking-wider text-bingo-gray-500">תקשורת</div>
        <h2 className="text-xl font-extrabold text-bingo-black inline-flex items-center gap-2">
          <MessageCircle className="size-5 text-emerald-600" /> WATI Monitor - מבט מנהלים
        </h2>
        <p className="text-[12px] text-bingo-gray-600 mt-1">כל ההודעות במוקד בזמן אמת. אזהרות על שיחות שלא נענו.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Kpi icon={<MessageCircle className="size-4" />} label="שיחות פעילות" value={stats.total} color="blue" />
        <Kpi icon={<AlertTriangle className="size-4" />} label="ממתינות לתשובה" value={stats.unanswered} color="red" highlight />
        <Kpi icon={<Clock className="size-4" />} label="המתנה ארוכה" value={stats.longWait} color="orange" />
        <Kpi icon={<CheckCircle2 className="size-4" />} label="זמן תגובה ממוצע" value={`${stats.avgResponseMin}ד׳`} color="green" />
      </div>

      <div className="rounded-3xl bg-white border border-bingo-gray-200 bingo-shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-bingo-gray-100 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-1 bg-bingo-gray-100 rounded-xl p-0.5">
            {([
              { v: "all" as const, l: "הכל" },
              { v: "unanswered" as const, l: `ממתינות (${stats.unanswered})` },
              { v: "long-wait" as const, l: `המתנה ארוכה (${stats.longWait})` },
            ]).map((opt) => (
              <button
                key={opt.v}
                onClick={() => setFilter(opt.v)}
                className={cn("h-8 px-3 rounded-lg text-[11px] font-bold transition", filter === opt.v ? "bg-white bingo-shadow-sm text-bingo-black" : "text-bingo-gray-500 hover:text-bingo-black")}
              >
                {opt.l}
              </button>
            ))}
          </div>
          <div className="relative w-64">
            <Search className="absolute right-2.5 top-1/2 -translate-y-1/2 size-3.5 text-bingo-gray-400" />
            <input placeholder="חפש לקוח / נציג..." className="h-9 w-full rounded-xl border border-bingo-gray-200 bg-white text-xs font-medium pr-8 pl-3 focus:border-bingo-green focus:outline-none focus:ring-2 focus:ring-bingo-green/15" />
          </div>
        </div>

        <table className="w-full text-sm">
          <thead className="bg-bingo-gray-50/40">
            <tr className="text-right text-[10px] font-bold uppercase tracking-wider text-bingo-gray-500 border-b border-bingo-gray-100">
              <th className="px-5 py-3">לקוח</th>
              <th className="px-3 py-3">נציג</th>
              <th className="px-3 py-3">הודעה אחרונה</th>
              <th className="px-3 py-3">זמן</th>
              <th className="px-3 py-3">סטטוס</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr key={c.leadId} className={cn(
                "border-b border-bingo-gray-100 last:border-0 hover:bg-bingo-green/[0.03] transition",
                c.flagged === "long-wait" && "bg-status-red/5"
              )}>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2.5">
                    <Avatar name={c.leadName} size="sm" />
                    <span className="text-[13px] font-bold text-bingo-black">{c.leadName}</span>
                  </div>
                </td>
                <td className="px-3 py-3">
                  <div className="flex items-center gap-2">
                    <Avatar name={c.agentName} size="sm" />
                    <span className="text-[12px] font-bold text-bingo-charcoal">{c.agentName}</span>
                  </div>
                </td>
                <td className="px-3 py-3 max-w-md">
                  <div className={cn("text-[12px] truncate flex items-center gap-1.5", c.lastFromCustomer ? "font-bold text-bingo-black" : "text-bingo-gray-600")}>
                    {c.lastFromCustomer && <span className="size-2 rounded-full bg-emerald-500 shrink-0" />}
                    {c.lastMessage}
                  </div>
                </td>
                <td className="px-3 py-3 text-[11px] font-mono tabular-nums text-bingo-gray-600 whitespace-nowrap">
                  {relativeTime(c.lastTime)}
                </td>
                <td className="px-3 py-3">
                  {c.flagged === "long-wait" && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-status-red bg-status-red-soft border border-status-red/30 rounded-full px-2 py-0.5">
                      <AlertTriangle className="size-3" /> המתנה ארוכה
                    </span>
                  )}
                  {c.flagged === "unanswered" && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-status-orange bg-status-orange-soft border border-status-orange/30 rounded-full px-2 py-0.5">
                      <Clock className="size-3" /> לא נענה
                    </span>
                  )}
                  {!c.flagged && c.unreadByAgent > 0 && (
                    <span className="text-[10px] font-bold text-status-blue bg-status-blue-soft border border-status-blue/30 rounded-full px-2 py-0.5">
                      {c.unreadByAgent} חדשות
                    </span>
                  )}
                  {!c.flagged && c.unreadByAgent === 0 && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-bingo-green-dark">
                      <CheckCircle2 className="size-3" /> בטיפול
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Kpi({ icon, label, value, color, highlight }: { icon: React.ReactNode; label: string; value: string | number; color: "green" | "blue" | "orange" | "red"; highlight?: boolean }) {
  const palette = {
    green: "from-bingo-green/15 to-bingo-green/5 border-bingo-green/40 text-bingo-green-dark",
    blue: "from-status-blue/12 to-status-blue/3 border-status-blue/25 text-status-blue",
    orange: "from-status-orange/12 to-status-orange/3 border-status-orange/25 text-orange-700",
    red: "from-status-red/12 to-status-red/3 border-status-red/25 text-status-red",
  }[color];
  return (
    <div className={cn(`rounded-2xl bg-gradient-to-bl border p-4 ${palette}`, highlight && "bingo-glow-soft")}>
      <div className="size-9 rounded-xl inline-flex items-center justify-center bg-white/60">{icon}</div>
      <div className="text-3xl font-black text-bingo-black tabular-nums leading-none mt-2">{value}</div>
      <div className="text-[11px] font-bold mt-1">{label}</div>
    </div>
  );
}
