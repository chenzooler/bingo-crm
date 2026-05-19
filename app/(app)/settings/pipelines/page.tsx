"use client";
import * as React from "react";
import { PIPELINES, STATUSES } from "@/lib/data/static";
import { PipelineGlyph } from "@/components/icons/PipelineIcons";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Plus, GripVertical, Pencil, Trash2 } from "lucide-react";
import { formatNumber } from "@/lib/utils";

export default function PipelinesSettingsPage() {
  const [activePipeline, setActivePipeline] = React.useState(PIPELINES[0].key);
  const statuses = STATUSES.filter((s) => s.pipeline === activePipeline);

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-3xl border border-bingo-gray-200 bingo-shadow-sm p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-bingo-gray-500">זרימת עבודה</div>
            <h2 className="text-xl font-extrabold text-bingo-black">תהליכים וסטטוסים</h2>
            <p className="text-[12px] text-bingo-gray-600 mt-1">{PIPELINES.length} תהליכים, {STATUSES.length} סטטוסים</p>
          </div>
          <button className="h-9 px-3 rounded-xl bg-bingo-black text-white text-xs font-bold hover:bg-bingo-charcoal inline-flex items-center gap-1.5">
            <Plus className="size-3.5" /> תהליך חדש
          </button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
          {PIPELINES.map((p) => (
            <button
              key={p.key}
              onClick={() => setActivePipeline(p.key)}
              className={`flex items-center gap-2.5 p-3 rounded-2xl border-2 transition text-right ${
                activePipeline === p.key
                  ? "border-bingo-green bg-bingo-green/8"
                  : "border-bingo-gray-200 bg-white hover:border-bingo-gray-300"
              }`}
            >
              <span className={`size-10 rounded-xl inline-flex items-center justify-center shrink-0 ${
                activePipeline === p.key ? "bg-bingo-green text-bingo-black" : "bg-bingo-gray-100 text-bingo-charcoal"
              }`}>
                <PipelineGlyph kind={p.key} size={18} />
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-extrabold text-bingo-black truncate">{p.label}</div>
                <div className="text-[10px] font-mono tabular-nums text-bingo-gray-500">{formatNumber(p.count)} לידים</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-bingo-gray-200 bingo-shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-bingo-gray-100 flex items-center justify-between">
          <h3 className="text-base font-extrabold text-bingo-black">סטטוסים בתהליך זה ({statuses.length})</h3>
          <button className="h-8 px-3 rounded-xl bg-bingo-green hover:bg-bingo-green-bright text-bingo-black text-xs font-bold inline-flex items-center gap-1.5">
            <Plus className="size-3.5" /> סטטוס
          </button>
        </div>
        <div>
          {statuses.map((s, i) => (
            <div
              key={s.key}
              className="px-6 py-3 border-b border-bingo-gray-100 last:border-0 flex items-center justify-between gap-3 hover:bg-bingo-gray-50/40 group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <GripVertical className="size-4 text-bingo-gray-300 cursor-grab" />
                <span className="text-[10px] font-mono tabular-nums font-bold text-bingo-gray-400 w-6 text-center">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <StatusBadge status={s} />
                <span className="text-[11px] font-mono tabular-nums text-bingo-gray-500">{formatNumber(s.count)} לידים</span>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                <button className="size-7 rounded-lg hover:bg-bingo-gray-100 text-bingo-gray-500 hover:text-bingo-black inline-flex items-center justify-center">
                  <Pencil className="size-3.5" />
                </button>
                <button className="size-7 rounded-lg hover:bg-status-red/10 text-bingo-gray-500 hover:text-status-red inline-flex items-center justify-center">
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
