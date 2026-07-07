"use client";
/**
 * useJourney — the single state engine behind the lead card.
 * Owns: journey state, debounced server autosave (optimistic-lock, 409-aware),
 * navigation (focused section), actions (sign/checks/choose/pay/exit),
 * the activity feed, and the keyboard registry for numbered option groups.
 */
import * as React from "react";
import {
  type JourneyState, type SectionId, type Track, type Smiley,
  initialJourney, deriveTrack, disqualified, needsVehicleAnswer, isDeadEnd,
  currentSection, sectionComplete, activeSections, journeyProgress,
  JOURNEY_LENDERS,
} from "@/lib/journey";

/* ---------- serialized shapes passed from the server page ---------- */
export interface LeadDTO {
  id: number;
  externalId: string | null;
  fullName: string;
  phone: string | null;
  email: string | null;
  idNumber: string | null;
  city: string | null;
  stage: string;
  ownerName: string | null;
  providerName: string | null;
  source: string | null;
  intakeDate: string | null; // ISO
}

export interface ActivityDTO {
  id: number;
  type: string;
  text: string;
  createdAt: string; // ISO
  userName: string | null;
}

/* ---------- keyboard registry (numbered option groups) ---------- */
export interface OptionGroupEntry {
  /** try to apply digit n (1-based); return true if consumed */
  applyDigit: (n: number) => boolean;
  /** group already has a value → digits skip to the next unsatisfied group */
  isSatisfied: () => boolean;
}

export type OverlayKind = "pivot" | "callback" | "shortcuts" | "datasheet" | "outcome" | null;

/** which face the card wears: רֶצֶף spoken script (default) or the classic form */
export type CardFace = "speak" | "form";

export interface JourneyCtx {
  lead: LeadDTO;
  j: JourneyState;
  patch: (p: Partial<JourneyState>) => void;
  prefilled: Set<string>;

  // derived
  track: Track;
  isDisqualified: boolean;
  askVehicle: boolean;
  deadEnd: boolean;
  current: SectionId;
  focused: SectionId;
  sections: SectionId[];
  progress: { done: number; total: number; pct: number };

  // navigation
  goto: (id: SectionId) => void;
  advance: () => void;
  back: () => void;

  // actions (all log to the server timeline)
  markContractSent: (via: "whatsapp" | "sms") => void;
  markSigned: () => void;
  startChecks: () => void;
  finishChecks: () => void;
  chooseLender: (key: string) => void;
  setApproval: (amount: number, rate: number, months: number) => void;
  markVehicleApprovalReflected: () => void;
  markLoanArrived: () => void;
  markPaid: () => void;
  markExit: (reason: string) => void;
  answerVehicle: (has: boolean) => void;
  /** תוצאות כל-מטרה לא הספיקו / הלקוח רוצה גם רכב */
  addVehicleTrack: (reason: "rejected-general" | "amount-insufficient" | "combo") => void;
  setCallback: (whenLabel: string, note: string) => void;
  addNote: (text: string) => void;
  resetJourney: () => Promise<void>;

  // persistence + feedback
  saveState: "saved" | "saving" | "error";
  conflictNotice: boolean;
  saveNow: () => void;
  confettiTrigger: number;
  celebrate: (big?: boolean) => void;
  confettiCount: number;
  activities: ActivityDTO[];

  // overlays + keyboard
  overlay: OverlayKind;
  setOverlay: (o: OverlayKind) => void;
  pivotSnoozed: boolean;
  snoozePivot: () => void;
  registerOptionGroup: (entry: OptionGroupEntry) => () => void;
  handleDigit: (n: number) => boolean;
  noteInputRef: React.RefObject<HTMLInputElement | null>;
  /** רֶצֶף: the speak face claims Enter by setting this (returns true when consumed) */
  enterRef: React.MutableRefObject<(() => boolean) | null>;
  face: CardFace;
}

export const JourneyContext = React.createContext<JourneyCtx | null>(null);

export function useJourney(): JourneyCtx {
  const ctx = React.useContext(JourneyContext);
  if (!ctx) throw new Error("useJourney must be used inside <JourneyProvider>");
  return ctx;
}

/* ============================================================
   The provider hook — created once by JourneyCard
   ============================================================ */
