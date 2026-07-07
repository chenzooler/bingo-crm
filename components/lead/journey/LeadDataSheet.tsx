"use client";
/**
 * LeadDataSheet — "תיק לקוח": every dry fact about the customer in one
 * slide-over, grouped, copyable, always one click away during a call.
 */
import * as React from "react";
import { X, Copy, Check, Pencil } from "lucide-react";
import type { SectionId } from "@/lib/journey";
import { vehicleReasonLabel, worstIndicator } from "@/lib/journey";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import { useJourney, smileyLabel } from "./useJourney";

function money(v?: string): string | null {
  if (!v) return null;
  const n = Number(String(v).replace(/\D/g, ""));
  return n ? formatCurrency(n) : null;
}

interface Row { label: string; value: string | null | undefined; copy?: boolean; ltr?: boolean }
interface Group { title: string; section?: SectionId; rows: Row[] }

export function LeadDataSheet() {
  const { overlay, setOverlay, lead, j, goto } = useJourney();
  const [copied, setCopied] = React.useState<string | null>(null);
  const open = overlay === "datasheet";

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOverlay(null); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, setOverlay]);

  if (!open) return null;

  const indicator = worstIndicator(j);
  const groups: Group[] = [
    {
      title: "זהות",
      section: "bdi",
      rows: [
        { label: "שם מלא", value: lead.fullName },
        { label: "טלפון", value: lead.phone, copy: true, ltr: true },
        { label: "תעודת זהות", value: j.idNumber || lead.idNumber, copy: true, ltr: true },
        { label: "אימייל", value: lead.email, copy: true, ltr: true },
        { label: "עיר", value: lead.city },
        { label: "תאריך לידה", value: j.birthDate ? formatDate(j.birthDate) : null },
        { label: "מין", value: j.gender },
        { label: "שם ב-BDI", value: [j.smileyFirstName, j.smileyLastName].filter(Boolean).join(" ") || null },
      ],
    },
    {
      title: "הבקשה",
      section: "opening",
      rows: [
        { label: "סכום מבוקש", value: money(j.amountRequested) },
        { label: "מטרה", value: j.loanPurpose },
        { label: "מסלול", value: j.comboVehicle ? "כל מטרה + רכב" : undefined },
        { label: "סיבת מסלול רכב", value: vehicleReasonLabel(j) },
      ],
    },
    {
      title: "אשראי וסינון",
      section: "credit",
      rows: [
        { label: "כרטיסי אשראי", value: j.creditCards.join(", ") || null },
        { label: "מסגרת", value: j.cardLimit },
        { label: "בדק קודם ב-", value: j.checkedBefore.join(", ") || null },
        { label: "רמזור אוטומטי", value: j.smileyAuto ? smileyLabel(j.smileyAuto) : null },
        { label: "רמזור ידני", value: j.smileyManual ? smileyLabel(j.smileyManual) : null },
        { label: "חיווי משוקלל", value: indicator ? smileyLabel(indicator) : null },
        { label: "הערות אשראי", value: j.creditNotes },
      ],
    },
    {
      title: "משפחה",
      section: "personal",
      rows: [
        { label: "מצב משפחתי", value: j.maritalStatus },
        { label: "ילדים מתחת ל-18", value: j.children },
        { label: "הנפקת ת.ז", value: j.idIssueDate ? formatDate(j.idIssueDate) : null },
      ],
    },
    {
      title: "תעסוקה והכנסות",
      section: "income",
      rows: [
        { label: "תעסוקה", value: j.employment },
        { label: "מקום עבודה", value: j.employerAndRole },
        { label: "ותק (שנים)", value: j.seniorityYears },
        { label: "הכנסה חודשית", value: money(j.monthlyIncome) },
        { label: "הכנסת בן/בת זוג", value: money(j.spouseIncome) },
        { label: "הכנסות נוספות", value: j.additionalIncome },
        { label: "פנסיה/השתלמות", value: j.hasPension === "yes" ? `יש${j.pensionCompany ? ` · ${j.pensionCompany}` : ""}${j.pensionAmount ? ` · ${money(j.pensionAmount)}` : ""}` : j.hasPension === "no" ? "אין" : null },
      ],
    },
    {
      title: "נכסים ורכב",
      section: "assets",
      rows: [
        { label: "מגורים", value: j.hasProperty },
        { label: "רכב", value: j.hasVehicle === "yes" ? `יש${j.vehicleMake ? ` · ${j.vehicleMake}` : ""}${j.vehicleYear ? ` · ${j.vehicleYear}` : ""}` : j.hasVehicle === "no" ? "אין" : null },
        { label: "שעבוד", value: j.vehicleFree === "yes" ? "נקי משעבוד" : j.vehicleFree === "no" ? "משועבד" : null },
      ],
    },
    {
      title: "בנק",
      section: "bank",
      rows: [
        { label: "בנק", value: j.bankName },
        { label: "סניף", value: j.bankBranch, ltr: true },
        { label: "חשבון", value: j.bankAccount, copy: true, ltr: true },
      ],
    },
    {
      title: "עסקה",
      section: "results",
      rows: [
        { label: "אישור סופי", value: j.finalApproval?.amount ? `${formatCurrency(j.finalApproval.amount)} · ${j.finalApproval.rate}% · ${j.finalApproval.months} חוד'` : null },
        { label: "גוף נבחר", value: j.chosenLender },
        { label: "שכר טרחה", value: money(j.feeAmount) },
        { label: "שולם", value: j.paidAt ? formatDate(j.paidAt) : null },
      ],
    },
    {
      title: "מקור וניהול",
      rows: [
        { label: "מקור", value: lead.source },
        { label: "ספק ליד", value: lead.providerName },
        { label: "נציג מטפל", value: lead.ownerName },
        { label: "נכנס למערכת", value: lead.intakeDate ? formatDate(lead.intakeDate) : null },
        { label: "מזהה Yoatsim", value: lead.externalId, copy: true, ltr: true },
      ],
    },
  ];

  function copyValue(key: string, value: string) {
    void navigator.clipboard.writeText(value).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(null), 1500);
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-start bg-bingo-black/40" onClick={() => setOverlay(null)}>
      <aside
        className="h-full w-full max-w-md bg-white shadow-2xl overflow-y-auto animate-slide-in-right"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-bingo-gray-100 px-5 py-4 flex items-center gap-3 z-10">
          <div className="flex-1">
            <h2 className="text-[17px] font-bold text-bingo-black">תיק לקוח — {lead.fullName}</h2>
            <p className="text-[11.5px] text-bingo-gray-500">כל הנתונים היבשים במקום אחד</p>
          </div>
          <button onClick={() => setOverlay(null)} className="size-9 rounded-full bg-bingo-gray-100 hover:bg-bingo-gray-150 flex items-center justify-center" aria-label="סגור">
            <X className="size-4" />
          </button>
        </header>

        <div className="p-5 space-y-5">
          {groups.map((g) => {
            const filled = g.rows.filter((r) => r.value);
            return (
              <section key={g.title}>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="b-eyebrow">{g.title}</h3>
                  <div className="flex-1 h-px bg-bingo-gray-100" />
                  {g.section && (
                    <button
                      onClick={() => { goto(g.section!); setOverlay(null); }}
                      className="text-[10.5px] font-semibold text-bingo-gray-400 hover:text-bingo-black inline-flex items-center gap-0.5"
                    >
                      <Pencil className="size-2.5" /> ערוך
                    </button>
                  )}
                </div>
                {filled.length === 0 ? (
                  <p className="text-[12px] text-bingo-gray-300">— טרם מולא —</p>
                ) : (
                  <dl className="space-y-1">
                    {filled.map((r) => (
                      <div key={r.label} className="flex items-baseline gap-2 group">
                        <dt className="text-[12px] text-bingo-gray-400 w-32 shrink-0">{r.label}</dt>
                        <dd
                          className={cn("text-[13px] font-semibold text-bingo-black flex-1 min-w-0 break-words", r.ltr && "tabular-nums")}
                          dir={r.ltr ? "ltr" : undefined}
                          style={r.ltr ? { textAlign: "right" } : undefined}
                        >
                          {r.value}
                        </dd>
                        {r.copy && r.value && (
                          <button
                            onClick={() => copyValue(g.title + r.label, r.value!)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-bingo-gray-400 hover:text-bingo-black shrink-0"
                            aria-label={`העתק ${r.label}`}
                          >
                            {copied === g.title + r.label
                              ? <Check className="size-3.5 text-bingo-green-dark" />
                              : <Copy className="size-3.5" />}
                          </button>
                        )}
                      </div>
                    ))}
                  </dl>
                )}
              </section>
            );
          })}
        </div>
      </aside>
    </div>
  );
}
