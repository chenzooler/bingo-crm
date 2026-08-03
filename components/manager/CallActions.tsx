"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { RefreshCw, Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

/** "הרץ ניתוח מחדש" - שולח את השיחה חזרה למנוע ומרענן את המסך */
export function RerunAnalysisButton({ callId, size = "md" }: { callId: number; size?: "sm" | "md" }) {
  const router = useRouter();
  const [busy, setBusy] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);

  const run = async () => {
    if (busy) return;
    setBusy(true);
    setErr(null);
    try {
      const res = await fetch(`/api/ai/calls/${callId}/process`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ force: true }),
      });
      if (!res.ok) {
        setErr(res.status === 404 ? "מנוע הניתוח עוד לא מחובר" : "הרצת הניתוח נכשלה");
      } else {
        router.refresh();
      }
    } catch {
      setErr("אין תקשורת עם השרת");
    } finally {
      setBusy(false);
    }
  };

  return (
    <span className="inline-flex items-center gap-2">
      <button
        type="button"
        onClick={() => void run()}
        disabled={busy}
        className={cn("b-pill b-pill-ghost", size === "sm" && "b-pill-sm", "disabled:opacity-60")}
      >
        {busy ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4" />}
        הרץ ניתוח מחדש
      </button>
      {err && <span className="text-[11px] text-status-red font-bold">{err}</span>}
    </span>
  );
}

/** "סמן כטופל" - סוגר את כל ההתראות הפתוחות של השיחה */
export function ResolveAlertsButton({ alertIds }: { alertIds: number[] }) {
  const router = useRouter();
  const [busy, setBusy] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);

  if (alertIds.length === 0) return null;

  const resolve = async () => {
    if (busy) return;
    setBusy(true);
    setErr(null);
    try {
      const results = await Promise.all(
        alertIds.map((id) =>
          fetch(`/api/alerts/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ read: true, resolved: true }),
          }).catch(() => null),
        ),
      );
      if (results.some((r) => !r || !r.ok)) setErr("חלק מההתראות לא נסגרו");
      router.refresh();
    } finally {
      setBusy(false);
    }
  };

  return (
    <span className="inline-flex items-center gap-2">
      <button
        type="button"
        onClick={() => void resolve()}
        disabled={busy}
        className="b-pill b-pill-dark b-pill-sm disabled:opacity-60"
      >
        {busy ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
        סמן כטופל
      </button>
      {err && <span className="text-[11px] text-status-red font-bold">{err}</span>}
    </span>
  );
}
