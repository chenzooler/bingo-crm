"use client";
import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Plus, HelpCircle, Loader2 } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
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
      {/* שכפול יועצים: פלטת הפקודות ⌘K מוסתרת יחד עם ה-SearchTrigger */}
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

        <Link href="/leads" className="flex items-center shrink-0" aria-label="בינגו — הבית">
          <Logo size={26} />
        </Link>

        {/* שכפול יועצים: חיפוש ה-⌘K הגלובלי (תוספת בינגו) מוסתר — החיפוש המהיר
            והמתקדם חיים במסך הראשי כמו במקור. להחזרה: <SearchTrigger /> */}

        <div className="mr-auto flex items-center gap-2">
          <NewLeadButton />
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

/** יוצר ליד חדש (מחלקת החתמות · "ליד חדש") ונכנס ישר לכרטיס — כמו במקור */
function NewLeadButton() {
  const router = useRouter();
  const [busy, setBusy] = React.useState(false);

  const create = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      if (res.ok) {
        const lead = await res.json();
        router.push(`/leads/${lead.id}`);
      }
    } catch { /* נשארים במסך הנוכחי */ } finally {
      // ה-Header חי ב-layout ולא נעלם בניווט — משחררים את הכפתור תמיד
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      onClick={() => void create()}
      disabled={busy}
      className="b-pill b-pill-green b-pill-sm hidden sm:inline-flex disabled:opacity-60"
    >
      {busy ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" strokeWidth={2.6} />}
      ליד חדש
    </button>
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
