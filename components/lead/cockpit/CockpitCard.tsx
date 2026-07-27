"use client";
/**
 * CockpitCard — קוקפיט השיחה הפרימיום (card-concept v2, מאושר ע"י חן).
 * שני מצבים על אותו מנוע נתונים (useClassicCard — אותה שמירה אוטומטית + מנוע
 * אוטומציות בשרת):
 *   cockpit — השיחה הראשונה: פתיחה → חמשת שערי הסינון → במת הרמזור → הסכם.
 *   full    — התיק המלא: כל 15 הסקשנים הקלאסיים בחומרי הפסטל.
 * המצב נגזר: טופס חתום / contractSigned / stage אחרי הסכם ⇒ תיק מלא;
 * מתג זכוכית בכותרת מאפשר מעבר ידני — שום דבר לא נעול.
 */
import * as React from "react";
import Link from "next/link";
import {
  Printer, Archive, ArchiveRestore, ChevronRight, Cloud, Loader2, CloudOff,
  Copy, FlaskConical,
} from "lucide-react";
import { ClickToCallPhone } from "@/components/dialer/ClickToCallPhone";
import { CARD_SECTIONS } from "@/lib/yoatsim/card-schema";
import { cn, formatDate } from "@/lib/utils";
import { Ramzor } from "@/components/ui/Ramzor";
import { Confetti } from "@/components/ui/Confetti";
import {
  useClassicCard, type ClassicLeadDTO, type ClassicActivity, type ClassicProcess, type UserOption,
} from "@/components/classic/useClassicCard";
import { useCardActions } from "@/components/classic/useCardActions";
import { ClassicSection } from "@/components/classic/ClassicSections";
import { FieldRenderer } from "@/components/classic/FieldRenderer";
import { ActivitiesRail } from "@/components/classic/ActivitiesRail";
import { ContactsProcessesRail } from "@/components/classic/ContactsProcessesRail";
import { ScreeningGates } from "./ScreeningGates";
import { RamzorModal } from "./RamzorModal";
import { WaitSignature } from "./WaitSignature";
import { GATES, gateAnswered, gateFlagged, worstRamzor, type SentFormRow } from "./shared";

export type CockpitLeadDTO = ClassicLeadDTO & { stage: string };

/* שלבי lifecycle שאחרי ההסכם — הכרטיס נפתח לתיק מלא */
const PAST_AGREEMENT_STAGES = new Set(["DOCS", "DISBURSEMENT", "PAID"]);

/* שדות בלוק הפתיחה — "איך אפשר לעזור" מהסכמה הקלאסית */
const HELP_SECTION = CARD_SECTIONS.find((s) => s.id === "help")!;

