import * as React from "react";
import { cn } from "@/lib/utils";

const colorMap: Record<string, string> = {
  green: "bg-bingo-green/15 text-bingo-green-dark border-bingo-green/30",
  yellow: "bg-status-yellow/20 text-amber-700 border-status-yellow/40",
  red: "bg-status-red/12 text-status-red border-status-red/25",
  blue: "bg-status-blue/12 text-status-blue border-status-blue/25",
  orange: "bg-status-orange/15 text-orange-700 border-status-orange/30",
  purple: "bg-status-purple/12 text-status-purple border-status-purple/25",
  pink: "bg-status-pink/12 text-status-pink border-status-pink/25",
  gray: "bg-bingo-gray-100 text-bingo-gray-700 border-bingo-gray-200",
};

export function Tag({
  children,
  color = "gray",
  className,
  ...props
}: { children: React.ReactNode; color?: keyof typeof colorMap } & React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-bold whitespace-nowrap",
        colorMap[color],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
