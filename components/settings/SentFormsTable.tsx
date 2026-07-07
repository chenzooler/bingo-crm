"use client";
/**
 * טבלת הטפסים שנשלחו/נחתמו (SentForm) — מסך /settings/forms.
 * "סמן כנחתם" → PATCH /api/forms (+Activity על הליד).
 */
import * as React from "react";
import Link from "next/link";
import { FileText, PenLine } from "lucide-react";
import { cn, formatDate, formatTime } from "@/lib/utils";

export interface SentFormListRow {
  id: number;
  templateName: string;
  status: string; // sent | signed
  sentAt: string;
  signedAt: string | null;
  lead: { id: number; fullName: string };
}

function StatusChip({ status }: { status: string }) {
  return status === "signed" ? (
    <span className="b-chip b-chip-green text-[11px]">נחתם</span>
  ) : (
    <span className="b-chip b-chip-blue text-[11px]">נשלח</span>
  );
}

export default function SentFormsTable({ initial }: { initial: SentFormListRow[] }) {
  const [rows, setRows] = React.useState(initial);
  const sent = rows.filter((r) => r.status === "sent").length;
  const signed = rows.filter((r) => r.status === "signed").length;

  const markSigned = async (id: number) => {
    setRows((r) => r.map((x) => (x.id === id ? { ...x, status: "signed", signedAt: new Date().toISOString() } : x)));
    const res = await fetch("/api/forms", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: "signed" }),
    });
    if (res.ok) {
      const row = await res.json();
      setRows((r) => r.map((x) => (x.id === id ? { ...x, ...row } : x)));
    }
  };

  return (
    <div className="b-card p-5">
      <div className="flex items-center gap-2.5 mb-3 flex-wrap">
        <span className="b-icon b-icon-blue !size-8"><FileText className="size-4" /></span>
        <h3 className="text-[15px] font-extrabold text-bingo-black">טפסים שנשלחו</h3>
        <span className="b-chip b-chip-gray tabular-nums text-[11px]">{rows.length} סה״כ</span>
        <span className="b-chip b-chip-blue tabular-nums text-[11px]">{sent} נשלחו</span>
        <span className="b-chip b-chip-green tabular-nums text-[11px]">{signed} נחתמו</span>
      </div>

      {rows.length === 0 ? (
        <p className="py-8 text-center text-[12.5px] text-bingo-gray-400">
          עדיין לא נשלחו טפסים — שולחים מסקשן &quot;טפסים וקבצים&quot; בכרטיס הלקוח.
        </p>
      ) : (
        <div className="rounded-2xl border border-bingo-gray-150 overflow-x-auto">
          <table className="w-full text-[12.5px] min-w-[640px]">
            <thead className="bg-bingo-gray-50 text-bingo-gray-500">
              <tr>
                <th className="text-right px-3 py-2 font-semibold">לקוח</th>
                <th className="text-right px-3 py-2 font-semibold">טופס</th>
                <th className="text-right px-3 py-2 font-semibold">סטטוס</th>
                <th className="text-right px-3 py-2 font-semibold">נשלח</th>
                <th className="text-right px-3 py-2 font-semibold">נחתם</th>
                <th className="px-3 py-2" />
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-bingo-gray-100">
                  <td className="px-3 py-2">
                    <Link href={`/leads/${r.lead.id}`} className="font-bold text-bingo-black hover:text-bingo-blue hover:underline">
                      {r.lead.fullName}
                    </Link>
                  </td>
                  <td className="px-3 py-2 text-bingo-gray-600">{r.templateName}</td>
                  <td className="px-3 py-2"><StatusChip status={r.status} /></td>
                  <td className="px-3 py-2 tabular-nums text-bingo-gray-500">
                    {formatDate(r.sentAt)} · {formatTime(r.sentAt)}
                  </td>
                  <td className="px-3 py-2 tabular-nums text-bingo-gray-500">
                    {r.signedAt ? `${formatDate(r.signedAt)} · ${formatTime(r.signedAt)}` : "—"}
                  </td>
                  <td className="px-3 py-2 text-left">
                    {r.status === "sent" && (
                      <button
                        type="button"
                        onClick={() => void markSigned(r.id)}
                        className={cn("b-pill b-pill-ghost b-pill-sm whitespace-nowrap")}
                      >
                        <PenLine className="size-3.5" /> סמן כנחתם
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
