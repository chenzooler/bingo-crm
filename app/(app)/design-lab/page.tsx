"use client";

/**
 * Design Lab — עמוד QA פנימי לשכבת Premium v2 (אין קישור בניווט).
 * גישה ישירה: /design-lab
 * מציג: חומרים · רמזור בכל הגדלים והמצבים · GlassIcon · תנועה.
 */

import { useState } from "react";
import {
  Phone,
  FileText,
  Landmark,
  Car,
  ShieldCheck,
  Sparkles,
  Wallet,
  CalendarDays,
} from "lucide-react";
import { Ramzor, type RamzorValue } from "@/components/ui/Ramzor";
import { GlassIcon } from "@/components/ui/GlassIcon";

const TINTS = [
  { cls: "b-tint-mint", name: "מנטה", use: "סינון, הצלחות" },
  { cls: "b-tint-sky", name: "תכלת", use: "בנק, המתנות" },
  { cls: "b-tint-peach", name: "אפרסק", use: "מסלול רכב" },
  { cls: "b-tint-lilac", name: "לילך", use: "גופי מימון, רמזור" },
  { cls: "b-tint-rose", name: "ורדרד", use: "כספים" },
  { cls: "b-tint-sand", name: "חול", use: "רקעים ניטרליים" },
];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4">
      <h2 className="text-title-2">{title}</h2>
      {children}
    </section>
  );
}

