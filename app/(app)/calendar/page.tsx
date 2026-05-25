"use client";
import * as React from "react";
import { Calendar as CalendarIcon, Plus, ChevronLeft, ChevronRight, Phone, MessageCircle, Pen, Video, Clock } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { cn, formatDate } from "@/lib/utils";
import { Icon3D } from "@/components/ui/Icon3D";

interface CalEvent {
  id: string;
  title: string;
  time: string;
  duration: number; // minutes
  type: "call" | "meeting" | "followup" | "signing";
  leadName?: string;
  color: "blue" | "green" | "orange" | "purple";
}

const today = new Date();
function dateKey(d: Date) { return d.toISOString().slice(0, 10); }

const EVENTS: Record<string, CalEvent[]> = {
  [dateKey(today)]: [
    { id: "e1", title: "שיחת סגירה - דוד קדוש", time: "10:00", duration: 30, type: "call", leadName: "דוד קדוש", color: "green" },
    { id: "e2", title: "חתימת חוזה - מאג'ד", time: "11:30", duration: 45, type: "signing", leadName: "מאג'ד אל' חואסה", color: "purple" },
    { id: "e3", title: "פולואפ - בוריס", time: "14:00", duration: 15, type: "followup", leadName: "בוריס סקדץ", color: "orange" },
    { id: "e4", title: "פגישת צוות שבועית", time: "16:00", duration: 60, type: "meeting", color: "blue" },
  ],
};

// Add events for next 7 days
for (let i = 1; i < 14; i++) {
  const d = new Date(today);
  d.setDate(d.getDate() + i);
  const key = dateKey(d);
  if (Math.random() > 0.4) {
    EVENTS[key] = [
      { id: `f${i}-1`, title: "פולואפ", time: "10:00", duration: 15, type: "followup", color: "orange" },
      { id: `f${i}-2`, title: "שיחת סגירה", time: "14:30", duration: 30, type: "call", color: "green" },
    ];
  }
}

const TYPE_META = {
  call: { icon: <Phone className="size-3" />, label: "שיחה" },
  meeting: { icon: <Video className="size-3" />, label: "פגישה" },
  followup: { icon: <MessageCircle className="size-3" />, label: "פולואפ" },
  signing: { icon: <Pen className="size-3" />, label: "חתימה" },
};

const COLOR_MAP = {
  blue: "bg-status-blue/15 text-status-blue border-r-2 border-status-blue",
  green: "bg-bingo-green/15 text-bingo-green-dark border-r-2 border-bingo-green-dark",
  orange: "bg-status-orange/15 text-orange-700 border-r-2 border-status-orange",
  purple: "bg-status-purple/15 text-status-purple border-r-2 border-status-purple",
};

