"use client";
/**
 * שורת החיפוש של המסך הראשי — כמו ב-Yoatsim:
 * חיפוש מהיר (שם/טלפון/ת.ז) · חיפוש מתקדם · לפי משתמש · לפי תהליך.
 * הפילטרים מתמזגים ל-URL כך שאפשר לשלב חיפוש + משתמש + תהליך.
 */
import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, SlidersHorizontal } from "lucide-react";
import { PROCESSES } from "@/lib/yoatsim/processes";

export interface UserOption {
  id: number;
  name: string;
  emoji: string | null;
}

export function SearchRow({ users, q, owner, process }: {
  users: UserOption[];
  q?: string;
  owner?: string;
  process?: string;
}) {
  const router = useRouter();
  const [text, setText] = React.useState(q ?? "");

  // מיזוג פילטרים: שינוי אחד לא מאפס את השאר (סטטוס כן מתאפס כשמחליפים תהליך)
  const push = (overrides: Record<string, string | undefined>) => {
    const merged: Record<string, string | undefined> = { q, owner, process, ...overrides };
    const usp = new URLSearchParams();
    for (const [k, v] of Object.entries(merged)) if (v) usp.set(k, v);
    const qs = usp.toString();
    router.push(`/leads${qs ? `?${qs}` : ""}`);
  };

  return (
    <div className="b-card p-3 flex items-center gap-2 flex-wrap">
      <form
        className="relative flex-1 min-w-52"
        onSubmit={(e) => {
          e.preventDefault();
          push({ q: text.trim() || undefined });
        }}
      >
        <Search className="size-4 text-bingo-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="חיפוש מהיר: שם, טלפון או תעודת זהות…"
          className="b-input h-10 pr-10 text-[13px]"
        />
      </form>

      <button
        onClick={() => push({ q: text.trim() || undefined })}
        className="b-pill b-pill-sm b-pill-dark"
      >
        חיפוש
      </button>

      <Link href="/search" className="b-pill b-pill-sm b-pill-ghost">
        <SlidersHorizontal className="size-4" />
        חיפוש מתקדם
      </Link>

      <select
        value={owner ?? ""}
        onChange={(e) => push({ owner: e.target.value || undefined })}
        className="b-input h-10 w-44 text-[13px] cursor-pointer"
        aria-label="חיפוש לפי משתמש"
      >
        <option value="">לפי משתמש</option>
        {users.map((u) => (
          <option key={u.id} value={u.id}>
            {u.emoji ? `${u.emoji} ` : ""}{u.name}
          </option>
        ))}
      </select>

      <select
        value={process ?? ""}
        onChange={(e) => push({ process: e.target.value || undefined })}
        className="b-input h-10 w-48 text-[13px] cursor-pointer"
        aria-label="חיפוש לפי תהליך"
      >
        <option value="">לפי תהליך</option>
        {PROCESSES.map((p) => (
          <option key={p.key} value={p.key}>
            {p.emoji} {p.name}
          </option>
        ))}
      </select>
    </div>
  );
}
