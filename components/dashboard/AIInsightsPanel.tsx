"use client";
import * as React from "react";
import Link from "next/link";
import { Sparkles, ArrowLeft, Flame, AlertTriangle, Lightbulb, Trophy, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface Insight {
  id: string;
  type: "opportunity" | "risk" | "tip" | "win" | "urgent";
  title: string;
  subtitle: string;
  href?: string;
  cta?: string;
  value?: string;
}

const INSIGHTS: Insight[] = [
  {
    id: "i1",
    type: "opportunity",
    title: "7 לידים חמים ממתינים לחיוג",
    subtitle: "מודל AI חיזה סיכוי סגירה מעל 75%",
    href: "/leads?view=hot",
    cta: "פתח רשימה",
    value: "₪52K עמלה צפויה",
  },
  {
    id: "i2",
    type: "urgent",
    title: "ליד אבל לא חזר 5 ימים",
    subtitle: "דנה כהן — ₪140K, סגירה הוערכה לסוף השבוע",
    href: "/leads/L-892",
    cta: "חייג עכשיו",
  },
  {
    id: "i3",
    type: "tip",
    title: "הזמן הטוב ביותר היום: 14:30",
    subtitle: "בהתבסס על 4 שבועות אחרונים",
    cta: "תזכר אותי",
  },
  {
    id: "i4",
    type: "win",
    title: "שיא חדש! 8 סגירות השבוע",
    subtitle: "כל הכבוד! זה ה-Q הכי טוב שלך",
    value: "+18% מהממוצע",
  },
  {
    id: "i5",
    type: "risk",
    title: "3 לידים על סף ביטול",
    subtitle: "לא דיברו עם נציג בשבועיים האחרונים",
    href: "/leads?view=stuck",
    cta: "התערב",
  },
];

const META: Record<Insight["type"], { icon: React.ComponentType<{ className?: string }>; bg: string; iconColor: string; label: string }> = {
  opportunity: { icon: Sparkles, bg: "bg-bingo-green/12 border-bingo-green/30", iconColor: "text-bingo-green-dark", label: "הזדמנות" },
  risk: { icon: AlertTriangle, bg: "bg-amber-50 border-amber-200", iconColor: "text-amber-700", label: "סיכון" },
  tip: { icon: Lightbulb, bg: "bg-status-blue/8 border-status-blue/25", iconColor: "text-status-blue", label: "טיפ" },
  win: { icon: Trophy, bg: "bg-status-yellow/15 border-status-yellow/40", iconColor: "text-amber-700", label: "ניצחון" },
  urgent: { icon: Flame, bg: "bg-status-red/10 border-status-red/30", iconColor: "text-status-red", label: "דחוף" },
};

export function AIInsightsPanel() {
  return (
    <div className="surface-card-elevated overflow-hidden">
      <div className="px-5 py-3 bg-gradient-to-bl from-bingo-green/10 to-transparent border-b border-bingo-gray-150 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="size-8 rounded-xl bg-bingo-black text-bingo-green inline-flex items-center justify-center bingo-shadow-sm">
            <Sparkles className="size-4" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-bingo-black leading-tight">AI Insights</h3>
            <p className="text-[10px] text-bingo-gray-500 leading-tight">המלצות חכמות בהתבסס על הנתונים שלך</p>
          </div>
        </div>
        <span className="text-[9px] font-bold uppercase tracking-wider text-bingo-green-dark bg-bingo-green/15 px-2 py-1 rounded-md inline-flex items-center gap-1">
          <span className="size-1.5 rounded-full bg-bingo-green animate-pulse" />
          חי
        </span>
      </div>

      <div className="divide-y divide-bingo-gray-100">
        {INSIGHTS.map((insight) => (
          <InsightRow key={insight.id} insight={insight} />
        ))}
      </div>

      <div className="px-5 py-3 border-t border-bingo-gray-150 bg-bingo-gray-50">
        <Link
          href="/insights"
          className="text-[11px] font-bold text-bingo-green-dark hover:underline inline-flex items-center gap-1"
        >
          ראה את כל ה-Insights ({INSIGHTS.length + 12})
          <ArrowLeft className="size-3" />
        </Link>
      </div>
    </div>
  );
}

function InsightRow({ insight }: { insight: Insight }) {
  const meta = META[insight.type];
  const Icon = meta.icon;

  const content = (
    <div className="px-5 py-3 hover:bg-bingo-gray-50 transition flex items-start gap-3 group">
      <div className={cn("size-9 rounded-xl border inline-flex items-center justify-center shrink-0 mt-0.5", meta.bg)}>
        <Icon className={cn("size-4", meta.iconColor)} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className={cn("text-[9px] font-bold uppercase tracking-wider rounded-md px-1.5", meta.bg, meta.iconColor)}>
            {meta.label}
          </span>
          {insight.value && (
            <span className="text-[10px] font-mono font-bold text-bingo-green-dark tabular-nums">{insight.value}</span>
          )}
        </div>
        <div className="text-[13px] font-extrabold text-bingo-black leading-snug">{insight.title}</div>
        <div className="text-[11px] text-bingo-gray-600 leading-snug mt-0.5">{insight.subtitle}</div>
      </div>
      {insight.cta && (
        <div className="text-[10px] font-bold text-bingo-charcoal group-hover:text-bingo-green-dark transition inline-flex items-center gap-0.5 mt-2 shrink-0 whitespace-nowrap">
          {insight.cta}
          <ArrowLeft className="size-3" />
        </div>
      )}
    </div>
  );

  return insight.href ? <Link href={insight.href}>{content}</Link> : <div>{content}</div>;
}
