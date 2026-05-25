"use client";
import * as React from "react";
import { Icon3D } from "@/components/ui/Icon3D";
import { Zap, Plus, Pencil, Power, Trash2, ArrowLeft, MessageCircle, Mail, Phone, Tag, Clock, AlertTriangle, Repeat } from "lucide-react";
import { cn } from "@/lib/utils";

interface Automation {
  id: string;
  name: string;
  description: string;
  trigger: string;
  triggerIcon: React.ReactNode;
  conditions: string[];
  actions: string[];
  enabled: boolean;
  runs: number;
  successRate: number;
}

const AUTOMATIONS: Automation[] = [
  {
    id: "1",
    name: "ברוכים הבאים",
    description: "שולח WhatsApp ברוכים הבאים מיד כשליד חדש נכנס",
    trigger: "ליד חדש נכנס למערכת",
    triggerIcon: <Zap className="size-3.5" />,
    conditions: ["מקור = Facebook או דף נחיתה"],
    actions: ["שלח WhatsApp - תבנית 'ברוכים הבאים'", "צור משימה לנציג 'התקשר תוך 2 שעות'"],
    enabled: true,
    runs: 3421,
    successRate: 87,
  },
  {
    id: "2",
    name: "תזכורת לפולואפ",
    description: "תזכורת אוטומטית 24 שעות אחרי שיחה שלא הסתיימה",
    trigger: "אחרי שיחה ללא סגירה",
    triggerIcon: <Clock className="size-3.5" />,
    conditions: ["משך השיחה > 30 שניות", "סטטוס לא 'סגור'"],
    actions: ["המתן 24 שעות", "שלח WhatsApp תזכורת", "הוסף משימה ליום הבא"],
    enabled: true,
    runs: 892,
    successRate: 62,
  },
  {
    id: "3",
    name: "התראת SLA",
    description: "אזהרה למנהל אם ליד לא טופל 4 שעות",
    trigger: "ליד 4 שעות בלי טיפול",
    triggerIcon: <AlertTriangle className="size-3.5" />,
    conditions: ["סטגיה NEW או CONTACT", "ללא שיחה יוצאת"],
    actions: ["שלח Slack למנהל הצוות", "סמן ליד כדחוף", "הוסף לתור עדיפות גבוהה"],
    enabled: true,
    runs: 156,
    successRate: 100,
  },
  {
    id: "4",
    name: "Drip Campaign - 60 ימים",
    description: "60 ימים אחרי הלוואה - הצעה לעוד אשראי",
    trigger: "60 ימים אחרי תשלום",
    triggerIcon: <Repeat className="size-3.5" />,
    conditions: ["סטטוס = PAID", "אין הלוואה פעילה אחרת"],
    actions: ["שלח WhatsApp 'איך הולך?'", "המתן 7 ימים", "שלח SMS עם הצעה", "המתן 14 ימים", "שלח מייל מהמנהל האישי"],
    enabled: true,
    runs: 67,
    successRate: 18,
  },
  {
    id: "5",
    name: "חתימת חוזה - תזכורת",
    description: "תזכורת ללקוח שלא חתם על חוזה תוך 48 שעות",
    trigger: "חוזה נשלח ולא נחתם",
    triggerIcon: <Clock className="size-3.5" />,
    conditions: ["סטטוס חוזה = sent", "עברו 48 שעות"],
    actions: ["שלח WhatsApp 'נשארה רק חתימה'", "תזכורת לנציג להתקשר"],
    enabled: true,
    runs: 234,
    successRate: 71,
  },
  {
    id: "6",
    name: "כפילות - דיכוי אוטומטי",
    description: "אם נכנס ליד עם אותה ת.ז - מאחד אוטומטית",
    trigger: "ליד חדש נכנס",
    triggerIcon: <Zap className="size-3.5" />,
    conditions: ["יש כבר ליד עם אותה ת.ז"],
    actions: ["מזג את הלידים", "שמור הערה על הליד החדש", "התרעה לנציג"],
    enabled: false,
    runs: 0,
    successRate: 0,
  },
];

