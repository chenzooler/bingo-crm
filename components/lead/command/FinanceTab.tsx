"use client";
/**
 * טאב הכספים — תמונת מצב כספית בשפת מרכז השליטה: אריחי סיכום + טבלת חשבוניות
 * (Catalyst Table + Badge). עריכה מלאה של חשבוניות נשארת בכרטיס v4 (קישור).
 */
import * as React from "react";
import { motion } from "framer-motion";
import { Coins, ExternalLink } from "lucide-react";
import { Badge } from "@/components/catalyst/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/catalyst/table";
import { formatCurrency, relativeTime } from "@/lib/utils";
import { CountUp, useEpEntrance } from "@/components/lead/v4/ep";
import type { CardV4PageProps, InvoiceDTO } from "@/components/lead/v4/types";
import { Panel, PanelTitle } from "./shared";

const STATUS_META: Record<string, { label: string; color: "lime" | "zinc" | "amber" | "red" }> = {
  paid: { label: "שולם", color: "lime" },
  issued: { label: "הופק", color: "amber" },
  draft: { label: "טיוטה", color: "zinc" },
  cancelled: { label: "בוטל", color: "red" },
};

export function FinanceTab({ state, initialInvoices }: CardV4PageProps & { initialInvoices: InvoiceDTO[] }) {
  const { parent, child } = useEpEntrance();
  const invoices = initialInvoices;

  const gross = (inv: InvoiceDTO) => Math.round(inv.amount * (1 + inv.vatRate / 100));
  const active = invoices.filter((i) => i.status !== "cancelled");
  const totalBilled = active.reduce((s, i) => s + gross(i), 0);
  const totalPaid = active.filter((i) => i.status === "paid").reduce((s, i) => s + gross(i), 0);
  const totalOpen = totalBilled - totalPaid;

  return (
    <motion.div variants={parent} initial="hidden" animate="show" className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {([
          ["חויב סה\"כ (כולל מע\"מ)", totalBilled, "var(--cmd-tx)"],
          ["שולם", totalPaid, "var(--cmd-lime)"],
          ["פתוח לגבייה", totalOpen, totalOpen > 0 ? "var(--cmd-amber)" : "var(--cmd-tx)"],
        ] as const).map(([label, value, color]) => (
          <Panel key={label} variants={child}>
            <span className="text-[11px] font-bold" style={{ color: "var(--cmd-tx3)" }}>{label}</span>
            <b className="block text-[26px] font-black tabular-nums mt-1" style={{ color }}>
              <CountUp value={value} format={(n) => formatCurrency(n)} />
            </b>
          </Panel>
        ))}
      </div>

      <Panel variants={child}>
        <PanelTitle
          icon={<Coins className="size-3.5" strokeWidth={1.75} />}
          trailing={
            <a
              href={`/leads/${state.lead.id}?view=v4#p4`}
              className="inline-flex items-center gap-1 text-[11px] font-bold hover:underline"
              style={{ color: "var(--cmd-blue)" }}
            >
              ניהול חשבוניות מלא <ExternalLink className="size-3" />
            </a>
          }
        >
          חשבוניות · {invoices.length}
        </PanelTitle>
        {invoices.length === 0 ? (
          <p className="text-[13px] py-3" style={{ color: "var(--cmd-tx3)" }}>
            עוד לא הופקו חשבוניות בכרטיס הזה
          </p>
        ) : (
          <Table dense className="[--gutter:0.5rem]">
            <TableHead>
              <TableRow>
                <TableHeader>מס&apos;</TableHeader>
                <TableHeader>כותרת</TableHeader>
                <TableHeader>סכום</TableHeader>
                <TableHeader>כולל מע&quot;מ</TableHeader>
                <TableHeader>סטטוס</TableHeader>
                <TableHeader>עודכן</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {invoices.map((inv) => {
                const meta = STATUS_META[inv.status] ?? STATUS_META.draft;
                return (
                  <TableRow key={inv.id}>
                    <TableCell className="tabular-nums">{inv.number}</TableCell>
                    <TableCell className="font-semibold">{inv.title}</TableCell>
                    <TableCell className="tabular-nums">{formatCurrency(inv.amount)}</TableCell>
                    <TableCell className="tabular-nums font-bold">{formatCurrency(gross(inv))}</TableCell>
                    <TableCell><Badge color={meta.color}>{meta.label}</Badge></TableCell>
                    <TableCell className="tabular-nums" style={{ color: "var(--cmd-tx2)" }}>
                      {relativeTime(inv.paidAt ?? inv.issuedAt ?? inv.createdAt)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </Panel>
    </motion.div>
  );
}
