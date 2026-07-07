"use client";
// מסך תבניות ההודעות — שכפול Yoatsim 1:1: שם · ערוץ · שולח · גוף (או JSON ל-WATI)
import * as React from "react";
import { cn } from "@/lib/utils";
import { MessageSquare, Plus, Pencil, Trash2, X } from "lucide-react";

export interface TemplateRow {
  id: number;
  name: string;
  channel: string; // sms | whatsapp | wati | email
  sender: string | null;
  body: string | null;
  watiJson: string | null;
}

const CHANNELS = [
  { value: "sms", label: "סמס", chip: "b-chip-blue" },
  { value: "whatsapp", label: "ווטסאפ", chip: "b-chip-green" },
  { value: "wati", label: "WATI", chip: "b-chip-dark" },
  { value: "email", label: "מייל", chip: "b-chip-gray" },
] as const;

const SENDERS = [
  { value: "", label: "הטלפון של היוזר המחובר" },
  { value: "972505696756", label: "972505696756" },
  { value: "bingoisrael", label: "bingoisrael" },
  { value: "bingocredit", label: "bingocredit" },
] as const;

const heSort = (a: TemplateRow, b: TemplateRow) => a.name.localeCompare(b.name, "he");

function channelMeta(channel: string) {
  return CHANNELS.find((c) => c.value === channel) ?? { value: channel, label: channel, chip: "b-chip-gray" };
}

interface Draft {
  name: string;
  channel: string;
  sender: string;
  body: string;
  watiText: string;
}

function toDraft(t: TemplateRow): Draft {
  return {
    name: t.name,
    channel: t.channel,
    sender: t.sender ?? "",
    body: t.body ?? "",
    watiText: t.watiJson ? formatJson(t.watiJson) : "",
  };
}

function formatJson(raw: string) {
  try {
    return JSON.stringify(JSON.parse(raw), null, 2);
  } catch {
    return raw;
  }
}

/* ============================== המסך ============================== */

