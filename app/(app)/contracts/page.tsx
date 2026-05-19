"use client";
import * as React from "react";
import Link from "next/link";
import { LEADS } from "@/lib/data/leads";
import { Avatar } from "@/components/ui/Avatar";
import { FileSignature, Pen, Send, Clock, CheckCircle2, XCircle, Search, Download, Eye, ChevronLeft } from "lucide-react";
import { cn, formatDate, formatCurrency } from "@/lib/utils";

interface Contract {
  id: string;
  leadId: string;
  leadName: string;
  kind: string;
  amount?: number;
  status: "draft" | "sent" | "viewed" | "signed" | "expired";
  createdAt: string;
  sentAt?: string;
  signedAt?: string;
}

const CONTRACTS: Contract[] = LEADS.slice(0, 15).map((l, i) => {
  const kinds = ["הסכם התקשרות - הלוואה לכל מטרה", "הסכם התקשרות - הלוואה כנגד רכב", "חוזה הלוואה - מימון ישיר", "הסכם שכ\"ט - בינגו", "הסכם התקשרות - הלוואה כנגד נכס"];
  const statuses = ["signed", "signed", "signed", "sent", "viewed", "draft", "expired"] as const;
  const today = Date.now();
  const created = new Date(today - i * 1000 * 60 * 60 * 8);
  const status = statuses[i % statuses.length];
  return {
    id: `c-${l.id}-${i}`,
    leadId: l.id,
    leadName: l.fullName,
    kind: kinds[i % kinds.length],
    amount: 20000 + Math.floor(Math.random() * 80000),
    status,
    createdAt: created.toISOString(),
    sentAt: status !== "draft" ? new Date(created.getTime() + 1000 * 60 * 30).toISOString() : undefined,
    signedAt: status === "signed" ? new Date(created.getTime() + 1000 * 60 * 60 * 5).toISOString() : undefined,
  };
});

const STATUS_META = {
  draft: { label: "טיוטה", icon: <Pen className="size-3.5" />, color: "bg-bingo-gray-100 text-bingo-gray-700 border-bingo-gray-200" },
  sent: { label: "נשלח", icon: <Send className="size-3.5" />, color: "bg-status-blue-soft text-status-blue border-status-blue/30" },
  viewed: { label: "נצפה", icon: <Eye className="size-3.5" />, color: "bg-status-orange-soft text-orange-700 border-status-orange/30" },
  signed: { label: "חתום", icon: <CheckCircle2 className="size-3.5" />, color: "bg-bingo-green/15 text-bingo-green-dark border-bingo-green/40" },
  expired: { label: "פג תוקף", icon: <XCircle className="size-3.5" />, color: "bg-status-red-soft text-status-red border-status-red/30" },
};