export default function AutomationsPage() {
  const [enabled, setEnabled] = React.useState<Record<string, boolean>>(
    Object.fromEntries(AUTOMATIONS.map((a) => [a.id, a.enabled]))
  );

  const stats = {
    total: AUTOMATIONS.length,
    active: AUTOMATIONS.filter((a) => enabled[a.id]).length,
    runsToday: 423,
    timeSaved: "47 שעות",
  };

  return (
    <div className="max-w-[1400px] space-y-4">
      <div className="relative rounded-3xl bg-white border border-bingo-gray-200 p-5 overflow-hidden" style={{ boxShadow: "0 2px 4px -1px rgba(0,0,0,0.03), 0 8px 24px -6px rgba(46, 161, 13, 0.10)" }}>
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-4">
            <Icon3D icon={<Zap className="size-6" />} tone="yellow" size={56} />
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-bingo-gray-500 mb-1">אוטומציות וזרימות</div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-none flex items-center gap-2">
                <span className="text-bingo-black">No-Code Workflows</span>
                <span className="text-[12px] font-black tabular-nums px-2 py-0.5 rounded-lg text-gradient-bingo bg-bingo-green/10 border border-bingo-green/25">{AUTOMATIONS.length} זרימות</span>
              </h1>
              <p className="text-[12px] text-bingo-gray-600 mt-1.5">תהליכים אוטומטיים שחוסכים שעות עבודה - בלי שורת קוד</p>
            </div>
          </div>
          <button className="h-10 px-4 rounded-xl bg-bingo-black text-white text-sm font-bold inline-flex items-center gap-1.5 hover:bg-bingo-charcoal">
            <Plus className="size-4" /> אוטומציה חדשה
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Kpi icon={<Zap className="size-4" />} label="סה״כ אוטומציות" value={stats.total} color="blue" />
        <Kpi icon={<Power className="size-4" />} label="פעילות" value={stats.active} color="green" />
        <Kpi icon={<Repeat className="size-4" />} label="הפעלות היום" value={stats.runsToday} color="orange" />
        <Kpi icon={<Clock className="size-4" />} label="זמן נחסך החודש" value={stats.timeSaved} color="purple" />
      </div>

      <div className="space-y-3">
        {AUTOMATIONS.map((a) => {
          const isOn = enabled[a.id];
          return (
            <div key={a.id} className={cn("rounded-3xl border-2 p-5 transition", isOn ? "bg-white border-bingo-green/40" : "bg-bingo-gray-50 border-bingo-gray-200 opacity-70")}>
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-extrabold text-bingo-black">{a.name}</h3>
                    {isOn && <span className="inline-flex items-center gap-1 text-[10px] font-bold text-bingo-green-dark bg-bingo-green/15 rounded-full px-2 py-0.5">פעיל</span>}
                  </div>
                  <p className="text-[12px] text-bingo-gray-600">{a.description}</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <button onClick={() => setEnabled((e) => ({ ...e, [a.id]: !e[a.id] }))} className={cn("size-9 rounded-xl inline-flex items-center justify-center transition", isOn ? "bg-bingo-green/15 text-bingo-green-dark hover:bg-bingo-green/25" : "bg-bingo-gray-100 text-bingo-gray-400")} title={isOn ? "כבה" : "הפעל"}>
                    <Power className="size-4" />
                  </button>
                  <button className="size-9 rounded-xl bg-bingo-gray-100 hover:bg-bingo-gray-200 text-bingo-gray-600 inline-flex items-center justify-center" title="ערוך">
                    <Pencil className="size-4" />
                  </button>
                </div>
              </div>

              {/* Workflow visualization */}
              <div className="flex items-center gap-2 flex-wrap mb-3">
                <StepBox color="blue" icon={a.triggerIcon} label={`טריגר: ${a.trigger}`} />
                {a.conditions.length > 0 && (
                  <>
                    <ArrowLeft className="size-4 text-bingo-gray-400" />
                    <div className="flex flex-col gap-1">
                      {a.conditions.map((c, i) => (
                        <StepBox key={i} color="yellow" label={c} compact />
                      ))}
                    </div>
                  </>
                )}
                <ArrowLeft className="size-4 text-bingo-gray-400" />
                <div className="flex flex-col gap-1">
                  {a.actions.map((act, i) => (
                    <StepBox key={i} color="green" label={act} compact />
                  ))}
                </div>
              </div>

              {a.runs > 0 && (
                <div className="flex items-center justify-between gap-3 pt-3 border-t border-bingo-gray-100">
                  <div className="text-[11px] text-bingo-gray-600">
                    <strong className="text-bingo-charcoal">{a.runs.toLocaleString()}</strong> הפעלות · ציון הצלחה <strong className="text-bingo-green-dark">{a.successRate}%</strong>
                  </div>
                  <div className="w-32 h-1.5 bg-bingo-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-bingo-green-dark rounded-full" style={{ width: `${a.successRate}%` }} />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Kpi({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string | number; color: "green" | "blue" | "orange" | "purple" }) {
  const palette = {
    green: "from-bingo-green/15 to-bingo-green/5 border-bingo-green/40 text-bingo-green-dark",
    blue: "from-status-blue/12 to-status-blue/3 border-status-blue/25 text-status-blue",
    orange: "from-status-orange/12 to-status-orange/3 border-status-orange/25 text-orange-700",
    purple: "from-status-purple/12 to-status-purple/3 border-status-purple/25 text-status-purple",
  }[color];
  return (
    <div className={`rounded-2xl bg-gradient-to-bl border p-4 ${palette}`}>
      <div className="size-9 rounded-xl inline-flex items-center justify-center bg-white/60">{icon}</div>
      <div className="text-3xl font-black text-bingo-black tabular-nums leading-none mt-2">{value}</div>
      <div className="text-[11px] font-bold mt-1">{label}</div>
    </div>
  );
}

function StepBox({ color, icon, label, compact }: { color: "blue" | "yellow" | "green"; icon?: React.ReactNode; label: string; compact?: boolean }) {
  const palette = {
    blue: "bg-status-blue-soft text-status-blue border-status-blue/30",
    yellow: "bg-status-yellow-soft text-amber-700 border-status-yellow/40",
    green: "bg-bingo-green/15 text-bingo-green-dark border-bingo-green/40",
  }[color];
  return (
    <div className={cn("inline-flex items-center gap-1.5 rounded-xl border font-bold", palette, compact ? "px-2.5 py-1 text-[11px]" : "px-3 py-2 text-[12px]")}>
      {icon}
      <span>{label}</span>
    </div>
  );
}
