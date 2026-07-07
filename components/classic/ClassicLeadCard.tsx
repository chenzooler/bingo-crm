"use client";
/**
 * ClassicLeadCard — שכפול Yoatsim אחד-על-אחד, בעיצוב בינגו.
 * 3 עמודות (RTL): פרטי כרטיס (15 סקשנים) · משימות ופעילויות · אנשי קשר + תהליכים.
 * כותרת: שם + נשמר ☁️ / אוטומציה בוט / סמיילי + תאריך קליטה + הדפסה/ארכיון.
 */
import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Printer, Archive, ArchiveRestore, ChevronRight, Cloud, Loader2, CloudOff, Bot,
  ChevronDown, ChevronUp, Copy, FlaskConical,
} from "lucide-react";
import { CARD_SECTIONS, type SectionDef } from "@/lib/yoatsim/card-schema";
import type { ClassicValues } from "@/lib/yoatsim/values";
import { cn, formatDate } from "@/lib/utils";
import {
  useClassicCard, type ClassicLeadDTO, type ClassicActivity, type ClassicProcess, type UserOption,
} from "./useClassicCard";
import { FieldRenderer, fieldVisible } from "./FieldRenderer";
import { SmileyBanner, LendersSection, SourceSection, FormsSection } from "./CustomSections";
import { ActivitiesRail } from "./ActivitiesRail";
import { ContactsProcessesRail } from "./ContactsProcessesRail";

