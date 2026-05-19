"use client";
import * as React from "react";
import Link from "next/link";
import * as Popover from "@radix-ui/react-popover";
import { Avatar } from "@/components/ui/Avatar";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { User, Settings, LogOut, ChevronDown, Keyboard, HelpCircle, Bell } from "lucide-react";

export function UserDropdown() {
  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-lg hover:bg-bingo-gray-100 transition mr-1">
          <Avatar name="חן צולר" emoji="💼" size="sm" />
          <span className="text-sm font-bold text-bingo-black hidden md:block">חן צולר</span>
          <ChevronDown className="size-3 text-bingo-gray-500 hidden md:block" />
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align="end"
          sideOffset={8}
          className="w-72 surface-card-elevated overflow-hidden z-50"
        >
          {/* User card */}
          <div className="px-4 py-3 bg-gradient-to-bl from-bingo-green/12 to-bingo-green/3 border-b border-bingo-gray-100">
            <div className="flex items-center gap-3">
              <Avatar name="חן צולר" emoji="💼" size="lg" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-extrabold text-bingo-black">חן צולר</div>
                <div className="text-[11px] text-bingo-gray-500">chen@bingoisrael.co.il</div>
                <div className="text-[10px] font-bold text-bingo-green-dark mt-0.5 inline-flex items-center gap-1">
                  <span className="size-1.5 rounded-full bg-bingo-green" /> בעלים · פעיל
                </div>
              </div>
            </div>
          </div>

          {/* Theme toggle */}
          <div className="px-4 py-3 border-b border-bingo-gray-100 flex items-center justify-between">
            <span className="text-[12px] font-bold text-bingo-charcoal">מצב צבע</span>
            <ThemeToggle />
          </div>

          {/* Menu items */}
          <div className="py-1.5">
            <DropdownItem href="/profile" icon={<User className="size-4" />} label="פרופיל אישי" shortcut="P" />
            <DropdownItem href="/notifications" icon={<Bell className="size-4" />} label="התראות" shortcut="N" />
            <DropdownItem href="/settings" icon={<Settings className="size-4" />} label="הגדרות מערכת" />
            <DropdownItem href="/docs/strategy" icon={<HelpCircle className="size-4" />} label="מסמכי מערכת" />
            <button
              onClick={() => document.dispatchEvent(new KeyboardEvent("keydown", { key: "?", bubbles: true }))}
              className="w-full flex items-center justify-between gap-2 px-4 py-2 text-[13px] font-bold text-bingo-charcoal hover:bg-bingo-gray-100 transition"
            >
              <span className="flex items-center gap-2.5">
                <Keyboard className="size-4" />
                קיצורי מקלדת
              </span>
              <kbd className="font-mono text-[10px] bg-bingo-gray-100 border border-bingo-gray-200 rounded px-1.5 py-0.5">?</kbd>
            </button>
          </div>

          {/* Logout */}
          <div className="border-t border-bingo-gray-100 py-1.5">
            <button className="w-full flex items-center gap-2.5 px-4 py-2 text-[13px] font-bold text-status-red hover:bg-status-red/8 transition">
              <LogOut className="size-4" />
              התנתק
            </button>
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

function DropdownItem({ href, icon, label, shortcut }: { href: string; icon: React.ReactNode; label: string; shortcut?: string }) {
  return (
    <Link href={href} className="flex items-center justify-between gap-2 px-4 py-2 text-[13px] font-bold text-bingo-charcoal hover:bg-bingo-gray-100 transition">
      <span className="flex items-center gap-2.5">
        {icon}{label}
      </span>
      {shortcut && <kbd className="font-mono text-[10px] bg-bingo-gray-100 border border-bingo-gray-200 rounded px-1.5 py-0.5">{shortcut}</kbd>}
    </Link>
  );
}
