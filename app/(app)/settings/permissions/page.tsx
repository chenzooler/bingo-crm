// הרשאות — מטריצת 9 רמות ההרשאה של Yoatsim (שכפול 1:1, תצוגה בלבד בשלב זה)
// מקור: docs/yoatsim-full-spec.md §5 · הנתונים: lib/yoatsim/permissions.ts
import Link from "next/link";
import { db } from "@/lib/db";
import {
  PERMISSION_PROFILES,
  ACCESS_LABELS,
  SCOPE_LABELS,
  profileByKey,
  type CardAccess,
  type PermissionProfile,
} from "@/lib/yoatsim/permissions";
import { Check, X, ShieldCheck } from "lucide-react";

export const dynamic = "force-dynamic";

/* תוויות קומפקטיות לטבלת ההשוואה */
const ACCESS_SHORT: Record<CardAccess, string> = {
  "none": "—",
  "view": "צפייה",
  "edit": "עריכה",
  "add-edit": "הוספה+עריכה",
  "add-edit-delete": "מלא",
};

function Bool({ value }: { value: boolean }) {
  return value ? (
    <span className="b-chip b-chip-green inline-flex items-center gap-1">
      <Check className="size-3" /> כן
    </span>
  ) : (
    <span className="b-chip b-chip-gray inline-flex items-center gap-1">
      <X className="size-3" /> לא
    </span>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2 border-b border-bingo-gray-100 last:border-0">
      <span className="text-[13px] font-bold text-bingo-charcoal">{label}</span>
      <span className="text-[13px] font-extrabold text-bingo-black text-left">{children}</span>
    </div>
  );
}

function MatrixCard({ title, tone, children }: { title: string; tone: string; children: React.ReactNode }) {
  return (
    <div className="b-card p-5">
      <div className="flex items-center gap-2.5 mb-3">
        <span className={`b-icon ${tone} !size-8 text-[13px]`}>
          <ShieldCheck className="size-4" />
        </span>
        <h3 className="text-[15px] font-extrabold text-bingo-black">{title}</h3>
      </div>
      {children}
    </div>
  );
}

/* שורות טבלת ההשוואה — ערך לכל פרופיל */
const COMPARISON_ROWS: { group: string; label: string; value: (p: PermissionProfile) => React.ReactNode }[] = [
  { group: "כרטיסים", label: "רמת גישה", value: (p) => ACCESS_SHORT[p.cards.access] },
  { group: "כרטיסים", label: "היקף", value: (p) => SCOPE_LABELS[p.cards.scope] },
  { group: "כרטיסים", label: "ספירה רק משוייכים", value: (p) => <BoolMark v={p.cards.countOnlyAssigned} /> },
  { group: "כרטיסים", label: "שחרור כרטיס נעול", value: (p) => <BoolMark v={p.cards.releaseLocked} /> },
  { group: "כרטיסים", label: "עדכון יוזר אחראי", value: (p) => <BoolMark v={p.cards.updateResponsible} /> },
  { group: "אנשי קשר", label: "גישה", value: (p) => ACCESS_SHORT[p.contacts.access] },
  { group: "אנשי קשר", label: "מייל", value: (p) => <BoolMark v={p.contacts.email} /> },
  { group: "אנשי קשר", label: "סמס", value: (p) => <BoolMark v={p.contacts.sms} /> },
  { group: "אנשי קשר", label: "ווטסאפ", value: (p) => <BoolMark v={p.contacts.whatsapp} /> },
  { group: "משימות", label: "גישה", value: (p) => ACCESS_SHORT[p.tasks.access] },
  { group: "משימות", label: "רק של היוזר", value: (p) => <BoolMark v={p.tasks.onlyOwn} /> },
  { group: "משימות", label: "כל השיחות", value: (p) => <BoolMark v={p.tasks.allCalls} /> },
  { group: "משימות", label: "כל הווטסאפ", value: (p) => <BoolMark v={p.tasks.allWhatsapp} /> },
  { group: "משימות", label: "חסימת \"בוצע\"", value: (p) => <BoolMark v={p.tasks.blockDone} /> },
  { group: "משימות", label: "פרטיות", value: (p) => <BoolMark v={p.tasks.privacy} /> },
  { group: "מסמכים", label: "מסמכים חשבונאיים", value: (p) => ACCESS_SHORT[p.accountingDocs] },
  { group: "מסמכים", label: "טפסים", value: (p) => ACCESS_SHORT[p.forms] },
  { group: "מסמכים", label: "קבצים", value: (p) => ACCESS_SHORT[p.files] },
  { group: "מערכת", label: "הגדרות משתמשים", value: (p) => <BoolMark v={p.userSettings} /> },
  { group: "מערכת", label: "הודעות מתפרצות", value: (p) => <BoolMark v={p.broadcast} /> },
  { group: "מערכת", label: "מסכי הגדרות", value: (p) => <BoolMark v={p.settingsScreens} /> },
  { group: "מערכת", label: "חיפוש מתקדם", value: (p) => <BoolMark v={p.advancedSearch} /> },
  { group: "דוחות", label: "על כל הלקוחות", value: (p) => <BoolMark v={p.reports.allClients} /> },
  { group: "שעות פעילות", label: "התראה למייל", value: (p) => <BoolMark v={p.activityHours.emailAlert} /> },
  { group: "שעות פעילות", label: "חסימה מחוץ לשעות", value: (p) => <BoolMark v={p.activityHours.blockOutsideHours} /> },
];

