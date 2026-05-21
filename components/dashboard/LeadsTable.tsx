"use client";
import * as React from "react";
import Link from "next/link";
import { Lock, ArrowUpDown, MoreHorizontal, Phone, MessageCircle, Mail, X, Tag, Users, Trash2, Archive, Send, Download, UserPlus, CheckSquare, Trophy } from "lucide-react";
import type { Lead } from "@/lib/types";
import { LEADS } from "@/lib/data/leads";
import { getUser, getStatus, SOURCES } from "@/lib/data/static";
import { Avatar } from "@/components/ui/Avatar";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { LeadComparison } from "@/components/leads/LeadComparison";
import { formatDate, cn } from "@/lib/utils";

export function LeadsTable({ pipeline, status }: { pipeline?: string; status?: string }) {
  const [sortKey, setSortKey] = React.useState<keyof Lead>("intakeDate");
  const [sortDir, setSortDir] = React.useState<"asc" | "desc">("desc");
  const [tab, setTab] = React.useState<"cards" | "duplicates" | "test" | "contacts">("cards");
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [comparing, setComparing] = React.useState(false);

  const filtered = LEADS.filter((l) => (pipeline ? l.primaryPipeline === pipeline : true)).filter((l) =>
    status ? l.primaryStatus === status : true
  );

  const sorted = [...filtered].sort((a, b) => {
    const av = a[sortKey] as string | number | undefined;
    const bv = b[sortKey] as string | number | undefined;
    if (av === bv) return 0;
    if (av == null) return 1;
    if (bv == null) return -1;
    return (av < bv ? -1 : 1) * (sortDir === "asc" ? 1 : -1);
  });

  function toggleSort(k: keyof Lead) {
    if (sortKey === k) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(k); setSortDir("desc"); }
  }

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    setSelected((prev) => {
      if (prev.size === sorted.length && sorted.length > 0) return new Set();
      return new Set(sorted.map((l) => l.id));
    });
  }

  const allSelected = selected.size > 0 && selected.size === sorted.length;
  const someSelected = selected.size > 0 && selected.size < sorted.length;

  return (
    <div className="bg-white rounded-2xl border border-bingo-gray-200 bingo-shadow-sm overflow-hidden relative">
      <div className="border-b border-bingo-gray-150 px-4 py-2.5 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-1 bg-bingo-gray-100 rounded-lg p-0.5">
          <TabPill active={tab === "cards"} onClick={() => setTab("cards")} label="כרטיסים" badge={sorted.length} />
          <TabPill active={tab === "duplicates"} onClick={() => setTab("duplicates")} label="שכפול" />
          <TabPill active={tab === "test"} onClick={() => setTab("test")} label="כרטיסים בדיקה" />
          <TabPill active={tab === "contacts"} onClick={() => setTab("contacts")} label="אנשי קשר" />
        </div>
        <div className="flex items-center gap-1.5">
          <select className="h-8 px-2 rounded-lg border border-bingo-gray-200 bg-white text-[11px] font-bold text-bingo-charcoal">
            <option>25 רשומות</option>
            <option>50 רשומות</option>
            <option>100 רשומות</option>
          </select>
          <button className="h-8 px-3 rounded-lg bg-bingo-black text-white text-[11px] font-bold inline-flex items-center gap-1 hover:bg-bingo-charcoal transition">
            + הוספת כרטיס
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-bingo-gray-50/50">
            <tr className="text-right text-[10px] font-bold uppercase tracking-wider text-bingo-gray-500 border-b border-bingo-gray-150">
              <th className="px-2 py-2.5 w-9">
                <Checkbox
                  checked={allSelected}
                  indeterminate={someSelected}
                  onChange={toggleSelectAll}
                  ariaLabel="בחר הכל"
                />
              </th>
              <th className="px-3 py-2.5 w-10">
                <span className="block text-center">#</span>
              </th>
              <Th label="שם פרטי + משפחה" onSort={() => toggleSort("fullName")} active={sortKey === "fullName"} />
              <Th label="תעודת זהות" onSort={() => toggleSort("idNumber")} active={sortKey === "idNumber"} />
              <Th label="מקור הליד" />
              <Th label="אחראי" />
              <Th label="סטטוס" />
              <Th label="קליטה" onSort={() => toggleSort("intakeDate")} active={sortKey === "intakeDate"} />
              <th className="px-3 py-2.5 w-10"></th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((l, i) => {
              const owner = getUser(l.ownerId);
              const st = getStatus(l.primaryStatus);
              const isSelected = selected.has(l.id);
              return (
                <tr
                  key={l.id}
                  className={cn(
                    "border-b border-bingo-gray-100 last:border-0 hover:bg-bingo-green/[0.04] transition group",
                    isSelected && "bg-bingo-green/[0.07]"
                  )}
                >
                  <td className="px-2 py-2.5">
                    <Checkbox
                      checked={isSelected}
                      onChange={() => toggleSelect(l.id)}
                      ariaLabel={`בחר ${l.fullName}`}
                    />
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    <div className="flex items-center justify-center gap-1 text-[11px] font-mono font-bold text-bingo-gray-500 tabular-nums">
                      {l.locked && <Lock className="size-3 text-bingo-gray-400" />}
                      {i + 1}
                    </div>
                  </td>
                  <td className="px-3 py-2.5">
                    <Link href={`/leads/${l.id}`} className="font-bold text-bingo-black hover:text-bingo-green-dark hover:underline underline-offset-2">
                      {l.fullName}
                    </Link>
                  </td>
                  <td className="px-3 py-2.5 font-mono text-[11px] tabular-nums text-bingo-gray-600">{l.idNumber || "—"}</td>
                  <td className="px-3 py-2.5">
                    <SourcesCell sources={l.sources} text={l.sourcesText} />
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <Avatar size="sm" name={owner?.name || ""} emoji={owner?.emoji} />
                      <span className="text-[12px] font-bold text-bingo-charcoal hidden lg:block">{owner?.name}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2.5">
                    {st ? <StatusBadge status={st} size="sm" /> : null}
                  </td>
                  <td className="px-3 py-2.5 text-[11px] font-mono tabular-nums text-bingo-gray-600 whitespace-nowrap">{formatDate(l.intakeDate)}</td>
                  <td className="px-2 py-2.5">
                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition justify-end">
                      {l.phone && (
                        <a href={`tel:${l.phone}`} className="size-7 rounded-md inline-flex items-center justify-center hover:bg-bingo-gray-100 text-bingo-gray-500 hover:text-bingo-black" title="חיוג">
                          <Phone className="size-3.5" />
                        </a>
                      )}
                      {l.phone && (
                        <a href={`https://wa.me/${l.phone}`} className="size-7 rounded-md inline-flex items-center justify-center hover:bg-emerald-100 text-bingo-gray-500 hover:text-emerald-700" title="WhatsApp">
                          <MessageCircle className="size-3.5" />
                        </a>
                      )}
                      <button className="size-7 rounded-md inline-flex items-center justify-center hover:bg-bingo-gray-100 text-bingo-gray-500 hover:text-bingo-black" title="עוד">
                        <MoreHorizontal className="size-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {sorted.length === 0 && (
              <tr>
                <td colSpan={9} className="px-6 py-16 text-center text-sm text-bingo-gray-500">
                  אין לידים בתצוגה הזו
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="px-4 py-2.5 border-t border-bingo-gray-150 flex items-center justify-between text-[11px] text-bingo-gray-500">
        <div>סה"כ <span className="font-mono font-bold tabular-nums text-bingo-charcoal">{sorted.length}</span> רשומות</div>
        <button className="font-bold text-bingo-green-dark hover:underline">הצג עוד תוצאות ←</button>
      </div>

      {/* Bulk Actions Floating Bar */}
      {selected.size > 0 && (
        <BulkActionBar
          count={selected.size}
          onClear={() => setSelected(new Set())}
          onCompare={selected.size >= 2 && selected.size <= 4 ? () => setComparing(true) : undefined}
        />
      )}

      {/* Lead Comparison Modal */}
      {comparing && (
        <LeadComparison
          leadIds={Array.from(selected)}
          onClose={() => setComparing(false)}
        />
      )}
    </div>
  );
}

function Checkbox({
  checked,
  indeterminate,
  onChange,
  ariaLabel,
}: {
  checked: boolean;
  indeterminate?: boolean;
  onChange: () => void;
  ariaLabel?: string;
}) {
  const ref = React.useRef<HTMLInputElement>(null);
  React.useEffect(() => {
    if (ref.current) ref.current.indeterminate = !!indeterminate && !checked;
  }, [indeterminate, checked]);
  return (
    <label className="flex items-center justify-center cursor-pointer">
      <input
        ref={ref}
        type="checkbox"
        checked={checked}
        onChange={onChange}
        aria-label={ariaLabel}
        className="size-4 rounded border-bingo-gray-300 text-bingo-green focus:ring-1 focus:ring-bingo-green/40 cursor-pointer accent-bingo-green"
      />
    </label>
  );
}

function BulkActionBar({ count, onClear, onCompare }: { count: number; onClear: () => void; onCompare?: () => void }) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 animate-fade-in">
      <div className="surface-card-elevated flex items-center gap-1 pl-1 pr-3 py-1.5 bingo-shadow-lg">
        <div className="flex items-center gap-2 pr-2 pl-3 border-l border-bingo-gray-150">
          <div className="size-8 rounded-lg bg-bingo-green/15 text-bingo-green-dark inline-flex items-center justify-center">
            <CheckSquare className="size-4" />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-[13px] font-extrabold text-bingo-black tabular-nums">{count} נבחרו</span>
            <span className="text-[10px] text-bingo-gray-500">{onCompare ? "ניתן להשוות" : "בחר פעולה"}</span>
          </div>
        </div>
        {onCompare && <BulkBtn icon={<Trophy className="size-3.5" />} label="השווה" highlight onClick={onCompare} />}
        <BulkBtn icon={<UserPlus className="size-3.5" />} label="הקצה אחראי" />
        <BulkBtn icon={<Tag className="size-3.5" />} label="תייג" />
        <BulkBtn icon={<Users className="size-3.5" />} label="העבר לקבוצה" />
        <BulkBtn icon={<Send className="size-3.5" />} label="שלח WhatsApp" />
        <BulkBtn icon={<Download className="size-3.5" />} label="ייצא CSV" />
        <BulkBtn icon={<Archive className="size-3.5" />} label="ארכוב" />
        <BulkBtn icon={<Trash2 className="size-3.5" />} label="מחק" danger />
        <div className="border-l border-bingo-gray-150 h-7 mx-1" />
        <button
          onClick={onClear}
          className="size-8 rounded-lg hover:bg-bingo-gray-100 inline-flex items-center justify-center text-bingo-gray-500 hover:text-bingo-black transition"
          title="בטל בחירה"
        >
          <X className="size-4" />
        </button>
      </div>
    </div>
  );
}

