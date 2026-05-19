import Link from "next/link";
import { ReactNode } from "react";

const NAV = [
  { href: "/settings", label: "כללי", group: "ארגון" },
  { href: "/settings/users", label: "משתמשים והרשאות", group: "ארגון" },
  { href: "/settings/teams", label: "צוותים", group: "ארגון" },

  { href: "/settings/lifecycle", label: "Lifecycle - שלבי ליד ✨", group: "זרימת עבודה" },
  { href: "/settings/pipelines", label: "תהליכים וסטטוסים (מערכת ישנה)", group: "זרימת עבודה" },
  { href: "/settings/sources", label: "מקורות לידים", group: "זרימת עבודה" },
  { href: "/settings/loan-purposes", label: "מטרות הלוואה", group: "זרימת עבודה" },
  { href: "/settings/automations", label: "אוטומציות", group: "זרימת עבודה" },
  { href: "/settings/sla", label: "SLA והסלמות", group: "זרימת עבודה" },

  { href: "/settings/lenders", label: "גופי מימון", group: "גופי מימון" },
  { href: "/settings/forms", label: "טפסים והסכמים", group: "גופי מימון" },

  { href: "/settings/templates", label: "תבניות הודעות", group: "תקשורת" },
  { href: "/settings/integrations", label: "אינטגרציות", group: "תקשורת" },
  { href: "/settings/webhooks", label: "Webhooks", group: "תקשורת" },

  { href: "/settings/bonus", label: "בונוסים ויעדים", group: "פיננסי" },
  { href: "/settings/pricing", label: "תמחור שכ\"ט", group: "פיננסי" },

  { href: "/settings/security", label: "אבטחה והרשאות", group: "מערכת" },
  { href: "/settings/audit-log", label: "Audit Log", group: "מערכת" },
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
