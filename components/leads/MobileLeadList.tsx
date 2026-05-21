"use client";
import * as React from "react";
import Link from "next/link";
import { Phone, MessageCircle, MoreHorizontal, Flame, AlertTriangle, Lock } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { LeadTemperatureGauge } from "@/components/ui/LeadTemperatureGauge";
import { LEADS } from "@/lib/data/leads";
import { getUser, getStatus } from "@/lib/data/static";
import { AUGMENTED_LEADS } from "@/lib/data/lead-augment";
import { generateInsights } from "@/lib/data/ai-insights";
import { formatCurrency, formatDate, cn } from "@/lib/utils";

interface MobileLeadListProps {
  pipeline?: string;
  status?: string;
}

export function MobileLeadList({ pipeline, status }: MobileLeadListProps) {
  const list = React.useMemo(() => {
    return AUGMENTED_LEADS.filter((l) => (pipeline ? l.primaryPipeline === pipeline : true))
      .filter((l) => (status ? l.primaryStatus === status : true))
      .slice(0, 50);
  }, [pipeline, status]);

  if (list.length === 0) {
    return (
      <div className="py-16 text-center text-sm text-bingo-gray-500">אין לידים בתצוגה</div>
    );
  }

  return (
    <div className="space-y-2">
      {list.map((lead) => (
        <MobileLeadCard key={lead.id} lead={lead} />
      ))}
    </div>
  );
}

function MobileLeadCard({ lead }: { lead: typeof AUGMENTED_LEADS[number] }) {
  const owner = getUser(lead.ownerId);
  const st = getStatus(lead.primaryStatus);
  const ai = generateInsights(lead);
  const isHot = lead.tags?.includes("hot");
  const isUrgent = lead.tags?.includes("urgent");

  return (
    <Link
      href={`/leads/${lead.id}`}
      className="block bg-white rounded-2xl border border-bingo-gray-200 p-3 active:bg-bingo-gray-50 active:scale-[0.99] transition"
    >
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <Avatar name={lead.fullName} size="md" />

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className="text-[14px] font-extrabold text-bingo-black truncate">
                  {lead.fullName}
                </h3>
                {lead.locked && <Lock className="size-3 text-bingo-gray-400 shrink-0" />}
              </div>
              <div className="text-[11px] font-mono tabular-nums text-bingo-gray-500" dir="ltr">
                {lead.phone || "—"}
              </div>
            </div>
            {/* Mini temp gauge */}
            <div className="shrink-0">
              <LeadTemperatureGauge score={ai.closeProbability} size="sm" showLabel={false} animated={false} />
            </div>
          </div>

          {/* Status + amount */}
          <div className="flex items-center gap-1.5 flex-wrap mb-2">
            {st && (
              <span
                className="text-[10px] font-bold rounded-md px-1.5 py-0.5 text-white whitespace-nowrap"
                style={{ background: st.color || "#6E6D69" }}
              >
                {st.label}
              </span>
            )}
            {lead.amountRequested && (
              <span className="text-[11px] font-extrabold text-bingo-green-dark tabular-nums">
                {formatCurrency(lead.amountRequested)}
              </span>
            )}
            {isHot && (
              <span className="inline-flex items-center gap-0.5 text-[9px] font-bold bg-status-red/15 text-status-red rounded-full px-1.5">
                <Flame className="size-2.5" /> חם
              </span>
            )}
            {isUrgent && (
              <span className="inline-flex items-center gap-0.5 text-[9px] font-bold bg-status-orange/15 text-orange-700 rounded-full px-1.5">
                <AlertTriangle className="size-2.5" /> דחוף
              </span>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between gap-2 pt-2 border-t border-bingo-gray-100">
            <div className="flex items-center gap-1.5 text-[10px] text-bingo-gray-500">
              {owner && (
                <>
                  <Avatar name={owner.name} emoji={owner.emoji} size="sm" />
                  <span className="font-bold truncate">{owner.name.split(" ")[0]}</span>
                </>
              )}
              <span className="text-bingo-gray-300">·</span>
              <span className="font-mono tabular-nums">{formatDate(lead.intakeDate)}</span>
            </div>
            <div className="flex items-center gap-0.5">
              {lead.phone && (
                <button
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.location.href = `tel:${lead.phone}` }}
                  className="size-8 rounded-lg bg-status-blue/10 text-status-blue inline-flex items-center justify-center active:bg-status-blue/20 transition"
                >
                  <Phone className="size-3.5" />
                </button>
              )}
              {lead.phone && (
                <button
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.location.href = `https://wa.me/${lead.phone}` }}
                  className="size-8 rounded-lg bg-emerald-100 text-emerald-700 inline-flex items-center justify-center active:bg-emerald-200 transition"
                >
                  <MessageCircle className="size-3.5" />
                </button>
              )}
              <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation() }}
                className="size-8 rounded-lg bg-bingo-gray-100 text-bingo-gray-500 inline-flex items-center justify-center active:bg-bingo-gray-200 transition"
              >
                <MoreHorizontal className="size-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
