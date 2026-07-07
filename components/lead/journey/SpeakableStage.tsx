"use client";
/**
 * SpeakableStage — רֶצֶף: the spoken-sentence face of the call.
 * ONE giant sentence the rep reads out loud, ONE input beneath it.
 * Enter seals the value — it gets absorbed into the sentence, which joins
 * the dimmed past stream above. Disqualification morphs the next sentence
 * into the vehicle question (no modal, no hesitation the customer can hear).
 * All logic stays in lib/journey.ts; lib/script.ts is display strings only.
 */
import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CornerDownLeft, SkipForward, Mic, MicOff } from "lucide-react";
import {
  type JourneyState, type SectionId, type Smiley,
  fieldFilled, sectionMeta, FIRST_CALL_SECTIONS,
} from "@/lib/journey";
import { SCRIPT, PIVOT_BEAT, activeBeats, type Beat } from "@/lib/script";
import { cn, formatCurrency, formatDate, isValidIsraeliId } from "@/lib/utils";
import { useJourney } from "./useJourney";
import { SectionRenderer } from "./SectionRenderer";
import { DeadEndPanel } from "./DeadEndPanel";
import { OptionGrid } from "./controls/OptionGrid";
import { MoneyInput } from "./controls/MoneyInput";
import { JourneyContext } from "./useJourney";

/* ---------- value formatting for absorbed sentences ---------- */
const LIGHT_LABEL: Record<string, string> = { green: "ירוק", yellow: "צהוב", red: "אדום" };
const LIGHT_DOT: Record<string, string> = { green: "bg-bingo-green", yellow: "bg-status-yellow", red: "bg-status-red" };

function beatValue(b: Beat, j: JourneyState): React.ReactNode {
  const f0 = b.fields[0];
  const raw = j[f0];
  switch (b.kind) {
    case "money": {
      const n = Number(String(raw ?? "").replace(/\D/g, ""));
      return n ? <bdi dir="ltr" className="tabular-nums">{formatCurrency(n)}</bdi> : null;
    }
    case "yesno":
      return raw === "yes" ? "יש" : raw === "no" ? "אין" : null;
    case "lights": {
      const s = raw as Smiley;
      if (!s) return null;
      return (
        <span className="inline-flex items-center gap-1.5">
          <span className={cn("size-3 rounded-full inline-block", LIGHT_DOT[s])} />
          {LIGHT_LABEL[s]}
        </span>
      );
    }
    case "chips-multi":
      return Array.isArray(raw) && raw.length ? raw.join(", ") : null;
    case "pair-text": {
      const parts = b.fields.map((f) => j[f]).filter(Boolean);
      return parts.length ? parts.join(" · ") : null;
    }
    case "date":
      return raw ? formatDate(String(raw)) : null;
    case "chips":
      if (f0 === "vehicleFree") return raw === "yes" ? "נקי" : raw === "no" ? "משועבד" : null;
      return (raw as string) || null;
    default:
      return (raw as string) || null;
  }
}

function beatFilled(b: Beat, j: JourneyState): boolean {
  return b.fields.every((f) => fieldFilled(j, f));
}

/* ============================================================ */