export function ClassicLeadCard(props: {
  lead: ClassicLeadDTO;
  initialValues: ClassicValues;
  initialActivities: ClassicActivity[];
  initialProcesses: ClassicProcess[];
  users: UserOption[];
}) {
  const state = useClassicCard(props);
  const { lead, values, set, saveState } = state;
  const smiley = (values.smileyAuto || values.smileyManual) as string | undefined;

  /* ---------- פעולות הכרטיס: שכפול · כרטיס בדיקה · ארכיון ---------- */
  const router = useRouter();
  const [archived, setArchived] = React.useState(lead.archived);
  const [cloning, setCloning] = React.useState<"duplicate" | "test" | null>(null);

  const cloneCard = async (kind: "duplicate" | "test") => {
    if (cloning) return;
    setCloning(kind);
    try {
      const res = await fetch(`/api/leads/${lead.id}/clone`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(kind === "test" ? { kind: "test" } : {}),
      });
      if (res.ok) {
        const row = await res.json();
        router.push(`/leads/${row.id}`);
        return;
      }
    } catch { /* נשאר בכרטיס */ }
    setCloning(null);
  };

  const toggleArchive = async () => {
    const next = !archived;
    if (next && !window.confirm("להעביר את הכרטיס לארכיון?")) return;
    try {
      const res = await fetch(`/api/leads/${lead.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ archived: next }),
      });
      if (res.ok) setArchived(next);
    } catch { /* best effort */ }
  };

  return (
    <div className="max-w-[1440px]">
      {/* ============ כותרת הכרטיס ============ */}
      <div className="b-card px-5 py-3.5 mb-4 flex items-center gap-3 flex-wrap sticky top-[60px] z-30">
        <Link href="/leads" className="size-9 rounded-full bg-bingo-gray-100 hover:bg-bingo-gray-150 flex items-center justify-center text-bingo-gray-600 shrink-0" aria-label="חזרה">
          <ChevronRight className="size-4" />
        </Link>
        <h1 className="text-[19px] font-bold text-bingo-black">{lead.fullName}</h1>

        {/* תגיות — כמו במקור */}
        <span className={cn(
          "b-chip text-[11px]",
          saveState === "saved" ? "b-chip-gray" : saveState === "saving" ? "b-chip-blue" : "b-chip-red",
        )}>
          {saveState === "saved" && <><Cloud className="size-3" /> נשמר</>}
          {saveState === "saving" && <><Loader2 className="size-3 animate-spin" /> שומר…</>}
          {saveState === "error" && <><CloudOff className="size-3" /> שגיאת שמירה</>}
        </span>
        <span className="b-chip b-chip-blue text-[11px]"><Bot className="size-3" /> אוטומציה בוט</span>

        {/* תת-סוג כרטיס — שכפול / כרטיס בדיקה, עם קישור לכרטיס האב */}
        {lead.cardKind === "duplicate" && (
          lead.parentLeadId ? (
            <Link href={`/leads/${lead.parentLeadId}`} className="b-chip b-chip-orange text-[11px] hover:brightness-95 transition" title="לכרטיס המקור">
              <Copy className="size-3" /> שכפול · מקור #{lead.parentLeadId}
            </Link>
          ) : (
            <span className="b-chip b-chip-orange text-[11px]"><Copy className="size-3" /> שכפול</span>
          )
        )}
        {lead.cardKind === "test" && (
          lead.parentLeadId ? (
            <Link href={`/leads/${lead.parentLeadId}`} className="b-chip b-chip-gray text-[11px] hover:bg-bingo-gray-150 transition" title="לכרטיס המקור">
              <FlaskConical className="size-3" /> כרטיס בדיקה · מקור #{lead.parentLeadId}
            </Link>
          ) : (
            <span className="b-chip b-chip-gray text-[11px]"><FlaskConical className="size-3" /> כרטיס בדיקה</span>
          )
        )}
        {archived && (
          <span className="b-chip b-chip-dark text-[11px]"><Archive className="size-3" /> בארכיון</span>
        )}

        {smiley && (
          <span className={cn("b-chip text-[11px]",
            smiley === "green" ? "b-chip-green" : smiley === "yellow" ? "b-chip-orange" : "b-chip-red")}>
            <span className={cn("size-2 rounded-full",
              smiley === "green" ? "bg-bingo-green" : smiley === "yellow" ? "bg-status-yellow" : "bg-status-red")} />
            סמיילי
          </span>
        )}

        <span className="text-[11.5px] text-bingo-gray-400 mr-auto">
          תאריך קליטה: <b className="text-bingo-gray-600 tabular-nums">{formatDate(lead.intakeDate)}</b>
        </span>
        <div className="flex gap-1.5">
          <button title="שכפול" onClick={() => void cloneCard("duplicate")} disabled={!!cloning}
            className="size-9 rounded-full bg-bingo-gray-100 hover:bg-bingo-gray-150 flex items-center justify-center text-bingo-gray-500 disabled:opacity-50">
            {cloning === "duplicate" ? <Loader2 className="size-4 animate-spin" /> : <Copy className="size-4" />}
          </button>
          <button title="כרטיס בדיקה" onClick={() => void cloneCard("test")} disabled={!!cloning}
            className="size-9 rounded-full bg-bingo-gray-100 hover:bg-bingo-gray-150 flex items-center justify-center text-bingo-gray-500 disabled:opacity-50">
            {cloning === "test" ? <Loader2 className="size-4 animate-spin" /> : <FlaskConical className="size-4" />}
          </button>
          <button onClick={() => window.print()} title="הדפסה" className="size-9 rounded-full bg-bingo-gray-100 hover:bg-bingo-gray-150 flex items-center justify-center text-bingo-gray-500">
            <Printer className="size-4" />
          </button>
          <button title={archived ? "שחזור מארכיון" : "ארכיון"} onClick={() => void toggleArchive()}
            className={cn(
              "size-9 rounded-full flex items-center justify-center transition",
              archived
                ? "bg-bingo-black text-white hover:bg-bingo-gray-600"
                : "bg-bingo-gray-100 hover:bg-bingo-gray-150 text-bingo-gray-500",
            )}>
            {archived ? <ArchiveRestore className="size-4" /> : <Archive className="size-4" />}
          </button>
        </div>
      </div>

      {/* ============ 3 עמודות — כמו במקור ============ */}
      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_340px_290px] gap-4 items-start">
        {/* עמודה ראשית — פרטי כרטיס */}
        <div className="space-y-3.5 min-w-0">
          {CARD_SECTIONS.map((section) => (
            <ClassicSection key={section.id} section={section} state={state} values={values} set={set} />
          ))}
        </div>

        {/* משימות ופעילויות */}
        <div className="xl:sticky xl:top-[130px]">
          <ActivitiesRail state={state} />
        </div>

        {/* אנשי קשר + תהליכים + אחראי */}
        <div className="xl:sticky xl:top-[130px]">
          <ContactsProcessesRail state={state} users={props.users} />
        </div>
      </div>
    </div>
  );
}

/* ============ סקשן בודד ============ */
function ClassicSection({ section, state, values, set }: {
  section: SectionDef;
  state: ReturnType<typeof useClassicCard>;
  values: ClassicValues;
  set: (key: string, value: ClassicValues[string]) => void;
}) {
  const [showExtras, setShowExtras] = React.useState(false);

  if (section.custom === "smiley-banner") {
    return <SmileyBanner values={values} set={set} />;
  }

  return (
    <section className="b-card p-5">
      <header className="flex items-center gap-2 mb-4">
        {section.bullet === "green" && <span className="size-2.5 rounded-full bg-bingo-green shrink-0" />}
        {section.bullet === "dot" && <span className="size-2.5 rounded-full bg-bingo-black shrink-0" />}
        <h2 className="text-[15.5px] font-bold text-bingo-black">{section.title}</h2>
      </header>

      {section.custom === "lenders" ? (
        <LendersSection values={values} set={set} />
      ) : section.custom === "source" ? (
        <SourceSection lead={state.lead} />
      ) : section.custom === "forms" ? (
        <FormsSection state={state} />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-3.5">
            {section.fields.filter((f) => fieldVisible(f, values)).map((f) => (
              <div key={f.key} className={cn(f.wide && "sm:col-span-2 lg:col-span-3")}>
                {f.type !== "checkbox" && (
                  <label className="block text-[11.5px] font-semibold text-bingo-gray-500 mb-1">{f.label}</label>
                )}
                <FieldRenderer field={f} values={values} set={set} />
                {f.note && f.type !== "checkbox" && f.type !== "readonly" && (
                  <p className="mt-0.5 text-[10px] text-bingo-gray-400">{f.note}</p>
                )}
              </div>
            ))}
          </div>

          {section.collapsedExtras && (
            <div className="mt-3.5 pt-3 border-t border-bingo-gray-100">
              <button onClick={() => setShowExtras((x) => !x)}
                className="text-[12px] font-semibold text-bingo-gray-400 hover:text-bingo-gray-600 inline-flex items-center gap-1">
                {showExtras ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
                שדות נוספים
              </button>
              {showExtras && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-3.5 mt-3 animate-fade-in">
                  {section.collapsedExtras.map((f) => (
                    <div key={f.key}>
                      <label className="block text-[11.5px] font-semibold text-bingo-gray-500 mb-1">{f.label}</label>
                      <FieldRenderer field={f} values={values} set={set} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </section>
  );
}
