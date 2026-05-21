"use client";
import * as React from "react";
import { Phone, MessageCircle, CheckCircle2, FileText, UserPlus, DollarSign, Building2, Sparkles } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { cn } from "@/lib/utils";

type ActivityType = "call" | "whatsapp" | "deal-closed" | "doc-uploaded" | "lead-new" | "payment" | "lender-approved" | "ai-action";

interface Activity {
  id: string;
  type: ActivityType;
  agent: { name: string; emoji?: string };
  text: string;
  highlight?: string;
  time: string; // relative
}

const ACTIVITIES: Activity[] = [
  { id: "a1", type: "deal-closed", agent: { name: "מאיה לוי", emoji: "🌟" }, text: "סגרה עסקה ", highlight: "₪180,000", time: "לפני 2 דק'" },
  { id: "a2", type: "call", agent: { name: "אורי כהן", emoji: "📞" }, text: "סיים שיחה של 12 דק' עם דנה שטרן", time: "לפני 5 דק'" },
  { id: "a3", type: "lender-approved", agent: { name: "MFK" }, text: "אישרה הלוואה ל-יואב פרי ", highlight: "₪95,000", time: "לפני 8 דק'" },
  { id: "a4", type: "whatsapp", agent: { name: "רותם בן-דוד", emoji: "💬" }, text: "שלח WhatsApp ל-7 לידים", time: "לפני 11 דק'" },
  { id: "a5", type: "lead-new", agent: { name: "מערכת", emoji: "🤖" }, text: "ליד חדש מטופס: ", highlight: "אבי גולד", time: "לפני 14 דק'" },
  { id: "a6", type: "ai-action", agent: { name: "AI Co-pilot", emoji: "✨" }, text: "המליץ על 3 לידים חמים לחיוג", time: "לפני 17 דק'" },
  { id: "a7", type: "doc-uploaded", agent: { name: "תמר רז", emoji: "📄" }, text: "העלתה תלוש שכר ל-לקוח", time: "לפני 22 דק'" },
  { id: "a8", type: "payment", agent: { name: "מערכת" }, text: "תשלום עמלה התקבל ", highlight: "₪3,200", time: "לפני 28 דק'" },
];

const TYPE_META: Record<ActivityType, { icon: React.ComponentType<{ className?: string }>; bg: string; iconColor: string }> = {
  call: { icon: Phone, bg: "bg-status-blue/12", iconColor: "text-status-blue" },
  whatsapp: { icon: MessageCircle, bg: "bg-emerald-100", iconColor: "text-emerald-700" },
  "deal-closed": { icon: CheckCircle2, bg: "bg-bingo-green/15", iconColor: "text-bingo-green-dark" },
  "doc-uploaded": { icon: FileText, bg: "bg-status-orange/12", iconColor: "text-orange-700" },
  "lead-new": { icon: UserPlus, bg: "bg-status-purple/12", iconColor: "text-status-purple" },
  payment: { icon: DollarSign, bg: "bg-bingo-green/15", iconColor: "text-bingo-green-dark" },
  "lender-approved": { icon: Building2, bg: "bg-status-yellow/15", iconColor: "text-amber-700" },
  "ai-action": { icon: Sparkles, bg: "bg-bingo-black", iconColor: "text-bingo-green" },
};

export function LiveActivityFeed() {
  return (
    <div className="surface-card-elevated overflow-hidden">
      <div className="px-5 py-3 border-b border-bingo-gray-150 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-extrabold text-bingo-black">פיד פעילות חי</h3>
          <p className="text-[10px] text-bingo-gray-500">כל מה שקורה בארגון בזמן אמת</p>
        </div>
        <span className="text-[9px] font-bold uppercase tracking-wider text-bingo-green-dark bg-bingo-green/15 px-2 py-1 rounded-md inline-flex items-center gap-1">
          <span className="size-1.5 rounded-full bg-bingo-green animate-pulse" />
          חי
        </span>
      </div>
      <div className="max-h-[420px] overflow-y-auto">
        {ACTIVITIES.map((a) => (
          <ActivityRow key={a.id} activity={a} />
        ))}
      </div>
    </div>
  );
}

function ActivityRow({ activity }: { activity: Activity }) {
  const meta = TYPE_META[activity.type];
  const Icon = meta.icon;

  return (
    <div className="px-4 py-2.5 flex items-start gap-2.5 border-b border-bingo-gray-100 last:border-0 hover:bg-bingo-gray-50/50 transition">
      <div className={cn("size-8 rounded-lg inline-flex items-center justify-center shrink-0 mt-0.5", meta.bg)}>
        <Icon className={cn("size-3.5", meta.iconColor)} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          <Avatar size="sm" name={activity.agent.name} emoji={activity.agent.emoji} />
          <span className="text-[12px] font-bold text-bingo-black truncate">{activity.agent.name}</span>
          <span className="text-[10px] text-bingo-gray-400 mr-auto whitespace-nowrap">{activity.time}</span>
        </div>
        <div className="text-[12px] text-bingo-charcoal leading-snug">
          {activity.text}
          {activity.highlight && (
            <span className="font-extrabold text-bingo-green-dark tabular-nums">{activity.highlight}</span>
          )}
        </div>
      </div>
    </div>
  );
}
