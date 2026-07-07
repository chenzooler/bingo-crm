"use client";
/**
 * תבניות פעולות/משימות/פגישות/כספים (AppSetting "action-templates"). שכפול Yoatsim §2.
 * 4 טאבים (b-segment), עריכה אינליין, שמירת האובייקט השלם.
 */
import * as React from "react";
import { ClipboardList, Plus, Pencil, Trash2, Check, X } from "lucide-react";
import {
  ACTION_TEMPLATE_KINDS,
  type ActionTemplateKind,
  type ActionTemplatesValue,
} from "@/lib/yoatsim/app-defaults";
import { SaveBadge, useAppSettingSaver } from "./AppSettingControls";

const KIND_ICON_TONE: Record<ActionTemplateKind, string> = {
  פעולות: "b-icon-green",
  משימות: "b-icon-blue",
  פגישות: "b-icon-orange",
  כספים: "b-icon-purple",
};

export default function ActionTemplatesManager({ initial }: { initial: ActionTemplatesValue }) {
  const { value, save, state } = useAppSettingSaver<ActionTemplatesValue>("action-templates", initial);
  const [kind, setKind] = React.useState<ActionTemplateKind>("פעולות");
  const [editing, setEditing] = React.useState<number | null>(null);
  const [draft, setDraft] = React.useState("");
  const [newName, setNewName] = React.useState("");

  const list = value[kind] ?? [];

  const update = (nextList: { name: string }[]) => {
    setEditing(null);
    void save({ ...value, [kind]: nextList });
  };

  const commitRename = (i: number) => {
    const name = draft.trim();
    if (!name) return;
    update(list.map((t, idx) => (idx === i ? { name } : t)));
  };

  const add = () => {
    const name = newName.trim();
    if (!name || list.some((t) => t.name === name)) return;
    update([...list, { name }]);
    setNewName("");
  };

  const remove = (i: number) => {
    if (!window.confirm(`למחוק את התבנית "${list[i].name}"?`)) return;
    update(list.filter((_, idx) => idx !== i));
  };

  return (
    <div className="space-y-4">
      <div className="b-card p-5">
        <div className="b-eyebrow">זרימת עבודה</div>
        <h2 className="text-xl font-extrabold text-bingo-black flex items-center gap-2.5 flex-wrap">
          תבניות פעולות
          <span className="b-chip b-chip-green">שכפול Yoatsim §2</span>
          <SaveBadge state={state} />
        </h2>
        <p className="text-[12px] text-bingo-gray-600 mt-1">
          תבניות מוכנות לפעולות, משימות, פגישות וכספים. התבניות זמינות בהוספת משימה/פעולה בכרטיס.
        </p>

        <div className="b-segment mt-4">
          {ACTION_TEMPLATE_KINDS.map((k) => (
            <button
              key={k}
              type="button"
              data-active={kind === k}
              onClick={() => { setKind(k); setEditing(null); }}
            >
              {k} ({(value[k] ?? []).length})
            </button>
          ))}
        </div>
      </div>

      <div className="b-card p-5">
        <div className="flex items-center gap-2.5 mb-2">
          <span className={`b-icon ${KIND_ICON_TONE[kind]} !size-8`}><ClipboardList className="size-4" /></span>
          <h3 className="text-[15px] font-extrabold text-bingo-black">תבניות {kind}</h3>
        </div>

        <div className="divide-y divide-bingo-gray-100">
          {list.map((t, i) =>
            editing === i ? (
              <div key={i} className="flex items-center gap-2 py-2.5">
                <input
                  autoFocus
                  className="b-input h-9 text-[13px] flex-1"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") commitRename(i); if (e.key === "Escape") setEditing(null); }}
                />
                <button type="button" onClick={() => commitRename(i)} className="b-pill b-pill-dark b-pill-sm">
                  <Check className="size-3.5" /> שמור
                </button>
                <button type="button" onClick={() => setEditing(null)} className="b-pill b-pill-ghost b-pill-sm">
                  <X className="size-3.5" /> ביטול
                </button>
              </div>
            ) : (
              <div key={i} className="flex items-center gap-2 py-2.5">
                <span className="text-[13.5px] font-bold text-bingo-black flex-1">{t.name}</span>
                <button
                  type="button"
                  onClick={() => { setEditing(i); setDraft(t.name); }}
                  className="b-icon b-icon-gray !size-8"
                  title="שינוי שם"
                >
                  <Pencil className="size-3.5" />
                </button>
                <button type="button" onClick={() => remove(i)} className="b-icon b-icon-red !size-8" title="מחיקה">
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            ),
          )}
          {list.length === 0 && (
            <p className="py-6 text-center text-[12.5px] text-bingo-gray-400">אין תבניות {kind} — הוסף את הראשונה.</p>
          )}
        </div>

        <div className="flex items-center gap-2 pt-3 mt-1 border-t border-bingo-gray-100">
          <input
            className="b-input h-9 text-[13px] flex-1"
            placeholder={`תבנית ${kind} חדשה…`}
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") add(); }}
          />
          <button type="button" onClick={add} className="b-pill b-pill-dark b-pill-sm">
            <Plus className="size-3.5" /> הוסף
          </button>
        </div>
      </div>
    </div>
  );
}
