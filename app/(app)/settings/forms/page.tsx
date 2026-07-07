// טפסים — שכפול Yoatsim §2: שתי תבניות הטפסים מהמקור + טבלה חיה של כל
// הטפסים שנשלחו/נחתמו (SentForm). השליחה מסקשן "טפסים וקבצים" בכרטיס.
import Link from "next/link";
import { FileSignature } from "lucide-react";
import { db } from "@/lib/db";
import { FORM_TEMPLATES } from "@/lib/yoatsim/forms";
import SentFormsTable, { type SentFormListRow } from "@/components/settings/SentFormsTable";

export const dynamic = "force-dynamic";

export default async function FormsSettingsPage() {
  const forms = await db.sentForm.findMany({
    include: { lead: { select: { id: true, fullName: true } } },
    orderBy: { sentAt: "desc" },
  });

  const rows: SentFormListRow[] = forms.map((f) => ({
    id: f.id,
    templateName: f.templateName,
    status: f.status,
    sentAt: f.sentAt.toISOString(),
    signedAt: f.signedAt ? f.signedAt.toISOString() : null,
    lead: f.lead,
  }));

  const countByTemplate = new Map<string, number>();
  for (const f of forms) {
    countByTemplate.set(f.templateName, (countByTemplate.get(f.templateName) ?? 0) + 1);
  }

  return (
    <div className="space-y-4">
      <div className="b-card p-5">
        <div className="b-eyebrow">גופי מימון</div>
        <h2 className="text-xl font-extrabold text-bingo-black flex items-center gap-2.5 flex-wrap">
          טפסים
          <span className="b-chip b-chip-green">שכפול Yoatsim §1+§2</span>
        </h2>
        <p className="text-[12px] text-bingo-gray-600 mt-1">
          תבניות הטפסים מהמקור וכל הטפסים שנשלחו ללקוחות. שליחה לחתימה — מסקשן
          &quot;טפסים וקבצים&quot; בכרטיס הלקוח (סימולציה בשלב זה).
        </p>
      </div>

      {/* תבניות הטפסים */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {FORM_TEMPLATES.map((t) => (
          <div key={t.key} className="b-card !p-4 flex items-start gap-3">
            <span className="b-icon b-icon-green !size-10 shrink-0">
              <FileSignature className="size-4.5" />
            </span>
            <div className="min-w-0">
              <div className="text-[14px] font-extrabold text-bingo-black">{t.name}</div>
              <div className="text-[11.5px] text-bingo-gray-500 mt-0.5">{t.description}</div>
              <div className="mt-2">
                <span className="b-chip b-chip-gray tabular-nums text-[10.5px]">
                  נשלח {countByTemplate.get(t.name) ?? 0} פעמים
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* הטבלה החיה */}
      <SentFormsTable initial={rows} />

      <p className="text-[11px] text-bingo-gray-400">
        דף החתימה הציבורי ללקוח קיים ב-<Link href="/sign/1" className="font-bold text-bingo-blue hover:underline" dir="ltr">/sign/[leadId]</Link> — חיבור מלא בשלב הסנכרון.
      </p>
    </div>
  );
}
