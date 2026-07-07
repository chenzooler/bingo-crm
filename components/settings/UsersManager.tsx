"use client";
/**
 * ניהול משתמשים — שכפול Yoatsim (27 משתמשים · 9 רמות הרשאה).
 * DB-backed: שינוי הרשאה/פעיל נשמר מיידית (PATCH אופטימי), משתמש חדש ב-POST.
 */
import * as React from "react";
import Link from "next/link";
import { Avatar } from "@/components/ui/Avatar";
import { PERMISSION_PROFILES } from "@/lib/yoatsim/permissions";
import { Plus, ShieldCheck, Search, X } from "lucide-react";

export interface UserRow {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  emoji: string | null;
  role: string;
  permissionRole: string | null;
  active: boolean;
}

const ROLE_LABELS: Record<string, { label: string; chip: string }> = {
  owner: { label: "בעלים", chip: "b-chip-green" },
  manager: { label: "מנהל", chip: "b-chip-blue" },
  agent: { label: "נציג", chip: "b-chip-gray" },
  underwriter: { label: "החתמה", chip: "b-chip-orange" },
  marketing: { label: "שיווק", chip: "b-chip-blue" },
  bot: { label: "אוטומציה", chip: "b-chip-dark" },
};

const ROLE_OPTIONS = [
  { value: "owner", label: "בעלים" },
  { value: "manager", label: "מנהל" },
  { value: "agent", label: "נציג" },
  { value: "underwriter", label: "החתמה" },
  { value: "marketing", label: "שיווק" },
  { value: "bot", label: "אוטומציה" },
];

