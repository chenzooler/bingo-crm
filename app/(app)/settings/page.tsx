import Link from "next/link";
import { Users, ListTree, Workflow, ShieldCheck, Zap, MessageSquareText, Mail, Upload, KeyRound, Globe, ClipboardList, FileSignature, Bot, LayoutGrid, PhoneCall } from "lucide-react";

/**
 * שכפול יועצים 1:1: מרכזיית ההגדרות = בדיוק סקשני §2 מהאפיון, בסדר המקורי.
 * טופס "הגדרות כלליות" של בינגו הוסתר (תוספת — יחזור בשלב הפיצ'רים; git שומר אותו).
 */
const YOATSIM_SECTIONS = [
  { href: "/settings/users", label: "ניהול משתמשים", icon: Users, tone: "b-icon-green" },
  { href: "/settings/fields", label: "הגדרת שדות", icon: ListTree, tone: "b-icon-blue" },
  { href: "/settings/processes", label: "תהליכים וסטטוסים", icon: Workflow, tone: "b-icon-orange" },
  { href: "/settings/leads-api", label: "קבלת לידים/API", icon: KeyRound, tone: "b-icon-green" },
  { href: "/settings/landing-pages", label: "דפי נחיתה", icon: Globe, tone: "b-icon-blue" },
  { href: "/settings/action-templates", label: "תבניות פעולות/משימות/פגישות/כספים", icon: ClipboardList, tone: "b-icon-orange" },
  { href: "/settings/templates", label: "תבניות סמס/ווטסאפ", icon: MessageSquareText, tone: "b-icon-green" },
  { href: "/settings/templates?channel=email", label: "תבניות מיילים", icon: Mail, tone: "b-icon-blue" },
  { href: "/settings/forms", label: "טפסים", icon: FileSignature, tone: "b-icon-purple" },
  { href: "/settings/automations", label: "אוטומציות", icon: Zap, tone: "b-icon-red" },
  { href: "/settings/whatsapp-bot", label: "בוט ווטסאפ", icon: Bot, tone: "b-icon-green" },
  { href: "/settings/telephony", label: "טלפוניה (Voicenter)", icon: PhoneCall, tone: "b-icon-blue" },
  { href: "/settings/modules", label: "מודולים", icon: LayoutGrid, tone: "b-icon-gray" },
  { href: "/admin/import", label: "ייבוא", icon: Upload, tone: "b-icon-gray" },
  { href: "/settings/permissions", label: "הרשאות", icon: ShieldCheck, tone: "b-icon-purple" },
] as const;

export default function GeneralSettingsPage() {
  return (
    <div className="b-card !p-5">
      <div className="b-eyebrow">הגדרות</div>
      <h2 className="text-lg font-extrabold text-bingo-black mb-3">כל מסכי ההגדרות</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
        {YOATSIM_SECTIONS.map(({ href, label, icon: Icon, tone }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-2.5 rounded-2xl border border-bingo-gray-100 bg-white px-3.5 py-3 hover:border-bingo-green/40 hover:bg-bingo-green/[0.04] transition"
          >
            <span className={`b-icon ${tone} !size-9 shrink-0`}>
              <Icon className="size-4" />
            </span>
            <span className="text-[13px] font-extrabold text-bingo-black leading-tight">{label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