export default function TemplatesManager({ initial }: { initial: TemplateRow[] }) {
  const [items, setItems] = React.useState<TemplateRow[]>(initial);
  const [filter, setFilter] = React.useState<"all" | string>("all");
  const [editingId, setEditingId] = React.useState<number | null>(null);
  const [creating, setCreating] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const filtered = items.filter((t) => filter === "all" || t.channel === filter);

  const flashError = (msg: string) => {
    setError(msg);
    window.setTimeout(() => setError(null), 5000);
  };

  async function create(draft: Draft) {
    const res = await fetch("/api/templates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(draftToPayload(draft)),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || "יצירת התבנית נכשלה");
    setItems((prev) => [...prev, data as TemplateRow].sort(heSort));
    setCreating(false);
  }

  async function save(id: number, draft: Draft) {
    const res = await fetch(`/api/templates/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(draftToPayload(draft)),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || "שמירת התבנית נכשלה");
    setItems((prev) => prev.map((t) => (t.id === id ? (data as TemplateRow) : t)).sort(heSort));
    setEditingId(null);
  }

  async function remove(t: TemplateRow) {
    if (!window.confirm(`למחוק את התבנית "${t.name}"?`)) return;
    try {
      const res = await fetch(`/api/templates/${t.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setItems((prev) => prev.filter((x) => x.id !== t.id));
      if (editingId === t.id) setEditingId(null);
    } catch {
      flashError("מחיקת התבנית נכשלה — נסה שוב");
    }
  }

  return (
    <div className="space-y-4">
      {/* כותרת */}
      <header className="b-card p-5">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="b-icon b-icon-blue size-12 rounded-2xl inline-flex items-center justify-center shrink-0">
            <MessageSquare className="size-5" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="b-eyebrow">Yoatsim · שכפול 1:1</div>
            <h1 className="text-2xl font-extrabold text-bingo-black flex items-center gap-2 flex-wrap">
              תבניות הודעות
              <span className="b-chip b-chip-green text-[12px] tabular-nums">{items.length} תבניות</span>
            </h1>
            <p className="text-[11px] text-bingo-gray-500 mt-1" dir="ltr" style={{ textAlign: "right" }}>
              {"משתנים זמינים: {{firstName}}, {{leadId}}, {{feeAmount}}"}
            </p>
          </div>
          <button
            onClick={() => {
              setCreating(true);
              setEditingId(null);
            }}
            className="b-pill b-pill-green b-pill-sm shrink-0"
          >
            <Plus className="size-3.5" /> תבנית חדשה
          </button>
        </div>

        <div className="b-segment mt-4">
          <button data-active={filter === "all"} onClick={() => setFilter("all")}>
            הכל
          </button>
          {CHANNELS.map((c) => (
            <button key={c.value} data-active={filter === c.value} onClick={() => setFilter(c.value)}>
              {c.label}
            </button>
          ))}
        </div>
      </header>

      {error && (
        <div className="b-card border-status-red/40 bg-status-red-soft/40 px-4 py-2.5 flex items-center gap-2 text-[13px] font-bold text-status-red">
          {error}
          <button onClick={() => setError(null)} className="mr-auto text-status-red/70 hover:text-status-red" aria-label="סגור">
            <X className="size-4" />
          </button>
        </div>
      )}

      {/* תבנית חדשה */}
      {creating && (
        <TemplateEditor
          title="תבנית חדשה"
          draft={{ name: "", channel: "sms", sender: "", body: "", watiText: "" }}
          onCancel={() => setCreating(false)}
          onSave={create}
        />
      )}

      {/* הרשימה */}
      <div className="space-y-3">
        {filtered.map((t) =>
          editingId === t.id ? (
            <TemplateEditor
              key={t.id}
              title={`עריכת תבנית: ${t.name}`}
              draft={toDraft(t)}
              onCancel={() => setEditingId(null)}
              onSave={(d) => save(t.id, d)}
              onDelete={() => remove(t)}
            />
          ) : (
            <TemplateCard
              key={t.id}
              template={t}
              onEdit={() => {
                setEditingId(t.id);
                setCreating(false);
              }}
              onDelete={() => remove(t)}
            />
          )
        )}
        {filtered.length === 0 && (
          <div className="b-card p-10 text-center text-[13px] text-bingo-gray-500">
            אין תבניות בערוץ הזה.
          </div>
        )}
      </div>
    </div>
  );
}

/* ============================== שורת תבנית ============================== */

function TemplateCard({
  template: t,
  onEdit,
  onDelete,
}: {
  template: TemplateRow;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const meta = channelMeta(t.channel);
  const preview = t.body?.trim() || (t.watiJson ? formatJson(t.watiJson) : "");
  return (
    <article className="b-card b-card-hover p-4 cursor-pointer group" onClick={onEdit}>
      <div className="flex items-center gap-2.5 flex-wrap">
        <h3 className="text-[14px] font-extrabold text-bingo-black">{t.name}</h3>
        <span className={cn("b-chip text-[11px]", meta.chip)}>{meta.label}</span>
        <span className="text-[11px] text-bingo-gray-500">
          שולח: <b className="text-bingo-charcoal" dir="ltr">{t.sender?.trim() ? t.sender : "טלפון היוזר"}</b>
        </span>
        <div className="ms-auto flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="size-8 rounded-xl bg-bingo-gray-100 hover:bg-bingo-gray-200 text-bingo-gray-600 inline-flex items-center justify-center"
            title="עריכה"
          >
            <Pencil className="size-3.5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="size-8 rounded-xl bg-bingo-gray-100 hover:bg-status-red-soft text-bingo-gray-500 hover:text-status-red inline-flex items-center justify-center"
            title="מחיקה"
          >
            <Trash2 className="size-3.5" />
          </button>
        </div>
      </div>
      {preview && (
        <p
          className={cn(
            "mt-2 text-[12px] leading-relaxed text-bingo-charcoal line-clamp-2 whitespace-pre-line",
            t.channel === "wati" && "font-mono text-[11px]"
          )}
          dir={t.channel === "wati" ? "ltr" : "rtl"}
        >
          {preview}
        </p>
      )}
    </article>
  );
}

/* ============================== עורך ============================== */

function TemplateEditor({
  title,
  draft: initialDraft,
  onCancel,
  onSave,
  onDelete,
}: {
  title: string;
  draft: Draft;
  onCancel: () => void;
  onSave: (draft: Draft) => Promise<void>;
  onDelete?: () => void;
}) {
  const [draft, setDraft] = React.useState<Draft>(initialDraft);
  const [saving, setSaving] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);

  const patch = (p: Partial<Draft>) => setDraft((d) => ({ ...d, ...p }));

  const watiError = React.useMemo(() => {
    if (draft.channel !== "wati" || !draft.watiText.trim()) return null;
    try {
      JSON.parse(draft.watiText);
      return null;
    } catch (e: any) {
      return e?.message || "JSON לא תקין";
    }
  }, [draft.channel, draft.watiText]);

  async function handleSave() {
    if (!draft.name.trim()) {
      setErr("שם התבנית חובה");
      return;
    }
    if (watiError) {
      setErr("לא ניתן לשמור — ה-JSON של WATI אינו תקין");
      return;
    }
    setSaving(true);
    setErr(null);
    try {
      await onSave(draft);
    } catch (e: any) {
      setErr(e?.message || "שמירה נכשלה");
      setSaving(false);
    }
  }

  return (
    <article className="b-card p-5 border-bingo-green-dark/40 ring-4 ring-bingo-green/10">
      <div className="flex items-center gap-2">
        <span className="b-chip b-chip-dark text-[11px]">
          <Pencil className="size-3" /> {title}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
        <Labeled label="שם התבנית">
          <input className="b-input" value={draft.name} onChange={(e) => patch({ name: e.target.value })} />
        </Labeled>
        <Labeled label="ערוץ">
          <select className="b-input" value={draft.channel} onChange={(e) => patch({ channel: e.target.value })}>
            {CHANNELS.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </Labeled>
        <Labeled label="שולח">
          <select className="b-input" value={draft.sender} onChange={(e) => patch({ sender: e.target.value })}>
            {SENDERS.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </Labeled>
      </div>

      <div className="mt-3">
        <Labeled label="גוף ההודעה">
          <textarea
            dir="rtl"
            rows={4}
            className="b-input !h-auto py-3 leading-relaxed resize-y"
            value={draft.body}
            onChange={(e) => patch({ body: e.target.value })}
            placeholder="היי {{firstName}}, ..."
          />
        </Labeled>
      </div>

      {draft.channel === "wati" && (
        <div className="mt-3">
          <Labeled label="WATI JSON (template_name, broadcast_name, parameters, buttons)">
            <textarea
              dir="ltr"
              rows={8}
              className={cn(
                "b-input !h-auto py-3 font-mono text-[12px] leading-relaxed resize-y",
                watiError && "!border-status-red"
              )}
              value={draft.watiText}
              onChange={(e) => patch({ watiText: e.target.value })}
              placeholder='{"template_name": "...", "broadcast_name": "...", "parameters": []}'
              spellCheck={false}
            />
          </Labeled>
          {watiError && (
            <p className="text-[11px] font-bold text-status-red mt-1" dir="ltr" style={{ textAlign: "right" }}>
              JSON לא תקין: {watiError}
            </p>
          )}
        </div>
      )}

      <div className="flex items-center gap-2 mt-5 pt-4 border-t border-bingo-gray-100">
        {onDelete && (
          <button
            onClick={onDelete}
            disabled={saving}
            className="b-pill b-pill-ghost b-pill-sm !text-status-red"
          >
            <Trash2 className="size-3.5" /> מחיקה
          </button>
        )}
        {err && <span className="text-[12px] font-bold text-status-red">{err}</span>}
        <div className="ms-auto flex items-center gap-2">
          <button onClick={onCancel} disabled={saving} className="b-pill b-pill-ghost b-pill-sm">
            ביטול
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !!watiError}
            className={cn("b-pill b-pill-green b-pill-sm", (saving || !!watiError) && "opacity-60")}
          >
            {saving ? "שומר…" : "שמירה"}
          </button>
        </div>
      </div>
    </article>
  );
}

function Labeled({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-[11px] font-bold text-bingo-gray-500 mb-1">{label}</span>
      {children}
    </label>
  );
}

function draftToPayload(d: Draft) {
  return {
    name: d.name.trim(),
    channel: d.channel,
    sender: d.sender,
    body: d.body,
    watiJson: d.channel === "wati" && d.watiText.trim() ? d.watiText.trim() : null,
  };
}
