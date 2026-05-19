import { notFound } from "next/navigation";
import { Wrench } from "lucide-react";

const SECTIONS: Record<string, { title: string; group: string; description: string }> = {
  teams: { title: "צוותים", group: "ארגון", description: "הגדרת צוותים, ניהול שיוך נציגים ומבנה היררכי" },
  sources: { title: "מקורות לידים", group: "זרימת עבודה", description: "ניהול מקורות (Facebook, TikTok, ספקי לידים) ו-UTM tracking" },
  "loan-purposes": { title: "מטרות הלוואה", group: "זרימת עבודה", description: "ניהול הקטגוריות שהלקוח בוחר בעת מילוי טופס" },
  automations: { title: "אוטומציות", group: "זרימת עבודה", description: "חוקי ניתוב אוטומטי, drip campaigns, triggers" },
  sla: { title: "SLA והסלמות", group: "זרימת עבודה", description: "הגדרת זמני תגובה מקסימליים והסלמה אוטומטית" },
  forms: { title: "טפסים והסכמים", group: "גופי מימון", description: "תבניות חוזים, הסכמי התקשרות, חתימה דיגיטלית" },
  webhooks: { title: "Webhooks", group: "תקשורת", description: "Webhooks יוצאים ונכנסים - שלוט באירועי המערכת" },
  bonus: { title: "בונוסים ויעדים", group: "פיננסי", description: "סכמי בונוסים, יעדים יומיים וחודשיים לנציגים" },
  pricing: { title: "תמחור שכ״ט", group: "פיננסי", description: "אחוזי שכר טרחה, מינימום, מקסימום, לפי סוג הלוואה" },
  security: { title: "אבטחה והרשאות", group: "מערכת", description: "2FA, IP whitelist, מדיניות סיסמאות" },
  "audit-log": { title: "Audit Log", group: "מערכת", description: "תיעוד מלא של פעולות המערכת" },
};

export default async function SettingsSectionPage({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  const meta = SECTIONS[section];
  if (!meta) notFound();

  return (
    <div className="bg-white rounded-3xl border border-bingo-gray-200 bingo-shadow-sm p-6 sm:p-10">
      <div className="flex items-center gap-3 mb-5">
        <div className="size-12 rounded-2xl bg-gradient-to-bl from-bingo-green/15 to-bingo-green/5 border border-bingo-green/30 inline-flex items-center justify-center">
          <Wrench className="size-5 text-bingo-green-dark" />
        </div>
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-bingo-gray-500">{meta.group}</div>
          <h2 className="text-xl font-extrabold text-bingo-black">{meta.title}</h2>
          <p className="text-[12px] text-bingo-gray-600 mt-0.5">{meta.description}</p>
        </div>
      </div>

      <div className="rounded-2xl bg-gradient-to-bl from-status-blue-soft/60 to-status-blue-soft/20 border border-status-blue/20 p-5">
        <div className="text-[12px] font-extrabold text-status-blue mb-1">בקרוב</div>
        <p className="text-[13px] text-bingo-charcoal leading-relaxed">
          המסך הזה יאפשר לך לנהל את <strong>{meta.title}</strong> ישירות מהממשק - ללא קוד, ללא DBA, ללא מתח.
          התוכן יוכן בעת חיבור ה-DB ומיגרציה מ-יועצים.
        </p>
        <div className="mt-3 flex items-center gap-1.5">
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-status-blue bg-status-blue/15 rounded-full px-2 py-0.5">
            Phase 2
          </span>
          <span className="text-[10px] text-bingo-gray-500">ראה את המפרט המלא ב-/docs/strategy</span>
        </div>
      </div>
    </div>
  );
}
