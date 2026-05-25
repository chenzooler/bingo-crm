"use client";
import * as React from "react";
import { cn } from "@/lib/utils";

type Tone =
  | "purple" | "blue" | "cyan" | "green" | "lime" | "yellow"
  | "orange" | "red" | "pink" | "indigo" | "teal" | "rose" | "bingo";

interface Icon3DProps {
  icon: React.ReactNode;
  tone?: Tone;
  size?: number;
  className?: string;
}

/**
 * 3D iOS-style squircle icon container.
 * Mimics App Store icons — gradient body, top highlight, drop shadow.
 */
export function Icon3D({ icon, tone = "purple", size = 40, className }: Icon3DProps) {
  return (
    <span
      className={cn(`icon-3d icon-3d-${tone}`, className)}
      style={{ width: size, height: size }}
    >
      {icon}
    </span>
  );
}