export function SpeakableStage() {
  const ctx = useJourney();
  const { j, patch, lead, focused, current, deadEnd, askVehicle, answerVehicle, prefilled } = ctx;
  const [skipped, setSkipped] = React.useState<Set<string>>(() => new Set());
  const [editKey, setEditKey] = React.useState<string | null>(null);

  const beats = activeBeats(j);
  const firstCallIds = React.useMemo(() => new Set<SectionId>(FIRST_CALL_SECTIONS.map((s) => s.id)), []);

  /* --- which beat is on stage --- */
  const naturalBeat = beats.find((b) => !beatFilled(b, j) && !skipped.has(b.key)) ?? null;
  let currentBeat: Beat | null = naturalBeat;
  if (editKey) currentBeat = beats.find((b) => b.key === editKey) ?? naturalBeat;
  // map click: focus a specific first-call section → its first open beat
  else if (focused !== current && firstCallIds.has(focused) && focused !== "contract") {
    const inSection = beats.filter((b) => b.section === focused);
    currentBeat = inSection.find((b) => !beatFilled(b, j)) ?? inSection[0] ?? naturalBeat;
  }
  // THE PIVOT MORPH — the next sentence simply becomes the vehicle question
  const pivotActive = askVehicle && !deadEnd;
  if (pivotActive) currentBeat = PIVOT_BEAT;

  const sectionFace: SectionId | null =
    deadEnd ? null :
    !firstCallIds.has(focused) || focused === "contract" ? focused :
    currentBeat === null ? "contract" : null;

  /* --- committing --- */
  const commit = React.useCallback((): boolean => {
    if (pivotActive) return false; // pivot commits via its own yes/no only
    if (!currentBeat) return false;
    if (beatFilled(currentBeat, j)) {
      setEditKey(null);
      return true;
    }
    if (currentBeat.skippable) {
      setSkipped((s) => new Set(s).add(currentBeat!.key));
      setEditKey(null);
      return true;
    }
    return false;
  }, [currentBeat, j, pivotActive]);

  // Enter ownership: the keys layer delegates to us in speak mode
  React.useEffect(() => {
    ctx.enterRef.current = commit;
    return () => { ctx.enterRef.current = null; };
  }, [ctx.enterRef, commit]);

  /* --- past stream (last 4 answered/skipped beats before the current one) --- */
  const past = beats
    .filter((b) => (beatFilled(b, j) || skipped.has(b.key)) && b.key !== currentBeat?.key)
    .slice(-4);

  const meta = currentBeat ? sectionMeta(currentBeat.section) : sectionFace ? sectionMeta(sectionFace) : null;

  return (
    <div className="b-card p-6 min-h-[460px] flex flex-col overflow-hidden">
      {/* ghost opener — the rep reads, never scans */}
      {past.length === 0 && currentBeat && !pivotActive && (
        <p className="text-[14px] text-bingo-gray-400 leading-relaxed mb-4">
          ״היי {lead.fullName.split(" ")[0]}! מדברים מבינגו מימון. פנית אלינו לגבי הלוואה — תפסתי אותך טוב?״
        </p>
      )}

      {/* the dimmed past stream — values frozen in gold */}
      {past.length > 0 && (
        <div className="space-y-1.5 mb-5">
          {past.map((b) => {
            const v = beatValue(b, j);
            const template = b.done ?? b.say;
            const [before, after] = template.split("{v}");
            return (
              <button
                key={b.key}
                onClick={() => setEditKey(b.key)}
                className="block w-full text-right text-[14px] leading-snug text-bingo-gray-400 hover:text-bingo-gray-600 transition-colors"
                title="לחץ לתיקון"
              >
                {v === null ? (
                  <span className="line-through decoration-bingo-gray-200">{b.say} — דולג</span>
                ) : template.includes("{v}") ? (
                  <>
                    {before}
                    <span className="font-bold text-[#B08900]">{v}</span>
                    {after}
                  </>
                ) : (
                  <>{template} <span className="font-bold text-[#B08900]">{v}</span></>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* THE STAGE */}
      <div className="flex-1 flex flex-col justify-center">
        <AnimatePresence mode="wait">
          {deadEnd ? (
            <motion.div key="deadend" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <DeadEndPanel />
            </motion.div>
          ) : currentBeat ? (
            <motion.div
              key={currentBeat.key}
              initial={{ opacity: 0, y: 18, filter: "blur(2px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.24, ease: "easeOut" }}
            >
              <div className="flex items-center gap-2 mb-3">
                {meta && <span className="b-eyebrow">{meta.num} · {meta.short}</span>}
                {currentBeat.internal ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-bingo-gray-100 px-2 py-0.5 text-[10px] font-bold text-bingo-gray-500">
                    <MicOff className="size-2.5" /> פנימי — לא מקריאים
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-bingo-green-light px-2 py-0.5 text-[10px] font-bold text-bingo-green-deep">
                    <Mic className="size-2.5" /> מקריאים ללקוח
                  </span>
                )}
                {pivotActive && (
                  <span className="b-chip b-chip-orange text-[10px] py-0.5 animate-fade-in">מסלול כל מטרה נפסל — שאל עכשיו</span>
                )}
              </div>

              <h2 className="text-[32px] font-extrabold text-bingo-black leading-tight max-w-[34ch] mb-6">
                {currentBeat.say}
              </h2>

              <BeatInput
                beat={currentBeat}
                pivot={pivotActive}
                onCommit={commit}
                onAnswerVehicle={answerVehicle}
                prefilled={prefilled.has(currentBeat.fields[0] as string)}
              />
            </motion.div>
          ) : sectionFace ? (
            <motion.div key={sectionFace} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -14 }} transition={{ duration: 0.24 }}>
              {meta && (
                <>
                  <p className="b-eyebrow mb-1">שלב {meta.num} · {meta.short}</p>
                  <h2 className="text-[26px] font-extrabold text-bingo-black leading-tight mb-2">{meta.title}</h2>
                  <p className="text-[15px] text-bingo-gray-600 border-r-[3px] border-bingo-green pr-3 mb-6">{meta.hint}</p>
                </>
              )}
              <SectionRenderer id={sectionFace} />
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      {/* legal keys hint */}
      {!deadEnd && currentBeat && (
        <footer className="flex items-center gap-3 pt-5 mt-6 border-t border-bingo-gray-100 text-[10.5px] text-bingo-gray-400">
          <span className="flex items-center gap-1">
            <kbd className="rounded bg-bingo-gray-100 px-1 py-px font-bold">↵</kbd>
            {beatFilled(currentBeat, j) ? "המשפט הבא" : currentBeat.skippable ? "דלג" : "חתום תשובה"}
          </span>
          {(currentBeat.kind === "chips" || currentBeat.kind === "chips-multi" || currentBeat.kind === "lights" || currentBeat.kind === "yesno") && (
            <span className="flex items-center gap-1"><kbd className="rounded bg-bingo-gray-100 px-1 py-px font-bold">1-9</kbd> בחירה</span>
          )}
          <span className="flex items-center gap-1"><kbd className="rounded bg-bingo-gray-100 px-1 py-px font-bold">Esc</kbd> סיום שיחה</span>
          {currentBeat.skippable && !beatFilled(currentBeat, j) && (
            <button onClick={commit} className="mr-auto inline-flex items-center gap-1 hover:text-bingo-gray-600">
              <SkipForward className="size-3" /> דלג
            </button>
          )}
        </footer>
      )}
    </div>
  );
}

/* ============================================================
   BeatInput — one input, by kind. Selection auto-seals where natural.
   ============================================================ */
function BeatInput({ beat, pivot, onCommit, onAnswerVehicle, prefilled }: {
  beat: Beat;
  pivot: boolean;
  onCommit: () => boolean;
  onAnswerVehicle: (has: boolean) => void;
  prefilled: boolean;
}) {
  const { j, patch } = useJourney();
  const f0 = beat.fields[0];
  const autoSeal = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  React.useEffect(() => () => { if (autoSeal.current) clearTimeout(autoSeal.current); }, []);
  const sealSoon = () => {
    if (autoSeal.current) clearTimeout(autoSeal.current);
    autoSeal.current = setTimeout(() => onCommit(), 220);
  };

  switch (beat.kind) {
    case "money":
      return (
        <div className="max-w-xs">
          <MoneyInput
            big autoFocus
            placeholder={beat.placeholder}
            value={(j[f0] as string) || ""}
            onChange={(v) => patch({ [f0]: v } as Partial<JourneyState>)}
            onCommit={() => onCommit()}
          />
          {prefilled && <PrefillNote />}
        </div>
      );

    case "chips":
      return (
        <div>
          <OptionGrid
            size="lg"
            options={beat.options!}
            value={f0 === "vehicleFree"
              ? (j.vehicleFree === "yes" ? "נקי" : j.vehicleFree === "no" ? "משועבד" : null)
              : (j[f0] as string) ?? null}
            onChange={(v) => {
              if (f0 === "vehicleFree") patch({ vehicleFree: v === "נקי" ? "yes" : "no" });
              else patch({ [f0]: v } as Partial<JourneyState>);
              sealSoon();
            }}
          />
          {prefilled && <PrefillNote />}
        </div>
      );

    case "chips-multi":
      return (
        <OptionGrid
          size="lg" multi
          options={beat.options!}
          value={(j[f0] as string[]) ?? []}
          onChange={(v) => patch({ [f0]: v } as Partial<JourneyState>)}
        />
      );

    case "yesno":
      return (
        <YesNoBig
          value={j.hasVehicle}
          onPick={(has) => {
            if (pivot || beat.key === "pivot") onAnswerVehicle(has);
            else patch({ hasVehicle: has ? "yes" : "no" });
            if (has || !pivot) sealSoon();
          }}
        />
      );

    case "lights":
      return <LightsRow value={j[f0] as Smiley} onPick={(v) => { patch({ [f0]: v } as Partial<JourneyState>); sealSoon(); }} />;

    case "id": {
      const val = (j.idNumber as string) || "";
      const invalid = val.length > 0 && !isValidIsraeliId(val);
      return (
        <div className="max-w-xs">
          <input
            className={cn("b-input h-14 text-[22px] font-bold tabular-nums", invalid && "border-status-red")}
            dir="ltr" style={{ textAlign: "right" }}
            inputMode="numeric" maxLength={9} autoFocus
            placeholder={beat.placeholder}
            value={val}
            onChange={(e) => patch({ idNumber: e.target.value.replace(/\D/g, "") })}
            onKeyDown={(e) => { if (e.key === "Enter" && !invalid) { e.preventDefault(); onCommit(); } }}
          />
          {invalid && <p className="mt-1.5 text-[11.5px] font-semibold text-status-red">ת״ז לא תקינה — בדוק ספרת ביקורת</p>}
          {prefilled && <PrefillNote />}
        </div>
      );
    }

    case "number":
      return (
        <input
          className="b-input h-14 text-[22px] font-bold tabular-nums max-w-40"
          inputMode="decimal" autoFocus dir="ltr" style={{ textAlign: "right" }}
          placeholder={beat.placeholder}
          value={(j[f0] as string) || ""}
          onChange={(e) => patch({ [f0]: e.target.value } as Partial<JourneyState>)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); onCommit(); } }}
        />
      );

    case "date":
      return (
        <input
          className="b-input h-14 text-[18px] font-bold max-w-56"
          type="date" autoFocus
          value={(j[f0] as string) || ""}
          onChange={(e) => patch({ [f0]: e.target.value } as Partial<JourneyState>)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); onCommit(); } }}
        />
      );

    case "text":
      return (
        <input
          className="b-input h-14 text-[18px] font-semibold max-w-md"
          autoFocus placeholder={beat.placeholder}
          value={(j[f0] as string) || ""}
          onChange={(e) => patch({ [f0]: e.target.value } as Partial<JourneyState>)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); onCommit(); } }}
        />
      );

    case "pair-text": {
      const [fa, fb] = beat.fields;
      return (
        <div className="flex gap-3 max-w-lg">
          <input
            className="b-input h-14 text-[18px] font-semibold"
            autoFocus placeholder={beat.placeholder?.split("·")[0]?.trim()}
            value={(j[fa] as string) || ""}
            onChange={(e) => patch({ [fa]: e.target.value } as Partial<JourneyState>)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                (e.currentTarget.nextElementSibling as HTMLInputElement | null)?.focus();
              }
            }}
          />
          <input
            className="b-input h-14 text-[18px] font-semibold"
            placeholder={beat.placeholder?.split("·")[1]?.trim()}
            value={(j[fb] as string) || ""}
            onChange={(e) => patch({ [fb]: e.target.value } as Partial<JourneyState>)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); onCommit(); } }}
          />
        </div>
      );
    }

    case "text-suggest":
      return (
        <div className="max-w-md space-y-2.5">
          <div className="flex flex-wrap gap-1.5">
            {beat.options!.map((o, i) => (
              <button key={o} onClick={() => { patch({ [f0]: o } as Partial<JourneyState>); sealSoon(); }}
                className={cn("b-chip transition text-[13px]",
                  j[f0] === o ? "b-chip-dark" : "b-chip-gray hover:bg-bingo-gray-150")}>
                {o} <kbd className="text-[9px] opacity-60">{i + 1}</kbd>
              </button>
            ))}
          </div>
          <input
            className="b-input h-12 text-[16px] font-semibold"
            placeholder={beat.placeholder}
            value={(j[f0] as string) || ""}
            onChange={(e) => patch({ [f0]: e.target.value } as Partial<JourneyState>)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); onCommit(); } }}
          />
        </div>
      );
  }
}

