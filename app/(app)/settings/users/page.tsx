"use client";
import * as React from "react";
import { USERS } from "@/lib/data/static";
import { Avatar } from "@/components/ui/Avatar";
import { Plus, Pencil, Trash2, Shield, Search } from "lucide-react";

const ROLE_LABELS: Record<string, { label: string; color: string }> = {
  owner: { label: "בעלים", color: "bg-bingo-green/15 text-bingo-green-dark border-bingo-green/40" },
  manager: { label: "מנהל", color: "bg-status-purple-soft text-status-purple border-status-purple/30" },
  agent: { label: "נציג מכירות", color: "bg-status-blue-soft text-status-blue border-status-blue/30" },
  underwriter: { label: "החתמה", color: "bg-status-orange-soft text-orange-700 border-status-orange/30" },
  marketing: { label: "שיווק", color: "bg-status-pink-soft text-status-pink border-status-pink/30" },
  bot: { label: "אוטומציה", color: "bg-bingo-gray-100 text-bingo-gray-700 border-bingo-gray-200" },
};

export default function UsersSettingsPage() {
  const [search, setSearch] = React.useState("");
  const filtered = USERS.filter((u) => !search || u.name.includes(search));

  return (
    <div className="bg-white rounded-3xl border border-bingo-gray-200 bingo-shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-bingo-gray-100 flex items-center justify-between gap-3 flex-wrap">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-bingo-gray-500">ארגון</div>
          <h2 className="text-xl font-extrabold text-bingo-black">משתמשים והרשאות</h2>
          <p className="text-[12px] text-bingo-gray-600 mt-1">{USERS.length} משתמשים פעילים</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute right-2.5 top-1/2 -translate-y-1/2 size-3.5 text-bingo-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="חפש משתמש..."
              className="h-9 w-56 rounded-xl border border-bingo-gray-200 bg-white text-xs font-medium pr-8 pl-3 focus:border-bingo-green focus:outline-none focus:ring-2 focus:ring-bingo-green/15"
            />
          </div>
          <button className="h-9 px-3 rounded-xl bg-bingo-black text-white text-xs font-bold hover:bg-bingo-charcoal inline-flex items-center gap-1.5">
            <Plus className="size-3.5" /> משתמש חדש
          </button>
        </div>
      </div>

      <table className="w-full text-sm">
        <thead className="bg-bingo-gray-50/40">
          <tr className="text-right text-[10px] font-bold uppercase tracking-wider text-bingo-gray-500 border-b border-bingo-gray-100">
            <th className="px-6 py-3">משתמש</th>
            <th className="px-3 py-3">תפקיד</th>
            <th className="px-3 py-3">מזהה</th>
            <th className="px-3 py-3 w-24"></th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((u) => {
            const role = ROLE_LABELS[u.role];
            return (
              <tr key={u.id} className="border-b border-bingo-gray-100 last:border-0 hover:bg-bingo-green/[0.03] group">
                <td className="px-6 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar name={u.name} emoji={u.emoji} size="md" />
                    <div>
                      <div className="text-[13px] font-extrabold text-bingo-black">{u.name}</div>
                      <div className="text-[10px] text-bingo-gray-500">משתמש #{u.id}</div>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-3">
                  <span className={`text-[10px] font-bold rounded-full border px-2 py-0.5 ${role.color}`}>{role.label}</span>
                </td>
                <td className="px-3 py-3 text-[11px] font-mono tabular-nums text-bingo-gray-600">{u.id}</td>
                <td className="px-3 py-3">
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition justify-end">
                    <button title="הרשאות" className="size-7 rounded-lg hover:bg-bingo-gray-100 text-bingo-gray-500 inline-flex items-center justify-center">
                      <Shield className="size-3.5" />
                    </button>
                    <button title="עריכה" className="size-7 rounded-lg hover:bg-bingo-gray-100 text-bingo-gray-500 inline-flex items-center justify-center">
                      <Pencil className="size-3.5" />
                    </button>
                    <button title="מחיקה" className="size-7 rounded-lg hover:bg-status-red/10 text-bingo-gray-500 hover:text-status-red inline-flex items-center justify-center">
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
