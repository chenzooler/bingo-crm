import Link from "next/link";
import { ReactNode } from "react";
import { BarChart3, Users, Pen, ShieldCheck, TrendingUp, DollarSign, Building2, Bell } from "lucide-react";

const NAV = [
  { href: "/admin", label: "סקירה", icon: <BarChart3 className="size-4" /> },
  { href: "/admin/team", label: "ביצועי צוות", icon: <Users className="size-4" /> },
  { href: "/admin/signatures", label: "חתימות וחוזים", icon: <Pen className="size-4" /> },
  { href: "/admin/checks", label: "בדיקות אשראי", icon: <ShieldCheck className="size-4" /> },
  { href: "/admin/funnel", label: "אנליזת משפך", icon: <TrendingUp className="size-4" /> },
  { href: "/admin/financials", label: "פיננסים", icon: <DollarSign className="size-4" /> },
  { href: "/admin/lenders", label: "ביצועי גופים", icon: <Building2 className="size-4" /> },
  { href: "/admin/alerts", label: "התראות חכמות", icon: <Bell className="size-4" /> },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="max-w-[1500px] space-y-4">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-bingo-gray-500 inline-flex items-center gap-1">
            <ShieldCheck className="size-3" /> Manager Center
          </div>
          <h1 className="text-3xl sm:text-[34px] font-black tracking-tight text-bingo-black leading-none">
            מרכז ניהול
            <span className="inline-block size-3 rounded-full bg-bingo-green ml-2 align-middle" />
          </h1>
        </div>
      </div>

      <nav className="bg-white rounded-2xl border border-bingo-gray-200 bingo-shadow-sm p-1 flex items-center gap-1 overflow-x-auto">
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="h-9 px-3 rounded-xl text-[12px] font-bold text-bingo-charcoal hover:bg-bingo-gray-100 inline-flex items-center gap-1.5 shrink-0 transition"
          >
            {item.icon}
            {item.label}
          </Link>
        ))}
      </nav>

      <div>{children}</div>
    </div>
  );
}
