import { Trophy, ChevronLeft, Lock } from "lucide-react";
import { BONUS_TIERS, getCurrentBonus } from "@/lib/data/performance";
import { formatCurrency, formatNumber, cn } from "@/lib/utils";

export function BonusTrack({ monthlyDeals }: { monthlyDeals: number }) {
  const { current, next, progress, remaining } = getCurrentBonus(monthlyDeals);
  return (
    <div className="rounded-3xl bg-white border border-bingo-gray-200 bingo-shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-bingo-gray-500 inline-flex items-center gap-1">
            <Trophy className="size-3" /> מסלול בונוסים
          </div>
          <h2 className="text-xl font-extrabold text-bingo-black mt-0.5">
            {current ? (
              <>
                <span className="text-bingo-green-dark">{current.label}</span>
                <span className="text-bingo-gray-500 font-bold text-sm mr-2">{formatCurrency(current.bonus)}</span>
              </>
            ) : (
              "טרם נכנסת לבונוס"
            )}
          </h2>
        </div>
        {next && (
          <div className="text-left">
            <div className="text-[10px] uppercase tracking-wider text-bingo-gray-500 font-bold">הבא בתור</div>
            <div className="text-base font-extrabold text-bingo-black">{next.label}</div>
            <div className="text-[12px] font-mono tabular-nums font-bold text-bingo-green-dark">{formatCurrency(next.bonus)}</div>
          </div>
        )}
      </div>

      {/* Bonus tiers row */}
      <div className="relative">
        {/* Track line */}
        <div className="absolute right-0 left-0 top-7 h-1 bg-bingo-gray-100 rounded-full" />
        <div
          className="absolute right-0 top-7 h-1 bg-gradient-to-l from-bingo-green-dark via-bingo-green to-bingo-green-bright rounded-full transition-all duration-700"
          style={{ width: `${getOverallProgress(monthlyDeals)}%` }}
        />

        <div className="relative flex items-start justify-between">
          {BONUS_TIERS.map((tier) => {
            const reached = monthlyDeals >= tier.threshold;
            const isCurrent = current?.threshold === tier.threshold;
            return (
              <div key={tier.threshold} className="flex flex-col items-center text-center w-1/5">
                <div
                  className={cn(
                    "size-14 rounded-2xl inline-flex items-center justify-center font-black text-base mb-2 border-2 transition",
                    reached
                      ? "bg-bingo-green border-bingo-green text-bingo-black bingo-glow-soft"
                      : "bg-white border-bingo-gray-200 text-bingo-gray-400"
                  )}
                >
                  {reached ? (
                    <Trophy className="size-5" />
                  ) : (
                    <Lock className="size-4" />
                  )}
                </div>
                <div className={cn("text-[11px] font-extrabold", reached ? "text-bingo-black" : "text-bingo-gray-500")}>
                  {tier.label}
                </div>
                <div className={cn("text-[10px] font-mono tabular-nums", reached ? "text-bingo-green-dark font-bold" : "text-bingo-gray-400")}>
                  {tier.threshold} עסקאות
                </div>
                <div className={cn("text-[10px] font-bold", reached ? "text-bingo-charcoal" : "text-bingo-gray-400")}>
                  {formatCurrency(tier.bonus)}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {next && (
        <div className="mt-4 pt-4 border-t border-bingo-gray-100 flex items-center justify-between">
          <div className="text-[13px] text-bingo-charcoal">
            עוד <span className="font-extrabold text-bingo-green-dark tabular-nums">{remaining}</span> עסקאות לבונוס <strong>{next.label}</strong>
          </div>
          <div className="text-[12px] font-mono tabular-nums font-bold text-bingo-charcoal">
            +{formatCurrency(next.bonus - (current?.bonus || 0))} למעלה
          </div>
        </div>
      )}
    </div>
  );
}

function getOverallProgress(monthlyDeals: number): number {
  const maxTier = BONUS_TIERS[BONUS_TIERS.length - 1].threshold;
  return Math.min(100, (monthlyDeals / maxTier) * 100);
}
