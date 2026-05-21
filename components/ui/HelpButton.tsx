"use client";
import * as React from "react";
import Link from "next/link";
import * as Popover from "@radix-ui/react-popover";
import {
  HelpCircle, Keyboard, BookOpen, Sparkles, MessageSquare,
  Mail, Lightbulb, Play, ExternalLink, Download,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MenuItem {
  icon: React.ReactNode;
  label: string;
  description: string;
  onClick?: () => void;
  href?: string;
  accent?: "green" | "blue" | "purple" | "orange";
}

export function HelpButton() {
  const [open, setOpen] = React.useState(false);

  function restartTour() {
    try {
      localStorage.removeItem("bingo-onboarding-complete");
      window.location.reload();
    } catch {}
  }

  function openShortcuts() {
    setOpen(false);
    setTimeout(() => {
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "?", bubbles: true }));
    }, 50);
  }

  const items: MenuItem[] = [
    {
      icon: <Download className="size-4" />,
      label: "התקן את האפליקציה",
      description: "להתקין את BINGO על הטלפון/מחשב",
      href: "/install",
      accent: "green",
    },
    {
      icon: <Play className="size-4" />,
      label: "התחל את הסיור מחדש",
      description: "סקירה מהירה של תכונות המערכת",
      onClick: restartTour,
      accent: "green",
    },
    {
      icon: <Keyboard className="size-4" />,
      label: "קיצורי מקלדת",
      description: "פעל מהר יותר עם הקלדה",
      onClick: openShortcuts,
      accent: "blue",
    },
    {
      icon: <BookOpen className="size-4" />,
      label: "ויקי המערכת",
      description: "מדריכים, נהלים ושאלות נפוצות",
      href: "/wiki",
      accent: "purple",
    },
    {
      icon: <Sparkles className="size-4" />,
      label: "מה חדש?",
      description: "פיצ'רים חדשים שהושקו לאחרונה",
      href: "/docs/strategy",
      accent: "orange",
    },
    {
      icon: <Lightbulb className="size-4" />,
      label: "טיפים יומיים",
      description: "טיפים לעבודה יעילה יותר",
      href: "/insights",
      accent: "blue",
    },
    {
      icon: <MessageSquare className="size-4" />,
      label: "פנה לתמיכה",
      description: "צ'אט חי עם הצוות שלנו",
      href: "/inbox",
      accent: "green",
    },
  ];

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button
          className={cn(
            "fixed bottom-20 md:bottom-6 right-6 z-40 size-12 rounded-2xl bg-bingo-black text-bingo-green hover:bg-bingo-charcoal inline-flex items-center justify-center bingo-shadow-lg transition group",
            open && "ring-4 ring-bingo-green/30"
          )}
          aria-label="עזרה"
          title="עזרה (Shift+?)"
        >
          <HelpCircle className="size-5 group-hover:scale-110 transition" />
          {/* Pulse ring */}
          <span className="absolute inset-0 rounded-2xl ring-2 ring-bingo-green/40 animate-pulse-green pointer-events-none" />
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          align="end"
          side="top"
          sideOffset={12}
          className="w-80 surface-card-elevated overflow-hidden z-50 animate-fade-in"
        >
          {/* Header */}
          <div className="px-4 py-3 bg-gradient-to-bl from-bingo-green/15 to-transparent border-b border-bingo-gray-150">
            <div className="flex items-center gap-2.5">
              <div className="size-10 rounded-xl bg-bingo-black text-bingo-green inline-flex items-center justify-center">
                <HelpCircle className="size-5" />
              </div>
              <div>
                <div className="text-sm font-extrabold text-bingo-black">מרכז עזרה</div>
                <div className="text-[11px] text-bingo-gray-500">צריך עזרה? אנחנו כאן</div>
              </div>
            </div>
          </div>

          {/* Menu items */}
          <div className="p-1.5 max-h-96 overflow-y-auto">
            {items.map((item, i) =>
              item.href ? (
                <Link key={i} href={item.href} onClick={() => setOpen(false)}>
                  <MenuItemRow item={item} />
                </Link>
              ) : (
                <button
                  key={i}
                  onClick={item.onClick}
                  className="w-full text-right"
                >
                  <MenuItemRow item={item} />
                </button>
              )
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2.5 border-t border-bingo-gray-150 bg-bingo-gray-50 flex items-center justify-between">
            <a
              href="mailto:support@bingoisrael.co.il"
              className="text-[11px] font-bold text-bingo-gray-600 hover:text-bingo-black inline-flex items-center gap-1"
            >
              <Mail className="size-3" />
              support@bingoisrael.co.il
            </a>
            <span className="text-[10px] text-bingo-gray-400">v1.0.0</span>
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

function MenuItemRow({ item }: { item: MenuItem }) {
  const accentBg = {
    green: "bg-bingo-green/12 text-bingo-green-dark",
    blue: "bg-status-blue/12 text-status-blue",
    purple: "bg-status-purple/12 text-status-purple",
    orange: "bg-status-orange/12 text-orange-700",
  }[item.accent || "blue"];

  return (
    <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-bingo-gray-100 transition group">
      <div className={cn("size-9 rounded-lg inline-flex items-center justify-center shrink-0", accentBg)}>
        {item.icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-bold text-bingo-black truncate">{item.label}</div>
        <div className="text-[11px] text-bingo-gray-500 truncate">{item.description}</div>
      </div>
      <ExternalLink className="size-3 text-bingo-gray-300 group-hover:text-bingo-charcoal transition shrink-0" />
    </div>
  );
}