export function useJourneyProvider(input: {
  lead: LeadDTO;
  initial: JourneyState;
  initialVersion: number;
  initialPrefilled: string[];
  initialActivities: ActivityDTO[];
  face?: CardFace;
}): JourneyCtx {
  const { lead } = input;
  const [j, setJ] = React.useState<JourneyState>(input.initial);
  const [saveState, setSaveState] = React.useState<"saved" | "saving" | "error">("saved");
  const [conflictNotice, setConflictNotice] = React.useState(false);
  const [activities, setActivities] = React.useState<ActivityDTO[]>(input.initialActivities);
  const [confettiTrigger, setConfettiTrigger] = React.useState(0);
  const [confettiCount, setConfettiCount] = React.useState(30);
  const [overlay, setOverlay] = React.useState<OverlayKind>(null);
  const [pivotSnoozed, setPivotSnoozed] = React.useState(false);
  const [focusedOverride, setFocusedOverride] = React.useState<SectionId | null>(null);

  const versionRef = React.useRef(input.initialVersion);
  const latestRef = React.useRef(j);
  latestRef.current = j;
  const dirtyRef = React.useRef(false);
  const inFlightRef = React.useRef(false);
  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const noteInputRef = React.useRef<HTMLInputElement | null>(null);
  const enterRef = React.useRef<(() => boolean) | null>(null);

  /* ---------- persistence ---------- */
  const doSave = React.useCallback(async () => {
    if (inFlightRef.current) { dirtyRef.current = true; return; }
    inFlightRef.current = true;
    dirtyRef.current = false;
    setSaveState("saving");
    try {
      const res = await fetch(`/api/leads/${lead.id}/journey`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ journey: latestRef.current, baseVersion: versionRef.current }),
      });
      if (res.status === 409) {
        // another rep saved first — adopt the server state, tell the user
        const data = await res.json();
        versionRef.current = data.version;
        setJ({ ...initialJourney(), ...data.journey });
        setConflictNotice(true);
        setTimeout(() => setConflictNotice(false), 6000);
        setSaveState("saved");
      } else if (res.ok) {
        const data = await res.json();
        versionRef.current = data.version;
        setSaveState("saved");
      } else {
        setSaveState("error");
      }
    } catch {
      setSaveState("error");
    } finally {
      inFlightRef.current = false;
      if (dirtyRef.current) {
        timerRef.current = setTimeout(() => void doSave(), 400);
      }
    }
  }, [lead.id]);

  const scheduleSave = React.useCallback(() => {
    dirtyRef.current = true;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => void doSave(), 800);
  }, [doSave]);

  const saveNow = React.useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    void doSave();
  }, [doSave]);

  // flush on tab close / navigation (keepalive survives pagehide)
  React.useEffect(() => {
    const flush = () => {
      if (!dirtyRef.current && !inFlightRef.current) return;
      try {
        void fetch(`/api/leads/${lead.id}/journey`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ journey: latestRef.current, baseVersion: versionRef.current }),
          keepalive: true,
        });
      } catch { /* best effort */ }
    };
    window.addEventListener("pagehide", flush);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") flush();
    });
    return () => window.removeEventListener("pagehide", flush);
  }, [lead.id]);

  const patch = React.useCallback((p: Partial<JourneyState>) => {
    setJ((s) => ({ ...s, ...p }));
    scheduleSave();
  }, [scheduleSave]);

  /* ---------- activity feed (optimistic append + server post) ---------- */
  const addActivity = React.useCallback((type: string, text: string) => {
    const optimistic: ActivityDTO = {
      id: -Date.now(), type, text, createdAt: new Date().toISOString(), userName: null,
    };
    setActivities((a) => [optimistic, ...a]);
    void fetch(`/api/leads/${lead.id}/activities`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, text }),
    }).then(async (res) => {
      if (!res.ok) return;
      const saved = (await res.json()) as { id: number; createdAt: string };
      setActivities((a) => a.map((x) => (x.id === optimistic.id ? { ...x, id: saved.id, createdAt: saved.createdAt } : x)));
    }).catch(() => { /* optimistic row stays */ });
  }, [lead.id]);

  /* ---------- derived ---------- */
  const track = deriveTrack(j);
  const isDq = disqualified(j);
  const askVehicle = needsVehicleAnswer(j);
  const deadEnd = isDeadEnd(j);
  const current = currentSection(j);
  const sections = activeSections(j);
  const progress = journeyProgress(j);
  const focused = focusedOverride ?? current;

  /* ---------- navigation ---------- */
  const goto = React.useCallback((id: SectionId) => setFocusedOverride(id), []);
  const advance = React.useCallback(() => {
    const ids = activeSections(latestRef.current);
    const cur = focusedOverride ?? currentSection(latestRef.current);
    const idx = ids.indexOf(cur);
    const nextId = ids[Math.min(idx + 1, ids.length - 1)];
    // if the next incomplete section is ahead of nextId, follow the flow instead
    setFocusedOverride(nextId === currentSection(latestRef.current) ? null : nextId);
  }, [focusedOverride]);
  const back = React.useCallback(() => {
    const ids = activeSections(latestRef.current);
    const cur = focusedOverride ?? currentSection(latestRef.current);
    const idx = ids.indexOf(cur);
    setFocusedOverride(ids[Math.max(idx - 1, 0)]);
  }, [focusedOverride]);

  const celebrate = React.useCallback((big = false) => {
    setConfettiCount(big ? 60 : 25);
    setConfettiTrigger((c) => c + 1);
  }, []);

  /* ---------- actions ---------- */
  const markContractSent = React.useCallback((via: "whatsapp" | "sms") => {
    patch({ contractSentAt: new Date().toISOString(), contractSentVia: via });
    addActivity("journey", via === "whatsapp" ? "הסכם התקשרות נשלח ב-WhatsApp" : "הסכם התקשרות נשלח ב-SMS");
  }, [patch, addActivity]);

  const markSigned = React.useCallback(() => {
    const now = new Date();
    const due = new Date(now.getTime() + 60 * 60 * 1000);
    patch({ signedAt: now.toISOString(), callbackDueAt: due.toISOString() });
    celebrate();
    addActivity("journey", "✍️ הלקוח חתם על הסכם התקשרות — חזרה אוטומטית בעוד שעה");
    setFocusedOverride(null);
  }, [patch, celebrate, addActivity]);

  const startChecks = React.useCallback(() => {
    patch({ checksStartedAt: new Date().toISOString() });
    const vehicle = deriveTrack(latestRef.current) === "vehicle";
    addActivity("journey", vehicle ? "חזרה ללקוח — מבקשים 4 מסמכים" : "חזרה ללקוח — מתחילים בדיקות זכאות");
    setFocusedOverride(null);
  }, [patch, addActivity]);

  const finishChecks = React.useCallback(() => {
    patch({ checksDone: true });
    addActivity("journey", "הבדיקות הוזנו — משקפים תוצאות ללקוח");
    setFocusedOverride(null);
  }, [patch, addActivity]);

  const chooseLender = React.useCallback((key: string) => {
    const due = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
    patch({ chosenLender: key, paymentDueAt: due.toISOString() });
    const name = JOURNEY_LENDERS.find((l) => l.key === key)?.name || key;
    addActivity("journey", `הלקוח בחר את ${name} — משימת תשלום לעוד יומיים`);
    setFocusedOverride(null);
  }, [patch, addActivity]);

  const setApproval = React.useCallback((amount: number, rate: number, months: number) => {
    const due = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
    patch({ finalApproval: { amount, rate, months }, paymentDueAt: due.toISOString() });
    celebrate(true);
    addActivity("journey", `🎉 אישור סופי: ${amount.toLocaleString("he-IL")} ₪ · ${rate}% · ${months} חודשים`);
    setFocusedOverride(null);
  }, [patch, celebrate, addActivity]);

  const markVehicleApprovalReflected = React.useCallback(() => {
    const due = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
    patch({ paymentDueAt: due.toISOString() });
    addActivity("journey", "האישור שוקף ללקוח — ממתינים להלוואה");
    setFocusedOverride(null);
  }, [patch, addActivity]);

  const markLoanArrived = React.useCallback(() => {
    patch({ loanArrivedAt: new Date().toISOString() });
    addActivity("journey", "💸 ההלוואה הגיעה לחשבון הלקוח");
  }, [patch, addActivity]);

  const markPaid = React.useCallback(() => {
    patch({ paidAt: new Date().toISOString() });
    celebrate(true);
    addActivity("journey", "💰 שכר הטרחה שולם — העסקה הושלמה!");
  }, [patch, celebrate, addActivity]);

  const markExit = React.useCallback((reason: string) => {
    patch({ exitReason: reason });
    addActivity("journey", `הליד סומן כיציאה: ${reason}`);
  }, [patch, addActivity]);

  const answerVehicle = React.useCallback((has: boolean) => {
    const p: Partial<JourneyState> = { hasVehicle: has ? "yes" : "no" };
    // הגעה דרך הפיבוט = נפסל בסינון (אם אין כבר סיבה אחרת)
    if (has && !latestRef.current.vehicleReason) p.vehicleReason = "screening-failed";
    patch(p);
    addActivity("journey", has ? "🚗 יש רכב — הוסט למסלול רכב" : "אין רכב — הליד לא זכאי");
  }, [patch, addActivity]);

  const addVehicleTrack = React.useCallback((reason: "rejected-general" | "amount-insufficient" | "combo") => {
    const combo = reason !== "rejected-general";
    patch({ vehicleReason: reason, comboVehicle: combo, hasVehicle: "yes" });
    addActivity("journey",
      reason === "rejected-general" ? "🚗 סורב בכל הגופים — עובר למסלול רכב" :
      reason === "amount-insufficient" ? "🚗 הסכום בכל מטרה לא הספיק — נוסף מסלול רכב במקביל" :
      "🚗 הלקוח בחר מסלול משולב — כל מטרה + רכב");
    setFocusedOverride(null);
  }, [patch, addActivity]);

  const setCallback = React.useCallback((whenLabel: string, note: string) => {
    const now = Date.now();
    const when =
      whenLabel.includes("3 שעות") ? new Date(now + 3 * 3600_000) :
      whenLabel.includes("שעה") ? new Date(now + 3600_000) :
      whenLabel.includes("מחר") ? (() => { const d = new Date(now + 24 * 3600_000); d.setHours(10, 0, 0, 0); return d; })() :
      new Date(now + 48 * 3600_000);
    patch({ manualCallbackAt: when.toISOString(), manualCallbackNote: note || undefined });
    addActivity("task", `⏰ נקבעה חזרה ללקוח: ${whenLabel}${note ? ` — ${note}` : ""}`);
    setOverlay(null);
  }, [patch, addActivity]);

  const addNote = React.useCallback((text: string) => {
    if (!text.trim()) return;
    addActivity("note", text.trim());
  }, [addActivity]);

  const resetJourney = React.useCallback(async () => {
    await fetch(`/api/leads/${lead.id}/journey`, { method: "DELETE" });
    window.location.reload();
  }, [lead.id]);

  const snoozePivot = React.useCallback(() => setPivotSnoozed(true), []);
  // a new disqualification signature un-snoozes the pivot
  const dqSignature = `${isDq}-${j.loanPurpose === "רכב"}`;
  const prevSig = React.useRef(dqSignature);
  React.useEffect(() => {
    if (prevSig.current !== dqSignature) {
      prevSig.current = dqSignature;
      setPivotSnoozed(false);
    }
  }, [dqSignature]);

  /* ---------- keyboard registry ---------- */
  const groupsRef = React.useRef<OptionGroupEntry[]>([]);
  const registerOptionGroup = React.useCallback((entry: OptionGroupEntry) => {
    groupsRef.current.push(entry);
    return () => {
      groupsRef.current = groupsRef.current.filter((e) => e !== entry);
    };
  }, []);
  const handleDigit = React.useCallback((n: number): boolean => {
    const target = groupsRef.current.find((g) => !g.isSatisfied()) ?? groupsRef.current[0];
    return target ? target.applyDigit(n) : false;
  }, []);

  return {
    lead, j, patch,
    prefilled: React.useMemo(() => new Set(input.initialPrefilled), [input.initialPrefilled]),
    track, isDisqualified: isDq, askVehicle, deadEnd, current, focused, sections, progress,
    goto, advance, back,
    markContractSent, markSigned, startChecks, finishChecks, chooseLender, setApproval,
    markVehicleApprovalReflected, markLoanArrived, markPaid, markExit, answerVehicle,
    addVehicleTrack, setCallback, addNote, resetJourney,
    saveState, conflictNotice, saveNow, confettiTrigger, celebrate, confettiCount, activities,
    overlay, setOverlay, pivotSnoozed, snoozePivot,
    registerOptionGroup, handleDigit, noteInputRef,
    enterRef, face: input.face ?? "speak",
  };
}

/* helper for smiley labels reused by a couple of components */
export function smileyLabel(s: Smiley): string {
  return s === "green" ? "ירוק" : s === "yellow" ? "צהוב" : s === "red" ? "אדום" : "—";
}
