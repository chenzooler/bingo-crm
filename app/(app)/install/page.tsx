"use client";
import * as React from "react";
import {
  Smartphone, Apple, Globe, Share, Plus, Download, Sparkles,
  CheckCircle2, Copy, Zap, Bell, WifiOff, Rocket, QrCode,
} from "lucide-react";
import { cn } from "@/lib/utils";

const PROD_URL = "https://crm.bingoisrael.co.il";

export default function InstallPage() {
  const [copied, setCopied] = React.useState(false);
  const [tab, setTab] = React.useState<"ios" | "android" | "desktop">("ios");
  const [isStandalone, setIsStandalone] = React.useState(false);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as { standalone?: boolean }).standalone === true;
    setIsStandalone(standalone);

    // Auto-detect tab
    const ua = navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(ua)) setTab("ios");
    else if (/android/.test(ua)) setTab("android");
    else setTab("desktop");
  }, []);

  function copyLink() {
    navigator.clipboard.writeText(PROD_URL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  // QR code via free API (in production use a self-hosted SVG generator)
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(PROD_URL)}&color=292929&bgcolor=FAFAF9&margin=4`;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-bingo-black via-[#1a1a1a] to-[#2a2a2a] text-white p-6 md:p-10">
        <div className="absolute -top-20 -right-20 size-72 rounded-full bg-bingo-green/30 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 size-72 rounded-full bg-bingo-green/15 blur-3xl pointer-events-none" />

        <div className="relative grid md:grid-cols-2 gap-6 items-center">
          <div>
            <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-bingo-green bg-bingo-green/15 border border-bingo-green/30 rounded-full px-3 py-1 mb-4">
              <Sparkles className="size-3" />
              אפליקציית BINGO
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-3 leading-tight">
              התקן את BINGO CRM
              <br />
              <span className="text-bingo-green">בטלפון שלך</span>
            </h1>
            <p className="text-white/70 text-sm md:text-base leading-relaxed mb-6 max-w-md">
              גישה מיידית, התראות בזמן אמת, עבודה גם offline. אפליקציה מלאה — בלי להוריד מ-App Store.
            </p>

            {/* Benefits */}
            <div className="grid grid-cols-2 gap-2 mb-6">
              <Benefit icon={<Zap className="size-4" />} text="פתיחה מיידית" />
              <Benefit icon={<Bell className="size-4" />} text="התראות חיות" />
              <Benefit icon={<WifiOff className="size-4" />} text="עובד offline" />
              <Benefit icon={<Rocket className="size-4" />} text="חוויה native" />
            </div>

            {/* URL + copy */}
            <div className="flex items-center gap-2 bg-white/10 border border-white/20 rounded-xl p-1 max-w-md">
              <div className="flex-1 font-mono text-[12px] text-white/80 px-2 truncate" dir="ltr">
                {PROD_URL}
              </div>
              <button
                onClick={copyLink}
                className={cn(
                  "h-8 px-3 rounded-lg text-[11px] font-bold inline-flex items-center gap-1 transition",
                  copied
                    ? "bg-bingo-green text-bingo-black"
                    : "bg-white text-bingo-black hover:bg-bingo-cream"
                )}
              >
                {copied ? <CheckCircle2 className="size-3.5" /> : <Copy className="size-3.5" />}
                {copied ? "הועתק!" : "העתק"}
              </button>
            </div>
          </div>

          {/* QR Code */}
          <div className="flex flex-col items-center justify-center">
            <div className="bg-bingo-cream rounded-3xl p-4 bingo-shadow-lg">
              <img
                src={qrUrl}
                alt="QR Code"
                className="size-60 md:size-72"
                loading="lazy"
              />
              <div className="text-center mt-2 text-[11px] font-bold text-bingo-black inline-flex items-center gap-1.5 justify-center w-full">
                <QrCode className="size-3.5" />
                סרוק לפתיחה מיידית
              </div>
            </div>
          </div>
        </div>
      </div>

      {isStandalone && (
        <div className="rounded-2xl bg-bingo-green/15 border-2 border-bingo-green/40 px-5 py-4 flex items-center gap-3">
          <div className="size-10 rounded-xl bg-bingo-green text-bingo-black inline-flex items-center justify-center">
            <CheckCircle2 className="size-5" />
          </div>
          <div>
            <div className="text-sm font-extrabold text-bingo-black">האפליקציה כבר מותקנת! 🎉</div>
            <div className="text-[11px] text-bingo-charcoal">אתה משתמש בגרסת ה-PWA המלאה כרגע</div>
          </div>
        </div>
      )}

      {/* Platform tabs */}
      <div className="surface-card-elevated overflow-hidden">
        <div className="px-3 py-2 border-b border-bingo-gray-150 flex items-center gap-1 overflow-x-auto">
          <TabBtn active={tab === "ios"} onClick={() => setTab("ios")} icon={<Apple className="size-3.5" />} label="iPhone / iPad" />
          <TabBtn active={tab === "android"} onClick={() => setTab("android")} icon={<Smartphone className="size-3.5" />} label="Android" />
          <TabBtn active={tab === "desktop"} onClick={() => setTab("desktop")} icon={<Globe className="size-3.5" />} label="מחשב" />
        </div>
        <div className="p-5">
          {tab === "ios" && <IOSInstructions />}
          {tab === "android" && <AndroidInstructions />}
          {tab === "desktop" && <DesktopInstructions />}
        </div>
      </div>

      {/* Share with team */}
      <div className="surface-card-elevated p-5 md:p-6">
        <h2 className="text-lg font-extrabold text-bingo-black mb-1 inline-flex items-center gap-2">
          <Share className="size-4 text-bingo-green-dark" />
          שלח לצוות שלך
        </h2>
        <p className="text-[12px] text-bingo-gray-600 mb-4">
          העתק את ההודעה ושלח בקבוצת ה-WhatsApp של הצוות:
        </p>
        <ShareMessage />
      </div>

      {/* Tech info */}
      <div className="grid md:grid-cols-3 gap-3">
        <InfoCard
          icon={<Sparkles className="size-5" />}
          title="ללא App Store"
          desc="האפליקציה מתקינה ישירות מהדפדפן. אין צורך באישור Apple/Google ואין עמלות."
        />
        <InfoCard
          icon={<Download className="size-5" />}
          title="עדכון אוטומטי"
          desc="כל פעם שאנחנו משחררים פיצ'ר חדש — האפליקציה מתעדכנת אוטומטית בכל הצוות."
        />
        <InfoCard
          icon={<WifiOff className="size-5" />}
          title="עובד גם offline"
          desc="המידע נשמר במכשיר. תוכל לעבוד גם בלי חיבור לאינטרנט ולסנכרן אחר כך."
        />
      </div>
    </div>
  );
}

function Benefit({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-white/90">
      <div className="size-7 rounded-lg bg-bingo-green/20 text-bingo-green inline-flex items-center justify-center shrink-0">
        {icon}
      </div>
      <span className="font-medium">{text}</span>
    </div>
  );
}

function TabBtn({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "h-9 px-4 rounded-lg text-[13px] font-bold inline-flex items-center gap-2 transition whitespace-nowrap",
        active ? "bg-bingo-black text-white bingo-shadow-sm" : "text-bingo-charcoal hover:bg-bingo-gray-100"
      )}
    >
      {icon}
      {label}
    </button>
  );
}

function IOSInstructions() {
  return (
    <div className="space-y-3">
      <p className="text-[13px] text-bingo-charcoal mb-4">
        ב-iPhone או iPad, פתח את האתר ב-<strong>Safari</strong> (לא Chrome!) ובצע 3 שלבים:
      </p>
      <Step
        num={1}
        title="לחץ על כפתור השיתוף"
        desc={<>בתחתית המסך, לחץ על האייקון של השיתוף <Share className="inline size-3.5" /> (מרובע עם חץ למעלה)</>}
      />
      <Step
        num={2}
        title='בחר "הוסף למסך הבית"'
        desc={<>גלול ברשימה ובחר <strong>"הוסף למסך הבית"</strong> <Plus className="inline size-3.5" /></>}
      />
      <Step
        num={3}
        title='לחץ "הוסף"'
        desc='בפינה הימנית העליונה. האייקון של BINGO יופיע על מסך הבית שלך.'
      />
      <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 mt-4 flex items-start gap-2">
        <Apple className="size-4 text-amber-700 mt-0.5 shrink-0" />
        <div className="text-[11px] text-amber-800">
          <strong>חשוב:</strong> חייב להיות Safari. אם פתחת באפליקציה אחרת (WhatsApp, Chrome) — העתק את הקישור וצור Safari חדש.
        </div>
      </div>
    </div>
  );
}

function AndroidInstructions() {
  return (
    <div className="space-y-3">
      <p className="text-[13px] text-bingo-charcoal mb-4">
        ב-Android, פתח ב-<strong>Chrome</strong> ובצע 2 שלבים:
      </p>
      <Step
        num={1}
        title='לחץ "התקן" בהתראה'
        desc='Chrome מציג אוטומטית באנר "התקן את BINGO" בתחתית המסך. לחץ "התקן".'
      />
      <Step
        num={2}
        title="אישור התקנה"
        desc='לחץ "התקן" שוב. האפליקציה מותקנת בשניות והאייקון נוסף למגירת האפליקציות.'
      />
      <div className="rounded-xl bg-blue-50 border border-blue-200 px-4 py-3 mt-4 flex items-start gap-2">
        <Globe className="size-4 text-blue-700 mt-0.5 shrink-0" />
        <div className="text-[11px] text-blue-800">
          <strong>לא רואה את הבאנר?</strong> פתח את התפריט (⋮) של Chrome ובחר <strong>"התקן את האפליקציה"</strong>
        </div>
      </div>
    </div>
  );
}

function DesktopInstructions() {
  return (
    <div className="space-y-3">
      <p className="text-[13px] text-bingo-charcoal mb-4">
        במחשב, פתח ב-<strong>Chrome</strong> או <strong>Edge</strong>:
      </p>
      <Step
        num={1}
        title="חפש את אייקון ההתקנה"
        desc={<>בסרגל הכתובת, מימין, יש אייקון מחשב קטן <Download className="inline size-3.5" />. לחץ עליו.</>}
      />
      <Step
        num={2}
        title='לחץ "התקן"'
        desc='האפליקציה תיפתח בחלון משלה — בדיוק כמו תוכנה מותקנת.'
      />
      <Step
        num={3}
        title="הצמד לטסקבר"
        desc="לחץ קליק ימני על האייקון ובחר 'הצמד לסרגל המשימות' לגישה מהירה."
      />
    </div>
  );
}

function Step({ num, title, desc }: { num: number; title: string; desc: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <div className="size-8 rounded-xl bg-bingo-green/15 text-bingo-green-dark inline-flex items-center justify-center font-black tabular-nums text-sm shrink-0 mt-0.5">
        {num}
      </div>
      <div className="flex-1">
        <div className="text-[13px] font-extrabold text-bingo-black">{title}</div>
        <div className="text-[12px] text-bingo-gray-600 leading-relaxed mt-0.5">{desc}</div>
      </div>
    </div>
  );
}

function InfoCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="surface-card-elevated p-4">
      <div className="size-10 rounded-xl bg-bingo-green/12 text-bingo-green-dark inline-flex items-center justify-center mb-2">
        {icon}
      </div>
      <div className="text-[13px] font-extrabold text-bingo-black mb-1">{title}</div>
      <div className="text-[11px] text-bingo-gray-600 leading-relaxed">{desc}</div>
    </div>
  );
}

function ShareMessage() {
  const message = `🎯 BINGO CRM החדש זמין כאפליקציה!

✨ פתיחה מיידית מהמסך הבית
🔔 התראות בזמן אמת
📱 עובד גם בלי אינטרנט
🤖 BINGO AI לעזרה בכל שלב

👇 התקן עכשיו (לוקח 30 שניות):
${PROD_URL}

חידוש: עכשיו במקום לפתוח את הדפדפן — פותחים את BINGO ישר ממסך הבית של הטלפון!`;

  const [copied, setCopied] = React.useState(false);

  function copy() {
    navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div>
      <div className="bg-bingo-gray-50 rounded-xl p-4 text-[12px] text-bingo-charcoal whitespace-pre-wrap leading-relaxed font-medium border border-bingo-gray-200 mb-3">
        {message}
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={copy}
          className={cn(
            "h-10 px-4 rounded-xl text-[12px] font-bold inline-flex items-center gap-2 transition",
            copied
              ? "bg-bingo-green text-bingo-black"
              : "bg-bingo-black text-white hover:bg-bingo-charcoal"
          )}
        >
          {copied ? <CheckCircle2 className="size-4" /> : <Copy className="size-4" />}
          {copied ? "ההודעה הועתקה!" : "העתק הודעה"}
        </button>
        <a
          href={`https://wa.me/?text=${encodeURIComponent(message)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="h-10 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-[12px] font-bold inline-flex items-center gap-2 transition"
        >
          📱 שלח ב-WhatsApp
        </a>
      </div>
    </div>
  );
}