function BulkBtn({ icon, label, danger, highlight, onClick }: { icon: React.ReactNode; label: string; danger?: boolean; highlight?: boolean; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "h-8 px-2.5 rounded-lg text-[12px] font-bold inline-flex items-center gap-1.5 transition",
        highlight
          ? "bg-bingo-green text-bingo-black hover:bg-bingo-green/80"
          : danger
            ? "text-status-red hover:bg-status-red/10"
            : "text-bingo-charcoal hover:bg-bingo-gray-100"
      )}
    >
      {icon}
      <span className="hidden md:inline">{label}</span>
    </button>
  );
}

function Th({ label, onSort, active }: { label: string; onSort?: () => void; active?: boolean }) {
  return (
    <th className="px-3 py-2.5 text-right">
      <button
        onClick={onSort}
        className={cn("inline-flex items-center gap-1 hover:text-bingo-charcoal", active && "text-bingo-black")}
      >
        <span>{label}</span>
        {onSort && <ArrowUpDown className="size-3 opacity-50" />}
      </button>
    </th>
  );
}

function TabPill({ active, onClick, label, badge }: { active?: boolean; onClick?: () => void; label: string; badge?: number }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "h-7 px-2.5 rounded-md text-[11px] font-bold transition inline-flex items-center gap-1.5",
        active ? "bg-white bingo-shadow-sm text-bingo-black" : "text-bingo-gray-500 hover:text-bingo-black"
      )}
    >
      {label}
      {badge !== undefined && badge > 0 && (
        <span className={cn("text-[9px] font-mono tabular-nums rounded px-1", active ? "bg-bingo-green text-bingo-black" : "bg-bingo-gray-200 text-bingo-gray-600")}>{badge}</span>
      )}
    </button>
  );
}

function SourcesCell({ sources, text }: { sources: string[]; text?: string }) {
  if (!sources || sources.length === 0) return <span className="text-xs text-bingo-gray-400">—</span>;
  return (
    <div className="flex items-center gap-1 max-w-[240px]">
      {sources.slice(0, 2).map((key) => {
        const s = SOURCES.find((x) => x.key === key);
        return (
          <span
            key={key}
            className="inline-flex items-center text-[10px] font-bold rounded-md px-1.5 py-0.5 text-white whitespace-nowrap"
            style={{ background: s?.color || "#6E6D69" }}
          >
            {s?.label || key}
          </span>
        );
      })}
      {text && <span className="text-[10px] text-bingo-gray-500 truncate min-w-0" title={text}>{text}</span>}
    </div>
  );
}
