"use client";
import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Users, Phone, ListChecks, MessageSquare, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "ראשי", icon: Home },
  { href: "/leads", label: "לידים", icon: Users },
  { href: "/dialer", label: "חיוג", icon: Phone, primary: true },
  { href: "/tasks", label: "משימות", icon: ListChecks },
  { href: "/inbox", label: "תיבה", icon: MessageSquare },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <>
      {/* Spacer to prevent content being hidden behind the nav */}
      <div className="md:hidden h-16" aria-hidden />

      {/* Bottom nav */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-xl border-t border-bingo-gray-150 bingo-shadow-lg">
        <div className="grid grid-cols-5 h-16">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));

            if (item.primary) {
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex flex-col items-center justify-center gap-0.5 relative"
                >
                  <div className="absolute -top-5 size-12 rounded-2xl bg-bingo-green text-bingo-black inline-flex items-center justify-center bingo-shadow-lg ring-4 ring-white">
                    <Icon className="size-5" />
                  </div>
                  <span className="text-[10px] font-bold text-bingo-charcoal mt-7">
                    {item.label}
                  </span>
                </Link>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 transition",
                  isActive ? "text-bingo-green-dark" : "text-bingo-gray-500 hover:text-bingo-black"
                )}
              >
                <Icon className={cn("size-5", isActive && "stroke-[2.5]")} />
                <span className={cn("text-[10px] font-bold", isActive && "font-extrabold")}>
                  {item.label}
                </span>
                {isActive && (
                  <span className="absolute top-1 size-1 rounded-full bg-bingo-green" />
                )}
              </Link>
            );
          })}
        </div>
        {/* Safe area for iOS home indicator */}
        <div className="h-[env(safe-area-inset-bottom)] bg-white" />
      </nav>
    </>
  );
}
