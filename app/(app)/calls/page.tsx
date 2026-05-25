"use client";
import * as React from "react";
import Link from "next/link";
import { CALLS, CALL_STATS, formatDuration } from "@/lib/data/calls-mock";
import type { CallRecord } from "@/lib/data/calls-mock";
import { Avatar } from "@/components/ui/Avatar";
import { Phone, PhoneIncoming, PhoneOutgoing, PhoneMissed, Voicemail, Play, Pause, MessageCircle, FileText, AlertTriangle, ChevronLeft, Clock, TrendingUp, Mic } from "lucide-react";
import { cn, formatDate, formatTime } from "@/lib/utils";
import { Icon3D } from "@/components/ui/Icon3D";

type Filter = "all" | "answered" | "no-answer" | "today";

export default function CallsPage() {
  const [filter, setFilter] = React.useState<Filter>("all");
  const [selectedId, setSelectedId] = React.useState<string | null>(CALLS[0]?.id || null);
  const selected = CALLS.find((c) => c.id === selectedId);

  const filtered = CALLS.filter((c) => {
    if (filter === "all") return true;
    if (filter === "answered") return c.outcome === "answered";
    if (filter === "no-answer") return c.outcome !== "answered";
    if (filter === "today") {
      const d = new Date(c.startTime);
      return d.toDateString() === new Date().toDateString();
    }
    return true;
  });

  return (
    <div className="max-w-[1500px] space-y-4">
      <div className="relative rounded-3xl bg-white border border-bingo-gray-200 p-5 overflow-hidden" style={{ boxShadow: "0 2px 4px -1px rgba(0,0,0,0.03), 0 8px 24px -6px rgba(46, 161, 13, 0.10)" }}>
        <div className="flex items-center gap-4">
          <Icon3D icon={<Phone className="size-6" />} tone="bingo" size={56} />
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-bingo-gray-500 mb-1">היסטוריית שיחות</div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-none flex items-center gap-2">
              <span className="text-bingo-black">שיחות והקלטות</span>
              <span className="text-[12px] font-black tabular-nums px-2 py-0.5 rounded-lg text-gradient-bingo bg-bingo-green/10 border border-bingo-green/25">{CALL_STATS.todayCount} היום</span>
            </h1>
            <p className="text-[12px] text-bingo-gray-600 mt-1.5">הקלטות + תעתוק AI + ניתוח חכם של כל שיחה</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <StatCard icon={<Phone className="size-4" />} label="שיחות היום" value={CALL_STATS.todayCount.toString()} accent="blue" />
        <StatCard icon={<PhoneIncoming className="size-4" />} label="ענו היום" value={CALL_STATS.todayAnswered.toString()} accent="green" />
        <StatCard icon={<TrendingUp className="size-4" />} label="סה״כ שבוע" value={CALL_STATS.weekTotal.toString()} accent="orange" />
        <StatCard icon={<Clock className="size-4" />} label="משך ממוצע" value={formatDuration(CALL_STATS.avgDuration)} accent="purple" />
        <StatCard icon={<Mic className="size-4" />} label="ציון AI ממוצע" value={`${CALL_STATS.avgScore}/100`} accent="green" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
        {/* Calls list */}
        <div className="lg:col-span-5 rounded-3xl bg-white border border-bingo-gray-200 bingo-shadow-sm overflow-hidden flex flex-col max-h-[calc(100vh-280px)]">
          <div className="p-3 border-b border-bingo-gray-100">
            <div className="flex items-center gap-1 bg-bingo-gray-100 rounded-xl p-0.5">
              {([
                { v: "all", l: "הכל", n: CALLS.length },
                { v: "today", l: "היום" },
                { v: "answered", l: "ענו" },
                { v: "no-answer", l: "לא ענו" },
              ] as { v: Filter; l: string; n?: number }[]).map((opt) => (
                <button
                  key={opt.v}
                  onClick={() => setFilter(opt.v)}
                  className={cn("flex-1 h-7 rounded-md text-[11px] font-bold transition", filter === opt.v ? "bg-white bingo-shadow-sm text-bingo-black" : "text-bingo-gray-500")}
                >
                  {opt.l}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-y-auto flex-1">
            {filtered.map((c) => (
              <CallListItem
                key={c.id}
                call={c}
                selected={c.id === selectedId}
                onClick={() => setSelectedId(c.id)}
              />
            ))}
            {filtered.length === 0 && (
              <div className="p-12 text-center text-sm text-bingo-gray-500">אין שיחות בסינון</div>
            )}
          </div>
        </div>

        {/* Call detail */}
        <div className="lg:col-span-7">
          {selected ? <CallDetail call={selected} /> : (
            <div className="rounded-3xl bg-white border border-bingo-gray-200 bingo-shadow-sm p-12 text-center text-bingo-gray-400">
              בחר שיחה מהרשימה
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, accent }: { icon: React.ReactNode; label: string; value: string; accent: "green" | "blue" | "orange" | "purple" }) {
  const palette = {
    green: "from-bingo-green/15 to-bingo-green/5 border-bingo-green/40 text-bingo-green-dark",
    blue: "from-status-blue/12 to-status-blue/3 border-status-blue/25 text-status-blue",
    orange: "from-status-orange/12 to-status-orange/3 border-status-orange/25 text-orange-700",
    purple: "from-status-purple/12 to-status-purple/3 border-status-purple/25 text-status-purple",
  }[accent];
  return (
    <div className={`rounded-2xl bg-gradient-to-bl border p-3 ${palette}`}>
      <div className="size-8 rounded-lg inline-flex items-center justify-center bg-white/60">{icon}</div>
      <div className="text-2xl font-black text-bingo-black tabular-nums mt-1.5 leading-none">{value}</div>
      <div className="text-[10px] font-bold mt-0.5">{label}</div>
    </div>
  );
}

function CallListItem({ call, selected, onClick }: { call: CallRecord; selected: boolean; onClick: () => void }) {
  const directionIcon = call.direction === "outgoing" ? <PhoneOutgoing className="size-3.5 text-status-blue" /> : <PhoneIncoming className="size-3.5 text-bingo-green-dark" />;
  const outcomeIcon =
    call.outcome === "answered" ? null :
    call.outcome === "no-answer" ? <PhoneMissed className="size-3.5 text-status-red" /> :
    call.outcome === "voicemail" ? <Voicemail className="size-3.5 text-status-orange" /> :
    <PhoneMissed className="size-3.5 text-status-yellow" />;

  const sentimentColor = call.sentiment === "positive" ? "bg-bingo-green" : call.sentiment === "negative" ? "bg-status-red" : "bg-bingo-gray-300";

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-right p-3 border-b border-bingo-gray-100 last:border-0 transition flex items-start gap-2.5",
        selected ? "bg-bingo-green/8 border-r-4 border-r-bingo-green" : "hover:bg-bingo-gray-50"
      )}
    >
      <div className="relative shrink-0">
        <Avatar name={call.leadName} size="md" />
        <span className={cn("absolute -bottom-0.5 -left-0.5 size-3 rounded-full ring-2 ring-white", sentimentColor)} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between gap-2">
          <div className="text-[13px] font-extrabold text-bingo-black truncate">{call.leadName}</div>
          <div className="text-[10px] font-mono tabular-nums text-bingo-gray-500 shrink-0">{formatTime(call.startTime)}</div>
        </div>
        <div className="flex items-center gap-1.5 mt-0.5 text-[10px]">
          {directionIcon}
          {outcomeIcon}
          <span className="font-mono tabular-nums text-bingo-gray-600">{formatDuration(call.duration)}</span>
          <span className="text-bingo-gray-400">·</span>
          <span className="text-bingo-gray-600 font-bold truncate">{call.agentName}</span>
        </div>
        {call.aiSummary && <div className="text-[11px] text-bingo-gray-700 mt-1 line-clamp-1">{call.aiSummary}</div>}
        {call.aiScore > 0 && (
          <div className="flex items-center gap-2 mt-1.5">
            <div className="flex-1 h-1 bg-bingo-gray-100 rounded-full overflow-hidden">
              <div className={cn("h-full rounded-full", call.aiScore >= 80 ? "bg-bingo-green" : call.aiScore >= 60 ? "bg-status-yellow" : "bg-status-red")} style={{ width: `${call.aiScore}%` }} />
            </div>
            <span className="text-[10px] font-mono tabular-nums font-bold text-bingo-charcoal">{call.aiScore}</span>
          </div>
        )}
      </div>
    </button>
  );
}

function CallDetail({ call }: { call: CallRecord }) {
  const [playing, setPlaying] = React.useState(false);
  const sentimentLabel = call.sentiment === "positive" ? "חיובי" : call.sentiment === "negative" ? "שלילי" : "ניטרלי";
  const sentimentColor = call.sentiment === "positive" ? "bg-bingo-green/15 text-bingo-green-dark" : call.sentiment === "negative" ? "bg-status-red/12 text-status-red" : "bg-bingo-gray-100 text-bingo-gray-700";

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="rounded-3xl bg-white border border-bingo-gray-200 bingo-shadow-sm p-5">
        <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
          <div className="flex items-center gap-3">
            <Avatar name={call.leadName} size="lg" />
            <div>
              <h2 className="text-xl font-black text-bingo-black">{call.leadName}</h2>
              <div className="text-[12px] text-bingo-gray-600 mt-0.5">
                {formatDate(call.startTime)} · {formatTime(call.startTime)} · {formatDuration(call.duration)} · {call.agentName}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <Link href={`/leads/${call.leadId}`} className="h-9 px-3 rounded-xl bg-bingo-gray-100 hover:bg-bingo-gray-200 text-bingo-charcoal text-xs font-bold inline-flex items-center gap-1.5">
              פתח כרטיס <ChevronLeft className="size-3.5" />
            </Link>
            <button className="h-9 px-3 rounded-xl bg-bingo-black text-white text-xs font-bold hover:bg-bingo-charcoal inline-flex items-center gap-1.5">
              <Phone className="size-3.5" /> חזור התקשר
            </button>
          </div>
        </div>

        {/* Audio player */}
        {call.recordingUrl ? (
          <div className="rounded-2xl bg-gradient-to-bl from-bingo-onyx to-bingo-charcoal text-white p-4">
            <div className="flex items-center gap-3">
              <button onClick={() => setPlaying(!playing)} className="size-12 rounded-2xl bg-bingo-green text-bingo-black inline-flex items-center justify-center bingo-glow-soft hover:bg-bingo-green-bright transition">
                {playing ? <Pause className="size-5" /> : <Play className="size-5" />}
              </button>
              <div className="flex-1">
                <div className="h-1 bg-white/20 rounded-full overflow-hidden">
                  <div className="h-full bg-bingo-green rounded-full" style={{ width: playing ? "35%" : "0%" }} />
                </div>
                <div className="flex items-center justify-between text-[10px] font-mono opacity-70 mt-1">
                  <span>0:00</span>
                  <span>{formatDuration(call.duration)}</span>
                </div>
              </div>
              <button className="h-9 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold inline-flex items-center gap-1.5">
                <FileText className="size-3.5" /> הורד
              </button>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl bg-bingo-gray-50 border border-bingo-gray-100 p-4 text-center text-sm text-bingo-gray-500">
            אין הקלטה (שיחה לא נענתה)
          </div>
        )}
      </div>

      {/* AI Analysis */}
      {call.aiSummary && (
        <div className="rounded-3xl bg-gradient-to-bl from-status-purple/8 to-white border border-status-purple/20 bingo-shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-extrabold text-bingo-black inline-flex items-center gap-2">
              <Mic className="size-4 text-status-purple" /> ניתוח AI
            </h3>
            <div className="flex items-center gap-1.5">
              <span className={cn("text-[10px] font-bold rounded-full px-2 py-0.5", sentimentColor)}>סנטימנט: {sentimentLabel}</span>
              <span className="text-[10px] font-bold bg-bingo-green/15 text-bingo-green-dark rounded-full px-2 py-0.5">
                ציון: {call.aiScore}/100
              </span>
            </div>
          </div>

          <div className="text-[13px] leading-relaxed text-bingo-charcoal bg-white rounded-xl p-3 border border-bingo-gray-100">{call.aiSummary}</div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-bingo-gray-500 mb-2">התנגדויות שזוהו</div>
              <div className="space-y-1">
                {call.objections.length > 0 ? call.objections.map((o, i) => (
                  <div key={i} className="text-[12px] text-status-orange bg-status-orange/10 rounded-lg px-2.5 py-1.5 font-medium border border-status-orange/20">
                    {o}
                  </div>
                )) : <div className="text-[11px] text-bingo-gray-400 italic">לא זוהו התנגדויות</div>}
              </div>
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-bingo-gray-500 mb-2">משימות שצריך לעקוב</div>
              <div className="space-y-1">
                {call.actionItems.map((a, i) => (
                  <div key={i} className="text-[12px] text-bingo-green-dark bg-bingo-green/10 rounded-lg px-2.5 py-1.5 font-medium border border-bingo-green/20">
                    ✓ {a}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {call.complianceFlags.length > 0 && (
            <div className="mt-4 pt-4 border-t border-status-purple/20">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="size-4 text-status-red" />
                <span className="text-[12px] font-extrabold text-status-red">דגלי Compliance</span>
              </div>
              {call.complianceFlags.map((f, i) => (
                <div key={i} className="text-[12px] text-status-red bg-status-red/8 rounded-lg px-3 py-2 font-bold border border-status-red/20">{f}</div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Transcript */}
      {call.transcript && (
        <div className="rounded-3xl bg-white border border-bingo-gray-200 bingo-shadow-sm p-5">
          <h3 className="text-base font-extrabold text-bingo-black inline-flex items-center gap-2 mb-3">
            <FileText className="size-4" /> תעתוק שיחה
          </h3>
          <div className="text-[13px] leading-relaxed text-bingo-charcoal bg-bingo-gray-50 rounded-xl p-4 border border-bingo-gray-100">
            <span className="font-bold text-bingo-green-dark">[נציג]: </span>
            שלום, חן מבינגו. ראיתי שהשארת פרטים אצלנו בנוגע להלוואה. אפשר רגע?
            <br /><br />
            <span className="font-bold text-status-blue">[לקוח]: </span>
            כן, בעצם רציתי להבין כמה אני יכול לקבל...
            <br /><br />
            <span className="font-bold text-bingo-green-dark">[נציג]: </span>
            <em className="text-bingo-gray-500">...תעתוק מלא יוצג כאן אחרי חיבור Whisper API...</em>
          </div>
        </div>
      )}
    </div>
  );
}
