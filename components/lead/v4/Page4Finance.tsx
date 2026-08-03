"use client";
/**
 * עמוד 4 — כספים. טבלת חשבוניות (מסמכים פנימיים ממוספרים) + הקשר שכר הטרחה.
 * הדפסה: מודאל הדפסה נקי (24px) עם window.print — בלי route נפרד.
 */
import * as React from "react";
import { Plus, Printer, Receipt, X } from "lucide-react";
import Image from "next/image";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import type { CardV4PageProps, InvoiceDTO } from "./types";

const STATUS_HE: Record<string, string> = {
  draft: "טיוטה",
  issued: "הונפקה",
  paid: "שולמה",
  cancelled: "בוטלה",
};

function totalOf(inv: InvoiceDTO): number {
  return inv.amount * (1 + inv.vatRate / 100);
}

function StatusChip({ status }: { status: string }) {
  return (
    <span className={cn(
      "rounded-full px-3 py-1 text-[11.5px] font-bold inline-block",
      status === "draft" && "bg-bingo-gray-100 text-bingo-gray-600",
      status === "issued" && "bg-bingo-black text-white",
      status === "paid" && "bg-[#DAFFCB] text-bingo-black",
      status === "cancelled" && "bg-bingo-gray-100 text-bingo-gray-400 line-through",
    )}>
      {STATUS_HE[status] ?? status}
    </span>
  );
}

