"use client";
import * as React from "react";
import Link from "next/link";
import { LEADS } from "@/lib/data/leads";
import { getUser } from "@/lib/data/static";
import { Avatar } from "@/components/ui/Avatar";
import { Phone, Play, Pause, SkipForward, X, Clock, MessageCircle, Mic, ChevronLeft } from "lucide-react";
import { cn, formatTime } from "@/lib/utils";

type Pace = "predictive" | "progressive" | "preview";
type QueueType = "followup" | "closing" | "check";

const QUEUES: { key: QueueType; label: string; description: string; tone: string }[] = [
  { key: "followup", label: "פולואפים", description: "לידים שצריך לחזור אליהם - לא ענו או שאמרו 'חזור אלי'", tone: "from-status-orange/15 to-status-orange/5 border-status-orange/40 text-orange-700" },
  { key: "closing", label: "שיחות סגירה", description: "לידים עם אישור עקרוני - צריך לסגור את העסקה", tone: "from-bingo-green/15 to-bingo-green/5 border-bingo-green/40 text-bingo-green-dark" },
  { key: "check", label: "בדיקות מול גופים", description: "מעקב אישורים, השלמת מסמכים, סטטוס בגוף המימון", tone: "from-status-blue/12 to-status-blue/3 border-status-blue/25 text-status-blue" },
];

