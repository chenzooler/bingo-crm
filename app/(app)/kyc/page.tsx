"use client";
import * as React from "react";
import { Avatar } from "@/components/ui/Avatar";
import { LEADS } from "@/lib/data/leads";
import Link from "next/link";
import { ShieldCheck, FileText, CheckCircle2, Upload, AlertCircle, Clock, ChevronLeft } from "lucide-react";
import { cn, formatDate } from "@/lib/utils";

interface KycCase {
  id: string;
  leadName: string;
  status: "pending" | "in-review" | "approved" | "rejected";
  documents: { name: string; uploaded: boolean; verified: boolean }[];
  uploadedAt: string;
  reviewer?: string;
}

const REQUIRED_DOCS = [
  "תעודת זהות (קדמי)",
  "ספח תעודת זהות",
  "תלוש משכורת אחרון",
  "תדפיס בנק 3 חודשים",
  "אישור הכנסה",
  "הסכמה לבדיקת BDI",
];

const KYC_CASES: KycCase[] = LEADS.slice(0, 12).map((l, i) => {
  const statuses: KycCase["status"][] = ["approved", "in-review", "in-review", "pending", "approved", "rejected"];
  const status = statuses[i % statuses.length];
  return {
    id: `kyc-${l.id}`,
    leadName: l.fullName,
    status,
    documents: REQUIRED_DOCS.map((d, j) => ({
      name: d,
      uploaded: status !== "pending" || j < 2,
      verified: status === "approved",
    })),
    uploadedAt: new Date(Date.now() - i * 1000 * 60 * 60 * 12).toISOString(),
    reviewer: status !== "pending" ? "חן צולר" : undefined,
  };
});

const STATUS_META = {
  pending: { label: "ממתין להעלאה", color: "bg-bingo-gray-100 text-bingo-gray-700 border-bingo-gray-200", icon: <Clock className="size-3" /> },
  "in-review": { label: "בבדיקה", color: "bg-status-yellow-soft text-amber-700 border-status-yellow/40", icon: <Clock className="size-3" /> },
  approved: { label: "אושר", color: "bg-bingo-green/15 text-bingo-green-dark border-bingo-green/40", icon: <CheckCircle2 className="size-3" /> },
  rejected: { label: "נדחה", color: "bg-status-red-soft text-status-red border-status-red/40", icon: <AlertCircle className="size-3" /> },
};

