"use client";
import * as React from "react";
import { LEADS } from "@/lib/data/leads";
import { generateInsights } from "@/lib/data/ai-insights";
import { Avatar } from "@/components/ui/Avatar";
import { X, Plus, Trophy, TrendingUp, ShieldAlert, Target, Award } from "lucide-react";
import type { Lead } from "@/lib/types";
import { cn, formatCurrency } from "@/lib/utils";

interface LeadComparisonProps {
  leadIds: string[];
  onClose: () => void;
  onAdd?: () => void;
}

export function LeadComparison({ leadIds, onClose, onAdd }: LeadComparisonProps) {
  const leads = React.useMemo(
    () => leadIds.map((id) => LEADS.find((l) => l.id === id)).filter(Boolean) as Lead[],
    [leadIds]
  );
  const insights = React.useMemo(() => leads.map((l) => ({ lead: l, ai: generateInsights(l) })), [leads]);

  // Find winner per metric
  const winners = React.useMemo(() => {
    if (insights.length < 2) return {};
    return {
      probability: insights.reduce((max, c) => c.ai.closeProbability > max.ai.closeProbability ? c : max).lead.id,
      revenue: insights.reduce((max, c) => c.ai.estimatedRevenue > max.ai.estimatedRevenue ? c : max).lead.id,
      lowRisk: insights.reduce((min, c) => c.ai.riskScore < min.ai.riskScore ? c : min).lead.id,
      fastest: insights.reduce((min, c) => c.ai.estimatedCloseInDays < min.ai.estimatedCloseInDays ? c : min).lead.id,
    };
  }, [insights]);

  if (leads.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 bg-bingo-onyx/40 backdrop-blur-sm animate-fade-in flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="w-full max-w-6xl max-h-[90vh] surface-card-elevated overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-bingo-gray-150 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-bingo-gray-500">השוואת לידים</div>
            <h2 className="text-xl font-black text-bingo-black flex items-center gap-2">
              <Trophy className="size-5 text-bingo-green-dark" />
              איזה ליד לסגור קודם?
            </h2>
          </div>
          <button onClick={onClose} className="size-9 rounded-lg hover:bg-bingo-gray-100 inline-flex items-center justify-center">
            <X className="size-4" />
          </button>
        </div>

        {/* Comparison Table */}
        <div className="flex-1 overflow-auto">
          <table className="w-full">
            <thead className="sticky top-0 bg-bingo-cream/95 backdrop-blur-sm border-b border-bingo-gray-200 z-10">
              <tr>
                <th className="w-44 px-4 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-bingo-gray-500">
                  מדד
                </th>
                {insights.map(({ lead }) => (
                  <th key={lead.id} className="px-4 py-3 min-w-[200px]">
                    <div className="flex flex-col items-center gap-1.5">
                      <Avatar name={lead.fullName} size="md" />
                      <div className="text-[13px] font-extrabold text-bingo-black text-center">{lead.fullName}</div>
                      <div className="text-[10px] font-mono text-bingo-gray-500" dir="ltr">{lead.phone || "—"}</div>
                    </div>
                  </th>
                ))}
                {onAdd && insights.length < 4 && (
                  <th className="w-32 px-4 py-3">
                    <button
                      onClick={onAdd}
                      className="size-16 rounded-2xl border-2 border-dashed border-bingo-gray-300 hover:border-bingo-green hover:text-bingo-green-dark text-bingo-gray-400 inline-flex items-center justify-center transition mx-auto"
                    >
                      <Plus className="size-5" />
                    </button>
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              <Row
                label="סיכוי לסגירה"
                icon={<Target className="size-3.5" />}
                values={insights.map((i) => `${i.ai.closeProbability}%`)}
                ids={insights.map((i) => i.lead.id)}
                winnerId={winners.probability}
                progress={insights.map((i) => i.ai.closeProbability)}
              />
              <Row
                label="צפי הכנסה"
                icon={<TrendingUp className="size-3.5" />}
                values={insights.map((i) => formatCurrency(i.ai.estimatedRevenue))}
                ids={insights.map((i) => i.lead.id)}
                winnerId={winners.revenue}
                accent="green"
              />
              <Row
                label="ציון סיכון"
                icon={<ShieldAlert className="size-3.5" />}
                values={insights.map((i) => `${i.ai.riskScore}/100`)}
                ids={insights.map((i) => i.lead.id)}
                winnerId={winners.lowRisk}
                accent="red"
              />
              <Row
                label="ימים לסגירה"
                icon={<Award className="size-3.5" />}
                values={insights.map((i) => `${i.ai.estimatedCloseInDays} ימים`)}
                ids={insights.map((i) => i.lead.id)}
                winnerId={winners.fastest}
              />
              <Row
                label="סכום מבוקש"
                values={insights.map((i) => i.lead.amountRequested ? formatCurrency(i.lead.amountRequested) : "—")}
                ids={insights.map((i) => i.lead.id)}
              />
              <Row
                label="ת.ז."
                values={insights.map((i) => i.lead.idNumber || "—")}
                ids={insights.map((i) => i.lead.id)}
                mono
              />
              <Row
                label="סנטימנט"
                values={insights.map((i) => i.ai.sentiment)}
                ids={insights.map((i) => i.lead.id)}
              />
              <Row
                label="עסקאות דומות"
                values={insights.map((i) => `${i.ai.similarDealsClosed} עסקאות`)}
                ids={insights.map((i) => i.lead.id)}
              />

              {/* Recommendation row */}
              <tr className="bg-gradient-to-bl from-bingo-green/15 to-bingo-green/5 border-t-2 border-bingo-green/40">
                <td className="px-4 py-4 text-right text-[12px] font-extrabold text-bingo-black">
                  המלצת AI
                </td>
                {insights.map(({ lead, ai }) => {
                  const isOverallWinner = lead.id === winners.probability;
                  return (
                    <td key={lead.id} className="px-4 py-4 text-center">
                      {isOverallWinner ? (
                        <div className="inline-flex flex-col items-center gap-1">
                          <span className="text-2xl">🏆</span>
                          <span className="text-[11px] font-extrabold text-bingo-green-dark">סגור קודם!</span>
                          <button className="h-8 px-3 rounded-lg bg-bingo-black text-white text-[11px] font-bold hover:bg-bingo-charcoal transition">
                            פתח עכשיו
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-bingo-gray-500">מקום {insights.sort((a, b) => b.ai.closeProbability - a.ai.closeProbability).findIndex((c) => c.lead.id === lead.id) + 1}</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-bingo-gray-150 bg-bingo-gray-50 flex items-center justify-between text-[11px] text-bingo-gray-500">
          <span>{insights.length} לידים בהשוואה · ניתן להוסיף עד 4</span>
          <button onClick={onClose} className="text-bingo-charcoal font-bold hover:underline">סגור</button>
        </div>
      </div>
    </div>
  );
}

function Row({
  label, icon, values, ids, winnerId, mono, accent, progress,
}: {
  label: string; icon?: React.ReactNode; values: string[]; ids: string[];
  winnerId?: string; mono?: boolean; accent?: "green" | "red"; progress?: number[];
}) {
  return (
    <tr className="border-t border-bingo-gray-100 hover:bg-bingo-gray-50/40">
      <td className="px-4 py-3 text-right text-[12px] font-bold text-bingo-charcoal align-middle">
        <span className="inline-flex items-center gap-1.5">
          {icon}
          {label}
        </span>
      </td>
      {values.map((v, i) => {
        const isWinner = winnerId && ids[i] === winnerId;
        return (
          <td key={i} className="px-4 py-3 text-center align-middle">
            <div className={cn(
              "inline-flex flex-col items-center gap-1 relative",
              isWinner && "font-extrabold"
            )}>
              <span className={cn(
                "text-[14px] tabular-nums",
                mono && "font-mono",
                accent === "green" && isWinner && "text-bingo-green-dark",
                accent === "red" && isWinner && "text-bingo-green-dark",
                !accent && isWinner && "text-bingo-black",
                !isWinner && "text-bingo-gray-600",
              )}>
                {v}
              </span>
              {progress && (
                <div className="h-1 w-24 bg-bingo-gray-100 rounded-full overflow-hidden">
                  <div
                    className={cn("h-full rounded-full", isWinner ? "bg-bingo-green" : "bg-bingo-gray-300")}
                    style={{ width: `${progress[i]}%` }}
                  />
                </div>
              )}
              {isWinner && <span className="text-[10px] font-bold text-bingo-green-dark inline-flex items-center gap-0.5">🏆 מנצח</span>}
            </div>
          </td>
        );
      })}
    </tr>
  );
}