function PrefillNote() {
  return <p className="mt-1.5 text-[11px] font-semibold text-bingo-green-deep">✓ הגיע מהמערכת — רק תאשר מול הלקוח</p>;
}

/* big yes/no with digit registration */
function YesNoBig({ value, onPick }: { value: JourneyState["hasVehicle"]; onPick: (has: boolean) => void }) {
  const ctx = React.useContext(JourneyContext);
  const pickRef = React.useRef(onPick);
  pickRef.current = onPick;
  const valRef = React.useRef(value);
  valRef.current = value;
  React.useEffect(() => {
    if (!ctx) return;
    return ctx.registerOptionGroup({
      applyDigit: (n) => {
        if (n === 1) { pickRef.current(true); return true; }
        if (n === 2) { pickRef.current(false); return true; }
        return false;
      },
      isSatisfied: () => valRef.current !== null,
    });
  }, [ctx]);
  return (
    <div className="flex gap-3 max-w-lg">
      <button onClick={() => onPick(true)}
        className={cn("b-pill b-pill-lg h-16 flex-1 justify-center text-[17px]",
          value === "yes" ? "b-pill-green" : "b-pill-ghost")}>
        כן, יש רכב 🚗 <kbd className="rounded bg-black/10 px-1.5 text-[10px] font-bold">1</kbd>
      </button>
      <button onClick={() => onPick(false)}
        className={cn("b-pill b-pill-lg h-16 flex-1 justify-center text-[17px]",
          value === "no" ? "b-pill-dark" : "b-pill-ghost")}>
        אין רכב <kbd className="rounded bg-bingo-gray-100 px-1.5 text-[10px] font-bold">2</kbd>
      </button>
    </div>
  );
}

