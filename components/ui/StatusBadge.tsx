import * as React from "react";
import { StatusGlyph as Glyph, type StatusKind } from "@/components/icons/PipelineIcons";
import type { StatusDef } from "@/lib/types";
import { cn } from "@/lib/utils";

const colorMap: Record<string, string> = {
  green: "bg-bingo-green/12 text-bingo-green-dark border-bingo-green/30",
  yellow: "bg-status-yellow-soft text-amber-700 border-status-yellow/40",
  red: "bg-status-red-soft text-status-red border-status-red/30",
  blue: "bg-status-blue-soft text-status-blue border-status-blue/30",
  orange: "bg-status-orange-soft text-orange-700 border-status-orange/30",
  purple: "bg-status-purple-soft text-status-purple border-status-purple/25",
  pink: "bg-status-pink-soft text-status-pink border-status-pink/25",
  gray: "bg-bingo-gray-100 text-bingo-gray-700 border-bingo-gray-200",
};

export function StatusBadge({ status, size = "md", className }: { status: StatusDef; size?: "sm" | "md"; className?: string }) {
  const glyphKind = (status.glyph || inferGlyph(status.key)) as StatusKind;
  const palette = colorMap[status.color] || colorMap.gray;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border font-bold whitespace-nowrap",
        size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-[11px]",
        palette,
        className
      )}
    >
      <Glyph kind={glyphKind} size={size === "sm" ? 11 : 13} />
      <span>{status.label}</span>
    </span>
  );
}

/** Infer glyph from status key for backward compat */
function inferGlyph(key: string): StatusKind {
  if (/-new$/.test(key) || key === "u-new" || key === "g-ready") return "new";
  if (/no-answer/.test(key)) return "no-answer";
  if (/callback/.test(key)) return "callback";
  if (/waiting|wait/.test(key)) return "waiting";
  if (/approv|paid/.test(key)) return "approved";
  if (/reject|sorba|sorav/.test(key)) return "rejected";
  if (/sign|חתימ|חוז/.test(key)) return "sign";
  if (/docs|מסמכים/.test(key)) return "docs";
  if (/bdi|block|spam|legal/.test(key)) return "blocked";
  if (/id|תז/.test(key)) return "id";
  if (/check|בדיק/.test(key)) return "checking";
  if (/chat|whatsapp|ווצאפ|wati/.test(key)) return "chat";
  if (/hot/.test(key)) return "hot";
  if (/paid|שילם/.test(key)) return "paid";
  return "waiting";
}
