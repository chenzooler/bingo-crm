"use client";
import * as React from "react";
import { MessageCircle, Send, FileSignature, CheckCircle2, Copy, Check } from "lucide-react";
import { cn, formatTime } from "@/lib/utils";
import { useJourney } from "../useJourney";

export function ContractSection() {
  const { j, lead, track, markContractSent, markSigned } = useJourney();
  const [copied, setCopied] = React.useState(false);
  const signed = !!j.signedAt;

  const signLink = typeof window !== "undefined" ? `${window.location.origin}/sign/${lead.id}` : `/sign/${lead.id}`;
  const waText = encodeURIComponent(
    `היי ${lead.fullName.split(" ")[0]}, כאן בינגו מימון 🎯\nהנה הסכם ההתקשרות שלך לחתימה דיגיטלית:\n${signLink}`,
  );
  const waPhone = (lead.phone || "").replace(/\D/g, "").replace(/^0/, "972");

  function copyLink() {
    void navigator.clipboard.writeText(signLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  if (signed) {
    return (
      <p className="text-[14px] font-bold text-bingo-green-dark flex items-center gap-2">
        <CheckCircle2 className="size-5" />
        נחתם ב-{formatTime(j.signedAt!)} — משימת חזרה נוצרה אוטומטית לעוד שעה
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-[12.5px] text-bingo-gray-500">
        מסלול: <b className="text-bingo-black">{track === "vehicle" ? "הלוואה כנגד רכב" : "הלוואה לכל מטרה"}</b>
        {" · "}דף החתימה: <span className="tabular-nums" dir="ltr">{signLink}</span>
      </p>

      {!j.contractSentAt ? (
        <div className="flex items-center gap-2.5 flex-wrap">
          <a
            href={waPhone ? `https://wa.me/${waPhone}?text=${waText}` : undefined}
            target="_blank"
            rel="noreferrer"
            onClick={() => markContractSent("whatsapp")}
            className="b-pill b-pill-green flex-1 min-w-40"
          >
            <MessageCircle className="size-4" /> שלח ב-WhatsApp
          </a>
          <button onClick={() => markContractSent("sms")} className="b-pill b-pill-ghost flex-1 min-w-40">
            <Send className="size-4" /> שלח ב-SMS
          </button>
          <button onClick={copyLink} className="b-pill b-pill-ghost shrink-0" title="העתק קישור">
            {copied ? <Check className="size-4 text-bingo-green-dark" /> : <Copy className="size-4" />}
            {copied ? "הועתק!" : "העתק קישור"}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-[12.5px] font-semibold text-bingo-green-dark flex items-center gap-1.5">
            <CheckCircle2 className="size-4" /> נשלח ב-{j.contractSentVia === "whatsapp" ? "WhatsApp" : "SMS"} · ממתין לחתימה
          </p>
          <button onClick={markSigned} className={cn("b-pill b-pill-green b-pill-lg w-full")}>
            <FileSignature className="size-5" /> הלקוח חתם ✓
          </button>
          <button onClick={copyLink} className="text-[11.5px] text-bingo-gray-400 hover:text-bingo-gray-600 inline-flex items-center gap-1">
            <Copy className="size-3" /> {copied ? "הקישור הועתק!" : "העתק שוב את קישור החתימה"}
          </button>
        </div>
      )}
    </div>
  );
}
