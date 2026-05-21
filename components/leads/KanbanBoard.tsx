"use client";
import * as React from "react";
import Link from "next/link";
import { Avatar } from "@/components/ui/Avatar";
import { LenderMark } from "@/components/icons/ServiceIcons";
import { STAGES, type LifecycleStage } from "@/lib/data/lifecycle";
import { AUGMENTED_LEADS } from "@/lib/data/lead-augment";
import { getUser } from "@/lib/data/static";
import type { Lead } from "@/lib/types";
import { Phone, MessageCircle, MoreHorizontal, Plus, Flame, AlertTriangle } from "lucide-react";
import { cn, formatCurrency, formatDate } from "@/lib/utils";

export function KanbanBoard() {
  // Group leads by stage
  const byStage = React.useMemo(() => {
    const map: Record<string, Lead[]> = {};
    STAGES.filter((s) => s.key !== "EXIT").forEach((s) => (map[s.key] = []));
    AUGMENTED_LEADS.forEach((l) => {
      const stage = l.stage || "NEW";
      if (map[stage]) map[stage].push(l);
    });
    return map;
  }, []);

  return (
    <div className="overflow-x-auto pb-3">
      <div className="flex gap-3 min-w-max">
        {STAGES.filter((s) => s.key !== "EXIT").map((stage) => (
          <KanbanColumn key={stage.key} stage={stage.key} leads={byStage[stage.key] || []} />
        ))}
      </div>
    </div>
  );
}

function KanbanColumn({ stage, leads }: { stage: LifecycleStage; leads: Lead[] }) {
  const def = STAGES.find((s) => s.key === stage)!;
  const colorBg = {
    blue: "bg-status-blue/8 border-status-blue/30",
    yellow: "bg-status-yellow/15 border-status-yellow/30",
    orange: "bg-status-orange/8 border-status-orange/30",
    green: "bg-bingo-green/12 border-bingo-green/40",
    purple: "bg-status-purple/8 border-status-purple/30",
    pink: "bg-status-pink/8 border-status-pink/30",
    gray: "bg-bingo-gray-100 border-bingo-gray-200",
  }[def.color];

  return (
    <div className="w-80 shrink-0 flex flex-col max-h-[calc(100vh-220px)]">
      {/* Column header */}
      <div className={cn("rounded-t-2xl border border-b-0 px-3 py-2.5", colorBg)}>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-bingo-gray-500">{String(def.position).padStart(2, "0")}</div>
            <div className="text-[14px] font-extrabold text-bingo-black">{def.label}</div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-black text-bingo-black tabular-nums leading-none">{leads.length}</div>
            <div className="text-[10px] text-bingo-gray-500">לידים</div>
          </div>
        </div>
      </div>

      {/* Column body */}
      <div className="flex-1 overflow-y-auto bg-bingo-gray-50 border-x border-b border-bingo-gray-200 rounded-b-2xl p-2 space-y-2">
        {leads.length === 0 ? (
          <div className="py-8 text-center text-[11px] text-bingo-gray-400">אין לידים בשלב זה</div>
        ) : (
          leads.slice(0, 10).map((l) => <LeadCardMini key={l.id} lead={l} />)
        )}
        {leads.length > 10 && (
          <Link href={`/leads?stage=${stage}`} className="block text-center py-2 text-[11px] font-bold text-bingo-gray-500 hover:text-bingo-green-dark">
            הצג עוד {leads.length - 10} ←
          </Link>
        )}

        <button className="w-full h-9 rounded-xl border-2 border-dashed border-bingo-gray-200 hover:border-bingo-green hover:text-bingo-green-dark text-bingo-gray-500 text-xs font-bold inline-flex items-center justify-center gap-1.5 transition">
          <Plus className="size-3.5" /> ליד חדש
        </button>
      </div>
    </div>
  );
}

function LeadCardMini({ lead }: { lead: Lead }) {
  const owner = getUser(lead.ownerId);
  const isHot = lead.tags?.includes("hot");
  const isUrgent = lead.tags?.includes("urgent");

  return (
    <Link
      href={`/leads/${lead.id}`}
      className="block rounded-xl bg-white border border-bingo-gray-200 hover:border-bingo-green/40 hover:bingo-shadow-sm p-3 transition group cursor-grab"
      draggable
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <Avatar name={lead.fullName} size="sm" />
          <div className="min-w-0">
            <div className="text-[13px] font-extrabold text-bingo-black truncate">{lead.fullName}</div>
            <div className="text-[10px] font-mono tabular-nums text-bingo-gray-500" dir="ltr">{lead.phone || "—"}</div>
          </div>
        </div>
        <button className="size-6 rounded-md hover:bg-bingo-gray-100 text-bingo-gray-400 opacity-0 group-hover:opacity-100 transition inline-flex items-center justify-center">
          <MoreHorizontal className="size-3.5" />
        </button>
      </div>

      {/* Amount */}
      {lead.amountRequested && (
        <div className="text-[14px] font-extrabold text-bingo-green-dark mb-2 tabular-nums">
          {formatCurrency(lead.amountRequested)}
        </div>
      )}

      {/* Tags */}
      <div className="flex items-center gap-1 flex-wrap mb-2">
        {isHot && (
          <span className="inline-flex items-center gap-0.5 text-[9px] font-bold bg-status-red/15 text-status-red rounded-full px-1.5 py-0.5">
            <Flame className="size-2.5" /> חם
          </span>
        )}
        {isUrgent && (
          <span className="inline-flex items-center gap-0.5 text-[9px] font-bold bg-status-orange/15 text-orange-700 rounded-full px-1.5 py-0.5">
            <AlertTriangle className="size-2.5" /> דחוף
          </span>
        )}
        {lead.category && (
          <span className="text-[9px] font-bold bg-bingo-gray-100 text-bingo-gray-700 rounded-full px-1.5 py-0.5">
            {lead.category === "vehicle" ? "רכב" : lead.category === "property" ? "נכס" : lead.category === "consolidation" ? "איחוד" : "כל מטרה"}
          </span>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between gap-2 pt-2 border-t border-bingo-gray-100">
        <div className="flex items-center gap-1">
          <Avatar size="sm" name={owner?.name || ""} emoji={owner?.emoji} />
          <span className="text-[10px] font-bold text-bingo-gray-600 truncate">{owner?.name?.split(" ")[0]}</span>
        </div>
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition">
          <button title="חיוג" className="size-6 rounded-md hover:bg-status-blue/15 text-bingo-gray-500 hover:text-status-blue inline-flex items-center justify-center">
            <Phone className="size-3" />
          </button>
          <button title="WhatsApp" className="size-6 rounded-md hover:bg-emerald-100 text-bingo-gray-500 hover:text-emerald-700 inline-flex items-center justify-center">
            <MessageCircle className="size-3" />
          </button>
        </div>
      </div>
    </Link>
  );
}
