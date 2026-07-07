"use client";
// מסך האוטומציות — שכפול Yoatsim 1:1: פרטי בסיס → תנאים → פעולות, עם מתג ועריכה מובנית
import * as React from "react";
import { PROCESSES } from "@/lib/yoatsim/processes";
import { cn } from "@/lib/utils";
import {
  Zap, Pencil, Plus, Trash2, ChevronDown, Filter, Send, UserPlus, GitBranch, X,
} from "lucide-react";

export interface AutomationCondition {
  fieldType: string;
  fieldName: string;
  operator: string;
  value: string;
}

export interface AutomationAction {
  type: "add-process" | "send-template" | "assign-user";
  processKey?: string;
  statusKey?: string;
  templateName?: string;
  note?: string;
}

export interface AutomationRow {
  id: number;
  name: string;
  cardType: string;
  actionType: string | null;
  enabled: boolean;
  conditions: AutomationCondition[];
  actions: AutomationAction[];
}

const EQ = "שווה ל";
const CARD_TYPES = ["כרטיס", "שכפול", "כרטיס בדיקה"] as const;
const ACTION_TYPE_LABELS: Record<AutomationAction["type"], string> = {
  "add-process": "הוספת תהליך/סטטוס",
  "send-template": "שליחת תבנית",
  "assign-user": "שיוך משתמש",
};

function processOf(key?: string) {
  return PROCESSES.find((p) => p.key === key);
}

/* ============================== המסך ============================== */

