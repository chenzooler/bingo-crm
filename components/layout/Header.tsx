"use client";
import * as React from "react";
import Link from "next/link";
import { Search, Bell, Settings, FileText, ChevronDown, HelpCircle, Plus, BarChart3, Phone, MessageCircle, ShieldCheck, ListChecks, Home, Radar, Tv } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { Avatar } from "@/components/ui/Avatar";
import { CommandPalette } from "@/components/ui/CommandPalette";
import { NotificationDropdown } from "@/components/layout/NotificationDropdown";
import { UserDropdown } from "@/components/layout/UserDropdown";
import { ThemeQuickToggle } from "@/components/ui/ThemeToggle";
import { cn } from "@/lib/utils";

export function Header({ onToggleSidebar }: { onToggleSidebar?: () => void }) {
  return (
    <>
      <CommandPalette />
      <header className="h-12 sticky top-0 z-40 surface-toolbar flex items-center px-4 lg:px-5 gap-3">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="p-2 -mr-2 rounded-lg hover:bg-bingo-gray-100 lg:hidden text-bingo-charcoal"
          aria-label="תפריט"
        >
          <span className="block w-5 h-[2px] bg-current mb-[5px] rounded-full" />
          <span className="block w-5 h-[2px] bg-current mb-[5px] rounded-full" />
          <span className="block w-5 h-[2px] bg-current rounded-full" />
        </button>

        <Link href="/dashboard" className="flex items-center gap-3 shrink-0">
          <Logo size={24} />
        </Link>

        <SearchTrigger />

        <div className="ml-auto flex items-center gap-1">
          <HeaderLink href="/command-center" icon={<Radar className="size-4" />} label="Command" highlight />
          <HeaderLink href="/dashboard" icon={<Home className="size-4" />} label="הבית" />
          <HeaderLink href="/leads" icon={<FileText className="size-4" />} label="לידים" />
          <HeaderLink href="/inbox" icon={<MessageCircle className="size-4" />} label="הודעות" />
          <HeaderLink href="/calls" icon={<Phone className="size-4" />} label="שיחות" />
          <HeaderLink href="/dialer" icon={<Phone className="size-4" />} label="תותח" />
          <HeaderLink href="/call-center" icon={<Phone className="size-4" />} label="Live" />
          <HeaderLink href="/wallboard" icon={<Tv className="size-4" />} label="WallBoard" highlight />
          <HeaderLink href="/calendar" icon={<Home className="size-4" />} label="יומן" />
          <HeaderLink href="/admin" icon={<ShieldCheck className="size-4" />} label="מנהל" />
          <HeaderLink href="/settings" icon={<Settings className="size-4" />} label="הגדרות" />

          <div className="w-px h-5 bg-bingo-gray-200 mx-1.5 hidden md:block" />

          <button
            type="button"
            className="size-9 rounded-lg text-bingo-gray-600 hover:text-bingo-black hover:bg-bingo-gray-100 inline-flex items-center justify-center transition"
            title="הוספת ליד"
          >
            <Plus className="size-4" strokeWidth={2.5} />
          </button>
          <NotificationDropdown />
          <ThemeQuickToggle />
          <HeaderIcon icon={<HelpCircle className="size-4" />} label="עזרה" />
          <UserDropdown />
        </div>
      </header>
    </>
  );
}

function SearchTrigger() {
  return (
    <button
      onClick={() => document.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true, bubbles: true }))}
      className="hidden md:flex flex-1 max-w-md items-center bg-white rounded-xl border border-bingo-gray-200 hover:border-bingo-gray-300 transition px-3 h-9 text-bingo-gray-500 cursor-text"
    >
      <Search className="size-4 ml-2" />
      <span className="flex-1 text-right text-[13px] font-medium">חיפוש לידים, תהליכים, פעולות...</span>
      <kbd className="text-[10px] font-mono font-semibold bg-bingo-gray-100 rounded px-1.5 py-0.5 border border-bingo-gray-200 text-bingo-gray-600">⌘K</kbd>
    </button>
  );
}

function HeaderLink({ href, icon, label, highlight }: { href: string; icon: React.ReactNode; label: string; highlight?: boolean }) {
  return (
    <Link
      href={href}
      className={cn(
        "hidden md:inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-[13px] font-bold transition",
        highlight
          ? "bg-bingo-black text-bingo-green hover:bg-bingo-charcoal bingo-shadow-sm"
          : "text-bingo-charcoal hover:bg-bingo-gray-100"
      )}
    >
      {icon}
      {label}
      {highlight && <span className="size-1.5 rounded-full bg-bingo-green animate-pulse" />}
    </Link>
  );
}

function HeaderIcon({ icon, label, className }: { icon: React.ReactNode; label?: string; className?: string }) {
  return (
    <button
      type="button"
      className={cn(
        "size-9 rounded-lg text-bingo-gray-600 hover:text-bingo-black hover:bg-bingo-gray-100 inline-flex items-center justify-center transition",
        className
      )}
      aria-label={label}
      title={label}
    >
      {icon}
    </button>
  );
}

function NotificationButton() {
  return (
    <button
      type="button"
      className="relative size-9 rounded-lg text-bingo-gray-600 hover:text-bingo-black hover:bg-bingo-gray-100 inline-flex items-center justify-center transition"
      aria-label="התראות"
    >
      <Bell className="size-4" />
      <span className="absolute top-1 left-1 size-1.5 rounded-full bg-status-red ring-2 ring-bingo-cream" />
    </button>
  );
}
