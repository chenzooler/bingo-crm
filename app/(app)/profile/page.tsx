"use client";
import * as React from "react";
import { Avatar } from "@/components/ui/Avatar";
import { Field } from "@/components/ui/Field";
import { User, Shield, Bell, Palette, Phone, Key, Camera } from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
  { key: "info", label: "פרטים אישיים", icon: <User className="size-4" /> },
  { key: "security", label: "אבטחה ו-2FA", icon: <Shield className="size-4" /> },
  { key: "notifications", label: "התראות", icon: <Bell className="size-4" /> },
  { key: "appearance", label: "מראה", icon: <Palette className="size-4" /> },
  { key: "phone", label: "טלפון אישי", icon: <Phone className="size-4" /> },
];

export default function ProfilePage() {
  const [tab, setTab] = React.useState("info");

  return (
    <div className="max-w-[1100px] space-y-4">
      <div className="flex items-center gap-4">
        <Avatar name="חן צולר" emoji="💼" size="lg" className="size-20 text-xl" />
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-bingo-gray-500">פרופיל אישי</div>
          <h1 className="text-3xl sm:text-[34px] font-black tracking-tight text-bingo-black leading-none">חן צולר</h1>
          <div className="text-sm text-bingo-gray-600 mt-0.5">בעלים · משתמש #12394</div>
        </div>
      </div>

      <div className="flex items-center gap-1 bg-white border border-bingo-gray-200 rounded-2xl p-1 bingo-shadow-sm w-fit overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn("h-9 px-3 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 transition shrink-0", tab === t.key ? "bg-bingo-black text-white" : "text-bingo-charcoal hover:bg-bingo-gray-100")}
          >
            {t.icon}{t.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-3xl border border-bingo-gray-200 bingo-shadow-sm p-6">
        {tab === "info" && (
          <div className="space-y-4 max-w-xl">
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-bingo-gray-100">
              <Avatar name="חן צולר" emoji="💼" size="lg" />
              <button className="h-9 px-3 rounded-xl bg-bingo-gray-100 hover:bg-bingo-gray-200 text-bingo-charcoal text-xs font-bold inline-flex items-center gap-1.5">
                <Camera className="size-3.5" /> החלף תמונה
              </button>
            </div>
            <Field label="שם מלא" defaultValue="חן צולר" />
            <Field label="אימייל" type="email" dir="ltr" defaultValue="chen@bingoisrael.co.il" />
            <Field label="טלפון" dir="ltr" defaultValue="050-1234567" />
            <Field label="כתובת חתימת מייל" defaultValue="חן צולר · בעלים · בינגו ישראל" />
            <div className="pt-3 flex items-center justify-end gap-2">
              <button className="h-10 px-4 rounded-xl bg-bingo-gray-100 text-bingo-charcoal text-sm font-bold hover:bg-bingo-gray-200">ביטול</button>
              <button className="h-10 px-5 rounded-xl bg-bingo-black text-white text-sm font-bold hover:bg-bingo-charcoal">שמור</button>
            </div>
          </div>
        )}

        {tab === "security" && (
          <div className="space-y-4 max-w-xl">
            <h3 className="text-base font-extrabold text-bingo-black mb-3">סיסמה</h3>
            <Field label="סיסמה נוכחית" type="password" />
            <Field label="סיסמה חדשה" type="password" />
            <Field label="אימות סיסמה חדשה" type="password" />
            <button className="h-10 px-5 rounded-xl bg-bingo-black text-white text-sm font-bold hover:bg-bingo-charcoal">שנה סיסמה</button>

            <hr className="my-6 border-bingo-gray-100" />

            <h3 className="text-base font-extrabold text-bingo-black mb-3 inline-flex items-center gap-2"><Key className="size-4" /> אימות דו-שלבי (2FA)</h3>
            <div className="rounded-2xl bg-status-orange-soft/40 border border-status-orange/30 p-4 mb-3">
              <div className="font-bold text-orange-700 mb-1">2FA לא פעיל</div>
              <p className="text-[13px] text-bingo-charcoal">להגנה מקסימלית, מומלץ לאפס. נדרש Google Authenticator או אפליקציה דומה.</p>
            </div>
            <button className="h-10 px-5 rounded-xl bg-bingo-green text-bingo-black text-sm font-bold hover:bg-bingo-green-bright">הפעל 2FA</button>
          </div>
        )}

        {tab === "notifications" && (
          <div className="space-y-2 max-w-2xl">
            <h3 className="text-base font-extrabold text-bingo-black mb-3">העדפות התראה</h3>
            {[
              ["ליד חדש שמשויך אלי", true, true, true],
              ["שיחה נכנסת מלקוח", true, false, false],
              ["WhatsApp חדש מלקוח", true, true, false],
              ["משימה באיחור", true, true, true],
              ["אישור הלוואה", true, true, true],
              ["חתימת חוזה הושלמה", true, false, false],
              ["שיחה הוקלטה ונותחה", false, false, false],
              ["דוח שבועי", false, true, false],
              ["התראה ממנהל", true, true, true],
            ].map(([label, app, email, sms], i) => (
              <div key={i} className="flex items-center justify-between gap-3 p-3 rounded-xl border border-bingo-gray-100 hover:bg-bingo-gray-50">
                <span className="text-[13px] font-bold text-bingo-charcoal">{label as string}</span>
                <div className="flex items-center gap-3 text-[11px]">
                  <Toggle label="App" defaultChecked={app as boolean} />
                  <Toggle label="Email" defaultChecked={email as boolean} />
                  <Toggle label="SMS" defaultChecked={sms as boolean} />
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "appearance" && (
          <div className="space-y-5 max-w-2xl">
            <div>
              <h3 className="text-base font-extrabold text-bingo-black mb-3">מצב צבע</h3>
              <div className="grid grid-cols-3 gap-2">
                {["light", "dark", "auto"].map((m) => (
                  <button key={m} className={cn("h-20 rounded-2xl border-2 text-xs font-bold inline-flex flex-col items-center justify-center gap-1.5",
                    m === "light" ? "bg-white border-bingo-green text-bingo-black" : "bg-bingo-gray-50 border-bingo-gray-200"
                  )}>
                    <span className="size-7 rounded-full" style={{ background: m === "light" ? "#fff" : m === "dark" ? "#000" : "linear-gradient(135deg,#fff 50%,#000 50%)" }} />
                    {m === "light" ? "בהיר" : m === "dark" ? "כהה" : "אוטומטי"}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-base font-extrabold text-bingo-black mb-3">צפיפות תצוגה</h3>
              <div className="grid grid-cols-3 gap-2">
                {["compact", "comfortable", "spacious"].map((d) => (
                  <button key={d} className={cn("h-12 rounded-xl border-2 text-xs font-bold",
                    d === "comfortable" ? "bg-bingo-green/15 border-bingo-green text-bingo-green-dark" : "bg-white border-bingo-gray-200"
                  )}>{d === "compact" ? "צפוף" : d === "comfortable" ? "נוח" : "מרווח"}</button>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === "phone" && (
          <div className="space-y-4 max-w-xl">
            <div className="rounded-2xl bg-gradient-to-bl from-emerald-50 to-white border border-emerald-200 p-5">
              <h3 className="text-base font-extrabold text-bingo-black mb-2 inline-flex items-center gap-2">📱 WhatsApp אישי</h3>
              <p className="text-[12px] text-bingo-gray-600 mb-3">
                לדיבור עם <strong>גופי מימון</strong> (לא לקוחות). מנהלים יוכלו לראות.
                <br />הסבר: ה-WATI שלנו מיועד ללקוחות. כאן את/ה מחבר את ה-WhatsApp האישי שלך כדי לנהל קבוצות עם בנקים וגופי מימון.
              </p>
              <button className="h-10 px-4 rounded-xl bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700">
                סרוק QR לחיבור WhatsApp Web
              </button>
            </div>
            <div className="rounded-2xl bg-white border border-bingo-gray-200 p-4">
              <h3 className="text-sm font-extrabold text-bingo-black mb-2">📞 שלוחה במרכזיה</h3>
              <Field label="שלוחה" dir="ltr" defaultValue="2107" />
              <p className="text-[11px] text-bingo-gray-500 mt-2">מספר השלוחה במרכזית הקול מרקר. משמש לחיוג מהמערכת.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Toggle({ label, defaultChecked }: { label: string; defaultChecked?: boolean }) {
  const [on, setOn] = React.useState(defaultChecked);
  return (
    <label className="inline-flex items-center gap-1 cursor-pointer">
      <span className="font-bold text-bingo-gray-600">{label}</span>
      <button
        onClick={() => setOn(!on)}
        className={cn("relative h-5 w-9 rounded-full transition", on ? "bg-bingo-green" : "bg-bingo-gray-200")}
      >
        <span className={cn("absolute top-0.5 size-4 rounded-full bg-white transition", on ? "right-0.5" : "right-4")} />
      </button>
    </label>
  );
}
