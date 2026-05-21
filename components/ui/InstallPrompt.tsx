"use client";
import * as React from "react";
import { Download, X, Sparkles, Smartphone, Apple, Share, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const STORAGE_KEY = "bingo-install-dismissed";
const REMIND_DAYS = 7;

export function InstallPrompt() {
  const [deferred, setDeferred] = React.useState<BeforeInstallPromptEvent | null>(null);
  const [open, setOpen] = React.useState(false);
  const [isIOS, setIsIOS] = React.useState(false);
  const [isStandalone, setIsStandalone] = React.useState(false);

  React.useEffect(() => {
    if (typeof window === "undefined") return;

    // Check if already installed
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as { standalone?: boolean }).standalone === true;
    setIsStandalone(standalone);
    if (standalone) return;

    // iOS detection
    const ua = navigator.userAgent;
    const iOS = /iPhone|iPad|iPod/.test(ua) && !(window as { MSStream?: unknown }).MSStream;
    setIsIOS(iOS);

    // Check dismissed
    try {
      const dismissedAt = localStorage.getItem(STORAGE_KEY);
      if (dismissedAt) {
        const daysSince = (Date.now() - parseInt(dismissedAt, 10)) / 86400000;
        if (daysSince < REMIND_DAYS) return;
      }
    } catch {}

    // Android: capture beforeinstallprompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      // Show after 8 seconds delay
      setTimeout(() => setOpen(true), 8000);
    };
    window.addEventListener("beforeinstallprompt", handler);

    // iOS: show after 12 seconds
    if (iOS) {
      const t = setTimeout(() => setOpen(true), 12000);
      return () => {
        clearTimeout(t);
        window.removeEventListener("beforeinstallprompt", handler);
      };
    }

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  async function install() {
    if (!deferred) return;
    await deferred.prompt();
    const result = await deferred.userChoice;
    if (result.outcome === "accepted") {
      setOpen(false);
    }
    setDeferred(null);
  }

  function dismiss() {
    setOpen(false);
    try {
      localStorage.setItem(STORAGE_KEY, Date.now().toString());
    } catch {}
  }

  if (!open || isStandalone) return null;

  return (
    <div className="fixed bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:w-96 z-50 animate-slide-in-up">
      <div className="surface-card-elevated overflow-hidden bingo-shadow-lg">
        {/* Header */}
        <div className="px-4 py-3 bg-gradient-to-bl from-bingo-green/20 via-bingo-green/8 to-transparent border-b border-bingo-gray-150 relative">
          <button
            onClick={dismiss}
            className="absolute top-2 left-2 size-7 rounded-lg hover:bg-bingo-gray-100 inline-flex items-center justify-center text-bingo-gray-500"
            aria-label="סגור"
          >
            <X className="size-3.5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="size-12 rounded-2xl bg-bingo-black text-bingo-green inline-flex items-center justify-center bingo-shadow-sm relative">
              <Smartphone className="size-6" />
              <span className="absolute -top-1 -right-1 size-4 rounded-full bg-bingo-green text-bingo-black inline-flex items-center justify-center text-[10px] font-black">
                ✓
              </span>
            </div>
            <div>
              <div className="text-sm font-black text-bingo-black flex items-center gap-1.5">
                התקן את BINGO CRM
                <Sparkles className="size-3.5 text-bingo-green-dark" />
              </div>
              <div className="text-[11px] text-bingo-gray-600">
                {isIOS ? "באייפון/אייפד שלך" : "אפליקציה מלאה לטלפון שלך"}
              </div>
            </div>
          </div>
        </div>

        {/* Benefits */}
        <div className="px-4 py-3 space-y-1.5">
          <Benefit emoji="⚡" text="פתיחה מהירה ישירות ממסך הבית" />
          <Benefit emoji="🔔" text="התראות push בזמן אמת" />
          <Benefit emoji="📱" text="עובד גם ללא חיבור לאינטרנט" />
          <Benefit emoji="🎯" text="חוויית אפליקציה מלאה" />
        </div>

        {/* iOS instructions */}
        {isIOS && (
          <div className="mx-4 mb-3 p-3 rounded-xl bg-bingo-gray-50 border border-bingo-gray-200 text-[12px] text-bingo-charcoal">
            <div className="font-bold mb-1.5 inline-flex items-center gap-1.5">
              <Apple className="size-3.5" />
              איך מתקינים?
            </div>
            <ol className="space-y-1 list-none pr-1">
              <li className="flex items-start gap-2">
                <span className="font-mono text-[11px] bg-white border border-bingo-gray-200 rounded px-1.5 shrink-0">1</span>
                <span>לחץ על <Share className="inline size-3" /> בתפריט Safari</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-mono text-[11px] bg-white border border-bingo-gray-200 rounded px-1.5 shrink-0">2</span>
                <span>בחר <strong>"הוסף למסך הבית"</strong></span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-mono text-[11px] bg-white border border-bingo-gray-200 rounded px-1.5 shrink-0">3</span>
                <span>לחץ <strong>"הוסף"</strong> והאפליקציה מותקנת!</span>
              </li>
            </ol>
          </div>
        )}

        {/* Action buttons */}
        <div className="px-4 py-3 border-t border-bingo-gray-150 bg-bingo-gray-50 flex items-center gap-2">
          <button
            onClick={dismiss}
            className="text-[11px] font-bold text-bingo-gray-500 hover:text-bingo-black px-2 py-1"
          >
            לא תודה
          </button>
          {!isIOS && deferred && (
            <button
              onClick={install}
              className="flex-1 h-9 rounded-lg bg-bingo-black text-bingo-green hover:bg-bingo-charcoal text-[12px] font-bold inline-flex items-center justify-center gap-1.5 transition bingo-shadow-sm"
            >
              <Download className="size-3.5" />
              התקן עכשיו
            </button>
          )}
          {isIOS && (
            <button
              onClick={() => setOpen(false)}
              className="flex-1 h-9 rounded-lg bg-bingo-black text-bingo-green hover:bg-bingo-charcoal text-[12px] font-bold inline-flex items-center justify-center gap-1.5 transition bingo-shadow-sm"
            >
              הבנתי
              <Apple className="size-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Benefit({ emoji, text }: { emoji: string; text: string }) {
  return (
    <div className="flex items-center gap-2 text-[12px] text-bingo-charcoal">
      <span className="text-sm">{emoji}</span>
      <span>{text}</span>
    </div>
  );
}
