"use client";
/**
 * עמודת "משימות ופעילויות" — 1:1 מהמקור:
 * + הוספה · חיפוש · פילטרים באייקונים (הכל/תזכורות/משימות/הערות/מייל/שיחות/וואטסאפ/תשלום)
 * · ציר זמן עם פס צבע בצד.
 */
import * as React from "react";
import {
  Plus, Search, LayoutList, AlarmClock, CheckSquare, StickyNote,
  Mail, Phone, MessageCircle, Banknote,
} from "lucide-react";
import { cn, relativeTime } from "@/lib/utils";
import type { ClassicCardState } from "./useClassicCard";

const FILTERS: Array<{ key: string; icon: React.ElementType; title: string; types: string[] | null }> = [
  { key: "all", icon: LayoutList, title: "הצג הכל", types: null },
  { key: "reminders", icon: AlarmClock, title: "תזכורות", types: ["task", "reminder"] },
  { key: "tasks", icon: CheckSquare, title: "משימות", types: ["task"] },
  { key: "notes", icon: StickyNote, title: "הערות", types: ["note", "journey", "system", "status-change"] },
  { key: "mail", icon: Mail, title: "מייל", types: ["email"] },
  { key: "calls", icon: Phone, title: "שיחות", types: ["call"] },
  { key: "whatsapp", icon: MessageCircle, title: "וואטסאפ", types: ["whatsapp", "sms"] },
  { key: "payment", icon: Banknote, title: "תשלום", types: ["payment"] },
];

const BAR: Record<string, string> = {
  task: "bg-status-blue", reminder: "bg-status-blue",
  call: "bg-bingo-green", whatsapp: "bg-bingo-green", sms: "bg-bingo-green",
  "status-change": "bg-status-purple", journey: "bg-status-purple",
  note: "bg-bingo-gray-300", system: "bg-bingo-gray-300",
  payment: "bg-[#eab308]", form: "bg-status-orange", email: "bg-status-blue",
};

export function ActivitiesRail({ state }: { state: ClassicCardState }) {
  const [filter, setFilter] = React.useState<string>("all");
  const [q, setQ] = React.useState("");
  const [adding, setAdding] = React.useState(false);
  const [note, setNote] = React.useState("");

  const active = FILTERS.find((f) => f.key === filter)!;
  const rows = state.activities.filter((a) => {
    if (active.types && !active.types.includes(a.type)) return false;
    if (q && !a.text.includes(q)) return false;
    return true;
  });

  return (
    <section className="b-card p-4 flex flex-col min-h-0">
      <header className="flex items-center gap-2 mb-3">
        <h3 className="text-[14px] font-bold text-bingo-black flex-1">משימות ופעילויות</h3>
        <button onClick={() => setAdding((x) => !x)} className="b-pill b-pill-dark b-pill-sm">
          <Plus className="size-3.5" /> הוספה
        </button>
      </header>

      {adding && (
        <div className="flex gap-2 mb-3 animate-fade-in">
          <input autoFocus className="b-input h-9 text-[12.5px]" placeholder="הערה / משימה..."
            value={note} onChange={(e) => setNote(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { state.addNote("note", note); setNote(""); setAdding(false); } }} />
          <button onClick={() => { state.addNote("note", note); setNote(""); setAdding(false); }}
            className="b-pill b-pill-green b-pill-sm shrink-0">שמור</button>
        </div>
      )}

      <div className="relative mb-2.5">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 size-3.5 text-bingo-gray-300" />
        <input className="b-input h-9 pr-9 text-[12.5px]" placeholder="חיפוש..."
          value={q} onChange={(e) => setQ(e.target.value)} />
      </div>

      {/* פילטרים באייקונים — כמו במקור */}
      <div className="flex items-center gap-1 mb-3 border-b border-bingo-gray-100 pb-2.5">
        {FILTERS.map((f) => (
          <button key={f.key} title={f.title} onClick={() => setFilter(f.key)}
            className={cn("size-8 rounded-lg flex items-center justify-center transition",
              filter === f.key ? "bg-bingo-black text-white" : "text-bingo-gray-400 hover:bg-bingo-gray-100")}>
            <f.icon className="size-4" />
          </button>
        ))}
      </div>

      <div className="space-y-2 overflow-y-auto flex-1 min-h-0 max-h-[560px] pr-0.5">
        {rows.length === 0 && <p className="text-[12px] text-bingo-gray-400 text-center py-4">אין פעילויות</p>}
        {rows.map((a) => (
          <div key={a.id} className="flex gap-2.5 rounded-xl border border-bingo-gray-100 p-2.5">
            <span className={cn("w-1 rounded-full shrink-0 self-stretch", BAR[a.type] ?? "bg-bingo-gray-200")} />
            <div className="min-w-0 flex-1">
              <p className="text-[12.5px] text-bingo-black leading-snug break-words">{a.text}</p>
              <p className="text-[10.5px] text-bingo-gray-400 tabular-nums mt-0.5">
                {relativeTime(a.createdAt)}{a.userName ? ` · ${a.userName}` : ""}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
