"use client";
import * as React from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Icon3D } from "@/components/ui/Icon3D";

const TONE_MAP: Record<string, "bingo" | "blue" | "orange" | "green" | "purple" | "red" | "pink"> = {
  bingo: "bingo",
  blue: "blue",
  orange: "orange",
  green: "green",
  purple: "purple",
  red: "red",
};

type Accent = "bingo" | "blue" | "orange" | "green" | "purple" | "red";

interface SparklineKpiProps {
  label: string;
  value: string;
  delta?: number; // % change vs previous period
  data: number[]; // sparkline data points
  accent?: Accent;
  highlight?: boolean;
  icon?: React.ReactNode;
  subtitle?: string;
}

const PALETTE: Record<Accent, { gradient: string; border: string; stroke: string; fill: string; text: string }> = {
  bingo: {
    gradient: "from-bingo-green/15 to-bingo-green/3",
    border: "border-bingo-green/40",
    stroke: "#2EA10D",
    fill: "rgba(80, 255, 10, 0.18)",
    text: "text-bingo-green-dark",
  },
  blue: {
    gradient: "from-status-blue/12 to-status-blue/3",
    border: "border-status-blue/25",
    stroke: "#0A66FF",
    fill: "rgba(10, 102, 255, 0.14)",
    text: "text-status-blue",
  },
  orange: {
    gradient: "from-status-orange/12 to-status-orange/3",
    border: "border-status-orange/25",
    stroke: "#FF8514",
    fill: "rgba(255, 133, 20, 0.14)",
    text: "text-orange-700",
  },
  green: {
    gradient: "from-bingo-green/20 to-bingo-green/8",
    border: "border-bingo-green/50",
    stroke: "#2EA10D",
    fill: "rgba(80, 255, 10, 0.22)",
    text: "text-bingo-green-dark",
  },
  purple: {
    gradient: "from-status-purple/12 to-status-purple/3",
    border: "border-status-purple/25",
    stroke: "#8A4FFF",
    fill: "rgba(138, 79, 255, 0.14)",
    text: "text-status-purple",
  },
  red: {
    gradient: "from-status-red/12 to-status-red/3",
    border: "border-status-red/25",
    stroke: "#F03A47",
    fill: "rgba(240, 58, 71, 0.14)",
    text: "text-status-red",
  },
};

export function SparklineKpi({
  label, value, delta, data, accent = "bingo", highlight, icon, subtitle,
}: SparklineKpiProps) {
  const p = PALETTE[accent];

  return (
    <div
      className={cn(
        "rounded-2xl bg-gradient-to-bl border p-4 hover-lift transition group relative overflow-hidden",
        p.gradient, p.border,
        highlight && "bingo-glow-soft"
      )}
    >
      {/* Sparkline as background */}
      <div className="absolute inset-x-0 bottom-0 h-12 opacity-70 group-hover:opacity-100 transition pointer-events-none">
        <Sparkline data={data} stroke={p.stroke} fill={p.fill} />
      </div>

      {/* Content */}
      <div className="relative">
        <div className="flex items-start justify-between mb-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-bingo-gray-600 mt-1">{label}</span>
          {icon && <Icon3D icon={icon} tone={TONE_MAP[accent] || "bingo"} size={32} />}
        </div>
        <div className="text-2xl sm:text-3xl font-black text-bingo-black tabular-nums mt-0.5 leading-none num-display">
          {value}
        </div>
        <div className="flex items-center justify-between mt-1.5">
          {subtitle && <span className="text-[10px] text-bingo-gray-500 font-medium">{subtitle}</span>}
          {delta !== undefined && (
            <span
              className={cn(
                "inline-flex items-center gap-0.5 text-[10px] font-bold tabular-nums px-1.5 py-0.5 rounded-md ml-auto",
                delta > 0
                  ? "bg-bingo-green/15 text-bingo-green-dark"
                  : delta < 0
                    ? "bg-status-red/15 text-status-red"
                    : "bg-bingo-gray-100 text-bingo-charcoal"
              )}
            >
              {delta > 0 ? <TrendingUp className="size-3" /> : delta < 0 ? <TrendingDown className="size-3" /> : <Minus className="size-3" />}
              {Math.abs(delta).toFixed(1)}%
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function Sparkline({ data, stroke, fill }: { data: number[]; stroke: string; fill: string }) {
  if (!data || data.length < 2) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 100;
  const h = 30;
  const step = w / (data.length - 1);

  const points = data.map((v, i) => {
    const x = i * step;
    const y = h - ((v - min) / range) * h;
    return { x, y };
  });

  const pathLine = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const pathFill = `${pathLine} L ${w} ${h} L 0 ${h} Z`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="w-full h-full">
      <path d={pathFill} fill={fill} />
      <path d={pathLine} fill="none" stroke={stroke} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
      {/* End dot */}
      <circle cx={points[points.length - 1].x} cy={points[points.length - 1].y} r="2" fill={stroke} />
    </svg>
  );
}
