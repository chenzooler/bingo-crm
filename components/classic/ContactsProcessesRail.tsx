"use client";
/**
 * העמודה השלישית — 1:1 מהמקור:
 * אנשי קשר (טלפון + אייקוני וואטסאפ/סמס/מייל) · "תהליכים" (ריבוי! סטטוס+אחראי+מחיקה)
 * · "אחראי".
 */
import * as React from "react";
import { Phone, MessageCircle, Mail, MessageSquare, Trash2, Plus, ChevronDown } from "lucide-react";
import { PROCESSES, processByKey } from "@/lib/yoatsim/processes";
import { cn } from "@/lib/utils";
import type { ClassicCardState, UserOption } from "./useClassicCard";

export function ContactsProcessesRail({ state, users }: {
  state: ClassicCardState;
  users: UserOption[];
}) {
  const { lead, processes } = state;
  const [showAdd, setShowAdd] = React.useState(false);
  const waPhone = (lead.phone || "").replace(/\D/g, "").replace(/^0/, "972");
  const available = PROCESSES.filter((p) => !processes.some((x) => x.processKey === p.key));

  return (
    <div className="space-y-4">
      {/* ---- אנשי קשר ---- */}
      <section className="b-card p-4">
        <h3 className="text-[13.5px] font-bold text-bingo-black mb-2.5">אנשי קשר</h3>
        <div className="flex items-center gap-2.5">
          <span className="size-9 rounded-full bg-bingo-gray-100 flex items-center justify-center text-[13px] font-bold text-bingo-gray-700 shrink-0">
            {lead.fullName.charAt(0)}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-bold text-bingo-black truncate">{lead.fullName}</p>
            <p className="text-[12px] text-bingo-gray-500 tabular-nums" dir="ltr">{lead.phone || "—"}</p>
          </div>
          <div className="flex gap-1 shrink-0">
            <a href={waPhone ? `https://wa.me/${waPhone}` : undefined} target="_blank" rel="noreferrer"
              title="וואטסאפ" className="size-8 rounded-lg bg-bingo-green-light text-bingo-green-deep flex items-center justify-center hover:brightness-95">
              <MessageCircle className="size-4" />
            </a>
            <button title="סמס" className="size-8 rounded-lg bg-status-blue-soft text-bingo-blue flex items-center justify-center hover:brightness-95">
              <MessageSquare className="size-4" />
            </button>
            <a href={lead.email ? `mailto:${lead.email}` : undefined} title="מייל"
              className="size-8 rounded-lg bg-bingo-gray-100 text-bingo-gray-500 flex items-center justify-center hover:brightness-95">
              <Mail className="size-4" />
            </a>
            <a href={lead.phone ? `tel:${lead.phone}` : undefined} title="חיוג"
              className="size-8 rounded-lg bg-bingo-black text-white flex items-center justify-center hover:brightness-110">
              <Phone className="size-4" />
            </a>
          </div>
        </div>
      </section>

      {/* ---- תהליכים (ריבוי — כמו במקור) ---- */}
      <section className="b-card p-4">
        <header className="flex items-center justify-between mb-2.5">
          <h3 className="text-[13.5px] font-bold text-bingo-black">תהליכים</h3>
          <button onClick={() => setShowAdd((x) => !x)} className="b-pill b-pill-ghost b-pill-sm">
            <Plus className="size-3.5" /> הוסף
          </button>
        </header>

        {showAdd && (
          <div className="mb-3 max-h-56 overflow-y-auto rounded-xl border border-bingo-gray-150 divide-y divide-bingo-gray-100 animate-fade-in">
            {available.map((p) => (
              <button key={p.key} onClick={() => { void state.addProcess(p.key); setShowAdd(false); }}
                className="w-full text-right px-3 py-2 text-[12.5px] font-semibold text-bingo-black hover:bg-bingo-gray-50 flex items-center gap-2">
                <span>{p.emoji}</span> {p.name}
              </button>
            ))}
          </div>
        )}

        {processes.length === 0 && (
          <p className="text-[12px] text-bingo-gray-400 text-center py-3">הליד לא משויך לאף תהליך</p>
        )}

        <div className="space-y-2.5">
          {processes.map((row) => {
            const def = processByKey(row.processKey);
            if (!def) return null;
            return (
              <div key={row.id} className="rounded-xl border border-bingo-gray-150 p-2.5">
                <div className="flex items-center gap-1.5 mb-2">
                  <ChevronDown className="size-3.5 text-bingo-gray-300" />
                  <span className="text-[13px] font-bold text-bingo-black flex-1">{def.emoji} {def.name}</span>
                  <button onClick={() => void state.removeProcess(row.id)} title="מחיקת תהליך"
                    className="size-7 rounded-lg text-bingo-gray-300 hover:text-status-red hover:bg-status-red-soft flex items-center justify-center transition">
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
                <div className="space-y-1.5">
                  <label className="block">
                    <span className="text-[10.5px] font-semibold text-bingo-gray-400">סטטוס</span>
                    <select className="b-input h-9 text-[12.5px] cursor-pointer w-full"
                      value={row.statusKey}
                      onChange={(e) => void state.updateProcess(row.id, { statusKey: e.target.value })}>
                      {def.statuses.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </label>
                  <label className="block">
                    <span className="text-[10.5px] font-semibold text-bingo-gray-400">אחראי</span>
                    <select className="b-input h-9 text-[12.5px] cursor-pointer w-full"
                      value={row.responsible?.id ?? ""}
                      onChange={(e) => void state.updateProcess(row.id, { responsibleId: e.target.value ? Number(e.target.value) : null })}>
                      <option value="">— ללא —</option>
                      {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
                    </select>
                  </label>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ---- אחראי ראשי ---- */}
      <section className="b-card p-4">
        <h3 className="text-[13.5px] font-bold text-bingo-black mb-1">אחראי</h3>
        <p className="text-[12.5px] text-bingo-gray-600">{lead.ownerName || "— ללא שיוך —"}</p>
      </section>
    </div>
  );
}
