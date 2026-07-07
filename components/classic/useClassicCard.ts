"use client";
/**
 * useClassicCard — מצב הכרטיס הקלאסי (שכפול Yoatsim).
 * ערכים ב-state, שמירה אוטומטית (debounce) דרך PATCH הקיים:
 * extraJson מלא + מראה לעמודות הקנוניות. "נשמר ☁️" כמו במקור.
 */
import * as React from "react";
import type { ClassicValues } from "@/lib/yoatsim/values";
import { leadPatchFromValues } from "@/lib/yoatsim/values";

export interface ClassicLeadDTO {
  id: number;
  fullName: string;
  phone: string | null;
  email: string | null;
  intakeDate: string;
  source: string | null;
  sourceText: string | null;
  ownerName: string | null;
  cardKind: string; // card | duplicate | test
  parentLeadId: number | null;
  archived: boolean;
}

export interface ClassicActivity {
  id: number;
  type: string;
  text: string;
  createdAt: string;
  userName: string | null;
}

export interface ClassicProcess {
  id: number;
  processKey: string;
  statusKey: string;
  responsible: { id: number; name: string } | null;
}

export interface UserOption { id: number; name: string }

export function useClassicCard(input: {
  lead: ClassicLeadDTO;
  initialValues: ClassicValues;
  initialActivities: ClassicActivity[];
  initialProcesses: ClassicProcess[];
}) {
  const { lead } = input;
  const [values, setValues] = React.useState<ClassicValues>(input.initialValues);
  const [activities, setActivities] = React.useState(input.initialActivities);
  const [processes, setProcesses] = React.useState(input.initialProcesses);
  const [saveState, setSaveState] = React.useState<"saved" | "saving" | "error">("saved");

  const latest = React.useRef(values);
  latest.current = values;
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const doSave = React.useCallback(async () => {
    setSaveState("saving");
    try {
      const res = await fetch(`/api/leads/${lead.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(leadPatchFromValues(latest.current)),
      });
      setSaveState(res.ok ? "saved" : "error");
    } catch {
      setSaveState("error");
    }
  }, [lead.id]);

  const set = React.useCallback((key: string, value: ClassicValues[string]) => {
    setValues((v) => ({ ...v, [key]: value }));
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => void doSave(), 900);
  }, [doSave]);

  // flush on leave
  React.useEffect(() => {
    const flush = () => {
      try {
        void fetch(`/api/leads/${lead.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(leadPatchFromValues(latest.current)),
          keepalive: true,
        });
      } catch { /* best effort */ }
    };
    window.addEventListener("pagehide", flush);
    return () => window.removeEventListener("pagehide", flush);
  }, [lead.id]);

  /* ---------- activities ---------- */
  const addNote = React.useCallback((type: string, text: string) => {
    if (!text.trim()) return;
    const optimistic: ClassicActivity = {
      id: -Date.now(), type, text: text.trim(), createdAt: new Date().toISOString(), userName: null,
    };
    setActivities((a) => [optimistic, ...a]);
    void fetch(`/api/leads/${lead.id}/activities`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, text: text.trim() }),
    });
  }, [lead.id]);

  /* ---------- processes (ריבוי — כמו ב-Yoatsim) ---------- */
  const addProcess = React.useCallback(async (processKey: string) => {
    const res = await fetch(`/api/leads/${lead.id}/processes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ processKey }),
    });
    if (res.ok) {
      const row = await res.json();
      setProcesses((p) => [...p, row]);
    }
  }, [lead.id]);

  const updateProcess = React.useCallback(async (id: number, patch: { statusKey?: string; responsibleId?: number | null }) => {
    setProcesses((p) => p.map((x) => (x.id === id ? { ...x, ...(patch.statusKey ? { statusKey: patch.statusKey } : {}) } : x)));
    const res = await fetch(`/api/leads/${lead.id}/processes`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...patch }),
    });
    if (res.ok) {
      const row = await res.json();
      setProcesses((p) => p.map((x) => (x.id === id ? row : x)));
    }
  }, [lead.id]);

  const removeProcess = React.useCallback(async (id: number) => {
    setProcesses((p) => p.filter((x) => x.id !== id));
    await fetch(`/api/leads/${lead.id}/processes`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
  }, [lead.id]);

  return {
    lead, values, set, saveState,
    activities, addNote,
    processes, addProcess, updateProcess, removeProcess,
  };
}

export type ClassicCardState = ReturnType<typeof useClassicCard>;
