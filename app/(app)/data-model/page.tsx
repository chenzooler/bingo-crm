"use client";
import * as React from "react";
import Link from "next/link";
import {
  Database, Layers, Tag, Workflow, ArrowLeft, CheckCircle2,
  Sparkles, BookOpen, GitBranch, Hash, AlertTriangle,
} from "lucide-react";
import { FIELD_SECTIONS, SECTION_COLORS, TOTAL_FIELDS } from "@/lib/data/field-schema";
import { STAGES, CATEGORIES, COMMON_TAGS, SMART_VIEWS } from "@/lib/data/lifecycle";
import { STATUSES, PIPELINES, SOURCES, USERS } from "@/lib/data/static";
import { LENDERS } from "@/lib/types";
import { getMappingCoverage, getStatusesForStage } from "@/lib/data/status-mapper";
import { PROCESSES, ACTIVE_PROCESSES, TOTAL_LEADS_ALL_PROCESSES, type ProcessDef } from "@/lib/data/processes";
import {
  ALL_STATUS_META, TOP_STATUSES_BY_COUNT,
  groupStatusesByStage, groupStatusesBySentiment,
  getSentimentMeta, getUrgencyMeta,
  type StatusMeta, type Sentiment,
} from "@/lib/data/status-meta";
import { cn } from "@/lib/utils";

export default function DataModelPage() {
  const [activeTab, setActiveTab] = React.useState<"overview" | "processes" | "statuses" | "sections" | "stages" | "mapping">("overview");
  const coverage = React.useMemo(() => getMappingCoverage(), []);

  return (
    <div className="max-w-7xl mx-auto space-y-5">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-bingo-black via-[#1a1a1a] to-[#2a2a2a] text-white p-6 md:p-8">
        <div className="absolute -top-20 -right-20 size-64 rounded-full bg-bingo-green/25 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 size-64 rounded-full bg-bingo-green/15 blur-3xl pointer-events-none" />

        <div className="relative">
          <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-bingo-green bg-bingo-green/15 border border-bingo-green/30 rounded-full px-3 py-1 mb-3">
            <Sparkles className="size-3" />
            BINGO DATA MODEL
          </div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-2 leading-tight">
            מודל הנתונים החדש
            <br />
            <span className="text-bingo-green">{TOTAL_FIELDS} שדות · 8 קבוצות · 10 שלבים</span>
          </h1>
          <p className="text-white/70 text-sm md:text-base leading-relaxed max-w-3xl">
            עיצוב חדש שמסדר את כל המידע של הלקוח בצורה הגיונית.
            כל 114 הסטטוסים הקיימים ממופים אוטומטית, אף שדה לא נאבד.
          </p>
        </div>

        {/* Stats grid */}
        <div className="relative grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
          <BigStat label="פיפליינים → אחד" value="9→1" sub="מאוחד" />
          <BigStat label="סטטוסים → 10 שלבים" value={`${coverage.mapped}→${STAGES.length}`} sub={`${coverage.pct}% mapped`} />
          <BigStat label="שדות בלקוח" value={`${TOTAL_FIELDS}`} sub={`${FIELD_SECTIONS.length} קבוצות`} />
          <BigStat label="תגיות + קטגוריות" value={`${COMMON_TAGS.length}+${CATEGORIES.length}`} sub="גמיש" highlight />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-bingo-gray-100 p-1 rounded-2xl w-fit sticky top-2 z-10 bingo-shadow-sm">
        <TabBtn active={activeTab === "overview"} onClick={() => setActiveTab("overview")} icon={<Database className="size-3.5" />} label="סקירה" />
        <TabBtn active={activeTab === "processes"} onClick={() => setActiveTab("processes")} icon={<Workflow className="size-3.5" />} label="9 תהליכים" />
        <TabBtn active={activeTab === "statuses"} onClick={() => setActiveTab("statuses")} icon={<Tag className="size-3.5" />} label={`${ALL_STATUS_META.length} סטטוסים`} />
        <TabBtn active={activeTab === "sections"} onClick={() => setActiveTab("sections")} icon={<Layers className="size-3.5" />} label={`8 קבוצות שדות`} />
        <TabBtn active={activeTab === "stages"} onClick={() => setActiveTab("stages")} icon={<Workflow className="size-3.5" />} label="10 שלבי lifecycle" />
        <TabBtn active={activeTab === "mapping"} onClick={() => setActiveTab("mapping")} icon={<GitBranch className="size-3.5" />} label="מיפוי סטטוסים" />
      </div>

      {/* Tab content */}
      {activeTab === "overview" && <OverviewTab />}
      {activeTab === "processes" && <ProcessesTab />}
      {activeTab === "statuses" && <StatusesTab />}
      {activeTab === "sections" && <SectionsTab />}
      {activeTab === "stages" && <StagesTab />}
      {activeTab === "mapping" && <MappingTab coverage={coverage} />}
    </div>
  );
}

// ─────────────── BIG STAT ───────────────
function BigStat({ label, value, sub, highlight }: { label: string; value: string; sub: string; highlight?: boolean }) {
  return (
    <div className={cn(
      "rounded-2xl border p-3 backdrop-blur-sm",
      highlight ? "bg-bingo-green/20 border-bingo-green/40" : "bg-white/8 border-white/15"
    )}>
      <div className="text-[10px] font-bold uppercase tracking-wider text-white/70">{label}</div>
      <div className="text-2xl md:text-3xl font-black text-white tabular-nums mt-1 leading-none">{value}</div>
      <div className="text-[10px] text-white/60 mt-0.5">{sub}</div>
    </div>
  );
}

function TabBtn({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "h-9 px-3 md:px-4 rounded-xl text-[12px] font-bold inline-flex items-center gap-1.5 transition whitespace-nowrap",
        active ? "bg-white text-bingo-black bingo-shadow-sm" : "text-bingo-charcoal hover:bg-white/60"
      )}
    >
      {icon}
      {label}
    </button>
  );
}

