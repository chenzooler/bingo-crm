"use client";
import * as React from "react";
import Link from "next/link";
import { Bell, MessageCircle, Phone, Pen, ShieldCheck, AlertTriangle, CheckCircle2, Star, Users, Building2, Clock } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { cn, formatTime, formatDate, relativeTime } from "@/lib/utils";
import { Icon3D } from "@/components/ui/Icon3D";

interface Notification {
  id: string;
  category: "lead" | "task" | "system" | "manager" | "compliance";
  severity: "info" | "success" | "warning" | "urgent";
  icon: React.ReactNode;
  title: string;
  body: string;
  time: string;
  link?: string;
  read?: boolean;
  authorName?: string;
}

const today = Date.now();
const NOTIFICATIONS: Notification[] = [
  { id: "n1", category: "lead", severity: "urgent", icon: <Phone className="size-4" />, title: "ליד חדש דורש טיפול דחוף", body: "שלום כהן השאיר פרטים - מסומן כ-Hot", time: new Date(today - 5 * 60 * 1000).toISOString(), link: "/leads/1", authorName: "WOKI" },
  { id: "n2", category: "lead", severity: "success", icon: <CheckCircle2 className="size-4" />, title: "אישור סופי מבנק ירושלים", body: "אירנה ברינרונקו אושרה ל-50,000 ₪, 60 תשלומים", time: new Date(today - 18 * 60 * 1000).toISOString(), link: "/leads/6" },
  { id: "n3", category: "task", severity: "warning", icon: <Clock className="size-4" />, title: "משימה באיחור", body: "התקשר ליוסי כהן - אמור היה להתבצע ב-10:00", time: new Date(today - 45 * 60 * 1000).toISOString(), link: "/tasks", authorName: "מערכת" },
  { id: "n4", category: "lead", severity: "info", icon: <MessageCircle className="size-4" />, title: "הודעת WhatsApp חדשה", body: "דוד קדוש: 'אני מעוניין להמשיך'", time: new Date(today - 2 * 60 * 60 * 1000).toISOString(), link: "/inbox", authorName: "WhatsApp" },
  { id: "n5", category: "manager", severity: "urgent", icon: <AlertTriangle className="size-4" />, title: "ירידה בביצועים שלך", body: "% המרה ירד מ-28% ל-18% השבוע", time: new Date(today - 3 * 60 * 60 * 1000).toISOString(), link: "/admin/team", authorName: "מנהל" },
  { id: "n6", category: "lead", severity: "info", icon: <Pen className="size-4" />, title: "חתימת חוזה", body: "מאג'ד אל' חואסה חתם על הסכם התקשרות", time: new Date(today - 4 * 60 * 60 * 1000).toISOString(), link: "/leads/2" },
  { id: "n7", category: "compliance", severity: "warning", icon: <ShieldCheck className="size-4" />, title: "Compliance flag - שיחה אתמול", body: "השיחה עם בוריס סקדץ לא הזכירה ריבית", time: new Date(today - 22 * 60 * 60 * 1000).toISOString(), link: "/calls" },
  { id: "n8", category: "system", severity: "success", icon: <Building2 className="size-4" />, title: "API מימון ישיר חזר לעבודה", body: "הזמן תגובה חזר לקדמותו - 8 שניות", time: new Date(today - 23 * 60 * 60 * 1000).toISOString(), link: "/admin/lenders" },
  { id: "n9", category: "manager", severity: "info", icon: <Star className="size-4" />, title: "השגת את היעד היומי", body: "2/2 עסקאות סגרת היום! 🎉", time: new Date(today - 25 * 60 * 60 * 1000).toISOString(), read: true },
  { id: "n10", category: "lead", severity: "urgent", icon: <Phone className="size-4" />, title: "שיחה לא ענתה - 3 ניסיונות", body: "אמנגד נאצר - שווה לשלוח WhatsApp", time: new Date(today - 26 * 60 * 60 * 1000).toISOString(), link: "/leads/4", read: true },
];

const SEVERITY = {
  info: { color: "border-status-blue/30 bg-status-blue/5", iconBg: "bg-status-blue text-white", label: "מידע" },
  success: { color: "border-bingo-green/40 bg-bingo-green/8", iconBg: "bg-bingo-green text-bingo-black", label: "הצלחה" },
  warning: { color: "border-status-orange/30 bg-status-orange/5", iconBg: "bg-status-orange text-white", label: "אזהרה" },
  urgent: { color: "border-status-red/40 bg-status-red/8", iconBg: "bg-status-red text-white", label: "דחוף" },
};