async function patchUser(id: number, data: Record<string, unknown>) {
  const res = await fetch(`/api/users/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error((await res.json().catch(() => null))?.error || "שגיאה בשמירה");
  return res.json();
}

export function UsersManager({ initialUsers }: { initialUsers: UserRow[] }) {
  const [users, setUsers] = React.useState<UserRow[]>(initialUsers);
  const [search, setSearch] = React.useState("");
  const [showForm, setShowForm] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const activeCount = users.filter((u) => u.active).length;
  const filtered = users.filter(
    (u) => !search || u.name.includes(search) || (u.email ?? "").includes(search) || (u.phone ?? "").includes(search),
  );

  function updateLocal(id: number, patch: Partial<UserRow>) {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...patch } : u)));
  }

  // עדכון אופטימי — מחזירים אחורה אם השרת נכשל
  async function optimistic(id: number, patch: Partial<UserRow>) {
    const before = users.find((u) => u.id === id);
    updateLocal(id, patch);
    setError(null);
    try {
      await patchUser(id, patch);
    } catch (e: any) {
      if (before) updateLocal(id, before);
      setError(e.message);
    }
  }

  return (
    <div className="b-card overflow-hidden p-0">
      {/* כותרת */}
      <div className="px-6 py-4 border-b border-bingo-gray-100 flex items-center justify-between gap-3 flex-wrap">
        <div>
          <div className="b-eyebrow">ארגון</div>
          <h2 className="text-xl font-extrabold text-bingo-black flex items-center gap-2.5">
            ניהול משתמשים
            <span className="b-chip b-chip-green">
              {users.length} משתמשים · {activeCount} פעילים
            </span>
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 size-3.5 text-bingo-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="חפש משתמש..."
              className="b-input !h-9 !w-52 !text-xs pr-8"
            />
          </div>
          <button onClick={() => setShowForm((v) => !v)} className="b-pill b-pill-dark b-pill-sm inline-flex items-center gap-1.5">
            {showForm ? <X className="size-3.5" /> : <Plus className="size-3.5" />}
            משתמש חדש
          </button>
        </div>
      </div>

      {error && (
        <div className="mx-6 mt-3 rounded-xl bg-status-red-soft text-status-red text-[12px] font-bold px-4 py-2">
          {error}
        </div>
      )}

      {showForm && (
        <NewUserForm
          onCreated={(u) => {
            setUsers((prev) => [u, ...prev]);
            setShowForm(false);
          }}
        />
      )}

      {/* טבלה */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[820px]">
          <thead className="bg-bingo-gray-50/50">
            <tr className="text-right text-[10px] font-bold uppercase tracking-wider text-bingo-gray-500 border-b border-bingo-gray-100">
              <th className="px-6 py-3">משתמש</th>
              <th className="px-3 py-3">טלפון</th>
              <th className="px-3 py-3">תפקיד</th>
              <th className="px-3 py-3">הרשאה (Yoatsim)</th>
              <th className="px-3 py-3">פעיל</th>
              <th className="px-3 py-3 w-32"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => {
              const role = ROLE_LABELS[u.role] ?? { label: u.role, chip: "b-chip-gray" };
              return (
                <tr
                  key={u.id}
                  className={`border-b border-bingo-gray-100 last:border-0 hover:bg-bingo-green/[0.03] group ${u.active ? "" : "opacity-50"}`}
                >
                  <td className="px-6 py-2.5">
                    <div className="flex items-center gap-3">
                      <Avatar name={u.name} emoji={u.emoji ?? undefined} size="md" />
                      <div className="min-w-0">
                        <div className="text-[13px] font-extrabold text-bingo-black truncate">{u.name}</div>
                        <div className="text-[10px] text-bingo-gray-500 truncate" dir="ltr">
                          {u.email || `#${u.id}`}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2.5 text-[12px] tabular-nums text-bingo-gray-600 whitespace-nowrap" dir="ltr">
                    {u.phone || "—"}
                  </td>
                  <td className="px-3 py-2.5">
                    <span className={`b-chip ${role.chip}`}>{role.label}</span>
                  </td>
                  <td className="px-3 py-2.5">
                    <select
                      value={u.permissionRole ?? ""}
                      onChange={(e) => optimistic(u.id, { permissionRole: e.target.value || null })}
                      className="h-8 rounded-xl border-[1.5px] border-bingo-gray-200 bg-white px-2.5 text-[12px] font-bold text-bingo-charcoal hover:border-bingo-gray-300 focus:border-bingo-green-dark focus:outline-none cursor-pointer"
                    >
                      <option value="">— ללא —</option>
                      {PERMISSION_PROFILES.map((p) => (
                        <option key={p.key} value={p.key}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-3 py-2.5">
                    <button
                      role="switch"
                      aria-checked={u.active}
                      title={u.active ? "פעיל — לחץ להשבתה" : "מושבת — לחץ להפעלה"}
                      onClick={() => optimistic(u.id, { active: !u.active })}
                      className={`relative h-6 w-11 rounded-full transition-colors ${u.active ? "bg-bingo-green" : "bg-bingo-gray-200"}`}
                    >
                      <span
                        className={`absolute top-0.5 size-5 rounded-full bg-white shadow transition-all ${u.active ? "right-[22px]" : "right-0.5"}`}
                      />
                    </button>
                  </td>
                  <td className="px-3 py-2.5">
                    <Link
                      href={`/settings/permissions${u.permissionRole ? `?role=${u.permissionRole}` : ""}`}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-bingo-blue hover:underline whitespace-nowrap"
                    >
                      <ShieldCheck className="size-3.5" />
                      מטריצת הרשאות
                    </Link>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-[13px] text-bingo-gray-500">
                  לא נמצאו משתמשים
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ---------- טופס משתמש חדש ---------- */
function NewUserForm({ onCreated }: { onCreated: (u: UserRow) => void }) {
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [role, setRole] = React.useState("agent");
  const [permissionRole, setPermissionRole] = React.useState("credit-advisors");
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return setError("חובה למלא שם");
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, role, permissionRole }),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => null))?.error || "שגיאה ביצירה");
      onCreated(await res.json());
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="mx-6 mt-4 mb-1 rounded-2xl border border-bingo-green/30 bg-bingo-green-light/30 p-4">
      <div className="b-eyebrow mb-3">משתמש חדש</div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="שם מלא *" className="b-input !h-10 !text-[13px]" autoFocus />
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="אימייל" type="email" dir="ltr" className="b-input !h-10 !text-[13px]" />
        <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="טלפון" dir="ltr" className="b-input !h-10 !text-[13px]" />
        <select value={role} onChange={(e) => setRole(e.target.value)} className="b-input !h-10 !text-[13px] cursor-pointer">
          {ROLE_OPTIONS.map((r) => (
            <option key={r.value} value={r.value}>
              תפקיד: {r.label}
            </option>
          ))}
        </select>
        <select value={permissionRole} onChange={(e) => setPermissionRole(e.target.value)} className="b-input !h-10 !text-[13px] cursor-pointer">
          {PERMISSION_PROFILES.map((p) => (
            <option key={p.key} value={p.key}>
              הרשאה: {p.name}
            </option>
          ))}
        </select>
      </div>
      {error && <div className="mt-2 text-[12px] font-bold text-status-red">{error}</div>}
      <div className="mt-3 flex justify-end">
        <button type="submit" disabled={saving} className="b-pill b-pill-green b-pill-sm disabled:opacity-50">
          {saving ? "שומר..." : "צור משתמש"}
        </button>
      </div>
    </form>
  );
}
