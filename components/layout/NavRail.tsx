"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home, Users, Rocket, MessageCircle, Phone, Calendar,
  ListChecks, BarChart3, Tv, ShieldCheck, Settings, Sun, Database,
} from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * NavRail — the primary navigation. Icon + label, always visible,
 * obvious. Replaces the old 11-links-crammed-in-header pattern.
 */
const NAV: Array<{ href: string; label: string; icon: React.ElementType; match?: string[] }> = [
  { href: "/briefing",       label: "בוקר",     icon: Sun },
  { href: "/dashboard",      label: "הבית",     icon: Home },
  { href: "/leads",          label: "לידים",    icon: Users, match: ["/leads"] },
  { href: "/dialer/cockpit", label: "תותח",     icon: Rocket, match: ["/dialer"] },
  { href: "/inbox",          label: "הודעות",   icon: MessageCircle },
  { href: "/calls",          label: "שיחות",    icon: Phone },
  { href: "/calendar",       label: "יומן",     icon: Calendar },
  { href: "/tasks",          label: "משימות",   icon: ListChecks },
  { href: "/reports",        label: "דוחות",    icon: BarChart3 },
  { href: "/wallboard",      label: "מסך חי",   icon: Tv },
];

const NAV_BOTTOM: Array<{ href: string; label: string; icon: React.ElementType; match?: string[] }> = [
  { href: "/admin/import", label: "סנכרון", icon: Database, match: ["/admin/import"] },
  { href: "/admin",        label: "מנהל",   icon: ShieldCheck, match: ["/admin"] },
  { href: "/settings",     label: "הגדרות", icon: Settings, match: ["/settings"] },
];

function RailLink({ item, active }: { item: (typeof NAV)[number]; active: boolean }) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      className={cn(
        "flex flex-col items-center gap-1 w-[62px] py-2 rounded-2xl transition-all",
        active
          ? "bg-bingo-black text-white shadow-md"
          : "text-bingo-gray-500 hover:bg-bingo-gray-100 hover:text-bingo-black"
      )}
    >
      <Icon className={cn("size-[19px]", active && "text-bingo-green")} strokeWidth={active ? 2.4 : 2} />
      <span className="text-[10px] font-semibold leading-none">{item.label}</span>
    </Link>
  );
}

export function NavRail() {
  const pathname = usePathname();
  const isActive = (item: { href: string; match?: string[] }) =>
    item.match
      ? item.match.some((m) => pathname === m || pathname.startsWith(m + "/"))
      : pathname === item.href || pathname.startsWith(item.href + "/");

  // /admin/import must win over /admin
  const activeHref = [...NAV_BOTTOM, ...NAV]
    .filter(isActive)
    .sort((a, b) => b.href.length - a.href.length)[0]?.href;

  return (
    <nav className="hidden md:flex flex-col items-center gap-1 w-[86px] shrink-0 py-3 sticky top-[60px] h-[calc(100vh-60px)] overflow-y-auto scrollbar-none bg-white border-l border-bingo-gray-150">
      {NAV.map((item) => (
        <RailLink key={item.href} item={item} active={item.href === activeHref} />
      ))}
      <div className="flex-1" />
      <div className="w-10 h-px bg-bingo-gray-150 my-1" />
      {NAV_BOTTOM.map((item) => (
        <RailLink key={item.href} item={item} active={item.href === activeHref} />
      ))}
    </nav>
  );
}
