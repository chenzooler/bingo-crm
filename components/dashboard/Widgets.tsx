import { FileText, Eye, Flag, Clock, TrendingUp, ArrowUpRight } from "lucide-react";
import { cn, formatNumber } from "@/lib/utils";
import Link from "next/link";

export function DashboardWidgets({ counts }: { counts: { newToday: number; recent: number; overdueTasks: number; total?: number } }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <Widget
        href="/reports"
        accent="blue"
        title="תצוגת דוח"
        sub="ניתוח ביצועים ותחזיות"
        icon={<FileText className="size-5" strokeWidth={2.2} />}
        cta="פתיחה"
      />
      <Widget
        href="/dashboard?mine=1"
        accent="green"
        big={counts.newToday}
        title="ליד חדש בטיפולי"
        sub="לידים שצריכים טיפול ראשוני"
        icon={<Flag className="size-5" strokeWidth={2.2} />}
      />
      <Widget
        href="/dashboard?recent=1"
        accent="orange"
        title="נצפו לאחרונה"
        sub="כרטיסים שראית בשעות האחרונות"
        icon={<Eye className="size-5" strokeWidth={2.2} />}
        cta="הצג"
      />
      <Widget
        href="/tasks?overdue=1"
        accent="red"
        big={counts.overdueTasks}
        title="משימות באיחור"
        sub="משימות שעבר זמנן ולא טופלו"
        icon={<Clock className="size-5" strokeWidth={2.2} />}
      />
    </div>
  );
}

function Widget({
  accent,
  title,
  sub,
  icon,
  big,
  cta,
  href,
}: {
  accent: "blue" | "green" | "orange" | "red";
  title: string;
  sub?: string;
  icon: React.ReactNode;
  big?: number;
  cta?: string;
  href: string;
}) {
  const palette = {
    blue:   "from-status-blue/8 to-status-blue/3 border-status-blue/25 text-status-blue",
    green:  "from-bingo-green/15 to-bingo-green/5 border-bingo-green/40 text-bingo-green-dark",
    orange: "from-status-orange/10 to-status-orange/3 border-status-orange/30 text-status-orange",
    red:    "from-status-red/8 to-status-red/3 border-status-red/25 text-status-red",
  } as const;
  const iconPalette = {
    blue:   "bg-status-blue text-white",
    green:  "bg-bingo-green text-bingo-black",
    orange: "bg-status-orange text-white",
    red:    "bg-status-red text-white",
  } as const;

  return (
    <Link
      href={href}
      className={cn(
        "group relative rounded-2xl p-4 bg-gradient-to-br border bingo-shadow-sm hover:bingo-shadow-lg hover:-translate-y-0.5 transition-all overflow-hidden",
        palette[accent]
      )}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className={cn("size-10 rounded-xl inline-flex items-center justify-center", iconPalette[accent])}>{icon}</div>
        <ArrowUpRight className="size-4 text-bingo-gray-400 group-hover:text-bingo-black group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all" />
      </div>
      {big !== undefined ? (
        <div className="text-3xl font-black text-bingo-black tabular-nums leading-none mt-1">{formatNumber(big)}</div>
      ) : (
        <div className="text-3xl font-black text-bingo-black leading-none mt-1">—</div>
      )}
      <div className="text-[13px] font-extrabold text-bingo-black mt-2">{title}</div>
      {sub && <div className="text-[11px] text-bingo-gray-600 mt-0.5">{sub}</div>}
    </Link>
  );
}