export function CockpitCard(props: {
  lead: CockpitLeadDTO;
  initialValues: Parameters<typeof useClassicCard>[0]["initialValues"];
  initialActivities: ClassicActivity[];
  initialProcesses: ClassicProcess[];
  initialForms: SentFormRow[];
  users: UserOption[];
}) {
  const state = useClassicCard(props);
  const { lead, values, set, saveState, addNote, addProcess } = state;
  const { archived, cloning, cloneCard, toggleArchive } = useCardActions(props.lead);

  /* ---------- טפסים (SentForm) — מקור האמת של מצב ההסכם ---------- */
  const [forms, setForms] = React.useState<SentFormRow[]>(props.initialForms);

  const sendForm = React.useCallback(async (templateName: string): Promise<boolean> => {
    try {
      const res = await fetch("/api/forms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId: lead.id, templateName }),
      });
      if (!res.ok) return false;
      const row = await res.json();
      setForms((f) => [{
        id: row.id, templateName: row.templateName, status: row.status,
        sentAt: row.sentAt, signedAt: row.signedAt ?? null,
      }, ...f]);
      return true;
    } catch {
      return false;
    }
  }, [lead.id]);

  /* הקונפטי הגדול — פעם אחת, רק ברגע החתימה */
  const [bigConfetti, setBigConfetti] = React.useState(0);
  const celebrated = React.useRef(false);

  const markSigned = React.useCallback(async (id: number): Promise<boolean> => {
    try {
      const res = await fetch("/api/forms", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: "signed" }),
      });
      if (!res.ok) return false;
      const row = await res.json();
      setForms((f) => f.map((x) => (x.id === id ? { ...x, status: row.status, signedAt: row.signedAt ?? null } : x)));
      if (!celebrated.current) {
        celebrated.current = true;
        setBigConfetti((c) => c + 1);
      }
      return true;
    } catch {
      return false;
    }
  }, []);

  /* ---------- גזירת המצב ---------- */
  const derivedFull =
    forms.some((f) => f.status === "signed") ||
    !!values.contractSigned ||
    PAST_AGREEMENT_STAGES.has(props.lead.stage);
  const [modeOverride, setModeOverride] = React.useState<"cockpit" | "full" | null>(null);
  const mode = modeOverride ?? (derivedFull ? "full" : "cockpit");

  /* ---------- הרמזור הקבוע + מודאל ---------- */
  const headerRamzor = worstRamzor(values);
  const [modalOpen, setModalOpen] = React.useState(false);
  const anyFlagged = GATES.some((g) => gateAnswered(g, values) && gateFlagged(g, values));

  /* ---------- פס שלבי השיחה ---------- */
  const pendingForm = forms.find((f) => f.status === "sent");
  const callStages = [
    { label: "פתיחה", done: !!(values.amountRequested || values.loanPurpose) },
    { label: "סינון", done: GATES.every((g) => gateAnswered(g, values)) },
    { label: "רמזור", done: headerRamzor !== null },
    { label: "הסכם", done: forms.length > 0 },
    { label: "תיק מלא", done: derivedFull },
  ];
  const nowIdx = callStages.findIndex((s) => !s.done);

  const initials = lead.fullName
    .split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join("");

  return (
    <div className="max-w-[1440px]">
      <Confetti trigger={bigConfetti} count={44} />

      {/* ============ כותרת — זכוכית חלבית ============ */}
      <div className="b-glass rounded-[20px] px-5 py-3.5 mb-4 sticky top-[60px] z-30">
        <div className="flex items-center gap-3 flex-wrap">
          <Link href="/leads" className="b-lift size-9 rounded-full bg-bingo-gray-100 hover:bg-bingo-gray-150 flex items-center justify-center text-bingo-gray-600 shrink-0" aria-label="חזרה">
            <ChevronRight className="size-4" />
          </Link>

          {/* אווטאר — ראשי תיבות על אבסידיאן */}
          <span
            className="size-10 rounded-full flex items-center justify-center text-[14px] font-black text-white shrink-0"
            style={{
              background: "linear-gradient(160deg, var(--b-obsidian-1, #3B3A34), var(--b-obsidian-3, #191813))",
              boxShadow: "inset 0 1.5px 0 rgba(255,255,255,.18), 0 6px 16px -6px rgba(25,24,19,.5)",
            }}
            aria-hidden="true"
          >
            {initials}
          </span>

          <div className="min-w-0">
            <h1 className="text-[18px] font-bold text-bingo-black leading-tight truncate">{lead.fullName}</h1>
            <p className="text-[11.5px] text-bingo-gray-500 flex items-center gap-1.5 truncate">
              {lead.phone && <ClickToCallPhone leadId={lead.id} phone={lead.phone} />}
              {(lead.sourceText || lead.source) && <span className="truncate">· {lead.sourceText || lead.source}</span>}
              <span className="tabular-nums">· נקלט {formatDate(lead.intakeDate)}</span>
            </p>
          </div>

          {/* נשמר / שומר */}
          <span className={cn(
            "b-chip text-[11px]",
            saveState === "saved" ? "b-chip-gray" : saveState === "saving" ? "b-chip-blue" : "b-chip-red",
          )}>
            {saveState === "saved" && <><Cloud className="size-3" /> נשמר</>}
            {saveState === "saving" && <><Loader2 className="size-3 animate-spin" /> שומר…</>}
            {saveState === "error" && <><CloudOff className="size-3" /> שגיאת שמירה</>}
          </span>
          {archived && <span className="b-chip b-chip-dark text-[11px]"><Archive className="size-3" /> בארכיון</span>}

          {/* הכוכב — הרמזור הקבוע */}
          <span className="flex items-center gap-2 mr-1">
            <Ramzor size="sm" orientation="horizontal" value={headerRamzor} />
            <span className="text-[11px] font-extrabold text-bingo-gray-500">רמזור</span>
          </span>

          <span className="mr-auto" />

          {/* מתג המצב — שיחה ראשונה / תיק מלא */}
          <div className="b-glass rounded-full p-1 flex items-center gap-1 shrink-0" role="tablist" aria-label="מצב הכרטיס">
            {([["cockpit", "שיחה ראשונה"], ["full", "תיק מלא"]] as const).map(([m, label]) => (
              <button
                key={m}
                type="button"
                role="tab"
                aria-selected={mode === m}
                onClick={() => setModeOverride(m)}
                className={cn(
                  "b-lift rounded-full px-3.5 py-1.5 text-[12px] font-extrabold transition-colors",
                  mode === m
                    ? "text-white"
                    : "text-bingo-gray-500 hover:text-bingo-black",
                )}
                style={mode === m ? { background: "linear-gradient(160deg, var(--b-obsidian-1, #3B3A34), var(--b-obsidian-3, #191813))" } : undefined}
              >
                {label}
              </button>
            ))}
          </div>

          {/* פעולות הכרטיס — אותם handlers של הקלאסי */}
          <div className="flex gap-1.5 shrink-0">
            <button title="שכפול" onClick={() => void cloneCard("duplicate")} disabled={!!cloning}
              className="b-lift size-9 rounded-full bg-bingo-gray-100 hover:bg-bingo-gray-150 flex items-center justify-center text-bingo-gray-500 disabled:opacity-50">
              {cloning === "duplicate" ? <Loader2 className="size-4 animate-spin" /> : <Copy className="size-4" />}
            </button>
            <button title="כרטיס בדיקה" onClick={() => void cloneCard("test")} disabled={!!cloning}
              className="b-lift size-9 rounded-full bg-bingo-gray-100 hover:bg-bingo-gray-150 flex items-center justify-center text-bingo-gray-500 disabled:opacity-50">
              {cloning === "test" ? <Loader2 className="size-4 animate-spin" /> : <FlaskConical className="size-4" />}
            </button>
            <button onClick={() => window.print()} title="הדפסה"
              className="b-lift size-9 rounded-full bg-bingo-gray-100 hover:bg-bingo-gray-150 flex items-center justify-center text-bingo-gray-500">
              <Printer className="size-4" />
            </button>
            <button title={archived ? "שחזור מארכיון" : "ארכיון"} onClick={() => void toggleArchive()}
              className={cn(
                "b-lift size-9 rounded-full flex items-center justify-center transition",
                archived
                  ? "bg-bingo-black text-white hover:bg-bingo-gray-600"
                  : "bg-bingo-gray-100 hover:bg-bingo-gray-150 text-bingo-gray-500",
              )}>
              {archived ? <ArchiveRestore className="size-4" /> : <Archive className="size-4" />}
            </button>
          </div>
        </div>

        {/* פס שלבי השיחה */}
        <div className="flex items-center gap-1.5 mt-3 flex-wrap" aria-label="שלבי השיחה">
          {callStages.map((s, i) => {
            const isNow = i === nowIdx;
            return (
              <React.Fragment key={s.label}>
                {i > 0 && <span className="w-3 h-px bg-bingo-gray-200 shrink-0" aria-hidden="true" />}
                <span
                  className={cn(
                    "b-chip text-[11px] font-extrabold transition-colors",
                    s.done ? "text-bingo-green-dark" : isNow ? "text-white" : "b-chip-gray text-bingo-gray-400",
                  )}
                  style={
                    s.done ? { background: "linear-gradient(150deg, var(--b-tint-mint-1), var(--b-tint-mint-2))" }
                      : isNow ? { background: "linear-gradient(160deg, var(--b-obsidian-1, #3B3A34), var(--b-obsidian-3, #191813))" }
                        : undefined
                  }
                >
                  {s.label}
                </span>
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* ============ 3 עמודות ============ */}
      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_340px_290px] gap-4 items-start">
        {/* ---------- העמודה הראשית ---------- */}
        <div className="space-y-3.5 min-w-0">
          {mode === "cockpit" ? (
            <>
              {/* המתנה לחתימה */}
              {pendingForm && (
                <WaitSignature
                  form={pendingForm}
                  phone={lead.phone}
                  onResend={() => sendForm(pendingForm.templateName)}
                  onMarkSigned={() => markSigned(pendingForm.id)}
                />
              )}

              {/* בלוק הפתיחה — "איך אפשר לעזור" */}
              <section className="b-glass rounded-[20px] p-5">
                <h2 className="text-[15.5px] font-bold text-bingo-black mb-3.5">{HELP_SECTION.title}</h2>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-3">
                  {HELP_SECTION.fields.map((f) => (
                    <div key={f.key} className={cn(f.key === "loanPurpose" && "col-span-2 lg:col-span-1")}>
                      {f.type !== "checkbox" && (
                        <label className="block text-[11.5px] font-semibold text-bingo-gray-500 mb-1">{f.label}</label>
                      )}
                      <FieldRenderer field={f} values={values} set={set} />
                    </div>
                  ))}
                </div>
              </section>

              {/* שערי הסינון */}
              <section className="b-card p-5">
                <h2 className="text-[15.5px] font-bold text-bingo-black mb-3.5">שאלון הסינון — שער אחרי שער</h2>
                <ScreeningGates
                  values={values}
                  set={set}
                  disabled={modalOpen}
                  onLaunch={() => setModalOpen(true)}
                />
              </section>
            </>
          ) : (
            /* ---------- התיק המלא — כל הסקשנים בחומרי הפסטל ---------- */
            CARD_SECTIONS.map((section) => (
              <ClassicSection key={section.id} section={section} state={state} values={values} set={set} />
            ))
          )}
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

      {/* ============ במת הרמזור ============ */}
      <RamzorModal
        open={modalOpen}
        flagged={anyFlagged}
        values={values}
        set={set}
        addNote={addNote}
        addProcess={addProcess}
        sendForm={sendForm}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}
