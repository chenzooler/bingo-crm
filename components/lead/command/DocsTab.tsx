"use client";
/**
 * טאב התיעוד — הפיד המאוחד (פעילויות + משימות + שיחות) בשפת מרכז השליטה.
 * פילטרים בצ'יפים, נגן הקלטות לשיחות, והוספת הערה שנרשמת מיד (אופטימית).
 */
import * as React from "react";
import { motion } from "framer-motion";
import { FileClock, Phone, ListChecks, MessageSquare, Cpu, Plus } from "lucide-react";
import { cn, relativeTime } from "@/lib/utils";
import { useEpEntrance } from "@/components/lead/v4/ep";
import type { CardV4PageProps, TimelineItem } from "@/components/lead/v4/types";
import { Panel, PanelTitle } from "./shared";

type Filter = "all" | "call" | "task" | "note" | "system";

const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "הכל" },
  { key: "call", label: "שיחות" },
  { key: "task", label: "משימות" },
  { key: "note", label: "הערות והודעות" },
  { key: "system", label: "מערכת" },
];

function matches(item: TimelineItem, f: Filter): boolean {
  if (f === "all") return true;
  if (f === "call") return item.kind === "call" || item.type === "call";
  if (f === "task") return item.kind === "task";
  if (f === "system") return item.type === "system";
  return item.kind === "activity" && item.type !== "system" && item.type !== "call";
}

function itemMeta(item: TimelineItem): { color: string; Icon: React.ComponentType<{ className?: string; strokeWidth?: number }> } {
  if (item.kind === "call" || item.type === "call") return { color: "var(--cmd-blue)", Icon: Phone };
  if (item.kind === "task") return { color: "var(--cmd-amber)", Icon: ListChecks };
  if (item.type === "system") return { color: "var(--cmd-tx3)", Icon: Cpu };
  return { color: "var(--cmd-lime)", Icon: MessageSquare };
}

function fmtDuration(sec: number | null | undefined): string {
  if (!sec) return "";
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, "0")} דק'`;
}

export function DocsTab({ state, timeline }: CardV4PageProps & { timeline: TimelineItem[] }) {
  const { parent, child } = useEpEntrance();
  const [filter, setFilter] = React.useState<Filter>("all");
  const [note, setNote] = React.useState("");

  /* הערות חדשות שנוספו עכשיו (אופטימית) לפני הפיד מהשרת */
  const fresh: TimelineItem[] = state.activities
    .filter((a) => a.id < 0)
    .map((a) => ({
      key: `a-${a.id}`, kind: "activity", type: a.type, text: a.text,
      at: a.createdAt, userName: a.userName,
    }));
  const items = [...fresh, ...timeline].filter((t) => matches(t, filter));

  return (
    <motion.div variants={parent} initial="hidden" animate="show" className="space-y-3">
      <Panel variants={child} className="flex items-center gap-2 flex-wrap p-3">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setFilter(f.key)}
            aria-pressed={filter === f.key}
            className={cn(
              "rounded-full px-4 min-h-10 text-[12.5px] font-bold cursor-pointer border transition-colors duration-150",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#50FF0A]",
              filter === f.key
                ? "bg-[rgba(80,255,10,.14)] border-[#50FF0A]/50 text-[#50FF0A]"
                : "bg-[#1A1F28] border-white/[.08] hover:border-white/[.2]",
            )}
            style={filter === f.key ? undefined : { color: "var(--cmd-tx2)" }}
          >
            {f.label}
          </button>
        ))}
        <form
          className="ms-auto flex gap-1.5 flex-1 min-w-56 max-w-md"
          onSubmit={(e) => {
            e.preventDefault();
            if (!note.trim()) return;
            state.addNote("note", note);
            setNote("");
          }}
        >
          <label className="sr-only" htmlFor="cmd-docs-note">הוסף תיעוד</label>
          <input
            id="cmd-docs-note"
            className="cmd-input !min-h-10 text-[12.5px]"
            placeholder="הוסף תיעוד לכרטיס..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
          <button
            type="submit"
            aria-label="הוסף תיעוד"
            className={cn(
              "w-10 h-10 rounded-[10px] grid place-items-center flex-none cursor-pointer",
              "bg-white/[.06] border border-white/[.12] hover:bg-white/[.12] transition-colors duration-150",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#50FF0A]",
            )}
            style={{ color: "var(--cmd-tx)" }}
          >
            <Plus className="size-4" strokeWidth={2} />
          </button>
        </form>
      </Panel>

      <Panel variants={child} className="p-0">
        <div className="px-4 pt-4">
          <PanelTitle icon={<FileClock className="size-3.5" strokeWidth={1.75} />}>
            ציר הזמן · {items.length} רשומות
          </PanelTitle>
        </div>
        {items.length === 0 && (
          <p className="px-4 pb-5 text-[13px]" style={{ color: "var(--cmd-tx3)" }}>
            אין רשומות בפילטר הזה
          </p>
        )}
        <ol className="px-4 pb-2">
          {items.slice(0, 120).map((item) => {
            const { color, Icon } = itemMeta(item);
            return (
              <li key={item.key} className="flex gap-3 py-2.5 border-b last:border-b-0" style={{ borderColor: "var(--cmd-line)" }}>
                <span
                  className="w-8 h-8 rounded-[9px] grid place-items-center flex-none mt-0.5"
                  style={{ background: "var(--cmd-panel2)", color }}
                  aria-hidden
                >
                  <Icon className="size-4" strokeWidth={1.75} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className={cn("text-[13px] leading-relaxed", item.kind === "task" && item.done && "line-through opacity-60")} style={{ color: "var(--cmd-tx)" }}>
                    {item.text}
                    {item.kind === "task" && item.urgent && (
                      <span className="ms-2 text-[10.5px] font-extrabold rounded-full px-2 py-0.5" style={{ background: "rgba(255,93,93,.14)", color: "var(--cmd-red)" }}>
                        מתפרצת
                      </span>
                    )}
                  </p>
                  <small className="text-[11px] tabular-nums" style={{ color: "var(--cmd-tx3)" }}>
                    {relativeTime(item.at)}
                    {item.userName ? ` · ${item.userName}` : ""}
                    {item.kind === "call" && item.duration ? ` · ${fmtDuration(item.duration)}` : ""}
                    {item.kind === "call" && item.disposition ? ` · ${item.disposition}` : ""}
                    {item.kind === "task" && item.dueAt ? ` · יעד ${relativeTime(item.dueAt)}` : ""}
                  </small>
                  {item.kind === "call" && item.recordUrl && (
                    <audio controls preload="none" src={item.recordUrl} className="mt-1.5 h-8 w-full max-w-xs" />
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      </Panel>
    </motion.div>
  );
}
