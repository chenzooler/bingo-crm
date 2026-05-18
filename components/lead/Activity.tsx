"use client";
import * as React from "react";
import { Phone, MessageCircle, Mail, Camera, AlignLeft, Check, Clock, Plus } from "lucide-react";
import type { Activity, ActivityType } from "@/lib/types";
import { getUser } from "@/lib/data/static";
import { Avatar } from "@/components/ui/Avatar";
import { formatDate, cn } from "@/lib/utils";

const FILTERS: { key: ActivityType | "all"; icon: React.ReactNode; label: string }[] = [
  { key: "all", icon: <span className="text-[10px] font-bold">הכל</span>, label: "הצג הכל" },
  { key: "note", icon: <AlignLeft className="size-3.5" />, label: "הערות" },
  { key: "call-out", icon: <Phone className="size-3.5" />, label: "שיחות" },
  { key: "whatsapp", icon: <MessageCircle className="size-3.5" />, label: "WhatsApp" },
  { key: "email", icon: <Mail className="size-3.5" />, label: "אימייל" },
  { key: "task", icon: <Check className="size-3.5" />, label: "משימות" },
  { key: "reminder", icon: <Clock className="size-3.5" />, label: "תזכורות" },
];

const TYPE_ICON: Record<string, React.ReactNode> = {
  note: <AlignLeft className="size-3" />,
  "call-out": <Phone className="size-3" />,
  "call-in": <Phone className="size-3" />,
  whatsapp: <MessageCircle className="size-3" />,
  sms: <MessageCircle className="size-3" />,
  email: <Mail className="size-3" />,
  "status-change": <AlignLeft className="size-3" />,
  task: <Check className="size-3" />,
  reminder: <Clock className="size-3" />,
  "form-sign": <Check className="size-3" />,
};

export function ActivityTimeline({ activities }: { activities: Activity[] }) {
  const [filter, setFilter] = React.useState<ActivityType | "all">("all");
  const filtered = filter === "all" ? activities : activities.filter((a) => a.type === filter);

  return (
    <div>
      <div className="flex items-center justify-between mb-3 pb-3 border-b border-bingo-gray-100">
        <h2 className="text-base font-extrabold text-bingo-black">משימות ופעילויות</h2>
        <button className="h-8 px-3 rounded-lg bg-bingo-green text-bingo-black text-xs font-bold inline-flex items-center gap-1 hover:bg-bingo-green-light transition">
          <Plus className="size-3" /> הוספה
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-1 mb-3">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            title={f.label}
            className={cn(
              "size-8 rounded-lg inline-flex items-center justify-center transition border",
              filter === f.key
                ? "bg-bingo-green text-bingo-black border-bingo-green"
                : "bg-white text-bingo-gray-600 border-bingo-gray-200 hover:border-bingo-gray-300"
            )}
          >
            {f.icon}
          </button>
        ))}
      </div>

      <ul className="relative">
        {filtered.map((a, i) => {
          const author = getUser(a.authorId);
          return (
            <li
              key={a.id}
              className={cn(
                "flex gap-3 py-3 border-b border-bingo-gray-100 last:border-0",
                i === 0 && "border-r-4 border-r-bingo-green pr-3 -mr-3 bg-bingo-green/[0.04] rounded-r-lg"
              )}
            >
              <div className="text-[11px] font-bold text-bingo-gray-500 w-20 shrink-0">{formatDate(a.date)}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-1">
                  <Avatar size="sm" name={author?.name || ""} emoji={author?.emoji} />
                  <span className="text-xs font-bold text-bingo-charcoal">{author?.name}</span>
                  <ActivityIcon type={a.type} />
                </div>
                <div className="text-sm text-bingo-charcoal leading-relaxed">{a.text}</div>
                {a.durationSec && (
                  <div className="text-[11px] text-bingo-gray-500 mt-1 flex items-center gap-1">
                    <Phone className="size-3" />
                    משך שיחה: {a.durationSec} שניות
                  </div>
                )}
              </div>
            </li>
          );
        })}
        {filtered.length === 0 && (
          <li className="py-12 text-center text-sm text-bingo-gray-500">אין פעילויות</li>
        )}
      </ul>
    </div>
  );
}

function ActivityIcon({ type }: { type: ActivityType }) {
  const cls: Record<string, string> = {
    note: "bg-bingo-gray-100 text-bingo-gray-600",
    "call-out": "bg-status-blue/15 text-status-blue",
    "call-in": "bg-status-green/15 text-status-green",
    whatsapp: "bg-emerald-100 text-emerald-700",
    sms: "bg-status-yellow/30 text-amber-700",
    email: "bg-status-purple/15 text-status-purple",
    "status-change": "bg-bingo-gray-100 text-bingo-gray-600",
    task: "bg-status-orange/15 text-status-orange",
    reminder: "bg-status-pink/15 text-status-pink",
    "form-sign": "bg-bingo-green/20 text-bingo-green-dark",
  };
  return (
    <span className={cn("inline-flex items-center justify-center size-5 rounded-full", cls[type] || cls.note)}>
      {TYPE_ICON[type] || TYPE_ICON.note}
    </span>
  );
}
