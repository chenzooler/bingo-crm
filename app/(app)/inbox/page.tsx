"use client";
import * as React from "react";
import Link from "next/link";
import { LEADS } from "@/lib/data/leads";
import { Avatar } from "@/components/ui/Avatar";
import { MessageCircle, Mail, MessageSquare, Phone, Search, Filter, Send } from "lucide-react";
import { cn, formatTime } from "@/lib/utils";
import { Icon3D } from "@/components/ui/Icon3D";

type Channel = "all" | "whatsapp" | "sms" | "email" | "call";

interface Convo {
  leadId: string;
  leadName: string;
  channel: "whatsapp" | "sms" | "email" | "call";
  lastMessage: string;
  lastTime: string;
  unread: number;
  agentName?: string;
}

// Mock conversations
const CONVOS: Convo[] = LEADS.slice(0, 10).map((l, i) => {
  const channels = ["whatsapp", "whatsapp", "whatsapp", "sms", "email", "whatsapp", "call", "whatsapp", "sms", "whatsapp"] as const;
  const messages = [
    "שלום! ראיתי שיש לי אישור עקרוני, מתי אפשר להמשיך?",
    "אוקיי תודה, אצור איתך קשר מחר",
    "מה שכר הטרחה בדיוק?",
    "מתי מקבלים את הכסף?",
    "שלום, רציתי לבדוק לגבי הלוואה",
    "כן אני מעוניין להתקדם",
    "שיחה נכנסת - 2:34",
    "שלחתי לכם תלוש משכורת בוואטסאפ",
    "אישור סופי קיבל? ✓",
    "תודה רבה!",
  ];
  return {
    leadId: l.id,
    leadName: l.fullName,
    channel: channels[i],
    lastMessage: messages[i],
    lastTime: new Date(Date.now() - i * 1000 * 60 * 23).toISOString(),
    unread: i < 4 ? Math.max(0, Math.floor(Math.random() * 3) + 1) : 0,
  };
});

const CHANNEL_META = {
  whatsapp: { label: "WhatsApp", color: "bg-emerald-100 text-emerald-700", icon: <MessageCircle className="size-4" /> },
  sms: { label: "SMS", color: "bg-status-yellow-soft text-amber-700", icon: <MessageSquare className="size-4" /> },
  email: { label: "Email", color: "bg-status-blue-soft text-status-blue", icon: <Mail className="size-4" /> },
  call: { label: "שיחה", color: "bg-status-purple-soft text-status-purple", icon: <Phone className="size-4" /> },
};

