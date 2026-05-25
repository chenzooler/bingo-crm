import { Bell, AlertTriangle, Clock, TrendingDown, Phone, Building2, Shield } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";

export const dynamic = "force-dynamic";

interface AlertItem {
  id: string;
  severity: "critical" | "warning" | "info";
  icon: React.ReactNode;
  title: string;
  description: string;
  agentName?: string;
  agentEmoji?: string;
  time: string;
  action: string;
}

const ALERTS: AlertItem[] = [
  { id: "a1", severity: "critical", icon: <TrendingDown className="size-5" />, title: "ירידה ב-MoM ההמרה של דניאל רחמים", description: "המרה ירדה מ-28% ל-12% השבוע - שווה בדיקה", agentName: "דניאל רחמים", agentEmoji: "📝", time: "לפני 23 דק", action: "פתח כרטיס נציג" },
  { id: "a2", severity: "critical", icon: <Clock className="size-5" />, title: "47 לידים חמים יושבים יותר מ-4 שעות בלי טיפול", description: "פגיעה ב-SLA. צריך לחלק מחדש או להגדיל צוות", time: "לפני שעה", action: "ראה לידים" },
  { id: "a3", severity: "warning", icon: <Phone className="size-5" />, title: "% מענה לשיחות ירד ל-42%", description: "ביום ממוצע - מתחת לרמה התקנית (55%). שווה לבדוק שעות חיוג", time: "לפני 2 ש׳", action: "צפה ב-Calls" },
  { id: "a4", severity: "warning", icon: <Building2 className="size-5" />, title: "פמה - זמן תגובה הולך וגדל", description: "ממוצע עלה מ-5 דק ל-12 דק השבוע. ייתכן בעיה ב-API", time: "לפני 3 ש׳", action: "פנה לפמה" },
  { id: "a5", severity: "info", icon: <Shield className="size-5" />, title: "12 לידים מאושרים ממתינים לחתימת חוזה מעל 48 שעות", description: "שווה לפנות עם תזכורת או שיחת סגירה", time: "לפני 4 ש׳", action: "שלח תזכורת" },
  { id: "a6", severity: "info", icon: <AlertTriangle className="size-5" />, title: "סורבו 8 לידים בפועל יום אחד מ-בנק ירושלים", description: "מעל הממוצע. בדוק אם יש שינוי בקריטריונים", time: "אתמול", action: "פנה לבנק" },
];

const SEVERITY: Record<AlertItem["severity"], { color: string; label: string }> = {
  critical: { color: "bg-status-red text-white border-status-red", label: "דחוף" },
  warning: { color: "bg-status-orange text-white border-status-orange", label: "אזהרה" },
  info: { color: "bg-status-blue text-white border-status-blue", label: "מידע" },
};

export default function AlertsPage() {
  return (
    <div className="space-y-4">
      <div className="rounded-3xl bg-white border border-bingo-gray-200 bingo-shadow-sm p-6">
        <div className="flex items-center gap-3">
          <div className="size-12 rounded-2xl bg-gradient-to-bl from-status-red/15 to-status-red/5 border border-status-red/30 inline-flex items-center justify-center">
            <Bell className="size-5 text-status-red" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-bingo-black">התראות חכמות</h2>
            <p className="text-[12px] text-bingo-gray-600 mt-1">
              {ALERTS.filter((a) => a.severity === "critical").length} דחוף · {ALERTS.filter((a) => a.severity === "warning").length} אזהרה · {ALERTS.filter((a) => a.severity === "info").length} מידע
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {ALERTS.map((a) => {
          const sev = SEVERITY[a.severity];
          return (
            <div key={a.id} className="rounded-2xl bg-white border border-bingo-gray-200 hover:border-bingo-gray-300 p-4 flex items-start gap-3 group transition">
              <div className={`size-10 rounded-xl inline-flex items-center justify-center shrink-0 border ${sev.color}`}>{a.icon}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className={`text-[10px] font-bold rounded-full px-2 py-0.5 border ${sev.color}`}>{sev.label}</span>
                  <span className="text-[11px] text-bingo-gray-500">{a.time}</span>
                  {a.agentName && (
                    <span className="inline-flex items-center gap-1.5">
                      <Avatar name={a.agentName} emoji={a.agentEmoji} size="sm" />
                      <span className="text-[11px] font-bold text-bingo-charcoal">{a.agentName}</span>
                    </span>
                  )}
                </div>
                <div className="text-[14px] font-extrabold text-bingo-black">{a.title}</div>
                <div className="text-[12px] text-bingo-gray-600 mt-0.5">{a.description}</div>
              </div>
              <button className="h-9 px-3 rounded-xl bg-bingo-gray-100 hover:bg-bingo-green hover:text-bingo-black text-bingo-charcoal text-xs font-bold transition shrink-0 self-center">
                {a.action} ←
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
