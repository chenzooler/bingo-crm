"use client";
import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import {
  Sparkles, X, TrendingUp, AlertTriangle, Target, Lightbulb,
  Phone, MessageCircle, Mail, FileText, Building2, Calendar, Users,
  Zap, Clock, ShieldAlert, Trophy, Rocket, ChevronLeft,
} from "lucide-react";
import type { Lead } from "@/lib/types";
import {
  generateInsights, getSentimentMeta, PRIORITY_META,
  type AIAction, type ActionType,
} from "@/lib/data/ai-insights";
import { LeadTemperatureGauge } from "@/components/ui/LeadTemperatureGauge";
import { cn, formatCurrency } from "@/lib/utils";

const ICON_MAP: Record<ActionType, React.ComponentType<{ className?: string }>> = {
  call: Phone, whatsapp: MessageCircle, email: Mail,
  document: FileText, lender: Building2, meeting: Calendar, internal: Users,
};

export function AICopilotDrawer({ lead, children }: { lead: Lead; children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  const insights = React.useMemo(() => generateInsights(lead), [lead]);
  const sentMeta = getSentimentMeta(insights.sentiment);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>{children}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-bingo-onyx/40 backdrop-blur-sm animate-fade-in" />
        <Dialog.Content
          className="fixed inset-x-0 bottom-0 top-12 md:inset-y-0 md:left-0 md:top-0 md:right-auto z-50 w-full md:max-w-md bg-bingo-cream border-t md:border-t-0 md:border-l border-bingo-gray-200 rounded-t-3xl md:rounded-none flex flex-col bingo-shadow-lg animate-slide-in-up md:animate-slide-in-left pb-safe"
        >
          {/* Header */}
          <div className="px-5 pt-4 pb-3 bg-gradient-to-br from-bingo-green/15 via-bingo-green/5 to-transparent border-b border-bingo-gray-150">
            <div className="flex items-center justify-between mb-3">
              <Dialog.Close className="size-8 rounded-lg hover:bg-bingo-gray-100 inline-flex items-center justify-center">
                <ChevronLeft className="size-4 rotate-180" />
              </Dialog.Close>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-bingo-gray-500">Powered by</span>
                <span className="text-[10px] font-black text-bingo-black">BINGO AI</span>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="size-12 rounded-2xl bg-bingo-black text-bingo-green inline-flex items-center justify-center shrink-0 bingo-shadow">
                <Sparkles className="size-6" />
              </div>
              <div className="min-w-0">
                <Dialog.Title className="text-xl font-black text-bingo-black leading-tight">
                  AI Co-pilot
                </Dialog.Title>
                <p className="text-[12px] text-bingo-gray-600 leading-snug">
                  ניתוח חי ל-{lead.fullName}
                </p>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
            {/* Lead temperature gauge */}
            <div className="flex items-center justify-center py-2 bg-white rounded-2xl border border-bingo-gray-200">
              <LeadTemperatureGauge score={insights.closeProbability} size="lg" />
            </div>

            {/* Big metrics */}
            <div className="grid grid-cols-2 gap-2.5">
              <MetricCard
                label="סיכוי לסגירה"
                value={`${insights.closeProbability}%`}
                icon={<Target className="size-4" />}
                tone={insights.closeProbability > 70 ? "good" : insights.closeProbability > 50 ? "warn" : "bad"}
                progress={insights.closeProbability}
              />
              <MetricCard
                label="צפי הכנסה"
                value={formatCurrency(insights.estimatedRevenue)}
                icon={<TrendingUp className="size-4" />}
                tone="good"
                subtitle={`עמלה משוערת`}
              />
              <MetricCard
                label="סנטימנט"
                value={sentMeta.label}
                icon={<span className="text-base">{sentMeta.emoji}</span>}
                tone={
                  insights.sentiment === "very-positive" || insights.sentiment === "positive"
                    ? "good"
                    : insights.sentiment === "neutral"
                      ? "warn"
                      : "bad"
                }
              />
              <MetricCard
                label="ציון סיכון"
                value={`${insights.riskScore}/100`}
                icon={<ShieldAlert className="size-4" />}
                tone={insights.riskScore < 35 ? "good" : insights.riskScore < 60 ? "warn" : "bad"}
                progress={insights.riskScore}
              />
            </div>

            {/* Summary */}
            <Section icon={<Lightbulb className="size-3.5" />} title="סיכום ה-AI">
              <p className="text-[13px] text-bingo-charcoal leading-relaxed">{insights.summary}</p>
            </Section>

            {/* Next actions */}
            <Section icon={<Rocket className="size-3.5" />} title="פעולות מומלצות" count={insights.nextActions.length}>
              <div className="space-y-2">
                {insights.nextActions.map((a) => (
                  <ActionRow key={a.id} action={a} />
                ))}
              </div>
            </Section>

            {/* Script hint */}
            <Section icon={<Zap className="size-3.5" />} title="טיפ פתיחת שיחה">
              <div className="rounded-xl bg-bingo-black text-white px-4 py-3 text-[13px] leading-relaxed font-medium">
                {insights.scriptHint}
              </div>
            </Section>

            {/* Best times */}
            <Section icon={<Clock className="size-3.5" />} title="שעות חיוג מומלצות">
              <div className="flex flex-wrap gap-1.5">
                {insights.bestCallTimes.map((t, i) => (
                  <span key={i} className="px-2.5 py-1 rounded-lg bg-white border border-bingo-gray-200 text-[12px] font-mono font-bold tabular-nums">
                    {t}
                  </span>
                ))}
              </div>
            </Section>

            {/* Key insights */}
            {insights.keyInsights.length > 0 && (
              <Section icon={<Lightbulb className="size-3.5" />} title="תובנות מרכזיות">
                <ul className="space-y-1.5">
                  {insights.keyInsights.map((k, i) => (
                    <li key={i} className="text-[13px] text-bingo-charcoal flex gap-2 leading-snug">
                      <span className="size-1.5 rounded-full bg-bingo-green mt-1.5 shrink-0" />
                      <span>{k}</span>
                    </li>
                  ))}
                </ul>
              </Section>
            )}

            {/* Opportunities */}
            {insights.opportunities.length > 0 && (
              <Section icon={<Trophy className="size-3.5" />} title="הזדמנויות" tone="good">
                <ul className="space-y-1.5">
                  {insights.opportunities.map((k, i) => (
                    <li key={i} className="text-[13px] text-bingo-charcoal flex gap-2 leading-snug">
                      <span className="text-bingo-green-dark mt-0.5">✓</span>
                      <span>{k}</span>
                    </li>
                  ))}
                </ul>
              </Section>
            )}

            {/* Red flags */}
            {insights.redFlags.length > 0 && (
              <Section icon={<AlertTriangle className="size-3.5" />} title="דגלים אדומים" tone="warn">
                <ul className="space-y-1.5">
                  {insights.redFlags.map((k, i) => (
                    <li key={i} className="text-[13px] text-bingo-charcoal flex gap-2 leading-snug">
                      <span className="text-status-red mt-0.5">⚠</span>
                      <span>{k}</span>
                    </li>
                  ))}
                </ul>
              </Section>
            )}

            {/* Similar deals */}
            <Section icon={<TrendingUp className="size-3.5" />} title="עסקאות דומות שנסגרו">
              <div className="rounded-xl bg-white border border-bingo-gray-200 p-3 flex items-center justify-between">
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-bingo-gray-500 font-bold">סך הכל</div>
                  <div className="text-2xl font-black text-bingo-black tabular-nums">{insights.similarDealsClosed}</div>
                  <div className="text-[10px] text-bingo-gray-500">ב-12 חודשים אחרונים</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] uppercase tracking-wider text-bingo-gray-500 font-bold">עמלה ממוצעת</div>
                  <div className="text-lg font-extrabold text-bingo-green-dark num-display">
                    {formatCurrency(insights.similarDealsAvgRevenue)}
                  </div>
                </div>
              </div>
            </Section>

            {insights.competitorMentions && insights.competitorMentions.length > 0 && (
              <Section icon={<AlertTriangle className="size-3.5" />} title="מתחרים שהוזכרו">
                <div className="flex flex-wrap gap-1.5">
                  {insights.competitorMentions.map((c, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-[12px] font-bold text-amber-800">
                      {c}
                    </span>
                  ))}
                </div>
              </Section>
            )}
          </div>

          {/* Footer */}
          <div className="px-5 py-3 border-t border-bingo-gray-150 bg-white flex items-center justify-between gap-2">
            <button className="text-[11px] font-bold text-bingo-gray-500 hover:text-bingo-black">
              👍 מועיל
            </button>
            <button className="h-9 px-3 rounded-lg bg-bingo-black text-white text-[12px] font-bold inline-flex items-center gap-1.5 hover:bg-bingo-charcoal transition">
              <Sparkles className="size-3.5" />
              חדש ניתוח
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function MetricCard({
  label, value, icon, tone, progress, subtitle,
}: {
  label: string; value: string; icon: React.ReactNode;
  tone: "good" | "warn" | "bad"; progress?: number; subtitle?: string;
}) {
  const toneClass = {
    good: "bg-bingo-green/8 border-bingo-green/30",
    warn: "bg-status-yellow/12 border-status-yellow/40",
    bad: "bg-status-red/8 border-status-red/30",
  }[tone];
  const barClass = {
    good: "bg-bingo-green", warn: "bg-status-yellow", bad: "bg-status-red",
  }[tone];

  return (
    <div className={cn("rounded-xl border p-3", toneClass)}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] font-bold uppercase tracking-wider text-bingo-gray-600">{label}</span>
        <span className="text-bingo-charcoal">{icon}</span>
      </div>
      <div className="text-xl font-black text-bingo-black leading-none num-display">{value}</div>
      {subtitle && <div className="text-[10px] text-bingo-gray-500 mt-0.5">{subtitle}</div>}
      {progress !== undefined && (
        <div className="mt-2 h-1 bg-white/60 rounded-full overflow-hidden">
          <div
            className={cn("h-full rounded-full transition-all", barClass)}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}

function Section({
  icon, title, children, count, tone,
}: {
  icon: React.ReactNode; title: string; children: React.ReactNode;
  count?: number; tone?: "good" | "warn";
}) {
  const titleColor = tone === "warn" ? "text-status-red" : tone === "good" ? "text-bingo-green-dark" : "text-bingo-charcoal";
  return (
    <div>
      <div className={cn("text-[11px] font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5", titleColor)}>
        {icon}
        {title}
        {count !== undefined && (
          <span className="font-mono tabular-nums bg-bingo-gray-100 text-bingo-charcoal rounded-md px-1.5">{count}</span>
        )}
      </div>
      {children}
    </div>
  );
}

function ActionRow({ action }: { action: AIAction }) {
  const Icon = ICON_MAP[action.type];
  const pMeta = PRIORITY_META[action.priority];

  return (
    <div className="rounded-xl bg-white border border-bingo-gray-200 hover:border-bingo-green/40 hover:bingo-shadow-sm transition p-3">
      <div className="flex items-start gap-2.5">
        <div className="size-9 rounded-lg bg-bingo-gray-100 text-bingo-charcoal inline-flex items-center justify-center shrink-0">
          <Icon className="size-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <div className="text-[13px] font-extrabold text-bingo-black leading-tight">{action.title}</div>
            <span className={cn("text-[9px] font-bold rounded-md px-1.5 py-0.5 whitespace-nowrap", pMeta.color)}>
              {pMeta.label}
            </span>
          </div>
          <p className="text-[11px] text-bingo-gray-600 leading-snug mb-2">{action.reason}</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-bingo-gray-500 font-bold">ביטחון:</span>
              <div className="h-1 w-16 bg-bingo-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-bingo-green rounded-full"
                  style={{ width: `${action.confidence}%` }}
                />
              </div>
              <span className="text-[10px] font-mono font-bold text-bingo-charcoal tabular-nums">{action.confidence}%</span>
            </div>
            <button className="h-6 px-2 rounded-md bg-bingo-black text-white text-[10px] font-bold hover:bg-bingo-charcoal transition">
              בצע
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
