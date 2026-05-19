"use client";
import { LENDERS } from "@/lib/types";
import { LenderMark } from "@/components/icons/ServiceIcons";
import { Building2, Plus, CheckCircle2, Shield, Mail, Phone } from "lucide-react";

const CONTACTS = ["יוסי דוד", "שרה לוי", "אמיר כהן", "רחל פרץ", "דני שמש", "מירי גולן"];

export default function PartnersPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-bingo-black inline-flex items-center gap-2"><Building2 className="size-5" /> שותפים - גופי מימון</h2>
          <p className="text-[12px] text-bingo-gray-600 mt-1">פורטל לגופי המימון - הם רואים את הלידים שלך, מאשרים ישירות</p>
        </div>
        <button className="h-10 px-4 rounded-xl bg-bingo-black text-white text-sm font-bold inline-flex items-center gap-1.5 hover:bg-bingo-charcoal">
          <Plus className="size-4" /> שותף חדש
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {LENDERS.map((l, i) => (
          <div key={l.key} className="rounded-2xl bg-white border border-bingo-gray-200 hover:border-bingo-green/40 p-4 transition">
            <div className="flex items-start gap-3 mb-3">
              <LenderMark code={l.key} size={42} />
              <div className="flex-1 min-w-0">
                <div className="text-[14px] font-extrabold text-bingo-black">{l.label}</div>
                <div className="text-[11px] text-bingo-gray-500 mt-0.5">{CONTACTS[i % CONTACTS.length]} · איש קשר ראשי</div>
              </div>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-bingo-green-dark bg-bingo-green/15 rounded-full px-2 py-0.5">
                <CheckCircle2 className="size-3" /> פעיל
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 mb-3 pt-3 border-t border-bingo-gray-100">
              <Stat label="לידים החודש" value={`${20 + i * 8}`} />
              <Stat label="אישורים" value={`${10 + i * 5}`} />
              <Stat label="ROI" value={`${250 + i * 40}%`} />
            </div>
            <div className="flex items-center gap-1.5">
              <button className="flex-1 h-8 rounded-lg bg-bingo-gray-100 hover:bg-bingo-gray-200 text-bingo-charcoal text-xs font-bold inline-flex items-center justify-center gap-1">
                <Mail className="size-3.5" /> אימייל
              </button>
              <button className="flex-1 h-8 rounded-lg bg-bingo-gray-100 hover:bg-bingo-gray-200 text-bingo-charcoal text-xs font-bold inline-flex items-center justify-center gap-1">
                <Phone className="size-3.5" /> שיחה
              </button>
              <button className="flex-1 h-8 rounded-lg bg-bingo-green text-bingo-black text-xs font-bold inline-flex items-center justify-center gap-1 hover:bg-bingo-green-bright">
                <Shield className="size-3.5" /> פורטל
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[9px] uppercase tracking-wider text-bingo-gray-500 font-bold">{label}</div>
      <div className="text-sm font-mono tabular-nums font-extrabold text-bingo-black">{value}</div>
    </div>
  );
}
