"use client";
import * as React from "react";
import Link from "next/link";
import { Search, Plus, HelpCircle } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { CommandPalette } from "@/components/ui/CommandPalette";
import { NotificationDropdown } from "@/components/layout/NotificationDropdown";
import { UserDropdown } from "@/components/layout/UserDropdown";
import { cn } from "@/lib/utils";

/**
 * Header v3 — brand-true and CALM.
 * Logo · global search · add-lead pill · notifications · profile.
 * Navigation lives in the NavRail, not here.
 */
export function Header({ onToggleSidebar }: { onToggleSidebar?: () => void }) {
  return (
    <>
      <CommandPalette />
      <header className="h-[60px] sticky top-0 z-40 surface-toolbar flex items-center px-4 lg:px-6 gap-4">
        {/* Mobile menu */}
        <button
          type="button"
          onClick={onToggleSidebar}
          className="p-2 -mr-2 rounded-xl hover:bg-bingo-gray-100 md:hidden text-bingo-charcoal"
          aria-label="תפריט"
        >
          <span className="block w-5 h-[2px] bg-current mb-[5px] rounded-full" />
          <span className="block w-5 h-[2px] bg-current mb-[5px] rounded-full" />
          <span className="block w-5 h-[2px] bg-current rounded-full" />
        </button>

        <Link href="/dashboard" className="flex items-center shrink-0" aria-label="בינגו — הבית">
          <Logo size={26} />
        </Link>

        <SearchTrigger />

        <div className="mr-auto flex items-center gap-2">
          <button
            type="button"
            onClick={() => document.dispatchEvent(new CustomEvent("bingo:quick-add-lead"))}
            className="b-pill b-pill-green b-pill-sm hidden sm:inline-flex"
          >
            <Plus className="size-4" strokeWidth={2.6} />
            ליד חדש
          </button>
          <NotificationDropdown />
          <button
            type="button"
            className="size-10 rounded-full text-bingo-gray-500 hover:text-bingo-black hover:bg-bingo-gray-100 inline-flex items-center justify-center transition"
            aria-label="עזרה"
            title="עזרה"
          >
            <HelpCircle className="size-[18px]" />
          </button>
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
      className="hidden md:flex flex-1 max-w-lg items-center bg-white rounded-full border border-bingo-gray-200 hover:border-bingo-gray-300 transition px-4 h-11 text-bingo-gray-500 cursor-text"
    >
      <Search className="size-4 ml-2.5" />
      <span className="flex-1 text-right text-[13px] font-medium">חפש ליד, טלפון, ת.ז — או פעולה...</span>
      <kbd className="text-[10px] font-mono font-semibold bg-bingo-gray-100 rounded-md px-1.5 py-0.5 border border-bingo-gray-200 text-bingo-gray-500">⌘K</kbd>
    </button>
  );
}