export default function KycPage() {
  const [selectedId, setSelectedId] = React.useState(KYC_CASES[1].id);
  const selected = KYC_CASES.find((k) => k.id === selectedId);

  return (
    <div className="max-w-[1500px] space-y-4">
      <div>
        <div className="text-[11px] font-bold uppercase tracking-wider text-bingo-gray-500 inline-flex items-center gap-1 mb-1">
          <ShieldCheck className="size-3" /> KYC & Compliance
        </div>
        <h1 className="text-3xl sm:text-[34px] font-black tracking-tight text-bingo-black leading-none">
          זיהוי לקוחות
          <span className="inline-block size-3 rounded-full bg-bingo-green ml-2 align-middle" />
        </h1>
        <p className="text-sm text-bingo-gray-600 mt-1.5">איסוף ואימות מסמכי לקוח - חוקי וקליל. AI מזהה אוטומטית מסמכים שגויים.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
        {/* Cases list */}
        <div className="lg:col-span-4 rounded-3xl bg-white border border-bingo-gray-200 bingo-shadow-sm overflow-hidden max-h-[calc(100vh-220px)] flex flex-col">
          <div className="px-4 py-3 border-b border-bingo-gray-100">
            <h2 className="text-base font-extrabold text-bingo-black">תיקי KYC ({KYC_CASES.length})</h2>
          </div>
          <div className="overflow-y-auto">
            {KYC_CASES.map((k) => {
              const sm = STATUS_META[k.status];
              const uploaded = k.documents.filter((d) => d.uploaded).length;
              return (
                <button
                  key={k.id}
                  onClick={() => setSelectedId(k.id)}
                  className={cn(
                    "w-full text-right p-3 border-b border-bingo-gray-100 last:border-0 transition flex items-center gap-3",
                    selectedId === k.id ? "bg-bingo-green/8 border-r-4 border-r-bingo-green" : "hover:bg-bingo-gray-50"
                  )}
                >
                  <Avatar name={k.leadName} size="md" />
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-extrabold text-bingo-black truncate">{k.leadName}</div>
                    <div className="text-[10px] text-bingo-gray-500 mt-0.5">{uploaded}/{k.documents.length} מסמכים</div>
                  </div>
                  <span className={cn("inline-flex items-center gap-1 text-[9px] font-bold rounded-full border px-1.5 py-0.5 shrink-0", sm.color)}>
                    {sm.icon}{sm.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Detail */}
        {selected && (
          <div className="lg:col-span-8">
            <div className="rounded-3xl bg-white border border-bingo-gray-200 bingo-shadow-sm p-5">
              <div className="flex items-center justify-between gap-3 mb-4 pb-4 border-b border-bingo-gray-100">
                <div className="flex items-center gap-3">
                  <Avatar name={selected.leadName} size="lg" />
                  <div>
                    <h2 className="text-xl font-extrabold text-bingo-black">{selected.leadName}</h2>
                    <div className="text-[11px] text-bingo-gray-500 mt-0.5">
                      תיק נוצר {formatDate(selected.uploadedAt)} · {selected.reviewer ? `בודק: ${selected.reviewer}` : "לא הוקצה לבודק"}
                    </div>
                  </div>
                </div>
                <Link href={`/leads/3035035`} className="h-9 px-3 rounded-xl bg-bingo-gray-100 hover:bg-bingo-gray-200 text-bingo-charcoal text-xs font-bold inline-flex items-center gap-1.5">
                  פתח כרטיס <ChevronLeft className="size-3.5" />
                </Link>
              </div>

              <h3 className="text-sm font-extrabold text-bingo-black mb-3">מסמכים נדרשים</h3>
              <div className="space-y-2">
                {selected.documents.map((doc, i) => (
                  <div key={i} className={cn("flex items-center gap-3 p-3 rounded-xl border-2", doc.verified ? "border-bingo-green/40 bg-bingo-green/8" : doc.uploaded ? "border-status-yellow/40 bg-status-yellow-soft/40" : "border-bingo-gray-200 bg-bingo-gray-50")}>
                    <span className={cn("size-10 rounded-xl inline-flex items-center justify-center shrink-0",
                      doc.verified ? "bg-bingo-green text-bingo-black" :
                      doc.uploaded ? "bg-status-yellow text-amber-900" :
                      "bg-bingo-gray-200 text-bingo-gray-600"
                    )}>
                      {doc.verified ? <CheckCircle2 className="size-5" /> : doc.uploaded ? <Clock className="size-5" /> : <Upload className="size-5" />}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="text-[14px] font-extrabold text-bingo-black">{doc.name}</div>
                      <div className="text-[11px] text-bingo-gray-500 mt-0.5">
                        {doc.verified ? "✓ אומת ע״י AI + Reviewer" : doc.uploaded ? "ממתין לאימות" : "טרם הועלה"}
                      </div>
                    </div>
                    {doc.verified ? (
                      <button className="h-8 px-3 rounded-lg bg-bingo-gray-100 text-bingo-charcoal text-xs font-bold">צפיה</button>
                    ) : doc.uploaded ? (
                      <div className="flex items-center gap-1">
                        <button className="h-8 px-3 rounded-lg bg-bingo-green text-bingo-black text-xs font-bold hover:bg-bingo-green-bright">✓ אשר</button>
                        <button className="h-8 px-3 rounded-lg bg-status-red-soft text-status-red text-xs font-bold hover:bg-red-200">✕ דחה</button>
                      </div>
                    ) : (
                      <button className="h-8 px-3 rounded-lg bg-bingo-black text-white text-xs font-bold hover:bg-bingo-charcoal">בקש מהלקוח</button>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t border-bingo-gray-100 flex items-center justify-between gap-3">
                <div className="text-[12px] text-bingo-gray-600">
                  {selected.documents.filter((d) => d.verified).length}/{selected.documents.length} אומתו
                </div>
                <div className="flex items-center gap-2">
                  <button className="h-10 px-4 rounded-xl bg-status-red-soft text-status-red text-sm font-bold hover:bg-red-200">דחה תיק</button>
                  <button className="h-10 px-5 rounded-xl bg-bingo-green text-bingo-black text-sm font-bold hover:bg-bingo-green-bright">אשר תיק</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
