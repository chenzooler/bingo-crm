"use client";
import * as React from "react";
import { useToast } from "./Toast";

/**
 * Simulates real-time push notifications that pop up periodically.
 * In production this connects to a WebSocket/SSE stream.
 */
const SAMPLE_EVENTS = [
  { type: "success" as const, title: "🎉 עסקה חדשה נסגרה!", desc: "מאיה לוי סגרה ₪180K — מזל טוב" },
  { type: "info" as const, title: "📞 ליד חם ממתין", desc: "דנה כהן פתחה את ה-WhatsApp שלך עכשיו" },
  { type: "warning" as const, title: "⚠️ ליד תקוע", desc: "יואב פרי לא חזר 4 ימים — כדאי לחייג" },
  { type: "info" as const, title: "✨ AI המליץ", desc: "3 לידים חדשים מתאימים לסגירה מהירה" },
  { type: "success" as const, title: "🏆 הישג חדש!", desc: 'פתחת תג חדש: "שבוע לוהט"' },
  { type: "info" as const, title: "💰 תשלום עמלה", desc: "התקבל תשלום ₪3,200 לחשבון" },
];

export function LiveToastSimulator({ enabled = false }: { enabled?: boolean }) {
  const { push } = useToast();
  const fired = React.useRef(false);

  React.useEffect(() => {
    if (!enabled || fired.current) return;
    fired.current = true;

    // Welcome notification after 5 seconds
    const welcomeTimer = setTimeout(() => {
      push({
        type: "info",
        title: "👋 ברוך הבא ל-BINGO CRM",
        description: "לחץ ⌘J כדי לפתוח את ה-AI Assistant",
      });
    }, 5000);

    // Then random events every 30-90 seconds
    let cancelled = false;
    const scheduleNext = () => {
      if (cancelled) return;
      const delay = 30000 + Math.random() * 60000;
      const t = setTimeout(() => {
        if (cancelled) return;
        const event = SAMPLE_EVENTS[Math.floor(Math.random() * SAMPLE_EVENTS.length)];
        push({ type: event.type, title: event.title, description: event.desc });
        scheduleNext();
      }, delay);
      return t;
    };
    const eventTimer = scheduleNext();

    return () => {
      clearTimeout(welcomeTimer);
      cancelled = true;
      if (eventTimer) clearTimeout(eventTimer);
    };
  }, [enabled, push]);

  return null;
}