export default function DialerPage() {
  const [activeQueue, setActiveQueue] = React.useState<QueueType>("followup");
  const [pace, setPace] = React.useState<Pace>("progressive");
  const [running, setRunning] = React.useState(false);
  const [currentIdx, setCurrentIdx] = React.useState(0);

  const queueLeads = LEADS.slice(0, 12);
  const currentLead = queueLeads[currentIdx];

  const stats = {
    total: queueLeads.length,
    called: currentIdx,
    answered: Math.floor(currentIdx * 0.55),
    noAnswer: Math.floor(currentIdx * 0.35),
    closed: Math.floor(currentIdx * 0.18),
  };

  return (
    <div className="max-w-[1400px] space-y-4">
      <div>
        <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-bingo-gray-500 mb-1">
          <Phone className="size-3" /> תותח שיחות
        </div>
        <h1 className="text-3xl sm:text-[34px] font-black tracking-tight text-bingo-black leading-none">
          חיוג חכם
          <span className="inline-block size-3 rounded-full bg-bingo-green ml-2 align-middle" />
        </h1>
        <p className="text-sm text-bingo-gray-600 mt-1.5">
          תותח שיחות מובנה - לפולואפים, סגירות ובדיקות. לא מקרי, חכם, מסודר.
        </p>
      </div>

      {/* Queue selection */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {QUEUES.map((q) => (
          <button
            key={q.key}
            onClick={() => setActiveQueue(q.key)}
            className={cn(
              "rounded-2xl border-2 p-4 text-right transition",
              activeQueue === q.key
                ? `bg-gradient-to-bl ${q.tone} -translate-y-0.5 bingo-shadow-lg`
                : "bg-white border-bingo-gray-200 hover:border-bingo-gray-300"
            )}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="text-[14px] font-extrabold text-bingo-black">{q.label}</div>
              {activeQueue === q.key && (
                <span className="text-[10px] font-bold bg-white/60 backdrop-blur rounded-full px-2 py-0.5">
                  {queueLeads.length} ברשימה
                </span>
              )}
            </div>
            <p className="text-[12px] text-bingo-charcoal leading-relaxed">{q.description}</p>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Control panel */}
        <div className="lg:col-span-5 space-y-3">
          <div className="rounded-3xl bg-gradient-to-bl from-bingo-onyx to-bingo-charcoal text-white p-6 bingo-shadow-lg">
            <div className="text-[10px] font-bold uppercase tracking-wider text-bingo-green mb-1">בקרת חיוג</div>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-2xl font-black">{running ? "פעיל - מחייג" : "מוכן להתחיל"}</h2>
                <p className="text-[12px] opacity-80 mt-0.5">
                  {currentIdx} מתוך {queueLeads.length} · {stats.answered} ענו
                </p>
              </div>
              <span className={cn("size-3 rounded-full", running ? "bg-bingo-green animate-pulse-green" : "bg-white/30")} />
            </div>

            <div className="grid grid-cols-4 gap-2 mb-5">
              <button
                onClick={() => setRunning(!running)}
                className={cn(
                  "h-14 rounded-2xl font-extrabold text-sm inline-flex flex-col items-center justify-center gap-0.5 transition",
                  running ? "bg-status-red text-white" : "bg-bingo-green text-bingo-black"
                )}
              >
                {running ? <Pause className="size-5" /> : <Play className="size-5" />}
                <span className="text-[10px]">{running ? "השהה" : "התחל"}</span>
              </button>
              <button
                onClick={() => setCurrentIdx(Math.min(queueLeads.length - 1, currentIdx + 1))}
                className="h-14 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-sm font-bold inline-flex flex-col items-center justify-center gap-0.5"
              >
                <SkipForward className="size-5" />
                <span className="text-[10px]">דלג</span>
              </button>
              <button className="h-14 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-sm font-bold inline-flex flex-col items-center justify-center gap-0.5">
                <MessageCircle className="size-5" />
                <span className="text-[10px]">WhatsApp</span>
              </button>
              <button onClick={() => setRunning(false)} className="h-14 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-sm font-bold inline-flex flex-col items-center justify-center gap-0.5">
                <X className="size-5" />
                <span className="text-[10px]">סיים</span>
              </button>
            </div>

            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider opacity-60 mb-2">קצב חיוג</div>
              <div className="grid grid-cols-3 gap-1.5">
                {(["preview", "progressive", "predictive"] as Pace[]).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPace(p)}
                    className={cn(
                      "h-9 rounded-xl text-[11px] font-bold transition",
                      pace === p ? "bg-bingo-green text-bingo-black" : "bg-white/10 hover:bg-white/20"
                    )}
                  >
                    {p === "preview" ? "תצוגה מקדימה" : p === "progressive" ? "רץ" : "תחזיתי"}
                  </button>
                ))}
              </div>
              <p className="text-[10px] opacity-60 mt-2">
                {pace === "preview" && "ראה כל ליד לפני שמחייגים - אתה לוחץ חיוג"}
                {pace === "progressive" && "ליד אחר ליד - מחייגים אחרי שאתה מסיים שיחה"}
                {pace === "predictive" && "מחייגים ל-2-3 לידים במקביל - מחבר את הראשון שעונה"}
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-2">
            <StatBox label="חויגו" value={stats.called} color="blue" />
            <StatBox label="ענו" value={stats.answered} color="green" />
            <StatBox label="לא ענו" value={stats.noAnswer} color="orange" />
            <StatBox label="סגרתי" value={stats.closed} color="green" highlight />
          </div>
        </div>

        {/* Current lead / Queue */}
        <div className="lg:col-span-7 space-y-3">
          {currentLead && (
            <div className="rounded-3xl bg-white border-2 border-bingo-green/40 p-6">
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-bingo-green-dark mb-2">
                <span className="size-2 rounded-full bg-bingo-green animate-pulse-green" />
                {running ? "מחייג עכשיו" : "הליד הבא"}
              </div>
              <div className="flex items-center gap-4">
                <Avatar name={currentLead.fullName} size="lg" />
                <div className="flex-1 min-w-0">
                  <h2 className="text-2xl font-black text-bingo-black">{currentLead.fullName}</h2>
                  <div className="flex items-center gap-3 text-[12px] text-bingo-gray-600 mt-1">
                    {currentLead.idNumber && <span className="font-mono tabular-nums">ת.ז {currentLead.idNumber}</span>}
                    {currentLead.phone && <span className="font-mono tabular-nums" dir="ltr">{currentLead.phone}</span>}
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    {currentLead.amountRequested && (
                      <span className="inline-flex items-center text-[11px] font-bold bg-bingo-green/15 text-bingo-green-dark rounded-full px-2.5 py-1">
                        סכום מבוקש: {currentLead.amountRequested.toLocaleString("he-IL")} ₪
                      </span>
                    )}
                    {currentLead.sourcesText && (
                      <span className="inline-flex items-center text-[11px] font-medium text-bingo-gray-600">
                        {currentLead.sourcesText.slice(0, 30)}...
                      </span>
                    )}
                  </div>
                </div>
                <Link
                  href={`/leads/${currentLead.id}`}
                  className="h-10 px-4 rounded-xl bg-bingo-black text-white text-xs font-bold hover:bg-bingo-charcoal inline-flex items-center gap-1.5"
                >
                  פתח כרטיס
                  <ChevronLeft className="size-3.5" />
                </Link>
              </div>

              {/* Script suggestion */}
              <div className="mt-5 pt-5 border-t border-bingo-gray-100">
                <div className="text-[10px] font-bold uppercase tracking-wider text-bingo-gray-500 mb-2 inline-flex items-center gap-1">
                  <Mic className="size-3" /> תסריט מוצע
                </div>
                <div className="bg-gradient-to-bl from-bingo-cream to-white rounded-xl p-3 text-[13px] leading-relaxed text-bingo-charcoal border border-bingo-gray-100">
                  שלום {currentLead.firstName || currentLead.fullName}, מדבר/ת חן מבינגו. אנחנו פנינו אליך לפני {Math.floor(Math.random() * 5) + 1} ימים בנושא הלוואה.
                  {currentLead.amountRequested && ` ביקשת ${currentLead.amountRequested.toLocaleString("he-IL")} ₪.`}
                  {" "}עברנו על הנתונים שלך ויש לי בשבילך עדכון - אפשר לדבר רגע?
                </div>
              </div>
            </div>
          )}

          {/* Queue list */}
          <div className="rounded-3xl bg-white border border-bingo-gray-200 bingo-shadow-sm overflow-hidden">
            <div className="px-5 py-3 border-b border-bingo-gray-100 flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-bingo-black inline-flex items-center gap-2">
                <Clock className="size-4" /> תור לחיוג ({queueLeads.length})
              </h3>
              <span className="text-[11px] text-bingo-gray-500">{stats.called}/{queueLeads.length}</span>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {queueLeads.map((l, i) => (
                <div
                  key={l.id}
                  className={cn(
                    "px-5 py-2.5 border-b border-bingo-gray-100 last:border-0 flex items-center justify-between gap-3",
                    i === currentIdx && "bg-bingo-green/8",
                    i < currentIdx && "opacity-50"
                  )}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-[10px] font-mono tabular-nums font-bold text-bingo-gray-400 w-6 text-center">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <Avatar name={l.fullName} size="sm" />
                    <div className="min-w-0">
                      <div className="text-[13px] font-bold text-bingo-black truncate">{l.fullName}</div>
                      <div className="text-[10px] font-mono tabular-nums text-bingo-gray-500" dir="ltr">{l.phone}</div>
                    </div>
                  </div>
                  {i < currentIdx && <span className="text-[10px] font-bold text-bingo-green-dark">✓ חויג</span>}
                  {i === currentIdx && <span className="text-[10px] font-bold text-bingo-green-dark animate-pulse-green">● עכשיו</span>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatBox({ label, value, color, highlight }: { label: string; value: number; color: "green" | "blue" | "orange"; highlight?: boolean }) {
  const palette = {
    green: "from-bingo-green/15 to-bingo-green/5 border-bingo-green/40 text-bingo-green-dark",
    blue: "from-status-blue/12 to-status-blue/3 border-status-blue/25 text-status-blue",
    orange: "from-status-orange/12 to-status-orange/3 border-status-orange/25 text-orange-700",
  }[color];
  return (
    <div className={cn("rounded-2xl border bg-gradient-to-bl p-3", palette, highlight && "bingo-glow-soft")}>
      <div className="text-2xl font-black tabular-nums text-bingo-black">{value}</div>
      <div className="text-[10px] font-bold mt-0.5">{label}</div>
    </div>
  );
}