// ─────────────── OVERVIEW TAB ───────────────
function OverviewTab() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      {/* Architecture */}
      <div className="md:col-span-2 surface-card-elevated p-5">
        <h2 className="text-lg font-extrabold text-bingo-black mb-3 inline-flex items-center gap-2">
          <BookOpen className="size-4" />
          ארכיטקטורת הנתונים
        </h2>
        <div className="space-y-3">
          <ArchRow num={1} title="Lifecycle Stage" desc="כל ליד נמצא בשלב אחד מתוך 10 שלבי חיים. אחיד בכל המערכת." />
          <ArchRow num={2} title="Category" desc="סוג ההלוואה: כל מטרה, רכב, נכס, איחוד, משכנתא" />
          <ArchRow num={3} title="Smart Sections" desc="8 קבוצות שדות חכמות עם completion % ו-XP" />
          <ArchRow num={4} title="Flexible Tags" desc="תגיות גמישות (חם, דחוף, VIP) - בלי הגבלה" />
          <ArchRow num={5} title="Status Mapper" desc="114 סטטוסים ישנים → ממופים אוטומטית ללא איבוד מידע" />
        </div>
      </div>

      {/* Quick stats */}
      <div className="space-y-3">
        <MiniCard title="נתונים זמינים" rows={[
          { label: "סה\"כ לידים", value: "150K+" },
          { label: "פיפליינים ישנים", value: PIPELINES.length.toString() },
          { label: "סטטוסים ישנים", value: STATUSES.length.toString() },
          { label: "מקורות לידים", value: SOURCES.length.toString() },
          { label: "מלווים פעילים", value: LENDERS.length.toString() },
          { label: "משתמשים בצוות", value: USERS.length.toString() },
        ]} />
      </div>
    </div>
  );
}

function ArchRow({ num, title, desc }: { num: number; title: string; desc: string }) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-xl bg-bingo-gray-50">
      <div className="size-8 rounded-xl bg-bingo-green/15 text-bingo-green-dark inline-flex items-center justify-center font-black tabular-nums text-sm shrink-0">
        {num}
      </div>
      <div className="flex-1">
        <div className="text-[13px] font-extrabold text-bingo-black">{title}</div>
        <div className="text-[11px] text-bingo-gray-600 leading-relaxed mt-0.5">{desc}</div>
      </div>
    </div>
  );
}

