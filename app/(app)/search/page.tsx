"use client";
import * as React from "react";
import Link from "next/link";
import { LEADS } from "@/lib/data/leads";
import { getUser, getStatus, SOURCES } from "@/lib/data/static";
import { Avatar } from "@/components/ui/Avatar";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Search, Filter, X, Calendar, DollarSign, Tag, Users, ChevronLeft } from "lucide-react";
import { cn, formatDate, formatCurrency } from "@/lib/utils";

export default function SearchPage() {
  const [query, setQuery] = React.useState("");
  const [amountMin, setAmountMin] = React.useState<number | "">("");
  const [amountMax, setAmountMax] = React.useState<number | "">("");
  const [source, setSource] = React.useState("");
  const [owner, setOwner] = React.useState("");

  const results = LEADS.filter((l) => {
    if (query && !(`${l.fullName} ${l.idNumber} ${l.phone}`.includes(query))) return false;
    if (amountMin && (!l.amountRequested || l.amountRequested < +amountMin)) return false;
    if (amountMax && (!l.amountRequested || l.amountRequested > +amountMax)) return false;
    if (source && !l.sources.includes(source as any)) return false;
    if (owner && l.ownerId !== +owner) return false;
    return true;
  });

  const clearAll = () => { setQuery(""); setAmountMin(""); setAmountMax(""); setSource(""); setOwner(""); };

  return (
    <div className="max-w-[1400px] space-y-4">
      <div>
        <div className="text-[11px] font-bold uppercase tracking-wider text-bingo-gray-500 inline-flex items-center gap-1 mb-1">
          <Search className="size-3" /> חיפוש מתקדם
        </div>
        <h1 className="text-3xl sm:text-[34px] font-black tracking-tight text-bingo-black leading-none">
          חיפוש בכל המערכת
          <span className="inline-block size-3 rounded-full bg-bingo-green ml-2 align-middle" />
        </h1>
      </div>

      <div className="rounded-3xl bg-white border border-bingo-gray-200 bingo-shadow-sm p-5">
        <div className="relative mb-4">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 size-5 text-bingo-gray-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="חפש לפי שם, ת.ז, טלפון, מייל..."
            className="w-full h-14 rounded-2xl border-2 border-bingo-gray-200 bg-white pr-12 pl-4 text-base font-bold hover:border-bingo-gray-300 focus:border-bingo-green focus:outline-none focus:ring-4 focus:ring-bingo-green/15"
          />
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <FilterField icon={<DollarSign className="size-3" />} label="סכום מינימום">
            <input type="number" value={amountMin} onChange={(e) => setAmountMin(e.target.value === "" ? "" : +e.target.value)} className="filter-input" placeholder="0" />
          </FilterField>
          <FilterField icon={<DollarSign className="size-3" />} label="סכום מקסימום">
            <input type="number" value={amountMax} onChange={(e) => setAmountMax(e.target.value === "" ? "" : +e.target.value)} className="filter-input" placeholder="1000000" />
          </FilterField>
          <FilterField icon={<Tag className="size-3" />} label="מקור">
            <select value={source} onChange={(e) => setSource(e.target.value)} className="filter-input">
              <option value="">כל המקורות</option>
              {SOURCES.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
            </select>
          </FilterField>
          <FilterField icon={<Users className="size-3" />} label="אחראי">
            <select value={owner} onChange={(e) => setOwner(e.target.value)} className="filter-input">
              <option value="">כל הצוות</option>
              <option value="12394">חן צולר</option>
              <option value="13986">יוני קיטל</option>
              <option value="12533">עמנואל פרגן</option>
            </select>
          </FilterField>
        </div>

        <div className="flex items-center justify-between gap-3 mt-4 pt-4 border-t border-bingo-gray-100">
          <div className="text-[13px] text-bingo-charcoal">
            <strong className="text-bingo-green-dark">{results.length}</strong> תוצאות
          </div>
          <button onClick={clearAll} className="h-9 px-3 rounded-xl bg-bingo-gray-100 hover:bg-bingo-gray-200 text-bingo-charcoal text-xs font-bold inline-flex items-center gap-1.5">
            <X className="size-3.5" /> נקה הכל
          </button>
        </div>
      </div>

      <div className="rounded-3xl bg-white border border-bingo-gray-200 bingo-shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-bingo-gray-50/40">
            <tr className="text-right text-[10px] font-bold uppercase tracking-wider text-bingo-gray-500 border-b border-bingo-gray-100">
              <th className="px-5 py-3">לקוח</th>
              <th className="px-3 py-3">ת.ז.</th>
              <th className="px-3 py-3">סכום</th>
              <th className="px-3 py-3">אחראי</th>
              <th className="px-3 py-3">סטטוס</th>
              <th className="px-3 py-3">תאריך</th>
            </tr>
          </thead>
          <tbody>
            {results.slice(0, 20).map((l) => {
              const u = getUser(l.ownerId);
              const st = getStatus(l.primaryStatus);
              return (
                <tr key={l.id} className="border-b border-bingo-gray-100 last:border-0 hover:bg-bingo-green/[0.03] group">
                  <td className="px-5 py-3">
                    <Link href={`/leads/${l.id}`} className="flex items-center gap-2.5 hover:text-bingo-green-dark">
                      <Avatar name={l.fullName} size="sm" />
                      <span className="text-[13px] font-bold text-bingo-black">{l.fullName}</span>
                    </Link>
                  </td>
                  <td className="px-3 py-3 text-[11px] font-mono tabular-nums text-bingo-gray-600">{l.idNumber || "—"}</td>
                  <td className="px-3 py-3 text-[12px] font-mono tabular-nums font-bold text-bingo-charcoal">{l.amountRequested ? formatCurrency(l.amountRequested) : "—"}</td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-1.5">
                      <Avatar name={u?.name || ""} emoji={u?.emoji} size="sm" />
                      <span className="text-[11px] font-bold text-bingo-charcoal hidden lg:block">{u?.name}</span>
                    </div>
                  </td>
                  <td className="px-3 py-3">{st && <StatusBadge status={st} size="sm" />}</td>
                  <td className="px-3 py-3 text-[11px] font-mono tabular-nums text-bingo-gray-600">{formatDate(l.intakeDate)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <style jsx>{`
        :global(.filter-input) {
          width: 100%;
          height: 2.5rem;
          border-radius: 0.75rem;
          border: 1px solid #DCDBD7;
          background: white;
          padding: 0 0.75rem;
          font-size: 0.8125rem;
          font-weight: 600;
          color: #1F1E1D;
        }
        :global(.filter-input:focus) {
          border-color: #50FF0A;
          outline: none;
          box-shadow: 0 0 0 3px rgba(80,255,10,0.15);
        }
      `}</style>
    </div>
  );
}

function FilterField({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[10px] font-bold uppercase tracking-wider text-bingo-gray-500 mb-1 inline-flex items-center gap-1">{icon}{label}</div>
      {children}
    </div>
  );
}
