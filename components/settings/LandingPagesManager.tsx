"use client";
/**
 * דפי נחיתה — רשימת הדפים שמזרימים לידים (AppSetting "landing-pages").
 * עריכה אינליין, מתג פעיל, ספירת לידים לפי sourceText. שכפול Yoatsim §2.
 */
import * as React from "react";
import Link from "next/link";
import { Globe, Plus, Pencil, Trash2, Check, X } from "lucide-react";
import type { LandingPage } from "@/lib/yoatsim/app-defaults";
import { cn } from "@/lib/utils";
import { AppToggle, SaveBadge, useAppSettingSaver } from "./AppSettingControls";

export default function LandingPagesManager({ initial, leadCounts }: {
  initial: LandingPage[];
  leadCounts: Record<string, number>;
}) {
  const { value: pages, save, state } = useAppSettingSaver<LandingPage[]>("landing-pages", initial);
  const [editing, setEditing] = React.useState<number | null>(null);
  const [draft, setDraft] = React.useState<LandingPage>({ name: "", url: "", active: true });
  const [adding, setAdding] = React.useState(false);

  const startEdit = (i: number) => {
    setAdding(false);
    setEditing(i);
    setDraft({ ...pages[i] });
  };

  const commitEdit = () => {
    if (editing === null || !draft.name.trim()) return;
    const next = pages.map((p, i) => (i === editing ? { ...draft, name: draft.name.trim(), url: draft.url.trim() } : p));
    setEditing(null);
    void save(next);
  };

  const commitAdd = () => {
    if (!draft.name.trim()) return;
    void save([...pages, { ...draft, name: draft.name.trim(), url: draft.url.trim() }]);
    setAdding(false);
  };

  const remove = (i: number) => {
    if (!window.confirm(`למחוק את הדף "${pages[i].name}"?`)) return;
    void save(pages.filter((_, idx) => idx !== i));
  };

  const editorRow = (commit: () => void, cancel: () => void) => (
    <div className="flex items-center gap-2 flex-wrap py-2.5">
      <input
        autoFocus
        className="b-input h-9 text-[13px] w-56"
        placeholder="שם הדף (= sourceText של הליד)"
        value={draft.name}
        onChange={(e) => setDraft({ ...draft, name: e.target.value })}
        onKeyDown={(e) => { if (e.key === "Enter") commit(); if (e.key === "Escape") cancel(); }}
      />
      <input
        dir="ltr"
        className="b-input h-9 text-[12.5px] font-mono flex-1 min-w-56"
        placeholder="https://bingoisrael.co.il/lp/..."
        value={draft.url}
        onChange={(e) => setDraft({ ...draft, url: e.target.value })}
        onKeyDown={(e) => { if (e.key === "Enter") commit(); if (e.key === "Escape") cancel(); }}
      />
      <button type="button" onClick={commit} className="b-pill b-pill-dark b-pill-sm"><Check className="size-3.5" /> שמור</button>
      <button type="button" onClick={cancel} className="b-pill b-pill-ghost b-pill-sm"><X className="size-3.5" /> ביטול</button>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="b-card p-5">
        <div className="b-eyebrow">זרימת עבודה</div>
        <h2 className="text-xl font-extrabold text-bingo-black flex items-center gap-2.5 flex-wrap">
          דפי נחיתה
          <span className="b-chip b-chip-green">שכפול Yoatsim §2</span>
          <SaveBadge state={state} />
        </h2>
        <p className="text-[12px] text-bingo-gray-600 mt-1">
          כל דף נחיתה דוחף לידים למערכת דרך{" "}
          <Link href="/settings/leads-api" className="font-bold text-bingo-blue hover:underline">קבלת לידים / API</Link>
          {" "}— כששדה <code dir="ltr" className="font-mono text-[11px] bg-bingo-gray-100 rounded px-1">sourceText</code> שווה לשם הדף, הליד נספר כאן.
        </p>
      </div>

      <div className="b-card p-5">
        <div className="flex items-center gap-2.5 mb-3">
          <span className="b-icon b-icon-blue !size-8"><Globe className="size-4" /></span>
          <h3 className="text-[15px] font-extrabold text-bingo-black">הדפים ({pages.length})</h3>
          <button
            type="button"
            onClick={() => { setEditing(null); setAdding(true); setDraft({ name: "", url: "", active: true }); }}
            className="b-pill b-pill-dark b-pill-sm mr-auto"
          >
            <Plus className="size-3.5" /> דף חדש
          </button>
        </div>

        <div className="divide-y divide-bingo-gray-100">
          {pages.map((p, i) =>
            editing === i ? (
              <React.Fragment key={i}>{editorRow(commitEdit, () => setEditing(null))}</React.Fragment>
            ) : (
              <div key={i} className={cn("flex items-center gap-3 py-2.5 flex-wrap", !p.active && "opacity-60")}>
                <div className="min-w-0 flex-1">
                  <div className="text-[13.5px] font-extrabold text-bingo-black">{p.name}</div>
                  <div dir="ltr" className="text-[11.5px] font-mono text-bingo-gray-500 truncate text-right">{p.url || "—"}</div>
                </div>
                <span className="b-chip b-chip-blue text-[11px] tabular-nums">
                  {leadCounts[p.name] ?? 0} לידים
                </span>
                <span className={cn("b-chip text-[11px]", p.active ? "b-chip-green" : "b-chip-gray")}>
                  {p.active ? "פעיל" : "כבוי"}
                </span>
                <AppToggle
                  checked={p.active}
                  onChange={(next) => void save(pages.map((x, idx) => (idx === i ? { ...x, active: next } : x)))}
                />
                <button type="button" onClick={() => startEdit(i)} className="b-icon b-icon-gray !size-8" title="עריכה">
                  <Pencil className="size-3.5" />
                </button>
                <button type="button" onClick={() => remove(i)} className="b-icon b-icon-red !size-8" title="מחיקה">
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            ),
          )}
          {adding && editorRow(commitAdd, () => setAdding(false))}
          {pages.length === 0 && !adding && (
            <p className="py-6 text-center text-[12.5px] text-bingo-gray-400">אין דפי נחיתה — הוסף את הראשון.</p>
          )}
        </div>
      </div>
    </div>
  );
}