export default function DesignLabPage() {
  const [rzValue, setRzValue] = useState<RamzorValue | null>(null);
  const [rzState, setRzState] = useState<"idle" | "scanning">("idle");
  const [manual, setManual] = useState<RamzorValue | null>("green");
  const [springKey, setSpringKey] = useState(0);

  function runScan(result: RamzorValue) {
    setRzValue(null);
    setRzState("scanning");
    setTimeout(() => {
      setRzState("idle");
      setRzValue(result);
    }, 1900);
  }

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-24">
      <header className="pt-4">
        <span className="b-eyebrow">Premium v2 · Design Lab</span>
        <h1 className="text-title-1 mt-1">שפת החומרים והתנועה — משטח QA</h1>
        <p className="text-callout mt-2">
          עמוד פנימי בלבד. כל מה שמופיע כאן הוא ה-API שצוות הקוקפיט בונה עליו.
        </p>
      </header>

      {/* ---------- חומרים ---------- */}
      <Section title="חומרים">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="b-glass rounded-[22px] p-5">
            <span className="b-eyebrow">.b-glass</span>
            <h3 className="text-headline mt-2">זכוכית חלבית</h3>
            <p className="text-callout mt-1">blur + שקיפות + גבול-שיער בהיר</p>
          </div>
          <div className="b-obsidian rounded-[22px] p-5">
            <span className="text-[11px] font-bold tracking-wider opacity-70">.b-obsidian</span>
            <h3 className="text-[15px] font-semibold mt-2">אבסידיאן בינגו</h3>
            <p className="text-[13px] opacity-70 mt-1">הבמה הכהה — העוגן של הפסטלים</p>
          </div>
          <div className="b-tint-lilac rounded-[22px] p-5 border border-bingo-gray-150">
            <span className="b-eyebrow">.b-tint-*</span>
            <h3 className="text-headline mt-2">פסטל עם נשימה</h3>
            <p className="text-callout mt-1">גרדיאנט עדין, לא צבע שטוח</p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {TINTS.map((t) => (
            <div key={t.cls} className="b-card overflow-hidden">
              <div className={`${t.cls} h-14`} />
              <div className="p-3">
                <div className="text-[12.5px] font-bold">{t.name}</div>
                <div className="text-[11px] text-bingo-gray-500 mt-0.5" dir="ltr">.{t.cls}</div>
                <div className="text-[11px] text-bingo-gray-500">{t.use}</div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* ---------- רמזור ---------- */}
      <Section title="Ramzor — הרמזור">
        <div className="b-card p-6">
          <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-8 items-center">
            <Ramzor value={rzValue} state={rzState} size="lg" />
            <div>
              <div className="b-glass rounded-[18px] p-4 text-[15px] font-semibold leading-relaxed">
                &quot;לפני שנמשיך אני צריך את האישור שלך: האם את/ה מאשר/ת לי לבצע
                בדיקה על נתוני האשראי שלך במאגר?&quot;
              </div>
              <div className="flex flex-wrap gap-2 mt-4">
                <button className="b-pill b-pill-green b-lift" onClick={() => runScan(["green", "green", "orange", "red"][Math.floor(Math.random() * 4)] as RamzorValue)} disabled={rzState === "scanning"}>
                  הלקוח אישר — הפעל בדיקה
                </button>
                <button className="b-pill b-pill-ghost b-pill-sm" onClick={() => runScan("green")}>הדמה: ירוק</button>
                <button className="b-pill b-pill-ghost b-pill-sm" onClick={() => runScan("orange")}>הדמה: כתום</button>
                <button className="b-pill b-pill-ghost b-pill-sm" onClick={() => runScan("red")}>הדמה: אדום</button>
              </div>
              <p className="text-callout mt-3">
                {rzState === "scanning"
                  ? "מריץ בדיקה מול המאגר…"
                  : rzValue
                    ? `תוצאה: ${rzValue === "green" ? "ירוק — ממשיכים" : rzValue === "orange" ? "כתום — מסלול רכב" : "אדום — פרידה מכובדת"}`
                    : "ממתין להקראה ולאישור הלקוח"}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="b-card p-5 flex flex-col items-center gap-3">
            <span className="b-eyebrow">sm · אופקי · צ'יפ כותרת</span>
            <div className="flex items-center gap-3">
              <Ramzor value="green" size="sm" orientation="horizontal" />
              <Ramzor value="orange" size="sm" orientation="horizontal" />
              <Ramzor value={null} size="sm" orientation="horizontal" />
            </div>
          </div>
          <div className="b-card p-5 flex flex-col items-center gap-3">
            <span className="b-eyebrow">md · אנכי</span>
            <div className="flex items-start gap-4">
              <Ramzor value="red" size="md" />
              <Ramzor value={null} size="md" state="scanning" />
            </div>
          </div>
          <div className="b-card p-5 flex flex-col items-center gap-3">
            <span className="b-eyebrow">md · בחירה ידנית (onSelect)</span>
            <Ramzor value={manual} size="md" orientation="horizontal" onSelect={setManual} />
            <p className="text-callout">נבחר: {manual ?? "—"} · נגיש מקלדת (Tab + Enter)</p>
          </div>
        </div>
      </Section>

      {/* ---------- GlassIcon ---------- */}
      <Section title="GlassIcon — צ'יפ אייקון זכוכית">
        <div className="b-card p-6 flex flex-wrap items-center gap-4">
          <GlassIcon icon={Phone} />
          <GlassIcon icon={FileText} />
          <GlassIcon icon={Landmark} tone="blue" />
          <GlassIcon icon={Car} tone="blue" />
          <GlassIcon icon={ShieldCheck} tone="green" />
          <GlassIcon icon={Sparkles} tone="green" />
          <GlassIcon icon={Wallet} size={52} tone="green" />
          <GlassIcon icon={CalendarDays} size={28} />
          <span className="text-callout">
            tone: default / green / blue · size: 28 / 38 (ברירת מחדל) / 52
          </span>
        </div>
        <div className="b-tint-mint rounded-[22px] p-6 flex items-center gap-4 border border-bingo-gray-150">
          <GlassIcon icon={ShieldCheck} tone="green" label="בדיקת סינון" />
          <div>
            <h3 className="text-headline">כך זה יושב על פסטל</h3>
            <p className="text-callout">הזכוכית קוראת את הרקע שמתחתיה</p>
          </div>
        </div>
      </Section>

      {/* ---------- תנועה ---------- */}
      <Section title="תנועה — הקפיץ של בינגו">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="b-card p-5">
            <span className="b-eyebrow">.b-lift</span>
            <div className="mt-3 flex flex-wrap gap-2">
              <button className="b-pill b-pill-dark b-lift">ריחוף = הזמנה</button>
              <button className="b-pill b-pill-ghost b-lift">גם אני</button>
            </div>
            <p className="text-callout mt-3" dir="ltr">hover -2px · active scale(.96) · 180ms spring</p>
          </div>
          <div className="b-card p-5">
            <span className="b-eyebrow">.b-spring-in</span>
            <div className="mt-3 space-y-2">
              <div key={springKey} className="b-spring-in b-tint-sky rounded-[14px] p-3 text-[13px] font-semibold">
                נכנסתי עם הקפיץ של בינגו
              </div>
              <button className="b-pill b-pill-ghost b-pill-sm" onClick={() => setSpringKey((k) => k + 1)}>
                הפעל שוב
              </button>
            </div>
            <p className="text-callout mt-3" dir="ltr">translateY(14px) → 0 · 450ms spring</p>
          </div>
          <div className="b-card p-5">
            <span className="b-eyebrow">.b-pulse-glow</span>
            <div className="mt-3 flex items-center gap-3">
              <span className="b-ball b-pulse-glow" style={{ width: 16, height: 16 }} />
              <span className="text-[13px] font-semibold">הילה — רק לרגעי אמת</span>
            </div>
            <p className="text-callout mt-3" dir="ltr">green glow ring · 1.5s · reduced-motion safe</p>
          </div>
        </div>
      </Section>
    </div>
  );
}
