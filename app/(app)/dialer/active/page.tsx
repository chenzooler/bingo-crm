"use client";
import * as React from "react";
import Link from "next/link";
import { LEADS } from "@/lib/data/leads";
import { Avatar } from "@/components/ui/Avatar";
import { Phone, PhoneOff, Mic, MicOff, Volume2, Pause, MoreHorizontal, ChevronLeft, MessageCircle, FileText, Lightbulb, AlertTriangle, CheckCircle2, X } from "lucide-react";
import { BingoBall } from "@/components/icons/ServiceIcons";
import { cn, formatCurrency } from "@/lib/utils";

/**
 * Active call screen - the agent is on the phone with a lead.
 * Shows live AI assistant, customer context, and quick actions.
 */
export default function ActiveCallPage() {
  const lead = LEADS[0];
  const [seconds, setSeconds] = React.useState(34);
  const [muted, setMuted] = React.useState(false);
  const [paused, setPaused] = React.useState(false);
  const [aiSuggestion, setAiSuggestion] = React.useState(0);

  React.useEffect(() => {
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, []);

  // AI suggestions rotate
  React.useEffect(() => {
    const t = setInterval(() => setAiSuggestion((s) => (s + 1) % AI_SUGGESTIONS.length), 8000);
    return () => clearInterval(t);
  }, []);

  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;

  return (
    <div className="max-w-[1600px] space-y-4">
      <div className="flex items-center justify-between gap-3">
        <Link href="/dialer" className="h-9 px-3 rounded-xl bg-white border border-bingo-gray-200 hover:bg-bingo-gray-100 text-bingo-charcoal text-xs font-bold inline-flex items-center gap-1.5">
          <ChevronLeft className="size-3.5" /> חזור לתותח
        </Link>
        <div className="text-[11px] font-bold uppercase tracking-wider text-status-red inline-flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-status-red animate-pulse" />
          שיחה פעילה
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        {/* Customer context - LEFT side in RTL */}
        <div className="xl:col-span-3 order-2 xl:order-1 space-y-3">
          <CustomerCard lead={lead} />
          <PreviousCallsCard />
        </div>

        {/* Main call interface - CENTER */}
        <div className="xl:col-span-5 order-1 xl:order-2">
          <div className="rounded-3xl bg-gradient-to-bl from-bingo-onyx to-bingo-charcoal text-white p-6 bingo-shadow-xl relative overflow-hidden">
            <div className="absolute -top-8 -left-8 size-44 opacity-20"><BingoBall size={176} /></div>
            <div className="absolute bottom-0 left-1/3 size-28 opacity-10"><BingoBall size={112} /></div>

            <div className="relative">
              <div className="text-[10px] uppercase tracking-wider text-bingo-green font-bold mb-2">מדבר עם</div>
              <div className="flex items-center gap-4 mb-6">
                <Avatar name={lead.fullName} size="lg" className="size-16 text-base" />
                <div className="flex-1 min-w-0">
                  <h1 className="text-3xl sm:text-4xl font-black">{lead.fullName}</h1>
                  <div className="text-[12px] opacity-70 mt-1 font-mono tabular-nums" dir="ltr">{lead.phone}</div>
                  <div className="text-[11px] opacity-60 mt-0.5">
                    {lead.idNumber ? `ת.ז ${lead.idNumber} · ` : ""}
                    {lead.amountRequested ? `סכום מבוקש: ${formatCurrency(lead.amountRequested)}` : ""}
                  </div>
                </div>
              </div>

              {/* Timer */}
              <div className="bg-white/5 backdrop-blur rounded-2xl p-4 mb-5 border border-white/10 text-center">
                <div className="text-[10px] uppercase tracking-wider text-bingo-green font-bold mb-1">משך שיחה</div>
                <div className="text-6xl font-mono tabular-nums font-black text-bingo-green">
                  {String(min).padStart(2, "0")}:{String(sec).padStart(2, "0")}
                </div>
                <div className="text-[10px] opacity-60 mt-1 inline-flex items-center gap-1">
                  <span className={cn("size-1.5 rounded-full", paused ? "bg-status-yellow" : "bg-bingo-green animate-pulse")} />
                  {paused ? "הוקלטה הוקפאה" : "מקליט"}
                </div>
              </div>

              {/* Call controls */}
              <div className="grid grid-cols-4 gap-2 mb-3">
                <button
                  onClick={() => setMuted(!muted)}
                  className={cn(
                    "h-14 rounded-2xl font-bold text-xs inline-flex flex-col items-center justify-center gap-0.5 transition",
                    muted ? "bg-status-orange/30 text-status-orange border border-status-orange/40" : "bg-white/10 hover:bg-white/20 text-white"
                  )}
                >
                  {muted ? <MicOff className="size-5" /> : <Mic className="size-5" />}
                  <span className="text-[10px]">{muted ? "השתק על" : "מיקרופון"}</span>
                </button>
                <button
                  onClick={() => setPaused(!paused)}
                  className={cn(
                    "h-14 rounded-2xl font-bold text-xs inline-flex flex-col items-center justify-center gap-0.5 transition",
                    paused ? "bg-status-yellow/30 text-status-yellow border border-status-yellow/40" : "bg-white/10 hover:bg-white/20 text-white"
                  )}
                >
                  <Pause className="size-5" />
                  <span className="text-[10px]">{paused ? "המשך" : "השהה"}</span>
                </button>
                <button className="h-14 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold inline-flex flex-col items-center justify-center gap-0.5">
                  <Volume2 className="size-5" />
                  <span className="text-[10px]">רמקול</span>
                </button>
                <button className="h-14 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold inline-flex flex-col items-center justify-center gap-0.5">
                  <MoreHorizontal className="size-5" />
                  <span className="text-[10px]">עוד</span>
                </button>
              </div>

              <button className="w-full h-14 rounded-2xl bg-status-red hover:bg-red-600 text-white text-base font-extrabold inline-flex items-center justify-center gap-2 bingo-shadow-lg">
                <PhoneOff className="size-5" />
                סיים שיחה
              </button>
            </div>
          </div>

          {/* Quick actions */}
          <div className="mt-3 grid grid-cols-3 gap-2">
            <ActionBtn icon={<MessageCircle className="size-4" />} label="שלח WhatsApp" />
            <ActionBtn icon={<FileText className="size-4" />} label="שלח חוזה" />
            <ActionBtn icon={<CheckCircle2 className="size-4" />} label="פתח BDI" />
          </div>
        </div>

        {/* AI Co-pilot - RIGHT */}
        <div className="xl:col-span-4 order-3 space-y-3">
          <div className="rounded-3xl bg-gradient-to-bl from-status-purple/15 to-white border-2 border-status-purple/30 p-5 bingo-shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-extrabold text-bingo-black inline-flex items-center gap-2">
                <span className="size-7 rounded-lg bg-status-purple text-white inline-flex items-center justify-center">
                  <Lightbulb className="size-4" />
                </span>
                AI Co-pilot
              </h3>
              <span className="text-[10px] font-bold text-status-purple bg-status-purple/15 rounded-full px-2 py-0.5 inline-flex items-center gap-1">
                <span className="size-1.5 rounded-full bg-status-purple animate-pulse" />
                מקשיב
              </span>
            </div>

            <div className="rounded-2xl bg-white border-2 border-status-purple/30 p-4 transition-all duration-500 animate-fade-in" key={aiSuggestion}>
              <div className="text-[10px] font-bold uppercase tracking-wider text-status-purple mb-1.5">
                {AI_SUGGESTIONS[aiSuggestion].type}
              </div>
              <div className="text-[14px] font-bold text-bingo-black leading-relaxed">
                {AI_SUGGESTIONS[aiSuggestion].text}
              </div>
              {AI_SUGGESTIONS[aiSuggestion].action && (
                <button className="mt-3 h-8 px-3 rounded-lg bg-status-purple text-white text-[11px] font-bold hover:bg-purple-700 transition">
                  {AI_SUGGESTIONS[aiSuggestion].action}
                </button>
              )}
            </div>

            <div className="text-[10px] uppercase tracking-wider text-bingo-gray-500 font-bold mt-4 mb-2">תזכורות לשיחה</div>
            <div className="space-y-1.5">
              {REMINDERS.map((r, i) => (
                <div key={i} className={cn(
                  "flex items-center gap-2 p-2 rounded-lg text-[12px]",
                  r.done ? "bg-bingo-green/10 text-bingo-green-dark" : "bg-bingo-gray-50 text-bingo-charcoal"
                )}>
                  <span className={cn("size-4 rounded inline-flex items-center justify-center shrink-0", r.done ? "bg-bingo-green text-bingo-black" : "border-2 border-bingo-gray-300")}>
                    {r.done && <CheckCircle2 className="size-3" />}
                  </span>
                  {r.text}
                </div>
              ))}
            </div>
          </div>

          {/* Objection bank */}
          <div className="rounded-3xl bg-white border border-bingo-gray-200 bingo-shadow-sm p-5">
            <h3 className="text-sm font-extrabold text-bingo-black inline-flex items-center gap-2 mb-3">
              <AlertTriangle className="size-4" /> התנגדויות נפוצות + תשובות
            </h3>
            <div className="space-y-2">
              {OBJECTIONS.map((o, i) => (
                <ObjectionCard key={i} {...o} />
              ))}
            </div>
          </div>

          {/* Script */}
          <div className="rounded-3xl bg-white border border-bingo-gray-200 bingo-shadow-sm p-5">
            <h3 className="text-sm font-extrabold text-bingo-black inline-flex items-center gap-2 mb-2">
              <FileText className="size-4" /> תסריט מומלץ
            </h3>
            <div className="text-[13px] leading-relaxed text-bingo-charcoal bg-bingo-cream rounded-xl p-3 border border-bingo-gray-100">
              "שלום {lead.firstName || lead.fullName}, מדבר/ת חן מבינגו. הגעת אלינו בנושא הלוואה ל{lead.amountRequested ? formatCurrency(lead.amountRequested) : "סכום שביקשת"}. ראיתי שעוד לא דיברנו על תנאי ההלוואה - יש לי הצעה מצוינת בשבילך..."
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const AI_SUGGESTIONS = [
  { type: "💡 הצעה", text: "הלקוח מהסס. שאל אותו 'מה הכי חשוב לך - סכום גבוה או החזר נמוך?' זה יבהיר את העדיפויות", action: "העתק לקליפבורד" },
  { type: "⚠️ שים לב", text: "הלקוח אמר שיש לו עוד הצעה. תשאל מאיפה ובאיזה תנאים - נוכל להציע משהו טוב יותר", action: "פתח השוואה" },
  { type: "✓ פעולה", text: "הלקוח מתעניין באישור סופי. הזכר את הצורך באישור BDI כעת לפני המשך", action: "פתח BDI" },
  { type: "📊 נתון", text: "85% מהלקוחות בפרופיל דומה אישרו את ההצעה כשהציגו השוואה ל-3 גופים אחרים", action: "פתח השוואה" },
];

const REMINDERS = [
  { text: "הזכר את ריבית התקופה", done: true },
  { text: "אמת ת.ז ושם מלא", done: true },
  { text: "אישור לבדיקת BDI", done: false },
  { text: "שאל על מקור הכנסה", done: false },
  { text: "הזכר את שכר הטרחה", done: false },
];

const OBJECTIONS = [
  { obj: "יקר מדי", resp: "אני מבין. השווינו 12 גופים - זאת ההצעה הטובה ביותר עבור הפרופיל שלך. אסביר?" },
  { obj: "צריך לחשוב", resp: "מה הכי מטריד אותך בהצעה? אם נתקדם היום - הריבית מובטחת למשך שבוע." },
  { obj: "יש לי הצעה אחרת", resp: "מעולה שעשית סקר שוק. אפשר לראות את ההצעה? אם אנחנו לא טובים יותר ב-3 פרמטרים - אתה חופשי." },
];

function ObjectionCard({ obj, resp }: { obj: string; resp: string }) {
  const [open, setOpen] = React.useState(false);
  return (
    <button
      onClick={() => setOpen(!open)}
      className="w-full text-right rounded-xl bg-bingo-gray-50 hover:bg-bingo-green/8 border border-bingo-gray-100 hover:border-bingo-green/30 p-2.5 transition"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-[12px] font-bold text-bingo-black">"{obj}"</span>
        <span className="text-[10px] text-bingo-gray-500">{open ? "סגור" : "תשובה"}</span>
      </div>
      {open && (
        <div className="text-[12px] text-bingo-charcoal mt-2 pt-2 border-t border-bingo-gray-200 leading-relaxed text-right">
          {resp}
        </div>
      )}
    </button>
  );
}

function CustomerCard({ lead }: { lead: any }) {
  return (
    <div className="rounded-2xl bg-white border border-bingo-gray-200 bingo-shadow-sm p-4">
      <h3 className="text-[11px] font-bold uppercase tracking-wider text-bingo-gray-500 mb-3">מידע על הלקוח</h3>
      <div className="space-y-2 text-[12px]">
        <Row label="גיל" value={lead.birthDate ? `${new Date().getFullYear() - new Date(lead.birthDate).getFullYear()}` : "—"} />
        <Row label="מצב משפחתי" value={lead.familyStatus === "married" ? "נשוי" : "—"} />
        <Row label="ילדים" value={lead.childrenU18 != null ? String(lead.childrenU18) : "—"} />
        <Row label="תעסוקה" value={lead.employmentStatus === "retired" ? "פנסיונר" : lead.employmentStatus === "employee" ? "שכיר" : "—"} />
        <Row label="הכנסה" value={lead.monthlyIncome ? formatCurrency(lead.monthlyIncome) : "—"} />
        <Row label="סכום מבוקש" value={lead.amountRequested ? formatCurrency(lead.amountRequested) : "—"} highlight />
      </div>
      <Link href={`/leads/${lead.id}`} className="mt-3 w-full h-9 rounded-xl bg-bingo-black text-white text-[11px] font-bold inline-flex items-center justify-center hover:bg-bingo-charcoal">
        כרטיס מלא ←
      </Link>
    </div>
  );
}

function PreviousCallsCard() {
  return (
    <div className="rounded-2xl bg-white border border-bingo-gray-200 bingo-shadow-sm p-4">
      <h3 className="text-[11px] font-bold uppercase tracking-wider text-bingo-gray-500 mb-3">שיחות קודמות</h3>
      <div className="space-y-2">
        {[
          { date: "אתמול", duration: "2:14", outcome: "ענה", note: "ביקש להתקשר ב-14:00" },
          { date: "לפני 3 ימים", duration: "0:08", outcome: "לא ענה", note: "השאיר ווצאפ" },
          { date: "לפני שבוע", duration: "5:42", outcome: "ענה", note: "שיחה ראשונה" },
        ].map((c, i) => (
          <div key={i} className="rounded-xl bg-bingo-gray-50 border border-bingo-gray-100 p-2.5 text-[11px]">
            <div className="flex items-center justify-between mb-0.5">
              <span className="font-bold text-bingo-charcoal">{c.date}</span>
              <span className={cn("font-mono tabular-nums", c.outcome === "ענה" ? "text-bingo-green-dark" : "text-status-red")}>{c.duration}</span>
            </div>
            <div className="text-bingo-gray-600">{c.note}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-bingo-gray-600">{label}</span>
      <span className={cn("font-bold tabular-nums", highlight ? "text-bingo-green-dark" : "text-bingo-black")}>{value}</span>
    </div>
  );
}

function ActionBtn({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <button className="h-12 rounded-xl bg-white border border-bingo-gray-200 hover:bg-bingo-green hover:text-bingo-black hover:border-bingo-green text-bingo-charcoal text-[12px] font-bold inline-flex items-center justify-center gap-1.5 transition">
      {icon}
      {label}
    </button>
  );
}
