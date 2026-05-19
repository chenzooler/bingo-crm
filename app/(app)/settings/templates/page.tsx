"use client";
import * as React from "react";
import { Plus, Pencil, Trash2, MessageCircle, Mail, MessageSquare } from "lucide-react";

interface Template {
  id: string;
  name: string;
  channel: "whatsapp" | "sms" | "email";
  body: string;
  variables: string[];
  approved?: boolean;
}

const TEMPLATES: Template[] = [
  { id: "t1", name: "ברוכים הבאים - הודעה ראשונה", channel: "whatsapp", body: "שלום {{firstName}}, ברוכים הבאים לבינגו! בקרוב נציג שלנו ייצור איתך קשר לבדיקת זכאות.", variables: ["firstName"], approved: true },
  { id: "t2", name: "תזכורת - לא ענה", channel: "whatsapp", body: "היי {{firstName}}, ניסינו להתקשר אליך {{date}}. מתי נוח לך שנחזור?", variables: ["firstName", "date"], approved: true },
  { id: "t3", name: "אישור הלוואה", channel: "whatsapp", body: "מעולה! {{firstName}} אישרנו עבורך הלוואה של {{amount}} ₪. נשלח אליך חוזה לחתימה.", variables: ["firstName", "amount"], approved: true },
  { id: "t4", name: "שליחת חוזה", channel: "sms", body: "{{firstName}}, החוזה ממתין לחתימה: {{contractLink}}", variables: ["firstName", "contractLink"] },
  { id: "t5", name: "אישור סופי", channel: "email", body: "שלום {{firstName}},\n\nשמחים לבשר שההלוואה אושרה סופית.\nההלוואה תועבר תוך 24 שעות.\n\nתודה,\nצוות בינגו", variables: ["firstName"] },
  { id: "t6", name: "תזכורת תשלום", channel: "sms", body: "{{firstName}}, תזכורת ידידותית - יתרת שכ\"ט של {{amount}} ₪.", variables: ["firstName", "amount"] },
  { id: "t7", name: "מעקב 6 חודשים", channel: "whatsapp", body: "היי {{firstName}}, עברו 6 חודשים מאז שעזרנו לך בהלוואה. צריך עוד אשראי? אנחנו כאן.", variables: ["firstName"] },
];

const CHANNEL_META = {
  whatsapp: { label: "WhatsApp", color: "bg-emerald-100 text-emerald-700 border-emerald-300", icon: <MessageCircle className="size-4" /> },
  sms: { label: "SMS", color: "bg-status-yellow-soft text-amber-700 border-status-yellow/40", icon: <MessageSquare className="size-4" /> },
  email: { label: "Email", color: "bg-status-blue-soft text-status-blue border-status-blue/30", icon: <Mail className="size-4" /> },
};

export default function TemplatesSettingsPage() {
  const [channel, setChannel] = React.useState<"all" | Template["channel"]>("all");
  const filtered = TEMPLATES.filter((t) => channel === "all" || t.channel === channel);

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-3xl border border-bingo-gray-200 bingo-shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-bingo-gray-500">תקשורת</div>
            <h2 className="text-xl font-extrabold text-bingo-black">תבניות הודעות</h2>
            <p className="text-[12px] text-bingo-gray-600 mt-1">{TEMPLATES.length} תבניות שמורות</p>
          </div>
          <button className="h-9 px-3 rounded-xl bg-bingo-black text-white text-xs font-bold hover:bg-bingo-charcoal inline-flex items-center gap-1.5">
            <Plus className="size-3.5" /> תבנית חדשה
          </button>
        </div>

        <div className="flex items-center gap-1.5 bg-bingo-gray-100 rounded-xl p-1 w-fit">
          {[
            { v: "all" as const, l: "הכל" },
            { v: "whatsapp" as const, l: "WhatsApp" },
            { v: "sms" as const, l: "SMS" },
            { v: "email" as const, l: "Email" },
          ].map((opt) => (
            <button
              key={opt.v}
              onClick={() => setChannel(opt.v)}
              className={`h-8 px-3 rounded-lg text-xs font-bold transition ${
                channel === opt.v ? "bg-white bingo-shadow-sm text-bingo-black" : "text-bingo-gray-500 hover:text-bingo-black"
              }`}
            >
              {opt.l}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filtered.map((t) => {
          const meta = CHANNEL_META[t.channel];
          return (
            <div key={t.id} className="rounded-2xl bg-white border border-bingo-gray-200 p-4 hover:border-bingo-green/40 transition group">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`size-9 rounded-xl border inline-flex items-center justify-center shrink-0 ${meta.color}`}>
                    {meta.icon}
                  </div>
                  <div className="min-w-0">
                    <div className="text-[13px] font-extrabold text-bingo-black truncate">{t.name}</div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className={`text-[9px] font-bold rounded-full border px-1.5 py-px ${meta.color}`}>{meta.label}</span>
                      {t.approved && <span className="text-[9px] font-bold text-bingo-green-dark">✓ אושר ע"י WhatsApp</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                  <button className="size-7 rounded-lg hover:bg-bingo-gray-100 text-bingo-gray-500 inline-flex items-center justify-center">
                    <Pencil className="size-3.5" />
                  </button>
                  <button className="size-7 rounded-lg hover:bg-status-red/10 text-bingo-gray-500 hover:text-status-red inline-flex items-center justify-center">
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </div>
              <p className="text-[12px] text-bingo-charcoal leading-relaxed bg-bingo-gray-50 rounded-xl p-3 border border-bingo-gray-100 whitespace-pre-line">{t.body}</p>
              {t.variables.length > 0 && (
                <div className="flex items-center gap-1 flex-wrap mt-2">
                  {t.variables.map((v) => (
                    <span key={v} className="text-[10px] font-mono bg-bingo-green/10 text-bingo-green-dark rounded-md px-1.5 py-0.5">
                      {`{{${v}}}`}
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
