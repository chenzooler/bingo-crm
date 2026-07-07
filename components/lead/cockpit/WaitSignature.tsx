"use client";
/**
 * WaitSignature — מצב ההמתנה לחתימה: כרטיס תכלת חי (פעימה איטית, לא ספינר),
 * מוצג בקוקפיט כשיש טופס שנשלח וטרם נחתם.
 * "שלח שוב" = POST נוסף · "סמן כנחתם" = PATCH → הכרטיס נפתח לתיק מלא (+קונפטי).
 */
import * as React from "react";
import { FileSignature, RotateCcw, PenLine, Loader2 } from "lucide-react";
import { GlassIcon } from "@/components/ui/GlassIcon";
import { formatDate, formatTime } from "@/lib/utils";
import type { SentFormRow } from "./shared";

export function WaitSignature({ form, phone, onResend, onMarkSigned }: {
  form: SentFormRow;
  phone: string | null;
  onResend: () => Promise<boolean>;
  onMarkSigned: () => Promise<boolean>;
}) {
  const [busy, setBusy] = React.useState<"resend" | "sign" | null>(null);

  const run = async (kind: "resend" | "sign", fn: () => Promise<boolean>) => {
    if (busy) return;
    setBusy(kind);
    await fn();
    setBusy(null);
  };

  return (
    <div className="b-spring-in b-card b-tint-sky p-5 flex items-center gap-4 flex-wrap">
      {/* המתנה חיה — עדשה פועמת, לא ספינר גנרי */}
      <div className="relative shrink-0">
        <GlassIcon icon={FileSignature} tone="blue" size={44} label="ממתין לחתימה" />
        <span
          className="b-scan absolute -top-1 -left-1 size-3 rounded-full"
          style={{ background: "radial-gradient(circle at 32% 28%, #BBDFFF, var(--color-bingo-blue, #1F81D6) 60%, #14588F)" }}
          aria-hidden="true"
        />
      </div>

      <div className="flex-1 min-w-52">
        <p className="text-[15px] font-extrabold text-bingo-black">
          הסכם &quot;{form.templateName}&quot; נשלח {phone ? `ל-${phone}` : "ללקוח"} — ממתין לחתימה
        </p>
        <p className="text-[12px] text-bingo-gray-500 tabular-nums mt-0.5">
          נשלח בוואטסאפ · {formatDate(form.sentAt)} {formatTime(form.sentAt)}
        </p>
      </div>

      <div className="flex gap-2 shrink-0">
        <button
          type="button"
          disabled={!!busy}
          onClick={() => void run("resend", onResend)}
          className="b-lift b-pill b-pill-ghost b-pill-sm disabled:opacity-50"
        >
          {busy === "resend" ? <Loader2 className="size-3.5 animate-spin" /> : <RotateCcw className="size-3.5" />}
          שלח שוב
        </button>
        <button
          type="button"
          disabled={!!busy}
          onClick={() => void run("sign", onMarkSigned)}
          className="b-lift b-pill b-pill-green b-pill-sm disabled:opacity-50"
        >
          {busy === "sign" ? <Loader2 className="size-3.5 animate-spin" /> : <PenLine className="size-3.5" />}
          סמן כנחתם
        </button>
      </div>
    </div>
  );
}