export function Page4Finance({ state, initialInvoices }: CardV4PageProps & {
  initialInvoices: InvoiceDTO[];
}) {
  const leadId = state.lead.id;
  const [invoices, setInvoices] = React.useState<InvoiceDTO[]>(initialInvoices);
  const [formOpen, setFormOpen] = React.useState(false);
  const [title, setTitle] = React.useState("שכר טרחה - תיווך אשראי");
  const [amount, setAmount] = React.useState("");
  const [vatRate, setVatRate] = React.useState("18");
  const [notes, setNotes] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [busyId, setBusyId] = React.useState<number | null>(null);
  const [printInv, setPrintInv] = React.useState<InvoiceDTO | null>(null);

  const agreedFee = (() => {
    const raw = String(state.values.calcPaymentWithVat ?? state.values.feeAmount ?? "").replace(/\D/g, "");
    return raw ? Number(raw) : null;
  })();

  const create = async () => {
    const amt = Number(String(amount).replace(/[^\d.]/g, ""));
    if (!amt || saving) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/leads/${leadId}/invoices`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, amount: amt, vatRate: Number(vatRate) || 18, notes: notes || null }),
      });
      const data = await res.json();
      if (res.ok) {
        setInvoices((arr) => [data, ...arr]);
        setFormOpen(false);
        setAmount(""); setNotes("");
      } else {
        setError(data.error ?? "שמירת החשבונית נכשלה");
      }
    } catch {
      setError("שמירת החשבונית נכשלה");
    } finally {
      setSaving(false);
    }
  };

  const transition = async (inv: InvoiceDTO, status: "issued" | "paid" | "cancelled") => {
    if (busyId) return;
    setBusyId(inv.id);
    setError(null);
    try {
      const res = await fetch(`/api/invoices/${inv.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (res.ok) setInvoices((arr) => arr.map((i) => (i.id === inv.id ? data : i)));
      else setError(data.error ?? "עדכון הסטטוס נכשל");
    } catch {
      setError("עדכון הסטטוס נכשל");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-3">
      {/* הקשר שכר הטרחה מהכרטיס */}
      <div className="b-card px-6 py-4 flex items-center gap-4 flex-wrap">
        <span className="text-[13px] text-bingo-gray-600">שכר טרחה שסוכם</span>
        <b className="text-[17px] text-bingo-black tabular-nums">
          {agreedFee ? formatCurrency(agreedFee) : "טרם סוכם"}
        </b>
        <span className="flex-1" />
        {/* הפעולה הראשית של העמוד — אקסנט ליים יחיד */}
        <button type="button" onClick={() => setFormOpen((v) => !v)}
          className="b-pill b-pill-green b-pill-sm min-h-11">
          <Plus className="size-4" strokeWidth={1.75} /> חשבונית חדשה
        </button>
      </div>

      {/* טופס יצירה */}
      {formOpen && (
        <div className="b-card p-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_140px_100px] gap-2">
            <input className="b-input h-11 text-[13px]" placeholder="כותרת" aria-label="כותרת"
              value={title} onChange={(e) => setTitle(e.target.value)} />
            <input className="b-input h-11 text-[13px] tabular-nums" inputMode="decimal"
              placeholder="סכום לפני מעמ" aria-label="סכום לפני מעמ"
              value={amount} onChange={(e) => setAmount(e.target.value)} />
            <input className="b-input h-11 text-[13px] tabular-nums" inputMode="decimal"
              placeholder="מעמ %" aria-label="שיעור מעמ"
              value={vatRate} onChange={(e) => setVatRate(e.target.value)} />
          </div>
          <input className="b-input h-11 text-[13px] w-full" placeholder="הערות (אופציונלי)"
            value={notes} onChange={(e) => setNotes(e.target.value)} />
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => void create()}
              disabled={saving || !Number(String(amount).replace(/[^\d.]/g, ""))}
              className="b-pill b-pill-dark b-pill-sm min-h-11 disabled:opacity-50">
              {saving ? "שומר..." : "צור טיוטה"}
            </button>
            <button type="button" onClick={() => setFormOpen(false)}
              className="b-pill b-pill-ghost b-pill-sm min-h-11">ביטול</button>
            {error && <span className="text-[12.5px] text-[#FF4A2E]">{error}</span>}
          </div>
        </div>
      )}
      {!formOpen && error && (
        <p className="text-[12.5px] text-[#FF4A2E] px-2">{error}</p>
      )}

      {/* טבלת החשבוניות */}
      {invoices.length === 0 ? (
        <div className="b-card px-6 py-10 flex flex-col items-center gap-3 text-center">
          <span className="size-11 rounded-full bg-bingo-gray-100 flex items-center justify-center">
            <Receipt className="size-5 text-bingo-gray-500" strokeWidth={1.75} />
          </span>
          <p className="text-[14px] font-bold text-bingo-black">עוד אין חשבוניות ללקוח</p>
          <p className="text-[12.5px] text-bingo-gray-500">צור חשבונית חדשה כשנסגר שכר הטרחה</p>
        </div>
      ) : (
        <div className="b-card overflow-x-auto">
          <table className="w-full text-[13px] min-w-[640px]">
            <thead className="text-bingo-gray-500 bg-bingo-gray-50">
              <tr>
                <th className="text-right px-4 py-3 font-semibold">מס&apos;</th>
                <th className="text-right px-4 py-3 font-semibold">כותרת</th>
                <th className="text-right px-4 py-3 font-semibold">סכום</th>
                <th className="text-right px-4 py-3 font-semibold">מע&quot;מ</th>
                <th className="text-right px-4 py-3 font-semibold">סה&quot;כ</th>
                <th className="text-right px-4 py-3 font-semibold">סטטוס</th>
                <th className="text-right px-4 py-3 font-semibold">הונפקה</th>
                <th className="text-right px-4 py-3 font-semibold">פעולות</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv.id} className="border-t border-bingo-gray-100">
                  <td className="px-4 py-3 tabular-nums font-bold text-bingo-black">
                    #{String(inv.number).padStart(4, "0")}
                  </td>
                  <td className="px-4 py-3 text-bingo-black">{inv.title}</td>
                  <td className="px-4 py-3 tabular-nums">{formatCurrency(inv.amount)}</td>
                  <td className="px-4 py-3 tabular-nums">{inv.vatRate}%</td>
                  <td className="px-4 py-3 tabular-nums font-bold text-bingo-black">
                    {formatCurrency(totalOf(inv))}
                  </td>
                  <td className="px-4 py-3"><StatusChip status={inv.status} /></td>
                  <td className="px-4 py-3 tabular-nums text-bingo-gray-500">
                    {inv.issuedAt ? formatDate(inv.issuedAt) : "-"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {inv.status === "draft" && (
                        <button type="button" disabled={busyId === inv.id}
                          onClick={() => void transition(inv, "issued")}
                          className="b-pill b-pill-dark b-pill-sm disabled:opacity-50">הנפק</button>
                      )}
                      {inv.status === "issued" && (
                        <>
                          <button type="button" disabled={busyId === inv.id}
                            onClick={() => void transition(inv, "paid")}
                            className="b-pill b-pill-ghost b-pill-sm disabled:opacity-50">סמן שולם</button>
                          <button type="button" disabled={busyId === inv.id}
                            onClick={() => void transition(inv, "cancelled")}
                            className="b-pill b-pill-ghost b-pill-sm disabled:opacity-50">בטל</button>
                        </>
                      )}
                      <button type="button" onClick={() => setPrintInv(inv)}
                        className="b-pill b-pill-ghost b-pill-sm" aria-label={`הדפס חשבונית ${inv.number}`}>
                        <Printer className="size-3.5" strokeWidth={1.75} /> הדפס
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ---------- מודאל הדפסה ---------- */}
      {printInv && (
        <PrintModal invoice={printInv} clientName={state.lead.fullName}
          clientId={String(state.values.idNumber ?? "")} onClose={() => setPrintInv(null)} />
      )}
    </div>
  );
}

function PrintModal({ invoice, clientName, clientId, onClose }: {
  invoice: InvoiceDTO;
  clientName: string;
  clientId: string;
  onClose: () => void;
}) {
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const vat = invoice.amount * (invoice.vatRate / 100);
  const total = invoice.amount + vat;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 cardv4-print-overlay"
      style={{ background: "rgba(41,41,41,.45)" }} onClick={onClose}>
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          .cardv4-print-area, .cardv4-print-area * { visibility: visible !important; }
          .cardv4-print-overlay { position: static !important; background: none !important; padding: 0 !important; }
          .cardv4-print-area { position: absolute; inset: 0; box-shadow: none !important; border-radius: 0 !important; }
          .cardv4-no-print { display: none !important; }
        }
      `}</style>
      <div dir="rtl" onClick={(e) => e.stopPropagation()}
        className="cardv4-print-area bg-white rounded-[24px] w-full max-w-xl p-8"
        style={{ boxShadow: "0 16px 48px rgba(0,0,0,.16)" }}>
        <div className="flex items-start justify-between mb-6">
          <div>
            <Image src="/brand/logo.svg" alt="בינגו" width={110} height={36} className="mb-2" />
            <p className="text-[13px] font-bold text-bingo-black">ש.ח.ה קרנות בע&quot;מ</p>
            <p className="text-[11.5px] text-bingo-gray-500">מסמך פנימי - אינו חשבונית מס</p>
          </div>
          <div className="text-left">
            <p className="text-[18px] font-bold text-bingo-black tabular-nums">
              מסמך #{String(invoice.number).padStart(4, "0")}
            </p>
            <p className="text-[12.5px] text-bingo-gray-500 tabular-nums">
              {formatDate(invoice.issuedAt ?? invoice.createdAt)}
            </p>
          </div>
        </div>

        <div className="rounded-[20px] border border-[#E6E8E4] p-4 mb-4 text-[13px]">
          <p><span className="text-bingo-gray-500">לכבוד:</span> <b>{clientName}</b></p>
          {clientId && <p className="tabular-nums"><span className="text-bingo-gray-500">ת&quot;ז:</span> {clientId}</p>}
        </div>

        <table className="w-full text-[13px] mb-4">
          <thead className="text-bingo-gray-500">
            <tr className="border-b border-[#E6E8E4]">
              <th className="text-right py-2 font-semibold">פירוט</th>
              <th className="text-left py-2 font-semibold">סכום</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-bingo-gray-100">
              <td className="py-2.5">{invoice.title}{invoice.notes ? ` - ${invoice.notes}` : ""}</td>
              <td className="py-2.5 text-left tabular-nums">{formatCurrency(invoice.amount)}</td>
            </tr>
            <tr className="border-b border-bingo-gray-100">
              <td className="py-2.5 text-bingo-gray-500">מע&quot;מ {invoice.vatRate}%</td>
              <td className="py-2.5 text-left tabular-nums">{formatCurrency(vat)}</td>
            </tr>
            <tr>
              <td className="py-3 font-bold text-bingo-black">סה&quot;כ לתשלום</td>
              <td className="py-3 text-left tabular-nums font-bold text-bingo-black text-[16px]">
                {formatCurrency(total)}
              </td>
            </tr>
          </tbody>
        </table>

        <div className="cardv4-no-print flex items-center gap-2 justify-end">
          <button type="button" onClick={onClose} className="b-pill b-pill-ghost b-pill-sm min-h-11">
            <X className="size-4" strokeWidth={1.75} /> סגור
          </button>
          <button type="button" onClick={() => window.print()} className="b-pill b-pill-dark b-pill-sm min-h-11">
            <Printer className="size-4" strokeWidth={1.75} /> הדפס
          </button>
        </div>
      </div>
    </div>
  );
}