const CATEGORIES = [
  { key: "all" as const, label: "הכל" },
  { key: "lead" as const, label: "לידים" },
  { key: "task" as const, label: "משימות" },
  { key: "manager" as const, label: "מנהל" },
  { key: "system" as const, label: "מערכת" },
  { key: "compliance" as const, label: "Compliance" },
];

export default function NotificationsPage() {
  const [category, setCategory] = React.useState<"all" | Notification["category"]>("all");
  const [showRead, setShowRead] = React.useState(true);

  const filtered = NOTIFICATIONS.filter((n) => {
    if (category !== "all" && n.category !== category) return false;
    if (!showRead && n.read) return false;
    return true;
  });
  const unread = NOTIFICATIONS.filter((n) => !n.read).length;

  return (
    <div className="max-w-[1100px] space-y-4">
      <div className="relative rounded-3xl bg-white border border-bingo-gray-200 p-5 overflow-hidden flex items-center justify-between gap-3 flex-wrap" style={{ boxShadow: "0 2px 4px -1px rgba(0,0,0,0.03), 0 8px 24px -6px rgba(46, 161, 13, 0.10)" }}>
        <div className="flex items-center gap-4">
          <Icon3D icon={<Bell className="size-6" />} tone="orange" size={56} />
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-bingo-gray-500 mb-1">מרכז התראות</div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-none flex items-center gap-2">
              <span className="text-bingo-black">התראות</span>
              <span className="text-[12px] font-black tabular-nums px-2 py-0.5 rounded-lg text-gradient-bingo bg-bingo-green/10 border border-bingo-green/25">{unread} חדשות</span>
            </h1>
            <p className="text-[12px] text-bingo-gray-600 mt-1.5">{unread} התראות חדשות · {NOTIFICATIONS.length} סה"כ</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="h-10 px-3.5 rounded-xl bg-white border border-bingo-gray-200 text-[12px] font-bold inline-flex items-center gap-1.5 hover:bg-bingo-gray-100">
            סמן הכל כנקרא
          </button>
          <button className="btn-vibrant">הגדרות התראות</button>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-1 bg-white border border-bingo-gray-200 rounded-xl p-0.5 bingo-shadow-sm">
          {CATEGORIES.map((c) => (
            <button
              key={c.key}
              onClick={() => setCategory(c.key)}
              className={cn("h-8 px-3 rounded-lg text-[12px] font-bold transition", category === c.key ? "bg-bingo-black text-white" : "text-bingo-charcoal hover:bg-bingo-gray-100")}
            >
              {c.label}
            </button>
          ))}
        </div>
        <button
          onClick={() => setShowRead(!showRead)}
          className="h-8 px-3 rounded-lg text-[12px] font-bold bg-white border border-bingo-gray-200 hover:bg-bingo-gray-100 text-bingo-charcoal"
        >
          {showRead ? "הסתר נקראו" : "הצג נקראו"}
        </button>
      </div>

      <div className="space-y-2">
        {filtered.map((n) => {
          const sev = SEVERITY[n.severity];
          return (
            <Link
              key={n.id}
              href={n.link || "#"}
              className={cn(
                "block rounded-2xl border p-4 hover:bingo-shadow-sm hover:-translate-y-0.5 transition",
                sev.color,
                !n.read && "bingo-shadow-sm",
                n.read && "opacity-70"
              )}
            >
              <div className="flex items-start gap-3">
                <div className={cn("size-10 rounded-xl inline-flex items-center justify-center shrink-0", sev.iconBg)}>{n.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    {!n.read && <span className="size-2 rounded-full bg-status-red" />}
                    <h3 className="text-[14px] font-extrabold text-bingo-black">{n.title}</h3>
                    {n.authorName && <span className="text-[10px] text-bingo-gray-500">· {n.authorName}</span>}
                  </div>
                  <p className="text-[12px] text-bingo-charcoal leading-relaxed">{n.body}</p>
                  <div className="text-[10px] font-mono tabular-nums text-bingo-gray-500 mt-1">{relativeTime(n.time)}</div>
                </div>
              </div>
            </Link>
          );
        })}
        {filtered.length === 0 && (
          <div className="rounded-2xl bg-white border border-bingo-gray-200 p-12 text-center">
            <Bell className="size-8 text-bingo-gray-300 mx-auto mb-3" />
            <p className="text-sm text-bingo-gray-500">אין התראות בקטגוריה זו</p>
          </div>
        )}
      </div>
    </div>
  );
}