export default function AutomationsManager({ initial }: { initial: AutomationRow[] }) {
  const [items, setItems] = React.useState<AutomationRow[]>(initial);
  const [editingId, setEditingId] = React.useState<number | null>(null);
  const [templateNames, setTemplateNames] = React.useState<string[] | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const active = items.filter((a) => a.enabled).length;

  const flashError = (msg: string) => {
    setError(msg);
    window.setTimeout(() => setError(null), 5000);
  };

  // רשימת שמות התבניות — נטענת פעם אחת, לצורך select בעורך
  const ensureTemplates = React.useCallback(async () => {
    if (templateNames) return;
    try {
      const res = await fetch("/api/templates");
      const data = await res.json();
      setTemplateNames(((data.templates ?? []) as { name: string }[]).map((t) => t.name));
    } catch {
      setTemplateNames([]);
    }
  }, [templateNames]);

  async function toggle(id: number) {
    const item = items.find((a) => a.id === id);
    if (!item) return;
    const next = !item.enabled;
    setItems((prev) => prev.map((a) => (a.id === id ? { ...a, enabled: next } : a))); // אופטימי
    try {
      const res = await fetch(`/api/automations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: next }),
      });
      if (!res.ok) throw new Error();
    } catch {
      setItems((prev) => prev.map((a) => (a.id === id ? { ...a, enabled: !next } : a))); // החזרה
      flashError("שמירת המתג נכשלה — נסה שוב");
    }
  }

  async function save(id: number, draft: Omit<AutomationRow, "id" | "enabled">) {
    const res = await fetch(`/api/automations/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: draft.name,
        cardType: draft.cardType,
        actionType: draft.actionType ?? "",
        conditions: draft.conditions,
        actions: draft.actions,
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || "שמירה נכשלה");
    setItems((prev) => prev.map((a) => (a.id === id ? (data as AutomationRow) : a)));
    setEditingId(null);
  }

  return (
    <div className="max-w-[1100px] space-y-4">
      {/* כותרת */}
      <header className="b-card p-5 flex items-center gap-4 flex-wrap">
        <span className="b-icon b-icon-green size-12 rounded-2xl inline-flex items-center justify-center shrink-0">
          <Zap className="size-5" />
        </span>
        <div className="min-w-0">
          <div className="b-eyebrow">Yoatsim · שכפול 1:1</div>
          <h1 className="text-2xl font-extrabold text-bingo-black flex items-center gap-2 flex-wrap">
            אוטומציות
            <span className="b-chip b-chip-green text-[12px] tabular-nums">
              {active} פעילות / {items.length} סה״כ
            </span>
          </h1>
          <p className="text-[12px] text-bingo-gray-600 mt-1">
            כל אוטומציה בודקת תנאים על שדות הכרטיס, וכשהם מתקיימים מפעילה פעולות — הוספת תהליך וסטטוס, שליחת תבנית הודעה או שיוך משתמש.
          </p>
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

      {/* הכרטיסים */}
      <div className="space-y-3">
        {items.map((a) =>
          editingId === a.id ? (
            <AutomationEditor
              key={a.id}
              automation={a}
              templateNames={templateNames ?? []}
              onCancel={() => setEditingId(null)}
              onSave={(draft) => save(a.id, draft)}
            />
          ) : (
            <AutomationCard
              key={a.id}
              automation={a}
              onToggle={() => toggle(a.id)}
              onEdit={() => {
                void ensureTemplates();
                setEditingId(a.id);
              }}
            />
          )
        )}
        {items.length === 0 && (
          <div className="b-card p-10 text-center text-[13px] text-bingo-gray-500">
            אין אוטומציות ב-DB. הרץ את הזריעה (npm run db:seed) כדי לטעון את 21 האוטומציות של Yoatsim.
          </div>
        )}
      </div>
    </div>
  );
}

/* ============================== כרטיס תצוגה ============================== */

function AutomationCard({
  automation: a,
  onToggle,
  onEdit,
}: {
  automation: AutomationRow;
  onToggle: () => void;
  onEdit: () => void;
}) {
  return (
    <article className={cn("b-card p-5 transition", !a.enabled && "opacity-60 bg-bingo-gray-50")}>
      {/* אזור 1 — פרטי בסיס */}
      <div className="flex items-center gap-3 flex-wrap">
        <Toggle on={a.enabled} onChange={onToggle} label={a.name} />
        <h3 className="text-[16px] font-extrabold text-bingo-black">{a.name}</h3>
        <span className="b-chip b-chip-gray text-[11px]">{a.cardType}</span>
        {a.actionType && (
          <span className="text-[12px] text-bingo-gray-500">
            סוג פעולה: <b className="text-bingo-charcoal">{a.actionType}</b>
          </span>
        )}
        {!a.enabled && <span className="b-chip b-chip-gray text-[11px]">כבויה</span>}
        <button onClick={onEdit} className="b-pill b-pill-ghost b-pill-sm ms-auto shrink-0">
          <Pencil className="size-3.5" /> עריכה
        </button>
      </div>

      {/* זרימה: תנאים ← פעולות */}
      <div className="mt-4">
        <FlowZone title="תנאים" icon={<Filter className="size-3" />}>
          {a.conditions.length === 0 ? (
            <span className="text-[12px] text-bingo-gray-400">ללא תנאים — רצה תמיד</span>
          ) : (
            a.conditions.map((c, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1.5 rounded-full border border-bingo-gray-200 bg-white px-3 py-1 text-[12px]"
              >
                <b className="text-bingo-black">{c.fieldName}</b>
                <span className="text-bingo-gray-400">{c.operator || EQ}</span>
                <span className="b-chip b-chip-blue text-[11px]">{c.value}</span>
              </span>
            ))
          )}
        </FlowZone>

        <FlowZone title="פעולות" icon={<Zap className="size-3" />} last>
          {a.actions.length === 0 ? (
            <span className="text-[12px] text-bingo-gray-400">ללא פעולות</span>
          ) : (
            a.actions.map((act, i) => <ActionChip key={i} action={act} />)
          )}
        </FlowZone>
      </div>
    </article>
  );
}

function ActionChip({ action }: { action: AutomationAction }) {
  if (action.type === "add-process") {
    const proc = processOf(action.processKey);
    return (
      <span className="b-chip b-chip-green text-[12px]">
        <GitBranch className="size-3" />
        הוספת תהליך: {proc ? `${proc.emoji} ${proc.name}` : action.processKey}
        {action.statusKey && <span className="opacity-70">←</span>}
        {action.statusKey && <b>{action.statusKey}</b>}
      </span>
    );
  }
  if (action.type === "send-template") {
    return (
      <span className="b-chip b-chip-blue text-[12px]">
        <Send className="size-3" />
        שליחת תבנית: <b>{action.templateName}</b>
      </span>
    );
  }
  return (
    <span className="b-chip b-chip-orange text-[12px]">
      <UserPlus className="size-3" />
      שיוך משתמש
    </span>
  );
}

/* אזור בזרימה — נקודה + קו אנכי מקשר (מיני-פלואוצ'ארט) */
function FlowZone({
  title,
  icon,
  children,
  last,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  last?: boolean;
}) {
  return (
    <div className={cn("relative pr-6", !last && "pb-4")}>
      <span className="absolute right-0 top-0.5 size-3.5 rounded-full border-2 border-bingo-green-dark bg-white z-10" />
      {!last && (
        <>
          <span className="absolute right-[6px] top-3 bottom-[-6px] w-px bg-bingo-gray-200" />
          <ChevronDown className="absolute right-[-1px] bottom-[-9px] size-4 text-bingo-gray-300" />
        </>
      )}
      <div className="b-eyebrow flex items-center gap-1 leading-none">
        {icon} {title}
      </div>
      <div className="flex flex-wrap items-center gap-1.5 mt-2">{children}</div>
    </div>
  );
}

/* ============================== עורך ============================== */

function AutomationEditor({
  automation: a,
  templateNames,
  onCancel,
  onSave,
}: {
  automation: AutomationRow;
  templateNames: string[];
  onCancel: () => void;
  onSave: (draft: Omit<AutomationRow, "id" | "enabled">) => Promise<void>;
}) {
  const [name, setName] = React.useState(a.name);
  const [cardType, setCardType] = React.useState(a.cardType);
  const [actionType, setActionType] = React.useState(a.actionType ?? "");
  const [conditions, setConditions] = React.useState<AutomationCondition[]>(
    a.conditions.map((c) => ({ ...c }))
  );
  const [actions, setActions] = React.useState<AutomationAction[]>(a.actions.map((x) => ({ ...x })));
  const [saving, setSaving] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);

  const setCondition = (i: number, patch: Partial<AutomationCondition>) =>
    setConditions((prev) => prev.map((c, j) => (j === i ? { ...c, ...patch } : c)));
  const setAction = (i: number, patch: Partial<AutomationAction>) =>
    setActions((prev) => prev.map((x, j) => (j === i ? { ...x, ...patch } : x)));

  async function handleSave() {
    if (!name.trim()) {
      setErr("שם האוטומציה חובה");
      return;
    }
    setSaving(true);
    setErr(null);
    try {
      await onSave({ name: name.trim(), cardType, actionType, conditions, actions });
    } catch (e: any) {
      setErr(e?.message || "שמירה נכשלה");
      setSaving(false);
    }
  }

  return (
    <article className="b-card p-5 border-bingo-green-dark/40 ring-4 ring-bingo-green/10">
      <div className="flex items-center gap-2">
        <span className="b-chip b-chip-dark text-[11px]">
          <Pencil className="size-3" /> עריכת אוטומציה
        </span>
        <span className="text-[13px] font-bold text-bingo-gray-500 truncate">{a.name}</span>
      </div>

      {/* פרטי בסיס */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
        <Labeled label="שם האוטומציה">
          <input className="b-input" value={name} onChange={(e) => setName(e.target.value)} />
        </Labeled>
        <Labeled label="סוג כרטיס">
          <select className="b-input" value={cardType} onChange={(e) => setCardType(e.target.value)}>
            {CARD_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
            {!CARD_TYPES.includes(cardType as any) && <option value={cardType}>{cardType}</option>}
          </select>
        </Labeled>
        <Labeled label="סוג פעולה">
          <input
            className="b-input"
            value={actionType}
            onChange={(e) => setActionType(e.target.value)}
            placeholder="שינוי שדה / שינוי סטטוס / שליחת הודעה"
          />
        </Labeled>
      </div>

      {/* תנאים */}
      <div className="mt-5">
        <div className="b-eyebrow flex items-center gap-1 mb-2">
          <Filter className="size-3" /> תנאים
        </div>
        <div className="space-y-2">
          {conditions.map((c, i) => (
            <div key={i} className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
              <input
                className="b-input flex-1 min-w-[160px]"
                value={c.fieldName}
                onChange={(e) => setCondition(i, { fieldName: e.target.value })}
                placeholder="שם השדה בכרטיס"
              />
              <span className="b-chip b-chip-gray text-[12px] shrink-0">{EQ}</span>
              <input
                className="b-input flex-1 min-w-[120px]"
                value={c.value}
                onChange={(e) => setCondition(i, { value: e.target.value })}
                placeholder="ערך"
              />
              <button
                onClick={() => setConditions((prev) => prev.filter((_, j) => j !== i))}
                className="size-9 rounded-xl bg-bingo-gray-100 hover:bg-status-red-soft text-bingo-gray-500 hover:text-status-red inline-flex items-center justify-center shrink-0"
                title="הסר תנאי"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          ))}
        </div>
        <button
          onClick={() =>
            setConditions((prev) => [...prev, { fieldType: "בחירה מרשימה", fieldName: "", operator: EQ, value: "" }])
          }
          className="b-pill b-pill-ghost b-pill-sm mt-2"
        >
          <Plus className="size-3.5" /> הוסף תנאי
        </button>
      </div>

      {/* פעולות */}
      <div className="mt-5">
        <div className="b-eyebrow flex items-center gap-1 mb-2">
          <Zap className="size-3" /> פעולות
        </div>
        <div className="space-y-2">
          {actions.map((act, i) => {
            const proc = processOf(act.processKey);
            const statuses = proc?.statuses ?? [];
            return (
              <div key={i} className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                <select
                  className="b-input w-full sm:w-[190px] shrink-0"
                  value={act.type}
                  onChange={(e) => {
                    const type = e.target.value as AutomationAction["type"];
                    if (type === "add-process") {
                      const first = PROCESSES[0];
                      setActions((prev) =>
                        prev.map((x, j) =>
                          j === i ? { type, processKey: first.key, statusKey: first.statuses[0] } : x
                        )
                      );
                    } else if (type === "send-template") {
                      setActions((prev) =>
                        prev.map((x, j) => (j === i ? { type, templateName: templateNames[0] ?? "" } : x))
                      );
                    } else {
                      setActions((prev) => prev.map((x, j) => (j === i ? { type } : x)));
                    }
                  }}
                >
                  {(Object.keys(ACTION_TYPE_LABELS) as AutomationAction["type"][]).map((t) => (
                    <option key={t} value={t}>{ACTION_TYPE_LABELS[t]}</option>
                  ))}
                </select>

                {act.type === "add-process" && (
                  <>
                    <select
                      className="b-input flex-1 min-w-[160px]"
                      value={act.processKey ?? ""}
                      onChange={(e) => {
                        const p = processOf(e.target.value);
                        setAction(i, { processKey: e.target.value, statusKey: p?.statuses[0] ?? "" });
                      }}
                    >
                      {act.processKey && !proc && <option value={act.processKey}>{act.processKey}</option>}
                      {PROCESSES.map((p) => (
                        <option key={p.key} value={p.key}>
                          {p.emoji} {p.name}
                        </option>
                      ))}
                    </select>
                    <select
                      className="b-input flex-1 min-w-[160px]"
                      value={act.statusKey ?? ""}
                      onChange={(e) => setAction(i, { statusKey: e.target.value })}
                    >
                      {act.statusKey && !statuses.includes(act.statusKey) && (
                        <option value={act.statusKey}>{act.statusKey}</option>
                      )}
                      {statuses.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </>
                )}

                {act.type === "send-template" && (
                  <select
                    className="b-input flex-1 min-w-[200px]"
                    value={act.templateName ?? ""}
                    onChange={(e) => setAction(i, { templateName: e.target.value })}
                  >
                    {act.templateName && !templateNames.includes(act.templateName) && (
                      <option value={act.templateName}>{act.templateName}</option>
                    )}
                    {templateNames.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                )}

                {act.type === "assign-user" && (
                  <span className="text-[12px] text-bingo-gray-500 flex-1">שיוך המשתמש המטפל לכרטיס</span>
                )}

                <button
                  onClick={() => setActions((prev) => prev.filter((_, j) => j !== i))}
                  className="size-9 rounded-xl bg-bingo-gray-100 hover:bg-status-red-soft text-bingo-gray-500 hover:text-status-red inline-flex items-center justify-center shrink-0"
                  title="הסר פעולה"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            );
          })}
        </div>
        <button
          onClick={() =>
            setActions((prev) => [
              ...prev,
              { type: "add-process", processKey: PROCESSES[0].key, statusKey: PROCESSES[0].statuses[0] },
            ])
          }
          className="b-pill b-pill-ghost b-pill-sm mt-2"
        >
          <Plus className="size-3.5" /> הוסף פעולה
        </button>
      </div>

      {/* פוטר */}
      <div className="flex items-center gap-2 mt-5 pt-4 border-t border-bingo-gray-100">
        {err && <span className="text-[12px] font-bold text-status-red">{err}</span>}
        <div className="ms-auto flex items-center gap-2">
          <button onClick={onCancel} disabled={saving} className="b-pill b-pill-ghost b-pill-sm">
            ביטול
          </button>
          <button onClick={handleSave} disabled={saving} className="b-pill b-pill-green b-pill-sm">
            {saving ? "שומר…" : "שמירה"}
          </button>
        </div>
      </div>
    </article>
  );
}

/* ============================== עזרים ============================== */

function Labeled({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-[11px] font-bold text-bingo-gray-500 mb-1">{label}</span>
      {children}
    </label>
  );
}

function Toggle({ on, onChange, label }: { on: boolean; onChange: () => void; label?: string }) {
  return (
    <button
      role="switch"
      aria-checked={on}
      aria-label={label ? `הפעלת ${label}` : "מתג"}
      onClick={onChange}
      className={cn(
        "relative h-6 w-11 rounded-full transition-colors shrink-0",
        on ? "bg-bingo-black" : "bg-bingo-gray-200"
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 size-5 rounded-full shadow transition-all",
          on ? "right-[22px] bg-bingo-green" : "right-0.5 bg-white"
        )}
      />
    </button>
  );
}
