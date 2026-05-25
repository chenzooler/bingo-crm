"use client";
import * as React from "react";
import { Flame } from "lucide-react";
import { cn } from "@/lib/utils";

type Temperature = "cold" | "warm" | "hot" | "blazing";

interface Props {
  temperature: Temperature;
  score?: number;
}

const CONFIG: Record<Temperature, { label: string; gradient: string; glow: string; emoji: string }> = {
  cold:     { label: "קר",      gradient: "from-blue-400 to-cyan-500",       glow: "shadow-blue-500/30",  emoji: "❄️" },
  warm:     { label: "פושר",    gradient: "from-amber-400 to-orange-500",    glow: "shadow-amber-500/30", emoji: "☀️" },
  hot:      { label: "חם",      gradient: "from-orange-500 to-red-500",      glow: "shadow-red-500/40",   emoji: "🔥" },
  blazing:  { label: "בוער",    gradient: "from-red-500 via-orange-500 to-yellow-500", glow: "shadow-red-500/50", emoji: "🌋" },
};

export function HotLeadBadge({ temperature, score }: Props) {
  const cfg = CONFIG[temperature];
  const animated = temperature === "hot" || temperature === "blazing";

  return (
    <div className={cn(
      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-white text-[11px] font-black shadow-md",
      `bg-gradient-to-r ${cfg.gradient}`,
      cfg.glow,
      animated && "animate-pulse",
    )}>
      <span className={cn("text-[13px] leading-none", animated && "float-rotate")}>{cfg.emoji}</span>
      <span>{cfg.label.toUpperCase()}</span>
      {score !== undefined && (
        <span className="bg-white/25 rounded px-1.5 py-0.5 tabular-nums text-[10px]">{score}</span>
      )}
    </div>
  );
}
