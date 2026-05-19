"use client";
import * as React from "react";
import { CheckCircle2, AlertCircle, Settings, Phone, MessageCircle, Mail, FileText, CreditCard, Mic, Building, Bot } from "lucide-react";

interface Integration {
  key: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  status: "connected" | "disconnected" | "error";
  category: "communications" | "calls" | "finance" | "credit" | "ai";
}

const INTEGRATIONS: Integration[] = [
  { key: "wati", name: "WATI", description: "WhatsApp Business API - שליחה ו2-way", icon: <MessageCircle className="size-5" />, status: "disconnected", category: "communications" },
  { key: "callmarker", name: "CallMarker", description: "מרכזיה - חיוג מהכרטיס, הקלטות, IVR", icon: <Phone className="size-5" />, status: "disconnected", category: "calls" },
  { key: "power-dialer", name: "Power Dialer", description: "תותח שיחות מובנה - פולואפים וסגירות", icon: <Phone className="size-5" />, status: "disconnected", category: "calls" },
  { key: "sms", name: "SMS Hub", description: "שליחת SMS מהכרטיס + מעקב", icon: <MessageCircle className="size-5" />, status: "disconnected", category: "communications" },
  { key: "email", name: "Email (SMTP)", description: "Postmark / Resend / Gmail SMTP", icon: <Mail className="size-5" />, status: "disconnected", category: "communications" },
  { key: "greeninvoice", name: "GreenInvoice", description: "חשבונית ירוקה - חשבוניות אוטומטיות", icon: <FileText className="size-5" />, status: "disconnected", category: "finance" },
  { key: "bdi", name: "BDI", description: "בדיקת אשראי אוטומטית - דירוג + היסטוריה", icon: <CreditCard className="size-5" />, status: "disconnected", category: "credit" },
  { key: "whisper", name: "Whisper Transcription", description: "תעתוק הקלטות שיחה אוטומטי", icon: <Mic className="size-5" />, status: "disconnected", category: "ai" },
  { key: "claude", name: "Claude AI", description: "ניתוח שיחות, סקריפטים, סיכומים", icon: <Bot className="size-5" />, status: "disconnected", category: "ai" },
  { key: "openai", name: "OpenAI", description: "GPT-4 לחילופי Claude (fallback)", icon: <Bot className="size-5" />, status: "disconnected", category: "ai" },
  { key: "phoenix", name: "הפניקס API", description: "בדיקה ישירה מול הפניקס", icon: <Building className="size-5" />, status: "disconnected", category: "credit" },
  { key: "jbank", name: "בנק ירושלים API", description: "בדיקה ישירה מול בנק ירושלים", icon: <Building className="size-5" />, status: "disconnected", category: "credit" },
];

const CATEGORIES: { key: Integration["category"]; label: string }[] = [
  { key: "communications", label: "תקשורת" },
  { key: "calls", label: "מרכזיה" },
  { key: "credit", label: "אשראי" },
  { key: "finance", label: "פיננסי" },
  { key: "ai", label: "AI" },
];

export default function IntegrationsSettingsPage() {
  return (
    <div className="space-y-5">
      <div className="bg-white rounded-3xl border border-bingo-gray-200 bingo-shadow-sm p-6">
        <div className="text-[10px] font-bold uppercase tracking-wider text-bingo-gray-500">תקשורת</div>
        <h2 className="text-xl font-extrabold text-bingo-black">אינטגרציות</h2>
        <p className="text-[12px] text-bingo-gray-600 mt-1">
          {INTEGRATIONS.length} שירותים זמינים · {INTEGRATIONS.filter((i) => i.status === "connected").length} מחוברים
        </p>
      </div>

      {CATEGORIES.map((cat) => {
        const items = INTEGRATIONS.filter((i) => i.category === cat.key);
        return (
          <div key={cat.key}>
            <div className="text-[11px] font-bold uppercase tracking-wider text-bingo-gray-500 px-1 mb-2">
              {cat.label}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {items.map((integ) => (
                <div key={integ.key} className="rounded-2xl bg-white border border-bingo-gray-200 hover:border-bingo-gray-300 p-4 transition">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="size-11 rounded-2xl bg-gradient-to-bl from-bingo-green/15 to-bingo-green/5 border border-bingo-green/30 inline-flex items-center justify-center text-bingo-green-dark shrink-0">
                        {integ.icon}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h3 className="text-[14px] font-extrabold text-bingo-black">{integ.name}</h3>
                          {integ.status === "connected" && <CheckCircle2 className="size-3.5 text-bingo-green-dark" />}
                          {integ.status === "error" && <AlertCircle className="size-3.5 text-status-red" />}
                        </div>
                        <p className="text-[11px] text-bingo-gray-600 mt-0.5">{integ.description}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-bingo-gray-100">
                    {integ.status === "connected" ? (
                      <>
                        <button className="h-8 px-3 rounded-lg bg-bingo-gray-100 text-bingo-charcoal text-xs font-bold hover:bg-bingo-gray-200 inline-flex items-center gap-1">
                          <Settings className="size-3.5" /> הגדרות
                        </button>
                        <button className="h-8 px-3 rounded-lg bg-status-red-soft text-status-red text-xs font-bold hover:bg-red-200">
                          נתק
                        </button>
                      </>
                    ) : (
                      <button className="h-8 px-3 rounded-lg bg-bingo-black text-white text-xs font-bold hover:bg-bingo-charcoal w-full">
                        חבר עכשיו
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