function MiniCard({ title, rows }: { title: string; rows: Array<{ label: string; value: string }> }) {
  return (
    <div className="surface-card-elevated p-4">
      <div className="text-[10px] font-bold uppercase tracking-wider text-bingo-gray-500 mb-2">{title}</div>
      <div className="space-y-1.5">
        {rows.map((r) => (
          <div key={r.label} className="flex items-center justify-between text-[11px]">
            <span className="text-bingo-charcoal">{r.label}</span>
            <span className="font-mono font-bold tabular-nums text-bingo-black">{r.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────── SECTIONS TAB ───────────────
function SectionsTab() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {FIELD_SECTIONS.map((section) => {
        const colors = SECTION_COLORS[section.color];
        return (
          <div key={section.key} className={cn("rounded-2xl border-2 overflow-hidden", colors.border)}>
            <div className={cn("p-4 flex items-start gap-3", colors.bg)}>
              <div className="size-12 rounded-2xl bg-white inline-flex items-center justify-center text-2xl shrink-0 bingo-shadow-sm">
                {section.emoji}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <h3 className="text-base font-extrabold text-bingo-black">{section.label}</h3>
                  <span className={cn("text-[10px] font-mono font-bold tabular-nums rounded-md px-1.5", "bg-white", colors.text)}>
                    {section.fields.length} שדות
                  </span>
                </div>
                <p className="text-[11px] text-bingo-charcoal leading-relaxed">{section.description}</p>
              </div>
            </div>
            <div className="p-3 bg-white space-y-1">
              {section.fields.map((f) => (
                <div key={f.key} className="flex items-center justify-between gap-2 text-[11px] py-1 px-2 rounded-md hover:bg-bingo-gray-50">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className={cn(
                      "size-1.5 rounded-full shrink-0",
                      f.defaultRelevance === "critical" ? "bg-status-red" :
                      f.defaultRelevance === "important" ? "bg-status-orange" : "bg-bingo-gray-300"
                    )} />
                    <span className="text-bingo-black font-medium truncate">{f.label}</span>
                    {f.computed && <Sparkles className="size-2.5 text-bingo-green-dark shrink-0" />}
                  </div>
                  <span className="text-[9px] font-mono text-bingo-gray-500 shrink-0">{f.kind}</span>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─────────────── STAGES TAB ───────────────
function StagesTab() {
  return (
    <div className="space-y-3">
      <div className="surface-card-elevated p-5">
        <h2 className="text-lg font-extrabold text-bingo-black mb-3 inline-flex items-center gap-2">
          <Workflow className="size-4" />
          זרימת מחזור החיים
        </h2>
        <div className="space-y-2">
          {STAGES.filter((s) => s.key !== "EXIT").map((stage, idx) => {
            const colorBg = {
              blue: "border-status-blue/40 bg-status-blue/8",
              yellow: "border-status-yellow/50 bg-status-yellow/15",
              orange: "border-status-orange/40 bg-status-orange/8",
              green: "border-bingo-green/50 bg-bingo-green/12",
              purple: "border-status-purple/40 bg-status-purple/8",
              pink: "border-status-pink/40 bg-status-pink/8",
              gray: "border-bingo-gray-200 bg-bingo-gray-100",
            }[stage.color];
            const mappedStatuses = getStatusesForStage(stage.key);
            return (
              <div key={stage.key} className={cn("rounded-2xl border-2 p-3", colorBg)}>
                <div className="flex items-center gap-3 mb-2">
                  <div className="size-10 rounded-xl bg-white inline-flex items-center justify-center font-black tabular-nums text-sm bingo-shadow-sm">
                    {String(stage.position).padStart(2, "0")}
                  </div>
                  <div className="flex-1">
                    <div className="text-base font-extrabold text-bingo-black">{stage.label}</div>
                    <div className="text-[11px] text-bingo-charcoal">{stage.description}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-bingo-gray-500">SLA</div>
                    <div className="text-sm font-bold text-bingo-black tabular-nums">{stage.slaHours}h</div>
                  </div>
                  {idx < STAGES.length - 2 && <ArrowLeft className="size-4 text-bingo-gray-300" />}
                </div>
                {mappedStatuses.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-2 border-t border-bingo-gray-200/50">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-bingo-gray-500 ml-1">סטטוסים ישנים שממופים:</span>
                    {mappedStatuses.slice(0, 8).map((s) => (
                      <span key={s} className="text-[9px] font-mono bg-white border border-bingo-gray-200 rounded px-1.5 py-0.5 text-bingo-charcoal">
                        {s}
                      </span>
                    ))}
                    {mappedStatuses.length > 8 && (
                      <span className="text-[9px] text-bingo-gray-500">+{mappedStatuses.length - 8} עוד</span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─────────────── STATUSES TAB ───────────────
function StatusesTab() {
  const [view, setView] = React.useState<"stage" | "sentiment" | "popular">("stage");
  const [search, setSearch] = React.useState("");
  const [selectedStatus, setSelectedStatus] = React.useState<StatusMeta | null>(null);

  const filtered = React.useMemo(() => {
    if (!search.trim()) return ALL_STATUS_META;
    const q = search.toLowerCase();
    return ALL_STATUS_META.filter((s) =>
      s.def.label.toLowerCase().includes(q) ||
      s.key.toLowerCase().includes(q) ||
      s.description.toLowerCase().includes(q)
    );
  }, [search]);

  return (
    <div className="space-y-4">
      {/* Summary banner */}
      <div className="rounded-2xl border-2 border-status-purple/40 bg-gradient-to-bl from-status-purple/15 to-transparent p-5">
        <h2 className="text-lg font-extrabold text-bingo-black mb-1 inline-flex items-center gap-2">
          <Tag className="size-5 text-status-purple" />
          ספריית סטטוסים — {ALL_STATUS_META.length} סטטוסים
        </h2>
        <p className="text-[12px] text-bingo-charcoal mb-4">
          <strong>כל סטטוס</strong> מהמערכת הישנה מקבל מטא-דאטה מלאה: סנטימנט, פעולה מומלצת, דחיפות ו-SLA.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          {(["celebrate", "positive", "pending", "warning", "negative"] as Sentiment[]).map((s) => {
            const meta = getSentimentMeta(s);
            const count = ALL_STATUS_META.filter((x) => x.sentiment === s).length;
            const totalLeads = ALL_STATUS_META.filter((x) => x.sentiment === s).reduce((sum, x) => sum + x.def.count, 0);
            return (
              <div key={s} className={cn("rounded-xl border p-2.5", meta.bg, meta.border)}>
                <div className={cn("text-[10px] font-bold uppercase tracking-wider mb-1", meta.text)}>{meta.label}</div>
                <div className="text-2xl font-black text-bingo-black tabular-nums leading-none">{count}</div>
                <div className="text-[10px] text-bingo-gray-500 mt-0.5">{totalLeads.toLocaleString("he-IL")} לידים</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* View toggle + search */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-0.5 bg-bingo-gray-100 rounded-xl p-0.5">
          <ViewBtn active={view === "stage"} onClick={() => setView("stage")} label="לפי שלב" />
          <ViewBtn active={view === "sentiment"} onClick={() => setView("sentiment")} label="לפי סנטימנט" />
          <ViewBtn active={view === "popular"} onClick={() => setView("popular")} label="פופולריים" />
        </div>
        <input
          type="text"
          placeholder="חיפוש סטטוס..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-9 w-full md:w-64 px-3 rounded-xl border border-bingo-gray-200 text-[12px] font-medium bg-white focus:border-bingo-green focus:outline-none focus:ring-2 focus:ring-bingo-green/20"
        />
      </div>

      {/* Search results override grouping */}
      {search.trim() ? (
        <StatusGrid statuses={filtered} onSelect={setSelectedStatus} />
      ) : view === "stage" ? (
        <StatusByStageView onSelect={setSelectedStatus} />
      ) : view === "sentiment" ? (
        <StatusBySentimentView onSelect={setSelectedStatus} />
      ) : (
        <StatusGrid statuses={TOP_STATUSES_BY_COUNT.slice(0, 30)} onSelect={setSelectedStatus} />
      )}

      {/* Detail drawer */}
      {selectedStatus && <StatusDetailDrawer status={selectedStatus} onClose={() => setSelectedStatus(null)} />}
    </div>
  );
}

function ViewBtn({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "h-8 px-3 rounded-lg text-[12px] font-bold transition",
        active ? "bg-white text-bingo-black bingo-shadow-sm" : "text-bingo-charcoal hover:bg-white/60"
      )}
    >
      {label}
    </button>
  );
}

function StatusByStageView({ onSelect }: { onSelect: (s: StatusMeta) => void }) {
  const grouped = React.useMemo(() => groupStatusesByStage(), []);
  return (
    <div className="space-y-3">
      {STAGES.map((stage) => {
        const list = grouped[stage.key] || [];
        if (list.length === 0) return null;
        const total = list.reduce((sum, s) => sum + s.def.count, 0);
        const colorBg = {
          blue: "border-status-blue/30 bg-status-blue/5",
          yellow: "border-status-yellow/40 bg-status-yellow/10",
          orange: "border-status-orange/30 bg-status-orange/5",
          green: "border-bingo-green/40 bg-bingo-green/8",
          purple: "border-status-purple/30 bg-status-purple/5",
          pink: "border-status-pink/30 bg-status-pink/5",
          gray: "border-bingo-gray-200 bg-bingo-gray-50",
        }[stage.color];
        return (
          <div key={stage.key} className={cn("rounded-2xl border-2 p-4", colorBg)}>
            <div className="flex items-center gap-3 mb-3">
              <div className="size-10 rounded-xl bg-white inline-flex items-center justify-center font-black text-sm tabular-nums bingo-shadow-sm">
                {String(stage.position).padStart(2, "0")}
              </div>
              <div className="flex-1">
                <h3 className="text-base font-extrabold text-bingo-black">{stage.label}</h3>
                <div className="text-[11px] text-bingo-charcoal">{list.length} סטטוסים · {total.toLocaleString("he-IL")} לידים</div>
              </div>
            </div>
            <StatusGrid statuses={list} onSelect={onSelect} compact />
          </div>
        );
      })}
    </div>
  );
}

function StatusBySentimentView({ onSelect }: { onSelect: (s: StatusMeta) => void }) {
  const grouped = React.useMemo(() => groupStatusesBySentiment(), []);
  const order: Sentiment[] = ["celebrate", "positive", "pending", "warning", "neutral", "negative"];
  return (
    <div className="space-y-3">
      {order.map((sent) => {
        const list = grouped[sent] || [];
        if (list.length === 0) return null;
        const meta = getSentimentMeta(sent);
        const total = list.reduce((sum, s) => sum + s.def.count, 0);
        return (
          <div key={sent} className={cn("rounded-2xl border-2 p-4", meta.bg, meta.border)}>
            <div className="flex items-center gap-3 mb-3">
              <span className={cn("size-3 rounded-full", meta.dot)} />
              <h3 className={cn("text-base font-extrabold", meta.text)}>{meta.label}</h3>
              <div className="text-[11px] text-bingo-charcoal mr-auto">{list.length} סטטוסים · {total.toLocaleString("he-IL")} לידים</div>
            </div>
            <StatusGrid statuses={list} onSelect={onSelect} compact />
          </div>
        );
      })}
    </div>
  );
}

function StatusGrid({ statuses, onSelect, compact }: { statuses: StatusMeta[]; onSelect: (s: StatusMeta) => void; compact?: boolean }) {
  if (statuses.length === 0) {
    return <div className="text-center py-8 text-sm text-bingo-gray-500">אין סטטוסים בקבוצה זו</div>;
  }
  return (
    <div className={cn("grid gap-2", compact ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-4" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3")}>
      {statuses.map((s) => <StatusChip key={s.key} status={s} onClick={() => onSelect(s)} />)}
    </div>
  );
}

function StatusChip({ status, onClick }: { status: StatusMeta; onClick: () => void }) {
  const meta = getSentimentMeta(status.sentiment);
  const urgMeta = getUrgencyMeta(status.urgency);
  return (
    <button
      onClick={onClick}
      className={cn(
        "text-right rounded-xl border-2 p-3 transition hover-lift bg-white relative group",
        meta.border
      )}
    >
      {/* Header */}
      <div className="flex items-start gap-2 mb-2">
        <div className="size-9 rounded-lg bg-bingo-gray-50 inline-flex items-center justify-center text-lg shrink-0">
          {status.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[13px] font-extrabold text-bingo-black truncate">{status.def.label}</div>
          <div className="text-[10px] font-mono text-bingo-gray-400 truncate" dir="ltr">{status.key}</div>
        </div>
        {status.isTerminal && (
          <span className="text-[9px] font-bold bg-bingo-gray-100 text-bingo-charcoal rounded px-1 py-0.5">TERMINAL</span>
        )}
      </div>

      {/* Footer: count + sentiment + urgency */}
      <div className="flex items-center gap-1 flex-wrap">
        <span className={cn("text-[9px] font-bold rounded-md px-1.5 py-0.5 border", meta.chip)}>
          {meta.label}
        </span>
        {status.urgency !== "none" && (
          <span className={cn("text-[9px] font-bold rounded-md px-1.5 py-0.5", urgMeta.color)}>
            {urgMeta.label}
          </span>
        )}
        <span className="text-[10px] font-mono font-bold text-bingo-gray-500 tabular-nums mr-auto">
          {status.def.count.toLocaleString("he-IL")} לידים
        </span>
      </div>
    </button>
  );
}

function StatusDetailDrawer({ status, onClose }: { status: StatusMeta; onClose: () => void }) {
  const meta = getSentimentMeta(status.sentiment);
  const urgMeta = getUrgencyMeta(status.urgency);
  return (
    <div className="fixed inset-0 z-50 bg-bingo-onyx/40 backdrop-blur-sm animate-fade-in flex items-center justify-center p-4" onClick={onClose}>
      <div className="w-full max-w-2xl max-h-[90vh] surface-card-elevated overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={cn("px-6 py-4 border-b border-bingo-gray-150 flex items-center justify-between", meta.bg)}>
          <div className="flex items-center gap-3">
            <div className="size-14 rounded-2xl bg-white inline-flex items-center justify-center text-3xl bingo-shadow-sm">{status.emoji}</div>
            <div>
              <h2 className="text-xl font-black text-bingo-black">{status.def.label}</h2>
              <p className="text-[12px] font-mono text-bingo-gray-500" dir="ltr">{status.key}</p>
            </div>
          </div>
          <button onClick={onClose} className="size-9 rounded-lg hover:bg-bingo-gray-100 inline-flex items-center justify-center">
            <span className="text-xl">×</span>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Quick stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <ProcessStat label="לידים" value={status.def.count.toLocaleString("he-IL")} sub="במערכת" />
            <ProcessStat label="סנטימנט" value={meta.label} sub="" />
            <ProcessStat label="דחיפות" value={urgMeta.label} sub="" highlight={status.urgency === "now"} />
            {status.slaHours && <ProcessStat label="SLA" value={`${status.slaHours}h`} sub="זמן יעד" />}
          </div>

          {/* Description */}
          <div>
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-bingo-gray-500 mb-1">תיאור</h3>
            <p className="text-[13px] text-bingo-charcoal leading-relaxed">{status.description}</p>
          </div>

          {/* Next action */}
          <div className={cn("rounded-xl border-2 p-4", meta.bg, meta.border)}>
            <div className="text-[11px] font-bold uppercase tracking-wider text-bingo-charcoal mb-1 inline-flex items-center gap-1.5">
              <Sparkles className={cn("size-3", meta.text)} />
              פעולה מומלצת
            </div>
            <p className="text-[14px] font-bold text-bingo-black leading-relaxed">{status.nextAction}</p>
          </div>

          {/* Linked stage */}
          {(() => {
            const stage = STAGES.find((s) => s.key === status.stage);
            if (!stage) return null;
            return (
              <div className="rounded-xl bg-bingo-gray-50 border border-bingo-gray-200 p-3">
                <div className="text-[10px] font-bold uppercase tracking-wider text-bingo-gray-500">מתחבר לשלב Lifecycle</div>
                <div className="text-[14px] font-extrabold text-bingo-black mt-0.5 inline-flex items-center gap-2">
                  <span className="text-[11px] font-mono bg-white rounded px-1.5">{String(stage.position).padStart(2, "0")}</span>
                  {stage.label}
                </div>
                <div className="text-[11px] text-bingo-charcoal mt-1">{stage.description}</div>
              </div>
            );
          })()}

          {/* Terminal indicator */}
          {status.isTerminal && (
            <div className="rounded-xl bg-bingo-gray-100 border border-bingo-gray-200 p-3 text-center">
              <div className="text-[11px] font-bold text-bingo-charcoal">🔚 סטטוס סופי — הליד יוצא מהמערכת</div>
            </div>
          )}
        </div>

        <div className="px-6 py-3 border-t border-bingo-gray-150 bg-bingo-gray-50 flex justify-between items-center">
          <Link href={`/leads?status=${status.key}`} className="text-[12px] font-bold text-bingo-green-dark hover:underline">
            הצג {status.def.count.toLocaleString("he-IL")} לידים בסטטוס זה ←
          </Link>
          <button onClick={onClose} className="text-[11px] text-bingo-gray-500 hover:text-bingo-black">סגור</button>
        </div>
      </div>
    </div>
  );
}

// ─────────────── PROCESSES TAB ───────────────
function ProcessesTab() {
  const active = ACTIVE_PROCESSES;
  const inactive = PROCESSES.filter((p) => !p.isActive);
  const [selected, setSelected] = React.useState<string | null>(null);
  const selectedProcess = selected ? PROCESSES.find((p) => p.key === selected) : null;

  return (
    <div className="space-y-4">
      {/* Summary banner */}
      <div className="rounded-2xl border-2 border-bingo-green/40 bg-gradient-to-bl from-bingo-green/15 to-transparent p-5">
        <h2 className="text-lg font-extrabold text-bingo-black mb-1 inline-flex items-center gap-2">
          <Workflow className="size-5 text-bingo-green-dark" />
          9 תהליכי עבודה במערכת
        </h2>
        <p className="text-[12px] text-bingo-charcoal mb-4">
          כל תהליך הוא <strong>תבנית workflow</strong> — מגדיר איך לידים זורמים, מי אחראי, ומה מטרת הסגירה.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <ProcessStat label="פעילים" value={active.length} sub="זורמים לידים" highlight />
          <ProcessStat label="ארכיב/סינון" value={inactive.length} sub="לא זורם" />
          <ProcessStat label='סה"כ לידים' value={`${(TOTAL_LEADS_ALL_PROCESSES / 1000).toFixed(0)}K`} sub="היסטוריה מלאה" />
          <ProcessStat label="צוותים" value={5} sub="בעלי תהליכים" />
        </div>
      </div>

      {/* Active processes */}
      <div>
        <h3 className="text-sm font-extrabold text-bingo-black mb-2 inline-flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-bingo-green animate-pulse" />
          תהליכים פעילים — לידים זורמים כאן
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {active.map((p) => (
            <ProcessCard key={p.key} process={p} onClick={() => setSelected(p.key)} />
          ))}
        </div>
      </div>

      {/* Inactive */}
      <div>
        <h3 className="text-sm font-extrabold text-bingo-charcoal mb-2 inline-flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-bingo-gray-300" />
          תהליכים פסיביים — ארכיב, ספאם, משפטי
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {inactive.map((p) => (
            <ProcessCard key={p.key} process={p} onClick={() => setSelected(p.key)} />
          ))}
        </div>
      </div>

      {/* Detail drawer */}
      {selectedProcess && <ProcessDetailDrawer process={selectedProcess} onClose={() => setSelected(null)} />}
    </div>
  );
}

function ProcessStat({ label, value, sub, highlight }: { label: string; value: string | number; sub: string; highlight?: boolean }) {
  return (
    <div className={cn("rounded-xl border p-3", highlight ? "bg-white border-bingo-green/40" : "bg-white/60 border-bingo-gray-200")}>
      <div className="text-[10px] font-bold uppercase tracking-wider text-bingo-gray-500">{label}</div>
      <div className="text-2xl font-black text-bingo-black tabular-nums leading-none mt-1">{value}</div>
      <div className="text-[10px] text-bingo-gray-500 mt-0.5">{sub}</div>
    </div>
  );
}

function ProcessCard({ process, onClick }: { process: ProcessDef; onClick: () => void }) {
  const colorMap = {
    blue:   { bg: "bg-status-blue/8 border-status-blue/30", text: "text-status-blue" },
    green:  { bg: "bg-bingo-green/12 border-bingo-green/40", text: "text-bingo-green-dark" },
    orange: { bg: "bg-status-orange/8 border-status-orange/30", text: "text-orange-700" },
    purple: { bg: "bg-status-purple/8 border-status-purple/30", text: "text-status-purple" },
    pink:   { bg: "bg-status-pink/8 border-status-pink/30", text: "text-pink-700" },
    yellow: { bg: "bg-status-yellow/15 border-status-yellow/40", text: "text-amber-700" },
    red:    { bg: "bg-status-red/8 border-status-red/30", text: "text-status-red" },
    gray:   { bg: "bg-bingo-gray-100 border-bingo-gray-200", text: "text-bingo-charcoal" },
  }[process.color];

  return (
    <button
      onClick={onClick}
      className={cn(
        "text-right rounded-2xl border-2 p-4 transition hover-lift bg-white group",
        colorMap.bg
      )}
    >
      <div className="flex items-start gap-3 mb-3">
        <div className="size-12 rounded-2xl bg-white inline-flex items-center justify-center text-2xl shrink-0 bingo-shadow-sm">
          {process.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap mb-1">
            <h4 className="text-base font-extrabold text-bingo-black">{process.label}</h4>
            <span className={cn("text-[9px] font-bold uppercase rounded px-1.5", "bg-white", colorMap.text)}>
              {process.kind}
            </span>
          </div>
          <p className="text-[12px] text-bingo-charcoal leading-snug">{process.purpose}</p>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-2 mb-3 pt-3 border-t border-bingo-gray-200/50">
        <MiniStat label="לידים" value={process.count.toLocaleString("he-IL")} />
        <MiniStat label="שלבים" value={`${process.stages.length}`} />
        {process.expectedConversion && <MiniStat label="המרה" value={`${process.expectedConversion}%`} />}
        {!process.expectedConversion && process.avgDays && <MiniStat label="ימים" value={`${process.avgDays}d`} />}
      </div>

      {/* Owner */}
      <div className="text-[10px] text-bingo-gray-600 truncate inline-flex items-center gap-1">
        <span className="font-bold">👤 בעלים:</span> {process.owner}
      </div>
    </button>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center bg-white rounded-lg p-1.5">
      <div className="text-[9px] font-bold uppercase tracking-wider text-bingo-gray-500">{label}</div>
      <div className="text-[13px] font-black text-bingo-black tabular-nums">{value}</div>
    </div>
  );
}

function ProcessDetailDrawer({ process, onClose }: { process: ProcessDef; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 bg-bingo-onyx/40 backdrop-blur-sm animate-fade-in flex items-center justify-center p-4" onClick={onClose}>
      <div className="w-full max-w-3xl max-h-[90vh] surface-card-elevated overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="px-6 py-4 border-b border-bingo-gray-150 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-14 rounded-2xl bg-bingo-green/12 inline-flex items-center justify-center text-3xl">{process.emoji}</div>
            <div>
              <h2 className="text-xl font-black text-bingo-black">{process.label}</h2>
              <p className="text-[12px] text-bingo-gray-600">{process.purpose}</p>
            </div>
          </div>
          <button onClick={onClose} className="size-9 rounded-lg hover:bg-bingo-gray-100 inline-flex items-center justify-center">
            <span className="text-xl">×</span>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Description */}
          <div>
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-bingo-gray-500 mb-2">תיאור</h3>
            <p className="text-[13px] text-bingo-charcoal leading-relaxed">{process.description}</p>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <ProcessStat label="לידים פעילים" value={process.count.toLocaleString("he-IL")} sub="במערכת" />
            <ProcessStat label="שלבי lifecycle" value={process.stages.length} sub="לאורך התהליך" />
            {process.expectedConversion !== undefined && (
              <ProcessStat label="יעד המרה" value={`${process.expectedConversion}%`} sub="צפי" highlight />
            )}
            {process.avgDays && (
              <ProcessStat label="זמן ממוצע" value={`${process.avgDays} ימים`} sub="כניסה→יציאה" />
            )}
          </div>

          {/* Lifecycle stages */}
          <div>
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-bingo-gray-500 mb-2">שלבי Lifecycle</h3>
            <div className="flex flex-wrap gap-1.5">
              {process.stages.map((s) => {
                const stage = STAGES.find((x) => x.key === s);
                return (
                  <span key={s} className="text-[12px] font-bold bg-bingo-gray-100 rounded-lg px-2.5 py-1 inline-flex items-center gap-1">
                    <span className="text-[10px] font-mono text-bingo-gray-500">{stage?.position.toString().padStart(2, "0")}</span>
                    {stage?.label || s}
                  </span>
                );
              })}
            </div>
          </div>

          {/* Entry conditions */}
          <div>
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-bingo-green-dark mb-2 inline-flex items-center gap-1.5">
              <CheckCircle2 className="size-3" />
              תנאי כניסה
            </h3>
            <ul className="space-y-1">
              {process.entry.map((e, i) => (
                <li key={i} className="text-[12px] text-bingo-charcoal flex gap-2 items-start">
                  <span className="text-bingo-green-dark mt-0.5">→</span>
                  <span>{e}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Exit conditions */}
          <div>
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-status-red mb-2 inline-flex items-center gap-1.5">
              <ArrowLeft className="size-3" />
              תנאי יציאה
            </h3>
            <ul className="space-y-1">
              {process.exit.map((e, i) => (
                <li key={i} className="text-[12px] text-bingo-charcoal flex gap-2 items-start">
                  <span className="text-status-red mt-0.5">←</span>
                  <span>{e}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Owner */}
          <div className="rounded-xl bg-bingo-gray-50 border border-bingo-gray-200 p-3">
            <div className="text-[10px] font-bold uppercase tracking-wider text-bingo-gray-500">בעלי התהליך</div>
            <div className="text-[14px] font-extrabold text-bingo-black mt-0.5">{process.owner}</div>
          </div>
        </div>

        <div className="px-6 py-3 border-t border-bingo-gray-150 bg-bingo-gray-50 flex justify-between items-center">
          <Link href={`/leads?pipeline=${process.key}`} className="text-[12px] font-bold text-bingo-green-dark hover:underline">
            הצג את {process.count.toLocaleString("he-IL")} הלידים בתהליך זה ←
          </Link>
          <button onClick={onClose} className="text-[11px] text-bingo-gray-500 hover:text-bingo-black">סגור</button>
        </div>
      </div>
    </div>
  );
}

// ─────────────── MAPPING TAB ───────────────
function MappingTab({ coverage }: { coverage: ReturnType<typeof getMappingCoverage> }) {
  return (
    <div className="space-y-3">
      {/* Coverage banner */}
      <div className={cn(
        "rounded-2xl border-2 p-4 flex items-center gap-4",
        coverage.pct === 100 ? "border-bingo-green/40 bg-bingo-green/10" : "border-status-yellow/40 bg-status-yellow/10"
      )}>
        <div className="size-14 rounded-2xl bg-white inline-flex items-center justify-center bingo-shadow-sm">
          {coverage.pct === 100 ? <CheckCircle2 className="size-7 text-bingo-green-dark" /> : <AlertTriangle className="size-6 text-amber-600" />}
        </div>
        <div className="flex-1">
          <div className="text-lg font-black text-bingo-black">{coverage.pct}% מהסטטוסים ממופים</div>
          <div className="text-[12px] text-bingo-charcoal">
            {coverage.mapped} מתוך {coverage.total} סטטוסים ישנים מוגדרים במנוע המיפוי
          </div>
        </div>
        <div className="text-right">
          <div className="text-3xl font-black text-bingo-black tabular-nums">{coverage.mapped}/{coverage.total}</div>
        </div>
      </div>

      {/* Pipeline breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {PIPELINES.map((p) => {
          const pipeStatuses = STATUSES.filter((s) => s.pipeline === p.key);
          return (
            <div key={p.key} className="surface-card-elevated p-3">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">{p.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-extrabold text-bingo-black truncate">{p.label}</div>
                  <div className="text-[10px] text-bingo-gray-500">{p.count.toLocaleString("he-IL")} לידים</div>
                </div>
                <span className="text-[11px] font-mono font-bold tabular-nums text-bingo-charcoal bg-bingo-gray-100 rounded px-1.5">
                  {pipeStatuses.length}
                </span>
              </div>
              <div className="space-y-0.5 max-h-40 overflow-y-auto">
                {pipeStatuses.slice(0, 10).map((s) => (
                  <div key={s.key} className="text-[10px] text-bingo-charcoal flex items-center justify-between gap-1 px-1 py-0.5 rounded hover:bg-bingo-gray-50">
                    <span className="truncate">{s.label}</span>
                    <span className="font-mono text-[9px] text-bingo-gray-400 shrink-0">{s.count}</span>
                  </div>
                ))}
                {pipeStatuses.length > 10 && (
                  <div className="text-[10px] text-bingo-gray-500 text-center pt-1">
                    +{pipeStatuses.length - 10} עוד
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Unmapped warning */}
      {coverage.unmapped.length > 0 && (
        <div className="rounded-2xl border-2 border-status-orange/40 bg-status-orange/10 p-4">
          <div className="text-[13px] font-extrabold text-orange-700 mb-2 inline-flex items-center gap-1.5">
            <AlertTriangle className="size-4" />
            סטטוסים שעדיין לא ממופים
          </div>
          <div className="flex flex-wrap gap-1">
            {coverage.unmapped.map((s) => (
              <span key={s} className="text-[10px] font-mono bg-white border border-orange-300 rounded px-1.5 py-0.5 text-orange-800">
                {s}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
