import Link from "next/link";
import { ReactNode } from "react";

/**
 * שכפול יועצים 1:1 (החלטת חן 06/07/26): תפריט ההגדרות = בדיוק רשימת §2
 * מהאפיון, באותו סדר. "הרשאות" נכלל תחת ניהול משתמשים כמו במקור אך מקבל
 * שורה כדי שהמטריצה תהיה נגישה. תוספות בינגו הוסתרו — ראו NAV_HIDDEN למטה.
 */
const NAV = [
  { href: "/settings/users", label: "ניהול משתמשים", group: "הגדרות" },
  { href: "/settings/permissions", label: "הרשאות", group: "הגדרות" },
  { href: "/settings/fields", label: "הגדרת שדות", group: "הגדרות" },
  { href: "/settings/processes", label: "תהליכים וסטטוסים", group: "הגדרות" },
  { href: "/settings/leads-api", label: "קבלת לידים / API", group: "הגדרות" },
  { href: "/settings/landing-pages", label: "דפי נחיתה", group: "הגדרות" },
  { href: "/settings/action-templates", label: "תבניות פעולות/משימות/פגישות/כספים", group: "הגדרות" },
  { href: "/settings/templates", label: "תבניות סמס/ווטסאפ", group: "הגדרות" },
  { href: "/settings/templates?channel=email", label: "תבניות מיילים", group: "הגדרות" },
  { href: "/settings/forms", label: "טפסים", group: "הגדרות" },
  { href: "/settings/automations", label: "אוטומציות", group: "הגדרות" },
  { href: "/settings/whatsapp-bot", label: "בוט ווטסאפ", group: "הגדרות" },
  { href: "/settings/modules", label: "מודולים", group: "הגדרות" },
  { href: "/admin/import", label: "ייבוא", group: "הגדרות" },
];

// תוספות בינגו — מוסתרות במצב שכפול-יועצים; הדפים חיים ב-URL. להחזרה: להעביר ל-NAV.
export const NAV_HIDDEN = [
  { href: "/settings", label: "כללי" },
  { href: "/settings/teams", label: "צוותים" },
  { href: "/settings/lifecycle", label: "Lifecycle - שלבי ליד" },
  { href: "/settings/pipelines", label: "תהליכים וסטטוסים (מערכת ישנה)" },
  { href: "/settings/sources", label: "מקורות לידים" },
  { href: "/settings/loan-purposes", label: "מטרות הלוואה" },
  { href: "/settings/sla", label: "SLA והסלמות" },
  { href: "/settings/lenders", label: "גופי מימון" },
  { href: "/settings/numbers", label: "מספרי טלפון + ספאם" },
  { href: "/settings/integrations", label: "אינטגרציות" },
  { href: "/settings/webhooks", label: "Webhooks" },
  { href: "/settings/bonus", label: "בונוסים ויעדים" },
  { href: "/settings/pricing", label: "תמחור שכ\"ט" },
  { href: "/settings/security", label: "אבטחה והרשאות" },
  { href: "/settings/audit-log", label: "Audit Log" },
];

export default function SettingsLayout({ children }: { children: ReactNode }) {
  // Group nav by section
  const groups = NAV.reduce<Record<string, typeof NAV>>((acc, item) => {
    (acc[item.group] ||= []).push(item);
    return acc;
  }, {});

  return (
    <div className="max-w-[1400px]">
      <div className="mb-6">
        <h1 className="text-3xl sm:text-[34px] font-black tracking-tight text-bingo-black leading-none">
          הגדרות
          <span className="inline-block size-3 rounded-full bg-bingo-green ml-2 align-middle" />
        </h1>
        <p className="text-sm text-bingo-gray-600 mt-1.5">
          ניהול מערכת בינגו - תהליכים, אינטגרציות, צוות, ומדיניות.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <nav className="lg:col-span-3 space-y-4">
          {Object.entries(groups).map(([group, items]) => (
            <div key={group}>
              <div className="text-[10px] font-bold uppercase tracking-wider text-bingo-gray-400 px-3 mb-1.5">
                {group}
              </div>
              <div className="bg-white rounded-2xl border border-bingo-gray-200 bingo-shadow-sm overflow-hidden">
                {items.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center justify-between px-4 py-2.5 text-[13px] font-bold text-bingo-charcoal hover:bg-bingo-green/8 hover:text-bingo-green-dark border-b border-bingo-gray-100 last:border-0 transition"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="lg:col-span-9">{children}</div>
      </div>
    </div>
  );
}
