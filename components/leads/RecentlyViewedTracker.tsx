"use client";
/**
 * רישום "נצפו לאחרונה" — כל כניסה לכרטיס לקוח נרשמת ב-localStorage,
 * ומוצגת בכפתור הכתום במסך הראשי (שכפול Yoatsim).
 */
import * as React from "react";

const KEY = "bingo-recently-viewed";
const MAX_ITEMS = 15;

export function RecentlyViewedTracker({ id, name }: { id: number; name: string }) {
  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      const list: { id: number; name: string; at: string }[] = raw ? JSON.parse(raw) : [];
      const next = [
        { id, name, at: new Date().toISOString() },
        ...list.filter((x) => x && x.id !== id),
      ].slice(0, MAX_ITEMS);
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      /* localStorage לא זמין — מדלגים בשקט */
    }
  }, [id, name]);

  return null;
}
