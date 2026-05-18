"use client";
import * as React from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import type { Deal } from "@/lib/data/performance";
import { LenderMark } from "@/components/icons/ServiceIcons";
import { formatCurrency, formatDate, formatTime, formatNumber, cn } from "@/lib/utils";

const TYPE_LABELS: Record<Deal["loanType"], string> = {
  general: "הלוואה כל מטרה",
  vehicle: "הלוואה כנגד רכב",
  property: "הלוואה כנגד נכס",
  consolidation: "איחוד הלוואות",
};

const STATUS_LABELS: Record<Deal["status"], { label: string; color: string }> = {
  signed: { label: "חתום", color: "text-status-blue bg-status-blue-soft" },
  pending: { label: "ממתין לעמלה", color: "text-status-orange bg-status-orange-soft" },
  paid: { label: "שולם", color: "text-bingo-green-dark bg-bingo-green/15" },
};

export function DealsList({ deals, limit }: { deals: Deal[]; limit?: number }) {
  const [sort, setSort] = React.useState<"date" | "amount" | "commission">("date");
  const sorted = [...deals].sort((a, b) => {
    if (sort === "date") return new Date(b.closedAt).getTime() - new Date(a.closedAt).getTime();
    if (sort === "amount") return b.loanAmount - a.loanAmount;
    return b.commission - a.commission;
  });
  const shown = limit ? sorted.slice(0, limit) : sorted;
  const totalCommission = deals.reduce((s, d) => s + d.commission, 0);

  return (
    <div className="rounded-3xl bg-white border border-bingo-gray-200 bingo-shadow-sm overflow-hidden">
      <div className="px-5 py-3 border-b border-bingo-gray-150 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-extrabold text-bingo-black">העסקאות שלי</h2>
          <p className="text-[11px] text-bingo-gray-500 mt-0.5">
            {formatNumber(deals.length)} עסקאות · עמלות בסך {formatCurrency(totalCommission)}
          </p>
        </div>
        <div className="flex items-center gap-1 bg-bingo-gray-100 rounded-lg p-0.5">
          <SortPill active={sort === "date"} onClick={() => setSort("date")} label="לפי תאריך" />
          <SortPill active={sort === "amount"} onClick={() => setSort("amount")} label="לפי סכום" />
          <SortPill active={sort === "commission"} onClick={() => setSort("commission")} label="לפי עמלה" />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-right text-[10px] font-bold uppercase tracking-wider text-bingo-gray-500 border-b border-bingo-gray-100 bg-bingo-gray-50/40">
              <th className="px-4 py-2.5">לקוח</th>
              <th className="px-4 py-2.5">סוג הלוואה</th>
              <th className="px-4 py-2.5">גוף מימון</th>
              <th className="px-4 py-2.5">סכום הלוואה</th>
              <th className="px-4 py-2.5">שכר טרחה</th>
              <th className="px-4 py-2.5 text-bingo-green-dark">העמלה שלך</th>
              <th className="px-4 py-2.5">סטטוס</th>
              <th className="px-4 py-2.5">תאריך</th>
              <th className="px-4 py-2.5 w-10"></th>
            </tr>
          </thead>
          <tbody>
            {shown.map((d) => {
              const st = STATUS_LABELS[d.status];
              return (
                <tr key={d.id} className="border-b border-bingo-gray-100 last:border-0 hover:bg-bingo-green/[0.03] transition group">
                  <td className="px-4 py-2.5 font-bold text-bingo-black">{d.leadName}</td>
                  <td className="px-4 py-2.5 text-[12px] text-bingo-gray-600">{TYPE_LABELS[d.loanType]}</td>
                  <td className="px-4 py-2.5"><LenderMark code={d.lender} size={26} /></td>
                  <td className="px-4 py-2.5 font-mono tabular-nums text-bingo-charcoal">{formatCurrency(d.loanAmount)}</td>
                  <td className="px-4 py-2.5 font-mono tabular-nums text-bingo-charcoal">{formatCurrency(d.fee)}</td>
                  <td className="px-4 py-2.5 font-mono tabular-nums font-extrabold text-bingo-green-dark">{formatCurrency(d.commission)}</td>
                  <td className="px-4 py-2.5">
                    <span className={cn("text-[10px] font-bold rounded-full px-2 py-0.5", st.color)}>{st.label}</span>
                  </td>
                  <td className="px-4 py-2.5 text-[11px] text-bingo-gray-600 font-mono tabular-nums whitespace-nowrap">
                    {formatDate(d.closedAt)}
                    <span className="opacity-60 mr-1">{formatTime(d.closedAt)}</span>
                  </td>
                  <td className="px-2 py-2.5">
                    <Link href={`/leads/${d.leadId}`} className="size-7 rounded-md inline-flex items-center justify-center text-bingo-gray-400 group-hover:text-bingo-green-dark group-hover:bg-bingo-green/10 transition">
                      <ChevronLeft className="size-3.5" />
                    </Link>
                  </td>
                </tr>
              );
            })}
            {shown.length === 0 && (
              <tr><td colSpan={9} className="px-4 py-12 text-center text-sm text-bingo-gray-500">אין עסקאות בטווח התאריכים</td></tr>
            )}
          </tbody>
        </table>
      </div>
      {limit && deals.length > limit && (
        <div className="px-5 py-2.5 border-t border-bingo-gray-100 text-center">
          <Link href="#" className="text-[12px] font-bold text-bingo-green-dark hover:underline">
            הצג את כל {formatNumber(deals.length)} העסקאות ←
          </Link>
        </div>
      )}
    </div>
  );
}

function SortPill({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button onClick={onClick}
      className={cn(
        "h-7 px-2.5 rounded-md text-[11px] font-bold transition",
        active ? "bg-white bingo-shadow-sm text-bingo-black" : "text-bingo-gray-500 hover:text-bingo-black"
      )}>
      {label}
    </button>
  );
}
