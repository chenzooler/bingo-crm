"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home, Users, Rocket, MessageCircle, Phone, Calendar,
  ListChecks, BarChart3, Tv, ShieldCheck, Settings, Sun, Database, Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * NavRail — the primary navigation. Icon + label, always visible.
 *
 * מצב שכפול-יועצים (החלטת חן 06/07/26): מציגים רק את מה שקיים במקור —
 * מסך ראשי (רשימת הלידים) + הגדרות. משימות/דוחות מגיעים מהמסך הראשי עצמו
 * (הפאנל וכפתור "תצוגת דוח"), בדיוק כמו ביועצים. כל תוספות בינגו מוסתרות
 * ב-NAV_HIDDEN — מחזירים פריט ע"י העברתו חזרה ל-NAV.
 */
const NAV: Array<{ href: string; label: string; icon: React.ElementType; match?: string[] }> = [
  { href: "/leads", label: "ראשי", icon: Home, match: ["/leads"] },
];

const NAV_BOTTOM: Array<{ href: string; label: string; icon: React.ElementType; match?: string[] }> = [
  { href: "/settings", label: "הגדרות", icon: Settings, match: ["/settings"] },
];

// תוספות בינגו — מוסתרות עד שנחזיר אותן בשלב הפיצ'רים. הדפים עצמם חיים ב-URL.
export const NAV_HIDDEN: Array<{ href: string; label: string; icon: React.ElementType; match?: string[] }> = [
  { href: "/briefing",       label: "בוקר",     icon: Sun },
  { href: "/desk",           label: "רֶצֶף",     icon: Layers, match: ["/desk"] },
  { href: "/dashboard",      label: "הבית",     icon: Home },
  { href: "/dialer/cockpit", label: "תותח",     icon: Rocket, match: ["/dialer"] },
  { href: "/inbox",          label: "הודעות",   icon: MessageCircle },
  { href: "/calls",          label: "שיחות",    icon: Phone },
  { href: "/calendar",       label: "יומן",     icon: Calendar },
  { href: "/tasks",          label: "משימות",   icon: ListChecks },
  { href: "/reports",        label: "דוחות",    icon: BarChart3 },
  { href: "/wallboard",      label: "מסך חי",   icon: Tv },
  { href: "/admin/import",   label: "סנכרון",   icon: Database, match: ["/admin/import"] },
  { href: "/admin",          label: "מנהל",     icon: ShieldCheck, match: ["/admin"] },
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
