"use client";
/**
 * ההסכם וערוצי הפנייה — הלוגיקה המשותפת לשלב 6 ולפעולות הכותרת.
 * טפסים: POST/GET/PATCH ‎/api/forms (פולינג 5 שניות כשיש טופס ממתין).
 * וואטסאפ: wa.me עם גוף תבנית מ-/api/templates (נפילה לטקסט ברירת מחדל).
 * מייל: mailto עם נושא וגוף.
 */
import * as React from "react";
import type { ClassicCardState } from "@/components/classic/useClassicCard";
import { normalizePhoneIL, str } from "./shared";

export const GENERAL_TEMPLATE = "הלוואה לכל מטרה – בינגו";
export const VEHICLE_TEMPLATE = "הלוואה כנגד רכב – בינגו";

export interface SentFormDTO {
  id: number;
  templateName: string;
  status: string; // sent | viewed | signed
  sentAt: string;
  signedAt: string | null;
}

export interface AgreementApi {
  forms: SentFormDTO[] | null;
  /** הטופס האחרון של תבנית ההסכם של המסלול הנוכחי */
  agreementForm: SentFormDTO | null;
  signed: boolean;
  sending: boolean;
  templateName: string;
  sendAgreement: () => Promise<void>;
  markSigned: (id: number) => Promise<void>;
  openWhatsApp: () => Promise<void>;
  openEmail: () => void;
  /** ללקוח אין טלפון/מייל — לחיווי בכפתורים */
  hasPhone: boolean;
  hasEmail: boolean;
}

const DEFAULT_WA_TEXT = (firstName: string) =>
  `שלום${firstName ? ` ${firstName}` : ""}, כאן בינגו - מימון בול בשבילך. ` +
  `שלחנו לך הסכם התקשרות דיגיטלי לחתימה. הבדיקה מול גופי המימון אינה כרוכה בעלות ואינה מחייבת, ` +
  `ושכר הטרחה נגבה רק לאחר קבלת ההלוואה בפועל. נשמח שתחתום ונתקדם לבדיקות.`;

export function useAgreement(state: ClassicCardState, vehicleTrack: boolean): AgreementApi {
  const leadId = state.lead.id;
  const templateName = vehicleTrack ? VEHICLE_TEMPLATE : GENERAL_TEMPLATE;
  const [forms, setForms] = React.useState<SentFormDTO[] | null>(null);
  const [sending, setSending] = React.useState(false);

  const refresh = React.useCallback(async () => {
    try {
      const res = await fetch(`/api/forms?leadId=${leadId}`);
      if (!res.ok) return;
      const data = await res.json();
      setForms((data.forms ?? []) as SentFormDTO[]);
    } catch { /* לא חוסם */ }
  }, [leadId]);

  React.useEffect(() => { void refresh(); }, [refresh]);

  /* פולינג כל 5 שניות כל עוד יש טופס שממתין לחתימה */
  const awaiting = !!forms?.some((f) => f.status !== "signed");
  React.useEffect(() => {
    if (!awaiting) return;
    const t = setInterval(() => void refresh(), 5000);
    return () => clearInterval(t);
  }, [awaiting, refresh]);

  const agreementForm = React.useMemo(() => {
    if (!forms) return null;
    const relevant = forms.filter(
      (f) => f.templateName === GENERAL_TEMPLATE || f.templateName === VEHICLE_TEMPLATE,
    );
    return relevant[0] ?? null; // API ממוין sentAt desc
  }, [forms]);

  const signed = agreementForm?.status === "signed";

  const sendAgreement = React.useCallback(async () => {
    if (sending) return;
    setSending(true);
    try {
      const res = await fetch("/api/forms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId, templateName }),
      });
      if (res.ok) await refresh();
    } finally {
      setSending(false);
    }
  }, [leadId, templateName, sending, refresh]);

  const markSigned = React.useCallback(async (id: number) => {
    const res = await fetch("/api/forms", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: "signed" }),
    });
    if (res.ok) await refresh();
  }, [refresh]);

  /* ---------- וואטסאפ ---------- */
  const phone = normalizePhoneIL(state.lead.phone);
  const firstName = str(state.values.firstName) || state.lead.fullName.split(" ")[0] || "";

  const openWhatsApp = React.useCallback(async () => {
    if (!phone) return;
    let body = "";
    try {
      const res = await fetch("/api/templates");
      if (res.ok) {
        const data = await res.json();
        const templates: { name: string; channel: string; body: string | null }[] = data.templates ?? [];
        const wa = templates.filter((t) => t.channel === "whatsapp" && t.body?.trim());
        const match = wa.find((t) => t.name.includes("הסכם")) ?? wa[0];
        if (match?.body) body = match.body;
      }
    } catch { /* נפילה לברירת מחדל */ }
    if (!body) body = DEFAULT_WA_TEXT(firstName);
    // תחליפי שם נפוצים בתבניות
    body = body.replace(/\{\{?\s*(שם|name|1)\s*\}?\}/g, firstName || "");
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(body)}`, "_blank", "noopener");
    state.addNote("whatsapp", "נפתחה הודעת וואטסאפ ללקוח מעמוד השיחה");
  }, [phone, firstName, state]);

  /* ---------- מייל ---------- */
  const email = state.lead.email;
  const openEmail = React.useCallback(() => {
    if (!email) return;
    const subject = "בינגו - הסכם התקשרות לחתימה";
    const body =
      `שלום${firstName ? ` ${firstName}` : ""},\n\n` +
      `בהמשך לשיחתנו, מצורף הסכם ההתקשרות של בינגו לחתימה דיגיטלית.\n` +
      `הבדיקה מול גופי המימון אינה כרוכה בעלות ואינה מחייבת, ושכר הטרחה נגבה רק לאחר קבלת ההלוואה בפועל.\n\n` +
      `בברכה,\nצוות בינגו - מימון בול בשבילך`;
    window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    state.addNote("email", "נפתח מייל ללקוח מעמוד השיחה");
  }, [email, firstName, state]);

  return {
    forms, agreementForm, signed: !!signed, sending, templateName,
    sendAgreement, markSigned, openWhatsApp, openEmail,
    hasPhone: !!phone, hasEmail: !!email,
  };
}
