"use client";
import * as React from "react";
import { LEARNED_OBJECTIONS } from "@/lib/data/live-state";
import { Brain, TrendingUp, MessageCircleQuestion, Pencil, ThumbsUp, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ObjectionsLearningPage() {
  return (
    <div className="space-y-4">
      <div className="rounded-3xl bg-gradient-to-bl from-status-purple/10 to-white border border-status-purple/30 p-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="size-12 rounded-2xl bg-status-purple text-white inline-flex items-center justify-center">
            <Brain className="size-6" />
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-status-purple">AI Learning Engine</div>
            <h2 className="text-xl font-extrabold text-bingo-black">בנק התנגדויות חכם</h2>
            <p className="text-[12px] text-bingo-gray-600 mt-0.5 leading-relaxed">
              המערכת לומדת מכל שיחה. אם הלקוח התקדם אחרי תשובה - היא נשמרת כ"מצליחה". אם עזב - לא.
              כל יום המערכת חכמה יותר.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Kpi icon={<MessageCircleQuestion className="size-4" />} label="התנגדויות במאגר" value={LEARNED_OBJECTIONS.length} color="purple" />
        <Kpi icon={<TrendingUp className="size-4" />} label="ממוצע הצלחה" value={`${Math.round(LEARNED_OBJECTIONS.reduce((s, o) => s + o.successRate, 0) / LEARNED_OBJECTIONS.length)}%`} color="green" />
        <Kpi icon={<ThumbsUp className="size-4" />} label="שיחות שלמדה מהן" value="847" color="blue" />
        <Kpi icon={<Lightbulb className="size-4" />} label="הצעות חדשות השבוע" value="12" color="orange" />
      </div>

      <div className="space-y-3">
        {LEARNED_OBJECTIONS.map((o, i) => (
          <div key={i} className="rounded-3xl bg-white border border-bingo-gray-200 bingo-shadow-sm p-5 group">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex-1">
                <div className="text-[10px] font-bold uppercase tracking-wider text-bingo-gray-500 mb-1">התנגדות #{i + 1}</div>
                <h3 className="text-xl font-extrabold text-bingo-black">"{o.obj}"</h3>
              </div>
              <div className="text-left shrink-0">
                <div className={cn("text-3xl font-black tabular-nums", o.successRate >= 70 ? "text-bingo-green-dark" : o.successRate >= 50 ? "text-amber-700" : "text-status-red")}>
                  {o.successRate}%
                </div>
                <div className="text-[10px] font-bold text-bingo-gray-500 uppercase tracking-wider">הצלחה</div>
              </div>
            </div>

            <div className="rounded-2xl bg-gradient-to-bl from-bingo-green/10 to-bingo-green/5 border border-bingo-green/30 p-4">
              <div className="text-[10px] font-bold uppercase tracking-wider text-bingo-green-dark mb-1.5">התשובה המצליחה ביותר</div>
              <p className="text-[14px] text-bingo-charcoal leading-relaxed font-medium">{o.bestResponse}</p>
            </div>

            <div className="flex items-center justify-between gap-3 mt-3 pt-3 border-t border-bingo-gray-100">
              <div className="flex items-center gap-3 text-[11px] text-bingo-gray-600">
                <span><strong className="text-bingo-charcoal">{o.timesUsed}</strong> פעמים בשימוש</span>
                <span>·</span>
                <span>עודכן לאחרונה: {o.lastUpdated}</span>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                <button className="h-8 px-3 rounded-lg bg-bingo-gray-100 hover:bg-bingo-gray-200 text-bingo-charcoal text-xs font-bold inline-flex items-center gap-1.5">
                  <Pencil className="size-3.5" /> ערוך
                </button>
                <button className="h-8 px-3 rounded-lg bg-status-purple text-white text-xs font-bold inline-flex items-center gap-1.5 hover:bg-purple-700">
                  ראה אלטרנטיבות
                </button>
              </div>
            </div>
          </div>
        ))}
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
