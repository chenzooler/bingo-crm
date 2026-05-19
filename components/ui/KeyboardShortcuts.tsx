"use client";
import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Keyboard, X } from "lucide-react";

const SHORTCUTS = [
  { group: "ניווט", items: [
    { keys: ["⌘", "K"], label: "Command Palette - חיפוש כללי" },
    { keys: ["G", "D"], label: "עבור לדשבורד" },
    { keys: ["G", "L"], label: "עבור ללידים" },
    { keys: ["G", "T"], label: "עבור למשימות" },
    { keys: ["G", "C"], label: "עבור לשיחות" },
    { keys: ["G", "I"], label: "עבור לתיבת הודעות" },
    { keys: ["G", "R"], label: "עבור לדוחות" },
    { keys: ["?"], label: "פתיחת רשימת קיצורים זו" },
  ]},
  { group: "פעולות", items: [
    { keys: ["C"], label: "ליד חדש" },
    { keys: ["T"], label: "משימה חדשה" },
    { keys: ["P"], label: "חיוג מהיר" },
    { keys: ["W"], label: "שליחת WhatsApp" },
    { keys: ["E"], label: "עריכת ליד נוכחי" },
    { keys: ["A"], label: "ארכוב ליד" },
    { keys: ["⌘", "S"], label: "שמירה" },
  ]},
  { group: "בכרטיס ליד", items: [
    { keys: ["←"], label: "שלב קודם בשאלון" },
    { keys: ["→"], label: "שלב הבא בשאלון" },
    { keys: ["1-9"], label: "קפיצה לשלב לפי מספר" },
    { keys: ["⌘", "↵"], label: "סיים שלב והמשך" },
  ]},
  { group: "בשיחה פעילה", items: [
    { keys: ["M"], label: "השתק/בטל השתקה" },
    { keys: ["H"], label: "השהה שיחה" },
    { keys: ["S"], label: "שלח תסריט AI" },
    { keys: ["Esc"], label: "סיים שיחה" },
  ]},
];

export function KeyboardShortcutsModal() {
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      // Ignore if user is typing
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) return;
      if (e.key === "?") {
        e.preventDefault();
        setOpen(true);
      }
      if (e.key === "Escape" && open) setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-bingo-onyx/40 backdrop-blur-sm animate-fade-in" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[92vw] max-w-3xl -translate-x-1/2 -translate-y-1/2 max-h-[85vh] surface-card-elevated overflow-hidden animate-fade-in flex flex-col">
          <div className="px-6 py-4 border-b border-bingo-gray-150 flex items-center justify-between">
            <Dialog.Title className="text-lg font-extrabold text-bingo-black inline-flex items-center gap-2">
              <Keyboard className="size-5" />
              קיצורי מקלדת
            </Dialog.Title>
            <Dialog.Close className="size-8 rounded-lg hover:bg-bingo-gray-100 inline-flex items-center justify-center">
              <X className="size-4" />
            </Dialog.Close>
          </div>
          <div className="overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            {SHORTCUTS.map((group) => (
              <div key={group.group}>
                <div className="text-[10px] font-bold uppercase tracking-wider text-bingo-gray-500 mb-2">{group.group}</div>
                <div className="space-y-1.5">
                  {group.items.map((item, i) => (
                    <div key={i} className="flex items-center justify-between gap-3 py-1">
                      <span className="text-[13px] text-bingo-charcoal">{item.label}</span>
                      <div className="flex items-center gap-1 shrink-0">
                        {item.keys.map((k, j) => (
                          <kbd key={j} className="font-mono font-semibold text-[10px] bg-bingo-gray-100 border border-bingo-gray-200 rounded px-1.5 py-0.5 min-w-[1.5rem] text-center text-bingo-charcoal">
                            {k}
                          </kbd>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="px-6 py-3 border-t border-bingo-gray-150 bg-bingo-gray-50 text-[11px] text-bingo-gray-600 flex items-center justify-between">
            <span>לחץ <kbd className="font-mono font-semibold bg-white border border-bingo-gray-200 rounded px-1 mx-1">?</kbd> בכל מקום כדי לפתוח</span>
            <span>BINGO CRM v1.0</span>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