const HEBREW_DAYS = ["א'", "ב'", "ג'", "ד'", "ה'", "ו'", "ש'"];
const HEBREW_MONTHS = ["ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני", "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר"];

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = React.useState(new Date());
  const [selectedDay, setSelectedDay] = React.useState(today);

  const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
  const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
  const startDay = monthStart.getDay();
  const daysInMonth = monthEnd.getDate();

  const days: (Date | null)[] = [];
  for (let i = 0; i < startDay; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    days.push(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), d));
  }

  const selectedEvents = EVENTS[dateKey(selectedDay)] || [];

  return (
    <div className="max-w-[1400px] space-y-4">
      <div className="relative rounded-3xl bg-white border border-bingo-gray-200 p-5 overflow-hidden flex items-center justify-between flex-wrap gap-3" style={{ boxShadow: "0 2px 4px -1px rgba(0,0,0,0.03), 0 8px 24px -6px rgba(46, 161, 13, 0.10)" }}>
        <div className="flex items-center gap-4">
          <Icon3D icon={<CalendarIcon className="size-6" />} tone="orange" size={56} />
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-bingo-gray-500 mb-1">יומן ופגישות</div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-none flex items-center gap-2">
              <span className="text-bingo-black">לוח שנה</span>
              <span className="text-[12px] font-black tabular-nums px-2 py-0.5 rounded-lg text-gradient-bingo bg-bingo-green/10 border border-bingo-green/25">{(EVENTS[dateKey(today)] || []).length} היום</span>
            </h1>
            <p className="text-[12px] text-bingo-gray-600 mt-1.5">פגישות, פולואפים, וחתימות — הכל במקום אחד</p>
          </div>
        </div>
        <button className="btn-vibrant">
          <Plus className="size-4" /> אירוע חדש
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
        {/* Calendar grid */}
        <div className="lg:col-span-8 rounded-3xl bg-white border border-bingo-gray-200 bingo-shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
              className="size-9 rounded-xl bg-bingo-gray-100 hover:bg-bingo-gray-200 inline-flex items-center justify-center"
            >
              <ChevronRight className="size-4" />
            </button>
            <h2 className="text-xl font-extrabold text-bingo-black">
              {HEBREW_MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </h2>
            <button
              onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
              className="size-9 rounded-xl bg-bingo-gray-100 hover:bg-bingo-gray-200 inline-flex items-center justify-center"
            >
              <ChevronLeft className="size-4" />
            </button>
          </div>

          {/* Day labels */}
          <div className="grid grid-cols-7 gap-1 mb-1">
            {HEBREW_DAYS.map((d) => (
              <div key={d} className="text-center text-[10px] font-bold uppercase tracking-wider text-bingo-gray-500 py-2">
                {d}
              </div>
            ))}
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((d, i) => {
              if (!d) return <div key={i} />;
              const isToday = dateKey(d) === dateKey(today);
              const isSelected = dateKey(d) === dateKey(selectedDay);
              const dayEvents = EVENTS[dateKey(d)] || [];
              const isWeekend = d.getDay() === 5 || d.getDay() === 6;
              return (
                <button
                  key={i}
                  onClick={() => setSelectedDay(d)}
                  className={cn(
                    "aspect-square rounded-xl p-1.5 text-right transition flex flex-col",
                    isSelected ? "bg-bingo-black text-white bingo-shadow" :
                    isToday ? "bg-bingo-green text-bingo-black font-extrabold" :
                    isWeekend ? "bg-bingo-gray-50 text-bingo-gray-400" :
                    "hover:bg-bingo-gray-100 text-bingo-charcoal"
                  )}
                >
                  <span className="text-[14px] font-bold leading-none">{d.getDate()}</span>
                  {dayEvents.length > 0 && (
                    <div className="mt-auto flex items-center gap-0.5">
                      {dayEvents.slice(0, 3).map((e, j) => (
                        <span key={j} className={cn(
                          "size-1.5 rounded-full",
                          e.color === "green" ? "bg-bingo-green" :
                          e.color === "blue" ? "bg-status-blue" :
                          e.color === "orange" ? "bg-status-orange" :
                          "bg-status-purple"
                        )} />
                      ))}
                      {dayEvents.length > 3 && <span className="text-[8px] opacity-60">+{dayEvents.length - 3}</span>}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected day events */}
        <div className="lg:col-span-4 rounded-3xl bg-white border border-bingo-gray-200 bingo-shadow-sm p-5">
          <div className="mb-4">
            <div className="text-[11px] font-bold uppercase tracking-wider text-bingo-gray-500">היום שנבחר</div>
            <h2 className="text-xl font-extrabold text-bingo-black">{formatDate(selectedDay)}</h2>
            <p className="text-[12px] text-bingo-gray-600 mt-0.5">{selectedEvents.length} אירועים</p>
          </div>

          <div className="space-y-2">
            {selectedEvents.length === 0 ? (
              <div className="text-center py-8 text-bingo-gray-400">
                <CalendarIcon className="size-7 mx-auto mb-2 opacity-50" />
                <p className="text-sm">אין אירועים</p>
              </div>
            ) : (
              selectedEvents.map((e) => (
                <div key={e.id} className={cn("rounded-xl p-3", COLOR_MAP[e.color])}>
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold opacity-80">
                      {TYPE_META[e.type].icon}
                      {TYPE_META[e.type].label}
                    </div>
                    <div className="text-[11px] font-mono tabular-nums font-bold inline-flex items-center gap-0.5">
                      <Clock className="size-3" />
                      {e.time} · {e.duration}׳
                    </div>
                  </div>
                  <div className="text-[14px] font-extrabold text-bingo-black">{e.title}</div>
                  {e.leadName && (
                    <div className="text-[11px] text-bingo-charcoal mt-0.5">{e.leadName}</div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
