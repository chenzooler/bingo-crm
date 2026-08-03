"use client";
import * as React from "react";
import { cn } from "@/lib/utils";
import { useCallReview } from "./CallReviewContext";
import { formatDuration } from "./quality-utils";

/**
 * כפתור קטן שמקפיץ את ההקלטה לזמן נתון. משמש לראיות של כללי בקרה,
 * לציטוטי התנגדויות ולרגעי מפתח. אם לא נמצאה חותמת זמן - מוצג טקסט רגיל
 * בלי אשליה שאפשר ללחוץ.
 */
export function SeekButton({
  seconds,
  children,
  className,
  showTime = false,
}: {
  seconds: number | null;
  children: React.ReactNode;
  className?: string;
  showTime?: boolean;
}) {
  const { seekTo } = useCallReview();

  if (seconds === null) {
    return <span className={cn("cursor-default", className)}>{children}</span>;
  }

  return (
    <button
      type="button"
      onClick={() => seekTo(seconds)}
      className={cn("text-right transition hover:brightness-95", className)}
      title="הקפץ את ההקלטה לרגע הזה"
    >
      {children}
      {showTime && (
        <span className="mr-1.5 text-[10px] font-mono tabular-nums opacity-60">{formatDuration(seconds)}</span>
      )}
    </button>
  );
}
