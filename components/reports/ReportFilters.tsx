"use client";
/**
 * פילטרי תצוגת הדוח — בורר משתמש + בורר תהליך.
 * הפילטרים מתמזגים ל-URL (?user, ?process) כך שהדוח כולו מסונן בשרת.
 */
import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { PROCESSES } from "@/lib/yoatsim/processes";

export interface ReportUserOption { id: number; name: string; emoji: string | null }

export function ReportFilters({ users, user, process }: {
  users: ReportUserOption[];
  user?: string;
  process?: string;
}) {
  const router = useRouter();

  const push = (overrides: Record<string, string | undefined>) => {
    const merged: Record<string, string | undefined> = { user, process, ...overrides };
    const usp = new URLSearchParams();
    for (const [k, v] of Object.entries(merged)) if (v) usp.set(k, v);
    const qs = usp.toString();
    router.push(`/reports${qs ? `?${qs}` : ""}`);
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <select
        value={user ?? ""}
        onChange={(e) => push({ user: e.target.value || undefined })}
        className="b-input h-10 w-44 text-[13px] cursor-pointer"
        aria-label="דוח לפי משתמש"
      >
        <option value="">כל המשתמשים</option>
        {users.map((u) => (
          <option key={u.id} value={u.id}>
            {u.emoji ? `${u.emoji} ` : ""}{u.name}
          </option>
        ))}
      </select>

      <select
        value={process ?? ""}
        onChange={(e) => push({ process: e.target.value || undefined })}
        className="b-input h-10 w-52 text-[13px] cursor-pointer"
        aria-label="פירוט סטטוסים לתהליך"
      >
        <option value="">פירוט סטטוסים — בחר תהליך</option>
        {PROCESSES.map((p) => (
          <option key={p.key} value={p.key}>
            {p.emoji} {p.name}
          </option>
        ))}
      </select>

      {(user || process) && (
        <Link href="/reports" className="b-chip b-chip-gray text-[11px] hover:bg-bingo-gray-150 transition">
          <X className="size-3" /> נקה סינון
        </Link>
      )}
    </div>
  );
}
