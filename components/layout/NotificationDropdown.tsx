"use client";
import * as React from "react";
import Link from "next/link";
import * as Popover from "@radix-ui/react-popover";
import { Bell, MessageCircle, Phone, Pen, AlertTriangle, CheckCircle2, ChevronLeft } from "lucide-react";
import { cn, relativeTime } from "@/lib/utils";

const today = Date.now();
const T = (m: number) => new Date(today - m * 60000).toISOString();

const FEED = [
  { id: "n1", icon: <Phone className="size-3.5" />, color: "red", title: "ליד דורש טיפול דחוף", body: "שלום כהן השאיר פרטים — Hot", time: T(5), link: "/leads/1" },
  { id: "n2", icon: <CheckCircle2 className="size-3.5" />, color: "green", title: "אישור סופי", body: "אירנה ברינרונקו אושרה ₪50,000", time: T(18), link: "/leads/6" },
  { id: "n3", icon: <MessageCircle className="size-3.5" />, color: "blue", title: "WhatsApp חדש", body: "דוד קדוש: 'אני מעוניין להמשיך'", time: T(45), link: "/inbox" },
  { id: "n4", icon: <Pen className="size-3.5" />, color: "purple", title: "חתימת חוזה", body: "מאג'ד חתם על הסכם", time: T(120), link: "/contracts" },
  { id: "n5", icon: <AlertTriangle className="size-3.5" />, color: "orange", title: "משימה באיחור", body: "התקשר ליוסי כהן — איחור של 35 דק", time: T(35), link: "/tasks" },
];

const COLORS = {
  red: "bg-status-red text-white",
  green: "bg-bingo-green text-bingo-black",
  blue: "bg-status-blue text-white",
  purple: "bg-status-purple text-white",
  orange: "bg-status-orange text-white",
};

export function NotificationDropdown() {
  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button
          type="button"
          className="relative size-9 rounded-lg text-bingo-gray-600 hover:text-bingo-black hover:bg-bingo-gray-100 inline-flex items-center justify-center transition"
          aria-label="התראות"
        >
          <Bell className="size-4" />
          <span className="absolute top-1 left-1 size-1.5 rounded-full bg-status-red ring-2 ring-bingo-cream" />
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align="end"
          sideOffset={8}
          className="w-96 bg-white rounded-2xl border border-bingo-gray-200 bingo-shadow-xl overflow-hidden z-50"
        >
          <div className="px-4 py-3 border-b border-bingo-gray-100 flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-bingo-black">התראות</h3>
            <button className="text-[11px] font-bold text-bingo-green-dark hover:underline">סמן הכל כנקרא</button>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {FEED.map((n) => (
              <Link
                key={n.id}
                href={n.link}
                className="flex items-start gap-2.5 px-4 py-3 border-b border-bingo-gray-100 last:border-0 hover:bg-bingo-gray-50 transition"
              >
                <div className={cn("size-8 rounded-lg inline-flex items-center justify-center shrink-0", COLORS[n.color as keyof typeof COLORS])}>{n.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-[12px] font-extrabold text-bingo-black truncate">{n.title}</div>
                  <div className="text-[11px] text-bingo-gray-600 mt-0.5 line-clamp-2">{n.body}</div>
                  <div className="text-[10px] font-mono tabular-nums text-bingo-gray-400 mt-1">{relativeTime(n.time)}</div>
                </div>
              </Link>
            ))}
          </div>
          <Link
            href="/notifications"
            className="flex items-center justify-center gap-1 h-10 border-t border-bingo-gray-100 text-[12px] font-bold text-bingo-charcoal hover:bg-bingo-gray-50 transition"
          >
            צפה בהתראות ←
          </Link>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
