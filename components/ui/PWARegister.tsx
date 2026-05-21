"use client";
import * as React from "react";

/** Registers the service worker once on client mount. */
export function PWARegister() {
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;
    if (process.env.NODE_ENV !== "production") return; // skip in dev

    const t = setTimeout(() => {
      navigator.serviceWorker
        .register("/sw.js")
        .catch((err) => console.warn("[BINGO PWA] SW registration failed:", err));
    }, 1500);

    return () => clearTimeout(t);
  }, []);

  return null;
}
