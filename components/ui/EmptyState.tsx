import * as React from "react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center text-center py-12 px-6", className)}>
      {icon && (
        <div className="size-16 rounded-2xl bg-gradient-to-bl from-bingo-green/15 to-bingo-green/5 border border-bingo-green/30 inline-flex items-center justify-center text-bingo-green-dark mb-4">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-extrabold text-bingo-black mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-bingo-gray-600 max-w-md leading-relaxed">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

/* Visual illustrations for empty states */
export function EmptyIllustration({ kind, className }: { kind: "leads" | "calls" | "tasks" | "search" | "messages"; className?: string }) {
  const path = {
    leads: <path d="M9 6l3-3 3 3M12 3v12M5 19h14" />,
    calls: <path d="M5 4h4l2 5-3 1.5c1 2 3 4 5 5L14 12l5 2v4a2 2 0 01-2 2C9 20 3 14 3 6a2 2 0 012-2z" />,
    tasks: <><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" /></>,
    search: <><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></>,
    messages: <path d="M21 12c0 4-4 7-9 7-1.5 0-3-.3-4-.8L3 20l1-4c-1-1.2-1-2.5-1-4 0-4 4-7 9-7s9 3 9 7z" />,
  }[kind];
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      {path}
    </svg>
  );
}