export default function ContractsPage() {
  const [filter, setFilter] = React.useState<"all" | Contract["status"]>("all");
  const filtered = CONTRACTS.filter((c) => filter === "all" || c.status === filter);

  const stats = {
    total: CONTRACTS.length,
    signed: CONTRACTS.filter((c) => c.status === "signed").length,
    pending: CONTRACTS.filter((c) => c.status === "sent" || c.status === "viewed").length,
    expired: CONTRACTS.filter((c) => c.status === "expired").length,
  };

  return (
    <div className="max-w-[1400px] space-y-4">
      <div>
        <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-bingo-gray-500 mb-1">
          <FileSignature className="size-3" /> חוזים והסכמים
        </div>
        <h1 className="text-3xl sm:text-[34px] font-black tracking-tight text-bingo-black leading-none">
          חתימה דיגיטלית
          <span className="inline-block size-3 rounded-full bg-bingo-green ml-2 align-middle" />
        </h1>
        <p className="text-sm text-bingo-gray-600 mt-1.5">
          ניהול כל החוזים - שליחה, מעקב, חתימה דיגיטלית מהטלפון
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={<FileSignature className="size-4" />} label="סה״כ חוזים" value={stats.total} accent="blue" />
        <StatCard icon={<CheckCircle2 className="size-4" />} label="חתומים" value={stats.signed} accent="green" />
        <StatCard icon={<Clock className="size-4" />} label="ממתינים" value={stats.pending} accent="orange" />
        <StatCard icon={<XCircle className="size-4" />} label="פג תוקף" value={stats.expired} accent="red" />
      </div>

      <div className="rounded-3xl bg-white border border-bingo-gray-200 bingo-shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-bingo-gray-100 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-1 bg-bingo-gray-100 rounded-xl p-0.5">
            {([
              { v: "all", l: "הכל" },
              { v: "signed", l: "חתום" },
              { v: "sent", l: "נשלח" },
              { v: "viewed", l: "נצפה" },
              { v: "draft", l: "טיוטה" },
              { v: "expired", l: "פג תוקף" },
            ] as { v: typeof filter; l: string }[]).map((opt) => (
              <button
                key={opt.v}
                onClick={() => setFilter(opt.v)}
                className={cn("h-7 px-2.5 rounded-md text-[11px] font-bold transition", filter === opt.v ? "bg-white bingo-shadow-sm text-bingo-black" : "text-bingo-gray-500 hover:text-bingo-black")}
              >
                {opt.l}
              </button>
            ))}
          </div>
          <button className="h-9 px-3 rounded-xl bg-bingo-black text-white text-xs font-bold inline-flex items-center gap-1.5 hover:bg-bingo-charcoal">
            <Pen className="size-3.5" /> חוזה חדש
          </button>
        </div>

        <table className="w-full text-sm">
          <thead className="bg-bingo-gray-50/40">
            <tr className="text-right text-[10px] font-bold uppercase tracking-wider text-bingo-gray-500 border-b border-bingo-gray-100">
              <th className="px-5 py-3">לקוח</th>
              <th className="px-3 py-3">סוג חוזה</th>
              <th className="px-3 py-3">סכום</th>
              <th className="px-3 py-3">סטטוס</th>
              <th className="px-3 py-3">נוצר</th>
              <th className="px-3 py-3">נחתם</th>
              <th className="px-3 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => {
              const meta = STATUS_META[c.status];
              return (
                <tr key={c.id} className="border-b border-bingo-gray-100 last:border-0 hover:bg-bingo-green/[0.03] group">
                  <td className="px-5 py-3">
                    <Link href={`/leads/${c.leadId}`} className="flex items-center gap-2.5 hover:text-bingo-green-dark">
                      <Avatar name={c.leadName} size="sm" />
                      <span className="text-[13px] font-bold text-bingo-black">{c.leadName}</span>
                    </Link>
                  </td>
                  <td className="px-3 py-3 text-[12px] text-bingo-charcoal">{c.kind}</td>
                  <td className="px-3 py-3 text-[12px] font-mono tabular-nums font-bold text-bingo-charcoal">
                    {c.amount ? formatCurrency(c.amount) : "—"}
                  </td>
                  <td className="px-3 py-3">
                    <span className={cn("inline-flex items-center gap-1 text-[10px] font-bold rounded-full border px-2 py-0.5", meta.color)}>
                      {meta.icon}
                      {meta.label}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-[11px] font-mono tabular-nums text-bingo-gray-600 whitespace-nowrap">{formatDate(c.createdAt)}</td>
                  <td className="px-3 py-3 text-[11px] font-mono tabular-nums text-bingo-gray-600 whitespace-nowrap">{c.signedAt ? formatDate(c.signedAt) : "—"}</td>
                  <td className="px-2 py-3">
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition justify-end">
                      <button title="צפיה" className="size-7 rounded-md hover:bg-bingo-gray-100 text-bingo-gray-500 inline-flex items-center justify-center">
                        <Eye className="size-3.5" />
                      </button>
                      <button title="הורדה" className="size-7 rounded-md hover:bg-bingo-gray-100 text-bingo-gray-500 inline-flex items-center justify-center">
                        <Download className="size-3.5" />
                      </button>
                      {c.status !== "signed" && (
                        <button title="שלח מחדש" className="size-7 rounded-md hover:bg-bingo-green/15 text-bingo-gray-500 hover:text-bingo-green-dark inline-flex items-center justify-center">
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

function StatCard({ icon, label, value, accent }: { icon: React.ReactNode; label: string; value: number; accent: "green" | "blue" | "orange" | "red" }) {
  const palette = {
    green: "from-bingo-green/15 to-bingo-green/5 border-bingo-green/40 text-bingo-green-dark",
    blue: "from-status-blue/12 to-status-blue/3 border-status-blue/25 text-status-blue",
    orange: "from-status-orange/12 to-status-orange/3 border-status-orange/25 text-orange-700",
    red: "from-status-red/12 to-status-red/3 border-status-red/25 text-status-red",
  }[accent];
  return (
    <div className={`rounded-2xl bg-gradient-to-bl border p-4 ${palette}`}>
      <div className="size-10 rounded-xl inline-flex items-center justify-center bg-white/60">{icon}</div>
      <div className="text-2xl font-black text-bingo-black tabular-nums mt-2 leading-none">{value}</div>
      <div className="text-[11px] font-bold mt-1">{label}</div>
    </div>
  );
}
