"use client";
/**
 * ClickToCallPhone — מספר טלפון לחיץ: לחיצה מחייגת דרך Voicenter
 * (POST /api/calls/dial) עם משוב מיידי במקום. שימוש בכותרת הכרטיס ובטבלאות.
 */
import * as React from "react";
import { Phone, Loader2, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export function ClickToCallPhone({ leadId, phone, className }: {
  leadId: number;
  phone: string;
  className?: string;
}) {
  const [state, setState] = React.useState<"idle" | "busy" | "ok" | "err">("idle");
  const [err, setErr] = React.useState<string | null>(null);

  const call = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (state === "busy") return;
    setState("busy");
    setErr(null);
    try {
      const res = await fetch("/api/calls/dial", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId, phone }),
      });
      const data = await res.json().catch(() => null);
      if (res.ok && data?.ok) {
        setState("ok");
      } else {
        setState("err");
        setErr(data?.error ?? "החיוג נכשל");
      }
    } catch {
      setState("err");
      setErr("החיוג נכשל");
    }
    setTimeout(() => { setState("idle"); setErr(null); }, 4000);
  };

  return (
    <span className={cn("inline-flex items-center gap-1", className)}>
      <button
        type="button"
        onClick={call}
        title="חיוג דרך Voicenter"
        className={cn(
          "inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 transition-colors hover:bg-bingo-green/15 hover:text-bingo-green-dark",
          state === "ok" && "text-bingo-green-dark",
          state === "err" && "text-status-red",
        )}
      >
        {state === "busy" ? (
          <Loader2 className="size-3 shrink-0 animate-spin" />
        ) : state === "ok" ? (
          <Check className="size-3 shrink-0" />
        ) : (
          <Phone className="size-3 shrink-0" />
        )}
        <span className="tabular-nums" dir="ltr">{phone}</span>
      </button>
      {state === "ok" && <span className="text-[10.5px] font-bold text-bingo-green-dark">מחייג...</span>}
      {err && <span className="text-[10.5px] font-bold text-status-red">{err}</span>}
    </span>
  );
}
