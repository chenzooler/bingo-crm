"use client";
import * as React from "react";
import { AlarmClock, Phone } from "lucide-react";
import { cn } from "@/lib/utils";
import { useJourney } from "../useJourney";

/** the 1-hour wait after signing — timer is server-persisted (callbackDueAt) */
export function CooldownSection() {
  const { j, track, startChecks } = useJourney();
  const done = !!j.checksStartedAt;
  const [now, setNow] = React.useState(() => Date.now());

  React.useEffect(() => {
    if (done) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [done]);

  const due = j.callbackDueAt ? new Date(j.callbackDueAt).getTime() : now;
  const remain = Math.max(0, due - now);
  const ready = remain === 0;
  const mm = String(Math.floor(remain / 60000)).padStart(2, "0");
  const ss = String(Math.floor((remain % 60000) / 1000)).padStart(2, "0");

  return (
    <div className="flex items-center gap-5 flex-wrap">
      <span className={cn("b-icon size-14 shrink-0", done ? "b-icon-green" : "b-icon-orange")}>
        <AlarmClock className="size-7" />
      </span>
      <div className="flex-1 min-w-48">
        <h3 className="text-[17px] font-bold text-bingo-black">
          {done ? "החזרה בוצעה ✓" : ready ? "הגיע הזמן — חזור ללקוח!" : "חזרה ללקוח בעוד"}
        </h3>
        <p className="text-[12.5px] text-bingo-gray-500">
          {track === "vehicle"
            ? "בשיחה: מבקשים 4 מסמכים (רישיון רכב, ת.ז, רישיון נהיגה, אישור ניהול חשבון)"
            : "בשיחה: מריצים בדיקות זכאות בכל גופי המימון"}
        </p>
      </div>
      {!done && (
        <>
          {!ready && (
            <span className="font-mono text-[44px] font-bold text-bingo-black tabular-nums leading-none">
              {mm}:{ss}
            </span>
          )}
          <button onClick={startChecks} className={cn("b-pill b-pill-lg", ready ? "b-pill-green animate-pulse-green" : "b-pill-ghost")}>
            <Phone className="size-4" /> {ready ? "התקשר עכשיו" : "הלקוח זמין — דלג"}
          </button>
        </>
      )}
    </div>
  );
}
