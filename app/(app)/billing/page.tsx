"use client";
import * as React from "react";
import Link from "next/link";
import { LEADS } from "@/lib/data/leads";
import { Avatar } from "@/components/ui/Avatar";
import { Wallet, CreditCard, AlertCircle, CheckCircle2, Clock, Send, Download, Plus, RotateCw } from "lucide-react";
import { cn, formatDate, formatCurrency } from "@/lib/utils";

interface Invoice {
  id: string;
  number: string;
  leadId: string;
  leadName: string;
  amount: number;
  vatAmount: number;
  total: number;
  status: "pending" | "paid" | "overdue" | "cancelled";
  issuedAt: string;
  paidAt?: string;
  dueAt: string;
  method?: "credit-card" | "bank-transfer" | "cash";
}

const today = Date.now();
const D = (offsetDays: number) => new Date(today - offsetDays * 24 * 60 * 60 * 1000).toISOString();

const INVOICES: Invoice[] = LEADS.slice(0, 16).map((l, i) => {
  const amount = 1000 + Math.floor(Math.random() * 4000);
  const vat = Math.round(amount * 0.18);
  const statuses: Invoice["status"][] = ["paid", "paid", "paid", "pending", "overdue", "paid"];
  const status = statuses[i % statuses.length];
  return {
    id: `inv-${l.id}`,
    number: `2026-${String(1000 + i).padStart(4, "0")}`,
    leadId: l.id,
    leadName: l.fullName,
    amount,
    vatAmount: vat,
    total: amount + vat,
    status,
    issuedAt: D(i * 2 + 3),
    paidAt: status === "paid" ? D(i * 2) : undefined,
    dueAt: D(-7 + i * 2),
    method: status === "paid" ? (["credit-card", "bank-transfer", "cash"][i % 3] as Invoice["method"]) : undefined,
  };
});

const STATUS_META = {
  pending: { label: "ממתין", color: "bg-status-yellow-soft text-amber-700 border-status-yellow/40", icon: <Clock className="size-3" /> },
  paid: { label: "שולם", color: "bg-bingo-green/15 text-bingo-green-dark border-bingo-green/40", icon: <CheckCircle2 className="size-3" /> },
  overdue: { label: "באיחור", color: "bg-status-red-soft text-status-red border-status-red/40", icon: <AlertCircle className="size-3" /> },
  cancelled: { label: "בוטל", color: "bg-bingo-gray-100 text-bingo-gray-700 border-bingo-gray-200", icon: null },
};

