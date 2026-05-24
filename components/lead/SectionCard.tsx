"use client";
import * as React from "react";
import { ChevronDown, Check, AlertCircle, Sparkles, Zap, Lock } from "lucide-react";
import type { Lead } from "@/lib/types";
import {
  type SectionDef, type FieldDef, getFieldRelevance,
  SECTION_COLORS,
} from "@/lib/data/field-schema";
import { isFieldFilled, getSectionStats } from "@/lib/data/field-completion";
import { cn, formatCurrency } from "@/lib/utils";

interface SectionCardProps {
  lead: Lead;
  section: SectionDef;
  defaultOpen?: boolean;
  onEdit?: (fieldKey: string) => void;
}

export function SectionCard({ lead, section, defaultOpen = false, onEdit }: SectionCardProps) {
  const [open, setOpen] = React.useState(defaultOpen);
  const stats = React.useMemo(() => getSectionStats(lead, section), [lead, section]);
  const colors = SECTION_COLORS[section.color];

  // Progress ring (visual)
  const radius = 14;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (stats.pctComplete / 100) * circ;

  return (
    <div className={cn(
      "rounded-2xl border-2 bg-white overflow-hidden transition-all hover-lift",
      stats.isFullyComplete ? "border-bingo-green/40" : colors.border,
      stats.missingCritical.length > 0 && "ring-2 ring-status-red/20"
    )}>
      {/* Header */}
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "w-full flex items-center gap-3 p-3 transition",
          colors.bg,
          "hover:brightness-105"
        )}
      >
        {/* Progress ring */}
        <div className="relative size-10 shrink-0">
          <svg viewBox="0 0 36 36" className="absolute inset-0 -rotate-90">
            <circle cx="18" cy="18" r={radius} stroke="currentColor" strokeWidth="3" fill="none" className="text-bingo-gray-200" />
            <circle
              cx="18" cy="18" r={radius}
              stroke="currentColor" strokeWidth="3" fill="none"
              strokeDasharray={circ}
              strokeDashoffset={offset}
              strokeLinecap="round"
              className={cn("transition-all duration-700", colors.text)}
            />
          </svg>
          <div className="absolute inset-0 inline-flex items-center justify-center text-base">
            {stats.isFullyComplete ? <Check className={cn("size-4", colors.text)} /> : section.emoji}
          </div>
        </div>

        {/* Title + meta */}
        <div className="flex-1 text-right min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-sm font-extrabold text-bingo-black">{section.label}</span>
            {stats.missingCritical.length > 0 && (
              <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-status-red bg-status-red/10 rounded-full px-1.5 py-0.5">
                <AlertCircle className="size-2.5" />
                {stats.missingCritical.length} חוסר
              </span>
            )}
            {stats.isFullyComplete && (
              <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-bingo-green-dark bg-bingo-green/15 rounded-full px-1.5 py-0.5">
                <Check className="size-2.5" />
                מלא
              </span>
            )}
          </div>
          <div className="text-[10px] text-bingo-gray-600 mt-0.5 flex items-center gap-2">
            <span>{stats.filledFields}/{stats.totalFields} שדות</span>
            <span className="font-mono font-bold tabular-nums">{stats.pctComplete}%</span>
          </div>
        </div>

        {/* XP badge */}
        {stats.filledFields > 0 && (
          <div className="inline-flex items-center gap-0.5 text-[10px] font-bold text-bingo-charcoal bg-white rounded-md px-1.5 py-0.5 border border-bingo-gray-200">
            <Zap className="size-2.5 text-status-yellow" />
            +{stats.filledFields * (section.xpPerField || 5)} XP
          </div>
        )}

        <ChevronDown className={cn("size-4 text-bingo-gray-400 transition-transform", open && "rotate-180")} />
      </button>

      {/* Body */}
      {open && (
        <div className="p-3 space-y-2 bg-bingo-cream/30 animate-slide-in-down">
          {section.fields.map((field) => (
            <FieldRow
              key={field.key}
              field={field}
              lead={lead}
              stage={(lead.stage as never) || "NEW"}
              onEdit={onEdit}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function FieldRow({
  field, lead, stage, onEdit,
}: {
  field: FieldDef;
  lead: Lead;
  stage: never;
  onEdit?: (key: string) => void;
}) {
  const relevance = getFieldRelevance(field, stage);
  if (relevance === "hidden") return null;

  const filled = isFieldFilled(lead, field);
  const value = (lead as unknown as Record<string, unknown>)[field.key];

  const relevanceMeta = {
    critical: { dot: "bg-status-red", label: "חיוני", ring: "" },
    important: { dot: "bg-status-orange", label: "חשוב", ring: "" },
    optional: { dot: "bg-bingo-gray-300", label: "אופציונלי", ring: "" },
    hidden: { dot: "bg-transparent", label: "", ring: "" },
  }[relevance];

  return (
    <button
      onClick={() => onEdit?.(field.key)}
      disabled={field.computed}
      className={cn(
        "w-full text-right flex items-center gap-2.5 px-3 py-2 rounded-xl transition group/field",
        filled ? "bg-white border border-bingo-gray-200" : "bg-bingo-gray-50/60 border border-dashed border-bingo-gray-300 hover:border-bingo-green",
        field.computed && "cursor-not-allowed opacity-80"
      )}
    >
      {/* Status dot */}
      <span className={cn("size-1.5 rounded-full shrink-0", filled ? "bg-bingo-green" : relevanceMeta.dot)} />

      {/* Label */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className={cn("text-[12px] font-bold", filled ? "text-bingo-black" : "text-bingo-charcoal")}>
            {field.label}
          </span>
          {!filled && relevance === "critical" && (
            <span className="text-[9px] font-bold text-status-red bg-status-red/10 rounded px-1">חיוני</span>
          )}
          {field.sensitive && <Lock className="size-2.5 text-bingo-gray-400" />}
          {field.computed && <Sparkles className="size-2.5 text-bingo-green-dark" />}
        </div>
        {field.hint && !filled && (
          <div className="text-[10px] text-bingo-gray-500 mt-0.5">{field.hint}</div>
        )}
      </div>

      {/* Value */}
      <div className="text-[12px] font-mono tabular-nums text-bingo-charcoal shrink-0 max-w-[40%] truncate">
        {renderValue(field, value)}
      </div>
    </button>
  );
}

function renderValue(field: FieldDef, value: unknown): string {
  if (value === undefined || value === null || value === "") return "—";
  if (field.kind === "currency" && typeof value === "number") return formatCurrency(value);
  if (field.kind === "boolean") return value ? "כן ✓" : "לא ✗";
  if (field.kind === "tri-state") {
    if (value === true) return "כן";
    if (value === false) return "לא";
    return "—";
  }
  if (field.kind === "select" && field.options) {
    const opt = field.options.find((o) => o.value === value);
    return opt ? `${opt.emoji || ""} ${opt.label}`.trim() : String(value);
  }
  if (field.kind === "multi-select" && Array.isArray(value)) {
    return value.length === 0 ? "—" : value.map((v) => {
      const opt = field.options?.find((o) => o.value === v);
      return opt?.label || v;
    }).join(", ");
  }
  if (field.kind === "tags" && Array.isArray(value)) {
    return value.length === 0 ? "—" : `${value.length} תגיות`;
  }
  if (field.kind === "rating") return `${value} / 100`;
  if (field.sensitive && typeof value === "string" && value.length > 4) {
    return `••••${value.slice(-4)}`;
  }
  return String(value);
}
