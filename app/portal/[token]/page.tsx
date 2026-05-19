"use client";
import * as React from "react";
import { Logo } from "@/components/ui/Logo";
import { BingoBall } from "@/components/icons/ServiceIcons";
import { LENDERS } from "@/lib/types";
import { LenderMark } from "@/components/icons/ServiceIcons";
import { CheckCircle2, Clock, Upload, Phone, MessageCircle, FileSignature, Calendar, Sparkles } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";

/**
 * Public customer-facing portal.
 * No auth - access via secure token in URL.
 * Shows customer their loan status, lets them upload docs, sign contract, see updates.
 */
export default function CustomerPortalPage() {
  const [activeTab, setActiveTab] = React.useState<"status" | "docs" | "chat">("status");

  // Mock customer data
  const customer = {
    name: "דוד כהן",
    amountRequested: 50000,
    finalApproved: 45000,
    monthlyPayment: 850,
    payments: 60,
    lender: "cal",
    currentStep: 7,
    totalSteps: 10,
    contractSigned: true,
    docsRequired: ["תלוש משכורת אחרון", "תדפיס חשבון בנק", "ת.ז + ספח"],
    docsUploaded: ["ת.ז + ספח"],
    nextAction: "הלקוח חתם על החוזה - ממתינים להעברת הכסף מכאל",
  };

  const STEPS = [
    "ליד התקבל",
    "שיחה ראשונה",
    "סינון",
    "הסכם נחתם",
    "BDI אושר",
    "בדיקה מול גופים",
    "הצעה התקבלה",
    "חוזה נחתם",
    "כסף בדרך",
    "הושלם",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-bl from-bingo-cream to-white">
      {/* Header */}
      <header className="bg-white border-b border-bingo-gray-200 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-5 h-16 flex items-center justify-between">
          <Logo size={28} />
          <div className="text-[12px] text-bingo-gray-600 font-bold">{customer.name}</div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-5 py-6 space-y-4">
        {/* Hero */}
        <div className="rounded-3xl bg-gradient-to-bl from-bingo-onyx to-bingo-charcoal text-white p-6 relative overflow-hidden bingo-shadow-lg">
          <div className="absolute -top-8 -left-8 size-40 opacity-25"><BingoBall size={160} /></div>
          <div className="relative">
            <div className="text-[11px] uppercase tracking-wider text-bingo-green font-bold mb-1">סטטוס ההלוואה שלך</div>
            <h1 className="text-3xl font-black mb-2">שלום {customer.name.split(" ")[0]} 👋</h1>
            <p className="text-[14px] opacity-80">
              אנחנו בשלב <strong className="text-bingo-green">חוזה חתום</strong>. בקרוב הכסף יועבר לחשבון.
            </p>

            <div className="mt-4 grid grid-cols-3 gap-3">
              <Stat label="סכום אושר" value={formatCurrency(customer.finalApproved)} />
              <Stat label="החזר חודשי" value={formatCurrency(customer.monthlyPayment)} />
              <Stat label="תשלומים" value={`${customer.payments}`} />
            </div>
          </div>
        </div>

        {/* Progress timeline */}
        <div className="rounded-3xl bg-white border border-bingo-gray-200 bingo-shadow-sm p-5">
          <h2 className="text-base font-extrabold text-bingo-black mb-1">ההתקדמות שלך</h2>
          <p className="text-[11px] text-bingo-gray-600 mb-4">{customer.currentStep} מתוך {customer.totalSteps} שלבים הושלמו</p>

          <div className="space-y-1">
            {STEPS.map((step, i) => {
              const done = i < customer.currentStep;
              const current = i === customer.currentStep;
              return (
                <div key={i} className="flex items-center gap-3">
                  <div className={cn("size-8 rounded-full inline-flex items-center justify-center shrink-0",
                    done ? "bg-bingo-green text-bingo-black" :
                    current ? "bg-status-yellow text-amber-900 ring-4 ring-status-yellow/30 animate-pulse-green" :
                    "bg-bingo-gray-100 text-bingo-gray-400"
                  )}>
                    {done ? <CheckCircle2 className="size-4" /> : <span className="text-xs font-bold">{i + 1}</span>}
                  </div>
                  <div className="flex-1 py-2">
                    <div className={cn("text-[13px] font-bold", done ? "text-bingo-black" : current ? "text-amber-700" : "text-bingo-gray-400")}>
                      {step}
                    </div>
                    {current && <div className="text-[11px] text-bingo-charcoal mt-0.5">{customer.nextAction}</div>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 bg-white border border-bingo-gray-200 rounded-2xl p-1 bingo-shadow-sm">
          {[
            { v: "status" as const, l: "סטטוס" },
            { v: "docs" as const, l: "מסמכים" },
            { v: "chat" as const, l: "התכתבות" },
          ].map((t) => (
            <button
              key={t.v}
              onClick={() => setActiveTab(t.v)}
              className={cn("flex-1 h-10 rounded-xl text-sm font-bold transition", activeTab === t.v ? "bg-bingo-black text-white" : "text-bingo-charcoal hover:bg-bingo-gray-100")}
            >
              {t.l}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === "status" && (
          <div className="rounded-3xl bg-white border border-bingo-gray-200 bingo-shadow-sm p-5">
            <h2 className="text-base font-extrabold text-bingo-black mb-3">פרטי ההלוואה</h2>
            <div className="grid grid-cols-2 gap-3 text-[14px]">
              <Detail label="גוף מימון" value={<div className="flex items-center gap-2"><LenderMark code={customer.lender} size={28} />{LENDERS.find((l) => l.key === customer.lender)?.label}</div>} />
              <Detail label="סכום מאושר" value={<strong className="text-bingo-green-dark text-base">{formatCurrency(customer.finalApproved)}</strong>} />
              <Detail label="החזר חודשי" value={formatCurrency(customer.monthlyPayment)} />
              <Detail label="מספר תשלומים" value={`${customer.payments} תשלומים`} />
              <Detail label="ריבית שנתית" value="6.5%" />
              <Detail label="עלות סופית" value={formatCurrency(customer.monthlyPayment * customer.payments)} />
            </div>
          </div>
        )}

        {activeTab === "docs" && (
          <div className="rounded-3xl bg-white border border-bingo-gray-200 bingo-shadow-sm p-5">
            <h2 className="text-base font-extrabold text-bingo-black mb-3">העלאת מסמכים</h2>
            <div className="space-y-2 mb-4">
              {customer.docsRequired.map((doc) => {
                const uploaded = customer.docsUploaded.includes(doc);
                return (
                  <div key={doc} className={cn("flex items-center gap-3 p-3 rounded-xl border", uploaded ? "border-bingo-green/40 bg-bingo-green/8" : "border-bingo-gray-200 bg-bingo-gray-50")}>
                    <span className={cn("size-8 rounded-lg inline-flex items-center justify-center shrink-0", uploaded ? "bg-bingo-green text-bingo-black" : "bg-bingo-gray-200 text-bingo-gray-600")}>
                      {uploaded ? <CheckCircle2 className="size-4" /> : <Upload className="size-4" />}
                    </span>
                    <div className="flex-1 text-[13px] font-bold text-bingo-black">{doc}</div>
                    {!uploaded && (
                      <button className="h-8 px-3 rounded-lg bg-bingo-black text-white text-xs font-bold hover:bg-bingo-charcoal">העלה</button>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="rounded-2xl border-2 border-dashed border-bingo-gray-300 bg-bingo-gray-50 p-6 text-center hover:border-bingo-green hover:bg-bingo-green/5 transition cursor-pointer">
              <Upload className="size-6 mx-auto text-bingo-gray-400 mb-2" />
              <div className="text-sm font-bold text-bingo-charcoal">גרור קבצים לכאן או לחץ לבחירה</div>
              <div className="text-[10px] text-bingo-gray-500 mt-1">PDF, JPG, PNG עד 10MB</div>
            </div>
          </div>
        )}

        {activeTab === "chat" && (
          <div className="rounded-3xl bg-white border border-bingo-gray-200 bingo-shadow-sm p-5 text-center">
            <MessageCircle className="size-10 text-bingo-green-dark mx-auto mb-3" />
            <h3 className="text-base font-extrabold text-bingo-black mb-1">דבר עם הנציג שלך</h3>
            <p className="text-[13px] text-bingo-gray-600 mb-4">חן צולר זמין לשאלות בכל שעה</p>
            <div className="grid grid-cols-2 gap-2">
              <a href="https://wa.me/972501234567" className="h-12 rounded-xl bg-emerald-600 text-white text-sm font-bold inline-flex items-center justify-center gap-2 hover:bg-emerald-700">
                <MessageCircle className="size-4" /> WhatsApp
              </a>
              <a href="tel:0501234567" className="h-12 rounded-xl bg-bingo-black text-white text-sm font-bold inline-flex items-center justify-center gap-2 hover:bg-bingo-charcoal">
                <Phone className="size-4" /> חיוג
              </a>
            </div>
          </div>
        )}

        <div className="text-center text-[10px] text-bingo-gray-400 py-4">
          🔒 קישור מאובטח · בינגו ישראל © 2026
        </div>
      </main>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white/10 backdrop-blur rounded-xl p-2.5">
      <div className="text-[10px] uppercase tracking-wider opacity-60">{label}</div>
      <div className="text-xl font-black tabular-nums">{value}</div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div className="text-[10px] font-bold uppercase tracking-wider text-bingo-gray-500 mb-1">{label}</div>
      <div className="font-bold text-bingo-black">{value}</div>
    </div>
  );
}