/* three big lights with digit registration */
const LIGHTS: Array<{ v: Exclude<Smiley, null>; label: string; ring: string; fill: string }> = [
  { v: "green",  label: "ירוק",  ring: "border-bingo-green",   fill: "bg-bingo-green" },
  { v: "yellow", label: "צהוב", ring: "border-status-yellow", fill: "bg-status-yellow" },
  { v: "red",    label: "אדום",  ring: "border-status-red",    fill: "bg-status-red" },
];

function LightsRow({ value, onPick }: { value: Smiley; onPick: (v: Exclude<Smiley, null>) => void }) {
  const ctx = React.useContext(JourneyContext);
  const pickRef = React.useRef(onPick);
  pickRef.current = onPick;
  const valRef = React.useRef(value);
  valRef.current = value;
  React.useEffect(() => {
    if (!ctx) return;
    return ctx.registerOptionGroup({
      applyDigit: (n) => {
        const l = LIGHTS[n - 1];
        if (!l) return false;
        pickRef.current(l.v);
        return true;
      },
      isSatisfied: () => valRef.current !== null,
    });
  }, [ctx]);
  return (
    <div className="flex items-center gap-4">
      {LIGHTS.map((l, i) => (
        <button key={l.v} onClick={() => onPick(l.v)} aria-label={l.label}
          className={cn("relative size-16 rounded-full border-4 transition-all flex items-center justify-center",
            value === l.v ? cn(l.ring, "scale-110 shadow-lg") : "border-bingo-gray-150 hover:border-bingo-gray-300")}>
          <span className={cn("size-10 rounded-full", l.fill, value === l.v ? "opacity-100" : "opacity-25")} />
          <kbd className="absolute -bottom-5 text-[10px] font-bold text-bingo-gray-400">{i + 1}</kbd>
        </button>
      ))}
    </div>
  );
}
