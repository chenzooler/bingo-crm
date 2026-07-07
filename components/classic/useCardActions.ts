"use client";
/**
 * useCardActions — פעולות הכותרת של כרטיס הלקוח: שכפול · כרטיס בדיקה · ארכיון.
 * חולץ מ-ClassicLeadCard כדי שהקוקפיט ישתמש בדיוק באותה התנהגות.
 */
import * as React from "react";
import { useRouter } from "next/navigation";

export function useCardActions(lead: { id: number; archived: boolean }) {
  const router = useRouter();
  const [archived, setArchived] = React.useState(lead.archived);
  const [cloning, setCloning] = React.useState<"duplicate" | "test" | null>(null);
  const cloningRef = React.useRef(false);

  const cloneCard = React.useCallback(async (kind: "duplicate" | "test") => {
    if (cloningRef.current) return;
    cloningRef.current = true;
    setCloning(kind);
    try {
      const res = await fetch(`/api/leads/${lead.id}/clone`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(kind === "test" ? { kind: "test" } : {}),
      });
      if (res.ok) {
        const row = await res.json();
        router.push(`/leads/${row.id}`);
        return;
      }
    } catch { /* נשאר בכרטיס */ }
    cloningRef.current = false;
    setCloning(null);
  }, [lead.id, router]);

  const toggleArchive = React.useCallback(async () => {
    const next = !archived;
    if (next && !window.confirm("להעביר את הכרטיס לארכיון?")) return;
    try {
      const res = await fetch(`/api/leads/${lead.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ archived: next }),
      });
      if (res.ok) setArchived(next);
    } catch { /* best effort */ }
  }, [archived, lead.id]);

  return { archived, cloning, cloneCard, toggleArchive };
}