export default function InboxPage() {
  const [filter, setFilter] = React.useState<Channel>("all");
  const [selectedId, setSelectedId] = React.useState<string | null>(CONVOS[0].leadId);

  const filtered = filter === "all" ? CONVOS : CONVOS.filter((c) => c.channel === filter);
  const selected = CONVOS.find((c) => c.leadId === selectedId);

  return (
    <div className="max-w-[1500px] space-y-4">
      <div className="relative rounded-3xl bg-white border border-bingo-gray-200 p-5 overflow-hidden" style={{ boxShadow: "0 2px 4px -1px rgba(0,0,0,0.03), 0 8px 24px -6px rgba(46, 161, 13, 0.10)" }}>
        <div className="flex items-center gap-4">
          <Icon3D icon={<MessageCircle className="size-6" />} tone="green" size={56} />
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-bingo-gray-500 mb-1">תקשורת אחודה</div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-none flex items-center gap-2">
              <span className="text-bingo-black">תיבת התקשורת</span>
              <span className="text-[12px] font-black tabular-nums px-2 py-0.5 rounded-lg text-gradient-bingo bg-bingo-green/10 border border-bingo-green/25">{CONVOS.filter(c => c.unread > 0).length} חדשים</span>
            </h1>
            <p className="text-[12px] text-bingo-gray-600 mt-1.5">כל ההודעות מכל הערוצים — WhatsApp, SMS, אימייל ושיחות. מקום אחד.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
        {/* Conversations list */}
        <div className="lg:col-span-4 rounded-3xl bg-white border border-bingo-gray-200 bingo-shadow-sm overflow-hidden">
          <div className="p-3 border-b border-bingo-gray-100">
            <div className="relative mb-2">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 size-3.5 text-bingo-gray-400" />
              <input
                placeholder="חפש שיחה..."
                className="w-full h-9 rounded-xl border border-bingo-gray-200 bg-white text-xs font-medium pr-8 pl-3 focus:border-bingo-green focus:outline-none focus:ring-2 focus:ring-bingo-green/15"
              />
            </div>
            <div className="flex items-center gap-1 bg-bingo-gray-100 rounded-xl p-0.5">
              {([
                { v: "all", l: "הכל" },
                { v: "whatsapp", l: "WhatsApp" },
                { v: "sms", l: "SMS" },
                { v: "email", l: "מייל" },
                { v: "call", l: "שיחות" },
              ] as { v: Channel; l: string }[]).map((opt) => (
                <button
                  key={opt.v}
                  onClick={() => setFilter(opt.v)}
                  className={cn(
                    "flex-1 h-7 rounded-md text-[10px] font-bold transition",
                    filter === opt.v ? "bg-white bingo-shadow-sm text-bingo-black" : "text-bingo-gray-500"
                  )}
                >
                  {opt.l}
                </button>
              ))}
            </div>
          </div>

          <div className="max-h-[calc(100vh-280px)] overflow-y-auto">
            {filtered.map((c) => {
              const meta = CHANNEL_META[c.channel];
              const isSelected = c.leadId === selectedId;
              return (
                <button
                  key={c.leadId}
                  onClick={() => setSelectedId(c.leadId)}
                  className={cn(
                    "w-full text-right p-3 border-b border-bingo-gray-100 last:border-0 transition flex items-start gap-2.5",
                    isSelected ? "bg-bingo-green/8 border-r-4 border-r-bingo-green" : "hover:bg-bingo-gray-50"
                  )}
                >
                  <Avatar name={c.leadName} size="md" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-2">
                      <div className="text-[13px] font-extrabold text-bingo-black truncate">{c.leadName}</div>
                      <div className="text-[10px] font-mono tabular-nums text-bingo-gray-500 shrink-0">{formatTime(c.lastTime)}</div>
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className={cn("inline-flex items-center gap-1 text-[9px] font-bold rounded-full px-1.5 py-px", meta.color)}>
                        {React.cloneElement(meta.icon, { className: "size-2.5" })}
                        {meta.label}
                      </span>
                    </div>
                    <div className="text-[12px] text-bingo-gray-700 mt-1 truncate">{c.lastMessage}</div>
                  </div>
                  {c.unread > 0 && (
                    <span className="size-5 rounded-full bg-bingo-green text-bingo-black text-[10px] font-bold inline-flex items-center justify-center shrink-0">
                      {c.unread}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Conversation view */}
        <div className="lg:col-span-8 rounded-3xl bg-white border border-bingo-gray-200 bingo-shadow-sm overflow-hidden flex flex-col">
          {selected ? (
            <>
              <div className="px-5 py-3 border-b border-bingo-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar name={selected.leadName} size="md" />
                  <div>
                    <div className="text-[14px] font-extrabold text-bingo-black">{selected.leadName}</div>
                    <div className="text-[11px] text-bingo-gray-500 inline-flex items-center gap-1">
                      {React.cloneElement(CHANNEL_META[selected.channel].icon, { className: "size-3" })}
                      {CHANNEL_META[selected.channel].label}
                    </div>
                  </div>
                </div>
                <Link href={`/leads/${selected.leadId}`} className="h-8 px-3 rounded-xl bg-bingo-gray-100 text-bingo-charcoal text-xs font-bold hover:bg-bingo-gray-200">
                  פתח כרטיס ←
                </Link>
              </div>

              <div className="flex-1 p-5 space-y-3 bg-gradient-to-b from-bingo-cream to-white max-h-[calc(100vh-380px)] overflow-y-auto">
                <Bubble side="them" text="שלום, ראיתי בפייסבוק את המודעה שלכם להלוואה" time="לפני 2 ש׳" />
                <Bubble side="me" text={`שלום ${selected.leadName}! ברוך הבא לבינגו. נשמח לעזור - לאיזה סכום אתה זקוק?`} time="לפני 2 ש׳" />
                <Bubble side="them" text="אני צריך משהו כמו 60,000" time="לפני 1.5 ש׳" />
                <Bubble side="me" text="מעולה. לאיזה מטרה ההלוואה? וכמה אתה משתכר בחודש?" time="לפני 1.5 ש׳" />
                <Bubble side="them" text={selected.lastMessage} time={formatTime(selected.lastTime)} />
              </div>

              <div className="p-3 border-t border-bingo-gray-100">
                <div className="flex items-center gap-2 mb-2">
                  <button className="text-[10px] font-bold text-bingo-gray-600 bg-bingo-gray-100 hover:bg-bingo-green hover:text-bingo-black rounded-full px-2.5 py-1 transition">
                    שלח תבנית: ברוכים הבאים
                  </button>
                  <button className="text-[10px] font-bold text-bingo-gray-600 bg-bingo-gray-100 hover:bg-bingo-green hover:text-bingo-black rounded-full px-2.5 py-1 transition">
                    תבנית: אישור הלוואה
                  </button>
                  <button className="text-[10px] font-bold text-bingo-gray-600 bg-bingo-gray-100 hover:bg-bingo-green hover:text-bingo-black rounded-full px-2.5 py-1 transition">
                    תבנית: תזכורת
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    placeholder={`כתוב הודעה ב-${CHANNEL_META[selected.channel].label}...`}
                    className="flex-1 h-11 rounded-2xl border-2 border-bingo-gray-200 bg-white px-4 text-sm font-medium hover:border-bingo-gray-300 focus:border-bingo-green focus:outline-none focus:ring-4 focus:ring-bingo-green/15"
                  />
                  <button className="h-11 px-4 rounded-2xl bg-bingo-black text-white text-sm font-bold hover:bg-bingo-charcoal inline-flex items-center gap-1.5 bingo-shadow">
                    <Send className="size-4" /> שלח
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-bingo-gray-400 text-sm">
              בחר שיחה מהרשימה
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Bubble({ side, text, time }: { side: "me" | "them"; text: string; time: string }) {
  return (
    <div className={cn("flex", side === "me" ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[70%] rounded-2xl px-4 py-2.5 text-[13px] leading-relaxed",
          side === "me"
            ? "bg-bingo-green text-bingo-black rounded-br-sm"
            : "bg-white border border-bingo-gray-200 text-bingo-charcoal rounded-bl-sm bingo-shadow-xs"
        )}
      >
        <div>{text}</div>
        <div className={cn("text-[9px] mt-1 font-mono", side === "me" ? "text-bingo-black/60" : "text-bingo-gray-500")}>{time}</div>
      </div>
    </div>
  );
}
