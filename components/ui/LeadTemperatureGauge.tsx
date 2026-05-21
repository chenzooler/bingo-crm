"use client";
import * as React from "react";
import { Flame, Snowflake, Thermometer, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface LeadTemperatureGaugeProps {
  /** 0-100 score */
  score: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  animated?: boolean;
}

const TEMPS = [
  { max: 20, label: "קר", emoji: "🥶", color: "#0A66FF", grad: "from-blue-400 to-blue-600", icon: Snowflake },
  { max: 40, label: "פושר", emoji: "❄️", color: "#5C9FFF", grad: "from-cyan-400 to-blue-500", icon: Thermometer },
  { max: 60, label: "חמים", emoji: "🌡️", color: "#FF8514", grad: "from-orange-400 to-orange-600", icon: Thermometer },
  { max: 80, label: "חם", emoji: "🔥", color: "#F03A47", grad: "from-orange-500 to-red-500", icon: Flame },
  { max: 101, label: "בוער", emoji: "🚀", color: "#50FF0A", grad: "from-bingo-green to-emerald-500", icon: Zap },
];

export function LeadTemperatureGauge({ score, size = "md", showLabel = true, animated = true }: LeadTemperatureGaugeProps) {
  const clamped = Math.max(0, Math.min(100, score));
  const meta = TEMPS.find((t) => clamped < t.max) || TEMPS[TEMPS.length - 1];
  const Icon = meta.icon;

  const dimensions = {
    sm: { box: 60, stroke: 6, fontSize: "text-[11px]", iconSize: "size-3" },
    md: { box: 100, stroke: 8, fontSize: "text-[14px]", iconSize: "size-4" },
    lg: { box: 140, stroke: 10, fontSize: "text-[18px]", iconSize: "size-5" },
  }[size];

  const radius = (dimensions.box - dimensions.stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  // Semi-circle gauge — half circumference
  const halfCirc = circumference / 2;
  const offset = halfCirc - (clamped / 100) * halfCirc;

  return (
    <div className="flex flex-col items-center gap-1 inline-block">
      <div className="relative" style={{ width: dimensions.box, height: dimensions.box / 2 + 10 }}>
        <svg
          viewBox={`0 0 ${dimensions.box} ${dimensions.box}`}
          className="absolute inset-0 -rotate-180 origin-center"
          style={{ width: dimensions.box, height: dimensions.box }}
        >
          <defs>
            <linearGradient id={`gauge-grad-${score}-${size}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0A66FF" />
              <stop offset="35%" stopColor="#FF8514" />
              <stop offset="65%" stopColor="#F03A47" />
              <stop offset="100%" stopColor="#50FF0A" />
            </linearGradient>
          </defs>
          {/* Background arc */}
          <circle
            cx={dimensions.box / 2}
            cy={dimensions.box / 2}
            r={radius}
            stroke="#E8E7E2"
            strokeWidth={dimensions.stroke}
            fill="none"
            strokeDasharray={`${halfCirc} ${circumference}`}
            strokeLinecap="round"
          />
          {/* Active arc */}
          <circle
            cx={dimensions.box / 2}
            cy={dimensions.box / 2}
            r={radius}
            stroke={`url(#gauge-grad-${score}-${size})`}
            strokeWidth={dimensions.stroke}
            fill="none"
            strokeDasharray={`${halfCirc - offset} ${circumference}`}
            strokeLinecap="round"
            className={animated ? "transition-all duration-1000 ease-out" : ""}
            style={{
              filter: clamped > 75 ? `drop-shadow(0 0 6px ${meta.color})` : undefined,
            }}
          />
        </svg>
        {/* Center content */}
        <div className="absolute inset-x-0 bottom-0 flex flex-col items-center justify-end" style={{ height: dimensions.box / 2 }}>
          <div className={cn("font-black text-bingo-black tabular-nums leading-none", dimensions.fontSize)}>
            {clamped}
          </div>
          <div className="text-[8px] uppercase tracking-wider text-bingo-gray-500 font-bold leading-none mt-0.5">
            ציון
          </div>
        </div>
      </div>
      {showLabel && (
        <div
          className={cn(
            "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold border",
            clamped < 20 && "bg-blue-50 border-blue-200 text-blue-700",
            clamped >= 20 && clamped < 40 && "bg-cyan-50 border-cyan-200 text-cyan-700",
            clamped >= 40 && clamped < 60 && "bg-orange-50 border-orange-200 text-orange-700",
            clamped >= 60 && clamped < 80 && "bg-red-50 border-red-200 text-red-700",
            clamped >= 80 && "bg-bingo-green/15 border-bingo-green/40 text-bingo-green-dark",
          )}
        >
          <Icon className={dimensions.iconSize} />
          {meta.label}
        </div>
      )}
    </div>
  );
}
