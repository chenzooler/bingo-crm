"use client";
/**
 * JourneyHeader — sticky identity + progress + save chip + call actions.
 */
import * as React from "react";
import Link from "next/link";
import {
  Phone, MessageCircle, ChevronRight, CalendarClock, Car, Banknote,
  Cloud, CloudOff, Loader2, AlertTriangle, FolderOpen, Sparkles,
} from "lucide-react";
import { worstIndicator, journeyContext, vehicleReasonLabel } from "@/lib/journey";
import { sectionMeta } from "@/lib/journey";
import { cn } from "@/lib/utils";
import { useJourney, smileyLabel } from "./useJourney";

const CONTEXT_TONE: Record<string, string> = {
  green: "bg-bingo-green-light text-bingo-green-deep",
  blue: "bg-status-blue-soft text-bingo-blue",
  orange: "bg-status-orange-soft text-[#c26a15]",
  red: "bg-status-red-soft text-status-red",
  gray: "bg-bingo-gray-100 text-bingo-gray-600",
};

export function JourneyHeader() {
  const { lead, j, track, progress, focused, saveState, conflictNotice, saveNow, setOverlay, activities } = useJourney();
  const indicator = worstIndicator(j);
  const meta = sectionMeta(focused);
  const waPhone = (lead.phone || "").replace(/\D/g, "").replace(/^0/, "972");
  const context = journeyContext(j, activities.length > 0);
  const vReason = vehicleReasonLabel(j);

  return (
    <div className="sticky top-[60px] z-30 -mx-1 px-1 pb-1 bg-bingo-cream/95 backdrop-blur-sm">
      <div className="b-card px-5 py-3.5">
        <div className="flex items-center gap-3 flex-wrap">
          <Link href="/leads" className="size-9 rounded-full bg-bingo-gray-100 hover:bg-bingo-gray-150 flex items-center justify-center text-bingo-gray-600 shrink-0" aria-label="חזרה לרשימת הלידים">
            <ChevronRight className="size-4" />
          </Link>
          <span className={cn(
            "size-11 rounded-full flex items-center justify-center text-[17px] font-bold shrink-0 transition-colors",
            j.paidAt ? "bg-bingo-green text-bingo-black" : "bg-bingo-gray-100 text-bingo-gray-700",
          )}>
            {lead.fullName.charAt(0)}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-[18px] font-bold text-bingo-black truncate">{lead.fullName}</h1>
              {indicator && (
                <span className={cn("b-chip text-[11px]",
                  indicator === "green" ? "b-chip-green" : indicator === "yellow" ? "b-chip-orange" : "b-chip-red")}>
                  <span className={cn("size-2 rounded-full",
                    indicator === "green" ? "bg-bingo-green" : indicator === "yellow" ? "bg-status-yellow" : "bg-status-red")} />
                  סמיילי {smileyLabel(indicator)}
                </span>
              )}
              {track === "general" && !j.comboVehicle && <span className="b-chip b-chip-green text-[11px]"><Banknote className="size-3" /> כל מטרה</span>}
              {track === "general" && j.comboVehicle && (
                <span className="b-chip b-chip-blue text-[11px] animate-fade-in"><Banknote className="size-3" />+<Car className="size-3" /> משולב</span>
              )}
              {track === "vehicle" && <span className="b-chip b-chip-blue text-[11px] animate-fade-in"><Car className="size-3" /> מסלול רכב</span>}
              {track === "general" && !j.comboVehicle && j.hasVehicle === "yes" && (
                <span className="b-chip b-chip-gray text-[11px]"><Car className="size-3" /> יש רכב — גיבוי</span>
              )}
              {vReason && (track === "vehicle" || j.comboVehicle) && (
                <span className="b-chip b-chip-orange text-[11px]">{vReason}</span>
              )}
              {j.exitReason && <span className="b-chip b-chip-red text-[11px]">יציאה: {j.exitReason}</span>}
            </div>
            {/* למה אנחנו מדברים עם הלקוח עכשיו — ההקשר במבט אחד */}
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11.5px] font-bold", CONTEXT_TONE[context.tone])}>
                <Sparkles className="size-3" /> {context.label}
              </span>
              {context.detail && <span className="text-[11.5px] text-bingo-gray-500">{context.detail}</span>}
              <span className="text-[11.5px] text-bingo-gray-400 tabular-nums" dir="ltr">{lead.phone || ""}</span>
            </div>
          </div>

          {/* save state */}
          <button
            onClick={saveState === "error" ? saveNow : undefined}
            className={cn(
              "hidden sm:inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold shrink-0",
              saveState === "saved" && "bg-bingo-gray-50 text-bingo-gray-400",
              saveState === "saving" && "bg-bingo-gray-100 text-bingo-gray-500",
              saveState === "error" && "bg-status-red-soft text-status-red cursor-pointer",
            )}
            title={saveState === "error" ? "לחץ לשמירה חוזרת" : "המסע נשמר אוטומטית בשרת"}
          >
            {saveState === "saved" && <><Cloud className="size-3.5" /> נשמר</>}
            {saveState === "saving" && <><Loader2 className="size-3.5 animate-spin" /> שומר…</>}
            {saveState === "error" && <><CloudOff className="size-3.5" /> שגיאה — לחץ לשמירה</>}
          </button>

          <div className="flex items-center gap-1.5 shrink-0">
            <button onClick={() => setOverlay("datasheet")} className="b-pill b-pill-dark b-pill-sm" title="כל הנתונים היבשים של הלקוח">
              <FolderOpen className="size-3.5" /> תיק לקוח
            </button>
            <a href={lead.phone ? `tel:${lead.phone}` : undefined} className="b-pill b-pill-green b-pill-sm">
              <Phone className="size-3.5" /> חייג
            </a>
            <a
              href={waPhone ? `https://wa.me/${waPhone}` : undefined}
              target="_blank" rel="noreferrer"
              className="b-pill b-pill-ghost b-pill-sm hidden sm:inline-flex"
            >
              <MessageCircle className="size-3.5" /> WhatsApp
            </a>
            <button onClick={() => setOverlay("callback")} className="b-pill b-pill-ghost b-pill-sm">
              <CalendarClock className="size-3.5" /> חזרה
            </button>
          </div>
        </div>

        {/* progress bar */}
        <div className="flex items-center gap-3 mt-3 pt-3 border-t border-bingo-gray-100">
          <div className="b-progress flex-1">
            <div style={{ width: `${progress.pct}%` }} />
          </div>
          <span className="text-[11.5px] font-semibold text-bingo-gray-500 whitespace-nowrap tabular-nums">
            {progress.done}/{progress.total} · <span className="text-bingo-black">{meta.short}</span>
          </span>
        </div>

        {conflictNotice && (
          <div className="mt-2 flex items-center gap-1.5 rounded-xl bg-status-orange-soft px-3 py-1.5 text-[12px] font-semibold text-status-orange animate-fade-in">
            <AlertTriangle className="size-3.5" />
            הכרטיס עודכן על ידי נציג אחר — הנתונים סונכרנו למצב העדכני
          </div>
        )}
      </div>
    </div>
  );
}