function BoolMark({ v }: { v: boolean }) {
  return v ? (
    <Check className="size-3.5 text-bingo-green-deep inline" />
  ) : (
    <X className="size-3.5 text-bingo-gray-300 inline" />
  );
}

export default async function PermissionsPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string }>;
}) {
  const { role } = await searchParams;
  const profile = profileByKey(role ?? "") ?? profileByKey("main-manager")!;

  // ספירת משתמשים חיה לכל רמת הרשאה
  const grouped = await db.user.groupBy({
    by: ["permissionRole"],
    where: { active: true },
    _count: { _all: true },
  });
  const countByRole = new Map(grouped.map((g) => [g.permissionRole ?? "", g._count._all]));

  return (
    <div className="space-y-4">
      {/* כותרת */}
      <div className="b-card p-5">
        <div className="b-eyebrow">ארגון</div>
        <h2 className="text-xl font-extrabold text-bingo-black flex items-center gap-2.5 flex-wrap">
          הרשאות
          <span className="b-chip b-chip-green">9 רמות הרשאה · שכפול Yoatsim</span>
        </h2>
        <p className="text-[12px] text-bingo-gray-600 mt-1">
          מטריצת ההרשאות המלאה מהמקור — תצוגה בלבד בשלב זה; עריכה תיפתח בשלב הבא.
        </p>

        {/* בורר תפקיד */}
        <div className="mt-4 flex flex-wrap gap-1.5">
          {PERMISSION_PROFILES.map((p) => {
            const selected = p.key === profile.key;
            const count = countByRole.get(p.key) ?? 0;
            return (
              <Link
                key={p.key}
                href={`/settings/permissions?role=${p.key}`}
                className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[12px] font-bold transition border-[1.5px] ${
                  selected
                    ? "bg-bingo-black text-white border-bingo-black"
                    : "bg-white text-bingo-charcoal border-bingo-gray-200 hover:border-bingo-gray-300"
                }`}
              >
                {p.name}
                <span
                  className={`inline-flex items-center justify-center min-w-5 h-5 px-1 rounded-full text-[10px] font-black ${
                    selected ? "bg-bingo-green text-bingo-black" : "bg-bingo-gray-100 text-bingo-gray-600"
                  }`}
                >
                  {count}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* המטריצה של הפרופיל הנבחר */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <MatrixCard title="כרטיסים" tone="b-icon-green">
          <Row label="רמת גישה">{ACCESS_LABELS[profile.cards.access]}</Row>
          <Row label="היקף">{SCOPE_LABELS[profile.cards.scope]}</Row>
          <Row label="ספירה במסך ראשי רק משוייכים"><Bool value={profile.cards.countOnlyAssigned} /></Row>
          <Row label="שחרור כרטיס נעול"><Bool value={profile.cards.releaseLocked} /></Row>
          <Row label="עדכון יוזר אחראי"><Bool value={profile.cards.updateResponsible} /></Row>
        </MatrixCard>

        <MatrixCard title="אנשי קשר" tone="b-icon-blue">
          <Row label="גישה">{ACCESS_LABELS[profile.contacts.access]}</Row>
          <Row label="מייל"><Bool value={profile.contacts.email} /></Row>
          <Row label="סמס"><Bool value={profile.contacts.sms} /></Row>
          <Row label="ווטסאפ"><Bool value={profile.contacts.whatsapp} /></Row>
        </MatrixCard>

        <MatrixCard title="משימות ופעילויות" tone="b-icon-orange">
          <Row label="גישה">{ACCESS_LABELS[profile.tasks.access]}</Row>
          <Row label="רק של היוזר"><Bool value={profile.tasks.onlyOwn} /></Row>
          <Row label="כל השיחות"><Bool value={profile.tasks.allCalls} /></Row>
          <Row label="כל הווטסאפ"><Bool value={profile.tasks.allWhatsapp} /></Row>
          <Row label="חסימת &quot;בוצע&quot;"><Bool value={profile.tasks.blockDone} /></Row>
          <Row label="פרטיות"><Bool value={profile.tasks.privacy} /></Row>
        </MatrixCard>

        <MatrixCard title="מסמכים · טפסים · קבצים" tone="b-icon-purple">
          <Row label="מסמכים חשבונאיים">{ACCESS_LABELS[profile.accountingDocs]}</Row>
          <Row label="טפסים">{ACCESS_LABELS[profile.forms]}</Row>
          <Row label="קבצים">{ACCESS_LABELS[profile.files]}</Row>
        </MatrixCard>

        <MatrixCard title="מערכת" tone="b-icon-gray">
          <Row label="הגדרות משתמשים"><Bool value={profile.userSettings} /></Row>
          <Row label="הודעות מתפרצות"><Bool value={profile.broadcast} /></Row>
          <Row label="מסכי הגדרות"><Bool value={profile.settingsScreens} /></Row>
          <Row label="חיפוש מתקדם"><Bool value={profile.advancedSearch} /></Row>
        </MatrixCard>

        <div className="space-y-4">
          <MatrixCard title="דוחות" tone="b-icon-red">
            <Row label="על כל הלקוחות"><Bool value={profile.reports.allClients} /></Row>
            <p className="text-[11px] text-bingo-gray-500 mt-2">ניתן להסתיר דוח ספציפי.</p>
          </MatrixCard>

          <MatrixCard title="שעות פעילות" tone="b-icon-dark">
            <Row label="התראה למייל"><Bool value={profile.activityHours.emailAlert} /></Row>
            <Row label="חסימה מחוץ לשעות"><Bool value={profile.activityHours.blockOutsideHours} /></Row>
          </MatrixCard>
        </div>
      </div>

      {/* טבלת השוואה — כל 9 הרמות במבט אחד */}
      <div className="b-card p-0 overflow-hidden">
        <div className="px-5 pt-5 pb-3">
          <h3 className="text-[15px] font-extrabold text-bingo-black">השוואת כל 9 הרמות</h3>
          <p className="text-[11px] text-bingo-gray-500 mt-0.5">כל ההרשאות המרכזיות, תפקיד מול תפקיד.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[11px] border-collapse min-w-[980px]">
            <thead>
              <tr className="border-y border-bingo-gray-100 bg-bingo-gray-50/60">
                <th className="sticky right-0 bg-bingo-gray-50 text-right px-4 py-2.5 font-black text-bingo-gray-500 uppercase tracking-wide text-[10px] whitespace-nowrap z-10 border-l border-bingo-gray-100">
                  הרשאה
                </th>
                {PERMISSION_PROFILES.map((p) => (
                  <th
                    key={p.key}
                    className={`px-3 py-2.5 font-extrabold whitespace-nowrap text-center ${
                      p.key === profile.key ? "text-bingo-black" : "text-bingo-gray-600"
                    }`}
                  >
                    <Link href={`/settings/permissions?role=${p.key}`} className="hover:underline">
                      {p.name}
                    </Link>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COMPARISON_ROWS.map((row, i) => {
                const groupStart = i === 0 || COMPARISON_ROWS[i - 1].group !== row.group;
                return (
                  <tr key={`${row.group}-${row.label}`} className={`border-b border-bingo-gray-100 last:border-0 ${groupStart && i > 0 ? "border-t-2 border-t-bingo-gray-200" : ""}`}>
                    <td className="sticky right-0 bg-white px-4 py-2 whitespace-nowrap z-10 border-l border-bingo-gray-100">
                      {groupStart && <span className="b-eyebrow !text-[9px] block">{row.group}</span>}
                      <span className="font-bold text-bingo-charcoal">{row.label}</span>
                    </td>
                    {PERMISSION_PROFILES.map((p) => (
                      <td
                        key={p.key}
                        className={`px-3 py-2 text-center whitespace-nowrap font-bold ${
                          p.key === profile.key ? "bg-bingo-green-light/40 text-bingo-black" : "text-bingo-gray-600"
                        }`}
                      >
                        {row.value(p)}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