export default function BillingPage() {
  const [filter, setFilter] = React.useState<"all" | Invoice["status"]>("all");
  const filtered = INVOICES.filter((i) => filter === "all" || i.status === filter);

  const stats = {
    total: INVOICES.reduce((s, i) => s + i.total, 0),
    paid: INVOICES.filter((i) => i.status === "paid").reduce((s, i) => s + i.total, 0),
    pending: INVOICES.filter((i) => i.status === "pending").reduce((s, i) => s + i.total, 0),
    overdue: INVOICES.filter((i) => i.status === "overdue").reduce((s, i) => s + i.total, 0),
  };

  return (
    <div className="max-w-[1400px] space-y-4">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-bingo-gray-500 inline-flex items-center gap-1 mb-1">
            <Wallet className="size-3" /> תשלומים וחשבוניות
          </div>
          <h1 className="text-3xl sm:text-[34px] font-black tracking-tight text-bingo-black leading-none">
            Billing
            <span className="inline-block size-3 rounded-full bg-bingo-green ml-2 align-middle" />
          </h1>
          <p className="text-sm text-bingo-gray-600 mt-1.5">חשבוניות שכ"ט, מעקב גביה, סטטוס תשלומים</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="h-10 px-3 rounded-xl bg-white border border-bingo-gray-200 text-xs font-bold inline-flex items-center gap-1.5 hover:bg-bingo-gray-100">
            <RotateCw className="size-3.5" /> סנכרון GreenInvoice
          </button>
          <button className="h-10 px-4 rounded-xl bg-bingo-black text-white text-sm font-bold inline-flex items-center gap-1.5 hover:bg-bingo-charcoal">
            <Plus className="size-4" /> חשבונית חדשה
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Kpi icon={<Wallet className="size-4" />} label="סה״כ חשבוניות" value={formatCurrency(stats.total)} color="purple" />
        <Kpi icon={<CheckCircle2 className="size-4" />} label="שולם" value={formatCurrency(stats.paid)} color="green" />
        <Kpi icon={<Clock className="size-4" />} label="ממתין לתשלום" value={formatCurrency(stats.pending)} color="orange" />
        <Kpi icon={<AlertCircle className="size-4" />} label="באיחור" value={formatCurrency(stats.overdue)} color="red" highlight />
      </div>

      <div className="rounded-3xl bg-white border border-bingo-gray-200 bingo-shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-bingo-gray-100">
          <div className="flex items-center gap-1 bg-bingo-gray-100 rounded-xl p-0.5 w-fit">
            {[
              { v: "all" as const, l: "הכל", n: INVOICES.length },
              { v: "paid" as const, l: "שולמו", n: INVOICES.filter((i) => i.status === "paid").length },
              { v: "pending" as const, l: "ממתינים", n: INVOICES.filter((i) => i.status === "pending").length },
              { v: "overdue" as const, l: "באיחור", n: INVOICES.filter((i) => i.status === "overdue").length },
            ].map((opt) => (
              <button
                key={opt.v}
                onClick={() => setFilter(opt.v)}
                className={cn("h-7 px-3 rounded-md text-[11px] font-bold transition inline-flex items-center gap-1", filter === opt.v ? "bg-white bingo-shadow-sm text-bingo-black" : "text-bingo-gray-500 hover:text-bingo-black")}
              >
                {opt.l}
                {opt.n !== undefined && <span className="text-[9px] font-mono tabular-nums opacity-60">({opt.n})</span>}
              </button>
            ))}
          </div>
        </div>

        <table className="w-full text-sm">
          <thead className="bg-bingo-gray-50/40">
            <tr className="text-right text-[10px] font-bold uppercase tracking-wider text-bingo-gray-500 border-b border-bingo-gray-100">
              <th className="px-5 py-3">מס׳ חשבונית</th>
              <th className="px-3 py-3">לקוח</th>
              <th className="px-3 py-3">סכום</th>
              <th className="px-3 py-3">מע"מ</th>
              <th className="px-3 py-3">סה"כ</th>
              <th className="px-3 py-3">סטטוס</th>
              <th className="px-3 py-3">תאריך</th>
              <th className="px-3 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((inv) => {
              const sm = STATUS_META[inv.status];
              return (
                <tr key={inv.id} className="border-b border-bingo-gray-100 last:border-0 hover:bg-bingo-green/[0.03] group">
                  <td className="px-5 py-3 font-mono tabular-nums text-[12px] font-bold text-bingo-charcoal">{inv.number}</td>
                  <td className="px-3 py-3">
                    <Link href={`/leads/${inv.leadId}`} className="flex items-center gap-2 hover:text-bingo-green-dark">
                      <Avatar name={inv.leadName} size="sm" />
                      <span className="text-[13px] font-bold text-bingo-black">{inv.leadName}</span>
                    </Link>
                  </td>
                  <td className="px-3 py-3 text-[12px] font-mono tabular-nums text-bingo-charcoal">{formatCurrency(inv.amount)}</td>
                  <td className="px-3 py-3 text-[12px] font-mono tabular-nums text-bingo-gray-600">{formatCurrency(inv.vatAmount)}</td>
                  <td className="px-3 py-3 text-[13px] font-mono tabular-nums font-extrabold text-bingo-black">{formatCurrency(inv.total)}</td>
                  <td className="px-3 py-3">
                    <span className={cn("inline-flex items-center gap-1 text-[10px] font-bold rounded-full border px-2 py-0.5", sm.color)}>
                      {sm.icon}{sm.label}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-[11px] font-mono tabular-nums text-bingo-gray-600 whitespace-nowrap">{formatDate(inv.issuedAt)}</td>
                  <td className="px-2 py-3">
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition justify-end">
                      <button title="הורד" className="size-7 rounded-md hover:bg-bingo-gray-100 text-bingo-gray-500 inline-flex items-center justify-center">
                        <Download className="size-3.5" />
                      </button>
                      {inv.status !== "paid" && (
                        <button title="שלח תזכורת" className="size-7 rounded-md hover:bg-bingo-green/15 text-bingo-gray-500 hover:text-bingo-green-dark inline-flex items-center justify-center">
                          <Send className="size-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Kpi({ icon, label, value, color, highlight }: { icon: React.ReactNode; label: string; value: string; color: "green" | "orange" | "red" | "purple"; highlight?: boolean }) {
  const palette = {
    green: "from-bingo-green/15 to-bingo-green/5 border-bingo-green/40 text-bingo-green-dark",
    orange: "from-status-orange/12 to-status-orange/3 border-status-orange/25 text-orange-700",
    red: "from-status-red/12 to-status-red/3 border-status-red/25 text-status-red",
    purple: "from-status-purple/12 to-status-purple/3 border-status-purple/25 text-status-purple",
  }[color];
  return (
    <div className={cn(`rounded-2xl bg-gradient-to-bl border p-4 ${palette}`, highlight && "bingo-glow-soft")}>
      <div className="size-9 rounded-xl inline-flex items-center justify-center bg-white/60">{icon}</div>
      <div className="text-2xl font-black text-bingo-black tabular-nums leading-none mt-2">{value}</div>
      <div className="text-[11px] font-bold mt-1">{label}</div>
    </div>
  );
}
